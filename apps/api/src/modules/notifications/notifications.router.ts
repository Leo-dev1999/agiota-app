import { Router, Request, Response, NextFunction } from 'express'
import { getWhatsAppProvider } from './whatsapp.provider'

export const notificationsRouter = Router()

notificationsRouter.post('/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, message } = req.body as { phone: string; message: string }
    if (!phone || !message) {
      return res.status(400).json({ error: 'phone e message são obrigatórios' })
    }
    const provider = getWhatsAppProvider()
    await provider.sendMessage(phone, message ?? 'Teste de notificação do Agiota App! ✅')
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
