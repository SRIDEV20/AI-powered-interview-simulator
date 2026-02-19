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
│   │   ├── globals.css         # Global styles & CSS variables
│   │   ├── layout.tsx          # Root layout (metadata, fonts)
│   │   ├── page.tsx            # Landing page
│   │   └── page.module.css     # Landing page styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Sticky header with navigation
│   │   │   ├── Header.module.css
│   │   │   ├── Footer.tsx          # Footer with copyright
│   │   │   └── Footer.module.css
│   │   ├── BackendStatus.tsx       # Live backend health indicator
│   │   └── BackendStatus.module.css
│   └── lib/
│       └── api.ts              # API helper functions
├── public/                     # Static assets
├── .env.local                  # Environment variables (not in git)
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
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

## 📄 Pages

### Landing Page (`/`)
- Hero section with CTA buttons
- Live backend status indicator
- Features section (3 cards)
- How it works section (4 steps)
- Header + Footer layout

### Coming Soon
- `/register` - User registration
- `/login` - User login
- `/dashboard` - Interview dashboard
- `/interview` - Interview session
- `/results` - Interview results

## 🧩 Components

### Layout Components

#### `Header`
- Sticky positioned
- Glassmorphism blur effect
- Navigation links
- Brand logo/name

#### `Footer`
- Copyright notice
- Author name

### Feature Components

#### `BackendStatus`
- Client-side component
- Calls `/api/health` on backend
- Shows 🟢 green when online
- Shows 🔴 red when offline
- Shows grey while loading

## 🔌 API Integration

### `src/lib/api.ts`

Current functions:

| Function | Endpoint | Description |
|----------|----------|-------------|
| `getHealth()` | `GET /api/health` | Check backend status |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

## 🛣️ Routing (App Router)

```
app/
├── page.tsx          → /           (Landing page)
├── layout.tsx        → All pages   (Root layout)
├── register/         → /register   (Coming Day 6)
├── login/            → /login      (Coming Day 6)
└── dashboard/        → /dashboard  (Coming Day 7+)
```

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

## 🐛 Troubleshooting

### Port 3000 already in use
```powershell
# Find and kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Backend status shows offline
- Make sure backend is running: `python main.py` in `backend/` folder
- Check `.env.local` has correct `NEXT_PUBLIC_API_BASE_URL`
- Restart dev server after editing `.env.local`

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### CSS variables not working
- Make sure `globals.css` is imported in `layout.tsx`
- Check `:root {}` block is at the top of `globals.css`

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
// Import styles
import styles from "./Component.module.css";

// Use in JSX
<div className={styles.myClass}>
```

## 🚀 Deployment (Future)

- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to production backend URL
- [ ] Run `npm run build` to check for errors
- [ ] Deploy to Vercel (recommended for Next.js)
- [ ] Configure custom domain

## 📄 License

This project is part of a learning portfolio.

## 👤 Author

**SRIDEV20**
- GitHub: [@SRIDEV20INFO](https://github.com/SRIDEV20INFO)

## 🙏 Acknowledgments

- Next.js documentation
- CSS Modules documentation
- React documentation