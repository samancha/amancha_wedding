import { columnToA1, isRsvpTimestamp, resolveGuestListColumns } from './googleSheets.ts';

export type GuestSnapshotBackfillWrite = {
  responseRow: number;
  guestRow: number;
  firstName: string;
  lastName: string;
  range: string;
  values: string[];
};

export type GuestSnapshotBackfillIssue = {
  reason: string;
  responseRow?: number;
  guestRow?: number;
  firstName?: string;
  lastName?: string;
  detail?: string;
};

export type GuestSnapshotBackfillPlan = {
  writes: GuestSnapshotBackfillWrite[];
  skipped: GuestSnapshotBackfillIssue[];
  unmatched: GuestSnapshotBackfillIssue[];
  conflicts: GuestSnapshotBackfillIssue[];
};

type ResponseSnapshot = {
  responseRow: number;
  timestamp: string;
  firstName: string;
  lastName: string;
  attending: 'yes' | 'no';
  values: string[];
};

function normalize(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function responseFirstName(fullName: unknown, lastName: unknown): string {
  const name = normalize(fullName);
  const last = normalize(lastName);
  if (!last) return name;

  const suffix = ` ${last}`;
  return name.endsWith(suffix) ? name.slice(0, -suffix.length).trim() : name;
}

function compareTimestamps(a: ResponseSnapshot, b: ResponseSnapshot): number {
  return Date.parse(a.timestamp) - Date.parse(b.timestamp);
}

/**
 * Plans historical response-sheet snapshots for guest-list rows without
 * credentials or network calls. This deliberately leaves RSVP Status alone.
 */
export function buildGuestSnapshotBackfill(
  responseRows: readonly (readonly unknown[])[],
  guestListRows: readonly (readonly unknown[])[]
): GuestSnapshotBackfillPlan {
  const plan: GuestSnapshotBackfillPlan = { writes: [], skipped: [], unmatched: [], conflicts: [] };
  if (guestListRows.length === 0) {
    plan.conflicts.push({ reason: 'guest list has no header row' });
    return plan;
  }

  const columns = resolveGuestListColumns(guestListRows[0]);
  const snapshotColumns = [
    columns.rsvpMeal,
    columns.rsvpDietaryRestrictions,
    columns.rsvpRehearsalDinner,
    columns.rsvpBrunch,
    columns.rsvpUpdatedAt,
  ];
  if (
    columns.firstName < 0 ||
    columns.lastName < 0 ||
    snapshotColumns.some((column) => column < 0) ||
    !snapshotColumns.every((column, index) => column === snapshotColumns[0] + index)
  ) {
    plan.conflicts.push({
      reason: 'guest list does not have a contiguous RSVP snapshot block',
      detail: JSON.stringify({
        firstName: columns.firstName,
        lastName: columns.lastName,
        snapshotColumns,
      }),
    });
    return plan;
  }

  const guestsByName = new Map<string, { row: readonly unknown[]; guestRow: number }>();
  const ambiguousGuestNames = new Set<string>();
  guestListRows.slice(1).forEach((row, index) => {
    const firstName = normalize(row[columns.firstName]);
    const lastName = normalize(row[columns.lastName]);
    if (!firstName || !lastName) return;

    const key = `${firstName}|${lastName}`;
    const guestRow = index + 2;
    if (guestsByName.has(key)) {
      plan.conflicts.push({ reason: 'duplicate guest-list name', guestRow, firstName, lastName });
      ambiguousGuestNames.add(key);
      return;
    }
    guestsByName.set(key, { row, guestRow });
  });

  const responsesByName = new Map<string, ResponseSnapshot>();
  responseRows.slice(1).forEach((row, index) => {
    const responseRow = index + 2;
    if (!isRsvpTimestamp(row[0])) return;

    const lastName = normalize(row[2]);
    const firstName = responseFirstName(row[1], row[2]);
    const attending = normalize(row[3]);
    if (!firstName || !lastName || (attending !== 'yes' && attending !== 'no')) {
      plan.skipped.push({
        reason: 'response is missing a usable name or attendance choice',
        responseRow,
        firstName,
        lastName,
      });
      return;
    }

    const snapshot: ResponseSnapshot = {
      responseRow,
      timestamp: row[0],
      firstName,
      lastName,
      attending,
      values:
        attending === 'yes'
          ? [
              String(row[4] || '').trim(),
              String(row[5] || '').trim(),
              String(row[6] || '').trim(),
              String(row[7] || '').trim(),
              row[0],
            ]
          : ['', '', '', '', row[0]],
    };
    const key = `${firstName}|${lastName}`;
    const existing = responsesByName.get(key);
    if (existing) {
      const winner = compareTimestamps(existing, snapshot) < 0 ? snapshot : existing;
      responsesByName.set(key, winner);
      plan.conflicts.push({
        reason: 'multiple responses for guest; latest timestamp selected',
        responseRow,
        firstName,
        lastName,
        detail: `selected response row ${winner.responseRow}`,
      });
      return;
    }
    responsesByName.set(key, snapshot);
  });

  responsesByName.forEach((response, key) => {
    if (ambiguousGuestNames.has(key)) {
      return;
    }

    const guest = guestsByName.get(key);
    if (!guest) {
      plan.unmatched.push({
        reason: 'no exact guest-list match',
        responseRow: response.responseRow,
        firstName: response.firstName,
        lastName: response.lastName,
      });
      return;
    }
    if (String(guest.row[columns.rsvpUpdatedAt] || '').trim()) {
      plan.skipped.push({
        reason: 'guest snapshot already set',
        responseRow: response.responseRow,
        guestRow: guest.guestRow,
        firstName: response.firstName,
        lastName: response.lastName,
      });
      return;
    }

    plan.writes.push({
      responseRow: response.responseRow,
      guestRow: guest.guestRow,
      firstName: response.firstName,
      lastName: response.lastName,
      range: `${columnToA1(snapshotColumns[0])}${guest.guestRow}:${columnToA1(snapshotColumns[4])}${guest.guestRow}`,
      values: response.values,
    });
  });

  return plan;
}
