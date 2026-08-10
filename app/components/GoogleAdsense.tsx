"use client";

import React from "react";
import Script from "next/script";

const GoogleAdsense: React.FC = () => {
  const adsenseId = process.env.NEXT_PUBLIC_G_ADSENSE;

  if (!adsenseId || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default GoogleAdsense;
