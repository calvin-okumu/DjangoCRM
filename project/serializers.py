from rest_framework import serializers
from .models import Client, Project, Milestone, Sprint, Task, Invoice, Payment
from accounts.models import Tenant, CustomUser, UserTenant, Invitation

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = '__all__'

class ClientSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    projects_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'phone', 'status', 'tenant', 'tenant_name', 'projects_count', 'created_at', 'updated_at']

    def get_projects_count(self, obj):
        return obj.projects.count()

class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    milestones_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'client', 'client_name', 'status', 'priority', 'start_date', 'end_date', 'budget', 'description', 'tags', 'team_members', 'access_groups', 'milestones_count', 'progress', 'created_at']

    def get_progress(self, obj):
        return obj.calculate_progress()

    def get_milestones_count(self, obj):
        return obj.milestones.count()

class MilestoneSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    sprints_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Milestone
        fields = ['id', 'name', 'description', 'status', 'planned_start', 'actual_start', 'due_date', 'assignee', 'progress', 'project', 'project_name', 'sprints_count', 'created_at']

    def get_progress(self, obj):
        return obj.calculate_progress()

    def get_sprints_count(self, obj):
        return obj.sprints.count()

class SprintSerializer(serializers.ModelSerializer):
    milestone_name = serializers.CharField(source='milestone.name', read_only=True)
    tasks_count = serializers.SerializerMethodField()
    progress = serializers.ReadOnlyField()

    class Meta:
        model = Sprint
        fields = ['id', 'name', 'status', 'start_date', 'end_date', 'milestone', 'milestone_name', 'tasks_count', 'progress', 'created_at']

    def get_tasks_count(self, obj):
        return obj.tasks.count()

class TaskSerializer(serializers.ModelSerializer):
    milestone_name = serializers.CharField(source='milestone.name', read_only=True)
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    progress = serializers.ReadOnlyField()

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'milestone', 'milestone_name', 'sprint', 'sprint_name', 'assignee', 'start_date', 'end_date', 'estimated_hours', 'tenant', 'progress', 'created_at', 'updated_at']

class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'client', 'client_name', 'project', 'amount', 'issued_at', 'paid']

class PaymentSerializer(serializers.ModelSerializer):
    invoice_id = serializers.IntegerField(source='invoice.id', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'invoice', 'invoice_id', 'amount', 'paid_at']


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'first_name', 'last_name', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserTenantSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = UserTenant
        fields = ['id', 'user', 'user_email', 'user_first_name', 'user_last_name', 'tenant', 'tenant_name', 'is_owner', 'is_approved', 'role']


class InvitationSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    invited_by_email = serializers.CharField(source='invited_by.email', read_only=True)

    class Meta:
        model = Invitation
        fields = ['id', 'email', 'tenant', 'tenant_name', 'token', 'role', 'invited_by', 'invited_by_email', 'created_at', 'expires_at', 'is_used']