jQuery(document).ready(function ($) {
	jQuery(document).on('click', '.action_pro', function () {
		jQuery('.hide-group_option').slideToggle(400);
	});

	jQuery(document).on('change', '#category1', function () {
		var id_tp = jQuery(this).val();
		var arr_qh = { "0": "003", "1": "268", "2": "004", "4": "005", "6": "773", "7": "760" };
		$.ajax({
			url: 'http://theme264v45.demov5.keyweb.vn/wp-admin/admin-ajax.php',
			type: 'post',
			dataType: 'json',
			data: { action: 'search_nangcao', id_tp: id_tp, arr_qh: arr_qh },
		})
			.done(function (e) {
				var $option = '';
				$option += '<option selected="selected">Quận/huyện</option>';
				$.each(e, function (index, el) {
					if (index == 'qh') {
						$.each(el, function (i, val) {
							$option += '<option  value="' + i + '">' + val + '</option>';
							console.log(val);
						});
					}
				});
				jQuery('#category2').html($option);
			})
			.fail(function () {
				console.log("error");
			})
			.always(function () {
				console.log("complete");
			});

	})
});