const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1200,900'], defaultViewport: {width:1200, height:900}, slowMo: 50 });
  const page = await browser.newPage();

  // Log console messages from the page
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Log all requests (to spot EmailJS requests)
  page.on('request', req => {
    const url = req.url();
    if (url.includes('emailjs') || url.includes('api.emailjs.com')) {
      console.log('EMAILJS REQ:', req.method(), url);
      console.log('  postData:', req.postData ? req.postData().slice(0,200) : '');
    }
  });

  // Open local dev server
  const url = 'http://localhost:8000';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Wait for form
  await page.waitForSelector('#contactForm', { timeout: 5000 });

  // Fill form fields (adjust names if needed)
  await page.type('input[name="name"]', 'Teste Automático');
  await page.type('input[name="email"]', 'teste@example.com');
  // optional fields
  const phoneExists = await page.$('input[name="phone"]');
  if (phoneExists) await page.type('input[name="phone"]', '11999999999');
  const companyExists = await page.$('input[name="company"]');
  if (companyExists) await page.type('input[name="company"]', 'Empresa Teste');
  const subjectExists = await page.$('input[name="subject"]');
  if (subjectExists) await page.type('input[name="subject"]', 'Teste automatizado');
  await page.type('textarea[name="message"]', 'Mensagem de teste enviada automaticamente pelo script de QA.');

  // Submit
  await Promise.all([
    page.click('#contactForm button[type="submit"]'),
  ]);

  // Wait for either toast or inline message
  try {
    await page.waitForSelector('.toast, .form-message.show', { timeout: 8000 });
    console.log('Indicator found: toast or form-message');
  } catch (e) {
    console.log('No toast or inline message detected within timeout.');
  }

  // Give time for network requests
  await page.waitForTimeout(2000);

  // Screenshot result
  const screenshotPath = 'test/result-screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log('Screenshot saved to', screenshotPath);

  // Save page content to debug
  const html = await page.content();
  fs.writeFileSync('test/result-page.html', html);
  console.log('Saved page HTML to test/result-page.html');

  // Wait a little and close
  await page.waitForTimeout(1000);
  await browser.close();
  console.log('Done');
})();
