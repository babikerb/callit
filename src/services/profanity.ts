/**
 * Lightweight name moderation. Not exhaustive — blocks common profanity via
 * normalized substring matching. Extend BLOCKED as needed.
 */

const BLOCKED = [
  'fuck',
  'shit',
  'bitch',
  'cunt',
  'dick',
  'cock',
  'pussy',
  'asshole',
  'bastard',
  'nigger',
  'nigga',
  'faggot',
  'retard',
  'slut',
  'whore',
  'rape',
  'nazi',
];

/** Collapse leetspeak / spacing so "f u c k" and "f0ck" still match. */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s._\-]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[^a-z]/g, '');
}

export function isCleanName(name: string): boolean {
  const n = normalize(name);
  return !BLOCKED.some((word) => n.includes(word));
}

export const NAME_MAX = 16;

/** Returns an error string if invalid, or null if the name is OK. */
export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Name is too short';
  if (trimmed.length > NAME_MAX) return `Keep it under ${NAME_MAX} characters`;
  if (!isCleanName(trimmed)) return 'Pick a friendlier name';
  return null;
}
