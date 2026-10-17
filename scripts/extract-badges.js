const sharp = require('sharp');
const fs = require('fs');

async function extractCleanBadges() {
  const src = 'C:/Users/Shaham/.gemini/antigravity/brain/a7744701-e796-4429-8f8f-ee6951aa0ebb/.user_uploaded/media_1792102100781_cc913155.png';

  if (!fs.existsSync('public/images/payments')) {
    fs.mkdirSync('public/images/payments', { recursive: true });
  }

  const badges = [
    { name: 'easypaisa', left: 40, top: 101, width: 307, height: 124, rx: 24 },
    { name: 'jazzcash', left: 372, top: 98, width: 279, height: 130, rx: 25 },
    { name: 'bank-transfer', left: 676, top: 98, width: 311, height: 127, rx: 24 }
  ];

  for (const b of badges) {
    const maskSvg = Buffer.from(
      `<svg width="${b.width}" height="${b.height}">
        <rect x="0" y="0" width="${b.width}" height="${b.height}" rx="${b.rx}" ry="${b.rx}" fill="#fff"/>
      </svg>`
    );

    const cropped = await sharp(src)
      .extract({ left: b.left, top: b.top, width: b.width, height: b.height })
      .toBuffer();

    await sharp(cropped)
      .composite([{ input: maskSvg, blend: 'dest-in' }])
      .png()
      .toFile(`public/images/payments/${b.name}.png`);

    await sharp(cropped)
      .composite([{ input: maskSvg, blend: 'dest-in' }])
      .webp({ quality: 95 })
      .toFile(`public/images/payments/${b.name}.webp`);
  }

  console.log('Clean rounded transparent badges generated successfully!');
}

extractCleanBadges().catch(console.error);
