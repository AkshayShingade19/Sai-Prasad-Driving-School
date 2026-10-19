# Sai Prasad Driving School Management System

A complete full-stack web application for managing a driving school, including student management, lesson scheduling, attendance tracking, demo bookings, service requests, and payment tracking.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based with bcrypt password hashing
- **Form Validation**: React Hook Form + Zod (frontend), class-validator (backend)

## Project Structure

```
sai-prasad-driving-school/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client and endpoints
│   │   ├── components/    # Shared components
│   │   ├── contexts/      # Auth context
│   │   ├── layouts/       # Public & Admin layouts
│   │   ├── pages/
│   │   │   ├── public/    # Public website pages
│   │   │   └── admin/     # Admin dashboard pages
│   │   └── App.tsx        # Router setup
│   └── ...
├── server/                 # NestJS backend
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   │   ├── auth/      # Authentication
│   │   │   ├── users/     # Staff management
│   │   │   ├── students/  # Student CRUD
│   │   │   ├── courses/   # Course management
│   │   │   ├── instructors/
│   │   │   ├── lessons/   # Lesson scheduling
│   │   │   ├── attendance/ # Attendance system
│   │   │   ├── demo-bookings/
│   │   │   ├── service-requests/
│   │   │   ├── payments/
│   │   │   ├── settings/
│   │   │   └── audit-logs/
│   │   ├── seed.ts        # Database seed script
│   │   └── main.ts        # Server entry point
│   └── ...
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/sai_prasad_driving_school
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RATE_LIMIT_MAX=100
```

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start MongoDB

Make sure MongoDB is running locally, or update `MONGODB_URI` to point to your MongoDB Atlas cluster.

### 4. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- Admin user: `admin@drivingschool.com` / `Admin@123`
- Instructor user: `instructor@drivingschool.com` / `Instructor@123`
- Receptionist user: `reception@drivingschool.com` / `Reception@123`
- Sample courses, instructors, students, lessons, attendance, payments, demo bookings, and service requests

### 5. Start the Application

```bash
# Terminal 1 - Start backend
cd server
npm run start:dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

### 6. Access the Application

- **Public Website**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin/login
- **API Docs (Swagger)**: http://localhost:3000/api/docs

## Default Admin Login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@drivingschool.com | Admin@123 |
| Instructor | instructor@drivingschool.com | Instructor@123 |
| Receptionist | reception@drivingschool.com | Reception@123 |

## Student Portal

Students log in with their **registered email address** and password to view their own attendance, lessons and payments.

| URL | Purpose |
|-----|---------|
| `/student/login` | Student sign-in page |
| `/student/portal` | Student dashboard (protected) |

**Where to find it:** the public site header has a **Student Login** and **Admin** button; the footer has *Student Portal* and *Admin Login* links. On mobile they appear in the hamburger menu.

### How portal access is granted

Open **Admin → Students** and use the **key icon** on a student's row (or the **Portal Credentials** button in the header) to open the credentials manager. There you can:

- **Set the username** — the student's email address used to sign in (required for portal access)
- **Set the password** — type your own, or leave it blank to auto-generate `Sai@` + last 4 digits of the mobile number (the suggested value is shown and can be applied with the refresh icon)
- **Save Credentials** — stores the username and a bcrypt-hashed password
- **Print Slip** — opens a clean printable credential slip (student name, student ID, username, password, login instructions, and the school contact details) to hand over to the student
- **Copy** buttons for the username and password to share them by message

Duplicate usernames are rejected with a clear error. The password itself is never returned by the read endpoint — only `hasPassword: true/false`.

Students can change their own password any time from the **Password** tab in the portal.

### Portal features

| Tab | Contents |
|-----|----------|
| **Overview** | Attendance %, lessons attended, lessons remaining, absences, upcoming lessons |
| **Attendance** | Full history with date, time, instructor, status, check-in time, duration, remarks + summary cards |
| **My Lessons** | Every scheduled lesson with date, time, course, instructor, duration, status |
| **Payments** | Course fee, total paid, balance due, and full payment history |
| **Password** | Change the portal password |

### Student portal API

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/student-portal/login` | Public (rate limited to 10/min) |
| GET | `/api/student-portal/dashboard` | Student JWT |
| GET | `/api/student-portal/profile` | Student JWT |
| GET | `/api/student-portal/attendance` | Student JWT |
| GET | `/api/student-portal/lessons` | Student JWT |
| GET | `/api/student-portal/payments` | Student JWT |
| POST | `/api/student-portal/change-password` | Student JWT |
| GET | `/api/students/:id/portal-credentials` | Admin/Receptionist |
| POST | `/api/students/:id/portal-credentials` | Admin/Receptionist |
| POST | `/api/students/:id/reset-password` | Admin/Receptionist |

Student sessions use a **separate JWT strategy** (`student-jwt`) with a `type: 'student'` claim and their own `student_token` localStorage key, so they never collide with staff sessions. A student token will not work on admin endpoints and vice-versa.

## Business Details (Configured)

| Item | Value |
|------|-------|
| Business Name | Sai Prasad Driving School |
| Phone / WhatsApp | +91 8600740507 |
| Address | Shop 23, Near SAIPRASAD ENTERPRISE, Kolhapur, Maharashtra 416001 |
| Map | Embedded on the Contact page |

These are stored in the `businessSettings` collection and can be edited from **Admin → Settings** without touching code.

## Replacing the Gallery Photos

A photo gallery appears on the **About Us** page. Branded placeholder images are included so the site looks complete immediately. To use your real photos, overwrite these files in `client/public/images/`:

| File | Contents |
|------|----------|
| `office-front.jpg` | Office exterior / signboard |
| `classroom.jpg` | Classroom session with students |
| `lecture-hall.jpg` | Lecture hall and training charts |
| `vehicle-front.jpg` | Training vehicle (front) |
| `vehicle-rear.jpg` | Training vehicle (rear) |

Recommended: 1400x900px landscape JPG, under 500KB each. Captions live in `client/src/components/OfficeGallery.tsx`.

## Photos & Video

**Gallery photos** (About Us page) live in `client/public/images/`:

| File | Contents |
|------|----------|
| `office-front.jpg` | Office exterior with signboard |
| `classroom.jpg` | Classroom session with students |
| `lecture-hall.jpg` | Lecture hall and training charts |
| `vehicle-front.jpg` | Training vehicle (front) |
| `vehicle-rear.jpg` | Training vehicle (rear) |

To swap in new photos, replace these files using the **exact same filename**. Recommended: 1400x900px landscape JPG, under 300KB each. Captions are defined in `client/src/components/OfficeGallery.tsx`.

**Hero video** (Home page + About page) lives in `client/public/video/`:

| File | Usage |
|------|-------|
| `hero-driving-school.mp4` | Primary hero background video (your clip) |
| `hero-driving.mp4` | Fallback background video |
| `demo-booking.mp4` | Book a Demo page — hero preview + "See Our Training in Action" section |

The `HeroVideo` component (`client/src/components/HeroVideo.tsx`) accepts a list of sources and automatically falls back to the next one if a file fails to load — so you can drop in a replacement video without touching any code. Play/pause and mute controls are in the bottom-right of the hero.

**Compressing a video before adding it:** Large clips (e.g. 1440p at 6Mbps ≈ 19MB) are far too heavy for web. Re-encode to 720p with no audio track:

```bash
ffmpeg -i source.mp4 -vf "scale=1280:720" -c:v libx264 -preset slow -crf 26 \
  -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart -an output.mp4
```

That reduced the demo clip from 19MB to 2.1MB with no visible quality loss. `ffmpeg-static` (npm) works if ffmpeg is not installed system-wide.

**Note on the istockphoto clip:** `hero-driving-school.mp4` is a 640px preview from iStockphoto. For production use, obtain the full-resolution licensed file and replace it at the same path. Keep hero videos under ~5MB for fast page loads.

## Design System

The site uses a custom premium design system defined in `client/tailwind.config.js` and `client/src/index.css`.

**Typography**
- Display / headings: **Plus Jakarta Sans** (600/700/800) — `font-display`
- Body / UI: **Inter** (400–700) — `font-sans`
- Semantic scale: `display-sm/md/lg/xl`, `title-lg/md`, `lede`, `eyebrow`

**Colour tokens**

| Token | Use |
|-------|-----|
| `navy-50 … navy-950` | Primary brand — headings, surfaces, dark sections |
| `accent-50 … accent-900` | Primary action — CTAs, active states, success |
| `gold-50 … gold-900` | Secondary accent — highlights, warnings, premium details |
| `ink` | Body copy defaults |

**Component classes** (all in `index.css`)

| Class | Purpose |
|-------|---------|
| `.btn-primary` / `.btn-secondary` / `.btn-outline` / `.btn-light` / `.btn-ghost` | Buttons with gradient, elevation and hover-lift |
| `.card` / `.card-hover` / `.card-glass` / `.card-dark` | Surfaces |
| `.input-field` / `.select-field` / `.label` / `.form-error` | Forms with focus glow |
| `.container-premium` / `.section-y` | Layout rhythm |
| `.headline-hero` / `.headline-section` / `.lede` / `.lede-inverse` / `.eyebrow` | Typography |
| `.table-premium` | Admin table headers, rows and dividers |
| `.divider-gold` / `.grid-overlay` / `.noise-overlay` | Decorative textures |
| `.bg-premium` / `.text-gradient-accent` / `.text-gradient-gold` | Gradients |

To rebrand, edit the `colors` block in `tailwind.config.js` and the `@layer components` section in `index.css` — every page inherits the change.

**Accessibility**: visible focus rings, `prefers-reduced-motion` support, balanced heading wrapping, and accessible contrast on all hero overlays.

## 3D & Animation System

A reusable motion layer lives in `client/src/components/` and `client/src/hooks/`.

### Components

| Component | Effect |
|-----------|--------|
| `TiltCard` | Card tilts in 3D following the cursor, with a moving glare highlight. Props: `max` (rotation °), `scale`, `lift`, `glare` |
| `Reveal` | Scroll-triggered entrance animation. Props: `from` (`up`/`down`/`left`/`right`/`scale`), `delay`, `threshold` |
| `MagneticButton` | Button is pulled toward the cursor. Prop: `strength` |
| `Aurora` | Drifting blurred colour blobs for backgrounds. Props: `count`, `speed` |
| `Parallax` | Moves children at a different rate to the scroll. Props: `speed`, `offset` |
| `Counter` | Animated number with easeOutExpo. Props: `to`, `prefix`, `suffix`, `duration` |

### Hooks

| Hook | Purpose |
|------|---------|
| `useTilt` | Mouse/touch-following 3D rotation. Returns `{ ref, tilting, handlers }` |
| `useReveal` | IntersectionObserver scroll reveal. Returns `{ ref, visible }` |

### Usage

```tsx
import Reveal from '../components/Reveal';
import TiltCard from '../components/TiltCard';

<div className="grid grid-cols-3 gap-6 scene">
  {items.map((item, i) => (
    <Reveal key={item.id} from="up" delay={i * 110}>
      <TiltCard max={12} scale={1.03} className="h-full">
        <article className="card card-hover p-7 h-full">{item.content}</article>
      </TiltCard>
    </Reveal>
  ))}
</div>
```

### CSS utilities

`.scene` / `.scene-soft` (perspective), `.preserve-3d`, `.depth-1/2/3`, `.flip-scene` / `.flip-inner` / `.flip-face`, `.float-3d`, `.aurora`, `.text-shimmer`, `.magnetic`, `.reveal`, `.tilt-card` / `.tilt-glare`, `.icon-3d`, `.ring-pulse`, `.sweep-underline`, `.grid-overlay`, `.noise-overlay`.

Keyframes: `float3d`, `shimmer`, `ringPulse`, `floatY`, `spinSlow`, `auroraDrift`, `pulseGlow`, `scrollDot`.

**Accessibility**: every effect respects `prefers-reduced-motion: reduce` — animations collapse to near-zero duration and `Reveal` components render immediately. A 4-second safety timeout guarantees content is never left hidden if an observer fails to fire.

## Attendance & Timezone Handling

Attendance is scheduled against a **calendar day in the business timezone** (`Asia/Kolkata` by default), not UTC.

| Problem | Fix |
|---------|-----|
| `new Date().toISOString()` returns the **UTC** date — at 02:00 IST that is still the *previous* day, so "today" never matched the server | Client uses `todayLocal()` from `client/src/utils/date.ts` (local date parts, never UTC) |
| Server filtering with `setHours(0,0,0,0)` uses the **server's** timezone — wrong if hosted in UTC (Vercel, AWS) | Server uses `businessDayRange()` / `businessDayFromString()` from `server/src/common/timezone.util.ts`, which resolve the business-timezone day explicitly |

Set `BUSINESS_TIMEZONE` in `.env` to change the business timezone.

**Where the portal credentials option lives**

Admin → **Attendance** has a **key icon** in the "Portal" column of every student row. Click it to open the Portal Credentials manager, set the student's username and password, and print the slip — without leaving the attendance sheet.

Admin → **Students** has the same key icon per row, plus a **Portal Credentials** button in the page header.

## Features

### Public Website
- Home page with hero, highlights, services, testimonials, and contact info
- About Us page with teaching approach and certifications
- Driving Courses page with course details and pricing
- Services page (RC transfer, insurance, PUC, licence assistance)
- Book a Demo form with validation
- Contact page with form and map
- Privacy Policy and Terms & Conditions
- WhatsApp enquiry button
- Fully responsive design

### Admin Dashboard
- **Dashboard**: Summary cards, today's schedule, recent enquiries, upcoming demos, quick actions
- **Students**: Full CRUD, search/filter, course progress tracking, attendance history
- **Attendance**: Daily attendance sheet, bulk marking, corrections with audit trail, reports with CSV export
- **Lessons**: Scheduling with conflict detection, recurring lessons, calendar/list views
- **Demo Bookings**: Enquiry management, status tracking, convert to student
- **Service Requests**: RC transfer, insurance, PUC request management
- **Payments**: Fee tracking, balance calculation, printable receipts, pending payment reports
- **Settings**: Business info, contact details, working hours
- **Staff Management**: Create/edit/deactivate staff accounts, role-based access

### Roles & Permissions
- **Admin**: Full access to all features
- **Instructor**: View assigned students, mark attendance, view schedules
- **Receptionist**: Manage enquiries, bookings, student registration, service requests

## API Documentation

Swagger UI is available at `/api/docs` when the server is running.

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CLIENT_URL` to your frontend domain
- [ ] Use MongoDB Atlas or production MongoDB
- [ ] Enable HTTPS
- [ ] Set up CORS properly
- [ ] Configure rate limiting
- [ ] Set up automated database backups
- [ ] Review and update business settings
- [ ] Change default admin password
- [ ] Set up monitoring and logging

## License

MIT
#   S a i - P r a s a d - D r i v i n g - S c h o o l  
 