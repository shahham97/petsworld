export type MediaVisibility = "PUBLIC" | "PRIVATE";
export type MediaStatus = "TEMP" | "ATTACHED" | "ORPHANED";
export type MediaVariantName = "thumb" | "md" | "lg" | "og";

export interface ProcessedVariant {
  variantName: MediaVariantName;
  width: number;
  height: number;
  byteSize: number;
  data: Buffer;
}

export interface ProcessedAsset {
  sha256: string;
  mimeType: string;
  width: number;
  height: number;
  byteSize: number;
  blurDataUrl: string;
  variants: ProcessedVariant[];
}

export interface StoredMediaAsset {
  id: string;
  mimeType: string;
  width: number;
  height: number;
  altText: string | null;
  caption: string | null;
  byteSize: number;
  sha256: string;
  blurDataUrl: string | null;
  visibility: MediaVisibility;
  status: MediaStatus;
  ownerType: string | null;
  ownerId: string | null;
  createdAt: Date;
}

export interface StorageUsageReport {
  totalAssets: number;
  totalVariants: number;
  totalSizeBytes: number;
  formattedTotalSize: string;
  publicAssetsCount: number;
  privateReceiptsCount: number;
  orphanedAssetsCount: number;
}

export interface StorageProvider {
  /**
   * Process raw buffer and store MediaAsset and its MediaVariants
   */
  saveAsset(params: {
    buffer: Buffer;
    visibility: MediaVisibility;
    ownerType?: string;
    ownerId?: string;
    altText?: string;
    caption?: string;
    checkoutSessionId?: string;
  }): Promise<StoredMediaAsset>;

  /**
   * Fetch a public image variant's bytes and metadata
   */
  getVariant(
    assetId: string,
    variantName: MediaVariantName
  ): Promise<{ data: Buffer; mimeType: string; sha256: string } | null>;

  /**
   * Fetch a private receipt image (admin only)
   */
  getReceipt(
    assetId: string,
    variantName?: MediaVariantName
  ): Promise<{ data: Buffer; mimeType: string } | null>;

  /**
   * Mark asset as orphaned
   */
  markOrphaned(assetId: string): Promise<void>;

  /**
   * Clean up orphaned and expired temp assets
   */
  cleanupOrphaned(olderThanHours?: number): Promise<{ deletedCount: number }>;

  /**
   * Storage usage report
   */
  getStorageUsage(): Promise<StorageUsageReport>;
}
