# Next.js to React + Vite Migration Guide

## Overview
This guide will help you migrate your complete Next.js store management system to your existing React + Vite project while preserving all components, styling, and functionality.

## Your Next.js Project Structure
Based on your FILE-STRUCTURE.md, you have a complete Next.js 13+ App Router project with:
- **105 total files** including shadcn/ui components
- **50 UI components** (46 shadcn/ui + 4 custom)
- **11 pages/routes** with App Router structure
- **Complete authentication system**
- **Store management features**
- **TypeScript throughout**

## Current React + Vite Project
Located at: `frontend/` (destination for migration)

## Migration Steps

### 1. Backup and Preparation
```bash
# Create a backup of your current React + Vite frontend
cp -r frontend frontend-backup

# Create a temporary folder for Next.js source
# Assuming your Next.js project is at: store-next/
```

### 2. Detailed File-by-File Migration

#### A. Complete UI Components Migration (50 components)

**Step 1: Copy All shadcn/ui Components (46 files)**
Copy from Next.js `components/ui/` to React Vite `frontend/src/components/ui/`:

```bash
# Core UI Components to copy:
accordion.tsx              → src/components/ui/accordion.tsx
alert-dialog.tsx           → src/components/ui/alert-dialog.tsx
alert.tsx                  → src/components/ui/alert.tsx
aspect-ratio.tsx           → src/components/ui/aspect-ratio.tsx
avatar.tsx                 → src/components/ui/avatar.tsx
badge.tsx                  → src/components/ui/badge.tsx
breadcrumb.tsx             → src/components/ui/breadcrumb.tsx
button.tsx                 → src/components/ui/button.tsx
calendar.tsx               → src/components/ui/calendar.tsx
card.tsx                   → src/components/ui/card.tsx
carousel.tsx               → src/components/ui/carousel.tsx
chart.tsx                  → src/components/ui/chart.tsx
checkbox.tsx               → src/components/ui/checkbox.tsx
collapsible.tsx            → src/components/ui/collapsible.tsx
command.tsx                → src/components/ui/command.tsx
context-menu.tsx           → src/components/ui/context-menu.tsx
dialog.tsx                 → src/components/ui/dialog.tsx
drawer.tsx                 → src/components/ui/drawer.tsx
dropdown-menu.tsx          → src/components/ui/dropdown-menu.tsx
form.tsx                   → src/components/ui/form.tsx
hover-card.tsx             → src/components/ui/hover-card.tsx
input-otp.tsx              → src/components/ui/input-otp.tsx
input.tsx                  → src/components/ui/input.tsx
label.tsx                  → src/components/ui/label.tsx
loading-spinner.tsx        → src/components/ui/loading-spinner.tsx
menubar.tsx                → src/components/ui/menubar.tsx
navigation-menu.tsx        → src/components/ui/navigation-menu.tsx
pagination.tsx             → src/components/ui/pagination.tsx
popover.tsx                → src/components/ui/popover.tsx
progress.tsx               → src/components/ui/progress.tsx
radio-group.tsx            → src/components/ui/radio-group.tsx
resizable.tsx              → src/components/ui/resizable.tsx
scroll-area.tsx            → src/components/ui/scroll-area.tsx
select.tsx                 → src/components/ui/select.tsx
separator.tsx              → src/components/ui/separator.tsx
sheet.tsx                  → src/components/ui/sheet.tsx
sidebar.tsx                → src/components/ui/sidebar.tsx
skeleton.tsx               → src/components/ui/skeleton.tsx
slider.tsx                 → src/components/ui/slider.tsx
sonner.tsx                 → src/components/ui/sonner.tsx
star-rating.tsx            → src/components/ui/star-rating.tsx
switch.tsx                 → src/components/ui/switch.tsx
table.tsx                  → src/components/ui/table.tsx
tabs.tsx                   → src/components/ui/tabs.tsx
textarea.tsx               → src/components/ui/textarea.tsx
toast.tsx                  → src/components/ui/toast.tsx
toaster.tsx                → src/components/ui/toaster.tsx
toggle-group.tsx           → src/components/ui/toggle-group.tsx
toggle.tsx                 → src/components/ui/toggle.tsx
tooltip.tsx                → src/components/ui/tooltip.tsx
use-mobile.tsx             → src/components/ui/use-mobile.tsx
use-toast.ts               → src/components/ui/use-toast.ts
```

**Step 2: Copy Custom Components (4 files)**
```bash
review-card.tsx            → src/components/review-card.tsx
review-form.tsx            → src/components/review-form.tsx
store-card.tsx             → src/components/store-card.tsx
theme-provider.tsx         → src/components/theme-provider.tsx
```

**Step 3: Copy Layout Components (2 files)**
```bash
layout/navbar.tsx          → src/components/layout/navbar.tsx
layout/protected-route.tsx → src/components/layout/protected-route.tsx
```

#### B. Pages/Routes Conversion (11 pages)

**Next.js App Router** → **React + Vite Structure**
```bash
# Convert these Next.js app routes to React pages:
app/page.tsx                    → src/pages/HomePage.jsx
app/login/page.tsx              → src/pages/LoginPage.jsx
app/register/page.tsx           → src/pages/RegisterPage.jsx
app/dashboard/page.tsx          → src/pages/DashboardPage.jsx
app/admin/dashboard/page.tsx    → src/pages/AdminDashboard.jsx
app/stores/page.tsx             → src/pages/StoresPage.jsx
app/store/[storeId]/page.tsx    → src/pages/StoreDetailPage.jsx
app/store/dashboard/page.tsx    → src/pages/StoreDashboard.jsx
app/store/edit/page.tsx         → src/pages/StoreEditPage.jsx
app/unauthorized/page.tsx       → src/pages/UnauthorizedPage.jsx

# Layout file conversion:
app/layout.tsx                  → Update src/App.jsx (merge functionality)
```

#### C. Context and State Management (1 file)
```bash
contexts/auth-context.tsx       → src/context/AuthContext.jsx
```

#### D. Custom Hooks (4 files)
```bash
hooks/use-mobile.ts             → src/hooks/use-mobile.ts
hooks/use-toast.ts              → src/hooks/use-toast.ts
components/ui/use-mobile.tsx    → src/hooks/use-mobile.tsx (merge with above)
components/ui/use-toast.ts      → src/hooks/use-toast-utils.ts
```

#### E. Utility Libraries (2 files)
```bash
lib/mock-data.ts                → src/lib/mock-data.ts
lib/utils.ts                    → src/lib/utils.ts
```

#### F. Static Assets (13 files)
Copy from Next.js `public/` to React Vite `public/`:
```bash
# Sample Store Images (7 files):
artisan-bakery-fresh-bread.png
clean-automotive-service-center.jpg
cozy-coffee-shop.png
cozy-independent-bookstore.jpg
elegant-italian-restaurant.png
modern-electronics-repair-shop.jpg
modern-gym-equipment.png
plant-nursery-greenhouse.jpg

# Placeholder Images (5 files):
placeholder-logo.png
placeholder-logo.svg
placeholder-user.jpg
placeholder.jpg
placeholder.svg
```

#### G. Styling Files (2 files)
```bash
app/globals.css                 → Merge with src/index.css
styles/globals.css              → Merge with src/index.css
```

#### H. Configuration Files to Reference
```bash
components.json                 → Reference for shadcn/ui setup
next.config.mjs                 → Extract relevant settings
postcss.config.mjs              → Update existing postcss.config.js
tsconfig.json                   → Reference for TypeScript settings
```

### 3. Detailed Code Modifications Required

#### A. Remove Next.js Specific Imports (Apply to ALL components)

**In every component file, replace:**
```typescript
// ❌ Remove these Next.js imports:
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import Script from 'next/script'

// ✅ Replace with React equivalents:
import { Link } from 'react-router-dom'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async' // For head management
```

#### B. Convert Next.js Image Components
```typescript
// ❌ Next.js Image:
<Image 
  src="/cozy-coffee-shop.png" 
  alt="Coffee Shop" 
  width={300} 
  height={200}
  className="rounded-lg"
  priority
/>

// ✅ Regular HTML img:
<img 
  src="/cozy-coffee-shop.png" 
  alt="Coffee Shop" 
  className="w-75 h-50 rounded-lg object-cover"
/>
```

#### C. Convert Next.js Links (Update ALL navigation)
```typescript
// ❌ Next.js Link:
<Link href="/store/dashboard">
  <div className="nav-item">Store Dashboard</div>
</Link>

// ✅ React Router Link:
<Link to="/store/dashboard" className="nav-item">
  Store Dashboard
</Link>
```

#### D. Convert Router Usage (Update ALL pages)
```typescript
// ❌ Next.js Router:
import { useRouter } from 'next/router'
import { usePathname } from 'next/navigation'

const router = useRouter()
const pathname = usePathname()
const { storeId } = router.query
router.push('/dashboard')
router.replace('/login')

// ✅ React Router:
import { useNavigate, useParams, useLocation } from 'react-router-dom'

const navigate = useNavigate()
const location = useLocation()
const { storeId } = useParams()
navigate('/dashboard')
navigate('/login', { replace: true })
```

#### E. Convert Dynamic Routes
```typescript
// ❌ Next.js Dynamic Route: app/store/[storeId]/page.tsx
export default function StorePage({ params }: { params: { storeId: string } }) {
  const { storeId } = params
  // component logic
}

// ✅ React Router Dynamic Route: src/pages/StoreDetailPage.jsx
import { useParams } from 'react-router-dom'

export default function StoreDetailPage() {
  const { storeId } = useParams()
  // component logic
}
```

#### F. Convert Loading States
```typescript
// ❌ Next.js loading.tsx files become:
// ✅ Loading components or Suspense boundaries

// Create: src/components/ui/LoadingSpinner.jsx
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
```

### 4. Configuration Files Updates

#### A. Update package.json (Add ALL shadcn/ui dependencies)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "react-helmet-async": "^1.3.0",
    
    // shadcn/ui core dependencies
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.4",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.3",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.4",
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-hover-card": "^1.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.3",
    "@radix-ui/react-navigation-menu": "^1.1.3",
    "@radix-ui/react-popover": "^1.0.6",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.4",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.4",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.6",
    
    // Additional UI dependencies
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.263.1",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.7",
    "date-fns": "^2.30.0",
    "react-day-picker": "^8.8.0",
    "sonner": "^1.0.3",
    "vaul": "^0.7.0",
    "cmdk": "^0.2.0",
    "embla-carousel-react": "^8.0.0",
    "recharts": "^2.7.2"
  },
  "devDependencies": {
    "@types/node": "^20.5.0"
  }
}
```

#### B. Update Tailwind Config (Complete shadcn/ui setup)
Create/update `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### C. Create/Update components.json
Create `frontend/components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "src/components",
    "utils": "src/lib/utils"
  }
}
```

#### D. Update PostCSS Config
Update `frontend/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 5. Create Essential Utility Files

#### A. Create cn utility function
Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### B. Update CSS Variables (Complete shadcn/ui setup)
Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 6. Router Setup (Complete App Structure)

#### A. Update main App.jsx
Create/update `src/App.jsx`:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './components/theme-provider'
import ErrorBoundary from './components/ErrorBoundary'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Import all migrated pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/AdminDashboard'
import StoresPage from './pages/StoresPage'
import StoreDetailPage from './pages/StoreDetailPage'
import StoreDashboard from './pages/StoreDashboard'
import StoreEditPage from './pages/StoreEditPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

// Import UI components for global usage
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="system" storageKey="store-ui-theme">
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/stores" element={<StoresPage />} />
                    <Route path="/store/:storeId" element={<StoreDetailPage />} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />
                    
                    {/* Protected User Routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Protected Store Routes */}
                    <Route path="/store/dashboard" element={
                      <ProtectedRoute>
                        <StoreDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/store/edit" element={
                      <ProtectedRoute>
                        <StoreEditPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Protected Admin Routes */}
                    <Route path="/admin/dashboard" element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App
```

#### B. Update main.jsx
Update `src/main.jsx`:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 7. Complete Installation Commands

```bash
# Navigate to frontend directory
cd frontend

# Install core React Router dependencies
npm install react-router-dom react-helmet-async

# Install ALL shadcn/ui dependencies (core Radix UI components)
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Install additional UI libraries
npm install class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate date-fns react-day-picker sonner vaul cmdk embla-carousel-react recharts

# Install development dependencies
npm install -D @types/node

# Install Tailwind animation plugin
npm install tailwindcss-animate
```

### 8. Detailed Migration Checklist (105 files)

#### Phase 1: Core Setup ✅ COMPLETED
- [x] **Backup current frontend**: `cp -r frontend frontend-backup`
- [x] **Install all dependencies** (see installation commands above) ✅ All Radix UI + extras installed
- [x] **Update package.json** with all shadcn/ui dependencies ✅ React 19.1.1 + all deps
- [x] **Update tailwind.config.js** with complete shadcn/ui configuration ✅ ES modules + animate
- [x] **Create components.json** for shadcn/ui ✅ Complete setup
- [x] **Update postcss.config.js** ✅ ES modules config
- [x] **Create/update src/lib/utils.ts** with cn function ✅ Perfect implementation
- [x] **Update src/index.css** with CSS variables ✅ Enhanced with chart + sidebar colors

#### Phase 2: UI Components (50 files) ✅ COMPLETED
- [x] **Copy all 46 shadcn/ui components** from `components/ui/` to `src/components/ui/` ✅ ALL 50 COMPONENTS PRESENT
  - [x] accordion.tsx → src/components/ui/accordion.tsx ✅
  - [x] alert-dialog.tsx → src/components/ui/alert-dialog.tsx ✅
  - [x] alert.tsx → src/components/ui/alert.tsx ✅
  - [x] aspect-ratio.tsx → src/components/ui/aspect-ratio.tsx ✅
  - [x] avatar.tsx → src/components/ui/avatar.tsx ✅
  - [x] badge.tsx → src/components/ui/badge.tsx ✅
  - [x] breadcrumb.tsx → src/components/ui/breadcrumb.tsx ✅
  - [x] button.tsx → src/components/ui/button.tsx ✅
  - [x] calendar.tsx → src/components/ui/calendar.tsx ✅
  - [x] card.tsx → src/components/ui/card.tsx ✅
  - [x] carousel.tsx → src/components/ui/carousel.tsx ✅
  - [x] chart.tsx → src/components/ui/chart.tsx ✅
  - [x] checkbox.tsx → src/components/ui/checkbox.tsx ✅
  - [x] collapsible.tsx → src/components/ui/collapsible.tsx ✅
  - [x] command.tsx → src/components/ui/command.tsx ✅
  - [x] context-menu.tsx → src/components/ui/context-menu.tsx ✅
  - [x] dialog.tsx → src/components/ui/dialog.tsx ✅
  - [x] drawer.tsx → src/components/ui/drawer.tsx ✅
  - [x] dropdown-menu.tsx → src/components/ui/dropdown-menu.tsx ✅
  - [x] form.tsx → src/components/ui/form.tsx ✅
  - [x] hover-card.tsx → src/components/ui/hover-card.tsx ✅
  - [x] input-otp.tsx → src/components/ui/input-otp.tsx ✅
  - [x] input.tsx → src/components/ui/input.tsx ✅
  - [x] label.tsx → src/components/ui/label.tsx ✅
  - [x] loading-spinner.tsx → src/components/ui/loading-spinner.tsx ✅
  - [x] menubar.tsx → src/components/ui/menubar.tsx ✅
  - [x] navigation-menu.tsx → src/components/ui/navigation-menu.tsx ✅
  - [x] pagination.tsx → src/components/ui/pagination.tsx ✅
  - [x] popover.tsx → src/components/ui/popover.tsx ✅
  - [x] progress.tsx → src/components/ui/progress.tsx ✅
  - [x] radio-group.tsx → src/components/ui/radio-group.tsx ✅
  - [x] resizable.tsx → src/components/ui/resizable.tsx ✅
  - [x] scroll-area.tsx → src/components/ui/scroll-area.tsx ✅
  - [x] select.tsx → src/components/ui/select.tsx ✅
  - [x] separator.tsx → src/components/ui/separator.tsx ✅
  - [x] sheet.tsx → src/components/ui/sheet.tsx ✅
  - [x] sidebar.tsx → src/components/ui/sidebar.tsx ✅
  - [x] skeleton.tsx → src/components/ui/skeleton.tsx ✅
  - [x] slider.tsx → src/components/ui/slider.tsx ✅
  - [x] sonner.tsx → src/components/ui/sonner.tsx ✅
  - [x] star-rating.tsx → src/components/ui/star-rating.tsx ✅
  - [x] switch.tsx → src/components/ui/switch.tsx ✅
  - [x] table.tsx → src/components/ui/table.tsx ✅
  - [x] tabs.tsx → src/components/ui/tabs.tsx ✅
  - [x] textarea.tsx → src/components/ui/textarea.tsx ✅
  - [x] toast.tsx → src/components/ui/toast.tsx ✅
  - [x] toaster.tsx → src/components/ui/toaster.tsx ✅
  - [x] toggle-group.tsx → src/components/ui/toggle-group.tsx ✅
  - [x] toggle.tsx → src/components/ui/toggle.tsx ✅
  - [x] tooltip.tsx → src/components/ui/tooltip.tsx ✅
  - [x] use-mobile.tsx → src/components/ui/use-mobile.tsx ✅
  - [x] use-toast.ts → src/components/ui/use-toast.ts ✅
  - [x] theme-toggle.tsx → src/components/ui/theme-toggle.tsx ✅ Dark/Light mode toggle

- [x] **Copy 4 custom components** ✅ ALL PRESENT
  - [x] review-card.tsx → src/components/review-card.tsx ✅
  - [x] review-form.tsx → src/components/review-form.tsx ✅
  - [x] store-card.tsx → src/components/store-card.tsx ✅
  - [x] theme-provider.tsx → src/components/theme-provider.tsx ✅

- [x] **Copy 2 layout components** ✅ ALL PRESENT
  - [x] layout/navbar.tsx → src/components/layout/navbar.tsx ✅
  - [x] layout/protected-route.tsx → src/components/layout/protected-route.tsx ✅

#### Phase 3: Pages and Routes (11 files) ✅ COMPLETED
- [x] **Convert Next.js pages to React components**
  - [x] app/page.tsx → src/pages/HomePage.jsx ✅
  - [x] app/login/page.tsx → src/pages/LoginPage.jsx ✅
  - [x] app/register/page.tsx → src/pages/RegisterPage.jsx ✅
  - [x] app/dashboard/page.tsx → src/pages/DashboardPage.jsx ✅
  - [x] app/admin/dashboard/page.tsx → src/pages/AdminDashboard.jsx ✅
  - [x] app/stores/page.tsx → src/pages/StoresPage.jsx ✅
  - [x] app/store/[storeId]/page.tsx → src/pages/StoreDetailPage.jsx ✅
  - [x] app/store/dashboard/page.tsx → src/pages/StoreDashboard.jsx ✅
  - [x] app/store/edit/page.tsx → src/pages/StoreEditPage.jsx ✅
  - [x] app/unauthorized/page.tsx → src/pages/UnauthorizedPage.jsx ✅
  - [x] app/layout.tsx → Merge functionality into src/App.jsx ✅ Enhanced with providers

#### Phase 4: Context and Hooks (5 files) ✅ COMPLETED
- [x] **Copy context files**
  - [x] contexts/auth-context.tsx → src/context/AuthContext.jsx ✅ Migrated with API integration
- [x] **Copy custom hooks**
  - [x] hooks/use-mobile.ts → src/hooks/use-mobile.ts ✅
  - [x] hooks/use-toast.ts → src/hooks/use-toast.ts ✅
  - [x] components/ui/use-mobile.tsx → merge with src/hooks/use-mobile.ts ✅
  - [x] components/ui/use-toast.ts → src/hooks/use-toast-utils.ts ✅

#### Phase 5: Utilities and Data (2 files) ✅ COMPLETED
- [x] **Copy utility files**
  - [x] lib/mock-data.ts → src/lib/mock-data.ts ✅
  - [x] lib/utils.ts → merge with src/lib/utils.ts ✅

#### Phase 6: Static Assets (13 files) ✅ COMPLETED
- [x] **Copy all public assets** ✅ ALL 13 FILES PRESENT
  - [x] artisan-bakery-fresh-bread.png → public/artisan-bakery-fresh-bread.png ✅
  - [x] clean-automotive-service-center.jpg → public/clean-automotive-service-center.jpg ✅
  - [x] cozy-coffee-shop.png → public/cozy-coffee-shop.png ✅
  - [x] cozy-independent-bookstore.jpg → public/cozy-independent-bookstore.jpg ✅
  - [x] elegant-italian-restaurant.png → public/elegant-italian-restaurant.png ✅
  - [x] modern-electronics-repair-shop.jpg → public/modern-electronics-repair-shop.jpg ✅
  - [x] modern-gym-equipment.png → public/modern-gym-equipment.png ✅
  - [x] plant-nursery-greenhouse.jpg → public/plant-nursery-greenhouse.jpg ✅
  - [x] placeholder-logo.png → public/placeholder-logo.png ✅
  - [x] placeholder-logo.svg → public/placeholder-logo.svg ✅
  - [x] placeholder-user.jpg → public/placeholder-user.jpg ✅
  - [x] placeholder.jpg → public/placeholder.jpg ✅
  - [x] placeholder.svg → public/placeholder.svg ✅

#### Phase 7: Code Modifications ✅ COMPLETED (Based on working pages)
- [x] **Update ALL imports in components** (Remove Next.js specific imports) ✅
- [x] **Convert ALL Next.js Image components** to regular img tags ✅
- [x] **Convert ALL Next.js Link components** to React Router Links ✅
- [x] **Convert ALL Next.js Router usage** to React Router hooks ✅
- [x] **Convert dynamic routes** from Next.js params to useParams() ✅
- [x] **Update ALL navigation** throughout the app ✅
- [x] **Convert loading states** to React patterns ✅

#### Phase 8: Styling and Configuration ✅ COMPLETED
- [x] **Copy and merge global CSS** from app/globals.css and styles/globals.css ✅
- [x] **Update all className usage** to ensure compatibility ✅
- [x] **Test dark mode functionality** ✅ Dark/Light mode toggle added to navbar
- [x] **Verify responsive design** ✅

#### Phase 9: Final Setup ✅ COMPLETED  
- [x] **Update src/App.jsx** with complete router setup ✅ Enhanced with HelmetProvider + ThemeProvider
- [x] **Update src/main.jsx** with all providers ✅
- [x] **Set up error boundaries** ✅
- [x] **Configure development environment** ✅

### 9. Component-Specific Migration Notes

#### A. Authentication Components
```typescript
// Update all auth-related imports
import { useAuth } from '../context/AuthContext' // Updated path
```

#### B. Navigation Components
```typescript
// Convert navbar navigation
import { Link, useLocation } from 'react-router-dom'

// Replace usePathname with useLocation
const location = useLocation()
const currentPath = location.pathname
```

#### C. Form Components
```typescript
// Update form submissions to use React Router navigation
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
// Replace router.push with navigate
navigate('/dashboard')
```

#### D. Dynamic Components
```typescript
// Convert store detail pages
import { useParams } from 'react-router-dom'

function StoreDetailPage() {
  const { storeId } = useParams()
  // Use storeId from URL params
}
```

### 10. Testing Strategy

#### A. Component-Level Testing
1. **Test each UI component individually**
   - Import and render each component
   - Check for console errors
   - Verify styling is intact

#### B. Page-Level Testing
1. **Test each page component**
   - Navigate to each route
   - Check for proper rendering
   - Verify data loading

#### C. Integration Testing
1. **Test navigation flow**
   - User authentication flow
   - Store management flow
   - Admin dashboard flow

#### D. Responsive Testing
1. **Test across device sizes**
   - Mobile (320px+)
   - Tablet (768px+)
   - Desktop (1024px+)

### 11. Common Migration Issues and Solutions

#### Issue 1: shadcn/ui components not rendering
**Solution**: 
```bash
# Ensure all dependencies are installed
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
# Check that utils.ts has the cn function
# Verify CSS variables are properly set
```

#### Issue 2: Dynamic routes not working
**Solution**:
```jsx
// Ensure React Router setup is correct
<Route path="/store/:storeId" element={<StoreDetailPage />} />

// Use useParams in component
const { storeId } = useParams()
```

#### Issue 3: Images not loading
**Solution**:
```jsx
// Use absolute paths from public directory
<img src="/cozy-coffee-shop.png" alt="Coffee Shop" />
// Not: <img src="cozy-coffee-shop.png" />
```

#### Issue 4: Tailwind styles not applying
**Solution**:
```javascript
// Ensure content paths include all source files
content: [
  './src/**/*.{js,jsx,ts,tsx}',
  './index.html'
]
```

#### Issue 5: Theme provider not working
**Solution**:
```jsx
// Ensure ThemeProvider wraps the entire app
<ThemeProvider defaultTheme="system" storageKey="store-ui-theme">
  <Router>
    {/* Rest of app */}
  </Router>
</ThemeProvider>
```

### 12. Performance Optimization

#### A. Code Splitting
```jsx
// Implement lazy loading for pages
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

#### B. Bundle Analysis
```bash
# Analyze bundle size
npm run build
# Check for unused dependencies
npx depcheck
```

### 13. Post-Migration Tasks

#### A. Documentation Updates
- [ ] Update README.md with React + Vite setup
- [ ] Document component usage
- [ ] Update development guidelines

#### B. Development Workflow
- [ ] Set up proper linting rules
- [ ] Configure prettier for consistent formatting
- [ ] Set up proper Git hooks

#### C. Production Preparation
- [ ] Test production build: `npm run build`
- [ ] Configure environment variables
- [ ] Set up proper error monitoring
- [ ] Optimize images and assets

#### D. Code Quality
- [ ] Remove any unused Next.js dependencies
- [ ] Clean up console.log statements
- [ ] Ensure TypeScript types are correct
- [ ] Run linting and fix all issues

### 14. Rollback Plan

If migration fails:
1. **Stop development server**
2. **Restore backup**: `rm -rf frontend && mv frontend-backup frontend`
3. **Restart development**: `cd frontend && npm run dev`
4. **Document issues encountered**
5. **Plan alternative migration approach**

---

## Final Notes

- **Total migration time**: Estimate 2-3 days for complete migration
- **Critical dependencies**: Ensure all shadcn/ui dependencies are installed
- **Testing is crucial**: Test each component after migration
- **Keep Next.js reference**: Don't delete until migration is confirmed working
- **Git branching**: Use a separate branch for migration work

## Success Criteria

✅ All 105 files successfully migrated
✅ All UI components render correctly
✅ All pages accessible via React Router
✅ Authentication system working
✅ Store management features functional
✅ Responsive design intact
✅ Dark mode working
✅ No console errors
✅ Production build successful
