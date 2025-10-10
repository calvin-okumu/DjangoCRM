from django.contrib import admin

from .models import CustomUser, Invitation, Tenant, UserTenant


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "is_staff", "is_active", "date_joined")
    list_filter = ("is_staff", "is_active", "groups")
    search_fields = ("email", "first_name", "last_name")
    filter_horizontal = ("groups", "user_permissions")


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ("name", "address", "created_at")
    search_fields = ("name",)


@admin.register(UserTenant)
class UserTenantAdmin(admin.ModelAdmin):
    list_display = ("user", "tenant", "is_owner", "is_approved", "role")
    list_filter = ("is_owner", "is_approved", "role", "tenant")
    search_fields = ("user__email", "tenant__name")


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ("email", "tenant", "role", "invited_by", "created_at", "is_used")
    list_filter = ("is_used", "role", "tenant")
    search_fields = ("email", "tenant__name")
