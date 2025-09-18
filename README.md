# Fastify Auth API

A production-ready, reusable TypeScript + Fastify REST authentication API with PostgreSQL. Clone and ship by only swapping the `.env` file.

## Features

- **🚀 Production Ready**: Optimized for performance with minimal dependencies
- **🔐 Secure Authentication**: JWT-based auth with access/refresh token rotation
- **🏗️ Clean Architecture**: DAL → Service → Controller pattern with SOLID principles
- **📝 Type Safe**: Full TypeScript coverage with Zod validation
- **🗄️ PostgreSQL**: Raw SQL with connection pooling, no ORM overhead
- **🔒 Security**: Rate limiting, CORS, password hashing with Argon2
- **📊 Structured Responses**: Uniform API response format across all endpoints
- **🚨 Error Handling**: Centralized error mapping with proper HTTP status codes

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Yarn (recommended) or npm

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd fastify-auth-api
   yarn install
   ```

2. **Set up environment:**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   # The app will automatically load .env file using dotenv
   ```

3. **Set up database:**

   ```bash
   # Create your PostgreSQL database
   createdb auth_db

   # Run migrations
   yarn migrate
   ```

4. **Generate JWT secrets:**

   ```bash
   # Generate secure secrets (32+ characters)
   openssl rand -base64 32  # For JWT_ACCESS_SECRET
   openssl rand -base64 32  # For JWT_REFRESH_SECRET
   ```

5. **Start the server:**

   ```bash
   # Development
   yarn dev

   # Production
   yarn build
   yarn start
   ```

## Environment Variables

Copy `env.example` to `.env` and configure:

| Variable                 | Description                          | Default       |
| ------------------------ | ------------------------------------ | ------------- |
| `NODE_ENV`               | Environment mode                     | `development` |
| `PORT`                   | Server port                          | `3000`        |
| `HOST`                   | Server host                          | `0.0.0.0`     |
| `DATABASE_URL`           | PostgreSQL connection string         | **Required**  |
| `JWT_ACCESS_SECRET`      | JWT access token secret (32+ chars)  | **Required**  |
| `JWT_REFRESH_SECRET`     | JWT refresh token secret (32+ chars) | **Required**  |
| `JWT_ACCESS_EXPIRES_IN`  | Access token expiration              | `15m`         |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration             | `7d`          |
| `RATE_LIMIT_MAX`         | Max requests per window              | `100`         |
| `RATE_LIMIT_WINDOW`      | Rate limit time window               | `15m`         |
| `CORS_ORIGIN`            | CORS allowed origins                 | `*`           |

## API Endpoints

All endpoints return a consistent response format:

```typescript
// Success Response
{
  "ok": true,
  "status": 200,
  "data": { ... }
}

// Error Response
{
  "ok": false,
  "status": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": { ... }
  }
}
```

### Health Check

- **GET** `/health` - System health and database connectivity

### Authentication

- **POST** `/auth/register`

  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

- **POST** `/auth/login`

  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

- **POST** `/auth/refresh`

  ```json
  {
    "refreshToken": "jwt_refresh_token"
  }
  ```

- **GET** `/auth/me` (Protected)
  - Requires: `Authorization: Bearer <access_token>`

## Scripts

### **Development:**

- `yarn dev` - Development with tsup watch mode (production-like build)
- `yarn dev:tsx` - Development with tsx (faster startup, less production-like)

### **Building:**

- `yarn build` - Build for production (optimized, minified, tree-shaken)
- `yarn build:dev` - Build for development (with source maps, type declarations)
- `yarn start` - Start production server

### **Database:**

- `yarn migrate` - Run database migrations (requires psql)
- `yarn migrate:node` - Run database migrations with Node.js

### **Testing:**

- `yarn test` - Run tests in watch mode
- `yarn test:run` - Run all tests once
- `yarn test:setup` - Set up test database
- `yarn test:ui` - Run tests with visual UI

### **Quality:**

- `yarn type-check` - TypeScript type checking

## Architecture

```
src/
├── config/          # Environment and database configuration
├── controllers/     # Request handlers
├── dal/            # Data Access Layer (database operations)
├── errors/         # Custom error classes
├── plugins/        # Fastify plugins and middleware
├── routes/         # Route definitions
├── schemas/        # Zod validation schemas
├── services/       # Business logic
├── types/          # TypeScript type definitions
└── utils/          # Utilities (JWT, crypto, responses)
```

## Security Features

- **Password Security**: Argon2 hashing with secure defaults
- **JWT Security**: Separate secrets for access/refresh tokens
- **Token Rotation**: Refresh tokens are rotated on each use
- **Rate Limiting**: Configurable request rate limiting
- **CORS Protection**: Configurable CORS origins
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Protection**: Parameterized queries

## Database Schema

### Users Table

- `id` (UUID, Primary Key)
- `email` (Unique, Not Null)
- `password_hash` (Text, Not Null)
- `created_at` (Timestamp)
- `updated_at` (Timestamp, Auto-updated)

### Refresh Tokens Table

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `token_hash` (Text, Not Null)
- `expires_at` (Timestamp, Not Null)
- `created_at` (Timestamp)

## Error Codes

| Code                    | Status | Description                            |
| ----------------------- | ------ | -------------------------------------- |
| `VALIDATION_ERROR`      | 400    | Invalid request data                   |
| `AUTHENTICATION_ERROR`  | 401    | Invalid credentials or token           |
| `AUTHORIZATION_ERROR`   | 403    | Insufficient permissions               |
| `NOT_FOUND`             | 404    | Resource not found                     |
| `CONFLICT`              | 409    | Resource conflict (e.g., email exists) |
| `RATE_LIMIT_EXCEEDED`   | 429    | Too many requests                      |
| `DATABASE_ERROR`        | 500    | Database operation failed              |
| `INTERNAL_SERVER_ERROR` | 500    | Unexpected server error                |

## Production Deployment

### **Render.com Deployment with Aiven Database**

1. **Set up Aiven PostgreSQL**:

   - Create account at [aiven.io](https://aiven.io)
   - Create PostgreSQL service (free tier available)
   - Get connection string from Aiven dashboard

2. **Push to GitHub/GitLab**

3. **Connect to Render**:

   - Use `render.yaml` for automatic setup
   - Render will auto-generate JWT secrets

4. **Set environment variables** in Render dashboard:

   - `DATABASE_URL` (your Aiven PostgreSQL connection string)
   - Optionally override auto-generated JWT secrets

5. **Deploy automatically** - Render will build and deploy on git push

### **Manual Deployment**

1. **Build the application:**

   ```bash
   yarn build
   ```

2. **Set production environment variables**

3. **Run database migrations:**

   ```bash
   yarn migrate:node
   ```

4. **Start the server:**
   ```bash
   NODE_ENV=production yarn start
   ```

### **Free Tier Optimizations**

The project is optimized for free tier deployments:

- **Small bundle size** (~0.6MB) for fast cold starts
- **Minimal memory usage** with connection pooling
- **Health checks** for uptime monitoring
- **Graceful shutdowns** for zero-downtime deployments

## Build Optimizations

The project uses **tsup** for fast, optimized builds:

### **Production Build (`yarn build`):**

- ✅ **Tree shaking** - Removes unused code
- ✅ **Minification** - Reduces bundle size
- ✅ **Dead code elimination** - Removes console.log and debugger statements
- ✅ **Bundling** - Single optimized file
- ✅ **Fast cold starts** - Optimized for serverless/container environments

### **Development Build (`yarn build:dev`):**

- ✅ **Source maps** - For debugging
- ✅ **Type declarations** - `.d.ts` files
- ✅ **Faster builds** - No minification
- ✅ **Preserved console.log** - For development debugging

### **Performance Benefits:**

- **~70% smaller bundle size** compared to `tsc`
- **~3x faster build times** compared to `tsc`
- **Faster cold starts** in production environments
- **Better tree shaking** than traditional TypeScript compilation

## License

MIT License - see LICENSE file for details.
