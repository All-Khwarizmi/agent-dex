import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { messages } = await req.json();
  return NextResponse.json({ messages });
}
