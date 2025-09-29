import factory
from datetime import timedelta
from faker import Faker
from django.contrib.auth.models import Group
from .models import CustomUser, Client, Project, Milestone, Sprint, Task, Invoice, Payment
from accounts.models import Tenant, UserTenant

fake = Faker()

class GroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Group
    name = factory.Iterator(['Client Management Administrators', 'Business Strategy Administrators', 'API Control Administrators', 'Product Measurement Administrators', 'Employees', 'Tenant Owners'])

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CustomUser
    email = factory.Faker('email')
    username = factory.SelfAttribute('email')  # Since USERNAME_FIELD='email'
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    password = factory.PostGenerationMethodCall('set_password', 'password123')

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for group in extracted:
                self.groups.add(group)

class TenantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Tenant
    name = factory.Faker('company')
    domain = factory.Sequence(lambda n: f'tenant{n}.example.com')
    address = factory.Faker('address')

class ClientFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Client
    name = factory.Faker('name')
    email = factory.Faker('email')
    phone = factory.LazyFunction(lambda: fake.phone_number()[:20])
    status = factory.Iterator(['active', 'inactive', 'prospect'])
    tenant = factory.Iterator(Tenant.objects.all())

class ProjectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Project
    name = factory.LazyFunction(lambda: fake.sentence(nb_words=3)[:255])
    client = factory.Iterator(Client.objects.all())
    tenant = factory.SelfAttribute('client.tenant')
    status = factory.Iterator(['planning', 'active', 'completed'])
    priority = factory.Iterator(['low', 'medium', 'high'])
    start_date = factory.Faker('date_this_year')
    end_date = factory.LazyAttribute(lambda obj: obj.start_date + timedelta(days=30) if obj.start_date else None)
    budget = factory.Faker('random_int', min=10000, max=100000)
    description = factory.LazyFunction(lambda: Faker().text()[:500])
    tags = factory.LazyFunction(lambda: ','.join(fake.words(nb=3))[:500])

class MilestoneFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Milestone
    name = factory.LazyFunction(lambda: fake.sentence(nb_words=2)[:255])
    description = factory.LazyFunction(lambda: fake.text(max_nb_chars=200))
    status = factory.Iterator(['planning', 'active', 'completed'])
    planned_start = factory.LazyAttribute(lambda obj: obj.project.start_date + timedelta(days=1) if obj.project.start_date else factory.Faker('date_this_year'))
    due_date = factory.LazyAttribute(lambda obj: obj.planned_start + timedelta(days=14) if obj.planned_start else None)
    progress = factory.Faker('random_int', min=0, max=100)
    project = factory.Iterator(Project.objects.all())
    tenant = factory.SelfAttribute('project.tenant')
    assignee = factory.SubFactory(UserFactory)

class SprintFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Sprint
    name = factory.LazyFunction(lambda: fake.sentence(nb_words=2)[:255])
    status = factory.Iterator(['planned', 'active', 'completed'])
    milestone = factory.Iterator(Milestone.objects.all())
    tenant = factory.SelfAttribute('milestone.tenant')
    start_date = factory.LazyAttribute(lambda obj: obj.milestone.planned_start + timedelta(days=1) if obj.milestone.planned_start else factory.Faker('date_this_year'))
    end_date = factory.LazyAttribute(lambda obj: obj.start_date + timedelta(days=7) if obj.start_date else None)

class TaskFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Task
    title = factory.LazyFunction(lambda: fake.sentence(nb_words=4)[:255])
    description = factory.LazyFunction(lambda: fake.text(max_nb_chars=200))
    status = factory.Iterator(['backlog', 'to_do', 'in_progress', 'in_review', 'done'])
    milestone = factory.Iterator(Milestone.objects.all())
    tenant = factory.SelfAttribute('milestone.tenant')
    sprint = None  # Optional, can be assigned later
    assignee = factory.SubFactory(UserFactory)
    start_date = factory.LazyAttribute(lambda obj: obj.milestone.planned_start + timedelta(days=1) if obj.milestone.planned_start else factory.Faker('date_this_year'))
    end_date = factory.LazyAttribute(lambda obj: obj.start_date + timedelta(days=3) if obj.start_date else None)
    estimated_hours = factory.Faker('random_int', min=1, max=40)

class InvoiceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Invoice
    tenant = factory.SelfAttribute('client.tenant')
    client = factory.SubFactory(ClientFactory)
    project = factory.SubFactory(ProjectFactory)
    amount = factory.Faker('random_int', min=1000, max=50000)
    issued_at = factory.Faker('date_this_year')
    paid = factory.Faker('boolean')

class PaymentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Payment
    tenant = factory.SelfAttribute('invoice.tenant')
    invoice = factory.SubFactory(InvoiceFactory)
    amount = factory.SelfAttribute('invoice.amount')
    paid_at = factory.Faker('date_this_year')

class UserTenantFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = UserTenant
    user = factory.SubFactory(UserFactory)
    tenant = factory.SubFactory(TenantFactory)
    is_owner = factory.Faker('boolean')
    is_approved = factory.LazyAttribute(lambda obj: True if obj.is_owner else factory.Faker('boolean')())
    role = factory.Iterator(['Employee', 'Manager', 'Tenant Owner'])