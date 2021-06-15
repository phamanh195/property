from django.db import models

from utils import BaseModel


class WebsiteReview(BaseModel):
    name = models.CharField(max_length=50)
    image = models.ImageField(upload_to='website_reviews')
    comment = models.TextField()
    enable = models.BooleanField(default=True)
    index = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ('index', 'name')

    def __str__(self):
        return f'Website review: {self.name}'
