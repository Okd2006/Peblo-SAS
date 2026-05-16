import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const payload = getAuthUser(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const archived = searchParams.get("archived") === "true";
  const sort = searchParams.get("sort") || "updatedAt";

  const notes = await prisma.note.findMany({
    where: {
      userId: payload.userId,
      isArchived: archived,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
        ],
      }),
      ...(tag && {
        tags: { some: { name: tag } },
      }),
    },
    include: { tags: true },
    orderBy: { [sort]: "desc" },
  });

  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const payload = getAuthUser(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, tags } = await req.json();

  const note = await prisma.note.create({
    data: {
      title: title || "Untitled",
      content: content || "",
      userId: payload.userId,
      tags: {
        connectOrCreate: (tags || []).map((name: string) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    include: { tags: true },
  });

  return NextResponse.json({ note }, { status: 201 });
}
