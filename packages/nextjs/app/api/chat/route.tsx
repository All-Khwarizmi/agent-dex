import { Agent } from "./agent";
import { openai } from "@ai-sdk/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = new Agent(openai("gpt-4o"));

  return agent.streamResponse(messages).toDataStreamResponse();
}
