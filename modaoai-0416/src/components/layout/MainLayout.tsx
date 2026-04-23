import React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { WorkbenchSidebar } from '@/components/workbench/WorkbenchSidebar';
import { WorkbenchHeader } from '@/components/workbench/WorkbenchHeader';
import { useSidebarContext } from '@/context/SidebarContext';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { activeNav, viewMode, appSurface } = useSidebarContext();
    const isDesignSystem = activeNav === 'design-system';
    const isChat = viewMode === 'chat';
    const isWorkbench = !isChat && !isDesignSystem && appSurface === 'workbench-home';

    return (
        <div
            className={cn(
                'flex h-screen w-full overflow-hidden',
                isWorkbench ? 'bg-white' : 'bg-[#f8fafc]',
            )}
        >
            {isWorkbench ? <WorkbenchSidebar /> : <Sidebar />}
            <div className="flex-1 flex flex-col min-w-0 relative min-h-0">
                {!isChat && (isWorkbench ? <WorkbenchHeader /> : <Header />)}
                <main
                    className={cn(
                        isChat
                            ? 'flex-1 overflow-hidden'
                            : isDesignSystem
                              ? 'flex-1 overflow-y-auto px-6 py-6'
                              : isWorkbench
                                ? 'flex-1 overflow-y-auto bg-white px-4 pt-3 pb-5 md:px-8 md:pt-4 md:pb-6'
                                : 'flex-1 overflow-y-auto px-10 py-10',
                    )}
                >
                    {isChat ? (
                        <div className="w-full h-full flex">
                            {children}
                        </div>
                    ) : isDesignSystem ? (
                        <div className="w-full flex flex-col">
                            {children}
                        </div>
                    ) : (
                        <div className="flex w-full flex-col items-stretch">
                            {children}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
