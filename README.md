# Peblo Notes — AI-Powered Collaborative Workspace

> Full Stack Developer Challenge Submission — Peblo / Eleven Group

A production-ready, full-stack notes application with AI-powered insights, real-time auto-save, PDF import, public sharing, and a productivity dashboard.

---

## Architecture Overview

```
peblo-notes/
├── src/
│   ├── app/
│   │   ├── api/                    # REST API (Next.js Route Handlers)
│   │   │   ├── auth/               # signup, login, me
│   │   │   ├── notes/              # CRUD + AI summary + PDF import
│   │   │   ├── shared/             # Public note access (no auth)
│   │   │   ├── insights/           # Dashboard analytics
│   │   │   ├── tags/               # Tag listing
│   │   │   └── ai/search/          # Gemini conversational search
│   │   ├── workspace/              # Protected app pages
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── notes/              # Notes list + editor
│   │   │   ├── insights/           # Analytics page
│   │   │   ├── archive/            # Archived notes
│   │   │   ├── shared/             # Public notes gallery
│   │   │   └── settings/           # Profile + API keys
│   │   ├── shared/[shareId]/       # Public read-only note page
│   │   ├── login/                  # Auth pages
│   │   └── signup/
│   ├── components/
│   │   ├── AppSidebar.tsx          # Collapsible sidebar with tags
│   │   ├── TopNavbar.tsx           # Header with theme toggle
│   │   ├── NoteCard.tsx            # Grid/list note card
│   │   ├── GeminiSearch.tsx        # Floating AI chat widget
│   │   ├── AnimatedBackground.tsx  # GPU-optimized mesh gradient
│   │   ├── ActivityChart.tsx       # Recharts bar + pie charts
│   │   └── ui/                     # shadcn/ui + custom components
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client (better-sqlite3 adapter)
│   │   ├── auth.ts                 # JWT + bcrypt helpers
│   │   ├── gemini.ts               # Gemini AI integration
│   │   └── api.ts                  # Frontend API client
│   └── store/
│       └── authStore.ts            # Zustand auth state (persisted)
├── prisma/
│   └── schema.prisma               # DB schema
└── scripts/
    └── init-db.js                  # DB initialisation script
```

### Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 16 (App Router) | Full-stack in one repo, RSC + API routes |
| Language | TypeScript | Type safety across frontend and backend |
| Database | SQLite + Prisma 7 | Zero-config local setup, swap-ready for PostgreSQL |
| Auth | JWT + bcryptjs | Stateless, secure, no external dependency |
| AI | Google Gemini 2.5 Flash | Fast, generous free tier, supports chat history |
| Editor | Tiptap (ProseMirror) | Rich text with markdown shortcuts |
| State | Zustand + localStorage | Lightweight, persistent auth |
| UI | Tailwind CSS + shadcn/ui | Utility-first, accessible components |
| Charts | Recharts | Lightweight, composable |
| Animations | Framer Motion + CSS | GPU-composited, respects prefers-reduced-motion |

---

## Setup Instructions

### 1. Clone and install

```bash
git clone https://github.com/Okd2006/Peblo-SAS.git
cd Peblo-SAS/peblo-notes
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key-min-32-chars"
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

### 3. Initialise the database

```bash
npm run db:init
```

This creates the SQLite database with all tables using `better-sqlite3` directly (Prisma 7 uses driver adapters).

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

Open http://localhost:3000

### 6. Run a production build

```bash
npm run build
npm run start
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Sign in, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/notes` | Yes | List notes (search, tag, sort, archived) |
| POST | `/api/notes` | Yes | Create note |
| GET | `/api/notes/:id` | Yes | Get single note |
| PATCH | `/api/notes/:id` | Yes | Update note (title, content, tags, archive, share) |
| DELETE | `/api/notes/:id` | Yes | Delete note |
| POST | `/api/notes/:id/generate-summary` | Yes | Generate AI insights |
| POST | `/api/notes/import-pdf` | Yes | Import PDF as note |
| GET | `/api/shared/:shareId` | No | Get public note |
| GET | `/api/insights` | Yes | Dashboard analytics |
| GET | `/api/tags` | Yes | List user's tags with counts |
| POST | `/api/ai/search` | No | Gemini conversational search with memory |

---

## Features

- **Authentication** — JWT signup/login, bcrypt password hashing, persistent sessions
- **Notes Workspace** — Tiptap rich text editor, 800ms debounced auto-save, tag management
- **AI Integration** — Gemini 2.5 Flash generates summaries, action items, title suggestions
- **AI Chat** — Floating Gemini search widget with full conversation memory
- **PDF Import** — Upload PDF files, text extracted and saved as notes
- **Search & Filtering** — Full-text search, tag filters, sort by date/title, grid/list view
- **Public Sharing** — Toggle note visibility, shareable link, clean public page
- **Productivity Dashboard** — Stats cards, weekly activity chart, tag distribution, recent notes
- **Dark/Light Mode** — Persisted theme with system preference detection
- **Animated Background** — GPU-optimised mesh gradient with cursor spotlight
- **Archive** — Archive/restore notes without deleting

---

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed, never exposed
  notes     Note[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Note {
  id         String    @id @default(cuid())
  title      String
  content    String    // HTML from Tiptap editor
  isArchived Boolean   @default(false)
  isPublic   Boolean   @default(false)
  shareId    String?   @unique  // auto-generated share token
  userId     String
  user       User      @relation(...)
  tags       Tag[]
  aiSummary  String?
  aiActions  String?   // JSON array of action items
  aiTitle    String?
  aiUsedAt   DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  notes Note[]
}
```

---

## Design Decisions

- **Monorepo (Next.js)** — Frontend and backend in one repo, one deploy, zero CORS config
- **SQLite for dev** — Zero setup; Prisma makes it trivial to swap to PostgreSQL for production by changing one line in `prisma.config.ts`
- **Debounced auto-save** — 800ms after last keystroke, no manual save button needed
- **Gemini chat history** — Full conversation passed on every request so the AI remembers context
- **AnimatedBackground** — All animations use `transform`/`opacity` only (compositor thread), never triggering layout or paint
- **pdf2json** — Pure Node.js PDF parser, no DOM dependency, works in Next.js server routes

---

## GitHub Repository

https://github.com/Okd2006/Peblo-SAS

---

Built for the Peblo Full Stack Developer Challenge.
