import { Router, Request, Response, NextFunction } from 'express'
import * as service from './payments.service'
import { markAsPaidSchema } from '@agiota/shared'

export const paymentsRouter = Router()

paymentsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await service.listPayments(req.tenantId, {
      status: req.query.status as string,
      loanId: req.query.loanId as string,
    })
    res.json(payments)
  } catch (err) {
    next(err)
  }
})

paymentsRouter.get('/today', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await service.getTodayPayments(req.tenantId)
    res.json(payments)
  } catch (err) {
    next(err)
  }
})

paymentsRouter.get('/tomorrow', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await service.getTomorrowPayments(req.tenantId)
    res.json(payments)
  } catch (err) {
    next(err)
  }
})

paymentsRouter.get('/overdue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await service.getOverduePayments(req.tenantId)
    res.json(payments)
  } catch (err) {
    next(err)
  }
})

paymentsRouter.patch('/:id/pay', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = markAsPaidSchema.parse(req.body)
    const payment = await service.markAsPaid(req.params.id, req.tenantId, data)
    res.json(payment)
  } catch (err) {
    next(err)
  }
})
