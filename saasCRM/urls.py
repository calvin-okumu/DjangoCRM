from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from project.views import OrganizationViewSet, ClientViewSet, ProjectViewSet, MilestoneViewSet, SprintViewSet, TaskViewSet, InvoiceViewSet, PaymentViewSet, login_view, auth_methods_view

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet)
router.register(r'clients', ClientViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'milestones', MilestoneViewSet)
router.register(r'sprints', SprintViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('api-token-auth/', obtain_auth_token),
    path('api/login/', login_view, name='api_login'),
    path('api/auth-methods/', auth_methods_view, name='auth_methods'),
    path('accounts/', include('allauth.urls')),
]
