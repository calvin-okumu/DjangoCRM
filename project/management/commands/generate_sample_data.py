from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Group
from project.models import Organization, Client, Project, Milestone, Sprint, Task, Invoice, Payment
from project.factories import (
    OrganizationFactory, ClientFactory,
    ProjectFactory, MilestoneFactory, SprintFactory, TaskFactory,
    InvoiceFactory, PaymentFactory
)

class Command(BaseCommand):
    help = 'Generate sample data for CRM using factory-boy'

    def handle(self, *args, **options):
        self.stdout.write('Generating sample data...')

        # Create or get groups
        group_names = ['Client Management Administrators', 'Business Strategy Administrators', 'API Control Administrators', 'Product Measurement Administrators']
        groups = []
        for name in group_names:
            group, created = Group.objects.get_or_create(name=name)
            groups.append(group)
        self.stdout.write(f'Ensured {len(groups)} groups exist')

        # Create users with groups
        users = []
        for i in range(5):
            username = f'user{i+1}'
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'user{i+1}@example.com',
                    'first_name': f'User{i+1}',
                    'last_name': 'Test'
                }
            )
            if created:
                user.set_password('password123')
                user.save()
            user.groups.add(groups[i % len(groups)])  # Cycle through groups
            users.append(user)
        self.stdout.write(f'Ensured {len(users)} users exist')

        # Create organizations if not exist
        if Organization.objects.count() < 3:
            orgs = OrganizationFactory.create_batch(3 - Organization.objects.count())
            self.stdout.write(f'Created {len(orgs)} organizations')
        else:
            self.stdout.write('Organizations already exist')

        # Create clients if not exist
        if Client.objects.count() < 6:
            clients = ClientFactory.create_batch(6 - Client.objects.count())
            self.stdout.write(f'Created {len(clients)} clients')
        else:
            self.stdout.write('Clients already exist')

        # Create projects if not exist
        if Project.objects.count() < 6:
            projects = ProjectFactory.create_batch(6 - Project.objects.count())
            self.stdout.write(f'Created {len(projects)} projects')
        else:
            self.stdout.write('Projects already exist')

        # Create milestones if not exist
        if Milestone.objects.count() < 10:
            milestones = MilestoneFactory.create_batch(10 - Milestone.objects.count())
            self.stdout.write(f'Created {len(milestones)} milestones')
        else:
            self.stdout.write('Milestones already exist')

        # Create sprints if not exist
        if Sprint.objects.count() < 15:
            sprints = SprintFactory.create_batch(15 - Sprint.objects.count())
            self.stdout.write(f'Created {len(sprints)} sprints')
        else:
            self.stdout.write('Sprints already exist')

        # Create tasks if not exist
        if Task.objects.count() < 50:
            tasks = TaskFactory.create_batch(50 - Task.objects.count())
            self.stdout.write(f'Created {len(tasks)} tasks')
        else:
            self.stdout.write('Tasks already exist')

        # Create invoices if not exist
        if Invoice.objects.count() < 10:
            invoices = InvoiceFactory.create_batch(10 - Invoice.objects.count())
            self.stdout.write(f'Created {len(invoices)} invoices')
        else:
            self.stdout.write('Invoices already exist')

        # Create payments if not exist
        if Payment.objects.count() < 10:
            payments = PaymentFactory.create_batch(10 - Payment.objects.count())
            self.stdout.write(f'Created {len(payments)} payments')
        else:
            self.stdout.write('Payments already exist')

        self.stdout.write(self.style.SUCCESS('Sample data generated successfully!'))