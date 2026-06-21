import { useMemo, useState } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { EmptyState } from '@/components/EmptyState';
import { AddPhotoModal } from '@/components/AddPhotoModal';
import { TabBar } from '@/components/TabBar';
import { HouseSwitcher } from '@/components/HouseSwitcher';
import { Plus, Heart, Image, Users, Calendar, X } from 'lucide-react';
import { PHOTO_CATEGORIES } from '@/data/constants';
import type { PhotoCategory, Photo } from '@/types';

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;

  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatFullDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export default function PhotoAlbum() {
  const {
    photoFilter,
    setPhotoFilter,
    showAddPhotoModal,
    setShowAddPhotoModal,
    setShowHouseModal,
    setShowRoommateModal,
    getPhotosByCategory,
    getPhotoStats,
    togglePhotoLike,
    roommates,
    currentHouseId,
    setSelectedPhoto,
    selectedPhoto,
  } = useBorrowStore();

  const [likedAnimating, setLikedAnimating] = useState<string | null>(null);

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const currentUserId = currentRoommates[0]?.id || 'r1';

  const photos = useMemo(() => {
    return getPhotosByCategory(photoFilter);
  }, [getPhotosByCategory, photoFilter]);

  const stats = useMemo(() => getPhotoStats(), [getPhotoStats]);

  const photosByDate = useMemo(() => {
    const groups: Record<string, Photo[]> = {};
    photos.forEach((photo) => {
      const dateKey = formatDate(photo.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(photo);
    });
    return groups;
  }, [photos]);

  const getEmptyType = (): 'photo-all' | 'photo-dining' | 'photo-decoration' | 'photo-daily' | 'photo-party' | 'photo-travel' | 'photo-other' => {
    const typeMap: Record<string, 'photo-all' | 'photo-dining' | 'photo-decoration' | 'photo-daily' | 'photo-party' | 'photo-travel' | 'photo-other'> = {
      all: 'photo-all',
      dining: 'photo-dining',
      decoration: 'photo-decoration',
      daily: 'photo-daily',
      party: 'photo-party',
      travel: 'photo-travel',
      other: 'photo-other',
    };
    return typeMap[photoFilter] || 'photo-all';
  };

  const handleLike = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    togglePhotoLike(photoId, currentUserId);
    setLikedAnimating(photoId);
    setTimeout(() => setLikedAnimating(null), 400);
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseDetail = () => {
    setSelectedPhoto(null);
  };

  const waterfallColumns = useMemo(() => {
    const left: Photo[] = [];
    const right: Photo[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    photos.forEach((photo) => {
      const aspectRatio = photo.height / photo.width;
      if (leftHeight <= rightHeight) {
        left.push(photo);
        leftHeight += aspectRatio;
      } else {
        right.push(photo);
        rightHeight += aspectRatio;
      }
    });

    return { left, right };
  }, [photos]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 text-white rounded-b-3xl px-5 py-6 shadow-lg mb-4">
        <div className="flex items-center justify-between mb-4 gap-2">
          <HouseSwitcher onManageClick={() => setShowHouseModal(true)} />
          <button
            onClick={() => setShowRoommateModal(true)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-all active:scale-95"
            title="室友管理"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Image className="w-7 h-7" />
          合租相册
        </h1>
        <p className="text-sm text-white/80 mt-1">记录我们一起度过的美好时光 ✨</p>
      </div>

      <div className="px-4 pt-2">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Image className="w-4 h-4 text-pink-500" />
              <span className="text-xs text-gray-500">照片总数</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">总点赞</span>
            </div>
            <p className="text-xl font-bold text-red-500">{stats.totalLikes}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {PHOTO_CATEGORIES.map((option) => (
            <button
              key={option.key}
              onClick={() => setPhotoFilter(option.key as PhotoCategory | 'all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                photoFilter === option.key
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {photos.length === 0 ? (
          <EmptyState type={getEmptyType()} />
        ) : (
          <div className="space-y-6 pb-4">
            {Object.entries(photosByDate).map(([dateLabel, datePhotos]) => (
              <div key={dateLabel}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">{dateLabel}</span>
                  <span className="text-xs text-gray-400">
                    （{formatFullDate(datePhotos[0].createdAt)}）
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">{datePhotos.length}张</span>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    {waterfallColumns.left
                      .filter((p) => formatDate(p.createdAt) === dateLabel)
                      .map((photo) => (
                        <PhotoCard
                          key={photo.id}
                          photo={photo}
                          currentUserId={currentUserId}
                          likedAnimating={likedAnimating}
                          onLike={handleLike}
                          onClick={() => handlePhotoClick(photo)}
                        />
                      ))}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    {waterfallColumns.right
                      .filter((p) => formatDate(p.createdAt) === dateLabel)
                      .map((photo) => (
                        <PhotoCard
                          key={photo.id}
                          photo={photo}
                          currentUserId={currentUserId}
                          likedAnimating={likedAnimating}
                          onLike={handleLike}
                          onClick={() => handlePhotoClick(photo)}
                        />
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowAddPhotoModal(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40"
      >
        <Plus className="w-7 h-7" />
      </button>

      <TabBar />

      <AddPhotoModal
        isOpen={showAddPhotoModal}
        onClose={() => setShowAddPhotoModal(false)}
      />

      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          currentUserId={currentUserId}
          onClose={handleCloseDetail}
          onLike={(e) => handleLike(selectedPhoto.id, e)}
        />
      )}
    </div>
  );
}

interface PhotoCardProps {
  photo: Photo;
  currentUserId: string;
  likedAnimating: string | null;
  onLike: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
}

function PhotoCard({ photo, currentUserId, likedAnimating, onLike, onClick }: PhotoCardProps) {
  const isLiked = photo.likedBy.includes(currentUserId);
  const aspectRatio = (photo.height / photo.width) * 100;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
      onClick={onClick}
    >
      <div className="relative w-full" style={{ paddingBottom: `${aspectRatio}%` }}>
        <img
          src={photo.thumbnailUrl}
          alt={photo.title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-2.5">
        <h3 className="text-sm font-medium text-gray-800 truncate mb-1.5">{photo.title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-base">{photo.uploaderAvatar}</span>
            <span className="text-xs text-gray-500 truncate">{photo.uploaderName}</span>
          </div>
          <button
            onClick={(e) => onLike(photo.id, e)}
            className={`flex items-center gap-1 transition-all ${
              likedAnimating === photo.id ? 'scale-125' : ''
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'
              }`}
            />
            <span className={`text-xs ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
              {photo.likeCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface PhotoDetailModalProps {
  photo: Photo;
  currentUserId: string;
  onClose: () => void;
  onLike: (e: React.MouseEvent) => void;
}

function PhotoDetailModal({ photo, currentUserId, onClose, onLike }: PhotoDetailModalProps) {
  const isLiked = photo.likedBy.includes(currentUserId);
  const categoryLabel = PHOTO_CATEGORIES.find((c) => c.key === photo.category)?.label || '';
  const categoryEmoji = PHOTO_CATEGORIES.find((c) => c.key === photo.category)?.emoji || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md mx-4 rounded-3xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
        <div className="relative bg-black flex-shrink-0">
          <img
            src={photo.url}
            alt={photo.title}
            className="w-full max-h-[60vh] object-contain"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800 mb-1">{photo.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 flex items-center gap-1">
                  {categoryEmoji} {categoryLabel}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatFullDate(photo.createdAt)}
                </span>
              </div>
            </div>
            <button
              onClick={onLike}
              className={`flex flex-col items-center gap-0.5 transition-all ${
                isLiked ? 'scale-110' : ''
              }`}
            >
              <Heart
                className={`w-7 h-7 transition-colors ${
                  isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'
                }`}
              />
              <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                {photo.likeCount}
              </span>
            </button>
          </div>

          {photo.description && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{photo.description}</p>
          )}

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <span className="text-2xl">{photo.uploaderAvatar}</span>
            <div>
              <p className="text-sm font-medium text-gray-800">{photo.uploaderName}</p>
              <p className="text-xs text-gray-400">上传于 {formatDate(photo.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
