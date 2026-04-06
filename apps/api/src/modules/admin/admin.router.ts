import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as service from '../auth/auth.service'
import { prisma } from '../../lib/prisma'

export const adminRouter = Router()

// Listar todos os usuários
adminRouter.get('/users', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await service.listUsers()
    res.json(users)
  } catch (err) {
    next(err)
  }
})

// Criar usuário
const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  role: z.enum(['tenant', 'master']).default('tenant'),
  tenantId: z.string().optional(),
})

adminRouter.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createUserSchema.parse(req.body)
    const user = await service.createUser(data)
    res.status(201).json(user)
  } catch (err) {
    next(err)
  }
})

// Ativar/desativar usuário
adminRouter.patch('/users/:id/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await service.toggleUser(req.params.id)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

// Trocar senha
adminRouter.patch('/users/:id/password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = z.object({ password: z.string().min(4) }).parse(req.body)
    const user = await service.changePassword(req.params.id, password)
    res.json(user)
  } catch (err) {
    next(err)
  }
})

// Listar tenants
adminRouter.get('/tenants', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true, ownerName: true, phone: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json(tenants)
  } catch (err) {
    next(err)
  }
})
