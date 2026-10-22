from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VendorProfileViewSet

router = DefaultRouter()
router.register('', VendorProfileViewSet, basename='vendor')

urlpatterns = [
    path('', include(router.urls)),
]
