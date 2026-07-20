"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await createClient().auth.signOut();
    // refresh() re-runs the proxy so the now-absent session is picked up
    // server-side; a plain push would leave stale cached admin markup.
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="inline-flex min-h-11 items-center gap-2 rounded px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
