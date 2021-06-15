from django.urls import path

from .views import HomeView, SubscriberView, ContactView, IntroductionView, \
	BaseProductListView, ProductFilterCategoryView, ProductFilterPropertyTypeView, ProductFilterPaymentTypeView, \
	ProductReviewAPIView, ProductDetailView, \
	NewsView, NewsCategoryView, NewsTagView, NewsDetailView, NewsCommentAPIView

urlpatterns = [
	path('', HomeView.as_view(), name='home'),
	path('subscriber/', SubscriberView.as_view(), name='subscriber'),

	path('products/', BaseProductListView.as_view(), name='products'),
	path('category/<str:slug>/', ProductFilterCategoryView.as_view(), name='products.category'),
	path('property-type/<str:slug>/', ProductFilterPropertyTypeView.as_view(), name='products.property'),
	path('payment-type/<str:slug>/', ProductFilterPaymentTypeView.as_view(), name='products.payment'),
	path('products/<slug:slug>/', ProductDetailView.as_view(), name='products.detail'),
	path('product-review/', ProductReviewAPIView.as_view(), name='products.review'),

	path('news/', NewsView.as_view(), name='news'),
	path('news-category/<slug:slug>/', NewsCategoryView.as_view(), name='news.category'),
	path('news-tag/<slug:slug>/', NewsTagView.as_view(), name='news.tag'),
	path('news/<slug:slug>/', NewsDetailView.as_view(), name='news.detail'),
	path('news-comment/', NewsCommentAPIView.as_view(), name='news.comment'),

	path('introduction/', IntroductionView.as_view(), name='introduction'),
	path('contact/', ContactView.as_view(), name='contact'),
]
