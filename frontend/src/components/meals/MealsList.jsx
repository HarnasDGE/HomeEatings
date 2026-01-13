const MEAL_TYPES = {
  breakfast: { label: 'Śniadanie', emoji: '🥐', color: 'bg-yellow-100 text-yellow-800' },
  lunch: { label: 'Obiad', emoji: '🍽️', color: 'bg-orange-100 text-orange-800' },
  dinner: { label: 'Kolacja', emoji: '🌙', color: 'bg-purple-100 text-purple-800' },
  snack: { label: 'Przekąska', emoji: '🍎', color: 'bg-green-100 text-green-800' },
}

export default function MealsList({ meals, onEdit, onDelete }) {
  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">🍲</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Brak posiłków
        </h3>
        <p className="text-gray-600">
          Dodaj swój pierwszy posiłek, aby rozpocząć planowanie diety
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {meals.map((meal) => {
        const type = MEAL_TYPES[meal.meal_type] || MEAL_TYPES.snack

        return (
          <div
            key={meal.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {meal.image_url && (
              <img
                src={meal.image_url}
                alt={meal.name}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.color}`}>
                      {type.emoji} {type.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {meal.name}
                  </h3>
                  {meal.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {meal.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => onEdit(meal)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edytuj"
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(meal.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Usuń"
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Kalorie</div>
                  <div className="text-lg font-bold text-orange-600">{meal.calories} kcal</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-1">Porcje</div>
                  <div className="text-lg font-bold text-gray-800">{meal.servings}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span>🥩 {meal.protein}g</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🍞 {meal.carbs}g</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🥑 {meal.fats}g</span>
                </div>
              </div>

              {meal.cooking_time && (
                <div className="mt-4 text-sm text-gray-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {meal.cooking_time} min
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
