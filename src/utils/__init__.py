from .base_model import *
from .base_form import *


def get_client_ip(request):
    """
    Get client IP address from request object
    :param request:
    :return: ip: str
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
