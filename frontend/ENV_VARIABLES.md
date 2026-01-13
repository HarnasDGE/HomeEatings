# Environment Variables Configuration

This document describes the environment variables needed for the application to work properly.

## Required Variables

### Supabase Configuration

These variables are required for authentication and database features to work.

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to get these values:

1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Navigate to **Settings** > **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon/Public Key** → `VITE_SUPABASE_ANON_KEY`

## Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your values in `.env`

3. **Never commit `.env` to git!** (it's already in .gitignore)

## Production Deployment (Vercel)

### Option 1: Vercel Dashboard (Recommended)

1. Go to your project on Vercel
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable:
   - Key: `VITE_SUPABASE_URL`
   - Value: your Supabase URL
   - Environment: Select all (Production, Preview, Development)
4. Click **Save**
5. Redeploy your project

### Option 2: Vercel CLI

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` files to git
- Never share your environment variables publicly
- The `VITE_` prefix makes these variables available in the browser
- Only use the **anon/public key** from Supabase (never the service role key)

## Troubleshooting

If you see warnings about missing Supabase configuration:
1. Check that variables are set in Vercel Dashboard
2. Make sure variable names match exactly (case-sensitive)
3. Redeploy after adding variables
4. Check browser console for specific errors
