"use client";

import { useEffect, useRef } from "react";

import { recordPostView } from "@/app/blog/[slug]/view-actions";

/** Fires a single view increment after mount (cookie-deduped server-side). */
export function ViewTracker({ postId }: { postId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void recordPostView(postId);
  }, [postId]);

  return null;
}
