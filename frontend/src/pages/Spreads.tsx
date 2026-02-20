import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { spreadApi, Spread } from '../services/api'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Spreads() {
  const [spreads, setSpreads] = useState<Spread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    loadSpreads()
  }, [])

  const loadSpreads = async () => {
    try {
      const data = await spreadApi.getAll()
      setSpreads(data)
    } catch (error) {
      console.error('Failed to load spreads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ['all', ...new Set(spreads.map((s) => s.category))]

  const filteredSpreads =
    selectedCategory === 'all'
      ? spreads
      : spreads.filter((s) => s.category === selectedCategory)

  const handleSelect = (spread: Spread) => {
    if (isAuthenticated || spread.name === 'three_cards') {
      navigate(`/reading/${spread.id}`)
    } else {
      navigate('/login')
    }
  }

  if (isLoading) {
    return <LoadingSpinner text="加载牌阵中..." />
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-center mb-8"
        >
          选择牌阵
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'glass hover:bg-dark-700'
              }`}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpreads.map((spread, index) => (
            <motion.div
              key={spread.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * index }}
              className="glass rounded-xl p-6 cursor-pointer hover:border-primary-500/50 transition-all hover:scale-[1.02]"
              onClick={() => handleSelect(spread)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-semibold">{spread.name_cn}</h3>
                  <p className="text-sm text-dark-400">{spread.name}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm">
                  {spread.card_count}张
                </span>
              </div>

              <p className="text-dark-300 text-sm line-clamp-3 mb-4">{spread.description}</p>

              <div className="flex flex-wrap gap-2">
                {spread.positions.slice(0, 4).map((pos) => (
                  <span
                    key={pos.order}
                    className="px-2 py-1 rounded bg-dark-700 text-xs text-dark-300"
                  >
                    {pos.name_cn}
                  </span>
                ))}
                {spread.positions.length > 4 && (
                  <span className="px-2 py-1 rounded bg-dark-700 text-xs text-dark-400">
                    +{spread.positions.length - 4}
                  </span>
                )}
              </div>

              {!isAuthenticated && spread.name !== 'three_cards' && (
                <div className="mt-4 text-xs text-primary-400">登录后可用</div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
