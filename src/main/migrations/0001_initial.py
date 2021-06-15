# Generated by Django 3.2.4 on 2021-06-06 04:26

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('index', models.PositiveIntegerField(default=0)),
                ('enable', models.BooleanField(default=True)),
                ('header_image', models.ImageField(blank=True, upload_to='category')),
                ('slug', models.SlugField(blank=True, max_length=200, unique=True)),
                ('note', models.JSONField(blank=True, default=dict, null=True)),
            ],
            options={
                'ordering': ('index', 'name'),
            },
        ),
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('telephone', models.CharField(blank=True, max_length=50)),
                ('email', models.EmailField(max_length=50)),
                ('content', models.TextField(blank=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='District',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='GeneralConfig',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('working_time', models.CharField(blank=True, max_length=100)),
                ('hotline', models.CharField(blank=True, max_length=100)),
                ('address', models.CharField(blank=True, max_length=100)),
                ('email', models.CharField(blank=True, max_length=100)),
                ('company_name', models.CharField(blank=True, max_length=100)),
                ('description', models.CharField(blank=True, max_length=100)),
                ('facebook', models.CharField(blank=True, max_length=100)),
                ('google', models.CharField(blank=True, max_length=100)),
                ('instagram', models.CharField(blank=True, max_length=100)),
                ('twitter', models.CharField(blank=True, max_length=100)),
                ('youtube', models.CharField(blank=True, max_length=100)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ImageSlider',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('index', models.PositiveIntegerField(default=0)),
                ('image', models.ImageField(upload_to='image_slider')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Introduction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=50)),
                ('content', models.TextField(blank=True)),
                ('enable', models.BooleanField(default=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='News',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('sub_title', models.CharField(blank=True, max_length=200)),
                ('slug', models.SlugField(blank=True, max_length=200)),
                ('content', models.TextField()),
                ('enable', models.BooleanField(default=True)),
                ('image', models.ImageField(upload_to='news')),
                ('created_by', models.CharField(default='Admin', max_length=50)),
            ],
            options={
                'ordering': ('-created_time',),
            },
        ),
        migrations.CreateModel(
            name='NewsCategory',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('index', models.PositiveIntegerField(default=0)),
                ('enable', models.BooleanField(default=True)),
                ('slug', models.SlugField(blank=True, max_length=200, unique=True)),
            ],
            options={
                'ordering': ('index', 'name'),
            },
        ),
        migrations.CreateModel(
            name='NewsTag',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('slug', models.SlugField(blank=True, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('property_type', models.CharField(choices=[('condominium', 'Căn Hộ'), ('villa', 'Biệt Thự'), ('apartment', 'Chung Cư'), ('town_house', 'Nhà Phố'), ('house', 'Nhà Vườn')], max_length=20)),
                ('payment_type', models.CharField(choices=[('buy', 'Bán'), ('rent', 'Cho Thuê'), ('buy_rent', 'Bán/Cho Thuê')], max_length=20)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('enable', models.BooleanField(default=True)),
                ('direction', models.CharField(blank=True, choices=[('east', 'Đông'), ('west', 'Tây'), ('south', 'Nam'), ('north', 'Bắc'), ('east_south', 'Đông Nam'), ('east_north', 'Đông Bắc'), ('west_south', 'Tây Nam'), ('west_north', 'Tây Bắc')], max_length=20)),
                ('furniture', models.CharField(blank=True, choices=[('unfinished', 'Hoàn thiện phần thô'), ('basically_finished', 'Nội thất cơ bản'), ('fully_finished', 'Nội thất đầy đủ')], max_length=20)),
                ('bedroom', models.PositiveIntegerField(choices=[(0, '0'), (1, '1+'), (2, '2+'), (3, '3+'), (4, '4+')], default=0)),
                ('toilet', models.PositiveIntegerField(choices=[(0, '0'), (1, '1+'), (2, '2+'), (3, '3+'), (4, '4+')], default=0)),
                ('area', models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ('price', models.PositiveIntegerField(default=0)),
                ('address', models.CharField(blank=True, max_length=200)),
                ('slug', models.SlugField(blank=True, max_length=200)),
                ('category', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='main.category')),
                ('district', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='main.district')),
            ],
            options={
                'ordering': ('-created_time',),
            },
        ),
        migrations.CreateModel(
            name='Province',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='WebsiteReview',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('image', models.ImageField(upload_to='website_reviews')),
                ('comment', models.TextField()),
                ('enable', models.BooleanField(default=True)),
                ('index', models.PositiveIntegerField(default=0)),
            ],
            options={
                'ordering': ('index', 'name'),
            },
        ),
        migrations.CreateModel(
            name='Ward',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('district', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='wards', to='main.district')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('avatar', models.ImageField(blank=True, upload_to='avatar')),
                ('telephone', models.CharField(blank=True, max_length=50)),
                ('address', models.CharField(blank=True, max_length=200)),
                ('district', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='main.district')),
                ('province', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='main.province')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='userprofile', to=settings.AUTH_USER_MODEL)),
                ('ward', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='main.ward')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Subscriber',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=50, unique=True)),
                ('enable', models.BooleanField(default=True)),
                ('user', models.OneToOneField(default=None, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='subscriber', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ProductReview',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('enable', models.BooleanField(default=True)),
                ('vote', models.IntegerField(choices=[(1, 'Rất Tệ'), (2, 'Không Tệ'), (3, 'Trung Bình'), (4, 'Tốt'), (5, 'Rất Tốt')])),
                ('name', models.CharField(blank=True, default='Anonymous', max_length=50)),
                ('email', models.EmailField(max_length=50)),
                ('comment', models.TextField(blank=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reviews', to='main.product')),
            ],
            options={
                'ordering': ('-created_time',),
            },
        ),
        migrations.CreateModel(
            name='ProductImage',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('alt', models.CharField(blank=True, max_length=200)),
                ('path', models.ImageField(max_length=255, upload_to='product')),
                ('index', models.PositiveIntegerField(default=0)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='images', to='main.product')),
            ],
            options={
                'ordering': ('index', 'created_time'),
            },
        ),
        migrations.AddField(
            model_name='product',
            name='province',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='main.province'),
        ),
        migrations.AddField(
            model_name='product',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='product',
            name='ward',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='main.ward'),
        ),
        migrations.CreateModel(
            name='NewsComment',
            fields=[
                ('created_time', models.DateTimeField(auto_now_add=True)),
                ('modified_time', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('email', models.EmailField(max_length=50)),
                ('phone_number', models.CharField(blank=True, max_length=50)),
                ('content', models.TextField(blank=True)),
                ('news', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='main.news')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='news',
            name='category',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='news', to='main.newscategory'),
        ),
        migrations.AddField(
            model_name='news',
            name='tags',
            field=models.ManyToManyField(related_name='news', to='main.NewsTag'),
        ),
        migrations.AddField(
            model_name='district',
            name='province',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='districts', to='main.province'),
        ),
        migrations.CreateModel(
            name='ProductVisitor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.GenericIPAddressField()),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='visitors', to='main.product')),
            ],
            options={
                'unique_together': {('ip_address', 'product')},
            },
        ),
    ]