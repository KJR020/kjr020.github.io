export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export const PHI = 1.618;
export const PHI_HALF_STEP = Math.sqrt(PHI);
const PHI_QUARTER_STEP = Math.sqrt(PHI_HALF_STEP);
export const PHI_EIGHTH_STEP = Math.sqrt(PHI_QUARTER_STEP);
const BASE_SPACE = Math.round(OG_IMAGE_SIZE.height / PHI ** 7);
export const BASE_FONT_SIZE = 16;

export const OG_IMAGE_SPACING = {
  xs: Math.round(BASE_SPACE / PHI),
  sm: BASE_SPACE,
  md: Math.round(BASE_SPACE * PHI),
  lg: Math.round(BASE_SPACE * PHI ** 2),
  xl: Math.round(BASE_SPACE * PHI ** 3),
  "2xl": Math.round(BASE_SPACE * PHI ** 4),
} as const;

export const DISPLAY_FONT_SIZE = Math.round(BASE_FONT_SIZE * PHI ** 3);
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

export function resolveOgImageLayout(
  overrides: OgImageLayoutOverrides = {},
): ResolvedOgImageLayout {
  return {
    ...OG_IMAGE_LAYOUT,
    ...overrides,
  };
}

export type ArticleTitleLayout = {
  fontSize: number;
  lines: string[];
};

const QUOTE_PAIRS = [
  ["『", "』"],
  ["「", "」"],
] as const;

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
