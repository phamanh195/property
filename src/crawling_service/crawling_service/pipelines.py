# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html
from main.models import Product


class CrawlingServicePipeline:
    def process_item(self, item, spider):
        Product.objects.create(
            name=item['name'],
        )
        return item
