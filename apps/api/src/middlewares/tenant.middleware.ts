import { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface Request {
      tenantId: string
    }
  }
}

export function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  // tenantId vem do JWT (injetado pelo authMiddleware)
  const tenantId = req.user?.tenantId
  if (!tenantId) {
    res.status(403).json({ message: 'Sem tenant associado a este usuário' })
    return
  }
  req.tenantId = tenantId
  next()
}
