import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown,
    MonitorSmartphone,
    Monitor,
    ImagePlus,
    ArrowUp,
    Check,
    Sun,
    Moon,
    Zap,
    Microscope,
    MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { tr } from '@/pc-en/tr';

// ---- 设计系统选项 ----
interface DesignSystem {
    id: string;
    name: string;
    icon: React.ReactNode;
    isShadcn?: boolean;
}

const DESIGN_SYSTEMS: DesignSystem[] = [
    {
        id: 'shadcn',
        name: 'Shadcn UI',
        isShadcn: true,
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="3" x2="21" y2="21" />
                <path d="M21 3L12 12" />
            </svg>
        ),
    },
    {
        id: 'ant',
        name: 'Ant Design',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z" stroke="#F5222D" strokeWidth="2" fill="none" />
                <path d="M12 6 L12 18 M6 9 L18 9 M6 15 L18 15" stroke="#F5222D" strokeWidth="1.5" />
            </svg>
        ),
    },
    {
        id: 'material',
        name: 'Material UI',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 5v14l4-4 4 8 4-8 4 4V5l-4 4-4-8-4 8z" fill="#0081CB" />
            </svg>
        ),
    },
    {
        id: 'arco',
        name: 'Arco Design',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 18 Q12 3 20 18" stroke="#406AFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx="12" cy="16" r="3" fill="#406AFF" />
            </svg>
        ),
    },
    {
        id: 'tdesign',
        name: 'TDesign',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M12 6v12" stroke="#0052D9" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        ),
    },
];

// ---- Shadcn 内置颜色主题 ----
interface Theme {
    id: string;
    name: string;
    colors: string[];
}

const SHADCN_THEMES: Theme[] = [
    // 面向“生成应用”场景：选择更通用、更稳妥的默认主题色集合（1 个自动 + 5 个常用色）
    { id: 'auto', name: '自动', colors: ['#6366f1', '#22c55e', '#f97316'] },
    { id: 'blue', name: '蓝', colors: ['#3b82f6', '#93c5fd'] },
    { id: 'green', name: '绿', colors: ['#22c55e', '#86efac'] },
    { id: 'purple', name: '紫', colors: ['#8b5cf6', '#c4b5fd'] },
    { id: 'orange', name: '橙', colors: ['#f97316', '#fdba74'] },
    { id: 'red', name: '红', colors: ['#ef4444', '#fca5a5'] },
];

const PRIMARY_COLORS = [
    { id: 'auto', gradient: 'conic-gradient(from 180deg at 50% 50%, #ff0000, #ff8000, #ffff00, #00ff00, #0000ff, #8000ff, #ff00ff, #ff0000)', label: '自动' },
    { id: 'blue', color: '#3b82f6', label: '蓝' },
    { id: 'green', color: '#22c55e', label: '绿' },
    { id: 'purple', color: '#8b5cf6', label: '紫' },
    { id: 'orange', color: '#f97316', label: '橙' },
    { id: 'red', color: '#ef4444', label: '红' },
];

// ---- 生成模式选项 ----
const GENERATION_MODES = [
    {
        id: 'fast',
        label: '极速模式',
        icon: 'fast',
        desc: '响应速度更快，适合简单问答'
    },
    {
        id: 'deep',
        label: '深度模式',
        icon: 'deep',
        desc: '内容质量更高，适合复杂任务'
    },
];

interface AdvancedConfigurationToolbarProps {
    showDesignSystemSelector?: boolean;
    inline?: boolean;
}

export function AdvancedConfigurationToolbar({ showDesignSystemSelector = true, inline = false }: AdvancedConfigurationToolbarProps) {
    const [selectedDS, setSelectedDS] = useState<DesignSystem>(DESIGN_SYSTEMS[0]);
    const [showDSDropdown, setShowDSDropdown] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState(SHADCN_THEMES[0]);
    const [selectedColor, setSelectedColor] = useState(PRIMARY_COLORS[0]);
    const [showConfigDropdown, setShowConfigDropdown] = useState(false);
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);
    const [darkMode, setDarkMode] = useState<'light' | 'dark'>('light');
    const [generationMode, setGenerationMode] = useState(GENERATION_MODES[0]);
    const [showModeDropdown, setShowModeDropdown] = useState(false);

    const dsRef = useRef<HTMLDivElement>(null);
    const configRef = useRef<HTMLDivElement>(null);
    const modeRef = useRef<HTMLDivElement>(null);
    const moreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dsRef.current && !dsRef.current.contains(e.target as Node)) setShowDSDropdown(false);
            if (configRef.current && !configRef.current.contains(e.target as Node)) setShowConfigDropdown(false);
            if (modeRef.current && !modeRef.current.contains(e.target as Node)) setShowModeDropdown(false);
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) setShowMoreDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close dropdowns on route/nav change (simulated via dependency on showDesignSystemSelector)
    useEffect(() => {
        setShowDSDropdown(false);
        setShowConfigDropdown(false);
        setShowModeDropdown(false);
        setShowMoreDropdown(false);
    }, [showDesignSystemSelector]);

    if (!showDesignSystemSelector) return null;

    return (
        <div className={cn("flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-300", !inline && "mt-4 pt-4 border-t border-gray-100")}>
            {/* Generation Mode Selector */}
            {!inline && (
                <div className="relative" ref={modeRef}>
                    <button
                        onClick={() => setShowModeDropdown(!showModeDropdown)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-100 bg-white rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        {generationMode.id === 'fast' ? (
                            <Zap size={13} className="text-amber-500" fill="currentColor" />
                        ) : (
                            <Microscope size={13} className="text-gray-600" />
                        )}
                        {generationMode.id === 'fast' ? tr('极速') : tr('深度')}
                        <ChevronDown size={12} className={cn("text-gray-300 transition-transform", showModeDropdown && "rotate-180")} />
                    </button>
                    {showModeDropdown && (
                        <div className="absolute bottom-full left-0 mb-2 z-[100] bg-white border border-gray-100 rounded-2xl shadow-xl p-2 w-[260px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex flex-col gap-1">
                                {GENERATION_MODES.map(mode => (
                                    <button
                                        key={mode.id}
                                        onClick={() => { setGenerationMode(mode); setShowModeDropdown(false); }}
                                        className={cn(
                                            "relative w-full flex items-center gap-3.5 p-3 rounded-xl text-left transition-all overflow-hidden group",
                                            generationMode.id === mode.id ? "bg-slate-50 border border-transparent shadow-sm" : "hover:bg-slate-50/50 border border-transparent"
                                        )}
                                    >
                                        {/* Corner Checked Triangle */}
                                        {generationMode.id === mode.id && (
                                            <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none z-10">
                                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-t-indigo-500 border-l-[32px] border-l-transparent rounded-tr-xl" />
                                                <Check size={12} strokeWidth={4} className="absolute top-1.5 right-1.5 text-white z-20" />
                                            </div>
                                        )}

                                        {/* Icon Box */}
                                        {mode.id === 'fast' ? (
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 shrink-0 flex items-center justify-center relative shadow-inner overflow-hidden">
                                                {/* Sparkle effects */}
                                                <div className="absolute top-1.5 left-1.5 text-white opacity-80"><svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 8.5L24 12l-9.5 3.5L12 24l-2.5-8.5L0 12l9.5-3.5z" /></svg></div>
                                                <div className="absolute bottom-2 right-2 text-white opacity-90"><svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.5 8.5L24 12l-9.5 3.5L12 24l-2.5-8.5L0 12l9.5-3.5z" /></svg></div>
                                                <Zap size={22} className="text-white relative z-10 drop-shadow-sm" fill="white" strokeWidth={1} />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                                                <Microscope size={24} className="text-slate-800" strokeWidth={2} />
                                            </div>
                                        )}

                                        {/* Texts */}
                                        <div className="flex-1">
                                            <div className="text-[14px] text-slate-800 font-bold tracking-tight mb-0.5">{tr(mode.label)}</div>
                                            <div className="text-[11px] text-slate-400 font-medium">{tr(mode.desc)}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Inline: merge Design System + Theme into a single "More" dropdown */}
            {inline ? (
                <div className="relative" ref={moreRef}>
                    <button
                        onClick={() => {
                            setShowMoreDropdown(v => !v);
                            setShowDSDropdown(false);
                            setShowConfigDropdown(false);
                        }}
                        className="flex items-center justify-center px-3 py-1.5 border border-gray-100 bg-white rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <MoreHorizontal size={14} className="text-gray-500" />
                    </button>
                    {showMoreDropdown && (
                        <div className="absolute top-full left-0 mt-2 z-[100] bg-white border border-gray-100 rounded-2xl shadow-xl p-4 w-[280px] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2 px-1">{tr('设计系统')}</div>
                            <div className="flex flex-col gap-1 mb-4">
                                {DESIGN_SYSTEMS.map(ds => (
                                    <button
                                        key={ds.id}
                                        onClick={() => { setSelectedDS(ds); }}
                                        className={cn(
                                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left group",
                                            selectedDS.id === ds.id ? "bg-indigo-50 text-indigo-600 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <span className={cn("shrink-0 transition-colors", selectedDS.id === ds.id ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")}>
                                            {ds.icon}
                                        </span>
                                        <span className="flex-1">{ds.name}</span>
                                        {selectedDS.id === ds.id && <Check size={12} strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>

                            {selectedDS.isShadcn ? (
                                <>
                                    <div className="flex items-center gap-2 text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2 px-1">
                                        {tr('主题色')}
                                    </div>
                                    <div className="flex justify-between items-center px-1">
                                        {SHADCN_THEMES.map(theme => (
                                            <div key={theme.id} className="relative flex justify-center group/theme">
                                                <button
                                                    onClick={() => { setSelectedTheme(theme); }}
                                                    className={cn(
                                                        "w-9 h-9 rounded-full transition-all border-2 shadow-sm",
                                                        selectedTheme.id === theme.id ? "border-indigo-500 scale-110 shadow-md" : "border-transparent hover:scale-105"
                                                    )}
                                                    style={{ background: `linear-gradient(135deg, ${theme.colors.join(', ')})` }}
                                                />
                                                {selectedTheme.id === theme.id && (
                                                    <Check size={14} strokeWidth={3} className="absolute inset-0 m-auto text-white drop-shadow" />
                                                )}
                                                <div className="absolute top-full mt-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/theme:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                    {tr(theme.name)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2 px-1">{tr('外观')}</div>
                                        <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100/50">
                                            <button
                                                onClick={() => setDarkMode('light')}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                                                    darkMode === 'light' ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                <Sun size={14} /> {tr('亮色')}
                                            </button>
                                            <button
                                                onClick={() => setDarkMode('dark')}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                                                    darkMode === 'dark' ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                                )}
                                            >
                                                <Moon size={14} /> {tr('暗色')}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2 px-1">{tr('主题色')}</div>
                                        <div className="flex justify-between items-center px-1">
                                            {PRIMARY_COLORS.map(c => (
                                                <div key={c.id} className="relative flex justify-center group/color">
                                                    <button
                                                        onClick={() => { setSelectedColor(c); }}
                                                        className={cn(
                                                            "w-9 h-9 rounded-full transition-all border-2 shadow-sm",
                                                            selectedColor.id === c.id ? "border-indigo-500 scale-110 shadow-md" : "border-transparent hover:scale-105"
                                                        )}
                                                        style={c.id === 'auto' ? { background: c.gradient } : { background: c.color }}
                                                    />
                                                    {selectedColor.id === c.id && (
                                                        <Check size={14} strokeWidth={3} className="absolute inset-0 m-auto text-white drop-shadow" />
                                                    )}
                                                    <div className="absolute top-full mt-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                        {tr(c.label)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Design System Selector */}
                    <div className="relative" ref={dsRef}>
                        <button
                            onClick={() => setShowDSDropdown(!showDSDropdown)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-100 bg-white rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <span className="text-gray-400">{selectedDS.icon}</span>
                            {selectedDS.name}
                            <ChevronDown size={12} className={cn("text-gray-300 transition-transform", showDSDropdown && "rotate-180")} />
                        </button>
                        {showDSDropdown && (
                            <div className="absolute top-full left-0 mt-2 z-[100] bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 w-48 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                {DESIGN_SYSTEMS.map(ds => (
                                    <button
                                        key={ds.id}
                                        onClick={() => { setSelectedDS(ds); setShowDSDropdown(false); }}
                                        className={cn(
                                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-left group",
                                            selectedDS.id === ds.id ? "bg-indigo-50 text-indigo-600 font-bold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <span className={cn("shrink-0 transition-colors", selectedDS.id === ds.id ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600")}>
                                            {ds.icon}
                                        </span>
                                        <span className="flex-1">{ds.name}</span>
                                        {selectedDS.id === ds.id && <Check size={12} strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Config Selector */}
                    <div className="relative" ref={configRef}>
                        <button
                            onClick={() => setShowConfigDropdown(!showConfigDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 bg-white rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            {selectedDS.isShadcn ? (
                                <>
                                    <div className="w-3 h-3 rounded-full shadow-inner" style={{ background: `linear-gradient(135deg, ${selectedTheme.colors.join(', ')})` }} />
                                    <span>{tr(selectedTheme.name)}</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-3 h-3 rounded-full shadow-inner" style={selectedColor.id === 'auto' ? { background: selectedColor.gradient } : { background: selectedColor.color }} />
                                    <span>{darkMode === 'light' ? tr('亮色') : tr('暗色')}</span>
                                </>
                            )}
                            <ChevronDown size={12} className={cn("text-gray-300 transition-transform", showConfigDropdown && "rotate-180")} />
                        </button>
                        {showConfigDropdown && (
                            <div className="absolute top-full left-0 mt-2 z-[100] bg-white border border-gray-100 rounded-2xl shadow-xl p-4 w-[240px] animate-in fade-in slide-in-from-top-2 duration-200">
                                {selectedDS.isShadcn ? (
                                    <>
                                        <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-3 px-1">{tr('主题色')}</div>
                                        <div className="flex justify-between items-center px-1">
                                            {SHADCN_THEMES.map(theme => (
                                                <div key={theme.id} className="relative flex justify-center group/theme">
                                                    <button
                                                        onClick={() => { setSelectedTheme(theme); }}
                                                        className={cn(
                                                            "w-9 h-9 rounded-full transition-all border-2 shadow-sm",
                                                            selectedTheme.id === theme.id ? "border-indigo-500 scale-110 shadow-md" : "border-transparent hover:scale-105"
                                                        )}
                                                        style={{ background: `linear-gradient(135deg, ${theme.colors.join(', ')})` }}
                                                    />
                                                    {selectedTheme.id === theme.id && (
                                                        <Check size={14} strokeWidth={3} className="absolute inset-0 m-auto text-white drop-shadow" />
                                                    )}
                                                    <div className="absolute top-full mt-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/theme:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                        {tr(theme.name)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-4">
                                            <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2 px-1">{tr('外观')}</div>
                                            <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100/50">
                                                <button
                                                    onClick={() => setDarkMode('light')}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                                                        darkMode === 'light' ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                                    )}
                                                >
                                                    <Sun size={14} /> {tr('亮色')}
                                                </button>
                                                <button
                                                    onClick={() => setDarkMode('dark')}
                                                    className={cn(
                                                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                                                        darkMode === 'dark' ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                                    )}
                                                >
                                                    <Moon size={14} /> {tr('暗色')}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase font-black text-gray-400 tracking-wider mb-2 px-1">{tr('主题色')}</div>
                                            <div className="flex justify-between items-center px-1">
                                                {PRIMARY_COLORS.map(c => (
                                                    <div key={c.id} className="relative flex justify-center group/color">
                                                        <button
                                                            onClick={() => setSelectedColor(c)}
                                                            className={cn(
                                                                "w-9 h-9 rounded-full transition-all border-2 shadow-sm",
                                                                selectedColor.id === c.id ? "border-indigo-500 scale-110 shadow-md" : "border-transparent hover:scale-105"
                                                            )}
                                                            style={c.id === 'auto' ? { background: c.gradient } : { background: c.color }}
                                                        />
                                                        {selectedColor.id === c.id && (
                                                            <Check size={14} strokeWidth={3} className="absolute inset-0 m-auto text-white drop-shadow" />
                                                        )}
                                                        <div className="absolute top-full mt-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] font-bold rounded opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                            {tr(c.label)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Device Switcher */}
            {!inline && (
                <div className="flex items-center p-0.5 bg-gray-100/50 rounded-lg border border-gray-100 shadow-inner">
                    <button className="p-1 px-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <MonitorSmartphone size={14} />
                    </button>
                    <button className="p-1 px-2 bg-white rounded-md shadow-sm text-indigo-600 transition-all border-y border-transparent">
                        <Monitor size={14} />
                    </button>
                </div>
            )}

            {/* Action Buttons */}
            {!inline && (
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 hidden sm:flex">
                        <ImagePlus size={18} strokeWidth={1.5} />
                    </Button>
                    <Button size="icon" className="h-9 w-9 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg transition-all hover:scale-105 active:scale-95">
                        <ArrowUp size={18} strokeWidth={2.5} />
                    </Button>
                </div>
            )}
        </div>
    );
}
