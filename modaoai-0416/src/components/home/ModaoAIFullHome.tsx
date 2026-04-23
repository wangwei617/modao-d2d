import { cn } from '@/lib/utils';
import { Greeting } from '@/components/home/Greeting';
import { PromptInput } from '@/components/home/PromptInput';
import { FeatureCards } from '@/components/home/FeatureCards';

type ModaoAIFullHomeProps = {
    /**
     * 在父级墨刀工作台中，若两句 slogan 已渲染在六卡 Tab 之上，此处不再重复 Greeting。
     * 独立 AI 首页（`appSurface=ai-home`）保持默认，展示在输入框上方。
     */
    omitGreeting?: boolean;
    /**
     * 在墨刀工作台由父级单独通栏渲染「精选案例」时传 true，避免与下方重复且不再受 1100px 限制。
     */
    noFeatureCards?: boolean;
};

/** 与独立 `appSurface=ai-home` 时主区一致的墨刀 AI 首页（问候 + 输入 + 能力卡片） */
export function ModaoAIFullHome({ omitGreeting = false, noFeatureCards = false }: ModaoAIFullHomeProps) {
    const workbenchW = omitGreeting;
    return (
        <>
            <div
                className={cn(
                    'mx-auto flex w-full min-w-0 flex-col items-center',
                    workbenchW ? 'max-w-[1100px]' : 'max-w-6xl',
                )}
            >
                {!omitGreeting && <Greeting />}
                <PromptInput alignWithWorkbenchTabWidth={workbenchW} />
            </div>
            {!noFeatureCards && (
                <div
                    className={cn(
                        'box-border w-full',
                        workbenchW ? 'mx-auto max-w-[1100px] px-6' : 'px-[24px]',
                    )}
                >
                    <FeatureCards />
                </div>
            )}
        </>
    );
}
