jQuery(document).ready(function ($) {
	jQuery('#tabs1-h').tabs();

	jQuery('.list-products-slide .products').show().addClass('owl-carousel owl-theme').owlCarousel({
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
				items: 1,
				nav: false,
				dots: true
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