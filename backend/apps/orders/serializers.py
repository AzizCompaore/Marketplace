from rest_framework import serializers
from .models import Order, SubOrder, OrderItem
from apps.catalog.services import calculate_wholesale_tier

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class SubOrderSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.store_name', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = SubOrder
        fields = '__all__'


class OrderDetailSerializer(serializers.ModelSerializer):
    sub_orders = SubOrderSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class CreateOrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CreateOrderSerializer(serializers.ModelSerializer):
    items = CreateOrderItemInputSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_phone',
            'customer_email', 'shipping_city', 'shipping_neighborhood',
            'shipping_address', 'payment_method', 'items', 'subtotal',
            'wholesale_savings', 'shipping_fee', 'total_amount', 'created_at'
        ]
        read_only_fields = ['order_number', 'subtotal', 'wholesale_savings', 'total_amount', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        from apps.catalog.models import Product
        
        # Regrouper par vendeur pour le découpage multi-vendeurs
        vendor_buckets = {}
        total_subtotal = 0
        total_savings = 0

        # Création de la commande principale
        order = Order.objects.create(
            customer_name=validated_data['customer_name'],
            customer_phone=validated_data['customer_phone'],
            customer_email=validated_data.get('customer_email', ''),
            shipping_city=validated_data.get('shipping_city', 'Abidjan'),
            shipping_neighborhood=validated_data.get('shipping_neighborhood', ''),
            shipping_address=validated_data['shipping_address'],
            payment_method=validated_data.get('payment_method', 'wave'),
            subtotal=0,
            wholesale_savings=0,
            shipping_fee=validated_data.get('shipping_fee', 1500),
            total_amount=0,
        )

        for item_info in items_data:
            product = Product.objects.get(id=item_info['product_id'])
            qty = item_info['quantity']

            # Calcul de la tarification dégressive
            if product.is_wholesale_eligible:
                tier = calculate_wholesale_tier(
                    quantity=qty,
                    base_unit_price=float(product.base_price),
                    max_discount_pct=float(product.max_wholesale_discount)
                )
                disc_pct = tier['discount_percent']
                eff_price = tier['discounted_unit_price']
                line_total = tier['total_price']
                savings = tier['total_savings']
            else:
                disc_pct = 0.0
                eff_price = float(product.base_price)
                line_total = eff_price * qty
                savings = 0

            total_subtotal += (float(product.base_price) * qty)
            total_savings += savings

            vendor_id = product.vendor_id
            if vendor_id not in vendor_buckets:
                vendor_buckets[vendor_id] = []
            vendor_buckets[vendor_id].append({
                'product': product,
                'quantity': qty,
                'base_unit_price': product.base_price,
                'discount_percent_applied': disc_pct,
                'effective_unit_price': eff_price,
                'line_total': line_total,
            })

        # Création des sous-commandes par vendeur
        for v_id, v_items in vendor_buckets.items():
            sub_subtotal = sum(i['line_total'] for i in v_items)
            from apps.vendors.models import VendorProfile
            vendor = VendorProfile.objects.get(id=v_id)
            commission_pct = float(vendor.commission_rate) / 100.0
            commission_val = round(sub_subtotal * commission_pct)
            vendor_payout = sub_subtotal - commission_val

            sub_order = SubOrder.objects.create(
                main_order=order,
                vendor=vendor,
                subtotal=sub_subtotal,
                commission_amount=commission_val,
                vendor_payout=vendor_payout,
            )

            for vi in v_items:
                OrderItem.objects.create(
                    sub_order=sub_order,
                    product=vi['product'],
                    product_name=vi['product'].name,
                    quantity=vi['quantity'],
                    base_unit_price=vi['base_unit_price'],
                    discount_percent_applied=vi['discount_percent_applied'],
                    effective_unit_price=vi['effective_unit_price'],
                    line_total=vi['line_total'],
                )

        final_total = (total_subtotal - total_savings) + float(order.shipping_fee)
        order.subtotal = total_subtotal
        order.wholesale_savings = total_savings
        order.total_amount = final_total
        order.save()

        return order
