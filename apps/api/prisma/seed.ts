import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Tenant padrão (dados existentes)
  const tenant = await prisma.tenant.upsert({
    where: { phone: '00000000000' },
    update: {},
    create: {
      id: 'default',
      name: 'Meus Empréstimos',
      ownerName: 'Leonardo',
      phone: '00000000000',
      settings: {
        create: {
          defaultInterestRate: 30,
          whatsappEnabled: false,
          notifyDayBefore: true,
          notifyOnDueDate: true,
        },
      },
    },
  })

  console.log(`Tenant: ${tenant.name} (${tenant.id})`)

  // Usuário master — gerencia perfis, sem acesso a dados de tenant
  const masterHash = await bcrypt.hash('master@2026', 10)
  const master = await prisma.user.upsert({
    where: { username: 'master' },
    update: {},
    create: {
      username: 'master',
      password: masterHash,
      role: 'master',
      tenantId: null,
    },
  })
  console.log(`Usuário master criado: ${master.username}`)

  // Usuário Leo — acessa os dados do tenant default
  const leoHash = await bcrypt.hash('leo@2026', 10)
  const leo = await prisma.user.upsert({
    where: { username: 'leo' },
    update: {},
    create: {
      username: 'leo',
      password: leoHash,
      role: 'tenant',
      tenantId: tenant.id,
    },
  })
  console.log(`Usuário tenant criado: ${leo.username}`)

  console.log('\n=== CREDENCIAIS ===')
  console.log('Master  →  usuário: master   | senha: master@2026')
  console.log('Leo     →  usuário: leo      | senha: leo@2026')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
