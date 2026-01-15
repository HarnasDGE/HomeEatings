import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import MealForm from '../../components/meals/MealForm'
import MealsList from '../../components/meals/MealsList'

export default function MealsPage() {
  const { user } = useAuth()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadMeals()
    } else {
      // If no user, stop loading
      setLoading(false)
    }
  }, [user])

  const loadMeals = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('meals')
        .select(`
          *,
          meal_products (
            quantity,
            product:products (*)
          )
        `)
        .order('name')

      if (error) throw error
      setMeals(data || [])
    } catch (error) {
      console.error('Error loading meals:', error)
      setError('Nie udało się załadować posiłków')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Czy na pewno chcesz usunąć ten posiłek?')) return

    if (!supabase) {
      setError('Supabase not configured')
      return
    }

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMeals(meals.filter(m => m.id !== id))
    } catch (error) {
      console.error('Error deleting meal:', error)
      setError('Nie udało się usunąć posiłku')
    }
  }

  const handleEdit = (meal) => {
    setEditingMeal(meal)
    setFormOpen(true)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingMeal(null)
  }

  const handleFormSuccess = () => {
    loadMeals()
    handleFormClose()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Zaloguj się, aby zarządzać posiłkami
          </h2>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie posiłków...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lista Posiłków</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 4v16m8-8H4"></path>
          </svg>
          Dodaj Posiłek
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <MealsList
        meals={meals}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {formOpen && (
        <MealForm
          meal={editingMeal}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
