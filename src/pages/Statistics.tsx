import { useMemo } from 'react';
import { useBorrowStore } from '@/store/useBorrowStore';
import { TabBar } from '@/components/TabBar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Trophy,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
} from 'lucide-react';
import { isOverdue } from '@/utils/date';

interface DailyTrendItem {
  date: string;
  lend: number;
  borrow: number;
}

interface RoommateRankItem {
  name: string;
  avatar: string;
  lend: number;
  borrow: number;
  total: number;
}

interface ItemRankItem {
  name: string;
  emoji: string;
  count: number;
}

interface OverdueRateItem {
  name: string;
  avatar: string;
  total: number;
  overdue: number;
  rate: number;
}

export default function Statistics() {
  const { records, roommates, currentHouseId } = useBorrowStore();

  const houseRecords = useMemo(
    () => records.filter((r) => r.houseId === currentHouseId),
    [records, currentHouseId]
  );

  const houseRoommates = useMemo(
    () => roommates.filter((r) => r.houseId === currentHouseId),
    [roommates, currentHouseId]
  );

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTrendData = useMemo((): DailyTrendItem[] => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailyData: Map<string, DailyTrendItem> = new Map();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth + 1}/${day}`;
      dailyData.set(dateStr, { date: dateStr, lend: 0, borrow: 0 });
    }

    houseRecords.forEach((record) => {
      const borrowDate = new Date(record.borrowDate);
      if (
        borrowDate.getMonth() === currentMonth &&
        borrowDate.getFullYear() === currentYear
      ) {
        const dateStr = `${currentMonth + 1}/${borrowDate.getDate()}`;
        const existing = dailyData.get(dateStr);
        if (existing) {
          if (record.type === 'lend') {
            existing.lend += 1;
          } else {
            existing.borrow += 1;
          }
        }
      }
    });

    return Array.from(dailyData.values());
  }, [houseRecords, currentMonth, currentYear]);

  const roommateRankData = useMemo((): RoommateRankItem[] => {
    const roommateStats: Map<string, RoommateRankItem> = new Map();

    houseRoommates.forEach((roommate) => {
      roommateStats.set(roommate.id, {
        name: roommate.name,
        avatar: roommate.avatar,
        lend: 0,
        borrow: 0,
        total: 0,
      });
    });

    houseRecords.forEach((record) => {
      const stats = roommateStats.get(record.roommateId);
      if (stats) {
        if (record.type === 'lend') {
          stats.lend += 1;
        } else {
          stats.borrow += 1;
        }
        stats.total += 1;
      }
    });

    return Array.from(roommateStats.values())
      .sort((a, b) => b.total - a.total)
      .filter((r) => r.total > 0);
  }, [houseRecords, houseRoommates]);

  const topLendItems = useMemo((): ItemRankItem[] => {
    const itemCount: Map<string, { count: number; emoji: string }> = new Map();

    houseRecords
      .filter((r) => r.type === 'lend')
      .forEach((record) => {
        const existing = itemCount.get(record.itemName);
        if (existing) {
          existing.count += 1;
        } else {
          itemCount.set(record.itemName, {
            count: 1,
            emoji: record.itemEmoji,
          });
        }
      });

    return Array.from(itemCount.entries())
      .map(([name, data]) => ({
        name,
        emoji: data.emoji,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [houseRecords]);

  const topBorrowItems = useMemo((): ItemRankItem[] => {
    const itemCount: Map<string, { count: number; emoji: string }> = new Map();

    houseRecords
      .filter((r) => r.type === 'borrow')
      .forEach((record) => {
        const existing = itemCount.get(record.itemName);
        if (existing) {
          existing.count += 1;
        } else {
          itemCount.set(record.itemName, {
            count: 1,
            emoji: record.itemEmoji,
          });
        }
      });

    return Array.from(itemCount.entries())
      .map(([name, data]) => ({
        name,
        emoji: data.emoji,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [houseRecords]);

  const overdueRateData = useMemo((): OverdueRateItem[] => {
    const roommateStats: Map<
      string,
      { name: string; avatar: string; total: number; overdue: number }
    > = new Map();

    houseRoommates.forEach((roommate) => {
      roommateStats.set(roommate.id, {
        name: roommate.name,
        avatar: roommate.avatar,
        total: 0,
        overdue: 0,
      });
    });

    houseRecords.forEach((record) => {
      const stats = roommateStats.get(record.roommateId);
      if (stats) {
        stats.total += 1;
        if (
          record.status === 'overdue' ||
          (record.status === 'returned' &&
            record.actualReturnDate &&
            isOverdue(record.expectedReturnDate) &&
            new Date(record.actualReturnDate) > new Date(record.expectedReturnDate))
        ) {
          stats.overdue += 1;
        }
      }
    });

    return Array.from(roommateStats.values())
      .map((s) => ({
        ...s,
        rate: s.total > 0 ? Math.round((s.overdue / s.total) * 100) : 0,
      }))
      .filter((s) => s.total > 0)
      .sort((a, b) => b.rate - a.rate);
  }, [houseRecords, houseRoommates]);

  const totalStats = useMemo(() => {
    const totalLend = houseRecords.filter((r) => r.type === 'lend').length;
    const totalBorrow = houseRecords.filter((r) => r.type === 'borrow').length;
    const totalOverdue = houseRecords.filter(
      (r) => r.status === 'overdue'
    ).length;
    const returnedRecords = houseRecords.filter(
      (r) => r.status === 'returned'
    );
    const avgReturnDays =
      returnedRecords.length > 0
        ? Math.round(
            returnedRecords.reduce((sum, r) => {
              if (r.actualReturnDate) {
                const borrow = new Date(r.borrowDate);
                const returned = new Date(r.actualReturnDate);
                return (
                  sum +
                  Math.ceil(
                    (returned.getTime() - borrow.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                );
              }
              return sum;
            }, 0) / returnedRecords.length
          )
        : 0;

    return { totalLend, totalBorrow, totalOverdue, avgReturnDays };
  }, [houseRecords]);

  const pieData = [
    { name: '借出', value: totalStats.totalLend, color: '#3b82f6' },
    { name: '借入', value: totalStats.totalBorrow, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-md mx-auto bg-cream min-h-screen relative pb-24">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">📊 数据统计</h1>
          <p className="text-sm text-gray-500">
            {currentYear}年{currentMonth + 1}月 借还数据分析
          </p>
        </div>

        <div className="px-5 grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm text-gray-500">总借出</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {totalStats.totalLend}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-sm text-gray-500">总借入</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {totalStats.totalBorrow}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-sm text-gray-500">逾期中</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {totalStats.totalOverdue}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-gray-500">平均归还</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {totalStats.avgReturnDays}天
            </p>
          </div>
        </div>

        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                本月借还趋势
              </h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lend"
                    name="借出"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="borrow"
                    name="借入"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                室友借还排行
              </h2>
            </div>
            {roommateRankData.length > 0 ? (
              <>
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roommateRankData} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar
                        dataKey="lend"
                        name="借出"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="borrow"
                        name="借入"
                        fill="#8b5cf6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {roommateRankData.slice(0, 3).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-600'
                              : index === 1
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-xl">{item.avatar}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-blue-500">
                          借出 {item.lend}
                        </span>
                        <span className="text-purple-500">
                          借入 {item.borrow}
                        </span>
                        <span className="font-bold text-gray-800">
                          {item.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="px-5 mb-6 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-sm font-semibold text-gray-800">
                最常借出 Top5
              </h2>
            </div>
            {topLendItems.length > 0 ? (
              <div className="space-y-2">
                {topLendItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0
                            ? 'bg-yellow-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : index === 2
                            ? 'bg-orange-400'
                            : 'bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-xs text-gray-700 truncate max-w-16">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-blue-500">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-400 text-xs">
                暂无数据
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-purple-500" />
              <h2 className="text-sm font-semibold text-gray-800">
                最常借入 Top5
              </h2>
            </div>
            {topBorrowItems.length > 0 ? (
              <div className="space-y-2">
                {topBorrowItems.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0
                            ? 'bg-purple-500'
                            : index === 1
                            ? 'bg-purple-400'
                            : index === 2
                            ? 'bg-purple-300'
                            : 'bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-xs text-gray-700 truncate max-w-16">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-purple-500">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-400 text-xs">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                个人逾期率分析
              </h2>
            </div>
            {overdueRateData.length > 0 ? (
              <div className="space-y-3">
                {overdueRateData.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.avatar}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">
                          逾期 {item.overdue}/{item.total}
                        </span>
                        <span
                          className={`font-bold ${
                            item.rate >= 50
                              ? 'text-red-500'
                              : item.rate >= 20
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }`}
                        >
                          {item.rate}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          item.rate >= 50
                            ? 'bg-red-500'
                            : item.rate >= 20
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.max(item.rate, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="px-5 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                借还占比分析
              </h2>
            </div>
            <div className="flex items-center justify-center">
              <div className="h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name} {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
