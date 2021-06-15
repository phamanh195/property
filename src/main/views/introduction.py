from django.views.generic import TemplateView
from django.http import Http404

from main.models import Introduction
from utils.mixin_view import GeneralMixin, CategoryMixin,\
    LatestNewsMixin, NewsCategoryMixin


class IntroductionView(GeneralMixin, CategoryMixin, LatestNewsMixin, NewsCategoryMixin, TemplateView):
    template_name = 'main/introduction.html'

    def get_context_data(self, *args, **kwargs):
        introduction = Introduction.get_solo()
        if not introduction:
            raise Http404
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': introduction.title,
            'introduction': introduction,
        })
        return context
