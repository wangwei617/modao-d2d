import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarContext } from '@/context/SidebarContext';

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { activeNav, viewMode } = useSidebarContext();
    const isDesignSystem = activeNav === 'design-system';
    const isChat = viewMode === 'chat';

    return (
        <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 relative">
                {!isChat && <Header />}
                <main className={
                    isChat ? "flex-1 overflow-hidden" :
                        isDesignSystem ? "flex-1 overflow-y-auto px-6 py-6" :
                            "flex-1 overflow-y-auto px-10 py-10"
                }>
                    {isChat ? (
                        <div className="w-full h-full flex">
                            {children}
                        </div>
                    ) : isDesignSystem ? (
                        <div className="w-full flex flex-col">
                            {children}
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto flex flex-col items-center">
                            {children}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
