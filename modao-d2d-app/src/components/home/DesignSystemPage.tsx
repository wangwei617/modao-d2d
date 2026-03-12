import { Plus } from 'lucide-react';
import { useSidebarContext } from '@/context/SidebarContext';

// 图4中 Shadcn 的默认颜色主题缩略图
const DEFAULT_THEMES = [
    {
        id: 'airy-blue',
        name: 'Airy Blue',
        preview: 'https://placehold.co/100x70/3b82f6/1e3a5f?text=',
        bg: 'linear-gradient(135deg, #bfdbfe 0%, #3b82f6 100%)',
        darkBg: '#1e3a5f',
    },
    {
        id: 'zephyr-green',
        name: 'Zephyr Green',
        preview: '',
        bg: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)',
        darkBg: '#052e16',
    },
    {
        id: 'misty-violet',
        name: 'Misty Violet',
        preview: '',
        bg: 'linear-gradient(135deg, #ede9fe 0%, #8b5cf6 100%)',
        darkBg: '#2e1065',
    },
    {
        id: 'vintage-mocha',
        name: 'Vintage Mocha',
        preview: '',
        bg: 'linear-gradient(135deg, #fef3c7 0%, #92400e 100%)',
        darkBg: '#301b07',
    },
    {
        id: 'sunbeam',
        name: 'Sunbeam',
        preview: '',
        bg: 'linear-gradient(135deg, #fef9c3 0%, #f59e0b 100%)',
        darkBg: '#3a2500',
    },
];

export function DesignSystemPage() {
    const { customSystems, setEditingSystem } = useSidebarContext();

    return (
        <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-300">
            {/* Default Design Systems */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-5">Default Design Systems</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {DEFAULT_THEMES.map(theme => (
                        <div
                            key={theme.id}
                            className="group cursor-pointer flex flex-col gap-2"
                            onClick={() => setEditingSystem(theme)}
                        >
                            {/* 主题预览卡片 */}
                            <div
                                className="w-full aspect-[4/3] rounded-xl border border-slate-100 group-hover:border-indigo-200 group-hover:shadow-md transition-all overflow-hidden relative"
                                style={{ background: theme.bg }}
                            >
                                {/* 模拟 UI 元素 */}
                                <div className="absolute inset-0 p-2 flex flex-col gap-1.5 opacity-60">
                                    <div className="h-2 w-2/3 rounded-sm bg-white/50" />
                                    <div className="h-1.5 w-full rounded-sm bg-white/30" />
                                    <div className="h-1.5 w-4/5 rounded-sm bg-white/30" />
                                    <div className="h-2.5 w-1/3 rounded bg-white/70 mt-auto" />
                                </div>
                                {/* Dark preview strip */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-1/3 opacity-70"
                                    style={{ background: theme.darkBg }}
                                />
                            </div>
                            <span className="text-[13px] font-medium text-slate-600 group-hover:text-indigo-600 transition-colors text-center">
                                {theme.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Your Design System */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-5">Your Design System</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {customSystems.map(theme => (
                        <div
                            key={theme.id}
                            className="group cursor-pointer flex flex-col gap-2"
                            onClick={() => setEditingSystem(theme)}
                        >
                            <div
                                className="w-full aspect-[4/3] rounded-xl border border-slate-100 group-hover:border-indigo-200 group-hover:shadow-md transition-all overflow-hidden relative"
                                style={{ background: theme.bg }}
                            >
                                <div className="absolute inset-0 p-2 flex flex-col gap-1.5 opacity-60">
                                    <div className="h-2 w-2/3 rounded-sm bg-white/50" />
                                    <div className="h-1.5 w-full rounded-sm bg-white/30" />
                                </div>
                                <div
                                    className="absolute bottom-0 left-0 right-0 h-1/3 opacity-70"
                                    style={{ background: theme.darkBg }}
                                />
                            </div>
                            <span className="text-[13px] font-medium text-slate-600 group-hover:text-indigo-600 transition-colors text-center">
                                {theme.name}
                            </span>
                        </div>
                    ))}

                    {/* 创建新的设计系统 */}
                    <div className="group cursor-pointer flex flex-col gap-2" onClick={() => setEditingSystem({ name: 'New System' })}>
                        <div className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50/30 transition-all flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                <Plus size={22} strokeWidth={1.5} />
                                <span className="text-[11px] font-medium">Create</span>
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-slate-400 group-hover:text-indigo-500 transition-colors text-center">
                            新建
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
