import { env } from '../../config/env'

export interface WhatsAppProvider {
  sendMessage(to: string, message: string): Promise<void>
}

// Evolution API adapter
class EvolutionAPIProvider implements WhatsAppProvider {
  async sendMessage(to: string, message: string): Promise<void> {
    const url = `${env.EVOLUTION_API_URL}/message/sendText/${env.EVOLUTION_INSTANCE}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: env.EVOLUTION_API_KEY,
      },
      body: JSON.stringify({ number: to, text: message }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`WhatsApp send failed: ${res.status} ${body}`)
    }
  }
}

// No-op provider for when WhatsApp is disabled
class NoopProvider implements WhatsAppProvider {
  async sendMessage(to: string, message: string): Promise<void> {
    console.log(`[WhatsApp NOOP] To: ${to}\n${message}`)
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  if (env.EVOLUTION_API_KEY) {
    return new EvolutionAPIProvider()
  }
  return new NoopProvider()
}
