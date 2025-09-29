# DjangoCRM Documentation

DjangoCRM is a multi-tenant Customer Relationship Management (CRM) system built with Django and Django REST Framework. It provides comprehensive tools for managing clients, projects, milestones, tasks, invoices, and payments in a SaaS environment.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation and Setup](#installation-and-setup)
- [API Documentation](#api-documentation)
- [Models](#models)
- [Management Commands](#management-commands)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

DjangoCRM supports multi-tenancy with a shared database architecture. Each tenant has isolated data while sharing the same application instance. The system includes:

- **User Management**: Custom user model with email authentication, OAuth integration (Google, GitHub)
- **Tenant Management**: Organizations with user roles and permissions
- **Client Management**: Customer database with contact information
- **Project Management**: Full project lifecycle with milestones, sprints, and tasks
- **Financial Management**: Invoice and payment tracking
- **API**: RESTful API with comprehensive documentation via Swagger

## Architecture

The application is organized into two main Django apps:

### Accounts App
Handles user authentication, tenant management, and user-tenant relationships.

**Models:**
- `CustomUser`: Extended Django user model with email as username
- `Tenant`: Organization entity
- `UserTenant`: Many-to-many relationship between users and tenants with roles
- `Invitation`: System for inviting users to tenants

### Project App
Manages all project-related entities and business logic.

**Models:**
- `Client`: Customer information
- `Project`: Main project entity with budget, timeline, team members
- `Milestone`: Project phases with progress tracking
- `Sprint`: Agile development cycles
- `Task`: Individual work items with status tracking
- `Invoice`: Billing records
- `Payment`: Payment tracking

## Installation and Setup

### Prerequisites
- Python 3.8+
- PostgreSQL
- Git

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd DjangoCRM
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration:**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your database and OAuth credentials
   ```

5. **Database setup:**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Generate sample data (optional):**
   ```bash
   python manage.py generate_sample_data
   ```

### Environment Variables

Key environment variables in `.env`:

- `SECRET_KEY`: Django secret key
- `DB_NAME`: PostgreSQL database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret

## API Documentation

The API is fully documented using Swagger/OpenAPI. Access the interactive documentation at:

- **Swagger UI**: `http://127.0.0.1:8000/api/schema/swagger-ui/`
- **ReDoc**: `http://127.0.0.1:8000/api/schema/redoc/`
- **OpenAPI Schema**: `http://127.0.0.1:8000/api/schema/`

### Authentication

The API supports multiple authentication methods:

1. **Token Authentication**: Use `Authorization: Token <token>` header
2. **Session Authentication**: For web users (handled automatically)

### Base URL

```
http://127.0.0.1:8000/api
```

For production with multi-tenancy:
```
http://<tenant-subdomain>.example.com/api
```

### Interactive API Documentation

The complete API documentation is available through Swagger UI:

- **Swagger UI**: `http://127.0.0.1:8000/api/schema/swagger-ui/`
- **ReDoc**: `http://127.0.0.1:8000/api/schema/redoc/`
- **OpenAPI Schema (JSON)**: `http://127.0.0.1:8000/api/schema/?format=json`
- **OpenAPI Schema (YAML)**: `http://127.0.0.1:8000/api/schema/`

### Key Endpoints

- `POST /api/login/` - User login
- `POST /api/signup/` - User registration
- `GET /api/tenants/` - List tenants
- `GET /api/clients/` - List clients
- `GET /api/projects/` - List projects
- `GET /api/milestones/` - List milestones
- `GET /api/tasks/` - List tasks
- `GET /api/invoices/` - List invoices
- `GET /api/payments/` - List payments

All endpoints are fully documented in the Swagger UI with request/response schemas, authentication requirements, and interactive testing capabilities.

## Models

### Accounts App Models

#### CustomUser
- `email`: Email address (unique, used as username)
- `first_name`, `last_name`: User names
- `groups`: Many-to-many with Django Groups
- `user_permissions`: Many-to-many with Django Permissions

#### Tenant
- `name`: Tenant name (unique)
- `domain`: Subdomain for tenant
- `address`: Physical address
- `created_at`: Creation timestamp

#### UserTenant
- `user`: Foreign key to CustomUser
- `tenant`: Foreign key to Tenant
- `is_owner`: Boolean indicating tenant ownership
- `is_approved`: Approval status
- `role`: User role in tenant

#### Invitation
- `email`: Invited user's email
- `tenant`: Foreign key to Tenant
- `token`: Unique invitation token
- `role`: Assigned role
- `invited_by`: Foreign key to CustomUser
- `created_at`, `expires_at`: Timestamps
- `is_used`: Usage status

### Project App Models

#### Client
- `name`: Client name
- `email`: Contact email (unique)
- `phone`: Contact phone
- `status`: Active/Inactive/Prospect
- `tenant`: Foreign key to Tenant
- `created_at`, `updated_at`: Timestamps

#### Project
- `name`: Project name
- `tenant`: Foreign key to Tenant
- `client`: Foreign key to Client
- `status`: Planning/Active/On Hold/Completed/Archived
- `priority`: Low/Medium/High
- `start_date`, `end_date`: Project timeline
- `budget`: Decimal field
- `description`: Text description
- `tags`: Comma-separated tags
- `team_members`: Many-to-many with CustomUser
- `access_groups`: Many-to-many with Django Groups
- `progress`: Calculated progress (0-100)
- `created_at`: Creation timestamp

#### Milestone
- `name`: Milestone name
- `description`: Text description
- `status`: Planning/Active/Completed
- `planned_start`, `actual_start`, `due_date`: Dates
- `tenant`: Foreign key to Tenant
- `assignee`: Foreign key to CustomUser (nullable)
- `progress`: Calculated progress (0-100)
- `project`: Foreign key to Project
- `created_at`: Creation timestamp

#### Sprint
- `name`: Sprint name
- `status`: Planned/Active/Completed/Canceled
- `start_date`, `end_date`: Sprint timeline
- `tenant`: Foreign key to Tenant
- `milestone`: Foreign key to Milestone
- `progress`: Calculated progress (0-100)
- `created_at`: Creation timestamp

#### Task
- `title`: Task title
- `description`: Text description
- `status`: Backlog/To Do/In Progress/In Review/Done
- `tenant`: Foreign key to Tenant
- `milestone`: Foreign key to Milestone
- `sprint`: Foreign key to Sprint (nullable)
- `assignee`: Foreign key to CustomUser (nullable)
- `start_date`, `end_date`: Task timeline
- `estimated_hours`: Integer field
- `created_at`, `updated_at`: Timestamps

#### Invoice
- `tenant`: Foreign key to Tenant
- `client`: Foreign key to Client
- `project`: Foreign key to Project (nullable)
- `amount`: Decimal field
- `issued_at`: Timestamp
- `paid`: Boolean status

#### Payment
- `tenant`: Foreign key to Tenant
- `invoice`: Foreign key to Invoice
- `amount`: Decimal field
- `paid_at`: Timestamp

## Management Commands

### generate_sample_data
Generates sample data for development and testing.

```bash
python manage.py generate_sample_data
```

Creates sample tenants, users, clients, projects, milestones, tasks, invoices, and payments.

### migrate_to_tenants
Migrates existing data to a specific tenant.

```bash
python manage.py migrate_to_tenants --tenant-name="Company Name"
```

Useful for converting single-tenant data to multi-tenant setup.

## Testing

### Running Tests
```bash
python manage.py test
```

### Test Files
- `accounts/tests.py`: User and tenant-related tests
- `project/tests.py`: Project management tests
- `test_*.py`: Additional test files for specific functionality

### Test Coverage
Run tests with coverage:
```bash
pip install coverage
coverage run manage.py test
coverage report
```

## Deployment

### Production Configuration

1. **Enable multi-tenancy:**
   - Set `MULTI_TENANCY_ENABLED=True` in environment
   - Uncomment `TenantMiddleware` in settings.py

2. **Web server configuration:**
   - Configure subdomain routing (e.g., Apache/Nginx)
   - Set up SSL certificates for subdomains

3. **Database:**
   - Use PostgreSQL in production
   - Configure connection pooling
   - Set up backups

4. **Static files:**
   ```bash
   python manage.py collectstatic
   ```

5. **Environment variables:**
   - Set production values for all credentials
   - Configure email backend
   - Set `DEBUG=False`

### Docker Deployment

Example Dockerfile:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "saasCRM.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Monitoring and Logging

- Configure Django logging in settings.py
- Set up monitoring for key metrics
- Implement health check endpoints
- Use tools like Sentry for error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

[Specify license here]

