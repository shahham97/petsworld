"use client";

import React, { useTransition } from "react";
import { cleanupOrphanedMediaAction } from "@/actions/media-actions";
import { useToast } from "@/components/ui/Toast";
import { Trash2, Loader2 } from "lucide-react";

export function MediaCleanupButton({ orphanedCount }: { orphanedCount: number }) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleCleanup = () => {
    if (orphanedCount === 0) {
      toast.info("No orphaned media assets to clean up.");
      return;
    }

    startTransition(async () => {
      const res = await cleanupOrphanedMediaAction();
      if (res.success) {
        toast.success(`Cleaned up ${res.deletedCount} unreferenced media assets.`);
      } else {
        toast.error(res.error || "Cleanup failed.");
      }
    });
  };

  return (
    <button
      onClick={handleCleanup}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8D9CD] text-xs font-bold text-[#991B1B] hover:bg-[#FEF2F2] hover:border-[#FECACA] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
    >
      {isPending ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          <span>Cleaning up...</span>
        </>
      ) : (
        <>
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Clean Up Orphaned ({orphanedCount})</span>
        </>
      )}
    </button>
  );
}
