import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">✨</span>
            <span className="font-display text-xl font-semibold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              神奇塔罗牌
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/spreads"
              className="text-dark-300 hover:text-white transition-colors"
            >
              牌阵选择
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/history"
                  className="text-dark-300 hover:text-white transition-colors"
                >
                  占卜记录
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-dark-300">欢迎, {user?.username}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                  >
                    退出
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg hover:bg-dark-700 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 transition-all"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <MobileMenu isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </nav>
  )
}

function MobileMenu({ isAuthenticated, user, onLogout }: { isAuthenticated: boolean; user: any; onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-dark-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg glass py-2">
          <Link
            to="/spreads"
            className="block px-4 py-2 hover:bg-dark-700"
            onClick={() => setIsOpen(false)}
          >
            牌阵选择
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/history"
                className="block px-4 py-2 hover:bg-dark-700"
                onClick={() => setIsOpen(false)}
              >
                占卜记录
              </Link>
              <div className="border-t border-dark-600 my-2"></div>
              <span className="block px-4 py-2 text-dark-400">欢迎, {user?.username}</span>
              <button
                onClick={() => {
                  setIsOpen(false)
                  onLogout()
                }}
                className="block w-full text-left px-4 py-2 hover:bg-dark-700"
              >
                退出
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 hover:bg-dark-700"
                onClick={() => setIsOpen(false)}
              >
                登录
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 hover:bg-dark-700"
                onClick={() => setIsOpen(false)}
              >
                注册
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
