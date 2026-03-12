import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSidebarContext } from '@/context/SidebarContext';

// 墨刀AI Logo 方块
const LogoIcon = () => (
    <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
        </svg>
    </div>
);

// 展开/收起侧边栏的图标按钮（带 tooltip）
const ToggleIcon = ({ onClick, title, className }: { onClick: (e: React.MouseEvent) => void; title: string; className?: string }) => (
    <div className="relative group/toggle shrink-0">
        <button
            onClick={onClick}
            className={cn("text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded", className)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                <line x1="9" x2="9" y1="3" y2="21"></line>
                <path d="m15 9-3 3 3 3"></path>
            </svg>
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/toggle:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {title}
        </div>
    </div>
);

const SidebarNavTab = ({ active, onClick, icon, label, collapsed }: any) => (
    <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            active
                ? "text-gray-900 bg-gray-100/80 shadow-sm"
                : "text-gray-500 hover:bg-gray-100",
            collapsed && "justify-center px-2"
        )}
    >
        {icon}
        {!collapsed && <span className="truncate">{label}</span>}
    </button>
);

const HistoryItem = ({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full text-left px-3 py-2 rounded-md truncate text-sm transition-colors duration-150",
            active ? "bg-indigo-50/50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-200/50"
        )}
    >
        {label}
    </button>
);

export function Sidebar() {
    const { activeNav, setActiveNav, setViewMode, viewMode, sidebarCollapsed, setSidebarCollapsed, setUserPrompt } = useSidebarContext();
    const [activeHistory, setActiveHistory] = useState('AI产品设计平台克隆');
    const [isLogin] = useState(true);

    const isChat = viewMode === 'chat';

    const handleNavClick = (nav: string) => {
        if (nav === 'knowledge') return;
        setActiveNav(nav);
        if (nav === 'home') {
            setViewMode('home');
            setActiveHistory('');
        }
    };

    const handleLogoClick = () => {
        setViewMode('home');
        setActiveNav('home');
        setActiveHistory('');
        setUserPrompt('');
    };

    const handleHistoryClick = (label: string) => {
        setViewMode('chat');
        setActiveHistory(label);
    };

    const homeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
    );

    const knowledgeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <line x1="3" x2="21" y1="9" y2="9"></line>
            <path d="M9 15h6"></path>
        </svg>
    );

    // =========================================================
    // 首页/对话页 - 收起状态 (差异化悬浮按钮)
    // =========================================================
    if (sidebarCollapsed) {
        return (
            <>
                {/* 占位，确保主内容区平滑过渡 */}
                <aside className="w-0 overflow-hidden border-none m-0 p-0 transition-all duration-300 ease-in-out" />

                {isChat ? null : (
                    /* 首页收起：保持 Logo + 墨刀AI + 展开图标 */
                    <div 
                        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white rounded-xl shadow-sm border border-slate-200 p-2 transition-all hover:shadow-md cursor-pointer group" 
                        onClick={() => setSidebarCollapsed(false)}
                    >
                        <LogoIcon />
                        <span className="font-bold text-slate-800 text-[14px]">墨刀AI</span>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <ToggleIcon 
                            onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(false); }} 
                            title="展开侧边栏" 
                            className="text-slate-400 group-hover:text-slate-600 rotate-180 p-0" 
                        />
                    </div>
                )}
            </>
        );
    }

    // =========================================================
    // 完整展开状态（首页 & 对话页） (图4 & 图1)
    // =========================================================
    return (
        <aside className={cn(
            "bg-[#FAFAFA] border-r border-gray-100 flex flex-col h-full flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out",
            "w-[280px]"
        )}>
            {/* 顶部 Logo + 收起按钮 */}
            <div className="h-14 flex items-center justify-between px-4 shrink-0 border-b border-transparent">
                <div
                    className="flex items-center gap-2 cursor-pointer rounded-lg px-1 py-1 hover:bg-gray-100 transition-colors"
                    onClick={handleLogoClick}
                    title="新建对话"
                >
                    <LogoIcon />
                    <span className="font-bold text-lg text-gray-900 whitespace-nowrap">墨刀AI</span>
                </div>
                <ToggleIcon onClick={() => setSidebarCollapsed(true)} title="收起左侧栏" />
            </div>

            {/* 导航 Tabs (全图通用) */}
            <div className="px-2 mt-3 mb-1 space-y-0.5">
                    <SidebarNavTab
                        active={activeNav === 'home' && viewMode !== 'chat'}
                        onClick={() => handleNavClick('home')}
                        label="首页"
                        collapsed={false}
                        icon={homeIcon}
                    />
                    <SidebarNavTab
                        active={false}
                        onClick={() => { }}
                        label="知识库"
                        collapsed={false}
                        icon={knowledgeIcon}
                    />
                </div>

            {/* 历史对话栏目头部 */}
            <div className="px-4 mb-2 mt-2 block">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                    <span className="text-xs font-normal">历史对话</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                </div>
            </div>

            <ScrollArea className="flex-1 px-2">
                <div className="space-y-0.5 pb-4">
                    <HistoryItem label="SaaS落地页设计" active={viewMode === 'chat' && activeHistory === 'SaaS落地页设计'} onClick={() => handleHistoryClick('SaaS落地页设计')} />
                    <HistoryItem label="数据导入与清洗" active={viewMode === 'chat' && activeHistory === '数据导入与清洗'} onClick={() => handleHistoryClick('数据导入与清洗')} />
                    <HistoryItem label="用户行为分析" active={viewMode === 'chat' && activeHistory === '用户行为分析'} onClick={() => handleHistoryClick('用户行为分析')} />
                    <HistoryItem label="123分析" active={viewMode === 'chat' && activeHistory === '123分析'} onClick={() => handleHistoryClick('123分析')} />
                    <HistoryItem label="项目命名辅助工具" active={viewMode === 'chat' && activeHistory === '项目命名辅助工具'} onClick={() => handleHistoryClick('项目命名辅助工具')} />
                    <HistoryItem label="项目标题设计助手" active={viewMode === 'chat' && activeHistory === '项目标题设计助手'} onClick={() => handleHistoryClick('项目标题设计助手')} />
                    <HistoryItem label="123项目命名" active={viewMode === 'chat' && activeHistory === '123项目命名'} onClick={() => handleHistoryClick('123项目命名')} />
                    <HistoryItem label="数据清洗与处理" active={viewMode === 'chat' && activeHistory === '数据清洗与处理'} onClick={() => handleHistoryClick('数据清洗与处理')} />
                    <HistoryItem label="APP开发项目" active={viewMode === 'chat' && activeHistory === 'APP开发项目'} onClick={() => handleHistoryClick('APP开发项目')} />
                    <HistoryItem label="墨刀AI界面评估" active={viewMode === 'chat' && activeHistory === '墨刀AI界面评估'} onClick={() => handleHistoryClick('墨刀AI界面评估')} />
                    <HistoryItem label="火车票预订系统" active={viewMode === 'chat' && activeHistory === '火车票预订系统'} onClick={() => handleHistoryClick('火车票预订系统')} />
                    <HistoryItem label="白板行业分析" active={viewMode === 'chat' && activeHistory === '白板行业分析'} onClick={() => handleHistoryClick('白板行业分析')} />
                    <HistoryItem label="AI产品设计平台克隆" active={viewMode === 'chat' && activeHistory === 'AI产品设计平台克隆'} onClick={() => handleHistoryClick('AI产品设计平台克隆')} />
                </div>
            </ScrollArea>

            {/* Footer 用户信息 */}
            <div className="p-4 mt-auto border-t border-transparent shrink-0">
                <div className="flex items-center gap-1 w-full px-2">
                    {/* 头像 + 用户名 */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-xl transition-colors cursor-pointer hover:bg-slate-100">
                        <div className="w-8 h-8 rounded-full bg-[#a78bfa] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                            {isLogin ? "ww" : "未"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-semibold text-slate-700 truncate">{isLogin ? "ww" : "用户"}</div>
                        </div>
                    </div>

                    {/* 下载移动端 */}
                    <div className="relative group/download shrink-0">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" />
                            </svg>
                        </button>
                        {/* tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/download:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">下载移动端</div>
                        {/* 二维码浮层 */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 opacity-0 group-hover/download:opacity-100 pointer-events-none group-hover/download:pointer-events-auto transition-all duration-200 z-50">
                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-[260px]">
                                <div className="flex gap-4 justify-center mb-3">
                                    {/* iOS 二维码占位 */}
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-[96px] h-[96px] bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 relative overflow-hidden">
                                            <div className="absolute inset-0 grid grid-cols-8 gap-0.5 p-1 opacity-30">
                                                {Array.from({length: 64}).map((_,i) => <div key={i} className={`rounded-[1px] ${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-transparent'}`} />)}
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-slate-700 relative z-10">
                                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                            </svg>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">iOS</span>
                                    </div>
                                    {/* Android 二维码占位 */}
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="w-[96px] h-[96px] bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 relative overflow-hidden">
                                            <div className="absolute inset-0 grid grid-cols-8 gap-0.5 p-1 opacity-30">
                                                {Array.from({length: 64}).map((_,i) => <div key={i} className={`rounded-[1px] ${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-transparent'}`} />)}
                                            </div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-slate-700 relative z-10">
                                                <path d="M17.523 15.341 14.56 9.19c.26-.42.44-.9.44-1.44 0-.8-.32-1.52-.84-2.04L16.28 4.1a.5.5 0 0 0-.707-.707l-2.12 2.12A2.959 2.959 0 0 0 12 5.25c-.53 0-1 .145-1.45.263L8.43 3.394a.5.5 0 0 0-.707.707l2.12 2.12A2.89 2.89 0 0 0 9 7.75c0 .55.18 1.04.44 1.47L6.48 15.34A3.498 3.498 0 0 0 3 18.75C3 20.544 4.456 22 6.25 22h11.5c1.794 0 3.25-1.456 3.25-3.25a3.5 3.5 0 0 0-3.477-3.409z"/>
                                            </svg>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium">Android</span>
                                    </div>
                                </div>
                                <p className="text-center text-[11px] text-slate-400 font-medium">扫码下载移动端，把专业墨刀AI能力装进口袋</p>
                            </div>
                        </div>
                    </div>

                    {/* 联系客服 */}
                    <div className="relative group/service shrink-0">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                            </svg>
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/service:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">联系客服</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
