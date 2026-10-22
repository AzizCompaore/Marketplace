from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UniverseViewSet, CategoryViewSet, ProductViewSet, WholesaleCalculatorAPIView

router = DefaultRouter()
router.register('universes', UniverseViewSet, basename='universe')
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')

urlpatterns = [
    path('wholesale/calculate/', WholesaleCalculatorAPIView.as_view(), name='wholesale-calculate'),
    path('', include(router.urls)),
]
