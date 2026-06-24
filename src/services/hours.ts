/**
 * Pragmatic OpenStreetMap `opening_hours` parsing — enough for the common
 * day-range/time formats (e.g. "Mo-Fr 08:00-18:00; Sa 09:00-17:00; Su off",
 * "24/7"). Unknown/complex rules fall back to null rather than guessing.
 */

const ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']; // Monday-first
const LABEL: Record<string, string> = {
  Mo: 'Mon',
  Tu: 'Tue',
  We: 'Wed',
  Th: 'Thu',
  Fr: 'Fri',
  Sa: 'Sat',
  Su: 'Sun',
};

function jsDayToCode(d: number): string {
  return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d];
}

function to12(t: string): string {
  const [hStr, mStr = '00'] = t.trim().split(':');
  const h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return t;
  const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${mStr} ${ampm}`;
}

function formatTimes(timePart: string): string {
  return timePart
    .split(',')
    .map((span) => {
      const parts = span.split('-').map((s) => s.trim());
      return parts.length === 2 ? `${to12(parts[0])} - ${to12(parts[1])}` : span.trim();
    })
    .join(', ');
}

function codeInPart(part: string, pos: number): boolean {
  for (const tok of part.split(',')) {
    const t = tok.trim();
    if (t.includes('-')) {
      const [a, b] = t.split('-').map((s) => s.trim());
      const ai = ORDER.indexOf(a);
      const bi = ORDER.indexOf(b);
      if (ai < 0 || bi < 0) continue;
      if (ai <= bi ? pos >= ai && pos <= bi : pos >= ai || pos <= bi) return true;
    } else if (ORDER.indexOf(t) === pos) {
      return true;
    }
  }
  return false;
}

/** Hours for a given day code: formatted string, 'Closed', 'Open 24 hours', or null. */
function hoursForCode(oh: string, code: string): string | null {
  if (/24\s*\/\s*7/.test(oh)) return 'Open 24 hours';
  const pos = ORDER.indexOf(code);
  if (pos < 0) return null;

  let result: string | null = null;
  for (const rule of oh.split(';').map((r) => r.trim()).filter(Boolean)) {
    const m = rule.match(/^([A-Za-z]{2}(?:[-,][A-Za-z]{2})*)\s+(.+)$/);
    let daysPart: string;
    let timePart: string;
    if (m) {
      daysPart = m[1];
      timePart = m[2].trim();
    } else if (/^\d{1,2}:\d{2}/.test(rule)) {
      daysPart = 'Mo-Su';
      timePart = rule;
    } else {
      continue;
    }
    if (!codeInPart(daysPart, pos)) continue;
    // Later matching rules override earlier ones (OSM semantics).
    if (/off|closed/i.test(timePart)) result = 'Closed';
    else if (/^\d{1,2}:\d{2}/.test(timePart)) result = formatTimes(timePart);
  }
  return result;
}

/** Today's hours, formatted in 12-hour time. */
export function todaysHours(oh?: string): string | null {
  if (!oh) return null;
  return hoursForCode(oh, jsDayToCode(new Date().getDay()));
}

/** Whether today is the current day (for highlighting in a weekly list). */
export function isToday(dayLabel: string): boolean {
  return LABEL[jsDayToCode(new Date().getDay())] === dayLabel;
}

/** Full week, Monday-first, for a detail view. */
export function weeklyHours(oh?: string): { day: string; hours: string }[] {
  if (!oh) return [];
  return ORDER.map((code) => ({ day: LABEL[code], hours: hoursForCode(oh, code) ?? 'Unknown' }));
}
