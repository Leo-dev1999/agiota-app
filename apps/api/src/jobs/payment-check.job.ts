import { prisma } from '../lib/prisma'
import { getWhatsAppProvider } from '../modules/notifications/whatsapp.provider'
import { reminderTemplate, dueTodayTemplate } from '../modules/notifications/templates'

export async function runPaymentCheckJob() {
  console.log(`[${new Date().toISOString()}] Rodando job de verificação de pagamentos...`)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  // 1. Mark overdue payments
  const overdueResult = await prisma.payment.updateMany({
    where: {
      dueDate: { lt: today },
      status: 'PENDENTE',
    },
    data: { status: 'ATRASADO' },
  })

  if (overdueResult.count > 0) {
    console.log(`  ${overdueResult.count} pagamentos marcados como ATRASADO`)

    // Update parent loans to ATRASADO
    const overdueLoans = await prisma.payment.findMany({
      where: { dueDate: { lt: today }, status: 'ATRASADO' },
      select: { loanId: true },
      distinct: ['loanId'],
    })
    await prisma.loan.updateMany({
      where: {
        id: { in: overdueLoans.map((p: { loanId: string }) => p.loanId) },
        status: { not: 'QUITADO' },
      },
      data: { status: 'ATRASADO' },
    })
  }

  // 2. Get tenant settings for notification
  const tenants = await prisma.tenantSettings.findMany({
    where: { whatsappEnabled: true },
    include: { tenant: true },
  })

  for (const settings of tenants) {
    const provider = getWhatsAppProvider()

    // 3. Send "due today" notifications
    if (settings.notifyOnDueDate) {
      const dueToday = await prisma.payment.findMany({
        where: {
          loan: { tenantId: settings.tenantId },
          dueDate: { gte: today, lt: tomorrow },
          status: { not: 'PAGO' },
          notifiedOnDueDate: false,
        },
        include: {
          loan: { include: { client: true } },
        },
      })

      for (const payment of dueToday) {
        try {
          const msg = dueTodayTemplate(payment.loan.client.name, payment.amount)
          await provider.sendMessage(payment.loan.client.phone, msg)
          await prisma.payment.update({
            where: { id: payment.id },
            data: { notifiedOnDueDate: true },
          })
          console.log(`  Notificação hoje enviada para ${payment.loan.client.name}`)
        } catch (err) {
          console.error(`  Erro ao notificar ${payment.loan.client.name}:`, err)
        }
      }
    }

    // 4. Send "day before" reminder notifications
    if (settings.notifyDayBefore) {
      const dueTomorrow = await prisma.payment.findMany({
        where: {
          loan: { tenantId: settings.tenantId },
          dueDate: { gte: tomorrow, lt: dayAfter },
          status: { not: 'PAGO' },
          notifiedDayBefore: false,
        },
        include: {
          loan: { include: { client: true } },
        },
      })

      for (const payment of dueTomorrow) {
        try {
          const msg = reminderTemplate(payment.loan.client.name, payment.dueDate, payment.amount)
          await provider.sendMessage(payment.loan.client.phone, msg)
          await prisma.payment.update({
            where: { id: payment.id },
            data: { notifiedDayBefore: true },
          })
          console.log(`  Lembrete de amanhã enviado para ${payment.loan.client.name}`)
        } catch (err) {
          console.error(`  Erro ao enviar lembrete para ${payment.loan.client.name}:`, err)
        }
      }
    }
  }

  console.log(`  Job concluído.`)
}
