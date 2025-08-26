# Overview

Sudoku Master is a modern web-based Sudoku game built with React and Node.js. The application provides a complete gaming experience with multiple difficulty levels, progress tracking, user authentication, and game state persistence. Users can play as guests or create accounts to save their progress and compete with others.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with **React 18** using TypeScript and follows a component-based architecture:

- **Framework**: React with Vite as the build tool for fast development and optimized production builds
- **Routing**: Uses Wouter for lightweight client-side routing with authentication-based route protection
- **State Management**: React Query (@tanstack/react-query) for server state management and data fetching, with local React state for game-specific interactions
- **UI Components**: Extensive use of Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Form Handling**: React Hook Form with Zod for type-safe form validation

The application structure follows a feature-based organization with shared components, hooks, and utilities.

## Backend Architecture

The server is built with **Express.js** using TypeScript and follows RESTful API patterns:

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js with middleware for JSON parsing, CORS, and request logging
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Authentication**: OpenID Connect integration with Replit's authentication system using Passport.js
- **Session Management**: Express sessions with PostgreSQL store for persistence
- **Game Logic**: Custom Sudoku generation and validation algorithms with difficulty-based puzzle creation

## Data Storage

**PostgreSQL** database with Drizzle ORM for type-safe database operations:

- **ORM**: Drizzle ORM with Neon serverless PostgreSQL connector
- **Schema Management**: Code-first schema definition with automatic migrations
- **Tables**: 
  - Users table for authentication and profile data
  - Games table for puzzle state, progress tracking, and game history
  - Sessions table for authentication session persistence
- **Data Types**: JSON fields for storing complex game state (puzzles, solutions, move history)

## Authentication & Authorization

**Replit Authentication** integration with OpenID Connect:

- **Provider**: Replit's OAuth/OIDC service for seamless platform integration
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **User Management**: Automatic user creation and profile synchronization
- **Guest Mode**: Optional anonymous gameplay without authentication requirements

## Game Engine

Custom **Sudoku generation and validation system**:

- **Puzzle Generation**: Backtracking algorithm for creating valid, complete Sudoku grids
- **Difficulty Scaling**: Algorithmic cell removal based on difficulty level (easy, medium, hard, expert)
- **Validation**: Real-time move validation with conflict detection
- **Hint System**: Intelligent hint generation that provides valid moves
- **State Management**: Complete game state tracking including moves, time, mistakes, and completion status

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Support**: WebSocket constructor override for Neon serverless compatibility

## Authentication Services
- **Replit OIDC**: Integrated authentication using Replit's identity provider
- **OpenID Connect**: Standard OIDC flows for secure authentication

## Development Tools
- **Vite**: Frontend build tool with React plugin and runtime error overlay
- **Replit Integration**: Development environment optimizations and deployment tooling
- **TypeScript**: Full-stack type safety with shared schema definitions

## UI & Styling
- **Radix UI**: Accessible component primitives for dialogs, dropdowns, and form controls
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind

## Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **zod**: Runtime type validation and schema definition
- **react-hook-form**: Form state management with validation