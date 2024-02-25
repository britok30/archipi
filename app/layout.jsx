import Providers from "./components/Providers";
import "./globals.css";

import localFont from "next/font/local";

export const metadata = {
  title: "ArchiPi | Online Floor Plan Editor",
  description: "ArchiPi lets you create 2D & 3D floorplans for free",
};

const gtWalsheim = localFont({ src: "../app/fonts/GT-Walsheim-Regular.otf" });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`bg-black text-white ${gtWalsheim.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
