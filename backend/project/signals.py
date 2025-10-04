from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Task, Milestone, Sprint, Project

@receiver([post_save, post_delete], sender=Task)
def update_progress_on_task_change(sender, instance, **kwargs):
    """
    Update progress for sprint, milestone, and project when task changes.
    """
    # Update sprint progress
    if instance.sprint:
        instance.sprint.progress = instance.sprint.calculate_progress()
        instance.sprint.save(update_fields=['progress'])

    # Update milestone progress
    instance.milestone.progress = instance.milestone.calculate_progress()
    instance.milestone.save(update_fields=['progress'])

    # Update project progress
    instance.milestone.project.progress = instance.milestone.project.calculate_progress()
    instance.milestone.project.save(update_fields=['progress'])

@receiver(pre_save, sender=Sprint)
def notify_sprint_status_change(sender, instance, **kwargs):
    """
    Send notification when sprint status changes to 'completed'.
    """
    if instance.pk:  # Existing instance
        old_instance = Sprint.objects.get(pk=instance.pk)
        if old_instance.status != 'completed' and instance.status == 'completed':
            # Send email notification (if email configured)
            if hasattr(settings, 'EMAIL_HOST'):
                send_mail(
                    'Sprint Completed',
                    f'Sprint "{instance.name}" has been completed.',
                    settings.DEFAULT_FROM_EMAIL,
                    [instance.milestone.assignee.email if instance.milestone.assignee else 'admin@example.com'],
                    fail_silently=True,
                )
            else:
                print(f"Notification: Sprint '{instance.name}' completed.")  # Fallback for dev

@receiver(post_save, sender=Milestone)
def notify_milestone_due(sender, instance, created, **kwargs):
    """
    Notify assignee if milestone is approaching due date (basic check).
    """
    if not created and instance.due_date:
        # Simple check: if due in 3 days (in real app, use celery for scheduling)
        from datetime import datetime, timedelta
        if instance.due_date - datetime.now().date() <= timedelta(days=3):
            print(f"Notification: Milestone '{instance.name}' is due soon.")  # Or send email

# Add more signals as needed for project status, etc.