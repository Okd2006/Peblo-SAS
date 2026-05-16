import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface HistoryMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function POST(req: NextRequest) {
  try {
    const { query, history } = await req.json() as {
      query: string;
      history?: HistoryMessage[];
    };

    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are a helpful AI assistant embedded in a notes app called Peblo Notes. " +
        "Answer questions concisely and helpfully. Use markdown formatting — bold, bullets, code blocks — where it improves clarity. " +
        "Keep responses focused and under 300 words unless the user explicitly asks for more detail.",
    });

    // Start a chat session with the full prior history for memory
    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(query);
    const answer = result.response.text().trim();

    return NextResponse.json({ answer });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Gemini search error:", msg);

    if (msg.includes("429") || msg.includes("Too Many Requests")) {
      return NextResponse.json(
        { answer: "⏳ Rate limit reached — wait a few seconds and try again." },
        { status: 200 }
      );
    }
    if (msg.includes("401") || msg.includes("403") || msg.includes("API_KEY")) {
      return NextResponse.json(
        { answer: "🔑 Invalid API key. Check your GEMINI_API_KEY in .env" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { answer: "Something went wrong. Please try again." },
      { status: 200 }
    );
  }
}
