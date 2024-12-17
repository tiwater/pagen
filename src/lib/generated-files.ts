import { writeFile, mkdir, cp } from 'fs/promises'
import { join } from 'path'
import { generateNextProject } from './project-generator'

export const GENERATED_DIR = join(process.cwd(), 'src/generated')
export const PREVIEW_COMPONENTS_DIR = join(process.cwd(), 'src/components/preview')

export async function ensureUIComponents() {
  // Copy UI components to main components directory
  const templateUIDir = join(process.cwd(), 'src/project-template/components/ui')
  const mainUIDir = join(process.cwd(), 'src/components/ui')
  await mkdir(mainUIDir, { recursive: true })
  await cp(templateUIDir, mainUIDir, { recursive: true, force: true })

  // Copy lib files
  const libDir = join(process.cwd(), 'src/project-template/lib')
  await cp(libDir, join(process.cwd(), 'src/lib'), { recursive: true, force: true })
}

export async function writeGeneratedFile(id: string, code: string) {
  // Ensure the generated directory exists
  await mkdir(GENERATED_DIR, { recursive: true })
  
  // First write the main component file at the root of generated dir
  const mainFilePath = join(GENERATED_DIR, `${id}.tsx`)
  
  // Process the code to use preview components
  const processedCode = code
    .replace(
      /from ["']@\/components\/ui\/(.*?)["']/g,
      'from "@/components/preview/ui/$1"'
    )
    .replace(
      /from ["']@\/lib\/(.*?)["']/g,
      'from "@/lib/$1"'
    )
  
  await writeFile(mainFilePath, processedCode)
  
  // Ensure preview components directory exists
  await mkdir(join(PREVIEW_COMPONENTS_DIR, 'ui'), { recursive: true })
  
  // Copy UI components to preview directory
  const templateDir = join(process.cwd(), 'src/project-template/components/ui')
  await cp(templateDir, join(PREVIEW_COMPONENTS_DIR, 'ui'), { recursive: true, force: true })
  
  // Also ensure main app has UI components
  await ensureUIComponents()
  
  return `/preview/${id}`
}
