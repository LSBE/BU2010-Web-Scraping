function GlobaleApp(shop, merchantCode, merchantId, countryCode, countryName, currencyCode, currencyName,
    locale, allowedCountries, operatedCountries, appUrl, apiUrl, geAppUrl, geCDNUrl, hiddenElements,
    pixelUrl, pixelEnabled, environment) {
    this.shop = shop;
    this.merchantCode = merchantCode;
    this.merchantId = merchantId;
    this.countryCode = countryCode;
    this.countryName = countryName;
    this.currencyCode = currencyCode
    this.currencyName = currencyName;
    this.locale = locale;
    this.allowedCountries = allowedCountries;
    this.operatedCountries = operatedCountries;
    this.appUrl = appUrl;
    this.apiUrl = apiUrl;
    this.geAppUrl = geAppUrl;
    this.geCDNUrl = geCDNUrl;
    this.hiddenElements = hiddenElements;
    this.listeners = {};
    this.pixelUrl = pixelUrl || 'https://utils.global-e.com';
    this.pixelEnabled = pixelEnabled;
    this.environment = environment;
    this.trackingCookieName = "GLBE_SESS_ID";
    this.hitInfoKey = "GE_C_HCOUNT";
    this.referreCookieName = "GlobalE_Ref";
    this.init();
}

GlobaleApp.prototype = (function () {
    var self = this;
    var events = {
        onXHRRequest: "onXHRRequest"
    };

    var initGeoDetect = function () {
        self.utils.getGeoLocation().then(function (res) {
            var promtCookie = document.cookie.split('; ').map(function (c) {
                var cookie = c.split('=');
                return { name: cookie[0], value: cookie[1] };
            }).find(function (cookie) { return cookie.name == 'glbe-country-promt' });

            if (!promtCookie && res.country != self.countryCode) {

                self.geoIpCountry = self.operatedCountries.find(function (c) { return c == res.country });
                if (self.geoIpCountry) {
                    //Temp solution to use GE popups as country promt
                    var updateWelcome = function (html) {
                        var country = glbeApp.operatedCountries.find(function (c) { return c == glbeApp.geoIpCountry; });

                        var welcomeContentHolder = document.createElement('div');
                        welcomeContentHolder.innerHTML = html;
                        var welcomePopup = welcomeContentHolder.firstChild;
                        var stayBtn = welcomePopup.querySelector('.stay-btn');
                        var leaveBtn = welcomePopup.querySelector('.leave-btn');
                        var closeBtn = welcomePopup.querySelector('.glClose');
                        closeBtn.addEventListener('click', function () {
                            welcomePopup.parentElement.removeChild(welcomePopup);
                        });
                        stayBtn.addEventListener('click', function () {
                            welcomePopup.parentElement.removeChild(welcomePopup);
                        });
                        leaveBtn.addEventListener('click', function () {
                            glbeApp.utils.formPost('/localization', { form_type: 'localization', _method: 'put', return_to: document.location.pathname, country_code: country });
                        });
                        welcomePopup.addEventListener('click', function (e) {
                            if (e.target == welcomePopup) {
                                welcomePopup.parentElement.removeChild(welcomePopup);
                            }
                        });
                        document.body.insertBefore(welcomePopup, document.body.firstChild);
                    };

                    if (window.GlobalE)//handle existing GEM integration
                    {
                        if (window.GlobalE.WelcomeManager)
                            window.GlobalE.WelcomeManager.UpdateWelcome = updateWelcome;
                        else
                            window.GlobalE.WelcomeManager = { UpdateWelcome: updateWelcome };
                    }
                    else
                    {
                        window.GlobalE = {
                            WelcomeManager: {
                                UpdateWelcome: updateWelcome
                            }
                        }
                    }
                    
                    document.cookie = 'glbe-country-promt=dismissed';
                    self.utils.getScript(self.geAppUrl + '/merchant/script/updatewelcome?merchantid=' + self.merchantId + '&country=' + res.country + '&culture=' + self.locale + '&currency=' + self.currencyCode + '&v=' + Math.floor((new Date()).getTime() / 1000 / 10) + '&environment=live&ismobile=false&loadSwitcherData=false');
                    /*
                    var countryPromt = document.createElement('div');
                    countryPromt.classList.add('glbe-country-promt');
                    var img = document.createElement('img');
                    img.src = '//gepi.global-e.com/content/images/flags/' + country.code + '.png';
                    countryPromt.innerHTML = 'Visiting from';
                    countryPromt.appendChild(img);
                    countryPromt.innerHTML += country.name + '? <a>Go to site</a>';
                    var closeBtn = document.createElement('div');
                    closeBtn.innerText = '×';
                    closeBtn.classList.add('glbe-close');
                    closeBtn.addEventListener('click', function () {
                        document.cookie = 'glbe-country-promt=dismissed';
                        countryPromt.parentElement.removeChild(countryPromt);
                    });
                    countryPromt.querySelector('a').addEventListener('click', function () {
                        document.cookie = 'glbe-country-promt=dismissed';
                        self.utils.formPost('/localization', { form_type: 'localization', _method: 'put', return_to: document.location.pathname, country_code: country });
                    });
                    countryPromt.appendChild(closeBtn);
                    document.body.insertBefore(countryPromt, document.body.firstChild);
                    */
                }
            }
        });
    };

    var initFreeShippingBanner = function () {
        //add missing gleTags function
        if (window.gleTags) //handle existing GEM integration
        {
            window.gleTags.freeShippingBannerShowed = function () { };
        }
        else {
            window.gleTags = {
                freeShippingBannerShowed: function () { }
            };
        }

        if (window.GlobalE)//handle existing GEM integration
            window.GlobalE.IsMobile = false;
        else
            window.GlobalE = { IsMobile: false };

        var url = self.geCDNUrl + 'merchant/freeShippingBanner?merchantId=' + self.merchantId + "&country=" + self.countryCode + "&currency=" + self.currencyCode + "&culture=";
        var cacheBuster = Math.floor((new Date()).getTime() / (1000 * 60 * 10)) //cache for 10 min
        url += "&cb=" + cacheBuster;
        self.utils.getScript(url);
    };

    var initHiddenElements = function () {
        if (isCountryOperated(self.countryCode)) {
            self.utils.contentLoaded(window, function () {
                setTimeout(function () {
                    document.querySelectorAll(".ge-hide,.afterpay-paragraph,form[action='https://payments.amazon.com/checkout/signin'],.ProductMeta__Klarna, div.ProductMeta div.Affirm").forEach(element => element.style.visibility = 'hidden');
                }, 4000);

            });
        }
    };

    var initRestrictions = function () {
        if (isCountryOperated(self.countryCode)) {
            self.utils.contentLoaded(window, function () {
                if (document.location.pathname == '/cart') {
                    self.utils.httpRequest("/cart.js", {
                        method: "GET",
                        contentType: "application/json"
                    }).then(function (cart) {
                        var variants = cart.items.map(function (i) { return 'productCode=' + i.variant_id; });
                        var query = 'encMerchantId=' + self.merchantCode + '&countryCode=' + self.countryCode + '&' + variants.join('&');
                        self.utils.httpRequest(self.apiUrl + "browsing/ProductCountryS?" + query, {
                            method: "POST",
                            contentType: "application/json"
                        }).then(function (response) {
                            var restricted = response.filter(function (e) { return e.IsRestricted || e.IsForbidden }).map(function (e) { return e.ProductCode })
                            if (restricted.length) {
                                var restrctedProducts = cart.items.filter(function (p) {
                                    return restricted.indexOf(p.variant_id.toString()) > -1;
                                }).map(function (p) {
                                    return p.product_title;
                                });
                                var notification = self.utils.notification('The following item(s) cannot be shipped to your country:\n' + restrctedProducts.join('\n') + '\nPlease edit your shopping cart to continue', 'warning');
                                var checkoutBtns = document.querySelectorAll('form[action$="/cart"] [type="submit"]');
                                checkoutBtns.forEach(function (b) { b.disabled = true });
                                self.utils.addListener(events.onXHRRequest, function (e) {
                                    var cartChangeUrls = ["/add.js", "/update.js", "/change.js"];
                                    var changed = false;
                                    for (var i = 0; i < cartChangeUrls.length; i++) {
                                        if (e.url.indexOf(cartChangeUrls[i]) > -1) {
                                            changed = true;
                                        }
                                    }
                                    if (changed) {
                                        self.utils.httpRequest("/cart.js", {
                                            method: "GET",
                                            contentType: "application/json"
                                        }).then(function (cart) {
                                            var restrctedProducts = cart.items.filter(function (p) {
                                                return restricted.indexOf(p.variant_id.toString()) > -1;
                                            });
                                            if (restrctedProducts.length === 0) {
                                                notification.parentElement.removeChild(notification);
                                                checkoutBtns.forEach(function (b) { b.disabled = false; });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
                else {
                    var variants = meta && meta.product && meta.product.variants;
                    if (variants) {
                        var query = 'encMerchantId=' + self.merchantCode + '&countryCode=' + self.countryCode + '&' + variants.map(function (v) { return 'productCode=' + v.id }).join('&');
                        self.utils.httpRequest(self.apiUrl + "browsing/ProductCountryS?" + query, {
                            method: "POST",
                            contentType: "application/json"
                        }).then(function (response) {
                            var isRestricted = !!response.filter(function (e) { return e.IsRestricted || e.IsForbidden }).length;
                            if (isRestricted) {
                                document.querySelectorAll('[action$="/cart/add"]').forEach(function (e) {
                                    e.style.display = 'none';
                                });
                                self.utils.notification('This product cannot be shipped to your country', 'warning');
                            }
                        });
                    }
                }
            });
        }
    };

    var addCountrySelector = function (selector, style, mode) {
        if (selector) {
            if (style)
                style = JSON.parse(style);

            var switcher = createSwitcherElement();
            switcher.classList.add(mode);
            var container = document.querySelector(selector);
            if (container) {

                switcher.style.marginBottom = (style.position.marginBottom || 0) + 'px';
                switcher.style.marginTop = -(style.position.marginBottom || 0) + 'px';
                switcher.style.marginLeft = (style.position.marginLeft || 0) + 'px';
                switcher.style.marginRight = -(style.position.marginLeft || 0) + 'px';

                switch (style.placement) {
                    case 'start':
                        container.insertBefore(switcher, container.firstChild);
                        break;
                    case 'end':
                        container.appendChild(switcher);
                        break;
                    case 'before':
                        container.parentElement.insertBefore(switcher, container);
                        break;
                    case 'after':
                        container.parentElement.insertBefore(switcher, container.nextSibling);
                        break;
                    case 'replace':
                        container.parentElement.replaceChild(switcher, container);
                        break;
                    default:
                        break;
                }

                var pos = switcher.getBoundingClientRect();
                var dropDownMaxWidth = window.innerWidth - pos.x - 35;
                switcher.querySelector('.glbe-selector-options').style.maxWidth = dropDownMaxWidth + 'px';

            }

        }
    };

    var initCountrySwitcher = function () {
        self.utils.httpRequest(self.appUrl + "Integration/App/CountrySelector?shop=" + self.shop, {
            method: "GET",
            contentType: "application/json"
        }).then(function (response) {
            var data = response.payload;
            if (data.enabled) {
                addCountrySelector(data.desktopSelector, data.desktopStyle, "desktop");
                addCountrySelector(data.mobileSelector, data.mobileStyle, "mobile");
                document.body.addEventListener('click', function () {
                    document.querySelectorAll('.glbe-selector-options').forEach(function (e) {
                        e.style.display = 'none';
                    })
                })
            }
        });
    };

    var isCountryOperated = function (countryCode) {
        return self.operatedCountries.indexOf(countryCode) > -1
    };

    var addStyles = function () {
        var link = document.createElement("link");
        link.href = self.appUrl + 'css/style.css';
        link.type = "text/css";
        link.rel = "stylesheet";
        document.getElementsByTagName("head")[0].appendChild(link);

        if (isCountryOperated(self.countryCode)) {
            var noplink = document.createElement("link");
            noplink.href = self.appUrl + 'css/style-op.css';
            noplink.type = "text/css";
            noplink.rel = "stylesheet";
            document.getElementsByTagName("head")[0].appendChild(noplink);
        }
    };

    var createSwitcherElement = function () {
        var switcher = document.createElement('span');
        switcher.classList.add('glbe-selector');
        switcher.innerHTML = '<span>' + self.countryName + '</span><span class="glbe-selector-options"></span>';
        switcher.style.backgroundImage = 'url(//gepi.global-e.com/content/images/flags/round/' + self.countryCode + '.png)';
        var countriesList = switcher.querySelector('.glbe-selector-options');
        var searchbox = document.createElement('span');
        searchbox.classList.add('glbe-country-search');
        var txtSearch = document.createElement('input');
        txtSearch.type = 'text';
        txtSearch.placeholder = 'Search';
        searchbox.appendChild(txtSearch);
        countriesList.appendChild(searchbox);
        searchbox.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        self.allowedCountries.forEach(function (c) {
            var country = document.createElement('span');
            country.classList.add('glbe-selector-option');
            country.innerHTML = c.name;
            country.style.backgroundImage = 'url(//gepi.global-e.com/content/images/flags/round/' + c.code + '.png)';
            country.addEventListener('click', function () {
                self.utils.formPost('/localization', { form_type: 'localization', _method: 'put', return_to: document.location.pathname, country_code: c.code });
            })
            country.countryName = c.name.toLowerCase();
            countriesList.appendChild(country);
        });

        var options = countriesList.querySelectorAll('.glbe-selector-option');
        txtSearch.addEventListener('keyup', function (e) {
            if (this.value.length > 2) {
                var txt = this.value.toLocaleLowerCase();
                Array.prototype.forEach.call(options, function (el) {

                    if (el.countryName.indexOf(txt) > -1) {
                        el.style.display = 'block';
                    }
                    else {
                        el.style.display = 'none';
                    }
                });
            }
            else {
                Array.prototype.forEach.call(options, function (el) {
                    el.style.display = 'block';
                });
            }
        });

        switcher.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (switcher.querySelector('.glbe-selector-options').style.display == 'block')
                switcher.querySelector('.glbe-selector-options').style.display = 'none';
            else
                switcher.querySelector('.glbe-selector-options').style.display = 'block';
        });


        return switcher;
    };

    var setXHRListener = function () {
        var _open = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            if (!this.isGlobalE) {
                this.addEventListener('load', function () {
                    self.utils.emitEvent(events.onXHRRequest, { xhr: this, url: url });
                });
            }
            _open.apply(this, arguments);
        };

        const _fetch = fetch;
        fetch = function (resource, initOptions) {
            const url = resource instanceof Request ? resource.url : resource.toString();
            if (!this.isGlobalE) {
                return _fetch(resource, initOptions).then(function (res) {
                    self.utils.emitEvent(events.onXHRRequest, { xhr: this, url: url });
                    return res;
                });
            }
            else {
                return _fetch(resource, initOptions);
            }
        };
    };

    var createReplacementCookie = function () {
        var cookieDomain = window.location.hostname; //can require custom value on stores whene checkout page domain is different

        function getParameterByName(name, url = window.location.href) {
            name = name.replace(/[\[\]]/g, '\\$&');
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        }

        function ticksToDate(ticks) {
            return Number.isInteger(ticks) ? new Date(ticks / 1e+4 + new Date('0001-01-01T00:00:00Z').getTime()) : null;
        }

        var existingReplacementCookie = document.cookie.split(';').map(function (x) { return x.trim().split('='); }).reduce(function (a, b) { a[b[0]] = b[1]; return a; }, {})['GE_Replacement'];
        var existingReplacement = null;
        if (existingReplacementCookie && existingReplacementCookie.length > 0 && existingReplacementCookie != null) {
            existingReplacement = JSON.parse(decodeURIComponent(existingReplacementCookie));
        }

        //* If URL contains the query parameter replacementExpire, create cookie GE_Replacement
        let replacementExpireParam = parseInt(getParameterByName('replacementExpire'));
        if (replacementExpireParam !== null && replacementExpireParam > Date.now()) {
            //debugger;
            var countryCode = getParameterByName('glCountry');
            var currencyCode = getParameterByName('glCurrency');

            const cookieStringifiedValue = encodeURIComponent(JSON.stringify({ glCountry: countryCode, glCurrency: currencyCode }));
            const expirationInUTC = ticksToDate(replacementExpireParam).toUTCString();

            document.cookie = 'GE_Replacement=' + cookieStringifiedValue + ';expires=' + expirationInUTC + ';path=/;domain=.' + cookieDomain;

            // Change country and currency
            if (existingReplacement == null || existingReplacement.glCountry != countryCode || existingReplacement.glCurrency != currencyCode) {
                if (GLBE_PARAMS.countryCode != countryCode || GLBE_PARAMS.currencyCode != currencyCode) {
                    const form = document.createElement('form'); form.method = 'post'; form.action = '/localization';
                    const params = { form_type: 'localization', _method: 'put', return_to: document.location.pathname + document.location.search, country_code: countryCode, currency_code: currencyCode }
                    for (var key in params) { if (params.hasOwnProperty(key)) { var hiddenField = document.createElement('input'); hiddenField.type = 'hidden'; hiddenField.name = key; hiddenField.value = params[key]; form.appendChild(hiddenField); } }
                    document.body.appendChild(form);
                    form.submit();
                }
            }
        }

        if (existingReplacement != null) {
            //detect 404 checkout page. SHE-67, SHE-201
            var url = window.location.href;
            var regexp = /(\/[a-z\-]+\/)[0-9]+\/checkouts\/[a-z0-9]+/g;
            var match = regexp.exec(url);
            if (match != null) {
                var newUrl = url.replace(match[1], "/");
                window.location.href = newUrl;
            }
        }
    };
    
    var getHitCount = function () {
        if (sessionStorage) {
            var count = sessionStorage.getItem(self.hitInfoKey);
            if (count) {
                try {
                    return parseInt(count);
                }
                catch (err) {
                    return 0;
                }
            }
            return 0;
        }
        else {
            return 0;
        }
    }

    var updateHitCount = function (count) {
        if (sessionStorage) {
            sessionStorage.setItem(self.hitInfoKey, count);
        }
    }

    var getSessionUID = function () {
        var uid = self.utils.getCookie(self.trackingCookieName);
        if (!uid) {
            var generator = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            }
            var maxGen = 999999999;
            var minGen = 100000000;
            var leftPart = generator(minGen, maxGen);
            var rightPart = generator(minGen, maxGen);
            uid = leftPart + "." + rightPart;
            uid += "." + self.merchantId;
            self.utils.setCookie(self.trackingCookieName, uid, 365 * 2, false);
        }
        return uid;
    }

    var getReferrer = function () {
        var referrer = document.referrer;
        if (referrer) {
            var referrer = self.utils.parseUrl(document.referrer).hostname;
            if (referrer == document.location.hostname) {
                return null;
            }
            var storedRef = self.utils.getCookie(self.referreCookieName);
            if (storedRef && referrer == storedRef) {
                return null;
            }
            return referrer;
        }
        return null;
    };

    var track = function () {
        try {
            if (self.pixelEnabled) {
                var uid = getSessionUID();
                var hits = getHitCount();
                var environment = self.environment == "Production" ? "live" : "local";
                var baseUrl = self.pixelUrl + "/set";
                var doLog = self.utils.getQueryParam("gatracklog") != null ? self.utils.getQueryParam("gatracklog") : "false";
                var url = self.utils.addParameter(baseUrl, "t", "pv");
                url = self.utils.addParameter(url, "sid", uid);
                url = self.utils.addParameter(url, "p", encodeURIComponent(location.href));
                url = self.utils.addParameter(url, "ti", document.title);
                url = self.utils.addParameter(url, "co", self.countryCode);
                url = self.utils.addParameter(url, "e", environment);
                url = self.utils.addParameter(url, "hc", hits.toString());
                url = self.utils.addParameter(url, "log", doLog);
                url = self.utils.addParameter(url, "m", self.merchantId);
                url = self.utils.addParameter(url, "cdu", self.geCDNUrl);
                url = self.utils.addParameter(url, "f", "gleTags.handlePixelResponse");

                var referrer = getReferrer();
                if (referrer) {
                    url = self.utils.addParameter(url, "dr", encodeURIComponent(referrer));
                    self.utils.setCookie(self.referreCookieName, referrer, 30, false, true);
                }

                var i = document.createElement("img");
                i.width = 1;
                i.height = 1;
                i.src = url;

                updateHitCount(++hits);
            }
        }
        catch (err) {
            console.log('glbe error:', err);
        }
    };

    var calculatePrice = function (value, fxRate, vatRateTypes, productLocalVatRate, isGrossPrices, currencyDecimalPlaces, quantity,
        productClassCoefficient, priceCoefficient, productCountryVatRate, roundingRules, skipRounding) {
        if (value == 0)
            return (0).toFixed(currencyDecimalPlaces);
        var merchantVatRate = vatRateTypes.localVATRateType.rate / 100;
        if (productLocalVatRate !== null) {
            if (productLocalVatRate == 0) {
                merchantVatRate = 0;
            } else {
                merchantVatRate = productLocalVatRate / 100;
            }
        }
        var countryVatRate = vatRateTypes.vatRateType.rate / 100;
        if (productCountryVatRate || productCountryVatRate === 0) {
            if (productCountryVatRate == 0) {
                countryVatRate = 0;
            } else {
                countryVatRate = productCountryVatRate / 100;
            }
        }
        if (isGrossPrices) {
            if (vatRateTypes.includeVATTypeId == 0 || vatRateTypes.includeVATTypeId == 8 || (vatRateTypes.includeVATTypeId == 6 && vatRateTypes.useCountryVAT)) {
                value = value / (1 + merchantVatRate);
                if (vatRateTypes.includeVATTypeId == 6) {
                    value += value * countryVatRate;
                }
            }
        } else {
            if (vatRateTypes.includeVATTypeId == 2 || vatRateTypes.includeVATTypeId == 4 || vatRateTypes.includeVATTypeId == 6) {
                if (vatRateTypes.useCountryVAT) {
                    value += value * countryVatRate;
                } else {
                    value += value * merchantVatRate;
                }
            }
        }
        value = value * fxRate;
        if (productClassCoefficient) {
            value = value / priceCoefficient * productClassCoefficient;
        }
        value = value.toFixed(currencyDecimalPlaces);
        if (skipRounding || roundingRules == null) {
            value = value * quantity;
        } else {
            var ranges = roundingRules.roundingRanges;
            var range = null;
            for (var r in ranges) {
                var rg = ranges[r];
                if (rg.from < value && value <= rg.to) {
                    range = rg;
                    break;
                }
            }
            if (range != null) {
                // convert range to form of absolute
                range = convertRoundingRangeToAbsolute(value, range);
                // apply logic of absolute range rounding
                value = absoluteRounding(value, range) * quantity;
                if (value < 0) {
                    value = 0;
                }
            }
        }
        return value;
    };
    var convertRoundingRangeToAbsolute =function (price, range) {
        var result = null;
        if (range.rangeBehavior == 1) {
            // range already has absolute behavior
            result = range;
        } else {
            result = new Object();
            result.rangeBehavior = range.rangeBehavior;
            result.roundingExceptions = [];
            result.from = range.from;
            result.to = range.to;
            var int_part = Math.floor(price);
            if (range.rangeBehavior == 2) {
                //Relative Decimal
                result.lowerTarget = int_part - 1 + range.lowerTarget;
                result.upperTarget = int_part + range.upperTarget;
                result.threshold = int_part + range.threshold;
                for (var ex in range.roundingExceptions) {
                    range.roundingExceptions[ex].exceptionValue += int_part;
                    result.roundingExceptions.push(range.roundingExceptions[ex]);
                }
            } else if (range.rangeBehavior == 3) {
                // Relative Whole
                if (range.targetBehaviorHelperValue == 0) {
                    range.targetBehaviorHelperValue = 10;
                }
                var base = Math.floor(price / range.targetBehaviorHelperValue) * range.targetBehaviorHelperValue;
                result.lowerTarget = base - range.targetBehaviorHelperValue +
                    range.lowerTarget;
                result.upperTarget = base + range.upperTarget;
                result.threshold = base + range.threshold;
                for (var ex in range.roundingExceptions) {
                    range.roundingExceptions[ex].exceptionValue += base;
                    result.roundingExceptions.push(range.roundingExceptions[ex]);
                }
            } else if (range.rangeBehavior == 4) {
                // Nearest target
                if (range.targetBehaviorHelperValue == 0) {
                    range.targetBehaviorHelperValue = 5;
                }
                var base = Math.floor(price / range.targetBehaviorHelperValue) * range.targetBehaviorHelperValue;
                result.lowerTarget = base - 1 + range.lowerTarget;
                result.upperTarget = base - 1 + range.targetBehaviorHelperValue + range.upperTarget;
                result.threshold = base + range.threshold;
                for (var ex in range.roundingExceptions) {
                    range.roundingExceptions[ex].exceptionValue += base;
                    result.roundingExceptions.push(range.roundingExceptions[ex]);
                }
            }
        }

        return result;
    };
    var absoluteRounding =function (price, range) {
        var result = null;
        // check exceptions
        if (range.roundingExceptions.length > 0) {
            for (var e in range.roundingExceptions) {
                ex = range.roundingExceptions[e];
                if (price == ex.exceptionValue) {
                    result = price;
                }
            }
        }
        // no exception was found
        if (!result) {
            // check threshold
            if (price < range.threshold) {
                result = range.lowerTarget;
            } else {
                result = range.upperTarget;
            }
        }
        return result;
    };

    var initGEActive = function() { //* SHE-1584 Add ge-active attribute
        function DOMready(callback) { 
            if (document.readyState != 'loading') callback(); 
            else document.addEventListener('DOMContentLoaded', callback); 
        } 
        DOMready(function() { 
            if (GLBE_PARAMS) { 
                var OperatedCountryArray = GLBE_PARAMS.operatedCountries; 
                var MyCountry = GLBE_PARAMS.countryCode; 
                var geActive = false; 
                var b = document.querySelector("body"); 
                for (var i = 0; i <= OperatedCountryArray.length; i++) { 
                    if (MyCountry == OperatedCountryArray[i]) {geActive = true;} 
                } 
                if (geActive == true) {b.setAttribute("ge-active", true);} 
            } 
        });
    }

    return {
        constructor: GlobaleApp,
        init: function () {
            self = this;
            track();
            //addStyles();
            setXHRListener();
            initRestrictions();
            initCountrySwitcher();
            initGeoDetect();
            initFreeShippingBanner();
            createReplacementCookie();
            //initHiddenElements();
            initGEActive();
        },
        utils: {
            getQueryParam: function (name, optUrl) {
                var url = !optUrl ? window.location.search : optUrl;
                var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
                return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            },
            addParameter: function (url, parameterName, parameterValue, atStart) {
                if (url.indexOf('#') > 0) {
                    var cl = url.indexOf('#');
                    urlhash = url.substring(url.indexOf('#'), url.length);
                } else {
                    urlhash = '';
                    cl = url.length;
                }
                sourceUrl = url.substring(0, cl);

                var urlParts = sourceUrl.split("?");
                var newQueryString = "";

                if (urlParts.length > 1) {
                    var parameters = urlParts[1].split("&");
                    for (var i = 0; (i < parameters.length); i++) {
                        var parameterParts = parameters[i].split("=");
                        if (!(parameterParts[0] == parameterName)) {
                            if (newQueryString == "")
                                newQueryString = "?";
                            else
                                newQueryString += "&";
                            newQueryString += parameterParts[0] + "=" + (parameterParts[1] ? parameterParts[1] : '');
                        }
                    }
                }
                if (newQueryString == "")
                    newQueryString = "?";

                if (atStart) {
                    newQueryString = '?' + parameterName + "=" + parameterValue + (newQueryString.length > 1 ? '&' + newQueryString.substring(1) : '');
                } else {
                    if (newQueryString !== "" && newQueryString != '?')
                        newQueryString += "&";
                    newQueryString += parameterName + "=" + (parameterValue ? parameterValue : '');
                }
                return urlParts[0] + newQueryString + urlhash;
            },
            getCookie: function (c_name, isJson) {
                try {
                    var c_value = document.cookie;
                    var c_start = c_value.indexOf(" " + c_name + "=");
                    if (c_start == -1) {
                        c_start = c_value.indexOf(c_name + "=");
                    }
                    if (c_start == -1) {
                        c_value = null;
                    }
                    else {
                        c_start = c_value.indexOf("=", c_start) + 1;
                        var c_end = c_value.indexOf(";", c_start);
                        if (c_end == -1) {
                            c_end = c_value.length;
                        }
                        c_value = unescape(c_value.substring(c_start, c_end));
                    }

                    if (isJson) {
                        return JSON.parse(c_value);
                    }

                    return c_value;
                }
                catch (ex) {
                    console.log('glbe error', ex);
                }
            },
            setCookie: function (c_name, value, expire, isJson, isMinutes, setExpireAsSession) {
                try {
                    if (isJson) {
                        value = JSON.stringify(value);
                    }
                    var c_value = "";
                    if (!setExpireAsSession) {
                        var exdate = new Date();
                        if (!isMinutes)
                            exdate.setDate(exdate.getDate() + expire);
                        else
                            exdate.setTime(exdate.getTime() + expire * 60 * 1000);

                        c_value = escape(value) + ((expire == null) ? "" : "; expires=" + exdate.toUTCString()) + ";domain=" + document.domain + ";path=/";
                    } else {
                        c_value = escape(value) + ";domain=" + document.domain + ";path=/";
                    }
                    c_value += ";SameSite=Lax";
                    document.cookie = c_name + "=" + c_value;
                }
                catch (ex) {
                    console.log('glbe error', ex);
                    console.log('glbe error', ex);
                }
            },
            parseUrl: function (href) {
                var parser = document.createElement("a");
                parser.href = href;
                return {
                    protocol: parser.protocol, // => "http:"
                    host: parser.host,         // => "example.com:3000"
                    hostname: parser.hostname, // => "example.com"
                    port: parser.port,         // => "3000"
                    pathname: parser.pathname, // => "/pathname/"
                    hash: parser.hash,         // => "#hash"
                    search: parser.search,     // => "?search=test"
                    origin: parser.origin      // => "http://example.com:3000"
                }
            },
            addListener: function (type, listener) {
                if (typeof self.listeners[type] == "undefined") {
                    self.listeners[type] = [];
                }

                self.listeners[type].push(listener);
            },
            emitEvent: function (event, data) {
                if (!event) {
                    throw new Error("Event object missing 'type' property.");
                }

                if (self.listeners[event] instanceof Array) {
                    var listeners = self.listeners[event];
                    for (var i = 0, len = listeners.length; i < len; i++) {
                        listeners[i].call(self, data);
                    }
                }
            },
            notification: function (message, style) {
                var styles = {
                    close: {
                        position: 'absolute',
                        top: '3px',
                        right: '11px',
                        fontSize: '22px',
                        cursor: 'pointer',
                        lineHeight: '22px',
                        fontFamily: 'Helvetica, "Helvetica Neue", Arial, "Lucida Grande", sans-serif',
                    },
                    base: {
                        position: 'absolute',
                        top: '90px',
                        backgroundColor: 'rgb(44 174 230)',
                        color: '#fff',
                        left: '50%',
                        zIndex: '99999999',
                        padding: '16px',
                        fontSize: '15px',
                        fontFamily: 'Helvetica, "Helvetica Neue", Arial, "Lucida Grande", sans-serif',
                        borderRadius: '3px',
                        boxShadow: '0px 0px 5px #999',
                        transform: 'translateX(-50%)',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: '15px center'
                    },
                    warning: {
                        backgroundColor: '#F89405',
                        padding: '16px 50px',
                        backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAGYSURBVEhL5ZSvTsNQFMbXZGICMYGYmJhAQIJAICYQPAACiSDB8AiICQQJT4CqQEwgJvYASAQCiZiYmJhAIBATCARJy+9rTsldd8sKu1M0+dLb057v6/lbq/2rK0mS/TRNj9cWNAKPYIJII7gIxCcQ51cvqID+GIEX8ASG4B1bK5gIZFeQfoJdEXOfgX4QAQg7kH2A65yQ87lyxb27sggkAzAuFhbbg1K2kgCkB1bVwyIR9m2L7PRPIhDUIXgGtyKw575yz3lTNs6X4JXnjV+LKM/m3MydnTbtOKIjtz6VhCBq4vSm3ncdrD2lk0VgUXSVKjVDJXJzijW1RQdsU7F77He8u68koNZTz8Oz5yGa6J3H3lZ0xYgXBK2QymlWWA+RWnYhskLBv2vmE+hBMCtbA7KX5drWyRT/2JsqZ2IvfB9Y4bWDNMFbJRFmC9E74SoS0CqulwjkC0+5bpcV1CZ8NMej4pjy0U+doDQsGyo1hzVJttIjhQ7GnBtRFN1UarUlH8F3xict+HY07rEzoUGPlWcjRFRr4/gChZgc3ZL2d8oAAAAASUVORK5CYII=)',
                    }
                };

                var el = document.createElement('div');
                self.utils.extend(el.style, styles.base, styles[style]);
                el.innerText = message;
                var closeBtn = document.createElement('div');
                closeBtn.innerText = '×';
                self.utils.extend(closeBtn.style, styles.close);
                //el.appendChild(closeBtn);
                closeBtn.addEventListener('click', function () {
                    el.parentElement.removeChild(el);
                });
                document.body.appendChild(el);
                return el;
            },
            contentLoaded: function (win, fn) {
                var done = false, top = true,

                    doc = win.document,
                    root = doc.documentElement,
                    modern = doc.addEventListener,

                    add = modern ? 'addEventListener' : 'attachEvent',
                    rem = modern ? 'removeEventListener' : 'detachEvent',
                    pre = modern ? '' : 'on',

                    init = function (e) {
                        if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                        (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                        if (!done && (done = true)) fn.call(win, e.type || e);
                    },

                    poll = function () {
                        try { root.doScroll('left'); } catch (e) { setTimeout(poll, 50); return; }
                        init('poll');
                    };

                if (doc.readyState == 'complete') fn.call(win, 'lazy');
                else {
                    if (!modern && root.doScroll) {
                        try { top = !win.frameElement; } catch (e) { }
                        if (top) poll();
                    }
                    doc[add](pre + 'DOMContentLoaded', init, false);
                    doc[add](pre + 'readystatechange', init, false);
                    win[add](pre + 'load', init, false);
                }

            },
            extend: function (out) {
                out = out || {};
                for (var i = 1; i < arguments.length; i++) {
                    if (!arguments[i])
                        continue;

                    for (var key in arguments[i]) {
                        if (arguments[i].hasOwnProperty(key) &&
                            arguments[i][key] !== null &&
                            typeof arguments[i][key] != 'undefined')

                            out[key] = arguments[i][key];
                    }
                }
                return out;
            },
            httpRequest: function (url, opts) {
                var self = this;
                return new Promise(function (resolve, reject) {
                    var req = new XMLHttpRequest();
                    req.isGlobalE = true;
                    opts = self.extend({
                        method: 'GET',
                        contentType: 'application/x-www-form-urlencoded',
                        cache: false
                    }, opts);

                    req.open(opts.method, url, true);

                    req.setRequestHeader('Content-Type', opts.contentType);
                    if (opts.cache === false) {
                        url += (url.indexOf('?') > -1 ? '&_=' : '?_=') + (new Date()).getTime();
                    }

                    var data = opts.data ? JSON.stringify(opts.data) : null;

                    req.onload = function () {
                        if (req.status == 200) {
                            var res = req.response;
                            if (opts.contentType == "application/json") {
                                try {
                                    res = JSON.parse(res);
                                } catch (e) {
                                    //response is not JSON
                                }
                            }
                            resolve(res);
                        }
                        else {
                            reject(Error(req.statusText));
                        }
                    };

                    req.onerror = function () {
                        reject(Error("Network Error"));
                    };
                    req.send(data);
                });
            },
            deferred: function () {
                var dfd = {};
                dfd.promise = new Promise(function (resolve, reject) {
                    dfd.resolve = resolve;
                    dfd.reject = reject;
                });
                return dfd;
            },
            getScript: function (url, opts) {
                return new Promise(function (res, rej) {
                    if (opts) {
                        if (opts.uriParams) {
                            for (var p in opts.uriParams) {
                                if (opts.uriParams.hasOwnProperty(p)) {
                                    url += (url.indexOf('?') > -1 ? '&' : '?') + p + '=' + encodeURIComponent(opts.uriParams[p]);
                                }
                            }
                        }

                        if (opts.cache === false) {
                            url += (url.indexOf('?') > -1 ? '&_=' : '?_=') + (new Date()).getTime();
                        }
                    }

                    var s = document.createElement('script');
                    s.type = 'text/javascript';
                    s.async = true;

                    if (opts && opts.jsonp) {
                        var jsonp = 'jsonp_' + (new Date()).getTime();
                        if (opts.jsonpFunction)
                            jsonp = opts.jsonpFunction;

                        url += (url.indexOf('?') > -1 ? '&' : '?') + opts.jsonp + '=' + jsonp;
                        window[jsonp] = function (data) {
                            res(data);
                        }
                    }
                    else {
                        s.onload = function () {
                            res();
                        }
                    }

                    s.src = url;
                    document.getElementsByTagName('head')[0].appendChild(s);
                });
            },
            formPost: function (path, params, method = 'post') {
                var form = document.createElement('form');
                form.method = method;
                form.action = path;

                for (var key in params) {
                    if (params.hasOwnProperty(key)) {
                        var hiddenField = document.createElement('input');
                        hiddenField.type = 'hidden';
                        hiddenField.name = key;
                        hiddenField.value = params[key];

                        form.appendChild(hiddenField);
                    }
                }

                document.body.appendChild(form);
                form.submit();
            },
            getGeoLocation: function () {
                var geo = sessionStorage.getItem('GLBE_geo');
                if (geo) {
                    return Promise.resolve({ country: geo });
                }
                else {
                    return self.utils.getScript('https://gepi.global-e.com/geodetect', {
                        jsonp: "jsoncallback",
                        contentType: "application/json"
                    }).then(function (res) {
                        sessionStorage.setItem('GLBE_geo', res.country);
                        return res;
                    })
                }

            },
            toggleLoader: function (show) {
                if (show) {
                    var overlay = document.createElement('div');
                    overlay.className = 'spinner-overlay';

                    var spinner = document.createElement('div');
                    spinner.className = "spinner";
                    overlay.appendChild(spinner);
                    document.body.appendChild(overlay);
                }
                else {
                    document.body.removeChild(document.querySelector('.spinner-overlay'));
                }
            }
        },
        modules: {
            priceInfo: {
                load: function () {
                    if (isCountryOperated(Shopify.country)) {
                        return self.utils.getScript(self.appUrl + "resources/PriceInfo?shop=" + self.shop + "&countryCode=" + Shopify.country + "&currencyCode=" + Shopify.currency.active, {
                            jsonp: "jsoncallback",
                            jsonpFunction: "priceInfoCallback",
                            contentType: "application/json"
                        }).then(function (data) {
                            if (!data.success)
                                return;

                            GLBE_PARAMS.PriceInfo = data;
                            return;
                        })
                    } else
                        return Promise.resolve();
                },
                convertPrice: function (basePrice) {
                    if (!isCountryOperated(Shopify.country))
                        return basePrice;

                    if (!GLBE_PARAMS.PriceInfo)
                        throw "Module is not loaded";

                    //if (!GLBE_PARAMS.PriceInfo.isOperatedByGlobale)
                    //    return basePrice;

                    var productLocalVatRate = GLBE_PARAMS.PriceInfo.vatSettings.localVATRate;
                    var productCountryVatRate = GLBE_PARAMS.PriceInfo.vatSettings.distanceSellingVATRate;
                    var priceCoefficient = GLBE_PARAMS.PriceInfo.countryCoefficientRate;
                    var productClassCoefficient = 0;
                    var fxRate = GLBE_PARAMS.PriceInfo.currencyConversionRate * priceCoefficient;

                    var vatRateTypes = {
                        localVATRateType: { rate: GLBE_PARAMS.PriceInfo.vatSettings.localVATRate },
                        vatRateType: { rate: GLBE_PARAMS.PriceInfo.vatSettings.distanceSellingVATRate },
                        includeVATTypeId: GLBE_PARAMS.PriceInfo.vatSettings.vatTypeId,
                        useCountryVAT: GLBE_PARAMS.PriceInfo.vatSettings.useDistanceSellingVAT
                    };
                    var skipRounding = false;

                    return calculatePrice(basePrice, fxRate, vatRateTypes, productLocalVatRate, GLBE_PARAMS.PriceInfo.isGrossPrices, GLBE_PARAMS.PriceInfo.currencyDecimalPlaces, 1,
                        productClassCoefficient, priceCoefficient, productCountryVatRate, GLBE_PARAMS.PriceInfo.roundingRules, skipRounding);
                }
            }        
        },
    };
})();

if (!GLBE_PARAMS.checkoutId) { //make sure GLBE_PARAMS is not from checkout.liquid
    var glbeApp = new GlobaleApp(Shopify.shop, GLBE_PARAMS.emi, GLBE_PARAMS.mid, GLBE_PARAMS.countryCode,
        GLBE_PARAMS.countryName, GLBE_PARAMS.currencyCode, GLBE_PARAMS.currencyName, GLBE_PARAMS.locale,
        GLBE_PARAMS.allowedCountries, GLBE_PARAMS.operatedCountries, GLBE_PARAMS.appUrl, GLBE_PARAMS.apiUrl,
        GLBE_PARAMS.geAppUrl, GLBE_PARAMS.geCDNUrl, GLBE_PARAMS.hiddenElements, GLBE_PARAMS.pixelUrl, GLBE_PARAMS.pixelEnabled, GLBE_PARAMS.env);
}