"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/store";
import { useApp } from "@/lib/appStore";
import { IMG } from "@/lib/data";
import type { Plan } from "@/lib/types";
import { Qr } from "@/components/ui/Qr";

type Step = 0 | 1 | 2 | 3 | 4 | 5;

export function HostOnboarding() {
  const { t, eur } = useLang();
  const { addApartment, loginHost, setPlan } = useApp();

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState({
    name: "Nathan Sitbon",
    email: "nathansitbon26@gmail.com",
    company: "Sitbon Stays",
    password: "",
    listingName: "Sunset Terrace",
    location: "Le Marais · Paris",
    photo: "",
    price: 160,
    extra: true,
    late: true,
    plan: "free" as Plan,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const steps = [
    t("stepAccount"),
    t("stepListing"),
    t("stepPricing"),
    t("stepPlaque"),
    t("stepPlan"),
  ];

  function finish() {
    addApartment({
      name: form.listingName,
      location: form.location,
      image: form.photo || IMG.apt4,
      status: "available",
      extraNight: form.extra,
      lateCheckout: form.late,
      extendPrice: form.price,
    });
    loginHost({ name: form.name, email: form.email, company: form.company });
    setPlan(form.plan);
    setStep(5);
  }

  function downloadPlaque() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" rx="28" fill="#0B0B0B"/><text x="300" y="150" text-anchor="middle" fill="#F3EDE1" font-family="Georgia,serif" font-size="30">↗</text><text x="300" y="215" text-anchor="middle" fill="#F3EDE1" font-family="Georgia,serif" font-size="58" font-weight="600">StayOn</text><text x="300" y="255" text-anchor="middle" fill="#C9C2B4" font-family="Georgia,serif" font-style="italic" font-size="22">Extend the moment. In style.</text><rect x="200" y="320" width="200" height="200" rx="16" fill="#ffffff"/><text x="300" y="600" text-anchor="middle" fill="#F3EDE1" font-family="Georgia,serif" font-size="26">${form.listingName}</text><text x="300" y="650" text-anchor="middle" fill="#8B857A" font-family="Arial" font-size="18">Scan to stay one more night</text></svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `StayOn-plaque-${form.listingName.replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- done screen ----
  if (step === 5) {
    return (
      <Shell>
        <div className="text-center py-6">
          <div className="w-[84px] h-[84px] mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ background: "rgba(198,167,106,.08)", border: "1px solid #c6a76a" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#C6A76A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-serif text-[30px] font-semibold">{t("hostDoneTitle")}</h1>
          <p className="sub max-w-[380px] mx-auto">{t("hostDoneSub")}</p>
          <Link href="/dashboard" className="btn btn-gold !w-auto px-8 mt-8 inline-flex">
            {t("goToDashboard")} <span className="text-[18px]">↗</span>
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* stepper */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex-1 flex flex-col gap-2">
            <div
              className="h-1 rounded-full transition"
              style={{ background: i <= step ? "#c6a76a" : "var(--line-strong)" }}
            />
            <span
              className={`text-[11px] tracking-[.4px] ${
                i === step ? "text-cream" : "text-muted"
              }`}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <Panel title={t("hostSignInTitle")} sub={t("hostSignInSub")}>
          <Field label={t("fullName")} value={form.name} onChange={(v) => set("name", v)} />
          <Field label={t("email")} value={form.email} onChange={(v) => set("email", v)} />
          <Field label={t("company")} value={form.company} onChange={(v) => set("company", v)} />
          <Field label={t("password")} type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="••••••••" />
        </Panel>
      )}

      {step === 1 && (
        <Panel title={t("addListingTitle")} sub={t("addListingSub")}>
          <Field label={t("listingName")} value={form.listingName} onChange={(v) => set("listingName", v)} />
          <Field label={t("listingLocation")} value={form.location} onChange={(v) => set("location", v)} />
          <Field label={t("photoUrl")} value={form.photo} onChange={(v) => set("photo", v)} placeholder="https://…" />
        </Panel>
      )}

      {step === 2 && (
        <Panel title={t("rulesTitle")} sub={t("rulesSub")}>
          <div className="field">
            <label>{t("extendPriceLabel")}</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
                className="!w-32"
              />
              <span className="text-muted text-[14px]">{eur(form.price)} {t("perNight")}</span>
            </div>
          </div>
          <Toggle label={t("enableExtra")} on={form.extra} onClick={() => set("extra", !form.extra)} />
          <Toggle label={t("enableLate")} on={form.late} onClick={() => set("late", !form.late)} />
        </Panel>
      )}

      {step === 3 && (
        <Panel title={t("plaqueTitle")} sub={t("plaqueSub")}>
          <div className="flex flex-col items-center py-2">
            <div className="w-[220px] rounded-[4px] p-6 text-center" style={{ background: "#121110", border: "1px solid var(--line-strong)" }}>
              <div className="font-serif text-[26px] font-semibold">StayOn</div>
              <div className="w-[120px] h-[120px] mx-auto mt-4 bg-white rounded-xl p-2.5">
                <Qr seed={form.listingName.length + 5} className="w-full h-full" />
              </div>
              <div className="text-[13px] text-creamDim mt-4 font-serif">{form.listingName}</div>
            </div>
            <button onClick={downloadPlaque} className="btn btn-dark !w-auto px-6 mt-6">
              ↓ {t("downloadPlaque")}
            </button>
          </div>
        </Panel>
      )}

      {step === 4 && (
        <Panel title={t("choosePlanTitle")} sub="">
          <div className="rounded-[4px] border border-gold bg-[rgba(198,167,106,.08)] p-6 text-center">
            <div className="font-serif text-[32px] font-semibold text-gold">Free</div>
            <p className="text-[13px] text-creamDim mt-3 leading-[1.6]">
              No monthly fee. StayOn only earns a small commission on each booking —
              nothing to set up, and nothing unless you earn.
            </p>
          </div>
        </Panel>
      )}

      {/* nav */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1) as Step)}
          className={`text-[14px] text-muted hover:text-cream transition ${step === 0 ? "invisible" : ""}`}
        >
          ‹ {t("back")}
        </button>
        {step < 4 ? (
          <button onClick={() => setStep((s) => (s + 1) as Step)} className="btn btn-gold !w-auto px-8">
            {t("continue")} <span className="text-[18px]">↗</span>
          </button>
        ) : (
          <button onClick={finish} className="btn btn-gold !w-auto px-8">
            {t("finish")} <span className="text-[18px]">↗</span>
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[520px] mx-auto px-5 py-10">
      <div className="card p-7 sm:p-9">{children}</div>
    </div>
  );
}

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade">
      <h1 className="font-serif text-[25px] font-semibold">{title}</h1>
      {sub && <p className="sub">{sub}</p>}
      <div className="mt-6 flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between card px-4 py-3.5">
      <span className="text-[14.5px]">{label}</span>
      <span
        className="w-11 h-6 rounded-full relative transition"
        style={{ background: on ? "#c6a76a" : "var(--line-strong)" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
          style={{ left: on ? "22px" : "2px" }}
        />
      </span>
    </button>
  );
}
