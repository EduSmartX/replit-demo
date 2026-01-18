# Replit Demo - React Frontend

A modern multi-role educational management application built with React, TypeScript, and a well-structured architecture. This application supports **Admin**, **Teacher**, and **Parent** roles with role-based navigation and features.

## 🏗️ Architecture

This project follows a **feature-based architecture** with clear separation of concerns:

- **`common/`** - Application-level shared components (forms, dialogs, layouts)
- **`core/`** - Infrastructure (contexts, config, API utilities)
- **`features/`** - Business logic organized by domain (auth, teachers, leave, etc.)
- **`modules/`** - Role-based UI/UX modules (admin, teacher, parent)
- **`ui/`** - shadcn/ui component library

📚 **See detailed architecture documentation:**
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture guide
- [STRUCTURE_MAP.md](./STRUCTURE_MAP.md) - Visual structure diagram  
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Quick import reference
- [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) - Migration guide
- [RESTRUCTURING_SUMMARY.md](./RESTRUCTURING_SUMMARY.md) - Restructuring summary

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components (Radix UI primitives)
- **TanStack Query** - Data fetching and state management
- **Wouter** - Lightweight routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Getting Started

### Prerequisites
- **Docker** and **Docker Compose** (recommended)
  - OR Node.js 18+ (for local development without Docker)
- Django backend running (see educard-backend-api)

## 🐳 Docker Setup (Recommended)

### 1. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and set your Django backend URL:
```env
VITE_API_BASE_URL=http://host.docker.internal:8000
```

> **Note**: Use `host.docker.internal` to access the host machine from Docker container on Windows/Mac. On Linux, use `172.17.0.1` or the host's IP.

### 2. Create Docker Network (First Time Only)

```bash
docker network create educard-network
```

### 3. Start Development Server

```bash
docker-compose up
```

The app will be available at `http://localhost:5000`

### 4. Stop the Server

```bash
docker-compose down
```

### Docker Commands

```bash
# Build and start
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Execute commands in container
docker-compose exec frontend npm install <package-name>

# Rebuild after dependency changes
docker-compose up --build
```

### Production with Docker

```bash
# Build production image
docker-compose -f docker-compose.prod.yml build

# Start production container
docker-compose -f docker-compose.prod.yml up -d
```

## 💻 Local Development (Without Docker)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your Django backend URL:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## API Configuration

The application uses a centralized API configuration in [`client/src/lib/api.ts`](client/src/lib/api.ts):

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Authentication**: JWT tokens stored in localStorage
- **Auto-refresh**: Automatically refreshes access tokens when they expire
- **Error handling**: Centralized error handling for all API requests

### API Endpoints

All endpoints are defined in [`client/src/lib/api.ts`](client/src/lib/api.ts):
- Authentication: `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/me/`
- Organizations: `/api/organizations/`
- Users: `/api/users/`

## Project Structure

```
client/
├── public/           # Static assets
└── src/
    ├── components/   # React components
    │   ├── auth/     # Authentication components
    │   └── ui/       # shadcn/ui components
    ├── context/      # React context providers
    ├── hooks/        # Custom React hooks
    ├── lib/          # Utility libraries
    │   ├── api.ts    # API configuration
    │   └── queryClient.ts
    ├── pages/        # Page components
    ├── App.tsx       # Root component
    └── main.tsx      # Entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Django backend API URL | `http://localhost:8000` |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check with TypeScript

## Django Backend

This frontend connects to a Django REST API backend. Ensure the backend is running and CORS is properly configured to allow requests from `http://localhost:5000`.

Backend repository: `educard-backend-api/`

## 🚀 Deployment

### Docker Deployment

1. **Build production image**:
```bash
docker build --target production -t educard-frontend:latest .
```

2. **Run container**:
```bash
docker run -d -p 5000:5000 \
  -e VITE_API_BASE_URL=https://api.yourdomain.com \
  --name educard-frontend \
  educard-frontend:latest
```

### Vercel Deployment

This project is configured for deployment on Vercel.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/replit-demo&branch=vercel-deploy)

#### Manual Deployment

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy to Vercel**:
```bash
# First deployment (sets up project)
vercel

# Production deployment
vercel --prod
```

4. **Environment Variables**:
   - The production API URL is pre-configured in `vercel.json`
   - Backend URL: `https://educard-backend-zgz9.onrender.com`
   - You can also set environment variables in the Vercel dashboard

#### Configuration Files

- **`vercel.json`**: Vercel configuration including build settings, environment variables, and routing
- **`.env.production`**: Production environment variables
- **`.vercelignore`**: Files to exclude from deployment

#### Vercel Dashboard Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your Git repository
3. Select the `vercel-deploy` branch
4. Environment variables are automatically loaded from `vercel.json`
5. Click "Deploy"

### Static Hosting Deployment

Build the application and deploy the `dist/` folder to:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

```bash
npm run build
# Deploy the dist/ folder
```

### Environment Variables for Production

Set `VITE_API_BASE_URL` to your production Django API URL:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run type checks: `npm run check`
4. Submit a pull request
