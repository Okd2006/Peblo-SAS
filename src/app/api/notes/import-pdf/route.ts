import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function extractTextFromPdf(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFParser = require("pdf2json");
    const parser = new PDFParser(null, 1); // 1 = raw text mode

    parser.on("pdfParser_dataError", (err: { parserError: Error }) => {
      reject(err.parserError);
    });

    parser.on("pdfParser_dataReady", () => {
      try {
        const raw: string = parser.getRawTextContent();
        resolve(raw);
      } catch (e) {
        reject(e);
      }
    });

    parser.parseBuffer(buffer);
  });
}

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

    const rawText = await extractTextFromPdf(buffer);
    const title = file.name.replace(/\.pdf$/i, "");

    // Clean up the text and convert to HTML paragraphs
    const content =
      rawText
        .split(/\n{2,}|\f/) // split on double newlines or form feeds (page breaks)
        .map((p: string) => p.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
        .filter((p: string) => p.length > 2)
        .map((p: string) => `<p>${p}</p>`)
        .join("") || "<p>(No extractable text in this PDF)</p>";

    const note = await prisma.note.create({
      data: { title, content, userId: payload.userId },
      include: { tags: true },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("PDF import error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    if (msg.includes("XRef") || msg.includes("Invalid") || msg.includes("corrupt")) {
      return NextResponse.json({ error: "This PDF appears to be corrupted or password-protected" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to parse PDF — try a different file" }, { status: 500 });
  }
}
