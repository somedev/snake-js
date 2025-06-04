const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
}

// Base icon size (we'll generate the largest size first)
const baseSize = 512;

// Generate base icon
const baseIcon = sharp({
    create: {
        width: baseSize,
        height: baseSize,
        channels: 4,
        background: { r: 76, g: 175, b: 80, alpha: 1 }
    }
})
.composite([{
    input: {
        text: {
            text: '🐍',
            font: 'sans-serif',
            fontSize: baseSize * 0.6,
            rgba: true
        }
    },
    gravity: 'center'
}])
.png();

// Icon sizes to generate
const sizes = [
    72, 96, 128, 144, 152, 167, 180, 192, 384, 512
];

// Generate icons
async function generateIcons() {
    try {
        // Generate regular icons
        for (const size of sizes) {
            await baseIcon
                .resize(size, size)
                .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
            console.log(`Generated icon-${size}x${size}.png`);
        }

        // Generate splash screens
        const splashSizes = [
            { width: 640, height: 1136 },  // iPhone 5/SE
            { width: 750, height: 1334 },  // iPhone 6/7/8
            { width: 1242, height: 2208 }, // iPhone 6+/7+/8+
            { width: 1125, height: 2436 }  // iPhone X/XS
        ];

        for (const size of splashSizes) {
            await sharp({
                create: {
                    width: size.width,
                    height: size.height,
                    channels: 4,
                    background: { r: 26, g: 26, b: 26, alpha: 1 }
                }
            })
            .composite([{
                input: {
                    text: {
                        text: '🐍',
                        font: 'sans-serif',
                        fontSize: Math.min(size.width, size.height) * 0.3,
                        rgba: true
                    }
                },
                gravity: 'center'
            }])
            .png()
            .toFile(path.join(iconsDir, `splash-${size.width}x${size.height}.png`));
            console.log(`Generated splash-${size.width}x${size.height}.png`);
        }

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons(); 