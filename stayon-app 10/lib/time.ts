import type { TKey } from "./i18n";

/** Compact relative time using existing i18n keys (justNow / hAgo / dAgo). */
export function timeAgo(ts: number, t: (k: TKey) => string): string {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3600e3);
  if (h < 1) return t("justNow");
  if (h < 24) return `${h}${t("hAgo")}`;
  return `${Math.floor(h / 24)}${t("dAgo")}`;
}
