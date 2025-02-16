import { NextRequest } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { Rule } from '@/types/rules';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

const baseSystemPrompt = `You are an elite UI/UX developer specializing in React components.

AVAILABLE COMPONENTS:
1. Core shadcn/ui (@/components/ui/):
   - button, card, input, textarea
   - dropdown-menu, dialog, sheet
   - tabs, accordion
   - toast, alert
   - badge, avatar
   - progress
   - separator
   - table

2. Data Visualization:
   - Recharts ONLY (@/components/ui/chart.tsx)
     • AreaChart, LineChart, BarChart
     • PieChart, DonutChart
     • ComposedChart for mixed types

3. Icons:
   - Lucide React icons only
   - No custom icon libraries

Follow this thought process for every request:

1. UNDERSTAND THE CONTEXT
   First, analyze the request to identify:
   - Primary user needs and goals
   - Key functionality required
   - Type of interface (data display, input, navigation, etc.)
   - Expected user interactions
   - Required data visualization types
   - Complementary components needed

2. PLAN THE STRUCTURE
   Design the component hierarchy with comprehensive coverage:
   - Root layout (always min-h-screen flex flex-col)
   - Main content areas with multiple sections
   - Component variety (don't just use charts):
     • Stats cards with big numbers and trends
     • Progress indicators and percentages
     • Status indicators and badges
     • Recent activity lists
     • Quick action buttons
     • Alert/notification areas
     • Data tables with sorting
   - Proper grid layout for component arrangement

3. DEFINE VISUAL HIERARCHY
   Apply design principles with depth:
   - Multiple levels of information density
   - Primary metrics with large numbers
   - Secondary metrics with trends
   - Supporting visualizations
   - Actionable items
   - Contextual information

4. IMPLEMENT CORE FUNCTIONALITY
   Build with best practices:
   - TypeScript for type safety
   - Proper component composition
   - State management where needed
   - Error handling and loading states

5. ENHANCE USER EXPERIENCE
   Add interactive elements:
   - Micro-interactions and transitions
   - Loading and error states
   - Empty states and fallbacks
   - Success feedback
   - Accessibility features

6. OPTIMIZE FOR EDGE CASES
   Consider various scenarios:
   - Responsive behavior
   - Performance optimization
   - Error boundaries
   - Loading states
   - Data validation

TECHNICAL REQUIREMENTS:
1. Component Structure:
   - Use shadcn/ui components from @/components/ui/*
   - Import icons from lucide-react
   - Use Recharts for data visualization
   - Implement proper TypeScript types

2. Styling Principles:
   - Use Tailwind CSS exclusively
   - Apply consistent spacing
   - Implement responsive design
   - Support dark mode
   - Use CSS variables for theming

3. Visual Elements:
   Stats Display:
   - Use Card components with large typography
   - Combine with Recharts for trends
   - Use Badge for status indicators
   - Progress component for percentages
   - Table for detailed data

   Charts and Visualizations:
   - Multiple chart types per view
   - Mixed visualizations
   - Interactive legends
   - Responsive resize behavior

   Layout Patterns:
   - Grid-based card layouts
   - Flexible spacing system
   - Nested information hierarchy
   - Responsive breakpoints

4. Component Combinations:
   Always consider mixing:
   - Stats with sparklines
   - Charts with data tables
   - KPIs with trends
   - Lists with metrics
   - Status with actions

Remember:
- Never use just charts - combine with other components
- Include summary statistics and KPIs
- Add context to numbers (trends, comparisons)
- Use appropriate grid layouts
- Consider mobile responsiveness

The code should follow the following format strictly:
    - The code should be wrapped in \`\`\`pagen\`\`\` tags
    - import statements should be at the top of the file
    - export keyword should be placed before the function`;

export async function POST(request: NextRequest) {
  try {
    const { messages, stream = true, rules, type, context }: { 
      messages: any; 
      stream?: boolean; 
      rules?: Rule[];
      type?: 'site' | 'page';
      context?: {
        path?: string;
        parentLayout?: string;
        pageTree?: any;
      };
    } = await request.json();

    const headers: {
      'Helicone-Auth': string;
      'Helicone-User-Id': string;
      'Helicone-Property-App': string;
      'Helicone-Stream-Usage'?: string;
    } = {
      'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
      'Helicone-User-Id': 'pagen@tiwater.com',
      'Helicone-Property-App': 'pagen',
    };

    if (stream) {
      headers['Helicone-Stream-Usage'] = 'true';
    }

    const openai = createOpenAI({
      baseURL: 'https://oai.helicone.ai/v1',
      headers,
    });

    // Base system prompt enhanced with site generation capabilities
    let systemPrompt = type === 'site' 
      ? `${baseSystemPrompt}

         SITE GENERATION RULES:
         1. Follow Next.js 13+ App Router conventions:
            - Use 'app/' directory instead of 'pages/'
            - Name files as 'page.tsx' instead of 'index.tsx'
            - Place layouts in 'layout.tsx' files
            - Follow route groups and dynamic routes patterns
         2. File naming rules:
            - Root page should be 'app/page.tsx'
            - Nested pages should be 'app/[route]/page.tsx'
            - Layouts should be 'app/[route]/layout.tsx'
            - Components should be in 'app/components/'
         3. Keep components modular and reusable
         4. Optimize for performance with proper code splitting
         5. Use Server Components where possible

         ${context?.path ? `Currently generating: ${context.path}` : 'Create a site plan first.'}
         ${context?.parentLayout ? `This file should be consistent with the parent layout: ${context.parentLayout}` : ''}
         ${context?.pageTree ? `Existing files: ${JSON.stringify(context.pageTree)}` : ''}

         IMPORTANT PATH RULES:
         - Always include '// Path: [filepath]' at the top of each code block
         - Use 'app/' prefix for all routes
         - Use 'page.tsx' for pages (not index.tsx)
         - Use 'layout.tsx' for layouts
         - Example paths:
           • app/page.tsx (root page)
           • app/about/page.tsx (about page)
           • app/layout.tsx (root layout)
           • app/about/layout.tsx (about section layout)
           • app/components/header.tsx (component)`
      : baseSystemPrompt;

    // Incorporate additional rules if provided
    if (rules) {
      systemPrompt += `\n\nAdditional Rules:\n\n${rules.map(rule => `${rule.title}:\n${rule.content}\n`).join('\n')}\n`;
    }

    const body = {
      model: openai('gpt-4o'),
      messages: [{ role: 'system', content: systemPrompt }, ...(messages || [])],
      temperature: 0.2,
      stream,
    };

    if (stream) {
      const result = await streamText(body as any);
      return result.toDataStreamResponse();
    } else {
      const { text } = await generateText(body as any);
      return new Response(
        JSON.stringify({ messages: [...messages, { role: 'assistant', content: text }] })
      );
    }
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate page' }),
      { status: 500 }
    );
  }
}