from rest_framework import serializers
from .models import Universe, Category, Product, ProductImage
from .services import calculate_wholesale_tier, generate_wholesale_tiers_table

class UniverseSerializer(serializers.ModelSerializer):
    categories_count = serializers.IntegerField(source='categories.count', read_only=True)

    class Meta:
        model = Universe
        fields = ['id', 'code', 'name', 'description', 'icon_name', 'order', 'categories_count']


class CategorySerializer(serializers.ModelSerializer):
    universe_name = serializers.CharField(source='universe.name', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'universe', 'universe_name', 'parent', 'name', 'slug', 'icon']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.store_name', read_only=True)
    universe_name = serializers.CharField(source='universe.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'base_price', 'is_wholesale_eligible',
            'stock_quantity', 'unit_measure', 'origin', 'main_image_url',
            'has_3d_model', 'rating', 'reviews_count', 'commercial_space',
            'is_adult_restricted', 'vendor_name', 'universe_name', 'category_name'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.store_name', read_only=True)
    vendor_city = serializers.CharField(source='vendor.city', read_only=True)
    vendor_rating = serializers.FloatField(source='vendor.rating', read_only=True)
    gallery_images = ProductImageSerializer(many=True, read_only=True)
    wholesale_tiers_table = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_wholesale_tiers_table(self, obj):
        if not obj.is_wholesale_eligible:
            return []
        return generate_wholesale_tiers_table(
            base_unit_price=float(obj.base_price),
            max_units=60,
            step=10,
            max_discount_pct=float(obj.max_wholesale_discount)
        )


class WholesaleCalculationRequestSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False)
    base_unit_price = serializers.FloatField(min_value=0.0)
    quantity = serializers.IntegerField(min_value=1)
    max_discount_pct = serializers.FloatField(default=50.0, min_value=0.0, max_value=90.0)
