from django.http import JsonResponse
from django.forms.models import model_to_dict
from django.views.generic import DetailView, View

from main.models import Product, ProductVisitor
from main.forms import ProductReviewForm
from utils import get_client_ip
from utils.mixin_view import GeneralMixin, CategoryMixin


class ProductDetailView(GeneralMixin, CategoryMixin, DetailView):
    model = Product
    template_name = 'main/product_detail.html'
    queryset = Product.objects.filter(enable=True)

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        product_review_form = ProductReviewForm({'product': self.object})
        context.update({
            'product_review_form': product_review_form
        })
        return context

    def get(self, request, *args, **kwargs):
        ProductVisitor.objects.get_or_create(
            ip_address=get_client_ip(request),
            product=self.get_object(),
        )
        return super().get(request, *args, **kwargs)


class ProductReviewAPIView(View):
    success_message = 'Gửi tin nhắn thành công.Cảm ơn bạn đã đóng góp ý kiến!'
    error_message = 'Nhập thiếu trường bắt buộc hoặc sai định dạng.'

    def post(self, request):
        form = ProductReviewForm(data=request.POST)
        if form.is_valid():
            review = form.save()
            data = model_to_dict(review, exclude=('enable',))
            data.update({
                'rate': review.rate,
                'created_time': review.created_time.strftime('%d/%m/%y'),
                'product_review_rate': review.product.get_review_rate(),
                'product_review_count': review.product.enable_reviews.count(),
            })
            return JsonResponse({'msg': self.success_message, 'data': data, 'errors': None})
        else:
            return JsonResponse({'msg': self.success_message, 'data': None, 'errors': form.errors})




