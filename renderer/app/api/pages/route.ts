import { usePageStore } from "@/store/page";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    // Generate a random id
    const id = Math.random().toString(36).substring(2, 15);
    
    // Store the code
    usePageStore.getState().setPage(id, code);

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Error storing page:", error);
    return NextResponse.json(
      { error: "Failed to store page" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const content = usePageStore.getState().getPage(id);
  
  if (!content) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({ content });
}
