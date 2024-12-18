import { usePageStore } from "@/store/page";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { id, code } = await request.json();
    
    if (!id || !code) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    usePageStore.getState().setPage(id, code);

    return NextResponse.json({
      message: "Page stored successfully",
      url: `/p/${id}`,
    });
  } catch (error) {
    console.error("Error storing page:", error);
    return NextResponse.json(
      { error: "Failed to store page" },
      { status: 500 }
    );
  }
}
