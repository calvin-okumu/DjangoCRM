from rest_framework import viewsets, permissions, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import render
from .models import (
    Organization,
    Client,
    Project,
    Milestone,
    Sprint,
    Task,
    Invoice,
    Payment,
)
from .serializers import (
    OrganizationSerializer,
    ClientSerializer,
    ProjectSerializer,
    MilestoneSerializer,
    SprintSerializer,
    TaskSerializer,
    InvoiceSerializer,
    PaymentSerializer,
)
from .permissions import IsClientManager, IsProjectManager, IsAPIManager


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["name"]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at"]


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "organization"]
    search_fields = ["name", "email"]
    ordering_fields = ["name", "created_at"]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "priority", "client"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "project"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "due_date"]


class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "milestone"]
    search_fields = ["name"]
    ordering_fields = ["name", "start_date"]


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "sprint", "assignee"]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "created_at"]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsAPIManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["paid", "client", "project"]
    search_fields = ["client__name"]
    ordering_fields = ["issued_at"]


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAPIManager]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["invoice"]
    search_fields = ["invoice__id"]
    ordering_fields = ["paid_at"]


def login_page(request):
    return render(request, 'login.html')

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user and user.is_active:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'message': 'Login successful'
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def auth_methods_view(request):
    """
    Returns available authentication methods
    """
    auth_methods = {
        'traditional': {
            'endpoint': '/api/login/',
            'method': 'POST',
            'description': 'Username and password authentication',
            'fields': ['username', 'password']
        },
        'oauth': {
            'providers': {
                'google': {
                    'login_url': '/accounts/google/login/',
                    'description': 'Login with Google account'
                },
                'github': {
                    'login_url': '/accounts/github/login/',
                    'description': 'Login with GitHub account'
                }
            }
        }
    }
    return Response(auth_methods)

