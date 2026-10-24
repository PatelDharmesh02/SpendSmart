# SpendSmart

SpendSmart is a budgeting app for tracking income and expenses, comparing them with monthly category budgets, and reading a cached GPT summary of the month. The API is FastAPI. The web app is Next.js. PostgreSQL stores the data. Redis and Celery run categorization and insight jobs. Budget-versus-actual changes are pushed over a WebSocket.

## What you can do

- Register and sign in with email and password. Sessions use an httpOnly access cookie and a rotating refresh cookie.
- Sign in with Google or GitHub when the OAuth client variables are set. An existing account with the same email is linked instead of duplicated.
- Review one dashboard response per month: income, expenses, net, savings rate, category chart, and budget progress.
- Add, edit, delete, and CSV-import transactions. Leave the category as Auto to queue GPT categorization, with a keyword fallback if the model is unavailable.
- Set one budget per category per month and watch progress update live.
- Generate a monthly insight once, then read it from the cache.
- Track savings goals.

## Stack

- Frontend: Next.js, TypeScript, Redux Toolkit Query, styled-components
- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic
- Data: PostgreSQL, Redis, Celery
- Auth: JWT in httpOnly cookies, Google and GitHub OAuth
- AI: OpenAI-compatible chat completions, with a rule-based fallback

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and fill in `SECRET_KEY`, `DATABASE_URL`, and `OPENAI_API_KEY`.
2. For Google and GitHub, create OAuth clients and set the callback URLs to:
   - `http://localhost:3000/api/v1/auth/oauth/google/callback`
   - `http://localhost:3000/api/v1/auth/oauth/github/callback`
   GitHub allows one callback per OAuth app, so use a second app for production.
3. Start Postgres and Redis, or use Docker Compose:

```bash
docker compose up --build
```

Compose starts the API on port 8000, plus a Celery worker, Postgres, and Redis. Run the web app separately:

```bash
cd frontend
npm install
npm run dev
```

The Next.js app proxies `/api/v1` to `http://127.0.0.1:8000`. Open `http://localhost:3000`.

Without Redis, categorization and insights run in the API process. With `REDIS_URL` set, start the worker:

```bash
cd backend
celery -A app.worker.celery_app worker --loglevel=info
```

Apply schema changes with:

```bash
cd backend
alembic upgrade head
```

The API also runs that upgrade on startup when `DATABASE_URL` is Postgres.

## CSV import

The file needs a header row: `date,amount,description`. Optional columns are `type` (`income` or `expense`) and `category`.

## Tests

```bash
cd backend
pytest
```

## Deployment notes

The frontend can be hosted on Vercel. Set `API_PROXY_TARGET` to the long-running API origin so `/api/v1` is rewritten there. WebSockets need that same long-running host. Set `NEXT_PUBLIC_WS_URL` to its `wss://` origin. Vercel serverless cannot hold the budget socket, the Celery worker, or Redis.
