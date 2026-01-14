import { useState } from 'react'
import { useGroups } from '../../contexts/GroupContext'

export default function InvitationsInbox({ isOpen, onClose }) {
  const { invitations, acceptInvitation, rejectInvitation, loading } = useGroups()
  const [processing, setProcessing] = useState(null)

  if (!isOpen) return null

  const handleAccept = async (invitationId) => {
    setProcessing(invitationId)
    await acceptInvitation(invitationId)
    setProcessing(null)
  }

  const handleReject = async (invitationId) => {
    setProcessing(invitationId)
    await rejectInvitation(invitationId)
    setProcessing(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span>📬</span> Zaproszenia
          {invitations.length > 0 && (
            <span className="bg-orange-500 text-white text-sm px-2 py-1 rounded-full">
              {invitations.length}
            </span>
          )}
        </h2>

        {invitations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600">Brak zaproszeń</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {invitation.inviter?.avatar_url ? (
                      <img
                        src={invitation.inviter.avatar_url}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold">
                        {invitation.inviter?.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {invitation.inviter?.full_name || 'Użytkownik'}
                      </p>
                      <p className="text-sm text-gray-600">
                        zaprasza Cię do grupy
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-orange-600 mb-2">
                    {invitation.groups?.name}
                  </h3>
                  {invitation.message && (
                    <p className="text-gray-700 text-sm bg-white p-3 rounded-lg">
                      "{invitation.message}"
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAccept(invitation.id)}
                    disabled={processing === invitation.id}
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    Akceptuj
                  </button>
                  <button
                    onClick={() => handleReject(invitation.id)}
                    disabled={processing === invitation.id}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Odrzuć
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  Wysłane: {new Date(invitation.created_at).toLocaleDateString('pl-PL')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
