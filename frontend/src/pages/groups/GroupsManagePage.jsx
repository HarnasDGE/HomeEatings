import { useState } from 'react'
import { useGroups } from '../../contexts/GroupContext'
import { useAuth } from '../../contexts/AuthContext'

export default function GroupsManagePage({ isOpen, onClose }) {
  const { user } = useAuth()
  const { groups, createGroup, sendInvitation, leaveGroup, loading } = useGroups()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [inviteData, setInviteData] = useState({ email: '', message: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { error } = await createGroup(formData.name, formData.description)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Grupa została utworzona!')
      setFormData({ name: '', description: '' })
      setShowCreateForm(false)
    }
  }

  const handleSendInvite = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const { error } = await sendInvitation(showInviteForm, inviteData.email, inviteData.message)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Zaproszenie zostało wysłane!')
      setInviteData({ email: '', message: '' })
      setShowInviteForm(null)
    }
  }

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Czy na pewno chcesz opuścić tę grupę?')) return

    const { error } = await leaveGroup(groupId)
    if (error) {
      setError(error.message)
    } else {
      setSuccess('Opuściłeś grupę')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6">Zarządzanie Grupami</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {!showCreateForm && !showInviteForm && (
          <>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mb-6 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 4v16m8-8H4"></path>
              </svg>
              Utwórz Nową Grupę
            </button>

            <div className="space-y-4">
              {groups.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-600">Nie należysz do żadnej grupy</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
                        {group.description && (
                          <p className="text-gray-600 mt-1">{group.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          Rola: <span className="font-medium">{group.group_members[0]?.role || 'member'}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowInviteForm(group.id)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Zaproś użytkownika"
                        >
                          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                          </svg>
                        </button>
                        {group.owner_id !== user?.id && (
                          <button
                            onClick={() => handleLeaveGroup(group.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Opuść grupę"
                          >
                            <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {showCreateForm && (
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa grupy *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                placeholder="np. Rodzina Kowalskich"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                placeholder="Opcjonalny opis grupy"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Tworzenie...' : 'Utwórz Grupę'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Anuluj
              </button>
            </div>
          </form>
        )}

        {showInviteForm && (
          <form onSubmit={handleSendInvite} className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Zaproś użytkownika</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wiadomość (opcjonalna)
              </label>
              <textarea
                value={inviteData.message}
                onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
                placeholder="Dołącz do naszej grupy!"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Wysyłanie...' : 'Wyślij Zaproszenie'}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(null)}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Anuluj
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
