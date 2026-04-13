import { validateProject } from "../../_lib/cms-proxy";
import { fetchAllKnowledgePages } from "../../_lib/knowledge-proxy";
import { logError } from "../../_lib/logger";

interface Env {
  SCRAPBOX_SID: string;
}

const ALLOWED_ORIGINS = [
  "https://kjr020.github.io",
  "https://kjr020.pages.dev",
];

function getAllowedOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  if (ALLOWED_ORIGINS.includes(origin)) return origin;

  // Allow localhost in development
  if (origin.startsWith("http://localhost:")) return origin;

  return null;
}

function jsonResponse(body: unknown, status: number, request: Request): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // エラーレスポンスをキャッシュすると回復後も影響するため、成功時のみキャッシュを許可
    "Cache-Control": status >= 400 ? "no-store" : "public, max-age=300",
  };

  const allowedOrigin = getAllowedOrigin(request);
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Vary"] = "Origin";
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const project = context.params.project as string;
  const scrapboxSid = context.env.SCRAPBOX_SID;

  if (!validateProject(project)) {
    return jsonResponse({ error: "Invalid project name" }, 400, context.request);
  }
  if (!scrapboxSid) {
    return jsonResponse({ error: "Server misconfigured" }, 500, context.request);
  }

  const result = await fetchAllKnowledgePages(project, scrapboxSid);

  if (!result.ok) {
    const isAuthExpired =
      result.code === "upstream_error" &&
      (result.status === 401 || result.status === 403);
    logError({
      type: isAuthExpired ? "auth_expired" : result.code,
      project,
      ...(result.status ? { upstream_status: result.status } : {}),
    });
    const status =
      result.code === "upstream_error" && result.status ? result.status : 500;
    return jsonResponse({ error: "Internal server error" }, status, context.request);
  }

  return jsonResponse(
    { pages: result.pages, count: result.count, projectName: result.projectName },
    200,
    context.request,
  );
};
