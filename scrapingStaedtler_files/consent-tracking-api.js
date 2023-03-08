!function(){"use strict";let n,t,e,r,o,i,c,s,u,a;!function(n){n.TRACKING_ACCEPTED="trackingConsentAccepted",n.TRACKING_DECLINED="trackingConsentDeclined",n.FIRST_PARTY_MARKETING_ACCEPTED="firstPartyMarketingConsentAccepted",n.THIRD_PARTY_MARKETING_ACCEPTED="thirdPartyMarketingConsentAccepted",n.ANALYTICS_ACCEPTED="analyticsConsentAccepted",n.PREFERENCES_ACCEPTED="preferencesConsentAccepted",n.FIRST_PARTY_MARKETING_DECLINED="firstPartyMarketingConsentDeclined",n.THIRD_PARTY_MARKETING_DECLINED="thirdPartyMarketingConsentDeclined",n.ANALYTICS_DECLINED="analyticsConsentDeclined",n.PREFERENCES_DECLINED="preferencesConsentDeclined",n.CONSENT_COLLECTED="visitorConsentCollected"}(n||(n={})),function(n){n.V2_0="2.0",n.V2_1="2.1"}(t||(t={})),function(n){n.ACCEPTED="yes",n.DECLINED="no",n.NO_INTERACTION="no_interaction",n.NO_VALUE=""}(e||(e={})),function(n){n.NO_VALUE="",n.ACCEPTED="1",n.DECLINED="0"}(r||(r={})),function(n){n.GDPR="GDPR",n.CCPA="CCPA",n.NO_VALUE=""}(o||(o={})),function(n){n.PREFERENCES="p",n.ANALYTICS="a",n.FIRST_PARTY_MARKETING="m",n.THIRD_PARTY_MARKETING="t"}(i||(i={})),function(n){n.CCPA_BLOCK_ALL="CCPA_BLOCK_ALL",n.GDPR="GDPR",n.GDPR_BLOCK_ALL="GDPR_BLOCK_ALL",n.CCPA="CCPA"}(c||(c={})),function(n){n.MARKETING="m",n.ANALYTICS="a",n.PREFERENCES="p",n.GPC="g",n.SALE_OF_DATA="s"}(s||(s={})),function(n){n.MARKETING="m",n.ANALYTICS="a",n.PREFERENCES="p",n.GPC="g",n.SALE_OF_DATA="s"}(u||(u={})),function(n){n.MARKETING="marketing",n.ANALYTICS="analytics",n.PREFERENCES="preferences",n.GPC="gpc",n.SALE_OF_DATA="sale_of_data"}(a||(a={}));const C=["lim","v","con","reg"];let E={};function A(n){if(n in E)return E[n];const t=document.cookie?document.cookie.split("; "):[];E[n]=void 0;for(let e=0;e<t.length;e++){const[r,o]=t[e].split("=");if(n===decodeURIComponent(r)){E[n]=JSON.parse(decodeURIComponent(o));break}}return E[n]}function l(n,t){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(n);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(n,t).enumerable}))),e.push.apply(e,r)}return e}function f(n){for(var t=1;t<arguments.length;t++){var e=null!=arguments[t]?arguments[t]:{};t%2?l(Object(e),!0).forEach((function(t){T(n,t,e[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):l(Object(e)).forEach((function(t){Object.defineProperty(n,t,Object.getOwnPropertyDescriptor(e,t))}))}return n}function T(n,t,e){return t in n?Object.defineProperty(n,t,{value:e,enumerable:!0,configurable:!0,writable:!0}):n[t]=e,n}function P(){const n=A("_tracking_consent");if(void 0!==n&&!function(n){if(![t.V2_0,t.V2_1].includes(n.v))return!0;return!function(n,t){const e=t.slice().sort();return n.length===t.length&&n.slice().sort().every((n,t)=>n===e[t])}(Object.keys(n).filter(n=>"region"!==n),C)}(n))return n}function R(n,e){const i=n.marketing&&n.analytics&&n.preferences;let s;s=void 0===n.sale_of_data?r.NO_VALUE:n.sale_of_data?r.ACCEPTED:r.DECLINED;const u={v:t.V2_0,reg:o.NO_VALUE,lim:[c.GDPR_BLOCK_ALL,c.CCPA],con:{GDPR:i?r.ACCEPTED:r.DECLINED,CCPA:s}};!function(n,t,e,r){let o="".concat(encodeURIComponent(n),"=").concat(encodeURIComponent(JSON.stringify(r)));o+="; path=/",o+="; domain=".concat(t),o+="; expires=".concat(new Date((new Date).getTime()+e).toUTCString()),o+="; secure",document.cookie=o,E[n]=r}("_tracking_consent",n.rootDomain,31536e6,u),e(null)}function _(){try{let n=P();if(!n)return;return n.v===t.V2_0?function(n){const e=n.con||{};return{con:{CMP:{[u.MARKETING]:e.GDPR||r.NO_VALUE,[s.ANALYTICS]:e.GDPR||r.NO_VALUE,[s.PREFERENCES]:e.GDPR||r.NO_VALUE,[s.GPC]:r.NO_VALUE,[s.SALE_OF_DATA]:e.CCPA||r.NO_VALUE}},reg:n.reg,v:t.V2_1,lim:n.lim}}(n):n}catch(n){return}}function N(){const n=P();switch(null==n?void 0:n.v){case"2.0":return t.V2_0;case"2.1":return t.V2_1;default:return}}function D(){return{m:p(u.MARKETING),a:p(u.ANALYTICS),p:p(u.PREFERENCES),s:p(u.SALE_OF_DATA),g:p(u.GPC)}}function d(){return D()[u.SALE_OF_DATA]}function I(){let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;return null===n&&(n=_()),void 0===n}function L(n){switch(n){case r.ACCEPTED:return e.ACCEPTED;case r.DECLINED:return e.DECLINED;default:return e.NO_VALUE}}function g(n){switch(n){case s.ANALYTICS:return a.ANALYTICS;case s.MARKETING:return a.MARKETING;case s.PREFERENCES:return a.PREFERENCES;case s.SALE_OF_DATA:return a.SALE_OF_DATA;case s.GPC:return a.GPC}}function p(n){if(n==u.GPC){if(!Z.isGPCSignalPresent())return r.NO_VALUE;return!Z.isGPCOptOutPresent()?r.ACCEPTED:r.DECLINED}const t=_();if(!t)return r.NO_VALUE;const e=t.con.CMP;return e?e[n]:r.NO_VALUE}function S(){return A("_cmp_a")}function h(n){const t=S();if(!t)return!0;const e=t.purposes[n];return"boolean"!=typeof e||e}function O(){return h(i.PREFERENCES)}function y(){return h(i.ANALYTICS)}function G(){return h(i.FIRST_PARTY_MARKETING)}function w(){return h(i.THIRD_PARTY_MARKETING)}const m={"":[],GDPR:[c.GDPR,c.GDPR_BLOCK_ALL],CCPA:[c.CCPA_BLOCK_ALL,c.CCPA]};function b(n,t){document.dispatchEvent(new CustomEvent(n,{detail:t||{}}))}function v(t){!0===t[i.FIRST_PARTY_MARKETING]?b(n.FIRST_PARTY_MARKETING_ACCEPTED):!1===t[i.FIRST_PARTY_MARKETING]&&b(n.FIRST_PARTY_MARKETING_DECLINED),!0===t[i.THIRD_PARTY_MARKETING]?b(n.THIRD_PARTY_MARKETING_ACCEPTED):!1===t[i.THIRD_PARTY_MARKETING]&&b(n.THIRD_PARTY_MARKETING_DECLINED),!0===t[i.ANALYTICS]?b(n.ANALYTICS_ACCEPTED):!1===t[i.ANALYTICS]&&b(n.ANALYTICS_DECLINED),!0===t[i.PREFERENCES]?b(n.PREFERENCES_ACCEPTED):!1===t[i.PREFERENCES]&&b(n.PREFERENCES_DECLINED);const e=function(n){return{firstPartyMarketingAllowed:n[i.FIRST_PARTY_MARKETING],thirdPartyMarketingAllowed:n[i.THIRD_PARTY_MARKETING],analyticsAllowed:n[i.ANALYTICS],preferencesAllowed:n[i.PREFERENCES]}}(t);b(n.CONSENT_COLLECTED,e)}function K(t,e,r){const o=new XMLHttpRequest,c=JSON.stringify(t);o.open("POST","/set_tracking_consent.json",!0),o.setRequestHeader("Content-Type","application/json"),o.onreadystatechange=function(){if(4!==o.readyState)return;E={};const c=function(n){try{return JSON.parse(n)}catch(n){return{error:"Unknown error"}}}(o.responseText);var s;0===(s=o.status)||200>=s&&s<400?(!function(t,e){void 0!==t.consent?(!0===t.consent?b(n.TRACKING_ACCEPTED):b(n.TRACKING_DECLINED),e&&v({[i.PREFERENCES]:t.consent,[i.ANALYTICS]:t.consent,[i.FIRST_PARTY_MARKETING]:t.consent,[i.THIRD_PARTY_MARKETING]:t.consent})):void 0!==t.granular_consent&&v({[i.PREFERENCES]:O(),[i.ANALYTICS]:y(),[i.FIRST_PARTY_MARKETING]:G(),[i.THIRD_PARTY_MARKETING]:w()})}(t,r),e(null,c)):e(c)},o.send(c)}function M(){if(I())return e.NO_VALUE;const n=D();return n[s.MARKETING]===r.ACCEPTED&&n[s.ANALYTICS]===r.ACCEPTED?e.ACCEPTED:n[s.MARKETING]===r.DECLINED||n[s.ANALYTICS]===r.DECLINED?e.DECLINED:e.NO_INTERACTION}function k(){const n=function(){const n=_();return I(n)?o.NO_VALUE:n.reg}();return n in o?n:o.NO_VALUE}function Y(){return function(){const n=_();return I(n)?{limit:[]}:{limit:n.lim}}()}function F(n){return q(c.GDPR_BLOCK_ALL)&&n?U()?document.referrer:"":null}function V(n){return q(c.GDPR_BLOCK_ALL)&&n?U()?window.location.pathname+window.location.search:"/":null}function B(){return"string"==typeof navigator.globalPrivacyControl?"1"===navigator.globalPrivacyControl:Boolean(navigator.globalPrivacyControl)}function U(){if(""===document.referrer)return!0;const n=document.createElement("a");return n.href=document.referrer,window.location.hostname!=n.hostname}function j(){return q(c.GDPR)||q(c.GDPR_BLOCK_ALL)}function H(){const n=k();if(n===o.NO_VALUE)return!1;const t=Y();return 0!==t.limit.length&&t.limit.some(t=>function(n,t){return m[n].includes(t)}(n,t))}function x(){return!!I()||function(){if(!j())return!0;const n=D();return n[s.MARKETING]===r.ACCEPTED&&n[s.ANALYTICS]===r.ACCEPTED||n[s.MARKETING]!==r.DECLINED&&n[s.ANALYTICS]!==r.DECLINED&&k()!==o.GDPR}()}function q(n){return Y().limit.includes(n)}function J(){return k()===o.CCPA&&(!!q(c.CCPA)&&B())}function X(){return!J()&&(!!I()||!1!==x()&&function(){if(q(c.CCPA_BLOCK_ALL)){return k()!==o.CCPA}if(q(c.CCPA)){return d()!==r.DECLINED}return!0}())}function z(){return J()?e.DECLINED:(n=d(),I()?e.NO_VALUE:n===r.NO_VALUE?e.NO_INTERACTION:L(n));var n}function Q(n){if(!j())return!0;const t=D();return t[n]===r.ACCEPTED||t[n]!==r.DECLINED&&k()!==o.GDPR}function W(){return N()===t.V2_1}const Z={getTrackingConsent:M,setTrackingConsent:function(n,t){if(I()){const n="Shop is not configured to block privacy regulation in online store settings.";return console.warn(n),t({error:n})}if(function(n){if(W()){if("boolean"!=typeof n&&"object"!=typeof n)throw TypeError("setTrackingConsent must be called with a boolean or object consent value");if("object"==typeof n){const t=Object.keys(n);if(0===t.length)throw TypeError("The submitted consent object is empty.");const e=[a.MARKETING,a.ANALYTICS,a.PREFERENCES,a.SALE_OF_DATA];for(const n of t)if(!e.includes(n))throw TypeError("The submitted consent object should only contain the following keys: ".concat(e.join(", "),"."))}}else if("boolean"!=typeof n)throw TypeError("setTrackingConsent must be called with a boolean consent value")}(n),"function"!=typeof t)throw TypeError("setTrackingConsent must be called with a callback function");if("object"==typeof n){const e=F(n.analytics),r=V(n.analytics);return K(f(f({granular_consent:n},null!==e&&{referrer:e}),null!==r&&{landing_page:r}),t,W())}{const e=F(n),r=V(n);return K(f(f({consent:n},null!==e&&{referrer:e}),null!==r&&{landing_page:r}),t,W())}},userCanBeTracked:x,getRegulation:k,isRegulationEnforced:H,getShopPrefs:Y,shouldShowGDPRBanner:function(){return k()===o.GDPR&&H()&&M()===e.NO_INTERACTION},userDataCanBeSold:X,setCCPAConsent:function(n,t){if("boolean"!=typeof n)throw TypeError("setCCPAConsent must be called with a boolean consent value");if("function"!=typeof t)throw TypeError("setCCPAConsent must be called with a callback function");return K({ccpa_consent:n},t,W())},getCCPAConsent:z,shouldShowCCPABanner:function(){return k()===o.CCPA&&Y().limit.includes(c.CCPA)&&z()===e.NO_INTERACTION},haveAnalyticsConsent:function(){return W()?y():Q(s.ANALYTICS)},havePreferencesConsent:function(){return W()?O():Q(s.PREFERENCES)},haveFirstPartyMarketingConsent:function(){return W()?G():Q(s.MARKETING)},haveThirdPartyMarketingConsent:function(){return W()?w():!!Q(s.MARKETING)&&!!X()},getCCPAConsentValue:d,merchantEnforcingRegulationLimit:q,isGPCSignalPresent:function(){return void 0!==navigator.globalPrivacyControl},isGPCOptOutPresent:B,isValidGPCSignalOptOutPresent:J,exposeBetaFunctionality:W,shouldShowBanner:function(){return W()&&function(){const n=S();return!!n&&("boolean"==typeof n.display_banner&&n.display_banner)}()&&p(u.ANALYTICS)===r.NO_VALUE&&p(u.MARKETING)===r.NO_VALUE&&p(u.PREFERENCES)===r.NO_VALUE},saleOfDataRegion:function(){return W()&&function(){const n=S();return n&&n.sale_of_data_region||!1}()}};function $(n,t,e){try{var r;!function(n){const t=new XMLHttpRequest;t.open("POST","https://notify.bugsnag.com/",!0),t.setRequestHeader("Content-Type","application/json"),t.setRequestHeader("Bugsnag-Api-Key","95ba910bcec4542ef2a0b64cd7ca666c"),t.setRequestHeader("Bugsnag-Payload-Version","5");const e=function(n){const t=function(n){return n.stackTrace||n.stack||n.description||n.name}(n.error),[e,r]=(t||"unknown error").split("\n")[0].split(":");return JSON.stringify({payloadVersion:5,notifier:{name:"ConsentTrackingAPI",version:"latest",url:"-"},events:[{exceptions:[{errorClass:(e||"").trim(),message:(r||"").trim(),stacktrace:[{file:"consent-tracking-api.js",lineNumber:"1",method:t}],type:"browserjs"}],context:n.context||"general",app:{id:"ConsentTrackingAPI",version:"latest"},metaData:{request:{shopId:n.shopId,shopUrl:window.location.href},device:{userAgent:window.navigator.userAgent},"Additional Notes":n.notes},unhandled:!1}]})}(n);t.send(e)}({error:n,context:t,shopId:tn()||(null===(r=window.Shopify)||void 0===r?void 0:r.shop),notes:e})}catch(n){}}function nn(n){return function(){try{return n(...arguments)}catch(n){throw $(n),n}}}function tn(){try{const n=document.getElementById("shopify-features").textContent;return JSON.parse(n).shopId}catch(n){return null}}function en(){return Z.getTrackingConsent()}function rn(n,t){return"object"==typeof n&&n.headlessStorefront?R(n,t):Z.setTrackingConsent(n,t)}function on(){return Z.userCanBeTracked()}function cn(){return Z.getRegulation()}function sn(){return Z.isRegulationEnforced()}function un(){return Z.getShopPrefs()}function an(){return Z.shouldShowGDPRBanner()}function Cn(){return Z.userDataCanBeSold()}function En(n,t){return Z.setCCPAConsent(n,t)}function An(){return Z.getCCPAConsent()}function ln(){return Z.shouldShowCCPABanner()}function fn(){return Z.haveAnalyticsConsent()}function Tn(){return Z.havePreferencesConsent()}function Pn(){return Z.haveFirstPartyMarketingConsent()}function Rn(){return Z.haveThirdPartyMarketingConsent()}function _n(){return Z.shouldShowBanner()}function Nn(){return Z.saleOfDataRegion()}function Dn(){return N()===t.V2_1}function dn(){return Dn()}function In(){const n={};if(t=c.GDPR_BLOCK_ALL,un().limit.includes(t)&&Dn()){const t=D();for(const e of Object.keys(t))n[g(e)]=L(t[e])}var t;return n}function Ln(){Z.getCCPAConsentValue()!=r.DECLINED&&Z.isValidGPCSignalOptOutPresent()&&En(!1,()=>!1);const n={getTrackingConsent:nn(en),setTrackingConsent:nn(rn),userCanBeTracked:nn(on),getRegulation:nn(cn),isRegulationEnforced:nn(sn),getShopPrefs:nn(un),shouldShowGDPRBanner:nn(an),userDataCanBeSold:nn(Cn),setCCPAConsent:nn(En),getCCPAConsent:nn(An),shouldShowCCPABanner:nn(ln),doesMerchantSupportGranularConsent:nn(dn)};if(Z.exposeBetaFunctionality()){const t={analyticsProcessingAllowed:nn(fn),preferencesProcessingAllowed:nn(Tn),firstPartyMarketingAllowed:nn(Pn),thirdPartyMarketingAllowed:nn(Rn),currentVisitorConsent:nn(In),shouldShowBanner:nn(_n),saleOfDataRegion:nn(Nn)};n.unstable=t}return n}window.Shopify=window.Shopify?window.Shopify:{},window.Shopify.customerPrivacy=window.Shopify.trackingConsent=Ln()}();
//# sourceMappingURL=consent-tracking-api.js.map
