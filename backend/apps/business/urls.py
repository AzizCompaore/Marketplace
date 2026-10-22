from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteRequestViewSet, BusinessAccountViewSet

router = DefaultRouter()
router.register('quotes', QuoteRequestViewSet, basename='quote')
router.register('accounts', BusinessAccountViewSet, basename='business-account')

urlpatterns = [
    path('', include(router.urls)),
]
