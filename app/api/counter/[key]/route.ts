import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const NAMESPACE = "pf16-softles";

// POST: increment counter and return new value
export async function POST(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const res = await fetch(
      `https://api.countapi.xyz/hit/${NAMESPACE}/${params.key}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json({ value: data.value ?? null });
  } catch {
    return NextResponse.json({ value: null });
  }
}

// GET: read counter without incrementing
export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const res = await fetch(
      `https://api.countapi.xyz/get/${NAMESPACE}/${params.key}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json({ value: data.value ?? null });
  } catch {
    return NextResponse.json({ value: null });
  }
}
