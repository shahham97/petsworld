/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

async function extract() {
  const src = "C:/Users/Shaham/.gemini/antigravity/brain/a7744701-e796-4429-8f8f-ee6951aa0ebb/.user_uploaded/media_1792084719972_34c901ad.jpg";
  const publicImages = path.join(__dirname, "../public/images");
  if (!fs.existsSync(publicImages)) {
    fs.mkdirSync(publicImages, { recursive: true });
  }

  // 1. Hero Image (0, 0, 724, 576) -> webp
  await sharp(src)
    .extract({ left: 0, top: 0, width: 724, height: 576 })
    .webp({ quality: 85 })
    .toFile(path.join(publicImages, "hero-pets.webp"));
  console.log("Extracted hero-pets.webp");

  // 2. Favicon (approx 835, 270, 75, 75)
  await sharp(src)
    .extract({ left: 835, top: 268, width: 75, height: 75 })
    .png()
    .toFile(path.join(publicImages, "favicon.png"));
  console.log("Extracted favicon.png");

  // 3. Brand Logo (approx 740, 40, 260, 180)
  await sharp(src)
    .extract({ left: 740, top: 40, width: 260, height: 180 })
    .png()
    .toFile(path.join(publicImages, "petsworld-logo-raw.png"));
  console.log("Extracted petsworld-logo-raw.png");
}

extract().catch(console.error);
