import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type { Metadata } from "next";
import { PebloLogo } from "@/components/ui/PebloLogo";

interface Props { params: Promise<{ shareId: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shareId } = await params;
  const note = await prisma.note.findFirst({ where: { shareId, isPublic: true } });
  return { title: note ? `${note.title} — Peblo Notes` : "Shared Note" };
}

export default async function SharedNotePage({ params }: Props) {
  const { shareId } = await params;
  const note = await prisma.note.findFirst({
    where: { shareId, isPublic: true },
    include: { tags: true, user: { select: { name: true } } },
  });
  if (!note) notFound();

  const actionItems: string[] = note.aiActions ? JSON.parse(note.aiActions) : [];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <PebloLogo size={28} />
        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>
          Public Note
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Title */}
        <h1 className="text-3xl font-semibold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>
          {note.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mb-5 text-sm" style={{ color: "var(--text-secondary)" }}>
          <span>{note.user?.name || "Anonymous"}</span>
          <span style={{ color: "var(--border-2)" }}>·</span>
          <span>{format(new Date(note.updatedAt), "MMMM d, yyyy")}</span>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {note.tags.map(tag => (
              <span key={tag.id} className="px-2 py-0.5 rounded-md text-xs font-medium border"
                style={{ background: "var(--accent-light)", color: "var(--accent)", borderColor: "var(--accent-mid)" }}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* AI Summary */}
        {note.aiSummary && (
          <div className="rounded-xl border p-4 mb-8"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: "var(--accent-light)" }}>
                <span className="text-xs" style={{ color: "var(--accent)" }}>✦</span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                AI Summary
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{note.aiSummary}</p>
            {actionItems.length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                  Action Items
                </p>
                <ul className="space-y-1.5">
                  {actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="ProseMirror" style={{ minHeight: "unset" }}
          dangerouslySetInnerHTML={{ __html: note.content || "<p><em>No content</em></p>" }}
        />

        {/* Footer */}
        <div className="mt-16 pt-6 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--border)" }}>
          <PebloLogo size={24} />
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Shared with Peblo Notes
          </p>
        </div>
      </main>
    </div>
  );
}
