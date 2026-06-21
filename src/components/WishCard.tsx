import { useBorrowStore } from '@/store/useBorrowStore';
import type { Wish } from '@/types';
import { Clock, User, CheckCircle, Archive, Trash2 } from 'lucide-react';

interface WishCardProps {
  wish: Wish;
}

export function WishCard({ wish }: WishCardProps) {
  const { setShowWishDetailModal, setSelectedWish, deleteWish, announcementRoommateId } = useBorrowStore();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const getStatusBadge = () => {
    switch (wish.status) {
      case 'active':
        return (
          <span className="text-xs px-2 py-0.5 bg-warning-100 text-warning-700 rounded-full font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            待借出
          </span>
        );
      case 'fulfilled':
        return (
          <span className="text-xs px-2 py-0.5 bg-success-100 text-success-700 rounded-full font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            已借出
          </span>
        );
      case 'archived':
        return (
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium flex items-center gap-1">
            <Archive className="w-3 h-3" />
            已归档
          </span>
        );
    }
  };

  const handleClick = () => {
    setSelectedWish(wish);
    setShowWishDetailModal(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个心愿吗？')) {
      deleteWish(wish.id);
    }
  };

  const getCardStyle = () => {
    switch (wish.status) {
      case 'active':
        return 'bg-white border-gray-200 hover:border-warning-300 hover:shadow-lg';
      case 'fulfilled':
        return 'bg-success-50 border-success-200 hover:border-success-300 hover:shadow-lg';
      case 'archived':
        return 'bg-gray-50 border-gray-200 opacity-80 hover:opacity-100';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${getCardStyle()}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl shrink-0">{wish.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-800 truncate">{wish.title}</h3>
            {getStatusBadge()}
          </div>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{wish.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span className="flex items-center gap-1">
                  <span>{wish.requesterAvatar}</span>
                  <span>{wish.requesterName}</span>
                </span>
              </div>
              {wish.lenderId && (
                <div className="flex items-center gap-1 text-xs text-success-600">
                  <span>→</span>
                  <span>{wish.lenderAvatar}</span>
                  <span>{wish.lenderName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">{formatDate(wish.createdAt)}</span>
              {announcementRoommateId === wish.requesterId && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-colors"
                  title="删除心愿"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {wish.expectedReturnDays !== undefined && wish.expectedReturnDays > 0 && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>预计{wish.expectedReturnDays}天内归还</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
