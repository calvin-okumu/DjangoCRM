import json
from django.test import TestCase
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from .models import (
    Tenant, Client, Project, Milestone, Sprint, Task,
    Invoice, Payment, CustomUser
)


class ModelTests(TestCase):
    """Test model creation, relationships, and validation"""

    def setUp(self):
        self.org = Tenant.objects.create(name="Test Organization", address="123 Test St")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            phone="+1234567890",
            status="active",
            tenant=self.org
        )
        self.project = Project.objects.create(
            name="Test Project",
            tenant=self.org,
            client=self.client_obj,
            status="active",
            priority="high",
            budget=Decimal('50000.00'),
            description="Test project description"
        )
        self.milestone = Milestone.objects.create(
            name="Test Milestone",
            tenant=self.org,
            project=self.project,
            status="active",
            progress=75
        )
        self.sprint = Sprint.objects.create(
            name="Test Sprint",
            tenant=self.org,
            milestone=self.milestone,
            status="active"
        )
        self.task = Task.objects.create(
            title="Test Task",
            tenant=self.org,
            sprint=self.sprint,
            status="in_progress"
        )
        self.invoice = Invoice.objects.create(
            tenant=self.org,
            client=self.client_obj,
            project=self.project,
            amount=Decimal('15000.00')
        )
        self.payment = Payment.objects.create(
            tenant=self.org,
            invoice=self.invoice,
            amount=Decimal('15000.00')
        )

    def test_organization_creation(self):
        """Test organization model creation"""
        self.assertEqual(self.org.name, "Test Organization")
        self.assertEqual(str(self.org), "Test Organization")

    def test_client_creation(self):
        """Test client model creation and relationships"""
        self.assertEqual(self.client_obj.name, "Test Client")
        self.assertEqual(self.client_obj.email, "test@example.com")
        self.assertEqual(self.client_obj.tenant, self.org)
        self.assertEqual(str(self.client_obj), "Test Client")
        self.assertEqual(self.client_obj.status, "active")

    def test_project_creation(self):
        """Test project model creation and relationships"""
        self.assertEqual(self.project.name, "Test Project")
        self.assertEqual(self.project.client, self.client_obj)
        self.assertEqual(self.project.status, "active")
        self.assertEqual(self.project.priority, "high")
        self.assertEqual(self.project.budget, Decimal('50000.00'))
        self.assertEqual(str(self.project), "Test Project")

    def test_milestone_creation(self):
        """Test milestone model creation and validation"""
        self.assertEqual(self.milestone.name, "Test Milestone")
        self.assertEqual(self.milestone.project, self.project)
        self.assertEqual(self.milestone.progress, 75)
        self.assertEqual(str(self.milestone), "Test Milestone (Test Project)")

        # Test progress validation
        with self.assertRaises(ValidationError):
            invalid_milestone = Milestone(name="Invalid", project=self.project, progress=150)
            invalid_milestone.full_clean()

    def test_sprint_creation(self):
        """Test sprint model creation"""
        self.assertEqual(self.sprint.name, "Test Sprint")
        self.assertEqual(self.sprint.milestone, self.milestone)
        self.assertEqual(str(self.sprint), "Test Sprint (Test Milestone)")

    def test_task_creation(self):
        """Test task model creation"""
        self.assertEqual(self.task.title, "Test Task")
        self.assertEqual(self.task.sprint, self.sprint)
        self.assertEqual(self.task.status, "in_progress")
        self.assertEqual(str(self.task), "Test Task")

    def test_invoice_creation(self):
        """Test invoice model creation"""
        self.assertEqual(self.invoice.client, self.client_obj)
        self.assertEqual(self.invoice.project, self.project)
        self.assertEqual(self.invoice.amount, Decimal('15000.00'))
        self.assertFalse(self.invoice.paid)
        self.assertIn("Invoice", str(self.invoice))

    def test_payment_creation(self):
        """Test payment model creation"""
        self.assertEqual(self.payment.invoice, self.invoice)
        self.assertEqual(self.payment.amount, Decimal('15000.00'))
        self.assertIn("Payment", str(self.payment))

    def test_relationships(self):
        """Test all model relationships"""
        # Tenant -> Client
        self.assertIn(self.client_obj, self.org.clients.all())

        # Client -> Project
        self.assertIn(self.project, self.client_obj.projects.all())

        # Project -> Milestone
        self.assertIn(self.milestone, self.project.milestones.all())

        # Milestone -> Sprint
        self.assertIn(self.sprint, self.milestone.sprints.all())

        # Sprint -> Task
        self.assertIn(self.task, self.sprint.tasks.all())

        # Client/Project -> Invoice
        self.assertIn(self.invoice, self.client_obj.invoices.all())
        self.assertIn(self.invoice, self.project.invoices.all())

        # Invoice -> Payment
        self.assertIn(self.payment, self.invoice.payments.all())

    def test_unique_constraints(self):
        """Test unique constraints"""
        # Tenant name unique
        with self.assertRaises(Exception):
            Tenant.objects.create(name="Test Organization")

        # Client email unique
        with self.assertRaises(Exception):
            Client.objects.create(
                name="Another Client",
                email="test@example.com",
                organization=self.org
            )


class AuthenticationTests(APITestCase):
    """Test authentication endpoints"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            'test@example.com',
            'testpass123'
        )

    def test_login_success(self):
        """Test successful login"""
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user_id', response.data)
        self.assertEqual(response.data['email'], 'test@example.com')

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'email': 'test@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', response.data)

    def test_login_missing_fields(self):
        """Test login with missing fields"""
        # Missing password
        data = {'email': 'test@example.com'}
        response = self.client.post('/api/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing email
        data = {'password': 'testpass123'}
        response = self.client.post('/api/login/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TenantAPITests(APITestCase):
    """Test Tenant API endpoints"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)

        self.org1 = Tenant.objects.create(name="Org 1", address="Address 1")
        self.org2 = Tenant.objects.create(name="Org 2", address="Address 2")

    def test_list_tenants(self):
        """Test listing tenants"""
        response = self.client.get('/api/tenants/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_tenant(self):
        """Test creating tenant"""
        data = {
            'name': 'New Tenant',
            'address': 'New Address'
        }
        response = self.client.post('/api/tenants/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Tenant')

    def test_retrieve_tenant(self):
        """Test retrieving single tenant"""
        response = self.client.get(f'/api/tenants/{self.org1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Org 1')

    def test_update_tenant(self):
        """Test updating tenant"""
        data = {'name': 'Updated Tenant', 'address': 'Updated Address'}
        response = self.client.put(f'/api/tenants/{self.org1.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Tenant')

    def test_delete_tenant(self):
        """Test deleting tenant"""
        response = self.client.delete(f'/api/tenants/{self.org1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify deletion
        response = self.client.get(f'/api/tenants/{self.org1.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_tenant_filtering(self):
        """Test tenant filtering and searching"""
        # Search by name
        response = self.client.get('/api/tenants/?search=Org 1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Ordering
        response = self.client.get('/api/tenants/?ordering=name')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ClientAPITests(APITestCase):
    """Test Client API endpoints"""

    def setUp(self):
        # Create user with proper permissions
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.group = Group.objects.create(name='Client Management Administrators')
        self.user.groups.add(self.group)
        self.client.force_authenticate(user=self.user)

        self.org = Tenant.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            tenant=self.org,
            status="active"
        )

    def test_list_clients(self):
        """Test listing clients"""
        response = self.client.get('/api/clients/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('tenant_name', response.data[0])
        self.assertIn('projects_count', response.data[0])

    def test_create_client(self):
        """Test creating client"""
        data = {
            'name': 'New Client',
            'email': 'new@example.com',
            'tenant': self.org.id,
            'status': 'prospect'
        }
        response = self.client.post('/api/clients/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Client')

    def test_client_validation(self):
        """Test client validation"""
        # Duplicate email
        data = {
            'name': 'Another Client',
            'email': 'test@example.com',  # Duplicate
            'tenant': self.org.id
        }
        response = self.client.post('/api/clients/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_client_filtering(self):
        """Test client filtering"""
        # Filter by status
        response = self.client.get('/api/clients/?status=active')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Search by name
        response = self.client.get('/api/clients/?search=Test Client')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class ProjectAPITests(APITestCase):
    """Test Project API endpoints"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.group = Group.objects.create(name='Business Strategy Administrators')
        self.user.groups.add(self.group)
        self.client.force_authenticate(user=self.user)

        self.org = Tenant.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            organization=self.org
        )
        self.project = Project.objects.create(
            name="Test Project",
            client=self.client_obj,
            status="active",
            priority="high",
            budget=Decimal('50000.00')
        )

    def test_list_projects(self):
        """Test listing projects"""
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('client_name', response.data[0])
        self.assertIn('milestones_count', response.data[0])

    def test_create_project(self):
        """Test creating project"""
        data = {
            'name': 'New Project',
            'client': self.client_obj.id,
            'status': 'planning',
            'priority': 'medium',
            'budget': '25000.00',
            'description': 'New project description'
        }
        response = self.client.post('/api/projects/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Project')

    def test_project_filtering(self):
        """Test project filtering"""
        # Filter by status
        response = self.client.get('/api/projects/?status=active')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Filter by priority
        response = self.client.get('/api/projects/?priority=high')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class MilestoneAPITests(APITestCase):
    """Test Milestone API endpoints"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)

        self.org = Tenant.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            organization=self.org
        )
        self.project = Project.objects.create(
            name="Test Project",
            client=self.client_obj
        )
        self.milestone = Milestone.objects.create(
            name="Test Milestone",
            project=self.project,
            status="active",
            progress=50
        )

    def test_list_milestones(self):
        """Test listing milestones"""
        response = self.client.get('/api/milestones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('project_name', response.data[0])
        self.assertIn('sprints_count', response.data[0])

    def test_create_milestone(self):
        """Test creating milestone"""
        data = {
            'name': 'New Milestone',
            'project': self.project.id,
            'status': 'planning',
            'progress': 0
        }
        response = self.client.post('/api/milestones/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_milestone_validation(self):
        """Test milestone progress validation"""
        data = {
            'name': 'Invalid Milestone',
            'project': self.project.id,
            'progress': 150  # Invalid: > 100
        }
        response = self.client.post('/api/milestones/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SprintAPITests(APITestCase):
    """Test Sprint API endpoints"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)

        self.org = Tenant.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            organization=self.org
        )
        self.project = Project.objects.create(name="Test Project", client=self.client_obj)
        self.milestone = Milestone.objects.create(name="Test Milestone", project=self.project)
        self.sprint = Sprint.objects.create(
            name="Test Sprint",
            milestone=self.milestone,
            status="active"
        )

    def test_list_sprints(self):
        """Test listing sprints"""
        response = self.client.get('/api/sprints/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('milestone_name', response.data[0])
        self.assertIn('tasks_count', response.data[0])

    def test_create_sprint(self):
        """Test creating sprint"""
        data = {
            'name': 'New Sprint',
            'milestone': self.milestone.id,
            'status': 'planned'
        }
        response = self.client.post('/api/sprints/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class TaskAPITests(APITestCase):
    """Test Task API endpoints"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)

        self.org = Tenant.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            organization=self.org
        )
        self.project = Project.objects.create(name="Test Project", client=self.client_obj)
        self.milestone = Milestone.objects.create(name="Test Milestone", project=self.project)
        self.sprint = Sprint.objects.create(name="Test Sprint", milestone=self.milestone)
        self.task = Task.objects.create(
            title="Test Task",
            sprint=self.sprint,
            status="to_do"
        )

    def test_list_tasks(self):
        """Test listing tasks"""
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('sprint_name', response.data[0])

    def test_create_task(self):
        """Test creating task"""
        data = {
            'title': 'New Task',
            'sprint': self.sprint.id,
            'status': 'backlog',
            'description': 'Task description'
        }
        response = self.client.post('/api/tasks/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_task_filtering(self):
        """Test task filtering"""
        # Filter by status
        response = self.client.get('/api/tasks/?status=to_do')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class InvoiceAPITests(APITestCase):
    """Test Invoice API endpoints"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.group = Group.objects.create(name='API Control Administrators')
        self.user.groups.add(self.group)
        self.client.force_authenticate(user=self.user)

        self.org = Tenant.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            organization=self.org
        )
        self.project = Project.objects.create(name="Test Project", client=self.client_obj)
        self.invoice = Invoice.objects.create(
            client=self.client_obj,
            project=self.project,
            amount=Decimal('15000.00')
        )

    def test_list_invoices(self):
        """Test listing invoices"""
        response = self.client.get('/api/invoices/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('client_name', response.data[0])

    def test_create_invoice(self):
        """Test creating invoice"""
        data = {
            'client': self.client_obj.id,
            'project': self.project.id,
            'amount': '25000.00'
        }
        response = self.client.post('/api/invoices/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_invoice_filtering(self):
        """Test invoice filtering"""
        # Filter by paid status
        response = self.client.get('/api/invoices/?paid=false')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class PaymentAPITests(APITestCase):
    """Test Payment API endpoints"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.group = Group.objects.create(name='API Control Administrators')
        self.user.groups.add(self.group)
        self.client.force_authenticate(user=self.user)

        self.org = Tenant.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            organization=self.org
        )
        self.project = Project.objects.create(name="Test Project", client=self.client_obj)
        self.invoice = Invoice.objects.create(
            client=self.client_obj,
            project=self.project,
            amount=Decimal('15000.00')
        )
        self.payment = Payment.objects.create(
            invoice=self.invoice,
            amount=Decimal('15000.00')
        )

    def test_list_payments(self):
        """Test listing payments"""
        response = self.client.get('/api/payments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn('invoice_id', response.data[0])

    def test_create_payment(self):
        """Test creating payment"""
        data = {
            'invoice': self.invoice.id,
            'amount': '7500.00'
        }
        response = self.client.post('/api/payments/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class PermissionTests(APITestCase):
    """Test permission controls"""

    def setUp(self):
        # Create users with different permissions
        self.regular_user = CustomUser.objects.create_user(username='regular', password='pass')
        self.client_manager = CustomUser.objects.create_user(username='client_mgr', password='pass')
        self.project_manager = CustomUser.objects.create_user(username='project_mgr', password='pass')
        self.api_manager = CustomUser.objects.create_user(username='api_mgr', password='pass')

        # Create groups
        client_group = Group.objects.create(name='Client Management Administrators')
        project_group = Group.objects.create(name='Business Strategy Administrators')
        api_group = Group.objects.create(name='API Control Administrators')

        self.client_manager.groups.add(client_group)
        self.project_manager.groups.add(project_group)
        self.api_manager.groups.add(api_group, project_group)  # API manager has multiple permissions

        # Create test data
        self.org = Tenant.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(
            name="Test Client",
            email="test@example.com",
            organization=self.org
        )
        self.project = Project.objects.create(name="Test Project", client=self.client_obj)
        self.invoice = Invoice.objects.create(client=self.client_obj, amount=Decimal('1000.00'))

    def test_client_permissions(self):
        """Test client management permissions"""
        # Regular user should not access clients
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/clients/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Client manager should access clients
        self.client.force_authenticate(user=self.client_manager)
        response = self.client.get('/api/clients/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_project_permissions(self):
        """Test project management permissions"""
        # Regular user should not access projects
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Project manager should access projects
        self.client.force_authenticate(user=self.project_manager)
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_invoice_permissions(self):
        """Test invoice permissions"""
        # Regular user should not access invoices
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/invoices/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # API manager should access invoices
        self.client.force_authenticate(user=self.api_manager)
        response = self.client.get('/api/invoices/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_public_endpoints(self):
        """Test endpoints that don't require special permissions"""
        self.client.force_authenticate(user=self.regular_user)

        # Tenants should be accessible
        response = self.client.get('/api/tenants/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Milestones should be accessible
        response = self.client.get('/api/milestones/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ErrorHandlingTests(APITestCase):
    """Test error handling and edge cases"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)

    def test_not_found(self):
        """Test 404 responses"""
        response = self.client.get('/api/organizations/999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_invalid_data(self):
        """Test validation errors"""
        # Try to create tenant with invalid data
        data = {'name': ''}  # Empty name
        response = self.client.post('/api/tenants/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_unauthenticated_access(self):
        """Test unauthenticated access"""
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/tenants/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
