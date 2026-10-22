from django.db import models
from django.conf import settings
from django.utils.text import slugify

class VendorProfile(models.Model):
    KYC_STATUS_CHOICES = [
        ('pending', 'En attente de vérification'),
        ('approved', 'Vérifié & Validé'),
        ('rejected', 'Rejeté'),
    ]

    MOBILE_MONEY_CHOICES = [
        ('wave', 'Wave'),
        ('orange', 'Orange Money'),
        ('mtn', 'MTN Mobile Money'),
        ('moov', 'Moov Money'),
        ('bank', 'Virement Bancaire (RIB)'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='vendor_profile',
        null=True,
        blank=True
    )
    store_name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    legal_name = models.CharField(max_length=200, blank=True)
    rccm_number = models.CharField(max_length=80, blank=True, verbose_name="N° RCCM / NIF")
    
    city = models.CharField(max_length=100, default='Abidjan')
    neighborhood = models.CharField(max_length=120, blank=True, default='Cocody')
    address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=30)
    email = models.EmailField(blank=True)

    banner_url = models.URLField(max_length=500, blank=True)
    logo_url = models.URLField(max_length=500, blank=True)
    description = models.TextField(blank=True)

    # Commission plateforme
    commission_rate = models.DecimalField(max_digits=4, decimal_places=2, default=8.0, verbose_name="Taux de commission (%)")
    is_verified = models.BooleanField(default=False)
    kyc_status = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='approved')

    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.9)
    sales_count = models.PositiveIntegerField(default=0)

    # Coordonnées de reversement Mobile Money / Banque
    payout_operator = models.CharField(max_length=20, choices=MOBILE_MONEY_CHOICES, default='wave')
    payout_account_number = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-rating', 'store_name']
        verbose_name = 'Vendeur'
        verbose_name_plural = 'Vendeurs'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.store_name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.store_name} ({self.city})"
