from django.db import models
from django.contrib.auth.models import AbstractUser, Group, BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_set',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email


class Tenant(models.Model):
    name = models.CharField(max_length=255, unique=True)
    domain = models.CharField(max_length=255, unique=True, default='')
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class UserTenant(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    is_owner = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)  # Default True for owners, False for invited members
    role = models.CharField(max_length=100, default='Employee')

    def __str__(self):
        return f"{self.user.email} - {self.tenant.name}"


class Invitation(models.Model):
    email = models.EmailField()
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    token = models.CharField(max_length=64, unique=True)
    role = models.CharField(max_length=100, default='Employee')  # e.g., 'Employee', 'Manager'
    invited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Invite {self.email} to {self.tenant.name}"


class Client(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("prospect", "Prospect"),
    ]
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="prospect")
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="clients"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Project(models.Model):
    STATUS_CHOICES = [
        ("planning", "Planning"),
        ("active", "Active"),
        ("on_hold", "On Hold"),
        ("completed", "Completed"),
        ("archived", "Archived"),
    ]
    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]
    name = models.CharField(max_length=255)
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="projects"
    )
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="projects"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="planning")
    priority = models.CharField(
        max_length=6, choices=PRIORITY_CHOICES, default="medium"
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )
    description = models.TextField(blank=True)
    tags = models.CharField(max_length=500, blank=True)  # Comma-separated
    team_members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="projects", blank=True)
    access_groups = models.ManyToManyField(Group, related_name="projects", blank=True)
    progress = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError('End date must be after start date.')

    def calculate_progress(self):
        milestones = self.milestones.all()
        if not milestones:
            return 0
        return sum(milestone.calculate_progress() for milestone in milestones) // len(milestones)

    def __str__(self):
        return self.name


class Milestone(models.Model):
    STATUS_CHOICES = [
        ("planning", "Planning"),
        ("active", "Active"),
        ("completed", "Completed"),
    ]
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="planning")
    planned_start = models.DateField(null=True, blank=True)
    actual_start = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="milestones"
    )
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="milestones",
    )
    progress = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )  # 0-100
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="milestones"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.planned_start and self.due_date and self.planned_start >= self.due_date:
            raise ValidationError('Due date must be after planned start date.')
        # Validate dates within project
        if self.project and self.planned_start and self.project.start_date and self.planned_start < self.project.start_date:
            raise ValidationError('Milestone start date must be after project start date.')
        if self.project and self.due_date and self.project.end_date and self.due_date > self.project.end_date:
            raise ValidationError('Milestone end date must be before project end date.')

    def calculate_progress(self):
        tasks = self.tasks.all()
        if not tasks:
            return 0
        return sum(task.progress for task in tasks) // len(tasks)

    def __str__(self):
        return f"{self.name} ({self.project.name})"


class Sprint(models.Model):
    STATUS_CHOICES = [
        ("planned", "Planned"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("canceled", "Canceled"),
    ]
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="planned")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="sprints"
    )
    milestone = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, related_name="sprints"
    )
    progress = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError('End date must be after start date.')
        # Validate dates within milestone
        if self.milestone and self.start_date and self.milestone.planned_start and self.start_date < self.milestone.planned_start:
            raise ValidationError('Sprint start date must be after milestone start date.')
        if self.milestone and self.end_date and self.milestone.due_date and self.end_date > self.milestone.due_date:
            raise ValidationError('Sprint end date must be before milestone end date.')

    def calculate_progress(self):
        tasks = self.tasks.all()
        if not tasks:
            return 0
        return sum(task.progress for task in tasks) // len(tasks)

    def __str__(self):
        return f"{self.name} ({self.milestone.name})"


class Task(models.Model):
    STATUS_CHOICES = [
        ("backlog", "Backlog"),
        ("to_do", "To Do"),
        ("in_progress", "In Progress"),
        ("in_review", "In Review"),
        ("done", "Done"),
    ]
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="backlog")
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="tasks"
    )
    milestone = models.ForeignKey(
        Milestone, on_delete=models.CASCADE, related_name="tasks"
    )
    sprint = models.ForeignKey(Sprint, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks")
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    estimated_hours = models.PositiveIntegerField(null=True, blank=True, help_text="Approximate hours expected")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.start_date and self.end_date and self.start_date >= self.end_date:
            raise ValidationError('End date must be after start date.')
        if self.sprint and self.sprint.milestone != self.milestone:
            raise ValidationError('Task milestone must match sprint milestone.')
        # Validate dates within milestone
        if self.milestone and self.start_date and self.milestone.planned_start and self.start_date < self.milestone.planned_start:
            raise ValidationError('Task start date must be after milestone start date.')
        if self.milestone and self.end_date and self.milestone.due_date and self.end_date > self.milestone.due_date:
            raise ValidationError('Task end date must be before milestone end date.')

    @property
    def progress(self):
        status_weights = {
            'backlog': 0,
            'to_do': 10,
            'in_progress': 50,
            'in_review': 90,
            'done': 100
        }
        return status_weights.get(self.status, 0)

    def __str__(self):
        return self.title


# Financial models
class Invoice(models.Model):
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="invoices"
    )
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="invoices"
    )
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    issued_at = models.DateTimeField(auto_now_add=True)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Invoice {self.id or 'Unsaved'} - {self.client.name}"


class Payment(models.Model):
    tenant = models.ForeignKey(
        Tenant, on_delete=models.CASCADE, related_name="payments"
    )
    invoice = models.ForeignKey(
        Invoice, on_delete=models.CASCADE, related_name="payments"
    )
    amount = models.DecimalField(
        max_digits=12, decimal_places=2, validators=[MinValueValidator(0)]
    )
    paid_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id or 'Unsaved'} for Invoice {self.invoice.id or 'Unsaved'}"

