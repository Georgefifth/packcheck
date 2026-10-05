import { firefox } from 'playwright';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';
const output = fileURLToPath(new URL('./gallery/', import.meta.url));
await mkdir(output, {recursive:true});
const browser = await firefox.launch({headless:true});
const page = await browser.newPage({viewport:{width:1920,height:1280}});
try {
  await page.goto('https://georgefifth.github.io/packcheck/', {waitUntil:'networkidle'});
  // A modest page zoom fits the complete workspace into a 3:2 frame.
  await page.evaluate(() => {document.documentElement.style.zoom='0.9';});
  await page.locator('#demo').click();
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({path:join(output,'01-required-paths.png')});
  await page.locator('#choose-0').selectOption('0');
  await page.getByRole('button',{name:'Use this path: report.pdf',exact:true}).click();
  await page.locator('#choose-1').selectOption('1');
  await page.getByRole('button',{name:'Use this path: README.md',exact:true}).click();
  await page.locator('.file-row[data-id="1"] button[aria-label^="Preview:"]').click();
  await page.locator('#previewText').waitFor();
  await page.screenshot({path:join(output,'02-content-preview.png')});
  await page.locator('#closePreview').click();
  await page.locator('#build').click();
  await page.locator('#download').waitFor();
  await page.evaluate(() => window.scrollTo(0,0));
  await page.screenshot({path:join(output,'03-verified-zip.png')});
  console.log('Saved three actual product screenshots, 1920 × 1280 (3:2).');
} finally {await browser.close();}
