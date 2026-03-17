import { useState } from 'react';
import { MobileHome } from './MobileHome';
import { MobileChat } from './MobileChat';

export type MobileViewMode = 'home' | 'chat';

export function MobileApp() {
    const [viewMode, setViewMode] = useState<MobileViewMode>('home');
    const [userPrompt, setUserPrompt] = useState('');

    const handleSendPrompt = (prompt: string) => {
        setUserPrompt(prompt);
        setViewMode('chat');
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center overflow-hidden">
            {/* 手机外壳容器，居中限制最大宽度，真实手机上铺满 */}
            <div className="w-full h-[100dvh] sm:max-w-[400px] bg-white sm:border-x border-slate-200 shadow-2xl relative flex flex-col overflow-hidden">
                {viewMode === 'home' ? (
                    <MobileHome onSend={handleSendPrompt} />
                ) : (
                    <MobileChat initialPrompt={userPrompt} onBack={() => setViewMode('home')} />
                )}
            </div>
        </div>
    );
}
