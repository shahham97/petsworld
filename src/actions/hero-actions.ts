"use server";

import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { invalidateSettingsCache } from "@/lib/cache";
import { handleServerError } from "@/lib/messages";
import { revalidatePath } from "next/cache";

export async function saveHeroSettingsAction(data: {
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaLink: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaLink: string;
  heroAssetId?: string | null;
  heroMobileAssetId?: string | null;
  whyPetsWorldPoints: any[];
}): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await db.storeSettings.upsert({
      where: { id: "default" },
      update: {
        heroHeadline: data.heroHeadline,
        heroSubheadline: data.heroSubheadline,
        heroPrimaryCtaLabel: data.heroPrimaryCtaLabel,
        heroPrimaryCtaLink: data.heroPrimaryCtaLink,
        heroSecondaryCtaLabel: data.heroSecondaryCtaLabel,
        heroSecondaryCtaLink: data.heroSecondaryCtaLink,
        heroAssetId: data.heroAssetId || null,
        heroMobileAssetId: data.heroMobileAssetId || null,
        whyPetsWorldPoints: data.whyPetsWorldPoints,
      },
      create: {
        id: "default",
        heroHeadline: data.heroHeadline,
        heroSubheadline: data.heroSubheadline,
        heroPrimaryCtaLabel: data.heroPrimaryCtaLabel,
        heroPrimaryCtaLink: data.heroPrimaryCtaLink,
        heroSecondaryCtaLabel: data.heroSecondaryCtaLabel,
        heroSecondaryCtaLink: data.heroSecondaryCtaLink,
        heroAssetId: data.heroAssetId || null,
        heroMobileAssetId: data.heroMobileAssetId || null,
        whyPetsWorldPoints: data.whyPetsWorldPoints,
      },
    });

    invalidateSettingsCache();
    revalidatePath("/admin/homepage");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    const safe = handleServerError(error, "SAVE_HERO_SETTINGS");
    return { success: false, error: safe.error };
  }
}
