import React, { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import SendIcon from '@mui/icons-material/Send'
import EmailIcon from '@mui/icons-material/Email'
import BusinessIcon from '@mui/icons-material/Business'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function TicketsView() {
  const [tickets, setTickets] = useState([])
  const [filteredTickets, setFilteredTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      } else {
        const { mockTickets } = await import('../data/mockData.js')
        setTickets(mockTickets)
      }
    } catch (e) {
      const { mockTickets } = await import('../data/mockData.js')
      setTickets(mockTickets)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    let result = tickets
    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus)
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.customer.name.toLowerCase().includes(query)
      )
    }
    setFilteredTickets(result)
  }, [tickets, filterStatus, searchQuery])

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket)
  }

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        const updated = await response.json()
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, status: newStatus }))
        }
      } else {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, status: newStatus }))
        }
      }
    } catch (e) {
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t))
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }))
      }
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedTicket) return
    const text = replyText
    setReplyText('')

    try {
      const response = await fetch(`/api/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'agent', content: text })
      })
      if (response.ok) {
        const message = await response.json()
        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicket.id) {
            const updatedMsgs = [...t.messages, message]
            return { ...t, messages: updatedMsgs }
          }
          return t
        }))
        setSelectedTicket(prev => ({ ...prev, messages: [...prev.messages, message] }))
      } else {
        const fallbackMessage = { sender: 'agent', content: text, timestamp: new Date().toISOString() }
        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicket.id) {
            return { ...t, messages: [...t.messages, fallbackMessage] }
          }
          return t
        }))
        setSelectedTicket(prev => ({ ...prev, messages: [...prev.messages, fallbackMessage] }))
      }
    } catch (err) {
      const fallbackMessage = { sender: 'agent', content: text, timestamp: new Date().toISOString() }
      setTickets(prev => prev.map(t => {
        if (t.id === selectedTicket.id) {
          return { ...t, messages: [...t.messages, fallbackMessage] }
        }
        return t
      }))
      setSelectedTicket(prev => ({ ...prev, messages: [...prev.messages, fallbackMessage] }))
    }
  }

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'high': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
      case 'medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
      case 'pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      case 'closed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      default: return 'bg-gray-500/10 text-gray-400'
    }
  }

  const cannedReplies = [
    "Thank you for contacting support. I have updated your account parameters accordingly.",
    "This ticket has been escalated to our engineering team for deep verification.",
    "Could you please share your environment version and browser network logs?",
    "We have processed the duplicate charge refund; it should reflect on your card in 5-10 business days."
  ]

  return (
    <div className="flex h-[calc(100vh-73px)] relative overflow-hidden">
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${selectedTicket ? 'lg:mr-[450px]' : ''}`}>
        <div className="p-4 border-b border-border-dark flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 bg-white/5 border border-border-dark p-1 rounded-xl">
            {['all', 'open', 'pending', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer transition-all ${
                  filterStatus === status
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search database..."
                className="w-full bg-white/5 border border-border-dark rounded-xl py-1.5 pl-9 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <SearchIcon className="absolute left-3 top-2 text-gray-500" style={{ fontSize: 16 }} />
            </div>
            <button
              onClick={fetchTickets}
              className="p-1.5 rounded-lg bg-white/5 border border-border-dark text-gray-400 hover:text-white cursor-pointer"
            >
              <RefreshIcon style={{ fontSize: 16 }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white/5 border border-border-dark rounded-xl"></div>
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <p className="font-semibold text-sm">No tickets found</p>
              <p className="text-xs">Adjust your search parameters or query filters</p>
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => handleTicketSelect(t)}
                className={`glass-card rounded-xl p-5 cursor-pointer text-left border transition-all ${
                  selectedTicket?.id === t.id
                    ? 'border-indigo-500/50 bg-indigo-500/5'
                    : 'border-border-dark'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-indigo-400">{t.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getPriorityBadge(t.priority)}`}>
                      {t.priority}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusBadge(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-200 mb-1">{t.title}</h4>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{t.customer.name} &bull; {t.customer.company}</span>
                  <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5 font-semibold text-[10px]">
                    {t.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTicket && (
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[450px] glass-panel border-l border-border-dark flex flex-col z-10 transition-transform">
          <div className="p-4 border-b border-border-dark flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-semibold text-indigo-400">{selectedTicket.id}</span>
              <h3 className="text-sm font-bold text-gray-200 mt-1 max-w-[320px] truncate">{selectedTicket.title}</h3>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-gray-400 hover:text-white text-xs font-semibold bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="p-4 border-b border-border-dark grid grid-cols-2 gap-4 text-xs bg-white/1 text-left">
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">Customer</p>
              <p className="font-bold text-gray-200 mt-1">{selectedTicket.customer.name}</p>
              <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                <EmailIcon style={{ fontSize: 12 }} />
                <span>{selectedTicket.customer.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                <BusinessIcon style={{ fontSize: 12 }} />
                <span>{selectedTicket.customer.company}</span>
              </div>
            </div>
            <div>
              <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px] mb-1">State Config</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="bg-[#0f111a] border border-border-dark text-[11px] rounded px-1.5 py-0.5 text-gray-300 font-bold focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Priority:</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getPriorityBadge(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/10">
            {selectedTicket.messages.map((msg, index) => {
              const isAgent = msg.sender === 'agent'
              return (
                <div key={index} className={`flex flex-col text-left ${isAgent ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                    isAgent
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white/5 border border-border-dark text-gray-200 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1 px-1">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="p-3 bg-white/2 border-t border-border-dark text-left">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">Quick Replies</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
              {cannedReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => setReplyText(reply)}
                  className="flex-shrink-0 bg-white/5 border border-border-dark text-gray-400 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/30 text-[10px] px-2.5 py-1.5 rounded-lg cursor-pointer max-w-[200px] truncate"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendReply} className="p-4 border-t border-border-dark flex gap-2 bg-[#0f111a]">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 bg-white/5 border border-border-dark rounded-xl py-2 px-4 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <SendIcon style={{ fontSize: 16 }} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
