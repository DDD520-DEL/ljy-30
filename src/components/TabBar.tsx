import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Wallet, Calendar, Sparkles, Vote, Wrench } from 'lucide-react';

export function TabBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1 overflow-x-auto">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all flex-shrink-0 ${
              isActive
                ? 'text-primary-500 bg-primary-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium">首页</span>
        </NavLink>

        <NavLink
          to="/maintenance"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all flex-shrink-0 ${
              isActive
                ? 'text-warning-500 bg-warning-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Wrench className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium">维修</span>
        </NavLink>

        <NavLink
          to="/voting"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all flex-shrink-0 ${
              isActive
                ? 'text-info-500 bg-info-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Vote className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium">投票</span>
        </NavLink>

        <NavLink
          to="/wishes"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all flex-shrink-0 ${
              isActive
                ? 'text-warning-500 bg-warning-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Sparkles className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium">心愿</span>
        </NavLink>

        <NavLink
          to="/chores"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all flex-shrink-0 ${
              isActive
                ? 'text-success-500 bg-success-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium">排班</span>
        </NavLink>

        <NavLink
          to="/bills"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all flex-shrink-0 ${
              isActive
                ? 'text-warning-500 bg-warning-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Wallet className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium">账单</span>
        </NavLink>

        <NavLink
          to="/statistics"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-1.5 rounded-xl transition-all flex-shrink-0 ${
              isActive
                ? 'text-primary-500 bg-primary-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-[11px] font-medium">统计</span>
        </NavLink>
      </div>
    </div>
  );
}
