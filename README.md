# DjangoCRM

A comprehensive multi-tenant Customer Relationship Management system built with Django REST Framework and React.

## 🚀 Features

- **Multi-Tenant Architecture**: Complete tenant isolation with subdomain-based access
- **Tenant Management**: Create and manage multiple tenants with isolated data
- **Client Management**: Track clients with detailed information and project history
- **Project Tracking**: Full project lifecycle management with milestones and sprints
- **Task Management**: Agile task tracking with status updates, dates, and estimated hours
- **Sprint Management**: Create and assign tasks to sprints with progress tracking
- **Progress Calculation**: Automatic progress aggregation from tasks to projects
- **Date Validation**: Hierarchical date constraints ensuring logical timelines
- **Financial Management**: Invoice and payment processing
- **RESTful API**: Complete API with authentication and permissions

- **Role-based Access**: Different permission levels for various user types
- **Multiple Authentication**: Support for both traditional login and OAuth (Google, GitHub)

## 🛠️ Tech Stack

- **Backend**: Django 5.2, Django REST Framework
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: Token-based authentication + OAuth (Google, GitHub) + Session authentication
- **Multi-Tenancy**: Subdomain-based tenant isolation
- **API Documentation**: Comprehensive endpoint documentation

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+ (for frontend development)
- PostgreSQL (optional, SQLite works for development)
- OAuth credentials from Google and/or GitHub (for social authentication)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DjangoCRM.git
   cd DjangoCRM
   ```

2. **Set up Python environment**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

3. **Configure environment variables**
    ```bash
    cp .env.example .env  # Copy the example file
    # Edit .env with your actual credentials and secrets
    ```

 4. **Set up the database**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser  # Prompts for email, password, first_name, last_name
   ```

5. **Generate sample data (optional)**
   ```bash
   python manage.py generate_sample_data
   # This creates sample tenants, users, clients, projects, etc.
   ```

6. **Configure OAuth (optional)**
   ```bash
   # For Google OAuth: Get credentials from Google Cloud Console
   # For GitHub OAuth: Get credentials from GitHub Developer Settings
   # Add credentials to your .env file
   ```

7. **Verify configuration**
   ```bash
   python check_env.py  # Check that all required variables are set
   ```

 8. **Run the development server**
    ```bash
    python manage.py runserver 127.0.0.1:8000
    ```

 9. **Access the application**
    - **API**: http://127.0.0.1:8000/api/
    - **Admin Interface**: http://127.0.0.1:8000/admin/
    - **Authentication**: POST to http://127.0.0.1:8000/api/login/



## 📖 API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Quick API Examples

**Authentication Methods:**
```bash
# Traditional login (development mode - no tenant isolation)
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@example.com", "password": "password123"}'

# Get available auth methods
curl http://127.0.0.1:8000/api/auth-methods/

# OAuth login (redirects to provider)
curl -L http://127.0.0.1:8000/accounts/google/login/
```

**Get Clients:**
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  http://127.0.0.1:8000/api/clients/
```

**Sample Users (created by generate_sample_data):**
- user1 (Client Management): Can access clients
- user2 (Business Strategy): Can access projects, milestones, tasks
- user3 (API Control): Can access invoices, payments
- user4 (Product Measurement): Can access projects, milestones, tasks
- user5 (API Control): Can access invoices, payments

## 📊 Current Development Status

The DjangoCRM application is currently in active development with the following features implemented and tested:

### ✅ Working Features
- **Authentication**: Token-based login with role-based permissions and superuser creation
- **Multi-Tenant Data Model**: Database schema supports tenant isolation (middleware disabled for development)
- **API Endpoints**: All CRUD operations for tenants, clients, projects, milestones, sprints, tasks
- **Progress Tracking**: Automatic progress calculation from tasks to projects
- **Date Management**: Start/end dates with hierarchical validation
- **Sprint Task Management**: Assign/create tasks via sprint endpoints
- **Sample Data**: Generate realistic test data with `python manage.py generate_sample_data`
- **Admin Interface**: Django admin panel for data management
- **OAuth Integration**: Google and GitHub OAuth configured (requires browser testing)

### 🔧 Development Configuration
- **Server**: Runs on `http://127.0.0.1:8000`
- **Multi-Tenancy**: Disabled for development (all data accessible)
- **Database**: PostgreSQL with sample data populated
- **Authentication**: Token-based with 5 sample users across different permission groups

### 📈 Sample Data Overview
Running `python manage.py generate_sample_data` creates:
- **24 Tenants** with realistic company names and addresses
- **Clients** distributed across tenants
- **Projects** with various statuses, priorities, and progress tracking
- **Milestones** linked to projects with progress calculation
- **Sprints** with progress and task management
- **Tasks** with status-based progress, dates, and estimated hours
- **5 Users** with different permission levels
- **1 Superuser** (calvindhmb@gmail.com / password123)

## 🏗️ Project Structure

```
DjangoCRM/
├── project/                 # Main Django app
│   ├── models.py           # Database models (Tenant, Client, Project, etc.)
│   ├── views.py            # API views with tenant filtering
│   ├── serializers.py      # DRF serializers
│   ├── permissions.py      # Custom permissions (tenant ownership)
│   ├── middleware.py       # Tenant middleware for subdomain routing
│   ├── migrations/         # Database migrations
│   └── management/commands/# Management commands (migrate_to_tenants)
├── saasCRM/                # Django project settings
│   └── settings.py         # Django settings (includes OAuth config)
├── .env.example            # Environment variables template
├── .env                    # Environment variables (not committed)
├── check_env.py            # Environment configuration checker
├── API_DOCUMENTATION.md    # Complete API docs
├── requirements.txt        # Python dependencies (includes OAuth packages)
└── README.md              # This file
```

## 🔧 Development

### Environment Configuration
```bash
python check_env.py  # Validate your .env configuration
```

### Running Tests
```bash
python manage.py test
```

### Testing the API
```bash
# 1. Start the server
python manage.py runserver 127.0.0.1:8000

# 2. Login with a sample user (in another terminal)
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com", "password": "password123"}'

# 3. Use the returned token to access endpoints
curl -H "Authorization: Token YOUR_TOKEN_HERE" \
  http://127.0.0.1:8000/api/projects/

# 4. Access admin interface
# Open http://127.0.0.1:8000/admin/ in browser
# Login with calvindhmb@gmail.com / password123 (superuser)
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Multi-Tenant Management
```bash
# Create a new tenant and migrate existing data
python manage.py migrate_to_tenants --tenant-name="New Tenant"

# List all tenants
python manage.py shell -c "from project.models import Tenant; print([t.name for t in Tenant.objects.all()])"
```

### OAuth Configuration

To enable OAuth authentication:

1. **Google OAuth Setup:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://127.0.0.1:8000/accounts/google/login/callback/`

2. **GitHub OAuth Setup:**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Set callback URL: `http://127.0.0.1:8000/accounts/github/login/callback/`

3. **Update .env file:**
   Add your OAuth credentials to the `.env` file:
   ```bash
   GOOGLE_CLIENT_ID=your-actual-google-client-id
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   GITHUB_CLIENT_ID=your-actual-github-client-id
   GITHUB_CLIENT_SECRET=your-actual-github-client-secret
   ```

   The Django settings will automatically load these values from the environment.

### Multi-Tenant Setup

The application supports subdomain-based multi-tenancy, but is currently configured for development with tenant isolation disabled:

- **Development Mode**: Tenant middleware is disabled, allowing access to all data across tenants
- **Production Mode**: Enable tenant middleware for proper data isolation
- **Tenant Identification**: Each tenant is accessed via subdomain (e.g., `tenant1.example.com`)
- **Data Isolation**: All data is automatically filtered by the current tenant when enabled
- **User Association**: Users can be associated with specific tenants via the UserTenant model
- **Migration**: Use `python manage.py migrate_to_tenants` to assign existing data to tenants

**To enable multi-tenancy in production:**
1. Uncomment the `TenantMiddleware` in `saasCRM/settings.py`
2. Configure your web server for subdomain routing
3. Update OAuth redirect URIs to use subdomains

### API Permissions

- **Tenants**: All authenticated users
- **Clients**: Client Management Administrators group (currently tenant-scoped in development)
- **Projects**: Business Strategy or Product Measurement Administrators groups
- **Tasks/Milestones/Sprints**: All authenticated users (currently tenant-scoped in development)
- **Invoices/Payments**: API Control Administrators group

**User Groups:**
- **Client Management Administrators**: Can manage clients
- **Business Strategy Administrators**: Can manage projects, milestones, tasks
- **Product Measurement Administrators**: Can manage projects, milestones, tasks
- **API Control Administrators**: Can manage invoices and payments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

For questions or support, please open an issue on GitHub.