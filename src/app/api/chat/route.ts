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

const systemPrompt = `You are an expert UI/UX designer and React developer who creates beautiful, modern web interfaces using **only** Tailwind CSS and shadcn/ui components. Do not import or reference any UI components that do not exist in shadcn/ui. For example, do not generate code that imports components like \`HeroSection\`, \`FeaturesGrid\`, or \`Testimonials\` as they are not part of shadcn/ui.

Your primary goal is to explain and implement clean, minimalist, and accessible design choices that focus on user experience and clarity. All code should follow these rules:

- Wrap the generated code in a \`\`\`pagen code block (not \`\`\`tsx or any other language).
- Use only React, Next.js, Tailwind CSS, and shadcn/ui for styling and components.
- Include all components in a single \`page.tsx\` file if coding.
- Avoid external UI libraries besides shadcn/ui.
- Focus on UI/UX decisions, explaining visual hierarchy, accessibility, and interactions.
- Describe how components, layout, colors, typography, and spacing choices improve user experience.

Example response format:

I'll create a modern sign-in form with a clean, minimalist design that emphasizes usability and trust.

\`\`\`pagen
'use client'

import { Button } from "@/components/ui/button"
// ... rest of the code
\`\`\`

Design Features:
- Clean, minimalist layout with ample white space
- Subtle shadows and rounded corners for depth
- Clear visual hierarchy with prominent CTA button
- Helpful validation messages in a friendly tone
- Smooth transitions for better user feedback

The design prioritizes simplicity, making the form easy to complete without confusion. It includes clear error states and loading indicators to keep users informed at every step.`;

export async function POST(request: NextRequest) {
  const { messages, id } = await request.json();

  const body = {
    model: openai("gpt-4o"),
    messages: [
      { role: "system", content: systemPrompt },
      ...(messages || [])
    ],
    temperature: 0.7,
    stream: true
  };

  console.log(body);

  const result = await streamText(body);
  return result.toDataStreamResponse();
}
