import type { ScrapboxApiResponse, ScrapboxApiPage } from "./types";

const UPSTREAM_BASE = "https://scrapbox.io/api/pages";
const PROJECT_NAME_PATTERN = /^[\w-]+$/;

/** Proxy の出力型（フロントエンドとの契約） */
export interface PageData {
  id: string;
  title: string;
  imageUrl: string | null;
  description: string;
  updatedAt: string;
  url: string;
}

export type ProxyResult =
  | { ok: true; pages: PageData[] }
  | {
      ok: false;
      code: "network_error" | "upstream_error";
      message: string;
      status?: number;
    };

export function validateProject(project: string): boolean {
  return PROJECT_NAME_PATTERN.test(project);
}

function transformPage(
  page: ScrapboxApiPage,
  projectName: string,
): PageData {
  return {
    id: page.id,
    title: page.title,
    imageUrl: page.image,
    description: page.descriptions.slice(0, 3).join(" "),
    updatedAt: new Date(page.updated * 1000).toISOString(),
    url: `https://scrapbox.io/${projectName}/${encodeURIComponent(page.title)}`,
  };
}

export async function fetchPages(
  project: string,
  search: string,
  scrapboxSid: string,
): Promise<ProxyResult> {
  let response: Response;
  try {
    response = await fetch(`${UPSTREAM_BASE}/${project}${search}`, {
      headers: { Cookie: `connect.sid=${scrapboxSid}` },
    });
  } catch (error) {
    return { ok: false, code: "network_error", message: String(error) };
  }

  if (!response.ok) {
    return {
      ok: false,
      code: "upstream_error",
      message: "Upstream error",
      status: response.status,
    };
  }

  let data: ScrapboxApiResponse;
  try {
    data = await response.json();
  } catch {
    return {
      ok: false,
      code: "upstream_error",
      message: "Invalid response body",
      status: response.status,
    };
  }

  const pages = data.pages.map((page) => transformPage(page, data.projectName));
  return { ok: true, pages };
}
