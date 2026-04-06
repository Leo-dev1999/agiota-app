# Como Rodar o Agiota App

## Requisitos
- Node.js 18+
- pnpm (`npm install -g pnpm`)

## Primeira Vez

```bash
# 1. Instalar dependências
pnpm install

# 2. Banco de dados (já feito, mas se precisar refazer)
cd apps/api
npx prisma migrate dev --name init --schema=./prisma/schema.prisma
npx tsx prisma/seed.ts
cd ../..
```

## Rodar o Sistema

```bash
# Na raiz do projeto — roda backend (porta 3000) + frontend (porta 5173) juntos
pnpm dev
```

Depois abra: **http://localhost:5173**

## Rodar Separado

```bash
# Só o backend
cd apps/api && npx tsx src/index.ts

# Só o frontend
cd apps/web && npx vite
```

## WhatsApp (Opcional)

1. Instale o Docker Desktop
2. Rode: `docker-compose up -d`
3. Vá em **Configurações** no app e configure a Evolution API
4. Escaneie o QR code

## Estrutura

```
agiota-app/
├── apps/
│   ├── api/          ← Backend Express (porta 3000)
│   └── web/          ← Frontend React (porta 5173)
└── packages/
    └── shared/       ← Tipos e cálculos compartilhados
```
