import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Śniadanie' },
  { value: 'lunch', label: 'Obiad' },
  { value: 'dinner', label: 'Kolacja' },
  { value: 'snack', label: 'Przekąska' },
]

export default function MealForm({ meal, onClose, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meal_type: 'breakfast',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    cooking_time: 0,
    servings: 1,
    preparation_steps: [''],
  })

  useEffect(() => {
    if (meal) {
      setFormData({
        name: meal.name || '',
        description: meal.description || '',
        meal_type: meal.meal_type || 'breakfast',
        calories: meal.calories || 0,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fats: meal.fats || 0,
        cooking_time: meal.cooking_time || 0,
        servings: meal.servings || 1,
        preparation_steps: meal.preparation_steps || [''],
      })
    }
  }, [meal])

  const handleAddStep = () => {
    setFormData({
      ...formData,
      preparation_steps: [...formData.preparation_steps, '']
    })
  }

  const handleRemoveStep = (index) => {
    setFormData({
      ...formData,
      preparation_steps: formData.preparation_steps.filter((_, i) => i !== index)
    })
  }

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.preparation_steps]
    newSteps[index] = value
    setFormData({ ...formData, preparation_steps: newSteps })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!supabase) {
      setError('Supabase not configured')
      setLoading(false)
      return
    }

    try {
      const dataToSave = {
        ...formData,
        user_id: user.id,
        preparation_steps: formData.preparation_steps.filter(s => s.trim() !== ''),
        updated_at: new Date().toISOString(),
      }

      if (meal) {
        const { error } = await supabase
          .from('meals')
          .update(dataToSave)
          .eq('id', meal.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('meals')
          .insert([dataToSave])

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving meal:', error)
      setError(error.message || 'Nie udało się zapisać posiłku')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {meal ? 'Edytuj Posiłek' : 'Dodaj Posiłek'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa posiłku *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ posiłku *
              </label>
              <select
                value={formData.meal_type}
                onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                {MEAL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liczba porcji
              </label>
              <input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kalorie (kcal)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Czas gotowania (min)
              </label>
              <input
                type="number"
                value={formData.cooking_time}
                onChange={(e) => setFormData({ ...formData, cooking_time: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Białko (g)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Węglowodany (g)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tłuszcze (g)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.fats}
                onChange={(e) => setFormData({ ...formData, fats: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Kroki przygotowania
              </label>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                + Dodaj krok
              </button>
            </div>
            <div className="space-y-2">
              {formData.preparation_steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-8 h-10 flex items-center justify-center text-gray-500 font-medium">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder={`Krok ${index + 1}`}
                  />
                  {formData.preparation_steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="flex-shrink-0 text-red-600 hover:text-red-800 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Zapisywanie...' : meal ? 'Zaktualizuj' : 'Dodaj'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
