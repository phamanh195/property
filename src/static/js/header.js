function waitJquery(callbackwaitJquery) {
	var i = 0;
	var interval = setInterval(function () {
		if (window.jQuery) {
			jQuery(document).ready(function () {
				if (i++ == 0) {
					callbackwaitJquery()
				}
				clearInterval(interval)
			})
		}
	}, 10)
}

function checkMinheight(e) {
	var t = 0,
		r = jQuery(e);
	jQuery(r).each(function () {
		var e = parseInt(jQuery(this).css("height"));
		t < e && (t = e)
	}), t += 1, jQuery(r).each(function () {
		jQuery(this).css("min-height", t + "px")
	})
}
var $ = jQuery;
waitJquery(function () {
	jQuery(".woocommerce .full-content .related ul.products").addClass("owl-theme owl-carousel");
	jQuery(".group-footer .text-group h3").click(function () {
		if (jQuery(window).width() > 768) {
			return !1
		} else {
			var footer = jQuery(".group-footer .text-group h3").index(this);
			if (jQuery(this).hasClass("active")) {
				jQuery(this).removeClass("active")
			} else {
				jQuery(this).addClass("active")
			}
			jQuery(this).parent().siblings('.content-group').slideToggle("slow")
		}
	});
	jQuery(".group-sidebar h3").click(function () {
		if (jQuery(window).width() > 980) {
			return !1
		} else {
			var sidebar = jQuery(".group-sidebar").index(this);
			if (jQuery(this).hasClass("active")) {
				jQuery(this).removeClass("active")
			} else {
				jQuery(this).addClass("active")
			}
			jQuery(this).closest('.group-sidebar').find(" .block-content").slideToggle("slow")
		}
	});
	jQuery('#sidebar-filters').on('click', function () {
		jQuery(this).toggleClass('active');
		jQuery(this).closest('.sidebar-archive').find('.contents').toggleClass('active')
	});
	jQuery(".product-nb").find("ul.products").addClass("owl-carousel owl-theme");
	jQuery(".product-sale").find("ul.products").addClass("owl-carousel owl-theme");
	jQuery(".product-mn").find("ul.products").addClass("owl-carousel owl-theme");
	jQuery(".full-menubar").find("#menu-primary").clone().appendTo(".overlay-menu");
	jQuery(".btn-navbar").click(function () {
		jQuery(".overlay-menu").css("width", "250")
	});
	jQuery(".overlay-menu .close span").click(function () {
		jQuery(".overlay-menu").css("width", "0")
	});
	jQuery(".sidebar-pro .text-group").click(function () {
		if (jQuery(window).width() > 767) {
			return !1
		} else {
			var sb = jQuery(".sidebar-pro .text-group").index(this);
			if (jQuery(this).hasClass("active")) {
				jQuery(this).removeClass("active")
			} else {
				jQuery(this).addClass("active")
			}
			jQuery(".sidebar-pro .content-groups").eq(sb).slideToggle("slow")
		}
	});
	jQuery(".overlay-menu").find(".menu-item-has-children").append('<span class="touch-button"></span>');
	jQuery(".woocommerce-tabs .info-product li h3").click(function () {
		if (jQuery(this).children("a").hasClass("active")) {
			jQuery(this).next(".display-info").slideUp("slow");
			jQuery(this).children("a").removeClass("active")
		} else {
			jQuery(this).children("a").addClass("active");
			jQuery(this).next(".display-info").slideDown("slow")
		}
	});
	jQuery(document).on('click', ".close,.quick-view-bg", function () {
		jQuery('.show-quick-view').fadeOut(300);
		jQuery('body').css('overflow', 'inherit').removeClass('body-fixed')
		return !1
	})
});