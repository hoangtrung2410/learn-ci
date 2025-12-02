# 🚀 CI/CD Performance Analyzer

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
</p>

<p align="center">
  <strong>Analyze and Compare CI/CD Performance Across Different Deployment Architectures</strong>
</p>

<p align="center">
  <a href="http://localhost:3000/api/docs">📚 API Documentation</a> •
  <a href="#features">✨ Features</a> •
  <a href="#quick-start">🚀 Quick Start</a> •
  <a href="#documentation">📖 Documentation</a>
</p>

---

## 📋 About

**CI/CD Performance Analyzer** là hệ thống phân tích hiệu năng CI/CD pipelines, so sánh performance giữa các deployment architectures (Monolithic, Microservices, Serverless) và tự động đưa ra recommendations dựa trên **DORA metrics**.

### 🎓 Graduation Project
Đây là đồ án tốt nghiệp kỹ sư với các tính năng nổi bật:
- ✅ Thu thập dữ liệu từ GitHub/GitLab webhooks
- ✅ Tính toán DORA metrics tự động
- ✅ So sánh hiệu năng giữa các kiến trúc
- ✅ Recommendations tự động
- ✅ RESTful API với Swagger documentation

---

## ✨ Features

### 🔑 Core Features
- **Pipeline Tracking** - Theo dõi CI/CD pipeline runs từ GitHub/GitLab
- **DORA Metrics** - Tính toán Lead Time, Deployment Frequency, CFR, MTTR
- **Architecture Comparison** - So sánh Monolithic vs Microservices vs Serverless
- **Auto Analysis** - Phân tích tự động và đưa ra recommendations
- **Real-time Webhooks** - Nhận events từ GitHub/GitLab realtime

### 📊 Metrics Calculated
1. **Lead Time for Changes** - Thời gian từ commit đến production
2. **Deployment Frequency** - Số lần deploy mỗi ngày
3. **Change Failure Rate** - Tỷ lệ deployment failed
4. **Mean Time to Recovery** - Thời gian trung bình để fix lỗi

### 🏗️ Architecture Support
- **Monolithic** - Traditional single-tier applications
- **Microservices** - Service-oriented architecture
- **Serverless** - Function-as-a-Service
- **Hybrid** - Mixed approaches

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- Yarn or npm

### Installation

```bash
# Clone repository
git clone https://github.com/hoangtrung2410/learn-ci.git
cd learn-ci/backend

# Install dependencies
yarn install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials and secrets
```

### Database Setup

```bash
# Run migrations
yarn migration:run

# (Optional) Seed data
yarn seed
```

### Running the App

```bash
# Development mode
yarn dev

# Production mode
yarn build
yarn start:prod
```

### Access Swagger UI
```
http://localhost:3000/api/docs
```

---

## 📖 Documentation

### 📚 Complete Documentation
| Document | Description |
|----------|-------------|
| **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** | 📑 Main documentation index |
| **[SWAGGER_COMPLETE.md](SWAGGER_COMPLETE.md)** | ✅ Swagger implementation summary |
| **[SWAGGER_QUICK_REFERENCE.md](SWAGGER_QUICK_REFERENCE.md)** | ⚡ Quick API reference |
| **[SWAGGER_DOCUMENTATION.md](SWAGGER_DOCUMENTATION.md)** | 📖 Complete API guide |
| **[ENHANCED_DATABASE_RELATIONSHIPS.md](ENHANCED_DATABASE_RELATIONSHIPS.md)** | 🗄️ Database schema |
| **[CODE_ORGANIZATION.md](CODE_ORGANIZATION.md)** | 📁 Code structure |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | 🏗️ System architecture |

---

## 🎯 API Endpoints

### 🔐 Authentication
```
POST   /api/v1/auth/login          # User login
POST   /api/v1/auth/register       # Register new user
GET    /api/v1/auth/github         # GitHub OAuth
```

### 📁 Projects
```
GET    /api/v1/projects            # Get all projects
POST   /api/v1/projects            # Create project
GET    /api/v1/projects/:id        # Get project details
PUT    /api/v1/projects/:id        # Update project
DELETE /api/v1/projects/:id        # Delete project
```

### 🚀 Pipelines
```
GET    /api/v1/pipelines           # Get all pipelines
POST   /api/v1/pipelines           # Create pipeline
GET    /api/v1/pipelines/:id       # Get pipeline details
PUT    /api/v1/pipelines/:id       # Update pipeline
DELETE /api/v1/pipelines/:id       # Delete pipeline
```

### 📊 Metrics
```
GET    /api/v1/metrics/dora        # Get DORA metrics
GET    /api/v1/metrics/ci-cd       # Get CI/CD metrics
GET    /api/v1/metrics/compare-services  # Compare architectures
GET    /api/v1/metrics/trends      # Get performance trends
```

### 🔍 Analysis
```
GET    /api/v1/analysis            # Get all analyses
POST   /api/v1/analysis/project/:id  # Analyze project
POST   /api/v1/analysis/compare    # Compare architectures
```

### 🔗 Webhooks
```
POST   /api/v1/webhooks/github     # GitHub webhook handler
POST   /api/v1/webhooks/gitlab     # GitLab webhook handler
```

**Full API Documentation:** http://localhost:3000/api/docs

---

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Authentication:** JWT + Passport
- **API Documentation:** Swagger/OpenAPI 3.0

### DevOps
- **CI/CD:** GitHub Actions / GitLab CI
- **Webhooks:** GitHub/GitLab integration
- **Docker:** Docker & Docker Compose support

---

## 📊 Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   ├── token/             # Git provider tokens
│   │   ├── projects/          # Project management
│   │   ├── pipeline/          # Pipeline tracking
│   │   │   ├── pipeline.controller.ts
│   │   │   ├── webhook.controller.ts
│   │   │   ├── metrics.controller.ts
│   │   │   └── pipeline.service.ts
│   │   ├── analysis/          # Performance analysis
│   │   └── architecture/      # Architecture management
│   ├── common/                # Shared utilities
│   │   └── helpers/
│   │       ├── metrics.helper.ts
│   │       └── date.helper.ts
│   ├── configs/               # Configuration
│   │   └── setup-swagger.ts
│   └── main.ts
├── DOCUMENTATION_INDEX.md     # 📑 Documentation index
├── SWAGGER_COMPLETE.md        # ✅ Swagger summary
├── SWAGGER_QUICK_REFERENCE.md # ⚡ Quick API reference
├── package.json
└── README.md                  # This file
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=alert_ci

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback

# Server
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1
```

---

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

---

## 📱 Frontend Integration

### Generate TypeScript Types
```bash
npx swagger-typescript-api \
  -p http://localhost:3000/api/docs-json \
  -o ./types
```

### Example Axios Setup
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const metrics = await api.get('/metrics/dora', {
  params: { project_id: 'uuid', period: 30 }
});
```

---

## 🎓 For Graduation Project Review

### Demo Workflow

1. **Start Server**
   ```bash
   yarn dev
   ```

2. **Access Swagger UI**
   ```
   http://localhost:3000/api/docs
   ```

3. **Authenticate**
   - POST `/auth/login`
   - Copy `access_token`
   - Click "Authorize" in Swagger

4. **Test Core Features**
   - Create Project
   - Setup Webhook
   - View DORA Metrics
   - Compare Architectures
   - Get Recommendations

### Key Points to Demonstrate

✅ **Real-time Pipeline Tracking** via Webhooks
✅ **DORA Metrics Calculation** (Lead Time, Deploy Freq, CFR, MTTR)
✅ **Architecture Comparison** (Monolithic vs Microservices)
✅ **Auto Recommendations** based on performance
✅ **Professional API Documentation** with Swagger
✅ **Complete Database Relationships**
✅ **RESTful API Design** with versioning

---

## 📈 Database Schema

### Core Tables
- `tokens` - Git provider access tokens
- `projects` - Projects linked to repositories
- `pipelines` - CI/CD pipeline runs
- `analyses` - Performance analyses

### Architecture Tables
- `deployment_architectures` - Architecture types
- `architecture_components` - Components per architecture
- `pipeline_templates` - CI/CD templates
- `architecture_template_map` - Template mappings

**Full Schema:** See [ENHANCED_DATABASE_RELATIONSHIPS.md](ENHANCED_DATABASE_RELATIONSHIPS.md)

---

## 🤝 Contributing

This is a graduation project. For educational purposes only.

---

## 📄 License

This project is licensed for educational purposes.

---

## 👨‍💻 Author

**Hoang Trung**
- GitHub: [@hoangtrung2410](https://github.com/hoangtrung2410)
- Project: CI/CD Performance Analyzer (Graduation Project)

---

## 🙏 Acknowledgments

- NestJS framework
- TypeORM for database management
- GitHub & GitLab for webhook integration
- Swagger for API documentation

---

## 📞 Support

For questions or issues:
1. Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)
2. Review [Swagger UI](http://localhost:3000/api/docs)
3. Read specific documentation files

---

**🎉 CI/CD Performance Analyzer - Built with NestJS**

**Swagger UI:** http://localhost:3000/api/docs
**Health Check:** http://localhost:3000/api/v1/health
