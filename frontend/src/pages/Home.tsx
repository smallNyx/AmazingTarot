import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { spreadApi } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const handleRecommend = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    try {
      const result = await spreadApi.recommend(question)
      navigate(`/reading/${result.spread_id}`, {
        state: { question, recommendation: result },
      })
    } catch (error) {
      console.error('Failed to get recommendation:', error)
      navigate('/spreads')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              神奇塔罗牌
            </h1>
            <p className="text-xl md:text-2xl text-dark-300 mb-8">
              让AI为你解读命运的奥秘
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-2xl p-8 mb-8"
          >
            <h2 className="text-xl font-semibold mb-4">输入你的问题，AI为你推荐最佳牌阵</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例如：我的感情运势如何？近期工作会有什么变化？"
                className="flex-1 px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-primary-500 focus:outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleRecommend()}
              />
              <button
                onClick={handleRecommend}
                disabled={isLoading || !question.trim()}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isLoading ? '思考中...' : '开始占卜'}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/spreads"
              className="inline-block px-6 py-3 rounded-lg border border-primary-500 text-primary-400 hover:bg-primary-500/10 transition-colors"
            >
              或选择牌阵 →
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">功能特色</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 * index }}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">热门牌阵</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {popularSpreads.map((spread, index) => (
              <motion.div
                key={spread.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className="glass rounded-xl p-6 text-center hover:border-primary-500/50 transition-colors cursor-pointer"
                onClick={() => {
                  if (isAuthenticated || spread.name === '三张牌占卜法') {
                    navigate(`/reading/${spread.id}`)
                  } else {
                    navigate('/login')
                  }
                }}
              >
                <div className="text-3xl mb-3">{spread.icon}</div>
                <h3 className="font-semibold mb-1">{spread.name}</h3>
                <p className="text-sm text-dark-400">{spread.cards}张牌</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '🔮',
    title: 'AI智能解读',
    description: 'DeepSeek AI为你提供专业、深入的塔罗牌解读',
  },
  {
    icon: '🎴',
    title: '多种牌阵',
    description: '24种经典牌阵，涵盖爱情、事业、运势等各个方面',
  },
  {
    icon: '✨',
    title: '精美动画',
    description: '流畅的翻牌动画，沉浸式的占卜体验',
  },
]

const popularSpreads = [
  { id: 1, name: '三张牌占卜法', cards: 3, icon: '🎴' },
  { id: 2, name: '时间流牌阵', cards: 3, icon: '⏰' },
  { id: 7, name: '恋人金字塔', cards: 5, icon: '💕' },
  { id: 25, name: '凯尔特十字', cards: 10, icon: '✝️' },
]
