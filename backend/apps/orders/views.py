from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Order, SubOrder
from .serializers import OrderDetailSerializer, CreateOrderSerializer, SubOrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('sub_orders__items')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderDetailSerializer


class SubOrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubOrder.objects.all().select_related('vendor', 'main_order').prefetch_related('items')
    serializer_class = SubOrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        vendor_id = self.request.query_params.get('vendor_id')
        if vendor_id:
            qs = qs.filter(vendor_id=vendor_id)
        return qs
