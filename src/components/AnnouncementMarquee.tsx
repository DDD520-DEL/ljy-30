import { useState, useEffect, useRef, useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { Megaphone, ChevronLeft, ChevronRight, Bell, Check, User } from 'lucide-react';
import type { Announcement } from '@/types';

interface AnnouncementMarqueeProps {
  onOpenAnnouncementModal: () => void;
}

export function AnnouncementMarquee({ onOpenAnnouncementModal }: AnnouncementMarqueeProps) {
  const {
    roommates,
    currentHouseId,
    announcementRoommateId,
    setAnnouncementRoommateId,
    getActiveAnnouncements,
    markAnnouncementRead,
    getUnreadAnnouncementCount,
  } = useBorrowStore();

  const announcements = getActiveAnnouncements();

  const currentRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const resolvedRoommateId = useMemo(() => {
    if (announcementRoommateId && currentRoommates.some((r) => r.id === announcementRoommateId)) {
      return announcementRoommateId;
    }
    return currentRoommates[0]?.id || '';
  }, [announcementRoommateId, currentRoommates]);

  useEffect(() => {
    if (!announcementRoommateId || !currentRoommates.some((r) => r.id === announcementRoommateId)) {
      if (currentRoommates.length > 0 && announcementRoommateId !== currentRoommates[0].id) {
        setAnnouncementRoommateId(currentRoommates[0].id);
      }
    }
  }, [currentRoommates, announcementRoommateId, setAnnouncementRoommateId]);

  const unreadCount = getUnreadAnnouncementCount(resolvedRoommateId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (announcements.length <= 1 || isPaused || showDetail) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [announcements.length, isPaused, showDetail]);

  useEffect(() => {
    if (currentIndex >= announcements.length && announcements.length > 0) {
      setCurrentIndex(0);
    }
  }, [announcements.length, currentIndex]);

  const handlePrev = () => {
    if (announcements.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    if (announcements.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handleMarkRead = (announcement: Announcement, e: React.MouseEvent) => {
    e.stopPropagation();
    if (resolvedRoommateId) {
      markAnnouncementRead(announcement.id, resolvedRoommateId);
    }
  };

  const isRead = (announcement: Announcement) => {
    return resolvedRoommateId && announcement.readBy.includes(resolvedRoommateId);
  };

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div
      className="bg-gradient-to-r from-warning-500 via-warning-400 to-orange-400 text-white relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-md mx-auto relative">
        <div
          ref={containerRef}
          className="flex items-center px-2 py-2.5 cursor-pointer"
          onClick={() => setShowDetail(!showDetail)}
        >
          <div className="flex items-center gap-2 shrink-0 px-2">
            <Megaphone className="w-5 h-5 animate-pulse-soft" />
            {unreadCount > 0 && (
              <span className="bg-danger-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            {!showDetail ? (
              <div className="relative h-6 overflow-hidden">
                {announcements.map((announcement, index) => (
                  <div
                    key={announcement.id}
                    className={`absolute inset-0 flex items-center transition-all duration-500 ease-in-out ${
                      index === currentIndex
                        ? 'translate-x-0 opacity-100'
                        : index < currentIndex
                        ? '-translate-x-full opacity-0'
                        : 'translate-x-full opacity-0'
                    }`}
                  >
                    <span className="mr-2 text-lg shrink-0">{announcement.emoji || '📢'}</span>
                    <span className="text-sm font-medium truncate flex-1">
                      {announcement.content}
                    </span>
                    {!isRead(announcement) && (
                      <span className="ml-2 shrink-0 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 animate-fade-in py-1">
                {currentRoommates.length > 1 && (
                  <div className="flex items-center gap-1.5 px-1 pb-1.5 overflow-x-auto">
                    <User className="w-3.5 h-3.5 shrink-0 text-white/70" />
                    {currentRoommates.map((roommate) => (
                      <button
                        key={roommate.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnnouncementRoommateId(roommate.id);
                        }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs shrink-0 transition-all ${
                          resolvedRoommateId === roommate.id
                            ? 'bg-white/30 text-white font-medium'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        <span>{roommate.avatar}</span>
                        <span>{roommate.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`flex items-start gap-2 p-2.5 rounded-xl transition-all ${
                      announcement.id === currentAnnouncement.id
                        ? 'bg-white/20 backdrop-blur'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xl shrink-0 pt-0.5">{announcement.emoji || '📢'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <span>{announcement.roommateAvatar}</span>
                          {announcement.roommateName}
                        </span>
                        {!isRead(announcement) && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-danger-500 rounded-full font-medium">
                            新
                          </span>
                        )}
                        {isRead(announcement) && (
                          <Check className="w-3 h-3 text-white/70" />
                        )}
                      </div>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {announcement.content}
                      </p>
                    </div>
                    {!isRead(announcement) && resolvedRoommateId && (
                      <button
                        onClick={(e) => handleMarkRead(announcement, e)}
                        className="shrink-0 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title="标记已读"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!showDetail && announcements.length > 1 && (
            <div className="flex items-center gap-1 shrink-0 px-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium min-w-[28px] text-center">
                {currentIndex + 1}/{announcements.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0 pl-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAnnouncementModal();
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="查看全部公告"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!showDetail && announcements.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pb-1.5">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
