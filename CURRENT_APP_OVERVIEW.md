# NovaHub - Current App Overview

**Last Updated:** August 4, 2026  
**Status:** Active development / current-state reference

---

## 1. SITE OVERVIEW & HOW IT WORKS

### Core Purpose

NovaHub is a monorepo platform for discovering, ranking, comparing, and managing content across multiple categories such as movies, games, apps, books, articles, and other media. The product currently combines:

- a user-facing web experience,
- an admin control dashboard,
- and a shared content pipeline that pulls data from external providers and stores it in Supabase.

### Architecture

```text
USER FLOW:
┌─────────────────────────────────────────────────────────┐
│ Web App (Public)              Admin App (Management)   │
│ ├─ Browse / Search            ├─ Dashboard              │
│ ├─ Trending / Compare        ├─ Trigger syncs         │
│ ├─ Item details              └─ Monitor data flow      │
│ └─ Account features                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. FILE STRUCTURE & DEPENDENCIES

### Directory Tree

```text
NovaHub/
├── apps/
│   ├── web/                          # Public Next.js app
│   │   ├── pages/                   # Main routes and API endpoints
│   │   ├── components/              # UI components
│   │   ├── hooks/                   # Reusable hooks
│   │   ├── styles/                  # Global styling
│   │   └── package.json
│   └── admin/                       # Admin Next.js app
│       ├── pages/                   # Dashboard and admin routes
│       ├── components/              # Admin UI components
│       └── package.json
├── packages/
│   └── shared/                      # Shared logic for both apps
│       ├── lib/                     # Auth, data access, pipeline, and helpers
│       ├── hooks/                   # Shared hooks
│       └── package.json
├── db/                              # SQL schema and DB migration files
├── package.json                     # Root monorepo config
└── turbo.json                       # Turbo workspace orchestration
```

---

## 3. HOW THE SITE WORKS

### User Journey

1. A visitor lands on the homepage and sees featured or trending items.
2. They can browse categories, search for specific content, or compare items side-by-side.
3. Clicking an item opens a detail page with metadata, score information, and related content.
4. Users can also create accounts, save favorites, and use account-based features.

### Admin Flow

1. An admin logs into the admin app.
2. The dashboard shows platform-related information and management tools.
3. The trigger page allows manual provider syncs.
4. The sync process fetches external data, transforms it, and stores it in the database.

### Data Flow

```text
External Providers
   ↓
Provider classes in shared/pipeline
   ↓
SyncEngine orchestrates fetch + transform
   ↓
AI enrichment (optional)
   ↓
Supabase storage
   ↓
Web app reads data and renders UI
```

---

## 4. CORE SYSTEMS

### Frontend Layer

- The public web app is built with Next.js and renders pages under apps/web/pages.
- Components in apps/web/components handle the page UI, cards, navigation, score displays, and trust-related widgets.
- The admin app lives separately under apps/admin and provides management tools for content and platform operations.

### Shared Logic Layer

- packages/shared/lib/items.js handles core item queries such as search, categories, trending, featured items, and related items.
- packages/shared/lib/auth.js and packages/shared/lib/checkAuth.js manage authentication and admin checks.
- packages/shared/lib/supabase.js and packages/shared/lib/supabaseAdmin.js handle client and server database access.

### Content Pipeline

- The pipeline is centered around packages/shared/lib/pipeline/SyncEngine.js.
- Providers such as TMDB, GitHub, Reddit, Steam, RAWG, Books, and others fetch and normalize data.
- The sync engine can optionally enrich items with AI before inserting them into Supabase.
- Admin-triggered syncs are handled through apps/web/pages/api/admin/trigger.js.

### Database Layer

- The database structure is defined in db/schema.sql and the related SQL migration files.
- Supabase is used as the primary backend data store for approved items, user data, and content records.

---

## 5. MAJOR FILES TO KNOW

### Public App

- apps/web/pages/index.js — homepage experience
- apps/web/pages/\_app.js — app-wide wrapper and theme behavior
- apps/web/pages/search.js — search experience
- apps/web/pages/category.js — category browsing
- apps/web/pages/item/[slug].js — item detail page
- apps/web/pages/api/admin/trigger.js — admin sync endpoint

### Admin App

- apps/admin/pages/dashboard.js — admin dashboard entry page
- apps/admin/pages/trigger.js — provider sync UI

### Shared Package

- packages/shared/lib/items.js — main shared item data access layer
- packages/shared/lib/pipeline/SyncEngine.js — main sync orchestrator
- packages/shared/lib/supabase.js — client-side Supabase connection
- packages/shared/lib/supabaseAdmin.js — server-side Supabase connection
- packages/shared/lib/auth.js — authentication helpers


---

## 6. CURRENT STATUS

At the moment, the app is operating as a Next.js monorepo with:

- a public discovery web experience,
- an admin management interface,
- shared authentication and database logic,
- and a provider-driven ingestion pipeline for content.

The current focus is on keeping the shared data layer and sync pipeline reliable while the frontend continues to render the content through the public and admin apps.
