import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.archipi.io";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
    },
  ];
}
