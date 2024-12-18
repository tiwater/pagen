import * as fs from 'fs';
import * as path from 'path';
import { PreviewClient } from './preview-client';

export default function PreviewPage({ params }: { params: { id: string } }) {
  try {
    // Read the component file
    const filePath = path.join(process.cwd(), 'app', 'p', params.id, 'page.tsx');
    if (!fs.existsSync(filePath)) {
      return <div className="p-4 text-red-500">Preview not found</div>;
    }

    const code = fs.readFileSync(filePath, 'utf-8');
    // Extract the component code from the file (skip the imports and 'use client')
    const componentCode = code.split('${code}')[1];
    
    return <PreviewClient code={componentCode} />;
  } catch (error) {
    console.error('Error rendering preview:', error);
    return <div className="p-4 text-red-500">Error rendering preview</div>;
  }
}
