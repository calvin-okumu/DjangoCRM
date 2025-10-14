# Generated manually to assign permissions to default groups

from django.db import migrations
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

from accounts.models import CustomUser, Invitation, Tenant, UserTenant
from project.models import Client, Invoice, Milestone, Payment, Project, Sprint, Task


def assign_group_permissions(apps, schema_editor):
    """Assign appropriate permissions to default groups"""

    # Define permission sets for each group
    groups_permissions = {
        'Tenant Owners': {
            # All permissions for all models except tenant creation
            'accounts': ['change_tenant', 'delete_tenant', 'view_tenant',
                        'add_customuser', 'change_customuser', 'delete_customuser', 'view_customuser',
                        'add_usertenant', 'change_usertenant', 'delete_usertenant', 'view_usertenant',
                        'add_invitation', 'change_invitation', 'delete_invitation', 'view_invitation'],
            'project': ['add_client', 'change_client', 'delete_client', 'view_client',
                      'add_project', 'change_project', 'delete_project', 'view_project',
                      'add_milestone', 'change_milestone', 'delete_milestone', 'view_milestone',
                      'add_sprint', 'change_sprint', 'delete_sprint', 'view_sprint',
                      'add_task', 'change_task', 'delete_task', 'view_task',
                      'add_invoice', 'change_invoice', 'delete_invoice', 'view_invoice',
                      'add_payment', 'change_payment', 'delete_payment', 'view_payment']
        },
        'Project Managers': {
            'project': ['add_client', 'change_client', 'view_client',
                      'add_project', 'change_project', 'view_project',
                      'add_milestone', 'change_milestone', 'view_milestone',
                      'add_sprint', 'change_sprint', 'view_sprint',
                      'add_task', 'change_task', 'view_task']
        },
        'Employees': {
            'project': ['view_client', 'view_project', 'view_milestone', 'view_sprint',
                      'view_task', 'change_task']  # Can change assigned tasks
        },
        'Clients': {
            'project': ['view_project', 'view_invoice', 'view_payment']
        },
        'Administrators': {
            # All permissions (same as Tenant Owners)
            'accounts': ['add_tenant', 'change_tenant', 'delete_tenant', 'view_tenant',
                       'add_customuser', 'change_customuser', 'delete_customuser', 'view_customuser',
                       'add_usertenant', 'change_usertenant', 'delete_usertenant', 'view_usertenant',
                       'add_invitation', 'change_invitation', 'delete_invitation', 'view_invitation'],
            'project': ['add_client', 'change_client', 'delete_client', 'view_client',
                      'add_project', 'change_project', 'delete_project', 'view_project',
                      'add_milestone', 'change_milestone', 'delete_milestone', 'view_milestone',
                      'add_sprint', 'change_sprint', 'delete_sprint', 'view_sprint',
                      'add_task', 'change_task', 'delete_task', 'view_task',
                      'add_invoice', 'change_invoice', 'delete_invoice', 'view_invoice',
                      'add_payment', 'change_payment', 'delete_payment', 'view_payment']
        }
    }

    # Model to app mapping for getting content types
    model_app_map = {
        'Tenant': ('accounts', Tenant),
        'CustomUser': ('accounts', CustomUser),
        'UserTenant': ('accounts', UserTenant),
        'Invitation': ('accounts', Invitation),
        'Client': ('project', Client),
        'Project': ('project', Project),
        'Milestone': ('project', Milestone),
        'Sprint': ('project', Sprint),
        'Task': ('project', Task),
        'Invoice': ('project', Invoice),
        'Payment': ('project', Payment),
    }

    for group_name, app_perms in groups_permissions.items():
        try:
            group = Group.objects.get(name=group_name)
            # Clear existing permissions
            group.permissions.clear()

            # Assign permissions
            for app_label, perms in app_perms.items():
                for perm_codename in perms:
                    try:
                        # Extract model name from codename (e.g., 'add_client' -> 'client')
                        action, model_name = perm_codename.split('_', 1)
                        model_class = None

                        # Find the model class
                        for name, (app, cls) in model_app_map.items():
                            if app == app_label and name.lower() == model_name:
                                model_class = cls
                                break

                        if model_class:
                            content_type = ContentType.objects.get_for_model(model_class)
                            permission = Permission.objects.get(
                                content_type=content_type,
                                codename=perm_codename
                            )
                            group.permissions.add(permission)

                    except (Permission.DoesNotExist, ContentType.DoesNotExist):
                        # Permission might not exist yet, skip
                        pass

        except Group.DoesNotExist:
            # Group doesn't exist, skip
            pass


def remove_group_permissions(apps, schema_editor):
    """Remove permissions from groups (for migration reversal)"""
    groups_names = ['Tenant Owners', 'Project Managers', 'Employees', 'Clients', 'Administrators']

    for group_name in groups_names:
        try:
            group = Group.objects.get(name=group_name)
            group.permissions.clear()
        except Group.DoesNotExist:
            pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_create_default_groups'),
        ('project', '0004_alter_client_phone_alter_client_status_and_more'),  # Ensure project models exist
    ]

    operations = [
        migrations.RunPython(assign_group_permissions, remove_group_permissions),
    ]