"use client";

import Link from "next/link";
import { useLang } from "@/lib/store";
import {
  GUEST_BENEFITS,
  HOST_BENEFITS,
  STEPS,
  TESTIMONIALS,
  PRICING,
  pick,
  type Feature,
} from "@/lib/content";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`max-w-[1180px] mx-auto px-5 sm:px-7 ${className}`}>
      {children}
    </section>
  );
}

function BenefitGrid({ features }: { features: Feature[] }) {
  const { lang } = useLang();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
      {features.map((f, i) => (
        <div
          key={i}
          className="card p-6 hover:border-lineStrong transition"
          style={{ borderColor: "var(--line)" }}
        >
          <div className="w-11 h-11 rounded-xl bg-panel2 border border-line flex items-center justify-center text-gold text-[20px]">
            {f.icon}
          </div>
          <div className="font-serif text-[19px] font-semibold mt-4">
            {pick(f.title, lang)}
          </div>
          <ul className="mt-3 space-y-2">
            {f.points.map((p, j) => (
              <li key={j} className="flex gap-2.5 text-[14px] text-creamDim leading-[1.5]">
                <span className="text-gold mt-0.5 shrink-0">·</span>
                <span>{pick(p, lang)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const GALLERY = [
  { src: "/photos/haussmann-1536.webp", k: "gallery1" },
  { src: "/photos/loft-1536.webp", k: "gallery2" },
  { src: "/photos/mansarde-1536.webp", k: "gallery3" },
] as const;

export function Landing() {
  const { lang, t, eur } = useLang();

  return (
    <div>
      {/* HERO */}
      <Section className="pt-16 sm:pt-24 pb-16">
        <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-gold border border-line rounded-[2px] px-3.5 py-1.5">
              <span className="w-1 h-1 rounded-full bg-gold" /> {t("heroBadge")}
            </span>
            <h1 className="font-serif text-[42px] sm:text-[56px] leading-[1.05] font-semibold mt-6">
              {t("heroTitle")}
            </h1>
            <p className="text-creamDim text-[17px] leading-[1.6] mt-6 max-w-[520px]">
              {t("heroSub")}
            </p>
            <div className="flex flex-wrap gap-3 mt-9">
              <Link href="/stay" className="btn btn-gold !w-auto px-7">
                {t("ctaGuestDemo")} <span className="text-[18px]">↗</span>
              </Link>
              <Link href="/login" className="btn btn-ghost !w-auto px-7">
                {t("ctaHostSpace")}
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="inline-block text-[13.5px] text-muted hover:text-cream transition mt-5 underline underline-offset-4"
            >
              {t("ctaSeeDashboard")} →
            </Link>
          </div>

          {/* hero visual: the real plaque, in a room, with a working QR code */}
          <div className="relative">
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[4px] border border-lineStrong shadow-[0_30px_80px_rgba(0,0,0,.55)]">
              <Image
                src="/photos/plaque-1536.webp"
                alt={t("plaqueAlt")}
                fill
                priority
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 left-4 sm:left-6 bg-panel border border-line rounded-[2px] px-4 py-2.5 text-[12.5px] text-creamDim shadow-lg">
              <span className="text-gold mr-1.5">●</span>
              {t("plaqueCaption")}
            </div>
          </div>
        </div>
      </Section>

      {/* STATS */}
      <Section className="pb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line rounded-2xl overflow-hidden border border-line">
          {[
            { n: "12,400+", l: t("statStays") },
            { n: "320", l: t("statHosts") },
            { n: eur(486000), l: t("statRevenueGen") },
            { n: "18.4%", l: t("statConvRate") },
          ].map((s, i) => (
            <div key={i} className="bg-bg p-6 text-center">
              <div className="font-serif text-[30px] sm:text-[34px] font-semibold text-gold">
                {s.n}
              </div>
              <div className="text-[12.5px] text-muted mt-1.5">{s.l}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how" className="py-16 scroll-mt-20">
        <div className="text-center">
          <div className="eyebrow">StayOn</div>
          <h2 className="font-serif text-[34px] font-semibold mt-3">{t("howTitle")}</h2>
          <p className="sub max-w-[560px] mx-auto">{t("howSub")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {STEPS.map((s, i) => (
            <div key={i} className="card p-6 relative">
              <div className="font-serif text-[40px] font-semibold text-panel2" style={{ WebkitTextStroke: "1px var(--line-strong)" }}>
                {s.n}
              </div>
              <div className="font-serif text-[19px] font-semibold mt-2">
                {pick(s.title, lang)}
              </div>
              <p className="text-[14px] text-creamDim leading-[1.55] mt-2.5">
                {pick(s.text, lang)}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* GALLERY */}
      <Section className="py-16">
        <div className="max-w-[640px]">
          <div className="eyebrow">{t("galleryEyebrow")}</div>
          <h2 className="font-serif text-[34px] font-semibold mt-3">{t("galleryTitle")}</h2>
          <p className="sub">{t("gallerySub")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          {GALLERY.map((g) => (
            <figure key={g.src} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] border border-line">
                <Image
                  src={g.src}
                  alt={t(g.k)}
                  fill
                  sizes="(min-width: 768px) 380px, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <figcaption className="mt-3 text-[13.5px] text-creamDim">{t(g.k)}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* GUEST BENEFITS */}
      <Section id="guests" className="py-16 scroll-mt-20">
        <div className="max-w-[620px]">
          <div className="eyebrow">{t("navGuests")}</div>
          <h2 className="font-serif text-[34px] font-semibold mt-3">
            {t("guestBenefitsTitle")}
          </h2>
          <p className="sub">{t("guestBenefitsSub")}</p>
        </div>
        <BenefitGrid features={GUEST_BENEFITS} />
      </Section>

      {/* HOST BENEFITS */}
      <Section id="hosts" className="py-16 scroll-mt-20">
        <div className="max-w-[620px]">
          <div className="eyebrow">{t("navHosts")}</div>
          <h2 className="font-serif text-[34px] font-semibold mt-3">
            {t("hostBenefitsTitle")}
          </h2>
          <p className="sub">{t("hostBenefitsSub")}</p>
        </div>
        <BenefitGrid features={HOST_BENEFITS} />
      </Section>

      {/* TESTIMONIALS */}
      <Section className="py-16">
        <h2 className="font-serif text-[28px] font-semibold text-center">
          {t("testimonialsTitle")}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-10">
          {TESTIMONIALS.map((tm, i) => (
            <figure key={i} className="card p-6">
              <div className="text-gold text-[24px] font-serif leading-none">“</div>
              <blockquote className="font-serif text-[17px] leading-[1.5] mt-2">
                {pick(tm.quote, lang)}
              </blockquote>
              <figcaption className="mt-5 text-[13px]">
                <div className="font-medium">{tm.name}</div>
                <div className="text-muted">{pick(tm.role, lang)}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" className="py-16 scroll-mt-20">
        <div className="text-center">
          <div className="eyebrow">{t("navPricing")}</div>
          <h2 className="font-serif text-[34px] font-semibold mt-3">{t("pricingTitle")}</h2>
          <p className="sub max-w-[520px] mx-auto">{t("pricingSub")}</p>
        </div>
        <div className="mt-12 max-w-[460px] mx-auto">
          {/* Free */}
          <div className="card p-8">
            <div className="font-serif text-[22px] font-semibold">
              {pick(PRICING.free.name, lang)}
            </div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="font-serif text-[44px] font-semibold">{PRICING.free.price}</span>
              <span className="text-muted text-[13px]">{pick(PRICING.free.per, lang)}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {PRICING.free.features.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] text-creamDim">
                  <span className="text-gold">✓</span> {pick(f, lang)}
                </li>
              ))}
            </ul>
            <Link href="/login" className="btn btn-gold mt-8">
              {pick(PRICING.free.cta, lang)}
            </Link>
          </div>

          <p className="text-center text-[13px] text-creamDim mt-6 leading-[1.6]">
            {pick(PRICING.commission, lang)}
          </p>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="py-20">
        <div
          className="rounded-[4px] border border-lineStrong p-10 sm:p-16 text-center"
          style={{ background: "#101010" }}
        >
          <div className="font-serif text-[26px] leading-[0.6] text-gold">↗</div>
          <h2 className="font-serif text-[36px] font-semibold mt-5">{t("finalCtaTitle")}</h2>
          <p className="text-creamDim text-[16px] mt-4">{t("finalCtaSub")}</p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link href="/login" className="btn btn-gold !w-auto px-8">
              {pick(PRICING.free.cta, lang)}
            </Link>
            <Link href="/stay" className="btn btn-ghost !w-auto px-8">
              {t("tryDemo")}
            </Link>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <Section className="py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-cream pt-1.5">
            <Logo size={18} />
          </div>
          <div className="flex items-center gap-5 text-[12.5px] text-muted">
            <Link href="/privacy" className="hover:text-cream transition">Privacy</Link>
            <Link href="/terms" className="hover:text-cream transition">Terms</Link>
          </div>
        </Section>
      </footer>
    </div>
  );
}
