from django.views.generic import TemplateView, DetailView, View, CreateView, ListView
from django.core.paginator import Paginator
from django.http import Http404
from django.db.models import Avg, Count, Q

from main.models import Product, Category
from main.forms import ProductOrderForm, ProductFilterForm, ProductFilterPropertyTypeForm,\
    ProductFilterPaymentTypeForm
from utils.mixin_view import GeneralMixin, CategoryMixin, OrderListMixin


class ProductFilterMixin:
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'filter_form': ProductFilterForm(self.request.GET)
        })
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        filter_form = ProductFilterForm(self.request.GET)
        q_object = Q()
        if filter_form.is_valid():
            for field, value in filter_form.cleaned_data.items():
                if value:
                    q_object &= Q(**{field: value})
        return queryset.filter(q_object)


class BaseProductListView(GeneralMixin, CategoryMixin, OrderListMixin, ProductFilterMixin, ListView):
    model = Product
    queryset = Product.objects.annotate(
        rating=Avg('reviews__vote', filter=Q(reviews__enable=True)),
        num_views=Count('visitors'),
    )
    paginate_by = 25
    ordering = ['-created_time']
    template_name = 'main/products.html'
    extra_ordering = ['rating', 'num_views']

    def get_ordering(self):
        ordering = super().get_ordering()
        allow_extra_ordering = self.extra_ordering + [f'-{field}' for field in self.extra_ordering]
        extra_ordering = self.request.GET.get('orderby')
        if extra_ordering in allow_extra_ordering:
            ordering.insert(0, extra_ordering)
        return ordering

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': 'Tìm kiếm dự án',
            'order_form': ProductOrderForm(self.request.GET),
            'nav_common_products': Paginator(self.object_list[:15], 2)
        })
        return context


class ProductFilterCategoryView(BaseProductListView):
    def get_context_data(self, *args, **kwargs):
        slug = self.kwargs.get('slug')
        category = Category.objects.filter(slug=slug).first()
        if not category:
            raise Http404
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': category.name,
        })
        return context

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        queryset = super().get_queryset()
        return queryset.filter(category__slug=slug)


class ProductFilterPropertyTypeView(BaseProductListView):
    def get_context_data(self, *args, **kwargs):
        slug = self.kwargs.get('slug')
        property_choices = dict(Product.PROPERTY_TYPE_CHOICES)
        if slug not in property_choices:
            raise Http404
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': property_choices[slug],
            'filter_form': ProductFilterPropertyTypeForm(self.request.GET),
        })
        return context

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        queryset = super().get_queryset()
        return queryset.filter(property_type=slug)


class ProductFilterPaymentTypeView(BaseProductListView):
    def get_context_data(self, *args, **kwargs):
        slug = self.kwargs.get('slug')
        payment_choices = dict(Product.PAYMENT_CHOICES)
        if slug not in payment_choices:
            raise Http404
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': payment_choices[slug],
            'filter_form': ProductFilterPaymentTypeForm(self.request.GET),
        })
        return context

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        queryset = super().get_queryset()
        return queryset.filter(payment_type__icontains=slug)
