-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `imageAssetId` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_parentId_idx`(`parentId`),
    INDEX `Category_slug_idx`(`slug`),
    INDEX `Category_isActive_idx`(`isActive`),
    INDEX `Category_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductCategory` (
    `productId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `ProductCategory_productId_idx`(`productId`),
    INDEX `ProductCategory_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`productId`, `categoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NULL,
    `shortDescription` TEXT NULL,
    `description` LONGTEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `salePrice` DECIMAL(10, 2) NULL,
    `stockQty` INTEGER NOT NULL DEFAULT 0,
    `lowStockThreshold` INTEGER NOT NULL DEFAULT 5,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `featuredSort` INTEGER NOT NULL DEFAULT 0,
    `weight` VARCHAR(191) NULL,
    `dimensions` VARCHAR(191) NULL,
    `ingredients` TEXT NULL,
    `usageInstructions` TEXT NULL,
    `hasAllergyNotice` BOOLEAN NOT NULL DEFAULT false,
    `allergyNoticeText` TEXT NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `canonicalUrl` VARCHAR(191) NULL,
    `ogAssetId` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_slug_key`(`slug`),
    UNIQUE INDEX `Product_sku_key`(`sku`),
    INDEX `Product_slug_idx`(`slug`),
    INDEX `Product_sku_idx`(`sku`),
    INDEX `Product_isPublished_idx`(`isPublished`),
    INDEX `Product_isFeatured_idx`(`isFeatured`),
    INDEX `Product_featuredSort_idx`(`featuredSort`),
    INDEX `Product_deletedAt_idx`(`deletedAt`),
    INDEX `Product_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `altText` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProductImage_productId_idx`(`productId`),
    INDEX `ProductImage_assetId_idx`(`assetId`),
    INDEX `ProductImage_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductSpec` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProductSpec_productId_idx`(`productId`),
    INDEX `ProductSpec_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Review_productId_idx`(`productId`),
    INDEX `Review_status_idx`(`status`),
    INDEX `Review_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Customer_email_idx`(`email`),
    INDEX `Customer_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `addressLine1` VARCHAR(191) NOT NULL,
    `addressLine2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Address_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentMethod` (
    `id` VARCHAR(191) NOT NULL,
    `code` ENUM('COD', 'EASYPAISA', 'JAZZCASH', 'BANK_TRANSFER') NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `instructions` TEXT NULL,
    `accountTitle` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `iban` VARCHAR(191) NULL,
    `branch` VARCHAR(191) NULL,
    `maxCodAmount` DECIMAL(10, 2) NULL,
    `requireReceipt` BOOLEAN NOT NULL DEFAULT false,
    `fields` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PaymentMethod_code_key`(`code`),
    INDEX `PaymentMethod_isEnabled_idx`(`isEnabled`),
    INDEX `PaymentMethod_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CheckoutSession` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `cartSnapshot` JSON NOT NULL,
    `customerInfo` JSON NULL,
    `paymentMethodCode` ENUM('COD', 'EASYPAISA', 'JAZZCASH', 'BANK_TRANSFER') NULL,
    `paymentDetails` JSON NULL,
    `receiptAssetId` VARCHAR(191) NULL,
    `completedSteps` INTEGER NOT NULL DEFAULT 1,
    `idempotencyKey` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CheckoutSession_tokenHash_key`(`tokenHash`),
    INDEX `CheckoutSession_tokenHash_idx`(`tokenHash`),
    INDEX `CheckoutSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `customerSnapshot` JSON NOT NULL,
    `addressSnapshot` JSON NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `shippingFee` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('COD', 'EASYPAISA', 'JAZZCASH', 'BANK_TRANSFER') NOT NULL,
    `paymentStatus` ENUM('UNPAID', 'PENDING_VERIFICATION', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `status` ENUM('AWAITING_PAYMENT_VERIFICATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED') NOT NULL DEFAULT 'AWAITING_PAYMENT_VERIFICATION',
    `notes` TEXT NULL,
    `courier` VARCHAR(191) NULL,
    `trackingNumber` VARCHAR(191) NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    UNIQUE INDEX `Order_idempotencyKey_key`(`idempotencyKey`),
    INDEX `Order_orderNumber_idx`(`orderNumber`),
    INDEX `Order_customerId_idx`(`customerId`),
    INDEX `Order_status_idx`(`status`),
    INDEX `Order_paymentStatus_idx`(`paymentStatus`),
    INDEX `Order_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderPayment` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `method` ENUM('COD', 'EASYPAISA', 'JAZZCASH', 'BANK_TRANSFER') NOT NULL,
    `details` JSON NOT NULL,
    `normalizedTransactionId` VARCHAR(191) NULL,
    `normalizedRrn` VARCHAR(191) NULL,
    `receiptAssetId` VARCHAR(191) NULL,
    `amountDeclared` DECIMAL(10, 2) NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verifiedByAdminId` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,

    UNIQUE INDEX `OrderPayment_orderId_key`(`orderId`),
    INDEX `OrderPayment_orderId_idx`(`orderId`),
    INDEX `OrderPayment_verifiedByAdminId_idx`(`verifiedByAdminId`),
    INDEX `OrderPayment_normalizedRrn_idx`(`normalizedRrn`),
    UNIQUE INDEX `OrderPayment_method_normalizedTransactionId_key`(`method`, `normalizedTransactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `nameSnapshot` VARCHAR(191) NOT NULL,
    `skuSnapshot` VARCHAR(191) NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('AWAITING_PAYMENT_VERIFICATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED') NULL,
    `toStatus` ENUM('AWAITING_PAYMENT_VERIFICATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED') NOT NULL,
    `note` TEXT NULL,
    `changedBy` VARCHAR(191) NOT NULL,
    `at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStatusHistory_orderId_idx`(`orderId`),
    INDEX `OrderStatusHistory_at_idx`(`at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StockMovement` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `delta` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `StockMovement_productId_idx`(`productId`),
    INDEX `StockMovement_orderId_idx`(`orderId`),
    INDEX `StockMovement_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmailLog` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `template` VARCHAR(191) NOT NULL,
    `recipient` VARCHAR(191) NOT NULL,
    `status` ENUM('SENT', 'FAILED', 'SKIPPED_NOT_CONFIGURED') NOT NULL,
    `providerMessageId` VARCHAR(191) NULL,
    `sanitizedError` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `EmailLog_orderId_idx`(`orderId`),
    INDEX `EmailLog_status_idx`(`status`),
    INDEX `EmailLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `coverAssetId` VARCHAR(191) NULL,
    `coverAlt` VARCHAR(191) NULL,
    `content` LONGTEXT NOT NULL,
    `authorName` VARCHAR(191) NOT NULL DEFAULT 'PetsWorld Team',
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `readingTimeMin` INTEGER NOT NULL DEFAULT 3,
    `tags` VARCHAR(191) NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `canonicalUrl` VARCHAR(191) NULL,
    `ogAssetId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_slug_idx`(`slug`),
    INDEX `BlogPost_status_idx`(`status`),
    INDEX `BlogPost_publishedAt_idx`(`publishedAt`),
    INDEX `BlogPost_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogRelatedProduct` (
    `postId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `BlogRelatedProduct_postId_idx`(`postId`),
    INDEX `BlogRelatedProduct_productId_idx`(`productId`),
    PRIMARY KEY (`postId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `scopeType` ENUM('GLOBAL', 'PAGE', 'CATEGORY', 'PRODUCT', 'BLOG_POST') NOT NULL,
    `scopeKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Faq_scopeType_scopeKey_idx`(`scopeType`, `scopeKey`),
    INDEX `Faq_isActive_idx`(`isActive`),
    INDEX `Faq_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `altText` VARCHAR(191) NULL,
    `caption` VARCHAR(191) NULL,
    `byteSize` INTEGER NOT NULL,
    `sha256` VARCHAR(191) NOT NULL,
    `blurDataUrl` TEXT NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    `status` ENUM('TEMP', 'ATTACHED', 'ORPHANED') NOT NULL DEFAULT 'ATTACHED',
    `ownerType` VARCHAR(191) NULL,
    `ownerId` VARCHAR(191) NULL,
    `checkoutSessionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MediaAsset_sha256_idx`(`sha256`),
    INDEX `MediaAsset_visibility_idx`(`visibility`),
    INDEX `MediaAsset_status_idx`(`status`),
    INDEX `MediaAsset_ownerType_ownerId_idx`(`ownerType`, `ownerId`),
    INDEX `MediaAsset_checkoutSessionId_idx`(`checkoutSessionId`),
    INDEX `MediaAsset_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaVariant` (
    `id` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `variantName` VARCHAR(191) NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `byteSize` INTEGER NOT NULL,
    `data` LONGBLOB NOT NULL,

    INDEX `MediaVariant_assetId_idx`(`assetId`),
    UNIQUE INDEX `MediaVariant_assetId_variantName_key`(`assetId`, `variantName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PageSeo` (
    `id` VARCHAR(191) NOT NULL,
    `pageKey` VARCHAR(191) NOT NULL,
    `seoTitle` VARCHAR(191) NOT NULL,
    `seoDescription` TEXT NOT NULL,
    `ogAssetId` VARCHAR(191) NULL,
    `editableIntroText` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PageSeo_pageKey_key`(`pageKey`),
    INDEX `PageSeo_pageKey_idx`(`pageKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoreSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `storeName` VARCHAR(191) NOT NULL DEFAULT 'PetsWorld',
    `phone` VARCHAR(191) NOT NULL DEFAULT '03001234567',
    `whatsAppContact` VARCHAR(191) NOT NULL DEFAULT '923001234567',
    `email` VARCHAR(191) NOT NULL DEFAULT 'info@petsworld.pk',
    `address` VARCHAR(191) NOT NULL DEFAULT 'Lahore, Pakistan',
    `socialLinks` JSON NULL,
    `announcementBarText` VARCHAR(191) NULL DEFAULT '🐾 Free delivery across Pakistan on orders over Rs. 3,000!',
    `announcementBarEnabled` BOOLEAN NOT NULL DEFAULT true,
    `heroHeadline` VARCHAR(191) NOT NULL DEFAULT 'Everything They Love. All in One Place.',
    `heroSubheadline` VARCHAR(191) NULL DEFAULT 'Premium Pet Food • Accessories • Care',
    `heroPrimaryCtaLabel` VARCHAR(191) NOT NULL DEFAULT 'Shop Now',
    `heroPrimaryCtaLink` VARCHAR(191) NOT NULL DEFAULT '/shop',
    `heroSecondaryCtaLabel` VARCHAR(191) NOT NULL DEFAULT 'Browse Categories',
    `heroSecondaryCtaLink` VARCHAR(191) NOT NULL DEFAULT '/categories',
    `heroAssetId` VARCHAR(191) NULL,
    `heroMobileAssetId` VARCHAR(191) NULL,
    `whyPetsWorldPoints` JSON NULL,
    `shippingFlatFee` DECIMAL(10, 2) NOT NULL DEFAULT 200.00,
    `freeShippingThreshold` DECIMAL(10, 2) NOT NULL DEFAULT 3000.00,
    `shippingProvinceOverrides` JSON NULL,
    `serviceableProvinces` JSON NULL,
    `serviceableCities` JSON NULL,
    `requireCustomerEmail` BOOLEAN NOT NULL DEFAULT true,
    `whatsAppEnabled` BOOLEAN NOT NULL DEFAULT true,
    `whatsAppNumber` VARCHAR(191) NOT NULL DEFAULT '923001234567',
    `whatsAppPrefilledMessage` VARCHAR(191) NOT NULL DEFAULT 'Hi PetsWorld, I have a question about your pet supplies.',
    `whatsAppButtonLabel` VARCHAR(191) NOT NULL DEFAULT 'WhatsApp',
    `whatsAppButtonSide` VARCHAR(191) NOT NULL DEFAULT 'right',
    `emailEnabled` BOOLEAN NOT NULL DEFAULT true,
    `emailFromName` VARCHAR(191) NOT NULL DEFAULT 'PetsWorld',
    `emailReplyTo` VARCHAR(191) NOT NULL DEFAULT 'orders@petsworld.pk',
    `emailNotificationToggles` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'UNREAD',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ContactMessage_createdAt_idx`(`createdAt`),
    INDEX `ContactMessage_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
