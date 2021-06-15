from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

from utils import BaseUserModel, BaseModel
from .area import Province, District, Ward


class UserProfile(BaseUserModel):
    avatar = models.ImageField(upload_to='avatar', blank=True)
    telephone = models.CharField(max_length=50, blank=True)
    address = models.CharField(max_length=200, blank=True)
    ward = models.ForeignKey(Ward, on_delete=models.SET_NULL, null=True, blank=True)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True)
    province = models.ForeignKey(Province, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f'User\'s profile: {self.user}'

    def get_full_address(self):
        return ', '.join(filter(None, (self.address, self.ward, self.district, self.province)))


class Subscriber(BaseModel):
    email = models.EmailField(max_length=50, unique=True)
    enable = models.BooleanField(default=True)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name='%(class)s', null=True, default=None)

    def __str__(self):
        return f'Subscriber: {self.email}'

    def save(self, *args, **kwargs):
        user = User.objects.filter(email=self.email).first()
        if not self.user and user:
            self.user = user
        return super().save(*args, **kwargs)
