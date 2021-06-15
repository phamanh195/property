from django.db import models
from django.db.models import Q
from django.urls import reverse

from utils import BaseModel, BaseUrlModel
from utils.slugify_extends import slugify_extend


class NewsCategory(BaseModel):
    name = models.CharField(max_length=200)
    index = models.PositiveIntegerField(default=0)
    enable = models.BooleanField(default=True)
    slug = models.SlugField(max_length=200, blank=True, unique=True)

    class Meta:
        ordering = ('index', 'name')

    def __str__(self):
        return f'News Category: {self.name}'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_extend(self.name)
        super().save(*args, **kwargs)


class NewsTag(BaseModel):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, unique=True, blank=True)

    def __str__(self):
        return f'News Tag: {self.name}'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_extend(self.name)
        super().save(*args, **kwargs)


class News(BaseUrlModel):
    title = models.CharField(max_length=200)
    sub_title = models.CharField(max_length=200, blank=True)
    slug = models.SlugField(max_length=200, blank=True)
    content = models.TextField()
    enable = models.BooleanField(default=True)
    image = models.ImageField(upload_to='news')
    category = models.ForeignKey(NewsCategory, on_delete=models.SET_NULL, related_name='news', null=True)
    tags = models.ManyToManyField(NewsTag, related_name='news')
    created_by = models.CharField(max_length=50, default='Admin')

    class Meta:
        ordering = ('-created_time',)

    def __str__(self):
        return f'News: {self.title}'

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify_extend(self.title)
        super().save(*args, **kwargs)

    def get_url_path(self) -> str:
        return reverse('news.detail', args=[self.slug])

    def get_related_news_by_category(self):
        return News.objects.filter(category=self.category, enable=True).exclude(pk=self.pk)

    def get_related_news_by_tag(self):
        if not self.tags.exists():
            return []
        qs = Q(enable=True)
        for tag in self.tags.all():
            qs |= Q(tags=tag)
        return News.objects.filter(qs).exclude(pk=self.pk).distinct()

    def get_short_description(self):
        max_length = 90
        short_description = self.sub_title or self.content or ''
        if len(short_description) < max_length:
            return short_description
        else:
            return ' '.join(short_description[:max_length].split()[:-1]) + '...'

    def get_short_title(self):
        max_length = 90
        short_title = self.title or ''
        if len(short_title) < max_length:
            return short_title
        else:
            return ' '.join(short_title[:max_length].split()[:-1]) + '...'

    @property
    def enable_comments(self):
        return self.comments.filter(enable=True)


class NewsComment(BaseModel):
    name = models.CharField(max_length=50)
    enable = models.BooleanField(default=True)
    email = models.EmailField(max_length=50)
    phone_number = models.CharField(max_length=50, blank=True)
    content = models.TextField()
    news = models.ForeignKey(News, on_delete=models.CASCADE, related_name='comments', null=True, blank=True)
