/**
 * Phase 3 multiplayer backend — Firestore-backed Calls (no auth; device id).
 *
 * Data model:
 *   calls/{callId}                     { code, category, status, hostId, placeIds? }
 *   calls/{callId}/participants/{id}   { joinedAt, done }
 *   calls/{callId}/votes/{id_placeId}  { deviceId, placeId, vote }
 *   calls/{callId}/tally/{placeId}     { yes }   // aggregate of yes votes
 *
 * Requires Firestore rules to allow access while we run without auth.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from '@react-native-firebase/firestore';
import { randomUUID } from 'expo-crypto';

import { db } from '@/services/firebase';
import type { Profile } from '@/services/identity';
import type { Place } from '@/services/places';

const DEVICE_KEY = 'callit.deviceId';
let cachedDeviceId: string | null = null;

/** Stable per-device identity (no accounts). */
export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  let id = await AsyncStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = randomUUID();
    await AsyncStorage.setItem(DEVICE_KEY, id);
  }
  cachedDeviceId = id;
  return id;
}

function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export type CallStatus = 'lobby' | 'swiping' | 'done';

export type CallFilters = { radiusMiles: number; openNow: boolean };

export type Call = {
  id: string;
  code: string;
  category: string;
  status: CallStatus;
  hostId: string;
  places?: Place[];
  filters?: CallFilters;
  currentIndex?: number;
};

export type Participant = { id: string; name: string; avatarId: string; done: boolean };

/** Create a Call and join it as host. */
export async function createCall(
  category: string,
  profile: Profile,
  filters: CallFilters,
): Promise<{ callId: string; code: string }> {
  const hostId = await getDeviceId();
  const code = genCode();
  const ref = await addDoc(collection(db, 'calls'), {
    code,
    category,
    status: 'lobby',
    hostId,
    filters,
    currentIndex: 0,
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'calls', ref.id, 'participants', hostId), {
    name: profile.name,
    avatarId: profile.avatarId,
    joinedAt: serverTimestamp(),
    done: false,
  });
  return { callId: ref.id, code };
}

/** Join an existing Call by its share code. */
export async function joinCall(code: string, profile: Profile): Promise<string> {
  const snap = await getDocs(query(collection(db, 'calls'), where('code', '==', code.toUpperCase().trim())));
  if (snap.empty) throw new Error('Call not found');
  const callId = snap.docs[0].id;
  const me = await getDeviceId();
  await setDoc(doc(db, 'calls', callId, 'participants', me), {
    name: profile.name,
    avatarId: profile.avatarId,
    joinedAt: serverTimestamp(),
    done: false,
  });
  return callId;
}

export function subscribeCall(callId: string, cb: (call: Call | null) => void) {
  return onSnapshot(doc(db, 'calls', callId), (snap) => {
    const data = snap.data();
    cb(data ? ({ id: snap.id, ...data } as Call) : null);
  });
}

export function subscribeParticipants(callId: string, cb: (people: Participant[]) => void) {
  return onSnapshot(collection(db, 'calls', callId, 'participants'), (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data() ?? {};
        return {
          id: d.id,
          name: (data.name as string) ?? 'Player',
          avatarId: (data.avatarId as string) ?? 'cat',
          done: !!data.done,
        };
      }),
    );
  });
}

/** Firestore rejects undefined values, so drop any undefined fields. */
function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/**
 * Move everyone into swiping immediately (intro plays) before the deck exists,
 * so the host can fetch + AI-enrich places in the background.
 */
export async function beginCall(callId: string) {
  await updateDoc(doc(db, 'calls', callId), { status: 'swiping', currentIndex: 0, places: [] });
}

/** Host writes the shared, enriched deck once it's ready. */
export async function setCallPlaces(callId: string, places: Place[]) {
  const clean = places.map((p) => stripUndefined(p));
  await updateDoc(doc(db, 'calls', callId), { places: clean });
}

/** Cast a swipe on the current card (everyone votes on the same index). */
export async function castSwipe(callId: string, index: number, placeId: string, vote: 'yes' | 'no') {
  const me = await getDeviceId();
  await setDoc(doc(db, 'calls', callId, 'swipes', `${me}_${index}`), {
    deviceId: me,
    index,
    placeId,
    vote,
    at: serverTimestamp(),
  });
  if (vote === 'yes') {
    await setDoc(doc(db, 'calls', callId, 'tally', placeId), { yes: increment(1) }, { merge: true });
  }
}

/** How many people have swiped on a given card index. */
export function subscribeSwipeCount(callId: string, index: number, cb: (count: number) => void) {
  return onSnapshot(query(collection(db, 'calls', callId, 'swipes'), where('index', '==', index)), (snap) => {
    cb(snap.size);
  });
}

/**
 * Advance to the next card only if everyone has swiped the current one.
 * Guarded by a transaction so concurrent callers don't double-advance or skip.
 */
export async function advanceIfReady(callId: string, expectedIndex: number) {
  await runTransaction(db, async (tx) => {
    const ref = doc(db, 'calls', callId);
    const snap = await tx.get(ref);
    const data = snap.data();
    if (!data) return;
    if ((data.currentIndex ?? 0) !== expectedIndex) return; // already advanced
    const next = expectedIndex + 1;
    const total = (data.places as Place[] | undefined)?.length ?? 0;
    tx.update(ref, { currentIndex: next, ...(next >= total ? { status: 'done' } : {}) });
  });
}

/** Live aggregate of yes-votes per placeId. */
export function subscribeTally(callId: string, cb: (tally: Record<string, number>) => void) {
  return onSnapshot(collection(db, 'calls', callId, 'tally'), (snap) => {
    const tally: Record<string, number> = {};
    snap.docs.forEach((d) => {
      tally[d.id] = (d.data()?.yes as number) ?? 0;
    });
    cb(tally);
  });
}

/** Share link for a Call. */
export function callLink(code: string): string {
  return `https://callit.app/c/${code}`;
}
