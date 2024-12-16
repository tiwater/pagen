import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Next.js Runtime
            </h1>
            <p className="text-gray-400">
              Ready to render your components with style
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="text-xl font-semibold mb-2">Tailwind CSS</div>
              <p className="text-gray-400">Utility-first CSS framework for rapid UI development</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="text-xl font-semibold mb-2">Components</div>
              <p className="text-gray-400">Reusable UI components with consistent styling</p>
            </div>
          </div>

          {/* Button Examples */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center mb-6">Button Variants</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="default">Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Status Section */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
              System Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
