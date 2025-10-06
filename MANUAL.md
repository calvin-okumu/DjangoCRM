# DjangoCRM Manual

A comprehensive guide to setting up, developing, and deploying the DjangoCRM multi-tenant Customer Relationship Management system.

## Table of Contents

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Usage](#api-usage)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# 1. Clone and setup
git clone <repository-url>
cd DjangoCRM
./setup.sh

# 2. Start development servers
make dev

# 3. Access applications
# Backend API: http://localhost:8000
# Frontend: http://localhost:3000
# Admin: http://localhost:8000/admin (admin@example.com / admin123)
```

## Prerequisites

- **Python 3.8+** - Backend runtime
- **Node.js 18+** - Frontend build tools
- **PostgreSQL** - Database (local or Docker)
- **Git** - Version control
- **Docker & Docker Compose** - Containerized deployment (optional)

## Installation

### Automated Setup (Recommended)

The project includes an automated setup script that handles everything:

```bash
# Clone repository
git clone <repository-url>
cd DjangoCRM

# Run automated setup
./setup.sh
```

The setup script will:
- ✅ Create Python virtual environment
- ✅ Install Python and Node.js dependencies
- ✅ Configure PostgreSQL database
- ✅ Run database migrations
- ✅ Create default user groups
- ✅ Generate sample data
- ✅ Create superuser account
- ✅ Validate configuration

### Manual Setup

If you prefer manual control:

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your settings

# Setup database
python manage.py migrate
python manage.py setup_groups
python manage.py createsuperuser
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with API URL

# Setup application
npm run setup
```

## Configuration

### Environment Variables

#### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-secret-key-here` |
| `DEBUG` | Enable debug mode | `True` |
| `ALLOWED_HOSTS` | Allowed host domains | `localhost,127.0.0.1` |
| `DB_NAME` | PostgreSQL database name | `saascrm_db` |
| `DB_USER` | Database username | `saascrm_user` |
| `DB_PASSWORD` | Database password | `saascrm_password` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `MULTI_TENANCY_ENABLED` | Enable tenant isolation | `False` |

#### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_ENV` | Environment | `development` |

### Database Setup

#### Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d db

# Database will be available at localhost:5433
```

#### Using Local PostgreSQL

```bash
# Install PostgreSQL and create database
sudo -u postgres createuser saascrm_user
sudo -u postgres createdb saascrm_db -O saascrm_user
sudo -u postgres psql -c "ALTER USER saascrm_user PASSWORD 'saascrm_password';"
```

## Development

### Starting Development Servers

```bash
# Start both backend and frontend
make dev

# Or start individually
make dev-backend   # Django on http://localhost:8000
make dev-frontend  # Next.js on http://localhost:3000
```

### Available Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start all development servers |
| `make test` | Run all tests |
| `make build` | Build for production |
| `make clean` | Clean build artifacts |
| `make docker-up` | Start Docker services |
| `make docker-down` | Stop Docker services |

### Project Structure

```
DjangoCRM/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication & tenants
│   ├── project/            # CRM business logic
│   ├── saasCRM/            # Django settings & URLs
│   └── manage.py            # Django management script
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   └── api/            # API client functions
│   └── package.json
├── docker-compose.yml       # Docker services
├── Makefile                # Development commands
└── setup.sh                # Automated setup
```

### Code Quality

```bash
# Backend
cd backend
python manage.py check        # Django checks
python manage.py test         # Run tests

# Frontend
cd frontend
npm run lint                  # ESLint
npx tsc --noEmit             # TypeScript check
```

## Testing

### Running Tests

```bash
# All tests
make test

# Backend only
make test-backend

# Frontend only
make test-frontend
```

### Test Coverage

- **Backend**: 48+ tests covering API endpoints, models, permissions
- **Frontend**: Linting and type checking
- **Integration**: API contract testing

### Manual Testing

- **API Documentation**: http://localhost:8000/docs/
- **Admin Interface**: http://localhost:8000/admin/
- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/

## Deployment

### Docker Deployment

```bash
# Build and start all services
make docker-up

# Services available at:
# - Backend API: http://localhost:8000
# - Frontend: http://localhost:3000
# - PostgreSQL: localhost:5433
```

### Production Deployment

#### Using GitHub Actions

The project includes automated CI/CD:

1. **Push to `main`** → Production deployment
2. **Push to `dev`** → Staging deployment
3. **Pull requests** → CI testing

#### Manual Production Setup

```bash
# 1. Configure production environment
export DJANGO_ENV=production
export MULTI_TENANCY_ENABLED=True

# 2. Build frontend
make build-frontend

# 3. Collect static files
cd backend && python manage.py collectstatic

# 4. Use production server (gunicorn, uwsgi)
```

### Environment-Specific Settings

| Environment | DEBUG | MULTI_TENANCY | Database |
|-------------|-------|---------------|----------|
| Development | True | False | Local/Docker |
| Staging | False | True | Managed DB |
| Production | False | True | Managed DB |

## API Usage

### Authentication

```bash
# Login
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Use token in requests
curl -H "Authorization: Token YOUR_TOKEN" \
  http://localhost:8000/api/clients/
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login/` | POST | User authentication |
| `/api/signup/` | POST | User registration |
| `/api/tenants/` | GET/POST | Tenant management |
| `/api/clients/` | GET/POST | Client management |
| `/api/projects/` | GET/POST | Project management |
| `/api/tasks/` | GET/POST | Task management |
| `/api/invoices/` | GET/POST | Invoice management |

### API Documentation

- **Interactive Docs**: http://localhost:8000/docs/
- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## Troubleshooting

### Common Issues

#### Backend Won't Start
- **Database connection failed**: Ensure PostgreSQL is running
- **Port already in use**: Change `DB_PORT` or stop conflicting service
- **Missing dependencies**: Run `pip install -r requirements.txt`

#### Frontend Won't Start
- **Port conflict**: Next.js defaults to 3000, change if needed
- **API connection failed**: Verify `NEXT_PUBLIC_API_URL` in `.env.local`

#### Tests Failing
- **Database not set up**: Run `make docker-up` or setup local PostgreSQL
- **Environment variables**: Check `.env` configuration
- **Dependencies**: Ensure all packages are installed

#### Docker Issues
- **Port conflicts**: Change ports in `docker-compose.yml`
- **Permission denied**: Ensure Docker daemon is running
- **Build failures**: Clear Docker cache with `docker system prune`

### Getting Help

- **Check logs**: `docker-compose logs` or server console output
- **Validate config**: Run `python manage.py check`
- **Reset environment**: Delete `venv/`, `node_modules/`, and rerun setup

### Useful Commands

```bash
# Reset database
make docker-down
docker volume rm djangocrm_postgres_data
make docker-up

# Clear caches
make clean
cd frontend && npm cache clean --force

# Check environment
cd backend && python check_env.py
```

---

**Default Credentials**
- **Superuser**: admin@example.com / admin123
- **API Base**: http://localhost:8000/api
- **Frontend**: http://localhost:3000</content>
</xai:function_call">Create a clean, organized manual for the DjangoCRM project