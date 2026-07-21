import { Users } from "lucide-react";

import { AddRoleForm, RemoveRoleButton } from "@/app/admin/(dashboard)/users/UsersForms";
import { requireRole } from "@/lib/auth/require-role";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { supabase } = await requireRole("admin");

  const { data: roles } = await supabase
    .from("user_roles")
    .select("id, user_id, role")
    .order("role");

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign admin, editor, or viewer roles by Auth user UUID.
        </p>
      </div>

      <AddRoleForm />

      {!roles?.length ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl">No roles yet</h2>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-lg border border-border bg-card">
          {roles.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-mono text-xs text-muted-foreground">{row.user_id}</p>
                <p className="mt-0.5 font-medium">{row.role}</p>
              </div>
              <RemoveRoleButton id={row.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
