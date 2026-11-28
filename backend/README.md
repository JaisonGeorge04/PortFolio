# Portfolio Chat API

FastAPI backend for the portfolio chatbot. The Gemini API key stays on the server and is never
sent to the static GitHub Pages frontend.

## Windows PowerShell setup

Run these commands from the `backend` directory:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

Put your Gemini API key in `backend/.env` as `GEMINI_API_KEY=...`. Keep `.env` private; it is
ignored by Git. The model defaults to `gemini-4-hydrogen`. Change `GEMINI_MODEL` if needed.

Start the API:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check: <http://127.0.0.1:8000/health>
Interactive API docs: <http://127.0.0.1:8000/docs>

Serve the project root as a local static site, for example with VS Code Live Server on port 5500.
The default CORS list allows `localhost` and `127.0.0.1` on ports 5500 and 5501 plus the
portfolio's GitHub Pages origin. Override it with a comma-separated `CORS_ALLOWED_ORIGINS`
value in `.env` if your frontend uses another origin. CORS entries are origins only: scheme,
host, and optional port, with no path.

## Frontend and deployment

The frontend uses `http://127.0.0.1:8000` by default. For GitHub Pages, deploy this API to a host
that supports Python/FastAPI, set `GEMINI_API_KEY` in that host's secret environment, and allow
`https://jaisongeorge04.github.io` in `CORS_ALLOWED_ORIGINS`. Set
`window.PORTFOLIO_CHAT_API_URL` to the API's public HTTPS origin before `js/script.js` loads (or
edit its local default). For example, add this before the custom script in `index.html`:

```html
<script>window.PORTFOLIO_CHAT_API_URL = 'https://your-api.example.com';</script>
```

The chat request sends JSON, so browsers preflight it with `OPTIONS`; the API must allow the page's
exact origin, `POST`, and the `Content-Type` request header. The development defaults include both
`http://127.0.0.1:5500` and `http://localhost:5500`. Do not use `*` for allowed origins.
GitHub Pages serves only static files and cannot run this FastAPI backend. Do not put the Gemini
key in the frontend or in a committed file.

## API

`GET /health` returns `{"status":"ok"}`.

`POST /api/chat` accepts a message (up to 2,000 characters) and up to 12 recent messages:

```json
{
  "message": "What did he use for the hostel project?",
  "history": [
    {"role": "user", "content": "Tell me about his projects."},
    {"role": "assistant", "content": "The portfolio lists a Hostel Management System..."}
  ]
}
```

Roles are `user` and `assistant`; the response is `{"reply":"..."}`. Invalid input returns
HTTP 422. A missing API key returns HTTP 503. Gemini failures return a generic HTTP 502 response.
For Gemini failures, inspect the Uvicorn terminal: the backend logs the exception type, provider
code/status when available, and sanitized detail without logging the Gemini key. If the diagnostic
shows a refused loopback proxy, correct `HTTP_PROXY`, `HTTPS_PROXY`, or `ALL_PROXY` for that
terminal (or clear them there if no proxy is required), then restart Uvicorn. The SDK honors these
standard proxy environment variables.

## Run tests

From `backend` with the virtual environment active:

```powershell
python -m unittest discover -s tests -p test_main.py -v
```

The same `unittest.TestCase` suite can also be run with `python -m pytest -q` if you prefer pytest.

The Gemini tests mock the SDK, so they verify request construction and failure handling without
requiring an API key or making billable network calls.
