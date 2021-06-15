from django.views.generic import ListView
from django.http import Http404

from main.models import News, NewsCategory, NewsTag
from utils.mixin_view import GeneralMixin, CategoryMixin, LatestNewsMixin, NewsCategoryMixin


class NewsView(GeneralMixin, CategoryMixin, LatestNewsMixin, NewsCategoryMixin, ListView):
    model = News
    paginate_by = 20
    queryset = News.objects.filter(enable=True)
    template_name = 'main/news.html'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': 'Tin tức',
        })
        return context


class NewsCategoryView(NewsView):
    def get_queryset(self):
        slug = self.kwargs.get('slug')
        queryset = super().get_queryset()
        return queryset.filter(category__slug=slug)

    def get_context_data(self, *args, **kwargs):
        slug = self.kwargs.get('slug')
        news_category = NewsCategory.objects.filter(slug=slug).first()
        if not news_category:
            raise Http404
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': news_category.name
        })
        return context


class NewsTagView(NewsView):
    def get_context_data(self, *args, **kwargs):
        slug = self.kwargs.get('slug')
        news_tag = NewsTag.objects.filter(slug=slug).first()
        if not news_tag:
            raise Http404
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': f'Tags: {news_tag.name}'
        })
        return context
