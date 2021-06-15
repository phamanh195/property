class FilterFormMixin:
    """
    A mixin form to clean filter form data by inherit def clean(self): method
    """
    def clean(self):
        super().clean()
        for field, value in self.cleaned_data.copy().items():
            if field.startswith('range_') and isinstance(value, str) and '-' in value:
                min_value, max_value = value.split('-')
                query_field = field[len('range_'):]
                self.cleaned_data[f'{query_field}__gte'] = min_value
                self.cleaned_data[f'{query_field}__lte'] = max_value
                self.cleaned_data[field] = None
        return self.cleaned_data
