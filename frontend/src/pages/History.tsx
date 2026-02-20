import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { readingApi, Reading as ReadingType } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function History() {
  const [readings, setReadings] = useState<ReadingType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const data = await readingApi.getHistory()
      setReadings(data)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return <LoadingSpinner text="加载历史记录..." />
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-center mb-8"
        >
          占卜记录
        </motion.h1>

        {readings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📜</div>
            <p className="text-dark-400">暂无占卜记录</p>
            <p className="text-dark-500 text-sm mt-2">开始你的第一次占卜吧！</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {readings.map((reading, index) => (
              <motion.div
                key={reading.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="glass rounded-xl overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-dark-700/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === reading.id ? null : reading.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {reading.question || '综合运势占卜'}
                      </h3>
                      <p className="text-sm text-dark-400">{formatDate(reading.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm">
                        {reading.cards?.length || 0}张牌
                      </span>
                      <motion.span
                        animate={{ rotate: expandedId === reading.id ? 180 : 0 }}
                        className="text-dark-400"
                      >
                        ▼
                      </motion.span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {reading.cards?.map((cardData: any, i: number) => (
                      <div
                        key={i}
                        className="flex-shrink-0 px-3 py-2 rounded-lg bg-dark-800 text-sm"
                      >
                        <span className={cardData.is_reversed ? 'text-red-400' : 'text-green-400'}>
                          {cardData.card?.name_cn}
                        </span>
                        <span className="text-dark-500 ml-1">
                          ({cardData.position?.name_cn})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {expandedId === reading.id && reading.interpretation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-dark-700"
                  >
                    <div className="p-6">
                      <h4 className="font-semibold mb-3 text-primary-400">AI解读</h4>
                      <div className="whitespace-pre-wrap text-dark-200 leading-relaxed">
                        {reading.interpretation}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
