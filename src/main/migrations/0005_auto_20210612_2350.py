# Generated by Django 3.2.4 on 2021-06-12 16:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_auto_20210612_1118'),
    ]

    operations = [
        migrations.AlterField(
            model_name='province',
            name='name',
            field=models.CharField(max_length=200, unique=True),
        ),
        migrations.AlterUniqueTogether(
            name='district',
            unique_together={('province', 'name')},
        ),
        migrations.AlterUniqueTogether(
            name='ward',
            unique_together={('district', 'name')},
        ),
    ]
