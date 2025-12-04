# Docker Deployment Guide

## Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Build and Start All Services
```bash
docker-compose up --build
```

### 2. Start in Detached Mode (Background)
```bash
docker-compose up -d
```

### 3. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 4. Stop All Services
```bash
docker-compose down
```

### 5. Stop and Remove Volumes (Clean Database)
```bash
docker-compose down -v
```

## Services

### PostgreSQL Database
- **Container**: `postgres-db`
- **Port**: `5432`
- **User**: `alert-ci`
- **Password**: `alert-ci123`
- **Database**: `alert-ci`
- **Data Volume**: `postgres_data`

### Backend API
- **Container**: `alert-ci-backend`
- **Port**: `3456`
- **URL**: http://localhost:3456
- **API Docs**: http://localhost:3456/api/v1/docs
- **Health Check**: http://localhost:3456/api/v1/health-checker

### Frontend Application
- **Container**: `alert-ci-frontend`
- **Port**: `5173`
- **URL**: http://localhost:5173

## Initial Setup

### 1. First Time Setup - Seed Database
```bash
# After starting all services, seed the database
docker-compose exec backend yarn seed

# Or reset and seed
docker-compose exec backend yarn seed:reset
```

### 2. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3456/api/v1
- API Documentation: http://localhost:3456/api/v1/docs

### 3. Default Login Credentials
- Email: `admin@example.com`
- Password: `password123`

## Useful Commands

### Rebuild Specific Service
```bash
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

### Execute Commands in Container
```bash
# Backend commands
docker-compose exec backend yarn seed
docker-compose exec backend yarn db:reset
docker-compose exec backend yarn console

# Access PostgreSQL
docker-compose exec postgres psql -U alert-ci -d alert-ci
```

### Check Service Status
```bash
docker-compose ps
```

### Restart Services
```bash
docker-compose restart
docker-compose restart backend
docker-compose restart frontend
```

## Environment Configuration

### Backend (.env)
Key environment variables in `backend/.env`:
- `DB_HOST=postgres` - Must match postgres service name
- `PORT=3456`
- `JWT_SECRET` - Change in production
- `FRONTEND_URL=http://localhost:5173`

### Update Environment Variables
1. Edit `backend/.env`
2. Rebuild and restart: `docker-compose up -d --build backend`

## Troubleshooting

### Backend Can't Connect to Database
```bash
# Check if postgres is healthy
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Frontend Can't Connect to Backend
```bash
# Check backend health
curl http://localhost:3456/api/v1/health-checker

# Check backend logs
docker-compose logs backend
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# For example, change "3456:3456" to "3457:3456"
```

### Permission Denied on Volumes
```bash
# On Linux/Mac, fix permissions
sudo chown -R $USER:$USER ./backend/logs
```

### Clean Start (Remove Everything)
```bash
# Stop containers, remove volumes and images
docker-compose down -v --rmi all

# Rebuild from scratch
docker-compose up --build
```

## Production Deployment

### 1. Update Environment Variables
- Change `JWT_SECRET` to a strong random string
- Update `DB_PASSWORD` to a secure password
- Set `NODE_ENV=production`
- Update `CORS_ORIGIN` to your domain

### 2. Use Production Docker Compose
Create `docker-compose.prod.yml`:
```yaml
services:
  backend:
    restart: always
    environment:
      NODE_ENV: production
  
  frontend:
    restart: always
  
  postgres:
    restart: always
    volumes:
      - /data/postgres:/var/lib/postgresql/data
```

### 3. Deploy
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Monitoring

### View Resource Usage
```bash
docker stats
```

### Check Container Health
```bash
docker-compose ps
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U alert-ci alert-ci > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U alert-ci alert-ci < backup.sql
```

## Network

All services are on `alert-ci-network` bridge network and can communicate using service names:
- Backend → PostgreSQL: `postgres:5432`
- Frontend → Backend: `backend:3456` (internal) or `localhost:3456` (from host)
