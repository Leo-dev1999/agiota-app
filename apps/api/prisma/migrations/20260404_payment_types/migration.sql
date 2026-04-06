-- Add currentPrincipal to Loan (saldo devedor)
ALTER TABLE "Loan" ADD COLUMN "currentPrincipal" REAL NOT NULL DEFAULT 0;
UPDATE "Loan" SET "currentPrincipal" = "principal";

-- Add payment type tracking to Payment
ALTER TABLE "Payment" ADD COLUMN "paymentType" TEXT NOT NULL DEFAULT 'JUROS';
ALTER TABLE "Payment" ADD COLUMN "principalPaid" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Payment" ADD COLUMN "interestPaid" REAL NOT NULL DEFAULT 0;
