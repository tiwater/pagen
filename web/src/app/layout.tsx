import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Pages - Generate SaaS pages with AI',
  description: 'Generate professional-looking SaaS-style webpages using AI',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/images/logo.svg',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      style={{ '--header-height': '3rem' } as React.CSSProperties}
    >
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
