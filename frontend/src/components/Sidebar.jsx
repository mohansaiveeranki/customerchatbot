import React from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import ChatIcon from '@mui/icons-material/Chat'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import SettingsIcon from '@mui/icons-material/Settings'
import HeadsetIcon from '@mui/icons-material/Headset'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export default function Sidebar({ currentView, setCurrentView, collapsed, setCollapsed }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'tickets', name: 'Tickets', icon: <ConfirmationNumberIcon /> },
    { id: 'chat', name: 'Live Chat', icon: <ChatIcon /> },
    { id: 'kb', name: 'Knowledge Base', icon: <MenuBookIcon /> },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
  ]

  return (
    <aside className={`glass-panel border-r border-border-dark flex flex-col justify-between transition-all duration-300 h-screen sticky top-0 z-30 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div>
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <HeadsetIcon />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-200 to-violet-400 bg-clip-text text-transparent whitespace-nowrap">
                OmniSupport
              </span>
            )}
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/20 to-violet-600/10 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <div className={`flex-shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                {!collapsed && <span className="text-sm">{item.name}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-border-dark flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
    </aside>
  )
}
