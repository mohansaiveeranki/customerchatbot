import React, { useState, useEffect, useRef } from 'react'
import SendIcon from '@mui/icons-material/Send'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ComputerIcon from '@mui/icons-material/Computer'
import DnsIcon from '@mui/icons-material/Dns'
import InfoIcon from '@mui/icons-material/Info'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import RefreshIcon from '@mui/icons-material/Refresh'
import { getApiUrl, getWsUrl } from '../config'

export default function ChatView() {
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)

  const fetchChats = async () => {
    setLoading(true)
    try {
      const response = await fetch(getApiUrl('/api/chat'))
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
        if (data.length > 0) setSelectedSession(data[0])
      } else {
        const { mockChatSessions } = await import('../data/mockData.js')
        setSessions(mockChatSessions)
        if (mockChatSessions.length > 0) setSelectedSession(mockChatSessions[0])
      }
    } catch (e) {
      const { mockChatSessions } = await import('../data/mockData.js')
      setSessions(mockChatSessions)
      if (mockChatSessions.length > 0) setSelectedSession(mockChatSessions[0])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (selectedSession) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedSession?.messages, typing])

  useEffect(() => {
    if (!selectedSession) return
    const wsUrl = getWsUrl(`/ws/chat/${selectedSession.id}`)
    socketRef.current = new WebSocket(wsUrl)

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      appendMessageToSession(selectedSession.id, msg)
    }

    return () => {
      socketRef.current?.close()
    }
  }, [selectedSession?.id])

  const appendMessageToSession = (sessionId, message) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const alreadyExists = s.messages.some(m => m.timestamp === message.timestamp && m.content === message.content)
        if (alreadyExists) return s
        return { ...s, messages: [...s.messages, message] }
      }
      return s
    }))
    setSelectedSession(prev => {
      if (prev && prev.id === sessionId) {
        const alreadyExists = prev.messages.some(m => m.timestamp === message.timestamp && m.content === message.content)
        if (alreadyExists) return prev
        return { ...prev, messages: [...prev.messages, message] }
      }
      return prev
    })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedSession) return
    const text = messageText
    setMessageText('')

    const payload = { sender: 'agent', content: text, timestamp: new Date().toISOString() }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload))
      appendMessageToSession(selectedSession.id, payload)
    } else {
      appendMessageToSession(selectedSession.id, payload)
      simulateCustomerReply(text)
    }
  }

  const simulateCustomerReply = (agentMessage) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      let replyContent = "Okay, I see. Thank you for resolving this for me!"
      const textLower = agentMessage.toLowerCase()
      if (textLower.includes("hello") || textLower.includes("hi")) {
        replyContent = "I'm still having some issues loading the web console."
      } else if (textLower.includes("webhook") || textLower.includes("api")) {
        replyContent = "Can you show me a configuration example or point me to a knowledge article?"
      } else if (textLower.includes("discount") || textLower.includes("refund")) {
        replyContent = "Perfect! I will sign up for the yearly subscription model right away."
      }

      const clientReply = {
        sender: 'customer',
        content: replyContent,
        timestamp: new Date().toISOString()
      }
      appendMessageToSession(selectedSession.id, clientReply)
    }, 1500)
  }

  return (
    <div className="flex h-[calc(100vh-73px)] relative overflow-hidden bg-black/10">
      <div className="w-80 border-r border-border-dark flex flex-col bg-white/2">
        <div className="p-4 border-b border-border-dark flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Active Conversations</h3>
          <button onClick={fetchChats} className="p-1 rounded bg-white/5 border border-border-dark text-gray-400 hover:text-white cursor-pointer">
            <RefreshIcon style={{ fontSize: 14 }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-4 space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-white/5 border border-border-dark rounded-xl"></div>
              ))}
            </div>
          ) : (
            sessions.map((s) => {
              const lastMessage = s.messages[s.messages.length - 1]
              const isSelected = selectedSession?.id === s.id
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`p-4 border-b border-border-dark/50 cursor-pointer text-left transition-all ${
                    isSelected ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'hover:bg-white/1'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-200">{s.customer.name}</span>
                    <span className="text-[10px] text-gray-500">{s.id}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">{lastMessage?.content}</p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {selectedSession ? (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col relative">
            <div className="p-4 border-b border-border-dark flex items-center gap-3 bg-white/1">
              <span className={`w-2.5 h-2.5 rounded-full ${selectedSession.customer.status === 'online' ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
              <div className="text-left">
                <h4 className="font-bold text-sm text-gray-200">{selectedSession.customer.name}</h4>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">{selectedSession.customer.status}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {selectedSession.messages.map((msg, index) => {
                const isAgent = msg.sender === 'agent'
                return (
                  <div key={index} className={`flex flex-col text-left ${isAgent ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-3.5 text-xs ${
                      isAgent
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white/5 border border-border-dark text-gray-200 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-semibold mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}

              {typing && (
                <div className="flex flex-col items-start">
                  <div className="bg-white/5 border border-border-dark rounded-2xl rounded-tl-none p-3.5 text-xs text-gray-400 flex items-center gap-1 font-semibold">
                    <span className="animate-bounce">&bull;</span>
                    <span className="animate-bounce [animation-delay:0.2s]">&bull;</span>
                    <span className="animate-bounce [animation-delay:0.4s]">&bull;</span>
                    <span className="ml-1 text-[10px]">Client is typing</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-border-dark flex gap-3 bg-[#0f111a]">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/5 border border-border-dark rounded-xl py-2.5 px-4 text-xs text-gray-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <SendIcon style={{ fontSize: 18 }} />
              </button>
            </form>
          </div>

          <div className="w-80 border-l border-border-dark p-6 bg-white/2 hidden xl:block text-left">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <InfoIcon style={{ fontSize: 18 }} /> Session Metadata
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email Address</p>
                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                  <EmailIcon style={{ fontSize: 14 }} className="text-gray-500" />
                  <span>{selectedSession.customer.email}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Geo-Location</p>
                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                  <LocationOnIcon style={{ fontSize: 14 }} className="text-gray-500" />
                  <span>{selectedSession.customer.location}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Agent Client Platform</p>
                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                  <ComputerIcon style={{ fontSize: 14 }} className="text-gray-500" />
                  <span>{selectedSession.customer.browser}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Session IPv4 Address</p>
                <div className="flex items-center gap-2 text-xs text-gray-300 mt-1 font-mono">
                  <DnsIcon style={{ fontSize: 14 }} className="text-gray-500" />
                  <span>{selectedSession.customer.ip}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <p className="font-semibold text-sm">Select an active conversation to begin chat</p>
        </div>
      )}
    </div>
  )
}
