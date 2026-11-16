-- CreateEnum
CREATE TYPE "InvestmentStrategy" AS ENUM ('LONG_TERM', 'SHORT_TERM', 'HOLD_FOREVER');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('TERM_LIFE', 'HEALTH', 'VEHICLE_TWO_WHEELER', 'VEHICLE_FOUR_WHEELER', 'ENDOWMENT', 'ULIP', 'HOME', 'OTHER');

-- CreateEnum
CREATE TYPE "PremiumFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY', 'SINGLE_PREMIUM');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'LAPSED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssetType" ADD VALUE 'MUTUAL_FUND';
ALTER TYPE "AssetType" ADD VALUE 'PROVIDENT_FUND';
ALTER TYPE "AssetType" ADD VALUE 'GOVERNMENT_SCHEME';
ALTER TYPE "AssetType" ADD VALUE 'CASH';
ALTER TYPE "AssetType" ADD VALUE 'GOLD';
ALTER TYPE "AssetType" ADD VALUE 'INSURANCE_POLICY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LiabilityType" ADD VALUE 'TWO_WHEELER_LOAN';
ALTER TYPE "LiabilityType" ADD VALUE 'GOLD_LOAN';
ALTER TYPE "LiabilityType" ADD VALUE 'INFORMAL_DEBT';

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "investment_strategy" "InvestmentStrategy",
ADD COLUMN     "quantity" DECIMAL(18,6),
ADD COLUMN     "target_date" TIMESTAMP(3),
ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "liabilities" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- CreateTable
CREATE TABLE "insurances" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InsuranceType" NOT NULL,
    "provider" TEXT NOT NULL,
    "policy_number" TEXT,
    "premium_amount" DECIMAL(15,2) NOT NULL,
    "premium_frequency" "PremiumFrequency" NOT NULL,
    "sum_insured" DECIMAL(15,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "renewal_date" TIMESTAMP(3) NOT NULL,
    "status" "InsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
    "vehicle_registration" TEXT,
    "nominees" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insurances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "insurances_user_id_idx" ON "insurances"("user_id");

-- CreateIndex
CREATE INDEX "insurances_user_id_type_idx" ON "insurances"("user_id", "type");

-- CreateIndex
CREATE INDEX "insurances_user_id_status_idx" ON "insurances"("user_id", "status");

-- CreateIndex
CREATE INDEX "insurances_user_id_renewal_date_idx" ON "insurances"("user_id", "renewal_date");

-- CreateIndex
CREATE INDEX "assets_user_id_type_idx" ON "assets"("user_id", "type");

-- CreateIndex
CREATE INDEX "assets_user_id_purchase_date_idx" ON "assets"("user_id", "purchase_date");

-- CreateIndex
CREATE INDEX "assets_user_id_target_date_idx" ON "assets"("user_id", "target_date");

-- CreateIndex
CREATE INDEX "budgets_user_id_year_month_idx" ON "budgets"("user_id", "year", "month");

-- CreateIndex
CREATE INDEX "goals_user_id_status_idx" ON "goals"("user_id", "status");

-- CreateIndex
CREATE INDEX "liabilities_user_id_type_idx" ON "liabilities"("user_id", "type");

-- CreateIndex
CREATE INDEX "liabilities_user_id_due_date_idx" ON "liabilities"("user_id", "due_date");

-- CreateIndex
CREATE INDEX "transactions_user_id_type_date_idx" ON "transactions"("user_id", "type", "date");

-- AddForeignKey
ALTER TABLE "insurances" ADD CONSTRAINT "insurances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
