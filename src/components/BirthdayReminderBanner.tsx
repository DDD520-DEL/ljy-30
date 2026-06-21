import { useBorrowStore } from '@/store/useBorrowStore';
import { Cake, Home as HomeIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAge, getYearsSinceMoveIn } from '@/utils/date';

interface BirthdayReminderBannerProps {
  onViewBirthdayPage?: () => void;
}

export function BirthdayReminderBanner({ onViewBirthdayPage }: BirthdayReminderBannerProps) {
  const { getTodayBirthdays, getTodayMoveInAnniversaries, getUpcomingBirthdays, getUpcomingMoveInAnniversaries } = useBorrowStore();
  const navigate = useNavigate();

  const todayBirthdays = getTodayBirthdays();
  const todayAnniversaries = getTodayMoveInAnniversaries();
  const upcomingBirthdays = getUpcomingBirthdays(7);
  const upcomingAnniversaries = getUpcomingMoveInAnniversaries(7);

  const hasSpecialDay = todayBirthdays.length > 0 || todayAnniversaries.length > 0;
  const hasUpcoming = upcomingBirthdays.length > 0 || upcomingAnniversaries.length > 0;

  const handleClick = () => {
    if (onViewBirthdayPage) {
      onViewBirthdayPage();
    } else {
      navigate('/birthdays');
    }
  };

  if (!hasSpecialDay && !hasUpcoming) return null;

  return (
    <div className="px-5 py-3">
      {hasSpecialDay && (
        <div
          onClick={handleClick}
          className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] animate-pulse-slow"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl animate-bounce">
              🎉
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg">今天有特别的日子！</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {todayBirthdays.map((roommate) => (
                  <span
                    key={`bday-${roommate.id}`}
                    className="inline-flex items-center gap-1 text-sm bg-white/20 px-2 py-0.5 rounded-full"
                  >
                    <Cake className="w-3 h-3" />
                    {roommate.name} {getAge(roommate.birthday!)}岁生日
                  </span>
                ))}
                {todayAnniversaries.map((roommate) => (
                  <span
                    key={`anniv-${roommate.id}`}
                    className="inline-flex items-center gap-1 text-sm bg-white/20 px-2 py-0.5 rounded-full"
                  >
                    <HomeIcon className="w-3 h-3" />
                    {roommate.name} 入住{getYearsSinceMoveIn(roommate.moveInDate!)}周年
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight className="w-6 h-6 opacity-80" />
          </div>
        </div>
      )}

      {!hasSpecialDay && hasUpcoming && (
        <div
          onClick={handleClick}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">
              📅
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-amber-800">近期特别日子</p>
              <p className="text-sm text-amber-600 mt-0.5">
                {upcomingBirthdays.length > 0 && `${upcomingBirthdays.length} 位室友即将过生日`}
                {upcomingBirthdays.length > 0 && upcomingAnniversaries.length > 0 && '，'}
                {upcomingAnniversaries.length > 0 && `${upcomingAnniversaries.length} 个入住纪念日`}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      )}
    </div>
  );
}
