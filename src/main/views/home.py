from django.views.generic import TemplateView

from utils.mixin_view import GeneralMixin, CategoryMixin, LatestNewsMixin, AreaMixin
from main.models import WebsiteReview, Product
from main.forms import SubscriberForm, ProductFilterForm


class HomeView(GeneralMixin, CategoryMixin, LatestNewsMixin, AreaMixin, TemplateView):
    template_name = 'main/home.html'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'filter_form': ProductFilterForm(),
            'subscriber_form': SubscriberForm(),
            'website_reviews': WebsiteReview.objects.filter(enable=True).all(),
            'payment_rent_products': Product.objects.filter(enable=True, payment_type__icontains='rent').all(),
            'payment_buy_products': Product.objects.filter(enable=True, payment_type__icontains='buy').all(),
        })
        return context
