import { useSidebarContext } from '@/context/SidebarContext';
import { tr } from '@/pc-en/tr';

export function Header() {
    const { activeNav } = useSidebarContext();
    if (activeNav === 'design-system') return null;

    return (
        <header id="main-header" className="h-16 flex items-center justify-end px-8 gap-4 flex-shrink-0 z-10 bg-transparent">
            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
            </button>

            <button
                className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            >
                <span className="bg-purple-500 text-white rounded px-1 text-[10px] font-bold"></span>
                {tr('HTML 转墨刀原型')}
            </button>

            <div className="flex items-center bg-indigo-50 rounded-full px-1 pl-3 py-1 gap-3">
                <div className="flex items-center gap-1 text-indigo-600 text-xs font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                        stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                    9999987...
                </div>
                <button
                    className="bg-white text-indigo-600 px-3 py-0.5 rounded-full text-xs font-medium hover:bg-indigo-50 border border-indigo-100 shadow-sm transition-all"
                >
                    {tr('购买')}
                </button>
            </div>

            {/* User avatar moved here to match monolithic flex container if necessary, but monolithic has it in aside and main-header */}
            {/* The monolithic actually has the user info in the Sidebar at the bottom, so I'll stick to that. */}
        </header>
    );
}
