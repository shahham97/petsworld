export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  cat: "/images/categories/cat.webp",
  dog: "/images/categories/dog.webp",
  "pet-accessories": "/images/categories/pet-accessories.webp",
  birds: "/images/categories/birds.webp",
  "cat-food": "/images/categories/cat-food.webp",
  "cat-accessories": "/images/categories/pet-accessories.webp",
  "dog-food": "/images/categories/dog-food.webp",
  "dog-accessories": "/images/categories/pet-accessories.webp",
};

export function getCategoryImageUrl(slug?: string | null, imageAssetId?: string | null): string {
  if (imageAssetId) {
    return `/media/${imageAssetId}/thumb`;
  }
  if (slug && CATEGORY_FALLBACK_IMAGES[slug]) {
    return CATEGORY_FALLBACK_IMAGES[slug];
  }
  return "/images/categories/pet-accessories.webp";
}
