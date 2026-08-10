import React from "react";
import PlannerApp from "./components/PlannerApp";
import LandingContent, {
  ARCHITECTGPT_URL,
  FAQ_ITEMS,
} from "./components/LandingContent";

const SITE_URL = "https://www.archipi.io";

const webApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ArchiPi",
  url: SITE_URL,
  description:
    "Free online floor plan creator. Draw 2D floor plans, furnish them from a built-in catalog, view them in 3D, and export to OBJ — no signup required.",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "ArchitectGPT",
    url: ARCHITECTGPT_URL,
  },
};

// FAQPage markup must match the FAQ content rendered on the page exactly,
// so it is generated from the same data as <LandingContent />.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PlannerApp />
      <LandingContent />
    </>
  );
}
