import React from "react";
import { db } from "@/lib/db";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
  const products = await db.product.findMany({
    where: { isPublished: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <BlogEditor availableProducts={products} />;
}
