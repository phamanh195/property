from django.db import models
from django.db.models import Q
from django.conf import settings
from django.urls import reverse
from tinymce.models import HTMLField

from utils import BaseModel, BaseUrlModel
from utils.slugify_extends import slugify_extend
from .area import Province, District, Ward
from .category import Category


class Product(BaseUrlModel):
    PAYMENT_CHOICES = (
        ('buy', 'Bán'),
        ('rent', 'Cho Thuê'),
        ('buy_rent', 'Bán/Cho Thuê')
    )
    PROPERTY_TYPE_CHOICES = (
        ('condominium', 'Căn Hộ'),
        ('villa', 'Biệt Thự'),
        ('apartment', 'Chung Cư'),
        ('town_house', 'Nhà Phố'),
        ('house', 'Nhà Vườn'),
    )
    DIRECTION_CHOICES = (
        ('east', 'Đông'),
        ('west', 'Tây'),
        ('south', 'Nam'),
        ('north', 'Bắc'),
        ('east_south', 'Đông Nam'),
        ('east_north', 'Đông Bắc'),
        ('west_south', 'Tây Nam'),
        ('west_north', 'Tây Bắc'),
    )
    FURNITURE_CHOICES = (
        ('unfinished', 'Hoàn thiện phần thô'),
        ('basically_finished', 'Nội thất cơ bản'),
        ('fully_finished', 'Nội thất đầy đủ')
    )
    ROOM_CHOICES = tuple(zip(range(0, 5), ['{}+'.format(i) if i != 0 else str(i) for i in range(0, 5)]))

    # user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
    #                          related_name='products', null=True, blank=True)
    telephone = models.CharField(max_length=50)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                 related_name='products', null=True, blank=True)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_CHOICES)

    name = models.CharField(max_length=200)
    description = HTMLField(blank=True)
    enable = models.BooleanField(default=True)
    direction = models.CharField(max_length=20, blank=True, choices=DIRECTION_CHOICES)
    furniture = models.CharField(max_length=20, blank=True, choices=FURNITURE_CHOICES)
    bedroom = models.PositiveIntegerField(default=0, choices=ROOM_CHOICES)
    toilet = models.PositiveIntegerField(default=0, choices=ROOM_CHOICES)
    area = models.DecimalField(decimal_places=2, max_digits=6, default=0)
    price = models.PositiveIntegerField(default=0)
    address = models.CharField(max_length=200, blank=True)
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, related_name='products', null=True, blank=True)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, related_name='products', null=True, blank=True)
    province = models.ForeignKey(Province, on_delete=models.SET_NULL, related_name='products', null=True, blank=True)
    slug = models.SlugField(max_length=200, blank=True)

    class Meta:
        ordering = ('-created_time',)

    def __str__(self):
        return f'Product: {self.name}'

    def get_url_path(self) -> str:
        return reverse('products.detail', args=[self.slug])

    @property
    def thumbnail(self):
        return self.images.first()

    def get_full_address(self):
        return ', '.join(map(str, filter(None, (self.address, self.ward, self.district, self.province))))

    def get_short_address(self):
        return ', '.join(map(str, filter(None, (self.ward, self.district, self.province))))

    def get_price_per_area(self):
        if not self.price or not self.area:
            return self.price
        return round(self.price / self.area, 2)

    @property
    def enable_reviews(self):
        return self.reviews.filter(enable=True)

    def get_review_rate(self):
        reviews = self.enable_reviews.all()
        rate = sum(review.vote for review in reviews) * 100 / (5 * len(reviews)) if reviews else 0
        return round(rate)

    def get_related_products(self):
        queryset = Q()
        queryset |= Q(payment_type__icontains=self.payment_type)
        queryset |= Q(property_type=self.property_type)
        queryset != Q(category=self.category)
        return Product.objects.filter(queryset).exclude(pk=self.pk).all()[:15]

    def get_payment_status_label(self):
        payments = {key: value for key, value in self.PAYMENT_CHOICES}
        labels = payments[self.payment_type].split('/')
        return labels

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_extend(self.name)
        super().save(*args, **kwargs)


class ProductImage(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    alt = models.CharField(max_length=200, blank=True)
    path = models.ImageField(upload_to='product', max_length=255)
    index = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('index', 'created_time')


class ProductReview(BaseModel):
    VOTE_CHOICES = (
        (1, 'Rất Tệ'),
        (2, 'Không Tệ'),
        (3, 'Trung Bình'),
        (4, 'Tốt'),
        (5, 'Rất Tốt')
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    enable = models.BooleanField(default=True)
    vote = models.IntegerField(choices=VOTE_CHOICES)
    name = models.CharField(max_length=50, default='Anonymous', blank=True)
    email = models.EmailField(max_length=50)
    comment = models.TextField(blank=True)

    class Meta:
        ordering = ('-created_time',)

    def __str__(self):
        return f'Review {self.email} for {self.product}'

    @property
    def rate(self):
        return (self.vote / 5) * 100


class ProductVisitor(models.Model):
    ip_address = models.GenericIPAddressField()
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='visitors')

    class Meta:
        unique_together = (('ip_address', 'product'),)
