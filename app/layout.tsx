import React from "react";
import Providers from "./components/Providers";
import GoogleAdsense from "./components/GoogleAdsense";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

import localFont from "next/font/local";

export const metadata = {
  title: "ArchiPi: Online Floor Plan Design & 3D Visualization Tool",
  description:
    "ArchiPi lets you draw 2D floor plans and navigate them in 3D, offering a drag & drop catalog of customizable objects. Transform your design ideas into reality, from 2D wireframes to detailed 3D models. Experience architectural design in your browser for free!",
  metadataBase: new URL("https://www.archipi.io"),
  openGraph: {
    title: "ArchiPi: Online Floor Plan Design & 3D Visualization Tool",
    description:
      "ArchiPi lets you draw 2D floor plans and navigate them in 3D, offering a drag & drop catalog of customizable objects. Transform your design ideas into reality, from 2D wireframes to detailed 3D models. Experience architectural design in your browser for free!",
    url: "https://www.archipi.io",
    siteName: "ArchiPi",
    images: ["/main.png"],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArchiPi: Online Floor Plan Design & 3D Visualization Tool",
    description:
      "ArchiPi lets you draw 2D floor plans and navigate them in 3D, offering a drag & drop catalog of customizable objects. Transform your design ideas into reality, from 2D wireframes to detailed 3D models. Experience architectural design in your browser for free!",
    images: ["/main.png"],
  },
};

const gtWalsheim = localFont({ src: "../app/fonts/GT-Walsheim-Regular.otf" });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`bg-black text-white ${gtWalsheim.className}`}>
        <Providers>{children}</Providers>
      </body>
      <GoogleAdsense />
      <GoogleAnalytics />
      <Analytics />
    </html>
  );
}
