import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const openai = createOpenAI({
  baseURL: "https://oai.helicone.ai/v1",
  headers: {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
    "Helicone-User-Id": "pagen@tiwater.com",
    "Helicone-Property-App": "pagen",
    "Helicone-Stream-Usage": "true",
  },
});

export async function POST(request: NextRequest) {
  const {
    messages,
    model = "gpt-4o",
    temperature,
    top_p,
    frequency_penalty,
    presence_penalty,
  } = await request.json();

  let body = {
    model: openai(model),
    messages,
    temperature,
    topP: top_p,
    frequencyPenalty: frequency_penalty,
    presencePenalty: presence_penalty,
  };

  console.log("body: ", body);

  const result = await streamText(body);

  return result.toTextStreamResponse();
}
