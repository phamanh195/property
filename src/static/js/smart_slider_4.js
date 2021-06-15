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
}).call(window), N2D("SmartSliderMainAnimationSimple", ["SmartSliderMainAnimationAbstract"], function (e, i) {
	function t(i, t) {
		switch (this.postBackgroundAnimation = !1, this._currentBackgroundAnimation = !1, this.reverseSlideIndex = null, t = e.extend({
			delay: 0,
			parallax: 0,
			type: "horizontal",
			shiftedBackgroundAnimation: "auto"
		}, t), t.delay /= 1e3, N2Classes.SmartSliderMainAnimationAbstract.prototype.constructor.apply(this, arguments), this.parameters.type) {
			case "no":
				this.animation = this._mainAnimationNo, this.isNoAnimation = !0;
				break;
			case "fade":
				this.animation = this._mainAnimationFade;
				break;
			case "crossfade":
				this.animation = this._mainAnimationCrossFade;
				break;
			case "vertical":
				i.backgrounds.hasFixed ? this.animation = this._mainAnimationFade : 0 === this.parameters.parallax ? this.animation = this._mainAnimationVertical : this.animation = this._mainAnimationVerticalParallax;
				break;
			case "vertical-reversed":
				i.backgrounds.hasFixed ? this.animation = this._mainAnimationFade : 0 === this.parameters.parallax ? this.animation = this._mainAnimationVerticalReversed : this.animation = this._mainAnimationVerticalReversedParallax;
				break;
			case "horizontal-reversed":
				0 === this.parameters.parallax ? this.animation = this._mainAnimationHorizontalReversed : this.animation = this._mainAnimationHorizontalReversedParallax;
				break;
			default:
				0 === this.parameters.parallax ? this.animation = this._mainAnimationHorizontal : this.animation = this._mainAnimationHorizontalParallax
		}
	}
	return t.prototype = Object.create(N2Classes.SmartSliderMainAnimationAbstract.prototype), t.prototype.constructor = t, t.prototype.setToStarterSlide = function (e) {
		this.setActiveSlide(e)
	}, t.prototype.changeTo = function (e, i, t, n) {
		this.postBackgroundAnimation && this.postBackgroundAnimation.prepareToSwitchSlide(e, i), N2Classes.SmartSliderMainAnimationAbstract.prototype.changeTo.apply(this, arguments)
	}, t.prototype.setActiveSlide = function (e) {
		for (var i = 0; i < this.slider.slides.length; i++) this.slider.slides[i] !== e && this._hideSlide(this.slider.slides[i])
	}, t.prototype._hideSlide = function (e) {
		NextendTween.set(e.$element, {
			x: -1e5 * n2const.rtl.modifier
		}), e.background && NextendTween.set(e.background.element, {
			x: -1e5 * n2const.rtl.modifier
		})
	}, t.prototype._showSlide = function (e) {
		NextendTween.set(e.$element.get(0), {
			x: 0
		}), e.background && NextendTween.set(e.background.element, {
			x: 0
		})
	}, t.prototype.cleanSlideIndex = function (e) {
		this._hideSlide(this.slider.slides[e])
	}, t.prototype.revertTo = function (e, i) {
		this.slider.slides[i].$element.css("zIndex", ""), this._hideSlide(this.slider.slides[i]), N2Classes.SmartSliderMainAnimationAbstract.prototype.revertTo.apply(this, arguments)
	}, t.prototype._initAnimation = function (e, i, t) {
		this.animation(e, i, t)
	}, t.prototype.onBackwardChangeToComplete = function (e, i, t) {
		this.reverseSlideIndex = null, this.onChangeToComplete(e, i, t)
	}, t.prototype.onChangeToComplete = function (e, i, t) {
		null !== this.reverseSlideIndex && (this.slider.slides[this.reverseSlideIndex].triggerHandler("mainAnimationStartInCancel"), this.reverseSlideIndex = null), this._hideSlide(e), N2Classes.SmartSliderMainAnimationAbstract.prototype.onChangeToComplete.apply(this, arguments)
	}, t.prototype.onReverseChangeToComplete = function (e, i, t) {
		this._hideSlide(e), N2Classes.SmartSliderMainAnimationAbstract.prototype.onReverseChangeToComplete.apply(this, arguments)
	}, t.prototype._mainAnimationNo = function (i, t) {
		this._showSlide(t), this.slider.unsetActiveSlide(i), t.$element.css("opacity", 0), t.background && t.background.element.css("opacity", 0), this.slider.setActiveSlide(t);
		var n = this.timeline.totalDuration(),
			s = this.getExtraDelay();
		this._currentBackgroundAnimation && this.parameters.shiftedBackgroundAnimation && this._currentBackgroundAnimation.shiftedPreSetup && this._currentBackgroundAnimation._preSetup(), 0 === n && (n = 1e-5, s += n), this.timeline.set(i.$element, {
			opacity: 0
		}, s), !this._currentBackgroundAnimation && i.background && this.timeline.set(i.background.element, {
			opacity: 0
		}, s), this.timeline.set(t.$element, {
			opacity: 1
		}, n), !this._currentBackgroundAnimation && t.background && this.timeline.set(t.background.element, {
			opacity: 1
		}, n), this.sliderElement.on("mainAnimationComplete.n2-simple-no", e.proxy(function (e, i, t, n) {
			this.sliderElement.off("mainAnimationComplete.n2-simple-no");
			var s = this.slider.slides[t],
				a = this.slider.slides[n];
			s.$element.css("opacity", ""), !this._currentBackgroundAnimation && s.background && s.background.element.css("opacity", ""), a.$element.css("opacity", ""), !this._currentBackgroundAnimation && a.background && a.background.element.css("opacity", "")
		}, this))
	}, t.prototype._mainAnimationFade = function (i, t) {
		i.$element.css("zIndex", 23), i.background && i.background.element.css("zIndex", 23), t.$element.css("opacity", 0), this._showSlide(t), this.slider.unsetActiveSlide(i), this.slider.setActiveSlide(t);
		var n = this.adjustMainAnimation();
		if (0 != this.parameters.shiftedBackgroundAnimation) {
			var s = !1,
				a = !1;
			if ("auto" == this.parameters.shiftedBackgroundAnimation ? i.hasLayers() ? s = !0 : a = !0 : s = !0, this._currentBackgroundAnimation && s) {
				var r = n.outDuration - n.extraDelay;
				r > 0 && this.timeline.shiftChildren(r), this._currentBackgroundAnimation.shiftedPreSetup && this._currentBackgroundAnimation._preSetup()
			} else a && (n.extraDelay > 0 && this.timeline.shiftChildren(n.extraDelay), this._currentBackgroundAnimation.shiftedPreSetup && this._currentBackgroundAnimation._preSetup())
		}
		this.timeline.to(i.$element.get(0), n.outDuration, {
			opacity: 0,
			ease: this.getEase()
		}, n.outDelay), !this._currentBackgroundAnimation && i.background && this.timeline.to(i.background.element, n.outDuration, {
			opacity: 0,
			ease: this.getEase()
		}, n.outDelay), this.timeline.to(t.$element.get(0), n.inDuration, {
			opacity: 1,
			ease: this.getEase()
		}, n.inDelay), !this._currentBackgroundAnimation && t.background && t.background.element.css("opacity", 1), this.sliderElement.on("mainAnimationComplete.n2-simple-fade", e.proxy(function (e, i, t, n) {
			this.sliderElement.off("mainAnimationComplete.n2-simple-fade");
			var s = this.slider.slides[t],
				a = this.slider.slides[n];
			s.$element.css({
				zIndex: "",
				opacity: ""
			}), !this._currentBackgroundAnimation && s.background && s.background.element.css({
				zIndex: "",
				opacity: ""
			}), a.$element.css("opacity", ""), !this._currentBackgroundAnimation && a.background && a.background.element.css("opacity", "")
		}, this))
	}, t.prototype._mainAnimationCrossFade = function (i, t) {
		i.$element.css("zIndex", 23), i.background && i.background.element.css("zIndex", 23), t.$element.css("opacity", 0), t.background && t.background.element.css("opacity", 0), this._showSlide(t), this.slider.unsetActiveSlide(i), this.slider.setActiveSlide(t);
		var n = this.adjustMainAnimation();
		if (0 != this.parameters.shiftedBackgroundAnimation) {
			var s = !1,
				a = !1;
			if ("auto" == this.parameters.shiftedBackgroundAnimation ? i.hasLayers() ? s = !0 : a = !0 : s = !0, this._currentBackgroundAnimation && s) {
				var r = n.outDuration - n.extraDelay;
				r > 0 && this.timeline.shiftChildren(r), this._currentBackgroundAnimation.shiftedPreSetup && this._currentBackgroundAnimation._preSetup()
			} else a && (n.extraDelay > 0 && this.timeline.shiftChildren(n.extraDelay), this._currentBackgroundAnimation.shiftedPreSetup && this._currentBackgroundAnimation._preSetup())
		}
		this.timeline.to(i.$element.get(0), n.outDuration, {
			opacity: 0,
			ease: this.getEase()
		}, n.outDelay), !this._currentBackgroundAnimation && i.background && this.timeline.to(i.background.element.get(0), n.outDuration, {
			opacity: 0,
			ease: this.getEase()
		}, n.outDelay), this.timeline.to(t.$element.get(0), n.inDuration, {
			opacity: 1,
			ease: this.getEase()
		}, n.inDelay), !this._currentBackgroundAnimation && t.background && this.timeline.to(t.background.element.get(0), n.inDuration, {
			opacity: 1,
			ease: this.getEase()
		}, n.inDelay), this.sliderElement.on("mainAnimationComplete.n2-simple-fade", e.proxy(function (e, i, t, n) {
			this.sliderElement.off("mainAnimationComplete.n2-simple-fade");
			var s = this.slider.slides[t],
				a = this.slider.slides[n];
			s.$element.css({
				zIndex: "",
				opacity: ""
			}), !this._currentBackgroundAnimation && s.background && s.background.element.css({
				zIndex: "",
				opacity: ""
			}), a.$element.css("opacity", ""), !this._currentBackgroundAnimation && a.background && a.background.element.css("opacity", "")
		}, this))
	}, t.prototype._mainAnimationHorizontal = function (e, i, t) {
		this.__mainAnimationDirection(e, i, "horizontal", 0, t)
	}, t.prototype._mainAnimationVertical = function (e, i, t) {
		this._showSlide(i), this.__mainAnimationDirection(e, i, "vertical", 0, t)
	}, t.prototype._mainAnimationHorizontalParallax = function (e, i, t) {
		this.__mainAnimationDirection(e, i, "horizontal", this.parameters.parallax, t)
	}, t.prototype._mainAnimationVerticalParallax = function (e, i, t) {
		this._showSlide(i), this.__mainAnimationDirection(e, i, "vertical", this.parameters.parallax, t)
	}, t.prototype._mainAnimationHorizontalReversed = function (e, i, t) {
		this.__mainAnimationDirection(e, i, "horizontal", 0, !t)
	}, t.prototype._mainAnimationVerticalReversed = function (e, i, t) {
		this._showSlide(i), this.__mainAnimationDirection(e, i, "vertical", 0, !t)
	}, t.prototype._mainAnimationHorizontalReversedParallax = function (e, i, t) {
		this.__mainAnimationDirection(e, i, "horizontal", this.parameters.parallax, !t)
	}, t.prototype._mainAnimationVerticalReversedParallax = function (e, i, t) {
		this._showSlide(i), this.__mainAnimationDirection(e, i, "vertical", this.parameters.parallax, !t)
	}, t.prototype.__mainAnimationDirection = function (i, t, n, s, a) {
		var r = "",
			o = 0,
			l = 0,
			d = "",
			h = 1 - s / 100;
		"horizontal" === n ? (r = "x", d = "width", l = o = this.slider.dimensions.slideouter.width, n2const.rtl.isRtl && (a = !a)) : "vertical" === n && (r = "y", d = "height", l = o = this.slider.dimensions.slideouter.height), a && (o *= -1);
		var m = {},
			c = {
				ease: this.getEase()
			},
			p = {},
			u = {
				ease: this.getEase()
			},
			g = {
				ease: this.getEase()
			},
			y = {
				ease: this.getEase()
			},
			A = 23,
			f = 22;
		if (0 !== s)
			if (a) i.$element.addClass("n2-ss-parallax-clip"), A = 22, f = 23, c[d] = -o, u[d] = -o, o *= h, m[r] = o, m[d] = -o, p[r] = o, p[d] = -o, g[d] = -o, g[r] = l, y[r] = -o;
			else {
				o *= h;
				var k = {};
				if (k[r] = o, NextendTween.set(t.$element, k), t.background) {
					var v = {};
					v[r] = o, NextendTween.set(t.background.element, v)
				}
				t.$element.addClass("n2-ss-parallax-clip"), m[r] = l, m[d] = o, c[d] = l, p[r] = o, g[d] = o, y[d] = o, g[r] = -o, y[r] = -o
			}
		else {
			var S = {};
			if (S[r] = o, NextendTween.set(t.$element, S), t.background) {
				var _ = {};
				_[r] = o, NextendTween.set(t.background.element, _)
			}
			m[r] = o, p[r] = o, g[r] = -o, y[r] = -o
		}
		i.$element.css("zIndex", A), i.background && i.background.element.css("zIndex", A), t.$element.css("zIndex", f), t.background && t.background.element.css("zIndex", f), this.slider.unsetActiveSlide(i), this.slider.setActiveSlide(t);
		var b = this.adjustMainAnimation();
		if (c[r] = 0, c.roundProps = "x,y", u[r] = 0, u.roundProps = "x,y", this.timeline.fromTo(t.$element.get(0), b.inDuration, m, c, b.inDelay), t.background && this.timeline.fromTo(t.background.element, b.inDuration, p, u, b.inDelay), 0 != this.parameters.shiftedBackgroundAnimation) {
			var x = !1,
				D = !1;
			if ("auto" === this.parameters.shiftedBackgroundAnimation ? i.hasLayers() ? x = !0 : D = !0 : x = !0, this._currentBackgroundAnimation && x) {
				var E = b.outDuration - b.extraDelay;
				E > 0 && this.timeline.shiftChildren(E), this._currentBackgroundAnimation.shiftedPreSetup && this._currentBackgroundAnimation._preSetup()
			} else D && (b.extraDelay > 0 && this.timeline.shiftChildren(b.extraDelay), this._currentBackgroundAnimation.shiftedPreSetup && this._currentBackgroundAnimation._preSetup())
		}
		if (g.roundProps = "x,y", y.roundProps = "x,y", this.timeline.to(i.$element.get(0), b.outDuration, g, b.outDelay), i.background && this.timeline.to(i.background.element, b.outDuration, y, b.outDelay), this.isTouch && this.isReverseAllowed && 0 === s) {
			var B = a ? i.index + 1 : i.index - 1;
			if (0 > B ? B = this.slider.parameters.carousel && !this.slider.blockCarousel ? this.slider.slides.length - 1 : i.index : B >= this.slider.slides.length && (B = this.slider.parameters.carousel && !this.slider.blockCarousel ? 0 : i.index), B !== t.index) {
				if (B !== i.index) {
					this.reverseSlideIndex = B, this.enableReverseMode();
					var C = this.slider.slides[B];
					"vertical" === n && this._showSlide(C), C.$element.css(r, o);
					var w = {},
						z = {
							ease: this.getEase()
						},
						T = {},
						N = {
							ease: this.getEase()
						};
					z[r] = 0, w[r] = -o, N[r] = o, T[r] = 0, C.$element.trigger("mainAnimationStartIn", [this, i.index, C.index, !1]), this.reverseTimeline.paused(!0), this.reverseTimeline.eventCallback("onComplete", this.onBackwardChangeToComplete, [i, C, !1], this), z.roundProps = "x,y", this.reverseTimeline.fromTo(C.$element.get(0), b.inDuration, w, z, b.inDelay), C.background && this.reverseTimeline.fromTo(C.background.element, b.inDuration, w, z, b.inDelay), N.roundProps = "x,y", this.reverseTimeline.fromTo(i.$element.get(0), b.inDuration, T, N, b.inDelay), i.background && this.reverseTimeline.fromTo(i.background.element, b.inDuration, T, N, b.inDelay)
				}
			} else this.reverseSlideIndex = null
		}
		this.sliderElement.on("mainAnimationComplete.n2-simple-fade", e.proxy(function (e, i, t, n) {
			this.sliderElement.off("mainAnimationComplete.n2-simple-fade");
			var s = this.slider.slides[t],
				a = this.slider.slides[n];
			a.$element.css("zIndex", "").css(r, "").removeClass("n2-ss-parallax-clip"), a.background && a.background.element.css("zIndex", "").css(r, ""), s.$element.css("zIndex", "").css(d, "").removeClass("n2-ss-parallax-clip"), s.background && s.background.element.css("zIndex", "").css(d, "")
		}, this))
	}, t.prototype.getExtraDelay = function () {
		return 0
	}, t.prototype.adjustMainAnimation = function () {
		var e = this.parameters.duration,
			i = this.parameters.delay,
			t = this.timeline.totalDuration(),
			n = this.getExtraDelay();
		if (t > 0) {
			var s = e + i;
			if (!(s > t)) return {
				inDuration: e,
				outDuration: e,
				inDelay: t - e,
				outDelay: n,
				extraDelay: n
			};
			e = e * t / s, i = i * t / s, n > i && (e -= n - i, i = n)
		} else i += n;
		return {
			inDuration: e,
			outDuration: e,
			inDelay: i,
			outDelay: i,
			extraDelay: n
		}
	}, t.prototype.hasBackgroundAnimation = function () {
		return !1
	}, t
}), N2D("SmartSliderResponsiveSimple", ["SmartSliderResponsive"], function (e, i) {
	function t() {
		this.round = 1, N2Classes.SmartSliderResponsive.prototype.constructor.apply(this, arguments)
	}
	return t.prototype = Object.create(N2Classes.SmartSliderResponsive.prototype), t.prototype.constructor = t, t.prototype.init = function () {
		this.sliderElement.find(".n2-ss-section-main-content").length && (this.updateVerticalRatios = this._updateVerticalRatios), this._sliderHorizontal = this.addHorizontalElement(this.sliderElement, ["width", "marginLeft", "marginRight"], "w", "slider"), this.addHorizontalElement(this.sliderElement.find(".n2-ss-slider-1"), ["width", "paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth"], "w"), this._sliderVertical = this.addVerticalElement(this.sliderElement, ["marginTop", "marginBottom"], "h"), this.addHorizontalElement(this.sliderElement, ["fontSize"], "fontRatio", "slider"), this.addVerticalElement(this.sliderElement.find(".n2-ss-slider-1"), ["height", "paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"], "h", "slider1"), this.addHorizontalElement(this.sliderElement.find(".n2-ss-slide"), ["width"], "w", "slideouter"), this.addVerticalElement(this.sliderElement.find(".n2-ss-slide"), ["height"], "h", "slideouter");
		var i = this.sliderElement.find(".n2-ss-layers-container");
		this.addHorizontalElement(i, ["width"], "slideW", "slide"), this.addVerticalElement(i, ["height"], "slideH", "slide").setCentered();
		for (var t = this.slider.parameters.mainanimation.parallax, n = this.slider.backgrounds.getBackgroundImages(), s = 0; s < n.length; s++) 0 !== t && (this.addHorizontalElement(n[s].element, ["width"], "w"), this.addVerticalElement(n[s].element, ["height"], "h"), this.slider.needBackgroundWrap && (this.addHorizontalElement(n[s].$wrapElement, ["width"], "w"), this.addVerticalElement(n[s].$wrapElement, ["height"], "h")));
		var a = this.sliderElement.find(".n2-ss-slider-background-video");
		a.length && (n2const.isVideoAutoplayAllowed() ? (this._videoPlayerReady = e.proxy(this.videoPlayerReady, this, a), a[0].videoWidth > 0 ? this._videoPlayerReady() : (a[0].addEventListener("error", e.proxy(this.videoPlayerError, this, a), !0), a[0].addEventListener("canplay", this._videoPlayerReady)), a[0].load(), a[0].play()) : this.videoPlayerError(a))
	}, t.prototype.resizeVerticalElements = function (e, i, t) {
		N2Classes.SmartSliderResponsive.prototype.resizeVerticalElements.apply(this, arguments), this.responsiveDimensions.slider.height = this.responsiveDimensions.slider1.height + this.responsiveDimensions.slider1.paddingTop + this.responsiveDimensions.slider1.paddingBottom
	}, t.prototype.videoPlayerError = function (e) {
		e.remove()
	}, t.prototype.videoPlayerReady = function (i) {
		i[0].removeEventListener("canplay", this._videoPlayerReady), i.data("ratio", i[0].videoWidth / i[0].videoHeight), i.addClass("n2-active"), this.slider.ready(e.proxy(function () {
			this.slider.sliderElement.on("SliderResize", e.proxy(this.resizeVideo, this, i)), this.resizeVideo(i)
		}, this))
	}, t.prototype.resizeVideo = function (e) {
		var i = e.data("mode"),
			t = e.data("ratio"),
			n = this.slider.dimensions.slideouter || this.slider.dimensions.slide,
			s = n.width / n.height;
		"fill" === i ? s > t ? e.css({
			width: "100%",
			height: "auto"
		}) : e.css({
			width: "auto",
			height: "100%"
		}) : "fit" === i && (t > s ? e.css({
			width: "100%",
			height: "auto"
		}) : e.css({
			width: "auto",
			height: "100%"
		})), e.css({
			marginTop: 0,
			marginLeft: 0
		}), this.center(e)
	}, t.prototype.center = function (e) {
		var i = e.parent();
		e.css({
			marginTop: Math.round((i.height() - e.height()) / 2),
			marginLeft: Math.round((i.width() - e.width()) / 2)
		})
	}, t
}), N2D("SmartSliderSimple", ["SmartSliderAbstract"], function (e, i) {
	function t(i, t) {
		this.type = "simple", N2Classes.SmartSliderAbstract.prototype.constructor.call(this, i, e.extend({
			bgAnimations: 0,
			carousel: 1
		}, t))
	}
	return t.prototype = Object.create(N2Classes.SmartSliderAbstract.prototype), t.prototype.constructor = t, t.prototype.__initSlides = function () {
		1 !== this.parameters.mainanimation.parallax && (this.needBackgroundWrap = !0), N2Classes.SmartSliderAbstract.prototype.__initSlides.apply(this, arguments)
	}, t.prototype.initResponsiveMode = function () {
		this.responsive = new N2Classes.SmartSliderResponsiveSimple(this, this.parameters.responsive), this.responsive.start(), N2Classes.SmartSliderAbstract.prototype.initResponsiveMode.call(this), this.$backgroundsContainer = this.sliderElement.find(".n2-ss-slide-backgrounds")
	}, t.prototype.initMainAnimation = function () {
		this.disabled.backgroundAnimations || !this.parameters.bgAnimations || n2const.isIE || n2const.isEdge ? this.mainAnimation = new N2Classes.SmartSliderMainAnimationSimple(this, this.parameters.mainanimation) : this.mainAnimation = new N2Classes.SmartSliderFrontendBackgroundAnimation(this, this.parameters.mainanimation, this.parameters.bgAnimations)
	}, t.prototype.afterRawSlidesReady = function () {
		if (this.parameters.postBackgroundAnimations && this.parameters.postBackgroundAnimations.slides) {
			for (var e = 0; e < this.slides.length; e++) this.slides[e].postBackgroundAnimation = this.parameters.postBackgroundAnimations.slides[e];
			delete this.parameters.postBackgroundAnimations.slides
		}
		if (this.parameters.bgAnimations && this.parameters.bgAnimations.slides) {
			for (var i = 0; i < this.slides.length; i++) this.slides[i].backgroundAnimation = this.parameters.bgAnimations.slides[i];
			delete this.parameters.bgAnimations.slides
		}
	}, t.prototype.findSlideBackground = function (e) {
		var i = N2Classes.SmartSliderAbstract.prototype.findSlideBackground.call(this, e);
		return i.appendTo(this.sliderElement.find(".n2-ss-slide-backgrounds")), i
	}, t.prototype.getAnimationAxis = function () {
		switch (this.mainAnimation.parameters.type) {
			case "vertical":
			case "vertical-reversed":
				return "vertical"
		}
		return "horizontal"
	}, t
}), N2D("smartslider-simple-type-frontend");