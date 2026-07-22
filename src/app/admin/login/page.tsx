import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-surface-sunken px-4">
      <main id="main" className="w-full max-w-sm">
        <div className="rounded-lg border border-border bg-card p-8">
          <h1 className="font-display text-2xl">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Restricted to editorial staff.
          </p>

          <Suspense fallback={<div className="mt-6 h-64" />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
