# Vercel Deployment Guide

This guide will help you deploy the EduCard Frontend to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Git repository pushed to GitHub, GitLab, or Bitbucket
- Backend API running at: `https://educard-backend-zgz9.onrender.com`

## Configuration Overview

The project is pre-configured for Vercel deployment with the following files:

- **`vercel.json`**: Main configuration file
- **`.env.production`**: Production environment variables
- **`.vercelignore`**: Files excluded from deployment

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push code to Git repository**:
   ```bash
   git checkout vercel-deploy
   git push origin vercel-deploy
   ```

2. **Import Project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Select the `vercel-deploy` branch

3. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist/public` (auto-detected from vercel.json)

4. **Environment Variables** (Optional - already in vercel.json):
   ```
   VITE_API_BASE_URL=https://educard-backend-zgz9.onrender.com
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Preview**:
   ```bash
   vercel
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Configuration Details

### Build Settings (from vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install"
}
```

### Environment Variables

The API base URL is pre-configured in `vercel.json`:
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://educard-backend-zgz9.onrender.com"
  }
}
```

## Quick Commands Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Branch Information

- **Branch Name**: `vercel-deploy`
- **Purpose**: Production deployment to Vercel
- **Backend URL**: `https://educard-backend-zgz9.onrender.com`
