import Providers from "./components/Providers";
import GoogleAdsense from "./components/GoogleAdsense";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "ArchiPi - Free Online Floor Plan Design & 3D Visualization Tool",
  description:
    "Design your dream space with ArchiPi! Create detailed 2D floor plans and explore them in 3D. Our intuitive drag-and-drop interface and customizable objects make architectural design accessible to everyone. Start designing for free in your browser today!",
  metadataBase: new URL("https://www.archipi.io"),
  keywords: [
    "ArchiPi",
    "Floor Plan",
    "3D Visualization",
    "Architectural Design",
    "Online Design Tool",
    "Free Design Software",
    "2D Floor Plan",
    "3D Floor Plan",
    "Interior Design",
    "Architecture",
    "Home Design",
  ],
  authors: [{ name: "ArchiPi Team", url: "https://www.archipi.io" }],
  openGraph: {
    title: "ArchiPi - Free Online Floor Plan Design & 3D Visualization Tool",
    description:
      "Design your dream space with ArchiPi! Create detailed 2D floor plans and explore them in 3D. Our intuitive drag-and-drop interface and customizable objects make architectural design accessible to everyone. Start designing for free in your browser today!",
    url: "https://www.archipi.io",
    siteName: "ArchiPi",
    images: [
      {
        url: "/main.png",
        width: 1200,
        height: 630,
        alt: "ArchiPi - Online Floor Plan Design & 3D Visualization Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ArchiPi",
    creator: "@ArchiPi",
    title: "ArchiPi - Free Online Floor Plan Design & 3D Visualization Tool",
    description:
      "Design your dream space with ArchiPi! Create detailed 2D floor plans and explore them in 3D. Start designing for free in your browser today!",
    images: ["/main.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
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
      className="scrollbar scrollbar-thumb-zinc-700 scrollbar-track-transparent"
    >
      <body
        className={`bg-background text-foreground ${eudoxusSans.className} antialiased`}
      >
        <Providers>{children}</Providers>
        <GoogleAdsense />
        <GoogleAnalytics />
        <Analytics />
      </body>
    </html>
  );
}
