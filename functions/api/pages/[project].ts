import { validateProject, fetchPages } from "../../_lib/cms-proxy";
import { logError } from "../../_lib/logger";

interface Env {
  SCRAPBOX_SID: string;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const project = context.params.project as string;
  const scrapboxSid = context.env.SCRAPBOX_SID;

  if (!validateProject(project)) {
    return jsonResponse({ error: "Invalid project name" }, 400);
  }
  if (!scrapboxSid) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const { search } = new URL(context.request.url);
  const result = await fetchPages(project, search, scrapboxSid);

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
    return jsonResponse({ error: "Internal server error" }, status);
  }

  return jsonResponse(result.pages, 200);
};
