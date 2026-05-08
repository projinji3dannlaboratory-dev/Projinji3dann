import type { CompanyRow } from "@/lib/types";

interface JsonLdProps {
  data: object | object[];
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // The data is generated server-side by us and contains no user input.
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "年収ランキング.jp",
    alternateName: "日本上場企業 年収ランキング",
    url: BASE_URL,
    inLanguage: "ja",
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "年収ランキング.jp",
    url: BASE_URL,
  };
}

export function companyJsonLd(c: CompanyRow) {
  const urlPath = c.sec_code ?? c.ticker4 ?? c.edinet_code;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.name_ja,
    alternateName: c.name_en ?? undefined,
    url: `${BASE_URL}/companies/${urlPath}`,
    identifier: [
      { "@type": "PropertyValue", propertyID: "EDINET", value: c.edinet_code },
      c.sec_code ? { "@type": "PropertyValue", propertyID: "TSE", value: c.sec_code } : undefined,
    ].filter(Boolean),
    address: c.headquarters
      ? { "@type": "PostalAddress", addressCountry: "JP", streetAddress: c.headquarters }
      : undefined,
    industry: c.industry_name ?? undefined,
    numberOfEmployees: c.employee_count ?? undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListJsonLd(
  name: string,
  description: string,
  rows: CompanyRow[],
  limit = 100,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: rows.length,
    itemListElement: rows.slice(0, limit).map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/companies/${c.sec_code ?? c.ticker4 ?? c.edinet_code}`,
      name: c.name_ja,
    })),
  };
}
