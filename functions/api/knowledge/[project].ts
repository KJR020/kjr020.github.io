import { validateProject } from "../../_lib/cms-proxy";
import { jsonResponse } from "../../_lib/http";
import { fetchAllKnowledgePages } from "../../_lib/knowledge-proxy";
import { logError } from "../../_lib/logger";

interface Env {
  SCRAPBOX_SID: string;
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
