// app/api/analyze/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { buildSystemPrompt } from "@/lib/prompt";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { contractText } = await req.json();
  if (!contractText || contractText.length < 100)
    return new Response("Too short", { status: 400 });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [{ role: "user",
      content: `Analyze this contract:\n\n${contractText.slice(0,80000)}` }],
  });

  const readable = new ReadableStream({
    async start(ctrl) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta")
          ctrl.enqueue(new TextEncoder().encode(chunk.delta.text));
      }
      ctrl.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}