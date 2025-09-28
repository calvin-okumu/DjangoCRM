# DjangoCRM API Documentation

This document provides comprehensive documentation for the DjangoCRM multi-tenant API, including authentication, endpoints, and usage examples.

## Base URL
```
http://127.0.0.1:8001/api
```

**Note:** Currently configured for development with multi-tenancy disabled. All data is accessible across tenants. In production, the API will be multi-tenant with subdomain-based routing:

- `http://demo-tenant.localhost:8000/api` for the "Demo Tenant"
- `http://company.localhost:8000/api` for the "Company" tenant"

All data is automatically scoped to the current tenant based on the subdomain when multi-tenancy is enabled.

## Authentication

The API supports multiple authentication methods: traditional token-based authentication and OAuth authentication through Google and GitHub.

### Authentication Methods
**Endpoint:** `GET /api/auth-methods/`

Returns information about available authentication methods. **Public endpoint** - no authentication required.

**Response:**
```json
{
  "traditional": {
    "endpoint": "/api/login/",
    "method": "POST",
    "description": "Username and password authentication",
    "fields": ["username", "password"]
  },
  "oauth": {
    "providers": {
      "google": {
        "login_url": "/accounts/google/login/",
        "description": "Login with Google account"
      },
      "github": {
        "login_url": "/accounts/github/login/",
        "description": "Login with GitHub account"
      }
    }
  }
}
```

### Traditional Login
**Endpoint:** `POST /api/login/`

**Request Body:**
```json
{
  "email": "your_email@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "your_auth_token",
  "user_id": 1,
  "email": "your_email@example.com",
  "first_name": "Your",
  "last_name": "Name",
  "message": "Login successful"
}
```

**Example (curl):**
```bash
curl -X POST http://127.0.0.1:8001/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@example.com", "password": "password123"}'
```

### Signup
**Endpoint:** `POST /api/signup/`

**Request Body:**
```json
{
  "email": "your_email@example.com",
  "password": "your_password",
  "first_name": "Your",
  "last_name": "Name",
  "company_name": "Your Company"
}
```

**Response:**
```json
{
  "token": "your_auth_token",
  "user_id": 1,
  "email": "your_email@example.com",
  "first_name": "Your",
  "last_name": "Name",
  "tenant": "Your Company",
  "message": "Signup successful"
}
```

**Example (curl):**
```bash
curl -X POST http://127.0.0.1:8001/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@example.com", "password": "password123", "first_name": "John", "last_name": "Doe", "company_name": "Acme Corp"}'
```

**Sample Users (created by generate_sample_data):**
- user1 (Client Management): Can access clients
- user2 (Business Strategy): Can access projects, milestones, tasks
- user3 (API Control): Can access invoices, payments
- user4 (Product Measurement): Can access projects, milestones, tasks
- user5 (API Control): Can access invoices, payments

**Example (JavaScript):**
```javascript
import { login } from './api.js';

login('admin@example.com', 'password123')
  .then(response => {
    localStorage.setItem('token', response.data.token);
  });
```

### OAuth Authentication

The API supports OAuth authentication through Google and GitHub using django-allauth.

#### Google OAuth
**Login URL:** `GET /accounts/google/login/`

**Setup Requirements:**
1. Create a Google OAuth application at [Google Cloud Console](https://console.cloud.google.com/)
2. Configure the client ID and secret in Django settings
3. Add authorized redirect URIs: `http://tenant-name.localhost:8000/accounts/google/login/callback/`

#### GitHub OAuth
**Login URL:** `GET /accounts/github/login/`

**Setup Requirements:**
1. Create a GitHub OAuth App in GitHub Settings → Developer settings
2. Configure the client ID and secret in Django settings
3. Set Authorization callback URL: `http://tenant-name.localhost:8000/accounts/github/login/callback/`

#### OAuth Configuration
Update your Django settings with OAuth credentials:

```python
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': 'your-google-client-id',
            'secret': 'your-google-client-secret',
            'key': ''
        }
    },
    'github': {
        'APP': {
            'client_id': 'your-github-client-id',
            'secret': 'your-github-client-secret',
            'key': ''
        }
    }
}
```

#### OAuth Flow
1. User clicks OAuth login button → redirects to provider
2. User authorizes application → provider redirects back
3. django-allauth creates/updates user account
4. User gets Django session for web access
5. For API access, user can obtain token via traditional login or API token endpoint

**Note:** OAuth users can optionally set passwords for traditional login fallback.

### OAuth Setup Guide

#### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
 6. Add authorized redirect URIs:
   - `http://127.0.0.1:8001/accounts/google/login/callback/` (development)
     - `http://tenant-name.localhost:8000/accounts/google/login/callback/` (production with subdomains)
7. Copy Client ID and Client Secret to your Django settings

#### 2. GitHub OAuth Setup
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
 3. Fill in application details:
   - **Homepage URL**: `http://127.0.0.1:8001` (development)
     - **Authorization callback URL**: `http://127.0.0.1:8001/accounts/github/login/callback/`
4. Copy Client ID and Client Secret to your Django settings

#### 3. Environment Configuration
Add your OAuth credentials to the `.env` file in your project root:

```bash
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GITHUB_CLIENT_ID=your-actual-github-client-id
GITHUB_CLIENT_SECRET=your-actual-github-client-secret
```

The Django settings automatically load these values from the environment variables.

**Note:** Use the `check_env.py` script to validate your environment configuration:
```bash
python check_env.py
```

#### 4. Frontend Integration
Add OAuth login buttons to your frontend:

```html
<!-- Google Login -->
<a href="/accounts/google/login/" class="btn btn-google">
  <i class="fab fa-google"></i> Login with Google
</a>

<!-- GitHub Login -->
<a href="/accounts/github/login/" class="btn btn-github">
  <i class="fab fa-github"></i> Login with GitHub
</a>
```

## API Endpoints

All endpoints require authentication. You can authenticate using either:

1. **Token Authentication** (for API clients):
```
Authorization: Token your_auth_token
```

2. **Session Authentication** (for web users, including OAuth users):
```
# Handled automatically by Django for logged-in users
```

### Tenants

#### List Tenants
**GET /api/tenants/**

**Query Parameters:**
- `name` - Filter by name
- `search` - Search in name
- `ordering` - Order by: name, created_at

**Example:**
```bash
curl -H "Authorization: Token your_token" \
  http://127.0.0.1:8001/api/tenants/?search=Tech
```

#### Create Tenant
**POST /api/tenants/**

**Request Body:**
```json
{
  "name": "Tech Solutions Inc",
  "address": "123 Main St, City, State"
}
```

#### Get Tenant
**GET /api/tenants/{id}/**

#### Update Tenant
**PUT /api/tenants/{id}/**

#### Delete Tenant
**DELETE /api/tenants/{id}/**

### Clients

#### List Clients
**GET /api/clients/**

**Query Parameters:**
- `status` - Filter by status (active, inactive, prospect)
- `tenant` - Filter by tenant ID
- `search` - Search in name, email
- `ordering` - Order by: name, created_at

**Response includes:**
- `tenant_name` - Tenant name
- `projects_count` - Number of projects

**Example:**
```bash
curl -H "Authorization: Token your_token" \
  http://127.0.0.1:8001/api/clients/?status=active
```

#### Create Client
**POST /api/clients/**

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "active",
  "tenant": 1
}
```

#### Get Client
**GET /api/clients/{id}/**

#### Update Client
**PUT /api/clients/{id}/**

#### Delete Client
**DELETE /api/clients/{id}/**

### Projects

#### List Projects
**GET /api/projects/**

**Query Parameters:**
- `status` - Filter by status (planning, active, on_hold, completed, archived)
- `priority` - Filter by priority (low, medium, high)
- `client` - Filter by client ID
- `search` - Search in name, description
- `ordering` - Order by: name, created_at

**Response includes:**
- `client_name` - Client name
- `milestones_count` - Number of milestones

**Example:**
```bash
curl -H "Authorization: Token your_token" \
  http://127.0.0.1:8001/api/projects/?status=active&priority=high
```

#### Create Project
**POST /api/projects/**

**Request Body:**
```json
{
  "name": "Website Redesign",
  "client": 1,
  "status": "planning",
  "priority": "high",
  "start_date": "2024-01-15",
  "end_date": "2024-03-15",
  "budget": 50000.00,
  "description": "Complete website redesign project",
  "tags": "web,design,frontend",
  "team_members": [1, 2],
  "access_groups": [1]
}
```

#### Get Project
**GET /api/projects/{id}/**

#### Update Project
**PUT /api/projects/{id}/**

#### Delete Project
**DELETE /api/projects/{id}/**

### Milestones

#### List Milestones
**GET /api/milestones/**

**Query Parameters:**
- `status` - Filter by status (planning, active, completed)
- `project` - Filter by project ID
- `search` - Search in name, description
- `ordering` - Order by: name, due_date

**Response includes:**
- `project_name` - Project name
- `sprints_count` - Number of sprints

#### Create Milestone
**POST /api/milestones/**

**Request Body:**
```json
{
  "name": "Phase 1 Development",
  "description": "Initial development phase",
  "status": "planning",
  "planned_start": "2024-01-15",
  "due_date": "2024-02-15",
  "assignee": 1,
  "progress": 0,
  "project": 1
}
```

### Sprints

#### List Sprints
**GET /api/sprints/**

**Query Parameters:**
- `status` - Filter by status (planned, active, completed, canceled)
- `milestone` - Filter by milestone ID
- `search` - Search in name
- `ordering` - Order by: name, start_date

**Response includes:**
- `milestone_name` - Milestone name
- `tasks_count` - Number of tasks

#### Create Sprint
**POST /api/sprints/**

**Request Body:**
```json
{
  "name": "Sprint 1",
  "status": "planned",
  "start_date": "2024-01-15",
  "end_date": "2024-01-29",
  "milestone": 1
}
```

### Tasks

#### List Tasks
**GET /api/tasks/**

**Query Parameters:**
- `status` - Filter by status (backlog, to_do, in_progress, in_review, done)
- `sprint` - Filter by sprint ID
- `assignee` - Filter by assignee ID
- `search` - Search in title, description
- `ordering` - Order by: title, created_at

**Response includes:**
- `sprint_name` - Sprint name

#### Create Task
**POST /api/tasks/**

**Request Body:**
```json
{
  "title": "Implement user authentication",
  "description": "Add login and registration functionality",
  "status": "to_do",
  "sprint": 1,
  "assignee": 1
}
```

### Invoices

#### List Invoices
**GET /api/invoices/**

**Query Parameters:**
- `paid` - Filter by payment status (true/false)
- `client` - Filter by client ID
- `project` - Filter by project ID
- `search` - Search in client name
- `ordering` - Order by: issued_at

**Response includes:**
- `client_name` - Client name

#### Create Invoice
**POST /api/invoices/**

**Request Body:**
```json
{
  "client": 1,
  "project": 1,
  "amount": 15000.00
}
```

### Payments

#### List Payments
**GET /api/payments/**

**Query Parameters:**
- `invoice` - Filter by invoice ID
- `search` - Search in invoice ID
- `ordering` - Order by: paid_at

**Response includes:**
- `invoice_id` - Invoice ID

#### Create Payment
**POST /api/payments/**

**Request Body:**
```json
{
  "invoice": 1,
  "amount": 15000.00
}
```

## JavaScript Examples

```javascript
import api from './api.js';

// Configure API base URL (development mode - no tenant subdomains)
api.defaults.baseURL = 'http://127.0.0.1:8001/api';

// For production with multi-tenancy enabled:
// const tenantSubdomain = 'demo-tenant';
// api.defaults.baseURL = `http://${tenantSubdomain}.localhost:8000/api`;

// Get all clients (in development mode, returns all clients across tenants)
api.get('/clients/')
  .then(response => console.log(response.data));

// Create a new project
api.post('/projects/', {
  name: 'New Project',
  client: 1,
  status: 'planning',
  priority: 'medium'
})
.then(response => console.log('Project created:', response.data));

// Update a task
api.put('/tasks/1/', {
  status: 'in_progress'
})
.then(response => console.log('Task updated:', response.data));

// Delete a milestone
api.delete('/milestones/1/')
  .then(() => console.log('Milestone deleted'));
```

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a JSON object with error details:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### OAuth-Specific Errors

OAuth authentication may return additional error types:
- `400 Bad Request` - Invalid OAuth callback or missing parameters
- `401 Unauthorized` - OAuth provider authentication failed
- `403 Forbidden` - User account disabled or OAuth provider access denied

OAuth errors are typically handled by redirecting users back to the login page with error messages.

## Multi-Tenant Architecture

DjangoCRM supports a shared-database, schema-per-tenant approach with subdomain-based routing, but is currently configured for development with tenant isolation disabled:

### Current Development Configuration
- **Tenant Middleware**: Disabled for development, allowing access to all data
- **Data Access**: All endpoints return data across all tenants
- **Authentication**: Token-based authentication with role-based permissions

### Production Multi-Tenant Setup
When multi-tenancy is enabled:

### Tenant Identification
- **Subdomain Routing**: Each tenant is accessed via a unique subdomain (e.g., `tenant1.example.com`)
- **Automatic Filtering**: All API endpoints automatically filter data by the current tenant
- **User Association**: Users can be associated with specific tenants via the UserTenant model

### Data Isolation
- All models include a `tenant` foreign key
- Middleware sets `request.tenant` based on the subdomain
- ViewSets filter querysets by `tenant=self.request.tenant`
- Permissions ensure users can only access data within their tenant

### User-Tenant Association
Users can be associated with specific tenants via the UserTenant model:
- Allows users to access multiple tenants if needed
- Fallback mechanism when subdomain routing fails
- Managed through Django admin or custom API endpoints

### Creating Tenants
Use the management command to create tenants and migrate existing data:
```bash
python manage.py migrate_to_tenants --tenant-name="My Company"
```

### Enabling Multi-Tenancy
To enable multi-tenancy in production:
1. Uncomment `TenantMiddleware` in `saasCRM/settings.py`
2. Configure web server for subdomain routing
3. Update OAuth redirect URIs to use subdomains
4. Run `python manage.py migrate_to_tenants` for existing data

## Permissions

- **Authentication Methods** (`/api/auth-methods/`): Public (no authentication required)
- **Tenants**: Authenticated users
- **Clients**: Client Management Administrators group
- **Projects**: Business Strategy or Product Measurement Administrators groups
- **Milestones, Sprints, Tasks**: Authenticated users
- **Invoices, Payments**: API Control Administrators group

**User Groups:**
- **Client Management Administrators**: Can manage clients
- **Business Strategy Administrators**: Can manage projects, milestones, tasks
- **Product Measurement Administrators**: Can manage projects, milestones, tasks
- **API Control Administrators**: Can manage invoices and payments

**Note:** In development mode, tenant scoping is disabled. In production with multi-tenancy enabled, all permissions are additionally scoped to the current tenant.