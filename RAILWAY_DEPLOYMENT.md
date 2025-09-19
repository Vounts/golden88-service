# Railway Deployment Guide

This guide will help you deploy your Fastify auth API to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Railway CLI installed (optional but recommended)
3. Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Quick Deployment Steps

### 1. Create a New Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Choose "Deploy from GitHub repo" and select your repository
4. Railway will automatically detect your Node.js app and start building

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. The `DATABASE_URL` environment variable will be automatically set

### 3. Configure Environment Variables

Go to your app service → "Variables" tab and add these environment variables:

```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# JWT Configuration - Generate secure secrets
JWT_ACCESS_SECRET=your-super-secret-access-key-at-least-32-chars-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-chars-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15m

# CORS - Update with your frontend domain
CORS_ORIGIN=https://yourdomain.com
```

**Important:** Generate secure JWT secrets using:
```bash
openssl rand -base64 32
```

### 4. Run Database Migration

After your app is deployed:

1. Go to your app service → "Deploy" tab
2. Click on the latest deployment
3. Open the deployment logs/console
4. Run the migration command:
```bash
yarn railway:migrate
```

Or if Railway provides a built-in terminal, you can run it there.

### 5. Custom Domain (Optional)

1. Go to your app service → "Settings" tab
2. Scroll down to "Domains"
3. Click "Generate Domain" for a Railway subdomain
4. Or add your custom domain

## Alternative: Using Railway CLI

If you prefer using the CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up

# Add PostgreSQL
railway add postgresql

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_ACCESS_SECRET=your-secret-here
# ... add other variables

# Run migration
railway run yarn railway:migrate
```

## Environment Variables Reference

Copy the variables from `railway.env.example` to your Railway project's environment variables section.

## Database Configuration

Railway automatically provides:
- `DATABASE_URL`: Complete PostgreSQL connection string
- Individual database parameters (DB_HOST, DB_PORT, etc.) if needed

Your app is configured to use either `DATABASE_URL` or individual parameters.

## Build Configuration

The project includes:
- `nixpacks.toml`: Railway build configuration
- Build command: `yarn build`
- Start command: `yarn start`
- Node.js 20 runtime

## Health Check

Your app includes a health check endpoint at `/health` that Railway can use to monitor your service.

## Troubleshooting

### Build Issues
- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues
- Verify `DATABASE_URL` is set automatically by Railway
- Check if database migration was run successfully
- Ensure SSL is properly configured

### Environment Variables
- Double-check all required environment variables are set
- Ensure JWT secrets are at least 32 characters long
- Verify CORS_ORIGIN matches your frontend domain

### Logs
- Check deployment logs in Railway dashboard
- Use `railway logs` CLI command for real-time logs

## Production Checklist

- [ ] All environment variables configured
- [ ] JWT secrets are secure and unique
- [ ] Database migration completed successfully
- [ ] CORS_ORIGIN set to your actual domain
- [ ] Custom domain configured (if needed)
- [ ] Health check endpoint responding
- [ ] Rate limiting configured appropriately

## Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
