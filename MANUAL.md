# DjangoCRM Manual

A comprehensive guide to setting up, developing, and deploying the DjangoCRM multi-tenant Customer Relationship Management system.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Usage](#api-usage)
- [Troubleshooting](#troubleshooting)

## Overview

DjangoCRM is a multi-tenant Customer Relationship Management system built with Django REST Framework and Next.js. It provides complete tenant isolation, user management, project lifecycle tracking, and financial management in a SaaS environment.

Key features:
- Multi-tenant architecture with subdomain-based access
- Role-based access control with 5 default user groups
- Client and project management
- Agile task tracking with progress calculation
- Invoice and payment processing
- RESTful API with comprehensive documentation

## Quick Start

```bash
# Clone repository
git clone <repository-url>
cd DjangoCRM

# Automated setup
./setup.sh

# Start development servers
make dev

# Access applications
# Backend API: http://localhost:8000
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin (admin@example.com / admin123)
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL (local or Docker)
- Git
- Docker & Docker Compose (optional, for containerized deployment)

## Installation

### Automated Setup (Recommended)

The setup script handles the entire installation process:

```bash
./setup.sh
```

This creates virtual environments, installs dependencies, sets up the database, runs migrations, creates user groups, generates sample data, and creates a superuser.

### Manual Setup

For custom installations:

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env
python manage.py migrate
python manage.py setup_groups
python manage.py createsuperuser
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local
npm run setup
```

## Configuration

### Environment Variables

#### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Required |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Allowed domains | `localhost,127.0.0.1` |
| `DB_NAME` | Database name | `saascrm_db` |
| `DB_USER` | Database user | `saascrm_user` |
| `DB_PASSWORD` | Database password | Required |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `MULTI_TENANCY_ENABLED` | Enable tenant isolation | `False` |

#### Frontend (.env.local)
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_ENV` | Environment | `development` |

### Database Setup

#### Docker (Recommended)
```bash
docker-compose up -d db
```

#### Local PostgreSQL
```bash
sudo -u postgres createuser saascrm_user
sudo -u postgres createdb saascrm_db -O saascrm_user
sudo -u postgres psql -c "ALTER USER saascrm_user PASSWORD 'saascrm_password';"
```

## Development

### Starting Servers
```bash
make dev          # Both backend and frontend
make dev-backend  # Backend only (http://localhost:8000)
make dev-frontend # Frontend only (http://localhost:3000)
```

### Project Structure
```
DjangoCRM/
├── backend/          # Django REST API
│   ├── accounts/     # Authentication & tenants
│   ├── project/      # CRM models & views
│   └── saasCRM/      # Settings & URLs
├── frontend/         # Next.js application
│   └── src/
│       ├── app/      # App router pages
│       ├── components/ # React components
│       └── api/      # API client
├── docker-compose.yml
├── Makefile          # Development commands
└── setup.sh          # Automated setup
```

### Code Quality
```bash
# Backend
cd backend
python manage.py check
python manage.py test

# Frontend
cd frontend
npm run lint
npx tsc --noEmit
```

## Testing

### Running Tests
```bash
make test         # All tests
make test-backend # Backend only
make test-frontend # Frontend only
```

### Test Coverage
- Backend: 48+ tests covering API, models, permissions
- Frontend: Linting and TypeScript checking
- Integration: API contract testing

### Manual Testing
- API Docs: http://localhost:8000/docs/
- Swagger UI: http://localhost:8000/api/schema/swagger-ui/
- Admin Interface: http://localhost:8000/admin/

## Deployment

### Docker Deployment
```bash
make docker-up
# Services: Backend (8000), Frontend (3000), PostgreSQL (5432)
```

### Production Setup
1. Set `MULTI_TENANCY_ENABLED=True`
2. Configure subdomain routing
3. Build frontend: `make build-frontend`
4. Collect static files: `python manage.py collectstatic`
5. Use production server (gunicorn/uwsgi)

### CI/CD
Automated deployments via GitHub Actions:
- `main` branch → Production
- `dev` branch → Staging
- Pull requests → CI testing

## API Usage

### Authentication
```bash
# Login
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Authenticated request
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/clients/
```

### Key Endpoints
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/login/` | POST | Authentication |
| `/api/signup/` | POST | User registration |
| `/api/tenants/` | GET, POST | Tenant management |
| `/api/clients/` | GET, POST, PUT, DELETE | Client CRUD |
| `/api/projects/` | GET, POST, PUT, DELETE | Project management |
| `/api/tasks/` | GET, POST, PUT, DELETE | Task management |
| `/api/invoices/` | GET, POST, PUT, DELETE | Invoice processing |

### Documentation
- Interactive API Docs: http://localhost:8000/docs/
- Swagger UI: http://localhost:8000/api/schema/swagger-ui/
- OpenAPI Schema: http://localhost:8000/api/schema/

For detailed API documentation, see `backend/API_DOCUMENTATION.md`.

## Troubleshooting

### Common Issues

**Backend Won't Start**
- Check database connection and credentials
- Ensure port 8000 is available
- Verify Python dependencies: `pip install -r requirements.txt`

**Frontend Won't Start**
- Confirm port 3000 is free
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Reinstall dependencies: `npm install`

**Tests Failing**
- Ensure database is running
- Check environment variables
- Run setup: `./setup.sh`

**Docker Issues**
- Verify Docker daemon is running
- Check port conflicts in `docker-compose.yml`
- Clear cache: `docker system prune`

### Useful Commands
```bash
# Reset database
make docker-down
docker volume rm djangocrm_postgres_data
make docker-up

# Clear caches
make clean

# Check environment
cd backend && python check_env.py
```

---

**Default Credentials**
- Superuser: admin@example.com / admin123
- API Base: http://localhost:8000/api
- Frontend: http://localhost:3000
