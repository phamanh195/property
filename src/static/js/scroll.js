jQuery(function () {
    jQuery(window).scroll(function () {
        if (jQuery(this).scrollTop() != 0) {
            jQuery('#bttop').fadeIn();
        } else {
            jQuery('#bttop').fadeOut();
        }
    });
    jQuery('#bttop').click(function () {
        jQuery('body,html').animate({
            scrollTop: 0
        }, 600);
    });
});