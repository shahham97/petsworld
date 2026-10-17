import React from "react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchaseBox } from "@/components/product/ProductPurchaseBox";
import { ProductReviewSection } from "@/components/product/ProductReviewSection";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AlertTriangle, ShieldCheck, Truck, RefreshCw, FileText } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: {
      name: true,
      brand: true,
      weight: true,
      shortDescription: true,
      seoTitle: true,
      seoDescription: true,
      ogAssetId: true,
    },
  });

  if (!product) return {};

  const size = product.weight ? ` ${product.weight}` : "";
  const brand = product.brand ? ` | ${product.brand}` : "";
  const fallbackTitle = `${product.name}${size}${brand} | PetsWorld`.slice(0, 60);
  const fallbackDesc = product.shortDescription
    ? product.shortDescription.slice(0, 155)
    : `Buy ${product.name} in Pakistan at PetsWorld. 100% authentic, fast delivery nationwide.`;

  return {
    title: product.seoTitle || fallbackTitle,
    description: product.seoDescription || fallbackDesc,
    alternates: {
      canonical: `https://petsworld.pk/product/${slug}`,
    },
    openGraph: {
      title: product.seoTitle || fallbackTitle,
      description: product.seoDescription || fallbackDesc,
      images: product.ogAssetId ? [`https://petsworld.pk/media/${product.ogAssetId}/og`] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Query product and all relations from database single source of truth
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      categories: {
        include: { category: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
      },
      specs: {
        orderBy: { sortOrder: "asc" },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || !product.isPublished || product.deletedAt) {
    notFound();
  }

  const primaryCategory =
    product.categories.find((c) => c.isPrimary)?.category ||
    product.categories[0]?.category;

  // Related products from same category
  const relatedProductsRaw = primaryCategory
    ? await db.product.findMany({
        where: {
          isPublished: true,
          deletedAt: null,
          id: { not: product.id },
          categories: { some: { categoryId: primaryCategory.id } },
        },
        take: 4,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      })
    : [];

  const relatedProducts: ProductCardData[] = relatedProductsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    stockQty: p.stockQty,
    lowStockThreshold: p.lowStockThreshold,
    imageAssetId: p.images[0]?.assetId || null,
  }));

  // Scoped product FAQs, falling back to global FAQs
  let faqs = await db.faq.findMany({
    where: { isActive: true, scopeType: "PRODUCT", scopeKey: product.id },
    orderBy: { sortOrder: "asc" },
  });

  if (faqs.length === 0) {
    faqs = await db.faq.findMany({
      where: { isActive: true, scopeType: "GLOBAL" },
      orderBy: { sortOrder: "asc" },
      take: 4,
    });
  }

  const settings = await db.storeSettings.findUnique({ where: { id: "default" } });

  // Breadcrumbs
  const breadcrumbItems = [];
  if (primaryCategory) {
    breadcrumbItems.push({
      label: primaryCategory.name,
      href: `/category/${primaryCategory.slug}`,
    });
  }
  breadcrumbItems.push({ label: product.name });

  // Calculate rating stats for JSON-LD AggregateRating
  const reviewCount = product.reviews.length;
  const avgRating =
    reviewCount > 0
      ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
      : null;

  // Structured JSON-LD Schema
  const productJsonLd: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => `https://petsworld.pk/media/${img.assetId}/lg`),
    description: product.shortDescription || product.name,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand || "PetsWorld",
    },
    offers: {
      "@type": "Offer",
      url: `https://petsworld.pk/product/${product.slug}`,
      priceCurrency: "PKR",
      price: product.salePrice ? Number(product.salePrice) : Number(product.price),
      availability:
        product.stockQty > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  if (avgRating && reviewCount > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviewCount,
    };
  }

  return (
    <div className="flex flex-col bg-[#FFF8F0]">
      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-12">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        {/* SECTION 1, 2, 3: GALLERY, INFO, PRICING & PURCHASE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* 1. Gallery */}
          <ProductGallery
            images={product.images.map((img) => ({
              assetId: img.assetId,
              altText: img.altText,
            }))}
            productName={product.name}
          />

          {/* 2 & 3. Info & Purchase Box */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <span className="text-xs font-bold uppercase tracking-widest text-[#D98E3F] block mb-2">
                  {product.brand}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2B2622] tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mt-3 text-xs text-[#6B6560]">
                <span>SKU: <strong className="font-mono text-[#2B2622]">{product.sku}</strong></span>
                {product.weight && (
                  <>
                    <span>•</span>
                    <span>Weight/Size: <strong className="text-[#2B2622]">{product.weight}</strong></span>
                  </>
                )}
              </div>

              {product.shortDescription && (
                <p className="mt-4 text-sm sm:text-base text-[#6B6560] leading-relaxed">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* 3. Price and Purchase Box */}
            <ProductPurchaseBox
              productId={product.id}
              price={Number(product.price)}
              salePrice={product.salePrice ? Number(product.salePrice) : null}
              stockQty={product.stockQty}
            />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs text-[#6B6560]">
              <div className="p-3 rounded-2xl bg-white border border-[#E8D9CD]">
                <ShieldCheck className="w-5 h-5 text-[#1F4D3A] mx-auto mb-1" />
                <span className="font-bold text-[#2B2622] block">100% Genuine</span>
                <span className="text-[10px]">Verified Origin</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#E8D9CD]">
                <Truck className="w-5 h-5 text-[#1F4D3A] mx-auto mb-1" />
                <span className="font-bold text-[#2B2622] block">Nationwide Delivery</span>
                <span className="text-[10px]">Express Shipping</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#E8D9CD]">
                <RefreshCw className="w-5 h-5 text-[#1F4D3A] mx-auto mb-1" />
                <span className="font-bold text-[#2B2622] block">Cash on Delivery</span>
                <span className="text-[10px]">Pay at Doorstep</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. ALLERGY AND SAFETY NOTICE (Shown prominently ONLY if true AND text present) */}
        {product.hasAllergyNotice && product.allergyNoticeText && (
          <section className="p-6 rounded-3xl bg-[#FFFBEB] border-2 border-[#FDE68A] shadow-sm flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-[#FEF3C7] text-[#D97706] shrink-0 mt-0.5">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-[#92400E]">
                Allergy & Safety Advisory
              </h2>
              <p className="text-xs sm:text-sm text-[#92400E]/90 leading-relaxed font-medium">
                {product.allergyNoticeText}
              </p>
            </div>
          </section>
        )}

        {/* 4. SPECIFICATIONS TABLE */}
        {product.specs.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#2B2622] tracking-tight">
              Product Specifications
            </h2>
            <div className="bg-white rounded-3xl border border-[#E8D9CD] overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-[#E8D9CD]">
                  {product.specs.map((spec, i) => (
                    <tr key={i} className="hover:bg-[#FFF8F0]/30 transition-colors">
                      <th className="py-3.5 px-6 font-bold text-[#6B6560] w-1/3 bg-[#FFF8F0]/50 text-xs uppercase tracking-wider">
                        {spec.key}
                      </th>
                      <td className="py-3.5 px-6 text-[#2B2622] font-semibold text-xs sm:text-sm">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 5. DESCRIPTION AND USAGE INSTRUCTIONS */}
        <section className="space-y-4 pt-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#2B2622] tracking-tight">
            Product Description & Usage
          </h2>
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D9CD] shadow-sm space-y-6">
            <div
              className="prose max-w-none text-sm sm:text-base text-[#2B2622] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {product.ingredients && (
              <div className="pt-6 border-t border-[#E8D9CD] space-y-2">
                <h3 className="font-bold text-sm uppercase text-[#D98E3F]">
                  Ingredients & Dietary Composition
                </h3>
                <div
                  className="text-xs sm:text-sm text-[#6B6560] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.ingredients }}
                />
              </div>
            )}

            {product.usageInstructions && (
              <div className="pt-6 border-t border-[#E8D9CD] space-y-2">
                <h3 className="font-bold text-sm uppercase text-[#D98E3F]">
                  Feeding & Usage Guidelines
                </h3>
                <div
                  className="text-xs sm:text-sm text-[#6B6560] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.usageInstructions }}
                />
              </div>
            )}
          </div>
        </section>

        {/* 7. REVIEWS & RELATED PRODUCTS */}
        <section className="pt-6 border-t border-[#E8D9CD]/70 space-y-12">
          {/* Reviews */}
          <ProductReviewSection
            productId={product.id}
            reviews={product.reviews.map((r) => ({
              id: r.id,
              name: r.name,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.createdAt,
            }))}
          />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6 pt-6">
              <h2 className="text-2xl font-black text-[#2B2622] tracking-tight">
                Related Pet Supplies in {primaryCategory?.name || "Catalog"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 8. PRODUCT FAQ */}
        {faqs.length > 0 && (
          <FaqAccordion
            faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            title={`${product.name} FAQs`}
            description="Frequently asked questions about ingredients, life stage suitability, and care."
          />
        )}
      </main>
    </div>
  );
}
