import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Next.js Runtime",
  description: "A runtime environment for rendering Next.js components",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}
