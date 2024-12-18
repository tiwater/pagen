# Pagen - AI Page Generator

A monorepo containing applications and packages for generating professional-looking SaaS-style webpages using AI. Built with Next.js, TypeScript, shadcn/ui components, and the Vercel AI SDK.

## Features

- Generate webpages from natural language descriptions
- Real-time preview of generated webpages
- View and edit source code
- Live chat interface with AI
- Modern UI with shadcn/ui components
- Persistent chat history with Zustand
- Powered by OpenAI's GPT-4

## Project Structure

```
pagen/
├── apps/
│   ├── web/                    # Main web application
│   │   ├── app/               # Next.js app directory
│   │   ├── components/        # React components
│   │   ├── lib/              # Utility functions
│   │   └── store/            # State management
│   │
│   └── renderer/             # Preview/renderer application
│       ├── app/              # Next.js app directory
│       ├── components/       # React components
│       └── lib/             # Utility functions
│
├── packages/
│   ├── ui/                   # Shared UI components
│   │   ├── components/      # shadcn/ui components
│   │   └── index.tsx       # Component exports
│   │
│   └── config/              # Shared configuration
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       └── prettier.config.js
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the example environment file and add your API keys:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

   Required environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `HELICONE_API_KEY`: Your Helicone API key (optional, for analytics)

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
- Vercel AI SDK
- OpenAI GPT-4
- Tailwind CSS
- Zustand for state management
- Turborepo for monorepo management
- pnpm for package management

## Applications

### Web App (@pagen/web)
- Main application for webpage generation
- Chat interface with GPT-4
- Real-time preview of generated pages
- Code editing capabilities

### Renderer (@pagen/renderer)
- Preview service for generated components
- Dynamic component rendering
- Isolated environment for previews

## Packages

### UI (@pagen/ui)
- Shared UI components using shadcn/ui
- Consistent design system across applications
- Pre-configured Tailwind CSS themes

### Config (@pagen/config)
- Shared configuration files
- Tailwind CSS configuration
- TypeScript configuration
- Prettier and PostCSS settings

## Development

### Adding a New Package
```bash
cd packages
mkdir my-package
cd my-package
pnpm init
```

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
