const fs = require('fs');
const path = require('path');

// Create a simple SVG for the icon
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#1a1a1a"/>
  <text x="512" y="512" font-family="Press Start 2P" font-size="120" fill="#FF4444" text-anchor="middle" dominant-baseline="middle">FQ</text>
</svg>
`;

// Create a simple SVG for the splash screen
const splashSvg = `
<svg width="1242" height="2436" viewBox="0 0 1242 2436" xmlns="http://www.w3.org/2000/svg">
  <rect width="1242" height="2436" fill="#1a1a1a"/>
  <text x="621" y="1218" font-family="Press Start 2P" font-size="120" fill="#FF4444" text-anchor="middle" dominant-baseline="middle">FIT QUEST</text>
</svg>
`;

// Write the SVG files
fs.writeFileSync(path.join(__dirname, 'icon.svg'), iconSvg);
fs.writeFileSync(path.join(__dirname, 'splash.svg'), splashSvg);

console.log('Placeholder assets generated. You can convert these SVGs to PNGs using an online converter or image editing software.'); 