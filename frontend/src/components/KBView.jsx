import React, { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import BookIcon from '@mui/icons-material/Book'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function KBView() {
  const [articles, setArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/kb')
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      } else {
        const { mockKbArticles } = await import('../data/mockData.js')
        setArticles(mockKbArticles)
      }
    } catch (e) {
      const { mockKbArticles } = await import('../data/mockData.js')
      setArticles(mockKbArticles)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    let result = articles
    if (selectedCategory !== 'all') {
      result = result.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase())
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      result = result.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query)
      )
    }
    setFilteredArticles(result)
  }, [articles, selectedCategory, searchQuery])

  return (
    <div className="flex h-[calc(100vh-73px)] relative overflow-hidden text-left">
      <div className="w-80 sm:w-96 border-r border-border-dark flex flex-col bg-white/2">
        <div className="p-4 border-b border-border-dark flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">Help Documentation</h3>
            <button onClick={fetchArticles} className="p-1 rounded bg-white/5 border border-border-dark text-gray-400 hover:text-white cursor-pointer">
              <RefreshIcon style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search kb articles..."
              className="w-full bg-white/5 border border-border-dark rounded-xl py-1.5 pl-9 pr-4 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <SearchIcon className="absolute left-3 top-2 text-gray-500" style={{ fontSize: 16 }} />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {['all', 'Technical', 'Billing', 'Account'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-white/5 border border-border-dark rounded-xl"></div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <p className="font-semibold text-sm">No articles matched</p>
            </div>
          ) : (
            filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                  selectedArticle?.id === art.id
                    ? 'border-indigo-500/50 bg-indigo-500/5'
                    : 'border-border-dark hover:bg-white/1'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-semibold text-indigo-400 font-mono">{art.id}</span>
                  <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/5 font-semibold text-gray-400 uppercase">
                    {art.category}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-200 mb-1">{art.title}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-2">{art.summary}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/10">
        {selectedArticle ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="border-b border-border-dark pb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-indigo-400 font-mono">{selectedArticle.id}</span>
                <span className="text-gray-600">&bull;</span>
                <span className="text-xs text-gray-400 font-bold uppercase">{selectedArticle.category}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-100">{selectedArticle.title}</h2>
              <p className="text-sm text-gray-400 mt-2 italic">{selectedArticle.summary}</p>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap py-2">
              {selectedArticle.content}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BookIcon style={{ fontSize: 48 }} className="text-gray-600 mb-2" />
            <p className="font-semibold text-sm">Select an article to read documentation</p>
          </div>
        )}
      </div>
    </div>
  )
}
