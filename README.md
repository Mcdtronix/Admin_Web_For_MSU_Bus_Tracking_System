## MSU Admin Web - Local Setup

1) Create `web/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your_key
```

2) Start servers:

```
# Backend
cd backend && python manage.py runserver

# Frontend
cd web && npm run dev
```
