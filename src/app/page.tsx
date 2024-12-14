import { WebpageGenerator } from "@/components/webpage-generator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <h1 className="mb-8 text-4xl font-bold tracking-tight">What can I help you ship?</h1>
      <div className="w-full max-w-3xl">
        <WebpageGenerator />
      </div>
      <footer className="mt-auto pt-8 text-sm text-muted-foreground">
        <nav className="flex gap-4">
          <a href="#" className="hover:text-foreground">Pricing</a>
          <a href="#" className="hover:text-foreground">Enterprise</a>
          <a href="#" className="hover:text-foreground">FAQ</a>
          <a href="#" className="hover:text-foreground">Legal</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Discord</a>
          <a href="#" className="hover:text-foreground">Vercel</a>
        </nav>
      </footer>
    </main>
  );
}
