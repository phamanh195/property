from django import template


register = template.Library()


@register.simple_tag(name='url_replace')
def url_replace(request, field, value):
    payload = request.GET.copy()
    payload[field] = value
    return payload.urlencode()
