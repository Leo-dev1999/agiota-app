import { Router, Request, Response, NextFunction } from 'express'
import { getDashboardSummary } from './dashboard.service'

export const dashboardRouter = Router()

dashboardRouter.get('/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await getDashboardSummary(req.tenantId)
    res.json(summary)
  } catch (err) {
    next(err)
  }
})
