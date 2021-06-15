from urllib.parse import urljoin
import requests
from django.core.management.base import BaseCommand

from main.models import Province, District, Ward


class Command(BaseCommand):
	help = 'Initial Vietnamese Area (Province, District, Ward)'
	base_url = 'https://thongtindoanhnghiep.co'
	province_path = '/api/city'
	district_path = 'api/city/{}/district'
	ward_path = '/api/district/{}/ward'

	def handle(self, *args, **options):
		province_url = urljoin(self.base_url, self.province_path)
		resp_p = requests.get(province_url)
		if resp_p.status_code == 200:
			p_data = resp_p.json()['LtsItem']
			for province in p_data:
				if province['SolrID'].endswith('/chua-ro'):
					continue
				p_obj = Province.objects.create(name=province['Title'])
				district_url = urljoin(self.base_url, self.district_path.format(province['ID']))
				resp_d = requests.get(district_url)
				if resp_d.status_code == 200:
					d_data = resp_d.json()
					for district in d_data:
						if district['SolrID'].endswith('/chua-ro'):
							continue
						d_obj = District.objects.create(
							province=p_obj,
							name=district['Title']
						)
						ward_url = urljoin(self.base_url, self.ward_path.format(district['ID']))
						resp_w = requests.get(ward_url)
						if resp_w.status_code == 200:
							w_data = resp_w.json()
							for ward in w_data:
								if ward['SolrID'].endswith('/chua-ro'):
									continue
								Ward.objects.create(
									district=d_obj,
									name=ward['Title']
								)

								self.stdout.write(self.style.SUCCESS('Successfully Initial Ward: {} - {} - {}'.format(province['Title'], district['Title'], ward['Title'])))
						self.stdout.write(self.style.SUCCESS('Successfully Initial District: {} - {}'.format(province['Title'], district['Title'])))
				self.stdout.write(self.style.SUCCESS('Successfully Initial Province: {}'.format(province['Title'])))
