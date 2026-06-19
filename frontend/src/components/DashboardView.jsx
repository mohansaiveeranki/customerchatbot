import React, { useState, useEffect } from 'react'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import StarIcon from '@mui/icons-material/Star'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function DashboardView() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        const { mockDashboardStats } = await import('../data/mockData.js')
        setStats(mockDashboardStats)
      }
    } catch (e) {
      const { mockDashboardStats } = await import('../data/mockData.js')
      setStats(mockDashboardStats)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/5 border border-border-dark rounded-2xl"></div>
        ))}
        <div className="col-span-1 md:col-span-3 h-80 bg-white/5 border border-border-dark rounded-2xl"></div>
        <div className="h-80 bg-white/5 border border-border-dark rounded-2xl"></div>
      </div>
    )
  }

  const maxCount = Math.max(...stats.weeklyTrend.map((d) => d.count))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-100">Performance Summary</h2>
          <p className="text-sm text-gray-400">Live operational data feeds</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-border-dark text-gray-400 hover:text-white hover:bg-white/10 text-xs font-medium cursor-pointer transition-all"
        >
          <RefreshIcon style={{ fontSize: 16 }} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Active Conversations</span>
            <h3 className="text-3xl font-bold text-white">{stats.activeTickets}</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpwardIcon style={{ fontSize: 12 }} /> +12% from yesterday
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <HeadsetMicIcon />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Avg Response Time</span>
            <h3 className="text-3xl font-bold text-white">{stats.avgResponseTime}</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpwardIcon style={{ fontSize: 12 }} /> -4m speed improvement
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
            <HourglassEmptyIcon />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Satisfaction Rate</span>
            <h3 className="text-3xl font-bold text-white">{stats.csat}%</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpwardIcon style={{ fontSize: 12 }} /> +1.2% above target
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
            <StarIcon />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Resolved Today</span>
            <h3 className="text-3xl font-bold text-white">{stats.resolvedCount}</h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <ArrowUpwardIcon style={{ fontSize: 12 }} /> +8 tickets completed
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircleIcon />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-200">Ticket Volume Trend</h3>
            <p className="text-xs text-gray-500">Hourly support requests received</p>
          </div>
          <div className="h-52 w-full mt-6 flex items-end justify-between px-2 relative">
            <div className="absolute inset-x-0 top-0 border-b border-white/5 h-0"></div>
            <div className="absolute inset-x-0 top-1/3 border-b border-white/5 h-0"></div>
            <div className="absolute inset-x-0 top-2/3 border-b border-white/5 h-0"></div>
            {stats.weeklyTrend.map((d, index) => {
              const barHeight = (d.count / maxCount) * 80
              return (
                <div key={index} className="flex flex-col items-center gap-2 group flex-1">
                  <div className="relative w-full flex justify-center items-end h-36">
                    <div className="absolute bottom-full mb-1 bg-gray-950/90 text-white text-[10px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {d.count} tickets
                    </div>
                    <div
                      style={{ height: `${barHeight}%` }}
                      className="w-8 sm:w-12 bg-gradient-to-t from-indigo-500/80 to-violet-600 rounded-t-lg transition-all duration-500 shadow-md shadow-indigo-500/10 group-hover:brightness-110"
                    ></div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">{d.day}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-200">Channels Distribution</h3>
            <p className="text-xs text-gray-500">Contact vector ratios</p>
          </div>
          <div className="flex justify-center items-center h-40 mt-4">
            <svg width="150" height="150" className="transform -rotate-90">
              <circle cx="75" cy="75" r="50" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
              <circle cx="75" cy="75" r="50" fill="transparent" stroke="#6366f1" strokeWidth="16" strokeDasharray="314.16" strokeDashoffset="141.37" />
              <circle cx="75" cy="75" r="50" fill="transparent" stroke="#8b5cf6" strokeWidth="16" strokeDasharray="314.16" strokeDashoffset="251.32" />
            </svg>
          </div>
          <div className="space-y-2 mt-4">
            {stats.channels.map((ch, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-violet-500' : 'bg-gray-600'}`}></span>
                  <span className="text-gray-400 font-medium">{ch.name}</span>
                </div>
                <span className="text-gray-200 font-semibold">{ch.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-base font-bold text-gray-200">Recent System Activities</h3>
        <div className="divide-y divide-white/5 mt-4">
          {stats.activities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-sm transition-all duration-200 hover:bg-white/1 font-medium">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span className="text-gray-300">{act.text}</span>
              </div>
              <span className="text-xs text-gray-500">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
