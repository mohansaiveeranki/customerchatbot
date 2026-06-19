import React, { useState } from 'react'
import PersonIcon from '@mui/icons-material/Person'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PaletteIcon from '@mui/icons-material/Palette'
import SaveIcon from '@mui/icons-material/Save'

export default function SettingsView() {
  const [profile, setProfile] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@omnisupport.com',
    role: 'Tier 2 Specialist',
    department: 'Customer Success'
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    desktopNotifications: true,
    soundAlerts: false,
    autoAssign: true
  })

  const [themeMode, setThemeMode] = useState('dark')

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = (e) => {
    e.preventDefault()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-gray-100">Console Configuration</h2>
        <p className="text-sm text-gray-400">Manage agent workspace variables and metadata preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2 border-b border-border-dark pb-3">
              <PersonIcon style={{ fontSize: 18 }} /> Profile Parameters
            </h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full bg-white/5 border border-border-dark rounded-xl py-2 px-3 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-white/5 border border-border-dark rounded-xl py-2 px-3 text-xs text-gray-400 cursor-not-allowed focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">System Role</label>
                <input
                  type="text"
                  name="role"
                  value={profile.role}
                  onChange={handleProfileChange}
                  className="w-full bg-white/5 border border-border-dark rounded-xl py-2 px-3 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">Operational Area</label>
                <input
                  type="text"
                  name="department"
                  value={profile.department}
                  onChange={handleProfileChange}
                  className="w-full bg-white/5 border border-border-dark rounded-xl py-2 px-3 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-colors"
                >
                  <SaveIcon style={{ fontSize: 16 }} /> Save Profile
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2 border-b border-border-dark pb-3">
              <NotificationsActiveIcon style={{ fontSize: 18 }} /> System Alert Routing
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Email Notifications</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Send transaction digest when agent is offline</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={() => handleNotificationChange('emailAlerts')}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Desktop Banners</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Display push notices for incoming chats</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.desktopNotifications}
                  onChange={() => handleNotificationChange('desktopNotifications')}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Audio Indicators</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Play dynamic ping on customer reply</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.soundAlerts}
                  onChange={() => handleNotificationChange('soundAlerts')}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Automatic Chat Assignment</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Auto-route conversation slots when available</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.autoAssign}
                  onChange={() => handleNotificationChange('autoAssign')}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2 border-b border-border-dark pb-3">
              <PaletteIcon style={{ fontSize: 18 }} /> Visual Palette
            </h3>
            <div className="space-y-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Interface Theme</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    themeMode === 'dark'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-white/5 border-border-dark text-gray-400 hover:text-white'
                  }`}
                >
                  Dark Slate
                </button>
                <button
                  onClick={() => setThemeMode('light')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    themeMode === 'light'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-white/5 border-border-dark text-gray-400 hover:text-white'
                  }`}
                >
                  Light Glass
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
