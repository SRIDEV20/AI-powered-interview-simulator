# AI Interview Simulator - Frontend

Next.js frontend for the AI Interview Simulator project with CSS Modules styling architecture.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules + CSS Variables
- **Linter**: ESLint
- **Package Manager**: npm

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css              # Global styles & CSS variables
│   │   ├── layout.tsx               # ✅ Day 16 - Wrapped with AuthProvider
│   │   ├── page.tsx                 # ✅ Day 5  - Landing page
│   │   ├── page.module.css          # Landing page styles
│   │   ├── login/
│   │   │   ├── page.tsx             # ✅ Day 16 - Connected to real API
│   │   │   └── page.module.css      # Login styles
│   │   ├── register/
│   │   │   ├── page.tsx             # ✅ Day 16 - Connected to real API
│   │   │   └── page.module.css      # Register styles
│   │   └── dashboard/
│   │       └── page.tsx             # ✅ Day 16 - Auth placeholder (full Day 17)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Sticky header with navigation
│   │   │   ├── Header.module.css
│   │   │   ├── Footer.tsx           # Footer with copyright
│   │   │   └── Footer.module.css
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx   # ✅ Day 16 - Route guard (redirects to /login)
│   │   ├── BackendStatus.tsx        # Live backend health indicator
│   │   └── BackendStatus.module.css
│   ├── context/
│   │   └── AuthContext.tsx          # ✅ Day 16 - Auth state + JWT + login/logout
│   └── lib/
│       └── api.ts                   # ✅ Day 16 - Auth API functions added
├── public/                          # Static assets
├── .env.local                       # Environment variables (not in git)
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json
└── README.md
```

## 🎨 Design System

### CSS Variables (globals.css)

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg` | `#0b1020` | Page background |
| `--panel` | `#111833` | Card/panel background |
| `--text` | `#e8ecff` | Primary text |
| `--muted` | `#aab3d6` | Secondary text |
| `--brand` | `#6ea8fe` | Brand/accent color |
| `--border` | `rgba(255,255,255,0.12)` | Borders |
| `--radius` | `14px` | Border radius |
| `--shadow` | `0 10px 30px rgba(0,0,0,0.35)` | Box shadow |

### Styling Architecture

- **CSS Modules** for component-scoped styles
- **CSS Variables** for design tokens
- **No external CSS framework** (no Tailwind, no Bootstrap)
- **Responsive** with media queries

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- npm installed
- Backend running at `http://localhost:8000`

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment Variables

Create `.env.local` in the `frontend` folder:

```powershell
# Windows PowerShell
Set-Content -Path ".env.local" -Value "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000"
```

Or manually create the file with:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Run Development Server

```bash
npm run dev
```

Open: **http://localhost:3000**

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 📄 Pages

### Landing Page (`/`) ✅ Day 5
- Hero section with CTA buttons
- Live backend status indicator
- Features section (3 cards)
- How it works section (4 steps)
- Header + Footer layout

### Login Page (`/login`) ✅ Day 15 + Day 16
- Email + Password fields
- Client-side form validation
- Show/hide password toggle 👁️
- Loading spinner on submit
- **Connected to real backend API** ✅ Day 16
- Auto redirect to `/dashboard` after login
- Redirects away if already logged in

### Register Page (`/register`) ✅ Day 15 + Day 16
- Full Name + Email + Username + Password + Confirm fields
- Client-side form validation (all fields)
- Password strength bar (Weak / Fair / Good / Strong)
- Show/hide password toggle 👁️
- Success screen after registration 🎉
- **Connected to real backend API** ✅ Day 16
- Redirects away if already logged in

### Dashboard (`/dashboard`) ✅ Day 16 (Placeholder)
- Protected route (redirects to `/login` if not authenticated)
- Shows logged-in user info (name, username, email)
- Logout button → clears JWT + redirects to `/login`
- Full dashboard UI coming on Day 17

### Coming Soon
- `/dashboard` - Full dashboard + stats (Day 17)
- `/profile`   - User profile management (Day 18)
- `/interview/setup` - New interview setup (Day 19)
- `/interview/[id]`  - Live interview session (Day 21)
- `/results/[id]`    - Interview results (Day 22+)

---

## 🧩 Components

### Layout Components

#### `Header` ✅ Day 5
- Sticky positioned
- Glassmorphism blur effect
- Navigation links
- Brand logo/name

#### `Footer` ✅ Day 5
- Copyright notice
- Author name

### Feature Components

#### `BackendStatus` ✅ Day 5
- Client-side component
- Calls `/api/health` on backend
- Shows 🟢 green when online
- Shows 🔴 red when offline
- Shows grey while loading

### Auth Components ✅ Day 16

#### `ProtectedRoute`
- Wraps any page that requires authentication
- Checks `isAuth` from `AuthContext`
- Redirects to `/login` if not authenticated
- Shows loading spinner while checking auth state

---

## 🔌 API Integration

### `src/lib/api.ts` ✅ Day 16

| Function | Endpoint | Description | Day |
|----------|----------|-------------|-----|
| `getHealth()` | `GET /api/health` | Check backend status | Day 5 |
| `registerUser(data)` | `POST /api/auth/register` | Register new user | Day 16 |
| `loginUser(data)` | `POST /api/auth/login` | Login + get JWT token | Day 16 |
| `logoutUser(token)` | `POST /api/auth/logout` | Logout user | Day 16 |
| `getCurrentUser(token)` | `GET /api/auth/me` | Get current user | Day 16 |
| `getUserProfile(token)` | `GET /api/user/profile` | Get user profile | Day 16 |
| `getUserStats(token)` | `GET /api/user/stats` | Get dashboard stats | Day 16 |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

---

## 🔐 Auth Context - Day 16

### `src/context/AuthContext.tsx`

| Item | Description |
|------|-------------|
| `AuthProvider` | Wraps the entire app in `layout.tsx` |
| `useAuth()` | Hook to access auth state from any component |
| `user` | Current logged-in user object (or `null`) |
| `token` | JWT token string (or `null`) |
| `loading` | `true` while checking localStorage on mount |
| `isAuth` | `true` if token + user both exist |
| `login(data)` | Calls API → saves token + user to localStorage |
| `register(data)` | Calls API → returns user (no auto-login) |
| `logout()` | Calls API → clears localStorage → resets state |

### JWT Storage

| Key | Value | Storage |
|-----|-------|---------|
| `ai_interview_token` | JWT access token string | localStorage |
| `ai_interview_user` | User object (JSON) | localStorage |

---

## 🛣️ Routing (App Router)

```
app/
├── page.tsx              → /              ✅ Day 5  - Landing page
├── layout.tsx            → All pages      ✅ Day 16 - AuthProvider wrapper
├── login/
│   └── page.tsx          → /login         ✅ Day 16 - Login + API connected
├── register/
���   └── page.tsx          → /register      ✅ Day 16 - Register + API connected
└── dashboard/
    └── page.tsx          → /dashboard     ✅ Day 16 - Protected placeholder
```

---

## ✅ Form Validation Rules

### Login Form

| Field | Rules |
|-------|-------|
| `email` | Required, valid email format |
| `password` | Required, min 8 characters |

### Register Form

| Field | Rules |
|-------|-------|
| `full_name` | Required, min 2 characters |
| `email` | Required, valid email format |
| `username` | Required, 3-50 chars, letters/numbers/hyphens/underscores only |
| `password` | Required, min 8 chars, at least 1 uppercase, at least 1 number |
| `confirm` | Required, must match password |

### Password Strength Bar

| Score | Label | Color |
|-------|-------|-------|
| 1 criteria met | Weak | 🔴 Red |
| 2 criteria met | Fair | 🟠 Orange |
| 3 criteria met | Good | 🟡 Yellow |
| 4 criteria met | Strong | 🟢 Green |

**Criteria:** 8+ chars, uppercase letter, number, special character

---

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

---

## 🐛 Troubleshooting

### Port 3000 already in use
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Backend status shows offline
- Make sure backend is running: `python main.py` in `backend/` folder
- Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
- Restart dev server after editing `.env.local`

### Module not found errors
```bash
rm -rf node_modules
npm install
```

### CSS variables not working
- Make sure `globals.css` is imported in `layout.tsx`
- Check `:root {}` block is at the top of `globals.css`

### Form not validating
- Make sure `noValidate` is on the `<form>` tag
- Check `validate()` runs before API call in `handleSubmit`

### "Failed to fetch" on login/register
- Backend is not running → start it: `python main.py`
- Check `.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- Restart frontend after editing `.env.local`

### JWT token not persisting after refresh
- Check `localStorage` in browser DevTools → Application → Local Storage
- Keys: `ai_interview_token` and `ai_interview_user`
- If missing, `AuthContext` failed to save → check browser console

### useAuth must be used inside AuthProvider
- Make sure `<AuthProvider>` wraps `{children}` in `layout.tsx`
- Never use `useAuth()` outside of a component inside the provider

---

## 📝 Development Notes

### Adding a New Page

1. Create folder in `src/app/your-page/`
2. Create `page.tsx` inside it
3. Create `page.module.css` for styles
4. Access at `http://localhost:3000/your-page`

### Adding a New Component

1. Create `ComponentName.tsx` in `src/components/`
2. Create `ComponentName.module.css` for styles
3. Import where needed

### CSS Modules Convention

```tsx
import styles from "./Component.module.css";

<div className={styles.myClass}>
```

### Client Components

```tsx
// Required for hooks (useState, useEffect) or event handlers
"use client";
```

### Protecting a Page

```tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      {/* your page content */}
    </ProtectedRoute>
  );
}
```

### Using Auth State

```tsx
import { useAuth } from "@/context/AuthContext";

const { user, token, isAuth, login, logout } = useAuth();
```

### Import Rules

```
✅ pages      → components + context + lib/api
✅ components → context + lib/api only
✅ context    → lib/api only
✅ lib/api    → no imports (pure fetch functions)
❌ components → other pages  (NEVER!)
❌ lib/api    → context      (NEVER!)
```

---

## 📊 Progress Tracker

```
Week 1 - Foundation
✅ Day 5  - Next.js setup + landing page + Header + Footer

Week 3 - Frontend Development
✅ Day 15 - Login page + Register page + form validation
✅ Day 16 - Auth context + JWT storage + API integration + protected routes
⬜ Day 17 - Dashboard layout + user stats + interview history
⬜ Day 18 - Profile page (view/edit)
⬜ Day 19 - New Interview setup page
⬜ Day 20 - Connect interview setup to API
⬜ Day 21 - Live interview interface
```

---

## 🚀 Deployment (Future)

- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to production backend URL
- [ ] Run `npm run build` to check for errors
- [ ] Deploy to Vercel (recommended for Next.js)
- [ ] Configure custom domain

---

## 📄 License

This project is part of a learning portfolio.

## 👤 Author

**SRIDEV20**
- GitHub: [@SRIDEV20INFO](https://github.com/SRIDEV20INFO)

## 🙏 Acknowledgments

- Next.js documentation
- CSS Modules documentation
- React documentation