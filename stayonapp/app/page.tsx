import { LandingNav } from "@/components/landing/LandingNav";
import { Landing } from "@/components/landing/Landing";
import { FAQ } from "@/lib/faq";

const SITE = "https://stay-on.app";

// Structured data: tells Google, Bing (and the AI assistants that use them)
// exactly what StayOn is, so "StayOn" is not confused with other products.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "StayOn",
      alternateName: ["Stay On", "Stay-On", "StayOn app", "stay-on.app"],
      url: SITE,
      logo: `${SITE}/logo.png`,
      image: `${SITE}/og.jpg`,
      email: "contact@stay-on.app",
      description: FAQ[0].a.en,
      slogan: "Extend the moment. In style.",
      foundingLocation: { "@type": "Place", name: "Paris, France" },
      areaServed: { "@type": "Country", name: "France" },
      founder: { "@type": "Person", name: "Nathan Sitbon" },
      knowsAbout: ["late checkout", "extra night booking", "short-term rental upsell", "concierge services", "Airbnb property management", "QR code guest services"],
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "StayOn",
      inLanguage: ["en", "fr"],
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: "StayOn",
      url: SITE,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "QR-code upsell platform for short-term rentals: guests book extra nights, late checkouts and cleanings from the apartment; agencies earn more with no extra work.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", description: "Free to set up, commission on sales only" },
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q.en,
        acceptedAnswer: { "@type": "Answer", text: f.a.en },
      })),
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <LandingNav />
      <Landing />
    </div>
  );
}
