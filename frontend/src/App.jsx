import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import AuthModal from './components/auth/AuthModal'
import ProfileModal from './components/profile/ProfileModal'
import UserMenu from './components/layout/UserMenu'

function App() {
  const { user, loading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  const [meals, setMeals] = useState([
    { id: 1, name: 'Śniadanie', time: '08:00', prepared: false },
    { id: 2, name: 'Obiad', time: '13:00', prepared: false },
    { id: 3, name: 'Kolacja', time: '18:00', prepared: false },
  ])

  const toggleMealStatus = (id) => {
    setMeals(meals.map(meal =>
      meal.id === id ? { ...meal, prepared: !meal.prepared } : meal
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🍽️</span>
              <span className="text-2xl font-bold text-orange-600">HomeEatings</span>
            </div>

            {user ? (
              <UserMenu onOpenProfile={() => setProfileModalOpen(true)} />
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Zaloguj się
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Message */}
        {!user && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Witaj w HomeEatings!
            </h2>
            <p className="text-gray-600 mb-4">
              Zaloguj się, aby synchronizować swoje posiłki i korzystać ze wszystkich funkcji.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Rozpocznij teraz
            </button>
          </div>
        )}

        {/* Meals List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Dzisiejsze posiłki
          </h2>

          <div className="space-y-4">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                  meal.prepared
                    ? 'bg-green-50 border-green-300'
                    : 'bg-white border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleMealStatus(meal.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      meal.prepared
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {meal.prepared && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </button>

                  <div>
                    <h3 className={`text-lg font-medium ${
                      meal.prepared ? 'text-gray-500 line-through' : 'text-gray-800'
                    }`}>
                      {meal.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Planowane na: {meal.time}
                    </p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  meal.prepared
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {meal.prepared ? 'Przygotowane' : 'Do zrobienia'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {meals.length}
            </div>
            <div className="text-gray-600 mt-1">Wszystkie posiłki</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {meals.filter(m => m.prepared).length}
            </div>
            <div className="text-gray-600 mt-1">Przygotowane</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {meals.filter(m => !m.prepared).length}
            </div>
            <div className="text-gray-600 mt-1">Do zrobienia</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Wersja 1.0.0 - Twoja aplikacja do zarządzania posiłkami</p>
        </div>
      </div>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  )
}

export default App
