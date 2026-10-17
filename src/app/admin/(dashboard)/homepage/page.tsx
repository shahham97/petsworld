import React from "react";
import { db } from "@/lib/db";
import { HeroEditorForm } from "./HeroEditorForm";

export const dynamic = "force-dynamic";

export default async function AdminHomepageEditorPage() {
  const settings = await db.storeSettings.findUnique({
    where: { id: "default" },
  });

  return <HeroEditorForm settings={settings} />;
}
