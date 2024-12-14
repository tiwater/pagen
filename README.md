# Pagen - AI Page Generator

A Next.js application that generates professional-looking SaaS-style webpages using AI. Built with Next.js 14, TypeScript, shadcn/ui components, and the Vercel AI SDK.

## Features

- Generate webpages from natural language descriptions
- Real-time preview of generated webpages
- View and edit source code
- Download generated HTML
- Modern UI with shadcn/ui components
- Powered by OpenAI's GPT-4

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the example environment file and add your OpenAI API key:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

- Next.js 14
- TypeScript
- shadcn/ui components
- Vercel AI SDK
- OpenAI GPT-4
- Tailwind CSS

## Project Structure

```
pagen/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── textarea.tsx
│   │   └── webpage-generator.tsx
│   └── lib/
│       └── utils.ts
├── .env.example
├── package.json
└── tsconfig.json
