import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { BlogShareRow } from "@/components/blog/BlogShareRow";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { FeaturedSlider } from "@/components/home/FeaturedSlider";
import { ProductCardData } from "@/components/ui/ProductCard";
import { extractTocAndInjectIds } from "@/lib/blog-toc";
import { Clock, Calendar, User, Sparkles, BookOpen } from "lucide-react";

export const revalidate = 120;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      canonicalUrl: true,
      coverAssetId: true,
      coverAlt: true,
      status: true,
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    return { title: "Article Not Found | PetsWorld.pk" };
  }

  const siteUrl = process.env.SITE_URL || "https://petsworld.pk";
  const title = post.seoTitle || `${post.title} | PetsWorld Blog`;
  const description = post.seoDescription || post.excerpt;
  const ogImage = post.coverAssetId
    ? `${siteUrl}/media/${post.coverAssetId}/og`
    : `${siteUrl}/images/og-default.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: post.canonicalUrl || `${siteUrl}/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${siteUrl}/blog/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.coverAlt || post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPostTemplate({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await db.blogPost.findUnique({
    where: { slug },
    include: {
      relatedProducts: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const faqs = await db.faq.findMany({
    where: { scopeType: "BLOG_POST", scopeKey: post.id, isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const { contentWithIds, toc } = extractTocAndInjectIds(post.content);

  // Prepare recommended products for the horizontal slider
  let sliderProducts: ProductCardData[] = post.relatedProducts.map(({ product }) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price: product.price.toNumber(),
    salePrice: product.salePrice ? product.salePrice.toNumber() : null,
    stockQty: product.stockQty,
    lowStockThreshold: product.lowStockThreshold,
    imageAssetId: product.images[0]?.assetId,
  }));

  if (sliderProducts.length < 6) {
    const fallbacks = await db.product.findMany({
      where: { isPublished: true, deletedAt: null },
      take: 8,
      orderBy: { isFeatured: "desc" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    const fallbackCards: ProductCardData[] = fallbacks
      .filter((p) => !sliderProducts.some((sp) => sp.id === p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        price: p.price.toNumber(),
        salePrice: p.salePrice ? p.salePrice.toNumber() : null,
        stockQty: p.stockQty,
        lowStockThreshold: p.lowStockThreshold,
        imageAssetId: p.images[0]?.assetId,
      }));

    sliderProducts = [...sliderProducts, ...fallbackCards].slice(0, 8);
  }

  const siteUrl = process.env.SITE_URL || "https://petsworld.pk";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const coverUrl = post.coverAssetId
    ? `${siteUrl}/media/${post.coverAssetId}/lg`
    : `${siteUrl}/images/hero-pets.webp`;

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-PK", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Published";

  // BlogPosting Schema
  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [coverUrl],
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "PetsWorld.pk",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: post.title, href: `/blog/${post.slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />

      <div className="bg-[#FFF8F0]/30 min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Breadcrumbs items={breadcrumbItems} />

          {/* Article Header */}
          <header className="max-w-4xl mx-auto text-center space-y-5">
            {post.tags && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {post.tags.split(",").map((t) => (
                  <Link
                    key={t.trim()}
                    href={`/blog?tag=${encodeURIComponent(t.trim())}`}
                    className="px-3 py-1 rounded-full bg-[#1F4D3A]/10 text-[#1F4D3A] text-xs font-bold hover:bg-[#1F4D3A]/20 transition-colors"
                  >
                    {t.trim()}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2B2622] tracking-tight leading-tight font-display">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed max-w-2xl mx-auto">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#6B6560] pt-2 border-t border-[#E8D9CD]/60">
              <span className="inline-flex items-center gap-1.5 font-bold text-[#2B2622]">
                <User className="w-3.5 h-3.5 text-[#1F4D3A]" />
                {post.authorName}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#D98E3F]" />
                {publishedDate}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#D98E3F]" />
                {post.readingTimeMin} min read
              </span>
            </div>
          </header>

          {/* Hero Photography (LCP with Priority) */}
          {post.coverAssetId && (
            <div className="max-w-4xl mx-auto relative aspect-[16/9] rounded-3xl overflow-hidden border border-[#E8D9CD] shadow-sm bg-[#FFF8F0]">
              <Image
                src={`/media/${post.coverAssetId}/lg`}
                alt={post.coverAlt || post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          )}

          {/* Main Reading Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto items-start pt-6">
            {/* Left Sticky TOC (Desktop 4 cols) */}
            {toc.length > 0 && (
              <aside className="hidden lg:block lg:col-span-4 sticky top-28">
                <TableOfContents items={toc} />
              </aside>
            )}

            {/* Reading Column (Desktop 8 cols or full 12 if no TOC) */}
            <article className={`${toc.length > 0 ? "lg:col-span-8" : "lg:col-span-12"} max-w-[760px] mx-auto w-full space-y-8`}>
              {/* Mobile Collapsible TOC if headings exist */}
              {toc.length > 0 && (
                <div className="block lg:hidden bg-white p-5 rounded-2xl border border-[#E8D9CD]">
                  <TableOfContents items={toc} />
                </div>
              )}

              {/* Formatted Article Body with Rich Prose */}
              <div
                className="blog-content bg-white/50 backdrop-blur-xs p-6 sm:p-8 rounded-3xl border border-[#E8D9CD]/70 shadow-xs"
                dangerouslySetInnerHTML={{ __html: contentWithIds }}
              />

              {/* Social Sharing */}
              <div className="pt-6 border-t border-[#E8D9CD]">
                <BlogShareRow title={post.title} url={postUrl} />
              </div>

              {/* Scoped FAQs */}
              {faqs.length > 0 && (
                <section className="space-y-4 pt-6">
                  <h2 className="text-xl font-black text-[#2B2622] font-display flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D98E3F]" />
                    <span>Frequently Asked Questions</span>
                  </h2>
                  <FaqAccordion faqs={faqs} />
                </section>
              )}
            </article>
          </div>

          {/* Horizontal Product Slider Just Above Footer */}
          {sliderProducts.length > 0 && (
            <div className="pt-14 border-t border-[#E8D9CD]">
              <FeaturedSlider
                products={sliderProducts}
                title="Recommended Pet Supplies"
                subtitle="Veterinarian-approved products referenced in this article"
                badge="Shop Featured Products"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
