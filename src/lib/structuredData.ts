type JsonLdValue = JsonLdPrimitive | JsonLdObject | JsonLdValue[];
type JsonLdPrimitive = string | number | boolean | null;
type JsonLdObject = { [key: string]: JsonLdValue | undefined };

interface ArticleStructuredDataInput {
  headline: string;
  description?: string;
  datePublished: Date | string;
  dateModified?: Date | string;
  image?: string | URL;
  tags?: string[];
}

interface PageStructuredDataInput {
  pageUrl: string | URL;
  siteUrl: string | URL;
  siteName?: string;
  siteDescription?: string;
  authorName?: string;
  authorImage?: string | URL;
  article?: ArticleStructuredDataInput;
}

export interface PageStructuredData {
  "@context": "https://schema.org";
  "@graph": JsonLdObject[];
}

const DEFAULT_SITE_NAME = "KJR020's Blog";
const DEFAULT_SITE_DESCRIPTION = "KJR020の技術ブログ";
const DEFAULT_AUTHOR_NAME = "KJR020";
const DEFAULT_AUTHOR_IMAGE = "/images/kuri_photo.png";
const DEFAULT_ARTICLE_IMAGE = "/og-image.png";
const LANGUAGE = "ja";

function toAbsoluteUrl(value: string | URL, baseUrl: string | URL) {
  return new URL(value, baseUrl).toString();
}

function toIsoDateTime(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function unique(values: string[] = []) {
  return [...new Set(values)];
}

function removeUndefined(value: JsonLdValue | undefined): JsonLdValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefined(item))
      .filter((item): item is JsonLdValue => item !== undefined);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, removeUndefined(item)] as const)
        .filter(([, item]) => item !== undefined),
    );
  }

  return value;
}

export function buildPageStructuredData({
  pageUrl,
  siteUrl,
  siteName = DEFAULT_SITE_NAME,
  siteDescription = DEFAULT_SITE_DESCRIPTION,
  authorName = DEFAULT_AUTHOR_NAME,
  authorImage = DEFAULT_AUTHOR_IMAGE,
  article,
}: PageStructuredDataInput): PageStructuredData {
  const normalizedSiteUrl = toAbsoluteUrl(siteUrl, siteUrl);
  const normalizedPageUrl = toAbsoluteUrl(pageUrl, normalizedSiteUrl);
  const websiteId = toAbsoluteUrl("#website", normalizedSiteUrl);
  const personId = toAbsoluteUrl("#person", normalizedSiteUrl);
  const graph: JsonLdObject[] = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: normalizedSiteUrl,
      name: siteName,
      description: siteDescription,
      inLanguage: LANGUAGE,
      publisher: { "@id": personId },
    },
    {
      "@type": "Person",
      "@id": personId,
      name: authorName,
      url: normalizedSiteUrl,
      image: toAbsoluteUrl(authorImage, normalizedSiteUrl),
    },
  ];

  if (article) {
    graph.push({
      "@type": "BlogPosting",
      "@id": toAbsoluteUrl("#blogposting", normalizedPageUrl),
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": normalizedPageUrl,
      },
      headline: article.headline,
      description: article.description ?? siteDescription,
      image: toAbsoluteUrl(article.image ?? DEFAULT_ARTICLE_IMAGE, normalizedPageUrl),
      datePublished: toIsoDateTime(article.datePublished),
      dateModified: toIsoDateTime(article.dateModified ?? article.datePublished),
      author: { "@id": personId },
      publisher: { "@id": personId },
      keywords: unique(article.tags),
      inLanguage: LANGUAGE,
      isPartOf: { "@id": websiteId },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function serializeJsonLd(value: JsonLdValue) {
  return JSON.stringify(removeUndefined(value))
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
