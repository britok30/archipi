export default async function sitemap() {
  const baseUrl = "https://www.archipi.io";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
