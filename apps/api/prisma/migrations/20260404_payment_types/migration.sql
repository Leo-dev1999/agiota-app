-- Add currentPrincipal to Loan (saldo devedor)
ALTER TABLE "Loan" ADD COLUMN "currentPrincipal" DOUBLE PRECISION NOT NULL DEFAULT 0;
UPDATE "Loan" SET "currentPrincipal" = "principal";

-- Add payment type tracking to Payment
ALTER TABLE "Payment" ADD COLUMN "paymentType" TEXT NOT NULL DEFAULT 'JUROS';
ALTER TABLE "Payment" ADD COLUMN "principalPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Payment" ADD COLUMN "interestPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;
