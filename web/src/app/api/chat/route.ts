import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText, streamText } from 'ai';
import { Rule } from '@/types/rules';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

type AIProvider = 'openai' | 'anthropic' | 'deepseek';
type ModelConfig = {
  provider: AIProvider;
  model: string;
  baseURL?: string;
  temperature?: number;
  modelFn: any;
};

const MODEL_CONFIGS: Record<string, ModelConfig> = {
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.2,
    modelFn: openai,
  },
  'claude-3.5-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    temperature: 0.2,
    modelFn: anthropic,
  },
  'deepseek-v3': {
    provider: 'deepseek',
    model: 'deepseek-chat',
    temperature: 0.2,
    modelFn: deepseek,
  },
};

const baseSystemPrompt = `You are an elite UI/UX developer specializing in React components.

IMPORTANT: When generating a website with multiple pages, if you can only generate a subset of pages due to token limits:
1. Generate the first 2-3 pages completely
2. End your response with the following marker:
   "[INCOMPLETE_GENERATION:remaining_pages=N]"
   where N is the number of pages that still need to be generated.
3. Example: If you outlined 5 pages but only generated 2, end with:
   "[INCOMPLETE_GENERATION:remaining_pages=3]"

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

   IMPORTANT: Component Usage Examples:
   1. Accordion:
   \`\`\`tsx
   import {
     Accordion,
     AccordionContent,
     AccordionItem,
     AccordionTrigger,
   } from "@/components/ui/accordion"

   // Correct usage:
   <Accordion type="single" collapsible>
     <AccordionItem value="item-1">
       <AccordionTrigger>Section 1</AccordionTrigger>
       <AccordionContent>Content for section 1</AccordionContent>
     </AccordionItem>
   </Accordion>

   // For mapping over items:
   <Accordion type="single" collapsible>
     {items.map((item) => (
       <AccordionItem key={item.id} value={item.id}>
         <AccordionTrigger>{item.title}</AccordionTrigger>
         <AccordionContent>{item.content}</AccordionContent>
       </AccordionItem>
     ))}
   </Accordion>
   \`\`\`

   2. Dialog:
   \`\`\`
   import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
   } from "@/components/ui/dialog"

   <Dialog>
     <DialogTrigger>Open</DialogTrigger>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Dialog Title</DialogTitle>
         <DialogDescription>Dialog Description</DialogDescription>
       </DialogHeader>
     </DialogContent>
   </Dialog>
   \`\`\`

   3. Dropdown Menu:
   \`\`\`
   import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuTrigger,
   } from "@/components/ui/dropdown-menu"

   <DropdownMenu>
     <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
     <DropdownMenuContent>
       <DropdownMenuItem>Item 1</DropdownMenuItem>
       <DropdownMenuItem>Item 2</DropdownMenuItem>
     </DropdownMenuContent>
   </DropdownMenu>
   \`\`\`

   IMPORTANT RULES:
   - Always use the exact import structure shown above
   - Never use dot notation (e.g., Accordion.Item) - use the imported components directly
   - Include all necessary sub-components in imports
   - Follow the exact component structure shown in examples
   - Use proper TypeScript props and types

2. Data Visualization:
   - Recharts ONLY (@/components/ui/chart.tsx)
     • AreaChart, LineChart, BarChart
     • PieChart, DonutChart
     • ComposedChart for mixed types

3. Icons:
   - Lucide React icons only (@lucide-icons/react)
   - No custom icon libraries

4. Layout Components:
   DO NOT use any custom components like Sidebar or Footer.
   Instead, build layouts using:
   - flex and grid with Tailwind CSS
   - shadcn/ui components listed above
   - Lucide icons for navigation items

MOCK DATA REQUIREMENTS:
1. IMPORTANT: All mock data MUST be defined within the component/page file:
   - DO NOT create separate mock data files
   - Define all required mock data at the top of the component, after imports
   - Each component should be self-contained with its own mock data
   - Use TypeScript types to define mock data structure

2. Always include realistic mock data:
   - Use meaningful sample data that represents real-world scenarios
   - Include enough entries to demonstrate UI patterns (at least 5-10 items for lists)
   - Vary data values to show different states and formats

3. Mock Data Examples:
   - User profiles: Include names, emails, avatars, roles, status
   - Statistics: Use realistic numbers with proper formatting
   - Charts: Provide time-series data spanning days/weeks
   - Tables: Fill with diverse entries showing all possible states
   - Activity feeds: Mix of different event types and timestamps
   - Status indicators: Show various states (active, pending, error)

4. Data Patterns:
   - Financial data: Use proper currency formatting
   - Dates: Recent dates relative to current time
   - Metrics: Include growth/decline indicators
   - Progress: Various completion percentages
   - Status: Mix of different states

5. Example Component with Mock Data:
   \`\`\`pagen
   'use client';
   
   import { Card } from '@/components/ui/card';
   import { AreaChart } from '@/components/ui/chart';
   
   // Define types for mock data
   type MetricData = {
     daily: {
       current: number;
       previous: number;
       trend: string;
     };
     weekly: {
       current: number;
       previous: number;
       trend: string;
     };
   };
   
   type ChartDataPoint = {
     date: string;
     value: number;
     trend: number;
   };
   
   // Define mock data within the component file
   const mockMetrics: MetricData = {
     daily: {
       current: 2847,
       previous: 2563,
       trend: '+11%',
     },
     weekly: {
       current: 17283,
       previous: 15976,
       trend: '+8.2%',
     },
   };
   
   const mockChartData: ChartDataPoint[] = Array.from({ length: 12 }, (_, i) => ({
     date: new Date(Date.now() - (11 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
     value: Math.floor(Math.random() * 1000) + 500,
     trend: Math.floor(Math.random() * 100) + 50,
   }));
   
   export default function MetricsCard() {
     return (
       <Card className="p-6">
         {/* Use mockMetrics and mockChartData here */}
       </Card>
     );
   }
   \`\`\`

6. Best Practices for Mock Data:
   - Define TypeScript types for all mock data structures
   - Keep mock data close to where it's used in the component
   - Use consistent data patterns across components
   - Include edge cases (long text, missing values)
   - Show loading states with skeleton loaders
   - Demonstrate error states
   - Use realistic value ranges

LAYOUT STRUCTURE:
When creating layout.tsx files:
1. Always use 'use client' directive
2. Import only from available components
3. Structure layouts using Tailwind CSS:
   - Use flex/grid for layout structure
   - Use min-h-screen for full height
   - Use proper padding/margin
4. Example layout structure:
   \`\`\`tsx
   'use client';
   
   import { ReactNode } from 'react';
   import { Button } from '@/components/ui/button';
   import { Home, Settings, User } from 'lucide-react';
   
   export default function Layout({ children }: { children: ReactNode }) {
     return (
       <div className="min-h-screen flex">
         {/* Navigation */}
         <nav className="w-64 border-r p-4">
           <div className="space-y-2">
             <Button variant="ghost" className="w-full justify-start">
               <Home className="mr-2 h-4 w-4" />
               Home
             </Button>
             <Button variant="ghost" className="w-full justify-start">
               <Settings className="mr-2 h-4 w-4" />
               Settings
             </Button>
           </div>
         </nav>
         
         {/* Main content */}
         <main className="flex-1 p-4">
           {children}
         </main>
       </div>
     );
   }
   \`\`\`

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
    const { 
      messages, 
      stream = true, 
      rules, 
      context,
      model = 'gpt-4o'
    } = await request.json();

    const modelConfig = MODEL_CONFIGS[model];
    if (!modelConfig) {
      throw new Error(`Unsupported model: ${model}`);
    }

    let systemPrompt = `${baseSystemPrompt}

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
       - Each generated file should have path as the first line comment of the file as: \`// Path: app/page.tsx\`
       - DO NOT create separate component files
    3. Keep code modular within pages and layouts
    4. Optimize for performance with proper code splitting
    5. All components must be client components

    ${context?.path ? `Currently generating: ${context.path}` : 'Create a site plan first.'}
    ${context?.parentLayout ? `This file should be consistent with the parent layout: ${context.parentLayout}` : ''}
    ${context?.pageTree ? `Existing files: ${JSON.stringify(context.pageTree)}` : ''}`;

    // Incorporate additional rules if provided
    if (rules) {
      systemPrompt += `\n\nAdditional Rules:\n\n${rules.map((rule: Rule) => `${rule.title}:\n${rule.content}\n`).join('\n')}\n`;
    }

    // Initialize the model with the correct configuration
    const modelInstance = modelConfig.modelFn(modelConfig.model);

    const body = {
      model: modelInstance,
      messages: [{ role: 'system', content: systemPrompt }, ...(messages || [])],
      temperature: modelConfig.temperature,
      stream,
    };

    console.log('stream params', body);

    if (stream) {
      const result = streamText(body as any);
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