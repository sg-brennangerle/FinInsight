# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server with hot reload (runs both client and server)
- `npm run build` - Build production bundle (Vite build + esbuild server bundle)
- `npm run start` - Start production server (NODE_ENV=production)
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes using Drizzle Kit

## Architecture Overview

**FinInsight** is a financial analysis SaaS application built with a full-stack TypeScript architecture:

### Stack
- **Frontend**: React 18 + Vite, using Wouter for routing
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **AI Integration**: Google GenAI and OpenAI for financial narrative generation

### Project Structure
```
├── client/           # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route components (dashboard, upload, reports, analytics)
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and query client setup
├── server/           # Express.js backend
│   ├── services/     # Business logic (AI narrative, file processing, parsing)
│   ├── routes.ts     # API route definitions
│   └── index.ts      # Server entry point
├── shared/           # Shared types and database schema
│   └── schema.ts     # Drizzle schema definitions
└── migrations/       # Database migration files (generated)
```

### Core Functionality
The application processes financial data (P&L statements) uploaded as Excel/CSV files:

1. **File Upload & Processing**: Users upload financial files through `/upload` page
2. **Data Parsing**: `intelligentFileParser.ts` extracts financial metrics from spreadsheets
3. **AI Analysis**: `aiNarrative.ts` generates executive summaries and insights
4. **Reporting**: Multiple report types (executive summary, KPI analysis, trend analysis) with different audience levels
5. **Analytics Dashboard**: Visual representation of financial data using Recharts

### Database Schema
- `users` - User authentication and profiles
- `pl_files` - Uploaded financial files metadata
- `pl_data` - Extracted financial metrics (revenue, COGS, expenses, etc.)
- `reports` - Generated AI-powered financial reports

### Key Technologies
- **File Processing**: Multer for uploads, xlsx library for Excel parsing, csv-parser for CSV files
- **Authentication**: Passport.js with local strategy
- **WebSockets**: Real-time updates during file processing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Forms**: React Hook Form with Zod validation

### Development Notes
- The server runs on port specified by `PORT` environment variable (default 5000)
- Database connection requires `DATABASE_URL` environment variable
- Development mode enables Vite dev server integration
- File uploads are stored and processed asynchronously with status tracking