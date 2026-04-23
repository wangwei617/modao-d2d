import { useState } from 'react';
import { ChevronLeft, Save, Plus, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tr } from '@/pc-en/tr';

interface GlobalStyleCustomizerProps {
    designSystem: any;
    onClose: () => void;
    onSave?: () => void;
}

const TABS = [
    { id: 'color', label: 'Color' },
    { id: 'typography', label: 'Typography' },
    { id: 'radius', label: 'Radius' },
    { id: 'shadow', label: 'Shadow' },
];

const MOCK_COLORS = [
    { label: 'Primary', value: '#2C6CFF', foreground: '#FFFFFF' },
    { label: 'Secondary', value: '#E2EFFF', foreground: '#0A1120' },
    { label: 'Accent', value: '#F3F8FE', foreground: '#165DFF' },
    { label: 'Background', value: '#FFFFFF', foreground: '#0A1120' },
    { label: 'Card', value: '#FFFFFF', foreground: '#0A1120' },
    { label: 'Popover', value: '#FFFFFF', foreground: '#0A1120' },
    { label: 'Muted', value: '#FAFAFB', foreground: '#898C93' },
    { label: 'Destructive', value: '#F84721', foreground: '#FFFFFF' },
    { label: 'Border', value: '#E9E9E9', foreground: '' },
    { label: 'Input', value: '#E7E6E6', foreground: '' },
    { label: 'Ring', value: '#B7D4FB', foreground: '' },
    { label: 'Chart 1', value: '#B1B7FF', foreground: '' },
    { label: 'Chart 2', value: '#4080FF', foreground: '' },
];

export function GlobalStyleCustomizer({ onClose, onSave }: GlobalStyleCustomizerProps) {
    const [activeTab, setActiveTab] = useState('color');
    const [colors, setColors] = useState(MOCK_COLORS);
    const [previewType, setPreviewType] = useState<'APP' | 'WEB' | 'WORKBENCH'>('APP');
    const [showPreviewDropdown, setShowPreviewDropdown] = useState(false);

    const handleColorChange = (index: number, field: 'value' | 'foreground', newValue: string) => {
        const newColors = [...colors];
        newColors[index] = { ...newColors[index], [field]: newValue };
        setColors(newColors);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-2xl w-full h-full max-w-[1440px] flex flex-col overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span className="font-medium text-sm">Back</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            className="px-4 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                            onClick={onSave}
                        >
                            Save
                        </button>
                        <button
                            className="px-4 py-1.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                            onClick={onSave}
                        >
                            <Save size={16} />
                            Save as
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Customization Panel */}
                    <div className="w-[320px] border-r border-slate-100 flex flex-col p-6 overflow-y-auto">
                        <h2 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Global style customization</h2>

                        {/* Tabs */}
                        <div className="flex bg-slate-50 p-1 rounded-lg mb-8">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                        activeTab === tab.id ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Color Inputs */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                            {colors.map((color, idx) => (
                                <div key={color.label} className="flex flex-col gap-1.5">
                                    <label className="text-[11px] text-slate-400 font-medium">{color.label}</label>
                                    <div className="flex items-center gap-2 border border-slate-100 rounded-md p-1.5">
                                        <div
                                            className="w-4 h-4 rounded-sm shrink-0 border border-slate-200"
                                            style={{ backgroundColor: color.value }}
                                        />
                                        <input
                                            type="text"
                                            value={color.value}
                                            onChange={(e) => handleColorChange(idx, 'value', e.target.value)}
                                            className="text-[11px] outline-none text-slate-600 w-full"
                                        />
                                    </div>
                                    {color.foreground !== '' && (
                                        <>
                                            <label className="text-[11px] text-slate-400 font-medium mt-1">{color.label} Foreground</label>
                                            <div className="flex items-center gap-2 border border-slate-100 rounded-md p-1.5">
                                                <div
                                                    className="w-4 h-4 rounded-sm shrink-0 border border-slate-200"
                                                    style={{ backgroundColor: color.foreground }}
                                                />
                                                <input
                                                    type="text"
                                                    value={color.foreground}
                                                    onChange={(e) => handleColorChange(idx, 'foreground', e.target.value)}
                                                    className="text-[11px] outline-none text-slate-600 w-full"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Preview Panel */}
                    <div className="flex-1 bg-[#FDFDFD] p-10 overflow-auto flex flex-col items-center">
                        <div className="w-full max-w-5xl">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <span>Preview</span>
                                    <span>/</span>
                                    <div className="relative">
                                        <button
                                            className="flex items-center gap-1 text-slate-800 font-medium hover:bg-slate-50 px-2 py-1 rounded"
                                            onClick={() => setShowPreviewDropdown(!showPreviewDropdown)}
                                        >
                                            {previewType === 'WORKBENCH' ? tr('工作台') : previewType} <ChevronLeft className="-rotate-90" size={14} />
                                        </button>

                                        {showPreviewDropdown && (
                                            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 shadow-lg rounded-lg py-1 w-32 z-50">
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                                    onClick={() => { setPreviewType('APP'); setShowPreviewDropdown(false); }}
                                                >APP</button>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                                    onClick={() => { setPreviewType('WEB'); setShowPreviewDropdown(false); }}
                                                >WEB</button>
                                                <button
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                                    onClick={() => { setPreviewType('WORKBENCH'); setShowPreviewDropdown(false); }}
                                                >{tr('工作台')}</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mock App Screens Grid (Image 2 style) */}
                            <div className="flex gap-8 justify-center overflow-x-auto pb-4">
                                {/* Screen 1 */}
                                <div className="w-[280px] h-[580px] bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-900 overflow-hidden relative shrink-0">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-2xl z-10" />
                                    <div className="p-6 h-full flex flex-col" style={{ background: `linear-gradient(to bottom, ${colors[0].value}, ${colors[0].value}ee)` }}>
                                        <div className="flex justify-between items-center mb-10 mt-4 text-white">
                                            <span className="text-xl font-bold">Hi Alice</span>
                                            <Plus size={24} />
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-white mb-6">
                                            <div className="text-xs opacity-70 mb-2">Today's calories</div>
                                            <div className="text-4xl font-black mb-1">766 <span className="text-sm font-normal opacity-70">kcal over</span></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 mb-10 text-white">
                                            <div className="bg-white/20 rounded-xl p-3 text-center">
                                                <div className="text-xs opacity-70">Carbs</div>
                                                <div className="font-bold">211g</div>
                                            </div>
                                            <div className="bg-white/20 rounded-xl p-3 text-center">
                                                <div className="text-xs opacity-70">Protein</div>
                                                <div className="font-bold">102g</div>
                                            </div>
                                            <div className="bg-white/20 rounded-xl p-3 text-center">
                                                <div className="text-xs opacity-70">Fat</div>
                                                <div className="font-bold">15g</div>
                                            </div>
                                        </div>
                                        {/* ... more mock content ... */}
                                        <div className="mt-auto flex justify-between px-2 pb-2 text-white/50">
                                            <div className="flex flex-col items-center gap-1 text-white"><ArrowUp size={20} /><span className="text-[10px]">Home</span></div>
                                            <div className="flex flex-col items-center gap-1"><ArrowUp size={20} /><span className="text-[10px]">Health</span></div>
                                            <div className="flex flex-col items-center gap-1"><ArrowUp size={20} /><span className="text-[10px]">Shop</span></div>
                                            <div className="flex flex-col items-center gap-1"><ArrowUp size={20} /><span className="text-[10px]">Mine</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Screen 2 */}
                                <div className="w-[280px] h-[580px] bg-white rounded-[40px] shadow-xl border-[4px] border-slate-50 overflow-hidden relative shrink-0">
                                    <div className="p-6 h-full flex flex-col bg-white">
                                        <div className="flex items-center justify-between mb-8 mt-2">
                                            <h3 className="text-2xl font-black">Health</h3>
                                        </div>
                                        <div className="flex gap-4 mb-6">
                                            <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                                                <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><ArrowUp size={10} /> Weight</div>
                                                <div className="text-xl font-bold">62.00 <span className="text-[10px] font-normal">kg</span></div>
                                            </div>
                                            <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                                                <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1"><ArrowUp size={10} /> Distance</div>
                                                <div className="text-xl font-bold">5.6 <span className="text-[10px] font-normal">km</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-4 flex-1 mb-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-[10px] text-slate-400 flex items-center gap-1"><ArrowUp size={10} /> Sleep duration</div>
                                                <div className="text-xs font-bold">8h 27min</div>
                                            </div>
                                            <div className="flex items-end gap-1.5 h-32 pt-4">
                                                {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-indigo-500 rounded-t-sm" style={{ height: `${h}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-between px-2 pb-2 text-slate-400">
                                            <div className="flex flex-col items-center gap-1"><ArrowUp size={20} /><span className="text-[10px]">Home</span></div>
                                            <div className="flex flex-col items-center gap-1 text-indigo-500 font-bold"><ArrowUp size={20} /><span className="text-[10px]">Health</span></div>
                                            <div className="flex flex-col items-center gap-1"><ArrowUp size={20} /><span className="text-[10px]">Shop</span></div>
                                            <div className="flex flex-col items-center gap-1"><ArrowUp size={20} /><span className="text-[10px]">Mine</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* More screens could be added here for a full carousel effect */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
