# Deployment Checklist

## Before Uploading

1. Copy `.env.example` to `.env`.
2. Fill in:
   - `POSTGRES_PASSWORD`
   - `JWT_SECRET`
   - `GROQ_API_KEY`
   - `CORS_ALLOWED_ORIGIN_PATTERNS` with your frontend URL pattern
   - `OAUTH2_SUCCESS_URL` with your frontend URL plus a trailing `/`
3. Leave `frontend/.env` blank unless your API is hosted on a separate domain.
4. Restart the backend after changing `.env`; Spring reads these values on startup.

For local development, the backend automatically reads `.env` from the project root.

## Docker Deploy

```bash
docker compose up --build
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:8080`

## Separate Frontend and Backend Hosts

Set these in the frontend host:

```bash
VITE_API_URL=https://your-backend.example.com/api
VITE_WS_URL=https://your-backend.example.com/ws
```

Set these in the backend host:

```bash
CORS_ALLOWED_ORIGIN_PATTERNS=https://your-frontend.example.com
OAUTH2_SUCCESS_URL=https://your-frontend.example.com/
```

## Files Safe to Exclude From Uploads

The project now ignores generated and heavy folders:

- `frontend/node_modules`
- `frontend/dist`
- `backend/target`
- local `.env` files
