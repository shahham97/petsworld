import { PrismaClient, PaymentMethodCode, FaqScopeType } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting idempotent database seed for PetsWorld.pk...");

  // 1. Admin User
  const adminEmail = process.env.ADMIN_SEED_EMAIL || "admin@petsworld.pk";
  const adminRawPassword = process.env.ADMIN_SEED_PASSWORD || "Admin@123";
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminRawPassword, 12);
    await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "PetsWorld Administrator",
      },
    });
    console.log(`✅ Admin user seeded: ${adminEmail}`);
  } else {
    console.log(`ℹ️ Admin user already exists (${adminEmail}) - skipping update to preserve edits.`);
  }

  // 2. Categories Hierarchy (Cat, Dog, Pet Accessories, Birds)
  const rootCategories = [
    {
      name: "Cat",
      slug: "cat",
      description: "Nutritious food, delicious treats, durable toys and grooming accessories for cats and kittens.",
      sortOrder: 1,
      seoTitle: "Cat Food, Accessories & Care in Pakistan | PetsWorld",
      seoDescription: "Shop premium cat food, litter, treats and accessories online in Pakistan. Cash on Delivery nationwide.",
      children: [
        {
          name: "Cat Food",
          slug: "cat-food",
          description: "Wet and dry food, kitten formulas and dietary nutrition for cats.",
          sortOrder: 1,
          seoTitle: "Cat Food Online in Pakistan | Wet & Dry Food | PetsWorld",
          seoDescription: "Buy top quality cat food brands in Pakistan with cash on delivery and fast shipping.",
        },
        {
          name: "Cat Accessories",
          slug: "cat-accessories",
          description: "Litter boxes, scratching posts, collars, carriers and toys for cats.",
          sortOrder: 2,
          seoTitle: "Cat Accessories & Toys in Pakistan | PetsWorld",
          seoDescription: "Explore cat accessories, scratchers, beds, and grooming supplies in Pakistan.",
        },
      ],
    },
    {
      name: "Dog",
      slug: "dog",
      description: "Wholesome food, dental chews, sturdy leashes and care essentials for dogs and puppies.",
      sortOrder: 2,
      seoTitle: "Dog Food, Chews & Supplies in Pakistan | PetsWorld",
      seoDescription: "Shop high quality dog food, toys, grooming products, and leashes in Pakistan.",
      children: [
        {
          name: "Dog Food",
          slug: "dog-food",
          description: "Dry kibble, wet canned food, and puppy growth formulas.",
          sortOrder: 1,
          seoTitle: "Dog Food Online in Pakistan | Puppy & Adult Food | PetsWorld",
          seoDescription: "Order premium dog food brands with home delivery across Pakistan.",
        },
        {
          name: "Dog Accessories",
          slug: "dog-accessories",
          description: "Collars, harnesses, leashes, beds and durable chew toys.",
          sortOrder: 2,
          seoTitle: "Dog Accessories, Collars & Leashes in Pakistan | PetsWorld",
          seoDescription: "Premium dog accessories, harnesses and training supplies in Pakistan.",
        },
      ],
    },
    {
      name: "Pet Accessories",
      slug: "pet-accessories",
      description: "General grooming supplies, bowls, feeders, hygiene care, and travel gear for all pets.",
      sortOrder: 3,
      seoTitle: "Pet Accessories & Care Essentials in Pakistan | PetsWorld",
      seoDescription: "Bowls, feeders, shampoos, brushes and grooming tools for happy pets.",
      children: [],
    },
    {
      name: "Birds",
      slug: "birds",
      description: "Healthy seed mixes, fortified treats, cages and bird care accessories.",
      sortOrder: 4,
      seoTitle: "Bird Food & Supplies in Pakistan | PetsWorld",
      seoDescription: "Wholesome bird seed, nutrition, treats, and cages for pet birds in Pakistan.",
      children: [],
    },
  ];

  for (const cat of rootCategories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {}, // Never overwrite admin changes
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: true,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
      },
    });

    for (const child of cat.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {},
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
          description: child.description,
          sortOrder: child.sortOrder,
          isActive: true,
          seoTitle: child.seoTitle,
          seoDescription: child.seoDescription,
        },
      });
    }
  }
  console.log("✅ Categories seeded.");

  // 3. Payment Methods (COD, Easypaisa, JazzCash, Bank Transfer)
  const defaultWalletFields = [
    {
      key: "transactionId",
      label: "Transaction ID / TID",
      helpText: "Enter the 6 to 30 character Transaction ID received in the confirmation SMS or app receipt.",
      required: true,
      enabled: true,
      pattern: "^[A-Za-z0-9]{6,30}$",
      type: "text",
    },
    {
      key: "senderMobile",
      label: "Sender Mobile Number",
      helpText: "Pakistani mobile number used to send the payment (e.g. 03001234567).",
      required: true,
      enabled: true,
      pattern: "^(03|\\+923|923)[0-9]{9}$",
      type: "tel",
    },
    {
      key: "senderName",
      label: "Sender Account Name",
      helpText: "Full title/name as registered on your mobile wallet account.",
      required: true,
      enabled: true,
      pattern: "^[a-zA-Z\\s.]{2,60}$",
      type: "text",
    },
    {
      key: "amountPaid",
      label: "Amount Paid (PKR)",
      helpText: "Must match your order total exactly.",
      required: true,
      enabled: true,
      pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
      type: "number",
    },
    {
      key: "paymentDateTime",
      label: "Payment Date & Time",
      helpText: "Timestamp from your wallet transfer receipt.",
      required: true,
      enabled: true,
      pattern: "",
      type: "datetime-local",
    },
    {
      key: "rrn",
      label: "RRN (Retrieval Reference Number)",
      helpText: "12-digit reference number (if available in SMS/app).",
      required: false,
      enabled: true,
      pattern: "^[0-9]{12}$",
      type: "text",
    },
    {
      key: "stan",
      label: "STAN (System Trace Audit Number)",
      helpText: "6-digit STAN number (if visible on receipt).",
      required: false,
      enabled: true,
      pattern: "^[0-9]{6}$",
      type: "text",
    },
  ];

  const defaultBankFields = [
    {
      key: "transactionId",
      label: "Transaction / Reference ID",
      helpText: "Unique transaction or reference ID generated by your banking app.",
      required: true,
      enabled: true,
      pattern: "^[A-Za-z0-9-]{6,35}$",
      type: "text",
    },
    {
      key: "rrn",
      label: "RRN (12 Digits)",
      helpText: "12-digit Retrieval Reference Number printed on electronic bank slips.",
      required: true,
      enabled: true,
      pattern: "^[0-9]{12}$",
      type: "text",
    },
    {
      key: "stan",
      label: "STAN (6 Digits)",
      helpText: "6-digit System Trace Audit Number (optional).",
      required: false,
      enabled: true,
      pattern: "^[0-9]{6}$",
      type: "text",
    },
    {
      key: "senderBankName",
      label: "Sender Bank Name",
      helpText: "Name of the bank from which you transferred (e.g. HBL, Meezan, Alfalah).",
      required: true,
      enabled: true,
      pattern: "^[a-zA-Z0-9\\s.-]{2,50}$",
      type: "text",
    },
    {
      key: "senderAccountTitle",
      label: "Sender Account Title",
      helpText: "Title of your bank account.",
      required: true,
      enabled: true,
      pattern: "^[a-zA-Z\\s.]{2,60}$",
      type: "text",
    },
    {
      key: "senderAccountLast4",
      label: "Last 4 Digits of Account",
      helpText: "Optional last 4 digits of your account or IBAN for faster reconciliation.",
      required: false,
      enabled: true,
      pattern: "^[0-9]{4}$",
      type: "text",
    },
    {
      key: "amountPaid",
      label: "Amount Paid (PKR)",
      helpText: "Must match your order total exactly.",
      required: true,
      enabled: true,
      pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
      type: "number",
    },
    {
      key: "paymentDateTime",
      label: "Payment Date & Time",
      helpText: "Date and time of transfer completion.",
      required: true,
      enabled: true,
      pattern: "",
      type: "datetime-local",
    },
  ];

  const paymentMethods = [
    {
      code: PaymentMethodCode.COD,
      label: "Cash on Delivery (COD)",
      isEnabled: true,
      sortOrder: 1,
      instructions: "Pay with cash when your parcel is delivered at your doorstep. Please keep exact change ready.",
      maxCodAmount: 25000,
      requireReceipt: false,
      fields: [],
    },
    {
      code: PaymentMethodCode.EASYPAISA,
      label: "Easypaisa",
      isEnabled: true,
      sortOrder: 2,
      instructions: "Transfer the exact order total to our Easypaisa account. Enter the transaction details and upload your transfer screenshot below.",
      accountTitle: "PetsWorld Payments",
      accountNumber: "03001234567",
      requireReceipt: true,
      fields: defaultWalletFields,
    },
    {
      code: PaymentMethodCode.JAZZCASH,
      label: "JazzCash",
      isEnabled: true,
      sortOrder: 3,
      instructions: "Send the exact order total to our JazzCash account. Enter the transaction details and upload your screenshot below.",
      accountTitle: "PetsWorld Payments",
      accountNumber: "03001234567",
      requireReceipt: true,
      fields: defaultWalletFields,
    },
    {
      code: PaymentMethodCode.BANK_TRANSFER,
      label: "Direct Bank Transfer",
      isEnabled: true,
      sortOrder: 4,
      instructions: "Transfer the exact order total via online banking or ATM to our corporate bank account. Enter transaction details and upload your receipt screenshot below.",
      accountTitle: "PetsWorld Private Limited",
      bankName: "Meezan Bank Limited",
      accountNumber: "01010101010101",
      iban: "PK36MEZN0001010101010101",
      branch: "DHA Phase 5 Branch, Lahore",
      requireReceipt: true,
      fields: defaultBankFields,
    },
  ];

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { code: method.code },
      update: {}, // Never overwrite admin customization
      create: {
        code: method.code,
        label: method.label,
        isEnabled: method.isEnabled,
        sortOrder: method.sortOrder,
        instructions: method.instructions,
        accountTitle: method.accountTitle,
        accountNumber: method.accountNumber,
        bankName: method.bankName,
        iban: method.iban,
        branch: method.branch,
        maxCodAmount: method.maxCodAmount,
        requireReceipt: method.requireReceipt,
        fields: method.fields,
      },
    });
  }
  console.log("✅ Payment methods seeded.");

  // 4. Global FAQs
  const globalFaqs = [
    {
      question: "Do you deliver across Pakistan?",
      answer: "We deliver to the cities and areas listed at checkout. Enter your city and postal code to confirm coverage.",
      sortOrder: 1,
      scopeType: FaqScopeType.GLOBAL,
      scopeKey: "global",
    },
    {
      question: "What payment methods do you accept?",
      answer: "Cash on Delivery, Easypaisa, JazzCash and Bank Transfer. For wallet and bank payments, we confirm your order once we verify your payment.",
      sortOrder: 2,
      scopeType: FaqScopeType.GLOBAL,
      scopeKey: "global",
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery times depend on your city. We confirm the estimate when we contact you about your order.",
      sortOrder: 3,
      scopeType: FaqScopeType.GLOBAL,
      scopeKey: "global",
    },
    {
      question: "Can I return or exchange a product?",
      answer: "Unopened items can be returned within the period stated on our Returns page. Food items follow the conditions listed there.",
      sortOrder: 4,
      scopeType: FaqScopeType.GLOBAL,
      scopeKey: "global",
    },
    {
      question: "Are your products authentic?",
      answer: "Yes. We list brand, ingredients and specifications on each product page so you can check before you buy.",
      sortOrder: 5,
      scopeType: FaqScopeType.GLOBAL,
      scopeKey: "global",
    },
    {
      question: "How do I track my order?",
      answer: "Use your order number on the order page, or contact us on WhatsApp.",
      sortOrder: 6,
      scopeType: FaqScopeType.GLOBAL,
      scopeKey: "global",
    },
    {
      question: "Why is my Easypaisa, JazzCash or bank order not confirmed yet?",
      answer: "These orders are confirmed after we verify your payment details and screenshot. This usually takes a short time during business hours.",
      sortOrder: 7,
      scopeType: FaqScopeType.GLOBAL,
      scopeKey: "global",
    },
  ];

  for (const faq of globalFaqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.faq.create({
        data: faq,
      });
    }
  }
  console.log("✅ Global FAQs seeded.");

  // 5. Page SEO Records
  const pagesSeo = [
    {
      pageKey: "home",
      seoTitle: "PetsWorld.pk | Pet Food & Accessories in Pakistan",
      seoDescription: "Shop cat food, dog food, bird supplies and pet accessories online in Pakistan. Cash on Delivery, Easypaisa & JazzCash. Fast delivery nationwide.",
      editableIntroText: "PetsWorld is Pakistan's online pet store for cats, dogs and birds. Browse nutritious food, durable accessories and everyday essentials, with Cash on Delivery or mobile wallet payment and delivery to your door.",
    },
    {
      pageKey: "shop",
      seoTitle: "Shop Pet Supplies Online in Pakistan | PetsWorld",
      seoDescription: "Browse all cat, dog and bird products. Filter by category, brand and price. Order online with COD, Easypaisa or JazzCash.",
      editableIntroText: "Discover top-tier food, treats, toys, and care essentials for your companions. Every item is verified authentic and delivered fast.",
    },
    {
      pageKey: "categories",
      seoTitle: "Pet Product Categories | Cat, Dog & Bird Supplies | PetsWorld",
      seoDescription: "Explore cat food, dog food, accessories and bird products. Find the right supplies for your pet at PetsWorld.pk.",
      editableIntroText: "Shop by pet type or product category to find exactly what your pet loves.",
    },
    {
      pageKey: "blog",
      seoTitle: "Pet Care Tips & Guides | PetsWorld Blog",
      seoDescription: "Practical advice on feeding, grooming and caring for cats, dogs and birds in Pakistan, written to help you choose the right products.",
      editableIntroText: "Expert guidance, breed advice, and nutrition guides curated for Pakistani pet parents.",
    },
    {
      pageKey: "contact",
      seoTitle: "Contact PetsWorld | Pet Store Support in Pakistan",
      seoDescription: "Questions about an order or a product? Contact PetsWorld by phone, WhatsApp or our inquiry form. We reply quickly.",
      editableIntroText: "Our Lahore-based pet care support team is available Mon-Sat 9am - 8pm to assist with orders and advice.",
    },
  ];

  for (const page of pagesSeo) {
    await prisma.pageSeo.upsert({
      where: { pageKey: page.pageKey },
      update: {},
      create: {
        pageKey: page.pageKey,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        editableIntroText: page.editableIntroText,
      },
    });
  }
  console.log("✅ Page SEO records seeded.");

  // 6. Store Settings
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {}, // Never overwrite admin changes
    create: {
      id: "default",
      storeName: "PetsWorld",
      phone: "03001234567",
      whatsAppContact: "923001234567",
      email: "info@petsworld.pk",
      address: "DHA Phase 5, Lahore, Pakistan",
      announcementBarText: "🐾 Free delivery across Pakistan on orders over Rs. 3,000!",
      announcementBarEnabled: true,
      heroHeadline: "Everything They Love. All in One Place.",
      heroSubheadline: "Premium Pet Food • Accessories • Care",
      heroPrimaryCtaLabel: "Shop Now",
      heroPrimaryCtaLink: "/shop",
      heroSecondaryCtaLabel: "Browse Categories",
      heroSecondaryCtaLink: "/categories",
      whyPetsWorldPoints: [
        {
          title: "100% Authentic Products",
          description: "Sourced directly from verified brands and trusted distributors.",
          icon: "ShieldCheck",
        },
        {
          title: "Nationwide Express Delivery",
          description: "Safe and fast doorstep delivery across all major cities of Pakistan.",
          icon: "Truck",
        },
        {
          title: "Flexible Payment Options",
          description: "Cash on Delivery, Easypaisa, JazzCash, or direct bank transfer.",
          icon: "CreditCard",
        },
        {
          title: "Dedicated Pet Support",
          description: "Instant assistance and pet advice via our WhatsApp support hotline.",
          icon: "HeartHandshake",
        },
      ],
      shippingFlatFee: 200.0,
      freeShippingThreshold: 3000.0,
      serviceableProvinces: ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Islamabad Capital Territory", "Balochistan", "Azad Kashmir"],
      serviceableCities: ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"],
      requireCustomerEmail: true,
      whatsAppEnabled: true,
      whatsAppNumber: "923001234567",
      whatsAppPrefilledMessage: "Hi PetsWorld, I have a question about your pet supplies.",
      whatsAppButtonLabel: "WhatsApp",
      whatsAppButtonSide: "right",
      emailEnabled: true,
      emailFromName: "PetsWorld",
      emailReplyTo: "orders@petsworld.pk",
      emailNotificationToggles: {
        orderReceived: true,
        paymentVerified: true,
        paymentRejected: true,
        processing: true,
        shipped: true,
        delivered: true,
        cancelled: true,
      },
    },
  });
  console.log("✅ Store settings seeded.");

  console.log("🎉 Idempotent seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
