# Liftify - Bench Press Workout Tracker

## Overview

Liftify is a modern full-stack web application designed for tracking bench press workouts. It features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database integration through Drizzle ORM. The application includes Replit authentication, multi-language support, and comprehensive workout analytics.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom design system and dark mode support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type sharing between frontend and backend
- **Migration Strategy**: Drizzle Kit for schema migrations
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Key Components

### Authentication System
- **Provider**: Replit OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions using `connect-pg-simple`
- **Middleware**: Custom authentication middleware for protected routes
- **User Management**: Automatic user creation and profile management

### Data Models
- **Users**: Profile information with Replit integration
- **Workouts**: Date-based workout sessions with notes
- **Sets**: Individual exercise sets with detailed tracking (weight, reps, power belt, butt up, assistance, failed status)
- **Sessions**: Authentication session storage

### Frontend Features
- **Multi-language Support**: i18n system supporting English, Japanese, French, and German
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Library**: Comprehensive UI components from shadcn/ui
- **Analytics Dashboard**: Charts and statistics for workout progress
- **Form Handling**: React Hook Form with Zod validation

### Backend API
- **RESTful Design**: Standard REST endpoints for CRUD operations
- **Protected Routes**: Authentication middleware on all user-specific endpoints
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Logging**: Request/response logging for API endpoints

## Data Flow

1. **Authentication Flow**:
   - User clicks "Get Started" → Redirects to Replit OAuth
   - Replit returns user info → Backend creates/updates user record
   - Session established → Frontend receives authentication status

2. **Workout Recording Flow**:
   - User fills workout form → Client-side validation with Zod
   - Form submission → API creates workout and associated sets
   - Database transaction → Success response with updated data
   - Client state update → UI reflects new workout

3. **Analytics Flow**:
   - Dashboard loads → Multiple API calls for stats and chart data
   - Backend aggregates data → Returns computed statistics
   - Frontend renders charts → Interactive visualizations with Chart.js

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI primitives
- **chart.js**: Data visualization for analytics

### Development Dependencies
- **Vite**: Development server and build tool
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast JavaScript bundling for production

### Authentication Dependencies
- **openid-client**: OpenID Connect client for Replit auth
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized React application to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Assets**: Static files served from Express in production

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Authentication**: Replit OAuth configuration
- **Sessions**: Secure session management with proper cookies

### Replit Integration
- **Development**: Hot reload with Vite development server
- **Authentication**: Seamless Replit user integration
- **Deployment**: Single-click deployment on Replit platform

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```