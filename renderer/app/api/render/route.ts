import { storePage } from "@/lib/storage";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { id, code } = await request.json();
    
    if (!id || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Store the page
    storePage(id, code);

    return NextResponse.json(
      { message: "Page stored successfully", url: `/p/${id}` },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    console.error('Error storing page:', error);
    return NextResponse.json(
      { error: "Failed to store page" },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
