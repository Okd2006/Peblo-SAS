# Peblo Notes — AI-Powered Collaborative Workspace

A full-stack notes application built for the Peblo Full Stack Developer Challenge. Features AI-generated summaries, real-time auto-save, tag-based organization, public sharing, and productivity insights.

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend + Backend | Next.js 14 (App Router) + TypeScript | Full-stack in one repo, RSC for shared pages |
| Database | SQLite via Prisma ORM | Zero-config local setup, easy to migrate to Postgres |
| Auth | JWT (bcryptjs + jsonwebtoken) | Stateless, simple, secure |
| AI | Google Gemini 1.5 Flash | Fast, generous free tier |
| Editor | Tiptap (ProseMirror) | Rich text with markdown-like shortcuts |
| State | Zustand + localStorage | Lightweight, persistent auth state |
| Styling | Tailwind CSS | Utility-first, dark theme |

---

## Architecture

```
peblo-notes/
├── prisma/
│   └── schema.prisma          # DB schema (User, Note, Tag)
├── src/
│   ├── app/
│   │   ├── api/               # REST API routes
│   │   │   ├── auth/          # signup, login, me
│   │   │   ├── notes/         # CRUD + AI summary
│   │   │   ├── shared/        # Public note access
│   │   │   ├── insights/      # Dashboard data
│   │   │   └── tags/          # Tag listing
│   │   ├── workspace/         # Protected app pages
│   │   │   ├── page.tsx       # Notes list
│   │   │   ├── notes/[id]/    # Note editor
│   │   │   ├── insights/      # Dashboard
│   │   │   └── archive/       # Archived notes
│   │   ├── shared/[shareId]/  # Public share page (no auth)
│   │   ├── login/
│   │   └── signup/
│   ├── components/
│   │   ├── Sidebar.tsx        # Navigation + tags
│   │   ├── NoteEditor.tsx     # Tiptap editor + AI panel
│   │   └── NoteList.tsx       # Note list with previews
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # JWT + bcrypt helpers
│   │   ├── gemini.ts          # Gemini AI integration
│   │   └── api.ts             # Frontend API client
│   └── store/
│       └── authStore.ts       # Zustand auth state
```

---

## Setup Instructions

### 1. Clone and install

```bash
git clone <repo-url>
cd peblo-notes
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Get a free Gemini API key at: https://aistudio.google.com/app/apikey

### 3. Set up the database

```bash
npm run db:init
```

This creates the SQLite database with all tables. (Prisma 7 uses driver adapters — `db:init` handles the schema setup via `better-sqlite3` directly.)

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/notes` | Yes | List notes (search, tag, sort) |
| POST | `/api/notes` | Yes | Create note |
| GET | `/api/notes/:id` | Yes | Get note |
| PATCH | `/api/notes/:id` | Yes | Update note |
| DELETE | `/api/notes/:id` | Yes | Delete note |
| POST | `/api/notes/:id/generate-summary` | Yes | Generate AI insights |
| GET | `/api/shared/:shareId` | No | Get public note |
| GET | `/api/insights` | Yes | Dashboard data |
| GET | `/api/tags` | Yes | List user's tags |

---

## Features

- **Authentication** — Signup/login with JWT sessions, bcrypt password hashing
- **Notes Workspace** — Rich text editor (Tiptap), auto-save (800ms debounce), tag management
- **AI Integration** — Gemini 1.5 Flash generates summaries, action items, and title suggestions
- **Search & Filtering** — Full-text search, tag filtering, sort by date/title
- **Public Sharing** — Toggle note visibility, shareable link, clean public page
- **Productivity Insights** — Stats, weekly activity chart, top tags, recently edited notes
- **Archive** — Archive/restore notes without deleting

---

## Sample API Responses

### POST /api/auth/login
```json
{
  "user": { "id": "clx...", "name": "John Doe", "email": "john@example.com" },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### POST /api/notes/:id/generate-summary
```json
{
  "insights": {
    "summary": "Weekly sprint planning covering UI mockups and API review.",
    "action_items": ["Prepare UI mockups", "Review API structure", "Schedule team sync"],
    "suggested_title": "Sprint 12 Planning Notes"
  }
}
```

### GET /api/insights
```json
{
  "totalNotes": 14,
  "archivedNotes": 2,
  "aiUsageCount": 6,
  "topTags": [{ "name": "work", "count": 5 }, { "name": "ideas", "count": 3 }],
  "weeklyActivity": [{ "date": "2026-05-08", "count": 2 }, ...],
  "recentNotes": [{ "id": "...", "title": "Sprint Planning", "updatedAt": "..." }]
}
```

---

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String   // bcrypt hashed
  notes     Note[]
}

model Note {
  id         String    @id @default(cuid())
  title      String
  content    String    // HTML from Tiptap
  isArchived Boolean   @default(false)
  isPublic   Boolean   @default(false)
  shareId    String?   @unique
  tags       Tag[]
  aiSummary  String?
  aiActions  String?   // JSON array
  aiTitle    String?
  aiUsedAt   DateTime?
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  notes Note[]
}
```

---

## Design Decisions

- **Monorepo (Next.js)** — Keeps frontend and backend in one place, simplifies deployment
- **SQLite for dev** — Zero setup, Prisma makes it trivial to swap to PostgreSQL for production
- **Debounced auto-save** — 800ms after last keystroke, no manual save button needed
- **Tiptap editor** — ProseMirror-based, supports markdown shortcuts, extensible
- **Gemini Flash** — Fastest Gemini model, ideal for real-time note analysis
- **Zustand + localStorage** — Persistent auth without a cookie/session server

---

Built with care for the Peblo Full Stack Developer Challenge.
