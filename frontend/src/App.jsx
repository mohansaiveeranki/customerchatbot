import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DashboardView from './components/DashboardView'
import TicketsView from './components/TicketsView'
import ChatView from './components/ChatView'
import KBView from './components/KBView'
import SettingsView from './components/SettingsView'

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [agentStatus, setAgentStatus] = useState('Available')

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      } else {
        setSidebarCollapsed(false)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />
      case 'tickets': return <TicketsView />
      case 'chat': return <ChatView />
      case 'kb': return <KBView />
      case 'settings': return <SettingsView />
      default: return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark text-gray-100 flex font-sans antialiased overflow-x-hidden">
      <div className={`md:flex ${mobileMenuOpen ? 'flex' : 'hidden md:block'} z-30`}>
        <Sidebar
          currentView={currentView}
          setCurrentView={(view) => {
            setCurrentView(view)
            setMobileMenuOpen(false)
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
        ></div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <Header
          currentView={currentView}
          agentStatus={agentStatus}
          setAgentStatus={setAgentStatus}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 bg-white/[0.01]">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}
