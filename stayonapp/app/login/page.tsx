"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("login");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { company },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("Check your email to confirm your account, then log in.");
          setMode("login");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push("/agency");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16">
      <Link href="/" className="text-cream mb-10">
        <Logo size={30} />
      </Link>

      <div className="w-full max-w-[400px] card p-8">
        <div className="flex gap-1 bg-panel2 rounded-[2px] p-1 mb-7">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
                setInfo(null);
              }}
              className={`flex-1 py-2.5 rounded-[2px] text-[11px] uppercase tracking-[1.5px] transition ${
                mode === m ? "bg-cream text-[#111] font-medium" : "text-muted"
              }`}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          {mode === "signup" && (
            <div className="field">
              <label>Agency / company name</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Paris Concierge"
                required
              />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </div>

          {error && <div className="text-[13px] text-[#e0857a]">{error}</div>}
          {info && <div className="text-[13px] text-gold">{info}</div>}

          <button type="submit" className="btn btn-primary mt-2" disabled={busy}>
            {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>

      <p className="text-muted text-[12px] mt-6 text-center max-w-[360px]">
        Agencies sign up here to manage their apartments. Guests don&apos;t need an
        account — they just scan the QR code.
      </p>
      <p className="text-muted text-[11px] mt-3 text-center max-w-[360px]">
        By continuing you agree to our{" "}
        <Link href="/terms" className="text-gold hover:text-cream transition">Terms</Link> and{" "}
        <Link href="/privacy" className="text-gold hover:text-cream transition">Privacy Policy</Link>.
      </p>
    </div>
  );
}
