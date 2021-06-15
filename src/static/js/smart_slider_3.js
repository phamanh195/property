(function () {
	var e = this;
	e.N2_ = e.N2_ || {
		r: [],
		d: []
	}, e.N2R = e.N2R || function () {
		e.N2_.r.push(arguments)
	}, e.N2D = e.N2D || function () {
		e.N2_.d.push(arguments)
	}
}).call(window), N2D("SmartSliderBackgrounds", function (e, t) {
	function i(t) {
		this.device = null, this.slider = t, this.hasFixed = !1, this.lazyLoad = t.parameters.lazyLoad, this.lazyLoadNeighbor = t.parameters.lazyLoadNeighbor, this.deviceDeferred = e.Deferred(), this.slider.sliderElement.one("SliderDevice", e.proxy(this.onSlideDeviceChangedFirst, this)), this.slider.sliderElement.on("visibleSlidesChanged", e.proxy(this.onVisibleSlidesChanged, this)), this.slider.sliderElement.on("slideCountChanged", e.proxy(this.onVisibleSlidesChanged, this))
	}
	return i.prototype.whenWithProgress = function (t) {
		for (var i = 0, s = e.Deferred(), r = 0; r < t.length; r++) e.when(t[r]).done(function () {
			s.notify(++i, t.length)
		});
		return e.when.apply(e, t).done(function () {
			s.resolveWith(null, arguments)
		}), s
	}, i.prototype.getBackgroundImages = function () {
		for (var e = [], t = 0; t < this.slider.realSlides.length; t++) e.push(this.slider.realSlides[t].background);
		return e
	}, i.prototype.onVisibleSlidesChanged = function () {
		1 == this.lazyLoad ? this.load = e.when.apply(e, this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide))) : 2 == this.lazyLoad && (this.load = e.when.apply(e, this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide))))
	}, i.prototype.onSlideDeviceChangedFirst = function (t, i) {
		this.onSlideDeviceChanged(t, i), this.deviceDeferred.resolve(), this.slider.sliderElement.on("SliderDevice", e.proxy(this.onSlideDeviceChanged, this)), 1 == this.lazyLoad ? (this.preLoadSlides = this.preloadSlidesLazyNeighbor, this.load = this.whenWithProgress(e, this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide)))) : 2 == this.lazyLoad ? (this.preLoadSlides = this._preLoadSlides, e(window).on("load", e.proxy(this.preLoadAll, this)), this.load = this.whenWithProgress(e, this.preLoadSlides(this.slider.getVisibleSlides(this.slider.currentSlide)))) : (this.preLoadSlides = this._preLoadSlides, this.load = this.whenWithProgress(this.preLoadAll()))
	}, i.prototype.onSlideDeviceChanged = function (e, t) {
		this.device = t;
		for (var i = 0; i < this.slider.realSlides.length; i++) this.slider.realSlides[i].background && this.slider.realSlides[i].background.updateBackgroundToDevice(t)
	}, i.prototype.preLoadAll = function () {
		for (var e = [], t = 0; t < this.slider.realSlides.length; t++) e.push(this.slider.realSlides[t].preLoad());
		return e
	}, i.prototype._preLoadSlides = function (e) {
		var t = [];
		"[object Array]" !== Object.prototype.toString.call(e) && (e = [e]);
		for (var i = 0; i < e.length; i++) t.push(e[i].preLoad());
		return t
	}, i.prototype.preloadSlidesLazyNeighbor = function (t) {
		var i = this._preLoadSlides(t);
		if (this.lazyLoadNeighbor)
			for (var s = 0, r = t[0].previousSlide, n = t[t.length - 1].nextSlide; s < this.lazyLoadNeighbor;) i.push(r.preLoad()), r = r.previousSlide, i.push(n.preLoad()), n = n.nextSlide, s++;
		var o = e.Deferred();
		if ("resolved" != i[0].state()) {
			var a = setTimeout(e.proxy(function () {
				this.slider.load.showSpinner("backgroundImage" + t[0].index), a = null
			}, this), 50);
			e.when.apply(e, i).done(e.proxy(function () {
				a ? (clearTimeout(a), a = null) : this.slider.load.removeSpinner("backgroundImage" + t[0].index), setTimeout(function () {
					o.resolve()
				}, 100)
			}, this))
		} else setTimeout(function () {
			o.resolve()
		}, 100);
		return i.push(o), i
	}, i.prototype.hack = function () {
		for (var e = 0; e < this.slider.realSlides.length; e++) this.slider.realSlides[e].background && this.slider.realSlides[e].background.hack()
	}, i
}), N2D("FontSize", function (e, t) {
	function i() {
		return s === t && (s = e('<div style="font-size:10rem;"></div>').appendTo("body")), parseFloat(s.css("fontSize")) / 10
	}
	var s;
	return {
		toRem: function (e) {
			return e / i() + "rem"
		}
	}
}), N2D("SmartSliderLoad", function (e, t) {
	function i(t, i) {
		this.parameters = e.extend({
			fade: 1,
			scroll: 0
		}, i), this.deferred = e.Deferred(), this.smartSlider = t, this.spinnerCouner = 0, this.id = t.sliderElement.attr("id"), this.$window = e(window), this.spinner = e("#" + this.id + "-spinner")
	}
	return i.prototype.start = function () {
		if (this.parameters.scroll) {
			var t = e(window);
			t.on("scroll." + this.id, e.proxy(this.onScroll, this)), this.onScroll()
		} else if (this.parameters.fade) {
			this.loadingArea = e("#" + this.id + "-placeholder").eq(0), this.showSpinner("fadePlaceholder");
			var i = this.spinner.find(".n2-ss-spinner-counter");
			i.length && (i.html("0%"), this.smartSlider.backgrounds.load.progress(e.proxy(function (e, t) {
				i.html(Math.round(e / (t + 1) * 100) + "%")
			}, this))), this.showSlider()
		} else this.showSlider()
	}, i.prototype.onScroll = function () {
		this.$window.scrollTop() + this.$window.height() > this.smartSlider.sliderElement.offset().top + 100 && (this.$window.off("scroll." + this.id), this.showSlider())
	}, i.prototype.loadLayerImages = function () {
		var t = e.Deferred();
		return this.smartSlider.sliderElement.find(".n2-ss-layers-container").n2imagesLoaded().always(function () {
			t.resolve()
		}), t
	}, i.prototype.showSlider = function () {
		e.when(this.smartSlider.responsive.ready, this.smartSlider.backgrounds.load, this.loadLayerImages()).always(e.proxy(function () {
			this._showSlider()
		}, this))
	}, i.prototype._showSlider = function (t) {
		this.smartSlider.responsive.isReadyToResize = !0, e.when.apply(e, this.smartSlider.widgetDeferreds).done(e.proxy(function () {
			this.smartSlider.responsive.invalidateResponsiveState = !0, this.smartSlider.responsive.doResize(), this.smartSlider.mainAnimation && this.smartSlider.mainAnimation.setToStarterSlide(this.smartSlider.starterSlide), this.smartSlider.starterSlide.setStarterSlide(), this.smartSlider.sliderElement.trigger("BeforeVisible"), this.smartSlider.responsive.alignElement.addClass("n2-ss-align-visible"), this.smartSlider.sliderElement.addClass("n2-ss-loaded").removeClass("n2notransition"), this.spinner.find(".n2-ss-spinner-counter").html(""), this.removeSpinner("fadePlaceholder"), e("#" + this.id + "-placeholder").remove(), this.loadingArea = this.smartSlider.sliderElement, "function" == typeof t ? t(this.deferred) : this.deferred.resolve(), this.smartSlider.sliderElement.triggerHandler("Show")
		}, this))
	}, i.prototype.loaded = function (e) {
		this.deferred.done(e)
	}, i.prototype.showSpinner = function (e) {
		0 === this.spinnerCouner && this.spinner.appendTo(this.loadingArea).css("display", ""), this.spinnerCouner++
	}, i.prototype.removeSpinner = function (e) {
		this.spinnerCouner--, this.spinnerCouner <= 0 && (this.spinner.detach(), this.spinnerCouner = 0)
	}, i
}), N2D("ScrollTracker", function (e, t, i) {
	function s() {
		this.started = !1, this.items = []
	}
	return s.prototype.add = function (e, t, i, s) {
		var r = {
			$el: e,
			mode: t,
			onVisible: i,
			onHide: s,
			state: "unknown"
		};
		this.items.push(r), this._onScroll(r, Math.max(document.documentElement.clientHeight, window.innerHeight)), this.started || this.start()
	}, s.prototype.start = function () {
		this.started || (e(window).on("scroll.scrollTracker", e.proxy(this.onScroll, this)), this.started = !0)
	}, s.prototype.onScroll = function (e) {
		for (var t = Math.max(document.documentElement.clientHeight, window.innerHeight), i = 0; i < this.items.length; i++) this._onScroll(this.items[i], t)
	}, s.prototype._onScroll = function (e, t) {
		var i = e.$el[0].getBoundingClientRect(),
			s = i.height > .7 * t,
			r = !0;
		"partly-visible" === e.mode ? s && (i.bottom < 0 || i.top >= i.height) ? r = !1 : !s && (i.bottom - i.height < 0 || i.top - t + i.height >= 0) && (r = !1) : "not-visible" === e.mode && (r = i.top - t < 0 && i.top + i.height > 0), r === !1 ? "hidden" !== e.state && ("function" == typeof e.onHide && e.onHide(), e.state = "hidden") : "visible" !== e.state && ("function" == typeof e.onVisible && e.onVisible(), e.state = "visible")
	}, new s
}), N2D("SmartSliderApi", function (e, t) {
	function i() {
		this.sliders = {}, this.readys = {}
	}
	i.prototype.makeReady = function (e, t) {
		if (this.sliders[e] = t, "undefined" != typeof this.readys[e])
			for (var i = 0; i < this.readys[e].length; i++) this.readys[e][i].call(t, t, t.sliderElement)
	}, i.prototype.ready = function (e, t) {
		"undefined" != typeof this.sliders[e] ? t.call(this.sliders[e], this.sliders[e], this.sliders[e].sliderElement) : ("undefined" == typeof this.readys[e] && (this.readys[e] = []), this.readys[e].push(t))
	}, i.prototype.trigger = function (t, i, s) {
		s && s.preventDefault();
		var r = e(t),
			n = i.split(","),
			o = r.closest(".n2-ss-slide,.n2-ss-static-slide"),
			a = o.data("ss-last-event");
		r.data("ss-reset-events") || (r.data("ss-reset-events", 1), o.on("layerAnimationPlayIn.resetCounter", e.proxy(function (e) {
			e.data("ss-last-event", "")
		}, this, o)));
		for (var l = n.length - 1, h = 0; h < n.length; h++) n[h] === a && (l = h);
		i = l === n.length - 1 ? n[0] : n[l + 1], o.data("ss-last-event", i), o.triggerHandler("ss" + i)
	}, i.prototype.applyAction = function (t, i) {
		if (this.isClickAllowed(t)) {
			var s = t.currentTarget,
				r = e(s).closest(".n2-ss-slider").data("ss");
			r[i].apply(r, Array.prototype.slice.call(arguments, 2))
		}
	}, i.prototype.applyActionWithClick = function (e) {
		this.isClickAllowed(e) && (nextend.shouldPreventClick || (e.preventDefault(), this.applyAction.apply(this, arguments)))
	}, i.prototype.isClickAllowed = function (t) {
		return !e.contains(t.currentTarget, e(t.target).closest('a[href!="#"], *[onclick][onclick!=""], *[data-n2click][data-n2click!=""], *[n2-lightbox]').get(0))
	}, i.prototype.openUrl = function (t, i) {
		if (this.isClickAllowed(t)) {
			var s = e(t.currentTarget),
				r = s.data("href");
			if ("undefined" == typeof i && (i = s.data("target")), "_blank" === i) {
				var n = window.open();
				n.opener = null, n.location = r
			} else n2const.setLocation(r)
		}
	};
	var s = {
		to: function (t) {
			e("html, body").animate({
				scrollTop: t
			}, window.n2ScrollSpeed || 400)
		},
		top: function () {
			s.to(0)
		},
		bottom: function () {
			s.to(e(document).height() - e(window).height())
		},
		before: function (t) {
			s.to(t.offset().top - e(window).height())
		},
		after: function (e) {
			s.to(e.offset().top + e.height())
		},
		next: function (t, i) {
			var r = e(i),
				n = -1;
			r.each(function (i, s) {
				return e(t).is(s) || e.contains(s, t) ? (n = i + 1, !1) : void 0
			}), -1 !== n && n <= r.length && s.element(r.eq(n))
		},
		previous: function (t, i) {
			var r = e(i),
				n = -1;
			r.each(function (i, s) {
				return e(t).is(s) || e.contains(s, t) ? (n = i - 1, !1) : void 0
			}), n >= 0 && s.element(r.eq(n))
		},
		element: function (t) {
			var i = e(window.n2ScrollOffsetSelector).height();
			s.to(e(t).offset().top - i)
		}
	};
	return i.prototype.scroll = function (e, t) {
		this.isClickAllowed(e) && (e.preventDefault(), s[t].apply(window, Array.prototype.slice.call(arguments, 2)))
	}, window.n2ss = new i, i
}), N2D("SmartSliderAbstract", function ($, undefined) {
	function SmartSliderAbstract(e, t) {
		this.editor = null, this.startedDeferred = $.Deferred(), this.visibleDeferred = $.Deferred(), e instanceof $ && (e = "#" + e.attr("id"));
		var i = e.substr(1);
		if (this.elementID = i, window[i] && window[i] instanceof SmartSliderAbstract)
			if (window[i].__$sliderElement && !$.contains(document.body, window[i].__$sliderElement.get(0)));
			else {
				if (window[i].sliderElement === undefined) return void console.error("Slider [#" + i + "] inited multiple times");
				if ($.contains(document.body, window[i].sliderElement.get(0))) return void console.error("Slider [#" + i + "] embedded multiple times")
			} this.readyDeferred = $.Deferred(), N2D(e, $.proxy(function () {
			return this
		}, this)), this.isAdmin = !!t.admin, this.id = parseInt(i.replace("n2-ss-", "")), window[i] = this, t.isDelayed !== undefined && t.isDelayed ? $(window).ready($.proxy(function () {
			this.waitForExists(i, t)
		}, this)) : this.waitForExists(i, t)
	}
	return SmartSliderAbstract.prototype.kill = function () {
		this.killed = !0;
		var e = this.sliderElement.attr("id"),
			t = $("#" + e + "-placeholder");
		t.length ? t.remove() : N2R("documentReady", function (t) {
			t("#" + e + "-placeholder").remove()
		});
		var i = this.sliderElement.closest(".n2-ss-margin");
		i.length ? i.remove() : N2R("documentReady", $.proxy(function (e) {
			this.sliderElement.closest(".n2-ss-margin").remove()
		}, this));
		var s = this.sliderElement.closest(".n2-ss-align");
		s.length ? s.remove() : N2R("documentReady", $.proxy(function (e) {
			this.sliderElement.closest(".n2-ss-align").remove()
		}, this)), n2ss.makeReady(this.id, this), this.readyDeferred.resolve()
	}, SmartSliderAbstract.prototype.waitForExists = function (e, t) {
		var i = $.Deferred(),
			s = function () {
				var t = $("#" + e);
				t.length ? i.resolve(t) : setTimeout(s, 500)
			};
		i.done($.proxy(this.onSliderExists, this, e, t)), s()
	}, SmartSliderAbstract.prototype.onSliderExists = function (e, t, i) {
		if (this.__$sliderElement = i, "TEMPLATE" === i.prop("tagName")) {
			var s = i.data("dependency"),
				r = i.data("delay"),
				n = $.proxy(function () {
					var s = $(i.html());
					i.replaceWith(s), this.waitForDimension($("#" + e), t), $(window).triggerHandler("n2Rocket", [this.sliderElement])
				}, this);
			s && $("#n2-ss-" + s).length ? n2ss.ready(s, $.proxy(function (e) {
				e.ready(n)
			}, this)) : r ? setTimeout(n, r) : n()
		} else this.waitForDimension(i, t)
	}, SmartSliderAbstract.prototype.waitForDimension = function (e, t) {
		var i = $.Deferred(),
			s = function () {
				var t = e.is(":visible");
				t ? i.resolve() : setTimeout(s, 200)
			};
		s(), i.done($.proxy(this.onSliderHasDimension, this, e, t))
	}, SmartSliderAbstract.prototype.initCSS = function () {
		this.parameters.css && $('<style type="text/css">' + this.parameters.css + "</style>").appendTo("head")
	}, SmartSliderAbstract.prototype.onSliderHasDimension = function ($sliderElement, parameters) {
		if (this.killed = !1, n2const.isIE ? $sliderElement.attr("data-ie", n2const.isIE) : n2const.isEdge && $sliderElement.attr("data-ie", n2const.isEdge), this.slideClass = this.slideClass || "FrontendSliderSlide", this.responsive = !1, this.mainAnimationLastChangeTime = 0, this.currentSlide = null, this.currentRealSlide = null, this.staticSlide = !1, this.isShuffled = !1, this.slides = [], this.visibleSlides = 1, this.sliderElement = $sliderElement.data("ss", this), this.needBackgroundWrap = !1, this.blockCarousel = !1, this.parameters = $.extend({
				admin: !1,
				playWhenVisible: 1,
				playWhenVisibleAt: .5,
				perspective: 1e3,
				callbacks: "",
				autoplay: {},
				blockrightclick: !1,
				maintainSession: 0,
				align: "normal",
				controls: {
					touch: "horizontal",
					keyboard: !1,
					mousewheel: !1,
					blockCarouselInteraction: 1
				},
				hardwareAcceleration: !0,
				layerMode: {
					playOnce: 0,
					playFirstLayer: 1,
					mode: "skippable",
					inAnimation: "mainInEnd"
				},
				foreverLayerAnimation: !1,
				parallax: {
					enabled: 0,
					mobile: 0,
					horizontal: "mouse",
					vertical: "mouse",
					origin: "enter"
				},
				load: {},
				mainanimation: {},
				randomize: {
					randomize: 0,
					randomizeFirst: 0
				},
				responsive: {},
				lazyload: {
					enabled: 0
				},
				postBackgroundAnimations: !1,
				initCallbacks: [],
				dynamicHeight: 0,
				lightbox: [],
				lightboxDeviceImages: [],
				titles: [],
				descriptions: [],
				allowBGImageAttachmentFixed: 1,
				backgroundParallax: {
					strength: 0,
					tablet: 0,
					mobile: 0
				},
				particlejs: 0
			}, parameters), this.disabled = {
				layerAnimations: !1,
				layerSplitTextAnimations: !1,
				backgroundAnimations: !1,
				postBackgroundAnimations: !1
			}, n2const.isSamsungBrowser && (this.disabled.layerSplitTextAnimations = !0, this.disabled.postBackgroundAnimations = !0), !(this.isAdmin || parameters.responsive.desktop && parameters.responsive.tablet && parameters.responsive.mobile)) {
			var md = new MobileDetect(window.navigator.userAgent, 801),
				isTablet = !!md.tablet(),
				isMobile = !!md.phone();
			if (!parameters.responsive.mobile && isMobile || !parameters.responsive.tablet && isTablet || !parameters.responsive.desktop && !isTablet && !isMobile) return void this.kill()
		}
		this.initCSS(), this.firstSlideReady = $.Deferred();
		try {
			eval(this.parameters.callbacks)
		} catch (e) {
			console.error(e)
		}
		this.startVisibilityCheck(), n2ss.makeReady(this.id, this), this.widgetDeferreds = [], this.sliderElement.on("addWidget", $.proxy(this.addWidget, this)), this.isAdmin && (this.changeTo = function () {}), this.load = new N2Classes.SmartSliderLoad(this, this.parameters.load), this.backgrounds = new N2Classes.SmartSliderBackgrounds(this), this.__initSlides(), $.when(this.overrideFirstSlide()).done($.proxy(this.onFirstSlideInitialized, this)), navigator.userAgent.match("UCBrowser") && $("html").addClass("n2-ucbrowser")
	}, SmartSliderAbstract.prototype.overrideFirstSlide = function () {
		if ("undefined" != typeof window["ss" + this.id]) {
			if ("object" == typeof window["ss" + this.id]) return window["ss" + this.id].done($.proxy(function (e) {
				null !== e && this.changeActiveBeforeLoad(e)
			}, this));
			var e = "undefined" != typeof window["ss" + this.id] ? parseInt(window["ss" + this.id]) : null;
			null !== e && this.changeActiveBeforeLoad(e)
		} else if (!this.isAdmin && this.parameters.maintainSession && "undefined" != typeof sessionStorage) {
			var t = sessionStorage.getItem("ss-" + this.id);
			null !== t && this.changeActiveBeforeLoad(parseInt(t)), this.sliderElement.on("mainAnimationComplete", $.proxy(function (e, t, i, s) {
				sessionStorage.setItem("ss-" + this.id, s)
			}, this))
		}
		return !0
	}, SmartSliderAbstract.prototype.changeActiveBeforeLoad = function (e) {
		e >= 0 && e < this.realSlides.length && this.starterSlide !== this.realSlides[e] && (this.unsetActiveSlide(this.starterSlide), this.starterSlide = this.realSlides[e], this.setActiveSlide(this.realSlides[e]))
	}, SmartSliderAbstract.prototype.startCurrentSlideIndex = function () {
		this.currentRealSlide = this.currentSlide = this.starterSlide, this.setActiveSlide(this.currentSlide), parseInt(this.parameters.carousel) ? this.initCarousel() : this.initNotCarousel()
	}, SmartSliderAbstract.prototype.onFirstSlideInitialized = function () {
		for (var i = 0; i < this.realSlides.length; i++) this.realSlides[i].setNext(this.realSlides[i + 1 > this.realSlides.length - 1 ? 0 : i + 1]);
		this.startCurrentSlideIndex(), this.firstSlideReady.resolve(this.currentSlide);
		for (var j = 0; j < this.parameters.initCallbacks.length; j++) new Function("$", this.parameters.initCallbacks[j]).call(this, $);
		if (this.disableLayerAnimations === !0 && (this.disabled.layerAnimations = !0), this.widgets = new N2Classes.SmartSliderWidgets(this), this.sliderElement.on({
				universalenter: $.proxy(function (e) {
					$(e.target).closest(".n2-full-screen-widget").length || (this.sliderElement.addClass("n2-hover"), this.widgets.setState("hover", !0))
				}, this),
				universalleave: $.proxy(function (e) {
					e.stopPropagation(), this.sliderElement.removeClass("n2-hover"), this.widgets.setState("hover", !1)
				}, this)
			}), this.controls = {}, this.parameters.blockrightclick && this.sliderElement.bind("contextmenu", function (e) {
				e.preventDefault()
			}), this.initMainAnimation(), this.initResponsiveMode(), !this.killed) {
			try {
				var removeHoverClassCB = $.proxy(function () {
					this.sliderElement.removeClass("n2-has-hover"), this.sliderElement[0].removeEventListener("touchstart", removeHoverClassCB, window.n2const.passiveEvents ? {
						passive: !0
					} : !1)
				}, this);
				this.sliderElement[0].addEventListener("touchstart", removeHoverClassCB, window.n2const.passiveEvents ? {
					passive: !0
				} : !1)
			} catch (e) {}
			if (this.initControls(), this.startedDeferred.resolve(this), !this.isAdmin) {
				var event = "click";
				this.hasTouch() && (event = "n2click"), this.sliderElement.find("[data-n2click]").each(function (i, el) {
					var el = $(el);
					el.on(event, function (event) {
						eval(el.data("n2click"))
					})
				}), this.sliderElement.find("[data-click]").each(function (i, el) {
					var el = $(el).on("click", function (event) {
						eval(el.data("click"))
					}).css("cursor", "pointer")
				}), this.sliderElement.find("[data-n2middleclick]").on("mousedown", function (event) {
					var el = $(this);
					2 != event.which && 4 != event.which || (event.preventDefault(), eval(el.data("n2middleclick")))
				}), this.sliderElement.find("[data-mouseenter]").each(function (i, el) {
					var el = $(el).on("mouseenter", function (event) {
						eval(el.data("mouseenter"))
					})
				}), this.sliderElement.find("[data-mouseleave]").each(function (i, el) {
					var el = $(el).on("mouseleave", function (event) {
						eval(el.data("mouseleave"))
					})
				}), this.sliderElement.find("[data-play]").each(function (i, el) {
					var el = $(el).on("n2play", function (event) {
						eval(el.data("play"))
					})
				}), this.sliderElement.find("[data-pause]").each(function (i, el) {
					var el = $(el).on("n2pause", function (event) {
						eval(el.data("pause"))
					})
				}), this.sliderElement.find("[data-stop]").each(function (i, el) {
					var el = $(el).on("n2stop", function (event) {
						eval(el.data("stop"))
					})
				}), window.n2FocusAllowed === undefined && (window.n2FocusAllowed = !1, $(window).on({
					keydown: function () {
						window.n2FocusAllowed = !0
					},
					keyup: function () {
						window.n2FocusAllowed = !1
					}
				})), this.sliderElement.find("a").on({
					focus: $.proxy(function (e) {
						if (n2FocusAllowed) {
							var t = this.findSlideByElement(e.currentTarget);
							t && t !== this.currentRealSlide && this.directionalChangeToReal(t.index)
						}
					}, this)
				})
			}
			this.preReadyResolve(), this.sliderElement.find('[role="button"],[tabindex]').not("input,select,textarea").keypress(function (e) {
				32 !== e.charCode && 13 !== e.charCode || (e.preventDefault(), $(e.target).click().triggerHandler("n2Activate"))
			}).on("mouseleave", function (e) {
				$(e.currentTarget).blur()
			})
		}
	}, SmartSliderAbstract.prototype.__initSlides = function () {
		for (var e = this.sliderElement.find(".n2-ss-slide"), t = 0; t < e.length; t++) this.slides.push(new N2Classes[this.slideClass](this, e.eq(t), t));
		this.starterSlide = this.slides[0];
		for (var t = 0; t < this.slides.length; t++) this.slides[t].init(), 1 == this.slides[t].$element.data("first") && (this.starterSlide = this.slides[t]);
		this.realSlides = this.slides, this.afterRawSlidesReady(), this.randomize(this.slides);
		var i = this.sliderElement.find(".n2-ss-static-slide");
		i.length && (this.staticSlide = new N2Classes.FrontendSliderStaticSlide(this, i))
	}, SmartSliderAbstract.prototype.afterRawSlidesReady = function () {}, SmartSliderAbstract.prototype.setVisibleSlides = function (e) {
		e !== this.visibleSlides && (this.visibleSlides = e, this.sliderElement.triggerHandler("visibleSlidesChanged"))
	}, SmartSliderAbstract.prototype.getVisibleSlides = function (e) {
		return e === undefined && (e = this.currentSlide), [e]
	}, SmartSliderAbstract.prototype.getActiveSlidesCompat = function (e) {
		return this.getVisibleSlides(e)
	}, SmartSliderAbstract.prototype.findSlideBackground = function (e) {
		return e.$element.find(".n2-ss-slide-background")
	}, SmartSliderAbstract.prototype.getRealIndex = function (e) {
		return e
	}, SmartSliderAbstract.prototype.randomize = function (e) {
		this.randomizeFirst(), this.parameters.randomize.randomize && this.shuffleSlides(e)
	}, SmartSliderAbstract.prototype.randomizeFirst = function () {
		this.parameters.randomize.randomizeFirst && (this.unsetActiveSlide(this.starterSlide), this.starterSlide = this.realSlides[Math.floor(Math.random() * this.realSlides.length)], this.setActiveSlide(this.starterSlide))
	}, SmartSliderAbstract.prototype.shuffleSlides = function (e) {
		e.sort(function () {
			return .5 - Math.random()
		});
		for (var t = e[0].$element.parent(), i = 0; i < e.length; i++) e[i].$element.appendTo(t), e[i].setIndex(i);
		this.isShuffled = !0
	}, SmartSliderAbstract.prototype.addWidget = function (e, t) {
		this.widgetDeferreds.push(t)
	}, SmartSliderAbstract.prototype.started = function (e) {
		this.startedDeferred.done($.proxy(e, this))
	}, SmartSliderAbstract.prototype.preReadyResolve = function () {
		setTimeout($.proxy(this._preReadyResolve, this), 1)
	}, SmartSliderAbstract.prototype._preReadyResolve = function () {
		this.load.start(), this.load.loaded($.proxy(this.readyResolve, this))
	}, SmartSliderAbstract.prototype.readyResolve = function () {
		$(window).scroll(), this.readyDeferred.resolve()
	}, SmartSliderAbstract.prototype.ready = function (e) {
		this.readyDeferred.done($.proxy(e, this))
	}, SmartSliderAbstract.prototype.startVisibilityCheck = function () {
		!this.isAdmin && this.parameters.playWhenVisible ? this.ready($.proxy(function () {
			$(window).on("scroll.n2-ss-visible" + this.id + " resize.n2-ss-visible" + this.id, $.proxy(this.checkIfVisible, this)), this.checkIfVisible()
		}, this)) : this.ready($.proxy(function () {
			this.visibleDeferred.resolve()
		}, this))
	}, SmartSliderAbstract.prototype.checkIfVisible = function () {
		var e = this.parameters.playWhenVisibleAt,
			t = $(window).scrollTop(),
			i = $(window).height(),
			s = $(document).height(),
			r = this.sliderElement[0].getBoundingClientRect(),
			n = i * e / 2,
			o = t + n,
			a = t + i - n;
		n > t && (o *= t / n), t + i > s - n && (a += t + i - s + n);
		var l = t + r.top,
			h = t + r.bottom;
		(this.isAdmin || a >= l && l >= o || h >= o && a >= h || o >= l && h >= a) && ($(window).off(".n2-ss-visible" + this.id), this.visibleDeferred.resolve())
	}, SmartSliderAbstract.prototype.visible = function (e) {
		this.visibleDeferred.done($.proxy(e, this))
	}, SmartSliderAbstract.prototype.isPlaying = function () {
		return "ended" !== this.mainAnimation.getState()
	}, SmartSliderAbstract.prototype.focus = function (e) {
		var t = !1;
		if (this.responsive.parameters.focusUser && !e && (t = !0), t) {
			var i = $(window).scrollTop(),
				s = this.responsive.focusOffsetTop,
				r = this.responsive.focusOffsetBottom,
				n = $(window).height(),
				o = this.sliderElement[0].getBoundingClientRect(),
				a = o.top - s,
				l = n - o.bottom - r;
			if (0 >= a && 0 >= l);
			else if (a > 0 && l > 0);
			else {
				var h = i;
				if (0 > a ? h = l >= -a ? i - s + o.top : i + r + o.bottom - n : 0 > l && (h = a >= -l ? i + r + o.bottom - n : i - s + o.top), h !== i) return this._scrollTo(h, Math.abs(i - h))
			}
		}
		return !0
	}, SmartSliderAbstract.prototype._scrollTo = function (e, t) {
		var i = $.Deferred();
		return window.nextendScrollFocus = !0, $("html, body").animate({
			scrollTop: e
		}, t, $.proxy(function () {
			i.resolve(), setTimeout(function () {
				window.nextendScrollFocus = !1
			}, 100)
		}, this)), i
	}, SmartSliderAbstract.prototype.isChangeCarousel = function (e) {
		return "next" === e ? this.currentSlide.index + 1 >= this.slides.length : "previous" === e ? this.currentSlide.index - 1 < 0 : !1
	}, SmartSliderAbstract.prototype.initNotCarousel = function () {
		this.next = function (e, t) {
			var i = this.currentSlide.index + 1;
			return i < this.slides.length ? this.changeTo(i, !1, e, t) : !1
		}, this.previous = function (e, t) {
			var i = this.currentSlide.index - 1;
			return i >= 0 ? this.changeTo(i, !0, e, t) : !1
		}, this.isChangePossible = function (e) {
			var t = !1;
			return "next" === e ? (t = this.currentSlide.index + 1, t >= this.slides.length && (t = !1)) : "previous" === e && (t = this.currentSlide.index - 1, 0 > t && (t = !1)), t !== !1 && t !== this.currentSlide.index
		};
		var e = $.proxy(function (e) {
			0 === e ? this.widgets.setState("nonCarouselFirst", !0) : this.widgets.setState("nonCarouselFirst", !1), e === this.slides.length - 1 ? this.widgets.setState("nonCarouselLast", !0) : this.widgets.setState("nonCarouselLast", !1)
		}, this);
		this.startedDeferred.done($.proxy(function () {
			e(this.currentSlide.index)
		}, this)), this.sliderElement.on("sliderSwitchTo", function (t, i) {
			e(i)
		})
	}, SmartSliderAbstract.prototype.isChangePossibleCarousel = function (e) {
		var t = !1;
		return "next" === e ? (t = this.currentSlide.index + 1, t >= this.slides.length && (t = 0)) : "previous" === e && (t = this.currentSlide.index - 1, 0 > t && (t = this.slides.length - 1)), t !== !1 && t !== this.currentSlide.index
	}, SmartSliderAbstract.prototype.initCarousel = function () {
		this.next = this.nextCarousel, this.previous = this.previousCarousel, this.isChangePossible = this.isChangePossibleCarousel
	}, SmartSliderAbstract.prototype.nextCarousel = function (e, t) {
		var i = this.currentSlide.index + 1;
		return i >= this.slides.length && (i = 0), this.changeTo(i, !1, e, t)
	}, SmartSliderAbstract.prototype.previousCarousel = function (e, t) {
		var i = this.currentSlide.index - 1;
		return 0 > i && (i = this.slides.length - 1), this.changeTo(i, !0, e, t)
	}, SmartSliderAbstract.prototype.directionalChangeToReal = function (e) {
		this.directionalChangeTo(e)
	}, SmartSliderAbstract.prototype.directionalChangeTo = function (e) {
		e > this.currentSlide.index ? this.changeTo(e, !1) : this.changeTo(e, !0)
	}, SmartSliderAbstract.prototype.changeTo = function (e, t, i, s) {
		if (e = parseInt(e), e !== this.currentSlide.index) {
			this.sliderElement.trigger("sliderSwitchTo", [e, this.getRealIndex(e)]);
			var r = $.now();
			return $.when($.when.apply($, this.backgrounds.preLoadSlides(this.getVisibleSlides(this.slides[e]))), this.focus(i)).done($.proxy(function () {
				if (this.mainAnimationLastChangeTime <= r) {
					this.mainAnimationLastChangeTime = r;
					var n = this.mainAnimation.getState();
					if ("ended" === n) {
						"undefined" == typeof i && (i = !1);
						var o = this.mainAnimation;
						"undefined" != typeof s && (o = s), this._changeTo(e, t, i, s), o.changeTo(this.currentSlide, this.slides[e], t, i), this._changeCurrentSlide(e)
					} else "initAnimation" !== n && "playing" !== n || (this.sliderElement.off(".fastChange").one("mainAnimationComplete.fastChange", $.proxy(function () {
						this.changeTo.call(this, e, t, i, s)
					}, this)), this.mainAnimation.timeScale(2 * this.mainAnimation.timeScale()))
				}
			}, this)), !0
		}
		return !1
	}, SmartSliderAbstract.prototype._changeCurrentSlide = function (e) {
		this.currentRealSlide = this.currentSlide = this.slides[e], this.sliderElement.triggerHandler("sliderChangeCurrentSlide")
	}, SmartSliderAbstract.prototype._changeTo = function (e, t, i, s) {}, SmartSliderAbstract.prototype.revertTo = function (e, t) {
		this.unsetActiveSlide(this.slides[t]), this.setActiveSlide(this.slides[e]), this._changeCurrentSlide(e), this.sliderElement.trigger("sliderSwitchTo", [e, this.getRealIndex(e)])
	}, SmartSliderAbstract.prototype.setActiveSlide = function (e) {
		e.$element.addClass("n2-ss-slide-active")
	}, SmartSliderAbstract.prototype.unsetActiveSlide = function (e) {
		e.$element.removeClass("n2-ss-slide-active")
	}, SmartSliderAbstract.prototype.findSlideByElement = function (e) {
		e = $(e);
		for (var t = 0; t < this.realSlides.length; t++)
			if (1 === this.realSlides[t].$element.has(e).length) return this.realSlides[t];
		return !1
	}, SmartSliderAbstract.prototype.findSlideIndexByElement = function (e) {
		var t = this.findSlideByElement(e);
		return t ? t : -1
	}, SmartSliderAbstract.prototype.initMainAnimation = function () {
		this.mainAnimation = !1
	}, SmartSliderAbstract.prototype.initResponsiveMode = function () {
		this.dimensions = this.responsive.responsiveDimensions
	}, SmartSliderAbstract.prototype.hasTouch = function () {
		return "0" != this.parameters.controls.touch && this.slides.length > 1
	}, SmartSliderAbstract.prototype.initControls = function () {
		if (!this.parameters.admin) {
			if (this.hasTouch()) switch (this.parameters.controls.touch) {
				case "vertical":
					new N2Classes.SmartSliderControlTouchVertical(this);
					break;
				case "horizontal":
					new N2Classes.SmartSliderControlTouchHorizontal(this)
			}
			this.parameters.controls.keyboard && ("undefined" != typeof this.controls.touch ? new N2Classes.SmartSliderControlKeyboard(this, this.controls.touch.axis) : new N2Classes.SmartSliderControlKeyboard(this, "horizontal")), this.parameters.controls.mousewheel && new N2Classes.SmartSliderControlMouseWheel(this), this.controlAutoplay = new N2Classes.SmartSliderControlAutoplay(this, this.parameters.autoplay), this.controlFullscreen = new N2Classes.SmartSliderControlFullscreen(this)
		}
	}, SmartSliderAbstract.prototype.getSlideIndex = function (e) {
		return e
	}, SmartSliderAbstract.prototype.slideToID = function (e, t) {
		for (var i = 0; i < this.realSlides.length; i++)
			if (this.realSlides[i].id === e) return this.slide(this.getSlideIndex(i), t);
		var s = $('[data-id="' + e + '"]').closest(".n2-ss-slider");
		return s.length && this.id === s.data("ss").id ? !0 : s.length ? ($("html, body").animate({
			scrollTop: s.offset().top
		}, 400), s.data("ss").slideToID(e, t)) : void 0
	}, SmartSliderAbstract.prototype.slide = function (e, t) {
		return e >= 0 && e < this.slides.length ? t === undefined ? parseInt(this.parameters.carousel) && this.currentSlide.index === this.slides.length - 1 && 0 === e ? this.next() : this.currentSlide.index > e ? this.changeTo(e, !0) : this.changeTo(e) : this.changeTo(e, !t) : !1
	}, SmartSliderAbstract.prototype.startAutoplay = function (e) {
		return "undefined" != typeof this.controlAutoplay ? (this.controlAutoplay.pauseAutoplayExtraPlayingEnded(e, "autoplayButton"), !0) : !1
	}, SmartSliderAbstract.prototype.getAnimationAxis = function () {
		return "horizontal"
	}, SmartSliderAbstract.prototype.getDirectionPrevious = function () {
		return n2const.isRTL() && "horizontal" === this.getAnimationAxis() ? "next" : "previous"
	}, SmartSliderAbstract.prototype.getDirectionNext = function () {
		return n2const.isRTL() && "horizontal" === this.getAnimationAxis() ? "previous" : "next"
	}, SmartSliderAbstract.prototype.previousWithDirection = function () {
		return this[this.getDirectionPrevious()]()
	}, SmartSliderAbstract.prototype.nextWithDirection = function () {
		return this[this.getDirectionNext()]()
	}, SmartSliderAbstract
}), N2D("SmartSliderWidgets", function ($, undefined) {
	function SmartSliderWidgets(e) {
		this.slider = e, this.sliderElement = e.sliderElement.on("BeforeVisible", $.proxy(this.onReady, this)), this.widgets = {}, this.excludedSlides = {}, this.states = {
			hover: !1,
			nonCarouselFirst: !1,
			nonCarouselLast: !1,
			currentSlideIndex: -1,
			singleSlide: !1
		}, this.widgets = {
			previous: this.sliderElement.find(".nextend-arrow-previous"),
			next: this.sliderElement.find(".nextend-arrow-next"),
			bullet: this.sliderElement.find(".n2-ss-control-bullet"),
			autoplay: this.sliderElement.find(".nextend-autoplay"),
			indicator: this.sliderElement.find(".nextend-indicator"),
			bar: this.sliderElement.find(".nextend-bar"),
			thumbnail: this.sliderElement.find(".nextend-thumbnail"),
			shadow: this.sliderElement.find(".nextend-shadow"),
			fullscreen: this.sliderElement.find(".nextend-fullscreen"),
			html: this.sliderElement.find(".nextend-widget-html")
		}
	}
	return SmartSliderWidgets.prototype.setState = function (e, t) {
		if (this.states[e] != t) {
			this.states[e] = t;
			var i = e.split(".");
			switch (i[0]) {
				case "hide":
					this.onStateChangeSingle(i[1]);
					break;
				case "nonCarouselFirst":
					this.onStateChangeSingle(this.slider.getDirectionPrevious());
					break;
				case "nonCarouselLast":
					this.onStateChangeSingle(this.slider.getDirectionNext());
					break;
				default:
					this.onStateChangeAll()
			}
		}
	}, SmartSliderWidgets.prototype.onStateChangeAll = function () {
		for (var e in this.widgets) this.onStateChangeSingle(e)
	}, SmartSliderWidgets.prototype.onStateChangeSingle = function (e) {
		if (this.widgets[e].length) {
			var t = !0;
			if (this.widgets[e].hasClass("n2-ss-widget-display-hover") && (t = this.states.hover), t && (e === this.slider.getDirectionPrevious() && this.states.nonCarouselFirst ? t = !1 : e === this.slider.getDirectionNext() && this.states.nonCarouselLast && (t = !1)), t) {
				var i = e + "-" + (this.states.currentSlideIndex + 1);
				this.excludedSlides[i] && (t = !1)
			}
			t && this.states["hide." + e] !== undefined && this.states["hide." + e] && (t = !1), t && this.states.singleSlide && ("previous" !== e && "next" !== e && "bullet" !== e && "autoplay" !== e && "indicator" !== e || (t = !1)), this.widgets[e].toggleClass("n2-ss-widget-hidden", !t)
		}
	}, SmartSliderWidgets.prototype.onReady = function () {
		this.slider.sliderElement.on("slideCountChanged", $.proxy(function () {
			this.setState("singleSlide", this.slider.slides.length <= 1);
		}, this)), this.dimensions = this.slider.dimensions, this.$vertical = this.sliderElement.find('[data-position="above"],[data-position="below"]').not(".nextend-shadow");
		var e = !1;
		for (var t in this.widgets) {
			var i = this.widgets[t].attr("data-exclude-slides");
			if (i !== undefined) {
				for (var s = i.split(","), r = s.length - 1; r >= 0; r--) {
					var n = s[r].split("-");
					if (2 === n.length) {
						var o = parseInt(n[0]),
							a = parseInt(n[1]);
						if (a >= o)
							for (var l = o; a >= l; l++) s.push(l)
					} else s[r] = parseInt(s[r])
				}
				if (s.length > 0) {
					for (var r = 0; r < s.length; r++) this.excludedSlides[t + "-" + s[r]] = !0;
					e = !0
				}
			}
		}
		if (e) {
			var h = $.proxy(function (e, t) {
				this.setState("currentSlideIndex", t)
			}, this);
			h(null, this.slider.currentRealSlide.index), this.slider.sliderElement.on({
				sliderSwitchTo: h
			})
		}
		this.variableElementsDimension = {
			width: this.sliderElement.find("[data-sswidth]"),
			height: this.sliderElement.find("[data-ssheight]")
		}, this.variableElements = {
			top: this.sliderElement.find("[data-sstop]"),
			right: this.sliderElement.find("[data-ssright]"),
			bottom: this.sliderElement.find("[data-ssbottom]"),
			left: this.sliderElement.find("[data-ssleft]")
		}, this.slider.sliderElement.on("SliderAnimatedResize", $.proxy(this.onAnimatedResize, this)), this.slider.sliderElement.on("SliderResize", $.proxy(this.onResize, this)), this.slider.sliderElement.one("slideCountChanged", $.proxy(function () {
			this.onResize(this.slider.responsive.lastRatios)
		}, this)), this.onResize(this.slider.responsive.lastRatios), this.onStateChangeAll()
	}, SmartSliderWidgets.prototype.onAnimatedResize = function (e, ratios, timeline, duration) {
		for (var key in this.widgets) {
			var el = this.widgets[key],
				visible = el.is(":visible");
			this.dimensions[key + "width"] = visible ? el.outerWidth(!1) : 0, this.dimensions[key + "height"] = visible ? el.outerHeight(!1) : 0
		}
		this.dimensions.width = this.dimensions.slider.width, this.dimensions.height = this.dimensions.slider.height, this.dimensions.outerwidth = this.sliderElement.parent().width(), this.dimensions.outerheight = this.sliderElement.parent().height(), this.dimensions.canvaswidth = this.dimensions.slide.width, this.dimensions.canvasheight = this.dimensions.slide.height, this.dimensions.margintop = this.dimensions.slider.marginTop, this.dimensions.marginright = this.dimensions.slider.marginRight, this.dimensions.marginbottom = this.dimensions.slider.marginBottom, this.dimensions.marginleft = this.dimensions.slider.marginLeft;
		var variableText = "";
		for (var key in this.dimensions) {
			var value = this.dimensions[key];
			if ("object" == typeof value)
				for (var key2 in value) "number" == typeof value[key2] && (variableText += "var " + key + key2 + " = " + value[key2] + ";");
			else "number" == typeof value && (variableText += "var " + key + " = " + value + ";")
		}
		eval(variableText);
		for (var k in this.variableElementsDimension)
			for (var i = 0; i < this.variableElementsDimension[k].length; i++) {
				var el = this.variableElementsDimension[k].eq(i);
				if (el.is(":visible")) {
					var to = {};
					try {
						to[k] = eval(el.data("ss" + k)) + "px";
						for (var widget in this.widgets) this.widgets[widget].filter(el).length && ("width" == k ? this.dimensions[widget + k] = el.outerWidth(!1) : "height" == k && (this.dimensions[widget + k] = el.outerHeight(!1)), eval(widget + k + " = " + this.dimensions[widget + k] + ";"))
					} catch (e) {
						console.log(el, " position variable: " + e.message + ": ", el.data("ss" + k))
					}
					timeline.to(el, duration, to, 0)
				}
			}
		for (var k in this.variableElements)
			for (var i = 0; i < this.variableElements[k].length; i++) {
				var el = this.variableElements[k].eq(i);
				try {
					var to = {};
					to[k] = eval(el.data("ss" + k)) + "px", timeline.to(el, duration, to, 0)
				} catch (e) {
					console.log(el, " position variable: " + e.message + ": ", el.data("ss" + k))
				}
			}
	}, SmartSliderWidgets.prototype.onResize = function (e, ratios, responsive, timeline) {
		if (!timeline) {
			for (var k in this.variableElements)
				for (var i = 0; i < this.variableElements[k].length; i++) {
					var last = this.variableElements[k].data("n2Last" + k);
					last > 0 && this.variableElements[k].css(k, 0)
				}
			for (var key in this.widgets) {
				var el = this.widgets[key],
					visible = el.length && el.is(":visible");
				el.length && el.is(":visible") ? (this.dimensions[key + "width"] = el.outerWidth(!1), this.dimensions[key + "height"] = el.outerHeight(!1)) : (this.dimensions[key + "width"] = 0, this.dimensions[key + "height"] = 0)
			}
			for (var k in this.variableElements)
				for (var i = 0; i < this.variableElements[k].length; i++) {
					var last = this.variableElements[k].data("n2Last" + k);
					last > 0 && this.variableElements[k].css(k, last)
				}
			this.dimensions.width = this.dimensions.slider.width, this.dimensions.height = this.dimensions.slider.height, this.dimensions.outerwidth = this.sliderElement.parent().width(), this.dimensions.outerheight = this.sliderElement.parent().height(), this.dimensions.canvaswidth = this.dimensions.slide.width, this.dimensions.canvasheight = this.dimensions.slide.height, this.dimensions.margintop = this.dimensions.slider.marginTop, this.dimensions.marginright = this.dimensions.slider.marginRight, this.dimensions.marginbottom = this.dimensions.slider.marginBottom, this.dimensions.marginleft = this.dimensions.slider.marginLeft;
			var variableText = "";
			for (var key in this.dimensions) {
				var value = this.dimensions[key];
				if ("object" == typeof value)
					for (var key2 in value) "number" == typeof value[key2] && (variableText += "var " + key + key2 + " = " + value[key2] + ";");
				else "number" == typeof value && (variableText += "var " + key + " = " + value + ";")
			}
			eval(variableText);
			for (var k in this.variableElementsDimension)
				for (var i = 0; i < this.variableElementsDimension[k].length; i++) {
					var el = this.variableElementsDimension[k].eq(i);
					if (el.is(":visible")) try {
						el.css(k, eval(el.data("ss" + k)) + "px");
						for (var widget in this.widgets) this.widgets[widget].filter(el).length && ("width" == k ? this.dimensions[widget + k] = el.outerWidth(!1) : "height" == k && (this.dimensions[widget + k] = el.outerHeight(!1)), eval(widget + k + " = " + this.dimensions[widget + k] + ";"))
					} catch (e) {
						console.log(el, " position variable: " + e.message + ": ", el.data("ss" + k))
					}
				}
			for (var k in this.variableElements)
				for (var i = 0; i < this.variableElements[k].length; i++) {
					var el = this.variableElements[k].eq(i);
					try {
						var value = eval(el.data("ss" + k));
						el.css(k, value + "px"), el.data("n2Last" + k, value)
					} catch (e) {
						console.log(el, " position variable: " + e.message + ": ", el.data("ss" + k))
					}
				}
			this.slider.responsive.refreshStaticSizes()
		}
	}, SmartSliderWidgets
}), N2D("SmartSliderMainAnimationAbstract", function (e, t) {
	function i(t, i) {
		this.state = "ended", this.isTouch = !1, this.isReverseAllowed = !0, this.isReverseEnabled = !1, this.reverseSlideIndex = null, this.isNoAnimation = !1, this.slider = t, this.parameters = e.extend({
			duration: 1500,
			ease: "easeInOutQuint"
		}, i), this.parameters.duration /= 1e3, this.sliderElement = t.sliderElement, this.timeline = new NextendTimeline({
			paused: !0
		}), this.sliderElement.on("mainAnimationStart", e.proxy(function (e, t, i, s) {
			this._revertCurrentSlideIndex = i, this._revertNextSlideIndex = s
		}, this))
	}
	return i.prototype.setToStarterSlide = function (e) {}, i.prototype.enableReverseMode = function () {
		this.isReverseEnabled = !0, this.reverseTimeline = new NextendTimeline({
			paused: !0
		}), this.sliderElement.triggerHandler("reverseModeEnabled", this.reverseSlideIndex)
	}, i.prototype.disableReverseMode = function () {
		this.isReverseEnabled = !1
	}, i.prototype.setTouch = function (e) {
		this.isTouch = e
	}, i.prototype.setTouchProgress = function (e) {
		"ended" !== this.state && (this.isReverseEnabled ? 0 === e ? (this.reverseTimeline.progress(0), this.timeline.progress(e, !1)) : e >= 0 && 1 >= e ? (this.reverseTimeline.progress(0), this.timeline.progress(e)) : 0 > e && e >= -1 && (this.timeline.progress(0), this.reverseTimeline.progress(Math.abs(e))) : 0 >= e ? this.timeline.progress(Math.max(e, 1e-6), !1) : e >= 0 && 1 >= e && this.timeline.progress(e))
	}, i.prototype.setTouchEnd = function (e, t, i) {
		"ended" != this.state && (this.isReverseEnabled ? this._setTouchEndWithReverse(e, t, i) : this._setTouchEnd(e, t, i))
	}, i.prototype._setTouchEnd = function (e, t, i) {
		e && t > 0 ? (this.fixTouchDuration(this.timeline, t, i), this.timeline.play()) : (this.revertCB(this.timeline), this.fixTouchDuration(this.timeline, 1 - t, i), this.timeline.reverse(), this.willRevertTo(this._revertCurrentSlideIndex, this._revertNextSlideIndex))
	}, i.prototype._setTouchEndWithReverse = function (e, t, i) {
		e ? 0 > t && this.reverseTimeline.totalDuration() > 0 ? (this.fixTouchDuration(this.reverseTimeline, t, i), this.reverseTimeline.play(), this.willRevertTo(this.reverseSlideIndex, this._revertNextSlideIndex)) : (this.willCleanSlideIndex(this.reverseSlideIndex), this.fixTouchDuration(this.timeline, t, i), this.timeline.play()) : (0 > t ? (this.revertCB(this.reverseTimeline), this.fixTouchDuration(this.reverseTimeline, 1 - t, i), this.reverseTimeline.reverse()) : (this.revertCB(this.timeline), this.fixTouchDuration(this.timeline, 1 - t, i), this.timeline.reverse()), this.willCleanSlideIndex(this.reverseSlideIndex), this.willRevertTo(this._revertCurrentSlideIndex, this._revertNextSlideIndex))
	}, i.prototype.fixTouchDuration = function (e, t, i) {
		var s = e.totalDuration(),
			r = Math.max(s / 3, Math.min(s, i / Math.abs(t) / 1e3));
		r !== s && e.totalDuration(r)
	}, i.prototype.getState = function () {
		return this.state
	}, i.prototype.timeScale = function () {
		return arguments.length > 0 ? (this.timeline.timeScale(arguments[0]), this) : this.timeline.timeScale()
	}, i.prototype.changeTo = function (t, i, s, r) {
		if (this._initAnimation(t, i, s), this.state = "initAnimation", this.timeline.paused(!0), this.timeline.eventCallback("onStart", this.onChangeToStart, [t, i, r], this), this.timeline.eventCallback("onComplete", this.onChangeToComplete, [t, i, r], this), this.timeline.eventCallback("onReverseComplete", null), this.revertCB = e.proxy(function (e) {
				e.eventCallback("onReverseComplete", this.onReverseChangeToComplete, [i, t, r], this)
			}, this), this.slider.parameters.dynamicHeight) {
			var n = new NextendTimeline;
			this.slider.responsive.doResize(null, n, i, .6), this.timeline.add(n)
		}
		this.isTouch || this.timeline.play()
	}, i.prototype.willRevertTo = function (t, i) {
		this.sliderElement.triggerHandler("mainAnimationWillRevertTo", [t, i]), this.sliderElement.one("mainAnimationComplete", e.proxy(this.revertTo, this, t, i))
	}, i.prototype.revertTo = function (e, t) {
		this.slider.revertTo(e, t), this.slider.slides[t].triggerHandler("mainAnimationStartInCancel")
	}, i.prototype.willCleanSlideIndex = function (t) {
		this.sliderElement.one("mainAnimationComplete", e.proxy(this.cleanSlideIndex, this, t))
	}, i.prototype.cleanSlideIndex = function () {}, i.prototype._initAnimation = function (e, t, i) {}, i.prototype.onChangeToStart = function (e, t, i) {
		this.state = "playing";
		var s = [this, e.index, t.index, i];
		this.sliderElement.trigger("mainAnimationStart", s), this.slider.slides[e.index].trigger("mainAnimationStartOut", s), this.slider.slides[t.index].trigger("mainAnimationStartIn", s)
	}, i.prototype.onChangeToComplete = function (e, t, i) {
		var s = [this, e.index, t.index, i];
		this.clearTimelines(), this.disableReverseMode(), this.slider.slides[e.index].trigger("mainAnimationCompleteOut", s), this.slider.slides[t.index].trigger("mainAnimationCompleteIn", s), this.state = "ended", this.sliderElement.trigger("mainAnimationComplete", s)
	}, i.prototype.onReverseChangeToComplete = function (e, t, s) {
		i.prototype.onChangeToComplete.apply(this, arguments)
	}, i.prototype.clearTimelines = function () {
		this.revertCB = function () {}, this.timeline.clear(), this.timeline.timeScale(1)
	}, i.prototype.getEase = function () {
		return this.isTouch ? "linear" : this.parameters.ease
	}, i
}), N2D("SmartSliderControlAutoplay", function (e, t) {
	"use strict";

	function i(t, i) {
		this._paused = !0, this._wait = !1, this._disabled = !1, this._currentCount = 0, this._progressEnabled = !1, this.timeline = null, this.hasButton = !1, this.deferredsMediaPlaying = null, this.deferredMouseLeave = null, this.deferredMouseEnter = null, this.mainAnimationDeferred = !0, this.autoplayDeferred = null, this.slider = t, this.parameters = e.extend({
			enabled: 0,
			start: 1,
			duration: 8e3,
			autoplayToSlide: 0,
			autoplayToSlideIndex: -1,
			allowReStart: 0,
			pause: {
				mouse: "enter",
				click: !0,
				mediaStarted: !0
			},
			resume: {
				click: 0,
				mouse: 0,
				mediaEnded: !0
			}
		}, i), this.parameters.enabled ? (this.parameters.duration /= 1e3, t.controls.autoplay = this, this.deferredsExtraPlaying = {}, this.slider.visible(e.proxy(this.onReady, this))) : this.disable(), this.clickHandled = !1, t.controls.autoplay = this
	}
	var s = !1;
	return i.prototype.preventClickHandle = function () {
		this.clickHandled = !0, setTimeout(e.proxy(function () {
			this.clickHandled = !1
		}, this), 300)
	}, i.prototype.onReady = function () {
		this.autoplayDeferred = e.Deferred();
		var t = {
			_progress: 0
		};
		this.timeline = NextendTween.to(t, this.getSlideDuration(this.slider.currentSlide.index), {
			_progress: 1,
			paused: !0,
			onComplete: e.proxy(this.next, this)
		}), this._progressEnabled && this.enableProgress();
		var i = this.slider.sliderElement;
		if (this.parameters.start ? this.continueAutoplay() : this.pauseAutoplayExtraPlaying(null, "autoplayButton"), i.on("mainAnimationStart.autoplay", e.proxy(this.onMainAnimationStart, this)), "0" != this.parameters.pause.mouse) switch (i.on("touchend.autoplay", function () {
			s = !0, setTimeout(function () {
				s = !1
			}, 300)
		}), this.parameters.pause.mouse) {
			case "enter":
				i.on("mouseenter.autoplay", e.proxy(this.pauseAutoplayMouseEnter, this)), i.on("mouseleave.autoplay", e.proxy(this.pauseAutoplayMouseEnterEnded, this));
				break;
			case "leave":
				i.on("mouseleave.autoplay", e.proxy(this.pauseAutoplayMouseLeave, this)), i.on("mouseenter.autoplay", e.proxy(this.pauseAutoplayMouseLeaveEnded, this))
		}
		if (this.parameters.pause.click && !this.parameters.resume.click ? i.on("universalclick.autoplay", e.proxy(function (e) {
				this.clickHandled || this.pauseAutoplayUniversal(e)
			}, this)) : !this.parameters.pause.click && this.parameters.resume.click ? i.on("universalclick.autoplay", e.proxy(function (e) {
				this.clickHandled || this.pauseAutoplayExtraPlayingEnded(e, "autoplayButton")
			}, this)) : this.parameters.pause.click && this.parameters.resume.click && i.on("universalclick.autoplay", e.proxy(function (e) {
				this.clickHandled || (this._paused ? this.pauseAutoplayExtraPlayingEnded(e, "autoplayButton") : this.pauseAutoplayUniversal(e))
			}, this)), this.parameters.pause.mediaStarted && (this.deferredsMediaPlaying = {}, i.on("mediaStarted.autoplay", e.proxy(this.pauseAutoplayMediaPlaying, this)), i.on("mediaEnded.autoplay", e.proxy(this.pauseAutoplayMediaPlayingEnded, this))), "0" != this.parameters.resume.mouse) switch (this.parameters.resume.mouse) {
			case "enter":
				this.hasButton && "0" != this.parameters.pause.mouse ? i.on("mouseenter.autoplay", e.proxy(this.continueAutoplay, this)) : i.on("mouseenter.autoplay", e.proxy(function (e) {
					this.pauseAutoplayExtraPlayingEnded(e, "autoplayButton")
				}, this));
				break;
			case "leave":
				this.hasButton && "0" != this.parameters.pause.mouse ? i.on("mouseleave.autoplay", e.proxy(this.continueAutoplay, this)) : i.on("mouseleave.autoplay", e.proxy(function (e) {
					this.pauseAutoplayExtraPlayingEnded(e, "autoplayButton")
				}, this))
		}
		this.parameters.resume.mediaEnded && i.on("mediaEnded.autoplay", e.proxy(this.continueAutoplay, this)), i.on("autoplayExtraWait.autoplay", e.proxy(this.pauseAutoplayExtraPlaying, this)), i.on("autoplayExtraContinue.autoplay", e.proxy(this.pauseAutoplayExtraPlayingEnded, this)), this.slider.sliderElement.on("mainAnimationComplete.autoplay", e.proxy(this.onMainAnimationComplete, this))
	}, i.prototype.enableProgress = function () {
		this.timeline && this.timeline.eventCallback("onUpdate", e.proxy(this.onUpdate, this)), this._progressEnabled = !0
	}, i.prototype.onMainAnimationStart = function (t, i, s, r, n) {
		this.mainAnimationDeferred = e.Deferred(), this.deActivate(0, "wait");
		for (var o in this.deferredsMediaPlaying) this.deferredsMediaPlaying[o].resolve()
	}, i.prototype.onMainAnimationComplete = function (e, t, i, s) {
		this.parameters.autoplayToSlideIndex >= 0 && this.parameters.autoplayToSlideIndex == this.slider.currentRealSlide.index + 1 && this.limitAutoplay(), this.timeline.duration(this.getSlideDuration(s)), this.mainAnimationDeferred.resolve(), this.continueAutoplay()
	}, i.prototype.getSlideDuration = function (e) {
		var t = this.slider.realSlides[this.slider.getRealIndex(e)],
			i = t.minimumSlideDuration;
		return 0 == i && (i = this.parameters.duration), i
	}, i.prototype.continueAutoplay = function (t) {
		"pending" == this.autoplayDeferred.state() && this.autoplayDeferred.reject();
		var i = [];
		for (var s in this.deferredsExtraPlaying) i.push(this.deferredsExtraPlaying[s]);
		for (var s in this.deferredsMediaPlaying) i.push(this.deferredsMediaPlaying[s]);
		this.deferredMouseEnter && i.push(this.deferredMouseEnter), this.deferredMouseLeave && i.push(this.deferredMouseLeave), i.push(this.mainAnimationDeferred), this.autoplayDeferred = e.Deferred(), this.autoplayDeferred.done(e.proxy(this._continueAutoplay, this)), e.when.apply(e, i).done(e.proxy(function () {
			"pending" == this.autoplayDeferred.state() && this.autoplayDeferred.resolve()
		}, this))
	}, i.prototype._continueAutoplay = function () {
		!this._paused && !this._wait || this._disabled || (this._paused = !1, this._wait = !1, this.slider.sliderElement.triggerHandler("autoplayStarted"), 1 == this.timeline.progress() && this.timeline.pause(0, !1), this.startTimeout(null))
	}, i.prototype.pauseAutoplayUniversal = function (e) {
		this.pauseAutoplayExtraPlaying(e, "autoplayButton"), this.deActivate(null, "pause")
	}, i.prototype.pauseAutoplayMouseEnter = function () {
		s || (this.autoplayDeferred.reject(), this.deferredMouseEnter = e.Deferred(), this.deActivate(null, "leave" == this.parameters.resume.mouse ? "wait" : "pause"))
	}, i.prototype.pauseAutoplayMouseEnterEnded = function () {
		this.deferredMouseEnter && this.deferredMouseEnter.resolve()
	}, i.prototype.pauseAutoplayMouseLeave = function () {
		this.autoplayDeferred.reject(), this.deferredMouseLeave = e.Deferred(), this.deActivate(null, "enter" == this.parameters.resume.mouse ? "wait" : "pause")
	}, i.prototype.pauseAutoplayMouseLeaveEnded = function () {
		this.deferredMouseLeave && this.deferredMouseLeave.resolve()
	}, i.prototype.pauseAutoplayMediaPlaying = function (t, i) {
		"undefined" != typeof this.deferredsMediaPlaying[i] && this.autoplayDeferred.reject(), this.deferredsMediaPlaying[i] = e.Deferred(), this.deActivate(null, "wait")
	}, i.prototype.pauseAutoplayMediaPlayingEnded = function (e, t) {
		"undefined" != typeof this.deferredsMediaPlaying[t] && (this.autoplayDeferred.reject(), this.deferredsMediaPlaying[t].resolve(), delete this.deferredsMediaPlaying[t])
	}, i.prototype.pauseAutoplayExtraPlaying = function (t, i) {
		"undefined" != typeof this.deferredsExtraPlaying[i] && this.autoplayDeferred.reject(), this.deferredsExtraPlaying[i] = e.Deferred(), this.deActivate(null, "pause")
	}, i.prototype.pauseAutoplayExtraPlayingEnded = function (e, t) {
		"undefined" != typeof this.deferredsExtraPlaying[t] && (this.autoplayDeferred.reject(), this.deferredsExtraPlaying[t].resolve(), delete this.deferredsExtraPlaying[t]), this.continueAutoplay()
	}, i.prototype.deActivate = function (e, t) {
		"pause" == t ? this._paused || (this._paused = !0, 0 !== e && this.slider.sliderElement.triggerHandler("autoplayPaused")) : "wait" == t && (this._wait || (this._wait = !0, 0 !== e && this.slider.sliderElement.triggerHandler("autoplayWait"))), this.timeline && this.timeline.pause(e, !1)
	}, i.prototype.disable = function () {
		this.deActivate(0, "pause"), this.slider.sliderElement.triggerHandler("autoplayPaused"), this.slider.sliderElement.triggerHandler("autoplayDisabled"), this.slider.sliderElement.off(".autoplay"), this._disabled = !0
	}, i.prototype.startTimeout = function (e) {
		this._paused || this._disabled || this.timeline.play(e)
	}, i.prototype.next = function () {
		this.timeline.pause(), this._currentCount++, (this.parameters.autoplayToSlide > 0 && this._currentCount >= this.parameters.autoplayToSlide || this.parameters.autoplayToSlideIndex >= 0 && this.parameters.autoplayToSlideIndex == this.slider.currentRealSlide.index + 2) && this.limitAutoplay(), this.slider.nextCarousel(!0)
	}, i.prototype.limitAutoplay = function () {
		this.parameters.allowReStart ? (this._currentCount = 0, this.slider.sliderElement.triggerHandler("autoplayExtraWait", "autoplayButton")) : this.disable()
	}, i.prototype.onUpdate = function () {
		this.slider.sliderElement.triggerHandler("autoplay", this.timeline.progress())
	}, i
}), N2D("SmartSliderControlFullscreen", function (e, t) {
	"use strict";

	function i(t, i, s) {
		this.slider = t, this.responsive = this.slider.responsive, this._type = this.responsive.parameters.type, this._forceFull = this.responsive.parameters.forceFull, this.forceFullpage = "auto" == this._type || "fullwidth" == this._type || "fullpage" == this._type, this.forceFullpage && (this._upscale = this.responsive.parameters.upscale, this._minimumHeightRatio = e.extend({}, this.responsive.parameters.minimumHeightRatio), this._maximumHeightRatio = e.extend({}, this.responsive.parameters.maximumHeightRatio)), this.isFullScreen = !1, this.fullParent = this.slider.sliderElement.closest(".n2-ss-align"), this.browserSpecific = {};
		var r = this.slider.sliderElement[0];
		r.requestFullscreen ? (this.browserSpecific.requestFullscreen = "requestFullscreen", this.browserSpecific.event = "fullscreenchange") : r.msRequestFullscreen ? (this.browserSpecific.requestFullscreen = "msRequestFullscreen", this.browserSpecific.event = "MSFullscreenChange") : r.mozRequestFullScreen ? (this.browserSpecific.requestFullscreen = "mozRequestFullScreen", this.browserSpecific.event = "mozfullscreenchange") : r.webkitRequestFullscreen ? (this.browserSpecific.requestFullscreen = "webkitRequestFullscreen", this.browserSpecific.event = "webkitfullscreenchange") : (this.browserSpecific.requestFullscreen = "nextendRequestFullscreen", this.browserSpecific.event = "nextendfullscreenchange", this.fullParent[0][this.browserSpecific.requestFullscreen] = e.proxy(function () {
			this.fullParent.css({
				position: "fixed",
				left: 0,
				top: 0,
				width: "100%",
				height: "100%",
				backgroundColor: "#000",
				zIndex: 1e6
			}), document.fullscreenElement = this.fullParent[0], this.triggerEvent(document, this.browserSpecific.event), e(window).trigger("resize")
		}, this)), document.exitFullscreen ? this.browserSpecific.exitFullscreen = "exitFullscreen" : document.msExitFullscreen ? this.browserSpecific.exitFullscreen = "msExitFullscreen" : document.mozCancelFullScreen ? this.browserSpecific.exitFullscreen = "mozCancelFullScreen" : document.webkitExitFullscreen ? this.browserSpecific.exitFullscreen = "webkitExitFullscreen" : (this.browserSpecific.exitFullscreen = "nextendExitFullscreen", this.fullParent[0][this.browserSpecific.exitFullscreen] = e.proxy(function () {
			this.fullParent.css({
				position: "",
				left: "",
				top: "",
				width: "",
				height: "",
				backgroundColor: "",
				zIndex: ""
			}), document.fullscreenElement = null, this.triggerEvent(document, this.browserSpecific.event)
		}, this)), document.addEventListener(this.browserSpecific.event, e.proxy(this.fullScreenChange, this))
	}
	return i.prototype.switchState = function () {
		this.isFullScreen = !this.isFullScreen, this.isFullScreen ? this._fullScreen() : this._normalScreen()
	}, i.prototype.requestFullscreen = function () {
		return this.isFullScreen ? !1 : (this.isFullScreen = !0, this._fullScreen(), !0)
	}, i.prototype.exitFullscreen = function () {
		return this.isFullScreen ? (this.isFullScreen = !1, this._normalScreen(), !0) : !1
	}, i.prototype.triggerEvent = function (e, t) {
		var i;
		document.createEvent ? (i = document.createEvent("HTMLEvents"), i.initEvent(t, !0, !0)) : document.createEventObject && (i = document.createEventObject(), i.eventType = t), i.eventName = t, e.dispatchEvent ? e.dispatchEvent(i) : e.fireEvent && htmlEvents["on" + t] ? e.fireEvent("on" + i.eventType, i) : e[t] ? e[t]() : e["on" + t] && e["on" + t]()
	}, i.prototype._fullScreen = function () {
		this.forceFullpage && (this.responsive.isFullScreen = !0, this.responsive.parameters.type = "fullpage", this.responsive.parameters.upscale = !0, this.responsive.parameters.forceFull = !1, this._marginLeft = this.responsive.containerElement[0].style.marginLeft, this.responsive.containerElement.css(n2const.rtl.marginLeft, 0)), this.fullParent.css({
			width: "100%",
			height: "100%",
			backgroundColor: e("body").css("background-color")
		}).addClass("n2-ss-in-fullscreen"), this.fullParent.get(0)[this.browserSpecific.requestFullscreen]()
	}, i.prototype._normalScreen = function () {
		document[this.browserSpecific.exitFullscreen] ? document[this.browserSpecific.exitFullscreen]() : this.fullParent[0][this.browserSpecific.exitFullscreen] && this.fullParent[0][this.browserSpecific.exitFullscreen]()
	}, i.prototype.fullScreenChange = function () {
		this.isDocumentInFullScreenMode() ? (this.slider.sliderElement.triggerHandler("n2FullScreen"), e("html").addClass("n2-in-fullscreen"), this.isFullScreen = !0, e(window).trigger("resize")) : this.forceFullpage && (this.responsive.isFullScreen = !1, this.responsive.parameters.type = this._type, this.responsive.parameters.upscale = this._upscale, this.responsive.parameters.forceFull = this._forceFull, this.responsive.parameters.minimumHeightRatio = this._minimumHeightRatio, this.responsive.parameters.maximumHeightRatio = this._maximumHeightRatio, this.responsive.containerElement.css(n2const.rtl.marginLeft, this._marginLeft), this.fullParent.css({
			width: "",
			height: "",
			backgroundColor: ""
		}).removeClass("n2-ss-in-fullscreen"), e("html").removeClass("n2-in-fullscreen"), e(window).trigger("resize"), this.isFullScreen = !1, this.slider.sliderElement.triggerHandler("n2ExitFullScreen"))
	}, i.prototype.isDocumentInFullScreenMode = function () {
		return document.fullscreenElement && null !== document.fullscreenElement || document.msFullscreenElement && null !== document.msFullscreenElement || document.mozFullScreen || document.webkitIsFullScreen
	}, i
}), N2D("SmartSliderControlKeyboard", function (e, t) {
	"use strict";

	function i() {
		this.controls = [], document.addEventListener("keydown", this.onKeyDown.bind(this)), document.addEventListener("mousemove", this.onMouseMove.bind(this), {
			capture: !0
		})
	}

	function s(t, n, o) {
		this.slider = t, this.parameters = e.extend({}, o), "vertical" === n ? this.parseEvent = s.prototype.parseEventVertical : this.parseEvent = s.prototype.parseEventHorizontal, r || (r = new i), r.addControl(this), this.slider.sliderElement.on("SliderKeyDown", this.onKeyDown.bind(this)), t.controls.keyboard = this
	}
	var r;
	return i.prototype.onMouseMove = function (e) {
		this.mouseEvent = e
	}, i.prototype.addControl = function (e) {
		this.controls.push(e)
	}, i.prototype.onKeyDown = function (e) {
		if (e.target.tagName.match(/BODY|DIV|IMG/) && !e.target.isContentEditable) {
			var t;
			if (this.mouseEvent && (t = this.findSlider(document.elementFromPoint(this.mouseEvent.clientX, this.mouseEvent.clientY)))) return void t.trigger("SliderKeyDown", e);
			if (document.activeElement !== document.body && (t = this.findSlider(document.activeElement))) return void t.trigger("SliderKeyDown", e);
			for (var i = 0; i < this.controls.length; i++) this.controls[i].onKeyDown(!1, e)
		}
	}, i.prototype.findSlider = function (t) {
		var i, s = e(t);
		return i = s.hasClass("n2-ss-slider") ? s : s.closest(".n2-ss-slider"), i.length ? i : !1
	}, s.prototype.isSliderOnScreen = function () {
		var t = this.slider.sliderElement.offset(),
			i = e(window).scrollTop(),
			s = this.slider.sliderElement.height();
		return t.top + .5 * s >= i && t.top - .5 * s <= i + e(window).height()
	}, s.prototype.onKeyDown = function (e, t) {
		!t.defaultPrevented && this.isSliderOnScreen() && this.parseEvent.call(this, t) && t.preventDefault()
	}, s.prototype.parseEventHorizontal = function (e) {
		switch (e.keyCode) {
			case 39:
				return this.slider[n2const.isRTL() ? "previous" : "next"](), !0;
			case 37:
				return this.slider[n2const.isRTL() ? "next" : "previous"](), !0;
			default:
				return !1
		}
	}, s.prototype.parseEventVertical = function (e) {
		switch (e.keyCode) {
			case 40:
				return this.slider.isChangeCarousel("next") && this.slider.parameters.controls.blockCarouselInteraction ? !1 : (this.slider.next(), !0);
			case 38:
				return this.slider.isChangeCarousel("previous") && this.slider.parameters.controls.blockCarouselInteraction ? !1 : (this.slider.previous(), !0);
			default:
				return !1
		}
	}, s
}), N2D("SmartSliderControlMouseWheel", function (e, t) {
	"use strict";

	function i(t) {
		this.preventScroll = {
			local: !1,
			global: !1,
			localTimeout: !1,
			globalTimeout: !1
		}, this.slider = t, document.addEventListener("wheel", e.proxy(this.onGlobalMouseWheel, this), {
			passive: !1
		}), t.controls.mouseWheel = this
	}
	return i.prototype.hasScrollableParentRecursive = function (t, i) {
		if (i === this.slider.sliderElement[0]) return !1;
		if (i.scrollHeight > i.clientHeight) {
			var s = e(i).css("overflow");
			if ("hidden" !== s && "visible" !== s)
				if (t) {
					if (i.scrollTop > 0) return !0
				} else if (i.scrollTop + i.clientHeight < i.scrollHeight) return !0
		}
		return this.hasScrollableParentRecursive(t, i.parentNode)
	}, i.prototype.onGlobalMouseWheel = function (t) {
		this.preventScroll.local ? t.preventDefault() : (this.preventScroll.global && t.preventDefault(), (this.slider.sliderElement[0] === t.target || e.contains(this.slider.sliderElement[0], t.target)) && (t.shiftKey || this.hasScrollableParentRecursive(t.deltaY < 0, t.target) || this.onMouseWheel(t)))
	}, i.prototype.onMouseWheel = function (e) {
		var t = e.deltaY < 0;
		t ? this.slider.isChangeCarousel("previous") && this.slider.parameters.controls.blockCarouselInteraction || (this.slider.previous(), e.preventDefault(), this.local1(), this.global()) : this.slider.isChangeCarousel("next") && this.slider.parameters.controls.blockCarouselInteraction || (this.slider.next(), e.preventDefault(), this.local1(), this.global())
	}, i.prototype.local1 = function () {
		this.preventScroll.local !== !1 && clearTimeout(this.preventScroll.localTimeout), this.preventScroll.local = !0, this.preventScroll.localTimeout = setTimeout(e.proxy(function () {
			this.preventScroll.local = !1
		}, this), 1e3)
	}, i.prototype.global = function () {
		this.preventScroll.global !== !1 && clearTimeout(this.preventScroll.globalTimeout), this.preventScroll.global = !0, this.preventScroll.globalTimeout = setTimeout(e.proxy(function () {
			this.preventScroll.global = !1
		}, this), 1500)
	}, i
}), N2D("SmartSliderControlTouch", function (e, t) {
	"use strict";

	function i(t) {
		if (this.slider = t, this.minDistance = 10, this.interactiveDrag = !0, this.preventMultipleTap = !1, this._animation = t.mainAnimation, this.swipeElement = this.slider.sliderElement.find("> .n2-ss-swipe-element"), this.$window = e(window), navigator.userAgent.toLowerCase().indexOf("android") > -1) {
			var i = this.swipeElement.parent();
			"1" !== i.css("opacity") ? this.swipeElement.parent().one("transitionend", e.proxy(this.initTouch, this)) : this.initTouch()
		} else this.initTouch();
		this.slider.sliderElement.on("sliderChangeCurrentSlide", e.proxy(this.updatePanDirections, this)), this.swipeElement.addClass("n2-grab"), t.controls.touch = this
	}
	return i.prototype.initTouch = function () {
		this._animation.isNoAnimation && (this.interactiveDrag = !1), this.eventBurrito = N2Classes.EventBurrito(this.swipeElement.get(0), {
			mouse: !0,
			axis: "horizontal" === this.axis ? "x" : "y",
			start: e.proxy(this._start, this),
			move: e.proxy(this._move, this),
			end: e.proxy(this._end, this)
		}), this.updatePanDirections(), this.cancelKineticScroll = e.proxy(function () {
			this.kineticScrollCancelled = !0
		}, this)
	}, i.prototype._start = function (t) {
		this.currentInteraction = {
			type: "pointerdown" === t.type ? "pointer" : "touchstart" === t.type ? "touch" : "mouse",
			state: e.extend({}, this.state),
			action: "unknown",
			distance: [],
			distanceY: [],
			percent: 0,
			progress: 0,
			scrollTop: this.$window.scrollTop(),
			animationStartDirection: "unknown",
			hadDirection: !1
		}, this.logDistance(0, 0)
	}, i.prototype._move = function (e, t, i, s) {
		if (!s || "unknown" !== this.currentInteraction.action) {
			this.currentInteraction.direction = this.measure(i);
			var r = this.get(i);
			if ((this.currentInteraction.hadDirection || Math.abs(r) > this.minDistance || Math.abs(i.y) > this.minDistance) && (this.logDistance(r, i.y), this.currentInteraction.percent < 1 && this.setTouchProgress(r, i.y), "touch" === this.currentInteraction.type && e.cancelable && ("switch" === this.currentInteraction.action || "hold" === this.currentInteraction.action))) return this.currentInteraction.hadDirection = !0, !0
		}
		return !1
	}, i.prototype._end = function (e, t, i, s) {
		if ("switch" === this.currentInteraction.action) {
			var r = s ? 0 : this.measureRealDirection();
			if (this.interactiveDrag) {
				var n = this._animation.timeline.progress();
				1 > n && this._animation.setTouchEnd(r, this.currentInteraction.progress, i.time), this._animation.setTouch(!1)
			} else r && this.callAction(this.currentInteraction.animationStartDirection);
			this.swipeElement.removeClass("n2-grabbing")
		}
		this.onEnd(), delete this.currentInteraction, Math.abs(i.x) < 10 && Math.abs(i.y) < 10 ? this.onTap(e) : nextend.preventClick()
	}, i.prototype.onEnd = function () {
		if ("scroll" === this.currentInteraction.action && "pointer" === this.currentInteraction.type) {
			var t = this.currentInteraction.distanceY[0],
				i = this.currentInteraction.distanceY[this.currentInteraction.distanceY.length - 1],
				s = (t.d - i.d) / (i.t - t.t) * 10,
				r = Date.now(),
				n = e.proxy(function () {
					requestAnimationFrame(e.proxy(function () {
						var e, t;
						return !this.kineticScrollCancelled && s && (e = Date.now() - r, t = s * Math.exp(-e / 325), t > 1 || -1 > t) ? (this.$window.scrollTop(this.$window.scrollTop() + t), void n()) : (delete this.kineticScrollCancelled, void document.removeEventListener("pointerdown", this.cancelKineticScroll))
					}, this))
				}, this);
			this.kineticScrollCancelled = !1, n(), document.addEventListener("pointerdown", this.cancelKineticScroll)
		}
	}, i.prototype.setTouchProgress = function (e, t) {
		this.recognizeSwitchInteraction();
		var i, s = this.getPercent(e);
		if (this.currentInteraction.percent = s, "switch" === this.currentInteraction.action) {
			if (this.interactiveDrag) {
				switch (this.currentInteraction.animationStartDirection) {
					case "up":
						i = -1 * s;
						break;
					case "down":
						i = s;
						break;
					case "left":
						i = -1 * s;
						break;
					case "right":
						i = s
				}
				this.currentInteraction.progress = i, this._animation.setTouchProgress(i)
			}
		} else "unknown" !== this.currentInteraction.action && "scroll" !== this.currentInteraction.action || this.startScrollInteraction(t)
	}, i.prototype.startScrollInteraction = function (e) {
		("vertical" === this.axis || n2const.isEdge) && (this.slider.controlFullscreen.isFullScreen || (this.currentInteraction.action = "scroll",
			"pointer" === this.currentInteraction.type && this.$window.scrollTop(Math.max(0, this.currentInteraction.scrollTop - e))))
	}, i.prototype.recognizeSwitchInteraction = function () {
		if ("unknown" === this.currentInteraction.action)
			if ("ended" === this._animation.state) {
				var e = this.currentInteraction.direction;
				if ("unknown" !== e && this.currentInteraction.state[e]) {
					if (this.currentInteraction.animationStartDirection = e, this.interactiveDrag) {
						this._animation.setTouch(this.axis);
						this.callAction(e, !1)
					}
					this.currentInteraction.action = "switch", this.swipeElement.addClass("n2-grabbing")
				}
			} else "playing" === this._animation.state && (this.currentInteraction.action = "hold")
	}, i.prototype.logDistance = function (e, t) {
		this.currentInteraction.distance.length > 3 && (this.currentInteraction.distance.shift(), this.currentInteraction.distanceY.shift()), this.currentInteraction.distance.push({
			d: e,
			t: Date.now()
		}), this.currentInteraction.distanceY.push({
			d: t,
			t: Date.now()
		})
	}, i.prototype.measureRealDirection = function () {
		var e = this.currentInteraction.distance[0],
			t = this.currentInteraction.distance[this.currentInteraction.distance.length - 1];
		return t.d >= 0 && e.d > t.d || t.d < 0 && e.d < t.d ? 0 : 1
	}, i.prototype.onTap = function (t) {
		this.preventMultipleTap || (e(t.target).trigger("n2click"), this.preventMultipleTap = !0, setTimeout(e.proxy(function () {
			this.preventMultipleTap = !1
		}, this), 500))
	}, i.prototype.updatePanDirections = function () {}, i.prototype.setState = function (e, t) {
		"object" != typeof arguments[0] && (e = {}, e[arguments[0]] = arguments[1], t = arguments[2]);
		var i = !1;
		for (var s in e) this.state[s] !== e[s] && (this.state[s] = e[s], i = !0);
		i && t && this.eventBurrito.supportsPointerEvents && this.syncTouchAction()
	}, i
}), N2D("SmartSliderControlTouchHorizontal", "SmartSliderControlTouch", function (e, t) {
	"use strict";

	function i() {
		this.state = {
			left: !1,
			right: !1
		}, this.axis = "horizontal", N2Classes.SmartSliderControlTouch.prototype.constructor.apply(this, arguments)
	}
	return i.prototype = Object.create(N2Classes.SmartSliderControlTouch.prototype), i.prototype.constructor = i, i.prototype.callAction = function (e, t) {
		switch (e) {
			case "left":
				return this.slider[n2const.isRTL() ? "previous" : "next"].call(this.slider, t);
			case "right":
				return this.slider[n2const.isRTL() ? "next" : "previous"].call(this.slider, t)
		}
		return !1
	}, i.prototype.measure = function (e) {
		return !this.currentInteraction.hadDirection && Math.abs(e.x) < 10 || 0 === e.x || Math.abs(e.x) < Math.abs(e.y) ? "unknown" : e.x < 0 ? "left" : "right"
	}, i.prototype.get = function (e) {
		return e.x
	}, i.prototype.getPercent = function (e) {
		return Math.max(-.99999, Math.min(.99999, e / this.slider.dimensions.slider.width))
	}, i.prototype.updatePanDirections = function () {
		var e = this.slider.currentSlide.index,
			t = e + 1 < this.slider.slides.length,
			i = e - 1 >= 0;
		this.slider.parameters.carousel && (t = !0, i = !0), n2const.isRTL() && "vertical" !== this.slider.getAnimationAxis() ? this.setState({
			right: t,
			left: i
		}, !0) : this.setState({
			right: i,
			left: t
		}, !0)
	}, i.prototype.syncTouchAction = function () {
		var e = {
			"pan-y": !1,
			none: !1
		};
		n2const.isEdge ? e.none = !0 : (this.state.left && (e["pan-y"] = !0), this.state.right && (e["pan-y"] = !0));
		var t = [];
		for (var i in e) e[i] && t.push(i);
		this.swipeElement.css("touch-action", t.join(" "))
	}, i
}), N2D("SmartSliderControlTouchVertical", "SmartSliderControlTouch", function (e, t) {
	"use strict";

	function i() {
		this.state = {
			up: !1,
			down: !1
		}, this.action = {
			up: "next",
			down: "previous"
		}, this.axis = "vertical", N2Classes.SmartSliderControlTouch.prototype.constructor.apply(this, arguments)
	}
	return i.prototype = Object.create(N2Classes.SmartSliderControlTouch.prototype), i.prototype.constructor = i, i.prototype.callAction = function (e, t) {
		switch (e) {
			case "up":
				return this.slider.next.call(this.slider, t);
			case "down":
				return this.slider.previous.call(this.slider, t)
		}
		return !1
	}, i.prototype.measure = function (e) {
		return !this.currentInteraction.hadDirection && Math.abs(e.y) < 1 || 0 == e.y || Math.abs(e.y) < Math.abs(e.x) ? "unknown" : e.y < 0 ? "up" : "down"
	}, i.prototype.get = function (e) {
		return e.y
	}, i.prototype.getPercent = function (e) {
		return Math.max(-.99999, Math.min(.99999, e / this.slider.dimensions.slider.height))
	}, i.prototype.updatePanDirections = function () {
		this.setState({
			down: !this.slider.isChangeCarousel("previous") || !this.slider.parameters.controls.blockCarouselInteraction,
			up: !this.slider.isChangeCarousel("next") || !this.slider.parameters.controls.blockCarouselInteraction
		}, !0)
	}, i.prototype.syncTouchAction = function () {
		var e = {
			"pan-x": !1,
			none: !1
		};
		n2const.isEdge ? e.none = !0 : (this.state.up && (e["pan-x"] = !0), this.state.down && (e["pan-x"] = !0));
		var t = [];
		for (var i in e) e[i] && t.push(i);
		this.swipeElement.css("touch-action", t.join(" "))
	}, i.prototype._start = function (e) {
		this.slider.blockCarousel = !0, N2Classes.SmartSliderControlTouch.prototype._start.apply(this, arguments)
	}, i.prototype.onEnd = function (e) {
		N2Classes.SmartSliderControlTouch.prototype.onEnd.apply(this, arguments), this.slider.blockCarousel = !1
	}, i
}), N2D("SmartSliderSlideBackgroundColor", function (e, t) {
	function i(e, t) {
		this.$el = t
	}
	return i.prototype.getLoadedDeferred = function () {
		return !0
	}, i
}), N2D("SmartSliderSlideBackgroundImage", function (e, t) {
	function i(t, i, s, r) {
		if (this.loadStarted = !1, this.loadAllowed = !1, this.slide = t, this.manager = i, this.background = s, this.deferred = e.Deferred(), this.$background = r, this.blur = r.data("blur"), "blurfit" === s.mode && (window.n2FilterProperty ? (this.$background = this.$background.add(this.$background.clone().insertAfter(this.$background)), this.$background.first().css({
				margin: "-14px",
				padding: "14px"
			}).css(window.n2FilterProperty, "blur(7px)")) : (s.element.attr("data-mode", "fill"), s.mode = "fill")), window.n2FilterProperty && (this.blur > 0 ? this.$background.last().css({
				margin: "-" + 2 * this.blur + "px",
				padding: 2 * this.blur + "px"
			}).css(window.n2FilterProperty, "blur(" + this.blur + "px)") : this.$background.last().css({
				margin: "",
				padding: ""
			}).css(window.n2FilterProperty, "")), n2const.isWaybackMachine()) this.mobileSrc = this.tabletSrc = this.desktopSrc = r.data("desktop");
		else if (this.desktopSrc = r.data("desktop") || "", this.tabletSrc = r.data("tablet") || "", this.mobileSrc = r.data("mobile") || "", n2const.isRetina) {
			var n = r.data("desktop-retina");
			n && (this.desktopSrc = n), n = r.data("tablet-retina"), n && (this.tabletSrc = n), n = r.data("mobile-retina"), n && (this.mobileSrc = n)
		}
	}
	return i.prototype.getLoadedDeferred = function () {
		return this.deferred
	}, i.prototype.preLoad = function () {
		this.loadAllowed = !0, this.manager.deviceDeferred.done(e.proxy(function () {
			this.updateBackgroundToDevice(this.manager.device), this.waitForImage()
		}, this))
	}, i.prototype.waitForImage = function () {
		this.$background.n2imagesLoaded({
			background: !0
		}, e.proxy(function (t) {
			if (t.images.length > 0) {
				var i = t.images[0].img;
				switch (this.width = i.naturalWidth, this.height = i.naturalHeight, this.background.mode) {
					case "tile":
					case "center":
						n2const.devicePixelRatio > 1 && this.$background.css("background-size", this.width / n2const.devicePixelRatio + "px " + this.height / n2const.devicePixelRatio + "px")
				}
				this.deferred.resolve()
			} else setTimeout(e.proxy(this.waitForImage, this), 100)
		}, this))
	}, i.prototype.updateBackgroundToDevice = function (e) {
		var t = this.desktopSrc;
		"mobile" === e.device ? this.mobileSrc ? t = this.mobileSrc : this.tabletSrc && (t = this.tabletSrc) : "tablet" === e.device && this.tabletSrc && (t = this.tabletSrc), t ? this.setSrc(t) : this.setSrc("")
	}, i.prototype.setSrc = function (e) {
		this.loadAllowed && e !== this.currentSrc && ("" === e ? this.$background.css("background-image", "") : this.$background.css("background-image", 'url("' + e + '")'), this.currentSrc = e)
	}, i.prototype.fadeOut = function () {
		NextendTween.to(this.$background, .3, {
			opacity: 0
		})
	}, i
}), N2D("SmartSliderSlideBackground", function (e, t) {
	function i(t, i, s) {
		if (this.loadStarted = !1, this.types = this.types || {
				color: "SmartSliderSlideBackgroundColor",
				image: "SmartSliderSlideBackgroundImage",
				video: "SmartSliderSlideBackgroundVideo"
			}, this.width = 0, this.height = 0, this.slide = t, this.element = i, t.slider.needBackgroundWrap) {
			var r = i.find("> *");
			this.$wrapElement = e('<div class="n2-ss-slide-background-wrap n2-ow" />').appendTo(i).append(r)
		} else this.$wrapElement = this.element;
		this.manager = s, this.loadDeferred = e.Deferred(), this.elements = {
			color: !1,
			image: !1,
			video: !1
		}, this.currentSrc = "", this.mode = i.data("mode"), this.opacity = i.data("opacity");
		var n = this.element.find(".n2-ss-slide-background-image");
		n.length && (this.elements.image = new N2Classes[this.types.image](t, s, this, n));
		var o = this.element.find(".n2-ss-slide-background-color");
		o.length && (this.elements.color = new N2Classes[this.types.color](this, o));
		var a = [];
		for (var l in this.elements) this.elements[l] && a.push(this.elements[l].getLoadedDeferred());
		e.when.apply(e, a).then(e.proxy(function () {
			this.loadDeferred.resolve()
		}, this))
	}
	return i.prototype.preLoad = function () {
		return this.loadStarted || (this.slide.$element.find("[data-lazysrc]").each(function () {
			var t = e(this);
			t.attr("src", t.data("lazysrc"))
		}), this.loadStarted = !0), "pending" === this.loadDeferred.state() && this.elements.image && this.elements.image.preLoad(), this.loadDeferred
	}, i.prototype.fadeOut = function () {
		this.elements.image && this.elements.image.fadeOut()
	}, i.prototype.hack = function () {
		NextendTween.set(this.element, {
			rotation: 1e-4
		})
	}, i.prototype.hasColor = function () {
		return this.elements.color
	}, i.prototype.hasImage = function () {
		return this.elements.image
	}, i.prototype.hasVideo = function () {
		return this.elements.video
	}, i.prototype.hasBackground = function () {
		return this.elements.color || this.elements.image || this.elements.video
	}, i.prototype.updateBackgroundToDevice = function (e) {
		this.hasImage() && this.elements.image.updateBackgroundToDevice(e)
	}, i
}), N2D("FrontendComponent", function (e, t) {
	function i(e, t, i, s) {
		this.wraps = {}, this.isVisible = !0, this.device = "", this.children = [], this.slide = e, this.parent = t, this.$layer = i.data("layer", this), this.skipSelfAnimation = !1, this.stateCBs = [], this.state = {
			InComplete: !1
		};
		var r = this.$layer.find("> .n2-ss-layer-mask");
		r.length && (this.wraps.mask = r);
		var n = this.$layer.find("> .n2-ss-layer-parallax");
		switch (n.length && (this.wraps.parallax = n), i.data("pm")) {
			case "absolute":
				this.placement = new N2Classes.FrontendPlacementAbsolute(this);
				break;
			case "normal":
				this.placement = new N2Classes.FrontendPlacementNormal(this);
				break;
			case "content":
				this.placement = new N2Classes.FrontendPlacementContent(this);
				break;
			default:
				this.placement = new N2Classes.FrontendPlacementDefault(this)
		}
		if (this.parallax = i.data("parallax"), this.baseSize = this.baseSize || 100, this.isAdaptiveFont = this.get("adaptivefont"), this.refreshBaseSize(this.getDevice("fontsize")), s)
			for (var o = 0; o < s.length; o++) switch (s.eq(o).data("sstype")) {
				case "content":
					this.children.push(new N2Classes.FrontendComponentContent(this.slide, this, s.eq(o)));
					break;
				case "row":
					this.children.push(new N2Classes.FrontendComponentRow(this.slide, this, s.eq(o)));
					break;
				case "col":
					this.children.push(new N2Classes.FrontendComponentCol(this.slide, this, s.eq(o)));
					break;
				case "group":
					break;
				default:
					this.children.push(new N2Classes.FrontendComponentLayer(this.slide, this, s.eq(o)))
			}
	}
	return i.prototype.setState = function (e, t) {
		this.state[e] = t;
		for (var i = 0; i < this.stateCBs.length; i++) this.stateCBs[i].call(this, this.state)
	}, i.prototype.addStateCallback = function (e) {
		this.stateCBs.push(e), e.call(this, this.state)
	}, i.prototype.refreshBaseSize = function (e) {
		this.isAdaptiveFont ? this.baseSize = 16 * e / 100 : this.baseSize = this.parent.baseSize * e / 100
	}, i.prototype.start = function () {
		this.placement.start();
		for (var e = 0; e < this.children.length; e++) this.children[e].start();
		var t = this.get("rotation") || 0;
		if (t / 360 != 0) {
			var i = this.addWrap("rotation", "<div class='n2-ss-layer-rotation'></div>");
			NextendTween.set(i[0], {
				rotationZ: t
			})
		}
	}, i.prototype.onDeviceChange = function (e) {
		this.device = e;
		var i = this.isVisible;
		if (this.isVisible = this.getDevice(""), this.isVisible === t && (this.isVisible = 1), i && !this.isVisible ? (this.$layer.data("shows", 0), this.$layer.css("display", "none"), this.$layer.triggerHandler("visibilityChange", [0])) : !i && this.isVisible && (this.$layer.data("shows", 1), this.$layer.css("display", ""), this.$layer.triggerHandler("visibilityChange", [1])), this.isVisible) {
			var s = this.getDevice("fontsize");
			this.refreshBaseSize(s), this.isAdaptiveFont ? this.$layer.css("font-size", N2Classes.FontSize.toRem(16 * s / 100)) : this.$layer.css("font-size", s + "%");
			for (var r = 0; r < this.children.length; r++) this.children[r].onDeviceChange(e);
			this.placement.onDeviceChange(e), this.onAfterDeviceChange(e)
		}
	}, i.prototype.onAfterDeviceChange = function (e) {}, i.prototype.onResize = function (e, t, i) {
		if (this.isVisible || this.placement.alwaysResize) {
			if (this.isAdaptiveFont) {
				var s = this.getDevice("fontsize");
				this.$layer.css("font-size", N2Classes.FontSize.toRem(16 * s / 100))
			}
			for (var r = 0; r < this.children.length; r++) this.children[r].onResize(e, t, i);
			this.placement.onResize(e, t, i)
		}
	}, i.prototype.getDevice = function (e, i) {
		var s = this.$layer.data(this.device + e);
		return s != t ? s : "desktopportrait" != this.device ? this.$layer.data("desktopportrait" + e) : i !== t ? i : 0
	}, i.prototype.get = function (e) {
		return this.$layer.data(e)
	}, i.prototype.hasLayerAnimation = function () {
		return this.animationManager !== t
	}, i.prototype.getParallaxNodes = function () {
		var e = [];
		if (this.isVisible) {
			this.parallax && e.push(this.$layer[0]);
			for (var t = 0; t < this.children.length; t++) e.push.apply(e, this.children[t].getParallaxNodes())
		}
		return e
	}, i.prototype.addWrap = function (i, s) {
		if (this.wraps[i] === t) {
			var r = e(s);
			switch (i) {
				case "rotation":
					this.wraps.mask !== t ? r.appendTo(this.wraps.mask) : this.wraps.parallax !== t ? r.appendTo(this.wraps.parallax) : r.appendTo(this.$layer), r.append(this.getContents())
			}
			this.wraps[i] = r
		}
		return r
	}, i.prototype.getContents = function () {
		return !1
	}, i
}), N2D("FrontendPlacement", function (e, t) {
	function i(e) {
		this.layer = e, this.alwaysResize = !1
	}
	return i.prototype.start = function () {}, i.prototype.onDeviceChange = function (e) {}, i.prototype.onResize = function (e, t, i) {}, i
}), N2D("FrontendSliderSlide", ["FrontendComponentSlideAbstract"], function (e, t) {
	function i(t, i, s) {
		this.isStaticSlide = !1, this.originalIndex = s, this.index = s, this.localIndex = s, this.$element = i.data("slide", this), this.id = this.$element.data("id"), this.background = !1, this.slides = [this], t.parameters.admin ? this.minimumSlideDuration = 0 : (this.minimumSlideDuration = i.data("slide-duration"), e.isNumeric(this.minimumSlideDuration) || (this.minimumSlideDuration = 0));
		var r = i.find(".n2-ss-layers-container");
		N2Classes.FrontendComponentSlideAbstract.prototype.constructor.call(this, t, r)
	}
	return i.prototype = Object.create(N2Classes.FrontendComponentSlideAbstract.prototype), i.prototype.constructor = i, i.prototype.init = function () {
		N2Classes.FrontendComponentSlideAbstract.prototype.init.call(this);
		var e = this.slider.findSlideBackground(this);
		e.length > 0 && (this.slider.isAdmin ? this.background = new N2Classes.SmartSliderSlideBackgroundAdmin(this, e, this.slider.backgrounds) : this.background = new N2Classes.SmartSliderSlideBackground(this, e, this.slider.backgrounds)), this.$element.data("slideBackground", this.background)
	}, i.prototype.setStarterSlide = function () {
		N2Classes.FrontendComponentSlideAbstract.prototype.setStarterSlide.call(this)
	}, i.prototype.setIndex = function (e) {
		this.localIndex = this.index = e
	}, i.prototype.preLoad = function () {
		return this.background ? this.background.preLoad() : !0
	}, i.prototype.setPrevious = function (e) {
		this.previousSlide = e
	}, i.prototype.setNext = function (e) {
		this.nextSlide = e, e.setPrevious(this)
	}, i.prototype.hasBackgroundVideo = function () {
		return this.background.hasVideo()
	}, i.prototype.getTitle = function () {
		return this.$element.data("title")
	}, i.prototype.getDescription = function () {
		return this.$element.data("description")
	}, i.prototype.getThumbnail = function () {
		return this.$element.data("thumbnail")
	}, i.prototype.getThumbnailType = function () {
		return this.$element.data("thumbnail-type")
	}, i.prototype.hasLink = function () {
		return !!this.$element.data("haslink")
	}, i
}), N2D("FrontendComponentSlideAbstract", ["FrontendComponent"], function (e, t) {
	function i(t, i) {
		this.baseSize = 16, this.slider = t, this.isCurrentlyEdited() || (this.status = s.NOT_INITIALIZED, N2Classes.FrontendComponent.prototype.constructor.call(this, this, this, i, i.find("> .n2-ss-layer, > .n2-ss-layer-group")), this.skipSelfAnimation = !0, this.slider.sliderElement.on({
			SliderDeviceOrientation: e.proxy(function (e, t) {
				this.onDeviceChange(t.device + t.orientation.toLowerCase())
			}, this),
			SliderResize: e.proxy(function (e, t, i) {
				this.onResize(t, i.responsiveDimensions)
			}, this)
		}), N2Classes.FrontendComponent.prototype.start.call(this))
	}
	var s = {
		NOT_INITIALIZED: -1,
		INITIALIZED: 0,
		READY_TO_START: 1,
		PLAYING: 2,
		ENDED: 3,
		SUSPENDED: 4
	};
	return i.prototype = Object.create(N2Classes.FrontendComponent.prototype), i.prototype.constructor = i, i.prototype.is = function (e) {
		return this === e
	}, i.prototype.isCurrentlyEdited = function () {
		return this.slider.parameters.admin && this.$element.hasClass("n2-ss-currently-edited-slide")
	}, i.prototype.trigger = function () {
		this.$element.trigger.apply(this.$element, [].slice.call(arguments))
	}, i.prototype.triggerHandler = function () {
		return this.$element.triggerHandler.apply(this.$element, [].slice.call(arguments))
	}, i.prototype.init = function () {}, i.prototype.refreshBaseSize = function (e) {}, i.prototype.onResize = function (e, t) {
		for (var i = 0; i < this.children.length; i++) this.children[i].onResize(e, t, this.isStaticSlide)
	}, i.prototype.hasLayers = function () {
		return this.children.length > 0
	}, i.prototype.onDeviceChange = function (e) {
		this.device = e;
		for (var t = 0; t < this.children.length; t++) this.children[t].onDeviceChange(e);
		this.placement.onDeviceChange(e)
	}, i.prototype.setStarterSlide = function () {}, i
}), N2D("FrontendSliderStaticSlide", ["FrontendComponentSlideAbstract"], function (e, t) {
	function i(e, t) {
		this.isStaticSlide = !0, this.$element = t.data("slide", this), N2Classes.FrontendComponentSlideAbstract.prototype.constructor.call(this, e, t), this.init()
	}
	return i.prototype = Object.create(N2Classes.FrontendComponentSlideAbstract.prototype), i.prototype.constructor = i, i
}), N2D("FrontendPlacementAbsolute", ["FrontendPlacement"], function (e, t) {
	function i(e) {
		return {
			left: e.prop("offsetLeft"),
			top: e.prop("offsetTop")
		}
	}

	function s(e) {
		this.linked = [], this.parentLayer = !1, this.$parent = !1, N2Classes.FrontendPlacement.prototype.constructor.apply(this, arguments)
	}
	return s.prototype = Object.create(N2Classes.FrontendPlacement.prototype), s.prototype.constructor = s, s.prototype.start = function () {
		var t = this.layer.get("parentid");
		t && (this.$parent = e("#" + t), 0 == this.$parent.length ? this.$parent = !1 : (this.parentLayer = this.$parent.data("layer"), this.parentLayer.placement.addLinked(this), this.onResize = function () {}))
	}, s.prototype.addLinked = function (e) {
		this.linked.push(e), this.alwaysResize = !0
	}, s.prototype.onResize = s.prototype.onResizeLinked = function (e, t, s) {
		var r = this.layer.$layer,
			n = e.slideW,
			o = n,
			a = e.slideH,
			l = a;
		parseInt(this.layer.get("responsivesize")) || (o = l = 1), r.css("width", this.getWidth(o)), r.css("height", this.getHeight(l)), parseInt(this.layer.get("responsiveposition")) || (n = a = 1);
		var h = this.layer.getDevice("left") * n,
			d = this.layer.getDevice("top") * a,
			p = this.layer.getDevice("align"),
			c = this.layer.getDevice("valign"),
			u = {
				left: "auto",
				top: "auto",
				right: "auto",
				bottom: "auto"
			};
		if (this.$parent && this.$parent.data("layer").isVisible) {
			var m = i(this.$parent),
				f = {
					left: 0,
					top: 0
				};
			switch (this.layer.getDevice("parentalign")) {
				case "right":
					f.left = m.left + this.$parent.width();
					break;
				case "center":
					f.left = m.left + this.$parent.width() / 2;
					break;
				default:
					f.left = m.left
			}
			switch (p) {
				case "right":
					u.right = r.parent().width() - f.left - h + "px";
					break;
				case "center":
					u.left = f.left + h - r.width() / 2 + "px";
					break;
				default:
					u.left = f.left + h + "px"
			}
			switch (this.layer.getDevice("parentvalign")) {
				case "bottom":
					f.top = m.top + this.$parent.height();
					break;
				case "middle":
					f.top = m.top + this.$parent.height() / 2;
					break;
				default:
					f.top = m.top
			}
			switch (c) {
				case "bottom":
					u.bottom = r.parent().height() - f.top - d + "px";
					break;
				case "middle":
					u.top = f.top + d - r.height() / 2 + "px";
					break;
				default:
					u.top = f.top + d + "px"
			}
		} else {
			switch (p) {
				case "right":
					u.right = -h + "px";
					break;
				case "center":
					u.left = (s ? r.parent().width() : t.slide.width) / 2 + h - r.width() / 2 + "px";
					break;
				default:
					u.left = h + "px"
			}
			switch (c) {
				case "bottom":
					u.bottom = -d + "px";
					break;
				case "middle":
					u.top = (s ? r.parent().height() : t.slide.height) / 2 + d - r.height() / 2 + "px";
					break;
				default:
					u.top = d + "px"
			}
		}
		r.css(u);
		for (var y = 0; y < this.linked.length; y++) this.linked[y].onResizeLinked(e, t, s)
	}, s.prototype.getWidth = function (e) {
		var t = this.layer.getDevice("width");
		return this.isDimensionPropertyAccepted(t) ? t : t * e + "px"
	}, s.prototype.getHeight = function (e) {
		var t = this.layer.getDevice("height");
		return this.isDimensionPropertyAccepted(t) ? t : t * e + "px"
	}, s.prototype.isDimensionPropertyAccepted = function (e) {
		return !(!(e + "").match(/[0-9]+%/) && "auto" != e)
	}, s
}), N2D("FrontendPlacementContent", ["FrontendPlacement"], function (e, t) {
	function i(e) {
		N2Classes.FrontendPlacement.prototype.constructor.apply(this, arguments)
	}
	return i.prototype = Object.create(N2Classes.FrontendPlacement.prototype), i.prototype.constructor = i, i
}), N2D("FrontendPlacementDefault", ["FrontendPlacement"], function (e, t) {
	function i(e) {
		N2Classes.FrontendPlacement.prototype.constructor.apply(this, arguments)
	}
	return i.prototype = Object.create(N2Classes.FrontendPlacement.prototype), i.prototype.constructor = i, i
}), N2D("FrontendPlacementNormal", ["FrontendPlacement"], function (e, t) {
	function i(e) {
		N2Classes.FrontendPlacement.prototype.constructor.apply(this, arguments)
	}
	return i.prototype = Object.create(N2Classes.FrontendPlacement.prototype), i.prototype.constructor = i, i.prototype.onDeviceChange = function () {
		this.updateMargin(), this.updateHeight(), this.updateMaxWidth(), this.updateSelfAlign()
	}, i.prototype.updateMargin = function () {
		var e = this.layer.getDevice("margin").split("|*|"),
			t = e.pop(),
			i = this.layer.baseSize;
		if ("px+" == t && i > 0) {
			t = "em";
			for (var s = 0; s < e.length; s++) e[s] = parseInt(e[s]) / i
		}
		this.layer.$layer.css("margin", e.join(t + " ") + t)
	}, i.prototype.updateHeight = function () {
		var e = this.layer.getDevice("height"),
			t = "px";
		if (e > 0) {
			var i = this.layer.baseSize;
			i > 0 && (t = "em", e = parseInt(e) / i), this.layer.$layer.css("height", e + t)
		} else this.layer.$layer.css("height", "")
	}, i.prototype.updateMaxWidth = function () {
		var e = parseInt(this.layer.getDevice("maxwidth"));
		0 >= e || isNaN(e) ? this.layer.$layer.css("maxWidth", "").attr("data-has-maxwidth", "0") : this.layer.$layer.css("maxWidth", e + "px").attr("data-has-maxwidth", "1")
	}, i.prototype.updateSelfAlign = function () {
		this.layer.$layer.attr("data-cssselfalign", this.layer.getDevice("selfalign"))
	}, i
}), N2D("FrontendComponentCol", ["FrontendComponent"], function (e, t) {
	function i(e, t, i) {
		this.$content = i.find(".n2-ss-layer-col:first"), N2Classes.FrontendComponent.prototype.constructor.call(this, e, t, i, this.$content.find("> .n2-ss-layer"))
	}
	return i.prototype = Object.create(N2Classes.FrontendComponent.prototype), i.prototype.constructor = i, i.prototype.onDeviceChange = function (e) {
		N2Classes.FrontendComponent.prototype.onDeviceChange.apply(this, arguments), this.updateOrder(), this.updatePadding(), this.updateInnerAlign(), this.updateMaxWidth()
	}, i.prototype.updatePadding = function () {
		var e = this.getDevice("padding").split("|*|"),
			t = e.pop(),
			i = this.baseSize;
		if ("px+" === t && i > 0) {
			t = "em";
			for (var s = 0; s < e.length; s++) e[s] = parseInt(e[s]) / i
		}
		this.$content.css("padding", e.join(t + " ") + t)
	}, i.prototype.updateInnerAlign = function () {
		this.$layer.attr("data-csstextalign", this.getDevice("inneralign"))
	}, i.prototype.updateMaxWidth = function () {
		var e = parseInt(this.getDevice("maxwidth"));
		0 >= e || isNaN(e) ? this.$layer.css("maxWidth", "").attr("data-has-maxwidth", "0") : this.$layer.css("maxWidth", e + "px").attr("data-has-maxwidth", "1")
	}, i.prototype.getWidthPercentage = function () {
		return parseFloat(this.$layer.data("colwidthpercent"))
	}, i.prototype.getRealOrder = function () {
		var e = this.getDevice("order");
		return 0 == e ? 10 : e
	}, i.prototype.updateOrder = function () {
		var e = this.getDevice("order");
		0 == e ? this.$layer.css("order", "") : this.$layer.css("order", e)
	}, i.prototype.getContents = function () {
		return this.$content
	}, i
}), N2D("FrontendComponentContent", ["FrontendComponent"], function (e, t) {
	function i(e, t, i) {
		this.$content = i.find(".n2-ss-section-main-content:first"), N2Classes.FrontendComponent.prototype.constructor.call(this, e, t, i, this.$content.find("> .n2-ss-layer"))
	}
	return i.prototype = Object.create(N2Classes.FrontendComponent.prototype), i.prototype.constructor = i, i.prototype.onDeviceChange = function (e) {
		N2Classes.FrontendComponent.prototype.onDeviceChange.apply(this, arguments), this.updatePadding(), this.updateInnerAlign(), this.updateMaxWidth(), this.updateSelfAlign()
	}, i.prototype.updatePadding = function () {
		var e = this.getDevice("padding").split("|*|"),
			t = e.pop(),
			i = this.baseSize;
		if ("px+" == t && i > 0) {
			t = "em";
			for (var s = 0; s < e.length; s++) e[s] = parseInt(e[s]) / i
		}
		this.$content.css("padding", e.join(t + " ") + t)
	}, i.prototype.updateInnerAlign = function () {
		this.$layer.attr("data-csstextalign", this.getDevice("inneralign"))
	}, i.prototype.updateMaxWidth = function () {
		var e = parseInt(this.getDevice("maxwidth"));
		0 >= e || isNaN(e) ? this.$layer.css("maxWidth", "").attr("data-has-maxwidth", "0") : this.$layer.css("maxWidth", e + "px").attr("data-has-maxwidth", "1")
	}, i.prototype.updateSelfAlign = function () {
		this.$layer.attr("data-cssselfalign", this.getDevice("selfalign"))
	}, i.prototype.getContents = function () {
		return this.$content
	}, i
}), N2D("FrontendComponentLayer", ["FrontendComponent"], function (e, t) {
	function i(e, i, s) {
		N2Classes.FrontendComponent.prototype.constructor.call(this, e, i, s), this.wraps.mask !== t ? this.$item = this.wraps.mask.children() : this.wraps.parallax !== t ? this.$item = this.wraps.parallax.children() : this.$item = s.children()
	}
	return i.prototype = Object.create(N2Classes.FrontendComponent.prototype), i.prototype.constructor = i, i.prototype.getContents = function () {
		return this.$item
	}, i
}), N2D("FrontendComponentRow", ["FrontendComponent"], function (e, t) {
	function i(e, t, i) {
		this.$row = i.find(".n2-ss-layer-row:first"), this.$rowInner = this.$row.find(".n2-ss-layer-row-inner:first"), N2Classes.FrontendComponent.prototype.constructor.call(this, e, t, i, this.$rowInner.find("> .n2-ss-layer"))
	}
	return i.prototype = Object.create(N2Classes.FrontendComponent.prototype), i.prototype.constructor = i, i.prototype.onDeviceChange = function (e) {
		N2Classes.FrontendComponent.prototype.onDeviceChange.apply(this, arguments), this.updatePadding(), this.updateGutter(), this.updateInnerAlign()
	}, i.prototype.onAfterDeviceChange = function (e) {
		this.updateWrapAfter()
	}, i.prototype.updatePadding = function () {
		var e = this.getDevice("padding").split("|*|"),
			t = e.pop(),
			i = this.baseSize;
		if ("px+" === t && i > 0) {
			t = "em";
			for (var s = 0; s < e.length; s++) e[s] = parseInt(e[s]) / i
		}
		this.$row.css("padding", e.join(t + " ") + t)
	}, i.prototype.updateInnerAlign = function () {
		this.$layer.attr("data-csstextalign", this.getDevice("inneralign"))
	}, i.prototype.updateGutter = function () {
		var e = this.getDevice("gutter"),
			t = e / 2;
		if (this.children.length > 0)
			for (var i = this.children.length - 1; i >= 0; i--) this.children[i].$layer.css("margin", t + "px");
		this.$rowInner.css({
			width: "calc(100% + " + (e + 1) + "px)",
			margin: -t + "px"
		})
	}, i.prototype.getSortedColumns = function () {
		for (var t = e.extend([], this.children).sort(function (e, t) {
				return e.getRealOrder() - t.getRealOrder()
			}), i = t.length - 1; i >= 0; i--) t[i].isVisible || t.splice(i, 1);
		return t
	}, i.prototype.updateWrapAfter = function () {
		var e = parseInt(this.getDevice("wrapafter")),
			t = this.getSortedColumns(),
			i = t.length,
			s = !1;
		if (0 === i) return !1;
		e > 0 && i > e && (s = !0), this.$row.attr("row-wrapped", s ? 1 : 0);
		var r;
		if (s) {
			var n = [];
			for (r = 0; i > r; r++) {
				var o = Math.floor(r / e);
				"undefined" == typeof n[o] && (n[o] = []), n[o].push(t[r]), t[r].$layer.attr("data-r", o).toggleClass("n2-ss-last-in-row", (r + 1) % e === 0 || r === i - 1)
			}
			var a = this.getDevice("gutter");
			for (r = 0; r < n.length; r++) {
				var l, h = n[r],
					d = 0;
				for (l = 0; l < h.length; l++) d += h[l].getWidthPercentage();
				for (l = 0; l < h.length; l++) h[l].$layer.css("width", "calc(" + h[l].getWidthPercentage() / d * 100 + "% - " + (n2const.isIE || n2const.isEdge ? a + 1 : a) + "px)")
			}
		} else {
			var d = 0;
			for (r = 0; i > r; r++) d += t[r].getWidthPercentage();
			for (r = 0; i > r; r++) t[r].$layer.css("width", t[r].getWidthPercentage() / d * 100 + "%").removeClass("n2-ss-last-in-row").attr("data-r", 0);
			t[i - 1].$layer.addClass("n2-ss-last-in-row")
		}
	}, i.prototype.getContents = function () {
		return this.$row
	}, i
}), N2D("SmartSliderResponsive", function (e, t) {
	function i(t, i) {
		this.disableTransitions = !1, this.disableTransitionsTimeout = null, this.lastClientHeight = 0, this.lastClientHeightTime = 0, this.lastOrientation = 0, this.pixelSnappingFraction = 0, this.focusOffsetTop = 0, this.focusOffsetBottom = 0, this.isFullScreen = !1, this.invalidateResponsiveState = !0, this.parameters = e.extend({
			desktop: 1,
			tablet: 1,
			mobile: 1,
			onResizeEnabled: !0,
			type: "auto",
			downscale: !0,
			upscale: !1,
			constrainRatio: !0,
			minimumHeight: 0,
			maximumHeight: 0,
			minimumHeightRatio: 0,
			maximumHeightRatio: {
				desktopLandscape: 0,
				desktopPortrait: 0,
				mobileLandscape: 0,
				mobilePortrait: 0,
				tabletLandscape: 0,
				tabletPortrait: 0
			},
			maximumSlideWidth: 0,
			maximumSlideWidthLandscape: 0,
			maximumSlideWidthRatio: -1,
			maximumSlideWidthTablet: 0,
			maximumSlideWidthTabletLandscape: 0,
			maximumSlideWidthMobile: 0,
			maximumSlideWidthMobileLandscape: 0,
			maximumSlideWidthConstrainHeight: 0,
			forceFull: 0,
			forceFullOverflowX: "body",
			forceFullHorizontalSelector: "",
			sliderHeightBasedOn: "real",
			decreaseSliderHeight: 0,
			focusUser: 1,
			deviceModes: {
				desktopLandscape: 1,
				desktopPortrait: 0,
				mobileLandscape: 0,
				mobilePortrait: 0,
				tabletLandscape: 0,
				tabletPortrait: 0
			},
			normalizedDeviceModes: {
				unknownUnknown: ["unknown", "Unknown"],
				desktopPortrait: ["desktop", "Portrait"]
			},
			verticalRatioModifiers: {
				unknownUnknown: 1,
				desktopLandscape: 1,
				desktopPortrait: 1,
				mobileLandscape: 1,
				mobilePortrait: 1,
				tabletLandscape: 1,
				tabletPortrait: 1
			},
			minimumFontSizes: {
				desktopLandscape: 0,
				desktopPortrait: 0,
				mobileLandscape: 0,
				mobilePortrait: 0,
				tabletLandscape: 0,
				tabletPortrait: 0
			},
			ratioToDevice: {
				Portrait: {
					tablet: 0,
					mobile: 0
				},
				Landscape: {
					tablet: 0,
					mobile: 0
				}
			},
			sliderWidthToDevice: {
				desktopLandscape: 0,
				desktopPortrait: 0,
				mobileLandscape: 0,
				mobilePortrait: 0,
				tabletLandscape: 0,
				tabletPortrait: 0
			},
			basedOn: "combined",
			desktopPortraitScreenWidth: 1200,
			tabletPortraitScreenWidth: 800,
			mobilePortraitScreenWidth: 440,
			tabletLandscapeScreenWidth: 1024,
			mobileLandscapeScreenWidth: 740,
			orientationMode: "width_and_height",
			overflowHiddenPage: 0,
			focus: {
				offsetTop: "",
				offsetBottom: ""
			}
		}, i), t.isAdmin && (this.doResize = NextendThrottle(this.doResize, 50)), this.loadDeferred = e.Deferred(), this.slider = t, this.sliderElement = t.sliderElement
	}
	var s = null,
		r = null;
	return i.OrientationMode = {
		SCREEN: 0,
		ADMIN_LANDSCAPE: 1,
		ADMIN_PORTRAIT: 2,
		SCREEN_WIDTH_ONLY: 3
	}, i.DeviceOrientation = {
		UNKNOWN: 0,
		LANDSCAPE: 1,
		PORTRAIT: 2
	}, i._DeviceOrientation = {
		0: "Unknown",
		1: "Landscape",
		2: "Portrait"
	}, i.DeviceMode = {
		UNKNOWN: 0,
		DESKTOP: 1,
		TABLET: 2,
		MOBILE: 3
	}, i._DeviceMode = {
		0: "unknown",
		1: "desktop",
		2: "tablet",
		3: "mobile"
	}, i.prototype.start = function () {
		nextend.fontsDeferred === t ? N2R("windowLoad", e.proxy(function () {
			this.loadDeferred.resolve()
		}, this)) : nextend.fontsDeferred.always(e.proxy(function () {
			this.loadDeferred.resolve()
		}, this)), this.normalizeTimeout = null, this.delayedResizeAdded = !1, this.deviceMode = i.DeviceMode.UNKNOWN, this.orientationMode = i.OrientationMode.SCREEN, this.orientation = i.DeviceOrientation.UNKNOWN, this.lastRatios = {
			ratio: -1
		}, this.lastRawRatios = {
			ratio: -1
		}, this.normalizedMode = "unknownUnknown", this.widgetMargins = {
			Top: [],
			Right: [],
			Bottom: [],
			Left: []
		}, this.staticSizes = {
			paddingTop: 0,
			paddingRight: 0,
			paddingBottom: 0,
			paddingLeft: 0
		}, this.enabledWidgetMargins = [], this.alignElement = this.slider.sliderElement.closest(".n2-ss-align"), this.$section = this.alignElement.parent();
		var n = this.ready = e.Deferred();
		switch (this.sliderElement.triggerHandler("SliderResponsiveStarted"), this.sliderElement.one("SliderResize", function () {
			n.resolve()
		}), "fullpage" === this.parameters.type && "100vh" === this.parameters.sliderHeightBasedOn && (this.$viewportHeight = e('<div style="height:100vh;width:0;position:absolute;bottom:0;visibility:hidden;"></div>').appendTo("body")), this.containerElementPadding = this.sliderElement.parent(), this.containerElement = this.containerElementPadding.parent(), !this.slider.isAdmin && this.parameters.overflowHiddenPage && e("html, body").css("overflow", "hidden"), "width" == this.parameters.orientationMode && (this.orientationMode = i.OrientationMode.SCREEN_WIDTH_ONLY), nextend.smallestZoom = Math.min(Math.max(this.parameters.sliderWidthToDevice.mobilePortrait, 120), 320), this.parameters.basedOn) {
			case "screen":
				break;
			default:
				if (null == s) {
					var o = new MobileDetect(window.navigator.userAgent, 801);
					s = !!o.tablet(), r = !!o.phone()
				}
		}
		if (this.storeDefaults(), this.parameters.minimumHeight > 0 && (this.parameters.minimumHeightRatio = this.parameters.minimumHeight / this.responsiveDimensions.startHeight), this.parameters.maximumHeight > 0 && this.parameters.maximumHeight >= this.parameters.minimumHeight && (this.parameters.maximumHeightRatio = {
					desktopPortrait: this.parameters.maximumHeight / this.responsiveDimensions.startHeight
				}, this.parameters.maximumHeightRatio.desktopLandscape = this.parameters.maximumHeightRatio.desktopPortrait, this.parameters.maximumHeightRatio.tabletPortrait = this.parameters.maximumHeightRatio.desktopPortrait, this.parameters.maximumHeightRatio.tabletLandscape = this.parameters.maximumHeightRatio.desktopPortrait,
				this.parameters.maximumHeightRatio.mobilePortrait = this.parameters.maximumHeightRatio.desktopPortrait, this.parameters.maximumHeightRatio.mobileLandscape = this.parameters.maximumHeightRatio.desktopPortrait), this.parameters.maximumSlideWidth > 0 && (this.parameters.maximumSlideWidthRatio = {
				desktopPortrait: this.parameters.maximumSlideWidth / this.responsiveDimensions.startSlideWidth,
				desktopLandscape: this.parameters.maximumSlideWidthLandscape / this.responsiveDimensions.startSlideWidth,
				tabletPortrait: this.parameters.maximumSlideWidthTablet / this.responsiveDimensions.startSlideWidth,
				tabletLandscape: this.parameters.maximumSlideWidthTabletLandscape / this.responsiveDimensions.startSlideWidth,
				mobilePortrait: this.parameters.maximumSlideWidthMobile / this.responsiveDimensions.startSlideWidth,
				mobileLandscape: this.parameters.maximumSlideWidthMobileLandscape / this.responsiveDimensions.startSlideWidth
			}, this.parameters.maximumSlideWidthConstrainHeight)) {
			this.parameters.maximumHeightRatio = e.extend({}, this.parameters.maximumSlideWidthRatio);
			for (var a in this.parameters.maximumHeightRatio) this.parameters.maximumHeightRatio[a] *= this.parameters.verticalRatioModifiers[a]
		}
		if (N2Classes.Zoom !== t && N2Classes.Zoom.add(this), this.onResize(), e(window).on("SliderContentResize", e.proxy(function (e) {
				this.invalidateResponsiveState = !0, this.onResize(e)
			}, this)), this.parameters.onResizeEnabled || "adaptive" == this.parameters.type)
			if (e(window).on({
					resize: e.proxy(this.onResize, this),
					orientationchange: e.proxy(this.onResize, this)
				}), this.sliderElement.on("SliderInternalResize", e.proxy(this.onResize, this)), window.ResizeObserver !== t) {
				var l = 0,
					h = new ResizeObserver(e.proxy(function (t) {
						t.forEach(e.proxy(function (e) {
							l !== e.contentRect.width && (l = e.contentRect.width, this.sliderElement.triggerHandler("SliderInternalResize"))
						}, this))
					}, this));
				h.observe(this.containerElement.parent().get(0))
			} else try {
				e('<iframe class="bt_skip_resize" title="Resize helper" sandbox="allow-same-origin allow-scripts" style="margin:0;padding:0;border:0;display:block;width:100%;height:0;min-height:0;max-height:0;"/>').on("load", e.proxy(function (t) {
					var i = 0,
						s = e(t.target.contentWindow ? t.target.contentWindow : t.target.contentDocument.defaultView).on("resize", e.proxy(function (e) {
							var t = s.width();
							i !== t && (i = t, this.sliderElement.triggerHandler("SliderInternalResize"))
						}, this));
					s[0].document.getElementsByTagName("HTML")[0].setAttribute("lang", window.document.getElementsByTagName("HTML")[0].getAttribute("lang"))
				}, this)).insertBefore(this.containerElement)
			} catch (d) {}
	}, i.prototype.getOuterWidth = function () {
		return this.responsiveDimensions.startSliderWidth + this.responsiveDimensions.startSliderMarginLeft + this.responsiveDimensions.startSliderMarginRight
	}, i.prototype.storeDefaults = function () {
		this.responsiveDimensions = {
			startWidth: this.sliderElement.outerWidth(!0),
			startHeight: this.sliderElement.outerHeight(!0),
			startSliderMarginhorizontal: 0,
			startSliderMarginvertical: 0
		}, this.horizontalElements = [], this.verticalElements = [], this.init(), this.margins = {
			top: this.responsiveDimensions.startSliderMarginTop,
			right: this.responsiveDimensions.startSliderMarginRight,
			bottom: this.responsiveDimensions.startSliderMarginBottom,
			left: this.responsiveDimensions.startSliderMarginLeft
		}
	}, i.prototype.addHorizontalElement = function (e, t, i, s) {
		i = i || "ratio";
		var r = new N2Classes.SmartSliderResponsiveElement(this, i, e, t, s);
		return this.horizontalElements.push(r), r
	}, i.prototype.addVerticalElement = function (e, t, i, s) {
		i = i || "ratio";
		var r = new N2Classes.SmartSliderResponsiveElement(this, i, e, t, s);
		return this.verticalElements.push(r), r
	}, i.prototype.resizeHorizontalElements = function (e) {
		for (var t = 0; t < this.horizontalElements.length; t++) {
			var i = this.horizontalElements[t];
			"undefined" == typeof e[i.ratioName] && console.log("error with " + i.ratioName), i.resize(this.responsiveDimensions, e[i.ratioName], !1, 0)
		}
		this.slider.sliderElement.triggerHandler("SliderResizeHorizontal")
	}, i.prototype.updateVerticalRatios = function (e) {
		return e
	}, i.prototype._updateVerticalRatios = function (t) {
		var i = this.responsiveDimensions.startSlideHeight * t.slideH,
			s = !1;
		return this.sliderElement.find(".n2-ss-section-main-content").addClass("n2-ss-section-main-content-calc").each(function (t, r) {
			var n = e(r).outerHeight();
			n > i && (s = !0, i = n)
		}).removeClass("n2-ss-section-main-content-calc"), s && (t.slideH = i / this.responsiveDimensions.startSlideHeight, t.h = Math.max(t.h, t.slideH)), t
	}, i.prototype.resizeVerticalElements = function (e, t, i) {
		for (var s = 0; s < this.verticalElements.length; s++) {
			var r = this.verticalElements[s];
			"undefined" == typeof e[r.ratioName] && console.log("error with " + r.ratioName), r.resize(this.responsiveDimensions, e[r.ratioName], t, i)
		}
	}, i.prototype.getDeviceMode = function () {
		return i._DeviceMode[this.deviceMode]
	}, i.prototype.getDeviceModeOrientation = function () {
		return i._DeviceMode[this.deviceMode] + i._DeviceOrientation[this.orientation]
	}, i.prototype.onResize = function (t) {
		this.slider.mainAnimation && "playing" == this.slider.mainAnimation.getState() ? this.delayedResizeAdded || (this.delayedResizeAdded = !0, this.sliderElement.on("mainAnimationComplete.responsive", e.proxy(this._onResize, this, t))) : this._onResize(t)
	}, i.prototype._onResize = function (e) {
		this.doResize(e), this.delayedResizeAdded = !1
	}, i.prototype.doNormalizedResize = function () {
		this.normalizeTimeout && clearTimeout(this.normalizeTimeout), this.normalizeTimeout = setTimeout(e.proxy(this.doResize, this), 10)
	}, i.prototype._getOrientation = function () {
		return this.orientationMode == i.OrientationMode.SCREEN ? window.orientation !== t ? 90 === Math.abs(window.orientation) ? i.DeviceOrientation.LANDSCAPE : i.DeviceOrientation.PORTRAIT : window.innerHeight <= window.innerWidth ? i.DeviceOrientation.LANDSCAPE : i.DeviceOrientation.PORTRAIT : this.orientationMode == i.OrientationMode.ADMIN_PORTRAIT ? i.DeviceOrientation.PORTRAIT : this.orientationMode == i.OrientationMode.ADMIN_LANDSCAPE ? i.DeviceOrientation.LANDSCAPE : void 0
	}, i.prototype._getDevice = function () {
		switch (this.parameters.basedOn) {
			case "combined":
				return this._getDeviceDevice(this._getDeviceScreenWidth());
			case "device":
				return this._getDeviceDevice(i.DeviceMode.DESKTOP);
			case "screen":
				return this._getDeviceScreenWidth()
		}
	}, i.prototype._getDeviceScreenWidth = function () {
		var e = window.innerWidth;
		if (this.orientation == i.DeviceOrientation.PORTRAIT) {
			if (e < this.parameters.mobilePortraitScreenWidth) return i.DeviceMode.MOBILE;
			if (e < this.parameters.tabletPortraitScreenWidth) return i.DeviceMode.TABLET
		} else {
			if (e < this.parameters.mobileLandscapeScreenWidth) return i.DeviceMode.MOBILE;
			if (e < this.parameters.tabletLandscapeScreenWidth) return i.DeviceMode.TABLET
		}
		return i.DeviceMode.DESKTOP
	}, i.prototype._getDeviceAndOrientationByScreenWidth = function () {
		var e = window.innerWidth;
		return e < this.parameters.mobilePortraitScreenWidth ? [i.DeviceMode.MOBILE, i.DeviceOrientation.PORTRAIT] : e < this.parameters.mobileLandscapeScreenWidth ? [i.DeviceMode.MOBILE, i.DeviceOrientation.LANDSCAPE] : e < this.parameters.tabletPortraitScreenWidth ? [i.DeviceMode.TABLET, i.DeviceOrientation.PORTRAIT] : e < this.parameters.tabletLandscapeScreenWidth ? [i.DeviceMode.TABLET, i.DeviceOrientation.LANDSCAPE] : e < this.parameters.desktopPortraitScreenWidth ? [i.DeviceMode.DESKTOP, i.DeviceOrientation.PORTRAIT] : [i.DeviceMode.DESKTOP, i.DeviceOrientation.LANDSCAPE]
	}, i.prototype._getDeviceDevice = function (e) {
		return r === !0 ? i.DeviceMode.MOBILE : s && e != i.DeviceMode.MOBILE ? i.DeviceMode.TABLET : e
	}, i.prototype._getDeviceZoom = function (e) {
		var t;
		this.orientationMode == i.OrientationMode.ADMIN_PORTRAIT ? t = i.DeviceOrientation.PORTRAIT : this.orientationMode == i.OrientationMode.ADMIN_LANDSCAPE && (t = i.DeviceOrientation.LANDSCAPE);
		var s = i.DeviceMode.DESKTOP;
		return e - this.parameters.ratioToDevice[i._DeviceOrientation[t]].mobile < .001 ? s = i.DeviceMode.MOBILE : e - this.parameters.ratioToDevice[i._DeviceOrientation[t]].tablet < .001 && (s = i.DeviceMode.TABLET), s
	}, i.prototype.updateOffsets = function () {
		if (this.focusOffsetTop = 0, "" !== this.parameters.focus.offsetTop)
			for (var t = e(this.parameters.focus.offsetTop), i = 0; i < t.length; i++) this.focusOffsetTop += t.eq(i).outerHeight();
		if (this.focusOffsetBottom = 0, "" !== this.parameters.focus.offsetBottom)
			for (var s = e(this.parameters.focus.offsetBottom), i = 0; i < s.length; i++) this.focusOffsetBottom += s.eq(i).outerHeight()
	}, i.prototype.doPixelSnapping = function () {
		var e = this.containerElementPadding[0].getBoundingClientRect().left + this.pixelSnappingFraction,
			t = Math.max(0, e % 1);
		t !== this.pixelSnappingFraction && (this.containerElementPadding.css({
			marginLeft: -t + "px",
			marginRight: -t + "px"
		}), this.pixelSnappingFraction = t)
	}, i.prototype.doResize = function (t, s, r, n) {
		if (this.doPixelSnapping(), this.updateOffsets(), this.disableTransitions || (this.disableTransitions = !0, this.sliderElement.addClass("n2notransition"), this.disableTransitionsTimeout && clearTimeout(this.disableTransitionsTimeout), this.disableTransitionsTimeout = setTimeout(e.proxy(function () {
				this.sliderElement.removeClass("n2notransition"), this.disableTransitions = !1
			}, this), 500)), !this.containerElementPadding.is(":visible")) return !1;
		this.refreshMargin();
		var o;
		if ("center" === this.slider.parameters.align && ("fullpage" === this.parameters.type ? this.alignElement.css("maxWidth", "none") : (o = this.responsiveDimensions.startWidth, this.staticSizes && (o += this.staticSizes.paddingLeft + this.staticSizes.paddingRight), this.alignElement.css("maxWidth", o))), !this.slider.isAdmin && this.parameters.forceFull) {
			"none" !== this.parameters.forceFullOverflowX && e(this.parameters.forceFullOverflowX).css("overflow-x", "hidden");
			var a = 0,
				l = 0;
			if ("" !== this.parameters.forceFullHorizontalSelector) {
				var h = this.sliderElement.closest(this.parameters.forceFullHorizontalSelector);
				h && h.length > 0 && (a = h.width(), l = h.offset().left)
			}
			var d, p = a > 0 ? a : document.body.clientWidth || document.documentElement.clientWidth,
				c = this.containerElement.parent(),
				u = c.offset().left;
			d = n2const.rtl.isRtl ? p - (u + c.outerWidth()) : u, this.containerElement.css(n2const.rtl.marginLeft, -d - parseInt(c.css("paddingLeft")) - parseInt(c.css("borderLeftWidth")) + l).width(p)
		}
		var m = this.containerElementPadding.width() / this.getOuterWidth(),
			f = !1,
			y = this.orientation,
			g = this.deviceMode,
			v = null,
			S = null;
		if (this.orientationMode === i.OrientationMode.SCREEN_WIDTH_ONLY) {
			var b = this._getDeviceAndOrientationByScreenWidth();
			S = b[0], v = b[1]
		} else v = this._getOrientation();
		if (this.orientation !== v && (this.orientation = v, f = !0, this.sliderElement.trigger("SliderOrientation", {
				lastOrientation: i._DeviceOrientation[y],
				orientation: i._DeviceOrientation[v]
			})), this.orientationMode !== i.OrientationMode.SCREEN_WIDTH_ONLY && (S = this._getDevice(m)), this.deviceMode !== S && (this.deviceMode = S, this.sliderElement.removeClass("n2-ss-" + i._DeviceMode[g]).addClass("n2-ss-" + i._DeviceMode[S]), this.sliderElement.trigger("SliderDevice", {
				lastDevice: i._DeviceMode[g],
				device: i._DeviceMode[S]
			}), f = !0), !this.slider.isAdmin && "fullpage" === this.parameters.type) {
			var w = 0;
			if ("100vh" === this.parameters.sliderHeightBasedOn) w = window.n2ClientHeight || this.$viewportHeight.height();
			else if (window.matchMedia && /Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent || navigator.vendor || window.opera)) {
				var x, C = !1;
				t && "orientationchange" === t.type && (C = !0), x = n2const.isIOS ? document.documentElement.clientHeight : window.innerHeight, window.matchMedia("(orientation: landscape)").matches ? (w = Math.min(screen.width, x), 90 != this.lastOrientation && (C = !0, this.lastOrientation = 90)) : (w = Math.min(screen.height, x), 0 != this.lastOrientation && (C = !0, this.lastOrientation = 0)), w = window.n2ClientHeight || w;
				var D = e.now(),
					E = 100;
				/SamsungBrowser/i.test(navigator.userAgent) && (E = 150), !C && Math.abs(w - this.lastClientHeight) < E && D - this.lastClientHeightTime > 400 ? w = this.lastClientHeight : (this.lastClientHeight = w, this.lastClientHeightTime = D)
			} else w = window.n2ClientHeight || document.documentElement.clientHeight || document.body.clientHeight;
			n2const.isBot && (w = Math.min(w, document.documentElement.clientWidth || document.body.clientWidth)), this.parameters.maximumHeightRatio[this.getDeviceModeOrientation()] = this.parameters.minimumHeightRatio = (w - this.getVerticalOffsetHeight()) / this.responsiveDimensions.startHeight
		}
		if (f) {
			this.invalidateResponsiveState = !0;
			var A = this._normalizeMode(i._DeviceMode[g], i._DeviceOrientation[y]),
				k = this._normalizeMode(i._DeviceMode[this.deviceMode], i._DeviceOrientation[this.orientation]);
			A[0] === k[0] && A[1] === k[1] || (this.normalizedMode = k[0] + k[1], this.sliderElement.trigger("SliderDeviceOrientation", {
				lastDevice: A[0],
				lastOrientation: A[1],
				device: k[0],
				orientation: k[1]
			}))
		}
		var T = this.parameters.sliderWidthToDevice[this.normalizedMode] / this.parameters.sliderWidthToDevice.desktopPortrait;
		!this.parameters.downscale && T > m ? m = T : !this.parameters.upscale && m > T && (m = T), this._doResize(m, s, r, n), "center" === this.slider.parameters.align && (o = this.responsiveDimensions.slider.width, this.staticSizes && (o += this.staticSizes.paddingLeft + this.staticSizes.paddingRight), this.responsiveDimensions && (o += this.responsiveDimensions.startSliderMarginhorizontal), this.alignElement.css("maxWidth", o))
	}, i.prototype._normalizeMode = function (e, t) {
		return this.parameters.normalizedDeviceModes[e + t]
	}, i.prototype.getNormalizedModeString = function () {
		var e = this._normalizeMode(i._DeviceMode[this.deviceMode], i._DeviceOrientation[this.orientation]);
		return e.join("")
	}, i.prototype.getModeString = function () {
		return i._DeviceMode[this.deviceMode] + i._DeviceOrientation[this.orientation]
	}, i.prototype.enabled = function (e, t) {
		return this.parameters.deviceModes[e + t]
	}, i.prototype._doResize = function (t, i, s, r) {
		var n = {
			ratio: t,
			w: t,
			h: t,
			slideW: t,
			slideH: t,
			fontRatio: 1
		};
		this._buildRatios(n, this.slider.parameters.dynamicHeight, s), n.fontRatio = n.slideW;
		var o = !1;
		for (var a in n)
			if (n[a] != this.lastRawRatios[a]) {
				o = !0;
				break
			}(this.invalidateResponsiveState || o) && (this.lastRawRatios = e.extend({}, n), this.resizeHorizontalElements(n), this.finishResize(n, i, r))
	}, i.prototype.finishResize = function (t, i, s) {
		this.loadDeferred.done(e.proxy(function () {
			var r = e.proxy(function () {
				this.finishResize = this._finishResize, this.finishResize(t, i, s)
			}, this);
			/OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor) || /CriOS/.exec(window.navigator.userAgent) ? setTimeout(r, 200) : r()
		}, this)), this.invalidateResponsiveState = !1
	}, i.prototype._finishResize = function (e, t, i) {
		this.invalidateResponsiveState = !1, e = this.updateVerticalRatios(e), this.resizeVerticalElements(e, t, i), this.lastRatios = e, t ? (this.sliderElement.trigger("SliderAnimatedResize", [e, t, i]), t.eventCallback("onComplete", function () {
			this.triggerResize(e, t)
		}, [], this)) : this.triggerResize(e, !1)
	}, i.prototype.doVerticalResize = function () {
		var t = this.updateVerticalRatios(e.extend({}, this.lastRawRatios)),
			i = !1;
		for (var s in t)
			if (t[s] != this.lastRatios[s]) {
				i = !0;
				break
			} i && this.finishVerticalResize(t)
	}, i.prototype.finishVerticalResize = function (t) {
		this.loadDeferred.done(e.proxy(function () {
			this.finishVerticalResize = this._finishVerticalResize, this.finishVerticalResize(t)
		}, this))
	}, i.prototype._finishVerticalResize = function (e) {
		this.resizeVerticalElements(e, !1, 0), this.lastRatios = e, this.triggerResize(e, !1)
	}, i.prototype.triggerResize = function (e, t) {
		this.sliderElement.trigger("SliderResize", [e, this, t])
	}, i.prototype._buildRatios = function (e, i, s) {
		var r = this.getDeviceModeOrientation();
		this.parameters.maximumSlideWidthRatio[r] > 0 && e.slideW > this.parameters.maximumSlideWidthRatio[r] && (e.slideW = this.parameters.maximumSlideWidthRatio[r]), e.slideW = e.slideH = Math.min(e.slideW, e.slideH);
		var n = this.parameters.verticalRatioModifiers[r];
		if (e.slideH *= n, "fullpage" === this.parameters.type) e.h *= n, this.parameters.minimumHeightRatio > 0 && (e.h = Math.max(e.h, this.parameters.minimumHeightRatio)), this.parameters.maximumHeightRatio[r] > 0 && (e.h = Math.min(e.h, this.parameters.maximumHeightRatio[r])), this.slider.isAdmin ? this.parameters.constrainRatio ? (e.slideH = Math.min(e.slideH, e.h), e.slideH = e.slideW = Math.min(e.slideW, e.slideH)) : (e.w = e.slideW, e.h = e.slideH) : this.parameters.constrainRatio ? (e.slideH = Math.min(e.slideH, e.h), e.slideH = e.slideW = Math.min(e.slideW, e.slideH)) : (e.slideW = e.w, this.parameters.maximumSlideWidthRatio[r] > 0 && e.slideW > this.parameters.maximumSlideWidthRatio[r] && (e.slideW = this.parameters.maximumSlideWidthRatio[r]), e.slideH = e.h);
		else if (e.h *= n, this.parameters.minimumHeightRatio > 0 && (e.h = Math.max(e.h, this.parameters.minimumHeightRatio)), this.parameters.maximumHeightRatio[r] > 0 && (e.h = Math.min(e.h, this.parameters.maximumHeightRatio[r])), e.slideH = Math.min(e.slideH, e.h), e.slideW = e.slideH / n, "showcase" === this.slider.type && (e.slideW = Math.min(e.slideW, e.w), e.slideH = Math.min(e.slideW, e.slideH)), i) {
			var o;
			if (s !== t && s.background.elements.image !== t ? o = s.background.elements.image : this.slider.currentSlide.background.elements.image !== t && (o = this.slider.currentSlide.background.elements.image), o !== t && o.width > 0 && o.height > 0) {
				var a = this.responsiveDimensions.startSlideWidth / o.width * (o.height / this.responsiveDimensions.startSlideHeight);
				a > 0 && (e.slideH *= a, e.h *= a)
			}
		}
		this.sliderElement.triggerHandler("responsiveBuildRatios", [e])
	}, i.prototype.getVerticalOffsetHeight = function () {
		if (this.isFullScreen) return 0;
		var e = this.focusOffsetTop + this.focusOffsetBottom;
		if (this.slider.widgets.$vertical)
			for (var t = 0; t < this.slider.widgets.$vertical.length; t++) e += this.slider.widgets.$vertical.eq(t).outerHeight();
		return e + this.parameters.decreaseSliderHeight
	}, i.prototype.addMargin = function (e, t) {
		this.widgetMargins[e].push(t), t.isVisible() && (this._addMarginSize(e, t.getSize()), this.enabledWidgetMargins.push(t)), this.doNormalizedResize()
	}, i.prototype.addStaticMargin = function (e, t) {
		"Bottom" != e && "Top" != e && (this.widgetStaticMargins || (this.widgetStaticMargins = {
			Top: [],
			Right: [],
			Bottom: [],
			Left: []
		}), this.widgetStaticMargins[e].push(t), this.doNormalizedResize())
	}, i.prototype.refreshMargin = function () {
		for (var t in this.widgetMargins)
			for (var i = this.widgetMargins[t], s = i.length - 1; s >= 0; s--) {
				var r = i[s];
				if (r.isVisible()) - 1 == e.inArray(r, this.enabledWidgetMargins) && (this._addMarginSize(t, r.getSize()), this.enabledWidgetMargins.push(r));
				else {
					var n = e.inArray(r, this.enabledWidgetMargins); - 1 != n && (this._addMarginSize(t, -r.getSize()), this.enabledWidgetMargins.splice(n, 1))
				}
			}
		this.refreshStaticSizes()
	}, i.prototype.refreshStaticSizes = function () {
		if (this.widgetStaticMargins) {
			var e = {
				paddingTop: 0,
				paddingRight: 0,
				paddingBottom: 0,
				paddingLeft: 0
			};
			for (var t in this.widgetStaticMargins)
				for (var i = this.widgetStaticMargins[t], s = i.length - 1; s >= 0; s--) {
					var r = i[s];
					r.isVisible() && (e["padding" + t] += r.getSize())
				}
			for (var n in e) this.containerElementPadding.css(e);
			this.staticSizes = e
		}
	}, i.prototype._addMarginSize = function (e, t) {
		var i = null;
		switch (e) {
			case "Top":
			case "Bottom":
				i = this._sliderVertical;
				break;
			default:
				i = this._sliderHorizontal
		}
		i.data["margin" + e] += t, this.responsiveDimensions["startSliderMargin" + e] += t
	}, i
}), N2D("SmartSliderResponsiveElement", function (e, t) {
	function i(t, i, s, r, n) {
		this._lastRatio = 1, this.responsive = t, this.ratioName = i, this.element = s, this._readyDeferred = e.Deferred(), "undefined" != typeof n ? this.name = n : this.name = null, this.data = {}, this.helper = {
			parent: null,
			parentProps: null,
			fontSize: !1,
			centered: !1
		}, this._lateInit(r)
	}
	return i.prototype._lateInit = function (t) {
		this._cssProperties = t, this.reloadDefault(), -1 != e.inArray("fontSize", t) && (this.data.fontSize = this.element.data("fontsize"), this.helper.fontSize = {
			fontSize: this.element.data("fontsize"),
			desktopPortrait: this.element.data("minfontsizedesktopportrait"),
			desktopLandscape: this.element.data("minfontsizedesktoplandscape"),
			tabletPortrait: this.element.data("minfontsizetabletportrait"),
			tabletLandscape: this.element.data("minfontsizetabletlandscape"),
			mobilePortrait: this.element.data("minfontsizemobileportrait"),
			mobileLandscape: this.element.data("minfontsizemobilelandscape")
		}, this.responsive.sliderElement.on("SliderDeviceOrientation", e.proxy(this.onModeChange, this))), this.resize = this._resize, this._readyDeferred.resolve()
	}, i.prototype.reloadDefault = function () {
		for (var e = 0; e < this._cssProperties.length; e++) {
			var t = this._cssProperties[e];
			this.data[t] = parseInt(this.element.css(t))
		}
		if (this.name) {
			var i = this.responsive.responsiveDimensions;
			for (var s in this.data) i["start" + N2Classes.StringHelper.capitalize(this.name) + N2Classes.StringHelper.capitalize(s)] = this.data[s]
		}
	}, i.prototype.ready = function (e) {
		this._readyDeferred.done(e)
	}, i.prototype.resize = function (t, i) {
		this.ready(e.proxy(this.resize, this, t, i)), this._lastRatio = i
	}, i.prototype._resize = function (e, t, i, s) {
		this.name && "undefined" == typeof e[this.name] && (e[this.name] = {});
		var r = {};
		for (var n in this.data) {
			var o = this.data[n] * t;
			"function" == typeof this[n + "Prepare"] && (o = this[n + "Prepare"](o)), this.name && (e[this.name][n] = o), r[n] = o
		}
		if (i) i.to(this.element, s, r, 0);
		else if (this.element.css(r), this.helper.centered) {
			var a = this.getVerticalMargin(parseInt((this.helper.parent.height() - this.element.height()) / 2)),
				l = this.getHorizontalMargin(parseInt((this.helper.parent.width() - this.element.width()) / 2));
			this.element.css({
				marginLeft: l,
				marginRight: l,
				marginTop: a,
				marginBottom: a
			})
		}
		this._lastRatio = t
	}, i.prototype.getHorizontalMargin = function (e) {
		return e
	}, i.prototype.getVerticalMargin = function (e) {
		return e
	}, i.prototype._refreshResize = function () {
		this.responsive.ready.done(e.proxy(function () {
			this._resize(this.responsive.responsiveDimensions, this.responsive.lastRatios[this.ratioName])
		}, this))
	}, i.prototype.widthPrepare = function (e) {
		return Math.round(e)
	}, i.prototype.heightPrepare = function (e) {
		return Math.round(e)
	}, i.prototype.marginLeftPrepare = function (e) {
		return parseInt(e)
	}, i.prototype.marginRightPrepare = function (e) {
		return parseInt(e)
	}, i.prototype.lineHeightPrepare = function (e) {
		return e + "px"
	}, i.prototype.borderLeftWidthPrepare = function (e) {
		return parseInt(e)
	}, i.prototype.borderRightWidthPrepare = function (e) {
		return parseInt(e)
	}, i.prototype.borderTopWidthPrepare = function (e) {
		return parseInt(e)
	}, i.prototype.borderBottomWidthPrepare = function (e) {
		return parseInt(e)
	}, i.prototype.fontSizePrepare = function (e) {
		var t = this.responsive.getNormalizedModeString();
		return e < this.helper.fontSize[t] && (e = this.helper.fontSize[t]), N2Classes.FontSize.toRem(e)
	}, i.prototype.setCentered = function () {
		this.helper.parent = this.element.parent(), this.helper.centered = !0
	}, i.prototype.unsetCentered = function () {
		this.helper.centered = !1
	}, i.prototype.onModeChange = function () {
		this.setFontSizeByMode()
	}, i.prototype.setFontSizeByMode = function () {
		this.element.css("fontSize", this.fontSizePrepare(this.data.fontSize * this._lastRatio))
	}, i
}), N2D("FrontendItemVimeo", function (e, t) {
	function i(t, i, s, r, n, o) {
		this.state = {
			scroll: !1,
			slide: !1,
			play: !1,
			continuePlay: !1
		}, this.readyDeferred = e.Deferred(), this.slider = t, this.playerId = i, this.$playerElement = e("#" + this.playerId), this.$cover = this.$playerElement.find(".n2-ss-layer-player-cover"), this.start = o, this.parameters = e.extend({
			vimeourl: "//vimeo.com/144598279",
			autoplay: "0",
			reset: "0",
			title: "1",
			byline: "1",
			portrait: "0",
			loop: "0",
			color: "00adef",
			volume: "-1"
		}, r), navigator.userAgent.toLowerCase().indexOf("android") > -1 && (this.parameters.autoplay = 0), 1 === parseInt(this.parameters.autoplay) || !n || n2const.isMobile ? this.ready(e.proxy(this.initVimeoPlayer, this)) : this.ready(e.proxy(function () {
			this.$playerElement.on("click.vimeo n2click.vimeo", e.proxy(function (e) {
				this.$playerElement.off(".vimeo"), e.preventDefault(), e.stopPropagation(), this.initVimeoPlayer(), this.safePlay()
			}, this))
		}, this))
	}
	return i.vimeoDeferred = null, i.prototype.ready = function (t) {
		null === i.vimeoDeferred && (i.vimeoDeferred = e.getScript("https://player.vimeo.com/api/player.js")), i.vimeoDeferred.done(t)
	}, i.prototype.initVimeoPlayer = function () {
		var t = e('<iframe allow="autoplay; encrypted-media" id="' + this.playerId + '-frame" src="https://player.vimeo.com/video/' + this.parameters.vimeocode + "?autoplay=0&_video&title=" + this.parameters.title + "&byline=" + this.parameters.byline + "&background=" + this.parameters.background + "&portrait=" + this.parameters.portrait + "&color=" + this.parameters.color + "&loop=" + this.parameters.loop + ("-1" == this.parameters.quality ? "" : "&quality=" + this.parameters.quality) + '" style="position: absolute; top:0; left: 0; width: 100%; height: 100%;" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
		this.$playerElement.prepend(t), this.isStatic = t.closest(".n2-ss-static-slide").length, this.player = new Vimeo.Player(t[0], {
			autoplay: !0
		}), this.promise = this.player.ready(), this.promise.then(e.proxy(this.onReady, this))
	}, i.prototype.onReady = function () {
		var t = parseFloat(this.parameters.volume);
		t >= 0 && this.setVolume(t), this.slide = this.slider.findSlideByElement(this.$playerElement);
		var i = this.$playerElement.closest(".n2-ss-layer");
		this.$cover.length && (n2const.isMobile && this.$cover.css("pointer-events", "none"), i.one("n2play", e.proxy(function () {
			NextendTween.to(this.$cover, .3, {
				opacity: 0,
				onComplete: e.proxy(function () {
					this.$cover.remove()
				}, this)
			})
		}, this))), this.player.on("play", e.proxy(function () {
			this.isStatic || this.slider.sliderElement.trigger("mediaStarted", this.playerId), i.triggerHandler("n2play")
		}, this)), this.player.on("pause", e.proxy(function () {
			i.triggerHandler("n2pause"), this.state.continuePlay ? (this.setState("continuePlay", !1), this.setState("play", !0)) : this.setState("play", !1)
		}, this)), this.player.on("ended", e.proxy(function () {
			this.isStatic || this.slider.sliderElement.trigger("mediaEnded", this.playerId), i.triggerHandler("n2stop"), this.setState("play", !1)
		}, this)), this.isStatic || this.slider.sliderElement.on("mainAnimationStart", e.proxy(function (t, i, s, r, n) {
			-1 == e.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.slides[r])) ? (parseInt(this.parameters.reset) && this.reset(), this.setState("slide", !1, !0)) : this.setState("slide", !0, !0)
		}, this)), "" !== this.parameters["scroll-pause"] ? N2Classes.ScrollTracker.add(this.$playerElement, this.parameters["scroll-pause"], e.proxy(function () {
			this.setState("scroll", !0, !0)
		}, this), e.proxy(function () {
			this.setState("continuePlay", !0), this.setState("scroll", !1, !0)
		}, this)) : this.setState("scroll", !0, !0), (this.isStatic || -1 !== e.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.currentSlide))) && this.setState("slide", !0, !0), 1 === parseInt(this.parameters.autoplay) && this.slider.visible(e.proxy(this.initAutoplay, this)), this.readyDeferred.resolve()
	}, i.prototype.initAutoplay = function () {
		this.isStatic ? (this.setState("play", !0), this.setState("slide", !0, !0)) : (this.slider.sliderElement.on("mainAnimationComplete", e.proxy(function (t, i, s, r, n) {
			e.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.slides[r])) >= 0 ? (this.setState("play", !0), this.setState("slide", !0, !0)) : this.setState("slide", !1, !0)
		}, this)), e.inArray(this.slide, this.slider.getActiveSlidesCompat()) >= 0 && (this.setState("play", !0), this.setState("slide", !0, !0)))
	}, i.prototype.setState = function (e, t, i) {
		i = i || !1, this.state[e] = t, i && (this.state.play && this.state.slide && this.state.scroll ? this.play() : this.pause())
	}, i.prototype.play = function () {
		this.slider.sliderElement.trigger("mediaStarted", this.playerId), 0 != this.start && this.safeSetCurrentTime(this.start), this.safePlay(), this.player.getCurrentTime().then(e.proxy(function (e) {
			e < this.start && 0 != this.start && this.safeSetCurrentTime(this.start), this.safePlay()
		}, this))["catch"](e.proxy(function (e) {
			this.safePlay()
		}, this))
	}, i.prototype.pause = function () {
		this.safePause()
	}, i.prototype.reset = function () {
		this.safeSetCurrentTime(this.start)
	}, i.prototype.setVolume = function (t) {
		this.safeCallback(e.proxy(function () {
			this.promise = this.player.setVolume(t)
		}, this))
	}, i.prototype.safeSetCurrentTime = function (t) {
		this.safeCallback(e.proxy(function () {
			this.promise = this.player.setCurrentTime(t)
		}, this))
	}, i.prototype.safePlay = function () {
		this.safeCallback(e.proxy(function () {
			this.promise = this.player.getPaused(), this.safeCallback(e.proxy(function (e) {
				e && (this.promise = this.player.play())
			}, this))
		}, this))
	}, i.prototype.safePause = function () {
		this.safeCallback(e.proxy(function () {
			this.promise = this.player.getPaused(), this.safeCallback(e.proxy(function (e) {
				e || (this.promise = this.player.pause())
			}, this))
		}, this))
	}, i.prototype.safeCallback = function (e) {
		this.promise && Promise !== t ? this.promise.then(e)["catch"](e) : e()
	}, i
}), N2D("FrontendItemYouTube", function (e, t) {
	function i(t, i, s, r) {
		this.state = {
			scroll: !1,
			slide: !1,
			InComplete: !1,
			play: !1,
			continuePlay: !1
		}, this.readyDeferred = e.Deferred(), this.slider = t, this.playerId = i, this.$playerElement = e("#" + this.playerId), this.$cover = this.$playerElement.find(".n2-ss-layer-player-cover"), this.parameters = e.extend({
			youtubeurl: "//www.youtube.com/watch?v=MKmIwHAFjSU",
			youtubecode: "MKmIwHAFjSU",
			center: 0,
			autoplay: "1",
			related: "1",
			volume: "-1",
			loop: 0,
			modestbranding: 1,
			reset: 0,
			query: [],
			playsinline: 0
		}, s), 1 === parseInt(this.parameters.autoplay) || !r || n2const.isMobile ? this.ready(e.proxy(this.initYoutubePlayer, this)) : this.$playerElement.on("click.youtube n2click.youtube", e.proxy(function (t) {
			this.$playerElement.off(".youtube"), t.preventDefault(), t.stopPropagation(), this.ready(e.proxy(function () {
				this.readyDeferred.done(e.proxy(function () {
					this.play()
				}, this)), this.initYoutubePlayer()
			}, this))
		}, this))
	}
	return i.YTDeferred = null, i.prototype.ready = function (s) {
		null === i.YTDeferred && (i.YTDeferred = e.Deferred(), window.YT === t && e.getScript("https://www.youtube.com/iframe_api"), window._EPYT_ !== t ? ! function (e) {
			var t = function () {
				window._EPADashboard_.initStarted === !0 ? e.resolve() : setTimeout(t, 100)
			};
			t()
		}(i.YTDeferred) : ! function (e) {
			var i = function () {
				window.YT !== t && window.YT.loaded ? e.resolve() : setTimeout(i, 100)
			};
			i()
		}(i.YTDeferred)), i.YTDeferred.done(s)
	}, i.prototype.fadeOutCover = function () {
		this.coverFadedOut === t && this.$cover.length && (this.coverFadedOut = !0, NextendTween.to(this.$cover, .3, {
			opacity: 0,
			onComplete: e.proxy(function () {
				this.$cover.remove()
			}, this)
		}))
	}, i.prototype.initYoutubePlayer = function () {
		var t = this.$playerElement.closest(".n2-ss-layer");
		this.layer = t.data("layer"), this.$cover.length && (n2const.isMobile && this.$cover.css("pointer-events", "none"), t.one("n2play", e.proxy(this.fadeOutCover, this))), this.isStatic = this.$playerElement.closest(".n2-ss-static-slide").length;
		var i = {
			enablejsapi: 1,
			origin: window.location.protocol + "//" + window.location.host,
			wmode: "opaque",
			rel: 1 - this.parameters.related,
			start: this.parameters.start,
			end: this.parameters.end,
			modestbranding: this.parameters.modestbranding,
			playsinline: this.parameters.playsinline
		};
		if (1 === parseInt(this.parameters.autoplay))
			if (navigator.userAgent.toLowerCase().indexOf("android") > -1) this.parameters.volume = 0;
			else if (n2const.isIOS) {
			this.parameters.autoplay = 0;
			try {
				"playsInline" in document.createElement("video") && (this.parameters.autoplay = 1, this.parameters.volume = 0, i.playsinline = 1)
			} catch (s) {}
		}
		n2const.isIOS && this.parameters.controls && (i.use_native_controls = 1), 1 == this.parameters.center && (i.controls = 0), 1 != this.parameters.controls && (i.autohide = 1, i.controls = 0), +(navigator.platform.toUpperCase().indexOf("MAC") >= 0 && navigator.userAgent.search("Firefox") > -1) && (i.html5 = 1);
		for (var r in this.parameters.query) this.parameters.query.hasOwnProperty(r) && (i[r] = this.parameters.query[r]);
		var n = {
			videoId: this.parameters.youtubecode,
			wmode: "opaque",
			playerVars: i,
			events: {
				onReady: e.proxy(this.onReady, this),
				onStateChange: e.proxy(function (i) {
					switch (i.data) {
						case YT.PlayerState.PLAYING:
						case YT.PlayerState.BUFFERING:
							this.isStatic || -1 !== e.inArray(this.slide, this.slider.getVisibleSlides(this.slider.currentSlide)) && this.slider.sliderElement.trigger("mediaStarted", this.playerId), t.triggerHandler("n2play");
							break;
						case YT.PlayerState.PAUSED:
							t.triggerHandler("n2pause"), this.state.continuePlay ? (this.setState("continuePlay", !1), this.setState("play", !0)) : this.setState("play", !1);
							break;
						case YT.PlayerState.ENDED:
							1 == this.parameters.loop ? (this.player.seekTo(this.parameters.start), this.player.playVideo()) : (this.isStatic || this.slider.sliderElement.trigger("mediaEnded", this.playerId), t.triggerHandler("n2stop"), this.setState("play", !1))
					}
				}, this)
			}
		};
		(this.parameters["privacy-enhanced"] || jQuery && jQuery.fn.revolution) && (n.host = "https://www.youtube-nocookie.com"), this.player = new YT.Player(this.playerId + "-frame", n), this.slide = this.slider.findSlideByElement(this.$playerElement), 1 == this.parameters.center && (this.$playerElement.parent().css("overflow", "hidden"), this.onResize(), this.slider.sliderElement.on("SliderResize", e.proxy(this.onResize, this)))
	}, i.prototype.onReady = function () {
		var t = parseFloat(this.parameters.volume);
		t > 0 ? this.setVolume(t) : -1 !== t && this.player.mute(), (this.isStatic || -1 !== e.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.currentSlide))) && this.setState("slide", !0, !0), 1 == this.parameters.autoplay && this.slider.visible(e.proxy(this.initAutoplay, this)), this.isStatic || (this.slider.sliderElement.on("mainAnimationStart", e.proxy(function (t, i, s, r) {
			-1 == e.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.slides[r])) ? this.setState("slide", !1, !0) : this.setState("slide", !0, !0)
		}, this)), parseInt(this.parameters.reset) && this.slider.sliderElement.on("mainAnimationComplete", e.proxy(function (t, i, s, r) {
			-1 == e.inArray(this.slide, this.slider.getVisibleSlides(this.slider.slides[r])) && 0 !== this.player.getCurrentTime() && this.player.seekTo(this.parameters.start)
		}, this))), this.readyDeferred.resolve(), "" !== this.parameters["scroll-pause"] ? N2Classes.ScrollTracker.add(this.$playerElement, this.parameters["scroll-pause"], e.proxy(function () {
			this.setState("scroll", !0, !0)
		}, this), e.proxy(function () {
			this.setState("continuePlay", !0), this.setState("scroll", !1, !0)
		}, this)) : this.setState("scroll", !0, !0)
	}, i.prototype.onResize = function () {
		var e = 100,
			t = this.$playerElement.parent(),
			i = t.width(),
			s = t.height() + e,
			r = 16 / 9,
			n = {
				width: i,
				height: s,
				marginTop: 0
			};
		n[n2const.rtl.marginLeft] = 0, i / s > r ? (n.height = i * r, n.marginTop = (s - n.height) / 2) : (n.width = s * r, n[n2const.rtl.marginLeft] = (i - n.width) / 2), this.$playerElement.css(n)
	}, i.prototype.initAutoplay = function () {
		this.setState("InComplete", !0, !0), this.isStatic ? (this.setState("play", !0), this.setState("slide", !0, !0)) : (this.slider.sliderElement.on("mainAnimationComplete", e.proxy(function (t, i, s, r) {
			e.inArray(this.slide, this.slider.getActiveSlidesCompat(this.slider.slides[r])) >= 0 ? (this.setState("play", !0), this.setState("slide", !0, !0)) : this.setState("slide", !1, !0)
		}, this)), e.inArray(this.slide, this.slider.getActiveSlidesCompat()) >= 0 && (this.setState("play", !0), this.setState("slide", !0, !0)))
	}, i.prototype.setState = function (e, t, i) {
		i = i || !1, this.state[e] = t, i && (this.state.play && this.state.slide && this.state.InComplete && this.state.scroll ? this.play() : this.pause())
	}, i.prototype.play = function () {
		this.isStopped() && (this.coverFadedOut === t && setTimeout(e.proxy(this.fadeOutCover, this), 200), this.slider.sliderElement.trigger("mediaStarted", this.playerId), this.player.playVideo())
	}, i.prototype.pause = function () {
		this.isStopped() || this.player.pauseVideo()
	}, i.prototype.stop = function () {
		this.player.stopVideo()
	}, i.prototype.isStopped = function () {
		var e = this.player.getPlayerState();
		switch (e) {
			case -1:
			case 2:
			case 5:
				return !0;
			default:
				return !1
		}
	}, i.prototype.setVolume = function (e) {
		this.player.setVolume(100 * e)
	}, i
}), N2D("smartslider-frontend");