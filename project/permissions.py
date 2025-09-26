from rest_framework import permissions

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

# Add more as needed for other roles