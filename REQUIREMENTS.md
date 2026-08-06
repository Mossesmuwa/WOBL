# Project Requirements

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your configuration
4. Run development server: `npm run dev`

## Environment Variables

See `.env.example` for all required and optional environment variables.

## Important Notes

- Never commit `.env.local` to version control
- `.env.example` should be kept in sync with actual environment variables
- Service secrets should only be stored locally or in CI/CD secrets
