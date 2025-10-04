from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import UserTenant


@receiver(post_save, sender=UserTenant)
def assign_default_group(sender, instance, created, **kwargs):
    """Assign default group when UserTenant is created and approved"""
    if created and instance.is_approved:
        group_name = 'Tenant Owners' if instance.is_owner else 'Employees'
        try:
            group = Group.objects.get(name=group_name)
            instance.user.groups.add(group)
        except Group.DoesNotExist:
            # Fallback: create group if it doesn't exist
            group, created = Group.objects.get_or_create(name=group_name)
            instance.user.groups.add(group)