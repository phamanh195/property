from django.db import models
from solo.models import SingletonModel


class GeneralConfig(SingletonModel):
    working_time = models.CharField(max_length=100, blank=True)
    hotline = models.CharField(max_length=100, blank=True)
    address = models.CharField(max_length=100, blank=True)
    email = models.CharField(max_length=100, blank=True)
    company_name = models.CharField(max_length=100, blank=True)
    description = models.CharField(max_length=100, blank=True)
    facebook = models.CharField(max_length=100, blank=True)
    google = models.CharField(max_length=100, blank=True)
    instagram = models.CharField(max_length=100, blank=True)
    twitter = models.CharField(max_length=100, blank=True)
    youtube = models.CharField(max_length=100, blank=True)
