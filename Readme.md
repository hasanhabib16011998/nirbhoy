# Nirbhoy

A Django + React social media application.

This README explains how to clone the repository and run the application locally during development. The backend Django project is in the `backend/` directory and the React frontend is in the `social-media/` directory.

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Clone](#clone)
- [Backend (Django) — install & run](#backend-django---install--run)
- [Frontend (React) — install & run](#frontend-react---install--run)
- [Run both services concurrently (dev)](#run-both-services-concurrently-dev)
- [Build & production notes](#build--production-notes)
- [Docker (optional)](#docker-optional)
- [Testing, linting & formatting](#testing-linting--formatting)
- [Troubleshooting](#troubleshooting)
- [Contact / next steps](#contact--next-steps)

---

## Prerequisites

- Git
- Node.js (LTS recommended, e.g., 16.x or 18.x)
- npm or yarn (or pnpm)
- Python 3.8+ (or the version the project expects)
- pip
- Virtualenv (optional but recommended)

---

## Clone

```bash
git clone https://github.com/hasanhabib16011998/nirbhoy.git
cd nirbhoy
```

---


## Backend (Django) — install & run

1. Change into the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
- macOS / Linux:
  ```bash
  python -m venv env
  source env/bin/activate
  ```
- Windows (PowerShell):
  ```powershell
  python -m venv env
  .\env\Scripts\Activate.ps1
  ```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```


4. Run database migrations:
```bash
python manage.py migrate
```

6. (Optional) Create a superuser:
```bash
python manage.py createsuperuser
```

7. Start the development server:
```bash
python manage.py runserver 0.0.0.0:8000
```


Notes:
- If you use PostgreSQL or another DB in `DATABASE_URL`, ensure the DB is up and `psycopg2` is installed.
- If you need CORS support, ensure `django-cors-headers` is installed and configured; set `CORS_ALLOWED_ORIGINS` to include `http://localhost:3000`.

---

## Frontend (React) — install & run

1. Change into the frontend directory:
```bash
cd social-media
```

2. Install Node dependencies:
- npm:
  ```bash
  npm install
  ```
- yarn:
  ```bash
  yarn
  ```

3. Start the dev server:
```bash
npm run dev
```

The React dev server usually runs on http://localhost:5173 by default.


---

## Run both services concurrently (dev)

Open two terminals:

Terminal 1 — backend:
```bash
cd backend
# activate venv, install deps if necessary
python manage.py runserver 0.0.0.0:8000
```

Terminal 2 — frontend:
```bash
cd social-media
npm run dev
```

```

---


## Troubleshooting

- CORS errors: If browser blocks API calls, ensure `django-cors-headers` is configured in Django and `CORS_ALLOWED_ORIGINS` includes your React origin (e.g., `http://localhost:5173`).
- React API calls not reaching backend: check `REACT_APP_API_URL` or `proxy` in `package.json`.
- Port collisions: ensure nothing else runs on ports 5173 or 8000.
- Database connection errors: verify `DATABASE_URL` and DB credentials; ensure DB server is reachable.
- Missing dependencies: re-install (`npm install`, `pip install -r requirements.txt`) and ensure virtualenv is activated.

---
