
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const INPUT_PATH = '/Users/user/Code/footstars/client/public/assets/players/bento_face_v20.png';
const OUTPUT_PATH = '/Users/user/Code/footstars/client/public/assets/players/bento_face_v22.png';

async function removeWhiteBackground() {
    console.log('--- Starting Precise White Removal (Canvas) ---');

    // Read image as base64
    const imageBase64 = fs.readFileSync(INPUT_PATH, { encoding: 'base64' });
    const dataUrl = `data:image/png;base64,${imageBase64}`;

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
        userDataDir: path.join(__dirname, '../../.puppeteer_data')
    });

    const page = await browser.newPage();

    // Use Canvas to remove white
    const result = await page.evaluate(async (imgSrc) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Iterate through pixels and set white to transparent
                // AI generations might not be perfectly #FFFFFF, so we use a threshold
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // If near-white (all channels above 240)
                    if (r > 240 && g > 240 && b > 240) {
                        data[i + 3] = 0; // Alpha
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imgSrc;
        });
    }, dataUrl);

    // Save result
    const base64Data = result.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(OUTPUT_PATH, base64Data, 'base64');

    console.log(`Success! Transparent image saved to: ${OUTPUT_PATH}`);
    await browser.close();
}

removeWhiteBackground().catch(err => {
    console.error('Error during background removal:', err);
    process.exit(1);
});
