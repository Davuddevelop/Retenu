const { chromium } = require('playwright');
const path = require('path');

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            deviceScaleFactor: 2, // High resolution (Retina) for landing page
        });
        
        await context.addCookies([{
            name: 'guest_mode',
            value: 'true',
            domain: 'localhost',
            path: '/',
            expires: Date.now() / 1000 + 3600
        }]);

        const page = await context.newPage();
        
        console.log('Navigating to dashboard...');
        await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
        
        // Wait for charts and Framer Motion animations to finish
        await page.waitForTimeout(3000);
        
        const savePath = path.join(__dirname, 'public', 'dashboard obsidian.png');
        console.log('Taking screenshot to', savePath, '...');
        
        await page.screenshot({ path: savePath, fullPage: false });
        
        console.log('Screenshot saved successfully!');
        await browser.close();
    } catch (err) {
        console.error('Error taking screenshot:', err);
        process.exit(1);
    }
})();
