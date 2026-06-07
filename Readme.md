# Nirbhoy

A Django + React social media application.

This README explains how to clone the repository and run the application locally during development. The backend Django project is in the `backend/` directory, the React frontend is in the `social-media/` directory, and the database infrastructure is managed via Docker.

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Clone](#clone)
- [Backend (Django) — Install Dependencies](#backend-django--install-dependencies)
- [Database Setup & Backup Restoration](#database-setup--backup-restoration)
- [Backend (Django) — Run Server](#backend-django--run-server)
- [Frontend (React) — Install & Run](#frontend-react--install--run)
- [Run both services concurrently (dev)](#run-both-services-concurrently-dev)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Git**
- **Node.js** (LTS recommended, e.g., 20.x or 22.x)
- **npm** or **yarn** (or pnpm)
- **Python 3.8+** (or the version the project expects)
- **pip** and **Virtualenv**
- **Docker** and **Docker Compose V2** (Docker Desktop recommended)

---

## Clone

```bash
git clone https://github.com/hasanhabib16011998/nirbhoy.git
cd nirbhoy
```

---

## Backend (Django) — Install Dependencies

Before setting up the database, you need to prepare your Python environment so Django can interact with PostgreSQL.

1. Change into the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
- **macOS / Linux:**
  ```bash
  python -m venv env
  source env/bin/activate
  ```
- **Windows (PowerShell):**
  ```powershell
  python -m venv env
  .\env\Scripts\Activate.ps1
  ```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

---

## Database Setup & Backup Restoration

This project uses Docker for its PostgreSQL database and pgAdmin interface. Ensure Docker is running before proceeding.

### 1. Start the Database Containers
From the directory containing your `docker-compose.yml` file (in the root directory of project folder), start the services in the background:

```bash
docker compose up -d
```
Your database and admin panel are now running on the following local ports:
* **PostgreSQL:** `localhost:5432` 
* **pgAdmin:** `http://localhost:5050`

### 2. Initialize and Load the Backup Data
Because the project includes natural foreign keys linked to Django's auto-generated `contenttypes` and `permissions`, you must prepare the database schema before loading the JSON dump. Ensure your virtual environment is still active.

**Step 1: Generate the Schema**
Run the initial migrations to create the empty tables inside the PostgreSQL container.
```bash
python manage.py migrate
```

**Step 2: Flush Auto-Generated Data**
Clear out the auto-generated content types and permissions. This ensures your backup data can insert its own natural keys without colliding with default Django records, preventing `content_type_id` constraint errors.
```bash
python manage.py flush
```
*Type `yes` when prompted to confirm.*

**Step 3: Import the Backup**
Load your existing data dump into the clean database.
```bash
python manage.py loaddata backups/datadump.json
```

### 3. Connect pgAdmin to PostgreSQL (Optional but Recommended)
To view and manage your newly imported data visually, link the pgAdmin container to the PostgreSQL container.

1. **Log In:** Open `http://localhost:5050` in your web browser. 
   * **Email:** `admin@nirbhoy.com`
   * **Password:** `K5ZI6613LM7U`
2. **Register the Server:** Right-click on **Servers** in the left sidebar menu, then select **Register** > **Server...**
3. **Name the Connection:** In the **General** tab, name your server (e.g., `Nirbhoy Local`).
4. **Configure Connection Settings:** Switch to the **Connection** tab and input the following exactly *(Crucial: Use the Docker network container name, not localhost)*:
   * **Host name/address:** `nirbhoy-postgres` 
   * **Port:** `5432`
   * **Maintenance database:** `nirbhoy_db`
   * **Username:** `admin`
   * **Password:** `8H27GO4GC722`
5. **Save and Verify:** Click **Save**. You can now browse your imported data by navigating through `Servers` > `Nirbhoy Local` > `Databases` > `nirbhoy_db` > `Schemas` > `public` > `Tables`.

---

## Backend (Django) — Run Server

With the database populated, you can now start the backend API.

1. (Optional) Create a new superuser if you didn't load one from the backup:
```bash
python manage.py createsuperuser
```

2. Start the development server:
```bash
python manage.py runserver 0.0.0.0:8000
```

---

## Frontend (React) — Install & Run

1. Open a new terminal and change into the frontend directory:
```bash
cd social-media
```

2. Install Node dependencies:
- **npm:**
  ```bash
  npm install
  ```
- **yarn:**
  ```bash
  yarn
  ```

3. Start the dev server:
```bash
npm run dev
```

The React dev server usually runs on `http://localhost:5173` by default.

---

## Run both services concurrently (dev)

To develop locally, you will need two terminal windows open:

**Terminal 1 — Backend:**
```bash
cd backend
source env/bin/activate  # macOS/Linux
# .\\env\\Scripts\\Activate.ps1 # Windows
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 — Frontend:**
```bash
cd social-media
npm run dev
```

---

## Troubleshooting

- **Database Connection Errors:** Verify the database container is running (`docker ps`). Ensure `settings.py` is using the correct credentials and port (`5432`). 
- **Docker Port Collisions:** If port `5432` is already in use, you may have a local instance of PostgreSQL running on your machine. Stop the local service or change the exposed port in `docker-compose.yml`.
- **CORS Errors:** If the browser blocks API calls, ensure `django-cors-headers` is configured in Django and `CORS_ALLOWED_ORIGINS` includes your React origin (e.g., `http://localhost:5173`).
- **React API Calls Not Reaching Backend:** Check `REACT_APP_API_URL` or `proxy` in your `package.json` or `.env` files.
- **Port Collisions (Web):** Ensure nothing else runs on ports `5173` or `8000`.
- **Missing Dependencies:** Re-install (`npm install`, `pip install -r requirements.txt`) and ensure your virtual environment is active for Python commands.