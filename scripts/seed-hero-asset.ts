import fs from "fs";
import path from "path";
import { storage } from "../src/lib/storage/db-storage";
import { db } from "../src/lib/db";
import dotenv from "dotenv";

dotenv.config();

async function seedHeroAsset() {
  console.log("🖼️ Seeding hero image into TiDB MediaAsset database...");
  const heroPath = path.join(__dirname, "../public/images/hero-pets.webp");
  if (!fs.existsSync(heroPath)) {
    console.error("hero-pets.webp not found at", heroPath);
    return;
  }

  const buffer = fs.readFileSync(heroPath);
  const asset = await storage.saveAsset({
    buffer,
    visibility: "PUBLIC",
    ownerType: "hero",
    altText: "Golden retriever dog, tabby cat and cockatiel bird on cream podiums in soft sunlight",
    caption: "Everything They Love. All in One Place.",
  });

  console.log(`✅ Hero asset stored in DB: ID ${asset.id} (${asset.width}x${asset.height}, ${asset.byteSize} bytes)`);

  // Update StoreSettings.heroAssetId
  await db.storeSettings.update({
    where: { id: "default" },
    data: { heroAssetId: asset.id },
  });

  console.log("✅ StoreSettings updated with heroAssetId:", asset.id);
}

seedHeroAsset()
  .catch(console.error)
  .finally(() => db.$disconnect());
