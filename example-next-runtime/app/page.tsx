import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Next.js Runtime Example</h1>
      <p>This is a minimal Next.js app running in WebContainer</p>
      <Image src="/images/logo.svg" width={96} height={96} alt="Logo" />
    </main>
  )
}
