"""
URL configuration for g_marketplace project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # OpenAPI schema & Swagger docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Marketplace REST API endpoints
    path('api/v1/catalog/', include('apps.catalog.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/vendors/', include('apps.vendors.urls')),
    path('api/v1/business/', include('apps.business.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
