import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import UserMenu from './UserMenu'
import AuthModal from '../auth/AuthModal'
import GroupSelector from '../groups/GroupSelector'

export default function Navigation({ onOpenProfile, onOpenInbox, onOpenManage }) {
  const { user } = useAuth()
  const location = useLocation()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-3xl">🍽️</span>
                <span className="text-2xl font-bold text-orange-600">HomeEatings</span>
              </Link>

              {user && <GroupSelector onOpenInbox={onOpenInbox} onOpenManage={onOpenManage} />}

              {user && (
                <div className="hidden md:flex items-center gap-1">
                  <Link
                    to="/"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive('/')
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/products"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive('/products')
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    Produkty
                  </Link>
                  <Link
                    to="/meals"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive('/meals')
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`}
                  >
                    Posiłki
                  </Link>
                </div>
              )}
            </div>

            {user ? (
              <UserMenu onOpenProfile={onOpenProfile} />
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Zaloguj się
              </button>
            )}
          </div>

          {/* Mobile navigation */}
          {user && (
            <div className="md:hidden flex gap-1 mt-4 border-t pt-4">
              <Link
                to="/"
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-center ${
                  isActive('/')
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/products"
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-center ${
                  isActive('/products')
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
              >
                Produkty
              </Link>
              <Link
                to="/meals"
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-center ${
                  isActive('/meals')
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
              >
                Posiłki
              </Link>
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}
