import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const payload = getAuthUser(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use require to avoid static analysis issues with pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const parsed = await pdfParse(buffer);

    const rawText: string = parsed.text || "";
    const title = file.name.replace(/\.pdf$/i, "");

    const content = rawText
      .split(/\n{2,}/)
      .map((p: string) => p.trim())
      .filter(Boolean)
      .map((p: string) => `<p>${p.replace(/\n/g, " ")}</p>`)
      .join("") || "<p>(Empty PDF)</p>";

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: payload.userId,
      },
      include: { tags: true },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("PDF import error:", error);
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
