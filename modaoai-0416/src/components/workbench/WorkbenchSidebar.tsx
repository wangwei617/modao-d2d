import { useState } from 'react';
import { Clock, Home, Settings, Star, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/context/SidebarContext';
import { tr } from '@/pc-en/tr';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkspaceSwitcher } from '@/components/layout/SidebarWorkspace';

/**
 * 父级「墨刀工作台」左侧栏：与图2–5 结构一致（与墨刀AI 子站侧栏完全独立）。
 * 墨刀AI 为子集入口，点击后进入子站 `appSurface=ai-home`。
 */
function WbTab({
    active,
    onClick,
    icon,
    label,
    badge,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    badge?: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                active
                    ? 'bg-slate-100/90 text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50',
            )}
        >
            <span className="shrink-0 text-slate-500">{icon}</span>
            <span className="min-w-0 flex-1 truncate">{label}</span>
            {badge}
        </button>
    );
}

function WbSub({ onClick, label, active }: { onClick: () => void; label: string; active: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'w-full rounded-lg py-2 pl-9 pr-2 text-left text-[13px] transition',
                active ? 'font-medium text-slate-800' : 'text-slate-500 hover:text-slate-800',
            )}
        >
            {label}
        </button>
    );
}

export function WorkbenchSidebar() {
    const {
        setAppSurface,
        setActiveNav,
        setViewMode,
        workbenchView,
        setWorkbenchView,
    } = useSidebarContext();
    const [spaceOpen] = useState(true);

    const go = (key: string) => {
        setWorkbenchView(key);
        setActiveNav('home');
    };

    const goModaoAI = () => {
        setAppSurface('ai-home');
        setActiveNav('modao-ai');
        setViewMode('home');
    };

    return (
        <aside
            className={cn(
                'flex h-full w-[260px] shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-[#FAFAFA]',
                'md:w-[272px]',
            )}
        >
            <div className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/60 px-3">
                <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E54B4B] text-[15px] font-black leading-none text-white shadow-sm"
                    title="Modao"
                >
                    M
                </div>
                <span className="truncate text-[15px] font-bold text-slate-800">{tr('墨刀')}</span>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-1 px-2 py-3">
                    <WbTab
                        active={workbenchView === 'home'}
                        onClick={() => go('home')}
                        label={tr('首页')}
                        icon={<Home className="h-4 w-4" strokeWidth={2} />}
                    />
                    <WbTab
                        active={workbenchView === 'recent'}
                        onClick={() => go('recent')}
                        label={tr('最近文件')}
                        icon={<Clock className="h-4 w-4" strokeWidth={2} />}
                    />
                    <WbTab
                        active={workbenchView === 'fav'}
                        onClick={() => go('fav')}
                        label={tr('我的收藏')}
                        icon={<Star className="h-4 w-4" strokeWidth={2} />}
                    />
                    <WbTab
                        active={workbenchView === 'plaza'}
                        onClick={() => go('plaza')}
                        label={tr('素材广场')}
                        icon={<Store className="h-4 w-4" strokeWidth={2} />}
                        badge={
                            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-800">
                                2W+ 赛
                            </span>
                        }
                    />
                    <WbTab
                        active={false}
                        onClick={goModaoAI}
                        label={tr('墨刀AI')}
                        icon={
                            <span className="flex h-4 w-4 items-center justify-center rounded bg-sky-500 text-[8px] font-bold text-white">
                                AI
                            </span>
                        }
                    />
                </div>

                <div className="mx-2 my-2 border-t border-slate-200/80" />

                <div className="px-2 pb-2">
                    <div className="mb-1 flex items-center justify-between gap-1 px-1">
                        <WorkspaceSwitcher align="start" />
                        <button
                            type="button"
                            className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <Settings className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    {spaceOpen && (
                        <div className="mt-1 space-y-0.5 pl-0.5">
                            <WbSub
                                active={workbenchView === 'space-files'}
                                onClick={() => go('space-files')}
                                label={tr('我的文件')}
                            />
                            <WbSub
                                active={workbenchView === 'trash'}
                                onClick={() => go('trash')}
                                label={tr('回收站')}
                            />
                            <WbSub
                                active={workbenchView === 'space-admin'}
                                onClick={() => go('space-admin')}
                                label={tr('空间管理')}
                            />
                            <WbSub
                                active={workbenchView === 'lib'}
                                onClick={() => go('lib')}
                                label={tr('素材库')}
                            />
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-slate-200/60 bg-[#F5F5F5]/80 p-3">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    {tr('文件数')}
                </p>
                <div className="mb-3 grid grid-cols-2 gap-1.5 text-[10px]">
                    {['原型', '白板', '设计', 'AIPPT'].map((k) => (
                        <div
                            key={k}
                            className="flex items-center justify-between rounded-md bg-white px-2 py-1.5 text-slate-600 ring-1 ring-slate-200/80"
                        >
                            <span>{k}</span>
                            <span className="font-mono text-slate-500">3/3</span>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
                >
                    <span className="text-base leading-none">↑</span>
                    {tr('升级会员')}
                </button>
            </div>
        </aside>
    );
}
