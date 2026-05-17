-- Peblo Notes — SQLite Database Schema
-- Generated from Prisma migration

CREATE TABLE "User" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "password"  TEXT NOT NULL,           -- bcrypt hashed
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Note" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "title"      TEXT NOT NULL,
    "content"    TEXT NOT NULL DEFAULT '',  -- HTML from Tiptap
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isPublic"   BOOLEAN NOT NULL DEFAULT false,
    "shareId"    TEXT,                      -- unique share token
    "userId"     TEXT NOT NULL,
    "aiSummary"  TEXT,
    "aiActions"  TEXT,                      -- JSON array string
    "aiTitle"    TEXT,
    "aiUsedAt"   DATETIME,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE TABLE "Tag" (
    "id"   TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- Many-to-many: Note <-> Tag
CREATE TABLE "_NoteToTag" (
    "A" TEXT NOT NULL,   -- Note.id
    "B" TEXT NOT NULL,   -- Tag.id
    FOREIGN KEY ("A") REFERENCES "Note" ("id") ON DELETE CASCADE,
    FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX "User_email_key"      ON "User"("email");
CREATE UNIQUE INDEX "Note_shareId_key"    ON "Note"("shareId");
CREATE UNIQUE INDEX "Tag_name_key"        ON "Tag"("name");
CREATE UNIQUE INDEX "_NoteToTag_AB_unique" ON "_NoteToTag"("A", "B");
CREATE INDEX "_NoteToTag_B_index"         ON "_NoteToTag"("B");
