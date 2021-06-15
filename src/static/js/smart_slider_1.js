function N2Deferred() {
    this.state = 0, this.args = null, this.callbacks = []
}

function NextendThrottle(e, t) {
    t || (t = 250);
    var n, r;
    return function () {
        var s = this,
            i = +new Date,
            a = arguments;
        n && n + t > i ? (clearTimeout(r), r = setTimeout(function () {
            n = i, e.apply(s, a)
        }, t)) : (n = i, e.apply(s, a))
    }
}

function NextendDeBounce(e, t, n) {
    var r;
    return function () {
        var s = this,
            i = arguments,
            a = function () {
                r = null, n || e.apply(s, i)
            },
            o = n && !r;
        clearTimeout(r), r = setTimeout(a, t), o && e.apply(s, i)
    }
}(function () {
    var e = this;
    e.N2_ = e.N2_ || {
        r: [],
        d: []
    }, e.N2R = e.N2R || function () {
        e.N2_.r.push(arguments)
    }, e.N2D = e.N2D || function () {
        e.N2_.d.push(arguments)
    }
}).call(window), N2Deferred.prototype._doCallbacks = function () {
        if (0 !== this.state)
            for (; this.callbacks.length > 0;) this.callbacks.shift().apply(window, this.args)
    }, N2Deferred.prototype.resolve = function () {
        this.state = 1, this.args = arguments, this._doCallbacks()
    }, N2Deferred.prototype.reject = function () {
        this.state = -1, this._doCallbacks()
    }, N2Deferred.prototype.then = function (e) {
        this.callbacks.push(e), this._doCallbacks()
    }, N2Deferred.n2When = function (e) {
        var t = e.length,
            n = new N2Deferred;
        if (0 === t) n.resolve();
        else
            for (var r = 0, s = function () {
                    r++, r === t && n.resolve()
                }, i = 0; t > i; i++) e[i] instanceof N2Deferred ? e[i].then(s) : s();
        return n
    },
    function (e) {
        "use strict";
        this.N2Classes = {};
        var t = {};
        this.N2D = function (n, r, s) {
            var i = [];
            if (n && t[n] === e && (t[n] = new N2Deferred), 2 === arguments.length ? (s = arguments[1], r = []) : "string" == typeof r && (r = [r]), r = r || [], "$" !== n && r.push("$"), r.length)
                for (var a = 0; a < r.length; a++) t[r[a]] === e && (t[r[a]] = new N2Deferred), i.push(t[r[a]]);
            N2Deferred.n2When(i).then(function () {
                if ("function" == typeof s) {
                    var e = s.apply(N2Classes, [N2Classes.$]);
                    e instanceof N2Deferred ? e.then(function (e) {
                        N2Classes[n] = e, t[n].resolve()
                    }) : (N2Classes[n] = e, t[n].resolve())
                } else N2Classes[n] = !0, t[n].resolve()
            })
        };
        for (var n = 0; n < this.N2_.d.length; n++) this.N2D.apply(this, this.N2_.d[n]);
        this.N2R = function (n, r) {
            var s = [];
            if (1 === arguments.length ? (r = arguments[0], n = []) : "string" == typeof n && (n = [n]), n = n || [], n.push("$"), n !== e && n)
                for (var i = 0; i < n.length; i++) t[n[i]] === e && (t[n[i]] = new N2Deferred), s.push(t[n[i]]);
            N2Deferred.n2When(s).then(function () {
                for (var e = [N2Classes.$], t = 0; t < n.length - 1; t++) e.push(N2Classes[n[t]]);
                r.apply(N2Classes, e)
            })
        };
        for (var r = 0; r < this.N2_.r.length; r++) this.N2R.apply(this, this.N2_.r[r])
    }.call(window),
    function () {
        var e = new Date,
            t = function () {
                if (window.nextend && window.jQuery) {
                    var n = window.jQuery;
                    N2D("$", function () {
                        return window.n2 = n, n
                    }), N2R("nextend-frontend", function () {
                        n(document).ready(function () {
                            N2D("documentReady")
                        }), "complete" === document.readyState ? N2D("windowLoad") : n(window).on("load", function () {
                            N2D("windowLoad")
                        })
                    })
                } else if (setTimeout(t, 20), (new Date).getTime() - e.getTime() > 1e3) {
                    var r = document.createElement("script");
                    r.src = "//ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js", document.getElementsByTagName("head")[0].appendChild(r)
                }
            };
        t()
    }(), N2R("$", function (e) {
        var t = {};
        e.each(["Quad", "Cubic", "Quart", "Quint", "Expo"], function (e, n) {
            t[n] = function (t) {
                return Math.pow(t, e + 2)
            }
        }), e.extend(t, {
            Sine: function (e) {
                return 1 - Math.cos(e * Math.PI / 2)
            },
            Circ: function (e) {
                return 1 - Math.sqrt(1 - e * e)
            },
            Elastic: function (e) {
                return 0 === e || 1 === e ? e : -Math.pow(2, 8 * (e - 1)) * Math.sin((80 * (e - 1) - 7.5) * Math.PI / 15)
            },
            Back: function (e) {
                return e * e * (3 * e - 2)
            },
            Bounce: function (e) {
                for (var t, n = 4; e < ((t = Math.pow(2, --n)) - 1) / 11;);
                return 1 / Math.pow(4, 3 - n) - 7.5625 * Math.pow((3 * t - 2) / 22 - e, 2)
            }
        }), e.each(t, function (t, n) {
            e.easing["easeIn" + t] = n, e.easing["easeOut" + t] = function (e) {
                return 1 - n(1 - e)
            }, e.easing["easeInOut" + t] = function (e) {
                return .5 > e ? n(2 * e) / 2 : 1 - n(-2 * e + 2) / 2
            }
        })
    }), N2D("n2");