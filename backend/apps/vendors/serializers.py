from rest_framework import serializers
from .models import VendorProfile

class VendorProfileSerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = VendorProfile
        fields = [
            'id', 'store_name', 'slug', 'city', 'neighborhood',
            'phone_number', 'email', 'banner_url', 'logo_url',
            'description', 'is_verified', 'kyc_status', 'rating',
            'sales_count', 'products_count', 'created_at'
        ]
