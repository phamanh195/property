from django.db import models
from django.urls import reverse

from utils import BaseModel, BaseUrlModel
from utils.slugify_extends import slugify_extend


class Category(BaseUrlModel):
    name = models.CharField(max_length=200)
    index = models.PositiveIntegerField(default=0)
    enable = models.BooleanField(default=True)
    header_image = models.ImageField(upload_to='category', blank=True)
    slug = models.SlugField(max_length=200, blank=True, unique=True)
    note = models.JSONField(null=True, blank=True, default=dict)

    class Meta:
        ordering = ('index', 'name')

    def __str__(self):
        return f'Category: {self.name}'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_extend(self.name)
        super().save(*args, **kwargs)

    def get_url_path(self):
        return reverse('products.category', args=[self.slug])

    @property
    def enable_products(self):
        return self.products.filter(enable=True)
