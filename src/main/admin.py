from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from solo.admin import SingletonModelAdmin

from .models import Category, Product, ProductImage, ProductReview,\
    NewsCategory, NewsTag, News, NewsComment,\
    UserProfile, GeneralConfig, Contact, WebsiteReview


class UserProfileInline(admin.TabularInline):
    model = UserProfile


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    readonly_fields = [field.name for field in ProductReview._meta.get_fields()]
    extra = 0
    max_num = 0
    show_change_link = False


class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline, ProductReviewInline]


class NewsCommentInline(admin.TabularInline):
    model = NewsComment
    readonly_fields = [field.name for field in NewsComment._meta.get_fields() if field.name not in ('enable',)]
    extra = 0
    max_num = 0


class NewsAdmin(admin.ModelAdmin):
    inlines = [NewsCommentInline]


UserAdmin.inlines = [UserProfileInline]

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(GeneralConfig, SingletonModelAdmin)
admin.site.register(Category)
admin.site.register(Product, ProductAdmin)
admin.site.register(NewsCategory)
admin.site.register(NewsTag)
admin.site.register(News, NewsAdmin)
admin.site.register(Contact)
admin.site.register(WebsiteReview)
