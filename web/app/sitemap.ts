import type { MetadataRoute } from "next";
import { fetchAllCompanies } from "@/lib/queries";
import { INDUSTRIES } from "@/lib/industries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const rows = await fetchAllCompanies();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/industries`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/compare`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const industryRoutes: MetadataRoute.Sitemap = INDUSTRIES.map((i) => ({
    url: `${base}/industries/${i.code}`,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const companyRoutes: MetadataRoute.Sitemap = rows.map((c) => ({
    url: `${base}/companies/${c.sec_code ?? c.ticker4 ?? c.edinet_code}`,
    changeFrequency: "yearly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...industryRoutes, ...companyRoutes];
}
