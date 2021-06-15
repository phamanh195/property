from django.views.generic import FormView
from django.http.response import JsonResponse

from utils.mixin_view import GeneralMixin, CategoryMixin
from main.forms import ContactForm


class ContactView(GeneralMixin, CategoryMixin, FormView):
    form_class = ContactForm
    template_name = 'main/contact.html'
    success_message = 'Gửi tin nhắn thành công. Chúng tôi sẽ trả lời bạn sớm nhất có thể. Cám ơn quý khách!'
    error_message = 'Thông tin không hợp lệ. Xin hãy kiểm tra lại các ô thông tin và gửi lại.'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context.update({
            'title': 'Liên hệ'
        })
        return context

    def form_valid(self, form):
        form.save()
        return JsonResponse({'msg': self.success_message, 'data': None, 'errors': None})

    def form_invalid(self, form):
        return JsonResponse({'msg': self.error_message, 'data': None, 'errors': form.errors})
