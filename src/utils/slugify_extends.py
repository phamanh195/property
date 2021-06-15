from django.utils.text import slugify


def slugify_extend(value):
    vietnamese_map = {
        ord('đ'): 'd',
        ord('Đ'): 'd',
    }
    return slugify(value.translate(vietnamese_map))
