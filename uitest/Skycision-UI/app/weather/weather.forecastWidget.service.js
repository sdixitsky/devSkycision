(function() {
/* jshint ignore:start */
angular
    .module('skyApp.weather')
    .factory('ForecastService', ['$http', '$log', ForecastService]);

function ForecastService($http, $log) {
    
    var service = {};
    
    // Main methods
    service.generateWidget = generateWidget;
    service.setForecast = setForecast;

    var Skycons;
    (function(e) {
        "use strict";
        function u(e, t, n, r) {
            e.beginPath(), e.arc(t, n, r, 0, s, !1), e.fill()
        }
        function a(e, t, n, r, i) {
            e.beginPath(), e.moveTo(t, n), e.lineTo(r, i), e.stroke()
        }
        function f(e, t, n, r, i, o, a, f) {
            var l = Math.cos(t * s), c = Math.sin(t * s);
            f -= a, u(e, n - c * i, r + l * o + f * .5, a + (1 - l * .5) * f)
        }
        function l(e, t, n, r, i, s, o, u) {
            var a;
            for (a = 5; a--;)
                f(e, t + a / 5, n, r, i, s, o, u)
        }
        function c(e, t, n, r, i, s, o) {
            t/=3e4;
            var u = i * .21, a = i * .12, f = i * .24, c = i * .28;
            e.fillStyle = o, l(e, t, n, r, u, a, f, c), e.globalCompositeOperation = "destination-out", l(e, t, n, r, u, a, f - s, c - s), e.globalCompositeOperation = "source-over"
        }
        function h(e, t, n, r, i, o, u) {
            t/=12e4;
            var f = i * .25 - o * .5, l = i * .32 + o * .5, c = i * .5 - o * .5, h, p, d, v;
            e.strokeStyle = u, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.arc(n, r, f, 0, s, !1), e.stroke();
            for (h = 8; h--;)
                p = (t + h / 8) * s, d = Math.cos(p), v = Math.sin(p), a(e, n + d * l, r + v * l, n + d * c, r + v * c)
        }
        function p(e, t, n, r, i, u, a) {
            t/=15e3;
            var f = i * .29 - u * .5, l = i * .05, c = Math.cos(t * s), h = c * s/-16;
            e.strokeStyle = a, e.lineWidth = u, e.lineCap = "round", e.lineJoin = "round", n += c * l, e.beginPath(), e.arc(n, r, f, h + s / 8, h + s * 7 / 8, !1), e.arc(n + Math.cos(h) * f * o, r + Math.sin(h) * f * o, f, h + s * 5 / 8, h + s * 3 / 8, !0), e.closePath(), e.stroke()
        }
        function d(e, t, n, r, i, o, u) {
            t/=1350;
            var a = i * .16, f = s * 11 / 12, l = s * 7 / 12, c, h, p, d;
            e.fillStyle = u;
            for (c = 4; c--;)
                h = (t + c / 4)%1, p = n + (c - 1.5) / 1.5 * (c === 1 || c === 2?-1 : 1) * a, d = r + h * h * i, e.beginPath(), e.moveTo(p, d - o * 1.5), e.arc(p, d, o * .75, f, l, !1), e.fill()
        }
        function v(e, t, n, r, i, o, u) {
            t/=750;
            var f = i * .1875, l = s * 11 / 12, c = s * 7 / 12, h, p, d, v;
            e.strokeStyle = u, e.lineWidth = o * .5, e.lineCap = "round", e.lineJoin = "round";
            for (h = 4; h--;)
                p = (t + h / 4)%1, d = Math.floor(n + (h - 1.5) / 1.5 * (h === 1 || h === 2?-1 : 1) * f) + .5, v = r + p * i, a(e, d, v - o * 1.5, d, v + o * 1.5)
        }
        function m(e, t, n, r, i, o, u) {
            t/=3e3;
            var f = i * .16, l = o * .75, c = t * s * .7, h = Math.cos(c) * l, p = Math.sin(c) * l, d = c + s / 3, v = Math.cos(d) * l, m = Math.sin(d) * l, g = c + s * 2 / 3, y = Math.cos(g) * l, b = Math.sin(g) * l, w, E, S, x;
            e.strokeStyle = u, e.lineWidth = o * .5, e.lineCap = "round", e.lineJoin = "round";
            for (w = 4; w--;)
                E = (t + w / 4)%1, S = n + Math.sin((E + w / 4) * s) * f, x = r + E * i, a(e, S - h, x - p, S + h, x + p), a(e, S - v, x - m, S + v, x + m), a(e, S - y, x - b, S + y, x + b)
        }
        function g(e, t, n, r, i, s, o) {
            t/=3e4;
            var u = i * .21, a = i * .06, f = i * .21, c = i * .28;
            e.fillStyle = o, l(e, t, n, r, u, a, f, c), e.globalCompositeOperation = "destination-out", l(e, t, n, r, u, a, f - s, c - s), e.globalCompositeOperation = "source-over"
        }
        function w(e, t, n, r, i, o, u) {
            var a = i / 8, f = a / 3, l = 2 * f, c = t%1 * s, h = Math.cos(c), p = Math.sin(c);
            e.fillStyle = u, e.strokeStyle = u, e.lineWidth = o, e.lineCap = "round", e.lineJoin = "round", e.beginPath(), e.arc(n, r, a, c, c + Math.PI, !1), e.arc(n - f * h, r - f * p, l, c + Math.PI, c, !1), e.arc(n + l * h, r + l * p, f, c + Math.PI, c, !0), e.globalCompositeOperation = "destination-out", e.fill(), e.globalCompositeOperation = "source-over", e.stroke()
        }
        function E(e, t, n, r, i, s, o, u, a) {
            t/=2500;
            var f = y[o], l = (t + o - b[o].start)%u, c = (t + o - b[o].end)%u, h = (t + o)%u, p, d, v, m;
            e.strokeStyle = a, e.lineWidth = s, e.lineCap = "round", e.lineJoin = "round";
            if (l < 1) {
                e.beginPath(), l*=f.length / 2 - 1, p = Math.floor(l), l -= p, p*=2, p += 2, e.moveTo(n + (f[p - 2] * (1 - l) + f[p] * l) * i, r + (f[p - 1] * (1 - l) + f[p + 1] * l) * i);
                if (c < 1) {
                    c*=f.length / 2 - 1, d = Math.floor(c), c -= d, d*=2, d += 2;
                    for (m = p; m !== d; m += 2)
                        e.lineTo(n + f[m] * i, r + f[m + 1] * i);
                    e.lineTo(n + (f[d - 2] * (1 - c) + f[d] * c) * i, r + (f[d - 1] * (1 - c) + f[d + 1] * c) * i)
                } else 
                    for (m = p; m !== f.length; m += 2)
                        e.lineTo(n + f[m] * i, r + f[m + 1] * i);
                e.stroke()
            } else if (c < 1) {
                e.beginPath(), c*=f.length / 2 - 1, d = Math.floor(c), c -= d, d*=2, d += 2, e.moveTo(n + f[0] * i, r + f[1] * i);
                for (m = 2; m !== d; m += 2)
                    e.lineTo(n + f[m] * i, r + f[m + 1] * i);
                e.lineTo(n + (f[d - 2] * (1 - c) + f[d] * c) * i, r + (f[d - 1] * (1 - c) + f[d + 1] * c) * i), e.stroke()
            }
            h < 1 && (h*=f.length / 2 - 1, v = Math.floor(h), h -= v, v*=2, v += 2, w(e, t, n + (f[v - 2] * (1 - h) + f[v] * h) * i, r + (f[v - 1] * (1 - h) + f[v + 1] * h) * i, i, s, a))
        }
        var t, n;
        (function() {
            var r = e.requestAnimationFrame || e.webkitRequestAnimationFrame || e.mozRequestAnimationFrame || e.oRequestAnimationFrame || e.msRequestAnimationFrame, i = e.cancelAnimationFrame || e.webkitCancelAnimationFrame || e.mozCancelAnimationFrame || e.oCancelAnimationFrame || e.msCancelAnimationFrame;
            r && i ? (t = function(e, t) {
                function i() {
                    n.value = r(i), e()
                }
                var n = {
                    value: null
                };
                return i(), n
            }, n = function(e) {
                i(e.value)
            }) : (t = setInterval, n = clearInterval)
        })();
        var r = 500, i = 0.08, s = 2 * Math.PI, o = 2 / Math.sqrt(2), y = [[ - 0.75, - 0.18, - 0.7219, - 0.1527, - 0.6971, - 0.1225, - 0.6739, - 0.091, - 0.6516, - 0.0588, - 0.6298, - 0.0262, - 0.6083, 0.0065, - 0.5868, 0.0396, - 0.5643, 0.0731, - 0.5372, 0.1041, - 0.5033, 0.1259, - 0.4662, 0.1406, - 0.4275, 0.1493, - 0.3881, 0.153, - 0.3487, 0.1526, - 0.3095, 0.1488, - 0.2708, 0.1421, - 0.2319, 0.1342, - 0.1943, 0.1217, - 0.16, 0.1025, - 0.129, 0.0785, - 0.1012, 0.0509, - 0.0764, 0.0206, - 0.0547, - 0.012, - 0.0378, - 0.0472, - 0.0324, - 0.0857, - 0.0389, - 0.1241, - 0.0546, - 0.1599, - 0.0814, - 0.1876, - 0.1193, - 0.1964, - 0.1582, - 0.1935, - 0.1931, - 0.1769, - 0.2157, - 0.1453, - 0.229, - 0.1085, - 0.2327, - 0.0697, - 0.224, - 0.0317, - 0.2064, 0.0033, - 0.1853, 0.0362, - 0.1613, 0.0672, - 0.135, 0.0961, - 0.1051, 0.1213, - 0.0706, 0.1397, - 0.0332, 0.1512, 0.0053, 0.158, 0.0442, 0.1624, 0.0833, 0.1636, 0.1224, 0.1615, 0.1613, 0.1565, 0.1999, 0.15, 0.2378, 0.1402, 0.2749, 0.1279, 0.3118, 0.1147, 0.3487, 0.1015, 0.3858, 0.0892, 0.4236, 0.0787, 0.4621, 0.0715, 0.5012, 0.0702, 0.5398, 0.0766, 0.5768, 0.089, 0.6123, 0.1055, 0.6466, 0.1244, 0.6805, 0.144, 0.7147, 0.163, 0.75, 0.18], [ - 0.75, 0, - 0.7033, 0.0195, - 0.6569, 0.0399, - 0.6104, 0.06, - 0.5634, 0.0789, - 0.5155, 0.0954, - 0.4667, 0.1089, - 0.4174, 0.1206, - 0.3676, 0.1299, - 0.3174, 0.1365, - 0.2669, 0.1398, - 0.2162, 0.1391, - 0.1658, 0.1347, - 0.1157, 0.1271, - 0.0661, 0.1169, - 0.017, 0.1046, 0.0316, 0.0903, 0.0791, 0.0728, 0.1259, 0.0534, 0.1723, 0.0331, 0.2188, 0.0129, 0.2656, - 0.0064, 0.3122, - 0.0263, 0.3586, - 0.0466, 0.4052, - 0.0665, 0.4525, - 0.0847, 0.5007, - 0.1002, 0.5497, - 0.113, 0.5991, - 0.124, 0.6491, - 0.1325, 0.6994, - 0.138, 0.75, - 0.14]], b = [{
            start: 0.36,
            end: 0.11
        }, {
            start: 0.56,
            end: 0.16
        }
        ];
        Skycons = function(e) {
            this.list = [], this.interval = null, this.color = e && e.color ? e.color : "black", this.resizeClear=!!e&&!!e.resizeClear
        }, Skycons.CLEAR_DAY = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            h(e, t, r * .5, s * .5, o, o * i, n)
        }, Skycons.CLEAR_NIGHT = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            p(e, t, r * .5, s * .5, o, o * i, n)
        }, Skycons.PARTLY_CLOUDY_DAY = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            h(e, t, r * .625, s * .375, o * .75, o * i, n), c(e, t, r * .375, s * .625, o * .75, o * i, n)
        }, Skycons.PARTLY_CLOUDY_NIGHT = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            p(e, t, r * .667, s * .375, o * .75, o * i, n), c(e, t, r * .375, s * .625, o * .75, o * i, n)
        }, Skycons.CLOUDY = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            c(e, t, r * .5, s * .5, o, o * i, n)
        }, Skycons.RAIN = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            d(e, t, r * .5, s * .37, o * .9, o * i, n), c(e, t, r * .5, s * .37, o * .9, o * i, n)
        }, Skycons.SLEET = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            v(e, t, r * .5, s * .37, o * .9, o * i, n), c(e, t, r * .5, s * .37, o * .9, o * i, n)
        }, Skycons.SNOW = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            m(e, t, r * .5, s * .37, o * .9, o * i, n), c(e, t, r * .5, s * .37, o * .9, o * i, n)
        }, Skycons.WIND = function(e, t, n) {
            var r = e.canvas.width, s = e.canvas.height, o = Math.min(r, s);
            E(e, t, r * .5, s * .5, o, o * i, 0, 2, n), E(e, t, r * .5, s * .5, o, o * i, 1, 2, n)
        }, Skycons.FOG = function(e, t, n) {
            var r = e.canvas.width, o = e.canvas.height, u = Math.min(r, o), f = u * i;
            g(e, t, r * .5, o * .32, u * .75, f, n), t/=5e3;
            var l = Math.cos(t * s) * u * .02, c = Math.cos((t + .25) * s) * u * .02, h = Math.cos((t + .5) * s) * u * .02, p = Math.cos((t + .75) * s) * u * .02, d = o * .936, v = Math.floor(d - f * .5) + .5, m = Math.floor(d - f * 2.5) + .5;
            e.strokeStyle = n, e.lineWidth = f, e.lineCap = "round", e.lineJoin = "round", a(e, l + r * .2 + f * .5, v, c + r * .8 - f * .5, v), a(e, h + r * .2 + f * .5, m, p + r * .8 - f * .5, m)
        }, Skycons.prototype = {
            add: function(e, t) {
                var n;
                typeof e == "string" && (e = document.getElementById(e)), n = {
                    element: e,
                    context: e.getContext("2d"),
                    drawing: t
                }, this.list.push(n), this.draw(n, r)
            },
            set: function(e, t) {
                var n;
                typeof e == "string" && (e = document.getElementById(e));
                for (n = this.list.length; n--;)
                    if (this.list[n].element === e) {
                        this.list[n].drawing = t, this.draw(this.list[n], r);
                        return 
                    }
                this.add(e, t)
            },
            remove: function(e) {
                var t;
                typeof e == "string" && (e = document.getElementById(e));
                for (t = this.list.length; t--;)
                    if (this.list[t].element === e) {
                        this.list.splice(t, 1);
                        return 
                    }
            },
            draw: function(e, t) {
                var n = e.context.canvas;
                this.resizeClear ? n.width = n.width : e.context.clearRect(0, 0, n.width, n.height), e.drawing(e.context, t, this.color)
            },
            play: function() {
                var e = this;
                this.pause(), this.interval = t(function() {
                    var t = Date.now(), n;
                    for (n = e.list.length; n--;)
                        e.draw(e.list[n], t)
                }, 1e3 / 60)
            },
            pause: function() {
                var e;
                this.interval && (n(this.interval), this.interval = null)
            }
        }
    })(window);
    var StaticSkycons = function() {
        var e = {};
        return e.play = e.pause = function() {}, e.set = function(e, t) {
            // var n = $("#" + e),
            //     r = $("<img />").attr("id", n.attr("id")).attr("class", n.attr("class")).attr("src", "skycons/" + t + ".gif").css({
            //         width: n.width(),
            //         height: n.height()
            //     });
        }, e;
    };
    StaticSkycons.RAIN = "rain";
    StaticSkycons.SNOW = "snow";
    StaticSkycons.SLEET = "sleet";
    StaticSkycons.WIND = "wind";
    StaticSkycons.FOG = "fog";
    StaticSkycons.CLOUDY = "cloudy";
    StaticSkycons.PARTLY_CLOUDY_DAY = "partly_cloudy_day";
    StaticSkycons.PARTLY_CLOUDY_NIGHT = "partly_cloudy_night";
    StaticSkycons.CLEAR_DAY = "clear_day";
    StaticSkycons.CLEAR_NIGHT = "clear_night";
    var ForecastEmbed = function(e) {
        var t = {},
            n, r, i, s = function() {
                n = $('      <div id="forecast_embed" class="fe_container">                           <div class="fe_forecast">           <div class="fe_currently">             <canvas id="fe_current_icon" width="160" height="160" style="width:80px; height:80px"></canvas>             <div class="fe_temp"></div>             <div class="fe_summary"></div>             <div class="fe_wind"></div>           </div>                      <div class="fe_daily"></div>           <div style="clear:left"></div>         </div>                  <div class="fe_alert" style="display:none"></div>                  <div class="fe_loading" style="display:none">           <canvas id="fe_loading_icon" width="100" height="100" style="width:50px; height:50px"></canvas>           Loading...         </div>       </div>     '), t.elem = n, e.static_skycons && (window.Skycons = StaticSkycons), r = new Skycons({
                    color: e.text_color || "#333"
                }), e.static_skycons && (window.Skycons = StaticSkycons), r = new StaticSkycons({
                    color: e.text_color || "#333"
                }), i = new Skycons({
                    color: e.text_color || "#333"
                }), (n.find(".fe_title .fe_location span").html(e.title), n.find(".fe_title").show());
                if (e.ff_name && e.ff_url) {
                    var s = document.createElement("style");
                    s.type = "text/css", document.getElementsByTagName("head")[0].appendChild(s);
                    var o = "font-family: " + e.ff_name + "; src: url(" + e.ff_url + ");";
                    s.styleSheet ? s.styleSheet.cssText = "@font-face {" + o + "}" : s.innerHTML = "@font-face {" + o + "}"
                }(e.font || e.ff_name) && $("#widgetEmbed").css("font-family", e.font || e.ff_name), e.text_color && (n.css("color", e.text_color), n.find("a").css("color", e.text_color), n.find(".fe_title").css("border-color", e.text_color), n.find(".fe_alert a").css("color", e.text_color)), $(window).bind("resize", a), a()
            }, o = function(e) {
                var t = Math.round(e / 45);
                return ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"][t]
            }, u = function(e) {
                return e === "rain" ? Skycons.RAIN : e === "snow" ? Skycons.SNOW : e === "sleet" ? Skycons.SLEET : e === "hail" ? Skycons.SLEET : e === "wind" ? Skycons.WIND : e === "fog" ? Skycons.FOG : e === "cloudy" ? Skycons.CLOUDY : e === "partly-cloudy-day" ? Skycons.PARTLY_CLOUDY_DAY : e === "partly-cloudy-night" ? Skycons.PARTLY_CLOUDY_NIGHT : e === "clear-day" ? Skycons.CLEAR_DAY : e === "clear-night" ? Skycons.CLEAR_NIGHT : Skycons.CLOUDY
            }, a = function() {
                $("#widgetEmbed").width() < 400 ? ($("#widgetEmbed").addClass("hide_daily"), i.pause()) : ($("#widgetEmbed").removeClass("hide_daily"), i.play())
            }, f = function(t) {
                var r = (new Date).getTime() / 1e3,
                    s = t.hourly.data,
                    a = t.currently.summary,
                    f = ForecastEmbed.unit_labels[e.units || "us"].speed;
                t.minutely && !t.minutely.summary.match(/ for the hour\.$/) && (a = t.minutely.summary);
                var l = 0;
                for (var c = 0; c < s.length; c++) {
                    if (s[c].time < r)
                        continue;
                    l = s[c].temperature > t.currently.temperature ? 1 : -1;
                    break;
                }
                var h = Math.round(t.currently.temperature) + "&deg;";
                l > 0 ? h += ' <span class="fe_dir">and rising</span>' : l < 0 && (h += ' <span class="fe_dir">and falling</span>'), n.find(".fe_currently .fe_temp").html(h), n.find(".fe_currently .fe_summary").html(a);
                if (t.currently.windSpeed) {
                    var p = Math.round(t.currently.windSpeed);
                    p != 0 && t.currently.windBearing ? p += " " + f + " (" + o(t.currently.windBearing) + ")" : p += " " + f, n.find(".fe_currently .fe_wind").html("Wind: " + p)
                }
                i.set("fe_current_icon", u(t.currently.icon))
            }, l = function(t) {
                var $daily_container = n.find(".fe_daily").empty();
                var r = $('<div class="fe_day">           <span class="fe_label">MON</span>           <canvas class="fe_icon" width="52" height="52" style="width:26px; height:26px" />           <div class="fe_temp_bar">             <span class="fe_high_temp">72&deg;</span>             <span class="fe_low_temp">50&deg;</span>           </div>         </div>'),
                    s = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    o = (new Date).getDay(),
                    a = t.daily.data,
                    f = Math.max(6, a.length),
                    l, c, h = -Infinity,
                    p = Infinity;
                for (var d = 0; d < f; d++)
                    l = a[d], l.temperatureMax > h && (h = l.temperatureMax), l.temperatureMin < p && (p = l.temperatureMin);
                var v = 82,
                    m = h - p,
                    g, y;
                for (var d = 0; d < f; d++)(function(t,$daily_container) {
                    c = r.clone(), l = a[t], g = v * (l.temperatureMax - l.temperatureMin) / m, y = v * (h - l.temperatureMax) / m, c.find(".fe_label").html(t == 0 ? "Today" : s[(o + t) % 7]), c.find(".fe_high_temp").html(Math.round(l.temperatureMax) + "&deg;"), c.find(".fe_low_temp").html(Math.round(l.temperatureMin) + "&deg;"), c.find(".fe_temp_bar").css({
                        height: g,
                        top: y,
                        "background-color": e.color || "#333"
                    }), typeof FlashCanvas != "undefined" && FlashCanvas.initElement(c.find("canvas")[0]), c.find(".fe_icon").attr("id", "fe_day_icon" + t), setTimeout(function() {
                        i.set("fe_day_icon" + t, u(a[t].icon))
                    }, 0), c.appendTo($daily_container)
                })(d, $daily_container)
            }, c = function(e) {
                var $alert = n.find(".fe_alert").empty();
                if (!e.alerts || !e.alerts.length) {
                    $alert.hide();
                    return
                }

                var t = e.alerts[0];
                $('<a target="_blank"></a>').html('<span class="fe_icon">&#9873;</span> ' + t.title).attr("href", t.uri).appendTo($alert), $alert.show()
            };

        return t.loading = function(e) {
                e ? (r.set("fe_loading_icon", Skycons.PARTLY_CLOUDY_DAY), r.play(), n.find(".fe_loading").show()) : (n.find(".fe_loading").hide(), r.pause())
            }, t.build = function(forecastData) {
                // n.find(".fe_title .fe_forecast_link a").attr("href", "http://forecast.io/#/f/" + forecastData.latitude + "," + forecastData.longitude)
                f(forecastData)
                l(forecastData)
                c(forecastData)
                $("#widgetEmbed").hasClass("hide_daily") || i.play()
            }, s(), t
    };
    ForecastEmbed.unit_labels = {
        us: {
            speed: "mph"
        },
        si: {
            speed: "m/s"
        },
        ca: {
            speed: "km/h"
        },
        uk: {
            speed: "mph"
        }
    };

    function generateWidget(opts) {
        service.embed = new ForecastEmbed(opts);
        service.embed.elem.prependTo($('#widgetEmbed'));
        service.embed.loading(true);
    }

    function setForecast(forecast) {
        setTimeout(function(){
            console.log('setting forecast');
            service.embed.build(forecast);
            service.embed.loading(false);
        }, 250);
    }

    return service;
}

/* jshint ignore:end */
})();
