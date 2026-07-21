import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Authenticated cache purge. Body: `{ "path": "/blog/slug" }` or `{ "paths": [...] }`.
 * Header: `Authorization: Bearer <REVALIDATE_SECRET>` or `x-revalidate-secret`.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "REVALIDATE_SECRET not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-revalidate-secret");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : headerSecret;
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { path?: string; paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paths = body.paths ?? (body.path ? [body.path] : []);
  if (paths.length === 0) {
    return NextResponse.json({ error: "Provide path or paths" }, { status: 400 });
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: 'POST with Authorization: Bearer <REVALIDATE_SECRET> and { "path": "/blog/..." }',
  });
}
