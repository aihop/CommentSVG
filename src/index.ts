import { Env, QueryParams } from "./types";
import { chapterMap } from "./config";
import { fetchDiscussion } from "./github";
import { renderSVG } from "./renderer";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return handleRequest(request, env, ctx);
  },
};

async function handleRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Match /reconstruct/:chapter.svg
  const match = path.match(/^\/reconstruct\/([a-zA-Z0-9_-]+)\.svg$/);
  if (!match) {
    return new Response("Not Found", { status: 404 });
  }

  const chapterKey = match[1];
  const discussionNumber = chapterMap[chapterKey];

  if (!discussionNumber) {
    return new Response(`Chapter "${chapterKey}" not found`, { status: 404 });
  }

  // Parse query parameters
  const params = parseQueryParams(url);

  // Try cache (Cloudflare Cache API)
  const cacheKey = buildCacheKey(url);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fetch discussion data from GitHub
  const data = await fetchDiscussion(discussionNumber, env, params.comments);
  if (!data) {
    return new Response("Failed to fetch discussion", { status: 502 });
  }

  // Render SVG
  const svg = renderSVG(data, discussionNumber, params);

  const response = new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600", // 10 minutes
      ETag: `"${hashCode(svg)}"`,
    },
  });

  // Store in cache
  ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}

// ─── Query Parameter Parser ──────────────────────────────────────────────────

function parseQueryParams(url: URL): QueryParams {
  const theme = url.searchParams.get("theme") === "dark" ? "dark" : "light";

  const commentsParam = url.searchParams.get("comments");
  let comments = 3;
  if (commentsParam) {
    const parsed = parseInt(commentsParam, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 20) {
      comments = parsed;
    }
  }

  const compact = url.searchParams.get("compact") === "true";
  const lang = url.searchParams.get("lang") === "zh" ? "zh" : "en";

  return { theme, comments, compact, lang };
}

// ─── Cache Key Builder ───────────────────────────────────────────────────────

function buildCacheKey(url: URL): Request {
  const cacheUrl = new URL(url.origin + url.pathname);
  url.searchParams.forEach((value, key) => {
    cacheUrl.searchParams.set(key, value);
  });
  return new Request(cacheUrl.toString());
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
