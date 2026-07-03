import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/store";
import { AppProvider } from "@/lib/appStore";

export const metadata: Metadata = {
  title: "StayOn — Extend the moment. In style.",
  description:
    "Scan, extend your stay or request a late checkout, pay and get instant confirmation. StayOn beta.",
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
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <LangProvider>
          <AppProvider>{children}</AppProvider>
        </LangProvider>
      </body>
    </html>
  );
}
