from django.db import models

from utils import BaseModel


class Contact(BaseModel):
    name = models.CharField(max_length=200)
    telephone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(max_length=50)
    content = models.TextField(blank=True)

    def __str__(self):
        return f'Contact: {self.name}'
