import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { google } from 'googleapis';

const apply = process.argv.slice(2).includes('--apply');
const unknownArgs = process.argv.slice(2).filter((argument) => argument !== '--apply');
if (unknownArgs.length > 0) {
  throw new Error(`Unknown argument(s): ${unknownArgs.join(', ')}. Use --apply or no arguments.`);
}

for (const envFile of ['.env', '.env.local']) {
  if (existsSync(envFile)) process.loadEnvFile(envFile);
}

const requiredEnv = ['GOOGLE_SHEETS_ID', 'GOOGLE_GUEST_LIST_SHEET_ID', 'GOOGLE_SHEETS_CREDENTIALS'];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
}

const { buildGuestSnapshotBackfill } = await import('../src/lib/guestSnapshotBackfill.ts');
const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_SHEETS_CREDENTIALS, 'base64').toString()
);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets('v4');
const responseSheetId = process.env.GOOGLE_SHEETS_ID;
const guestListSheetId = process.env.GOOGLE_GUEST_LIST_SHEET_ID;

const [responseRows, guestListRows] = await Promise.all([
  sheets.spreadsheets.values
    .get({ auth, spreadsheetId: responseSheetId, range: 'Sheet1!A:H' })
    .then((response) => response.data.values || []),
  sheets.spreadsheets.values
    .get({ auth, spreadsheetId: guestListSheetId, range: 'A:Q' })
    .then((response) => response.data.values || []),
]);

const plan = buildGuestSnapshotBackfill(responseRows, guestListRows);
console.log(JSON.stringify(plan, null, 2));
console.log(
  `Totals: ${plan.writes.length} write(s), ${plan.skipped.length} skipped, ${plan.unmatched.length} unmatched, ${plan.conflicts.length} conflict(s).`
);

if (!apply) {
  console.log(
    'Dry run only. Re-run with --apply to create a backup and write the planned snapshots.'
  );
  process.exit(0);
}

if (plan.conflicts.some((issue) => issue.reason.includes('contiguous RSVP snapshot block'))) {
  throw new Error('Guest-list snapshot columns are invalid; no writes were attempted.');
}

const validation = await sheets.spreadsheets.get({
  auth,
  spreadsheetId: guestListSheetId,
  ranges: ['M2:M'],
  includeGridData: true,
  fields: 'sheets(data(rowData(values(dataValidation))))',
});
const mealValidation = validation.data.sheets
  ?.flatMap((sheet) => sheet.data || [])
  .flatMap((data) => data.rowData || [])
  .map((row) => row.values?.[0]?.dataValidation)
  .find(Boolean);
const mealOptions = mealValidation?.condition?.values
  ?.map((value) => value.userEnteredValue || '')
  .filter(Boolean);

if (mealOptions?.length) {
  const optionByNormalizedValue = new Map(
    mealOptions.map((option) => [option.toLowerCase(), option])
  );
  for (const write of plan.writes) {
    if (!write.values[0]) continue;
    const option = optionByNormalizedValue.get(write.values[0].toLowerCase());
    if (!option) {
      throw new Error(
        `Meal ${JSON.stringify(write.values[0])} is not accepted by the guest-list validation: ${mealOptions.join(', ')}`
      );
    }
    write.values[0] = option;
  }
  console.log(`Guest-list meal validation checked: ${mealOptions.join(', ')}.`);
} else {
  console.log(
    `Guest-list meal validation has no ONE_OF_LIST values (${mealValidation?.condition?.type || 'none'}); values remain unchanged.`
  );
}

const backupRows = guestListRows.slice(1).map((row, index) => ({
  row: index + 2,
  firstName: row[0] || '',
  lastName: row[1] || '',
  rsvpStatus: row[3] || '',
  snapshot: row.slice(12, 17),
}));
const backupDirectory = path.resolve('.backups');
const backupPath = path.join(
  backupDirectory,
  `guest-rsvp-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
);
await mkdir(backupDirectory, { recursive: true });
await writeFile(
  backupPath,
  `${JSON.stringify({ createdAt: new Date().toISOString(), rows: backupRows }, null, 2)}\n`,
  'utf8'
);
console.log(`Backup written to ${backupPath}.`);

if (plan.writes.length === 0) {
  console.log('No writes required.');
  process.exit(0);
}

await sheets.spreadsheets.values.batchUpdate({
  auth,
  spreadsheetId: guestListSheetId,
  requestBody: {
    valueInputOption: 'RAW',
    data: plan.writes.map((write) => ({ range: write.range, values: [write.values] })),
  },
});
console.log(`Applied ${plan.writes.length} RSVP snapshot write(s).`);
