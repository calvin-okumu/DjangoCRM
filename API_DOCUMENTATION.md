# DjangoCRM API Documentation

This document provides comprehensive documentation for the DjangoCRM API, including authentication, endpoints, and usage examples.

## Base URL
```
http://127.0.0.1:8000/api
```

## Authentication

The API uses token-based authentication. Include the token in the Authorization header for all requests except login.

### Login
**Endpoint:** `POST /api/login/`

**Request Body:**
```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "your_auth_token",
  "user_id": 1,
  "username": "your_username"
}
```

**Example (curl):**
```bash
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

**Example (JavaScript):**
```javascript
import { login } from './api.js';

login('admin', 'password123')
  .then(response => {
    localStorage.setItem('token', response.data.token);
  });
```

## API Endpoints

All endpoints require authentication except login. Include the token in the Authorization header:
```
Authorization: Token your_auth_token
```

### Organizations

#### List Organizations
**GET /api/organizations/**

**Query Parameters:**
- `name` - Filter by name
- `search` - Search in name
- `ordering` - Order by: name, created_at

**Example:**
```bash
curl -H "Authorization: Token your_token" \
  http://127.0.0.1:8000/api/organizations/?search=Tech
```

#### Create Organization
**POST /api/organizations/**

**Request Body:**
```json
{
  "name": "Tech Solutions Inc",
  "address": "123 Main St, City, State"
}
```

#### Get Organization
**GET /api/organizations/{id}/**

#### Update Organization
**PUT /api/organizations/{id}/**

#### Delete Organization
**DELETE /api/organizations/{id}/**

### Clients

#### List Clients
**GET /api/clients/**

**Query Parameters:**
- `status` - Filter by status (active, inactive, prospect)
- `organization` - Filter by organization ID
- `search` - Search in name, email
- `ordering` - Order by: name, created_at

**Response includes:**
- `organization_name` - Organization name
- `projects_count` - Number of projects

**Example:**
```bash
curl -H "Authorization: Token your_token" \
  http://127.0.0.1:8000/api/clients/?status=active
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
  "organization": 1
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
  http://127.0.0.1:8000/api/projects/?status=active&priority=high
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

// Get all clients
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

## Permissions

- **Organizations**: Authenticated users
- **Clients**: Authenticated users with client manager permissions
- **Projects**: Authenticated users with project manager permissions
- **Milestones, Sprints, Tasks**: Authenticated users
- **Invoices, Payments**: Authenticated users with API manager permissions