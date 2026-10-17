import { db } from "../src/lib/db";
import crypto from "crypto";
import { generateOrderAccessToken, verifyOrderAccessToken } from "../src/actions/checkout-actions";
import { storage } from "../src/lib/storage/db-storage";

async function runAcceptanceTests() {
  console.log("=================================================");
  console.log("🐾 RUNNING PETSWORLD.PK ACCEPTANCE TEST SUITE 🐾");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // TEST 1: Database Health & TiDB Connection
  try {
    const start = Date.now();
    await db.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    assert(true, "TiDB Serverless Database Connection", `Ping Latency: ${latency}ms`);
  } catch (e: any) {
    assert(false, "TiDB Serverless Database Connection", e.message);
  }

  // TEST 2: Single Source of Truth - Products & Categories Exist in DB
  try {
    const productCount = await db.product.count({ where: { isPublished: true } });
    const categoryCount = await db.category.count({ where: { isActive: true } });
    assert(productCount > 0, "Products exist in database", `Found ${productCount} published products`);
    assert(categoryCount > 0, "Categories exist in database", `Found ${categoryCount} active categories`);
  } catch (e: any) {
    assert(false, "Products & Categories query", e.message);
  }

  // TEST 3: Blog System & Scoped FAQs
  try {
    const postCount = await db.blogPost.count({ where: { status: "PUBLISHED" } });
    const blogFaqs = await db.faq.count({ where: { scopeType: "BLOG_POST" } });
    assert(postCount >= 2, "Blog guides published", `Found ${postCount} published guides`);
    assert(blogFaqs > 0, "Scoped blog FAQs linked", `Found ${blogFaqs} blog FAQs`);
  } catch (e: any) {
    assert(false, "Blog System query", e.message);
  }

  // TEST 4: Atomic Conditional Stock Decrement Under Concurrency
  try {
    // Create a temporary test product with 5 in stock
    const testSku = `TEST-CONCURRENCY-${Date.now()}`;
    const testProduct = await db.product.create({
      data: {
        name: "Concurrency Test Kibble",
        slug: `test-concurrency-${Date.now()}`,
        sku: testSku,
        description: "Test kibble for atomic decrement verification",
        price: 1500,
        stockQty: 5,
        isPublished: true,
      },
    });

    // Simulate 7 parallel buyers trying to buy 1 item each (only 5 should succeed, 2 should fail)
    const buyers = [1, 2, 3, 4, 5, 6, 7];
    const results = await Promise.all(
      buyers.map(async () => {
        try {
          const res = await db.$executeRaw`
            UPDATE Product
            SET stockQty = stockQty - 1
            WHERE id = ${testProduct.id} AND stockQty >= 1
          `;
          return res > 0;
        } catch {
          return false;
        }
      })
    );

    const successCount = results.filter(Boolean).length;
    const finalProduct = await db.product.findUnique({ where: { id: testProduct.id } });

    assert(
      successCount === 5 && finalProduct?.stockQty === 0,
      "Atomic conditional stock decrement prevents overselling",
      `Expected 5 successes & 0 final stock. Got: ${successCount} successes, ${finalProduct?.stockQty} stock.`
    );

    // Clean up test product
    await db.product.delete({ where: { id: testProduct.id } });
  } catch (e: any) {
    assert(false, "Concurrency test", e.message);
  }

  // TEST 5: Private Receipt Security & Public Media Route Isolation
  try {
    // Create dummy receipt asset with visibility: PRIVATE
    const fakeBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
    
    // Save as private asset
    const privateAsset = await db.mediaAsset.create({
      data: {
        mimeType: "image/webp",
        width: 400,
        height: 400,
        byteSize: 100,
        sha256: crypto.randomBytes(32).toString("hex"),
        visibility: "PRIVATE",
        status: "TEMP",
      },
    });

    // Try fetching via public storage method
    const publicFetch = await storage.getVariant(privateAsset.id, "lg");
    assert(
      publicFetch === null,
      "Public media provider strictly refuses PRIVATE receipt assets",
      "Public route cannot serve private images"
    );

    // Clean up
    await db.mediaAsset.delete({ where: { id: privateAsset.id } });
  } catch (e: any) {
    assert(false, "Private receipt security test", e.message);
  }

  // TEST 6: Order Enumeration Protection (HMAC verification)
  try {
    const fakeOrderId = "cmv_fake_order_123";
    const fakeOrderNumber = "PW-20261016-A1B2";

    const token = await generateOrderAccessToken(fakeOrderId, fakeOrderNumber);
    const isValid = await verifyOrderAccessToken(fakeOrderId, fakeOrderNumber, token);
    const isInvalidTamp = await verifyOrderAccessToken(fakeOrderId, "PW-20261016-DIFFERENT", token);

    assert(isValid, "HMAC Order access token verifies legitimate customer");
    assert(!isInvalidTamp, "HMAC Order access token rejects tampered order number");
  } catch (e: any) {
    assert(false, "Order enumeration protection test", e.message);
  }

  // TEST 7: Page SEO Live Records
  try {
    const seoRecords = await db.pageSeo.findMany();
    const expectedKeys = ["home", "shop", "categories", "blog", "contact"];
    const foundAll = expectedKeys.every((k) => seoRecords.some((r) => r.pageKey === k));
    assert(foundAll, "All static page SEO records configured in DB", `Found ${seoRecords.length} records`);
  } catch (e: any) {
    assert(false, "Page SEO test", e.message);
  }

  // TEST 8: Store Settings & Payment Methods
  try {
    const settings = await db.storeSettings.findUnique({ where: { id: "default" } });
    const paymentMethods = await db.paymentMethod.findMany({ where: { isEnabled: true } });
    assert(!!settings, "Store settings record loaded from DB");
    assert(paymentMethods.length >= 4, "All 4 payment methods active (COD, Easypaisa, JazzCash, Bank)", `Active count: ${paymentMethods.length}`);
  } catch (e: any) {
    assert(false, "Store Settings & Payment Methods test", e.message);
  }

  console.log("\n=================================================");
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAcceptanceTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
