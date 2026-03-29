function StarDisplay({ rating }) {
  if (!rating) return null
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`star ${n <= rating ? 'filled' : ''}`}>★</span>
      ))}
    </span>
  )
}

function CategoryBadge({ category }) {
  const label = (category || 'other').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <span className={`category-badge cat-${category || 'other'}`}>
      {label}
    </span>
  )
}

export default function RestaurantList({ restaurants, loading, onDelete, onToggleVisited, onEdit }) {
  if (loading) {
    return (
      <div className="restaurant-list">
        <div className="loading-state">Loading restaurants...</div>
      </div>
    )
  }

  if (restaurants.length === 0) {
    return (
      <div className="restaurant-list">
        <div className="restaurant-list-empty">
          <span className="empty-icon">🍽️</span>
          <p>No restaurants yet</p>
          <p style={{ fontSize: '14px' }}>Tap + to add your first one!</p>
        </div>
      </div>
    )
  }

  const handleDeleteClick = (e, restaurant) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${restaurant.name}"?`)) {
      onDelete(restaurant.id)
    }
  }

  const handleVisitedToggle = (e, restaurant) => {
    e.stopPropagation()
    onToggleVisited(restaurant)
  }

  return (
    <div className="restaurant-list">
      {restaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          className="restaurant-card"
          onClick={() => onEdit(restaurant)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onEdit(restaurant)}
          aria-label={`Edit ${restaurant.name}`}
        >
          <div className="card-header">
            <span className={`card-name ${restaurant.visited ? 'visited-name' : ''}`}>
              {restaurant.name}
            </span>
            <CategoryBadge category={restaurant.category} />
          </div>

          {restaurant.address && (
            <div className="card-address">
              <span>📍</span>
              <span>{restaurant.address}</span>
            </div>
          )}

          {restaurant.notes && (
            <div style={{ fontSize: '13px', color: '#6c757d', fontStyle: 'italic' }}>
              "{restaurant.notes.length > 80 ? restaurant.notes.slice(0, 80) + '…' : restaurant.notes}"
            </div>
          )}

          <div className="card-footer">
            <div className="card-meta">
              <StarDisplay rating={restaurant.rating} />
            </div>
            <div className="card-actions">
              <label
                className="visited-toggle"
                onClick={e => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={restaurant.visited}
                  onChange={(e) => handleVisitedToggle(e, restaurant)}
                  onClick={e => e.stopPropagation()}
                />
                Visited
              </label>
              <button
                className="delete-btn"
                onClick={(e) => handleDeleteClick(e, restaurant)}
                aria-label={`Delete ${restaurant.name}`}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
