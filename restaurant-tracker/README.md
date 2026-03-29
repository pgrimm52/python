# Restaurant Tracker

A mobile-friendly web app to track restaurants you want to visit or have visited, with map and list views.

## Features

- Track restaurants with name, address, category, notes, and rating
- View all restaurants on an interactive map with colored markers by category
- Find nearby restaurants using your device's geolocation
- Filter by category (breakfast, brunch, lunch, dinner, fine dining, casual, coffee, bar)
- Mark restaurants as visited
- Geocode addresses to automatically get map coordinates
- Mobile-first responsive design

## Tech Stack

- **Backend**: FastAPI + PostgreSQL (production) / SQLite (local dev)
- **Frontend**: React (Vite) + Leaflet.js

## Local Development

### Option 1: Separate backend and frontend (recommended for development)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be available at http://localhost:8000

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
The app will be available at http://localhost:5173

The Vite dev server proxies `/api` requests to the backend automatically. No extra configuration needed.

By default, local development uses a SQLite database (`backend/restaurants.db`). No setup required.

### Option 2: Combined (production-like, requires a built frontend)

```bash
# Build the frontend first
cd frontend && npm install && npm run build && cd ..

# Start the backend (it will serve the built frontend automatically)
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Open http://localhost:8000 in your browser.

## Render.com Deployment

Deploy as a single web service with a free PostgreSQL database.

### Step-by-step

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Go to [render.com](https://render.com)** and sign in (or create a free account).

3. **New > Blueprint** — click the "New +" button and select "Blueprint".

4. **Connect your repository** — authorize Render to access your GitHub repo and select it.

5. **Render auto-reads `render.yaml`** — it will detect and configure both:
   - A free PostgreSQL database (`restaurant-tracker-db`)
   - A Python web service (`restaurant-tracker`)

6. **Click "Apply"** — Render will provision the database and deploy the service automatically. The build command installs Python dependencies and compiles the React frontend; the start command launches FastAPI to serve both the API and the compiled static files.

7. **Once deployed**, open the web service URL in your browser or on your phone.

### Free tier note

The free tier web service spins down after 15 minutes of inactivity. The first request after a period of inactivity may take 30-60 seconds while the service wakes up. Subsequent requests will be fast.

The free PostgreSQL database persists your data and does not spin down.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/restaurants` | List all restaurants (optional `?category=` and `?visited=` filters) |
| POST | `/api/restaurants` | Create a new restaurant |
| GET | `/api/restaurants/{id}` | Get a single restaurant |
| PUT | `/api/restaurants/{id}` | Update a restaurant |
| DELETE | `/api/restaurants/{id}` | Delete a restaurant |
| GET | `/api/restaurants/nearby?lat=&lng=&radius_km=` | Find nearby restaurants |

## Project Structure

```
restaurant-tracker/
├── backend/
│   ├── main.py          # FastAPI app with all routes
│   ├── models.py        # SQLAlchemy models
│   ├── database.py      # DB engine and session (PostgreSQL/SQLite)
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
├── render.yaml          # Render.com deployment configuration
└── README.md
```
