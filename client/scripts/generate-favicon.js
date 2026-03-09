const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicon() {
  const logoPath = path.join(__dirname, '../public/logo.png');
  const appDir = path.join(__dirname, '../src/app');

  const sizes = [
    { size: 32, name: 'icon.png' },
    { size: 16, name: 'favicon.ico' }, // will save as PNG, Next.js uses icon.png
  ];

  // Create 32x32 icon for Next.js (primary favicon)
  await sharp(logoPath)
    .resize(32, 32)
    .png()
    .toFile(path.join(appDir, 'icon.png'));

  // Create apple-icon (180x180 for Apple devices)
  await sharp(logoPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));

  console.log('Favicon generated: app/icon.png, app/apple-icon.png');
}

generateFavicon().catch(console.error);
