from django.db import models
from solo.models import SingletonModel


class Introduction(SingletonModel):
    title = models.CharField(max_length=50)
    content = models.TextField(blank=True)
    enable = models.BooleanField(default=True)
