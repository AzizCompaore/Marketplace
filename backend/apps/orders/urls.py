from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, SubOrderViewSet

router = DefaultRouter()
router.register('orders', OrderViewSet, basename='order')
router.register('vendor-suborders', SubOrderViewSet, basename='vendor-suborder')

urlpatterns = [
    path('', include(router.urls)),
]
