import { NextResponse, type NextRequest } from "next/server";

import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Promotion click tracker.
 *
 * Records the click and forwards to the sponsor. The destination is returned
 * by the database function from the stored row — it is never read from the
 * request. Accepting a caller-supplied `?url=` here would turn the site into
 * an open redirect, which attackers harvest for phishing precisely because
 * the initial hop sits on a reputable domain.
 *
 * Deliberately dynamic: a cached redirect would neither count clicks nor
 * reflect a campaign that has since ended.
 */
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Reject anything that isn't a UUID before touching the database.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.redirect(new URL("/", SITE_URL), 302);
  }

  const supabase = createPublicClient();
  const { data: targetUrl, error } = await supabase.rpc("record_promotion_click", {
    _promotion_id: id,
  });

  if (error || !targetUrl) {
    // Expired, paused or unknown promotion — send the reader somewhere useful
    // rather than showing them an error page.
    return NextResponse.redirect(new URL("/", SITE_URL), 302);
  }

  const response = NextResponse.redirect(targetUrl, 302);
  // Don't leak the reader's current article path to the sponsor.
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
