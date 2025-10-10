from django.apps import AppConfig


class ProjectConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'project'

    def ready(self):
        import accounts.signals  # Connect accounts signals
        import project.signals  # Connect signals when app is ready