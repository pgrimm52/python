# Restaurant Tracker

A mobile-friendly PWA to track restaurants you want to visit, with map view and geolocation.

## Features

- Track restaurants with name, address, category, notes, and rating
- View all restaurants on an interactive map with colored markers by category
- Find nearby restaurants using your device's geolocation
- Filter by category (breakfast, brunch, lunch, dinner, fine dining, casual, coffee, bar)
- Mark restaurants as visited
- Geocode addresses to automatically get map coordinates
- Mobile-first responsive design

## Tech Stack

- **Backend**: FastAPI + SQLite (SQLAlchemy)
- **Frontend**: React (Vite) + Leaflet.js

## Setup & Running

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Vite dev server proxies `/api/*` requests to the backend at `http://localhost:8000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/restaurants` | List all restaurants (optional `?category=` and `?visited=` filters) |
| POST | `/restaurants` | Create a new restaurant |
| GET | `/restaurants/{id}` | Get a single restaurant |
| PUT | `/restaurants/{id}` | Update a restaurant |
| DELETE | `/restaurants/{id}` | Delete a restaurant |
| GET | `/restaurants/nearby?lat=&lng=&radius_km=` | Find nearby restaurants |

## Categories

- `breakfast` - Breakfast spots
- `brunch` - Brunch restaurants
- `lunch` - Lunch spots
- `dinner` - Dinner restaurants
- `fine_dining` - Fine dining
- `casual` - Casual dining
- `coffee` - Coffee shops / cafes
- `bar` - Bars / cocktail lounges
- `other` - Other

## Project Structure

```
restaurant-tracker/
├── backend/
│   ├── main.py          # FastAPI app with all routes
│   ├── models.py        # SQLAlchemy models
│   ├── database.py      # DB engine and session
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js   # Dev server with API proxy
│   └── src/
│       ├── main.jsx     # React entry point (Leaflet icon fix)
│       ├── App.jsx      # Main app with tabs and state
│       ├── App.css      # Mobile-first styles
│       └── components/
│           ├── Map.jsx            # Leaflet map with markers
│           ├── RestaurantList.jsx # Scrollable restaurant cards
│           ├── RestaurantForm.jsx # Add/edit modal form
│           └── CategoryFilter.jsx # Horizontal filter chips
└── README.md
```
