# Pages - Generate professional-looking SaaS-style webpages using AI

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

### Using Docker Compose (Recommended)

1. Clone the repository
2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your credentials:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `BROWSERLESS_URL`
   - `BROWSERLESS_TOKEN`

4. Build and start the services:

   ```bash
   # First-time build and start
   docker compose up --build

   # Subsequent starts
   docker compose up -d

   # View logs
   docker compose logs -f
   ```

5. Access the applications:
   - Web App: [http://localhost:1578](http://localhost:1578)
   - Renderer: [http://localhost:3000](http://localhost:3000)

### Local Development

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment file:

   ```bash
   cp web/.env.example web/.env.local
   ```

3. Start the development servers:

   ```bash
   # Start all applications
   pnpm dev

   # Start specific application
   pnpm --filter @pagen/web dev
   pnpm --filter @pagen/renderer dev
   ```

4. Open:
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
- Docker & Docker Compose for containerization

## Docker Commands

```bash
# View service status
docker compose ps

# Restart services
docker compose restart web
docker compose restart renderer

# View logs
docker compose logs -f web
docker compose logs -f renderer

# Stop services
docker compose down

# Rebuild services
docker compose build --no-cache
```

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
- Read docs https://pages-webshot.tisvc.com/docs

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
