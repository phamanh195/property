from django.db import models

from utils import BaseModel


class Province(BaseModel):
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return f'Province: {self.name}'


class District(BaseModel):
    province = models.ForeignKey(Province, on_delete=models.CASCADE, related_name='districts')
    name = models.CharField(max_length=200)

    class Meta:
        unique_together = [('province', 'name')]

    def __str__(self):
        return f'District: {self.name}'


class Ward(BaseModel):
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name='wards')
    name = models.CharField(max_length=200)

    class Meta:
        unique_together = [('district', 'name')]

    def __str__(self):
        return f'Ward: {self.name}'
