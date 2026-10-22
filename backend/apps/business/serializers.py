from rest_framework import serializers
from .models import BusinessAccount, QuoteRequest, QuoteItem

class QuoteItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteItem
        fields = ['id', 'product', 'product_name', 'requested_quantity', 'target_unit_budget']


class QuoteRequestSerializer(serializers.ModelSerializer):
    items = QuoteItemSerializer(many=True, required=False)

    class Meta:
        model = QuoteRequest
        fields = [
            'id', 'quote_reference', 'company_name', 'contact_name',
            'phone_number', 'email', 'delivery_location', 'estimated_volume',
            'desired_delivery_date', 'notes', 'status', 'created_at', 'items'
        ]
        read_only_fields = ['quote_reference', 'status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        quote = QuoteRequest.objects.create(**validated_data)
        for item_data in items_data:
            QuoteItem.objects.create(quote_request=quote, **item_data)
        return quote


class BusinessAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessAccount
        fields = '__all__'
