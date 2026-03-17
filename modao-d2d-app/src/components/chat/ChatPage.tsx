import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, PanelLeft, Sparkles, Check, Copy, Download, RotateCw, Smartphone, Tablet, Monitor, Share, Share2, Maximize2, Edit3, FileText, CheckCircle2, Paperclip, ArrowUp, X, Globe, Lock, Settings, BarChart3, Image, RefreshCw, MonitorSmartphone, Code2, Palette, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tr } from '@/pc-en/tr';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebarContext } from '@/context/SidebarContext';
import { streamGenerateApp } from '@/lib/geminiService';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';


export type GenStage = 'idle' | 'thinking' | 'executing' | 'generating' | 'done';
export type FileCardType = 'document' | 'single' | 'multi' | 'app';

export interface ExecutingItem {
    label: string;
    done: boolean;
}

export interface GenerationSession {
    id: string;
    prompt: string;
    stage: GenStage;
    thinkingText: string;
    executingItems: ExecutingItem[];
    generatedHtml: string;
    streamingCode: string;
    selectedFileType: FileCardType | null;
    timestamp: number;
}

export function ChatPage() {
    const { userPrompt, setUserPrompt, sidebarCollapsed, setSidebarCollapsed, setViewMode, setActiveNav } = useSidebarContext();
    const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'code' | 'config' | 'analytics'>('preview');
    const [isDirOpen, setIsDirOpen] = useState(true);
    const [activeTerminalFile, setActiveTerminalFile] = useState('墨刀AI界面设计评审.md');
    const [inputMessage, setInputMessage] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };
    const isEnglish = typeof window !== 'undefined' && window.__PRODES_LOCALE__ === 'en';
    const [activeFile, setActiveFile] = useState('cart.html');
    const [deviceMode, setDeviceMode] = useState<'mobile' | 'pad' | 'pc'>('pc');
    const [showDeviceMenu, setShowDeviceMenu] = useState(false);
    const [showPageMenu, setShowPageMenu] = useState(false);
    const deviceMenuRef = useRef<HTMLDivElement>(null);
    const [showVersionMenu, setShowVersionMenu] = useState(false);
    const [activeVersion, setActiveVersion] = useState('V2');
    const versionMenuRef = useRef<HTMLDivElement>(null);
    const [isChatOpen, setIsChatOpen] = useState(true);

    const [sessions, setSessions] = useState<GenerationSession[]>(() => {
        try {
            const saved = localStorage.getItem('modao_d2d_sessions');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [activeMessage, setActiveMessage] = useState<'html' | 'document' | 'terminal' | string>(() => {
        return localStorage.getItem('modao_d2d_activeMessage') || 'html';
    });

    useEffect(() => {
        try {
            // 只保留最近 5 个 session，防止存大段 HTML/代码导致 localStorage 爆满
            const sessionsToSave = sessions.slice(-5);
            localStorage.setItem('modao_d2d_sessions', JSON.stringify(sessionsToSave));
        } catch (e) {
            console.warn('Failed to save sessions to localStorage:', e);
        }
    }, [sessions]);

    useEffect(() => {
        localStorage.setItem('modao_d2d_activeMessage', activeMessage);
    }, [activeMessage]);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const generatingRef = useRef(false);

    const updateSession = (id: string, updates: Partial<GenerationSession>) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    // Publish modal enhanced state
    const [isEditingUrl, setIsEditingUrl] = useState(false);
    const [editUrlValue, setEditUrlValue] = useState('');
    const [urlError, setUrlError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // Share panel state
    const [showSharePanel, setShowSharePanel] = useState(false);
    const [shareTab, setShareTab] = useState<'project' | 'file'>('project');
    const sharePanelRef = useRef<HTMLDivElement>(null);

    // Publish modal state
    const [showPublishModal, setShowPublishModal] = useState(false);
    const publishPanelRef = useRef<HTMLDivElement>(null);
    const [isPublished, setIsPublished] = useState(false);
    const [projectName, setProjectName] = useState(tr('电商购物App原型'));
    const [customUrl, setCustomUrl] = useState('cart-app-58751561');
    const [publishedProjectName, setPublishedProjectName] = useState('');
    const [publishedAt, setPublishedAt] = useState<Date | null>(null);
    const [publishVersion, setPublishVersion] = useState(0);

    // Screenshot mode state
    const [showScreenshotMode, setShowScreenshotMode] = useState(false);
    const [capturedImages, setCapturedImages] = useState<{ id: number; label: string; comments: string[] }[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
    const [comments, setComments] = useState<{
        id: number;
        rect: { x: number; y: number; w: number; h: number };
        text: string;
        isEditing: boolean;
        confirmed: boolean;
        shaking: boolean;
    }[]>([]);
    const [draggingComment, setDraggingComment] = useState<{
        id: number; startMX: number; startMY: number; origX: number; origY: number;
    } | null>(null);
    const [resizingComment, setResizingComment] = useState<{
        id: number; startMX: number; startMY: number; origW: number; origH: number;
    } | null>(null);
    const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);
    const [activeCommentId, setActiveCommentId] = useState<number | null>(null);

    const EXISTING_URLS = ['cart-app-123456', 'design-review-11718025', 'table-blue-58751561', 'pig-rock-11718025'];

    // Chat Panel Resizing Logic
    const [chatWidth, setChatWidth] = useState(400);
    const [isDraggingChat, setIsDraggingChat] = useState(false);
    const dragStartRef = useRef({ x: 0, width: 0 });

    const handleChatResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDraggingChat(true);
        dragStartRef.current = { x: e.clientX, width: chatWidth };
    }, [chatWidth]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingChat) return;
            const delta = e.clientX - dragStartRef.current.x;
            let newWidth = dragStartRef.current.width + delta;
            // minimum 400, maximum 900
            if (newWidth < 400) newWidth = 400;
            if (newWidth > 900) newWidth = 900;
            setChatWidth(newWidth);
        };
        const handleMouseUp = () => setIsDraggingChat(false);
        if (isDraggingChat) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingChat]);

    // ===== AI Generation Flow =====
    const runGenerationPipeline = async (sessionId: string, prompt: string) => {
        // 执行阶段：逐条显示胶囊
        updateSession(sessionId, { stage: 'executing', executingItems: [] });
        setActiveTab('preview');

        // 根据 prompt 生成模拟的执行步骤
        const executingSteps = [
            '分析需求结构...',
            '搭建页面框架',
            '已完成创建 index.html',
            '已完成创建 profile.html',
            '已完成创建 detail.html',
            '已完成创建 home.html',
            '正在整合样式资源...',
        ];

        for (let i = 0; i < executingSteps.length; i++) {
            await new Promise((r) => setTimeout(r, 480));
            setSessions(prev => prev.map(s => s.id === sessionId ? {
                ...s,
                executingItems: [
                    ...s.executingItems,
                    { label: executingSteps[i], done: true }
                ]
            } : s));
        }

        // 进入代码流式生成，保持预览 tab（不强制切换到代码 tab）
        updateSession(sessionId, { stage: 'generating' });
        setActiveTab('preview');

        let html = '';
        await streamGenerateApp(
            prompt, '',
            (chunk: string) => {
                html += chunk;
                updateSession(sessionId, { streamingCode: html });
            },
            () => {
                updateSession(sessionId, {
                    generatedHtml: html,
                    stage: 'done',
                    // 默认选中「应用」卡片，便于用户直接在右侧查看最新生成的 App
                    selectedFileType: 'app',
                });
                setActiveMessage(sessionId);
                setActiveTab('preview');
                generatingRef.current = false;
            },
            (err: any) => {
                console.error('Generation error:', err);
                updateSession(sessionId, { stage: 'done' });
                generatingRef.current = false;
            }
        );
    };

    const startGeneration = useCallback(async (prompt: string) => {
        if (generatingRef.current) return;
        generatingRef.current = true;
        // 进入生成页面时自动收起左侧栏
        setSidebarCollapsed(true);
        
        const sessionId = Date.now().toString();
        const newSession: GenerationSession = {
            id: sessionId,
            prompt,
            stage: 'thinking',
            thinkingText: tr('正在理解需求...'),
            executingItems: [],
            generatedHtml: '',
            streamingCode: '',
            selectedFileType: null,
            timestamp: Date.now()
        };

        setSessions(prev => [...prev, newSession]);
        setActiveMessage(sessionId);
        setActiveTab('preview');

        // Thinking 动画 (约2秒)
        const thinkingTexts = [tr('正在理解需求...'), tr('分析产品架构...'), tr('准备生成方案...')];
        for (const t of thinkingTexts) {
            updateSession(sessionId, { thinkingText: t });
            await new Promise((r) => setTimeout(r, 650));
        }

        // 直接进入执行阶段，不再 questioning
        await runGenerationPipeline(sessionId, prompt);
    }, [setUserPrompt]);

    // Trigger AI generation when userPrompt is available
    useEffect(() => {
        if (userPrompt && userPrompt.trim()) {
            startGeneration(userPrompt);
            setUserPrompt(''); // Clear to prevent re-triggering on mount or refresh
        }
    }, [userPrompt, startGeneration, setUserPrompt]);

    const handleSendMessage = () => {
        if (!inputMessage.trim() && capturedImages.length === 0) return;
        const finalPrompt = inputMessage.trim() || tr('请根据提供的截图优化');
        startGeneration(finalPrompt);
        setInputMessage('');
        setCapturedImages([]);
    };

    // 选中文件卡片
    const handleSelectFileCard = (sessionId: string, fileType: FileCardType) => {
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, selectedFileType: fileType } : s));
        if (fileType === 'document') {
            setActiveMessage('document_' + sessionId);
        } else {
            // 非文档类型直接用 sessionId，右侧通过 session.selectedFileType 决定渲染
            setActiveMessage(sessionId);
            setActiveTab('preview');
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // 点击空白处时，收起已打开的评论
        if (!(e.target as HTMLElement).closest('.comment-box-interactive')) {
            setActiveCommentId(null);
        }

        if ((e.target as HTMLElement).closest('.comment-box-interactive')) return;
        // 检查是否有正在编辑的评论框
        const editingComment = comments.find(c => c.isEditing && !c.confirmed);
        if (editingComment) {
            if (editingComment.text.trim()) {
                // 有内容：抖动提示
                setComments(prev => prev.map(c => c.id === editingComment.id ? { ...c, shaking: true } : c));
                setTimeout(() => setComments(prev => prev.map(c => c.id === editingComment.id ? { ...c, shaking: false } : c)), 500);
                return;
            } else {
                // 无内容：移除
                setComments(prev => prev.filter(c => c.id !== editingComment.id));
            }
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentPos({ x, y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (draggingComment) {
            const dx = mx - draggingComment.startMX;
            const dy = my - draggingComment.startMY;
            setComments(prev => prev.map(c => c.id === draggingComment.id
                ? { ...c, rect: { ...c.rect, x: draggingComment.origX + dx, y: draggingComment.origY + dy } }
                : c));
            return;
        }
        if (resizingComment) {
            const dx = mx - resizingComment.startMX;
            const dy = my - resizingComment.startMY;
            setComments(prev => prev.map(c => c.id === resizingComment.id
                ? { ...c, rect: { ...c.rect, w: Math.max(40, resizingComment.origW + dx), h: Math.max(30, resizingComment.origH + dy) } }
                : c));
            return;
        }
        if (!isDrawing) return;
        setCurrentPos({ x: mx, y: my });
    };

    const handleMouseUp = () => {
        if (draggingComment) { setDraggingComment(null); return; }
        if (resizingComment) { setResizingComment(null); return; }
        if (!isDrawing) return;
        setIsDrawing(false);
        const w = Math.abs(currentPos.x - startPos.x);
        const h = Math.abs(currentPos.y - startPos.y);
        if (w > 10 && h > 10) {
            const x = Math.min(startPos.x, currentPos.x);
            const y = Math.min(startPos.y, currentPos.y);
            setComments(prev => [...prev, {
                id: Date.now(),
                rect: { x, y, w, h },
                text: '',
                isEditing: true,
                confirmed: false,
                shaking: false,
            }]);
        }
    };

    // Close share panel when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            // Check if the click is inside any iframe. If so, don't try to handle it with DOM nodes.
            if (sharePanelRef.current && !sharePanelRef.current.contains(e.target as Node)) {
                setShowSharePanel(false);
            }
            if (publishPanelRef.current && !publishPanelRef.current.contains(e.target as Node) && !showWithdrawConfirm && !isWithdrawing) {
                setShowPublishModal(false);
            }
            if (deviceMenuRef.current && !deviceMenuRef.current.contains(e.target as Node)) {
                setShowDeviceMenu(false);
            }
            if (versionMenuRef.current && !versionMenuRef.current.contains(e.target as Node)) {
                setShowVersionMenu(false);
            }
        };

        // Handle iframe clicks by listening to window blur
        const handleBlur = () => {
            // When clicking into an iframe, the window loses focus.
            // We can close the dropdowns when this happens.
            setTimeout(() => {
                if (document.activeElement?.tagName === 'IFRAME') {
                    setShowSharePanel(false);
                    if (!showWithdrawConfirm && !isWithdrawing) setShowPublishModal(false);
                    setShowDeviceMenu(false);
                    setShowVersionMenu(false);
                }
            }, 0);
        };

        document.addEventListener('mousedown', handler);
        window.addEventListener('blur', handleBlur);
        return () => {
            document.removeEventListener('mousedown', handler);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('blur', handleBlur);
        };
    }, [showWithdrawConfirm, isWithdrawing]);

    const shareDropdown = (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/60 z-50 flex flex-col cursor-default font-sans animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header: tabs + close */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-lg">
                    <button
                        onClick={() => setShareTab('project')}
                        className={cn("px-4 py-1.5 text-[12px] font-bold rounded-md transition-all", shareTab === 'project' ? "bg-white text-[#4f46e5] shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >{tr('分享项目')}</button>
                    <button
                        onClick={() => setShareTab('file')}
                        className={cn("px-4 py-1.5 text-[12px] font-bold rounded-md transition-all", shareTab === 'file' ? "bg-white text-[#4f46e5] shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >{tr('分享文件')}</button>
                </div>
                <button className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition" onClick={() => setShowSharePanel(false)}>
                    <X size={15} />
                </button>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* 分享说明 */}
                <div className="text-[12px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2">
                    <div className="mt-0.5 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </div>
                    <span>{shareTab === 'project' ? tr('把整个对话和对话中生成的所有内容分享出去') : tr('只分享当前所选的文件')}</span>
                </div>

                {/* Access permission */}
                <div>
                    <div className="text-[13px] font-bold text-slate-700 mb-2.5">{tr('链接访问权限')}</div>
                    <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                        <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer transition select-none">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <Lock size={14} />
                                </div>
                                <div>
                                    <div className="text-[13px] font-semibold text-slate-700">{tr('仅限自己')}</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">{tr('仅自己可见')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer transition select-none">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#4f46e5]">
                                    <Globe size={14} />
                                </div>
                                <div>
                                    <div className="text-[13px] font-semibold text-slate-700">{tr('公开')}</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">{tr('获得链接的人可访问')}</div>
                                </div>
                            </div>
                            <Check size={15} className="text-[#4f46e5] shrink-0" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Replay mode toggle - only show for project tab */}
                {shareTab === 'project' && (
                    <div className="flex items-center justify-between px-1">
                        <div className="text-[13px] font-semibold text-slate-700">{tr('回放模式')}</div>
                        <div className="w-10 h-[22px] bg-[#6366f1] rounded-full flex items-center p-0.5 justify-end cursor-pointer">
                            <div className="w-[18px] h-[18px] bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2 pt-0.5">
                    <button className="w-full h-10 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[13px] font-bold rounded-xl transition-colors active:scale-[0.98] shadow-sm">
                        {tr('复制链接')}
                    </button>
                </div>
            </div>
        </div>
    );

    const hasPublishChanges = isPublished && projectName !== publishedProjectName;

    const formatPublishedAt = (date: Date) => {
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return tr('刚刚');
        if (diffMins < 60) return tr('{{n}} 分钟前').replace('{{n}}', String(diffMins));
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return tr('{{n}} 小时前').replace('{{n}}', String(diffHours));
        const diffDays = Math.floor(diffHours / 24);
        return tr('{{n}} 天前').replace('{{n}}', String(diffDays));
    };

    const publishDropdown = (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/60 w-[420px] z-50 cursor-default animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="text-[15px] font-bold text-gray-900">{tr('发布网站')}</div>
                <button onClick={() => setShowPublishModal(false)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                    <X size={15} />
                </button>
            </div>

            {/* Form fields */}
            <div className="px-6 py-5 space-y-5">
                {/* Page name */}
                <div className="flex items-center gap-4">
                    <span className="text-[13px] font-semibold text-gray-500 w-[60px] shrink-0">{tr('项目名称')}</span>
                    <input
                        value={projectName}
                        onChange={e => setProjectName(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-50 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                </div>

                {/* Status */}
                <div className="flex items-center gap-4">
                    <span className="text-[13px] font-semibold text-gray-500 w-[60px] shrink-0">{tr('当前状态')}</span>
                    {isPublished ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[12px] font-semibold border border-emerald-100">
                            <CheckCircle2 size={13} strokeWidth={2.5} />
                            {tr('已发布')}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[12px] font-semibold border border-slate-200">
                            {tr('未发布')}
                        </div>
                    )}
                </div>

                {/* Last published time - shown whenever there's a publish record, degraded when unpublished */}
                {publishedAt && (
                    <div className="flex items-center gap-4">
                        <span className={cn("text-[13px] font-semibold w-[60px] shrink-0", isPublished ? "text-gray-500" : "text-gray-400")}>{tr('最近发布时间')}</span>
                        <span className={cn("text-[13px] font-medium", isPublished ? "text-gray-700" : "text-gray-400")}>
                            {formatPublishedAt(publishedAt)} · V{publishVersion}
                        </span>
                    </div>
                )}

                {/* URL */}
                <div className="flex items-start gap-4">
                    <span className="text-[13px] font-semibold text-gray-500 w-[60px] shrink-0 mt-2.5">{tr('访问链接')}</span>
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className={cn("flex-1 flex items-center border rounded-lg px-3 py-2 transition", isEditingUrl ? "border-indigo-300 ring-2 ring-indigo-100 bg-white" : "border-gray-50 bg-gray-50")}>
                                {isEditingUrl ? (
                                    <input
                                        autoFocus
                                        value={editUrlValue}
                                        onChange={e => { setEditUrlValue(e.target.value); setUrlError(''); }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                if (EXISTING_URLS.includes(editUrlValue) && editUrlValue !== customUrl) setUrlError(tr('该链接已被占用'));
                                                else { setCustomUrl(editUrlValue); setIsEditingUrl(false); setUrlError(''); }
                                            }
                                            if (e.key === 'Escape') setIsEditingUrl(false);
                                        }}
                                        className="flex-1 bg-transparent text-[13px] font-medium text-gray-800 outline-none w-full"
                                    />
                                ) : (
                                    <span 
                                        className={cn(
                                            "flex-1 text-[13px] font-medium truncate transition-colors",
                                            isPublished ? "cursor-pointer text-indigo-600 hover:text-indigo-800 hover:underline underline-offset-2" : "text-gray-800 cursor-pointer hover:text-indigo-600 hover:underline underline-offset-2"
                                        )}
                                        title={isPublished ? tr("点击在新标签页打开") : tr("点击在新标签页打开预览")}
                                        onClick={() => {
                                            window.open(`https://${customUrl}.modao.site`, '_blank');
                                        }}
                                    >
                                        {customUrl}
                                    </span>
                                )}
                                <span className="text-[13px] font-medium text-gray-400 ml-1 shrink-0">.modao.site</span>
                            </div>
                            
                            {/* Actions toggle depending on editing state */}
                            {isEditingUrl ? (
                                <div className="flex items-center gap-0.5 shrink-0">
                                    <button 
                                        title={tr("保存")}
                                        onClick={() => { if (EXISTING_URLS.includes(editUrlValue) && editUrlValue !== customUrl) setUrlError(tr('该链接已被占用')); else { setCustomUrl(editUrlValue); setIsEditingUrl(false); setUrlError(''); } }} 
                                        className="px-3 py-2 bg-indigo-50 text-indigo-600 font-bold text-[13px] rounded-lg hover:bg-indigo-100 transition"
                                    >
                                        {tr('保存')}
                                    </button>
                                    <button 
                                        title={tr("取消")}
                                        onClick={() => setIsEditingUrl(false)} 
                                        className="px-3 py-2 bg-gray-100 text-gray-500 font-bold text-[13px] rounded-lg hover:bg-gray-200 transition"
                                    >
                                        {tr('取消')}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                        title={tr("复制链接")}
                                        onClick={() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        {copySuccess ? <Check size={16} className="text-emerald-500" strokeWidth={2.5} /> : <Copy size={16} />}
                                    </button>
                                    <button
                                        title={tr("编辑域名前缀")}
                                        onClick={() => { setEditUrlValue(customUrl); setIsEditingUrl(true); }}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                        {urlError && <div className="text-[12px] text-red-500 font-medium">{urlError}</div>}
                    </div>
                </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 pb-5 flex gap-3">
                {isPublished ? (
                    <>
                        <button
                            key="withdraw-btn"
                            disabled={isWithdrawing}
                            onClick={() => {
                                if (isWithdrawing) return;
                                setShowWithdrawConfirm(true);
                            }}
                            className="flex-1 h-[42px] rounded-[10px] border border-gray-200 text-gray-800 font-semibold text-[14px] hover:bg-gray-50 transition bg-white relative overflow-hidden"
                        >
                            <div className={cn("flex items-center justify-center gap-1.5 transition-all duration-300", isWithdrawing ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100")}>
                                {tr('撤回')}
                            </div>
                            <div className={cn("absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-300 text-gray-500", isWithdrawing ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0")}>
                                <RefreshCw size={14} className="animate-spin" /> {tr('正在撤回...')}
                            </div>
                        </button>
                        <button
                            key="update-btn"
                            disabled={!hasPublishChanges || isPublishing}
                            onClick={() => {
                                if (!hasPublishChanges || isPublishing) return;
                                setIsPublishing(true);
                                setTimeout(() => {
                                    setIsPublishing(false);
                                    setUpdateSuccess(true);
                                    setPublishedProjectName(projectName);
                                    setPublishVersion(v => v + 1);
                                    setPublishedAt(new Date());
                                    showToast(tr('✅ 更新成功！'));
                                    setTimeout(() => {
                                        setUpdateSuccess(false);
                                    }, 1000);
                                }, 1000);
                            }}
                            className={cn(
                                "flex-1 h-[42px] rounded-[10px] font-semibold text-[14px] overflow-hidden relative transition",
                                hasPublishChanges
                                    ? "bg-[#1A1A1A] text-white hover:bg-black"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <div className={cn("flex items-center justify-center gap-1.5 transition-all duration-300", (isPublishing || updateSuccess) ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100")}>
                                {tr('更新')}
                            </div>
                            <div className={cn("absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-300", isPublishing && !updateSuccess ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0")}>
                                <RefreshCw size={14} className="animate-spin" /> {tr('正在更新...')}
                            </div>
                            <div className={cn("absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-300", updateSuccess ? "translate-y-0 opacity-100 bg-emerald-500 text-white" : "translate-y-10 opacity-0")}>
                                <Check size={16} strokeWidth={3} /> {tr('更新成功')}
                            </div>
                        </button>
                    </>
                ) : (
                    <button
                        key="publish-btn"
                        disabled={isPublishing}
                        onClick={() => {
                            if (isPublishing) return;
                            setIsPublishing(true);
                            setTimeout(() => {
                                setIsPublishing(false);
                                setIsPublished(true);
                                setPublishedProjectName(projectName);
                                setPublishVersion(1);
                                setPublishedAt(new Date());
                                showToast(tr('✅ 发布成功！网站已上线'));
                            }, 1000);
                        }}
                        className={cn(
                            "w-full h-[42px] rounded-[10px] text-white font-semibold text-[14px] transition overflow-hidden relative",
                            isPublishing ? "bg-gray-800" : "bg-[#1A1A1A] hover:bg-black"
                        )}
                    >
                        <div className={cn("flex items-center justify-center gap-1.5 transition-all duration-300", isPublishing ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100")}>
                            {tr('发布')}
                        </div>
                        <div className={cn("absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-300", isPublishing ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0")}>
                            <RefreshCw size={14} className="animate-spin" /> {tr('正在发布...')}
                        </div>
                    </button>
                )}
            </div>
        </div>
    );

    const renderRightPanelContent = () => {
        const currentSession = sessions.find(s => s.id === activeMessage);
        
        // 如果没有任何会话或没有当前选中的会话，默认所有tab展示空状态
        if (!currentSession) {
             return (
                 <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <MonitorSmartphone size={24} className="text-slate-300" />
                    </div>
                    <div className="text-center">
                        <p className="text-[14px] font-semibold text-slate-700">{tr('等待生成内容')}</p>
                        <p className="text-[13px] mt-1">{tr('在左侧输入需求，AI将为您生成产品并在右侧展示')}</p>
                    </div>
                 </div>
             );
        }

        const isGenerating = currentSession.stage === 'generating';
        const isExecuting = currentSession.stage === 'executing';

        // 执行中/thinking 状态：右侧显示骨架屏
        if (isExecuting || currentSession.stage === 'thinking') {
            return (
                <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-slate-50">
                    <div className="w-full max-w-2xl px-8 flex flex-col items-center opacity-60">
                        <RefreshCw size={28} className="animate-spin text-indigo-400 mb-6" />
                        <div className="space-y-3 w-full">
                            <div className="h-10 bg-slate-200 rounded-xl animate-pulse" />
                            <div className="grid grid-cols-3 gap-3">
                                <div className="h-28 bg-slate-200 rounded-xl animate-pulse col-span-2" />
                                <div className="h-28 bg-slate-200 rounded-xl animate-pulse" />
                            </div>
                            <div className="h-40 bg-slate-200 rounded-xl animate-pulse" />
                        </div>
                        <p className="text-[13px] font-medium text-slate-500 mt-6">{tr('AI 正在生成中，请稍候...')}</p>
                    </div>
                </div>
            );
        }

        if (activeTab === 'preview' || activeTab === 'edit') {
            if (isGenerating && !currentSession.generatedHtml) {
                return (
                    <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-slate-50">
                        <div className="w-full max-w-2xl px-8 flex flex-col items-center opacity-60">
                            <RefreshCw size={32} className="animate-spin text-indigo-400 mb-6" />
                            <div className="space-y-4 w-full">
                                <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-32 bg-slate-200 rounded-xl animate-pulse col-span-2" />
                                    <div className="h-32 bg-slate-200 rounded-xl animate-pulse" />
                                </div>
                                <div className="h-48 bg-slate-200 rounded-xl animate-pulse" />
                            </div>
                            <p className="text-[13px] font-medium text-slate-500 mt-8">{tr('AI 正在绘制界面结构并添加样式...')}</p>
                        </div>
                    </div>
                );
            }
            if (currentSession.streamingCode || currentSession.generatedHtml) {
                return (
                    <div
                        className={cn(
                            "flex-1 w-full h-full p-2 bg-slate-100/50",
                            deviceMode !== 'pc' && "flex items-center justify-center"
                        )}
                    >
                        {/* 模拟浏览器容器 */}
                        <div className={cn(
                            "h-full overflow-hidden flex flex-col relative mx-auto transition-all duration-300",
                            deviceMode === 'pc'
                                ? "w-full bg-white rounded-xl border border-slate-200 shadow-sm"
                                : deviceMode === 'pad'
                                    ? "w-full max-w-[820px] max-h-[1180px] bg-white rounded-xl border border-slate-200 shadow-xl"
                                    : "w-full max-w-[393px] max-h-[852px] bg-white rounded-xl border border-slate-200 shadow-xl"
                        )}>
                            {/* Browser Bar */}
                            <div className="h-10 border-b border-slate-100 bg-slate-50/80 flex items-center px-4 gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-rose-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>
                                <div className="flex-1 flex justify-center">
                                    <div className="bg-white border border-slate-200 rounded-md px-3 py-1 text-[11px] text-slate-400 flex items-center gap-2 w-64 shadow-sm relative">
                                        <Lock size={10} />
                                        <span>localhost:3000/app</span>
                                    </div>
                                </div>
                            </div>
                            {/* Iframe content */}
                            <div className="relative w-full h-full flex-1 overflow-hidden transition-all duration-300 bg-white">
                                {isGenerating ? (
                                    <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center" />
                                ) : null}
                                <div className="relative w-full h-full overflow-hidden bg-white">
                                    <iframe
                                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                        srcDoc={currentSession.generatedHtml || currentSession.streamingCode}
                                        title="AI Generated Preview"
                                        className="w-full h-full border-none bg-white"
                                    />
                                </div>
                                {isGenerating && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-indigo-600 text-white px-4 py-2 text-[12px] font-bold rounded-full shadow-lg flex items-center gap-2">
                                        <RefreshCw size={12} className="animate-spin" />
                                        <span>{tr('代码正在流式渲染...')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
        }

        if (activeTab === 'code') {
            return (
                <div className="flex-1 w-full h-full bg-slate-50 text-slate-700 font-mono text-[13px] overflow-hidden p-6 relative">
                    {/* Code Scrollable */}
                    <ScrollArea className="w-full h-full">
                        {isGenerating && (
                            <div className="flex items-center gap-2 text-indigo-500 mb-4 pb-4 border-b border-slate-200 text-[12px]">
                                <RefreshCw size={12} className="animate-spin" />
                                {tr('接收流式代码中...')}
                            </div>
                        )}
                        <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed break-all">
                            {(currentSession.streamingCode || currentSession.generatedHtml) && (
                                <code className="text-slate-800">{currentSession.streamingCode || currentSession.generatedHtml}</code>
                            )}
                            {(!currentSession.streamingCode && !currentSession.generatedHtml) && (
                                <span className="text-slate-400">{tr('等待代码生成...')}</span>
                            )}
                        </pre>
                    </ScrollArea>
                </div>
            );
        }

        if (activeTab === 'config' || activeTab === 'analytics') {
            return (
                <div className="flex-1 w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4 bg-slate-50/50">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <Settings size={28} className="text-slate-300" />
                    </div>
                    <div className="text-center">
                        <p className="text-[14px] font-semibold text-slate-700">{tr('暂不支持当前模式')}</p>
                        <p className="text-[13px] mt-1">{tr('此 Tab 规划中，将在后续版本上线')}</p>
                    </div>
                 </div>
            );
        }

        return null;
    };

    // 判断右侧是否显示目录
    // multi: 预览/编辑/代码 三个 tab 均显示单级页面目录
    // app: 仅代码 tab 显示多级文件夹树，预览/编辑不显示目录（PRD 规定）
    const getShowDir = (session: GenerationSession | undefined): boolean => {
        if (!session || session.stage !== 'done') return false;
        const ft = session.selectedFileType;
        if (ft === 'multi') return isDirOpen;
        if (ft === 'app' && activeTab === 'code') return isDirOpen;
        return false;
    };

    // 是否应该有目录（不论展开/收起）
    const canHaveDir = (session: GenerationSession | undefined): boolean => {
        if (!session || session.stage !== 'done') return false;
        const ft = session.selectedFileType;
        if (ft === 'multi') return true;
        if (ft === 'app' && activeTab === 'code') return true;
        return false;
    };

    return (

        <TooltipProvider delayDuration={120}>
        <>
            <div className="w-full h-full flex bg-white animate-in fade-in duration-300">
                {/* Left Panel: Sidebar equivalent / Chat & History */}
                {isChatOpen ? (
                <div 
                   style={{ width: chatWidth }}
                   className={cn(
                       "bg-white border-r border-slate-100 flex flex-col shrink-0 relative z-20",
                       !isDraggingChat && "transition-all duration-300"
                   )}
                >
                    {/* Drag Handle */}
                    <div 
                        onMouseDown={handleChatResizeStart}
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-50 transform translate-x-1/2 flex items-center justify-center group" 
                    >
                         <div className="w-[4px] h-10 bg-[#E2E8F0] opacity-0 group-hover:opacity-100 group-hover:bg-[#CBD5E1] group-active:bg-[#94A3B8] rounded-full transition-all duration-200 ease-out" />
                    </div>
                    
                    <div className="h-14 flex items-center px-4 border-b border-slate-50 shrink-0 gap-3">
                        {sidebarCollapsed && (
                            <>
                                <div className="relative group/expand shrink-0">
                                    <button onClick={() => setSidebarCollapsed(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 -ml-1.5 rounded transition-colors shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="m9 15 3-3-3-3" /><line x1="15" x2="15" y1="3" y2="21" /></svg>
                                    </button>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/expand:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('展开左侧栏')}</div>
                                </div>
                                <div className="relative group/newchat shrink-0">
                                    <button
                                        onClick={() => { setViewMode('home'); setActiveNav('home'); setUserPrompt(''); }}
                                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded transition-colors shrink-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                    </button>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/newchat:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('新建项目')}</div>
                                </div>
                            </>
                        )}
                        <div className="font-bold text-slate-800 text-[14px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis mr-auto">{tr('墨刀AI设计助手')}</div>
                        <div className="ml-auto bg-[#EEF2FF] text-slate-800 rounded-full flex items-center h-[30px] px-3 font-bold cursor-pointer transition-all active:scale-95 hover:bg-indigo-50 shrink-0 divide-x divide-[#C7D2FE]/60">
                            <div className="flex items-center gap-1.5 pr-2.5">
                                <Sparkles size={14} className="text-[#6A5DF1]" fill="currentColor" />
                                <span className="font-mono text-[14px] text-slate-900 tracking-tight">9999</span>
                            </div>
                            <div className="pl-2.5 text-[12px] text-[#4338CA]">{tr('购买')}</div>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 px-4">
                        <div className="space-y-4 pb-6 mt-4">
                            {/* Empty Default State */}
                            {sessions.length === 0 && (
                                <div className="flex flex-col gap-5">
                                    <div className="flex gap-3">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 text-white flex items-center justify-center shadow-sm">
                                            <Sparkles size={12} fill="white" />
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100/50 text-slate-700 px-4 py-3 rounded-2xl max-w-[100%] mr-auto">
                                            <p className="text-[13px] leading-relaxed">{tr('你好！我是墨刀 AI 设计助手，专注于完整的端到端产品架构生成与开发。')}</p>
                                            <p className="text-[13px] leading-relaxed mt-2 text-slate-500">{tr('你可以对我说："生成一个带深色模式的现代任务管理 SaaS 后台" 或 "帮我做一个电商小程序的商品列表页"。')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Render Session Waterfall */}
                            {sessions.map(session => (
                                <div key={session.id} className="space-y-4 mb-8">
                                    
                            {/* User message */}
                            {session.prompt && (
                                <div className="flex justify-end">
                                    <div className="max-w-[85%] bg-slate-100 text-slate-800 px-4 py-2.5 rounded-2xl rounded-tr-sm text-[13px] leading-relaxed break-words font-medium">
                                        {userPrompt || tr('生成一个电商购物App首页')}
                                    </div>
                                </div>
                            )}

                            {/* Thinking stage */}
                            {session.stage === 'thinking' && (
                                <div className="flex gap-2.5 mt-3">
                                    <div className="w-6 h-6 rounded-full bg-slate-700 shrink-0 mt-0.5 flex items-center justify-center">
                                        <Sparkles size={12} className="text-white" fill="white" />
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 text-[13px] text-slate-600 border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-slate-500 text-[12px]">{session.thinkingText}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Executing stage: 胶囊列表 */}
                            {(session.stage === 'executing' || session.stage === 'generating' || session.stage === 'done') && session.executingItems.length > 0 && (
                                <div className="flex gap-2.5 mt-3">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 mt-0.5 flex items-center justify-center">
                                        <Sparkles size={12} className="text-white" fill="white" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {session.executingItems.map((item, i) => {
                                            const isFileStep = item.label.startsWith('已完成创建 ');
                                            const fileName = isFileStep ? item.label.replace('已完成创建 ', '').trim() : null;
                                            const displayLabel = isFileStep && fileName
                                                ? tr('已完成创建 {{file}}').replace('{{file}}', fileName)
                                                : tr(item.label);
                                            return (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-full px-3.5 py-2 text-[12px] text-slate-600 w-fit cursor-default"
                                                    onClick={() => {
                                                        if (!fileName) return;
                                                        setActiveTerminalFile(fileName);
                                                        setActiveMessage('terminal');
                                                    }}
                                                    style={isFileStep ? { cursor: 'pointer' } : undefined}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 shrink-0"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                    <span className="font-medium">{displayLabel}</span>
                                                </div>
                                            );
                                        })}
                                        {session.stage === 'executing' && (
                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 px-2 mt-1">
                                                <RefreshCw size={11} className="animate-spin" />
                                                {tr('正在执行...')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Generating 阶段状态 */}
                            {session.stage === 'generating' && (
                                <div className="flex gap-2.5 mt-2">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 mt-0.5 flex items-center justify-center">
                                        <Sparkles size={12} className="text-white" fill="white" />
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100">
                                        <div className="flex items-center gap-2 text-[12px] text-slate-500">
                                            <RefreshCw size={12} className="animate-spin text-indigo-500" />
                                            {tr('正在生成代码（{{n}} 字符）...').replace('{{n}}', String(Math.round(session.streamingCode.length / 10) * 10))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Done 阶段：AI 回复 + 4类文件卡片 */}
                            {session.stage === 'done' && (
                                <div className="space-y-3 mt-2">
                                    {/* AI 完成消息 */}
                                    <div className="flex gap-2.5">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 mt-0.5 flex items-center justify-center">
                                            <Sparkles size={12} className="text-white" fill="white" />
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100 text-[13px] text-slate-600">
                                            <p>{tr('已为您生成以下内容，点击卡片可在右侧查看：')}</p>
                                        </div>
                                    </div>

                                    {/* 4类文件卡片 */}
                                    <div className="ml-8 space-y-2">
                                        {([
                                            { type: 'document' as FileCardType, title: tr('设计评审文档'), subtitle: tr('文档'), icon: 'doc' },
                                            { type: 'single' as FileCardType, title: tr('单页 HTML'), subtitle: tr('单页'), icon: 'single' },
                                            { type: 'multi' as FileCardType, title: tr('多页 HTML'), subtitle: tr('多页'), icon: 'multi' },
                                            { type: 'app' as FileCardType, title: session.prompt.slice(0, 10) + tr('App原型'), subtitle: tr('应用'), icon: 'app' },
                                        ] as const).map((card) => (
                                            <div
                                                key={card.type}
                                                onClick={() => handleSelectFileCard(session.id, card.type)}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-2xl border-2 p-3 cursor-pointer transition-all duration-200 select-none",
                                                    session.selectedFileType === card.type
                                                        ? "border-indigo-500 bg-indigo-50/30 shadow-sm shadow-indigo-100"
                                                        : "border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm"
                                                )}
                                            >
                                                {/* 图标区 */}
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                    session.selectedFileType === card.type ? "bg-indigo-100" : "bg-slate-100"
                                                )}>
                                                    {card.icon === 'doc' && <FileText size={18} className={session.selectedFileType === card.type ? "text-indigo-600" : "text-slate-500"} />}
                                                    {card.icon === 'single' && <Globe size={18} className={session.selectedFileType === card.type ? "text-indigo-600" : "text-slate-500"} />}
                                                    {card.icon === 'multi' && <MonitorSmartphone size={18} className={session.selectedFileType === card.type ? "text-indigo-600" : "text-slate-500"} />}
                                                    {card.icon === 'app' && <Smartphone size={18} className={session.selectedFileType === card.type ? "text-indigo-600" : "text-slate-500"} />}
                                                </div>
                                                {/* 文字区 */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-800 text-[13px] truncate">{card.title}</div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">{card.subtitle}</div>
                                                </div>
                                                {/* 右侧预览占位色块（模拟图2效果） */}
                                                <div className={cn(
                                                    "w-14 h-10 rounded-lg shrink-0 overflow-hidden",
                                                    card.icon === 'app' ? "bg-slate-900" : "bg-gradient-to-br from-indigo-400 to-purple-500"
                                                )}>
                                                    <div className="w-full h-full flex items-center justify-center opacity-60">
                                                        {card.icon === 'app' && <Smartphone size={16} className="text-white" />}
                                                        {card.icon !== 'app' && <Monitor size={14} className="text-white" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                                </div>
                            ))}

                            <div ref={chatEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Chat Input Console - Capsule Style */}
                    <div className="p-4 bg-white/40 backdrop-blur-xl pb-8 relative z-30 border-t border-slate-50">
                        <div className="max-w-2xl mx-auto relative group">
                            <div className="bg-white border border-slate-200 rounded-[24px] shadow-xl shadow-slate-200/10 px-4 py-3 transition-all duration-300 group-focus-within:border-slate-400 group-focus-within:shadow-2xl group-focus-within:shadow-slate-200/30">
                                {capturedImages.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {capturedImages.map((img: any) => (
                                            <div key={img.id} className="relative group/img w-14 h-14 rounded-xl border border-slate-100 overflow-hidden">
                                                <img src={img.url} alt="captured" className="w-full h-full object-cover" />
                                                <button onClick={() => setCapturedImages((prev: any) => prev.filter((i: any) => i.id !== img.id))} className="absolute top-1 right-1 bg-slate-900 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition shadow-lg">
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-end gap-3">
                                    <div className="flex-1 min-h-[44px] flex flex-col justify-center">
                                        <textarea
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder="Ask a question or make a change..."
                                            className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-[14px] text-slate-800 placeholder:text-slate-400 resize-none py-1 max-h-32 overflow-y-hidden"
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pb-1">
                                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-all active:scale-90">
                                            <Paperclip size={18} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!inputMessage.trim() && capturedImages.length === 0}
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                                inputMessage.trim() || capturedImages.length > 0
                                                    ? "bg-slate-900 text-white scale-100 hover:scale-105 active:scale-95 shadow-lg"
                                                    : "bg-slate-100 text-slate-300 scale-95 opacity-50"
                                            )}
                                        >
                                            <ArrowUp size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ) : (
                    <div className="bg-[#FAFAFA] border-r border-slate-100 flex flex-col items-center py-4 shrink-0 relative z-20 transition-all duration-300 w-14">
                        <button onClick={() => setIsChatOpen(true)} title={tr('展开助手')} className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors">
                            <PanelLeft size={18} />
                        </button>
                    </div>
                )}

                {/* Main Right Content (Stretching remaining space) */}
                < div className="flex-1 flex flex-col min-w-0 bg-white relative z-10" >
                    {activeMessage === 'terminal' ? (
                        <div className="flex-1 bg-white relative flex flex-col h-full">
                            {/* Terminal Single Merged Top Bar */}
                            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-5 shrink-0 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="3" rx="2" /><path d="M12 18h.01" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800">{tr('墨刀AI的虚拟电脑')}</span>
                                    <div className="w-px h-4 bg-gray-200 mx-1" />
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-600 font-medium">
                                        <Edit3 size={12} className="text-gray-400" />
                                        {tr('已完成编辑')} <span className="text-gray-500">{activeTerminalFile}</span>
                                    </div>
                                </div>
                                <button onClick={() => setActiveMessage('html')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400">
                                    <X size={16} />
                                </button>
                            </div>
                            {/* Terminal Body */}
                            <ScrollArea className="flex-1 bg-white p-8 relative">
                                <div className="max-w-4xl">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                                        {isEnglish ? 'Prodes AI UI specification review' : '墨刀AI平台UI设计规范评审报告'}
                                    </h1>
                                    <div className="text-sm font-medium text-gray-500 mb-8 pb-8 border-b border-gray-100">
                                        UI Specification &amp; Visual Design Review <br />{isEnglish ? 'Review date: 2026-02-26' : '评审日期：2026年02月26日'}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">{isEnglish ? 'Executive summary' : '执行摘要'}</h2>
                                    <h3 className="text-base font-bold text-gray-700 mb-2">{isEnglish ? 'Scope & inputs' : '评审范围与输入'}</h3>
                                    <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                                        {isEnglish
                                            ? 'This review is based on the provided AI tool web UI screenshots. The page is identified as the Prodes AI home, including top navigation, the central interaction area (assistant greeting, prompt input, quick actions), and the featured examples section. The review focuses on visual consistency and usability.'
                                            : '本次评审基于提供的AI辅助工具网页界面截图进行。通过识图分析，界面被识别为"墨刀AI"平台的首页，包含顶部导航、中部主交互区（智能体问候、功能输入框、快捷功能入口）以及底部的精选案例展示区。评审聚焦于视觉规范与用户体验的五维度分析。'}
                                    </p>
                                    <h3 className="text-base font-bold text-gray-700 mb-2">{isEnglish ? 'Key findings' : '核心结论'}</h3>
                                    <p className="text-[14px] text-gray-600 leading-relaxed mb-8">
                                        {isEnglish
                                            ? <>Overall the UI is modern and clean with clear hierarchy and focus. Key strengths include structured layout and tech-accent color usage. Main opportunities are spacing in the bottom area, consistency of visual cues, and accessibility details. Overall score: <strong className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">78/100</strong>.</>
                                            : <>界面整体呈现现代简约的扁平化设计风格，视觉层级清晰，核心交互区聚焦。主要亮点在于清晰的布局结构和科技感的色彩点缀。优化空间主要集中在底部区域留白、辅助功能的视觉引导一致性以及可访问性细节上。综合评分为 <strong className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">78/100</strong>。</>}
                                    </p>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 mt-10">{isEnglish ? 'Overall score' : '综合评分'}</h2>
                                    <h3 className="text-base font-bold text-gray-700 mb-4">{isEnglish ? 'Total: 78/100' : '总体评分：78/100'}</h3>
                                    <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                                        {isEnglish
                                            ? 'The visual foundation is solid, with a simple and clear design. The palette and layout work well, but there is clear room to improve detail consistency, spacing rhythm, and accessibility. Addressing these will significantly increase perceived quality and usability.'
                                            : '界面视觉基础良好，遵循了简约清晰的设计原则。色彩方案和布局结构表现出色，但在细节一致性、留白节奏和可访问性方面存在明确的优化空间，提升后将显著增强专业感和易用性。'}
                                    </p>
                                </div>
                            </ScrollArea>
                        </div>
                    ) : activeMessage.startsWith('document_') ? (
                        // ===== 文档视图 =====
                        (() => {
                            const docSessionId = activeMessage.replace('document_', '');
                            const docSession = sessions.find(s => s.id === docSessionId);
                            const docTitle = docSession ? `${docSession.prompt.slice(0, 16)} ${tr('设计评审')}` : tr('设计评审文档');
                            return (
                                <div className="flex-1 bg-white relative flex flex-col h-full">
                                    {/* Doc Top Bar */}
                                    <div className="h-14 border-b border-gray-100 flex items-center justify-between px-5 shrink-0 bg-white">
                                        {/* 左侧：文档图标 + 标题 */}
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                                                <FileText size={14} className="text-indigo-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-800 truncate">{docTitle}</span>
                                        </div>
                                        {/* 右侧：操作按钮一行排列 */}
                                        <div className="flex items-center gap-2 shrink-0 ml-4">
                                            {/* 分享按钮 (图2样式) */}
                                            <button className="h-8 px-4 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[12px] transition active:scale-95">
                                                <Share size={14} strokeWidth={2.5} />
                                                <span>{tr('分享')}</span>
                                            </button>
                                            {/* 复制按钮 (图2样式) */}
                                            <button title={tr('复制')} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition active:scale-95">
                                                <Copy size={14} strokeWidth={2.5} />
                                            </button>
                                            {/* 下载按钮 (图2样式) */}
                                            <button title={tr('下载')} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition active:scale-95">
                                                <Download size={14} strokeWidth={2.5} />
                                            </button>
                                            
                                            <div className="w-px h-4 bg-gray-200 mx-1" />
                                            
                                            {/* 全屏和关闭 (极简样式) */}
                                            <button title={tr('全屏')} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition active:scale-95">
                                                <Maximize2 size={15} strokeWidth={2} />
                                            </button>
                                            <button
                                                title={tr('关闭')}
                                                onClick={() => setActiveMessage(docSessionId)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition active:scale-95"
                                            >
                                                <X size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Doc Body */}
                                    <ScrollArea className="flex-1 bg-white">
                                        <div className="max-w-3xl mx-auto px-12 py-10">
                                            <h1 className="text-[28px] font-black text-gray-900 tracking-tight mb-2">
                                                {isEnglish ? 'Prodes AI UI specification review' : '墨刀AI平台UI设计规范评审报告'}
                                            </h1>
                                            <div className="text-sm font-medium text-gray-400 mb-8 pb-8 border-b border-gray-100">
                                                UI Specification &amp; Visual Design Review &nbsp;·&nbsp; {isEnglish ? 'Review date: 2026-02-26' : '评审日期：2026年02月26日'}
                                            </div>

                                            <h2 className="text-lg font-bold text-gray-800 mb-4 mt-8">{isEnglish ? 'Executive summary' : '执行摘要'}</h2>
                                            <h3 className="text-sm font-bold text-gray-700 mb-2">{isEnglish ? 'Scope & inputs' : '评审范围与输入'}</h3>
                                            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                                                {isEnglish
                                                    ? 'This review is based on the provided AI tool web UI screenshots. The page is identified as the Prodes AI home, including top navigation, the central interaction area (assistant greeting, prompt input, quick actions), and the featured examples section. The review focuses on visual consistency and usability.'
                                                    : '本次评审基于提供的AI辅助工具网页界面截图进行。通过识图分析，界面被识别为"墨刀AI"平台的首页，包含顶部导航、中部主交互区（智能体问候、功能输入框、快捷功能入口）以及底部的精选案例展示区。评审聚焦于视觉规范与用户体验的五维度分析。'}
                                            </p>
                                            <h3 className="text-sm font-bold text-gray-700 mb-2">{isEnglish ? 'Key findings' : '核心结论'}</h3>
                                            <p className="text-[14px] text-gray-600 leading-relaxed mb-8">
                                                {isEnglish
                                                    ? <>Overall the UI is modern and clean with clear hierarchy and focus. Key strengths include structured layout and tech-accent color usage. Main opportunities are spacing in the bottom area, consistency of visual cues, and accessibility details. Overall score: <strong className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">78/100</strong>.</>
                                                    : <>界面整体呈现现代简约的扁平化设计风格，视觉层级清晰，核心交互区聚焦。主要亮点在于清晰的布局结构和科技感的色彩点缀。优化空间主要集中在底部区域留白、辅助功能的视觉引导一致性以及可访问性细节上。综合评分为 <strong className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">78/100</strong>。</>}
                                            </p>

                                            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 mt-10">{isEnglish ? 'Overall score' : '综合评分'}</h2>
                                            <h3 className="text-sm font-bold text-gray-700 mb-2">{isEnglish ? 'Total: 78/100' : '总体评分：78/100'}</h3>
                                            <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                                                {isEnglish
                                                    ? 'The visual foundation is solid, with a simple and clear design. The palette and layout work well, but there is clear room to improve detail consistency, spacing rhythm, and accessibility. Addressing these will significantly increase perceived quality and usability.'
                                                    : '界面视觉基础良好，遵循了简约清晰的设计原则。色彩方案和布局结构表现出色，但在细节一致性、留白节奏和可访问性方面存在明确的优化空间，提升后将显著增强专业感和易用性。'}
                                            </p>

                                            <div className="overflow-x-auto mb-8">
                                                <table className="w-full text-[13px] border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="text-left px-4 py-3 font-bold text-gray-700 border border-gray-100 rounded-tl-lg">{isEnglish ? 'Dimension' : '评审维度'}</th>
                                                            <th className="text-center px-4 py-3 font-bold text-gray-700 border border-gray-100">{isEnglish ? 'Score (0-100)' : '评分(0-100)'}</th>
                                                            <th className="text-center px-4 py-3 font-bold text-gray-700 border border-gray-100">{isEnglish ? 'Weight' : '权重'}</th>
                                                            <th className="text-center px-4 py-3 font-bold text-gray-700 border border-gray-100">{isEnglish ? 'Weighted' : '加权得分'}</th>
                                                            <th className="text-left px-4 py-3 font-bold text-gray-700 border border-gray-100 rounded-tr-lg">{isEnglish ? 'Notes' : '简要说明'}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {[
                                                            isEnglish
                                                                ? { dim: 'Visual consistency', score: 75, weight: '25%', weighted: 18.75, note: 'Colors and typography are mostly consistent; some components vary.' }
                                                                : { dim: '视觉一致性', score: 75, weight: '25%', weighted: 18.75, note: '色彩、字体基本统一，局部控件差异较大' },
                                                            isEnglish
                                                                ? { dim: 'Layout & spacing', score: 72, weight: '20%', weighted: 14.4, note: 'Bottom section feels crowded; spacing rhythm can improve.' }
                                                                : { dim: '布局与留白', score: 72, weight: '20%', weighted: 14.4, note: '底部内容区域偏拥挤，整体节奏待改善' },
                                                            isEnglish
                                                                ? { dim: 'Color aesthetics', score: 85, weight: '20%', weighted: 17.0, note: 'Primary palette is clear; gradients add a tech feel.' }
                                                                : { dim: '色彩美学', score: 85, weight: '20%', weighted: 17.0, note: '主色调清晰，渐变点缀科技感强' },
                                                            isEnglish
                                                                ? { dim: 'Typographic hierarchy', score: 80, weight: '20%', weighted: 16.0, note: 'Headings and body are clear; small text readability is slightly low.' }
                                                                : { dim: '排版层级', score: 80, weight: '20%', weighted: 16.0, note: '标题与正文层级清晰，小字可读性略低' },
                                                            isEnglish
                                                                ? { dim: 'Accessibility', score: 62, weight: '15%', weighted: 9.3, note: 'Contrast is insufficient; missing focus indicators.' }
                                                                : { dim: '可访问性', score: 62, weight: '15%', weighted: 9.3, note: '对比度不足，缺少焦点指示器' },
                                                        ].map((row, i) => (
                                                            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                                <td className="px-4 py-3 border border-gray-100 font-medium text-gray-700">{row.dim}</td>
                                                                <td className="px-4 py-3 border border-gray-100 text-center font-bold text-indigo-600">{row.score}</td>
                                                                <td className="px-4 py-3 border border-gray-100 text-center text-gray-500">{row.weight}</td>
                                                                <td className="px-4 py-3 border border-gray-100 text-center text-gray-600">{row.weighted}</td>
                                                                <td className="px-4 py-3 border border-gray-100 text-gray-500">{row.note}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 mt-10">{isEnglish ? 'Recommendation priority' : '优化建议优先级'}</h2>
                                            <div className="space-y-3 mb-8">
                                                {[
                                                    isEnglish
                                                        ? { level: 'P0', color: 'bg-red-100 text-red-600', label: 'Fix now', text: 'Bottom area is cramped. Increase padding to at least 16px to reduce visual crowding.' }
                                                        : { level: 'P0', color: 'bg-red-100 text-red-600', label: '立即优化', text: '底部区域内容间距过小，需增大 padding 至少 16px，避免视觉拥挤。' },
                                                    isEnglish
                                                        ? { level: 'P1', color: 'bg-amber-100 text-amber-600', label: 'Fix soon', text: 'Accessibility contrast: adjust secondary gray text to meet WCAG AA (≥ 4.5:1).' }
                                                        : { level: 'P1', color: 'bg-amber-100 text-amber-600', label: '近期优化', text: '可访问性对比度问题：灰色辅助文字需调整至 WCAG AA 标准（至少 4.5:1）。' },
                                                    isEnglish
                                                        ? { level: 'P2', color: 'bg-blue-100 text-blue-600', label: 'Plan later', text: 'Unify card corner radius to 12px for consistent global styling.' }
                                                        : { level: 'P2', color: 'bg-blue-100 text-blue-600', label: '中期规划', text: '统一所有卡片组件的圆角半径为 12px，保持全局一致性。' },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                        <span className={`shrink-0 text-[11px] font-black px-2 py-0.5 rounded-md ${item.color}`}>{item.level}</span>
                                                        <div>
                                                            <span className="text-[13px] font-bold text-gray-700 mr-2">{item.label}</span>
                                                            <span className="text-[13px] text-gray-500">{item.text}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </div>
                            );
                        })()
                    ) : (
                        <>
                            {/* View Toolbar */}
                            <div className="h-14 border-b border-slate-50 flex items-center px-4 shrink-0 bg-white">
                                <div className="flex items-center gap-1">
                                    <div className="relative group/tab">
                                        <button
                                            onClick={() => setActiveTab('preview')}
                                            className={cn(
                                                "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                                activeTab === 'preview'
                                                    ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                            )}>
                                            <Image size={14} />
                                            {activeTab === 'preview' && <span>{tr('预览')}</span>}
                                        </button>
                                        {activeTab !== 'preview' && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded opacity-0 group-hover/tab:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                {tr('预览')}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="relative group/tab">
                                        <button
                                            onClick={() => setActiveTab('edit')}
                                            className={cn(
                                                "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                                activeTab === 'edit'
                                                    ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                            )}>
                                            <Edit3 size={14} />
                                            {activeTab === 'edit' && <span>{tr('编辑')}</span>}
                                        </button>
                                        {activeTab !== 'edit' && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded opacity-0 group-hover/tab:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                {tr('编辑')}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative group/tab">
                                        <button
                                            onClick={() => setActiveTab('code')}
                                            className={cn(
                                                "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                                activeTab === 'code'
                                                    ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                    : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                            )}>
                                            <FileText size={14} />
                                            {activeTab === 'code' && <span>{tr('代码')}</span>}
                                        </button>
                                        {activeTab !== 'code' && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded opacity-0 group-hover/tab:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                {tr('代码')}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('config')}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                            activeTab === 'config'
                                                ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                        )}>
                                        <Settings size={14} />
                                        {activeTab === 'config' && <span>{tr('配置')}</span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('analytics')}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                            activeTab === 'analytics'
                                                ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                        )}>
                                        <BarChart3 size={14} />
                                        {activeTab === 'analytics' && <span>{tr('分析')}</span>}
                                    </button>

                                    <div className="relative" ref={versionMenuRef}>
                                        <button
                                            onClick={(e) => { 
                                                e.stopPropagation();
                                                setShowVersionMenu(v => !v); 
                                                setShowSharePanel(false);
                                                setShowPublishModal(false);
                                                setShowDeviceMenu(false);
                                            }}
                                            className="flex items-center gap-1 px-2.5 h-7 text-[12px] font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors border border-slate-100 ml-2 whitespace-nowrap shrink-0 shadow-sm"
                                        >
                                            <span>{activeVersion}</span>
                                            <ChevronDown size={12} className="text-slate-400" />
                                        </button>
                                        {showVersionMenu && (
                                            <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 w-[130px] animate-in fade-in slide-in-from-top-1 duration-150">
                                                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">{tr('历史版本')}</div>
                                                {[
                                                    { v: 'V3', time: '刚刚' },
                                                    { v: 'V2', time: isEnglish ? '2 hr ago' : '2小时前' },
                                                    { v: 'V1', time: isEnglish ? 'Yesterday' : '昨天' },
                                                ].map(item => (
                                                    <button
                                                        key={item.v}
                                                        onClick={() => { setActiveVersion(item.v); setShowVersionMenu(false); }}
                                                        className={cn(
                                                            "w-full flex items-center justify-between px-3 py-2 text-[12px] transition hover:bg-slate-50",
                                                            activeVersion === item.v ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"
                                                        )}
                                                    >
                                                        <span className="font-bold">{item.v}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-slate-400">{item.time}</span>
                                                            {activeVersion === item.v && <Check size={11} className="text-indigo-500" />}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                                    <button className="h-8 px-4 flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold text-[12px] transition shrink-0 hover:bg-indigo-100 active:scale-95 shadow-sm shadow-indigo-100/50 whitespace-nowrap">
                                        <Share2 size={13} strokeWidth={2.5} className="text-indigo-500" /> {tr('导出至墨刀')}
                                    </button>

                                    {/* 分享按钮 + 下拉面板 */}
                                    <div className="relative shrink-0" ref={sharePanelRef}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "h-8 px-4 text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 font-bold text-[12px] rounded-lg transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap",
                                                showSharePanel && "bg-slate-200 border-slate-300"
                                            )}
                                            onClick={(e) => { 
                                                e.stopPropagation();
                                                setShowSharePanel(v => !v); 
                                                setShowPublishModal(false); 
                                                setShowDeviceMenu(false);
                                                setShowVersionMenu(false);
                                            }}
                                        >
                                            <Share size={13} strokeWidth={2.5} className="text-slate-600" /> {tr('分享')}
                                        </Button>
                                        {showSharePanel && shareDropdown}
                                    </div>

                                    {/* 发布按钮 */}
                                    <div className="relative shrink-0" ref={publishPanelRef}>
                                        <Button
                                            onClick={(e) => { 
                                                e.stopPropagation();
                                                setShowPublishModal(v => !v); 
                                                setShowSharePanel(false); 
                                                setShowDeviceMenu(false);
                                                setShowVersionMenu(false);
                                            }}
                                            className="bg-black hover:bg-slate-800 text-white rounded-lg h-8 px-5 text-[12px] font-black shadow-md shadow-black/10 transition active:scale-95 border border-white/5 whitespace-nowrap"
                                        >
                                            {tr('发布')}
                                        </Button>
                                        {showPublishModal && publishDropdown}
                                    </div>

                                    <div className="flex items-center ml-1 pl-2 gap-0.5">
                                        <div className="relative group flex justify-center">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-900 hover:text-white transition text-slate-700 active:scale-95"><Maximize2 size={15} strokeWidth={2.25} /></button>
                                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('全屏')}</div>
                                        </div>
                                        <div className="relative group flex justify-center">
                                            <button onClick={() => { }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 transition text-slate-700 active:scale-95"><X size={16} strokeWidth={2.5} /></button>
                                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('关闭')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex overflow-hidden bg-white relative">
                                {/* Left Panel: File Tree */}
                                {(() => {
                                    const cs = sessions.find(s => s.id === activeMessage);
                                    const showDir = getShowDir(cs);
                                    const hasDir = canHaveDir(cs);
                                    const isAppCodeDir = cs?.selectedFileType === 'app' && activeTab === 'code';
                                    const isMultiDir = cs?.selectedFileType === 'multi';

                                    // config tab 用原逻辑
                                    if (activeTab === 'config') {
                                        return (
                                            <div className="w-[180px] bg-[#FAFAFA] flex flex-col shrink-0 order-0 border-r border-slate-100">
                                                <div className="h-14 flex items-center px-5 border-b border-slate-100">
                                                    <div className="text-[12px] font-black text-slate-900 tracking-wider uppercase">{tr('设置类别')}</div>
                                                </div>
                                                <ScrollArea className="flex-1">
                                                    <div className="p-2 space-y-0.5">
                                                        <FileItem name="Overview" active={true} />
                                                        <FileItem name="AI" />
                                                        <FileItem name="Custom emails" />
                                                        <FileItem name="Database" />
                                                        <FileItem name="Users" />
                                                        <FileItem name="Storage" />
                                                        <FileItem name="Secrets" />
                                                        <FileItem name="Edge functions" />
                                                        <FileItem name="SQL editor" />
                                                        <FileItem name="Logs" />
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        );
                                    }

                                    // 没有目录的情况不渲染
                                    if (!hasDir) return null;

                                    // 目录收起态：左侧不渲染任何东西，展开按钮移到右侧toolbar
                                    if (!showDir) return null;

                                    // 目录展开态
                                    return (
                                        <div className="w-[180px] bg-[#FAFAFA] flex flex-col shrink-0 transition-all duration-300 order-0 border-r border-slate-100">
                                            <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100">
                                                <div className="text-[12px] font-black text-slate-900 tracking-wider">{tr('目录')}</div>
                                                {/* 收起箭头 ← 图2样式 */}
                                                <button
                                                    onClick={() => setIsDirOpen(false)}
                                                    className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-all"
                                                    title={tr('收起目录')}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                                </button>
                                            </div>
                                            <ScrollArea className="flex-1">
                                                <div className="p-2 space-y-0.5">
                                                    {isMultiDir ? (
                                                        <>
                                                            <div onClick={() => setActiveFile('index.html')}><FileItem name="index.html" active={activeFile === 'index.html'} /></div>
                                                            <div onClick={() => setActiveFile('cart.html')}><FileItem name="cart.html" active={activeFile === 'cart.html'} /></div>
                                                            <div onClick={() => setActiveFile('detail.html')}><FileItem name="detail.html" active={activeFile === 'detail.html'} /></div>
                                                            <div onClick={() => setActiveFile('profile.html')}><FileItem name="profile.html" active={activeFile === 'profile.html'} /></div>
                                                        </>
                                                    ) : isAppCodeDir ? (
                                                        <FolderTree activeFile={activeFile} onSelectFile={setActiveFile} />
                                                    ) : null}
                                                </div>
                                            </ScrollArea>
                                        </div>
                                    );
                                })()}

                                {/* Main Content: Preview Area */}
                                <div className="flex-1 bg-white overflow-hidden relative flex flex-col order-1">
                                    {/* Browser/Simulator Chrome */}
                                    {activeTab !== 'config' && activeTab !== 'analytics' && (
                                        <div className="h-14 border-b border-slate-50 flex items-center px-4 bg-transparent shrink-0 relative gap-2">
                                            {/* 目录收起时在此处显示展开按钮（图4样式，与截图优化同行） */}
                                            {(() => {
                                                const cs = sessions.find(s => s.id === activeMessage);
                                                if (!isDirOpen && canHaveDir(cs)) {
                                                    return (
                                                        <button
                                                            onClick={() => setIsDirOpen(true)}
                                                            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-[12px] font-bold transition-all active:scale-95 shrink-0 shadow-sm"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                                                            {tr('目录')}
                                                        </button>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {/* 截图优化按钮 & 地址栏：代码tab下隐藏；代码tab显示当前文件名 */}
                                            {activeTab === 'code' && (
                                                <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[12px] font-mono font-bold shrink-0 shadow-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                                                    {activeFile}
                                                </div>
                                            )}
                                            {activeTab !== 'code' && (
                                                <>
                                                    <div className="flex items-center gap-2 text-slate-600 shrink-0">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button onClick={() => { setShowScreenshotMode(true); setComments([]); }} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-900 hover:text-white bg-white border border-slate-200 text-slate-600 shadow-sm transition-all active:scale-90 cursor-pointer">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="bottom" className="bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md border-transparent">
                                                                {tr('截图优化')}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <div className="flex-1 max-w-[280px] min-w-[220px] mx-auto flex">
                                                        <div className="w-full bg-slate-100/50 border border-slate-200 hover:border-slate-300 transition-colors rounded-full h-8 flex items-center justify-between text-[11px] text-slate-600 font-bold px-2 shadow-inner">
                                                            {/* 设备切换下拉 */}
                                                            <div className="relative group/device" ref={deviceMenuRef}>
                                                                <button
                                                                    onClick={() => {
                                                                        setShowPageMenu(false);
                                                                        setShowDeviceMenu(v => !v);
                                                                    }}
                                                                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition flex items-center gap-0.5"
                                                                >
                                                                    {deviceMode === 'mobile' && <Smartphone size={13} />}
                                                                    {deviceMode === 'pad' && <Tablet size={13} />}
                                                                    {deviceMode === 'pc' && <Monitor size={13} />}
                                                                    <ChevronDown size={9} className="text-slate-400" />
                                                                </button>
                                                                {!showDeviceMenu && (
                                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/device:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                                        {tr('切换演示设备')}
                                                                    </div>
                                                                )}
                                                                {showDeviceMenu && (
                                                                    <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 w-[120px] animate-in fade-in slide-in-from-top-1 duration-150">
                                                                        {/* PC 端 */}
                                                                        <button
                                                                            onClick={() => { setDeviceMode('pc'); setShowDeviceMenu(false); }}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition hover:bg-slate-50",
                                                                                deviceMode === 'pc' ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"
                                                                            )}
                                                                        >
                                                                            <Monitor size={13} />
                                                                            {tr('PC 端')}
                                                                            {deviceMode === 'pc' && <Check size={11} className="ml-auto text-indigo-500" />}
                                                                        </button>
                                                                        {/* 移动端 */}
                                                                        <button
                                                                            onClick={() => { setDeviceMode('mobile'); setShowDeviceMenu(false); }}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition hover:bg-slate-50",
                                                                                deviceMode === 'mobile' ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"
                                                                            )}
                                                                        >
                                                                            <Smartphone size={13} />
                                                                            {tr('移动端')}
                                                                            {deviceMode === 'mobile' && <Check size={11} className="ml-auto text-indigo-500" />}
                                                                        </button>
                                                                        {/* Pad 端 */}
                                                                        <button
                                                                            onClick={() => { setDeviceMode('pad'); setShowDeviceMenu(false); }}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition hover:bg-slate-50",
                                                                                deviceMode === 'pad' ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"
                                                                            )}
                                                                        >
                                                                            <Tablet size={13} />
                                                                            {tr('Pad 端')}
                                                                            {deviceMode === 'pad' && <Check size={11} className="ml-auto text-indigo-500" />}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="w-px h-3.5 bg-slate-200 mx-1" />
                                                            <div className="relative group/address flex-1 flex">
                                                                <DropdownMenu
                                                                    open={showPageMenu}
                                                                    modal={false}
                                                                    onOpenChange={(v) => {
                                                                        setShowPageMenu(v);
                                                                        if (v) setShowDeviceMenu(false);
                                                                    }}
                                                                >
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button
                                                                            onClick={() => {
                                                                                setShowDeviceMenu(false);
                                                                            }}
                                                                            className="flex-1 truncate text-left hover:bg-slate-200 px-1.5 py-1 rounded transition text-slate-600 font-mono w-[110px] items-center block"
                                                                        >
                                                                            /home/{activeFile}
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="start" className="w-[180px]">
                                                                        {(() => {
                                                                            const current = sessions.find(s => s.id === activeMessage);
                                                                            const files = current?.selectedFileType === 'single'
                                                                                ? [activeFile]
                                                                                : ['index.html', 'cart.html', 'detail.html', 'profile.html'];
                                                                            return files.map(f => (
                                                                                <DropdownMenuItem key={f} onClick={() => setActiveFile(f)} className="text-[12px] font-mono cursor-pointer">
                                                                                    /home/{f}
                                                                                </DropdownMenuItem>
                                                                            ));
                                                                        })()}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2 py-1 rounded opacity-0 group-hover/address:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                                    {tr('切换页面')}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0 ml-1">
                                                                <div className="relative group flex justify-center">
                                                                    <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-800 transition"><RotateCw size={12} strokeWidth={2.5}/></button>
                                                                    <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">{tr('刷新')}</div>
                                                                </div>
                                                                <div className="relative group flex justify-center">
                                                                    <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-800 transition"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg></button>
                                                                    <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">{tr('新窗口打开')}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            {(() => {
                                                const current = sessions.find(s => s.id === activeMessage);
                                                const isApp = current?.selectedFileType === 'app';
                                                const isSingle = current?.selectedFileType === 'single';
                                                const isMulti = current?.selectedFileType === 'multi';

                                                return (
                                                    <div className="absolute right-4 flex text-slate-600 gap-1.5">
                                                        {/* 编辑模式独有图标群组 */}
                                                        {activeTab === 'edit' ? (
                                                            <>
                                                                {/* 云端保存状态 */}
                                                                <div className="relative group flex justify-center items-center mr-1">
                                                                    <div className="w-8 h-8 flex items-center justify-center rounded-lg border-transparent transition text-slate-700 relative">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                                                                        <div className="absolute right-0 bottom-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"></div>
                                                                    </div>
                                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('已保存至云端')}</div>
                                                                </div>
                                                                {/* 撤销 */}
                                                                <div className="relative group flex justify-center">
                                                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border-transparent transition text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                                                                    </button>
                                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('撤销上一步')}</div>
                                                                </div>
                                                                {/* 重做 */}
                                                                <div className="relative group flex justify-center">
                                                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border-transparent transition text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
                                                                    </button>
                                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('重做')}</div>
                                                                </div>
                                                                {/* 下载：编辑多页时下拉；编辑单页/应用时直接下载 */}
                                                                {isApp ? (
                                                                    <div className="relative group flex justify-center ml-0.5">
                                                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95">
                                                                            <Download size={14} strokeWidth={2.25} />
                                                                        </button>
                                                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('下载代码')}</div>
                                                                    </div>
                                                                ) : isSingle ? (
                                                                    <div className="relative group flex justify-center ml-0.5">
                                                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95">
                                                                            <Download size={14} strokeWidth={2.25} />
                                                                        </button>
                                                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('下载代码')}</div>
                                                                    </div>
                                                                ) : isMulti ? (
                                                                    <div className="relative group flex justify-center ml-0.5">
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95">
                                                                                    <Download size={14} strokeWidth={2.25} />
                                                                                </button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end" className="w-[150px]">
                                                                                <DropdownMenuItem className="text-[12px] cursor-pointer flex items-center gap-2">
                                                                                    <Download size={13} />
                                                                                    {tr('下载当前文件')}
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem className="text-[12px] cursor-pointer flex items-center gap-2">
                                                                                    <Download size={13} />
                                                                                    {tr('下载所有文件')}
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('下载代码')}</div>
                                                                    </div>
                                                                ) : null}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {/* 预览/代码模式右上角工具 */}
                                                                {activeTab === 'preview' ? (
                                                                    // 预览多页：下拉；预览单页/应用：直接下载
                                                                    isApp ? (
                                                                        <div className="relative group flex justify-center">
                                                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95">
                                                                                <Download size={14} strokeWidth={2.25} />
                                                                            </button>
                                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('下载代码')}</div>
                                                                        </div>
                                                                    ) : isSingle ? (
                                                                        <div className="relative group flex justify-center">
                                                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95">
                                                                                <Download size={14} strokeWidth={2.25} />
                                                                            </button>
                                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('下载代码')}</div>
                                                                        </div>
                                                                    ) : isMulti ? (
                                                                        <div className="relative group flex justify-center">
                                                                            <DropdownMenu>
                                                                                <DropdownMenuTrigger asChild>
                                                                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95">
                                                                                        <Download size={14} strokeWidth={2.25} />
                                                                                    </button>
                                                                                </DropdownMenuTrigger>
                                                                                <DropdownMenuContent align="end" className="w-[150px]">
                                                                                    <DropdownMenuItem className="text-[12px] cursor-pointer flex items-center gap-2">
                                                                                        <Download size={13} />
                                                                                        {tr('下载当前文件')}
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuItem className="text-[12px] cursor-pointer flex items-center gap-2">
                                                                                        <Download size={13} />
                                                                                        {tr('下载所有文件')}
                                                                                    </DropdownMenuItem>
                                                                                </DropdownMenuContent>
                                                                            </DropdownMenu>
                                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('下载代码')}</div>
                                                                        </div>
                                                                    ) : null
                                                                ) : (
                                                                    <>
                                                                        {/* 代码tab：复制 + 下载（单页：直接下载；多页/应用：下拉下载当前/所有） */}
                                                                        <div className="relative group flex justify-center">
                                                                            <button
                                                                                onClick={async () => {
                                                                                    const current = sessions.find(s => s.id === activeMessage);
                                                                                    const code = (current?.streamingCode || current?.generatedHtml || '').trim();
                                                                                    if (!code) return;
                                                                                    try {
                                                                                        await navigator.clipboard.writeText(code);
                                                                                        showToast(tr('代码复制成功'));
                                                                                    } catch {
                                                                                        showToast(tr('复制失败，请重试'), 'error');
                                                                                    }
                                                                                }}
                                                                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95"
                                                                            >
                                                                                <Copy size={13} strokeWidth={2.25} />
                                                                            </button>
                                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('复制代码')}</div>
                                                                        </div>

                                                                        {isSingle ? (
                                                                            <div className="relative group flex justify-center ml-0.5">
                                                                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95">
                                                                                    <Download size={14} strokeWidth={2.25} />
                                                                                </button>
                                                                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('下载代码')}</div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="relative group flex justify-center ml-0.5">
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild>
                                                                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95">
                                                                                            <Download size={14} strokeWidth={2.25} />
                                                                                        </button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent align="end" className="w-[150px]">
                                                                                        <DropdownMenuItem className="text-[12px] cursor-pointer flex items-center gap-2">
                                                                                            <Download size={13} />
                                                                                                {tr('下载当前文件')}
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem className="text-[12px] cursor-pointer flex items-center gap-2">
                                                                                            <Download size={13} />
                                                                                                {tr('下载所有文件')}
                                                                                        </DropdownMenuItem>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{tr('下载代码')}</div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                        {/* 展开目录按钮已移到左侧，此处移除 */}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                    {/* Content based on active tab */}
                                    {renderRightPanelContent()}
                                </div>
                            </div>
                        </>
                    )
                    }

                </div >
            </div >

            {/* ======= 截图优化模态 ======= */}
            {showScreenshotMode && (() => {
                const screenshotSession = sessions.find(s => s.id === activeMessage);
                const screenshotHtml = screenshotSession?.generatedHtml || screenshotSession?.streamingCode || '';
                return (
                    <div className="fixed inset-0 z-[200] flex flex-col bg-gray-950">
                        {/* shake keyframes */}
                        <style>{`@keyframes comment-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}.comment-shake{animation:comment-shake 0.45s ease;}`}</style>
                        {/* 顶栏 */}
                        <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 shrink-0 bg-gray-950">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                </div>
                                <span className="text-white text-sm font-semibold">{tr('截图优化')}</span>
                                <span className="text-white text-xs bg-indigo-500/20 text-indigo-200 px-2.5 py-1 rounded-md border border-indigo-500/30">{tr('请框选要调整的区域并告诉AI如何修改')}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const newImg = { id: Date.now(), label: isEnglish ? `Shot ${capturedImages.length + 1}` : `截图 ${capturedImages.length + 1}`, comments: comments.map(c => c.text).filter(Boolean) };
                                        setCapturedImages(prev => [...prev, newImg]);
                                        setShowScreenshotMode(false);
                                        setComments([]);
                                    }}
                                    className="h-8 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    {tr('添加到对话')}
                                </button>
                                <button onClick={() => { setShowScreenshotMode(false); setComments([]); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 transition">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* 画布区域 */}
                        <div className="flex-1 overflow-auto bg-gray-900/60">
                            <div
                                data-canvas="true"
                                className="relative w-full min-h-full select-none cursor-crosshair"
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                            >
                                {/* 实际预览内容 - 与预览 tab 一致的 iframe */}
                                {screenshotHtml ? (
                                    <iframe
                                        srcDoc={screenshotHtml}
                                        sandbox="allow-scripts allow-same-origin"
                                        className="w-full min-h-screen border-none pointer-events-none"
                                        style={{ height: '100vh' }}
                                        title="screenshot-preview"
                                    />
                                ) : (
                                    <div className="w-full h-screen flex items-center justify-center text-white/40 text-sm">{tr('暂无可预览的内容')}</div>
                                )}

                                {/* 绘制中的实时选框 */}
                                {isDrawing && (
                                    <div
                                        className="absolute border-2 border-indigo-400 bg-indigo-400/10 pointer-events-none z-30 rounded"
                                        style={{ left: Math.min(startPos.x, currentPos.x), top: Math.min(startPos.y, currentPos.y), width: Math.abs(currentPos.x - startPos.x), height: Math.abs(currentPos.y - startPos.y) }}
                                    />
                                )}

                                {/* 已有标注框 */}
                                {comments.map((comment, index) => {
                                    if (comment.confirmed) {
                                        const isActive = activeCommentId === comment.id;
                                        const isHovered = hoveredBadge === comment.id;
                                        // 已确认态：仅显示数字徽章，hover 时显示选框，点击时常显选框和弹出内容
                                        return (
                                            <div
                                                key={comment.id}
                                                className="absolute comment-box-interactive"
                                                style={{ left: comment.rect.x, top: comment.rect.y, width: comment.rect.w, height: comment.rect.h }}
                                            >
                                                {/* 数字徽章 - 始终可见 */}
                                                <div
                                                    className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-50 cursor-pointer"
                                                    onMouseEnter={() => setHoveredBadge(comment.id)}
                                                    onMouseLeave={() => setHoveredBadge(null)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveCommentId(isActive ? null : comment.id);
                                                    }}
                                                >
                                                    {index + 1}
                                                </div>
                                                
                                                {/* hover 或 active 时显示选框与拖拽抓手 */}
                                                {(isHovered || isActive) && (
                                                    <div
                                                        className="absolute inset-0 border-2 border-indigo-400 rounded cursor-grab active:cursor-grabbing z-40"
                                                        onMouseDown={e => {
                                                            e.stopPropagation();
                                                            const canvasRect = (e.currentTarget.closest('[data-canvas]') as HTMLElement)?.getBoundingClientRect();
                                                            if (!canvasRect) return;
                                                            setDraggingComment({ id: comment.id, startMX: e.clientX - canvasRect.left, startMY: e.clientY - canvasRect.top, origX: comment.rect.x, origY: comment.rect.y });
                                                            setActiveCommentId(comment.id);
                                                        }}
                                                    />
                                                )}

                                                {/* active 时显示弹出内容 */}
                                                {isActive && (
                                                    <div
                                                        className={cn("absolute left-0 bg-white rounded-xl shadow-xl p-3 border border-indigo-100 z-50 min-w-[12rem] max-w-xs", comment.rect.y > 300 ? "bottom-full mb-3" : "top-full mt-2")}
                                                        onMouseDown={e => e.stopPropagation()}
                                                    >
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-2">{comment.text}</p>
                                                        <button
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setComments(prev => prev.filter(c => c.id !== comment.id)); 
                                                                setActiveCommentId(null); 
                                                                setHoveredBadge(null); 
                                                            }}
                                                            className="text-[11px] font-bold text-red-500 hover:text-red-700 transition flex items-center gap-1"
                                                        >
                                                            <X size={11} strokeWidth={3} /> 删除
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    // 未确认态（编辑中）
                                    return (
                                        <div
                                            key={comment.id}
                                            className={cn("absolute border-2 border-indigo-500 rounded comment-box-interactive", comment.shaking && "comment-shake")}
                                            style={{ left: comment.rect.x, top: comment.rect.y, width: comment.rect.w, height: comment.rect.h }}
                                        >
                                            {/* 数字徽章 */}
                                            <div className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-50 cursor-default">
                                                {index + 1}
                                            </div>

                                            {/* 框体拖动 - 中心区域抓手 */}
                                            <div
                                                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                                                onMouseDown={e => {
                                                    e.stopPropagation();
                                                    const canvasRect = (e.currentTarget.closest('[data-canvas]') as HTMLElement)?.getBoundingClientRect();
                                                    if (!canvasRect) return;
                                                    setDraggingComment({ id: comment.id, startMX: e.clientX - canvasRect.left, startMY: e.clientY - canvasRect.top, origX: comment.rect.x, origY: comment.rect.y });
                                                }}
                                            />

                                            {/* 右下角调整大小手柄 */}
                                            <div
                                                className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-sm cursor-nwse-resize z-50 flex items-center justify-center"
                                                onMouseDown={e => {
                                                    e.stopPropagation();
                                                    const canvasRect = (e.currentTarget.closest('[data-canvas]') as HTMLElement)?.getBoundingClientRect();
                                                    if (!canvasRect) return;
                                                    setResizingComment({ id: comment.id, startMX: e.clientX - canvasRect.left, startMY: e.clientY - canvasRect.top, origW: comment.rect.w, origH: comment.rect.h });
                                                }}
                                            >
                                                <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 6L6 1M4 6L6 4" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                            </div>

                                            {/* 输入面板 */}
                                            <div
                                                className={cn(
                                                    "absolute bg-white rounded-xl shadow-xl w-[280px] p-3 border border-indigo-100 z-50", 
                                                    // 垂直方向：如果靠下，则向上弹；否则向下弹
                                                    comment.rect.y > window.innerHeight - 250 ? "bottom-full mb-3" : "top-full mt-2", 
                                                    // 水平方向：如果靠右，则向左对齐选框右边缘；否则对齐选框左边缘
                                                    comment.rect.x > window.innerWidth - 300 ? "right-0" : "left-0"
                                                )}
                                                onMouseDown={e => e.stopPropagation()}
                                            >
                                                <textarea
                                                    autoFocus
                                                    value={comment.text}
                                                    onChange={e => {
                                                        const target = e.target;
                                                        target.style.height = 'auto'; // Reset height to recalculate
                                                        const scrollHeight = target.scrollHeight;
                                                        // 假设每行大约 20px（基础高度加上 padding 等）
                                                        // 默认两行，最大五行
                                                        const newHeight = Math.min(Math.max(scrollHeight, 40), 100); 
                                                        target.style.height = `${newHeight}px`;
                                                        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, text: target.value } : c));
                                                    }}
                                                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none min-h-[52px]"
                                                    style={{ height: '52px', overflowY: 'auto' }}
                                                    placeholder="请告诉AI如何修改"
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            if (comment.text.trim()) {
                                                                setComments(prev => prev.map(c => c.id === comment.id ? { ...c, isEditing: false, confirmed: true } : c));
                                                            }
                                                        }
                                                    }}
                                                />
                                                <div className="flex justify-end items-center mt-2.5 gap-3">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setComments(prev => prev.filter(c => c.id !== comment.id)); }}
                                                        className="text-[12px] font-bold text-slate-400 hover:text-slate-600 transition px-2"
                                                    >
                                                        取消
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (comment.text.trim()) {
                                                                setComments(prev => prev.map(c => c.id === comment.id ? { ...c, isEditing: false, confirmed: true } : c));
                                                            } else {
                                                                setComments(prev => prev.filter(c => c.id !== comment.id));
                                                            }
                                                        }}
                                                        className="px-4 py-1.5 bg-indigo-500 text-white text-[12px] font-bold rounded-lg hover:bg-indigo-600 transition active:scale-95 shadow-sm"
                                                    >
                                                        确定
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* (已通过下拉框替代的全屏发布模态框已移除) */}

            {/* 全局 Toast 通知 */}
            {toast && (
                <div className={cn(
                    "fixed top-[18%] left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-[14px] font-semibold animate-in slide-in-from-top-4 fade-in duration-300",
                    toast.type === 'success' ? "bg-[#1a1a1a] text-white" : "bg-red-600 text-white"
                )}>
                    {toast.message}
                </div>
            )}

            {/* 撤回二次确认弹框 (Ant Design 风格) */}
            {showWithdrawConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg w-[416px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex gap-4">
                            <AlertCircle className="w-[22px] h-[22px] text-[#faad14] shrink-0 mt-0.5" fill="currentColor" color="white" />
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900 mb-2">{tr('确定要撤回该项目的发布吗？')}</h3>
                                <p className="text-[14px] text-gray-500 mb-6">{tr('撤回后线上链接将立即失效。')}</p>
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => setShowWithdrawConfirm(false)}
                                        className="px-4 py-[5px] border border-[#d9d9d9] text-gray-700 bg-white rounded-md text-[14px] hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                                    >
                                        {tr('取消')}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            // Step 1: close modal, start loading
                                            setShowWithdrawConfirm(false);
                                            setIsWithdrawing(true);
                                            setTimeout(() => {
                                                // Step 2: withdrawal success → flip to unpublished, keep time record, show toast
                                                setIsWithdrawing(false);
                                                setIsPublished(false);
                                                // publishedAt and publishVersion are intentionally kept for historical display
                                                showToast(tr('撤回成功'));
                                            }, 1500);
                                        }}
                                        className="px-4 py-[5px] bg-[#1677ff] text-white rounded-md text-[14px] hover:bg-[#4096ff] transition-colors shadow-sm"
                                    >
                                        {tr('确定')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
        </TooltipProvider>
    );
}

// Helper Components
function FileItem({ name, active }: { name: string, active?: boolean }) {
    return (
        <button className={cn(
            "w-full text-left px-3 py-2 rounded-lg text-[13px] flex items-center gap-2.5 transition-all duration-200",
            active
                ? "bg-slate-900 text-white font-bold shadow-md shadow-slate-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}>
            <div className={cn("shrink-0", active ? "text-white" : "text-slate-300")}>
                <FileText size={14} strokeWidth={2} />
            </div>
            {name}
        </button>
    );
}

// FolderTree: 应用类型代码tab下的多级文件夹树
type FolderNode = { name: string; type: 'folder' | 'file'; children?: FolderNode[] };

const APP_FILE_TREE: FolderNode[] = [
    { name: 'src', type: 'folder', children: [
        { name: 'components', type: 'folder', children: [
            { name: 'Header.tsx', type: 'file' },
            { name: 'Footer.tsx', type: 'file' },
            { name: 'Button.tsx', type: 'file' },
        ]},
        { name: 'pages', type: 'folder', children: [
            { name: 'Home.tsx', type: 'file' },
            { name: 'Detail.tsx', type: 'file' },
            { name: 'Cart.tsx', type: 'file' },
        ]},
        { name: 'App.tsx', type: 'file' },
        { name: 'main.tsx', type: 'file' },
        { name: 'index.css', type: 'file' },
    ]},
    { name: 'public', type: 'folder', children: [
        { name: 'index.html', type: 'file' },
    ]},
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
];

// 根据文件名判断类型，用于在目录树中选择不同图标
function getFileIconType(fileName: string): 'logic' | 'style' | 'config' | 'asset' | 'doc' {
    const name = fileName.toLowerCase();
    // 逻辑与组件类
    if (/\.(tsx|jsx|ts|js|mjs|cjs)$/.test(name) || /route\.(ts|js)x?$/.test(name)) {
        return 'logic';
    }
    // 样式类
    if (/\.(css|scss|sass|less)$/.test(name) || /\.module\./.test(name)) {
        return 'style';
    }
    // 配置与数据类
    if (/\.(json|ya?ml|yml|prisma|sql)$/.test(name) || name.startsWith('.env') || name === '.gitignore' || name.includes('.config.')) {
        return 'config';
    }
    // 资源类
    if (/\.(png|jpe?g|svg|webp|ico|gif)$/.test(name)) {
        return 'asset';
    }
    // 文档类
    if (/\.(md|mdx|pdf|txt)$/.test(name)) {
        return 'doc';
    }
    return 'logic';
}

function FolderTreeNode({ node, depth, activeFile, onSelectFile }: {
    node: FolderNode;
    depth: number;
    activeFile: string;
    onSelectFile: (f: string) => void;
}) {
    const [open, setOpen] = useState(depth < 2);
    if (node.type === 'folder') {
        return (
            <div>
                <button
                    onClick={() => setOpen(v => !v)}
                    className="w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12px] text-slate-500 hover:bg-slate-100 font-semibold transition"
                    style={{ paddingLeft: `${8 + depth * 12}px` }}
                >
                    {/* 仅保留展开/收起箭头，不显示文件夹图标 */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('transition-transform shrink-0', open ? 'rotate-90' : '')}><path d="m9 18 6-6-6-6" /></svg>
                    <span className="truncate">{node.name}</span>
                </button>
                {open && node.children?.map((child, i) => (
                    <FolderTreeNode key={i} node={child} depth={depth + 1} activeFile={activeFile} onSelectFile={onSelectFile} />
                ))}
            </div>
        );
    }

    const type = getFileIconType(node.name);

    let icon = <FileText size={12} strokeWidth={2} className="shrink-0 text-slate-500" />;
    if (type === 'logic') {
        icon = <Code2 size={12} strokeWidth={2} className="shrink-0 text-indigo-500" />;
    } else if (type === 'style') {
        icon = <Palette size={12} strokeWidth={2} className="shrink-0 text-emerald-500" />;
    } else if (type === 'config') {
        icon = <Settings size={12} strokeWidth={2} className="shrink-0 text-amber-500" />;
    } else if (type === 'asset') {
        icon = <Image size={12} strokeWidth={2} className="shrink-0 text-purple-500" />;
    } else if (type === 'doc') {
        icon = <FileText size={12} strokeWidth={2} className="shrink-0 text-slate-500" />;
    }

    return (
        <button
            onClick={() => onSelectFile(node.name)}
            className={cn(
                'w-full text-left flex items-center gap-1.5 py-1 rounded-lg text-[12px] transition',
                activeFile === node.name ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-50'
            )}
            style={{ paddingLeft: `${20 + depth * 12}px` }}
        >
            {icon}
            <span className="truncate">{node.name}</span>
        </button>
    );
}

function FolderTree({ activeFile, onSelectFile }: { activeFile: string; onSelectFile: (f: string) => void }) {
    return (
        <div className="space-y-0.5">
            {APP_FILE_TREE.map((node, i) => (
                <FolderTreeNode key={i} node={node} depth={0} activeFile={activeFile} onSelectFile={onSelectFile} />
            ))}
        </div>
    );
}
