class DBRouter:
    """
    A router to control all database operations on models in the
    accounts and project applications.
    """

    def db_for_read(self, model, **hints):
        """
        Attempts to read accounts models go to users db.
        """
        if model._meta.app_label == 'accounts':
            return 'default'
        elif model._meta.app_label == 'project':
            return 'projects'
        return None

    def db_for_write(self, model, **hints):
        """
        Attempts to write accounts models go to users db.
        """
        if model._meta.app_label == 'accounts':
            return 'default'
        elif model._meta.app_label == 'project':
            return 'projects'
        return None

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the accounts app is involved.
        """
        if obj1._meta.app_label == 'accounts' or obj2._meta.app_label == 'accounts':
            return True
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the accounts app only appears in the 'default' database
        and project app only in 'projects' database.
        """
        if app_label == 'accounts':
            return db == 'default'
        elif app_label == 'project':
            return db == 'projects'
        return None