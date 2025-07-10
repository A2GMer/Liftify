# Liftify - Bench Press Workout Tracker

## Overview

Liftify is a modern full-stack web application designed for tracking bench press workouts. It features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database integration through Drizzle ORM. The application includes Replit authentication, multi-language support, and comprehensive workout analytics.

## System Architecture

### AWS Production Architecture
- **Frontend**: AWS Amplify with React TypeScript
- **Authentication**: AWS Cognito User Pool
- **Backend**: AWS Lambda with Node.js TypeScript
- **Database**: AWS RDS MySQL
- **API Gateway**: AWS API Gateway REST API
- **Build Tool**: Vite for development, AWS Amplify for production builds

### Development Architecture (Legacy)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store

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
- **Endel-inspired Landing Page**: Modern design highlighting three key strengths and chest training evidence

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
- July 08, 2025. Initial setup with Replit/PostgreSQL architecture
- July 08, 2025. Added AWS deployment architecture (Amplify/Cognito/Lambda/RDS)
- July 08, 2025. Fixed language persistence across page navigation
- July 08, 2025. Created AWS Lambda deployment package
- July 09, 2025. Fixed edit mode API endpoint to properly load existing workout data
- July 09, 2025. Redesigned landing page inspired by Endel's structure with three key strengths and chest training evidence
- July 09, 2025. Added hero section background video for enhanced visual appeal
- July 09, 2025. Implemented favicon system with multiple sizes and PWA manifest support
- July 09, 2025. Added white logo version for black backgrounds across all app pages
- July 09, 2025. Implemented automatic language detection from browser settings and timezone
- July 09, 2025. Added auto-population feature for new workouts using most recent workout data
- July 09, 2025. Implemented comprehensive UI minimization with logo size standardization
- July 09, 2025. Fixed 1RM calculation discrepancy by standardizing both home stats and chart to use same conversion table
- July 09, 2025. Added "効き重視" (form-focused) and "回数重視" (rep-focused) set options with option persistence
- July 09, 2025. Implemented complete Stripe subscription system with 3-tier pricing (Free/Pro/Ultimate)
- July 09, 2025. Added user profile menu in top-right corner with My Page, Plan Change, and Sign Out options
- July 09, 2025. Integrated Stripe product IDs for Pro (prod_SeC3r09HiUPQRm) and Ultimate (prod_SeC5sRCzptC9dB) plans
- July 09, 2025. Replaced increment/decrement buttons with tap zones for mobile optimization
- July 09, 2025. Implemented left-tap-decrease, right-tap-increase UI with subtle background +/- indicators
- July 09, 2025. Migrated Stripe product IDs to environment variables for better security and management
- July 09, 2025. Fixed Stripe API key configuration by swapping VITE_STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY values
- July 09, 2025. Implemented comprehensive subscription management with duplicate prevention system
- July 09, 2025. Added all three tiers (Free/Pro/Ultimate) to Subscribe page with proper plan status display
- July 09, 2025. Fixed Subscribe page infinite loading issue by optimizing plan checking logic
- July 09, 2025. Added comprehensive downgrade functionality with Stripe subscription cancellation
- July 09, 2025. Implemented payment validation to prevent subscription without payment info
- July 09, 2025. Added plan selection button validation and payment form scroll functionality
- July 09, 2025. Fixed Stripe payment redirect issue and URL parameter handling
- July 09, 2025. Fixed iframe navigation error by replacing window.location.href with window.location.assign
- July 09, 2025. Implemented Stripe webhook system to update user plans only after confirmed payment
- July 09, 2025. Enhanced subscription cancellation to require successful Stripe API response
- July 09, 2025. Removed onPlanChange prop chain and made plan change buttons navigate directly to subscribe page
- July 09, 2025. Implemented secure plan update system with proper authentication and payment verification
- July 09, 2025. Fixed critical 'db is not defined' error in plan update API by adding proper imports
- July 09, 2025. Enhanced webhook processing with detailed logging and error handling
- July 09, 2025. Resolved plan update failures by using storage methods instead of direct database calls
- July 09, 2025. Completed comprehensive payment processing debugging and validation system
- July 09, 2025. Implemented 1-month waiting period for subscription cancellation with automated expiration processing
- July 09, 2025. Added testing tools for simulating subscription expiration without waiting 30 days
- July 09, 2025. Removed testing tools after successful validation of automatic cancellation system
- July 09, 2025. Cleaned up production environment by removing test credit card information from subscribe page
- July 09, 2025. Updated subscription plan feature descriptions to match Landing page content across all languages
- July 09, 2025. Implemented comprehensive Free plan data retention limits with automatic 30-day deletion system
- July 09, 2025. Added Stripe environment separation system with test/production configuration switching
- July 09, 2025. Implemented comprehensive security measures: SQL injection prevention, XSS protection, input validation, rate limiting, and CORS configuration
- July 09, 2025. Added language-specific Stripe product ID management system for multi-language pricing support
- July 09, 2025. Implemented comprehensive language-specific pricing display system with dynamic currency formatting (¥500 JP, $2.99 EN, 2,99€ FR/DE)
- July 09, 2025. Added production language-specific Pro product IDs: JA (prod_SeFmbBUb4FV0a4), EN (prod_SeJg6G4ndBDDjH), FR/DE (prod_SeJhEW6uDfGDxb)
- July 10, 2025. Fixed timezone issue in RecordWorkout date/time initialization using local timezone instead of UTC
- July 10, 2025. Fixed monthlyGain statistic showing hardcoded "5kg" for new users - now calculates proper gain from workout data (0 for new users, actual comparison for users with historical data)
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```