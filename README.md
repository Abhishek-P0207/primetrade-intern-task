A production-ready RESTful API built with Next.js, Prisma, PostgreSQL, and Redis for user authentication and task management with advanced caching and scalability features.

## Features

- **JWT Authentication** - Secure user registration and login
- **Task Management** - CRUD operations for tasks with status tracking
- **Admin User Management** - Complete user administration and monitoring
- **Redis Caching** - 80-90% faster response times with intelligent caching
- **Health Monitoring** - Built-in health checks and status endpoints
- **API Documentation** - Complete Swagger/OpenAPI specification

---

## Quick Start

### Prerequisites

- Node.js 22+
- PostgreSQL 16+
- Redis 7+ (optional, app works without it)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd primetrade-intern

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required environment variables:**
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/mydb?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
REDIS_URL="redis://localhost:6379"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

```

### 4. Start Development Server

```bash
# Start the application
npm run dev
```

The API will be available at `http://localhost:3000`
In the admin account, the admin dashboard will be available ar `http://localhost:3000/admin`

### 5. Verify Installation

```bash
# Check health
curl http://localhost:3000/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-02-04T12:00:00.000Z",
#   "services": {
#     "database": "healthy",
#     "redis": "healthy"
#   }
# }
```
