/**
 * Date helpers that use the browser's LOCAL timezone.
 *
 * `Date.prototype.toISOString()` converts to UTC, which produces the wrong
 * calendar day for users east of UTC (e.g. India is UTC+5:30, so at 02:00 IST
 * `toISOString()` still reports the previous day). The server stores and filters
 * lessons using the business timezone, so the client must send local dates.
 */

/** Today's date as `YYYY-MM-DD` in local time. */
export function todayLocal(): string {
  return formatLocalDate(new Date());
}

/** Formats a Date as `YYYY-MM-DD` using local date parts. */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Start of the local day as a Date. */
export function startOfLocalDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** End of the local day as a Date. */
export function endOfLocalDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** True when the given date falls on the current local calendar day. */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatLocalDate(d) === todayLocal();
}

/**
 * Converts an ISO timestamp to the business timezone (Asia/Kolkata by default)
 * and returns the calendar day it falls on.
 */
export function businessDate(value: Date | string, timeZone = 'Asia/Kolkata'): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '';
  try {
    // en-CA formats as YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return formatLocalDate(d);
  }
}

/** Human-friendly date, e.g. "20 Oct 2026". */
export function formatDisplayDate(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Time as `HH:MM` in the business timezone. */
export function formatDisplayTime(value: Date | string, timeZone = 'Asia/Kolkata'): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
}
