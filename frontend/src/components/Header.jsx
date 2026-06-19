import React, { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Badge from '@mui/material/Badge'
import MenuIcon from '@mui/icons-material/Menu'

export default function Header({ currentView, agentStatus, setAgentStatus, onMenuToggle }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const viewTitles = {
    dashboard: 'Workspace Overview',
    tickets: 'Support Tickets Queue',
    chat: 'Live Agent Chats',
    kb: 'Knowledge Base Portal',
    settings: 'System Settings',
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500 shadow-emerald-500/50'
      case 'Busy': return 'bg-rose-500 shadow-rose-500/50'
      case 'Away': return 'bg-amber-500 shadow-amber-500/50'
      default: return 'bg-gray-500'
    }
  }

  return (
    <header className="glass-panel border-b border-border-dark px-6 py-4 flex items-center justify-between sticky top-0 z-20 w-full backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="md:hidden p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white cursor-pointer">
          <MenuIcon />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-100 m-0 leading-none">
            {viewTitles[currentView]}
          </h1>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            OmniChannel Support Console &bull; {currentView}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block w-64">
          <input
            type="text"
            placeholder="Search tickets, chats..."
            className="w-full bg-white/5 border border-border-dark rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <SearchIcon className="absolute left-3 top-2.5 text-gray-500 text-sm" style={{ fontSize: 18 }} />
        </div>

        <div className="flex items-center gap-3 border-r border-border-dark pr-6">
          <span className={`w-2.5 h-2.5 rounded-full glow-indicator ${getStatusColor(agentStatus)}`}></span>
          <select
            value={agentStatus}
            onChange={(e) => setAgentStatus(e.target.value)}
            className="bg-transparent border-0 text-sm text-gray-300 font-medium focus:outline-none cursor-pointer pr-4"
          >
            <option value="Available" className="bg-[#0f111a] text-emerald-400">Available</option>
            <option value="Busy" className="bg-[#0f111a] text-rose-400">Busy</option>
            <option value="Away" className="bg-[#0f111a] text-amber-400">Away</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white relative cursor-pointer">
            <Badge badgeContent={3} color="primary">
              <NotificationsIcon style={{ fontSize: 22 }} />
            </Badge>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
              JD
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-sm font-semibold text-gray-200">Jane Doe</div>
              <div className="text-xs text-gray-500">Tier 2 Specialist</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
