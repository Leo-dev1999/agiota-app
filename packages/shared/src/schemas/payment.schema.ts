import { z } from 'zod'

export const PaymentType = {
  JUROS: 'JUROS',
  AMORTIZACAO: 'AMORTIZACAO',
  QUITACAO: 'QUITACAO',
} as const

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType]

export const PaymentTypeLabel: Record<PaymentType, string> = {
  JUROS: 'Só Juros',
  AMORTIZACAO: 'Juros + Amortização',
  QUITACAO: 'Quitar Tudo',
}

export const markAsPaidSchema = z.object({
  paidDate: z.string().date(),
  amountPaid: z.number().positive().optional(),
  paymentType: z.nativeEnum(PaymentType).default(PaymentType.JUROS),
  amortizationAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
})

export type MarkAsPaidInput = z.infer<typeof markAsPaidSchema>
