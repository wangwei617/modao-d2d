import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Image as ImageIcon,
    Paperclip,
    Plus,
    Send,
    Sparkles,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { tr } from '@/pc-en/tr';
import { Greeting } from '@/components/home/Greeting';
import { ModaoAIFullHome } from '@/components/home/ModaoAIFullHome';
import { FeatureCards } from '@/components/home/FeatureCards';
import {
    WORKBENCH_PRODUCTS,
    WORKBENCH_MORE_MENU_GROUPS,
    WORKBENCH_MORE_CARD,
    getWorkbenchProduct,
    type WorkbenchProductId,
} from '@/components/workbench/workbenchContent';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

function CardBadge({
    type,
    onDark,
    aiIdleClassName,
}: {
    type: 'ai' | 'new';
    onDark?: boolean;
    /** 未选卡上小「AI」标：浅底+主色边字（与产品卡 icon 主色成体系） */
    aiIdleClassName?: string;
}) {
    if (type === 'ai') {
        return (
            <span
                className={cn(
                    'absolute right-1.5 top-1.5 rounded px-1 py-0.5 text-[8px] font-bold tracking-tight',
                    onDark
                        ? 'border border-white/30 bg-white/20 text-white'
                        : (aiIdleClassName ?? 'bg-sky-500/95 text-white shadow-sm'),
                )}
            >
                AI
            </span>
        );
    }
    return (
        <span
            className={cn(
                'absolute right-1.5 top-1.5 rounded px-1 py-0.5 text-[8px] font-bold tracking-tight',
                onDark
                    ? 'border border-white/30 bg-white/20 text-white'
                    : 'bg-fuchsia-500 text-white shadow-sm',
            )}
        >
            NEW
        </span>
    );
}

const sendRing: Record<string, string> = {
    blue: 'bg-blue-500 hover:bg-blue-600 text-white',
    pink: 'bg-pink-500 hover:bg-rose-500 text-white',
    violet: 'bg-violet-600 hover:bg-violet-700 text-white',
    orange: 'bg-orange-500 hover:bg-orange-600 text-white',
    red: 'bg-red-500 hover:bg-red-600 text-white',
};

/**
 * 父级墨刀工作台 · 主区：五产品卡 + 分品类输入/快速开始/精选（与图2–5 一一对应；顶栏搜索在 WorkbenchHeader）
 */
export function WorkbenchHomePage() {
    const [productId, setProductId] = useState<WorkbenchProductId>('prototype');
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const moreCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [templateTab, setTemplateTab] = useState<'templates' | 'recent'>('templates');
    const [filterIdx, setFilterIdx] = useState(0);
    const [draft, setDraft] = useState('');
    const quickScrollRef = useRef<HTMLDivElement>(null);
    const [quickScrollArrows, setQuickScrollArrows] = useState({ showLeft: false, showRight: false });

    const p = useMemo(() => getWorkbenchProduct(productId), [productId]);
    const sendClass = sendRing[p.theme.send] ?? sendRing.blue;

    /**
     * 与「墨刀AI」Greeting 区同槽：外层统一 min-h，切 Tab 时产品卡行距顶（含 main 顶距）保持恒定。
     */
    const renderHero = () =>
        p.hero ? (
            <div className="flex w-full flex-col items-center justify-center text-center">
                <h1 className="w-full text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
                    {tr(p.hero.title)}
                </h1>
                <p className="mx-auto mt-2 w-full max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-[15px]">
                    {tr(p.hero.subtitle)}
                </p>
            </div>
        ) : null;

    const openMoreMenu = () => {
        if (moreCloseTimer.current) {
            clearTimeout(moreCloseTimer.current);
            moreCloseTimer.current = null;
        }
        setMoreMenuOpen(true);
    };
    const scheduleCloseMoreMenu = () => {
        if (moreCloseTimer.current) clearTimeout(moreCloseTimer.current);
        moreCloseTimer.current = setTimeout(() => setMoreMenuOpen(false), 120);
    };

    const updateQuickScrollArrows = useCallback(() => {
        const el = quickScrollRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setQuickScrollArrows({
            showLeft: scrollLeft > 2,
            showRight: scrollLeft < scrollWidth - clientWidth - 2,
        });
    }, []);

    useLayoutEffect(() => {
        updateQuickScrollArrows();
        const el = quickScrollRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            requestAnimationFrame(updateQuickScrollArrows);
        });
        ro.observe(el);
        el.addEventListener('scroll', updateQuickScrollArrows, { passive: true });
        return () => {
            ro.disconnect();
            el.removeEventListener('scroll', updateQuickScrollArrows);
        };
    }, [updateQuickScrollArrows, p.quickStart.length, productId]);

    const scrollQuick = (dir: 'left' | 'right') => {
        const el = quickScrollRef.current;
        if (!el) return;
        const step = Math.max(220, Math.floor(el.clientWidth * 0.55));
        el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
    };

    const renderProductRow = () => {
        const MoreGridIcon = WORKBENCH_MORE_CARD.icon;
        return (
            <div className="mb-7 w-full min-w-0">
                {/** 前五卡等宽，「更多」约为单卡宽度的 2/3（缩窄 1/3）；小屏可横滑 */}
                <div
                    className="flex w-full min-w-0 flex-nowrap gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:min-h-[64px] sm:grid-cols-[3fr_3fr_3fr_3fr_3fr_2fr] sm:items-stretch sm:gap-3.5 sm:overflow-visible sm:pb-0 sm:[&::-webkit-scrollbar]:hidden"
                >
                {WORKBENCH_PRODUCTS.map((item) => {
                    const active = item.id === productId;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setProductId(item.id);
                                setFilterIdx(0);
                            }}
                            className={cn(
                                'relative flex min-h-[64px] w-full min-w-0 flex-row items-center gap-2.5 rounded-xl p-2.5 text-left transition duration-200 max-sm:min-w-[10.875rem] max-sm:shrink-0 sm:min-h-[64px] sm:gap-3 sm:p-3.5',
                                active ? item.cardActive : item.cardIdle,
                                !active && 'hover:brightness-[0.99]',
                            )}
                        >
                            {item.cornerBadge === 'ai' && (
                                <CardBadge
                                    type="ai"
                                    onDark={active}
                                    aiIdleClassName={item.aiCornerIdleClass}
                                />
                            )}
                            {item.cornerBadge === 'new' && <CardBadge type="new" onDark={active} />}
                            {/** 行内 items-center：icon 与标题区上下居中；统一 p-3.5；小方圆角略收 */}
                            <div
                                className={cn(
                                    'mt-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                                    active ? item.iconChipActive : item.iconChipIdle,
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'h-4 w-4',
                                        active ? item.iconGlyphActive : 'text-white',
                                    )}
                                    strokeWidth={active ? 2.05 : 1.85}
                                />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col pr-0 sm:pr-0.5">
                                <div
                                    className={cn(
                                        'line-clamp-2 text-[13px] font-semibold leading-snug sm:text-sm',
                                        active ? 'text-white' : 'text-slate-800',
                                    )}
                                >
                                    {tr(item.name)}
                                </div>
                                <div
                                    className={cn(
                                        'mt-1 line-clamp-2 text-[11px] leading-snug sm:text-xs',
                                        active ? 'text-white/90' : 'text-slate-500',
                                    )}
                                >
                                    {tr(item.tagline)}
                                </div>
                            </div>
                        </button>
                    );
                })}
                <div
                    className="relative w-full min-w-0 max-sm:min-w-[7.25rem] max-sm:shrink-0"
                    onMouseEnter={openMoreMenu}
                    onMouseLeave={scheduleCloseMoreMenu}
                >
                    <div
                        className={cn(
                            'flex h-full min-h-[64px] w-full items-center gap-2.5 rounded-xl border-0 p-2.5 transition sm:min-h-[64px] sm:gap-3 sm:p-3.5',
                            moreMenuOpen
                                ? WORKBENCH_MORE_CARD.cardActive
                                : WORKBENCH_MORE_CARD.cardIdle,
                        )}
                    >
                        <div
                            className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                                moreMenuOpen
                                    ? WORKBENCH_MORE_CARD.iconChipActive
                                    : WORKBENCH_MORE_CARD.iconChipIdle,
                            )}
                        >
                            <MoreGridIcon
                                className={cn(
                                    'h-4 w-4',
                                    moreMenuOpen
                                        ? WORKBENCH_MORE_CARD.iconGlyphActive
                                        : 'text-white',
                                )}
                                strokeWidth={moreMenuOpen ? 2.05 : 1.9}
                                aria-hidden
                            />
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-0.5">
                                <span
                                    className={cn(
                                        'shrink-0 text-left text-[12px] font-semibold leading-none sm:text-[13px]',
                                        moreMenuOpen ? 'text-white' : 'text-slate-800',
                                    )}
                                >
                                    {tr('更多')}
                                </span>
                                {moreMenuOpen ? (
                                    <ChevronUp
                                        className="h-3.5 w-3.5 shrink-0 text-white/90"
                                        aria-hidden
                                    />
                                ) : (
                                    <ChevronDown
                                        className="h-3.5 w-3.5 shrink-0 text-[#14D3E7]/85"
                                        aria-hidden
                                    />
                                )}
                            </div>
                        </div>
                    {moreMenuOpen && (
                        <div
                            className="absolute right-0 top-full z-50 w-[min(22.5rem,calc(100vw-1.5rem))] min-w-[20rem] max-w-[calc(100vw-1.5rem)] pt-1.5"
                            onMouseEnter={openMoreMenu}
                            onMouseLeave={scheduleCloseMoreMenu}
                        >
                            {/** 参考图：白底、约 10px 圆角、轻阴影、行内 32 方色块 + 14/12 双行文案、组间细线 */}
                            <div
                                className="overflow-hidden rounded-[10px] border border-slate-200/70 bg-white py-2 text-left text-slate-900 shadow-[0_4px_28px_-6px_rgba(15,23,42,0.14),0_2px_8px_-2px_rgba(15,23,42,0.08)]"
                            >
                                {WORKBENCH_MORE_MENU_GROUPS.map((group, gi) => (
                                    <div key={gi}>
                                        {gi > 0 && (
                                            <div
                                                className="my-2 h-px bg-slate-100"
                                                role="separator"
                                            />
                                        )}
                                        {group.map((row) => {
                                            const RowIcon = row.Icon;
                                            return (
                                                <button
                                                    key={row.title}
                                                    type="button"
                                                    className="flex w-full items-center gap-3.5 px-4 py-2.5 text-left transition hover:bg-slate-50/90"
                                                >
                                                    <div
                                                        className={cn(
                                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded text-white',
                                                            row.iconTone,
                                                        )}
                                                    >
                                                        <RowIcon
                                                            className="h-[15px] w-[15px]"
                                                            strokeWidth={2.1}
                                                        />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-[14px] font-medium leading-tight text-slate-900">
                                                            {tr(row.title)}
                                                        </div>
                                                        <div className="mt-0.5 text-xs leading-[1.35] text-slate-500">
                                                            {tr(row.subtitle)}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </div>
        );
    };

    const renderInput = () => {
        if (p.id === 'modao-ai') return null;

        if (p.inputMode === 'prototype') {
            return (
                <div className="mb-7 w-full text-left">
                    <div className="mb-1.5 flex w-full items-center justify-start gap-1.5 text-[14px] font-medium">
                        <span className="text-violet-600">{tr(p.inputLabel)}</span>
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                    </div>
                    <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.05)]">
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            rows={3}
                            placeholder={tr(p.inputPlaceholder)}
                            className="w-full resize-none border-0 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
                        />
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <Select defaultValue="fast">
                                    <SelectTrigger className="h-8 w-[92px] gap-0 rounded-lg border-slate-200 text-xs">
                                        <Zap className="mr-1.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                                        <SelectValue placeholder={tr('极速')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fast">{tr('极速')}</SelectItem>
                                        <SelectItem value="std">{tr('标准')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <button
                                    type="button"
                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm"
                                >
                                    <ImageIcon className="h-3.5 w-3.5" />
                                    {tr('图片转原型')}
                                </button>
                            </div>
                            <div className="ml-auto flex items-center gap-1.5">
                                <button
                                    type="button"
                                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    className={cn(
                                        'inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow',
                                        'bg-blue-500 hover:bg-blue-600',
                                    )}
                                >
                                    <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="mb-7 w-full text-left">
                <div className="mb-1.5 flex w-full items-center justify-start gap-1.5 text-[14px] font-medium">
                    <span className={p.theme.inputAccent}>{tr(p.inputLabel)}</span>
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.05)]">
                    <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={3}
                        placeholder={tr(p.inputPlaceholder)}
                        className="w-full resize-none border-0 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <div className="mt-2 flex justify-end">
                        <button
                            type="button"
                            className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full shadow', sendClass)}
                        >
                            {p.inputMode === 'whiteboard' || p.inputMode === 'design' || p.inputMode === 'ppt' ? (
                                <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                            ) : (
                                <Send className="h-3.5 w-3.5" strokeWidth={2.2} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderQuick = () => {
        if (p.quickStart.length === 0) return null;
        return (
            <div className="mb-8 min-w-0 w-full">
                <div className="flex min-w-0 items-center gap-0.5 sm:gap-1">
                    {quickScrollArrows.showLeft && (
                        <button
                            type="button"
                            aria-label={tr('向左滚动')}
                            className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:h-10 sm:w-9"
                            onClick={() => scrollQuick('left')}
                        >
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                        </button>
                    )}
                    <div
                        ref={quickScrollRef}
                        className="min-w-0 flex-1 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] sm:[&::-webkit-scrollbar]:hidden"
                    >
                        {/** 单行横滑、不换行；primary「新建空白」：仅线性加号，无面型底 */}
                        <div className="flex w-max min-w-0 flex-nowrap items-stretch gap-2.5 pb-0.5 pt-0.5 sm:gap-3">
                            {p.quickStart.map((item) => {
                                const QIcon = item.Icon;
                                const isPrimary = !!item.primary;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            if (
                                                (p.id === 'prototype' || p.id === 'whiteboard') &&
                                                item.fillPromptKey
                                            ) {
                                                setDraft(tr(item.fillPromptKey));
                                            }
                                        }}
                                        className={cn(
                                            'group relative z-0 inline-flex shrink-0 origin-center transform-gpu items-center gap-2 overflow-visible transition-[transform,box-shadow] duration-300 motion-reduce:transition-none',
                                            isPrimary
                                                ? 'h-11 rounded-full border-0 px-4 text-white shadow-sm ring-1 ring-white/25 hover:z-10 hover:brightness-[0.97] hover:shadow-md motion-reduce:hover:brightness-100 sm:px-4'
                                                : 'h-11 gap-2 rounded-full border bg-white px-4 ease-[cubic-bezier(0.34,1.35,0.64,1)] hover:z-10 hover:scale-[1.04] hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)] motion-reduce:hover:scale-100 active:scale-[0.99] active:duration-150',
                                        )}
                                        style={
                                            isPrimary
                                                ? {
                                                      backgroundColor: item.color,
                                                      boxShadow: `0 2px 10px -2px color-mix(in srgb, ${item.color} 40%, transparent)`,
                                                  }
                                                : {
                                                      borderColor: '#E2E8F0',
                                                      backgroundColor: '#FFFFFF',
                                                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.07)',
                                                  }
                                        }
                                    >
                                        {!isPrimary && (
                                            <>
                                                <div
                                                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${item.color}16 0%, ${item.color}08 42%, transparent 72%)`,
                                                    }}
                                                />
                                                <div
                                                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                                    style={{ boxShadow: `inset 0 0 0 1px ${item.color}55` }}
                                                />
                                            </>
                                        )}
                                        {isPrimary ? (
                                            <Plus
                                                className="relative z-10 h-4 w-4 shrink-0 text-white"
                                                strokeWidth={2.4}
                                                fill="none"
                                            />
                                        ) : (
                                            <div
                                                className="icon-container relative z-10 flex h-4 w-4 shrink-0 items-center justify-center text-current [&_svg]:h-[15px] [&_svg]:w-[15px]"
                                                style={{ color: item.color, opacity: 0.92 }}
                                            >
                                                <QIcon strokeWidth={2.2} />
                                            </div>
                                        )}
                                        <span
                                            className={cn(
                                                'relative z-10 whitespace-nowrap text-left text-[14px] font-semibold leading-none',
                                                isPrimary
                                                    ? 'text-white'
                                                    : 'text-slate-700 transition-colors group-hover:text-slate-900',
                                            )}
                                        >
                                            {tr(item.label)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {quickScrollArrows.showRight && (
                        <button
                            type="button"
                            aria-label={tr('向右滚动')}
                            className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:h-10 sm:w-9"
                            onClick={() => scrollQuick('right')}
                        >
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderTemplateSection = () => {
        if (p.id === 'modao-ai') return null;
        return (
            <div className="w-full min-w-0">
                <div className="border-b border-slate-200/60">
                    <div className="mb-0 flex items-end gap-8">
                        <button
                            type="button"
                            onClick={() => setTemplateTab('templates')}
                            className={cn(
                                'relative -mb-px border-b-2 px-0 pb-2.5 text-sm font-semibold transition',
                                templateTab === 'templates'
                                    ? 'border-sky-500 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            )}
                        >
                            {tr('精选模版')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setTemplateTab('recent')}
                            className={cn(
                                'relative -mb-px border-b-2 px-0 pb-2.5 text-sm font-semibold transition',
                                templateTab === 'recent'
                                    ? 'border-sky-500 text-sky-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700',
                            )}
                        >
                            {tr('最近文件')}
                        </button>
                    </div>
                </div>
                {templateTab === 'templates' && p.templateFilters.length > 0 && (
                    <div className="mt-3">
                        {p.filterStyle === 'pill' ? (
                            <div className="flex flex-wrap gap-2">
                                {p.templateFilters.map((f, i) => (
                                    <button
                                        key={f + i}
                                        type="button"
                                        onClick={() => setFilterIdx(i)}
                                        className={cn(
                                            'rounded-full px-2.5 py-1 text-xs font-medium transition',
                                            i === filterIdx
                                                ? 'bg-slate-100 text-slate-900'
                                                : 'text-slate-500 hover:bg-slate-50',
                                        )}
                                    >
                                        {tr(f)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                                {p.templateFilters.map((f, i) => (
                                    <button
                                        key={f + i}
                                        type="button"
                                        onClick={() => setFilterIdx(i)}
                                        className={cn(
                                            'text-[13px] font-medium transition',
                                            i === filterIdx
                                                ? 'text-violet-600 underline decoration-violet-500 decoration-2 underline-offset-8'
                                                : 'text-slate-500 hover:text-slate-800',
                                        )}
                                    >
                                        {tr(f)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {templateTab === 'recent' ? (
                    <p className="py-12 text-center text-sm text-slate-400">
                        {tr('暂无最近文件，去创建一个吧')}
                    </p>
                ) : p.templateGridPreset && p.id === 'design' ? (
                    <div className="mt-5 grid w-full min-w-0 grid-cols-2 gap-2.5 min-[1024px]:grid-cols-4">
                        {p.templateGridPreset.map((x, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'flex min-w-0 aspect-[4/3] flex-col justify-end rounded-2xl border border-slate-200/60 bg-gradient-to-br p-3.5',
                                    x.tone,
                                )}
                            >
                                <p className="line-clamp-2 text-left text-sm font-semibold text-slate-800">{x.title}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-5 grid w-full min-w-0 grid-cols-2 gap-2.5 min-[1024px]:grid-cols-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-0 aspect-[4/3] rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-100/90 to-slate-50/40 shadow-sm"
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full min-w-0 pb-16">
            <div className="mx-auto w-full min-w-0 max-w-[1100px]">
                {/* 与墨刀AI 选中时 Greeting 占位对齐：各品类标题区同 min-h，产品 Tab 行距顶间距一致 */}
                <div className="mb-3 flex min-h-[6rem] w-full flex-col items-center justify-center sm:mb-4 sm:min-h-[6.25rem]">
                    {productId === 'modao-ai' ? (
                        <Greeting className="!mb-0 w-full" />
                    ) : (
                        renderHero()
                    )}
                </div>
                {renderProductRow()}
            </div>
            {productId === 'modao-ai' ? (
                <>
                    <div className="mx-auto w-full min-w-0 max-w-[1100px]">
                        <ModaoAIFullHome omitGreeting noFeatureCards />
                    </div>
                    {/** 精选案例通栏（与 main 左右 padding 抵消后全宽），仅左右各 24px 内边距 */}
                    <div className="box-border w-[calc(100%+2rem)] max-w-none -mx-4 px-[24px] md:-mx-8 md:w-[calc(100%+4rem)] md:px-[24px]">
                        <FeatureCards />
                    </div>
                </>
            ) : (
                <div className="mx-auto w-full min-w-0 max-w-[1100px]">
                    {renderInput()}
                    {renderQuick()}
                </div>
            )}
            {productId !== 'modao-ai' && (
                <div className="mt-8 box-border w-[calc(100%+2rem)] max-w-none -mx-4 px-4 md:-mx-8 md:w-[calc(100%+4rem)] md:px-8">
                    {renderTemplateSection()}
                </div>
            )}
        </div>
    );
}
