import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  
  // Wait for the toggle button
  await page.waitForSelector('button[aria-label="Toggle Theme"]');
  
  const getThemeState = async () => {
    return await page.evaluate(() => {
      return {
        hasClass: document.documentElement.classList.contains('dark'),
        localStorage: localStorage.getItem('app-theme')
      };
    });
  };

  console.log('Initial:', await getThemeState());

  // Click toggle
  await page.click('button[aria-label="Toggle Theme"]');
  await page.waitForTimeout(500); // wait for transitions
  
  console.log('After 1st click:', await getThemeState());

  // Click toggle again
  await page.click('button[aria-label="Toggle Theme"]');
  await page.waitForTimeout(500);
  
  console.log('After 2nd click:', await getThemeState());

  await browser.close();
})();
