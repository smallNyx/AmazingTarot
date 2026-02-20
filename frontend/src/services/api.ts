import api from '../store/api'

export interface TarotCard {
  id: number
  name: string
  name_cn: string
  arcana: string
  number: number | null
  element: string | null
  zodiac: string | null
  keywords: string
  upright_meaning: string
  reversed_meaning: string
  description: string
  image_url: string | null
}

export interface SpreadPosition {
  name: string
  name_cn: string
  description: string
  order: number
}

export interface Spread {
  id: number
  name: string
  name_cn: string
  card_count: number
  description: string
  positions: SpreadPosition[]
  category: string
}

export interface DrawCardResult {
  card: TarotCard
  is_reversed: boolean
  position: SpreadPosition
}

export interface Reading {
  id: number
  spread_id: number
  question: string | null
  cards: DrawCardResult[]
  interpretation: string | null
  created_at: string
}

export interface SpreadRecommend {
  spread_id: number
  spread_name: string
  spread_name_cn: string
  reason: string
}

export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password })
    return response.data
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

export const spreadApi = {
  getAll: async (): Promise<Spread[]> => {
    const response = await api.get('/spreads')
    return response.data
  },

  getById: async (id: number): Promise<Spread> => {
    const response = await api.get(`/spreads/${id}`)
    return response.data
  },

  recommend: async (question: string): Promise<SpreadRecommend> => {
    const response = await api.post('/spreads/recommend', { question })
    return response.data
  },
}

export const readingApi = {
  drawCards: async (spreadId: number): Promise<DrawCardResult[]> => {
    const response = await api.post(`/readings/draw/${spreadId}`)
    return response.data
  },

  create: async (spreadId: number, question: string | null, cards: DrawCardResult[]) => {
    const response = await api.post('/readings/create', {
      spread_id: spreadId,
      question,
      cards,
    })
    return response.data
  },

  getHistory: async (limit = 20, offset = 0): Promise<Reading[]> => {
    const response = await api.get(`/readings/history?limit=${limit}&offset=${offset}`)
    return response.data
  },

  getById: async (id: number): Promise<Reading> => {
    const response = await api.get(`/readings/${id}`)
    return response.data
  },

  interpret: async (question: string | null, spreadName: string, cards: DrawCardResult[]) => {
    const response = await api.post('/readings/interpret', {
      question,
      spread_name: spreadName,
      cards,
    })
    return response.data
  },
}
