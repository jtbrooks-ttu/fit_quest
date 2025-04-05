const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSvgToPng(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Converted ${path.basename(inputPath)} to ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`Error converting ${path.basename(inputPath)}:`, error);
  }
}

async function main() {
  const assetsDir = path.join(__dirname);
  
  // Convert icon.svg to various sizes
  await convertSvgToPng(
    path.join(assetsDir, 'icon.svg'),
    path.join(assetsDir, 'icon.png'),
    1024
  );
  
  await convertSvgToPng(
    path.join(assetsDir, 'icon.svg'),
    path.join(assetsDir, 'adaptive-icon.png'),
    1024
  );
  
  await convertSvgToPng(
    path.join(assetsDir, 'icon.svg'),
    path.join(assetsDir, 'favicon.png'),
    32
  );
  
  // Convert splash screen
  await convertSvgToPng(
    path.join(assetsDir, 'splash.svg'),
    path.join(assetsDir, 'splash.png'),
    1242
  );
  
  console.log('All assets converted successfully!');
}

main().catch(console.error); 