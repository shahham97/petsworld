import { db } from "@/lib/db";
import {
  StorageProvider,
  StoredMediaAsset,
  StorageUsageReport,
  MediaVariantName,
  MediaVisibility,
} from "./types";
import { processImageBuffer } from "./pipeline";

export class DbStorageProvider implements StorageProvider {
  /**
   * Save an uploaded image into MediaAsset and its MediaVariants
   */
  async saveAsset(params: {
    buffer: Buffer;
    visibility: MediaVisibility;
    ownerType?: string;
    ownerId?: string;
    altText?: string;
    caption?: string;
    checkoutSessionId?: string;
  }): Promise<StoredMediaAsset> {
    const { buffer, visibility, ownerType, ownerId, altText, caption, checkoutSessionId } = params;

    // Process through sharp pipeline
    const processed = await processImageBuffer(buffer, visibility);

    // Deduplicate PUBLIC assets by SHA-256
    if (visibility === "PUBLIC") {
      const existing = await db.mediaAsset.findFirst({
        where: { sha256: processed.sha256, visibility: "PUBLIC" },
        select: {
          id: true,
          mimeType: true,
          width: true,
          height: true,
          altText: true,
          caption: true,
          byteSize: true,
          sha256: true,
          blurDataUrl: true,
          visibility: true,
          status: true,
          ownerType: true,
          ownerId: true,
          createdAt: true,
        },
      });

      if (existing) {
        // If it was marked ORPHANED, reactivate to ATTACHED
        if (existing.status === "ORPHANED") {
          await db.mediaAsset.update({
            where: { id: existing.id },
            data: { status: "ATTACHED", ownerType, ownerId },
          });
        }
        return existing;
      }
    }

    // Determine initial status: Receipts start as TEMP until checkout completes
    const initialStatus = visibility === "PRIVATE" ? "TEMP" : "ATTACHED";

    // Run in transaction: create MediaAsset and its MediaVariants
    return await db.$transaction(async (tx) => {
      const asset = await tx.mediaAsset.create({
        data: {
          mimeType: processed.mimeType,
          width: processed.width,
          height: processed.height,
          altText: altText || null,
          caption: caption || null,
          byteSize: processed.byteSize,
          sha256: processed.sha256,
          blurDataUrl: processed.blurDataUrl,
          visibility: visibility,
          status: initialStatus,
          ownerType: ownerType || null,
          ownerId: ownerId || null,
          checkoutSessionId: checkoutSessionId || null,
        },
        select: {
          id: true,
          mimeType: true,
          width: true,
          height: true,
          altText: true,
          caption: true,
          byteSize: true,
          sha256: true,
          blurDataUrl: true,
          visibility: true,
          status: true,
          ownerType: true,
          ownerId: true,
          createdAt: true,
        },
      });

      // Insert all variants with their LongBlob data
      for (const variant of processed.variants) {
        await tx.mediaVariant.create({
          data: {
            assetId: asset.id,
            variantName: variant.variantName,
            width: variant.width,
            height: variant.height,
            byteSize: variant.byteSize,
            data: variant.data,
          },
        });
      }

      return asset;
    });
  }

  /**
   * Fetch public image variant. Selects the BLOB data ONLY for this specific request.
   */
  async getVariant(
    assetId: string,
    variantName: MediaVariantName
  ): Promise<{ data: Buffer; mimeType: string; sha256: string } | null> {
    // 1. Verify asset is PUBLIC
    const asset = await db.mediaAsset.findUnique({
      where: { id: assetId },
      select: { visibility: true, mimeType: true, sha256: true },
    });

    if (!asset || asset.visibility !== "PUBLIC") {
      return null;
    }

    // 2. Fetch specific variant blob
    const variant = await db.mediaVariant.findUnique({
      where: {
        assetId_variantName: {
          assetId,
          variantName,
        },
      },
      select: {
        data: true,
      },
    });

    if (!variant) return null;

    return {
      data: Buffer.from(variant.data),
      mimeType: asset.mimeType,
      sha256: asset.sha256,
    };
  }

  /**
   * Fetch private customer receipt. Only accessible to verified admins.
   */
  async getReceipt(
    assetId: string,
    variantName: MediaVariantName = "lg"
  ): Promise<{ data: Buffer; mimeType: string } | null> {
    const asset = await db.mediaAsset.findUnique({
      where: { id: assetId },
      select: { visibility: true, mimeType: true },
    });

    if (!asset || asset.visibility !== "PRIVATE") {
      return null;
    }

    // Fallback from lg to thumb or vice versa if requested variant is missing
    let variant = await db.mediaVariant.findUnique({
      where: {
        assetId_variantName: {
          assetId,
          variantName,
        },
      },
      select: { data: true },
    });

    if (!variant) {
      variant = await db.mediaVariant.findFirst({
        where: { assetId },
        select: { data: true },
      });
    }

    if (!variant) return null;

    return {
      data: Buffer.from(variant.data),
      mimeType: asset.mimeType,
    };
  }

  /**
   * Mark an asset as ORPHANED when its owning product/post is deleted
   */
  async markOrphaned(assetId: string): Promise<void> {
    await db.mediaAsset.update({
      where: { id: assetId },
      data: { status: "ORPHANED" },
    });
  }

  /**
   * Delete orphaned assets and expired temp receipts
   */
  async cleanupOrphaned(olderThanHours = 24): Promise<{ deletedCount: number }> {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    // Find orphaned or expired temp assets
    const unreferenced = await db.mediaAsset.findMany({
      where: {
        OR: [
          { status: "ORPHANED", createdAt: { lt: cutoffDate } },
          { status: "TEMP", visibility: "PRIVATE", createdAt: { lt: cutoffDate } },
        ],
      },
      select: { id: true },
    });

    if (unreferenced.length === 0) {
      return { deletedCount: 0 };
    }

    const idsToDelete = unreferenced.map((a) => a.id);

    // Delete MediaVariants first, then MediaAsset
    await db.mediaVariant.deleteMany({
      where: { assetId: { in: idsToDelete } },
    });

    const result = await db.mediaAsset.deleteMany({
      where: { id: { in: idsToDelete } },
    });

    return { deletedCount: result.count };
  }

  /**
   * Calculate storage usage metrics across assets and variants
   */
  async getStorageUsage(): Promise<StorageUsageReport> {
    const [assetsCount, variantsCount, variantsSize, publicCount, privateCount, orphanedCount] =
      await Promise.all([
        db.mediaAsset.count(),
        db.mediaVariant.count(),
        db.mediaVariant.aggregate({
          _sum: { byteSize: true },
        }),
        db.mediaAsset.count({ where: { visibility: "PUBLIC" } }),
        db.mediaAsset.count({ where: { visibility: "PRIVATE" } }),
        db.mediaAsset.count({ where: { status: "ORPHANED" } }),
      ]);

    const totalSizeBytes = variantsSize._sum.byteSize || 0;
    const mb = (totalSizeBytes / (1024 * 1024)).toFixed(2);

    return {
      totalAssets: assetsCount,
      totalVariants: variantsCount,
      totalSizeBytes,
      formattedTotalSize: `${mb} MB`,
      publicAssetsCount: publicCount,
      privateReceiptsCount: privateCount,
      orphanedAssetsCount: orphanedCount,
    };
  }
}

// Singleton storage provider
export const storage: StorageProvider = new DbStorageProvider();
