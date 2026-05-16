import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AIResult {
  summary: string;
  action_items: string[];
  suggested_title: string;
}

export async function generateNoteInsights(
  title: string,
  content: string
): Promise<AIResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Analyze the following note and provide:
1. A concise summary (2-3 sentences)
2. A list of action items (if any, max 5)
3. A suggested title (if the current title is generic or empty)

Note Title: ${title || "Untitled"}
Note Content: ${content.replace(/<[^>]*>/g, "") || "(empty)"}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "...",
  "action_items": ["...", "..."],
  "suggested_title": "..."
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response format");
    return JSON.parse(jsonMatch[0]) as AIResult;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("429") || msg.includes("Too Many Requests")) {
      throw new Error("Rate limited — wait a few seconds and try again");
    }
    throw error;
  }
}
