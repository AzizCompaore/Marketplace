from django.db import models
from django.conf import settings
import uuid

class BusinessAccount(models.Model):
    SECTOR_CHOICES = [
        ('horeca', 'Hôtellerie / Restauration / Café'),
        ('retail', 'Commerce de détail / Supérettes'),
        ('industry', 'Industrie & Transformation'),
        ('construction', 'BTP & Construction'),
        ('services', 'Sociétés de Services / Bureaux'),
        ('agriculture', 'Coopératives Agricoles'),
    ]

    company_name = models.CharField(max_length=200)
    tax_id = models.CharField(max_length=100, blank=True, verbose_name="Compte Contribuable / NIF")
    sector = models.CharField(max_length=50, choices=SECTOR_CHOICES, default='retail')
    contact_person = models.CharField(max_length=150)
    contact_phone = models.CharField(max_length=30)
    contact_email = models.EmailField()
    city = models.CharField(max_length=100, default='Abidjan')
    address = models.TextField()

    is_credit_approved = models.BooleanField(default=False, verbose_name="Facilité de paiement 30j accordée")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company_name} ({self.get_sector_display()})"


class QuoteRequest(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('submitted', 'Demande soumise'),
        ('reviewed', 'En cours d’étude tarifaire'),
        ('quoted', 'Devis chiffré émis'),
        ('accepted', 'Devis accepté par le client'),
        ('rejected', 'Devis refusé'),
    ]

    quote_reference = models.CharField(max_length=32, unique=True, editable=False)
    company_name = models.CharField(max_length=200)
    contact_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=30)
    email = models.EmailField()
    
    delivery_location = models.CharField(max_length=150, default='Abidjan')
    estimated_volume = models.CharField(max_length=100, blank=True, help_text="Ex: 500 cartons/mois")
    desired_delivery_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Spécifications techniques, cadencement, conditionnement")

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='submitted')
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.quote_reference:
            self.quote_reference = f"DEV-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quote_reference} - {self.company_name}"


class QuoteItem(models.Model):
    quote_request = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('catalog.Product', on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)
    requested_quantity = models.PositiveIntegerField(default=10)
    target_unit_budget = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True, verbose_name="Budget unitaire indicatif (FCFA)")

    def __str__(self):
        return f"{self.requested_quantity}x {self.product_name}"
