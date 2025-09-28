from rest_framework import serializers
from .models import Tenant, Client, Project, Milestone, Sprint, Task, Invoice, Payment

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

    class Meta:
        model = Project
        fields = ['id', 'name', 'client', 'client_name', 'status', 'priority', 'start_date', 'end_date', 'budget', 'description', 'tags', 'team_members', 'access_groups', 'milestones_count', 'created_at']

    def get_milestones_count(self, obj):
        return obj.milestones.count()

class MilestoneSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    sprints_count = serializers.SerializerMethodField()

    class Meta:
        model = Milestone
        fields = ['id', 'name', 'description', 'status', 'planned_start', 'actual_start', 'due_date', 'assignee', 'progress', 'project', 'project_name', 'sprints_count', 'created_at']

    def get_sprints_count(self, obj):
        return obj.sprints.count()

class SprintSerializer(serializers.ModelSerializer):
    milestone_name = serializers.CharField(source='milestone.name', read_only=True)
    tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Sprint
        fields = ['id', 'name', 'status', 'start_date', 'end_date', 'milestone', 'milestone_name', 'tasks_count', 'created_at']

    def get_tasks_count(self, obj):
        return obj.tasks.count()

class TaskSerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'sprint', 'sprint_name', 'assignee', 'created_at', 'updated_at']

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