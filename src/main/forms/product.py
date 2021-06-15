from django import forms

from utils import FilterFormMixin
from main.models import Product, ProductReview


class ProductReviewForm(forms.ModelForm):
    class Meta:
        model = ProductReview
        exclude = ('enable',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.error_messages.update(
                {'required': f'Nhập  thông tin {field.label}.'}
            )


class ProductOrderForm(forms.Form):
    ORDER_BY_CHOICES = (
        ('', 'Thứ  tự mặc định'),
        ('-num_views', 'Thứ tự theo mức độ phổ biến'),
        ('-rating', 'Thứ tự theo điểm đánh giá'),
        ('-created_at', 'Thứ tự theo sản phẩm mới'),
        ('price', 'Thứ tự theo giá: thấp đến cao'),
        ('-price', 'Thứ tự theo giá: cao đến thấp')
    )
    orderby = forms.ChoiceField(choices=ORDER_BY_CHOICES)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['orderby'].widget.attrs['class'] = 'orderby'

    def as_select(self):
        return self._html_output(
            normal_row='%(field)s',
            error_row='%s',
            row_ender='',
            help_text_html='',
            errors_on_separate_row=False
        )


class ProductFilterForm(FilterFormMixin, forms.ModelForm):
    FILTER_AREA_CHOICES = (
        ('-30', 'Dưới 30 m2'),
        ('30-50', '30 - 50 m2'),
        ('50-80', '50 - 80 m2'),
        ('80-120', '80 - 120 m2'),
        ('120-160', '120 - 160 m2'),
        ('160-', 'Trên 160 m2'),
    )
    FILTER_PRICE_CHOICES = (
        ('-100_000_000', 'Dưới 100.000.000đ'),
        ('100_000_000-200_000_000', '100.000.000đ - 200.000.000đ'),
        ('200_000_000-300_000_000', '200.000.000đ - 300.000.000đ'),
        ('300_000_000-500_000_000', '300.000.000 - 500.000.000đ'),
        ('500_000_000-1_000_000_000', '500.000.000đ - 1.000.000.000đ'),
        ('1_000_000_000-', 'Trên 1.000.000.000đ'),
    )
    range_area = forms.ChoiceField(required=False, label='Diện tích', choices=FILTER_AREA_CHOICES)
    range_price = forms.ChoiceField(required=False, label='Mức giá', choices=FILTER_PRICE_CHOICES)

    class Meta:
        model = Product
        fields = ('range_area', 'range_price', 'payment_type', 'property_type', 'bedroom', 'toilet',
                  'direction', 'furniture', 'province', 'district')
        hidden_fields = ['province', 'district']

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.required = False
            if hasattr(field, 'choices'):
                field.choices = [opt for opt in field.choices if opt[0]]
            if field_name in self.Meta.hidden_fields:
                field.widget = forms.HiddenInput()


class ProductFilterPropertyTypeForm(ProductFilterForm):
    class Meta(ProductFilterForm.Meta):
        exclude = ['property_type']


class ProductFilterPaymentTypeForm(ProductFilterForm):
    class Meta(ProductFilterForm.Meta):
        exclude = ['payment_type']



