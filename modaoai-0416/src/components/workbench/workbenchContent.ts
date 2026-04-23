import {
    AppWindow,
    BarChart3,
    BookOpen,
    Building2,
    CalendarRange,
    Component,
    FileBarChart,
    FileCode2,
    FileText,
    FileUp,
    GitBranch,
    Globe2,
    Kanban,
    LayoutGrid,
    LayoutTemplate,
    LineChart,
    Link2,
    MessageCircle,
    MessageSquare,
    Monitor,
    Network,
    Package,
    Palette,
    Pencil,
    Pen,
    Plus,
    Presentation,
    Smartphone,
    Sparkles,
    SplitSquareVertical,
    Target,
    Upload,
    Users,
    Wand2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type WorkbenchProductId = 'modao-ai' | 'prototype' | 'whiteboard' | 'design' | 'ppt';

export type WbInputMode = 'prototype' | 'whiteboard' | 'design' | 'ppt' | 'none';
export type WbLayout = 'cards-first' | 'hero-first';

export type WbCardVariant = 'fill' | 'ring';

export type WbProduct = {
    id: WorkbenchProductId;
    name: string;
    tagline: string;
    cardIdle: string;
    cardActive: string;
    cardVariant: WbCardVariant;
    /** 小角标 */
    cornerBadge: 'ai' | 'new' | null;
    /**
     * 未选：参考图 — 主色底实心方块 + 白色线标；
     * 选中：白底块 + 主色线标（与截图 icon 区一致，色值为 hex 抄入）。
     */
    iconChipIdle: string;
    iconChipActive: string;
    iconGlyphActive: string;
    /** 仅 `cornerBadge === 'ai'` 时：未选卡上「AI」小标（浅底+描边+主色字） */
    aiCornerIdleClass?: string;
    icon: LucideIcon;
    /** 主区顺序（已统一为标题区在产品卡之上，保留字段供类型扩展） */
    layout: WbLayout;
    hero: null | { title: string; subtitle: string };
    inputLabel: string;
    inputPlaceholder: string;
    inputMode: WbInputMode;
    theme: {
        primaryBtn: string;
        inputAccent: string;
        /** 发送钮：蓝/粉/紫/橙红 */
        send: 'blue' | 'pink' | 'violet' | 'orange' | 'red';
    };
    quickStart: {
        id: string;
        label: string;
        primary?: boolean;
        /** 与首页一级 Tab 胶囊：左侧 icon 强调色 */
        color: string;
        Icon: LucideIcon;
        /**
         * 原型 / 白板 / 设计 / AIPPT 等 Tab：点击后将对应提示词写入输入框；与 `tr`/dict 中文 key 一致。
         */
        fillPromptKey?: string;
    }[];
    templateFilters: string[];
    /** 精选用 pill（图3）或 线（线+字色） */
    filterStyle: 'pill' | 'line';
    /** 设计态下精选区是否展示带标题的模板名（图4） */
    templateGridPreset?: { title: string; tone: string }[];
};

export const WORKBENCH_MORE_CARD = {
    name: '更多',
    tagline: '企业能力 · 开放合作',
    cardVariant: 'fill' as WbCardVariant,
    /** 主题色 #14D3E7：极浅底，无边框（与其它卡一致仅靠底色区分） */
    cardIdle: 'border-0 bg-[#E6FAFD] text-slate-800',
    cardActive: 'bg-gradient-to-br from-[#14D3E7] to-[#0DB8D4] text-white',
    /** 小方：实色 + 白线标；展开为白方+主色线标（无阴影） */
    iconChipIdle: 'bg-[#14D3E7]',
    iconChipActive: 'bg-white',
    iconGlyphActive: 'text-[#14D3E7]',
    icon: LayoutGrid,
} as const;

export type WbMoreMenuItem = { title: string; subtitle: string; iconTone: string; Icon: LucideIcon };

/** 与参考图一致：三大组，组间用细分隔线；每项 icon 为彩色小方 + 主副文案两行。 */
export const WORKBENCH_MORE_MENU_GROUPS: WbMoreMenuItem[][] = [
    [
        { title: '新建流程图', subtitle: '步骤有序，流向一目了然', iconTone: 'bg-amber-500', Icon: GitBranch },
        {
            title: '新建思维导图',
            subtitle: '逻辑梳理，创意跃然纸上',
            iconTone: 'bg-emerald-500',
            Icon: Network,
        },
        { title: '新建协作文件', subtitle: '团队协同，管理各项交付', iconTone: 'bg-amber-400', Icon: Target },
    ],
    [
        { title: 'HTML转墨刀原型', subtitle: '快速导入，轻松再编辑', iconTone: 'bg-sky-500', Icon: Globe2 },
        { title: '导入Axure', subtitle: '在线分享，二次编辑', iconTone: 'bg-violet-500', Icon: FileCode2 },
        { title: '导入墨刀原型源文件', subtitle: '导入墨刀.mdrp源文件', iconTone: 'bg-blue-500', Icon: Monitor },
    ],
    [{ title: '新建旧版文件', subtitle: '原型 流程图', iconTone: 'bg-slate-400', Icon: Plus }],
];

export const WORKBENCH_PRODUCTS: WbProduct[] = [
    {
        id: 'modao-ai',
        name: '墨刀AI',
        tagline: '产研一站智能体',
        cardVariant: 'fill',
        cardIdle: 'border-0 bg-[#F2F2FF] text-slate-800',
        cardActive: 'bg-gradient-to-br from-[#7979FF] to-[#5E5EEF] text-white',
        iconChipIdle: 'bg-[#7979FF]',
        iconChipActive: 'bg-white',
        iconGlyphActive: 'text-[#7979FF]',
        aiCornerIdleClass: 'border border-[#C8C8FF] bg-white/95 text-[#5E5EE6]',
        cornerBadge: 'ai',
        icon: Wand2,
        layout: 'cards-first',
        hero: null,
        inputLabel: '墨刀AI',
        inputPlaceholder: '',
        inputMode: 'none',
        theme: {
            primaryBtn: 'bg-[#7979FF] hover:bg-[#6565E8] text-white',
            inputAccent: 'text-[#5E5EE6]',
            send: 'blue',
        },
        quickStart: [],
        templateFilters: [],
        filterStyle: 'pill',
    },
    {
        id: 'prototype',
        name: '墨刀原型',
        tagline: '原型 交互 线框',
        cardVariant: 'fill',
        cardIdle: 'border-0 bg-[#E8F5FF] text-slate-800',
        cardActive: 'bg-gradient-to-br from-[#43AAFF] to-[#2B97F0] text-white',
        iconChipIdle: 'bg-[#43AAFF]',
        iconChipActive: 'bg-white',
        iconGlyphActive: 'text-[#43AAFF]',
        aiCornerIdleClass: 'border border-[#A8D4FF] bg-white/95 text-[#1E8FE6]',
        cornerBadge: 'ai',
        icon: LayoutTemplate,
        layout: 'cards-first',
        hero: {
            title: 'AI聚力 想法即刻成型',
            subtitle: '上传截图或输入需求，一键生成完整交互原型',
        },
        inputLabel: '墨刀AI 原型',
        inputPlaceholder: '请描述您想要的界面，或上传附件作为参考',
        inputMode: 'prototype',
        theme: {
            primaryBtn: 'bg-[#43AAFF] hover:bg-[#2B97F0] text-white',
            inputAccent: 'text-[#1E8FE6]',
            send: 'blue',
        },
        quickStart: [
            { id: 'a0', label: '新建空白原型', primary: true, color: '#43AAFF', Icon: Plus },
            { id: 'a0b', label: 'HTML转原型', color: '#0EA5E9', Icon: FileCode2 },
            { id: 'a1', label: '导入Axure', color: '#8B5CF6', Icon: FileUp },
            { id: 'a2', label: '常用图表', color: '#14B8A6', Icon: BarChart3 },
            {
                id: 'a3',
                label: 'B端管理后台',
                color: '#6366F1',
                Icon: Building2,
                fillPromptKey:
                    '请生成一个B端管理后台中保真原型，包含左侧可折叠导航、顶栏、用户/角色与权限相关列表和详情/表单，注意空态与面包屑。',
            },
            {
                id: 'a4',
                label: 'APP通用页面',
                color: '#0EA5E9',
                Icon: Smartphone,
                fillPromptKey:
                    '请生成一套移动端APP通用页面线框：底部Tab（首页/列表/我的等）、典型列表与详情、常见弹窗，竖屏约375宽。',
            },
            {
                id: 'a5',
                label: '小程序原型',
                color: '#22C55E',
                Icon: AppWindow,
                fillPromptKey:
                    '请生成微信小程序中保真原型，含首页、搜索/列表、个人中心，符合微信规范与 750 设计宽度假设。',
            },
            {
                id: 'a6',
                label: '企业官网',
                color: '#F59E0B',
                Icon: Globe2,
                fillPromptKey: '请生成企业官网多页线框：首页主视觉与CTA、产品/方案、关于与联系，偏简洁商务风。',
            },
            {
                id: 'a7',
                label: 'AI对话页面',
                color: '#A855F7',
                Icon: MessageCircle,
                fillPromptKey: '请生成AI对话应用界面线框，含会话列表、聊天主界面、输入区与历史/设置入口。',
            },
            {
                id: 'a8',
                label: '可视化大屏',
                color: '#EF4444',
                Icon: LayoutGrid,
                fillPromptKey: '请生成数据可视化运营大屏中保真稿，深色主题，含顶部KPI、趋势区、明细表或地图占位。',
            },
            {
                id: 'a9',
                label: 'HMI通用模板',
                color: '#64748B',
                Icon: Component,
                fillPromptKey: '请生成车载或工控HMI通用页面线框，含车速/状态区、功能入口与告警条，大字号、高对比。',
            },
        ],
        templateFilters: [
            '推荐',
            '大厂资源',
            '管理后台',
            'App',
            '小程序',
            '官网',
            'AI',
            '可视化大屏',
            'HMI',
        ],
        filterStyle: 'pill',
    },
    {
        id: 'whiteboard',
        name: '墨刀白板',
        tagline: '需求 项目 协作',
        cardVariant: 'fill',
        cardIdle: 'border-0 bg-[#FFF2FC] text-slate-800',
        cardActive: 'bg-gradient-to-br from-[#FF76E8] to-[#E855D4] text-white',
        iconChipIdle: 'bg-[#FF76E8]',
        iconChipActive: 'bg-white',
        iconGlyphActive: 'text-[#FF76E8]',
        aiCornerIdleClass: 'border border-[#FFC0F0] bg-white/95 text-[#E64DC8]',
        cornerBadge: 'ai',
        icon: Pencil,
        layout: 'hero-first',
        hero: {
            title: 'AI发散 激发无限灵感',
            subtitle: '✨ 输入核心主题，秒速生成思维导图与业务流程',
        },
        inputLabel: '墨刀AI 白板',
        inputPlaceholder: '请输入内容…',
        inputMode: 'whiteboard',
        theme: {
            primaryBtn: 'bg-[#FF76E8] hover:bg-[#E85FDB] text-white',
            inputAccent: 'text-[#E64DC8]',
            send: 'pink',
        },
        quickStart: [
            { id: 'w0', label: '新建空白白板', primary: true, color: '#FF76E8', Icon: Plus },
            { id: 'w1', label: '新建思维导图', color: '#10B981', Icon: Network },
            { id: 'w2', label: '新建流程图', color: '#F59E0B', Icon: GitBranch },
            { id: 'w3', label: 'APP原型模板', color: '#3B82F6', Icon: LayoutTemplate },
            {
                id: 'w4',
                label: '敏捷看板',
                color: '#8B5CF6',
                Icon: Kanban,
                fillPromptKey:
                    '请根据我的主题生成敏捷看板白板：含待办/进行中/完成等列，可带泳道或标签，并预留迭代与站会记录区。',
            },
            {
                id: 'w5',
                label: '团队脑暴',
                color: '#F472B6',
                Icon: Users,
                fillPromptKey:
                    '请围绕中心议题组织团队脑暴白板：中心主题、多轮分支联想、便签区与简单优先级/投票区。',
            },
            {
                id: 'w6',
                label: '产品需求文档',
                color: '#06B6D4',
                Icon: FileText,
                fillPromptKey:
                    '请生成产品需求文档（PRD）大纲式白板：项目背景、目标用户、用户故事/功能表、非功能、验收与发布节奏，用层级或思维导图结构呈现。',
            },
            {
                id: 'w7',
                label: '泳道流程图',
                color: '#84CC16',
                Icon: SplitSquareVertical,
                fillPromptKey:
                    '请生成泳道流程图：按角色或系统区分泳道，标出主流程步骤、判断节点与系统边界。',
            },
            {
                id: 'w8',
                label: '甘特图',
                color: '#F97316',
                Icon: CalendarRange,
                fillPromptKey: '请根据项目任务生成甘特式时间线白板：任务名称、起止时间、依赖关系与里程碑，可用横向时间轴排布。',
            },
        ],
        templateFilters: [
            '全部',
            '绘图&创作',
            '调研分析',
            '灵感/笔记',
            '项目管理',
            '头脑风暴',
            '策略&分析',
            '会议&工作坊',
            '企业管理',
        ],
        filterStyle: 'pill',
    },
    {
        id: 'design',
        name: '墨刀设计',
        tagline: '界面 视觉 UI',
        cardVariant: 'fill',
        cardIdle: 'border-0 bg-[#F4EEFF] text-slate-800',
        cardActive: 'bg-gradient-to-br from-[#9C67FF] to-[#8048E5] text-white',
        iconChipIdle: 'bg-[#9C67FF]',
        iconChipActive: 'bg-white',
        iconGlyphActive: 'text-[#9C67FF]',
        cornerBadge: 'new',
        icon: Pen,
        layout: 'cards-first',
        hero: {
            title: 'AI灵感 设计所见即所得',
            subtitle: '描述风格、组件与页面结构，快速生成可编辑高保真设计稿',
        },
        inputLabel: '墨刀AI 设计',
        inputPlaceholder: '描述界面风格、组件与页面结构…',
        inputMode: 'design',
        theme: {
            primaryBtn: 'bg-[#9C67FF] hover:bg-[#8752E8] text-white',
            inputAccent: 'text-[#8048E5]',
            send: 'violet',
        },
        quickStart: [
            { id: 'd0', label: '新建空白设计', primary: true, color: '#9C67FF', Icon: Plus },
            { id: 'd1', label: '导入设计稿', color: '#8B5CF6', Icon: Upload },
            {
                id: 'd2',
                label: '微信小程序组件库',
                color: '#22C55E',
                Icon: MessageSquare,
                fillPromptKey:
                    '请基于 WeUI/微信设计规范输出小程序高保真设计：含首页、列表/搜索、表单与个人中心，说明组件选用与 750 宽栅格习惯。',
            },
            {
                id: 'd3',
                label: 'Element UI 组件库',
                color: '#3B82F6',
                Icon: Component,
                fillPromptKey:
                    '请基于 Element Plus 输出中后台高保真界面：顶栏+侧栏布局、典型表格/筛选、表单与弹窗，企业蓝白风格，附关键页面结构说明。',
            },
            {
                id: 'd4',
                label: 'Ant Design 组件库',
                color: '#1677FF',
                Icon: Package,
                fillPromptKey:
                    '请基于 Ant Design 输出中后台高保真界面：ProLayout、表格/表单/抽屉等组合，数据展示与操作反馈完整，可注明 Design Token 倾向。',
            },
            {
                id: 'd5',
                label: 'AI 聊天APP套件',
                color: '#A78BFA',
                Icon: MessageCircle,
                fillPromptKey:
                    '请输出 AI 聊天类 App 高保真设计：对话列表、单聊/多模态输入区、历史与设置，偏现代轻量，含空态与加载态。',
            },
            {
                id: 'd6',
                label: 'HarmonyOS 组件库',
                color: '#0EA5E9',
                Icon: Palette,
                fillPromptKey:
                    '请基于 HarmonyOS 设计规范输出端侧高保真稿：信息架构、列表/卡片、设备能力入口，注意字体层级与系统色使用。',
            },
        ],
        templateFilters: [
            '全部',
            '界面合集',
            'UI组件集',
            '图标',
            '设计系统',
            '移动设计',
            '网页设计',
            '插画',
            '线框图',
        ],
        filterStyle: 'line',
        templateGridPreset: [
            { title: 'WeUI 微信组件', tone: 'from-emerald-200/70 to-lime-100' },
            { title: 'Arco Design 字节', tone: 'from-sky-200/60 to-cyan-100' },
            { title: 'WeUI Dark', tone: 'from-slate-600/90 to-slate-800' },
            { title: 'HarmonyOS 穿戴', tone: 'from-blue-200/50 to-sky-100' },
            { title: 'HarmonyOS 多终端', tone: 'from-indigo-200/50 to-violet-100' },
        ],
    },
    {
        id: 'ppt',
        name: '墨刀AIPPT',
        tagline: '方案 总结 宣传',
        cardVariant: 'fill',
        cardIdle: 'border-0 bg-[#FFF3F1] text-slate-800',
        cardActive: 'bg-gradient-to-br from-[#FF7C6B] to-[#FF5A4A] text-white',
        iconChipIdle: 'bg-[#FF7C6B]',
        iconChipActive: 'bg-white',
        iconGlyphActive: 'text-[#FF7C6B]',
        aiCornerIdleClass: 'border border-[#FFC4BC] bg-white/95 text-[#E64A3A]',
        cornerBadge: 'ai',
        icon: Presentation,
        layout: 'hero-first',
        hero: {
            title: 'AI凝练 汇报瞬间出彩',
            subtitle: '导入大纲或长文档，一键生成精美 PPT 排版与配图',
        },
        inputLabel: '墨刀AI AIPPT',
        inputPlaceholder: '输入演讲主题',
        inputMode: 'ppt',
        theme: {
            primaryBtn: 'bg-[#FF7C6B] hover:bg-[#FF6A56] text-white',
            inputAccent: 'text-[#E64A3A]',
            send: 'red',
        },
        quickStart: [
            { id: 'p0', label: '新建空白PPT', primary: true, color: '#FF7C6B', Icon: Plus },
            { id: 'p1', label: '导入生成PPT', color: '#FB923C', Icon: FileUp },
            { id: 'p2', label: '链接生成PPT', color: '#3B82F6', Icon: Link2 },
            { id: 'p3', label: 'AI美化PPT', color: '#EC4899', Icon: Sparkles },
            {
                id: 'p4',
                label: '产品经理年终总结',
                color: '#8B5CF6',
                Icon: FileBarChart,
                fillPromptKey:
                    '请生成「产品经理年终总结」PPT 的章节与逐页要点：年度目标、关键项目与数据成果、问题复盘、协作与成长、明年规划；注明每页建议图表或配图。',
            },
            {
                id: 'p5',
                label: '总结汇报',
                color: '#F59E0B',
                Icon: Presentation,
                fillPromptKey:
                    '请生成通用「总结汇报」类 PPT 结构：背景与目标、阶段进展、核心数据、风险与问题、下阶段计划与资源需求，适合对内对外汇报。',
            },
            {
                id: 'p6',
                label: 'AI智能研究报告',
                color: '#10B981',
                Icon: BookOpen,
                fillPromptKey:
                    '请按「AI 智能研究报告」体例输出 PPT 大纲：摘要、研究背景、方法/实验、数据与对比、结论与局限、未来工作；附图表/公式占位建议。',
            },
            {
                id: 'p7',
                label: '前景分析报告',
                color: '#EF4444',
                Icon: LineChart,
                fillPromptKey:
                    '请输出「前景分析」类 PPT：行业与市场现状、驱动因素、趋势与机会、主要风险、竞争格局、结论与策略建议，咨询报告版式。',
            },
        ],
        templateFilters: [
            '全部',
            'IT互联网',
            '总结汇报',
            '教学课件',
            '商业计划书',
            '学术答辩',
            '研究报告',
            '营销',
            '企业宣传',
        ],
        filterStyle: 'pill',
    },
];

export function getWorkbenchProduct(id: WorkbenchProductId): WbProduct {
    return (
        WORKBENCH_PRODUCTS.find((p) => p.id === id) ??
        WORKBENCH_PRODUCTS.find((p) => p.id === 'prototype')!
    );
}
