import factory
from faker import Faker
from django.contrib.auth.models import User, Group
from .models import Tenant, Client, Project, Milestone, Sprint, Task, Invoice, Payment

fake = Faker()

class GroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Group
    name = factory.Iterator(['Client Management Administrators', 'Business Strategy Administrators', 'API Control Administrators', 'Product Measurement Administrators'])

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Faker('user_name')
    email = factory.Faker('email')
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
    address = factory.Faker('address')

class ClientFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Client
    name = factory.Faker('name')
    email = factory.Faker('email')
    phone = factory.LazyFunction(lambda: fake.phone_number()[:20])
    status = factory.Iterator(['active', 'inactive', 'prospect'])
    tenant = factory.SubFactory(TenantFactory)

class ProjectFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Project
    name = factory.LazyFunction(lambda: fake.sentence(nb_words=3)[:255])
    tenant = factory.SelfAttribute('client.tenant')
    client = factory.SubFactory(ClientFactory)
    status = factory.Iterator(['planning', 'active', 'completed'])
    priority = factory.Iterator(['low', 'medium', 'high'])
    start_date = factory.Faker('date_this_year')
    end_date = factory.Faker('date_this_year')
    budget = factory.Faker('random_int', min=10000, max=100000)
    description = factory.LazyFunction(lambda: Faker().text()[:500])
    tags = factory.LazyFunction(lambda: ','.join(fake.words(nb=3))[:500])

class MilestoneFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Milestone
    name = factory.LazyFunction(lambda: fake.sentence(nb_words=2)[:255])
    description = factory.LazyFunction(lambda: fake.text(max_nb_chars=200))
    status = factory.Iterator(['planning', 'active', 'completed'])
    planned_start = factory.Faker('date_this_year')
    due_date = factory.Faker('date_this_year')
    progress = factory.Faker('random_int', min=0, max=100)
    tenant = factory.SelfAttribute('project.tenant')
    project = factory.SubFactory(ProjectFactory)
    assignee = factory.SubFactory(UserFactory)

class SprintFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Sprint
    name = factory.LazyFunction(lambda: fake.sentence(nb_words=2)[:255])
    status = factory.Iterator(['planned', 'active', 'completed'])
    start_date = factory.Faker('date_this_year')
    end_date = factory.Faker('date_this_year')
    tenant = factory.SelfAttribute('milestone.tenant')
    milestone = factory.SubFactory(MilestoneFactory)

class TaskFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Task
    title = factory.LazyFunction(lambda: fake.sentence(nb_words=4)[:255])
    description = factory.LazyFunction(lambda: fake.text(max_nb_chars=200))
    status = factory.Iterator(['backlog', 'to_do', 'in_progress', 'in_review', 'done'])
    tenant = factory.SelfAttribute('sprint.tenant')
    sprint = factory.SubFactory(SprintFactory)
    assignee = factory.SubFactory(UserFactory)

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