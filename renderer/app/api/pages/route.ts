import { getPage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const pageTree = getPage(id);

  if (!pageTree) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Return the pageTree directly since it's already JSON stringified
  return NextResponse.json({ pageTree });
}
