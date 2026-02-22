
import { Jimp } from 'jimp';
import path from 'path';

// Configuration
const INPUT_IMAGE = '/Users/user/Code/footstars/client/public/assets/players/bento_arsenal.png';
const OUTPUT_IMAGE = '/Users/user/Code/footstars/client/public/assets/players/bento_arsenal.png';

async function process() {
    console.log('--- Processing Crop for Bento (Arsenal) ---');

    try {
        const image = await Jimp.read(INPUT_IMAGE);

        // Autocrop: removes transparent borders
        image.autocrop();

        // Optional: Resize if it's too huge, but usually autocrop is enough.
        // Let's ensure it's not massive, but 256KB is fine.

        await image.write(OUTPUT_IMAGE);
        console.log(`Successfully cropped and saved to ${OUTPUT_IMAGE}`);
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

process();
