import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;

  const note = await prisma.note.findFirst({
    where: { shareId, isPublic: true },
    include: {
      tags: true,
      user: { select: { name: true } },
    },
  });

  if (!note) return NextResponse.json({ error: "Note not found or not public" }, { status: 404 });

  return NextResponse.json({ note });
}
