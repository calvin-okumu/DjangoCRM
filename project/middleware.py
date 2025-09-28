from django.utils.deprecation import MiddlewareMixin
from django.core.exceptions import ImproperlyConfigured
from .models import Tenant, UserTenant
from django.http import Http404
from django.shortcuts import redirect


class TenantMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Skip middleware for management commands or non-HTTP requests
        if not hasattr(request, 'get_host'):
            return

        host = request.get_host().split(':')[0]  # Remove port

        # Skip tenant lookup for local development
        if host in ['127.0.0.1', 'localhost']:
            request.tenant = None
            return

        subdomain = host.split('.')[0] if '.' in host else None

        if subdomain:
            try:
                tenant = Tenant.objects.get(domain=subdomain)
                request.tenant = tenant
            except Tenant.DoesNotExist:
                # Invalid subdomain, redirect to main site or error
                raise Http404("Tenant not found")
        else:
            # No subdomain, perhaps public pages or login
            request.tenant = None