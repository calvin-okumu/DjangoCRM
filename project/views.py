from rest_framework import viewsets, permissions, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import render
from django.utils import timezone
from datetime import timedelta
import uuid
from .models import (
    Client,
    Project,
    Milestone,
    Sprint,
    Task,
    Invoice,
    Payment,
)
from accounts.models import (
    Tenant,
    UserTenant,
    Invitation,
    CustomUser,
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
    UserTenantSerializer,
    InvitationSerializer,
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

    @action(detail=True, methods=['post'])
    def create_task(self, request, pk=None):
        sprint = self.get_object()
        data = request.data.copy()
        data['milestone'] = sprint.milestone.id
        data['sprint'] = sprint.id
        data['tenant'] = sprint.tenant.id
        serializer = TaskSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def assign_task(self, request, pk=None):
        sprint = self.get_object()
        task_id = request.data.get('task_id')
        try:
            task = Task.objects.get(id=task_id, milestone=sprint.milestone)
            task.sprint = sprint
            task.save()
            return Response({'message': 'Task assigned'}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found or invalid'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def unassign_task(self, request, pk=None):
        sprint = self.get_object()
        task_id = request.data.get('task_id')
        try:
            task = Task.objects.get(id=task_id, sprint=sprint)
            task.sprint = None
            task.save()
            return Response({'message': 'Task unassigned'}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "milestone", "sprint", "assignee"]
    search_fields = ["title", "description"]
    ordering_fields = ["title", "created_at"]

    def get_queryset(self):
        if self.request.tenant:
            return Task.objects.filter(tenant=self.request.tenant)
        else:
            return Task.objects.all()  # For development

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.full_clean()

    def perform_update(self, serializer):
        instance = serializer.save()
        instance.full_clean()


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


class UserTenantViewSet(viewsets.ModelViewSet):
    queryset = UserTenant.objects.all()
    serializer_class = UserTenantSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["tenant", "is_owner", "is_approved", "role"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]
    ordering_fields = ["role"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not hasattr(self.request, 'tenant') or self.request.tenant is None:
            return queryset  # Dev mode
        return queryset.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        if not hasattr(self.request, 'tenant') or self.request.tenant is None:
            serializer.save()  # Dev mode
        else:
            serializer.save(tenant=self.request.tenant)


class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [permissions.IsAuthenticated, IsTenantOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["tenant", "is_used", "role"]
    search_fields = ["email", "tenant__name"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not hasattr(self.request, 'tenant') or self.request.tenant is None:
            return queryset  # Dev mode
        return queryset.filter(tenant=self.request.tenant)

    def perform_create(self, serializer):
        if not hasattr(self.request, 'tenant') or self.request.tenant is None:
            serializer.save(invited_by=self.request.user)  # Dev mode
        else:
            serializer.save(tenant=self.request.tenant, invited_by=self.request.user)


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
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    company_name = request.data.get('company_name', '').strip()
    address = request.data.get('address', '').strip()
    invitation_token = request.data.get('invitation_token', '').strip()

    if not email or not password or not first_name or not last_name:
        return Response({'error': 'Email, password, first_name, and last_name are required'}, status=status.HTTP_400_BAD_REQUEST)

    if CustomUser.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

    domain = email.split('@')[1]

    if invitation_token:
        try:
            invitation = Invitation.objects.get(token=invitation_token, is_used=False, expires_at__gt=timezone.now())
            tenant = invitation.tenant
            role = invitation.role
            invitation.is_used = True
            invitation.save()
        except Invitation.DoesNotExist:
            return Response({'error': 'Invalid or expired invitation'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        if not company_name:
            return Response({'error': 'Company name required for new tenant'}, status=status.HTTP_400_BAD_REQUEST)
        if Tenant.objects.filter(domain=domain).exists():
            return Response({'error': 'Domain already in use'}, status=status.HTTP_400_BAD_REQUEST)
        tenant = Tenant.objects.create(name=company_name, domain=domain, address=address)
        role = 'Tenant Owner'

    user = CustomUser.objects.create_user(email=email, password=password)
    user.first_name = first_name
    user.last_name = last_name
    user.save()
    is_approved = True if role == 'Tenant Owner' else False
    UserTenant.objects.create(user=user, tenant=tenant, is_owner=(role == 'Tenant Owner'), is_approved=is_approved, role=role)

    # Assign group only if approved
    if is_approved:
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
def approve_member_view(request):
    if not hasattr(request, 'tenant') or not request.tenant:
        return Response({'error': 'Tenant context required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if user is owner
    try:
        user_tenant = UserTenant.objects.get(user=request.user, tenant=request.tenant, is_owner=True)
    except UserTenant.DoesNotExist:
        return Response({'error': 'Only owners can approve members'}, status=status.HTTP_403_FORBIDDEN)

    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        member_user_tenant = UserTenant.objects.get(user_id=user_id, tenant=request.tenant, is_owner=False, is_approved=False)
    except UserTenant.DoesNotExist:
        return Response({'error': 'Pending member not found'}, status=status.HTTP_404_NOT_FOUND)

    member_user_tenant.is_approved = True
    member_user_tenant.save()

    # Assign group
    from django.contrib.auth.models import Group
    group, _ = Group.objects.get_or_create(name=member_user_tenant.role)
    member_user_tenant.user.groups.add(group)

    return Response({'message': 'Member approved and added to group'})


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

    # Send invitation email
    from django.core.mail import send_mail
    from django.urls import reverse
    from django.conf import settings

    subject = f"Invitation to join {request.tenant.name}"
    invitation_url = f"{settings.SITE_URL or 'http://127.0.0.1:8000'}/api/signup/?token={token}"
    message = f"""
    You have been invited to join {request.tenant.name} as a {role}.

    Click the link below to accept the invitation and create your account:

    {invitation_url}

    This invitation expires on {expires_at.date()}.

    If you did not expect this invitation, please ignore this email.
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'message': 'Invitation sent successfully', 'token': token})
    except Exception as e:
        return Response({'error': f'Failed to send invitation email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


