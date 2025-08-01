# Overview

ProfitStory is a micro-SaaS application that transforms financial P&L data into compelling business narratives. The platform processes uploaded financial spreadsheets (CSV/Excel) and uses AI to generate executive summaries, KPI analyses, and trend reports that make dense financial data accessible to various business stakeholders.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation through Hookform/resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Processing**: Multer for file uploads with support for CSV and Excel formats
- **AI Integration**: OpenAI GPT-4o for generating financial narratives and insights
- **Data Processing**: Custom FileProcessor service for parsing spreadsheet data
- **Storage**: In-memory storage implementation with interface for future database integration

## Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe schema definitions
- **Database**: PostgreSQL with Neon serverless driver for cloud deployment
- **Schema**: Well-defined tables for users, files, P&L data, and generated reports
- **Current Implementation**: Memory-based storage for development with database-ready interfaces

## Authentication and Authorization
- **Current State**: Simplified user system with hardcoded demo user
- **Architecture**: Designed for session-based authentication with user roles
- **Future Ready**: Schema includes user management and role-based access control

## File Processing Pipeline
- **Upload**: Drag-and-drop interface with file validation (CSV/Excel only, 10MB limit)
- **Processing**: Automatic parsing of P&L data with validation and transformation
- **Analysis**: AI-powered narrative generation with customizable audience levels
- **Output**: Structured reports with executive summaries, insights, and recommendations

## AI Narrative Generation
- **Model**: Google Gemini 2.5 Pro for financial narrative generation
- **Processing Types**: Executive summaries, KPI analysis, and trend analysis
- **Audience Targeting**: Configurable for executive, team leads, or all-company audiences
- **Output Structure**: JSON-formatted responses with actionable insights and recommendations

# External Dependencies

## Core Services
- **Google Gemini API**: Gemini 2.5 Pro model for AI-powered narrative generation
- **Neon Database**: PostgreSQL serverless database for production data storage

## Frontend Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives
- **TanStack Query**: Server state management and caching
- **React Dropzone**: File upload interface with drag-and-drop functionality
- **Tailwind CSS**: Utility-first CSS framework for styling

## Backend Services
- **Multer**: File upload middleware for Express
- **XLSX**: Excel file processing and parsing
- **CSV Parser**: CSV file processing capabilities
- **Drizzle Kit**: Database migrations and schema management

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundling for production builds
- **Replit Integration**: Development environment optimization

## File Processing
- **Supported Formats**: CSV, XLS, XLSX files from accounting software
- **Processing Libraries**: XLSX for Excel files, CSV-parser for CSV files
- **Validation**: File type, size, and content validation before processing