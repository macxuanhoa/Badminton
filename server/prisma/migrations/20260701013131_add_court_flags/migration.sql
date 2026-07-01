/*
  Warnings:

  - Added the required column `date` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordResetExpiresAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "passwordResetTokenHash" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "courtId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "slotTime" TEXT,
    "date" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "note" TEXT,
    "paymentMethod" TEXT DEFAULT 'CASH',
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("courtId", "createdAt", "fullName", "id", "note", "paymentMethod", "phone", "slotId", "slotTime", "status", "totalPrice", "userId") SELECT "courtId", "createdAt", "fullName", "id", "note", "paymentMethod", "phone", "slotId", "slotTime", "status", "totalPrice", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE TABLE "new_Court" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BADMINTON',
    "position" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "price" REAL NOT NULL,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "isDiscount" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Court" ("id", "name", "position", "price", "status", "type") SELECT "id", "name", "position", "price", "status", "type" FROM "Court";
DROP TABLE "Court";
ALTER TABLE "new_Court" RENAME TO "Court";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
