import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getAuthUser(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { userId: payload.userId },
    include: { tags: true },
  });

  const tagSet = new Map<string, number>();
  notes.forEach((note) => {
    note.tags.forEach((tag) => {
      tagSet.set(tag.name, (tagSet.get(tag.name) || 0) + 1);
    });
  });

  const tags = Array.from(tagSet.entries()).map(([name, count]) => ({ name, count }));
  return NextResponse.json({ tags });
}
