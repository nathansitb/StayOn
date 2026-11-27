"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

/**
 * Landing page of the "reset your password" e-mail. Supabase signs the user in
 * from the link (recovery session); we then let them choose a new password.
 */
export default function ResetPassword() {
  const supabase = createClient();
  const router = useRouter();
  const [ready, setReady] = useState<"wait" | "ok" | "invalid">("wait");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let done = false;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        done = true;
        setReady("ok");
      }
    });
    (async () => {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) await supabase.auth.exchangeCodeForSession(code).catch(() => {});
      const { data } = await supabase.auth.getSession();
      if (data.session) { done = true; setReady("ok"); }
      setTimeout(() => { if (!done) setReady("invalid"); }, 2500);
    })();
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pw.length < 8) return setError("At least 8 characters.");
    if (pw !== pw2) return setError("The two passwords differ.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/agency");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16">
      <Link href="/" className="text-cream mb-10"><Logo size={30} /></Link>
      <div className="w-full max-w-[400px] card p-8">
        <div className="font-serif text-[24px] font-semibold">New password</div>
        {ready === "wait" && <p className="text-muted text-[13px] mt-3">Checking your link…</p>}
        {ready === "invalid" && (
          <>
            <p className="text-creamDim text-[13.5px] mt-3 leading-[1.6]">
              This link has expired or was opened on another device. Ask for a new one from the log-in page.
            </p>
            <Link href="/login" className="btn btn-primary mt-6">Back to log in</Link>
          </>
        )}
        {ready === "ok" && (
          <form onSubmit={submit} className="flex flex-col gap-3.5 mt-5">
            <div className="field">
              <label>New password</label>
              <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="8+ characters" autoComplete="new-password" required />
            </div>
            <div className="field">
              <label>Repeat it</label>
              <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" required />
            </div>
            {error && <div className="text-[13px] text-[#e0857a]">{error}</div>}
            <button type="submit" className="btn btn-primary mt-2" disabled={busy}>{busy ? "…" : "Save and log in"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
