from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import ImproperlyConfigured
from .models import Tenant, UserTenant
from django.http import Http404


class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip middleware for management commands or non-HTTP requests
        if not hasattr(request, 'get_host'):
            return

        # For development, set tenant to None (will be handled by views)
        request.tenant = None