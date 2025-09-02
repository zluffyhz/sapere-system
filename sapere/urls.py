"""
Main URL Configuration for Sapere Clinic Management System
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Redirect root to dashboard
    path('', RedirectView.as_view(pattern_name='dashboard:home', permanent=False)),
    
    # Authentication
    path('auth/', include('sapere.apps.authentication.urls')),
    
    # Core apps
    path('dashboard/', include('sapere.apps.dashboard.urls')),
    path('patients/', include('sapere.apps.patients.urls')),
    path('appointments/', include('sapere.apps.appointments.urls')),
    path('anamnesis/', include('sapere.apps.anamnesis.urls')),
    path('sessions/', include('sapere.apps.sessions.urls')),
    path('reports/', include('sapere.apps.reports.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Admin site configuration
admin.site.site_header = "Clínica Sapere - Administração"
admin.site.site_title = "Sapere Admin"
admin.site.index_title = "Sistema de Gestão Clínica"