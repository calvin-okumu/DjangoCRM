from rest_framework import viewsets, permissions, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import render
from django.utils import timezone
from datetime import timedelta
import uuid
from .models import (
    Tenant,
    UserTenant,
    # Invitation,
    CustomUser,
    Client,
    Project,
    Milestone,
    Sprint,
    Task,
    Invoice,
    Payment,
)
from .serializers import (
    TenantSerializer,
    ClientSerializer,
    ProjectSerializer,
    MilestoneSerializer,
    SprintSerializer,
    TaskSerializer,
    InvoiceSerializer,
    PaymentSerializer,
)
from .permissions import IsClientManager, IsProjectManager, IsAPIManager, IsTenantOwner


class TenantViewSet(viewsets.ModelViewSet):
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
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
    filterset_fields = ["status", "tenant"]
    search_fields = ["name", "email"]
    ordering_fields = ["name", "created_at"]

    def get_queryset(self):
        if self.request.tenant:
            return Client.objects.filter(tenant=self.request.tenant)
        else:
            return Client.objects.all()  # For development


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectManager, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "priority", "client"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]

    def get_queryset(self):
        if self.request.tenant:
            return Project.objects.filter(tenant=self.request.tenant)
        else:
            return Project.objects.all()  # For development


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all()
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "project"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "due_date"]

    def get_queryset(self):
        if self.request.tenant:
            return Milestone.objects.filter(tenant=self.request.tenant)
        else:
            return Milestone.objects.all()  # For development


class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "milestone"]
    search_fields = ["name"]
    ordering_fields = ["name", "start_date"]

    def get_queryset(self):
        if self.request.tenant:
            return Sprint.objects.filter(tenant=self.request.tenant)
        else:
            return Sprint.objects.all()  # For development


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "sprint", "assignee"]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "created_at"]

    def get_queryset(self):
        if self.request.tenant:
            return Task.objects.filter(tenant=self.request.tenant)
        else:
            return Task.objects.all()  # For development


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsAPIManager, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["paid", "client", "project"]
    search_fields = ["client__name"]
    ordering_fields = ["issued_at"]

    def get_queryset(self):
        if self.request.tenant:
            return Invoice.objects.filter(tenant=self.request.tenant)
        else:
            return Invoice.objects.all()  # For development


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAPIManager, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["invoice"]
    search_fields = ["invoice__id"]
    ordering_fields = ["paid_at"]

    def get_queryset(self):
        if self.request.tenant:
            return Payment.objects.filter(tenant=self.request.tenant)
        else:
            return Payment.objects.all()  # For development


def login_page(request):
    return render(request, 'login.html')

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=email, password=password)
    if user and user.is_active:
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'message': 'Login successful'
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def signup_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    company_name = request.data.get('company_name')
    invitation_token = request.data.get('invitation_token')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

    if not company_name:
        return Response({'error': 'Company name required'}, status=status.HTTP_400_BAD_REQUEST)

    domain = email.split('@')[1]
    if Tenant.objects.filter(domain=domain).exists():
        return Response({'error': 'Domain already in use'}, status=status.HTTP_400_BAD_REQUEST)

    tenant = Tenant.objects.create(name=company_name, domain=domain)
    role = 'Tenant Owner'

    user = CustomUser.objects.create_user(email=email, password=password)
    user.first_name = first_name
    user.last_name = last_name
    user.save()
    UserTenant.objects.create(user=user, tenant=tenant, is_owner=(role == 'Tenant Owner'))

    # Assign group
    from django.contrib.auth.models import Group
    group, _ = Group.objects.get_or_create(name=role)
    user.groups.add(group)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user_id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'tenant': tenant.name,
        'message': 'Signup successful'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def invite_member_view(request):
    if not hasattr(request, 'tenant') or not request.tenant:
        return Response({'error': 'Tenant context required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user is owner
    try:
        user_tenant = UserTenant.objects.get(user=request.user, tenant=request.tenant, is_owner=True)
    except UserTenant.DoesNotExist:
        return Response({'error': 'Only owners can invite members'}, status=status.HTTP_403_FORBIDDEN)

    email = request.data.get('email')
    role = request.data.get('role', 'Employee')

    if not email:
        return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)

    token = str(uuid.uuid4())
    expires_at = timezone.now() + timedelta(days=7)

    invitation = Invitation.objects.create(
        email=email,
        tenant=request.tenant,
        token=token,
        role=role,
        invited_by=request.user,
        expires_at=expires_at
    )

    # TODO: Send email with invitation link
    return Response({'message': 'Invitation sent', 'token': token})


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
            'description': 'Email and password authentication',
            'fields': ['email', 'password']
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

