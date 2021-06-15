from django.db import models

from utils import BaseModel


class ImageSlider(BaseModel):
    index = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to='image_slider')

    class Meta:
        ordering = ['index', 'created_time']
