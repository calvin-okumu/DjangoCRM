from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from project.models import Client, Project, Task

class Command(BaseCommand):
    help = 'Setup default groups with appropriate permissions'

    def handle(self, *args, **options):
        # Create groups if they don't exist
        groups_permissions = {
            'Tenant Owners': [
                'add_tenant', 'change_tenant', 'delete_tenant',
                'add_user', 'change_user', 'delete_user',
                # Add all project permissions
            ],
            'Project Managers': [
                'add_project', 'change_project', 'view_project',
                'add_task', 'change_task', 'view_task',
                'add_client', 'change_client', 'view_client',
            ],
            'Employees': [
                'view_project', 'view_task', 'view_client',
                'change_task',  # Only assigned tasks
            ],
            'Clients': [
                'view_project', 'view_invoice', 'view_payment',
            ],
        }

        for group_name, perms in groups_permissions.items():
            group, created = Group.objects.get_or_create(name=group_name)
            if created:
                self.stdout.write(f'Created group: {group_name}')

            # Assign permissions (simplified - would need actual permission codenames)
            for perm in perms:
                try:
                    permission = Permission.objects.get(codename=perm)
                    group.permissions.add(permission)
                except Permission.DoesNotExist:
                    self.stdout.write(f'Warning: Permission {perm} not found')

        self.stdout.write(self.style.SUCCESS('Default groups setup complete'))