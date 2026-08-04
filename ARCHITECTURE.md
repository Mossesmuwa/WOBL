# NovaHub - Current Architecture Guide

**Last Updated:** August 4, 2026  
**Version:** 2.2  
**Status:** Active development / engineering reference

---

## 1. SITE OVERVIEW & HOW IT WORKS

### Core Purpose

NovaHub is a monorepo platform for discovering, ranking, comparing, and managing content across multiple categories such as movies, games, apps, books, articles, and other media. The current implementation combines:

- a public Next.js web app for browsing and discovery,
- an admin dashboard for management and sync operations,
- and a shared package that powers authentication, database access, and the content pipeline.

### High-Level Architecture

```text
┌──────────────────────────────┐      ┌──────────────────────────────┐
│ Public Web App               │      │ Admin App                    │
│ - Browse / Search            │      │ - Dashboard                  │
│ - Trending / Compare        │      │ - Trigger syncs             │
│ - Item details              │      │ - Review pipeline data      │
│ - Account features          │      │ - Manage platform settings  │
└──────────────┬───────────────┘      └──────────────┬───────────────┘
               │                                      │
               └──────────────┬───────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Shared Package     │
                    │ - Auth             │
                    │ - Supabase clients │
                    │ - Items queries    │
                    │ - Sync pipeline    │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Supabase Database │
                    │ - items            │
                    │ - categories       │
                    │ - profiles        │
                    │ - favorites       │
                    └───────────────────┘
```

---

## 2. DETAILED FILE STRUCTURE

### Root Structure

```text
NovaHub/
├── apps/
│   ├── web/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── styles/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── jsconfig.json
│   │   └── package.json
│   └── admin/
│       ├── pages/
│       ├── components/
│       ├── next.config.js
│       ├── jsconfig.json
│       └── package.json
├── packages/
│   └── shared/
│       ├── lib/
│       ├── hooks/
│       ├── index.js
│       ├── package.json
│       └── types/
├── db/
├── package.json
├── turbo.json
├── ARCHITECTURE.md
└── CURRENT_APP_OVERVIEW.md
```

### Public Web App Structure

```text
apps/web/
├── pages/
│   ├── index.js                 # Homepage
│   ├── trending.js              # Trending page
│   ├── category.js              # Category browser
│   ├── search.js                # Search results page
│   ├── discover.js              # Discovery experience
│   ├── weekly.js                # Weekly digest view
│   ├── compare.js               # Compare page
│   ├── compare/
│   │   └── [item1]-vs-[item2].js
│   ├── item/
│   │   └── [slug].js            # Item detail page
│   ├── account/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── profile.js
│   │   ├── favorites.js
│   │   └── dashboard.js
│   ├── pro/
│   │   └── index.js
│   ├── api/
│   │   └── admin/
│   │       └── trigger.js       # Admin sync endpoint
│   ├── _app.js                  # App wrapper and global UI behavior
│   └── _document.js
├── components/
│   ├── Navbar.js
│   ├── Footer.js
│   ├── Layout.js
│   ├── Card.js
│   ├── SEO.js
│   ├── ScoreGauge.js
│   ├── ScoreBreakdown.js
│   ├── TrendAnalysis.js
│   ├── TrustBadge.js
│   ├── AuditTrail.js
│   ├── CompareButton.js
│   ├── AddToList.js
│   ├── NovaScore.js
│   └── TrailerPlayer.js
├── hooks/
│   ├── usePro.js
│   └── useScrollReveal.js
├── styles/
│   ├── style.css
│   ├── components.css
│   ├── variables.css
│   └── ai-interface.css
└── public/
    ├── robots.txt
    └── assets/
```

### Admin App Structure

```text
apps/admin/
├── pages/
│   ├── index.js
│   ├── dashboard.js            # Main admin dashboard
│   ├── trigger.js             # Manual trigger UI
│   ├── account/
│   │   └── login.js
│   └── _app.js
├── components/
│   ├── AdminLayout.js
│   ├── OverviewTab.js
│   ├── PipelineTab.js
│   ├── IntelligenceTab.js
│   ├── SecurityTab.js
│   ├── BusinessTab.js
│   ├── SettingsTab.js
│   ├── UsersTab.js
│   ├── ControlCenterTab.js
│   └── NotificationsTab.js
└── package.json
```

### Shared Package Structure

```text
packages/shared/
├── lib/
│   ├── auth.js
│   ├── checkAuth.js
│   ├── comments.js
│   ├── cookies.js
│   ├── design.js
│   ├── email.js
│   ├── env.js
│   ├── favorites.js
│   ├── helpers.js
│   ├── items.js
│   ├── nova-pulse.js
│   ├── nova-score.js
│   ├── rateLimit.js
│   ├── search.js
│   ├── securityLogger.js
│   ├── stripe.js
│   ├── supabase.js
│   ├── supabaseAdmin.js
│   ├── supabaseClient.js
│   ├── SupabaseContext.js
│   ├── validation.js
│   ├── pipeline/
│   │   ├── SyncEngine.js
│   │   ├── BaseProvider.js
│   │   ├── AIService.js
│   │   ├── TMDBProvider.js
│   │   ├── ProductHuntProvider.js
│   │   ├── GitHubProvider.js
│   │   ├── HackerNewsProvider.js
│   │   ├── RedditProvider.js
│   │   ├── SteamProvider.js
│   │   ├── RAWGProvider.js
│   │   ├── BooksProvider.js
│   │   ├── OpenLibraryProvider.js
│   │   ├── ArxivProvider.js
│   │   ├── CoursesProvider.js
│   │   ├── DevToProvider.js
│   │   ├── YouTubeProvider.js
│   │   ├── SpotifyProvider.js
│   │   ├── NYTBooksProvider.js
│   │   ├── IGDBProvider.js
│   │   ├── OMDBEnricher.js
│   │   ├── WikipediaEnricher.js
│   │   ├── JustWatchEnricher.js
│   │   └── index.js
│   └── providers/
│       └── baseProvider.js
├── hooks/
│   └── usePro.js
├── index.js
├── package.json
└── types/
    └── index.js
```

---

## 3. HOW THE SITE WORKS

### User Journey

1. A visitor opens the homepage and sees featured or trending items.
2. They can browse categories, search for content, and compare items side-by-side.
3. Opening an item shows a detail view with metadata, score-related UI, and related content.
4. Users can also sign in, save favorites, and use account-based experiences.

### Admin Flow

1. An admin signs into the admin app.
2. The dashboard loads the management interface.
3. The trigger page allows manual sync operations.
4. The pipeline fetches provider data and stores it in the database.

### Data Flow

```text
External Providers
   ↓
Provider classes in shared/pipeline
   ↓
SyncEngine orchestrates fetch + transform
   ↓
Optional AI enrichment
   ↓
Supabase upsert / insert
   ↓
Web app reads data and renders UI
```

---

## 4. CORE SYSTEMS

### Authentication System

- File: packages/shared/lib/auth.js
- Purpose: login, registration, session handling, and OAuth helpers
- Admin verification: packages/shared/lib/checkAuth.js
- Flow:
  - public app login → user dashboard or profile experience
  - admin app login → admin dashboard
  - trigger endpoint → admin authorization check

### Item Query Layer

- File: packages/shared/lib/items.js
- Purpose: shared access for categories, search, trending, featured, related items, and recommendations
- It centralizes the read logic used by the web pages.

### Content Pipeline

- Main orchestrator: packages/shared/lib/pipeline/SyncEngine.js
- Providers: TMDB, Product Hunt, GitHub, Hacker News, Reddit, Steam, RAWG, Books, OpenLibrary, arXiv, DEV.to, YouTube, Spotify, and others
- Enrichers: OMDB, Wikipedia, JustWatch
- Admin-triggered syncs go through apps/web/pages/api/admin/trigger.js

### Category Rendering System

- File: packages/shared/lib/categoryRenderers.js
- Purpose: allow category-specific UI logic so different content types render the correct metadata and visual treatment

### Nova Score Logic

- File: packages/shared/lib/nova-score.js
- Purpose: compute a score-based intelligence view for each item
- This supports the ranking and trust experience in the UI

### Database Layer

- Main schema: db/schema.sql
- Supporting migrations:
  - db/002_add_embeddings.sql
  - db/003_fix_rls_policies.sql
- Supabase is the primary backend store for approved items, profiles, favorites, and related records.

---

## 5. SECURITY ARCHITECTURE

### Implemented Measures

1. Authentication and authorization
   - Supabase session-based auth
   - admin checks via shared auth helpers
   - protected routes for admin operations

2. Database security
   - row-level security policies in the SQL migrations
   - service-role access used only on server-side paths

3. API security
   - admin sync endpoint validates auth and permissions
   - sensitive operations should only be triggered with proper credentials

4. Code and deployment safety
   - environment variables for local and production setup
   - secrets kept out of the repository
   - static assets and UI are served through the app runtime

---

## 6. DEPENDENCIES & TECHNOLOGY STACK

### Runtime and Framework

- Next.js 16.2.4
- React 18.2.0
- React DOM 18.2.0
- Turbo for monorepo orchestration

### Data and Auth

- Supabase for database access and authentication
- Shared package for cross-app business logic

### External Integrations

- TMDB
- Product Hunt
- GitHub
- Hacker News
- Google Books / OpenLibrary
- Steam
- RAWG
- arXiv
- Reddit
- DEV.to
- YouTube
- Spotify

---

## 7. DEVELOPMENT COMMANDS

### Install dependencies

```bash
npm install
```

### Run the public app

```bash
npm run dev:web
```

### Run the admin app

```bash
npm run dev:admin
```

### Run both together

```bash
npm run dev
```

### Build the workspace

```bash
npm run build
```

---

## 8. DEPLOYMENT & ENVIRONMENT

### Local Development

- Web app: http://localhost:3000
- Admin app: http://localhost:3002

### Environment Variables

Expected values include:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_WEB_APP_URL
- NEXT_PUBLIC_ADMIN_URL

### Deployment Notes

- The app is designed to run as a Vercel-friendly Next.js monorepo.
- The public web app and admin app are separate app entry points but share the same monorepo package layer.

---

## 9. DATABASE SCHEMA (QUICK REFERENCE)

### Main Tables

- items — main content records
- categories — content type definitions
- profiles — user and admin profile data
- favorites — saved items per user
- provider_logs — sync history and diagnostics
- audit_log — security and administrative events

### Key Relationships

- items.category_id → categories.id
- favorites.item_id → items.id
- profiles.id → auth user identity

---

## 10. CURRENT STATUS

The project is currently a functioning Next.js monorepo with:

- a public discovery experience,
- an admin management interface,
- shared authentication and database logic,
- and a provider-driven content ingestion pipeline.

The current focus is keeping the shared data layer and sync pipeline reliable while the apps continue to render the content experience.
