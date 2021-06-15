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
}).call(window), N2D("StringHelper", function () {
	return {
		capitalize: function (e) {
			return e.charAt(0).toUpperCase() + e.slice(1)
		}
	}
}), window.n2c = function (e) {
	var t = !1,
		i = {
			logs: [],
			errors: [],
			warns: [],
			infos: []
		};
	return {
		log: function () {
			i.logs.push(arguments), t && e.log && e.log.apply(e, arguments)
		},
		warn: function () {
			i.warns.push(arguments), t && e.warn && e.warn.apply(e, arguments)
		},
		error: function () {
			i.errors.push(arguments), t && e.error && e.error.apply(e, arguments)
		},
		info: function (n) {
			i.infos.push(arguments), t && e.info && e.info.apply(e, arguments)
		},
		debug: function (e) {
			t = e
		},
		logArray: function () {
			return i
		}
	}
}(window.console), window.n2const = {
	passiveEvents: !1,
	devicePixelRatio: window.devicePixelRatio || 1,
	isIOS: /iPad|iPhone|iPod/.test(navigator.platform),
	isEdge: function () {
		var e = navigator.userAgent.match(/Edge\/([0-9]+)/);
		return null === e ? !1 : e[1]
	}(),
	isFirefox: navigator.userAgent.toLowerCase().indexOf("firefox") > -1,
	isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Silk/i.test(navigator.userAgent),
	isPhone: /Android/i.test(navigator.userAgent) && /mobile/i.test(navigator.userAgent) || /webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
	isIE: function () {
		var e = window.navigator.userAgent,
			t = e.indexOf("MSIE ");
		if (t > 0) return parseInt(e.substring(t + 5, e.indexOf(".", t)), 10);
		var i = e.indexOf("Trident/");
		if (i > 0) {
			var n = e.indexOf("rv:");
			return parseInt(e.substring(n + 3, e.indexOf(".", n)), 10)
		}
		return !1
	}(),
	isSamsungBrowser: navigator.userAgent.match(/SamsungBrowser/i),
	isBot: /bot|googlebot|crawler|spider|robot|crawling|Google Search Console/i.test(navigator.userAgent),
	lightboxMobileNewTab: 1,
	isVideoAutoplayAllowed: function () {
		var e = !!(navigator.platform.match(/(Win|Mac)/) || !/Mobi/.test(navigator.userAgent) || "playsInline" in document.createElement("video") || "webkit-playsinline" in document.createElement("video") || navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) && parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2]) >= 53 || navigator.userAgent.match(/Android.*(Firefox|Edge|Opera)/));
		return window.n2const.isVideoAutoplayAllowed = function () {
			return e
		}, e
	},
	isWaybackMachine: function () {
		var e = "undefined" != typeof window.__wm;
		return window.n2const.isWaybackMachine = function () {
			return e
		}, e
	},
	setLocation: function (e) {
		"function" == typeof window.zajax_goto ? window.zajax_goto(e) : window.location = e
	}
}, window.n2const.IOSVersion = function () {
	if (window.n2const.isIOS) {
		var e = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
		return e ? e[1] : 100
	}
	return !1
}(), window.n2const.isTablet = function () {
	return window.n2const.isPhone ? !1 : /Android|iPad|tablet|Silk/i.test(navigator.userAgent)
}();
try {
	var opts = Object.defineProperty({}, "passive", {
		get: function () {
			window.n2const.passiveEvents = !0
		}
	});
	window.addEventListener("test", null, opts)
} catch (e) {}
window.n2const.rtl = function () {
	return window.n2const.isRTL = function () {
		return window.n2const.rtl.isRtl
	}, "rtl" === document.documentElement.getAttribute("dir") ? {
		isRtl: !0,
		marginLeft: "marginRight",
		marginRight: "marginLeft",
		left: "right",
		right: "left",
		modifier: -1
	} : (document.documentElement.setAttribute("dir", "ltr"), {
		isRtl: !1,
		marginLeft: "marginLeft",
		marginRight: "marginRight",
		left: "left",
		right: "right",
		modifier: 1
	})
}(), N2R("$", function (e) {
	n2const.isRetina = function () {
		return window.matchMedia && (window.matchMedia("only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)").matches || window.matchMedia("only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)").matches) || window.devicePixelRatio && window.devicePixelRatio >= 2
	}(), nextend.triggerResize = function () {
		var t = 100,
			i = null,
			n = e(window);
		return function () {
			i && clearTimeout(i), i = setTimeout(function () {
				n.trigger("resize"), i = null
			}, t)
		}
	}(), nextend.shouldPreventClick = !1, nextend.preventClick = function () {
		nextend.shouldPreventClick || (nextend.shouldPreventClick = !0, setTimeout(function () {
			nextend.shouldPreventClick = !1
		}, 300))
	}, nextend.shouldPreventMouseUp = !1, nextend.preventMouseUp = function () {
		nextend.shouldPreventMouseUp ? e("html").attr("dir", "ltr") : (nextend.shouldPreventMouseUp = !0, setTimeout(function () {
			nextend.shouldPreventMouseUp = !1
		}, 300))
	}
}), window.n2FilterProperty = !1;
var element = document.createElement("div");
void 0 !== element.style.webkitFilter ? window.n2FilterProperty = "webkitFilter" : void 0 !== element.style.filter && (window.n2FilterProperty = "filter"), N2D("Base64", function () {
	var e = function (e) {
			e = e.replace(/\r\n/g, "\n");
			for (var t = "", i = 0; i < e.length; i++) {
				var n = e.charCodeAt(i);
				128 > n ? t += String.fromCharCode(n) : n > 127 && 2048 > n ? (t += String.fromCharCode(n >> 6 | 192), t += String.fromCharCode(63 & n | 128)) : (t += String.fromCharCode(n >> 12 | 224), t += String.fromCharCode(n >> 6 & 63 | 128), t += String.fromCharCode(63 & n | 128))
			}
			return t
		},
		t = function (e) {
			for (var t = "", i = 0, n = c1 = c2 = 0; i < e.length;) n = e.charCodeAt(i), 128 > n ? (t += String.fromCharCode(n), i++) : n > 191 && 224 > n ? (c2 = e.charCodeAt(i + 1), t += String.fromCharCode((31 & n) << 6 | 63 & c2), i += 2) : (c2 = e.charCodeAt(i + 1), c3 = e.charCodeAt(i + 2), t += String.fromCharCode((15 & n) << 12 | (63 & c2) << 6 | 63 & c3), i += 3);
			return t
		};
	return N2Classes.Base64 = {
		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		encode: function (t) {
			var i, n, o, r, a, s, T, l = "",
				u = 0;
			for (t = e(t); u < t.length;) i = t.charCodeAt(u++), n = t.charCodeAt(u++), o = t.charCodeAt(u++), r = i >> 2, a = (3 & i) << 4 | n >> 4, s = (15 & n) << 2 | o >> 6, T = 63 & o, isNaN(n) ? s = T = 64 : isNaN(o) && (T = 64), l = l + this._keyStr.charAt(r) + this._keyStr.charAt(a) + this._keyStr.charAt(s) + this._keyStr.charAt(T);
			return l
		},
		decode: function (e) {
			var i, n, o, r, a, s, T, l = "",
				u = 0;
			for (e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); u < e.length;) r = this._keyStr.indexOf(e.charAt(u++)), a = this._keyStr.indexOf(e.charAt(u++)), s = this._keyStr.indexOf(e.charAt(u++)), T = this._keyStr.indexOf(e.charAt(u++)), i = r << 2 | a >> 4, n = (15 & a) << 4 | s >> 2, o = (3 & s) << 6 | T, l += String.fromCharCode(i), 64 != s && (l += String.fromCharCode(n)), 64 != T && (l += String.fromCharCode(o));
			return l = t(l)
		}
	}, N2Classes.Base64
}), ! function (e, t) {
	e(function () {
		"use strict";

		function e(e, t) {
			return null != e && null != t && e.toLowerCase() === t.toLowerCase()
		}

		function i(e, t) {
			var i, n, o = e.length;
			if (!o || !t) return !1;
			for (i = t.toLowerCase(), n = 0; o > n; ++n)
				if (i === e[n].toLowerCase()) return !0;
			return !1
		}

		function n(e) {
			for (var t in e) s.call(e, t) && (e[t] = new RegExp(e[t], "i"))
		}

		function o(e, t) {
			this.ua = e || "", this._cache = {}, this.maxPhoneWidth = t || 600
		}
		var r = {};
		r.mobileDetectRules = {
			phones: {
				iPhone: "\\biPhone\\b|\\biPod\\b",
				BlackBerry: "BlackBerry|\\bBB10\\b|rim[0-9]+",
				HTC: "HTC|HTC.*(Sensation|Evo|Vision|Explorer|6800|8100|8900|A7272|S510e|C110e|Legend|Desire|T8282)|APX515CKT|Qtek9090|APA9292KT|HD_mini|Sensation.*Z710e|PG86100|Z715e|Desire.*(A8181|HD)|ADR6200|ADR6400L|ADR6425|001HT|Inspire 4G|Android.*\\bEVO\\b|T-Mobile G1|Z520m",
				Nexus: "Nexus One|Nexus S|Galaxy.*Nexus|Android.*Nexus.*Mobile|Nexus 4|Nexus 5|Nexus 6",
				Dell: "Dell.*Streak|Dell.*Aero|Dell.*Venue|DELL.*Venue Pro|Dell Flash|Dell Smoke|Dell Mini 3iX|XCD28|XCD35|\\b001DL\\b|\\b101DL\\b|\\bGS01\\b",
				Motorola: "Motorola|DROIDX|DROID BIONIC|\\bDroid\\b.*Build|Android.*Xoom|HRI39|MOT-|A1260|A1680|A555|A853|A855|A953|A955|A956|Motorola.*ELECTRIFY|Motorola.*i1|i867|i940|MB200|MB300|MB501|MB502|MB508|MB511|MB520|MB525|MB526|MB611|MB612|MB632|MB810|MB855|MB860|MB861|MB865|MB870|ME501|ME502|ME511|ME525|ME600|ME632|ME722|ME811|ME860|ME863|ME865|MT620|MT710|MT716|MT720|MT810|MT870|MT917|Motorola.*TITANIUM|WX435|WX445|XT300|XT301|XT311|XT316|XT317|XT319|XT320|XT390|XT502|XT530|XT531|XT532|XT535|XT603|XT610|XT611|XT615|XT681|XT701|XT702|XT711|XT720|XT800|XT806|XT860|XT862|XT875|XT882|XT883|XT894|XT901|XT907|XT909|XT910|XT912|XT928|XT926|XT915|XT919|XT925|XT1021|\\bMoto E\\b",
				Samsung: "Samsung|SM-G9250|GT-19300|SGH-I337|BGT-S5230|GT-B2100|GT-B2700|GT-B2710|GT-B3210|GT-B3310|GT-B3410|GT-B3730|GT-B3740|GT-B5510|GT-B5512|GT-B5722|GT-B6520|GT-B7300|GT-B7320|GT-B7330|GT-B7350|GT-B7510|GT-B7722|GT-B7800|GT-C3010|GT-C3011|GT-C3060|GT-C3200|GT-C3212|GT-C3212I|GT-C3262|GT-C3222|GT-C3300|GT-C3300K|GT-C3303|GT-C3303K|GT-C3310|GT-C3322|GT-C3330|GT-C3350|GT-C3500|GT-C3510|GT-C3530|GT-C3630|GT-C3780|GT-C5010|GT-C5212|GT-C6620|GT-C6625|GT-C6712|GT-E1050|GT-E1070|GT-E1075|GT-E1080|GT-E1081|GT-E1085|GT-E1087|GT-E1100|GT-E1107|GT-E1110|GT-E1120|GT-E1125|GT-E1130|GT-E1160|GT-E1170|GT-E1175|GT-E1180|GT-E1182|GT-E1200|GT-E1210|GT-E1225|GT-E1230|GT-E1390|GT-E2100|GT-E2120|GT-E2121|GT-E2152|GT-E2220|GT-E2222|GT-E2230|GT-E2232|GT-E2250|GT-E2370|GT-E2550|GT-E2652|GT-E3210|GT-E3213|GT-I5500|GT-I5503|GT-I5700|GT-I5800|GT-I5801|GT-I6410|GT-I6420|GT-I7110|GT-I7410|GT-I7500|GT-I8000|GT-I8150|GT-I8160|GT-I8190|GT-I8320|GT-I8330|GT-I8350|GT-I8530|GT-I8700|GT-I8703|GT-I8910|GT-I9000|GT-I9001|GT-I9003|GT-I9010|GT-I9020|GT-I9023|GT-I9070|GT-I9082|GT-I9100|GT-I9103|GT-I9220|GT-I9250|GT-I9300|GT-I9305|GT-I9500|GT-I9505|GT-M3510|GT-M5650|GT-M7500|GT-M7600|GT-M7603|GT-M8800|GT-M8910|GT-N7000|GT-S3110|GT-S3310|GT-S3350|GT-S3353|GT-S3370|GT-S3650|GT-S3653|GT-S3770|GT-S3850|GT-S5210|GT-S5220|GT-S5229|GT-S5230|GT-S5233|GT-S5250|GT-S5253|GT-S5260|GT-S5263|GT-S5270|GT-S5300|GT-S5330|GT-S5350|GT-S5360|GT-S5363|GT-S5369|GT-S5380|GT-S5380D|GT-S5560|GT-S5570|GT-S5600|GT-S5603|GT-S5610|GT-S5620|GT-S5660|GT-S5670|GT-S5690|GT-S5750|GT-S5780|GT-S5830|GT-S5839|GT-S6102|GT-S6500|GT-S7070|GT-S7200|GT-S7220|GT-S7230|GT-S7233|GT-S7250|GT-S7500|GT-S7530|GT-S7550|GT-S7562|GT-S7710|GT-S8000|GT-S8003|GT-S8500|GT-S8530|GT-S8600|SCH-A310|SCH-A530|SCH-A570|SCH-A610|SCH-A630|SCH-A650|SCH-A790|SCH-A795|SCH-A850|SCH-A870|SCH-A890|SCH-A930|SCH-A950|SCH-A970|SCH-A990|SCH-I100|SCH-I110|SCH-I400|SCH-I405|SCH-I500|SCH-I510|SCH-I515|SCH-I600|SCH-I730|SCH-I760|SCH-I770|SCH-I830|SCH-I910|SCH-I920|SCH-I959|SCH-LC11|SCH-N150|SCH-N300|SCH-R100|SCH-R300|SCH-R351|SCH-R400|SCH-R410|SCH-T300|SCH-U310|SCH-U320|SCH-U350|SCH-U360|SCH-U365|SCH-U370|SCH-U380|SCH-U410|SCH-U430|SCH-U450|SCH-U460|SCH-U470|SCH-U490|SCH-U540|SCH-U550|SCH-U620|SCH-U640|SCH-U650|SCH-U660|SCH-U700|SCH-U740|SCH-U750|SCH-U810|SCH-U820|SCH-U900|SCH-U940|SCH-U960|SCS-26UC|SGH-A107|SGH-A117|SGH-A127|SGH-A137|SGH-A157|SGH-A167|SGH-A177|SGH-A187|SGH-A197|SGH-A227|SGH-A237|SGH-A257|SGH-A437|SGH-A517|SGH-A597|SGH-A637|SGH-A657|SGH-A667|SGH-A687|SGH-A697|SGH-A707|SGH-A717|SGH-A727|SGH-A737|SGH-A747|SGH-A767|SGH-A777|SGH-A797|SGH-A817|SGH-A827|SGH-A837|SGH-A847|SGH-A867|SGH-A877|SGH-A887|SGH-A897|SGH-A927|SGH-B100|SGH-B130|SGH-B200|SGH-B220|SGH-C100|SGH-C110|SGH-C120|SGH-C130|SGH-C140|SGH-C160|SGH-C170|SGH-C180|SGH-C200|SGH-C207|SGH-C210|SGH-C225|SGH-C230|SGH-C417|SGH-C450|SGH-D307|SGH-D347|SGH-D357|SGH-D407|SGH-D415|SGH-D780|SGH-D807|SGH-D980|SGH-E105|SGH-E200|SGH-E315|SGH-E316|SGH-E317|SGH-E335|SGH-E590|SGH-E635|SGH-E715|SGH-E890|SGH-F300|SGH-F480|SGH-I200|SGH-I300|SGH-I320|SGH-I550|SGH-I577|SGH-I600|SGH-I607|SGH-I617|SGH-I627|SGH-I637|SGH-I677|SGH-I700|SGH-I717|SGH-I727|SGH-i747M|SGH-I777|SGH-I780|SGH-I827|SGH-I847|SGH-I857|SGH-I896|SGH-I897|SGH-I900|SGH-I907|SGH-I917|SGH-I927|SGH-I937|SGH-I997|SGH-J150|SGH-J200|SGH-L170|SGH-L700|SGH-M110|SGH-M150|SGH-M200|SGH-N105|SGH-N500|SGH-N600|SGH-N620|SGH-N625|SGH-N700|SGH-N710|SGH-P107|SGH-P207|SGH-P300|SGH-P310|SGH-P520|SGH-P735|SGH-P777|SGH-Q105|SGH-R210|SGH-R220|SGH-R225|SGH-S105|SGH-S307|SGH-T109|SGH-T119|SGH-T139|SGH-T209|SGH-T219|SGH-T229|SGH-T239|SGH-T249|SGH-T259|SGH-T309|SGH-T319|SGH-T329|SGH-T339|SGH-T349|SGH-T359|SGH-T369|SGH-T379|SGH-T409|SGH-T429|SGH-T439|SGH-T459|SGH-T469|SGH-T479|SGH-T499|SGH-T509|SGH-T519|SGH-T539|SGH-T559|SGH-T589|SGH-T609|SGH-T619|SGH-T629|SGH-T639|SGH-T659|SGH-T669|SGH-T679|SGH-T709|SGH-T719|SGH-T729|SGH-T739|SGH-T746|SGH-T749|SGH-T759|SGH-T769|SGH-T809|SGH-T819|SGH-T839|SGH-T919|SGH-T929|SGH-T939|SGH-T959|SGH-T989|SGH-U100|SGH-U200|SGH-U800|SGH-V205|SGH-V206|SGH-X100|SGH-X105|SGH-X120|SGH-X140|SGH-X426|SGH-X427|SGH-X475|SGH-X495|SGH-X497|SGH-X507|SGH-X600|SGH-X610|SGH-X620|SGH-X630|SGH-X700|SGH-X820|SGH-X890|SGH-Z130|SGH-Z150|SGH-Z170|SGH-ZX10|SGH-ZX20|SHW-M110|SPH-A120|SPH-A400|SPH-A420|SPH-A460|SPH-A500|SPH-A560|SPH-A600|SPH-A620|SPH-A660|SPH-A700|SPH-A740|SPH-A760|SPH-A790|SPH-A800|SPH-A820|SPH-A840|SPH-A880|SPH-A900|SPH-A940|SPH-A960|SPH-D600|SPH-D700|SPH-D710|SPH-D720|SPH-I300|SPH-I325|SPH-I330|SPH-I350|SPH-I500|SPH-I600|SPH-I700|SPH-L700|SPH-M100|SPH-M220|SPH-M240|SPH-M300|SPH-M305|SPH-M320|SPH-M330|SPH-M350|SPH-M360|SPH-M370|SPH-M380|SPH-M510|SPH-M540|SPH-M550|SPH-M560|SPH-M570|SPH-M580|SPH-M610|SPH-M620|SPH-M630|SPH-M800|SPH-M810|SPH-M850|SPH-M900|SPH-M910|SPH-M920|SPH-M930|SPH-N100|SPH-N200|SPH-N240|SPH-N300|SPH-N400|SPH-Z400|SWC-E100|SCH-i909|GT-N7100|GT-N7105|SCH-I535|SM-N900A|SGH-I317|SGH-T999L|GT-S5360B|GT-I8262|GT-S6802|GT-S6312|GT-S6310|GT-S5312|GT-S5310|GT-I9105|GT-I8510|GT-S6790N|SM-G7105|SM-N9005|GT-S5301|GT-I9295|GT-I9195|SM-C101|GT-S7392|GT-S7560|GT-B7610|GT-I5510|GT-S7582|GT-S7530E|GT-I8750|SM-G9006V|SM-G9008V|SM-G9009D|SM-G900A|SM-G900D|SM-G900F|SM-G900H|SM-G900I|SM-G900J|SM-G900K|SM-G900L|SM-G900M|SM-G900P|SM-G900R4|SM-G900S|SM-G900T|SM-G900V|SM-G900W8|SHV-E160K|SCH-P709|SCH-P729|SM-T2558|GT-I9205",
				LG: "\\bLG\\b;|LG[- ]?(C800|C900|E400|E610|E900|E-900|F160|F180K|F180L|F180S|730|855|L160|LS740|LS840|LS970|LU6200|MS690|MS695|MS770|MS840|MS870|MS910|P500|P700|P705|VM696|AS680|AS695|AX840|C729|E970|GS505|272|C395|E739BK|E960|L55C|L75C|LS696|LS860|P769BK|P350|P500|P509|P870|UN272|US730|VS840|VS950|LN272|LN510|LS670|LS855|LW690|MN270|MN510|P509|P769|P930|UN200|UN270|UN510|UN610|US670|US740|US760|UX265|UX840|VN271|VN530|VS660|VS700|VS740|VS750|VS910|VS920|VS930|VX9200|VX11000|AX840A|LW770|P506|P925|P999|E612|D955|D802)",
				Sony: "SonyST|SonyLT|SonyEricsson|SonyEricssonLT15iv|LT18i|E10i|LT28h|LT26w|SonyEricssonMT27i|C5303|C6902|C6903|C6906|C6943|D2533",
				Asus: "Asus.*Galaxy|PadFone.*Mobile",
				Micromax: "Micromax.*\\b(A210|A92|A88|A72|A111|A110Q|A115|A116|A110|A90S|A26|A51|A35|A54|A25|A27|A89|A68|A65|A57|A90)\\b",
				Palm: "PalmSource|Palm",
				Vertu: "Vertu|Vertu.*Ltd|Vertu.*Ascent|Vertu.*Ayxta|Vertu.*Constellation(F|Quest)?|Vertu.*Monika|Vertu.*Signature",
				Pantech: "PANTECH|IM-A850S|IM-A840S|IM-A830L|IM-A830K|IM-A830S|IM-A820L|IM-A810K|IM-A810S|IM-A800S|IM-T100K|IM-A725L|IM-A780L|IM-A775C|IM-A770K|IM-A760S|IM-A750K|IM-A740S|IM-A730S|IM-A720L|IM-A710K|IM-A690L|IM-A690S|IM-A650S|IM-A630K|IM-A600S|VEGA PTL21|PT003|P8010|ADR910L|P6030|P6020|P9070|P4100|P9060|P5000|CDM8992|TXT8045|ADR8995|IS11PT|P2030|P6010|P8000|PT002|IS06|CDM8999|P9050|PT001|TXT8040|P2020|P9020|P2000|P7040|P7000|C790",
				Fly: "IQ230|IQ444|IQ450|IQ440|IQ442|IQ441|IQ245|IQ256|IQ236|IQ255|IQ235|IQ245|IQ275|IQ240|IQ285|IQ280|IQ270|IQ260|IQ250",
				Wiko: "KITE 4G|HIGHWAY|GETAWAY|STAIRWAY|DARKSIDE|DARKFULL|DARKNIGHT|DARKMOON|SLIDE|WAX 4G|RAINBOW|BLOOM|SUNSET|GOA|LENNY|BARRY|IGGY|OZZY|CINK FIVE|CINK PEAX|CINK PEAX 2|CINK SLIM|CINK SLIM 2|CINK +|CINK KING|CINK PEAX|CINK SLIM|SUBLIM",
				iMobile: "i-mobile (IQ|i-STYLE|idea|ZAA|Hitz)",
				SimValley: "\\b(SP-80|XT-930|SX-340|XT-930|SX-310|SP-360|SP60|SPT-800|SP-120|SPT-800|SP-140|SPX-5|SPX-8|SP-100|SPX-8|SPX-12)\\b",
				Wolfgang: "AT-B24D|AT-AS50HD|AT-AS40W|AT-AS55HD|AT-AS45q2|AT-B26D|AT-AS50Q",
				Alcatel: "Alcatel",
				Nintendo: "Nintendo 3DS",
				Amoi: "Amoi",
				INQ: "INQ",
				GenericPhone: "Tapatalk|PDA;|SAGEM|\\bmmp\\b|pocket|\\bpsp\\b|symbian|Smartphone|smartfon|treo|up.browser|up.link|vodafone|\\bwap\\b|nokia|Series40|Series60|S60|SonyEricsson|N900|MAUI.*WAP.*Browser"
			},
			tablets: {
				iPad: "iPad|iPad.*Mobile",
				NexusTablet: "Android.*Nexus[\\s]+(7|9|10)",
				SamsungTablet: "SAMSUNG.*Tablet|Galaxy.*Tab|SC-01C|GT-P1000|GT-P1003|GT-P1010|GT-P3105|GT-P6210|GT-P6800|GT-P6810|GT-P7100|GT-P7300|GT-P7310|GT-P7500|GT-P7510|SCH-I800|SCH-I815|SCH-I905|SGH-I957|SGH-I987|SGH-T849|SGH-T859|SGH-T869|SPH-P100|GT-P3100|GT-P3108|GT-P3110|GT-P5100|GT-P5110|GT-P6200|GT-P7320|GT-P7511|GT-N8000|GT-P8510|SGH-I497|SPH-P500|SGH-T779|SCH-I705|SCH-I915|GT-N8013|GT-P3113|GT-P5113|GT-P8110|GT-N8010|GT-N8005|GT-N8020|GT-P1013|GT-P6201|GT-P7501|GT-N5100|GT-N5105|GT-N5110|SHV-E140K|SHV-E140L|SHV-E140S|SHV-E150S|SHV-E230K|SHV-E230L|SHV-E230S|SHW-M180K|SHW-M180L|SHW-M180S|SHW-M180W|SHW-M300W|SHW-M305W|SHW-M380K|SHW-M380S|SHW-M380W|SHW-M430W|SHW-M480K|SHW-M480S|SHW-M480W|SHW-M485W|SHW-M486W|SHW-M500W|GT-I9228|SCH-P739|SCH-I925|GT-I9200|GT-P5200|GT-P5210|GT-P5210X|SM-T311|SM-T310|SM-T310X|SM-T210|SM-T210R|SM-T211|SM-P600|SM-P601|SM-P605|SM-P900|SM-P901|SM-T217|SM-T217A|SM-T217S|SM-P6000|SM-T3100|SGH-I467|XE500|SM-T110|GT-P5220|GT-I9200X|GT-N5110X|GT-N5120|SM-P905|SM-T111|SM-T2105|SM-T315|SM-T320|SM-T320X|SM-T321|SM-T520|SM-T525|SM-T530NU|SM-T230NU|SM-T330NU|SM-T900|XE500T1C|SM-P605V|SM-P905V|SM-T337V|SM-T537V|SM-T707V|SM-T807V|SM-P600X|SM-P900X|SM-T210X|SM-T230|SM-T230X|SM-T325|GT-P7503|SM-T531|SM-T330|SM-T530|SM-T705|SM-T705C|SM-T535|SM-T331|SM-T800|SM-T700|SM-T537|SM-T807|SM-P907A|SM-T337A|SM-T537A|SM-T707A|SM-T807A|SM-T237|SM-T807P|SM-P607T|SM-T217T|SM-T337T|SM-T807T|SM-T116NQ|SM-P550|SM-T350|SM-T550|SM-T9000|SM-P9000|SM-T705Y|SM-T805|GT-P3113|SM-T710|SM-T810|SM-T360|SM-T533",
				Kindle: "Kindle|Silk.*Accelerated|Android.*\\b(KFOT|KFTT|KFJWI|KFJWA|KFOTE|KFSOWI|KFTHWI|KFTHWA|KFAPWI|KFAPWA|WFJWAE|KFSAWA|KFSAWI|KFASWI)\\b",
				SurfaceTablet: "Windows NT [0-9.]+; ARM;.*(Tablet|ARMBJS)",
				HPTablet: "HP Slate (7|8|10)|HP ElitePad 900|hp-tablet|EliteBook.*Touch|HP 8|Slate 21|HP SlateBook 10",
				AsusTablet: "^.*PadFone((?!Mobile).)*$|Transformer|TF101|TF101G|TF300T|TF300TG|TF300TL|TF700T|TF700KL|TF701T|TF810C|ME171|ME301T|ME302C|ME371MG|ME370T|ME372MG|ME172V|ME173X|ME400C|Slider SL101|\\bK00F\\b|\\bK00C\\b|\\bK00E\\b|\\bK00L\\b|TX201LA|ME176C|ME102A|\\bM80TA\\b|ME372CL|ME560CG|ME372CG|ME302KL| K010 | K017 |ME572C|ME103K|ME170C|ME171C|\\bME70C\\b|ME581C|ME581CL|ME8510C|ME181C",
				BlackBerryTablet: "PlayBook|RIM Tablet",
				HTCtablet: "HTC_Flyer_P512|HTC Flyer|HTC Jetstream|HTC-P715a|HTC EVO View 4G|PG41200|PG09410",
				MotorolaTablet: "xoom|sholest|MZ615|MZ605|MZ505|MZ601|MZ602|MZ603|MZ604|MZ606|MZ607|MZ608|MZ609|MZ615|MZ616|MZ617",
				NookTablet: "Android.*Nook|NookColor|nook browser|BNRV200|BNRV200A|BNTV250|BNTV250A|BNTV400|BNTV600|LogicPD Zoom2",
				AcerTablet: "Android.*; \\b(A100|A101|A110|A200|A210|A211|A500|A501|A510|A511|A700|A701|W500|W500P|W501|W501P|W510|W511|W700|G100|G100W|B1-A71|B1-710|B1-711|A1-810|A1-811|A1-830)\\b|W3-810|\\bA3-A10\\b|\\bA3-A11\\b",
				ToshibaTablet: "Android.*(AT100|AT105|AT200|AT205|AT270|AT275|AT300|AT305|AT1S5|AT500|AT570|AT700|AT830)|TOSHIBA.*FOLIO",
				LGTablet: "\\bL-06C|LG-V909|LG-V900|LG-V700|LG-V510|LG-V500|LG-V410|LG-V400|LG-VK810\\b",
				FujitsuTablet: "Android.*\\b(F-01D|F-02F|F-05E|F-10D|M532|Q572)\\b",
				PrestigioTablet: "PMP3170B|PMP3270B|PMP3470B|PMP7170B|PMP3370B|PMP3570C|PMP5870C|PMP3670B|PMP5570C|PMP5770D|PMP3970B|PMP3870C|PMP5580C|PMP5880D|PMP5780D|PMP5588C|PMP7280C|PMP7280C3G|PMP7280|PMP7880D|PMP5597D|PMP5597|PMP7100D|PER3464|PER3274|PER3574|PER3884|PER5274|PER5474|PMP5097CPRO|PMP5097|PMP7380D|PMP5297C|PMP5297C_QUAD|PMP812E|PMP812E3G|PMP812F|PMP810E|PMP880TD|PMT3017|PMT3037|PMT3047|PMT3057|PMT7008|PMT5887|PMT5001|PMT5002",
				LenovoTablet: "Idea(Tab|Pad)( A1|A10| K1|)|ThinkPad([ ]+)?Tablet|Lenovo.*(S2109|S2110|S5000|S6000|K3011|A3000|A3500|A1000|A2107|A2109|A1107|A5500|A7600|B6000|B8000|B8080)(-|)(FL|F|HV|H|)",
				DellTablet: "Venue 11|Venue 8|Venue 7|Dell Streak 10|Dell Streak 7",
				YarvikTablet: "Android.*\\b(TAB210|TAB211|TAB224|TAB250|TAB260|TAB264|TAB310|TAB360|TAB364|TAB410|TAB411|TAB420|TAB424|TAB450|TAB460|TAB461|TAB464|TAB465|TAB467|TAB468|TAB07-100|TAB07-101|TAB07-150|TAB07-151|TAB07-152|TAB07-200|TAB07-201-3G|TAB07-210|TAB07-211|TAB07-212|TAB07-214|TAB07-220|TAB07-400|TAB07-485|TAB08-150|TAB08-200|TAB08-201-3G|TAB08-201-30|TAB09-100|TAB09-211|TAB09-410|TAB10-150|TAB10-201|TAB10-211|TAB10-400|TAB10-410|TAB13-201|TAB274EUK|TAB275EUK|TAB374EUK|TAB462EUK|TAB474EUK|TAB9-200)\\b",
				MedionTablet: "Android.*\\bOYO\\b|LIFE.*(P9212|P9514|P9516|S9512)|LIFETAB",
				ArnovaTablet: "AN10G2|AN7bG3|AN7fG3|AN8G3|AN8cG3|AN7G3|AN9G3|AN7dG3|AN7dG3ST|AN7dG3ChildPad|AN10bG3|AN10bG3DT|AN9G2",
				IntensoTablet: "INM8002KP|INM1010FP|INM805ND|Intenso Tab|TAB1004",
				IRUTablet: "M702pro",
				MegafonTablet: "MegaFon V9|\\bZTE V9\\b|Android.*\\bMT7A\\b",
				EbodaTablet: "E-Boda (Supreme|Impresspeed|Izzycomm|Essential)",
				AllViewTablet: "Allview.*(Viva|Alldro|City|Speed|All TV|Frenzy|Quasar|Shine|TX1|AX1|AX2)",
				ArchosTablet: "\\b(101G9|80G9|A101IT)\\b|Qilive 97R|Archos5|\\bARCHOS (70|79|80|90|97|101|FAMILYPAD|)(b|)(G10| Cobalt| TITANIUM(HD|)| Xenon| Neon|XSK| 2| XS 2| PLATINUM| CARBON|GAMEPAD)\\b",
				AinolTablet: "NOVO7|NOVO8|NOVO10|Novo7Aurora|Novo7Basic|NOVO7PALADIN|novo9-Spark",
				SonyTablet: "Sony.*Tablet|Xperia Tablet|Sony Tablet S|SO-03E|SGPT12|SGPT13|SGPT114|SGPT121|SGPT122|SGPT123|SGPT111|SGPT112|SGPT113|SGPT131|SGPT132|SGPT133|SGPT211|SGPT212|SGPT213|SGP311|SGP312|SGP321|EBRD1101|EBRD1102|EBRD1201|SGP351|SGP341|SGP511|SGP512|SGP521|SGP541|SGP551|SGP621|SGP612|SOT31",
				PhilipsTablet: "\\b(PI2010|PI3000|PI3100|PI3105|PI3110|PI3205|PI3210|PI3900|PI4010|PI7000|PI7100)\\b",
				CubeTablet: "Android.*(K8GT|U9GT|U10GT|U16GT|U17GT|U18GT|U19GT|U20GT|U23GT|U30GT)|CUBE U8GT",
				CobyTablet: "MID1042|MID1045|MID1125|MID1126|MID7012|MID7014|MID7015|MID7034|MID7035|MID7036|MID7042|MID7048|MID7127|MID8042|MID8048|MID8127|MID9042|MID9740|MID9742|MID7022|MID7010",
				MIDTablet: "M9701|M9000|M9100|M806|M1052|M806|T703|MID701|MID713|MID710|MID727|MID760|MID830|MID728|MID933|MID125|MID810|MID732|MID120|MID930|MID800|MID731|MID900|MID100|MID820|MID735|MID980|MID130|MID833|MID737|MID960|MID135|MID860|MID736|MID140|MID930|MID835|MID733",
				MSITablet: "MSI \\b(Primo 73K|Primo 73L|Primo 81L|Primo 77|Primo 93|Primo 75|Primo 76|Primo 73|Primo 81|Primo 91|Primo 90|Enjoy 71|Enjoy 7|Enjoy 10)\\b",
				SMiTTablet: "Android.*(\\bMID\\b|MID-560|MTV-T1200|MTV-PND531|MTV-P1101|MTV-PND530)",
				RockChipTablet: "Android.*(RK2818|RK2808A|RK2918|RK3066)|RK2738|RK2808A",
				FlyTablet: "IQ310|Fly Vision",
				bqTablet: "Android.*(bq)?.*(Elcano|Curie|Edison|Maxwell|Kepler|Pascal|Tesla|Hypatia|Platon|Newton|Livingstone|Cervantes|Avant|Aquaris E10)|Maxwell.*Lite|Maxwell.*Plus",
				HuaweiTablet: "MediaPad|MediaPad 7 Youth|IDEOS S7|S7-201c|S7-202u|S7-101|S7-103|S7-104|S7-105|S7-106|S7-201|S7-Slim",
				NecTablet: "\\bN-06D|\\bN-08D",
				PantechTablet: "Pantech.*P4100",
				BronchoTablet: "Broncho.*(N701|N708|N802|a710)",
				VersusTablet: "TOUCHPAD.*[78910]|\\bTOUCHTAB\\b",
				ZyncTablet: "z1000|Z99 2G|z99|z930|z999|z990|z909|Z919|z900",
				PositivoTablet: "TB07STA|TB10STA|TB07FTA|TB10FTA",
				NabiTablet: "Android.*\\bNabi",
				KoboTablet: "Kobo Touch|\\bK080\\b|\\bVox\\b Build|\\bArc\\b Build",
				DanewTablet: "DSlide.*\\b(700|701R|702|703R|704|802|970|971|972|973|974|1010|1012)\\b",
				TexetTablet: "NaviPad|TB-772A|TM-7045|TM-7055|TM-9750|TM-7016|TM-7024|TM-7026|TM-7041|TM-7043|TM-7047|TM-8041|TM-9741|TM-9747|TM-9748|TM-9751|TM-7022|TM-7021|TM-7020|TM-7011|TM-7010|TM-7023|TM-7025|TM-7037W|TM-7038W|TM-7027W|TM-9720|TM-9725|TM-9737W|TM-1020|TM-9738W|TM-9740|TM-9743W|TB-807A|TB-771A|TB-727A|TB-725A|TB-719A|TB-823A|TB-805A|TB-723A|TB-715A|TB-707A|TB-705A|TB-709A|TB-711A|TB-890HD|TB-880HD|TB-790HD|TB-780HD|TB-770HD|TB-721HD|TB-710HD|TB-434HD|TB-860HD|TB-840HD|TB-760HD|TB-750HD|TB-740HD|TB-730HD|TB-722HD|TB-720HD|TB-700HD|TB-500HD|TB-470HD|TB-431HD|TB-430HD|TB-506|TB-504|TB-446|TB-436|TB-416|TB-146SE|TB-126SE",
				PlaystationTablet: "Playstation.*(Portable|Vita)",
				TrekstorTablet: "ST10416-1|VT10416-1|ST70408-1|ST702xx-1|ST702xx-2|ST80208|ST97216|ST70104-2|VT10416-2|ST10216-2A|SurfTab",
				PyleAudioTablet: "\\b(PTBL10CEU|PTBL10C|PTBL72BC|PTBL72BCEU|PTBL7CEU|PTBL7C|PTBL92BC|PTBL92BCEU|PTBL9CEU|PTBL9CUK|PTBL9C)\\b",
				AdvanTablet: "Android.* \\b(E3A|T3X|T5C|T5B|T3E|T3C|T3B|T1J|T1F|T2A|T1H|T1i|E1C|T1-E|T5-A|T4|E1-B|T2Ci|T1-B|T1-D|O1-A|E1-A|T1-A|T3A|T4i)\\b ",
				DanyTechTablet: "Genius Tab G3|Genius Tab S2|Genius Tab Q3|Genius Tab G4|Genius Tab Q4|Genius Tab G-II|Genius TAB GII|Genius TAB GIII|Genius Tab S1",
				GalapadTablet: "Android.*\\bG1\\b",
				MicromaxTablet: "Funbook|Micromax.*\\b(P250|P560|P360|P362|P600|P300|P350|P500|P275)\\b",
				KarbonnTablet: "Android.*\\b(A39|A37|A34|ST8|ST10|ST7|Smart Tab3|Smart Tab2)\\b",
				AllFineTablet: "Fine7 Genius|Fine7 Shine|Fine7 Air|Fine8 Style|Fine9 More|Fine10 Joy|Fine11 Wide",
				PROSCANTablet: "\\b(PEM63|PLT1023G|PLT1041|PLT1044|PLT1044G|PLT1091|PLT4311|PLT4311PL|PLT4315|PLT7030|PLT7033|PLT7033D|PLT7035|PLT7035D|PLT7044K|PLT7045K|PLT7045KB|PLT7071KG|PLT7072|PLT7223G|PLT7225G|PLT7777G|PLT7810K|PLT7849G|PLT7851G|PLT7852G|PLT8015|PLT8031|PLT8034|PLT8036|PLT8080K|PLT8082|PLT8088|PLT8223G|PLT8234G|PLT8235G|PLT8816K|PLT9011|PLT9045K|PLT9233G|PLT9735|PLT9760G|PLT9770G)\\b",
				YONESTablet: "BQ1078|BC1003|BC1077|RK9702|BC9730|BC9001|IT9001|BC7008|BC7010|BC708|BC728|BC7012|BC7030|BC7027|BC7026",
				ChangJiaTablet: "TPC7102|TPC7103|TPC7105|TPC7106|TPC7107|TPC7201|TPC7203|TPC7205|TPC7210|TPC7708|TPC7709|TPC7712|TPC7110|TPC8101|TPC8103|TPC8105|TPC8106|TPC8203|TPC8205|TPC8503|TPC9106|TPC9701|TPC97101|TPC97103|TPC97105|TPC97106|TPC97111|TPC97113|TPC97203|TPC97603|TPC97809|TPC97205|TPC10101|TPC10103|TPC10106|TPC10111|TPC10203|TPC10205|TPC10503",
				GUTablet: "TX-A1301|TX-M9002|Q702|kf026",
				PointOfViewTablet: "TAB-P506|TAB-navi-7-3G-M|TAB-P517|TAB-P-527|TAB-P701|TAB-P703|TAB-P721|TAB-P731N|TAB-P741|TAB-P825|TAB-P905|TAB-P925|TAB-PR945|TAB-PL1015|TAB-P1025|TAB-PI1045|TAB-P1325|TAB-PROTAB[0-9]+|TAB-PROTAB25|TAB-PROTAB26|TAB-PROTAB27|TAB-PROTAB26XL|TAB-PROTAB2-IPS9|TAB-PROTAB30-IPS9|TAB-PROTAB25XXL|TAB-PROTAB26-IPS10|TAB-PROTAB30-IPS10",
				OvermaxTablet: "OV-(SteelCore|NewBase|Basecore|Baseone|Exellen|Quattor|EduTab|Solution|ACTION|BasicTab|TeddyTab|MagicTab|Stream|TB-08|TB-09)",
				HCLTablet: "HCL.*Tablet|Connect-3G-2.0|Connect-2G-2.0|ME Tablet U1|ME Tablet U2|ME Tablet G1|ME Tablet X1|ME Tablet Y2|ME Tablet Sync",
				DPSTablet: "DPS Dream 9|DPS Dual 7",
				VistureTablet: "V97 HD|i75 3G|Visture V4( HD)?|Visture V5( HD)?|Visture V10",
				CrestaTablet: "CTP(-)?810|CTP(-)?818|CTP(-)?828|CTP(-)?838|CTP(-)?888|CTP(-)?978|CTP(-)?980|CTP(-)?987|CTP(-)?988|CTP(-)?989",
				MediatekTablet: "\\bMT8125|MT8389|MT8135|MT8377\\b",
				ConcordeTablet: "Concorde([ ]+)?Tab|ConCorde ReadMan",
				GoCleverTablet: "GOCLEVER TAB|A7GOCLEVER|M1042|M7841|M742|R1042BK|R1041|TAB A975|TAB A7842|TAB A741|TAB A741L|TAB M723G|TAB M721|TAB A1021|TAB I921|TAB R721|TAB I720|TAB T76|TAB R70|TAB R76.2|TAB R106|TAB R83.2|TAB M813G|TAB I721|GCTA722|TAB I70|TAB I71|TAB S73|TAB R73|TAB R74|TAB R93|TAB R75|TAB R76.1|TAB A73|TAB A93|TAB A93.2|TAB T72|TAB R83|TAB R974|TAB R973|TAB A101|TAB A103|TAB A104|TAB A104.2|R105BK|M713G|A972BK|TAB A971|TAB R974.2|TAB R104|TAB R83.3|TAB A1042",
				ModecomTablet: "FreeTAB 9000|FreeTAB 7.4|FreeTAB 7004|FreeTAB 7800|FreeTAB 2096|FreeTAB 7.5|FreeTAB 1014|FreeTAB 1001 |FreeTAB 8001|FreeTAB 9706|FreeTAB 9702|FreeTAB 7003|FreeTAB 7002|FreeTAB 1002|FreeTAB 7801|FreeTAB 1331|FreeTAB 1004|FreeTAB 8002|FreeTAB 8014|FreeTAB 9704|FreeTAB 1003",
				VoninoTablet: "\\b(Argus[ _]?S|Diamond[ _]?79HD|Emerald[ _]?78E|Luna[ _]?70C|Onyx[ _]?S|Onyx[ _]?Z|Orin[ _]?HD|Orin[ _]?S|Otis[ _]?S|SpeedStar[ _]?S|Magnet[ _]?M9|Primus[ _]?94[ _]?3G|Primus[ _]?94HD|Primus[ _]?QS|Android.*\\bQ8\\b|Sirius[ _]?EVO[ _]?QS|Sirius[ _]?QS|Spirit[ _]?S)\\b",
				ECSTablet: "V07OT2|TM105A|S10OT1|TR10CS1",
				StorexTablet: "eZee[_']?(Tab|Go)[0-9]+|TabLC7|Looney Tunes Tab",
				VodafoneTablet: "SmartTab([ ]+)?[0-9]+|SmartTabII10|SmartTabII7",
				EssentielBTablet: "Smart[ ']?TAB[ ]+?[0-9]+|Family[ ']?TAB2",
				RossMoorTablet: "RM-790|RM-997|RMD-878G|RMD-974R|RMT-705A|RMT-701|RME-601|RMT-501|RMT-711",
				iMobileTablet: "i-mobile i-note",
				TolinoTablet: "tolino tab [0-9.]+|tolino shine",
				AudioSonicTablet: "\\bC-22Q|T7-QC|T-17B|T-17P\\b",
				AMPETablet: "Android.* A78 ",
				SkkTablet: "Android.* (SKYPAD|PHOENIX|CYCLOPS)",
				TecnoTablet: "TECNO P9",
				JXDTablet: "Android.*\\b(F3000|A3300|JXD5000|JXD3000|JXD2000|JXD300B|JXD300|S5800|S7800|S602b|S5110b|S7300|S5300|S602|S603|S5100|S5110|S601|S7100a|P3000F|P3000s|P101|P200s|P1000m|P200m|P9100|P1000s|S6600b|S908|P1000|P300|S18|S6600|S9100)\\b",
				iJoyTablet: "Tablet (Spirit 7|Essentia|Galatea|Fusion|Onix 7|Landa|Titan|Scooby|Deox|Stella|Themis|Argon|Unique 7|Sygnus|Hexen|Finity 7|Cream|Cream X2|Jade|Neon 7|Neron 7|Kandy|Scape|Saphyr 7|Rebel|Biox|Rebel|Rebel 8GB|Myst|Draco 7|Myst|Tab7-004|Myst|Tadeo Jones|Tablet Boing|Arrow|Draco Dual Cam|Aurix|Mint|Amity|Revolution|Finity 9|Neon 9|T9w|Amity 4GB Dual Cam|Stone 4GB|Stone 8GB|Andromeda|Silken|X2|Andromeda II|Halley|Flame|Saphyr 9,7|Touch 8|Planet|Triton|Unique 10|Hexen 10|Memphis 4GB|Memphis 8GB|Onix 10)",
				FX2Tablet: "FX2 PAD7|FX2 PAD10",
				XoroTablet: "KidsPAD 701|PAD[ ]?712|PAD[ ]?714|PAD[ ]?716|PAD[ ]?717|PAD[ ]?718|PAD[ ]?720|PAD[ ]?721|PAD[ ]?722|PAD[ ]?790|PAD[ ]?792|PAD[ ]?900|PAD[ ]?9715D|PAD[ ]?9716DR|PAD[ ]?9718DR|PAD[ ]?9719QR|PAD[ ]?9720QR|TelePAD1030|Telepad1032|TelePAD730|TelePAD731|TelePAD732|TelePAD735Q|TelePAD830|TelePAD9730|TelePAD795|MegaPAD 1331|MegaPAD 1851|MegaPAD 2151",
				ViewsonicTablet: "ViewPad 10pi|ViewPad 10e|ViewPad 10s|ViewPad E72|ViewPad7|ViewPad E100|ViewPad 7e|ViewSonic VB733|VB100a",
				OdysTablet: "LOOX|XENO10|ODYS[ -](Space|EVO|Xpress|NOON)|\\bXELIO\\b|Xelio10Pro|XELIO7PHONETAB|XELIO10EXTREME|XELIOPT2|NEO_QUAD10",
				CaptivaTablet: "CAPTIVA PAD",
				IconbitTablet: "NetTAB|NT-3702|NT-3702S|NT-3702S|NT-3603P|NT-3603P|NT-0704S|NT-0704S|NT-3805C|NT-3805C|NT-0806C|NT-0806C|NT-0909T|NT-0909T|NT-0907S|NT-0907S|NT-0902S|NT-0902S",
				TeclastTablet: "T98 4G|\\bP80\\b|\\bX90HD\\b|X98 Air|X98 Air 3G|\\bX89\\b|P80 3G|\\bX80h\\b|P98 Air|\\bX89HD\\b|P98 3G|\\bP90HD\\b|P89 3G|X98 3G|\\bP70h\\b|P79HD 3G|G18d 3G|\\bP79HD\\b|\\bP89s\\b|\\bA88\\b|\\bP10HD\\b|\\bP19HD\\b|G18 3G|\\bP78HD\\b|\\bA78\\b|\\bP75\\b|G17s 3G|G17h 3G|\\bP85t\\b|\\bP90\\b|\\bP11\\b|\\bP98t\\b|\\bP98HD\\b|\\bG18d\\b|\\bP85s\\b|\\bP11HD\\b|\\bP88s\\b|\\bA80HD\\b|\\bA80se\\b|\\bA10h\\b|\\bP89\\b|\\bP78s\\b|\\bG18\\b|\\bP85\\b|\\bA70h\\b|\\bA70\\b|\\bG17\\b|\\bP18\\b|\\bA80s\\b|\\bA11s\\b|\\bP88HD\\b|\\bA80h\\b|\\bP76s\\b|\\bP76h\\b|\\bP98\\b|\\bA10HD\\b|\\bP78\\b|\\bP88\\b|\\bA11\\b|\\bA10t\\b|\\bP76a\\b|\\bP76t\\b|\\bP76e\\b|\\bP85HD\\b|\\bP85a\\b|\\bP86\\b|\\bP75HD\\b|\\bP76v\\b|\\bA12\\b|\\bP75a\\b|\\bA15\\b|\\bP76Ti\\b|\\bP81HD\\b|\\bA10\\b|\\bT760VE\\b|\\bT720HD\\b|\\bP76\\b|\\bP73\\b|\\bP71\\b|\\bP72\\b|\\bT720SE\\b|\\bC520Ti\\b|\\bT760\\b|\\bT720VE\\b|T720-3GE|T720-WiFi",
				OndaTablet: "\\b(V975i|Vi30|VX530|V701|Vi60|V701s|Vi50|V801s|V719|Vx610w|VX610W|V819i|Vi10|VX580W|Vi10|V711s|V813|V811|V820w|V820|Vi20|V711|VI30W|V712|V891w|V972|V819w|V820w|Vi60|V820w|V711|V813s|V801|V819|V975s|V801|V819|V819|V818|V811|V712|V975m|V101w|V961w|V812|V818|V971|V971s|V919|V989|V116w|V102w|V973|Vi40)\\b[\\s]+",
				JaytechTablet: "TPC-PA762",
				BlaupunktTablet: "Endeavour 800NG|Endeavour 1010",
				DigmaTablet: "\\b(iDx10|iDx9|iDx8|iDx7|iDxD7|iDxD8|iDsQ8|iDsQ7|iDsQ8|iDsD10|iDnD7|3TS804H|iDsQ11|iDj7|iDs10)\\b",
				EvolioTablet: "ARIA_Mini_wifi|Aria[ _]Mini|Evolio X10|Evolio X7|Evolio X8|\\bEvotab\\b|\\bNeura\\b",
				LavaTablet: "QPAD E704|\\bIvoryS\\b|E-TAB IVORY|\\bE-TAB\\b",
				CelkonTablet: "CT695|CT888|CT[\\s]?910|CT7 Tab|CT9 Tab|CT3 Tab|CT2 Tab|CT1 Tab|C820|C720|\\bCT-1\\b",
				WolderTablet: "miTab \\b(DIAMOND|SPACE|BROOKLYN|NEO|FLY|MANHATTAN|FUNK|EVOLUTION|SKY|GOCAR|IRON|GENIUS|POP|MINT|EPSILON|BROADWAY|JUMP|HOP|LEGEND|NEW AGE|LINE|ADVANCE|FEEL|FOLLOW|LIKE|LINK|LIVE|THINK|FREEDOM|CHICAGO|CLEVELAND|BALTIMORE-GH|IOWA|BOSTON|SEATTLE|PHOENIX|DALLAS|IN 101|MasterChef)\\b",
				MiTablet: "\\bMI PAD\\b|\\bHM NOTE 1W\\b",
				NibiruTablet: "Nibiru M1|Nibiru Jupiter One",
				NexoTablet: "NEXO NOVA|NEXO 10|NEXO AVIO|NEXO FREE|NEXO GO|NEXO EVO|NEXO 3G|NEXO SMART|NEXO KIDDO|NEXO MOBI",
				LeaderTablet: "TBLT10Q|TBLT10I|TBL-10WDKB|TBL-10WDKBO2013|TBL-W230V2|TBL-W450|TBL-W500|SV572|TBLT7I|TBA-AC7-8G|TBLT79|TBL-8W16|TBL-10W32|TBL-10WKB|TBL-W100",
				UbislateTablet: "UbiSlate[\\s]?7C",
				PocketBookTablet: "Pocketbook",
				Hudl: "Hudl HT7S3",
				TelstraTablet: "T-Hub2",
				GenericTablet: "Android.*\\b97D\\b|Tablet(?!.*PC)|BNTV250A|MID-WCDMA|LogicPD Zoom2|\\bA7EB\\b|CatNova8|A1_07|CT704|CT1002|\\bM721\\b|rk30sdk|\\bEVOTAB\\b|M758A|ET904|ALUMIUM10|Smartfren Tab|Endeavour 1010|Tablet-PC-4|Tagi Tab|\\bM6pro\\b|CT1020W|arc 10HD|\\bJolla\\b|\\bTP750\\b"
			},
			oss: {
				AndroidOS: "Android",
				BlackBerryOS: "blackberry|\\bBB10\\b|rim tablet os",
				PalmOS: "PalmOS|avantgo|blazer|elaine|hiptop|palm|plucker|xiino",
				SymbianOS: "Symbian|SymbOS|Series60|Series40|SYB-[0-9]+|\\bS60\\b",
				WindowsMobileOS: "Windows CE.*(PPC|Smartphone|Mobile|[0-9]{3}x[0-9]{3})|Window Mobile|Windows Phone [0-9.]+|WCE;",
				WindowsPhoneOS: "Windows Phone 8.1|Windows Phone 8.0|Windows Phone OS|XBLWP7|ZuneWP7|Windows NT 6.[23]; ARM;",
				iOS: "\\biPhone.*Mobile|\\biPod|\\biPad",
				MeeGoOS: "MeeGo",
				MaemoOS: "Maemo",
				JavaOS: "J2ME/|\\bMIDP\\b|\\bCLDC\\b",
				webOS: "webOS|hpwOS",
				badaOS: "\\bBada\\b",
				BREWOS: "BREW"
			},
			uas: {
				Chrome: "\\bCrMo\\b|CriOS|Android.*Chrome/[.0-9]* (Mobile)?",
				Dolfin: "\\bDolfin\\b",
				Opera: "Opera.*Mini|Opera.*Mobi|Android.*Opera|Mobile.*OPR/[0-9.]+|Coast/[0-9.]+",
				Skyfire: "Skyfire",
				IE: "IEMobile|MSIEMobile",
				Firefox: "fennec|firefox.*maemo|(Mobile|Tablet).*Firefox|Firefox.*Mobile",
				Bolt: "bolt",
				TeaShark: "teashark",
				Blazer: "Blazer",
				Safari: "Version.*Mobile.*Safari|Safari.*Mobile|MobileSafari",
				Tizen: "Tizen",
				UCBrowser: "UC.*Browser|UCWEB",
				baiduboxapp: "baiduboxapp",
				baidubrowser: "baidubrowser",
				DiigoBrowser: "DiigoBrowser",
				Puffin: "Puffin",
				Mercury: "\\bMercury\\b",
				ObigoBrowser: "Obigo",
				NetFront: "NF-Browser",
				GenericBrowser: "NokiaBrowser|OviBrowser|OneBrowser|TwonkyBeamBrowser|SEMC.*Browser|FlyFlow|Minimo|NetFront|Novarra-Vision|MQQBrowser|MicroMessenger"
			},
			props: {
				Mobile: "Mobile/[VER]",
				Build: "Build/[VER]",
				Version: "Version/[VER]",
				VendorID: "VendorID/[VER]",
				iPad: "iPad.*CPU[a-z ]+[VER]",
				iPhone: "iPhone.*CPU[a-z ]+[VER]",
				iPod: "iPod.*CPU[a-z ]+[VER]",
				Kindle: "Kindle/[VER]",
				Chrome: ["Chrome/[VER]", "CriOS/[VER]", "CrMo/[VER]"],
				Coast: ["Coast/[VER]"],
				Dolfin: "Dolfin/[VER]",
				Firefox: "Firefox/[VER]",
				Fennec: "Fennec/[VER]",
				IE: ["IEMobile/[VER];", "IEMobile [VER]", "MSIE [VER];", "Trident/[0-9.]+;.*rv:[VER]"],
				NetFront: "NetFront/[VER]",
				NokiaBrowser: "NokiaBrowser/[VER]",
				Opera: [" OPR/[VER]", "Opera Mini/[VER]", "Version/[VER]"],
				"Opera Mini": "Opera Mini/[VER]",
				"Opera Mobi": "Version/[VER]",
				"UC Browser": "UC Browser[VER]",
				MQQBrowser: "MQQBrowser/[VER]",
				MicroMessenger: "MicroMessenger/[VER]",
				baiduboxapp: "baiduboxapp/[VER]",
				baidubrowser: "baidubrowser/[VER]",
				Iron: "Iron/[VER]",
				Safari: ["Version/[VER]", "Safari/[VER]"],
				Skyfire: "Skyfire/[VER]",
				Tizen: "Tizen/[VER]",
				Webkit: "webkit[ /][VER]",
				Gecko: "Gecko/[VER]",
				Trident: "Trident/[VER]",
				Presto: "Presto/[VER]",
				iOS: " \\bi?OS\\b [VER][ ;]{1}",
				Android: "Android [VER]",
				BlackBerry: ["BlackBerry[\\w]+/[VER]", "BlackBerry.*Version/[VER]", "Version/[VER]"],
				BREW: "BREW [VER]",
				Java: "Java/[VER]",
				"Windows Phone OS": ["Windows Phone OS [VER]", "Windows Phone [VER]"],
				"Windows Phone": "Windows Phone [VER]",
				"Windows CE": "Windows CE/[VER]",
				"Windows NT": "Windows NT [VER]",
				Symbian: ["SymbianOS/[VER]", "Symbian/[VER]"],
				webOS: ["webOS/[VER]", "hpwOS/[VER];"]
			},
			utils: {
				Bot: "Googlebot|facebookexternalhit|AdsBot-Google|Google Keyword Suggestion|Facebot|YandexBot|bingbot|ia_archiver|AhrefsBot|Ezooms|GSLFbot|WBSearchBot|Twitterbot|TweetmemeBot|Twikle|PaperLiBot|Wotbox|UnwindFetchor|Exabot|MJ12bot|YandexImages|TurnitinBot|Pingdom",
				MobileBot: "Googlebot-Mobile|AdsBot-Google-Mobile|YahooSeeker/M1A1-R2D2",
				DesktopMode: "WPDesktop",
				TV: "SonyDTV|HbbTV",
				WebKit: "(webkit)[ /]([\\w.]+)",
				Console: "\\b(Nintendo|Nintendo WiiU|Nintendo 3DS|PLAYSTATION|Xbox)\\b",
				Watch: "SM-V700"
			}
		}, r.detectMobileBrowsers = {
			fullPattern: /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,
			shortPattern: /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,
			tabletPattern: /android|ipad|playbook|silk/i
		};
		var a, s = Object.prototype.hasOwnProperty;
		return r.FALLBACK_PHONE = "UnknownPhone", r.FALLBACK_TABLET = "UnknownTablet", r.FALLBACK_MOBILE = "UnknownMobile", a = "isArray" in Array ? Array.isArray : function (e) {
				return "[object Array]" === Object.prototype.toString.call(e)
			},
			function () {
				var e, t, i, o, T, l, u = r.mobileDetectRules;
				for (e in u.props)
					if (s.call(u.props, e)) {
						for (t = u.props[e], a(t) || (t = [t]), T = t.length, o = 0; T > o; ++o) i = t[o], l = i.indexOf("[VER]"), l >= 0 && (i = i.substring(0, l) + "([\\w._\\+]+)" + i.substring(l + 5)), t[o] = new RegExp(i, "i");
						u.props[e] = t
					} n(u.oss), n(u.phones), n(u.tablets), n(u.uas), n(u.utils), u.oss0 = {
					WindowsPhoneOS: u.oss.WindowsPhoneOS,
					WindowsMobileOS: u.oss.WindowsMobileOS
				}
			}(), r.findMatch = function (e, t) {
				for (var i in e)
					if (s.call(e, i) && e[i].test(t)) return i;
				return null
			}, r.findMatches = function (e, t) {
				var i = [];
				for (var n in e) s.call(e, n) && e[n].test(t) && i.push(n);
				return i
			}, r.getVersionStr = function (e, t) {
				var i, n, o, a, T = r.mobileDetectRules.props;
				if (s.call(T, e))
					for (i = T[e], o = i.length, n = 0; o > n; ++n)
						if (a = i[n].exec(t), null !== a) return a[1];
				return null
			}, r.getVersion = function (e, t) {
				var i = r.getVersionStr(e, t);
				return i ? r.prepareVersionNo(i) : NaN
			}, r.prepareVersionNo = function (e) {
				var t;
				return t = e.split(/[a-z._ \/\-]/i), 1 === t.length && (e = t[0]), t.length > 1 && (e = t[0] + ".", t.shift(), e += t.join("")), Number(e)
			}, r.isMobileFallback = function (e) {
				return r.detectMobileBrowsers.fullPattern.test(e) || r.detectMobileBrowsers.shortPattern.test(e.substr(0, 4))
			}, r.isTabletFallback = function (e) {
				return r.detectMobileBrowsers.tabletPattern.test(e)
			}, r.prepareDetectionCache = function (e, i, n) {
				if (e.mobile === t) {
					var a, s, T;
					return (s = r.findMatch(r.mobileDetectRules.tablets, i)) ? (e.mobile = e.tablet = s, void(e.phone = null)) : (a = r.findMatch(r.mobileDetectRules.phones, i)) ? (e.mobile = e.phone = a, void(e.tablet = null)) : void(r.isMobileFallback(i) ? (T = o.isPhoneSized(n), T === t ? (e.mobile = r.FALLBACK_MOBILE, e.tablet = e.phone = null) : T ? (e.mobile = e.phone = r.FALLBACK_PHONE, e.tablet = null) : (e.mobile = e.tablet = r.FALLBACK_TABLET, e.phone = null)) : r.isTabletFallback(i) ? (e.mobile = e.tablet = r.FALLBACK_TABLET, e.phone = null) : e.mobile = e.tablet = e.phone = null)
				}
			}, r.mobileGrade = function (e) {
				var t = null !== e.mobile();
				return e.os("iOS") && e.version("iPad") >= 4.3 || e.os("iOS") && e.version("iPhone") >= 3.1 || e.os("iOS") && e.version("iPod") >= 3.1 || e.version("Android") > 2.1 && e.is("Webkit") || e.version("Windows Phone OS") >= 7 || e.is("BlackBerry") && e.version("BlackBerry") >= 6 || e.match("Playbook.*Tablet") || e.version("webOS") >= 1.4 && e.match("Palm|Pre|Pixi") || e.match("hp.*TouchPad") || e.is("Firefox") && e.version("Firefox") >= 12 || e.is("Chrome") && e.is("AndroidOS") && e.version("Android") >= 4 || e.is("Skyfire") && e.version("Skyfire") >= 4.1 && e.is("AndroidOS") && e.version("Android") >= 2.3 || e.is("Opera") && e.version("Opera Mobi") > 11 && e.is("AndroidOS") || e.is("MeeGoOS") || e.is("Tizen") || e.is("Dolfin") && e.version("Bada") >= 2 || (e.is("UC Browser") || e.is("Dolfin")) && e.version("Android") >= 2.3 || e.match("Kindle Fire") || e.is("Kindle") && e.version("Kindle") >= 3 || e.is("AndroidOS") && e.is("NookTablet") || e.version("Chrome") >= 11 && !t || e.version("Safari") >= 5 && !t || e.version("Firefox") >= 4 && !t || e.version("MSIE") >= 7 && !t || e.version("Opera") >= 10 && !t ? "A" : e.os("iOS") && e.version("iPad") < 4.3 || e.os("iOS") && e.version("iPhone") < 3.1 || e.os("iOS") && e.version("iPod") < 3.1 || e.is("Blackberry") && e.version("BlackBerry") >= 5 && e.version("BlackBerry") < 6 || e.version("Opera Mini") >= 5 && e.version("Opera Mini") <= 6.5 && (e.version("Android") >= 2.3 || e.is("iOS")) || e.match("NokiaN8|NokiaC7|N97.*Series60|Symbian/3") || e.version("Opera Mobi") >= 11 && e.is("SymbianOS") ? "B" : (e.version("BlackBerry") < 5 || e.match("MSIEMobile|Windows CE.*Mobile") || e.version("Windows Mobile") <= 5.2, "C")
			}, r.detectOS = function (e) {
				return r.findMatch(r.mobileDetectRules.oss0, e) || r.findMatch(r.mobileDetectRules.oss, e)
			}, r.getDeviceSmallerSide = function () {
				return window.screen.width < window.screen.height ? window.screen.width : window.screen.height
			}, o.prototype = {
				constructor: o,
				mobile: function () {
					return r.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth), this._cache.mobile
				},
				phone: function () {
					return r.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth), this._cache.phone
				},
				tablet: function () {
					return r.prepareDetectionCache(this._cache, this.ua, this.maxPhoneWidth), this._cache.tablet
				},
				userAgent: function () {
					return this._cache.userAgent === t && (this._cache.userAgent = r.findMatch(r.mobileDetectRules.uas, this.ua)), this._cache.userAgent
				},
				userAgents: function () {
					return this._cache.userAgents === t && (this._cache.userAgents = r.findMatches(r.mobileDetectRules.uas, this.ua)), this._cache.userAgents
				},
				os: function () {
					return this._cache.os === t && (this._cache.os = r.detectOS(this.ua)), this._cache.os
				},
				version: function (e) {
					return r.getVersion(e, this.ua)
				},
				versionStr: function (e) {
					return r.getVersionStr(e, this.ua)
				},
				is: function (t) {
					return i(this.userAgents(), t) || e(t, this.os()) || e(t, this.phone()) || e(t, this.tablet()) || i(r.findMatches(r.mobileDetectRules.utils, this.ua), t)
				},
				match: function (e) {
					return e instanceof RegExp || (e = new RegExp(e, "i")), e.test(this.ua)
				},
				isPhoneSized: function (e) {
					return o.isPhoneSized(e || this.maxPhoneWidth)
				},
				mobileGrade: function () {
					return this._cache.grade === t && (this._cache.grade = r.mobileGrade(this)), this._cache.grade
				}
			}, "undefined" != typeof window && window.screen ? o.isPhoneSized = function (e) {
				return 0 > e ? t : r.getDeviceSmallerSide() <= e
			} : o.isPhoneSized = function () {}, o._impl = r, o
	})
}(function (e) {
	return function (e) {
		window.MobileDetect = e()
	}
}()), N2D("ImagesLoaded", function (e, t) {
	var i = {};
	(function () {
		"use strict";

		function e() {}

		function t(e, t) {
			for (var i = e.length; i--;)
				if (e[i].listener === t) return i;
			return -1
		}

		function n(e) {
			return function () {
				return this[e].apply(this, arguments)
			}
		}
		var o = e.prototype,
			r = this,
			a = r.EventEmitter;
		o.getListeners = function (e) {
			var t, i, n = this._getEvents();
			if ("object" == typeof e) {
				t = {};
				for (i in n) n.hasOwnProperty(i) && e.test(i) && (t[i] = n[i])
			} else t = n[e] || (n[e] = []);
			return t
		}, o.flattenListeners = function (e) {
			var t, i = [];
			for (t = 0; t < e.length; t += 1) i.push(e[t].listener);
			return i
		}, o.getListenersAsObject = function (e) {
			var t, i = this.getListeners(e);
			return i instanceof Array && (t = {}, t[e] = i), t || i
		}, o.addListener = function (e, i) {
			var n, o = this.getListenersAsObject(e),
				r = "object" == typeof i;
			for (n in o) o.hasOwnProperty(n) && -1 === t(o[n], i) && o[n].push(r ? i : {
				listener: i,
				once: !1
			});
			return this
		}, o.on = n("addListener"), o.addOnceListener = function (e, t) {
			return this.addListener(e, {
				listener: t,
				once: !0
			})
		}, o.once = n("addOnceListener"), o.defineEvent = function (e) {
			return this.getListeners(e), this
		}, o.defineEvents = function (e) {
			for (var t = 0; t < e.length; t += 1) this.defineEvent(e[t]);
			return this
		}, o.removeListener = function (e, i) {
			var n, o, r = this.getListenersAsObject(e);
			for (o in r) r.hasOwnProperty(o) && (n = t(r[o], i), -1 !== n && r[o].splice(n, 1));
			return this
		}, o.off = n("removeListener"), o.addListeners = function (e, t) {
			return this.manipulateListeners(!1, e, t)
		}, o.removeListeners = function (e, t) {
			return this.manipulateListeners(!0, e, t)
		}, o.manipulateListeners = function (e, t, i) {
			var n, o, r = e ? this.removeListener : this.addListener,
				a = e ? this.removeListeners : this.addListeners;
			if ("object" != typeof t || t instanceof RegExp)
				for (n = i.length; n--;) r.call(this, t, i[n]);
			else
				for (n in t) t.hasOwnProperty(n) && (o = t[n]) && ("function" == typeof o ? r.call(this, n, o) : a.call(this, n, o));
			return this
		}, o.removeEvent = function (e) {
			var t, i = typeof e,
				n = this._getEvents();
			if ("string" === i) delete n[e];
			else if ("object" === i)
				for (t in n) n.hasOwnProperty(t) && e.test(t) && delete n[t];
			else delete this._events;
			return this
		}, o.removeAllListeners = n("removeEvent"), o.emitEvent = function (e, t) {
			var i, n, o, r, a = this.getListenersAsObject(e);
			for (o in a)
				if (a.hasOwnProperty(o))
					for (n = a[o].length; n--;) i = a[o][n], i.once === !0 && this.removeListener(e, i.listener), r = i.listener.apply(this, t || []), r === this._getOnceReturnValue() && this.removeListener(e, i.listener);
			return this
		}, o.trigger = n("emitEvent"), o.emit = function (e) {
			var t = Array.prototype.slice.call(arguments, 1);
			return this.emitEvent(e, t)
		}, o.setOnceReturnValue = function (e) {
			return this._onceReturnValue = e, this
		}, o._getOnceReturnValue = function () {
			return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
		}, o._getEvents = function () {
			return this._events || (this._events = {})
		}, e.noConflict = function () {
			return r.EventEmitter = a, e
		}, i.EventEmitter = e
	}).call(window),
		function (e) {
			function n(t) {
				var i = e.event;
				return i.target = i.target || i.srcElement || t, i
			}
			var o = document.documentElement,
				r = function () {};
			o.addEventListener ? r = function (e, t, i) {
				e.addEventListener(t, i, !1)
			} : o.attachEvent && (r = function (e, t, i) {
				e[t + i] = i.handleEvent ? function () {
					var t = n(e);
					i.handleEvent.call(i, t)
				} : function () {
					var t = n(e);
					i.call(e, t)
				}, e.attachEvent("on" + t, e[t + i])
			});
			var a = function () {};
			o.removeEventListener ? a = function (e, t, i) {
				e.removeEventListener(t, i, !1)
			} : o.detachEvent && (a = function (e, i, n) {
				e.detachEvent("on" + i, e[i + n]);
				try {
					delete e[i + n]
				} catch (o) {
					e[i + n] = t
				}
			});
			var s = {
				bind: r,
				unbind: a
			};
			i.eventie = s
		}(window),
		function (e, t) {
			"use strict";
			t(e, i.EventEmitter, i.eventie)
		}(window, function (i, n, o) {
			function r(e, t) {
				for (var i in t) e[i] = t[i];
				return e
			}

			function a(e) {
				return "[object Array]" == h.call(e)
			}

			function s(e) {
				var t = [];
				if (a(e)) t = e;
				else if ("number" == typeof e.length)
					for (var i = 0; i < e.length; i++) t.push(e[i]);
				else t.push(e);
				return t
			}

			function T(t, i, n) {
				if (!(this instanceof T)) return new T(t, i, n);
				"string" == typeof t && (t = document.querySelectorAll(t)), this.elements = s(t), this.options = r({}, this.options), "function" == typeof i ? n = i : r(this.options, i), n && this.on("always", n), this.getImages(), e && (this.jqDeferred = new e.Deferred);
				var o = this;
				setTimeout(function () {
					o.check()
				})
			}

			function l(e) {
				this.img = e
			}

			function u(e, t) {
				this.url = e, this.element = t, this.img = new Image
			}
			var c = i.console,
				h = Object.prototype.toString;
			T.prototype = new n, T.prototype.options = {}, T.prototype.getImages = function () {
				this.images = [];
				for (var e = 0; e < this.elements.length; e++) {
					var t = this.elements[e];
					this.addElementImages(t)
				}
			}, T.prototype.addElementImages = function (e) {
				"IMG" == e.nodeName && this.addImage(e), this.options.background === !0 && this.addElementBackgroundImages(e);
				var t = e.nodeType;
				if (t && S[t]) {
					for (var i = e.querySelectorAll("img"), n = 0; n < i.length; n++) {
						var o = i[n];
						this.addImage(o)
					}
					if ("string" == typeof this.options.background) {
						var r = e.querySelectorAll(this.options.background);
						for (n = 0; n < r.length; n++) {
							var a = r[n];
							this.addElementBackgroundImages(a)
						}
					}
				}
			};
			var S = {
				1: !0,
				9: !0,
				11: !0
			};
			T.prototype.addElementBackgroundImages = function (e) {
				var t = d(e),
					i = /url\(["]*([^"\)]+)["]*\)/gi,
					n = i.exec(t.backgroundImage);
				if (!n) {
					var o = /url\([']*([^'\)]+)[']*\)/gi;
					n = o.exec(t.backgroundImage)
				}
				for (; null !== n;) {
					var r = n && n[1];
					r && this.addBackground(r, e), n = i.exec(t.backgroundImage)
				}
			};
			var d = i.getComputedStyle || function (e) {
				return e.currentStyle
			};
			return T.prototype.addImage = function (e) {
				var t = new l(e);
				this.images.push(t)
			}, T.prototype.addBackground = function (e, t) {
				var i = new u(e, t);
				this.images.push(i)
			}, T.prototype.check = function () {
				function e(e, i, n) {
					setTimeout(function () {
						t.progress(e, i, n)
					})
				}
				var t = this;
				if (this.progressedCount = 0, this.hasAnyBroken = !1, !this.images.length) return void this.complete();
				for (var i = 0; i < this.images.length; i++) {
					var n = this.images[i];
					n.once("progress", e), n.check()
				}
			}, T.prototype.progress = function (e, t, i) {
				this.progressedCount++, this.hasAnyBroken = this.hasAnyBroken || !e.isLoaded, this.emit("progress", this, e, t), this.jqDeferred && this.jqDeferred.notify && this.jqDeferred.notify(this, e), this.progressedCount == this.images.length && this.complete(), this.options.debug && c && c.log("progress: " + i, e, t)
			}, T.prototype.complete = function () {
				var e = this.hasAnyBroken ? "fail" : "done";
				if (this.isComplete = !0, this.emit(e, this), this.emit("always", this), this.jqDeferred) {
					var t = this.hasAnyBroken ? "reject" : "resolve";
					this.jqDeferred[t](this)
				}
			}, l.prototype = new n, l.prototype.check = function () {
				var e = this.getIsImageComplete();
				return e ? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth") : (this.proxyImage = new Image, o.bind(this.proxyImage, "load", this), o.bind(this.proxyImage, "error", this), o.bind(this.img, "load", this), o.bind(this.img, "error", this), void(this.proxyImage.src = this.img.src))
			}, l.prototype.getIsImageComplete = function () {
				return this.img.complete && this.img.naturalWidth !== t
			}, l.prototype.confirm = function (e, t) {
				this.isLoaded = e, this.emit("progress", this, this.img, t)
			}, l.prototype.handleEvent = function (e) {
				var t = "on" + e.type;
				this[t] && this[t](e)
			}, l.prototype.onload = function () {
				this.confirm(!0, "onload"), this.unbindEvents()
			}, l.prototype.onerror = function () {
				this.confirm(!1, "onerror"), this.unbindEvents()
			}, l.prototype.unbindEvents = function () {
				o.unbind(this.proxyImage, "load", this), o.unbind(this.proxyImage, "error", this), o.unbind(this.img, "load", this), o.unbind(this.img, "error", this)
			}, u.prototype = new l, u.prototype.check = function () {
				o.bind(this.img, "load", this), o.bind(this.img, "error", this), this.img.src = this.url;
				var e = this.getIsImageComplete();
				e && (this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), this.unbindEvents())
			}, u.prototype.unbindEvents = function () {
				o.unbind(this.img, "load", this), o.unbind(this.img, "error", this)
			}, u.prototype.confirm = function (e, t) {
				this.isLoaded = e, this.emit("progress", this, this.element, t)
			}, T.makeJQueryPlugin = function () {
				e && (e.fn.n2imagesLoaded = function (t, i) {
					var n = new T(this, t, i);
					return n.jqDeferred.promise(e(this))
				})
			}, T.makeJQueryPlugin(), T
		})
}), N2D("UniversalPointer", function (e, t) {
	function i(t, i) {
		this.el = t, this.handler = i, this.$el = e(t).data("universalclick", this), this.preventMouse = !1, this.timeouts = [], this.localListeners = [], this.globalListeners = []
	}

	function n(t, i, n) {
		this.el = t, this.handler = i, this.$el = e(t).data("universalenter", this), this.leaveOnSecond = n, this.preventMouse = !1, this.isActive = !1, this.timeouts = [], this.localListeners = [], this.globalListeners = []
	}
	var o = !!(window.PointerEvent || window.MSPointerEvent || window.navigator.msPointerEnabled || window.navigator.pointerEnabled),
		r = !!window.TouchEvent;
	r && navigator.userAgent.match(/iPhone|iPad|iPod/i);
	i.prototype.addTimeout = function (e) {
		this.timeouts.push(e)
	}, i.prototype.clearTimeouts = function () {
		for (var e = 0; e < this.timeouts.length; e++) clearTimeout(this.timeouts[e]);
		this.timeouts = []
	}, i.prototype.click = function (e) {
		this.currentTarget !== t && (e = {
			currentTarget: this.currentTarget,
			target: this.el
		}), this.handler.call(this.el, e), this.clear()
	}, i.prototype.clear = function () {
		for (var e = 0; e < this.localListeners.length; e++) this.localListeners[e][0].removeEventListener(this.localListeners[e][1], this.localListeners[e][2], this.localListeners[e][3])
	}, i.prototype.addGlobalEventListener = function (e, t, i) {
		this.globalListeners.push([e, t, i]), this.el.addEventListener(e, t, i)
	}, i.prototype.addLocalEventListener = function (e, t, i, n) {
		this.localListeners.push([e, t, i, n]), e.addEventListener(t, i, n)
	}, i.prototype.remove = function () {
		this.clear(), this.clearTimeouts();
		for (var e = 0; e < this.globalListeners.length; e++) this.el.removeEventListener(this.globalListeners[e][0], this.globalListeners[e][1], this.globalListeners[e][2])
	}, i.prototype.startComplexInteraction = function (e) {
		this.clearTimeouts(), this.preventMouse = !0, this.currentTarget = e
	}, i.prototype.endComplexInteraction = function () {
		delete this.currentTarget, this.addTimeout(setTimeout(e.proxy(function () {
			this.preventMouse = !1
		}, this), 1e3))
	}, e.event.special.universalclick = {
		add: function (e) {
			var t = new i(this, e.handler);
			t.addGlobalEventListener("click", function (e) {
				t.preventMouse || t.click(e)
			}), o ? t.addGlobalEventListener("pointerdown", function (e) {
				e.isPrimary && (t.startComplexInteraction(e.currentTarget), t.addLocalEventListener(document.body.parentNode, "pointerup", function (i) {
					i.isPrimary && e.pointerId === i.pointerId && (Math.abs(i.clientX - e.clientX) < 10 && Math.abs(i.clientY - e.clientY) < 10 ? t.click(i) : t.clear(), t.endComplexInteraction())
				}))
			}) : r && t.addGlobalEventListener("touchstart", function (e) {
				t.startComplexInteraction(e.currentTarget), t.addLocalEventListener(document.body.parentNode, "touchend", function (i) {
					Math.abs(i.changedTouches[0].clientX - e.changedTouches[0].clientX) < 10 && Math.abs(i.changedTouches[0].clientY - e.changedTouches[0].clientY) < 10 ? t.click(i) : t.clear(), t.endComplexInteraction()
				}, {
					passive: !0
				})
			}, {
				passive: !0
			})
		},
		remove: function () {
			var t = e(this),
				i = t.data("universalclick");
			i && (i.remove(), t.removeData("universalclick"))
		}
	}, n.prototype.enter = function (e) {
		return this.leaveOnSecond && this.isActive ? (this.leave(), !1) : (this.handler.apply(this.el, arguments), this.isActive = !0, !0)
	}, n.prototype.leave = function () {
		this.clearTimeouts();
		for (var e = 0; e < this.localListeners.length; e++) this.localListeners[e][0].removeEventListener(this.localListeners[e][1], this.localListeners[e][2], this.localListeners[e][3]);
		this.isActive = !1, this.$el.triggerHandler("universalleave")
	}, n.prototype.testLeave = function (e) {
		this.$el.is(e) || 0 !== this.$el.find(e).length || this.leave()
	}, n.prototype.addTimeout = function (e) {
		this.timeouts.push(e)
	}, n.prototype.clearTimeouts = function () {
		for (var e = 0; e < this.timeouts.length; e++) clearTimeout(this.timeouts[e]);
		this.timeouts = []
	}, n.prototype.addGlobalEventListener = function (e, t, i) {
		this.globalListeners.push([e, t, i]), this.el.addEventListener(e, t, i)
	}, n.prototype.remove = function () {
		this.isActive && this.leave(), this.clearTimeouts();
		for (var e = 0; e < this.globalListeners.length; e++) this.el.removeEventListener(this.globalListeners[e][0], this.globalListeners[e][1], this.globalListeners[e][2])
	}, n.prototype.addLocalEventListener = function (e, t, i, n) {
		this.localListeners.push([e, t, i, n]), e.addEventListener(t, i, n)
	}, e.event.special.universalenter = {
		add: function (e) {
			var t = new n(this, e.handler, e.data ? e.data.leaveOnSecond : !1);
			o ? (t.addGlobalEventListener("pointerenter", function (e) {
				e.isPrimary && (t.clearTimeouts(), t.enter(e) && "mouse" !== e.pointerType && (t.addLocalEventListener(document.body.parentNode, "pointerdown", function (e) {
					e.isPrimary && t.testLeave(e.target)
				}), t.addTimeout(setTimeout(function () {
					t.leave()
				}, 5e3))))
			}), t.addGlobalEventListener("pointerleave", function (e) {
				e.isPrimary && "mouse" === e.pointerType && t.leave()
			})) : (t.addGlobalEventListener("mouseenter", function (e) {
				t.preventMouse || t.enter(e)
			}), t.addGlobalEventListener("mouseleave", function () {
				t.preventMouse || t.leave()
			}), r && t.addGlobalEventListener("touchstart", function (e) {
				t.preventMouse = !0, t.clearTimeouts(), t.enter(e) && (t.addLocalEventListener(document.body.parentNode, "touchstart", function (e) {
					t.testLeave(e.target)
				}), t.addTimeout(setTimeout(function () {
					t.leave(), t.preventMouse = !1
				}, 5e3)))
			}, {
				passive: !0
			}))
		},
		remove: function () {
			var t = e(this),
				i = t.data("universalenter");
			i && (i.remove(), t.removeData("universalenter"))
		}
	}
}), N2D("EventBurrito", function (e, t) {
	function i(i, r) {
		function a(e, t) {
			for (var i in t) t.hasOwnProperty(i) && (e[i] = t[i])
		}

		function s(e, t, i, n) {
			return t ? (e.addEventListener ? e.addEventListener(t, i, n) : e.attachEvent("on" + t, i), {
				remove: function () {
					T(e, t, i, n)
				}
			}) : void 0
		}

		function T(e, t, i, n) {
			t && (e.removeEventListener ? e.removeEventListener(t, i, n) : e.detachEvent("on" + t, i))
		}

		function l(e) {
			e.preventDefault ? e.preventDefault() : e.returnValue = !1
		}

		function u(e) {
			m = {
				x: (A ? e.clientX : e.touches[0].clientX) - G.x,
				y: (A ? e.clientY : e.touches[0].clientY) - G.y,
				time: Date.now()
			}
		}

		function c(e, i) {
			(e.isPrimary === t || e.isPrimary) && (o || (C = !0, A = i, B[A](e) || H(e.target) || (o = !0, 0 !== A && s(document, g[A][1], h, !1), s(document, g[A][2], S, !1), s(document, g[A][3], S, !1), b.preventDefault && A && l(e), G = {
				x: A ? e.clientX : e.touches[0].clientX,
				y: A ? e.clientY : e.touches[0].clientY,
				time: Date.now()
			}, P = t, p = !1, m = {
				x: 0,
				y: 0
			}, b.start(e, G), h(e))))
		}

		function h(e) {
			(e.isPrimary === t || e.isPrimary) && ("x" === b.axis && (!b.preventScroll && P || B[A](e)) || H(e.target) || (u(e), (Math.abs(m.x) > b.clickTolerance || Math.abs(m.y) > b.clickTolerance) && (C = !1), P === t && 2 !== A && (P = Math.abs(m.x) < Math.abs(m.y) && !b.preventScroll) || b.move(e, G, m, p) && b.preventDefault && l(e)))
		}

		function S(e) {
			(e.isPrimary === t || e.isPrimary) && (A && u(e), !C && e.target && e.target.blur && e.target.blur(), 0 !== A && T(document, g[A][1], h, !1), T(document, g[A][2], S, !1), T(document, g[A][3], S, !1), b.end(e, G, m, p), p = !1, o = !1)
		}

		function d() {
			f.push(s(document, "scroll", function (e) {
				window.nextendScrollFocus !== t && window.nextendScrollFocus || (p = !0)
			})), 1 === v && ("y" === b.axis ? i.style.touchAction = "pan-up pan-x" : i.style.touchAction = "pan-y"), f.push(s(i, g[v][0], function (e) {
				c(e, v)
			}, 0 === v ? {
				passive: !1
			} : !1)), 0 === v && f.push(s(i, g[0][1], function (e) {
				h(e, 0)
			}, {
				passive: !1
			})), f.push(s(i, "dragstart", l)), b.mouse && !v && f.push(s(i, g[2][0], function (e) {
				c(e, 2)
			})), f.push(s(i, "click", function (e) {
				C ? b.click(e) : l(e)
			}))
		}
		var b = {
			preventDefault: !0,
			clickTolerance: 10,
			preventScroll: !1,
			mouse: !0,
			axis: "x",
			start: n,
			move: n,
			end: n,
			click: n
		};
		r && a(b, r);
		var P, p, A, M = {
				pointerEvents: !!(window.PointerEvent || window.MSPointerEvent || window.navigator.msPointerEnabled || window.navigator.pointerEnabled)
			},
			G = {},
			m = {},
			f = [],
			C = !0,
			v = M.pointerEvents ? 1 : 0,
			g = [
				["touchstart", "touchmove", "touchend", "touchcancel"],
				["pointerdown", "pointermove", "pointerup", "pointercancel"],
				["mousedown", "mousemove", "mouseup", !1]
			],
			B = [function (e) {
				return e.touches && e.touches.length > 1 || e.scale && 1 !== e.scale
			}, function (e) {
				return !e.isPrimary || e.buttons && 1 !== e.buttons || !b.mouse && "touch" !== e.pointerType && "pen" !== e.pointerType
			}, function (e) {
				return e.buttons && 1 !== e.buttons
			}],
			H = function (t) {
				var i = t.tagName;
				return !("INPUT" != i && "TEXTAREA" != i && "SELECT" != i && "BUTTON" != i && "VIDEO" != i && !e(t).hasClass("n2-scrollable") && !e(t).closest(".n2-scrollable").length)
			};
		return d(), {
			supportsPointerEvents: M.pointerEvents,
			getClicksAllowed: function () {
				return C
			},
			kill: function () {
				for (var e = f.length - 1; e >= 0; e--) f[e].remove()
			}
		}
	}
	var n = function () {
			return !0
		},
		o = !1;
	return i
}), N2D("RAF", function () {
	function e() {
		this._isTicking = !1, this._isMobile = !1, this._lastTick = -1, this._ticks = [], this._postTickCallbacks = [];
		var e = function () {
			var e = 0;
			return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (t) {
				var i, n = (new Date).getTime();
				return i = Math.max(0, 16 - (n - e)), e = n + i, setTimeout(function () {
					t(n + i)
				}, i)
			}
		}();
		this._raf = window.requestAnimationFrame || e;
		var t = this;
		this._isMobile || void 0 === document.hidden || document.addEventListener("visibilitychange", function () {
			document.hidden ? (this._raf = function (e) {
				return setTimeout(function () {
					e(t.now())
				}, 16)
			}, t._tick(t.now())) : t._raf = window.requestAnimationFrame || e
		})
	}
	var t = function (e) {
		for (var t, i, n = arguments, o = n.length; o > 1 && e.length;)
			for (t = n[--o]; - 1 !== (i = e.indexOf(t));) e.splice(i, 1);
		return e
	};
	return e.prototype.addTick = function (e) {
		-1 === this._ticks.indexOf(e) && this._ticks.push(e), this._isTicking || (this._isTicking = !0, this._raf.call(null, this.getTickStart()))
	}, e.prototype.removeTick = function (e) {
		t(this._ticks, e), 0 === this._ticks.length && this._isTicking && (this._lastTick = -1, this._isTicking = !1)
	}, e.prototype._tickStart = function (e) {
		this._lastTick = e, this._isTicking && (this._lastTick = e, this._raf.call(null, this.getTick()))
	}, e.prototype._tick = function (e) {
		if (-1 !== this._lastTick) {
			var t = (e - this._lastTick) / 1e3;
			if (0 != t) {
				for (var i = 0; i < this._ticks.length; i++) this._ticks[i].call(null, t);
				this.postTick()
			}
		}
		this._continueTick(e)
	}, e.prototype._continueTick = function (e) {
		this._isTicking && (this._lastTick = e, this._raf.call(null, this.getTick()))
	}, e.prototype.getTick = function () {
		var e = this;
		return function () {
			e._tick.apply(e, arguments)
		}
	}, e.prototype.getTickStart = function () {
		var e = this;
		return function () {
			e._tickStart.apply(e, arguments)
		}
	}, e.prototype.now = function () {
		return performance.now()
	}, e.prototype.postTick = function () {
		for (var e = 0; e < this._postTickCallbacks.length; e++) this._postTickCallbacks[e]();
		this._postTickCallbacks = []
	}, e.prototype.addPostTick = function (e) {
		this._postTickCallbacks.push(e)
	}, new e
}), N2D("Animation", "RAF", function () {
	function e(e) {
		this._tickCallback = null, this._progress = 0, this._delayTimeout = !1, this._delay = 0, this._duration = 4, this._timeScale = 1, this._isPlaying = !1, this._startTime = 0, this._eventCallbacks = {}, this._immediateRender = !0, this._timeline = null, this._isCompleted = !1, this._isStarted = !1, this._isReversed = !1, this.toParams = e, this.initParameters()
	}
	return e.prototype.initParameters = function () {
		this.parseParameters(this.toParams), "object" != typeof this.toParams && this.paused(!1)
	}, e.prototype.parseParameters = function (e) {
		e && (e.delay && (this.delay(e.delay), delete e.delay), "undefined" != typeof e.duration && (this.duration(e.duration), delete e.duration), e.onComplete && (this.eventCallback("onComplete", e.onComplete), delete e.onComplete), e.onStart && (this.eventCallback("onStart", e.onStart), delete e.onStart), e.onUpdate && (this.eventCallback("onUpdate", e.onUpdate), delete e.onUpdate), e.immediateRender && (this._immediateRender = e.immediateRender, delete e.immediateRender), e.paused && this.paused(!0))
	}, e.prototype.setTimeline = function (e) {
		this._timeline = e
	}, e.prototype._tick = function (e) {
		var t = this._progress;
		this._isReversed ? (this._progress -= e / this._duration * this._timeScale, 1 != t && this._isStarted ? this._progress <= 0 ? (this._progress = 0, this._isPlaying = !1, N2Classes.RAF.removeTick(this.getTickCallback()), this._onUpdate(), this._onReverseComplete()) : this._onUpdate() : this._onReverseStart()) : (this._progress += e / this._duration * this._timeScale, 0 != t && this._isStarted ? this._progress >= 1 ? (this._progress = 1, this._isPlaying = !1, N2Classes.RAF.removeTick(this.getTickCallback()), this._onUpdate(), this._onComplete()) : this._onUpdate() : this._onStart())
	}, e.prototype._onStart = function () {
		this._isStarted = !0, this._isPlaying = !1, this._isCompleted = !1, this.trigger("onStart"), this._onUpdate()
	}, e.prototype._onUpdate = function () {
		this.trigger("onUpdate")
	}, e.prototype._onComplete = function () {
		this._isCompleted = !0, this._onUpdate(), this.trigger("onComplete")
	}, e.prototype._onReverseComplete = function () {
		this._isCompleted = !0, this._isReversed = !1, this._onUpdate(), this.trigger("onReverseComplete")
	}, e.prototype._onReverseStart = function () {
		this._isStarted = !0, this._isPlaying = !1, this._isCompleted = !1, this.trigger("onReverseStart"), this._onUpdate()
	}, e.prototype.getTickCallback = function () {
		if (!this._tickCallback) {
			var e = this;
			this._tickCallback = function () {
				e._tick.apply(e, arguments)
			}
		}
		return this._tickCallback
	}, e.prototype._clearDelayTimeout = function () {
		this._delayTimeout && (clearTimeout(this._delayTimeout), this._delayTimeout = !1)
	}, e.prototype._timeToProgress = function (e) {
		return e / this._duration * this._timeScale
	}, e.prototype.delay = function () {
		if (arguments.length > 0) {
			var e = parseFloat(arguments[0]);
			return !isNaN(e) && e != 1 / 0 && e || (e = 0), this._delay = Math.max(0, e), this
		}
		return this._delay
	}, e.prototype.duration = function () {
		if (arguments.length > 0) {
			var e = parseFloat(arguments[0]);
			return !isNaN(e) && e != 1 / 0 && e || (e = 0), this._duration = Math.max(0, e), this
		}
		return this._duration
	}, e.prototype.eventCallback = function (e) {
		return arguments.length > 3 ? this._eventCallbacks[e] = [arguments[1], arguments[2], arguments[3]] : arguments.length > 2 ? this._eventCallbacks[e] = [arguments[1], arguments[2], this] : arguments.length > 1 && (this._eventCallbacks[e] = [arguments[1],
			[], this
		]), this._eventCallbacks[e]
	}, e.prototype.pause = function () {
		return this._isPlaying = !1, N2Classes.RAF.removeTick(this.getTickCallback()), arguments.length > 0 && null != arguments[0] && this.progress(this._timeToProgress(arguments[0])), this
	}, e.prototype.paused = function () {
		return arguments.length > 0 ? (arguments[0] ? this._isPlaying && this.pause() : this._isPlaying || this.play(), this) : !this._isPlaying
	}, e.prototype.play = function () {
		var e = !0;
		arguments.length > 0 && null != arguments[0] && (e = !1, this._progress = this._timeToProgress(arguments[0])), this._play(e)
	}, e.prototype._play = function (e) {
		if (this._progress < 1)
			if (0 == this._progress && e && this._delay > 0) {
				if (!this._delayTimeout) {
					var t = this;
					this._delayTimeout = setTimeout(function () {
						t.__play.apply(t, arguments)
					}, 1e3 * this._delay)
				}
			} else this.__play();
		else this._isCompleted || (this._isReversed ? this._onReverseComplete() : this._onComplete())
	}, e.prototype.__play = function () {
		this._clearDelayTimeout(), this._isPlaying || (N2Classes.RAF.addTick(this.getTickCallback()), this._isPlaying = !0)
	}, e.prototype.progress = function () {
		if (arguments.length > 0) {
			var e = parseFloat(arguments[0]);
			return isNaN(e) && (e = 0), e = Math.min(1, Math.max(0, e)), this._progress = e,
				this._isPlaying || (this._isStarted || this._onStart(), this._onUpdate()), this
		}
		return this._progress
	}, e.prototype.reverse = function () {
		this._isReversed = !0, 0 != this.progress() && this.play()
	}, e.prototype.restart = function () {
		return arguments.length > 0 && arguments[0] ? (this.pause(0), this.play(), this) : (this.play(0), this)
	}, e.prototype.seek = function (e) {
		null != e && (this._progress = this._timeToProgress(arguments[0]), this._isPlaying || this._onUpdate())
	}, e.prototype.startTime = function () {
		if (arguments.length > 0) {
			var e = parseFloat(arguments[0]);
			return isNaN(e) && (e = 0), this._startTime = Math.max(0, e), this
		}
		return this._startTime
	}, e.prototype.timeScale = function () {
		if (arguments.length > 0) {
			var e = parseFloat(arguments[0]);
			return isNaN(e) && (e = 1), e = Math.max(.01, e), this._timeScale != e && (this._timeScale = e), this
		}
		return this._timeScale
	}, e.prototype.trigger = function (e) {
		"object" == typeof this._eventCallbacks[e] && this._eventCallbacks[e][0].apply(this._eventCallbacks[e][2], this._eventCallbacks[e][1])
	}, e.prototype.totalDuration = function () {
		if (arguments.length > 0) {
			var e = parseFloat(arguments[0]);
			return isNaN(e) && (e = 0), e = Math.max(0, e), this.timeScale(this._duration / e), this
		}
		return this._duration * this._timeScale
	}, e.prototype.reset = function () {
		this._isCompleted = !1, this._isStarted = !1, this.progress(0)
	}, e
}), N2D("AnimationCSS", "RAF", function (e) {
	function t() {}

	function i(e) {
		return e.n2Transform || (e.n2Transform = new n), e.n2Transform
	}

	function n(t) {
		this.data = e.extend({}, s)
	}
	var o = {},
		r = function (e) {
			return "function" == typeof e
		},
		a = function (e) {
			return "[object Array]" === Object.prototype.toString.call(e)
		};
	t.prototype.set = function (e, t, i, n) {
		e.length || (e = [e]), i += n;
		for (var o = 0; o < e.length; o++) {
			var r = e[o];
			this.applyStyles(r, t, i)
		}
	}, t.prototype.applyStyles = function (e, t, i) {
		var n = {};
		n[t] = i, "undefined" != typeof o[t] && o[t](e).prepare(n);
		for (var r in n) try {
			e.style[r] = n[r]
		} catch (a) {}
	}, t.prototype.makeTransitionData = function (e, t, i, n) {
		var o, r, a, s, T;
		if (t.match(/transformOrigin|perspective/)) {
			if (n) return {
				startValue: n,
				endValue: n,
				unit: "",
				range: 0
			};
			if (i) return {
				startValue: i,
				endValue: i,
				unit: "",
				range: 0
			}
		}
		return "undefined" == typeof i && (i = this.getProperty(e, t)), s = this.separateValue(t, i), i = s[0], r = s[1], "undefined" == typeof n && (n = this.getProperty(e, t)), T = this.separateValue(t, n), n = T[0], a = T[1], o = a || r, a != o && (n = this.transformUnit(e, t, n, a, o)), r != o && (i = this.transformUnit(e, t, i, r, o)), {
			startValue: i,
			endValue: n,
			unit: o,
			range: n - i
		}
	}, t.prototype.getProperty = function (t, i) {
		if ("undefined" != typeof o[i]) return o[i](t).get(i);
		try {
			var n = e(t).css(i);
			return "auto" === n ? 0 : n
		} catch (r) {
			return 0
		}
	}, t.prototype.transformUnit = function (e, t, i, n, o) {
		if (0 == i) return 0;
		var r = "";
		switch (t) {
			case "left":
			case "right":
				r = "width";
				break;
			case "top":
			case "bottom":
				r = "height";
				break;
			default:
				r = t
		}
		if ("px" == n && "%" == o) {
			var a = this.getProperty(e.parent(), r),
				s = this.separateValue(r, a);
			return i / s[0] * 100
		}
		if ("%" == n && "px" == o) {
			var a = this.getProperty(e.parent(), r),
				s = this.separateValue(r, a);
			return i / 100 * s[0]
		}
		return i
	}, t.prototype.parsePropertyValue = function (e, t) {
		var i = void 0,
			n = void 0;
		return a(t) ? (i = t[0], n = t[1]) : i = t, r(i) && (i = i.call(e)), r(n) && (n = n.call(e)), [i || 0, n]
	}, t.prototype.separateValue = function (e, t) {
		var i, n;
		return n = (t || "0").toString().toLowerCase().replace(/[%A-z]+$/, function (e) {
			return i = e, ""
		}), i || (i = this.getUnitType(e)), [parseFloat(n), i]
	}, t.prototype.getUnitType = function (e) {
		return /(^(x|y|z|rotationX|rotationY|rotationZ|scale|scaleX|scaleY|opacity)$)/i.test(e) ? "" : "px"
	}, o.transform = i, o.x = i, o.y = i, o.z = i, o.rotationX = i, o.rotationY = i, o.rotationZ = i, o.scale = i, o.scaleX = i, o.scaleY = i, o.scaleZ = i;
	var s = {
		x: 0,
		y: 0,
		z: 0,
		rotationX: 0,
		rotationY: 0,
		rotationZ: 0,
		scaleX: 1,
		scaleY: 1,
		scaleZ: 1,
		scale: 1
	};
	n.prototype.get = function (e) {
		return this.data[e]
	};
	var T = Math.PI / 180;
	return n.prototype.prepare = function (t) {
		"undefined" != typeof t.transform && "none" === t.transform && (this.data = e.extend({}, s)), "undefined" != typeof t.scale && (t.scaleX = t.scale, t.scaleY = t.scale, delete t.scale);
		for (var i in this.data) "undefined" != typeof t[i] && (this.data[i] = t[i], delete t[i]);
		return this.data.scale = this.data.scaleX, t.transform = this.matrix3d(this.data.x, this.data.y, this.data.z, this.data.scaleX, this.data.scaleY, this.data.rotationX, this.data.rotationY, this.data.rotationZ), t
	}, n.prototype.matrix3d = function (e, t, i, n, o, r, a, s) {
		var l = Math.cos(r * T),
			u = Math.sin(r * T),
			c = Math.cos(a * T),
			h = Math.sin(a * T),
			S = Math.cos(s * T),
			d = Math.sin(s * T),
			b = new Array(16);
		return b[0] = c * S * n, b[1] = d, b[2] = h, b[3] = 0, b[4] = -1 * d, b[5] = l * S * o, b[6] = u, b[7] = 0, b[8] = -1 * h, b[9] = -1 * u, b[10] = c * l, b[11] = 0, b[12] = e, b[13] = t, b[14] = i, b[15] = 1, "matrix3d(" + b[0] + "," + b[1] + "," + b[2] + "," + b[3] + "," + b[4] + "," + b[5] + "," + b[6] + "," + b[7] + "," + b[8] + "," + b[9] + "," + b[10] + "," + b[11] + "," + b[12] + "," + b[13] + "," + b[14] + "," + b[15] + ")"
	}, new t
}), N2D("Tween", "RAF", function (e) {
	function t(t, n) {
		this.ease = "linear", this._tweenContainer = null, this._setContainer = null;
		var o, r = null;
		switch (arguments.length) {
			case 4:
				r = e.extend(!0, {}, arguments[2]), o = arguments[3], o ? (this._mode = i.FROMTO, o = e.extend(!0, {}, o)) : this._mode = i.FROM;
				break;
			default:
				this._mode = i.TO, r = {}, o = e.extend(!0, {}, arguments[2])
		}
		if (this._target = e(t), this.fromParams = r, N2Classes.Animation.call(this, o), this.parseParameters({
				duration: n
			}), (this._mode == i.FROM || this._mode == i.FROMTO) && this._immediateRender) {
			null === this._tweenContainer && this._makeTweenContainer(this.fromParams, this.toParams);
			for (var a in this._tweenContainer) {
				var s = this._tweenContainer[a];
				N2Classes.AnimationCSS.set(this._target, a, s.startValue, s.unit)
			}
			for (var a in this._setContainer) {
				var s = this._setContainer[a];
				N2Classes.AnimationCSS.set(this._target, a, s.endValue, s.unit)
			}
		}
	}
	var i = {
		FROM: 1,
		FROMTO: 2,
		TO: 3
	};
	return t.prototype = Object.create(N2Classes.Animation.prototype), t.prototype.constructor = t, t.prototype.initParameters = function () {
		this.parseParameters(this.fromParams), N2Classes.Animation.prototype.initParameters.apply(this, arguments)
	}, t.prototype.parseParameters = function (e) {
		e && (e.ease && (this.ease = e.ease, delete e.ease), N2Classes.Animation.prototype.parseParameters.apply(this, arguments))
	}, t.prototype._onStart = function () {
		null === this._tweenContainer && this._makeTweenContainer(this.fromParams, this.toParams);
		for (var e in this._setContainer) {
			var t = this._setContainer[e];
			N2Classes.AnimationCSS.set(this._target, e, t.endValue, t.unit)
		}
		N2Classes.Animation.prototype._onStart.call(this)
	}, t.prototype._onUpdate = function () {
		for (var e in this._tweenContainer) {
			var t = this._tweenContainer[e];
			N2Classes.AnimationCSS.set(this._target, e, N2Classes.Easings[this.ease](this._progress, t.startValue, t.range * this._progress, 1), t.unit)
		}
		N2Classes.Animation.prototype._onUpdate.call(this)
	}, t.prototype._makeTweenContainer = function (e, t) {
		if (this._setContainer = {}, this._tweenContainer = {}, t)
			for (var i in t) {
				var n = N2Classes.AnimationCSS.makeTransitionData(this._target, i, e[i], t[i]);
				0 == n.range ? this._setContainer[i] = n : this._tweenContainer[i] = n
			} else
				for (var i in e) {
					var n = N2Classes.AnimationCSS.makeTransitionData(this._target, i, e[i]);
					0 == n.range ? this._setContainer[i] = n : this._tweenContainer[i] = n
				}
	}, t.set = function (t, i) {
		for (var n in i) N2Classes.AnimationCSS.set(e(t), n, i[n], "")
	}, t.to = function (e, i, n) {
		var o = new t(e, i, n);
		return void 0 !== n.paused && n.paused || o.play(), o
	}, t.fromTo = function (e, i, n, o) {
		var r = new t(e, i, n, o);
		return void 0 !== o.paused && o.paused || r.play(), r
	}, t.from = function (e, i, n) {
		var o = new t(e, i, n, null);
		return void 0 !== n.paused && n.paused || o.play(), o
	}, window.NextendTween = t, t
}), N2D("Timeline", "RAF", function (e) {
	function t(t) {
		this.originalParams = e.extend(!0, {}, t), this._tweens = [], N2Classes.Animation.call(this, t), this._duration = 0
	}
	return t.prototype = Object.create(N2Classes.Animation.prototype), t.prototype.constructor = t, t.prototype._onUpdate = function () {
		if (this.tweensContainer)
			for (var e = 0; e < this.tweensContainer.length; e++) {
				var t = this.tweensContainer[e],
					i = Math.min(1, (this._progress - t.startProgress) / (t.endProgress - t.startProgress));
				t.tween._isCompleted && i <= t.endProgress && t.tween.reset(), !t.tween._isStarted && i >= 0 && 0 == t.tween.progress() && t.tween._onStart(), t.tween._isStarted && (1 != i || t.tween._isCompleted ? i >= 0 && 1 > i ? t.tween.progress(i) : 0 > i && 0 != t.tween.progress() && t.tween.progress(0) : (t.tween.progress(i), t.tween._onComplete()))
			}
		N2Classes.Animation.prototype._onUpdate.call(this), N2Classes.RAF._isTicking || N2Classes.RAF.postTick()
	}, t.prototype.addTween = function (e) {
		e.pause(), e.setTimeline(this);
		var t = 0;
		t = arguments.length > 1 ? this._parsePosition(arguments[1]) : this._parsePosition();
		var i = e.delay();
		i > 0 && (t += i, e.delay(0)), e.startTime(t), this._tweens.push(e);
		var n = e.totalDuration() + t;
		n > this._duration && (this._duration = n), this.makeCache()
	}, t.prototype.clear = function () {
		this.paused() || this.pause(), t.call(this, this.originalParams)
	}, t.prototype.add = function (e, t) {
		this.addTween(e, t)
	}, t.prototype.set = function (e, t, i) {
		this.addTween(NextendTween.to(e, .05, t), i)
	}, t.prototype.to = function (e, t, i, n) {
		i.paused = !0, this.addTween(NextendTween.to(e, t, i), n)
	}, t.prototype.fromTo = function (e, t, i, n, o) {
		n.paused = !0, this.addTween(NextendTween.fromTo(e, t, i, n), o)
	}, t.prototype.from = function (e, t, i, n) {
		i.paused = !0, this.addTween(NextendTween.from(e, t, i), n)
	}, t.prototype._play = function () {
		if (0 == this._progress)
			for (var e = 0; e < this._tweens.length; e++) this._tweens[e].pause(0);
		N2Classes.Animation.prototype._play.apply(this, arguments)
	}, t.prototype._parsePosition = function () {
		var e = "+=0";
		arguments.length > 0 && "undefined" != typeof arguments[0] && !isNaN(arguments[0]) && (e = arguments[0]);
		var t = 0;
		switch (typeof e) {
			case "string":
				switch (e.substr(0, 2)) {
					case "+=":
						t = this.duration() + parseFloat(e.substr(2));
						break;
					case "-=":
						t = this.duration() - parseFloat(e.substr(2))
				}
				break;
			default:
				t = parseFloat(e)
		}
		return Math.max(0, t)
	}, t.prototype.makeCache = function () {
		var e = this.totalDuration();
		this.tweensContainer = [];
		for (var t = 0; t < this._tweens.length; t++) {
			var i = this._tweens[t],
				n = i.startTime() / e,
				o = (i.startTime() + i.totalDuration()) / e;
			this.tweensContainer.push({
				tween: i,
				startProgress: n,
				endProgress: o,
				range: o - n
			})
		}
	}, window.NextendTimeline = t, t
}), N2D("Easings", "RAF", function () {
	var e = {
		linear: function (e, t, i, n) {
			return i + t
		},
		easeInQuad: function (e, t, i, n) {
			return i * (e /= n) * e + t
		},
		easeOutQuad: function (e, t, i, n) {
			return -i * (e /= n) * (e - 2) + t
		},
		easeInOutQuad: function (e, t, i, n) {
			return (e /= n / 2) < 1 ? i / 2 * e * e + t : -i / 2 * (--e * (e - 2) - 1) + t
		},
		easeInCubic: function (e, t, i, n) {
			return i * (e /= n) * e * e + t
		},
		easeOutCubic: function (e, t, i, n) {
			return i * ((e = e / n - 1) * e * e + 1) + t
		},
		easeInOutCubic: function (e, t, i, n) {
			return (e /= n / 2) < 1 ? i / 2 * e * e * e + t : i / 2 * ((e -= 2) * e * e + 2) + t
		},
		easeInQuart: function (e, t, i, n) {
			return i * (e /= n) * e * e * e + t
		},
		easeOutQuart: function (e, t, i, n) {
			return -i * ((e = e / n - 1) * e * e * e - 1) + t
		},
		easeInOutQuart: function (e, t, i, n) {
			return (e /= n / 2) < 1 ? i / 2 * e * e * e * e + t : -i / 2 * ((e -= 2) * e * e * e - 2) + t
		},
		easeInQuint: function (e, t, i, n) {
			return i * (e /= n) * e * e * e * e + t
		},
		easeOutQuint: function (e, t, i, n) {
			return i * ((e = e / n - 1) * e * e * e * e + 1) + t
		},
		easeInOutQuint: function (e, t, i, n) {
			return (e /= n / 2) < 1 ? i / 2 * e * e * e * e * e + t : i / 2 * ((e -= 2) * e * e * e * e + 2) + t
		},
		easeInSine: function (e, t, i, n) {
			return -i * Math.cos(e / n * (Math.PI / 2)) + i + t
		},
		easeOutSine: function (e, t, i, n) {
			return i * Math.sin(e / n * (Math.PI / 2)) + t
		},
		easeInOutSine: function (e, t, i, n) {
			return -i / 2 * (Math.cos(Math.PI * e / n) - 1) + t
		},
		easeInExpo: function (e, t, i, n) {
			return 0 == e ? t : i * Math.pow(2, 10 * (e / n - 1)) + t
		},
		easeOutExpo: function (e, t, i, n) {
			return e == n ? t + i : i * (-Math.pow(2, -10 * e / n) + 1) + t
		},
		easeInOutExpo: function (e, t, i, n) {
			return 0 == e ? t : e == n ? t + i : (e /= n / 2) < 1 ? i / 2 * Math.pow(2, 10 * (e - 1)) + t : i / 2 * (-Math.pow(2, -10 * --e) + 2) + t
		},
		easeInCirc: function (e, t, i, n) {
			return -i * (Math.sqrt(1 - (e /= n) * e) - 1) + t
		},
		easeOutCirc: function (e, t, i, n) {
			return i * Math.sqrt(1 - (e = e / n - 1) * e) + t
		},
		easeInOutCirc: function (e, t, i, n) {
			return (e /= n / 2) < 1 ? -i / 2 * (Math.sqrt(1 - e * e) - 1) + t : i / 2 * (Math.sqrt(1 - (e -= 2) * e) + 1) + t
		},
		easeInElastic: function (e, t, i, n) {
			var o = 1.70158,
				r = 0,
				a = i;
			if (0 == e) return t;
			if (1 == (e /= n)) return t + i;
			if (r || (r = .3 * n), a < Math.abs(i)) {
				a = i;
				var o = r / 4
			} else var o = r / (2 * Math.PI) * Math.asin(i / a);
			return -(a * Math.pow(2, 10 * (e -= 1)) * Math.sin((e * n - o) * (2 * Math.PI) / r)) + t
		},
		easeOutElastic: function (e, t, i, n) {
			var o = 1.70158,
				r = 0,
				a = i;
			if (0 == e) return t;
			if (1 == (e /= n)) return t + i;
			if (r || (r = .3 * n), a < Math.abs(i)) {
				a = i;
				var o = r / 4
			} else var o = r / (2 * Math.PI) * Math.asin(i / a);
			return a * Math.pow(2, -10 * e) * Math.sin((e * n - o) * (2 * Math.PI) / r) + i + t
		},
		easeInOutElastic: function (e, t, i, n) {
			var o = 1.70158,
				r = 0,
				a = i;
			if (0 == e) return t;
			if (2 == (e /= n / 2)) return t + i;
			if (r || (r = n * (.3 * 1.5)), a < Math.abs(i)) {
				a = i;
				var o = r / 4
			} else var o = r / (2 * Math.PI) * Math.asin(i / a);
			return 1 > e ? -.5 * (a * Math.pow(2, 10 * (e -= 1)) * Math.sin((e * n - o) * (2 * Math.PI) / r)) + t : a * Math.pow(2, -10 * (e -= 1)) * Math.sin((e * n - o) * (2 * Math.PI) / r) * .5 + i + t
		},
		easeInBack: function (e, t, i, n, o) {
			return void 0 == o && (o = 1.70158), i * (e /= n) * e * ((o + 1) * e - o) + t
		},
		easeOutBack: function (e, t, i, n, o) {
			return void 0 == o && (o = 1.70158), i * ((e = e / n - 1) * e * ((o + 1) * e + o) + 1) + t
		},
		easeInOutBack: function (e, t, i, n, o) {
			return void 0 == o && (o = 1.70158), (e /= n / 2) < 1 ? i / 2 * (e * e * (((o *= 1.525) + 1) * e - o)) + t : i / 2 * ((e -= 2) * e * (((o *= 1.525) + 1) * e + o) + 2) + t
		},
		easeInBounce: function (e, t, i, n) {
			return i - N2Classes.Easing.easeOutBounce(n - e, 0, i, n) + t
		},
		easeOutBounce: function (e, t, i, n) {
			return (e /= n) < 1 / 2.75 ? i * (7.5625 * e * e) + t : 2 / 2.75 > e ? i * (7.5625 * (e -= 1.5 / 2.75) * e + .75) + t : 2.5 / 2.75 > e ? i * (7.5625 * (e -= 2.25 / 2.75) * e + .9375) + t : i * (7.5625 * (e -= 2.625 / 2.75) * e + .984375) + t
		},
		easeInOutBounce: function (e, t, i, n) {
			return n / 2 > e ? .5 * N2Classes.Easing.easeInBounce(2 * e, 0, i, n) + t : .5 * N2Classes.Easing.easeOutBounce(2 * e - n, 0, i, n) + .5 * i + t
		}
	};
	return e
}), N2D("nextend-frontend");