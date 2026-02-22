
const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const BASE_DIR = '/Users/user/.gemini/antigravity/brain/12e9d4e5-a06f-4386-b2d2-bcdcb9cf1439';
const TARGET_DIR = '/Users/user/Code/footstars/client/public/assets/players';

const files = [
    { input: 'bento_arsenal_green_1771172999666.png', output: 'bento_arsenal.png' },
    { input: 'jakob_alnassr_green_1771173013665.png', output: 'jakob_alnassr.png' },
    { input: 'benjamin_manutd_green_1771173027281.png', output: 'benjamin_manutd.png' }
];

async function processImage(file) {
    const inputPath = path.join(BASE_DIR, file.input);
    const outputPath = path.join(TARGET_DIR, file.output);

    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        return;
    }

    try {

        console.log(`Reading image from ${inputPath}...`);
        const image = await Jimp.read(inputPath);
        console.log(`Image read successfully. Size: ${image.bitmap.width}x${image.bitmap.height}`);

        // 1. Remove Green Screen
        console.log('Removing green screen...');
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];


            // Improved Green Screen Logic
            // The goal is to remove GREEN but keep YELLOW (Al Nassr kit).
            // Green: High G, Low R, Low B.
            // Yellow: High G, High R, Low B.

            // Heuristic:
            // 1. Green must be dominant color.
            // 2. Green must be significantly strictly larger than Red (to exclude Yellow).
            // 3. Green must be larger than Blue.

            if (g > 100 && g > r + 40 && g > b + 20) {
                this.bitmap.data[idx + 3] = 0; // Set Alpha to 0
            }
        });

        // 2. Autocrop (remove transparent borders)
        console.log('Autocropping...');
        image.autocrop();

        // 3. User requested "remove a little bit of the shoulders" / "like FIFA"
        // FIFA cards usually cut off at the chest/shoulders.


        // Apply ZOOM crop to ALL players (FIFA style)
        // Reference shows face filling the card, shoulders cut off.
        console.log(`Applying ZOOM crop for ${file.output}...`);

        // 1. Crop sides to focus on center (keep ~56% width)
        // Target Aspect Ratio ~0.7 to match card.
        // If we keep 80% Height, we need ~56% Width.
        const sideCrop = Math.floor(image.bitmap.width * 0.22);
        image.crop({
            x: sideCrop,
            y: 0,
            w: image.bitmap.width - (sideCrop * 2),
            h: image.bitmap.height
        });

        // 2. Crop bottom to remove lower torso (keep top 80% height)
        // Shows mid-chest up. Increased from V1 (72%) to Zoom Out face.
        const heightToKeep = Math.floor(image.bitmap.height * 0.80);
        image.crop({
            x: 0,
            y: 0,
            w: image.bitmap.width,
            h: heightToKeep
        });

        // 3. Small top crop to clean up headroom (2%)
        const topCrop = Math.floor(image.bitmap.height * 0.02);
        image.crop({
            x: 0,
            y: topCrop,
            w: image.bitmap.width,
            h: image.bitmap.height - topCrop
        });

        console.log(`Writing to ${outputPath}...`);
        await new Promise((resolve, reject) => {
            image.write(outputPath, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log(`Saved to ${outputPath}`);
    } catch (err) {
        console.error(`Error processing ${file.input}:`, err);
    }
}


(async () => {
    console.log('Starting parallel processing...');
    await Promise.all(files.map(processImage));
    console.log('Done processing images.');
    // process.exit(0);
})();
