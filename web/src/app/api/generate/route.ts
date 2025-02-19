'use server';

import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { Project, PageTreeNode } from '@/types/project';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:1578';
const RENDERER_URL = process.env.NEXT_PUBLIC_RENDERER_URL || 'http://localhost:3345';

async function generateAllPages(projectId: string, initialPrompt: string, model: string): Promise<PageTreeNode[]> {
  let allPages: PageTreeNode[] = [];
  let currentPrompt = initialPrompt;
  let continuationCount = 0;
  const MAX_CONTINUATIONS = 5; // Safety limit to prevent infinite loops

  while (continuationCount < MAX_CONTINUATIONS) {
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        messages: [
          {
            role: 'user',
            content: currentPrompt,
            id: nanoid(),
            createdAt: new Date()
          }
        ],
        stream: false,
        model,
        context: {
          path: null,
          pageTree: allPages
        }
      }),
    });

    if (!chatResponse.ok) {
      throw new Error('Failed to generate pages through chat API');
    }

    const response = await chatResponse.json();
    const lastMessage = response.messages[response.messages.length - 1];
    
    // Extract code blocks and create page tree nodes
    const codeBlockRegex = /```(?:pagen|tsx|jsx)?\n([\s\S]*?)```/g;
    const newPages: PageTreeNode[] = [];
    let match;

    while ((match = codeBlockRegex.exec(lastMessage.content)) !== null) {
      const blockContent = match[1].trim();
      const pathMatch = blockContent.match(/\/\/\s*Path:\s*(.+\.tsx)/);

      if (pathMatch) {
        const path = pathMatch[1].trim();
        const content = blockContent.replace(/\/\/\s*Path:\s*(.+\.tsx)(\r?\n)*/, '').trim();
        
        newPages.push({
          id: nanoid(),
          path,
          file: {
            id: nanoid(),
            name: path.split('/').pop() || '',
            content,
            metadata: {
              title: path,
            },
          },
        });
      }
    }

    allPages = [...allPages, ...newPages];

    // Check if the response indicates more pages need to be generated
    const needsContinuation = lastMessage.content.includes('[INCOMPLETE_GENERATION');

    if (!needsContinuation) {
      break;
    }

    // Prepare prompt for next iteration
    currentPrompt = "Please continue generating the remaining pages.";
    continuationCount++;
  }

  if (continuationCount >= MAX_CONTINUATIONS) {
    console.warn('Reached maximum continuation limit for page generation');
  }

  return allPages;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'gpt-4' } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    // Create a new project
    const projectId = nanoid();
    const project: Project = {
      id: projectId,
      title: prompt.split('\n')[0].slice(0, 50),
      description: prompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pageTree: [],
      userId: '1',
      chat: {
        projectId: projectId,
        messages: [],
      },
    };

    // Generate all pages with auto-continuation
    const pageTree = await generateAllPages(project.id, prompt, model);
    project.pageTree = pageTree;

    // Now that we have all pages, send them to the renderer
    const rendererResponse = await fetch(`${RENDERER_URL}/api/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: project.id,
        pageTree 
      }),
    });

    if (!rendererResponse.ok) {
      throw new Error('Failed to render site');
    }

    const { url: baseUrl } = await rendererResponse.json();

    // Take screenshots for each page
    for (const node of pageTree) {
      if (!node.file) continue;

      const urlPath = node.path
        .replace(/^app\//, '')
        .replace(/\/page\.tsx$/, '')
        .replace(/^page\.tsx$/, '');

      const pageUrl = `${RENDERER_URL}${baseUrl}${urlPath === '' ? '' : `/${urlPath}`}`;
      console.log("pageUrl for screenshot", pageUrl);

      try {
        const screenshotResponse = await fetch(`${BASE_URL}/api/screenshot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId, path: urlPath }),
        });

        if (!screenshotResponse.ok) {
          console.error(`Failed to take screenshot for ${pageUrl}`);
          continue;
        }

        const { url } = await screenshotResponse.json();
        node.screenshot = url;
      } catch (error) {
        console.error(`Error taking screenshot for ${pageUrl}:`, error);
        continue;
      }
    }

    // TODO: Store or update the project in your database
    // await db.projects.create(project);

    return Response.json({ project });
  } catch (error) {
    console.error('Generate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate site' }),
      { status: 500 }
    );
  }
}