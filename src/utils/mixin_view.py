from django.urls import reverse

from main.models import Category, Product,\
    GeneralConfig, ImageSlider, Province,\
    News, NewsTag, NewsCategory


class PropertyTypeCategory:
    def __init__(self, slug: str, name: str):
        self.slug = slug
        self.name = name
        self.url = reverse('products.property', args=[self.slug])
        self.products = Product.objects.filter(property_type=self.slug, enable=True)


class PaymentTypeCategory:
    def __init__(self, slug: str, name: str):
        self.slug = slug
        self.name = name
        self.url = reverse('products.payment', args=[self.slug])
        self.products = Product.objects.filter(payment_type__icontains=self.slug, enable=True)


class CategoryMixin:
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'property_types': {key: PropertyTypeCategory(key, name) for key, name in Product.PROPERTY_TYPE_CHOICES},
            'payment_types': {key: PaymentTypeCategory(key, name) for key, name in Product.PAYMENT_CHOICES},
            'categories': Category.objects.filter(enable=True)
        })
        return context


class GeneralMixin:
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'general_config': GeneralConfig.get_solo()
        })
        return context


class LatestNewsMixin:
    max_latest_news = 6

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'latest_news': News.objects.filter(enable=True).all()[:self.max_latest_news],
        })
        return context


class NewsCategoryMixin:
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'news_categories': NewsCategory.objects.filter(enable=True).all(),
            'news_tags': NewsTag.objects.all(),
        })
        return context


class SliderMixin:
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'slider_images': ImageSlider.objects.all(),
        })
        return context


class AreaMixin:
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'provinces': Province.objects.all(),
        })
        return context


class OrderListMixin:
    """
    A mixin view for getting orderby from request
    """

    def get_ordering_from_request(self):
        _reverse = False
        ordering = self.request.GET.get('orderby')
        if ordering and ordering.startswith('-'):
            ordering = ordering[1:]
            _reverse = True
        return ordering, _reverse

    def get_ordering(self):
        ordering = super().get_ordering() or []
        all_model_fields = [field.name for field in self.model._meta.fields]
        extra_ordering, _reverse = self.get_ordering_from_request()
        if extra_ordering and extra_ordering in all_model_fields:
            try:
                ordering.remove(extra_ordering)
            except ValueError:
                pass
            extra_ordering = '-' + extra_ordering if _reverse else extra_ordering
            ordering.insert(0, extra_ordering)
        return ordering
