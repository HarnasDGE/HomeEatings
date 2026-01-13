export default function ProductsList({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">🥗</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Brak produktów
        </h3>
        <p className="text-gray-600">
          Dodaj swój pierwszy produkt, aby rozpocząć zarządzanie posiłkami
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex-1">
              {product.name}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(product)}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edytuj"
              >
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Usuń"
              >
                <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Jednostka:</span>
              <span className="font-medium text-gray-800">{product.unit}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Kalorie:</span>
              <span className="font-medium text-orange-600">
                {product.calories} kcal
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
