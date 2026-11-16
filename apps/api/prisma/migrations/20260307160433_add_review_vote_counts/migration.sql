-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "helpful_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "not_helpful_count" INTEGER NOT NULL DEFAULT 0;
