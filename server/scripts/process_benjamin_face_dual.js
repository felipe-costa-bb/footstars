
import { Jimp } from 'jimp';
import path from 'path';

// Configuration
const INPUT_IMAGE = '/Users/user/.gemini/antigravity/brain/a78bebea-ba70-4df9-a0a5-380bf428788e/benjamin_face_mertens_green_raw_1770994337103.png';
const OUTPUT_IMAGE = '/Users/user/Code/footstars/client/public/assets/players/benjamin_face.png';

async function process() {
    console.log('--- Processing Dual Transparency (Green + White) with Jimp for Benjamin Unt ---');

    try {
        const image = await Jimp.read(INPUT_IMAGE);

        // Iterate through all pixels
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // 1. Chroma Key removal (Green dominant)
            const isGreen = (g > 100 && g > r + 30 && g > b + 30);

            // 2. White/Off-white removal (Residual aliasing)
            const isWhite = (r > 200 && g > 200 && b > 200);

            if (isGreen || isWhite) {
                this.bitmap.data[idx + 3] = 0;
            }
        });

        await image.write(OUTPUT_IMAGE);
        console.log(`Successfully processed dual transparency and saved to ${OUTPUT_IMAGE}`);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

process();
