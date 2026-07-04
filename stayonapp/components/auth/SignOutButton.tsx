"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="px-4 py-2 rounded-[2px] border border-line text-[11px] uppercase tracking-[1px] text-muted hover:text-cream transition"
    >
      Log out
    </button>
  );
}
