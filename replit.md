# Festive Wishes Application

## Overview

This is a full-stack React application that allows users to generate personalized festive wishes and upload photos to create a memory stack. The app features an interactive UI with cursor trails, drag-and-drop photo management, and a wish generator that creates magical personalized messages based on user input.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints for wishes and photo management
- **File Handling**: Multer middleware for image upload processing with file validation and storage
- **Development**: Hot module replacement with Vite integration for seamless development experience

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Shared schema definitions using Drizzle with Zod validation
- **Migrations**: Database migrations managed through Drizzle Kit
- **Development Storage**: In-memory storage implementation for development/testing environments

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: CORS enabled, JSON parsing middleware, and file upload restrictions

### External Dependencies
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **UI Framework**: Radix UI primitives for accessible component foundation
- **Animation**: Framer Motion for smooth animations and transitions
- **File Storage**: Local filesystem storage for uploaded images
- **Development Tools**: Replit-specific plugins for development environment integration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm** & **drizzle-kit**: Type-safe ORM and migration tools
- **@tanstack/react-query**: Server state management and data fetching
- **express**: Node.js web framework for API server
- **multer**: File upload handling middleware

### UI and Styling
- **@radix-ui/***: Complete set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **framer-motion**: Animation library for React

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production builds

### Additional Utilities
- **zod**: Schema validation library
- **date-fns**: Date manipulation utilities
- **wouter**: Minimalist routing for React
- **nanoid**: URL-safe unique ID generator