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

DjangoCRM is a production-ready, multi-tenant Customer Relationship Management system built with Django REST Framework. It supports complete tenant isolation with a shared database architecture, where each tenant has isolated data while sharing the same application instance.

The system includes:

- **User Management**: Custom user model with email authentication, OAuth integration (Google, GitHub), and secure token-based authentication
- **Tenant Management**: Organizations with comprehensive company profiles and user roles/permissions
- **Enhanced Signup**: Collect detailed company information during tenant creation with validation
- **Default Groups**: 5 pre-configured user groups for role-based access control with automatic assignment
- **Client Management**: Customer database with contact information and project history
- **Project Management**: Complete project lifecycle management with milestones, sprints, tasks, and progress tracking
- **Financial Management**: Invoice and payment processing with client billing capabilities
- **API**: Comprehensive RESTful API with full Swagger/OpenAPI documentation and interactive testing
- **Testing**: Complete test suite with 48 tests covering all functionality

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

## Default User Groups

The application automatically creates 5 default user groups during database migration. Users are automatically assigned to appropriate groups during signup and invitation processes:

- **Tenant Owners**: Full access to tenant management and all features
- **Project Managers**: Manage projects, teams, and client relationships
- **Employees**: Standard employee access to assigned projects
- **Clients**: Limited read-only access to view project progress and invoices
- **Administrators**: System-wide administrative access

Groups provide role-based access control while maintaining tenant data isolation.

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
- `POST /api/signup/` - User registration with company information collection
- `GET /api/tenants/` - List tenants
- `GET /api/clients/` - List clients
- `GET /api/projects/` - List projects
- `GET /api/milestones/` - List milestones
- `GET /api/tasks/` - List tasks
- `GET /api/invoices/` - List invoices
- `GET /api/payments/` - List payments

All endpoints are fully documented in the Swagger UI with request/response schemas, authentication requirements, and interactive testing capabilities.

### Signup Process

The signup endpoint (`POST /api/signup/`) supports two flows:

1. **New Tenant Creation**: When no `invitation_token` is provided, creates a new tenant with comprehensive company information
2. **Invitation Acceptance**: When `invitation_token` is provided, joins an existing tenant

**Required Fields for New Tenant:**
- `email`, `password`, `first_name`, `last_name`, `company_name`

**Optional Fields for New Tenant:**
- `address`: Physical address of the company
- `phone`: Contact phone number
- `website`: Company website URL (validated for proper URL format)
- `industry`: Industry sector (e.g., Technology, Healthcare, Finance)
- `company_size`: Company size category (1-10, 11-50, 51-200, 201-1000, 1000+ employees)

**For Invitations:**
- `invitation_token` (required, valid and unused invitation token)

**Validation Rules:**
- Email domain is used to create unique tenant subdomain
- Website URLs are validated for proper format
- Company name must be unique across all tenants
- Invitation tokens must be unused and not expired

**Automatic Group Assignment:**
- New tenant owners are automatically assigned to "Tenant Owners" group
- Invited users are assigned to groups based on their invitation role:
  - 'Tenant Owner' → Tenant Owners group
  - 'Employee' → Employees group
  - 'Manager' → Project Managers group

**Response:**
Returns authentication token and user/tenant information on successful signup.

## Models

### Accounts App Models

#### CustomUser
- `email`: Email address (unique, used as username)
- `first_name`, `last_name`: User names
- `groups`: Many-to-many with Django Groups
- `user_permissions`: Many-to-many with Django Permissions

#### Tenant
- `name`: Tenant/company name (unique)
- `domain`: Subdomain for tenant access (auto-generated from email domain)
- `address`: Physical address of the company
- `phone`: Contact phone number
- `website`: Company website URL (validated)
- `industry`: Industry sector (e.g., Technology, Healthcare, Finance)
- `company_size`: Company size category with predefined choices:
  - '1-10': 1-10 employees
  - '11-50': 11-50 employees
  - '51-200': 51-200 employees
  - '201-1000': 201-1000 employees
  - '1000+': 1000+ employees
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

### setup_groups
Sets up default user groups with appropriate permissions.

```bash
python manage.py setup_groups
```

Creates and configures the 5 default user groups (Tenant Owners, Project Managers, Employees, Clients, Administrators) with appropriate permissions. Run this after migrations to ensure groups are properly configured.

## Testing

The application includes comprehensive test coverage with 48 tests covering all major functionality.

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific test class
python manage.py test project.tests.ProjectAPITests

# Run with verbose output
python manage.py test --verbosity=2

# Run tests without recreating database
python manage.py test --keepdb
```

### Test Coverage

- **Authentication Tests**: Login, signup, and authentication flows
- **Tenant API Tests**: CRUD operations for tenants
- **Client API Tests**: Client management with permissions
- **Project API Tests**: Project lifecycle management
- **Milestone/Sprint/Task Tests**: Agile workflow management
- **Invoice/Payment Tests**: Financial operations
- **Permission Tests**: Role-based access control
- **Model Tests**: Data validation and relationships
- **Group Tests**: Default group creation and assignment

### Test Data

Tests use realistic fixtures and create test data programmatically. All tests are designed to run independently and clean up after execution.

### API Testing

Use the interactive Swagger UI for manual API testing:
- **Swagger UI**: `http://127.0.0.1:8000/api/schema/swagger-ui/`
- **ReDoc**: `http://127.0.0.1:8000/api/schema/redoc/`

The Swagger UI provides interactive forms for testing all endpoints with proper authentication.

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

