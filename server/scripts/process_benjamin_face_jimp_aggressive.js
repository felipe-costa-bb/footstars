
import { Jimp } from 'jimp';
import path from 'path';

// Configuration - using the RAW image to avoid accumulating artifacts
const INPUT_IMAGE = '/Users/user/.gemini/antigravity/brain/a78bebea-ba70-4df9-a0a5-380bf428788e/benjamin_face_mertens_raw_1770993586423.png';
const OUTPUT_IMAGE = '/Users/user/Code/footstars/client/public/assets/players/benjamin_face.png';

async function process() {
    console.log('--- Processing Aggressive Transparency with Jimp for Benjamin Unt ---');

    try {
        const image = await Jimp.read(INPUT_IMAGE);

        // Iterate through all pixels
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // If the pixel is near-white, make it transparent
            // Aggressive threshold: anything where R, G, and B are all above 210
            if (r > 210 && g > 210 && b > 210) {
                this.bitmap.data[idx + 3] = 0;
            }
        });

        await image.write(OUTPUT_IMAGE);
        console.log(`Successfully processed aggressive transparency and saved to ${OUTPUT_IMAGE}`);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

process();
