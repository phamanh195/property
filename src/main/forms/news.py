from django import forms

from main.models import NewsComment


class NewsCommentForm(forms.ModelForm):
	class Meta:
		model = NewsComment
		exclude = ('enable',)
