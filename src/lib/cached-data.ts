import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache";

/**
 * Default fallback store settings
 */
export const DEFAULT_STORE_SETTINGS = {
  id: "default",
  storeName: "PetsWorld",
  phone: "03001234567",
  whatsAppContact: "923001234567",
  email: "info@petsworld.pk",
  address: "Lahore, Pakistan",
  announcementBarText: "🐾 Free delivery across Pakistan on orders over Rs. 3,000!",
  announcementBarEnabled: true,
  heroHeadline: "Everything They Love. All in One Place.",
  heroSubheadline: "Premium Pet Food • Accessories • Care",
  heroPrimaryCtaLabel: "Shop Now",
  heroPrimaryCtaLink: "/shop",
  heroSecondaryCtaLabel: "Browse Categories",
  heroSecondaryCtaLink: "/categories",
  heroAssetId: null,
  whyPetsWorldPoints: null,
  whatsAppEnabled: true,
  whatsAppNumber: "923001234567",
  whatsAppPrefilledMessage: "Hi PetsWorld! I have a question about pet supplies.",
  whatsAppButtonLabel: "WhatsApp",
  whatsAppButtonSide: "right",
};

function serializeSettings(data: any) {
  if (!data) return DEFAULT_STORE_SETTINGS;
  return {
    ...data,
    shippingFlatFee: data.shippingFlatFee != null ? Number(data.shippingFlatFee) : 200,
    freeShippingThreshold: data.freeShippingThreshold != null ? Number(data.freeShippingThreshold) : 3000,
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : (data.updatedAt || null),
  };
}

/**
 * Cached StoreSettings query with tag-based on-demand invalidation.
 * Eliminates ~450ms network round-trip to TiDB on every request.
 */
export const getCachedStoreSettings = unstable_cache(
  async () => {
    try {
      const data = await db.storeSettings.findUnique({
        where: { id: "default" },
      });
      return serializeSettings(data);
    } catch (err) {
      console.error("Error reading cached store settings, using fallback:", err);
      return DEFAULT_STORE_SETTINGS;
    }
  },
  ["store-settings-global-v3"],
  {
    revalidate: 300,
    tags: [CACHE_TAGS.settings, CACHE_TAGS.hero],
  }
);

/**
 * Cached PageSeo query by pageKey
 */
export const getCachedPageSeo = unstable_cache(
  async (pageKey: string) => {
    try {
      return await db.pageSeo.findUnique({
        where: { pageKey },
      });
    } catch (err) {
      console.error(`Error reading cached SEO for ${pageKey}:`, err);
      return null;
    }
  },
  ["page-seo-by-key"],
  {
    revalidate: 300,
    tags: [CACHE_TAGS.settings],
  }
);

/**
 * Cached Homepage data query executed in a single parallel batch.
 * Revalidated automatically every 3 minutes or immediately when products/settings are mutated.
 */
export const getCachedHomepageData = unstable_cache(
  async () => {
    try {
      const [
        featured,
      newArrivals,
      topCategories,
      reviews,
      faqs,
      latestPosts,
      seo,
      settings,
    ] = await Promise.all([
      db.product.findMany({
        where: { isPublished: true, isFeatured: true, deletedAt: null },
        orderBy: [{ featuredSort: "asc" }, { createdAt: "desc" }],
        take: 10,
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          salePrice: true,
          stockQty: true,
          lowStockThreshold: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { assetId: true, altText: true },
          },
        },
      }),
      db.product.findMany({
        where: { isPublished: true, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          price: true,
          salePrice: true,
          stockQty: true,
          lowStockThreshold: true,
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { assetId: true, altText: true },
          },
        },
      }),
      db.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        take: 8,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageAssetId: true,
          _count: { select: { products: true } },
        },
      }),
      db.review.findMany({
        where: { status: "APPROVED", rating: { gte: 4 } },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          rating: true,
          comment: true,
          createdAt: true,
          product: {
            select: { name: true, slug: true },
          },
        },
      }),
      db.faq.findMany({
        where: { scopeType: "GLOBAL", isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 10,
        select: {
          id: true,
          question: true,
          answer: true,
        },
      }),
      db.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverAssetId: true,
          coverAlt: true,
          publishedAt: true,
          readingTimeMin: true,
        },
      }),
      db.pageSeo.findUnique({
        where: { pageKey: "home" },
        select: {
          seoTitle: true,
          seoDescription: true,
          ogAssetId: true,
        },
      }),
      db.storeSettings.findUnique({
        where: { id: "default" },
        select: {
          announcementBarText: true,
          announcementBarEnabled: true,
          heroHeadline: true,
          heroSubheadline: true,
          heroPrimaryCtaLabel: true,
          heroPrimaryCtaLink: true,
          heroSecondaryCtaLabel: true,
          heroSecondaryCtaLink: true,
          heroAssetId: true,
          whyPetsWorldPoints: true,
        },
      }),
    ]);

    return {
      featured: featured.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        stockQty: p.stockQty,
        lowStockThreshold: p.lowStockThreshold,
        imageAssetId: p.images[0]?.assetId || null,
      })),
      newArrivals: newArrivals.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        stockQty: p.stockQty,
        lowStockThreshold: p.lowStockThreshold,
        imageAssetId: p.images[0]?.assetId || null,
      })),
      topCategories,
      reviews: reviews.map((r) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        product: r.product,
      })),
      faqs,
      latestPosts: latestPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverAssetId: post.coverAssetId,
        coverAlt: post.coverAlt,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        readingTimeMin: post.readingTimeMin,
      })),
      seo,
      settings,
    };
    } catch (err) {
      console.error("Error reading cached homepage data:", err);
      return {
        featured: [],
        newArrivals: [],
        topCategories: [],
        reviews: [],
        faqs: [],
        latestPosts: [],
        seo: null,
        settings: null,
      };
    }
  },
  ["homepage-data-cache"],
  {
    revalidate: 180,
    tags: [
      CACHE_TAGS.products,
      CACHE_TAGS.categories,
      CACHE_TAGS.faqs,
      CACHE_TAGS.settings,
      CACHE_TAGS.hero,
      CACHE_TAGS.blog,
    ],
  }
);

/**
 * Cached Categories Hub data
 */
export const getCachedCategoriesHub = unstable_cache(
  async () => {
    try {
      return await db.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: { _count: { select: { products: true } } },
          },
          _count: { select: { products: true } },
        },
      });
    } catch (err) {
      console.error("Error reading cached categories hub:", err);
      return [];
    }
  },
  ["categories-hub-cache"],
  {
    revalidate: 300,
    tags: [CACHE_TAGS.categories],
  }
);

