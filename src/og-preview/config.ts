import {
  type OgImageLayoutOverrides,
  type ResolvedOgImageLayout,
  resolveOgImageLayout,
} from "@/lib/ogImage";

type PreviewLayoutKey =
  | "articleBrandTop"
  | "articleHeadlineTop"
  | "articleRightInset"
  | "articleSeparatorTop"
  | "cardMargin"
  | "contentLeft"
  | "mascotWidth"
  | "siteHeadlineTop"
  | "siteSeparatorTop";

type PreviewLayoutField = {
  key: PreviewLayoutKey;
  label: string;
  max: number;
  min: number;
  step: number;
};

export const OG_PREVIEW_DEFAULT_TITLE =
  "AI時代にUX設計を学ぶため、『The Elements of User Experience』を読んだ";

export const OG_PREVIEW_LAYOUT_FIELDS = [
  { key: "cardMargin", label: "カード外周", min: 14, max: 58, step: 1 },
  { key: "contentLeft", label: "左側の内容余白", min: 58, max: 151, step: 1 },
  { key: "siteHeadlineTop", label: "共通タイトル上位置", min: 58, max: 180, step: 1 },
  { key: "siteSeparatorTop", label: "共通区切り線上位置", min: 260, max: 480, step: 1 },
  { key: "articleBrandTop", label: "記事ブログ名上位置", min: 48, max: 160, step: 1 },
  { key: "articleHeadlineTop", label: "記事タイトル上位置", min: 58, max: 180, step: 1 },
  { key: "articleSeparatorTop", label: "記事区切り線上位置", min: 260, max: 480, step: 1 },
  { key: "articleRightInset", label: "記事タイトル右余白", min: 36, max: 320, step: 1 },
  { key: "mascotWidth", label: "マスコット領域幅", min: 120, max: 260, step: 1 },
] as const satisfies readonly PreviewLayoutField[];

export const OG_PREVIEW_PRESETS = {
  current: resolveOgImageLayout(),
  previous: resolveOgImageLayout({
    articleBrandTop: 58,
    articleHeadlineTop: 93,
    articleRightInset: 58,
    articleSeparatorTop: 347,
    cardMargin: 22,
    contentLeft: 93,
    mascotWidth: 192,
    siteHeadlineTop: 129,
    siteSeparatorTop: 328,
  }),
} satisfies Record<"current" | "previous", ResolvedOgImageLayout>;

export function parseOgPreviewLayout(searchParams: URLSearchParams): OgImageLayoutOverrides {
  const layout: Partial<Record<PreviewLayoutKey, number>> = {};

  for (const field of OG_PREVIEW_LAYOUT_FIELDS) {
    const rawValue = searchParams.get(field.key);
    if (rawValue === null) continue;

    const value = Number(rawValue);
    if (!Number.isFinite(value)) continue;

    layout[field.key] = Math.min(field.max, Math.max(field.min, Math.round(value)));
  }

  return layout;
}
