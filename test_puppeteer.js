
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const projectRoot = path.resolve('.');
const profilesDir = path.join(projectRoot, '.browser-profiles');

if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir, { recursive: true });
}

// Override TMPDIR so Puppeteer creates its temp dir here
process.env.TMPDIR = profilesDir;

(async () => {
    try {
        console.log('Using TMPDIR:', process.env.TMPDIR);
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: CHROME_PATH,
            // No manual userDataDir
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        console.log('Browser launched successfully');
        await browser.close();
        console.log('Browser closed');
    } catch (e) {
        console.error('Launch error:', e);
    }
})();
