
import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const INPUT_IMAGE = '/Users/user/Code/footstars/client/public/assets/players/benjamin_face.png';
const OUTPUT_IMAGE = '/Users/user/Code/footstars/client/public/assets/players/benjamin_face.png'; // Overwrite
const USER_DATA_DIR = path.join(__dirname, '../../.puppeteer_data');

(async () => {
    console.log('--- Processing Transparency for Benjamin Unt ---');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
        userDataDir: USER_DATA_DIR
    });
    const page = await browser.newPage();

    // Load image
    const buffer = fs.readFileSync(INPUT_IMAGE);
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64}`;

    const resultBase64 = await page.evaluate(async (imgSrc) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Improved white removal: distance from white
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // If it's near white, make it transparent
                    // Threshold: anything where R, G, and B are all > 230
                    if (r > 230 && g > 230 && b > 230) {
                        data[i + 3] = 0;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png').split(',')[1]);
            };
            img.onerror = reject;
            img.src = imgSrc;
        });
    }, dataUri);

    fs.writeFileSync(OUTPUT_IMAGE, Buffer.from(resultBase64, 'base64'));
    console.log('Successfully processed transparency and overwritten benjamin_face.png');

    await browser.close();
})();
