import { useEffect, useState } from 'react'

interface Star {
  id: number
  left: string
  top: string
  animationDelay: string
  size: string
}

export default function Stars() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    const newStars: Star[] = []
    for (let i = 0; i < 100; i++) {
      newStars.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        size: `${Math.random() * 2 + 1}px`,
      })
    }
    setStars(newStars)
  }, [])

  return (
    <div className="stars">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.animationDelay,
            width: star.size,
            height: star.size,
          }}
        />
      ))}
    </div>
  )
}
