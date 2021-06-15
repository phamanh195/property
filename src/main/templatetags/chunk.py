from itertools import islice
from django import template


register = template.Library()


@register.filter(name='chunk')
def chunk(value: list, size: int):
    """
    Break a list into a chunk of lists with size <size: int>
    :param value: iterable
    :param size: int
    :return: result: generator
    """
    value = iter(value)
    size = int(size)
    while True:
        chunk_item = list(islice(value, size))
        if chunk_item:
            yield chunk_item
        else:
            break
