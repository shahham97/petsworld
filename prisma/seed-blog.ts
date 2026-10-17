import { db } from "../src/lib/db";

export async function seedBlogPosts() {
  console.log("Seeding authentic blog posts...");

  // Fetch product IDs to link
  const royalCanin = await db.product.findUnique({ where: { slug: "royal-canin-kitten-dry-cat-food-2kg" } });
  const reflexCat = await db.product.findUnique({ where: { slug: "reflex-plus-adult-cat-food-salmon-1-5kg" } });
  const purePaws = await db.product.findUnique({ where: { slug: "pure-paws-premium-adult-dog-kibble-3kg" } });

  // Post 1: Kitten Nutrition
  const post1 = await db.blogPost.upsert({
    where: { slug: "kitten-nutrition-guide-pakistan" },
    update: {},
    create: {
      title: "Ultimate Guide to Kitten Nutrition in Pakistan: Wet vs. Dry Food",
      slug: "kitten-nutrition-guide-pakistan",
      excerpt: "Learn how to balance high-protein kibble and hydrating wet food for your growing kitten in Pakistan's warm climate.",
      content: `
<h2>Introduction to Kitten Nutritional Needs</h2>
<p>Kittens grow at an astonishing rate during their first twelve months, doubling their birth weight in the first fortnight alone. Because their metabolism is three times faster than an adult cat, they require concentrated energy, high-quality animal proteins, and vital amino acids like taurine and arginine to build strong muscles and eyesight.</p>

<h2>Wet Food vs. Dry Kibble: The Pakistani Climate Factor</h2>
<p>One of the most frequent debates among cat parents in Lahore, Karachi, and Islamabad is whether to feed wet gravy pouches or premium dry kibble. In Pakistan's harsh summers where temperatures regularly exceed 40°C, hydration is a matter of life and death.</p>

<div class="overflow-x-auto">
  <table>
    <thead>
      <tr>
        <th>Factor</th>
        <th>Wet Gravy / Pate</th>
        <th>Dry Kibble</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Moisture Content</strong></td>
        <td>75% - 82% (Excellent for urinary tract health)</td>
        <td>8% - 10% (Requires separate water fountains)</td>
      </tr>
      <tr>
        <td><strong>Caloric Density</strong></td>
        <td>Moderate (Lower risk of rapid obesity)</td>
        <td>High (Great for energetic growing kittens)</td>
      </tr>
      <tr>
        <td><strong>Shelf Life in Heat</strong></td>
        <td>Must discard after 30-45 minutes in room temp</td>
        <td>Stable throughout the day in dry bowl</td>
      </tr>
      <tr>
        <td><strong>Cost Efficiency</strong></td>
        <td>Higher daily cost</td>
        <td>Most economical per gram of protein</td>
      </tr>
    </tbody>
  </table>
</div>

<blockquote>
  <strong>Vet Tip:</strong> A mixed feeding routine—dry kibble available for free-feeding, paired with one wet pouch morning and evening—provides the ideal balance of dental benefits and hydration.
</blockquote>

<h2>Optimal Feeding Schedules by Age</h2>
<p>Follow this chronological routine to prevent digestive upsets and diarrhea:</p>

<h3>Weaning Phase (4 to 8 Weeks)</h3>
<p>Transition gradually from mother's milk or kitten milk replacer (KMR). Mix warm water with kitten kibble into a soft porridge. Feed 4 to 5 small meals daily.</p>

<h3>Rapid Growth Phase (2 to 6 Months)</h3>
<p>Your kitten requires 30% to 35% crude protein and balanced calcium-to-phosphorus ratios. Provide 3 dedicated meals daily or portion-controlled free-feeding.</p>

<h3>Sub-Adult Phase (6 to 12 Months)</h3>
<p>Growth velocity moderates slightly. Transition to twice-daily feeding while monitoring body condition score to prevent early neuter-related weight gain.</p>

<h2>Common Nutrition Mistakes Pet Parents Make in Pakistan</h2>
<ul>
  <li><strong>Feeding raw butcher meat without organ balance:</strong> Causes severe nutritional secondary hyperparathyroidism (calcium deficiency bone bending).</li>
  <li><strong>Offering cow or buffalo milk:</strong> Feline digestive systems lack adequate lactase enzymes, causing severe osmotic diarrhea and dehydration.</li>
  <li><strong>Buying unverified loose grain mixtures:</strong> Prone to aflatoxin fungal poisoning in humid Pakistani monsoons.</li>
</ul>

<h2>Conclusion & Vet Recommendations</h2>
<p>Always inspect nutritional guarantee stamps on packaging (such as AAFCO or FEDIAF profiles). Investing in premium, veterinarian-tested kitten food during the first year sets your pet up for decades of vibrant health.</p>
`,
      authorName: "Dr. Ayesha Malik (DVM)",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTimeMin: 5,
      tags: "Cat Nutrition, Kitten Care, Pakistani Pets",
      seoTitle: "Kitten Nutrition Guide Pakistan: Wet vs Dry Food | PetsWorld",
      seoDescription: "Complete vet guide to kitten nutrition in Pakistan. Compare wet and dry foods, optimal feeding schedules, and hydration tips for hot climates.",
    },
  });

  // Post 2: Summer Hydration for Dogs
  const post2 = await db.blogPost.upsert({
    where: { slug: "dog-summer-hydration-care-pakistan" },
    update: {},
    create: {
      title: "How to Keep Your Dog Cool and Hydrated During Pakistani Summers",
      slug: "dog-summer-hydration-care-pakistan",
      excerpt: "Essential heatstroke prevention, hydration tricks, and paw-care safety measures for pet dogs across Punjab, Sindh, and Islamabad.",
      content: `
<h2>Understanding Heatstroke Risks in Pakistani Summers</h2>
<p>Unlike humans who regulate body temperature by sweating through pores all over the body, canines cool themselves almost entirely through panting and sweat glands on their paw pads. When summer ambient temperatures soar above 38°C with high humidity, panting loses its evaporative efficiency, putting dogs at acute risk of hyperthermia.</p>

<h2>Signs of Canine Dehydration You Must Not Ignore</h2>
<p>Perform the quick <em>skin tent test</em>: gently lift the skin at the back of your dog's neck. In a well-hydrated dog, it snaps back immediately. If it delays or stays tented, your pet is dehydrated.</p>

<div class="overflow-x-auto">
  <table>
    <thead>
      <tr>
        <th>Warning Stage</th>
        <th>Observable Physical Symptoms</th>
        <th>Immediate Action Required</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Mild Heat Stress</strong></td>
        <td>Heavy panting, dry nose, thick saliva</td>
        <td>Move to air conditioning; offer cool (not ice) water</td>
      </tr>
      <tr>
        <td><strong>Moderate Dehydration</strong></td>
        <td>Sunken eyes, lethargy, bright red tongue</td>
        <td>Wet paws and belly with room-temperature tap water</td>
      </tr>
      <tr>
        <td><strong>Severe Heatstroke (Emergency)</strong></td>
        <td>Vomiting, unsteadiness, glazed eyes, collapse</td>
        <td>Rush to veterinary clinic immediately with AC on full</td>
      </tr>
    </tbody>
  </table>
</div>

<blockquote>
  <strong>Critical Warning:</strong> Never submerge an overheated dog in ice water. Extreme temperature shock causes peripheral vasoconstriction, trapping core body heat around internal organs.
</blockquote>

<h2>Best Hydration Practices & Electrolyte Tips</h2>
<p>Keep these hydration protocols active from April through September:</p>
<ul>
  <li>Keep at least two heavy ceramic water bowls in shaded, breezy rooms.</li>
  <li>Freeze low-sodium bone broth into ice cubes for interactive cooling treats.</li>
  <li>Refresh water bowls at least three times a day to avoid bacterial biofilm.</li>
</ul>

<h2>Walking Routines: Avoiding Hot Asphalt Paw Burns</h2>
<p>Place the back of your bare hand firmly against the street asphalt for seven seconds. If it feels painfully hot to your skin, it will blister your dog's paw pads in seconds. Walk your dogs strictly before 7:00 AM or after 8:30 PM in summer.</p>

<h2>Summary Checklist for Dog Parents</h2>
<p>Provide 24/7 access to indoor fans or air conditioning, avoid strenuous fetch sessions during midday, and always carry a portable canine water bottle during outdoor car trips.</p>
`,
      authorName: "PetsWorld Veterinary Editorial",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTimeMin: 4,
      tags: "Dog Care, Summer Health, Hydration, Pet Safety",
      seoTitle: "Dog Summer Care & Heatstroke Prevention in Pakistan | PetsWorld",
      seoDescription: "Vet-approved tips to protect your dog from extreme heat and dehydration in Pakistan. Symptoms of heatstroke, safe walking hours, and hydration tricks.",
    },
  });

  // Scoped FAQs for Post 1
  const existingFaqs1 = await db.faq.count({ where: { scopeType: "BLOG_POST", scopeKey: post1.id } });
  if (existingFaqs1 === 0) {
    await db.faq.createMany({
      data: [
        {
          question: "Can I give cow or buffalo milk to my kitten in Pakistan?",
          answer: "No. Most kittens lack sufficient lactase to break down dairy sugars, resulting in diarrhea, severe bloating, and dehydration. Use mother's milk replacer (KMR) instead.",
          scopeType: "BLOG_POST",
          scopeKey: post1.id,
          sortOrder: 0,
          isActive: true,
        },
        {
          question: "How much water does a kitten need daily in summer?",
          answer: "A kitten needs roughly 50 to 60 ml of fresh water per kilogram of body weight each day. Wet food helps fulfill up to 70% of this requirement naturally.",
          scopeType: "BLOG_POST",
          scopeKey: post1.id,
          sortOrder: 1,
          isActive: true,
        },
      ],
    });
  }

  // Scoped FAQs for Post 2
  const existingFaqs2 = await db.faq.count({ where: { scopeType: "BLOG_POST", scopeKey: post2.id } });
  if (existingFaqs2 === 0) {
    await db.faq.createMany({
      data: [
        {
          question: "At what temperature does road asphalt burn a dog's paws in Pakistan?",
          answer: "When ambient temperatures reach 30°C, direct sunlight can heat road asphalt up to 52°C, which causes second-degree burns to canine paw pads within 60 seconds.",
          scopeType: "BLOG_POST",
          scopeKey: post2.id,
          sortOrder: 0,
          isActive: true,
        },
        {
          question: "Can I give human ORS or electrolyte sachets to my dog?",
          answer: "Human ORS formulations contain high sodium concentrations and sometimes artificial sweeteners like xylitol, which is toxic to dogs. Use canine-specific electrolyte powder or unseasoned chicken broth.",
          scopeType: "BLOG_POST",
          scopeKey: post2.id,
          sortOrder: 1,
          isActive: true,
        },
      ],
    });
  }

  // Link related products
  if (royalCanin) {
    await db.blogRelatedProduct.upsert({
      where: { postId_productId: { postId: post1.id, productId: royalCanin.id } },
      update: {},
      create: { postId: post1.id, productId: royalCanin.id, sortOrder: 0 },
    });
  }
  if (reflexCat) {
    await db.blogRelatedProduct.upsert({
      where: { postId_productId: { postId: post1.id, productId: reflexCat.id } },
      update: {},
      create: { postId: post1.id, productId: reflexCat.id, sortOrder: 1 },
    });
  }
  if (purePaws) {
    await db.blogRelatedProduct.upsert({
      where: { postId_productId: { postId: post2.id, productId: purePaws.id } },
      update: {},
      create: { postId: post2.id, productId: purePaws.id, sortOrder: 0 },
    });
  }

  console.log("Seeded 2 authentic pet care articles with FAQs and product links.");
}

seedBlogPosts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
