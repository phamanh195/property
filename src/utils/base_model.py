from abc import ABCMeta, abstractmethod
import uuid

from django.conf import settings
from django.db import models


class BaseTimeStampModel(models.Model):
    created_time = models.DateTimeField(auto_now_add=True)
    modified_time = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BaseUserModel(BaseTimeStampModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='%(class)s')

    class Meta:
        abstract = True


class BaseModel(BaseTimeStampModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class BaseUrlModel(BaseModel):
    """
    A mixin model for get_absolute_url()
    Models extends this mixin should have replacement of get_url_path() for specific model's detail view.
    """
    __metaclass__ = ABCMeta

    class Meta:
        abstract = True

    @abstractmethod
    def get_url_path(self) -> str:
        """Return reverse url for model's detail view"""

    def get_absolute_url(self):
        return settings.WEBSITE_URL.strip('/') + self.get_url_path()
