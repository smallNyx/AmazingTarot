import { motion } from 'framer-motion'
import { TarotCard as TarotCardType } from '../services/api'

interface TarotCardProps {
  card: TarotCardType
  isReversed: boolean
  isFlipped: boolean
  onClick?: () => void
  positionName?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function TarotCard({
  card,
  isReversed,
  isFlipped,
  onClick,
  positionName,
  size = 'md',
}: TarotCardProps) {
  const sizeClasses = {
    sm: 'w-20 h-32',
    md: 'w-32 h-52',
    lg: 'w-40 h-64',
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} cursor-pointer`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 card-back rounded-xl flex items-center justify-center backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">✨</div>
            <div className="text-xs text-primary-300">点击翻牌</div>
          </div>
        </div>

        <div
          className="absolute inset-0 card-front rounded-xl p-3 flex flex-col backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-3xl mb-2">
              {card.arcana === 'Major' ? getMajorArcanaSymbol(card.number || 0) : getSuitSymbol(card.name)}
            </div>
            <h3 className={`font-display text-sm text-center ${isReversed ? 'rotate-180' : ''}`}>
              {card.name_cn}
            </h3>
            <p className={`text-xs text-dark-400 mt-1 ${isReversed ? 'rotate-180' : ''}`}>
              {card.name}
            </p>
          </div>
          
          <div className="text-center">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isReversed
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-green-500/20 text-green-300'
              }`}
            >
              {isReversed ? '逆位' : '正位'}
            </span>
          </div>
        </div>
      </div>

      {positionName && (
        <div className="text-center mt-2 text-sm text-primary-300">{positionName}</div>
      )}
    </motion.div>
  )
}

function getMajorArcanaSymbol(number: number): string {
  const symbols = ['🃏', '🪄', '🌙', '👑', '🏛️', '⛪', '❤️', '🏎️', '🦁', '🏮', '🎡', '⚖️', '🙃', '💀', '⚗️', '😈', '🗼', '⭐', '🌙', '☀️', '📯', '🌍']
  return symbols[number] || '✨'
}

function getSuitSymbol(name: string): string {
  if (name.includes('Wands')) return '🔥'
  if (name.includes('Cups')) return '💧'
  if (name.includes('Swords')) return '🗡️'
  if (name.includes('Pentacles')) return '💰'
  return '✨'
}
