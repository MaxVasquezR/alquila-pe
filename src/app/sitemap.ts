import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${base}/protocolo`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/para-duenos`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/premium`, lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/registro`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/legal/terminos`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/privacidad`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/reclamaciones`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
