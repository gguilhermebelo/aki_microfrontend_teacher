# AKI! Teacher Microfrontend

A professional React + TypeScript microfrontend application for teachers to manage classes, attendance events, and student data.

## 🎯 Overview

The AKI! Teacher Interface is a feature-rich web application that enables professors to:
- Authenticate securely using JWT
- Manage classes and student enrollments
- Create and control attendance events
- Manually correct attendance records
- Generate QR codes for attendance tracking
- View comprehensive reports and analytics
- Export attendance data

## 🛠 Tech Stack

- **Language:** TypeScript
- **Framework:** React 18+ with Vite
- **Routing:** React Router DOM v6
- **UI Framework:** TailwindCSS + shadcn/ui
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Zod
- **Authentication:** JWT (via BFF)
- **Architecture:** Clean Architecture + Vertical Slice

## 📁 Project Structure

```
src/
├── app/                    # Application setup
├── features/               # Feature-based modules (Vertical Slice)
│   ├── auth/              # Authentication
│   ├── dashboard/         # Dashboard
│   ├── classes/           # Class management
│   ├── events/            # Event CRUD
│   ├── attendances/       # Attendance tracking
│   └── reports/           # Reports & analytics
├── shared/                # Shared resources
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── services/              # External services
│   ├── http/              # Axios configuration
│   ├── auth/              # Auth service
│   └── storage/           # Local storage
└── styles/                # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern web browser

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aki-teacher-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your BFF API URL:
```env
VITE_APP_ENV=development
VITE_API_BASE_URL=https://bff.api.aki.example/v1
VITE_AUTH_TOKEN_STORAGE_KEY=aki_token
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t aki-teacher-frontend .
```

### Run Container

```bash
docker run -p 8080:80 \
  -e VITE_API_BASE_URL=https://your-api.com/v1 \
  aki-teacher-frontend
```

## 🎨 Design System

The application uses a warm, educational color palette:
- **Primary:** Golden Yellow (#FFD700 / HSL 51, 100%, 50%)
- **Secondary:** Sienna Brown (#A0522D / HSL 25, 52%, 40%)
- **Background:** White (#FFFFFF)

Design features:
- Gradient backgrounds and buttons
- Smooth transitions and animations
- Card-based layouts
- Responsive mobile-first design
- Semantic color tokens (no hard-coded colors)

## 🔐 Authentication

The app uses JWT token authentication:
1. User logs in via `/login` with email/password
2. BFF returns JWT token
3. Token is stored in localStorage
4. All API requests include the token in Authorization header
5. Token expiration redirects to login

## 📡 API Integration

All API calls go through the BFF (Backend for Frontend) layer:
- Base URL configured via `VITE_API_BASE_URL`
- Axios interceptors handle authentication
- Automatic token refresh and error handling

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /teachers/me` - Get current teacher info
- `GET /teachers/me/classes` - List teacher's classes
- `POST /events` - Create attendance event
- `GET /events/:id/qr` - Get event QR code
- `POST /attendances` - Manual attendance correction
- `GET /reports/attendance/event/:id` - Event attendance report

## 🧩 Features

### Dashboard
- Welcome screen with teacher info
- Quick stats (classes, events, attendances)
- Recent activity feed
- Quick action cards

### Classes Management
- List all assigned classes
- View class details and students
- Manage student devices
- Reset student device associations

### Events
- Create new attendance events
- Edit/delete existing events
- Generate QR codes
- View event status (active/closed/canceled)

### Attendances
- Manual attendance correction
- Search and mark students
- View attendance history
- Export attendance records

### Reports
- Filter by event or class
- Attendance summary statistics
- Export to CSV/Excel
- Visual attendance trends

## 🧪 Development

### Code Quality
- TypeScript strict mode enabled
- ESLint for code linting
- Feature-based architecture (Vertical Slice)
- SOLID principles
- Clean Architecture patterns

### State Management
- Zustand for global state
- React Query for server state (optional)
- Local component state for UI

### Form Validation
- React Hook Form for form handling
- Zod schemas for validation
- Type-safe form data

## 📱 Responsive Design

The application is fully responsive:
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interactions
- Bottom navigation on mobile
- Sidebar navigation on desktop

## 🔒 Security

- JWT token-based authentication
- Protected routes requiring authentication
- Automatic token expiration handling
- Secure API communication
- Input validation with Zod schemas

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_ENV` | Environment name | `development` |
| `VITE_API_BASE_URL` | BFF API base URL | `http://localhost:3000/v1` |
| `VITE_AUTH_TOKEN_STORAGE_KEY` | LocalStorage key for JWT | `aki_token` |

## 📄 License

This project is part of the AKI! system.

## 👥 Support

For issues or questions, contact the development team.
