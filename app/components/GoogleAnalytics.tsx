"use client";

import React from "react";
import Script from "next/script";

const GoogleAnalytics: React.FC = () => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId || process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${gaId}');
        `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
