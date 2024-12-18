import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const GENERATED_DIR = join(process.cwd(), 'src/generated')

export async function writeGeneratedFile(id: string, code: string) {
  // Ensure the generated directory exists
  await mkdir(GENERATED_DIR, { recursive: true })
  
  // Write the main component file at the root of generated dir
  const mainFilePath = join(GENERATED_DIR, `${id}.tsx`)
  
  // Process the code to use project-template components only for generated files
  const processedCode = `
// This is an auto-generated file. Do not edit directly.
import { ErrorBoundary } from 'react'

function ErrorFallback() {
  return (
    <div className="p-4">
      <div className="text-amber-500 mb-2">Error in generated component</div>
      <div className="text-sm text-gray-500">There may be syntax or import errors in the generated code.</div>
    </div>
  )
}

const GeneratedComponent = () => {
  try {
    ${code
      .replace(
        /from ["']@\/components\/ui\/(.*?)["']/g,
        'from "~template/components/ui/$1"'
      )
      .replace(
        /from ["']@\/lib\/(.*?)["']/g,
        'from "~template/lib/$1"'
      )}
  } catch (error) {
    console.error('Error in generated component:', error);
    return <ErrorFallback />;
  }
}

export default function SafeGeneratedComponent() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <GeneratedComponent />
    </ErrorBoundary>
  )
}`

  await writeFile(mainFilePath, processedCode)
  
  return `/preview/${id}`
}
