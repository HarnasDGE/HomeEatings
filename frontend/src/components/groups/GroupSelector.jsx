import { useState, useRef, useEffect } from 'react'
import { useGroups } from '../../contexts/GroupContext'

export default function GroupSelector({ onOpenInbox, onOpenManage }) {
  const { groups, currentGroup, setCurrentGroup, invitations } = useGroups()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors relative"
      >
        <span className="text-lg">👥</span>
        <span className="font-medium text-gray-700">
          {currentGroup?.name || 'Moje posiłki'}
        </span>
        {invitations.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {invitations.length}
          </span>
        )}
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
        <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-[250px]">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-xs text-gray-500 uppercase font-semibold">Moje grupy</p>
          </div>

          <button
            onClick={() => {
              setCurrentGroup(null)
              setIsOpen(false)
            }}
            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 ${
              !currentGroup ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
            }`}
          >
            <span className="text-lg">🏠</span>
            <span className="font-medium">Moje posiłki</span>
          </button>

          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => {
                setCurrentGroup(group)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 ${
                currentGroup?.id === group.id ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">👥</span>
              <span className="font-medium">{group.name}</span>
            </button>
          ))}

          <div className="border-t border-gray-200 mt-2 pt-2">
            <button
              onClick={() => {
                onOpenManage()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span className="font-medium">Zarządzaj grupami</span>
            </button>

            <button
              onClick={() => {
                onOpenInbox()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-gray-700 relative"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <span className="font-medium">Zaproszenia</span>
              {invitations.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {invitations.length}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
