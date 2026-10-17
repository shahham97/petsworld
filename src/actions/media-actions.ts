"use server";

import { getAdminSession } from "@/lib/auth";
import { storage } from "@/lib/storage/db-storage";
import { revalidatePath } from "next/cache";

export async function cleanupOrphanedMediaAction(): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  const session = await getAdminSession();
  if (!session) {
    return { success: false, deletedCount: 0, error: "Unauthorized" };
  }

  try {
    const result = await storage.cleanupOrphaned(0); // clean all currently unreferenced orphaned assets
    revalidatePath("/admin/media");
    revalidatePath("/admin");
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("[CLEANUP_ORPHANED_ERROR]:", error);
    return { success: false, deletedCount: 0, error: "Failed to clean up unreferenced assets." };
  }
}
