import React from "react";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage/db-storage";
import { MediaUploadBox } from "./MediaUploadBox";
import { MediaCleanupButton } from "./MediaCleanupButton";
import Image from "next/image";
import { HardDrive, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const [assets, storageUsage] = await Promise.all([
    db.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        mimeType: true,
        width: true,
        height: true,
        altText: true,
        caption: true,
        byteSize: true,
        blurDataUrl: true,
        visibility: true,
        status: true,
        ownerType: true,
        createdAt: true,
      },
    }),
    storage.getStorageUsage(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Cleanup Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8D9CD]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
            Database Media Assets
          </h1>
          <p className="text-sm text-[#6B6560] mt-1">
            All images are stored directly in TiDB Serverless and served with immutable CDN caching
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MediaCleanupButton orphanedCount={storageUsage.orphanedAssetsCount} />
        </div>
      </div>

      {/* Storage Indicator Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8D9CD] flex flex-wrap items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center text-[#1F4D3A]">
            <HardDrive className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#6B6560] uppercase">Storage Usage</span>
            <p className="text-lg font-black text-[#1F4D3A]">
              {storageUsage.formattedTotalSize} ({storageUsage.totalAssets} assets / {storageUsage.totalVariants} variants)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="px-3 py-1 rounded-lg bg-[#DCFCE7] text-[#166534]">
            {storageUsage.publicAssetsCount} Public
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#FEF3C7] text-[#92400E]">
            {storageUsage.privateReceiptsCount} Private Receipts
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#FEE2E2] text-[#991B1B]">
            {storageUsage.orphanedAssetsCount} Orphaned
          </span>
        </div>
      </div>

      {/* Upload Box */}
      <MediaUploadBox />

      {/* Media Grid */}
      <div>
        <h2 className="text-lg font-bold text-[#2B2622] mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1F4D3A]" aria-hidden="true" />
          <span>Stored Media Library ({assets.length} assets shown)</span>
        </h2>

        {assets.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E8D9CD]">
            <p className="text-sm text-[#6B6560]">No media assets uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((asset) => {
              const isPrivate = asset.visibility === "PRIVATE";
              const imageUrl = isPrivate
                ? `/api/admin/receipts/${asset.id}?variant=thumb`
                : `/media/${asset.id}/thumb`;

              return (
                <div
                  key={asset.id}
                  className="group relative rounded-2xl bg-white border border-[#E8D9CD] overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square bg-[#FDF6EF] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={asset.altText || "Media asset thumbnail"}
                      fill
                      unoptimized
                      sizes="200px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          isPrivate
                            ? "bg-[#8E281C] text-white"
                            : "bg-[#1F4D3A] text-white"
                        }`}
                      >
                        {asset.visibility}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 text-xs space-y-1 bg-white">
                    <p className="font-mono text-[10px] text-[#6B6560] truncate" title={asset.id}>
                      ID: {asset.id.slice(0, 12)}...
                    </p>
                    <div className="flex items-center justify-between text-[#2B2622] font-semibold">
                      <span>{asset.width} × {asset.height}</span>
                      <span>{(asset.byteSize / 1024).toFixed(0)} KB</span>
                    </div>
                    {asset.altText && (
                      <p className="text-[11px] text-[#6B6560] truncate" title={asset.altText}>
                        Alt: {asset.altText}
                      </p>
                    )}
                    <div className="pt-1 flex items-center justify-between text-[10px] text-[#6B6560]">
                      <span className="capitalize">{asset.ownerType || "general"}</span>
                      <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
