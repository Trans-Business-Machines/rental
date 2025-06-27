/*
  Warnings:

  - You are about to drop the column `units` on the `properties` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "units" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'available',
    "rent" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "units_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "guests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "idType" TEXT NOT NULL,
    "idNumber" TEXT,
    "passportNumber" TEXT,
    "dateOfBirth" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "occupation" TEXT,
    "employer" TEXT,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "emergencyContactRelation" TEXT NOT NULL,
    "registrationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastStay" DATETIME,
    "totalStays" INTEGER NOT NULL DEFAULT 0,
    "totalNights" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,
    "notes" TEXT,
    "blacklisted" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guestId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "checkInDate" DATETIME NOT NULL,
    "checkOutDate" DATETIME NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "propertyId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "purchasePrice" INTEGER NOT NULL,
    "currentValue" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "serialNumber" TEXT,
    "supplier" TEXT,
    "warrantyExpiry" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastInspected" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "inventory_items_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_items_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checkout_reports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bookingId" INTEGER NOT NULL,
    "guestId" INTEGER NOT NULL,
    "checkoutDate" DATETIME NOT NULL,
    "inspector" TEXT NOT NULL,
    "totalDamageCost" INTEGER NOT NULL DEFAULT 0,
    "depositDeduction" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "checkout_reports_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "checkout_reports_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checkout_items" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checkoutReportId" INTEGER NOT NULL,
    "inventoryItemId" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "damageCost" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "checkout_items_checkoutReportId_fkey" FOREIGN KEY ("checkoutReportId") REFERENCES "checkout_reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "checkout_items_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "inventory_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_properties" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "totalUnits" INTEGER,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "rent" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_properties" ("address", "createdAt", "description", "id", "image", "name", "occupied", "rent", "status", "type", "updatedAt") SELECT "address", "createdAt", "description", "id", "image", "name", "occupied", "rent", "status", "type", "updatedAt" FROM "properties";
DROP TABLE "properties";
ALTER TABLE "new_properties" RENAME TO "properties";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "checkout_reports_bookingId_key" ON "checkout_reports"("bookingId");
