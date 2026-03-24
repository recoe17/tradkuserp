const sharp = require('sharp');
const path = require('path');

async function generateFavicon() {
  const logoPath = path.join(__dirname, '../public/tradkus-logo.png');
  const appDir = path.join(__dirname, '../src/app');

  const metadata = await sharp(logoPath).metadata();
  const { width, height } = metadata;
  // Crop to top ~55% to get just the TR monogram (avoid text below)
  const cropHeight = Math.floor(height * 0.55);

  const monogram = sharp(logoPath).extract({ left: 0, top: 0, width, height: cropHeight });

  // Create 32x32 favicon (monogram only - scales better at small sizes)
  await monogram.clone().resize(32, 32).png().toFile(path.join(appDir, 'icon.png'));

  // Create apple-icon (180x180 for Apple devices)
  await monogram.clone().resize(180, 180).png().toFile(path.join(appDir, 'apple-icon.png'));

  console.log('Favicon generated: app/icon.png, app/apple-icon.png');
}

generateFavicon().catch(console.error);
