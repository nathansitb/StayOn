import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/store";
import { AppProvider } from "@/lib/appStore";
import { CookieBanner } from "@/components/ui/CookieBanner";

const DESCRIPTION =
  "A QR plaque in every apartment: guests book an extra night, a late checkout or a cleaning in seconds. New revenue for agencies, zero extra work.";

export const metadata: Metadata = {
  metadataBase: new URL("https://stay-on.app"),
  title: "StayOn — Extend the moment. In style.",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "https://stay-on.app",
    siteName: "StayOn",
    title: "StayOn — Extra nights, late checkouts, cleanings. Sold on autopilot.",
    description: DESCRIPTION,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "The StayOn plaque on a bedside table" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "StayOn" },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <LangProvider>
          <AppProvider>{children}</AppProvider>
          <CookieBanner />
        </LangProvider>
      </body>
    </html>
  );
}
