import { z } from 'zod'
import { BillingType, LoanStatus } from '../types/enums'

export const createLoanSchema = z
  .object({
    clientId: z.string().min(1, 'Cliente obrigatório'),
    principal: z.number().positive('Valor deve ser positivo'),
    interestRate: z.number().min(0).max(100).default(30),
    billingType: z.nativeEnum(BillingType),
    installments: z.number().int().positive().optional(),
    paymentDayOfMonth: z.number().int().min(1).max(31).optional(),
    paymentDayOfWeek: z.number().int().min(0).max(6).optional(),
    startDate: z.string().datetime().or(z.string().date()),
    referralType: z.enum(['meia', 'total']).optional(),
    referralContact: z.string().optional(),
    observations: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.billingType === BillingType.MENSAL) {
        return data.paymentDayOfMonth !== undefined
      }
      if (data.billingType === BillingType.SEMANAL || data.billingType === BillingType.DIARIA) {
        return data.installments !== undefined
      }
      if (data.billingType === BillingType.PARCELADO) {
        return data.installments !== undefined
      }
      return true
    },
    { message: 'Configuração de cobrança incompleta' }
  )

export const updateLoanStatusSchema = z.object({
  status: z.nativeEnum(LoanStatus),
})

export type CreateLoanInput = z.infer<typeof createLoanSchema>
export type UpdateLoanStatusInput = z.infer<typeof updateLoanStatusSchema>
