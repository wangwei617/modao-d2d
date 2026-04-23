import { tr } from '@/pc-en/tr';

const TITLES: Record<string, string> = {
    recent: '最近文件',
    fav: '我的收藏',
    plaza: '素材广场',
    'space-files': '我的文件',
    trash: '回收站',
    'space-admin': '空间管理',
    lib: '素材库',
};

/**
 * 工作台侧栏中「非首页」入口的占位，避免与主首页混为一谈。
 */
export function WorkbenchStubView({ viewKey }: { viewKey: string }) {
    const t = tr(TITLES[viewKey] ?? '页面');
    return (
        <div className="mx-auto flex w-full min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-2 px-6 text-center text-slate-500">
            <p className="text-lg font-semibold text-slate-800">{tr('功能建设中')}</p>
            <p className="text-sm text-slate-500">
                {t} · {tr('演示环境仅展示父级「墨刀工作台」导航结构')}
            </p>
        </div>
    );
}
