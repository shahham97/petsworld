import React from "react";
import { FeaturedSlider } from "@/components/home/FeaturedSlider";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { MediaImage } from "@/components/ui/MediaImage";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  HeartHandshake,
  Star,
  Quote,
} from "lucide-react";

import { getCachedHomepageData } from "@/lib/cached-data";

export const revalidate = 60;

export default async function HomePage() {
  const {
    featured: featuredCards,
    newArrivals: newArrivalCards,
    topCategories,
    reviews: approvedReviews,
    latestPosts,
    faqs,
    settings,
  } = await getCachedHomepageData();

  const trustIcons: Record<string, React.ReactNode> = {
    ShieldCheck: <ShieldCheck className="w-8 h-8 text-[#D98E3F]" aria-hidden="true" />,
    Truck: <Truck className="w-8 h-8 text-[#D98E3F]" aria-hidden="true" />,
    CreditCard: <CreditCard className="w-8 h-8 text-[#D98E3F]" aria-hidden="true" />,
    HeartHandshake: <HeartHandshake className="w-8 h-8 text-[#D98E3F]" aria-hidden="true" />,
  };

  const trustPoints = Array.isArray(settings?.whyPetsWorldPoints)
    ? settings.whyPetsWorldPoints
    : [
        { title: "100% Authentic Products", description: "Sourced directly from authorized brand importers.", icon: "ShieldCheck" },
        { title: "Nationwide Express Delivery", description: "Fast, reliable doorstep shipping across Pakistan.", icon: "Truck" },
        { title: "Flexible Payment Options", description: "Cash on Delivery, Easypaisa, JazzCash & Bank Transfer.", icon: "CreditCard" },
        { title: "Dedicated Pet Support", description: "Direct expert advice available on WhatsApp daily.", icon: "HeartHandshake" },
      ];

  return (
    <div className="flex flex-col bg-[#FFF8F0]">
      <main className="flex-1">
        {/* 1. HERO SECTION */}
        {/* DESKTOP (lg and above): Full-Bleed Edge-to-Edge with 100% Opacity Background & Refined Typography */}
        <section className="hidden lg:flex relative w-full overflow-hidden bg-[#FAF5EE] min-h-[580px] items-center py-14 lg:py-20">
          {/* Full Edge-to-Edge Background Image (100% Opacity) */}
          <div className="absolute inset-0" style={{ position: "absolute" }}>
            <Image
              src="/images/hero-pets.webp"
              alt="Golden retriever puppies and tabby kitten on podium with pet food supplies"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-[center_35%] opacity-100"
            />
            {/* Soft, warm gradient on the left to guarantee optimal contrast for typography while keeping pets/products 100% clear */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FBF7F0]/85 via-[#FBF7F0]/30 to-transparent" />
          </div>

          {/* Centered Content Container */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-16 w-full">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D98E3F]" aria-hidden="true" />
                <span>Pakistan&apos;s Dedicated Online Pet Store</span>
              </div>

              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-[#1F4D3A] tracking-tight leading-tight font-display drop-shadow-xs">
                {settings?.heroHeadline || "Everything They Love. All in One Place."}
              </h1>

              <p className="text-base lg:text-lg text-[#4A433D] leading-relaxed max-w-lg font-medium">
                {settings?.heroSubheadline || "Premium Pet Food • Accessories • Care"}
              </p>

              <div className="flex items-center gap-3 pt-3">
                <Link
                  href={settings?.heroPrimaryCtaLink || "/shop"}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#1F4D3A] hover:bg-[#163B2C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  <span>{settings?.heroPrimaryCtaLabel || "Shop Now"}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <Link
                  href={settings?.heroSecondaryCtaLink || "/categories"}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/95 hover:bg-white text-[#2B2622] font-bold text-sm shadow-xs border border-[#E8D9CD] transition-all hover:scale-105 active:scale-95"
                >
                  <span>{settings?.heroSecondaryCtaLabel || "Browse Categories"}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MOBILE & TABLET (< lg, especially iPhones): Tag pill placed ABOVE hero image, followed by text & buttons */}
        <section className="lg:hidden relative w-full bg-[#FAF5EE] overflow-hidden py-6 px-4 sm:px-6">
          <div className="max-w-xl mx-auto flex flex-col space-y-4">
            {/* 1. Tagline Pill (Above image as requested) */}
            <div className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8D9CD] text-xs font-bold text-[#1F4D3A] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D98E3F]" aria-hidden="true" />
              <span>Pakistan&apos;s Dedicated Online Pet Store</span>
            </div>

            {/* 2. Full uncropped photo of puppies, kitten, podium, and supplies */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-[#E8D9CD]/70">
              <Image
                src="/images/hero-pets.webp"
                alt="Golden retriever puppies and tabby kitten on podium with pet food supplies"
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover object-center"
              />
            </div>

            {/* 3. Headline */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#1F4D3A] tracking-tight leading-snug font-display">
              {settings?.heroHeadline || "Everything They Love. All in One Place."}
            </h1>

            {/* 4. Subheadline */}
            <p className="text-sm sm:text-base text-[#4A433D] font-medium leading-relaxed">
              {settings?.heroSubheadline || "Premium Pet Food • Accessories • Care"}
            </p>

            {/* 5. CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href={settings?.heroPrimaryCtaLink || "/shop"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#1F4D3A] active:bg-[#163B2C] text-white font-bold text-sm shadow-md transition-all active:scale-95 text-center min-h-[44px]"
              >
                <span>{settings?.heroPrimaryCtaLabel || "Shop Now"}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <Link
                href={settings?.heroSecondaryCtaLink || "/categories"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-[#2B2622] font-bold text-sm shadow-xs border border-[#E8D9CD] transition-all active:scale-95 text-center min-h-[44px]"
              >
                <span>{settings?.heroSecondaryCtaLabel || "Browse Categories"}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. FEATURED PRODUCTS SLIDER */}
        {featuredCards.length > 0 && <FeaturedSlider products={featuredCards} />}

        {/* 3. SHOP BY CATEGORY */}
        {topCategories.length > 0 && (
          <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
                Shop by Pet Category
              </h2>
              <p className="mt-2 text-sm text-[#6B6560]">
                Explore nutritional foods, treats, grooming gear, and everyday accessories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {topCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group p-4 sm:p-6 rounded-3xl bg-white border border-[#E8D9CD] hover:border-[#1F4D3A] hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center justify-between"
                >
                  <div
                    className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] overflow-hidden mb-3 sm:mb-4 group-hover:scale-105 transition-transform flex items-center justify-center font-black text-xl sm:text-2xl text-[#1F4D3A]"
                    style={{ position: "relative" }}
                  >
                    {cat.imageAssetId ? (
                      <Image
                        src={`/media/${cat.imageAssetId}/thumb`}
                        alt={cat.name}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    ) : (
                      cat.name.slice(0, 1)
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-[#2B2622] group-hover:text-[#1F4D3A] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#6B6560] mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <span className="mt-4 text-xs font-bold text-[#D98E3F] inline-flex items-center gap-1 group-hover:underline">
                    <span>Explore {cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. WHY PETSWORLD (Trust Points) */}
        <section className="py-16 bg-[#FFF8F0] border-y border-[#E8D9CD]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trustPoints.map((point: any, i: number) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-6 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#FFF8F0] border border-[#E8D9CD] flex items-center justify-center mb-4">
                    {trustIcons[point.icon] || <ShieldCheck className="w-8 h-8 text-[#D98E3F]" />}
                  </div>
                  <h3 className="font-bold text-base text-[#2B2622] mb-1">
                    {point.title}
                  </h3>
                  <p className="text-xs text-[#6B6560] leading-relaxed">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. NEW ARRIVALS */}
        {newArrivalCards.length > 0 && (
          <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
                  New Arrivals
                </h2>
                <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
                  Fresh inventory added to our warehouse catalog
                </p>
              </div>

              <Link
                href="/shop?sort=newest"
                className="text-xs sm:text-sm font-bold text-[#1F4D3A] hover:underline inline-flex items-center gap-1"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivalCards.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* 6. SHOP BY PET (Cat, Dog, Birds) */}
        <section className="py-16 bg-[#FDF6EF] border-y border-[#E8D9CD]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
                Shop by Pet
              </h2>
              <p className="mt-2 text-sm text-[#6B6560]">
                Tailored essentials for every member of your furry or feathered family
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Link
                href="/category/cat"
                className="group p-8 rounded-3xl bg-white border border-[#E8D9CD] hover:border-[#1F4D3A] hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#FFF8F0] border-2 border-[#D98E3F] flex items-center justify-center font-black text-2xl text-[#1F4D3A] mb-4 group-hover:scale-110 transition-transform">
                  🐱
                </div>
                <h3 className="text-xl font-black text-[#2B2622] group-hover:text-[#1F4D3A]">
                  For Cats & Kittens
                </h3>
                <p className="text-xs text-[#6B6560] mt-2">
                  Wet & dry food, litters, scratchers, toys & treats
                </p>
              </Link>

              <Link
                href="/category/dog"
                className="group p-8 rounded-3xl bg-white border border-[#E8D9CD] hover:border-[#1F4D3A] hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#FFF8F0] border-2 border-[#1F4D3A] flex items-center justify-center font-black text-2xl text-[#1F4D3A] mb-4 group-hover:scale-110 transition-transform">
                  🐶
                </div>
                <h3 className="text-xl font-black text-[#2B2622] group-hover:text-[#1F4D3A]">
                  For Dogs & Puppies
                </h3>
                <p className="text-xs text-[#6B6560] mt-2">
                  High-protein kibbles, dental chews, leashes & shampoos
                </p>
              </Link>

              <Link
                href="/category/birds"
                className="group p-8 rounded-3xl bg-white border border-[#E8D9CD] hover:border-[#1F4D3A] hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-full bg-[#FFF8F0] border-2 border-[#D98E3F] flex items-center justify-center font-black text-2xl text-[#1F4D3A] mb-4 group-hover:scale-110 transition-transform">
                  🦜
                </div>
                <h3 className="text-xl font-black text-[#2B2622] group-hover:text-[#1F4D3A]">
                  For Birds
                </h3>
                <p className="text-xs text-[#6B6560] mt-2">
                  Clean seed mixes, calcium blocks, toys & aviary care
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* 7. CUSTOMER REVIEWS */}
        {approvedReviews.length > 0 && (
          <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
                What Pet Parents Say
              </h2>
              <p className="mt-2 text-sm text-[#6B6560]">
                Verified customer reviews from pet lovers across Pakistan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {approvedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-3xl bg-white border border-[#E8D9CD] shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[#D98E3F]">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-[#2B2622] italic leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8D9CD]">
                    <span className="font-bold text-xs text-[#2B2622] block">{rev.name}</span>
                    <span className="text-[11px] text-[#6B6560] truncate block">
                      Purchased {rev.product.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. LATEST FROM THE BLOG */}
        {latestPosts.length > 0 && (
          <section className="py-16 bg-[#FFF8F0] border-t border-[#E8D9CD]/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#2B2622] tracking-tight">
                    Latest Pet Care Guides
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
                    Expert nutrition, grooming, and health tips from the PetsWorld editorial team
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="text-xs sm:text-sm font-bold text-[#1F4D3A] hover:underline inline-flex items-center gap-1"
                >
                  <span>All Articles</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-3xl bg-white border border-[#E8D9CD] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div
                      className="relative aspect-[16/9] w-full bg-[#FFF8F0] overflow-hidden"
                      style={{ position: "relative" }}
                    >
                      {post.coverAssetId ? (
                        <Image
                          src={`/media/${post.coverAssetId}/md`}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#F4DFCB]/60 flex items-center justify-center text-[#1F4D3A] font-bold">
                          PetsWorld Blog
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B6560] mb-2">
                          <span>{post.readingTimeMin} min read</span>
                          <span>•</span>
                          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
                        </div>
                        <h3 className="font-bold text-base text-[#2B2622] group-hover:text-[#1F4D3A] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-[#6B6560] mt-2 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#D98E3F] inline-flex items-center gap-1 pt-2">
                        <span>Read Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 9. GLOBAL FAQS */}
        {faqs.length > 0 && (
          <FaqAccordion
            faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            title="PetsWorld Frequently Asked Questions"
            description="Clear answers regarding deliveries, order tracking, and cash on delivery across Pakistan"
          />
        )}
      </main>
    </div>
  );
}
