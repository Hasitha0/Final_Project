import React from 'react';
import { ChevronRight, Home, LogOut } from 'lucide-react';

const DashboardSidebar = ({ 
  collapsed, 
  onToggleCollapse,
  user,
  tabs,
  activeTab,
  onTabChange,
  onGoHome,
  onLogout,
  className = ""
}) => {
  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 min-h-screen transition-all duration-300 ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-6`}>
          {!collapsed && (
            <div>
              <h2 className="text-white font-bold text-lg">My Dashboard</h2>
              <p className="text-gray-400 text-sm">EcoTech Platform</p>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-600/50 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>



        {/* Navigation */}
        <nav className="space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center ${collapsed ? 'justify-center px-3' : 'justify-between px-4'} py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
                title={collapsed ? tab.name : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span className="font-medium">{tab.name}</span>}
                </div>
                {!collapsed && tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className={`absolute bottom-4 ${collapsed ? 'left-2 right-2' : 'left-4 right-4'}`}>
          <div className="border-t border-slate-700 pt-4 space-y-3">
            {/* Profile Section - Bottom */}
            {!collapsed && (
              <div className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                  {user?.profile_picture_url ? (
                    <img 
                      src={user.profile_picture_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">{user?.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{user?.name || 'User'}</h3>
                  <p className="text-gray-300 text-xs truncate">{user?.email}</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={onGoHome}
              className={`w-full flex items-center ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200 group`}
              title={collapsed ? "Go Home" : undefined}
            >
              <Home className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
              {!collapsed && <span className="font-medium">Go Home</span>}
            </button>
            <button 
              onClick={onLogout}
              className={`w-full flex items-center ${collapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group`}
              title={collapsed ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform flex-shrink-0" />
              {!collapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar; 