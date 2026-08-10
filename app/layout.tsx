import Providers from "./components/Providers";
import GoogleAdsense from "./components/GoogleAdsense";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

const SITE_URL = "https://www.archipi.io";
const TITLE = "ArchiPi – Free Online Floor Plan Creator & 3D Home Design";
const DESCRIPTION =
  "Create 2D floor plans and explore them in 3D with ArchiPi, a free browser-based floor plan creator. Furniture catalog, OBJ export, autosave — no signup required.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "ArchiPi Team", url: SITE_URL }],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "ArchiPi",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "ArchiPi – Free Online Floor Plan Creator & 3D Home Design",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ArchiPi",
    creator: "@ArchiPi",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const eudoxusSans = localFont({
  src: [
    {
      path: "./fonts/EudoxusSans-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/EudoxusSans-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/EudoxusSans-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/EudoxusSans-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/EudoxusSans-ExtraBold.woff",
      weight: "900",
      style: "normal",
    },
  ],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="scrollbar scrollbar-thumb-zinc-700 scrollbar-track-transparent h-full overflow-hidden"
    >
      <body
        className={`bg-background text-foreground ${eudoxusSans.className} antialiased h-screen overflow-hidden`}
      >
        <Providers>{children}</Providers>
        <GoogleAdsense />
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
