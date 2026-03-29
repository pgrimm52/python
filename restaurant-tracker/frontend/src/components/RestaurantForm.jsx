import { useState } from 'react'
import axios from 'axios'

const CATEGORIES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'fine_dining', label: 'Fine Dining' },
  { value: 'casual', label: 'Casual' },
  { value: 'coffee', label: 'Coffee / Cafe' },
  { value: 'bar', label: 'Bar / Cocktails' },
  { value: 'other', label: 'Other' },
]

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-picker-btn ${n <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(value === n ? null : n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          style={{ background: 'none', border: 'none', fontSize: '12px', color: '#aaa', cursor: 'pointer', marginLeft: '4px' }}
        >
          clear
        </button>
      )}
    </div>
  )
}

export default function RestaurantForm({ restaurant, onSave, onClose }) {
  const isEditing = !!restaurant

  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    address: restaurant?.address || '',
    latitude: restaurant?.latitude || null,
    longitude: restaurant?.longitude || null,
    category: restaurant?.category || 'casual',
    notes: restaurant?.notes || '',
    rating: restaurant?.rating || null,
    visited: restaurant?.visited || false,
  })
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGeocode = async () => {
    if (!formData.address.trim()) {
      alert('Please enter an address first.')
      return
    }
    setGeocoding(true)
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: formData.address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'Accept-Language': 'en',
        },
      })
      if (response.data && response.data.length > 0) {
        const result = response.data[0]
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name || prev.address,
        }))
      } else {
        alert('Address not found. Try a more specific address.')
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      alert('Failed to geocode address. Please try again.')
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Restaurant name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        rating: formData.rating || null,
      }
      await onSave(payload)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save. Please try again.')
      setSaving(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-sheet" role="dialog" aria-modal="true" aria-label={isEditing ? 'Edit Restaurant' : 'Add Restaurant'}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit Restaurant' : 'Add Restaurant'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}

            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Restaurant name"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <select
                id="category"
                className="form-select"
                value={formData.category}
                onChange={e => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="address">Address</label>
              <div className="address-row">
                <input
                  id="address"
                  type="text"
                  className="form-input"
                  placeholder="Enter address..."
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                />
                <button
                  type="button"
                  className="locate-btn"
                  onClick={handleGeocode}
                  disabled={geocoding}
                  title="Geocode address to get coordinates"
                >
                  {geocoding ? '⏳' : '📍'} Locate
                </button>
              </div>
              {formData.latitude && formData.longitude && (
                <div className="coords-display">
                  {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="form-group">
              <label className="form-label">Rating</label>
              <StarPicker
                value={formData.rating}
                onChange={val => handleChange('rating', val)}
              />
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                className="form-textarea"
                placeholder="Any notes about this place..."
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Visited */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <div className="form-checkbox-row">
                <input
                  type="checkbox"
                  id="visited"
                  checked={formData.visited}
                  onChange={e => handleChange('visited', e.target.checked)}
                />
                <label className="form-checkbox-label" htmlFor="visited">
                  Already visited
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Restaurant')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
