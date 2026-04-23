import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/context/SidebarContext';
import { tr } from '@/pc-en/tr';
import { HOME_CASES, type HomeCaseItem } from './homeContent';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/** 精选区筛选：与「业务/形态类原型」区分，不作为 Tab 下二级筛选标签 */
const PROTOTYPE_SOURCE_METHOD_TAGS = new Set<string>(['图片转原型', 'AI生成原型', 'HTML转原型', '素材转原型']);

/** 与一级 Tab id 对应，标题为「精选」+ 一级能力名（与首页一级 Tab 文案一致） */
const FEATURED_TITLE_TR_KEY: Record<string, string> = {
    generate: '精选生成应用',
    prototype: '精选原型设计',
    planning: '精选需求策划',
    image: '精选图片',
    video: '精选视频',
    ppt: '精选PPT',
    diagrams: '精选流程/导图',
    testing: '精选研发测试',
    marketing: '精选运营推广',
};

const ALL_FILTER_VALUE = '__feature_filter_all__';

const ACCENT_STYLES: Record<HomeCaseItem['accent'], {
  cardHover: string;
  surface: string;
  badge: string;
  title: string;
  subtitle: string;
}> = {
  indigo: {
    cardHover: 'hover:border-indigo-200',
    surface: 'from-indigo-50 to-purple-50',
    badge: 'text-indigo-800 bg-white/60',
    title: 'text-indigo-900',
    subtitle: 'text-indigo-800/90',
  },
  emerald: {
    cardHover: 'hover:border-emerald-200',
    surface: 'from-emerald-50 to-teal-50',
    badge: 'text-emerald-800 bg-white/60',
    title: 'text-emerald-900',
    subtitle: 'text-emerald-800/90',
  },
  orange: {
    cardHover: 'hover:border-orange-200',
    surface: 'from-orange-50 to-amber-50',
    badge: 'text-orange-800 bg-white/60',
    title: 'text-orange-900',
    subtitle: 'text-orange-800/90',
  },
  blue: {
    cardHover: 'hover:border-blue-200',
    surface: 'from-blue-50 to-cyan-50',
    badge: 'text-blue-800 bg-white/60',
    title: 'text-blue-900',
    subtitle: 'text-blue-800/90',
  },
  pink: {
    cardHover: 'hover:border-pink-200',
    surface: 'from-pink-50 to-rose-50',
    badge: 'text-pink-800 bg-white/60',
    title: 'text-pink-900',
    subtitle: 'text-pink-800/90',
  },
  violet: {
    cardHover: 'hover:border-violet-200',
    surface: 'from-violet-50 to-fuchsia-50',
    badge: 'text-violet-800 bg-white/60',
    title: 'text-violet-900',
    subtitle: 'text-violet-800/90',
  },
  cyan: {
    cardHover: 'hover:border-cyan-200',
    surface: 'from-cyan-50 to-sky-50',
    badge: 'text-cyan-800 bg-white/60',
    title: 'text-cyan-900',
    subtitle: 'text-cyan-800/90',
  },
  amber: {
    cardHover: 'hover:border-amber-200',
    surface: 'from-amber-50 to-yellow-50',
    badge: 'text-amber-800 bg-white/60',
    title: 'text-amber-900',
    subtitle: 'text-amber-800/90',
  },
  teal: {
    cardHover: 'hover:border-teal-200',
    surface: 'from-teal-50 to-emerald-50',
    badge: 'text-teal-800 bg-white/60',
    title: 'text-teal-900',
    subtitle: 'text-teal-800/90',
  },
};

export function FeatureCards() {
  const { homeActiveTab } = useSidebarContext();
  const [caseFilterTag, setCaseFilterTag] = useState<string | null>(null);

  useEffect(() => {
    setCaseFilterTag(null);
  }, [homeActiveTab]);

  const sectionTitle = useMemo(() => {
    if (!homeActiveTab) return tr('精选案例');
    const key = FEATURED_TITLE_TR_KEY[homeActiveTab];
    return key ? tr(key) : tr('精选案例');
  }, [homeActiveTab]);

  const secondaryFilters = useMemo(() => {
    if (!homeActiveTab) {
      const featured = HOME_CASES.filter((c) => c.featured);
      const seen = new Set<string>();
      const order: string[] = [];
      for (const c of featured) {
        if (!seen.has(c.tag)) {
          seen.add(c.tag);
          order.push(c.tag);
        }
      }
      return order;
    }
    const rows = HOME_CASES.filter((item) => item.tabId === homeActiveTab);
    const tagSet = new Set(
      (homeActiveTab === 'prototype'
        ? rows.filter((item) => !PROTOTYPE_SOURCE_METHOD_TAGS.has(item.tag))
        : rows
      ).map((item) => item.tag),
    );
    return Array.from(tagSet);
  }, [homeActiveTab]);

  const visibleCases = useMemo(() => {
    if (caseFilterTag) {
      return HOME_CASES.filter((item) => item.tag === caseFilterTag).slice(0, 4);
    }
    if (homeActiveTab) {
      let list = HOME_CASES.filter((item) => item.tabId === homeActiveTab);
      if (homeActiveTab === 'prototype') {
        list = list.filter((item) => !PROTOTYPE_SOURCE_METHOD_TAGS.has(item.tag));
      }
      return list.slice(0, 4);
    }
    return HOME_CASES.filter((item) => item.featured).slice(0, 4);
  }, [caseFilterTag, homeActiveTab]);

  const selectValue = caseFilterTag === null ? ALL_FILTER_VALUE : caseFilterTag;

  return (
    <div className="mt-8 mb-12 w-full max-w-none">
      <div className="mb-4 flex flex-col gap-3 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
        <h3 className="text-md font-bold text-gray-800 shrink-0">{sectionTitle}</h3>
        {secondaryFilters.length > 0 && (
          <div className="min-w-0 w-full min-[480px]:w-auto min-[480px]:max-w-[min(20rem,100%)] min-[480px]:shrink-0">
            <Select
              value={selectValue}
              onValueChange={(v) => {
                setCaseFilterTag(v === ALL_FILTER_VALUE ? null : v);
              }}
            >
              <SelectTrigger
                className="h-9 w-full min-[480px]:w-[min(20rem,100%)] rounded-full border-slate-200 bg-white text-[12px] font-medium text-slate-700 shadow-sm focus:ring-indigo-200"
                aria-label={tr('筛选案例子类')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200" position="popper" align="end">
                <SelectItem value={ALL_FILTER_VALUE} className="text-[13px] rounded-lg">
                  {tr('全部')}
                </SelectItem>
                {secondaryFilters.map((tag) => (
                  <SelectItem key={tag} value={tag} className="text-[13px] rounded-lg">
                    {tr(tag)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {visibleCases.length > 0 ? (
        <div className="grid w-full min-w-0 grid-cols-1 gap-3.5 min-[480px]:grid-cols-2 min-[1024px]:grid-cols-4">
          {visibleCases.map((item) => {
            const accent = ACCENT_STYLES[item.accent];
            return (
              <div
                key={item.id}
                className={cn(
                  'min-w-0 cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:shadow-lg',
                  accent.cardHover,
                )}
              >
                <div className={cn('relative mb-3 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br', accent.surface)}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover mix-blend-multiply opacity-80"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px]">
                    <span className={cn('mb-1 rounded-full px-3 py-1 text-[10px] font-bold', accent.badge)}>
                      {tr(item.badge)}
                    </span>
                    <p className={cn('px-1 text-center text-xs font-bold', accent.title)}>{tr(item.title)}</p>
                    <p className={cn('mt-0.5 px-1 text-center text-[10px]', accent.subtitle)}>{tr(item.subtitle)}</p>
                  </div>
                </div>
                <h4 className="font-bold text-[13px] text-gray-800">{tr(item.cardTitle)}</h4>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center text-[13px] text-slate-400">
          {tr('该能力相关案例整理中')}
        </div>
      )}
    </div>
  );
}
