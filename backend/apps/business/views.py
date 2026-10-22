from rest_framework import viewsets, permissions
from .models import QuoteRequest, BusinessAccount
from .serializers import QuoteRequestSerializer, BusinessAccountSerializer

class QuoteRequestViewSet(viewsets.ModelViewSet):
    queryset = QuoteRequest.objects.all().prefetch_related('items')
    serializer_class = QuoteRequestSerializer


class BusinessAccountViewSet(viewsets.ModelViewSet):
    queryset = BusinessAccount.objects.all()
    serializer_class = BusinessAccountSerializer
