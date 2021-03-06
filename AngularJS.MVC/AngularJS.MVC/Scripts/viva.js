﻿if (typeof $ == "undefined") throw "VivaPayments.js requires jQuery";

(function (n) {
    window.XDomainRequest && n.ajaxTransport(function (t) {
        if (t.crossDomain && t.async) {
            t.timeout && (t.xdrTimeout = t.timeout, delete t.timeout);
            var i;
            return {
                send: function (r, u) {
                    function f(t, r, f, e) {
                        i.onload = i.onerror = i.ontimeout = i.onprogress = n.noop;
                        i = undefined;
                        u(t, r, f, e)
                    }
                    i = new XDomainRequest;
                    i.open(t.type, t.url);
                    i.onload = function () {
                        f(200, "OK", {
                            text: i.responseText
                        }, "Content-Type: " + i.contentType)
                    };
                    i.onerror = function () {
                        f(404, "Not Found")
                    };
                    i.onprogress = function () { };
                    t.xdrTimeout && (i.ontimeout = function () {
                        f(0, "timeout")
                    }, i.timeout = t.xdrTimeout);
                    i.send(t.hasContent && t.data || null)
                },
                abort: function () {
                    i && (i.onerror = n.noop(), i.abort())
                }
            }
        }
    })
})(jQuery);

typeof String.prototype.trimAll == "undefined" && (String.prototype.trimAll = function () {
    return this.replace(/\s+/g, "")
}),

function (n, t, i) {
    function s(n) {
        return u.logPrefix.concat(n)
    }

    function h(n, t) {
        return (t = t.toString(), n = n.toString(), !/^(\d{2}|\d{4})$/.test(t) || !/^\d{1,2}$/.test(n)) ? null : (t.length == 2 ? "20" + t : t) + "-" + (n.length == 1 ? "0" + n : n) + "-15"
    }

    function o(n) {
        return /^\d/.test(n)
    }

    function f(n, t) {
        this.ErrorCode = n;
        this.ErrorText = s(t);
        this.toString = function () {
            return this.ErrorText
        }
    }

    function e(n, t) {
        return {
            Error: new f(n, t)
        }
    }
    var c = typeof window.console == "undefined" ? i : window.console,
        r, u;
    n.version = 223;
    r = n.statusCode = {
        OK: 200,
        LOCKED: 423,
        NOT_FOUND: 404,
        BAD_REQUEST: 400
    };
    u = {
        baseURL: "https://www.vivapayments.com",
        logPrefix: "VivaPayments: "
    };
    n.MessageType = {
        CHECKOUT_FRAME_READY: "vp_sc_frameReady",
        CARD_TOKEN_SUCCESS: "vp_sc_tokenSuccess",
        CHECKOUT_FRAME_CLOSE: "vp_sc_frameClose",
        POLL_START: "vp_sc_pollStart",
        POLL_STOP: "vp_sc_pollStop",
        PING: "vp_sc_ping"
    };
    n.getURLs = function () {
        return {
            cardtoken: u.baseURL.concat("/api/cards"),
            installments: u.baseURL.concat("/api/cards/installments"),
            simpleCheckout: u.baseURL.concat("/web/checkout/simplecheckout"),
            simpleCheckoutImg: u.baseURL.concat("/web/content/images/simplecheckout/btn_@lang@.png")
        }
    };
    u.urls = n.getURLs();
    n.setBaseURL = function (t) {
        t = t[t.length - 1] == "/" ? t.substring(0, t.length - 1) : t;
        u.baseURL = t;
        u.urls = n.getURLs()
    };
    n.PaymentsMessage = function (n, t) {
        this.MessageType = n;
        this.MessageData = t
    };
    n.isMobileSafari = function () {
        var n = navigator.userAgent;
        return /(iPhone|iPad|iPod)/i.test(n) && /Safari/i.test(n)
    },
        function (s) {
            function a() {
                var n = c.cardnumber;
                if (s.settings.options.installmentsHandler) n.on("blur", function () {
                    var n = t(this).val().trimAll(),
                        r = s.settings.options.installmentsHandler;
                    n != l && o(n) && t.ajax({
                        url: u.urls.installments,
                        method: "GET",
                        headers: {
                            CardNumber: n,
                            NativeCheckoutVersion: VivaPayments.version
                        },
                        data: {
                            key: s.settings.options.publicKey
                        }
                    }).done(function (n) {
                        r({
                            MaxInstallments: n.MaxInstallments
                        })
                    }).fail(function (n) {
                        r(e(n.status, n.statusText))
                    }).always(function (t) {
                        l = t.MaxInstallments ? n : i
                    })
                })
            }

            function v(n) {
                if (typeof n == "undefined") throw new f(r.BAD_REQUEST, "No options have been set");
                if (!n.publicKey || !(typeof n.publicKey == "string") || n.publicKey.length == 0) throw new f(r.BAD_REQUEST, "Public key not valid");
                if (!n.cardTokenHandler || !t.isFunction(n.cardTokenHandler)) throw new f(r.BAD_REQUEST, "cardTokenHandler was either undefined or is not a function");
                if (n.installmentsHandler && !t.isFunction(n.installmentsHandler)) throw new f(r.BAD_REQUEST, "installmentsHandler is not a function");
                var i = !1;
                t.each(s.settings.requiredDataAttrs, function (n, u) {
                    var e;
                    if (u != "month" && u != "year" || !i)
                        if ((e = t('[data-vp="' + u + '"]')).length == 0) {
                            if (u == "expdate") return;
                            throw new f(r.NOT_FOUND, 'Required data-vp attribute "' + u + '" was not found');
                        } else if (e.length > 1) throw new f(r.BAD_REQUEST, 'Attribute violation. data-vp "' + u + '" was found multiple times');
                        else u == "expdate" && (i = !0), e.removeAttr("name"), c[u] = e
                });
                t.each(s.settings.optionalDataAttrs, function (n, i) {
                    var u;
                    if ((u = t('[data-vp="' + i + '"]')).length == 1) c[i] = u;
                    else if (u.length > 1) throw new f(r.BAD_REQUEST, 'Attribute violation. data-vp "' + i + '" was found multiple times');
                })
            }
            var c = {},
                l = i;
            s.settings = {
                requiredDataAttrs: ["cardnumber", "cardholder", "cvv", "expdate", "month", "year"],
                optionalDataAttrs: ["friendlyname", "clientid"]
            };
            s.setup = function (t) {
                s.settings.options = {
                    baseURL: t.baseURL || u.baseURL,
                    publicKey: t.publicKey || i,
                    installmentsHandler: t.installmentsHandler || i,
                    cardTokenHandler: t.cardTokenHandler || i
                };
                n.setBaseURL(s.settings.options.baseURL);
                v(s.settings.options);
                a()
            };
            s.requestToken = function () {
                var i = s.settings.options.cardTokenHandler,
                    a, v, p, l, y, n;
                for (p in c) c[p].removeAttr("name");
                if (typeof c.expdate != "undefined") {
                    if (l = c.expdate.val().trimAll().split("/"), l.length != 2) throw new f(r.BAD_REQUEST, "Expiration date could not be parsed");
                    a = l[0];
                    v = l[1]
                } else a = c.month.val(), v = c.year.val();
                if (y = h(a, v), y == null) {
                    i(e(r.BAD_REQUEST, "Expiration Date information could not be parsed"));
                    return
                }
                if (n = {
                    Number: c.cardnumber.val().trimAll(),
                    CVC: c.cvv.val(),
                    ExpirationDate: y,
                    CardHolderName: c.cardholder.val()
                }, typeof c.friendlyname != "undefined" && (n.FriendlyName = c.friendlyname.val()), typeof c.token != "undefined" && (n.Token = c.token.val()), typeof c.clientid != "undefined" && (n.ClientId = c.clientid.val()), !o(n.Number) || n.CVC.length == 0) {
                    i(e(r.BAD_REQUEST, "Card number or CVV empty"));
                    return
                }
                if (n.CardHolderName.length == 0) {
                    i(e(r.BAD_REQUEST, "Cardholder cannot be empty"));
                    return
                }
                t.ajax({
                    url: u.urls.cardtoken + "?key=" + encodeURIComponent(s.settings.options.publicKey),
                    type: "POST",
                    headers: {
                        NativeCheckoutVersion: VivaPayments.version
                    },
                    data: n
                }).done(function (n) {
                    i(n)
                }).fail(function (n) {
                    i(e(n.status, n.statusText))
                })
            }
        }(n.cards = n.cards || {}),
        function () {
            function g() {
                if (t.each(p, function (n, t) {
                        if (!(i[t] = s.data("vp-" + t))) throw new f(r.NOT_FOUND, 'Required data-vp attribute "' + t + '" was not found or is empty');
                }), t.each(w, function (n, t) {
                        var r = s.data("vp-" + t);
                        r && (i[t] = r)
                }), i.baseurl && n.setBaseURL(i.baseurl), typeof i.expandcard != "undefined" && typeof i.expandcard != "boolean") throw new f(r.BAD_REQUEST, "Invalid data-vp-expandcard value");
                if (t.inArray(i.lang, b) < 0) throw new f(r.BAD_REQUEST, "Invalid data-vp-lang value");
                simpleUrl = u.urls.simpleCheckout + "?" + t.param(i)
            }

            function nt(n) {
                h ? e.get(0).contentWindow.postMessage(JSON.stringify(n), u.baseURL) : e.postMessage(JSON.stringify(n), u.baseURL)
            }

            function tt() {
                var n = '<iframe name="vp_sc_iframe" class="vp_sc_iframe" src="' + simpleUrl + '" style="position: fixed; overflow-x: hidden; overflow-y: auto; left: 0px; top: 0px; width: 100%; height: 100%;z-index: 9999; border: 0; display: none;"><\/iframe>';
                t("body").append(n);
                e = t("iframe.vp_sc_iframe");
                l(!0)
            }

            function it() {
                k = !0
            }

            function rt(n) {
                var i, u = n.MessageData,
                    t = s.closest("form");
                if (!t.length) throw new f(r, "No form element was found for submission");
                i = '<input name="@name@" type="hidden" value="@value@" />'.replace("@name@", "vivaWalletToken").replace("@value@", u.Token);
                t.prepend(i);
                y();
                setTimeout(function () {
                    t.submit()
                }, 300)
            }

            function y() {
                h ? (e.fadeOut(300), ft()) : e.close()
            }

            function l(t) {
                if (!t && c) {
                    clearInterval(c);
                    c = null;
                    return
                }
                c = setInterval(function () {
                    nt(new n.PaymentsMessage(n.MessageType.PING))
                }, 300)
            }

            function ut() {
                o[n.MessageType.CHECKOUT_FRAME_READY] = it;
                o[n.MessageType.CARD_TOKEN_SUCCESS] = rt;
                o[n.MessageType.CHECKOUT_FRAME_CLOSE] = y;
                o[n.MessageType.POLL_START] = function () {
                    l(!0)
                };
                o[n.MessageType.POLL_STOP] = function () {
                    l(!1)
                };
                t(window).on("message", function (n) {
                    var t = JSON.parse(n.originalEvent.data);
                    t && o[t.MessageType] && o[t.MessageType](t)
                })
            }

            function ft() {
                setTimeout(function () {
                    e.attr("src", e.attr("src"))
                }, 300)
            }

            function et(n) {
                var t = u.urls.simpleCheckoutImg.replace("@lang@", i.lang);
                a = a.replace("@imgUrl@", t);
                n.html(a);
                n.attr("style", d)
            }
            var v = window.VivaPayments.Simple = {},
                p = ["publickey", "amount"],
                w = ["lang", "baseurl", "expandcard", "walletonly", "sourcecode", "resellerid", "description", "merchantref", "customeremail", "maxinstallments", "customersurname", "customerfirstname", "resellersourcecode"],
                b = ["en", "el"],
                i = {},
                o = {},
                k = !1,
                s, a = '<img src="http://cms.clarksmcr.com/upload/EU/StaticContent/help/howtousethecheckout/images/proc-check-for-guide.gif" style="border-radius: 10px; max-height: 44px; max-width: auto;">',
                d = "background-color: transparent;border: none;cursor: pointer;",
                e, h = !n.isMobileSafari(),
                c;
            v.initSimple = function () {
                if (s = t("[data-vp-publickey]"), s.length == 1) {
                    g();
                    et(s);
                    ut();
                    h && tt();
                    s.on("click", function () {
                        l(!0);
                        h ? e.fadeIn(300) : e = window.open(simpleUrl)
                    })
                }
            };
            t(function () {
                v.initSimple()
            })
        }()
}(window.VivaPayments = window.VivaPayments || {}, jQuery)