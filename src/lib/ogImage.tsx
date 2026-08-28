import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import satori, { type Font } from "satori";
import sharp from "sharp";

import { HOME_DESCRIPTION_LINES } from "./siteCopy";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

const PHI = 1.618;
const PHI_HALF_STEP = Math.sqrt(PHI);
const PHI_QUARTER_STEP = Math.sqrt(PHI_HALF_STEP);
const PHI_EIGHTH_STEP = Math.sqrt(PHI_QUARTER_STEP);
const BASE_SPACE = Math.round(OG_IMAGE_SIZE.height / PHI ** 7);
const BASE_FONT_SIZE = 16;

export const OG_IMAGE_SPACING = {
  xs: Math.round(BASE_SPACE / PHI),
  sm: BASE_SPACE,
  md: Math.round(BASE_SPACE * PHI),
  lg: Math.round(BASE_SPACE * PHI ** 2),
  xl: Math.round(BASE_SPACE * PHI ** 3),
  "2xl": Math.round(BASE_SPACE * PHI ** 4),
} as const;

const DISPLAY_FONT_SIZE = Math.round(BASE_FONT_SIZE * PHI ** 3);
const ARTICLE_TITLE_FONT_SIZES = [
  DISPLAY_FONT_SIZE,
  Math.round(DISPLAY_FONT_SIZE / PHI_QUARTER_STEP),
  Math.round(DISPLAY_FONT_SIZE / PHI_QUARTER_STEP ** 2),
  Math.round(DISPLAY_FONT_SIZE / PHI_QUARTER_STEP ** 3),
  Math.round(DISPLAY_FONT_SIZE / PHI_QUARTER_STEP ** 4),
] as const;

export const OG_IMAGE_LAYOUT = {
  articleBrandTop: 128,
  articleHeadlineTop: 168,
  articleRightInset: 56,
  articleSeparatorTop: 400,
  cardMargin: 32,
  contentLeft: 96,
  mascotWidth: 256,
  siteHeadlineTop: 128,
  siteSeparatorTop: 408,
} as const;

export type ResolvedOgImageLayout = {
  [Key in keyof typeof OG_IMAGE_LAYOUT]: number;
};

export type OgImageLayoutOverrides = Partial<ResolvedOgImageLayout>;

export const OG_IMAGE_COPY = {
  title: "KJR020's Blog",
  description: HOME_DESCRIPTION_LINES[0],
  url: "kjr020.dev",
} as const;

export type OgImageContent =
  | {
      kind: "site";
    }
  | {
      kind: "article";
      publishedAt: Date | string;
      title: string;
      url: string;
    };

type GenerateOgImageOptions = {
  content?: OgImageContent;
  layout?: OgImageLayoutOverrides;
  photoPath: string;
  sansBoldFontPath: string;
  outputPath: string;
};

type OgImageSourceOptions = Omit<GenerateOgImageOptions, "outputPath">;

const SITE_OG_IMAGE_CONTENT: OgImageContent = { kind: "site" };

function createFonts(sansBoldFont: Buffer): Font[] {
  return [{ name: "Noto Sans JP", data: sansBoldFont, weight: 700, style: "normal" }];
}

function formatPublishedDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Tokyo",
    year: "numeric",
  }).format(date);
}

function measureTitleLength(title: string): number {
  return Array.from(title).reduce((length, character) => {
    return length + (/^[\u0020-\u007e]$/.test(character) ? 0.56 : 1);
  }, 0);
}

function getArticleTitleFontSize(title: string): number {
  const length = measureTitleLength(title);

  if (length <= 18) return ARTICLE_TITLE_FONT_SIZES[0];
  if (length <= 28) return ARTICLE_TITLE_FONT_SIZES[1];
  if (length <= 38) return ARTICLE_TITLE_FONT_SIZES[2];
  if (length <= 48) return ARTICLE_TITLE_FONT_SIZES[3];
  return ARTICLE_TITLE_FONT_SIZES[4];
}

export function resolveOgImageLayout(
  overrides: OgImageLayoutOverrides = {},
): ResolvedOgImageLayout {
  return {
    ...OG_IMAGE_LAYOUT,
    ...overrides,
  };
}

type ArticleTitleLayout = {
  fontSize: number;
  lines: string[];
};

const QUOTE_PAIRS = [
  ["『", "』"],
  ["「", "」"],
] as const;

function findQuotedTitleParts(title: string): string[] | undefined {
  for (const [openingQuote, closingQuote] of QUOTE_PAIRS) {
    const openingIndex = title.indexOf(openingQuote);
    const closingIndex = title.indexOf(closingQuote, openingIndex + openingQuote.length);

    if (openingIndex <= 0 || closingIndex < 0) continue;

    const prefix = title.slice(0, openingIndex).trim();
    const quotedTitleWithSuffix = title.slice(openingIndex).trim();

    if (prefix && quotedTitleWithSuffix) return [prefix, quotedTitleWithSuffix];
  }

  return undefined;
}

function getLargestFittingTitleFontSize(lines: string[], availableWidth: number): number {
  const longestLineLength = Math.max(...lines.map(measureTitleLength));

  return (
    ARTICLE_TITLE_FONT_SIZES.find((fontSize) => longestLineLength * fontSize <= availableWidth) ??
    ARTICLE_TITLE_FONT_SIZES.at(-1) ??
    DISPLAY_FONT_SIZE
  );
}

export function createArticleTitleLayout(
  title: string,
  availableWidth?: number,
): ArticleTitleLayout {
  const cardWidth = OG_IMAGE_SIZE.width - OG_IMAGE_LAYOUT.cardMargin * 2;
  const resolvedAvailableWidth =
    availableWidth ?? cardWidth - OG_IMAGE_LAYOUT.contentLeft - OG_IMAGE_LAYOUT.articleRightInset;
  const semanticLines = findQuotedTitleParts(title);

  if (!semanticLines) {
    return {
      fontSize: getArticleTitleFontSize(title),
      lines: [title],
    };
  }

  return {
    fontSize: getLargestFittingTitleFontSize(semanticLines, resolvedAvailableWidth),
    lines: semanticLines,
  };
}

export async function createOgImageSvg({
  content = SITE_OG_IMAGE_CONTENT,
  layout: layoutOverrides,
  photoPath,
  sansBoldFontPath,
}: OgImageSourceOptions): Promise<string> {
  const [photo, sansBoldFont] = await Promise.all([
    readFile(photoPath),
    readFile(sansBoldFontPath),
  ]);
  const photoDataUrl = `data:image/png;base64,${photo.toString("base64")}`;
  const isArticle = content.kind === "article";
  const brand = isArticle ? OG_IMAGE_COPY.title : undefined;
  const headline = isArticle ? content.title : OG_IMAGE_COPY.title;
  const subheadline = isArticle ? undefined : OG_IMAGE_COPY.description;
  const publishedDate = isArticle ? formatPublishedDate(content.publishedAt) : undefined;
  const siteUrl = isArticle ? content.url : OG_IMAGE_COPY.url;
  const layout = resolveOgImageLayout(layoutOverrides);
  const cardWidth = OG_IMAGE_SIZE.width - layout.cardMargin * 2;
  const cardHeight = OG_IMAGE_SIZE.height - layout.cardMargin * 2;
  const mascotWidth = layout.mascotWidth;
  const mascotHeight = Math.round(mascotWidth / PHI_EIGHTH_STEP);
  const siteHeadlineWidth =
    cardWidth - layout.contentLeft - OG_IMAGE_SPACING.lg - mascotWidth - OG_IMAGE_SPACING.md;
  const articleHeadlineWidth = cardWidth - layout.contentLeft - layout.articleRightInset;
  const articleTitleLayout = isArticle
    ? createArticleTitleLayout(content.title, articleHeadlineWidth)
    : undefined;
  const headlineFontSize = articleTitleLayout?.fontSize ?? DISPLAY_FONT_SIZE;
  const headlineWidth = isArticle ? articleHeadlineWidth : siteHeadlineWidth;
  const siteSubheadlineTop =
    layout.siteHeadlineTop + Math.round(DISPLAY_FONT_SIZE * PHI_HALF_STEP) + OG_IMAGE_SPACING.sm;
  const metadataFontSize = Math.round(BASE_FONT_SIZE * PHI_HALF_STEP);
  const separatorTop = isArticle ? layout.articleSeparatorTop : layout.siteSeparatorTop;
  const metadataTop = separatorTop + OG_IMAGE_SPACING.md;

  return satori(
    <div
      style={{
        alignItems: "center",
        background: "#f8fafc",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          border: "2px solid #e2e8f0",
          borderRadius: OG_IMAGE_SPACING.sm,
          boxShadow: `0 ${OG_IMAGE_SPACING.sm}px ${OG_IMAGE_SPACING.xl}px rgba(15, 23, 42, 0.08)`,
          display: "flex",
          height: cardHeight,
          overflow: "hidden",
          position: "relative",
          width: cardWidth,
        }}
      >
        <div
          style={{
            background: "#2563eb",
            borderRadius: OG_IMAGE_SPACING.xs,
            display: "flex",
            height: cardHeight - OG_IMAGE_SPACING.lg * 2,
            left: OG_IMAGE_SPACING.md,
            position: "absolute",
            top: OG_IMAGE_SPACING.lg,
            width: Math.round(OG_IMAGE_SPACING.xs / PHI_HALF_STEP),
          }}
        />

        {brand && (
          <div
            data-og-role="brand"
            style={{
              color: "#2563eb",
              display: "flex",
              fontFamily: "Noto Sans JP",
              fontSize: Math.round(BASE_FONT_SIZE * PHI),
              fontWeight: 700,
              left: layout.contentLeft,
              letterSpacing: "-0.02em",
              lineHeight: PHI_HALF_STEP,
              position: "absolute",
              top: layout.articleBrandTop,
              whiteSpace: "nowrap",
            }}
          >
            {brand}
          </div>
        )}

        <div
          data-og-role="headline"
          lang="ja-JP"
          style={{
            color: "#0f172a",
            display: "flex",
            flexDirection:
              articleTitleLayout && articleTitleLayout.lines.length > 1 ? "column" : "row",
            fontFamily: "Noto Sans JP",
            fontSize: headlineFontSize,
            fontWeight: 700,
            height:
              separatorTop -
              (isArticle ? layout.articleHeadlineTop : layout.siteHeadlineTop) -
              OG_IMAGE_SPACING.md,
            left: layout.contentLeft,
            letterSpacing: "-0.022em",
            lineHeight: PHI_HALF_STEP,
            overflow: "hidden",
            position: "absolute",
            top: isArticle ? layout.articleHeadlineTop : layout.siteHeadlineTop,
            width: headlineWidth,
          }}
        >
          {articleTitleLayout && articleTitleLayout.lines.length > 1
            ? articleTitleLayout.lines.map((line) => (
                <div key={line} style={{ display: "flex", whiteSpace: "nowrap" }}>
                  {line}
                </div>
              ))
            : headline}
        </div>

        {subheadline && (
          <div
            data-og-role="subheadline"
            lang="ja-JP"
            style={{
              color: "#475569",
              display: "flex",
              fontFamily: "Noto Sans JP",
              fontSize: Math.round(BASE_FONT_SIZE * PHI),
              fontWeight: 700,
              left: layout.contentLeft,
              lineHeight: PHI_HALF_STEP,
              position: "absolute",
              top: siteSubheadlineTop,
              whiteSpace: "nowrap",
            }}
          >
            {subheadline}
          </div>
        )}

        <div
          data-og-role="separator"
          style={{
            background: "#e2e8f0",
            display: "flex",
            height: 2,
            left: layout.contentLeft,
            position: "absolute",
            top: separatorTop,
            width: siteHeadlineWidth,
          }}
        />

        <div
          data-og-role="metadata"
          style={{
            alignItems: "center",
            color: "#64748b",
            display: "flex",
            fontFamily: "Noto Sans JP",
            fontSize: metadataFontSize,
            fontWeight: 700,
            left: layout.contentLeft,
            lineHeight: PHI_HALF_STEP,
            position: "absolute",
            top: metadataTop,
          }}
        >
          {publishedDate && (
            <>
              <div style={{ display: "flex", whiteSpace: "nowrap" }}>{publishedDate}</div>
              <div
                style={{
                  background: "#e2e8f0",
                  display: "flex",
                  height: OG_IMAGE_SPACING.md,
                  margin: `0 ${OG_IMAGE_SPACING.md}px`,
                  width: 2,
                }}
              />
            </>
          )}
          <div
            data-og-role="url"
            style={{
              color: "#2563eb",
              display: "flex",
              fontFamily: "Noto Sans JP",
              fontSize: metadataFontSize,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {siteUrl}
          </div>
        </div>

        <img
          alt=""
          data-og-role="mascot"
          height={mascotHeight}
          src={photoDataUrl}
          style={{
            bottom: OG_IMAGE_SPACING.md,
            objectFit: "contain",
            position: "absolute",
            right: OG_IMAGE_SPACING.lg,
          }}
          width={mascotWidth}
        />
      </div>
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts: createFonts(sansBoldFont),
      pointScaleFactor: 2,
    },
  );
}

export async function createOgImagePng(options: OgImageSourceOptions): Promise<Buffer> {
  const svg = await createOgImageSvg(options);

  return sharp(Buffer.from(svg))
    .png({ adaptiveFiltering: false, compressionLevel: 9, palette: false })
    .toBuffer();
}

export async function generateOgImage({
  outputPath,
  ...sourceOptions
}: GenerateOgImageOptions): Promise<void> {
  const png = await createOgImagePng(sourceOptions);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, png);
}
