import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    // capture console
  });
  page.on('console', (msg) => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.toString()));

  // retry connecting to server up to 10s
  const url = 'http://localhost:3000';
  const maxTry = 20;
  for (let i = 0; i < maxTry; i++) {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 2000 });
      break;
    } catch (e) {
      if (i === maxTry - 1) throw e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // find the button
  const btn = await page.getByRole('button', { name: /Toggle theme/i });
  console.log('Found button:', await btn.innerText());
  await btn.click();
  await page.waitForTimeout(500);
  await browser.close();
})();