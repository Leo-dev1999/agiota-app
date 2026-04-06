import { prisma } from '../../lib/prisma'

export async function getDashboardSummary(tenantId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  const [activeLoans, allLoans, dueTodayCount, dueTomorrowCount, overdueCount] = await Promise.all(
    [
      // Active loans (not QUITADO) to compute "total rodando"
      prisma.loan.findMany({
        where: { tenantId, status: { not: 'QUITADO' } },
        select: { principal: true, totalReturn: true },
      }),

      // All loans for total returned
      prisma.payment.findMany({
        where: { loan: { tenantId }, status: 'PAGO' },
        select: { amountPaid: true },
      }),

      // Due today
      prisma.payment.count({
        where: {
          loan: { tenantId },
          dueDate: { gte: today, lt: tomorrow },
          status: { not: 'PAGO' },
        },
      }),

      // Due tomorrow
      prisma.payment.count({
        where: {
          loan: { tenantId },
          dueDate: { gte: tomorrow, lt: dayAfter },
          status: { not: 'PAGO' },
        },
      }),

      // Overdue
      prisma.payment.count({
        where: {
          loan: { tenantId },
          dueDate: { lt: today },
          status: 'ATRASADO',
        },
      }),
    ]
  )

  const totalActive = activeLoans.reduce((sum, l) => sum + l.principal, 0)
  const totalReturned = allLoans.reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)

  // Monthly returns: sum of payments due this month that are pending
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
  const monthlyPayments = await prisma.payment.findMany({
    where: {
      loan: { tenantId },
      dueDate: { gte: startOfMonth, lte: endOfMonth },
      status: { not: 'PAGO' },
    },
    select: { amount: true },
  })
  const monthlyReturns = monthlyPayments.reduce((sum, p) => sum + p.amount, 0)

  return {
    totalActive,
    totalReturned,
    monthlyReturns,
    dueTodayCount,
    dueTomorrowCount,
    overdueCount,
  }
}
