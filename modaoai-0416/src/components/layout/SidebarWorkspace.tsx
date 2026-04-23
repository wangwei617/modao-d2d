import { useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { tr } from '@/pc-en/tr';
import { useSidebarContext } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** 墨刀工作台 · 原型首页（与线上 workspace 一致，可按环境配置） */
export const MODAO_WORKSPACE_URL = 'https://modao.cc/workspace/home/proto';

type SpacePlan = 'free' | 'expired' | 'enterprise';

type SpaceRow = {
    id: string;
    name: string;
    plan: SpacePlan;
    members?: number;
};

const MOCK_SPACES: SpaceRow[] = [
    { id: 'personal', name: '个人空间', plan: 'free' },
    { id: 's1', name: '77', plan: 'expired', members: 1 },
    { id: 's2', name: '1234', plan: 'expired', members: 1 },
    { id: 's3', name: '随机用户mrj2ctghy…', plan: 'free', members: 4 },
    { id: 's4', name: 'ww的团队', plan: 'free', members: 1 },
    { id: 's5', name: '墨刀', plan: 'enterprise', members: 77 },
];

function SpacePlanBadge({ plan }: { plan: SpacePlan }) {
    if (plan === 'free') {
        return (
            <span className="rounded bg-slate-100 px-1 py-px text-[10px] font-medium text-slate-500">{tr('免费')}</span>
        );
    }
    if (plan === 'expired') {
        return (
            <span className="rounded bg-amber-50 px-1 py-px text-[10px] font-medium text-amber-700">{tr('已过期')}</span>
        );
    }
    return (
        <span className="rounded bg-amber-100/90 px-1 py-px text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200/80">
            {tr('企业VIP')}
        </span>
    );
}

export function SpaceAvatar({ name, className }: { name: string; className?: string }) {
    const letter = name.trim().slice(0, 1) || 'M';
    return (
        <div
            className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-600 text-[11px] font-bold text-white',
                className,
            )}
        >
            {letter}
        </div>
    );
}

/** 左侧栏左上角：墨刀 AI Logo，hover 显示返回，点击进本应用内「墨刀工作台首页」；⌘/Ctrl+点击仍打开线上工作台 */
export function ModaoAILogoWorkbenchButton({ size = 'md', className }: { size?: 'sm' | 'md'; className?: string }) {
    const { setAppSurface, setViewMode, setActiveNav, setWorkbenchView } = useSidebarContext();
    const dim = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
    const icon = size === 'sm' ? 14 : 16;
    return (
        <button
            type="button"
            onClick={(e) => {
                if (e.metaKey || e.ctrlKey) {
                    window.open(MODAO_WORKSPACE_URL, '_blank', 'noopener,noreferrer');
                    return;
                }
                setAppSurface('workbench-home');
                setViewMode('home');
                setActiveNav('home');
                setWorkbenchView('home');
            }}
            title={tr('返回墨刀工作台')}
            aria-label={tr('返回墨刀工作台')}
            className={cn(
                'group relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 text-white shadow-sm outline-none transition-colors hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2',
                dim,
                className,
            )}
        >
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 group-hover:opacity-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                </svg>
            </span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <ArrowLeft className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} strokeWidth={2.5} aria-hidden />
            </span>
        </button>
    );
}

/** 空间切换下拉（演示数据，可换 API） */
export function WorkspaceSwitcher({
    compact,
    align = 'start',
}: {
    /** 收起侧栏时的窄条触发器 */
    compact?: boolean;
    align?: 'start' | 'end';
}) {
    const [spaceId, setSpaceId] = useState('personal');
    const current = useMemo(() => MOCK_SPACES.find((s) => s.id === spaceId) ?? MOCK_SPACES[0], [spaceId]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'flex min-w-0 items-center gap-1.5 rounded-lg py-1 text-left outline-none transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-indigo-200',
                        compact ? 'max-w-[140px] pl-0.5 pr-1' : 'max-w-[11.5rem] pl-0.5 pr-1.5',
                    )}
                >
                    <SpaceAvatar name={current.name} className={compact ? 'h-6 w-6 text-[10px]' : undefined} />
                    {!compact && (
                        <span className="truncate text-[13px] font-semibold text-gray-900">{current.name}</span>
                    )}
                    {compact && <span className="truncate text-[12px] font-semibold text-gray-900">{current.name}</span>}
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} className="z-[60] w-[min(calc(100vw-2rem),320px)] rounded-xl p-1.5 shadow-lg">
                <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-[12px] font-semibold text-slate-500">
                    <span>{tr('空间列表')}</span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500">{MOCK_SPACES.length}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                {MOCK_SPACES.map((s) => (
                    <DropdownMenuItem
                        key={s.id}
                        className="cursor-pointer rounded-lg px-2 py-2 focus:bg-slate-50"
                        onSelect={() => setSpaceId(s.id)}
                    >
                        <div className="flex w-full items-start gap-2.5">
                            <SpaceAvatar name={s.name} />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="truncate text-[13px] font-medium text-slate-800">{s.name}</span>
                                    <SpacePlanBadge plan={s.plan} />
                                </div>
                                {typeof s.members === 'number' && (
                                    <div className="mt-0.5 text-[10px] text-slate-400">
                                        {tr('成员数')} {s.members}
                                    </div>
                                )}
                            </div>
                            {s.id === spaceId && <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" strokeWidth={2.5} />}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
