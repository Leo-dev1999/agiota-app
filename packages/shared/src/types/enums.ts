export enum LoanStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  QUITADO = 'QUITADO',
  ATRASADO = 'ATRASADO',
}

export enum PaymentStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ATRASADO = 'ATRASADO',
}

export enum BillingType {
  MENSAL = 'MENSAL',
  DIARIA = 'DIARIA',
  SEMANAL = 'SEMANAL',
  PARCELADO = 'PARCELADO',
}

export const BillingTypeLabel: Record<BillingType, string> = {
  [BillingType.MENSAL]: 'Mensal',
  [BillingType.DIARIA]: 'Diária',
  [BillingType.SEMANAL]: 'Semanal',
  [BillingType.PARCELADO]: 'Parcelado',
}

export const LoanStatusLabel: Record<LoanStatus, string> = {
  [LoanStatus.PENDENTE]: 'Pendente',
  [LoanStatus.PAGO]: 'Pago',
  [LoanStatus.QUITADO]: 'Quitado',
  [LoanStatus.ATRASADO]: 'Atrasado',
}
