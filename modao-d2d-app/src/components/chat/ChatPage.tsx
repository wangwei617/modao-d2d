import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, PanelLeft, Sparkles, Check, Copy, Download, RotateCw, Smartphone, Tablet, Monitor, ChevronLeft, ChevronRight, Share, Share2, Maximize2, Edit3, FileText, CheckCircle2, Paperclip, ArrowUp, X, Globe, Lock, Settings, BarChart3, Image, RefreshCw, MonitorSmartphone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/context/SidebarContext';
import { analyzeAndAskQuestions, streamGenerateApp } from '@/lib/geminiService';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';


export type GenStage = 'idle' | 'thinking' | 'questioning' | 'planning' | 'search' | 'summarizing' | 'generating' | 'done';
    
export interface GenerationSession {
    id: string;
    prompt: string;
    stage: GenStage;
    thinkingText: string;
    questions: string[];
    userAnswers: Record<number, string>;
    answeredAll: boolean;
    currentQuestionIndex: number;
    planningPoints: string[];
    generatedHtml: string;
    streamingCode: string;
    isUserPromptHidden?: boolean;
    timestamp: number;
}

export function ChatPage() {
    const { userPrompt, setUserPrompt, sidebarCollapsed, setSidebarCollapsed, setViewMode, setActiveNav } = useSidebarContext();
    const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'code' | 'config' | 'analytics'>('preview');
    const [isDirOpen, setIsDirOpen] = useState(true);
    const [activeTerminalFile] = useState('墨刀AI界面设计评审.md');
    const [inputMessage, setInputMessage] = useState('');
    const [publishSuccess, setPublishSuccess] = useState(false);
    const [activeFile, setActiveFile] = useState('cart.html');
    const [deviceMode, setDeviceMode] = useState<'mobile' | 'pad' | 'pc'>('mobile');
    const [showDeviceMenu, setShowDeviceMenu] = useState(false);
    const deviceMenuRef = useRef<HTMLDivElement>(null);
    const [showVersionMenu, setShowVersionMenu] = useState(false);
    const [activeVersion, setActiveVersion] = useState('V2');
    const versionMenuRef = useRef<HTMLDivElement>(null);
    const [isChatOpen, setIsChatOpen] = useState(true);

    const [sessions, setSessions] = useState<GenerationSession[]>([]);
    const [activeMessage, setActiveMessage] = useState<'html' | 'document' | 'terminal' | string>('html');

    const chatEndRef = useRef<HTMLDivElement>(null);
    const generatingRef = useRef(false);

    const updateSession = (id: string, updates: Partial<GenerationSession>) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    // Publish modal enhanced state
    const [siteTitle, setSiteTitle] = useState('电商购物App');
    const [siteDescription, setSiteDescription] = useState('一款精美的电商购物移动端应用，支持商品浏览、购物车、结算等功能。');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

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
    const [projectName, setProjectName] = useState('电商购物App原型');
    const [customUrl, setCustomUrl] = useState('cart-app-58751561');

    // Screenshot mode state
    const [showScreenshotMode, setShowScreenshotMode] = useState(false);
    const [capturedImages, setCapturedImages] = useState<{ id: number; label: string; comments: string[] }[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
    const [comments, setComments] = useState<{ id: number, rect: { x: number, y: number, w: number, h: number }, text: string, isEditing: boolean }[]>([]);

    const EXISTING_URLS = ['cart-app-123456', 'design-review-11718025', 'table-blue-58751561', 'pig-rock-11718025'];

    // Chat Panel Resizing Logic
    const [chatWidth, setChatWidth] = useState(320);
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
            // minimum 200, maximum 900
            if (newWidth < 200) newWidth = 200;
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
    const runGenerationPipeline = async (sessionId: string, prompt: string, extraContext: string) => {
        updateSession(sessionId, { stage: 'planning' });
        await new Promise((r) => setTimeout(r, 1200));

        updateSession(sessionId, { stage: 'search', thinkingText: '正在搜索相关的竞品设计及实现模式...' });
        await new Promise((r) => setTimeout(r, 1500));

        updateSession(sessionId, { stage: 'summarizing', thinkingText: '汇总需求并准备代码结构...' });
        await new Promise((r) => setTimeout(r, 1500));

        updateSession(sessionId, { stage: 'generating' });
        let html = '';
        
        // 当切换到 generating 时，右边自动切换为 code/preview tab 等(留给界面层副作用处理，此处先改状态)
        setActiveTab('code');

        await streamGenerateApp(
            prompt, extraContext,
            (chunk: string) => {
                html += chunk;
                updateSession(sessionId, { streamingCode: html });
            },
            () => {
                updateSession(sessionId, {
                    generatedHtml: html,
                    stage: 'done'
                });
                setActiveMessage(sessionId); // set right view to show current generated HTML
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
        
        const sessionId = Date.now().toString();
        const newSession: GenerationSession = {
            id: sessionId,
            prompt,
            stage: 'thinking',
            thinkingText: '分析需求中...',
            questions: [],
            userAnswers: {},
            answeredAll: false,
            currentQuestionIndex: 0,
            planningPoints: [],
            generatedHtml: '',
            streamingCode: '',
            timestamp: Date.now()
        };

        setSessions(prev => [...prev, newSession]);
        
        // initial preview states
        setActiveMessage(sessionId);
        setActiveTab('preview'); // loading state

        // Simulate thinking animation
        const thinkingTexts = [
            '分析需求中...',
            '理解用户意图...',
            '融合用户体验五要素评估方案...',
        ];
        for (const t of thinkingTexts) {
            updateSession(sessionId, { thinkingText: t });
            await new Promise((r) => setTimeout(r, 600));
        }

        // Call Gemini to analyze
        const analysis = await analyzeAndAskQuestions(prompt);
        
        updateSession(sessionId, {
            planningPoints: analysis.planningPoints,
            thinkingText: analysis.thinkingText || '正在将需求转化为系统设计...'
        });

        if (analysis.needsClarification && analysis.questions.length > 0) {
            updateSession(sessionId, {
                questions: analysis.questions,
                stage: 'questioning'
            });
        } else {
            // Skip to planning
            await runGenerationPipeline(sessionId, prompt, '');
        }
    }, [setUserPrompt]);

    // Trigger AI generation when userPrompt is available
    useEffect(() => {
        if (userPrompt && userPrompt.trim()) {
            startGeneration(userPrompt);
        }
    }, [userPrompt, startGeneration]);

    // Handle user answering clarification questions
    const handleAnswerSubmit = useCallback(async (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;
        const extraContext = session.questions.map((q, i) => `Q: ${q}\nA: ${session.userAnswers[i] ?? ''}`).join('\n');
        updateSession(sessionId, { answeredAll: true });
        await runGenerationPipeline(sessionId, session.prompt, extraContext);
    }, [sessions]);

    const handleSendMessage = () => {
        if (!inputMessage.trim() && capturedImages.length === 0) return;
        const finalPrompt = inputMessage.trim() || '请根据提供的截图优化';
        startGeneration(finalPrompt);
        setInputMessage('');
        setCapturedImages([]);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('.comment-box-interactive')) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setIsDrawing(true);
        setStartPos({ x, y });
        setCurrentPos({ x, y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrentPos({ x, y });
    };

    const handleMouseUp = () => {
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
                isEditing: true
            }]);
        }
    };

    // Close share panel when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sharePanelRef.current && !sharePanelRef.current.contains(e.target as Node)) {
                setShowSharePanel(false);
            }
            if (publishPanelRef.current && !publishPanelRef.current.contains(e.target as Node)) {
                setShowPublishModal(false);
            }
            if (deviceMenuRef.current && !deviceMenuRef.current.contains(e.target as Node)) {
                setShowDeviceMenu(false);
            }
            if (versionMenuRef.current && !versionMenuRef.current.contains(e.target as Node)) {
                setShowVersionMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const shareDropdown = (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/60 p-1 z-50 flex flex-col cursor-default font-sans animate-in fade-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg">
                    <button onClick={() => setShareTab('project')} className={cn("px-4 py-1.5 text-[12px] font-bold rounded-md transition", shareTab === 'project' ? "bg-[#eef2ff] text-[#4f46e5]" : "text-slate-500 hover:text-slate-700")}>分享项目</button>
                    <button onClick={() => setShareTab('file')} className={cn("px-4 py-1.5 text-[12px] font-bold rounded-md transition", shareTab === 'file' ? "bg-[#eef2ff] text-[#4f46e5]" : "text-slate-500 hover:text-slate-700")}>分享文件</button>
                </div>
                <button className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 transition" onClick={() => setShowSharePanel(false)}><X size={16} /></button>
            </div>

            <div className="p-4 space-y-5">
                <div>
                    <div className="text-[12px] font-bold text-slate-700 mb-3 ml-1">链接访问权限</div>
                    <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50 shadow-sm">
                        <div className="flex items-center justify-between p-3.5 hover:bg-slate-50 cursor-pointer transition">
                            <div className="flex items-center gap-3.5">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Lock size={15} /></div>
                                <div>
                                    <div className="text-[13px] font-bold text-slate-700">仅限自己</div>
                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">仅自己可见</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3.5 hover:bg-indigo-50/50 cursor-pointer bg-indigo-50/40 transition">
                            <div className="flex items-center gap-3.5">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[#4f46e5]"><Globe size={15} /></div>
                                <div>
                                    <div className="text-[13px] font-bold text-slate-700">公开</div>
                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">获得链接的人可访问</div>
                                </div>
                            </div>
                            <Check size={16} className="text-[#4f46e5]" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between py-1 px-1">
                    <div className="text-[13px] font-bold text-slate-700">回放模式</div>
                    <div className="w-10 h-6 bg-[#6366f1] rounded-full flex items-center p-0.5 justify-end cursor-pointer"><div className="w-5 h-5 bg-white rounded-full shadow-sm" /></div>
                </div>

                <div className="space-y-2.5 pt-1">
                    <button className="w-full h-10 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[13px] font-bold rounded-lg transition-colors active:scale-95 shadow-sm">复制链接</button>
                    {shareTab === 'project' && <button className="w-full h-10 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-[13px] font-bold rounded-lg transition-colors active:scale-95 shadow-sm">发布项目</button>}
                </div>
            </div>
        </div>
    );

    const publishDropdown = (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/60 w-[520px] z-50 cursor-default animate-in fade-in slide-in-from-top-2 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="text-[14px] font-bold text-gray-800">发布设置</div>
                <button onClick={() => setShowPublishModal(false)} className="text-gray-400 hover:text-gray-600 transition"><X size={16} /></button>
            </div>
            <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Network title */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-500 w-24 shrink-0">网站标题</span>
                    <input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} placeholder="输入网站标题..." className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 transition" />
                </div>
                {/* Description */}
                <div className="flex items-start gap-4">
                    <span className="text-sm font-semibold text-gray-500 w-24 shrink-0 pt-2">网站描述</span>
                    <textarea value={siteDescription} onChange={e => setSiteDescription(e.target.value)} placeholder="输入网站描述..." rows={2} className="flex-1 resize-none bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 transition" />
                </div>
                {/* Thumbnail */}
                <div className="flex items-start gap-4">
                    <span className="text-sm font-semibold text-gray-500 w-24 shrink-0 pt-2">缩略图</span>
                    <div className="flex-1">
                        <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) setThumbnailUrl(URL.createObjectURL(file));
                        }} />
                        {thumbnailUrl ? (
                            <div className="relative group">
                                <img src={thumbnailUrl} alt="thumbnail" className="w-full h-28 object-cover rounded-xl border border-gray-100" />
                                <button onClick={() => { setThumbnailUrl(''); if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''; }} className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                    <X size={12} className="text-gray-600" />
                                </button>
                            </div>
                        ) : (
                            <div onClick={() => thumbnailInputRef.current?.click()} className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Image size={16} className="text-gray-400" />
                                </div>
                                <div className="text-[12px] text-gray-400 font-medium">点击上传图片</div>
                                <div className="text-[11px] text-gray-300">默认为网站首页截图</div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Project name */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-500 w-24 shrink-0">项目名称</span>
                    <input value={projectName} onChange={e => setProjectName(e.target.value)} className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 transition" />
                </div>
                {/* Status */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-500 w-24 shrink-0">当前状态</span>
                    {isPublished ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100"><CheckCircle2 size={13} /> 已发布</div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-xs font-bold">未发布</div>
                    )}
                </div>
                {/* URL */}
                <div className="flex items-start gap-4">
                    <span className="text-sm font-semibold text-gray-500 w-24 shrink-0 pt-2">访问链接</span>
                    <div className="flex-1 space-y-2">
                        <div className={cn("flex items-center border rounded-lg overflow-hidden transition px-3 py-2 bg-gray-50", isEditingUrl ? "border-indigo-300 ring-4 ring-indigo-50 bg-white" : "border-gray-100")}>
                            {isEditingUrl ? (
                                <input autoFocus value={editUrlValue} onChange={e => { setEditUrlValue(e.target.value); setUrlError(''); }} onKeyDown={e => { if (e.key === 'Enter') { if (EXISTING_URLS.includes(editUrlValue) && editUrlValue !== customUrl) setUrlError('该链接已被占用'); else { setCustomUrl(editUrlValue); setIsEditingUrl(false); setUrlError(''); } } if (e.key === 'Escape') setIsEditingUrl(false); }} className="flex-1 bg-transparent text-sm font-mono text-gray-800 outline-none w-full" />
                            ) : (
                                <span className="flex-1 text-sm font-mono text-gray-700 truncate">{customUrl}</span>
                            )}
                            <span className="text-xs text-gray-400 font-mono ml-2">.modao.site</span>
                        </div>
                        {isEditingUrl ? (
                            <div className="flex gap-2">
                                <button onClick={() => { if (EXISTING_URLS.includes(editUrlValue) && editUrlValue !== customUrl) setUrlError('该链接已被占用'); else { setCustomUrl(editUrlValue); setIsEditingUrl(false); setUrlError(''); } }} className="px-3 py-1 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-md hover:bg-indigo-100 transition">确定</button>
                                <button onClick={() => setIsEditingUrl(false)} className="px-3 py-1 bg-gray-100 text-gray-500 font-bold text-xs rounded-md hover:bg-gray-200 transition">取消</button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }} className="text-xs font-bold flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
                                    {copySuccess ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} 复制链接
                                </button>
                                <button onClick={() => { setEditUrlValue(customUrl); setIsEditingUrl(true); }} className="text-xs font-bold flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"><Edit3 size={12} /> 自定义</button>
                            </div>
                        )}
                        {urlError && <div className="text-[11px] text-red-500 font-medium">{urlError}</div>}
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50/50 flex gap-3 border-t border-gray-50">
                {isPublished ? (
                    <>
                        <button onClick={() => { setIsPublished(false); setShowPublishModal(false); }} className="flex-1 h-9 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-white transition bg-transparent">取消发布</button>
                        <button onClick={() => { setPublishSuccess(true); setTimeout(() => { setPublishSuccess(false); setShowPublishModal(false); }, 1500); }} className="flex-1 h-9 rounded-lg bg-black text-white font-bold text-sm hover:bg-slate-800 transition overflow-hidden relative">
                            <div className={cn("flex items-center justify-center gap-1.5 transition-all duration-300", publishSuccess ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100")}>更新版本</div>
                            <div className={cn("absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-300", publishSuccess ? "translate-y-0 opacity-100 bg-emerald-500" : "translate-y-10 opacity-0")}><Check size={14} strokeWidth={3} /> 更新成功</div>
                        </button>
                    </>
                ) : (
                    <button onClick={() => { setPublishSuccess(true); setTimeout(() => { setPublishSuccess(false); setIsPublished(true); setShowPublishModal(false); }, 1500); }} className="w-full h-9 rounded-lg bg-black text-white font-bold text-sm hover:bg-slate-800 transition overflow-hidden relative shadow-sm">
                        <div className={cn("flex items-center justify-center gap-1.5 transition-all duration-300", publishSuccess ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100")}>发布项目</div>
                        <div className={cn("absolute inset-0 flex items-center justify-center gap-1.5 transition-all duration-300", publishSuccess ? "translate-y-0 opacity-100 bg-emerald-500" : "translate-y-10 opacity-0")}><Check size={14} strokeWidth={3} /> 发布成功</div>
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
                        <p className="text-[14px] font-semibold text-slate-700">等待生成内容</p>
                        <p className="text-[13px] mt-1">在左侧输入需求，AI将为您生成产品并在右侧展示</p>
                    </div>
                 </div>
             );
        }

        const isGenerating = currentSession.stage === 'generating';

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
                            <p className="text-[13px] font-medium text-slate-500 mt-8">AI 正在绘制界面结构并添加样式...</p>
                        </div>
                    </div>
                );
            }
            if (currentSession.streamingCode || currentSession.generatedHtml) {
                return (
                    <div className="flex-1 w-full h-full p-2 bg-slate-100/50">
                        {/* 模拟浏览器容器 */}
                        <div className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
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
                            <div className="relative w-full h-full flex-1 overflow-hidden">
                                {isGenerating ? (
                                    <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[2px] flex items-center justify-center" />
                                ) : null}
                                <iframe
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                    srcDoc={currentSession.generatedHtml || currentSession.streamingCode}
                                    title="AI Generated Preview"
                                    className="w-full h-full border-none bg-white"
                                />
                                {isGenerating && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-indigo-600 text-white px-4 py-2 text-[12px] font-bold rounded-full shadow-lg flex items-center gap-2">
                                        <RefreshCw size={12} className="animate-spin" />
                                        <span>代码正在流式渲染...</span>
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
                <div className="flex-1 w-full h-full bg-[#1e1e1e] text-slate-300 font-mono text-[13px] overflow-hidden p-6 relative">
                    {/* Code Scrollable */}
                    <ScrollArea className="w-full h-full">
                        {isGenerating && (
                            <div className="flex items-center gap-2 text-indigo-400 mb-4 pb-4 border-b border-white/5 text-[12px]">
                                <RefreshCw size={12} className="animate-spin" />
                                接收流式代码中...
                            </div>
                        )}
                        <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed break-all">
                            {(currentSession.streamingCode || currentSession.generatedHtml) && (
                                <code>{currentSession.streamingCode || currentSession.generatedHtml}</code>
                            )}
                            {(!currentSession.streamingCode && !currentSession.generatedHtml) && (
                                <span className="opacity-50">等待代码生成...</span>
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
                        <p className="text-[14px] font-semibold text-slate-700">暂不支持当前模式</p>
                        <p className="text-[13px] mt-1">此 Tab 规划中，将在后续版本上线</p>
                    </div>
                 </div>
            );
        }

        return null;
    };

    return (

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
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/expand:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">展开左侧栏</div>
                                </div>
                                <div className="relative group/newchat shrink-0">
                                    <button
                                        onClick={() => { setViewMode('home'); setActiveNav('home'); setUserPrompt(''); }}
                                        className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded transition-colors shrink-0"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                    </button>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover/newchat:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">新建项目</div>
                                </div>
                            </>
                        )}
                        <div className="font-bold text-slate-800 text-[14px] tracking-tight whitespace-nowrap overflow-hidden text-ellipsis mr-auto">墨刀AI设计助手</div>
                        <div className="ml-auto bg-[#EEF2FF] text-slate-800 rounded-full flex items-center h-[30px] px-3 font-bold cursor-pointer transition-all active:scale-95 hover:bg-indigo-50 shrink-0 divide-x divide-[#C7D2FE]/60">
                            <div className="flex items-center gap-1.5 pr-2.5">
                                <Sparkles size={14} className="text-[#6A5DF1]" fill="currentColor" />
                                <span className="font-mono text-[14px] text-slate-900 tracking-tight">9999</span>
                            </div>
                            <div className="pl-2.5 text-[12px] text-[#4338CA]">购买</div>
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
                                            <p className="text-[13px] leading-relaxed">你好！我是墨刀 AI 设计助手，专注于完整的端到端产品架构生成与开发。</p>
                                            <p className="text-[13px] leading-relaxed mt-2 text-slate-500">你可以对我说："生成一个带深色模式的现代任务管理 SaaS 后台" 或 "帮我做一个电商小程序的商品列表页"。</p>
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
                                        {userPrompt || '生成一个电商购物App首页'}
                                    </div>
                                </div>
                            )}

                            {/* Thinking stage */}
                            {(session.stage === 'thinking') && (
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
                                            <span className="text-slate-500 text-[12px]">{session.thinkingText || '正在思考...'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Questioning stage - Paginated Inquiry Panel */}
                            {(session.stage === 'questioning' || (session.stage !== 'thinking' && session.questions.length > 0)) && (
                                <div className="flex gap-2.5 mt-3">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 mt-0.5 flex items-center justify-center">
                                        <Sparkles size={12} className="text-white" fill="white" />
                                    </div>
                                    <div className="flex-1 bg-white rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm overflow-hidden">
                                        {/* Panel Header */}
                                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                                            <span className="text-[13px] font-bold text-slate-800">关于需求我想进一步确认...</span>
                                        </div>
                                        {/* Question Content */}
                                        <div className="p-4">
                                            <div className="border border-slate-100 rounded-xl p-4 bg-white">
                                                {/* Question Title + Pagination */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-[14px] font-semibold text-slate-800">
                                                        {session.questions[session.currentQuestionIndex]}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-slate-400 text-[12px] shrink-0 ml-3">
                                                        <button
                                                            onClick={() => updateSession(session.id, { currentQuestionIndex: Math.max(0, session.currentQuestionIndex - 1)})}
                                                            disabled={session.currentQuestionIndex === 0}
                                                            className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition"
                                                        >
                                                            <ChevronLeft size={12} />
                                                        </button>
                                                        <span className="font-bold text-slate-500">{session.currentQuestionIndex + 1} / {session.questions.length}</span>
                                                        <button
                                                            onClick={() => updateSession(session.id, { currentQuestionIndex: Math.min(session.questions.length - 1, session.currentQuestionIndex + 1)})}
                                                            disabled={session.currentQuestionIndex >= session.questions.length - 1}
                                                            className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition"
                                                        >
                                                            <ChevronRight size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Answer Options */}
                                                {session.stage === 'questioning' && !session.answeredAll && (
                                                    <div className="space-y-2">
                                                        <label className={cn(
                                                            "flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all border-slate-100 hover:bg-slate-50 focus-within:border-indigo-300 focus-within:bg-indigo-50/20 shadow-sm"
                                                        )}>
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-1 flex-1">
                                                                    <textarea
                                                                        value={session.userAnswers[session.currentQuestionIndex] ?? ''}
                                                                        onChange={e => updateSession(session.id, { userAnswers: { ...session.userAnswers, [session.currentQuestionIndex]: e.target.value }})}
                                                                        placeholder="你可以输入你的偏好、想法或背景信息..."
                                                                        className="w-full text-[13px] font-medium bg-transparent border-none focus:ring-0 resize-none outline-none text-slate-700 min-h-[60px]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                )}
                                                {session.answeredAll && session.userAnswers[session.currentQuestionIndex] && (
                                                    <div className="text-[13px] bg-slate-50 p-3 rounded-xl text-slate-700">
                                                        <span className="font-bold text-slate-500 mr-2">你的回答:</span> 
                                                        {session.userAnswers[session.currentQuestionIndex]}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Footer Actions */}
                                        {session.stage === 'questioning' && !session.answeredAll && (
                                            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                                                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                                    通过提供回答，可增加产品生成的准确度
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleAnswerSubmit(session.id)}
                                                        className="h-8 px-4 text-[12px] font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95"
                                                    >
                                                        稍后确认 / 跳过
                                                    </button>
                                                    {session.currentQuestionIndex < session.questions.length - 1 ? (
                                                        <button
                                                            onClick={() => {
                                                                 updateSession(session.id, { currentQuestionIndex: Math.min(session.questions.length - 1, session.currentQuestionIndex + 1)})
                                                            }}
                                                            className="h-8 px-5 text-[12px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition active:scale-95 shadow-sm"
                                                        >
                                                            下一问
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAnswerSubmit(session.id)}
                                                            className="h-8 px-5 text-[12px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition active:scale-95 flex items-center gap-1.5 shadow-sm"
                                                        >
                                                            <Sparkles size={12} />
                                                            完成并生成
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Planning stage */}
                            {(session.stage === 'planning' || session.stage === 'search' || session.stage === 'summarizing' || session.stage === 'generating' || session.stage === 'done') && session.planningPoints.length > 0 && (
                                <div className="flex gap-2.5 mt-3">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 mt-0.5 flex items-center justify-center">
                                        <Sparkles size={12} className="text-white" fill="white" />
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100">
                                        <p className="text-[13px] text-slate-700 leading-relaxed mb-4">{session.thinkingText}</p>
                                        <p className="text-[12px] font-semibold text-slate-600 mb-2">规划大纲</p>
                                        <div className="space-y-1.5">
                                            {session.planningPoints.map((point, i) => (
                                                <div key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
                                                    {['done', 'generating'].includes(session.stage) || (session.stage === 'planning' && i === 0)? (
                                                         <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                                                    ) : (
                                                         <div className="w-[13px] h-[13px] mt-0.5 shrink-0 border border-slate-300 rounded-full" />
                                                    )}
                                                    {point}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Generating stage */}
                            {(session.stage === 'generating') && (
                                <div className="flex gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 mt-0.5 flex items-center justify-center">
                                        <Sparkles size={12} className="text-white" fill="white" />
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100">
                                        <div className="flex items-center gap-2 text-[12px] text-slate-500">
                                            <RefreshCw size={12} className="animate-spin text-indigo-500" />
                                            正在生成应用代码（{Math.round(session.streamingCode.length / 10) * 10}字符已生成）...
                                        </div>
                                    </div>
                                </div>
                            )}

                            {session.stage === 'done' && (
                                <div className="space-y-3 ml-8">
                                    <div className="flex gap-2.5">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 mt-0.5 flex items-center justify-center">
                                            <Sparkles size={12} className="text-white" fill="white" />
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-100 text-[13px] text-slate-600">
                                            <p>应用已生成完成！可在右侧区域查看并交互。</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => { setActiveMessage(session.id); setActiveTab('preview'); }}
                                        className={cn(
                                            "border-2 rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition-all",
                                            activeMessage === session.id ? "border-indigo-500 bg-indigo-50/10 shadow-sm" : "border-gray-100 hover:border-indigo-200 bg-white"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{projectName} (迭代)</div>
                                                    <div className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">AI 生成</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
                                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-bold">
                                                <CheckCircle2 size={13} /> 生成完成
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
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
                                            className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-slate-800 placeholder:text-slate-400 resize-none py-1 max-h-32 overflow-y-hidden"
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
                        <button onClick={() => setIsChatOpen(true)} title="展开助手" className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors">
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
                                    <span className="text-sm font-semibold text-gray-800">墨刀AI的虚拟电脑</span>
                                    <div className="w-px h-4 bg-gray-200 mx-1" />
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-600 font-medium">
                                        <Edit3 size={12} className="text-gray-400" />
                                        已完成编辑 <span className="text-gray-500">{activeTerminalFile}</span>
                                    </div>
                                </div>
                                <button onClick={() => setActiveMessage('html')} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400">
                                    <X size={16} />
                                </button>
                            </div>
                            {/* Terminal Body */}
                            <ScrollArea className="flex-1 bg-white p-8 relative">
                                <div className="max-w-4xl">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">墨刀AI平台UI设计规范评审报告</h1>
                                    <div className="text-sm font-medium text-gray-500 mb-8 pb-8 border-b border-gray-100">
                                        UI Specification &amp; Visual Design Review <br />评审日期：2026年02月26日
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">执行摘要</h2>
                                    <h3 className="text-base font-bold text-gray-700 mb-2">评审范围与输入</h3>
                                    <p className="text-[14px] text-gray-600 leading-relaxed mb-6">本次评审基于提供的AI辅助工具网页界面截图进行。通过识图分析，界面被识别为"墨刀AI"平台的首页，包含顶部导航、中部主交互区（智能体问候、功能输入框、快捷功能入口）以及底部的精选案例展示区。评审聚焦于视觉规范与用户体验的五维度分析。</p>
                                    <h3 className="text-base font-bold text-gray-700 mb-2">核心结论</h3>
                                    <p className="text-[14px] text-gray-600 leading-relaxed mb-8">界面整体呈现现代简约的扁平化设计风格，视觉层级清晰，核心交互区聚焦。主要亮点在于清晰的布局结构和科技感的色彩点缀。优化空间主要集中在底部区域留白、辅助功能的视觉引导一致性以及可访问性细节上。综合评分为 <strong className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">78/100</strong>。</p>
                                    <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 mt-10">综合评分</h2>
                                    <h3 className="text-base font-bold text-gray-700 mb-4">总体评分：78/100</h3>
                                    <p className="text-[14px] text-gray-600 leading-relaxed mb-6">界面视觉基础良好，遵循了简约清晰的设计原则。色彩方案和布局结构表现出色，但在细节一致性、留白节奏和可访问性方面存在明确的优化空间，提升后将显著增强专业感和易用性。</p>
                                </div>
                            </ScrollArea>
                        </div>
                    ) : activeMessage !== 'document' ? (
                        <>
                            {/* View Toolbar */}
                            <div className="h-14 border-b border-slate-50 flex items-center px-4 shrink-0 bg-white">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setActiveTab('preview')}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                            activeTab === 'preview'
                                                ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                        )}>
                                        <Image size={14} />
                                        {activeTab === 'preview' && <span>预览</span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('edit')}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                            activeTab === 'edit'
                                                ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                        )}>
                                        <Edit3 size={14} />
                                        {activeTab === 'edit' && <span>编辑</span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('code')}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                            activeTab === 'code'
                                                ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                        )}>
                                        <FileText size={14} />
                                        {activeTab === 'code' && <span>代码</span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('config')}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg text-[13px] transition-all duration-200 active:scale-95 border whitespace-nowrap shrink-0",
                                            activeTab === 'config'
                                                ? "bg-slate-900 text-white font-bold border-slate-900 shadow-md shadow-slate-200"
                                                : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700"
                                        )}>
                                        <Settings size={14} />
                                        {activeTab === 'config' && <span>配置</span>}
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
                                        {activeTab === 'analytics' && <span>分析</span>}
                                    </button>

                                    <div className="relative" ref={versionMenuRef}>
                                        <button
                                            onClick={() => setShowVersionMenu(v => !v)}
                                            className="flex items-center gap-1 px-2.5 h-7 text-[12px] font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors border border-slate-100 ml-2 whitespace-nowrap shrink-0 shadow-sm"
                                        >
                                            <span>{activeVersion}</span>
                                            <ChevronDown size={12} className="text-slate-400" />
                                        </button>
                                        {showVersionMenu && (
                                            <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 w-[130px] animate-in fade-in slide-in-from-top-1 duration-150">
                                                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">历史版本</div>
                                                {[
                                                    { v: 'V3', time: '刚刚' },
                                                    { v: 'V2', time: '2小时前' },
                                                    { v: 'V1', time: '昨天' },
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

                                <div className="flex items-center gap-1.5 ml-auto shrink-0 overflow-hidden">
                                    <button className="h-8 px-4 flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 font-bold text-[12px] transition shrink-0 hover:bg-indigo-100 active:scale-95 shadow-sm shadow-indigo-100/50 whitespace-nowrap">
                                        <Share2 size={13} strokeWidth={2.5} className="text-indigo-500" /> 导出至墨刀
                                    </button>

                                    {/* 分享按钮 + 下拉面板 */}
                                    <div className="relative shrink-0" ref={sharePanelRef}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "h-8 px-4 text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 font-bold text-[12px] rounded-lg transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap",
                                                showSharePanel && "bg-slate-200 border-slate-300"
                                            )}
                                            onClick={() => { setShowSharePanel(v => !v); setShowPublishModal(false); }}
                                        >
                                            <Share size={13} strokeWidth={2.5} className="text-slate-600" /> 分享
                                        </Button>
                                        {showSharePanel && shareDropdown}
                                    </div>

                                    {/* 发布按钮 */}
                                    <div className="relative shrink-0" ref={publishPanelRef}>
                                        <Button
                                            onClick={() => { setShowPublishModal(v => !v); setShowSharePanel(false); }}
                                            className="bg-black hover:bg-slate-800 text-white rounded-lg h-8 px-5 text-[12px] font-black shadow-md shadow-black/10 transition active:scale-95 border border-white/5 whitespace-nowrap"
                                        >
                                            发布
                                        </Button>
                                        {showPublishModal && publishDropdown}
                                    </div>

                                    <div className="flex items-center ml-1 pl-2 gap-0.5">
                                        <div className="relative group flex justify-center">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-900 hover:text-white transition text-slate-700 active:scale-95"><Maximize2 size={15} strokeWidth={2.25} /></button>
                                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">全屏</div>
                                        </div>
                                        <div className="relative group flex justify-center">
                                            <button onClick={() => { }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 transition text-slate-700 active:scale-95"><X size={16} strokeWidth={2.5} /></button>
                                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">关闭</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden bg-white relative">
                                {/* Left Panel: File Tree */}
                                {(isDirOpen || activeTab === 'config') && activeTab !== 'analytics' && (
                                    <div className="w-[180px] bg-[#FAFAFA] flex flex-col shrink-0 transition-all duration-300 order-0 relative group border-r border-slate-100">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[4px] h-10 bg-[#E2E8F0] opacity-0 group-hover:opacity-100 group-hover:bg-[#CBD5E1] rounded-full z-10 transition-all duration-200 ease-out" />
                                        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100 bg-transparent pl-5">
                                            <div className="text-[12px] font-black text-slate-900 tracking-wider uppercase">
                                                {activeTab === 'config' ? '设置类别' : '目录'}
                                            </div>
                                            {activeTab !== 'config' && (
                                                <button
                                                    onClick={() => setIsDirOpen(false)}
                                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all opacity-60 hover:opacity-100"
                                                    title="收起目录"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="m15 9-3 3 3 3" /></svg>
                                                </button>
                                            )}
                                        </div>
                                        <ScrollArea className="flex-1">
                                            <div className="p-2 space-y-0.5">
                                                {activeTab === 'config' ? (
                                                    <>
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
                                                    </>
                                                ) : (
                                                    <>
                                                        <div onClick={() => setActiveFile('index.html')}><FileItem name="index.html" active={activeFile === 'index.html'} /></div>
                                                        <div onClick={() => setActiveFile('cart.html')}><FileItem name="cart.html" active={activeFile === 'cart.html'} /></div>
                                                        <div onClick={() => setActiveFile('detail.html')}><FileItem name="detail.html" active={activeFile === 'detail.html'} /></div>
                                                        <div onClick={() => setActiveFile('profile.html')}><FileItem name="profile.html" active={activeFile === 'profile.html'} /></div>
                                                    </>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}

                                {/* Main Content: Preview Area */}
                                <div className="flex-1 bg-white overflow-hidden relative flex flex-col order-1">
                                    {/* Browser/Simulator Chrome */}
                                    {activeTab !== 'config' && activeTab !== 'analytics' && (
                                        <div className="h-14 border-b border-slate-50 flex items-center px-4 bg-transparent shrink-0 relative">
                                            {/* 目录切换按钮（目录收起时在此行显示） */}
                                            {!isDirOpen && (
                                                <button
                                                    onClick={() => setIsDirOpen(true)}
                                                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-[12px] font-bold transition-all active:scale-95 mr-2 shrink-0 shadow-sm"
                                                    title="展开目录"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
                                                    目录
                                                </button>
                                            )}
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
                                                        <div className="relative group">
                                                            <button onClick={() => { setShowScreenshotMode(true); setComments([]); }} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-900 hover:text-white bg-white border border-slate-200 text-slate-600 shadow-sm transition-all active:scale-90 cursor-pointer">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                                            </button>
                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">截图优化</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 max-w-[200px] mx-auto flex">
                                                        <div className="w-full bg-slate-100/50 border border-slate-200 hover:border-slate-300 transition-colors rounded-full h-8 flex items-center justify-between text-[11px] text-slate-600 font-bold px-2 shadow-inner">
                                                            {/* 设备切换下拉 */}
                                                            <div className="relative" ref={deviceMenuRef}>
                                                                <button
                                                                    onClick={() => setShowDeviceMenu(v => !v)}
                                                                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition flex items-center gap-0.5"
                                                                    title="切换演示设备"
                                                                >
                                                                    {deviceMode === 'mobile' && <Smartphone size={13} />}
                                                                    {deviceMode === 'pad' && <Tablet size={13} />}
                                                                    {deviceMode === 'pc' && <Monitor size={13} />}
                                                                    <ChevronDown size={9} className="text-slate-400" />
                                                                </button>
                                                                {showDeviceMenu && (
                                                                    <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 w-[120px] animate-in fade-in slide-in-from-top-1 duration-150">
                                                                        <button
                                                                            onClick={() => { setDeviceMode('mobile'); setShowDeviceMenu(false); }}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition hover:bg-slate-50",
                                                                                deviceMode === 'mobile' ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"
                                                                            )}
                                                                        >
                                                                            <Smartphone size={13} />
                                                                            移动端
                                                                            {deviceMode === 'mobile' && <Check size={11} className="ml-auto text-indigo-500" />}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { setDeviceMode('pad'); setShowDeviceMenu(false); }}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition hover:bg-slate-50",
                                                                                deviceMode === 'pad' ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"
                                                                            )}
                                                                        >
                                                                            <Tablet size={13} />
                                                                            Pad 端
                                                                            {deviceMode === 'pad' && <Check size={11} className="ml-auto text-indigo-500" />}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { setDeviceMode('pc'); setShowDeviceMenu(false); }}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition hover:bg-slate-50",
                                                                                deviceMode === 'pc' ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"
                                                                            )}
                                                                        >
                                                                            <Monitor size={13} />
                                                                            PC 端
                                                                            {deviceMode === 'pc' && <Check size={11} className="ml-auto text-indigo-500" />}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="w-px h-3.5 bg-slate-200 mx-1" />
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="flex-1 truncate text-left hover:bg-slate-200 px-1.5 py-1 rounded transition text-slate-600 font-mono w-[110px] items-center block">
                                                                        /home/{activeFile}
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="start" className="w-[180px]">
                                                                    {['index.html', 'cart.html', 'detail.html', 'profile.html'].map(f => (
                                                                        <DropdownMenuItem key={f} onClick={() => setActiveFile(f)} className="text-[12px] font-mono cursor-pointer">
                                                                            /home/{f}
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                            <div className="flex items-center gap-1 shrink-0 ml-1">
                                                                <div className="relative group flex justify-center">
                                                                    <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-800 transition"><RotateCw size={12} strokeWidth={2.5}/></button>
                                                                    <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">刷新</div>
                                                                </div>
                                                                <div className="relative group flex justify-center">
                                                                    <button className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-800 transition"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg></button>
                                                                    <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">新窗口打开</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
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
                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">已保存至云端</div>
                                                        </div>
                                                        {/* 撤销 */}
                                                        <div className="relative group flex justify-center">
                                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border-transparent transition text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                                                            </button>
                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">撤销上一步</div>
                                                        </div>
                                                        {/* 重做 */}
                                                        <div className="relative group flex justify-center">
                                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border-transparent transition text-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-95">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
                                                            </button>
                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">重做</div>
                                                        </div>
                                                        {/* 下载 */}
                                                        <div className="relative group flex justify-center ml-0.5">
                                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95"><Download size={14} strokeWidth={2.25} /></button>
                                                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">下载代码</div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* 预览tab：仅保留下载资源，移除复制内容 */}
                                                        {activeTab === 'preview' ? (
                                                            <div className="relative group flex justify-center">
                                                                <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95"><Download size={14} strokeWidth={2.25} /></button>
                                                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">下载资源</div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {/* 代码tab：保留复制+下载 */}
                                                                <div className="relative group flex justify-center">
                                                                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95"><Copy size={13} strokeWidth={2.25} /></button>
                                                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">复制内容</div>
                                                                </div>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95" title="下载代码">
                                                                            <Download size={14} strokeWidth={2.25} />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-[150px]">
                                                                        <DropdownMenuItem className="text-[12px] cursor-pointer flex items-center gap-2">
                                                                            <Download size={13} />
                                                                            下载当前文件
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem className="text-[12px] cursor-pointer flex items-center gap-2">
                                                                            <Download size={13} />
                                                                            下载所有文件
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                                {/* 展开目录按钮已移到左侧，此处移除 */}
                                            </div>
                                        </div>
                                    )}
                                    {/* Content based on active tab */}
                                    {renderRightPanelContent()}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Document View Toolbar */}
                            <div className="h-14 border-b border-slate-50 flex items-center justify-between px-6 shrink-0 bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-500 flex items-center justify-center rounded-lg border border-indigo-100">
                                        <FileText size={16} strokeWidth={2.5} />
                                    </div>
                                    <div className="font-bold text-slate-800 text-[14px]">墨刀AI界面设计评审</div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <Button variant="outline" className="h-8 px-5 rounded-lg text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 font-bold text-[12px] transition active:scale-95">
                                        <Share2 size={13} strokeWidth={2.5} className="mr-1.5" />
                                        导出至墨刀
                                    </Button>
                                    <div className="relative" ref={sharePanelRef}>
                                        <Button
                                            onClick={() => { setShowSharePanel(v => !v); setShowPublishModal(false); }}
                                            className={cn("bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-lg h-8 px-5 text-[12px] font-bold transition active:scale-95", showSharePanel && "bg-slate-200")}
                                        >
                                            <Share size={13} strokeWidth={2.5} className="mr-1.5" />
                                            分享
                                        </Button>
                                        {showSharePanel && shareDropdown}
                                    </div>
                                    <div className="relative" ref={publishPanelRef}>
                                        <Button
                                            onClick={() => { setShowPublishModal(v => !v); setShowSharePanel(false); }}
                                            className="bg-black hover:bg-slate-800 text-white rounded-lg h-8 px-6 text-[12px] font-black shadow-md shadow-black/10 transition active:scale-95 border border-white/5"
                                        >
                                            发布
                                        </Button>
                                        {showPublishModal && publishDropdown}
                                    </div>

                                    <div className="flex items-center ml-2 border-slate-100 gap-0.5">
                                        <div className="relative group flex justify-center">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95"><Download size={14} strokeWidth={2.25} /></button>
                                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">下载</div>
                                        </div>
                                        <div className="relative group flex justify-center ml-1">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-slate-700 active:scale-95"><Copy size={14} strokeWidth={2.25} /></button>
                                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">复制</div>
                                        </div>
                                        <div className="w-[1px] h-4 bg-slate-200 mx-2" />
                                        <div className="relative group flex justify-center">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-900 hover:text-white transition text-slate-700 active:scale-95"><Maximize2 size={15} strokeWidth={2.25} /></button>
                                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">全屏</div>
                                        </div>
                                        <div className="relative group flex justify-center">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-600 transition text-slate-700 active:scale-95"><X size={16} strokeWidth={2.5} /></button>
                                            <div className="absolute top-full mt-2 bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">关闭</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Markdown Document Content */}
                            <ScrollArea className="flex-1 bg-[#FAFAFC]">
                                <div className="max-w-4xl mx-auto py-12 px-8">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 min-h-[800px]">
                                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">墨刀AI平台UI设计规范评审报告</h1>
                                        <div className="text-sm font-medium text-gray-500 mb-8 pb-8 border-b border-gray-100">
                                            UI Specification & Visual Design Review <br />
                                            评审日期：2026年02月26日
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-800 mb-4 mt-8">执行摘要</h2>
                                        <h3 className="text-base font-bold text-gray-700 mb-2">评审范围与输入</h3>
                                        <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                                            本次评审基于提供的AI辅助工具网页界面截图进行。通过识图分析，界面被识别为“墨刀AI”平台的首页，包含顶部导航、中部主交互区（智能体问候、功能输入框、快捷功能入口）以及底部的精选案例展示区。评审聚焦于视觉规范与用户体验的五维度分析。
                                        </p>

                                        <h3 className="text-base font-bold text-gray-700 mb-2">核心结论</h3>
                                        <p className="text-[14px] text-gray-600 leading-relaxed mb-8">
                                            界面整体呈现现代简约的扁平化设计风格，视觉层级清晰，核心交互区聚焦。主要亮点在于清晰的布局结构和科技感的色彩点缀。优化空间主要集中在底部区域留白、辅助功能的视觉引导一致性以及可访问性细节上。综合评分为 <strong className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">78/100</strong>。
                                        </p>

                                        <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 mt-10">综合评分</h2>
                                        <h3 className="text-base font-bold text-gray-700 mb-4">总体评分：78/100</h3>
                                        <p className="text-[14px] text-gray-600 leading-relaxed mb-6">
                                            界面视觉基础良好，遵循了简约清晰的设计原则。色彩方案和布局结构表现出色，但在细节一致性、留白节奏和可访问性方面存在明确的优化空间，提升后将显著增强专业感和易用性。
                                        </p>

                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                            <table className="w-full text-left text-[13px] text-gray-600">
                                                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold">评审维度</th>
                                                        <th className="px-4 py-3 font-semibold">评分(0-100)</th>
                                                        <th className="px-4 py-3 font-semibold">权重</th>
                                                        <th className="px-4 py-3 font-semibold">加权得分</th>
                                                        <th className="px-4 py-3 font-semibold">简要说明</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">视觉层级 (Visual Hierarchy)</td>
                                                        <td className="px-4 py-3">85</td>
                                                        <td className="px-4 py-3 text-gray-500">25%</td>
                                                        <td className="px-4 py-3">21.25</td>
                                                        <td className="px-4 py-3 text-gray-500 leading-relaxed">视线流清晰，核心输入区焦点明确，但底部辅助内容层级感稍弱。</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">一致性 (Consistency)</td>
                                                        <td className="px-4 py-3">70</td>
                                                        <td className="px-4 py-3 text-gray-500">25%</td>
                                                        <td className="px-4 py-3">17.50</td>
                                                        <td className="px-4 py-3 text-gray-500 leading-relaxed">顶部按钮与中部色彩统一性好，但功能图标风格与“精选案例”卡片样式存在不一致。</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">排版与留白 (Typography & Layout)</td>
                                                        <td className="px-4 py-3">75</td>
                                                        <td className="px-4 py-3 text-gray-500">20%</td>
                                                        <td className="px-4 py-3">15.00</td>
                                                        <td className="px-4 py-3 text-gray-500 leading-relaxed">整体布局遵循网格，主区域呼吸感佳，但底部案例区域内部与外部间距不协调。</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="px-4 py-3 font-medium">色彩美学 (Color Aesthetics)</td>
                                                        <td className="px-4 py-3">85</td>
                                                        <td className="px-4 py-3 text-gray-500">20%</td>
                                                        <td className="px-4 py-3">17.00</td>
                                                        <td className="px-4 py-3 text-gray-500 leading-relaxed">主色调干净，辅助色点缀恰当，营造了专业、科技的视觉氛围。</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </>
                    )
                    }

                </div >
            </div >

            {/* ======= 截图优化模态 ======= */}
            {
                showScreenshotMode && (
                    <div className="fixed inset-0 z-[200] flex flex-col bg-gray-950/95 backdrop-blur-sm">
                        {/* 截图模式顶栏 */}
                        <div className="h-14 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                                </div>
                                <span className="text-white text-sm font-semibold">截图优化</span>
                                <span className="text-white/40 text-xs">展示生成内容的实际样貌</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        const newImg = {
                                            id: Date.now(),
                                            label: `截图 ${capturedImages.length + 1}`,
                                            comments: comments.map(c => c.text).filter(Boolean)
                                        };
                                        setCapturedImages(prev => [...prev, newImg]);
                                        setShowScreenshotMode(false);
                                        setComments([]);
                                    }}
                                    className="h-8 px-4 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    添加到对话
                                </button>
                                <button
                                    onClick={() => { setShowScreenshotMode(false); setComments([]); }}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* 截图画布区域 */}
                        {/* 截图画布区域 - 全视图展示无限制 */}
                        <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-black/20">
                            <div className="w-full min-h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                                {/* 实际生成的完整内容（取消了定宽及定高限制） */}
                                <div
                                    className="flex-1 p-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center gap-6 relative cursor-crosshair overflow-hidden"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    <div className="text-4xl font-black text-gray-900 pointer-events-none">你好，我是<span className="text-indigo-600">墨刀AI</span></div>
                                    <div className="text-xl text-gray-600 pointer-events-none">今天想设计点什么？</div>
                                    <div className="flex gap-3 mt-4 pointer-events-none">
                                        {['生成页面布局', '自动连接跳转', '文案自动填充'].map(t => (
                                            <div key={t} className="px-4 py-2 rounded-full border border-indigo-200 text-indigo-600 text-sm font-medium bg-white">{t}</div>
                                        ))}
                                    </div>
                                    {/* 模拟页面向下延伸的占位内容 */}
                                    <div className="mt-12 w-full max-w-4xl space-y-8 pointer-events-none">
                                        <div className="h-32 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-300">实际生成区域板块 1</div>
                                        <div className="h-64 bg-white rounded-xl shadow-sm border border-purple-100 flex items-center justify-center text-purple-300">实际生成区域板块 2 (高度可由内容撑开)</div>
                                    </div>

                                    {/* 绘制中的选框 */}
                                    {isDrawing && (
                                        <div
                                            className="absolute border-2 border-indigo-500 bg-indigo-500/10 pointer-events-none z-50 rounded"
                                            style={{
                                                left: Math.min(startPos.x, currentPos.x),
                                                top: Math.min(startPos.y, currentPos.y),
                                                width: Math.abs(currentPos.x - startPos.x),
                                                height: Math.abs(currentPos.y - startPos.y)
                                            }}
                                        />
                                    )}

                                    {/* 已添加的评论框 */}
                                    {comments.map((comment, index) => (
                                        <div
                                            key={comment.id}
                                            className="absolute border-2 border-indigo-500 bg-transparent z-40 rounded comment-box-interactive group"
                                            style={{
                                                left: comment.rect.x,
                                                top: comment.rect.y,
                                                width: comment.rect.w,
                                                height: comment.rect.h
                                            }}
                                        >
                                            <div className="absolute -top-3 -left-3 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md cursor-default">
                                                {index + 1}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setComments(prev => prev.filter(c => c.id !== comment.id));
                                                }}
                                                className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-95"
                                            >
                                                <X size={12} strokeWidth={3} />
                                            </button>

                                            {comment.isEditing ? (
                                                <div
                                                    className={cn(
                                                        "absolute left-0 bg-white rounded-xl shadow-xl w-64 p-3 border border-indigo-100 z-50",
                                                        comment.rect.y > 300 ? "bottom-full mb-3" : "top-full mt-2",
                                                        comment.rect.x > 800 && "-left-40"
                                                    )}
                                                    onMouseDown={e => e.stopPropagation()}
                                                >
                                                    <textarea
                                                        autoFocus
                                                        value={comment.text}
                                                        onChange={e => setComments(prev => prev.map(c => c.id === comment.id ? { ...c, text: e.target.value } : c))}
                                                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                                        rows={2}
                                                        placeholder="输入评论..."
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                if (comment.text.trim()) {
                                                                    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, isEditing: false } : c));
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (comment.text.trim()) {
                                                                    setComments(prev => prev.map(c => c.id === comment.id ? { ...c, isEditing: false } : c));
                                                                } else {
                                                                    setComments(prev => prev.filter(c => c.id !== comment.id));
                                                                }
                                                            }}
                                                            className="px-3 py-1.5 bg-indigo-500 text-white text-[12px] font-bold rounded-lg hover:bg-indigo-600 transition active:scale-95 shadow-sm"
                                                        >
                                                            确定
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setComments(prev => prev.map(c => c.id === comment.id ? { ...c, isEditing: true } : c));
                                                    }}
                                                    className={cn(
                                                        "absolute left-0 bg-white rounded-xl shadow-xl max-w-xs min-w-[12rem] p-3 border border-indigo-100 cursor-text hover:border-indigo-300 transition z-50 text-left",
                                                        comment.rect.y > 300 ? "bottom-full mb-3" : "top-full mt-2",
                                                        comment.rect.x > 800 && "-left-40"
                                                    )}
                                                >
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.text || '点击添加评论'}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* (已通过下拉框替代的全屏发布模态框已移除) */}
        </>
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
