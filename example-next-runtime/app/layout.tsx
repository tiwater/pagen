export const metadata = {
  title: 'Next.js Runtime Example',
  description: 'A minimal Next.js app running in WebContainer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
