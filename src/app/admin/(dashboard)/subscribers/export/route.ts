import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Subscriber CSV export.
 *
 * Streamed from the server rather than assembled in the browser, so the whole
 * list never has to be loaded into the page just to download it.
 *
 * Two escaping concerns, both of which the old client-side export got wrong:
 *  - RFC 4180: a literal " inside a quoted field must be doubled, or one
 *    subscriber name with a quote in it corrupts every subsequent column.
 *  - Formula injection: Excel and Sheets execute a cell beginning with
 *    = + - @ (or tab/CR), so a crafted "name" could run on an admin's machine
 *    when they open the file.
 */
function escapeCell(value: string): string {
  const normalised = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${normalised.replace(/"/g, '""')}"`;
}

export async function GET() {
  const supabase = await createClient();

  // The route is behind the /admin gate, but a data export deserves its own
  // check — this responds to a bare GET and never renders a page.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) return new Response("Forbidden", { status: 403 });

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, full_name, status, source, created_at, unsubscribed_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("subscribers export", { message: error.message });
    return new Response("Export failed", { status: 500 });
  }

  const header = ["Email", "Name", "Status", "Source", "Subscribed at", "Unsubscribed at"];
  const rows = (data ?? []).map((row) => [
    row.email,
    row.full_name ?? "",
    row.status,
    row.source ?? "",
    row.created_at,
    row.unsubscribed_at ?? "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(escapeCell).join(",")).join("\r\n");

  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="saf-subscribers-${date}.csv"`,
      // Personal data: never let a shared cache hold on to this.
      "Cache-Control": "no-store, private",
    },
  });
}
