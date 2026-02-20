import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { spreadApi, readingApi, Spread, DrawCardResult } from '../services/api'
import TarotCard from '../components/TarotCard'
import LoadingSpinner from '../components/LoadingSpinner'

type Step = 'question' | 'draw' | 'result' | 'interpret'

export default function Reading() {
  const { spreadId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [spread, setSpread] = useState<Spread | null>(null)
  const [question, setQuestion] = useState(location.state?.question || '')
  const [cards, setCards] = useState<DrawCardResult[]>([])
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [interpretation, setInterpretation] = useState('')
  const [step, setStep] = useState<Step>('question')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (spreadId) {
      loadSpread()
    }
  }, [spreadId])

  const loadSpread = async () => {
    try {
      const data = await spreadApi.getById(Number(spreadId))
      setSpread(data)
    } catch (error) {
      console.error('Failed to load spread:', error)
    }
  }

  const handleStartDraw = () => {
    setStep('draw')
  }

  const handleDrawCards = async () => {
    setIsLoading(true)
    try {
      const drawnCards = await readingApi.drawCards(Number(spreadId))
      setCards(drawnCards)
      setStep('result')
    } catch (error) {
      console.error('Failed to draw cards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlipCard = (index: number) => {
    setFlippedCards((prev) => new Set(prev).add(index))
  }

  const allCardsFlipped = cards.length > 0 && flippedCards.size === cards.length

  const handleInterpret = async () => {
    setIsLoading(true)
    setStep('interpret')
    try {
      const result = await readingApi.interpret(question, spread?.name_cn || '', cards)
      setInterpretation(result.interpretation)
      
      await readingApi.create(Number(spreadId), question || null, cards)
    } catch (error) {
      console.error('Failed to interpret:', error)
      setInterpretation('解读服务暂时不可用，请稍后再试。')
    } finally {
      setIsLoading(false)
    }
  }

  if (!spread) {
    return <LoadingSpinner text="加载牌阵中..." />
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">{spread.name_cn}</h1>
          <p className="text-dark-400">{spread.description}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-xl p-8"
            >
              <h2 className="text-xl font-semibold mb-4 text-center">请输入你的问题（可选）</h2>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="输入你想要占卜的问题，AI会根据你的问题进行更精准的解读..."
                className="w-full h-32 px-4 py-3 rounded-lg bg-dark-800 border border-dark-600 focus:border-primary-500 focus:outline-none transition-colors resize-none"
              />
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleStartDraw}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 transition-all font-medium"
                >
                  开始抽牌
                </button>
              </div>
            </motion.div>
          )}

          {step === 'draw' && (
            <motion.div
              key="draw"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="glass rounded-xl p-12 mb-8">
                <div className="text-6xl mb-6">🎴</div>
                <h2 className="text-2xl font-semibold mb-4">准备好了吗？</h2>
                <p className="text-dark-400 mb-8">集中精神，想着你的问题，然后点击下方按钮</p>
                <button
                  onClick={handleDrawCards}
                  disabled={isLoading}
                  className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 transition-all font-medium text-lg"
                >
                  {isLoading ? '抽牌中...' : '抽取塔罗牌'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">点击卡牌翻转查看</h2>
                <p className="text-dark-400">
                  已翻转 {flippedCards.size} / {cards.length} 张
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {cards.map((cardResult, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex flex-col items-center"
                  >
                    <TarotCard
                      card={cardResult.card}
                      isReversed={cardResult.is_reversed}
                      isFlipped={flippedCards.has(index)}
                      onClick={() => handleFlipCard(index)}
                      positionName={cardResult.position.name_cn}
                    />
                  </motion.div>
                ))}
              </div>

              {allCardsFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <button
                    onClick={handleInterpret}
                    disabled={isLoading}
                    className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 disabled:opacity-50 transition-all font-medium text-lg"
                  >
                    {isLoading ? '解读中...' : '获取AI解读'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'interpret' && (
            <motion.div
              key="interpret"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {cards.map((cardResult, index) => (
                  <TarotCard
                    key={index}
                    card={cardResult.card}
                    isReversed={cardResult.is_reversed}
                    isFlipped={true}
                    positionName={cardResult.position.name_cn}
                    size="sm"
                  />
                ))}
              </div>

              <div className="glass rounded-xl p-8">
                <h2 className="font-display text-2xl font-bold mb-6 text-center">AI解读</h2>
                
                {question && (
                  <div className="mb-6 p-4 rounded-lg bg-dark-800">
                    <p className="text-sm text-dark-400 mb-1">你的问题：</p>
                    <p className="text-primary-300">{question}</p>
                  </div>
                )}

                {isLoading ? (
                  <LoadingSpinner text="AI正在为你解读..." />
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-dark-200 leading-relaxed">
                      {interpretation}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={() => {
                    setCards([])
                    setFlippedCards(new Set())
                    setInterpretation('')
                    setStep('question')
                  }}
                  className="px-6 py-3 rounded-lg border border-primary-500 text-primary-400 hover:bg-primary-500/10 transition-colors"
                >
                  重新占卜
                </button>
                <button
                  onClick={() => navigate('/history')}
                  className="px-6 py-3 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                >
                  查看历史
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
