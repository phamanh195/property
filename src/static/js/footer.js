(function ($) {
	'use strict';
	if (typeof wpcf7 === 'undefined' || wpcf7 === null) {
		return
	}
	wpcf7 = $.extend({
		cached: 0,
		inputs: []
	}, wpcf7);
	$(function () {
		wpcf7.supportHtml5 = (function () {
			var features = {};
			var input = document.createElement('input');
			features.placeholder = 'placeholder' in input;
			var inputTypes = ['email', 'url', 'tel', 'number', 'range', 'date'];
			$.each(inputTypes, function (index, value) {
				input.setAttribute('type', value);
				features[value] = input.type !== 'text'
			});
			return features
		})();
		$('div.wpcf7 > form').each(function () {
			var $form = $(this);
			wpcf7.initForm($form);
			if (wpcf7.cached) {
				wpcf7.refill($form)
			}
		})
	});
	wpcf7.getId = function (form) {
		return parseInt($('input[name="_wpcf7"]', form).val(), 10)
	};
	wpcf7.initForm = function (form) {
		var $form = $(form);
		$form.submit(function (event) {
			if (!wpcf7.supportHtml5.placeholder) {
				$('[placeholder].placeheld', $form).each(function (i, n) {
					$(n).val('').removeClass('placeheld')
				})
			}
			if (typeof window.FormData === 'function') {
				wpcf7.submit($form);
				event.preventDefault()
			}
		});
		$('.wpcf7-submit', $form).after('<span class="ajax-loader"></span>');
		wpcf7.toggleSubmit($form);
		$form.on('click', '.wpcf7-acceptance', function () {
			wpcf7.toggleSubmit($form)
		});
		$('.wpcf7-exclusive-checkbox', $form).on('click', 'input:checkbox', function () {
			var name = $(this).attr('name');
			$form.find('input:checkbox[name="' + name + '"]').not(this).prop('checked', !1)
		});
		$('.wpcf7-list-item.has-free-text', $form).each(function () {
			var $freetext = $(':input.wpcf7-free-text', this);
			var $wrap = $(this).closest('.wpcf7-form-control');
			if ($(':checkbox, :radio', this).is(':checked')) {
				$freetext.prop('disabled', !1)
			} else {
				$freetext.prop('disabled', !0)
			}
			$wrap.on('change', ':checkbox, :radio', function () {
				var $cb = $('.has-free-text', $wrap).find(':checkbox, :radio');
				if ($cb.is(':checked')) {
					$freetext.prop('disabled', !1).focus()
				} else {
					$freetext.prop('disabled', !0)
				}
			})
		});
		if (!wpcf7.supportHtml5.placeholder) {
			$('[placeholder]', $form).each(function () {
				$(this).val($(this).attr('placeholder'));
				$(this).addClass('placeheld');
				$(this).focus(function () {
					if ($(this).hasClass('placeheld')) {
						$(this).val('').removeClass('placeheld')
					}
				});
				$(this).blur(function () {
					if ('' === $(this).val()) {
						$(this).val($(this).attr('placeholder'));
						$(this).addClass('placeheld')
					}
				})
			})
		}
		if (wpcf7.jqueryUi && !wpcf7.supportHtml5.date) {
			$form.find('input.wpcf7-date[type="date"]').each(function () {
				$(this).datepicker({
					dateFormat: 'yy-mm-dd',
					minDate: new Date($(this).attr('min')),
					maxDate: new Date($(this).attr('max'))
				})
			})
		}
		if (wpcf7.jqueryUi && !wpcf7.supportHtml5.number) {
			$form.find('input.wpcf7-number[type="number"]').each(function () {
				$(this).spinner({
					min: $(this).attr('min'),
					max: $(this).attr('max'),
					step: $(this).attr('step')
				})
			})
		}
		$('.wpcf7-character-count', $form).each(function () {
			var $count = $(this);
			var name = $count.attr('data-target-name');
			var down = $count.hasClass('down');
			var starting = parseInt($count.attr('data-starting-value'), 10);
			var maximum = parseInt($count.attr('data-maximum-value'), 10);
			var minimum = parseInt($count.attr('data-minimum-value'), 10);
			var updateCount = function (target) {
				var $target = $(target);
				var length = $target.val().length;
				var count = down ? starting - length : length;
				$count.attr('data-current-value', count);
				$count.text(count);
				if (maximum && maximum < length) {
					$count.addClass('too-long')
				} else {
					$count.removeClass('too-long')
				}
				if (minimum && length < minimum) {
					$count.addClass('too-short')
				} else {
					$count.removeClass('too-short')
				}
			};
			$(':input[name="' + name + '"]', $form).each(function () {
				updateCount(this);
				$(this).keyup(function () {
					updateCount(this)
				})
			})
		});
		$form.on('change', '.wpcf7-validates-as-url', function () {
			var val = $.trim($(this).val());
			if (val && !val.match(/^[a-z][a-z0-9.+-]*:/i) && -1 !== val.indexOf('.')) {
				val = val.replace(/^\/+/, '');
				val = 'http://' + val
			}
			$(this).val(val)
		})
	};
	wpcf7.submit = function (form) {
		if (typeof window.FormData !== 'function') {
			return
		}
		var $form = $(form);
		$('.ajax-loader', $form).addClass('is-active');
		wpcf7.clearResponse($form);
		var formData = new FormData($form.get(0));
		var detail = {
			id: $form.closest('div.wpcf7').attr('id'),
			status: 'init',
			inputs: [],
			formData: formData
		};
		$.each($form.serializeArray(), function (i, field) {
			if ('_wpcf7' == field.name) {
				detail.contactFormId = field.value
			} else if ('_wpcf7_version' == field.name) {
				detail.pluginVersion = field.value
			} else if ('_wpcf7_locale' == field.name) {
				detail.contactFormLocale = field.value
			} else if ('_wpcf7_unit_tag' == field.name) {
				detail.unitTag = field.value
			} else if ('_wpcf7_container_post' == field.name) {
				detail.containerPostId = field.value
			} else if (field.name.match(/^_wpcf7_\w+_free_text_/)) {
				var owner = field.name.replace(/^_wpcf7_\w+_free_text_/, '');
				detail.inputs.push({
					name: owner + '-free-text',
					value: field.value
				})
			} else if (field.name.match(/^_/)) {} else {
				detail.inputs.push(field)
			}
		});
		wpcf7.triggerEvent($form.closest('div.wpcf7'), 'beforesubmit', detail);
		var ajaxSuccess = function (data, status, xhr, $form) {
			detail.id = $(data.into).attr('id');
			detail.status = data.status;
			detail.apiResponse = data;
			var $message = $('.response-output', $form);
			switch (data.status) {
				case 'validation_failed':
					$.each(data.invalidFields, function (i, n) {
						$(n.into, $form).each(function () {
							wpcf7.notValidTip(this, n.message);
							$('.wpcf7-form-control', this).addClass('wpcf7-not-valid');
							$('[aria-invalid]', this).attr('aria-invalid', 'true')
						})
					});
					$message.addClass('validation-errors');
					$form.addClass('invalid');
					wpcf7.triggerEvent(data.into, 'invalid', detail);
					break;
				case 'acceptance_missing':
					$message.addClass('wpcf7-acceptance-missing');
					$form.addClass('unaccepted');
					wpcf7.triggerEvent(data.into, 'unaccepted', detail);
					break;
				case 'spam':
					$message.addClass('wpcf7-spam-blocked');
					$form.addClass('spam');
					wpcf7.triggerEvent(data.into, 'spam', detail);
					break;
				case 'aborted':
					$message.addClass('wpcf7-aborted');
					$form.addClass('aborted');
					wpcf7.triggerEvent(data.into, 'aborted', detail);
					break;
				case 'mail_sent':
					$message.addClass('wpcf7-mail-sent-ok');
					$form.addClass('sent');
					wpcf7.triggerEvent(data.into, 'mailsent', detail);
					break;
				case 'mail_failed':
					$message.addClass('wpcf7-mail-sent-ng');
					$form.addClass('failed');
					wpcf7.triggerEvent(data.into, 'mailfailed', detail);
					break;
				default:
					var customStatusClass = 'custom-' + data.status.replace(/[^0-9a-z]+/i, '-');
					$message.addClass('wpcf7-' + customStatusClass);
					$form.addClass(customStatusClass)
			}
			wpcf7.refill($form, data);
			wpcf7.triggerEvent(data.into, 'submit', detail);
			if ('mail_sent' == data.status) {
				$form.each(function () {
					this.reset()
				});
				wpcf7.toggleSubmit($form)
			}
			if (!wpcf7.supportHtml5.placeholder) {
				$form.find('[placeholder].placeheld').each(function (i, n) {
					$(n).val($(n).attr('placeholder'))
				})
			}
			$message.html('').append(data.message).slideDown('fast');
			$message.attr('role', 'alert');
			$('.screen-reader-response', $form.closest('.wpcf7')).each(function () {
				var $response = $(this);
				$response.html('').attr('role', '').append(data.message);
				if (data.invalidFields) {
					var $invalids = $('<ul></ul>');
					$.each(data.invalidFields, function (i, n) {
						if (n.idref) {
							var $li = $('<li></li>').append($('<a></a>').attr('href', '#' + n.idref).append(n.message))
						} else {
							var $li = $('<li></li>').append(n.message)
						}
						$invalids.append($li)
					});
					$response.append($invalids)
				}
				$response.attr('role', 'alert').focus()
			})
		};
		$.ajax({
			type: 'POST',
			url: wpcf7.apiSettings.getRoute('/contact-forms/' + wpcf7.getId($form) + '/feedback'),
			data: formData,
			dataType: 'json',
			processData: !1,
			contentType: !1
		}).done(function (data, status, xhr) {
			ajaxSuccess(data, status, xhr, $form);
			$('.ajax-loader', $form).removeClass('is-active')
		}).fail(function (xhr, status, error) {
			var $e = $('<div class="ajax-error"></div>').text(error.message);
			$form.after($e)
		})
	};
	wpcf7.triggerEvent = function (target, name, detail) {
		var $target = $(target);
		var event = new CustomEvent('wpcf7' + name, {
			bubbles: !0,
			detail: detail
		});
		$target.get(0).dispatchEvent(event);
		$target.trigger('wpcf7:' + name, detail);
		$target.trigger(name + '.wpcf7', detail)
	};
	wpcf7.toggleSubmit = function (form, state) {
		var $form = $(form);
		var $submit = $('input:submit', $form);
		if (typeof state !== 'undefined') {
			$submit.prop('disabled', !state);
			return
		}
		if ($form.hasClass('wpcf7-acceptance-as-validation')) {
			return
		}
		$submit.prop('disabled', !1);
		$('.wpcf7-acceptance', $form).each(function () {
			var $span = $(this);
			var $input = $('input:checkbox', $span);
			if (!$span.hasClass('optional')) {
				if ($span.hasClass('invert') && $input.is(':checked') || !$span.hasClass('invert') && !$input.is(':checked')) {
					$submit.prop('disabled', !0);
					return !1
				}
			}
		})
	};
	wpcf7.notValidTip = function (target, message) {
		var $target = $(target);
		$('.wpcf7-not-valid-tip', $target).remove();
		$('<span role="alert" class="wpcf7-not-valid-tip"></span>').text(message).appendTo($target);
		if ($target.is('.use-floating-validation-tip *')) {
			var fadeOut = function (target) {
				$(target).not(':hidden').animate({
					opacity: 0
				}, 'fast', function () {
					$(this).css({
						'z-index': -100
					})
				})
			};
			$target.on('mouseover', '.wpcf7-not-valid-tip', function () {
				fadeOut(this)
			});
			$target.on('focus', ':input', function () {
				fadeOut($('.wpcf7-not-valid-tip', $target))
			})
		}
	};
	wpcf7.refill = function (form, data) {
		var $form = $(form);
		var refillCaptcha = function ($form, items) {
			$.each(items, function (i, n) {
				$form.find(':input[name="' + i + '"]').val('');
				$form.find('img.wpcf7-captcha-' + i).attr('src', n);
				var match = /([0-9]+)\.(png|gif|jpeg)$/.exec(n);
				$form.find('input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]').attr('value', match[1])
			})
		};
		var refillQuiz = function ($form, items) {
			$.each(items, function (i, n) {
				$form.find(':input[name="' + i + '"]').val('');
				$form.find(':input[name="' + i + '"]').siblings('span.wpcf7-quiz-label').text(n[0]);
				$form.find('input:hidden[name="_wpcf7_quiz_answer_' + i + '"]').attr('value', n[1])
			})
		};
		if (typeof data === 'undefined') {
			$.ajax({
				type: 'GET',
				url: wpcf7.apiSettings.getRoute('/contact-forms/' + wpcf7.getId($form) + '/refill'),
				beforeSend: function (xhr) {
					var nonce = $form.find(':input[name="_wpnonce"]').val();
					if (nonce) {
						xhr.setRequestHeader('X-WP-Nonce', nonce)
					}
				},
				dataType: 'json'
			}).done(function (data, status, xhr) {
				if (data.captcha) {
					refillCaptcha($form, data.captcha)
				}
				if (data.quiz) {
					refillQuiz($form, data.quiz)
				}
			})
		} else {
			if (data.captcha) {
				refillCaptcha($form, data.captcha)
			}
			if (data.quiz) {
				refillQuiz($form, data.quiz)
			}
		}
	};
	wpcf7.clearResponse = function (form) {
		var $form = $(form);
		$form.removeClass('invalid spam sent failed');
		$form.siblings('.screen-reader-response').html('').attr('role', '');
		$('.wpcf7-not-valid-tip', $form).remove();
		$('[aria-invalid]', $form).attr('aria-invalid', 'false');
		$('.wpcf7-form-control', $form).removeClass('wpcf7-not-valid');
		$('.response-output', $form).hide().empty().removeAttr('role').removeClass('wpcf7-mail-sent-ok wpcf7-mail-sent-ng validation-errors wpcf7-spam-blocked')
	};
	wpcf7.apiSettings.getRoute = function (path) {
		var url = wpcf7.apiSettings.root;
		url = url.replace(wpcf7.apiSettings.namespace, wpcf7.apiSettings.namespace + path);
		return url
	}
})(jQuery);
(function () {
	if (typeof window.CustomEvent === "function") return !1;

	function CustomEvent(event, params) {
		params = params || {
			bubbles: !1,
			cancelable: !1,
			detail: undefined
		};
		var evt = document.createEvent('CustomEvent');
		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
		return evt
	}
	CustomEvent.prototype = window.Event.prototype;
	window.CustomEvent = CustomEvent
})();
/*!
 * jQuery blockUI plugin
 * Version 2.70.0-2014.11.23
 * Requires jQuery v1.7 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2013 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */
! function () {
	"use strict";

	function e(e) {
		function t(t, n) {
			var s, h, k = t == window,
				y = n && n.message !== undefined ? n.message : undefined;
			if (!(n = e.extend({}, e.blockUI.defaults, n || {})).ignoreIfBlocked || !e(t).data("blockUI.isBlocked")) {
				if (n.overlayCSS = e.extend({}, e.blockUI.defaults.overlayCSS, n.overlayCSS || {}), s = e.extend({}, e.blockUI.defaults.css, n.css || {}), n.onOverlayClick && (n.overlayCSS.cursor = "pointer"), h = e.extend({}, e.blockUI.defaults.themedCSS, n.themedCSS || {}), y = y === undefined ? n.message : y, k && p && o(window, {
						fadeOut: 0
					}), y && "string" != typeof y && (y.parentNode || y.jquery)) {
					var m = y.jquery ? y[0] : y,
						g = {};
					e(t).data("blockUI.history", g), g.el = m, g.parent = m.parentNode, g.display = m.style.display, g.position = m.style.position, g.parent && g.parent.removeChild(m)
				}
				e(t).data("blockUI.onUnblock", n.onUnblock);
				var v, I, w, U, x = n.baseZ;
				v = e(r || n.forceIframe ? '<iframe class="blockUI" style="z-index:' + x++ + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + n.iframeSrc + '"></iframe>' : '<div class="blockUI" style="display:none"></div>'), I = e(n.theme ? '<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + x++ + ';display:none"></div>' : '<div class="blockUI blockOverlay" style="z-index:' + x++ + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'), n.theme && k ? (U = '<div class="blockUI ' + n.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + (x + 10) + ';display:none;position:fixed">', n.title && (U += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (n.title || "&nbsp;") + "</div>"), U += '<div class="ui-widget-content ui-dialog-content"></div>', U += "</div>") : n.theme ? (U = '<div class="blockUI ' + n.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + (x + 10) + ';display:none;position:absolute">', n.title && (U += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (n.title || "&nbsp;") + "</div>"), U += '<div class="ui-widget-content ui-dialog-content"></div>', U += "</div>") : U = k ? '<div class="blockUI ' + n.blockMsgClass + ' blockPage" style="z-index:' + (x + 10) + ';display:none;position:fixed"></div>' : '<div class="blockUI ' + n.blockMsgClass + ' blockElement" style="z-index:' + (x + 10) + ';display:none;position:absolute"></div>', w = e(U), y && (n.theme ? (w.css(h), w.addClass("ui-widget-content")) : w.css(s)), n.theme || I.css(n.overlayCSS), I.css("position", k ? "fixed" : "absolute"), (r || n.forceIframe) && v.css("opacity", 0);
				var C = [v, I, w],
					S = e(k ? "body" : t);
				e.each(C, function () {
					this.appendTo(S)
				}), n.theme && n.draggable && e.fn.draggable && w.draggable({
					handle: ".ui-dialog-titlebar",
					cancel: "li"
				});
				var O = f && (!e.support.boxModel || e("object,embed", k ? null : t).length > 0);
				if (u || O) {
					if (k && n.allowBodyStretch && e.support.boxModel && e("html,body").css("height", "100%"), (u || !e.support.boxModel) && !k) var E = a(t, "borderTopWidth"),
						T = a(t, "borderLeftWidth"),
						M = E ? "(0 - " + E + ")" : 0,
						B = T ? "(0 - " + T + ")" : 0;
					e.each(C, function (e, t) {
						var o = t[0].style;
						if (o.position = "absolute", e < 2) k ? o.setExpression("height", "Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:" + n.quirksmodeOffsetHack + ') + "px"') : o.setExpression("height", 'this.parentNode.offsetHeight + "px"'), k ? o.setExpression("width", 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"') : o.setExpression("width", 'this.parentNode.offsetWidth + "px"'), B && o.setExpression("left", B), M && o.setExpression("top", M);
						else if (n.centerY) k && o.setExpression("top", '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"'), o.marginTop = 0;
						else if (!n.centerY && k) {
							var i = "((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + " + (n.css && n.css.top ? parseInt(n.css.top, 10) : 0) + ') + "px"';
							o.setExpression("top", i)
						}
					})
				}
				if (y && (n.theme ? w.find(".ui-widget-content").append(y) : w.append(y), (y.jquery || y.nodeType) && e(y).show()), (r || n.forceIframe) && n.showOverlay && v.show(), n.fadeIn) {
					var j = n.onBlock ? n.onBlock : c,
						H = n.showOverlay && !y ? j : c,
						z = y ? j : c;
					n.showOverlay && I._fadeIn(n.fadeIn, H), y && w._fadeIn(n.fadeIn, z)
				} else n.showOverlay && I.show(), y && w.show(), n.onBlock && n.onBlock.bind(w)();
				if (i(1, t, n), k ? (p = w[0], b = e(n.focusableElements, p), n.focusInput && setTimeout(l, 20)) : d(w[0], n.centerX, n.centerY), n.timeout) {
					var W = setTimeout(function () {
						k ? e.unblockUI(n) : e(t).unblock(n)
					}, n.timeout);
					e(t).data("blockUI.timeout", W)
				}
			}
		}

		function o(t, o) {
			var s, l = t == window,
				d = e(t),
				a = d.data("blockUI.history"),
				c = d.data("blockUI.timeout");
			c && (clearTimeout(c), d.removeData("blockUI.timeout")), o = e.extend({}, e.blockUI.defaults, o || {}), i(0, t, o), null === o.onUnblock && (o.onUnblock = d.data("blockUI.onUnblock"), d.removeData("blockUI.onUnblock"));
			var r;
			r = l ? e(document.body).children().filter(".blockUI").add("body > .blockUI") : d.find(">.blockUI"), o.cursorReset && (r.length > 1 && (r[1].style.cursor = o.cursorReset), r.length > 2 && (r[2].style.cursor = o.cursorReset)), l && (p = b = null), o.fadeOut ? (s = r.length, r.stop().fadeOut(o.fadeOut, function () {
				0 == --s && n(r, a, o, t)
			})) : n(r, a, o, t)
		}

		function n(t, o, n, i) {
			var s = e(i);
			if (!s.data("blockUI.isBlocked")) {
				t.each(function (e, t) {
					this.parentNode && this.parentNode.removeChild(this)
				}), o && o.el && (o.el.style.display = o.display, o.el.style.position = o.position, o.el.style.cursor = "default", o.parent && o.parent.appendChild(o.el), s.removeData("blockUI.history")), s.data("blockUI.static") && s.css("position", "static"), "function" == typeof n.onUnblock && n.onUnblock(i, n);
				var l = e(document.body),
					d = l.width(),
					a = l[0].style.width;
				l.width(d - 1).width(d), l[0].style.width = a
			}
		}

		function i(t, o, n) {
			var i = o == window,
				l = e(o);
			if ((t || (!i || p) && (i || l.data("blockUI.isBlocked"))) && (l.data("blockUI.isBlocked", t), i && n.bindEvents && (!t || n.showOverlay))) {
				var d = "mousedown mouseup keydown keypress keyup touchstart touchend touchmove";
				t ? e(document).bind(d, n, s) : e(document).unbind(d, s)
			}
		}

		function s(t) {
			if ("keydown" === t.type && t.keyCode && 9 == t.keyCode && p && t.data.constrainTabKey) {
				var o = b,
					n = !t.shiftKey && t.target === o[o.length - 1],
					i = t.shiftKey && t.target === o[0];
				if (n || i) return setTimeout(function () {
					l(i)
				}, 10), !1
			}
			var s = t.data,
				d = e(t.target);
			return d.hasClass("blockOverlay") && s.onOverlayClick && s.onOverlayClick(t), d.parents("div." + s.blockMsgClass).length > 0 || 0 === d.parents().children().filter("div.blockUI").length
		}

		function l(e) {
			if (b) {
				var t = b[!0 === e ? b.length - 1 : 0];
				t && t.focus()
			}
		}

		function d(e, t, o) {
			var n = e.parentNode,
				i = e.style,
				s = (n.offsetWidth - e.offsetWidth) / 2 - a(n, "borderLeftWidth"),
				l = (n.offsetHeight - e.offsetHeight) / 2 - a(n, "borderTopWidth");
			t && (i.left = s > 0 ? s + "px" : "0"), o && (i.top = l > 0 ? l + "px" : "0")
		}

		function a(t, o) {
			return parseInt(e.css(t, o), 10) || 0
		}
		e.fn._fadeIn = e.fn.fadeIn;
		var c = e.noop || function () {},
			r = /MSIE/.test(navigator.userAgent),
			u = /MSIE 6.0/.test(navigator.userAgent) && !/MSIE 8.0/.test(navigator.userAgent),
			f = (document.documentMode, e.isFunction(document.createElement("div").style.setExpression));
		e.blockUI = function (e) {
			t(window, e)
		}, e.unblockUI = function (e) {
			o(window, e)
		}, e.growlUI = function (t, o, n, i) {
			var s = e('<div class="growlUI"></div>');
			t && s.append("<h1>" + t + "</h1>"), o && s.append("<h2>" + o + "</h2>"), n === undefined && (n = 3e3);
			var l = function (t) {
				t = t || {}, e.blockUI({
					message: s,
					fadeIn: "undefined" != typeof t.fadeIn ? t.fadeIn : 700,
					fadeOut: "undefined" != typeof t.fadeOut ? t.fadeOut : 1e3,
					timeout: "undefined" != typeof t.timeout ? t.timeout : n,
					centerY: !1,
					showOverlay: !1,
					onUnblock: i,
					css: e.blockUI.defaults.growlCSS
				})
			};
			l();
			s.css("opacity");
			s.mouseover(function () {
				l({
					fadeIn: 0,
					timeout: 3e4
				});
				var t = e(".blockMsg");
				t.stop(), t.fadeTo(300, 1)
			}).mouseout(function () {
				e(".blockMsg").fadeOut(1e3)
			})
		}, e.fn.block = function (o) {
			if (this[0] === window) return e.blockUI(o), this;
			var n = e.extend({}, e.blockUI.defaults, o || {});
			return this.each(function () {
				var t = e(this);
				n.ignoreIfBlocked && t.data("blockUI.isBlocked") || t.unblock({
					fadeOut: 0
				})
			}), this.each(function () {
				"static" == e.css(this, "position") && (this.style.position = "relative", e(this).data("blockUI.static", !0)), this.style.zoom = 1, t(this, o)
			})
		}, e.fn.unblock = function (t) {
			return this[0] === window ? (e.unblockUI(t), this) : this.each(function () {
				o(this, t)
			})
		}, e.blockUI.version = 2.7, e.blockUI.defaults = {
			message: "<h1>Please wait...</h1>",
			title: null,
			draggable: !0,
			theme: !1,
			css: {
				padding: 0,
				margin: 0,
				width: "30%",
				top: "40%",
				left: "35%",
				textAlign: "center",
				color: "#000",
				border: "3px solid #aaa",
				backgroundColor: "#fff",
				cursor: "wait"
			},
			themedCSS: {
				width: "30%",
				top: "40%",
				left: "35%"
			},
			overlayCSS: {
				backgroundColor: "#000",
				opacity: .6,
				cursor: "wait"
			},
			cursorReset: "default",
			growlCSS: {
				width: "350px",
				top: "10px",
				left: "",
				right: "10px",
				border: "none",
				padding: "5px",
				opacity: .6,
				cursor: "default",
				color: "#fff",
				backgroundColor: "#000",
				"-webkit-border-radius": "10px",
				"-moz-border-radius": "10px",
				"border-radius": "10px"
			},
			iframeSrc: /^https/i.test(window.location.href || "") ? "javascript:false" : "about:blank",
			forceIframe: !1,
			baseZ: 1e3,
			centerX: !0,
			centerY: !0,
			allowBodyStretch: !0,
			bindEvents: !0,
			constrainTabKey: !0,
			fadeIn: 200,
			fadeOut: 400,
			timeout: 0,
			showOverlay: !0,
			focusInput: !0,
			focusableElements: ":input:enabled:visible",
			onBlock: null,
			onUnblock: null,
			onOverlayClick: null,
			quirksmodeOffsetHack: 4,
			blockMsgClass: "blockMsg",
			ignoreIfBlocked: !1
		};
		var p = null,
			b = []
	}
	"function" == typeof define && define.amd && define.amd.jQuery ? define(["jquery"], e) : e(jQuery)
}();
jQuery(function (o) {
	if ("undefined" == typeof wc_add_to_cart_params) return !1;

	function t() {
		this.requests = [], this.addRequest = this.addRequest.bind(this), this.run = this.run.bind(this), o(document.body).on("click", ".add_to_cart_button", {
			addToCartHandler: this
		}, this.onAddToCart).on("click", ".remove_from_cart_button", {
			addToCartHandler: this
		}, this.onRemoveFromCart).on("added_to_cart", this.updateButton).on("added_to_cart removed_from_cart", {
			addToCartHandler: this
		}, this.updateFragments)
	}
	t.prototype.addRequest = function (t) {
		this.requests.push(t), 1 === this.requests.length && this.run()
	}, t.prototype.run = function () {
		var t = this,
			a = t.requests[0].complete;
		t.requests[0].complete = function () {
			"function" == typeof a && a(), t.requests.shift(), 0 < t.requests.length && t.run()
		}, o.ajax(this.requests[0])
	}, t.prototype.onAddToCart = function (t) {
		var a = o(this);
		if (a.is(".ajax_add_to_cart")) {
			if (!a.attr("data-product_id")) return !0;
			t.preventDefault(), a.removeClass("added"), a.addClass("loading");
			var r = {};
			o.each(a.data(), function (t, a) {
				r[t] = a
			}), o(document.body).trigger("adding_to_cart", [a, r]), t.data.addToCartHandler.addRequest({
				type: "POST",
				url: wc_add_to_cart_params.wc_ajax_url.toString().replace("%%endpoint%%", "add_to_cart"),
				data: r,
				success: function (t) {
					t && (t.error && t.product_url ? window.location = t.product_url : "yes" !== wc_add_to_cart_params.cart_redirect_after_add ? o(document.body).trigger("added_to_cart", [t.fragments, t.cart_hash, a]) : window.location = wc_add_to_cart_params.cart_url)
				},
				dataType: "json"
			})
		}
	}, t.prototype.onRemoveFromCart = function (t) {
		var a = o(this),
			r = a.closest(".woocommerce-mini-cart-item");
		t.preventDefault(), r.block({
			message: null,
			overlayCSS: {
				opacity: .6
			}
		}), t.data.addToCartHandler.addRequest({
			type: "POST",
			url: wc_add_to_cart_params.wc_ajax_url.toString().replace("%%endpoint%%", "remove_from_cart"),
			data: {
				cart_item_key: a.data("cart_item_key")
			},
			success: function (t) {
				t && t.fragments ? o(document.body).trigger("removed_from_cart", [t.fragments, t.cart_hash, a]) : window.location = a.attr("href")
			},
			error: function () {
				window.location = a.attr("href")
			},
			dataType: "json"
		})
	}, t.prototype.updateButton = function (t, a, r, e) {
		(e = void 0 !== e && e) && (e.removeClass("loading"), e.addClass("added"), wc_add_to_cart_params.is_cart || 0 !== e.parent().find(".added_to_cart").length || e.after(' <a href="' + wc_add_to_cart_params.cart_url + '" class="added_to_cart wc-forward" title="' + wc_add_to_cart_params.i18n_view_cart + '">' + wc_add_to_cart_params.i18n_view_cart + "</a>"), o(document.body).trigger("wc_cart_button_updated", [e]))
	}, t.prototype.updateFragments = function (t, a) {
		a && (o.each(a, function (t) {
			o(t).addClass("updating").fadeTo("400", "0.6").block({
				message: null,
				overlayCSS: {
					opacity: .6
				}
			})
		}), o.each(a, function (t, a) {
			o(t).replaceWith(a), o(t).stop(!0).css("opacity", "1").unblock()
		}), o(document.body).trigger("wc_fragments_loaded"))
	}, new t
});
/*!
 * JavaScript Cookie v2.1.4
 * http://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
! function (e) {
	var n = !1;
	if ("function" == typeof define && define.amd && (define(e), n = !0), "object" == typeof exports && (module.exports = e(), n = !0), !n) {
		var o = window.Cookies,
			t = window.Cookies = e();
		t.noConflict = function () {
			return window.Cookies = o, t
		}
	}
}(function () {
	function e() {
		for (var e = 0, n = {}; e < arguments.length; e++) {
			var o = arguments[e];
			for (var t in o) n[t] = o[t]
		}
		return n
	}

	function n(o) {
		function t(n, r, i) {
			var c;
			if ("undefined" != typeof document) {
				if (arguments.length > 1) {
					if ("number" == typeof (i = e({
							path: "/"
						}, t.defaults, i)).expires) {
						var a = new Date;
						a.setMilliseconds(a.getMilliseconds() + 864e5 * i.expires), i.expires = a
					}
					i.expires = i.expires ? i.expires.toUTCString() : "";
					try {
						c = JSON.stringify(r), /^[\{\[]/.test(c) && (r = c)
					} catch (m) {}
					r = o.write ? o.write(r, n) : encodeURIComponent(String(r)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent), n = (n = (n = encodeURIComponent(String(n))).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)).replace(/[\(\)]/g, escape);
					var f = "";
					for (var s in i) i[s] && (f += "; " + s, !0 !== i[s] && (f += "=" + i[s]));
					return document.cookie = n + "=" + r + f
				}
				n || (c = {});
				for (var p = document.cookie ? document.cookie.split("; ") : [], d = /(%[0-9A-Z]{2})+/g, u = 0; u < p.length; u++) {
					var l = p[u].split("="),
						C = l.slice(1).join("=");
					'"' === C.charAt(0) && (C = C.slice(1, -1));
					try {
						var g = l[0].replace(d, decodeURIComponent);
						if (C = o.read ? o.read(C, g) : o(C, g) || C.replace(d, decodeURIComponent), this.json) try {
							C = JSON.parse(C)
						} catch (m) {}
						if (n === g) {
							c = C;
							break
						}
						n || (c[g] = C)
					} catch (m) {}
				}
				return c
			}
		}
		return t.set = t, t.get = function (e) {
			return t.call(t, e)
		}, t.getJSON = function () {
			return t.apply({
				json: !0
			}, [].slice.call(arguments))
		}, t.defaults = {}, t.remove = function (n, o) {
			t(n, "", e(o, {
				expires: -1
			}))
		}, t.withConverter = n, t
	}
	return n(function () {})
});
jQuery(function (i) {
	i(".woocommerce-ordering").on("change", "select.orderby", function () {
		i(this).closest("form").submit()
	}), i("input.qty:not(.product-quantity input.qty)").each(function () {
		var e = parseFloat(i(this).attr("min"));
		0 <= e && parseFloat(i(this).val()) < e && i(this).val(e)
	});
	var o = "store_notice" + (i(".woocommerce-store-notice").data("notice-id") || "");
	"hidden" === Cookies.get(o) ? i(".woocommerce-store-notice").hide() : i(".woocommerce-store-notice").show(), i(".woocommerce-store-notice__dismiss-link").click(function (e) {
		Cookies.set(o, "hidden", {
			path: "/"
		}), i(".woocommerce-store-notice").hide(), e.preventDefault()
	}), i(document.body).on("click", function () {
		i(".woocommerce-input-wrapper span.description:visible").prop("aria-hidden", !0).slideUp(250)
	}), i(".woocommerce-input-wrapper").on("click", function (e) {
		e.stopPropagation()
	}), i(".woocommerce-input-wrapper :input").on("keydown", function (e) {
		var o = i(this).parent().find("span.description");
		if (27 === e.which && o.length && o.is(":visible")) return o.prop("aria-hidden", !0).slideUp(250), e.preventDefault(), !1
	}).on("click focus", function () {
		var e = i(this).parent(),
			o = e.find("span.description");
		e.addClass("currentTarget"), i(".woocommerce-input-wrapper:not(.currentTarget) span.description:visible").prop("aria-hidden", !0).slideUp(250), o.length && o.is(":hidden") && o.prop("aria-hidden", !1).slideDown(250), e.removeClass("currentTarget")
	}), i.scroll_to_notices = function (e) {
		e.length && i("html, body").animate({
			scrollTop: e.offset().top - 100
		}, 1e3)
	}
});
jQuery(function (r) {
	if ("undefined" == typeof wc_cart_fragments_params) return !1;
	var t = !0,
		o = wc_cart_fragments_params.cart_hash_key;
	try {
		t = "sessionStorage" in window && null !== window.sessionStorage, window.sessionStorage.setItem("wc", "test"), window.sessionStorage.removeItem("wc"), window.localStorage.setItem("wc", "test"), window.localStorage.removeItem("wc")
	} catch (f) {
		t = !1
	}

	function a() {
		t && sessionStorage.setItem("wc_cart_created", (new Date).getTime())
	}

	function s(e) {
		t && (localStorage.setItem(o, e), sessionStorage.setItem(o, e))
	}

	function n() {
		r.ajax(e)
	}
	if (t) {
		var i = null;
		r(document.body).on("wc_fragment_refresh updated_wc_div", function () {
			n()
		}), r(document.body).on("added_to_cart removed_from_cart", function (e, t, r) {
			var n = sessionStorage.getItem(o);
			null !== n && n !== undefined && "" !== n || a(), sessionStorage.setItem(wc_cart_fragments_params.fragment_name, JSON.stringify(t)), s(r)
		}), r(document.body).on("wc_fragments_refreshed", function () {
			clearTimeout(i), i = setTimeout(n, 864e5)
		}), r(window).on("storage onstorage", function (e) {
			o === e.originalEvent.key && localStorage.getItem(o) !== sessionStorage.getItem(o) && n()
		}), r(window).on("pageshow", function (e) {
			e.originalEvent.persisted && (r(".widget_shopping_cart_content").empty(), r(document.body).trigger("wc_fragment_refresh"))
		});
		try {
			var c = r.parseJSON(sessionStorage.getItem(wc_cart_fragments_params.fragment_name)),
				_ = sessionStorage.getItem(o),
				g = Cookies.get("woocommerce_cart_hash"),
				m = sessionStorage.getItem("wc_cart_created");
			if (null !== _ && _ !== undefined && "" !== _ || (_ = ""), null !== g && g !== undefined && "" !== g || (g = ""), _ && (null === m || m === undefined || "" === m)) throw "No cart_created";
			if (m) {
				var d = 1 * m + 864e5,
					w = (new Date).getTime();
				if (d < w) throw "Fragment expired";
				i = setTimeout(n, d - w)
			}
			if (!c || !c["div.widget_shopping_cart_content"] || _ !== g) throw "No fragment";
			r.each(c, function (e, t) {
				r(e).replaceWith(t)
			}), r(document.body).trigger("wc_fragments_loaded")
		} catch (f) {
			n()
		}
	} else n();
	0 < Cookies.get("woocommerce_items_in_cart") ? r(".hide_cart_widget_if_empty").closest(".widget_shopping_cart").show() : r(".hide_cart_widget_if_empty").closest(".widget_shopping_cart").hide(), r(document.body).on("adding_to_cart", function () {
		r(".hide_cart_widget_if_empty").closest(".widget_shopping_cart").show()
	}), "undefined" != typeof wp && wp.customize && wp.customize.selectiveRefresh && wp.customize.widgetsPreview && wp.customize.widgetsPreview.WidgetPartial && wp.customize.selectiveRefresh.bind("partial-content-rendered", function () {
		n()
	})
});
//jQuery.ajax({
//	type: "GET",
//	url: PostViewsCache.ajaxurl,
//	data: {
//		"post_id": PostViewsCache.post_id,
//		"action": "process_postviews",
//	},
//	cache: !1,
//	success: function (data) {}
//});
! function (a) {
	a.fn.hoverIntent = function (b, c, d) {
		var e = {
			interval: 100,
			sensitivity: 6,
			timeout: 0
		};
		e = "object" == typeof b ? a.extend(e, b) : a.isFunction(c) ? a.extend(e, {
			over: b,
			out: c,
			selector: d
		}) : a.extend(e, {
			over: b,
			out: b,
			selector: c
		});
		var f, g, h, i, j = function (a) {
				f = a.pageX, g = a.pageY
			},
			k = function (b, c) {
				return c.hoverIntent_t = clearTimeout(c.hoverIntent_t), Math.sqrt((h - f) * (h - f) + (i - g) * (i - g)) < e.sensitivity ? (a(c).off("mousemove.hoverIntent", j), c.hoverIntent_s = !0, e.over.apply(c, [b])) : (h = f, i = g, c.hoverIntent_t = setTimeout(function () {
					k(b, c)
				}, e.interval), void 0)
			},
			l = function (a, b) {
				return b.hoverIntent_t = clearTimeout(b.hoverIntent_t), b.hoverIntent_s = !1, e.out.apply(b, [a])
			},
			m = function (b) {
				var c = a.extend({}, b),
					d = this;
				d.hoverIntent_t && (d.hoverIntent_t = clearTimeout(d.hoverIntent_t)), "mouseenter" === b.type ? (h = c.pageX, i = c.pageY, a(d).on("mousemove.hoverIntent", j), d.hoverIntent_s || (d.hoverIntent_t = setTimeout(function () {
					k(c, d)
				}, e.interval))) : (a(d).off("mousemove.hoverIntent", j), d.hoverIntent_s && (d.hoverIntent_t = setTimeout(function () {
					l(c, d)
				}, e.timeout)))
			};
		return this.on({
			"mouseenter.hoverIntent": m,
			"mouseleave.hoverIntent": m
		}, e.selector)
	}
}(jQuery);
(function ($) {
	"use strict";
	$.maxmegamenu = function (menu, options) {
		var plugin = this;
		var $menu = $(menu);
		var $toggle_bar = $menu.siblings(".mega-menu-toggle");
		var html_body_class_timeout;
		var defaults = {
			event: $menu.attr("data-event"),
			effect: $menu.attr("data-effect"),
			effect_speed: parseInt($menu.attr("data-effect-speed")),
			effect_mobile: $menu.attr("data-effect-mobile"),
			effect_speed_mobile: parseInt($menu.attr("data-effect-speed-mobile")),
			panel_width: $menu.attr("data-panel-width"),
			panel_inner_width: $menu.attr("data-panel-inner-width"),
			mobile_force_width: $menu.attr("data-mobile-force-width"),
			mobile_overlay: $menu.attr("data-mobile-overlay"),
			second_click: $menu.attr("data-second-click"),
			vertical_behaviour: $menu.attr("data-vertical-behaviour"),
			document_click: $menu.attr("data-document-click"),
			breakpoint: $menu.attr("data-breakpoint"),
			unbind_events: $menu.attr("data-unbind")
		};
		plugin.settings = {};
		var items_with_submenus = $("li.mega-menu-megamenu.mega-menu-item-has-children," + "li.mega-menu-flyout.mega-menu-item-has-children," + "li.mega-menu-tabbed > ul.mega-sub-menu > li.mega-menu-item-has-children," + "li.mega-menu-flyout li.mega-menu-item-has-children", menu);
		plugin.addAnimatingClass = function (element) {
			if (plugin.settings.effect === "disabled") {
				return
			}
			$(".mega-animating").removeClass("mega-animating");
			var timeout = plugin.settings.effect_speed + parseInt(megamenu.timeout, 10);
			element.addClass("mega-animating");
			setTimeout(function () {
				element.removeClass("mega-animating")
			}, timeout)
		};
		plugin.hideAllPanels = function () {
			$(".mega-toggle-on > a.mega-menu-link", $menu).each(function () {
				plugin.hidePanel($(this), !1)
			})
		};
		plugin.hideSiblingPanels = function (anchor, immediate) {
			anchor.parent().parent().find(".mega-toggle-on").children("a.mega-menu-link").each(function () {
				plugin.hidePanel($(this), immediate)
			})
		};
		plugin.isDesktopView = function () {
			return Math.max(window.outerWidth, $(window).width()) > plugin.settings.breakpoint
		};
		plugin.isMobileView = function () {
			return !plugin.isDesktopView()
		};
		plugin.showPanel = function (anchor) {
			anchor.parent().triggerHandler("before_open_panel");
			anchor.attr("aria-expanded", "true");
			$(".mega-animating").removeClass("mega-animating");
			if (plugin.isMobileView() && anchor.parent().hasClass("mega-hide-sub-menu-on-mobile")) {
				return
			}
			if (plugin.isDesktopView() && ($menu.hasClass("mega-menu-horizontal") || $menu.hasClass("mega-menu-vertical")) && !anchor.parent().hasClass("mega-collapse-children")) {
				plugin.hideSiblingPanels(anchor, !0)
			}
			if ((plugin.isMobileView() && $menu.hasClass("mega-keyboard-navigation")) || plugin.settings.vertical_behaviour === "accordion") {
				plugin.hideSiblingPanels(anchor, !1)
			}
			plugin.calculateDynamicSubmenuWidths(anchor);
			if (anchor.parent().hasClass("mega-collapse-children") || plugin.settings.effect === "slide" || (plugin.isMobileView() && (plugin.settings.effect_mobile === "slide" || plugin.settings.effect_mobile === "slide_left" || plugin.settings.effect_mobile === "slide_right"))) {
				var speed = plugin.isMobileView() ? plugin.settings.effect_speed_mobile : plugin.settings.effect_speed;
				anchor.siblings(".mega-sub-menu").css("display", "none").animate({
					"height": "show",
					"paddingTop": "show",
					"paddingBottom": "show",
					"minHeight": "show"
				}, speed, function () {
					$(this).css("display", "")
				})
			}
			anchor.parent().addClass("mega-toggle-on").triggerHandler("open_panel")
		};
		plugin.hidePanel = function (anchor, immediate) {
			anchor.parent().triggerHandler("before_close_panel");
			anchor.attr("aria-expanded", "false");
			if (anchor.parent().hasClass("mega-collapse-children") || (!immediate && plugin.settings.effect === "slide") || (plugin.isMobileView() && (plugin.settings.effect_mobile === "slide" || plugin.settings.effect_mobile === "slide_left" || plugin.settings.effect_mobile === "slide_right"))) {
				var speed = plugin.isMobileView() ? plugin.settings.effect_speed_mobile : plugin.settings.effect_speed;
				anchor.siblings(".mega-sub-menu").animate({
					"height": "hide",
					"paddingTop": "hide",
					"paddingBottom": "hide",
					"minHeight": "hide"
				}, speed, function () {
					anchor.siblings(".mega-sub-menu").css("display", "");
					anchor.parent().removeClass("mega-toggle-on").triggerHandler("close_panel")
				});
				return
			}
			if (immediate) {
				anchor.siblings(".mega-sub-menu").css("display", "none").delay(plugin.settings.effect_speed).queue(function () {
					$(this).css("display", "").dequeue()
				})
			}
			anchor.siblings(".mega-sub-menu").find(".widget_media_video video").each(function () {
				this.player.pause()
			});
			anchor.parent().removeClass("mega-toggle-on").triggerHandler("close_panel");
			plugin.addAnimatingClass(anchor.parent())
		};
		plugin.calculateDynamicSubmenuWidths = function (anchor) {
			if (anchor.parent().hasClass("mega-menu-megamenu") && anchor.parent().parent().hasClass("max-mega-menu") && plugin.settings.panel_width && $(plugin.settings.panel_width).length > 0) {
				if (plugin.isDesktopView()) {
					var submenu_offset = $menu.offset();
					var target_offset = $(plugin.settings.panel_width).offset();
					anchor.siblings(".mega-sub-menu").css({
						width: $(plugin.settings.panel_width).outerWidth(),
						left: (target_offset.left - submenu_offset.left) + "px"
					})
				} else {
					anchor.siblings(".mega-sub-menu").css({
						width: "",
						left: ""
					})
				}
			}
			if (anchor.parent().hasClass("mega-menu-megamenu") && anchor.parent().parent().hasClass("max-mega-menu") && plugin.settings.panel_inner_width && $(plugin.settings.panel_inner_width).length > 0) {
				var target_width = 0;
				if ($(plugin.settings.panel_inner_width).length) {
					target_width = parseInt($(plugin.settings.panel_inner_width).width(), 10)
				} else {
					target_width = parseInt(plugin.settings.panel_inner_width, 10)
				}
				var submenu_width = parseInt(anchor.siblings(".mega-sub-menu").innerWidth(), 10);
				if (plugin.isDesktopView() && target_width > 0 && target_width < submenu_width) {
					anchor.siblings(".mega-sub-menu").css({
						"paddingLeft": (submenu_width - target_width) / 2 + "px",
						"paddingRight": (submenu_width - target_width) / 2 + "px"
					})
				} else {
					anchor.siblings(".mega-sub-menu").css({
						"paddingLeft": "",
						"paddingRight": ""
					})
				}
			}
		};
		var bindClickEvents = function () {
			var dragging = !1;
			$(document).on({
				"touchmove": function (e) {
					dragging = !0
				},
				"touchstart": function (e) {
					dragging = !1
				}
			});
			$(document).on("click touchend", function (e) {
				if (!dragging && plugin.settings.document_click === "collapse" && !$(e.target).closest(".max-mega-menu li").length && !$(e.target).closest(".mega-menu-toggle").length) {
					plugin.hideAllPanels();
					plugin.hideMobileMenu()
				}
				dragging = !1
			});
			var collapse_children_parents = $("li.mega-menu-megamenu li.mega-menu-item-has-children.mega-collapse-children > a.mega-menu-link");
			var clickable_parents = $("> a.mega-menu-link", items_with_submenus).add(collapse_children_parents);
			clickable_parents.on("touchend.megamenu", function (e) {
				plugin.unbindHoverEvents();
				plugin.unbindHoverIntentEvents()
			});
			clickable_parents.on("click.megamenu", function (e) {
				if (plugin.isDesktopView() && $(this).parent().hasClass("mega-toggle-on") && $(this).parent().parent().parent().hasClass("mega-menu-tabbed")) {
					if (plugin.settings.second_click === "go") {
						return
					} else {
						e.preventDefault();
						return
					}
				}
				if (dragging) {
					return
				}
				if (plugin.isMobileView() && $(this).parent().hasClass("mega-hide-sub-menu-on-mobile")) {
					return
				}
				if ((plugin.settings.second_click === "go" || $(this).parent().hasClass("mega-click-click-go")) && $(this).attr("href") !== undefined) {
					if (!$(this).parent().hasClass("mega-toggle-on")) {
						e.preventDefault();
						plugin.showPanel($(this))
					}
				} else {
					e.preventDefault();
					if ($(this).parent().hasClass("mega-toggle-on")) {
						plugin.hidePanel($(this), !1)
					} else {
						plugin.showPanel($(this))
					}
				}
			})
		};
		var bindHoverEvents = function () {
			items_with_submenus.on({
				"mouseenter.megamenu": function () {
					plugin.unbindClickEvents();
					if (!$(this).hasClass("mega-toggle-on")) {
						plugin.showPanel($(this).children("a.mega-menu-link"))
					}
				},
				"mouseleave.megamenu": function () {
					if ($(this).hasClass("mega-toggle-on") && !$(this).hasClass("mega-disable-collapse") && !$(this).parent().parent().hasClass("mega-menu-tabbed")) {
						plugin.hidePanel($(this).children("a.mega-menu-link"), !1)
					}
				}
			})
		};
		var bindHoverIntentEvents = function () {
			items_with_submenus.hoverIntent({
				over: function () {
					plugin.unbindClickEvents();
					if (!$(this).hasClass("mega-toggle-on")) {
						plugin.showPanel($(this).children("a.mega-menu-link"))
					}
				},
				out: function () {
					if ($(this).hasClass("mega-toggle-on") && !$(this).hasClass("mega-disable-collapse") && !$(this).parent().parent().hasClass("mega-menu-tabbed")) {
						plugin.hidePanel($(this).children("a.mega-menu-link"), !1)
					}
				},
				timeout: megamenu.timeout,
				interval: megamenu.interval
			})
		};
		var bindKeyboardEvents = function () {
			var tab_key = 9;
			var escape_key = 27;
			var enter_key = 13;
			var left_arrow_key = 37;
			var right_arrow_key = 39;
			var space_key = 32;
			$menu.parent().on("keyup.megamenu", function (e) {
				var keyCode = e.keyCode || e.which;
				if (keyCode === tab_key) {
					$menu.parent().addClass("mega-keyboard-navigation")
				}
			});
			$menu.parent().on("keydown.megamenu", function (e) {
				var keyCode = e.keyCode || e.which;
				var active_link = $(e.target);
				if (keyCode === space_key && active_link.is(".mega-menu-link") && $menu.parent().hasClass("mega-keyboard-navigation")) {
					e.preventDefault();
					if (active_link.parent().is(items_with_submenus)) {
						if (active_link.parent().hasClass("mega-toggle-on") && !active_link.parent().parent().parent().hasClass("mega-menu-tabbed")) {
							plugin.hidePanel(active_link)
						} else {
							plugin.showPanel(active_link)
						}
					}
				}
			});
			$menu.parent().on("keyup.megamenu", function (e) {
				var keyCode = e.keyCode || e.which;
				var active_link = $(e.target);
				if (keyCode === tab_key && $menu.parent().hasClass("mega-keyboard-navigation")) {
					if (active_link.parent().is(items_with_submenus) && active_link.is("[href]") !== !1) {
						plugin.showPanel(active_link)
					} else {
						if (!active_link.parent().parent().parent().hasClass("mega-menu-tabbed")) {
							plugin.hideSiblingPanels(active_link)
						}
					}
				}
				if (keyCode === escape_key && $menu.parent().hasClass("mega-keyboard-navigation")) {
					var submenu_open = $("> .mega-toggle-on", $menu).length !== 0;
					$("> .mega-toggle-on > a.mega-menu-link", $menu).focus();
					plugin.hideAllPanels();
					if (plugin.isMobileView() && !submenu_open) {
						plugin.hideMobileMenu();
						$(".mega-menu-toggle-block, button.mega-toggle-animated", $toggle_bar).first().focus()
					}
				}
				if (keyCode === enter_key && $menu.parent().hasClass("mega-keyboard-navigation")) {
					if (active_link.hasClass("mega-menu-toggle-block")) {
						if ($toggle_bar.hasClass("mega-menu-open")) {
							plugin.hideMobileMenu()
						} else {
							plugin.showMobileMenu()
						}
					}
					if (active_link.parent().is(items_with_submenus) && active_link.is("[href]") === !1) {
						if (active_link.parent().hasClass("mega-toggle-on") && !active_link.parent().parent().parent().hasClass("mega-menu-tabbed")) {
							plugin.hidePanel(active_link)
						} else {
							plugin.showPanel(active_link)
						}
					}
				}
				if (keyCode === right_arrow_key && plugin.isDesktopView() && $menu.parent().hasClass("mega-keyboard-navigation") && $menu.hasClass("mega-menu-horizontal")) {
					var next_top_level_item = $("> .mega-toggle-on", $menu).nextAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search input[type=text]").first();
					if (next_top_level_item.length === 0) {
						next_top_level_item = $(":focus", $menu).parent().nextAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search input[type=text]").first()
					}
					next_top_level_item.focus();
					if (next_top_level_item.parent().is(items_with_submenus) && next_top_level_item.is("[href]") !== !1) {
						plugin.showPanel(next_top_level_item)
					} else {
						plugin.hideSiblingPanels(next_top_level_item)
					}
				}
				if (keyCode === left_arrow_key && plugin.isDesktopView() && $menu.parent().hasClass("mega-keyboard-navigation") && $menu.hasClass("mega-menu-horizontal")) {
					var prev_top_level_item = $("> .mega-toggle-on", $menu).prevAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search input[type=text]").last();
					if (prev_top_level_item.length === 0) {
						prev_top_level_item = $(":focus", $menu).parent().prevAll("li.mega-menu-item:visible").find("> a.mega-menu-link, .mega-search input[type=text]").last()
					}
					prev_top_level_item.focus();
					if (prev_top_level_item.parent().is(items_with_submenus) && prev_top_level_item.is("[href]") !== !1) {
						plugin.showPanel(prev_top_level_item)
					} else {
						plugin.hideSiblingPanels(prev_top_level_item)
					}
				}
			});
			$menu.parent().on("focusout.megamenu", function (e) {
				if ($menu.parent().hasClass("mega-keyboard-navigation")) {
					setTimeout(function () {
						var menu_has_focus = $menu.parent().find(":focus").length > 0;
						if (!menu_has_focus) {
							$menu.parent().removeClass("mega-keyboard-navigation");
							plugin.hideAllPanels();
							plugin.hideMobileMenu()
						}
					}, 10)
				}
			})
		};
		plugin.unbindAllEvents = function () {
			$("ul.mega-sub-menu, li.mega-menu-item, li.mega-menu-row, li.mega-menu-column, a.mega-menu-link, span.mega-indicator", menu).off().unbind()
		};
		plugin.unbindClickEvents = function () {
			$("> a.mega-menu-link", items_with_submenus).off("click.megamenu touchend.megamenu")
		};
		plugin.unbindHoverEvents = function () {
			items_with_submenus.unbind("mouseenter.megamenu mouseleave.megamenu")
		};
		plugin.unbindHoverIntentEvents = function () {
			items_with_submenus.unbind("mouseenter mouseleave").removeProp("hoverIntent_t").removeProp("hoverIntent_s")
		};
		plugin.unbindKeyboardEvents = function () {
			$menu.parent().off("keyup.megamenu keydown.megamenu focusout.megamenu")
		};
		plugin.unbindMegaMenuEvents = function () {
			if (plugin.settings.event === "hover_intent") {
				plugin.unbindHoverIntentEvents()
			}
			if (plugin.settings.event === "hover") {
				plugin.unbindHoverEvents()
			}
			plugin.unbindClickEvents();
			plugin.unbindKeyboardEvents()
		};
		plugin.bindMegaMenuEvents = function () {
			if (plugin.isDesktopView() && plugin.settings.event === "hover_intent") {
				bindHoverIntentEvents()
			}
			if (plugin.isDesktopView() && plugin.settings.event === "hover") {
				bindHoverEvents()
			}
			bindClickEvents();
			bindKeyboardEvents()
		};
		plugin.monitorView = function () {
			if (plugin.isDesktopView()) {
				$menu.data("view", "desktop")
			} else {
				$menu.data("view", "mobile");
				plugin.switchToMobile()
			}
			plugin.checkWidth();
			$(window).resize(function () {
				plugin.checkWidth()
			})
		};
		plugin.checkWidth = function () {
			if (plugin.isMobileView() && $menu.data("view") === "desktop") {
				$menu.data("view", "mobile");
				plugin.switchToMobile()
			}
			if (plugin.isDesktopView() && $menu.data("view") === "mobile") {
				$menu.data("view", "desktop");
				plugin.switchToDesktop()
			}
			plugin.calculateDynamicSubmenuWidths($("> li.mega-menu-megamenu > a.mega-menu-link", $menu))
		};
		plugin.reverseRightAlignedItems = function () {
			if (!$("body").hasClass("rtl")) {
				$menu.append($menu.children("li.mega-item-align-right").get().reverse())
			}
		};
		plugin.addClearClassesToMobileItems = function () {
			$(".mega-menu-row", $menu).each(function () {
				$("> .mega-sub-menu > .mega-menu-column:not(.mega-hide-on-mobile)", $(this)).filter(":even").addClass("mega-menu-clear")
			})
		};
		plugin.switchToMobile = function () {
			plugin.unbindMegaMenuEvents();
			plugin.bindMegaMenuEvents();
			plugin.reverseRightAlignedItems();
			plugin.addClearClassesToMobileItems();
			plugin.hideAllPanels()
		};
		plugin.switchToDesktop = function () {
			plugin.unbindMegaMenuEvents();
			plugin.bindMegaMenuEvents();
			plugin.reverseRightAlignedItems();
			plugin.hideAllPanels();
			$menu.css({
				width: "",
				left: "",
				display: ""
			});
			$toggle_bar.removeClass("mega-menu-open")
		};
		plugin.initToggleBar = function () {
			$toggle_bar.on("click", function (e) {
				if ($(e.target).is(".mega-menu-toggle, .mega-menu-toggle-block, .mega-menu-toggle-animated-block, .mega-menu-toggle-animated-block *, .mega-toggle-blocks-left, .mega-toggle-blocks-center, .mega-toggle-blocks-right, .mega-toggle-label, .mega-toggle-label span")) {
					if ($(this).hasClass("mega-menu-open")) {
						plugin.hideMobileMenu()
					} else {
						plugin.showMobileMenu()
					}
				}
			})
		};
		plugin.hideMobileMenu = function () {
			if (!$toggle_bar.is(":visible")) {
				return
			}
			html_body_class_timeout = setTimeout(function () {
				$("body").removeClass($menu.attr("id") + "-mobile-open");
				$("html").removeClass($menu.attr("id") + "-off-canvas-open")
			}, plugin.settings.effect_speed_mobile);
			$(".mega-toggle-label, .mega-toggle-animated", $toggle_bar).attr("aria-expanded", "false");
			if (plugin.settings.effect_mobile === "slide") {
				$menu.animate({
					"height": "hide"
				}, plugin.settings.effect_speed_mobile, function () {
					$menu.css({
						width: "",
						left: "",
						display: ""
					})
				})
			}
			$toggle_bar.removeClass("mega-menu-open")
		};
		plugin.showMobileMenu = function () {
			if (!$toggle_bar.is(":visible")) {
				return
			}
			clearTimeout(html_body_class_timeout);
			$("body").addClass($menu.attr("id") + "-mobile-open");
			if (plugin.settings.effect_mobile === "slide_left" || plugin.settings.effect_mobile === "slide_right") {
				$("html").addClass($menu.attr("id") + "-off-canvas-open")
			}
			$(".mega-toggle-label, .mega-toggle-animated", $toggle_bar).attr("aria-expanded", "true");
			plugin.toggleBarForceWidth();
			if (plugin.settings.effect_mobile === "slide") {
				$menu.animate({
					"height": "show"
				}, plugin.settings.effect_speed_mobile)
			}
			$toggle_bar.addClass("mega-menu-open")
		};
		plugin.toggleBarForceWidth = function () {
			if ($(plugin.settings.mobile_force_width).length && (plugin.settings.effect_mobile == 'slide' || plugin.settings.effect_mobile == 'disabled')) {
				var submenu_offset = $toggle_bar.offset();
				var target_offset = $(plugin.settings.mobile_force_width).offset();
				$menu.css({
					width: $(plugin.settings.mobile_force_width).outerWidth(),
					left: (target_offset.left - submenu_offset.left) + "px"
				})
			}
		};
		plugin.init = function () {
			$menu.triggerHandler("before_mega_menu_init");
			plugin.settings = $.extend({}, defaults, options);
			$menu.removeClass("mega-no-js");
			plugin.initToggleBar();
			if (plugin.settings.unbind_events === "true") {
				plugin.unbindAllEvents()
			}
			$("span.mega-indicator", $menu).on("click.megamenu", function (e) {
				e.preventDefault();
				e.stopPropagation();
				if ($(this).parent().parent().hasClass("mega-toggle-on")) {
					if (!$(this).parent().parent().parent().parent().hasClass("mega-menu-tabbed") || plugin.isMobileView()) {
						plugin.hidePanel($(this).parent(), !1)
					}
				} else {
					plugin.showPanel($(this).parent(), !1)
				}
			});
			$(window).on("load", function () {
				plugin.calculateDynamicSubmenuWidths($("> li.mega-menu-megamenu > a.mega-menu-link", $menu))
			});
			plugin.bindMegaMenuEvents();
			plugin.monitorView();
			$menu.triggerHandler("after_mega_menu_init")
		};
		plugin.init()
	};
	$.fn.maxmegamenu = function (options) {
		return this.each(function () {
			if (undefined === $(this).data("maxmegamenu")) {
				var plugin = new $.maxmegamenu(this, options);
				$(this).data("maxmegamenu", plugin)
			}
		})
	};
	$(function () {
		$(".max-mega-menu").maxmegamenu()
	})
}(jQuery));
/*! jQuery UI - v1.12.1 - 2020-02-10
 * http://jqueryui.com
 * Includes: widget.js, position.js, data.js, disable-selection.js, focusable.js, form-reset-mixin.js, jquery-1-7.js, keycode.js, labels.js, scroll-parent.js, tabbable.js, unique-id.js, widgets/draggable.js, widgets/droppable.js, widgets/resizable.js, widgets/selectable.js, widgets/sortable.js, widgets/accordion.js, widgets/autocomplete.js, widgets/button.js, widgets/checkboxradio.js, widgets/controlgroup.js, widgets/datepicker.js, widgets/dialog.js, widgets/menu.js, widgets/mouse.js, widgets/progressbar.js, widgets/selectmenu.js, widgets/slider.js, widgets/spinner.js, widgets/tabs.js, widgets/tooltip.js, effect.js, effects/effect-blind.js, effects/effect-bounce.js, effects/effect-clip.js, effects/effect-drop.js, effects/effect-explode.js, effects/effect-fade.js, effects/effect-fold.js, effects/effect-highlight.js, effects/effect-puff.js, effects/effect-pulsate.js, effects/effect-scale.js, effects/effect-shake.js, effects/effect-size.js, effects/effect-slide.js, effects/effect-transfer.js
 * Copyright jQuery Foundation and other contributors; Licensed MIT */

(function (t) {
	"function" == typeof define && define.amd ? define(["jquery"], t) : t(jQuery)
})(function (t) {
	function e(t) {
		for (var e = t.css("visibility");
			"inherit" === e;) t = t.parent(), e = t.css("visibility");
		return "hidden" !== e
	}

	function i(t) {
		for (var e, i; t.length && t[0] !== document;) {
			if (e = t.css("position"), ("absolute" === e || "relative" === e || "fixed" === e) && (i = parseInt(t.css("zIndex"), 10), !isNaN(i) && 0 !== i)) return i;
			t = t.parent()
		}
		return 0
	}

	function s() {
		this._curInst = null, this._keyEvent = !1, this._disabledInputs = [], this._datepickerShowing = !1, this._inDialog = !1, this._mainDivId = "ui-datepicker-div", this._inlineClass = "ui-datepicker-inline", this._appendClass = "ui-datepicker-append", this._triggerClass = "ui-datepicker-trigger", this._dialogClass = "ui-datepicker-dialog", this._disableClass = "ui-datepicker-disabled", this._unselectableClass = "ui-datepicker-unselectable", this._currentClass = "ui-datepicker-current-day", this._dayOverClass = "ui-datepicker-days-cell-over", this.regional = [], this.regional[""] = {
			closeText: "Done",
			prevText: "Prev",
			nextText: "Next",
			currentText: "Today",
			monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
			weekHeader: "Wk",
			dateFormat: "mm/dd/yy",
			firstDay: 0,
			isRTL: !1,
			showMonthAfterYear: !1,
			yearSuffix: ""
		}, this._defaults = {
			showOn: "focus",
			showAnim: "fadeIn",
			showOptions: {},
			defaultDate: null,
			appendText: "",
			buttonText: "...",
			buttonImage: "",
			buttonImageOnly: !1,
			hideIfNoPrevNext: !1,
			navigationAsDateFormat: !1,
			gotoCurrent: !1,
			changeMonth: !1,
			changeYear: !1,
			yearRange: "c-10:c+10",
			showOtherMonths: !1,
			selectOtherMonths: !1,
			showWeek: !1,
			calculateWeek: this.iso8601Week,
			shortYearCutoff: "+10",
			minDate: null,
			maxDate: null,
			duration: "fast",
			beforeShowDay: null,
			beforeShow: null,
			onSelect: null,
			onChangeMonthYear: null,
			onClose: null,
			numberOfMonths: 1,
			showCurrentAtPos: 0,
			stepMonths: 1,
			stepBigMonths: 12,
			altField: "",
			altFormat: "",
			constrainInput: !0,
			showButtonPanel: !1,
			autoSize: !1,
			disabled: !1
		}, t.extend(this._defaults, this.regional[""]), this.regional.en = t.extend(!0, {}, this.regional[""]), this.regional["en-US"] = t.extend(!0, {}, this.regional.en), this.dpDiv = n(t("<div id='" + this._mainDivId + "' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))
	}

	function n(e) {
		var i = "button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";
		return e.on("mouseout", i, function () {
			t(this).removeClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && t(this).removeClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && t(this).removeClass("ui-datepicker-next-hover")
		}).on("mouseover", i, o)
	}

	function o() {
		t.datepicker._isDisabledDatepicker(p.inline ? p.dpDiv.parent()[0] : p.input[0]) || (t(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover"), t(this).addClass("ui-state-hover"), -1 !== this.className.indexOf("ui-datepicker-prev") && t(this).addClass("ui-datepicker-prev-hover"), -1 !== this.className.indexOf("ui-datepicker-next") && t(this).addClass("ui-datepicker-next-hover"))
	}

	function a(e, i) {
		t.extend(e, i);
		for (var s in i) null == i[s] && (e[s] = i[s]);
		return e
	}

	function r(t) {
		return function () {
			var e = this.element.val();
			t.apply(this, arguments), this._refresh(), e !== this.element.val() && this._trigger("change")
		}
	}
	t.ui = t.ui || {}, t.ui.version = "1.12.1";
	var l = 0,
		h = Array.prototype.slice;
	t.cleanData = function (e) {
			return function (i) {
				var s, n, o;
				for (o = 0; null != (n = i[o]); o++) try {
					s = t._data(n, "events"), s && s.remove && t(n).triggerHandler("remove")
				} catch (a) {}
				e(i)
			}
		}(t.cleanData), t.widget = function (e, i, s) {
			var n, o, a, r = {},
				l = e.split(".")[0];
			e = e.split(".")[1];
			var h = l + "-" + e;
			return s || (s = i, i = t.Widget), t.isArray(s) && (s = t.extend.apply(null, [{}].concat(s))), t.expr[":"][h.toLowerCase()] = function (e) {
				return !!t.data(e, h)
			}, t[l] = t[l] || {}, n = t[l][e], o = t[l][e] = function (t, e) {
				return this._createWidget ? (arguments.length && this._createWidget(t, e), void 0) : new o(t, e)
			}, t.extend(o, n, {
				version: s.version,
				_proto: t.extend({}, s),
				_childConstructors: []
			}), a = new i, a.options = t.widget.extend({}, a.options), t.each(s, function (e, s) {
				return t.isFunction(s) ? (r[e] = function () {
					function t() {
						return i.prototype[e].apply(this, arguments)
					}

					function n(t) {
						return i.prototype[e].apply(this, t)
					}
					return function () {
						var e, i = this._super,
							o = this._superApply;
						return this._super = t, this._superApply = n, e = s.apply(this, arguments), this._super = i, this._superApply = o, e
					}
				}(), void 0) : (r[e] = s, void 0)
			}), o.prototype = t.widget.extend(a, {
				widgetEventPrefix: n ? a.widgetEventPrefix || e : e
			}, r, {
				constructor: o,
				namespace: l,
				widgetName: e,
				widgetFullName: h
			}), n ? (t.each(n._childConstructors, function (e, i) {
				var s = i.prototype;
				t.widget(s.namespace + "." + s.widgetName, o, i._proto)
			}), delete n._childConstructors) : i._childConstructors.push(o), t.widget.bridge(e, o), o
		}, t.widget.extend = function (e) {
			for (var i, s, n = h.call(arguments, 1), o = 0, a = n.length; a > o; o++)
				for (i in n[o]) s = n[o][i], n[o].hasOwnProperty(i) && void 0 !== s && (e[i] = t.isPlainObject(s) ? t.isPlainObject(e[i]) ? t.widget.extend({}, e[i], s) : t.widget.extend({}, s) : s);
			return e
		}, t.widget.bridge = function (e, i) {
			var s = i.prototype.widgetFullName || e;
			t.fn[e] = function (n) {
				var o = "string" == typeof n,
					a = h.call(arguments, 1),
					r = this;
				return o ? this.length || "instance" !== n ? this.each(function () {
					var i, o = t.data(this, s);
					return "instance" === n ? (r = o, !1) : o ? t.isFunction(o[n]) && "_" !== n.charAt(0) ? (i = o[n].apply(o, a), i !== o && void 0 !== i ? (r = i && i.jquery ? r.pushStack(i.get()) : i, !1) : void 0) : t.error("no such method '" + n + "' for " + e + " widget instance") : t.error("cannot call methods on " + e + " prior to initialization; " + "attempted to call method '" + n + "'")
				}) : r = void 0 : (a.length && (n = t.widget.extend.apply(null, [n].concat(a))), this.each(function () {
					var e = t.data(this, s);
					e ? (e.option(n || {}), e._init && e._init()) : t.data(this, s, new i(n, this))
				})), r
			}
		}, t.Widget = function () {}, t.Widget._childConstructors = [], t.Widget.prototype = {
			widgetName: "widget",
			widgetEventPrefix: "",
			defaultElement: "<div>",
			options: {
				classes: {},
				disabled: !1,
				create: null
			},
			_createWidget: function (e, i) {
				i = t(i || this.defaultElement || this)[0], this.element = t(i), this.uuid = l++, this.eventNamespace = "." + this.widgetName + this.uuid, this.bindings = t(), this.hoverable = t(), this.focusable = t(), this.classesElementLookup = {}, i !== this && (t.data(i, this.widgetFullName, this), this._on(!0, this.element, {
					remove: function (t) {
						t.target === i && this.destroy()
					}
				}), this.document = t(i.style ? i.ownerDocument : i.document || i), this.window = t(this.document[0].defaultView || this.document[0].parentWindow)), this.options = t.widget.extend({}, this.options, this._getCreateOptions(), e), this._create(), this.options.disabled && this._setOptionDisabled(this.options.disabled), this._trigger("create", null, this._getCreateEventData()), this._init()
			},
			_getCreateOptions: function () {
				return {}
			},
			_getCreateEventData: t.noop,
			_create: t.noop,
			_init: t.noop,
			destroy: function () {
				var e = this;
				this._destroy(), t.each(this.classesElementLookup, function (t, i) {
					e._removeClass(i, t)
				}), this.element.off(this.eventNamespace).removeData(this.widgetFullName), this.widget().off(this.eventNamespace).removeAttr("aria-disabled"), this.bindings.off(this.eventNamespace)
			},
			_destroy: t.noop,
			widget: function () {
				return this.element
			},
			option: function (e, i) {
				var s, n, o, a = e;
				if (0 === arguments.length) return t.widget.extend({}, this.options);
				if ("string" == typeof e)
					if (a = {}, s = e.split("."), e = s.shift(), s.length) {
						for (n = a[e] = t.widget.extend({}, this.options[e]), o = 0; s.length - 1 > o; o++) n[s[o]] = n[s[o]] || {}, n = n[s[o]];
						if (e = s.pop(), 1 === arguments.length) return void 0 === n[e] ? null : n[e];
						n[e] = i
					} else {
						if (1 === arguments.length) return void 0 === this.options[e] ? null : this.options[e];
						a[e] = i
					} return this._setOptions(a), this
			},
			_setOptions: function (t) {
				var e;
				for (e in t) this._setOption(e, t[e]);
				return this
			},
			_setOption: function (t, e) {
				return "classes" === t && this._setOptionClasses(e), this.options[t] = e, "disabled" === t && this._setOptionDisabled(e), this
			},
			_setOptionClasses: function (e) {
				var i, s, n;
				for (i in e) n = this.classesElementLookup[i], e[i] !== this.options.classes[i] && n && n.length && (s = t(n.get()), this._removeClass(n, i), s.addClass(this._classes({
					element: s,
					keys: i,
					classes: e,
					add: !0
				})))
			},
			_setOptionDisabled: function (t) {
				this._toggleClass(this.widget(), this.widgetFullName + "-disabled", null, !!t), t && (this._removeClass(this.hoverable, null, "ui-state-hover"), this._removeClass(this.focusable, null, "ui-state-focus"))
			},
			enable: function () {
				return this._setOptions({
					disabled: !1
				})
			},
			disable: function () {
				return this._setOptions({
					disabled: !0
				})
			},
			_classes: function (e) {
				function i(i, o) {
					var a, r;
					for (r = 0; i.length > r; r++) a = n.classesElementLookup[i[r]] || t(), a = e.add ? t(t.unique(a.get().concat(e.element.get()))) : t(a.not(e.element).get()), n.classesElementLookup[i[r]] = a, s.push(i[r]), o && e.classes[i[r]] && s.push(e.classes[i[r]])
				}
				var s = [],
					n = this;
				return e = t.extend({
					element: this.element,
					classes: this.options.classes || {}
				}, e), this._on(e.element, {
					remove: "_untrackClassesElement"
				}), e.keys && i(e.keys.match(/\S+/g) || [], !0), e.extra && i(e.extra.match(/\S+/g) || []), s.join(" ")
			},
			_untrackClassesElement: function (e) {
				var i = this;
				t.each(i.classesElementLookup, function (s, n) {
					-1 !== t.inArray(e.target, n) && (i.classesElementLookup[s] = t(n.not(e.target).get()))
				})
			},
			_removeClass: function (t, e, i) {
				return this._toggleClass(t, e, i, !1)
			},
			_addClass: function (t, e, i) {
				return this._toggleClass(t, e, i, !0)
			},
			_toggleClass: function (t, e, i, s) {
				s = "boolean" == typeof s ? s : i;
				var n = "string" == typeof t || null === t,
					o = {
						extra: n ? e : i,
						keys: n ? t : e,
						element: n ? this.element : t,
						add: s
					};
				return o.element.toggleClass(this._classes(o), s), this
			},
			_on: function (e, i, s) {
				var n, o = this;
				"boolean" != typeof e && (s = i, i = e, e = !1), s ? (i = n = t(i), this.bindings = this.bindings.add(i)) : (s = i, i = this.element, n = this.widget()), t.each(s, function (s, a) {
					function r() {
						return e || o.options.disabled !== !0 && !t(this).hasClass("ui-state-disabled") ? ("string" == typeof a ? o[a] : a).apply(o, arguments) : void 0
					}
					"string" != typeof a && (r.guid = a.guid = a.guid || r.guid || t.guid++);
					var l = s.match(/^([\w:-]*)\s*(.*)$/),
						h = l[1] + o.eventNamespace,
						c = l[2];
					c ? n.on(h, c, r) : i.on(h, r)
				})
			},
			_off: function (e, i) {
				i = (i || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace, e.off(i).off(i), this.bindings = t(this.bindings.not(e).get()), this.focusable = t(this.focusable.not(e).get()), this.hoverable = t(this.hoverable.not(e).get())
			},
			_delay: function (t, e) {
				function i() {
					return ("string" == typeof t ? s[t] : t).apply(s, arguments)
				}
				var s = this;
				return setTimeout(i, e || 0)
			},
			_hoverable: function (e) {
				this.hoverable = this.hoverable.add(e), this._on(e, {
					mouseenter: function (e) {
						this._addClass(t(e.currentTarget), null, "ui-state-hover")
					},
					mouseleave: function (e) {
						this._removeClass(t(e.currentTarget), null, "ui-state-hover")
					}
				})
			},
			_focusable: function (e) {
				this.focusable = this.focusable.add(e), this._on(e, {
					focusin: function (e) {
						this._addClass(t(e.currentTarget), null, "ui-state-focus")
					},
					focusout: function (e) {
						this._removeClass(t(e.currentTarget), null, "ui-state-focus")
					}
				})
			},
			_trigger: function (e, i, s) {
				var n, o, a = this.options[e];
				if (s = s || {}, i = t.Event(i), i.type = (e === this.widgetEventPrefix ? e : this.widgetEventPrefix + e).toLowerCase(), i.target = this.element[0], o = i.originalEvent)
					for (n in o) n in i || (i[n] = o[n]);
				return this.element.trigger(i, s), !(t.isFunction(a) && a.apply(this.element[0], [i].concat(s)) === !1 || i.isDefaultPrevented())
			}
		}, t.each({
			show: "fadeIn",
			hide: "fadeOut"
		}, function (e, i) {
			t.Widget.prototype["_" + e] = function (s, n, o) {
				"string" == typeof n && (n = {
					effect: n
				});
				var a, r = n ? n === !0 || "number" == typeof n ? i : n.effect || i : e;
				n = n || {}, "number" == typeof n && (n = {
					duration: n
				}), a = !t.isEmptyObject(n), n.complete = o, n.delay && s.delay(n.delay), a && t.effects && t.effects.effect[r] ? s[e](n) : r !== e && s[r] ? s[r](n.duration, n.easing, o) : s.queue(function (i) {
					t(this)[e](), o && o.call(s[0]), i()
				})
			}
		}), t.widget,
		function () {
			function e(t, e, i) {
				return [parseFloat(t[0]) * (u.test(t[0]) ? e / 100 : 1), parseFloat(t[1]) * (u.test(t[1]) ? i / 100 : 1)]
			}

			function i(e, i) {
				return parseInt(t.css(e, i), 10) || 0
			}

			function s(e) {
				var i = e[0];
				return 9 === i.nodeType ? {
					width: e.width(),
					height: e.height(),
					offset: {
						top: 0,
						left: 0
					}
				} : t.isWindow(i) ? {
					width: e.width(),
					height: e.height(),
					offset: {
						top: e.scrollTop(),
						left: e.scrollLeft()
					}
				} : i.preventDefault ? {
					width: 0,
					height: 0,
					offset: {
						top: i.pageY,
						left: i.pageX
					}
				} : {
					width: e.outerWidth(),
					height: e.outerHeight(),
					offset: e.offset()
				}
			}
			var n, o = Math.max,
				a = Math.abs,
				r = /left|center|right/,
				l = /top|center|bottom/,
				h = /[\+\-]\d+(\.[\d]+)?%?/,
				c = /^\w+/,
				u = /%$/,
				d = t.fn.position;
			t.position = {
				scrollbarWidth: function () {
					if (void 0 !== n) return n;
					var e, i, s = t("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
						o = s.children()[0];
					return t("body").append(s), e = o.offsetWidth, s.css("overflow", "scroll"), i = o.offsetWidth, e === i && (i = s[0].clientWidth), s.remove(), n = e - i
				},
				getScrollInfo: function (e) {
					var i = e.isWindow || e.isDocument ? "" : e.element.css("overflow-x"),
						s = e.isWindow || e.isDocument ? "" : e.element.css("overflow-y"),
						n = "scroll" === i || "auto" === i && e.width < e.element[0].scrollWidth,
						o = "scroll" === s || "auto" === s && e.height < e.element[0].scrollHeight;
					return {
						width: o ? t.position.scrollbarWidth() : 0,
						height: n ? t.position.scrollbarWidth() : 0
					}
				},
				getWithinInfo: function (e) {
					var i = t(e || window),
						s = t.isWindow(i[0]),
						n = !!i[0] && 9 === i[0].nodeType,
						o = !s && !n;
					return {
						element: i,
						isWindow: s,
						isDocument: n,
						offset: o ? t(e).offset() : {
							left: 0,
							top: 0
						},
						scrollLeft: i.scrollLeft(),
						scrollTop: i.scrollTop(),
						width: i.outerWidth(),
						height: i.outerHeight()
					}
				}
			}, t.fn.position = function (n) {
				if (!n || !n.of) return d.apply(this, arguments);
				n = t.extend({}, n);
				var u, p, f, g, m, _, v = t(n.of),
					b = t.position.getWithinInfo(n.within),
					y = t.position.getScrollInfo(b),
					w = (n.collision || "flip").split(" "),
					k = {};
				return _ = s(v), v[0].preventDefault && (n.at = "left top"), p = _.width, f = _.height, g = _.offset, m = t.extend({}, g), t.each(["my", "at"], function () {
					var t, e, i = (n[this] || "").split(" ");
					1 === i.length && (i = r.test(i[0]) ? i.concat(["center"]) : l.test(i[0]) ? ["center"].concat(i) : ["center", "center"]), i[0] = r.test(i[0]) ? i[0] : "center", i[1] = l.test(i[1]) ? i[1] : "center", t = h.exec(i[0]), e = h.exec(i[1]), k[this] = [t ? t[0] : 0, e ? e[0] : 0], n[this] = [c.exec(i[0])[0], c.exec(i[1])[0]]
				}), 1 === w.length && (w[1] = w[0]), "right" === n.at[0] ? m.left += p : "center" === n.at[0] && (m.left += p / 2), "bottom" === n.at[1] ? m.top += f : "center" === n.at[1] && (m.top += f / 2), u = e(k.at, p, f), m.left += u[0], m.top += u[1], this.each(function () {
					var s, r, l = t(this),
						h = l.outerWidth(),
						c = l.outerHeight(),
						d = i(this, "marginLeft"),
						_ = i(this, "marginTop"),
						x = h + d + i(this, "marginRight") + y.width,
						C = c + _ + i(this, "marginBottom") + y.height,
						D = t.extend({}, m),
						I = e(k.my, l.outerWidth(), l.outerHeight());
					"right" === n.my[0] ? D.left -= h : "center" === n.my[0] && (D.left -= h / 2), "bottom" === n.my[1] ? D.top -= c : "center" === n.my[1] && (D.top -= c / 2), D.left += I[0], D.top += I[1], s = {
						marginLeft: d,
						marginTop: _
					}, t.each(["left", "top"], function (e, i) {
						t.ui.position[w[e]] && t.ui.position[w[e]][i](D, {
							targetWidth: p,
							targetHeight: f,
							elemWidth: h,
							elemHeight: c,
							collisionPosition: s,
							collisionWidth: x,
							collisionHeight: C,
							offset: [u[0] + I[0], u[1] + I[1]],
							my: n.my,
							at: n.at,
							within: b,
							elem: l
						})
					}), n.using && (r = function (t) {
						var e = g.left - D.left,
							i = e + p - h,
							s = g.top - D.top,
							r = s + f - c,
							u = {
								target: {
									element: v,
									left: g.left,
									top: g.top,
									width: p,
									height: f
								},
								element: {
									element: l,
									left: D.left,
									top: D.top,
									width: h,
									height: c
								},
								horizontal: 0 > i ? "left" : e > 0 ? "right" : "center",
								vertical: 0 > r ? "top" : s > 0 ? "bottom" : "middle"
							};
						h > p && p > a(e + i) && (u.horizontal = "center"), c > f && f > a(s + r) && (u.vertical = "middle"), u.important = o(a(e), a(i)) > o(a(s), a(r)) ? "horizontal" : "vertical", n.using.call(this, t, u)
					}), l.offset(t.extend(D, {
						using: r
					}))
				})
			}, t.ui.position = {
				fit: {
					left: function (t, e) {
						var i, s = e.within,
							n = s.isWindow ? s.scrollLeft : s.offset.left,
							a = s.width,
							r = t.left - e.collisionPosition.marginLeft,
							l = n - r,
							h = r + e.collisionWidth - a - n;
						e.collisionWidth > a ? l > 0 && 0 >= h ? (i = t.left + l + e.collisionWidth - a - n, t.left += l - i) : t.left = h > 0 && 0 >= l ? n : l > h ? n + a - e.collisionWidth : n : l > 0 ? t.left += l : h > 0 ? t.left -= h : t.left = o(t.left - r, t.left)
					},
					top: function (t, e) {
						var i, s = e.within,
							n = s.isWindow ? s.scrollTop : s.offset.top,
							a = e.within.height,
							r = t.top - e.collisionPosition.marginTop,
							l = n - r,
							h = r + e.collisionHeight - a - n;
						e.collisionHeight > a ? l > 0 && 0 >= h ? (i = t.top + l + e.collisionHeight - a - n, t.top += l - i) : t.top = h > 0 && 0 >= l ? n : l > h ? n + a - e.collisionHeight : n : l > 0 ? t.top += l : h > 0 ? t.top -= h : t.top = o(t.top - r, t.top)
					}
				},
				flip: {
					left: function (t, e) {
						var i, s, n = e.within,
							o = n.offset.left + n.scrollLeft,
							r = n.width,
							l = n.isWindow ? n.scrollLeft : n.offset.left,
							h = t.left - e.collisionPosition.marginLeft,
							c = h - l,
							u = h + e.collisionWidth - r - l,
							d = "left" === e.my[0] ? -e.elemWidth : "right" === e.my[0] ? e.elemWidth : 0,
							p = "left" === e.at[0] ? e.targetWidth : "right" === e.at[0] ? -e.targetWidth : 0,
							f = -2 * e.offset[0];
						0 > c ? (i = t.left + d + p + f + e.collisionWidth - r - o, (0 > i || a(c) > i) && (t.left += d + p + f)) : u > 0 && (s = t.left - e.collisionPosition.marginLeft + d + p + f - l, (s > 0 || u > a(s)) && (t.left += d + p + f))
					},
					top: function (t, e) {
						var i, s, n = e.within,
							o = n.offset.top + n.scrollTop,
							r = n.height,
							l = n.isWindow ? n.scrollTop : n.offset.top,
							h = t.top - e.collisionPosition.marginTop,
							c = h - l,
							u = h + e.collisionHeight - r - l,
							d = "top" === e.my[1],
							p = d ? -e.elemHeight : "bottom" === e.my[1] ? e.elemHeight : 0,
							f = "top" === e.at[1] ? e.targetHeight : "bottom" === e.at[1] ? -e.targetHeight : 0,
							g = -2 * e.offset[1];
						0 > c ? (s = t.top + p + f + g + e.collisionHeight - r - o, (0 > s || a(c) > s) && (t.top += p + f + g)) : u > 0 && (i = t.top - e.collisionPosition.marginTop + p + f + g - l, (i > 0 || u > a(i)) && (t.top += p + f + g))
					}
				},
				flipfit: {
					left: function () {
						t.ui.position.flip.left.apply(this, arguments), t.ui.position.fit.left.apply(this, arguments)
					},
					top: function () {
						t.ui.position.flip.top.apply(this, arguments), t.ui.position.fit.top.apply(this, arguments)
					}
				}
			}
		}(), t.ui.position, t.extend(t.expr[":"], {
			data: t.expr.createPseudo ? t.expr.createPseudo(function (e) {
				return function (i) {
					return !!t.data(i, e)
				}
			}) : function (e, i, s) {
				return !!t.data(e, s[3])
			}
		}), t.fn.extend({
			disableSelection: function () {
				var t = "onselectstart" in document.createElement("div") ? "selectstart" : "mousedown";
				return function () {
					return this.on(t + ".ui-disableSelection", function (t) {
						t.preventDefault()
					})
				}
			}(),
			enableSelection: function () {
				return this.off(".ui-disableSelection")
			}
		}), t.ui.focusable = function (i, s) {
			var n, o, a, r, l, h = i.nodeName.toLowerCase();
			return "area" === h ? (n = i.parentNode, o = n.name, i.href && o && "map" === n.nodeName.toLowerCase() ? (a = t("img[usemap='#" + o + "']"), a.length > 0 && a.is(":visible")) : !1) : (/^(input|select|textarea|button|object)$/.test(h) ? (r = !i.disabled, r && (l = t(i).closest("fieldset")[0], l && (r = !l.disabled))) : r = "a" === h ? i.href || s : s, r && t(i).is(":visible") && e(t(i)))
		}, t.extend(t.expr[":"], {
			focusable: function (e) {
				return t.ui.focusable(e, null != t.attr(e, "tabindex"))
			}
		}), t.ui.focusable, t.fn.form = function () {
			return "string" == typeof this[0].form ? this.closest("form") : t(this[0].form)
		}, t.ui.formResetMixin = {
			_formResetHandler: function () {
				var e = t(this);
				setTimeout(function () {
					var i = e.data("ui-form-reset-instances");
					t.each(i, function () {
						this.refresh()
					})
				})
			},
			_bindFormResetHandler: function () {
				if (this.form = this.element.form(), this.form.length) {
					var t = this.form.data("ui-form-reset-instances") || [];
					t.length || this.form.on("reset.ui-form-reset", this._formResetHandler), t.push(this), this.form.data("ui-form-reset-instances", t)
				}
			},
			_unbindFormResetHandler: function () {
				if (this.form.length) {
					var e = this.form.data("ui-form-reset-instances");
					e.splice(t.inArray(this, e), 1), e.length ? this.form.data("ui-form-reset-instances", e) : this.form.removeData("ui-form-reset-instances").off("reset.ui-form-reset")
				}
			}
		}, "1.7" === t.fn.jquery.substring(0, 3) && (t.each(["Width", "Height"], function (e, i) {
			function s(e, i, s, o) {
				return t.each(n, function () {
					i -= parseFloat(t.css(e, "padding" + this)) || 0, s && (i -= parseFloat(t.css(e, "border" + this + "Width")) || 0), o && (i -= parseFloat(t.css(e, "margin" + this)) || 0)
				}), i
			}
			var n = "Width" === i ? ["Left", "Right"] : ["Top", "Bottom"],
				o = i.toLowerCase(),
				a = {
					innerWidth: t.fn.innerWidth,
					innerHeight: t.fn.innerHeight,
					outerWidth: t.fn.outerWidth,
					outerHeight: t.fn.outerHeight
				};
			t.fn["inner" + i] = function (e) {
				return void 0 === e ? a["inner" + i].call(this) : this.each(function () {
					t(this).css(o, s(this, e) + "px")
				})
			}, t.fn["outer" + i] = function (e, n) {
				return "number" != typeof e ? a["outer" + i].call(this, e) : this.each(function () {
					t(this).css(o, s(this, e, !0, n) + "px")
				})
			}
		}), t.fn.addBack = function (t) {
			return this.add(null == t ? this.prevObject : this.prevObject.filter(t))
		}), t.ui.keyCode = {
			BACKSPACE: 8,
			COMMA: 188,
			DELETE: 46,
			DOWN: 40,
			END: 35,
			ENTER: 13,
			ESCAPE: 27,
			HOME: 36,
			LEFT: 37,
			PAGE_DOWN: 34,
			PAGE_UP: 33,
			PERIOD: 190,
			RIGHT: 39,
			SPACE: 32,
			TAB: 9,
			UP: 38
		}, t.ui.escapeSelector = function () {
			var t = /([!"#$%&'()*+,.\/:;<=>?@[\]^`{|}~])/g;
			return function (e) {
				return e.replace(t, "\\$1")
			}
		}(), t.fn.labels = function () {
			var e, i, s, n, o;
			return this[0].labels && this[0].labels.length ? this.pushStack(this[0].labels) : (n = this.eq(0).parents("label"), s = this.attr("id"), s && (e = this.eq(0).parents().last(), o = e.add(e.length ? e.siblings() : this.siblings()), i = "label[for='" + t.ui.escapeSelector(s) + "']", n = n.add(o.find(i).addBack(i))), this.pushStack(n))
		}, t.fn.scrollParent = function (e) {
			var i = this.css("position"),
				s = "absolute" === i,
				n = e ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
				o = this.parents().filter(function () {
					var e = t(this);
					return s && "static" === e.css("position") ? !1 : n.test(e.css("overflow") + e.css("overflow-y") + e.css("overflow-x"))
				}).eq(0);
			return "fixed" !== i && o.length ? o : t(this[0].ownerDocument || document)
		}, t.extend(t.expr[":"], {
			tabbable: function (e) {
				var i = t.attr(e, "tabindex"),
					s = null != i;
				return (!s || i >= 0) && t.ui.focusable(e, s)
			}
		}), t.fn.extend({
			uniqueId: function () {
				var t = 0;
				return function () {
					return this.each(function () {
						this.id || (this.id = "ui-id-" + ++t)
					})
				}
			}(),
			removeUniqueId: function () {
				return this.each(function () {
					/^ui-id-\d+$/.test(this.id) && t(this).removeAttr("id")
				})
			}
		}), t.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());
	var c = !1;
	t(document).on("mouseup", function () {
		c = !1
	}), t.widget("ui.mouse", {
		version: "1.12.1",
		options: {
			cancel: "input, textarea, button, select, option",
			distance: 1,
			delay: 0
		},
		_mouseInit: function () {
			var e = this;
			this.element.on("mousedown." + this.widgetName, function (t) {
				return e._mouseDown(t)
			}).on("click." + this.widgetName, function (i) {
				return !0 === t.data(i.target, e.widgetName + ".preventClickEvent") ? (t.removeData(i.target, e.widgetName + ".preventClickEvent"), i.stopImmediatePropagation(), !1) : void 0
			}), this.started = !1
		},
		_mouseDestroy: function () {
			this.element.off("." + this.widgetName), this._mouseMoveDelegate && this.document.off("mousemove." + this.widgetName, this._mouseMoveDelegate).off("mouseup." + this.widgetName, this._mouseUpDelegate)
		},
		_mouseDown: function (e) {
			if (!c) {
				this._mouseMoved = !1, this._mouseStarted && this._mouseUp(e), this._mouseDownEvent = e;
				var i = this,
					s = 1 === e.which,
					n = "string" == typeof this.options.cancel && e.target.nodeName ? t(e.target).closest(this.options.cancel).length : !1;
				return s && !n && this._mouseCapture(e) ? (this.mouseDelayMet = !this.options.delay, this.mouseDelayMet || (this._mouseDelayTimer = setTimeout(function () {
					i.mouseDelayMet = !0
				}, this.options.delay)), this._mouseDistanceMet(e) && this._mouseDelayMet(e) && (this._mouseStarted = this._mouseStart(e) !== !1, !this._mouseStarted) ? (e.preventDefault(), !0) : (!0 === t.data(e.target, this.widgetName + ".preventClickEvent") && t.removeData(e.target, this.widgetName + ".preventClickEvent"), this._mouseMoveDelegate = function (t) {
					return i._mouseMove(t)
				}, this._mouseUpDelegate = function (t) {
					return i._mouseUp(t)
				}, this.document.on("mousemove." + this.widgetName, this._mouseMoveDelegate).on("mouseup." + this.widgetName, this._mouseUpDelegate), e.preventDefault(), c = !0, !0)) : !0
			}
		},
		_mouseMove: function (e) {
			if (this._mouseMoved) {
				if (t.ui.ie && (!document.documentMode || 9 > document.documentMode) && !e.button) return this._mouseUp(e);
				if (!e.which)
					if (e.originalEvent.altKey || e.originalEvent.ctrlKey || e.originalEvent.metaKey || e.originalEvent.shiftKey) this.ignoreMissingWhich = !0;
					else if (!this.ignoreMissingWhich) return this._mouseUp(e)
			}
			return (e.which || e.button) && (this._mouseMoved = !0), this._mouseStarted ? (this._mouseDrag(e), e.preventDefault()) : (this._mouseDistanceMet(e) && this._mouseDelayMet(e) && (this._mouseStarted = this._mouseStart(this._mouseDownEvent, e) !== !1, this._mouseStarted ? this._mouseDrag(e) : this._mouseUp(e)), !this._mouseStarted)
		},
		_mouseUp: function (e) {
			this.document.off("mousemove." + this.widgetName, this._mouseMoveDelegate).off("mouseup." + this.widgetName, this._mouseUpDelegate), this._mouseStarted && (this._mouseStarted = !1, e.target === this._mouseDownEvent.target && t.data(e.target, this.widgetName + ".preventClickEvent", !0), this._mouseStop(e)), this._mouseDelayTimer && (clearTimeout(this._mouseDelayTimer), delete this._mouseDelayTimer), this.ignoreMissingWhich = !1, c = !1, e.preventDefault()
		},
		_mouseDistanceMet: function (t) {
			return Math.max(Math.abs(this._mouseDownEvent.pageX - t.pageX), Math.abs(this._mouseDownEvent.pageY - t.pageY)) >= this.options.distance
		},
		_mouseDelayMet: function () {
			return this.mouseDelayMet
		},
		_mouseStart: function () {},
		_mouseDrag: function () {},
		_mouseStop: function () {},
		_mouseCapture: function () {
			return !0
		}
	}), t.ui.plugin = {
		add: function (e, i, s) {
			var n, o = t.ui[e].prototype;
			for (n in s) o.plugins[n] = o.plugins[n] || [], o.plugins[n].push([i, s[n]])
		},
		call: function (t, e, i, s) {
			var n, o = t.plugins[e];
			if (o && (s || t.element[0].parentNode && 11 !== t.element[0].parentNode.nodeType))
				for (n = 0; o.length > n; n++) t.options[o[n][0]] && o[n][1].apply(t.element, i)
		}
	}, t.ui.safeActiveElement = function (t) {
		var e;
		try {
			e = t.activeElement
		} catch (i) {
			e = t.body
		}
		return e || (e = t.body), e.nodeName || (e = t.body), e
	}, t.ui.safeBlur = function (e) {
		e && "body" !== e.nodeName.toLowerCase() && t(e).trigger("blur")
	}, t.widget("ui.draggable", t.ui.mouse, {
		version: "1.12.1",
		widgetEventPrefix: "drag",
		options: {
			addClasses: !0,
			appendTo: "parent",
			axis: !1,
			connectToSortable: !1,
			containment: !1,
			cursor: "auto",
			cursorAt: !1,
			grid: !1,
			handle: !1,
			helper: "original",
			iframeFix: !1,
			opacity: !1,
			refreshPositions: !1,
			revert: !1,
			revertDuration: 500,
			scope: "default",
			scroll: !0,
			scrollSensitivity: 20,
			scrollSpeed: 20,
			snap: !1,
			snapMode: "both",
			snapTolerance: 20,
			stack: !1,
			zIndex: !1,
			drag: null,
			start: null,
			stop: null
		},
		_create: function () {
			"original" === this.options.helper && this._setPositionRelative(), this.options.addClasses && this._addClass("ui-draggable"), this._setHandleClassName(), this._mouseInit()
		},
		_setOption: function (t, e) {
			this._super(t, e), "handle" === t && (this._removeHandleClassName(), this._setHandleClassName())
		},
		_destroy: function () {
			return (this.helper || this.element).is(".ui-draggable-dragging") ? (this.destroyOnClear = !0, void 0) : (this._removeHandleClassName(), this._mouseDestroy(), void 0)
		},
		_mouseCapture: function (e) {
			var i = this.options;
			return this.helper || i.disabled || t(e.target).closest(".ui-resizable-handle").length > 0 ? !1 : (this.handle = this._getHandle(e), this.handle ? (this._blurActiveElement(e), this._blockFrames(i.iframeFix === !0 ? "iframe" : i.iframeFix), !0) : !1)
		},
		_blockFrames: function (e) {
			this.iframeBlocks = this.document.find(e).map(function () {
				var e = t(this);
				return t("<div>").css("position", "absolute").appendTo(e.parent()).outerWidth(e.outerWidth()).outerHeight(e.outerHeight()).offset(e.offset())[0]
			})
		},
		_unblockFrames: function () {
			this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks)
		},
		_blurActiveElement: function (e) {
			var i = t.ui.safeActiveElement(this.document[0]),
				s = t(e.target);
			s.closest(i).length || t.ui.safeBlur(i)
		},
		_mouseStart: function (e) {
			var i = this.options;
			return this.helper = this._createHelper(e), this._addClass(this.helper, "ui-draggable-dragging"), this._cacheHelperProportions(), t.ui.ddmanager && (t.ui.ddmanager.current = this), this._cacheMargins(), this.cssPosition = this.helper.css("position"), this.scrollParent = this.helper.scrollParent(!0), this.offsetParent = this.helper.offsetParent(), this.hasFixedAncestor = this.helper.parents().filter(function () {
				return "fixed" === t(this).css("position")
			}).length > 0, this.positionAbs = this.element.offset(), this._refreshOffsets(e), this.originalPosition = this.position = this._generatePosition(e, !1), this.originalPageX = e.pageX, this.originalPageY = e.pageY, i.cursorAt && this._adjustOffsetFromHelper(i.cursorAt), this._setContainment(), this._trigger("start", e) === !1 ? (this._clear(), !1) : (this._cacheHelperProportions(), t.ui.ddmanager && !i.dropBehaviour && t.ui.ddmanager.prepareOffsets(this, e), this._mouseDrag(e, !0), t.ui.ddmanager && t.ui.ddmanager.dragStart(this, e), !0)
		},
		_refreshOffsets: function (t) {
			this.offset = {
				top: this.positionAbs.top - this.margins.top,
				left: this.positionAbs.left - this.margins.left,
				scroll: !1,
				parent: this._getParentOffset(),
				relative: this._getRelativeOffset()
			}, this.offset.click = {
				left: t.pageX - this.offset.left,
				top: t.pageY - this.offset.top
			}
		},
		_mouseDrag: function (e, i) {
			if (this.hasFixedAncestor && (this.offset.parent = this._getParentOffset()), this.position = this._generatePosition(e, !0), this.positionAbs = this._convertPositionTo("absolute"), !i) {
				var s = this._uiHash();
				if (this._trigger("drag", e, s) === !1) return this._mouseUp(new t.Event("mouseup", e)), !1;
				this.position = s.position
			}
			return this.helper[0].style.left = this.position.left + "px", this.helper[0].style.top = this.position.top + "px", t.ui.ddmanager && t.ui.ddmanager.drag(this, e), !1
		},
		_mouseStop: function (e) {
			var i = this,
				s = !1;
			return t.ui.ddmanager && !this.options.dropBehaviour && (s = t.ui.ddmanager.drop(this, e)), this.dropped && (s = this.dropped, this.dropped = !1), "invalid" === this.options.revert && !s || "valid" === this.options.revert && s || this.options.revert === !0 || t.isFunction(this.options.revert) && this.options.revert.call(this.element, s) ? t(this.helper).animate(this.originalPosition, parseInt(this.options.revertDuration, 10), function () {
				i._trigger("stop", e) !== !1 && i._clear()
			}) : this._trigger("stop", e) !== !1 && this._clear(), !1
		},
		_mouseUp: function (e) {
			return this._unblockFrames(), t.ui.ddmanager && t.ui.ddmanager.dragStop(this, e), this.handleElement.is(e.target) && this.element.trigger("focus"), t.ui.mouse.prototype._mouseUp.call(this, e)
		},
		cancel: function () {
			return this.helper.is(".ui-draggable-dragging") ? this._mouseUp(new t.Event("mouseup", {
				target: this.element[0]
			})) : this._clear(), this
		},
		_getHandle: function (e) {
			return this.options.handle ? !!t(e.target).closest(this.element.find(this.options.handle)).length : !0
		},
		_setHandleClassName: function () {
			this.handleElement = this.options.handle ? this.element.find(this.options.handle) : this.element, this._addClass(this.handleElement, "ui-draggable-handle")
		},
		_removeHandleClassName: function () {
			this._removeClass(this.handleElement, "ui-draggable-handle")
		},
		_createHelper: function (e) {
			var i = this.options,
				s = t.isFunction(i.helper),
				n = s ? t(i.helper.apply(this.element[0], [e])) : "clone" === i.helper ? this.element.clone().removeAttr("id") : this.element;
			return n.parents("body").length || n.appendTo("parent" === i.appendTo ? this.element[0].parentNode : i.appendTo), s && n[0] === this.element[0] && this._setPositionRelative(), n[0] === this.element[0] || /(fixed|absolute)/.test(n.css("position")) || n.css("position", "absolute"), n
		},
		_setPositionRelative: function () {
			/^(?:r|a|f)/.test(this.element.css("position")) || (this.element[0].style.position = "relative")
		},
		_adjustOffsetFromHelper: function (e) {
			"string" == typeof e && (e = e.split(" ")), t.isArray(e) && (e = {
				left: +e[0],
				top: +e[1] || 0
			}), "left" in e && (this.offset.click.left = e.left + this.margins.left), "right" in e && (this.offset.click.left = this.helperProportions.width - e.right + this.margins.left), "top" in e && (this.offset.click.top = e.top + this.margins.top), "bottom" in e && (this.offset.click.top = this.helperProportions.height - e.bottom + this.margins.top)
		},
		_isRootNode: function (t) {
			return /(html|body)/i.test(t.tagName) || t === this.document[0]
		},
		_getParentOffset: function () {
			var e = this.offsetParent.offset(),
				i = this.document[0];
			return "absolute" === this.cssPosition && this.scrollParent[0] !== i && t.contains(this.scrollParent[0], this.offsetParent[0]) && (e.left += this.scrollParent.scrollLeft(), e.top += this.scrollParent.scrollTop()), this._isRootNode(this.offsetParent[0]) && (e = {
				top: 0,
				left: 0
			}), {
				top: e.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
				left: e.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
			}
		},
		_getRelativeOffset: function () {
			if ("relative" !== this.cssPosition) return {
				top: 0,
				left: 0
			};
			var t = this.element.position(),
				e = this._isRootNode(this.scrollParent[0]);
			return {
				top: t.top - (parseInt(this.helper.css("top"), 10) || 0) + (e ? 0 : this.scrollParent.scrollTop()),
				left: t.left - (parseInt(this.helper.css("left"), 10) || 0) + (e ? 0 : this.scrollParent.scrollLeft())
			}
		},
		_cacheMargins: function () {
			this.margins = {
				left: parseInt(this.element.css("marginLeft"), 10) || 0,
				top: parseInt(this.element.css("marginTop"), 10) || 0,
				right: parseInt(this.element.css("marginRight"), 10) || 0,
				bottom: parseInt(this.element.css("marginBottom"), 10) || 0
			}
		},
		_cacheHelperProportions: function () {
			this.helperProportions = {
				width: this.helper.outerWidth(),
				height: this.helper.outerHeight()
			}
		},
		_setContainment: function () {
			var e, i, s, n = this.options,
				o = this.document[0];
			return this.relativeContainer = null, n.containment ? "window" === n.containment ? (this.containment = [t(window).scrollLeft() - this.offset.relative.left - this.offset.parent.left, t(window).scrollTop() - this.offset.relative.top - this.offset.parent.top, t(window).scrollLeft() + t(window).width() - this.helperProportions.width - this.margins.left, t(window).scrollTop() + (t(window).height() || o.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : "document" === n.containment ? (this.containment = [0, 0, t(o).width() - this.helperProportions.width - this.margins.left, (t(o).height() || o.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top], void 0) : n.containment.constructor === Array ? (this.containment = n.containment, void 0) : ("parent" === n.containment && (n.containment = this.helper[0].parentNode), i = t(n.containment), s = i[0], s && (e = /(scroll|auto)/.test(i.css("overflow")), this.containment = [(parseInt(i.css("borderLeftWidth"), 10) || 0) + (parseInt(i.css("paddingLeft"), 10) || 0), (parseInt(i.css("borderTopWidth"), 10) || 0) + (parseInt(i.css("paddingTop"), 10) || 0), (e ? Math.max(s.scrollWidth, s.offsetWidth) : s.offsetWidth) - (parseInt(i.css("borderRightWidth"), 10) || 0) - (parseInt(i.css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left - this.margins.right, (e ? Math.max(s.scrollHeight, s.offsetHeight) : s.offsetHeight) - (parseInt(i.css("borderBottomWidth"), 10) || 0) - (parseInt(i.css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top - this.margins.bottom], this.relativeContainer = i), void 0) : (this.containment = null, void 0)
		},
		_convertPositionTo: function (t, e) {
			e || (e = this.position);
			var i = "absolute" === t ? 1 : -1,
				s = this._isRootNode(this.scrollParent[0]);
			return {
				top: e.top + this.offset.relative.top * i + this.offset.parent.top * i - ("fixed" === this.cssPosition ? -this.offset.scroll.top : s ? 0 : this.offset.scroll.top) * i,
				left: e.left + this.offset.relative.left * i + this.offset.parent.left * i - ("fixed" === this.cssPosition ? -this.offset.scroll.left : s ? 0 : this.offset.scroll.left) * i
			}
		},
		_generatePosition: function (t, e) {
			var i, s, n, o, a = this.options,
				r = this._isRootNode(this.scrollParent[0]),
				l = t.pageX,
				h = t.pageY;
			return r && this.offset.scroll || (this.offset.scroll = {
				top: this.scrollParent.scrollTop(),
				left: this.scrollParent.scrollLeft()
			}), e && (this.containment && (this.relativeContainer ? (s = this.relativeContainer.offset(), i = [this.containment[0] + s.left, this.containment[1] + s.top, this.containment[2] + s.left, this.containment[3] + s.top]) : i = this.containment, t.pageX - this.offset.click.left < i[0] && (l = i[0] + this.offset.click.left), t.pageY - this.offset.click.top < i[1] && (h = i[1] + this.offset.click.top), t.pageX - this.offset.click.left > i[2] && (l = i[2] + this.offset.click.left), t.pageY - this.offset.click.top > i[3] && (h = i[3] + this.offset.click.top)), a.grid && (n = a.grid[1] ? this.originalPageY + Math.round((h - this.originalPageY) / a.grid[1]) * a.grid[1] : this.originalPageY, h = i ? n - this.offset.click.top >= i[1] || n - this.offset.click.top > i[3] ? n : n - this.offset.click.top >= i[1] ? n - a.grid[1] : n + a.grid[1] : n, o = a.grid[0] ? this.originalPageX + Math.round((l - this.originalPageX) / a.grid[0]) * a.grid[0] : this.originalPageX, l = i ? o - this.offset.click.left >= i[0] || o - this.offset.click.left > i[2] ? o : o - this.offset.click.left >= i[0] ? o - a.grid[0] : o + a.grid[0] : o), "y" === a.axis && (l = this.originalPageX), "x" === a.axis && (h = this.originalPageY)), {
				top: h - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.offset.scroll.top : r ? 0 : this.offset.scroll.top),
				left: l - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.offset.scroll.left : r ? 0 : this.offset.scroll.left)
			}
		},
		_clear: function () {
			this._removeClass(this.helper, "ui-draggable-dragging"), this.helper[0] === this.element[0] || this.cancelHelperRemoval || this.helper.remove(), this.helper = null, this.cancelHelperRemoval = !1, this.destroyOnClear && this.destroy()
		},
		_trigger: function (e, i, s) {
			return s = s || this._uiHash(), t.ui.plugin.call(this, e, [i, s, this], !0), /^(drag|start|stop)/.test(e) && (this.positionAbs = this._convertPositionTo("absolute"), s.offset = this.positionAbs), t.Widget.prototype._trigger.call(this, e, i, s)
		},
		plugins: {},
		_uiHash: function () {
			return {
				helper: this.helper,
				position: this.position,
				originalPosition: this.originalPosition,
				offset: this.positionAbs
			}
		}
	}), t.ui.plugin.add("draggable", "connectToSortable", {
		start: function (e, i, s) {
			var n = t.extend({}, i, {
				item: s.element
			});
			s.sortables = [], t(s.options.connectToSortable).each(function () {
				var i = t(this).sortable("instance");
				i && !i.options.disabled && (s.sortables.push(i), i.refreshPositions(), i._trigger("activate", e, n))
			})
		},
		stop: function (e, i, s) {
			var n = t.extend({}, i, {
				item: s.element
			});
			s.cancelHelperRemoval = !1, t.each(s.sortables, function () {
				var t = this;
				t.isOver ? (t.isOver = 0, s.cancelHelperRemoval = !0, t.cancelHelperRemoval = !1, t._storedCSS = {
					position: t.placeholder.css("position"),
					top: t.placeholder.css("top"),
					left: t.placeholder.css("left")
				}, t._mouseStop(e), t.options.helper = t.options._helper) : (t.cancelHelperRemoval = !0, t._trigger("deactivate", e, n))
			})
		},
		drag: function (e, i, s) {
			t.each(s.sortables, function () {
				var n = !1,
					o = this;
				o.positionAbs = s.positionAbs, o.helperProportions = s.helperProportions, o.offset.click = s.offset.click, o._intersectsWith(o.containerCache) && (n = !0, t.each(s.sortables, function () {
					return this.positionAbs = s.positionAbs, this.helperProportions = s.helperProportions, this.offset.click = s.offset.click, this !== o && this._intersectsWith(this.containerCache) && t.contains(o.element[0], this.element[0]) && (n = !1), n
				})), n ? (o.isOver || (o.isOver = 1, s._parent = i.helper.parent(), o.currentItem = i.helper.appendTo(o.element).data("ui-sortable-item", !0), o.options._helper = o.options.helper, o.options.helper = function () {
					return i.helper[0]
				}, e.target = o.currentItem[0], o._mouseCapture(e, !0), o._mouseStart(e, !0, !0), o.offset.click.top = s.offset.click.top, o.offset.click.left = s.offset.click.left, o.offset.parent.left -= s.offset.parent.left - o.offset.parent.left, o.offset.parent.top -= s.offset.parent.top - o.offset.parent.top, s._trigger("toSortable", e), s.dropped = o.element, t.each(s.sortables, function () {
					this.refreshPositions()
				}), s.currentItem = s.element, o.fromOutside = s), o.currentItem && (o._mouseDrag(e), i.position = o.position)) : o.isOver && (o.isOver = 0, o.cancelHelperRemoval = !0, o.options._revert = o.options.revert, o.options.revert = !1, o._trigger("out", e, o._uiHash(o)), o._mouseStop(e, !0), o.options.revert = o.options._revert, o.options.helper = o.options._helper, o.placeholder && o.placeholder.remove(), i.helper.appendTo(s._parent), s._refreshOffsets(e), i.position = s._generatePosition(e, !0), s._trigger("fromSortable", e), s.dropped = !1, t.each(s.sortables, function () {
					this.refreshPositions()
				}))
			})
		}
	}), t.ui.plugin.add("draggable", "cursor", {
		start: function (e, i, s) {
			var n = t("body"),
				o = s.options;
			n.css("cursor") && (o._cursor = n.css("cursor")), n.css("cursor", o.cursor)
		},
		stop: function (e, i, s) {
			var n = s.options;
			n._cursor && t("body").css("cursor", n._cursor)
		}
	}), t.ui.plugin.add("draggable", "opacity", {
		start: function (e, i, s) {
			var n = t(i.helper),
				o = s.options;
			n.css("opacity") && (o._opacity = n.css("opacity")), n.css("opacity", o.opacity)
		},
		stop: function (e, i, s) {
			var n = s.options;
			n._opacity && t(i.helper).css("opacity", n._opacity)
		}
	}), t.ui.plugin.add("draggable", "scroll", {
		start: function (t, e, i) {
			i.scrollParentNotHidden || (i.scrollParentNotHidden = i.helper.scrollParent(!1)), i.scrollParentNotHidden[0] !== i.document[0] && "HTML" !== i.scrollParentNotHidden[0].tagName && (i.overflowOffset = i.scrollParentNotHidden.offset())
		},
		drag: function (e, i, s) {
			var n = s.options,
				o = !1,
				a = s.scrollParentNotHidden[0],
				r = s.document[0];
			a !== r && "HTML" !== a.tagName ? (n.axis && "x" === n.axis || (s.overflowOffset.top + a.offsetHeight - e.pageY < n.scrollSensitivity ? a.scrollTop = o = a.scrollTop + n.scrollSpeed : e.pageY - s.overflowOffset.top < n.scrollSensitivity && (a.scrollTop = o = a.scrollTop - n.scrollSpeed)), n.axis && "y" === n.axis || (s.overflowOffset.left + a.offsetWidth - e.pageX < n.scrollSensitivity ? a.scrollLeft = o = a.scrollLeft + n.scrollSpeed : e.pageX - s.overflowOffset.left < n.scrollSensitivity && (a.scrollLeft = o = a.scrollLeft - n.scrollSpeed))) : (n.axis && "x" === n.axis || (e.pageY - t(r).scrollTop() < n.scrollSensitivity ? o = t(r).scrollTop(t(r).scrollTop() - n.scrollSpeed) : t(window).height() - (e.pageY - t(r).scrollTop()) < n.scrollSensitivity && (o = t(r).scrollTop(t(r).scrollTop() + n.scrollSpeed))), n.axis && "y" === n.axis || (e.pageX - t(r).scrollLeft() < n.scrollSensitivity ? o = t(r).scrollLeft(t(r).scrollLeft() - n.scrollSpeed) : t(window).width() - (e.pageX - t(r).scrollLeft()) < n.scrollSensitivity && (o = t(r).scrollLeft(t(r).scrollLeft() + n.scrollSpeed)))), o !== !1 && t.ui.ddmanager && !n.dropBehaviour && t.ui.ddmanager.prepareOffsets(s, e)
		}
	}), t.ui.plugin.add("draggable", "snap", {
		start: function (e, i, s) {
			var n = s.options;
			s.snapElements = [], t(n.snap.constructor !== String ? n.snap.items || ":data(ui-draggable)" : n.snap).each(function () {
				var e = t(this),
					i = e.offset();
				this !== s.element[0] && s.snapElements.push({
					item: this,
					width: e.outerWidth(),
					height: e.outerHeight(),
					top: i.top,
					left: i.left
				})
			})
		},
		drag: function (e, i, s) {
			var n, o, a, r, l, h, c, u, d, p, f = s.options,
				g = f.snapTolerance,
				m = i.offset.left,
				_ = m + s.helperProportions.width,
				v = i.offset.top,
				b = v + s.helperProportions.height;
			for (d = s.snapElements.length - 1; d >= 0; d--) l = s.snapElements[d].left - s.margins.left, h = l + s.snapElements[d].width, c = s.snapElements[d].top - s.margins.top, u = c + s.snapElements[d].height, l - g > _ || m > h + g || c - g > b || v > u + g || !t.contains(s.snapElements[d].item.ownerDocument, s.snapElements[d].item) ? (s.snapElements[d].snapping && s.options.snap.release && s.options.snap.release.call(s.element, e, t.extend(s._uiHash(), {
				snapItem: s.snapElements[d].item
			})), s.snapElements[d].snapping = !1) : ("inner" !== f.snapMode && (n = g >= Math.abs(c - b), o = g >= Math.abs(u - v), a = g >= Math.abs(l - _), r = g >= Math.abs(h - m), n && (i.position.top = s._convertPositionTo("relative", {
				top: c - s.helperProportions.height,
				left: 0
			}).top), o && (i.position.top = s._convertPositionTo("relative", {
				top: u,
				left: 0
			}).top), a && (i.position.left = s._convertPositionTo("relative", {
				top: 0,
				left: l - s.helperProportions.width
			}).left), r && (i.position.left = s._convertPositionTo("relative", {
				top: 0,
				left: h
			}).left)), p = n || o || a || r, "outer" !== f.snapMode && (n = g >= Math.abs(c - v), o = g >= Math.abs(u - b), a = g >= Math.abs(l - m), r = g >= Math.abs(h - _), n && (i.position.top = s._convertPositionTo("relative", {
				top: c,
				left: 0
			}).top), o && (i.position.top = s._convertPositionTo("relative", {
				top: u - s.helperProportions.height,
				left: 0
			}).top), a && (i.position.left = s._convertPositionTo("relative", {
				top: 0,
				left: l
			}).left), r && (i.position.left = s._convertPositionTo("relative", {
				top: 0,
				left: h - s.helperProportions.width
			}).left)), !s.snapElements[d].snapping && (n || o || a || r || p) && s.options.snap.snap && s.options.snap.snap.call(s.element, e, t.extend(s._uiHash(), {
				snapItem: s.snapElements[d].item
			})), s.snapElements[d].snapping = n || o || a || r || p)
		}
	}), t.ui.plugin.add("draggable", "stack", {
		start: function (e, i, s) {
			var n, o = s.options,
				a = t.makeArray(t(o.stack)).sort(function (e, i) {
					return (parseInt(t(e).css("zIndex"), 10) || 0) - (parseInt(t(i).css("zIndex"), 10) || 0)
				});
			a.length && (n = parseInt(t(a[0]).css("zIndex"), 10) || 0, t(a).each(function (e) {
				t(this).css("zIndex", n + e)
			}), this.css("zIndex", n + a.length))
		}
	}), t.ui.plugin.add("draggable", "zIndex", {
		start: function (e, i, s) {
			var n = t(i.helper),
				o = s.options;
			n.css("zIndex") && (o._zIndex = n.css("zIndex")), n.css("zIndex", o.zIndex)
		},
		stop: function (e, i, s) {
			var n = s.options;
			n._zIndex && t(i.helper).css("zIndex", n._zIndex)
		}
	}), t.ui.draggable, t.widget("ui.droppable", {
		version: "1.12.1",
		widgetEventPrefix: "drop",
		options: {
			accept: "*",
			addClasses: !0,
			greedy: !1,
			scope: "default",
			tolerance: "intersect",
			activate: null,
			deactivate: null,
			drop: null,
			out: null,
			over: null
		},
		_create: function () {
			var e, i = this.options,
				s = i.accept;
			this.isover = !1, this.isout = !0, this.accept = t.isFunction(s) ? s : function (t) {
				return t.is(s)
			}, this.proportions = function () {
				return arguments.length ? (e = arguments[0], void 0) : e ? e : e = {
					width: this.element[0].offsetWidth,
					height: this.element[0].offsetHeight
				}
			}, this._addToManager(i.scope), i.addClasses && this._addClass("ui-droppable")
		},
		_addToManager: function (e) {
			t.ui.ddmanager.droppables[e] = t.ui.ddmanager.droppables[e] || [], t.ui.ddmanager.droppables[e].push(this)
		},
		_splice: function (t) {
			for (var e = 0; t.length > e; e++) t[e] === this && t.splice(e, 1)
		},
		_destroy: function () {
			var e = t.ui.ddmanager.droppables[this.options.scope];
			this._splice(e)
		},
		_setOption: function (e, i) {
			if ("accept" === e) this.accept = t.isFunction(i) ? i : function (t) {
				return t.is(i)
			};
			else if ("scope" === e) {
				var s = t.ui.ddmanager.droppables[this.options.scope];
				this._splice(s), this._addToManager(i)
			}
			this._super(e, i)
		},
		_activate: function (e) {
			var i = t.ui.ddmanager.current;
			this._addActiveClass(), i && this._trigger("activate", e, this.ui(i))
		},
		_deactivate: function (e) {
			var i = t.ui.ddmanager.current;
			this._removeActiveClass(), i && this._trigger("deactivate", e, this.ui(i))
		},
		_over: function (e) {
			var i = t.ui.ddmanager.current;
			i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this._addHoverClass(), this._trigger("over", e, this.ui(i)))
		},
		_out: function (e) {
			var i = t.ui.ddmanager.current;
			i && (i.currentItem || i.element)[0] !== this.element[0] && this.accept.call(this.element[0], i.currentItem || i.element) && (this._removeHoverClass(), this._trigger("out", e, this.ui(i)))
		},
		_drop: function (e, i) {
			var s = i || t.ui.ddmanager.current,
				n = !1;
			return s && (s.currentItem || s.element)[0] !== this.element[0] ? (this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function () {
				var i = t(this).droppable("instance");
				return i.options.greedy && !i.options.disabled && i.options.scope === s.options.scope && i.accept.call(i.element[0], s.currentItem || s.element) && u(s, t.extend(i, {
					offset: i.element.offset()
				}), i.options.tolerance, e) ? (n = !0, !1) : void 0
			}), n ? !1 : this.accept.call(this.element[0], s.currentItem || s.element) ? (this._removeActiveClass(), this._removeHoverClass(), this._trigger("drop", e, this.ui(s)), this.element) : !1) : !1
		},
		ui: function (t) {
			return {
				draggable: t.currentItem || t.element,
				helper: t.helper,
				position: t.position,
				offset: t.positionAbs
			}
		},
		_addHoverClass: function () {
			this._addClass("ui-droppable-hover")
		},
		_removeHoverClass: function () {
			this._removeClass("ui-droppable-hover")
		},
		_addActiveClass: function () {
			this._addClass("ui-droppable-active")
		},
		_removeActiveClass: function () {
			this._removeClass("ui-droppable-active")
		}
	});
	var u = t.ui.intersect = function () {
		function t(t, e, i) {
			return t >= e && e + i > t
		}
		return function (e, i, s, n) {
			if (!i.offset) return !1;
			var o = (e.positionAbs || e.position.absolute).left + e.margins.left,
				a = (e.positionAbs || e.position.absolute).top + e.margins.top,
				r = o + e.helperProportions.width,
				l = a + e.helperProportions.height,
				h = i.offset.left,
				c = i.offset.top,
				u = h + i.proportions().width,
				d = c + i.proportions().height;
			switch (s) {
				case "fit":
					return o >= h && u >= r && a >= c && d >= l;
				case "intersect":
					return o + e.helperProportions.width / 2 > h && u > r - e.helperProportions.width / 2 && a + e.helperProportions.height / 2 > c && d > l - e.helperProportions.height / 2;
				case "pointer":
					return t(n.pageY, c, i.proportions().height) && t(n.pageX, h, i.proportions().width);
				case "touch":
					return (a >= c && d >= a || l >= c && d >= l || c > a && l > d) && (o >= h && u >= o || r >= h && u >= r || h > o && r > u);
				default:
					return !1
			}
		}
	}();
	t.ui.ddmanager = {
		current: null,
		droppables: {
			"default": []
		},
		prepareOffsets: function (e, i) {
			var s, n, o = t.ui.ddmanager.droppables[e.options.scope] || [],
				a = i ? i.type : null,
				r = (e.currentItem || e.element).find(":data(ui-droppable)").addBack();
			t: for (s = 0; o.length > s; s++)
				if (!(o[s].options.disabled || e && !o[s].accept.call(o[s].element[0], e.currentItem || e.element))) {
					for (n = 0; r.length > n; n++)
						if (r[n] === o[s].element[0]) {
							o[s].proportions().height = 0;
							continue t
						} o[s].visible = "none" !== o[s].element.css("display"), o[s].visible && ("mousedown" === a && o[s]._activate.call(o[s], i), o[s].offset = o[s].element.offset(), o[s].proportions({
						width: o[s].element[0].offsetWidth,
						height: o[s].element[0].offsetHeight
					}))
				}
		},
		drop: function (e, i) {
			var s = !1;
			return t.each((t.ui.ddmanager.droppables[e.options.scope] || []).slice(), function () {
				this.options && (!this.options.disabled && this.visible && u(e, this, this.options.tolerance, i) && (s = this._drop.call(this, i) || s), !this.options.disabled && this.visible && this.accept.call(this.element[0], e.currentItem || e.element) && (this.isout = !0, this.isover = !1, this._deactivate.call(this, i)))
			}), s
		},
		dragStart: function (e, i) {
			e.element.parentsUntil("body").on("scroll.droppable", function () {
				e.options.refreshPositions || t.ui.ddmanager.prepareOffsets(e, i)
			})
		},
		drag: function (e, i) {
			e.options.refreshPositions && t.ui.ddmanager.prepareOffsets(e, i), t.each(t.ui.ddmanager.droppables[e.options.scope] || [], function () {
				if (!this.options.disabled && !this.greedyChild && this.visible) {
					var s, n, o, a = u(e, this, this.options.tolerance, i),
						r = !a && this.isover ? "isout" : a && !this.isover ? "isover" : null;
					r && (this.options.greedy && (n = this.options.scope, o = this.element.parents(":data(ui-droppable)").filter(function () {
						return t(this).droppable("instance").options.scope === n
					}), o.length && (s = t(o[0]).droppable("instance"), s.greedyChild = "isover" === r)), s && "isover" === r && (s.isover = !1, s.isout = !0, s._out.call(s, i)), this[r] = !0, this["isout" === r ? "isover" : "isout"] = !1, this["isover" === r ? "_over" : "_out"].call(this, i), s && "isout" === r && (s.isout = !1, s.isover = !0, s._over.call(s, i)))
				}
			})
		},
		dragStop: function (e, i) {
			e.element.parentsUntil("body").off("scroll.droppable"), e.options.refreshPositions || t.ui.ddmanager.prepareOffsets(e, i)
		}
	}, t.uiBackCompat !== !1 && t.widget("ui.droppable", t.ui.droppable, {
		options: {
			hoverClass: !1,
			activeClass: !1
		},
		_addActiveClass: function () {
			this._super(), this.options.activeClass && this.element.addClass(this.options.activeClass)
		},
		_removeActiveClass: function () {
			this._super(), this.options.activeClass && this.element.removeClass(this.options.activeClass)
		},
		_addHoverClass: function () {
			this._super(), this.options.hoverClass && this.element.addClass(this.options.hoverClass)
		},
		_removeHoverClass: function () {
			this._super(), this.options.hoverClass && this.element.removeClass(this.options.hoverClass)
		}
	}), t.ui.droppable, t.widget("ui.resizable", t.ui.mouse, {
		version: "1.12.1",
		widgetEventPrefix: "resize",
		options: {
			alsoResize: !1,
			animate: !1,
			animateDuration: "slow",
			animateEasing: "swing",
			aspectRatio: !1,
			autoHide: !1,
			classes: {
				"ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se"
			},
			containment: !1,
			ghost: !1,
			grid: !1,
			handles: "e,s,se",
			helper: !1,
			maxHeight: null,
			maxWidth: null,
			minHeight: 10,
			minWidth: 10,
			zIndex: 90,
			resize: null,
			start: null,
			stop: null
		},
		_num: function (t) {
			return parseFloat(t) || 0
		},
		_isNumber: function (t) {
			return !isNaN(parseFloat(t))
		},
		_hasScroll: function (e, i) {
			if ("hidden" === t(e).css("overflow")) return !1;
			var s = i && "left" === i ? "scrollLeft" : "scrollTop",
				n = !1;
			return e[s] > 0 ? !0 : (e[s] = 1, n = e[s] > 0, e[s] = 0, n)
		},
		_create: function () {
			var e, i = this.options,
				s = this;
			this._addClass("ui-resizable"), t.extend(this, {
				_aspectRatio: !!i.aspectRatio,
				aspectRatio: i.aspectRatio,
				originalElement: this.element,
				_proportionallyResizeElements: [],
				_helper: i.helper || i.ghost || i.animate ? i.helper || "ui-resizable-helper" : null
			}), this.element[0].nodeName.match(/^(canvas|textarea|input|select|button|img)$/i) && (this.element.wrap(t("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({
				position: this.element.css("position"),
				width: this.element.outerWidth(),
				height: this.element.outerHeight(),
				top: this.element.css("top"),
				left: this.element.css("left")
			})), this.element = this.element.parent().data("ui-resizable", this.element.resizable("instance")), this.elementIsWrapper = !0, e = {
				marginTop: this.originalElement.css("marginTop"),
				marginRight: this.originalElement.css("marginRight"),
				marginBottom: this.originalElement.css("marginBottom"),
				marginLeft: this.originalElement.css("marginLeft")
			}, this.element.css(e), this.originalElement.css("margin", 0), this.originalResizeStyle = this.originalElement.css("resize"), this.originalElement.css("resize", "none"), this._proportionallyResizeElements.push(this.originalElement.css({
				position: "static",
				zoom: 1,
				display: "block"
			})), this.originalElement.css(e), this._proportionallyResize()), this._setupHandles(), i.autoHide && t(this.element).on("mouseenter", function () {
				i.disabled || (s._removeClass("ui-resizable-autohide"), s._handles.show())
			}).on("mouseleave", function () {
				i.disabled || s.resizing || (s._addClass("ui-resizable-autohide"), s._handles.hide())
			}), this._mouseInit()
		},
		_destroy: function () {
			this._mouseDestroy();
			var e, i = function (e) {
				t(e).removeData("resizable").removeData("ui-resizable").off(".resizable").find(".ui-resizable-handle").remove()
			};
			return this.elementIsWrapper && (i(this.element), e = this.element, this.originalElement.css({
				position: e.css("position"),
				width: e.outerWidth(),
				height: e.outerHeight(),
				top: e.css("top"),
				left: e.css("left")
			}).insertAfter(e), e.remove()), this.originalElement.css("resize", this.originalResizeStyle), i(this.originalElement), this
		},
		_setOption: function (t, e) {
			switch (this._super(t, e), t) {
				case "handles":
					this._removeHandles(), this._setupHandles();
					break;
				default:
			}
		},
		_setupHandles: function () {
			var e, i, s, n, o, a = this.options,
				r = this;
			if (this.handles = a.handles || (t(".ui-resizable-handle", this.element).length ? {
					n: ".ui-resizable-n",
					e: ".ui-resizable-e",
					s: ".ui-resizable-s",
					w: ".ui-resizable-w",
					se: ".ui-resizable-se",
					sw: ".ui-resizable-sw",
					ne: ".ui-resizable-ne",
					nw: ".ui-resizable-nw"
				} : "e,s,se"), this._handles = t(), this.handles.constructor === String)
				for ("all" === this.handles && (this.handles = "n,e,s,w,se,sw,ne,nw"), s = this.handles.split(","), this.handles = {}, i = 0; s.length > i; i++) e = t.trim(s[i]), n = "ui-resizable-" + e, o = t("<div>"), this._addClass(o, "ui-resizable-handle " + n), o.css({
					zIndex: a.zIndex
				}), this.handles[e] = ".ui-resizable-" + e, this.element.append(o);
			this._renderAxis = function (e) {
				var i, s, n, o;
				e = e || this.element;
				for (i in this.handles) this.handles[i].constructor === String ? this.handles[i] = this.element.children(this.handles[i]).first().show() : (this.handles[i].jquery || this.handles[i].nodeType) && (this.handles[i] = t(this.handles[i]), this._on(this.handles[i], {
					mousedown: r._mouseDown
				})), this.elementIsWrapper && this.originalElement[0].nodeName.match(/^(textarea|input|select|button)$/i) && (s = t(this.handles[i], this.element), o = /sw|ne|nw|se|n|s/.test(i) ? s.outerHeight() : s.outerWidth(), n = ["padding", /ne|nw|n/.test(i) ? "Top" : /se|sw|s/.test(i) ? "Bottom" : /^e$/.test(i) ? "Right" : "Left"].join(""), e.css(n, o), this._proportionallyResize()), this._handles = this._handles.add(this.handles[i])
			}, this._renderAxis(this.element), this._handles = this._handles.add(this.element.find(".ui-resizable-handle")), this._handles.disableSelection(), this._handles.on("mouseover", function () {
				r.resizing || (this.className && (o = this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i)), r.axis = o && o[1] ? o[1] : "se")
			}), a.autoHide && (this._handles.hide(), this._addClass("ui-resizable-autohide"))
		},
		_removeHandles: function () {
			this._handles.remove()
		},
		_mouseCapture: function (e) {
			var i, s, n = !1;
			for (i in this.handles) s = t(this.handles[i])[0], (s === e.target || t.contains(s, e.target)) && (n = !0);
			return !this.options.disabled && n
		},
		_mouseStart: function (e) {
			var i, s, n, o = this.options,
				a = this.element;
			return this.resizing = !0, this._renderProxy(), i = this._num(this.helper.css("left")), s = this._num(this.helper.css("top")), o.containment && (i += t(o.containment).scrollLeft() || 0, s += t(o.containment).scrollTop() || 0), this.offset = this.helper.offset(), this.position = {
				left: i,
				top: s
			}, this.size = this._helper ? {
				width: this.helper.width(),
				height: this.helper.height()
			} : {
				width: a.width(),
				height: a.height()
			}, this.originalSize = this._helper ? {
				width: a.outerWidth(),
				height: a.outerHeight()
			} : {
				width: a.width(),
				height: a.height()
			}, this.sizeDiff = {
				width: a.outerWidth() - a.width(),
				height: a.outerHeight() - a.height()
			}, this.originalPosition = {
				left: i,
				top: s
			}, this.originalMousePosition = {
				left: e.pageX,
				top: e.pageY
			}, this.aspectRatio = "number" == typeof o.aspectRatio ? o.aspectRatio : this.originalSize.width / this.originalSize.height || 1, n = t(".ui-resizable-" + this.axis).css("cursor"), t("body").css("cursor", "auto" === n ? this.axis + "-resize" : n), this._addClass("ui-resizable-resizing"), this._propagate("start", e), !0
		},
		_mouseDrag: function (e) {
			var i, s, n = this.originalMousePosition,
				o = this.axis,
				a = e.pageX - n.left || 0,
				r = e.pageY - n.top || 0,
				l = this._change[o];
			return this._updatePrevProperties(), l ? (i = l.apply(this, [e, a, r]), this._updateVirtualBoundaries(e.shiftKey), (this._aspectRatio || e.shiftKey) && (i = this._updateRatio(i, e)), i = this._respectSize(i, e), this._updateCache(i), this._propagate("resize", e), s = this._applyChanges(), !this._helper && this._proportionallyResizeElements.length && this._proportionallyResize(), t.isEmptyObject(s) || (this._updatePrevProperties(), this._trigger("resize", e, this.ui()), this._applyChanges()), !1) : !1
		},
		_mouseStop: function (e) {
			this.resizing = !1;
			var i, s, n, o, a, r, l, h = this.options,
				c = this;
			return this._helper && (i = this._proportionallyResizeElements, s = i.length && /textarea/i.test(i[0].nodeName), n = s && this._hasScroll(i[0], "left") ? 0 : c.sizeDiff.height, o = s ? 0 : c.sizeDiff.width, a = {
				width: c.helper.width() - o,
				height: c.helper.height() - n
			}, r = parseFloat(c.element.css("left")) + (c.position.left - c.originalPosition.left) || null, l = parseFloat(c.element.css("top")) + (c.position.top - c.originalPosition.top) || null, h.animate || this.element.css(t.extend(a, {
				top: l,
				left: r
			})), c.helper.height(c.size.height), c.helper.width(c.size.width), this._helper && !h.animate && this._proportionallyResize()), t("body").css("cursor", "auto"), this._removeClass("ui-resizable-resizing"), this._propagate("stop", e), this._helper && this.helper.remove(), !1
		},
		_updatePrevProperties: function () {
			this.prevPosition = {
				top: this.position.top,
				left: this.position.left
			}, this.prevSize = {
				width: this.size.width,
				height: this.size.height
			}
		},
		_applyChanges: function () {
			var t = {};
			return this.position.top !== this.prevPosition.top && (t.top = this.position.top + "px"), this.position.left !== this.prevPosition.left && (t.left = this.position.left + "px"), this.size.width !== this.prevSize.width && (t.width = this.size.width + "px"), this.size.height !== this.prevSize.height && (t.height = this.size.height + "px"), this.helper.css(t), t
		},
		_updateVirtualBoundaries: function (t) {
			var e, i, s, n, o, a = this.options;
			o = {
				minWidth: this._isNumber(a.minWidth) ? a.minWidth : 0,
				maxWidth: this._isNumber(a.maxWidth) ? a.maxWidth : 1 / 0,
				minHeight: this._isNumber(a.minHeight) ? a.minHeight : 0,
				maxHeight: this._isNumber(a.maxHeight) ? a.maxHeight : 1 / 0
			}, (this._aspectRatio || t) && (e = o.minHeight * this.aspectRatio, s = o.minWidth / this.aspectRatio, i = o.maxHeight * this.aspectRatio, n = o.maxWidth / this.aspectRatio, e > o.minWidth && (o.minWidth = e), s > o.minHeight && (o.minHeight = s), o.maxWidth > i && (o.maxWidth = i), o.maxHeight > n && (o.maxHeight = n)), this._vBoundaries = o
		},
		_updateCache: function (t) {
			this.offset = this.helper.offset(), this._isNumber(t.left) && (this.position.left = t.left), this._isNumber(t.top) && (this.position.top = t.top), this._isNumber(t.height) && (this.size.height = t.height), this._isNumber(t.width) && (this.size.width = t.width)
		},
		_updateRatio: function (t) {
			var e = this.position,
				i = this.size,
				s = this.axis;
			return this._isNumber(t.height) ? t.width = t.height * this.aspectRatio : this._isNumber(t.width) && (t.height = t.width / this.aspectRatio), "sw" === s && (t.left = e.left + (i.width - t.width), t.top = null), "nw" === s && (t.top = e.top + (i.height - t.height), t.left = e.left + (i.width - t.width)), t
		},
		_respectSize: function (t) {
			var e = this._vBoundaries,
				i = this.axis,
				s = this._isNumber(t.width) && e.maxWidth && e.maxWidth < t.width,
				n = this._isNumber(t.height) && e.maxHeight && e.maxHeight < t.height,
				o = this._isNumber(t.width) && e.minWidth && e.minWidth > t.width,
				a = this._isNumber(t.height) && e.minHeight && e.minHeight > t.height,
				r = this.originalPosition.left + this.originalSize.width,
				l = this.originalPosition.top + this.originalSize.height,
				h = /sw|nw|w/.test(i),
				c = /nw|ne|n/.test(i);
			return o && (t.width = e.minWidth), a && (t.height = e.minHeight), s && (t.width = e.maxWidth), n && (t.height = e.maxHeight), o && h && (t.left = r - e.minWidth), s && h && (t.left = r - e.maxWidth), a && c && (t.top = l - e.minHeight), n && c && (t.top = l - e.maxHeight), t.width || t.height || t.left || !t.top ? t.width || t.height || t.top || !t.left || (t.left = null) : t.top = null, t
		},
		_getPaddingPlusBorderDimensions: function (t) {
			for (var e = 0, i = [], s = [t.css("borderTopWidth"), t.css("borderRightWidth"), t.css("borderBottomWidth"), t.css("borderLeftWidth")], n = [t.css("paddingTop"), t.css("paddingRight"), t.css("paddingBottom"), t.css("paddingLeft")]; 4 > e; e++) i[e] = parseFloat(s[e]) || 0, i[e] += parseFloat(n[e]) || 0;
			return {
				height: i[0] + i[2],
				width: i[1] + i[3]
			}
		},
		_proportionallyResize: function () {
			if (this._proportionallyResizeElements.length)
				for (var t, e = 0, i = this.helper || this.element; this._proportionallyResizeElements.length > e; e++) t = this._proportionallyResizeElements[e], this.outerDimensions || (this.outerDimensions = this._getPaddingPlusBorderDimensions(t)), t.css({
					height: i.height() - this.outerDimensions.height || 0,
					width: i.width() - this.outerDimensions.width || 0
				})
		},
		_renderProxy: function () {
			var e = this.element,
				i = this.options;
			this.elementOffset = e.offset(), this._helper ? (this.helper = this.helper || t("<div style='overflow:hidden;'></div>"), this._addClass(this.helper, this._helper), this.helper.css({
				width: this.element.outerWidth(),
				height: this.element.outerHeight(),
				position: "absolute",
				left: this.elementOffset.left + "px",
				top: this.elementOffset.top + "px",
				zIndex: ++i.zIndex
			}), this.helper.appendTo("body").disableSelection()) : this.helper = this.element
		},
		_change: {
			e: function (t, e) {
				return {
					width: this.originalSize.width + e
				}
			},
			w: function (t, e) {
				var i = this.originalSize,
					s = this.originalPosition;
				return {
					left: s.left + e,
					width: i.width - e
				}
			},
			n: function (t, e, i) {
				var s = this.originalSize,
					n = this.originalPosition;
				return {
					top: n.top + i,
					height: s.height - i
				}
			},
			s: function (t, e, i) {
				return {
					height: this.originalSize.height + i
				}
			},
			se: function (e, i, s) {
				return t.extend(this._change.s.apply(this, arguments), this._change.e.apply(this, [e, i, s]))
			},
			sw: function (e, i, s) {
				return t.extend(this._change.s.apply(this, arguments), this._change.w.apply(this, [e, i, s]))
			},
			ne: function (e, i, s) {
				return t.extend(this._change.n.apply(this, arguments), this._change.e.apply(this, [e, i, s]))
			},
			nw: function (e, i, s) {
				return t.extend(this._change.n.apply(this, arguments), this._change.w.apply(this, [e, i, s]))
			}
		},
		_propagate: function (e, i) {
			t.ui.plugin.call(this, e, [i, this.ui()]), "resize" !== e && this._trigger(e, i, this.ui())
		},
		plugins: {},
		ui: function () {
			return {
				originalElement: this.originalElement,
				element: this.element,
				helper: this.helper,
				position: this.position,
				size: this.size,
				originalSize: this.originalSize,
				originalPosition: this.originalPosition
			}
		}
	}), t.ui.plugin.add("resizable", "animate", {
		stop: function (e) {
			var i = t(this).resizable("instance"),
				s = i.options,
				n = i._proportionallyResizeElements,
				o = n.length && /textarea/i.test(n[0].nodeName),
				a = o && i._hasScroll(n[0], "left") ? 0 : i.sizeDiff.height,
				r = o ? 0 : i.sizeDiff.width,
				l = {
					width: i.size.width - r,
					height: i.size.height - a
				},
				h = parseFloat(i.element.css("left")) + (i.position.left - i.originalPosition.left) || null,
				c = parseFloat(i.element.css("top")) + (i.position.top - i.originalPosition.top) || null;
			i.element.animate(t.extend(l, c && h ? {
				top: c,
				left: h
			} : {}), {
				duration: s.animateDuration,
				easing: s.animateEasing,
				step: function () {
					var s = {
						width: parseFloat(i.element.css("width")),
						height: parseFloat(i.element.css("height")),
						top: parseFloat(i.element.css("top")),
						left: parseFloat(i.element.css("left"))
					};
					n && n.length && t(n[0]).css({
						width: s.width,
						height: s.height
					}), i._updateCache(s), i._propagate("resize", e)
				}
			})
		}
	}), t.ui.plugin.add("resizable", "containment", {
		start: function () {
			var e, i, s, n, o, a, r, l = t(this).resizable("instance"),
				h = l.options,
				c = l.element,
				u = h.containment,
				d = u instanceof t ? u.get(0) : /parent/.test(u) ? c.parent().get(0) : u;
			d && (l.containerElement = t(d), /document/.test(u) || u === document ? (l.containerOffset = {
				left: 0,
				top: 0
			}, l.containerPosition = {
				left: 0,
				top: 0
			}, l.parentData = {
				element: t(document),
				left: 0,
				top: 0,
				width: t(document).width(),
				height: t(document).height() || document.body.parentNode.scrollHeight
			}) : (e = t(d), i = [], t(["Top", "Right", "Left", "Bottom"]).each(function (t, s) {
				i[t] = l._num(e.css("padding" + s))
			}), l.containerOffset = e.offset(), l.containerPosition = e.position(), l.containerSize = {
				height: e.innerHeight() - i[3],
				width: e.innerWidth() - i[1]
			}, s = l.containerOffset, n = l.containerSize.height, o = l.containerSize.width, a = l._hasScroll(d, "left") ? d.scrollWidth : o, r = l._hasScroll(d) ? d.scrollHeight : n, l.parentData = {
				element: d,
				left: s.left,
				top: s.top,
				width: a,
				height: r
			}))
		},
		resize: function (e) {
			var i, s, n, o, a = t(this).resizable("instance"),
				r = a.options,
				l = a.containerOffset,
				h = a.position,
				c = a._aspectRatio || e.shiftKey,
				u = {
					top: 0,
					left: 0
				},
				d = a.containerElement,
				p = !0;
			d[0] !== document && /static/.test(d.css("position")) && (u = l), h.left < (a._helper ? l.left : 0) && (a.size.width = a.size.width + (a._helper ? a.position.left - l.left : a.position.left - u.left), c && (a.size.height = a.size.width / a.aspectRatio, p = !1), a.position.left = r.helper ? l.left : 0), h.top < (a._helper ? l.top : 0) && (a.size.height = a.size.height + (a._helper ? a.position.top - l.top : a.position.top), c && (a.size.width = a.size.height * a.aspectRatio, p = !1), a.position.top = a._helper ? l.top : 0), n = a.containerElement.get(0) === a.element.parent().get(0), o = /relative|absolute/.test(a.containerElement.css("position")), n && o ? (a.offset.left = a.parentData.left + a.position.left, a.offset.top = a.parentData.top + a.position.top) : (a.offset.left = a.element.offset().left, a.offset.top = a.element.offset().top), i = Math.abs(a.sizeDiff.width + (a._helper ? a.offset.left - u.left : a.offset.left - l.left)), s = Math.abs(a.sizeDiff.height + (a._helper ? a.offset.top - u.top : a.offset.top - l.top)), i + a.size.width >= a.parentData.width && (a.size.width = a.parentData.width - i, c && (a.size.height = a.size.width / a.aspectRatio, p = !1)), s + a.size.height >= a.parentData.height && (a.size.height = a.parentData.height - s, c && (a.size.width = a.size.height * a.aspectRatio, p = !1)), p || (a.position.left = a.prevPosition.left, a.position.top = a.prevPosition.top, a.size.width = a.prevSize.width, a.size.height = a.prevSize.height)
		},
		stop: function () {
			var e = t(this).resizable("instance"),
				i = e.options,
				s = e.containerOffset,
				n = e.containerPosition,
				o = e.containerElement,
				a = t(e.helper),
				r = a.offset(),
				l = a.outerWidth() - e.sizeDiff.width,
				h = a.outerHeight() - e.sizeDiff.height;
			e._helper && !i.animate && /relative/.test(o.css("position")) && t(this).css({
				left: r.left - n.left - s.left,
				width: l,
				height: h
			}), e._helper && !i.animate && /static/.test(o.css("position")) && t(this).css({
				left: r.left - n.left - s.left,
				width: l,
				height: h
			})
		}
	}), t.ui.plugin.add("resizable", "alsoResize", {
		start: function () {
			var e = t(this).resizable("instance"),
				i = e.options;
			t(i.alsoResize).each(function () {
				var e = t(this);
				e.data("ui-resizable-alsoresize", {
					width: parseFloat(e.width()),
					height: parseFloat(e.height()),
					left: parseFloat(e.css("left")),
					top: parseFloat(e.css("top"))
				})
			})
		},
		resize: function (e, i) {
			var s = t(this).resizable("instance"),
				n = s.options,
				o = s.originalSize,
				a = s.originalPosition,
				r = {
					height: s.size.height - o.height || 0,
					width: s.size.width - o.width || 0,
					top: s.position.top - a.top || 0,
					left: s.position.left - a.left || 0
				};
			t(n.alsoResize).each(function () {
				var e = t(this),
					s = t(this).data("ui-resizable-alsoresize"),
					n = {},
					o = e.parents(i.originalElement[0]).length ? ["width", "height"] : ["width", "height", "top", "left"];
				t.each(o, function (t, e) {
					var i = (s[e] || 0) + (r[e] || 0);
					i && i >= 0 && (n[e] = i || null)
				}), e.css(n)
			})
		},
		stop: function () {
			t(this).removeData("ui-resizable-alsoresize")
		}
	}), t.ui.plugin.add("resizable", "ghost", {
		start: function () {
			var e = t(this).resizable("instance"),
				i = e.size;
			e.ghost = e.originalElement.clone(), e.ghost.css({
				opacity: .25,
				display: "block",
				position: "relative",
				height: i.height,
				width: i.width,
				margin: 0,
				left: 0,
				top: 0
			}), e._addClass(e.ghost, "ui-resizable-ghost"), t.uiBackCompat !== !1 && "string" == typeof e.options.ghost && e.ghost.addClass(this.options.ghost), e.ghost.appendTo(e.helper)
		},
		resize: function () {
			var e = t(this).resizable("instance");
			e.ghost && e.ghost.css({
				position: "relative",
				height: e.size.height,
				width: e.size.width
			})
		},
		stop: function () {
			var e = t(this).resizable("instance");
			e.ghost && e.helper && e.helper.get(0).removeChild(e.ghost.get(0))
		}
	}), t.ui.plugin.add("resizable", "grid", {
		resize: function () {
			var e, i = t(this).resizable("instance"),
				s = i.options,
				n = i.size,
				o = i.originalSize,
				a = i.originalPosition,
				r = i.axis,
				l = "number" == typeof s.grid ? [s.grid, s.grid] : s.grid,
				h = l[0] || 1,
				c = l[1] || 1,
				u = Math.round((n.width - o.width) / h) * h,
				d = Math.round((n.height - o.height) / c) * c,
				p = o.width + u,
				f = o.height + d,
				g = s.maxWidth && p > s.maxWidth,
				m = s.maxHeight && f > s.maxHeight,
				_ = s.minWidth && s.minWidth > p,
				v = s.minHeight && s.minHeight > f;
			s.grid = l, _ && (p += h), v && (f += c), g && (p -= h), m && (f -= c), /^(se|s|e)$/.test(r) ? (i.size.width = p, i.size.height = f) : /^(ne)$/.test(r) ? (i.size.width = p, i.size.height = f, i.position.top = a.top - d) : /^(sw)$/.test(r) ? (i.size.width = p, i.size.height = f, i.position.left = a.left - u) : ((0 >= f - c || 0 >= p - h) && (e = i._getPaddingPlusBorderDimensions(this)), f - c > 0 ? (i.size.height = f, i.position.top = a.top - d) : (f = c - e.height, i.size.height = f, i.position.top = a.top + o.height - f), p - h > 0 ? (i.size.width = p, i.position.left = a.left - u) : (p = h - e.width, i.size.width = p, i.position.left = a.left + o.width - p))
		}
	}), t.ui.resizable, t.widget("ui.selectable", t.ui.mouse, {
		version: "1.12.1",
		options: {
			appendTo: "body",
			autoRefresh: !0,
			distance: 0,
			filter: "*",
			tolerance: "touch",
			selected: null,
			selecting: null,
			start: null,
			stop: null,
			unselected: null,
			unselecting: null
		},
		_create: function () {
			var e = this;
			this._addClass("ui-selectable"), this.dragged = !1, this.refresh = function () {
				e.elementPos = t(e.element[0]).offset(), e.selectees = t(e.options.filter, e.element[0]), e._addClass(e.selectees, "ui-selectee"), e.selectees.each(function () {
					var i = t(this),
						s = i.offset(),
						n = {
							left: s.left - e.elementPos.left,
							top: s.top - e.elementPos.top
						};
					t.data(this, "selectable-item", {
						element: this,
						$element: i,
						left: n.left,
						top: n.top,
						right: n.left + i.outerWidth(),
						bottom: n.top + i.outerHeight(),
						startselected: !1,
						selected: i.hasClass("ui-selected"),
						selecting: i.hasClass("ui-selecting"),
						unselecting: i.hasClass("ui-unselecting")
					})
				})
			}, this.refresh(), this._mouseInit(), this.helper = t("<div>"), this._addClass(this.helper, "ui-selectable-helper")
		},
		_destroy: function () {
			this.selectees.removeData("selectable-item"), this._mouseDestroy()
		},
		_mouseStart: function (e) {
			var i = this,
				s = this.options;
			this.opos = [e.pageX, e.pageY], this.elementPos = t(this.element[0]).offset(), this.options.disabled || (this.selectees = t(s.filter, this.element[0]), this._trigger("start", e), t(s.appendTo).append(this.helper), this.helper.css({
				left: e.pageX,
				top: e.pageY,
				width: 0,
				height: 0
			}), s.autoRefresh && this.refresh(), this.selectees.filter(".ui-selected").each(function () {
				var s = t.data(this, "selectable-item");
				s.startselected = !0, e.metaKey || e.ctrlKey || (i._removeClass(s.$element, "ui-selected"), s.selected = !1, i._addClass(s.$element, "ui-unselecting"), s.unselecting = !0, i._trigger("unselecting", e, {
					unselecting: s.element
				}))
			}), t(e.target).parents().addBack().each(function () {
				var s, n = t.data(this, "selectable-item");
				return n ? (s = !e.metaKey && !e.ctrlKey || !n.$element.hasClass("ui-selected"), i._removeClass(n.$element, s ? "ui-unselecting" : "ui-selected")._addClass(n.$element, s ? "ui-selecting" : "ui-unselecting"), n.unselecting = !s, n.selecting = s, n.selected = s, s ? i._trigger("selecting", e, {
					selecting: n.element
				}) : i._trigger("unselecting", e, {
					unselecting: n.element
				}), !1) : void 0
			}))
		},
		_mouseDrag: function (e) {
			if (this.dragged = !0, !this.options.disabled) {
				var i, s = this,
					n = this.options,
					o = this.opos[0],
					a = this.opos[1],
					r = e.pageX,
					l = e.pageY;
				return o > r && (i = r, r = o, o = i), a > l && (i = l, l = a, a = i), this.helper.css({
					left: o,
					top: a,
					width: r - o,
					height: l - a
				}), this.selectees.each(function () {
					var i = t.data(this, "selectable-item"),
						h = !1,
						c = {};
					i && i.element !== s.element[0] && (c.left = i.left + s.elementPos.left, c.right = i.right + s.elementPos.left, c.top = i.top + s.elementPos.top, c.bottom = i.bottom + s.elementPos.top, "touch" === n.tolerance ? h = !(c.left > r || o > c.right || c.top > l || a > c.bottom) : "fit" === n.tolerance && (h = c.left > o && r > c.right && c.top > a && l > c.bottom), h ? (i.selected && (s._removeClass(i.$element, "ui-selected"), i.selected = !1), i.unselecting && (s._removeClass(i.$element, "ui-unselecting"), i.unselecting = !1), i.selecting || (s._addClass(i.$element, "ui-selecting"), i.selecting = !0, s._trigger("selecting", e, {
						selecting: i.element
					}))) : (i.selecting && ((e.metaKey || e.ctrlKey) && i.startselected ? (s._removeClass(i.$element, "ui-selecting"), i.selecting = !1, s._addClass(i.$element, "ui-selected"), i.selected = !0) : (s._removeClass(i.$element, "ui-selecting"), i.selecting = !1, i.startselected && (s._addClass(i.$element, "ui-unselecting"), i.unselecting = !0), s._trigger("unselecting", e, {
						unselecting: i.element
					}))), i.selected && (e.metaKey || e.ctrlKey || i.startselected || (s._removeClass(i.$element, "ui-selected"), i.selected = !1, s._addClass(i.$element, "ui-unselecting"), i.unselecting = !0, s._trigger("unselecting", e, {
						unselecting: i.element
					})))))
				}), !1
			}
		},
		_mouseStop: function (e) {
			var i = this;
			return this.dragged = !1, t(".ui-unselecting", this.element[0]).each(function () {
				var s = t.data(this, "selectable-item");
				i._removeClass(s.$element, "ui-unselecting"), s.unselecting = !1, s.startselected = !1, i._trigger("unselected", e, {
					unselected: s.element
				})
			}), t(".ui-selecting", this.element[0]).each(function () {
				var s = t.data(this, "selectable-item");
				i._removeClass(s.$element, "ui-selecting")._addClass(s.$element, "ui-selected"), s.selecting = !1, s.selected = !0, s.startselected = !0, i._trigger("selected", e, {
					selected: s.element
				})
			}), this._trigger("stop", e), this.helper.remove(), !1
		}
	}), t.widget("ui.sortable", t.ui.mouse, {
		version: "1.12.1",
		widgetEventPrefix: "sort",
		ready: !1,
		options: {
			appendTo: "parent",
			axis: !1,
			connectWith: !1,
			containment: !1,
			cursor: "auto",
			cursorAt: !1,
			dropOnEmpty: !0,
			forcePlaceholderSize: !1,
			forceHelperSize: !1,
			grid: !1,
			handle: !1,
			helper: "original",
			items: "> *",
			opacity: !1,
			placeholder: !1,
			revert: !1,
			scroll: !0,
			scrollSensitivity: 20,
			scrollSpeed: 20,
			scope: "default",
			tolerance: "intersect",
			zIndex: 1e3,
			activate: null,
			beforeStop: null,
			change: null,
			deactivate: null,
			out: null,
			over: null,
			receive: null,
			remove: null,
			sort: null,
			start: null,
			stop: null,
			update: null
		},
		_isOverAxis: function (t, e, i) {
			return t >= e && e + i > t
		},
		_isFloating: function (t) {
			return /left|right/.test(t.css("float")) || /inline|table-cell/.test(t.css("display"))
		},
		_create: function () {
			this.containerCache = {}, this._addClass("ui-sortable"), this.refresh(), this.offset = this.element.offset(), this._mouseInit(), this._setHandleClassName(), this.ready = !0
		},
		_setOption: function (t, e) {
			this._super(t, e), "handle" === t && this._setHandleClassName()
		},
		_setHandleClassName: function () {
			var e = this;
			this._removeClass(this.element.find(".ui-sortable-handle"), "ui-sortable-handle"), t.each(this.items, function () {
				e._addClass(this.instance.options.handle ? this.item.find(this.instance.options.handle) : this.item, "ui-sortable-handle")
			})
		},
		_destroy: function () {
			this._mouseDestroy();
			for (var t = this.items.length - 1; t >= 0; t--) this.items[t].item.removeData(this.widgetName + "-item");
			return this
		},
		_mouseCapture: function (e, i) {
			var s = null,
				n = !1,
				o = this;
			return this.reverting ? !1 : this.options.disabled || "static" === this.options.type ? !1 : (this._refreshItems(e), t(e.target).parents().each(function () {
				return t.data(this, o.widgetName + "-item") === o ? (s = t(this), !1) : void 0
			}), t.data(e.target, o.widgetName + "-item") === o && (s = t(e.target)), s ? !this.options.handle || i || (t(this.options.handle, s).find("*").addBack().each(function () {
				this === e.target && (n = !0)
			}), n) ? (this.currentItem = s, this._removeCurrentsFromItems(), !0) : !1 : !1)
		},
		_mouseStart: function (e, i, s) {
			var n, o, a = this.options;
			if (this.currentContainer = this, this.refreshPositions(), this.helper = this._createHelper(e), this._cacheHelperProportions(), this._cacheMargins(), this.scrollParent = this.helper.scrollParent(), this.offset = this.currentItem.offset(), this.offset = {
					top: this.offset.top - this.margins.top,
					left: this.offset.left - this.margins.left
				}, t.extend(this.offset, {
					click: {
						left: e.pageX - this.offset.left,
						top: e.pageY - this.offset.top
					},
					parent: this._getParentOffset(),
					relative: this._getRelativeOffset()
				}), this.helper.css("position", "absolute"), this.cssPosition = this.helper.css("position"), this.originalPosition = this._generatePosition(e), this.originalPageX = e.pageX, this.originalPageY = e.pageY, a.cursorAt && this._adjustOffsetFromHelper(a.cursorAt), this.domPosition = {
					prev: this.currentItem.prev()[0],
					parent: this.currentItem.parent()[0]
				}, this.helper[0] !== this.currentItem[0] && this.currentItem.hide(), this._createPlaceholder(), a.containment && this._setContainment(), a.cursor && "auto" !== a.cursor && (o = this.document.find("body"), this.storedCursor = o.css("cursor"), o.css("cursor", a.cursor), this.storedStylesheet = t("<style>*{ cursor: " + a.cursor + " !important; }</style>").appendTo(o)), a.opacity && (this.helper.css("opacity") && (this._storedOpacity = this.helper.css("opacity")), this.helper.css("opacity", a.opacity)), a.zIndex && (this.helper.css("zIndex") && (this._storedZIndex = this.helper.css("zIndex")), this.helper.css("zIndex", a.zIndex)), this.scrollParent[0] !== this.document[0] && "HTML" !== this.scrollParent[0].tagName && (this.overflowOffset = this.scrollParent.offset()), this._trigger("start", e, this._uiHash()), this._preserveHelperProportions || this._cacheHelperProportions(), !s)
				for (n = this.containers.length - 1; n >= 0; n--) this.containers[n]._trigger("activate", e, this._uiHash(this));
			return t.ui.ddmanager && (t.ui.ddmanager.current = this), t.ui.ddmanager && !a.dropBehaviour && t.ui.ddmanager.prepareOffsets(this, e), this.dragging = !0, this._addClass(this.helper, "ui-sortable-helper"), this._mouseDrag(e), !0
		},
		_mouseDrag: function (e) {
			var i, s, n, o, a = this.options,
				r = !1;
			for (this.position = this._generatePosition(e), this.positionAbs = this._convertPositionTo("absolute"), this.lastPositionAbs || (this.lastPositionAbs = this.positionAbs), this.options.scroll && (this.scrollParent[0] !== this.document[0] && "HTML" !== this.scrollParent[0].tagName ? (this.overflowOffset.top + this.scrollParent[0].offsetHeight - e.pageY < a.scrollSensitivity ? this.scrollParent[0].scrollTop = r = this.scrollParent[0].scrollTop + a.scrollSpeed : e.pageY - this.overflowOffset.top < a.scrollSensitivity && (this.scrollParent[0].scrollTop = r = this.scrollParent[0].scrollTop - a.scrollSpeed), this.overflowOffset.left + this.scrollParent[0].offsetWidth - e.pageX < a.scrollSensitivity ? this.scrollParent[0].scrollLeft = r = this.scrollParent[0].scrollLeft + a.scrollSpeed : e.pageX - this.overflowOffset.left < a.scrollSensitivity && (this.scrollParent[0].scrollLeft = r = this.scrollParent[0].scrollLeft - a.scrollSpeed)) : (e.pageY - this.document.scrollTop() < a.scrollSensitivity ? r = this.document.scrollTop(this.document.scrollTop() - a.scrollSpeed) : this.window.height() - (e.pageY - this.document.scrollTop()) < a.scrollSensitivity && (r = this.document.scrollTop(this.document.scrollTop() + a.scrollSpeed)), e.pageX - this.document.scrollLeft() < a.scrollSensitivity ? r = this.document.scrollLeft(this.document.scrollLeft() - a.scrollSpeed) : this.window.width() - (e.pageX - this.document.scrollLeft()) < a.scrollSensitivity && (r = this.document.scrollLeft(this.document.scrollLeft() + a.scrollSpeed))), r !== !1 && t.ui.ddmanager && !a.dropBehaviour && t.ui.ddmanager.prepareOffsets(this, e)), this.positionAbs = this._convertPositionTo("absolute"), this.options.axis && "y" === this.options.axis || (this.helper[0].style.left = this.position.left + "px"), this.options.axis && "x" === this.options.axis || (this.helper[0].style.top = this.position.top + "px"), i = this.items.length - 1; i >= 0; i--)
				if (s = this.items[i], n = s.item[0], o = this._intersectsWithPointer(s), o && s.instance === this.currentContainer && n !== this.currentItem[0] && this.placeholder[1 === o ? "next" : "prev"]()[0] !== n && !t.contains(this.placeholder[0], n) && ("semi-dynamic" === this.options.type ? !t.contains(this.element[0], n) : !0)) {
					if (this.direction = 1 === o ? "down" : "up", "pointer" !== this.options.tolerance && !this._intersectsWithSides(s)) break;
					this._rearrange(e, s), this._trigger("change", e, this._uiHash());
					break
				} return this._contactContainers(e), t.ui.ddmanager && t.ui.ddmanager.drag(this, e), this._trigger("sort", e, this._uiHash()), this.lastPositionAbs = this.positionAbs, !1
		},
		_mouseStop: function (e, i) {
			if (e) {
				if (t.ui.ddmanager && !this.options.dropBehaviour && t.ui.ddmanager.drop(this, e), this.options.revert) {
					var s = this,
						n = this.placeholder.offset(),
						o = this.options.axis,
						a = {};
					o && "x" !== o || (a.left = n.left - this.offset.parent.left - this.margins.left + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollLeft)), o && "y" !== o || (a.top = n.top - this.offset.parent.top - this.margins.top + (this.offsetParent[0] === this.document[0].body ? 0 : this.offsetParent[0].scrollTop)), this.reverting = !0, t(this.helper).animate(a, parseInt(this.options.revert, 10) || 500, function () {
						s._clear(e)
					})
				} else this._clear(e, i);
				return !1
			}
		},
		cancel: function () {
			if (this.dragging) {
				this._mouseUp(new t.Event("mouseup", {
					target: null
				})), "original" === this.options.helper ? (this.currentItem.css(this._storedCSS), this._removeClass(this.currentItem, "ui-sortable-helper")) : this.currentItem.show();
				for (var e = this.containers.length - 1; e >= 0; e--) this.containers[e]._trigger("deactivate", null, this._uiHash(this)), this.containers[e].containerCache.over && (this.containers[e]._trigger("out", null, this._uiHash(this)), this.containers[e].containerCache.over = 0)
			}
			return this.placeholder && (this.placeholder[0].parentNode && this.placeholder[0].parentNode.removeChild(this.placeholder[0]), "original" !== this.options.helper && this.helper && this.helper[0].parentNode && this.helper.remove(), t.extend(this, {
				helper: null,
				dragging: !1,
				reverting: !1,
				_noFinalSort: null
			}), this.domPosition.prev ? t(this.domPosition.prev).after(this.currentItem) : t(this.domPosition.parent).prepend(this.currentItem)), this
		},
		serialize: function (e) {
			var i = this._getItemsAsjQuery(e && e.connected),
				s = [];
			return e = e || {}, t(i).each(function () {
				var i = (t(e.item || this).attr(e.attribute || "id") || "").match(e.expression || /(.+)[\-=_](.+)/);
				i && s.push((e.key || i[1] + "[]") + "=" + (e.key && e.expression ? i[1] : i[2]))
			}), !s.length && e.key && s.push(e.key + "="), s.join("&")
		},
		toArray: function (e) {
			var i = this._getItemsAsjQuery(e && e.connected),
				s = [];
			return e = e || {}, i.each(function () {
				s.push(t(e.item || this).attr(e.attribute || "id") || "")
			}), s
		},
		_intersectsWith: function (t) {
			var e = this.positionAbs.left,
				i = e + this.helperProportions.width,
				s = this.positionAbs.top,
				n = s + this.helperProportions.height,
				o = t.left,
				a = o + t.width,
				r = t.top,
				l = r + t.height,
				h = this.offset.click.top,
				c = this.offset.click.left,
				u = "x" === this.options.axis || s + h > r && l > s + h,
				d = "y" === this.options.axis || e + c > o && a > e + c,
				p = u && d;
			return "pointer" === this.options.tolerance || this.options.forcePointerForContainers || "pointer" !== this.options.tolerance && this.helperProportions[this.floating ? "width" : "height"] > t[this.floating ? "width" : "height"] ? p : e + this.helperProportions.width / 2 > o && a > i - this.helperProportions.width / 2 && s + this.helperProportions.height / 2 > r && l > n - this.helperProportions.height / 2
		},
		_intersectsWithPointer: function (t) {
			var e, i, s = "x" === this.options.axis || this._isOverAxis(this.positionAbs.top + this.offset.click.top, t.top, t.height),
				n = "y" === this.options.axis || this._isOverAxis(this.positionAbs.left + this.offset.click.left, t.left, t.width),
				o = s && n;
			return o ? (e = this._getDragVerticalDirection(), i = this._getDragHorizontalDirection(), this.floating ? "right" === i || "down" === e ? 2 : 1 : e && ("down" === e ? 2 : 1)) : !1
		},
		_intersectsWithSides: function (t) {
			var e = this._isOverAxis(this.positionAbs.top + this.offset.click.top, t.top + t.height / 2, t.height),
				i = this._isOverAxis(this.positionAbs.left + this.offset.click.left, t.left + t.width / 2, t.width),
				s = this._getDragVerticalDirection(),
				n = this._getDragHorizontalDirection();
			return this.floating && n ? "right" === n && i || "left" === n && !i : s && ("down" === s && e || "up" === s && !e)
		},
		_getDragVerticalDirection: function () {
			var t = this.positionAbs.top - this.lastPositionAbs.top;
			return 0 !== t && (t > 0 ? "down" : "up")
		},
		_getDragHorizontalDirection: function () {
			var t = this.positionAbs.left - this.lastPositionAbs.left;
			return 0 !== t && (t > 0 ? "right" : "left")
		},
		refresh: function (t) {
			return this._refreshItems(t), this._setHandleClassName(), this.refreshPositions(), this
		},
		_connectWith: function () {
			var t = this.options;
			return t.connectWith.constructor === String ? [t.connectWith] : t.connectWith
		},
		_getItemsAsjQuery: function (e) {
			function i() {
				r.push(this)
			}
			var s, n, o, a, r = [],
				l = [],
				h = this._connectWith();
			if (h && e)
				for (s = h.length - 1; s >= 0; s--)
					for (o = t(h[s], this.document[0]), n = o.length - 1; n >= 0; n--) a = t.data(o[n], this.widgetFullName), a && a !== this && !a.options.disabled && l.push([t.isFunction(a.options.items) ? a.options.items.call(a.element) : t(a.options.items, a.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), a]);
			for (l.push([t.isFunction(this.options.items) ? this.options.items.call(this.element, null, {
					options: this.options,
					item: this.currentItem
				}) : t(this.options.items, this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"), this]), s = l.length - 1; s >= 0; s--) l[s][0].each(i);
			return t(r)
		},
		_removeCurrentsFromItems: function () {
			var e = this.currentItem.find(":data(" + this.widgetName + "-item)");
			this.items = t.grep(this.items, function (t) {
				for (var i = 0; e.length > i; i++)
					if (e[i] === t.item[0]) return !1;
				return !0
			})
		},
		_refreshItems: function (e) {
			this.items = [], this.containers = [this];
			var i, s, n, o, a, r, l, h, c = this.items,
				u = [
					[t.isFunction(this.options.items) ? this.options.items.call(this.element[0], e, {
						item: this.currentItem
					}) : t(this.options.items, this.element), this]
				],
				d = this._connectWith();
			if (d && this.ready)
				for (i = d.length - 1; i >= 0; i--)
					for (n = t(d[i], this.document[0]), s = n.length - 1; s >= 0; s--) o = t.data(n[s], this.widgetFullName), o && o !== this && !o.options.disabled && (u.push([t.isFunction(o.options.items) ? o.options.items.call(o.element[0], e, {
						item: this.currentItem
					}) : t(o.options.items, o.element), o]), this.containers.push(o));
			for (i = u.length - 1; i >= 0; i--)
				for (a = u[i][1], r = u[i][0], s = 0, h = r.length; h > s; s++) l = t(r[s]), l.data(this.widgetName + "-item", a), c.push({
					item: l,
					instance: a,
					width: 0,
					height: 0,
					left: 0,
					top: 0
				})
		},
		refreshPositions: function (e) {
			this.floating = this.items.length ? "x" === this.options.axis || this._isFloating(this.items[0].item) : !1, this.offsetParent && this.helper && (this.offset.parent = this._getParentOffset());
			var i, s, n, o;
			for (i = this.items.length - 1; i >= 0; i--) s = this.items[i], s.instance !== this.currentContainer && this.currentContainer && s.item[0] !== this.currentItem[0] || (n = this.options.toleranceElement ? t(this.options.toleranceElement, s.item) : s.item, e || (s.width = n.outerWidth(), s.height = n.outerHeight()), o = n.offset(), s.left = o.left, s.top = o.top);
			if (this.options.custom && this.options.custom.refreshContainers) this.options.custom.refreshContainers.call(this);
			else
				for (i = this.containers.length - 1; i >= 0; i--) o = this.containers[i].element.offset(), this.containers[i].containerCache.left = o.left, this.containers[i].containerCache.top = o.top, this.containers[i].containerCache.width = this.containers[i].element.outerWidth(), this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
			return this
		},
		_createPlaceholder: function (e) {
			e = e || this;
			var i, s = e.options;
			s.placeholder && s.placeholder.constructor !== String || (i = s.placeholder, s.placeholder = {
				element: function () {
					var s = e.currentItem[0].nodeName.toLowerCase(),
						n = t("<" + s + ">", e.document[0]);
					return e._addClass(n, "ui-sortable-placeholder", i || e.currentItem[0].className)._removeClass(n, "ui-sortable-helper"), "tbody" === s ? e._createTrPlaceholder(e.currentItem.find("tr").eq(0), t("<tr>", e.document[0]).appendTo(n)) : "tr" === s ? e._createTrPlaceholder(e.currentItem, n) : "img" === s && n.attr("src", e.currentItem.attr("src")), i || n.css("visibility", "hidden"), n
				},
				update: function (t, n) {
					(!i || s.forcePlaceholderSize) && (n.height() || n.height(e.currentItem.innerHeight() - parseInt(e.currentItem.css("paddingTop") || 0, 10) - parseInt(e.currentItem.css("paddingBottom") || 0, 10)), n.width() || n.width(e.currentItem.innerWidth() - parseInt(e.currentItem.css("paddingLeft") || 0, 10) - parseInt(e.currentItem.css("paddingRight") || 0, 10)))
				}
			}), e.placeholder = t(s.placeholder.element.call(e.element, e.currentItem)), e.currentItem.after(e.placeholder), s.placeholder.update(e, e.placeholder)
		},
		_createTrPlaceholder: function (e, i) {
			var s = this;
			e.children().each(function () {
				t("<td>&#160;</td>", s.document[0]).attr("colspan", t(this).attr("colspan") || 1).appendTo(i)
			})
		},
		_contactContainers: function (e) {
			var i, s, n, o, a, r, l, h, c, u, d = null,
				p = null;
			for (i = this.containers.length - 1; i >= 0; i--)
				if (!t.contains(this.currentItem[0], this.containers[i].element[0]))
					if (this._intersectsWith(this.containers[i].containerCache)) {
						if (d && t.contains(this.containers[i].element[0], d.element[0])) continue;
						d = this.containers[i], p = i
					} else this.containers[i].containerCache.over && (this.containers[i]._trigger("out", e, this._uiHash(this)), this.containers[i].containerCache.over = 0);
			if (d)
				if (1 === this.containers.length) this.containers[p].containerCache.over || (this.containers[p]._trigger("over", e, this._uiHash(this)), this.containers[p].containerCache.over = 1);
				else {
					for (n = 1e4, o = null, c = d.floating || this._isFloating(this.currentItem), a = c ? "left" : "top", r = c ? "width" : "height", u = c ? "pageX" : "pageY", s = this.items.length - 1; s >= 0; s--) t.contains(this.containers[p].element[0], this.items[s].item[0]) && this.items[s].item[0] !== this.currentItem[0] && (l = this.items[s].item.offset()[a], h = !1, e[u] - l > this.items[s][r] / 2 && (h = !0), n > Math.abs(e[u] - l) && (n = Math.abs(e[u] - l), o = this.items[s], this.direction = h ? "up" : "down"));
					if (!o && !this.options.dropOnEmpty) return;
					if (this.currentContainer === this.containers[p]) return this.currentContainer.containerCache.over || (this.containers[p]._trigger("over", e, this._uiHash()), this.currentContainer.containerCache.over = 1), void 0;
					o ? this._rearrange(e, o, null, !0) : this._rearrange(e, null, this.containers[p].element, !0), this._trigger("change", e, this._uiHash()), this.containers[p]._trigger("change", e, this._uiHash(this)), this.currentContainer = this.containers[p], this.options.placeholder.update(this.currentContainer, this.placeholder), this.containers[p]._trigger("over", e, this._uiHash(this)), this.containers[p].containerCache.over = 1
				}
		},
		_createHelper: function (e) {
			var i = this.options,
				s = t.isFunction(i.helper) ? t(i.helper.apply(this.element[0], [e, this.currentItem])) : "clone" === i.helper ? this.currentItem.clone() : this.currentItem;
			return s.parents("body").length || t("parent" !== i.appendTo ? i.appendTo : this.currentItem[0].parentNode)[0].appendChild(s[0]), s[0] === this.currentItem[0] && (this._storedCSS = {
				width: this.currentItem[0].style.width,
				height: this.currentItem[0].style.height,
				position: this.currentItem.css("position"),
				top: this.currentItem.css("top"),
				left: this.currentItem.css("left")
			}), (!s[0].style.width || i.forceHelperSize) && s.width(this.currentItem.width()), (!s[0].style.height || i.forceHelperSize) && s.height(this.currentItem.height()), s
		},
		_adjustOffsetFromHelper: function (e) {
			"string" == typeof e && (e = e.split(" ")), t.isArray(e) && (e = {
				left: +e[0],
				top: +e[1] || 0
			}), "left" in e && (this.offset.click.left = e.left + this.margins.left), "right" in e && (this.offset.click.left = this.helperProportions.width - e.right + this.margins.left), "top" in e && (this.offset.click.top = e.top + this.margins.top), "bottom" in e && (this.offset.click.top = this.helperProportions.height - e.bottom + this.margins.top)
		},
		_getParentOffset: function () {
			this.offsetParent = this.helper.offsetParent();
			var e = this.offsetParent.offset();
			return "absolute" === this.cssPosition && this.scrollParent[0] !== this.document[0] && t.contains(this.scrollParent[0], this.offsetParent[0]) && (e.left += this.scrollParent.scrollLeft(), e.top += this.scrollParent.scrollTop()), (this.offsetParent[0] === this.document[0].body || this.offsetParent[0].tagName && "html" === this.offsetParent[0].tagName.toLowerCase() && t.ui.ie) && (e = {
				top: 0,
				left: 0
			}), {
				top: e.top + (parseInt(this.offsetParent.css("borderTopWidth"), 10) || 0),
				left: e.left + (parseInt(this.offsetParent.css("borderLeftWidth"), 10) || 0)
			}
		},
		_getRelativeOffset: function () {
			if ("relative" === this.cssPosition) {
				var t = this.currentItem.position();
				return {
					top: t.top - (parseInt(this.helper.css("top"), 10) || 0) + this.scrollParent.scrollTop(),
					left: t.left - (parseInt(this.helper.css("left"), 10) || 0) + this.scrollParent.scrollLeft()
				}
			}
			return {
				top: 0,
				left: 0
			}
		},
		_cacheMargins: function () {
			this.margins = {
				left: parseInt(this.currentItem.css("marginLeft"), 10) || 0,
				top: parseInt(this.currentItem.css("marginTop"), 10) || 0
			}
		},
		_cacheHelperProportions: function () {
			this.helperProportions = {
				width: this.helper.outerWidth(),
				height: this.helper.outerHeight()
			}
		},
		_setContainment: function () {
			var e, i, s, n = this.options;
			"parent" === n.containment && (n.containment = this.helper[0].parentNode), ("document" === n.containment || "window" === n.containment) && (this.containment = [0 - this.offset.relative.left - this.offset.parent.left, 0 - this.offset.relative.top - this.offset.parent.top, "document" === n.containment ? this.document.width() : this.window.width() - this.helperProportions.width - this.margins.left, ("document" === n.containment ? this.document.height() || document.body.parentNode.scrollHeight : this.window.height() || this.document[0].body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top]), /^(document|window|parent)$/.test(n.containment) || (e = t(n.containment)[0], i = t(n.containment).offset(), s = "hidden" !== t(e).css("overflow"), this.containment = [i.left + (parseInt(t(e).css("borderLeftWidth"), 10) || 0) + (parseInt(t(e).css("paddingLeft"), 10) || 0) - this.margins.left, i.top + (parseInt(t(e).css("borderTopWidth"), 10) || 0) + (parseInt(t(e).css("paddingTop"), 10) || 0) - this.margins.top, i.left + (s ? Math.max(e.scrollWidth, e.offsetWidth) : e.offsetWidth) - (parseInt(t(e).css("borderLeftWidth"), 10) || 0) - (parseInt(t(e).css("paddingRight"), 10) || 0) - this.helperProportions.width - this.margins.left, i.top + (s ? Math.max(e.scrollHeight, e.offsetHeight) : e.offsetHeight) - (parseInt(t(e).css("borderTopWidth"), 10) || 0) - (parseInt(t(e).css("paddingBottom"), 10) || 0) - this.helperProportions.height - this.margins.top])
		},
		_convertPositionTo: function (e, i) {
			i || (i = this.position);
			var s = "absolute" === e ? 1 : -1,
				n = "absolute" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && t.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent,
				o = /(html|body)/i.test(n[0].tagName);
			return {
				top: i.top + this.offset.relative.top * s + this.offset.parent.top * s - ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : o ? 0 : n.scrollTop()) * s,
				left: i.left + this.offset.relative.left * s + this.offset.parent.left * s - ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : o ? 0 : n.scrollLeft()) * s
			}
		},
		_generatePosition: function (e) {
			var i, s, n = this.options,
				o = e.pageX,
				a = e.pageY,
				r = "absolute" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && t.contains(this.scrollParent[0], this.offsetParent[0]) ? this.scrollParent : this.offsetParent,
				l = /(html|body)/i.test(r[0].tagName);
			return "relative" !== this.cssPosition || this.scrollParent[0] !== this.document[0] && this.scrollParent[0] !== this.offsetParent[0] || (this.offset.relative = this._getRelativeOffset()), this.originalPosition && (this.containment && (e.pageX - this.offset.click.left < this.containment[0] && (o = this.containment[0] + this.offset.click.left), e.pageY - this.offset.click.top < this.containment[1] && (a = this.containment[1] + this.offset.click.top), e.pageX - this.offset.click.left > this.containment[2] && (o = this.containment[2] + this.offset.click.left), e.pageY - this.offset.click.top > this.containment[3] && (a = this.containment[3] + this.offset.click.top)), n.grid && (i = this.originalPageY + Math.round((a - this.originalPageY) / n.grid[1]) * n.grid[1], a = this.containment ? i - this.offset.click.top >= this.containment[1] && i - this.offset.click.top <= this.containment[3] ? i : i - this.offset.click.top >= this.containment[1] ? i - n.grid[1] : i + n.grid[1] : i, s = this.originalPageX + Math.round((o - this.originalPageX) / n.grid[0]) * n.grid[0], o = this.containment ? s - this.offset.click.left >= this.containment[0] && s - this.offset.click.left <= this.containment[2] ? s : s - this.offset.click.left >= this.containment[0] ? s - n.grid[0] : s + n.grid[0] : s)), {
				top: a - this.offset.click.top - this.offset.relative.top - this.offset.parent.top + ("fixed" === this.cssPosition ? -this.scrollParent.scrollTop() : l ? 0 : r.scrollTop()),
				left: o - this.offset.click.left - this.offset.relative.left - this.offset.parent.left + ("fixed" === this.cssPosition ? -this.scrollParent.scrollLeft() : l ? 0 : r.scrollLeft())
			}
		},
		_rearrange: function (t, e, i, s) {
			i ? i[0].appendChild(this.placeholder[0]) : e.item[0].parentNode.insertBefore(this.placeholder[0], "down" === this.direction ? e.item[0] : e.item[0].nextSibling), this.counter = this.counter ? ++this.counter : 1;
			var n = this.counter;
			this._delay(function () {
				n === this.counter && this.refreshPositions(!s)
			})
		},
		_clear: function (t, e) {
			function i(t, e, i) {
				return function (s) {
					i._trigger(t, s, e._uiHash(e))
				}
			}
			this.reverting = !1;
			var s, n = [];
			if (!this._noFinalSort && this.currentItem.parent().length && this.placeholder.before(this.currentItem), this._noFinalSort = null, this.helper[0] === this.currentItem[0]) {
				for (s in this._storedCSS)("auto" === this._storedCSS[s] || "static" === this._storedCSS[s]) && (this._storedCSS[s] = "");
				this.currentItem.css(this._storedCSS), this._removeClass(this.currentItem, "ui-sortable-helper")
			} else this.currentItem.show();
			for (this.fromOutside && !e && n.push(function (t) {
					this._trigger("receive", t, this._uiHash(this.fromOutside))
				}), !this.fromOutside && this.domPosition.prev === this.currentItem.prev().not(".ui-sortable-helper")[0] && this.domPosition.parent === this.currentItem.parent()[0] || e || n.push(function (t) {
					this._trigger("update", t, this._uiHash())
				}), this !== this.currentContainer && (e || (n.push(function (t) {
					this._trigger("remove", t, this._uiHash())
				}), n.push(function (t) {
					return function (e) {
						t._trigger("receive", e, this._uiHash(this))
					}
				}.call(this, this.currentContainer)), n.push(function (t) {
					return function (e) {
						t._trigger("update", e, this._uiHash(this))
					}
				}.call(this, this.currentContainer)))), s = this.containers.length - 1; s >= 0; s--) e || n.push(i("deactivate", this, this.containers[s])), this.containers[s].containerCache.over && (n.push(i("out", this, this.containers[s])), this.containers[s].containerCache.over = 0);
			if (this.storedCursor && (this.document.find("body").css("cursor", this.storedCursor), this.storedStylesheet.remove()), this._storedOpacity && this.helper.css("opacity", this._storedOpacity), this._storedZIndex && this.helper.css("zIndex", "auto" === this._storedZIndex ? "" : this._storedZIndex), this.dragging = !1, e || this._trigger("beforeStop", t, this._uiHash()), this.placeholder[0].parentNode.removeChild(this.placeholder[0]), this.cancelHelperRemoval || (this.helper[0] !== this.currentItem[0] && this.helper.remove(), this.helper = null), !e) {
				for (s = 0; n.length > s; s++) n[s].call(this, t);
				this._trigger("stop", t, this._uiHash())
			}
			return this.fromOutside = !1, !this.cancelHelperRemoval
		},
		_trigger: function () {
			t.Widget.prototype._trigger.apply(this, arguments) === !1 && this.cancel()
		},
		_uiHash: function (e) {
			var i = e || this;
			return {
				helper: i.helper,
				placeholder: i.placeholder || t([]),
				position: i.position,
				originalPosition: i.originalPosition,
				offset: i.positionAbs,
				item: i.currentItem,
				sender: e ? e.element : null
			}
		}
	}), t.widget("ui.accordion", {
		version: "1.12.1",
		options: {
			active: 0,
			animate: {},
			classes: {
				"ui-accordion-header": "ui-corner-top",
				"ui-accordion-header-collapsed": "ui-corner-all",
				"ui-accordion-content": "ui-corner-bottom"
			},
			collapsible: !1,
			event: "click",
			header: "> li > :first-child, > :not(li):even",
			heightStyle: "auto",
			icons: {
				activeHeader: "ui-icon-triangle-1-s",
				header: "ui-icon-triangle-1-e"
			},
			activate: null,
			beforeActivate: null
		},
		hideProps: {
			borderTopWidth: "hide",
			borderBottomWidth: "hide",
			paddingTop: "hide",
			paddingBottom: "hide",
			height: "hide"
		},
		showProps: {
			borderTopWidth: "show",
			borderBottomWidth: "show",
			paddingTop: "show",
			paddingBottom: "show",
			height: "show"
		},
		_create: function () {
			var e = this.options;
			this.prevShow = this.prevHide = t(), this._addClass("ui-accordion", "ui-widget ui-helper-reset"), this.element.attr("role", "tablist"), e.collapsible || e.active !== !1 && null != e.active || (e.active = 0), this._processPanels(), 0 > e.active && (e.active += this.headers.length), this._refresh()
		},
		_getCreateEventData: function () {
			return {
				header: this.active,
				panel: this.active.length ? this.active.next() : t()
			}
		},
		_createIcons: function () {
			var e, i, s = this.options.icons;
			s && (e = t("<span>"), this._addClass(e, "ui-accordion-header-icon", "ui-icon " + s.header), e.prependTo(this.headers), i = this.active.children(".ui-accordion-header-icon"), this._removeClass(i, s.header)._addClass(i, null, s.activeHeader)._addClass(this.headers, "ui-accordion-icons"))
		},
		_destroyIcons: function () {
			this._removeClass(this.headers, "ui-accordion-icons"), this.headers.children(".ui-accordion-header-icon").remove()
		},
		_destroy: function () {
			var t;
			this.element.removeAttr("role"), this.headers.removeAttr("role aria-expanded aria-selected aria-controls tabIndex").removeUniqueId(), this._destroyIcons(), t = this.headers.next().css("display", "").removeAttr("role aria-hidden aria-labelledby").removeUniqueId(), "content" !== this.options.heightStyle && t.css("height", "")
		},
		_setOption: function (t, e) {
			return "active" === t ? (this._activate(e), void 0) : ("event" === t && (this.options.event && this._off(this.headers, this.options.event), this._setupEvents(e)), this._super(t, e), "collapsible" !== t || e || this.options.active !== !1 || this._activate(0), "icons" === t && (this._destroyIcons(), e && this._createIcons()), void 0)
		},
		_setOptionDisabled: function (t) {
			this._super(t), this.element.attr("aria-disabled", t), this._toggleClass(null, "ui-state-disabled", !!t), this._toggleClass(this.headers.add(this.headers.next()), null, "ui-state-disabled", !!t)
		},
		_keydown: function (e) {
			if (!e.altKey && !e.ctrlKey) {
				var i = t.ui.keyCode,
					s = this.headers.length,
					n = this.headers.index(e.target),
					o = !1;
				switch (e.keyCode) {
					case i.RIGHT:
					case i.DOWN:
						o = this.headers[(n + 1) % s];
						break;
					case i.LEFT:
					case i.UP:
						o = this.headers[(n - 1 + s) % s];
						break;
					case i.SPACE:
					case i.ENTER:
						this._eventHandler(e);
						break;
					case i.HOME:
						o = this.headers[0];
						break;
					case i.END:
						o = this.headers[s - 1]
				}
				o && (t(e.target).attr("tabIndex", -1), t(o).attr("tabIndex", 0), t(o).trigger("focus"), e.preventDefault())
			}
		},
		_panelKeyDown: function (e) {
			e.keyCode === t.ui.keyCode.UP && e.ctrlKey && t(e.currentTarget).prev().trigger("focus")
		},
		refresh: function () {
			var e = this.options;
			this._processPanels(), e.active === !1 && e.collapsible === !0 || !this.headers.length ? (e.active = !1, this.active = t()) : e.active === !1 ? this._activate(0) : this.active.length && !t.contains(this.element[0], this.active[0]) ? this.headers.length === this.headers.find(".ui-state-disabled").length ? (e.active = !1, this.active = t()) : this._activate(Math.max(0, e.active - 1)) : e.active = this.headers.index(this.active), this._destroyIcons(), this._refresh()
		},
		_processPanels: function () {
			var t = this.headers,
				e = this.panels;
			this.headers = this.element.find(this.options.header), this._addClass(this.headers, "ui-accordion-header ui-accordion-header-collapsed", "ui-state-default"), this.panels = this.headers.next().filter(":not(.ui-accordion-content-active)").hide(), this._addClass(this.panels, "ui-accordion-content", "ui-helper-reset ui-widget-content"), e && (this._off(t.not(this.headers)), this._off(e.not(this.panels)))
		},
		_refresh: function () {
			var e, i = this.options,
				s = i.heightStyle,
				n = this.element.parent();
			this.active = this._findActive(i.active), this._addClass(this.active, "ui-accordion-header-active", "ui-state-active")._removeClass(this.active, "ui-accordion-header-collapsed"), this._addClass(this.active.next(), "ui-accordion-content-active"), this.active.next().show(), this.headers.attr("role", "tab").each(function () {
				var e = t(this),
					i = e.uniqueId().attr("id"),
					s = e.next(),
					n = s.uniqueId().attr("id");
				e.attr("aria-controls", n), s.attr("aria-labelledby", i)
			}).next().attr("role", "tabpanel"), this.headers.not(this.active).attr({
				"aria-selected": "false",
				"aria-expanded": "false",
				tabIndex: -1
			}).next().attr({
				"aria-hidden": "true"
			}).hide(), this.active.length ? this.active.attr({
				"aria-selected": "true",
				"aria-expanded": "true",
				tabIndex: 0
			}).next().attr({
				"aria-hidden": "false"
			}) : this.headers.eq(0).attr("tabIndex", 0), this._createIcons(), this._setupEvents(i.event), "fill" === s ? (e = n.height(), this.element.siblings(":visible").each(function () {
				var i = t(this),
					s = i.css("position");
				"absolute" !== s && "fixed" !== s && (e -= i.outerHeight(!0))
			}), this.headers.each(function () {
				e -= t(this).outerHeight(!0)
			}), this.headers.next().each(function () {
				t(this).height(Math.max(0, e - t(this).innerHeight() + t(this).height()))
			}).css("overflow", "auto")) : "auto" === s && (e = 0, this.headers.next().each(function () {
				var i = t(this).is(":visible");
				i || t(this).show(), e = Math.max(e, t(this).css("height", "").height()), i || t(this).hide()
			}).height(e))
		},
		_activate: function (e) {
			var i = this._findActive(e)[0];
			i !== this.active[0] && (i = i || this.active[0], this._eventHandler({
				target: i,
				currentTarget: i,
				preventDefault: t.noop
			}))
		},
		_findActive: function (e) {
			return "number" == typeof e ? this.headers.eq(e) : t()
		},
		_setupEvents: function (e) {
			var i = {
				keydown: "_keydown"
			};
			e && t.each(e.split(" "), function (t, e) {
				i[e] = "_eventHandler"
			}), this._off(this.headers.add(this.headers.next())), this._on(this.headers, i), this._on(this.headers.next(), {
				keydown: "_panelKeyDown"
			}), this._hoverable(this.headers), this._focusable(this.headers)
		},
		_eventHandler: function (e) {
			var i, s, n = this.options,
				o = this.active,
				a = t(e.currentTarget),
				r = a[0] === o[0],
				l = r && n.collapsible,
				h = l ? t() : a.next(),
				c = o.next(),
				u = {
					oldHeader: o,
					oldPanel: c,
					newHeader: l ? t() : a,
					newPanel: h
				};
			e.preventDefault(), r && !n.collapsible || this._trigger("beforeActivate", e, u) === !1 || (n.active = l ? !1 : this.headers.index(a), this.active = r ? t() : a, this._toggle(u), this._removeClass(o, "ui-accordion-header-active", "ui-state-active"), n.icons && (i = o.children(".ui-accordion-header-icon"), this._removeClass(i, null, n.icons.activeHeader)._addClass(i, null, n.icons.header)), r || (this._removeClass(a, "ui-accordion-header-collapsed")._addClass(a, "ui-accordion-header-active", "ui-state-active"), n.icons && (s = a.children(".ui-accordion-header-icon"), this._removeClass(s, null, n.icons.header)._addClass(s, null, n.icons.activeHeader)), this._addClass(a.next(), "ui-accordion-content-active")))
		},
		_toggle: function (e) {
			var i = e.newPanel,
				s = this.prevShow.length ? this.prevShow : e.oldPanel;
			this.prevShow.add(this.prevHide).stop(!0, !0), this.prevShow = i, this.prevHide = s, this.options.animate ? this._animate(i, s, e) : (s.hide(), i.show(), this._toggleComplete(e)), s.attr({
				"aria-hidden": "true"
			}), s.prev().attr({
				"aria-selected": "false",
				"aria-expanded": "false"
			}), i.length && s.length ? s.prev().attr({
				tabIndex: -1,
				"aria-expanded": "false"
			}) : i.length && this.headers.filter(function () {
				return 0 === parseInt(t(this).attr("tabIndex"), 10)
			}).attr("tabIndex", -1), i.attr("aria-hidden", "false").prev().attr({
				"aria-selected": "true",
				"aria-expanded": "true",
				tabIndex: 0
			})
		},
		_animate: function (t, e, i) {
			var s, n, o, a = this,
				r = 0,
				l = t.css("box-sizing"),
				h = t.length && (!e.length || t.index() < e.index()),
				c = this.options.animate || {},
				u = h && c.down || c,
				d = function () {
					a._toggleComplete(i)
				};
			return "number" == typeof u && (o = u), "string" == typeof u && (n = u), n = n || u.easing || c.easing, o = o || u.duration || c.duration, e.length ? t.length ? (s = t.show().outerHeight(), e.animate(this.hideProps, {
				duration: o,
				easing: n,
				step: function (t, e) {
					e.now = Math.round(t)
				}
			}), t.hide().animate(this.showProps, {
				duration: o,
				easing: n,
				complete: d,
				step: function (t, i) {
					i.now = Math.round(t), "height" !== i.prop ? "content-box" === l && (r += i.now) : "content" !== a.options.heightStyle && (i.now = Math.round(s - e.outerHeight() - r), r = 0)
				}
			}), void 0) : e.animate(this.hideProps, o, n, d) : t.animate(this.showProps, o, n, d)
		},
		_toggleComplete: function (t) {
			var e = t.oldPanel,
				i = e.prev();
			this._removeClass(e, "ui-accordion-content-active"), this._removeClass(i, "ui-accordion-header-active")._addClass(i, "ui-accordion-header-collapsed"), e.length && (e.parent()[0].className = e.parent()[0].className), this._trigger("activate", null, t)
		}
	}), t.widget("ui.menu", {
		version: "1.12.1",
		defaultElement: "<ul>",
		delay: 300,
		options: {
			icons: {
				submenu: "ui-icon-caret-1-e"
			},
			items: "> *",
			menus: "ul",
			position: {
				my: "left top",
				at: "right top"
			},
			role: "menu",
			blur: null,
			focus: null,
			select: null
		},
		_create: function () {
			this.activeMenu = this.element, this.mouseHandled = !1, this.element.uniqueId().attr({
				role: this.options.role,
				tabIndex: 0
			}), this._addClass("ui-menu", "ui-widget ui-widget-content"), this._on({
				"mousedown .ui-menu-item": function (t) {
					t.preventDefault()
				},
				"click .ui-menu-item": function (e) {
					var i = t(e.target),
						s = t(t.ui.safeActiveElement(this.document[0]));
					!this.mouseHandled && i.not(".ui-state-disabled").length && (this.select(e), e.isPropagationStopped() || (this.mouseHandled = !0), i.has(".ui-menu").length ? this.expand(e) : !this.element.is(":focus") && s.closest(".ui-menu").length && (this.element.trigger("focus", [!0]), this.active && 1 === this.active.parents(".ui-menu").length && clearTimeout(this.timer)))
				},
				"mouseenter .ui-menu-item": function (e) {
					if (!this.previousFilter) {
						var i = t(e.target).closest(".ui-menu-item"),
							s = t(e.currentTarget);
						i[0] === s[0] && (this._removeClass(s.siblings().children(".ui-state-active"), null, "ui-state-active"), this.focus(e, s))
					}
				},
				mouseleave: "collapseAll",
				"mouseleave .ui-menu": "collapseAll",
				focus: function (t, e) {
					var i = this.active || this.element.find(this.options.items).eq(0);
					e || this.focus(t, i)
				},
				blur: function (e) {
					this._delay(function () {
						var i = !t.contains(this.element[0], t.ui.safeActiveElement(this.document[0]));
						i && this.collapseAll(e)
					})
				},
				keydown: "_keydown"
			}), this.refresh(), this._on(this.document, {
				click: function (t) {
					this._closeOnDocumentClick(t) && this.collapseAll(t), this.mouseHandled = !1
				}
			})
		},
		_destroy: function () {
			var e = this.element.find(".ui-menu-item").removeAttr("role aria-disabled"),
				i = e.children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup");
			this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled tabIndex").removeUniqueId().show(), i.children().each(function () {
				var e = t(this);
				e.data("ui-menu-submenu-caret") && e.remove()
			})
		},
		_keydown: function (e) {
			var i, s, n, o, a = !0;
			switch (e.keyCode) {
				case t.ui.keyCode.PAGE_UP:
					this.previousPage(e);
					break;
				case t.ui.keyCode.PAGE_DOWN:
					this.nextPage(e);
					break;
				case t.ui.keyCode.HOME:
					this._move("first", "first", e);
					break;
				case t.ui.keyCode.END:
					this._move("last", "last", e);
					break;
				case t.ui.keyCode.UP:
					this.previous(e);
					break;
				case t.ui.keyCode.DOWN:
					this.next(e);
					break;
				case t.ui.keyCode.LEFT:
					this.collapse(e);
					break;
				case t.ui.keyCode.RIGHT:
					this.active && !this.active.is(".ui-state-disabled") && this.expand(e);
					break;
				case t.ui.keyCode.ENTER:
				case t.ui.keyCode.SPACE:
					this._activate(e);
					break;
				case t.ui.keyCode.ESCAPE:
					this.collapse(e);
					break;
				default:
					a = !1, s = this.previousFilter || "", o = !1, n = e.keyCode >= 96 && 105 >= e.keyCode ? "" + (e.keyCode - 96) : String.fromCharCode(e.keyCode), clearTimeout(this.filterTimer), n === s ? o = !0 : n = s + n, i = this._filterMenuItems(n), i = o && -1 !== i.index(this.active.next()) ? this.active.nextAll(".ui-menu-item") : i, i.length || (n = String.fromCharCode(e.keyCode), i = this._filterMenuItems(n)), i.length ? (this.focus(e, i), this.previousFilter = n, this.filterTimer = this._delay(function () {
						delete this.previousFilter
					}, 1e3)) : delete this.previousFilter
			}
			a && e.preventDefault()
		},
		_activate: function (t) {
			this.active && !this.active.is(".ui-state-disabled") && (this.active.children("[aria-haspopup='true']").length ? this.expand(t) : this.select(t))
		},
		refresh: function () {
			var e, i, s, n, o, a = this,
				r = this.options.icons.submenu,
				l = this.element.find(this.options.menus);
			this._toggleClass("ui-menu-icons", null, !!this.element.find(".ui-icon").length), s = l.filter(":not(.ui-menu)").hide().attr({
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			}).each(function () {
				var e = t(this),
					i = e.prev(),
					s = t("<span>").data("ui-menu-submenu-caret", !0);
				a._addClass(s, "ui-menu-icon", "ui-icon " + r), i.attr("aria-haspopup", "true").prepend(s), e.attr("aria-labelledby", i.attr("id"))
			}), this._addClass(s, "ui-menu", "ui-widget ui-widget-content ui-front"), e = l.add(this.element), i = e.find(this.options.items), i.not(".ui-menu-item").each(function () {
				var e = t(this);
				a._isDivider(e) && a._addClass(e, "ui-menu-divider", "ui-widget-content")
			}), n = i.not(".ui-menu-item, .ui-menu-divider"), o = n.children().not(".ui-menu").uniqueId().attr({
				tabIndex: -1,
				role: this._itemRole()
			}), this._addClass(n, "ui-menu-item")._addClass(o, "ui-menu-item-wrapper"), i.filter(".ui-state-disabled").attr("aria-disabled", "true"), this.active && !t.contains(this.element[0], this.active[0]) && this.blur()
		},
		_itemRole: function () {
			return {
				menu: "menuitem",
				listbox: "option"
			} [this.options.role]
		},
		_setOption: function (t, e) {
			if ("icons" === t) {
				var i = this.element.find(".ui-menu-icon");
				this._removeClass(i, null, this.options.icons.submenu)._addClass(i, null, e.submenu)
			}
			this._super(t, e)
		},
		_setOptionDisabled: function (t) {
			this._super(t), this.element.attr("aria-disabled", t + ""), this._toggleClass(null, "ui-state-disabled", !!t)
		},
		focus: function (t, e) {
			var i, s, n;
			this.blur(t, t && "focus" === t.type), this._scrollIntoView(e), this.active = e.first(), s = this.active.children(".ui-menu-item-wrapper"), this._addClass(s, null, "ui-state-active"), this.options.role && this.element.attr("aria-activedescendant", s.attr("id")), n = this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper"), this._addClass(n, null, "ui-state-active"), t && "keydown" === t.type ? this._close() : this.timer = this._delay(function () {
				this._close()
			}, this.delay), i = e.children(".ui-menu"), i.length && t && /^mouse/.test(t.type) && this._startOpening(i), this.activeMenu = e.parent(), this._trigger("focus", t, {
				item: e
			})
		},
		_scrollIntoView: function (e) {
			var i, s, n, o, a, r;
			this._hasScroll() && (i = parseFloat(t.css(this.activeMenu[0], "borderTopWidth")) || 0, s = parseFloat(t.css(this.activeMenu[0], "paddingTop")) || 0, n = e.offset().top - this.activeMenu.offset().top - i - s, o = this.activeMenu.scrollTop(), a = this.activeMenu.height(), r = e.outerHeight(), 0 > n ? this.activeMenu.scrollTop(o + n) : n + r > a && this.activeMenu.scrollTop(o + n - a + r))
		},
		blur: function (t, e) {
			e || clearTimeout(this.timer), this.active && (this._removeClass(this.active.children(".ui-menu-item-wrapper"), null, "ui-state-active"), this._trigger("blur", t, {
				item: this.active
			}), this.active = null)
		},
		_startOpening: function (t) {
			clearTimeout(this.timer), "true" === t.attr("aria-hidden") && (this.timer = this._delay(function () {
				this._close(), this._open(t)
			}, this.delay))
		},
		_open: function (e) {
			var i = t.extend({
				of: this.active
			}, this.options.position);
			clearTimeout(this.timer), this.element.find(".ui-menu").not(e.parents(".ui-menu")).hide().attr("aria-hidden", "true"), e.show().removeAttr("aria-hidden").attr("aria-expanded", "true").position(i)
		},
		collapseAll: function (e, i) {
			clearTimeout(this.timer), this.timer = this._delay(function () {
				var s = i ? this.element : t(e && e.target).closest(this.element.find(".ui-menu"));
				s.length || (s = this.element), this._close(s), this.blur(e), this._removeClass(s.find(".ui-state-active"), null, "ui-state-active"), this.activeMenu = s
			}, this.delay)
		},
		_close: function (t) {
			t || (t = this.active ? this.active.parent() : this.element), t.find(".ui-menu").hide().attr("aria-hidden", "true").attr("aria-expanded", "false")
		},
		_closeOnDocumentClick: function (e) {
			return !t(e.target).closest(".ui-menu").length
		},
		_isDivider: function (t) {
			return !/[^\-\u2014\u2013\s]/.test(t.text())
		},
		collapse: function (t) {
			var e = this.active && this.active.parent().closest(".ui-menu-item", this.element);
			e && e.length && (this._close(), this.focus(t, e))
		},
		expand: function (t) {
			var e = this.active && this.active.children(".ui-menu ").find(this.options.items).first();
			e && e.length && (this._open(e.parent()), this._delay(function () {
				this.focus(t, e)
			}))
		},
		next: function (t) {
			this._move("next", "first", t)
		},
		previous: function (t) {
			this._move("prev", "last", t)
		},
		isFirstItem: function () {
			return this.active && !this.active.prevAll(".ui-menu-item").length
		},
		isLastItem: function () {
			return this.active && !this.active.nextAll(".ui-menu-item").length
		},
		_move: function (t, e, i) {
			var s;
			this.active && (s = "first" === t || "last" === t ? this.active["first" === t ? "prevAll" : "nextAll"](".ui-menu-item").eq(-1) : this.active[t + "All"](".ui-menu-item").eq(0)), s && s.length && this.active || (s = this.activeMenu.find(this.options.items)[e]()), this.focus(i, s)
		},
		nextPage: function (e) {
			var i, s, n;
			return this.active ? (this.isLastItem() || (this._hasScroll() ? (s = this.active.offset().top, n = this.element.height(), this.active.nextAll(".ui-menu-item").each(function () {
				return i = t(this), 0 > i.offset().top - s - n
			}), this.focus(e, i)) : this.focus(e, this.activeMenu.find(this.options.items)[this.active ? "last" : "first"]())), void 0) : (this.next(e), void 0)
		},
		previousPage: function (e) {
			var i, s, n;
			return this.active ? (this.isFirstItem() || (this._hasScroll() ? (s = this.active.offset().top, n = this.element.height(), this.active.prevAll(".ui-menu-item").each(function () {
				return i = t(this), i.offset().top - s + n > 0
			}), this.focus(e, i)) : this.focus(e, this.activeMenu.find(this.options.items).first())), void 0) : (this.next(e), void 0)
		},
		_hasScroll: function () {
			return this.element.outerHeight() < this.element.prop("scrollHeight")
		},
		select: function (e) {
			this.active = this.active || t(e.target).closest(".ui-menu-item");
			var i = {
				item: this.active
			};
			this.active.has(".ui-menu").length || this.collapseAll(e, !0), this._trigger("select", e, i)
		},
		_filterMenuItems: function (e) {
			var i = e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&"),
				s = RegExp("^" + i, "i");
			return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function () {
				return s.test(t.trim(t(this).children(".ui-menu-item-wrapper").text()))
			})
		}
	}), t.widget("ui.autocomplete", {
		version: "1.12.1",
		defaultElement: "<input>",
		options: {
			appendTo: null,
			autoFocus: !1,
			delay: 300,
			minLength: 1,
			position: {
				my: "left top",
				at: "left bottom",
				collision: "none"
			},
			source: null,
			change: null,
			close: null,
			focus: null,
			open: null,
			response: null,
			search: null,
			select: null
		},
		requestIndex: 0,
		pending: 0,
		_create: function () {
			var e, i, s, n = this.element[0].nodeName.toLowerCase(),
				o = "textarea" === n,
				a = "input" === n;
			this.isMultiLine = o || !a && this._isContentEditable(this.element), this.valueMethod = this.element[o || a ? "val" : "text"], this.isNewMenu = !0, this._addClass("ui-autocomplete-input"), this.element.attr("autocomplete", "off"), this._on(this.element, {
				keydown: function (n) {
					if (this.element.prop("readOnly")) return e = !0, s = !0, i = !0, void 0;
					e = !1, s = !1, i = !1;
					var o = t.ui.keyCode;
					switch (n.keyCode) {
						case o.PAGE_UP:
							e = !0, this._move("previousPage", n);
							break;
						case o.PAGE_DOWN:
							e = !0, this._move("nextPage", n);
							break;
						case o.UP:
							e = !0, this._keyEvent("previous", n);
							break;
						case o.DOWN:
							e = !0, this._keyEvent("next", n);
							break;
						case o.ENTER:
							this.menu.active && (e = !0, n.preventDefault(), this.menu.select(n));
							break;
						case o.TAB:
							this.menu.active && this.menu.select(n);
							break;
						case o.ESCAPE:
							this.menu.element.is(":visible") && (this.isMultiLine || this._value(this.term), this.close(n), n.preventDefault());
							break;
						default:
							i = !0, this._searchTimeout(n)
					}
				},
				keypress: function (s) {
					if (e) return e = !1, (!this.isMultiLine || this.menu.element.is(":visible")) && s.preventDefault(), void 0;
					if (!i) {
						var n = t.ui.keyCode;
						switch (s.keyCode) {
							case n.PAGE_UP:
								this._move("previousPage", s);
								break;
							case n.PAGE_DOWN:
								this._move("nextPage", s);
								break;
							case n.UP:
								this._keyEvent("previous", s);
								break;
							case n.DOWN:
								this._keyEvent("next", s)
						}
					}
				},
				input: function (t) {
					return s ? (s = !1, t.preventDefault(), void 0) : (this._searchTimeout(t), void 0)
				},
				focus: function () {
					this.selectedItem = null, this.previous = this._value()
				},
				blur: function (t) {
					return this.cancelBlur ? (delete this.cancelBlur, void 0) : (clearTimeout(this.searching), this.close(t), this._change(t), void 0)
				}
			}), this._initSource(), this.menu = t("<ul>").appendTo(this._appendTo()).menu({
				role: null
			}).hide().menu("instance"), this._addClass(this.menu.element, "ui-autocomplete", "ui-front"), this._on(this.menu.element, {
				mousedown: function (e) {
					e.preventDefault(), this.cancelBlur = !0, this._delay(function () {
						delete this.cancelBlur, this.element[0] !== t.ui.safeActiveElement(this.document[0]) && this.element.trigger("focus")
					})
				},
				menufocus: function (e, i) {
					var s, n;
					return this.isNewMenu && (this.isNewMenu = !1, e.originalEvent && /^mouse/.test(e.originalEvent.type)) ? (this.menu.blur(), this.document.one("mousemove", function () {
						t(e.target).trigger(e.originalEvent)
					}), void 0) : (n = i.item.data("ui-autocomplete-item"), !1 !== this._trigger("focus", e, {
						item: n
					}) && e.originalEvent && /^key/.test(e.originalEvent.type) && this._value(n.value), s = i.item.attr("aria-label") || n.value, s && t.trim(s).length && (this.liveRegion.children().hide(), t("<div>").text(s).appendTo(this.liveRegion)), void 0)
				},
				menuselect: function (e, i) {
					var s = i.item.data("ui-autocomplete-item"),
						n = this.previous;
					this.element[0] !== t.ui.safeActiveElement(this.document[0]) && (this.element.trigger("focus"), this.previous = n, this._delay(function () {
						this.previous = n, this.selectedItem = s
					})), !1 !== this._trigger("select", e, {
						item: s
					}) && this._value(s.value), this.term = this._value(), this.close(e), this.selectedItem = s
				}
			}), this.liveRegion = t("<div>", {
				role: "status",
				"aria-live": "assertive",
				"aria-relevant": "additions"
			}).appendTo(this.document[0].body), this._addClass(this.liveRegion, null, "ui-helper-hidden-accessible"), this._on(this.window, {
				beforeunload: function () {
					this.element.removeAttr("autocomplete")
				}
			})
		},
		_destroy: function () {
			clearTimeout(this.searching), this.element.removeAttr("autocomplete"), this.menu.element.remove(), this.liveRegion.remove()
		},
		_setOption: function (t, e) {
			this._super(t, e), "source" === t && this._initSource(), "appendTo" === t && this.menu.element.appendTo(this._appendTo()), "disabled" === t && e && this.xhr && this.xhr.abort()
		},
		_isEventTargetInWidget: function (e) {
			var i = this.menu.element[0];
			return e.target === this.element[0] || e.target === i || t.contains(i, e.target)
		},
		_closeOnClickOutside: function (t) {
			this._isEventTargetInWidget(t) || this.close()
		},
		_appendTo: function () {
			var e = this.options.appendTo;
			return e && (e = e.jquery || e.nodeType ? t(e) : this.document.find(e).eq(0)), e && e[0] || (e = this.element.closest(".ui-front, dialog")), e.length || (e = this.document[0].body), e
		},
		_initSource: function () {
			var e, i, s = this;
			t.isArray(this.options.source) ? (e = this.options.source, this.source = function (i, s) {
				s(t.ui.autocomplete.filter(e, i.term))
			}) : "string" == typeof this.options.source ? (i = this.options.source, this.source = function (e, n) {
				s.xhr && s.xhr.abort(), s.xhr = t.ajax({
					url: i,
					data: e,
					dataType: "json",
					success: function (t) {
						n(t)
					},
					error: function () {
						n([])
					}
				})
			}) : this.source = this.options.source
		},
		_searchTimeout: function (t) {
			clearTimeout(this.searching), this.searching = this._delay(function () {
				var e = this.term === this._value(),
					i = this.menu.element.is(":visible"),
					s = t.altKey || t.ctrlKey || t.metaKey || t.shiftKey;
				(!e || e && !i && !s) && (this.selectedItem = null, this.search(null, t))
			}, this.options.delay)
		},
		search: function (t, e) {
			return t = null != t ? t : this._value(), this.term = this._value(), t.length < this.options.minLength ? this.close(e) : this._trigger("search", e) !== !1 ? this._search(t) : void 0
		},
		_search: function (t) {
			this.pending++, this._addClass("ui-autocomplete-loading"), this.cancelSearch = !1, this.source({
				term: t
			}, this._response())
		},
		_response: function () {
			var e = ++this.requestIndex;
			return t.proxy(function (t) {
				e === this.requestIndex && this.__response(t), this.pending--, this.pending || this._removeClass("ui-autocomplete-loading")
			}, this)
		},
		__response: function (t) {
			t && (t = this._normalize(t)), this._trigger("response", null, {
				content: t
			}), !this.options.disabled && t && t.length && !this.cancelSearch ? (this._suggest(t), this._trigger("open")) : this._close()
		},
		close: function (t) {
			this.cancelSearch = !0, this._close(t)
		},
		_close: function (t) {
			this._off(this.document, "mousedown"), this.menu.element.is(":visible") && (this.menu.element.hide(), this.menu.blur(), this.isNewMenu = !0, this._trigger("close", t))
		},
		_change: function (t) {
			this.previous !== this._value() && this._trigger("change", t, {
				item: this.selectedItem
			})
		},
		_normalize: function (e) {
			return e.length && e[0].label && e[0].value ? e : t.map(e, function (e) {
				return "string" == typeof e ? {
					label: e,
					value: e
				} : t.extend({}, e, {
					label: e.label || e.value,
					value: e.value || e.label
				})
			})
		},
		_suggest: function (e) {
			var i = this.menu.element.empty();
			this._renderMenu(i, e), this.isNewMenu = !0, this.menu.refresh(), i.show(), this._resizeMenu(), i.position(t.extend({
				of: this.element
			}, this.options.position)), this.options.autoFocus && this.menu.next(), this._on(this.document, {
				mousedown: "_closeOnClickOutside"
			})
		},
		_resizeMenu: function () {
			var t = this.menu.element;
			t.outerWidth(Math.max(t.width("").outerWidth() + 1, this.element.outerWidth()))
		},
		_renderMenu: function (e, i) {
			var s = this;
			t.each(i, function (t, i) {
				s._renderItemData(e, i)
			})
		},
		_renderItemData: function (t, e) {
			return this._renderItem(t, e).data("ui-autocomplete-item", e)
		},
		_renderItem: function (e, i) {
			return t("<li>").append(t("<div>").text(i.label)).appendTo(e)
		},
		_move: function (t, e) {
			return this.menu.element.is(":visible") ? this.menu.isFirstItem() && /^previous/.test(t) || this.menu.isLastItem() && /^next/.test(t) ? (this.isMultiLine || this._value(this.term), this.menu.blur(), void 0) : (this.menu[t](e), void 0) : (this.search(null, e), void 0)
		},
		widget: function () {
			return this.menu.element
		},
		_value: function () {
			return this.valueMethod.apply(this.element, arguments)
		},
		_keyEvent: function (t, e) {
			(!this.isMultiLine || this.menu.element.is(":visible")) && (this._move(t, e), e.preventDefault())
		},
		_isContentEditable: function (t) {
			if (!t.length) return !1;
			var e = t.prop("contentEditable");
			return "inherit" === e ? this._isContentEditable(t.parent()) : "true" === e
		}
	}), t.extend(t.ui.autocomplete, {
		escapeRegex: function (t) {
			return t.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")
		},
		filter: function (e, i) {
			var s = RegExp(t.ui.autocomplete.escapeRegex(i), "i");
			return t.grep(e, function (t) {
				return s.test(t.label || t.value || t)
			})
		}
	}), t.widget("ui.autocomplete", t.ui.autocomplete, {
		options: {
			messages: {
				noResults: "No search results.",
				results: function (t) {
					return t + (t > 1 ? " results are" : " result is") + " available, use up and down arrow keys to navigate."
				}
			}
		},
		__response: function (e) {
			var i;
			this._superApply(arguments), this.options.disabled || this.cancelSearch || (i = e && e.length ? this.options.messages.results(e.length) : this.options.messages.noResults, this.liveRegion.children().hide(), t("<div>").text(i).appendTo(this.liveRegion))
		}
	}), t.ui.autocomplete;
	var d = /ui-corner-([a-z]){2,6}/g;
	t.widget("ui.controlgroup", {
		version: "1.12.1",
		defaultElement: "<div>",
		options: {
			direction: "horizontal",
			disabled: null,
			onlyVisible: !0,
			items: {
				button: "input[type=button], input[type=submit], input[type=reset], button, a",
				controlgroupLabel: ".ui-controlgroup-label",
				checkboxradio: "input[type='checkbox'], input[type='radio']",
				selectmenu: "select",
				spinner: ".ui-spinner-input"
			}
		},
		_create: function () {
			this._enhance()
		},
		_enhance: function () {
			this.element.attr("role", "toolbar"), this.refresh()
		},
		_destroy: function () {
			this._callChildMethod("destroy"), this.childWidgets.removeData("ui-controlgroup-data"), this.element.removeAttr("role"), this.options.items.controlgroupLabel && this.element.find(this.options.items.controlgroupLabel).find(".ui-controlgroup-label-contents").contents().unwrap()
		},
		_initWidgets: function () {
			var e = this,
				i = [];
			t.each(this.options.items, function (s, n) {
				var o, a = {};
				return n ? "controlgroupLabel" === s ? (o = e.element.find(n), o.each(function () {
					var e = t(this);
					e.children(".ui-controlgroup-label-contents").length || e.contents().wrapAll("<span class='ui-controlgroup-label-contents'></span>")
				}), e._addClass(o, null, "ui-widget ui-widget-content ui-state-default"), i = i.concat(o.get()), void 0) : (t.fn[s] && (a = e["_" + s + "Options"] ? e["_" + s + "Options"]("middle") : {
					classes: {}
				}, e.element.find(n).each(function () {
					var n = t(this),
						o = n[s]("instance"),
						r = t.widget.extend({}, a);
					if ("button" !== s || !n.parent(".ui-spinner").length) {
						o || (o = n[s]()[s]("instance")), o && (r.classes = e._resolveClassesValues(r.classes, o)), n[s](r);
						var l = n[s]("widget");
						t.data(l[0], "ui-controlgroup-data", o ? o : n[s]("instance")), i.push(l[0])
					}
				})), void 0) : void 0
			}), this.childWidgets = t(t.unique(i)), this._addClass(this.childWidgets, "ui-controlgroup-item")
		},
		_callChildMethod: function (e) {
			this.childWidgets.each(function () {
				var i = t(this),
					s = i.data("ui-controlgroup-data");
				s && s[e] && s[e]()
			})
		},
		_updateCornerClass: function (t, e) {
			var i = "ui-corner-top ui-corner-bottom ui-corner-left ui-corner-right ui-corner-all",
				s = this._buildSimpleOptions(e, "label").classes.label;
			this._removeClass(t, null, i), this._addClass(t, null, s)
		},
		_buildSimpleOptions: function (t, e) {
			var i = "vertical" === this.options.direction,
				s = {
					classes: {}
				};
			return s.classes[e] = {
				middle: "",
				first: "ui-corner-" + (i ? "top" : "left"),
				last: "ui-corner-" + (i ? "bottom" : "right"),
				only: "ui-corner-all"
			} [t], s
		},
		_spinnerOptions: function (t) {
			var e = this._buildSimpleOptions(t, "ui-spinner");
			return e.classes["ui-spinner-up"] = "", e.classes["ui-spinner-down"] = "", e
		},
		_buttonOptions: function (t) {
			return this._buildSimpleOptions(t, "ui-button")
		},
		_checkboxradioOptions: function (t) {
			return this._buildSimpleOptions(t, "ui-checkboxradio-label")
		},
		_selectmenuOptions: function (t) {
			var e = "vertical" === this.options.direction;
			return {
				width: e ? "auto" : !1,
				classes: {
					middle: {
						"ui-selectmenu-button-open": "",
						"ui-selectmenu-button-closed": ""
					},
					first: {
						"ui-selectmenu-button-open": "ui-corner-" + (e ? "top" : "tl"),
						"ui-selectmenu-button-closed": "ui-corner-" + (e ? "top" : "left")
					},
					last: {
						"ui-selectmenu-button-open": e ? "" : "ui-corner-tr",
						"ui-selectmenu-button-closed": "ui-corner-" + (e ? "bottom" : "right")
					},
					only: {
						"ui-selectmenu-button-open": "ui-corner-top",
						"ui-selectmenu-button-closed": "ui-corner-all"
					}
				} [t]
			}
		},
		_resolveClassesValues: function (e, i) {
			var s = {};
			return t.each(e, function (n) {
				var o = i.options.classes[n] || "";
				o = t.trim(o.replace(d, "")), s[n] = (o + " " + e[n]).replace(/\s+/g, " ")
			}), s
		},
		_setOption: function (t, e) {
			return "direction" === t && this._removeClass("ui-controlgroup-" + this.options.direction), this._super(t, e), "disabled" === t ? (this._callChildMethod(e ? "disable" : "enable"), void 0) : (this.refresh(), void 0)
		},
		refresh: function () {
			var e, i = this;
			this._addClass("ui-controlgroup ui-controlgroup-" + this.options.direction), "horizontal" === this.options.direction && this._addClass(null, "ui-helper-clearfix"), this._initWidgets(), e = this.childWidgets, this.options.onlyVisible && (e = e.filter(":visible")), e.length && (t.each(["first", "last"], function (t, s) {
				var n = e[s]().data("ui-controlgroup-data");
				if (n && i["_" + n.widgetName + "Options"]) {
					var o = i["_" + n.widgetName + "Options"](1 === e.length ? "only" : s);
					o.classes = i._resolveClassesValues(o.classes, n), n.element[n.widgetName](o)
				} else i._updateCornerClass(e[s](), s)
			}), this._callChildMethod("refresh"))
		}
	}), t.widget("ui.checkboxradio", [t.ui.formResetMixin, {
		version: "1.12.1",
		options: {
			disabled: null,
			label: null,
			icon: !0,
			classes: {
				"ui-checkboxradio-label": "ui-corner-all",
				"ui-checkboxradio-icon": "ui-corner-all"
			}
		},
		_getCreateOptions: function () {
			var e, i, s = this,
				n = this._super() || {};
			return this._readType(), i = this.element.labels(), this.label = t(i[i.length - 1]), this.label.length || t.error("No label found for checkboxradio widget"), this.originalLabel = "", this.label.contents().not(this.element[0]).each(function () {
				s.originalLabel += 3 === this.nodeType ? t(this).text() : this.outerHTML
			}), this.originalLabel && (n.label = this.originalLabel), e = this.element[0].disabled, null != e && (n.disabled = e), n
		},
		_create: function () {
			var t = this.element[0].checked;
			this._bindFormResetHandler(), null == this.options.disabled && (this.options.disabled = this.element[0].disabled), this._setOption("disabled", this.options.disabled), this._addClass("ui-checkboxradio", "ui-helper-hidden-accessible"), this._addClass(this.label, "ui-checkboxradio-label", "ui-button ui-widget"), "radio" === this.type && this._addClass(this.label, "ui-checkboxradio-radio-label"), this.options.label && this.options.label !== this.originalLabel ? this._updateLabel() : this.originalLabel && (this.options.label = this.originalLabel), this._enhance(), t && (this._addClass(this.label, "ui-checkboxradio-checked", "ui-state-active"), this.icon && this._addClass(this.icon, null, "ui-state-hover")), this._on({
				change: "_toggleClasses",
				focus: function () {
					this._addClass(this.label, null, "ui-state-focus ui-visual-focus")
				},
				blur: function () {
					this._removeClass(this.label, null, "ui-state-focus ui-visual-focus")
				}
			})
		},
		_readType: function () {
			var e = this.element[0].nodeName.toLowerCase();
			this.type = this.element[0].type, "input" === e && /radio|checkbox/.test(this.type) || t.error("Can't create checkboxradio on element.nodeName=" + e + " and element.type=" + this.type)
		},
		_enhance: function () {
			this._updateIcon(this.element[0].checked)
		},
		widget: function () {
			return this.label
		},
		_getRadioGroup: function () {
			var e, i = this.element[0].name,
				s = "input[name='" + t.ui.escapeSelector(i) + "']";
			return i ? (e = this.form.length ? t(this.form[0].elements).filter(s) : t(s).filter(function () {
				return 0 === t(this).form().length
			}), e.not(this.element)) : t([])
		},
		_toggleClasses: function () {
			var e = this.element[0].checked;
			this._toggleClass(this.label, "ui-checkboxradio-checked", "ui-state-active", e), this.options.icon && "checkbox" === this.type && this._toggleClass(this.icon, null, "ui-icon-check ui-state-checked", e)._toggleClass(this.icon, null, "ui-icon-blank", !e), "radio" === this.type && this._getRadioGroup().each(function () {
				var e = t(this).checkboxradio("instance");
				e && e._removeClass(e.label, "ui-checkboxradio-checked", "ui-state-active")
			})
		},
		_destroy: function () {
			this._unbindFormResetHandler(), this.icon && (this.icon.remove(), this.iconSpace.remove())
		},
		_setOption: function (t, e) {
			return "label" !== t || e ? (this._super(t, e), "disabled" === t ? (this._toggleClass(this.label, null, "ui-state-disabled", e), this.element[0].disabled = e, void 0) : (this.refresh(), void 0)) : void 0
		},
		_updateIcon: function (e) {
			var i = "ui-icon ui-icon-background ";
			this.options.icon ? (this.icon || (this.icon = t("<span>"), this.iconSpace = t("<span> </span>"), this._addClass(this.iconSpace, "ui-checkboxradio-icon-space")), "checkbox" === this.type ? (i += e ? "ui-icon-check ui-state-checked" : "ui-icon-blank", this._removeClass(this.icon, null, e ? "ui-icon-blank" : "ui-icon-check")) : i += "ui-icon-blank", this._addClass(this.icon, "ui-checkboxradio-icon", i), e || this._removeClass(this.icon, null, "ui-icon-check ui-state-checked"), this.icon.prependTo(this.label).after(this.iconSpace)) : void 0 !== this.icon && (this.icon.remove(), this.iconSpace.remove(), delete this.icon)
		},
		_updateLabel: function () {
			var t = this.label.contents().not(this.element[0]);
			this.icon && (t = t.not(this.icon[0])), this.iconSpace && (t = t.not(this.iconSpace[0])), t.remove(), this.label.append(this.options.label)
		},
		refresh: function () {
			var t = this.element[0].checked,
				e = this.element[0].disabled;
			this._updateIcon(t), this._toggleClass(this.label, "ui-checkboxradio-checked", "ui-state-active", t), null !== this.options.label && this._updateLabel(), e !== this.options.disabled && this._setOptions({
				disabled: e
			})
		}
	}]), t.ui.checkboxradio, t.widget("ui.button", {
		version: "1.12.1",
		defaultElement: "<button>",
		options: {
			classes: {
				"ui-button": "ui-corner-all"
			},
			disabled: null,
			icon: null,
			iconPosition: "beginning",
			label: null,
			showLabel: !0
		},
		_getCreateOptions: function () {
			var t, e = this._super() || {};
			return this.isInput = this.element.is("input"), t = this.element[0].disabled, null != t && (e.disabled = t), this.originalLabel = this.isInput ? this.element.val() : this.element.html(), this.originalLabel && (e.label = this.originalLabel), e
		},
		_create: function () {
			!this.option.showLabel & !this.options.icon && (this.options.showLabel = !0), null == this.options.disabled && (this.options.disabled = this.element[0].disabled || !1), this.hasTitle = !!this.element.attr("title"), this.options.label && this.options.label !== this.originalLabel && (this.isInput ? this.element.val(this.options.label) : this.element.html(this.options.label)), this._addClass("ui-button", "ui-widget"), this._setOption("disabled", this.options.disabled), this._enhance(), this.element.is("a") && this._on({
				keyup: function (e) {
					e.keyCode === t.ui.keyCode.SPACE && (e.preventDefault(), this.element[0].click ? this.element[0].click() : this.element.trigger("click"))
				}
			})
		},
		_enhance: function () {
			this.element.is("button") || this.element.attr("role", "button"), this.options.icon && (this._updateIcon("icon", this.options.icon), this._updateTooltip())
		},
		_updateTooltip: function () {
			this.title = this.element.attr("title"), this.options.showLabel || this.title || this.element.attr("title", this.options.label)
		},
		_updateIcon: function (e, i) {
			var s = "iconPosition" !== e,
				n = s ? this.options.iconPosition : i,
				o = "top" === n || "bottom" === n;
			this.icon ? s && this._removeClass(this.icon, null, this.options.icon) : (this.icon = t("<span>"), this._addClass(this.icon, "ui-button-icon", "ui-icon"), this.options.showLabel || this._addClass("ui-button-icon-only")), s && this._addClass(this.icon, null, i), this._attachIcon(n), o ? (this._addClass(this.icon, null, "ui-widget-icon-block"), this.iconSpace && this.iconSpace.remove()) : (this.iconSpace || (this.iconSpace = t("<span> </span>"), this._addClass(this.iconSpace, "ui-button-icon-space")), this._removeClass(this.icon, null, "ui-wiget-icon-block"), this._attachIconSpace(n))
		},
		_destroy: function () {
			this.element.removeAttr("role"), this.icon && this.icon.remove(), this.iconSpace && this.iconSpace.remove(), this.hasTitle || this.element.removeAttr("title")
		},
		_attachIconSpace: function (t) {
			this.icon[/^(?:end|bottom)/.test(t) ? "before" : "after"](this.iconSpace)
		},
		_attachIcon: function (t) {
			this.element[/^(?:end|bottom)/.test(t) ? "append" : "prepend"](this.icon)
		},
		_setOptions: function (t) {
			var e = void 0 === t.showLabel ? this.options.showLabel : t.showLabel,
				i = void 0 === t.icon ? this.options.icon : t.icon;
			e || i || (t.showLabel = !0), this._super(t)
		},
		_setOption: function (t, e) {
			"icon" === t && (e ? this._updateIcon(t, e) : this.icon && (this.icon.remove(), this.iconSpace && this.iconSpace.remove())), "iconPosition" === t && this._updateIcon(t, e), "showLabel" === t && (this._toggleClass("ui-button-icon-only", null, !e), this._updateTooltip()), "label" === t && (this.isInput ? this.element.val(e) : (this.element.html(e), this.icon && (this._attachIcon(this.options.iconPosition), this._attachIconSpace(this.options.iconPosition)))), this._super(t, e), "disabled" === t && (this._toggleClass(null, "ui-state-disabled", e), this.element[0].disabled = e, e && this.element.blur())
		},
		refresh: function () {
			var t = this.element.is("input, button") ? this.element[0].disabled : this.element.hasClass("ui-button-disabled");
			t !== this.options.disabled && this._setOptions({
				disabled: t
			}), this._updateTooltip()
		}
	}), t.uiBackCompat !== !1 && (t.widget("ui.button", t.ui.button, {
		options: {
			text: !0,
			icons: {
				primary: null,
				secondary: null
			}
		},
		_create: function () {
			this.options.showLabel && !this.options.text && (this.options.showLabel = this.options.text), !this.options.showLabel && this.options.text && (this.options.text = this.options.showLabel), this.options.icon || !this.options.icons.primary && !this.options.icons.secondary ? this.options.icon && (this.options.icons.primary = this.options.icon) : this.options.icons.primary ? this.options.icon = this.options.icons.primary : (this.options.icon = this.options.icons.secondary, this.options.iconPosition = "end"), this._super()
		},
		_setOption: function (t, e) {
			return "text" === t ? (this._super("showLabel", e), void 0) : ("showLabel" === t && (this.options.text = e), "icon" === t && (this.options.icons.primary = e), "icons" === t && (e.primary ? (this._super("icon", e.primary), this._super("iconPosition", "beginning")) : e.secondary && (this._super("icon", e.secondary), this._super("iconPosition", "end"))), this._superApply(arguments), void 0)
		}
	}), t.fn.button = function (e) {
		return function () {
			return !this.length || this.length && "INPUT" !== this[0].tagName || this.length && "INPUT" === this[0].tagName && "checkbox" !== this.attr("type") && "radio" !== this.attr("type") ? e.apply(this, arguments) : (t.ui.checkboxradio || t.error("Checkboxradio widget missing"), 0 === arguments.length ? this.checkboxradio({
				icon: !1
			}) : this.checkboxradio.apply(this, arguments))
		}
	}(t.fn.button), t.fn.buttonset = function () {
		return t.ui.controlgroup || t.error("Controlgroup widget missing"), "option" === arguments[0] && "items" === arguments[1] && arguments[2] ? this.controlgroup.apply(this, [arguments[0], "items.button", arguments[2]]) : "option" === arguments[0] && "items" === arguments[1] ? this.controlgroup.apply(this, [arguments[0], "items.button"]) : ("object" == typeof arguments[0] && arguments[0].items && (arguments[0].items = {
			button: arguments[0].items
		}), this.controlgroup.apply(this, arguments))
	}), t.ui.button, t.extend(t.ui, {
		datepicker: {
			version: "1.12.1"
		}
	});
	var p;
	t.extend(s.prototype, {
		markerClassName: "hasDatepicker",
		maxRows: 4,
		_widgetDatepicker: function () {
			return this.dpDiv
		},
		setDefaults: function (t) {
			return a(this._defaults, t || {}), this
		},
		_attachDatepicker: function (e, i) {
			var s, n, o;
			s = e.nodeName.toLowerCase(), n = "div" === s || "span" === s, e.id || (this.uuid += 1, e.id = "dp" + this.uuid), o = this._newInst(t(e), n), o.settings = t.extend({}, i || {}), "input" === s ? this._connectDatepicker(e, o) : n && this._inlineDatepicker(e, o)
		},
		_newInst: function (e, i) {
			var s = e[0].id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1");
			return {
				id: s,
				input: e,
				selectedDay: 0,
				selectedMonth: 0,
				selectedYear: 0,
				drawMonth: 0,
				drawYear: 0,
				inline: i,
				dpDiv: i ? n(t("<div class='" + this._inlineClass + " ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>")) : this.dpDiv
			}
		},
		_connectDatepicker: function (e, i) {
			var s = t(e);
			i.append = t([]), i.trigger = t([]), s.hasClass(this.markerClassName) || (this._attachments(s, i), s.addClass(this.markerClassName).on("keydown", this._doKeyDown).on("keypress", this._doKeyPress).on("keyup", this._doKeyUp), this._autoSize(i), t.data(e, "datepicker", i), i.settings.disabled && this._disableDatepicker(e))
		},
		_attachments: function (e, i) {
			var s, n, o, a = this._get(i, "appendText"),
				r = this._get(i, "isRTL");
			i.append && i.append.remove(), a && (i.append = t("<span class='" + this._appendClass + "'>" + a + "</span>"), e[r ? "before" : "after"](i.append)), e.off("focus", this._showDatepicker), i.trigger && i.trigger.remove(), s = this._get(i, "showOn"), ("focus" === s || "both" === s) && e.on("focus", this._showDatepicker), ("button" === s || "both" === s) && (n = this._get(i, "buttonText"), o = this._get(i, "buttonImage"), i.trigger = t(this._get(i, "buttonImageOnly") ? t("<img/>").addClass(this._triggerClass).attr({
				src: o,
				alt: n,
				title: n
			}) : t("<button type='button'></button>").addClass(this._triggerClass).html(o ? t("<img/>").attr({
				src: o,
				alt: n,
				title: n
			}) : n)), e[r ? "before" : "after"](i.trigger), i.trigger.on("click", function () {
				return t.datepicker._datepickerShowing && t.datepicker._lastInput === e[0] ? t.datepicker._hideDatepicker() : t.datepicker._datepickerShowing && t.datepicker._lastInput !== e[0] ? (t.datepicker._hideDatepicker(), t.datepicker._showDatepicker(e[0])) : t.datepicker._showDatepicker(e[0]), !1
			}))
		},
		_autoSize: function (t) {
			if (this._get(t, "autoSize") && !t.inline) {
				var e, i, s, n, o = new Date(2009, 11, 20),
					a = this._get(t, "dateFormat");
				a.match(/[DM]/) && (e = function (t) {
					for (i = 0, s = 0, n = 0; t.length > n; n++) t[n].length > i && (i = t[n].length, s = n);
					return s
				}, o.setMonth(e(this._get(t, a.match(/MM/) ? "monthNames" : "monthNamesShort"))), o.setDate(e(this._get(t, a.match(/DD/) ? "dayNames" : "dayNamesShort")) + 20 - o.getDay())), t.input.attr("size", this._formatDate(t, o).length)
			}
		},
		_inlineDatepicker: function (e, i) {
			var s = t(e);
			s.hasClass(this.markerClassName) || (s.addClass(this.markerClassName).append(i.dpDiv), t.data(e, "datepicker", i), this._setDate(i, this._getDefaultDate(i), !0), this._updateDatepicker(i), this._updateAlternate(i), i.settings.disabled && this._disableDatepicker(e), i.dpDiv.css("display", "block"))
		},
		_dialogDatepicker: function (e, i, s, n, o) {
			var r, l, h, c, u, d = this._dialogInst;
			return d || (this.uuid += 1, r = "dp" + this.uuid, this._dialogInput = t("<input type='text' id='" + r + "' style='position: absolute; top: -100px; width: 0px;'/>"), this._dialogInput.on("keydown", this._doKeyDown), t("body").append(this._dialogInput), d = this._dialogInst = this._newInst(this._dialogInput, !1), d.settings = {}, t.data(this._dialogInput[0], "datepicker", d)), a(d.settings, n || {}), i = i && i.constructor === Date ? this._formatDate(d, i) : i, this._dialogInput.val(i), this._pos = o ? o.length ? o : [o.pageX, o.pageY] : null, this._pos || (l = document.documentElement.clientWidth, h = document.documentElement.clientHeight, c = document.documentElement.scrollLeft || document.body.scrollLeft, u = document.documentElement.scrollTop || document.body.scrollTop, this._pos = [l / 2 - 100 + c, h / 2 - 150 + u]), this._dialogInput.css("left", this._pos[0] + 20 + "px").css("top", this._pos[1] + "px"), d.settings.onSelect = s, this._inDialog = !0, this.dpDiv.addClass(this._dialogClass), this._showDatepicker(this._dialogInput[0]), t.blockUI && t.blockUI(this.dpDiv), t.data(this._dialogInput[0], "datepicker", d), this
		},
		_destroyDatepicker: function (e) {
			var i, s = t(e),
				n = t.data(e, "datepicker");
			s.hasClass(this.markerClassName) && (i = e.nodeName.toLowerCase(), t.removeData(e, "datepicker"), "input" === i ? (n.append.remove(), n.trigger.remove(), s.removeClass(this.markerClassName).off("focus", this._showDatepicker).off("keydown", this._doKeyDown).off("keypress", this._doKeyPress).off("keyup", this._doKeyUp)) : ("div" === i || "span" === i) && s.removeClass(this.markerClassName).empty(), p === n && (p = null))
		},
		_enableDatepicker: function (e) {
			var i, s, n = t(e),
				o = t.data(e, "datepicker");
			n.hasClass(this.markerClassName) && (i = e.nodeName.toLowerCase(), "input" === i ? (e.disabled = !1, o.trigger.filter("button").each(function () {
				this.disabled = !1
			}).end().filter("img").css({
				opacity: "1.0",
				cursor: ""
			})) : ("div" === i || "span" === i) && (s = n.children("." + this._inlineClass), s.children().removeClass("ui-state-disabled"), s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !1)), this._disabledInputs = t.map(this._disabledInputs, function (t) {
				return t === e ? null : t
			}))
		},
		_disableDatepicker: function (e) {
			var i, s, n = t(e),
				o = t.data(e, "datepicker");
			n.hasClass(this.markerClassName) && (i = e.nodeName.toLowerCase(), "input" === i ? (e.disabled = !0, o.trigger.filter("button").each(function () {
				this.disabled = !0
			}).end().filter("img").css({
				opacity: "0.5",
				cursor: "default"
			})) : ("div" === i || "span" === i) && (s = n.children("." + this._inlineClass), s.children().addClass("ui-state-disabled"), s.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled", !0)), this._disabledInputs = t.map(this._disabledInputs, function (t) {
				return t === e ? null : t
			}), this._disabledInputs[this._disabledInputs.length] = e)
		},
		_isDisabledDatepicker: function (t) {
			if (!t) return !1;
			for (var e = 0; this._disabledInputs.length > e; e++)
				if (this._disabledInputs[e] === t) return !0;
			return !1
		},
		_getInst: function (e) {
			try {
				return t.data(e, "datepicker")
			} catch (i) {
				throw "Missing instance data for this datepicker"
			}
		},
		_optionDatepicker: function (e, i, s) {
			var n, o, r, l, h = this._getInst(e);
			return 2 === arguments.length && "string" == typeof i ? "defaults" === i ? t.extend({}, t.datepicker._defaults) : h ? "all" === i ? t.extend({}, h.settings) : this._get(h, i) : null : (n = i || {}, "string" == typeof i && (n = {}, n[i] = s), h && (this._curInst === h && this._hideDatepicker(), o = this._getDateDatepicker(e, !0), r = this._getMinMaxDate(h, "min"), l = this._getMinMaxDate(h, "max"), a(h.settings, n), null !== r && void 0 !== n.dateFormat && void 0 === n.minDate && (h.settings.minDate = this._formatDate(h, r)), null !== l && void 0 !== n.dateFormat && void 0 === n.maxDate && (h.settings.maxDate = this._formatDate(h, l)), "disabled" in n && (n.disabled ? this._disableDatepicker(e) : this._enableDatepicker(e)), this._attachments(t(e), h), this._autoSize(h), this._setDate(h, o), this._updateAlternate(h), this._updateDatepicker(h)), void 0)
		},
		_changeDatepicker: function (t, e, i) {
			this._optionDatepicker(t, e, i)
		},
		_refreshDatepicker: function (t) {
			var e = this._getInst(t);
			e && this._updateDatepicker(e)
		},
		_setDateDatepicker: function (t, e) {
			var i = this._getInst(t);
			i && (this._setDate(i, e), this._updateDatepicker(i), this._updateAlternate(i))
		},
		_getDateDatepicker: function (t, e) {
			var i = this._getInst(t);
			return i && !i.inline && this._setDateFromField(i, e), i ? this._getDate(i) : null
		},
		_doKeyDown: function (e) {
			var i, s, n, o = t.datepicker._getInst(e.target),
				a = !0,
				r = o.dpDiv.is(".ui-datepicker-rtl");
			if (o._keyEvent = !0, t.datepicker._datepickerShowing) switch (e.keyCode) {
				case 9:
					t.datepicker._hideDatepicker(), a = !1;
					break;
				case 13:
					return n = t("td." + t.datepicker._dayOverClass + ":not(." + t.datepicker._currentClass + ")", o.dpDiv), n[0] && t.datepicker._selectDay(e.target, o.selectedMonth, o.selectedYear, n[0]), i = t.datepicker._get(o, "onSelect"), i ? (s = t.datepicker._formatDate(o), i.apply(o.input ? o.input[0] : null, [s, o])) : t.datepicker._hideDatepicker(), !1;
				case 27:
					t.datepicker._hideDatepicker();
					break;
				case 33:
					t.datepicker._adjustDate(e.target, e.ctrlKey ? -t.datepicker._get(o, "stepBigMonths") : -t.datepicker._get(o, "stepMonths"), "M");
					break;
				case 34:
					t.datepicker._adjustDate(e.target, e.ctrlKey ? +t.datepicker._get(o, "stepBigMonths") : +t.datepicker._get(o, "stepMonths"), "M");
					break;
				case 35:
					(e.ctrlKey || e.metaKey) && t.datepicker._clearDate(e.target), a = e.ctrlKey || e.metaKey;
					break;
				case 36:
					(e.ctrlKey || e.metaKey) && t.datepicker._gotoToday(e.target), a = e.ctrlKey || e.metaKey;
					break;
				case 37:
					(e.ctrlKey || e.metaKey) && t.datepicker._adjustDate(e.target, r ? 1 : -1, "D"), a = e.ctrlKey || e.metaKey, e.originalEvent.altKey && t.datepicker._adjustDate(e.target, e.ctrlKey ? -t.datepicker._get(o, "stepBigMonths") : -t.datepicker._get(o, "stepMonths"), "M");
					break;
				case 38:
					(e.ctrlKey || e.metaKey) && t.datepicker._adjustDate(e.target, -7, "D"), a = e.ctrlKey || e.metaKey;
					break;
				case 39:
					(e.ctrlKey || e.metaKey) && t.datepicker._adjustDate(e.target, r ? -1 : 1, "D"), a = e.ctrlKey || e.metaKey, e.originalEvent.altKey && t.datepicker._adjustDate(e.target, e.ctrlKey ? +t.datepicker._get(o, "stepBigMonths") : +t.datepicker._get(o, "stepMonths"), "M");
					break;
				case 40:
					(e.ctrlKey || e.metaKey) && t.datepicker._adjustDate(e.target, 7, "D"), a = e.ctrlKey || e.metaKey;
					break;
				default:
					a = !1
			} else 36 === e.keyCode && e.ctrlKey ? t.datepicker._showDatepicker(this) : a = !1;
			a && (e.preventDefault(), e.stopPropagation())
		},
		_doKeyPress: function (e) {
			var i, s, n = t.datepicker._getInst(e.target);
			return t.datepicker._get(n, "constrainInput") ? (i = t.datepicker._possibleChars(t.datepicker._get(n, "dateFormat")), s = String.fromCharCode(null == e.charCode ? e.keyCode : e.charCode), e.ctrlKey || e.metaKey || " " > s || !i || i.indexOf(s) > -1) : void 0
		},
		_doKeyUp: function (e) {
			var i, s = t.datepicker._getInst(e.target);
			if (s.input.val() !== s.lastVal) try {
				i = t.datepicker.parseDate(t.datepicker._get(s, "dateFormat"), s.input ? s.input.val() : null, t.datepicker._getFormatConfig(s)), i && (t.datepicker._setDateFromField(s), t.datepicker._updateAlternate(s), t.datepicker._updateDatepicker(s))
			} catch (n) {}
			return !0
		},
		_showDatepicker: function (e) {
			if (e = e.target || e, "input" !== e.nodeName.toLowerCase() && (e = t("input", e.parentNode)[0]), !t.datepicker._isDisabledDatepicker(e) && t.datepicker._lastInput !== e) {
				var s, n, o, r, l, h, c;
				s = t.datepicker._getInst(e), t.datepicker._curInst && t.datepicker._curInst !== s && (t.datepicker._curInst.dpDiv.stop(!0, !0), s && t.datepicker._datepickerShowing && t.datepicker._hideDatepicker(t.datepicker._curInst.input[0])), n = t.datepicker._get(s, "beforeShow"), o = n ? n.apply(e, [e, s]) : {}, o !== !1 && (a(s.settings, o), s.lastVal = null, t.datepicker._lastInput = e, t.datepicker._setDateFromField(s), t.datepicker._inDialog && (e.value = ""), t.datepicker._pos || (t.datepicker._pos = t.datepicker._findPos(e), t.datepicker._pos[1] += e.offsetHeight), r = !1, t(e).parents().each(function () {
					return r |= "fixed" === t(this).css("position"), !r
				}), l = {
					left: t.datepicker._pos[0],
					top: t.datepicker._pos[1]
				}, t.datepicker._pos = null, s.dpDiv.empty(), s.dpDiv.css({
					position: "absolute",
					display: "block",
					top: "-1000px"
				}), t.datepicker._updateDatepicker(s), l = t.datepicker._checkOffset(s, l, r), s.dpDiv.css({
					position: t.datepicker._inDialog && t.blockUI ? "static" : r ? "fixed" : "absolute",
					display: "none",
					left: l.left + "px",
					top: l.top + "px"
				}), s.inline || (h = t.datepicker._get(s, "showAnim"), c = t.datepicker._get(s, "duration"), s.dpDiv.css("z-index", i(t(e)) + 1), t.datepicker._datepickerShowing = !0, t.effects && t.effects.effect[h] ? s.dpDiv.show(h, t.datepicker._get(s, "showOptions"), c) : s.dpDiv[h || "show"](h ? c : null), t.datepicker._shouldFocusInput(s) && s.input.trigger("focus"), t.datepicker._curInst = s))
			}
		},
		_updateDatepicker: function (e) {
			this.maxRows = 4, p = e, e.dpDiv.empty().append(this._generateHTML(e)), this._attachHandlers(e);
			var i, s = this._getNumberOfMonths(e),
				n = s[1],
				a = 17,
				r = e.dpDiv.find("." + this._dayOverClass + " a");
			r.length > 0 && o.apply(r.get(0)), e.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width(""), n > 1 && e.dpDiv.addClass("ui-datepicker-multi-" + n).css("width", a * n + "em"), e.dpDiv[(1 !== s[0] || 1 !== s[1] ? "add" : "remove") + "Class"]("ui-datepicker-multi"), e.dpDiv[(this._get(e, "isRTL") ? "add" : "remove") + "Class"]("ui-datepicker-rtl"), e === t.datepicker._curInst && t.datepicker._datepickerShowing && t.datepicker._shouldFocusInput(e) && e.input.trigger("focus"), e.yearshtml && (i = e.yearshtml, setTimeout(function () {
				i === e.yearshtml && e.yearshtml && e.dpDiv.find("select.ui-datepicker-year:first").replaceWith(e.yearshtml), i = e.yearshtml = null
			}, 0))
		},
		_shouldFocusInput: function (t) {
			return t.input && t.input.is(":visible") && !t.input.is(":disabled") && !t.input.is(":focus")
		},
		_checkOffset: function (e, i, s) {
			var n = e.dpDiv.outerWidth(),
				o = e.dpDiv.outerHeight(),
				a = e.input ? e.input.outerWidth() : 0,
				r = e.input ? e.input.outerHeight() : 0,
				l = document.documentElement.clientWidth + (s ? 0 : t(document).scrollLeft()),
				h = document.documentElement.clientHeight + (s ? 0 : t(document).scrollTop());
			return i.left -= this._get(e, "isRTL") ? n - a : 0, i.left -= s && i.left === e.input.offset().left ? t(document).scrollLeft() : 0, i.top -= s && i.top === e.input.offset().top + r ? t(document).scrollTop() : 0, i.left -= Math.min(i.left, i.left + n > l && l > n ? Math.abs(i.left + n - l) : 0), i.top -= Math.min(i.top, i.top + o > h && h > o ? Math.abs(o + r) : 0), i
		},
		_findPos: function (e) {
			for (var i, s = this._getInst(e), n = this._get(s, "isRTL"); e && ("hidden" === e.type || 1 !== e.nodeType || t.expr.filters.hidden(e));) e = e[n ? "previousSibling" : "nextSibling"];
			return i = t(e).offset(), [i.left, i.top]
		},
		_hideDatepicker: function (e) {
			var i, s, n, o, a = this._curInst;
			!a || e && a !== t.data(e, "datepicker") || this._datepickerShowing && (i = this._get(a, "showAnim"), s = this._get(a, "duration"), n = function () {
				t.datepicker._tidyDialog(a)
			}, t.effects && (t.effects.effect[i] || t.effects[i]) ? a.dpDiv.hide(i, t.datepicker._get(a, "showOptions"), s, n) : a.dpDiv["slideDown" === i ? "slideUp" : "fadeIn" === i ? "fadeOut" : "hide"](i ? s : null, n), i || n(), this._datepickerShowing = !1, o = this._get(a, "onClose"), o && o.apply(a.input ? a.input[0] : null, [a.input ? a.input.val() : "", a]), this._lastInput = null, this._inDialog && (this._dialogInput.css({
				position: "absolute",
				left: "0",
				top: "-100px"
			}), t.blockUI && (t.unblockUI(), t("body").append(this.dpDiv))), this._inDialog = !1)
		},
		_tidyDialog: function (t) {
			t.dpDiv.removeClass(this._dialogClass).off(".ui-datepicker-calendar")
		},
		_checkExternalClick: function (e) {
			if (t.datepicker._curInst) {
				var i = t(e.target),
					s = t.datepicker._getInst(i[0]);
				(i[0].id !== t.datepicker._mainDivId && 0 === i.parents("#" + t.datepicker._mainDivId).length && !i.hasClass(t.datepicker.markerClassName) && !i.closest("." + t.datepicker._triggerClass).length && t.datepicker._datepickerShowing && (!t.datepicker._inDialog || !t.blockUI) || i.hasClass(t.datepicker.markerClassName) && t.datepicker._curInst !== s) && t.datepicker._hideDatepicker()
			}
		},
		_adjustDate: function (e, i, s) {
			var n = t(e),
				o = this._getInst(n[0]);
			this._isDisabledDatepicker(n[0]) || (this._adjustInstDate(o, i + ("M" === s ? this._get(o, "showCurrentAtPos") : 0), s), this._updateDatepicker(o))
		},
		_gotoToday: function (e) {
			var i, s = t(e),
				n = this._getInst(s[0]);
			this._get(n, "gotoCurrent") && n.currentDay ? (n.selectedDay = n.currentDay, n.drawMonth = n.selectedMonth = n.currentMonth, n.drawYear = n.selectedYear = n.currentYear) : (i = new Date, n.selectedDay = i.getDate(), n.drawMonth = n.selectedMonth = i.getMonth(), n.drawYear = n.selectedYear = i.getFullYear()), this._notifyChange(n), this._adjustDate(s)
		},
		_selectMonthYear: function (e, i, s) {
			var n = t(e),
				o = this._getInst(n[0]);
			o["selected" + ("M" === s ? "Month" : "Year")] = o["draw" + ("M" === s ? "Month" : "Year")] = parseInt(i.options[i.selectedIndex].value, 10), this._notifyChange(o), this._adjustDate(n)
		},
		_selectDay: function (e, i, s, n) {
			var o, a = t(e);
			t(n).hasClass(this._unselectableClass) || this._isDisabledDatepicker(a[0]) || (o = this._getInst(a[0]), o.selectedDay = o.currentDay = t("a", n).html(), o.selectedMonth = o.currentMonth = i, o.selectedYear = o.currentYear = s, this._selectDate(e, this._formatDate(o, o.currentDay, o.currentMonth, o.currentYear)))
		},
		_clearDate: function (e) {
			var i = t(e);
			this._selectDate(i, "")
		},
		_selectDate: function (e, i) {
			var s, n = t(e),
				o = this._getInst(n[0]);
			i = null != i ? i : this._formatDate(o), o.input && o.input.val(i), this._updateAlternate(o), s = this._get(o, "onSelect"), s ? s.apply(o.input ? o.input[0] : null, [i, o]) : o.input && o.input.trigger("change"), o.inline ? this._updateDatepicker(o) : (this._hideDatepicker(), this._lastInput = o.input[0], "object" != typeof o.input[0] && o.input.trigger("focus"), this._lastInput = null)
		},
		_updateAlternate: function (e) {
			var i, s, n, o = this._get(e, "altField");
			o && (i = this._get(e, "altFormat") || this._get(e, "dateFormat"), s = this._getDate(e), n = this.formatDate(i, s, this._getFormatConfig(e)), t(o).val(n))
		},
		noWeekends: function (t) {
			var e = t.getDay();
			return [e > 0 && 6 > e, ""]
		},
		iso8601Week: function (t) {
			var e, i = new Date(t.getTime());
			return i.setDate(i.getDate() + 4 - (i.getDay() || 7)), e = i.getTime(), i.setMonth(0), i.setDate(1), Math.floor(Math.round((e - i) / 864e5) / 7) + 1
		},
		parseDate: function (e, i, s) {
			if (null == e || null == i) throw "Invalid arguments";
			if (i = "object" == typeof i ? "" + i : i + "", "" === i) return null;
			var n, o, a, r, l = 0,
				h = (s ? s.shortYearCutoff : null) || this._defaults.shortYearCutoff,
				c = "string" != typeof h ? h : (new Date).getFullYear() % 100 + parseInt(h, 10),
				u = (s ? s.dayNamesShort : null) || this._defaults.dayNamesShort,
				d = (s ? s.dayNames : null) || this._defaults.dayNames,
				p = (s ? s.monthNamesShort : null) || this._defaults.monthNamesShort,
				f = (s ? s.monthNames : null) || this._defaults.monthNames,
				g = -1,
				m = -1,
				_ = -1,
				v = -1,
				b = !1,
				y = function (t) {
					var i = e.length > n + 1 && e.charAt(n + 1) === t;
					return i && n++, i
				},
				w = function (t) {
					var e = y(t),
						s = "@" === t ? 14 : "!" === t ? 20 : "y" === t && e ? 4 : "o" === t ? 3 : 2,
						n = "y" === t ? s : 1,
						o = RegExp("^\\d{" + n + "," + s + "}"),
						a = i.substring(l).match(o);
					if (!a) throw "Missing number at position " + l;
					return l += a[0].length, parseInt(a[0], 10)
				},
				k = function (e, s, n) {
					var o = -1,
						a = t.map(y(e) ? n : s, function (t, e) {
							return [
								[e, t]
							]
						}).sort(function (t, e) {
							return -(t[1].length - e[1].length)
						});
					if (t.each(a, function (t, e) {
							var s = e[1];
							return i.substr(l, s.length).toLowerCase() === s.toLowerCase() ? (o = e[0], l += s.length, !1) : void 0
						}), -1 !== o) return o + 1;
					throw "Unknown name at position " + l
				},
				x = function () {
					if (i.charAt(l) !== e.charAt(n)) throw "Unexpected literal at position " + l;
					l++
				};
			for (n = 0; e.length > n; n++)
				if (b) "'" !== e.charAt(n) || y("'") ? x() : b = !1;
				else switch (e.charAt(n)) {
					case "d":
						_ = w("d");
						break;
					case "D":
						k("D", u, d);
						break;
					case "o":
						v = w("o");
						break;
					case "m":
						m = w("m");
						break;
					case "M":
						m = k("M", p, f);
						break;
					case "y":
						g = w("y");
						break;
					case "@":
						r = new Date(w("@")), g = r.getFullYear(), m = r.getMonth() + 1, _ = r.getDate();
						break;
					case "!":
						r = new Date((w("!") - this._ticksTo1970) / 1e4), g = r.getFullYear(), m = r.getMonth() + 1, _ = r.getDate();
						break;
					case "'":
						y("'") ? x() : b = !0;
						break;
					default:
						x()
				}
			if (i.length > l && (a = i.substr(l), !/^\s+/.test(a))) throw "Extra/unparsed characters found in date: " + a;
			if (-1 === g ? g = (new Date).getFullYear() : 100 > g && (g += (new Date).getFullYear() - (new Date).getFullYear() % 100 + (c >= g ? 0 : -100)), v > -1)
				for (m = 1, _ = v;;) {
					if (o = this._getDaysInMonth(g, m - 1), o >= _) break;
					m++, _ -= o
				}
			if (r = this._daylightSavingAdjust(new Date(g, m - 1, _)), r.getFullYear() !== g || r.getMonth() + 1 !== m || r.getDate() !== _) throw "Invalid date";
			return r
		},
		ATOM: "yy-mm-dd",
		COOKIE: "D, dd M yy",
		ISO_8601: "yy-mm-dd",
		RFC_822: "D, d M y",
		RFC_850: "DD, dd-M-y",
		RFC_1036: "D, d M y",
		RFC_1123: "D, d M yy",
		RFC_2822: "D, d M yy",
		RSS: "D, d M y",
		TICKS: "!",
		TIMESTAMP: "@",
		W3C: "yy-mm-dd",
		_ticksTo1970: 1e7 * 60 * 60 * 24 * (718685 + Math.floor(492.5) - Math.floor(19.7) + Math.floor(4.925)),
		formatDate: function (t, e, i) {
			if (!e) return "";
			var s, n = (i ? i.dayNamesShort : null) || this._defaults.dayNamesShort,
				o = (i ? i.dayNames : null) || this._defaults.dayNames,
				a = (i ? i.monthNamesShort : null) || this._defaults.monthNamesShort,
				r = (i ? i.monthNames : null) || this._defaults.monthNames,
				l = function (e) {
					var i = t.length > s + 1 && t.charAt(s + 1) === e;
					return i && s++, i
				},
				h = function (t, e, i) {
					var s = "" + e;
					if (l(t))
						for (; i > s.length;) s = "0" + s;
					return s
				},
				c = function (t, e, i, s) {
					return l(t) ? s[e] : i[e]
				},
				u = "",
				d = !1;
			if (e)
				for (s = 0; t.length > s; s++)
					if (d) "'" !== t.charAt(s) || l("'") ? u += t.charAt(s) : d = !1;
					else switch (t.charAt(s)) {
						case "d":
							u += h("d", e.getDate(), 2);
							break;
						case "D":
							u += c("D", e.getDay(), n, o);
							break;
						case "o":
							u += h("o", Math.round((new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime() - new Date(e.getFullYear(), 0, 0).getTime()) / 864e5), 3);
							break;
						case "m":
							u += h("m", e.getMonth() + 1, 2);
							break;
						case "M":
							u += c("M", e.getMonth(), a, r);
							break;
						case "y":
							u += l("y") ? e.getFullYear() : (10 > e.getFullYear() % 100 ? "0" : "") + e.getFullYear() % 100;
							break;
						case "@":
							u += e.getTime();
							break;
						case "!":
							u += 1e4 * e.getTime() + this._ticksTo1970;
							break;
						case "'":
							l("'") ? u += "'" : d = !0;
							break;
						default:
							u += t.charAt(s)
					}
			return u
		},
		_possibleChars: function (t) {
			var e, i = "",
				s = !1,
				n = function (i) {
					var s = t.length > e + 1 && t.charAt(e + 1) === i;
					return s && e++, s
				};
			for (e = 0; t.length > e; e++)
				if (s) "'" !== t.charAt(e) || n("'") ? i += t.charAt(e) : s = !1;
				else switch (t.charAt(e)) {
					case "d":
					case "m":
					case "y":
					case "@":
						i += "0123456789";
						break;
					case "D":
					case "M":
						return null;
					case "'":
						n("'") ? i += "'" : s = !0;
						break;
					default:
						i += t.charAt(e)
				}
			return i
		},
		_get: function (t, e) {
			return void 0 !== t.settings[e] ? t.settings[e] : this._defaults[e]
		},
		_setDateFromField: function (t, e) {
			if (t.input.val() !== t.lastVal) {
				var i = this._get(t, "dateFormat"),
					s = t.lastVal = t.input ? t.input.val() : null,
					n = this._getDefaultDate(t),
					o = n,
					a = this._getFormatConfig(t);
				try {
					o = this.parseDate(i, s, a) || n
				} catch (r) {
					s = e ? "" : s
				}
				t.selectedDay = o.getDate(), t.drawMonth = t.selectedMonth = o.getMonth(), t.drawYear = t.selectedYear = o.getFullYear(), t.currentDay = s ? o.getDate() : 0, t.currentMonth = s ? o.getMonth() : 0, t.currentYear = s ? o.getFullYear() : 0, this._adjustInstDate(t)
			}
		},
		_getDefaultDate: function (t) {
			return this._restrictMinMax(t, this._determineDate(t, this._get(t, "defaultDate"), new Date))
		},
		_determineDate: function (e, i, s) {
			var n = function (t) {
					var e = new Date;
					return e.setDate(e.getDate() + t), e
				},
				o = function (i) {
					try {
						return t.datepicker.parseDate(t.datepicker._get(e, "dateFormat"), i, t.datepicker._getFormatConfig(e))
					} catch (s) {}
					for (var n = (i.toLowerCase().match(/^c/) ? t.datepicker._getDate(e) : null) || new Date, o = n.getFullYear(), a = n.getMonth(), r = n.getDate(), l = /([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g, h = l.exec(i); h;) {
						switch (h[2] || "d") {
							case "d":
							case "D":
								r += parseInt(h[1], 10);
								break;
							case "w":
							case "W":
								r += 7 * parseInt(h[1], 10);
								break;
							case "m":
							case "M":
								a += parseInt(h[1], 10), r = Math.min(r, t.datepicker._getDaysInMonth(o, a));
								break;
							case "y":
							case "Y":
								o += parseInt(h[1], 10), r = Math.min(r, t.datepicker._getDaysInMonth(o, a))
						}
						h = l.exec(i)
					}
					return new Date(o, a, r)
				},
				a = null == i || "" === i ? s : "string" == typeof i ? o(i) : "number" == typeof i ? isNaN(i) ? s : n(i) : new Date(i.getTime());
			return a = a && "Invalid Date" == "" + a ? s : a, a && (a.setHours(0), a.setMinutes(0), a.setSeconds(0), a.setMilliseconds(0)), this._daylightSavingAdjust(a)
		},
		_daylightSavingAdjust: function (t) {
			return t ? (t.setHours(t.getHours() > 12 ? t.getHours() + 2 : 0), t) : null
		},
		_setDate: function (t, e, i) {
			var s = !e,
				n = t.selectedMonth,
				o = t.selectedYear,
				a = this._restrictMinMax(t, this._determineDate(t, e, new Date));
			t.selectedDay = t.currentDay = a.getDate(), t.drawMonth = t.selectedMonth = t.currentMonth = a.getMonth(), t.drawYear = t.selectedYear = t.currentYear = a.getFullYear(), n === t.selectedMonth && o === t.selectedYear || i || this._notifyChange(t), this._adjustInstDate(t), t.input && t.input.val(s ? "" : this._formatDate(t))
		},
		_getDate: function (t) {
			var e = !t.currentYear || t.input && "" === t.input.val() ? null : this._daylightSavingAdjust(new Date(t.currentYear, t.currentMonth, t.currentDay));
			return e
		},
		_attachHandlers: function (e) {
			var i = this._get(e, "stepMonths"),
				s = "#" + e.id.replace(/\\\\/g, "\\");
			e.dpDiv.find("[data-handler]").map(function () {
				var e = {
					prev: function () {
						t.datepicker._adjustDate(s, -i, "M")
					},
					next: function () {
						t.datepicker._adjustDate(s, +i, "M")
					},
					hide: function () {
						t.datepicker._hideDatepicker()
					},
					today: function () {
						t.datepicker._gotoToday(s)
					},
					selectDay: function () {
						return t.datepicker._selectDay(s, +this.getAttribute("data-month"), +this.getAttribute("data-year"), this), !1
					},
					selectMonth: function () {
						return t.datepicker._selectMonthYear(s, this, "M"), !1
					},
					selectYear: function () {
						return t.datepicker._selectMonthYear(s, this, "Y"), !1
					}
				};
				t(this).on(this.getAttribute("data-event"), e[this.getAttribute("data-handler")])
			})
		},
		_generateHTML: function (t) {
			var e, i, s, n, o, a, r, l, h, c, u, d, p, f, g, m, _, v, b, y, w, k, x, C, D, I, P, T, M, S, H, z, O, A, N, E, W, F, L, R = new Date,
				B = this._daylightSavingAdjust(new Date(R.getFullYear(), R.getMonth(), R.getDate())),
				Y = this._get(t, "isRTL"),
				j = this._get(t, "showButtonPanel"),
				q = this._get(t, "hideIfNoPrevNext"),
				K = this._get(t, "navigationAsDateFormat"),
				U = this._getNumberOfMonths(t),
				V = this._get(t, "showCurrentAtPos"),
				X = this._get(t, "stepMonths"),
				$ = 1 !== U[0] || 1 !== U[1],
				G = this._daylightSavingAdjust(t.currentDay ? new Date(t.currentYear, t.currentMonth, t.currentDay) : new Date(9999, 9, 9)),
				Q = this._getMinMaxDate(t, "min"),
				J = this._getMinMaxDate(t, "max"),
				Z = t.drawMonth - V,
				te = t.drawYear;
			if (0 > Z && (Z += 12, te--), J)
				for (e = this._daylightSavingAdjust(new Date(J.getFullYear(), J.getMonth() - U[0] * U[1] + 1, J.getDate())), e = Q && Q > e ? Q : e; this._daylightSavingAdjust(new Date(te, Z, 1)) > e;) Z--, 0 > Z && (Z = 11, te--);
			for (t.drawMonth = Z, t.drawYear = te, i = this._get(t, "prevText"), i = K ? this.formatDate(i, this._daylightSavingAdjust(new Date(te, Z - X, 1)), this._getFormatConfig(t)) : i, s = this._canAdjustMonth(t, -1, te, Z) ? "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click' title='" + i + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "e" : "w") + "'>" + i + "</span></a>" : q ? "" : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" + i + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "e" : "w") + "'>" + i + "</span></a>", n = this._get(t, "nextText"), n = K ? this.formatDate(n, this._daylightSavingAdjust(new Date(te, Z + X, 1)), this._getFormatConfig(t)) : n, o = this._canAdjustMonth(t, 1, te, Z) ? "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click' title='" + n + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "w" : "e") + "'>" + n + "</span></a>" : q ? "" : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" + n + "'><span class='ui-icon ui-icon-circle-triangle-" + (Y ? "w" : "e") + "'>" + n + "</span></a>", a = this._get(t, "currentText"), r = this._get(t, "gotoCurrent") && t.currentDay ? G : B, a = K ? this.formatDate(a, r, this._getFormatConfig(t)) : a, l = t.inline ? "" : "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" + this._get(t, "closeText") + "</button>", h = j ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" + (Y ? l : "") + (this._isInRange(t, r) ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'>" + a + "</button>" : "") + (Y ? "" : l) + "</div>" : "", c = parseInt(this._get(t, "firstDay"), 10), c = isNaN(c) ? 0 : c, u = this._get(t, "showWeek"), d = this._get(t, "dayNames"), p = this._get(t, "dayNamesMin"), f = this._get(t, "monthNames"), g = this._get(t, "monthNamesShort"), m = this._get(t, "beforeShowDay"), _ = this._get(t, "showOtherMonths"), v = this._get(t, "selectOtherMonths"), b = this._getDefaultDate(t), y = "", k = 0; U[0] > k; k++) {
				for (x = "", this.maxRows = 4, C = 0; U[1] > C; C++) {
					if (D = this._daylightSavingAdjust(new Date(te, Z, t.selectedDay)), I = " ui-corner-all", P = "", $) {
						if (P += "<div class='ui-datepicker-group", U[1] > 1) switch (C) {
							case 0:
								P += " ui-datepicker-group-first", I = " ui-corner-" + (Y ? "right" : "left");
								break;
							case U[1] - 1:
								P += " ui-datepicker-group-last", I = " ui-corner-" + (Y ? "left" : "right");
								break;
							default:
								P += " ui-datepicker-group-middle", I = ""
						}
						P += "'>"
					}
					for (P += "<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix" + I + "'>" + (/all|left/.test(I) && 0 === k ? Y ? o : s : "") + (/all|right/.test(I) && 0 === k ? Y ? s : o : "") + this._generateMonthYearHeader(t, Z, te, Q, J, k > 0 || C > 0, f, g) + "</div><table class='ui-datepicker-calendar'><thead>" + "<tr>", T = u ? "<th class='ui-datepicker-week-col'>" + this._get(t, "weekHeader") + "</th>" : "", w = 0; 7 > w; w++) M = (w + c) % 7, T += "<th scope='col'" + ((w + c + 6) % 7 >= 5 ? " class='ui-datepicker-week-end'" : "") + ">" + "<span title='" + d[M] + "'>" + p[M] + "</span></th>";
					for (P += T + "</tr></thead><tbody>", S = this._getDaysInMonth(te, Z), te === t.selectedYear && Z === t.selectedMonth && (t.selectedDay = Math.min(t.selectedDay, S)), H = (this._getFirstDayOfMonth(te, Z) - c + 7) % 7, z = Math.ceil((H + S) / 7), O = $ ? this.maxRows > z ? this.maxRows : z : z, this.maxRows = O, A = this._daylightSavingAdjust(new Date(te, Z, 1 - H)), N = 0; O > N; N++) {
						for (P += "<tr>", E = u ? "<td class='ui-datepicker-week-col'>" + this._get(t, "calculateWeek")(A) + "</td>" : "", w = 0; 7 > w; w++) W = m ? m.apply(t.input ? t.input[0] : null, [A]) : [!0, ""], F = A.getMonth() !== Z, L = F && !v || !W[0] || Q && Q > A || J && A > J, E += "<td class='" + ((w + c + 6) % 7 >= 5 ? " ui-datepicker-week-end" : "") + (F ? " ui-datepicker-other-month" : "") + (A.getTime() === D.getTime() && Z === t.selectedMonth && t._keyEvent || b.getTime() === A.getTime() && b.getTime() === D.getTime() ? " " + this._dayOverClass : "") + (L ? " " + this._unselectableClass + " ui-state-disabled" : "") + (F && !_ ? "" : " " + W[1] + (A.getTime() === G.getTime() ? " " + this._currentClass : "") + (A.getTime() === B.getTime() ? " ui-datepicker-today" : "")) + "'" + (F && !_ || !W[2] ? "" : " title='" + W[2].replace(/'/g, "&#39;") + "'") + (L ? "" : " data-handler='selectDay' data-event='click' data-month='" + A.getMonth() + "' data-year='" + A.getFullYear() + "'") + ">" + (F && !_ ? "&#xa0;" : L ? "<span class='ui-state-default'>" + A.getDate() + "</span>" : "<a class='ui-state-default" + (A.getTime() === B.getTime() ? " ui-state-highlight" : "") + (A.getTime() === G.getTime() ? " ui-state-active" : "") + (F ? " ui-priority-secondary" : "") + "' href='#'>" + A.getDate() + "</a>") + "</td>", A.setDate(A.getDate() + 1), A = this._daylightSavingAdjust(A);
						P += E + "</tr>"
					}
					Z++, Z > 11 && (Z = 0, te++), P += "</tbody></table>" + ($ ? "</div>" + (U[0] > 0 && C === U[1] - 1 ? "<div class='ui-datepicker-row-break'></div>" : "") : ""), x += P
				}
				y += x
			}
			return y += h, t._keyEvent = !1, y
		},
		_generateMonthYearHeader: function (t, e, i, s, n, o, a, r) {
			var l, h, c, u, d, p, f, g, m = this._get(t, "changeMonth"),
				_ = this._get(t, "changeYear"),
				v = this._get(t, "showMonthAfterYear"),
				b = "<div class='ui-datepicker-title'>",
				y = "";
			if (o || !m) y += "<span class='ui-datepicker-month'>" + a[e] + "</span>";
			else {
				for (l = s && s.getFullYear() === i, h = n && n.getFullYear() === i, y += "<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>", c = 0; 12 > c; c++)(!l || c >= s.getMonth()) && (!h || n.getMonth() >= c) && (y += "<option value='" + c + "'" + (c === e ? " selected='selected'" : "") + ">" + r[c] + "</option>");
				y += "</select>"
			}
			if (v || (b += y + (!o && m && _ ? "" : "&#xa0;")), !t.yearshtml)
				if (t.yearshtml = "", o || !_) b += "<span class='ui-datepicker-year'>" + i + "</span>";
				else {
					for (u = this._get(t, "yearRange").split(":"), d = (new Date).getFullYear(), p = function (t) {
							var e = t.match(/c[+\-].*/) ? i + parseInt(t.substring(1), 10) : t.match(/[+\-].*/) ? d + parseInt(t, 10) : parseInt(t, 10);
							return isNaN(e) ? d : e
						}, f = p(u[0]), g = Math.max(f, p(u[1] || "")), f = s ? Math.max(f, s.getFullYear()) : f, g = n ? Math.min(g, n.getFullYear()) : g, t.yearshtml += "<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>"; g >= f; f++) t.yearshtml += "<option value='" + f + "'" + (f === i ? " selected='selected'" : "") + ">" + f + "</option>";
					t.yearshtml += "</select>", b += t.yearshtml, t.yearshtml = null
				} return b += this._get(t, "yearSuffix"), v && (b += (!o && m && _ ? "" : "&#xa0;") + y), b += "</div>"
		},
		_adjustInstDate: function (t, e, i) {
			var s = t.selectedYear + ("Y" === i ? e : 0),
				n = t.selectedMonth + ("M" === i ? e : 0),
				o = Math.min(t.selectedDay, this._getDaysInMonth(s, n)) + ("D" === i ? e : 0),
				a = this._restrictMinMax(t, this._daylightSavingAdjust(new Date(s, n, o)));
			t.selectedDay = a.getDate(), t.drawMonth = t.selectedMonth = a.getMonth(), t.drawYear = t.selectedYear = a.getFullYear(), ("M" === i || "Y" === i) && this._notifyChange(t)
		},
		_restrictMinMax: function (t, e) {
			var i = this._getMinMaxDate(t, "min"),
				s = this._getMinMaxDate(t, "max"),
				n = i && i > e ? i : e;
			return s && n > s ? s : n
		},
		_notifyChange: function (t) {
			var e = this._get(t, "onChangeMonthYear");
			e && e.apply(t.input ? t.input[0] : null, [t.selectedYear, t.selectedMonth + 1, t])
		},
		_getNumberOfMonths: function (t) {
			var e = this._get(t, "numberOfMonths");
			return null == e ? [1, 1] : "number" == typeof e ? [1, e] : e
		},
		_getMinMaxDate: function (t, e) {
			return this._determineDate(t, this._get(t, e + "Date"), null)
		},
		_getDaysInMonth: function (t, e) {
			return 32 - this._daylightSavingAdjust(new Date(t, e, 32)).getDate()
		},
		_getFirstDayOfMonth: function (t, e) {
			return new Date(t, e, 1).getDay()
		},
		_canAdjustMonth: function (t, e, i, s) {
			var n = this._getNumberOfMonths(t),
				o = this._daylightSavingAdjust(new Date(i, s + (0 > e ? e : n[0] * n[1]), 1));
			return 0 > e && o.setDate(this._getDaysInMonth(o.getFullYear(), o.getMonth())), this._isInRange(t, o)
		},
		_isInRange: function (t, e) {
			var i, s, n = this._getMinMaxDate(t, "min"),
				o = this._getMinMaxDate(t, "max"),
				a = null,
				r = null,
				l = this._get(t, "yearRange");
			return l && (i = l.split(":"), s = (new Date).getFullYear(), a = parseInt(i[0], 10), r = parseInt(i[1], 10), i[0].match(/[+\-].*/) && (a += s), i[1].match(/[+\-].*/) && (r += s)), (!n || e.getTime() >= n.getTime()) && (!o || e.getTime() <= o.getTime()) && (!a || e.getFullYear() >= a) && (!r || r >= e.getFullYear())
		},
		_getFormatConfig: function (t) {
			var e = this._get(t, "shortYearCutoff");
			return e = "string" != typeof e ? e : (new Date).getFullYear() % 100 + parseInt(e, 10), {
				shortYearCutoff: e,
				dayNamesShort: this._get(t, "dayNamesShort"),
				dayNames: this._get(t, "dayNames"),
				monthNamesShort: this._get(t, "monthNamesShort"),
				monthNames: this._get(t, "monthNames")
			}
		},
		_formatDate: function (t, e, i, s) {
			e || (t.currentDay = t.selectedDay, t.currentMonth = t.selectedMonth, t.currentYear = t.selectedYear);
			var n = e ? "object" == typeof e ? e : this._daylightSavingAdjust(new Date(s, i, e)) : this._daylightSavingAdjust(new Date(t.currentYear, t.currentMonth, t.currentDay));
			return this.formatDate(this._get(t, "dateFormat"), n, this._getFormatConfig(t))
		}
	}), t.fn.datepicker = function (e) {
		if (!this.length) return this;
		t.datepicker.initialized || (t(document).on("mousedown", t.datepicker._checkExternalClick), t.datepicker.initialized = !0), 0 === t("#" + t.datepicker._mainDivId).length && t("body").append(t.datepicker.dpDiv);
		var i = Array.prototype.slice.call(arguments, 1);
		return "string" != typeof e || "isDisabled" !== e && "getDate" !== e && "widget" !== e ? "option" === e && 2 === arguments.length && "string" == typeof arguments[1] ? t.datepicker["_" + e + "Datepicker"].apply(t.datepicker, [this[0]].concat(i)) : this.each(function () {
			"string" == typeof e ? t.datepicker["_" + e + "Datepicker"].apply(t.datepicker, [this].concat(i)) : t.datepicker._attachDatepicker(this, e)
		}) : t.datepicker["_" + e + "Datepicker"].apply(t.datepicker, [this[0]].concat(i))
	}, t.datepicker = new s, t.datepicker.initialized = !1, t.datepicker.uuid = (new Date).getTime(), t.datepicker.version = "1.12.1", t.datepicker, t.widget("ui.dialog", {
		version: "1.12.1",
		options: {
			appendTo: "body",
			autoOpen: !0,
			buttons: [],
			classes: {
				"ui-dialog": "ui-corner-all",
				"ui-dialog-titlebar": "ui-corner-all"
			},
			closeOnEscape: !0,
			closeText: "Close",
			draggable: !0,
			hide: null,
			height: "auto",
			maxHeight: null,
			maxWidth: null,
			minHeight: 150,
			minWidth: 150,
			modal: !1,
			position: {
				my: "center",
				at: "center",
				of: window,
				collision: "fit",
				using: function (e) {
					var i = t(this).css(e).offset().top;
					0 > i && t(this).css("top", e.top - i)
				}
			},
			resizable: !0,
			show: null,
			title: null,
			width: 300,
			beforeClose: null,
			close: null,
			drag: null,
			dragStart: null,
			dragStop: null,
			focus: null,
			open: null,
			resize: null,
			resizeStart: null,
			resizeStop: null
		},
		sizeRelatedOptions: {
			buttons: !0,
			height: !0,
			maxHeight: !0,
			maxWidth: !0,
			minHeight: !0,
			minWidth: !0,
			width: !0
		},
		resizableRelatedOptions: {
			maxHeight: !0,
			maxWidth: !0,
			minHeight: !0,
			minWidth: !0
		},
		_create: function () {
			this.originalCss = {
				display: this.element[0].style.display,
				width: this.element[0].style.width,
				minHeight: this.element[0].style.minHeight,
				maxHeight: this.element[0].style.maxHeight,
				height: this.element[0].style.height
			}, this.originalPosition = {
				parent: this.element.parent(),
				index: this.element.parent().children().index(this.element)
			}, this.originalTitle = this.element.attr("title"), null == this.options.title && null != this.originalTitle && (this.options.title = this.originalTitle), this.options.disabled && (this.options.disabled = !1), this._createWrapper(), this.element.show().removeAttr("title").appendTo(this.uiDialog), this._addClass("ui-dialog-content", "ui-widget-content"), this._createTitlebar(), this._createButtonPane(), this.options.draggable && t.fn.draggable && this._makeDraggable(), this.options.resizable && t.fn.resizable && this._makeResizable(), this._isOpen = !1, this._trackFocus()
		},
		_init: function () {
			this.options.autoOpen && this.open()
		},
		_appendTo: function () {
			var e = this.options.appendTo;
			return e && (e.jquery || e.nodeType) ? t(e) : this.document.find(e || "body").eq(0)
		},
		_destroy: function () {
			var t, e = this.originalPosition;
			this._untrackInstance(), this._destroyOverlay(), this.element.removeUniqueId().css(this.originalCss).detach(), this.uiDialog.remove(), this.originalTitle && this.element.attr("title", this.originalTitle), t = e.parent.children().eq(e.index), t.length && t[0] !== this.element[0] ? t.before(this.element) : e.parent.append(this.element)
		},
		widget: function () {
			return this.uiDialog
		},
		disable: t.noop,
		enable: t.noop,
		close: function (e) {
			var i = this;
			this._isOpen && this._trigger("beforeClose", e) !== !1 && (this._isOpen = !1, this._focusedElement = null, this._destroyOverlay(), this._untrackInstance(), this.opener.filter(":focusable").trigger("focus").length || t.ui.safeBlur(t.ui.safeActiveElement(this.document[0])), this._hide(this.uiDialog, this.options.hide, function () {
				i._trigger("close", e)
			}))
		},
		isOpen: function () {
			return this._isOpen
		},
		moveToTop: function () {
			this._moveToTop()
		},
		_moveToTop: function (e, i) {
			var s = !1,
				n = this.uiDialog.siblings(".ui-front:visible").map(function () {
					return +t(this).css("z-index")
				}).get(),
				o = Math.max.apply(null, n);
			return o >= +this.uiDialog.css("z-index") && (this.uiDialog.css("z-index", o + 1), s = !0), s && !i && this._trigger("focus", e), s
		},
		open: function () {
			var e = this;
			return this._isOpen ? (this._moveToTop() && this._focusTabbable(), void 0) : (this._isOpen = !0, this.opener = t(t.ui.safeActiveElement(this.document[0])), this._size(), this._position(), this._createOverlay(), this._moveToTop(null, !0), this.overlay && this.overlay.css("z-index", this.uiDialog.css("z-index") - 1), this._show(this.uiDialog, this.options.show, function () {
				e._focusTabbable(), e._trigger("focus")
			}), this._makeFocusTarget(), this._trigger("open"), void 0)
		},
		_focusTabbable: function () {
			var t = this._focusedElement;
			t || (t = this.element.find("[autofocus]")), t.length || (t = this.element.find(":tabbable")), t.length || (t = this.uiDialogButtonPane.find(":tabbable")), t.length || (t = this.uiDialogTitlebarClose.filter(":tabbable")), t.length || (t = this.uiDialog), t.eq(0).trigger("focus")
		},
		_keepFocus: function (e) {
			function i() {
				var e = t.ui.safeActiveElement(this.document[0]),
					i = this.uiDialog[0] === e || t.contains(this.uiDialog[0], e);
				i || this._focusTabbable()
			}
			e.preventDefault(), i.call(this), this._delay(i)
		},
		_createWrapper: function () {
			this.uiDialog = t("<div>").hide().attr({
				tabIndex: -1,
				role: "dialog"
			}).appendTo(this._appendTo()), this._addClass(this.uiDialog, "ui-dialog", "ui-widget ui-widget-content ui-front"), this._on(this.uiDialog, {
				keydown: function (e) {
					if (this.options.closeOnEscape && !e.isDefaultPrevented() && e.keyCode && e.keyCode === t.ui.keyCode.ESCAPE) return e.preventDefault(), this.close(e), void 0;
					if (e.keyCode === t.ui.keyCode.TAB && !e.isDefaultPrevented()) {
						var i = this.uiDialog.find(":tabbable"),
							s = i.filter(":first"),
							n = i.filter(":last");
						e.target !== n[0] && e.target !== this.uiDialog[0] || e.shiftKey ? e.target !== s[0] && e.target !== this.uiDialog[0] || !e.shiftKey || (this._delay(function () {
							n.trigger("focus")
						}), e.preventDefault()) : (this._delay(function () {
							s.trigger("focus")
						}), e.preventDefault())
					}
				},
				mousedown: function (t) {
					this._moveToTop(t) && this._focusTabbable()
				}
			}), this.element.find("[aria-describedby]").length || this.uiDialog.attr({
				"aria-describedby": this.element.uniqueId().attr("id")
			})
		},
		_createTitlebar: function () {
			var e;
			this.uiDialogTitlebar = t("<div>"), this._addClass(this.uiDialogTitlebar, "ui-dialog-titlebar", "ui-widget-header ui-helper-clearfix"), this._on(this.uiDialogTitlebar, {
				mousedown: function (e) {
					t(e.target).closest(".ui-dialog-titlebar-close") || this.uiDialog.trigger("focus")
				}
			}), this.uiDialogTitlebarClose = t("<button type='button'></button>").button({
				label: t("<a>").text(this.options.closeText).html(),
				icon: "ui-icon-closethick",
				showLabel: !1
			}).appendTo(this.uiDialogTitlebar), this._addClass(this.uiDialogTitlebarClose, "ui-dialog-titlebar-close"), this._on(this.uiDialogTitlebarClose, {
				click: function (t) {
					t.preventDefault(), this.close(t)
				}
			}), e = t("<span>").uniqueId().prependTo(this.uiDialogTitlebar), this._addClass(e, "ui-dialog-title"), this._title(e), this.uiDialogTitlebar.prependTo(this.uiDialog), this.uiDialog.attr({
				"aria-labelledby": e.attr("id")
			})
		},
		_title: function (t) {
			this.options.title ? t.text(this.options.title) : t.html("&#160;")
		},
		_createButtonPane: function () {
			this.uiDialogButtonPane = t("<div>"), this._addClass(this.uiDialogButtonPane, "ui-dialog-buttonpane", "ui-widget-content ui-helper-clearfix"), this.uiButtonSet = t("<div>").appendTo(this.uiDialogButtonPane), this._addClass(this.uiButtonSet, "ui-dialog-buttonset"), this._createButtons()
		},
		_createButtons: function () {
			var e = this,
				i = this.options.buttons;
			return this.uiDialogButtonPane.remove(), this.uiButtonSet.empty(), t.isEmptyObject(i) || t.isArray(i) && !i.length ? (this._removeClass(this.uiDialog, "ui-dialog-buttons"), void 0) : (t.each(i, function (i, s) {
				var n, o;
				s = t.isFunction(s) ? {
					click: s,
					text: i
				} : s, s = t.extend({
					type: "button"
				}, s), n = s.click, o = {
					icon: s.icon,
					iconPosition: s.iconPosition,
					showLabel: s.showLabel,
					icons: s.icons,
					text: s.text
				}, delete s.click, delete s.icon, delete s.iconPosition, delete s.showLabel, delete s.icons, "boolean" == typeof s.text && delete s.text, t("<button></button>", s).button(o).appendTo(e.uiButtonSet).on("click", function () {
					n.apply(e.element[0], arguments)
				})
			}), this._addClass(this.uiDialog, "ui-dialog-buttons"), this.uiDialogButtonPane.appendTo(this.uiDialog), void 0)
		},
		_makeDraggable: function () {
			function e(t) {
				return {
					position: t.position,
					offset: t.offset
				}
			}
			var i = this,
				s = this.options;
			this.uiDialog.draggable({
				cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
				handle: ".ui-dialog-titlebar",
				containment: "document",
				start: function (s, n) {
					i._addClass(t(this), "ui-dialog-dragging"), i._blockFrames(), i._trigger("dragStart", s, e(n))
				},
				drag: function (t, s) {
					i._trigger("drag", t, e(s))
				},
				stop: function (n, o) {
					var a = o.offset.left - i.document.scrollLeft(),
						r = o.offset.top - i.document.scrollTop();
					s.position = {
						my: "left top",
						at: "left" + (a >= 0 ? "+" : "") + a + " " + "top" + (r >= 0 ? "+" : "") + r,
						of: i.window
					}, i._removeClass(t(this), "ui-dialog-dragging"), i._unblockFrames(), i._trigger("dragStop", n, e(o))
				}
			})
		},
		_makeResizable: function () {
			function e(t) {
				return {
					originalPosition: t.originalPosition,
					originalSize: t.originalSize,
					position: t.position,
					size: t.size
				}
			}
			var i = this,
				s = this.options,
				n = s.resizable,
				o = this.uiDialog.css("position"),
				a = "string" == typeof n ? n : "n,e,s,w,se,sw,ne,nw";
			this.uiDialog.resizable({
				cancel: ".ui-dialog-content",
				containment: "document",
				alsoResize: this.element,
				maxWidth: s.maxWidth,
				maxHeight: s.maxHeight,
				minWidth: s.minWidth,
				minHeight: this._minHeight(),
				handles: a,
				start: function (s, n) {
					i._addClass(t(this), "ui-dialog-resizing"), i._blockFrames(), i._trigger("resizeStart", s, e(n))
				},
				resize: function (t, s) {
					i._trigger("resize", t, e(s))
				},
				stop: function (n, o) {
					var a = i.uiDialog.offset(),
						r = a.left - i.document.scrollLeft(),
						l = a.top - i.document.scrollTop();
					s.height = i.uiDialog.height(), s.width = i.uiDialog.width(), s.position = {
						my: "left top",
						at: "left" + (r >= 0 ? "+" : "") + r + " " + "top" + (l >= 0 ? "+" : "") + l,
						of: i.window
					}, i._removeClass(t(this), "ui-dialog-resizing"), i._unblockFrames(), i._trigger("resizeStop", n, e(o))
				}
			}).css("position", o)
		},
		_trackFocus: function () {
			this._on(this.widget(), {
				focusin: function (e) {
					this._makeFocusTarget(), this._focusedElement = t(e.target)
				}
			})
		},
		_makeFocusTarget: function () {
			this._untrackInstance(), this._trackingInstances().unshift(this)
		},
		_untrackInstance: function () {
			var e = this._trackingInstances(),
				i = t.inArray(this, e); - 1 !== i && e.splice(i, 1)
		},
		_trackingInstances: function () {
			var t = this.document.data("ui-dialog-instances");
			return t || (t = [], this.document.data("ui-dialog-instances", t)), t
		},
		_minHeight: function () {
			var t = this.options;
			return "auto" === t.height ? t.minHeight : Math.min(t.minHeight, t.height)
		},
		_position: function () {
			var t = this.uiDialog.is(":visible");
			t || this.uiDialog.show(), this.uiDialog.position(this.options.position), t || this.uiDialog.hide()
		},
		_setOptions: function (e) {
			var i = this,
				s = !1,
				n = {};
			t.each(e, function (t, e) {
				i._setOption(t, e), t in i.sizeRelatedOptions && (s = !0), t in i.resizableRelatedOptions && (n[t] = e)
			}), s && (this._size(), this._position()), this.uiDialog.is(":data(ui-resizable)") && this.uiDialog.resizable("option", n)
		},
		_setOption: function (e, i) {
			var s, n, o = this.uiDialog;
			"disabled" !== e && (this._super(e, i), "appendTo" === e && this.uiDialog.appendTo(this._appendTo()), "buttons" === e && this._createButtons(), "closeText" === e && this.uiDialogTitlebarClose.button({
				label: t("<a>").text("" + this.options.closeText).html()
			}), "draggable" === e && (s = o.is(":data(ui-draggable)"), s && !i && o.draggable("destroy"), !s && i && this._makeDraggable()), "position" === e && this._position(), "resizable" === e && (n = o.is(":data(ui-resizable)"), n && !i && o.resizable("destroy"), n && "string" == typeof i && o.resizable("option", "handles", i), n || i === !1 || this._makeResizable()), "title" === e && this._title(this.uiDialogTitlebar.find(".ui-dialog-title")))
		},
		_size: function () {
			var t, e, i, s = this.options;
			this.element.show().css({
				width: "auto",
				minHeight: 0,
				maxHeight: "none",
				height: 0
			}), s.minWidth > s.width && (s.width = s.minWidth), t = this.uiDialog.css({
				height: "auto",
				width: s.width
			}).outerHeight(), e = Math.max(0, s.minHeight - t), i = "number" == typeof s.maxHeight ? Math.max(0, s.maxHeight - t) : "none", "auto" === s.height ? this.element.css({
				minHeight: e,
				maxHeight: i,
				height: "auto"
			}) : this.element.height(Math.max(0, s.height - t)), this.uiDialog.is(":data(ui-resizable)") && this.uiDialog.resizable("option", "minHeight", this._minHeight())
		},
		_blockFrames: function () {
			this.iframeBlocks = this.document.find("iframe").map(function () {
				var e = t(this);
				return t("<div>").css({
					position: "absolute",
					width: e.outerWidth(),
					height: e.outerHeight()
				}).appendTo(e.parent()).offset(e.offset())[0]
			})
		},
		_unblockFrames: function () {
			this.iframeBlocks && (this.iframeBlocks.remove(), delete this.iframeBlocks)
		},
		_allowInteraction: function (e) {
			return t(e.target).closest(".ui-dialog").length ? !0 : !!t(e.target).closest(".ui-datepicker").length
		},
		_createOverlay: function () {
			if (this.options.modal) {
				var e = !0;
				this._delay(function () {
					e = !1
				}), this.document.data("ui-dialog-overlays") || this._on(this.document, {
					focusin: function (t) {
						e || this._allowInteraction(t) || (t.preventDefault(), this._trackingInstances()[0]._focusTabbable())
					}
				}), this.overlay = t("<div>").appendTo(this._appendTo()), this._addClass(this.overlay, null, "ui-widget-overlay ui-front"), this._on(this.overlay, {
					mousedown: "_keepFocus"
				}), this.document.data("ui-dialog-overlays", (this.document.data("ui-dialog-overlays") || 0) + 1)
			}
		},
		_destroyOverlay: function () {
			if (this.options.modal && this.overlay) {
				var t = this.document.data("ui-dialog-overlays") - 1;
				t ? this.document.data("ui-dialog-overlays", t) : (this._off(this.document, "focusin"), this.document.removeData("ui-dialog-overlays")), this.overlay.remove(), this.overlay = null
			}
		}
	}), t.uiBackCompat !== !1 && t.widget("ui.dialog", t.ui.dialog, {
		options: {
			dialogClass: ""
		},
		_createWrapper: function () {
			this._super(), this.uiDialog.addClass(this.options.dialogClass)
		},
		_setOption: function (t, e) {
			"dialogClass" === t && this.uiDialog.removeClass(this.options.dialogClass).addClass(e), this._superApply(arguments)
		}
	}), t.ui.dialog, t.widget("ui.progressbar", {
		version: "1.12.1",
		options: {
			classes: {
				"ui-progressbar": "ui-corner-all",
				"ui-progressbar-value": "ui-corner-left",
				"ui-progressbar-complete": "ui-corner-right"
			},
			max: 100,
			value: 0,
			change: null,
			complete: null
		},
		min: 0,
		_create: function () {
			this.oldValue = this.options.value = this._constrainedValue(), this.element.attr({
				role: "progressbar",
				"aria-valuemin": this.min
			}), this._addClass("ui-progressbar", "ui-widget ui-widget-content"), this.valueDiv = t("<div>").appendTo(this.element), this._addClass(this.valueDiv, "ui-progressbar-value", "ui-widget-header"), this._refreshValue()
		},
		_destroy: function () {
			this.element.removeAttr("role aria-valuemin aria-valuemax aria-valuenow"), this.valueDiv.remove()
		},
		value: function (t) {
			return void 0 === t ? this.options.value : (this.options.value = this._constrainedValue(t), this._refreshValue(), void 0)
		},
		_constrainedValue: function (t) {
			return void 0 === t && (t = this.options.value), this.indeterminate = t === !1, "number" != typeof t && (t = 0), this.indeterminate ? !1 : Math.min(this.options.max, Math.max(this.min, t))
		},
		_setOptions: function (t) {
			var e = t.value;
			delete t.value, this._super(t), this.options.value = this._constrainedValue(e), this._refreshValue()
		},
		_setOption: function (t, e) {
			"max" === t && (e = Math.max(this.min, e)), this._super(t, e)
		},
		_setOptionDisabled: function (t) {
			this._super(t), this.element.attr("aria-disabled", t), this._toggleClass(null, "ui-state-disabled", !!t)
		},
		_percentage: function () {
			return this.indeterminate ? 100 : 100 * (this.options.value - this.min) / (this.options.max - this.min)
		},
		_refreshValue: function () {
			var e = this.options.value,
				i = this._percentage();
			this.valueDiv.toggle(this.indeterminate || e > this.min).width(i.toFixed(0) + "%"), this._toggleClass(this.valueDiv, "ui-progressbar-complete", null, e === this.options.max)._toggleClass("ui-progressbar-indeterminate", null, this.indeterminate), this.indeterminate ? (this.element.removeAttr("aria-valuenow"), this.overlayDiv || (this.overlayDiv = t("<div>").appendTo(this.valueDiv), this._addClass(this.overlayDiv, "ui-progressbar-overlay"))) : (this.element.attr({
				"aria-valuemax": this.options.max,
				"aria-valuenow": e
			}), this.overlayDiv && (this.overlayDiv.remove(), this.overlayDiv = null)), this.oldValue !== e && (this.oldValue = e, this._trigger("change")), e === this.options.max && this._trigger("complete")
		}
	}), t.widget("ui.selectmenu", [t.ui.formResetMixin, {
		version: "1.12.1",
		defaultElement: "<select>",
		options: {
			appendTo: null,
			classes: {
				"ui-selectmenu-button-open": "ui-corner-top",
				"ui-selectmenu-button-closed": "ui-corner-all"
			},
			disabled: null,
			icons: {
				button: "ui-icon-triangle-1-s"
			},
			position: {
				my: "left top",
				at: "left bottom",
				collision: "none"
			},
			width: !1,
			change: null,
			close: null,
			focus: null,
			open: null,
			select: null
		},
		_create: function () {
			var e = this.element.uniqueId().attr("id");
			this.ids = {
				element: e,
				button: e + "-button",
				menu: e + "-menu"
			}, this._drawButton(), this._drawMenu(), this._bindFormResetHandler(), this._rendered = !1, this.menuItems = t()
		},
		_drawButton: function () {
			var e, i = this,
				s = this._parseOption(this.element.find("option:selected"), this.element[0].selectedIndex);
			this.labels = this.element.labels().attr("for", this.ids.button), this._on(this.labels, {
				click: function (t) {
					this.button.focus(), t.preventDefault()
				}
			}), this.element.hide(), this.button = t("<span>", {
				tabindex: this.options.disabled ? -1 : 0,
				id: this.ids.button,
				role: "combobox",
				"aria-expanded": "false",
				"aria-autocomplete": "list",
				"aria-owns": this.ids.menu,
				"aria-haspopup": "true",
				title: this.element.attr("title")
			}).insertAfter(this.element), this._addClass(this.button, "ui-selectmenu-button ui-selectmenu-button-closed", "ui-button ui-widget"), e = t("<span>").appendTo(this.button), this._addClass(e, "ui-selectmenu-icon", "ui-icon " + this.options.icons.button), this.buttonItem = this._renderButtonItem(s).appendTo(this.button), this.options.width !== !1 && this._resizeButton(), this._on(this.button, this._buttonEvents), this.button.one("focusin", function () {
				i._rendered || i._refreshMenu()
			})
		},
		_drawMenu: function () {
			var e = this;
			this.menu = t("<ul>", {
				"aria-hidden": "true",
				"aria-labelledby": this.ids.button,
				id: this.ids.menu
			}), this.menuWrap = t("<div>").append(this.menu), this._addClass(this.menuWrap, "ui-selectmenu-menu", "ui-front"), this.menuWrap.appendTo(this._appendTo()), this.menuInstance = this.menu.menu({
				classes: {
					"ui-menu": "ui-corner-bottom"
				},
				role: "listbox",
				select: function (t, i) {
					t.preventDefault(), e._setSelection(), e._select(i.item.data("ui-selectmenu-item"), t)
				},
				focus: function (t, i) {
					var s = i.item.data("ui-selectmenu-item");
					null != e.focusIndex && s.index !== e.focusIndex && (e._trigger("focus", t, {
						item: s
					}), e.isOpen || e._select(s, t)), e.focusIndex = s.index, e.button.attr("aria-activedescendant", e.menuItems.eq(s.index).attr("id"))
				}
			}).menu("instance"), this.menuInstance._off(this.menu, "mouseleave"), this.menuInstance._closeOnDocumentClick = function () {
				return !1
			}, this.menuInstance._isDivider = function () {
				return !1
			}
		},
		refresh: function () {
			this._refreshMenu(), this.buttonItem.replaceWith(this.buttonItem = this._renderButtonItem(this._getSelectedItem().data("ui-selectmenu-item") || {})), null === this.options.width && this._resizeButton()
		},
		_refreshMenu: function () {
			var t, e = this.element.find("option");
			this.menu.empty(), this._parseOptions(e), this._renderMenu(this.menu, this.items), this.menuInstance.refresh(), this.menuItems = this.menu.find("li").not(".ui-selectmenu-optgroup").find(".ui-menu-item-wrapper"), this._rendered = !0, e.length && (t = this._getSelectedItem(), this.menuInstance.focus(null, t), this._setAria(t.data("ui-selectmenu-item")), this._setOption("disabled", this.element.prop("disabled")))
		},
		open: function (t) {
			this.options.disabled || (this._rendered ? (this._removeClass(this.menu.find(".ui-state-active"), null, "ui-state-active"), this.menuInstance.focus(null, this._getSelectedItem())) : this._refreshMenu(), this.menuItems.length && (this.isOpen = !0, this._toggleAttr(), this._resizeMenu(), this._position(), this._on(this.document, this._documentClick), this._trigger("open", t)))
		},
		_position: function () {
			this.menuWrap.position(t.extend({
				of: this.button
			}, this.options.position))
		},
		close: function (t) {
			this.isOpen && (this.isOpen = !1, this._toggleAttr(), this.range = null, this._off(this.document), this._trigger("close", t))
		},
		widget: function () {
			return this.button
		},
		menuWidget: function () {
			return this.menu
		},
		_renderButtonItem: function (e) {
			var i = t("<span>");
			return this._setText(i, e.label), this._addClass(i, "ui-selectmenu-text"), i
		},
		_renderMenu: function (e, i) {
			var s = this,
				n = "";
			t.each(i, function (i, o) {
				var a;
				o.optgroup !== n && (a = t("<li>", {
					text: o.optgroup
				}), s._addClass(a, "ui-selectmenu-optgroup", "ui-menu-divider" + (o.element.parent("optgroup").prop("disabled") ? " ui-state-disabled" : "")), a.appendTo(e), n = o.optgroup), s._renderItemData(e, o)
			})
		},
		_renderItemData: function (t, e) {
			return this._renderItem(t, e).data("ui-selectmenu-item", e)
		},
		_renderItem: function (e, i) {
			var s = t("<li>"),
				n = t("<div>", {
					title: i.element.attr("title")
				});
			return i.disabled && this._addClass(s, null, "ui-state-disabled"), this._setText(n, i.label), s.append(n).appendTo(e)
		},
		_setText: function (t, e) {
			e ? t.text(e) : t.html("&#160;")
		},
		_move: function (t, e) {
			var i, s, n = ".ui-menu-item";
			this.isOpen ? i = this.menuItems.eq(this.focusIndex).parent("li") : (i = this.menuItems.eq(this.element[0].selectedIndex).parent("li"), n += ":not(.ui-state-disabled)"), s = "first" === t || "last" === t ? i["first" === t ? "prevAll" : "nextAll"](n).eq(-1) : i[t + "All"](n).eq(0), s.length && this.menuInstance.focus(e, s)
		},
		_getSelectedItem: function () {
			return this.menuItems.eq(this.element[0].selectedIndex).parent("li")
		},
		_toggle: function (t) {
			this[this.isOpen ? "close" : "open"](t)
		},
		_setSelection: function () {
			var t;
			this.range && (window.getSelection ? (t = window.getSelection(), t.removeAllRanges(), t.addRange(this.range)) : this.range.select(), this.button.focus())
		},
		_documentClick: {
			mousedown: function (e) {
				this.isOpen && (t(e.target).closest(".ui-selectmenu-menu, #" + t.ui.escapeSelector(this.ids.button)).length || this.close(e))
			}
		},
		_buttonEvents: {
			mousedown: function () {
				var t;
				window.getSelection ? (t = window.getSelection(), t.rangeCount && (this.range = t.getRangeAt(0))) : this.range = document.selection.createRange()
			},
			click: function (t) {
				this._setSelection(), this._toggle(t)
			},
			keydown: function (e) {
				var i = !0;
				switch (e.keyCode) {
					case t.ui.keyCode.TAB:
					case t.ui.keyCode.ESCAPE:
						this.close(e), i = !1;
						break;
					case t.ui.keyCode.ENTER:
						this.isOpen && this._selectFocusedItem(e);
						break;
					case t.ui.keyCode.UP:
						e.altKey ? this._toggle(e) : this._move("prev", e);
						break;
					case t.ui.keyCode.DOWN:
						e.altKey ? this._toggle(e) : this._move("next", e);
						break;
					case t.ui.keyCode.SPACE:
						this.isOpen ? this._selectFocusedItem(e) : this._toggle(e);
						break;
					case t.ui.keyCode.LEFT:
						this._move("prev", e);
						break;
					case t.ui.keyCode.RIGHT:
						this._move("next", e);
						break;
					case t.ui.keyCode.HOME:
					case t.ui.keyCode.PAGE_UP:
						this._move("first", e);
						break;
					case t.ui.keyCode.END:
					case t.ui.keyCode.PAGE_DOWN:
						this._move("last", e);
						break;
					default:
						this.menu.trigger(e), i = !1
				}
				i && e.preventDefault()
			}
		},
		_selectFocusedItem: function (t) {
			var e = this.menuItems.eq(this.focusIndex).parent("li");
			e.hasClass("ui-state-disabled") || this._select(e.data("ui-selectmenu-item"), t)
		},
		_select: function (t, e) {
			var i = this.element[0].selectedIndex;
			this.element[0].selectedIndex = t.index, this.buttonItem.replaceWith(this.buttonItem = this._renderButtonItem(t)), this._setAria(t), this._trigger("select", e, {
				item: t
			}), t.index !== i && this._trigger("change", e, {
				item: t
			}), this.close(e)
		},
		_setAria: function (t) {
			var e = this.menuItems.eq(t.index).attr("id");
			this.button.attr({
				"aria-labelledby": e,
				"aria-activedescendant": e
			}), this.menu.attr("aria-activedescendant", e)
		},
		_setOption: function (t, e) {
			if ("icons" === t) {
				var i = this.button.find("span.ui-icon");
				this._removeClass(i, null, this.options.icons.button)._addClass(i, null, e.button)
			}
			this._super(t, e), "appendTo" === t && this.menuWrap.appendTo(this._appendTo()), "width" === t && this._resizeButton()
		},
		_setOptionDisabled: function (t) {
			this._super(t), this.menuInstance.option("disabled", t), this.button.attr("aria-disabled", t), this._toggleClass(this.button, null, "ui-state-disabled", t), this.element.prop("disabled", t), t ? (this.button.attr("tabindex", -1), this.close()) : this.button.attr("tabindex", 0)
		},
		_appendTo: function () {
			var e = this.options.appendTo;
			return e && (e = e.jquery || e.nodeType ? t(e) : this.document.find(e).eq(0)), e && e[0] || (e = this.element.closest(".ui-front, dialog")), e.length || (e = this.document[0].body), e
		},
		_toggleAttr: function () {
			this.button.attr("aria-expanded", this.isOpen), this._removeClass(this.button, "ui-selectmenu-button-" + (this.isOpen ? "closed" : "open"))._addClass(this.button, "ui-selectmenu-button-" + (this.isOpen ? "open" : "closed"))._toggleClass(this.menuWrap, "ui-selectmenu-open", null, this.isOpen), this.menu.attr("aria-hidden", !this.isOpen)
		},
		_resizeButton: function () {
			var t = this.options.width;
			return t === !1 ? (this.button.css("width", ""), void 0) : (null === t && (t = this.element.show().outerWidth(), this.element.hide()), this.button.outerWidth(t), void 0)
		},
		_resizeMenu: function () {
			this.menu.outerWidth(Math.max(this.button.outerWidth(), this.menu.width("").outerWidth() + 1))
		},
		_getCreateOptions: function () {
			var t = this._super();
			return t.disabled = this.element.prop("disabled"), t
		},
		_parseOptions: function (e) {
			var i = this,
				s = [];
			e.each(function (e, n) {
				s.push(i._parseOption(t(n), e))
			}), this.items = s
		},
		_parseOption: function (t, e) {
			var i = t.parent("optgroup");
			return {
				element: t,
				index: e,
				value: t.val(),
				label: t.text(),
				optgroup: i.attr("label") || "",
				disabled: i.prop("disabled") || t.prop("disabled")
			}
		},
		_destroy: function () {
			this._unbindFormResetHandler(), this.menuWrap.remove(), this.button.remove(), this.element.show(), this.element.removeUniqueId(), this.labels.attr("for", this.ids.element)
		}
	}]), t.widget("ui.slider", t.ui.mouse, {
		version: "1.12.1",
		widgetEventPrefix: "slide",
		options: {
			animate: !1,
			classes: {
				"ui-slider": "ui-corner-all",
				"ui-slider-handle": "ui-corner-all",
				"ui-slider-range": "ui-corner-all ui-widget-header"
			},
			distance: 0,
			max: 100,
			min: 0,
			orientation: "horizontal",
			range: !1,
			step: 1,
			value: 0,
			values: null,
			change: null,
			slide: null,
			start: null,
			stop: null
		},
		numPages: 5,
		_create: function () {
			this._keySliding = !1, this._mouseSliding = !1, this._animateOff = !0, this._handleIndex = null, this._detectOrientation(), this._mouseInit(), this._calculateNewMax(), this._addClass("ui-slider ui-slider-" + this.orientation, "ui-widget ui-widget-content"), this._refresh(), this._animateOff = !1
		},
		_refresh: function () {
			this._createRange(), this._createHandles(), this._setupEvents(), this._refreshValue()
		},
		_createHandles: function () {
			var e, i, s = this.options,
				n = this.element.find(".ui-slider-handle"),
				o = "<span tabindex='0'></span>",
				a = [];
			for (i = s.values && s.values.length || 1, n.length > i && (n.slice(i).remove(), n = n.slice(0, i)), e = n.length; i > e; e++) a.push(o);
			this.handles = n.add(t(a.join("")).appendTo(this.element)), this._addClass(this.handles, "ui-slider-handle", "ui-state-default"), this.handle = this.handles.eq(0), this.handles.each(function (e) {
				t(this).data("ui-slider-handle-index", e).attr("tabIndex", 0)
			})
		},
		_createRange: function () {
			var e = this.options;
			e.range ? (e.range === !0 && (e.values ? e.values.length && 2 !== e.values.length ? e.values = [e.values[0], e.values[0]] : t.isArray(e.values) && (e.values = e.values.slice(0)) : e.values = [this._valueMin(), this._valueMin()]), this.range && this.range.length ? (this._removeClass(this.range, "ui-slider-range-min ui-slider-range-max"), this.range.css({
				left: "",
				bottom: ""
			})) : (this.range = t("<div>").appendTo(this.element), this._addClass(this.range, "ui-slider-range")), ("min" === e.range || "max" === e.range) && this._addClass(this.range, "ui-slider-range-" + e.range)) : (this.range && this.range.remove(), this.range = null)
		},
		_setupEvents: function () {
			this._off(this.handles), this._on(this.handles, this._handleEvents), this._hoverable(this.handles), this._focusable(this.handles)
		},
		_destroy: function () {
			this.handles.remove(), this.range && this.range.remove(), this._mouseDestroy()
		},
		_mouseCapture: function (e) {
			var i, s, n, o, a, r, l, h, c = this,
				u = this.options;
			return u.disabled ? !1 : (this.elementSize = {
				width: this.element.outerWidth(),
				height: this.element.outerHeight()
			}, this.elementOffset = this.element.offset(), i = {
				x: e.pageX,
				y: e.pageY
			}, s = this._normValueFromMouse(i), n = this._valueMax() - this._valueMin() + 1, this.handles.each(function (e) {
				var i = Math.abs(s - c.values(e));
				(n > i || n === i && (e === c._lastChangedValue || c.values(e) === u.min)) && (n = i, o = t(this), a = e)
			}), r = this._start(e, a), r === !1 ? !1 : (this._mouseSliding = !0, this._handleIndex = a, this._addClass(o, null, "ui-state-active"), o.trigger("focus"), l = o.offset(), h = !t(e.target).parents().addBack().is(".ui-slider-handle"), this._clickOffset = h ? {
				left: 0,
				top: 0
			} : {
				left: e.pageX - l.left - o.width() / 2,
				top: e.pageY - l.top - o.height() / 2 - (parseInt(o.css("borderTopWidth"), 10) || 0) - (parseInt(o.css("borderBottomWidth"), 10) || 0) + (parseInt(o.css("marginTop"), 10) || 0)
			}, this.handles.hasClass("ui-state-hover") || this._slide(e, a, s), this._animateOff = !0, !0))
		},
		_mouseStart: function () {
			return !0
		},
		_mouseDrag: function (t) {
			var e = {
					x: t.pageX,
					y: t.pageY
				},
				i = this._normValueFromMouse(e);
			return this._slide(t, this._handleIndex, i), !1
		},
		_mouseStop: function (t) {
			return this._removeClass(this.handles, null, "ui-state-active"), this._mouseSliding = !1, this._stop(t, this._handleIndex), this._change(t, this._handleIndex), this._handleIndex = null, this._clickOffset = null, this._animateOff = !1, !1
		},
		_detectOrientation: function () {
			this.orientation = "vertical" === this.options.orientation ? "vertical" : "horizontal"
		},
		_normValueFromMouse: function (t) {
			var e, i, s, n, o;
			return "horizontal" === this.orientation ? (e = this.elementSize.width, i = t.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0)) : (e = this.elementSize.height, i = t.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0)), s = i / e, s > 1 && (s = 1), 0 > s && (s = 0), "vertical" === this.orientation && (s = 1 - s), n = this._valueMax() - this._valueMin(), o = this._valueMin() + s * n, this._trimAlignValue(o)
		},
		_uiHash: function (t, e, i) {
			var s = {
				handle: this.handles[t],
				handleIndex: t,
				value: void 0 !== e ? e : this.value()
			};
			return this._hasMultipleValues() && (s.value = void 0 !== e ? e : this.values(t), s.values = i || this.values()), s
		},
		_hasMultipleValues: function () {
			return this.options.values && this.options.values.length
		},
		_start: function (t, e) {
			return this._trigger("start", t, this._uiHash(e))
		},
		_slide: function (t, e, i) {
			var s, n, o = this.value(),
				a = this.values();
			this._hasMultipleValues() && (n = this.values(e ? 0 : 1), o = this.values(e), 2 === this.options.values.length && this.options.range === !0 && (i = 0 === e ? Math.min(n, i) : Math.max(n, i)), a[e] = i), i !== o && (s = this._trigger("slide", t, this._uiHash(e, i, a)), s !== !1 && (this._hasMultipleValues() ? this.values(e, i) : this.value(i)))
		},
		_stop: function (t, e) {
			this._trigger("stop", t, this._uiHash(e))
		},
		_change: function (t, e) {
			this._keySliding || this._mouseSliding || (this._lastChangedValue = e, this._trigger("change", t, this._uiHash(e)))
		},
		value: function (t) {
			return arguments.length ? (this.options.value = this._trimAlignValue(t), this._refreshValue(), this._change(null, 0), void 0) : this._value()
		},
		values: function (e, i) {
			var s, n, o;
			if (arguments.length > 1) return this.options.values[e] = this._trimAlignValue(i), this._refreshValue(), this._change(null, e), void 0;
			if (!arguments.length) return this._values();
			if (!t.isArray(arguments[0])) return this._hasMultipleValues() ? this._values(e) : this.value();
			for (s = this.options.values, n = arguments[0], o = 0; s.length > o; o += 1) s[o] = this._trimAlignValue(n[o]), this._change(null, o);
			this._refreshValue()
		},
		_setOption: function (e, i) {
			var s, n = 0;
			switch ("range" === e && this.options.range === !0 && ("min" === i ? (this.options.value = this._values(0), this.options.values = null) : "max" === i && (this.options.value = this._values(this.options.values.length - 1), this.options.values = null)), t.isArray(this.options.values) && (n = this.options.values.length), this._super(e, i), e) {
				case "orientation":
					this._detectOrientation(), this._removeClass("ui-slider-horizontal ui-slider-vertical")._addClass("ui-slider-" + this.orientation), this._refreshValue(), this.options.range && this._refreshRange(i), this.handles.css("horizontal" === i ? "bottom" : "left", "");
					break;
				case "value":
					this._animateOff = !0, this._refreshValue(), this._change(null, 0), this._animateOff = !1;
					break;
				case "values":
					for (this._animateOff = !0, this._refreshValue(), s = n - 1; s >= 0; s--) this._change(null, s);
					this._animateOff = !1;
					break;
				case "step":
				case "min":
				case "max":
					this._animateOff = !0, this._calculateNewMax(), this._refreshValue(), this._animateOff = !1;
					break;
				case "range":
					this._animateOff = !0, this._refresh(), this._animateOff = !1
			}
		},
		_setOptionDisabled: function (t) {
			this._super(t), this._toggleClass(null, "ui-state-disabled", !!t)
		},
		_value: function () {
			var t = this.options.value;
			return t = this._trimAlignValue(t)
		},
		_values: function (t) {
			var e, i, s;
			if (arguments.length) return e = this.options.values[t], e = this._trimAlignValue(e);
			if (this._hasMultipleValues()) {
				for (i = this.options.values.slice(), s = 0; i.length > s; s += 1) i[s] = this._trimAlignValue(i[s]);
				return i
			}
			return []
		},
		_trimAlignValue: function (t) {
			if (this._valueMin() >= t) return this._valueMin();
			if (t >= this._valueMax()) return this._valueMax();
			var e = this.options.step > 0 ? this.options.step : 1,
				i = (t - this._valueMin()) % e,
				s = t - i;
			return 2 * Math.abs(i) >= e && (s += i > 0 ? e : -e), parseFloat(s.toFixed(5))
		},
		_calculateNewMax: function () {
			var t = this.options.max,
				e = this._valueMin(),
				i = this.options.step,
				s = Math.round((t - e) / i) * i;
			t = s + e, t > this.options.max && (t -= i), this.max = parseFloat(t.toFixed(this._precision()))
		},
		_precision: function () {
			var t = this._precisionOf(this.options.step);
			return null !== this.options.min && (t = Math.max(t, this._precisionOf(this.options.min))), t
		},
		_precisionOf: function (t) {
			var e = "" + t,
				i = e.indexOf(".");
			return -1 === i ? 0 : e.length - i - 1
		},
		_valueMin: function () {
			return this.options.min
		},
		_valueMax: function () {
			return this.max
		},
		_refreshRange: function (t) {
			"vertical" === t && this.range.css({
				width: "",
				left: ""
			}), "horizontal" === t && this.range.css({
				height: "",
				bottom: ""
			})
		},
		_refreshValue: function () {
			var e, i, s, n, o, a = this.options.range,
				r = this.options,
				l = this,
				h = this._animateOff ? !1 : r.animate,
				c = {};
			this._hasMultipleValues() ? this.handles.each(function (s) {
				i = 100 * ((l.values(s) - l._valueMin()) / (l._valueMax() - l._valueMin())), c["horizontal" === l.orientation ? "left" : "bottom"] = i + "%", t(this).stop(1, 1)[h ? "animate" : "css"](c, r.animate), l.options.range === !0 && ("horizontal" === l.orientation ? (0 === s && l.range.stop(1, 1)[h ? "animate" : "css"]({
					left: i + "%"
				}, r.animate), 1 === s && l.range[h ? "animate" : "css"]({
					width: i - e + "%"
				}, {
					queue: !1,
					duration: r.animate
				})) : (0 === s && l.range.stop(1, 1)[h ? "animate" : "css"]({
					bottom: i + "%"
				}, r.animate), 1 === s && l.range[h ? "animate" : "css"]({
					height: i - e + "%"
				}, {
					queue: !1,
					duration: r.animate
				}))), e = i
			}) : (s = this.value(), n = this._valueMin(), o = this._valueMax(), i = o !== n ? 100 * ((s - n) / (o - n)) : 0, c["horizontal" === this.orientation ? "left" : "bottom"] = i + "%", this.handle.stop(1, 1)[h ? "animate" : "css"](c, r.animate), "min" === a && "horizontal" === this.orientation && this.range.stop(1, 1)[h ? "animate" : "css"]({
				width: i + "%"
			}, r.animate), "max" === a && "horizontal" === this.orientation && this.range.stop(1, 1)[h ? "animate" : "css"]({
				width: 100 - i + "%"
			}, r.animate), "min" === a && "vertical" === this.orientation && this.range.stop(1, 1)[h ? "animate" : "css"]({
				height: i + "%"
			}, r.animate), "max" === a && "vertical" === this.orientation && this.range.stop(1, 1)[h ? "animate" : "css"]({
				height: 100 - i + "%"
			}, r.animate))
		},
		_handleEvents: {
			keydown: function (e) {
				var i, s, n, o, a = t(e.target).data("ui-slider-handle-index");
				switch (e.keyCode) {
					case t.ui.keyCode.HOME:
					case t.ui.keyCode.END:
					case t.ui.keyCode.PAGE_UP:
					case t.ui.keyCode.PAGE_DOWN:
					case t.ui.keyCode.UP:
					case t.ui.keyCode.RIGHT:
					case t.ui.keyCode.DOWN:
					case t.ui.keyCode.LEFT:
						if (e.preventDefault(), !this._keySliding && (this._keySliding = !0, this._addClass(t(e.target), null, "ui-state-active"), i = this._start(e, a), i === !1)) return
				}
				switch (o = this.options.step, s = n = this._hasMultipleValues() ? this.values(a) : this.value(), e.keyCode) {
					case t.ui.keyCode.HOME:
						n = this._valueMin();
						break;
					case t.ui.keyCode.END:
						n = this._valueMax();
						break;
					case t.ui.keyCode.PAGE_UP:
						n = this._trimAlignValue(s + (this._valueMax() - this._valueMin()) / this.numPages);
						break;
					case t.ui.keyCode.PAGE_DOWN:
						n = this._trimAlignValue(s - (this._valueMax() - this._valueMin()) / this.numPages);
						break;
					case t.ui.keyCode.UP:
					case t.ui.keyCode.RIGHT:
						if (s === this._valueMax()) return;
						n = this._trimAlignValue(s + o);
						break;
					case t.ui.keyCode.DOWN:
					case t.ui.keyCode.LEFT:
						if (s === this._valueMin()) return;
						n = this._trimAlignValue(s - o)
				}
				this._slide(e, a, n)
			},
			keyup: function (e) {
				var i = t(e.target).data("ui-slider-handle-index");
				this._keySliding && (this._keySliding = !1, this._stop(e, i), this._change(e, i), this._removeClass(t(e.target), null, "ui-state-active"))
			}
		}
	}), t.widget("ui.spinner", {
		version: "1.12.1",
		defaultElement: "<input>",
		widgetEventPrefix: "spin",
		options: {
			classes: {
				"ui-spinner": "ui-corner-all",
				"ui-spinner-down": "ui-corner-br",
				"ui-spinner-up": "ui-corner-tr"
			},
			culture: null,
			icons: {
				down: "ui-icon-triangle-1-s",
				up: "ui-icon-triangle-1-n"
			},
			incremental: !0,
			max: null,
			min: null,
			numberFormat: null,
			page: 10,
			step: 1,
			change: null,
			spin: null,
			start: null,
			stop: null
		},
		_create: function () {
			this._setOption("max", this.options.max), this._setOption("min", this.options.min), this._setOption("step", this.options.step), "" !== this.value() && this._value(this.element.val(), !0), this._draw(), this._on(this._events), this._refresh(), this._on(this.window, {
				beforeunload: function () {
					this.element.removeAttr("autocomplete")
				}
			})
		},
		_getCreateOptions: function () {
			var e = this._super(),
				i = this.element;
			return t.each(["min", "max", "step"], function (t, s) {
				var n = i.attr(s);
				null != n && n.length && (e[s] = n)
			}), e
		},
		_events: {
			keydown: function (t) {
				this._start(t) && this._keydown(t) && t.preventDefault()
			},
			keyup: "_stop",
			focus: function () {
				this.previous = this.element.val()
			},
			blur: function (t) {
				return this.cancelBlur ? (delete this.cancelBlur, void 0) : (this._stop(), this._refresh(), this.previous !== this.element.val() && this._trigger("change", t), void 0)
			},
			mousewheel: function (t, e) {
				if (e) {
					if (!this.spinning && !this._start(t)) return !1;
					this._spin((e > 0 ? 1 : -1) * this.options.step, t), clearTimeout(this.mousewheelTimer), this.mousewheelTimer = this._delay(function () {
						this.spinning && this._stop(t)
					}, 100), t.preventDefault()
				}
			},
			"mousedown .ui-spinner-button": function (e) {
				function i() {
					var e = this.element[0] === t.ui.safeActiveElement(this.document[0]);
					e || (this.element.trigger("focus"), this.previous = s, this._delay(function () {
						this.previous = s
					}))
				}
				var s;
				s = this.element[0] === t.ui.safeActiveElement(this.document[0]) ? this.previous : this.element.val(), e.preventDefault(), i.call(this), this.cancelBlur = !0, this._delay(function () {
					delete this.cancelBlur, i.call(this)
				}), this._start(e) !== !1 && this._repeat(null, t(e.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, e)
			},
			"mouseup .ui-spinner-button": "_stop",
			"mouseenter .ui-spinner-button": function (e) {
				return t(e.currentTarget).hasClass("ui-state-active") ? this._start(e) === !1 ? !1 : (this._repeat(null, t(e.currentTarget).hasClass("ui-spinner-up") ? 1 : -1, e), void 0) : void 0
			},
			"mouseleave .ui-spinner-button": "_stop"
		},
		_enhance: function () {
			this.uiSpinner = this.element.attr("autocomplete", "off").wrap("<span>").parent().append("<a></a><a></a>")
		},
		_draw: function () {
			this._enhance(), this._addClass(this.uiSpinner, "ui-spinner", "ui-widget ui-widget-content"), this._addClass("ui-spinner-input"), this.element.attr("role", "spinbutton"), this.buttons = this.uiSpinner.children("a").attr("tabIndex", -1).attr("aria-hidden", !0).button({
				classes: {
					"ui-button": ""
				}
			}), this._removeClass(this.buttons, "ui-corner-all"), this._addClass(this.buttons.first(), "ui-spinner-button ui-spinner-up"), this._addClass(this.buttons.last(), "ui-spinner-button ui-spinner-down"), this.buttons.first().button({
				icon: this.options.icons.up,
				showLabel: !1
			}), this.buttons.last().button({
				icon: this.options.icons.down,
				showLabel: !1
			}), this.buttons.height() > Math.ceil(.5 * this.uiSpinner.height()) && this.uiSpinner.height() > 0 && this.uiSpinner.height(this.uiSpinner.height())
		},
		_keydown: function (e) {
			var i = this.options,
				s = t.ui.keyCode;
			switch (e.keyCode) {
				case s.UP:
					return this._repeat(null, 1, e), !0;
				case s.DOWN:
					return this._repeat(null, -1, e), !0;
				case s.PAGE_UP:
					return this._repeat(null, i.page, e), !0;
				case s.PAGE_DOWN:
					return this._repeat(null, -i.page, e), !0
			}
			return !1
		},
		_start: function (t) {
			return this.spinning || this._trigger("start", t) !== !1 ? (this.counter || (this.counter = 1), this.spinning = !0, !0) : !1
		},
		_repeat: function (t, e, i) {
			t = t || 500, clearTimeout(this.timer), this.timer = this._delay(function () {
				this._repeat(40, e, i)
			}, t), this._spin(e * this.options.step, i)
		},
		_spin: function (t, e) {
			var i = this.value() || 0;
			this.counter || (this.counter = 1), i = this._adjustValue(i + t * this._increment(this.counter)), this.spinning && this._trigger("spin", e, {
				value: i
			}) === !1 || (this._value(i), this.counter++)
		},
		_increment: function (e) {
			var i = this.options.incremental;
			return i ? t.isFunction(i) ? i(e) : Math.floor(e * e * e / 5e4 - e * e / 500 + 17 * e / 200 + 1) : 1
		},
		_precision: function () {
			var t = this._precisionOf(this.options.step);
			return null !== this.options.min && (t = Math.max(t, this._precisionOf(this.options.min))), t
		},
		_precisionOf: function (t) {
			var e = "" + t,
				i = e.indexOf(".");
			return -1 === i ? 0 : e.length - i - 1
		},
		_adjustValue: function (t) {
			var e, i, s = this.options;
			return e = null !== s.min ? s.min : 0, i = t - e, i = Math.round(i / s.step) * s.step, t = e + i, t = parseFloat(t.toFixed(this._precision())), null !== s.max && t > s.max ? s.max : null !== s.min && s.min > t ? s.min : t
		},
		_stop: function (t) {
			this.spinning && (clearTimeout(this.timer), clearTimeout(this.mousewheelTimer), this.counter = 0, this.spinning = !1, this._trigger("stop", t))
		},
		_setOption: function (t, e) {
			var i, s, n;
			return "culture" === t || "numberFormat" === t ? (i = this._parse(this.element.val()), this.options[t] = e, this.element.val(this._format(i)), void 0) : (("max" === t || "min" === t || "step" === t) && "string" == typeof e && (e = this._parse(e)), "icons" === t && (s = this.buttons.first().find(".ui-icon"), this._removeClass(s, null, this.options.icons.up), this._addClass(s, null, e.up), n = this.buttons.last().find(".ui-icon"), this._removeClass(n, null, this.options.icons.down), this._addClass(n, null, e.down)), this._super(t, e), void 0)
		},
		_setOptionDisabled: function (t) {
			this._super(t), this._toggleClass(this.uiSpinner, null, "ui-state-disabled", !!t), this.element.prop("disabled", !!t), this.buttons.button(t ? "disable" : "enable")
		},
		_setOptions: r(function (t) {
			this._super(t)
		}),
		_parse: function (t) {
			return "string" == typeof t && "" !== t && (t = window.Globalize && this.options.numberFormat ? Globalize.parseFloat(t, 10, this.options.culture) : +t), "" === t || isNaN(t) ? null : t
		},
		_format: function (t) {
			return "" === t ? "" : window.Globalize && this.options.numberFormat ? Globalize.format(t, this.options.numberFormat, this.options.culture) : t
		},
		_refresh: function () {
			this.element.attr({
				"aria-valuemin": this.options.min,
				"aria-valuemax": this.options.max,
				"aria-valuenow": this._parse(this.element.val())
			})
		},
		isValid: function () {
			var t = this.value();
			return null === t ? !1 : t === this._adjustValue(t)
		},
		_value: function (t, e) {
			var i;
			"" !== t && (i = this._parse(t), null !== i && (e || (i = this._adjustValue(i)), t = this._format(i))), this.element.val(t), this._refresh()
		},
		_destroy: function () {
			this.element.prop("disabled", !1).removeAttr("autocomplete role aria-valuemin aria-valuemax aria-valuenow"), this.uiSpinner.replaceWith(this.element)
		},
		stepUp: r(function (t) {
			this._stepUp(t)
		}),
		_stepUp: function (t) {
			this._start() && (this._spin((t || 1) * this.options.step), this._stop())
		},
		stepDown: r(function (t) {
			this._stepDown(t)
		}),
		_stepDown: function (t) {
			this._start() && (this._spin((t || 1) * -this.options.step), this._stop())
		},
		pageUp: r(function (t) {
			this._stepUp((t || 1) * this.options.page)
		}),
		pageDown: r(function (t) {
			this._stepDown((t || 1) * this.options.page)
		}),
		value: function (t) {
			return arguments.length ? (r(this._value).call(this, t), void 0) : this._parse(this.element.val())
		},
		widget: function () {
			return this.uiSpinner
		}
	}), t.uiBackCompat !== !1 && t.widget("ui.spinner", t.ui.spinner, {
		_enhance: function () {
			this.uiSpinner = this.element.attr("autocomplete", "off").wrap(this._uiSpinnerHtml()).parent().append(this._buttonHtml())
		},
		_uiSpinnerHtml: function () {
			return "<span>"
		},
		_buttonHtml: function () {
			return "<a></a><a></a>"
		}
	}), t.ui.spinner, t.widget("ui.tabs", {
		version: "1.12.1",
		delay: 300,
		options: {
			active: null,
			classes: {
				"ui-tabs": "ui-corner-all",
				"ui-tabs-nav": "ui-corner-all",
				"ui-tabs-panel": "ui-corner-bottom",
				"ui-tabs-tab": "ui-corner-top"
			},
			collapsible: !1,
			event: "click",
			heightStyle: "content",
			hide: null,
			show: null,
			activate: null,
			beforeActivate: null,
			beforeLoad: null,
			load: null
		},
		_isLocal: function () {
			var t = /#.*$/;
			return function (e) {
				var i, s;
				i = e.href.replace(t, ""), s = location.href.replace(t, "");
				try {
					i = decodeURIComponent(i)
				} catch (n) {}
				try {
					s = decodeURIComponent(s)
				} catch (n) {}
				return e.hash.length > 1 && i === s
			}
		}(),
		_create: function () {
			var e = this,
				i = this.options;
			this.running = !1, this._addClass("ui-tabs", "ui-widget ui-widget-content"), this._toggleClass("ui-tabs-collapsible", null, i.collapsible), this._processTabs(), i.active = this._initialActive(), t.isArray(i.disabled) && (i.disabled = t.unique(i.disabled.concat(t.map(this.tabs.filter(".ui-state-disabled"), function (t) {
				return e.tabs.index(t)
			}))).sort()), this.active = this.options.active !== !1 && this.anchors.length ? this._findActive(i.active) : t(), this._refresh(), this.active.length && this.load(i.active)
		},
		_initialActive: function () {
			var e = this.options.active,
				i = this.options.collapsible,
				s = location.hash.substring(1);
			return null === e && (s && this.tabs.each(function (i, n) {
				return t(n).attr("aria-controls") === s ? (e = i, !1) : void 0
			}), null === e && (e = this.tabs.index(this.tabs.filter(".ui-tabs-active"))), (null === e || -1 === e) && (e = this.tabs.length ? 0 : !1)), e !== !1 && (e = this.tabs.index(this.tabs.eq(e)), -1 === e && (e = i ? !1 : 0)), !i && e === !1 && this.anchors.length && (e = 0), e
		},
		_getCreateEventData: function () {
			return {
				tab: this.active,
				panel: this.active.length ? this._getPanelForTab(this.active) : t()
			}
		},
		_tabKeydown: function (e) {
			var i = t(t.ui.safeActiveElement(this.document[0])).closest("li"),
				s = this.tabs.index(i),
				n = !0;
			if (!this._handlePageNav(e)) {
				switch (e.keyCode) {
					case t.ui.keyCode.RIGHT:
					case t.ui.keyCode.DOWN:
						s++;
						break;
					case t.ui.keyCode.UP:
					case t.ui.keyCode.LEFT:
						n = !1, s--;
						break;
					case t.ui.keyCode.END:
						s = this.anchors.length - 1;
						break;
					case t.ui.keyCode.HOME:
						s = 0;
						break;
					case t.ui.keyCode.SPACE:
						return e.preventDefault(), clearTimeout(this.activating), this._activate(s), void 0;
					case t.ui.keyCode.ENTER:
						return e.preventDefault(), clearTimeout(this.activating), this._activate(s === this.options.active ? !1 : s), void 0;
					default:
						return
				}
				e.preventDefault(), clearTimeout(this.activating), s = this._focusNextTab(s, n), e.ctrlKey || e.metaKey || (i.attr("aria-selected", "false"), this.tabs.eq(s).attr("aria-selected", "true"), this.activating = this._delay(function () {
					this.option("active", s)
				}, this.delay))
			}
		},
		_panelKeydown: function (e) {
			this._handlePageNav(e) || e.ctrlKey && e.keyCode === t.ui.keyCode.UP && (e.preventDefault(), this.active.trigger("focus"))
		},
		_handlePageNav: function (e) {
			return e.altKey && e.keyCode === t.ui.keyCode.PAGE_UP ? (this._activate(this._focusNextTab(this.options.active - 1, !1)), !0) : e.altKey && e.keyCode === t.ui.keyCode.PAGE_DOWN ? (this._activate(this._focusNextTab(this.options.active + 1, !0)), !0) : void 0
		},
		_findNextTab: function (e, i) {
			function s() {
				return e > n && (e = 0), 0 > e && (e = n), e
			}
			for (var n = this.tabs.length - 1; - 1 !== t.inArray(s(), this.options.disabled);) e = i ? e + 1 : e - 1;
			return e
		},
		_focusNextTab: function (t, e) {
			return t = this._findNextTab(t, e), this.tabs.eq(t).trigger("focus"), t
		},
		_setOption: function (t, e) {
			return "active" === t ? (this._activate(e), void 0) : (this._super(t, e), "collapsible" === t && (this._toggleClass("ui-tabs-collapsible", null, e), e || this.options.active !== !1 || this._activate(0)), "event" === t && this._setupEvents(e), "heightStyle" === t && this._setupHeightStyle(e), void 0)
		},
		_sanitizeSelector: function (t) {
			return t ? t.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g, "\\$&") : ""
		},
		refresh: function () {
			var e = this.options,
				i = this.tablist.children(":has(a[href])");
			e.disabled = t.map(i.filter(".ui-state-disabled"), function (t) {
				return i.index(t)
			}), this._processTabs(), e.active !== !1 && this.anchors.length ? this.active.length && !t.contains(this.tablist[0], this.active[0]) ? this.tabs.length === e.disabled.length ? (e.active = !1, this.active = t()) : this._activate(this._findNextTab(Math.max(0, e.active - 1), !1)) : e.active = this.tabs.index(this.active) : (e.active = !1, this.active = t()), this._refresh()
		},
		_refresh: function () {
			this._setOptionDisabled(this.options.disabled), this._setupEvents(this.options.event), this._setupHeightStyle(this.options.heightStyle), this.tabs.not(this.active).attr({
				"aria-selected": "false",
				"aria-expanded": "false",
				tabIndex: -1
			}), this.panels.not(this._getPanelForTab(this.active)).hide().attr({
				"aria-hidden": "true"
			}), this.active.length ? (this.active.attr({
				"aria-selected": "true",
				"aria-expanded": "true",
				tabIndex: 0
			}), this._addClass(this.active, "ui-tabs-active", "ui-state-active"), this._getPanelForTab(this.active).show().attr({
				"aria-hidden": "false"
			})) : this.tabs.eq(0).attr("tabIndex", 0)
		},
		_processTabs: function () {
			var e = this,
				i = this.tabs,
				s = this.anchors,
				n = this.panels;
			this.tablist = this._getList().attr("role", "tablist"), this._addClass(this.tablist, "ui-tabs-nav", "ui-helper-reset ui-helper-clearfix ui-widget-header"), this.tablist.on("mousedown" + this.eventNamespace, "> li", function (e) {
				t(this).is(".ui-state-disabled") && e.preventDefault()
			}).on("focus" + this.eventNamespace, ".ui-tabs-anchor", function () {
				t(this).closest("li").is(".ui-state-disabled") && this.blur()
			}), this.tabs = this.tablist.find("> li:has(a[href])").attr({
				role: "tab",
				tabIndex: -1
			}), this._addClass(this.tabs, "ui-tabs-tab", "ui-state-default"), this.anchors = this.tabs.map(function () {
				return t("a", this)[0]
			}).attr({
				role: "presentation",
				tabIndex: -1
			}), this._addClass(this.anchors, "ui-tabs-anchor"), this.panels = t(), this.anchors.each(function (i, s) {
				var n, o, a, r = t(s).uniqueId().attr("id"),
					l = t(s).closest("li"),
					h = l.attr("aria-controls");
				e._isLocal(s) ? (n = s.hash, a = n.substring(1), o = e.element.find(e._sanitizeSelector(n))) : (a = l.attr("aria-controls") || t({}).uniqueId()[0].id, n = "#" + a, o = e.element.find(n), o.length || (o = e._createPanel(a), o.insertAfter(e.panels[i - 1] || e.tablist)), o.attr("aria-live", "polite")), o.length && (e.panels = e.panels.add(o)), h && l.data("ui-tabs-aria-controls", h), l.attr({
					"aria-controls": a,
					"aria-labelledby": r
				}), o.attr("aria-labelledby", r)
			}), this.panels.attr("role", "tabpanel"), this._addClass(this.panels, "ui-tabs-panel", "ui-widget-content"), i && (this._off(i.not(this.tabs)), this._off(s.not(this.anchors)), this._off(n.not(this.panels)))
		},
		_getList: function () {
			return this.tablist || this.element.find("ol, ul").eq(0)
		},
		_createPanel: function (e) {
			return t("<div>").attr("id", e).data("ui-tabs-destroy", !0)
		},
		_setOptionDisabled: function (e) {
			var i, s, n;
			for (t.isArray(e) && (e.length ? e.length === this.anchors.length && (e = !0) : e = !1), n = 0; s = this.tabs[n]; n++) i = t(s), e === !0 || -1 !== t.inArray(n, e) ? (i.attr("aria-disabled", "true"), this._addClass(i, null, "ui-state-disabled")) : (i.removeAttr("aria-disabled"), this._removeClass(i, null, "ui-state-disabled"));
			this.options.disabled = e, this._toggleClass(this.widget(), this.widgetFullName + "-disabled", null, e === !0)
		},
		_setupEvents: function (e) {
			var i = {};
			e && t.each(e.split(" "), function (t, e) {
				i[e] = "_eventHandler"
			}), this._off(this.anchors.add(this.tabs).add(this.panels)), this._on(!0, this.anchors, {
				click: function (t) {
					t.preventDefault()
				}
			}), this._on(this.anchors, i), this._on(this.tabs, {
				keydown: "_tabKeydown"
			}), this._on(this.panels, {
				keydown: "_panelKeydown"
			}), this._focusable(this.tabs), this._hoverable(this.tabs)
		},
		_setupHeightStyle: function (e) {
			var i, s = this.element.parent();
			"fill" === e ? (i = s.height(), i -= this.element.outerHeight() - this.element.height(), this.element.siblings(":visible").each(function () {
				var e = t(this),
					s = e.css("position");
				"absolute" !== s && "fixed" !== s && (i -= e.outerHeight(!0))
			}), this.element.children().not(this.panels).each(function () {
				i -= t(this).outerHeight(!0)
			}), this.panels.each(function () {
				t(this).height(Math.max(0, i - t(this).innerHeight() + t(this).height()))
			}).css("overflow", "auto")) : "auto" === e && (i = 0, this.panels.each(function () {
				i = Math.max(i, t(this).height("").height())
			}).height(i))
		},
		_eventHandler: function (e) {
			var i = this.options,
				s = this.active,
				n = t(e.currentTarget),
				o = n.closest("li"),
				a = o[0] === s[0],
				r = a && i.collapsible,
				l = r ? t() : this._getPanelForTab(o),
				h = s.length ? this._getPanelForTab(s) : t(),
				c = {
					oldTab: s,
					oldPanel: h,
					newTab: r ? t() : o,
					newPanel: l
				};
			e.preventDefault(), o.hasClass("ui-state-disabled") || o.hasClass("ui-tabs-loading") || this.running || a && !i.collapsible || this._trigger("beforeActivate", e, c) === !1 || (i.active = r ? !1 : this.tabs.index(o), this.active = a ? t() : o, this.xhr && this.xhr.abort(), h.length || l.length || t.error("jQuery UI Tabs: Mismatching fragment identifier."), l.length && this.load(this.tabs.index(o), e), this._toggle(e, c))
		},
		_toggle: function (e, i) {
			function s() {
				o.running = !1, o._trigger("activate", e, i)
			}

			function n() {
				o._addClass(i.newTab.closest("li"), "ui-tabs-active", "ui-state-active"), a.length && o.options.show ? o._show(a, o.options.show, s) : (a.show(), s())
			}
			var o = this,
				a = i.newPanel,
				r = i.oldPanel;
			this.running = !0, r.length && this.options.hide ? this._hide(r, this.options.hide, function () {
				o._removeClass(i.oldTab.closest("li"), "ui-tabs-active", "ui-state-active"), n()
			}) : (this._removeClass(i.oldTab.closest("li"), "ui-tabs-active", "ui-state-active"), r.hide(), n()), r.attr("aria-hidden", "true"), i.oldTab.attr({
				"aria-selected": "false",
				"aria-expanded": "false"
			}), a.length && r.length ? i.oldTab.attr("tabIndex", -1) : a.length && this.tabs.filter(function () {
				return 0 === t(this).attr("tabIndex")
			}).attr("tabIndex", -1), a.attr("aria-hidden", "false"), i.newTab.attr({
				"aria-selected": "true",
				"aria-expanded": "true",
				tabIndex: 0
			})
		},
		_activate: function (e) {
			var i, s = this._findActive(e);
			s[0] !== this.active[0] && (s.length || (s = this.active), i = s.find(".ui-tabs-anchor")[0], this._eventHandler({
				target: i,
				currentTarget: i,
				preventDefault: t.noop
			}))
		},
		_findActive: function (e) {
			return e === !1 ? t() : this.tabs.eq(e)
		},
		_getIndex: function (e) {
			return "string" == typeof e && (e = this.anchors.index(this.anchors.filter("[href$='" + t.ui.escapeSelector(e) + "']"))), e
		},
		_destroy: function () {
			this.xhr && this.xhr.abort(), this.tablist.removeAttr("role").off(this.eventNamespace), this.anchors.removeAttr("role tabIndex").removeUniqueId(), this.tabs.add(this.panels).each(function () {
				t.data(this, "ui-tabs-destroy") ? t(this).remove() : t(this).removeAttr("role tabIndex aria-live aria-busy aria-selected aria-labelledby aria-hidden aria-expanded")
			}), this.tabs.each(function () {
				var e = t(this),
					i = e.data("ui-tabs-aria-controls");
				i ? e.attr("aria-controls", i).removeData("ui-tabs-aria-controls") : e.removeAttr("aria-controls")
			}), this.panels.show(), "content" !== this.options.heightStyle && this.panels.css("height", "")
		},
		enable: function (e) {
			var i = this.options.disabled;
			i !== !1 && (void 0 === e ? i = !1 : (e = this._getIndex(e), i = t.isArray(i) ? t.map(i, function (t) {
				return t !== e ? t : null
			}) : t.map(this.tabs, function (t, i) {
				return i !== e ? i : null
			})), this._setOptionDisabled(i))
		},
		disable: function (e) {
			var i = this.options.disabled;
			if (i !== !0) {
				if (void 0 === e) i = !0;
				else {
					if (e = this._getIndex(e), -1 !== t.inArray(e, i)) return;
					i = t.isArray(i) ? t.merge([e], i).sort() : [e]
				}
				this._setOptionDisabled(i)
			}
		},
		load: function (e, i) {
			e = this._getIndex(e);
			var s = this,
				n = this.tabs.eq(e),
				o = n.find(".ui-tabs-anchor"),
				a = this._getPanelForTab(n),
				r = {
					tab: n,
					panel: a
				},
				l = function (t, e) {
					"abort" === e && s.panels.stop(!1, !0), s._removeClass(n, "ui-tabs-loading"), a.removeAttr("aria-busy"), t === s.xhr && delete s.xhr
				};
			this._isLocal(o[0]) || (this.xhr = t.ajax(this._ajaxSettings(o, i, r)), this.xhr && "canceled" !== this.xhr.statusText && (this._addClass(n, "ui-tabs-loading"), a.attr("aria-busy", "true"), this.xhr.done(function (t, e, n) {
				setTimeout(function () {
					a.html(t), s._trigger("load", i, r), l(n, e)
				}, 1)
			}).fail(function (t, e) {
				setTimeout(function () {
					l(t, e)
				}, 1)
			})))
		},
		_ajaxSettings: function (e, i, s) {
			var n = this;
			return {
				url: e.attr("href").replace(/#.*$/, ""),
				beforeSend: function (e, o) {
					return n._trigger("beforeLoad", i, t.extend({
						jqXHR: e,
						ajaxSettings: o
					}, s))
				}
			}
		},
		_getPanelForTab: function (e) {
			var i = t(e).attr("aria-controls");
			return this.element.find(this._sanitizeSelector("#" + i))
		}
	}), t.uiBackCompat !== !1 && t.widget("ui.tabs", t.ui.tabs, {
		_processTabs: function () {
			this._superApply(arguments), this._addClass(this.tabs, "ui-tab")
		}
	}), t.ui.tabs, t.widget("ui.tooltip", {
		version: "1.12.1",
		options: {
			classes: {
				"ui-tooltip": "ui-corner-all ui-widget-shadow"
			},
			content: function () {
				var e = t(this).attr("title") || "";
				return t("<a>").text(e).html()
			},
			hide: !0,
			items: "[title]:not([disabled])",
			position: {
				my: "left top+15",
				at: "left bottom",
				collision: "flipfit flip"
			},
			show: !0,
			track: !1,
			close: null,
			open: null
		},
		_addDescribedBy: function (e, i) {
			var s = (e.attr("aria-describedby") || "").split(/\s+/);
			s.push(i), e.data("ui-tooltip-id", i).attr("aria-describedby", t.trim(s.join(" ")))
		},
		_removeDescribedBy: function (e) {
			var i = e.data("ui-tooltip-id"),
				s = (e.attr("aria-describedby") || "").split(/\s+/),
				n = t.inArray(i, s); - 1 !== n && s.splice(n, 1), e.removeData("ui-tooltip-id"), s = t.trim(s.join(" ")), s ? e.attr("aria-describedby", s) : e.removeAttr("aria-describedby")
		},
		_create: function () {
			this._on({
				mouseover: "open",
				focusin: "open"
			}), this.tooltips = {}, this.parents = {}, this.liveRegion = t("<div>").attr({
				role: "log",
				"aria-live": "assertive",
				"aria-relevant": "additions"
			}).appendTo(this.document[0].body), this._addClass(this.liveRegion, null, "ui-helper-hidden-accessible"), this.disabledTitles = t([])
		},
		_setOption: function (e, i) {
			var s = this;
			this._super(e, i), "content" === e && t.each(this.tooltips, function (t, e) {
				s._updateContent(e.element)
			})
		},
		_setOptionDisabled: function (t) {
			this[t ? "_disable" : "_enable"]()
		},
		_disable: function () {
			var e = this;
			t.each(this.tooltips, function (i, s) {
				var n = t.Event("blur");
				n.target = n.currentTarget = s.element[0], e.close(n, !0)
			}), this.disabledTitles = this.disabledTitles.add(this.element.find(this.options.items).addBack().filter(function () {
				var e = t(this);
				return e.is("[title]") ? e.data("ui-tooltip-title", e.attr("title")).removeAttr("title") : void 0
			}))
		},
		_enable: function () {
			this.disabledTitles.each(function () {
				var e = t(this);
				e.data("ui-tooltip-title") && e.attr("title", e.data("ui-tooltip-title"))
			}), this.disabledTitles = t([])
		},
		open: function (e) {
			var i = this,
				s = t(e ? e.target : this.element).closest(this.options.items);
			s.length && !s.data("ui-tooltip-id") && (s.attr("title") && s.data("ui-tooltip-title", s.attr("title")), s.data("ui-tooltip-open", !0), e && "mouseover" === e.type && s.parents().each(function () {
				var e, s = t(this);
				s.data("ui-tooltip-open") && (e = t.Event("blur"), e.target = e.currentTarget = this, i.close(e, !0)), s.attr("title") && (s.uniqueId(), i.parents[this.id] = {
					element: this,
					title: s.attr("title")
				}, s.attr("title", ""))
			}), this._registerCloseHandlers(e, s), this._updateContent(s, e))
		},
		_updateContent: function (t, e) {
			var i, s = this.options.content,
				n = this,
				o = e ? e.type : null;
			return "string" == typeof s || s.nodeType || s.jquery ? this._open(e, t, s) : (i = s.call(t[0], function (i) {
				n._delay(function () {
					t.data("ui-tooltip-open") && (e && (e.type = o), this._open(e, t, i))
				})
			}), i && this._open(e, t, i), void 0)
		},
		_open: function (e, i, s) {
			function n(t) {
				h.of = t, a.is(":hidden") || a.position(h)
			}
			var o, a, r, l, h = t.extend({}, this.options.position);
			if (s) {
				if (o = this._find(i)) return o.tooltip.find(".ui-tooltip-content").html(s), void 0;
				i.is("[title]") && (e && "mouseover" === e.type ? i.attr("title", "") : i.removeAttr("title")), o = this._tooltip(i), a = o.tooltip, this._addDescribedBy(i, a.attr("id")), a.find(".ui-tooltip-content").html(s), this.liveRegion.children().hide(), l = t("<div>").html(a.find(".ui-tooltip-content").html()), l.removeAttr("name").find("[name]").removeAttr("name"), l.removeAttr("id").find("[id]").removeAttr("id"), l.appendTo(this.liveRegion), this.options.track && e && /^mouse/.test(e.type) ? (this._on(this.document, {
					mousemove: n
				}), n(e)) : a.position(t.extend({
					of: i
				}, this.options.position)), a.hide(), this._show(a, this.options.show), this.options.track && this.options.show && this.options.show.delay && (r = this.delayedShow = setInterval(function () {
					a.is(":visible") && (n(h.of), clearInterval(r))
				}, t.fx.interval)), this._trigger("open", e, {
					tooltip: a
				})
			}
		},
		_registerCloseHandlers: function (e, i) {
			var s = {
				keyup: function (e) {
					if (e.keyCode === t.ui.keyCode.ESCAPE) {
						var s = t.Event(e);
						s.currentTarget = i[0], this.close(s, !0)
					}
				}
			};
			i[0] !== this.element[0] && (s.remove = function () {
				this._removeTooltip(this._find(i).tooltip)
			}), e && "mouseover" !== e.type || (s.mouseleave = "close"), e && "focusin" !== e.type || (s.focusout = "close"), this._on(!0, i, s)
		},
		close: function (e) {
			var i, s = this,
				n = t(e ? e.currentTarget : this.element),
				o = this._find(n);
			return o ? (i = o.tooltip, o.closing || (clearInterval(this.delayedShow), n.data("ui-tooltip-title") && !n.attr("title") && n.attr("title", n.data("ui-tooltip-title")), this._removeDescribedBy(n), o.hiding = !0, i.stop(!0), this._hide(i, this.options.hide, function () {
				s._removeTooltip(t(this))
			}), n.removeData("ui-tooltip-open"), this._off(n, "mouseleave focusout keyup"), n[0] !== this.element[0] && this._off(n, "remove"), this._off(this.document, "mousemove"), e && "mouseleave" === e.type && t.each(this.parents, function (e, i) {
				t(i.element).attr("title", i.title), delete s.parents[e]
			}), o.closing = !0, this._trigger("close", e, {
				tooltip: i
			}), o.hiding || (o.closing = !1)), void 0) : (n.removeData("ui-tooltip-open"), void 0)
		},
		_tooltip: function (e) {
			var i = t("<div>").attr("role", "tooltip"),
				s = t("<div>").appendTo(i),
				n = i.uniqueId().attr("id");
			return this._addClass(s, "ui-tooltip-content"), this._addClass(i, "ui-tooltip", "ui-widget ui-widget-content"), i.appendTo(this._appendTo(e)), this.tooltips[n] = {
				element: e,
				tooltip: i
			}
		},
		_find: function (t) {
			var e = t.data("ui-tooltip-id");
			return e ? this.tooltips[e] : null
		},
		_removeTooltip: function (t) {
			t.remove(), delete this.tooltips[t.attr("id")]
		},
		_appendTo: function (t) {
			var e = t.closest(".ui-front, dialog");
			return e.length || (e = this.document[0].body), e
		},
		_destroy: function () {
			var e = this;
			t.each(this.tooltips, function (i, s) {
				var n = t.Event("blur"),
					o = s.element;
				n.target = n.currentTarget = o[0], e.close(n, !0), t("#" + i).remove(), o.data("ui-tooltip-title") && (o.attr("title") || o.attr("title", o.data("ui-tooltip-title")), o.removeData("ui-tooltip-title"))
			}), this.liveRegion.remove()
		}
	}), t.uiBackCompat !== !1 && t.widget("ui.tooltip", t.ui.tooltip, {
		options: {
			tooltipClass: null
		},
		_tooltip: function () {
			var t = this._superApply(arguments);
			return this.options.tooltipClass && t.tooltip.addClass(this.options.tooltipClass), t
		}
	}), t.ui.tooltip;
	var f = "ui-effects-",
		g = "ui-effects-style",
		m = "ui-effects-animated",
		_ = t;
	t.effects = {
			effect: {}
		},
		function (t, e) {
			function i(t, e, i) {
				var s = u[e.type] || {};
				return null == t ? i || !e.def ? null : e.def : (t = s.floor ? ~~t : parseFloat(t), isNaN(t) ? e.def : s.mod ? (t + s.mod) % s.mod : 0 > t ? 0 : t > s.max ? s.max : t)
			}

			function s(i) {
				var s = h(),
					n = s._rgba = [];
				return i = i.toLowerCase(), f(l, function (t, o) {
					var a, r = o.re.exec(i),
						l = r && o.parse(r),
						h = o.space || "rgba";
					return l ? (a = s[h](l), s[c[h].cache] = a[c[h].cache], n = s._rgba = a._rgba, !1) : e
				}), n.length ? ("0,0,0,0" === n.join() && t.extend(n, o.transparent), s) : o[i]
			}

			function n(t, e, i) {
				return i = (i + 1) % 1, 1 > 6 * i ? t + 6 * (e - t) * i : 1 > 2 * i ? e : 2 > 3 * i ? t + 6 * (e - t) * (2 / 3 - i) : t
			}
			var o, a = "backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",
				r = /^([\-+])=\s*(\d+\.?\d*)/,
				l = [{
					re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
					parse: function (t) {
						return [t[1], t[2], t[3], t[4]]
					}
				}, {
					re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
					parse: function (t) {
						return [2.55 * t[1], 2.55 * t[2], 2.55 * t[3], t[4]]
					}
				}, {
					re: /#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,
					parse: function (t) {
						return [parseInt(t[1], 16), parseInt(t[2], 16), parseInt(t[3], 16)]
					}
				}, {
					re: /#([a-f0-9])([a-f0-9])([a-f0-9])/,
					parse: function (t) {
						return [parseInt(t[1] + t[1], 16), parseInt(t[2] + t[2], 16), parseInt(t[3] + t[3], 16)]
					}
				}, {
					re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,
					space: "hsla",
					parse: function (t) {
						return [t[1], t[2] / 100, t[3] / 100, t[4]]
					}
				}],
				h = t.Color = function (e, i, s, n) {
					return new t.Color.fn.parse(e, i, s, n)
				},
				c = {
					rgba: {
						props: {
							red: {
								idx: 0,
								type: "byte"
							},
							green: {
								idx: 1,
								type: "byte"
							},
							blue: {
								idx: 2,
								type: "byte"
							}
						}
					},
					hsla: {
						props: {
							hue: {
								idx: 0,
								type: "degrees"
							},
							saturation: {
								idx: 1,
								type: "percent"
							},
							lightness: {
								idx: 2,
								type: "percent"
							}
						}
					}
				},
				u = {
					"byte": {
						floor: !0,
						max: 255
					},
					percent: {
						max: 1
					},
					degrees: {
						mod: 360,
						floor: !0
					}
				},
				d = h.support = {},
				p = t("<p>")[0],
				f = t.each;
			p.style.cssText = "background-color:rgba(1,1,1,.5)", d.rgba = p.style.backgroundColor.indexOf("rgba") > -1, f(c, function (t, e) {
				e.cache = "_" + t, e.props.alpha = {
					idx: 3,
					type: "percent",
					def: 1
				}
			}), h.fn = t.extend(h.prototype, {
				parse: function (n, a, r, l) {
					if (n === e) return this._rgba = [null, null, null, null], this;
					(n.jquery || n.nodeType) && (n = t(n).css(a), a = e);
					var u = this,
						d = t.type(n),
						p = this._rgba = [];
					return a !== e && (n = [n, a, r, l], d = "array"), "string" === d ? this.parse(s(n) || o._default) : "array" === d ? (f(c.rgba.props, function (t, e) {
						p[e.idx] = i(n[e.idx], e)
					}), this) : "object" === d ? (n instanceof h ? f(c, function (t, e) {
						n[e.cache] && (u[e.cache] = n[e.cache].slice())
					}) : f(c, function (e, s) {
						var o = s.cache;
						f(s.props, function (t, e) {
							if (!u[o] && s.to) {
								if ("alpha" === t || null == n[t]) return;
								u[o] = s.to(u._rgba)
							}
							u[o][e.idx] = i(n[t], e, !0)
						}), u[o] && 0 > t.inArray(null, u[o].slice(0, 3)) && (u[o][3] = 1, s.from && (u._rgba = s.from(u[o])))
					}), this) : e
				},
				is: function (t) {
					var i = h(t),
						s = !0,
						n = this;
					return f(c, function (t, o) {
						var a, r = i[o.cache];
						return r && (a = n[o.cache] || o.to && o.to(n._rgba) || [], f(o.props, function (t, i) {
							return null != r[i.idx] ? s = r[i.idx] === a[i.idx] : e
						})), s
					}), s
				},
				_space: function () {
					var t = [],
						e = this;
					return f(c, function (i, s) {
						e[s.cache] && t.push(i)
					}), t.pop()
				},
				transition: function (t, e) {
					var s = h(t),
						n = s._space(),
						o = c[n],
						a = 0 === this.alpha() ? h("transparent") : this,
						r = a[o.cache] || o.to(a._rgba),
						l = r.slice();
					return s = s[o.cache], f(o.props, function (t, n) {
						var o = n.idx,
							a = r[o],
							h = s[o],
							c = u[n.type] || {};
						null !== h && (null === a ? l[o] = h : (c.mod && (h - a > c.mod / 2 ? a += c.mod : a - h > c.mod / 2 && (a -= c.mod)), l[o] = i((h - a) * e + a, n)))
					}), this[n](l)
				},
				blend: function (e) {
					if (1 === this._rgba[3]) return this;
					var i = this._rgba.slice(),
						s = i.pop(),
						n = h(e)._rgba;
					return h(t.map(i, function (t, e) {
						return (1 - s) * n[e] + s * t
					}))
				},
				toRgbaString: function () {
					var e = "rgba(",
						i = t.map(this._rgba, function (t, e) {
							return null == t ? e > 2 ? 1 : 0 : t
						});
					return 1 === i[3] && (i.pop(), e = "rgb("), e + i.join() + ")"
				},
				toHslaString: function () {
					var e = "hsla(",
						i = t.map(this.hsla(), function (t, e) {
							return null == t && (t = e > 2 ? 1 : 0), e && 3 > e && (t = Math.round(100 * t) + "%"), t
						});
					return 1 === i[3] && (i.pop(), e = "hsl("), e + i.join() + ")"
				},
				toHexString: function (e) {
					var i = this._rgba.slice(),
						s = i.pop();
					return e && i.push(~~(255 * s)), "#" + t.map(i, function (t) {
						return t = (t || 0).toString(16), 1 === t.length ? "0" + t : t
					}).join("")
				},
				toString: function () {
					return 0 === this._rgba[3] ? "transparent" : this.toRgbaString()
				}
			}), h.fn.parse.prototype = h.fn, c.hsla.to = function (t) {
				if (null == t[0] || null == t[1] || null == t[2]) return [null, null, null, t[3]];
				var e, i, s = t[0] / 255,
					n = t[1] / 255,
					o = t[2] / 255,
					a = t[3],
					r = Math.max(s, n, o),
					l = Math.min(s, n, o),
					h = r - l,
					c = r + l,
					u = .5 * c;
				return e = l === r ? 0 : s === r ? 60 * (n - o) / h + 360 : n === r ? 60 * (o - s) / h + 120 : 60 * (s - n) / h + 240, i = 0 === h ? 0 : .5 >= u ? h / c : h / (2 - c), [Math.round(e) % 360, i, u, null == a ? 1 : a]
			}, c.hsla.from = function (t) {
				if (null == t[0] || null == t[1] || null == t[2]) return [null, null, null, t[3]];
				var e = t[0] / 360,
					i = t[1],
					s = t[2],
					o = t[3],
					a = .5 >= s ? s * (1 + i) : s + i - s * i,
					r = 2 * s - a;
				return [Math.round(255 * n(r, a, e + 1 / 3)), Math.round(255 * n(r, a, e)), Math.round(255 * n(r, a, e - 1 / 3)), o]
			}, f(c, function (s, n) {
				var o = n.props,
					a = n.cache,
					l = n.to,
					c = n.from;
				h.fn[s] = function (s) {
					if (l && !this[a] && (this[a] = l(this._rgba)), s === e) return this[a].slice();
					var n, r = t.type(s),
						u = "array" === r || "object" === r ? s : arguments,
						d = this[a].slice();
					return f(o, function (t, e) {
						var s = u["object" === r ? t : e.idx];
						null == s && (s = d[e.idx]), d[e.idx] = i(s, e)
					}), c ? (n = h(c(d)), n[a] = d, n) : h(d)
				}, f(o, function (e, i) {
					h.fn[e] || (h.fn[e] = function (n) {
						var o, a = t.type(n),
							l = "alpha" === e ? this._hsla ? "hsla" : "rgba" : s,
							h = this[l](),
							c = h[i.idx];
						return "undefined" === a ? c : ("function" === a && (n = n.call(this, c), a = t.type(n)), null == n && i.empty ? this : ("string" === a && (o = r.exec(n), o && (n = c + parseFloat(o[2]) * ("+" === o[1] ? 1 : -1))), h[i.idx] = n, this[l](h)))
					})
				})
			}), h.hook = function (e) {
				var i = e.split(" ");
				f(i, function (e, i) {
					t.cssHooks[i] = {
						set: function (e, n) {
							var o, a, r = "";
							if ("transparent" !== n && ("string" !== t.type(n) || (o = s(n)))) {
								if (n = h(o || n), !d.rgba && 1 !== n._rgba[3]) {
									for (a = "backgroundColor" === i ? e.parentNode : e;
										("" === r || "transparent" === r) && a && a.style;) try {
										r = t.css(a, "backgroundColor"), a = a.parentNode
									} catch (l) {}
									n = n.blend(r && "transparent" !== r ? r : "_default")
								}
								n = n.toRgbaString()
							}
							try {
								e.style[i] = n
							} catch (l) {}
						}
					}, t.fx.step[i] = function (e) {
						e.colorInit || (e.start = h(e.elem, i), e.end = h(e.end), e.colorInit = !0), t.cssHooks[i].set(e.elem, e.start.transition(e.end, e.pos))
					}
				})
			}, h.hook(a), t.cssHooks.borderColor = {
				expand: function (t) {
					var e = {};
					return f(["Top", "Right", "Bottom", "Left"], function (i, s) {
						e["border" + s + "Color"] = t
					}), e
				}
			}, o = t.Color.names = {
				aqua: "#00ffff",
				black: "#000000",
				blue: "#0000ff",
				fuchsia: "#ff00ff",
				gray: "#808080",
				green: "#008000",
				lime: "#00ff00",
				maroon: "#800000",
				navy: "#000080",
				olive: "#808000",
				purple: "#800080",
				red: "#ff0000",
				silver: "#c0c0c0",
				teal: "#008080",
				white: "#ffffff",
				yellow: "#ffff00",
				transparent: [null, null, null, 0],
				_default: "#ffffff"
			}
		}(_),
		function () {
			function e(e) {
				var i, s, n = e.ownerDocument.defaultView ? e.ownerDocument.defaultView.getComputedStyle(e, null) : e.currentStyle,
					o = {};
				if (n && n.length && n[0] && n[n[0]])
					for (s = n.length; s--;) i = n[s], "string" == typeof n[i] && (o[t.camelCase(i)] = n[i]);
				else
					for (i in n) "string" == typeof n[i] && (o[i] = n[i]);
				return o
			}

			function i(e, i) {
				var s, o, a = {};
				for (s in i) o = i[s], e[s] !== o && (n[s] || (t.fx.step[s] || !isNaN(parseFloat(o))) && (a[s] = o));
				return a
			}
			var s = ["add", "remove", "toggle"],
				n = {
					border: 1,
					borderBottom: 1,
					borderColor: 1,
					borderLeft: 1,
					borderRight: 1,
					borderTop: 1,
					borderWidth: 1,
					margin: 1,
					padding: 1
				};
			t.each(["borderLeftStyle", "borderRightStyle", "borderBottomStyle", "borderTopStyle"], function (e, i) {
				t.fx.step[i] = function (t) {
					("none" !== t.end && !t.setAttr || 1 === t.pos && !t.setAttr) && (_.style(t.elem, i, t.end), t.setAttr = !0)
				}
			}), t.fn.addBack || (t.fn.addBack = function (t) {
				return this.add(null == t ? this.prevObject : this.prevObject.filter(t))
			}), t.effects.animateClass = function (n, o, a, r) {
				var l = t.speed(o, a, r);
				return this.queue(function () {
					var o, a = t(this),
						r = a.attr("class") || "",
						h = l.children ? a.find("*").addBack() : a;
					h = h.map(function () {
						var i = t(this);
						return {
							el: i,
							start: e(this)
						}
					}), o = function () {
						t.each(s, function (t, e) {
							n[e] && a[e + "Class"](n[e])
						})
					}, o(), h = h.map(function () {
						return this.end = e(this.el[0]), this.diff = i(this.start, this.end), this
					}), a.attr("class", r), h = h.map(function () {
						var e = this,
							i = t.Deferred(),
							s = t.extend({}, l, {
								queue: !1,
								complete: function () {
									i.resolve(e)
								}
							});
						return this.el.animate(this.diff, s), i.promise()
					}), t.when.apply(t, h.get()).done(function () {
						o(), t.each(arguments, function () {
							var e = this.el;
							t.each(this.diff, function (t) {
								e.css(t, "")
							})
						}), l.complete.call(a[0])
					})
				})
			}, t.fn.extend({
				addClass: function (e) {
					return function (i, s, n, o) {
						return s ? t.effects.animateClass.call(this, {
							add: i
						}, s, n, o) : e.apply(this, arguments)
					}
				}(t.fn.addClass),
				removeClass: function (e) {
					return function (i, s, n, o) {
						return arguments.length > 1 ? t.effects.animateClass.call(this, {
							remove: i
						}, s, n, o) : e.apply(this, arguments)
					}
				}(t.fn.removeClass),
				toggleClass: function (e) {
					return function (i, s, n, o, a) {
						return "boolean" == typeof s || void 0 === s ? n ? t.effects.animateClass.call(this, s ? {
							add: i
						} : {
							remove: i
						}, n, o, a) : e.apply(this, arguments) : t.effects.animateClass.call(this, {
							toggle: i
						}, s, n, o)
					}
				}(t.fn.toggleClass),
				switchClass: function (e, i, s, n, o) {
					return t.effects.animateClass.call(this, {
						add: i,
						remove: e
					}, s, n, o)
				}
			})
		}(),
		function () {
			function e(e, i, s, n) {
				return t.isPlainObject(e) && (i = e, e = e.effect), e = {
					effect: e
				}, null == i && (i = {}), t.isFunction(i) && (n = i, s = null, i = {}), ("number" == typeof i || t.fx.speeds[i]) && (n = s, s = i, i = {}), t.isFunction(s) && (n = s, s = null), i && t.extend(e, i), s = s || i.duration, e.duration = t.fx.off ? 0 : "number" == typeof s ? s : s in t.fx.speeds ? t.fx.speeds[s] : t.fx.speeds._default, e.complete = n || i.complete, e
			}

			function i(e) {
				return !e || "number" == typeof e || t.fx.speeds[e] ? !0 : "string" != typeof e || t.effects.effect[e] ? t.isFunction(e) ? !0 : "object" != typeof e || e.effect ? !1 : !0 : !0
			}

			function s(t, e) {
				var i = e.outerWidth(),
					s = e.outerHeight(),
					n = /^rect\((-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto),?\s*(-?\d*\.?\d*px|-?\d+%|auto)\)$/,
					o = n.exec(t) || ["", 0, i, s, 0];
				return {
					top: parseFloat(o[1]) || 0,
					right: "auto" === o[2] ? i : parseFloat(o[2]),
					bottom: "auto" === o[3] ? s : parseFloat(o[3]),
					left: parseFloat(o[4]) || 0
				}
			}
			t.expr && t.expr.filters && t.expr.filters.animated && (t.expr.filters.animated = function (e) {
				return function (i) {
					return !!t(i).data(m) || e(i)
				}
			}(t.expr.filters.animated)), t.uiBackCompat !== !1 && t.extend(t.effects, {
				save: function (t, e) {
					for (var i = 0, s = e.length; s > i; i++) null !== e[i] && t.data(f + e[i], t[0].style[e[i]])
				},
				restore: function (t, e) {
					for (var i, s = 0, n = e.length; n > s; s++) null !== e[s] && (i = t.data(f + e[s]), t.css(e[s], i))
				},
				setMode: function (t, e) {
					return "toggle" === e && (e = t.is(":hidden") ? "show" : "hide"), e
				},
				createWrapper: function (e) {
					if (e.parent().is(".ui-effects-wrapper")) return e.parent();
					var i = {
							width: e.outerWidth(!0),
							height: e.outerHeight(!0),
							"float": e.css("float")
						},
						s = t("<div></div>").addClass("ui-effects-wrapper").css({
							fontSize: "100%",
							background: "transparent",
							border: "none",
							margin: 0,
							padding: 0
						}),
						n = {
							width: e.width(),
							height: e.height()
						},
						o = document.activeElement;
					try {
						o.id
					} catch (a) {
						o = document.body
					}
					return e.wrap(s), (e[0] === o || t.contains(e[0], o)) && t(o).trigger("focus"), s = e.parent(), "static" === e.css("position") ? (s.css({
						position: "relative"
					}), e.css({
						position: "relative"
					})) : (t.extend(i, {
						position: e.css("position"),
						zIndex: e.css("z-index")
					}), t.each(["top", "left", "bottom", "right"], function (t, s) {
						i[s] = e.css(s), isNaN(parseInt(i[s], 10)) && (i[s] = "auto")
					}), e.css({
						position: "relative",
						top: 0,
						left: 0,
						right: "auto",
						bottom: "auto"
					})), e.css(n), s.css(i).show()
				},
				removeWrapper: function (e) {
					var i = document.activeElement;
					return e.parent().is(".ui-effects-wrapper") && (e.parent().replaceWith(e), (e[0] === i || t.contains(e[0], i)) && t(i).trigger("focus")), e
				}
			}), t.extend(t.effects, {
				version: "1.12.1",
				define: function (e, i, s) {
					return s || (s = i, i = "effect"), t.effects.effect[e] = s, t.effects.effect[e].mode = i, s
				},
				scaledDimensions: function (t, e, i) {
					if (0 === e) return {
						height: 0,
						width: 0,
						outerHeight: 0,
						outerWidth: 0
					};
					var s = "horizontal" !== i ? (e || 100) / 100 : 1,
						n = "vertical" !== i ? (e || 100) / 100 : 1;
					return {
						height: t.height() * n,
						width: t.width() * s,
						outerHeight: t.outerHeight() * n,
						outerWidth: t.outerWidth() * s
					}
				},
				clipToBox: function (t) {
					return {
						width: t.clip.right - t.clip.left,
						height: t.clip.bottom - t.clip.top,
						left: t.clip.left,
						top: t.clip.top
					}
				},
				unshift: function (t, e, i) {
					var s = t.queue();
					e > 1 && s.splice.apply(s, [1, 0].concat(s.splice(e, i))), t.dequeue()
				},
				saveStyle: function (t) {
					t.data(g, t[0].style.cssText)
				},
				restoreStyle: function (t) {
					t[0].style.cssText = t.data(g) || "", t.removeData(g)
				},
				mode: function (t, e) {
					var i = t.is(":hidden");
					return "toggle" === e && (e = i ? "show" : "hide"), (i ? "hide" === e : "show" === e) && (e = "none"), e
				},
				getBaseline: function (t, e) {
					var i, s;
					switch (t[0]) {
						case "top":
							i = 0;
							break;
						case "middle":
							i = .5;
							break;
						case "bottom":
							i = 1;
							break;
						default:
							i = t[0] / e.height
					}
					switch (t[1]) {
						case "left":
							s = 0;
							break;
						case "center":
							s = .5;
							break;
						case "right":
							s = 1;
							break;
						default:
							s = t[1] / e.width
					}
					return {
						x: s,
						y: i
					}
				},
				createPlaceholder: function (e) {
					var i, s = e.css("position"),
						n = e.position();
					return e.css({
						marginTop: e.css("marginTop"),
						marginBottom: e.css("marginBottom"),
						marginLeft: e.css("marginLeft"),
						marginRight: e.css("marginRight")
					}).outerWidth(e.outerWidth()).outerHeight(e.outerHeight()), /^(static|relative)/.test(s) && (s = "absolute", i = t("<" + e[0].nodeName + ">").insertAfter(e).css({
						display: /^(inline|ruby)/.test(e.css("display")) ? "inline-block" : "block",
						visibility: "hidden",
						marginTop: e.css("marginTop"),
						marginBottom: e.css("marginBottom"),
						marginLeft: e.css("marginLeft"),
						marginRight: e.css("marginRight"),
						"float": e.css("float")
					}).outerWidth(e.outerWidth()).outerHeight(e.outerHeight()).addClass("ui-effects-placeholder"), e.data(f + "placeholder", i)), e.css({
						position: s,
						left: n.left,
						top: n.top
					}), i
				},
				removePlaceholder: function (t) {
					var e = f + "placeholder",
						i = t.data(e);
					i && (i.remove(), t.removeData(e))
				},
				cleanUp: function (e) {
					t.effects.restoreStyle(e), t.effects.removePlaceholder(e)
				},
				setTransition: function (e, i, s, n) {
					return n = n || {}, t.each(i, function (t, i) {
						var o = e.cssUnit(i);
						o[0] > 0 && (n[i] = o[0] * s + o[1])
					}), n
				}
			}), t.fn.extend({
				effect: function () {
					function i(e) {
						function i() {
							r.removeData(m), t.effects.cleanUp(r), "hide" === s.mode && r.hide(), a()
						}

						function a() {
							t.isFunction(l) && l.call(r[0]), t.isFunction(e) && e()
						}
						var r = t(this);
						s.mode = c.shift(), t.uiBackCompat === !1 || o ? "none" === s.mode ? (r[h](), a()) : n.call(r[0], s, i) : (r.is(":hidden") ? "hide" === h : "show" === h) ? (r[h](), a()) : n.call(r[0], s, a)
					}
					var s = e.apply(this, arguments),
						n = t.effects.effect[s.effect],
						o = n.mode,
						a = s.queue,
						r = a || "fx",
						l = s.complete,
						h = s.mode,
						c = [],
						u = function (e) {
							var i = t(this),
								s = t.effects.mode(i, h) || o;
							i.data(m, !0), c.push(s), o && ("show" === s || s === o && "hide" === s) && i.show(), o && "none" === s || t.effects.saveStyle(i), t.isFunction(e) && e()
						};
					return t.fx.off || !n ? h ? this[h](s.duration, l) : this.each(function () {
						l && l.call(this)
					}) : a === !1 ? this.each(u).each(i) : this.queue(r, u).queue(r, i)
				},
				show: function (t) {
					return function (s) {
						if (i(s)) return t.apply(this, arguments);
						var n = e.apply(this, arguments);
						return n.mode = "show", this.effect.call(this, n)
					}
				}(t.fn.show),
				hide: function (t) {
					return function (s) {
						if (i(s)) return t.apply(this, arguments);
						var n = e.apply(this, arguments);
						return n.mode = "hide", this.effect.call(this, n)
					}
				}(t.fn.hide),
				toggle: function (t) {
					return function (s) {
						if (i(s) || "boolean" == typeof s) return t.apply(this, arguments);
						var n = e.apply(this, arguments);
						return n.mode = "toggle", this.effect.call(this, n)
					}
				}(t.fn.toggle),
				cssUnit: function (e) {
					var i = this.css(e),
						s = [];
					return t.each(["em", "px", "%", "pt"], function (t, e) {
						i.indexOf(e) > 0 && (s = [parseFloat(i), e])
					}), s
				},
				cssClip: function (t) {
					return t ? this.css("clip", "rect(" + t.top + "px " + t.right + "px " + t.bottom + "px " + t.left + "px)") : s(this.css("clip"), this)
				},
				transfer: function (e, i) {
					var s = t(this),
						n = t(e.to),
						o = "fixed" === n.css("position"),
						a = t("body"),
						r = o ? a.scrollTop() : 0,
						l = o ? a.scrollLeft() : 0,
						h = n.offset(),
						c = {
							top: h.top - r,
							left: h.left - l,
							height: n.innerHeight(),
							width: n.innerWidth()
						},
						u = s.offset(),
						d = t("<div class='ui-effects-transfer'></div>").appendTo("body").addClass(e.className).css({
							top: u.top - r,
							left: u.left - l,
							height: s.innerHeight(),
							width: s.innerWidth(),
							position: o ? "fixed" : "absolute"
						}).animate(c, e.duration, e.easing, function () {
							d.remove(), t.isFunction(i) && i()
						})
				}
			}), t.fx.step.clip = function (e) {
				e.clipInit || (e.start = t(e.elem).cssClip(), "string" == typeof e.end && (e.end = s(e.end, e.elem)), e.clipInit = !0), t(e.elem).cssClip({
					top: e.pos * (e.end.top - e.start.top) + e.start.top,
					right: e.pos * (e.end.right - e.start.right) + e.start.right,
					bottom: e.pos * (e.end.bottom - e.start.bottom) + e.start.bottom,
					left: e.pos * (e.end.left - e.start.left) + e.start.left
				})
			}
		}(),
		function () {
			var e = {};
			t.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (t, i) {
				e[i] = function (e) {
					return Math.pow(e, t + 2)
				}
			}), t.extend(e, {
				Sine: function (t) {
					return 1 - Math.cos(t * Math.PI / 2)
				},
				Circ: function (t) {
					return 1 - Math.sqrt(1 - t * t)
				},
				Elastic: function (t) {
					return 0 === t || 1 === t ? t : -Math.pow(2, 8 * (t - 1)) * Math.sin((80 * (t - 1) - 7.5) * Math.PI / 15)
				},
				Back: function (t) {
					return t * t * (3 * t - 2)
				},
				Bounce: function (t) {
					for (var e, i = 4;
						((e = Math.pow(2, --i)) - 1) / 11 > t;);
					return 1 / Math.pow(4, 3 - i) - 7.5625 * Math.pow((3 * e - 2) / 22 - t, 2)
				}
			}), t.each(e, function (e, i) {
				t.easing["easeIn" + e] = i, t.easing["easeOut" + e] = function (t) {
					return 1 - i(1 - t)
				}, t.easing["easeInOut" + e] = function (t) {
					return .5 > t ? i(2 * t) / 2 : 1 - i(-2 * t + 2) / 2
				}
			})
		}();
	var v = t.effects;
	t.effects.define("blind", "hide", function (e, i) {
		var s = {
				up: ["bottom", "top"],
				vertical: ["bottom", "top"],
				down: ["top", "bottom"],
				left: ["right", "left"],
				horizontal: ["right", "left"],
				right: ["left", "right"]
			},
			n = t(this),
			o = e.direction || "up",
			a = n.cssClip(),
			r = {
				clip: t.extend({}, a)
			},
			l = t.effects.createPlaceholder(n);
		r.clip[s[o][0]] = r.clip[s[o][1]], "show" === e.mode && (n.cssClip(r.clip), l && l.css(t.effects.clipToBox(r)), r.clip = a), l && l.animate(t.effects.clipToBox(r), e.duration, e.easing), n.animate(r, {
			queue: !1,
			duration: e.duration,
			easing: e.easing,
			complete: i
		})
	}), t.effects.define("bounce", function (e, i) {
		var s, n, o, a = t(this),
			r = e.mode,
			l = "hide" === r,
			h = "show" === r,
			c = e.direction || "up",
			u = e.distance,
			d = e.times || 5,
			p = 2 * d + (h || l ? 1 : 0),
			f = e.duration / p,
			g = e.easing,
			m = "up" === c || "down" === c ? "top" : "left",
			_ = "up" === c || "left" === c,
			v = 0,
			b = a.queue().length;
		for (t.effects.createPlaceholder(a), o = a.css(m), u || (u = a["top" === m ? "outerHeight" : "outerWidth"]() / 3), h && (n = {
				opacity: 1
			}, n[m] = o, a.css("opacity", 0).css(m, _ ? 2 * -u : 2 * u).animate(n, f, g)), l && (u /= Math.pow(2, d - 1)), n = {}, n[m] = o; d > v; v++) s = {}, s[m] = (_ ? "-=" : "+=") + u, a.animate(s, f, g).animate(n, f, g), u = l ? 2 * u : u / 2;
		l && (s = {
			opacity: 0
		}, s[m] = (_ ? "-=" : "+=") + u, a.animate(s, f, g)), a.queue(i), t.effects.unshift(a, b, p + 1)
	}), t.effects.define("clip", "hide", function (e, i) {
		var s, n = {},
			o = t(this),
			a = e.direction || "vertical",
			r = "both" === a,
			l = r || "horizontal" === a,
			h = r || "vertical" === a;
		s = o.cssClip(), n.clip = {
			top: h ? (s.bottom - s.top) / 2 : s.top,
			right: l ? (s.right - s.left) / 2 : s.right,
			bottom: h ? (s.bottom - s.top) / 2 : s.bottom,
			left: l ? (s.right - s.left) / 2 : s.left
		}, t.effects.createPlaceholder(o), "show" === e.mode && (o.cssClip(n.clip), n.clip = s), o.animate(n, {
			queue: !1,
			duration: e.duration,
			easing: e.easing,
			complete: i
		})
	}), t.effects.define("drop", "hide", function (e, i) {
		var s, n = t(this),
			o = e.mode,
			a = "show" === o,
			r = e.direction || "left",
			l = "up" === r || "down" === r ? "top" : "left",
			h = "up" === r || "left" === r ? "-=" : "+=",
			c = "+=" === h ? "-=" : "+=",
			u = {
				opacity: 0
			};
		t.effects.createPlaceholder(n), s = e.distance || n["top" === l ? "outerHeight" : "outerWidth"](!0) / 2, u[l] = h + s, a && (n.css(u), u[l] = c + s, u.opacity = 1), n.animate(u, {
			queue: !1,
			duration: e.duration,
			easing: e.easing,
			complete: i
		})
	}), t.effects.define("explode", "hide", function (e, i) {
		function s() {
			b.push(this), b.length === u * d && n()
		}

		function n() {
			p.css({
				visibility: "visible"
			}), t(b).remove(), i()
		}
		var o, a, r, l, h, c, u = e.pieces ? Math.round(Math.sqrt(e.pieces)) : 3,
			d = u,
			p = t(this),
			f = e.mode,
			g = "show" === f,
			m = p.show().css("visibility", "hidden").offset(),
			_ = Math.ceil(p.outerWidth() / d),
			v = Math.ceil(p.outerHeight() / u),
			b = [];
		for (o = 0; u > o; o++)
			for (l = m.top + o * v, c = o - (u - 1) / 2, a = 0; d > a; a++) r = m.left + a * _, h = a - (d - 1) / 2, p.clone().appendTo("body").wrap("<div></div>").css({
				position: "absolute",
				visibility: "visible",
				left: -a * _,
				top: -o * v
			}).parent().addClass("ui-effects-explode").css({
				position: "absolute",
				overflow: "hidden",
				width: _,
				height: v,
				left: r + (g ? h * _ : 0),
				top: l + (g ? c * v : 0),
				opacity: g ? 0 : 1
			}).animate({
				left: r + (g ? 0 : h * _),
				top: l + (g ? 0 : c * v),
				opacity: g ? 1 : 0
			}, e.duration || 500, e.easing, s)
	}), t.effects.define("fade", "toggle", function (e, i) {
		var s = "show" === e.mode;
		t(this).css("opacity", s ? 0 : 1).animate({
			opacity: s ? 1 : 0
		}, {
			queue: !1,
			duration: e.duration,
			easing: e.easing,
			complete: i
		})
	}), t.effects.define("fold", "hide", function (e, i) {
		var s = t(this),
			n = e.mode,
			o = "show" === n,
			a = "hide" === n,
			r = e.size || 15,
			l = /([0-9]+)%/.exec(r),
			h = !!e.horizFirst,
			c = h ? ["right", "bottom"] : ["bottom", "right"],
			u = e.duration / 2,
			d = t.effects.createPlaceholder(s),
			p = s.cssClip(),
			f = {
				clip: t.extend({}, p)
			},
			g = {
				clip: t.extend({}, p)
			},
			m = [p[c[0]], p[c[1]]],
			_ = s.queue().length;
		l && (r = parseInt(l[1], 10) / 100 * m[a ? 0 : 1]), f.clip[c[0]] = r, g.clip[c[0]] = r, g.clip[c[1]] = 0, o && (s.cssClip(g.clip), d && d.css(t.effects.clipToBox(g)), g.clip = p), s.queue(function (i) {
			d && d.animate(t.effects.clipToBox(f), u, e.easing).animate(t.effects.clipToBox(g), u, e.easing), i()
		}).animate(f, u, e.easing).animate(g, u, e.easing).queue(i), t.effects.unshift(s, _, 4)
	}), t.effects.define("highlight", "show", function (e, i) {
		var s = t(this),
			n = {
				backgroundColor: s.css("backgroundColor")
			};
		"hide" === e.mode && (n.opacity = 0), t.effects.saveStyle(s), s.css({
			backgroundImage: "none",
			backgroundColor: e.color || "#ffff99"
		}).animate(n, {
			queue: !1,
			duration: e.duration,
			easing: e.easing,
			complete: i
		})
	}), t.effects.define("size", function (e, i) {
		var s, n, o, a = t(this),
			r = ["fontSize"],
			l = ["borderTopWidth", "borderBottomWidth", "paddingTop", "paddingBottom"],
			h = ["borderLeftWidth", "borderRightWidth", "paddingLeft", "paddingRight"],
			c = e.mode,
			u = "effect" !== c,
			d = e.scale || "both",
			p = e.origin || ["middle", "center"],
			f = a.css("position"),
			g = a.position(),
			m = t.effects.scaledDimensions(a),
			_ = e.from || m,
			v = e.to || t.effects.scaledDimensions(a, 0);
		t.effects.createPlaceholder(a), "show" === c && (o = _, _ = v, v = o), n = {
			from: {
				y: _.height / m.height,
				x: _.width / m.width
			},
			to: {
				y: v.height / m.height,
				x: v.width / m.width
			}
		}, ("box" === d || "both" === d) && (n.from.y !== n.to.y && (_ = t.effects.setTransition(a, l, n.from.y, _), v = t.effects.setTransition(a, l, n.to.y, v)), n.from.x !== n.to.x && (_ = t.effects.setTransition(a, h, n.from.x, _), v = t.effects.setTransition(a, h, n.to.x, v))), ("content" === d || "both" === d) && n.from.y !== n.to.y && (_ = t.effects.setTransition(a, r, n.from.y, _), v = t.effects.setTransition(a, r, n.to.y, v)), p && (s = t.effects.getBaseline(p, m), _.top = (m.outerHeight - _.outerHeight) * s.y + g.top, _.left = (m.outerWidth - _.outerWidth) * s.x + g.left, v.top = (m.outerHeight - v.outerHeight) * s.y + g.top, v.left = (m.outerWidth - v.outerWidth) * s.x + g.left), a.css(_), ("content" === d || "both" === d) && (l = l.concat(["marginTop", "marginBottom"]).concat(r), h = h.concat(["marginLeft", "marginRight"]), a.find("*[width]").each(function () {
			var i = t(this),
				s = t.effects.scaledDimensions(i),
				o = {
					height: s.height * n.from.y,
					width: s.width * n.from.x,
					outerHeight: s.outerHeight * n.from.y,
					outerWidth: s.outerWidth * n.from.x
				},
				a = {
					height: s.height * n.to.y,
					width: s.width * n.to.x,
					outerHeight: s.height * n.to.y,
					outerWidth: s.width * n.to.x
				};
			n.from.y !== n.to.y && (o = t.effects.setTransition(i, l, n.from.y, o), a = t.effects.setTransition(i, l, n.to.y, a)), n.from.x !== n.to.x && (o = t.effects.setTransition(i, h, n.from.x, o), a = t.effects.setTransition(i, h, n.to.x, a)), u && t.effects.saveStyle(i), i.css(o), i.animate(a, e.duration, e.easing, function () {
				u && t.effects.restoreStyle(i)
			})
		})), a.animate(v, {
			queue: !1,
			duration: e.duration,
			easing: e.easing,
			complete: function () {
				var e = a.offset();
				0 === v.opacity && a.css("opacity", _.opacity), u || (a.css("position", "static" === f ? "relative" : f).offset(e), t.effects.saveStyle(a)), i()
			}
		})
	}), t.effects.define("scale", function (e, i) {
		var s = t(this),
			n = e.mode,
			o = parseInt(e.percent, 10) || (0 === parseInt(e.percent, 10) ? 0 : "effect" !== n ? 0 : 100),
			a = t.extend(!0, {
				from: t.effects.scaledDimensions(s),
				to: t.effects.scaledDimensions(s, o, e.direction || "both"),
				origin: e.origin || ["middle", "center"]
			}, e);
		e.fade && (a.from.opacity = 1, a.to.opacity = 0), t.effects.effect.size.call(this, a, i)
	}), t.effects.define("puff", "hide", function (e, i) {
		var s = t.extend(!0, {}, e, {
			fade: !0,
			percent: parseInt(e.percent, 10) || 150
		});
		t.effects.effect.scale.call(this, s, i)
	}), t.effects.define("pulsate", "show", function (e, i) {
		var s = t(this),
			n = e.mode,
			o = "show" === n,
			a = "hide" === n,
			r = o || a,
			l = 2 * (e.times || 5) + (r ? 1 : 0),
			h = e.duration / l,
			c = 0,
			u = 1,
			d = s.queue().length;
		for ((o || !s.is(":visible")) && (s.css("opacity", 0).show(), c = 1); l > u; u++) s.animate({
			opacity: c
		}, h, e.easing), c = 1 - c;
		s.animate({
			opacity: c
		}, h, e.easing), s.queue(i), t.effects.unshift(s, d, l + 1)
	}), t.effects.define("shake", function (e, i) {
		var s = 1,
			n = t(this),
			o = e.direction || "left",
			a = e.distance || 20,
			r = e.times || 3,
			l = 2 * r + 1,
			h = Math.round(e.duration / l),
			c = "up" === o || "down" === o ? "top" : "left",
			u = "up" === o || "left" === o,
			d = {},
			p = {},
			f = {},
			g = n.queue().length;
		for (t.effects.createPlaceholder(n), d[c] = (u ? "-=" : "+=") + a, p[c] = (u ? "+=" : "-=") + 2 * a, f[c] = (u ? "-=" : "+=") + 2 * a, n.animate(d, h, e.easing); r > s; s++) n.animate(p, h, e.easing).animate(f, h, e.easing);
		n.animate(p, h, e.easing).animate(d, h / 2, e.easing).queue(i), t.effects.unshift(n, g, l + 1)
	}), t.effects.define("slide", "show", function (e, i) {
		var s, n, o = t(this),
			a = {
				up: ["bottom", "top"],
				down: ["top", "bottom"],
				left: ["right", "left"],
				right: ["left", "right"]
			},
			r = e.mode,
			l = e.direction || "left",
			h = "up" === l || "down" === l ? "top" : "left",
			c = "up" === l || "left" === l,
			u = e.distance || o["top" === h ? "outerHeight" : "outerWidth"](!0),
			d = {};
		t.effects.createPlaceholder(o), s = o.cssClip(), n = o.position()[h], d[h] = (c ? -1 : 1) * u + n, d.clip = o.cssClip(), d.clip[a[l][1]] = d.clip[a[l][0]], "show" === r && (o.cssClip(d.clip), o.css(h, d[h]), d.clip = s, d[h] = n), o.animate(d, {
			queue: !1,
			duration: e.duration,
			easing: e.easing,
			complete: i
		})
	});
	var v;
	t.uiBackCompat !== !1 && (v = t.effects.define("transfer", function (e, i) {
		t(this).transfer(e, i)
	}))
});
! function (a) {
	function b() {
		var a = location.href;
		return hashtag = a.indexOf("#prettyPhoto") !== -1 && decodeURI(a.substring(a.indexOf("#prettyPhoto") + 1, a.length)), hashtag && (hashtag = hashtag.replace(/<|>/g, "")), hashtag
	}

	function c() {
		"undefined" != typeof theRel && (location.hash = theRel + "/" + rel_index + "/")
	}

	function d() {
		location.href.indexOf("#prettyPhoto") !== -1 && (location.hash = "prettyPhoto")
	}

	function e(a, b) {
		a = a.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var c = "[\\?&]" + a + "=([^&#]*)",
			d = new RegExp(c),
			e = d.exec(b);
		return null == e ? "" : e[1]
	}
	a.prettyPhoto = {
		version: "3.1.6"
	}, a.fn.prettyPhoto = function (f) {
		function g() {
			a(".pp_loaderIcon").hide(), projectedTop = scroll_pos.scrollTop + (A / 2 - r.containerHeight / 2), projectedTop < 0 && (projectedTop = 0), $ppt.fadeTo(settings.animation_speed, 1), $pp_pic_holder.find(".pp_content").animate({
				height: r.contentHeight,
				width: r.contentWidth
			}, settings.animation_speed), $pp_pic_holder.animate({
				top: projectedTop,
				left: B / 2 - r.containerWidth / 2 < 0 ? 0 : B / 2 - r.containerWidth / 2,
				width: r.containerWidth
			}, settings.animation_speed, function () {
				$pp_pic_holder.find(".pp_hoverContainer,#fullResImage").height(r.height).width(r.width), $pp_pic_holder.find(".pp_fade").fadeIn(settings.animation_speed), isSet && "image" == l(pp_images[set_position]) ? $pp_pic_holder.find(".pp_hoverContainer").show() : $pp_pic_holder.find(".pp_hoverContainer").hide(), settings.allow_expand && (r.resized ? a("a.pp_expand,a.pp_contract").show() : a("a.pp_expand").hide()), !settings.autoplay_slideshow || x || s || a.prettyPhoto.startSlideshow(), settings.changepicturecallback(), s = !0
			}), p(), f.ajaxcallback()
		}

		function h(b) {
			$pp_pic_holder.find("#pp_full_res object,#pp_full_res embed").css("visibility", "hidden"), $pp_pic_holder.find(".pp_fade").fadeOut(settings.animation_speed, function () {
				a(".pp_loaderIcon").show(), b()
			})
		}

		function i(b) {
			b > 1 ? a(".pp_nav").show() : a(".pp_nav").hide()
		}

		function j(a, b) {
			if (resized = !1, k(a, b), imageWidth = a, imageHeight = b, (w > B || v > A) && doresize && settings.allow_resize && !z) {
				for (resized = !0, fitting = !1; !fitting;) w > B ? (imageWidth = B - 200, imageHeight = b / a * imageWidth) : v > A ? (imageHeight = A - 200, imageWidth = a / b * imageHeight) : fitting = !0, v = imageHeight, w = imageWidth;
				(w > B || v > A) && j(w, v), k(imageWidth, imageHeight)
			}
			return {
				width: Math.floor(imageWidth),
				height: Math.floor(imageHeight),
				containerHeight: Math.floor(v),
				containerWidth: Math.floor(w) + 2 * settings.horizontal_padding,
				contentHeight: Math.floor(t),
				contentWidth: Math.floor(u),
				resized: resized
			}
		}

		function k(b, c) {
			b = parseFloat(b), c = parseFloat(c), $pp_details = $pp_pic_holder.find(".pp_details"), $pp_details.width(b), detailsHeight = parseFloat($pp_details.css("marginTop")) + parseFloat($pp_details.css("marginBottom")), $pp_details = $pp_details.clone().addClass(settings.theme).width(b).appendTo(a("body")).css({
				position: "absolute",
				top: -1e4
			}), detailsHeight += $pp_details.height(), detailsHeight = detailsHeight <= 34 ? 36 : detailsHeight, $pp_details.remove(), $pp_title = $pp_pic_holder.find(".ppt"), $pp_title.width(b), titleHeight = parseFloat($pp_title.css("marginTop")) + parseFloat($pp_title.css("marginBottom")), $pp_title = $pp_title.clone().appendTo(a("body")).css({
				position: "absolute",
				top: -1e4
			}), titleHeight += $pp_title.height(), $pp_title.remove(), t = c + detailsHeight, u = b, v = t + titleHeight + $pp_pic_holder.find(".pp_top").height() + $pp_pic_holder.find(".pp_bottom").height(), w = b
		}

		function l(a) {
			return a.match(/youtube\.com\/watch/i) || a.match(/youtu\.be/i) ? "youtube" : a.match(/vimeo\.com/i) ? "vimeo" : a.match(/\b.mov\b/i) ? "quicktime" : a.match(/\b.swf\b/i) ? "flash" : a.match(/\biframe=true\b/i) ? "iframe" : a.match(/\bajax=true\b/i) ? "ajax" : a.match(/\bcustom=true\b/i) ? "custom" : "#" == a.substr(0, 1) ? "inline" : "image"
		}

		function m() {
			if (doresize && "undefined" != typeof $pp_pic_holder) {
				if (scroll_pos = n(), contentHeight = $pp_pic_holder.height(), contentwidth = $pp_pic_holder.width(), projectedTop = A / 2 + scroll_pos.scrollTop - contentHeight / 2, projectedTop < 0 && (projectedTop = 0), contentHeight > A) return;
				$pp_pic_holder.css({
					top: projectedTop,
					left: B / 2 + scroll_pos.scrollLeft - contentwidth / 2
				})
			}
		}

		function n() {
			return self.pageYOffset ? {
				scrollTop: self.pageYOffset,
				scrollLeft: self.pageXOffset
			} : document.documentElement && document.documentElement.scrollTop ? {
				scrollTop: document.documentElement.scrollTop,
				scrollLeft: document.documentElement.scrollLeft
			} : document.body ? {
				scrollTop: document.body.scrollTop,
				scrollLeft: document.body.scrollLeft
			} : void 0
		}

		function o() {
			A = a(window).height(), B = a(window).width(), "undefined" != typeof $pp_overlay && $pp_overlay.height(a(document).height()).width(B)
		}

		function p() {
			isSet && settings.overlay_gallery && "image" == l(pp_images[set_position]) ? (itemWidth = 57, navWidth = "facebook" == settings.theme || "pp_default" == settings.theme ? 50 : 30, itemsPerPage = Math.floor((r.containerWidth - 100 - navWidth) / itemWidth), itemsPerPage = itemsPerPage < pp_images.length ? itemsPerPage : pp_images.length, totalPage = Math.ceil(pp_images.length / itemsPerPage) - 1, 0 == totalPage ? (navWidth = 0, $pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").hide()) : $pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").show(), galleryWidth = itemsPerPage * itemWidth, fullGalleryWidth = pp_images.length * itemWidth, $pp_gallery.css("margin-left", -(galleryWidth / 2 + navWidth / 2)).find("div:first").width(galleryWidth + 5).find("ul").width(fullGalleryWidth).find("li.selected").removeClass("selected"), goToPage = Math.floor(set_position / itemsPerPage) < totalPage ? Math.floor(set_position / itemsPerPage) : totalPage, a.prettyPhoto.changeGalleryPage(goToPage), $pp_gallery_li.filter(":eq(" + set_position + ")").addClass("selected")) : $pp_pic_holder.find(".pp_content").unbind("mouseenter mouseleave")
		}

		function q(b) {
			if (settings.social_tools && (facebook_like_link = settings.social_tools.replace("{location_href}", encodeURIComponent(location.href))), settings.markup = settings.markup.replace("{pp_social}", ""), a("body").append(settings.markup), $pp_pic_holder = a(".pp_pic_holder"), $ppt = a(".ppt"), $pp_overlay = a("div.pp_overlay"), isSet && settings.overlay_gallery) {
				currentGalleryPage = 0, toInject = "";
				for (var c = 0; c < pp_images.length; c++) pp_images[c].match(/\b(jpg|jpeg|png|gif)\b/gi) ? (classname = "", img_src = pp_images[c]) : (classname = "default", img_src = ""), toInject += "<li class='" + classname + "'><a href='#'><img src='" + img_src + "' width='50' alt='' /></a></li>";
				toInject = settings.gallery_markup.replace(/{gallery}/g, toInject), $pp_pic_holder.find("#pp_full_res").after(toInject), $pp_gallery = a(".pp_pic_holder .pp_gallery"), $pp_gallery_li = $pp_gallery.find("li"), $pp_gallery.find(".pp_arrow_next").click(function () {
					return a.prettyPhoto.changeGalleryPage("next"), a.prettyPhoto.stopSlideshow(), !1
				}), $pp_gallery.find(".pp_arrow_previous").click(function () {
					return a.prettyPhoto.changeGalleryPage("previous"), a.prettyPhoto.stopSlideshow(), !1
				}), $pp_pic_holder.find(".pp_content").hover(function () {
					$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeIn()
				}, function () {
					$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeOut()
				}), itemWidth = 57, $pp_gallery_li.each(function (b) {
					a(this).find("a").click(function () {
						return a.prettyPhoto.changePage(b), a.prettyPhoto.stopSlideshow(), !1
					})
				})
			}
			settings.slideshow && ($pp_pic_holder.find(".pp_nav").prepend('<a href="#" class="pp_play">Play</a>'), $pp_pic_holder.find(".pp_nav .pp_play").click(function () {
				return a.prettyPhoto.startSlideshow(), !1
			})), $pp_pic_holder.attr("class", "pp_pic_holder " + settings.theme), $pp_overlay.css({
				opacity: 0,
				height: a(document).height(),
				width: a(window).width()
			}).bind("click", function () {
				settings.modal || a.prettyPhoto.close()
			}), a("a.pp_close").bind("click", function () {
				return a.prettyPhoto.close(), !1
			}), settings.allow_expand && a("a.pp_expand").bind("click", function (b) {
				return a(this).hasClass("pp_expand") ? (a(this).removeClass("pp_expand").addClass("pp_contract"), doresize = !1) : (a(this).removeClass("pp_contract").addClass("pp_expand"), doresize = !0), h(function () {
					a.prettyPhoto.open()
				}), !1
			}), $pp_pic_holder.find(".pp_previous, .pp_nav .pp_arrow_previous").bind("click", function () {
				return a.prettyPhoto.changePage("previous"), a.prettyPhoto.stopSlideshow(), !1
			}), $pp_pic_holder.find(".pp_next, .pp_nav .pp_arrow_next").bind("click", function () {
				return a.prettyPhoto.changePage("next"), a.prettyPhoto.stopSlideshow(), !1
			}), m()
		}
		f = jQuery.extend({
			hook: "rel",
			animation_speed: "fast",
			ajaxcallback: function () {},
			slideshow: 5e3,
			autoplay_slideshow: !1,
			opacity: .8,
			show_title: !0,
			allow_resize: !0,
			allow_expand: !0,
			default_width: 500,
			default_height: 344,
			counter_separator_label: "/",
			theme: "pp_default",
			horizontal_padding: 20,
			hideflash: !1,
			wmode: "opaque",
			autoplay: !0,
			modal: !1,
			deeplinking: !0,
			overlay_gallery: !0,
			overlay_gallery_max: 30,
			keyboard_shortcuts: !0,
			changepicturecallback: function () {},
			callback: function () {},
			ie6_fallback: !0,
			markup: '<div class="pp_pic_holder"> \t\t\t\t\t\t<div class="ppt">&nbsp;</div> \t\t\t\t\t\t<div class="pp_top"> \t\t\t\t\t\t\t<div class="pp_left"></div> \t\t\t\t\t\t\t<div class="pp_middle"></div> \t\t\t\t\t\t\t<div class="pp_right"></div> \t\t\t\t\t\t</div> \t\t\t\t\t\t<div class="pp_content_container"> \t\t\t\t\t\t\t<div class="pp_left"> \t\t\t\t\t\t\t<div class="pp_right"> \t\t\t\t\t\t\t\t<div class="pp_content"> \t\t\t\t\t\t\t\t\t<div class="pp_loaderIcon"></div> \t\t\t\t\t\t\t\t\t<div class="pp_fade"> \t\t\t\t\t\t\t\t\t\t<a href="#" class="pp_expand" title="Expand the image">Expand</a> \t\t\t\t\t\t\t\t\t\t<div class="pp_hoverContainer"> \t\t\t\t\t\t\t\t\t\t\t<a class="pp_next" href="#">next</a> \t\t\t\t\t\t\t\t\t\t\t<a class="pp_previous" href="#">previous</a> \t\t\t\t\t\t\t\t\t\t</div> \t\t\t\t\t\t\t\t\t\t<div id="pp_full_res"></div> \t\t\t\t\t\t\t\t\t\t<div class="pp_details"> \t\t\t\t\t\t\t\t\t\t\t<div class="pp_nav"> \t\t\t\t\t\t\t\t\t\t\t\t<a href="#" class="pp_arrow_previous">Previous</a> \t\t\t\t\t\t\t\t\t\t\t\t<p class="currentTextHolder">0/0</p> \t\t\t\t\t\t\t\t\t\t\t\t<a href="#" class="pp_arrow_next">Next</a> \t\t\t\t\t\t\t\t\t\t\t</div> \t\t\t\t\t\t\t\t\t\t\t<p class="pp_description"></p> \t\t\t\t\t\t\t\t\t\t\t<div class="pp_social">{pp_social}</div> \t\t\t\t\t\t\t\t\t\t\t<a class="pp_close" href="#">Close</a> \t\t\t\t\t\t\t\t\t\t</div> \t\t\t\t\t\t\t\t\t</div> \t\t\t\t\t\t\t\t</div> \t\t\t\t\t\t\t</div> \t\t\t\t\t\t\t</div> \t\t\t\t\t\t</div> \t\t\t\t\t\t<div class="pp_bottom"> \t\t\t\t\t\t\t<div class="pp_left"></div> \t\t\t\t\t\t\t<div class="pp_middle"></div> \t\t\t\t\t\t\t<div class="pp_right"></div> \t\t\t\t\t\t</div> \t\t\t\t\t</div> \t\t\t\t\t<div class="pp_overlay"></div>',
			gallery_markup: '<div class="pp_gallery"> \t\t\t\t\t\t\t\t<a href="#" class="pp_arrow_previous">Previous</a> \t\t\t\t\t\t\t\t<div> \t\t\t\t\t\t\t\t\t<ul> \t\t\t\t\t\t\t\t\t\t{gallery} \t\t\t\t\t\t\t\t\t</ul> \t\t\t\t\t\t\t\t</div> \t\t\t\t\t\t\t\t<a href="#" class="pp_arrow_next">Next</a> \t\t\t\t\t\t\t</div>',
			image_markup: '<img id="fullResImage" src="{path}" />',
			flash_markup: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',
			quicktime_markup: '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',
			iframe_markup: '<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',
			inline_markup: '<div class="pp_inline">{content}</div>',
			custom_markup: "",
			social_tools: '<div class="twitter"><a href="//twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="//platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href={location_href}&amp;layout=button_count&amp;show_faces=true&amp;width=500&amp;action=like&amp;font&amp;colorscheme=light&amp;height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div>'
		}, f);
		var r, s, t, u, v, w, x, y = this,
			z = !1,
			A = a(window).height(),
			B = a(window).width();
		return doresize = !0, scroll_pos = n(), a(window).unbind("resize.prettyphoto").bind("resize.prettyphoto", function () {
			m(), o()
		}), f.keyboard_shortcuts && a(document).unbind("keydown.prettyphoto").bind("keydown.prettyphoto", function (b) {
			if ("undefined" != typeof $pp_pic_holder && $pp_pic_holder.is(":visible")) switch (b.keyCode) {
				case 37:
					a.prettyPhoto.changePage("previous"), b.preventDefault();
					break;
				case 39:
					a.prettyPhoto.changePage("next"), b.preventDefault();
					break;
				case 27:
					settings.modal || a.prettyPhoto.close(), b.preventDefault()
			}
		}), a.prettyPhoto.initialize = function () {
			return settings = f, "pp_default" == settings.theme && (settings.horizontal_padding = 16), theRel = a(this).attr(settings.hook), galleryRegExp = /\[(?:.*)\]/, isSet = !!galleryRegExp.exec(theRel), pp_images = isSet ? jQuery.map(y, function (b, c) {
				if (a(b).attr(settings.hook).indexOf(theRel) != -1) return a(b).attr("href")
			}) : a.makeArray(a(this).attr("href")), pp_titles = isSet ? jQuery.map(y, function (b, c) {
				if (a(b).attr(settings.hook).indexOf(theRel) != -1) return a(b).find("img").attr("alt") ? a(b).find("img").attr("alt") : ""
			}) : a.makeArray(a(this).find("img").attr("alt")), pp_descriptions = isSet ? jQuery.map(y, function (b, c) {
				if (a(b).attr(settings.hook).indexOf(theRel) != -1) return a(b).attr("title") ? a(b).attr("title") : ""
			}) : a.makeArray(a(this).attr("title")), pp_images.length > settings.overlay_gallery_max && (settings.overlay_gallery = !1), set_position = jQuery.inArray(a(this).attr("href"), pp_images), rel_index = isSet ? set_position : a("a[" + settings.hook + "^='" + theRel + "']").index(a(this)), q(this), settings.allow_resize && a(window).bind("scroll.prettyphoto", function () {
				m()
			}), a.prettyPhoto.open(), !1
		}, a.prettyPhoto.open = function (b) {
			return "undefined" == typeof settings && (settings = f, pp_images = a.makeArray(arguments[0]), pp_titles = arguments[1] ? a.makeArray(arguments[1]) : a.makeArray(""), pp_descriptions = arguments[2] ? a.makeArray(arguments[2]) : a.makeArray(""), isSet = pp_images.length > 1, set_position = arguments[3] ? arguments[3] : 0, q(b.target)), settings.hideflash && a("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility", "hidden"), i(a(pp_images).length), a(".pp_loaderIcon").show(), settings.deeplinking && c(), settings.social_tools && (facebook_like_link = settings.social_tools.replace("{location_href}", encodeURIComponent(location.href)), $pp_pic_holder.find(".pp_social").html(facebook_like_link)), $ppt.is(":hidden") && $ppt.css("opacity", 0).show(), $pp_overlay.show().fadeTo(settings.animation_speed, settings.opacity), $pp_pic_holder.find(".currentTextHolder").text(set_position + 1 + settings.counter_separator_label + a(pp_images).length), "undefined" != typeof pp_descriptions[set_position] && "" != pp_descriptions[set_position] ? $pp_pic_holder.find(".pp_description").show().html(unescape(pp_descriptions[set_position])) : $pp_pic_holder.find(".pp_description").hide(), movie_width = parseFloat(e("width", pp_images[set_position])) ? e("width", pp_images[set_position]) : settings.default_width.toString(), movie_height = parseFloat(e("height", pp_images[set_position])) ? e("height", pp_images[set_position]) : settings.default_height.toString(), z = !1, movie_height.indexOf("%") != -1 && (movie_height = parseFloat(a(window).height() * parseFloat(movie_height) / 100 - 150), z = !0), movie_width.indexOf("%") != -1 && (movie_width = parseFloat(a(window).width() * parseFloat(movie_width) / 100 - 150), z = !0), $pp_pic_holder.fadeIn(function () {
				switch (settings.show_title && "" != pp_titles[set_position] && "undefined" != typeof pp_titles[set_position] ? $ppt.html(unescape(pp_titles[set_position])) : $ppt.html("&nbsp;"), imgPreloader = "", skipInjection = !1, l(pp_images[set_position])) {
					case "image":
						imgPreloader = new Image, nextImage = new Image, isSet && set_position < a(pp_images).length - 1 && (nextImage.src = pp_images[set_position + 1]), prevImage = new Image, isSet && pp_images[set_position - 1] && (prevImage.src = pp_images[set_position - 1]), $pp_pic_holder.find("#pp_full_res")[0].innerHTML = settings.image_markup.replace(/{path}/g, pp_images[set_position]), imgPreloader.onload = function () {
							r = j(imgPreloader.width, imgPreloader.height), g()
						}, imgPreloader.onerror = function () {
							alert("Image cannot be loaded. Make sure the path is correct and image exist."), a.prettyPhoto.close()
						}, imgPreloader.src = pp_images[set_position];
						break;
					case "youtube":
						r = j(movie_width, movie_height), movie_id = e("v", pp_images[set_position]), "" == movie_id && (movie_id = pp_images[set_position].split("youtu.be/"), movie_id = movie_id[1], movie_id.indexOf("?") > 0 && (movie_id = movie_id.substr(0, movie_id.indexOf("?"))), movie_id.indexOf("&") > 0 && (movie_id = movie_id.substr(0, movie_id.indexOf("&")))), movie = "//www.youtube.com/embed/" + movie_id, e("rel", pp_images[set_position]) ? movie += "?rel=" + e("rel", pp_images[set_position]) : movie += "?rel=1", settings.autoplay && (movie += "&autoplay=1"), toInject = settings.iframe_markup.replace(/{width}/g, r.width).replace(/{height}/g, r.height).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, movie);
						break;
					case "vimeo":
						r = j(movie_width, movie_height), movie_id = pp_images[set_position];
						var b = /http(s?):\/\/(www\.)?vimeo.com\/(\d+)/,
							c = movie_id.match(b);
						movie = "//player.vimeo.com/video/" + c[3] + "?title=0&amp;byline=0&amp;portrait=0", settings.autoplay && (movie += "&autoplay=1;"), vimeo_width = r.width + "/embed/?moog_width=" + r.width, toInject = settings.iframe_markup.replace(/{width}/g, vimeo_width).replace(/{height}/g, r.height).replace(/{path}/g, movie);
						break;
					case "quicktime":
						r = j(movie_width, movie_height), r.height += 15, r.contentHeight += 15, r.containerHeight += 15, toInject = settings.quicktime_markup.replace(/{width}/g, r.width).replace(/{height}/g, r.height).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, pp_images[set_position]).replace(/{autoplay}/g, settings.autoplay);
						break;
					case "flash":
						r = j(movie_width, movie_height), flash_vars = pp_images[set_position], flash_vars = flash_vars.substring(pp_images[set_position].indexOf("flashvars") + 10, pp_images[set_position].length), filename = pp_images[set_position], filename = filename.substring(0, filename.indexOf("?")), toInject = settings.flash_markup.replace(/{width}/g, r.width).replace(/{height}/g, r.height).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, filename + "?" + flash_vars);
						break;
					case "iframe":
						r = j(movie_width, movie_height), frame_url = pp_images[set_position], frame_url = frame_url.substr(0, frame_url.indexOf("iframe") - 1), toInject = settings.iframe_markup.replace(/{width}/g, r.width).replace(/{height}/g, r.height).replace(/{path}/g, frame_url);
						break;
					case "ajax":
						doresize = !1, r = j(movie_width, movie_height), doresize = !0, skipInjection = !0, a.get(pp_images[set_position], function (a) {
							toInject = settings.inline_markup.replace(/{content}/g, a), $pp_pic_holder.find("#pp_full_res")[0].innerHTML = toInject, g()
						});
						break;
					case "custom":
						r = j(movie_width, movie_height), toInject = settings.custom_markup;
						break;
					case "inline":
						myClone = a(pp_images[set_position]).clone().append('<br clear="all" />').css({
							width: settings.default_width
						}).wrapInner('<div id="pp_full_res"><div class="pp_inline"></div></div>').appendTo(a("body")).show(), doresize = !1, r = j(a(myClone).width(), a(myClone).height()), doresize = !0, a(myClone).remove(), toInject = settings.inline_markup.replace(/{content}/g, a(pp_images[set_position]).html())
				}
				imgPreloader || skipInjection || ($pp_pic_holder.find("#pp_full_res")[0].innerHTML = toInject, g())
			}), !1
		}, a.prettyPhoto.changePage = function (b) {
			currentGalleryPage = 0, "previous" == b ? (set_position--, set_position < 0 && (set_position = a(pp_images).length - 1)) : "next" == b ? (set_position++, set_position > a(pp_images).length - 1 && (set_position = 0)) : set_position = b, rel_index = set_position, doresize || (doresize = !0), settings.allow_expand && a(".pp_contract").removeClass("pp_contract").addClass("pp_expand"), h(function () {
				a.prettyPhoto.open()
			})
		}, a.prettyPhoto.changeGalleryPage = function (a) {
			"next" == a ? (currentGalleryPage++, currentGalleryPage > totalPage && (currentGalleryPage = 0)) : "previous" == a ? (currentGalleryPage--, currentGalleryPage < 0 && (currentGalleryPage = totalPage)) : currentGalleryPage = a, slide_speed = "next" == a || "previous" == a ? settings.animation_speed : 0, slide_to = currentGalleryPage * (itemsPerPage * itemWidth), $pp_gallery.find("ul").animate({
				left: -slide_to
			}, slide_speed)
		}, a.prettyPhoto.startSlideshow = function () {
			"undefined" == typeof x ? ($pp_pic_holder.find(".pp_play").unbind("click").removeClass("pp_play").addClass("pp_pause").click(function () {
				return a.prettyPhoto.stopSlideshow(), !1
			}), x = setInterval(a.prettyPhoto.startSlideshow, settings.slideshow)) : a.prettyPhoto.changePage("next")
		}, a.prettyPhoto.stopSlideshow = function () {
			$pp_pic_holder.find(".pp_pause").unbind("click").removeClass("pp_pause").addClass("pp_play").click(function () {
				return a.prettyPhoto.startSlideshow(), !1
			}), clearInterval(x), x = void 0
		}, a.prettyPhoto.close = function () {
			$pp_overlay.is(":animated") || (a.prettyPhoto.stopSlideshow(), $pp_pic_holder.stop().find("object,embed").css("visibility", "hidden"), a("div.pp_pic_holder,div.ppt,.pp_fade").fadeOut(settings.animation_speed, function () {
				a(this).remove()
			}), $pp_overlay.fadeOut(settings.animation_speed, function () {
				settings.hideflash && a("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility", "visible"), a(this).remove(), a(window).unbind("scroll.prettyphoto"), d(), settings.callback(), doresize = !0, s = !1, delete settings
			}))
		}, !pp_alreadyInitialized && b() && (pp_alreadyInitialized = !0, hashIndex = b(), hashRel = hashIndex, hashIndex = hashIndex.substring(hashIndex.indexOf("/") + 1, hashIndex.length - 1), hashRel = hashRel.substring(0, hashRel.indexOf("/")), setTimeout(function () {
			a("a[" + f.hook + "^='" + hashRel + "']:eq(" + hashIndex + ")").trigger("click")
		}, 50)), this.unbind("click.prettyphoto").bind("click.prettyphoto", a.prettyPhoto.initialize)
	}
}(jQuery);
var pp_alreadyInitialized = !1;
/**
 * Owl Carousel v2.2.1
 * Copyright 2013-2017 David Deutsch
 * Licensed under  ()
 */
! function (a, b, c, d) {
	function e(b, c) {
		this.settings = null, this.options = a.extend({}, e.Defaults, c), this.$element = a(b), this._handlers = {}, this._plugins = {}, this._supress = {}, this._current = null, this._speed = null, this._coordinates = [], this._breakpoint = null, this._width = null, this._items = [], this._clones = [], this._mergers = [], this._widths = [], this._invalidated = {}, this._pipe = [], this._drag = {
			time: null,
			target: null,
			pointer: null,
			stage: {
				start: null,
				current: null
			},
			direction: null
		}, this._states = {
			current: {},
			tags: {
				initializing: ["busy"],
				animating: ["busy"],
				dragging: ["interacting"]
			}
		}, a.each(["onResize", "onThrottledResize"], a.proxy(function (b, c) {
			this._handlers[c] = a.proxy(this[c], this)
		}, this)), a.each(e.Plugins, a.proxy(function (a, b) {
			this._plugins[a.charAt(0).toLowerCase() + a.slice(1)] = new b(this)
		}, this)), a.each(e.Workers, a.proxy(function (b, c) {
			this._pipe.push({
				filter: c.filter,
				run: a.proxy(c.run, this)
			})
		}, this)), this.setup(), this.initialize()
	}
	e.Defaults = {
		items: 3,
		loop: !1,
		center: !1,
		rewind: !1,
		mouseDrag: !0,
		touchDrag: !0,
		pullDrag: !0,
		freeDrag: !1,
		margin: 0,
		stagePadding: 0,
		merge: !1,
		mergeFit: !0,
		autoWidth: !1,
		startPosition: 0,
		rtl: !1,
		smartSpeed: 250,
		fluidSpeed: !1,
		dragEndSpeed: !1,
		responsive: {},
		responsiveRefreshRate: 200,
		responsiveBaseElement: b,
		fallbackEasing: "swing",
		info: !1,
		nestedItemSelector: !1,
		itemElement: "div",
		stageElement: "div",
		refreshClass: "owl-refresh",
		loadedClass: "owl-loaded",
		loadingClass: "owl-loading",
		rtlClass: "owl-rtl",
		responsiveClass: "owl-responsive",
		dragClass: "owl-drag",
		itemClass: "owl-item",
		stageClass: "owl-stage",
		stageOuterClass: "owl-stage-outer",
		grabClass: "owl-grab"
	}, e.Width = {
		Default: "default",
		Inner: "inner",
		Outer: "outer"
	}, e.Type = {
		Event: "event",
		State: "state"
	}, e.Plugins = {}, e.Workers = [{
		filter: ["width", "settings"],
		run: function () {
			this._width = this.$element.width()
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function (a) {
			a.current = this._items && this._items[this.relative(this._current)]
		}
	}, {
		filter: ["items", "settings"],
		run: function () {
			this.$stage.children(".cloned").remove()
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function (a) {
			var b = this.settings.margin || "",
				c = !this.settings.autoWidth,
				d = this.settings.rtl,
				e = {
					width: "auto",
					"margin-left": d ? b : "",
					"margin-right": d ? "" : b
				};
			!c && this.$stage.children().css(e), a.css = e
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function (a) {
			var b = (this.width() / this.settings.items).toFixed(3) - this.settings.margin,
				c = null,
				d = this._items.length,
				e = !this.settings.autoWidth,
				f = [];
			for (a.items = {
					merge: !1,
					width: b
				}; d--;) c = this._mergers[d], c = this.settings.mergeFit && Math.min(c, this.settings.items) || c, a.items.merge = c > 1 || a.items.merge, f[d] = e ? b * c : this._items[d].width();
			this._widths = f
		}
	}, {
		filter: ["items", "settings"],
		run: function () {
			var b = [],
				c = this._items,
				d = this.settings,
				e = Math.max(2 * d.items, 4),
				f = 2 * Math.ceil(c.length / 2),
				g = d.loop && c.length ? d.rewind ? e : Math.max(e, f) : 0,
				h = "",
				i = "";
			for (g /= 2; g--;) b.push(this.normalize(b.length / 2, !0)), h += c[b[b.length - 1]][0].outerHTML, b.push(this.normalize(c.length - 1 - (b.length - 1) / 2, !0)), i = c[b[b.length - 1]][0].outerHTML + i;
			this._clones = b, a(h).addClass("cloned").appendTo(this.$stage), a(i).addClass("cloned").prependTo(this.$stage)
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function () {
			for (var a = this.settings.rtl ? 1 : -1, b = this._clones.length + this._items.length, c = -1, d = 0, e = 0, f = []; ++c < b;) d = f[c - 1] || 0, e = this._widths[this.relative(c)] + this.settings.margin, f.push(d + e * a);
			this._coordinates = f
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function () {
			var a = this.settings.stagePadding,
				b = this._coordinates,
				c = {
					width: Math.ceil(Math.abs(b[b.length - 1])) + 2 * a,
					"padding-left": a || "",
					"padding-right": a || ""
				};
			this.$stage.css(c)
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function (a) {
			var b = this._coordinates.length,
				c = !this.settings.autoWidth,
				d = this.$stage.children();
			if (c && a.items.merge)
				for (; b--;) a.css.width = this._widths[this.relative(b)], d.eq(b).css(a.css);
			else c && (a.css.width = a.items.width, d.css(a.css))
		}
	}, {
		filter: ["items"],
		run: function () {
			this._coordinates.length < 1 && this.$stage.removeAttr("style")
		}
	}, {
		filter: ["width", "items", "settings"],
		run: function (a) {
			a.current = a.current ? this.$stage.children().index(a.current) : 0, a.current = Math.max(this.minimum(), Math.min(this.maximum(), a.current)), this.reset(a.current)
		}
	}, {
		filter: ["position"],
		run: function () {
			this.animate(this.coordinates(this._current))
		}
	}, {
		filter: ["width", "position", "items", "settings"],
		run: function () {
			var a, b, c, d, e = this.settings.rtl ? 1 : -1,
				f = 2 * this.settings.stagePadding,
				g = this.coordinates(this.current()) + f,
				h = g + this.width() * e,
				i = [];
			for (c = 0, d = this._coordinates.length; c < d; c++) a = this._coordinates[c - 1] || 0, b = Math.abs(this._coordinates[c]) + f * e, (this.op(a, "<=", g) && this.op(a, ">", h) || this.op(b, "<", g) && this.op(b, ">", h)) && i.push(c);
			this.$stage.children(".active").removeClass("active"), this.$stage.children(":eq(" + i.join("), :eq(") + ")").addClass("active"), this.settings.center && (this.$stage.children(".center").removeClass("center"), this.$stage.children().eq(this.current()).addClass("center"))
		}
	}], e.prototype.initialize = function () {
		if (this.enter("initializing"), this.trigger("initialize"), this.$element.toggleClass(this.settings.rtlClass, this.settings.rtl), this.settings.autoWidth && !this.is("pre-loading")) {
			var b, c, e;
			b = this.$element.find("img"), c = this.settings.nestedItemSelector ? "." + this.settings.nestedItemSelector : d, e = this.$element.children(c).width(), b.length && e <= 0 && this.preloadAutoWidthImages(b)
		}
		this.$element.addClass(this.options.loadingClass), this.$stage = a("<" + this.settings.stageElement + ' class="' + this.settings.stageClass + '"/>').wrap('<div class="' + this.settings.stageOuterClass + '"/>'), this.$element.append(this.$stage.parent()), this.replace(this.$element.children().not(this.$stage.parent())), this.$element.is(":visible") ? this.refresh() : this.invalidate("width"), this.$element.removeClass(this.options.loadingClass).addClass(this.options.loadedClass), this.registerEventHandlers(), this.leave("initializing"), this.trigger("initialized")
	}, e.prototype.setup = function () {
		var b = this.viewport(),
			c = this.options.responsive,
			d = -1,
			e = null;
		c ? (a.each(c, function (a) {
			a <= b && a > d && (d = Number(a))
		}), e = a.extend({}, this.options, c[d]), "function" == typeof e.stagePadding && (e.stagePadding = e.stagePadding()), delete e.responsive, e.responsiveClass && this.$element.attr("class", this.$element.attr("class").replace(new RegExp("(" + this.options.responsiveClass + "-)\\S+\\s", "g"), "$1" + d))) : e = a.extend({}, this.options), this.trigger("change", {
			property: {
				name: "settings",
				value: e
			}
		}), this._breakpoint = d, this.settings = e, this.invalidate("settings"), this.trigger("changed", {
			property: {
				name: "settings",
				value: this.settings
			}
		})
	}, e.prototype.optionsLogic = function () {
		this.settings.autoWidth && (this.settings.stagePadding = !1, this.settings.merge = !1)
	}, e.prototype.prepare = function (b) {
		var c = this.trigger("prepare", {
			content: b
		});
		return c.data || (c.data = a("<" + this.settings.itemElement + "/>").addClass(this.options.itemClass).append(b)), this.trigger("prepared", {
			content: c.data
		}), c.data
	}, e.prototype.update = function () {
		for (var b = 0, c = this._pipe.length, d = a.proxy(function (a) {
				return this[a]
			}, this._invalidated), e = {}; b < c;)(this._invalidated.all || a.grep(this._pipe[b].filter, d).length > 0) && this._pipe[b].run(e), b++;
		this._invalidated = {}, !this.is("valid") && this.enter("valid")
	}, e.prototype.width = function (a) {
		switch (a = a || e.Width.Default) {
			case e.Width.Inner:
			case e.Width.Outer:
				return this._width;
			default:
				return this._width - 2 * this.settings.stagePadding + this.settings.margin
		}
	}, e.prototype.refresh = function () {
		this.enter("refreshing"), this.trigger("refresh"), this.setup(), this.optionsLogic(), this.$element.addClass(this.options.refreshClass), this.update(), this.$element.removeClass(this.options.refreshClass), this.leave("refreshing"), this.trigger("refreshed")
	}, e.prototype.onThrottledResize = function () {
		b.clearTimeout(this.resizeTimer), this.resizeTimer = b.setTimeout(this._handlers.onResize, this.settings.responsiveRefreshRate)
	}, e.prototype.onResize = function () {
		return !!this._items.length && (this._width !== this.$element.width() && (!!this.$element.is(":visible") && (this.enter("resizing"), this.trigger("resize").isDefaultPrevented() ? (this.leave("resizing"), !1) : (this.invalidate("width"), this.refresh(), this.leave("resizing"), void this.trigger("resized")))))
	}, e.prototype.registerEventHandlers = function () {
		a.support.transition && this.$stage.on(a.support.transition.end + ".owl.core", a.proxy(this.onTransitionEnd, this)), this.settings.responsive !== !1 && this.on(b, "resize", this._handlers.onThrottledResize), this.settings.mouseDrag && (this.$element.addClass(this.options.dragClass), this.$stage.on("mousedown.owl.core", a.proxy(this.onDragStart, this)), this.$stage.on("dragstart.owl.core selectstart.owl.core", function () {
			return !1
		})), this.settings.touchDrag && (this.$stage.on("touchstart.owl.core", a.proxy(this.onDragStart, this)), this.$stage.on("touchcancel.owl.core", a.proxy(this.onDragEnd, this)))
	}, e.prototype.onDragStart = function (b) {
		var d = null;
		3 !== b.which && (a.support.transform ? (d = this.$stage.css("transform").replace(/.*\(|\)| /g, "").split(","), d = {
			x: d[16 === d.length ? 12 : 4],
			y: d[16 === d.length ? 13 : 5]
		}) : (d = this.$stage.position(), d = {
			x: this.settings.rtl ? d.left + this.$stage.width() - this.width() + this.settings.margin : d.left,
			y: d.top
		}), this.is("animating") && (a.support.transform ? this.animate(d.x) : this.$stage.stop(), this.invalidate("position")), this.$element.toggleClass(this.options.grabClass, "mousedown" === b.type), this.speed(0), this._drag.time = (new Date).getTime(), this._drag.target = a(b.target), this._drag.stage.start = d, this._drag.stage.current = d, this._drag.pointer = this.pointer(b), a(c).on("mouseup.owl.core touchend.owl.core", a.proxy(this.onDragEnd, this)), a(c).one("mousemove.owl.core touchmove.owl.core", a.proxy(function (b) {
			var d = this.difference(this._drag.pointer, this.pointer(b));
			a(c).on("mousemove.owl.core touchmove.owl.core", a.proxy(this.onDragMove, this)), Math.abs(d.x) < Math.abs(d.y) && this.is("valid") || (b.preventDefault(), this.enter("dragging"), this.trigger("drag"))
		}, this)))
	}, e.prototype.onDragMove = function (a) {
		var b = null,
			c = null,
			d = null,
			e = this.difference(this._drag.pointer, this.pointer(a)),
			f = this.difference(this._drag.stage.start, e);
		this.is("dragging") && (a.preventDefault(), this.settings.loop ? (b = this.coordinates(this.minimum()), c = this.coordinates(this.maximum() + 1) - b, f.x = ((f.x - b) % c + c) % c + b) : (b = this.settings.rtl ? this.coordinates(this.maximum()) : this.coordinates(this.minimum()), c = this.settings.rtl ? this.coordinates(this.minimum()) : this.coordinates(this.maximum()), d = this.settings.pullDrag ? -1 * e.x / 5 : 0, f.x = Math.max(Math.min(f.x, b + d), c + d)), this._drag.stage.current = f, this.animate(f.x))
	}, e.prototype.onDragEnd = function (b) {
		var d = this.difference(this._drag.pointer, this.pointer(b)),
			e = this._drag.stage.current,
			f = d.x > 0 ^ this.settings.rtl ? "left" : "right";
		a(c).off(".owl.core"), this.$element.removeClass(this.options.grabClass), (0 !== d.x && this.is("dragging") || !this.is("valid")) && (this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed), this.current(this.closest(e.x, 0 !== d.x ? f : this._drag.direction)), this.invalidate("position"), this.update(), this._drag.direction = f, (Math.abs(d.x) > 3 || (new Date).getTime() - this._drag.time > 300) && this._drag.target.one("click.owl.core", function () {
			return !1
		})), this.is("dragging") && (this.leave("dragging"), this.trigger("dragged"))
	}, e.prototype.closest = function (b, c) {
		var d = -1,
			e = 30,
			f = this.width(),
			g = this.coordinates();
		return this.settings.freeDrag || a.each(g, a.proxy(function (a, h) {
			return "left" === c && b > h - e && b < h + e ? d = a : "right" === c && b > h - f - e && b < h - f + e ? d = a + 1 : this.op(b, "<", h) && this.op(b, ">", g[a + 1] || h - f) && (d = "left" === c ? a + 1 : a), d === -1
		}, this)), this.settings.loop || (this.op(b, ">", g[this.minimum()]) ? d = b = this.minimum() : this.op(b, "<", g[this.maximum()]) && (d = b = this.maximum())), d
	}, e.prototype.animate = function (b) {
		var c = this.speed() > 0;
		this.is("animating") && this.onTransitionEnd(), c && (this.enter("animating"), this.trigger("translate")), a.support.transform3d && a.support.transition ? this.$stage.css({
			transform: "translate3d(" + b + "px,0px,0px)",
			transition: this.speed() / 1e3 + "s"
		}) : c ? this.$stage.animate({
			left: b + "px"
		}, this.speed(), this.settings.fallbackEasing, a.proxy(this.onTransitionEnd, this)) : this.$stage.css({
			left: b + "px"
		})
	}, e.prototype.is = function (a) {
		return this._states.current[a] && this._states.current[a] > 0
	}, e.prototype.current = function (a) {
		if (a === d) return this._current;
		if (0 === this._items.length) return d;
		if (a = this.normalize(a), this._current !== a) {
			var b = this.trigger("change", {
				property: {
					name: "position",
					value: a
				}
			});
			b.data !== d && (a = this.normalize(b.data)), this._current = a, this.invalidate("position"), this.trigger("changed", {
				property: {
					name: "position",
					value: this._current
				}
			})
		}
		return this._current
	}, e.prototype.invalidate = function (b) {
		return "string" === a.type(b) && (this._invalidated[b] = !0, this.is("valid") && this.leave("valid")), a.map(this._invalidated, function (a, b) {
			return b
		})
	}, e.prototype.reset = function (a) {
		a = this.normalize(a), a !== d && (this._speed = 0, this._current = a, this.suppress(["translate", "translated"]), this.animate(this.coordinates(a)), this.release(["translate", "translated"]))
	}, e.prototype.normalize = function (a, b) {
		var c = this._items.length,
			e = b ? 0 : this._clones.length;
		return !this.isNumeric(a) || c < 1 ? a = d : (a < 0 || a >= c + e) && (a = ((a - e / 2) % c + c) % c + e / 2), a
	}, e.prototype.relative = function (a) {
		return a -= this._clones.length / 2, this.normalize(a, !0)
	}, e.prototype.maximum = function (a) {
		var b, c, d, e = this.settings,
			f = this._coordinates.length;
		if (e.loop) f = this._clones.length / 2 + this._items.length - 1;
		else if (e.autoWidth || e.merge) {
			for (b = this._items.length, c = this._items[--b].width(), d = this.$element.width(); b-- && (c += this._items[b].width() + this.settings.margin, !(c > d)););
			f = b + 1
		} else f = e.center ? this._items.length - 1 : this._items.length - e.items;
		return a && (f -= this._clones.length / 2), Math.max(f, 0)
	}, e.prototype.minimum = function (a) {
		return a ? 0 : this._clones.length / 2
	}, e.prototype.items = function (a) {
		return a === d ? this._items.slice() : (a = this.normalize(a, !0), this._items[a])
	}, e.prototype.mergers = function (a) {
		return a === d ? this._mergers.slice() : (a = this.normalize(a, !0), this._mergers[a])
	}, e.prototype.clones = function (b) {
		var c = this._clones.length / 2,
			e = c + this._items.length,
			f = function (a) {
				return a % 2 === 0 ? e + a / 2 : c - (a + 1) / 2
			};
		return b === d ? a.map(this._clones, function (a, b) {
			return f(b)
		}) : a.map(this._clones, function (a, c) {
			return a === b ? f(c) : null
		})
	}, e.prototype.speed = function (a) {
		return a !== d && (this._speed = a), this._speed
	}, e.prototype.coordinates = function (b) {
		var c, e = 1,
			f = b - 1;
		return b === d ? a.map(this._coordinates, a.proxy(function (a, b) {
			return this.coordinates(b)
		}, this)) : (this.settings.center ? (this.settings.rtl && (e = -1, f = b + 1), c = this._coordinates[b], c += (this.width() - c + (this._coordinates[f] || 0)) / 2 * e) : c = this._coordinates[f] || 0, c = Math.ceil(c))
	}, e.prototype.duration = function (a, b, c) {
		return 0 === c ? 0 : Math.min(Math.max(Math.abs(b - a), 1), 6) * Math.abs(c || this.settings.smartSpeed)
	}, e.prototype.to = function (a, b) {
		var c = this.current(),
			d = null,
			e = a - this.relative(c),
			f = (e > 0) - (e < 0),
			g = this._items.length,
			h = this.minimum(),
			i = this.maximum();
		this.settings.loop ? (!this.settings.rewind && Math.abs(e) > g / 2 && (e += f * -1 * g), a = c + e, d = ((a - h) % g + g) % g + h, d !== a && d - e <= i && d - e > 0 && (c = d - e, a = d, this.reset(c))) : this.settings.rewind ? (i += 1, a = (a % i + i) % i) : a = Math.max(h, Math.min(i, a)), this.speed(this.duration(c, a, b)), this.current(a), this.$element.is(":visible") && this.update()
	}, e.prototype.next = function (a) {
		a = a || !1, this.to(this.relative(this.current()) + 1, a)
	}, e.prototype.prev = function (a) {
		a = a || !1, this.to(this.relative(this.current()) - 1, a)
	}, e.prototype.onTransitionEnd = function (a) {
		if (a !== d && (a.stopPropagation(), (a.target || a.srcElement || a.originalTarget) !== this.$stage.get(0))) return !1;
		this.leave("animating"), this.trigger("translated")
	}, e.prototype.viewport = function () {
		var d;
		return this.options.responsiveBaseElement !== b ? d = a(this.options.responsiveBaseElement).width() : b.innerWidth ? d = b.innerWidth : c.documentElement && c.documentElement.clientWidth ? d = c.documentElement.clientWidth : console.warn("Can not detect viewport width."), d
	}, e.prototype.replace = function (b) {
		this.$stage.empty(), this._items = [], b && (b = b instanceof jQuery ? b : a(b)), this.settings.nestedItemSelector && (b = b.find("." + this.settings.nestedItemSelector)), b.filter(function () {
			return 1 === this.nodeType
		}).each(a.proxy(function (a, b) {
			b = this.prepare(b), this.$stage.append(b), this._items.push(b), this._mergers.push(1 * b.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)
		}, this)), this.reset(this.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0), this.invalidate("items")
	}, e.prototype.add = function (b, c) {
		var e = this.relative(this._current);
		c = c === d ? this._items.length : this.normalize(c, !0), b = b instanceof jQuery ? b : a(b), this.trigger("add", {
			content: b,
			position: c
		}), b = this.prepare(b), 0 === this._items.length || c === this._items.length ? (0 === this._items.length && this.$stage.append(b), 0 !== this._items.length && this._items[c - 1].after(b), this._items.push(b), this._mergers.push(1 * b.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)) : (this._items[c].before(b), this._items.splice(c, 0, b), this._mergers.splice(c, 0, 1 * b.find("[data-merge]").addBack("[data-merge]").attr("data-merge") || 1)), this._items[e] && this.reset(this._items[e].index()), this.invalidate("items"), this.trigger("added", {
			content: b,
			position: c
		})
	}, e.prototype.remove = function (a) {
		a = this.normalize(a, !0), a !== d && (this.trigger("remove", {
			content: this._items[a],
			position: a
		}), this._items[a].remove(), this._items.splice(a, 1), this._mergers.splice(a, 1), this.invalidate("items"), this.trigger("removed", {
			content: null,
			position: a
		}))
	}, e.prototype.preloadAutoWidthImages = function (b) {
		b.each(a.proxy(function (b, c) {
			this.enter("pre-loading"), c = a(c), a(new Image).one("load", a.proxy(function (a) {
				c.attr("src", a.target.src), c.css("opacity", 1), this.leave("pre-loading"), !this.is("pre-loading") && !this.is("initializing") && this.refresh()
			}, this)).attr("src", c.attr("src") || c.attr("data-src") || c.attr("data-src-retina"))
		}, this))
	}, e.prototype.destroy = function () {
		this.$element.off(".owl.core"), this.$stage.off(".owl.core"), a(c).off(".owl.core"), this.settings.responsive !== !1 && (b.clearTimeout(this.resizeTimer), this.off(b, "resize", this._handlers.onThrottledResize));
		for (var d in this._plugins) this._plugins[d].destroy();
		this.$stage.children(".cloned").remove(), this.$stage.unwrap(), this.$stage.children().contents().unwrap(), this.$stage.children().unwrap(), this.$element.removeClass(this.options.refreshClass).removeClass(this.options.loadingClass).removeClass(this.options.loadedClass).removeClass(this.options.rtlClass).removeClass(this.options.dragClass).removeClass(this.options.grabClass).attr("class", this.$element.attr("class").replace(new RegExp(this.options.responsiveClass + "-\\S+\\s", "g"), "")).removeData("owl.carousel")
	}, e.prototype.op = function (a, b, c) {
		var d = this.settings.rtl;
		switch (b) {
			case "<":
				return d ? a > c : a < c;
			case ">":
				return d ? a < c : a > c;
			case ">=":
				return d ? a <= c : a >= c;
			case "<=":
				return d ? a >= c : a <= c
		}
	}, e.prototype.on = function (a, b, c, d) {
		a.addEventListener ? a.addEventListener(b, c, d) : a.attachEvent && a.attachEvent("on" + b, c)
	}, e.prototype.off = function (a, b, c, d) {
		a.removeEventListener ? a.removeEventListener(b, c, d) : a.detachEvent && a.detachEvent("on" + b, c)
	}, e.prototype.trigger = function (b, c, d, f, g) {
		var h = {
				item: {
					count: this._items.length,
					index: this.current()
				}
			},
			i = a.camelCase(a.grep(["on", b, d], function (a) {
				return a
			}).join("-").toLowerCase()),
			j = a.Event([b, "owl", d || "carousel"].join(".").toLowerCase(), a.extend({
				relatedTarget: this
			}, h, c));
		return this._supress[b] || (a.each(this._plugins, function (a, b) {
			b.onTrigger && b.onTrigger(j)
		}), this.register({
			type: e.Type.Event,
			name: b
		}), this.$element.trigger(j), this.settings && "function" == typeof this.settings[i] && this.settings[i].call(this, j)), j
	}, e.prototype.enter = function (b) {
		a.each([b].concat(this._states.tags[b] || []), a.proxy(function (a, b) {
			this._states.current[b] === d && (this._states.current[b] = 0), this._states.current[b]++
		}, this))
	}, e.prototype.leave = function (b) {
		a.each([b].concat(this._states.tags[b] || []), a.proxy(function (a, b) {
			this._states.current[b]--
		}, this))
	}, e.prototype.register = function (b) {
		if (b.type === e.Type.Event) {
			if (a.event.special[b.name] || (a.event.special[b.name] = {}), !a.event.special[b.name].owl) {
				var c = a.event.special[b.name]._default;
				a.event.special[b.name]._default = function (a) {
					return !c || !c.apply || a.namespace && a.namespace.indexOf("owl") !== -1 ? a.namespace && a.namespace.indexOf("owl") > -1 : c.apply(this, arguments)
				}, a.event.special[b.name].owl = !0
			}
		} else b.type === e.Type.State && (this._states.tags[b.name] ? this._states.tags[b.name] = this._states.tags[b.name].concat(b.tags) : this._states.tags[b.name] = b.tags, this._states.tags[b.name] = a.grep(this._states.tags[b.name], a.proxy(function (c, d) {
			return a.inArray(c, this._states.tags[b.name]) === d
		}, this)))
	}, e.prototype.suppress = function (b) {
		a.each(b, a.proxy(function (a, b) {
			this._supress[b] = !0
		}, this))
	}, e.prototype.release = function (b) {
		a.each(b, a.proxy(function (a, b) {
			delete this._supress[b]
		}, this))
	}, e.prototype.pointer = function (a) {
		var c = {
			x: null,
			y: null
		};
		return a = a.originalEvent || a || b.event, a = a.touches && a.touches.length ? a.touches[0] : a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : a, a.pageX ? (c.x = a.pageX, c.y = a.pageY) : (c.x = a.clientX, c.y = a.clientY), c
	}, e.prototype.isNumeric = function (a) {
		return !isNaN(parseFloat(a))
	}, e.prototype.difference = function (a, b) {
		return {
			x: a.x - b.x,
			y: a.y - b.y
		}
	}, a.fn.owlCarousel = function (b) {
		var c = Array.prototype.slice.call(arguments, 1);
		return this.each(function () {
			var d = a(this),
				f = d.data("owl.carousel");
			f || (f = new e(this, "object" == typeof b && b), d.data("owl.carousel", f), a.each(["next", "prev", "to", "destroy", "refresh", "replace", "add", "remove"], function (b, c) {
				f.register({
					type: e.Type.Event,
					name: c
				}), f.$element.on(c + ".owl.carousel.core", a.proxy(function (a) {
					a.namespace && a.relatedTarget !== this && (this.suppress([c]), f[c].apply(this, [].slice.call(arguments, 1)), this.release([c]))
				}, f))
			})), "string" == typeof b && "_" !== b.charAt(0) && f[b].apply(f, c)
		})
	}, a.fn.owlCarousel.Constructor = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	var e = function (b) {
		this._core = b, this._interval = null, this._visible = null, this._handlers = {
			"initialized.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.settings.autoRefresh && this.watch()
			}, this)
		}, this._core.options = a.extend({}, e.Defaults, this._core.options), this._core.$element.on(this._handlers)
	};
	e.Defaults = {
		autoRefresh: !0,
		autoRefreshInterval: 500
	}, e.prototype.watch = function () {
		this._interval || (this._visible = this._core.$element.is(":visible"), this._interval = b.setInterval(a.proxy(this.refresh, this), this._core.settings.autoRefreshInterval))
	}, e.prototype.refresh = function () {
		this._core.$element.is(":visible") !== this._visible && (this._visible = !this._visible, this._core.$element.toggleClass("owl-hidden", !this._visible), this._visible && this._core.invalidate("width") && this._core.refresh())
	}, e.prototype.destroy = function () {
		var a, c;
		b.clearInterval(this._interval);
		for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
		for (c in Object.getOwnPropertyNames(this)) "function" != typeof this[c] && (this[c] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.AutoRefresh = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	var e = function (b) {
		this._core = b, this._loaded = [], this._handlers = {
			"initialized.owl.carousel change.owl.carousel resized.owl.carousel": a.proxy(function (b) {
				if (b.namespace && this._core.settings && this._core.settings.lazyLoad && (b.property && "position" == b.property.name || "initialized" == b.type))
					for (var c = this._core.settings, e = c.center && Math.ceil(c.items / 2) || c.items, f = c.center && e * -1 || 0, g = (b.property && b.property.value !== d ? b.property.value : this._core.current()) + f, h = this._core.clones().length, i = a.proxy(function (a, b) {
							this.load(b)
						}, this); f++ < e;) this.load(h / 2 + this._core.relative(g)), h && a.each(this._core.clones(this._core.relative(g)), i), g++
			}, this)
		}, this._core.options = a.extend({}, e.Defaults, this._core.options), this._core.$element.on(this._handlers)
	};
	e.Defaults = {
		lazyLoad: !1
	}, e.prototype.load = function (c) {
		var d = this._core.$stage.children().eq(c),
			e = d && d.find(".owl-lazy");
		!e || a.inArray(d.get(0), this._loaded) > -1 || (e.each(a.proxy(function (c, d) {
			var e, f = a(d),
				g = b.devicePixelRatio > 1 && f.attr("data-src-retina") || f.attr("data-src");
			this._core.trigger("load", {
				element: f,
				url: g
			}, "lazy"), f.is("img") ? f.one("load.owl.lazy", a.proxy(function () {
				f.css("opacity", 1), this._core.trigger("loaded", {
					element: f,
					url: g
				}, "lazy")
			}, this)).attr("src", g) : (e = new Image, e.onload = a.proxy(function () {
				f.css({
					"background-image": 'url("' + g + '")',
					opacity: "1"
				}), this._core.trigger("loaded", {
					element: f,
					url: g
				}, "lazy")
			}, this), e.src = g)
		}, this)), this._loaded.push(d.get(0)))
	}, e.prototype.destroy = function () {
		var a, b;
		for (a in this.handlers) this._core.$element.off(a, this.handlers[a]);
		for (b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.Lazy = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	var e = function (b) {
		this._core = b, this._handlers = {
			"initialized.owl.carousel refreshed.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.settings.autoHeight && this.update()
			}, this),
			"changed.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.settings.autoHeight && "position" == a.property.name && this.update()
			}, this),
			"loaded.owl.lazy": a.proxy(function (a) {
				a.namespace && this._core.settings.autoHeight && a.element.closest("." + this._core.settings.itemClass).index() === this._core.current() && this.update()
			}, this)
		}, this._core.options = a.extend({}, e.Defaults, this._core.options), this._core.$element.on(this._handlers)
	};
	e.Defaults = {
		autoHeight: !1,
		autoHeightClass: "owl-height"
	}, e.prototype.update = function () {
		var b = this._core._current,
			c = b + this._core.settings.items,
			d = this._core.$stage.children().toArray().slice(b, c),
			e = [],
			f = 0;
		a.each(d, function (b, c) {
			e.push(a(c).height())
		}), f = Math.max.apply(null, e), this._core.$stage.parent().height(f).addClass(this._core.settings.autoHeightClass)
	}, e.prototype.destroy = function () {
		var a, b;
		for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
		for (b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.AutoHeight = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	var e = function (b) {
		this._core = b, this._videos = {}, this._playing = null, this._handlers = {
			"initialized.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.register({
					type: "state",
					name: "playing",
					tags: ["interacting"]
				})
			}, this),
			"resize.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.settings.video && this.isInFullScreen() && a.preventDefault()
			}, this),
			"refreshed.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.is("resizing") && this._core.$stage.find(".cloned .owl-video-frame").remove()
			}, this),
			"changed.owl.carousel": a.proxy(function (a) {
				a.namespace && "position" === a.property.name && this._playing && this.stop()
			}, this),
			"prepared.owl.carousel": a.proxy(function (b) {
				if (b.namespace) {
					var c = a(b.content).find(".owl-video");
					c.length && (c.css("display", "none"), this.fetch(c, a(b.content)))
				}
			}, this)
		}, this._core.options = a.extend({}, e.Defaults, this._core.options), this._core.$element.on(this._handlers), this._core.$element.on("click.owl.video", ".owl-video-play-icon", a.proxy(function (a) {
			this.play(a)
		}, this))
	};
	e.Defaults = {
		video: !1,
		videoHeight: !1,
		videoWidth: !1
	}, e.prototype.fetch = function (a, b) {
		var c = function () {
				return a.attr("data-vimeo-id") ? "vimeo" : a.attr("data-vzaar-id") ? "vzaar" : "youtube"
			}(),
			d = a.attr("data-vimeo-id") || a.attr("data-youtube-id") || a.attr("data-vzaar-id"),
			e = a.attr("data-width") || this._core.settings.videoWidth,
			f = a.attr("data-height") || this._core.settings.videoHeight,
			g = a.attr("href");
		if (!g) throw new Error("Missing video URL.");
		if (d = g.match(/(http:|https:|)\/\/(player.|www.|app.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com)|vzaar\.com)\/(video\/|videos\/|embed\/|channels\/.+\/|groups\/.+\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/), d[3].indexOf("youtu") > -1) c = "youtube";
		else if (d[3].indexOf("vimeo") > -1) c = "vimeo";
		else {
			if (!(d[3].indexOf("vzaar") > -1)) throw new Error("Video URL not supported.");
			c = "vzaar"
		}
		d = d[6], this._videos[g] = {
			type: c,
			id: d,
			width: e,
			height: f
		}, b.attr("data-video", g), this.thumbnail(a, this._videos[g])
	}, e.prototype.thumbnail = function (b, c) {
		var d, e, f, g = c.width && c.height ? 'style="width:' + c.width + "px;height:" + c.height + 'px;"' : "",
			h = b.find("img"),
			i = "src",
			j = "",
			k = this._core.settings,
			l = function (a) {
				e = '<div class="owl-video-play-icon"></div>', d = k.lazyLoad ? '<div class="owl-video-tn ' + j + '" ' + i + '="' + a + '"></div>' : '<div class="owl-video-tn" style="opacity:1;background-image:url(' + a + ')"></div>', b.after(d), b.after(e)
			};
		if (b.wrap('<div class="owl-video-wrapper"' + g + "></div>"), this._core.settings.lazyLoad && (i = "data-src", j = "owl-lazy"), h.length) return l(h.attr(i)), h.remove(), !1;
		"youtube" === c.type ? (f = "//img.youtube.com/vi/" + c.id + "/hqdefault.jpg", l(f)) : "vimeo" === c.type ? a.ajax({
			type: "GET",
			url: "//vimeo.com/api/v2/video/" + c.id + ".json",
			jsonp: "callback",
			dataType: "jsonp",
			success: function (a) {
				f = a[0].thumbnail_large, l(f)
			}
		}) : "vzaar" === c.type && a.ajax({
			type: "GET",
			url: "//vzaar.com/api/videos/" + c.id + ".json",
			jsonp: "callback",
			dataType: "jsonp",
			success: function (a) {
				f = a.framegrab_url, l(f)
			}
		})
	}, e.prototype.stop = function () {
		this._core.trigger("stop", null, "video"), this._playing.find(".owl-video-frame").remove(), this._playing.removeClass("owl-video-playing"), this._playing = null, this._core.leave("playing"), this._core.trigger("stopped", null, "video")
	}, e.prototype.play = function (b) {
		var c, d = a(b.target),
			e = d.closest("." + this._core.settings.itemClass),
			f = this._videos[e.attr("data-video")],
			g = f.width || "100%",
			h = f.height || this._core.$stage.height();
		this._playing || (this._core.enter("playing"), this._core.trigger("play", null, "video"), e = this._core.items(this._core.relative(e.index())), this._core.reset(e.index()), "youtube" === f.type ? c = '<iframe width="' + g + '" height="' + h + '" src="//www.youtube.com/embed/' + f.id + "?autoplay=1&rel=0&v=" + f.id + '" frameborder="0" allowfullscreen></iframe>' : "vimeo" === f.type ? c = '<iframe src="//player.vimeo.com/video/' + f.id + '?autoplay=1" width="' + g + '" height="' + h + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' : "vzaar" === f.type && (c = '<iframe frameborder="0"height="' + h + '"width="' + g + '" allowfullscreen mozallowfullscreen webkitAllowFullScreen src="//view.vzaar.com/' + f.id + '/player?autoplay=true"></iframe>'), a('<div class="owl-video-frame">' + c + "</div>").insertAfter(e.find(".owl-video")), this._playing = e.addClass("owl-video-playing"))
	}, e.prototype.isInFullScreen = function () {
		var b = c.fullscreenElement || c.mozFullScreenElement || c.webkitFullscreenElement;
		return b && a(b).parent().hasClass("owl-video-frame")
	}, e.prototype.destroy = function () {
		var a, b;
		this._core.$element.off("click.owl.video");
		for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
		for (b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.Video = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	var e = function (b) {
		this.core = b, this.core.options = a.extend({}, e.Defaults, this.core.options), this.swapping = !0, this.previous = d, this.next = d, this.handlers = {
			"change.owl.carousel": a.proxy(function (a) {
				a.namespace && "position" == a.property.name && (this.previous = this.core.current(), this.next = a.property.value)
			}, this),
			"drag.owl.carousel dragged.owl.carousel translated.owl.carousel": a.proxy(function (a) {
				a.namespace && (this.swapping = "translated" == a.type)
			}, this),
			"translate.owl.carousel": a.proxy(function (a) {
				a.namespace && this.swapping && (this.core.options.animateOut || this.core.options.animateIn) && this.swap()
			}, this)
		}, this.core.$element.on(this.handlers)
	};
	e.Defaults = {
			animateOut: !1,
			animateIn: !1
		}, e.prototype.swap = function () {
			if (1 === this.core.settings.items && a.support.animation && a.support.transition) {
				this.core.speed(0);
				var b, c = a.proxy(this.clear, this),
					d = this.core.$stage.children().eq(this.previous),
					e = this.core.$stage.children().eq(this.next),
					f = this.core.settings.animateIn,
					g = this.core.settings.animateOut;
				this.core.current() !== this.previous && (g && (b = this.core.coordinates(this.previous) - this.core.coordinates(this.next), d.one(a.support.animation.end, c).css({
					left: b + "px"
				}).addClass("animated owl-animated-out").addClass(g)), f && e.one(a.support.animation.end, c).addClass("animated owl-animated-in").addClass(f))
			}
		}, e.prototype.clear = function (b) {
			a(b.target).css({
				left: ""
			}).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut), this.core.onTransitionEnd()
		}, e.prototype.destroy = function () {
			var a, b;
			for (a in this.handlers) this.core.$element.off(a, this.handlers[a]);
			for (b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
		},
		a.fn.owlCarousel.Constructor.Plugins.Animate = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	var e = function (b) {
		this._core = b, this._timeout = null, this._paused = !1, this._handlers = {
			"changed.owl.carousel": a.proxy(function (a) {
				a.namespace && "settings" === a.property.name ? this._core.settings.autoplay ? this.play() : this.stop() : a.namespace && "position" === a.property.name && this._core.settings.autoplay && this._setAutoPlayInterval()
			}, this),
			"initialized.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.settings.autoplay && this.play()
			}, this),
			"play.owl.autoplay": a.proxy(function (a, b, c) {
				a.namespace && this.play(b, c)
			}, this),
			"stop.owl.autoplay": a.proxy(function (a) {
				a.namespace && this.stop()
			}, this),
			"mouseover.owl.autoplay": a.proxy(function () {
				this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.pause()
			}, this),
			"mouseleave.owl.autoplay": a.proxy(function () {
				this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.play()
			}, this),
			"touchstart.owl.core": a.proxy(function () {
				this._core.settings.autoplayHoverPause && this._core.is("rotating") && this.pause()
			}, this),
			"touchend.owl.core": a.proxy(function () {
				this._core.settings.autoplayHoverPause && this.play()
			}, this)
		}, this._core.$element.on(this._handlers), this._core.options = a.extend({}, e.Defaults, this._core.options)
	};
	e.Defaults = {
		autoplay: !1,
		autoplayTimeout: 5e3,
		autoplayHoverPause: !1,
		autoplaySpeed: !1
	}, e.prototype.play = function (a, b) {
		this._paused = !1, this._core.is("rotating") || (this._core.enter("rotating"), this._setAutoPlayInterval())
	}, e.prototype._getNextTimeout = function (d, e) {
		return this._timeout && b.clearTimeout(this._timeout), b.setTimeout(a.proxy(function () {
			this._paused || this._core.is("busy") || this._core.is("interacting") || c.hidden || this._core.next(e || this._core.settings.autoplaySpeed)
		}, this), d || this._core.settings.autoplayTimeout)
	}, e.prototype._setAutoPlayInterval = function () {
		this._timeout = this._getNextTimeout()
	}, e.prototype.stop = function () {
		this._core.is("rotating") && (b.clearTimeout(this._timeout), this._core.leave("rotating"))
	}, e.prototype.pause = function () {
		this._core.is("rotating") && (this._paused = !0)
	}, e.prototype.destroy = function () {
		var a, b;
		this.stop();
		for (a in this._handlers) this._core.$element.off(a, this._handlers[a]);
		for (b in Object.getOwnPropertyNames(this)) "function" != typeof this[b] && (this[b] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.autoplay = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	"use strict";
	var e = function (b) {
		this._core = b, this._initialized = !1, this._pages = [], this._controls = {}, this._templates = [], this.$element = this._core.$element, this._overrides = {
			next: this._core.next,
			prev: this._core.prev,
			to: this._core.to
		}, this._handlers = {
			"prepared.owl.carousel": a.proxy(function (b) {
				b.namespace && this._core.settings.dotsData && this._templates.push('<div class="' + this._core.settings.dotClass + '">' + a(b.content).find("[data-dot]").addBack("[data-dot]").attr("data-dot") + "</div>")
			}, this),
			"added.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.settings.dotsData && this._templates.splice(a.position, 0, this._templates.pop())
			}, this),
			"remove.owl.carousel": a.proxy(function (a) {
				a.namespace && this._core.settings.dotsData && this._templates.splice(a.position, 1)
			}, this),
			"changed.owl.carousel": a.proxy(function (a) {
				a.namespace && "position" == a.property.name && this.draw()
			}, this),
			"initialized.owl.carousel": a.proxy(function (a) {
				a.namespace && !this._initialized && (this._core.trigger("initialize", null, "navigation"), this.initialize(), this.update(), this.draw(), this._initialized = !0, this._core.trigger("initialized", null, "navigation"))
			}, this),
			"refreshed.owl.carousel": a.proxy(function (a) {
				a.namespace && this._initialized && (this._core.trigger("refresh", null, "navigation"), this.update(), this.draw(), this._core.trigger("refreshed", null, "navigation"))
			}, this)
		}, this._core.options = a.extend({}, e.Defaults, this._core.options), this.$element.on(this._handlers)
	};
	e.Defaults = {
		nav: !1,
		navText: ["prev", "next"],
		navSpeed: !1,
		navElement: "div",
		navContainer: !1,
		navContainerClass: "owl-nav",
		navClass: ["owl-prev", "owl-next"],
		slideBy: 1,
		dotClass: "owl-dot",
		dotsClass: "owl-dots",
		dots: !0,
		dotsEach: !1,
		dotsData: !1,
		dotsSpeed: !1,
		dotsContainer: !1
	}, e.prototype.initialize = function () {
		var b, c = this._core.settings;
		this._controls.$relative = (c.navContainer ? a(c.navContainer) : a("<div>").addClass(c.navContainerClass).appendTo(this.$element)).addClass("disabled"), this._controls.$previous = a("<" + c.navElement + ">").addClass(c.navClass[0]).html(c.navText[0]).prependTo(this._controls.$relative).on("click", a.proxy(function (a) {
			this.prev(c.navSpeed)
		}, this)), this._controls.$next = a("<" + c.navElement + ">").addClass(c.navClass[1]).html(c.navText[1]).appendTo(this._controls.$relative).on("click", a.proxy(function (a) {
			this.next(c.navSpeed)
		}, this)), c.dotsData || (this._templates = [a("<div>").addClass(c.dotClass).append(a("<span>")).prop("outerHTML")]), this._controls.$absolute = (c.dotsContainer ? a(c.dotsContainer) : a("<div>").addClass(c.dotsClass).appendTo(this.$element)).addClass("disabled"), this._controls.$absolute.on("click", "div", a.proxy(function (b) {
			var d = a(b.target).parent().is(this._controls.$absolute) ? a(b.target).index() : a(b.target).parent().index();
			b.preventDefault(), this.to(d, c.dotsSpeed)
		}, this));
		for (b in this._overrides) this._core[b] = a.proxy(this[b], this)
	}, e.prototype.destroy = function () {
		var a, b, c, d;
		for (a in this._handlers) this.$element.off(a, this._handlers[a]);
		for (b in this._controls) this._controls[b].remove();
		for (d in this.overides) this._core[d] = this._overrides[d];
		for (c in Object.getOwnPropertyNames(this)) "function" != typeof this[c] && (this[c] = null)
	}, e.prototype.update = function () {
		var a, b, c, d = this._core.clones().length / 2,
			e = d + this._core.items().length,
			f = this._core.maximum(!0),
			g = this._core.settings,
			h = g.center || g.autoWidth || g.dotsData ? 1 : g.dotsEach || g.items;
		if ("page" !== g.slideBy && (g.slideBy = Math.min(g.slideBy, g.items)), g.dots || "page" == g.slideBy)
			for (this._pages = [], a = d, b = 0, c = 0; a < e; a++) {
				if (b >= h || 0 === b) {
					if (this._pages.push({
							start: Math.min(f, a - d),
							end: a - d + h - 1
						}), Math.min(f, a - d) === f) break;
					b = 0, ++c
				}
				b += this._core.mergers(this._core.relative(a))
			}
	}, e.prototype.draw = function () {
		var b, c = this._core.settings,
			d = this._core.items().length <= c.items,
			e = this._core.relative(this._core.current()),
			f = c.loop || c.rewind;
		this._controls.$relative.toggleClass("disabled", !c.nav || d), c.nav && (this._controls.$previous.toggleClass("disabled", !f && e <= this._core.minimum(!0)), this._controls.$next.toggleClass("disabled", !f && e >= this._core.maximum(!0))), this._controls.$absolute.toggleClass("disabled", !c.dots || d), c.dots && (b = this._pages.length - this._controls.$absolute.children().length, c.dotsData && 0 !== b ? this._controls.$absolute.html(this._templates.join("")) : b > 0 ? this._controls.$absolute.append(new Array(b + 1).join(this._templates[0])) : b < 0 && this._controls.$absolute.children().slice(b).remove(), this._controls.$absolute.find(".active").removeClass("active"), this._controls.$absolute.children().eq(a.inArray(this.current(), this._pages)).addClass("active"))
	}, e.prototype.onTrigger = function (b) {
		var c = this._core.settings;
		b.page = {
			index: a.inArray(this.current(), this._pages),
			count: this._pages.length,
			size: c && (c.center || c.autoWidth || c.dotsData ? 1 : c.dotsEach || c.items)
		}
	}, e.prototype.current = function () {
		var b = this._core.relative(this._core.current());
		return a.grep(this._pages, a.proxy(function (a, c) {
			return a.start <= b && a.end >= b
		}, this)).pop()
	}, e.prototype.getPosition = function (b) {
		var c, d, e = this._core.settings;
		return "page" == e.slideBy ? (c = a.inArray(this.current(), this._pages), d = this._pages.length, b ? ++c : --c, c = this._pages[(c % d + d) % d].start) : (c = this._core.relative(this._core.current()), d = this._core.items().length, b ? c += e.slideBy : c -= e.slideBy), c
	}, e.prototype.next = function (b) {
		a.proxy(this._overrides.to, this._core)(this.getPosition(!0), b)
	}, e.prototype.prev = function (b) {
		a.proxy(this._overrides.to, this._core)(this.getPosition(!1), b)
	}, e.prototype.to = function (b, c, d) {
		var e;
		!d && this._pages.length ? (e = this._pages.length, a.proxy(this._overrides.to, this._core)(this._pages[(b % e + e) % e].start, c)) : a.proxy(this._overrides.to, this._core)(b, c)
	}, a.fn.owlCarousel.Constructor.Plugins.Navigation = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	"use strict";
	var e = function (c) {
		this._core = c, this._hashes = {}, this.$element = this._core.$element, this._handlers = {
			"initialized.owl.carousel": a.proxy(function (c) {
				c.namespace && "URLHash" === this._core.settings.startPosition && a(b).trigger("hashchange.owl.navigation")
			}, this),
			"prepared.owl.carousel": a.proxy(function (b) {
				if (b.namespace) {
					var c = a(b.content).find("[data-hash]").addBack("[data-hash]").attr("data-hash");
					if (!c) return;
					this._hashes[c] = b.content
				}
			}, this),
			"changed.owl.carousel": a.proxy(function (c) {
				if (c.namespace && "position" === c.property.name) {
					var d = this._core.items(this._core.relative(this._core.current())),
						e = a.map(this._hashes, function (a, b) {
							return a === d ? b : null
						}).join();
					if (!e || b.location.hash.slice(1) === e) return;
					b.location.hash = e
				}
			}, this)
		}, this._core.options = a.extend({}, e.Defaults, this._core.options), this.$element.on(this._handlers), a(b).on("hashchange.owl.navigation", a.proxy(function (a) {
			var c = b.location.hash.substring(1),
				e = this._core.$stage.children(),
				f = this._hashes[c] && e.index(this._hashes[c]);
			f !== d && f !== this._core.current() && this._core.to(this._core.relative(f), !1, !0)
		}, this))
	};
	e.Defaults = {
		URLhashListener: !1
	}, e.prototype.destroy = function () {
		var c, d;
		a(b).off("hashchange.owl.navigation");
		for (c in this._handlers) this._core.$element.off(c, this._handlers[c]);
		for (d in Object.getOwnPropertyNames(this)) "function" != typeof this[d] && (this[d] = null)
	}, a.fn.owlCarousel.Constructor.Plugins.Hash = e
}(window.Zepto || window.jQuery, window, document),
function (a, b, c, d) {
	function e(b, c) {
		var e = !1,
			f = b.charAt(0).toUpperCase() + b.slice(1);
		return a.each((b + " " + h.join(f + " ") + f).split(" "), function (a, b) {
			if (g[b] !== d) return e = !c || b, !1
		}), e
	}

	function f(a) {
		return e(a, !0)
	}
	var g = a("<support>").get(0).style,
		h = "Webkit Moz O ms".split(" "),
		i = {
			transition: {
				end: {
					WebkitTransition: "webkitTransitionEnd",
					MozTransition: "transitionend",
					OTransition: "oTransitionEnd",
					transition: "transitionend"
				}
			},
			animation: {
				end: {
					WebkitAnimation: "webkitAnimationEnd",
					MozAnimation: "animationend",
					OAnimation: "oAnimationEnd",
					animation: "animationend"
				}
			}
		},
		j = {
			csstransforms: function () {
				return !!e("transform")
			},
			csstransforms3d: function () {
				return !!e("perspective")
			},
			csstransitions: function () {
				return !!e("transition")
			},
			cssanimations: function () {
				return !!e("animation")
			}
		};
	j.csstransitions() && (a.support.transition = new String(f("transition")), a.support.transition.end = i.transition.end[a.support.transition]), j.cssanimations() && (a.support.animation = new String(f("animation")), a.support.animation.end = i.animation.end[a.support.animation]), j.csstransforms() && (a.support.transform = new String(f("transform")), a.support.transform3d = j.csstransforms3d())
}(window.Zepto || window.jQuery, window, document);
window.libpannellum = function (D, h, s) {
	function P(B, d, p, la) {
		function ea(a, e) {
			return 1 == a.level && 1 != e.level ? -1 : 1 == e.level && 1 != a.level ? 1 : e.timestamp - a.timestamp
		}

		function P(a, e) {
			return a.level != e.level ? a.level - e.level : a.diff - e.diff
		}

		function I(a, e, g, d, f, b) {
			this.vertices = a;
			this.side = e;
			this.level = g;
			this.x = d;
			this.y = f;
			this.path = b.replace("%s", e).replace("%l", g).replace("%x", d).replace("%y", f)
		}

		function Y(a, e, h, k, f) {
			var b;
			var t = e.vertices;
			b = T(a, t.slice(0, 3));
			var l = T(a, t.slice(3, 6)),
				q = T(a, t.slice(6, 9)),
				t = T(a, t.slice(9, 12)),
				p = b[0] + l[0] + q[0] + t[0]; - 4 == p || 4 == p ? b = !1 : (p = b[1] + l[1] + q[1] + t[1], b = -4 == p || 4 == p ? !1 : 4 != b[2] + l[2] + q[2] + t[2]);
			if (b) {
				b = e.vertices;
				l = b[0] + b[3] + b[6] + b[9];
				q = b[1] + b[4] + b[7] + b[10];
				t = b[2] + b[5] + b[8] + b[11];
				p = Math.sqrt(l * l + q * q + t * t);
				t = Math.asin(t / p);
				l = Math.atan2(q, l) - k;
				l += l > Math.PI ? -2 * Math.PI : l < -Math.PI ? 2 * Math.PI : 0;
				l = Math.abs(l);
				e.diff = Math.acos(Math.sin(h) * Math.sin(t) + Math.cos(h) * Math.cos(t) * Math.cos(l));
				l = !1;
				for (q = 0; q < g.nodeCache.length; q++)
					if (g.nodeCache[q].path == e.path) {
						l = !0;
						g.nodeCache[q].timestamp = g.nodeCacheTimestamp++;
						g.nodeCache[q].diff = e.diff;
						g.currentNodes.push(g.nodeCache[q]);
						break
					} l || (e.timestamp = g.nodeCacheTimestamp++, g.currentNodes.push(e), g.nodeCache.push(e));
				if (e.level < g.level) {
					var t = d.cubeResolution * Math.pow(2, e.level - d.maxLevel),
						l = Math.ceil(t * d.invTileResolution) - 1,
						q = t % d.tileResolution * 2,
						y = 2 * t % d.tileResolution;
					0 === y && (y = d.tileResolution);
					0 === q && (q = 2 * d.tileResolution);
					p = 0.5;
					if (e.x == l || e.y == l) p = 1 - d.tileResolution / (d.tileResolution + y);
					var r = 1 - p,
						t = [],
						c = p,
						v = p,
						w = p,
						A = r,
						s = r,
						x = r;
					if (y < d.tileResolution)
						if (e.x == l && e.y != l) {
							if (s = v = 0.5, "d" == e.side || "u" == e.side) x = w = 0.5
						} else e.x != l && e.y == l && (A = c = 0.5, "l" == e.side || "r" == e.side) && (x = w = 0.5);
					q < d.tileResolution && (e.x == l && (c = 0, A = 1, "l" == e.side || "r" == e.side) && (w = 0, x = 1), e.y == l && (v = 0, s = 1, "d" == e.side || "u" == e.side) && (w = 0, x = 1));
					y = [b[0], b[1], b[2], b[0] * c + b[3] * A, b[1] * p + b[4] * r, b[2] * w + b[5] * x, b[0] * c + b[6] * A, b[1] * v + b[7] * s, b[2] * w + b[8] * x, b[0] * p + b[9] * r, b[1] * v + b[10] * s, b[2] * w + b[11] * x];
					y = new I(y, e.side, e.level + 1, 2 * e.x, 2 * e.y, d.fullpath);
					t.push(y);
					e.x == l && q < d.tileResolution || (y = [b[0] * c + b[3] * A, b[1] * p + b[4] * r, b[2] * w + b[5] * x, b[3], b[4], b[5], b[3] * p + b[6] * r, b[4] * v + b[7] * s, b[5] * w + b[8] * x, b[0] * c + b[6] * A, b[1] * v + b[7] * s, b[2] * w + b[8] * x], y = new I(y, e.side, e.level + 1, 2 * e.x + 1, 2 * e.y, d.fullpath), t.push(y));
					e.x == l && q < d.tileResolution || e.y == l && q < d.tileResolution || (y = [b[0] * c + b[6] * A, b[1] * v + b[7] * s, b[2] * w + b[8] * x, b[3] * p + b[6] * r, b[4] * v + b[7] * s, b[5] * w + b[8] * x, b[6], b[7], b[8], b[9] * c + b[6] * A, b[10] * p + b[7] * r, b[11] * w + b[8] * x], y = new I(y, e.side, e.level + 1, 2 * e.x + 1, 2 * e.y + 1, d.fullpath), t.push(y));
					e.y == l && q < d.tileResolution || (y = [b[0] * p + b[9] * r, b[1] * v + b[10] * s, b[2] * w + b[11] * x, b[0] * c + b[6] * A, b[1] * v + b[7] * s, b[2] * w + b[8] * x, b[9] * c + b[6] * A, b[10] * p + b[7] * r, b[11] * w + b[8] * x, b[9], b[10], b[11]], y = new I(y, e.side, e.level + 1, 2 * e.x, 2 * e.y + 1, d.fullpath), t.push(y));
					for (e = 0; e < t.length; e++) Y(a, t[e], h, k, f)
				}
			}
		}

		function Z() {
			return [-1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1]
		}

		function $(a, e, g) {
			var d = Math.sin(e);
			e = Math.cos(e);
			if ("x" == g) return [a[0], e * a[1] + d * a[2], e * a[2] - d * a[1], a[3], e * a[4] + d * a[5], e * a[5] - d * a[4], a[6], e * a[7] + d * a[8], e * a[8] - d * a[7]];
			if ("y" == g) return [e * a[0] - d * a[2], a[1], e * a[2] + d * a[0], e * a[3] - d * a[5], a[4], e * a[5] + d * a[3], e * a[6] - d * a[8], a[7], e * a[8] + d * a[6]]
		}

		function ga(a) {
			return [a[0], a[4], a[8], a[12], a[1], a[5], a[9], a[13], a[2], a[6], a[10], a[14], a[3], a[7], a[11], a[15]]
		}

		function ma(g) {
			g.texture || (g.texture = a.createTexture(), g.image = new Image, g.image.crossOrigin = "anonymous", g.image.onload = function () {
				var e = g.image;
				a.bindTexture(a.TEXTURE_2D, g.texture);
				a.texImage2D(a.TEXTURE_2D, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, e);
				a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MAG_FILTER, a.LINEAR);
				a.texParameteri(a.TEXTURE_2D, a.TEXTURE_MIN_FILTER, a.LINEAR);
				a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE);
				a.texParameteri(a.TEXTURE_2D, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE);
				a.bindTexture(a.TEXTURE_2D, null);
				g.textureLoaded = !0;
				delete g.image
			}, g.image.src = encodeURI(g.path + "." + d.extension))
		}

		function T(a, g) {
			var d = [a[0] * g[0] + a[1] * g[1] + a[2] * g[2], a[4] * g[0] + a[5] * g[1] + a[6] * g[2], a[11] + a[8] * g[0] + a[9] * g[1] + a[10] * g[2], 1 / (a[12] * g[0] + a[13] * g[1] + a[14] * g[2])],
				h = d[0] * d[3],
				f = d[1] * d[3],
				d = d[2] * d[3],
				b = [0, 0, 0]; - 1 > h && (b[0] = -1);
			1 < h && (b[0] = 1); - 1 > f && (b[1] = -1);
			1 < f && (b[1] = 1);
			if (-1 > d || 1 < d) b[2] = 1;
			return b
		}
		var r = h.createElement("canvas");
		r.style.width = r.style.height = "100%";
		B.appendChild(r);
		typeof p === s && (p = "equirectangular");
		var g, a, ha, J, aa, L;
		this.init = function (N, e, Q, D) {
			var f;
			"cubemap" == p && 0 !== (d[0].width & d[0].width - 1) && (navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 8_/) || navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 9_/) || navigator.userAgent.match(/Trident.*rv[ :]*11\./)) || (a = r.getContext("experimental-webgl", {
				alpha: !1,
				depth: !1
			}));
			if (!a && ("multires" == p && d.hasOwnProperty("fallbackPath") || "cubemap" == p) && ("WebkitAppearance" in h.documentElement.style || navigator.userAgent.match(/Trident.*rv[ :]*11\./) || -1 !== navigator.appVersion.indexOf("MSIE 10"))) {
				J && B.removeChild(J);
				J = h.createElement("div");
				J.className = "pnlm-world";
				N = d.basePath ? d.basePath + d.fallbackPath : d.fallbackPath;
				var b = "frblud".split(""),
					t = 0;
				e = function () {
					var a = h.createElement("canvas");
					a.className = "pnlm-face pnlm-" + b[this.side] + "face";
					J.appendChild(a);
					var g = a.getContext("2d");
					a.style.width = this.width + 4 + "px";
					a.style.height = this.height + 4 + "px";
					a.width = this.width + 4;
					a.height = this.height + 4;
					g.drawImage(this, 2, 2);
					var c = g.getImageData(0, 0, a.width, a.height),
						f = c.data,
						e, d;
					for (e = 2; e < a.width - 2; e++)
						for (d = 0; 4 > d; d++) f[4 * (e + a.width) + d] = f[4 * (e + 2 * a.width) + d], f[4 * (e + a.width * (a.height - 2)) + d] = f[4 * (e + a.width * (a.height - 3)) + d];
					for (e = 2; e < a.height - 2; e++)
						for (d = 0; 4 > d; d++) f[4 * (e * a.width + 1) + d] = f[4 * (e * a.width + 2) + d], f[4 * ((e + 1) * a.width - 2) + d] = f[4 * ((e + 1) * a.width - 3) + d];
					for (d = 0; 4 > d; d++) f[4 * (a.width + 1) + d] = f[4 * (2 * a.width + 2) + d], f[4 * (2 * a.width - 2) + d] = f[4 * (3 * a.width - 3) + d], f[4 * (a.width * (a.height - 2) + 1) + d] = f[4 * (a.width * (a.height - 3) + 2) + d], f[4 * (a.width * (a.height - 1) - 2) + d] = f[4 * (a.width * (a.height - 2) - 3) + d];
					for (e = 1; e < a.width - 1; e++)
						for (d = 0; 4 > d; d++) f[4 * e + d] = f[4 * (e + a.width) + d], f[4 * (e + a.width * (a.height - 1)) + d] = f[4 * (e + a.width * (a.height - 2)) + d];
					for (e = 1; e < a.height - 1; e++)
						for (d = 0; 4 > d; d++) f[e * a.width * 4 + d] = f[4 * (e * a.width + 1) + d], f[4 * ((e + 1) * a.width - 1) + d] = f[4 * ((e + 1) * a.width - 2) + d];
					for (d = 0; 4 > d; d++) f[d] = f[4 * (a.width + 1) + d], f[4 * (a.width - 1) + d] = f[4 * (2 * a.width - 2) + d], f[a.width * (a.height - 1) * 4 + d] = f[4 * (a.width * (a.height - 2) + 1) + d], f[4 * (a.width * a.height - 1) + d] = f[4 * (a.width * (a.height - 1) - 2) + d];
					g.putImageData(c, 0, 0);
					t++;
					6 == t && (ha = this.width, B.appendChild(J), D())
				};
				for (f = 0; 6 > f; f++) Q = new Image, Q.crossOrigin = "anonymous", Q.side = f, Q.onload = e, Q.src = "multires" == p ? encodeURI(N.replace("%s", b[f]) + "." + d.extension) : encodeURI(d[f].src)
			} else {
				if (!a) throw console.log("Error: no WebGL support detected!"), {
					type: "no webgl"
				};
				d.fullpath = d.basePath ? d.basePath + d.path : d.path;
				d.invTileResolution = 1 / d.tileResolution;
				var l = Z();
				aa = [];
				for (f = 0; 6 > f; f++) aa[f] = l.slice(12 * f, 12 * f + 12), l = Z();
				if ("equirectangular" == p) {
					if (f = Math.max(d.width, d.height), l = a.getParameter(a.MAX_TEXTURE_SIZE), f > l) throw console.log("Error: The image is too big; it's " + f + "px wide, but this device's maximum supported width is " + l + "px."), {
						type: "webgl size error",
						width: f,
						maxWidth: l
					}
				} else if ("cubemap" == p && (f = d[0].width, l = a.getParameter(a.MAX_CUBE_MAP_TEXTURE_SIZE), f > l)) throw console.log("Error: The cube face image is too big; it's " + f + "px wide, but this device's maximum supported width is " + l + "px."), {
					type: "webgl size error",
					width: f,
					maxWidth: l
				};
				d.horizonPitch !== s && d.horizonRoll !== s && (L = [d.horizonPitch, d.horizonRoll]);
				f = a.TEXTURE_2D;
				a.viewport(0, 0, r.width, r.height);
				var l = a.createShader(a.VERTEX_SHADER),
					q = k;
				"multires" == p && (q = z);
				a.shaderSource(l, q);
				a.compileShader(l);
				var q = a.createShader(a.FRAGMENT_SHADER),
					I = U;
				"cubemap" == p ? (f = a.TEXTURE_CUBE_MAP, I = ya) : "multires" == p && (I = na);
				a.shaderSource(q, I);
				a.compileShader(q);
				g = a.createProgram();
				a.attachShader(g, l);
				a.attachShader(g, q);
				a.linkProgram(g);
				a.getShaderParameter(l, a.COMPILE_STATUS) || console.log(a.getShaderInfoLog(l));
				a.getShaderParameter(q, a.COMPILE_STATUS) || console.log(a.getShaderInfoLog(q));
				a.getProgramParameter(g, a.LINK_STATUS) || console.log(a.getProgramInfoLog(g));
				a.useProgram(g);
				g.drawInProgress = !1;
				g.texCoordLocation = a.getAttribLocation(g, "a_texCoord");
				a.enableVertexAttribArray(g.texCoordLocation);
				"multires" != p ? (g.texCoordBuffer = a.createBuffer(), a.bindBuffer(a.ARRAY_BUFFER, g.texCoordBuffer), a.bufferData(a.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1]), a.STATIC_DRAW), a.vertexAttribPointer(g.texCoordLocation, 2, a.FLOAT, !1, 0, 0), g.aspectRatio = a.getUniformLocation(g, "u_aspectRatio"), a.uniform1f(g.aspectRatio, r.width / r.height), g.psi = a.getUniformLocation(g, "u_psi"), g.theta = a.getUniformLocation(g, "u_theta"), g.f = a.getUniformLocation(g, "u_f"), g.h = a.getUniformLocation(g, "u_h"), g.v = a.getUniformLocation(g, "u_v"), g.vo = a.getUniformLocation(g, "u_vo"), g.rot = a.getUniformLocation(g, "u_rot"), a.uniform1f(g.h, N / (2 * Math.PI)), a.uniform1f(g.v, e / Math.PI), a.uniform1f(g.vo, Q / Math.PI * 2), g.texture = a.createTexture(), a.bindTexture(f, g.texture), "cubemap" == p ? (a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_X, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, d[1]), a.texImage2D(a.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, d[3]), a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, d[4]), a.texImage2D(a.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, d[5]), a.texImage2D(a.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, d[0]), a.texImage2D(a.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, d[2])) : a.texImage2D(f, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, d), a.texParameteri(f, a.TEXTURE_WRAP_S, a.CLAMP_TO_EDGE), a.texParameteri(f, a.TEXTURE_WRAP_T, a.CLAMP_TO_EDGE), a.texParameteri(f, a.TEXTURE_MIN_FILTER, a.LINEAR), a.texParameteri(f, a.TEXTURE_MAG_FILTER, a.LINEAR)) : (g.vertPosLocation = a.getAttribLocation(g, "a_vertCoord"), a.enableVertexAttribArray(g.vertPosLocation), g.cubeVertBuf = a.createBuffer(), g.cubeVertTexCoordBuf = a.createBuffer(), g.cubeVertIndBuf = a.createBuffer(), a.bindBuffer(a.ARRAY_BUFFER, g.cubeVertTexCoordBuf), a.bufferData(a.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), a.STATIC_DRAW), a.bindBuffer(a.ELEMENT_ARRAY_BUFFER, g.cubeVertIndBuf), a.bufferData(a.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), a.STATIC_DRAW), g.perspUniform = a.getUniformLocation(g, "u_perspMatrix"), g.cubeUniform = a.getUniformLocation(g, "u_cubeMatrix"), g.level = -1, g.currentNodes = [], g.nodeCache = [], g.nodeCacheTimestamp = 0);
				if (0 !== a.getError()) throw console.log("Error: Something went wrong with WebGL!"), {
					type: "webgl error"
				};
				D()
			}
		};
		this.destroy = function () {
			B !== s && (r !== s && B.removeChild(r), J !== s && B.removeChild(J))
		};
		this.resize = function () {
			var d = D.devicePixelRatio || 1;
			r.width = r.clientWidth * d;
			r.height = r.clientHeight * d;
			a && (a.viewport(0, 0, r.width, r.height), "multires" != p && a.uniform1f(g.aspectRatio, r.width / r.height))
		};
		this.resize();
		this.render = function (h, e, k, z) {
			var f;
			if (a || "multires" != p && "cubemap" != p) {
				if ("multires" != p) {
					k = 2 * Math.atan(Math.tan(0.5 * k) / (r.width / r.height));
					k = 1 / Math.tan(0.5 * k);
					if ("equirectangular" == p && L !== s) {
						f = L[0];
						var b = L[1],
							t = h,
							l = e,
							q = Math.cos(b) * Math.sin(h) * Math.sin(f) + Math.cos(h) * (Math.cos(f) * Math.cos(e) + Math.sin(b) * Math.sin(f) * Math.sin(e)),
							B = -Math.sin(h) * Math.sin(b) + Math.cos(h) * Math.cos(b) * Math.sin(e);
						h = Math.cos(b) * Math.cos(f) * Math.sin(h) + Math.cos(h) * (-Math.cos(e) * Math.sin(f) + Math.cos(f) * Math.sin(b) * Math.sin(e));
						h = Math.asin(h);
						e = Math.atan2(B, q);
						f = [Math.cos(t) * (Math.sin(b) * Math.sin(f) * Math.cos(l) - Math.cos(f) * Math.sin(l)), Math.cos(t) * Math.cos(b) * Math.cos(l), Math.cos(t) * (Math.cos(f) * Math.sin(b) * Math.cos(l) + Math.sin(l) * Math.sin(f))];
						b = [-Math.cos(h) * Math.sin(e), Math.cos(h) * Math.cos(e)];
						b = Math.acos((f[0] * b[0] + f[1] * b[1]) / (Math.sqrt(f[0] * f[0] + f[1] * f[1] + f[2] * f[2]) * Math.sqrt(b[0] * b[0] + b[1] * b[1])));
						0 > f[2] && (b = 2 * Math.PI - b);
						a.uniform1f(g.rot, b)
					}
					a.uniform1f(g.psi, e);
					a.uniform1f(g.theta, h);
					a.uniform1f(g.f, k);
					!0 === la && "equirectangular" == p && (a.bindTexture(a.TEXTURE_2D, g.texture), a.texImage2D(a.TEXTURE_2D, 0, a.RGB, a.RGB, a.UNSIGNED_BYTE, d));
					a.drawArrays(a.TRIANGLES, 0, 6)
				} else {
					f = r.width / r.height;
					b = 2 * Math.atan(Math.tan(k / 2) * r.height / r.width);
					b = 1 / Math.tan(b / 2);
					f = [b / f, 0, 0, 0, 0, b, 0, 0, 0, 0, 100.1 / -99.9, 20 / -99.9, 0, 0, -1, 0];
					for (b = 1; b < d.maxLevel && r.width > d.tileResolution * Math.pow(2, b - 1) * Math.tan(k / 2) * 0.707;) b++;
					g.level = b;
					b = [1, 0, 0, 0, 1, 0, 0, 0, 1];
					b = $(b, -h, "x");
					b = $(b, e, "y");
					b = [b[0], b[1], b[2], 0, b[3], b[4], b[5], 0, b[6], b[7], b[8], 0, 0, 0, 0, 1];
					a.uniformMatrix4fv(g.perspUniform, !1, new Float32Array(ga(f)));
					a.uniformMatrix4fv(g.cubeUniform, !1, new Float32Array(ga(b)));
					b = [f[0] * b[0], f[0] * b[1], f[0] * b[2], 0, f[5] * b[4], f[5] * b[5], f[5] * b[6], 0, f[10] * b[8], f[10] * b[9], f[10] * b[10], f[11], -b[8], -b[9], -b[10], 0];
					g.nodeCache.sort(ea);
					200 < g.nodeCache.length && g.nodeCache.length > g.currentNodes.length + 50 && g.nodeCache.splice(200, g.nodeCache.length - 200);
					g.currentNodes = [];
					t = "fbudlr".split("");
					for (f = 0; 6 > f; f++) l = new I(aa[f], t[f], 1, 0, 0, d.fullpath), Y(b, l, h, e, k);
					g.currentNodes.sort(P);
					for (h = 0; h < g.currentNodes.length; h++)
						if (!g.currentNodes[h].texture) {
							setTimeout(ma(g.currentNodes[h]), 0);
							break
						} if (!g.drawInProgress) {
						g.drawInProgress = !0;
						for (h = 0; h < g.currentNodes.length; h++) g.currentNodes[h].textureLoaded && (a.bindBuffer(a.ARRAY_BUFFER, g.cubeVertBuf), a.bufferData(a.ARRAY_BUFFER, new Float32Array(g.currentNodes[h].vertices), a.STATIC_DRAW), a.vertexAttribPointer(g.vertPosLocation, 3, a.FLOAT, !1, 0, 0), a.bindBuffer(a.ARRAY_BUFFER, g.cubeVertTexCoordBuf), a.vertexAttribPointer(g.texCoordLocation, 2, a.FLOAT, !1, 0, 0), a.bindTexture(a.TEXTURE_2D, g.currentNodes[h].texture), a.drawElements(a.TRIANGLES, 6, a.UNSIGNED_SHORT, 0));
						g.drawInProgress = !1
					}
				}
				if (z !== s) return r.toDataURL("image/png")
			} else
				for (f = ha / 2, z = {
						f: "translate3d(-" + (f + 2) + "px, -" + (f + 2) + "px, -" + f + "px)",
						b: "translate3d(" + (f + 2) + "px, -" + (f + 2) + "px, " + f + "px) rotateX(180deg) rotateZ(180deg)",
						u: "translate3d(-" + (f + 2) + "px, -" + f + "px, " + (f + 2) + "px) rotateX(270deg)",
						d: "translate3d(-" + (f + 2) + "px, " + f + "px, -" + (f + 2) + "px) rotateX(90deg)",
						l: "translate3d(-" + f + "px, -" + (f + 2) + "px, " + (f + 2) + "px) rotateX(180deg) rotateY(90deg) rotateZ(180deg)",
						r: "translate3d(" + f + "px, -" + (f + 2) + "px, -" + (f + 2) + "px) rotateY(270deg)"
					}, k = 1 / Math.tan(k / 2), k = k * r.width / (D.devicePixelRatio || 1) / 2 + "px", e = "perspective(" + k + ") translateZ(" + k + ") rotateX(" + h + "rad) rotateY(" + e + "rad) ", k = Object.keys(z), h = 0; 6 > h; h++) f = J.querySelector(".pnlm-" + k[h] + "face").style, f.webkitTransform = e + z[k[h]], f.transform = e + z[k[h]]
		};
		this.isLoading = function () {
			if (a && "multires" == p)
				for (var d = 0; d < g.currentNodes.length; d++)
					if (!g.currentNodes[d].textureLoaded) return !0;
			return !1
		};
		this.getCanvas = function () {
			return r
		}
	}
	var k = "attribute vec2 a_texCoord;varying vec2 v_texCoord;void main() {gl_Position = vec4(a_texCoord, 0.0, 1.0);v_texCoord = a_texCoord;}",
		z = "attribute vec3 a_vertCoord;attribute vec2 a_texCoord;uniform mat4 u_cubeMatrix;uniform mat4 u_perspMatrix;varying mediump vec2 v_texCoord;void main(void) {gl_Position = u_perspMatrix * u_cubeMatrix * vec4(a_vertCoord, 1.0);v_texCoord = a_texCoord;}",
		ya = "precision mediump float;\nuniform float u_aspectRatio;\nuniform float u_psi;\nuniform float u_theta;\nuniform float u_f;\nuniform float u_h;\nuniform float u_v;\nuniform float u_vo;\nconst float PI = 3.14159265358979323846264;\nuniform samplerCube u_image;\nvarying vec2 v_texCoord;\nvoid main() {\nvec3 planePos = vec3(v_texCoord.xy, 0.0);\nplanePos.x *= u_aspectRatio;\nvec3 viewVector = planePos - vec3(0.0,0.0,-u_f);\nfloat sinpsi = sin(-u_psi);\nfloat cospsi = cos(-u_psi);\nfloat sintheta = sin(u_theta);\nfloat costheta = cos(u_theta);\nvec3 viewVectorTheta = viewVector;\nviewVectorTheta.z = viewVector.z * costheta - viewVector.y * sintheta;\nviewVectorTheta.y = viewVector.z * sintheta + viewVector.y * costheta;\nvec3 viewVectorPsi = viewVectorTheta;\nviewVectorPsi.x = viewVectorTheta.x * cospsi - viewVectorTheta.z * sinpsi;\nviewVectorPsi.z = viewVectorTheta.x * sinpsi + viewVectorTheta.z * cospsi;\ngl_FragColor = textureCube(u_image, viewVectorPsi);\n}",
		U = "precision mediump float;\nuniform float u_aspectRatio;\nuniform float u_psi;\nuniform float u_theta;\nuniform float u_f;\nuniform float u_h;\nuniform float u_v;\nuniform float u_vo;\nuniform float u_rot;\nconst float PI = 3.14159265358979323846264;\nuniform sampler2D u_image;\nvarying vec2 v_texCoord;\nvoid main() {\nfloat x = v_texCoord.x * u_aspectRatio;\nfloat y = v_texCoord.y;\nfloat sinrot = sin(u_rot);\nfloat cosrot = cos(u_rot);\nfloat rot_x = x * cosrot - y * sinrot;\nfloat rot_y = x * sinrot + y * cosrot;\nfloat sintheta = sin(u_theta);\nfloat costheta = cos(u_theta);\nfloat a = u_f * costheta - rot_y * sintheta;\nfloat root = sqrt(rot_x * rot_x + a * a);\nfloat lambda = atan(rot_x / root, a / root) + u_psi;\nfloat phi = atan((rot_y * costheta + u_f * sintheta) / root);\nif(lambda > PI)\nlambda = lambda - PI * 2.0;\nif(lambda < -PI)\nlambda = lambda + PI * 2.0;\nvec2 coord = vec2(lambda / PI, phi / (PI / 2.0));\nif(coord.x < -u_h || coord.x > u_h || coord.y < -u_v + u_vo || coord.y > u_v + u_vo)\ngl_FragColor = vec4(0, 0, 0, 1.0);\nelse\ngl_FragColor = texture2D(u_image, vec2((coord.x + u_h) / (u_h * 2.0), (-coord.y + u_v + u_vo) / (u_v * 2.0)));\n}",
		na = "varying mediump vec2 v_texCoord;uniform sampler2D u_sampler;void main(void) {gl_FragColor = texture2D(u_sampler, v_texCoord);}";
	return {
		renderer: function (h, d, k, s) {
			return new P(h, d, k, s)
		}
	}
}(window, document);
window.requestAnimationFrame || (window.requestAnimationFrame = function () {
	return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (D, h) {
		window.setTimeout(D, 1E3 / 60)
	}
}());
window.pannellum = function (D, h, s) {
	function P(k, z) {
		function P() {
			var a = h.createElement("div");
			a.innerHTML = "\x3c!--[if lte IE 9]><i></i><![endif]--\x3e";
			if (1 == a.getElementsByTagName("i").length) B();
			else {
				var b;
				if ("cubemap" == c.type) {
					C = [];
					for (a = 0; 6 > a; a++) C.push(new Image), C[a].crossOrigin = "anonymous";
					n.load.lbox.style.display = "block";
					n.load.lbar.style.display = "none"
				} else if ("multires" == c.type) a = JSON.parse(JSON.stringify(c.multiRes)), c.basePath && c.multiRes.basePath ? a.basePath = c.basePath + c.multiRes.basePath : c.basePath && (a.basePath = c.basePath), C = a;
				else if (!0 === c.dynamic) C = c.panorama;
				else {
					if (c.panorama === s) {
						B("No panorama image was specified.");
						return
					}
					C = new Image
				}
				var d = function (a) {
					return /^(?:[a-z]+:)?\/\//i.test(a) | "/" == a[0]
				};
				if ("cubemap" == c.type)
					for (var f = 6, g = function () {
							f--;
							0 === f && U()
						}, e = function (a) {
							var c = h.createElement("a");
							c.href = a.target.src;
							c.innerHTML = c.href;
							B("The file " + c.outerHTML + " could not be accessed.")
						}, a = 0; a < C.length; a++) C[a].onload = g, C[a].onerror = e, b = c.cubeMap[a], c.basePath && !d(b) && (b = c.basePath + b), C[a].src = encodeURI(b);
				else if ("multires" == c.type) U();
				else if (b = "", c.basePath && (b = c.basePath), !0 !== c.dynamic) {
					b = d(c.panorama) ? c.panorama : b + c.panorama;
					C.onload = function () {
						D.URL.revokeObjectURL(this.src);
						U()
					};
					var l = new XMLHttpRequest;
					l.onloadend = function () {
						if (200 != l.status) {
							var a = h.createElement("a");
							a.href = encodeURI(b);
							a.innerHTML = a.href;
							B("The file " + a.outerHTML + " could not be accessed.")
						}
						na(this.response);
						n.load.msg.innerHTML = ""
					};
					l.onprogress = function (a) {
						if (a.lengthComputable) {
							n.load.lbarFill.style.width = a.loaded / a.total * 100 + "%";
							var c, M;
							1E6 < a.total ? (c = "MB", M = (a.loaded / 1E6).toFixed(2), a = (a.total / 1E6).toFixed(2)) : 1E3 < a.total ? (c = "kB", M = (a.loaded / 1E3).toFixed(1), a = (a.total / 1E3).toFixed(1)) : (c = "B", M = a.loaded, a = a.total);
							n.load.msg.innerHTML = M + " / " + a + " " + c
						} else n.load.lbox.style.display = "block", n.load.lbar.style.display = "none"
					};
					try {
						l.open("GET", b, !0)
					} catch (m) {
						B("There is something wrong with the panorama URL.")
					}
					l.responseType = "blob";
					l.setRequestHeader("Accept", "image/*,*/*;q=0.9");
					l.send()
				}
				k.classList.add("pnlm-grab");
				k.classList.remove("pnlm-grabbing")
			}
		}

		function U() {
			v = new libpannellum.renderer(E, C, c.type, c.dynamic);
			!0 !== c.dynamic && (C = s);
			ua || (ua = !0, k.addEventListener("mousedown", la, !1), h.addEventListener("mousemove", xa, !1), h.addEventListener("mouseup", I, !1), k.addEventListener("mousewheel", r, !1), k.addEventListener("DOMMouseScroll", r, !1), k.addEventListener("mozfullscreenchange", l, !1), k.addEventListener("webkitfullscreenchange", l, !1), k.addEventListener("msfullscreenchange", l, !1), k.addEventListener("fullscreenchange", l, !1), D.addEventListener("resize", aa, !1), k.addEventListener("keydown", g, !1), k.addEventListener("keyup", ha, !1), k.addEventListener("blur", a, !1), h.addEventListener("mouseleave", I, !1), k.addEventListener("touchstart", Y, !1), k.addEventListener("touchmove", Z, !1), k.addEventListener("touchend", $, !1), k.addEventListener("pointerdown", ga, !1), k.addEventListener("pointermove", ma, !1), k.addEventListener("pointerup", T, !1), k.addEventListener("pointerleave", T, !1), D.navigator.pointerEnabled && (k.style.touchAction = "none"));
			try {
				v.init(c.haov * Math.PI / 180, c.vaov * Math.PI / 180, c.vOffset * Math.PI / 180, e)
			} catch (M) {
				"webgl error" == M.type || "no webgl" == M.type ? B() : "webgl size error" == M.type && B("This panorama is too big for your device! It's " + M.width + "px wide, but your device only supports images up to " + M.maxWidth + "px wide. Try another device. (If you're the author, try scaling down the image.)")
			}
			setTimeout(function () {}, 500)
		}

		function na(a) {
			var b = new FileReader;
			b.addEventListener("loadend", function () {
				var d = b.result;
				if (navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad).* os 8_/)) {
					var f = d.indexOf("\u00ff\u00c2");
					(0 > f || 65536 < f) && B("Due to iOS 8's broken WebGL implementation, only progressive encoded JPEGs work for your device (this panorama uses standard encoding).")
				}
				f = d.indexOf("<x:xmpmeta");
				if (-1 < f && !0 !== c.ignoreGPanoXMP) {
					var g = d.substring(f, d.indexOf("</x:xmpmeta>") + 12),
						e = function (a) {
							var c;
							0 <= g.indexOf(a + '="') ? (c = g.substring(g.indexOf(a + '="') + a.length + 2), c = c.substring(0, c.indexOf('"'))) : 0 <= g.indexOf(a + ">") && (c = g.substring(g.indexOf(a + ">") + a.length + 1), c = c.substring(0, c.indexOf("<")));
							return c !== s ? Number(c) : null
						},
						d = e("GPano:FullPanoWidthPixels"),
						f = e("GPano:CroppedAreaImageWidthPixels"),
						h = e("GPano:FullPanoHeightPixels"),
						k = e("GPano:CroppedAreaImageHeightPixels"),
						l = e("GPano:CroppedAreaTopPixels"),
						m = e("GPano:PoseHeadingDegrees"),
						n = e("GPano:PosePitchDegrees"),
						e = e("GPano:PoseRollDegrees");
					null !== d && null !== f && null !== h && null !== k && null !== l && (c.haov = f / d * 360, c.vaov = k / h * 180, c.vOffset = -180 * ((l + k / 2) / h - 0.5), null !== m && (c.northOffset = m, !1 !== c.compass && (c.compass = !0)), null !== n && null !== e && (C.horizonPitch = n / 180 * Math.PI, C.horizonRoll = e / 180 * Math.PI))
				}
				C.src = D.URL.createObjectURL(a)
			});
			b.readAsBinaryString !== s ? b.readAsBinaryString(a) : b.readAsText(a)
		}

		function B(a) {
			n.errorMsg.innerHTML = a !== s ? "<p>" + a + "</p>" : "<p>Your browser does not have the necessary WebGL support to display this panorama.</p>";
			u.load.style.display = "none";
			n.load.box.style.display = "none";
			n.errorMsg.style.display = "table";
			E.style.display = "none"
		}

		function d(a) {
			var c = p(a);
			O.style.left = c.x + "px";
			O.style.top = c.y + "px";
			clearTimeout(d.t1);
			clearTimeout(d.t2);
			O.style.display = "block";
			O.style.opacity = 1;
			d.t1 = setTimeout(function () {
				O.style.opacity = 0
			}, 2E3);
			d.t2 = setTimeout(function () {
				O.style.display = "none"
			}, 2500);
			a.preventDefault()
		}

		function p(a) {
			var c = k.getBoundingClientRect(),
				b = {};
			b.x = a.clientX - c.left;
			b.y = a.clientY - c.top;
			return b
		}

		function la(a) {
			a.preventDefault();
			k.focus();
			if (F) {
				var b = p(a);
				c.hotSpotDebug && (a = ea(a), console.log("Pitch: " + a[0] + ", Yaw: " + a[1] + ", Center Pitch: " + c.pitch + ", Center Yaw: " + c.yaw + ", HFOV: " + c.hfov));
				c.autoRotate = !1;
				R = !0;
				x = Date.now();
				V = b.x;
				W = b.y;
				ia = c.yaw;
				ja = c.pitch;
				k.classList.add("pnlm-grabbing");
				k.classList.remove("pnlm-grab");
				L()
			}
		}

		function ea(a) {
			var b = p(a),
				d = v.getCanvas();
			a = b.x / d.width * 2 - 1;
			var f = (1 - b.y / d.height * 2) * d.height / d.width,
				e = 1 / Math.tan(c.hfov * Math.PI / 360),
				g = Math.sin(c.pitch * Math.PI / 180),
				h = Math.cos(c.pitch * Math.PI / 180),
				b = e * h - f * g,
				d = Math.sqrt(a * a + b * b),
				f = 180 * Math.atan((f * h + e * g) / d) / Math.PI;
			a = 180 * Math.atan2(a / d, b / d) / Math.PI + c.yaw;
			return [f, a]
		}

		function xa(a) {
			if (R && F) {
				x = Date.now();
				var b = v.getCanvas();
				a = p(a);
				var d = 180 * (Math.atan(V / b.width * 2 - 1) - Math.atan(a.x / b.width * 2 - 1)) / Math.PI * c.hfov / 90 + ia;
				G = (d - c.yaw) % 360 * 0.2;
				c.yaw = d;
				d = 360 * Math.atan(Math.tan(c.hfov / 360 * Math.PI) * b.height / b.width) / Math.PI;
				b = 180 * (Math.atan(a.y / b.height * 2 - 1) - Math.atan(W / b.height * 2 - 1)) / Math.PI * d / 90 + ja;
				H = 0.2 * (b - c.pitch);
				c.pitch = b
			}
		}

		function I() {
			R && (R = !1, 15 < Date.now() - x && (H = G = 0), k.classList.add("pnlm-grab"), k.classList.remove("pnlm-grabbing"))
		}

		function Y(a) {
			if (F) {
				var b = p(a.targetTouches[0]);
				V = b.x;
				W = b.y;
				2 == a.targetTouches.length && (a = p(a.targetTouches[1]), V += 0.5 * (a.x - b.x), W += 0.5 * (a.y - b.y), ba = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)));
				R = !0;
				x = Date.now();
				ia = c.yaw;
				ja = c.pitch;
				L()
			}
		}

		function Z(a) {
			a.preventDefault();
			F && (x = Date.now());
			if (R && F) {
				var b = p(a.targetTouches[0]),
					d = b.x,
					f = b.y;
				2 == a.targetTouches.length && -1 != ba && (a = p(a.targetTouches[1]), d += 0.5 * (a.x - b.x), f += 0.5 * (a.y - b.y), b = Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)), q(c.hfov + 0.1 * (ba - b)), ba = b);
				d = 0.1 * (V - d) + ia;
				G = (d - c.yaw) % 360 * 0.2;
				c.yaw = d;
				f = 0.1 * (f - W) + ja;
				H = 0.2 * (f - c.pitch);
				c.pitch = f
			}
		}

		function $() {
			R = !1;
			150 < Date.now() - x && (H = G = 0);
			ba = -1
		}

		function ga(a) {
			"touch" == a.pointerType && (S.push(a.pointerId), ca.push({
				clientX: a.clientX,
				clientY: a.clientY
			}), a.targetTouches = ca, Y(a), a.preventDefault())
		}

		function ma(a) {
			if ("touch" == a.pointerType)
				for (var c = 0; c < S.length; c++)
					if (a.pointerId == S[c]) {
						ca[c] = {
							clientX: a.clientX,
							clientY: a.clientY
						};
						a.targetTouches = ca;
						Z(a);
						break
					}
		}

		function T(a) {
			if ("touch" == a.pointerType) {
				for (var c = !1, b = 0; b < S.length; b++) a.pointerId == S[b] && (S[b] = s), S[b] && (c = !0);
				c || (S = [], ca = [], $());
				a.preventDefault()
			}
		}

		function r(a) {
			a.preventDefault();
			F && (x = Date.now(), a.wheelDeltaY ? (q(c.hfov - 0.05 * a.wheelDeltaY), K = 0 > a.wheelDelta ? 1 : -1) : a.wheelDelta ? (q(c.hfov - 0.05 * a.wheelDelta), K = 0 > a.wheelDelta ? 1 : -1) : a.detail && (q(c.hfov + 1.5 * a.detail), K = 0 < a.detail ? 1 : -1), L())
		}

		function g(a) {
			a.preventDefault();
			c.autoRotate = !1;
			var b = a.keycode;
			a.which && (b = a.which);
			27 == b ? ka && t() : J(b, !0)
		}

		function a() {
			for (var a = 0; 10 > a; a++) m[a] = !1
		}

		function ha(a) {
			a.preventDefault();
			var c = a.keycode;
			a.which && (c = a.which);
			J(c, !1)
		}

		function J(a, c) {
			var b = !1;
			switch (a) {
				case 109:
				case 189:
				case 17:
					m[0] != c && (b = !0);
					m[0] = c;
					break;
				case 107:
				case 187:
				case 16:
					m[1] != c && (b = !0);
					m[1] = c;
					break;
				case 38:
					m[2] != c && (b = !0);
					m[2] = c;
					break;
				case 87:
					m[6] != c && (b = !0);
					m[6] = c;
					break;
				case 40:
					m[3] != c && (b = !0);
					m[3] = c;
					break;
				case 83:
					m[7] != c && (b = !0);
					m[7] = c;
					break;
				case 37:
					m[4] != c && (b = !0);
					m[4] = c;
					break;
				case 65:
					m[8] != c && (b = !0);
					m[8] = c;
					break;
				case 39:
					m[5] != c && (b = !0);
					m[5] = c;
					break;
				case 68:
					m[9] != c && (b = !0), m[9] = c
			}
			b && c && (X = "undefined" !== typeof performance && performance.now() ? performance.now() : Date.now(), L())
		}

		function aa() {
			v.resize();
			L();
			l()
		}

		function L() {
			oa || (oa = !0, N())
		}

		function N() {
			var a;
			F && (180 < c.yaw ? c.yaw -= 360 : -180 > c.yaw && (c.yaw += 360), a = c.yaw, c.yaw = Math.max(c.minYaw, Math.min(c.maxYaw, c.yaw)), !1 !== c.autoRotate && a != c.yaw && (c.autoRotate *= -1), c.pitch = Math.max(c.minPitch, Math.min(c.maxPitch, c.pitch)), v.render(c.pitch * Math.PI / 180, c.yaw * Math.PI / 180, c.hfov * Math.PI / 180), sa(), c.compass && (da.style.transform = "rotate(" + (-c.yaw - c.northOffset) + "deg)", da.style.webkitTransform = "rotate(" + (-c.yaw - c.northOffset) + "deg)"));
			if (R) requestAnimationFrame(N);
			else if (m[0] || m[1] || m[2] || m[3] || m[4] || m[5] || m[6] || m[7] || m[8] || m[9] || c.autoRotate || 0.01 < Math.abs(G) || 0.01 < Math.abs(H) || 0.01 < Math.abs(K)) {
				if (F) {
					a = c.pitch;
					var b = c.yaw,
						d = c.hfov,
						f;
					f = "undefined" !== typeof performance && performance.now() ? performance.now() : Date.now();
					X === s && (X = f);
					var e = (f - X) * c.hfov / 1700,
						e = Math.min(e, 1);
					m[0] && !0 === c.keyboardZoom && q(c.hfov + (0.8 * K + 0.5) * e);
					m[1] && !0 === c.keyboardZoom && q(c.hfov + (0.8 * K - 0.2) * e);
					if (m[2] || m[6]) c.pitch += (0.8 * H + 0.2) * e;
					if (m[3] || m[7]) c.pitch += (0.8 * H - 0.2) * e;
					if (m[4] || m[8]) c.yaw += (0.8 * G - 0.2) * e;
					if (m[5] || m[9]) c.yaw += (0.8 * G + 0.2) * e;
					var g = Date.now() - x;
					c.autoRotate && g > c.autoRotateInactivityDelay && !1 !== c.autoRotateStopDelay && (1E-6 < e && (c.yaw -= c.autoRotate / 60 * e), c.autoRotateStopDelay && (c.autoRotateStopDelay -= f - X, 0 >= c.autoRotateStopDelay && (c.autoRotateStopDelay = !1)));
					0 < e && (m[4] || m[5] || m[8] || m[9] || (c.yaw += G * e * 0.85), m[2] || m[3] || m[6] || m[7] || (c.pitch += H * e * 0.85), m[0] || m[1] || q(c.hfov + K * e * 0.85));
					X = f;
					0 < e && (G = 0.8 * G + (c.yaw - b) / e * 0.2, H = 0.8 * H + (c.pitch - a) / e * 0.2, K = 0.8 * K + (c.hfov - d) / e * 0.2, G = Math.min(5, Math.max(G, -5)), H = Math.min(5, Math.max(H, -5)), K = Math.min(5, Math.max(K, -5)));
					m[0] && m[0] && (K = 0);
					(m[2] || m[6]) && (m[3] || m[7]) && (H = 0);
					(m[4] || m[8]) && (m[5] || m[9]) && (G = 0)
				}
				requestAnimationFrame(N)
			} else v && (v.isLoading() || !0 === c.dynamic && va) ? requestAnimationFrame(N) : oa = !1
		}

		function e() {
			if (w !== s && (w.destroy(), c.sceneFadeDuration && w.fadeImg !== s)) {
				w.fadeImg.style.opacity = 0;
				var a = w.fadeImg;
				w = s;
				setTimeout(function () {
					E.removeChild(a)
				}, c.sceneFadeDuration)
			}
			da.style.display = c.compass ? "inline" : "none";
			Q();
			n.load.box.style.display = "none";
			A !== s && (E.removeChild(A), A = s);
			F = !0;
			L()
		}

		function Q() {
			pa || (c.hotSpots ? (c.hotSpots = c.hotSpots.sort(function (a, c) {
				return a.pitch < c.pitch
			}), c.hotSpots.forEach(function (a) {
				var c = h.createElement("div");
				c.className = "pnlm-hotspot pnlm-tooltip pnlm-sprite pnlm-" + fa(a.type);
				var b = h.createElement("span");
				a.text && (b.innerHTML = fa(a.text));
				var d;
				if (a.URL) d = h.createElement("a"), d.href = encodeURI(a.URL), d.target = "_blank", E.appendChild(d), c.style.cursor = "pointer", b.style.cursor = "pointer", d.appendChild(c);
				else if (a.video) d = h.createElement("video"), d.src = encodeURI(a.video), d.controls = !0, d.style.width = a.width + "px", E.appendChild(c), b.appendChild(d);
				else if (a.image) {
					d = h.createElement("a");
					d.href = encodeURI(a.image);
					d.target = "_blank";
					b.appendChild(d);
					var e = h.createElement("img");
					e.src = encodeURI(a.image);
					e.style.width = a.width + "px";
					e.style.paddingTop = "5px";
					E.appendChild(c);
					d.appendChild(e);
					b.style.maxWidth = "initial"
				} else a.sceneId && (c.onclick = function () {
					y(a.sceneId, a.targetPitch, a.targetYaw);
					return !1
				}, c.ontouchend = function () {
					y(a.sceneId, a.targetPitch, a.targetYaw);
					return !1
				}, c.style.cursor = "pointer", b.style.cursor = "pointer"), E.appendChild(c);
				c.appendChild(b);
				b.style.width = b.scrollWidth - 20 + "px";
				b.style.marginLeft = -(b.scrollWidth - 26) / 2 + "px";
				b.style.marginTop = -b.scrollHeight - 12 + "px";
				a.div = c
			})) : c.hotSpots = [], pa = !0, sa())
		}

		function sa() {
			c.hotSpots.forEach(function (a) {
				var b = Math.sin(a.pitch * Math.PI / 180),
					d = Math.cos(a.pitch * Math.PI / 180),
					e = Math.sin(c.pitch * Math.PI / 180),
					f = Math.cos(c.pitch * Math.PI / 180),
					g = Math.cos((-a.yaw + c.yaw) * Math.PI / 180),
					h = Math.tan(c.hfov * Math.PI / 360),
					k = b * e + d * g * f;
				if (90 >= a.yaw && -90 < a.yaw && 0 >= k || (90 < a.yaw || -90 >= a.yaw) && 0 >= k) a.div.style.visibility = "hidden";
				else {
					a.div.style.visibility = "visible";
					var l = v.getCanvas(),
						m = l.width / (D.devicePixelRatio || 1),
						l = l.height / (D.devicePixelRatio || 1),
						b = "translate(" + (-m / h * Math.sin((-a.yaw + c.yaw) * Math.PI / 180) * d / k / 2 + m / 2 - 13) + "px, " + (-m / h * (b * f - d * g * e) / k / 2 + l / 2 - 13) + "px) translateZ(9999px)";
					a.div.style.webkitTransform = b;
					a.div.style.MozTransform = b;
					a.div.style.transform = b
				}
			})
		}

		function f(a) {
			c = {};
			var b, d = ["haov", "vaov", "vOffset", "northOffset"];
			for (b in qa) qa.hasOwnProperty(b) && (c[b] = qa[b]);
			for (b in z.default) z.default.hasOwnProperty(b) && (c[b] = z.default[b], 0 <= d.indexOf(b) && (c.ignoreGPanoXMP = !0));
			if (null !== a && "" !== a && z.scenes && z.scenes[a]) {
				var e = z.scenes[a];
				for (b in e) e.hasOwnProperty(b) && (c[b] = e[b], 0 <= d.indexOf(b) && (c.ignoreGPanoXMP = !0));
				c.activeScene = a
			}
			for (b in z) z.hasOwnProperty(b) && (c[b] = z[b], 0 <= d.indexOf(b) && (c.ignoreGPanoXMP = !0))
		}

		function b() {
			if ("preview" in c) {
				var a = c.preview;
				c.basePath && (a = c.basePath + a);
				A = h.createElement("div");
				A.className = "pnlm-preview-img";
				A.style.backgroundImage = "url('" + encodeURI(a) + "')";
				E.appendChild(A)
			}
			for (var b in c)
				if (c.hasOwnProperty(b)) switch (b) {
					case "title":
						n.title.innerHTML = fa(c[b]);
						n.container.style.display = "inline";
						break;
					case "author":
						n.author.innerHTML = "by " + fa(c[b]);
						n.container.style.display = "inline";
						break;
					case "fallback":
						n.errorMsg.innerHTML = '<p>Your browser does not support WebGL.<br><a href="' + encodeURI(c[b]) + '" target="_blank">Click here to view this panorama in an alternative viewer.</a></p>';
						break;
					case "hfov":
						q(Number(c[b]));
						break;
					case "pitch":
						c.pitch = Math.max(c.minPitch, Math.min(c.maxPitch, c.pitch));
						break;
					case "autoLoad":
						!0 === c[b] && w === s && (n.load.box.style.display = "inline", u.load.style.display = "none", P());
						break;
					case "showZoomCtrl":
						u.zoom.style.display = c[b] ? "block" : "none";
						break;
					case "showFullscreenCtrl":
						u.fullscreen.style.display = c[b] && ("fullscreen" in h || "mozFullScreen" in h || "webkitIsFullScreen" in h || "msFullscreenElement" in h) ? "block" : "none"
				}
		}

		function t() {
			if (F && !wa)
				if (ka) h.exitFullscreen ? h.exitFullscreen() : h.mozCancelFullScreen ? h.mozCancelFullScreen() : h.webkitCancelFullScreen ? h.webkitCancelFullScreen() : h.msExitFullscreen && h.msExitFullscreen();
				else try {
					k.requestFullscreen ? k.requestFullscreen() : k.mozRequestFullScreen ? k.mozRequestFullScreen() : k.msRequestFullscreen ? k.msRequestFullscreen() : k.webkitRequestFullScreen()
				} catch (a) {}
		}

		function l() {
			h.fullscreen || h.mozFullScreen || h.webkitIsFullScreen || h.msFullscreenElement ? (u.fullscreen.classList.add("pnlm-fullscreen-toggle-button-active"), ka = !0) : (u.fullscreen.classList.remove("pnlm-fullscreen-toggle-button-active"), ka = !1)
		}

		function q(a) {
			var b = c.minHfov;
			"multires" == c.type && v && (b = Math.min(b, v.getCanvas().width / (c.multiRes.cubeResolution / 90 * 0.9)));
			b >= c.maxHfov ? console.log("HFOV bounds do not make sense (minHfov >= maxHfov).") : c.hfov = a < b ? b : a > c.maxHfov ? c.maxHfov : a
		}

		function ta() {
			n.load.box.style.display = "none";
			n.errorMsg.style.display = "none";
			wa = !1;
			u.load.style.display = "none";
			n.load.box.style.display = "inline";
			P()
		}

		function y(a, d, e) {
			F = !1;
			w = v;
			var g;
			if (c.sceneFadeDuration) {
				g = new Image;
				g.className = "pnlm-fade-img";
				g.style.transition = "opacity " + c.sceneFadeDuration / 1E3 + "s";
				g.style.width = "100%";
				g.style.height = "100%";
				var h = v.render(c.pitch * Math.PI / 180, c.yaw * Math.PI / 180, c.hfov * Math.PI / 180, !0);
				h !== s && (g.src = h);
				E.appendChild(g);
				w.fadeImg = g
			}
			d = "same" === d ? c.pitch : d;
			e = "same" === e ? c.yaw : "sameAzimuth" === e ? c.yaw + c.northOffset - z.scenes[a].northOffset : e;
			if (c.hotSpots)
				for (g = 0; g < c.hotSpots.length; g++) {
					for (h = c.hotSpots[g].div; h.parentNode != E;) h = h.parentNode;
					E.removeChild(h);
					delete c.hotSpots[g].div
				}
			pa = !1;
			delete c.hotSpots;
			f(a);
			b();
			d && (c.pitch = d);
			e && (c.yaw = e);
			ta()
		}

		function fa(a) {
			return String(a).replace(/&/g, "&amp;").replace('"', "&quot;").replace("'", "&#39;").replace("<", "&lt;").replace(">", "&gt;").replace("/", "&#x2f;")
		}
		var c, v, w, A, R = !1,
			x = Date.now(),
			V = 0,
			W = 0,
			ba = -1,
			ia = 0,
			ja = 0,
			m = Array(10),
			ka = !1,
			F = !1,
			wa = !1,
			ua = !1,
			C, X, G = 0,
			H = 0,
			K = 0,
			oa = !1,
			va = !1,
			pa = !1,
			qa = {
				hfov: 100,
				minHfov: 50,
				maxHfov: 120,
				pitch: 0,
				minPitch: -85,
				maxPitch: 85,
				yaw: 0,
				minYaw: -180,
				maxYaw: 180,
				haov: 360,
				vaov: 180,
				vOffset: 0,
				autoRotate: !1,
				autoRotateInactivityDelay: -1,
				type: "equirectangular",
				northOffset: 0,
				showFullscreenCtrl: !0,
				dynamic: !1,
				keyboardZoom: !0
			};
		k = "string" === typeof k ? h.getElementById(k) : k;
		k.className += " pnlm-container";
		k.tabIndex = 0;
		var E = h.createElement("div");
		E.className = "pnlm-render-container";
		k.appendChild(E);
		var ra = h.createElement("div");
		ra.className = "pnlm-dragfix";
		k.appendChild(ra);
		var O = h.createElement("span");
		O.className = "pnlm-about-msg";
		O.innerHTML = '<a href="http://pannellum.org/" target="_blank">Pannellum</a> 2.2.1';
		k.appendChild(O);
		ra.addEventListener("contextmenu", d);
		var n = {};
		n.container = h.createElement("div");
		n.container.className = "pnlm-panorama-info";
		n.title = h.createElement("div");
		n.title.className = "pnlm-title-box";
		n.container.appendChild(n.title);
		n.author = h.createElement("div");
		n.author.className = "pnlm-author-box";
		n.container.appendChild(n.author);
		k.appendChild(n.container);
		n.load = {};
		n.load.box = h.createElement("div");
		n.load.box.className = "pnlm-load-box";
		n.load.box.innerHTML = "<p>Loading...</p>";
		n.load.lbox = h.createElement("div");
		n.load.lbox.className = "pnlm-lbox";
		n.load.lbox.innerHTML = '<div class="pnlm-loading"></div>';
		n.load.box.appendChild(n.load.lbox);
		n.load.lbar = h.createElement("div");
		n.load.lbar.className = "pnlm-lbar";
		n.load.lbarFill = h.createElement("div");
		n.load.lbarFill.className = "pnlm-lbar-fill";
		n.load.lbar.appendChild(n.load.lbarFill);
		n.load.box.appendChild(n.load.lbar);
		n.load.msg = h.createElement("p");
		n.load.msg.className = "pnlm-lmsg";
		n.load.box.appendChild(n.load.msg);
		k.appendChild(n.load.box);
		n.errorMsg = h.createElement("div");
		n.errorMsg.className = "pnlm-error-msg pnlm-info-box";
		k.appendChild(n.errorMsg);
		var u = {};
		u.load = h.createElement("div");
		u.load.className = "pnlm-load-button";
		u.load.innerHTML = "<p>Click to<br>Load<br>Panorama<p>";
		u.load.addEventListener("click", ta);
		k.appendChild(u.load);
		u.zoom = h.createElement("div");
		u.zoom.className = "pnlm-zoom-controls pnlm-controls";
		u.zoomIn = h.createElement("div");
		u.zoomIn.className = "pnlm-zoom-in pnlm-sprite pnlm-control";
		u.zoomIn.addEventListener("click", function () {
			F && q(c.hfov - 5)
		});
		u.zoom.appendChild(u.zoomIn);
		u.zoomOut = h.createElement("div");
		u.zoomOut.className = "pnlm-zoom-out pnlm-sprite pnlm-control";
		u.zoomOut.addEventListener("click", function () {
			F && q(c.hfov + 5)
		});
		u.zoom.appendChild(u.zoomOut);
		k.appendChild(u.zoom);
		u.fullscreen = h.createElement("div");
		u.fullscreen.addEventListener("click", t);
		u.fullscreen.className = "pnlm-fullscreen-toggle-button pnlm-sprite pnlm-fullscreen-toggle-button-inactive pnlm-controls pnlm-control";
		(h.fullscreenEnabled || h.mozFullScreenEnabled || h.webkitFullscreenEnabled) && k.appendChild(u.fullscreen);
		var da = h.createElement("div");
		da.className = "pnlm-compass pnlm-controls pnlm-control";
		k.appendChild(da);
		z.firstScene ? f(z.firstScene) : z.default && z.default.firstScene ? f(z.default.firstScene) : f(null);
		b();
		var S = [],
			ca = [];
		this.getPitch = function () {
			return c.pitch
		};
		this.setPitch = function (a) {
			c.pitch = Math.max(c.minPitch, Math.min(c.maxPitch, a));
			return this
		};
		this.getPitchBounds = function () {
			return [c.minPitch, c.maxPitch]
		};
		this.setPitchBounds = function (a) {
			c.minPitch = Math.max(-90, Math.min(a[0], 90));
			c.maxPitch = Math.max(-90, Math.min(a[1], 90));
			return this
		};
		this.getYaw = function () {
			return c.yaw
		};
		this.setYaw = function (a) {
			for (; 180 < a;) a -= 360;
			for (; - 180 > a;) a += 360;
			c.yaw = Math.max(c.minYaw, Math.min(c.maxYaw, a));
			return this
		};
		this.getYawBounds = function () {
			return [c.minYaw, c.maxYaw]
		};
		this.setYawBounds = function (a) {
			c.minYaw = Math.max(-180, Math.min(a[0], 180));
			c.maxYaw = Math.max(-180, Math.min(a[1], 180));
			return this
		};
		this.getHfov = function () {
			return c.hfov
		};
		this.setHfov = function (a) {
			q(a);
			return this
		};
		this.getHfovBounds = function () {
			return [c.minHfov, c.maxHfov]
		};
		this.setHfovBounds = function (a) {
			c.minHfov = Math.max(0, a[0]);
			c.maxHfov = Math.max(0, a[1]);
			return this
		};
		this.getRenderer = function () {
			return v
		};
		this.setUpdate = function (a) {
			va = !0 === a;
			v === s ? U() : requestAnimationFrame(N);
			return this
		};
		this.mouseEventToCoords = function (a) {
			return ea(a)
		}
	}
	return {
		viewer: function (h, s) {
			return new P(h, s)
		}
	}
}(window, document);