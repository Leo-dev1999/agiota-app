import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as service from './auth.service'

export const authRouter = Router()

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = loginSchema.parse(req.body)
    const result = await service.login(username, password)
    res.json(result)
  } catch (err: any) {
    if (err.message === 'ACCOUNT_DISABLED') {
      res.status(403).json({ message: 'Seu acesso está desativado por algum motivo, entre em contato com o operador master para mais informações' })
    } else if (err.message === 'Usuário ou senha inválidos') {
      res.status(401).json({ message: err.message })
    } else {
      next(err)
    }
  }
})
