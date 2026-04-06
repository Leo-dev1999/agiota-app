import { Router, Request, Response, NextFunction } from 'express'
import * as service from './loans.service'
import { createLoanSchema, updateLoanStatusSchema } from '@agiota/shared'

export const loansRouter = Router()

loansRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loans = await service.listLoans(req.tenantId, {
      status: req.query.status as string,
      clientId: req.query.clientId as string,
      billingType: req.query.billingType as string,
    })
    res.json(loans)
  } catch (err) {
    next(err)
  }
})

loansRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loan = await service.getLoan(req.tenantId, req.params.id)
    if (!loan) return res.status(404).json({ error: 'Empréstimo não encontrado' })
    res.json(loan)
  } catch (err) {
    next(err)
  }
})

loansRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createLoanSchema.parse(req.body)
    const loan = await service.createLoan(req.tenantId, data)
    res.status(201).json(loan)
  } catch (err) {
    next(err)
  }
})

loansRouter.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = updateLoanStatusSchema.parse(req.body)
    const loan = await service.updateLoanStatus(req.tenantId, req.params.id, status)
    res.json(loan)
  } catch (err) {
    next(err)
  }
})

loansRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteLoan(req.tenantId, req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
