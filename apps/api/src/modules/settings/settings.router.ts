import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../../lib/prisma'

export const settingsRouter = Router()

settingsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: req.tenantId },
    })
    res.json(settings)
  } catch (err) {
    next(err)
  }
})

settingsRouter.patch('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.tenantSettings.update({
      where: { tenantId: req.tenantId },
      data: req.body,
    })
    res.json(settings)
  } catch (err) {
    next(err)
  }
})
