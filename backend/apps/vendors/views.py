from rest_framework import viewsets, filters
from .models import VendorProfile
from .serializers import VendorProfileSerializer

class VendorProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VendorProfile.objects.all()
    serializer_class = VendorProfileSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['store_name', 'city', 'neighborhood', 'description']
    ordering_fields = ['rating', 'sales_count', 'created_at']
