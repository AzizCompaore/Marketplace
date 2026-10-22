from django.db import models
from django.conf import settings
import uuid

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('processing', 'En préparation'),
        ('shipped', 'En cours de livraison'),
        ('delivered', 'Livrée'),
        ('cancelled', 'Annulée'),
    ]

    PAYMENT_METHODS = [
        ('wave', 'Wave'),
        ('orange', 'Orange Money'),
        ('mtn', 'MTN Mobile Money'),
        ('moov', 'Moov Money'),
        ('cash', 'Paiement à la livraison'),
        ('card', 'Carte bancaire (Visa / Mastercard)'),
    ]

    order_number = models.CharField(max_length=32, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    # Coordonnées acheteur
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=30)
    customer_email = models.EmailField(blank=True)
    shipping_city = models.CharField(max_length=100, default='Abidjan')
    shipping_neighborhood = models.CharField(max_length=120, default='Cocody')
    shipping_address = models.TextField()

    # Règlements
    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHODS, default='wave')
    payment_status = models.CharField(max_length=30, default='pending')
    
    # Totaux
    subtotal = models.DecimalField(max_digits=14, decimal_places=0, verbose_name="Sous-total (FCFA)")
    wholesale_savings = models.DecimalField(max_digits=14, decimal_places=0, default=0, verbose_name="Économies de gros (FCFA)")
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=0, default=1500, verbose_name="Frais de livraison (FCFA)")
    total_amount = models.DecimalField(max_digits=14, decimal_places=0, verbose_name="Total payé (FCFA)")

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    is_b2b_wholesale = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Commande Principale'
        verbose_name_plural = 'Commandes Principales'

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"CMD-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} - {self.customer_name} ({self.total_amount} FCFA)"


class SubOrder(models.Model):
    """
    Découpage multi-vendeurs : chaque vendeur reçoit et expédie son sous-bon de commande.
    """
    sub_order_number = models.CharField(max_length=36, unique=True, editable=False)
    main_order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='sub_orders')
    vendor = models.ForeignKey('vendors.VendorProfile', on_delete=models.PROTECT, related_name='sub_orders')

    subtotal = models.DecimalField(max_digits=12, decimal_places=0)
    commission_amount = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    vendor_payout = models.DecimalField(max_digits=12, decimal_places=0, default=0)
    
    status = models.CharField(max_length=30, choices=Order.STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Sous-commande Vendeur'
        verbose_name_plural = 'Sous-commandes Vendeurs'

    def save(self, *args, **kwargs):
        if not self.sub_order_number:
            self.sub_order_number = f"SUB-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sub_order_number} ({self.vendor.store_name})"


class OrderItem(models.Model):
    sub_order = models.ForeignKey(SubOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('catalog.Product', on_delete=models.PROTECT)
    product_name = models.CharField(max_length=255)
    
    quantity = models.PositiveIntegerField(default=1)
    base_unit_price = models.DecimalField(max_digits=12, decimal_places=0)
    
    # Tarification de gros V2 appliquée
    discount_percent_applied = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    effective_unit_price = models.DecimalField(max_digits=12, decimal_places=0)
    line_total = models.DecimalField(max_digits=14, decimal_places=0)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} - Remise {self.discount_percent_applied}%"
