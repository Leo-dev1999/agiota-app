import { prisma } from '../../lib/prisma'
import { CreateClientInput, UpdateClientInput } from '@agiota/shared'

export async function listClients(tenantId: string, search?: string) {
  return prisma.client.findMany({
    where: {
      tenantId,
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      loans: {
        where: { status: { not: 'QUITADO' } },
        select: { id: true, principal: true, status: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getClient(tenantId: string, id: string) {
  return prisma.client.findFirst({
    where: { id, tenantId },
    include: {
      loans: {
        include: {
          payments: { orderBy: { dueDate: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function createClient(tenantId: string, data: CreateClientInput) {
  return prisma.client.create({
    data: { ...data, tenantId },
  })
}

export async function updateClient(tenantId: string, id: string, data: UpdateClientInput) {
  return prisma.client.update({
    where: { id, tenantId },
    data,
  })
}

export async function deleteClient(tenantId: string, id: string) {
  return prisma.client.update({
    where: { id, tenantId },
    data: { isActive: false },
  })
}
