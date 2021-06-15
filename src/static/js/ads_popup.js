jQuery(document).ready(function ($) {
	// Hàm lấy value cooke theo tên
	function getCookie(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	}
	// Khởi tạo value cookie và tên.
	function setCookie(cname, cvalue, exdays) {
		var d = new Date();
		d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
		var expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}
	jQuery('#popup-subscribe').on('click', '.close-popup', function (event) {
		jQuery('#popup-subscribe').hide();
		setCookie('popupCookie', 'closed', .1);
	});
	if (getCookie('popupCookie') != 'closed') {
		setTimeout(function (event) {
			jQuery('#popup-subscribe').show();
		}, 1000);
	}
	console.log(getCookie('popupCookie'));
});