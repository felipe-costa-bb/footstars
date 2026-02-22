
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const INPUT_PATH = '/Users/user/.gemini/antigravity/brain/8f76545f-f061-4605-9bcc-0f992a4b042e/bento_face_v9_green_1770912202205.png';
const OUTPUT_PATH = path.join(__dirname, '../../client/public/assets/players/bento_face_v9.png');
const USER_DATA_DIR = path.join(__dirname, '../../.puppeteer_data');

// Ensure output directory exists (already done previously but good practice)
if (!fs.existsSync(path.dirname(OUTPUT_PATH))) {
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
}

(async () => {
    console.log('--- Starting Background Removal (Chroma Key) ---');
    console.log('Using userDataDir:', USER_DATA_DIR);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
        userDataDir: USER_DATA_DIR
    });
    const page = await browser.newPage();

    // Load image into page context
    const startBuffer = fs.readFileSync(INPUT_PATH);
    const startBase64 = startBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${startBase64}`;

    console.log('Image loaded. Processing in browser context...');

    // Evaluate in browser
    const resultBase64 = await page.evaluate(async (imgSrc) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Chroma Key Logic (#00FF00)
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Heuristics for "Green Screen" removal
                    // If Green is dominant and significantly brighter than R and B
                    if (g > 100 && g > r + 40 && g > b + 40) {
                        data[i + 3] = 0; // Set Alpha to 0
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                // Return as base64
                const finalDataUri = canvas.toDataURL('image/png');
                resolve(finalDataUri.split(',')[1]);
            };
            img.onerror = (e) => reject(e);
            img.src = imgSrc;
        });
    }, dataUri);

    console.log('Processing complete. Saving file...');

    const buffer = Buffer.from(resultBase64, 'base64');
    fs.writeFileSync(OUTPUT_PATH, buffer);

    console.log(`Saved transparent image to: ${OUTPUT_PATH}`);

    await browser.close();
})();
