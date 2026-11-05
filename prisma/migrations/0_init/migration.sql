-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('event', 'restaurant', 'facility');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('pending', 'needs_changes', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'super_admin');

-- CreateEnum
CREATE TYPE "CategoryEnum" AS ENUM ('music', 'food_drink', 'sports', 'comedy', 'arts_culture', 'nightlife', 'religious', 'education', 'lifestyle', 'wellness');

-- CreateEnum
CREATE TYPE "CommissionType" AS ENUM ('PERCENTAGE', 'FLAT_FEE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CategoryEnum" NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Abeokuta',
    "neighborhood" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "thumbnailUrl" TEXT NOT NULL,
    "legalDocumentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "externalLink" TEXT,
    "submitterName" TEXT NOT NULL,
    "submitterEmail" TEXT NOT NULL,
    "submitterPhone" TEXT NOT NULL,
    "editToken" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "adminNotes" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_images" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_details" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "subaccountCode" TEXT,
    "commissionType" "CommissionType" NOT NULL DEFAULT 'PERCENTAGE',
    "commissionValue" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "event_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_details" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "cuisineType" TEXT NOT NULL,
    "priceRange" TEXT,
    "operatingHours" TEXT,
    "menuLink" TEXT,
    "cacNumber" TEXT,
    "licenseNumber" TEXT,

    CONSTRAINT "restaurant_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_details" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "facilityCategory" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "operatingHours" TEXT,
    "cacNumber" TEXT,
    "licenseNumber" TEXT,

    CONSTRAINT "facility_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_tiers" (
    "id" UUID NOT NULL,
    "listingId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_orders" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "listingId" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "commission" INTEGER NOT NULL,
    "organizerAmount" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentProvider" TEXT NOT NULL DEFAULT 'paystack',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_order_items" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "ticketTierId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "ticketTierId" UUID NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listings_editToken_key" ON "listings"("editToken");

-- CreateIndex
CREATE INDEX "listings_status_isPublished_idx" ON "listings"("status", "isPublished");

-- CreateIndex
CREATE INDEX "listings_listingType_status_idx" ON "listings"("listingType", "status");

-- CreateIndex
CREATE INDEX "listings_category_status_idx" ON "listings"("category", "status");

-- CreateIndex
CREATE INDEX "listings_city_status_idx" ON "listings"("city", "status");

-- CreateIndex
CREATE INDEX "listings_city_isPublished_idx" ON "listings"("city", "isPublished");

-- CreateIndex
CREATE INDEX "listings_isFeatured_featuredOrder_idx" ON "listings"("isFeatured", "featuredOrder");

-- CreateIndex
CREATE INDEX "listing_images_listingId_sortOrder_idx" ON "listing_images"("listingId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "event_details_listingId_key" ON "event_details"("listingId");

-- CreateIndex
CREATE INDEX "event_details_startDateTime_idx" ON "event_details"("startDateTime");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_details_listingId_key" ON "restaurant_details"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "facility_details_listingId_key" ON "facility_details"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "ticket_tiers_listingId_idx" ON "ticket_tiers"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_orders_reference_key" ON "ticket_orders"("reference");

-- CreateIndex
CREATE INDEX "ticket_orders_listingId_idx" ON "ticket_orders"("listingId");

-- CreateIndex
CREATE INDEX "ticket_orders_customerEmail_idx" ON "ticket_orders"("customerEmail");

-- CreateIndex
CREATE INDEX "ticket_orders_reference_idx" ON "ticket_orders"("reference");

-- CreateIndex
CREATE INDEX "ticket_orders_status_idx" ON "ticket_orders"("status");

-- CreateIndex
CREATE INDEX "ticket_order_items_orderId_idx" ON "ticket_order_items"("orderId");

-- CreateIndex
CREATE INDEX "ticket_order_items_ticketTierId_idx" ON "ticket_order_items"("ticketTierId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_ticketCode_key" ON "tickets"("ticketCode");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_qrToken_key" ON "tickets"("qrToken");

-- CreateIndex
CREATE INDEX "tickets_orderId_idx" ON "tickets"("orderId");

-- CreateIndex
CREATE INDEX "tickets_ticketTierId_idx" ON "tickets"("ticketTierId");

-- CreateIndex
CREATE INDEX "tickets_qrToken_idx" ON "tickets"("qrToken");

-- AddForeignKey
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_details" ADD CONSTRAINT "event_details_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_details" ADD CONSTRAINT "restaurant_details_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_details" ADD CONSTRAINT "facility_details_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_tiers" ADD CONSTRAINT "ticket_tiers_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_orders" ADD CONSTRAINT "ticket_orders_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_order_items" ADD CONSTRAINT "ticket_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ticket_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_order_items" ADD CONSTRAINT "ticket_order_items_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "ticket_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ticket_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "ticket_tiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

