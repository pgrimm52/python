import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CATEGORY_COLORS = {
  breakfast: '#FF9500',
  brunch: '#FF7F50',
  coffee: '#8B4513',
  lunch: '#4CAF50',
  casual: '#66BB6A',
  dinner: '#7B1FA2',
  fine_dining: '#6A1B9A',
  bar: '#E53935',
  other: '#78909C',
}

function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || '#78909C'
}

function StarDisplay({ rating }) {
  if (!rating) return <span style={{ color: '#aaa', fontSize: '12px' }}>No rating</span>
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? '#FFB800' : '#ddd', fontSize: '14px' }}>★</span>
      ))}
    </span>
  )
}

function CategoryBadge({ category }) {
  const color = getCategoryColor(category)
  const label = category?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Other'
  return (
    <span style={{
      background: color,
      color: 'white',
      borderRadius: '12px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {label}
    </span>
  )
}

// Component to handle map updates and markers
function MarkerLayer({ restaurants, onDelete, onToggleVisited, onEdit }) {
  const map = useMap()
  const markersRef = useRef([])

  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    restaurants.forEach((restaurant) => {
      if (restaurant.latitude == null || restaurant.longitude == null) return

      const color = getCategoryColor(restaurant.category)
      const marker = L.circleMarker([restaurant.latitude, restaurant.longitude], {
        radius: 10,
        fillColor: color,
        color: 'white',
        weight: 2.5,
        opacity: 1,
        fillOpacity: restaurant.visited ? 0.4 : 0.9,
      })

      const categoryLabel = (restaurant.category || 'other').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
      const starsHtml = restaurant.rating
        ? [1,2,3,4,5].map(n => `<span style="color:${n <= restaurant.rating ? '#FFB800' : '#ddd'}">★</span>`).join('')
        : '<span style="color:#aaa;font-size:12px">No rating</span>'

      const popupContent = document.createElement('div')
      popupContent.className = 'map-popup'
      popupContent.innerHTML = `
        <h3>${restaurant.name}</h3>
        <div class="popup-meta">
          <span style="background:${color};color:white;border-radius:12px;padding:2px 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
            ${categoryLabel}
          </span>
          <div style="margin-top:4px">${starsHtml}</div>
          ${restaurant.address ? `<div style="font-size:12px;color:#6c757d;margin-top:2px">📍 ${restaurant.address}</div>` : ''}
        </div>
        ${restaurant.notes ? `<p class="popup-notes">"${restaurant.notes}"</p>` : ''}
        <div class="popup-actions">
          <label class="popup-visited">
            <input type="checkbox" id="popup-visited-${restaurant.id}" ${restaurant.visited ? 'checked' : ''} />
            Visited
          </label>
          <div style="display:flex;gap:6px">
            <button class="popup-edit-btn" id="popup-edit-${restaurant.id}" style="background:#FF6B35;color:white;border:none;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer;">Edit</button>
            <button class="popup-delete-btn" id="popup-delete-${restaurant.id}">Delete</button>
          </div>
        </div>
      `

      const popup = L.popup({ maxWidth: 260, className: 'restaurant-popup' }).setContent(popupContent)
      marker.bindPopup(popup)

      marker.on('popupopen', () => {
        const deleteBtn = document.getElementById(`popup-delete-${restaurant.id}`)
        const editBtn = document.getElementById(`popup-edit-${restaurant.id}`)
        const visitedCheckbox = document.getElementById(`popup-visited-${restaurant.id}`)

        if (deleteBtn) {
          deleteBtn.onclick = (e) => {
            e.stopPropagation()
            if (window.confirm(`Delete "${restaurant.name}"?`)) {
              marker.closePopup()
              onDelete(restaurant.id)
            }
          }
        }
        if (editBtn) {
          editBtn.onclick = (e) => {
            e.stopPropagation()
            marker.closePopup()
            onEdit(restaurant)
          }
        }
        if (visitedCheckbox) {
          visitedCheckbox.onchange = () => {
            onToggleVisited(restaurant)
          }
        }
      })

      marker.addTo(map)
      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
    }
  }, [restaurants, map, onDelete, onToggleVisited, onEdit])

  return null
}

function UserLocationMarker({ position }) {
  const map = useMap()
  const markerRef = useRef(null)

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.remove()
      markerRef.current = null
    }

    if (position) {
      const userMarker = L.circleMarker([position.lat, position.lng], {
        radius: 8,
        fillColor: '#2979FF',
        color: 'white',
        weight: 3,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(map)
      userMarker.bindPopup('<b>You are here</b>')
      markerRef.current = userMarker
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
      }
    }
  }, [position, map])

  return null
}

function FlyToLocation({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom || 14, { duration: 1.2 })
    }
  }, [target, map])
  return null
}

export default function Map({ restaurants, onDelete, onToggleVisited, onEdit }) {
  const [userLocation, setUserLocation] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)

  const handleFindNearby = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setFlyTarget({ ...loc, zoom: 14 })
        setLocationLoading(false)
      },
      (err) => {
        console.error('Geolocation error:', err)
        alert('Could not get your location. Please check permissions.')
        setLocationLoading(false)
      },
      { timeout: 10000 }
    )
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(loc)
        setFlyTarget({ ...loc, zoom: 15 })
        setLocationLoading(false)
      },
      () => {
        alert('Could not get your location.')
        setLocationLoading(false)
      },
      { timeout: 10000 }
    )
  }

  // Try to get user location on mount silently
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        () => {},
        { timeout: 5000 }
      )
    }
  }, [])

  const defaultCenter = [40.7128, -74.0060] // NYC default
  const defaultZoom = 12

  return (
    <div className="map-container">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="leaflet-map"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerLayer
          restaurants={restaurants}
          onDelete={onDelete}
          onToggleVisited={onToggleVisited}
          onEdit={onEdit}
        />
        <UserLocationMarker position={userLocation} />
        {flyTarget && <FlyToLocation target={flyTarget} />}
      </MapContainer>

      <div className="map-controls">
        <button
          className="map-control-btn"
          onClick={handleFindNearby}
          disabled={locationLoading}
          title="Find restaurants near me"
        >
          {locationLoading ? '⏳' : '📍'} Nearby
        </button>
        <button
          className="map-control-btn"
          onClick={handleLocateMe}
          disabled={locationLoading}
          title="Center map on my location"
        >
          🎯 Me
        </button>
      </div>
    </div>
  )
}
