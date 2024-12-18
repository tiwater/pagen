import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, code } = body;

    if (!id || !code) {
      return NextResponse.json({ error: 'Missing id or code' }, { status: 400 });
    }

    // Create the directory if it doesn't exist
    const previewDir = path.join(process.cwd(), 'app', 'p', id);
    fs.mkdirSync(previewDir, { recursive: true });

    // Write the component file
    const filePath = path.join(previewDir, 'page.tsx');
    fs.writeFileSync(filePath, code);

    return NextResponse.json({ success: true, url: `/p/${id}` });
  } catch (error) {
    console.error('Error creating preview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
