# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Twixxer is a React application built with React Router v7 using a server-side rendering (SSR) approach. The project uses Vite for bundling, TypeScript for type safety, TailwindCSS for styling, and PostgreSQL with DrizzleORM for database operations.

## Key Commands

### Development
```bash
# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env and provide a DATABASE_URL

# Generate database schema (after modifying database/schema.ts)
npm run db:generate

# Run database migrations
npm run db:migrate

# Start development server with HMR
npm run dev
```

### Building and Production
```bash
# Type-check the codebase
npm run typecheck

# Build for production
npm run build

# Start production server
npm run start
```

### Docker
```bash
# Build Docker image
docker build -t twixxer .

# Run Docker container
docker run -p 3000:3000 twixxer
```

## Architecture Overview

### Core Technologies
- **Frontend**: React 19, React Router v7
- **Backend**: Express, Node.js
- **Database**: PostgreSQL with DrizzleORM
- **Build Tools**: Vite, TypeScript
- **Styling**: TailwindCSS

### Key Directories and Files

#### Main Directories
- `app/`: Contains React components and client-side code
  - `routes/`: Route components and configurations
  - `welcome/`: Welcome page components and assets
- `database/`: Database schema and context
- `server/`: Express server setup and configuration
- `drizzle/`: Generated SQL migrations

#### Key Files
- `server.js`: Main server entry point, handles development and production mode
- `server/app.ts`: Express app setup and database connection
- `database/schema.ts`: DrizzleORM schema definitions
- `database/context.ts`: Database context provider using AsyncLocalStorage
- `app/root.tsx`: Root React component with layout and error handling
- `app/routes.ts`: Route configuration 
- `vite.config.ts`: Vite build configuration
- `drizzle.config.ts`: DrizzleORM configuration
- `react-router.config.ts`: React Router configuration

### Database Structure
The database uses DrizzleORM with PostgreSQL. The main table structure is defined in `database/schema.ts`. The context is managed through `database/context.ts` using AsyncLocalStorage to make the database connection available throughout the request context.

### Routing System
The application uses React Router v7 with the following pattern:
- Routes are defined in `app/routes.ts`
- Route components are in the `app/routes/` directory
- Each route component typically includes:
  - `loader` function for data fetching
  - `action` function for form submissions
  - React component for rendering

### Server-Side Rendering
The app uses server-side rendering with React Router's `createRequestHandler`. In development mode, it uses Vite's dev server with HMR. In production mode, it serves the built assets.

## TypeScript

The project uses TypeScript for type safety and better developer experience. All new code should be written in TypeScript with strict typings.

### React Router Type Generation

React Router v7 provides built-in type generation for route files using the following pattern:

```typescript
import type { Route } from "./+types/route-name";

export function loader({ request }: Route.LoaderArgs) {}

export function meta({}: Route.MetaArgs) {}

export async function action({ request }: Route.ActionArgs) {}
```