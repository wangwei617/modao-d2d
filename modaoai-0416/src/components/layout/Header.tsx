import { useSidebarContext } from '@/context/SidebarContext';
import { MODAO_WORKSPACE_URL } from '@/components/layout/SidebarWorkspace';
import { tr } from '@/pc-en/tr';

export function Header() {
    const { activeNav } = useSidebarContext();
    if (activeNav === 'design-system') return null;

    return (
        <header
            id="main-header"
            className="z-10 flex h-16 shrink-0 items-center justify-end gap-4 bg-transparent px-8"
        >
            <button type="button" className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
            </button>

            <button
                type="button"
                onClick={() => window.open(MODAO_WORKSPACE_URL, '_blank', 'noopener,noreferrer')}
                className="flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100"
            >
                <span className="rounded bg-purple-500 px-1 text-[10px] font-bold text-white" />
                {tr('HTML 转墨刀原型')}
            </button>

            <div className="flex items-center gap-3 rounded-full bg-indigo-50 py-1 pl-3 pr-1">
                <div className="flex items-center gap-1 text-xs font-medium text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    9999987...
                </div>
                <button
                    type="button"
                    className="rounded-full border border-indigo-100 bg-white px-3 py-0.5 text-xs font-medium text-indigo-600 shadow-sm transition-all hover:bg-indigo-50"
                >
                    {tr('购买')}
                </button>
            </div>
        </header>
    );
}
