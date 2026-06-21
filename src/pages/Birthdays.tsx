import { useState } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { Header } from '@/components/Header';
import { TabBar } from '@/components/TabBar';
import { EmptyState } from '@/components/EmptyState';
import { RoommateModal } from '@/components/RoommateModal';
import { BirthdayCelebrationModal } from '@/components/BirthdayCelebrationModal';
import { Cake, Home as HomeIcon, Calendar, Users, Gift, Clock } from 'lucide-react';
import {
  formatDateShort,
  getAge,
  getYearsSinceMoveIn,
  getDaysUntilBirthday,
  getDaysUntilMoveInAnniversary,
  isBirthdayToday,
  isMoveInAnniversaryToday,
} from '@/utils/date';

type TabType = 'birthdays' | 'anniversaries' | 'all';

export default function Birthdays() {
  const {
    getMonthBirthdays,
    getMonthMoveInAnniversaries,
    getUpcomingBirthdays,
    getUpcomingMoveInAnniversaries,
    getTodayBirthdays,
    getTodayMoveInAnniversaries,
    getRoommates,
  } = useBorrowStore();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showRoommateModal, setShowRoommateModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const monthBirthdays = getMonthBirthdays();
  const monthAnniversaries = getMonthMoveInAnniversaries();
  const upcomingBirthdays = getUpcomingBirthdays(30);
  const upcomingAnniversaries = getUpcomingMoveInAnniversaries(30);
  const todayBirthdays = getTodayBirthdays();
  const todayAnniversaries = getTodayMoveInAnniversaries();
  const allRoommates = getRoommates();

  const currentMonth = new Date().getMonth() + 1;

  const hasAnySpecialDay =
    monthBirthdays.length > 0 || monthAnniversaries.length > 0;

  const handleCelebrate = () => {
    if (todayBirthdays.length > 0 || todayAnniversaries.length > 0) {
      setShowCelebration(true);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto bg-cream min-h-screen relative pb-24">
        <Header />

        <div className="px-5 py-4">
          {(todayBirthdays.length > 0 || todayAnniversaries.length > 0) && (
            <div
              onClick={handleCelebrate}
              className="mb-6 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 rounded-2xl p-5 text-white cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl animate-bounce">
                  🎂
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold">今天有特别的日子！</p>
                  <p className="text-sm opacity-90 mt-1">
                    {todayBirthdays.length > 0 && `${todayBirthdays.length} 位室友过生日`}
                    {todayBirthdays.length > 0 && todayAnniversaries.length > 0 && '，'}
                    {todayAnniversaries.length > 0 && `${todayAnniversaries.length} 个入住纪念日`}
                  </p>
                  <p className="text-sm font-medium mt-2 bg-white/20 inline-block px-3 py-1 rounded-full">
                    点击庆祝 🎉
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🎊</span>
              生日与纪念日
            </h1>
            <button
              onClick={() => setShowRoommateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700"
            >
              <Users className="w-4 h-4 text-primary-500" />
              <span>管理室友</span>
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'all'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveTab('birthdays')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'birthdays'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Cake className="w-4 h-4" />
              生日
            </button>
            <button
              onClick={() => setActiveTab('anniversaries')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'anniversaries'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              纪念日
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              {currentMonth}月寿星
            </h2>
            {(activeTab === 'all' || activeTab === 'birthdays') &&
              monthBirthdays.length > 0 && (
                <div className="space-y-3 mb-4">
                  {monthBirthdays.map((roommate) => {
                    const isToday = isBirthdayToday(roommate.birthday!);
                    const daysUntil = getDaysUntilBirthday(roommate.birthday!);
                    return (
                      <div
                        key={`mb-${roommate.id}`}
                        className={`p-4 rounded-2xl transition-all ${
                          isToday
                            ? 'bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-300 shadow-md'
                            : 'bg-white border border-gray-100 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ backgroundColor: roommate.color + '20' }}
                          >
                            {roommate.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">{roommate.name}</p>
                              {isToday && (
                                <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
                                  今天！
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <Cake className="w-3.5 h-3.5 text-pink-400" />
                              <span>{formatDateShort(roommate.birthday!)}</span>
                              <span>·</span>
                              <span className="text-pink-500 font-medium">
                                {isToday
                                  ? `${getAge(roommate.birthday!)} 岁啦！`
                                  : `${getAge(roommate.birthday!)} 岁`}
                              </span>
                            </div>
                          </div>
                          {!isToday && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-gray-400">还有</p>
                              <p className="text-lg font-bold text-pink-500">{daysUntil}天</p>
                            </div>
                          )}
                          {isToday && (
                            <div className="text-2xl animate-bounce flex-shrink-0">🎉</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {(activeTab === 'all' || activeTab === 'anniversaries') &&
              monthAnniversaries.length > 0 && (
                <div className="space-y-3">
                  {monthAnniversaries.map((roommate) => {
                    const isToday = isMoveInAnniversaryToday(roommate.moveInDate!);
                    const daysUntil = getDaysUntilMoveInAnniversary(roommate.moveInDate!);
                    const years = getYearsSinceMoveIn(roommate.moveInDate!);
                    return (
                      <div
                        key={`ma-${roommate.id}`}
                        className={`p-4 rounded-2xl transition-all ${
                          isToday
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300 shadow-md'
                            : 'bg-white border border-gray-100 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                            style={{ backgroundColor: roommate.color + '20' }}
                          >
                            {roommate.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">{roommate.name}</p>
                              {isToday && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                                  今天！
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <HomeIcon className="w-3.5 h-3.5 text-blue-400" />
                              <span>入住 {formatDateShort(roommate.moveInDate!)}</span>
                              <span>·</span>
                              <span className="text-blue-500 font-medium">
                                {isToday ? `${years} 周年！` : `${years} 年`}
                              </span>
                            </div>
                          </div>
                          {!isToday && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-gray-400">还有</p>
                              <p className="text-lg font-bold text-blue-500">{daysUntil}天</p>
                            </div>
                          )}
                          {isToday && (
                            <div className="text-2xl animate-bounce flex-shrink-0">🏠</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {activeTab === 'birthdays' && monthBirthdays.length === 0 && (
              <EmptyState type="birthday" />
            )}
            {activeTab === 'anniversaries' && monthAnniversaries.length === 0 && (
              <EmptyState type="anniversary" />
            )}
          </div>

          {(activeTab === 'all' || activeTab === 'birthdays') &&
            upcomingBirthdays.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  即将到来的生日
                </h2>
                <div className="space-y-2">
                  {upcomingBirthdays
                    .filter((r) => !isBirthdayToday(r.birthday!))
                    .slice(0, 5)
                    .map((roommate) => (
                      <div
                        key={`ub-${roommate.id}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: roommate.color + '20' }}
                        >
                          {roommate.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">{roommate.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDateShort(roommate.birthday!)}
                          </p>
                        </div>
                        <div className="text-amber-500 font-medium text-sm">
                          {getDaysUntilBirthday(roommate.birthday!)} 天后
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {(activeTab === 'all' || activeTab === 'anniversaries') &&
            upcomingAnniversaries.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  即将到来的纪念日
                </h2>
                <div className="space-y-2">
                  {upcomingAnniversaries
                    .filter((r) => !isMoveInAnniversaryToday(r.moveInDate!))
                    .slice(0, 5)
                    .map((roommate) => (
                      <div
                        key={`ua-${roommate.id}`}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ backgroundColor: roommate.color + '20' }}
                        >
                          {roommate.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm">{roommate.name}</p>
                          <p className="text-xs text-gray-500">
                            入住 {formatDateShort(roommate.moveInDate!)}
                          </p>
                        </div>
                        <div className="text-purple-500 font-medium text-sm">
                          {getDaysUntilMoveInAnniversary(roommate.moveInDate!)} 天后
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {!hasAnySpecialDay && activeTab === 'all' && allRoommates.length > 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 mb-2">本月还没有特别的日子</p>
              <p className="text-gray-400 text-sm">
                去室友管理中添加生日和入住日期吧~
              </p>
            </div>
          )}

          {allRoommates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 mb-2">还没有添加室友</p>
              <button
                onClick={() => setShowRoommateModal(true)}
                className="text-primary-500 font-medium hover:underline"
              >
                立即添加
              </button>
            </div>
          )}
        </div>
      </div>

      <TabBar />

      <RoommateModal
        isOpen={showRoommateModal}
        onClose={() => setShowRoommateModal(false)}
      />

      <BirthdayCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        birthdayRoommates={todayBirthdays}
        anniversaryRoommates={todayAnniversaries}
      />
    </div>
  );
}
