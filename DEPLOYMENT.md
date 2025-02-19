# Deployment Guide for Promptaat

This guide will walk you through deploying Promptaat to production using Vercel.

## Prerequisites

1. Create accounts on these services:
   - [Vercel](https://vercel.com) (for hosting)
   - [Railway](https://railway.app) (for PostgreSQL database)
   - [Resend](https://resend.com) (for email service)

## Step 1: Prepare Your Environment Variables

You'll need these environment variables in production:

```env
# Database
DATABASE_URL="postgresql://..."  # Get this from Railway

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-here"  # Generate with: openssl rand -base64 32

# Email Service
RESEND_API_KEY="re_..."  # Get this from Resend

# Application
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Step 2: Database Setup

1. Go to [Railway](https://railway.app)
2. Click "Start a New Project" → "Provision PostgreSQL"
3. Once created, go to "Connect" and copy the "Postgres Connection URL"
4. Save this URL, you'll need it for Vercel

## Step 3: Deploy to Vercel

1. Push your code to GitHub if you haven't already
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure your project:
   - Framework Preset: Next.js
   - Root Directory: ./promptaat
   - Build Command: next build
   - Install Command: npm install
   - Output Directory: .next

6. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from Step 1
   - Make sure DATABASE_URL points to your Railway database

7. Click "Deploy"

## Step 4: Configure Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure your DNS

## Step 5: Database Migration

After first deployment:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link your project:
```bash
vercel link
```

4. Pull environment variables:
```bash
vercel env pull .env.production.local
```

5. Run database migration:
```bash
npx prisma migrate deploy
```

## Step 6: Verify Deployment

1. Visit your deployed site
2. Test these features:
   - User registration
   - Email verification
   - Login/Logout
   - Admin dashboard
   - Email sending

## Monitoring and Maintenance

1. **Vercel Dashboard**
   - Monitor build logs
   - Check deployment status
   - View analytics

2. **Railway Dashboard**
   - Monitor database performance
   - Check database logs
   - Set up backups

3. **Resend Dashboard**
   - Monitor email delivery
   - Check email logs
   - Set up webhooks

## Troubleshooting

1. **Build Failures**
   - Check Vercel build logs
   - Verify environment variables
   - Check for missing dependencies

2. **Database Issues**
   - Verify DATABASE_URL is correct
   - Check Railway connection status
   - Verify migrations are applied

3. **Email Problems**
   - Check Resend dashboard
   - Verify RESEND_API_KEY
   - Check email logs in admin dashboard

## Security Checklist

✅ Environment variables are set
✅ Database is secure and backed up
✅ HTTPS is enabled
✅ Authentication is working
✅ Admin routes are protected
✅ Rate limiting is in place
✅ Email verification is working

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Railway Documentation: https://docs.railway.app
- Resend Documentation: https://resend.com/docs
- Next.js Documentation: https://nextjs.org/docs
