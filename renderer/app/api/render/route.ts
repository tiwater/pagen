import { storePage } from "@/lib/storage";
import { NextResponse } from "next/server";

interface PageTreeNode {
  id: string;
  path: string;
  file: {
    id: string;
    name: string;
    content: string;
    metadata: {
      title: string;
    };
  };
}

export async function POST(request: Request) {
  // Handle preflight request
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { id, pageTree } = await request.json();

    if (!id || !Array.isArray(pageTree)) {
      return NextResponse.json(
        { error: "Missing required fields or invalid format" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Store the pageTree directly
    storePage(id, JSON.stringify(pageTree));
    console.log(`Site stored successfully: /p/${id}`);

    return NextResponse.json(
      { message: "Site stored successfully", url: `/p/${id}` },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error storing site:", error);
    return NextResponse.json(
      { error: "Failed to store site" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
