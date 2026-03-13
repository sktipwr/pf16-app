import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

// Using counterapi.dev — free, no signup, actively maintained
// Docs: https://counterapi.dev
const NAMESPACE = "pf16-softles";

// POST: increment counter and return new value
export async function POST(
  _req: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const res = await fetch(
      `https://api.counterapi.dev/v1/${NAMESPACE}/${params.key}/up`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json({ value: data.count ?? null });
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
      `https://api.counterapi.dev/v1/${NAMESPACE}/${params.key}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json({ value: data.count ?? null });
  } catch {
    return NextResponse.json({ value: null });
  }
}
