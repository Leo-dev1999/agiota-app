import './config/env'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import { env } from './config/env'
import { authMiddleware, masterOnly } from './middlewares/auth.middleware'
import { tenantMiddleware } from './middlewares/tenant.middleware'
import { errorMiddleware } from './middlewares/error.middleware'
import { authRouter } from './modules/auth/auth.router'
import { adminRouter } from './modules/admin/admin.router'
import { clientsRouter } from './modules/clients/clients.router'
import { loansRouter } from './modules/loans/loans.router'
import { paymentsRouter } from './modules/payments/payments.router'
import { dashboardRouter } from './modules/dashboard/dashboard.router'
import { notificationsRouter } from './modules/notifications/notifications.router'
import { settingsRouter } from './modules/settings/settings.router'
import { runPaymentCheckJob } from './jobs/payment-check.job'

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

// Rotas públicas
app.use('/api/v1/auth', authRouter)

// Rotas protegidas — todas exigem JWT
app.use('/api/v1', authMiddleware)

// Rotas do master (sem tenantMiddleware)
app.use('/api/v1/admin', masterOnly, adminRouter)

// Rotas de tenant — exigem tenantId no JWT
const tenantApi = express.Router()
tenantApi.use(tenantMiddleware)
tenantApi.use('/clients', clientsRouter)
tenantApi.use('/loans', loansRouter)
tenantApi.use('/payments', paymentsRouter)
tenantApi.use('/dashboard', dashboardRouter)
tenantApi.use('/notifications', notificationsRouter)
tenantApi.use('/settings', settingsRouter)

app.use('/api/v1', tenantApi)

app.use(errorMiddleware)

// Daily job at 08:00
cron.schedule('0 8 * * *', () => {
  runPaymentCheckJob().catch(console.error)
})

app.listen(env.PORT, () => {
  console.log(`API rodando em http://localhost:${env.PORT}`)
})
