# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy
from scrapy_djangoitem import DjangoItem
from main.models import Product, Category, News


class CategoryItem(DjangoItem):
    django_model = Category


class ProductItem(DjangoItem):
    django_model = Product
    image_urls = scrapy.Field()
    images = scrapy.Field()


class NewsItem(DjangoItem):
    django_model = News
    image_url = scrapy.Field()
    image = scrapy.Field()
