import { Bell, Download, Gift, Search } from 'lucide-react';
import { tr } from '@/pc-en/tr';

/**
 * 父级「墨刀工作台」顶栏：与图2/3/4/5 一致；中间大搜索、右侧 礼物/下载/通知/头像
 * （墨刀AI 子站仍用 layout/Header.tsx，二者互不混用。）
 */
export function WorkbenchHeader() {
    return (
        <header
            className="z-10 flex h-14 w-full shrink-0 items-center gap-4 border-b border-slate-200/60 bg-white px-4 pl-4 pr-5 md:px-6"
        >
            <div className="hidden min-w-0 flex-1 md:block" />
            <div className="relative w-full min-w-0 max-w-2xl flex-1">
                <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                />
                <input
                    type="search"
                    placeholder={tr('搜索文件、素材')}
                    className="h-10 w-full max-w-2xl rounded-full border border-slate-200/80 bg-slate-50/80 pl-10 pr-3 text-sm text-slate-800 shadow-inner outline-none transition focus:border-slate-300 focus:bg-white focus:ring-1 focus:ring-slate-200 placeholder:text-slate-400"
                />
            </div>
            <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-2">
                <button
                    type="button"
                    className="hidden rounded-full p-2.5 text-slate-500 transition sm:flex hover:bg-slate-100"
                    title="Gift"
                >
                    <Gift className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </button>
                <button
                    type="button"
                    className="hidden rounded-full p-2.5 text-slate-500 transition sm:flex hover:bg-slate-100"
                    title={tr('下载')}
                >
                    <Download className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </button>
                <button
                    type="button"
                    className="rounded-full p-2.5 text-slate-500 transition hover:bg-slate-100"
                >
                    <Bell className="h-[18px] w-[18px]" strokeWidth={1.6} />
                </button>
                <div
                    className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white shadow-sm"
                    title={tr('用户')}
                >
                    W
                </div>
            </div>
        </header>
    );
}
