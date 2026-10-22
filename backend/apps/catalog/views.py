from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Universe, Category, Product
from .serializers import (
    UniverseSerializer, CategorySerializer, ProductListSerializer,
    ProductDetailSerializer, WholesaleCalculationRequestSerializer
)
from .services import calculate_wholesale_tier

class UniverseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Universe.objects.all().order_by('order')
    serializer_class = UniverseSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filterset_fields = ['universe', 'parent']


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('vendor', 'universe', 'category')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'vendor__store_name', 'sku']
    ordering_fields = ['base_price', 'rating', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        space = self.request.query_params.get('space')
        if space:
            qs = qs.filter(commercial_space=space)
        universe_id = self.request.query_params.get('universe')
        if universe_id:
            qs = qs.filter(universe_id=universe_id)
        wholesale_only = self.request.query_params.get('wholesale')
        if wholesale_only == 'true':
            qs = qs.filter(is_wholesale_eligible=True)
        return qs

    @action(detail=True, methods=['get'])
    def calculate_price(self, request, pk=None):
        """
        Calcule le prix dégressif pour une quantité donnée d'un produit spécifique.
        """
        product = self.get_object()
        try:
            quantity = int(request.query_params.get('quantity', 1))
        except ValueError:
            quantity = 1

        result = calculate_wholesale_tier(
            quantity=quantity,
            base_unit_price=float(product.base_price),
            max_discount_pct=float(product.max_wholesale_discount)
        )
        return Response(result)


class WholesaleCalculatorAPIView(APIView):
    """
    Simulateur de prix de gros instantané (Cahier des charges V2).
    Permet aux grossistes de simuler les tranches de 10 unités avec remise progressive de 5%.
    """
    def post(self, request):
        serializer = WholesaleCalculationRequestSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            result = calculate_wholesale_tier(
                quantity=data['quantity'],
                base_unit_price=data['base_unit_price'],
                max_discount_pct=data.get('max_discount_pct', 50.0)
            )
            return Response(result, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
