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

    // Create the directory in the app directory
    const previewDir = path.join(process.cwd(), 'app', 'p', id);
    fs.mkdirSync(previewDir, { recursive: true });

    // Write the component file with proper Next.js page structure
    const filePath = path.join(previewDir, 'page.tsx');
    const pageContent = `
'use client';
import React from 'react';

${code}
`;
    fs.writeFileSync(filePath, pageContent);

    return NextResponse.json({ success: true, url: `/p/${id}` });
  } catch (error) {
    console.error('Error creating preview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
