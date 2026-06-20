import { NavLink } from 'react-router-dom';
import { Home, BarChart3 } from 'lucide-react';

export function TabBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-all ${
              isActive
                ? 'text-primary-500 bg-primary-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">首页</span>
        </NavLink>

        <NavLink
          to="/statistics"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-2 px-6 rounded-xl transition-all ${
              isActive
                ? 'text-primary-500 bg-primary-50'
                : 'text-gray-400 hover:text-gray-600'
            }`
          }
        >
          <BarChart3 className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">统计</span>
        </NavLink>
      </div>
    </div>
  );
}
