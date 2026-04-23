import { useState } from 'react';
import { X, Check, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobilePublishSheet({
    isOpen,
    onClose,
    publishState,
    setPublishState
}: {
    isOpen: boolean,
    onClose: () => void,
    publishState: any,
    setPublishState: any
}) {
    const [isPublishing, setIsPublishing] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
    const [isEditingUrl, setIsEditingUrl] = useState(false);
    const [editUrlValue, setEditUrlValue] = useState(publishState.url);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    };

    const formatPublishedAt = (date: Date) => {
        const diffInMinutes = Math.floor((new Date().getTime() - date.getTime()) / 60000);
        if (diffInMinutes < 1) return '刚刚';
        if (diffInMinutes < 60) return `${diffInMinutes} 分钟前`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} 小时前`;
        return `${Math.floor(diffInHours / 24)} 天前`;
    };

    return (
        <div className={cn(
            "fixed inset-0 z-[200] sm:absolute flex flex-col justify-end transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
            {/* Backdrop */}
            <div
                className={cn("absolute inset-0 bg-black/40 transition-opacity", isOpen ? "opacity-100" : "opacity-0")}
                onClick={() => {
                    if (!showWithdrawConfirm && !isWithdrawing) onClose();
                }}
            />

            {/* Toast inside sheet context */}
            {toast && (
                <div className={cn(
                    "absolute top-20 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl text-[14px] font-semibold animate-in slide-in-from-top-4 fade-in duration-300",
                    toast.type === 'success' ? "bg-gray-900 text-white" : "bg-red-600 text-white"
                )}>
                    {toast.message}
                </div>
            )}

            {/* Withdraw Confirm Dialog */}
            {showWithdrawConfirm && (
                <div className="absolute inset-0 z-[250] flex items-center justify-center p-6 bg-black/20 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-[320px] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                        <div className="flex gap-4">
                            <AlertCircle className="w-[24px] h-[24px] text-[#faad14] shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-gray-900 mb-2">确定要撤回发布吗？</h3>
                                <p className="text-[13px] text-gray-500 mb-6">撤回后线上链接将立即失效。</p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowWithdrawConfirm(false)}
                                        className="px-4 py-1.5 border border-gray-200 text-gray-700 bg-white rounded-lg text-[13px] font-semibold"
                                    >
                                        取消
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowWithdrawConfirm(false);
                                            setIsWithdrawing(true);
                                            setTimeout(() => {
                                                setIsWithdrawing(false);
                                                setPublishState((prev: any) => ({ ...prev, isPublished: false }));
                                                showToast('撤回成功');
                                            }, 1000);
                                        }}
                                        className="px-4 py-1.5 bg-[#1677ff] text-white rounded-lg text-[13px] font-semibold active:bg-[#4096ff]"
                                    >
                                        确定
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Sheet */}
            <div className={cn(
                "bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] w-full max-h-[90vh] flex flex-col relative z-[210] transition-transform duration-300 transform",
                isOpen ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <h2 className="text-lg font-bold text-gray-900">发布网站</h2>
                    <button onClick={onClose} className="p-2 -mr-2 bg-gray-50 text-gray-400 rounded-full active:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-6 flex flex-col gap-5 overflow-y-auto">
                    {/* Status Row */}
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] font-semibold text-gray-500">当前状态</span>
                        {publishState.isPublished ? (
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[13px] font-bold border border-emerald-100">
                                <Check size={14} strokeWidth={2.5} />
                                已发布
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[13px] font-bold border border-gray-200">
                                未发布
                            </div>
                        )}
                    </div>

                    {/* Published Time Row */}
                    {publishState.publishedAt && (
                        <div className="flex items-center justify-between">
                            <span className={cn("text-[14px] font-semibold", publishState.isPublished ? "text-gray-500" : "text-gray-400")}>最近发布时间</span>
                            <span className={cn("text-[14px] font-bold", publishState.isPublished ? "text-gray-900" : "text-gray-400")}>
                                {formatPublishedAt(publishState.publishedAt)} · V{publishState.version}
                            </span>
                        </div>
                    )}

                    {/* URL Edit */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[14px] font-semibold text-gray-500">访问链接</span>
                        <div className="flex flex-col gap-2">
                            <div className={cn("flex items-center border-2 rounded-xl px-3 py-2.5 transition-colors", isEditingUrl ? "border-indigo-400 bg-white" : "border-gray-100 bg-gray-50")}>
                                {isEditingUrl ? (
                                    <input
                                        autoFocus
                                        value={editUrlValue}
                                        onChange={e => setEditUrlValue(e.target.value)}
                                        className="flex-1 bg-transparent text-[14px] font-bold text-gray-900 outline-none w-full"
                                    />
                                ) : (
                                    <span
                                        className={cn(
                                            "flex-1 text-[14px] font-bold truncate active:opacity-70 transition-opacity",
                                            publishState.isPublished ? "text-indigo-600 underline underline-offset-4" : "text-gray-800"
                                        )}
                                        onClick={() => {
                                            if (!isEditingUrl) window.open(`https://${publishState.url}.modao.site`, '_blank');
                                        }}
                                    >
                                        {publishState.url}
                                    </span>
                                )}
                                <span className="text-[13px] font-bold text-gray-400 ml-1 shrink-0">.modao.site</span>
                            </div>

                            {/* Action Buttons below URL in mobile */}
                            <div className="flex justify-end gap-2 mt-1">
                                {isEditingUrl ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditingUrl(false)}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 font-bold text-[13px] rounded-xl active:bg-gray-200"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPublishState((prev: any) => ({ ...prev, url: editUrlValue }));
                                                setIsEditingUrl(false);
                                            }}
                                            className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold text-[13px] rounded-xl active:bg-indigo-200"
                                        >
                                            保存
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            disabled={publishState.isPublished}
                                            onClick={() => setIsEditingUrl(true)}
                                            className={cn("px-4 py-2 font-bold text-[13px] rounded-xl transition-colors", publishState.isPublished ? "bg-gray-50 text-gray-300" : "bg-gray-100 text-gray-600 active:bg-gray-200")}
                                        >
                                            编辑链接
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://${publishState.url}.modao.site`);
                                                showToast('✅ 链接已复制');
                                            }}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 font-bold text-[13px] rounded-xl flex items-center gap-1.5 active:bg-gray-200"
                                        >
                                            <Copy size={14} /> 复制
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-4 flex gap-3">
                        {publishState.isPublished ? (
                            <>
                                <button
                                    disabled={isWithdrawing}
                                    onClick={() => setShowWithdrawConfirm(true)}
                                    className="flex-1 h-[48px] rounded-2xl border-2 border-gray-200 text-gray-800 font-bold text-[15px] active:bg-gray-50 relative overflow-hidden"
                                >
                                    <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity", isWithdrawing ? "opacity-0" : "opacity-100")}>
                                        撤回
                                    </div>
                                    <div className={cn("absolute inset-0 flex items-center justify-center gap-2 transition-opacity text-gray-500", isWithdrawing ? "opacity-100" : "opacity-0")}>
                                        <RefreshCw size={16} className="animate-spin" /> 正在撤回...
                                    </div>
                                </button>
                                <button
                                    disabled={isPublishing}
                                    onClick={() => {
                                        setIsPublishing(true);
                                        setTimeout(() => {
                                            setIsPublishing(false);
                                            setPublishState((prev: any) => ({
                                                ...prev,
                                                version: prev.version + 1,
                                                publishedAt: new Date()
                                            }));
                                            showToast('✅ 更新成功！');
                                        }, 1000);
                                    }}
                                    className="flex-1 h-[48px] rounded-2xl bg-gray-900 text-white font-bold text-[15px] active:bg-black relative overflow-hidden"
                                >
                                    <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity", isPublishing ? "opacity-0" : "opacity-100")}>
                                        更新
                                    </div>
                                    <div className={cn("absolute inset-0 flex items-center justify-center gap-2 transition-opacity", isPublishing ? "opacity-100" : "opacity-0")}>
                                        <RefreshCw size={16} className="animate-spin" /> 正在更新...
                                    </div>
                                </button>
                            </>
                        ) : (
                            <button
                                disabled={isPublishing}
                                onClick={() => {
                                    setIsPublishing(true);
                                    setTimeout(() => {
                                        setIsPublishing(false);
                                        setPublishState((prev: any) => ({
                                            ...prev,
                                            isPublished: true,
                                            version: 1,
                                            publishedAt: new Date()
                                        }));
                                        showToast('✅ 发布成功！网站已上线');
                                    }, 1000);
                                }}
                                className="w-full h-[48px] rounded-2xl bg-gray-900 text-white font-bold text-[15px] active:bg-black relative overflow-hidden transition-colors"
                            >
                                <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity", isPublishing ? "opacity-0" : "opacity-100")}>
                                    发布
                                </div>
                                <div className={cn("absolute inset-0 flex items-center justify-center gap-2 transition-opacity", isPublishing ? "opacity-100" : "opacity-0")}>
                                    <RefreshCw size={16} className="animate-spin" /> 正在发布...
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

