import { PC_EN_DICT } from './dict';

declare global {
  interface Window {
    __PRODES_LOCALE__?: 'zh' | 'en';
  }
}

export function tr(text: string): string {
  try {
    const locale = typeof window !== 'undefined' ? window.__PRODES_LOCALE__ : 'zh';
    if (locale !== 'en') return text;
    return PC_EN_DICT[text] ?? text;
  } catch {
    return text;
  }
}

