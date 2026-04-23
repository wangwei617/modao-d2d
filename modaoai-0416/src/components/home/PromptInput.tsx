import React, { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/context/SidebarContext';
import { AdvancedConfigurationToolbar } from './AdvancedConfigurationToolbar';
import { tr } from '@/pc-en/tr';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getPromptSuggestions, buildGenerateHotExploreMix, buildPrototypeHotExploreMix, buildPlanningHotExploreMix, type PromptSuggestionItem } from './homeContent';
import { MODAO_WORKSPACE_URL } from '@/components/layout/SidebarWorkspace';

/**
 * 二级 Tab 横滑、左右圆钮、slate-50 渐变、贴边 100ms 收箭、程序化缓动与 atEnd/ atEndStrict 的配对为已定稿交互（多次迭代才稳定）。
 * @frozen 未经产品明确授权请勿改本段常数、缓动、贴边判定、收箭时序及关联 ref；规格见仓库 `.cursor/rules/secondary-tabs-scroll-frozen.mdc`。
 */
/** 单次点箭头平移约半栏；不足 450px 时一次贴到最左/最右；贴边后 100ms 再藏对应箭头 */
const SECONDARY_TABS_SCROLL_STEP_PX = 450;
/** 与右箭等效带：用于「视觉到底」宽松 atEnd，须与 atEndStrict + programmatic 收箭配合，勿单拆 */
const SECONDARY_TABS_SCROLL_END_INSET_PX = 40;
const SECONDARY_TABS_EDGE_ARROW_HIDE_DELAY_MS = 100;
const SECONDARY_TABS_SCROLL_BASE_MS = 200;
const SECONDARY_TABS_SCROLL_PER_PX_MS = 0.7;
const SECONDARY_TABS_SCROLL_MIN_MS = 400;
const SECONDARY_TABS_SCROLL_MAX_MS = 700;

function easeOutCubic(t: number): number {
    const inv = 1 - t;
    return 1 - inv * inv * inv;
}

// 每个二级卡片对应的输入框默认提示词
// 架构依据：《墨刀AI近30天使用情况分析_2026-04-16.md》
// - 首页推荐区：Top6 高频场景 + 3 个推荐/新上能力
// - 图片与视频拆分为独立一级入口，降低能力混淆
const CARD_PLACEHOLDER: Record<string, string> = {
    // 首页推荐 Top9
    '可视化大屏': '请描述行业、指标与分区，例如：智慧医院运营大屏含床位/手术量/能耗与告警；或电商实时 GMV、渠道转化与库存预警看板，多文件 HTML 可演示...',
    'App/小程序': '请描述业务与核心页面流，例如：生鲜电商「首页-分类-商详-购物车-结算」；或在线问诊「挂号-候诊-视频问诊-处方」多页 C 端原型...',
    'B端管理后台': '请描述管理端类型与模块，例如：CRM 客户跟进与商机阶段、工单流转、角色权限、表格筛选与详情抽屉、数据导入导出...',
    '参考图复刻原型': '请说明参考来源与还原目标，例如：上传截图高保真复刻、对标某 App 迁移、或 Figma 导出后的页面还原为可点击 HTML...',
    '单页网页原型': '请描述零散页面或说明类需求，例如：官网介绍页、活动落地页、导入说明、评审用多页 HTML 或配套 Markdown 说明...',
    '需求文档PRD': '请描述产品背景与功能范围，我将输出可评审的结构化 PRD：用户故事、流程、边界与验收要点（常配说明型 HTML）...',

    // 原型设计（输出：可交互 HTML 原型，非代码工程）
    'AI生成原型': '请描述原型需求或上传 PRD，我将生成可交互 HTML 原型（不生成 React / Vue 全栈与后端工程）...',
    '原型概念图': '请描述产品方向、场景和关键词，我将快速生成用于脑暴和评审的概念原型方案...',
    '生成原型概念图': '请描述产品方向、场景和关键词，我将快速生成用于脑暴和评审的概念原型方案...',
    '图片转原型': '请上传截图或草图，我将识别界面结构并生成可交互 HTML 原型...',
    'HTML转原型': '请上传 HTML 文件或粘贴代码，我将一键转换为墨刀可交互原型...',
    '素材转原型': '请描述你想复用的素材类型或参考方向，我将结合素材结构生成可编辑原型...',
    '社区素材转原型': '请描述你想复用的社区素材类型或参考方向，我将结合素材结构生成可编辑原型...',
    '界面规范评审': '请上传设计稿、截图或原型链接，我将检查设计一致性并输出规范评审报告...',
    // 生成应用：React / Vue 全栈代码 + 后端服务，可发布上线（与 HTML 原型区分）
    'AI生成应用': '请描述你的应用需求，我将生成 React / Vue 全栈代码工程（含页面、状态、后端服务与接口），并支持发布到线上运行...',
    'AI生成Web应用': '请描述 Web 应用需求，我将生成 React / Vue 站点与配套后端，可部署上线、对接真实服务...',
    'AI生成App': '请描述移动端或跨端应用需求，我将基于 React / Vue 技术栈生成可运行工程（含 H5 / 跨端），可搭配后端与发布能力交付...',
    '生成B端管理系统': '请描述你的管理端业务需求，我将生成 React / Vue 管理端应用，包含列表、详情、权限、接口与部署能力...',
    '生成移动端应用': '请描述移动端场景与核心流程，我将生成 H5 / 跨端应用工程，包含页面、状态、接口与发布交付...',
    '可视化大屏应用': '请描述行业、指标和模块分区，我将生成可部署的可视化大屏应用，包含图表看板、趋势区与接口数据结构...',
    '官网与落地页': '请描述品牌、场景和转化目标，我将生成可部署的官网或落地页应用，包含介绍区、表单和 CTA 模块...',
    '轻量工具应用': '请描述工具目标和使用流程，我将生成轻量工具型应用，适合审批、排班、录入、配置等小团队场景...',
    'B端管理系统': '请描述业务域、角色权限与核心页面，我将生成可部署的 React/Vue 管理端工程与接口、鉴权与审计占位...',
    '移动端应用': '请描述端类型（小程序/H5）、用户与关键页面流，我将生成跨端应用工程、状态管理与后端接口草案...',
    '多租户与SaaS交付': '请描述租户与套餐维度、计费和合规要求，我将生成多租户、订单发票、配额与审计等可部署模块方案...',

    // 需求策划（原「产品策划」：PRD / 竞品 / 用户调研 / 评审 / 规划 / SEO）
    '竞品分析': '请输入目标产品或竞品名称，我将进行多维度对比分析...',
    '产品方案评审': '请描述你的产品方案或上传原型，我将提供智能评审意见...',
    '用户调研': '请描述调研目标和用户画像，我将生成调研问卷...',
    '产品规划': '请输入产品阶段目标，我将制定版本迭代计划和 Roadmap（以路线图/里程碑为主，不默认输出高保真页面）...',
    '功能交互文档': '请描述产品功能，我将生成详细的交互说明文档...',

    // PPT
    生成HTML格式: '请描述主题或上传资料，我将输出可演示的 HTML 幻灯片与页面结构...',
    生成图片格式: '请描述分镜或上传参考，我将生成各页 16:9 配图或长图版式...',
    生成PPTX格式: '请描述演讲目标或上传大纲，我将生成可下载的 PPTX 结构与初稿...',
    美化PPT: '请上传现有PPT，我将统一版式、配色与信息层级并给出改稿建议...',

    // 图片
    '视觉物料生图': '请描述你要生成的图片内容或上传参考图，例如：科技感产品主视觉、电商 Banner、扁平插画...',
    'Logo设计': '请描述品牌名、行业与气质关键词，我将生成多款 Logo 概念...',

    // 视频
    'AI生成视频': '请描述视频主题、风格与镜头，例如：15 秒产品开箱短视频、赛博朋克风城市延时、AI 数字人口播...',
    '图片转视频': '请上传图片并描述镜头运动、时长与风格，我将生成对应的视频片段...',
    '数字人口播': '请提供文案和角色风格，我将生成口播视频脚本与画面...',

    // 流程/导图（流程图、思维导图、架构/组织/关系等可视化）
    '思维导图': '请描述主题或上传文档，我将梳理核心思路并生成思维导图...',
    '流程图': '请描述业务逻辑或操作步骤，我将自动绘制标准流程图...',
    '逻辑图表': '请描述要梳理的逻辑结构或信息层级，我将生成清晰的逻辑图表...',
    '用户旅程图': '请描述用户场景和目标，我将可视化用户行为路径与情感体验...',
    '组织架构图': '请描述团队/部门结构或上传名单，我将生成清晰的组织架构图...',
    '架构图': '请描述系统模块或业务结构，我将生成对应的架构图...',
    '关系图': '请描述对象之间的关系与连接方式，我将生成关系图...',
    '矩阵图': '请描述要对比的维度和对象，我将生成矩阵图...',
    '对比图': '请描述需要比较的对象和指标，我将生成清晰的对比图...',

    // 更多：运营推广
    '生成营销图': '请描述产品卖点或上传素材，我将生成吸引眼球的营销图...',
    '海报设计': '请描述活动主题、风格与关键信息，我将生成可直接使用的海报...',
    '主视觉KV': '请描述品牌/活动主题与核心视觉元素，我将生成主视觉 KV 方案...',
    '宣传短片': '请描述产品、品牌或活动主题，我将生成宣传短片方案...',
    'SEO文章生成': '请输入目标关键词和主题，我将生成利于搜索引擎收录的推广文章...',
    'UI规范评审': '请上传设计稿或界面截图，我将检查设计一致性与规范...',

    // 研发测试
    '测试用例生成': '请上传需求文档或描述功能，我将自动生成完整测试用例...',
    '技术方案生成': '请描述业务需求，我将生成系统架构与技术选型方案...',
    '技术方案评估': '请提供技术方案，我将分析可行性并识别潜在风险...',
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

interface PrototypeQuickAction {
    title: string;
    icon: React.ReactNode;
}

interface PrototypeStructuredItem {
    title: string;
    desc: string;
    badge?: string;
    iconPath: React.ReactNode;
}

type ReferenceImportType = 'image' | 'web' | 'figma';
type ReferenceImportMode = 'prototype' | 'generate';

function SubCard({ data, onClick, tone = 'default' }: { data: SubCardData; onClick: () => void; tone?: 'default' | 'quiet' | 'hot' | 'shelf' }) {
    const quiet = tone === 'quiet';
    const hot = tone === 'hot';
    const shelf = tone === 'shelf';
    return (
        <div
            onClick={onClick}
            className={cn(
                'group flex cursor-pointer items-stretch gap-3 rounded-2xl transition-all duration-200',
                hot &&
                    'border border-slate-200/80 bg-gradient-to-br from-white via-violet-50/40 to-indigo-50/30 p-3.5 shadow-sm ring-1 ring-slate-200/50 hover:-translate-y-0.5 hover:border-indigo-200/80 hover:shadow-md hover:ring-indigo-100/80',
                shelf &&
                    'border border-slate-200/70 bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] ring-0 hover:border-slate-300/85 hover:bg-slate-50/40 hover:shadow-sm',
                !hot &&
                    !quiet &&
                    !shelf &&
                    'border border-[#F1F5F9] bg-white p-4 hover:border-indigo-100 hover:shadow-md',
                quiet && 'border border-transparent bg-white/70 p-2.5 hover:border-slate-200/90 hover:bg-white hover:shadow-sm',
            )}
        >
            {hot && data.iconPath && (
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-indigo-500/20 text-violet-600 shadow-inner [&_svg]:h-[20px] [&_svg]:w-[20px]"
                >
                    {data.iconPath}
                </div>
            )}
            {shelf && data.iconPath && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-400 transition-colors group-hover:text-slate-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-[22px] w-[22px] shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                    >
                        {data.iconPath}
                    </svg>
                </div>
            )}
            <div className="min-w-0 flex-1">
                <h4
                    className={cn(
                        'flex flex-wrap items-center gap-1',
                        hot && 'mb-1 text-[15px] font-semibold leading-snug text-slate-900 group-hover:text-indigo-800',
                        shelf && 'mb-1.5 text-[13px] font-medium leading-snug text-slate-800',
                        quiet && 'mb-0.5 text-[12.5px] font-semibold text-slate-600 transition-colors group-hover:text-slate-800',
                        !hot && !quiet && !shelf && 'mb-1 text-[14px] font-normal text-gray-800 transition-colors group-hover:text-indigo-600',
                    )}
                >
                    {tr(data.title)}
                    {data.badge && (
                        <span
                            className={cn(
                                'align-middle',
                                hot && 'inline-flex rounded-md bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-800',
                                shelf && 'inline-flex text-[9px] font-normal text-slate-500',
                                quiet &&
                                    'inline-block rounded bg-slate-200/60 px-1 py-px text-[9px] font-medium text-slate-500',
                                !hot && !quiet && !shelf && 'ml-1 bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-[10px] font-semibold uppercase text-transparent',
                            )}
                        >
                            {data.badge}
                        </span>
                    )}
                </h4>
                <p
                    className={cn(
                        'line-clamp-2',
                        hot && 'text-[12px] font-normal leading-relaxed text-slate-500',
                        shelf && 'text-[11px] font-normal leading-relaxed text-slate-400/90',
                        quiet && 'text-[10px] font-normal leading-snug text-slate-400',
                        !hot && !quiet && !shelf && 'text-[11px] font-medium leading-snug text-gray-400',
                    )}
                >
                    {tr(data.desc)}
                </p>
            </div>
        </div>
    );
}

// 未选一级时「热门能力」：6 张；子元素在 SubCard shelf 中包在线性 svg 内（灰色描边）
const RECOMMEND_CARDS: SubCardData[] = [
    { title: '可视化大屏', desc: '经营看板 / 驾驶舱 / 趋势大屏', badge: 'Hot', hoverBg: 'group-hover:bg-cyan-50', hoverColor: 'group-hover:text-cyan-600', iconPath: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { title: 'App/小程序', desc: '电商 / 问诊 / 社交移动原型', badge: 'Hot', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><rect width="14" height="20" x="5" y="2" fill="none" rx="2" ry="2" /><path d="M12 18h.01" /></> },
    { title: 'B端管理后台', desc: 'CRM / ERP / 权限配置后台', badge: 'Hot', hoverBg: 'group-hover:bg-slate-50', hoverColor: 'group-hover:text-slate-600', iconPath: <><rect x="3" y="3" width="18" height="18" fill="none" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: '需求文档PRD', desc: '用户故事 / 验收标准 / 需求结构', badge: 'Hot', hoverBg: 'group-hover:bg-emerald-50', hoverColor: 'group-hover:text-emerald-500', iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { title: '视觉物料生图', desc: '海报 / Banner / Logo / 主视觉', badge: '推荐', hoverBg: 'group-hover:bg-pink-50', hoverColor: 'group-hover:text-pink-500', iconPath: <><rect x="3" y="3" width="18" height="18" fill="none" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" fill="none" /><polyline points="21 15 16 10 5 21" /></> },
    { title: 'AI生成视频', desc: '文生视频 / 图生视频 / 数字人', badge: '推荐', hoverBg: 'group-hover:bg-red-50', hoverColor: 'group-hover:text-red-500', iconPath: <><rect x="1" y="5" width="15" height="14" fill="none" rx="2" ry="2" /><polygon points="10 8.5 16 12 10 15.5" fill="none" /></> },
];

const PROTOTYPE_QUICK_ACTIONS: PrototypeQuickAction[] = [
    {
        title: 'HTML转原型',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 3 12 9 6" />
                <polyline points="15 6 21 12 15 18" />
            </svg>
        ),
    },
];

const PROTOTYPE_STRUCTURED_ITEMS: PrototypeStructuredItem[] = [
    { title: '原型概念图', desc: '激发脑暴，快速产出概念原型', iconPath: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.75c.4.28.67.72.73 1.2L9 18h6l.27-2.05c.06-.48.33-.92.73-1.2A7 7 0 0 0 12 2z" /></> },
    { title: '可视化大屏', desc: '快速生成经营看板 / 驾驶舱 / 趋势大屏等', iconPath: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { title: 'App/小程序', desc: '电商 / 问诊 / 社交移动原型', iconPath: <><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></> },
    { title: 'B端管理后台', desc: 'CRM / ERP / 权限配置后台', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    {
        title: '素材转原型',
        desc: '复用素材结构，快速生成原型',
        /** 方格/图块，表示「素材」；与右侧新标签提示图标区分 */
        iconPath: (
            <>
                <rect x="2" y="2" width="7" height="7" rx="0.5" fill="none" />
                <rect x="15" y="2" width="7" height="7" rx="0.5" fill="none" />
                <rect x="2" y="15" width="7" height="7" rx="0.5" fill="none" />
                <rect x="15" y="15" width="7" height="7" rx="0.5" fill="none" />
            </>
        ),
    },
    { title: '界面规范评审', desc: '检查设计一致性，输出规范评审报告', iconPath: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
];

const GENERATE_STRUCTURED_ITEMS: PrototypeStructuredItem[] = [
    { title: 'B端管理系统', desc: 'React / Vue 管理端 + 后端接口，可部署上线', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: '移动端应用', desc: 'H5 / 跨端工程，含后端与发布交付', iconPath: <><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></> },
    { title: '可视化大屏应用', desc: '指标看板 / 趋势分区 / 可部署工程', iconPath: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { title: '官网与落地页', desc: '活动页 / 介绍页 / 留资表单，轻量站点可部署', iconPath: <><path d="M3 12h18" /><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" /><path d="M3 7.5h18" /><path d="M3 16.5h18" /></> },
    { title: '轻量工具应用', desc: '审批 / 排班 / 录入配置，小团队自用可部署', iconPath: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 9h8" /><path d="M8 13h5" /></> },
    { title: '多租户与SaaS交付', desc: '租户 / 订阅计费 / 配额与审计，一套可卖', iconPath: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
];

const REFERENCE_IMPORT_CONFIG: Record<Exclude<ReferenceImportType, 'image'>, {
    title: string;
    description: string;
    placeholder: string;
    template: (link: string) => string;
}> = {
    web: {
        title: '网页链接转原型',
        description: '粘贴网页链接，按参考内容转为原型',
        placeholder: '请输入网页链接',
        template: (link) => `请参考这个网页链接生成原型，并提取其中的布局结构、视觉层级和关键模块：${link}`,
    },
    figma: {
        title: 'Figma链接转原型',
        description: '粘贴 Figma 分享链接，按参考内容转为原型',
        placeholder: '请输入 Figma 分享链接',
        template: (link) => `请参考这个 Figma 链接生成原型，尽量保留页面结构、组件层级和视觉布局：${link}`,
    },
};

// 原型设计：输出**可交互 HTML 原型**（评审/走查），不生成 React / Vue 全栈与后端工程
const PROTOTYPE_CARDS: SubCardData[] = [
    { title: 'AI生成原型', desc: '一键生成各类可交互原型', badge: 'Hot✨', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: '原型概念图', desc: '激发脑暴，快速产出概念原型', hoverBg: 'group-hover:bg-violet-50', hoverColor: 'group-hover:text-violet-500', iconPath: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.75c.4.28.67.72.73 1.2L9 18h6l.27-2.05c.06-.48.33-.92.73-1.2A7 7 0 0 0 12 2z" /></> },
    { title: '可视化大屏', desc: '快速生成经营看板 / 驾驶舱 / 趋势大屏等', badge: 'Hot✨', hoverBg: 'group-hover:bg-cyan-50', hoverColor: 'group-hover:text-cyan-600', iconPath: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { title: 'App/小程序', desc: '电商 / 问诊 / 社交移动原型', badge: 'Hot✨', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></> },
    { title: 'B端管理后台', desc: 'CRM / ERP / 权限配置后台', badge: 'Hot✨', hoverBg: 'group-hover:bg-slate-50', hoverColor: 'group-hover:text-slate-600', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: '界面规范评审', desc: '检查设计一致性，输出规范评审报告', hoverBg: 'group-hover:bg-teal-50', hoverColor: 'group-hover:text-teal-500', iconPath: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
];

// 生成应用：React / Vue 全栈 + 后端服务，可发布上线（与「原型设计」HTML 原型区分）
const GENERATE_CARDS: SubCardData[] = [
    { title: 'AI生成Web应用', desc: 'React / Vue 站点 + 后端与接口，可部署为线上环境', badge: 'Hot✨', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M3 9h18" /><path d="M9 21V9" /></> },
    { title: 'AI生成App', desc: '移动端 / H5 / 跨端（React 或 Vue），含后端与发布交付', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></> },
];

// 需求策划：文档与调研类能力聚合（PRD + 竞品 + 用户调研 + 评审 + 规划 + SEO）
const PLANNING_CARDS: SubCardData[] = [
    { title: '需求文档PRD', desc: '需求结构 / 用户故事 / 验收标准', badge: 'Hot✨', hoverBg: 'group-hover:bg-emerald-50', hoverColor: 'group-hover:text-emerald-500', iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
    { title: '竞品分析', desc: '多维度对比分析，自动输出调研报告', hoverBg: 'group-hover:bg-cyan-50', hoverColor: 'group-hover:text-cyan-500', iconPath: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
    { title: '用户调研', desc: '自动生成调研问卷和用户画像分析', hoverBg: 'group-hover:bg-indigo-50', hoverColor: 'group-hover:text-indigo-500', iconPath: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    { title: '产品方案评审', desc: '智能评审原型方案，提供优化建议', hoverBg: 'group-hover:bg-green-50', hoverColor: 'group-hover:text-green-500', iconPath: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
    { title: '产品规划', desc: '制定版本迭代计划，生成 Roadmap / 里程碑', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></> },
    { title: '功能交互文档', desc: 'AI 生成产品功能与交互说明文档', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></> },
];

const PPT_CARDS: SubCardData[] = [
    {
        title: '生成HTML格式',
        desc: '网页/HTML 幻灯片，可嵌入、全屏播',
        hoverBg: 'group-hover:bg-orange-50',
        hoverColor: 'group-hover:text-orange-600',
        iconPath: (
            <>
                <path d="M4 4h6v4H4z" />
                <path d="M14 4h6v4h-6z" />
                <path d="M4 10h6v4H4z" />
                <path d="M14 10h6v4h-6z" />
                <path d="M4 16h6v4H4z" />
            </>
        ),
    },
    {
        title: '生成图片格式',
        desc: '逐页出图、长图分镜、便于分享',
        hoverBg: 'group-hover:bg-amber-50',
        hoverColor: 'group-hover:text-amber-600',
        iconPath: (
            <>
                <rect x="3" y="4" width="18" height="16" rx="1.5" />
                <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
                <path d="M5 19l4-4 2.5 2.5L17 12l2 2" />
            </>
        ),
    },
    {
        title: '生成PPTX格式',
        desc: '标准 PPTX 文件，可在 Office 续编',
        hoverBg: 'group-hover:bg-rose-50',
        hoverColor: 'group-hover:text-rose-600',
        iconPath: (
            <>
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="8" y1="3" x2="8" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="6" y1="16" x2="14" y2="16" />
            </>
        ),
    },
    {
        title: '美化PPT',
        desc: '上传现稿，优化排版、配色与层级',
        hoverBg: 'group-hover:bg-pink-50',
        hoverColor: 'group-hover:text-pink-500',
        iconPath: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
    },
];

const IMAGE_CARDS: SubCardData[] = [
    { title: '视觉物料生图', desc: '海报 / KV / Banner / Logo', badge: 'Hot✨', hoverBg: 'group-hover:bg-pink-50', hoverColor: 'group-hover:text-pink-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></> },
    // 运营推广下属于图片类的产能也挂到图片 tab 下，便于用户在任一入口都能找到
    { title: '生成营销图', desc: '产品卖点一键生成推广配图', badge: 'Hot✨', hoverBg: 'group-hover:bg-rose-50', hoverColor: 'group-hover:text-rose-500', iconPath: <><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></> },
    { title: '海报设计', desc: '活动 / 节日 / 新品发布海报', badge: 'New✨', hoverBg: 'group-hover:bg-amber-50', hoverColor: 'group-hover:text-amber-500', iconPath: <><rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="16" y2="11" /><line x1="8" y1="15" x2="13" y2="15" /></> },
    { title: '主视觉KV', desc: '品牌 / 发布会 / 活动主视觉', badge: 'New✨', hoverBg: 'group-hover:bg-fuchsia-50', hoverColor: 'group-hover:text-fuchsia-500', iconPath: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></> },
    { title: 'Logo设计', desc: '多风格品牌 Logo 概念一次出', badge: 'New✨', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></> },
];

// 视频 tab 下三类生成方向；二级 tab pill 只渲染 title，desc 留空避免与「营销视频」语义重复
const VIDEO_CARDS: SubCardData[] = [
    { title: '营销视频', desc: '', hoverBg: 'group-hover:bg-rose-50', hoverColor: 'group-hover:text-rose-500', iconPath: <><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></> },
    { title: '品牌形象片', desc: '', hoverBg: 'group-hover:bg-purple-50', hoverColor: 'group-hover:text-purple-500', iconPath: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
    { title: '微电影广告', desc: '', hoverBg: 'group-hover:bg-orange-50', hoverColor: 'group-hover:text-orange-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" /><polygon points="10 8 16 12 10 16 10 8" /></> },
];

const DIAGRAM_CARDS: SubCardData[] = [
    { title: '流程图', desc: '描述业务逻辑，自动绘制标准流程图', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><path d="M6.5 14v-4a2 2 0 0 1 2-2h5.5" /></> },
    { title: '思维导图', desc: '梳理核心思路，一键转为思维导图', hoverBg: 'group-hover:bg-emerald-50', hoverColor: 'group-hover:text-emerald-500', iconPath: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></> },
    { title: '逻辑图表', desc: '信息层级、关系和推演逻辑可视化', hoverBg: 'group-hover:bg-cyan-50', hoverColor: 'group-hover:text-cyan-500', iconPath: <><line x1="6" y1="18" x2="6" y2="10" /><line x1="12" y1="18" x2="12" y2="6" /><line x1="18" y1="18" x2="18" y2="13" /><polyline points="4 14 8 10 12 12 18 6 20 8" /></> },
    { title: '用户旅程图', desc: '可视化用户行为路径与情感体验', hoverBg: 'group-hover:bg-orange-50', hoverColor: 'group-hover:text-orange-500', iconPath: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /> },
    { title: '组织架构图', desc: '团队 / 部门 / 汇报关系可视化', hoverBg: 'group-hover:bg-cyan-50', hoverColor: 'group-hover:text-cyan-500', iconPath: <><rect x="9" y="2" width="6" height="5" rx="1" /><rect x="2" y="17" width="6" height="5" rx="1" /><rect x="9" y="17" width="6" height="5" rx="1" /><rect x="16" y="17" width="6" height="5" rx="1" /><path d="M12 7v4" /><path d="M5 17v-2h14v2" /></> },
    { title: '架构图', desc: '系统模块和业务结构一图梳理', hoverBg: 'group-hover:bg-sky-50', hoverColor: 'group-hover:text-sky-500', iconPath: <><rect x="3" y="4" width="8" height="6" rx="1" /><rect x="13" y="4" width="8" height="6" rx="1" /><rect x="8" y="14" width="8" height="6" rx="1" /><path d="M7 10v2h10v-2" /><path d="M12 12v2" /></> },
    { title: '关系图', desc: '人物、要素和节点关系清晰呈现', hoverBg: 'group-hover:bg-teal-50', hoverColor: 'group-hover:text-teal-500', iconPath: <><circle cx="6" cy="12" r="3" /><circle cx="18" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><line x1="8.5" y1="10.5" x2="15.5" y2="7.5" /><line x1="8.5" y1="13.5" x2="15.5" y2="16.5" /></> },
    { title: '矩阵图', desc: '二维维度比较与分层表达', hoverBg: 'group-hover:bg-violet-50', hoverColor: 'group-hover:text-violet-500', iconPath: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M15 3v18" /><path d="M3 9h18" /><path d="M3 15h18" /></> },
    { title: '对比图', desc: '对象差异、优劣势和变化对照', hoverBg: 'group-hover:bg-indigo-50', hoverColor: 'group-hover:text-indigo-500', iconPath: <><path d="M7 4v16" /><path d="M17 4v16" /><path d="M7 8h6" /><path d="M11 16h6" /></> },
];

const TESTING_CARDS: SubCardData[] = [
    { title: '测试用例生成', desc: '自动解析需求，生成完整测试用例', hoverBg: 'group-hover:bg-orange-50', hoverColor: 'group-hover:text-orange-500', iconPath: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></> },
    { title: '技术方案生成', desc: '根据需求生成系统架构与技术选型', hoverBg: 'group-hover:bg-blue-50', hoverColor: 'group-hover:text-blue-500', iconPath: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
    { title: '技术方案评估', desc: '分析技术方案可行性，识别潜在风险', hoverBg: 'group-hover:bg-green-50', hoverColor: 'group-hover:text-green-500', iconPath: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
];

const MARKETING_CARDS: SubCardData[] = [
    { title: '生成营销图', desc: '产品卖点一键生成推广配图', badge: 'Hot✨', hoverBg: 'group-hover:bg-rose-50', hoverColor: 'group-hover:text-rose-500', iconPath: <><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></> },
    { title: '海报设计', desc: '活动 / 节日 / 新品发布海报', badge: 'New✨', hoverBg: 'group-hover:bg-amber-50', hoverColor: 'group-hover:text-amber-500', iconPath: <><rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="16" y2="11" /><line x1="8" y1="15" x2="13" y2="15" /></> },
    { title: '主视觉KV', desc: '品牌 / 发布会 / 活动主视觉', badge: 'New✨', hoverBg: 'group-hover:bg-fuchsia-50', hoverColor: 'group-hover:text-fuchsia-500', iconPath: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></> },
    { title: '宣传短片', desc: '生成产品 / 活动宣传短片脚本与画面', hoverBg: 'group-hover:bg-red-50', hoverColor: 'group-hover:text-red-500', iconPath: <><path d="M4 7h11a2 2 0 0 1 2 2v8H6a2 2 0 0 1-2-2V7z" /><path d="M17 10l4-2v8l-4-2" /></> },
    { title: 'SEO文章生成', desc: '生成利于搜索引擎收录的推广文章', hoverBg: 'group-hover:bg-indigo-50', hoverColor: 'group-hover:text-indigo-500', iconPath: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></> },
];

// 一级 Tab ↔ 二级卡片映射；RECOMMEND_CARDS 作为"未选 Tab 的默认态"单独处理，不在此表内
const TAB_CARDS_MAP: Record<string, SubCardData[]> = {
    prototype: PROTOTYPE_CARDS,
    generate: GENERATE_CARDS,
    planning: PLANNING_CARDS,
    image: IMAGE_CARDS,
    video: VIDEO_CARDS,
    ppt: PPT_CARDS,
    diagrams: DIAGRAM_CARDS,
    testing: TESTING_CARDS,
    marketing: MARKETING_CARDS,
};

/** 一级 Tab 下「想生成什么…」标题（与「你想生成什么」区分） */
const SECONDARY_SECTION_TITLE_KEY: Record<string, string> = {
    generate: '想生成什么应用',
    prototype: '想设计什么原型',
    planning: '想策划什么',
    image: '想生成什么图片',
    video: '想生成什么视频',
    ppt: '想生成什么PPT',
    diagrams: '想生成什么流程/导图',
    testing: '想生成什么研发测试',
    marketing: '想生成什么运营推广',
};

function tabCardsToStructuredItems(subcards: SubCardData[]): PrototypeStructuredItem[] {
    return subcards.map((c) => ({
        title: c.title,
        desc: c.desc,
        badge: c.badge,
        iconPath: c.iconPath,
    }));
}

/** 未选二级时：从当前一级下各能力卡片各取若干条，拼成高频/热门探索。`batchIndex` 换一批时轮换每条内的候选项。 */
function buildHotSuggestionsForTab(tabId: string, batchIndex = 0): PromptSuggestionItem[] {
    const list = TAB_CARDS_MAP[tabId] ?? [];
    if (!list.length) return [];
    const out: PromptSuggestionItem[] = [];
    const seen = new Set<string>();
    let round = 0;
    while (out.length < 6 && round < 14) {
        let addedRound = false;
        for (const card of list) {
            if (out.length >= 6) break;
            const picks = getPromptSuggestions(card.title);
            if (picks.length === 0) continue;
            const idx = (round + batchIndex) % picks.length;
            const pick = picks[idx] ?? picks[0];
            if (pick && !seen.has(pick.id)) {
                seen.add(pick.id);
                out.push(pick);
                addedRound = true;
            }
        }
        if (!addedRound) break;
        round += 1;
    }
    return out;
}

function secondaryTabAccent(tabId: string): { selected: string; base: string } {
    /** 未选：略强描边 + 浅底 + 字重，避免与背景融在一起；选中：饱和提高 + 轻 ring，与未选拉开层次 */
    const base =
        'border-slate-300/95 bg-gradient-to-b from-slate-50 to-white text-slate-800 shadow-sm hover:border-slate-400 hover:from-white hover:to-slate-50 hover:text-slate-900 hover:shadow-md';
    const map: Record<string, { selected: string; base: string }> = {
        prototype: {
            selected:
                'border-sky-400 bg-sky-100 text-sky-900 shadow-md ring-1 ring-sky-200/80 ring-inset',
            base,
        },
        generate: {
            selected:
                'border-violet-400 bg-violet-100 text-violet-900 shadow-md ring-1 ring-violet-200/80 ring-inset',
            base,
        },
        planning: {
            selected:
                'border-emerald-400 bg-emerald-100 text-emerald-900 shadow-md ring-1 ring-emerald-200/80 ring-inset',
            base,
        },
        image: {
            selected:
                'border-pink-400 bg-pink-100 text-pink-900 shadow-md ring-1 ring-pink-200/80 ring-inset',
            base,
        },
        video: {
            selected:
                'border-rose-400 bg-rose-100 text-rose-900 shadow-md ring-1 ring-rose-200/80 ring-inset',
            base,
        },
        ppt: {
            selected:
                'border-orange-400 bg-orange-100 text-orange-900 shadow-md ring-1 ring-orange-200/80 ring-inset',
            base,
        },
        diagrams: {
            selected:
                'border-cyan-400 bg-cyan-100 text-cyan-900 shadow-md ring-1 ring-cyan-200/80 ring-inset',
            base,
        },
        testing: {
            selected:
                'border-amber-400 bg-amber-100 text-amber-950 shadow-md ring-1 ring-amber-200/80 ring-inset',
            base,
        },
        marketing: {
            selected:
                'border-orange-400 bg-orange-100 text-orange-950 shadow-md ring-1 ring-orange-200/80 ring-inset',
            base,
        },
    };
    return map[tabId] ?? map.prototype;
}

const RECOMMEND_CARD_TO_TAB: Record<string, string> = {
    '可视化大屏': 'prototype',
    'App/小程序': 'prototype',
    'B端管理后台': 'prototype',
    '图片转原型': 'prototype',
    '需求文档PRD': 'planning',
    '视觉物料生图': 'image',
    'AI生成视频': 'video',
    生成HTML格式: 'ppt',
    生成图片格式: 'ppt',
    生成PPTX格式: 'ppt',
    美化PPT: 'ppt',
    /** 兼容历史入口文案 */
    AI生成PPT: 'ppt',
};

/** 热门能力卡片点入一级后，若卡片名与该行二级一致则预选该二级，避免「同一大类下点不同卡却同一页」 */
function getInitialSecondaryTagFromRecommendCard(cardTitle: string, tabId: string): string | null {
    const rows =
        tabId === 'prototype'
            ? PROTOTYPE_STRUCTURED_ITEMS
            : tabId === 'generate'
                ? GENERATE_STRUCTURED_ITEMS
                : tabCardsToStructuredItems(TAB_CARDS_MAP[tabId] ?? []);
    if (rows.some((r) => r.title === cardTitle)) return cardTitle;
    if (tabId === 'prototype' && cardTitle === '图片转原型') return '图片转原型';
    return null;
}

// ---- Tab definition (matches monolithic exactly) ----
interface TabDef {
    id: string;
    label: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
}

// 一级 Tab：贴近任务发起心智；图片与视频拆分；「流程/导图」覆盖流程图/导图/架构类图示
const MAIN_TABS: TabDef[] = [
    {
        id: 'generate', label: '生成应用', color: '#8B5CF6', bg: '#F5F3FF',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    },
    {
        id: 'prototype', label: '原型设计', color: '#3EA6FF', bg: '#EBF5FF',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
    },
    {
        id: 'planning', label: '需求策划', color: '#14DE9F', bg: '#E9FAF5',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    },
    {
        id: 'image', label: '图片', color: '#FF69D9', bg: '#FFF0FB',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    },
    {
        id: 'video', label: '视频', color: '#FB7185', bg: '#FFF1F2',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
    },
    {
        id: 'ppt', label: 'PPT', color: '#FF7052', bg: '#FFF1EF',
        icon: <span className="font-black text-xl">P</span>,
    },
    {
        id: 'diagrams', label: '流程/导图', color: '#00CFE8', bg: '#E6FAFD',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    },
    {
        id: 'testing', label: '研发测试', color: '#FFA94D', bg: '#FFF5E8',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    },
];

const EXTRA_TABS: TabDef[] = [
    {
        id: 'marketing', label: '运营推广', color: '#F97316', bg: '#FFF7ED',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>,
    },
];

const ALL_TABS = [...MAIN_TABS, ...EXTRA_TABS];

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
                <span>{mode === 'fast' ? tr('极速') : tr('深度')}</span>
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
                        <div><div className="font-medium text-gray-700">{tr('极速')}</div><div className="text-[10px] text-gray-400">{tr('快速生成')}</div></div>
                    </button>
                    <button
                        onClick={() => { setMode('deep'); setOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors text-left hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400 shrink-0"><path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 12V2" /><path d="m16.24 7.76 4.24-4.24" /></svg>
                        <div><div className="font-medium text-gray-700">{tr('深度')}</div><div className="text-[10px] text-gray-400">{tr('深度思考')}</div></div>
                    </button>
                </div>
            )}
        </div>
    );
}

type SkillSource = 'builtin' | 'user';
type SkillTriggerMode = 'auto' | 'manual';
type SkillManageFilter = 'all' | 'builtin' | 'user';
type UserSkillStatus = 'ready' | 'draft';

export interface SkillPickItem {
    id: string;
    name: string;
    desc: string;
    letter: string;
    colorClass: string;
    source: SkillSource;
    triggerMode: SkillTriggerMode;
    path?: string;
    createdAt?: number;
    status?: UserSkillStatus;
    pinned?: boolean;
    pinnedAt?: number;
}

export interface SkillPickerHandle {
    /** 打开技能面板；anchorRect 为 @ 的屏幕位置；containerRect 为输入框，用于将面板左右约束在框内、避免飞偏 */
    open: (options?: {
        anchorRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number };
        containerRect?: { top: number; bottom: number; left: number; right: number; width: number; height: number };
    }) => void;
    close: () => void;
}

const SKILL_STORAGE_KEY = 'modao_home_installed_skills';
const DEFAULT_SKILL_CREATOR_PROMPT = '用/skill-creator 创建一个技能，并且加入我的技能文档/列表 ~/.qclaw/skills 里。这个技能可以：';

const BUILTIN_SKILLS: SkillPickItem[] = [
    { id: 'news', name: '新闻摘要', desc: '阅读链接并输出要点摘要', letter: '新', colorClass: 'bg-sky-500 text-white', source: 'builtin', triggerMode: 'auto' },
    { id: 'ppt', name: 'PPT 演示文稿', desc: '生成、编辑与阅读演示文稿', letter: 'P', colorClass: 'bg-blue-600 text-white', source: 'builtin', triggerMode: 'auto' },
    { id: 'pdf', name: 'PDF 文档生成', desc: '从需求生成结构化 PDF', letter: 'F', colorClass: 'bg-violet-600 text-white', source: 'builtin', triggerMode: 'manual' },
    { id: 'word', name: 'Word 文档生成', desc: '长文档大纲与段落起草', letter: 'W', colorClass: 'bg-emerald-600 text-white', source: 'builtin', triggerMode: 'manual' },
    { id: 'excel', name: 'Excel 文件处理', desc: '表格清洗、透视与公式建议', letter: 'E', colorClass: 'bg-amber-600 text-white', source: 'builtin', triggerMode: 'manual' },
    { id: 'android', name: 'Android 原生开发', desc: 'Kotlin 界面与 Gradle 工程辅助', letter: 'A', colorClass: 'bg-orange-600 text-white', source: 'builtin', triggerMode: 'manual' },
    { id: 'browser', name: '浏览器自动化', desc: 'CDP 驱动的页面操作与数据采集', letter: 'B', colorClass: 'bg-slate-600 text-white', source: 'builtin', triggerMode: 'auto' },
    { id: 'files', name: '文件整理', desc: '目录归类、命名规则与批量重命名', letter: '文', colorClass: 'bg-teal-600 text-white', source: 'builtin', triggerMode: 'manual' },
];

const USER_SKILL_COLORS = [
    'bg-fuchsia-600 text-white',
    'bg-cyan-600 text-white',
    'bg-rose-600 text-white',
    'bg-indigo-600 text-white',
    'bg-lime-600 text-white',
    'bg-violet-500 text-white',
];

function buildSkillLetter(name: string) {
    const char = name.trim().charAt(0);
    if (!char) return '技';
    return /[a-z]/i.test(char) ? char.toUpperCase() : char;
}

function pickUserSkillColor(seed: string) {
    const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return USER_SKILL_COLORS[total % USER_SKILL_COLORS.length];
}

function createUserSkill(params: {
    id?: string;
    name: string;
    desc: string;
    path?: string;
    status?: UserSkillStatus;
}): SkillPickItem {
    const { id, name, desc, path, status = 'ready' } = params;
    return {
        id: id ?? `user-skill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        desc,
        letter: buildSkillLetter(name),
        colorClass: pickUserSkillColor(name),
        source: 'user',
        triggerMode: 'auto',
        path,
        createdAt: Date.now(),
        status,
    };
}

function loadInstalledSkills(): SkillPickItem[] {
    if (typeof window === 'undefined') return BUILTIN_SKILLS;
    try {
        const raw = window.localStorage.getItem(SKILL_STORAGE_KEY);
        if (!raw) return BUILTIN_SKILLS;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return BUILTIN_SKILLS;

        const savedById = new Map(parsed.filter(Boolean).map((item) => [item.id, item]));
        const mergePinned = <T extends SkillPickItem>(skill: T, saved: { pinned?: unknown; pinnedAt?: unknown } | undefined): T => ({
            ...skill,
            pinned: !!saved?.pinned,
            pinnedAt: typeof saved?.pinnedAt === 'number' ? saved.pinnedAt : (saved?.pinned ? Date.now() : undefined),
        });
        const builtinSkills: SkillPickItem[] = BUILTIN_SKILLS.map((skill) => {
            const saved = savedById.get(skill.id);
            const next = saved?.triggerMode
                ? {
                    ...skill,
                    triggerMode: (saved.triggerMode === 'manual' ? 'manual' : 'auto') as SkillTriggerMode,
                }
                : skill;
            return mergePinned(next, saved);
        });
        const userSkills: SkillPickItem[] = parsed
            .filter((item) => item && item.source === 'user' && item.id && item.name)
            .map((item) =>
                createUserSkill({
                    id: item.id,
                    name: item.name,
                    desc: item.desc || '用户添加技能',
                    path: item.path,
                    status: item.status === 'draft' ? 'draft' : 'ready',
                }),
            )
            .map((item, index) => {
                const saved = parsed.filter(Boolean).find((candidate) => candidate.id === item.id);
                const next = {
                    ...item,
                    triggerMode: (saved?.triggerMode === 'manual' ? 'manual' : 'auto') as SkillTriggerMode,
                    createdAt: typeof saved?.createdAt === 'number' ? saved.createdAt : Date.now() + index,
                };
                return mergePinned(next, saved);
            });

        return [...builtinSkills, ...userSkills];
    } catch {
        return BUILTIN_SKILLS;
    }
}

const SKILL_PANEL_CHROME_PX = 80; // 搜索区 + 列表上下 padding + 边框（一期暂无"技能管理"行）
const SKILL_PANEL_IDEAL_LIST_PX = 260;
const SKILL_PANEL_MIN_LIST_PX = 96;

const SkillPickerBtn = forwardRef<SkillPickerHandle, { onPick: (skill: SkillPickItem) => void }>(function SkillPickerBtn({ onPick }, handleRef) {
    const [open, setOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [manageQuery, setManageQuery] = useState('');
    const [manageFilter, setManageFilter] = useState<SkillManageFilter>('all');
    const [toast, setToast] = useState<string | null>(null);
    const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
    const [listMaxHeight, setListMaxHeight] = useState(SKILL_PANEL_IDEAL_LIST_PX);
    const [alignRight, setAlignRight] = useState(false);
    const [skills, setSkills] = useState<SkillPickItem[]>(() => loadInstalledSkills());
    // 外部锚点（如 @ 字符的位置），一旦设置 → 面板用 fixed 定位并 portal 到 body
    const [anchorPos, setAnchorPos] = useState<{ top: number; left: number } | null>(null);
    // 键盘导航时高亮的条目序号；-1 表示无选中（刚打开/鼠标移出后仅 hover，无 indigo 条）
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const {
        setActiveNav,
        setViewMode,
        setUserPrompt,
        setHomeDraftPrompt,
        setActiveChatLabel,
        setAppSurface,
    } = useSidebarContext();

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(SKILL_STORAGE_KEY, JSON.stringify(skills));
    }, [skills]);

    useImperativeHandle(handleRef, () => ({
        open: (options) => {
            setOpen(true);
            setQuery('');
            setHighlightedIndex(-1);
            if (options?.anchorRect) {
                const rect = options.anchorRect;
                const container = options.containerRect;
                const estW = 320; // 与 w-[20rem] 一致
                const estH = 300;
                const edgePad = 8;
                const gap = 4;
                const vw = typeof window !== 'undefined' ? window.innerWidth : 0;
                const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

                let left = rect.left;
                let top = rect.bottom + gap;

                if (container) {
                    // 主约束：与输入框左右侧对齐，避免在宽屏/异常 rect 下面板跑到视口很右侧
                    const minC = container.left + edgePad;
                    const maxC = container.right - estW - edgePad;
                    if (maxC >= minC) {
                        left = Math.max(minC, Math.min(left, maxC));
                    } else {
                        // 极窄时贴输入框内左侧
                        left = minC;
                    }
                }

                if (vw) {
                    left = Math.max(edgePad, Math.min(left, vw - estW - edgePad));
                }
                if (vh && top + estH > vh - edgePad) {
                    const flipped = rect.top - gap - estH;
                    top = flipped >= edgePad ? flipped : Math.max(edgePad, vh - estH - edgePad);
                }
                setAnchorPos({ top, left });
            } else {
                setAnchorPos(null);
            }
        },
        close: () => {
            setOpen(false);
            setQuery('');
            setAnchorPos(null);
            setHighlightedIndex(-1);
        },
    }), []);

    useEffect(() => {
        const input = importInputRef.current;
        if (!input) return;
        input.setAttribute('webkitdirectory', '');
        input.setAttribute('directory', '');
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToast(null), 1800);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const updatePanelPlacement = useCallback(() => {
        const root = ref.current;
        if (!root) return;
        const rect = root.getBoundingClientRect();
        const margin = 8;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const panelW = Math.min(vw - 32, 320);
        setAlignRight(rect.left + panelW > vw - 16);

        const spaceBelow = vh - rect.bottom - margin;
        const spaceAbove = rect.top - margin;
        const belowList = Math.max(0, spaceBelow - SKILL_PANEL_CHROME_PX);
        const aboveList = Math.max(0, spaceAbove - SKILL_PANEL_CHROME_PX);

        let nextPlacement: 'bottom' | 'top' = 'bottom';
        let nextMax = SKILL_PANEL_IDEAL_LIST_PX;

        // 默认优先下拉；仅当下方放不下且上方更宽裕时改为上拉
        if (belowList >= SKILL_PANEL_MIN_LIST_PX) {
            nextPlacement = 'bottom';
            nextMax = Math.min(SKILL_PANEL_IDEAL_LIST_PX, belowList);
        } else if (aboveList >= SKILL_PANEL_MIN_LIST_PX && aboveList > belowList) {
            nextPlacement = 'top';
            nextMax = Math.min(SKILL_PANEL_IDEAL_LIST_PX, aboveList);
        } else if (belowList >= aboveList) {
            nextPlacement = 'bottom';
            nextMax = Math.max(72, belowList);
        } else {
            nextPlacement = 'top';
            nextMax = Math.max(72, aboveList);
        }

        setPlacement(nextPlacement);
        setListMaxHeight(nextMax);
    }, []);

    // 须在任何引用 filtered / handlePick 的 useEffect 之前定义，否则白屏：Cannot access before initialization
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        const source = !q
            ? skills
            : skills.filter(
                (s) =>
                    s.name.toLowerCase().includes(q) ||
                    s.desc.toLowerCase().includes(q) ||
                    s.id.toLowerCase().includes(q),
            );
        return [...source].sort((a, b) => {
            const pa = a.pinned ? 1 : 0;
            const pb = b.pinned ? 1 : 0;
            if (pa !== pb) return pb - pa;
            if (a.pinned && b.pinned) return (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0);
            return 0;
        });
    }, [query, skills]);

    const handlePick = useCallback((skill: SkillPickItem) => {
        onPick(skill);
        setOpen(false);
        setQuery('');
        setAnchorPos(null);
        setHighlightedIndex(-1);
    }, [onPick]);

    useLayoutEffect(() => {
        if (!open) return;
        updatePanelPlacement();
        const onViewport = () => updatePanelPlacement();
        window.addEventListener('resize', onViewport);
        window.addEventListener('scroll', onViewport, true);
        return () => {
            window.removeEventListener('resize', onViewport);
            window.removeEventListener('scroll', onViewport, true);
        };
    }, [open, updatePanelPlacement]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const insideTrigger = ref.current?.contains(target) ?? false;
            const insidePanel = panelRef.current?.contains(target) ?? false;
            if (!insideTrigger && !insidePanel) {
                setOpen(false);
                setQuery('');
                setAnchorPos(null);
                setHighlightedIndex(-1);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                setQuery('');
                setAnchorPos(null);
                setHighlightedIndex(-1);
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex((i) => {
                    const len = filtered.length;
                    if (len === 0) return -1;
                    if (i < 0) return 0;
                    return (i + 1) % len;
                });
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex((i) => {
                    const len = filtered.length;
                    if (len === 0) return -1;
                    if (i < 0) return len - 1;
                    return (i - 1 + len) % len;
                });
                return;
            }
            if (e.key === 'Enter') {
                const len = filtered.length;
                if (len === 0) return;
                e.preventDefault();
                e.stopPropagation();
                if (highlightedIndex < 0) return;
                const skill = filtered[highlightedIndex];
                if (skill) handlePick(skill);
            }
        };
        // 用 capture 阶段，保证 Enter 在 @ 触发场景下先于 contentEditable 的 keydown 监听执行
        document.addEventListener('keydown', onKey, true);
        return () => document.removeEventListener('keydown', onKey, true);
    }, [open, filtered, highlightedIndex, handlePick]);

    // 面板打开时：如果是通过"技能"按钮触发（非 @ 锚点），聚焦搜索框方便打字过滤；
    // 如果是通过 @ 触发，让主输入框保持焦点，避免打断用户的输入光标
    useEffect(() => {
        if (!open) return;
        if (anchorPos) return;
        const t = window.setTimeout(() => searchRef.current?.focus(), 0);
        return () => window.clearTimeout(t);
    }, [open, anchorPos]);

    // 打开或筛选项变化时取消键盘高亮，需再次用上下键才会出现选中条
    useEffect(() => {
        if (!open) return;
        setHighlightedIndex(-1);
    }, [open, query, filtered.length]);

    // 高亮项自动滚入可视区
    useEffect(() => {
        if (!open || highlightedIndex < 0) return;
        const list = listRef.current;
        if (!list) return;
        const node = list.querySelector<HTMLElement>(`[data-skill-index="${highlightedIndex}"]`);
        if (node) node.scrollIntoView({ block: 'nearest' });
    }, [open, highlightedIndex]);

    const togglePinSkill = useCallback((skillId: string) => {
        setSkills((prev) => {
            const target = prev.find((s) => s.id === skillId);
            if (!target) return prev;
            const nextPinned = !target.pinned;
            return prev.map((s) =>
                s.id === skillId
                    ? { ...s, pinned: nextPinned, pinnedAt: nextPinned ? Date.now() : undefined }
                    : s,
            );
        });
    }, []);

    const manageFiltered = useMemo(() => {
        const q = manageQuery.trim().toLowerCase();
        return skills.filter((skill) => {
            const matchesFilter = manageFilter === 'all' || skill.source === manageFilter;
            const matchesQuery = !q
                || skill.name.toLowerCase().includes(q)
                || skill.desc.toLowerCase().includes(q)
                || skill.id.toLowerCase().includes(q)
                || skill.path?.toLowerCase().includes(q);
            return matchesFilter && matchesQuery;
        });
    }, [manageFilter, manageQuery, skills]);

    const skillCounts = useMemo(
        () => ({
            all: skills.length,
            builtin: skills.filter((skill) => skill.source === 'builtin').length,
            user: skills.filter((skill) => skill.source === 'user').length,
        }),
        [skills],
    );

    const toggleSkillTrigger = (skillId: string) => {
        const target = skills.find((skill) => skill.id === skillId);
        if (!target) return;
        const nextMode: SkillTriggerMode = target.triggerMode === 'auto' ? 'manual' : 'auto';
        setSkills((prev) =>
            prev.map((skill) =>
                skill.id === skillId
                    ? {
                        ...skill,
                        triggerMode: nextMode,
                    }
                    : skill,
            ),
        );
        setToast(tr(nextMode === 'auto' ? '已设置为自动触发' : '已设置为手动触发'));
    };

    const handleImportSkills = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const folderEntries = new Map<string, number>();
        files.forEach((file) => {
            const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
            const [folderName] = relativePath.split('/');
            if (!folderName) return;
            folderEntries.set(folderName, (folderEntries.get(folderName) ?? 0) + 1);
        });

        if (folderEntries.size === 0) {
            e.target.value = '';
            return;
        }

        setSkills((prev) => {
            const next = [...prev];
            folderEntries.forEach((fileCount, folderName) => {
                const desc = `本地导入 · ${fileCount} 个文件`;
                const existingIndex = next.findIndex(
                    (skill) => skill.source === 'user' && skill.name === folderName,
                );
                if (existingIndex >= 0) {
                    next[existingIndex] = {
                        ...next[existingIndex],
                        desc,
                        path: folderName,
                        status: 'ready',
                        triggerMode: 'auto',
                    };
                    return;
                }
                next.push(createUserSkill({ name: folderName, desc, path: folderName }));
            });
            return next;
        });

        setManageFilter('user');
        setManageQuery('');
        e.target.value = '';
    };

    const handleCreateSkillByChat = () => {
        let draftName = '新技能草稿';
        const existingDraftNames = new Set(
            skills
                .filter((skill) => skill.source === 'user' && skill.status === 'draft')
                .map((skill) => skill.name),
        );
        if (existingDraftNames.has(draftName)) {
            let index = 2;
            while (existingDraftNames.has(`新技能草稿 ${index}`)) index += 1;
            draftName = `新技能草稿 ${index}`;
        }

        setSkills((prev) => [
            createUserSkill({
                name: draftName,
                desc: '通过对话新建，等待补充技能说明',
                status: 'draft',
            }),
            ...prev,
        ]);
        setManageFilter('user');
        setManageQuery('');
        setManageOpen(false);
        setAppSurface('ai-home');
        setActiveNav('modao-ai');
        setHomeDraftPrompt(DEFAULT_SKILL_CREATOR_PROMPT);
        setActiveChatLabel('');
        setUserPrompt('');
        setViewMode('home');
    };

    const filterOptions: Array<{ id: SkillManageFilter; label: string; count: number }> = [
        { id: 'all', label: '全部技能', count: skillCounts.all },
        { id: 'builtin', label: '内置技能', count: skillCounts.builtin },
        { id: 'user', label: '用户添加', count: skillCounts.user },
    ];

    const panelBody = (
        <>
            <div className="p-2 pb-1.5 border-b border-gray-50">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <Input
                        ref={searchRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={tr('搜索技能')}
                        className={cn(
                            'h-9 pl-8 text-xs rounded-xl border-slate-200/90 bg-slate-50/90 text-slate-800 shadow-none',
                            'placeholder:text-slate-400',
                            'focus-visible:ring-0 focus-visible:ring-offset-0',
                            'focus-visible:border-slate-300 focus-visible:bg-white',
                            'transition-[border-color,background-color] duration-150',
                        )}
                    />
                </div>
            </div>
            <div
                ref={listRef}
                className="overflow-y-auto overscroll-contain px-1.5 py-1"
                style={{ maxHeight: listMaxHeight }}
            >
                {filtered.length === 0 ? (
                    <div className="px-3 py-6 text-center text-[11px] text-gray-400">{tr('暂无匹配技能')}</div>
                ) : (
                    filtered.map((skill, index) => (
                        <div
                            key={skill.id}
                            data-skill-index={index}
                            className={cn(
                                'group relative flex items-start gap-2.5 rounded-xl px-2 py-2 transition-colors',
                                index === highlightedIndex && highlightedIndex >= 0 ? 'bg-indigo-50/80' : 'hover:bg-slate-50',
                            )}
                        >
                            <button
                                type="button"
                                role="option"
                                onClick={() => handlePick(skill)}
                                className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                            >
                                <span
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
                                        skill.colorClass,
                                    )}
                                >
                                    {skill.letter}
                                </span>
                                <span className="min-w-0 flex-1 pt-0.5">
                                    <span className="block text-[13px] font-medium text-gray-800 leading-tight truncate">{tr(skill.name)}</span>
                                    <span className="mt-0.5 block text-[10px] text-gray-400 leading-snug line-clamp-2">{tr(skill.desc)}</span>
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    togglePinSkill(skill.id);
                                }}
                                aria-label={tr(skill.pinned ? '取消置顶' : '置顶')}
                                title={tr(skill.pinned ? '取消置顶' : '置顶')}
                                className={cn(
                                    'absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150',
                                    skill.pinned
                                        ? 'text-amber-500 bg-amber-50/80 opacity-100'
                                        : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
                                )}
                            >
                                {skill.pinned ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        stroke="currentColor"
                                        strokeWidth="1.25"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ transform: 'rotate(45deg)' }}
                                    >
                                        <path d="M12 17v5" />
                                        <path d="M9 10.76V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4.76a2 2 0 0 0 1.11 1.79l1.78.9A2 2 0 0 1 19 15.24V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-.76a2 2 0 0 1 1.11-1.79l1.78-.9A2 2 0 0 0 9 10.76z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.75"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 17v5" />
                                        <path d="M9 10.76V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4.76a2 2 0 0 0 1.11 1.79l1.78.9A2 2 0 0 1 19 15.24V16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-.76a2 2 0 0 1 1.11-1.79l1.78-.9A2 2 0 0 0 9 10.76z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </>
    );

    return (
        <>
            <div className="relative shrink-0" ref={ref}>
                <button
                    type="button"
                    onClick={() =>
                        setOpen((v) => {
                            const next = !v;
                            if (next) {
                                setQuery('');
                                setHighlightedIndex(-1);
                            }
                            return next;
                        })
                    }
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors bg-white shadow-sm',
                        open
                            ? 'border-indigo-200 text-indigo-600 bg-indigo-50/80'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                    aria-expanded={open}
                    aria-haspopup="listbox"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                        <path d="M9 18h6" />
                        <path d="M10 22h4" />
                    </svg>
                    <span>{tr('技能')}</span>
                </button>
                {open && !anchorPos && (
                    <div
                        ref={panelRef}
                        role="listbox"
                        onMouseLeave={() => setHighlightedIndex(-1)}
                        className={cn(
                            'absolute z-[100] w-[min(100vw-2rem,20rem)] max-h-[min(calc(100vh-1rem),28rem)] rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden flex flex-col',
                            placement === 'bottom' ? 'top-full left-0 mt-2' : 'bottom-full left-0 mb-2',
                            alignRight && 'left-auto right-0',
                        )}
                    >
                        {panelBody}
                    </div>
                )}
            </div>

            <Dialog open={manageOpen} onOpenChange={setManageOpen}>
                <DialogContent className="flex h-[min(860px,calc(100vh-40px))] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-0 shadow-[0_32px_80px_-32px_rgba(15,23,42,0.38)] sm:max-w-[1020px]">
                    <DialogHeader className="border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-7 pb-5 pt-7">
                        <DialogTitle className="text-[18px] font-semibold tracking-[0.01em] text-slate-900">{tr('技能管理')}</DialogTitle>
                        <DialogDescription className="mt-1 text-[13px] leading-6 text-slate-500">
                            {tr('管理已安装技能，设置自动或手动触发，并支持从本地导入或通过对话新建。')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex min-h-0 flex-1 flex-col bg-slate-50/55 px-7 pb-7 pt-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                                <div className="relative min-w-[240px] max-w-[360px] flex-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="m21 21-4.3-4.3" />
                                    </svg>
                                    <Input
                                        value={manageQuery}
                                        onChange={(e) => setManageQuery(e.target.value)}
                                        placeholder={tr('搜索技能')}
                                        className="h-11 rounded-2xl border-slate-200 bg-white pl-9 text-[13px] text-slate-800 shadow-none placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:bg-white focus-visible:ring-0 focus-visible:ring-offset-0"
                                    />
                                </div>

                                <Select value={manageFilter} onValueChange={(value) => setManageFilter(value as SkillManageFilter)}>
                                    <SelectTrigger className="h-11 w-[156px] rounded-2xl border-slate-200 bg-white px-3 text-[13px] text-slate-700 shadow-none focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder={tr('筛选技能')} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200">
                                        {filterOptions.map((option) => (
                                            <SelectItem key={option.id} value={option.id} className="text-[13px] text-slate-700">
                                                {`${tr(option.label)} (${option.count})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        className="h-11 shrink-0 rounded-2xl bg-indigo-600 px-5 text-[13px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(79,70,229,0.8)] hover:bg-indigo-700"
                                    >
                                        {tr('新建技能')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[170px] rounded-2xl border-slate-200 bg-white p-1.5 shadow-lg">
                                    <DropdownMenuItem
                                        onClick={() => importInputRef.current?.click()}
                                        className="cursor-pointer rounded-xl px-3 py-2 text-[13px] text-slate-700"
                                    >
                                        {tr('从本地导入')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleCreateSkillByChat}
                                        className="cursor-pointer rounded-xl px-3 py-2 text-[13px] text-slate-700"
                                    >
                                        {tr('通过对话新建')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <input
                                ref={importInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleImportSkills}
                            />
                        </div>

                        <div className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 pb-1">
                            {manageFiltered.length === 0 ? (
                                <div className="rounded-[26px] border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-[0_18px_42px_-36px_rgba(15,23,42,0.45)]">
                                    <div className="text-[15px] font-medium text-slate-700">{tr('暂无匹配技能')}</div>
                                    <div className="mt-2 text-[12px] leading-6 text-slate-400">
                                        {tr('试试切换筛选项，或从本地导入技能目录。')}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {manageFiltered.map((skill) => (
                                        <div
                                            key={skill.id}
                                            className="group flex min-h-[108px] items-center justify-between gap-4 rounded-[26px] border border-slate-200 bg-white px-5 py-4 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.45)] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_22px_48px_-32px_rgba(15,23,42,0.22)]"
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                <span
                                                    className={cn(
                                                        'mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] text-[15px] font-semibold shadow-sm',
                                                        skill.colorClass,
                                                    )}
                                                >
                                                    {skill.letter}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-[14px] font-semibold leading-6 text-slate-900">{tr(skill.name)}</span>
                                                        <span
                                                            className={cn(
                                                                'rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4',
                                                                skill.source === 'builtin'
                                                                    ? 'bg-slate-100 text-slate-500'
                                                                    : 'bg-indigo-50 text-indigo-600',
                                                            )}
                                                        >
                                                            {tr(skill.source === 'builtin' ? '内置技能' : '用户添加')}
                                                        </span>
                                                        {skill.status === 'draft' && (
                                                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold leading-4 text-amber-600">
                                                                {tr('草稿')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-slate-500">{tr(skill.desc)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleSkillTrigger(skill.id)}
                                                className={cn(
                                                    'relative h-6 w-10 shrink-0 rounded-full border transition-[background-color,border-color,box-shadow]',
                                                    skill.triggerMode === 'auto'
                                                        ? 'border-indigo-600 bg-indigo-600 shadow-[0_8px_18px_-12px_rgba(79,70,229,0.8)]'
                                                        : 'border-slate-200 bg-slate-200',
                                                )}
                                                aria-pressed={skill.triggerMode === 'auto'}
                                                aria-label={tr(skill.triggerMode === 'auto' ? '自动触发' : '手动触发')}
                                            >
                                                <span
                                                    className={cn(
                                                        'absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(15,23,42,0.18)] transition-transform duration-200',
                                                        skill.triggerMode === 'auto' ? 'translate-x-[16px]' : 'translate-x-0',
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {toast && typeof document !== 'undefined' && createPortal(
                <div className="pointer-events-none fixed left-1/2 top-5 z-[240] -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2 text-[12px] font-medium text-white shadow-[0_16px_40px_-16px_rgba(15,23,42,0.55)]">
                    {toast}
                </div>,
                document.body,
            )}
            {open && anchorPos && typeof document !== 'undefined' && createPortal(
                <div
                    ref={panelRef}
                    role="listbox"
                    onMouseLeave={() => setHighlightedIndex(-1)}
                    style={{
                        position: 'fixed',
                        top: anchorPos.top,
                        left: anchorPos.left,
                        maxWidth: 'calc(100vw - 16px)',
                        zIndex: 220,
                    }}
                    className="w-[min(100vw-2rem,20rem)] max-h-[min(calc(100vh-1rem),28rem)] rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden flex flex-col"
                >
                    {panelBody}
                </div>,
                document.body,
            )}
        </>
    );
});


// ---- Main Component ----
type PromptInputProps = {
    /**
     * 在墨刀工作台选中「墨刀AI」时与上方六卡区域同宽（1100px）；独立首页保持 900px。
     */
    alignWithWorkbenchTabWidth?: boolean;
};

export function PromptInput({ alignWithWorkbenchTabWidth = false }: PromptInputProps) {
    // activeTab = null 表示默认态（显示推荐卡片），选中某 Tab 后在输入框底部以胶囊标签显示
    const [showMoreTabs, setShowMoreTabs] = useState(false);
    const [visibleMainTabCount, setVisibleMainTabCount] = useState(MAIN_TABS.length);
    const [inputValue, setInputValue] = useState('');
    const {
        setIsCategorySelected,
        activeNav,
        homeDraftPrompt,
        setHomeDraftPrompt,
        setViewMode,
        setUserPrompt,
        homeActiveTab: activeTab,
        setHomeActiveTab: setActiveTab,
        homeSelectedTag: selectedTag,
        setHomeSelectedTag: setSelectedTag,
    } = useSidebarContext();
    const inputRef = useRef<HTMLDivElement>(null);
    const skillSelectionRafRef = useRef<number | null>(null);
    const skillPickerRef = useRef<SkillPickerHandle>(null);
    const [selectedSkills, setSelectedSkills] = useState<SkillPickItem[]>([]);
    // 记录最近一次触发技能面板的 @ 位置（用于选中后回填删除）
    const atTriggerRef = useRef<{ node: Node; offset: number } | null>(null);
    /** 上方白色输入框外框 */
    const homeInputCardRef = useRef<HTMLDivElement>(null);
    const subCardsRef = useRef<HTMLDivElement>(null);
    const secondaryTabsScrollRef = useRef<HTMLDivElement>(null);
    const secondaryTabsScrollRafRef = useRef<number | null>(null);
    /** 为 true 时表示点击箭头触发的水平缓动尚未结束，右端在「等效带」内不得提前 100ms 收右箭（与左侧无等效带、行为对齐） */
    const secondaryTabsProgrammaticScrollRef = useRef(false);
    const secondaryTabArrowLeftHideTimerRef = useRef<number | null>(null);
    const secondaryTabArrowRightHideTimerRef = useRef<number | null>(null);
    const moreTabsRef = useRef<HTMLDivElement>(null);
    const moreTabsMenuRef = useRef<HTMLDivElement>(null);
    /** 二级 tab 整行（左箭头 + 滚动区 + 右箭头），贴边以整行外框为准 */
    const secondaryTabsRowRef = useRef<HTMLDivElement>(null);
    const [moreTabsMenuPos, setMoreTabsMenuPos] = useState<{ top: number; left: number } | null>(null);
    const tabsViewportRef = useRef<HTMLDivElement>(null);
    const measureMoreButtonRef = useRef<HTMLButtonElement>(null);
    const measureTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const referenceImageInputRef = useRef<HTMLInputElement>(null);
    const [subCardsHeight, setSubCardsHeight] = useState(0);
    const [referenceImportOpen, setReferenceImportOpen] = useState(false);
    const [referenceImportType, setReferenceImportType] = useState<Exclude<ReferenceImportType, 'image'>>('web');
    const [referenceImportMode, setReferenceImportMode] = useState<ReferenceImportMode>('prototype');
    const [referenceLink, setReferenceLink] = useState('');
    const [secondaryTabsCanScrollLeft, setSecondaryTabsCanScrollLeft] = useState(false);
    const [secondaryTabsCanScrollRight, setSecondaryTabsCanScrollRight] = useState(false);
    const [emptySendToast, setEmptySendToast] = useState<string | null>(null);
    /** 探索想法「换一批」轮次，切换一级/二级标签时重置 */
    const [exploreBatchIndex, setExploreBatchIndex] = useState(0);

    useEffect(() => {
        if (!emptySendToast) return;
        const timer = window.setTimeout(() => setEmptySendToast(null), 2000);
        return () => window.clearTimeout(timer);
    }, [emptySendToast]);

    useEffect(() => {
        setIsCategorySelected(!!selectedTag);
    }, [selectedTag, setIsCategorySelected]);

    useEffect(() => {
        setExploreBatchIndex(0);
    }, [activeTab, selectedTag]);

    const clearSecondaryTabArrowHideTimers = useCallback(() => {
        if (secondaryTabArrowLeftHideTimerRef.current != null) {
            window.clearTimeout(secondaryTabArrowLeftHideTimerRef.current);
            secondaryTabArrowLeftHideTimerRef.current = null;
        }
        if (secondaryTabArrowRightHideTimerRef.current != null) {
            window.clearTimeout(secondaryTabArrowRightHideTimerRef.current);
            secondaryTabArrowRightHideTimerRef.current = null;
        }
    }, []);

    /**
     * 二级 tab 贴左/贴右。
     * 主指标用 scroll 尺寸 + `rem`（与 max 差）与 `SECONDARY_TABS_SCROLL_END_INSET_PX` 做视觉右终点，避免末项与右箭交叠仍显右箭。
     * 首/末子项与「滚动视口」比对补子像素/误差；不得用「末项 right >= 整行右端」类整行判断。
     * `atEnd` 含 rem「等效带」；`atEndStrict` 仅真正贴底（用于右箭 100ms 收箭，避免右滑缓动中提前判到「底」与左侧行为不一致）。
     */
    const getSecondaryTabScrollEdges = useCallback(():
        | { atStart: boolean; atEnd: boolean; atEndStrict: boolean }
        | null => {
        const scroll = secondaryTabsScrollRef.current;
        if (!scroll) return null;

        const sl = scroll.scrollLeft;
        const sw = scroll.scrollWidth;
        const cw = scroll.clientWidth;
        const maxScroll = Math.max(0, sw - cw);
        const remRight = maxScroll - sl;
        const track = scroll.firstElementChild as HTMLElement | null;
        const firstChild = track?.firstElementChild as HTMLElement | null;
        const lastChild = track?.lastElementChild as HTMLElement | null;
        const scrollRect = scroll.getBoundingClientRect();
        const ge = 3;
        const t = SECONDARY_TABS_SCROLL_END_INSET_PX;

        let atStart = sl <= 1.5;
        const scrollSlipEnd = sl + cw >= sw - 1.5;
        /** 不含 rem 等效带，仅几何/贴齐意义上的「到底」 */
        let atEndStrict = scrollSlipEnd;
        /** 与 UI 等：含等效带 + 子项比对 */
        let atEnd = scrollSlipEnd;
        if (!atEnd && maxScroll > t && remRight <= t + 0.5) {
            atEnd = true;
        }

        if (firstChild) {
            const r = firstChild.getBoundingClientRect();
            if (r.left >= scrollRect.left - ge) atStart = true;
        }
        if (lastChild) {
            const r = lastChild.getBoundingClientRect();
            if (r.right <= scrollRect.right + ge) {
                atEnd = true;
                atEndStrict = true;
            }
        }
        return { atStart, atEnd, atEndStrict };
    }, []);

    /** 手滑/resize/点击滚动结束：可滚动侧立即出现箭头；贴到左/右端时等 100ms 再藏该侧（连续贴边不重复开定时器） */
    const updateSecondaryTabsScrollState = useCallback(() => {
        const node = secondaryTabsScrollRef.current;
        if (!node) {
            clearSecondaryTabArrowHideTimers();
            setSecondaryTabsCanScrollLeft(false);
            setSecondaryTabsCanScrollRight(false);
            return;
        }
        if (node.scrollWidth <= node.clientWidth + 0.5) {
            clearSecondaryTabArrowHideTimers();
            setSecondaryTabsCanScrollLeft(false);
            setSecondaryTabsCanScrollRight(false);
            return;
        }
        const edges = getSecondaryTabScrollEdges();
        if (!edges) {
            clearSecondaryTabArrowHideTimers();
            setSecondaryTabsCanScrollLeft(false);
            setSecondaryTabsCanScrollRight(false);
            return;
        }
        const d = SECONDARY_TABS_EDGE_ARROW_HIDE_DELAY_MS;

        if (!edges.atStart) {
            if (secondaryTabArrowLeftHideTimerRef.current != null) {
                window.clearTimeout(secondaryTabArrowLeftHideTimerRef.current);
                secondaryTabArrowLeftHideTimerRef.current = null;
            }
            setSecondaryTabsCanScrollLeft(true);
        } else if (secondaryTabArrowLeftHideTimerRef.current == null) {
            secondaryTabArrowLeftHideTimerRef.current = window.setTimeout(() => {
                secondaryTabArrowLeftHideTimerRef.current = null;
                setSecondaryTabsCanScrollLeft(false);
            }, d);
        }

        if (!edges.atEnd) {
            if (secondaryTabArrowRightHideTimerRef.current != null) {
                window.clearTimeout(secondaryTabArrowRightHideTimerRef.current);
                secondaryTabArrowRightHideTimerRef.current = null;
            }
            setSecondaryTabsCanScrollRight(true);
        } else {
            const inLooseNotStrict = edges.atEnd && !edges.atEndStrict;
            const holdRightInEquivBand = inLooseNotStrict && secondaryTabsProgrammaticScrollRef.current;
            if (holdRightInEquivBand) {
                if (secondaryTabArrowRightHideTimerRef.current != null) {
                    window.clearTimeout(secondaryTabArrowRightHideTimerRef.current);
                    secondaryTabArrowRightHideTimerRef.current = null;
                }
                setSecondaryTabsCanScrollRight(true);
            } else if (secondaryTabArrowRightHideTimerRef.current == null) {
                secondaryTabArrowRightHideTimerRef.current = window.setTimeout(() => {
                    secondaryTabArrowRightHideTimerRef.current = null;
                    setSecondaryTabsCanScrollRight(false);
                }, d);
            }
        }
    }, [clearSecondaryTabArrowHideTimers, getSecondaryTabScrollEdges]);

    /** 将 scrollLeft 钳在 [0, max]，防止触摸/惯性/子像素在两侧拉出「空程」或穿透到父级滚动 */
    const clampSecondaryTabsScrollPosition = useCallback(() => {
        const n = secondaryTabsScrollRef.current;
        if (!n) return;
        const max = Math.max(0, n.scrollWidth - n.clientWidth);
        if (n.scrollLeft < 0) n.scrollLeft = 0;
        else if (n.scrollLeft > max) n.scrollLeft = max;
    }, []);

    /** 点击左右箭头/即时滚动结束：与手滑共用的贴边 100ms 后收箭，避免一贴边就消失 */
    const updateSecondaryTabsScrollStateAfterArrowScroll = useCallback(() => {
        updateSecondaryTabsScrollState();
    }, [updateSecondaryTabsScrollState]);

    const cancelSecondaryTabsScrollAnimation = useCallback(() => {
        if (secondaryTabsScrollRafRef.current != null) {
            cancelAnimationFrame(secondaryTabsScrollRafRef.current);
            secondaryTabsScrollRafRef.current = null;
        }
        secondaryTabsProgrammaticScrollRef.current = false;
    }, []);

    useEffect(
        () => () => {
            cancelSecondaryTabsScrollAnimation();
            clearSecondaryTabArrowHideTimers();
        },
        [cancelSecondaryTabsScrollAnimation, clearSecondaryTabArrowHideTimers],
    );

    useEffect(() => {
        setSelectedTag(null);
        setActiveTab(null);
        setShowMoreTabs(false);
    }, [activeNav]);

    useEffect(() => {
        if (!homeDraftPrompt) return;
        setInputValue(homeDraftPrompt);
        setSelectedSkills([]);
        // 把草稿填进 contentEditable 编辑器，并把光标置于末尾
        if (inputRef.current) {
            inputRef.current.innerText = homeDraftPrompt;
        }
        setHomeDraftPrompt('');
        window.requestAnimationFrame(() => {
            const el = inputRef.current;
            if (!el) return;
            el.focus();
            const sel = window.getSelection();
            if (sel) {
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        });
    }, [homeDraftPrompt, setHomeDraftPrompt]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            const insideTrigger = moreTabsRef.current?.contains(target) ?? false;
            const insideMenu = moreTabsMenuRef.current?.contains(target) ?? false;
            if (!insideTrigger && !insideMenu) {
                setShowMoreTabs(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // 打开"更多"菜单时，基于按钮位置计算 portal 定位；窗口 resize/scroll 时跟随更新
    useLayoutEffect(() => {
        if (!showMoreTabs) {
            setMoreTabsMenuPos(null);
            return;
        }
        const updatePos = () => {
            const el = moreTabsRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            setMoreTabsMenuPos({
                top: rect.bottom + 8,
                left: rect.left,
            });
        };
        updatePos();
        window.addEventListener('resize', updatePos);
        window.addEventListener('scroll', updatePos, true);
        return () => {
            window.removeEventListener('resize', updatePos);
            window.removeEventListener('scroll', updatePos, true);
        };
    }, [showMoreTabs]);

    useLayoutEffect(() => {
        if (activeTab || !tabsViewportRef.current) return;

        let frameId = 0;
        const gap = 12;

        const calculateVisibleTabs = () => {
            const availableWidth = tabsViewportRef.current?.clientWidth ?? 0;
            if (!availableWidth) return;

            const moreWidth = measureMoreButtonRef.current?.getBoundingClientRect().width ?? 0;
            const tabWidths = MAIN_TABS.map(tab => measureTabRefs.current[tab.id]?.getBoundingClientRect().width ?? 0);

            let widthSum = 0;
            let nextVisibleCount = 0;

            for (const tabWidth of tabWidths) {
                const candidateCount = nextVisibleCount + 1;
                const candidateWidth = widthSum + tabWidth + moreWidth + gap * candidateCount;
                if (candidateWidth > availableWidth) break;
                widthSum += tabWidth;
                nextVisibleCount = candidateCount;
            }

            setVisibleMainTabCount(prev => (prev === nextVisibleCount ? prev : nextVisibleCount));
        };

        const scheduleCalculation = () => {
            cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(calculateVisibleTabs);
        };

        scheduleCalculation();

        const resizeObserver = new ResizeObserver(scheduleCalculation);
        resizeObserver.observe(tabsViewportRef.current);

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
        };
    }, [activeTab]);

    const activeTabDef = activeTab ? ALL_TABS.find(t => t.id === activeTab) ?? null : null;
    const visibleMainTabs = MAIN_TABS.slice(0, visibleMainTabCount);
    const hiddenMainTabs = MAIN_TABS.slice(visibleMainTabCount);
    const moreMenuTabs = [...hiddenMainTabs, ...EXTRA_TABS];
    const applyMainTabSelection = (tabId: string) => {
        setActiveTab(tabId);
        setSelectedTag(null);
        setShowMoreTabs(false);
    };
    const clearActivePath = () => {
        setActiveTab(null);
        setSelectedTag(null);
    };

    const handleCardClick = (card: SubCardData) => {
        if (!activeTab) {
            const mappedTab = RECOMMEND_CARD_TO_TAB[card.title];
            if (mappedTab) {
                setActiveTab(mappedTab);
                setSelectedTag(getInitialSecondaryTagFromRecommendCard(card.title, mappedTab));
                setShowMoreTabs(false);
                setTimeout(() => {
                    if (inputRef.current) inputRef.current.focus();
                }, 50);
                return;
            }
        }
        if (activeTab && selectedTag === card.title) {
            setSelectedTag(null);
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 50);
            return;
        }
        setSelectedTag(card.title);
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 50);
    };

    const handleStructuredTagSelect = (title: string) => {
        if (selectedTag === title) {
            setSelectedTag(null);
            window.requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
            return;
        }
        handleCardClick({
            title,
            desc: '',
            hoverBg: '',
            hoverColor: '',
            iconPath: null,
        });
    };

    const clearTag = () => setSelectedTag(null);

    /**
     * 从 contentEditable 编辑器提取内容：
     * - `text`：用于 `inputValue`（把 chip 以「技能名」形式嵌入文本，方便意图判断/长度检测）
     * - `raw`：用于发送（chip 以 `[技能:名称]` 序列化）
     * - `skills`：当前顺序下的技能数组（已按 id 去重）
     */
    const serializeEditor = useCallback(() => {
        const el = inputRef.current;
        if (!el) return { text: '', raw: '', skills: [] as SkillPickItem[] };
        let text = '';
        let raw = '';
        const skills: SkillPickItem[] = [];
        const seen = new Set<string>();
        const visit = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                text += node.textContent ?? '';
                raw += node.textContent ?? '';
                return;
            }
            if (node instanceof HTMLElement) {
                if (node.dataset.skillId) {
                    const id = node.dataset.skillId;
                    const name = node.dataset.skillName ?? id;
                    text += name;
                    raw += `[技能:${name}]`;
                    if (!seen.has(id)) {
                        seen.add(id);
                        skills.push({
                            id,
                            name,
                            desc: node.dataset.skillDesc ?? '',
                            letter: node.dataset.skillLetter ?? name.charAt(0),
                            colorClass: node.dataset.skillColor ?? 'bg-slate-500 text-white',
                            source: (node.dataset.skillSource as SkillSource) ?? 'builtin',
                            triggerMode: (node.dataset.skillTrigger as SkillTriggerMode) ?? 'auto',
                        });
                    }
                    return;
                }
                if (node.tagName === 'BR') {
                    text += '\n';
                    raw += '\n';
                    return;
                }
                node.childNodes.forEach(visit);
            }
        };
        el.childNodes.forEach(visit);
        return { text, raw, skills };
    }, []);

    const syncFromEditor = useCallback(() => {
        const { text, skills } = serializeEditor();
        setInputValue(text);
        setSelectedSkills(skills);
    }, [serializeEditor]);

    const insertSkillChip = useCallback((skill: SkillPickItem) => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        const sel = window.getSelection();
        if (!sel) return;

        // 优先用之前记录的 @ 位置；若未记录且光标前一个字符恰好是 @（如用户手动打出），同样视为触发
        const trigger = atTriggerRef.current;
        let caretRange: Range | null = null;
        if (trigger && trigger.node.nodeType === Node.TEXT_NODE && el.contains(trigger.node)) {
            const txt = trigger.node as Text;
            if (txt.data[trigger.offset - 1] === '@') {
                txt.deleteData(trigger.offset - 1, 1);
                caretRange = document.createRange();
                caretRange.setStart(txt, Math.max(0, trigger.offset - 1));
                caretRange.collapse(true);
            }
        }
        if (!caretRange && sel.rangeCount > 0) {
            const r = sel.getRangeAt(0).cloneRange();
            // 仅接受落在编辑器内的光标
            if (el.contains(r.startContainer)) {
                const node = r.startContainer;
                if (node.nodeType === Node.TEXT_NODE) {
                    const txt = node as Text;
                    const offset = r.startOffset;
                    if (offset > 0 && txt.data[offset - 1] === '@') {
                        txt.deleteData(offset - 1, 1);
                        const nr = document.createRange();
                        nr.setStart(txt, Math.max(0, offset - 1));
                        nr.collapse(true);
                        caretRange = nr;
                    }
                }
                if (!caretRange) caretRange = r;
            }
        }
        atTriggerRef.current = null;

        if (!caretRange) {
            // 兜底：附加到编辑器末尾
            caretRange = document.createRange();
            caretRange.selectNodeContents(el);
            caretRange.collapse(false);
        }

        // 同一条技能已存在则不重复插入
        if (el.querySelector(`[data-skill-id="${CSS.escape(skill.id)}"]`)) {
            sel.removeAllRanges();
            sel.addRange(caretRange);
            syncFromEditor();
            return;
        }

        // 构造 chip DOM
        const chip = document.createElement('span');
        chip.setAttribute('contenteditable', 'false');
        chip.className = 'skill-chip-inline';
        chip.dataset.skillId = skill.id;
        chip.dataset.skillName = skill.name;
        chip.dataset.skillDesc = skill.desc;
        chip.dataset.skillLetter = skill.letter;
        chip.dataset.skillColor = skill.colorClass;
        chip.dataset.skillSource = skill.source;
        chip.dataset.skillTrigger = skill.triggerMode;
        chip.setAttribute('title', skill.name);

        // 统一显示线性 skill icon（灯泡）替代原彩色字母 avatar
        const avatar = document.createElement('span');
        avatar.className = 'skill-chip-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        // 技能 icon 与关 icon 叠放，由 CSS 在 hover 时切换
        avatar.innerHTML =
            '<span class="skill-chip-ico-skill" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg></span>'
            + '<span class="skill-chip-ico-close" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></span>';
        chip.appendChild(avatar);

        const nameEl = document.createElement('span');
        nameEl.className = 'skill-chip-name';
        nameEl.textContent = skill.name;
        chip.appendChild(nameEl);

        // 整个 chip 可点击删除，无需单独的关闭按钮；仅在 chip 自身上做提示态
        chip.setAttribute('data-skill-chip', 'true');
        chip.setAttribute('role', 'button');
        chip.setAttribute('aria-label', `${tr('点击移除技能')} ${skill.name}`);

        // 在光标处插入 chip，之后补一个不换行空格，方便继续输入
        caretRange.insertNode(chip);
        const space = document.createTextNode('\u00A0');
        chip.after(space);

        const after = document.createRange();
        after.setStartAfter(space);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);

        syncFromEditor();
    }, [syncFromEditor]);

    const handleEditorInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        syncFromEditor();

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;
        if (!el.contains(node)) return;
        if (node.nodeType === Node.TEXT_NODE) {
            const txt = (node as Text).data;
            // 只要光标前一个字符是 @（无论前后内容），就弹出技能面板
            if (offset > 0 && txt[offset - 1] === '@') {
                atTriggerRef.current = { node, offset };
                const atRange = document.createRange();
                atRange.setStart(node, offset - 1);
                atRange.setEnd(node, offset);
                const crs = atRange.getClientRects();
                const r0 = crs.length > 0 ? crs[0] : null;
                const rect = r0 ?? atRange.getBoundingClientRect();
                const editorRect = el.getBoundingClientRect();
                skillPickerRef.current?.open({
                    anchorRect: {
                        top: rect.top,
                        bottom: rect.bottom,
                        left: rect.left,
                        right: rect.right,
                        width: rect.width,
                        height: rect.height,
                    },
                    containerRect: {
                        top: editorRect.top,
                        bottom: editorRect.bottom,
                        left: editorRect.left,
                        right: editorRect.right,
                        width: editorRect.width,
                        height: editorRect.height,
                    },
                });
            }
        }
    }, [syncFromEditor]);

    const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const chip = target.closest('.skill-chip-inline') as HTMLElement | null;
        if (chip && chip.parentNode) {
            const sel = window.getSelection();
            // 正在拖选（选区非折叠）时由系统高亮 + data 属性处理，不当作「点按删除」
            if (sel && !sel.isCollapsed) return;
            e.preventDefault();
            e.stopPropagation();
            chip.parentNode.removeChild(chip);
            syncFromEditor();
            inputRef.current?.focus();
        }
    }, [syncFromEditor]);

    // 粘贴事件：识别剪贴板里的 skill chip HTML，整块还原；没有就按纯文本粘贴
    const handleEditorPaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
        const cd = e.clipboardData;
        if (!cd) return;
        const html = cd.getData('text/html');
        const text = cd.getData('text/plain');
        const hasChipHtml = !!html && /data-skill-id=/.test(html);

        if (!hasChipHtml) {
            // 纯文本粘贴：阻止默认行为（避免带富文本样式），手动插入 plain text
            if (!text) return;
            e.preventDefault();
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const node = document.createTextNode(text);
            range.insertNode(node);
            const after = document.createRange();
            after.setStartAfter(node);
            after.collapse(true);
            sel.removeAllRanges();
            sel.addRange(after);
            syncFromEditor();
            return;
        }

        // 含 skill chip 的 HTML → 解析并只保留 chip 节点与纯文本
        e.preventDefault();
        const tpl = document.createElement('template');
        tpl.innerHTML = html;
        const frag = document.createDocumentFragment();
        const seen = new Set<string>();
        const el = inputRef.current;
        // 已存在的 skill id 不再重复插入（与 insertSkillChip 行为一致）
        if (el) {
            el.querySelectorAll<HTMLElement>('.skill-chip-inline').forEach((n) => {
                const id = n.dataset.skillId;
                if (id) seen.add(id);
            });
        }

        const walk = (n: Node) => {
            if (n.nodeType === Node.TEXT_NODE) {
                const data = (n as Text).data;
                if (data) frag.appendChild(document.createTextNode(data));
                return;
            }
            if (n.nodeType === Node.ELEMENT_NODE) {
                const elNode = n as HTMLElement;
                if (elNode.classList?.contains('skill-chip-inline') && elNode.dataset.skillId) {
                    const id = elNode.dataset.skillId;
                    if (seen.has(id)) return;
                    seen.add(id);
                    const clone = elNode.cloneNode(true) as HTMLElement;
                    clone.setAttribute('contenteditable', 'false');
                    frag.appendChild(clone);
                    return;
                }
                n.childNodes.forEach(walk);
            }
        };
        tpl.content.childNodes.forEach(walk);

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const lastChild = frag.lastChild;
        range.insertNode(frag);
        if (lastChild) {
            const after = document.createRange();
            after.setStartAfter(lastChild);
            after.collapse(true);
            sel.removeAllRanges();
            sel.addRange(after);
        }
        syncFromEditor();
    }, [syncFromEditor]);

    /** 与系统选区同步：选区扫过技能 chip 时打标，显示与相邻文字一致的「选中」背景 */
    const updateEditorSkillChipsSelectionHighlight = useCallback(() => {
        const el = inputRef.current;
        if (!el) return;
        for (const c of el.querySelectorAll<HTMLElement>('.skill-chip-inline')) {
            c.removeAttribute('data-skill-in-selection');
        }
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        if (!el.contains(sel.anchorNode) && !el.contains(sel.focusNode)) return;
        const range = sel.getRangeAt(0);
        for (const chip of el.querySelectorAll<HTMLElement>('.skill-chip-inline')) {
            try {
                if (range.intersectsNode(chip)) {
                    chip.setAttribute('data-skill-in-selection', 'true');
                }
            } catch {
                /* 某些环境下 intersectsNode 可能异常，忽略 */
            }
        }
    }, []);

    useEffect(() => {
        const onSel = () => {
            if (skillSelectionRafRef.current != null) return;
            skillSelectionRafRef.current = window.requestAnimationFrame(() => {
                skillSelectionRafRef.current = null;
                updateEditorSkillChipsSelectionHighlight();
            });
        };
        document.addEventListener('selectionchange', onSel);
        return () => {
            document.removeEventListener('selectionchange', onSel);
            if (skillSelectionRafRef.current != null) {
                window.cancelAnimationFrame(skillSelectionRafRef.current);
                skillSelectionRafRef.current = null;
            }
        };
    }, [updateEditorSkillChipsSelectionHighlight]);

    const clearSkillChipSelectionVisual = useCallback(() => {
        const el = inputRef.current;
        if (!el) return;
        for (const c of el.querySelectorAll<HTMLElement>('.skill-chip-inline')) {
            c.removeAttribute('data-skill-in-selection');
        }
    }, []);

    const handleSend = () => {
        const { raw, text } = serializeEditor();
        const content = raw.trim();
        const plain = text.trim();
        // 已选一级/二级能力时也必须输入有效描述，不允许仅标签空发
        if (!content || !plain) return;
        const finalPrompt = selectedTag ? `[${selectedTag}] ${content}` : content;
        setUserPrompt(finalPrompt);
        if (inputRef.current) inputRef.current.innerHTML = '';
        setInputValue('');
        setSelectedSkills([]);
        setViewMode('chat');
    };

    // 设计系统 / 主题工具栏：选中「生成应用」一级 Tab 或应用生成相关二级标签时展示。
    const isWebOrApp = activeTab === 'generate' || selectedTag === 'AI生成Web应用' || selectedTag === 'AI生成App';
    const isPrototypeTab = activeTab === 'prototype';
    const isGenerateTab = activeTab === 'generate';

    const structuredSecondaryItems = useMemo((): PrototypeStructuredItem[] => {
        if (!activeTab) return [];
        if (activeTab === 'prototype') return PROTOTYPE_STRUCTURED_ITEMS;
        if (activeTab === 'generate') return GENERATE_STRUCTURED_ITEMS;
        return tabCardsToStructuredItems(TAB_CARDS_MAP[activeTab] ?? []);
    }, [activeTab]);

    const isStructuredTagSelected = useMemo(() => {
        if (!activeTab || !selectedTag) return false;
        return structuredSecondaryItems.some((item) => item.title === selectedTag);
    }, [activeTab, selectedTag, structuredSecondaryItems]);
    const showTagPill = !!selectedTag && !isStructuredTagSelected;
    const showPathPills = !!(activeTabDef || showTagPill);
    const showToolbarBeforePath = isWebOrApp && showPathPills;
    const contextualPlaceholder = useMemo(() => {
        if (selectedTag) {
            return tr(CARD_PLACEHOLDER[selectedTag] ?? `请描述「${selectedTag}」相关需求...`);
        }
        if (activeTab === 'generate') {
            return tr(CARD_PLACEHOLDER['AI生成应用'] ?? '请描述你的应用需求...');
        }
        if (activeTab === 'prototype') {
            return tr(CARD_PLACEHOLDER['AI生成原型'] ?? '请描述原型需求...');
        }
        if (activeTab) {
            return tr('可直接输入一句话描述需求，也可先选下方能力标签再点探索想法。');
        }
        return tr('可直接输入一句话：大屏看板、企业后台、小程序/电商、PRD、或界面复刻；也可先选下方能力标签。');
    }, [selectedTag, activeTab]);

    const exploreSuggestions = useMemo(() => {
        if (!activeTab) return [];
        if (selectedTag) {
            const all = getPromptSuggestions(selectedTag);
            if (all.length <= 6) return all.slice(0, 6);
            const per = 6;
            const maxStart = all.length - per;
            const start = (exploreBatchIndex * per) % (maxStart + 1);
            return all.slice(start, start + per);
        }
        if (activeTab === 'generate') return buildGenerateHotExploreMix(exploreBatchIndex);
        if (activeTab === 'prototype') return buildPrototypeHotExploreMix(exploreBatchIndex);
        if (activeTab === 'planning') return buildPlanningHotExploreMix(exploreBatchIndex);
        return buildHotSuggestionsForTab(activeTab, exploreBatchIndex);
    }, [activeTab, selectedTag, exploreBatchIndex]);

    const secondarySectionLabel = useMemo(() => {
        if (!activeTab) return '';
        const key = SECONDARY_SECTION_TITLE_KEY[activeTab];
        return key ? tr(key) : tr('你想生成什么');
    }, [activeTab]);

    const secondaryRowAccent = useMemo(
        () => secondaryTabAccent(activeTab ?? 'prototype'),
        [activeTab],
    );

    useLayoutEffect(() => {
        const node = secondaryTabsScrollRef.current;
        if (!node) return;
        const runMeasure = () => {
            node.scrollLeft = 0;
            clampSecondaryTabsScrollPosition();
            updateSecondaryTabsScrollState();
        };
        runMeasure();
        const frame = window.requestAnimationFrame(runMeasure);
        const handleScroll = () => {
            clampSecondaryTabsScrollPosition();
            updateSecondaryTabsScrollState();
        };
        const onPointerInScrollStrip = () => {
            secondaryTabsProgrammaticScrollRef.current = false;
        };
        node.addEventListener('pointerdown', onPointerInScrollStrip, { passive: true });
        const handleResize = () => {
            clampSecondaryTabsScrollPosition();
            updateSecondaryTabsScrollState();
        };
        node.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        const rowEl = secondaryTabsRowRef.current;
        const ro =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(() => {
                      window.requestAnimationFrame(() => {
                          clampSecondaryTabsScrollPosition();
                          updateSecondaryTabsScrollState();
                      });
                  })
                : null;
        if (ro) {
            ro.observe(node);
            if (rowEl) ro.observe(rowEl);
        }
        return () => {
            window.cancelAnimationFrame(frame);
            node.removeEventListener('scroll', handleScroll);
            node.removeEventListener('pointerdown', onPointerInScrollStrip);
            window.removeEventListener('resize', handleResize);
            ro?.disconnect();
        };
    }, [activeTab, structuredSecondaryItems, clampSecondaryTabsScrollPosition, updateSecondaryTabsScrollState]);

    /**
     * sub-cards 高度跟随策略：
     * - 切换 activeTab / selectedTag / 二级列表变化时，先用 useLayoutEffect 在 paint 前同步测量，
     *   避免「新内容 > 旧 max-height」造成的半帧裁剪。
     * - 常驻 ResizeObserver 再兜住窗口 resize / 卡片换行等外部尺寸变化。
     */
    useLayoutEffect(() => {
        const el = subCardsRef.current;
        if (!el) return;
        const h = el.scrollHeight;
        if (h > 0) setSubCardsHeight(h);
    }, [activeTab, structuredSecondaryItems, selectedTag, exploreSuggestions]);

    useLayoutEffect(() => {
        const el = subCardsRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        let rafId: number | null = null;
        const ro = new ResizeObserver(() => {
            if (rafId != null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const h = el.scrollHeight;
                if (h > 0) setSubCardsHeight(h);
            });
        });
        ro.observe(el);
        return () => {
            if (rafId != null) cancelAnimationFrame(rafId);
            ro.disconnect();
        };
    }, []);

    const getReferenceImportConfig = (mode: ReferenceImportMode, type: Exclude<ReferenceImportType, 'image'>) => {
        if (mode === 'generate') {
            if (type === 'web') {
                return {
                    title: '网页链接转应用',
                    description: '粘贴网页链接，按参考内容转为应用',
                    placeholder: '请输入网页链接',
                    template: (link: string) => `请参考这个网页链接生成应用，并提取其中的布局结构、视觉层级、关键模块与交互路径：${link}`,
                };
            }
            return {
                title: 'Figma链接转应用',
                description: '粘贴 Figma 分享链接，按参考内容转为应用',
                placeholder: '请输入 Figma 分享链接',
                template: (link: string) => `请参考这个 Figma 链接生成应用，尽量保留页面结构、组件层级、视觉布局和交互组织：${link}`,
            };
        }
        return REFERENCE_IMPORT_CONFIG[type];
    };

    const applyReferencePrompt = (text: string) => {
        setInputValue((prev) => {
            const trimmedPrev = prev.trim();
            return trimmedPrev ? `${trimmedPrev}\n${text}` : text;
        });
        window.requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    const handleReferenceImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        applyReferencePrompt(
            referenceImportMode === 'generate'
                ? `请参考我上传的图片「${file.name}」生成应用，提取其中的页面结构、组件层级、版式风格和关键模块。`
                : `请参考我上传的图片「${file.name}」转为原型，提取其中的页面结构、组件层级、版式风格和关键信息。`
        );
        event.target.value = '';
    };

    const openReferenceImportDialog = (type: Exclude<ReferenceImportType, 'image'>, mode: ReferenceImportMode = 'prototype') => {
        setReferenceImportType(type);
        setReferenceImportMode(mode);
        setReferenceLink('');
        setReferenceImportOpen(true);
    };

    const handleReferenceLinkImport = () => {
        const link = referenceLink.trim();
        if (!link) return;
        applyReferencePrompt(getReferenceImportConfig(referenceImportMode, referenceImportType).template(link));
        setReferenceImportOpen(false);
        setReferenceLink('');
    };

    const handleHtmlPrototypeEntry = () => {
        window.open(MODAO_WORKSPACE_URL, '_blank', 'noopener,noreferrer');
    };

    const renderReferenceGenerateMenu = (label = '参考转原型', mode: ReferenceImportMode = 'prototype') => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium text-slate-900 transition-colors hover:bg-slate-100"
                >
                    {/* 三个入口图标：图片 / Figma / 链接。缩小间距使其更紧凑 */}
                    <span className="inline-flex items-center gap-[1px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="16" rx="3" />
                            <circle cx="8.5" cy="9" r="1.5" />
                            <path d="m21 15-4.2-4.2a1 1 0 0 0-1.4 0L8 18" />
                        </svg>
                        {/* Figma 图标：重新设计为单色扁平版本，与其他两个图标风格统一 */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 38 57" fill="#8B5CF6" aria-hidden="true">
                            <path d="M9.5 28.5a9.5 9.5 0 1 1 0-19h9.5v19z" />
                            <path d="M28.5 9.5a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0" />
                            <path d="M9.5 28.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19" />
                            <path d="M28.5 9.5v19H19a9.5 9.5 0 1 1 0-19z" />
                            <path d="M28.5 28.5a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M10 13a5 5 0 0 0 7.54.54l2.92-2.92a5 5 0 0 0-7.07-7.07L11.5 5.5" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54L3.54 13.38a5 5 0 0 0 7.07 7.07L12.5 18.5" />
                        </svg>
                    </span>
                    <span className="text-current">
                        {tr(label)}
                    </span>
                </button>
            </DropdownMenuTrigger>
            {/* align=start 让菜单左边与触发按钮最左侧（即三个图标的最左）对齐；sideOffset 贴近一点 */}
            <DropdownMenuContent align="start" sideOffset={6} className="w-[210px] rounded-2xl border-slate-200 bg-white p-1.5 shadow-lg">
                <DropdownMenuItem
                    onClick={() => {
                        setReferenceImportMode(mode);
                        referenceImageInputRef.current?.click();
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                        <rect x="3" y="4" width="18" height="16" rx="3" />
                        <circle cx="8.5" cy="9" r="1.5" />
                        <path d="m21 15-4.2-4.2a1 1 0 0 0-1.4 0L8 18" />
                    </svg>
                    <span>{tr(mode === 'generate' ? '图片转应用' : '图片转原型')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => openReferenceImportDialog('web', mode)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                        <path d="M10 13a5 5 0 0 0 7.54.54l2.92-2.92a5 5 0 0 0-7.07-7.07L11.5 5.5" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54L3.54 13.38a5 5 0 0 0 7.07 7.07L12.5 18.5" />
                    </svg>
                    <span>{tr(mode === 'generate' ? '网页链接转应用' : '网页链接转原型')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => openReferenceImportDialog('figma', mode)}
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-slate-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 38 57" fill="#8B5CF6" aria-hidden="true" className="shrink-0">
                        <path d="M9.5 28.5a9.5 9.5 0 1 1 0-19h9.5v19z" />
                        <path d="M28.5 9.5a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0" />
                        <path d="M9.5 28.5a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19" />
                        <path d="M28.5 9.5v19H19a9.5 9.5 0 1 1 0-19z" />
                        <path d="M28.5 28.5a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0" />
                    </svg>
                    <span>{tr(mode === 'generate' ? 'Figma链接转应用' : 'Figma链接转原型')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // 基于数据分析中「错配高发类型」做发送前轻提示
    // - image_generation 队内错配率 55.3%：生图标签但实际在描述页面/原型/PRD
    // - product_planning 队内错配率 42.6%：规划标签但实际在要高保真页
    const intentMismatch = useMemo(() => {
        const t = inputValue;
        if (!t.trim() || !selectedTag) return null;
        const imageLikeTags = ['视觉物料生图', '生成营销图', 'Logo设计', '海报设计', '主视觉KV'];
        if (imageLikeTags.includes(selectedTag) && /原型|页面|HTML|PRD|后台|Dashboard|dashboard|小程序|网页|登录|管理端/i.test(t)) {
            return 'image-tag-but-ui' as const;
        }
        if (selectedTag === '产品规划' && /页面|原型|HTML|界面|高保真|大屏|小程序/i.test(t)) {
            return 'planning-but-ui' as const;
        }
        if (selectedTag === 'AI生成视频' && /原型|页面|HTML|PRD|后台|管理端/i.test(t)) {
            return 'video-tag-but-ui' as const;
        }
        return null;
    }, [inputValue, selectedTag]);

    const handlePromptSuggestionClick = (suggestion: PromptSuggestionItem) => {
        setInputValue(suggestion.prompt);
        window.requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    const scrollSecondaryTabs = (direction: 'left' | 'right') => {
        const node = secondaryTabsScrollRef.current;
        if (!node) return;
        void node.offsetWidth;
        const maxScroll = Math.max(0, node.scrollWidth - node.clientWidth);
        if (maxScroll <= 1) return;

        const tInset = SECONDARY_TABS_SCROLL_END_INSET_PX;
        /** 与 getSecondaryTabScrollEdges 一致：总可滚较大但剩余落在「箭头等效带」内时，一次贴齐 max 并收箭 */
        if (direction === 'right' && maxScroll > tInset) {
            const remE = maxScroll - node.scrollLeft;
            if (remE > 0 && remE <= tInset + 0.5) {
                node.scrollLeft = maxScroll;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        updateSecondaryTabsScrollStateAfterArrowScroll();
                    });
                });
                return;
            }
        }
        /** 左侧对称：近起点时一次贴 0（与右侧近终点贴 max 一致，仅最后一段像素） */
        if (direction === 'left' && maxScroll > tInset) {
            const remFromStart = node.scrollLeft;
            if (remFromStart > 0 && remFromStart <= tInset + 0.5) {
                node.scrollLeft = 0;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        updateSecondaryTabsScrollStateAfterArrowScroll();
                    });
                });
                return;
            }
        }

        const remainingRight = maxScroll - node.scrollLeft;
        const remainingLeft = node.scrollLeft;
        const remaining = direction === 'right' ? remainingRight : remainingLeft;
        if (remaining <= 0) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    updateSecondaryTabsScrollStateAfterArrowScroll();
                });
            });
            return;
        }

        const move = Math.min(SECONDARY_TABS_SCROLL_STEP_PX, remaining);
        if (move < 1) return;

        const startLeft = Math.max(0, Math.min(maxScroll, node.scrollLeft));
        if (startLeft !== node.scrollLeft) node.scrollLeft = startLeft;
        const endLeft =
            direction === 'right'
                ? Math.max(0, Math.min(maxScroll, startLeft + move))
                : Math.max(0, startLeft - move);
        const dist = Math.abs(endLeft - startLeft);
        if (dist < 0.5) return;

        cancelSecondaryTabsScrollAnimation();

        const durationMs = Math.min(
            SECONDARY_TABS_SCROLL_MAX_MS,
            Math.max(
                SECONDARY_TABS_SCROLL_MIN_MS,
                SECONDARY_TABS_SCROLL_BASE_MS + dist * SECONDARY_TABS_SCROLL_PER_PX_MS,
            ),
        );
        const t0 = performance.now();

        const tick = (now: number) => {
            const el = secondaryTabsScrollRef.current;
            if (!el) {
                cancelSecondaryTabsScrollAnimation();
                return;
            }
            const t = Math.min(1, (now - t0) / durationMs);
            const eased = easeOutCubic(t);
            const m = Math.max(0, el.scrollWidth - el.clientWidth);
            const next = startLeft + (endLeft - startLeft) * eased;
            el.scrollLeft = Math.max(0, Math.min(m, next));
            if (t < 1) {
                secondaryTabsScrollRafRef.current = requestAnimationFrame(tick);
            } else {
                /* 先结束「程序化缓动」态，再钉死 scrollLeft，使 scroll 同步回调时不会仍按等效带 hold 右箭 */
                secondaryTabsProgrammaticScrollRef.current = false;
                /* 贴左为 0 时钉死 0，避免子像素/缓动末帧与收箭时 reflow 产生横向飘移 */
                if (endLeft <= 0.5) {
                    el.scrollLeft = 0;
                } else if (endLeft >= m - 0.5) {
                    el.scrollLeft = m;
                } else {
                    el.scrollLeft = Math.max(0, Math.min(m, endLeft));
                }
                secondaryTabsScrollRafRef.current = null;
                // 等布局取整后更新；贴边收箭由 updateSecondaryTabsScrollState 统一 100ms 延迟
                requestAnimationFrame(() => {
                    updateSecondaryTabsScrollStateAfterArrowScroll();
                    requestAnimationFrame(() => {
                        updateSecondaryTabsScrollStateAfterArrowScroll();
                    });
                });
            }
        };

        secondaryTabsProgrammaticScrollRef.current = true;
        secondaryTabsScrollRafRef.current = requestAnimationFrame(tick);
    };

    const canSendFromHome = inputValue.trim().length > 0;

    return (
        <>
        <div
            className={cn(
                'mx-auto w-full min-w-0',
                alignWithWorkbenchTabWidth ? 'max-w-[1100px]' : 'max-w-[900px]',
            )}
        >
            {/* === Input Box === */}
            <div
                ref={homeInputCardRef}
                className={cn(
                "relative z-40 bg-white rounded-2xl border border-gray-200 shadow-lg shadow-gray-100/50 p-4 min-h-[120px] flex flex-col group focus-within:ring-1 ring-indigo-200 transition-all",
                activeTab ? "mb-4" : "mb-4"
            )}
            >
                <div className="flex w-full flex-1 min-h-[80px]">
                    <div
                        ref={inputRef}
                        role="textbox"
                        aria-multiline="true"
                        contentEditable
                        suppressContentEditableWarning
                        data-placeholder={contextualPlaceholder}
                        data-empty={inputValue.length === 0 && selectedSkills.length === 0 ? 'true' : 'false'}
                        onInput={handleEditorInput}
                        onClick={handleEditorClick}
                        onPaste={handleEditorPaste}
                        onBlur={clearSkillChipSelectionVisual}
                        onMouseUp={updateEditorSkillChipsSelectionHighlight}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (!canSendFromHome) {
                                    setEmptySendToast(tr('请先输入需求后再发送'));
                                    return;
                                }
                                handleSend();
                            }
                        }}
                        className="skill-inline-input flex-1 min-w-[120px] outline-none text-gray-700 text-[15px] bg-transparent leading-loose pt-0.5"
                    />
                </div>

                {intentMismatch && (
                    <div
                        role="status"
                        className="mt-1 mb-1 text-amber-900 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-[11px] leading-relaxed"
                    >
                        {intentMismatch === 'image-tag-but-ui'
                            ? tr('当前挂在「生图」类能力，描述更像页面/原型。若要做界面，可点标签 × 去掉后选择「AI生成原型」或「图片转原型」。')
                            : intentMismatch === 'video-tag-but-ui'
                                ? tr('当前挂在「AI生成视频」，但描述像页面/原型。若要做界面，可点标签 × 去掉后改选「AI生成原型」。')
                                : tr('「产品规划」默认输出路线图/里程碑。若主要想直接出高保真页面，建议选择「AI生成原型」。')}
                    </div>
                )}

                <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <SpeedModeBtn />
                        <SkillPickerBtn
                            ref={skillPickerRef}
                            onPick={(skill) => insertSkillChip(skill)}
                        />
                        <div
                            className={cn(
                                'flex items-center gap-2 flex-wrap',
                                /* 生成应用：一级路径胶囊在左，设计系统「⋯」在右 */
                                isGenerateTab && showToolbarBeforePath && showPathPills && 'flex-row-reverse',
                            )}
                        >
                        {showToolbarBeforePath && <AdvancedConfigurationToolbar showDesignSystemSelector={true} inline={true} />}
                        {showPathPills && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {activeTabDef && (
                                    <div
                                        style={{
                                            backgroundColor: activeTabDef.bg,
                                            color: activeTabDef.color,
                                            borderColor: `${activeTabDef.color}26`,
                                        }}
                                        className="inline-flex items-center rounded-full text-[13px] font-medium border h-8 select-none overflow-hidden"
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-full items-center pl-3 pr-2 transition-colors hover:bg-black/5"
                                                    title={tr('切换一级分类')}
                                                >
                                                    <span>{tr(activeTabDef.label)}</span>
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start" className="w-[200px] rounded-2xl border-slate-200 bg-white p-2 shadow-[0_20px_48px_-24px_rgba(15,23,42,0.35)]">
                                                {ALL_TABS.map((tab) => {
                                                    const isCurrent = tab.id === activeTab;
                                                    return (
                                                    <DropdownMenuItem
                                                        key={tab.id}
                                                        onClick={() => applyMainTabSelection(tab.id)}
                                                        aria-current={isCurrent ? 'true' : undefined}
                                                        className={cn(
                                                            'cursor-pointer rounded-xl px-3 py-2 text-[13px]',
                                                            isCurrent ? 'bg-slate-50 text-slate-900' : 'text-slate-700',
                                                        )}
                                                    >
                                                        <div className="flex w-full min-w-0 items-center gap-2">
                                                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center" style={{ color: tab.color }}>
                                                                <span className="[&_svg]:h-[14px] [&_svg]:w-[14px] [&_span]:text-[14px]">
                                                                    {tab.icon}
                                                                </span>
                                                            </span>
                                                            <span className="min-w-0 flex-1 truncate">{tr(tab.label)}</span>
                                                            {isCurrent && (
                                                                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-indigo-600" aria-hidden>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                        <polyline points="20 6 9 17 4 12" />
                                                                    </svg>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <button
                                            type="button"
                                            onClick={clearActivePath}
                                            className="inline-flex h-full items-center justify-center px-2 transition-colors hover:bg-black/5"
                                            title={tr('退出当前分类')}
                                        >
                                            <div
                                                className="flex items-center justify-center w-4 h-4 rounded-full transition-colors"
                                                style={{ color: activeTabDef.color, opacity: 0.62 }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                )}
                                {activeTabDef && showTagPill && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                )}
                                {showTagPill && (
                                    <div
                                        onClick={clearTag}
                                        className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[13px] font-medium border border-indigo-100 h-8 select-none cursor-pointer hover:bg-indigo-100 transition-colors group/tag max-w-full"
                                    >
                                        <span className="truncate">{tr(selectedTag)}</span>
                                        <div
                                            className="flex items-center justify-center w-4 h-4 rounded-full group-hover/tag:bg-indigo-200 transition-colors text-indigo-400 group-hover/tag:text-indigo-700 shrink-0"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        </div>
                        {isWebOrApp && !showToolbarBeforePath && <AdvancedConfigurationToolbar showDesignSystemSelector={true} inline={true} />}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "rounded-full p-2 transition-all flex items-center justify-center cursor-pointer shadow-sm",
                                canSendFromHome
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            )}
                            onClick={handleSend}
                            disabled={!canSendFromHome}
                            title={!canSendFromHome ? tr('请先输入需求后再发送') : undefined}
                            aria-label={canSendFromHome ? tr('发送') : tr('请先输入需求后再发送')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" x2="12" y1="19" y2="5" /><polyline points="5 12 12 5 19 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <input
                ref={referenceImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleReferenceImageUpload}
            />
            <Dialog open={referenceImportOpen} onOpenChange={setReferenceImportOpen}>
                <DialogContent className="rounded-[24px] border border-slate-200 bg-white p-0 shadow-[0_28px_80px_-32px_rgba(15,23,42,0.35)] sm:max-w-[480px]">
                    <DialogHeader className="border-b border-slate-100 px-6 pb-4 pt-6">
                        <DialogTitle className="text-[17px] font-semibold text-slate-900">
                            {tr(getReferenceImportConfig(referenceImportMode, referenceImportType).title)}
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-[13px] leading-6 text-slate-500">
                            {tr(getReferenceImportConfig(referenceImportMode, referenceImportType).description)}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="px-6 pb-6 pt-5">
                        <Input
                            value={referenceLink}
                            onChange={(event) => setReferenceLink(event.target.value)}
                            placeholder={tr(getReferenceImportConfig(referenceImportMode, referenceImportType).placeholder)}
                            className="h-11 rounded-2xl border-slate-200 text-[13px] focus-visible:ring-indigo-200"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleReferenceLinkImport();
                                }
                            }}
                        />
                        <div className="mt-4 flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setReferenceImportOpen(false);
                                    setReferenceLink('');
                                }}
                                className="rounded-full px-4 text-[13px] text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            >
                                {tr('取消')}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleReferenceLinkImport}
                                className="rounded-full bg-indigo-600 px-5 text-[13px] text-white hover:bg-indigo-700"
                                disabled={!referenceLink.trim()}
                            >
                                {tr('导入')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* === Primary Tabs — 常驻挂载，靠 `.hp-collapse` 做 0↔auto 高度 + 透明度缓动 ===
                px-4 与输入框外层的 p-4 一致，保证按钮的左右边缘与输入框内容区对齐，不外扩 */}
            <div
                className="hp-collapse hp-collapse--tabs relative z-[35] box-border w-full min-w-0 max-w-full px-4"
                data-show={!activeTab}
                aria-hidden={!!activeTab}
                style={{ marginBottom: !activeTab ? 16 : 0 }}
            >
                <div className="hp-collapse-inner">
                    <div className="pointer-events-none absolute -left-[9999px] top-0 invisible flex items-center gap-2.5 whitespace-nowrap sm:gap-3">
                        {MAIN_TABS.map(tab => (
                            <button
                                key={`measure-${tab.id}`}
                                ref={(node) => {
                                    measureTabRefs.current[tab.id] = node;
                                }}
                                type="button"
                                className="tab-btn inline-flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-4"
                            >
                                <div className="flex h-4 w-4 shrink-0 items-center justify-center text-current [&_svg]:h-[15px] [&_svg]:w-[15px] [&_span]:text-[15px]" style={{ color: tab.color }}>
                                    {tab.icon}
                                </div>
                                <span className="whitespace-nowrap text-[14px] font-semibold text-slate-700">{tr(tab.label)}</span>
                            </button>
                        ))}
                        <button
                            ref={measureMoreButtonRef}
                            type="button"
                            className="tab-btn inline-flex h-11 items-center rounded-full border border-gray-200 bg-white px-4"
                        >
                            <span className="text-[14px] font-semibold text-slate-700">{tr('更多')}</span>
                        </button>
                    </div>

                    <div
                        ref={tabsViewportRef}
                        className="relative z-20 flex w-full min-w-0 max-w-full items-center justify-center gap-2.5 overflow-visible whitespace-nowrap sm:gap-3"
                    >
                            {visibleMainTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => applyMainTabSelection(tab.id)}
                                    className="tab-btn group relative z-0 inline-flex h-11 shrink-0 origin-center transform-gpu items-center gap-2 overflow-visible rounded-full border bg-white px-4 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.35,0.64,1)] motion-reduce:transition-none hover:z-30 hover:scale-[1.05] hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.22)] motion-reduce:hover:scale-100 active:scale-[0.99] active:duration-150"
                                    style={{
                                        borderColor: '#E2E8F0',
                                        backgroundColor: '#FFFFFF',
                                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.07)',
                                    }}
                                >
                                    <div
                                        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                                        style={{
                                            background: `linear-gradient(135deg, ${tab.color}16 0%, ${tab.color}08 42%, transparent 72%)`,
                                        }}
                                    />
                                    <div
                                        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                        style={{ boxShadow: `inset 0 0 0 1px ${tab.color}55` }}
                                    />
                                    <div
                                        className="icon-container relative z-10 flex h-4 w-4 items-center justify-center shrink-0 [&_svg]:h-[15px] [&_svg]:w-[15px] [&_span]:text-[15px]"
                                        style={{ color: tab.color, opacity: 0.92 }}
                                    >
                                        {tab.icon}
                                    </div>
                                    <span className="tab-label relative z-10 whitespace-nowrap text-left text-[14px] leading-none font-semibold text-slate-700 transition-colors group-hover:text-slate-900">
                                        {tr(tab.label)}
                                    </span>
                                </button>
                            ))}

                            <div className="relative shrink-0" ref={moreTabsRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowMoreTabs(prev => !prev)}
                                    className="tab-btn group relative z-0 inline-flex h-11 items-center overflow-visible rounded-full border border-gray-200 bg-white px-4 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.35,0.64,1)] motion-reduce:transition-none hover:z-30 hover:scale-[1.05] hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.22)] motion-reduce:hover:scale-100 active:scale-[0.99] active:duration-150"
                                    style={{
                                        boxShadow: showMoreTabs
                                            ? '0 10px 20px -16px rgba(79, 70, 229, 0.5)'
                                            : '0 1px 2px rgba(15, 23, 42, 0.04)',
                                        borderColor: showMoreTabs ? '#C7D2FE' : '#E5E7EB',
                                        backgroundColor: showMoreTabs ? '#F8FAFF' : '#FFFFFF',
                                    }}
                                >
                                    <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-indigo-50/80 via-sky-50/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <span className="relative z-10 text-[14px] font-semibold text-slate-700 transition-colors group-hover:text-slate-900">
                                        {tr('更多')}
                                    </span>
                                </button>

                            </div>
                    </div>
                </div>
            </div>

            {/* === Sub-cards：与白色输入卡同列全宽，不再额外水平 px，避免比输入卡窄一截；max-height 连续过渡 === */}
            <div
                className="relative z-0 box-border w-full min-w-0 max-w-full overflow-hidden will-change-[max-height,margin]"
                style={{
                    maxHeight: subCardsHeight > 0 ? subCardsHeight + 16 : 'none',
                    marginBottom: activeTab ? 6 : 24,
                    transition:
                        'max-height 420ms cubic-bezier(0.32, 0.72, 0, 1), margin-bottom 420ms cubic-bezier(0.32, 0.72, 0, 1)',
                }}
            >
                <div ref={subCardsRef} className="pb-1">
                    <div key={activeTab ?? '__primary'} className="hp-fade-up">
                    {!activeTab && (
                        <>
                            <div className="mb-2 flex items-center justify-between gap-4">
                                <span className="text-[11px] font-normal tracking-wide text-slate-400/90">
                                    {tr('热门生成')}
                                </span>
                                <div className="flex items-center gap-3">
                                    {renderReferenceGenerateMenu()}
                                    <div className="h-4 w-px bg-slate-200" />
                                    <button
                                        type="button"
                                        onClick={handleHtmlPrototypeEntry}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium text-slate-900 transition-colors hover:bg-slate-100"
                                    >
                                        <span className="shrink-0 text-current/85 [&_svg]:block [&_svg]:h-[15px] [&_svg]:w-[15px]">
                                            {PROTOTYPE_QUICK_ACTIONS[0].icon}
                                        </span>
                                        <span>{tr('HTML转原型')}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5 min-[520px]:grid-cols-2 min-[900px]:grid-cols-3 min-[900px]:gap-3">
                                {RECOMMEND_CARDS.map((card) => (
                                    <SubCard key={card.title} data={card} tone="shelf" onClick={() => handleCardClick(card)} />
                                ))}
                            </div>
                        </>
                    )}
                    {activeTab && (
                        <div className="mb-1.5 flex items-center justify-between gap-4">
                            <span className="text-[12px] font-normal tracking-tight text-slate-400">
                                {secondarySectionLabel}
                            </span>
                            {isPrototypeTab ? (
                                <div className="flex items-center gap-3">
                                    {renderReferenceGenerateMenu()}
                                    <div className="h-4 w-px bg-slate-200" />
                                    {PROTOTYPE_QUICK_ACTIONS.map((action) => {
                                        // HTML 转原型是独立入口：新标签页打开墨刀工作台，不改动输入框状态
                                        const isHtmlEntry = action.title === 'HTML转原型';
                                        const isSelected = !isHtmlEntry && selectedTag === action.title;
                                        return (
                                            <button
                                                key={action.title}
                                                type="button"
                                                onClick={() => {
                                                    if (isHtmlEntry) {
                                                        handleHtmlPrototypeEntry();
                                                    } else {
                                                        handleStructuredTagSelect(action.title);
                                                    }
                                                }}
                                                className={cn(
                                                    'inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium transition-colors',
                                                    isHtmlEntry
                                                        ? 'text-slate-900 hover:bg-slate-100'
                                                        : isSelected
                                                            ? 'text-sky-700'
                                                            : 'text-slate-500 hover:text-slate-900',
                                                )}
                                            >
                                                <span className="shrink-0 text-current/85 [&_svg]:block [&_svg]:h-[15px] [&_svg]:w-[15px]">
                                                    {action.icon}
                                                </span>
                                                <span>{tr(action.title)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : isGenerateTab ? (
                                <div className="flex items-center gap-3">
                                    {renderReferenceGenerateMenu('参考转应用', 'generate')}
                                </div>
                            ) : (
                                <div className="h-8" />
                            )}
                        </div>
                    )}
                    {activeTab && structuredSecondaryItems.length > 0 && (
                        <div
                            ref={secondaryTabsRowRef}
                            className="relative w-full min-w-0 max-w-full"
                        >
                            {/** 滚动区单独占满内容宽，与上方输入同列对齐；箭头等宽浮层不占 flex 槽，收箭不改 scroll 宽度、避免整行横移 */}
                            <div className="relative min-w-0 w-full">
                                <div
                                    ref={secondaryTabsScrollRef}
                                    className="min-w-0 w-full touch-pan-x overflow-x-auto overscroll-x-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                                >
                                    <div className="inline-flex items-center gap-2.5 whitespace-nowrap sm:gap-3">
                                        {structuredSecondaryItems.map((item) => {
                                            const isSelected = selectedTag === item.title;
                                            return (
                                                <button
                                                    key={item.title}
                                                    type="button"
                                                    onClick={() => handleStructuredTagSelect(item.title)}
                                                    className={cn(
                                                        'inline-flex h-11 min-h-[2.75rem] items-center gap-2 rounded-xl border px-4 text-[14px] font-semibold whitespace-nowrap transition-[color,box-shadow,background-color,border-color,transform] active:scale-[0.99]',
                                                        isSelected ? secondaryRowAccent.selected : secondaryRowAccent.base,
                                                    )}
                                                >
                                                    <span className="shrink-0 text-current opacity-90 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:stroke-[2.05]">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                                            {item.iconPath}
                                                        </svg>
                                                    </span>
                                                    {tr(item.title)}
                                                    {item.title === '素材转原型' && (
                                                        <span
                                                            className="shrink-0 !text-slate-400 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:stroke-[2]"
                                                            aria-hidden
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                                <path d="M15 3h6v6" />
                                                                <path d="M10 14 21 3" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/** 宽与圆钮 w-8 一致 + 一缝（w-9），刚好盖住箭下区域、少吃 tab 文案；在滚动层之上、箭头 (z-2) 之下 */}
                                {secondaryTabsCanScrollLeft && (
                                    <div
                                        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-9 bg-[linear-gradient(90deg,theme(colors.slate.50)_0%,theme(colors.slate.50/96)_18%,theme(colors.slate.50/55)_52%,theme(colors.slate.50/08)_82%,transparent_100%)]"
                                        aria-hidden
                                    />
                                )}
                                {secondaryTabsCanScrollRight && (
                                    <div
                                        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-9 bg-[linear-gradient(270deg,theme(colors.slate.50)_0%,theme(colors.slate.50/96)_18%,theme(colors.slate.50/55)_52%,theme(colors.slate.50/08)_82%,transparent_100%)]"
                                        aria-hidden
                                    />
                                )}
                            </div>
                            {secondaryTabsCanScrollLeft && (
                                <button
                                    type="button"
                                    onClick={() => scrollSecondaryTabs('left')}
                                    aria-label={tr('向左滑动')}
                                    className="absolute left-0 top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50 text-slate-500 shadow-sm transition-[color,opacity,box-shadow,transform] duration-200 ease-out will-change-transform hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>
                            )}
                            {secondaryTabsCanScrollRight && (
                                <button
                                    type="button"
                                    onClick={() => scrollSecondaryTabs('right')}
                                    aria-label={tr('向右滑动')}
                                    className="absolute right-0 top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/90 bg-slate-50 text-slate-500 shadow-sm transition-[color,opacity,box-shadow,transform] duration-200 ease-out will-change-transform hover:border-slate-300 hover:bg-white hover:text-slate-900 hover:shadow-sm active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    )}
                    </div>
                </div>
            </div>

            {/* === 探索想法 === 常驻挂载，靠 `.hp-collapse` 做 0↔auto 缓动；内部 key 切换让卡片 fade-up 入场 */}
            <div
                className="hp-collapse box-border w-full min-w-0 max-w-full"
                data-show={!!activeTab && exploreSuggestions.length > 0}
                aria-hidden={!(!!activeTab && exploreSuggestions.length > 0)}
            >
                <div className="hp-collapse-inner">
                <div className="mb-3.5 mt-0 border-t border-slate-100/90 pt-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[12px] font-normal text-slate-400">
                            {tr('探索想法')}
                        </span>
                        <button
                            type="button"
                            onClick={() => setExploreBatchIndex(n => n + 1)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M8 16H3v5" />
                            </svg>
                            {tr('换一批')}
                        </button>
                    </div>
                    <div
                        key={`${activeTab ?? '_'}::${selectedTag ?? '_'}::b${exploreBatchIndex}`}
                        className="hp-fade-up grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2 xl:grid-cols-3"
                    >
                        {exploreSuggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                type="button"
                                onClick={() => handlePromptSuggestionClick(suggestion)}
                                className="group relative flex h-full min-h-0 w-full text-left font-normal overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 px-3.5 py-3 sm:px-4 sm:py-3.5 shadow-sm ring-1 ring-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200/90 hover:shadow-[0_18px_40px_-28px_rgba(79,70,229,0.28)] hover:ring-indigo-100/80"
                            >
                                <div className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-indigo-400 to-violet-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                                <div className="flex w-full min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
                                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                                        <div
                                            className={cn(
                                                'text-[14px] font-medium leading-snug text-slate-950 antialiased transition-colors group-hover:text-black',
                                                (activeTab === 'prototype' || activeTab === 'planning') && !selectedTag
                                                    ? 'line-clamp-1'
                                                    : 'line-clamp-2',
                                            )}
                                        >
                                            {suggestion.title}
                                        </div>
                                        {selectedTag ? (
                                            <p className="mt-1.5 line-clamp-2 text-xs font-normal leading-relaxed text-slate-400/80 transition-colors group-hover:text-slate-500/85">
                                                {suggestion.subtitle}
                                            </p>
                                        ) : (
                                            suggestion.sourceTag && (
                                                <span className="mt-1.5 line-clamp-1 w-fit max-w-full min-w-0 text-[11px] font-normal leading-tight tracking-tight text-slate-500 [word-break:keep-all]">
                                                    {tr(suggestion.sourceTag)}
                                                </span>
                                            )
                                        )}
                                    </div>
                                    <span
                                        className="mt-0.5 flex shrink-0 self-start p-0.5 text-slate-400 transition-colors duration-200 group-hover:text-indigo-500"
                                        aria-hidden
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M7 17 17 7" />
                                            <path d="M7 7h10v10" />
                                        </svg>
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                </div>
            </div>
        </div>
        {emptySendToast && typeof document !== 'undefined' && createPortal(
            <div className="pointer-events-none fixed left-1/2 top-5 z-[240] -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2 text-[12px] font-medium text-white shadow-[0_16px_40px_-16px_rgba(15,23,42,0.55)]">
                {emptySendToast}
            </div>,
            document.body,
        )}
        {showMoreTabs && moreMenuTabs.length > 0 && moreTabsMenuPos && typeof document !== 'undefined' && createPortal(
            <div
                ref={moreTabsMenuRef}
                className="hp-fade fixed z-[220] w-[200px] rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_48px_-24px_rgba(15,23,42,0.35)]"
                style={{ top: moreTabsMenuPos.top, left: moreTabsMenuPos.left }}
            >
                {moreMenuTabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => applyMainTabSelection(tab.id)}
                        className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-slate-50"
                    >
                        <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                            style={{
                                color: tab.color,
                                backgroundColor: tab.bg,
                                borderColor: `${tab.color}22`,
                            }}
                        >
                            <div className="[&_svg]:h-[15px] [&_svg]:w-[15px] [&_span]:text-[15px]">
                                {tab.icon}
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-slate-700 transition-colors group-hover:text-slate-900">
                            {tr(tab.label)}
                        </span>
                    </button>
                ))}
            </div>,
            document.body,
        )}
        </>
    );
}
