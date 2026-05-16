"use client";
import { useEffect, useState } from "react";
import { api, Note } from "@/lib/api";
import TopNavbar from "@/components/TopNavbar";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { NotesGridSkeleton } from "@/components/ui/LoadingSkeleton";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SharedPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.notes.list({})
      .then(({ notes }) => setNotes(notes.filter(n => n.isPublic)))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Shared Notes" />
      <div className="flex-1 overflow-y-auto px-6 py-4 fade-up">
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          {loading ? "Loading..." : `${notes.length} publicly shared note${notes.length !== 1 ? "s" : ""}`}
        </p>
        {loading ? <NotesGridSkeleton /> : notes.length === 0 ? (
          <EmptyState icon={Share2} title="No shared notes"
            description="Share a note to make it publicly accessible via a link." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => <NoteCard key={note.id} note={note} />)}
          </div>
        )}
      </div>
    </div>
  );
}
