import { prisma } from '../../lib/prisma'
import { MarkAsPaidInput, PaymentType } from '@agiota/shared'

export async function listPayments(
  tenantId: string,
  filters: { status?: string; loanId?: string }
) {
  return prisma.payment.findMany({
    where: {
      loan: { tenantId },
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.loanId ? { loanId: filters.loanId } : {}),
    },
    include: {
      loan: {
        include: { client: { select: { id: true, name: true, phone: true } } },
      },
    },
    orderBy: { dueDate: 'asc' },
  })
}

export async function getTodayPayments(tenantId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return prisma.payment.findMany({
    where: {
      loan: { tenantId },
      dueDate: { gte: today, lt: tomorrow },
      status: { not: 'PAGO' },
    },
    include: {
      loan: {
        include: { client: { select: { id: true, name: true, phone: true } } },
      },
    },
    orderBy: { dueDate: 'asc' },
  })
}

export async function getTomorrowPayments(tenantId: string) {
  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  return prisma.payment.findMany({
    where: {
      loan: { tenantId },
      dueDate: { gte: tomorrow, lt: dayAfter },
      status: { not: 'PAGO' },
    },
    include: {
      loan: {
        include: { client: { select: { id: true, name: true, phone: true } } },
      },
    },
    orderBy: { dueDate: 'asc' },
  })
}

export async function getOverduePayments(tenantId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return prisma.payment.findMany({
    where: {
      loan: { tenantId },
      dueDate: { lt: today },
      status: 'ATRASADO',
    },
    include: {
      loan: {
        include: { client: { select: { id: true, name: true, phone: true } } },
      },
    },
    orderBy: { dueDate: 'asc' },
  })
}

export async function markAsPaid(paymentId: string, tenantId: string, data: MarkAsPaidInput) {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, loan: { tenantId } },
    include: { loan: true },
  })

  if (!payment) throw new Error('Pagamento não encontrado')

  const loan = payment.loan
  const paymentType = data.paymentType ?? PaymentType.JUROS
  const interestDue = round(loan.currentPrincipal * (loan.interestRate / 100))

  let principalPaid = 0
  let newPrincipal = loan.currentPrincipal
  let markAsQuitado = false

  if (paymentType === PaymentType.QUITACAO) {
    principalPaid = loan.currentPrincipal
    newPrincipal = 0
    markAsQuitado = true
  } else if (paymentType === PaymentType.AMORTIZACAO) {
    principalPaid = data.amortizationAmount ?? 0
    newPrincipal = round(loan.currentPrincipal - principalPaid)
    if (newPrincipal <= 0) {
      newPrincipal = 0
      markAsQuitado = true
    }
  }

  const amountPaid = round(interestDue + principalPaid)

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'PAGO',
      paidDate: new Date(data.paidDate),
      amountPaid,
      paymentType,
      principalPaid,
      interestPaid: interestDue,
      notes: data.notes,
    },
  })

  if (markAsQuitado) {
    await prisma.loan.update({
      where: { id: loan.id },
      data: { status: 'QUITADO', currentPrincipal: 0 },
    })
  } else {
    await prisma.loan.update({
      where: { id: loan.id },
      data: { status: 'PAGO', currentPrincipal: newPrincipal },
    })

    // Para empréstimos mensais: gera a próxima cobrança de juros automaticamente
    if (loan.billingType === 'MENSAL') {
      const lastPayment = await prisma.payment.findFirst({
        where: { loanId: loan.id },
        orderBy: { installmentNo: 'desc' },
      })

      const nextDueDate = addMonths(payment.dueDate)
      const nextInterest = round(newPrincipal * (loan.interestRate / 100))

      await prisma.payment.create({
        data: {
          loanId: loan.id,
          dueDate: nextDueDate,
          amount: nextInterest,
          installmentNo: (lastPayment?.installmentNo ?? 0) + 1,
        },
      })
    }
  }

  return prisma.payment.findUnique({ where: { id: paymentId } })
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function addMonths(date: Date, months = 1): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}
