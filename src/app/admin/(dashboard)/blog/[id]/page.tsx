import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { BlogEditor } from "@/components/admin/BlogEditor";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;

  const [post, products] = await Promise.all([
    db.blogPost.findUnique({
      where: { id },
      include: {
        relatedProducts: {
          select: { productId: true },
        },
      },
    }),
    db.product.findMany({
      where: { isPublished: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!post) {
    notFound();
  }

  const faqs = await db.faq.findMany({
    where: { scopeType: "BLOG_POST", scopeKey: post.id },
    orderBy: { sortOrder: "asc" },
  });

  const initialData = {
    ...post,
    faqs,
  };

  return <BlogEditor initialData={initialData} availableProducts={products} />;
}
