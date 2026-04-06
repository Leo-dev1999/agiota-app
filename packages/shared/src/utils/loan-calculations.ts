import { BillingType } from '../types/enums'

export interface LoanCalculation {
  interestAmount: number
  interestAmountX2: number
  totalReturn: number
}

export interface PaymentScheduleItem {
  installmentNo: number
  dueDate: Date
  amount: number
}

export function calculateLoan(principal: number, interestRate: number): LoanCalculation {
  const interestAmount = principal * (interestRate / 100)
  const interestAmountX2 = interestAmount * 2
  const totalReturn = principal + interestAmount
  return { interestAmount, interestAmountX2, totalReturn }
}

export function generatePaymentSchedule(
  principal: number,
  interestRate: number,
  billingType: BillingType,
  startDate: Date,
  options: {
    installments?: number
    paymentDayOfMonth?: number
    paymentDayOfWeek?: number
  }
): PaymentScheduleItem[] {
  const { totalReturn } = calculateLoan(principal, interestRate)
  const payments: PaymentScheduleItem[] = []

  switch (billingType) {
    case BillingType.MENSAL: {
      // Gera apenas a primeira cobrança de juros; as próximas são criadas automaticamente após cada pagamento
      const dueDate = getNextDayOfMonth(startDate, options.paymentDayOfMonth ?? 1)
      const interestOnly = round(principal * (interestRate / 100))
      payments.push({ installmentNo: 1, dueDate, amount: interestOnly })
      break
    }

    case BillingType.DIARIA: {
      const count = options.installments ?? 30
      const amountPerDay = round(totalReturn / count)
      for (let i = 1; i <= count; i++) {
        const dueDate = addDays(startDate, i)
        payments.push({ installmentNo: i, dueDate, amount: amountPerDay })
      }
      break
    }

    case BillingType.SEMANAL: {
      const count = options.installments ?? 4
      const amountPerWeek = round(totalReturn / count)
      for (let i = 1; i <= count; i++) {
        const dueDate = addDays(startDate, i * 7)
        payments.push({ installmentNo: i, dueDate, amount: amountPerWeek })
      }
      break
    }

    case BillingType.PARCELADO: {
      const count = options.installments ?? 3
      const amountPerInstallment = round(totalReturn / count)
      for (let i = 1; i <= count; i++) {
        const dueDate = addMonths(startDate, i)
        payments.push({ installmentNo: i, dueDate, amount: amountPerInstallment })
      }
      break
    }
  }

  return payments
}

function getNextDayOfMonth(from: Date, day: number): Date {
  const result = new Date(from)
  result.setDate(day)
  if (result <= from) {
    result.setMonth(result.getMonth() + 1)
  }
  return result
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(d)
}
