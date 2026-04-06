import 'dotenv/config'

export const env = {
  PORT: parseInt(process.env.PORT ?? '3000'),
  DATABASE_URL: process.env.DATABASE_URL ?? 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev_secret',
  DEFAULT_TENANT_ID: process.env.DEFAULT_TENANT_ID ?? 'default',
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL ?? 'http://localhost:8080',
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY ?? '',
  EVOLUTION_INSTANCE: process.env.EVOLUTION_INSTANCE ?? 'agiota',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
}
