jQuery(document).ready(function ($) {
	var owl_home_mn = jQuery('.product_row3 ul.products');
	owl_home_mn.show().addClass('owl-carousel owl-theme').owlCarousel({
		items: 4,
		loop: false,
		margin: 20,
		autoplay: true,
		autoplayTimeout: 3000,
		autoplayHoverPause: true,
		dots: false,
		nav: true,
		navText: ['<i class="fas fa-chevron-left"></i>', '<i class="fas fa-chevron-right"></i>'],
		smartSpeed: 1000,
		responsive: {
			0: {
				items: 1
			},
			320: {
				items: 1
			},
			480: {
				items: 1
			},
			767: {
				items: 3
			},
			990: {
				items: 3
			}
		}
	});

});