import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

test('RSVP with public visibility is visible to admin', async ({ request }) => {
  test.skip(!process.env.ADMIN_TOKEN, 'ADMIN_TOKEN not set — skipping admin visibility check');
  const name = `Vis Test ${Date.now()}`;
  const email = `vis-${Date.now()}@example.com`;

  const res = await request.post(`${BASE}/api/rsvp`, {
    data: {
      name,
      email,
      attending: 'yes',
      guests: 0,
      visibility: 'public',
      message: 'visibility test',
    },
  });

  expect(res.ok()).toBeTruthy();

  const adminToken = process.env.ADMIN_TOKEN ?? '';
  const adminRes = await request.get(`${BASE}/api/admin/rsvps`, {
    headers: { 'x-admin-token': adminToken },
  });
  if (!adminRes.ok()) {
    const body = await adminRes.text();
    throw new Error(`Admin fetch failed (${adminRes.status}): ${body}`);
  }
  const json = await adminRes.json();
  const found = (json.data || []).find((r: any) => r.name === name && r.email === email);
  expect(found).toBeTruthy();
  expect(found.visibility).toBe('PUBLIC');
});
