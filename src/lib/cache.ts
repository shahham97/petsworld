import { revalidateTag, revalidatePath } from "next/cache";

export const CACHE_TAGS = {
  products: "products",
  product: (slug: string) => `product:${slug}`,
  categories: "categories",
  category: (slug: string) => `category:${slug}`,
  blog: "blog",
  post: (slug: string) => `post:${slug}`,
  faqs: "faqs",
  hero: "hero",
  featured: "featured",
  settings: "settings",
  pageSeo: "pageSeo",
  paymentMethods: "paymentMethods",
} as const;

export function invalidateProductsCache(slug?: string) {
  try {
    revalidateTag(CACHE_TAGS.products);
    revalidateTag(CACHE_TAGS.featured);
    revalidatePath("/shop");
    revalidatePath("/");
    if (slug) {
      revalidateTag(CACHE_TAGS.product(slug));
      revalidatePath(`/product/${slug}`);
    }
  } catch (error) {
    console.error("Cache revalidation error:", error);
  }
}

export function invalidateCategoriesCache(slug?: string) {
  try {
    revalidateTag(CACHE_TAGS.categories);
    revalidatePath("/categories");
    revalidatePath("/");
    if (slug) {
      revalidateTag(CACHE_TAGS.category(slug));
      revalidatePath(`/category/${slug}`);
    }
  } catch (error) {
    console.error("Cache revalidation error:", error);
  }
}

export function invalidateBlogCache(slug?: string) {
  try {
    revalidateTag(CACHE_TAGS.blog);
    revalidatePath("/blog");
    revalidatePath("/");
    if (slug) {
      revalidateTag(CACHE_TAGS.post(slug));
      revalidatePath(`/blog/${slug}`);
    }
  } catch (error) {
    console.error("Cache revalidation error:", error);
  }
}

export function invalidateSettingsCache() {
  try {
    revalidateTag(CACHE_TAGS.settings);
    revalidateTag(CACHE_TAGS.hero);
    revalidateTag(CACHE_TAGS.paymentMethods);
    revalidatePath("/");
    revalidatePath("/checkout");
  } catch (error) {
    console.error("Cache revalidation error:", error);
  }
}

export function invalidateFaqsCache() {
  try {
    revalidateTag(CACHE_TAGS.faqs);
    revalidatePath("/");
    revalidatePath("/faq");
  } catch (error) {
    console.error("Cache revalidation error:", error);
  }
}

export function invalidatePageSeoCache(pageKey?: string) {
  try {
    revalidateTag(CACHE_TAGS.pageSeo);
    if (pageKey === "home") revalidatePath("/");
    else if (pageKey) revalidatePath(`/${pageKey}`);
  } catch (error) {
    console.error("Cache revalidation error:", error);
  }
}
