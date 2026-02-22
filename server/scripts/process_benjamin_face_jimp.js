
import { Jimp } from 'jimp';
import path from 'path';

// Configuration
const INPUT_IMAGE = '/Users/user/Code/footstars/client/public/assets/players/benjamin_face.png';
const OUTPUT_IMAGE = '/Users/user/Code/footstars/client/public/assets/players/benjamin_face.png';

async function process() {
    console.log('--- Processing Transparency with Jimp for Benjamin Unt ---');

    try {
        const image = await Jimp.read(INPUT_IMAGE);

        // Iterate through all pixels
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            // alpha is idx + 3

            // If the pixel is very close to white, make it transparent
            // Threshold: R, G, and B all above 235
            if (r > 235 && g > 235 && b > 235) {
                this.bitmap.data[idx + 3] = 0;
            }
        });

        await image.write(OUTPUT_IMAGE);
        console.log(`Successfully processed transparency and saved to ${OUTPUT_IMAGE}`);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

process();
