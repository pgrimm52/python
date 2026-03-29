import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Map from './components/Map.jsx'
import RestaurantList from './components/RestaurantList.jsx'
import RestaurantForm from './components/RestaurantForm.jsx'
import CategoryFilter from './components/CategoryFilter.jsx'

const API_BASE = (import.meta.env.VITE_API_URL || '/api') + '/restaurants'

export default function App() {
  const [activeTab, setActiveTab] = useState('map')
  const [restaurants, setRestaurants] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingRestaurant, setEditingRestaurant] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (selectedCategory !== 'all') params.category = selectedCategory
      const res = await axios.get(API_BASE, { params })
      setRestaurants(res.data)
    } catch (err) {
      setError('Failed to load restaurants. Is the backend running?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  const handleSave = async (data) => {
    try {
      if (editingRestaurant) {
        await axios.put(`${API_BASE}/${editingRestaurant.id}`, data)
      } else {
        await axios.post(API_BASE, data)
      }
      setShowForm(false)
      setEditingRestaurant(null)
      fetchRestaurants()
    } catch (err) {
      console.error('Save error:', err)
      throw err
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`)
      fetchRestaurants()
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleToggleVisited = async (restaurant) => {
    try {
      await axios.put(`${API_BASE}/${restaurant.id}`, { visited: !restaurant.visited })
      fetchRestaurants()
    } catch (err) {
      console.error('Toggle visited error:', err)
    }
  }

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingRestaurant(null)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRestaurant(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <span className="header-icon">🍽️</span>
          <h1 className="header-title">Restaurant Tracker</h1>
        </div>
      </header>

      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <main className="main-content">
        {activeTab === 'map' && (
          <Map
            restaurants={restaurants}
            onDelete={handleDelete}
            onToggleVisited={handleToggleVisited}
            onEdit={handleEdit}
          />
        )}
        {activeTab === 'list' && (
          <RestaurantList
            restaurants={restaurants}
            loading={loading}
            onDelete={handleDelete}
            onToggleVisited={handleToggleVisited}
            onEdit={handleEdit}
          />
        )}
      </main>

      <button className="fab" onClick={handleAddNew} aria-label="Add restaurant">
        +
      </button>

      <nav className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <span className="tab-icon">🗺️</span>
          <span className="tab-label">Map</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">List</span>
        </button>
      </nav>

      {showForm && (
        <RestaurantForm
          restaurant={editingRestaurant}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}
    </div>
  )
}
