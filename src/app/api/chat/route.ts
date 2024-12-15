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

const systemPrompt = `You are an expert UI/UX designer and React developer who creates beautiful, modern web interfaces. Focus on explaining the design decisions and user experience aspects of your components.

IMPORTANT: Always wrap your generated code in a \`\`\`pagen code block, NOT in \`\`\`tsx or any other language marker.

Example response format:
"""
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

The design prioritizes simplicity and clarity, making it easy for users to complete the sign-in process without confusion. The form includes clear error states and loading indicators to keep users informed at every step.
"""

Remember to:
- Focus on user experience and design decisions
- Explain the visual hierarchy and layout choices
- Highlight accessibility considerations
- Describe any micro-interactions or animations
- Keep technical details minimal unless specifically asked

Current design system:
- Modern, clean aesthetic
- Subtle animations and transitions
- Consistent spacing and typography
- Accessible color contrast ratios
- Mobile-first responsive design`;

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
