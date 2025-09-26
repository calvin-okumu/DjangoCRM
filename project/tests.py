from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Organization, Client, Project, Milestone, Sprint, Task

class ModelTests(TestCase):
    def setUp(self):
        self.org = Organization.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(name="Test Client", email="test@example.com", organization=self.org)
        self.project = Project.objects.create(name="Test Project", client=self.client_obj)
        self.milestone = Milestone.objects.create(name="Test Milestone", project=self.project)
        self.sprint = Sprint.objects.create(name="Test Sprint", milestone=self.milestone)
        self.task = Task.objects.create(title="Test Task", sprint=self.sprint)

    def test_client_creation(self):
        self.assertEqual(self.client_obj.name, "Test Client")
        self.assertEqual(self.client_obj.organization, self.org)

    def test_project_relationship(self):
        self.assertEqual(self.project.client, self.client_obj)
        self.assertIn(self.project, self.client_obj.projects.all())

    def test_task_relationship(self):
        self.assertEqual(self.task.sprint, self.sprint)
        self.assertEqual(self.sprint.milestone, self.milestone)

class APITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.group = Group.objects.create(name='Client Management Administrators')
        self.user.groups.add(self.group)
        self.client.force_authenticate(user=self.user)

        self.org = Organization.objects.create(name="Test Org")
        self.client_obj = Client.objects.create(name="Test Client", email="test@example.com", organization=self.org)

    def test_client_list(self):
        response = self.client.get('/api/clients/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_client_create(self):
        data = {"name": "New Client", "email": "new@example.com", "organization": self.org.id}
        response = self.client.post('/api/clients/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_unauthorized_access(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/clients/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)  # Permission denied for unauthenticated
