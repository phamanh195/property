# Generated by Django 3.2.4 on 2021-06-11 23:54

from django.db import migrations, models
import tinymce.models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_remove_product_user'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='imageslider',
            options={'ordering': ['index', 'created_time']},
        ),
        migrations.AddField(
            model_name='newscomment',
            name='enable',
            field=models.BooleanField(default=True),
        ),
        migrations.AlterField(
            model_name='product',
            name='description',
            field=tinymce.models.HTMLField(blank=True),
        ),
    ]