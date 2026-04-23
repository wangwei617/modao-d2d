export type PublishedSiteRecord = {
  slug: string;
  live: boolean;
  html: string;
  updatedAt: number;
};

const storageKey = (slug: string) => `modao_d2d_published_site:${slug}`;

export function savePublishedSiteRecord(data: PublishedSiteRecord): void {
  try {
    localStorage.setItem(storageKey(data.slug), JSON.stringify(data));
  } catch (e) {
    console.warn('savePublishedSiteRecord failed', e);
  }
}

export function getPublishedSiteRecord(slug: string): PublishedSiteRecord | null {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    return JSON.parse(raw) as PublishedSiteRecord;
  } catch {
    return null;
  }
}

export function setPublishedSiteLive(slug: string, live: boolean): void {
  const rec = getPublishedSiteRecord(slug);
  if (!rec) return;
  savePublishedSiteRecord({ ...rec, live, updatedAt: Date.now() });
}

/** 本地演示：打开可交互的「已发布站点」预览页（与 Vite base 一致） */
export function buildPublishedViewerUrl(slug: string): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const isEn = typeof window !== 'undefined' && window.__PRODES_LOCALE__ === 'en';
  const enc = encodeURIComponent(slug);
  const hash = isEn ? `#/en/site/${enc}` : `#/site/${enc}`;
  return `${normalizedBase}${hash}`;
}
