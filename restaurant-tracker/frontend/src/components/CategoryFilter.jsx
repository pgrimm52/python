const CATEGORIES = [
  { value: 'all', label: 'All', color: '#6c757d' },
  { value: 'breakfast', label: 'Breakfast', color: '#FF9500' },
  { value: 'brunch', label: 'Brunch', color: '#FF7F50' },
  { value: 'lunch', label: 'Lunch', color: '#4CAF50' },
  { value: 'coffee', label: 'Coffee', color: '#8B4513' },
  { value: 'casual', label: 'Casual', color: '#66BB6A' },
  { value: 'dinner', label: 'Dinner', color: '#7B1FA2' },
  { value: 'fine_dining', label: 'Fine Dining', color: '#6A1B9A' },
  { value: 'bar', label: 'Bar', color: '#E53935' },
  { value: 'other', label: 'Other', color: '#78909C' },
]

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="category-filter" role="tablist" aria-label="Category filter">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          role="tab"
          aria-selected={selectedCategory === cat.value}
          className={`filter-chip ${selectedCategory === cat.value ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.value)}
        >
          {cat.value !== 'all' && (
            <span
              className="filter-chip-dot"
              style={{ background: cat.color }}
            />
          )}
          {cat.label}
        </button>
      ))}
    </div>
  )
}

export { CATEGORIES }
