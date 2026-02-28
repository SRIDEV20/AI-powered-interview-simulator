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
│   │   ├── layout.tsx               # Root layout (metadata, fonts)
│   │   ├── page.tsx                 # Landing page
│   │   ├── page.module.css          # Landing page styles
│   │   ├── login/
│   │   │   ├── page.tsx             # ✅ Day 15 - Login form + validation
│   │   │   └── page.module.css      # ✅ Day 15 - Login styles
│   │   └── register/
│   │       ├── page.tsx             # ✅ Day 15 - Register form + validation + strength bar
│   │       └── page.module.css      # ✅ Day 15 - Register styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Sticky header with navigation
│   │   │   ├── Header.module.css
│   │   │   ├── Footer.tsx           # Footer with copyright
│   │   │   └── Footer.module.css
│   │   ├── BackendStatus.tsx        # Live backend health indicator
│   │   └── BackendStatus.module.css
│   └── lib/
│       └── api.ts                   # API helper functions
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

### Login Page (`/login`) ✅ Day 15
- Email + Password fields
- Client-side form validation
- Show/hide password toggle 👁️
- Loading spinner on submit
- Link to register page
- Ready for API integration (Day 16)

### Register Page (`/register`) ✅ Day 15
- Full Name + Email + Username + Password + Confirm fields
- Client-side form validation (all fields)
- Password strength bar (Weak / Fair / Good / Strong)
- Show/hide password toggle 👁️
- Success screen after registration 🎉
- Link to login page
- Ready for API integration (Day 16)

### Coming Soon
- `/dashboard` - Interview dashboard (Day 17)
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

---

## 🔌 API Integration

### `src/lib/api.ts`

Current functions:

| Function | Endpoint | Description | Day |
|----------|----------|-------------|-----|
| `getHealth()` | `GET /api/health` | Check backend status | Day 5 |

> ⚠️ Auth API integration (login/register) coming in **Day 16**

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

---

## 🛣️ Routing (App Router)

```
app/
├── page.tsx              → /                  ✅ Day 5  - Landing page
├── layout.tsx            → All pages          ✅ Day 5  - Root layout
├── login/
│   └── page.tsx          → /login             ✅ Day 15 - Login form
└── register/
    └── page.tsx          → /register          ✅ Day 15 - Register form
```

---

## ✅ Form Validation Rules - Day 15

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
- Make sure `noValidate` is on the `<form>` tag (disables browser default validation)
- Check `validate()` runs before API call in `handleSubmit`

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

### Import Rules

```
✅ pages     → components + lib/api
✅ components → lib/api only
✅ lib/api    → no imports (pure fetch functions)
❌ components → other pages (NEVER!)
```

---

## 📊 Progress Tracker

```
Week 1 - Foundation
✅ Day 5  - Next.js setup + landing page + Header + Footer

Week 3 - Frontend Development
✅ Day 15 - Login page + Register page + form validation
⬜ Day 16 - Auth state management + JWT + API integration
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