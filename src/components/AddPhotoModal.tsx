import { useState, useEffect, useMemo, useRef } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import type { PhotoCategory, Roommate } from '@/types';
import { X, Plus, ChevronDown, Image as ImageIcon, Upload } from 'lucide-react';
import { PHOTO_CATEGORY_OPTIONS } from '@/data/constants';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PROMPTS = [
  { label: '聚餐美食', prompt: '合租室友一起吃火锅聚餐，温馨的餐桌，丰富的食材', category: 'dining' as PhotoCategory, emoji: '🍽️' },
  { label: '客厅布置', prompt: '温馨整洁的合租公寓客厅，有绿植装饰，暖色调灯光', category: 'decoration' as PhotoCategory, emoji: '🏡' },
  { label: '生日派对', prompt: '生日派对场景，蛋糕、气球、彩带，朋友们一起庆祝', category: 'party' as PhotoCategory, emoji: '🎉' },
  { label: '一起早餐', prompt: '合租厨房做早餐，桌上有面包、牛奶、煎蛋，阳光洒进来', category: 'daily' as PhotoCategory, emoji: '☀️' },
  { label: '户外野餐', prompt: '年轻人在郊外公园野餐，蓝天白云，草地美食', category: 'travel' as PhotoCategory, emoji: '✈️' },
];

export function AddPhotoModal({ isOpen, onClose }: AddPhotoModalProps) {
  const { addPhoto, roommates, currentHouseId } = useBorrowStore();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PhotoCategory>('dining');
  const [uploaderId, setUploaderId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showUploaders, setShowUploaders] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 400, height: 400 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setCategory('dining');
      setUploaderId(currentRoommates[0]?.id || '');
      setImageUrl('');
      setImageSize({ width: 400, height: 400 });
      setShowCategories(false);
      setShowUploaders(false);
    }
  }, [isOpen, currentRoommates]);

  const handleSelectCategory = (cat: PhotoCategory) => {
    setCategory(cat);
    setShowCategories(false);
  };

  const handleSelectUploader = (roommate: Roommate) => {
    setUploaderId(roommate.id);
    setShowUploaders(false);
  };

  const handleUseSample = (prompt: string, cat: PhotoCategory, label: string) => {
    const sizes: Record<string, { w: number; h: number }> = {
      dining: { w: 400, h: 300 },
      decoration: { w: 400, h: 533 },
      party: { w: 400, h: 400 },
      daily: { w: 400, h: 300 },
      travel: { w: 400, h: 533 },
      other: { w: 400, h: 400 },
    };
    const sizeKey = sizes[cat] || sizes.other;
    const sizeParam = sizeKey.h > sizeKey.w ? 'portrait_4_3' : sizeKey.h < sizeKey.w ? 'landscape_4_3' : 'square';
    const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${sizeParam}`;
    setImageUrl(url);
    setCategory(cat);
    setImageSize({ width: sizeKey.w, height: sizeKey.h });
    if (!title) setTitle(label);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);

      const img = document.createElement('img');
      img.onload = () => {
        const maxWidth = 400;
        const ratio = maxWidth / img.width;
        setImageSize({
          width: maxWidth,
          height: Math.round(img.height * ratio),
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!title.trim() || !imageUrl || !uploaderId) return;

    const uploader = currentRoommates.find((r) => r.id === uploaderId);
    if (!uploader) return;

    addPhoto({
      url: imageUrl,
      thumbnailUrl: imageUrl,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      uploaderId,
      uploaderName: uploader.name,
      uploaderAvatar: uploader.avatar,
      height: imageSize.height,
      width: imageSize.width,
    });

    onClose();
  };

  const selectedCategory = PHOTO_CATEGORY_OPTIONS.find((o) => o.key === category);
  const selectedUploader = currentRoommates.find((r) => r.id === uploaderId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-2xl">📸</span>
            上传照片
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              照片
            </label>
            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
                <img
                  src={imageUrl}
                  alt="预览"
                  className="w-full object-cover max-h-64"
                />
                <button
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary-400 hover:bg-primary-50 transition-all"
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">本地上传</span>
                  </button>
                  <div className="flex flex-col items-center justify-center gap-1 p-3 border-2 border-gray-200 rounded-2xl bg-gray-50">
                    <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 mb-1">快速生成</span>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {SAMPLE_PROMPTS.slice(0, 3).map((s) => (
                        <button
                          key={s.label}
                          onClick={() => handleUseSample(s.prompt, s.category, s.label)}
                          className="text-[10px] px-2 py-1 bg-white rounded-lg text-gray-600 hover:bg-primary-100 hover:text-primary-600 transition-colors shadow-sm"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_PROMPTS.slice(3).map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleUseSample(s.prompt, s.category, s.label)}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary-100 rounded-full text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {s.emoji || '✨'} {s.label}
                    </button>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给这张照片起个名字吧~"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述（可选）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="记录一下这张照片背后的故事..."
              rows={3}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-400 outline-none transition-colors resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="w-full flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {selectedCategory ? (
                  <>
                    <span className="text-xl">{selectedCategory.emoji}</span>
                    <span className="text-gray-800">{selectedCategory.label}</span>
                  </>
                ) : (
                  <span className="text-gray-400">请选择分类</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showCategories && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  {PHOTO_CATEGORY_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleSelectCategory(option.key as PhotoCategory)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        category === option.key ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className="text-xl">{option.emoji}</span>
                      <span className="text-gray-800">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传者
            </label>
            <div className="relative">
              <button
                onClick={() => setShowUploaders(!showUploaders)}
                className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                {selectedUploader ? (
                  <>
                    <span className="text-2xl">{selectedUploader.avatar}</span>
                    <span className="text-gray-800">{selectedUploader.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400">请选择上传者</span>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showUploaders && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {currentRoommates.map((roommate) => (
                    <button
                      key={roommate.id}
                      onClick={() => handleSelectUploader(roommate)}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                        uploaderId === roommate.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className="text-2xl">{roommate.avatar}</span>
                      <span className="text-gray-800">{roommate.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !imageUrl || !uploaderId}
          className="w-full mt-6 py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          上传照片
        </button>
      </div>
    </div>
  );
}
