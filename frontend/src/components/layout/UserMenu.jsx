import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function UserMenu({ onOpenProfile }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { user, profile, signOut } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name
    return user?.email?.split('@')[0] || 'Użytkownik'
  }

  const getInitials = () => {
    const name = getDisplayName()
    return name.charAt(0).toUpperCase()
  }

  const getAvatarUrl = () => {
    if (profile?.avatar_url) return profile.avatar_url
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url
    return null
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-orange-50 rounded-full py-2 px-3 transition-colors"
      >
        {getAvatarUrl() ? (
          <img
            src={getAvatarUrl()}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-white font-bold border-2 border-orange-200">
            {getInitials()}
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-sm font-semibold text-gray-800">{getDisplayName()}</div>
          <div className="text-xs text-gray-500">{user?.email}</div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="font-semibold text-gray-800">{getDisplayName()}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>

          <button
            onClick={() => {
              onOpenProfile()
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Edytuj profil
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-red-600 border-t border-gray-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Wyloguj się
          </button>
        </div>
      )}
    </div>
  )
}
