# Ciro Takip

Instagram reklamları üzerinden gelen bayiler için günlük ciro ve satış takip uygulaması.

## Teknoloji

- React + Vite
- Neon DB (PostgreSQL)
- Vercel (hosting + serverless functions)

## Kurulum

```bash
npm install
cp .env.example .env.local
# .env.local içine DATABASE_URL ekle
npm run dev
```

## Deploy

1. GitHub reposunu Vercel'e bağla
2. Vercel dashboard → Settings → Environment Variables → `DATABASE_URL` ekle
3. Deploy
