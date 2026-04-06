import { Router, Request, Response, NextFunction } from 'express'
import * as service from './clients.service'
import { createClientSchema, updateClientSchema } from '@agiota/shared'

export const clientsRouter = Router()

clientsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await service.listClients(req.tenantId, req.query.search as string)
    res.json(clients)
  } catch (err) {
    next(err)
  }
})

clientsRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await service.getClient(req.tenantId, req.params.id)
    if (!client) return res.status(404).json({ error: 'Cliente não encontrado' })
    res.json(client)
  } catch (err) {
    next(err)
  }
})

clientsRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createClientSchema.parse(req.body)
    const client = await service.createClient(req.tenantId, data)
    res.status(201).json(client)
  } catch (err) {
    next(err)
  }
})

clientsRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateClientSchema.parse(req.body)
    const client = await service.updateClient(req.tenantId, req.params.id, data)
    res.json(client)
  } catch (err) {
    next(err)
  }
})

clientsRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.deleteClient(req.tenantId, req.params.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
})
