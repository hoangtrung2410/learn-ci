# 🚀 Quick Start Guide - Full Stack Application

## Prerequisites
- Node.js 20+
- PostgreSQL database
- npm hoặc yarn

## 📦 Installation & Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env với database credentials

# Run migrations
npm run migration:run

# Seed database với sample data
npm run seed:reset

# Start backend server
npm run start:dev
```

**Backend will run on:** `http://localhost:3456`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

**Frontend will run on:** `http://localhost:5173` or `http://localhost:3000`

---

## 🔐 Login Credentials

**Email:** `admin@example.com`  
**Password:** `password123`

Other test users:
- `john.dev@example.com` / `password123`
- `jane.smith@example.com` / `password123`
- `bob.viewer@example.com` / `password123`

---

## 📊 Sample Data

After running `npm run seed:reset`, you'll have:

- ✅ **4 Architecture Types** (Monolithic, Microservices, Serverless, Hybrid)
- ✅ **5 Users** (1 admin, 3 developers, 1 viewer)
- ✅ **8 Projects** với diverse architectures
- ✅ **172 Pipeline Runs** (30 days historical data)
- ✅ **10 Analysis Reports** (performance, comparison, optimization)

---

## 🎯 Features to Test

### Dashboard
1. Login với credentials trên
2. View real-time statistics
3. See 7-day success/failure chart
4. Check DORA metrics
5. Browse recent pipeline runs

### Projects
1. Click "Projects" trong sidebar
2. View 8 sample projects
3. Try creating new project
4. Edit existing project
5. Delete test project

### Runs
1. Navigate to "Runs" page
2. See 172 pipeline runs
3. Filter by status (Success/Failure)
4. Search by commit message/author
5. Click run để see details

### Insights
1. Go to "Insights" page
2. View DORA metrics grid
3. Check Architecture Radar Chart
   - Monolithic vs Microservices comparison
4. Read optimization recommendations
5. See priority/impact/effort details

---

## 🔄 API Endpoints (Backend)

### Authentication
```bash
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/users/me/profile
```

### Projects
```bash
GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id
```

### Pipelines
```bash
GET  /api/v1/pipelines
GET  /api/v1/pipelines/statistics
GET  /api/v1/pipelines/:id
POST /api/v1/pipelines
PUT  /api/v1/pipelines/:id/status
```

### Analysis
```bash
POST /api/v1/analysis/projects/:projectId/analyze
POST /api/v1/analysis/compare-architectures
GET  /api/v1/analysis/latest
GET  /api/v1/analysis/:id
```

---

## 🧪 Testing API với cURL

### Login
```bash
curl -X POST http://localhost:3456/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Get Projects (with token)
```bash
curl http://localhost:3456/api/v1/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Pipeline Statistics
```bash
curl http://localhost:3456/api/v1/pipelines/statistics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Latest Analysis
```bash
curl http://localhost:3456/api/v1/analysis/latest?type=PROJECT_PERFORMANCE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
psql -U your_user -d your_db

# Run migrations
npm run migration:run

# Check .env file has correct DATABASE_URL
```

### Frontend can't connect to backend
```bash
# Check backend is running on port 3456
curl http://localhost:3456/api/v1/health

# Check CORS settings in backend
# Check axiosInstance.ts has correct baseURL
```

### No data showing
```bash
# Re-seed database
cd backend
npm run seed:reset

# Verify data exists
npm run console
# or use psql to check tables
```

### Login not working
```bash
# Check user exists
SELECT * FROM users WHERE email = 'admin@example.com';

# Try different user
# john.dev@example.com / password123
```

---

## 📝 Development Commands

### Backend
```bash
npm run start:dev      # Start dev server with hot reload
npm run build          # Build for production
npm run start:prod     # Start production server
npm run migration:run  # Run database migrations
npm run seed           # Seed data (skip if exists)
npm run seed:reset     # Clear & re-seed all data
npm run db:reset       # Clear data only
```

### Frontend
```bash
npm run dev            # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run linter
```

---

## 🚀 Deploy to Production

### Backend
```bash
cd backend

# Build
npm run build

# Set production env vars
export NODE_ENV=production
export DATABASE_URL="postgresql://..."

# Run migrations
npm run migration:run

# Start
npm run start:prod
```

### Frontend
```bash
cd frontend

# Build
npm run build

# Serve dist/ folder với web server
# hoặc deploy lên Vercel/Netlify
```

---

## 📚 Documentation

- **Backend API Docs:** `http://localhost:3456/api/docs` (Swagger)
- **Seed Data Guide:** `backend/src/database/seeds/README.md`
- **Frontend Integration:** `frontend/FRONTEND_INTEGRATION.md`
- **Services Guide:** `frontend/services/README.md`

---

## ✅ Checklist

Before deploying to production:

- [ ] Change default passwords
- [ ] Update CORS settings
- [ ] Set secure JWT secrets
- [ ] Enable HTTPS
- [ ] Configure proper logging
- [ ] Set up monitoring
- [ ] Backup database
- [ ] Test all APIs
- [ ] Load testing
- [ ] Security audit

---

## 🎉 You're All Set!

Your full-stack CI/CD analytics application is now running with:
- ✅ Real backend API
- ✅ Complete frontend integration
- ✅ 172 pipeline runs data
- ✅ DORA metrics analysis
- ✅ Architecture comparisons
- ✅ Optimization recommendations

**Enjoy building! 🚀**
