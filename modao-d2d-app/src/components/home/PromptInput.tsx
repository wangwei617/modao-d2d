import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/context/SidebarContext';
import { AdvancedConfigurationToolbar } from './AdvancedConfigurationToolbar';

// 每个二级卡片对应的输入框默认提示词
const CARD_PLACEHOLDER: Record<string, string> = {
    'AI生成原型': '请描述「AI生成原型」功能需求或上传需求文档，我将自动解析并生成内容...',
    '图片转原型': '请上传截图或草图，我将识别界面结构并生成可交互原型...',
    '需求文档PRD': '请描述你的产品需求，我将生成包含完整逻辑的PRD文档...',
    'HTML转原型': '请上传HTML文件或粘贴代码，我将一键转换为墨刀原型...',
    '竞品分析': '请输入目标产品或竞品名称，我将进行多维度对比分析...',
    '产品方案评审': '请描述你的产品方案或上传原型，我将提供智能评审意见...',
    '生成 Web 应用': '请描述你的 Web 应用需求，我将生成完整的前端代码...',
    '生成 App 应用': '请描述移动端应用功能，我将生成对应页面代码...',
    '功能交互文档': '请描述产品功能，我将生成详细的交互说明文档...',
    '用户调研': '请描述调研目标和用户画像，我将生成调研问卷...',
    '产品规划': '请输入产品阶段目标，我将制定版本迭代计划和 Roadmap...',
    'AI生成PPT': '请描述演讲主题或上传文档，我将提取核心结构生成PPT大纲...',
    'AI美化PPT': '请上传现有PPT，我将优化排版配色提升整体质感...',
    '生成营销图': '请描述产品卖点或上传素材，我将生成吸引眼球的营销图...',
    'SEO文章生成': '请输入目标关键词和主题，我将生成利于搜索引擎收录的推广文章...',
    '测试用例生成': '请上传需求文档或描述功能，我将自动生成完整测试用例...',
    '技术方案生成': '请描述业务需求，我将生成系统架构与技术选型方案...',
    '技术方案评估': '请提供技术方案，我将分析可行性并识别潜在风险...',
    '思维导图': '请描述主题或上传文档，我将梳理核心思路并生成思维导图...',
    '流程图': '请描述业务逻辑或操作步骤，我将自动绘制标准流程图...',
    '用户旅程图': '请描述用户场景和目标，我将可视化用户行为路径与情感体验...',
    '生成图片': '请描述你要生成的图片内容或上传参考图，我将生成符合要求的图片...',
    '生成视频': '请输入生成视频的主题和风格...',
};

// ---- Basic Sub-card Component (matches monolithic exactly) ----
interface SubCardData {
    title: string;
    desc: string;
    badge?: string;
    hoverBg: string;
    hoverColor: string;
    iconPath: React.ReactNode;
}

function SubCard({ data, onClick }: { data: SubCardData; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="border border-[#F1F5F9] bg-white rounded-xl p-4 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group flex items-start gap-4"
        >
            <div className={cn(
                "w-10 h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 transition-colors",
                data.hoverBg, data.hoverColor
            )}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {data.iconPath}
                </svg>
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-[14px] mb-1 group-hover:text-indigo-600 transition-colors">
                    {data.title}{' '}
                    {data.badge && (
                        <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-transparent bg-clip-text text-[10px] uppercase ml-1">{data.badge}</span>
                    )}
                </h4>
                <p className="text-gray-400 text-[11px] font-medium leading-relaxed">{data.desc}</p>
            </div>
        </div>
    );
}

const RECOMMEND_CARDS: SubCardData[] = [
    { title: '生成 Web 应用', desc: '一键生成全栈网页代码', badge: 'Hot✨', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: 'AI生成原型', desc: '一键生成可交互原型', badge: 'Hot✨', hoverBg: 'group-hover:bg-indigo-50', hoverColor: 'group-hover:text-indigo-500', iconPath: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></> },
    { title: '图片转原型', desc: '上传图片，一键转为原型', badge: 'Hot✨', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: '需求文档PRD', desc: '快速生成包含详细逻辑的产品需求文档', badge: 'Hot✨', hoverBg: 'group-hover:bg-emerald-50', hoverColor: 'group-hover:text-emerald-500', iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { title: 'HTML转原型', desc: '上传HTML文件，一键转为原型', hoverBg: 'group-hover:bg-orange-50', hoverColor: 'group-hover:text-orange-500', iconPath: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> },
    { title: '生成图片', desc: '输入描述或参考图，生成图片', badge: 'New✨', hoverBg: 'group-hover:bg-pink-50', hoverColor: 'group-hover:text-pink-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></> },
];

const GENERATE_CARDS: SubCardData[] = [
    { title: '生成 Web 应用', desc: '一键生成全栈网页代码', badge: 'Hot✨', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: '生成 App 应用', desc: '一键生成移动端页面代码', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></> },
];

const PROTOTYPE_CARDS: SubCardData[] = [
    { title: 'AI生成原型', desc: '一键生成可交互原型', badge: 'Hot✨', hoverBg: 'group-hover:bg-indigo-50', hoverColor: 'group-hover:text-indigo-500', iconPath: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></> },
    { title: '图片转原型', desc: '上传图片，一键转为原型', badge: 'Hot✨', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: 'HTML转原型', desc: '上传HTML文件，一键转为原型', hoverBg: 'group-hover:bg-orange-50', hoverColor: 'group-hover:text-orange-500', iconPath: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> },
    { title: '生成原型概念图', desc: '激发脑暴，快速产出概念原型', badge: 'New✨', hoverBg: 'group-hover:bg-pink-50', hoverColor: 'group-hover:text-pink-500', iconPath: <><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></> },
    { title: '功能交互文档', desc: 'AI 生产品功能与交互文档', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { title: 'UI规范评审', desc: '检查设计一致性与规范', hoverBg: 'group-hover:bg-teal-50', hoverColor: 'group-hover:text-teal-500', iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
];

const PLANNING_CARDS: SubCardData[] = [
    { title: '需求文档PRD', desc: '快速生成包含详细逻辑的产品需求文档', badge: 'Hot✨', hoverBg: 'group-hover:bg-emerald-50', hoverColor: 'group-hover:text-emerald-500', iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { title: '竞品分析', desc: '多维度对比分析，自动输出调研报告', hoverBg: 'group-hover:bg-cyan-50', hoverColor: 'group-hover:text-cyan-500', iconPath: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { title: '用户调研', desc: '自动生成调研问卷和用户画像分析', hoverBg: 'group-hover:bg-indigo-50', hoverColor: 'group-hover:text-indigo-500', iconPath: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { title: '产品方案评审', desc: '智能评审原型方案，提供优化建议', hoverBg: 'group-hover:bg-green-50', hoverColor: 'group-hover:text-green-500', iconPath: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
    { title: '产品规划', desc: '制定版本迭代计划，生成Roadmap', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></> },
];

const PPT_CARDS: SubCardData[] = [
    { title: 'AI生成PPT', desc: '一键提取核心结构并生成报告大纲', hoverBg: 'group-hover:bg-orange-50', hoverColor: 'group-hover:text-orange-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></> },
    { title: 'AI美化PPT', desc: '一键优化排版配色，提升文档质感', hoverBg: 'group-hover:bg-pink-50', hoverColor: 'group-hover:text-pink-500', iconPath: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></> },
];

const CHARTS_CARDS: SubCardData[] = [
    { title: '生成图片', desc: '输入描述或参考图，生成图片', hoverBg: 'group-hover:bg-pink-50', hoverColor: 'group-hover:text-pink-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></> },
    { title: '流程图', desc: '描述业务逻辑，自动绘制标准流程图', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><path d="M6.5 14v-4a2 2 0 0 1 2-2h5.5" /></> },
    { title: '思维导图', desc: '梳理核心思路，一键转为思维导图', hoverBg: 'group-hover:bg-emerald-50', hoverColor: 'group-hover:text-emerald-500', iconPath: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></> },
    { title: '用户旅程图', desc: '可视化用户行为路径与情感体验', hoverBg: 'group-hover:bg-orange-50', hoverColor: 'group-hover:text-orange-500', iconPath: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
];

const TESTING_CARDS: SubCardData[] = [
    { title: '测试用例生成', desc: '自动解析需求，生成完整测试用例', hoverBg: 'group-hover:bg-orange-50', hoverColor: 'group-hover:text-orange-500', iconPath: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
    { title: '技术方案生成', desc: '根据需求生成系统架构与技术选型', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
    { title: '技术方案评估', desc: '分析技术方案可行性，识别潜在风险', hoverBg: 'group-hover:bg-green-50', hoverColor: 'group-hover:text-green-500', iconPath: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
];

const MULTIMEDIA_CARDS: SubCardData[] = [
    { title: '生成视频', desc: '最具突破性的 AI 能力', badge: 'New✨', hoverBg: 'group-hover:bg-red-50', hoverColor: 'group-hover:text-red-500', iconPath: <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></> },
    { title: '生成营销图', desc: '快速生成推广配图', badge: 'New✨', hoverBg: 'group-hover:bg-pink-50', hoverColor: 'group-hover:text-pink-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></> },
    { title: 'SEO文章生成', desc: '生成利于搜索引擎收录的推广文章', hoverBg: 'group-hover:bg-indigo-50', hoverColor: 'group-hover:text-indigo-500', iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
];

const TAB_CARDS_MAP: Record<string, SubCardData[]> = {
    recommend: RECOMMEND_CARDS,
    generate: GENERATE_CARDS,
    prototype: PROTOTYPE_CARDS,
    planning: PLANNING_CARDS,
    ppt: PPT_CARDS,
    multimedia: MULTIMEDIA_CARDS,
    testing: TESTING_CARDS,
    charts: CHARTS_CARDS,
};

// ---- Tab definition (matches monolithic exactly) ----
interface TabDef {
    id: string;
    label: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
}

const TABS: TabDef[] = [
    {
        id: 'recommend', label: '推荐', color: '#7C7FF6', bg: '#F0F1FF',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    },
    {
        id: 'generate', label: '生成应用', color: '#8B5CF6', bg: '#F5F3FF',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    },
    {
        id: 'prototype', label: '原型设计', color: '#3EA6FF', bg: '#EBF5FF',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
    },
    {
        id: 'planning', label: '产品策划', color: '#14DE9F', bg: '#E9FAF5',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    },
    {
        id: 'ppt', label: 'PPT', color: '#FF7052', bg: '#FFF1EF',
        icon: <span className="font-black text-xl">P</span>,
    },
    {
        id: 'charts', label: '图表与图片', color: '#00CFE8', bg: '#E6FAFD',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    },
    {
        id: 'testing', label: '研发测试', color: '#FFA94D', bg: '#FFF5E8',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    },
    {
        id: 'multimedia', label: '营销与多媒体', color: '#FF69D9', bg: '#FFF0FB',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    },
];

// ---- Speed Mode ----
function SpeedModeBtn() {
    const [mode, setMode] = useState<'fast' | 'deep'>('fast');
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors bg-white shadow-sm"
            >
                {mode === 'fast' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-amber-500">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                        <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 12V2" /><path d="m16.24 7.76 4.24-4.24" />
                    </svg>
                )}
                <span>{mode === 'fast' ? '极速' : '深度'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-2 z-[100] bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 w-40">
                    <button
                        onClick={() => { setMode('fast'); setOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-amber-500 shrink-0"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                        <div><div className="font-medium text-gray-700">极速</div><div className="text-[10px] text-gray-400">快速生成</div></div>
                    </button>
                    <button
                        onClick={() => { setMode('deep'); setOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400 shrink-0"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 12V2" /><path d="m16.24 7.76 4.24-4.24" /></svg>
                        <div><div className="font-medium text-gray-700">深度</div><div className="text-[10px] text-gray-400">深度思考</div></div>
                    </button>
                </div>
            )}
        </div>
    );
}

// ---- Main Component ----
export function PromptInput() {
    const [activeTab, setActiveTab] = useState('recommend');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const { setIsCategorySelected, activeNav, setViewMode, setUserPrompt } = useSidebarContext();
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const subCardsRef = useRef<HTMLDivElement>(null);
    const [subCardsHeight, setSubCardsHeight] = useState(0);

    useEffect(() => {
        setIsCategorySelected(!!selectedTag);
    }, [selectedTag, setIsCategorySelected]);

    // Reset when nav changes
    useEffect(() => {
        setSelectedTag(null);
    }, [activeNav]);

    // Measure real sub-cards height for smooth animation
    useEffect(() => {
        if (subCardsRef.current) {
            const h = subCardsRef.current.scrollHeight;
            if (h > 0) setSubCardsHeight(h);
        }
    }, [activeTab]);

    const handleCardClick = (card: SubCardData) => {
        setSelectedTag(card.title);
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 50);
    };

    const clearTag = () => setSelectedTag(null);

    const handleSend = () => {
        const text = inputValue.trim();
        if (!text) return;
        setUserPrompt(selectedTag ? `[${selectedTag}] ${text}` : text);
        setInputValue('');
        setViewMode('chat');
    };

    const isWebOrApp = selectedTag === '生成 Web 应用' || selectedTag === '生成 App 应用';
    const cards = TAB_CARDS_MAP[activeTab] ?? [];
    const contextualPlaceholder = selectedTag
        ? (CARD_PLACEHOLDER[selectedTag] ?? `请描述「${selectedTag}」相关需求...`)
        : '请输入任何产品领域的需求或问题...';

    return (
        <div className="w-full max-w-[1000px] mx-auto">
            {/* === Input Box === */}
            <div className="relative z-20 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 p-4 mb-10 min-h-[120px] flex flex-col group focus-within:ring-1 ring-indigo-200 transition-all">
                <div className="flex flex-wrap items-start gap-2 w-full flex-1 min-h-[80px]">
                    {selectedTag && (
                        <div
                            onClick={clearTag}
                            className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[13px] font-medium border border-indigo-100 h-8 select-none flex-shrink-0 cursor-pointer hover:bg-indigo-100 transition-colors group/tag"
                        >
                            {selectedTag}
                            <div
                                className="flex items-center justify-center w-4 h-4 rounded-full group-hover/tag:bg-indigo-200 transition-colors text-indigo-400 group-hover/tag:text-indigo-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </div>
                        </div>
                    )}
                    <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 min-w-[120px] resize-none outline-none text-gray-700 placeholder-gray-400 text-[15px] bg-transparent leading-loose pt-0.5"
                        placeholder={contextualPlaceholder}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-2">
                        <SpeedModeBtn />
                        {isWebOrApp && <AdvancedConfigurationToolbar showDesignSystemSelector={true} inline={true} />}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                        </button>
                        <button
                            className={cn(
                                "rounded-full p-2 transition-all flex items-center justify-center cursor-pointer shadow-sm",
                                inputValue.trim()
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                            onClick={handleSend}
                            disabled={!inputValue.trim()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" x2="12" y1="19" y2="5" /><polyline points="5 12 12 5 19 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* === Primary Tabs — always visible === */}
            <div className="flex flex-wrap justify-center gap-2 mb-5 mx-auto w-fit">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            // If switching to 'generate', don't auto-select the sub-card. Just show the sub-cards.
                            // If switching away, clear the tag if it's one of the generate app tags.
                            if (tab.id === 'generate') {
                                setSelectedTag(null);
                            } else if (tab.id !== 'generate' && (selectedTag === '生成 Web 应用' || selectedTag === '生成 App 应用')) {
                                setSelectedTag(null);
                            } else {
                                setSelectedTag(null);
                            }
                        }}
                        data-tab-id={tab.id}
                        className="tab-btn flex flex-col items-center gap-2 px-6 py-3 min-w-[88px] rounded-[20px] transition-all duration-200 group"
                        style={activeTab === tab.id ? { backgroundColor: tab.bg } : {}}
                    >
                        <div
                            className="icon-container w-[48px] h-[48px] rounded-[14px] flex items-center justify-center transition-all duration-200 text-white shadow-sm scale-[0.81]"
                            style={{ backgroundColor: tab.color }}
                        >
                            {tab.icon}
                        </div>
                        <span
                            className="tab-label text-[12px] font-medium whitespace-nowrap transition-colors"
                            style={{ color: activeTab === tab.id ? tab.color : '#6b7280' }}
                        >
                            {tab.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* === Sub-cards — smooth collapse when tag selected === */}
            <div
                className="overflow-hidden will-change-[max-height,opacity]"
                style={{
                    maxHeight: selectedTag ? 0 : (subCardsHeight > 0 ? subCardsHeight + 24 : 600),
                    opacity: selectedTag ? 0 : 1,
                    marginBottom: selectedTag ? 0 : 48,
                    transition: 'max-height 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms ease, margin-bottom 600ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div ref={subCardsRef} className="grid grid-cols-3 gap-3">
                    {cards.map((card) => (
                        <SubCard key={card.title} data={card} onClick={() => handleCardClick(card)} />
                    ))}
                </div>
            </div>
        </div>
    );
}
