# DjangoCRM

A comprehensive Customer Relationship Management system built with Django REST Framework and React.

## 🚀 Features

- **Organization Management**: Create and manage multiple organizations
- **Client Management**: Track clients with detailed information and project history
- **Project Tracking**: Full project lifecycle management with milestones and sprints
- **Task Management**: Agile task tracking with status updates
- **Financial Management**: Invoice and payment processing
- **RESTful API**: Complete API with authentication and permissions
- **React Frontend**: Modern web interface for CRM operations
- **Role-based Access**: Different permission levels for various user types

## 🛠️ Tech Stack

- **Backend**: Django 5.2, Django REST Framework
- **Database**: PostgreSQL (production) / SQLite (development)
- **Frontend**: React
- **Authentication**: Token-based authentication
- **API Documentation**: Comprehensive endpoint documentation

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+ (for frontend development)
- PostgreSQL (optional, SQLite works for development)

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

3. **Set up the database**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Run the development server**
   ```bash
   python manage.py runserver
   ```

5. **Set up frontend (optional)**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📖 API Documentation

Complete API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Quick API Examples

**Authentication:**
```bash
curl -X POST http://127.0.0.1:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

**Get Clients:**
```bash
curl -H "Authorization: Token YOUR_TOKEN" \
  http://127.0.0.1:8000/api/clients/
```

## 🏗️ Project Structure

```
DjangoCRM/
├── project/                 # Main Django app
│   ├── models.py           # Database models
│   ├── views.py            # API views
│   ├── serializers.py      # DRF serializers
│   ├── permissions.py      # Custom permissions
│   └── migrations/         # Database migrations
├── saasCRM/                # Django project settings
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── api.js         # API client
├── API_DOCUMENTATION.md    # Complete API docs
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🔧 Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### API Permissions

- **Organizations**: All authenticated users
- **Clients**: Client managers only
- **Projects**: Project managers only
- **Tasks/Milestones/Sprints**: All authenticated users
- **Invoices/Payments**: API managers only

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