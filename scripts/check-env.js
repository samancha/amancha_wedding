/* eslint-disable no-console */

const requiredLocal = ["NEXT_PUBLIC_VERCEL_URL"];
const requiredCI = ["VERCEL_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID"];

const optionalEmail = ["SENDGRID_API_KEY", "SENDGRID_FROM", "SENDGRID_TO", "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "SMTP_TO"];

function check(vars) {
  const missing = vars.filter((v) => !process.env[v]);
  if (missing.length) {
    console.error("Missing environment variables:", missing.join(", "));
    return false;
  }
  return true;
}

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

if (!check(requiredLocal)) {
  console.warn('Local required envs missing. Create .env.local from .env.example.');
}

if (isCI) {
  if (!check(requiredCI)) {
    console.error('CI required envs are missing. See README for required Vercel secrets.');
    process.exit(1);
  }
  // Optional: warn if no email provider defined in CI
  const hasEmail = optionalEmail.some((v) => !!process.env[v]);
  if (!hasEmail) {
    console.warn('No email provider configured in CI. RSVP email notifications will be disabled.');
  }
}

console.log('Env check completed.');
