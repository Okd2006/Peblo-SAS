import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getAuthUser(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = payload.userId;

  // Total notes
  const totalNotes = await prisma.note.count({ where: { userId, isArchived: false } });
  const archivedNotes = await prisma.note.count({ where: { userId, isArchived: true } });

  // Recently edited (last 5)
  const recentNotes = await prisma.note.findMany({
    where: { userId, isArchived: false },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, title: true, updatedAt: true },
  });

  // AI usage count
  const aiUsageCount = await prisma.note.count({
    where: { userId, aiUsedAt: { not: null } },
  });

  // Weekly activity (notes created/updated in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const weeklyNotes = await prisma.note.findMany({
    where: { userId, updatedAt: { gte: sevenDaysAgo } },
    select: { updatedAt: true },
  });

  // Build daily activity map
  const activityMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    activityMap[d.toISOString().split("T")[0]] = 0;
  }
  weeklyNotes.forEach((n) => {
    const day = n.updatedAt.toISOString().split("T")[0];
    if (activityMap[day] !== undefined) activityMap[day]++;
  });

  // Most used tags
  const allNotes = await prisma.note.findMany({
    where: { userId },
    include: { tags: true },
  });
  const tagCount: Record<string, number> = {};
  allNotes.forEach((note) => {
    note.tags.forEach((tag) => {
      tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  return NextResponse.json({
    totalNotes,
    archivedNotes,
    recentNotes,
    aiUsageCount,
    weeklyActivity: Object.entries(activityMap).map(([date, count]) => ({ date, count })),
    topTags,
  });
}
