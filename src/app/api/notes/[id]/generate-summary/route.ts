import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { generateNoteInsights } from "@/lib/gemini";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = getAuthUser(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const note = await prisma.note.findFirst({
    where: { id, userId: payload.userId },
  });
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  try {
    const insights = await generateNoteInsights(note.title, note.content);

    const updated = await prisma.note.update({
      where: { id },
      data: {
        aiSummary: insights.summary,
        aiActions: JSON.stringify(insights.action_items),
        aiTitle: insights.suggested_title,
        aiUsedAt: new Date(),
      },
      include: { tags: true },
    });

    return NextResponse.json({
      note: updated,
      insights: {
        summary: insights.summary,
        action_items: insights.action_items,
        suggested_title: insights.suggested_title,
      },
    });
  } catch (error: unknown) {
    console.error("AI generation error:", error);

    // Detect rate limit
    const msg = error instanceof Error ? error.message : String(error);
    const isRateLimit = msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests");
    const isInvalidKey = msg.includes("400") || msg.includes("API_KEY") || msg.includes("invalid");

    if (isRateLimit) {
      return NextResponse.json(
        { error: "Rate limit reached. Wait a minute and try again." },
        { status: 429 }
      );
    }
    if (isInvalidKey) {
      return NextResponse.json(
        { error: "Invalid Gemini API key. Check your .env file." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
