from django.db import models
from django.utils.text import slugify

class Universe(models.Model):
    """
    10 Univers commerciaux du catalogue général :
    Supermarché, Mode, Téléphonie, Électronique, Informatique,
    Maison & Bureau, Santé & Beauté, Bébés & Jouets, Sport, Automobile.
    """
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=50, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Univers Commercial'
        verbose_name_plural = 'Univers Commerciaux'

    def __str__(self):
        return self.name


class Category(models.Model):
    universe = models.ForeignKey(Universe, on_delete=models.CASCADE, related_name='categories')
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcategories')
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    icon = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.universe.name} > {self.name}"


class Product(models.Model):
    """
    Modèle Produit Marketplace avec support de la tarification dégressive grossiste
    et visualisation 3D.
    """
    UNIT_CHOICES = [
        ('piece', 'Pièce'),
        ('kg', 'Kilogramme (kg)'),
        ('sac', 'Sac (50kg / 25kg)'),
        ('carton', 'Carton / Pack'),
        ('palette', 'Palette'),
        ('tonne', 'Tonne'),
    ]

    SPACE_CHOICES = [
        ('shopping', 'Shopping Général'),
        ('supermarche', 'Supermarché & Vivriers'),
        ('galerie', 'Galerie Premium'),
        ('business', 'Business & B2B'),
        ('plus18', 'Espace +18'),
    ]

    universe = models.ForeignKey(Universe, on_delete=models.PROTECT, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    vendor = models.ForeignKey('vendors.VendorProfile', on_delete=models.CASCADE, related_name='products')

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    sku = models.CharField(max_length=64, unique=True, blank=True)
    description = models.TextField()

    # Espaces commerciaux
    commercial_space = models.CharField(max_length=30, choices=SPACE_CHOICES, default='shopping')
    is_adult_restricted = models.BooleanField(default=False, verbose_name="Réservé +18")

    # Prix public en Francs CFA BCEAO (XOF)
    base_price = models.DecimalField(max_digits=12, decimal_places=0, verbose_name="Prix Unitaire (FCFA)")

    # Tarification de gros (Cahier des charges V2)
    is_wholesale_eligible = models.BooleanField(default=True, verbose_name="Éligible vente en gros dégressive")
    max_wholesale_discount = models.DecimalField(max_digits=4, decimal_places=1, default=50.0, verbose_name="Remise max autorisée (%)")

    # Stocks et logistique
    stock_quantity = models.PositiveIntegerField(default=10)
    min_order_quantity = models.PositiveIntegerField(default=1)
    unit_measure = models.CharField(max_length=20, choices=UNIT_CHOICES, default='piece')
    weight_kg = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    origin = models.CharField(max_length=100, default="Côte d'Ivoire")

    # Médias et 3D
    main_image = models.ImageField(upload_to='products/', blank=True, null=True)
    main_image_url = models.URLField(max_length=500, blank=True)
    has_3d_model = models.BooleanField(default=False, verbose_name="Visualiseur 3D interactif activé")
    model_3d_type = models.CharField(max_length=50, blank=True, default="procedural_mesh")

    # Évaluation
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)
    reviews_count = models.PositiveIntegerField(default=0)

    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Produit'
        verbose_name_plural = 'Produits'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.sku:
            import uuid
            self.sku = f"G-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.base_price} FCFA)"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='products/gallery/', blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
