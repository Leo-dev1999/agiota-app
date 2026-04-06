import { formatCurrency, formatDate } from '@agiota/shared'

export function reminderTemplate(clientName: string, dueDate: Date, amount: number): string {
  return `Olá ${clientName}! 👋\nPassando para lembrar que amanhã, dia *${formatDate(dueDate)}*, vence o pagamento de *${formatCurrency(amount)}*.\nQualquer dúvida, é só chamar! 😊`
}

export function dueTodayTemplate(clientName: string, amount: number): string {
  return `Bom dia, ${clientName}! ☀️\nHoje é dia do pagamento de *${formatCurrency(amount)}*.\nAguardo confirmação. Obrigado! 🙏`
}

export function overdueTemplate(clientName: string, dueDate: Date, amount: number): string {
  return `Olá ${clientName}, tudo bem?\nO pagamento de *${formatCurrency(amount)}* que venceu em ${formatDate(dueDate)} ainda está em aberto.\nPor favor, entre em contato para regularizar. 😊`
}
