import { useState } from 'react';
import { Send, Search, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileHome({ onSend }: { onSend: (prompt: string) => void }) {
    const [inputValue, setInputValue] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const tabs = [
        { id: 'recommend', label: '推荐', icon: <Sparkles size={20} />, bg: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)', color: '#6366f1' },
        { id: 'generate', label: '生成应用', icon: <Wand2 size={20} />, bg: 'linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)', color: '#a855f7' },
        { id: 'prototype', label: '原型设计', icon: <ImageIcon size={20} />, bg: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)', color: '#3b82f6' },
    ];

    const generateCards = [
        { title: '生成 Web 应用', desc: '一键生成全栈网页代码' },
        { title: '生成 App 应用', desc: '一键生成移动端页面代码' },
    ];

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Navbar */}
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-sm bg-white" />
                    </div>
                    <span className="font-bold text-[15px] tracking-tight">墨刀 AI</span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-gray-500 hover:bg-gray-100 p-1.5 rounded-full">
                        <Search size={18} />
                    </button>
                    <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles size={12} />
                        购买
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-5 pt-8 pb-32">
                <div className="text-center mb-8">
                    <div className="text-[13px] font-bold text-gray-500 mb-1 flex items-center justify-center gap-1">
                        产品团队 <span className="text-indigo-600">超级智能体✨</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-2">
                        下午好，我能如何帮助您
                    </h1>
                </div>

                {/* Horizontal Scroll Tabs */}
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory px-1">
                    {tabs.map(tab => (
                        <div key={tab.id} className="flex flex-col items-center gap-2 shrink-0 snap-center">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: tab.color }}>
                                {tab.icon}
                            </div>
                            <span className="text-xs font-medium text-gray-600">{tab.label}</span>
                        </div>
                    ))}
                </div>

                {/* Sub Cards (Only shown if 'generate' conceptually active - hardcoded here for demo flow) */}
                <div className="mt-4 flex flex-col gap-3">
                    {generateCards.map(card => (
                        <button
                            key={card.title}
                            onClick={() => setSelectedTag(card.title)}
                            className={cn(
                                "flex items-center p-4 border rounded-2xl text-left transition-all",
                                selectedTag === card.title 
                                    ? "border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500" 
                                    : "border-gray-100 bg-white hover:border-gray-200"
                            )}
                        >
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mr-4 shrink-0">
                                <Wand2 size={18} />
                            </div>
                            <div className="flex-1">
                                <h3 className={cn("text-sm font-bold mb-0.5", selectedTag === card.title ? "text-indigo-900" : "text-gray-900")}>
                                    {card.title}
                                </h3>
                                <p className="text-xs text-gray-500">{card.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                {selectedTag && (
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                            <span className="bg-yellow-50 text-yellow-700 text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                ⚡️ 极速
                            </span>
                            <span className="bg-gray-100 text-gray-700 text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                Shadcn UI
                            </span>
                            <span className="bg-rose-50 text-rose-600 text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                智能推荐
                            </span>
                        </div>
                    </div>
                )}
                
                <div className={cn(
                    "flex flex-col gap-2 p-3 rounded-2xl border transition-all",
                    inputValue ? "border-indigo-300 ring-4 ring-indigo-50" : "border-gray-200 bg-gray-50/50"
                )}>
                    {selectedTag && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold w-fit mb-1">
                            {selectedTag}
                            <button onClick={() => setSelectedTag(null)}><X size={12}/></button>
                        </div>
                    )}
                    <textarea
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="请输入需求..."
                        className="w-full bg-transparent border-none outline-none resize-none text-[15px] placeholder:text-gray-400 h-[48px] px-1"
                    />
                    <div className="flex items-center justify-between mt-1">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <ImageIcon size={20} />
                        </button>
                        <button
                            onClick={() => onSend((selectedTag ? `[${selectedTag}] ` : '') + inputValue)}
                            disabled={!inputValue.trim()}
                            className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                                inputValue.trim() ? "bg-indigo-600 text-white shadow-md" : "bg-gray-200 text-gray-400"
                            )}
                        >
                            <Send size={16} className={inputValue.trim() ? "translate-x-[-1px] translate-y-[1px]" : ""} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function X({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
