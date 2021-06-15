from django.views.generic import DetailView, View
from django.forms.models import model_to_dict
from django.http import JsonResponse

from main.models import News
from main.forms import NewsCommentForm
from utils.mixin_view import GeneralMixin, CategoryMixin, LatestNewsMixin, NewsCategoryMixin


class NewsDetailView(GeneralMixin, CategoryMixin, LatestNewsMixin, NewsCategoryMixin, DetailView):
    model = News
    queryset = News.objects.filter(enable=True)
    template_name = 'main/news_detail.html'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        queryset = self.get_queryset()
        context.update({
            'next_object': queryset.filter(created_time__gt=self.object.created_time).first(),
            'previous_object': queryset.filter(created_time__lt=self.object.created_time).first(),
        })
        return context


class NewsCommentAPIView(View):
    success_message = 'Gửi tin nhắn thành công. Cảm ơn bạn đã đóng góp ý kiến!'
    error_message = 'Nhập thiếu trường bắt buộc hoặc sai định dạng.'

    def post(self, request):
        form = NewsCommentForm(request.POST)
        if form.is_valid():
            comment = form.save()
            data = model_to_dict(comment, exclude=('enable',))
            data.update({
                'news_comment_count': comment.news.enable_comments.count(),
                'created_time': comment.created_time.strftime('%d/%m/%y'),
            })
            return JsonResponse({'msg': self.success_message, 'data': data, 'errors': None})
        else:
            return JsonResponse({'msg': self.error_message, 'data': None, 'errors': None})
