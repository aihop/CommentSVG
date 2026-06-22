import { DiscussionData, QueryParams } from "./types";
import { repoConfig } from "./config";

// ─── Color Palette ───────────────────────────────────────────────────────────

interface Colors {
  bg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  separator: string;
  link: string;
}

const LIGHT: Colors = {
  bg: "#ffffff",
  border: "#e4e4e7",
  textPrimary: "#18181b",
  textSecondary: "#52525b",
  textTertiary: "#71717a",
  separator: "#f4f4f5",
  link: "#52525b",
};

const DARK: Colors = {
  bg: "#0a0a0b",
  border: "#27272a",
  textPrimary: "#fafafa",
  textSecondary: "#a1a1aa",
  textTertiary: "#71717a",
  separator: "#18181b",
  link: "#a1a1aa",
};

function getColors(theme: "light" | "dark"): Colors {
  return theme === "dark" ? DARK : LIGHT;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string, lang: string): string {
  const date = new Date(iso);
  try {
    return date.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Wrap text into lines that fit within maxChars per line.
 * SVG <text> does not auto-wrap, so we manually split into <tspan> elements.
 */
function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxChars) {
      lines.push(remaining);
      break;
    }
    // Try to break at a space within maxChars
    const slice = remaining.slice(0, maxChars);
    const lastSpace = slice.lastIndexOf(" ");
    if (lastSpace > maxChars * 0.3) {
      // Break at word boundary
      lines.push(slice.slice(0, lastSpace));
      remaining = remaining.slice(lastSpace + 1);
    } else {
      // No good break point, hard break
      lines.push(slice);
      remaining = remaining.slice(maxChars);
    }
  }
  return lines;
}

// ─── Main Render Function ────────────────────────────────────────────────────

export function renderSVG(
  data: DiscussionData,
  discussionNumber: number,
  params: QueryParams
): string {
  const colors = getColors(params.theme);
  const compact = params.compact;

  const avatarSize = compact ? 28 : 36;
  const avatarGap = compact ? 16 : 20;
  const topPadding = 88;
  const maxCharsPerLine = compact ? 60 : 55;
  const lineHeight = compact ? 18 : 20;

  // Calculate dynamic positions
  let currentY = topPadding;

  const positionedComments = data.comments.map((comment) => {
    const commentStart = currentY;
    const authorNameY = currentY + avatarSize / 2 + 4;
    const dateY = authorNameY + 16;
    const bodyLines = wrapText(comment.content, maxCharsPerLine);
    const bodyY = dateY + 20;
    const bodyEndY = bodyY + bodyLines.length * lineHeight;
    const reactionY = bodyEndY + 6;
    const commentHeight = comment.reactionCount > 0
      ? reactionY + 4 - commentStart
      : bodyEndY + 4 - commentStart;

    currentY += Math.max(avatarSize + avatarGap, commentHeight + avatarGap);

    return {
      comment,
      avatarY: commentStart,
      nameY: authorNameY,
      nameY2: dateY,
      bodyY,
      bodyLines,
      reactionY,
    };
  });

  const bottomPadding = 80;
  const svgHeight = Math.max(currentY + bottomPadding, 300);

  const radius = 16;

  // ── Build SVG ──────────────────────────────────────────────────────────────

  const lines: string[] = [];

  lines.push(`<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="100%"
  height="${svgHeight}"
  viewBox="0 0 800 ${svgHeight}"
>
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap');
      text { font-family: Inter, system-ui, -apple-system, sans-serif; }
      a { text-decoration: underline; cursor: pointer; }
    </style>
  </defs>

  <!-- Background card -->
  <rect width="100%" height="${svgHeight}" rx="${radius}" fill="${colors.bg}" stroke="${colors.border}" stroke-width="1" />

  <!-- Header -->
  <text x="24" y="40" font-size="18" font-weight="700" fill="${colors.textPrimary}" letter-spacing="-0.3">💬 ${params.lang === "zh" ? "读者笔记" : "Reader Notes"}</text>
  <text x="24" y="62" font-size="13" fill="${colors.textTertiary}" letter-spacing="-0.1">${escapeXml(data.title)}</text>

  <line x1="24" y1="74" x2="776" y2="74" stroke="${colors.separator}" stroke-width="1" />`);

  // Comments
  const nameX = 24 + avatarSize + 12;

  for (const pc of positionedComments) {
    const { comment } = pc;

    // Avatar
    lines.push(`
  <image x="24" y="${pc.avatarY}" width="${avatarSize}" height="${avatarSize}" rx="${avatarSize / 2}" href="${escapeXml(comment.avatarUrl)}" />`);

    // Author
    lines.push(`
  <text x="${nameX}" y="${pc.nameY}" font-size="${compact ? 13 : 14}" font-weight="600" fill="${colors.textPrimary}" letter-spacing="-0.1">${escapeXml(comment.author)}</text>`);

    // Date
    lines.push(`
  <text x="${nameX}" y="${pc.nameY2}" font-size="12" fill="${colors.textTertiary}">${escapeXml(formatDate(comment.createdAt, params.lang))}</text>`);

    // Body (multi-line support)
    lines.push(`
  <text x="${nameX}" y="${pc.bodyY}" font-size="${compact ? 13 : 14}" fill="${colors.textSecondary}" letter-spacing="-0.1">${pc.bodyLines.map((line, i) =>
    i === 0
      ? `<tspan x="${nameX}" dy="0">${escapeXml(line)}</tspan>`
      : `<tspan x="${nameX}" dy="${lineHeight}">${escapeXml(line)}</tspan>`
  ).join("")}
  </text>`);

    // Reactions
    if (comment.reactionCount > 0) {
      lines.push(`
  <text x="${nameX}" y="${pc.reactionY}" font-size="13" fill="${colors.textTertiary}">❤️ ${comment.reactionCount}</text>`);
    }
  }

  // Footer
  const remaining = data.totalComments - data.comments.length;
  let footerY = currentY + 8;

  if (remaining > 0) {
    const moreText =
      params.lang === "zh"
        ? `还有 ${remaining} 条评论…`
        : `+${remaining} more comment${remaining !== 1 ? "s" : ""}…`;
    lines.push(`
  <line x1="24" y1="${currentY}" x2="776" y2="${currentY}" stroke="${colors.separator}" stroke-width="1" />
  <text x="24" y="${footerY}" font-size="13" fill="${colors.textTertiary}" font-style="italic">${escapeXml(moreText)}</text>`);
    footerY += 28;
  }

  const viewText = params.lang === "zh" ? "查看全部评论 →" : "View all comments →";
  const discussionUrl = `https://github.com/${repoConfig.owner}/${repoConfig.name}/discussions/${discussionNumber}`;
  lines.push(`
  <text x="24" y="${footerY + (remaining > 0 ? 0 : 28)}" font-size="13" fill="${colors.link}">
    <a href="${discussionUrl}">${escapeXml(viewText)}</a>
  </text>`);

  lines.push(`
</svg>`);

  return lines.join("");
}
