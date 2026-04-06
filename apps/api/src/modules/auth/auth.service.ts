import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../../lib/prisma'
import { env } from '../../config/env'

export interface JWTPayload {
  userId: string
  role: string
  tenantId: string | null
  username: string
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) throw new Error('Usuário ou senha inválidos')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Usuário ou senha inválidos')

  if (!user.isActive) throw new Error('ACCOUNT_DISABLED')

  const payload: JWTPayload = {
    userId: user.id,
    role: user.role,
    tenantId: user.tenantId,
    username: user.username,
  }

  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' })
  return { token, user: payload }
}

export async function createUser(data: {
  username: string
  password: string
  role: string
  tenantId?: string
}) {
  const hash = await bcrypt.hash(data.password, 10)
  return prisma.user.create({
    data: {
      username: data.username,
      password: hash,
      role: data.role,
      tenantId: data.tenantId ?? null,
    },
    select: { id: true, username: true, role: true, tenantId: true, isActive: true, createdAt: true },
  })
}

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      tenantId: true,
      isActive: true,
      createdAt: true,
      tenant: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function toggleUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error('Usuário não encontrado')
  return prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: { id: true, username: true, isActive: true },
  })
}

export async function changePassword(id: string, newPassword: string) {
  const hash = await bcrypt.hash(newPassword, 10)
  return prisma.user.update({
    where: { id },
    data: { password: hash },
    select: { id: true, username: true },
  })
}
