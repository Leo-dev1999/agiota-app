import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JWTPayload } from '../modules/auth/auth.service'

declare global {
  namespace Express {
    interface Request {
      user: JWTPayload
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}

export function masterOnly(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'master') {
    res.status(403).json({ message: 'Acesso restrito ao administrador' })
    return
  }
  next()
}
