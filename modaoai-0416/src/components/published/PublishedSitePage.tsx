import { useMemo, useState, useRef, useEffect } from 'react';
import { PackageX, Sparkles } from 'lucide-react';
import { getPublishedSiteRecord } from '@/lib/publishedSiteStorage';
import { tr } from '@/pc-en/tr';
import { cn } from '@/lib/utils';

/** 线上「生成同款」等能力的入口占位，可按实际产品域名替换 */
const MODAO_AI_GENERATE_URL = 'https://modao.cc';

/** 已发布快照页右下角：生成同款 + 帮助问号（样式对齐线上常见悬浮条） */
function PublishedSiteFloatingBar() {
  const [helpOpen, setHelpOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!helpOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [helpOpen]);

  return (
    <div ref={wrapRef} className="fixed bottom-5 right-5 z-40 flex flex-row items-center gap-2">
      {helpOpen && (
        <div
          className="absolute bottom-[calc(100%+10px)] right-0 w-[min(calc(100vw-2rem),260px)] rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] leading-relaxed text-slate-600 shadow-xl shadow-slate-200/60"
          role="tooltip"
        >
          {tr('本页面为已发布作品的预览。点击「生成同款」前往墨刀 AI；点「?」可再次查看此说明。')}
        </div>
      )}
      <button
        type="button"
        onClick={() => window.open(MODAO_AI_GENERATE_URL, '_blank', 'noopener,noreferrer')}
        className={cn(
          'flex items-center gap-2 rounded-full border border-slate-200/95 bg-white py-1.5 pl-1.5 pr-3.5',
          'shadow-[0_4px_24px_-4px_rgba(99,102,241,0.28)] hover:shadow-[0_6px_28px_-4px_rgba(99,102,241,0.38)]',
          'transition-shadow active:scale-[0.98]'
        )}
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white shadow-sm"
          aria-hidden
        >
          A
        </span>
        <span className="text-[13px] font-semibold text-slate-700">{tr('生成同款')}</span>
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" strokeWidth={2.25} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => setHelpOpen((v) => !v)}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/95 bg-white',
          'text-[15px] font-bold text-slate-600 shadow-[0_4px_24px_-4px_rgba(99,102,241,0.22)]',
          'hover:shadow-[0_6px_28px_-4px_rgba(99,102,241,0.32)] transition-shadow active:scale-[0.98]',
          helpOpen && 'ring-2 ring-indigo-200'
        )}
        aria-expanded={helpOpen}
        aria-label={tr('帮助')}
      >
        ?
      </button>
    </div>
  );
}

export function PublishedSitePage({ slug }: { slug: string }) {
  const record = useMemo(() => getPublishedSiteRecord(slug), [slug]);
  const isLive = record?.live === true;
  const html = record?.html ?? '';

  if (isLive) {
    return (
      <div className="relative min-h-screen w-full bg-white">
        <iframe
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          srcDoc={html}
          title={tr('已发布站点')}
          className="min-h-screen w-full border-none bg-white"
        />
        <PublishedSiteFloatingBar />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <PackageX className="h-8 w-8 text-slate-400" strokeWidth={1.75} />
      </div>
      <h1 className="mb-2 text-center text-[18px] font-bold text-slate-800">{tr('产品已下架')}</h1>
      <p className="max-w-sm text-center text-[14px] leading-relaxed text-slate-500">
        {tr('该产品已下架或链接无效，无法继续访问。')}
      </p>
    </div>
  );
}
