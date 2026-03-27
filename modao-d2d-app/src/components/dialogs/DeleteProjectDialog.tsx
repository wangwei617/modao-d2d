import { X } from 'lucide-react';
import { tr } from '@/pc-en/tr';

export function DeleteProjectDialog({
  open,
  onOpenChange,
  onConfirmDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}) {
  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const handleDelete = () => {
    onConfirmDelete();
    onOpenChange(false);
  };

  const bodyLine1 = tr('确定要删除项目吗？删除后，已发布的应用和分享链接将一并失效');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-lg w-[416px] max-w-[calc(100vw-2rem)] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-project-title"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={tr('关闭')}
        >
          <X size={18} />
        </button>

        <h3 id="delete-project-title" className="text-base font-semibold text-gray-900 mb-3 pr-8">
          {tr('删除项目')}
        </h3>
        <p className="text-[14px] text-gray-500 mb-2 leading-relaxed">{bodyLine1}</p>
        <p className="text-[14px] text-gray-500 mb-6">{tr('此操作不可恢复。')}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-[5px] border border-[#d9d9d9] text-gray-700 bg-white rounded-md text-[14px] hover:border-indigo-400 hover:text-indigo-500 transition-colors"
          >
            {tr('取消')}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-[5px] bg-red-600 text-white rounded-md text-[14px] hover:bg-red-700 transition-colors shadow-sm"
          >
            {tr('删除')}
          </button>
        </div>
      </div>
    </div>
  );
}
