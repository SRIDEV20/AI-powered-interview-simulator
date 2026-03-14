# AI Interview Simulator - Frontend

Next.js frontend for the AI Interview Simulator project, built with TypeScript and styled using CSS Modules and CSS Variables.

## Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: CSS Modules + CSS Variables
- Linter: ESLint
- Package Manager: npm

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── page.module.css
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   ├── register/
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── page.module.css
│   │   ├── interview/
│   │   │   ├── setup/
│   │   │   │   ├── page.tsx
│   │   │   │   └── page.module.css
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── page.module.css
│   │   ├── results/
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── page.module.css
│   │   └── skill-gap/
│   │       ├── page.tsx
│   │       └── page.module.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Header.module.css
│   │   │   ├── Footer.tsx
│   │   │   └── Footer.module.css
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── BackendStatus.tsx
│   │   └── BackendStatus.module.css
│   ├── context/
│   │   └── AuthContext.tsx
│   └── lib/
│       └── api.ts
├── public/
├── .env.local
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

Note: Some folders may differ slightly depending on your current implementation. Use this as a reference layout.

## Design System

### CSS Variables (globals.css)

- `--bg`: Page background
- `--panel`: Card/panel background
- `--text`: Primary text
- `--muted`: Secondary text
- `--brand`: Brand/accent color
- `--border`: Borders
- `--radius`: Border radius
- `--shadow`: Box shadow

### Styling Architecture

- CSS Modules for component-scoped styles
- CSS Variables for design tokens
- No external CSS framework
- Responsive styles via media queries

## Setup Instructions

### 1) Prerequisites

- Node.js 18+ installed
- npm installed
- Backend running (default: `http://localhost:8000`)

### 2) Install Dependencies

```bash
cd frontend
npm install
```

### 3) Configure Environment Variables

Create `.env.local` in the `frontend` folder:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Windows PowerShell alternative:

```powershell
Set-Content -Path ".env.local" -Value "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000"
```

### 4) Run Development Server

```bash
npm run dev
```

Open:

- http://localhost:3000

### 5) Build for Production

```bash
npm run build
npm start
```

## Pages

- `/`  
  Landing page with app overview, feature sections, and backend status indicator.

- `/login`  
  Login form with validation and API integration. Redirects to `/dashboard` after login.

- `/register`  
  Registration form with validation and API integration.

- `/dashboard`  
  Auth-protected dashboard that displays user-specific information and entry points to interview flows.

- `/interview/setup`  
  Interview configuration page (role, difficulty, question type, number of questions), then creates an interview via the backend.

- `/interview/[id]`  
  Live interview session UI that displays questions, collects answers, submits answers, and supports navigation through the interview.

- `/results/[id]`  
  Interview results page with overall score, per-question breakdown, AI summary, strengths, improvements, and duration/date display (when backend timestamps are present).

- `/skill-gap`  
  Skill gap analysis view to display identified weak areas and recommendations (if enabled in your backend).

## Components

### Layout

- `Header`  
  Sticky navigation header used across the app.

- `Footer`  
  Footer displayed across the app.

### Status

- `BackendStatus`  
  Calls the backend health endpoint and indicates whether the backend is reachable.

### Auth

- `AuthContext`  
  Stores and exposes authentication state (token + current user), supports login/register/logout, and persists data in `localStorage`.

- `ProtectedRoute`  
  Wrapper to guard authenticated routes; redirects to `/login` if user is not authenticated.

## API Integration

All HTTP calls live in `src/lib/api.ts`. The base URL is controlled by `NEXT_PUBLIC_API_BASE_URL`.

Common endpoints used by the frontend include:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `GET /api/user/stats`
- `POST /api/interview/create`
- `GET /api/interview`
- `GET /api/interview/{interview_id}`
- `POST /api/interview/{interview_id}/answer/{question_id}`
- `PATCH /api/interview/{interview_id}/complete`
- `GET /api/interview/{interview_id}/score`
- `GET /api/interview/{interview_id}/results`
- `GET /api/skillgap/me` (or similar, depending on backend routing)

If your backend uses slightly different routes, update `api.ts` accordingly.

## Auth and Storage

The frontend persists login state using `localStorage`:

- `ai_interview_token`: JWT access token
- `ai_interview_user`: serialized user object

If you change these keys, update `AuthContext.tsx` accordingly.

## Form Validation Rules

### Login Form

- `email`: required, must be a valid email
- `password`: required, minimum 8 characters

### Register Form

- `full_name`: required, minimum 2 characters
- `email`: required, must be a valid email
- `username`: required, 3 to 50 characters, letters/numbers/hyphens/underscores only
- `password`: required, minimum 8 characters, at least 1 uppercase letter, at least 1 number
- `confirm`: required, must match `password`

## Available Scripts

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Troubleshooting

### Port 3000 already in use

```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Backend status shows offline

- Ensure backend is running
- Verify `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Restart the frontend dev server after editing `.env.local`

### "Failed to fetch" or CORS errors

- Confirm backend CORS allows `http://localhost:3000`
- Ensure backend is running on the expected port
- Check the Network tab for the exact failing request

### Module not found errors

```bash
rm -rf node_modules
npm install
```

### Auth not persisting after refresh

- Check `localStorage` keys exist
- Confirm `AuthContext` restores state on initial mount
- Check browser console for errors related to JSON parsing or storage access

## License

This project is intended for learning and portfolio use.

## Author

**SRIDEV20**
- GitHub: [@SRIDEV20INFO](https://github.com/SRIDEV20INFO)