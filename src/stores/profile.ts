import { create } from 'zustand';

import { getProfile, saveProfile, type Profile } from '@/services/identity';

type ProfileState = {
  profile: Profile | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  save: (profile: Profile) => Promise<void>;
};

/** Reactive profile so the tab bar avatar + profile card update everywhere on change. */
export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  hydrated: false,
  hydrate: async () => {
    const profile = await getProfile();
    set({ profile, hydrated: true });
  },
  save: async (profile) => {
    await saveProfile(profile);
    set({ profile });
  },
}));
