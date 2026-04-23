import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Wand2, Maximize2, Share, Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { streamGenerateApp } from '@/lib/geminiService';
import { MobilePublishSheet } from './MobilePublishSheet';

export function MobileChat({ initialPrompt, onBack }: { initialPrompt: string, onBack: () => void }) {
    const [inputValue, setInputValue] = useState('');
    const [stage, setStage] = useState<'idle' | 'generating' | 'done'>('idle');
    const [htmlContent, setHtmlContent] = useState('');
    const [thinking, setThinking] = useState('正在分析需求...');
    const [messages, setMessages] = useState<{ id: string, text: string, isUser: boolean, html?: string }[]>([
        { id: 'm1', text: initialPrompt, isUser: true }
    ]);
    const [showPreview, setShowPreview] = useState(false);
    const [showPublish, setShowPublish] = useState(false);

    // 独立管理一个本地会话的发布状态
    const [publishState, setPublishState] = useState<{
        isPublished: boolean;
        url: string;
        projectName: string;
        version: number;
        publishedAt: Date | null;
    }>({
        isPublished: false,
        url: `mobile-app-${Math.floor(Math.random() * 100000)}`,
        projectName: '移动端生成应用',
        version: 0,
        publishedAt: null
    });

    useEffect(() => {
        const generate = async () => {
            setStage('generating');
            let code = '';
            await streamGenerateApp(initialPrompt, '', (chunk: string) => {
                code += chunk;
                setHtmlContent(code);
                if (code.length > 50) setThinking('正在生成代码...');
            }, () => {
                setMessages(prev => [...prev, { id: 'm2', text: '应用已生成', isUser: false, html: code }]);
                setStage('done');
            }, (e) => {
                console.error(e);
                setThinking('生成失败，请重试');
                setStage('done');
            });
        };
        generate();
    }, [initialPrompt]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        setMessages(prev => [...prev, { id: Date.now().toString(), text: inputValue, isUser: true }]);
        setInputValue('');
        // 这里只是个外壳，真实追问逻辑复用太复杂，我们仅做展示
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now().toString() + 'ai', text: '移动端演示仅支持查看首次生成结果。', isUser: false }]);
        }, 1000);
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
            {/* Header */}
            <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-500 active:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <div className="font-bold text-[15px]">新对话</div>
                <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Sparkles size={12} />
                    99999
                </div>
            </div>

            {/* Chat Flow */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                <div className="text-center text-xs text-gray-400 font-medium my-2">今天 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>

                {messages.map(msg => (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.isUser ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className={cn(
                            "px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed",
                            msg.isUser ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                        )}>
                            {msg.text}
                        </div>

                        {!msg.isUser && msg.html && (
                            <div className="mt-3 w-full bg-white border border-gray-200 rounded-2xl p-3 shadow-sm min-w-[280px]">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Wand2 size={16} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Web 应用已就绪</div>
                                        <div className="text-[11px] text-gray-500">包含完整的前后端逻辑</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPreview(true)}
                                    className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-indigo-600 font-bold text-[13px] rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-200/50"
                                >
                                    <Maximize2 size={14} />
                                    全屏预览
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {stage === 'generating' && (
                    <div className="mr-auto flex flex-col items-start gap-2 max-w-[85%]">
                        <div className="px-4 py-3 bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm shadow-sm text-sm flex items-center gap-3">
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                            {thinking}
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 shadow-lg">
                <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-1 border border-gray-200 focus-within:border-indigo-400 focus-within:ring-2 ring-indigo-50">
                    <input
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="继续追问..."
                        className="flex-1 bg-transparent border-none outline-none py-2.5 text-[14px]"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center rounded-full transition-all shrink-0",
                            inputValue.trim() ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-400"
                        )}
                    >
                        <Send size={14} className={inputValue.trim() ? "-translate-x-0.5 translate-y-0.5" : ""} />
                    </button>
                </div>
            </div>

            {/* Fullscreen Preview overlay */}
            <div className={cn(
                "fixed inset-0 sm:absolute z-[100] bg-white flex flex-col transition-transform duration-300 transform",
                showPreview ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Preview Header */}
                <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0 shadow-sm relative z-10">
                    <button onClick={() => setShowPreview(false)} className="p-2 -ml-2 text-gray-500 active:bg-gray-100 rounded-full flex items-center gap-1">
                        <ArrowLeft size={18} />
                        <span className="text-[13px] font-medium">返回</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 active:bg-gray-100 rounded-full">
                            <Share size={18} />
                        </button>
                        <button
                            onClick={() => setShowPublish(true)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-[13px] font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-1.5",
                                publishState.isPublished
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                    : "bg-indigo-600 text-white"
                            )}
                        >
                            {publishState.isPublished ? <><Check size={14} strokeWidth={3} /> 已发布</> : <><Globe size={14} /> 发布</>}
                        </button>
                    </div>
                </div>

                {/* Preview iframe */}
                <div className="flex-1 bg-gray-100 relative">
                    <iframe
                        srcDoc={htmlContent}
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full h-full border-none"
                    />
                </div>
            </div>

            {/* Publish Sheet */}
            <MobilePublishSheet
                isOpen={showPublish}
                onClose={() => setShowPublish(false)}
                publishState={publishState}
                setPublishState={setPublishState}
            />
        </div>
    );
}

