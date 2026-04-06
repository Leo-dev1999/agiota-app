import { prisma } from '../../lib/prisma'
import {
  CreateLoanInput,
  BillingType,
  calculateLoan,
  generatePaymentSchedule,
} from '@agiota/shared'

export async function listLoans(
  tenantId: string,
  filters: { status?: string; clientId?: string; billingType?: string }
) {
  return prisma.loan.findMany({
    where: {
      tenantId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.billingType ? { billingType: filters.billingType } : {}),
    },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      payments: {
        where: { status: { not: 'PAGO' } },
        orderBy: { dueDate: 'asc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getLoan(tenantId: string, id: string) {
  return prisma.loan.findFirst({
    where: { id, tenantId },
    include: {
      client: true,
      payments: { orderBy: { dueDate: 'asc' } },
    },
  })
}

export async function createLoan(tenantId: string, data: CreateLoanInput) {
  const { interestAmount, interestAmountX2, totalReturn } = calculateLoan(
    data.principal,
    data.interestRate
  )

  const startDate = new Date(data.startDate)

  const schedule = generatePaymentSchedule(
    data.principal,
    data.interestRate,
    data.billingType as BillingType,
    startDate,
    {
      installments: data.installments,
      paymentDayOfMonth: data.paymentDayOfMonth,
      paymentDayOfWeek: data.paymentDayOfWeek,
    }
  )

  return prisma.loan.create({
    data: {
      tenantId,
      clientId: data.clientId,
      principal: data.principal,
      currentPrincipal: data.principal,
      interestRate: data.interestRate,
      interestAmount,
      interestAmountX2,
      totalReturn,
      billingType: data.billingType,
      installments: data.installments,
      paymentDayOfMonth: data.paymentDayOfMonth,
      paymentDayOfWeek: data.paymentDayOfWeek,
      startDate,
      referralType: data.referralType,
      referralContact: data.referralContact,
      observations: data.observations,
      payments: {
        create: schedule.map((p) => ({
          dueDate: p.dueDate,
          amount: p.amount,
          installmentNo: p.installmentNo,
        })),
      },
    },
    include: {
      client: true,
      payments: { orderBy: { dueDate: 'asc' } },
    },
  })
}

export async function updateLoanStatus(tenantId: string, id: string, status: string) {
  return prisma.loan.update({
    where: { id, tenantId },
    data: { status },
  })
}

export async function deleteLoan(tenantId: string, id: string) {
  return prisma.loan.delete({ where: { id, tenantId } })
}
