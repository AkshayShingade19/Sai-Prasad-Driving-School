/**
 * Business-timezone helpers.
 *
 * Attendance and lessons are scheduled against a *calendar day* in the
 * business timezone (Asia/Kolkata by default), not in UTC. If the server
 * happens to run in a different timezone (common on cloud hosts), filtering
 * "today" with plain `setHours(0,0,0,0)` would silently return the wrong
 * day's lessons. These helpers always resolve the business calendar day.
 */

export const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || 'Asia/Kolkata';

/** Returns the offset (ms) of the business timezone at a given instant. */
function offsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts: Record<string, string> = {};
  dtf.formatToParts(instant).forEach((p) => {
    parts[p.type] = p.value;
  });
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instant.getTime();
}

/**
 * Calendar day in the business timezone, as `YYYY-MM-DD`.
 */
export function businessDateString(input: Date | string = new Date()): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Start and end instants of a business-timezone calendar day.
 */
export function businessDayRange(
  input: Date | string = new Date(),
): { start: Date; end: Date; dateString: string } {
  const dateString = businessDateString(input);
  const [y, m, d] = dateString.split('-').map(Number);

  // Local midnight expressed as a UTC timestamp, then shifted by the zone offset
  const naive = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const offset = offsetMs(naive, BUSINESS_TIMEZONE);
  const start = new Date(naive.getTime() - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

  return { start, end, dateString };
}

/**
 * Parses a `YYYY-MM-DD` string into the business-day range.
 */
export function businessDayFromString(dateString: string) {
  const [y, m, d] = dateString.split('-').map(Number);
  const naive = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
  const offset = offsetMs(naive, BUSINESS_TIMEZONE);
  const start = new Date(naive.getTime() - offset);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end, dateString };
}
