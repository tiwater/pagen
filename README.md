# Pagen - AI Page Generator

A monorepo containing applications and packages for generating professional-looking SaaS-style webpages using AI. Built with Next.js, TypeScript, shadcn/ui components, and the Vercel AI SDK.

## Features

- Generate webpages from natural language descriptions
- Real-time preview of generated webpages
- View and edit source code
- Live chat interface with AI
- Modern UI with shadcn/ui components
- Persistent chat history with Zustand

## Project Structure

```
pagen/
├── web/                     # Main web application
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/               # Utility functions
│   └── store/             # State management
│
└── renderer/              # Preview/renderer application
    ├── app/              # Next.js app directory
    ├── components/       # React components
    └── lib/             # Utility functions
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the example environment file and add your API keys:
   ```bash
   cp web/.env.example web/.env.local
   ```

4. Start the development servers:
   ```bash
   # Start all applications
   pnpm dev

   # Start specific application
   pnpm --filter @pagen/web dev
   pnpm --filter @pagen/renderer dev
   ```

5. Open:
   - Web App: [http://localhost:1578](http://localhost:1578)
   - Renderer: [http://localhost:3345](http://localhost:3345)

## Technologies Used

- Next.js 15 (App Router)
- TypeScript
- shadcn/ui components
- Tailwind CSS
- Zustand for state management
- Turborepo for monorepo management
- pnpm for package management

## Applications

### Web App (@pagen/web)
- Main application for webpage generation
- Chat interface
- Real-time preview of generated pages
- Code editing capabilities

### Renderer (@pagen/renderer)
- Preview service for generated components
- Dynamic component rendering
- Isolated environment for previews

### Webshot
- Screenshot service for generated pages, based on browserless/chromium
- Read docs https://webshot.dustland.ai/docs

## Development

### Adding Dependencies
```bash
# Add to specific app/package
pnpm --filter @pagen/web add <package>

# Add to all apps/packages
pnpm add -w <package>
```

### Running Commands
```bash
# Run in all packages
pnpm build

# Run in specific package
pnpm --filter @pagen/web build
```

## Contributing

Feel free to open issues and pull requests for any improvements you'd like to add.

## License

MIT
