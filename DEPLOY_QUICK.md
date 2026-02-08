# 🚀 Quick Deploy Script

## Deploy to Vercel (Frontend) in 5 minutes

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy frontend
cd /home/admin/.openclaw/workspace/solana-ai-city/frontend
vercel

# 4. Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? solana-ai-city
# - Directory? ./
# - Want to modify settings? No (vercel.json handles it)

# 5. Done! Get your URL
```

## Deploy Backend to Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
cd /home/admin/.openclaw/workspace/solana-ai-city/backend
railway init

# 4. Set environment variables
railway variables set MONGODB_URI=your_mongodb_uri
railway variables set REDIS_URL=your_redis_url
railway variables set JWT_SECRET=your_jwt_secret
railway variables set STRIPE_SECRET_KEY=your_stripe_key

# 5. Deploy
railway up

# 6. Done! Get your URL
```

## One-Command Deploy (Frontend + Backend)

```bash
#!/bin/bash

echo "🚀 Deploying Solana AI City..."

# Frontend to Vercel
echo "📦 Deploying frontend to Vercel..."
cd frontend
vercel --token=$VERCEL_TOKEN --yes
echo "✅ Frontend deployed!"

# Backend to Railway
echo "⚙️ Deploying backend to Railway..."
cd ../backend
railway up --token=$RAILWAY_TOKEN
echo "✅ Backend deployed!"

echo ""
echo "🎉 Deployment complete!"
echo "📍 Frontend: Check Vercel dashboard"
echo "📍 Backend: Check Railway dashboard"
```

## Environment Variables

### Frontend (.env.local)
```
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_APP_TITLE=Solana AI City
```

### Backend (.env)
```
# Required
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=your_jwt_secret

# Optional (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

---

## 📊 Quick Deploy to Vercel (One Command)

```bash
# Deploy frontend only
cd /home/admin/.openclaw/workspace/solana-ai-city
npx vercel --prod --token=$VERCEL_TOKEN
```

## 🔗 Get Your Links

After deployment:

**Frontend URL**: https://solana-ai-city.vercel.app
**Backend API**: https://solana-ai-city-api.railway.app
**GraphQL**: https://solana-ai-city-api.railway.app/graphql
**Health**: https://solana-ai-city-api.railway.app/health

---

*Ready to deploy!*
*Last Updated: 2026-02-07*
