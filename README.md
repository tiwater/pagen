# Pagen - AI Page Generator

A Next.js application that generates professional-looking SaaS-style webpages using AI. Built with Next.js 15, TypeScript, shadcn/ui components, and the Vercel AI SDK.

## Features

- Generate webpages from natural language descriptions
- Real-time preview of generated webpages
- View and edit source code
- Live chat interface with AI
- Modern UI with shadcn/ui components
- Persistent chat history with Zustand
- Powered by OpenAI's GPT-4

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the example environment file and add your API keys:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `HELICONE_API_KEY`: Your Helicone API key (optional, for analytics)

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

- Next.js 15 (App Router)
- TypeScript
- shadcn/ui components
- Vercel AI SDK
- OpenAI GPT-4
- Tailwind CSS
- Zustand for state management

## Project Structure

```
pagen/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts     # Chat API endpoint
│   │   │   └── generate/
│   │   │       └── route.ts     # Page generation endpoint
│   │   ├── chat/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # Chat interface page
│   │   ├── layout.tsx           # Root layout with Inter font
│   │   ├── page.tsx            # Homepage
│   │   └── providers.tsx       # App providers
│   ├── components/
│   │   ├── chat-ui.tsx         # Chat interface component
│   │   ├── preview-frame.tsx   # Generated page preview
│   │   └── webpage-generator.tsx # Page generation form
│   ├── store/
│   │   └── chat.ts            # Zustand store for chat state
│   └── lib/
│       └── utils.ts           # Utility functions
```

## Features in Detail

### Chat Interface
- Real-time streaming responses from GPT-4
- Code extraction and preview
- Persistent chat history
- Split view with preview pane

### Page Generation
- Natural language to webpage conversion
- Real-time preview
- Code view with syntax highlighting
- Multiple file support

### Page Screenshots

```bash
POST https://webshot.dustland.ai/screenshot
Content-Type: application/json

{
  "url": "https://www.tiwater.com",
  "options": {
    "fullPage": true
  }
}
```

Docs: https://webshot.dustland.ai/docs

## Contributing

Feel free to open issues and pull requests for any improvements you'd like to add.

## License

MIT
