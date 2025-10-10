from rest_framework import permissions

from accounts.models import UserTenant


class IsClientManager(permissions.BasePermission):
    """
    Allow access only to users in 'Client Management Administrators' group.
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name='Client Management Administrators').exists()

class IsProjectManager(permissions.BasePermission):
    """
    Allow access only to users in 'Business Strategy Administrators' or 'Product Measurement Administrators' groups.
    """
    def has_permission(self, request, view):
        allowed_groups = ['Business Strategy Administrators', 'Product Measurement Administrators']
        return request.user.groups.filter(name__in=allowed_groups).exists()

class IsAPIManager(permissions.BasePermission):
    """
    Allow access only to users in 'API Control Administrators' group.
    """
    def has_permission(self, request, view):
        return request.user.groups.filter(name='API Control Administrators').exists()


class IsTenantOwner(permissions.BasePermission):
    """
    Allow access only if the user is the owner of the current tenant.
    In development (no tenant), allow all.
    """
    def has_permission(self, request, view):
        if not hasattr(request, 'tenant') or request.tenant is None:
            return True  # Allow in dev
        return UserTenant.objects.filter(user=request.user, tenant=request.tenant, is_owner=True).exists()

    def has_object_permission(self, request, view, obj):
        if not hasattr(request, 'tenant') or request.tenant is None:
            return True  # Allow in dev
        return hasattr(obj, 'tenant') and obj.tenant == request.tenant

# Add more as needed for other roles