from django.views.generic import View
from django.http.response import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from main.forms import SubscriberForm


@method_decorator(csrf_exempt, name='dispatch')
class SubscriberView(View):
    success_message = 'Đăng ký theo dõi thành công. Chúng tôi sẽ gửi bạn những thông tin bất động sản mới nhất.'\
            'Cảm ơn quý khách!'
    error_message = 'Thông tin đăng ký không hợp lệ. Xin hãy kiểm tra lại các ô thông tin và gửi lại.'

    def post(self, request):
        form = SubscriberForm(data=request.POST)
        if form.is_valid():
            form.save()
            return JsonResponse({'msg': self.success_message, 'data': None, 'errors': None})
        else:
            return JsonResponse({'msg': self.error_message, 'data': None, 'errors': form.errors})
