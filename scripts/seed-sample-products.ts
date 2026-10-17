import { db } from "../src/lib/db";
import dotenv from "dotenv";

dotenv.config();

async function seedProducts() {
  console.log("🐾 Seeding sample products into database...");

  const [catFoodCat, dogFoodCat, birdsCat] = await Promise.all([
    db.category.findUnique({ where: { slug: "cat-food" } }),
    db.category.findUnique({ where: { slug: "dog-food" } }),
    db.category.findUnique({ where: { slug: "birds" } }),
  ]);

  const heroAsset = await db.mediaAsset.findFirst({
    where: { ownerType: "hero" },
  });

  const sampleProducts = [
    {
      name: "Royal Canin Kitten Dry Cat Food 2kg",
      slug: "royal-canin-kitten-dry-cat-food-2kg",
      sku: "PW-RC-KIT-2KG",
      brand: "Royal Canin",
      shortDescription: "Tailored nutrition for growing kittens up to 12 months with immune system support and digestive security.",
      description: `<h2>Tailored Nutrition for Kittens Up to 12 Months</h2>
<p>Growth is an essential stage in the kitten's life: it is the time of big changes, discoveries and new encounters. During this key period, the kitten's immune system develops gradually. <strong>Royal Canin Kitten</strong> helps support the 2nd age kitten's natural defences thanks particularly to a patented complex of antioxidants including vitamin E.</p>
<h3>Key Benefits</h3>
<ul>
  <li><strong>Immune System Support:</strong> A patented complex of antioxidants and vitamins to help strengthen natural defenses.</li>
  <li><strong>Digestive Health:</strong> Highly digestible proteins (L.I.P.) and prebiotics for balanced intestinal flora.</li>
  <li><strong>Healthy Growth:</strong> Adapted content of protein, vitamins and minerals including vitamin D and calcium.</li>
</ul>`,
      price: 4800.0,
      salePrice: 4500.0,
      stockQty: 24,
      lowStockThreshold: 5,
      isPublished: true,
      isFeatured: true,
      featuredSort: 1,
      weight: "2 kg",
      dimensions: "25 x 15 x 35 cm",
      ingredients: "Dehydrated poultry protein, rice, vegetable protein isolate, animal fats, maize flour, hydrolysed animal proteins, wheat flour, beet pulp, yeasts, fish oil, minerals, fructo-oligo-saccharides, psyllium husks and seeds, marigold extract.",
      usageInstructions: "Divide recommended daily ration into 2 to 3 meals. Ensure fresh water is always available.",
      hasAllergyNotice: true,
      allergyNoticeText: "Contains poultry derivatives and wheat gluten. Consult your veterinarian if your kitten has known sensitivities.",
      seoTitle: "Royal Canin Kitten 2kg | Royal Canin | PetsWorld",
      seoDescription: "Buy Royal Canin Kitten dry cat food 2kg in Pakistan at PetsWorld. Fast delivery, Cash on Delivery & Easypaisa available nationwide.",
      categoryId: catFoodCat?.id,
      specs: [
        { key: "Life Stage", value: "Kitten (Up to 12 Months)" },
        { key: "Flavour", value: "Poultry & Rice" },
        { key: "Country of Origin", value: "France" },
        { key: "Packaging Type", value: "Resealable Freshness Bag" },
      ],
      faqs: [
        {
          question: "Can I feed this to a kitten under 4 months old?",
          answer: "Yes, Royal Canin Kitten is specifically formulated for kittens aged 4 to 12 months. For kittens under 4 months, Royal Canin Mother & Babycat is recommended.",
        },
        {
          question: "How long will a 2kg bag last?",
          answer: "For a 4-month-old kitten eating approximately 55g per day, a 2kg bag lasts approximately 35 days.",
        },
      ],
    },
    {
      name: "Reflex Plus Adult Cat Food Chicken 1.5kg",
      slug: "reflex-plus-adult-cat-food-chicken-1-5kg",
      sku: "PW-REF-AD-15KG",
      brand: "Reflex Plus",
      shortDescription: "Super premium complete and balanced dry cat food with chicken for all adult breeds.",
      description: `<h2>Super Premium Adult Feline Nutrition</h2>
<p>Reflex Plus Adult Cat Food with Chicken is an exceptionally tasty, complete and balanced cat food designed to meet the nutritional requirements of adult cats of all breeds. Formulated with Xylo-oligosaccharides (XOS) to support gut microflora and digestive health.</p>`,
      price: 2950.0,
      salePrice: null,
      stockQty: 30,
      lowStockThreshold: 5,
      isPublished: true,
      isFeatured: true,
      featuredSort: 2,
      weight: "1.5 kg",
      dimensions: "20 x 10 x 30 cm",
      ingredients: "Chicken proteins (dehydrated), corn, chicken fat, rice, beet pulp, liver flavour, vitamins and minerals, flaxseed, xylo-oligosaccharides, brewer's yeast, salt, yucca schidigera, preservatives and antioxidants.",
      usageInstructions: "Feed 45g to 70g daily according to your cat's ideal body weight.",
      hasAllergyNotice: false,
      seoTitle: "Reflex Plus Adult Cat Food Chicken 1.5kg | PetsWorld",
      seoDescription: "Reflex Plus chicken adult cat food 1.5kg online in Pakistan. Affordable premium nutrition with express delivery.",
      categoryId: catFoodCat?.id,
      specs: [
        { key: "Life Stage", value: "Adult Cat" },
        { key: "Flavour", value: "Chicken" },
        { key: "Target Weight", value: "1.5 kg" },
      ],
      faqs: [],
    },
    {
      name: "Pure Paws Premium Adult Dog Food 3kg",
      slug: "pure-paws-premium-adult-dog-food-3kg",
      sku: "PW-PP-DOG-3KG",
      brand: "Pure Paws",
      shortDescription: "High-protein wholesome dog kibble with real chicken and omega-3 fatty acids for joint and coat health.",
      description: `<h2>Wholesome Nutrition for Active Adult Dogs</h2>
<p>Crafted with premium chicken protein, essential amino acids, and fortified vitamins. <strong>Pure Paws Dog Food</strong> promotes lean muscle maintenance, active energy, and a lustrous shiny coat for dogs living in Pakistani climates.</p>`,
      price: 5200.0,
      salePrice: 4899.0,
      stockQty: 18,
      lowStockThreshold: 4,
      isPublished: true,
      isFeatured: true,
      featuredSort: 3,
      weight: "3 kg",
      dimensions: "30 x 15 x 45 cm",
      ingredients: "Chicken meal, brown rice, whole oats, chicken fat (preserved with mixed tocopherols), dried beet pulp, flaxseed, salmon oil, potassium chloride, choline chloride, glucosamine hydrochloride.",
      usageInstructions: "Serve dry or slightly moistened with warm water.",
      hasAllergyNotice: false,
      seoTitle: "Pure Paws Adult Dog Food 3kg | Pure Paws | PetsWorld",
      seoDescription: "Buy Pure Paws adult dog food 3kg online in Pakistan. High protein, omega fatty acids, Cash on Delivery.",
      categoryId: dogFoodCat?.id,
      specs: [
        { key: "Life Stage", value: "Adult Dog (All Breeds)" },
        { key: "Primary Protein", value: "Chicken" },
        { key: "Coat & Skin", value: "Omega-3 & 6 Enriched" },
      ],
      faqs: [],
    },
    {
      name: "Cockatiel & Parakeet Fortified Seed Blend 1kg",
      slug: "cockatiel-parakeet-fortified-seed-blend-1kg",
      sku: "PW-BIRD-COCK-1KG",
      brand: "AviNutrition",
      shortDescription: "Triple-cleaned nutritious seed mix with canary grass seed, safflower, and dried fruit pellets for birds.",
      description: `<h2>Wholesome Aviary Blend</h2>
<p>A vitamin-fortified seed diet designed specifically for cockatiels, lovebirds, and small parakeets. Packed with natural oils, proteins, and minerals to encourage vibrant plumage and energetic song.</p>`,
      price: 1450.0,
      salePrice: null,
      stockQty: 45,
      lowStockThreshold: 8,
      isPublished: true,
      isFeatured: true,
      featuredSort: 4,
      weight: "1 kg",
      dimensions: "18 x 8 x 25 cm",
      ingredients: "White millet, canary grass seed, oat groats, safflower seed, sunflower seed, red millet, hemp seed, dried papaya, multivitamin pellets.",
      usageInstructions: "Fill seed dish daily. Remove empty hulls and provide clean drinking water.",
      hasAllergyNotice: false,
      seoTitle: "Cockatiel Fortified Seed Blend 1kg | AviNutrition | PetsWorld",
      seoDescription: "Order cockatiel and parakeet seed blend 1kg in Pakistan. Clean, wholesome, and fortified with essential vitamins.",
      categoryId: birdsCat?.id,
      specs: [
        { key: "Bird Type", value: "Cockatiel, Lovebird, Parakeet" },
        { key: "Packaging", value: "1 kg Sealed Pouch" },
      ],
      faqs: [],
    },
  ];

  for (const p of sampleProducts) {
    if (!p.categoryId) continue;

    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      const prod = await db.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          brand: p.brand,
          shortDescription: p.shortDescription,
          description: p.description,
          price: p.price,
          salePrice: p.salePrice,
          stockQty: p.stockQty,
          lowStockThreshold: p.lowStockThreshold,
          isPublished: p.isPublished,
          isFeatured: p.isFeatured,
          featuredSort: p.featuredSort,
          weight: p.weight,
          dimensions: p.dimensions,
          ingredients: p.ingredients,
          usageInstructions: p.usageInstructions,
          hasAllergyNotice: p.hasAllergyNotice,
          allergyNoticeText: p.allergyNoticeText || null,
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
        },
      });

      // Link category
      await db.productCategory.create({
        data: {
          productId: prod.id,
          categoryId: p.categoryId,
          isPrimary: true,
        },
      });

      // Link hero asset as product image if available
      if (heroAsset) {
        await db.productImage.create({
          data: {
            productId: prod.id,
            assetId: heroAsset.id,
            altText: p.name,
            sortOrder: 0,
          },
        });
      }

      // Add specs
      for (let i = 0; i < p.specs.length; i++) {
        await db.productSpec.create({
          data: {
            productId: prod.id,
            key: p.specs[i].key,
            value: p.specs[i].value,
            sortOrder: i,
          },
        });
      }

      // Add faqs
      for (let i = 0; i < p.faqs.length; i++) {
        await db.faq.create({
          data: {
            question: p.faqs[i].question,
            answer: p.faqs[i].answer,
            scopeType: "PRODUCT",
            scopeKey: prod.id,
            sortOrder: i,
            isActive: true,
          },
        });
      }
      console.log(`✅ Seeded product: ${p.name}`);
    }
  }
}

seedProducts()
  .catch(console.error)
  .finally(() => db.$disconnect());
