/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (!(typeof options.beforeSend === "function" ? options.beforeSend(xhr, options) : void 0)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.1.0
Copyright © 2018 Basecamp, LLC
 */

(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(t,e){return Turbolinks.controller.visit(t,e)},clearCache:function(){return Turbolinks.controller.clearCache()},setProgressBarDelay:function(t){return Turbolinks.controller.setProgressBarDelay(t)}}}).call(this),function(){var t,e,r,n=[].slice;Turbolinks.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},Turbolinks.closest=function(e,r){return t.call(e,r)},t=function(){var t,r;return t=document.documentElement,null!=(r=t.closest)?r:function(t){var r;for(r=this;r;){if(r.nodeType===Node.ELEMENT_NODE&&e.call(r,t))return r;r=r.parentNode}}}(),Turbolinks.defer=function(t){return setTimeout(t,1)},Turbolinks.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},Turbolinks.dispatch=function(t,e){var n,o,i,s,a,u;return a=null!=e?e:{},u=a.target,n=a.cancelable,o=a.data,i=document.createEvent("Events"),i.initEvent(t,!0,n===!0),i.data=null!=o?o:{},i.cancelable&&!r&&(s=i.preventDefault,i.preventDefault=function(){return this.defaultPrevented||Object.defineProperty(this,"defaultPrevented",{get:function(){return!0}}),s.call(this)}),(null!=u?u:document).dispatchEvent(i),i},r=function(){var t;return t=document.createEvent("Events"),t.initEvent("test",!0,!0),t.preventDefault(),t.defaultPrevented}(),Turbolinks.match=function(t,r){return e.call(t,r)},e=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),Turbolinks.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}.call(this),function(){Turbolinks.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.requestURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.HttpRequest=function(){function e(e,r,n){this.delegate=e,this.requestCanceled=t(this.requestCanceled,this),this.requestTimedOut=t(this.requestTimedOut,this),this.requestFailed=t(this.requestFailed,this),this.requestLoaded=t(this.requestLoaded,this),this.requestProgressed=t(this.requestProgressed,this),this.url=Turbolinks.Location.wrap(r).requestURL,this.referrer=Turbolinks.Location.wrap(n).absoluteURL,this.createXHR()}return e.NETWORK_FAILURE=0,e.TIMEOUT_FAILURE=-1,e.timeout=60,e.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},e.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},e.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},e.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},e.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},e.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},e.prototype.requestCanceled=function(){return this.endRequest()},e.prototype.notifyApplicationBeforeRequestStart=function(){return Turbolinks.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},e.prototype.notifyApplicationAfterRequestEnd=function(){return Turbolinks.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},e.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},e.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},e.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},e.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ProgressBar=function(){function e(){this.trickle=t(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,e.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",e.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},e.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},e.prototype.setValue=function(t){return this.value=t,this.refresh()},e.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},e.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},e.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},e.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},e.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},e.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},e.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},e.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},e.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},e.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.BrowserAdapter=function(){function e(e){this.controller=e,this.showProgressBar=t(this.showProgressBar,this),this.progressBar=new Turbolinks.ProgressBar}var r,n,o;return o=Turbolinks.HttpRequest,r=o.NETWORK_FAILURE,n=o.TIMEOUT_FAILURE,e.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},e.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},e.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},e.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},e.prototype.visitRequestCompleted=function(t){return t.loadResponse()},e.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case r:case n:return this.reload();default:return t.loadResponse()}},e.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},e.prototype.visitCompleted=function(t){return t.followRedirect()},e.prototype.pageInvalidated=function(){return this.reload()},e.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,this.controller.progressBarDelay)},e.prototype.showProgressBar=function(){return this.progressBar.show()},e.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},e.prototype.reload=function(){return window.location.reload()},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.History=function(){function e(e){this.delegate=e,this.onPageLoad=t(this.onPageLoad,this),this.onPopState=t(this.onPopState,this)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},e.prototype.push=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("push",t,e)},e.prototype.replace=function(t,e){return t=Turbolinks.Location.wrap(t),this.update("replace",t,e)},e.prototype.onPopState=function(t){var e,r,n,o;return this.shouldHandlePopState()&&(o=null!=(r=t.state)?r.turbolinks:void 0)?(e=Turbolinks.Location.wrap(window.location),n=o.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(e,n)):void 0},e.prototype.onPageLoad=function(t){return Turbolinks.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},e.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},e.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},e.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},e}()}.call(this),function(){Turbolinks.Snapshot=function(){function t(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return t.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},t.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},t.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},t.prototype.clone=function(){return new t({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},t.prototype.getRootLocation=function(){var t,e;return e=null!=(t=this.getSetting("root"))?t:"/",new Turbolinks.Location(e)},t.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},t.prototype.getElementForAnchor=function(t){try{return this.body.querySelector("[id='"+t+"'], a[name='"+t+"']")}catch(e){}},t.prototype.hasAnchor=function(t){return null!=this.getElementForAnchor(t)},t.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},t.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},t.prototype.isVisitable=function(){return"reload"!==this.getSetting("visit-control")},t.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},t}()}.call(this),function(){var t=[].slice;Turbolinks.Renderer=function(){function e(){}var r;return e.render=function(){var e,r,n,o;return n=arguments[0],r=arguments[1],e=3<=arguments.length?t.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,e,function(){}),o.delegate=n,o.render(r),o},e.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},e.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},e.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,e.async=!1,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},e}()}.call(this),function(){Turbolinks.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.SnapshotRenderer=function(e){function r(t,e,r){this.currentSnapshot=t,this.newSnapshot=e,this.isPreview=r,this.currentHeadDetails=new Turbolinks.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new Turbolinks.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return t(r,e),r.prototype.render=function(t){return this.shouldRender()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.isPreview||e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},r.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},r.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},r.prototype.shouldRender=function(){return this.newSnapshot.isVisitable()&&this.trackedElementsAreIdentical()},r.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},r.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},r.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},r.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},r.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.assignNewBody=function(){return document.body=this.newBody},r.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},r.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},r.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},r.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},r.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},r.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},r.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},r.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},r.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},r}(Turbolinks.Renderer)}.call(this),function(){var t=function(t,r){function n(){this.constructor=t}for(var o in r)e.call(r,o)&&(t[o]=r[o]);return n.prototype=r.prototype,t.prototype=new n,t.__super__=r.prototype,t},e={}.hasOwnProperty;Turbolinks.ErrorRenderer=function(e){function r(t){this.html=t}return t(r,e),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(Turbolinks.Renderer)}.call(this),function(){Turbolinks.View=function(){function t(t){this.delegate=t,this.element=document.documentElement}return t.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},t.prototype.getElementForAnchor=function(t){return this.getSnapshot().getElementForAnchor(t)},t.prototype.getSnapshot=function(){return Turbolinks.Snapshot.fromElement(this.element)},t.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,n,e):this.renderError(r,e)},t.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},t.prototype.renderSnapshot=function(t,e,r){return Turbolinks.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),Turbolinks.Snapshot.wrap(t),e)},t.prototype.renderError=function(t,e){return Turbolinks.ErrorRenderer.render(this.delegate,e,t)},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.ScrollManager=function(){function e(e){this.delegate=e,this.onScroll=t(this.onScroll,this),this.onScroll=Turbolinks.throttle(this.onScroll)}return e.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},e.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},e.prototype.scrollToElement=function(t){return t.scrollIntoView()},e.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},e.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},e.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},e}()}.call(this),function(){Turbolinks.SnapshotCache=function(){function t(t){this.size=t,this.keys=[],this.snapshots={}}var e;return t.prototype.has=function(t){var r;return r=e(t),r in this.snapshots},t.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},t.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},t.prototype.read=function(t){var r;return r=e(t),this.snapshots[r]},t.prototype.write=function(t,r){var n;return n=e(t),this.snapshots[n]=r},t.prototype.touch=function(t){var r,n;return n=e(t),r=this.keys.indexOf(n),r>-1&&this.keys.splice(r,1),this.keys.unshift(n),this.trim()},t.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},e=function(t){return Turbolinks.Location.wrap(t).toCacheKey()},t}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Visit=function(){function e(e,r,n){this.controller=e,this.action=n,this.performScroll=t(this.performScroll,this),this.identifier=Turbolinks.uuid(),this.location=Turbolinks.Location.wrap(r),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var r;return e.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},e.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},e.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},e.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},e.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=r(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},e.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new Turbolinks.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},e.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},e.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},e.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},e.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},e.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},e.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},e.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},e.prototype.requestCompletedWithResponse=function(t,e){return this.response=t,null!=e&&(this.redirectedToLocation=Turbolinks.Location.wrap(e)),this.adapter.visitRequestCompleted(this)},e.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},e.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},e.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},e.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},e.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},e.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},e.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},e.prototype.getTimingMetrics=function(){return Turbolinks.copyObject(this.timingMetrics)},r=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},e.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},e.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},e.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},e.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},e}()}.call(this),function(){var t=function(t,e){return function(){return t.apply(e,arguments)}};Turbolinks.Controller=function(){function e(){this.clickBubbled=t(this.clickBubbled,this),this.clickCaptured=t(this.clickCaptured,this),this.pageLoaded=t(this.pageLoaded,this),this.history=new Turbolinks.History(this),this.view=new Turbolinks.View(this),this.scrollManager=new Turbolinks.ScrollManager(this),this.restorationData={},this.clearCache(),this.setProgressBarDelay(500)}return e.prototype.start=function(){return Turbolinks.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},e.prototype.disable=function(){return this.enabled=!1},e.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},e.prototype.clearCache=function(){return this.cache=new Turbolinks.SnapshotCache(10)},e.prototype.visit=function(t,e){var r,n;return null==e&&(e={}),t=Turbolinks.Location.wrap(t),this.applicationAllowsVisitingLocation(t)?this.locationIsVisitable(t)?(r=null!=(n=e.action)?n:"advance",this.adapter.visitProposedToLocationWithAction(t,r)):window.location=t:void 0},e.prototype.startVisitToLocationWithAction=function(t,e,r){var n;return Turbolinks.supported?(n=this.getRestorationDataForIdentifier(r),this.startVisit(t,e,{restorationData:n})):window.location=t},e.prototype.setProgressBarDelay=function(t){return this.progressBarDelay=t},e.prototype.startHistory=function(){return this.location=Turbolinks.Location.wrap(window.location),this.restorationIdentifier=Turbolinks.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.stopHistory=function(){return this.history.stop()},e.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.push(this.location,this.restorationIdentifier)},e.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(t,e){return this.restorationIdentifier=e,this.location=Turbolinks.Location.wrap(t),this.history.replace(this.location,this.restorationIdentifier)},e.prototype.historyPoppedToLocationWithRestorationIdentifier=function(t,e){var r;return this.restorationIdentifier=e,this.enabled?(r=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(t,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:r,historyChanged:!0}),this.location=Turbolinks.Location.wrap(t)):this.adapter.pageInvalidated()},e.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},e.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},e.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},e.prototype.scrollToAnchor=function(t){var e;return(e=this.view.getElementForAnchor(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},e.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},e.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},e.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},e.prototype.render=function(t,e){return this.view.render(t,e)},e.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},e.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},e.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},e.prototype.pageLoaded=function(){
return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},e.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},e.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},e.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},e.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},e.prototype.notifyApplicationAfterClickingLinkToLocation=function(t,e){return Turbolinks.dispatch("turbolinks:click",{target:t,data:{url:e.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationBeforeVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:before-visit",{data:{url:t.absoluteURL},cancelable:!0})},e.prototype.notifyApplicationAfterVisitingLocation=function(t){return Turbolinks.dispatch("turbolinks:visit",{data:{url:t.absoluteURL}})},e.prototype.notifyApplicationBeforeCachingSnapshot=function(){return Turbolinks.dispatch("turbolinks:before-cache")},e.prototype.notifyApplicationBeforeRender=function(t){return Turbolinks.dispatch("turbolinks:before-render",{data:{newBody:t}})},e.prototype.notifyApplicationAfterRender=function(){return Turbolinks.dispatch("turbolinks:render")},e.prototype.notifyApplicationAfterPageLoad=function(t){return null==t&&(t={}),Turbolinks.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:t}})},e.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},e.prototype.createVisit=function(t,e,r){var n,o,i,s,a;return o=null!=r?r:{},s=o.restorationIdentifier,i=o.restorationData,n=o.historyChanged,a=new Turbolinks.Visit(this,t,e),a.restorationIdentifier=null!=s?s:Turbolinks.uuid(),a.restorationData=Turbolinks.copyObject(i),a.historyChanged=n,a.referrer=this.location,a},e.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},e.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},e.prototype.getVisitableLinkForNode=function(t){return this.nodeIsVisitable(t)?Turbolinks.closest(t,"a[href]:not([target]):not([download])"):void 0},e.prototype.getVisitableLocationForLink=function(t){var e;return e=new Turbolinks.Location(t.getAttribute("href")),this.locationIsVisitable(e)?e:void 0},e.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},e.prototype.nodeIsVisitable=function(t){var e;return(e=Turbolinks.closest(t,"[data-turbolinks]"))?"false"!==e.getAttribute("data-turbolinks"):!0},e.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},e.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},e.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},e}()}.call(this),function(){!function(){var t,e;if((t=e=document.currentScript)&&!e.hasAttribute("data-turbolinks-suppress-warning"))for(;t=t.parentNode;)if(t===document.body)return console.warn("You are loading Turbolinks from a <script> element inside the <body> element. This is probably not what you meant to do!\n\nLoad your application\u2019s JavaScript bundle inside the <head> element instead. <script> elements in <body> are evaluated with each page change.\n\nFor more information, see: https://github.com/turbolinks/turbolinks#working-with-script-elements\n\n\u2014\u2014\nSuppress this warning by adding a `data-turbolinks-suppress-warning` attribute to: %s",e.outerHTML)}()}.call(this),function(){var t,e,r;Turbolinks.start=function(){return e()?(null==Turbolinks.controller&&(Turbolinks.controller=t()),Turbolinks.controller.start()):void 0},e=function(){return null==window.Turbolinks&&(window.Turbolinks=Turbolinks),r()},t=function(){var t;return t=new Turbolinks.Controller,t.adapter=new Turbolinks.BrowserAdapter(t),t},r=function(){return window.Turbolinks===Turbolinks},r()&&Turbolinks.start()}.call(this);
(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('popper.js')) :
        typeof define === 'function' && define.amd ? define(['jquery', 'popper.js'], factory) :
        (factory(global.jQuery, global.Popper));
}(this, (function($, Popper$1) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Popper$1 = Popper$1 && Popper$1.hasOwnProperty('default') ? Popper$1['default'] : Popper$1;

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function _extends() {
        _extends = Object.assign || function(target) {
            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];

                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }

            return target;
        };

        return _extends.apply(this, arguments);
    }

    function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): util.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Util = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Private TransitionEnd Helpers
         * ------------------------------------------------------------------------
         */
        var transition = false;
        var MAX_UID = 1000000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

        function toType(obj) {
            return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
        }

        function getSpecialTransitionEndEvent() {
            return {
                bindType: transition.end,
                delegateType: transition.end,
                handle: function handle(event) {
                    if ($$$1(event.target).is(this)) {
                        return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
                    }

                    return undefined; // eslint-disable-line no-undefined
                }
            };
        }

        function transitionEndTest() {
            if (typeof window !== 'undefined' && window.QUnit) {
                return false;
            }

            return {
                end: 'transitionend'
            };
        }

        function transitionEndEmulator(duration) {
            var _this = this;

            var called = false;
            $$$1(this).one(Util.TRANSITION_END, function() {
                called = true;
            });
            setTimeout(function() {
                if (!called) {
                    Util.triggerTransitionEnd(_this);
                }
            }, duration);
            return this;
        }

        function setTransitionEndSupport() {
            transition = transitionEndTest();
            $$$1.fn.emulateTransitionEnd = transitionEndEmulator;

            if (Util.supportsTransitionEnd()) {
                $$$1.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
            }
        }
        /**
         * --------------------------------------------------------------------------
         * Public Util Api
         * --------------------------------------------------------------------------
         */


        var Util = {
            TRANSITION_END: 'bsTransitionEnd',
            getUID: function getUID(prefix) {
                do {
                    // eslint-disable-next-line no-bitwise
                    prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
                } while (document.getElementById(prefix));

                return prefix;
            },
            getSelectorFromElement: function getSelectorFromElement(element) {
                var selector = element.getAttribute('data-target');

                if (!selector || selector === '#') {
                    selector = element.getAttribute('href') || '';
                }

                try {
                    var $selector = $$$1(document).find(selector);
                    return $selector.length > 0 ? selector : null;
                } catch (err) {
                    return null;
                }
            },
            reflow: function reflow(element) {
                return element.offsetHeight;
            },
            triggerTransitionEnd: function triggerTransitionEnd(element) {
                $$$1(element).trigger(transition.end);
            },
            supportsTransitionEnd: function supportsTransitionEnd() {
                return Boolean(transition);
            },
            isElement: function isElement(obj) {
                return (obj[0] || obj).nodeType;
            },
            typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
                for (var property in configTypes) {
                    if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
                        var expectedTypes = configTypes[property];
                        var value = config[property];
                        var valueType = value && Util.isElement(value) ? 'element' : toType(value);

                        if (!new RegExp(expectedTypes).test(valueType)) {
                            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
                        }
                    }
                }
            }
        };
        setTransitionEndSupport();
        return Util;
    }($);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): alert.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Alert = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'alert';
        var VERSION = '4.0.0';
        var DATA_KEY = 'bs.alert';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var TRANSITION_DURATION = 150;
        var Selector = {
            DISMISS: '[data-dismiss="alert"]'
        };
        var Event = {
            CLOSE: "close" + EVENT_KEY,
            CLOSED: "closed" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            ALERT: 'alert',
            FADE: 'fade',
            SHOW: 'show'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Alert =
            /*#__PURE__*/
            function() {
                function Alert(element) {
                    this._element = element;
                } // Getters


                var _proto = Alert.prototype;

                // Public
                _proto.close = function close(element) {
                    element = element || this._element;

                    var rootElement = this._getRootElement(element);

                    var customEvent = this._triggerCloseEvent(rootElement);

                    if (customEvent.isDefaultPrevented()) {
                        return;
                    }

                    this._removeElement(rootElement);
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    this._element = null;
                }; // Private


                _proto._getRootElement = function _getRootElement(element) {
                    var selector = Util.getSelectorFromElement(element);
                    var parent = false;

                    if (selector) {
                        parent = $$$1(selector)[0];
                    }

                    if (!parent) {
                        parent = $$$1(element).closest("." + ClassName.ALERT)[0];
                    }

                    return parent;
                };

                _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
                    var closeEvent = $$$1.Event(Event.CLOSE);
                    $$$1(element).trigger(closeEvent);
                    return closeEvent;
                };

                _proto._removeElement = function _removeElement(element) {
                    var _this = this;

                    $$$1(element).removeClass(ClassName.SHOW);

                    if (!Util.supportsTransitionEnd() || !$$$1(element).hasClass(ClassName.FADE)) {
                        this._destroyElement(element);

                        return;
                    }

                    $$$1(element).one(Util.TRANSITION_END, function(event) {
                        return _this._destroyElement(element, event);
                    }).emulateTransitionEnd(TRANSITION_DURATION);
                };

                _proto._destroyElement = function _destroyElement(element) {
                    $$$1(element).detach().trigger(Event.CLOSED).remove();
                }; // Static


                Alert._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Alert(this);
                            $element.data(DATA_KEY, data);
                        }

                        if (config === 'close') {
                            data[config](this);
                        }
                    });
                };

                Alert._handleDismiss = function _handleDismiss(alertInstance) {
                    return function(event) {
                        if (event) {
                            event.preventDefault();
                        }

                        alertInstance.close(this);
                    };
                };

                _createClass(Alert, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }]);

                return Alert;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DISMISS, Alert._handleDismiss(new Alert()));
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Alert._jQueryInterface;
        $$$1.fn[NAME].Constructor = Alert;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Alert._jQueryInterface;
        };

        return Alert;
    }($);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): button.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Button = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'button';
        var VERSION = '4.0.0';
        var DATA_KEY = 'bs.button';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var ClassName = {
            ACTIVE: 'active',
            BUTTON: 'btn',
            FOCUS: 'focus'
        };
        var Selector = {
            DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
            DATA_TOGGLE: '[data-toggle="buttons"]',
            INPUT: 'input',
            ACTIVE: '.active',
            BUTTON: '.btn'
        };
        var Event = {
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
            FOCUS_BLUR_DATA_API: "focus" + EVENT_KEY + DATA_API_KEY + " " + ("blur" + EVENT_KEY + DATA_API_KEY)
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Button =
            /*#__PURE__*/
            function() {
                function Button(element) {
                    this._element = element;
                } // Getters


                var _proto = Button.prototype;

                // Public
                _proto.toggle = function toggle() {
                    var triggerChangeEvent = true;
                    var addAriaPressed = true;
                    var rootElement = $$$1(this._element).closest(Selector.DATA_TOGGLE)[0];

                    if (rootElement) {
                        var input = $$$1(this._element).find(Selector.INPUT)[0];

                        if (input) {
                            if (input.type === 'radio') {
                                if (input.checked && $$$1(this._element).hasClass(ClassName.ACTIVE)) {
                                    triggerChangeEvent = false;
                                } else {
                                    var activeElement = $$$1(rootElement).find(Selector.ACTIVE)[0];

                                    if (activeElement) {
                                        $$$1(activeElement).removeClass(ClassName.ACTIVE);
                                    }
                                }
                            }

                            if (triggerChangeEvent) {
                                if (input.hasAttribute('disabled') || rootElement.hasAttribute('disabled') || input.classList.contains('disabled') || rootElement.classList.contains('disabled')) {
                                    return;
                                }

                                input.checked = !$$$1(this._element).hasClass(ClassName.ACTIVE);
                                $$$1(input).trigger('change');
                            }

                            input.focus();
                            addAriaPressed = false;
                        }
                    }

                    if (addAriaPressed) {
                        this._element.setAttribute('aria-pressed', !$$$1(this._element).hasClass(ClassName.ACTIVE));
                    }

                    if (triggerChangeEvent) {
                        $$$1(this._element).toggleClass(ClassName.ACTIVE);
                    }
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    this._element = null;
                }; // Static


                Button._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var data = $$$1(this).data(DATA_KEY);

                        if (!data) {
                            data = new Button(this);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (config === 'toggle') {
                            data[config]();
                        }
                    });
                };

                _createClass(Button, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }]);

                return Button;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE_CARROT, function(event) {
            event.preventDefault();
            var button = event.target;

            if (!$$$1(button).hasClass(ClassName.BUTTON)) {
                button = $$$1(button).closest(Selector.BUTTON);
            }

            Button._jQueryInterface.call($$$1(button), 'toggle');
        }).on(Event.FOCUS_BLUR_DATA_API, Selector.DATA_TOGGLE_CARROT, function(event) {
            var button = $$$1(event.target).closest(Selector.BUTTON)[0];
            $$$1(button).toggleClass(ClassName.FOCUS, /^focus(in)?$/.test(event.type));
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Button._jQueryInterface;
        $$$1.fn[NAME].Constructor = Button;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Button._jQueryInterface;
        };

        return Button;
    }($);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0-beta): carousel.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Carousel = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'carousel';
        var VERSION = '4.0.0-beta';
        var DATA_KEY = 'bs.carousel';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var TRANSITION_DURATION = 600;
        var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

        var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

        var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

        var Default = {
            interval: 5000,
            keyboard: true,
            slide: false,
            pause: 'hover',
            wrap: true
        };
        var DefaultType = {
            interval: '(number|boolean)',
            keyboard: 'boolean',
            slide: '(boolean|string)',
            pause: '(string|boolean)',
            wrap: 'boolean'
        };
        var Direction = {
            NEXT: 'next',
            PREV: 'prev',
            LEFT: 'left',
            RIGHT: 'right'
        };
        var Event = {
            SLIDE: "slide" + EVENT_KEY,
            SLID: "slid" + EVENT_KEY,
            KEYDOWN: "keydown" + EVENT_KEY,
            MOUSEENTER: "mouseenter" + EVENT_KEY,
            MOUSELEAVE: "mouseleave" + EVENT_KEY,
            TOUCHEND: "touchend" + EVENT_KEY,
            LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            CAROUSEL: 'carousel',
            ACTIVE: 'active',
            SLIDE: 'slide',
            RIGHT: 'carousel-item-right',
            LEFT: 'carousel-item-left',
            NEXT: 'carousel-item-next',
            PREV: 'carousel-item-prev',
            ITEM: 'carousel-item'
        };
        var Selector = {
            ACTIVE: '.active',
            ACTIVE_ITEM: '.active.carousel-item',
            ITEM: '.carousel-item',
            NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
            INDICATORS: '.carousel-indicators',
            DATA_SLIDE: '[data-slide], [data-slide-to]',
            DATA_RIDE: '[data-ride="carousel"]'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Carousel =
            /*#__PURE__*/
            function() {
                function Carousel(element, config) {
                    this._items = null;
                    this._interval = null;
                    this._activeElement = null;
                    this._isPaused = false;
                    this._isSliding = false;
                    this.touchTimeout = null;
                    this._config = this._getConfig(config);
                    this._element = $$$1(element)[0];
                    this._indicatorsElement = $$$1(this._element).find(Selector.INDICATORS)[0];

                    this._addEventListeners();
                } // getters


                var _proto = Carousel.prototype;

                // public
                _proto.next = function next() {
                    if (!this._isSliding) {
                        this._slide(Direction.NEXT);
                    }
                };

                _proto.nextWhenVisible = function nextWhenVisible() {
                    // Don't call next when the page isn't visible
                    if (!document.hidden) {
                        this.next();
                    }
                };

                _proto.prev = function prev() {
                    if (!this._isSliding) {
                        this._slide(Direction.PREV);
                    }
                };

                _proto.pause = function pause(event) {
                    if (!event) {
                        this._isPaused = true;
                    }

                    if ($$$1(this._element).find(Selector.NEXT_PREV)[0] && Util.supportsTransitionEnd()) {
                        Util.triggerTransitionEnd(this._element);
                        this.cycle(true);
                    }

                    clearInterval(this._interval);
                    this._interval = null;
                };

                _proto.cycle = function cycle(event) {
                    if (!event) {
                        this._isPaused = false;
                    }

                    if (this._interval) {
                        clearInterval(this._interval);
                        this._interval = null;
                    }

                    if (this._config.interval && !this._isPaused) {
                        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
                    }
                };

                _proto.to = function to(index) {
                    var _this = this;

                    this._activeElement = $$$1(this._element).find(Selector.ACTIVE_ITEM)[0];

                    var activeIndex = this._getItemIndex(this._activeElement);

                    if (index > this._items.length - 1 || index < 0) {
                        return;
                    }

                    if (this._isSliding) {
                        $$$1(this._element).one(Event.SLID, function() {
                            return _this.to(index);
                        });
                        return;
                    }

                    if (activeIndex === index) {
                        this.pause();
                        this.cycle();
                        return;
                    }

                    var direction = index > activeIndex ? Direction.NEXT : Direction.PREV;

                    this._slide(direction, this._items[index]);
                };

                _proto.dispose = function dispose() {
                    $$$1(this._element).off(EVENT_KEY);
                    $$$1.removeData(this._element, DATA_KEY);
                    this._items = null;
                    this._config = null;
                    this._element = null;
                    this._interval = null;
                    this._isPaused = null;
                    this._isSliding = null;
                    this._activeElement = null;
                    this._indicatorsElement = null;
                }; // private


                _proto._getConfig = function _getConfig(config) {
                    config = $$$1.extend({}, Default, config);
                    Util.typeCheckConfig(NAME, config, DefaultType);
                    return config;
                };

                _proto._addEventListeners = function _addEventListeners() {
                    var _this2 = this;

                    if (this._config.keyboard) {
                        $$$1(this._element).on(Event.KEYDOWN, function(event) {
                            return _this2._keydown(event);
                        });
                    }

                    if (this._config.pause === 'hover') {
                        $$$1(this._element).on(Event.MOUSEENTER, function(event) {
                            return _this2.pause(event);
                        }).on(Event.MOUSELEAVE, function(event) {
                            return _this2.cycle(event);
                        });

                        if ('ontouchstart' in document.documentElement) {
                            // if it's a touch-enabled device, mouseenter/leave are fired as
                            // part of the mouse compatibility events on first tap - the carousel
                            // would stop cycling until user tapped out of it;
                            // here, we listen for touchend, explicitly pause the carousel
                            // (as if it's the second time we tap on it, mouseenter compat event
                            // is NOT fired) and after a timeout (to allow for mouse compatibility
                            // events to fire) we explicitly restart cycling
                            $$$1(this._element).on(Event.TOUCHEND, function() {
                                _this2.pause();

                                if (_this2.touchTimeout) {
                                    clearTimeout(_this2.touchTimeout);
                                }

                                _this2.touchTimeout = setTimeout(function(event) {
                                    return _this2.cycle(event);
                                }, TOUCHEVENT_COMPAT_WAIT + _this2._config.interval);
                            });
                        }
                    }
                };

                _proto._keydown = function _keydown(event) {
                    if (/input|textarea/i.test(event.target.tagName)) {
                        return;
                    }

                    switch (event.which) {
                        case ARROW_LEFT_KEYCODE:
                            event.preventDefault();
                            this.prev();
                            break;

                        case ARROW_RIGHT_KEYCODE:
                            event.preventDefault();
                            this.next();
                            break;

                        default:
                            return;
                    }
                };

                _proto._getItemIndex = function _getItemIndex(element) {
                    this._items = $$$1.makeArray($$$1(element).parent().find(Selector.ITEM));
                    return this._items.indexOf(element);
                };

                _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
                    var isNextDirection = direction === Direction.NEXT;
                    var isPrevDirection = direction === Direction.PREV;

                    var activeIndex = this._getItemIndex(activeElement);

                    var lastItemIndex = this._items.length - 1;
                    var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

                    if (isGoingToWrap && !this._config.wrap) {
                        return activeElement;
                    }

                    var delta = direction === Direction.PREV ? -1 : 1;
                    var itemIndex = (activeIndex + delta) % this._items.length;
                    return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
                };

                _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
                    var targetIndex = this._getItemIndex(relatedTarget);

                    var fromIndex = this._getItemIndex($$$1(this._element).find(Selector.ACTIVE_ITEM)[0]);

                    var slideEvent = $$$1.Event(Event.SLIDE, {
                        relatedTarget: relatedTarget,
                        direction: eventDirectionName,
                        from: fromIndex,
                        to: targetIndex
                    });
                    $$$1(this._element).trigger(slideEvent);
                    return slideEvent;
                };

                _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
                    if (this._indicatorsElement) {
                        $$$1(this._indicatorsElement).find(Selector.ACTIVE).removeClass(ClassName.ACTIVE);

                        var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

                        if (nextIndicator) {
                            $$$1(nextIndicator).addClass(ClassName.ACTIVE);
                        }
                    }
                };

                _proto._slide = function _slide(direction, element) {
                    var _this3 = this;

                    var activeElement = $$$1(this._element).find(Selector.ACTIVE_ITEM)[0];

                    var activeElementIndex = this._getItemIndex(activeElement);

                    var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

                    var nextElementIndex = this._getItemIndex(nextElement);

                    var isCycling = Boolean(this._interval);
                    var directionalClassName;
                    var orderClassName;
                    var eventDirectionName;

                    if (direction === Direction.NEXT) {
                        directionalClassName = ClassName.LEFT;
                        orderClassName = ClassName.NEXT;
                        eventDirectionName = Direction.LEFT;
                    } else {
                        directionalClassName = ClassName.RIGHT;
                        orderClassName = ClassName.PREV;
                        eventDirectionName = Direction.RIGHT;
                    }

                    if (nextElement && $$$1(nextElement).hasClass(ClassName.ACTIVE)) {
                        this._isSliding = false;
                        return;
                    }

                    var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

                    if (slideEvent.isDefaultPrevented()) {
                        return;
                    }

                    if (!activeElement || !nextElement) {
                        // some weirdness is happening, so we bail
                        return;
                    }

                    this._isSliding = true;

                    if (isCycling) {
                        this.pause();
                    }

                    this._setActiveIndicatorElement(nextElement);

                    var slidEvent = $$$1.Event(Event.SLID, {
                        relatedTarget: nextElement,
                        direction: eventDirectionName,
                        from: activeElementIndex,
                        to: nextElementIndex
                    });

                    if (Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.SLIDE)) {
                        $$$1(nextElement).addClass(orderClassName);
                        Util.reflow(nextElement);
                        $$$1(activeElement).addClass(directionalClassName);
                        $$$1(nextElement).addClass(directionalClassName);
                        $$$1(activeElement).one(Util.TRANSITION_END, function() {
                            $$$1(nextElement).removeClass(directionalClassName + " " + orderClassName).addClass(ClassName.ACTIVE);
                            $$$1(activeElement).removeClass(ClassName.ACTIVE + " " + orderClassName + " " + directionalClassName);
                            _this3._isSliding = false;
                            setTimeout(function() {
                                return $$$1(_this3._element).trigger(slidEvent);
                            }, 0);
                        }).emulateTransitionEnd(TRANSITION_DURATION);
                    } else {
                        $$$1(activeElement).removeClass(ClassName.ACTIVE);
                        $$$1(nextElement).addClass(ClassName.ACTIVE);
                        this._isSliding = false;
                        $$$1(this._element).trigger(slidEvent);
                    }

                    if (isCycling) {
                        this.cycle();
                    }
                }; // static


                Carousel._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = $$$1.extend({}, Default, $$$1(this).data());

                        if (typeof config === 'object') {
                            $$$1.extend(_config, config);
                        }

                        var action = typeof config === 'string' ? config : _config.slide;

                        if (!data) {
                            data = new Carousel(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'number') {
                            data.to(config);
                        } else if (typeof action === 'string') {
                            if (data[action] === undefined) {
                                throw new Error("No method named \"" + action + "\"");
                            }

                            data[action]();
                        } else if (_config.interval) {
                            data.pause();
                            data.cycle();
                        }
                    });
                };

                Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
                    var selector = Util.getSelectorFromElement(this);

                    if (!selector) {
                        return;
                    }

                    var target = $$$1(selector)[0];

                    if (!target || !$$$1(target).hasClass(ClassName.CAROUSEL)) {
                        return;
                    }

                    var config = $$$1.extend({}, $$$1(target).data(), $$$1(this).data());
                    var slideIndex = this.getAttribute('data-slide-to');

                    if (slideIndex) {
                        config.interval = false;
                    }

                    Carousel._jQueryInterface.call($$$1(target), config);

                    if (slideIndex) {
                        $$$1(target).data(DATA_KEY).to(slideIndex);
                    }

                    event.preventDefault();
                };

                _createClass(Carousel, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }]);

                return Carousel;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_SLIDE, Carousel._dataApiClickHandler);
        $$$1(window).on(Event.LOAD_DATA_API, function() {
            $$$1(Selector.DATA_RIDE).each(function() {
                var $carousel = $$$1(this);

                Carousel._jQueryInterface.call($carousel, $carousel.data());
            });
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Carousel._jQueryInterface;
        $$$1.fn[NAME].Constructor = Carousel;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Carousel._jQueryInterface;
        };

        return Carousel;
    }(jQuery);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): collapse.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Collapse = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'collapse';
        var VERSION = '4.0.0';
        var DATA_KEY = 'bs.collapse';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var TRANSITION_DURATION = 600;
        var Default = {
            toggle: true,
            parent: ''
        };
        var DefaultType = {
            toggle: 'boolean',
            parent: '(string|element)'
        };
        var Event = {
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            SHOW: 'show',
            COLLAPSE: 'collapse',
            COLLAPSING: 'collapsing',
            COLLAPSED: 'collapsed'
        };
        var Dimension = {
            WIDTH: 'width',
            HEIGHT: 'height'
        };
        var Selector = {
            ACTIVES: '.show, .collapsing',
            DATA_TOGGLE: '[data-toggle="collapse"]'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Collapse =
            /*#__PURE__*/
            function() {
                function Collapse(element, config) {
                    this._isTransitioning = false;
                    this._element = element;
                    this._config = this._getConfig(config);
                    this._triggerArray = $$$1.makeArray($$$1("[data-toggle=\"collapse\"][href=\"#" + element.id + "\"]," + ("[data-toggle=\"collapse\"][data-target=\"#" + element.id + "\"]")));
                    var tabToggles = $$$1(Selector.DATA_TOGGLE);

                    for (var i = 0; i < tabToggles.length; i++) {
                        var elem = tabToggles[i];
                        var selector = Util.getSelectorFromElement(elem);

                        if (selector !== null && $$$1(selector).filter(element).length > 0) {
                            this._selector = selector;

                            this._triggerArray.push(elem);
                        }
                    }

                    this._parent = this._config.parent ? this._getParent() : null;

                    if (!this._config.parent) {
                        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
                    }

                    if (this._config.toggle) {
                        this.toggle();
                    }
                } // Getters


                var _proto = Collapse.prototype;

                // Public
                _proto.toggle = function toggle() {
                    if ($$$1(this._element).hasClass(ClassName.SHOW)) {
                        this.hide();
                    } else {
                        this.show();
                    }
                };

                _proto.show = function show() {
                    var _this = this;

                    if (this._isTransitioning || $$$1(this._element).hasClass(ClassName.SHOW)) {
                        return;
                    }

                    var actives;
                    var activesData;

                    if (this._parent) {
                        actives = $$$1.makeArray($$$1(this._parent).find(Selector.ACTIVES).filter("[data-parent=\"" + this._config.parent + "\"]"));

                        if (actives.length === 0) {
                            actives = null;
                        }
                    }

                    if (actives) {
                        activesData = $$$1(actives).not(this._selector).data(DATA_KEY);

                        if (activesData && activesData._isTransitioning) {
                            return;
                        }
                    }

                    var startEvent = $$$1.Event(Event.SHOW);
                    $$$1(this._element).trigger(startEvent);

                    if (startEvent.isDefaultPrevented()) {
                        return;
                    }

                    if (actives) {
                        Collapse._jQueryInterface.call($$$1(actives).not(this._selector), 'hide');

                        if (!activesData) {
                            $$$1(actives).data(DATA_KEY, null);
                        }
                    }

                    var dimension = this._getDimension();

                    $$$1(this._element).removeClass(ClassName.COLLAPSE).addClass(ClassName.COLLAPSING);
                    this._element.style[dimension] = 0;

                    if (this._triggerArray.length > 0) {
                        $$$1(this._triggerArray).removeClass(ClassName.COLLAPSED).attr('aria-expanded', true);
                    }

                    this.setTransitioning(true);

                    var complete = function complete() {
                        $$$1(_this._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).addClass(ClassName.SHOW);
                        _this._element.style[dimension] = '';

                        _this.setTransitioning(false);

                        $$$1(_this._element).trigger(Event.SHOWN);
                    };

                    if (!Util.supportsTransitionEnd()) {
                        complete();
                        return;
                    }

                    var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
                    var scrollSize = "scroll" + capitalizedDimension;
                    $$$1(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
                    this._element.style[dimension] = this._element[scrollSize] + "px";
                };

                _proto.hide = function hide() {
                    var _this2 = this;

                    if (this._isTransitioning || !$$$1(this._element).hasClass(ClassName.SHOW)) {
                        return;
                    }

                    var startEvent = $$$1.Event(Event.HIDE);
                    $$$1(this._element).trigger(startEvent);

                    if (startEvent.isDefaultPrevented()) {
                        return;
                    }

                    var dimension = this._getDimension();

                    this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px";
                    Util.reflow(this._element);
                    $$$1(this._element).addClass(ClassName.COLLAPSING).removeClass(ClassName.COLLAPSE).removeClass(ClassName.SHOW);

                    if (this._triggerArray.length > 0) {
                        for (var i = 0; i < this._triggerArray.length; i++) {
                            var trigger = this._triggerArray[i];
                            var selector = Util.getSelectorFromElement(trigger);

                            if (selector !== null) {
                                var $elem = $$$1(selector);

                                if (!$elem.hasClass(ClassName.SHOW)) {
                                    $$$1(trigger).addClass(ClassName.COLLAPSED).attr('aria-expanded', false);
                                }
                            }
                        }
                    }

                    this.setTransitioning(true);

                    var complete = function complete() {
                        _this2.setTransitioning(false);

                        $$$1(_this2._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).trigger(Event.HIDDEN);
                    };

                    this._element.style[dimension] = '';

                    if (!Util.supportsTransitionEnd()) {
                        complete();
                        return;
                    }

                    $$$1(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
                };

                _proto.setTransitioning = function setTransitioning(isTransitioning) {
                    this._isTransitioning = isTransitioning;
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    this._config = null;
                    this._parent = null;
                    this._element = null;
                    this._triggerArray = null;
                    this._isTransitioning = null;
                }; // Private


                _proto._getConfig = function _getConfig(config) {
                    config = _extends({}, Default, config);
                    config.toggle = Boolean(config.toggle); // Coerce string values

                    Util.typeCheckConfig(NAME, config, DefaultType);
                    return config;
                };

                _proto._getDimension = function _getDimension() {
                    var hasWidth = $$$1(this._element).hasClass(Dimension.WIDTH);
                    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
                };

                _proto._getParent = function _getParent() {
                    var _this3 = this;

                    var parent = null;

                    if (Util.isElement(this._config.parent)) {
                        parent = this._config.parent; // It's a jQuery object

                        if (typeof this._config.parent.jquery !== 'undefined') {
                            parent = this._config.parent[0];
                        }
                    } else {
                        parent = $$$1(this._config.parent)[0];
                    }

                    var selector = "[data-toggle=\"collapse\"][data-parent=\"" + this._config.parent + "\"]";
                    $$$1(parent).find(selector).each(function(i, element) {
                        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), [element]);
                    });
                    return parent;
                };

                _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
                    if (element) {
                        var isOpen = $$$1(element).hasClass(ClassName.SHOW);

                        if (triggerArray.length > 0) {
                            $$$1(triggerArray).toggleClass(ClassName.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
                        }
                    }
                }; // Static


                Collapse._getTargetFromElement = function _getTargetFromElement(element) {
                    var selector = Util.getSelectorFromElement(element);
                    return selector ? $$$1(selector)[0] : null;
                };

                Collapse._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $this = $$$1(this);
                        var data = $this.data(DATA_KEY);

                        var _config = _extends({}, Default, $this.data(), typeof config === 'object' && config);

                        if (!data && _config.toggle && /show|hide/.test(config)) {
                            _config.toggle = false;
                        }

                        if (!data) {
                            data = new Collapse(this, _config);
                            $this.data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                _createClass(Collapse, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }]);

                return Collapse;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function(event) {
            // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
            if (event.currentTarget.tagName === 'A') {
                event.preventDefault();
            }

            var $trigger = $$$1(this);
            var selector = Util.getSelectorFromElement(this);
            $$$1(selector).each(function() {
                var $target = $$$1(this);
                var data = $target.data(DATA_KEY);
                var config = data ? 'toggle' : $trigger.data();

                Collapse._jQueryInterface.call($target, config);
            });
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Collapse._jQueryInterface;
        $$$1.fn[NAME].Constructor = Collapse;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Collapse._jQueryInterface;
        };

        return Collapse;
    }($);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): modal.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Modal = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'modal';
        var VERSION = '4.0.0';
        var DATA_KEY = 'bs.modal';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var TRANSITION_DURATION = 300;
        var BACKDROP_TRANSITION_DURATION = 150;
        var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

        var Default = {
            backdrop: true,
            keyboard: true,
            focus: true,
            show: true
        };
        var DefaultType = {
            backdrop: '(boolean|string)',
            keyboard: 'boolean',
            focus: 'boolean',
            show: 'boolean'
        };
        var Event = {
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            FOCUSIN: "focusin" + EVENT_KEY,
            RESIZE: "resize" + EVENT_KEY,
            CLICK_DISMISS: "click.dismiss" + EVENT_KEY,
            KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY,
            MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY,
            MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
            BACKDROP: 'modal-backdrop',
            OPEN: 'modal-open',
            FADE: 'fade',
            SHOW: 'show'
        };
        var Selector = {
            DIALOG: '.modal-dialog',
            DATA_TOGGLE: '[data-toggle="modal"]',
            DATA_DISMISS: '[data-dismiss="modal"]',
            FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
            STICKY_CONTENT: '.sticky-top',
            NAVBAR_TOGGLER: '.navbar-toggler'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Modal =
            /*#__PURE__*/
            function() {
                function Modal(element, config) {
                    this._config = this._getConfig(config);
                    this._element = element;
                    this._dialog = $$$1(element).find(Selector.DIALOG)[0];
                    this._backdrop = null;
                    this._isShown = false;
                    this._isBodyOverflowing = false;
                    this._ignoreBackdropClick = false;
                    this._originalBodyPadding = 0;
                    this._scrollbarWidth = 0;
                } // Getters


                var _proto = Modal.prototype;

                // Public
                _proto.toggle = function toggle(relatedTarget) {
                    return this._isShown ? this.hide() : this.show(relatedTarget);
                };

                _proto.show = function show(relatedTarget) {
                    var _this = this;

                    if (this._isTransitioning || this._isShown) {
                        return;
                    }

                    if (Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.FADE)) {
                        this._isTransitioning = true;
                    }

                    var showEvent = $$$1.Event(Event.SHOW, {
                        relatedTarget: relatedTarget
                    });
                    $$$1(this._element).trigger(showEvent);

                    if (this._isShown || showEvent.isDefaultPrevented()) {
                        return;
                    }

                    this._isShown = true;

                    this._checkScrollbar();

                    this._setScrollbar();

                    this._adjustDialog();

                    $$$1(document.body).addClass(ClassName.OPEN);

                    this._setEscapeEvent();

                    this._setResizeEvent();

                    $$$1(this._element).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, function(event) {
                        return _this.hide(event);
                    });
                    $$$1(this._dialog).on(Event.MOUSEDOWN_DISMISS, function() {
                        $$$1(_this._element).one(Event.MOUSEUP_DISMISS, function(event) {
                            if ($$$1(event.target).is(_this._element)) {
                                _this._ignoreBackdropClick = true;
                            }
                        });
                    });

                    this._showBackdrop(function() {
                        return _this._showElement(relatedTarget);
                    });
                };

                _proto.hide = function hide(event) {
                    var _this2 = this;

                    if (event) {
                        event.preventDefault();
                    }

                    if (this._isTransitioning || !this._isShown) {
                        return;
                    }

                    var hideEvent = $$$1.Event(Event.HIDE);
                    $$$1(this._element).trigger(hideEvent);

                    if (!this._isShown || hideEvent.isDefaultPrevented()) {
                        return;
                    }

                    this._isShown = false;
                    var transition = Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.FADE);

                    if (transition) {
                        this._isTransitioning = true;
                    }

                    this._setEscapeEvent();

                    this._setResizeEvent();

                    $$$1(document).off(Event.FOCUSIN);
                    $$$1(this._element).removeClass(ClassName.SHOW);
                    $$$1(this._element).off(Event.CLICK_DISMISS);
                    $$$1(this._dialog).off(Event.MOUSEDOWN_DISMISS);

                    if (transition) {
                        $$$1(this._element).one(Util.TRANSITION_END, function(event) {
                            return _this2._hideModal(event);
                        }).emulateTransitionEnd(TRANSITION_DURATION);
                    } else {
                        this._hideModal();
                    }
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    $$$1(window, document, this._element, this._backdrop).off(EVENT_KEY);
                    this._config = null;
                    this._element = null;
                    this._dialog = null;
                    this._backdrop = null;
                    this._isShown = null;
                    this._isBodyOverflowing = null;
                    this._ignoreBackdropClick = null;
                    this._scrollbarWidth = null;
                };

                _proto.handleUpdate = function handleUpdate() {
                    this._adjustDialog();
                }; // Private


                _proto._getConfig = function _getConfig(config) {
                    config = _extends({}, Default, config);
                    Util.typeCheckConfig(NAME, config, DefaultType);
                    return config;
                };

                _proto._showElement = function _showElement(relatedTarget) {
                    var _this3 = this;

                    var transition = Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.FADE);

                    if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
                        // Don't move modal's DOM position
                        document.body.appendChild(this._element);
                    }

                    this._element.style.display = 'block';

                    this._element.removeAttribute('aria-hidden');

                    this._element.scrollTop = 0;

                    if (transition) {
                        Util.reflow(this._element);
                    }

                    $$$1(this._element).addClass(ClassName.SHOW);

                    if (this._config.focus) {
                        this._enforceFocus();
                    }

                    var shownEvent = $$$1.Event(Event.SHOWN, {
                        relatedTarget: relatedTarget
                    });

                    var transitionComplete = function transitionComplete() {
                        if (_this3._config.focus) {
                            _this3._element.focus();
                        }

                        _this3._isTransitioning = false;
                        $$$1(_this3._element).trigger(shownEvent);
                    };

                    if (transition) {
                        $$$1(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(TRANSITION_DURATION);
                    } else {
                        transitionComplete();
                    }
                };

                _proto._enforceFocus = function _enforceFocus() {
                    var _this4 = this;

                    $$$1(document).off(Event.FOCUSIN) // Guard against infinite focus loop
                        .on(Event.FOCUSIN, function(event) {
                            if (document !== event.target && _this4._element !== event.target && $$$1(_this4._element).has(event.target).length === 0) {
                                _this4._element.focus();
                            }
                        });
                };

                _proto._setEscapeEvent = function _setEscapeEvent() {
                    var _this5 = this;

                    if (this._isShown && this._config.keyboard) {
                        $$$1(this._element).on(Event.KEYDOWN_DISMISS, function(event) {
                            if (event.which === ESCAPE_KEYCODE) {
                                event.preventDefault();

                                _this5.hide();
                            }
                        });
                    } else if (!this._isShown) {
                        $$$1(this._element).off(Event.KEYDOWN_DISMISS);
                    }
                };

                _proto._setResizeEvent = function _setResizeEvent() {
                    var _this6 = this;

                    if (this._isShown) {
                        $$$1(window).on(Event.RESIZE, function(event) {
                            return _this6.handleUpdate(event);
                        });
                    } else {
                        $$$1(window).off(Event.RESIZE);
                    }
                };

                _proto._hideModal = function _hideModal() {
                    var _this7 = this;

                    this._element.style.display = 'none';

                    this._element.setAttribute('aria-hidden', true);

                    this._isTransitioning = false;

                    this._showBackdrop(function() {
                        $$$1(document.body).removeClass(ClassName.OPEN);

                        _this7._resetAdjustments();

                        _this7._resetScrollbar();

                        $$$1(_this7._element).trigger(Event.HIDDEN);
                    });
                };

                _proto._removeBackdrop = function _removeBackdrop() {
                    if (this._backdrop) {
                        $$$1(this._backdrop).remove();
                        this._backdrop = null;
                    }
                };

                _proto._showBackdrop = function _showBackdrop(callback) {
                    var _this8 = this;

                    var animate = $$$1(this._element).hasClass(ClassName.FADE) ? ClassName.FADE : '';

                    if (this._isShown && this._config.backdrop) {
                        var doAnimate = Util.supportsTransitionEnd() && animate;
                        this._backdrop = document.createElement('div');
                        this._backdrop.className = ClassName.BACKDROP;

                        if (animate) {
                            $$$1(this._backdrop).addClass(animate);
                        }

                        $$$1(this._backdrop).appendTo(document.body);
                        $$$1(this._element).on(Event.CLICK_DISMISS, function(event) {
                            if (_this8._ignoreBackdropClick) {
                                _this8._ignoreBackdropClick = false;
                                return;
                            }

                            if (event.target !== event.currentTarget) {
                                return;
                            }

                            if (_this8._config.backdrop === 'static') {
                                _this8._element.focus();
                            } else {
                                _this8.hide();
                            }
                        });

                        if (doAnimate) {
                            Util.reflow(this._backdrop);
                        }

                        $$$1(this._backdrop).addClass(ClassName.SHOW);

                        if (!callback) {
                            return;
                        }

                        if (!doAnimate) {
                            callback();
                            return;
                        }

                        $$$1(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(BACKDROP_TRANSITION_DURATION);
                    } else if (!this._isShown && this._backdrop) {
                        $$$1(this._backdrop).removeClass(ClassName.SHOW);

                        var callbackRemove = function callbackRemove() {
                            _this8._removeBackdrop();

                            if (callback) {
                                callback();
                            }
                        };

                        if (Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.FADE)) {
                            $$$1(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(BACKDROP_TRANSITION_DURATION);
                        } else {
                            callbackRemove();
                        }
                    } else if (callback) {
                        callback();
                    }
                }; // ----------------------------------------------------------------------
                // the following methods are used to handle overflowing modals
                // todo (fat): these should probably be refactored out of modal.js
                // ----------------------------------------------------------------------


                _proto._adjustDialog = function _adjustDialog() {
                    var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

                    if (!this._isBodyOverflowing && isModalOverflowing) {
                        this._element.style.paddingLeft = this._scrollbarWidth + "px";
                    }

                    if (this._isBodyOverflowing && !isModalOverflowing) {
                        this._element.style.paddingRight = this._scrollbarWidth + "px";
                    }
                };

                _proto._resetAdjustments = function _resetAdjustments() {
                    this._element.style.paddingLeft = '';
                    this._element.style.paddingRight = '';
                };

                _proto._checkScrollbar = function _checkScrollbar() {
                    var rect = document.body.getBoundingClientRect();
                    this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
                    this._scrollbarWidth = this._getScrollbarWidth();
                };

                _proto._setScrollbar = function _setScrollbar() {
                    var _this9 = this;

                    if (this._isBodyOverflowing) {
                        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
                        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
                        // Adjust fixed content padding
                        $$$1(Selector.FIXED_CONTENT).each(function(index, element) {
                            var actualPadding = $$$1(element)[0].style.paddingRight;
                            var calculatedPadding = $$$1(element).css('padding-right');
                            $$$1(element).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + _this9._scrollbarWidth + "px");
                        }); // Adjust sticky content margin

                        $$$1(Selector.STICKY_CONTENT).each(function(index, element) {
                            var actualMargin = $$$1(element)[0].style.marginRight;
                            var calculatedMargin = $$$1(element).css('margin-right');
                            $$$1(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) - _this9._scrollbarWidth + "px");
                        }); // Adjust navbar-toggler margin

                        $$$1(Selector.NAVBAR_TOGGLER).each(function(index, element) {
                            var actualMargin = $$$1(element)[0].style.marginRight;
                            var calculatedMargin = $$$1(element).css('margin-right');
                            $$$1(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) + _this9._scrollbarWidth + "px");
                        }); // Adjust body padding

                        var actualPadding = document.body.style.paddingRight;
                        var calculatedPadding = $$$1('body').css('padding-right');
                        $$$1('body').data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px");
                    }
                };

                _proto._resetScrollbar = function _resetScrollbar() {
                    // Restore fixed content padding
                    $$$1(Selector.FIXED_CONTENT).each(function(index, element) {
                        var padding = $$$1(element).data('padding-right');

                        if (typeof padding !== 'undefined') {
                            $$$1(element).css('padding-right', padding).removeData('padding-right');
                        }
                    }); // Restore sticky content and navbar-toggler margin

                    $$$1(Selector.STICKY_CONTENT + ", " + Selector.NAVBAR_TOGGLER).each(function(index, element) {
                        var margin = $$$1(element).data('margin-right');

                        if (typeof margin !== 'undefined') {
                            $$$1(element).css('margin-right', margin).removeData('margin-right');
                        }
                    }); // Restore body padding

                    var padding = $$$1('body').data('padding-right');

                    if (typeof padding !== 'undefined') {
                        $$$1('body').css('padding-right', padding).removeData('padding-right');
                    }
                };

                _proto._getScrollbarWidth = function _getScrollbarWidth() {
                    // thx d.walsh
                    var scrollDiv = document.createElement('div');
                    scrollDiv.className = ClassName.SCROLLBAR_MEASURER;
                    document.body.appendChild(scrollDiv);
                    var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
                    document.body.removeChild(scrollDiv);
                    return scrollbarWidth;
                }; // Static


                Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
                    return this.each(function() {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = _extends({}, Modal.Default, $$$1(this).data(), typeof config === 'object' && config);

                        if (!data) {
                            data = new Modal(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config](relatedTarget);
                        } else if (_config.show) {
                            data.show(relatedTarget);
                        }
                    });
                };

                _createClass(Modal, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }]);

                return Modal;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function(event) {
            var _this10 = this;

            var target;
            var selector = Util.getSelectorFromElement(this);

            if (selector) {
                target = $$$1(selector)[0];
            }

            var config = $$$1(target).data(DATA_KEY) ? 'toggle' : _extends({}, $$$1(target).data(), $$$1(this).data());

            if (this.tagName === 'A' || this.tagName === 'AREA') {
                event.preventDefault();
            }

            var $target = $$$1(target).one(Event.SHOW, function(showEvent) {
                if (showEvent.isDefaultPrevented()) {
                    // Only register focus restorer if modal will actually get shown
                    return;
                }

                $target.one(Event.HIDDEN, function() {
                    if ($$$1(_this10).is(':visible')) {
                        _this10.focus();
                    }
                });
            });

            Modal._jQueryInterface.call($$$1(target), config, this);
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Modal._jQueryInterface;
        $$$1.fn[NAME].Constructor = Modal;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Modal._jQueryInterface;
        };

        return Modal;
    }($);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): tooltip.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Tooltip = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'tooltip';
        var VERSION = '4.0.0';
        var DATA_KEY = 'bs.tooltip';
        var EVENT_KEY = "." + DATA_KEY;
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var TRANSITION_DURATION = 150;
        var CLASS_PREFIX = 'bs-tooltip';
        var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
        var DefaultType = {
            animation: 'boolean',
            template: 'string',
            title: '(string|element|function)',
            trigger: 'string',
            delay: '(number|object)',
            html: 'boolean',
            selector: '(string|boolean)',
            placement: '(string|function)',
            offset: '(number|string)',
            container: '(string|element|boolean)',
            fallbackPlacement: '(string|array)',
            boundary: '(string|element)'
        };
        var AttachmentMap = {
            AUTO: 'auto',
            TOP: 'top',
            RIGHT: 'right',
            BOTTOM: 'bottom',
            LEFT: 'left'
        };
        var Default = {
            animation: true,
            template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
            trigger: 'hover focus',
            title: '',
            delay: 0,
            html: false,
            selector: false,
            placement: 'top',
            offset: 0,
            container: false,
            fallbackPlacement: 'flip',
            boundary: 'scrollParent'
        };
        var HoverState = {
            SHOW: 'show',
            OUT: 'out'
        };
        var Event = {
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            INSERTED: "inserted" + EVENT_KEY,
            CLICK: "click" + EVENT_KEY,
            FOCUSIN: "focusin" + EVENT_KEY,
            FOCUSOUT: "focusout" + EVENT_KEY,
            MOUSEENTER: "mouseenter" + EVENT_KEY,
            MOUSELEAVE: "mouseleave" + EVENT_KEY
        };
        var ClassName = {
            FADE: 'fade',
            SHOW: 'show'
        };
        var Selector = {
            TOOLTIP: '.tooltip',
            TOOLTIP_INNER: '.tooltip-inner',
            ARROW: '.arrow'
        };
        var Trigger = {
            HOVER: 'hover',
            FOCUS: 'focus',
            CLICK: 'click',
            MANUAL: 'manual'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Tooltip =
            /*#__PURE__*/
            function() {
                function Tooltip(element, config) {
                    /**
                     * Check for Popper dependency
                     * Popper - https://popper.js.org
                     */
                    if (typeof Popper$1 === 'undefined') {
                        throw new TypeError('Bootstrap tooltips require Popper.js (https://popper.js.org)');
                    } // private


                    this._isEnabled = true;
                    this._timeout = 0;
                    this._hoverState = '';
                    this._activeTrigger = {};
                    this._popper = null; // Protected

                    this.element = element;
                    this.config = this._getConfig(config);
                    this.tip = null;

                    this._setListeners();
                } // Getters


                var _proto = Tooltip.prototype;

                // Public
                _proto.enable = function enable() {
                    this._isEnabled = true;
                };

                _proto.disable = function disable() {
                    this._isEnabled = false;
                };

                _proto.toggleEnabled = function toggleEnabled() {
                    this._isEnabled = !this._isEnabled;
                };

                _proto.toggle = function toggle(event) {
                    if (!this._isEnabled) {
                        return;
                    }

                    if (event) {
                        var dataKey = this.constructor.DATA_KEY;
                        var context = $$$1(event.currentTarget).data(dataKey);

                        if (!context) {
                            context = new this.constructor(event.currentTarget, this._getDelegateConfig());
                            $$$1(event.currentTarget).data(dataKey, context);
                        }

                        context._activeTrigger.click = !context._activeTrigger.click;

                        if (context._isWithActiveTrigger()) {
                            context._enter(null, context);
                        } else {
                            context._leave(null, context);
                        }
                    } else {
                        if ($$$1(this.getTipElement()).hasClass(ClassName.SHOW)) {
                            this._leave(null, this);

                            return;
                        }

                        this._enter(null, this);
                    }
                };

                _proto.dispose = function dispose() {
                    clearTimeout(this._timeout);
                    $$$1.removeData(this.element, this.constructor.DATA_KEY);
                    $$$1(this.element).off(this.constructor.EVENT_KEY);
                    $$$1(this.element).closest('.modal').off('hide.bs.modal');

                    if (this.tip) {
                        $$$1(this.tip).remove();
                    }

                    this._isEnabled = null;
                    this._timeout = null;
                    this._hoverState = null;
                    this._activeTrigger = null;

                    if (this._popper !== null) {
                        this._popper.destroy();
                    }

                    this._popper = null;
                    this.element = null;
                    this.config = null;
                    this.tip = null;
                };

                _proto.show = function show() {
                    var _this = this;

                    if ($$$1(this.element).css('display') === 'none') {
                        throw new Error('Please use show on visible elements');
                    }

                    var showEvent = $$$1.Event(this.constructor.Event.SHOW);

                    if (this.isWithContent() && this._isEnabled) {
                        $$$1(this.element).trigger(showEvent);
                        var isInTheDom = $$$1.contains(this.element.ownerDocument.documentElement, this.element);

                        if (showEvent.isDefaultPrevented() || !isInTheDom) {
                            return;
                        }

                        var tip = this.getTipElement();
                        var tipId = Util.getUID(this.constructor.NAME);
                        tip.setAttribute('id', tipId);
                        this.element.setAttribute('aria-describedby', tipId);
                        this.setContent();

                        if (this.config.animation) {
                            $$$1(tip).addClass(ClassName.FADE);
                        }

                        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

                        var attachment = this._getAttachment(placement);

                        this.addAttachmentClass(attachment);
                        var container = this.config.container === false ? document.body : $$$1(this.config.container);
                        $$$1(tip).data(this.constructor.DATA_KEY, this);

                        if (!$$$1.contains(this.element.ownerDocument.documentElement, this.tip)) {
                            $$$1(tip).appendTo(container);
                        }

                        $$$1(this.element).trigger(this.constructor.Event.INSERTED);
                        this._popper = new Popper$1(this.element, tip, {
                            placement: attachment,
                            modifiers: {
                                offset: {
                                    offset: this.config.offset
                                },
                                flip: {
                                    behavior: this.config.fallbackPlacement
                                },
                                arrow: {
                                    element: Selector.ARROW
                                },
                                preventOverflow: {
                                    boundariesElement: this.config.boundary
                                }
                            },
                            onCreate: function onCreate(data) {
                                if (data.originalPlacement !== data.placement) {
                                    _this._handlePopperPlacementChange(data);
                                }
                            },
                            onUpdate: function onUpdate(data) {
                                _this._handlePopperPlacementChange(data);
                            }
                        });
                        $$$1(tip).addClass(ClassName.SHOW); // If this is a touch-enabled device we add extra
                        // empty mouseover listeners to the body's immediate children;
                        // only needed because of broken event delegation on iOS
                        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

                        if ('ontouchstart' in document.documentElement) {
                            $$$1('body').children().on('mouseover', null, $$$1.noop);
                        }

                        var complete = function complete() {
                            if (_this.config.animation) {
                                _this._fixTransition();
                            }

                            var prevHoverState = _this._hoverState;
                            _this._hoverState = null;
                            $$$1(_this.element).trigger(_this.constructor.Event.SHOWN);

                            if (prevHoverState === HoverState.OUT) {
                                _this._leave(null, _this);
                            }
                        };

                        if (Util.supportsTransitionEnd() && $$$1(this.tip).hasClass(ClassName.FADE)) {
                            $$$1(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(Tooltip._TRANSITION_DURATION);
                        } else {
                            complete();
                        }
                    }
                };

                _proto.hide = function hide(callback) {
                    var _this2 = this;

                    var tip = this.getTipElement();
                    var hideEvent = $$$1.Event(this.constructor.Event.HIDE);

                    var complete = function complete() {
                        if (_this2._hoverState !== HoverState.SHOW && tip.parentNode) {
                            tip.parentNode.removeChild(tip);
                        }

                        _this2._cleanTipClass();

                        _this2.element.removeAttribute('aria-describedby');

                        $$$1(_this2.element).trigger(_this2.constructor.Event.HIDDEN);

                        if (_this2._popper !== null) {
                            _this2._popper.destroy();
                        }

                        if (callback) {
                            callback();
                        }
                    };

                    $$$1(this.element).trigger(hideEvent);

                    if (hideEvent.isDefaultPrevented()) {
                        return;
                    }

                    $$$1(tip).removeClass(ClassName.SHOW); // If this is a touch-enabled device we remove the extra
                    // empty mouseover listeners we added for iOS support

                    if ('ontouchstart' in document.documentElement) {
                        $$$1('body').children().off('mouseover', null, $$$1.noop);
                    }

                    this._activeTrigger[Trigger.CLICK] = false;
                    this._activeTrigger[Trigger.FOCUS] = false;
                    this._activeTrigger[Trigger.HOVER] = false;

                    if (Util.supportsTransitionEnd() && $$$1(this.tip).hasClass(ClassName.FADE)) {
                        $$$1(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
                    } else {
                        complete();
                    }

                    this._hoverState = '';
                };

                _proto.update = function update() {
                    if (this._popper !== null) {
                        this._popper.scheduleUpdate();
                    }
                }; // Protected


                _proto.isWithContent = function isWithContent() {
                    return Boolean(this.getTitle());
                };

                _proto.addAttachmentClass = function addAttachmentClass(attachment) {
                    $$$1(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
                };

                _proto.getTipElement = function getTipElement() {
                    this.tip = this.tip || $$$1(this.config.template)[0];
                    return this.tip;
                };

                _proto.setContent = function setContent() {
                    var $tip = $$$1(this.getTipElement());
                    this.setElementContent($tip.find(Selector.TOOLTIP_INNER), this.getTitle());
                    $tip.removeClass(ClassName.FADE + " " + ClassName.SHOW);
                };

                _proto.setElementContent = function setElementContent($element, content) {
                    var html = this.config.html;

                    if (typeof content === 'object' && (content.nodeType || content.jquery)) {
                        // Content is a DOM node or a jQuery
                        if (html) {
                            if (!$$$1(content).parent().is($element)) {
                                $element.empty().append(content);
                            }
                        } else {
                            $element.text($$$1(content).text());
                        }
                    } else {
                        $element[html ? 'html' : 'text'](content);
                    }
                };

                _proto.getTitle = function getTitle() {
                    var title = this.element.getAttribute('data-original-title');

                    if (!title) {
                        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
                    }

                    return title;
                }; // Private


                _proto._getAttachment = function _getAttachment(placement) {
                    return AttachmentMap[placement.toUpperCase()];
                };

                _proto._setListeners = function _setListeners() {
                    var _this3 = this;

                    var triggers = this.config.trigger.split(' ');
                    triggers.forEach(function(trigger) {
                        if (trigger === 'click') {
                            $$$1(_this3.element).on(_this3.constructor.Event.CLICK, _this3.config.selector, function(event) {
                                return _this3.toggle(event);
                            });
                        } else if (trigger !== Trigger.MANUAL) {
                            var eventIn = trigger === Trigger.HOVER ? _this3.constructor.Event.MOUSEENTER : _this3.constructor.Event.FOCUSIN;
                            var eventOut = trigger === Trigger.HOVER ? _this3.constructor.Event.MOUSELEAVE : _this3.constructor.Event.FOCUSOUT;
                            $$$1(_this3.element).on(eventIn, _this3.config.selector, function(event) {
                                return _this3._enter(event);
                            }).on(eventOut, _this3.config.selector, function(event) {
                                return _this3._leave(event);
                            });
                        }

                        $$$1(_this3.element).closest('.modal').on('hide.bs.modal', function() {
                            return _this3.hide();
                        });
                    });

                    if (this.config.selector) {
                        this.config = _extends({}, this.config, {
                            trigger: 'manual',
                            selector: ''
                        });
                    } else {
                        this._fixTitle();
                    }
                };

                _proto._fixTitle = function _fixTitle() {
                    var titleType = typeof this.element.getAttribute('data-original-title');

                    if (this.element.getAttribute('title') || titleType !== 'string') {
                        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '');
                        this.element.setAttribute('title', '');
                    }
                };

                _proto._enter = function _enter(event, context) {
                    var dataKey = this.constructor.DATA_KEY;
                    context = context || $$$1(event.currentTarget).data(dataKey);

                    if (!context) {
                        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
                        $$$1(event.currentTarget).data(dataKey, context);
                    }

                    if (event) {
                        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
                    }

                    if ($$$1(context.getTipElement()).hasClass(ClassName.SHOW) || context._hoverState === HoverState.SHOW) {
                        context._hoverState = HoverState.SHOW;
                        return;
                    }

                    clearTimeout(context._timeout);
                    context._hoverState = HoverState.SHOW;

                    if (!context.config.delay || !context.config.delay.show) {
                        context.show();
                        return;
                    }

                    context._timeout = setTimeout(function() {
                        if (context._hoverState === HoverState.SHOW) {
                            context.show();
                        }
                    }, context.config.delay.show);
                };

                _proto._leave = function _leave(event, context) {
                    var dataKey = this.constructor.DATA_KEY;
                    context = context || $$$1(event.currentTarget).data(dataKey);

                    if (!context) {
                        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
                        $$$1(event.currentTarget).data(dataKey, context);
                    }

                    if (event) {
                        context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
                    }

                    if (context._isWithActiveTrigger()) {
                        return;
                    }

                    clearTimeout(context._timeout);
                    context._hoverState = HoverState.OUT;

                    if (!context.config.delay || !context.config.delay.hide) {
                        context.hide();
                        return;
                    }

                    context._timeout = setTimeout(function() {
                        if (context._hoverState === HoverState.OUT) {
                            context.hide();
                        }
                    }, context.config.delay.hide);
                };

                _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
                    for (var trigger in this._activeTrigger) {
                        if (this._activeTrigger[trigger]) {
                            return true;
                        }
                    }

                    return false;
                };

                _proto._getConfig = function _getConfig(config) {
                    config = _extends({}, this.constructor.Default, $$$1(this.element).data(), config);

                    if (typeof config.delay === 'number') {
                        config.delay = {
                            show: config.delay,
                            hide: config.delay
                        };
                    }

                    if (typeof config.title === 'number') {
                        config.title = config.title.toString();
                    }

                    if (typeof config.content === 'number') {
                        config.content = config.content.toString();
                    }

                    Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);
                    return config;
                };

                _proto._getDelegateConfig = function _getDelegateConfig() {
                    var config = {};

                    if (this.config) {
                        for (var key in this.config) {
                            if (this.constructor.Default[key] !== this.config[key]) {
                                config[key] = this.config[key];
                            }
                        }
                    }

                    return config;
                };

                _proto._cleanTipClass = function _cleanTipClass() {
                    var $tip = $$$1(this.getTipElement());
                    var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);

                    if (tabClass !== null && tabClass.length > 0) {
                        $tip.removeClass(tabClass.join(''));
                    }
                };

                _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(data) {
                    this._cleanTipClass();

                    this.addAttachmentClass(this._getAttachment(data.placement));
                };

                _proto._fixTransition = function _fixTransition() {
                    var tip = this.getTipElement();
                    var initConfigAnimation = this.config.animation;

                    if (tip.getAttribute('x-placement') !== null) {
                        return;
                    }

                    $$$1(tip).removeClass(ClassName.FADE);
                    this.config.animation = false;
                    this.hide();
                    this.show();
                    this.config.animation = initConfigAnimation;
                }; // Static


                Tooltip._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = typeof config === 'object' && config;

                        if (!data && /dispose|hide/.test(config)) {
                            return;
                        }

                        if (!data) {
                            data = new Tooltip(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                _createClass(Tooltip, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }, {
                    key: "NAME",
                    get: function get() {
                        return NAME;
                    }
                }, {
                    key: "DATA_KEY",
                    get: function get() {
                        return DATA_KEY;
                    }
                }, {
                    key: "Event",
                    get: function get() {
                        return Event;
                    }
                }, {
                    key: "EVENT_KEY",
                    get: function get() {
                        return EVENT_KEY;
                    }
                }, {
                    key: "DefaultType",
                    get: function get() {
                        return DefaultType;
                    }
                }]);

                return Tooltip;
            }();
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[NAME] = Tooltip._jQueryInterface;
        $$$1.fn[NAME].Constructor = Tooltip;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Tooltip._jQueryInterface;
        };

        return Tooltip;
    }($, Popper$1);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): popover.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Popover = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'popover';
        var VERSION = '4.0.0';
        var DATA_KEY = 'bs.popover';
        var EVENT_KEY = "." + DATA_KEY;
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var CLASS_PREFIX = 'bs-popover';
        var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');

        var Default = _extends({}, Tooltip.Default, {
            placement: 'right',
            trigger: 'click',
            content: '',
            template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
        });

        var DefaultType = _extends({}, Tooltip.DefaultType, {
            content: '(string|element|function)'
        });

        var ClassName = {
            FADE: 'fade',
            SHOW: 'show'
        };
        var Selector = {
            TITLE: '.popover-header',
            CONTENT: '.popover-body'
        };
        var Event = {
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            INSERTED: "inserted" + EVENT_KEY,
            CLICK: "click" + EVENT_KEY,
            FOCUSIN: "focusin" + EVENT_KEY,
            FOCUSOUT: "focusout" + EVENT_KEY,
            MOUSEENTER: "mouseenter" + EVENT_KEY,
            MOUSELEAVE: "mouseleave" + EVENT_KEY
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Popover =
            /*#__PURE__*/
            function(_Tooltip) {
                _inheritsLoose(Popover, _Tooltip);

                function Popover() {
                    return _Tooltip.apply(this, arguments) || this;
                }

                var _proto = Popover.prototype;

                // Overrides
                _proto.isWithContent = function isWithContent() {
                    return this.getTitle() || this._getContent();
                };

                _proto.addAttachmentClass = function addAttachmentClass(attachment) {
                    $$$1(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
                };

                _proto.getTipElement = function getTipElement() {
                    this.tip = this.tip || $$$1(this.config.template)[0];
                    return this.tip;
                };

                _proto.setContent = function setContent() {
                    var $tip = $$$1(this.getTipElement()); // We use append for html objects to maintain js events

                    this.setElementContent($tip.find(Selector.TITLE), this.getTitle());

                    var content = this._getContent();

                    if (typeof content === 'function') {
                        content = content.call(this.element);
                    }

                    this.setElementContent($tip.find(Selector.CONTENT), content);
                    $tip.removeClass(ClassName.FADE + " " + ClassName.SHOW);
                }; // Private


                _proto._getContent = function _getContent() {
                    return this.element.getAttribute('data-content') || this.config.content;
                };

                _proto._cleanTipClass = function _cleanTipClass() {
                    var $tip = $$$1(this.getTipElement());
                    var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);

                    if (tabClass !== null && tabClass.length > 0) {
                        $tip.removeClass(tabClass.join(''));
                    }
                }; // Static


                Popover._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = typeof config === 'object' ? config : null;

                        if (!data && /destroy|hide/.test(config)) {
                            return;
                        }

                        if (!data) {
                            data = new Popover(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                _createClass(Popover, null, [{
                    key: "VERSION",
                    // Getters
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }, {
                    key: "NAME",
                    get: function get() {
                        return NAME;
                    }
                }, {
                    key: "DATA_KEY",
                    get: function get() {
                        return DATA_KEY;
                    }
                }, {
                    key: "Event",
                    get: function get() {
                        return Event;
                    }
                }, {
                    key: "EVENT_KEY",
                    get: function get() {
                        return EVENT_KEY;
                    }
                }, {
                    key: "DefaultType",
                    get: function get() {
                        return DefaultType;
                    }
                }]);

                return Popover;
            }(Tooltip);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[NAME] = Popover._jQueryInterface;
        $$$1.fn[NAME].Constructor = Popover;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Popover._jQueryInterface;
        };

        return Popover;
    }($);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): scrollspy.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var ScrollSpy = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'scrollspy';
        var VERSION = '4.0.0';
        var DATA_KEY = 'bs.scrollspy';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var Default = {
            offset: 10,
            method: 'auto',
            target: ''
        };
        var DefaultType = {
            offset: 'number',
            method: 'string',
            target: '(string|element)'
        };
        var Event = {
            ACTIVATE: "activate" + EVENT_KEY,
            SCROLL: "scroll" + EVENT_KEY,
            LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            DROPDOWN_ITEM: 'dropdown-item',
            DROPDOWN_MENU: 'dropdown-menu',
            ACTIVE: 'active'
        };
        var Selector = {
            DATA_SPY: '[data-spy="scroll"]',
            ACTIVE: '.active',
            NAV_LIST_GROUP: '.nav, .list-group',
            NAV_LINKS: '.nav-link',
            NAV_ITEMS: '.nav-item',
            LIST_ITEMS: '.list-group-item',
            DROPDOWN: '.dropdown',
            DROPDOWN_ITEMS: '.dropdown-item',
            DROPDOWN_TOGGLE: '.dropdown-toggle'
        };
        var OffsetMethod = {
            OFFSET: 'offset',
            POSITION: 'position'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var ScrollSpy =
            /*#__PURE__*/
            function() {
                function ScrollSpy(element, config) {
                    var _this = this;

                    this._element = element;
                    this._scrollElement = element.tagName === 'BODY' ? window : element;
                    this._config = this._getConfig(config);
                    this._selector = this._config.target + " " + Selector.NAV_LINKS + "," + (this._config.target + " " + Selector.LIST_ITEMS + ",") + (this._config.target + " " + Selector.DROPDOWN_ITEMS);
                    this._offsets = [];
                    this._targets = [];
                    this._activeTarget = null;
                    this._scrollHeight = 0;
                    $$$1(this._scrollElement).on(Event.SCROLL, function(event) {
                        return _this._process(event);
                    });
                    this.refresh();

                    this._process();
                } // Getters


                var _proto = ScrollSpy.prototype;

                // Public
                _proto.refresh = function refresh() {
                    var _this2 = this;

                    var autoMethod = this._scrollElement === this._scrollElement.window ? OffsetMethod.OFFSET : OffsetMethod.POSITION;
                    var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;
                    var offsetBase = offsetMethod === OffsetMethod.POSITION ? this._getScrollTop() : 0;
                    this._offsets = [];
                    this._targets = [];
                    this._scrollHeight = this._getScrollHeight();
                    var targets = $$$1.makeArray($$$1(this._selector));
                    targets.map(function(element) {
                        var target;
                        var targetSelector = Util.getSelectorFromElement(element);

                        if (targetSelector) {
                            target = $$$1(targetSelector)[0];
                        }

                        if (target) {
                            var targetBCR = target.getBoundingClientRect();

                            if (targetBCR.width || targetBCR.height) {
                                // TODO (fat): remove sketch reliance on jQuery position/offset
                                return [$$$1(target)[offsetMethod]().top + offsetBase, targetSelector];
                            }
                        }

                        return null;
                    }).filter(function(item) {
                        return item;
                    }).sort(function(a, b) {
                        return a[0] - b[0];
                    }).forEach(function(item) {
                        _this2._offsets.push(item[0]);

                        _this2._targets.push(item[1]);
                    });
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    $$$1(this._scrollElement).off(EVENT_KEY);
                    this._element = null;
                    this._scrollElement = null;
                    this._config = null;
                    this._selector = null;
                    this._offsets = null;
                    this._targets = null;
                    this._activeTarget = null;
                    this._scrollHeight = null;
                }; // Private


                _proto._getConfig = function _getConfig(config) {
                    config = _extends({}, Default, config);

                    if (typeof config.target !== 'string') {
                        var id = $$$1(config.target).attr('id');

                        if (!id) {
                            id = Util.getUID(NAME);
                            $$$1(config.target).attr('id', id);
                        }

                        config.target = "#" + id;
                    }

                    Util.typeCheckConfig(NAME, config, DefaultType);
                    return config;
                };

                _proto._getScrollTop = function _getScrollTop() {
                    return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
                };

                _proto._getScrollHeight = function _getScrollHeight() {
                    return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                };

                _proto._getOffsetHeight = function _getOffsetHeight() {
                    return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
                };

                _proto._process = function _process() {
                    var scrollTop = this._getScrollTop() + this._config.offset;

                    var scrollHeight = this._getScrollHeight();

                    var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

                    if (this._scrollHeight !== scrollHeight) {
                        this.refresh();
                    }

                    if (scrollTop >= maxScroll) {
                        var target = this._targets[this._targets.length - 1];

                        if (this._activeTarget !== target) {
                            this._activate(target);
                        }

                        return;
                    }

                    if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
                        this._activeTarget = null;

                        this._clear();

                        return;
                    }

                    for (var i = this._offsets.length; i--;) {
                        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]);

                        if (isActiveTarget) {
                            this._activate(this._targets[i]);
                        }
                    }
                };

                _proto._activate = function _activate(target) {
                    this._activeTarget = target;

                    this._clear();

                    var queries = this._selector.split(','); // eslint-disable-next-line arrow-body-style


                    queries = queries.map(function(selector) {
                        return selector + "[data-target=\"" + target + "\"]," + (selector + "[href=\"" + target + "\"]");
                    });
                    var $link = $$$1(queries.join(','));

                    if ($link.hasClass(ClassName.DROPDOWN_ITEM)) {
                        $link.closest(Selector.DROPDOWN).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
                        $link.addClass(ClassName.ACTIVE);
                    } else {
                        // Set triggered link as active
                        $link.addClass(ClassName.ACTIVE); // Set triggered links parents as active
                        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor

                        $link.parents(Selector.NAV_LIST_GROUP).prev(Selector.NAV_LINKS + ", " + Selector.LIST_ITEMS).addClass(ClassName.ACTIVE); // Handle special case when .nav-link is inside .nav-item

                        $link.parents(Selector.NAV_LIST_GROUP).prev(Selector.NAV_ITEMS).children(Selector.NAV_LINKS).addClass(ClassName.ACTIVE);
                    }

                    $$$1(this._scrollElement).trigger(Event.ACTIVATE, {
                        relatedTarget: target
                    });
                };

                _proto._clear = function _clear() {
                    $$$1(this._selector).filter(Selector.ACTIVE).removeClass(ClassName.ACTIVE);
                }; // Static


                ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = typeof config === 'object' && config;

                        if (!data) {
                            data = new ScrollSpy(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                _createClass(ScrollSpy, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }]);

                return ScrollSpy;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(window).on(Event.LOAD_DATA_API, function() {
            var scrollSpys = $$$1.makeArray($$$1(Selector.DATA_SPY));

            for (var i = scrollSpys.length; i--;) {
                var $spy = $$$1(scrollSpys[i]);

                ScrollSpy._jQueryInterface.call($spy, $spy.data());
            }
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = ScrollSpy._jQueryInterface;
        $$$1.fn[NAME].Constructor = ScrollSpy;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return ScrollSpy._jQueryInterface;
        };

        return ScrollSpy;
    }($);

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0): tab.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Tab = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'tab';
        var VERSION = '4.0.0';
        var DATA_KEY = 'bs.tab';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var TRANSITION_DURATION = 150;
        var Event = {
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            DROPDOWN_MENU: 'dropdown-menu',
            ACTIVE: 'active',
            DISABLED: 'disabled',
            FADE: 'fade',
            SHOW: 'show'
        };
        var Selector = {
            DROPDOWN: '.dropdown',
            NAV_LIST_GROUP: '.nav, .list-group',
            ACTIVE: '.active',
            ACTIVE_UL: '> li > .active',
            DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
            DROPDOWN_TOGGLE: '.dropdown-toggle',
            DROPDOWN_ACTIVE_CHILD: '> .dropdown-menu .active'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Tab =
            /*#__PURE__*/
            function() {
                function Tab(element) {
                    this._element = element;
                } // Getters


                var _proto = Tab.prototype;

                // Public
                _proto.show = function show() {
                    var _this = this;

                    if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $$$1(this._element).hasClass(ClassName.ACTIVE) || $$$1(this._element).hasClass(ClassName.DISABLED)) {
                        return;
                    }

                    var target;
                    var previous;
                    var listElement = $$$1(this._element).closest(Selector.NAV_LIST_GROUP)[0];
                    var selector = Util.getSelectorFromElement(this._element);

                    if (listElement) {
                        var itemSelector = listElement.nodeName === 'UL' ? Selector.ACTIVE_UL : Selector.ACTIVE;
                        previous = $$$1.makeArray($$$1(listElement).find(itemSelector));
                        previous = previous[previous.length - 1];
                    }

                    var hideEvent = $$$1.Event(Event.HIDE, {
                        relatedTarget: this._element
                    });
                    var showEvent = $$$1.Event(Event.SHOW, {
                        relatedTarget: previous
                    });

                    if (previous) {
                        $$$1(previous).trigger(hideEvent);
                    }

                    $$$1(this._element).trigger(showEvent);

                    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
                        return;
                    }

                    if (selector) {
                        target = $$$1(selector)[0];
                    }

                    this._activate(this._element, listElement);

                    var complete = function complete() {
                        var hiddenEvent = $$$1.Event(Event.HIDDEN, {
                            relatedTarget: _this._element
                        });
                        var shownEvent = $$$1.Event(Event.SHOWN, {
                            relatedTarget: previous
                        });
                        $$$1(previous).trigger(hiddenEvent);
                        $$$1(_this._element).trigger(shownEvent);
                    };

                    if (target) {
                        this._activate(target, target.parentNode, complete);
                    } else {
                        complete();
                    }
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    this._element = null;
                }; // Private


                _proto._activate = function _activate(element, container, callback) {
                    var _this2 = this;

                    var activeElements;

                    if (container.nodeName === 'UL') {
                        activeElements = $$$1(container).find(Selector.ACTIVE_UL);
                    } else {
                        activeElements = $$$1(container).children(Selector.ACTIVE);
                    }

                    var active = activeElements[0];
                    var isTransitioning = callback && Util.supportsTransitionEnd() && active && $$$1(active).hasClass(ClassName.FADE);

                    var complete = function complete() {
                        return _this2._transitionComplete(element, active, callback);
                    };

                    if (active && isTransitioning) {
                        $$$1(active).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
                    } else {
                        complete();
                    }
                };

                _proto._transitionComplete = function _transitionComplete(element, active, callback) {
                    if (active) {
                        $$$1(active).removeClass(ClassName.SHOW + " " + ClassName.ACTIVE);
                        var dropdownChild = $$$1(active.parentNode).find(Selector.DROPDOWN_ACTIVE_CHILD)[0];

                        if (dropdownChild) {
                            $$$1(dropdownChild).removeClass(ClassName.ACTIVE);
                        }

                        if (active.getAttribute('role') === 'tab') {
                            active.setAttribute('aria-selected', false);
                        }
                    }

                    $$$1(element).addClass(ClassName.ACTIVE);

                    if (element.getAttribute('role') === 'tab') {
                        element.setAttribute('aria-selected', true);
                    }

                    Util.reflow(element);
                    $$$1(element).addClass(ClassName.SHOW);

                    if (element.parentNode && $$$1(element.parentNode).hasClass(ClassName.DROPDOWN_MENU)) {
                        var dropdownElement = $$$1(element).closest(Selector.DROPDOWN)[0];

                        if (dropdownElement) {
                            $$$1(dropdownElement).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
                        }

                        element.setAttribute('aria-expanded', true);
                    }

                    if (callback) {
                        callback();
                    }
                }; // Static


                Tab._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $this = $$$1(this);
                        var data = $this.data(DATA_KEY);

                        if (!data) {
                            data = new Tab(this);
                            $this.data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                _createClass(Tab, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }]);

                return Tab;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function(event) {
            event.preventDefault();

            Tab._jQueryInterface.call($$$1(this), 'show');
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Tab._jQueryInterface;
        $$$1.fn[NAME].Constructor = Tab;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Tab._jQueryInterface;
        };

        return Tab;
    }($);

    var Util$2 = function() {
        /**
         * ------------------------------------------------------------------------
         * Private TransitionEnd Helpers
         * ------------------------------------------------------------------------
         */
        var transitionEnd = false;
        var _transitionEndSelector = "";
        var TransitionEndEvent = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "oTransitionEnd otransitionend",
            transition: "transitionend"
        };

        function transitionEndTest() {
            if (window.QUnit) {
                return false;
            }

            var el = document.createElement("bmd");

            for (var name in TransitionEndEvent) {
                if (el.style[name] !== undefined) {
                    return TransitionEndEvent[name]; // { end: TransitionEndEvent[name] }
                }
            }

            return false;
        }

        function setTransitionEndSupport() {
            transitionEnd = transitionEndTest(); // generate a concatenated transition end event selector

            for (var name in TransitionEndEvent) {
                _transitionEndSelector += " " + TransitionEndEvent[name];
            }
        }
        /**
         * --------------------------------------------------------------------------
         * Public Util Api
         * --------------------------------------------------------------------------
         */


        var Util = {
            transitionEndSupported: function transitionEndSupported() {
                return transitionEnd;
            },
            transitionEndSelector: function transitionEndSelector() {
                return _transitionEndSelector;
            },
            isChar: function isChar(event) {
                if (typeof event.which === "undefined") {
                    return true;
                } else if (typeof event.which === "number" && event.which > 0) {
                    return !event.ctrlKey && !event.metaKey && !event.altKey && event.which !== 8 && // backspace
                        event.which !== 9 && // tab
                        event.which !== 13 && // enter
                        event.which !== 16 && // shift
                        event.which !== 17 && // ctrl
                        event.which !== 20 && // caps lock
                        event.which !== 27 // escape
                    ;
                }

                return false;
            },
            assert: function assert($element, invalidTest, message) {
                if (invalidTest) {
                    if (!$element === undefined) {
                        $element.css("border", "1px solid red");
                    }

                    console.error(message, $element); // eslint-disable-line no-console

                    throw message;
                }
            },
            describe: function describe($element) {
                if ($element === undefined) {
                    return "undefined";
                } else if ($element.length === 0) {
                    return "(no matching elements)";
                }

                return $element[0].outerHTML.split(">")[0] + ">";
            }
        };
        setTransitionEndSupport();
        return Util;
    }(jQuery);

    var Base = function($$$1) {
        var ClassName = {
            BMD_FORM_GROUP: "bmd-form-group",
            IS_FILLED: "is-filled",
            IS_FOCUSED: "is-focused"
        };
        var Selector = {
            BMD_FORM_GROUP: "." + ClassName.BMD_FORM_GROUP
        };
        var Default = {};
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Base =
            /*#__PURE__*/
            function() {
                /**
                 *
                 * @param element
                 * @param config
                 * @param properties - anything that needs to be set as this[key] = value.  Works around the need to call `super` before using `this`
                 */
                function Base($element, config, properties) {
                    if (properties === void 0) {
                        properties = {};
                    }

                    this.$element = $element;
                    this.config = $$$1.extend(true, {}, Default, config); // set properties for use in the constructor initialization

                    for (var key in properties) {
                        this[key] = properties[key];
                    }
                }

                var _proto = Base.prototype;

                _proto.dispose = function dispose(dataKey) {
                    this.$element.data(dataKey, null);
                    this.$element = null;
                    this.config = null;
                }; // ------------------------------------------------------------------------
                // protected


                _proto.addFormGroupFocus = function addFormGroupFocus() {
                    if (!this.$element.prop("disabled")) {
                        this.$bmdFormGroup.addClass(ClassName.IS_FOCUSED);
                    }
                };

                _proto.removeFormGroupFocus = function removeFormGroupFocus() {
                    this.$bmdFormGroup.removeClass(ClassName.IS_FOCUSED);
                };

                _proto.removeIsFilled = function removeIsFilled() {
                    this.$bmdFormGroup.removeClass(ClassName.IS_FILLED);
                };

                _proto.addIsFilled = function addIsFilled() {
                    this.$bmdFormGroup.addClass(ClassName.IS_FILLED);
                }; // Find bmd-form-group


                _proto.findMdbFormGroup = function findMdbFormGroup(raiseError) {
                    if (raiseError === void 0) {
                        raiseError = true;
                    }

                    var mfg = this.$element.closest(Selector.BMD_FORM_GROUP);

                    if (mfg.length === 0 && raiseError) {
                        $$$1.error("Failed to find " + Selector.BMD_FORM_GROUP + " for " + Util$2.describe(this.$element));
                    }

                    return mfg;
                }; // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                return Base;
            }();

        return Base;
    }(jQuery);

    var BaseInput = function($$$1) {
        var ClassName = {
            FORM_GROUP: "form-group",
            BMD_FORM_GROUP: "bmd-form-group",
            BMD_LABEL: "bmd-label",
            BMD_LABEL_STATIC: "bmd-label-static",
            BMD_LABEL_PLACEHOLDER: "bmd-label-placeholder",
            BMD_LABEL_FLOATING: "bmd-label-floating",
            HAS_DANGER: "has-danger",
            IS_FILLED: "is-filled",
            IS_FOCUSED: "is-focused",
            INPUT_GROUP: "input-group"
        };
        var Selector = {
            FORM_GROUP: "." + ClassName.FORM_GROUP,
            BMD_FORM_GROUP: "." + ClassName.BMD_FORM_GROUP,
            BMD_LABEL_WILDCARD: "label[class^='" + ClassName.BMD_LABEL + "'], label[class*=' " + ClassName.BMD_LABEL + "']" // match any label variant if specified

        };
        var Default = {
            validate: false,
            formGroup: {
                required: false
            },
            bmdFormGroup: {
                template: "<span class='" + ClassName.BMD_FORM_GROUP + "'></span>",
                create: true,
                // create a wrapper if form-group not found
                required: true // not recommended to turn this off, only used for inline components

            },
            label: {
                required: false,
                // Prioritized find order for resolving the label to be used as an bmd-label if not specified in the markup
                //  - a function(thisComponent); or
                //  - a string selector used like $bmdFormGroup.find(selector)
                //
                // Note this only runs if $bmdFormGroup.find(Selector.BMD_LABEL_WILDCARD) fails to find a label (as authored in the markup)
                //
                selectors: [".form-control-label", // in the case of horizontal or inline forms, this will be marked
                    "> label" // usual case for text inputs, first child.  Deeper would find toggle labels so don't do that.
                ],
                className: ClassName.BMD_LABEL_STATIC
            },
            requiredClasses: [],
            invalidComponentMatches: [],
            convertInputSizeVariations: true
        };
        var FormControlSizeMarkers = {
            "form-control-lg": "bmd-form-group-lg",
            "form-control-sm": "bmd-form-group-sm"
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var BaseInput =
            /*#__PURE__*/
            function(_Base) {
                _inheritsLoose(BaseInput, _Base);

                /**
                 *
                 * @param element
                 * @param config
                 * @param properties - anything that needs to be set as this[key] = value.  Works around the need to call `super` before using `this`
                 */
                function BaseInput($element, config, properties) {
                    var _this;

                    if (properties === void 0) {
                        properties = {};
                    }

                    _this = _Base.call(this, $element, $$$1.extend(true, {}, Default, config), properties) || this; // Enforce no overlap between components to prevent side effects

                    _this._rejectInvalidComponentMatches(); // Enforce expected structure (if any)


                    _this.rejectWithoutRequiredStructure(); // Enforce required classes for a consistent rendering


                    _this._rejectWithoutRequiredClasses(); // Resolve the form-group first, it will be used for bmd-form-group if possible
                    //   note: different components have different rules


                    _this.$formGroup = _this.findFormGroup(_this.config.formGroup.required); // Will add bmd-form-group to form-group or create an bmd-form-group
                    //  Performance Note: for those forms that are really performance driven, create the markup with the .bmd-form-group to avoid
                    //    rendering changes once added.

                    _this.$bmdFormGroup = _this.resolveMdbFormGroup(); // Resolve and mark the bmdLabel if necessary as defined by the config

                    _this.$bmdLabel = _this.resolveMdbLabel(); // Signal to the bmd-form-group that a form-control-* variation is being used

                    _this.resolveMdbFormGroupSizing();

                    _this.addFocusListener();

                    _this.addChangeListener();

                    if (_this.$element.val() != "") {
                        _this.addIsFilled();
                    }

                    return _this;
                }

                var _proto = BaseInput.prototype;

                _proto.dispose = function dispose(dataKey) {
                    _Base.prototype.dispose.call(this, dataKey);

                    this.$bmdFormGroup = null;
                    this.$formGroup = null;
                }; // ------------------------------------------------------------------------
                // protected


                _proto.rejectWithoutRequiredStructure = function rejectWithoutRequiredStructure() { // implement
                };

                _proto.addFocusListener = function addFocusListener() {
                    var _this2 = this;

                    this.$element.on("focus", function() {
                        _this2.addFormGroupFocus();
                    }).on("blur", function() {
                        _this2.removeFormGroupFocus();
                    });
                };

                _proto.addChangeListener = function addChangeListener() {
                    var _this3 = this;

                    this.$element.on("keydown paste", function(event) {
                        if (Util$2.isChar(event)) {
                            _this3.addIsFilled();
                        }
                    }).on("keyup change", function() {
                        // make sure empty is added back when there is a programmatic value change.
                        //  NOTE: programmatic changing of value using $.val() must trigger the change event i.e. $.val('x').trigger('change')
                        if (_this3.isEmpty()) {
                            _this3.removeIsFilled();
                        } else {
                            _this3.addIsFilled();
                        }

                        if (_this3.config.validate) {
                            // Validation events do not bubble, so they must be attached directly to the text: http://jsfiddle.net/PEpRM/1/
                            //  Further, even the bind method is being caught, but since we are already calling #checkValidity here, just alter
                            //  the form-group on change.
                            //
                            // NOTE: I'm not sure we should be intervening regarding validation, this seems better as a README and snippet of code.
                            //        BUT, I've left it here for backwards compatibility.
                            var isValid = typeof _this3.$element[0].checkValidity === "undefined" || _this3.$element[0].checkValidity();

                            if (isValid) {
                                _this3.removeHasDanger();
                            } else {
                                _this3.addHasDanger();
                            }
                        }
                    });
                };

                _proto.addHasDanger = function addHasDanger() {
                    this.$bmdFormGroup.addClass(ClassName.HAS_DANGER);
                };

                _proto.removeHasDanger = function removeHasDanger() {
                    this.$bmdFormGroup.removeClass(ClassName.HAS_DANGER);
                };

                _proto.isEmpty = function isEmpty() {
                    return this.$element.val() === null || this.$element.val() === undefined || this.$element.val() === "";
                }; // Will add bmd-form-group to form-group or create a bmd-form-group if necessary


                _proto.resolveMdbFormGroup = function resolveMdbFormGroup() {
                    var mfg = this.findMdbFormGroup(false);

                    if (mfg === undefined || mfg.length === 0) {
                        if (this.config.bmdFormGroup.create && (this.$formGroup === undefined || this.$formGroup.length === 0)) {
                            // If a form-group doesn't exist (not recommended), take a guess and wrap the element (assuming no label).
                            //  note: it's possible to make this smarter, but I need to see valid cases before adding any complexity.
                            // this may be an input-group, wrap that instead
                            if (this.outerElement().parent().hasClass(ClassName.INPUT_GROUP)) {
                                this.outerElement().parent().wrap(this.config.bmdFormGroup.template);
                            } else {
                                this.outerElement().wrap(this.config.bmdFormGroup.template);
                            }
                        } else {
                            // a form-group does exist, add our marker class to it
                            this.$formGroup.addClass(ClassName.BMD_FORM_GROUP); // OLD: may want to implement this after all, see how the styling turns out, but using an existing form-group is less manipulation of the dom and therefore preferable
                            // A form-group does exist, so add an bmd-form-group wrapping it's internal contents
                            //fg.wrapInner(this.config.bmdFormGroup.template)
                        }

                        mfg = this.findMdbFormGroup(this.config.bmdFormGroup.required);
                    }

                    return mfg;
                }; // Demarcation element (e.g. first child of a form-group)
                //  Subclasses such as file inputs may have different structures


                _proto.outerElement = function outerElement() {
                    return this.$element;
                }; // Will add bmd-label to bmd-form-group if not already specified


                _proto.resolveMdbLabel = function resolveMdbLabel() {
                    var label = this.$bmdFormGroup.find(Selector.BMD_LABEL_WILDCARD);

                    if (label === undefined || label.length === 0) {
                        // we need to find it based on the configured selectors
                        label = this.findMdbLabel(this.config.label.required);

                        if (label === undefined || label.length === 0) { // no label found, and finder did not require one
                        } else {
                            // a candidate label was found, add the configured default class name
                            label.addClass(this.config.label.className);
                        }
                    }

                    return label;
                }; // Find bmd-label variant based on the config selectors


                _proto.findMdbLabel = function findMdbLabel(raiseError) {
                    if (raiseError === void 0) {
                        raiseError = true;
                    }

                    var label = null; // use the specified selector order

                    for (var _iterator = this.config.label.selectors, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                        var _ref;

                        if (_isArray) {
                            if (_i >= _iterator.length) break;
                            _ref = _iterator[_i++];
                        } else {
                            _i = _iterator.next();
                            if (_i.done) break;
                            _ref = _i.value;
                        }

                        var _selector = _ref;

                        if ($$$1.isFunction(_selector)) {
                            label = _selector(this);
                        } else {
                            label = this.$bmdFormGroup.find(_selector);
                        }

                        if (label !== undefined && label.length > 0) {
                            break;
                        }
                    }

                    if (label.length === 0 && raiseError) {
                        $$$1.error("Failed to find " + Selector.BMD_LABEL_WILDCARD + " within form-group for " + Util$2.describe(this.$element));
                    }

                    return label;
                }; // Find bmd-form-group


                _proto.findFormGroup = function findFormGroup(raiseError) {
                    if (raiseError === void 0) {
                        raiseError = true;
                    }

                    var fg = this.$element.closest(Selector.FORM_GROUP);

                    if (fg.length === 0 && raiseError) {
                        $$$1.error("Failed to find " + Selector.FORM_GROUP + " for " + Util$2.describe(this.$element));
                    }

                    return fg;
                }; // Due to the interconnected nature of labels/inputs/help-blocks, signal the bmd-form-group-* size variation based on
                //  a found form-control-* size


                _proto.resolveMdbFormGroupSizing = function resolveMdbFormGroupSizing() {
                    if (!this.config.convertInputSizeVariations) {
                        return;
                    } // Modification - Change text-sm/lg to form-group-sm/lg instead (preferred standard and simpler css/less variants)


                    for (var inputSize in FormControlSizeMarkers) {
                        if (this.$element.hasClass(inputSize)) {
                            //this.$element.removeClass(inputSize)
                            this.$bmdFormGroup.addClass(FormControlSizeMarkers[inputSize]);
                        }
                    }
                }; // ------------------------------------------------------------------------
                // private


                _proto._rejectInvalidComponentMatches = function _rejectInvalidComponentMatches() {
                    for (var _iterator2 = this.config.invalidComponentMatches, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                        var _ref2;

                        if (_isArray2) {
                            if (_i2 >= _iterator2.length) break;
                            _ref2 = _iterator2[_i2++];
                        } else {
                            _i2 = _iterator2.next();
                            if (_i2.done) break;
                            _ref2 = _i2.value;
                        }

                        var _otherComponent = _ref2;

                        _otherComponent.rejectMatch(this.constructor.name, this.$element);
                    }
                };

                _proto._rejectWithoutRequiredClasses = function _rejectWithoutRequiredClasses() {
                    for (var _iterator3 = this.config.requiredClasses, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
                        var _ref3;

                        if (_isArray3) {
                            if (_i3 >= _iterator3.length) break;
                            _ref3 = _iterator3[_i3++];
                        } else {
                            _i3 = _iterator3.next();
                            if (_i3.done) break;
                            _ref3 = _i3.value;
                        }

                        var _requiredClass = _ref3;
                        var found = false; // allow one of several classes to be passed in x||y

                        if (_requiredClass.indexOf("||") !== -1) {
                            var oneOf = _requiredClass.split("||");

                            for (var _iterator4 = oneOf, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
                                var _ref4;

                                if (_isArray4) {
                                    if (_i4 >= _iterator4.length) break;
                                    _ref4 = _iterator4[_i4++];
                                } else {
                                    _i4 = _iterator4.next();
                                    if (_i4.done) break;
                                    _ref4 = _i4.value;
                                }

                                var _requiredClass3 = _ref4;

                                if (this.$element.hasClass(_requiredClass3)) {
                                    found = true;
                                    break;
                                }
                            }
                        } else if (this.$element.hasClass(_requiredClass)) {
                            found = true;
                        } // error if not found


                        if (!found) {
                            $$$1.error(this.constructor.name + " element: " + Util$2.describe(this.$element) + " requires class: " + _requiredClass);
                        }
                    }
                }; // ------------------------------------------------------------------------
                // static


                return BaseInput;
            }(Base);

        return BaseInput;
    }(jQuery);

    var BaseSelection = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var Default = {
            label: {
                required: false // Prioritized find order for resolving the label to be used as an bmd-label if not specified in the markup
                //  - a function(thisComponent); or
                //  - a string selector used like $bmdFormGroup.find(selector)
                //
                // Note this only runs if $bmdFormGroup.find(Selector.BMD_LABEL_WILDCARD) fails to find a label (as authored in the markup)
                //
                //selectors: [
                //  `.form-control-label`, // in the case of horizontal or inline forms, this will be marked
                //  `> label` // usual case for text inputs
                //]

            }
        };
        var Selector = {
            LABEL: "label"
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var BaseSelection =
            /*#__PURE__*/
            function(_BaseInput) {
                _inheritsLoose(BaseSelection, _BaseInput);

                function BaseSelection($element, config, properties) {
                    var _this;

                    // properties = {inputType: checkbox, outerClass: checkbox-inline}
                    // '.checkbox|switch|radio > label > input[type=checkbox|radio]'
                    // '.${this.outerClass} > label > input[type=${this.inputType}]'
                    _this = _BaseInput.call(this, $element, $$$1.extend(true, {}, Default, config), properties) || this;

                    _this.decorateMarkup();

                    return _this;
                } // ------------------------------------------------------------------------
                // protected


                var _proto = BaseSelection.prototype;

                _proto.decorateMarkup = function decorateMarkup() {
                    var $decorator = $$$1(this.config.template);
                    this.$element.after($decorator); // initialize ripples after decorator has been inserted into DOM

                    if (this.config.ripples !== false) {
                        $decorator.bmdRipples();
                    }
                }; // Demarcation element (e.g. first child of a form-group)


                _proto.outerElement = function outerElement() {
                    // .checkbox|switch|radio > label > input[type=checkbox|radio]
                    // label.checkbox-inline > input[type=checkbox|radio]
                    // .${this.outerClass} > label > input[type=${this.inputType}]
                    return this.$element.parent().closest("." + this.outerClass);
                };

                _proto.rejectWithoutRequiredStructure = function rejectWithoutRequiredStructure() {
                    // '.checkbox|switch|radio > label > input[type=checkbox|radio]'
                    // '.${this.outerClass} > label > input[type=${this.inputType}]'
                    Util$2.assert(this.$element, !this.$element.parent().prop("tagName") === "label", this.constructor.name + "'s " + Util$2.describe(this.$element) + " parent element should be <label>.");
                    Util$2.assert(this.$element, !this.outerElement().hasClass(this.outerClass), this.constructor.name + "'s " + Util$2.describe(this.$element) + " outer element should have class " + this.outerClass + ".");
                };

                _proto.addFocusListener = function addFocusListener() {
                    var _this2 = this;

                    // checkboxes didn't appear to bubble to the document, so we'll bind these directly
                    this.$element.closest(Selector.LABEL).hover(function() {
                        _this2.addFormGroupFocus();
                    }, function() {
                        _this2.removeFormGroupFocus();
                    });
                };

                _proto.addChangeListener = function addChangeListener() {
                    var _this3 = this;

                    this.$element.change(function() {
                        _this3.$element.blur();
                    });
                }; // ------------------------------------------------------------------------
                // private


                return BaseSelection;
            }(BaseInput);

        return BaseSelection;
    }(jQuery);

    //import File from './file'
    //import Radio from './radio'
    //import Textarea from './textarea'
    //import Select from './select'

    var Checkbox = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "checkbox";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {
            template: "<span class='checkbox-decorator'><span class='check'></span></span>"
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Checkbox =
            /*#__PURE__*/
            function(_BaseSelection) {
                _inheritsLoose(Checkbox, _BaseSelection);

                function Checkbox($element, config, properties) {
                    if (properties === void 0) {
                        properties = {
                            inputType: NAME,
                            outerClass: NAME
                        };
                    }

                    return _BaseSelection.call(this, $element, $$$1.extend(true, //{invalidComponentMatches: [File, Radio, Text, Textarea, Select]},
                        Default, config), properties) || this;
                }

                var _proto = Checkbox.prototype;

                _proto.dispose = function dispose(dataKey) {
                    if (dataKey === void 0) {
                        dataKey = DATA_KEY;
                    }

                    _BaseSelection.prototype.dispose.call(this, dataKey);
                };

                Checkbox.matches = function matches($element) {
                    // '.checkbox > label > input[type=checkbox]'
                    if ($element.attr("type") === "checkbox") {
                        return true;
                    }

                    return false;
                };

                Checkbox.rejectMatch = function rejectMatch(component, $element) {
                    Util$2.assert(this.$element, this.matches($element), component + " component element " + Util$2.describe($element) + " is invalid for type='checkbox'.");
                }; // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                Checkbox._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Checkbox($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Checkbox;
            }(BaseSelection);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Checkbox._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Checkbox;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Checkbox._jQueryInterface;
        };

        return Checkbox;
    }(jQuery);

    var CheckboxInline = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "checkboxInline";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {
            bmdFormGroup: {
                create: false,
                // no bmd-form-group creation if form-group not present. It messes with the layout.
                required: false
            }
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var CheckboxInline =
            /*#__PURE__*/
            function(_Checkbox) {
                _inheritsLoose(CheckboxInline, _Checkbox);

                function CheckboxInline($element, config, properties) {
                    if (properties === void 0) {
                        properties = {
                            inputType: "checkbox",
                            outerClass: "checkbox-inline"
                        };
                    }

                    return _Checkbox.call(this, $element, $$$1.extend(true, {}, Default, config), properties) || this;
                }

                var _proto = CheckboxInline.prototype;

                _proto.dispose = function dispose() {
                    _Checkbox.prototype.dispose.call(this, DATA_KEY);
                }; //static matches($element) {
                //  // '.checkbox-inline > input[type=checkbox]'
                //  if ($element.attr('type') === 'checkbox') {
                //    return true
                //  }
                //  return false
                //}
                //
                //static rejectMatch(component, $element) {
                //  Util.assert(this.$element, this.matches($element), `${component} component element ${Util.describe($element)} is invalid for type='checkbox'.`)
                //}
                // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                CheckboxInline._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new CheckboxInline($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return CheckboxInline;
            }(Checkbox);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = CheckboxInline._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = CheckboxInline;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return CheckboxInline._jQueryInterface;
        };

        return CheckboxInline;
    }(jQuery);

    var CollapseInline = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "collapseInline";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Selector = {
            ANY_INPUT: "input, select, textarea"
        };
        var ClassName = {
            IN: "in",
            COLLAPSE: "collapse",
            COLLAPSING: "collapsing",
            COLLAPSED: "collapsed",
            WIDTH: "width"
        };
        var Default = {};
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var CollapseInline =
            /*#__PURE__*/
            function(_Base) {
                _inheritsLoose(CollapseInline, _Base);

                // $element is expected to be the trigger
                //  i.e. <button class="btn bmd-btn-icon" for="search" data-toggle="collapse" data-target="#search-field" aria-expanded="false" aria-controls="search-field">
                function CollapseInline($element, config) {
                    var _this;

                    _this = _Base.call(this, $element, $$$1.extend(true, {}, Default, config)) || this;
                    _this.$bmdFormGroup = _this.findMdbFormGroup(true);
                    var collapseSelector = $element.data("target");
                    _this.$collapse = $$$1(collapseSelector);
                    Util$2.assert($element, _this.$collapse.length === 0, "Cannot find collapse target for " + Util$2.describe($element));
                    Util$2.assert(_this.$collapse, !_this.$collapse.hasClass(ClassName.COLLAPSE), Util$2.describe(_this.$collapse) + " is expected to have the '" + ClassName.COLLAPSE + "' class.  It is being targeted by " + Util$2.describe($element)); // find the first input for focusing

                    var $inputs = _this.$bmdFormGroup.find(Selector.ANY_INPUT);

                    if ($inputs.length > 0) {
                        _this.$input = $inputs.first();
                    } // automatically add the marker class to collapse width instead of height - nice convenience because it is easily forgotten


                    if (!_this.$collapse.hasClass(ClassName.WIDTH)) {
                        _this.$collapse.addClass(ClassName.WIDTH);
                    }

                    if (_this.$input) {
                        // add a listener to set focus
                        _this.$collapse.on("shown.bs.collapse", function() {
                            _this.$input.focus();
                        }); // add a listener to collapse field


                        _this.$input.blur(function() {
                            _this.$collapse.collapse("hide");
                        });
                    }

                    return _this;
                }

                var _proto = CollapseInline.prototype;

                _proto.dispose = function dispose() {
                    _Base.prototype.dispose.call(this, DATA_KEY);

                    this.$bmdFormGroup = null;
                    this.$collapse = null;
                    this.$input = null;
                }; // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                CollapseInline._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new CollapseInline($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return CollapseInline;
            }(Base);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = CollapseInline._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = CollapseInline;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return CollapseInline._jQueryInterface;
        };

        return CollapseInline;
    }(jQuery);

    //import Radio from './radio'
    //import Switch from './switch'
    //import Text from './text'
    //import Textarea from './textarea'
    //import Select from './select'

    var File = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "file";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {};
        var ClassName = {
            FILE: NAME,
            IS_FILE: "is-file"
        };
        var Selector = {
            FILENAMES: "input.form-control[readonly]"
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var File =
            /*#__PURE__*/
            function(_BaseInput) {
                _inheritsLoose(File, _BaseInput);

                function File($element, config) {
                    var _this;

                    _this = _BaseInput.call(this, $element, $$$1.extend(true, //{invalidComponentMatches: [Checkbox, Radio, Text, Textarea, Select, Switch]},
                        Default, config)) || this;

                    _this.$bmdFormGroup.addClass(ClassName.IS_FILE);

                    return _this;
                }

                var _proto = File.prototype;

                _proto.dispose = function dispose() {
                    _BaseInput.prototype.dispose.call(this, DATA_KEY);
                };

                File.matches = function matches($element) {
                    if ($element.attr("type") === "file") {
                        return true;
                    }

                    return false;
                };

                File.rejectMatch = function rejectMatch(component, $element) {
                    Util$2.assert(this.$element, this.matches($element), component + " component element " + Util$2.describe($element) + " is invalid for type='file'.");
                }; // ------------------------------------------------------------------------
                // protected
                // Demarcation element (e.g. first child of a form-group)


                _proto.outerElement = function outerElement() {
                    // label.file > input[type=file]
                    return this.$element.parent().closest("." + ClassName.FILE);
                };

                _proto.rejectWithoutRequiredStructure = function rejectWithoutRequiredStructure() {
                    // label.file > input[type=file]
                    Util$2.assert(this.$element, !this.outerElement().prop("tagName") === "label", this.constructor.name + "'s " + Util$2.describe(this.$element) + " parent element " + Util$2.describe(this.outerElement()) + " should be <label>.");
                    Util$2.assert(this.$element, !this.outerElement().hasClass(ClassName.FILE), this.constructor.name + "'s " + Util$2.describe(this.$element) + " parent element " + Util$2.describe(this.outerElement()) + " should have class ." + ClassName.FILE + ".");
                };

                _proto.addFocusListener = function addFocusListener() {
                    var _this2 = this;

                    this.$bmdFormGroup.on("focus", function() {
                        _this2.addFormGroupFocus();
                    }).on("blur", function() {
                        _this2.removeFormGroupFocus();
                    });
                };

                _proto.addChangeListener = function addChangeListener() {
                    var _this3 = this;

                    // set the fileinput readonly field with the name of the file
                    this.$element.on("change", function() {
                        var value = "";
                        $$$1.each(_this3.$element.files, function(i, file) {
                            value += file.name + "  , ";
                        });
                        value = value.substring(0, value.length - 2);

                        if (value) {
                            _this3.addIsFilled();
                        } else {
                            _this3.removeIsFilled();
                        }

                        _this3.$bmdFormGroup.find(Selector.FILENAMES).val(value);
                    });
                }; // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                File._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new File($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return File;
            }(BaseInput);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = File._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = File;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return File._jQueryInterface;
        };

        return File;
    }(jQuery);

    //import File from './file'
    //import Checkbox from './checkbox'
    //import Switch from './switch'

    var Radio = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "radio";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {
            template: "<span class='bmd-radio'></span>"
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Radio =
            /*#__PURE__*/
            function(_BaseSelection) {
                _inheritsLoose(Radio, _BaseSelection);

                function Radio($element, config, properties) {
                    if (properties === void 0) {
                        properties = {
                            inputType: NAME,
                            outerClass: NAME
                        };
                    }

                    return _BaseSelection.call(this, $element, $$$1.extend(true, //{invalidComponentMatches: [Checkbox, File, Switch, Text]},
                        Default, config), properties) || this;
                }

                var _proto = Radio.prototype;

                _proto.dispose = function dispose(dataKey) {
                    if (dataKey === void 0) {
                        dataKey = DATA_KEY;
                    }

                    _BaseSelection.prototype.dispose.call(this, dataKey);
                };

                Radio.matches = function matches($element) {
                    // '.radio > label > input[type=radio]'
                    if ($element.attr("type") === "radio") {
                        return true;
                    }

                    return false;
                };

                Radio.rejectMatch = function rejectMatch(component, $element) {
                    Util$2.assert(this.$element, this.matches($element), component + " component element " + Util$2.describe($element) + " is invalid for type='radio'.");
                }; // ------------------------------------------------------------------------
                // protected
                //decorateMarkup() {
                //  this.$element.after(this.config.template)
                //}
                // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                Radio._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Radio($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Radio;
            }(BaseSelection);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Radio._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Radio;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Radio._jQueryInterface;
        };

        return Radio;
    }(jQuery);

    var RadioInline = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "radioInline";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {
            bmdFormGroup: {
                create: false,
                // no bmd-form-group creation if form-group not present. It messes with the layout.
                required: false
            }
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var RadioInline =
            /*#__PURE__*/
            function(_Radio) {
                _inheritsLoose(RadioInline, _Radio);

                function RadioInline($element, config, properties) {
                    if (properties === void 0) {
                        properties = {
                            inputType: "radio",
                            outerClass: "radio-inline"
                        };
                    }

                    return _Radio.call(this, $element, $$$1.extend(true, {}, Default, config), properties) || this;
                }

                var _proto = RadioInline.prototype;

                _proto.dispose = function dispose() {
                    _Radio.prototype.dispose.call(this, DATA_KEY);
                }; // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                RadioInline._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new RadioInline($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return RadioInline;
            }(Radio);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = RadioInline._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = RadioInline;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return RadioInline._jQueryInterface;
        };

        return RadioInline;
    }(jQuery);

    var BaseFormControl = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var Default = {
            requiredClasses: ["form-control"]
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var BaseFormControl =
            /*#__PURE__*/
            function(_BaseInput) {
                _inheritsLoose(BaseFormControl, _BaseInput);

                function BaseFormControl($element, config) {
                    var _this;

                    _this = _BaseInput.call(this, $element, $$$1.extend(true, Default, config)) || this; // Initially mark as empty

                    if (_this.isEmpty()) {
                        _this.removeIsFilled();
                    }

                    return _this;
                }

                return BaseFormControl;
            }(BaseInput);

        return BaseFormControl;
    }(jQuery);

    //import File from './file'
    //import Radio from './radio'
    //import Switch from './switch'
    //import Text from './text'
    //import Textarea from './textarea'

    var Select = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "select";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {
            requiredClasses: ["form-control||custom-select"]
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Select =
            /*#__PURE__*/
            function(_BaseFormControl) {
                _inheritsLoose(Select, _BaseFormControl);

                function Select($element, config) {
                    var _this;

                    _this = _BaseFormControl.call(this, $element, $$$1.extend(true, //{invalidComponentMatches: [Checkbox, File, Radio, Switch, Text, Textarea]},
                        Default, config)) || this; // floating labels will cover the options, so trigger them to be above (if used)

                    _this.addIsFilled();

                    return _this;
                }

                var _proto = Select.prototype;

                _proto.dispose = function dispose() {
                    _BaseFormControl.prototype.dispose.call(this, DATA_KEY);
                };

                Select.matches = function matches($element) {
                    if ($element.prop("tagName") === "select") {
                        return true;
                    }

                    return false;
                };

                Select.rejectMatch = function rejectMatch(component, $element) {
                    Util$2.assert(this.$element, this.matches($element), component + " component element " + Util$2.describe($element) + " is invalid for <select>.");
                }; // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                Select._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Select($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Select;
            }(BaseFormControl);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Select._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Select;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Select._jQueryInterface;
        };

        return Select;
    }(jQuery);

    var Switch = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "switch";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {
            template: "<span class='bmd-switch-track'></span>"
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Switch =
            /*#__PURE__*/
            function(_Checkbox) {
                _inheritsLoose(Switch, _Checkbox);

                function Switch($element, config, properties) {
                    if (properties === void 0) {
                        properties = {
                            inputType: "checkbox",
                            outerClass: "switch"
                        };
                    }

                    return _Checkbox.call(this, $element, $$$1.extend(true, {}, Default, config), properties) || this; // selector: '.switch > label > input[type=checkbox]'
                }

                var _proto = Switch.prototype;

                _proto.dispose = function dispose() {
                    _Checkbox.prototype.dispose.call(this, DATA_KEY);
                }; // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                Switch._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Switch($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Switch;
            }(Checkbox);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Switch._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Switch;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Switch._jQueryInterface;
        };

        return Switch;
    }(jQuery);

    //import File from './file'
    //import Radio from './radio'
    //import Switch from './switch'
    //import Textarea from './textarea'
    //import Select from './select'

    var Text = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "text";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {};
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Text =
            /*#__PURE__*/
            function(_BaseFormControl) {
                _inheritsLoose(Text, _BaseFormControl);

                function Text($element, config) {
                    return _BaseFormControl.call(this, $element, $$$1.extend(true, //{invalidComponentMatches: [Checkbox, File, Radio, Switch, Select, Textarea]},
                        Default, config)) || this;
                }

                var _proto = Text.prototype;

                _proto.dispose = function dispose(dataKey) {
                    if (dataKey === void 0) {
                        dataKey = DATA_KEY;
                    }

                    _BaseFormControl.prototype.dispose.call(this, dataKey);
                };

                Text.matches = function matches($element) {
                    if ($element.attr("type") === "text") {
                        return true;
                    }

                    return false;
                };

                Text.rejectMatch = function rejectMatch(component, $element) {
                    Util$2.assert(this.$element, this.matches($element), component + " component element " + Util$2.describe($element) + " is invalid for type='text'.");
                }; // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                Text._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Text($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Text;
            }(BaseFormControl);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Text._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Text;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Text._jQueryInterface;
        };

        return Text;
    }(jQuery);

    //import File from './file'
    //import Radio from './radio'
    //import Switch from './switch'
    //import Text from './text'
    //import Select from './select'

    var Textarea = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "textarea";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {};
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Textarea =
            /*#__PURE__*/
            function(_BaseFormControl) {
                _inheritsLoose(Textarea, _BaseFormControl);

                function Textarea($element, config) {
                    return _BaseFormControl.call(this, $element, $$$1.extend(true, //{invalidComponentMatches: [Checkbox, File, Radio, Text, Select, Switch]},
                        Default, config)) || this;
                }

                var _proto = Textarea.prototype;

                _proto.dispose = function dispose() {
                    _BaseFormControl.prototype.dispose.call(this, DATA_KEY);
                };

                Textarea.matches = function matches($element) {
                    if ($element.prop("tagName") === "textarea") {
                        return true;
                    }

                    return false;
                };

                Textarea.rejectMatch = function rejectMatch(component, $element) {
                    Util$2.assert(this.$element, this.matches($element), component + " component element " + Util$2.describe($element) + " is invalid for <textarea>.");
                }; // ------------------------------------------------------------------------
                // protected
                // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                Textarea._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Textarea($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Textarea;
            }(BaseFormControl);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Textarea._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Textarea;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Textarea._jQueryInterface;
        };

        return Textarea;
    }(jQuery);

    /* global Popper */

    /**
     * This is a copy of the Bootstrap's original dropdown.js, with the only addition
     * of two new classes: 'showing' and 'hiding', used to handle animaitons.
     */
    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.0.0-beta): dropdown.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Dropdown = function($$$1) {
        /**
         * Check for Popper dependency
         * Popper - https://popper.js.org
         */
        if (typeof Popper === 'undefined') {
            throw new Error('Bootstrap dropdown require Popper.js (https://popper.js.org)');
        }
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */


        var NAME = 'dropdown';
        var VERSION = '4.0.0-beta';
        var DATA_KEY = 'bs.dropdown';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

        var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key

        var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key

        var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key

        var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key

        var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

        var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
        var Event = {
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            CLICK: "click" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
            KEYDOWN_DATA_API: "keydown" + EVENT_KEY + DATA_API_KEY,
            KEYUP_DATA_API: "keyup" + EVENT_KEY + DATA_API_KEY,
            TRANSITION_END: 'transitionend webkitTransitionEnd oTransitionEnd animationend webkitAnimationEnd oAnimationEnd'
        };
        var ClassName = {
            DISABLED: 'disabled',
            SHOW: 'show',
            SHOWING: 'showing',
            HIDING: 'hiding',
            DROPUP: 'dropup',
            MENURIGHT: 'dropdown-menu-right',
            MENULEFT: 'dropdown-menu-left'
        };
        var Selector = {
            DATA_TOGGLE: '[data-toggle="dropdown"]',
            FORM_CHILD: '.dropdown form',
            MENU: '.dropdown-menu',
            NAVBAR_NAV: '.navbar-nav',
            VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled)'
        };
        var AttachmentMap = {
            TOP: 'top-start',
            TOPEND: 'top-end',
            BOTTOM: 'bottom-start',
            BOTTOMEND: 'bottom-end'
        };
        var Default = {
            placement: AttachmentMap.BOTTOM,
            offset: 0,
            flip: true
        };
        var DefaultType = {
            placement: 'string',
            offset: '(number|string)',
            flip: 'boolean'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Dropdown =
            /*#__PURE__*/
            function() {
                function Dropdown(element, config) {
                    this._element = element;
                    this._popper = null;
                    this._config = this._getConfig(config);
                    this._menu = this._getMenuElement();
                    this._inNavbar = this._detectNavbar();

                    this._addEventListeners();
                } // getters


                var _proto = Dropdown.prototype;

                // public
                _proto.toggle = function toggle() {
                    var _this = this;

                    if (this._element.disabled || $$$1(this._element).hasClass(ClassName.DISABLED)) {
                        return;
                    }

                    var parent = Dropdown._getParentFromElement(this._element);

                    var isActive = $$$1(this._menu).hasClass(ClassName.SHOW);

                    Dropdown._clearMenus();

                    if (isActive) {
                        return;
                    }

                    var relatedTarget = {
                        relatedTarget: this._element
                    };
                    var showEvent = $$$1.Event(Event.SHOW, relatedTarget);
                    $$$1(parent).trigger(showEvent);

                    if (showEvent.isDefaultPrevented()) {
                        return;
                    }

                    var element = this._element; // for dropup with alignment we use the parent as popper container

                    if ($$$1(parent).hasClass(ClassName.DROPUP)) {
                        if ($$$1(this._menu).hasClass(ClassName.MENULEFT) || $$$1(this._menu).hasClass(ClassName.MENURIGHT)) {
                            element = parent;
                        }
                    }

                    this._popper = new Popper(element, this._menu, this._getPopperConfig()); // if this is a touch-enabled device we add extra
                    // empty mouseover listeners to the body's immediate children;
                    // only needed because of broken event delegation on iOS
                    // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

                    if ('ontouchstart' in document.documentElement && !$$$1(parent).closest(Selector.NAVBAR_NAV).length) {
                        $$$1('body').children().on('mouseover', null, $$$1.noop);
                    }

                    this._element.focus();

                    this._element.setAttribute('aria-expanded', true);

                    $$$1(this._menu).one(Event.TRANSITION_END, function() {
                        $$$1(parent).trigger($$$1.Event(Event.SHOWN, relatedTarget));
                        $$$1(_this._menu).removeClass(ClassName.SHOWING);
                    });
                    $$$1(this._menu).addClass(ClassName.SHOW + " " + ClassName.SHOWING);
                    $$$1(parent).addClass(ClassName.SHOW);
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    $$$1(this._element).off(EVENT_KEY);
                    this._element = null;
                    this._menu = null;

                    if (this._popper !== null) {
                        this._popper.destroy();
                    }

                    this._popper = null;
                };

                _proto.update = function update() {
                    this._inNavbar = this._detectNavbar();

                    if (this._popper !== null) {
                        this._popper.scheduleUpdate();
                    }
                }; // private


                _proto._addEventListeners = function _addEventListeners() {
                    var _this2 = this;

                    $$$1(this._element).on(Event.CLICK, function(event) {
                        event.preventDefault();
                        event.stopPropagation();

                        _this2.toggle();
                    });
                };

                _proto._getConfig = function _getConfig(config) {
                    var elementData = $$$1(this._element).data();

                    if (elementData.placement !== undefined) {
                        elementData.placement = AttachmentMap[elementData.placement.toUpperCase()];
                    }

                    config = $$$1.extend({}, this.constructor.Default, $$$1(this._element).data(), config);
                    Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);
                    return config;
                };

                _proto._getMenuElement = function _getMenuElement() {
                    if (!this._menu) {
                        var parent = Dropdown._getParentFromElement(this._element);

                        this._menu = $$$1(parent).find(Selector.MENU)[0];
                    }

                    return this._menu;
                };

                _proto._getPlacement = function _getPlacement() {
                    var $parentDropdown = $$$1(this._element).parent();
                    var placement = this._config.placement; // Handle dropup

                    if ($parentDropdown.hasClass(ClassName.DROPUP) || this._config.placement === AttachmentMap.TOP) {
                        placement = AttachmentMap.TOP;

                        if ($$$1(this._menu).hasClass(ClassName.MENURIGHT)) {
                            placement = AttachmentMap.TOPEND;
                        }
                    } else if ($$$1(this._menu).hasClass(ClassName.MENURIGHT)) {
                        placement = AttachmentMap.BOTTOMEND;
                    }

                    return placement;
                };

                _proto._detectNavbar = function _detectNavbar() {
                    return $$$1(this._element).closest('.navbar').length > 0;
                };

                _proto._getPopperConfig = function _getPopperConfig() {
                    var popperConfig = {
                        placement: this._getPlacement(),
                        modifiers: {
                            offset: {
                                offset: this._config.offset
                            },
                            flip: {
                                enabled: this._config.flip
                            }
                        } // Disable Popper.js for Dropdown in Navbar

                    };

                    if (this._inNavbar) {
                        popperConfig.modifiers.applyStyle = {
                            enabled: !this._inNavbar
                        };
                    }

                    return popperConfig;
                }; // static


                Dropdown._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = typeof config === 'object' ? config : null;

                        if (!data) {
                            data = new Dropdown(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (data[config] === undefined) {
                                throw new Error("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                Dropdown._clearMenus = function _clearMenus(event) {
                    if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
                        return;
                    }

                    var toggles = $$$1.makeArray($$$1(Selector.DATA_TOGGLE));

                    var _loop = function _loop(i) {
                        var parent = Dropdown._getParentFromElement(toggles[i]);

                        var context = $$$1(toggles[i]).data(DATA_KEY);
                        var relatedTarget = {
                            relatedTarget: toggles[i]
                        };

                        if (!context) {
                            return "continue";
                        }

                        var dropdownMenu = context._menu;

                        if (!$$$1(parent).hasClass(ClassName.SHOW)) {
                            return "continue";
                        }

                        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $$$1.contains(parent, event.target)) {
                            return "continue";
                        }

                        var hideEvent = $$$1.Event(Event.HIDE, relatedTarget);
                        $$$1(parent).trigger(hideEvent);

                        if (hideEvent.isDefaultPrevented()) {
                            return "continue";
                        } // if this is a touch-enabled device we remove the extra
                        // empty mouseover listeners we added for iOS support


                        if ('ontouchstart' in document.documentElement) {
                            $$$1('body').children().off('mouseover', null, $$$1.noop);
                        }

                        toggles[i].setAttribute('aria-expanded', 'false');
                        $$$1(dropdownMenu).addClass(ClassName.HIDING).removeClass(ClassName.SHOW);
                        $$$1(parent).removeClass(ClassName.SHOW);
                        $$$1(dropdownMenu).one(Event.TRANSITION_END, function() {
                            $$$1(parent).trigger($$$1.Event(Event.HIDDEN, relatedTarget));
                            $$$1(dropdownMenu).removeClass(ClassName.HIDING);
                        });
                    };

                    for (var i = 0; i < toggles.length; i++) {
                        var _ret = _loop(i);

                        if (_ret === "continue") continue;
                    }
                };

                Dropdown._getParentFromElement = function _getParentFromElement(element) {
                    var parent;
                    var selector = Util.getSelectorFromElement(element);

                    if (selector) {
                        parent = $$$1(selector)[0];
                    }

                    return parent || element.parentNode;
                };

                Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
                    if (!REGEXP_KEYDOWN.test(event.which) || /button/i.test(event.target.tagName) && event.which === SPACE_KEYCODE || /input|textarea/i.test(event.target.tagName)) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    if (this.disabled || $$$1(this).hasClass(ClassName.DISABLED)) {
                        return;
                    }

                    var parent = Dropdown._getParentFromElement(this);

                    var isActive = $$$1(parent).hasClass(ClassName.SHOW);

                    if (!isActive && (event.which !== ESCAPE_KEYCODE || event.which !== SPACE_KEYCODE) || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
                        if (event.which === ESCAPE_KEYCODE) {
                            var toggle = $$$1(parent).find(Selector.DATA_TOGGLE)[0];
                            $$$1(toggle).trigger('focus');
                        }

                        $$$1(this).trigger('click');
                        return;
                    }

                    var items = $$$1(parent).find(Selector.VISIBLE_ITEMS).get();

                    if (!items.length) {
                        return;
                    }

                    var index = items.indexOf(event.target);

                    if (event.which === ARROW_UP_KEYCODE && index > 0) {
                        // up
                        index--;
                    }

                    if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
                        // down
                        index++;
                    }

                    if (index < 0) {
                        index = 0;
                    }

                    items[index].focus();
                };

                _createClass(Dropdown, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }, {
                    key: "DefaultType",
                    get: function get() {
                        return DefaultType;
                    }
                }]);

                return Dropdown;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.KEYDOWN_DATA_API, Selector.DATA_TOGGLE, Dropdown._dataApiKeydownHandler).on(Event.KEYDOWN_DATA_API, Selector.MENU, Dropdown._dataApiKeydownHandler).on(Event.CLICK_DATA_API + " " + Event.KEYUP_DATA_API, Dropdown._clearMenus).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function(event) {
            event.preventDefault();
            event.stopPropagation();

            Dropdown._jQueryInterface.call($$$1(this), 'toggle');
        }).on(Event.CLICK_DATA_API, Selector.FORM_CHILD, function(e) {
            e.stopPropagation();
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Dropdown._jQueryInterface;
        $$$1.fn[NAME].Constructor = Dropdown;

        $$$1.fn[NAME].noConflict = function() {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Dropdown._jQueryInterface;
        };

        return Dropdown;
    }(jQuery);

    var BaseLayout = function($$$1) {
        var ClassName = {
            CANVAS: "bmd-layout-canvas",
            CONTAINER: "bmd-layout-container",
            BACKDROP: "bmd-layout-backdrop"
        };
        var Selector = {
            CANVAS: "." + ClassName.CANVAS,
            CONTAINER: "." + ClassName.CONTAINER,
            BACKDROP: "." + ClassName.BACKDROP
        };
        var Default = {
            canvas: {
                create: true,
                required: true,
                template: "<div class=\"" + ClassName.CANVAS + "\"></div>"
            },
            backdrop: {
                create: true,
                required: true,
                template: "<div class=\"" + ClassName.BACKDROP + "\"></div>"
            }
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var BaseLayout =
            /*#__PURE__*/
            function(_Base) {
                _inheritsLoose(BaseLayout, _Base);

                function BaseLayout($element, config, properties) {
                    var _this;

                    if (properties === void 0) {
                        properties = {};
                    }

                    _this = _Base.call(this, $element, $$$1.extend(true, {}, Default, config), properties) || this;
                    _this.$container = _this.findContainer(true);
                    _this.$backdrop = _this.resolveBackdrop();

                    _this.resolveCanvas();

                    return _this;
                }

                var _proto = BaseLayout.prototype;

                _proto.dispose = function dispose(dataKey) {
                    _Base.prototype.dispose.call(this, dataKey);

                    this.$container = null;
                    this.$backdrop = null;
                }; // ------------------------------------------------------------------------
                // protected
                // Will wrap container in bmd-layout-canvas if necessary


                _proto.resolveCanvas = function resolveCanvas() {
                    var bd = this.findCanvas(false);

                    if (bd === undefined || bd.length === 0) {
                        if (this.config.canvas.create) {
                            this.$container.wrap(this.config.canvas.template);
                        }

                        bd = this.findCanvas(this.config.canvas.required);
                    }

                    return bd;
                }; // Find closest bmd-layout-container based on the given context


                _proto.findCanvas = function findCanvas(raiseError, context) {
                    if (raiseError === void 0) {
                        raiseError = true;
                    }

                    if (context === void 0) {
                        context = this.$container;
                    }

                    var canvas = context.closest(Selector.CANVAS);

                    if (canvas.length === 0 && raiseError) {
                        $$$1.error("Failed to find " + Selector.CANVAS + " for " + Util$2.describe(context));
                    }

                    return canvas;
                }; // Will add bmd-layout-backdrop to bmd-layout-container if necessary


                _proto.resolveBackdrop = function resolveBackdrop() {
                    var bd = this.findBackdrop(false);

                    if (bd === undefined || bd.length === 0) {
                        if (this.config.backdrop.create) {
                            this.$container.append(this.config.backdrop.template);
                        }

                        bd = this.findBackdrop(this.config.backdrop.required);
                    }

                    return bd;
                }; // Find closest bmd-layout-container based on the given context


                _proto.findBackdrop = function findBackdrop(raiseError, context) {
                    if (raiseError === void 0) {
                        raiseError = true;
                    }

                    if (context === void 0) {
                        context = this.$container;
                    }

                    var backdrop = context.find("> " + Selector.BACKDROP);

                    if (backdrop.length === 0 && raiseError) {
                        $$$1.error("Failed to find " + Selector.BACKDROP + " for " + Util$2.describe(context));
                    }

                    return backdrop;
                }; // Find closest bmd-layout-container based on the given context


                _proto.findContainer = function findContainer(raiseError, context) {
                    if (raiseError === void 0) {
                        raiseError = true;
                    }

                    if (context === void 0) {
                        context = this.$element;
                    }

                    var container = context.closest(Selector.CONTAINER);

                    if (container.length === 0 && raiseError) {
                        $$$1.error("Failed to find " + Selector.CONTAINER + " for " + Util$2.describe(context));
                    }

                    return container;
                }; // ------------------------------------------------------------------------
                // private
                // ------------------------------------------------------------------------
                // static


                return BaseLayout;
            }(Base);

        return BaseLayout;
    }(jQuery);

    var Drawer = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "drawer";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Keycodes = {
            ESCAPE: 27 //ENTER: 13,
            //SPACE: 32

        };
        var ClassName = {
            IN: "in",
            DRAWER_IN: "bmd-drawer-in",
            DRAWER_OUT: "bmd-drawer-out",
            DRAWER: "bmd-layout-drawer",
            CONTAINER: "bmd-layout-container"
        };
        var Default = {
            focusSelector: "a, button, input"
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Drawer =
            /*#__PURE__*/
            function(_BaseLayout) {
                _inheritsLoose(Drawer, _BaseLayout);

                // $element is expected to be the trigger
                //  i.e. <button class="btn bmd-btn-icon" for="search" data-toggle="drawer" data-target="#my-side-nav-drawer" aria-expanded="false" aria-controls="my-side-nav-drawer">
                function Drawer($element, config) {
                    var _this;

                    _this = _BaseLayout.call(this, $element, $$$1.extend(true, {}, Default, config)) || this;
                    _this.$toggles = $$$1("[data-toggle=\"drawer\"][href=\"#" + _this.$element[0].id + "\"], [data-toggle=\"drawer\"][data-target=\"#" + _this.$element[0].id + "\"]");

                    _this._addAria(); // click or escape on the backdrop closes the drawer


                    _this.$backdrop.keydown(function(ev) {
                        if (ev.which === Keycodes.ESCAPE) {
                            _this.hide();
                        }
                    }).click(function() {
                        _this.hide();
                    }); // escape on the drawer closes it


                    _this.$element.keydown(function(ev) {
                        if (ev.which === Keycodes.ESCAPE) {
                            _this.hide();
                        }
                    }); // any toggle button clicks


                    _this.$toggles.click(function() {
                        _this.toggle();
                    });

                    return _this;
                }

                var _proto = Drawer.prototype;

                _proto.dispose = function dispose() {
                    _BaseLayout.prototype.dispose.call(this, DATA_KEY);

                    this.$toggles = null;
                };

                _proto.toggle = function toggle() {
                    if (this._isOpen()) {
                        this.hide();
                    } else {
                        this.show();
                    }
                };

                _proto.show = function show() {
                    if (this._isForcedClosed() || this._isOpen()) {
                        return;
                    }

                    this.$toggles.attr("aria-expanded", true);
                    this.$element.attr("aria-expanded", true);
                    this.$element.attr("aria-hidden", false); // focus on the first focusable item

                    var $focusOn = this.$element.find(this.config.focusSelector);

                    if ($focusOn.length > 0) {
                        $focusOn.first().focus();
                    }

                    this.$container.addClass(ClassName.DRAWER_IN); // backdrop is responsively styled based on bmd-drawer-overlay, therefore style is none of our concern, simply add the marker class and let the scss determine if it should be displayed or not.

                    this.$backdrop.addClass(ClassName.IN);
                };

                _proto.hide = function hide() {
                    if (!this._isOpen()) {
                        return;
                    }

                    this.$toggles.attr("aria-expanded", false);
                    this.$element.attr("aria-expanded", false);
                    this.$element.attr("aria-hidden", true);
                    this.$container.removeClass(ClassName.DRAWER_IN);
                    this.$backdrop.removeClass(ClassName.IN);
                }; // ------------------------------------------------------------------------
                // private


                _proto._isOpen = function _isOpen() {
                    return this.$container.hasClass(ClassName.DRAWER_IN);
                };

                _proto._isForcedClosed = function _isForcedClosed() {
                    return this.$container.hasClass(ClassName.DRAWER_OUT);
                };

                _proto._addAria = function _addAria() {
                    var isOpen = this._isOpen();

                    this.$element.attr("aria-expanded", isOpen);
                    this.$element.attr("aria-hidden", isOpen);

                    if (this.$toggles.length) {
                        this.$toggles.attr("aria-expanded", isOpen);
                    }
                }; // ------------------------------------------------------------------------
                // static


                Drawer._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Drawer($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Drawer;
            }(BaseLayout);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Drawer._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Drawer;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Drawer._jQueryInterface;
        };

        return Drawer;
    }(jQuery);

    var Ripples = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "ripples";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var ClassName = {
            CONTAINER: "ripple-container",
            DECORATOR: "ripple-decorator"
        };
        var Selector = {
            CONTAINER: "." + ClassName.CONTAINER,
            DECORATOR: "." + ClassName.DECORATOR //,

        };
        var Default = {
            container: {
                template: "<div class='" + ClassName.CONTAINER + "'></div>"
            },
            decorator: {
                template: "<div class='" + ClassName.DECORATOR + "'></div>"
            },
            trigger: {
                start: "mousedown touchstart",
                end: "mouseup mouseleave touchend"
            },
            touchUserAgentRegex: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
            duration: 500
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Ripples =
            /*#__PURE__*/
            function() {
                function Ripples($element, config) {
                    var _this = this;

                    this.$element = $element; // console.log(`Adding ripples to ${Util.describe(this.$element)}`)  // eslint-disable-line no-console

                    this.config = $$$1.extend(true, {}, Default, config); // attach initial listener

                    this.$element.on(this.config.trigger.start, function(event) {
                        _this._onStartRipple(event);
                    });
                }

                var _proto = Ripples.prototype;

                _proto.dispose = function dispose() {
                    this.$element.data(DATA_KEY, null);
                    this.$element = null;
                    this.$container = null;
                    this.$decorator = null;
                    this.config = null;
                }; // ------------------------------------------------------------------------
                // private


                _proto._onStartRipple = function _onStartRipple(event) {
                    var _this2 = this;

                    // Verify if the user is just touching on a device and return if so
                    if (this._isTouch() && event.type === "mousedown") {
                        return;
                    } // Find or create the ripple container element


                    this._findOrCreateContainer(); // Get relY and relX positions of the container element


                    var relY = this._getRelY(event);

                    var relX = this._getRelX(event); // If relY and/or relX are false, return the event


                    if (!relY && !relX) {
                        return;
                    } // set the location and color each time (even if element is cached)


                    this.$decorator.css({
                        left: relX,
                        top: relY,
                        "background-color": this._getRipplesColor()
                    }); // Make sure the ripple has the styles applied (ugly hack but it works)

                    this._forceStyleApplication(); // Turn on the ripple animation


                    this.rippleOn(); // Call the rippleEnd function when the transition 'on' ends

                    setTimeout(function() {
                        _this2.rippleEnd();
                    }, this.config.duration); // Detect when the user leaves the element to cleanup if not already done?

                    this.$element.on(this.config.trigger.end, function() {
                        if (_this2.$decorator) {
                            // guard against race condition/mouse attack
                            _this2.$decorator.data("mousedown", "off");

                            if (_this2.$decorator.data("animating") === "off") {
                                _this2.rippleOut();
                            }
                        }
                    });
                };

                _proto._findOrCreateContainer = function _findOrCreateContainer() {
                    if (!this.$container || !this.$container.length > 0) {
                        this.$element.append(this.config.container.template);
                        this.$container = this.$element.find(Selector.CONTAINER);
                    } // always add the rippleElement, it is always removed


                    this.$container.append(this.config.decorator.template);
                    this.$decorator = this.$container.find(Selector.DECORATOR);
                }; // Make sure the ripple has the styles applied (ugly hack but it works)


                _proto._forceStyleApplication = function _forceStyleApplication() {
                    return window.getComputedStyle(this.$decorator[0]).opacity;
                };
                /**
                 * Get the relX
                 */


                _proto._getRelX = function _getRelX(event) {
                    var wrapperOffset = this.$container.offset();
                    var result = null;

                    if (!this._isTouch()) {
                        // Get the mouse position relative to the ripple wrapper
                        result = event.pageX - wrapperOffset.left;
                    } else {
                        // Make sure the user is using only one finger and then get the touch
                        //  position relative to the ripple wrapper
                        event = event.originalEvent;

                        if (event.touches.length === 1) {
                            result = event.touches[0].pageX - wrapperOffset.left;
                        } else {
                            result = false;
                        }
                    }

                    return result;
                };
                /**
                 * Get the relY
                 */


                _proto._getRelY = function _getRelY(event) {
                    var containerOffset = this.$container.offset();
                    var result = null;

                    if (!this._isTouch()) {
                        /**
                         * Get the mouse position relative to the ripple wrapper
                         */
                        result = event.pageY - containerOffset.top;
                    } else {
                        /**
                         * Make sure the user is using only one finger and then get the touch
                         * position relative to the ripple wrapper
                         */
                        event = event.originalEvent;

                        if (event.touches.length === 1) {
                            result = event.touches[0].pageY - containerOffset.top;
                        } else {
                            result = false;
                        }
                    }

                    return result;
                };
                /**
                 * Get the ripple color
                 */


                _proto._getRipplesColor = function _getRipplesColor() {
                    var color = this.$element.data("ripple-color") ? this.$element.data("ripple-color") : window.getComputedStyle(this.$element[0]).color;
                    return color;
                };
                /**
                 * Verify if the client is using a mobile device
                 */


                _proto._isTouch = function _isTouch() {
                    return this.config.touchUserAgentRegex.test(navigator.userAgent);
                };
                /**
                 * End the animation of the ripple
                 */


                _proto.rippleEnd = function rippleEnd() {
                    if (this.$decorator) {
                        // guard against race condition/mouse attack
                        this.$decorator.data("animating", "off");

                        if (this.$decorator.data("mousedown") === "off") {
                            this.rippleOut(this.$decorator);
                        }
                    }
                };
                /**
                 * Turn off the ripple effect
                 */


                _proto.rippleOut = function rippleOut() {
                    var _this3 = this;

                    this.$decorator.off();

                    if (Util$2.transitionEndSupported()) {
                        this.$decorator.addClass("ripple-out");
                    } else {
                        this.$decorator.animate({
                            opacity: 0
                        }, 100, function() {
                            _this3.$decorator.trigger("transitionend");
                        });
                    }

                    this.$decorator.on(Util$2.transitionEndSelector(), function() {
                        if (_this3.$decorator) {
                            _this3.$decorator.remove();

                            _this3.$decorator = null;
                        }
                    });
                };
                /**
                 * Turn on the ripple effect
                 */


                _proto.rippleOn = function rippleOn() {
                    var _this4 = this;

                    var size = this._getNewSize();

                    if (Util$2.transitionEndSupported()) {
                        this.$decorator.css({
                            "-ms-transform": "scale(" + size + ")",
                            "-moz-transform": "scale(" + size + ")",
                            "-webkit-transform": "scale(" + size + ")",
                            transform: "scale(" + size + ")"
                        }).addClass("ripple-on").data("animating", "on").data("mousedown", "on");
                    } else {
                        this.$decorator.animate({
                            width: Math.max(this.$element.outerWidth(), this.$element.outerHeight()) * 2,
                            height: Math.max(this.$element.outerWidth(), this.$element.outerHeight()) * 2,
                            "margin-left": Math.max(this.$element.outerWidth(), this.$element.outerHeight()) * -1,
                            "margin-top": Math.max(this.$element.outerWidth(), this.$element.outerHeight()) * -1,
                            opacity: 0.2
                        }, this.config.duration, function() {
                            _this4.$decorator.trigger("transitionend");
                        });
                    }
                };
                /**
                 * Get the new size based on the element height/width and the ripple width
                 */


                _proto._getNewSize = function _getNewSize() {
                    return Math.max(this.$element.outerWidth(), this.$element.outerHeight()) / this.$decorator.outerWidth() * 2.5;
                }; // ------------------------------------------------------------------------
                // static


                Ripples._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Ripples($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Ripples;
            }();
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Ripples._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Ripples;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Ripples._jQueryInterface;
        };

        return Ripples;
    }(jQuery);

    var Autofill = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "autofill";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = "bmd" + (NAME.charAt(0).toUpperCase() + NAME.slice(1));
        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        var Default = {};
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var Autofill =
            /*#__PURE__*/
            function(_Base) {
                _inheritsLoose(Autofill, _Base);

                function Autofill($element, config) {
                    var _this;

                    _this = _Base.call(this, $element, $$$1.extend(true, {}, Default, config)) || this;

                    _this._watchLoading();

                    _this._attachEventHandlers();

                    return _this;
                }

                var _proto = Autofill.prototype;

                _proto.dispose = function dispose() {
                    _Base.prototype.dispose.call(this, DATA_KEY);
                }; // ------------------------------------------------------------------------
                // private


                _proto._watchLoading = function _watchLoading() {
                    var _this2 = this;

                    // After 10 seconds we are quite sure all the needed inputs are autofilled then we can stop checking them
                    setTimeout(function() {
                        clearInterval(_this2._onLoading);
                    }, 10000);
                }; // This part of code will detect autofill when the page is loading (username and password inputs for example)


                _proto._onLoading = function _onLoading() {
                    setInterval(function() {
                        $$$1("input[type!=checkbox]").each(function(index, element) {
                            var $element = $$$1(element);

                            if ($element.val() && $element.val() !== $element.attr("value")) {
                                $element.trigger("change");
                            }
                        });
                    }, 100);
                };

                _proto._attachEventHandlers = function _attachEventHandlers() {
                    // Listen on inputs of the focused form
                    //  (because user can select from the autofill dropdown only when the input has focus)
                    var focused = null;
                    $$$1(document).on("focus", "input", function(event) {
                        var $inputs = $$$1(event.currentTarget).closest("form").find("input").not("[type=file]");
                        focused = setInterval(function() {
                            $inputs.each(function(index, element) {
                                var $element = $$$1(element);

                                if ($element.val() !== $element.attr("value")) {
                                    $element.trigger("change");
                                }
                            });
                        }, 100);
                    }).on("blur", ".form-group input", function() {
                        clearInterval(focused);
                    });
                }; // ------------------------------------------------------------------------
                // static


                Autofill._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new Autofill($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return Autofill;
            }(Base);
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = Autofill._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = Autofill;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return Autofill._jQueryInterface;
        };

        return Autofill;
    }(jQuery);

    /* globals Popper */
    Popper.Defaults.modifiers.computeStyle.gpuAcceleration = false;
    /**
     * $.bootstrapMaterialDesign(config) is a macro class to configure the components generally
     *  used in Material Design for Bootstrap.  You may pass overrides to the configurations
     *  which will be passed into each component, or you may omit use of this class and
     *  configure each component separately.
     */

    var BootstrapMaterialDesign = function($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = "bootstrapMaterialDesign";
        var DATA_KEY = "bmd." + NAME;
        var JQUERY_NAME = NAME; // retain this full name since it is long enough not to conflict

        var JQUERY_NO_CONFLICT = $$$1.fn[JQUERY_NAME];
        /**
         * Global configuration:
         *  The global configuration hash will be mixed in to each components' config.
         *    e.g. calling $.bootstrapMaterialDesign({global: { validate: true } }) would pass `validate:true` to every component
         *
         *
         * Component configuration:
         *  - selector: may be a string or an array.  Any array will be joined with a comma to generate the selector
         *  - disable any component by defining it as false with an override. e.g. $.bootstrapMaterialDesign({ autofill: false })
         *
         *  @see each individual component for more configuration settings.
         */

        var Default = {
            global: {
                validate: false,
                label: {
                    className: "bmd-label-static" // default style of label to be used if not specified in the html markup

                }
            },
            autofill: {
                selector: "body"
            },
            checkbox: {
                selector: ".checkbox > label > input[type=checkbox]"
            },
            checkboxInline: {
                selector: "label.checkbox-inline > input[type=checkbox]"
            },
            collapseInline: {
                selector: '.bmd-collapse-inline [data-toggle="collapse"]'
            },
            drawer: {
                selector: ".bmd-layout-drawer"
            },
            file: {
                selector: "input[type=file]"
            },
            radio: {
                selector: ".radio > label > input[type=radio]"
            },
            radioInline: {
                selector: "label.radio-inline > input[type=radio]"
            },
            ripples: {
                //selector: ['.btn:not(.btn-link):not(.ripple-none)'] // testing only
                selector: [".btn:not(.ripple-none)", ".card-image:not(.ripple-none)", ".navbar a:not(.ripple-none)", ".dropdown-menu a:not(.ripple-none)", ".nav-tabs a:not(.ripple-none)", ".pagination li:not(.active):not(.disabled) a:not(.ripple-none)", ".ripple" // generic marker class to add ripple to elements
                ]
            },
            select: {
                selector: ["select"]
            },
            switch: {
                selector: ".switch > label > input[type=checkbox]"
            },
            text: {
                // omit inputs we have specialized components to handle - we need to match text, email, etc.  The easiest way to do this appears to be just omit the ones we don't want to match and let the rest fall through to this.
                selector: ["input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=button]):not([type=submit]):not([type=reset])"]
            },
            textarea: {
                selector: ["textarea"]
            },
            arrive: true,
            // create an ordered component list for instantiation
            instantiation: ["ripples", "checkbox", "checkboxInline", "collapseInline", "drawer", //'file',
                "radio", "radioInline", "switch", "text", "textarea", // "select",
                "autofill"
            ]
        };
        /**
         * ------------------------------------------------------------------------
         * Class Definition
         * ------------------------------------------------------------------------
         */

        var BootstrapMaterialDesign =
            /*#__PURE__*/
            function() {
                function BootstrapMaterialDesign($element, config) {
                    var _this = this;

                    this.$element = $element;
                    this.config = $$$1.extend(true, {}, Default, config);
                    var $document = $$$1(document);

                    var _loop = function _loop(component) {
                        // the component's config fragment is passed in directly, allowing users to override
                        var componentConfig = _this.config[component]; // check to make sure component config is enabled (not `false`)

                        if (componentConfig) {
                            // assemble the selector as it may be an array
                            var selector = _this._resolveSelector(componentConfig); // mix in global options


                            componentConfig = $$$1.extend(true, {}, _this.config.global, componentConfig); // create the jquery fn name e.g. 'bmdText' for 'text'

                            var componentName = "" + (component.charAt(0).toUpperCase() + component.slice(1));
                            var jqueryFn = "bmd" + componentName;

                            try {
                                // safely instantiate component on selector elements with config, report errors and move on.
                                // console.debug(`instantiating: $('${selector}')[${jqueryFn}](${componentConfig})`) // eslint-disable-line no-console
                                $$$1(selector)[jqueryFn](componentConfig); // add to arrive if present and enabled

                                if (document.arrive && _this.config.arrive) {
                                    $document.arrive(selector, function() {
                                        // eslint-disable-line no-loop-func
                                        $$$1(this)[jqueryFn](componentConfig);
                                    });
                                }
                            } catch (e) {
                                var message = "Failed to instantiate component: $('" + selector + "')[" + jqueryFn + "](" + componentConfig + ")";
                                console.error(message, e, "\nSelected elements: ", $$$1(selector)); // eslint-disable-line no-console

                                throw e;
                            }
                        }
                    };

                    for (var _iterator = this.config.instantiation, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                        var _ref;

                        if (_isArray) {
                            if (_i >= _iterator.length) break;
                            _ref = _iterator[_i++];
                        } else {
                            _i = _iterator.next();
                            if (_i.done) break;
                            _ref = _i.value;
                        }

                        var component = _ref;

                        _loop(component);
                    }
                }

                var _proto = BootstrapMaterialDesign.prototype;

                _proto.dispose = function dispose() {
                    this.$element.data(DATA_KEY, null);
                    this.$element = null;
                    this.config = null;
                }; // ------------------------------------------------------------------------
                // private


                _proto._resolveSelector = function _resolveSelector(componentConfig) {
                    var selector = componentConfig.selector;

                    if (Array.isArray(selector)) {
                        selector = selector.join(", ");
                    }

                    return selector;
                }; // ------------------------------------------------------------------------
                // static


                BootstrapMaterialDesign._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function() {
                        var $element = $$$1(this);
                        var data = $element.data(DATA_KEY);

                        if (!data) {
                            data = new BootstrapMaterialDesign($element, config);
                            $element.data(DATA_KEY, data);
                        }
                    });
                };

                return BootstrapMaterialDesign;
            }();
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */


        $$$1.fn[JQUERY_NAME] = BootstrapMaterialDesign._jQueryInterface;
        $$$1.fn[JQUERY_NAME].Constructor = BootstrapMaterialDesign;

        $$$1.fn[JQUERY_NAME].noConflict = function() {
            $$$1.fn[JQUERY_NAME] = JQUERY_NO_CONFLICT;
            return BootstrapMaterialDesign._jQueryInterface;
        };

        return BootstrapMaterialDesign;
    }(jQuery);

    /*
     * This is the main entry point.
     *
     * You can import other modules here, including external packages. When bundling using rollup you can mark those modules as external and have them excluded or, if they have a jsnext:main entry in their package.json (like this package does), let rollup bundle them into your dist file.
     *
     * at your application entry point.  This is necessary for browsers that do not yet support some ES2015 runtime necessities such as Symbol.  We do this in `index-iife.js` for our iife rollup bundle.
     */
    // Bootstrap components

})));
//# sourceMappingURL=bootstrap-material-design.js.map
;
(function(e, t) {
    'object' == typeof exports && 'undefined' != typeof module ? t(require('jquery'), require('popper.js')) : 'function' == typeof define && define.amd ? define(['jquery', 'popper.js'], t) : t(e.jQuery, e.Popper)
})(this, function(e, t) {
    'use strict';

    function n(e, t) {
        for (var n, o = 0; o < t.length; o++) n = t[o], n.enumerable = n.enumerable || !1, n.configurable = !0, 'value' in n && (n.writable = !0), Object.defineProperty(e, n.key, n)
    }

    function o(e, t, o) {
        return t && n(e.prototype, t), o && n(e, o), e
    }

    function a() {
        return a = Object.assign || function(e) {
            for (var t, n = 1; n < arguments.length; n++)
                for (var o in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, o) && (e[o] = t[o]);
            return e
        }, a.apply(this, arguments)
    }

    function r(e, t) {
        e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t
    }
    var i = Math.max;
    e = e && e.hasOwnProperty('default') ? e['default'] : e, t = t && t.hasOwnProperty('default') ? t['default'] : t;
    var l = function(e) {
            function t(e) {
                return {}.toString.call(e).match(/\s([a-z]+)/i)[1].toLowerCase()
            }

            function n() {
                return {
                    bindType: r.end,
                    delegateType: r.end,
                    handle: function(t) {
                        return e(t.target).is(this) ? t.handleObj.handler.apply(this, arguments) : void 0
                    }
                }
            }

            function o() {
                return 'undefined' != typeof window && window.QUnit ? !1 : {
                    end: 'transitionend'
                }
            }

            function a(t) {
                var n = this,
                    o = !1;
                return e(this).one(i.TRANSITION_END, function() {
                    o = !0
                }), setTimeout(function() {
                    o || i.triggerTransitionEnd(n)
                }, t), this
            }
            var r = !1,
                i = {
                    TRANSITION_END: 'bsTransitionEnd',
                    getUID: function(e) {
                        do e += ~~(Math.random() * 1e6); while (document.getElementById(e));
                        return e
                    },
                    getSelectorFromElement: function(t) {
                        var n = t.getAttribute('data-target');
                        n && '#' !== n || (n = t.getAttribute('href') || '');
                        try {
                            var o = e(document).find(n);
                            return 0 < o.length ? n : null
                        } catch (e) {
                            return null
                        }
                    },
                    reflow: function(e) {
                        return e.offsetHeight
                    },
                    triggerTransitionEnd: function(t) {
                        e(t).trigger(r.end)
                    },
                    supportsTransitionEnd: function() {
                        return !!r
                    },
                    isElement: function(e) {
                        return (e[0] || e).nodeType
                    },
                    typeCheckConfig: function(e, n, o) {
                        for (var a in o)
                            if (Object.prototype.hasOwnProperty.call(o, a)) {
                                var r = o[a],
                                    l = n[a],
                                    s = l && i.isElement(l) ? 'element' : t(l);
                                if (!new RegExp(r).test(s)) throw new Error(e.toUpperCase() + ': ' + ('Option "' + a + '" provided type "' + s + '" ') + ('but expected type "' + r + '".'))
                            }
                    }
                };
            return function() {
                r = o(), e.fn.emulateTransitionEnd = a, i.supportsTransitionEnd() && (e.event.special[i.TRANSITION_END] = n())
            }(), i
        }(e),
        s = function(e) {
            var t = 'alert',
                n = 'bs.alert',
                a = '.' + n,
                r = e.fn[t],
                i = {
                    CLOSE: 'close' + a,
                    CLOSED: 'closed' + a,
                    CLICK_DATA_API: 'click' + a + '.data-api'
                },
                s = {
                    ALERT: 'alert',
                    FADE: 'fade',
                    SHOW: 'show'
                },
                d = function() {
                    function t(e) {
                        this._element = e
                    }
                    var a = t.prototype;
                    return a.close = function(e) {
                        e = e || this._element;
                        var t = this._getRootElement(e),
                            n = this._triggerCloseEvent(t);
                        n.isDefaultPrevented() || this._removeElement(t)
                    }, a.dispose = function() {
                        e.removeData(this._element, n), this._element = null
                    }, a._getRootElement = function(t) {
                        var n = l.getSelectorFromElement(t),
                            o = !1;
                        return n && (o = e(n)[0]), o || (o = e(t).closest('.' + s.ALERT)[0]), o
                    }, a._triggerCloseEvent = function(t) {
                        var n = e.Event(i.CLOSE);
                        return e(t).trigger(n), n
                    }, a._removeElement = function(t) {
                        var n = this;
                        return e(t).removeClass(s.SHOW), l.supportsTransitionEnd() && e(t).hasClass(s.FADE) ? void e(t).one(l.TRANSITION_END, function(e) {
                            return n._destroyElement(t, e)
                        }).emulateTransitionEnd(150) : void this._destroyElement(t)
                    }, a._destroyElement = function(t) {
                        e(t).detach().trigger(i.CLOSED).remove()
                    }, t._jQueryInterface = function(o) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new t(this), a.data(n, r)), 'close' === o && r[o](this)
                        })
                    }, t._handleDismiss = function(e) {
                        return function(t) {
                            t && t.preventDefault(), e.close(this)
                        }
                    }, o(t, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0'
                        }
                    }]), t
                }();
            return e(document).on(i.CLICK_DATA_API, {
                DISMISS: '[data-dismiss="alert"]'
            }.DISMISS, d._handleDismiss(new d)), e.fn[t] = d._jQueryInterface, e.fn[t].Constructor = d, e.fn[t].noConflict = function() {
                return e.fn[t] = r, d._jQueryInterface
            }, d
        }(e),
        d = function(e) {
            var t = 'button',
                n = 'bs.button',
                a = '.' + n,
                r = '.data-api',
                i = e.fn[t],
                l = {
                    ACTIVE: 'active',
                    BUTTON: 'btn',
                    FOCUS: 'focus'
                },
                s = {
                    DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
                    DATA_TOGGLE: '[data-toggle="buttons"]',
                    INPUT: 'input',
                    ACTIVE: '.active',
                    BUTTON: '.btn'
                },
                d = {
                    CLICK_DATA_API: 'click' + a + r,
                    FOCUS_BLUR_DATA_API: 'focus' + a + r + ' ' + ('blur' + a + r)
                },
                c = function() {
                    function t(e) {
                        this._element = e
                    }
                    var a = t.prototype;
                    return a.toggle = function() {
                        var t = !0,
                            n = !0,
                            o = e(this._element).closest(s.DATA_TOGGLE)[0];
                        if (o) {
                            var a = e(this._element).find(s.INPUT)[0];
                            if (a) {
                                if ('radio' === a.type)
                                    if (a.checked && e(this._element).hasClass(l.ACTIVE)) t = !1;
                                    else {
                                        var r = e(o).find(s.ACTIVE)[0];
                                        r && e(r).removeClass(l.ACTIVE)
                                    }
                                if (t) {
                                    if (a.hasAttribute('disabled') || o.hasAttribute('disabled') || a.classList.contains('disabled') || o.classList.contains('disabled')) return;
                                    a.checked = !e(this._element).hasClass(l.ACTIVE), e(a).trigger('change')
                                }
                                a.focus(), n = !1
                            }
                        }
                        n && this._element.setAttribute('aria-pressed', !e(this._element).hasClass(l.ACTIVE)), t && e(this._element).toggleClass(l.ACTIVE)
                    }, a.dispose = function() {
                        e.removeData(this._element, n), this._element = null
                    }, t._jQueryInterface = function(o) {
                        return this.each(function() {
                            var a = e(this).data(n);
                            a || (a = new t(this), e(this).data(n, a)), 'toggle' === o && a[o]()
                        })
                    }, o(t, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0'
                        }
                    }]), t
                }();
            return e(document).on(d.CLICK_DATA_API, s.DATA_TOGGLE_CARROT, function(t) {
                t.preventDefault();
                var n = t.target;
                e(n).hasClass(l.BUTTON) || (n = e(n).closest(s.BUTTON)), c._jQueryInterface.call(e(n), 'toggle')
            }).on(d.FOCUS_BLUR_DATA_API, s.DATA_TOGGLE_CARROT, function(t) {
                var n = e(t.target).closest(s.BUTTON)[0];
                e(n).toggleClass(l.FOCUS, /^focus(in)?$/.test(t.type))
            }), e.fn[t] = c._jQueryInterface, e.fn[t].Constructor = c, e.fn[t].noConflict = function() {
                return e.fn[t] = i, c._jQueryInterface
            }, c
        }(e),
        c = function(e) {
            var t = 'carousel',
                n = 'bs.carousel',
                a = '.' + n,
                r = '.data-api',
                i = e.fn[t],
                s = {
                    interval: 5e3,
                    keyboard: !0,
                    slide: !1,
                    pause: 'hover',
                    wrap: !0
                },
                d = {
                    interval: '(number|boolean)',
                    keyboard: 'boolean',
                    slide: '(boolean|string)',
                    pause: '(string|boolean)',
                    wrap: 'boolean'
                },
                c = {
                    NEXT: 'next',
                    PREV: 'prev',
                    LEFT: 'left',
                    RIGHT: 'right'
                },
                _ = {
                    SLIDE: 'slide' + a,
                    SLID: 'slid' + a,
                    KEYDOWN: 'keydown' + a,
                    MOUSEENTER: 'mouseenter' + a,
                    MOUSELEAVE: 'mouseleave' + a,
                    TOUCHEND: 'touchend' + a,
                    LOAD_DATA_API: 'load' + a + r,
                    CLICK_DATA_API: 'click' + a + r
                },
                p = {
                    CAROUSEL: 'carousel',
                    ACTIVE: 'active',
                    SLIDE: 'slide',
                    RIGHT: 'carousel-item-right',
                    LEFT: 'carousel-item-left',
                    NEXT: 'carousel-item-next',
                    PREV: 'carousel-item-prev',
                    ITEM: 'carousel-item'
                },
                m = {
                    ACTIVE: '.active',
                    ACTIVE_ITEM: '.active.carousel-item',
                    ITEM: '.carousel-item',
                    NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
                    INDICATORS: '.carousel-indicators',
                    DATA_SLIDE: '[data-slide], [data-slide-to]',
                    DATA_RIDE: '[data-ride="carousel"]'
                },
                g = function() {
                    function r(t, n) {
                        this._items = null, this._interval = null, this._activeElement = null, this._isPaused = !1, this._isSliding = !1, this.touchTimeout = null, this._config = this._getConfig(n), this._element = e(t)[0], this._indicatorsElement = e(this._element).find(m.INDICATORS)[0], this._addEventListeners()
                    }
                    var i = r.prototype;
                    return i.next = function() {
                        this._isSliding || this._slide(c.NEXT)
                    }, i.nextWhenVisible = function() {
                        document.hidden || this.next()
                    }, i.prev = function() {
                        this._isSliding || this._slide(c.PREV)
                    }, i.pause = function(t) {
                        t || (this._isPaused = !0), e(this._element).find(m.NEXT_PREV)[0] && l.supportsTransitionEnd() && (l.triggerTransitionEnd(this._element), this.cycle(!0)), clearInterval(this._interval), this._interval = null
                    }, i.cycle = function(e) {
                        e || (this._isPaused = !1), this._interval && (clearInterval(this._interval), this._interval = null), this._config.interval && !this._isPaused && (this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval))
                    }, i.to = function(t) {
                        var n = this;
                        this._activeElement = e(this._element).find(m.ACTIVE_ITEM)[0];
                        var o = this._getItemIndex(this._activeElement);
                        if (!(t > this._items.length - 1 || 0 > t)) {
                            if (this._isSliding) return void e(this._element).one(_.SLID, function() {
                                return n.to(t)
                            });
                            if (o === t) return this.pause(), void this.cycle();
                            var a = t > o ? c.NEXT : c.PREV;
                            this._slide(a, this._items[t])
                        }
                    }, i.dispose = function() {
                        e(this._element).off(a), e.removeData(this._element, n), this._items = null, this._config = null, this._element = null, this._interval = null, this._isPaused = null, this._isSliding = null, this._activeElement = null, this._indicatorsElement = null
                    }, i._getConfig = function(n) {
                        return n = e.extend({}, s, n), l.typeCheckConfig(t, n, d), n
                    }, i._addEventListeners = function() {
                        var t = this;
                        this._config.keyboard && e(this._element).on(_.KEYDOWN, function(e) {
                            return t._keydown(e)
                        }), 'hover' === this._config.pause && (e(this._element).on(_.MOUSEENTER, function(e) {
                            return t.pause(e)
                        }).on(_.MOUSELEAVE, function(e) {
                            return t.cycle(e)
                        }), 'ontouchstart' in document.documentElement && e(this._element).on(_.TOUCHEND, function() {
                            t.pause(), t.touchTimeout && clearTimeout(t.touchTimeout), t.touchTimeout = setTimeout(function(e) {
                                return t.cycle(e)
                            }, 500 + t._config.interval)
                        }))
                    }, i._keydown = function(e) {
                        if (!/input|textarea/i.test(e.target.tagName)) switch (e.which) {
                            case 37:
                                e.preventDefault(), this.prev();
                                break;
                            case 39:
                                e.preventDefault(), this.next();
                                break;
                            default:
                        }
                    }, i._getItemIndex = function(t) {
                        return this._items = e.makeArray(e(t).parent().find(m.ITEM)), this._items.indexOf(t)
                    }, i._getItemByDirection = function(e, t) {
                        var n = e === c.NEXT,
                            o = e === c.PREV,
                            a = this._getItemIndex(t),
                            r = this._items.length - 1;
                        if ((o && 0 === a || n && a === r) && !this._config.wrap) return t;
                        var i = e === c.PREV ? -1 : 1,
                            l = (a + i) % this._items.length;
                        return -1 == l ? this._items[this._items.length - 1] : this._items[l]
                    }, i._triggerSlideEvent = function(t, n) {
                        var o = this._getItemIndex(t),
                            a = this._getItemIndex(e(this._element).find(m.ACTIVE_ITEM)[0]),
                            r = e.Event(_.SLIDE, {
                                relatedTarget: t,
                                direction: n,
                                from: a,
                                to: o
                            });
                        return e(this._element).trigger(r), r
                    }, i._setActiveIndicatorElement = function(t) {
                        if (this._indicatorsElement) {
                            e(this._indicatorsElement).find(m.ACTIVE).removeClass(p.ACTIVE);
                            var n = this._indicatorsElement.children[this._getItemIndex(t)];
                            n && e(n).addClass(p.ACTIVE)
                        }
                    }, i._slide = function(t, n) {
                        var o, a, r, i = this,
                            s = e(this._element).find(m.ACTIVE_ITEM)[0],
                            d = this._getItemIndex(s),
                            g = n || s && this._getItemByDirection(t, s),
                            f = this._getItemIndex(g),
                            u = !!this._interval;
                        if (t === c.NEXT ? (o = p.LEFT, a = p.NEXT, r = c.LEFT) : (o = p.RIGHT, a = p.PREV, r = c.RIGHT), g && e(g).hasClass(p.ACTIVE)) return void(this._isSliding = !1);
                        var E = this._triggerSlideEvent(g, r);
                        if (!E.isDefaultPrevented() && s && g) {
                            this._isSliding = !0, u && this.pause(), this._setActiveIndicatorElement(g);
                            var h = e.Event(_.SLID, {
                                relatedTarget: g,
                                direction: r,
                                from: d,
                                to: f
                            });
                            l.supportsTransitionEnd() && e(this._element).hasClass(p.SLIDE) ? (e(g).addClass(a), l.reflow(g), e(s).addClass(o), e(g).addClass(o), e(s).one(l.TRANSITION_END, function() {
                                e(g).removeClass(o + ' ' + a).addClass(p.ACTIVE), e(s).removeClass(p.ACTIVE + ' ' + a + ' ' + o), i._isSliding = !1, setTimeout(function() {
                                    return e(i._element).trigger(h)
                                }, 0)
                            }).emulateTransitionEnd(600)) : (e(s).removeClass(p.ACTIVE), e(g).addClass(p.ACTIVE), this._isSliding = !1, e(this._element).trigger(h)), u && this.cycle()
                        }
                    }, r._jQueryInterface = function(t) {
                        return this.each(function() {
                            var o = e(this).data(n),
                                a = e.extend({}, s, e(this).data());
                            'object' == typeof t && e.extend(a, t);
                            var i = 'string' == typeof t ? t : a.slide;
                            if (o || (o = new r(this, a), e(this).data(n, o)), 'number' == typeof t) o.to(t);
                            else if ('string' == typeof i) {
                                if (void 0 === o[i]) throw new Error('No method named "' + i + '"');
                                o[i]()
                            } else a.interval && (o.pause(), o.cycle())
                        })
                    }, r._dataApiClickHandler = function(t) {
                        var o = l.getSelectorFromElement(this);
                        if (o) {
                            var a = e(o)[0];
                            if (a && e(a).hasClass(p.CAROUSEL)) {
                                var i = e.extend({}, e(a).data(), e(this).data()),
                                    s = this.getAttribute('data-slide-to');
                                s && (i.interval = !1), r._jQueryInterface.call(e(a), i), s && e(a).data(n).to(s), t.preventDefault()
                            }
                        }
                    }, o(r, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0-beta'
                        }
                    }, {
                        key: 'Default',
                        get: function() {
                            return s
                        }
                    }]), r
                }();
            return e(document).on(_.CLICK_DATA_API, m.DATA_SLIDE, g._dataApiClickHandler), e(window).on(_.LOAD_DATA_API, function() {
                e(m.DATA_RIDE).each(function() {
                    var t = e(this);
                    g._jQueryInterface.call(t, t.data())
                })
            }), e.fn[t] = g._jQueryInterface, e.fn[t].Constructor = g, e.fn[t].noConflict = function() {
                return e.fn[t] = i, g._jQueryInterface
            }, g
        }(jQuery),
        _ = function(e) {
            var t = 'collapse',
                n = 'bs.collapse',
                r = '.' + n,
                i = e.fn[t],
                s = 600,
                d = {
                    toggle: !0,
                    parent: ''
                },
                c = {
                    toggle: 'boolean',
                    parent: '(string|element)'
                },
                _ = {
                    SHOW: 'show' + r,
                    SHOWN: 'shown' + r,
                    HIDE: 'hide' + r,
                    HIDDEN: 'hidden' + r,
                    CLICK_DATA_API: 'click' + r + '.data-api'
                },
                p = {
                    SHOW: 'show',
                    COLLAPSE: 'collapse',
                    COLLAPSING: 'collapsing',
                    COLLAPSED: 'collapsed'
                },
                m = {
                    WIDTH: 'width',
                    HEIGHT: 'height'
                },
                g = {
                    ACTIVES: '.show, .collapsing',
                    DATA_TOGGLE: '[data-toggle="collapse"]'
                },
                f = function() {
                    function r(t, n) {
                        this._isTransitioning = !1, this._element = t, this._config = this._getConfig(n), this._triggerArray = e.makeArray(e('[data-toggle="collapse"][href="#' + t.id + '"],' + ('[data-toggle="collapse"][data-target="#' + t.id + '"]')));
                        for (var o = e(g.DATA_TOGGLE), a = 0; a < o.length; a++) {
                            var r = o[a],
                                i = l.getSelectorFromElement(r);
                            null !== i && 0 < e(i).filter(t).length && (this._selector = i, this._triggerArray.push(r))
                        }
                        this._parent = this._config.parent ? this._getParent() : null, this._config.parent || this._addAriaAndCollapsedClass(this._element, this._triggerArray), this._config.toggle && this.toggle()
                    }
                    var i = r.prototype;
                    return i.toggle = function() {
                        e(this._element).hasClass(p.SHOW) ? this.hide() : this.show()
                    }, i.show = function() {
                        var t = this;
                        if (!(this._isTransitioning || e(this._element).hasClass(p.SHOW))) {
                            var o, a;
                            if (this._parent && (o = e.makeArray(e(this._parent).find(g.ACTIVES).filter('[data-parent="' + this._config.parent + '"]')), 0 === o.length && (o = null)), !(o && (a = e(o).not(this._selector).data(n), a && a._isTransitioning))) {
                                var i = e.Event(_.SHOW);
                                if (e(this._element).trigger(i), !i.isDefaultPrevented()) {
                                    o && (r._jQueryInterface.call(e(o).not(this._selector), 'hide'), !a && e(o).data(n, null));
                                    var d = this._getDimension();
                                    e(this._element).removeClass(p.COLLAPSE).addClass(p.COLLAPSING), this._element.style[d] = 0, 0 < this._triggerArray.length && e(this._triggerArray).removeClass(p.COLLAPSED).attr('aria-expanded', !0), this.setTransitioning(!0);
                                    var c = function() {
                                        e(t._element).removeClass(p.COLLAPSING).addClass(p.COLLAPSE).addClass(p.SHOW), t._element.style[d] = '', t.setTransitioning(!1), e(t._element).trigger(_.SHOWN)
                                    };
                                    if (!l.supportsTransitionEnd()) return void c();
                                    var m = d[0].toUpperCase() + d.slice(1);
                                    e(this._element).one(l.TRANSITION_END, c).emulateTransitionEnd(s), this._element.style[d] = this._element['scroll' + m] + 'px'
                                }
                            }
                        }
                    }, i.hide = function() {
                        var t = this;
                        if (!this._isTransitioning && e(this._element).hasClass(p.SHOW)) {
                            var n = e.Event(_.HIDE);
                            if (e(this._element).trigger(n), !n.isDefaultPrevented()) {
                                var o = this._getDimension();
                                if (this._element.style[o] = this._element.getBoundingClientRect()[o] + 'px', l.reflow(this._element), e(this._element).addClass(p.COLLAPSING).removeClass(p.COLLAPSE).removeClass(p.SHOW), 0 < this._triggerArray.length)
                                    for (var a = 0; a < this._triggerArray.length; a++) {
                                        var r = this._triggerArray[a],
                                            i = l.getSelectorFromElement(r);
                                        if (null !== i) {
                                            var d = e(i);
                                            d.hasClass(p.SHOW) || e(r).addClass(p.COLLAPSED).attr('aria-expanded', !1)
                                        }
                                    }
                                this.setTransitioning(!0);
                                var c = function() {
                                    t.setTransitioning(!1), e(t._element).removeClass(p.COLLAPSING).addClass(p.COLLAPSE).trigger(_.HIDDEN)
                                };
                                return this._element.style[o] = '', l.supportsTransitionEnd() ? void e(this._element).one(l.TRANSITION_END, c).emulateTransitionEnd(s) : void c()
                            }
                        }
                    }, i.setTransitioning = function(e) {
                        this._isTransitioning = e
                    }, i.dispose = function() {
                        e.removeData(this._element, n), this._config = null, this._parent = null, this._element = null, this._triggerArray = null, this._isTransitioning = null
                    }, i._getConfig = function(e) {
                        return e = a({}, d, e), e.toggle = !!e.toggle, l.typeCheckConfig(t, e, c), e
                    }, i._getDimension = function() {
                        var t = e(this._element).hasClass(m.WIDTH);
                        return t ? m.WIDTH : m.HEIGHT
                    }, i._getParent = function() {
                        var t = this,
                            n = null;
                        l.isElement(this._config.parent) ? (n = this._config.parent, 'undefined' != typeof this._config.parent.jquery && (n = this._config.parent[0])) : n = e(this._config.parent)[0];
                        var o = '[data-toggle="collapse"][data-parent="' + this._config.parent + '"]';
                        return e(n).find(o).each(function(e, n) {
                            t._addAriaAndCollapsedClass(r._getTargetFromElement(n), [n])
                        }), n
                    }, i._addAriaAndCollapsedClass = function(t, n) {
                        if (t) {
                            var o = e(t).hasClass(p.SHOW);
                            0 < n.length && e(n).toggleClass(p.COLLAPSED, !o).attr('aria-expanded', o)
                        }
                    }, r._getTargetFromElement = function(t) {
                        var n = l.getSelectorFromElement(t);
                        return n ? e(n)[0] : null
                    }, r._jQueryInterface = function(t) {
                        return this.each(function() {
                            var o = e(this),
                                i = o.data(n),
                                l = a({}, d, o.data(), 'object' == typeof t && t);
                            if (!i && l.toggle && /show|hide/.test(t) && (l.toggle = !1), i || (i = new r(this, l), o.data(n, i)), 'string' == typeof t) {
                                if ('undefined' == typeof i[t]) throw new TypeError('No method named "' + t + '"');
                                i[t]()
                            }
                        })
                    }, o(r, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0'
                        }
                    }, {
                        key: 'Default',
                        get: function() {
                            return d
                        }
                    }]), r
                }();
            return e(document).on(_.CLICK_DATA_API, g.DATA_TOGGLE, function(t) {
                'A' === t.currentTarget.tagName && t.preventDefault();
                var o = e(this),
                    a = l.getSelectorFromElement(this);
                e(a).each(function() {
                    var t = e(this),
                        a = t.data(n),
                        r = a ? 'toggle' : o.data();
                    f._jQueryInterface.call(t, r)
                })
            }), e.fn[t] = f._jQueryInterface, e.fn[t].Constructor = f, e.fn[t].noConflict = function() {
                return e.fn[t] = i, f._jQueryInterface
            }, f
        }(e),
        p = function(e) {
            var t = 'modal',
                n = 'bs.modal',
                r = '.' + n,
                i = e.fn[t],
                s = 300,
                d = 150,
                c = {
                    backdrop: !0,
                    keyboard: !0,
                    focus: !0,
                    show: !0
                },
                _ = {
                    backdrop: '(boolean|string)',
                    keyboard: 'boolean',
                    focus: 'boolean',
                    show: 'boolean'
                },
                p = {
                    HIDE: 'hide' + r,
                    HIDDEN: 'hidden' + r,
                    SHOW: 'show' + r,
                    SHOWN: 'shown' + r,
                    FOCUSIN: 'focusin' + r,
                    RESIZE: 'resize' + r,
                    CLICK_DISMISS: 'click.dismiss' + r,
                    KEYDOWN_DISMISS: 'keydown.dismiss' + r,
                    MOUSEUP_DISMISS: 'mouseup.dismiss' + r,
                    MOUSEDOWN_DISMISS: 'mousedown.dismiss' + r,
                    CLICK_DATA_API: 'click' + r + '.data-api'
                },
                m = {
                    SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
                    BACKDROP: 'modal-backdrop',
                    OPEN: 'modal-open',
                    FADE: 'fade',
                    SHOW: 'show'
                },
                g = {
                    DIALOG: '.modal-dialog',
                    DATA_TOGGLE: '[data-toggle="modal"]',
                    DATA_DISMISS: '[data-dismiss="modal"]',
                    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
                    STICKY_CONTENT: '.sticky-top',
                    NAVBAR_TOGGLER: '.navbar-toggler'
                },
                f = function() {
                    function i(t, n) {
                        this._config = this._getConfig(n), this._element = t, this._dialog = e(t).find(g.DIALOG)[0], this._backdrop = null, this._isShown = !1, this._isBodyOverflowing = !1, this._ignoreBackdropClick = !1, this._originalBodyPadding = 0, this._scrollbarWidth = 0
                    }
                    var f = i.prototype;
                    return f.toggle = function(e) {
                        return this._isShown ? this.hide() : this.show(e)
                    }, f.show = function(t) {
                        var n = this;
                        if (!(this._isTransitioning || this._isShown)) {
                            l.supportsTransitionEnd() && e(this._element).hasClass(m.FADE) && (this._isTransitioning = !0);
                            var o = e.Event(p.SHOW, {
                                relatedTarget: t
                            });
                            e(this._element).trigger(o), this._isShown || o.isDefaultPrevented() || (this._isShown = !0, this._checkScrollbar(), this._setScrollbar(), this._adjustDialog(), e(document.body).addClass(m.OPEN), this._setEscapeEvent(), this._setResizeEvent(), e(this._element).on(p.CLICK_DISMISS, g.DATA_DISMISS, function(e) {
                                return n.hide(e)
                            }), e(this._dialog).on(p.MOUSEDOWN_DISMISS, function() {
                                e(n._element).one(p.MOUSEUP_DISMISS, function(t) {
                                    e(t.target).is(n._element) && (n._ignoreBackdropClick = !0)
                                })
                            }), this._showBackdrop(function() {
                                return n._showElement(t)
                            }))
                        }
                    }, f.hide = function(t) {
                        var n = this;
                        if (t && t.preventDefault(), !this._isTransitioning && this._isShown) {
                            var o = e.Event(p.HIDE);
                            if (e(this._element).trigger(o), this._isShown && !o.isDefaultPrevented()) {
                                this._isShown = !1;
                                var a = l.supportsTransitionEnd() && e(this._element).hasClass(m.FADE);
                                a && (this._isTransitioning = !0), this._setEscapeEvent(), this._setResizeEvent(), e(document).off(p.FOCUSIN), e(this._element).removeClass(m.SHOW), e(this._element).off(p.CLICK_DISMISS), e(this._dialog).off(p.MOUSEDOWN_DISMISS), a ? e(this._element).one(l.TRANSITION_END, function(e) {
                                    return n._hideModal(e)
                                }).emulateTransitionEnd(s) : this._hideModal()
                            }
                        }
                    }, f.dispose = function() {
                        e.removeData(this._element, n), e(window, document, this._element, this._backdrop).off(r), this._config = null, this._element = null, this._dialog = null, this._backdrop = null, this._isShown = null, this._isBodyOverflowing = null, this._ignoreBackdropClick = null, this._scrollbarWidth = null
                    }, f.handleUpdate = function() {
                        this._adjustDialog()
                    }, f._getConfig = function(e) {
                        return e = a({}, c, e), l.typeCheckConfig(t, e, _), e
                    }, f._showElement = function(t) {
                        var n = this,
                            o = l.supportsTransitionEnd() && e(this._element).hasClass(m.FADE);
                        this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE || document.body.appendChild(this._element), this._element.style.display = 'block', this._element.removeAttribute('aria-hidden'), this._element.scrollTop = 0, o && l.reflow(this._element), e(this._element).addClass(m.SHOW), this._config.focus && this._enforceFocus();
                        var a = e.Event(p.SHOWN, {
                                relatedTarget: t
                            }),
                            r = function() {
                                n._config.focus && n._element.focus(), n._isTransitioning = !1, e(n._element).trigger(a)
                            };
                        o ? e(this._dialog).one(l.TRANSITION_END, r).emulateTransitionEnd(s) : r()
                    }, f._enforceFocus = function() {
                        var t = this;
                        e(document).off(p.FOCUSIN).on(p.FOCUSIN, function(n) {
                            document !== n.target && t._element !== n.target && 0 === e(t._element).has(n.target).length && t._element.focus()
                        })
                    }, f._setEscapeEvent = function() {
                        var t = this;
                        this._isShown && this._config.keyboard ? e(this._element).on(p.KEYDOWN_DISMISS, function(e) {
                            e.which === 27 && (e.preventDefault(), t.hide())
                        }) : !this._isShown && e(this._element).off(p.KEYDOWN_DISMISS)
                    }, f._setResizeEvent = function() {
                        var t = this;
                        this._isShown ? e(window).on(p.RESIZE, function(e) {
                            return t.handleUpdate(e)
                        }) : e(window).off(p.RESIZE)
                    }, f._hideModal = function() {
                        var t = this;
                        this._element.style.display = 'none', this._element.setAttribute('aria-hidden', !0), this._isTransitioning = !1, this._showBackdrop(function() {
                            e(document.body).removeClass(m.OPEN), t._resetAdjustments(), t._resetScrollbar(), e(t._element).trigger(p.HIDDEN)
                        })
                    }, f._removeBackdrop = function() {
                        this._backdrop && (e(this._backdrop).remove(), this._backdrop = null)
                    }, f._showBackdrop = function(t) {
                        var n = this,
                            o = e(this._element).hasClass(m.FADE) ? m.FADE : '';
                        if (this._isShown && this._config.backdrop) {
                            var a = l.supportsTransitionEnd() && o;
                            if (this._backdrop = document.createElement('div'), this._backdrop.className = m.BACKDROP, o && e(this._backdrop).addClass(o), e(this._backdrop).appendTo(document.body), e(this._element).on(p.CLICK_DISMISS, function(e) {
                                    return n._ignoreBackdropClick ? void(n._ignoreBackdropClick = !1) : void(e.target !== e.currentTarget || ('static' === n._config.backdrop ? n._element.focus() : n.hide()))
                                }), a && l.reflow(this._backdrop), e(this._backdrop).addClass(m.SHOW), !t) return;
                            if (!a) return void t();
                            e(this._backdrop).one(l.TRANSITION_END, t).emulateTransitionEnd(d)
                        } else if (!this._isShown && this._backdrop) {
                            e(this._backdrop).removeClass(m.SHOW);
                            var r = function() {
                                n._removeBackdrop(), t && t()
                            };
                            l.supportsTransitionEnd() && e(this._element).hasClass(m.FADE) ? e(this._backdrop).one(l.TRANSITION_END, r).emulateTransitionEnd(d) : r()
                        } else t && t()
                    }, f._adjustDialog = function() {
                        var e = this._element.scrollHeight > document.documentElement.clientHeight;
                        !this._isBodyOverflowing && e && (this._element.style.paddingLeft = this._scrollbarWidth + 'px'), this._isBodyOverflowing && !e && (this._element.style.paddingRight = this._scrollbarWidth + 'px')
                    }, f._resetAdjustments = function() {
                        this._element.style.paddingLeft = '', this._element.style.paddingRight = ''
                    }, f._checkScrollbar = function() {
                        var e = document.body.getBoundingClientRect();
                        this._isBodyOverflowing = e.left + e.right < window.innerWidth, this._scrollbarWidth = this._getScrollbarWidth()
                    }, f._setScrollbar = function() {
                        var t = this;
                        if (this._isBodyOverflowing) {
                            e(g.FIXED_CONTENT).each(function(n, o) {
                                var a = e(o)[0].style.paddingRight,
                                    r = e(o).css('padding-right');
                                e(o).data('padding-right', a).css('padding-right', parseFloat(r) + t._scrollbarWidth + 'px')
                            }), e(g.STICKY_CONTENT).each(function(n, o) {
                                var a = e(o)[0].style.marginRight,
                                    r = e(o).css('margin-right');
                                e(o).data('margin-right', a).css('margin-right', parseFloat(r) - t._scrollbarWidth + 'px')
                            }), e(g.NAVBAR_TOGGLER).each(function(n, o) {
                                var a = e(o)[0].style.marginRight,
                                    r = e(o).css('margin-right');
                                e(o).data('margin-right', a).css('margin-right', parseFloat(r) + t._scrollbarWidth + 'px')
                            });
                            var n = document.body.style.paddingRight,
                                o = e('body').css('padding-right');
                            e('body').data('padding-right', n).css('padding-right', parseFloat(o) + this._scrollbarWidth + 'px')
                        }
                    }, f._resetScrollbar = function() {
                        e(g.FIXED_CONTENT).each(function(t, n) {
                            var o = e(n).data('padding-right');
                            'undefined' != typeof o && e(n).css('padding-right', o).removeData('padding-right')
                        }), e(g.STICKY_CONTENT + ', ' + g.NAVBAR_TOGGLER).each(function(t, n) {
                            var o = e(n).data('margin-right');
                            'undefined' != typeof o && e(n).css('margin-right', o).removeData('margin-right')
                        });
                        var t = e('body').data('padding-right');
                        'undefined' != typeof t && e('body').css('padding-right', t).removeData('padding-right')
                    }, f._getScrollbarWidth = function() {
                        var e = document.createElement('div');
                        e.className = m.SCROLLBAR_MEASURER, document.body.appendChild(e);
                        var t = e.getBoundingClientRect().width - e.clientWidth;
                        return document.body.removeChild(e), t
                    }, i._jQueryInterface = function(t, o) {
                        return this.each(function() {
                            var r = e(this).data(n),
                                l = a({}, i.Default, e(this).data(), 'object' == typeof t && t);
                            if (r || (r = new i(this, l), e(this).data(n, r)), 'string' == typeof t) {
                                if ('undefined' == typeof r[t]) throw new TypeError('No method named "' + t + '"');
                                r[t](o)
                            } else l.show && r.show(o)
                        })
                    }, o(i, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0'
                        }
                    }, {
                        key: 'Default',
                        get: function() {
                            return c
                        }
                    }]), i
                }();
            return e(document).on(p.CLICK_DATA_API, g.DATA_TOGGLE, function(t) {
                var o, r = this,
                    i = l.getSelectorFromElement(this);
                i && (o = e(i)[0]);
                var s = e(o).data(n) ? 'toggle' : a({}, e(o).data(), e(this).data());
                ('A' === this.tagName || 'AREA' === this.tagName) && t.preventDefault();
                var d = e(o).one(p.SHOW, function(t) {
                    t.isDefaultPrevented() || d.one(p.HIDDEN, function() {
                        e(r).is(':visible') && r.focus()
                    })
                });
                f._jQueryInterface.call(e(o), s, this)
            }), e.fn[t] = f._jQueryInterface, e.fn[t].Constructor = f, e.fn[t].noConflict = function() {
                return e.fn[t] = i, f._jQueryInterface
            }, f
        }(e),
        m = function(e) {
            var n = 'tooltip',
                r = 'bs.tooltip',
                i = '.' + r,
                s = e.fn[n],
                d = /(^|\s)bs-tooltip\S+/g,
                c = {
                    animation: 'boolean',
                    template: 'string',
                    title: '(string|element|function)',
                    trigger: 'string',
                    delay: '(number|object)',
                    html: 'boolean',
                    selector: '(string|boolean)',
                    placement: '(string|function)',
                    offset: '(number|string)',
                    container: '(string|element|boolean)',
                    fallbackPlacement: '(string|array)',
                    boundary: '(string|element)'
                },
                _ = {
                    AUTO: 'auto',
                    TOP: 'top',
                    RIGHT: 'right',
                    BOTTOM: 'bottom',
                    LEFT: 'left'
                },
                p = {
                    animation: !0,
                    template: '<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',
                    trigger: 'hover focus',
                    title: '',
                    delay: 0,
                    html: !1,
                    selector: !1,
                    placement: 'top',
                    offset: 0,
                    container: !1,
                    fallbackPlacement: 'flip',
                    boundary: 'scrollParent'
                },
                m = {
                    SHOW: 'show',
                    OUT: 'out'
                },
                g = {
                    HIDE: 'hide' + i,
                    HIDDEN: 'hidden' + i,
                    SHOW: 'show' + i,
                    SHOWN: 'shown' + i,
                    INSERTED: 'inserted' + i,
                    CLICK: 'click' + i,
                    FOCUSIN: 'focusin' + i,
                    FOCUSOUT: 'focusout' + i,
                    MOUSEENTER: 'mouseenter' + i,
                    MOUSELEAVE: 'mouseleave' + i
                },
                f = {
                    FADE: 'fade',
                    SHOW: 'show'
                },
                u = {
                    TOOLTIP: '.tooltip',
                    TOOLTIP_INNER: '.tooltip-inner',
                    ARROW: '.arrow'
                },
                E = {
                    HOVER: 'hover',
                    FOCUS: 'focus',
                    CLICK: 'click',
                    MANUAL: 'manual'
                },
                h = function() {
                    function s(e, n) {
                        if ('undefined' == typeof t) throw new TypeError('Bootstrap tooltips require Popper.js (https://popper.js.org)');
                        this._isEnabled = !0, this._timeout = 0, this._hoverState = '', this._activeTrigger = {}, this._popper = null, this.element = e, this.config = this._getConfig(n), this.tip = null, this._setListeners()
                    }
                    var h = s.prototype;
                    return h.enable = function() {
                        this._isEnabled = !0
                    }, h.disable = function() {
                        this._isEnabled = !1
                    }, h.toggleEnabled = function() {
                        this._isEnabled = !this._isEnabled
                    }, h.toggle = function(t) {
                        if (this._isEnabled)
                            if (t) {
                                var n = this.constructor.DATA_KEY,
                                    o = e(t.currentTarget).data(n);
                                o || (o = new this.constructor(t.currentTarget, this._getDelegateConfig()), e(t.currentTarget).data(n, o)), o._activeTrigger.click = !o._activeTrigger.click, o._isWithActiveTrigger() ? o._enter(null, o) : o._leave(null, o)
                            } else {
                                if (e(this.getTipElement()).hasClass(f.SHOW)) return void this._leave(null, this);
                                this._enter(null, this)
                            }
                    }, h.dispose = function() {
                        clearTimeout(this._timeout), e.removeData(this.element, this.constructor.DATA_KEY), e(this.element).off(this.constructor.EVENT_KEY), e(this.element).closest('.modal').off('hide.bs.modal'), this.tip && e(this.tip).remove(), this._isEnabled = null, this._timeout = null, this._hoverState = null, this._activeTrigger = null, null !== this._popper && this._popper.destroy(), this._popper = null, this.element = null, this.config = null, this.tip = null
                    }, h.show = function() {
                        var n = this;
                        if ('none' === e(this.element).css('display')) throw new Error('Please use show on visible elements');
                        var o = e.Event(this.constructor.Event.SHOW);
                        if (this.isWithContent() && this._isEnabled) {
                            e(this.element).trigger(o);
                            var a = e.contains(this.element.ownerDocument.documentElement, this.element);
                            if (o.isDefaultPrevented() || !a) return;
                            var r = this.getTipElement(),
                                i = l.getUID(this.constructor.NAME);
                            r.setAttribute('id', i), this.element.setAttribute('aria-describedby', i), this.setContent(), this.config.animation && e(r).addClass(f.FADE);
                            var d = 'function' == typeof this.config.placement ? this.config.placement.call(this, r, this.element) : this.config.placement,
                                c = this._getAttachment(d);
                            this.addAttachmentClass(c);
                            var _ = !1 === this.config.container ? document.body : e(this.config.container);
                            e(r).data(this.constructor.DATA_KEY, this), e.contains(this.element.ownerDocument.documentElement, this.tip) || e(r).appendTo(_), e(this.element).trigger(this.constructor.Event.INSERTED), this._popper = new t(this.element, r, {
                                placement: c,
                                modifiers: {
                                    offset: {
                                        offset: this.config.offset
                                    },
                                    flip: {
                                        behavior: this.config.fallbackPlacement
                                    },
                                    arrow: {
                                        element: u.ARROW
                                    },
                                    preventOverflow: {
                                        boundariesElement: this.config.boundary
                                    }
                                },
                                onCreate: function(e) {
                                    e.originalPlacement !== e.placement && n._handlePopperPlacementChange(e)
                                },
                                onUpdate: function(e) {
                                    n._handlePopperPlacementChange(e)
                                }
                            }), e(r).addClass(f.SHOW), 'ontouchstart' in document.documentElement && e('body').children().on('mouseover', null, e.noop);
                            var p = function() {
                                n.config.animation && n._fixTransition();
                                var t = n._hoverState;
                                n._hoverState = null, e(n.element).trigger(n.constructor.Event.SHOWN), t === m.OUT && n._leave(null, n)
                            };
                            l.supportsTransitionEnd() && e(this.tip).hasClass(f.FADE) ? e(this.tip).one(l.TRANSITION_END, p).emulateTransitionEnd(s._TRANSITION_DURATION) : p()
                        }
                    }, h.hide = function(t) {
                        var n = this,
                            o = this.getTipElement(),
                            a = e.Event(this.constructor.Event.HIDE),
                            r = function() {
                                n._hoverState !== m.SHOW && o.parentNode && o.parentNode.removeChild(o), n._cleanTipClass(), n.element.removeAttribute('aria-describedby'), e(n.element).trigger(n.constructor.Event.HIDDEN), null !== n._popper && n._popper.destroy(), t && t()
                            };
                        e(this.element).trigger(a), a.isDefaultPrevented() || (e(o).removeClass(f.SHOW), 'ontouchstart' in document.documentElement && e('body').children().off('mouseover', null, e.noop), this._activeTrigger[E.CLICK] = !1, this._activeTrigger[E.FOCUS] = !1, this._activeTrigger[E.HOVER] = !1, l.supportsTransitionEnd() && e(this.tip).hasClass(f.FADE) ? e(o).one(l.TRANSITION_END, r).emulateTransitionEnd(150) : r(), this._hoverState = '')
                    }, h.update = function() {
                        null !== this._popper && this._popper.scheduleUpdate()
                    }, h.isWithContent = function() {
                        return !!this.getTitle()
                    }, h.addAttachmentClass = function(t) {
                        e(this.getTipElement()).addClass('bs-tooltip' + '-' + t)
                    }, h.getTipElement = function() {
                        return this.tip = this.tip || e(this.config.template)[0], this.tip
                    }, h.setContent = function() {
                        var t = e(this.getTipElement());
                        this.setElementContent(t.find(u.TOOLTIP_INNER), this.getTitle()), t.removeClass(f.FADE + ' ' + f.SHOW)
                    }, h.setElementContent = function(t, n) {
                        var o = this.config.html;
                        'object' == typeof n && (n.nodeType || n.jquery) ? o ? !e(n).parent().is(t) && t.empty().append(n) : t.text(e(n).text()) : t[o ? 'html' : 'text'](n)
                    }, h.getTitle = function() {
                        var e = this.element.getAttribute('data-original-title');
                        return e || (e = 'function' == typeof this.config.title ? this.config.title.call(this.element) : this.config.title), e
                    }, h._getAttachment = function(e) {
                        return _[e.toUpperCase()]
                    }, h._setListeners = function() {
                        var t = this,
                            n = this.config.trigger.split(' ');
                        n.forEach(function(n) {
                            if ('click' === n) e(t.element).on(t.constructor.Event.CLICK, t.config.selector, function(e) {
                                return t.toggle(e)
                            });
                            else if (n !== E.MANUAL) {
                                var o = n === E.HOVER ? t.constructor.Event.MOUSEENTER : t.constructor.Event.FOCUSIN,
                                    a = n === E.HOVER ? t.constructor.Event.MOUSELEAVE : t.constructor.Event.FOCUSOUT;
                                e(t.element).on(o, t.config.selector, function(e) {
                                    return t._enter(e)
                                }).on(a, t.config.selector, function(e) {
                                    return t._leave(e)
                                })
                            }
                            e(t.element).closest('.modal').on('hide.bs.modal', function() {
                                return t.hide()
                            })
                        }), this.config.selector ? this.config = a({}, this.config, {
                            trigger: 'manual',
                            selector: ''
                        }) : this._fixTitle()
                    }, h._fixTitle = function() {
                        var e = typeof this.element.getAttribute('data-original-title');
                        (this.element.getAttribute('title') || 'string' != e) && (this.element.setAttribute('data-original-title', this.element.getAttribute('title') || ''), this.element.setAttribute('title', ''))
                    }, h._enter = function(t, n) {
                        var o = this.constructor.DATA_KEY;
                        return (n = n || e(t.currentTarget).data(o), n || (n = new this.constructor(t.currentTarget, this._getDelegateConfig()), e(t.currentTarget).data(o, n)), t && (n._activeTrigger['focusin' === t.type ? E.FOCUS : E.HOVER] = !0), e(n.getTipElement()).hasClass(f.SHOW) || n._hoverState === m.SHOW) ? void(n._hoverState = m.SHOW) : (clearTimeout(n._timeout), n._hoverState = m.SHOW, n.config.delay && n.config.delay.show ? void(n._timeout = setTimeout(function() {
                            n._hoverState === m.SHOW && n.show()
                        }, n.config.delay.show)) : void n.show())
                    }, h._leave = function(t, n) {
                        var o = this.constructor.DATA_KEY;
                        if (n = n || e(t.currentTarget).data(o), n || (n = new this.constructor(t.currentTarget, this._getDelegateConfig()), e(t.currentTarget).data(o, n)), t && (n._activeTrigger['focusout' === t.type ? E.FOCUS : E.HOVER] = !1), !n._isWithActiveTrigger()) return clearTimeout(n._timeout), n._hoverState = m.OUT, n.config.delay && n.config.delay.hide ? void(n._timeout = setTimeout(function() {
                            n._hoverState === m.OUT && n.hide()
                        }, n.config.delay.hide)) : void n.hide()
                    }, h._isWithActiveTrigger = function() {
                        for (var e in this._activeTrigger)
                            if (this._activeTrigger[e]) return !0;
                        return !1
                    }, h._getConfig = function(t) {
                        return t = a({}, this.constructor.Default, e(this.element).data(), t), 'number' == typeof t.delay && (t.delay = {
                            show: t.delay,
                            hide: t.delay
                        }), 'number' == typeof t.title && (t.title = t.title.toString()), 'number' == typeof t.content && (t.content = t.content.toString()), l.typeCheckConfig(n, t, this.constructor.DefaultType), t
                    }, h._getDelegateConfig = function() {
                        var e = {};
                        if (this.config)
                            for (var t in this.config) this.constructor.Default[t] !== this.config[t] && (e[t] = this.config[t]);
                        return e
                    }, h._cleanTipClass = function() {
                        var t = e(this.getTipElement()),
                            n = t.attr('class').match(d);
                        null !== n && 0 < n.length && t.removeClass(n.join(''))
                    }, h._handlePopperPlacementChange = function(e) {
                        this._cleanTipClass(), this.addAttachmentClass(this._getAttachment(e.placement))
                    }, h._fixTransition = function() {
                        var t = this.getTipElement(),
                            n = this.config.animation;
                        null !== t.getAttribute('x-placement') || (e(t).removeClass(f.FADE), this.config.animation = !1, this.hide(), this.show(), this.config.animation = n)
                    }, s._jQueryInterface = function(t) {
                        return this.each(function() {
                            var n = e(this).data(r);
                            if ((n || !/dispose|hide/.test(t)) && (n || (n = new s(this, 'object' == typeof t && t), e(this).data(r, n)), 'string' == typeof t)) {
                                if ('undefined' == typeof n[t]) throw new TypeError('No method named "' + t + '"');
                                n[t]()
                            }
                        })
                    }, o(s, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0'
                        }
                    }, {
                        key: 'Default',
                        get: function() {
                            return p
                        }
                    }, {
                        key: 'NAME',
                        get: function() {
                            return n
                        }
                    }, {
                        key: 'DATA_KEY',
                        get: function() {
                            return r
                        }
                    }, {
                        key: 'Event',
                        get: function() {
                            return g
                        }
                    }, {
                        key: 'EVENT_KEY',
                        get: function() {
                            return i
                        }
                    }, {
                        key: 'DefaultType',
                        get: function() {
                            return c
                        }
                    }]), s
                }();
            return e.fn[n] = h._jQueryInterface, e.fn[n].Constructor = h, e.fn[n].noConflict = function() {
                return e.fn[n] = s, h._jQueryInterface
            }, h
        }(e, t),
        g = function(e) {
            var t = 'popover',
                n = 'bs.popover',
                i = '.' + n,
                l = e.fn[t],
                s = /(^|\s)bs-popover\S+/g,
                d = a({}, m.Default, {
                    placement: 'right',
                    trigger: 'click',
                    content: '',
                    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'
                }),
                c = a({}, m.DefaultType, {
                    content: '(string|element|function)'
                }),
                _ = {
                    FADE: 'fade',
                    SHOW: 'show'
                },
                p = {
                    TITLE: '.popover-header',
                    CONTENT: '.popover-body'
                },
                g = {
                    HIDE: 'hide' + i,
                    HIDDEN: 'hidden' + i,
                    SHOW: 'show' + i,
                    SHOWN: 'shown' + i,
                    INSERTED: 'inserted' + i,
                    CLICK: 'click' + i,
                    FOCUSIN: 'focusin' + i,
                    FOCUSOUT: 'focusout' + i,
                    MOUSEENTER: 'mouseenter' + i,
                    MOUSELEAVE: 'mouseleave' + i
                },
                f = function(a) {
                    function l() {
                        return a.apply(this, arguments) || this
                    }
                    r(l, a);
                    var m = l.prototype;
                    return m.isWithContent = function() {
                        return this.getTitle() || this._getContent()
                    }, m.addAttachmentClass = function(t) {
                        e(this.getTipElement()).addClass('bs-popover' + '-' + t)
                    }, m.getTipElement = function() {
                        return this.tip = this.tip || e(this.config.template)[0], this.tip
                    }, m.setContent = function() {
                        var t = e(this.getTipElement());
                        this.setElementContent(t.find(p.TITLE), this.getTitle());
                        var n = this._getContent();
                        'function' == typeof n && (n = n.call(this.element)), this.setElementContent(t.find(p.CONTENT), n), t.removeClass(_.FADE + ' ' + _.SHOW)
                    }, m._getContent = function() {
                        return this.element.getAttribute('data-content') || this.config.content
                    }, m._cleanTipClass = function() {
                        var t = e(this.getTipElement()),
                            n = t.attr('class').match(s);
                        null !== n && 0 < n.length && t.removeClass(n.join(''))
                    }, l._jQueryInterface = function(t) {
                        return this.each(function() {
                            var o = e(this).data(n),
                                a = 'object' == typeof t ? t : null;
                            if ((o || !/destroy|hide/.test(t)) && (o || (o = new l(this, a), e(this).data(n, o)), 'string' == typeof t)) {
                                if ('undefined' == typeof o[t]) throw new TypeError('No method named "' + t + '"');
                                o[t]()
                            }
                        })
                    }, o(l, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0'
                        }
                    }, {
                        key: 'Default',
                        get: function() {
                            return d
                        }
                    }, {
                        key: 'NAME',
                        get: function() {
                            return t
                        }
                    }, {
                        key: 'DATA_KEY',
                        get: function() {
                            return n
                        }
                    }, {
                        key: 'Event',
                        get: function() {
                            return g
                        }
                    }, {
                        key: 'EVENT_KEY',
                        get: function() {
                            return i
                        }
                    }, {
                        key: 'DefaultType',
                        get: function() {
                            return c
                        }
                    }]), l
                }(m);
            return e.fn[t] = f._jQueryInterface, e.fn[t].Constructor = f, e.fn[t].noConflict = function() {
                return e.fn[t] = l, f._jQueryInterface
            }, f
        }(e),
        f = function(e) {
            var t = 'scrollspy',
                n = 'bs.scrollspy',
                r = '.' + n,
                s = e.fn[t],
                d = {
                    offset: 10,
                    method: 'auto',
                    target: ''
                },
                c = {
                    offset: 'number',
                    method: 'string',
                    target: '(string|element)'
                },
                _ = {
                    ACTIVATE: 'activate' + r,
                    SCROLL: 'scroll' + r,
                    LOAD_DATA_API: 'load' + r + '.data-api'
                },
                p = {
                    DROPDOWN_ITEM: 'dropdown-item',
                    DROPDOWN_MENU: 'dropdown-menu',
                    ACTIVE: 'active'
                },
                m = {
                    DATA_SPY: '[data-spy="scroll"]',
                    ACTIVE: '.active',
                    NAV_LIST_GROUP: '.nav, .list-group',
                    NAV_LINKS: '.nav-link',
                    NAV_ITEMS: '.nav-item',
                    LIST_ITEMS: '.list-group-item',
                    DROPDOWN: '.dropdown',
                    DROPDOWN_ITEMS: '.dropdown-item',
                    DROPDOWN_TOGGLE: '.dropdown-toggle'
                },
                g = {
                    OFFSET: 'offset',
                    POSITION: 'position'
                },
                f = function() {
                    function s(t, n) {
                        var o = this;
                        this._element = t, this._scrollElement = 'BODY' === t.tagName ? window : t, this._config = this._getConfig(n), this._selector = this._config.target + ' ' + m.NAV_LINKS + ',' + (this._config.target + ' ' + m.LIST_ITEMS + ',') + (this._config.target + ' ' + m.DROPDOWN_ITEMS), this._offsets = [], this._targets = [], this._activeTarget = null, this._scrollHeight = 0, e(this._scrollElement).on(_.SCROLL, function(e) {
                            return o._process(e)
                        }), this.refresh(), this._process()
                    }
                    var f = s.prototype;
                    return f.refresh = function() {
                        var t = this,
                            n = this._scrollElement === this._scrollElement.window ? g.OFFSET : g.POSITION,
                            o = 'auto' === this._config.method ? n : this._config.method,
                            a = o === g.POSITION ? this._getScrollTop() : 0;
                        this._offsets = [], this._targets = [], this._scrollHeight = this._getScrollHeight();
                        var r = e.makeArray(e(this._selector));
                        r.map(function(t) {
                            var n, r = l.getSelectorFromElement(t);
                            if (r && (n = e(r)[0]), n) {
                                var i = n.getBoundingClientRect();
                                if (i.width || i.height) return [e(n)[o]().top + a, r]
                            }
                            return null
                        }).filter(function(e) {
                            return e
                        }).sort(function(e, t) {
                            return e[0] - t[0]
                        }).forEach(function(e) {
                            t._offsets.push(e[0]), t._targets.push(e[1])
                        })
                    }, f.dispose = function() {
                        e.removeData(this._element, n), e(this._scrollElement).off(r), this._element = null, this._scrollElement = null, this._config = null, this._selector = null, this._offsets = null, this._targets = null, this._activeTarget = null, this._scrollHeight = null
                    }, f._getConfig = function(n) {
                        if (n = a({}, d, n), 'string' != typeof n.target) {
                            var o = e(n.target).attr('id');
                            o || (o = l.getUID(t), e(n.target).attr('id', o)), n.target = '#' + o
                        }
                        return l.typeCheckConfig(t, n, c), n
                    }, f._getScrollTop = function() {
                        return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop
                    }, f._getScrollHeight = function() {
                        return this._scrollElement.scrollHeight || i(document.body.scrollHeight, document.documentElement.scrollHeight)
                    }, f._getOffsetHeight = function() {
                        return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height
                    }, f._process = function() {
                        var e = this._getScrollTop() + this._config.offset,
                            t = this._getScrollHeight(),
                            n = this._config.offset + t - this._getOffsetHeight();
                        if (this._scrollHeight !== t && this.refresh(), e >= n) {
                            var o = this._targets[this._targets.length - 1];
                            return void(this._activeTarget !== o && this._activate(o))
                        }
                        if (this._activeTarget && e < this._offsets[0] && 0 < this._offsets[0]) return this._activeTarget = null, void this._clear();
                        for (var a, r = this._offsets.length; r--;) a = this._activeTarget !== this._targets[r] && e >= this._offsets[r] && ('undefined' == typeof this._offsets[r + 1] || e < this._offsets[r + 1]), a && this._activate(this._targets[r])
                    }, f._activate = function(t) {
                        this._activeTarget = t, this._clear();
                        var n = this._selector.split(',');
                        n = n.map(function(e) {
                            return e + '[data-target="' + t + '"],' + (e + '[href="' + t + '"]')
                        });
                        var o = e(n.join(','));
                        o.hasClass(p.DROPDOWN_ITEM) ? (o.closest(m.DROPDOWN).find(m.DROPDOWN_TOGGLE).addClass(p.ACTIVE), o.addClass(p.ACTIVE)) : (o.addClass(p.ACTIVE), o.parents(m.NAV_LIST_GROUP).prev(m.NAV_LINKS + ', ' + m.LIST_ITEMS).addClass(p.ACTIVE), o.parents(m.NAV_LIST_GROUP).prev(m.NAV_ITEMS).children(m.NAV_LINKS).addClass(p.ACTIVE)), e(this._scrollElement).trigger(_.ACTIVATE, {
                            relatedTarget: t
                        })
                    }, f._clear = function() {
                        e(this._selector).filter(m.ACTIVE).removeClass(p.ACTIVE)
                    }, s._jQueryInterface = function(t) {
                        return this.each(function() {
                            var o = e(this).data(n);
                            if (o || (o = new s(this, 'object' == typeof t && t), e(this).data(n, o)), 'string' == typeof t) {
                                if ('undefined' == typeof o[t]) throw new TypeError('No method named "' + t + '"');
                                o[t]()
                            }
                        })
                    }, o(s, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0'
                        }
                    }, {
                        key: 'Default',
                        get: function() {
                            return d
                        }
                    }]), s
                }();
            return e(window).on(_.LOAD_DATA_API, function() {
                for (var t, n = e.makeArray(e(m.DATA_SPY)), o = n.length; o--;) t = e(n[o]), f._jQueryInterface.call(t, t.data())
            }), e.fn[t] = f._jQueryInterface, e.fn[t].Constructor = f, e.fn[t].noConflict = function() {
                return e.fn[t] = s, f._jQueryInterface
            }, f
        }(e),
        u = function(e) {
            var t = 'tab',
                n = 'bs.tab',
                a = '.' + n,
                r = e.fn[t],
                i = {
                    HIDE: 'hide' + a,
                    HIDDEN: 'hidden' + a,
                    SHOW: 'show' + a,
                    SHOWN: 'shown' + a,
                    CLICK_DATA_API: 'click' + a + '.data-api'
                },
                s = {
                    DROPDOWN_MENU: 'dropdown-menu',
                    ACTIVE: 'active',
                    DISABLED: 'disabled',
                    FADE: 'fade',
                    SHOW: 'show'
                },
                d = {
                    DROPDOWN: '.dropdown',
                    NAV_LIST_GROUP: '.nav, .list-group',
                    ACTIVE: '.active',
                    ACTIVE_UL: '> li > .active',
                    DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
                    DROPDOWN_TOGGLE: '.dropdown-toggle',
                    DROPDOWN_ACTIVE_CHILD: '> .dropdown-menu .active'
                },
                c = function() {
                    function t(e) {
                        this._element = e
                    }
                    var a = t.prototype;
                    return a.show = function() {
                        var t = this;
                        if (!(this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && e(this._element).hasClass(s.ACTIVE) || e(this._element).hasClass(s.DISABLED))) {
                            var n, o, a = e(this._element).closest(d.NAV_LIST_GROUP)[0],
                                r = l.getSelectorFromElement(this._element);
                            if (a) {
                                var c = 'UL' === a.nodeName ? d.ACTIVE_UL : d.ACTIVE;
                                o = e.makeArray(e(a).find(c)), o = o[o.length - 1]
                            }
                            var _ = e.Event(i.HIDE, {
                                    relatedTarget: this._element
                                }),
                                p = e.Event(i.SHOW, {
                                    relatedTarget: o
                                });
                            if (o && e(o).trigger(_), e(this._element).trigger(p), !(p.isDefaultPrevented() || _.isDefaultPrevented())) {
                                r && (n = e(r)[0]), this._activate(this._element, a);
                                var m = function() {
                                    var n = e.Event(i.HIDDEN, {
                                            relatedTarget: t._element
                                        }),
                                        a = e.Event(i.SHOWN, {
                                            relatedTarget: o
                                        });
                                    e(o).trigger(n), e(t._element).trigger(a)
                                };
                                n ? this._activate(n, n.parentNode, m) : m()
                            }
                        }
                    }, a.dispose = function() {
                        e.removeData(this._element, n), this._element = null
                    }, a._activate = function(t, n, o) {
                        var a, r = this;
                        a = 'UL' === n.nodeName ? e(n).find(d.ACTIVE_UL) : e(n).children(d.ACTIVE);
                        var i = a[0],
                            c = o && l.supportsTransitionEnd() && i && e(i).hasClass(s.FADE),
                            _ = function() {
                                return r._transitionComplete(t, i, o)
                            };
                        i && c ? e(i).one(l.TRANSITION_END, _).emulateTransitionEnd(150) : _()
                    }, a._transitionComplete = function(t, n, o) {
                        if (n) {
                            e(n).removeClass(s.SHOW + ' ' + s.ACTIVE);
                            var a = e(n.parentNode).find(d.DROPDOWN_ACTIVE_CHILD)[0];
                            a && e(a).removeClass(s.ACTIVE), 'tab' === n.getAttribute('role') && n.setAttribute('aria-selected', !1)
                        }
                        if (e(t).addClass(s.ACTIVE), 'tab' === t.getAttribute('role') && t.setAttribute('aria-selected', !0), l.reflow(t), e(t).addClass(s.SHOW), t.parentNode && e(t.parentNode).hasClass(s.DROPDOWN_MENU)) {
                            var r = e(t).closest(d.DROPDOWN)[0];
                            r && e(r).find(d.DROPDOWN_TOGGLE).addClass(s.ACTIVE), t.setAttribute('aria-expanded', !0)
                        }
                        o && o()
                    }, t._jQueryInterface = function(o) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            if (r || (r = new t(this), a.data(n, r)), 'string' == typeof o) {
                                if ('undefined' == typeof r[o]) throw new TypeError('No method named "' + o + '"');
                                r[o]()
                            }
                        })
                    }, o(t, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0'
                        }
                    }]), t
                }();
            return e(document).on(i.CLICK_DATA_API, d.DATA_TOGGLE, function(t) {
                t.preventDefault(), c._jQueryInterface.call(e(this), 'show')
            }), e.fn[t] = c._jQueryInterface, e.fn[t].Constructor = c, e.fn[t].noConflict = function() {
                return e.fn[t] = r, c._jQueryInterface
            }, c
        }(e),
        E = function() {
            function e() {
                if (window.QUnit) return !1;
                var e = document.createElement('bmd');
                for (var t in o)
                    if (void 0 !== e.style[t]) return o[t];
                return !1
            }
            var t = !1,
                n = '',
                o = {
                    WebkitTransition: 'webkitTransitionEnd',
                    MozTransition: 'transitionend',
                    OTransition: 'oTransitionEnd otransitionend',
                    transition: 'transitionend'
                };
            return function() {
                for (var a in t = e(), o) n += ' ' + o[a]
            }(), {
                transitionEndSupported: function() {
                    return t
                },
                transitionEndSelector: function() {
                    return n
                },
                isChar: function(e) {
                    return !('undefined' != typeof e.which) || 'number' == typeof e.which && 0 < e.which && !e.ctrlKey && !e.metaKey && !e.altKey && 8 !== e.which && 9 !== e.which && 13 !== e.which && 16 !== e.which && 17 !== e.which && 20 !== e.which && 27 !== e.which
                },
                assert: function(e, t, n) {
                    if (t) throw void 0 === !e && e.css('border', '1px solid red'), console.error(n, e), n
                },
                describe: function(e) {
                    return void 0 === e ? 'undefined' : 0 === e.length ? '(no matching elements)' : e[0].outerHTML.split('>')[0] + '>'
                }
            }
        }(jQuery),
        h = function(e) {
            var t = {
                    BMD_FORM_GROUP: 'bmd-form-group',
                    IS_FILLED: 'is-filled',
                    IS_FOCUSED: 'is-focused'
                },
                n = {
                    BMD_FORM_GROUP: '.' + t.BMD_FORM_GROUP
                },
                o = {},
                a = function() {
                    function a(t, n, a) {
                        for (var r in void 0 === a && (a = {}), this.$element = t, this.config = e.extend(!0, {}, o, n), a) this[r] = a[r]
                    }
                    var r = a.prototype;
                    return r.dispose = function(e) {
                        this.$element.data(e, null), this.$element = null, this.config = null
                    }, r.addFormGroupFocus = function() {
                        this.$element.prop('disabled') || this.$bmdFormGroup.addClass(t.IS_FOCUSED)
                    }, r.removeFormGroupFocus = function() {
                        this.$bmdFormGroup.removeClass(t.IS_FOCUSED)
                    }, r.removeIsFilled = function() {
                        this.$bmdFormGroup.removeClass(t.IS_FILLED)
                    }, r.addIsFilled = function() {
                        this.$bmdFormGroup.addClass(t.IS_FILLED)
                    }, r.findMdbFormGroup = function(t) {
                        void 0 === t && (t = !0);
                        var o = this.$element.closest(n.BMD_FORM_GROUP);
                        return 0 === o.length && t && e.error('Failed to find ' + n.BMD_FORM_GROUP + ' for ' + E.describe(this.$element)), o
                    }, a
                }();
            return a
        }(jQuery),
        A = function(e) {
            var t = {
                    FORM_GROUP: 'form-group',
                    BMD_FORM_GROUP: 'bmd-form-group',
                    BMD_LABEL: 'bmd-label',
                    BMD_LABEL_STATIC: 'bmd-label-static',
                    BMD_LABEL_PLACEHOLDER: 'bmd-label-placeholder',
                    BMD_LABEL_FLOATING: 'bmd-label-floating',
                    HAS_DANGER: 'has-danger',
                    IS_FILLED: 'is-filled',
                    IS_FOCUSED: 'is-focused',
                    INPUT_GROUP: 'input-group'
                },
                n = {
                    FORM_GROUP: '.' + t.FORM_GROUP,
                    BMD_FORM_GROUP: '.' + t.BMD_FORM_GROUP,
                    BMD_LABEL_WILDCARD: 'label[class^=\'' + t.BMD_LABEL + '\'], label[class*=\' ' + t.BMD_LABEL + '\']'
                },
                o = {
                    validate: !1,
                    formGroup: {
                        required: !1
                    },
                    bmdFormGroup: {
                        template: '<span class=\'' + t.BMD_FORM_GROUP + '\'></span>',
                        create: !0,
                        required: !0
                    },
                    label: {
                        required: !1,
                        selectors: ['.form-control-label', '> label'],
                        className: t.BMD_LABEL_STATIC
                    },
                    requiredClasses: [],
                    invalidComponentMatches: [],
                    convertInputSizeVariations: !0
                },
                a = {
                    "form-control-lg": 'bmd-form-group-lg',
                    "form-control-sm": 'bmd-form-group-sm'
                },
                i = function(i) {
                    function l(t, n, a) {
                        var r;
                        return void 0 === a && (a = {}), r = i.call(this, t, e.extend(!0, {}, o, n), a) || this, r._rejectInvalidComponentMatches(), r.rejectWithoutRequiredStructure(), r._rejectWithoutRequiredClasses(), r.$formGroup = r.findFormGroup(r.config.formGroup.required), r.$bmdFormGroup = r.resolveMdbFormGroup(), r.$bmdLabel = r.resolveMdbLabel(), r.resolveMdbFormGroupSizing(), r.addFocusListener(), r.addChangeListener(), '' != r.$element.val() && r.addIsFilled(), r
                    }
                    r(l, i);
                    var s = l.prototype;
                    return s.dispose = function(e) {
                        i.prototype.dispose.call(this, e), this.$bmdFormGroup = null, this.$formGroup = null
                    }, s.rejectWithoutRequiredStructure = function() {}, s.addFocusListener = function() {
                        var e = this;
                        this.$element.on('focus', function() {
                            e.addFormGroupFocus()
                        }).on('blur', function() {
                            e.removeFormGroupFocus()
                        })
                    }, s.addChangeListener = function() {
                        var e = this;
                        this.$element.on('keydown paste', function(t) {
                            E.isChar(t) && e.addIsFilled()
                        }).on('keyup change', function() {
                            if (e.isEmpty() ? e.removeIsFilled() : e.addIsFilled(), e.config.validate) {
                                var t = 'undefined' == typeof e.$element[0].checkValidity || e.$element[0].checkValidity();
                                t ? e.removeHasDanger() : e.addHasDanger()
                            }
                        })
                    }, s.addHasDanger = function() {
                        this.$bmdFormGroup.addClass(t.HAS_DANGER)
                    }, s.removeHasDanger = function() {
                        this.$bmdFormGroup.removeClass(t.HAS_DANGER)
                    }, s.isEmpty = function() {
                        return null === this.$element.val() || void 0 === this.$element.val() || '' === this.$element.val()
                    }, s.resolveMdbFormGroup = function() {
                        var e = this.findMdbFormGroup(!1);
                        return (void 0 === e || 0 === e.length) && (this.config.bmdFormGroup.create && (void 0 === this.$formGroup || 0 === this.$formGroup.length) ? this.outerElement().parent().hasClass(t.INPUT_GROUP) ? this.outerElement().parent().wrap(this.config.bmdFormGroup.template) : this.outerElement().wrap(this.config.bmdFormGroup.template) : this.$formGroup.addClass(t.BMD_FORM_GROUP), e = this.findMdbFormGroup(this.config.bmdFormGroup.required)), e
                    }, s.outerElement = function() {
                        return this.$element
                    }, s.resolveMdbLabel = function() {
                        var e = this.$bmdFormGroup.find(n.BMD_LABEL_WILDCARD);
                        return (void 0 === e || 0 === e.length) && (e = this.findMdbLabel(this.config.label.required), void 0 === e || 0 === e.length || e.addClass(this.config.label.className)), e
                    }, s.findMdbLabel = function(t) {
                        void 0 === t && (t = !0);
                        for (var o = null, a = this.config.label.selectors, r = Array.isArray(a), i = 0, a = r ? a : a[Symbol.iterator]();;) {
                            var l;
                            if (r) {
                                if (i >= a.length) break;
                                l = a[i++]
                            } else {
                                if (i = a.next(), i.done) break;
                                l = i.value
                            }
                            var s = l;
                            if (o = e.isFunction(s) ? s(this) : this.$bmdFormGroup.find(s), void 0 !== o && 0 < o.length) break
                        }
                        return 0 === o.length && t && e.error('Failed to find ' + n.BMD_LABEL_WILDCARD + ' within form-group for ' + E.describe(this.$element)), o
                    }, s.findFormGroup = function(t) {
                        void 0 === t && (t = !0);
                        var o = this.$element.closest(n.FORM_GROUP);
                        return 0 === o.length && t && e.error('Failed to find ' + n.FORM_GROUP + ' for ' + E.describe(this.$element)), o
                    }, s.resolveMdbFormGroupSizing = function() {
                        if (this.config.convertInputSizeVariations)
                            for (var e in a) this.$element.hasClass(e) && this.$bmdFormGroup.addClass(a[e])
                    }, s._rejectInvalidComponentMatches = function() {
                        for (var e = this.config.invalidComponentMatches, t = Array.isArray(e), n = 0, e = t ? e : e[Symbol.iterator]();;) {
                            var o;
                            if (t) {
                                if (n >= e.length) break;
                                o = e[n++]
                            } else {
                                if (n = e.next(), n.done) break;
                                o = n.value
                            }
                            var a = o;
                            a.rejectMatch(this.constructor.name, this.$element)
                        }
                    }, s._rejectWithoutRequiredClasses = function() {
                        for (var t = this.config.requiredClasses, n = Array.isArray(t), o = 0, t = n ? t : t[Symbol.iterator]();;) {
                            var a;
                            if (n) {
                                if (o >= t.length) break;
                                a = t[o++]
                            } else {
                                if (o = t.next(), o.done) break;
                                a = o.value
                            }
                            var r = a,
                                i = !1;
                            if (-1 !== r.indexOf('||'))
                                for (var l = r.split('||'), s = l, d = Array.isArray(s), c = 0, s = d ? s : s[Symbol.iterator]();;) {
                                    var _;
                                    if (d) {
                                        if (c >= s.length) break;
                                        _ = s[c++]
                                    } else {
                                        if (c = s.next(), c.done) break;
                                        _ = c.value
                                    }
                                    var p = _;
                                    if (this.$element.hasClass(p)) {
                                        i = !0;
                                        break
                                    }
                                } else this.$element.hasClass(r) && (i = !0);
                            i || e.error(this.constructor.name + ' element: ' + E.describe(this.$element) + ' requires class: ' + r)
                        }
                    }, l
                }(h);
            return i
        }(jQuery),
        C = function(e) {
            var t = {
                    label: {
                        required: !1
                    }
                },
                n = {
                    LABEL: 'label'
                },
                o = function(o) {
                    function a(n, a, r) {
                        var i;
                        return i = o.call(this, n, e.extend(!0, {}, t, a), r) || this, i.decorateMarkup(), i
                    }
                    r(a, o);
                    var i = a.prototype;
                    return i.decorateMarkup = function() {
                        var t = e(this.config.template);
                        this.$element.after(t), !1 !== this.config.ripples && t.bmdRipples()
                    }, i.outerElement = function() {
                        return this.$element.parent().closest('.' + this.outerClass)
                    }, i.rejectWithoutRequiredStructure = function() {
                        E.assert(this.$element, 'label' === !this.$element.parent().prop('tagName'), this.constructor.name + '\'s ' + E.describe(this.$element) + ' parent element should be <label>.'), E.assert(this.$element, !this.outerElement().hasClass(this.outerClass), this.constructor.name + '\'s ' + E.describe(this.$element) + ' outer element should have class ' + this.outerClass + '.')
                    }, i.addFocusListener = function() {
                        var e = this;
                        this.$element.closest(n.LABEL).hover(function() {
                            e.addFormGroupFocus()
                        }, function() {
                            e.removeFormGroupFocus()
                        })
                    }, i.addChangeListener = function() {
                        var e = this;
                        this.$element.change(function() {
                            e.$element.blur()
                        })
                    }, a
                }(A);
            return o
        }(jQuery),
        I = function(e) {
            var t = 'checkbox',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {
                    template: '<span class=\'checkbox-decorator\'><span class=\'check\'></span></span>'
                },
                l = function(o) {
                    function a(n, a, r) {
                        return void 0 === r && (r = {
                            inputType: t,
                            outerClass: t
                        }), o.call(this, n, e.extend(!0, i, a), r) || this
                    }
                    r(a, o);
                    var l = a.prototype;
                    return l.dispose = function(e) {
                        void 0 === e && (e = n), o.prototype.dispose.call(this, e)
                    }, a.matches = function(e) {
                        return 'checkbox' === e.attr('type')
                    }, a.rejectMatch = function(e, t) {
                        E.assert(this.$element, this.matches(t), e + ' component element ' + E.describe(t) + ' is invalid for type=\'checkbox\'.')
                    }, a._jQueryInterface = function(t) {
                        return this.each(function() {
                            var o = e(this),
                                r = o.data(n);
                            r || (r = new a(o, t), o.data(n, r))
                        })
                    }, a
                }(C);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery),
        T = function(e) {
            var t = 'checkboxInline',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {
                    bmdFormGroup: {
                        create: !1,
                        required: !1
                    }
                },
                l = function(t) {
                    function o(n, o, a) {
                        return void 0 === a && (a = {
                            inputType: 'checkbox',
                            outerClass: 'checkbox-inline'
                        }), t.call(this, n, e.extend(!0, {}, i, o), a) || this
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n)
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(I);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery),
        N = function(e) {
            var t = 'collapseInline',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {
                    ANY_INPUT: 'input, select, textarea'
                },
                l = {
                    IN: 'in',
                    COLLAPSE: 'collapse',
                    COLLAPSING: 'collapsing',
                    COLLAPSED: 'collapsed',
                    WIDTH: 'width'
                },
                s = {},
                d = function(t) {
                    function o(n, o) {
                        var a;
                        a = t.call(this, n, e.extend(!0, {}, s, o)) || this, a.$bmdFormGroup = a.findMdbFormGroup(!0);
                        var r = n.data('target');
                        a.$collapse = e(r), E.assert(n, 0 === a.$collapse.length, 'Cannot find collapse target for ' + E.describe(n)), E.assert(a.$collapse, !a.$collapse.hasClass(l.COLLAPSE), E.describe(a.$collapse) + ' is expected to have the \'' + l.COLLAPSE + '\' class.  It is being targeted by ' + E.describe(n));
                        var d = a.$bmdFormGroup.find(i.ANY_INPUT);
                        return 0 < d.length && (a.$input = d.first()), a.$collapse.hasClass(l.WIDTH) || a.$collapse.addClass(l.WIDTH), a.$input && (a.$collapse.on('shown.bs.collapse', function() {
                            a.$input.focus()
                        }), a.$input.blur(function() {
                            a.$collapse.collapse('hide')
                        })), a
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n), this.$bmdFormGroup = null, this.$collapse = null, this.$input = null
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(h);
            return e.fn[o] = d._jQueryInterface, e.fn[o].Constructor = d, e.fn[o].noConflict = function() {
                return e.fn[o] = a, d._jQueryInterface
            }, d
        }(jQuery),
        b = function(e) {
            var t = 'file',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {},
                l = {
                    FILE: t,
                    IS_FILE: 'is-file'
                },
                s = {
                    FILENAMES: 'input.form-control[readonly]'
                },
                d = function(t) {
                    function o(n, o) {
                        var a;
                        return a = t.call(this, n, e.extend(!0, i, o)) || this, a.$bmdFormGroup.addClass(l.IS_FILE), a
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n)
                    }, o.matches = function(e) {
                        return 'file' === e.attr('type')
                    }, o.rejectMatch = function(e, t) {
                        E.assert(this.$element, this.matches(t), e + ' component element ' + E.describe(t) + ' is invalid for type=\'file\'.')
                    }, a.outerElement = function() {
                        return this.$element.parent().closest('.' + l.FILE)
                    }, a.rejectWithoutRequiredStructure = function() {
                        E.assert(this.$element, 'label' === !this.outerElement().prop('tagName'), this.constructor.name + '\'s ' + E.describe(this.$element) + ' parent element ' + E.describe(this.outerElement()) + ' should be <label>.'), E.assert(this.$element, !this.outerElement().hasClass(l.FILE), this.constructor.name + '\'s ' + E.describe(this.$element) + ' parent element ' + E.describe(this.outerElement()) + ' should have class .' + l.FILE + '.')
                    }, a.addFocusListener = function() {
                        var e = this;
                        this.$bmdFormGroup.on('focus', function() {
                            e.addFormGroupFocus()
                        }).on('blur', function() {
                            e.removeFormGroupFocus()
                        })
                    }, a.addChangeListener = function() {
                        var t = this;
                        this.$element.on('change', function() {
                            var n = '';
                            e.each(t.$element.files, function(e, t) {
                                n += t.name + '  , '
                            }), n = n.substring(0, n.length - 2), n ? t.addIsFilled() : t.removeIsFilled(), t.$bmdFormGroup.find(s.FILENAMES).val(n)
                        })
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(A);
            return e.fn[o] = d._jQueryInterface, e.fn[o].Constructor = d, e.fn[o].noConflict = function() {
                return e.fn[o] = a, d._jQueryInterface
            }, d
        }(jQuery),
        O = function(e) {
            var t = 'radio',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {
                    template: '<span class=\'bmd-radio\'></span>'
                },
                l = function(o) {
                    function a(n, a, r) {
                        return void 0 === r && (r = {
                            inputType: t,
                            outerClass: t
                        }), o.call(this, n, e.extend(!0, i, a), r) || this
                    }
                    r(a, o);
                    var l = a.prototype;
                    return l.dispose = function(e) {
                        void 0 === e && (e = n), o.prototype.dispose.call(this, e)
                    }, a.matches = function(e) {
                        return 'radio' === e.attr('type')
                    }, a.rejectMatch = function(e, t) {
                        E.assert(this.$element, this.matches(t), e + ' component element ' + E.describe(t) + ' is invalid for type=\'radio\'.')
                    }, a._jQueryInterface = function(t) {
                        return this.each(function() {
                            var o = e(this),
                                r = o.data(n);
                            r || (r = new a(o, t), o.data(n, r))
                        })
                    }, a
                }(C);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery),
        D = function(e) {
            var t = 'radioInline',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {
                    bmdFormGroup: {
                        create: !1,
                        required: !1
                    }
                },
                l = function(t) {
                    function o(n, o, a) {
                        return void 0 === a && (a = {
                            inputType: 'radio',
                            outerClass: 'radio-inline'
                        }), t.call(this, n, e.extend(!0, {}, i, o), a) || this
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n)
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(O);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery),
        y = function(e) {
            var t = {
                    requiredClasses: ['form-control']
                },
                n = function(n) {
                    function o(o, a) {
                        var r;
                        return r = n.call(this, o, e.extend(!0, t, a)) || this, r.isEmpty() && r.removeIsFilled(), r
                    }
                    return r(o, n), o
                }(A);
            return n
        }(jQuery),
        S = function(e) {
            var t = 'select',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {
                    requiredClasses: ['form-control||custom-select']
                },
                l = function(t) {
                    function o(n, o) {
                        var a;
                        return a = t.call(this, n, e.extend(!0, i, o)) || this, a.addIsFilled(), a
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n)
                    }, o.matches = function(e) {
                        return 'select' === e.prop('tagName')
                    }, o.rejectMatch = function(e, t) {
                        E.assert(this.$element, this.matches(t), e + ' component element ' + E.describe(t) + ' is invalid for <select>.')
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(y);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery),
        v = function(e) {
            var t = 'switch',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {
                    template: '<span class=\'bmd-switch-track\'></span>'
                },
                l = function(t) {
                    function o(n, o, a) {
                        return void 0 === a && (a = {
                            inputType: 'checkbox',
                            outerClass: 'switch'
                        }), t.call(this, n, e.extend(!0, {}, i, o), a) || this
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n)
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(I);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery),
        R = function(e) {
            var t = 'text',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {},
                l = function(t) {
                    function o(n, o) {
                        return t.call(this, n, e.extend(!0, i, o)) || this
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function(e) {
                        void 0 === e && (e = n), t.prototype.dispose.call(this, e)
                    }, o.matches = function(e) {
                        return 'text' === e.attr('type')
                    }, o.rejectMatch = function(e, t) {
                        E.assert(this.$element, this.matches(t), e + ' component element ' + E.describe(t) + ' is invalid for type=\'text\'.')
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(y);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery),
        M = function(e) {
            var t = 'textarea',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {},
                l = function(t) {
                    function o(n, o) {
                        return t.call(this, n, e.extend(!0, i, o)) || this
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n)
                    }, o.matches = function(e) {
                        return 'textarea' === e.prop('tagName')
                    }, o.rejectMatch = function(e, t) {
                        E.assert(this.$element, this.matches(t), e + ' component element ' + E.describe(t) + ' is invalid for <textarea>.')
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(y);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery),
        L = function(e) {
            if ('undefined' == typeof Popper) throw new Error('Bootstrap dropdown require Popper.js (https://popper.js.org)');
            var t = 'dropdown',
                n = 'bs.dropdown',
                a = '.' + n,
                r = '.data-api',
                i = e.fn[t],
                s = 27,
                d = 32,
                c = 9,
                _ = /38|40|27/,
                p = {
                    HIDE: 'hide' + a,
                    HIDDEN: 'hidden' + a,
                    SHOW: 'show' + a,
                    SHOWN: 'shown' + a,
                    CLICK: 'click' + a,
                    CLICK_DATA_API: 'click' + a + r,
                    KEYDOWN_DATA_API: 'keydown' + a + r,
                    KEYUP_DATA_API: 'keyup' + a + r,
                    TRANSITION_END: 'transitionend webkitTransitionEnd oTransitionEnd animationend webkitAnimationEnd oAnimationEnd'
                },
                m = {
                    DISABLED: 'disabled',
                    SHOW: 'show',
                    SHOWING: 'showing',
                    HIDING: 'hiding',
                    DROPUP: 'dropup',
                    MENURIGHT: 'dropdown-menu-right',
                    MENULEFT: 'dropdown-menu-left'
                },
                g = {
                    DATA_TOGGLE: '[data-toggle="dropdown"]',
                    FORM_CHILD: '.dropdown form',
                    MENU: '.dropdown-menu',
                    NAVBAR_NAV: '.navbar-nav',
                    VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled)'
                },
                f = {
                    TOP: 'top-start',
                    TOPEND: 'top-end',
                    BOTTOM: 'bottom-start',
                    BOTTOMEND: 'bottom-end'
                },
                u = {
                    placement: f.BOTTOM,
                    offset: 0,
                    flip: !0
                },
                E = {
                    placement: 'string',
                    offset: '(number|string)',
                    flip: 'boolean'
                },
                h = function() {
                    function r(e, t) {
                        this._element = e, this._popper = null, this._config = this._getConfig(t), this._menu = this._getMenuElement(), this._inNavbar = this._detectNavbar(), this._addEventListeners()
                    }
                    var i = r.prototype;
                    return i.toggle = function() {
                        var t = this;
                        if (!(this._element.disabled || e(this._element).hasClass(m.DISABLED))) {
                            var n = r._getParentFromElement(this._element),
                                o = e(this._menu).hasClass(m.SHOW);
                            if (r._clearMenus(), !o) {
                                var a = {
                                        relatedTarget: this._element
                                    },
                                    i = e.Event(p.SHOW, a);
                                if (e(n).trigger(i), !i.isDefaultPrevented()) {
                                    var l = this._element;
                                    e(n).hasClass(m.DROPUP) && (e(this._menu).hasClass(m.MENULEFT) || e(this._menu).hasClass(m.MENURIGHT)) && (l = n), this._popper = new Popper(l, this._menu, this._getPopperConfig()), 'ontouchstart' in document.documentElement && !e(n).closest(g.NAVBAR_NAV).length && e('body').children().on('mouseover', null, e.noop), this._element.focus(), this._element.setAttribute('aria-expanded', !0), e(this._menu).one(p.TRANSITION_END, function() {
                                        e(n).trigger(e.Event(p.SHOWN, a)), e(t._menu).removeClass(m.SHOWING)
                                    }), e(this._menu).addClass(m.SHOW + ' ' + m.SHOWING), e(n).addClass(m.SHOW)
                                }
                            }
                        }
                    }, i.dispose = function() {
                        e.removeData(this._element, n), e(this._element).off(a), this._element = null, this._menu = null, null !== this._popper && this._popper.destroy(), this._popper = null
                    }, i.update = function() {
                        this._inNavbar = this._detectNavbar(), null !== this._popper && this._popper.scheduleUpdate()
                    }, i._addEventListeners = function() {
                        var t = this;
                        e(this._element).on(p.CLICK, function(e) {
                            e.preventDefault(), e.stopPropagation(), t.toggle()
                        })
                    }, i._getConfig = function(n) {
                        var o = e(this._element).data();
                        return void 0 !== o.placement && (o.placement = f[o.placement.toUpperCase()]), n = e.extend({}, this.constructor.Default, e(this._element).data(), n), l.typeCheckConfig(t, n, this.constructor.DefaultType), n
                    }, i._getMenuElement = function() {
                        if (!this._menu) {
                            var t = r._getParentFromElement(this._element);
                            this._menu = e(t).find(g.MENU)[0]
                        }
                        return this._menu
                    }, i._getPlacement = function() {
                        var t = e(this._element).parent(),
                            n = this._config.placement;
                        return t.hasClass(m.DROPUP) || this._config.placement === f.TOP ? (n = f.TOP, e(this._menu).hasClass(m.MENURIGHT) && (n = f.TOPEND)) : e(this._menu).hasClass(m.MENURIGHT) && (n = f.BOTTOMEND), n
                    }, i._detectNavbar = function() {
                        return 0 < e(this._element).closest('.navbar').length
                    }, i._getPopperConfig = function() {
                        var e = {
                            placement: this._getPlacement(),
                            modifiers: {
                                offset: {
                                    offset: this._config.offset
                                },
                                flip: {
                                    enabled: this._config.flip
                                }
                            }
                        };
                        return this._inNavbar && (e.modifiers.applyStyle = {
                            enabled: !this._inNavbar
                        }), e
                    }, r._jQueryInterface = function(t) {
                        return this.each(function() {
                            var o = e(this).data(n),
                                a = 'object' == typeof t ? t : null;
                            if (o || (o = new r(this, a), e(this).data(n, o)), 'string' == typeof t) {
                                if (void 0 === o[t]) throw new Error('No method named "' + t + '"');
                                o[t]()
                            }
                        })
                    }, r._clearMenus = function(t) {
                        if (!(t && (t.which === 3 || 'keyup' === t.type && t.which !== c)))
                            for (var o, a = e.makeArray(e(g.DATA_TOGGLE)), l = function(o) {
                                    var i = r._getParentFromElement(a[o]),
                                        l = e(a[o]).data(n),
                                        s = {
                                            relatedTarget: a[o]
                                        };
                                    if (!l) return 'continue';
                                    var d = l._menu;
                                    if (!e(i).hasClass(m.SHOW)) return 'continue';
                                    if (t && ('click' === t.type && /input|textarea/i.test(t.target.tagName) || 'keyup' === t.type && t.which === c) && e.contains(i, t.target)) return 'continue';
                                    var _ = e.Event(p.HIDE, s);
                                    return e(i).trigger(_), _.isDefaultPrevented() ? 'continue' : void(('ontouchstart' in document.documentElement) && e('body').children().off('mouseover', null, e.noop), a[o].setAttribute('aria-expanded', 'false'), e(d).addClass(m.HIDING).removeClass(m.SHOW), e(i).removeClass(m.SHOW), e(d).one(p.TRANSITION_END, function() {
                                        e(i).trigger(e.Event(p.HIDDEN, s)), e(d).removeClass(m.HIDING)
                                    }))
                                }, s = 0; s < a.length; s++) o = l(s), 'continue' === o
                    }, r._getParentFromElement = function(t) {
                        var n, o = l.getSelectorFromElement(t);
                        return o && (n = e(o)[0]), n || t.parentNode
                    }, r._dataApiKeydownHandler = function(t) {
                        if (!(!_.test(t.which) || /button/i.test(t.target.tagName) && t.which === d || /input|textarea/i.test(t.target.tagName)) && (t.preventDefault(), t.stopPropagation(), !(this.disabled || e(this).hasClass(m.DISABLED)))) {
                            var n = r._getParentFromElement(this),
                                o = e(n).hasClass(m.SHOW);
                            if (!o && (t.which !== s || t.which !== d) || o && (t.which === s || t.which === d)) {
                                if (t.which === s) {
                                    var a = e(n).find(g.DATA_TOGGLE)[0];
                                    e(a).trigger('focus')
                                }
                                return void e(this).trigger('click')
                            }
                            var i = e(n).find(g.VISIBLE_ITEMS).get();
                            if (i.length) {
                                var l = i.indexOf(t.target);
                                t.which === 38 && 0 < l && l--, t.which === 40 && l < i.length - 1 && l++, 0 > l && (l = 0), i[l].focus()
                            }
                        }
                    }, o(r, null, [{
                        key: 'VERSION',
                        get: function() {
                            return '4.0.0-beta'
                        }
                    }, {
                        key: 'Default',
                        get: function() {
                            return u
                        }
                    }, {
                        key: 'DefaultType',
                        get: function() {
                            return E
                        }
                    }]), r
                }();
            return e(document).on(p.KEYDOWN_DATA_API, g.DATA_TOGGLE, h._dataApiKeydownHandler).on(p.KEYDOWN_DATA_API, g.MENU, h._dataApiKeydownHandler).on(p.CLICK_DATA_API + ' ' + p.KEYUP_DATA_API, h._clearMenus).on(p.CLICK_DATA_API, g.DATA_TOGGLE, function(t) {
                t.preventDefault(), t.stopPropagation(), h._jQueryInterface.call(e(this), 'toggle')
            }).on(p.CLICK_DATA_API, g.FORM_CHILD, function(t) {
                t.stopPropagation()
            }), e.fn[t] = h._jQueryInterface, e.fn[t].Constructor = h, e.fn[t].noConflict = function() {
                return e.fn[t] = i, h._jQueryInterface
            }, h
        }(jQuery),
        U = function(e) {
            var t = {
                    CANVAS: 'bmd-layout-canvas',
                    CONTAINER: 'bmd-layout-container',
                    BACKDROP: 'bmd-layout-backdrop'
                },
                n = {
                    CANVAS: '.' + t.CANVAS,
                    CONTAINER: '.' + t.CONTAINER,
                    BACKDROP: '.' + t.BACKDROP
                },
                o = {
                    canvas: {
                        create: !0,
                        required: !0,
                        template: '<div class="' + t.CANVAS + '"></div>'
                    },
                    backdrop: {
                        create: !0,
                        required: !0,
                        template: '<div class="' + t.BACKDROP + '"></div>'
                    }
                },
                a = function(t) {
                    function a(n, a, r) {
                        var i;
                        return void 0 === r && (r = {}), i = t.call(this, n, e.extend(!0, {}, o, a), r) || this, i.$container = i.findContainer(!0), i.$backdrop = i.resolveBackdrop(), i.resolveCanvas(), i
                    }
                    r(a, t);
                    var i = a.prototype;
                    return i.dispose = function(e) {
                        t.prototype.dispose.call(this, e), this.$container = null, this.$backdrop = null
                    }, i.resolveCanvas = function() {
                        var e = this.findCanvas(!1);
                        return (void 0 === e || 0 === e.length) && (this.config.canvas.create && this.$container.wrap(this.config.canvas.template), e = this.findCanvas(this.config.canvas.required)), e
                    }, i.findCanvas = function(t, o) {
                        void 0 === t && (t = !0), void 0 === o && (o = this.$container);
                        var a = o.closest(n.CANVAS);
                        return 0 === a.length && t && e.error('Failed to find ' + n.CANVAS + ' for ' + E.describe(o)), a
                    }, i.resolveBackdrop = function() {
                        var e = this.findBackdrop(!1);
                        return (void 0 === e || 0 === e.length) && (this.config.backdrop.create && this.$container.append(this.config.backdrop.template), e = this.findBackdrop(this.config.backdrop.required)), e
                    }, i.findBackdrop = function(t, o) {
                        void 0 === t && (t = !0), void 0 === o && (o = this.$container);
                        var a = o.find('> ' + n.BACKDROP);
                        return 0 === a.length && t && e.error('Failed to find ' + n.BACKDROP + ' for ' + E.describe(o)), a
                    }, i.findContainer = function(t, o) {
                        void 0 === t && (t = !0), void 0 === o && (o = this.$element);
                        var a = o.closest(n.CONTAINER);
                        return 0 === a.length && t && e.error('Failed to find ' + n.CONTAINER + ' for ' + E.describe(o)), a
                    }, a
                }(h);
            return a
        }(jQuery),
        P = function(e) {
            var t = 'drawer',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {
                    ESCAPE: 27
                },
                l = {
                    IN: 'in',
                    DRAWER_IN: 'bmd-drawer-in',
                    DRAWER_OUT: 'bmd-drawer-out',
                    DRAWER: 'bmd-layout-drawer',
                    CONTAINER: 'bmd-layout-container'
                },
                s = {
                    focusSelector: 'a, button, input'
                },
                d = function(t) {
                    function o(n, o) {
                        var a;
                        return a = t.call(this, n, e.extend(!0, {}, s, o)) || this, a.$toggles = e('[data-toggle="drawer"][href="#' + a.$element[0].id + '"], [data-toggle="drawer"][data-target="#' + a.$element[0].id + '"]'), a._addAria(), a.$backdrop.keydown(function(e) {
                            e.which === i.ESCAPE && a.hide()
                        }).click(function() {
                            a.hide()
                        }), a.$element.keydown(function(e) {
                            e.which === i.ESCAPE && a.hide()
                        }), a.$toggles.click(function() {
                            a.toggle()
                        }), a
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n), this.$toggles = null
                    }, a.toggle = function() {
                        this._isOpen() ? this.hide() : this.show()
                    }, a.show = function() {
                        if (!(this._isForcedClosed() || this._isOpen())) {
                            this.$toggles.attr('aria-expanded', !0), this.$element.attr('aria-expanded', !0), this.$element.attr('aria-hidden', !1);
                            var e = this.$element.find(this.config.focusSelector);
                            0 < e.length && e.first().focus(), this.$container.addClass(l.DRAWER_IN), this.$backdrop.addClass(l.IN)
                        }
                    }, a.hide = function() {
                        this._isOpen() && (this.$toggles.attr('aria-expanded', !1), this.$element.attr('aria-expanded', !1), this.$element.attr('aria-hidden', !0), this.$container.removeClass(l.DRAWER_IN), this.$backdrop.removeClass(l.IN))
                    }, a._isOpen = function() {
                        return this.$container.hasClass(l.DRAWER_IN)
                    }, a._isForcedClosed = function() {
                        return this.$container.hasClass(l.DRAWER_OUT)
                    }, a._addAria = function() {
                        var e = this._isOpen();
                        this.$element.attr('aria-expanded', e), this.$element.attr('aria-hidden', e), this.$toggles.length && this.$toggles.attr('aria-expanded', e)
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(U);
            return e.fn[o] = d._jQueryInterface, e.fn[o].Constructor = d, e.fn[o].noConflict = function() {
                return e.fn[o] = a, d._jQueryInterface
            }, d
        }(jQuery),
        w = function(e) {
            var t = 'ripples',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                r = {
                    CONTAINER: 'ripple-container',
                    DECORATOR: 'ripple-decorator'
                },
                l = {
                    CONTAINER: '.' + r.CONTAINER,
                    DECORATOR: '.' + r.DECORATOR
                },
                s = {
                    container: {
                        template: '<div class=\'' + r.CONTAINER + '\'></div>'
                    },
                    decorator: {
                        template: '<div class=\'' + r.DECORATOR + '\'></div>'
                    },
                    trigger: {
                        start: 'mousedown touchstart',
                        end: 'mouseup mouseleave touchend'
                    },
                    touchUserAgentRegex: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
                    duration: 500
                },
                d = function() {
                    function t(t, n) {
                        var o = this;
                        this.$element = t, this.config = e.extend(!0, {}, s, n), this.$element.on(this.config.trigger.start, function(e) {
                            o._onStartRipple(e)
                        })
                    }
                    var o = t.prototype;
                    return o.dispose = function() {
                        this.$element.data(n, null), this.$element = null, this.$container = null, this.$decorator = null, this.config = null
                    }, o._onStartRipple = function(e) {
                        var t = this;
                        if (!(this._isTouch() && 'mousedown' === e.type)) {
                            this._findOrCreateContainer();
                            var n = this._getRelY(e),
                                o = this._getRelX(e);
                            (n || o) && (this.$decorator.css({
                                left: o,
                                top: n,
                                "background-color": this._getRipplesColor()
                            }), this._forceStyleApplication(), this.rippleOn(), setTimeout(function() {
                                t.rippleEnd()
                            }, this.config.duration), this.$element.on(this.config.trigger.end, function() {
                                t.$decorator && (t.$decorator.data('mousedown', 'off'), 'off' === t.$decorator.data('animating') && t.rippleOut())
                            }))
                        }
                    }, o._findOrCreateContainer = function() {
                        (!this.$container || 0 < !this.$container.length) && (this.$element.append(this.config.container.template), this.$container = this.$element.find(l.CONTAINER)), this.$container.append(this.config.decorator.template), this.$decorator = this.$container.find(l.DECORATOR)
                    }, o._forceStyleApplication = function() {
                        return window.getComputedStyle(this.$decorator[0]).opacity
                    }, o._getRelX = function(e) {
                        var t = this.$container.offset(),
                            n = null;
                        return this._isTouch() ? (e = e.originalEvent, n = 1 === e.touches.length && e.touches[0].pageX - t.left) : n = e.pageX - t.left, n
                    }, o._getRelY = function(e) {
                        var t = this.$container.offset(),
                            n = null;
                        return this._isTouch() ? (e = e.originalEvent, n = 1 === e.touches.length && e.touches[0].pageY - t.top) : n = e.pageY - t.top, n
                    }, o._getRipplesColor = function() {
                        var e = this.$element.data('ripple-color') ? this.$element.data('ripple-color') : window.getComputedStyle(this.$element[0]).color;
                        return e
                    }, o._isTouch = function() {
                        return this.config.touchUserAgentRegex.test(navigator.userAgent)
                    }, o.rippleEnd = function() {
                        this.$decorator && (this.$decorator.data('animating', 'off'), 'off' === this.$decorator.data('mousedown') && this.rippleOut(this.$decorator))
                    }, o.rippleOut = function() {
                        var e = this;
                        this.$decorator.off(), E.transitionEndSupported() ? this.$decorator.addClass('ripple-out') : this.$decorator.animate({
                            opacity: 0
                        }, 100, function() {
                            e.$decorator.trigger('transitionend')
                        }), this.$decorator.on(E.transitionEndSelector(), function() {
                            e.$decorator && (e.$decorator.remove(), e.$decorator = null)
                        })
                    }, o.rippleOn = function() {
                        var e = this,
                            t = this._getNewSize();
                        E.transitionEndSupported() ? this.$decorator.css({
                            "-ms-transform": 'scale(' + t + ')',
                            "-moz-transform": 'scale(' + t + ')',
                            "-webkit-transform": 'scale(' + t + ')',
                            transform: 'scale(' + t + ')'
                        }).addClass('ripple-on').data('animating', 'on').data('mousedown', 'on') : this.$decorator.animate({
                            width: 2 * i(this.$element.outerWidth(), this.$element.outerHeight()),
                            height: 2 * i(this.$element.outerWidth(), this.$element.outerHeight()),
                            "margin-left": -1 * i(this.$element.outerWidth(), this.$element.outerHeight()),
                            "margin-top": -1 * i(this.$element.outerWidth(), this.$element.outerHeight()),
                            opacity: 0.2
                        }, this.config.duration, function() {
                            e.$decorator.trigger('transitionend')
                        })
                    }, o._getNewSize = function() {
                        return 2.5 * (i(this.$element.outerWidth(), this.$element.outerHeight()) / this.$decorator.outerWidth())
                    }, t._jQueryInterface = function(o) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new t(a, o), a.data(n, r))
                        })
                    }, t
                }();
            return e.fn[o] = d._jQueryInterface, e.fn[o].Constructor = d, e.fn[o].noConflict = function() {
                return e.fn[o] = a, d._jQueryInterface
            }, d
        }(jQuery),
        k = function(e) {
            var t = 'autofill',
                n = 'bmd.' + t,
                o = 'bmd' + (t.charAt(0).toUpperCase() + t.slice(1)),
                a = e.fn[o],
                i = {},
                l = function(t) {
                    function o(n, o) {
                        var a;
                        return a = t.call(this, n, e.extend(!0, {}, i, o)) || this, a._watchLoading(), a._attachEventHandlers(), a
                    }
                    r(o, t);
                    var a = o.prototype;
                    return a.dispose = function() {
                        t.prototype.dispose.call(this, n)
                    }, a._watchLoading = function() {
                        var e = this;
                        setTimeout(function() {
                            clearInterval(e._onLoading)
                        }, 1e4)
                    }, a._onLoading = function() {
                        setInterval(function() {
                            e('input[type!=checkbox]').each(function(t, n) {
                                var o = e(n);
                                o.val() && o.val() !== o.attr('value') && o.trigger('change')
                            })
                        }, 100)
                    }, a._attachEventHandlers = function() {
                        var t = null;
                        e(document).on('focus', 'input', function(n) {
                            var o = e(n.currentTarget).closest('form').find('input').not('[type=file]');
                            t = setInterval(function() {
                                o.each(function(t, n) {
                                    var o = e(n);
                                    o.val() !== o.attr('value') && o.trigger('change')
                                })
                            }, 100)
                        }).on('blur', '.form-group input', function() {
                            clearInterval(t)
                        })
                    }, o._jQueryInterface = function(t) {
                        return this.each(function() {
                            var a = e(this),
                                r = a.data(n);
                            r || (r = new o(a, t), a.data(n, r))
                        })
                    }, o
                }(h);
            return e.fn[o] = l._jQueryInterface, e.fn[o].Constructor = l, e.fn[o].noConflict = function() {
                return e.fn[o] = a, l._jQueryInterface
            }, l
        }(jQuery);
    Popper.Defaults.modifiers.computeStyle.gpuAcceleration = !1;
    (function(t) {
        var e = 'bootstrapMaterialDesign',
            n = 'bmd.' + e,
            o = e,
            a = t.fn[o],
            r = {
                global: {
                    validate: !1,
                    label: {
                        className: 'bmd-label-static'
                    }
                },
                autofill: {
                    selector: 'body'
                },
                checkbox: {
                    selector: '.checkbox > label > input[type=checkbox]'
                },
                checkboxInline: {
                    selector: 'label.checkbox-inline > input[type=checkbox]'
                },
                collapseInline: {
                    selector: '.bmd-collapse-inline [data-toggle="collapse"]'
                },
                drawer: {
                    selector: '.bmd-layout-drawer'
                },
                file: {
                    selector: 'input[type=file]'
                },
                radio: {
                    selector: '.radio > label > input[type=radio]'
                },
                radioInline: {
                    selector: 'label.radio-inline > input[type=radio]'
                },
                ripples: {
                    selector: ['.btn:not(.ripple-none)', '.card-image:not(.ripple-none)', '.navbar a:not(.ripple-none)', '.dropdown-menu a:not(.ripple-none)', '.nav-tabs a:not(.ripple-none)', '.pagination li:not(.active):not(.disabled) a:not(.ripple-none)', '.ripple']
                },
                select: {
                    selector: ['select']
                },
                switch: {
                    selector: '.switch > label > input[type=checkbox]'
                },
                text: {
                    selector: ['input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=button]):not([type=submit]):not([type=reset])']
                },
                textarea: {
                    selector: ['textarea']
                },
                arrive: !0,
                instantiation: ['ripples', 'checkbox', 'checkboxInline', 'collapseInline', 'drawer', 'radio', 'radioInline', 'switch', 'text', 'textarea', 'autofill']
            },
            i = function() {
                function e(e, n) {
                    var o = this;
                    this.$element = e, this.config = t.extend(!0, {}, r, n);
                    for (var a = t(document), i = function(e) {
                            var n = o.config[e];
                            if (n) {
                                var r = o._resolveSelector(n);
                                n = t.extend(!0, {}, o.config.global, n);
                                var i = '' + (e.charAt(0).toUpperCase() + e.slice(1)),
                                    l = 'bmd' + i;
                                try {
                                    t(r)[l](n), document.arrive && o.config.arrive && a.arrive(r, function() {
                                        t(this)[l](n)
                                    })
                                } catch (o) {
                                    var s = 'Failed to instantiate component: $(\'' + r + '\')[' + l + '](' + n + ')';
                                    throw console.error(s, o, '\nSelected elements: ', t(r)), o
                                }
                            }
                        }, l = this.config.instantiation, s = Array.isArray(l), d = 0, l = s ? l : l[Symbol.iterator]();;) {
                        var c;
                        if (s) {
                            if (d >= l.length) break;
                            c = l[d++]
                        } else {
                            if (d = l.next(), d.done) break;
                            c = d.value
                        }
                        var _ = c;
                        i(_)
                    }
                }
                var o = e.prototype;
                return o.dispose = function() {
                    this.$element.data(n, null), this.$element = null, this.config = null
                }, o._resolveSelector = function(e) {
                    var t = e.selector;
                    return Array.isArray(t) && (t = t.join(', ')), t
                }, e._jQueryInterface = function(o) {
                    return this.each(function() {
                        var a = t(this),
                            r = a.data(n);
                        r || (r = new e(a, o), a.data(n, r))
                    })
                }, e
            }();
        return t.fn[o] = i._jQueryInterface, t.fn[o].Constructor = i, t.fn[o].noConflict = function() {
            return t.fn[o] = a, i._jQueryInterface
        }, i
    })(jQuery)
});
(function() {
  var context = this;

  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(context);

  var ActionCable = context.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
/*! jQuery v3.2.1 | (c) JS Foundation and other contributors | jquery.org/license */
 ! function(a, b) {
    "use strict";
    "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function(a) {
        if (!a.document) throw new Error("jQuery requires a window with a document");
        return b(a)
    } : b(a)
}("undefined" != typeof window ? window : this, function(a, b) {
    "use strict";
    var c = [],
        d = a.document,
        e = Object.getPrototypeOf,
        f = c.slice,
        g = c.concat,
        h = c.push,
        i = c.indexOf,
        j = {},
        k = j.toString,
        l = j.hasOwnProperty,
        m = l.toString,
        n = m.call(Object),
        o = {};

    function p(a, b) {
        b = b || d;
        var c = b.createElement("script");
        c.text = a, b.head.appendChild(c).parentNode.removeChild(c)
    }
    var q = "3.2.1",
        r = function(a, b) {
            return new r.fn.init(a, b)
        },
        s = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
        t = /^-ms-/,
        u = /-([a-z])/g,
        v = function(a, b) {
            return b.toUpperCase()
        };
    r.fn = r.prototype = {
        jquery: q,
        constructor: r,
        length: 0,
        toArray: function() {
            return f.call(this)
        },
        get: function(a) {
            return null == a ? f.call(this) : a < 0 ? this[a + this.length] : this[a]
        },
        pushStack: function(a) {
            var b = r.merge(this.constructor(), a);
            return b.prevObject = this, b
        },
        each: function(a) {
            return r.each(this, a)
        },
        map: function(a) {
            return this.pushStack(r.map(this, function(b, c) {
                return a.call(b, c, b)
            }))
        },
        slice: function() {
            return this.pushStack(f.apply(this, arguments))
        },
        first: function() {
            return this.eq(0)
        },
        last: function() {
            return this.eq(-1)
        },
        eq: function(a) {
            var b = this.length,
                c = +a + (a < 0 ? b : 0);
            return this.pushStack(c >= 0 && c < b ? [this[c]] : [])
        },
        end: function() {
            return this.prevObject || this.constructor()
        },
        push: h,
        sort: c.sort,
        splice: c.splice
    }, r.extend = r.fn.extend = function() {
        var a, b, c, d, e, f, g = arguments[0] || {},
            h = 1,
            i = arguments.length,
            j = !1;
        for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || r.isFunction(g) || (g = {}), h === i && (g = this, h--); h < i; h++)
            if (null != (a = arguments[h]))
                for (b in a) c = g[b], d = a[b], g !== d && (j && d && (r.isPlainObject(d) || (e = Array.isArray(d))) ? (e ? (e = !1, f = c && Array.isArray(c) ? c : []) : f = c && r.isPlainObject(c) ? c : {}, g[b] = r.extend(j, f, d)) : void 0 !== d && (g[b] = d));
        return g
    }, r.extend({
        expando: "jQuery" + (q + Math.random()).replace(/\D/g, ""),
        isReady: !0,
        error: function(a) {
            throw new Error(a)
        },
        noop: function() {},
        isFunction: function(a) {
            return "function" === r.type(a)
        },
        isWindow: function(a) {
            return null != a && a === a.window
        },
        isNumeric: function(a) {
            var b = r.type(a);
            return ("number" === b || "string" === b) && !isNaN(a - parseFloat(a))
        },
        isPlainObject: function(a) {
            var b, c;
            return !(!a || "[object Object]" !== k.call(a)) && (!(b = e(a)) || (c = l.call(b, "constructor") && b.constructor, "function" == typeof c && m.call(c) === n))
        },
        isEmptyObject: function(a) {
            var b;
            for (b in a) return !1;
            return !0
        },
        type: function(a) {
            return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? j[k.call(a)] || "object" : typeof a
        },
        globalEval: function(a) {
            p(a)
        },
        camelCase: function(a) {
            return a.replace(t, "ms-").replace(u, v)
        },
        each: function(a, b) {
            var c, d = 0;
            if (w(a)) {
                for (c = a.length; d < c; d++)
                    if (b.call(a[d], d, a[d]) === !1) break
            } else
                for (d in a)
                    if (b.call(a[d], d, a[d]) === !1) break;
            return a
        },
        trim: function(a) {
            return null == a ? "" : (a + "").replace(s, "")
        },
        makeArray: function(a, b) {
            var c = b || [];
            return null != a && (w(Object(a)) ? r.merge(c, "string" == typeof a ? [a] : a) : h.call(c, a)), c
        },
        inArray: function(a, b, c) {
            return null == b ? -1 : i.call(b, a, c)
        },
        merge: function(a, b) {
            for (var c = +b.length, d = 0, e = a.length; d < c; d++) a[e++] = b[d];
            return a.length = e, a
        },
        grep: function(a, b, c) {
            for (var d, e = [], f = 0, g = a.length, h = !c; f < g; f++) d = !b(a[f], f), d !== h && e.push(a[f]);
            return e
        },
        map: function(a, b, c) {
            var d, e, f = 0,
                h = [];
            if (w(a))
                for (d = a.length; f < d; f++) e = b(a[f], f, c), null != e && h.push(e);
            else
                for (f in a) e = b(a[f], f, c), null != e && h.push(e);
            return g.apply([], h)
        },
        guid: 1,
        proxy: function(a, b) {
            var c, d, e;
            if ("string" == typeof b && (c = a[b], b = a, a = c), r.isFunction(a)) return d = f.call(arguments, 2), e = function() {
                return a.apply(b || this, d.concat(f.call(arguments)))
            }, e.guid = a.guid = a.guid || r.guid++, e
        },
        now: Date.now,
        support: o
    }), "function" == typeof Symbol && (r.fn[Symbol.iterator] = c[Symbol.iterator]), r.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(a, b) {
        j["[object " + b + "]"] = b.toLowerCase()
    });

    function w(a) {
        var b = !!a && "length" in a && a.length,
            c = r.type(a);
        return "function" !== c && !r.isWindow(a) && ("array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a)
    }
    var x = function(a) {
        var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = "sizzle" + 1 * new Date,
            v = a.document,
            w = 0,
            x = 0,
            y = ha(),
            z = ha(),
            A = ha(),
            B = function(a, b) {
                return a === b && (l = !0), 0
            },
            C = {}.hasOwnProperty,
            D = [],
            E = D.pop,
            F = D.push,
            G = D.push,
            H = D.slice,
            I = function(a, b) {
                for (var c = 0, d = a.length; c < d; c++)
                    if (a[c] === b) return c;
                return -1
            },
            J = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
            K = "[\\x20\\t\\r\\n\\f]",
            L = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",
            M = "\\[" + K + "*(" + L + ")(?:" + K + "*([*^$|!~]?=)" + K + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + L + "))|)" + K + "*\\]",
            N = ":(" + L + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + M + ")*)|.*)\\)|)",
            O = new RegExp(K + "+", "g"),
            P = new RegExp("^" + K + "+|((?:^|[^\\\\])(?:\\\\.)*)" + K + "+$", "g"),
            Q = new RegExp("^" + K + "*," + K + "*"),
            R = new RegExp("^" + K + "*([>+~]|" + K + ")" + K + "*"),
            S = new RegExp("=" + K + "*([^\\]'\"]*?)" + K + "*\\]", "g"),
            T = new RegExp(N),
            U = new RegExp("^" + L + "$"),
            V = {
                ID: new RegExp("^#(" + L + ")"),
                CLASS: new RegExp("^\\.(" + L + ")"),
                TAG: new RegExp("^(" + L + "|[*])"),
                ATTR: new RegExp("^" + M),
                PSEUDO: new RegExp("^" + N),
                CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + K + "*(even|odd|(([+-]|)(\\d*)n|)" + K + "*(?:([+-]|)" + K + "*(\\d+)|))" + K + "*\\)|)", "i"),
                bool: new RegExp("^(?:" + J + ")$", "i"),
                needsContext: new RegExp("^" + K + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + K + "*((?:-\\d)?\\d*)" + K + "*\\)|)(?=[^-]|$)", "i")
            },
            W = /^(?:input|select|textarea|button)$/i,
            X = /^h\d$/i,
            Y = /^[^{]+\{\s*\[native \w/,
            Z = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
            $ = /[+~]/,
            _ = new RegExp("\\\\([\\da-f]{1,6}" + K + "?|(" + K + ")|.)", "ig"),
            aa = function(a, b, c) {
                var d = "0x" + b - 65536;
                return d !== d || c ? b : d < 0 ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320)
            },
            ba = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
            ca = function(a, b) {
                return b ? "\0" === a ? "\ufffd" : a.slice(0, -1) + "\\" + a.charCodeAt(a.length - 1).toString(16) + " " : "\\" + a
            },
            da = function() {
                m()
            },
            ea = ta(function(a) {
                return a.disabled === !0 && ("form" in a || "label" in a)
            }, {
                dir: "parentNode",
                next: "legend"
            });
        try {
            G.apply(D = H.call(v.childNodes), v.childNodes), D[v.childNodes.length].nodeType
        } catch (fa) {
            G = {
                apply: D.length ? function(a, b) {
                    F.apply(a, H.call(b))
                } : function(a, b) {
                    var c = a.length,
                        d = 0;
                    while (a[c++] = b[d++]);
                    a.length = c - 1
                }
            }
        }

        function ga(a, b, d, e) {
            var f, h, j, k, l, o, r, s = b && b.ownerDocument,
                w = b ? b.nodeType : 9;
            if (d = d || [], "string" != typeof a || !a || 1 !== w && 9 !== w && 11 !== w) return d;
            if (!e && ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, p)) {
                if (11 !== w && (l = Z.exec(a)))
                    if (f = l[1]) {
                        if (9 === w) {
                            if (!(j = b.getElementById(f))) return d;
                            if (j.id === f) return d.push(j), d
                        } else if (s && (j = s.getElementById(f)) && t(b, j) && j.id === f) return d.push(j), d
                    } else {
                        if (l[2]) return G.apply(d, b.getElementsByTagName(a)), d;
                        if ((f = l[3]) && c.getElementsByClassName && b.getElementsByClassName) return G.apply(d, b.getElementsByClassName(f)), d
                    }
                if (c.qsa && !A[a + " "] && (!q || !q.test(a))) {
                    if (1 !== w) s = b, r = a;
                    else if ("object" !== b.nodeName.toLowerCase()) {
                        (k = b.getAttribute("id")) ? k = k.replace(ba, ca): b.setAttribute("id", k = u), o = g(a), h = o.length;
                        while (h--) o[h] = "#" + k + " " + sa(o[h]);
                        r = o.join(","), s = $.test(a) && qa(b.parentNode) || b
                    }
                    if (r) try {
                        return G.apply(d, s.querySelectorAll(r)), d
                    } catch (x) {} finally {
                        k === u && b.removeAttribute("id")
                    }
                }
            }
            return i(a.replace(P, "$1"), b, d, e)
        }

        function ha() {
            var a = [];

            function b(c, e) {
                return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e
            }
            return b
        }

        function ia(a) {
            return a[u] = !0, a
        }

        function ja(a) {
            var b = n.createElement("fieldset");
            try {
                return !!a(b)
            } catch (c) {
                return !1
            } finally {
                b.parentNode && b.parentNode.removeChild(b), b = null
            }
        }

        function ka(a, b) {
            var c = a.split("|"),
                e = c.length;
            while (e--) d.attrHandle[c[e]] = b
        }

        function la(a, b) {
            var c = b && a,
                d = c && 1 === a.nodeType && 1 === b.nodeType && a.sourceIndex - b.sourceIndex;
            if (d) return d;
            if (c)
                while (c = c.nextSibling)
                    if (c === b) return -1;
            return a ? 1 : -1
        }

        function ma(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return "input" === c && b.type === a
            }
        }

        function na(a) {
            return function(b) {
                var c = b.nodeName.toLowerCase();
                return ("input" === c || "button" === c) && b.type === a
            }
        }

        function oa(a) {
            return function(b) {
                return "form" in b ? b.parentNode && b.disabled === !1 ? "label" in b ? "label" in b.parentNode ? b.parentNode.disabled === a : b.disabled === a : b.isDisabled === a || b.isDisabled !== !a && ea(b) === a : b.disabled === a : "label" in b && b.disabled === a
            }
        }

        function pa(a) {
            return ia(function(b) {
                return b = +b, ia(function(c, d) {
                    var e, f = a([], c.length, b),
                        g = f.length;
                    while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e]))
                })
            })
        }

        function qa(a) {
            return a && "undefined" != typeof a.getElementsByTagName && a
        }
        c = ga.support = {}, f = ga.isXML = function(a) {
            var b = a && (a.ownerDocument || a).documentElement;
            return !!b && "HTML" !== b.nodeName
        }, m = ga.setDocument = function(a) {
            var b, e, g = a ? a.ownerDocument || a : v;
            return g !== n && 9 === g.nodeType && g.documentElement ? (n = g, o = n.documentElement, p = !f(n), v !== n && (e = n.defaultView) && e.top !== e && (e.addEventListener ? e.addEventListener("unload", da, !1) : e.attachEvent && e.attachEvent("onunload", da)), c.attributes = ja(function(a) {
                return a.className = "i", !a.getAttribute("className")
            }), c.getElementsByTagName = ja(function(a) {
                return a.appendChild(n.createComment("")), !a.getElementsByTagName("*").length
            }), c.getElementsByClassName = Y.test(n.getElementsByClassName), c.getById = ja(function(a) {
                return o.appendChild(a).id = u, !n.getElementsByName || !n.getElementsByName(u).length
            }), c.getById ? (d.filter.ID = function(a) {
                var b = a.replace(_, aa);
                return function(a) {
                    return a.getAttribute("id") === b
                }
            }, d.find.ID = function(a, b) {
                if ("undefined" != typeof b.getElementById && p) {
                    var c = b.getElementById(a);
                    return c ? [c] : []
                }
            }) : (d.filter.ID = function(a) {
                var b = a.replace(_, aa);
                return function(a) {
                    var c = "undefined" != typeof a.getAttributeNode && a.getAttributeNode("id");
                    return c && c.value === b
                }
            }, d.find.ID = function(a, b) {
                if ("undefined" != typeof b.getElementById && p) {
                    var c, d, e, f = b.getElementById(a);
                    if (f) {
                        if (c = f.getAttributeNode("id"), c && c.value === a) return [f];
                        e = b.getElementsByName(a), d = 0;
                        while (f = e[d++])
                            if (c = f.getAttributeNode("id"), c && c.value === a) return [f]
                    }
                    return []
                }
            }), d.find.TAG = c.getElementsByTagName ? function(a, b) {
                return "undefined" != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0
            } : function(a, b) {
                var c, d = [],
                    e = 0,
                    f = b.getElementsByTagName(a);
                if ("*" === a) {
                    while (c = f[e++]) 1 === c.nodeType && d.push(c);
                    return d
                }
                return f
            }, d.find.CLASS = c.getElementsByClassName && function(a, b) {
                if ("undefined" != typeof b.getElementsByClassName && p) return b.getElementsByClassName(a)
            }, r = [], q = [], (c.qsa = Y.test(n.querySelectorAll)) && (ja(function(a) {
                o.appendChild(a).innerHTML = "<a id='" + u + "'></a><select id='" + u + "-\r\\' msallowcapture=''><option selected=''></option></select>", a.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + K + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || q.push("\\[" + K + "*(?:value|" + J + ")"), a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="), a.querySelectorAll(":checked").length || q.push(":checked"), a.querySelectorAll("a#" + u + "+*").length || q.push(".#.+[+~]")
            }), ja(function(a) {
                a.innerHTML = "<a href='' disabled='disabled'></a><select disabled='disabled'><option/></select>";
                var b = n.createElement("input");
                b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + K + "*[*^$|!~]?="), 2 !== a.querySelectorAll(":enabled").length && q.push(":enabled", ":disabled"), o.appendChild(a).disabled = !0, 2 !== a.querySelectorAll(":disabled").length && q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), q.push(",.*:")
            })), (c.matchesSelector = Y.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && ja(function(a) {
                c.disconnectedMatch = s.call(a, "*"), s.call(a, "[s!='']:x"), r.push("!=", N)
            }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), b = Y.test(o.compareDocumentPosition), t = b || Y.test(o.contains) ? function(a, b) {
                var c = 9 === a.nodeType ? a.documentElement : a,
                    d = b && b.parentNode;
                return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)))
            } : function(a, b) {
                if (b)
                    while (b = b.parentNode)
                        if (b === a) return !0;
                return !1
            }, B = b ? function(a, b) {
                if (a === b) return l = !0, 0;
                var d = !a.compareDocumentPosition - !b.compareDocumentPosition;
                return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === n || a.ownerDocument === v && t(v, a) ? -1 : b === n || b.ownerDocument === v && t(v, b) ? 1 : k ? I(k, a) - I(k, b) : 0 : 4 & d ? -1 : 1)
            } : function(a, b) {
                if (a === b) return l = !0, 0;
                var c, d = 0,
                    e = a.parentNode,
                    f = b.parentNode,
                    g = [a],
                    h = [b];
                if (!e || !f) return a === n ? -1 : b === n ? 1 : e ? -1 : f ? 1 : k ? I(k, a) - I(k, b) : 0;
                if (e === f) return la(a, b);
                c = a;
                while (c = c.parentNode) g.unshift(c);
                c = b;
                while (c = c.parentNode) h.unshift(c);
                while (g[d] === h[d]) d++;
                return d ? la(g[d], h[d]) : g[d] === v ? -1 : h[d] === v ? 1 : 0
            }, n) : n
        }, ga.matches = function(a, b) {
            return ga(a, null, null, b)
        }, ga.matchesSelector = function(a, b) {
            if ((a.ownerDocument || a) !== n && m(a), b = b.replace(S, "='$1']"), c.matchesSelector && p && !A[b + " "] && (!r || !r.test(b)) && (!q || !q.test(b))) try {
                var d = s.call(a, b);
                if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d
            } catch (e) {}
            return ga(b, n, null, [a]).length > 0
        }, ga.contains = function(a, b) {
            return (a.ownerDocument || a) !== n && m(a), t(a, b)
        }, ga.attr = function(a, b) {
            (a.ownerDocument || a) !== n && m(a);
            var e = d.attrHandle[b.toLowerCase()],
                f = e && C.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;
            return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null
        }, ga.escape = function(a) {
            return (a + "").replace(ba, ca)
        }, ga.error = function(a) {
            throw new Error("Syntax error, unrecognized expression: " + a)
        }, ga.uniqueSort = function(a) {
            var b, d = [],
                e = 0,
                f = 0;
            if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) {
                while (b = a[f++]) b === a[f] && (e = d.push(f));
                while (e--) a.splice(d[e], 1)
            }
            return k = null, a
        }, e = ga.getText = function(a) {
            var b, c = "",
                d = 0,
                f = a.nodeType;
            if (f) {
                if (1 === f || 9 === f || 11 === f) {
                    if ("string" == typeof a.textContent) return a.textContent;
                    for (a = a.firstChild; a; a = a.nextSibling) c += e(a)
                } else if (3 === f || 4 === f) return a.nodeValue
            } else
                while (b = a[d++]) c += e(b);
            return c
        }, d = ga.selectors = {
            cacheLength: 50,
            createPseudo: ia,
            match: V,
            attrHandle: {},
            find: {},
            relative: {
                ">": {
                    dir: "parentNode",
                    first: !0
                },
                " ": {
                    dir: "parentNode"
                },
                "+": {
                    dir: "previousSibling",
                    first: !0
                },
                "~": {
                    dir: "previousSibling"
                }
            },
            preFilter: {
                ATTR: function(a) {
                    return a[1] = a[1].replace(_, aa), a[3] = (a[3] || a[4] || a[5] || "").replace(_, aa), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4)
                },
                CHILD: function(a) {
                    return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || ga.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && ga.error(a[0]), a
                },
                PSEUDO: function(a) {
                    var b, c = !a[6] && a[2];
                    return V.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && T.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3))
                }
            },
            filter: {
                TAG: function(a) {
                    var b = a.replace(_, aa).toLowerCase();
                    return "*" === a ? function() {
                        return !0
                    } : function(a) {
                        return a.nodeName && a.nodeName.toLowerCase() === b
                    }
                },
                CLASS: function(a) {
                    var b = y[a + " "];
                    return b || (b = new RegExp("(^|" + K + ")" + a + "(" + K + "|$)")) && y(a, function(a) {
                        return b.test("string" == typeof a.className && a.className || "undefined" != typeof a.getAttribute && a.getAttribute("class") || "")
                    })
                },
                ATTR: function(a, b, c) {
                    return function(d) {
                        var e = ga.attr(d, a);
                        return null == e ? "!=" === b : !b || (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e.replace(O, " ") + " ").indexOf(c) > -1 : "|=" === b && (e === c || e.slice(0, c.length + 1) === c + "-"))
                    }
                },
                CHILD: function(a, b, c, d, e) {
                    var f = "nth" !== a.slice(0, 3),
                        g = "last" !== a.slice(-4),
                        h = "of-type" === b;
                    return 1 === d && 0 === e ? function(a) {
                        return !!a.parentNode
                    } : function(b, c, i) {
                        var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling",
                            q = b.parentNode,
                            r = h && b.nodeName.toLowerCase(),
                            s = !i && !h,
                            t = !1;
                        if (q) {
                            if (f) {
                                while (p) {
                                    m = b;
                                    while (m = m[p])
                                        if (h ? m.nodeName.toLowerCase() === r : 1 === m.nodeType) return !1;
                                    o = p = "only" === a && !o && "nextSibling"
                                }
                                return !0
                            }
                            if (o = [g ? q.firstChild : q.lastChild], g && s) {
                                m = q, l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), j = k[a] || [], n = j[0] === w && j[1], t = n && j[2], m = n && q.childNodes[n];
                                while (m = ++n && m && m[p] || (t = n = 0) || o.pop())
                                    if (1 === m.nodeType && ++t && m === b) {
                                        k[a] = [w, n, t];
                                        break
                                    }
                            } else if (s && (m = b, l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), j = k[a] || [], n = j[0] === w && j[1], t = n), t === !1)
                                while (m = ++n && m && m[p] || (t = n = 0) || o.pop())
                                    if ((h ? m.nodeName.toLowerCase() === r : 1 === m.nodeType) && ++t && (s && (l = m[u] || (m[u] = {}), k = l[m.uniqueID] || (l[m.uniqueID] = {}), k[a] = [w, t]), m === b)) break;
                            return t -= e, t === d || t % d === 0 && t / d >= 0
                        }
                    }
                },
                PSEUDO: function(a, b) {
                    var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || ga.error("unsupported pseudo: " + a);
                    return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? ia(function(a, c) {
                        var d, f = e(a, b),
                            g = f.length;
                        while (g--) d = I(a, f[g]), a[d] = !(c[d] = f[g])
                    }) : function(a) {
                        return e(a, 0, c)
                    }) : e
                }
            },
            pseudos: {
                not: ia(function(a) {
                    var b = [],
                        c = [],
                        d = h(a.replace(P, "$1"));
                    return d[u] ? ia(function(a, b, c, e) {
                        var f, g = d(a, null, e, []),
                            h = a.length;
                        while (h--)(f = g[h]) && (a[h] = !(b[h] = f))
                    }) : function(a, e, f) {
                        return b[0] = a, d(b, null, f, c), b[0] = null, !c.pop()
                    }
                }),
                has: ia(function(a) {
                    return function(b) {
                        return ga(a, b).length > 0
                    }
                }),
                contains: ia(function(a) {
                    return a = a.replace(_, aa),
                        function(b) {
                            return (b.textContent || b.innerText || e(b)).indexOf(a) > -1
                        }
                }),
                lang: ia(function(a) {
                    return U.test(a || "") || ga.error("unsupported lang: " + a), a = a.replace(_, aa).toLowerCase(),
                        function(b) {
                            var c;
                            do
                                if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType);
                            return !1
                        }
                }),
                target: function(b) {
                    var c = a.location && a.location.hash;
                    return c && c.slice(1) === b.id
                },
                root: function(a) {
                    return a === o
                },
                focus: function(a) {
                    return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex)
                },
                enabled: oa(!1),
                disabled: oa(!0),
                checked: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return "input" === b && !!a.checked || "option" === b && !!a.selected
                },
                selected: function(a) {
                    return a.parentNode && a.parentNode.selectedIndex, a.selected === !0
                },
                empty: function(a) {
                    for (a = a.firstChild; a; a = a.nextSibling)
                        if (a.nodeType < 6) return !1;
                    return !0
                },
                parent: function(a) {
                    return !d.pseudos.empty(a)
                },
                header: function(a) {
                    return X.test(a.nodeName)
                },
                input: function(a) {
                    return W.test(a.nodeName)
                },
                button: function(a) {
                    var b = a.nodeName.toLowerCase();
                    return "input" === b && "button" === a.type || "button" === b
                },
                text: function(a) {
                    var b;
                    return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase())
                },
                first: pa(function() {
                    return [0]
                }),
                last: pa(function(a, b) {
                    return [b - 1]
                }),
                eq: pa(function(a, b, c) {
                    return [c < 0 ? c + b : c]
                }),
                even: pa(function(a, b) {
                    for (var c = 0; c < b; c += 2) a.push(c);
                    return a
                }),
                odd: pa(function(a, b) {
                    for (var c = 1; c < b; c += 2) a.push(c);
                    return a
                }),
                lt: pa(function(a, b, c) {
                    for (var d = c < 0 ? c + b : c; --d >= 0;) a.push(d);
                    return a
                }),
                gt: pa(function(a, b, c) {
                    for (var d = c < 0 ? c + b : c; ++d < b;) a.push(d);
                    return a
                })
            }
        }, d.pseudos.nth = d.pseudos.eq;
        for (b in {
                radio: !0,
                checkbox: !0,
                file: !0,
                password: !0,
                image: !0
            }) d.pseudos[b] = ma(b);
        for (b in {
                submit: !0,
                reset: !0
            }) d.pseudos[b] = na(b);

        function ra() {}
        ra.prototype = d.filters = d.pseudos, d.setFilters = new ra, g = ga.tokenize = function(a, b) {
            var c, e, f, g, h, i, j, k = z[a + " "];
            if (k) return b ? 0 : k.slice(0);
            h = a, i = [], j = d.preFilter;
            while (h) {
                c && !(e = Q.exec(h)) || (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = R.exec(h)) && (c = e.shift(), f.push({
                    value: c,
                    type: e[0].replace(P, " ")
                }), h = h.slice(c.length));
                for (g in d.filter) !(e = V[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({
                    value: c,
                    type: g,
                    matches: e
                }), h = h.slice(c.length));
                if (!c) break
            }
            return b ? h.length : h ? ga.error(a) : z(a, i).slice(0)
        };

        function sa(a) {
            for (var b = 0, c = a.length, d = ""; b < c; b++) d += a[b].value;
            return d
        }

        function ta(a, b, c) {
            var d = b.dir,
                e = b.next,
                f = e || d,
                g = c && "parentNode" === f,
                h = x++;
            return b.first ? function(b, c, e) {
                while (b = b[d])
                    if (1 === b.nodeType || g) return a(b, c, e);
                return !1
            } : function(b, c, i) {
                var j, k, l, m = [w, h];
                if (i) {
                    while (b = b[d])
                        if ((1 === b.nodeType || g) && a(b, c, i)) return !0
                } else
                    while (b = b[d])
                        if (1 === b.nodeType || g)
                            if (l = b[u] || (b[u] = {}), k = l[b.uniqueID] || (l[b.uniqueID] = {}), e && e === b.nodeName.toLowerCase()) b = b[d] || b;
                            else {
                                if ((j = k[f]) && j[0] === w && j[1] === h) return m[2] = j[2];
                                if (k[f] = m, m[2] = a(b, c, i)) return !0
                            } return !1
            }
        }

        function ua(a) {
            return a.length > 1 ? function(b, c, d) {
                var e = a.length;
                while (e--)
                    if (!a[e](b, c, d)) return !1;
                return !0
            } : a[0]
        }

        function va(a, b, c) {
            for (var d = 0, e = b.length; d < e; d++) ga(a, b[d], c);
            return c
        }

        function wa(a, b, c, d, e) {
            for (var f, g = [], h = 0, i = a.length, j = null != b; h < i; h++)(f = a[h]) && (c && !c(f, d, e) || (g.push(f), j && b.push(h)));
            return g
        }

        function xa(a, b, c, d, e, f) {
            return d && !d[u] && (d = xa(d)), e && !e[u] && (e = xa(e, f)), ia(function(f, g, h, i) {
                var j, k, l, m = [],
                    n = [],
                    o = g.length,
                    p = f || va(b || "*", h.nodeType ? [h] : h, []),
                    q = !a || !f && b ? p : wa(p, m, a, h, i),
                    r = c ? e || (f ? a : o || d) ? [] : g : q;
                if (c && c(q, r, h, i), d) {
                    j = wa(r, n), d(j, [], h, i), k = j.length;
                    while (k--)(l = j[k]) && (r[n[k]] = !(q[n[k]] = l))
                }
                if (f) {
                    if (e || a) {
                        if (e) {
                            j = [], k = r.length;
                            while (k--)(l = r[k]) && j.push(q[k] = l);
                            e(null, r = [], j, i)
                        }
                        k = r.length;
                        while (k--)(l = r[k]) && (j = e ? I(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l))
                    }
                } else r = wa(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : G.apply(g, r)
            })
        }

        function ya(a) {
            for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = ta(function(a) {
                    return a === b
                }, h, !0), l = ta(function(a) {
                    return I(b, a) > -1
                }, h, !0), m = [function(a, c, d) {
                    var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d));
                    return b = null, e
                }]; i < f; i++)
                if (c = d.relative[a[i].type]) m = [ta(ua(m), c)];
                else {
                    if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) {
                        for (e = ++i; e < f; e++)
                            if (d.relative[a[e].type]) break;
                        return xa(i > 1 && ua(m), i > 1 && sa(a.slice(0, i - 1).concat({
                            value: " " === a[i - 2].type ? "*" : ""
                        })).replace(P, "$1"), c, i < e && ya(a.slice(i, e)), e < f && ya(a = a.slice(e)), e < f && sa(a))
                    }
                    m.push(c)
                }
            return ua(m)
        }

        function za(a, b) {
            var c = b.length > 0,
                e = a.length > 0,
                f = function(f, g, h, i, k) {
                    var l, o, q, r = 0,
                        s = "0",
                        t = f && [],
                        u = [],
                        v = j,
                        x = f || e && d.find.TAG("*", k),
                        y = w += null == v ? 1 : Math.random() || .1,
                        z = x.length;
                    for (k && (j = g === n || g || k); s !== z && null != (l = x[s]); s++) {
                        if (e && l) {
                            o = 0, g || l.ownerDocument === n || (m(l), h = !p);
                            while (q = a[o++])
                                if (q(l, g || n, h)) {
                                    i.push(l);
                                    break
                                }
                            k && (w = y)
                        }
                        c && ((l = !q && l) && r--, f && t.push(l))
                    }
                    if (r += s, c && s !== r) {
                        o = 0;
                        while (q = b[o++]) q(t, u, g, h);
                        if (f) {
                            if (r > 0)
                                while (s--) t[s] || u[s] || (u[s] = E.call(i));
                            u = wa(u)
                        }
                        G.apply(i, u), k && !f && u.length > 0 && r + b.length > 1 && ga.uniqueSort(i)
                    }
                    return k && (w = y, j = v), t
                };
            return c ? ia(f) : f
        }
        return h = ga.compile = function(a, b) {
            var c, d = [],
                e = [],
                f = A[a + " "];
            if (!f) {
                b || (b = g(a)), c = b.length;
                while (c--) f = ya(b[c]), f[u] ? d.push(f) : e.push(f);
                f = A(a, za(e, d)), f.selector = a
            }
            return f
        }, i = ga.select = function(a, b, c, e) {
            var f, i, j, k, l, m = "function" == typeof a && a,
                n = !e && g(a = m.selector || a);
            if (c = c || [], 1 === n.length) {
                if (i = n[0] = n[0].slice(0), i.length > 2 && "ID" === (j = i[0]).type && 9 === b.nodeType && p && d.relative[i[1].type]) {
                    if (b = (d.find.ID(j.matches[0].replace(_, aa), b) || [])[0], !b) return c;
                    m && (b = b.parentNode), a = a.slice(i.shift().value.length)
                }
                f = V.needsContext.test(a) ? 0 : i.length;
                while (f--) {
                    if (j = i[f], d.relative[k = j.type]) break;
                    if ((l = d.find[k]) && (e = l(j.matches[0].replace(_, aa), $.test(i[0].type) && qa(b.parentNode) || b))) {
                        if (i.splice(f, 1), a = e.length && sa(i), !a) return G.apply(c, e), c;
                        break
                    }
                }
            }
            return (m || h(a, n))(e, b, !p, c, !b || $.test(a) && qa(b.parentNode) || b), c
        }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, m(), c.sortDetached = ja(function(a) {
            return 1 & a.compareDocumentPosition(n.createElement("fieldset"))
        }), ja(function(a) {
            return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href")
        }) || ka("type|href|height|width", function(a, b, c) {
            if (!c) return a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2)
        }), c.attributes && ja(function(a) {
            return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value")
        }) || ka("value", function(a, b, c) {
            if (!c && "input" === a.nodeName.toLowerCase()) return a.defaultValue
        }), ja(function(a) {
            return null == a.getAttribute("disabled")
        }) || ka(J, function(a, b, c) {
            var d;
            if (!c) return a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null
        }), ga
    }(a);
    r.find = x, r.expr = x.selectors, r.expr[":"] = r.expr.pseudos, r.uniqueSort = r.unique = x.uniqueSort, r.text = x.getText, r.isXMLDoc = x.isXML, r.contains = x.contains, r.escapeSelector = x.escape;
    var y = function(a, b, c) {
            var d = [],
                e = void 0 !== c;
            while ((a = a[b]) && 9 !== a.nodeType)
                if (1 === a.nodeType) {
                    if (e && r(a).is(c)) break;
                    d.push(a)
                }
            return d
        },
        z = function(a, b) {
            for (var c = []; a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);
            return c
        },
        A = r.expr.match.needsContext;

    function B(a, b) {
        return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase()
    }
    var C = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i,
        D = /^.[^:#\[\.,]*$/;

    function E(a, b, c) {
        return r.isFunction(b) ? r.grep(a, function(a, d) {
            return !!b.call(a, d, a) !== c
        }) : b.nodeType ? r.grep(a, function(a) {
            return a === b !== c
        }) : "string" != typeof b ? r.grep(a, function(a) {
            return i.call(b, a) > -1 !== c
        }) : D.test(b) ? r.filter(b, a, c) : (b = r.filter(b, a), r.grep(a, function(a) {
            return i.call(b, a) > -1 !== c && 1 === a.nodeType
        }))
    }
    r.filter = function(a, b, c) {
        var d = b[0];
        return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? r.find.matchesSelector(d, a) ? [d] : [] : r.find.matches(a, r.grep(b, function(a) {
            return 1 === a.nodeType
        }))
    }, r.fn.extend({
        find: function(a) {
            var b, c, d = this.length,
                e = this;
            if ("string" != typeof a) return this.pushStack(r(a).filter(function() {
                for (b = 0; b < d; b++)
                    if (r.contains(e[b], this)) return !0
            }));
            for (c = this.pushStack([]), b = 0; b < d; b++) r.find(a, e[b], c);
            return d > 1 ? r.uniqueSort(c) : c
        },
        filter: function(a) {
            return this.pushStack(E(this, a || [], !1))
        },
        not: function(a) {
            return this.pushStack(E(this, a || [], !0))
        },
        is: function(a) {
            return !!E(this, "string" == typeof a && A.test(a) ? r(a) : a || [], !1).length
        }
    });
    var F, G = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
        H = r.fn.init = function(a, b, c) {
            var e, f;
            if (!a) return this;
            if (c = c || F, "string" == typeof a) {
                if (e = "<" === a[0] && ">" === a[a.length - 1] && a.length >= 3 ? [null, a, null] : G.exec(a), !e || !e[1] && b) return !b || b.jquery ? (b || c).find(a) : this.constructor(b).find(a);
                if (e[1]) {
                    if (b = b instanceof r ? b[0] : b, r.merge(this, r.parseHTML(e[1], b && b.nodeType ? b.ownerDocument || b : d, !0)), C.test(e[1]) && r.isPlainObject(b))
                        for (e in b) r.isFunction(this[e]) ? this[e](b[e]) : this.attr(e, b[e]);
                    return this
                }
                return f = d.getElementById(e[2]), f && (this[0] = f, this.length = 1), this
            }
            return a.nodeType ? (this[0] = a, this.length = 1, this) : r.isFunction(a) ? void 0 !== c.ready ? c.ready(a) : a(r) : r.makeArray(a, this)
        };
    H.prototype = r.fn, F = r(d);
    var I = /^(?:parents|prev(?:Until|All))/,
        J = {
            children: !0,
            contents: !0,
            next: !0,
            prev: !0
        };
    r.fn.extend({
        has: function(a) {
            var b = r(a, this),
                c = b.length;
            return this.filter(function() {
                for (var a = 0; a < c; a++)
                    if (r.contains(this, b[a])) return !0
            })
        },
        closest: function(a, b) {
            var c, d = 0,
                e = this.length,
                f = [],
                g = "string" != typeof a && r(a);
            if (!A.test(a))
                for (; d < e; d++)
                    for (c = this[d]; c && c !== b; c = c.parentNode)
                        if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && r.find.matchesSelector(c, a))) {
                            f.push(c);
                            break
                        }
            return this.pushStack(f.length > 1 ? r.uniqueSort(f) : f)
        },
        index: function(a) {
            return a ? "string" == typeof a ? i.call(r(a), this[0]) : i.call(this, a.jquery ? a[0] : a) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
        },
        add: function(a, b) {
            return this.pushStack(r.uniqueSort(r.merge(this.get(), r(a, b))))
        },
        addBack: function(a) {
            return this.add(null == a ? this.prevObject : this.prevObject.filter(a))
        }
    });

    function K(a, b) {
        while ((a = a[b]) && 1 !== a.nodeType);
        return a
    }
    r.each({
        parent: function(a) {
            var b = a.parentNode;
            return b && 11 !== b.nodeType ? b : null
        },
        parents: function(a) {
            return y(a, "parentNode")
        },
        parentsUntil: function(a, b, c) {
            return y(a, "parentNode", c)
        },
        next: function(a) {
            return K(a, "nextSibling")
        },
        prev: function(a) {
            return K(a, "previousSibling")
        },
        nextAll: function(a) {
            return y(a, "nextSibling")
        },
        prevAll: function(a) {
            return y(a, "previousSibling")
        },
        nextUntil: function(a, b, c) {
            return y(a, "nextSibling", c)
        },
        prevUntil: function(a, b, c) {
            return y(a, "previousSibling", c)
        },
        siblings: function(a) {
            return z((a.parentNode || {}).firstChild, a)
        },
        children: function(a) {
            return z(a.firstChild)
        },
        contents: function(a) {
            return B(a, "iframe") ? a.contentDocument : (B(a, "template") && (a = a.content || a), r.merge([], a.childNodes))
        }
    }, function(a, b) {
        r.fn[a] = function(c, d) {
            var e = r.map(this, b, c);
            return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = r.filter(d, e)), this.length > 1 && (J[a] || r.uniqueSort(e), I.test(a) && e.reverse()), this.pushStack(e)
        }
    });
    var L = /[^\x20\t\r\n\f]+/g;

    function M(a) {
        var b = {};
        return r.each(a.match(L) || [], function(a, c) {
            b[c] = !0
        }), b
    }
    r.Callbacks = function(a) {
        a = "string" == typeof a ? M(a) : r.extend({}, a);
        var b, c, d, e, f = [],
            g = [],
            h = -1,
            i = function() {
                for (e = e || a.once, d = b = !0; g.length; h = -1) {
                    c = g.shift();
                    while (++h < f.length) f[h].apply(c[0], c[1]) === !1 && a.stopOnFalse && (h = f.length, c = !1)
                }
                a.memory || (c = !1), b = !1, e && (f = c ? [] : "")
            },
            j = {
                add: function() {
                    return f && (c && !b && (h = f.length - 1, g.push(c)), function d(b) {
                        r.each(b, function(b, c) {
                            r.isFunction(c) ? a.unique && j.has(c) || f.push(c) : c && c.length && "string" !== r.type(c) && d(c)
                        })
                    }(arguments), c && !b && i()), this
                },
                remove: function() {
                    return r.each(arguments, function(a, b) {
                        var c;
                        while ((c = r.inArray(b, f, c)) > -1) f.splice(c, 1), c <= h && h--
                    }), this
                },
                has: function(a) {
                    return a ? r.inArray(a, f) > -1 : f.length > 0
                },
                empty: function() {
                    return f && (f = []), this
                },
                disable: function() {
                    return e = g = [], f = c = "", this
                },
                disabled: function() {
                    return !f
                },
                lock: function() {
                    return e = g = [], c || b || (f = c = ""), this
                },
                locked: function() {
                    return !!e
                },
                fireWith: function(a, c) {
                    return e || (c = c || [], c = [a, c.slice ? c.slice() : c], g.push(c), b || i()), this
                },
                fire: function() {
                    return j.fireWith(this, arguments), this
                },
                fired: function() {
                    return !!d
                }
            };
        return j
    };

    function N(a) {
        return a
    }

    function O(a) {
        throw a
    }

    function P(a, b, c, d) {
        var e;
        try {
            a && r.isFunction(e = a.promise) ? e.call(a).done(b).fail(c) : a && r.isFunction(e = a.then) ? e.call(a, b, c) : b.apply(void 0, [a].slice(d))
        } catch (a) {
            c.apply(void 0, [a])
        }
    }
    r.extend({
        Deferred: function(b) {
            var c = [
                    ["notify", "progress", r.Callbacks("memory"), r.Callbacks("memory"), 2],
                    ["resolve", "done", r.Callbacks("once memory"), r.Callbacks("once memory"), 0, "resolved"],
                    ["reject", "fail", r.Callbacks("once memory"), r.Callbacks("once memory"), 1, "rejected"]
                ],
                d = "pending",
                e = {
                    state: function() {
                        return d
                    },
                    always: function() {
                        return f.done(arguments).fail(arguments), this
                    },
                    "catch": function(a) {
                        return e.then(null, a)
                    },
                    pipe: function() {
                        var a = arguments;
                        return r.Deferred(function(b) {
                            r.each(c, function(c, d) {
                                var e = r.isFunction(a[d[4]]) && a[d[4]];
                                f[d[1]](function() {
                                    var a = e && e.apply(this, arguments);
                                    a && r.isFunction(a.promise) ? a.promise().progress(b.notify).done(b.resolve).fail(b.reject) : b[d[0] + "With"](this, e ? [a] : arguments)
                                })
                            }), a = null
                        }).promise()
                    },
                    then: function(b, d, e) {
                        var f = 0;

                        function g(b, c, d, e) {
                            return function() {
                                var h = this,
                                    i = arguments,
                                    j = function() {
                                        var a, j;
                                        if (!(b < f)) {
                                            if (a = d.apply(h, i), a === c.promise()) throw new TypeError("Thenable self-resolution");
                                            j = a && ("object" == typeof a || "function" == typeof a) && a.then, r.isFunction(j) ? e ? j.call(a, g(f, c, N, e), g(f, c, O, e)) : (f++, j.call(a, g(f, c, N, e), g(f, c, O, e), g(f, c, N, c.notifyWith))) : (d !== N && (h = void 0, i = [a]), (e || c.resolveWith)(h, i))
                                        }
                                    },
                                    k = e ? j : function() {
                                        try {
                                            j()
                                        } catch (a) {
                                            r.Deferred.exceptionHook && r.Deferred.exceptionHook(a, k.stackTrace), b + 1 >= f && (d !== O && (h = void 0, i = [a]), c.rejectWith(h, i))
                                        }
                                    };
                                b ? k() : (r.Deferred.getStackHook && (k.stackTrace = r.Deferred.getStackHook()), a.setTimeout(k))
                            }
                        }
                        return r.Deferred(function(a) {
                            c[0][3].add(g(0, a, r.isFunction(e) ? e : N, a.notifyWith)), c[1][3].add(g(0, a, r.isFunction(b) ? b : N)), c[2][3].add(g(0, a, r.isFunction(d) ? d : O))
                        }).promise()
                    },
                    promise: function(a) {
                        return null != a ? r.extend(a, e) : e
                    }
                },
                f = {};
            return r.each(c, function(a, b) {
                var g = b[2],
                    h = b[5];
                e[b[1]] = g.add, h && g.add(function() {
                    d = h
                }, c[3 - a][2].disable, c[0][2].lock), g.add(b[3].fire), f[b[0]] = function() {
                    return f[b[0] + "With"](this === f ? void 0 : this, arguments), this
                }, f[b[0] + "With"] = g.fireWith
            }), e.promise(f), b && b.call(f, f), f
        },
        when: function(a) {
            var b = arguments.length,
                c = b,
                d = Array(c),
                e = f.call(arguments),
                g = r.Deferred(),
                h = function(a) {
                    return function(c) {
                        d[a] = this, e[a] = arguments.length > 1 ? f.call(arguments) : c, --b || g.resolveWith(d, e)
                    }
                };
            if (b <= 1 && (P(a, g.done(h(c)).resolve, g.reject, !b), "pending" === g.state() || r.isFunction(e[c] && e[c].then))) return g.then();
            while (c--) P(e[c], h(c), g.reject);
            return g.promise()
        }
    });
    var Q = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
    r.Deferred.exceptionHook = function(b, c) {
        a.console && a.console.warn && b && Q.test(b.name) && a.console.warn("jQuery.Deferred exception: " + b.message, b.stack, c)
    }, r.readyException = function(b) {
        a.setTimeout(function() {
            throw b
        })
    };
    var R = r.Deferred();
    r.fn.ready = function(a) {
        return R.then(a)["catch"](function(a) {
            r.readyException(a)
        }), this
    }, r.extend({
        isReady: !1,
        readyWait: 1,
        ready: function(a) {
            (a === !0 ? --r.readyWait : r.isReady) || (r.isReady = !0, a !== !0 && --r.readyWait > 0 || R.resolveWith(d, [r]))
        }
    }), r.ready.then = R.then;

    function S() {
        d.removeEventListener("DOMContentLoaded", S),
            a.removeEventListener("load", S), r.ready()
    }
    "complete" === d.readyState || "loading" !== d.readyState && !d.documentElement.doScroll ? a.setTimeout(r.ready) : (d.addEventListener("DOMContentLoaded", S), a.addEventListener("load", S));
    var T = function(a, b, c, d, e, f, g) {
            var h = 0,
                i = a.length,
                j = null == c;
            if ("object" === r.type(c)) {
                e = !0;
                for (h in c) T(a, b, h, c[h], !0, f, g)
            } else if (void 0 !== d && (e = !0, r.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function(a, b, c) {
                    return j.call(r(a), c)
                })), b))
                for (; h < i; h++) b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));
            return e ? a : j ? b.call(a) : i ? b(a[0], c) : f
        },
        U = function(a) {
            return 1 === a.nodeType || 9 === a.nodeType || !+a.nodeType
        };

    function V() {
        this.expando = r.expando + V.uid++
    }
    V.uid = 1, V.prototype = {
        cache: function(a) {
            var b = a[this.expando];
            return b || (b = {}, U(a) && (a.nodeType ? a[this.expando] = b : Object.defineProperty(a, this.expando, {
                value: b,
                configurable: !0
            }))), b
        },
        set: function(a, b, c) {
            var d, e = this.cache(a);
            if ("string" == typeof b) e[r.camelCase(b)] = c;
            else
                for (d in b) e[r.camelCase(d)] = b[d];
            return e
        },
        get: function(a, b) {
            return void 0 === b ? this.cache(a) : a[this.expando] && a[this.expando][r.camelCase(b)]
        },
        access: function(a, b, c) {
            return void 0 === b || b && "string" == typeof b && void 0 === c ? this.get(a, b) : (this.set(a, b, c), void 0 !== c ? c : b)
        },
        remove: function(a, b) {
            var c, d = a[this.expando];
            if (void 0 !== d) {
                if (void 0 !== b) {
                    Array.isArray(b) ? b = b.map(r.camelCase) : (b = r.camelCase(b), b = b in d ? [b] : b.match(L) || []), c = b.length;
                    while (c--) delete d[b[c]]
                }(void 0 === b || r.isEmptyObject(d)) && (a.nodeType ? a[this.expando] = void 0 : delete a[this.expando])
            }
        },
        hasData: function(a) {
            var b = a[this.expando];
            return void 0 !== b && !r.isEmptyObject(b)
        }
    };
    var W = new V,
        X = new V,
        Y = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
        Z = /[A-Z]/g;

    function $(a) {
        return "true" === a || "false" !== a && ("null" === a ? null : a === +a + "" ? +a : Y.test(a) ? JSON.parse(a) : a)
    }

    function _(a, b, c) {
        var d;
        if (void 0 === c && 1 === a.nodeType)
            if (d = "data-" + b.replace(Z, "-$&").toLowerCase(), c = a.getAttribute(d), "string" == typeof c) {
                try {
                    c = $(c)
                } catch (e) {}
                X.set(a, b, c)
            } else c = void 0;
        return c
    }
    r.extend({
        hasData: function(a) {
            return X.hasData(a) || W.hasData(a)
        },
        data: function(a, b, c) {
            return X.access(a, b, c)
        },
        removeData: function(a, b) {
            X.remove(a, b)
        },
        _data: function(a, b, c) {
            return W.access(a, b, c)
        },
        _removeData: function(a, b) {
            W.remove(a, b)
        }
    }), r.fn.extend({
        data: function(a, b) {
            var c, d, e, f = this[0],
                g = f && f.attributes;
            if (void 0 === a) {
                if (this.length && (e = X.get(f), 1 === f.nodeType && !W.get(f, "hasDataAttrs"))) {
                    c = g.length;
                    while (c--) g[c] && (d = g[c].name, 0 === d.indexOf("data-") && (d = r.camelCase(d.slice(5)), _(f, d, e[d])));
                    W.set(f, "hasDataAttrs", !0)
                }
                return e
            }
            return "object" == typeof a ? this.each(function() {
                X.set(this, a)
            }) : T(this, function(b) {
                var c;
                if (f && void 0 === b) {
                    if (c = X.get(f, a), void 0 !== c) return c;
                    if (c = _(f, a), void 0 !== c) return c
                } else this.each(function() {
                    X.set(this, a, b)
                })
            }, null, b, arguments.length > 1, null, !0)
        },
        removeData: function(a) {
            return this.each(function() {
                X.remove(this, a)
            })
        }
    }), r.extend({
        queue: function(a, b, c) {
            var d;
            if (a) return b = (b || "fx") + "queue", d = W.get(a, b), c && (!d || Array.isArray(c) ? d = W.access(a, b, r.makeArray(c)) : d.push(c)), d || []
        },
        dequeue: function(a, b) {
            b = b || "fx";
            var c = r.queue(a, b),
                d = c.length,
                e = c.shift(),
                f = r._queueHooks(a, b),
                g = function() {
                    r.dequeue(a, b)
                };
            "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire()
        },
        _queueHooks: function(a, b) {
            var c = b + "queueHooks";
            return W.get(a, c) || W.access(a, c, {
                empty: r.Callbacks("once memory").add(function() {
                    W.remove(a, [b + "queue", c])
                })
            })
        }
    }), r.fn.extend({
        queue: function(a, b) {
            var c = 2;
            return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? r.queue(this[0], a) : void 0 === b ? this : this.each(function() {
                var c = r.queue(this, a, b);
                r._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && r.dequeue(this, a)
            })
        },
        dequeue: function(a) {
            return this.each(function() {
                r.dequeue(this, a)
            })
        },
        clearQueue: function(a) {
            return this.queue(a || "fx", [])
        },
        promise: function(a, b) {
            var c, d = 1,
                e = r.Deferred(),
                f = this,
                g = this.length,
                h = function() {
                    --d || e.resolveWith(f, [f])
                };
            "string" != typeof a && (b = a, a = void 0), a = a || "fx";
            while (g--) c = W.get(f[g], a + "queueHooks"), c && c.empty && (d++, c.empty.add(h));
            return h(), e.promise(b)
        }
    });
    var aa = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
        ba = new RegExp("^(?:([+-])=|)(" + aa + ")([a-z%]*)$", "i"),
        ca = ["Top", "Right", "Bottom", "Left"],
        da = function(a, b) {
            return a = b || a, "none" === a.style.display || "" === a.style.display && r.contains(a.ownerDocument, a) && "none" === r.css(a, "display")
        },
        ea = function(a, b, c, d) {
            var e, f, g = {};
            for (f in b) g[f] = a.style[f], a.style[f] = b[f];
            e = c.apply(a, d || []);
            for (f in b) a.style[f] = g[f];
            return e
        };

    function fa(a, b, c, d) {
        var e, f = 1,
            g = 20,
            h = d ? function() {
                return d.cur()
            } : function() {
                return r.css(a, b, "")
            },
            i = h(),
            j = c && c[3] || (r.cssNumber[b] ? "" : "px"),
            k = (r.cssNumber[b] || "px" !== j && +i) && ba.exec(r.css(a, b));
        if (k && k[3] !== j) {
            j = j || k[3], c = c || [], k = +i || 1;
            do f = f || ".5", k /= f, r.style(a, b, k + j); while (f !== (f = h() / i) && 1 !== f && --g)
        }
        return c && (k = +k || +i || 0, e = c[1] ? k + (c[1] + 1) * c[2] : +c[2], d && (d.unit = j, d.start = k, d.end = e)), e
    }
    var ga = {};

    function ha(a) {
        var b, c = a.ownerDocument,
            d = a.nodeName,
            e = ga[d];
        return e ? e : (b = c.body.appendChild(c.createElement(d)), e = r.css(b, "display"), b.parentNode.removeChild(b), "none" === e && (e = "block"), ga[d] = e, e)
    }

    function ia(a, b) {
        for (var c, d, e = [], f = 0, g = a.length; f < g; f++) d = a[f], d.style && (c = d.style.display, b ? ("none" === c && (e[f] = W.get(d, "display") || null, e[f] || (d.style.display = "")), "" === d.style.display && da(d) && (e[f] = ha(d))) : "none" !== c && (e[f] = "none", W.set(d, "display", c)));
        for (f = 0; f < g; f++) null != e[f] && (a[f].style.display = e[f]);
        return a
    }
    r.fn.extend({
        show: function() {
            return ia(this, !0)
        },
        hide: function() {
            return ia(this)
        },
        toggle: function(a) {
            return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function() {
                da(this) ? r(this).show() : r(this).hide()
            })
        }
    });
    var ja = /^(?:checkbox|radio)$/i,
        ka = /<([a-z][^\/\0>\x20\t\r\n\f]+)/i,
        la = /^$|\/(?:java|ecma)script/i,
        ma = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            thead: [1, "<table>", "</table>"],
            col: [2, "<table><colgroup>", "</colgroup></table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            _default: [0, "", ""]
        };
    ma.optgroup = ma.option, ma.tbody = ma.tfoot = ma.colgroup = ma.caption = ma.thead, ma.th = ma.td;

    function na(a, b) {
        var c;
        return c = "undefined" != typeof a.getElementsByTagName ? a.getElementsByTagName(b || "*") : "undefined" != typeof a.querySelectorAll ? a.querySelectorAll(b || "*") : [], void 0 === b || b && B(a, b) ? r.merge([a], c) : c
    }

    function oa(a, b) {
        for (var c = 0, d = a.length; c < d; c++) W.set(a[c], "globalEval", !b || W.get(b[c], "globalEval"))
    }
    var pa = /<|&#?\w+;/;

    function qa(a, b, c, d, e) {
        for (var f, g, h, i, j, k, l = b.createDocumentFragment(), m = [], n = 0, o = a.length; n < o; n++)
            if (f = a[n], f || 0 === f)
                if ("object" === r.type(f)) r.merge(m, f.nodeType ? [f] : f);
                else if (pa.test(f)) {
            g = g || l.appendChild(b.createElement("div")), h = (ka.exec(f) || ["", ""])[1].toLowerCase(), i = ma[h] || ma._default, g.innerHTML = i[1] + r.htmlPrefilter(f) + i[2], k = i[0];
            while (k--) g = g.lastChild;
            r.merge(m, g.childNodes), g = l.firstChild, g.textContent = ""
        } else m.push(b.createTextNode(f));
        l.textContent = "", n = 0;
        while (f = m[n++])
            if (d && r.inArray(f, d) > -1) e && e.push(f);
            else if (j = r.contains(f.ownerDocument, f), g = na(l.appendChild(f), "script"), j && oa(g), c) {
            k = 0;
            while (f = g[k++]) la.test(f.type || "") && c.push(f)
        }
        return l
    }! function() {
        var a = d.createDocumentFragment(),
            b = a.appendChild(d.createElement("div")),
            c = d.createElement("input");
        c.setAttribute("type", "radio"), c.setAttribute("checked", "checked"), c.setAttribute("name", "t"), b.appendChild(c), o.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, b.innerHTML = "<textarea>x</textarea>", o.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue
    }();
    var ra = d.documentElement,
        sa = /^key/,
        ta = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
        ua = /^([^.]*)(?:\.(.+)|)/;

    function va() {
        return !0
    }

    function wa() {
        return !1
    }

    function xa() {
        try {
            return d.activeElement
        } catch (a) {}
    }

    function ya(a, b, c, d, e, f) {
        var g, h;
        if ("object" == typeof b) {
            "string" != typeof c && (d = d || c, c = void 0);
            for (h in b) ya(a, h, c, d, b[h], f);
            return a
        }
        if (null == d && null == e ? (e = c, d = c = void 0) : null == e && ("string" == typeof c ? (e = d, d = void 0) : (e = d, d = c, c = void 0)), e === !1) e = wa;
        else if (!e) return a;
        return 1 === f && (g = e, e = function(a) {
            return r().off(a), g.apply(this, arguments)
        }, e.guid = g.guid || (g.guid = r.guid++)), a.each(function() {
            r.event.add(this, b, e, d, c)
        })
    }
    r.event = {
        global: {},
        add: function(a, b, c, d, e) {
            var f, g, h, i, j, k, l, m, n, o, p, q = W.get(a);
            if (q) {
                c.handler && (f = c, c = f.handler, e = f.selector), e && r.find.matchesSelector(ra, e), c.guid || (c.guid = r.guid++), (i = q.events) || (i = q.events = {}), (g = q.handle) || (g = q.handle = function(b) {
                    return "undefined" != typeof r && r.event.triggered !== b.type ? r.event.dispatch.apply(a, arguments) : void 0
                }), b = (b || "").match(L) || [""], j = b.length;
                while (j--) h = ua.exec(b[j]) || [], n = p = h[1], o = (h[2] || "").split(".").sort(), n && (l = r.event.special[n] || {}, n = (e ? l.delegateType : l.bindType) || n, l = r.event.special[n] || {}, k = r.extend({
                    type: n,
                    origType: p,
                    data: d,
                    handler: c,
                    guid: c.guid,
                    selector: e,
                    needsContext: e && r.expr.match.needsContext.test(e),
                    namespace: o.join(".")
                }, f), (m = i[n]) || (m = i[n] = [], m.delegateCount = 0, l.setup && l.setup.call(a, d, o, g) !== !1 || a.addEventListener && a.addEventListener(n, g)), l.add && (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, k) : m.push(k), r.event.global[n] = !0)
            }
        },
        remove: function(a, b, c, d, e) {
            var f, g, h, i, j, k, l, m, n, o, p, q = W.hasData(a) && W.get(a);
            if (q && (i = q.events)) {
                b = (b || "").match(L) || [""], j = b.length;
                while (j--)
                    if (h = ua.exec(b[j]) || [], n = p = h[1], o = (h[2] || "").split(".").sort(), n) {
                        l = r.event.special[n] || {}, n = (d ? l.delegateType : l.bindType) || n, m = i[n] || [], h = h[2] && new RegExp("(^|\\.)" + o.join("\\.(?:.*\\.|)") + "(\\.|$)"), g = f = m.length;
                        while (f--) k = m[f], !e && p !== k.origType || c && c.guid !== k.guid || h && !h.test(k.namespace) || d && d !== k.selector && ("**" !== d || !k.selector) || (m.splice(f, 1), k.selector && m.delegateCount--, l.remove && l.remove.call(a, k));
                        g && !m.length && (l.teardown && l.teardown.call(a, o, q.handle) !== !1 || r.removeEvent(a, n, q.handle), delete i[n])
                    } else
                        for (n in i) r.event.remove(a, n + b[j], c, d, !0);
                r.isEmptyObject(i) && W.remove(a, "handle events")
            }
        },
        dispatch: function(a) {
            var b = r.event.fix(a),
                c, d, e, f, g, h, i = new Array(arguments.length),
                j = (W.get(this, "events") || {})[b.type] || [],
                k = r.event.special[b.type] || {};
            for (i[0] = b, c = 1; c < arguments.length; c++) i[c] = arguments[c];
            if (b.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, b) !== !1) {
                h = r.event.handlers.call(this, b, j), c = 0;
                while ((f = h[c++]) && !b.isPropagationStopped()) {
                    b.currentTarget = f.elem, d = 0;
                    while ((g = f.handlers[d++]) && !b.isImmediatePropagationStopped()) b.rnamespace && !b.rnamespace.test(g.namespace) || (b.handleObj = g, b.data = g.data, e = ((r.event.special[g.origType] || {}).handle || g.handler).apply(f.elem, i), void 0 !== e && (b.result = e) === !1 && (b.preventDefault(), b.stopPropagation()))
                }
                return k.postDispatch && k.postDispatch.call(this, b), b.result
            }
        },
        handlers: function(a, b) {
            var c, d, e, f, g, h = [],
                i = b.delegateCount,
                j = a.target;
            if (i && j.nodeType && !("click" === a.type && a.button >= 1))
                for (; j !== this; j = j.parentNode || this)
                    if (1 === j.nodeType && ("click" !== a.type || j.disabled !== !0)) {
                        for (f = [], g = {}, c = 0; c < i; c++) d = b[c], e = d.selector + " ", void 0 === g[e] && (g[e] = d.needsContext ? r(e, this).index(j) > -1 : r.find(e, this, null, [j]).length), g[e] && f.push(d);
                        f.length && h.push({
                            elem: j,
                            handlers: f
                        })
                    }
            return j = this, i < b.length && h.push({
                elem: j,
                handlers: b.slice(i)
            }), h
        },
        addProp: function(a, b) {
            Object.defineProperty(r.Event.prototype, a, {
                enumerable: !0,
                configurable: !0,
                get: r.isFunction(b) ? function() {
                    if (this.originalEvent) return b(this.originalEvent)
                } : function() {
                    if (this.originalEvent) return this.originalEvent[a]
                },
                set: function(b) {
                    Object.defineProperty(this, a, {
                        enumerable: !0,
                        configurable: !0,
                        writable: !0,
                        value: b
                    })
                }
            })
        },
        fix: function(a) {
            return a[r.expando] ? a : new r.Event(a)
        },
        special: {
            load: {
                noBubble: !0
            },
            focus: {
                trigger: function() {
                    if (this !== xa() && this.focus) return this.focus(), !1
                },
                delegateType: "focusin"
            },
            blur: {
                trigger: function() {
                    if (this === xa() && this.blur) return this.blur(), !1
                },
                delegateType: "focusout"
            },
            click: {
                trigger: function() {
                    if ("checkbox" === this.type && this.click && B(this, "input")) return this.click(), !1
                },
                _default: function(a) {
                    return B(a.target, "a")
                }
            },
            beforeunload: {
                postDispatch: function(a) {
                    void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result)
                }
            }
        }
    }, r.removeEvent = function(a, b, c) {
        a.removeEventListener && a.removeEventListener(b, c)
    }, r.Event = function(a, b) {
        return this instanceof r.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? va : wa, this.target = a.target && 3 === a.target.nodeType ? a.target.parentNode : a.target, this.currentTarget = a.currentTarget, this.relatedTarget = a.relatedTarget) : this.type = a, b && r.extend(this, b), this.timeStamp = a && a.timeStamp || r.now(), void(this[r.expando] = !0)) : new r.Event(a, b)
    }, r.Event.prototype = {
        constructor: r.Event,
        isDefaultPrevented: wa,
        isPropagationStopped: wa,
        isImmediatePropagationStopped: wa,
        isSimulated: !1,
        preventDefault: function() {
            var a = this.originalEvent;
            this.isDefaultPrevented = va, a && !this.isSimulated && a.preventDefault()
        },
        stopPropagation: function() {
            var a = this.originalEvent;
            this.isPropagationStopped = va, a && !this.isSimulated && a.stopPropagation()
        },
        stopImmediatePropagation: function() {
            var a = this.originalEvent;
            this.isImmediatePropagationStopped = va, a && !this.isSimulated && a.stopImmediatePropagation(), this.stopPropagation()
        }
    }, r.each({
        altKey: !0,
        bubbles: !0,
        cancelable: !0,
        changedTouches: !0,
        ctrlKey: !0,
        detail: !0,
        eventPhase: !0,
        metaKey: !0,
        pageX: !0,
        pageY: !0,
        shiftKey: !0,
        view: !0,
        "char": !0,
        charCode: !0,
        key: !0,
        keyCode: !0,
        button: !0,
        buttons: !0,
        clientX: !0,
        clientY: !0,
        offsetX: !0,
        offsetY: !0,
        pointerId: !0,
        pointerType: !0,
        screenX: !0,
        screenY: !0,
        targetTouches: !0,
        toElement: !0,
        touches: !0,
        which: function(a) {
            var b = a.button;
            return null == a.which && sa.test(a.type) ? null != a.charCode ? a.charCode : a.keyCode : !a.which && void 0 !== b && ta.test(a.type) ? 1 & b ? 1 : 2 & b ? 3 : 4 & b ? 2 : 0 : a.which
        }
    }, r.event.addProp), r.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout",
        pointerenter: "pointerover",
        pointerleave: "pointerout"
    }, function(a, b) {
        r.event.special[a] = {
            delegateType: b,
            bindType: b,
            handle: function(a) {
                var c, d = this,
                    e = a.relatedTarget,
                    f = a.handleObj;
                return e && (e === d || r.contains(d, e)) || (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c
            }
        }
    }), r.fn.extend({
        on: function(a, b, c, d) {
            return ya(this, a, b, c, d)
        },
        one: function(a, b, c, d) {
            return ya(this, a, b, c, d, 1)
        },
        off: function(a, b, c) {
            var d, e;
            if (a && a.preventDefault && a.handleObj) return d = a.handleObj, r(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this;
            if ("object" == typeof a) {
                for (e in a) this.off(e, b, a[e]);
                return this
            }
            return b !== !1 && "function" != typeof b || (c = b, b = void 0), c === !1 && (c = wa), this.each(function() {
                r.event.remove(this, a, c, b)
            })
        }
    });
    var za = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,
        Aa = /<script|<style|<link/i,
        Ba = /checked\s*(?:[^=]|=\s*.checked.)/i,
        Ca = /^true\/(.*)/,
        Da = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

    function Ea(a, b) {
        return B(a, "table") && B(11 !== b.nodeType ? b : b.firstChild, "tr") ? r(">tbody", a)[0] || a : a
    }

    function Fa(a) {
        return a.type = (null !== a.getAttribute("type")) + "/" + a.type, a
    }

    function Ga(a) {
        var b = Ca.exec(a.type);
        return b ? a.type = b[1] : a.removeAttribute("type"), a
    }

    function Ha(a, b) {
        var c, d, e, f, g, h, i, j;
        if (1 === b.nodeType) {
            if (W.hasData(a) && (f = W.access(a), g = W.set(b, f), j = f.events)) {
                delete g.handle, g.events = {};
                for (e in j)
                    for (c = 0, d = j[e].length; c < d; c++) r.event.add(b, e, j[e][c])
            }
            X.hasData(a) && (h = X.access(a), i = r.extend({}, h), X.set(b, i))
        }
    }

    function Ia(a, b) {
        var c = b.nodeName.toLowerCase();
        "input" === c && ja.test(a.type) ? b.checked = a.checked : "input" !== c && "textarea" !== c || (b.defaultValue = a.defaultValue)
    }

    function Ja(a, b, c, d) {
        b = g.apply([], b);
        var e, f, h, i, j, k, l = 0,
            m = a.length,
            n = m - 1,
            q = b[0],
            s = r.isFunction(q);
        if (s || m > 1 && "string" == typeof q && !o.checkClone && Ba.test(q)) return a.each(function(e) {
            var f = a.eq(e);
            s && (b[0] = q.call(this, e, f.html())), Ja(f, b, c, d)
        });
        if (m && (e = qa(b, a[0].ownerDocument, !1, a, d), f = e.firstChild, 1 === e.childNodes.length && (e = f), f || d)) {
            for (h = r.map(na(e, "script"), Fa), i = h.length; l < m; l++) j = e, l !== n && (j = r.clone(j, !0, !0), i && r.merge(h, na(j, "script"))), c.call(a[l], j, l);
            if (i)
                for (k = h[h.length - 1].ownerDocument, r.map(h, Ga), l = 0; l < i; l++) j = h[l], la.test(j.type || "") && !W.access(j, "globalEval") && r.contains(k, j) && (j.src ? r._evalUrl && r._evalUrl(j.src) : p(j.textContent.replace(Da, ""), k))
        }
        return a
    }

    function Ka(a, b, c) {
        for (var d, e = b ? r.filter(b, a) : a, f = 0; null != (d = e[f]); f++) c || 1 !== d.nodeType || r.cleanData(na(d)), d.parentNode && (c && r.contains(d.ownerDocument, d) && oa(na(d, "script")), d.parentNode.removeChild(d));
        return a
    }
    r.extend({
        htmlPrefilter: function(a) {
            return a.replace(za, "<$1></$2>")
        },
        clone: function(a, b, c) {
            var d, e, f, g, h = a.cloneNode(!0),
                i = r.contains(a.ownerDocument, a);
            if (!(o.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || r.isXMLDoc(a)))
                for (g = na(h), f = na(a), d = 0, e = f.length; d < e; d++) Ia(f[d], g[d]);
            if (b)
                if (c)
                    for (f = f || na(a), g = g || na(h), d = 0, e = f.length; d < e; d++) Ha(f[d], g[d]);
                else Ha(a, h);
            return g = na(h, "script"), g.length > 0 && oa(g, !i && na(a, "script")), h
        },
        cleanData: function(a) {
            for (var b, c, d, e = r.event.special, f = 0; void 0 !== (c = a[f]); f++)
                if (U(c)) {
                    if (b = c[W.expando]) {
                        if (b.events)
                            for (d in b.events) e[d] ? r.event.remove(c, d) : r.removeEvent(c, d, b.handle);
                        c[W.expando] = void 0
                    }
                    c[X.expando] && (c[X.expando] = void 0)
                }
        }
    }), r.fn.extend({
        detach: function(a) {
            return Ka(this, a, !0)
        },
        remove: function(a) {
            return Ka(this, a)
        },
        text: function(a) {
            return T(this, function(a) {
                return void 0 === a ? r.text(this) : this.empty().each(function() {
                    1 !== this.nodeType && 11 !== this.nodeType && 9 !== this.nodeType || (this.textContent = a)
                })
            }, null, a, arguments.length)
        },
        append: function() {
            return Ja(this, arguments, function(a) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var b = Ea(this, a);
                    b.appendChild(a)
                }
            })
        },
        prepend: function() {
            return Ja(this, arguments, function(a) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var b = Ea(this, a);
                    b.insertBefore(a, b.firstChild)
                }
            })
        },
        before: function() {
            return Ja(this, arguments, function(a) {
                this.parentNode && this.parentNode.insertBefore(a, this)
            })
        },
        after: function() {
            return Ja(this, arguments, function(a) {
                this.parentNode && this.parentNode.insertBefore(a, this.nextSibling)
            })
        },
        empty: function() {
            for (var a, b = 0; null != (a = this[b]); b++) 1 === a.nodeType && (r.cleanData(na(a, !1)), a.textContent = "");
            return this
        },
        clone: function(a, b) {
            return a = null != a && a, b = null == b ? a : b, this.map(function() {
                return r.clone(this, a, b)
            })
        },
        html: function(a) {
            return T(this, function(a) {
                var b = this[0] || {},
                    c = 0,
                    d = this.length;
                if (void 0 === a && 1 === b.nodeType) return b.innerHTML;
                if ("string" == typeof a && !Aa.test(a) && !ma[(ka.exec(a) || ["", ""])[1].toLowerCase()]) {
                    a = r.htmlPrefilter(a);
                    try {
                        for (; c < d; c++) b = this[c] || {}, 1 === b.nodeType && (r.cleanData(na(b, !1)), b.innerHTML = a);
                        b = 0
                    } catch (e) {}
                }
                b && this.empty().append(a)
            }, null, a, arguments.length)
        },
        replaceWith: function() {
            var a = [];
            return Ja(this, arguments, function(b) {
                var c = this.parentNode;
                r.inArray(this, a) < 0 && (r.cleanData(na(this)), c && c.replaceChild(b, this))
            }, a)
        }
    }), r.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(a, b) {
        r.fn[a] = function(a) {
            for (var c, d = [], e = r(a), f = e.length - 1, g = 0; g <= f; g++) c = g === f ? this : this.clone(!0), r(e[g])[b](c), h.apply(d, c.get());
            return this.pushStack(d)
        }
    });
    var La = /^margin/,
        Ma = new RegExp("^(" + aa + ")(?!px)[a-z%]+$", "i"),
        Na = function(b) {
            var c = b.ownerDocument.defaultView;
            return c && c.opener || (c = a), c.getComputedStyle(b)
        };
    ! function() {
        function b() {
            if (i) {
                i.style.cssText = "box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%", i.innerHTML = "", ra.appendChild(h);
                var b = a.getComputedStyle(i);
                c = "1%" !== b.top, g = "2px" === b.marginLeft, e = "4px" === b.width, i.style.marginRight = "50%", f = "4px" === b.marginRight, ra.removeChild(h), i = null
            }
        }
        var c, e, f, g, h = d.createElement("div"),
            i = d.createElement("div");
        i.style && (i.style.backgroundClip = "content-box", i.cloneNode(!0).style.backgroundClip = "", o.clearCloneStyle = "content-box" === i.style.backgroundClip, h.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute", h.appendChild(i), r.extend(o, {
            pixelPosition: function() {
                return b(), c
            },
            boxSizingReliable: function() {
                return b(), e
            },
            pixelMarginRight: function() {
                return b(), f
            },
            reliableMarginLeft: function() {
                return b(), g
            }
        }))
    }();

    function Oa(a, b, c) {
        var d, e, f, g, h = a.style;
        return c = c || Na(a), c && (g = c.getPropertyValue(b) || c[b], "" !== g || r.contains(a.ownerDocument, a) || (g = r.style(a, b)), !o.pixelMarginRight() && Ma.test(g) && La.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 !== g ? g + "" : g
    }

    function Pa(a, b) {
        return {
            get: function() {
                return a() ? void delete this.get : (this.get = b).apply(this, arguments)
            }
        }
    }
    var Qa = /^(none|table(?!-c[ea]).+)/,
        Ra = /^--/,
        Sa = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },
        Ta = {
            letterSpacing: "0",
            fontWeight: "400"
        },
        Ua = ["Webkit", "Moz", "ms"],
        Va = d.createElement("div").style;

    function Wa(a) {
        if (a in Va) return a;
        var b = a[0].toUpperCase() + a.slice(1),
            c = Ua.length;
        while (c--)
            if (a = Ua[c] + b, a in Va) return a
    }

    function Xa(a) {
        var b = r.cssProps[a];
        return b || (b = r.cssProps[a] = Wa(a) || a), b
    }

    function Ya(a, b, c) {
        var d = ba.exec(b);
        return d ? Math.max(0, d[2] - (c || 0)) + (d[3] || "px") : b
    }

    function Za(a, b, c, d, e) {
        var f, g = 0;
        for (f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0; f < 4; f += 2) "margin" === c && (g += r.css(a, c + ca[f], !0, e)), d ? ("content" === c && (g -= r.css(a, "padding" + ca[f], !0, e)), "margin" !== c && (g -= r.css(a, "border" + ca[f] + "Width", !0, e))) : (g += r.css(a, "padding" + ca[f], !0, e), "padding" !== c && (g += r.css(a, "border" + ca[f] + "Width", !0, e)));
        return g
    }

    function $a(a, b, c) {
        var d, e = Na(a),
            f = Oa(a, b, e),
            g = "border-box" === r.css(a, "boxSizing", !1, e);
        return Ma.test(f) ? f : (d = g && (o.boxSizingReliable() || f === a.style[b]), "auto" === f && (f = a["offset" + b[0].toUpperCase() + b.slice(1)]), f = parseFloat(f) || 0, f + Za(a, b, c || (g ? "border" : "content"), d, e) + "px")
    }
    r.extend({
        cssHooks: {
            opacity: {
                get: function(a, b) {
                    if (b) {
                        var c = Oa(a, "opacity");
                        return "" === c ? "1" : c
                    }
                }
            }
        },
        cssNumber: {
            animationIterationCount: !0,
            columnCount: !0,
            fillOpacity: !0,
            flexGrow: !0,
            flexShrink: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": "cssFloat"
        },
        style: function(a, b, c, d) {
            if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
                var e, f, g, h = r.camelCase(b),
                    i = Ra.test(b),
                    j = a.style;
                return i || (b = Xa(h)), g = r.cssHooks[b] || r.cssHooks[h], void 0 === c ? g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : j[b] : (f = typeof c, "string" === f && (e = ba.exec(c)) && e[1] && (c = fa(a, b, e), f = "number"), null != c && c === c && ("number" === f && (c += e && e[3] || (r.cssNumber[h] ? "" : "px")), o.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (j[b] = "inherit"), g && "set" in g && void 0 === (c = g.set(a, c, d)) || (i ? j.setProperty(b, c) : j[b] = c)), void 0)
            }
        },
        css: function(a, b, c, d) {
            var e, f, g, h = r.camelCase(b),
                i = Ra.test(b);
            return i || (b = Xa(h)), g = r.cssHooks[b] || r.cssHooks[h], g && "get" in g && (e = g.get(a, !0, c)), void 0 === e && (e = Oa(a, b, d)), "normal" === e && b in Ta && (e = Ta[b]), "" === c || c ? (f = parseFloat(e), c === !0 || isFinite(f) ? f || 0 : e) : e
        }
    }), r.each(["height", "width"], function(a, b) {
        r.cssHooks[b] = {
            get: function(a, c, d) {
                if (c) return !Qa.test(r.css(a, "display")) || a.getClientRects().length && a.getBoundingClientRect().width ? $a(a, b, d) : ea(a, Sa, function() {
                    return $a(a, b, d)
                })
            },
            set: function(a, c, d) {
                var e, f = d && Na(a),
                    g = d && Za(a, b, d, "border-box" === r.css(a, "boxSizing", !1, f), f);
                return g && (e = ba.exec(c)) && "px" !== (e[3] || "px") && (a.style[b] = c, c = r.css(a, b)), Ya(a, c, g)
            }
        }
    }), r.cssHooks.marginLeft = Pa(o.reliableMarginLeft, function(a, b) {
        if (b) return (parseFloat(Oa(a, "marginLeft")) || a.getBoundingClientRect().left - ea(a, {
            marginLeft: 0
        }, function() {
            return a.getBoundingClientRect().left
        })) + "px"
    }), r.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(a, b) {
        r.cssHooks[a + b] = {
            expand: function(c) {
                for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; d < 4; d++) e[a + ca[d] + b] = f[d] || f[d - 2] || f[0];
                return e
            }
        }, La.test(a) || (r.cssHooks[a + b].set = Ya)
    }), r.fn.extend({
        css: function(a, b) {
            return T(this, function(a, b, c) {
                var d, e, f = {},
                    g = 0;
                if (Array.isArray(b)) {
                    for (d = Na(a), e = b.length; g < e; g++) f[b[g]] = r.css(a, b[g], !1, d);
                    return f
                }
                return void 0 !== c ? r.style(a, b, c) : r.css(a, b)
            }, a, b, arguments.length > 1)
        }
    });

    function _a(a, b, c, d, e) {
        return new _a.prototype.init(a, b, c, d, e)
    }
    r.Tween = _a, _a.prototype = {
        constructor: _a,
        init: function(a, b, c, d, e, f) {
            this.elem = a, this.prop = c, this.easing = e || r.easing._default, this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (r.cssNumber[c] ? "" : "px")
        },
        cur: function() {
            var a = _a.propHooks[this.prop];
            return a && a.get ? a.get(this) : _a.propHooks._default.get(this)
        },
        run: function(a) {
            var b, c = _a.propHooks[this.prop];
            return this.options.duration ? this.pos = b = r.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : this.pos = b = a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : _a.propHooks._default.set(this), this
        }
    }, _a.prototype.init.prototype = _a.prototype, _a.propHooks = {
        _default: {
            get: function(a) {
                var b;
                return 1 !== a.elem.nodeType || null != a.elem[a.prop] && null == a.elem.style[a.prop] ? a.elem[a.prop] : (b = r.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0)
            },
            set: function(a) {
                r.fx.step[a.prop] ? r.fx.step[a.prop](a) : 1 !== a.elem.nodeType || null == a.elem.style[r.cssProps[a.prop]] && !r.cssHooks[a.prop] ? a.elem[a.prop] = a.now : r.style(a.elem, a.prop, a.now + a.unit)
            }
        }
    }, _a.propHooks.scrollTop = _a.propHooks.scrollLeft = {
        set: function(a) {
            a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now)
        }
    }, r.easing = {
        linear: function(a) {
            return a
        },
        swing: function(a) {
            return .5 - Math.cos(a * Math.PI) / 2
        },
        _default: "swing"
    }, r.fx = _a.prototype.init, r.fx.step = {};
    var ab, bb, cb = /^(?:toggle|show|hide)$/,
        db = /queueHooks$/;

    function eb() {
        bb && (d.hidden === !1 && a.requestAnimationFrame ? a.requestAnimationFrame(eb) : a.setTimeout(eb, r.fx.interval), r.fx.tick())
    }

    function fb() {
        return a.setTimeout(function() {
            ab = void 0
        }), ab = r.now()
    }

    function gb(a, b) {
        var c, d = 0,
            e = {
                height: a
            };
        for (b = b ? 1 : 0; d < 4; d += 2 - b) c = ca[d], e["margin" + c] = e["padding" + c] = a;
        return b && (e.opacity = e.width = a), e
    }

    function hb(a, b, c) {
        for (var d, e = (kb.tweeners[b] || []).concat(kb.tweeners["*"]), f = 0, g = e.length; f < g; f++)
            if (d = e[f].call(c, b, a)) return d
    }

    function ib(a, b, c) {
        var d, e, f, g, h, i, j, k, l = "width" in b || "height" in b,
            m = this,
            n = {},
            o = a.style,
            p = a.nodeType && da(a),
            q = W.get(a, "fxshow");
        c.queue || (g = r._queueHooks(a, "fx"), null == g.unqueued && (g.unqueued = 0, h = g.empty.fire, g.empty.fire = function() {
            g.unqueued || h()
        }), g.unqueued++, m.always(function() {
            m.always(function() {
                g.unqueued--, r.queue(a, "fx").length || g.empty.fire()
            })
        }));
        for (d in b)
            if (e = b[d], cb.test(e)) {
                if (delete b[d], f = f || "toggle" === e, e === (p ? "hide" : "show")) {
                    if ("show" !== e || !q || void 0 === q[d]) continue;
                    p = !0
                }
                n[d] = q && q[d] || r.style(a, d)
            }
        if (i = !r.isEmptyObject(b), i || !r.isEmptyObject(n)) {
            l && 1 === a.nodeType && (c.overflow = [o.overflow, o.overflowX, o.overflowY], j = q && q.display, null == j && (j = W.get(a, "display")), k = r.css(a, "display"), "none" === k && (j ? k = j : (ia([a], !0), j = a.style.display || j, k = r.css(a, "display"), ia([a]))), ("inline" === k || "inline-block" === k && null != j) && "none" === r.css(a, "float") && (i || (m.done(function() {
                o.display = j
            }), null == j && (k = o.display, j = "none" === k ? "" : k)), o.display = "inline-block")), c.overflow && (o.overflow = "hidden", m.always(function() {
                o.overflow = c.overflow[0], o.overflowX = c.overflow[1], o.overflowY = c.overflow[2]
            })), i = !1;
            for (d in n) i || (q ? "hidden" in q && (p = q.hidden) : q = W.access(a, "fxshow", {
                display: j
            }), f && (q.hidden = !p), p && ia([a], !0), m.done(function() {
                p || ia([a]), W.remove(a, "fxshow");
                for (d in n) r.style(a, d, n[d])
            })), i = hb(p ? q[d] : 0, d, m), d in q || (q[d] = i.start, p && (i.end = i.start, i.start = 0))
        }
    }

    function jb(a, b) {
        var c, d, e, f, g;
        for (c in a)
            if (d = r.camelCase(c), e = b[d], f = a[c], Array.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = r.cssHooks[d], g && "expand" in g) {
                f = g.expand(f), delete a[d];
                for (c in f) c in a || (a[c] = f[c], b[c] = e)
            } else b[d] = e
    }

    function kb(a, b, c) {
        var d, e, f = 0,
            g = kb.prefilters.length,
            h = r.Deferred().always(function() {
                delete i.elem
            }),
            i = function() {
                if (e) return !1;
                for (var b = ab || fb(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; g < i; g++) j.tweens[g].run(f);
                return h.notifyWith(a, [j, f, c]), f < 1 && i ? c : (i || h.notifyWith(a, [j, 1, 0]), h.resolveWith(a, [j]), !1)
            },
            j = h.promise({
                elem: a,
                props: r.extend({}, b),
                opts: r.extend(!0, {
                    specialEasing: {},
                    easing: r.easing._default
                }, c),
                originalProperties: b,
                originalOptions: c,
                startTime: ab || fb(),
                duration: c.duration,
                tweens: [],
                createTween: function(b, c) {
                    var d = r.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);
                    return j.tweens.push(d), d
                },
                stop: function(b) {
                    var c = 0,
                        d = b ? j.tweens.length : 0;
                    if (e) return this;
                    for (e = !0; c < d; c++) j.tweens[c].run(1);
                    return b ? (h.notifyWith(a, [j, 1, 0]), h.resolveWith(a, [j, b])) : h.rejectWith(a, [j, b]), this
                }
            }),
            k = j.props;
        for (jb(k, j.opts.specialEasing); f < g; f++)
            if (d = kb.prefilters[f].call(j, a, k, j.opts)) return r.isFunction(d.stop) && (r._queueHooks(j.elem, j.opts.queue).stop = r.proxy(d.stop, d)), d;
        return r.map(k, hb, j), r.isFunction(j.opts.start) && j.opts.start.call(a, j), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always), r.fx.timer(r.extend(i, {
            elem: a,
            anim: j,
            queue: j.opts.queue
        })), j
    }
    r.Animation = r.extend(kb, {
            tweeners: {
                "*": [function(a, b) {
                    var c = this.createTween(a, b);
                    return fa(c.elem, a, ba.exec(b), c), c
                }]
            },
            tweener: function(a, b) {
                r.isFunction(a) ? (b = a, a = ["*"]) : a = a.match(L);
                for (var c, d = 0, e = a.length; d < e; d++) c = a[d], kb.tweeners[c] = kb.tweeners[c] || [], kb.tweeners[c].unshift(b)
            },
            prefilters: [ib],
            prefilter: function(a, b) {
                b ? kb.prefilters.unshift(a) : kb.prefilters.push(a)
            }
        }), r.speed = function(a, b, c) {
            var d = a && "object" == typeof a ? r.extend({}, a) : {
                complete: c || !c && b || r.isFunction(a) && a,
                duration: a,
                easing: c && b || b && !r.isFunction(b) && b
            };
            return r.fx.off ? d.duration = 0 : "number" != typeof d.duration && (d.duration in r.fx.speeds ? d.duration = r.fx.speeds[d.duration] : d.duration = r.fx.speeds._default), null != d.queue && d.queue !== !0 || (d.queue = "fx"), d.old = d.complete, d.complete = function() {
                r.isFunction(d.old) && d.old.call(this), d.queue && r.dequeue(this, d.queue)
            }, d
        }, r.fn.extend({
            fadeTo: function(a, b, c, d) {
                return this.filter(da).css("opacity", 0).show().end().animate({
                    opacity: b
                }, a, c, d)
            },
            animate: function(a, b, c, d) {
                var e = r.isEmptyObject(a),
                    f = r.speed(b, c, d),
                    g = function() {
                        var b = kb(this, r.extend({}, a), f);
                        (e || W.get(this, "finish")) && b.stop(!0)
                    };
                return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g)
            },
            stop: function(a, b, c) {
                var d = function(a) {
                    var b = a.stop;
                    delete a.stop, b(c)
                };
                return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), this.each(function() {
                    var b = !0,
                        e = null != a && a + "queueHooks",
                        f = r.timers,
                        g = W.get(this);
                    if (e) g[e] && g[e].stop && d(g[e]);
                    else
                        for (e in g) g[e] && g[e].stop && db.test(e) && d(g[e]);
                    for (e = f.length; e--;) f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1));
                    !b && c || r.dequeue(this, a)
                })
            },
            finish: function(a) {
                return a !== !1 && (a = a || "fx"), this.each(function() {
                    var b, c = W.get(this),
                        d = c[a + "queue"],
                        e = c[a + "queueHooks"],
                        f = r.timers,
                        g = d ? d.length : 0;
                    for (c.finish = !0, r.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;) f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1));
                    for (b = 0; b < g; b++) d[b] && d[b].finish && d[b].finish.call(this);
                    delete c.finish
                })
            }
        }), r.each(["toggle", "show", "hide"], function(a, b) {
            var c = r.fn[b];
            r.fn[b] = function(a, d, e) {
                return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(gb(b, !0), a, d, e)
            }
        }), r.each({
            slideDown: gb("show"),
            slideUp: gb("hide"),
            slideToggle: gb("toggle"),
            fadeIn: {
                opacity: "show"
            },
            fadeOut: {
                opacity: "hide"
            },
            fadeToggle: {
                opacity: "toggle"
            }
        }, function(a, b) {
            r.fn[a] = function(a, c, d) {
                return this.animate(b, a, c, d)
            }
        }), r.timers = [], r.fx.tick = function() {
            var a, b = 0,
                c = r.timers;
            for (ab = r.now(); b < c.length; b++) a = c[b], a() || c[b] !== a || c.splice(b--, 1);
            c.length || r.fx.stop(), ab = void 0
        }, r.fx.timer = function(a) {
            r.timers.push(a), r.fx.start()
        }, r.fx.interval = 13, r.fx.start = function() {
            bb || (bb = !0, eb())
        }, r.fx.stop = function() {
            bb = null
        }, r.fx.speeds = {
            slow: 600,
            fast: 200,
            _default: 400
        }, r.fn.delay = function(b, c) {
            return b = r.fx ? r.fx.speeds[b] || b : b, c = c || "fx", this.queue(c, function(c, d) {
                var e = a.setTimeout(c, b);
                d.stop = function() {
                    a.clearTimeout(e)
                }
            })
        },
        function() {
            var a = d.createElement("input"),
                b = d.createElement("select"),
                c = b.appendChild(d.createElement("option"));
            a.type = "checkbox", o.checkOn = "" !== a.value, o.optSelected = c.selected, a = d.createElement("input"), a.value = "t", a.type = "radio", o.radioValue = "t" === a.value
        }();
    var lb, mb = r.expr.attrHandle;
    r.fn.extend({
        attr: function(a, b) {
            return T(this, r.attr, a, b, arguments.length > 1)
        },
        removeAttr: function(a) {
            return this.each(function() {
                r.removeAttr(this, a)
            })
        }
    }), r.extend({
        attr: function(a, b, c) {
            var d, e, f = a.nodeType;
            if (3 !== f && 8 !== f && 2 !== f) return "undefined" == typeof a.getAttribute ? r.prop(a, b, c) : (1 === f && r.isXMLDoc(a) || (e = r.attrHooks[b.toLowerCase()] || (r.expr.match.bool.test(b) ? lb : void 0)), void 0 !== c ? null === c ? void r.removeAttr(a, b) : e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : (a.setAttribute(b, c + ""), c) : e && "get" in e && null !== (d = e.get(a, b)) ? d : (d = r.find.attr(a, b),
                null == d ? void 0 : d))
        },
        attrHooks: {
            type: {
                set: function(a, b) {
                    if (!o.radioValue && "radio" === b && B(a, "input")) {
                        var c = a.value;
                        return a.setAttribute("type", b), c && (a.value = c), b
                    }
                }
            }
        },
        removeAttr: function(a, b) {
            var c, d = 0,
                e = b && b.match(L);
            if (e && 1 === a.nodeType)
                while (c = e[d++]) a.removeAttribute(c)
        }
    }), lb = {
        set: function(a, b, c) {
            return b === !1 ? r.removeAttr(a, c) : a.setAttribute(c, c), c
        }
    }, r.each(r.expr.match.bool.source.match(/\w+/g), function(a, b) {
        var c = mb[b] || r.find.attr;
        mb[b] = function(a, b, d) {
            var e, f, g = b.toLowerCase();
            return d || (f = mb[g], mb[g] = e, e = null != c(a, b, d) ? g : null, mb[g] = f), e
        }
    });
    var nb = /^(?:input|select|textarea|button)$/i,
        ob = /^(?:a|area)$/i;
    r.fn.extend({
        prop: function(a, b) {
            return T(this, r.prop, a, b, arguments.length > 1)
        },
        removeProp: function(a) {
            return this.each(function() {
                delete this[r.propFix[a] || a]
            })
        }
    }), r.extend({
        prop: function(a, b, c) {
            var d, e, f = a.nodeType;
            if (3 !== f && 8 !== f && 2 !== f) return 1 === f && r.isXMLDoc(a) || (b = r.propFix[b] || b, e = r.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b]
        },
        propHooks: {
            tabIndex: {
                get: function(a) {
                    var b = r.find.attr(a, "tabindex");
                    return b ? parseInt(b, 10) : nb.test(a.nodeName) || ob.test(a.nodeName) && a.href ? 0 : -1
                }
            }
        },
        propFix: {
            "for": "htmlFor",
            "class": "className"
        }
    }), o.optSelected || (r.propHooks.selected = {
        get: function(a) {
            var b = a.parentNode;
            return b && b.parentNode && b.parentNode.selectedIndex, null
        },
        set: function(a) {
            var b = a.parentNode;
            b && (b.selectedIndex, b.parentNode && b.parentNode.selectedIndex)
        }
    }), r.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() {
        r.propFix[this.toLowerCase()] = this
    });

    function pb(a) {
        var b = a.match(L) || [];
        return b.join(" ")
    }

    function qb(a) {
        return a.getAttribute && a.getAttribute("class") || ""
    }
    r.fn.extend({
        addClass: function(a) {
            var b, c, d, e, f, g, h, i = 0;
            if (r.isFunction(a)) return this.each(function(b) {
                r(this).addClass(a.call(this, b, qb(this)))
            });
            if ("string" == typeof a && a) {
                b = a.match(L) || [];
                while (c = this[i++])
                    if (e = qb(c), d = 1 === c.nodeType && " " + pb(e) + " ") {
                        g = 0;
                        while (f = b[g++]) d.indexOf(" " + f + " ") < 0 && (d += f + " ");
                        h = pb(d), e !== h && c.setAttribute("class", h)
                    }
            }
            return this
        },
        removeClass: function(a) {
            var b, c, d, e, f, g, h, i = 0;
            if (r.isFunction(a)) return this.each(function(b) {
                r(this).removeClass(a.call(this, b, qb(this)))
            });
            if (!arguments.length) return this.attr("class", "");
            if ("string" == typeof a && a) {
                b = a.match(L) || [];
                while (c = this[i++])
                    if (e = qb(c), d = 1 === c.nodeType && " " + pb(e) + " ") {
                        g = 0;
                        while (f = b[g++])
                            while (d.indexOf(" " + f + " ") > -1) d = d.replace(" " + f + " ", " ");
                        h = pb(d), e !== h && c.setAttribute("class", h)
                    }
            }
            return this
        },
        toggleClass: function(a, b) {
            var c = typeof a;
            return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : r.isFunction(a) ? this.each(function(c) {
                r(this).toggleClass(a.call(this, c, qb(this), b), b)
            }) : this.each(function() {
                var b, d, e, f;
                if ("string" === c) {
                    d = 0, e = r(this), f = a.match(L) || [];
                    while (b = f[d++]) e.hasClass(b) ? e.removeClass(b) : e.addClass(b)
                } else void 0 !== a && "boolean" !== c || (b = qb(this), b && W.set(this, "__className__", b), this.setAttribute && this.setAttribute("class", b || a === !1 ? "" : W.get(this, "__className__") || ""))
            })
        },
        hasClass: function(a) {
            var b, c, d = 0;
            b = " " + a + " ";
            while (c = this[d++])
                if (1 === c.nodeType && (" " + pb(qb(c)) + " ").indexOf(b) > -1) return !0;
            return !1
        }
    });
    var rb = /\r/g;
    r.fn.extend({
        val: function(a) {
            var b, c, d, e = this[0]; {
                if (arguments.length) return d = r.isFunction(a), this.each(function(c) {
                    var e;
                    1 === this.nodeType && (e = d ? a.call(this, c, r(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : Array.isArray(e) && (e = r.map(e, function(a) {
                        return null == a ? "" : a + ""
                    })), b = r.valHooks[this.type] || r.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e))
                });
                if (e) return b = r.valHooks[e.type] || r.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(rb, "") : null == c ? "" : c)
            }
        }
    }), r.extend({
        valHooks: {
            option: {
                get: function(a) {
                    var b = r.find.attr(a, "value");
                    return null != b ? b : pb(r.text(a))
                }
            },
            select: {
                get: function(a) {
                    var b, c, d, e = a.options,
                        f = a.selectedIndex,
                        g = "select-one" === a.type,
                        h = g ? null : [],
                        i = g ? f + 1 : e.length;
                    for (d = f < 0 ? i : g ? f : 0; d < i; d++)
                        if (c = e[d], (c.selected || d === f) && !c.disabled && (!c.parentNode.disabled || !B(c.parentNode, "optgroup"))) {
                            if (b = r(c).val(), g) return b;
                            h.push(b)
                        }
                    return h
                },
                set: function(a, b) {
                    var c, d, e = a.options,
                        f = r.makeArray(b),
                        g = e.length;
                    while (g--) d = e[g], (d.selected = r.inArray(r.valHooks.option.get(d), f) > -1) && (c = !0);
                    return c || (a.selectedIndex = -1), f
                }
            }
        }
    }), r.each(["radio", "checkbox"], function() {
        r.valHooks[this] = {
            set: function(a, b) {
                if (Array.isArray(b)) return a.checked = r.inArray(r(a).val(), b) > -1
            }
        }, o.checkOn || (r.valHooks[this].get = function(a) {
            return null === a.getAttribute("value") ? "on" : a.value
        })
    });
    var sb = /^(?:focusinfocus|focusoutblur)$/;
    r.extend(r.event, {
        trigger: function(b, c, e, f) {
            var g, h, i, j, k, m, n, o = [e || d],
                p = l.call(b, "type") ? b.type : b,
                q = l.call(b, "namespace") ? b.namespace.split(".") : [];
            if (h = i = e = e || d, 3 !== e.nodeType && 8 !== e.nodeType && !sb.test(p + r.event.triggered) && (p.indexOf(".") > -1 && (q = p.split("."), p = q.shift(), q.sort()), k = p.indexOf(":") < 0 && "on" + p, b = b[r.expando] ? b : new r.Event(p, "object" == typeof b && b), b.isTrigger = f ? 2 : 3, b.namespace = q.join("."), b.rnamespace = b.namespace ? new RegExp("(^|\\.)" + q.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = e), c = null == c ? [b] : r.makeArray(c, [b]), n = r.event.special[p] || {}, f || !n.trigger || n.trigger.apply(e, c) !== !1)) {
                if (!f && !n.noBubble && !r.isWindow(e)) {
                    for (j = n.delegateType || p, sb.test(j + p) || (h = h.parentNode); h; h = h.parentNode) o.push(h), i = h;
                    i === (e.ownerDocument || d) && o.push(i.defaultView || i.parentWindow || a)
                }
                g = 0;
                while ((h = o[g++]) && !b.isPropagationStopped()) b.type = g > 1 ? j : n.bindType || p, m = (W.get(h, "events") || {})[b.type] && W.get(h, "handle"), m && m.apply(h, c), m = k && h[k], m && m.apply && U(h) && (b.result = m.apply(h, c), b.result === !1 && b.preventDefault());
                return b.type = p, f || b.isDefaultPrevented() || n._default && n._default.apply(o.pop(), c) !== !1 || !U(e) || k && r.isFunction(e[p]) && !r.isWindow(e) && (i = e[k], i && (e[k] = null), r.event.triggered = p, e[p](), r.event.triggered = void 0, i && (e[k] = i)), b.result
            }
        },
        simulate: function(a, b, c) {
            var d = r.extend(new r.Event, c, {
                type: a,
                isSimulated: !0
            });
            r.event.trigger(d, null, b)
        }
    }), r.fn.extend({
        trigger: function(a, b) {
            return this.each(function() {
                r.event.trigger(a, b, this)
            })
        },
        triggerHandler: function(a, b) {
            var c = this[0];
            if (c) return r.event.trigger(a, b, c, !0)
        }
    }), r.each("blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "), function(a, b) {
        r.fn[b] = function(a, c) {
            return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b)
        }
    }), r.fn.extend({
        hover: function(a, b) {
            return this.mouseenter(a).mouseleave(b || a)
        }
    }), o.focusin = "onfocusin" in a, o.focusin || r.each({
        focus: "focusin",
        blur: "focusout"
    }, function(a, b) {
        var c = function(a) {
            r.event.simulate(b, a.target, r.event.fix(a))
        };
        r.event.special[b] = {
            setup: function() {
                var d = this.ownerDocument || this,
                    e = W.access(d, b);
                e || d.addEventListener(a, c, !0), W.access(d, b, (e || 0) + 1)
            },
            teardown: function() {
                var d = this.ownerDocument || this,
                    e = W.access(d, b) - 1;
                e ? W.access(d, b, e) : (d.removeEventListener(a, c, !0), W.remove(d, b))
            }
        }
    });
    var tb = a.location,
        ub = r.now(),
        vb = /\?/;
    r.parseXML = function(b) {
        var c;
        if (!b || "string" != typeof b) return null;
        try {
            c = (new a.DOMParser).parseFromString(b, "text/xml")
        } catch (d) {
            c = void 0
        }
        return c && !c.getElementsByTagName("parsererror").length || r.error("Invalid XML: " + b), c
    };
    var wb = /\[\]$/,
        xb = /\r?\n/g,
        yb = /^(?:submit|button|image|reset|file)$/i,
        zb = /^(?:input|select|textarea|keygen)/i;

    function Ab(a, b, c, d) {
        var e;
        if (Array.isArray(b)) r.each(b, function(b, e) {
            c || wb.test(a) ? d(a, e) : Ab(a + "[" + ("object" == typeof e && null != e ? b : "") + "]", e, c, d)
        });
        else if (c || "object" !== r.type(b)) d(a, b);
        else
            for (e in b) Ab(a + "[" + e + "]", b[e], c, d)
    }
    r.param = function(a, b) {
        var c, d = [],
            e = function(a, b) {
                var c = r.isFunction(b) ? b() : b;
                d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(null == c ? "" : c)
            };
        if (Array.isArray(a) || a.jquery && !r.isPlainObject(a)) r.each(a, function() {
            e(this.name, this.value)
        });
        else
            for (c in a) Ab(c, a[c], b, e);
        return d.join("&")
    }, r.fn.extend({
        serialize: function() {
            return r.param(this.serializeArray())
        },
        serializeArray: function() {
            return this.map(function() {
                var a = r.prop(this, "elements");
                return a ? r.makeArray(a) : this
            }).filter(function() {
                var a = this.type;
                return this.name && !r(this).is(":disabled") && zb.test(this.nodeName) && !yb.test(a) && (this.checked || !ja.test(a))
            }).map(function(a, b) {
                var c = r(this).val();
                return null == c ? null : Array.isArray(c) ? r.map(c, function(a) {
                    return {
                        name: b.name,
                        value: a.replace(xb, "\r\n")
                    }
                }) : {
                    name: b.name,
                    value: c.replace(xb, "\r\n")
                }
            }).get()
        }
    });
    var Bb = /%20/g,
        Cb = /#.*$/,
        Db = /([?&])_=[^&]*/,
        Eb = /^(.*?):[ \t]*([^\r\n]*)$/gm,
        Fb = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        Gb = /^(?:GET|HEAD)$/,
        Hb = /^\/\//,
        Ib = {},
        Jb = {},
        Kb = "*/".concat("*"),
        Lb = d.createElement("a");
    Lb.href = tb.href;

    function Mb(a) {
        return function(b, c) {
            "string" != typeof b && (c = b, b = "*");
            var d, e = 0,
                f = b.toLowerCase().match(L) || [];
            if (r.isFunction(c))
                while (d = f[e++]) "+" === d[0] ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c)
        }
    }

    function Nb(a, b, c, d) {
        var e = {},
            f = a === Jb;

        function g(h) {
            var i;
            return e[h] = !0, r.each(a[h] || [], function(a, h) {
                var j = h(b, c, d);
                return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1)
            }), i
        }
        return g(b.dataTypes[0]) || !e["*"] && g("*")
    }

    function Ob(a, b) {
        var c, d, e = r.ajaxSettings.flatOptions || {};
        for (c in b) void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]);
        return d && r.extend(!0, a, d), a
    }

    function Pb(a, b, c) {
        var d, e, f, g, h = a.contents,
            i = a.dataTypes;
        while ("*" === i[0]) i.shift(), void 0 === d && (d = a.mimeType || b.getResponseHeader("Content-Type"));
        if (d)
            for (e in h)
                if (h[e] && h[e].test(d)) {
                    i.unshift(e);
                    break
                }
        if (i[0] in c) f = i[0];
        else {
            for (e in c) {
                if (!i[0] || a.converters[e + " " + i[0]]) {
                    f = e;
                    break
                }
                g || (g = e)
            }
            f = f || g
        }
        if (f) return f !== i[0] && i.unshift(f), c[f]
    }

    function Qb(a, b, c, d) {
        var e, f, g, h, i, j = {},
            k = a.dataTypes.slice();
        if (k[1])
            for (g in a.converters) j[g.toLowerCase()] = a.converters[g];
        f = k.shift();
        while (f)
            if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift())
                if ("*" === f) f = i;
                else if ("*" !== i && i !== f) {
            if (g = j[i + " " + f] || j["* " + f], !g)
                for (e in j)
                    if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
                        g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));
                        break
                    }
            if (g !== !0)
                if (g && a["throws"]) b = g(b);
                else try {
                    b = g(b)
                } catch (l) {
                    return {
                        state: "parsererror",
                        error: g ? l : "No conversion from " + i + " to " + f
                    }
                }
        }
        return {
            state: "success",
            data: b
        }
    }
    r.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: {
            url: tb.href,
            type: "GET",
            isLocal: Fb.test(tb.protocol),
            global: !0,
            processData: !0,
            async: !0,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
                "*": Kb,
                text: "text/plain",
                html: "text/html",
                xml: "application/xml, text/xml",
                json: "application/json, text/javascript"
            },
            contents: {
                xml: /\bxml\b/,
                html: /\bhtml/,
                json: /\bjson\b/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText",
                json: "responseJSON"
            },
            converters: {
                "* text": String,
                "text html": !0,
                "text json": JSON.parse,
                "text xml": r.parseXML
            },
            flatOptions: {
                url: !0,
                context: !0
            }
        },
        ajaxSetup: function(a, b) {
            return b ? Ob(Ob(a, r.ajaxSettings), b) : Ob(r.ajaxSettings, a)
        },
        ajaxPrefilter: Mb(Ib),
        ajaxTransport: Mb(Jb),
        ajax: function(b, c) {
            "object" == typeof b && (c = b, b = void 0), c = c || {};
            var e, f, g, h, i, j, k, l, m, n, o = r.ajaxSetup({}, c),
                p = o.context || o,
                q = o.context && (p.nodeType || p.jquery) ? r(p) : r.event,
                s = r.Deferred(),
                t = r.Callbacks("once memory"),
                u = o.statusCode || {},
                v = {},
                w = {},
                x = "canceled",
                y = {
                    readyState: 0,
                    getResponseHeader: function(a) {
                        var b;
                        if (k) {
                            if (!h) {
                                h = {};
                                while (b = Eb.exec(g)) h[b[1].toLowerCase()] = b[2]
                            }
                            b = h[a.toLowerCase()]
                        }
                        return null == b ? null : b
                    },
                    getAllResponseHeaders: function() {
                        return k ? g : null
                    },
                    setRequestHeader: function(a, b) {
                        return null == k && (a = w[a.toLowerCase()] = w[a.toLowerCase()] || a, v[a] = b), this
                    },
                    overrideMimeType: function(a) {
                        return null == k && (o.mimeType = a), this
                    },
                    statusCode: function(a) {
                        var b;
                        if (a)
                            if (k) y.always(a[y.status]);
                            else
                                for (b in a) u[b] = [u[b], a[b]];
                        return this
                    },
                    abort: function(a) {
                        var b = a || x;
                        return e && e.abort(b), A(0, b), this
                    }
                };
            if (s.promise(y), o.url = ((b || o.url || tb.href) + "").replace(Hb, tb.protocol + "//"), o.type = c.method || c.type || o.method || o.type, o.dataTypes = (o.dataType || "*").toLowerCase().match(L) || [""], null == o.crossDomain) {
                j = d.createElement("a");
                try {
                    j.href = o.url, j.href = j.href, o.crossDomain = Lb.protocol + "//" + Lb.host != j.protocol + "//" + j.host
                } catch (z) {
                    o.crossDomain = !0
                }
            }
            if (o.data && o.processData && "string" != typeof o.data && (o.data = r.param(o.data, o.traditional)), Nb(Ib, o, c, y), k) return y;
            l = r.event && o.global, l && 0 === r.active++ && r.event.trigger("ajaxStart"), o.type = o.type.toUpperCase(), o.hasContent = !Gb.test(o.type), f = o.url.replace(Cb, ""), o.hasContent ? o.data && o.processData && 0 === (o.contentType || "").indexOf("application/x-www-form-urlencoded") && (o.data = o.data.replace(Bb, "+")) : (n = o.url.slice(f.length), o.data && (f += (vb.test(f) ? "&" : "?") + o.data, delete o.data), o.cache === !1 && (f = f.replace(Db, "$1"), n = (vb.test(f) ? "&" : "?") + "_=" + ub++ + n), o.url = f + n), o.ifModified && (r.lastModified[f] && y.setRequestHeader("If-Modified-Since", r.lastModified[f]), r.etag[f] && y.setRequestHeader("If-None-Match", r.etag[f])), (o.data && o.hasContent && o.contentType !== !1 || c.contentType) && y.setRequestHeader("Content-Type", o.contentType), y.setRequestHeader("Accept", o.dataTypes[0] && o.accepts[o.dataTypes[0]] ? o.accepts[o.dataTypes[0]] + ("*" !== o.dataTypes[0] ? ", " + Kb + "; q=0.01" : "") : o.accepts["*"]);
            for (m in o.headers) y.setRequestHeader(m, o.headers[m]);
            if (o.beforeSend && (o.beforeSend.call(p, y, o) === !1 || k)) return y.abort();
            if (x = "abort", t.add(o.complete), y.done(o.success), y.fail(o.error), e = Nb(Jb, o, c, y)) {
                if (y.readyState = 1, l && q.trigger("ajaxSend", [y, o]), k) return y;
                o.async && o.timeout > 0 && (i = a.setTimeout(function() {
                    y.abort("timeout")
                }, o.timeout));
                try {
                    k = !1, e.send(v, A)
                } catch (z) {
                    if (k) throw z;
                    A(-1, z)
                }
            } else A(-1, "No Transport");

            function A(b, c, d, h) {
                var j, m, n, v, w, x = c;
                k || (k = !0, i && a.clearTimeout(i), e = void 0, g = h || "", y.readyState = b > 0 ? 4 : 0, j = b >= 200 && b < 300 || 304 === b, d && (v = Pb(o, y, d)), v = Qb(o, v, y, j), j ? (o.ifModified && (w = y.getResponseHeader("Last-Modified"), w && (r.lastModified[f] = w), w = y.getResponseHeader("etag"), w && (r.etag[f] = w)), 204 === b || "HEAD" === o.type ? x = "nocontent" : 304 === b ? x = "notmodified" : (x = v.state, m = v.data, n = v.error, j = !n)) : (n = x, !b && x || (x = "error", b < 0 && (b = 0))), y.status = b, y.statusText = (c || x) + "", j ? s.resolveWith(p, [m, x, y]) : s.rejectWith(p, [y, x, n]), y.statusCode(u), u = void 0, l && q.trigger(j ? "ajaxSuccess" : "ajaxError", [y, o, j ? m : n]), t.fireWith(p, [y, x]), l && (q.trigger("ajaxComplete", [y, o]), --r.active || r.event.trigger("ajaxStop")))
            }
            return y
        },
        getJSON: function(a, b, c) {
            return r.get(a, b, c, "json")
        },
        getScript: function(a, b) {
            return r.get(a, void 0, b, "script")
        }
    }), r.each(["get", "post"], function(a, b) {
        r[b] = function(a, c, d, e) {
            return r.isFunction(c) && (e = e || d, d = c, c = void 0), r.ajax(r.extend({
                url: a,
                type: b,
                dataType: e,
                data: c,
                success: d
            }, r.isPlainObject(a) && a))
        }
    }), r._evalUrl = function(a) {
        return r.ajax({
            url: a,
            type: "GET",
            dataType: "script",
            cache: !0,
            async: !1,
            global: !1,
            "throws": !0
        })
    }, r.fn.extend({
        wrapAll: function(a) {
            var b;
            return this[0] && (r.isFunction(a) && (a = a.call(this[0])), b = r(a, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && b.insertBefore(this[0]), b.map(function() {
                var a = this;
                while (a.firstElementChild) a = a.firstElementChild;
                return a
            }).append(this)), this
        },
        wrapInner: function(a) {
            return r.isFunction(a) ? this.each(function(b) {
                r(this).wrapInner(a.call(this, b))
            }) : this.each(function() {
                var b = r(this),
                    c = b.contents();
                c.length ? c.wrapAll(a) : b.append(a)
            })
        },
        wrap: function(a) {
            var b = r.isFunction(a);
            return this.each(function(c) {
                r(this).wrapAll(b ? a.call(this, c) : a)
            })
        },
        unwrap: function(a) {
            return this.parent(a).not("body").each(function() {
                r(this).replaceWith(this.childNodes)
            }), this
        }
    }), r.expr.pseudos.hidden = function(a) {
        return !r.expr.pseudos.visible(a)
    }, r.expr.pseudos.visible = function(a) {
        return !!(a.offsetWidth || a.offsetHeight || a.getClientRects().length)
    }, r.ajaxSettings.xhr = function() {
        try {
            return new a.XMLHttpRequest
        } catch (b) {}
    };
    var Rb = {
            0: 200,
            1223: 204
        },
        Sb = r.ajaxSettings.xhr();
    o.cors = !!Sb && "withCredentials" in Sb, o.ajax = Sb = !!Sb, r.ajaxTransport(function(b) {
        var c, d;
        if (o.cors || Sb && !b.crossDomain) return {
            send: function(e, f) {
                var g, h = b.xhr();
                if (h.open(b.type, b.url, b.async, b.username, b.password), b.xhrFields)
                    for (g in b.xhrFields) h[g] = b.xhrFields[g];
                b.mimeType && h.overrideMimeType && h.overrideMimeType(b.mimeType), b.crossDomain || e["X-Requested-With"] || (e["X-Requested-With"] = "XMLHttpRequest");
                for (g in e) h.setRequestHeader(g, e[g]);
                c = function(a) {
                    return function() {
                        c && (c = d = h.onload = h.onerror = h.onabort = h.onreadystatechange = null, "abort" === a ? h.abort() : "error" === a ? "number" != typeof h.status ? f(0, "error") : f(h.status, h.statusText) : f(Rb[h.status] || h.status, h.statusText, "text" !== (h.responseType || "text") || "string" != typeof h.responseText ? {
                            binary: h.response
                        } : {
                            text: h.responseText
                        }, h.getAllResponseHeaders()))
                    }
                }, h.onload = c(), d = h.onerror = c("error"), void 0 !== h.onabort ? h.onabort = d : h.onreadystatechange = function() {
                    4 === h.readyState && a.setTimeout(function() {
                        c && d()
                    })
                }, c = c("abort");
                try {
                    h.send(b.hasContent && b.data || null)
                } catch (i) {
                    if (c) throw i
                }
            },
            abort: function() {
                c && c()
            }
        }
    }), r.ajaxPrefilter(function(a) {
        a.crossDomain && (a.contents.script = !1)
    }), r.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /\b(?:java|ecma)script\b/
        },
        converters: {
            "text script": function(a) {
                return r.globalEval(a), a
            }
        }
    }), r.ajaxPrefilter("script", function(a) {
        void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET")
    }), r.ajaxTransport("script", function(a) {
        if (a.crossDomain) {
            var b, c;
            return {
                send: function(e, f) {
                    b = r("<script>").prop({
                        charset: a.scriptCharset,
                        src: a.url
                    }).on("load error", c = function(a) {
                        b.remove(), c = null, a && f("error" === a.type ? 404 : 200, a.type)
                    }), d.head.appendChild(b[0])
                },
                abort: function() {
                    c && c()
                }
            }
        }
    });
    var Tb = [],
        Ub = /(=)\?(?=&|$)|\?\?/;
    r.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var a = Tb.pop() || r.expando + "_" + ub++;
            return this[a] = !0, a
        }
    }), r.ajaxPrefilter("json jsonp", function(b, c, d) {
        var e, f, g, h = b.jsonp !== !1 && (Ub.test(b.url) ? "url" : "string" == typeof b.data && 0 === (b.contentType || "").indexOf("application/x-www-form-urlencoded") && Ub.test(b.data) && "data");
        if (h || "jsonp" === b.dataTypes[0]) return e = b.jsonpCallback = r.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(Ub, "$1" + e) : b.jsonp !== !1 && (b.url += (vb.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function() {
            return g || r.error(e + " was not called"), g[0]
        }, b.dataTypes[0] = "json", f = a[e], a[e] = function() {
            g = arguments
        }, d.always(function() {
            void 0 === f ? r(a).removeProp(e) : a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, Tb.push(e)), g && r.isFunction(f) && f(g[0]), g = f = void 0
        }), "script"
    }), o.createHTMLDocument = function() {
        var a = d.implementation.createHTMLDocument("").body;
        return a.innerHTML = "<form></form><form></form>", 2 === a.childNodes.length
    }(), r.parseHTML = function(a, b, c) {
        if ("string" != typeof a) return [];
        "boolean" == typeof b && (c = b, b = !1);
        var e, f, g;
        return b || (o.createHTMLDocument ? (b = d.implementation.createHTMLDocument(""), e = b.createElement("base"), e.href = d.location.href, b.head.appendChild(e)) : b = d), f = C.exec(a), g = !c && [], f ? [b.createElement(f[1])] : (f = qa([a], b, g), g && g.length && r(g).remove(), r.merge([], f.childNodes))
    }, r.fn.load = function(a, b, c) {
        var d, e, f, g = this,
            h = a.indexOf(" ");
        return h > -1 && (d = pb(a.slice(h)), a = a.slice(0, h)), r.isFunction(b) ? (c = b, b = void 0) : b && "object" == typeof b && (e = "POST"), g.length > 0 && r.ajax({
            url: a,
            type: e || "GET",
            dataType: "html",
            data: b
        }).done(function(a) {
            f = arguments, g.html(d ? r("<div>").append(r.parseHTML(a)).find(d) : a)
        }).always(c && function(a, b) {
            g.each(function() {
                c.apply(this, f || [a.responseText, b, a])
            })
        }), this
    }, r.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(a, b) {
        r.fn[b] = function(a) {
            return this.on(b, a)
        }
    }), r.expr.pseudos.animated = function(a) {
        return r.grep(r.timers, function(b) {
            return a === b.elem
        }).length
    }, r.offset = {
        setOffset: function(a, b, c) {
            var d, e, f, g, h, i, j, k = r.css(a, "position"),
                l = r(a),
                m = {};
            "static" === k && (a.style.position = "relative"), h = l.offset(), f = r.css(a, "top"), i = r.css(a, "left"), j = ("absolute" === k || "fixed" === k) && (f + i).indexOf("auto") > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), r.isFunction(b) && (b = b.call(a, c, r.extend({}, h))), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), "using" in b ? b.using.call(a, m) : l.css(m)
        }
    }, r.fn.extend({
        offset: function(a) {
            if (arguments.length) return void 0 === a ? this : this.each(function(b) {
                r.offset.setOffset(this, a, b)
            });
            var b, c, d, e, f = this[0];
            if (f) return f.getClientRects().length ? (d = f.getBoundingClientRect(), b = f.ownerDocument, c = b.documentElement, e = b.defaultView, {
                top: d.top + e.pageYOffset - c.clientTop,
                left: d.left + e.pageXOffset - c.clientLeft
            }) : {
                top: 0,
                left: 0
            }
        },
        position: function() {
            if (this[0]) {
                var a, b, c = this[0],
                    d = {
                        top: 0,
                        left: 0
                    };
                return "fixed" === r.css(c, "position") ? b = c.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), B(a[0], "html") || (d = a.offset()), d = {
                    top: d.top + r.css(a[0], "borderTopWidth", !0),
                    left: d.left + r.css(a[0], "borderLeftWidth", !0)
                }), {
                    top: b.top - d.top - r.css(c, "marginTop", !0),
                    left: b.left - d.left - r.css(c, "marginLeft", !0)
                }
            }
        },
        offsetParent: function() {
            return this.map(function() {
                var a = this.offsetParent;
                while (a && "static" === r.css(a, "position")) a = a.offsetParent;
                return a || ra
            })
        }
    }), r.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(a, b) {
        var c = "pageYOffset" === b;
        r.fn[a] = function(d) {
            return T(this, function(a, d, e) {
                var f;
                return r.isWindow(a) ? f = a : 9 === a.nodeType && (f = a.defaultView), void 0 === e ? f ? f[b] : a[d] : void(f ? f.scrollTo(c ? f.pageXOffset : e, c ? e : f.pageYOffset) : a[d] = e)
            }, a, d, arguments.length)
        }
    }), r.each(["top", "left"], function(a, b) {
        r.cssHooks[b] = Pa(o.pixelPosition, function(a, c) {
            if (c) return c = Oa(a, b), Ma.test(c) ? r(a).position()[b] + "px" : c
        })
    }), r.each({
        Height: "height",
        Width: "width"
    }, function(a, b) {
        r.each({
            padding: "inner" + a,
            content: b,
            "": "outer" + a
        }, function(c, d) {
            r.fn[d] = function(e, f) {
                var g = arguments.length && (c || "boolean" != typeof e),
                    h = c || (e === !0 || f === !0 ? "margin" : "border");
                return T(this, function(b, c, e) {
                    var f;
                    return r.isWindow(b) ? 0 === d.indexOf("outer") ? b["inner" + a] : b.document.documentElement["client" + a] : 9 === b.nodeType ? (f = b.documentElement, Math.max(b.body["scroll" + a], f["scroll" + a], b.body["offset" + a], f["offset" + a], f["client" + a])) : void 0 === e ? r.css(b, c, h) : r.style(b, c, e, h)
                }, b, g ? e : void 0, g)
            }
        })
    }), r.fn.extend({
        bind: function(a, b, c) {
            return this.on(a, null, b, c)
        },
        unbind: function(a, b) {
            return this.off(a, null, b)
        },
        delegate: function(a, b, c, d) {
            return this.on(b, a, c, d)
        },
        undelegate: function(a, b, c) {
            return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c)
        }
    }), r.holdReady = function(a) {
        a ? r.readyWait++ : r.ready(!0)
    }, r.isArray = Array.isArray, r.parseJSON = JSON.parse, r.nodeName = B, "function" == typeof define && define.amd && define("jquery", [], function() {
        return r
    });
    var Vb = a.jQuery,
        Wb = a.$;
    return r.noConflict = function(b) {
        return a.$ === r && (a.$ = Wb), b && a.jQuery === r && (a.jQuery = Vb), r
    }, b || (a.jQuery = a.$ = r), r
});
/*! =========================================================
 *
 * Material Kit PRO - v2.0.2 (Bootstrap 4.0.0 Final Edition)
 *
 * =========================================================
 *
 * Product Page: https://www.creative-tim.com/product/material-kit-pro
 * Available with purchase of license from http://www.creative-tim.com/product/material-kit-pro
 * Copyright 2017 Creative Tim (https://www.creative-tim.com)
 * License Creative Tim (https://www.creative-tim.com/license)
 *
 * ========================================================= */


var big_image;

$(document).ready(function() {
    BrowserDetect.init();

    // Init Material scripts for buttons ripples, inputs animations etc, more info on the next link https://github.com/FezVrasta/bootstrap-material-design#materialjs
    $('body').bootstrapMaterialDesign();

    window_width = $(window).width();

    $navbar = $('.navbar[color-on-scroll]');
    scroll_distance = $navbar.attr('color-on-scroll') || 500;

    $navbar_collapse = $('.navbar').find('.navbar-collapse');

    //  Activate the Tooltips
    $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip();


    // FileInput
    $('.form-file-simple .inputFileVisible').click(function() {
        $(this).siblings('.inputFileHidden').trigger('click');
    });

    $('.form-file-simple .inputFileHidden').change(function() {
        var filename = $(this).val().replace(/C:\\fakepath\\/i, '');
        $(this).siblings('.inputFileVisible').val(filename);
    });

    $('.form-file-multiple .inputFileVisible, .form-file-multiple .input-group-btn').click(function() {
        $(this).parent().parent().find('.inputFileHidden').trigger('click');
        $(this).parent().parent().addClass('is-focused');
    });

    $('.form-file-multiple .inputFileHidden').change(function() {
        var names = '';
        for (var i = 0; i < $(this).get(0).files.length; ++i) {
            if (i < $(this).get(0).files.length - 1) {
                names += $(this).get(0).files.item(i).name + ',';
            } else {
                names += $(this).get(0).files.item(i).name;
            }
        }
        $(this).siblings('.input-group').find('.inputFileVisible').val(names);
    });

    $('.form-file-multiple .btn').on('focus', function() {
        $(this).parent().siblings().trigger('focus');
    });

    $('.form-file-multiple .btn').on('focusout', function() {
        $(this).parent().siblings().trigger('focusout');
    });

    //    Activate bootstrap-select
    if ($(".selectpicker").length != 0) {
        $(".selectpicker").selectpicker();
    }

    // Activate Popovers
    $('[data-toggle="popover"]').popover();

    // Active Carousel
    $('.carousel').carousel({
        interval: 3000
    });

    //Activate tags
    // we style the badges with our colors
    var tagClass = $('.tagsinput').data('color');

    if ($(".tagsinput").length != 0) {
        $('.tagsinput').tagsinput();
    }

    $('.bootstrap-tagsinput').addClass('' + tagClass + '-badge');

    if ($('.navbar-color-on-scroll').length != 0) {
        $(window).on('scroll', materialKit.checkScrollForTransparentNavbar);
    }

    materialKit.checkScrollForTransparentNavbar();

    if (window_width >= 768) {
        big_image = $('.page-header[data-parallax="true"]');
        if (big_image.length != 0) {
            $(window).on('scroll', materialKit.checkScrollForParallax);
        }

    }
});

$(window).on("load", function() {
    //initialise rotating cards
    materialKit.initRotateCard();

    //initialise colored shadow
    materialKit.initColoredShadows();
});

$(document).on('click', '.card-rotate .btn-rotate', function() {
    var $rotating_card_container = $(this).closest('.rotating-card-container');

    if ($rotating_card_container.hasClass('hover')) {
        $rotating_card_container.removeClass('hover');
    } else {
        $rotating_card_container.addClass('hover');
    }
});

$(document).on('click', '.navbar-toggler', function() {
    $toggle = $(this);

    if (materialKit.misc.navbar_menu_visible == 1) {
        $('html').removeClass('nav-open');
        materialKit.misc.navbar_menu_visible = 0;
        $('#bodyClick').remove();
        setTimeout(function() {
            $toggle.removeClass('toggled');
        }, 550);

        $('html').removeClass('nav-open-absolute');
    } else {
        setTimeout(function() {
            $toggle.addClass('toggled');
        }, 580);


        div = '<div id="bodyClick"></div>';
        $(div).appendTo("body").click(function() {
            $('html').removeClass('nav-open');

            if ($('nav').hasClass('navbar-absolute')) {
                $('html').removeClass('nav-open-absolute');
            }
            materialKit.misc.navbar_menu_visible = 0;
            $('#bodyClick').remove();
            setTimeout(function() {
                $toggle.removeClass('toggled');
            }, 550);
        });

        if ($('nav').hasClass('navbar-absolute')) {
            $('html').addClass('nav-open-absolute');
        }

        $('html').addClass('nav-open');
        materialKit.misc.navbar_menu_visible = 1;
    }
});

$(window).on('resize', function() {
    materialKit.initRotateCard();
});

materialKit = {
    misc: {
        navbar_menu_visible: 0,
        window_width: 0,
        transparent: true,
        colored_shadows: true,
        fixedTop: false,
        navbar_initialized: false,
        isWindow: document.documentMode || /Edge/.test(navigator.userAgent)
    },

    checkScrollForParallax: function() {
        oVal = ($(window).scrollTop() / 3);
        big_image.css({
            'transform': 'translate3d(0,' + oVal + 'px,0)',
            '-webkit-transform': 'translate3d(0,' + oVal + 'px,0)',
            '-ms-transform': 'translate3d(0,' + oVal + 'px,0)',
            '-o-transform': 'translate3d(0,' + oVal + 'px,0)'
        });
    },

    initFormExtendedDatetimepickers: function() {
        $('.datetimepicker').datetimepicker({
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-chevron-up",
                down: "fa fa-chevron-down",
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
        });

        $('.datepicker').datetimepicker({
            format: 'MM/DD/YYYY',
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-chevron-up",
                down: "fa fa-chevron-down",
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
        });

        $('.timepicker').datetimepicker({
            //          format: 'H:mm',    // use this format if you want the 24hours timepicker
            format: 'h:mm A', //use this format if you want the 12hours timpiecker with AM/PM toggle
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-chevron-up",
                down: "fa fa-chevron-down",
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'

            }
        });
    },


    initSliders: function() {
        // Sliders for demo purpose
        var slider = document.getElementById('sliderRegular');

        noUiSlider.create(slider, {
            start: 40,
            connect: [true, false],
            range: {
                min: 0,
                max: 100
            }
        });

        var slider2 = document.getElementById('sliderDouble');

        noUiSlider.create(slider2, {
            start: [20, 60],
            connect: true,
            range: {
                min: 0,
                max: 100
            }
        });
    },


    initColoredShadows: function() {
        if (materialKit.misc.colored_shadows == true) {
            if (!(BrowserDetect.browser == 'Explorer' && BrowserDetect.version <= 12)) {
                $('.card:not([data-colored-shadow="false"]) .card-header-image').each(function() {
                    $card_img = $(this);

                    is_on_dark_screen = $(this).closest('.section-dark, .section-image').length;

                    // we block the generator of the colored shadows on dark sections, because they are not natural
                    if (is_on_dark_screen == 0) {
                        var img_source = $card_img.find('img').attr('src');
                        var is_rotating = $card_img.closest('.card-rotate').length == 1 ? true : false;
                        var $append_div = $card_img;

                        var colored_shadow_div = $('<div class="colored-shadow"/>');

                        if (is_rotating) {
                            var card_image_height = $card_img.height();
                            var card_image_width = $card_img.width();

                            $(this).find('.back').css({
                                'height': card_image_height + 'px',
                                'width': card_image_width + 'px'
                            });
                            $append_div = $card_img.find('.front');
                        }

                        colored_shadow_div.css({
                            'background-image': 'url(' + img_source + ')'
                        }).appendTo($append_div);

                        if ($card_img.width() > 700) {
                            colored_shadow_div.addClass('colored-shadow-big');
                        }

                        setTimeout(function() {
                            colored_shadow_div.css('opacity', 1);
                        }, 200);
                    }

                });
            }
        }
    },

    initRotateCard: debounce(function() {
        $('.rotating-card-container .card-rotate').each(function() {
            var $this = $(this);

            var card_width = $(this).parent().width();
            var card_height = $(this).find('.front .card-body').outerHeight();

            $this.parent().css({
                'height': card_height + 'px',
                'margin-bottom': 30 + 'px'
            });

            $this.find('.front').css({
                'height': card_height + 35 + 'px',
                'width': card_width + 'px',
            });

            $this.find('.back').css({
                'height': card_height + 35 + 'px',
                'width': card_width + 'px',
            });
        });
    }, 50),

    checkScrollForTransparentNavbar: debounce(function() {
        if ($(document).scrollTop() > scroll_distance) {
            if (materialKit.misc.transparent) {
                materialKit.misc.transparent = false;
                $('.navbar-color-on-scroll').removeClass('navbar-transparent');
            }
        } else {
            if (!materialKit.misc.transparent) {
                materialKit.misc.transparent = true;
                $('.navbar-color-on-scroll').addClass('navbar-transparent');
            }
        }
    }, 17)
};
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this,
            args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
}

var BrowserDetect = {
    init: function() {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },
    searchString: function(data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) !== -1) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function(dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }

        var rv = dataString.indexOf("rv:");
        if (this.versionSearchString === "Trident" && rv !== -1) {
            return parseFloat(dataString.substring(rv + 3));
        } else {
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }
    },

    dataBrowser: [{
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
        },
        {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer"
        },
        {
            string: navigator.userAgent,
            subString: "Trident",
            identity: "Explorer"
        },
        {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
        },
        {
            string: navigator.userAgent,
            subString: "Safari",
            identity: "Safari"
        },
        {
            string: navigator.userAgent,
            subString: "Opera",
            identity: "Opera"
        }
    ]

};

var better_browser = '<div class="container"><div class="better-browser row"><div class="col-md-2"></div><div class="col-md-8"><h3>We are sorry but it looks like your Browser doesn\'t support our website Features. In order to get the full experience please download a new version of your favourite browser.</h3></div><div class="col-md-2"></div><br><div class="col-md-4"><a href="https://www.mozilla.org/ro/firefox/new/" class="btn btn-warning">Mozilla</a><br></div><div class="col-md-4"><a href="https://www.google.com/chrome/browser/desktop/index.html" class="btn ">Chrome</a><br></div><div class="col-md-4"><a href="http://windows.microsoft.com/en-us/internet-explorer/ie-11-worldwide-languages" class="btn">Internet Explorer</a><br></div><br><br><h4>Thank you!</h4></div></div>';
var big_image;
$(document).ready(function() {
    BrowserDetect.init(), $('body').bootstrapMaterialDesign(), window_width = $(window).width(), $navbar = $('.navbar[color-on-scroll]'), scroll_distance = $navbar.attr('color-on-scroll') || 500, $navbar_collapse = $('.navbar').find('.navbar-collapse'), $('[data-toggle="tooltip"], [rel="tooltip"]').tooltip(), $('.form-file-simple .inputFileVisible').click(function() {
        $(this).siblings('.inputFileHidden').trigger('click')
    }), $('.form-file-simple .inputFileHidden').change(function() {
        var a = $(this).val().replace(/C:\\fakepath\\/i, '');
        $(this).siblings('.inputFileVisible').val(a)
    }), $('.form-file-multiple .inputFileVisible, .form-file-multiple .input-group-btn').click(function() {
        $(this).parent().parent().find('.inputFileHidden').trigger('click'), $(this).parent().parent().addClass('is-focused')
    }), $('.form-file-multiple .inputFileHidden').change(function() {
        for (var a = '', b = 0; b < $(this).get(0).files.length; ++b) a += b < $(this).get(0).files.length - 1 ? $(this).get(0).files.item(b).name + ',' : $(this).get(0).files.item(b).name;
        $(this).siblings('.input-group').find('.inputFileVisible').val(a)
    }), $('.form-file-multiple .btn').on('focus', function() {
        $(this).parent().siblings().trigger('focus')
    }), $('.form-file-multiple .btn').on('focusout', function() {
        $(this).parent().siblings().trigger('focusout')
    }), 0 != $('.selectpicker').length && $('.selectpicker').selectpicker(), $('[data-toggle="popover"]').popover(), $('.carousel').carousel({
        interval: 3e3
    });
    var a = $('.tagsinput').data('color');
    0 != $('.tagsinput').length && $('.tagsinput').tagsinput(), $('.bootstrap-tagsinput').addClass('' + a + '-badge'), 0 != $('.navbar-color-on-scroll').length && $(window).on('scroll', materialKit.checkScrollForTransparentNavbar), materialKit.checkScrollForTransparentNavbar(), 768 <= window_width && (big_image = $('.page-header[data-parallax="true"]'), 0 != big_image.length && $(window).on('scroll', materialKit.checkScrollForParallax))
}), $(window).on('load', function() {
    materialKit.initRotateCard(), materialKit.initColoredShadows()
}), $(document).on('click', '.card-rotate .btn-rotate', function() {
    var a = $(this).closest('.rotating-card-container');
    a.hasClass('hover') ? a.removeClass('hover') : a.addClass('hover')
}), $(document).on('click', '.navbar-toggler', function() {
    $toggle = $(this), 1 == materialKit.misc.navbar_menu_visible ? ($('html').removeClass('nav-open'), materialKit.misc.navbar_menu_visible = 0, $('#bodyClick').remove(), setTimeout(function() {
        $toggle.removeClass('toggled')
    }, 550), $('html').removeClass('nav-open-absolute')) : (setTimeout(function() {
        $toggle.addClass('toggled')
    }, 580), div = '<div id="bodyClick"></div>', $(div).appendTo('body').click(function() {
        $('html').removeClass('nav-open'), $('nav').hasClass('navbar-absolute') && $('html').removeClass('nav-open-absolute'), materialKit.misc.navbar_menu_visible = 0, $('#bodyClick').remove(), setTimeout(function() {
            $toggle.removeClass('toggled')
        }, 550)
    }), $('nav').hasClass('navbar-absolute') && $('html').addClass('nav-open-absolute'), $('html').addClass('nav-open'), materialKit.misc.navbar_menu_visible = 1)
}), $(window).on('resize', function() {
    materialKit.initRotateCard()
}), materialKit = {
    misc: {
        navbar_menu_visible: 0,
        window_width: 0,
        transparent: !0,
        colored_shadows: !0,
        fixedTop: !1,
        navbar_initialized: !1,
        isWindow: document.documentMode || /Edge/.test(navigator.userAgent)
    },
    checkScrollForParallax: function() {
        oVal = $(window).scrollTop() / 3, big_image.css({
            transform: 'translate3d(0,' + oVal + 'px,0)',
            "-webkit-transform": 'translate3d(0,' + oVal + 'px,0)',
            "-ms-transform": 'translate3d(0,' + oVal + 'px,0)',
            "-o-transform": 'translate3d(0,' + oVal + 'px,0)'
        })
    },
    initFormExtendedDatetimepickers: function() {
        $('.datetimepicker').datetimepicker({
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
        }), $('.datepicker').datetimepicker({
            format: 'MM/DD/YYYY',
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
        }), $('.timepicker').datetimepicker({
            format: 'h:mm A',
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                previous: 'fa fa-chevron-left',
                next: 'fa fa-chevron-right',
                today: 'fa fa-screenshot',
                clear: 'fa fa-trash',
                close: 'fa fa-remove'
            }
        })
    },
    initSliders: function() {
        var a = document.getElementById('sliderRegular');
        noUiSlider.create(a, {
            start: 40,
            connect: [!0, !1],
            range: {
                min: 0,
                max: 100
            }
        });
        var b = document.getElementById('sliderDouble');
        noUiSlider.create(b, {
            start: [20, 60],
            connect: !0,
            range: {
                min: 0,
                max: 100
            }
        })
    },
    initColoredShadows: function() {
        !0 != materialKit.misc.colored_shadows || 'Explorer' == BrowserDetect.browser && 12 >= BrowserDetect.version || $('.card:not([data-colored-shadow="false"]) .card-header-image').each(function() {
            if ($card_img = $(this), is_on_dark_screen = $(this).closest('.section-dark, .section-image').length, 0 == is_on_dark_screen) {
                var a = $card_img.find('img').attr('src'),
                    b = 1 == $card_img.closest('.card-rotate').length,
                    c = $card_img,
                    d = $('<div class="colored-shadow"/>');
                if (b) {
                    var e = $card_img.height(),
                        f = $card_img.width();
                    $(this).find('.back').css({
                        height: e + 'px',
                        width: f + 'px'
                    }), c = $card_img.find('.front')
                }
                d.css({
                    "background-image": 'url(' + a + ')'
                }).appendTo(c), 700 < $card_img.width() && d.addClass('colored-shadow-big'), setTimeout(function() {
                    d.css('opacity', 1)
                }, 200)
            }
        })
    },
    initRotateCard: debounce(function() {
        $('.rotating-card-container .card-rotate').each(function() {
            var a = $(this),
                b = $(this).parent().width(),
                c = $(this).find('.front .card-body').outerHeight();
            a.parent().css({
                height: c + 'px',
                "margin-bottom": '30px'
            }), a.find('.front').css({
                height: c + 35 + 'px',
                width: b + 'px'
            }), a.find('.back').css({
                height: c + 35 + 'px',
                width: b + 'px'
            })
        })
    }, 50),
    checkScrollForTransparentNavbar: debounce(function() {
        $(document).scrollTop() > scroll_distance ? materialKit.misc.transparent && (materialKit.misc.transparent = !1, $('.navbar-color-on-scroll').removeClass('navbar-transparent')) : !materialKit.misc.transparent && (materialKit.misc.transparent = !0, $('.navbar-color-on-scroll').addClass('navbar-transparent'))
    }, 17)
};

function debounce(a, b, c) {
    var d;
    return function() {
        var e = this,
            f = arguments;
        clearTimeout(d), d = setTimeout(function() {
            d = null, c || a.apply(e, f)
        }, b), c && !d && a.apply(e, f)
    }
}
var BrowserDetect = {
        init: function() {
            this.browser = this.searchString(this.dataBrowser) || 'Other', this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || 'Unknown'
        },
        searchString: function(a) {
            for (var b, c = 0; c < a.length; c++)
                if (b = a[c].string, this.versionSearchString = a[c].subString, -1 !== b.indexOf(a[c].subString)) return a[c].identity
        },
        searchVersion: function(a) {
            var b = a.indexOf(this.versionSearchString);
            if (-1 !== b) {
                var c = a.indexOf('rv:');
                return 'Trident' === this.versionSearchString && -1 !== c ? parseFloat(a.substring(c + 3)) : parseFloat(a.substring(b + this.versionSearchString.length + 1))
            }
        },
        dataBrowser: [{
            string: navigator.userAgent,
            subString: 'Chrome',
            identity: 'Chrome'
        }, {
            string: navigator.userAgent,
            subString: 'MSIE',
            identity: 'Explorer'
        }, {
            string: navigator.userAgent,
            subString: 'Trident',
            identity: 'Explorer'
        }, {
            string: navigator.userAgent,
            subString: 'Firefox',
            identity: 'Firefox'
        }, {
            string: navigator.userAgent,
            subString: 'Safari',
            identity: 'Safari'
        }, {
            string: navigator.userAgent,
            subString: 'Opera',
            identity: 'Opera'
        }]
    },
    better_browser = '<div class="container"><div class="better-browser row"><div class="col-md-2"></div><div class="col-md-8"><h3>We are sorry but it looks like your Browser doesn\'t support our website Features. In order to get the full experience please download a new version of your favourite browser.</h3></div><div class="col-md-2"></div><br><div class="col-md-4"><a href="https://www.mozilla.org/ro/firefox/new/" class="btn btn-warning">Mozilla</a><br></div><div class="col-md-4"><a href="https://www.google.com/chrome/browser/desktop/index.html" class="btn ">Chrome</a><br></div><div class="col-md-4"><a href="http://windows.microsoft.com/en-us/internet-explorer/ie-11-worldwide-languages" class="btn">Internet Explorer</a><br></div><br><br><h4>Thank you!</h4></div></div>';
/*
 Copyright (C) Federico Zivolo 2017
 Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
 */

(function(e, t) {
    'object' == typeof exports && 'undefined' != typeof module ? module.exports = t() : 'function' == typeof define && define.amd ? define(t) : e.Popper = t()
})(this, function() {
    'use strict';

    function e(e) {
        return e && '[object Function]' === {}.toString.call(e)
    }

    function t(e, t) {
        if (1 !== e.nodeType) return [];
        var o = window.getComputedStyle(e, null);
        return t ? o[t] : o
    }

    function o(e) {
        return 'HTML' === e.nodeName ? e : e.parentNode || e.host
    }

    function n(e) {
        if (!e || -1 !== ['HTML', 'BODY', '#document'].indexOf(e.nodeName)) return window.document.body;
        var i = t(e),
            r = i.overflow,
            p = i.overflowX,
            s = i.overflowY;
        return /(auto|scroll)/.test(r + s + p) ? e : n(o(e))
    }

    function r(e) {
        var o = e && e.offsetParent,
            i = o && o.nodeName;
        return i && 'BODY' !== i && 'HTML' !== i ? -1 !== ['TD', 'TABLE'].indexOf(o.nodeName) && 'static' === t(o, 'position') ? r(o) : o : window.document.documentElement
    }

    function p(e) {
        var t = e.nodeName;
        return 'BODY' !== t && ('HTML' === t || r(e.firstElementChild) === e)
    }

    function s(e) {
        return null === e.parentNode ? e : s(e.parentNode)
    }

    function d(e, t) {
        if (!e || !e.nodeType || !t || !t.nodeType) return window.document.documentElement;
        var o = e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING,
            i = o ? e : t,
            n = o ? t : e,
            a = document.createRange();
        a.setStart(i, 0), a.setEnd(n, 0);
        var f = a.commonAncestorContainer;
        if (e !== f && t !== f || i.contains(n)) return p(f) ? f : r(f);
        var l = s(e);
        return l.host ? d(l.host, t) : d(e, s(t).host)
    }

    function a(e) {
        var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 'top',
            o = 'top' === t ? 'scrollTop' : 'scrollLeft',
            i = e.nodeName;
        if ('BODY' === i || 'HTML' === i) {
            var n = window.document.documentElement,
                r = window.document.scrollingElement || n;
            return r[o]
        }
        return e[o]
    }

    function f(e, t) {
        var o = 2 < arguments.length && void 0 !== arguments[2] && arguments[2],
            i = a(t, 'top'),
            n = a(t, 'left'),
            r = o ? -1 : 1;
        return e.top += i * r, e.bottom += i * r, e.left += n * r, e.right += n * r, e
    }

    function l(e, t) {
        var o = 'x' === t ? 'Left' : 'Top',
            i = 'Left' == o ? 'Right' : 'Bottom';
        return +e['border' + o + 'Width'].split('px')[0] + +e['border' + i + 'Width'].split('px')[0]
    }

    function m(e, t, o, i) {
        return _(t['offset' + e], o['client' + e], o['offset' + e], ie() ? o['offset' + e] + i['margin' + ('Height' === e ? 'Top' : 'Left')] + i['margin' + ('Height' === e ? 'Bottom' : 'Right')] : 0)
    }

    function h() {
        var e = window.document.body,
            t = window.document.documentElement,
            o = ie() && window.getComputedStyle(t);
        return {
            height: m('Height', e, t, o),
            width: m('Width', e, t, o)
        }
    }

    function c(e) {
        return se({}, e, {
            right: e.left + e.width,
            bottom: e.top + e.height
        })
    }

    function g(e) {
        var o = {};
        if (ie()) try {
            o = e.getBoundingClientRect();
            var i = a(e, 'top'),
                n = a(e, 'left');
            o.top += i, o.left += n, o.bottom += i, o.right += n
        } catch (e) {} else o = e.getBoundingClientRect();
        var r = {
                left: o.left,
                top: o.top,
                width: o.right - o.left,
                height: o.bottom - o.top
            },
            p = 'HTML' === e.nodeName ? h() : {},
            s = p.width || e.clientWidth || r.right - r.left,
            d = p.height || e.clientHeight || r.bottom - r.top,
            f = e.offsetWidth - s,
            m = e.offsetHeight - d;
        if (f || m) {
            var g = t(e);
            f -= l(g, 'x'), m -= l(g, 'y'), r.width -= f, r.height -= m
        }
        return c(r)
    }

    function u(e, o) {
        var i = ie(),
            r = 'HTML' === o.nodeName,
            p = g(e),
            s = g(o),
            d = n(e),
            a = t(o),
            l = +a.borderTopWidth.split('px')[0],
            m = +a.borderLeftWidth.split('px')[0],
            h = c({
                top: p.top - s.top - l,
                left: p.left - s.left - m,
                width: p.width,
                height: p.height
            });
        if (h.marginTop = 0, h.marginLeft = 0, !i && r) {
            var u = +a.marginTop.split('px')[0],
                b = +a.marginLeft.split('px')[0];
            h.top -= l - u, h.bottom -= l - u, h.left -= m - b, h.right -= m - b, h.marginTop = u, h.marginLeft = b
        }
        return (i ? o.contains(d) : o === d && 'BODY' !== d.nodeName) && (h = f(h, o)), h
    }

    function b(e) {
        var t = window.document.documentElement,
            o = u(e, t),
            i = _(t.clientWidth, window.innerWidth || 0),
            n = _(t.clientHeight, window.innerHeight || 0),
            r = a(t),
            p = a(t, 'left'),
            s = {
                top: r - o.top + o.marginTop,
                left: p - o.left + o.marginLeft,
                width: i,
                height: n
            };
        return c(s)
    }

    function y(e) {
        var i = e.nodeName;
        return 'BODY' === i || 'HTML' === i ? !1 : 'fixed' === t(e, 'position') || y(o(e))
    }

    function w(e, t, i, r) {
        var p = {
                top: 0,
                left: 0
            },
            s = d(e, t);
        if ('viewport' === r) p = b(s);
        else {
            var a;
            'scrollParent' === r ? (a = n(o(e)), 'BODY' === a.nodeName && (a = window.document.documentElement)) : 'window' === r ? a = window.document.documentElement : a = r;
            var f = u(a, s);
            if ('HTML' === a.nodeName && !y(s)) {
                var l = h(),
                    m = l.height,
                    c = l.width;
                p.top += f.top - f.marginTop, p.bottom = m + f.top, p.left += f.left - f.marginLeft, p.right = c + f.left
            } else p = f
        }
        return p.left += i, p.top += i, p.right -= i, p.bottom -= i, p
    }

    function v(e) {
        var t = e.width,
            o = e.height;
        return t * o
    }

    function E(e, t, o, i, n) {
        var r = 5 < arguments.length && void 0 !== arguments[5] ? arguments[5] : 0;
        if (-1 === e.indexOf('auto')) return e;
        var p = w(o, i, r, n),
            s = {
                top: {
                    width: p.width,
                    height: t.top - p.top
                },
                right: {
                    width: p.right - t.right,
                    height: p.height
                },
                bottom: {
                    width: p.width,
                    height: p.bottom - t.bottom
                },
                left: {
                    width: t.left - p.left,
                    height: p.height
                }
            },
            d = Object.keys(s).map(function(e) {
                return se({
                    key: e
                }, s[e], {
                    area: v(s[e])
                })
            }).sort(function(e, t) {
                return t.area - e.area
            }),
            a = d.filter(function(e) {
                var t = e.width,
                    i = e.height;
                return t >= o.clientWidth && i >= o.clientHeight
            }),
            f = 0 < a.length ? a[0].key : d[0].key,
            l = e.split('-')[1];
        return f + (l ? '-' + l : '')
    }

    function x(e, t, o) {
        var i = d(t, o);
        return u(o, i)
    }

    function O(e) {
        var t = window.getComputedStyle(e),
            o = parseFloat(t.marginTop) + parseFloat(t.marginBottom),
            i = parseFloat(t.marginLeft) + parseFloat(t.marginRight),
            n = {
                width: e.offsetWidth + i,
                height: e.offsetHeight + o
            };
        return n
    }

    function L(e) {
        var t = {
            left: 'right',
            right: 'left',
            bottom: 'top',
            top: 'bottom'
        };
        return e.replace(/left|right|bottom|top/g, function(e) {
            return t[e]
        })
    }

    function S(e, t, o) {
        o = o.split('-')[0];
        var i = O(e),
            n = {
                width: i.width,
                height: i.height
            },
            r = -1 !== ['right', 'left'].indexOf(o),
            p = r ? 'top' : 'left',
            s = r ? 'left' : 'top',
            d = r ? 'height' : 'width',
            a = r ? 'width' : 'height';
        return n[p] = t[p] + t[d] / 2 - i[d] / 2, n[s] = o === s ? t[s] - i[a] : t[L(s)], n
    }

    function T(e, t) {
        return Array.prototype.find ? e.find(t) : e.filter(t)[0]
    }

    function C(e, t, o) {
        if (Array.prototype.findIndex) return e.findIndex(function(e) {
            return e[t] === o
        });
        var i = T(e, function(e) {
            return e[t] === o
        });
        return e.indexOf(i)
    }

    function N(t, o, i) {
        var n = void 0 === i ? t : t.slice(0, C(t, 'name', i));
        return n.forEach(function(t) {
            t.function && console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
            var i = t.function || t.fn;
            t.enabled && e(i) && (o.offsets.popper = c(o.offsets.popper), o.offsets.reference = c(o.offsets.reference), o = i(o, t))
        }), o
    }

    function k() {
        if (!this.state.isDestroyed) {
            var e = {
                instance: this,
                styles: {},
                attributes: {},
                flipped: !1,
                offsets: {}
            };
            e.offsets.reference = x(this.state, this.popper, this.reference), e.placement = E(this.options.placement, e.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding), e.originalPlacement = e.placement, e.offsets.popper = S(this.popper, e.offsets.reference, e.placement), e.offsets.popper.position = 'absolute', e = N(this.modifiers, e), this.state.isCreated ? this.options.onUpdate(e) : (this.state.isCreated = !0, this.options.onCreate(e))
        }
    }

    function W(e, t) {
        return e.some(function(e) {
            var o = e.name,
                i = e.enabled;
            return i && o === t
        })
    }

    function B(e) {
        for (var t = [!1, 'ms', 'Webkit', 'Moz', 'O'], o = e.charAt(0).toUpperCase() + e.slice(1), n = 0; n < t.length - 1; n++) {
            var i = t[n],
                r = i ? '' + i + o : e;
            if ('undefined' != typeof window.document.body.style[r]) return r
        }
        return null
    }

    function D() {
        return this.state.isDestroyed = !0, W(this.modifiers, 'applyStyle') && (this.popper.removeAttribute('x-placement'), this.popper.style.left = '', this.popper.style.position = '', this.popper.style.top = '', this.popper.style[B('transform')] = ''), this.disableEventListeners(), this.options.removeOnDestroy && this.popper.parentNode.removeChild(this.popper), this
    }

    function H(e, t, o, i) {
        var r = 'BODY' === e.nodeName,
            p = r ? window : e;
        p.addEventListener(t, o, {
            passive: !0
        }), r || H(n(p.parentNode), t, o, i), i.push(p)
    }

    function P(e, t, o, i) {
        o.updateBound = i, window.addEventListener('resize', o.updateBound, {
            passive: !0
        });
        var r = n(e);
        return H(r, 'scroll', o.updateBound, o.scrollParents), o.scrollElement = r, o.eventsEnabled = !0, o
    }

    function A() {
        this.state.eventsEnabled || (this.state = P(this.reference, this.options, this.state, this.scheduleUpdate))
    }

    function M(e, t) {
        return window.removeEventListener('resize', t.updateBound), t.scrollParents.forEach(function(e) {
            e.removeEventListener('scroll', t.updateBound)
        }), t.updateBound = null, t.scrollParents = [], t.scrollElement = null, t.eventsEnabled = !1, t
    }

    function I() {
        this.state.eventsEnabled && (window.cancelAnimationFrame(this.scheduleUpdate), this.state = M(this.reference, this.state))
    }

    function R(e) {
        return '' !== e && !isNaN(parseFloat(e)) && isFinite(e)
    }

    function U(e, t) {
        Object.keys(t).forEach(function(o) {
            var i = ''; - 1 !== ['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(o) && R(t[o]) && (i = 'px'), e.style[o] = t[o] + i
        })
    }

    function Y(e, t) {
        Object.keys(t).forEach(function(o) {
            var i = t[o];
            !1 === i ? e.removeAttribute(o) : e.setAttribute(o, t[o])
        })
    }

    function F(e, t, o) {
        var i = T(e, function(e) {
                var o = e.name;
                return o === t
            }),
            n = !!i && e.some(function(e) {
                return e.name === o && e.enabled && e.order < i.order
            });
        if (!n) {
            var r = '`' + t + '`';
            console.warn('`' + o + '`' + ' modifier is required by ' + r + ' modifier in order to work, be sure to include it before ' + r + '!')
        }
        return n
    }

    function j(e) {
        return 'end' === e ? 'start' : 'start' === e ? 'end' : e
    }

    function K(e) {
        var t = 1 < arguments.length && void 0 !== arguments[1] && arguments[1],
            o = ae.indexOf(e),
            i = ae.slice(o + 1).concat(ae.slice(0, o));
        return t ? i.reverse() : i
    }

    function q(e, t, o, i) {
        var n = e.match(/((?:\-|\+)?\d*\.?\d*)(.*)/),
            r = +n[1],
            p = n[2];
        if (!r) return e;
        if (0 === p.indexOf('%')) {
            var s;
            switch (p) {
                case '%p':
                    s = o;
                    break;
                case '%':
                case '%r':
                default:
                    s = i;
            }
            var d = c(s);
            return d[t] / 100 * r
        }
        if ('vh' === p || 'vw' === p) {
            var a;
            return a = 'vh' === p ? _(document.documentElement.clientHeight, window.innerHeight || 0) : _(document.documentElement.clientWidth, window.innerWidth || 0), a / 100 * r
        }
        return r
    }

    function G(e, t, o, i) {
        var n = [0, 0],
            r = -1 !== ['right', 'left'].indexOf(i),
            p = e.split(/(\+|\-)/).map(function(e) {
                return e.trim()
            }),
            s = p.indexOf(T(p, function(e) {
                return -1 !== e.search(/,|\s/)
            }));
        p[s] && -1 === p[s].indexOf(',') && console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
        var d = /\s*,\s*|\s+/,
            a = -1 === s ? [p] : [p.slice(0, s).concat([p[s].split(d)[0]]), [p[s].split(d)[1]].concat(p.slice(s + 1))];
        return a = a.map(function(e, i) {
            var n = (1 === i ? !r : r) ? 'height' : 'width',
                p = !1;
            return e.reduce(function(e, t) {
                return '' === e[e.length - 1] && -1 !== ['+', '-'].indexOf(t) ? (e[e.length - 1] = t, p = !0, e) : p ? (e[e.length - 1] += t, p = !1, e) : e.concat(t)
            }, []).map(function(e) {
                return q(e, n, t, o)
            })
        }), a.forEach(function(e, t) {
            e.forEach(function(o, i) {
                R(o) && (n[t] += o * ('-' === e[i - 1] ? -1 : 1))
            })
        }), n
    }
    for (var z = Math.min, V = Math.floor, _ = Math.max, X = ['native code', '[object MutationObserverConstructor]'], Q = function(e) {
            return X.some(function(t) {
                return -1 < (e || '').toString().indexOf(t)
            })
        }, J = 'undefined' != typeof window, Z = ['Edge', 'Trident', 'Firefox'], $ = 0, ee = 0; ee < Z.length; ee += 1)
        if (J && 0 <= navigator.userAgent.indexOf(Z[ee])) {
            $ = 1;
            break
        }
    var i, te = J && Q(window.MutationObserver),
        oe = te ? function(e) {
            var t = !1,
                o = 0,
                i = document.createElement('span'),
                n = new MutationObserver(function() {
                    e(), t = !1
                });
            return n.observe(i, {
                    attributes: !0
                }),
                function() {
                    t || (t = !0, i.setAttribute('x-index', o), ++o)
                }
        } : function(e) {
            var t = !1;
            return function() {
                t || (t = !0, setTimeout(function() {
                    t = !1, e()
                }, $))
            }
        },
        ie = function() {
            return void 0 == i && (i = -1 !== navigator.appVersion.indexOf('MSIE 10')), i
        },
        ne = function(e, t) {
            if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function')
        },
        re = function() {
            function e(e, t) {
                for (var o, n = 0; n < t.length; n++) o = t[n], o.enumerable = o.enumerable || !1, o.configurable = !0, 'value' in o && (o.writable = !0), Object.defineProperty(e, o.key, o)
            }
            return function(t, o, i) {
                return o && e(t.prototype, o), i && e(t, i), t
            }
        }(),
        pe = function(e, t, o) {
            return t in e ? Object.defineProperty(e, t, {
                value: o,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }) : e[t] = o, e
        },
        se = Object.assign || function(e) {
            for (var t, o = 1; o < arguments.length; o++)
                for (var i in t = arguments[o], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
            return e
        },
        de = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'],
        ae = de.slice(3),
        fe = {
            FLIP: 'flip',
            CLOCKWISE: 'clockwise',
            COUNTERCLOCKWISE: 'counterclockwise'
        },
        le = function() {
            function t(o, i) {
                var n = this,
                    r = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {};
                ne(this, t), this.scheduleUpdate = function() {
                    return requestAnimationFrame(n.update)
                }, this.update = oe(this.update.bind(this)), this.options = se({}, t.Defaults, r), this.state = {
                    isDestroyed: !1,
                    isCreated: !1,
                    scrollParents: []
                }, this.reference = o.jquery ? o[0] : o, this.popper = i.jquery ? i[0] : i, this.options.modifiers = {}, Object.keys(se({}, t.Defaults.modifiers, r.modifiers)).forEach(function(e) {
                    n.options.modifiers[e] = se({}, t.Defaults.modifiers[e] || {}, r.modifiers ? r.modifiers[e] : {})
                }), this.modifiers = Object.keys(this.options.modifiers).map(function(e) {
                    return se({
                        name: e
                    }, n.options.modifiers[e])
                }).sort(function(e, t) {
                    return e.order - t.order
                }), this.modifiers.forEach(function(t) {
                    t.enabled && e(t.onLoad) && t.onLoad(n.reference, n.popper, n.options, t, n.state)
                }), this.update();
                var p = this.options.eventsEnabled;
                p && this.enableEventListeners(), this.state.eventsEnabled = p
            }
            return re(t, [{
                key: 'update',
                value: function() {
                    return k.call(this)
                }
            }, {
                key: 'destroy',
                value: function() {
                    return D.call(this)
                }
            }, {
                key: 'enableEventListeners',
                value: function() {
                    return A.call(this)
                }
            }, {
                key: 'disableEventListeners',
                value: function() {
                    return I.call(this)
                }
            }]), t
        }();
    return le.Utils = ('undefined' == typeof window ? global : window).PopperUtils, le.placements = de, le.Defaults = {
        placement: 'bottom',
        eventsEnabled: !0,
        removeOnDestroy: !1,
        onCreate: function() {},
        onUpdate: function() {},
        modifiers: {
            shift: {
                order: 100,
                enabled: !0,
                fn: function(e) {
                    var t = e.placement,
                        o = t.split('-')[0],
                        i = t.split('-')[1];
                    if (i) {
                        var n = e.offsets,
                            r = n.reference,
                            p = n.popper,
                            s = -1 !== ['bottom', 'top'].indexOf(o),
                            d = s ? 'left' : 'top',
                            a = s ? 'width' : 'height',
                            f = {
                                start: pe({}, d, r[d]),
                                end: pe({}, d, r[d] + r[a] - p[a])
                            };
                        e.offsets.popper = se({}, p, f[i])
                    }
                    return e
                }
            },
            offset: {
                order: 200,
                enabled: !0,
                fn: function(e, t) {
                    var o, i = t.offset,
                        n = e.placement,
                        r = e.offsets,
                        p = r.popper,
                        s = r.reference,
                        d = n.split('-')[0];
                    return o = R(+i) ? [+i, 0] : G(i, p, s, d), 'left' === d ? (p.top += o[0], p.left -= o[1]) : 'right' === d ? (p.top += o[0], p.left += o[1]) : 'top' === d ? (p.left += o[0], p.top -= o[1]) : 'bottom' === d && (p.left += o[0], p.top += o[1]), e.popper = p, e
                },
                offset: 0
            },
            preventOverflow: {
                order: 300,
                enabled: !0,
                fn: function(e, t) {
                    var o = t.boundariesElement || r(e.instance.popper);
                    e.instance.reference === o && (o = r(o));
                    var i = w(e.instance.popper, e.instance.reference, t.padding, o);
                    t.boundaries = i;
                    var n = t.priority,
                        p = e.offsets.popper,
                        s = {
                            primary: function(e) {
                                var o = p[e];
                                return p[e] < i[e] && !t.escapeWithReference && (o = _(p[e], i[e])), pe({}, e, o)
                            },
                            secondary: function(e) {
                                var o = 'right' === e ? 'left' : 'top',
                                    n = p[o];
                                return p[e] > i[e] && !t.escapeWithReference && (n = z(p[o], i[e] - ('right' === e ? p.width : p.height))), pe({}, o, n)
                            }
                        };
                    return n.forEach(function(e) {
                        var t = -1 === ['left', 'top'].indexOf(e) ? 'secondary' : 'primary';
                        p = se({}, p, s[t](e))
                    }), e.offsets.popper = p, e
                },
                priority: ['left', 'right', 'top', 'bottom'],
                padding: 5,
                boundariesElement: 'scrollParent'
            },
            keepTogether: {
                order: 400,
                enabled: !0,
                fn: function(e) {
                    var t = e.offsets,
                        o = t.popper,
                        i = t.reference,
                        n = e.placement.split('-')[0],
                        r = V,
                        p = -1 !== ['top', 'bottom'].indexOf(n),
                        s = p ? 'right' : 'bottom',
                        d = p ? 'left' : 'top',
                        a = p ? 'width' : 'height';
                    return o[s] < r(i[d]) && (e.offsets.popper[d] = r(i[d]) - o[a]), o[d] > r(i[s]) && (e.offsets.popper[d] = r(i[s])), e
                }
            },
            arrow: {
                order: 500,
                enabled: !0,
                fn: function(e, t) {
                    if (!F(e.instance.modifiers, 'arrow', 'keepTogether')) return e;
                    var o = t.element;
                    if ('string' == typeof o) {
                        if (o = e.instance.popper.querySelector(o), !o) return e;
                    } else if (!e.instance.popper.contains(o)) return console.warn('WARNING: `arrow.element` must be child of its popper element!'), e;
                    var i = e.placement.split('-')[0],
                        n = e.offsets,
                        r = n.popper,
                        p = n.reference,
                        s = -1 !== ['left', 'right'].indexOf(i),
                        d = s ? 'height' : 'width',
                        a = s ? 'top' : 'left',
                        f = s ? 'left' : 'top',
                        l = s ? 'bottom' : 'right',
                        m = O(o)[d];
                    p[l] - m < r[a] && (e.offsets.popper[a] -= r[a] - (p[l] - m)), p[a] + m > r[l] && (e.offsets.popper[a] += p[a] + m - r[l]);
                    var h = p[a] + p[d] / 2 - m / 2,
                        g = h - c(e.offsets.popper)[a];
                    return g = _(z(r[d] - m, g), 0), e.arrowElement = o, e.offsets.arrow = {}, e.offsets.arrow[a] = Math.round(g), e.offsets.arrow[f] = '', e
                },
                element: '[x-arrow]'
            },
            flip: {
                order: 600,
                enabled: !0,
                fn: function(e, t) {
                    if (W(e.instance.modifiers, 'inner')) return e;
                    if (e.flipped && e.placement === e.originalPlacement) return e;
                    var o = w(e.instance.popper, e.instance.reference, t.padding, t.boundariesElement),
                        i = e.placement.split('-')[0],
                        n = L(i),
                        r = e.placement.split('-')[1] || '',
                        p = [];
                    switch (t.behavior) {
                        case fe.FLIP:
                            p = [i, n];
                            break;
                        case fe.CLOCKWISE:
                            p = K(i);
                            break;
                        case fe.COUNTERCLOCKWISE:
                            p = K(i, !0);
                            break;
                        default:
                            p = t.behavior;
                    }
                    return p.forEach(function(s, d) {
                        if (i !== s || p.length === d + 1) return e;
                        i = e.placement.split('-')[0], n = L(i);
                        var a = e.offsets.popper,
                            f = e.offsets.reference,
                            l = V,
                            m = 'left' === i && l(a.right) > l(f.left) || 'right' === i && l(a.left) < l(f.right) || 'top' === i && l(a.bottom) > l(f.top) || 'bottom' === i && l(a.top) < l(f.bottom),
                            h = l(a.left) < l(o.left),
                            c = l(a.right) > l(o.right),
                            g = l(a.top) < l(o.top),
                            u = l(a.bottom) > l(o.bottom),
                            b = 'left' === i && h || 'right' === i && c || 'top' === i && g || 'bottom' === i && u,
                            y = -1 !== ['top', 'bottom'].indexOf(i),
                            w = !!t.flipVariations && (y && 'start' === r && h || y && 'end' === r && c || !y && 'start' === r && g || !y && 'end' === r && u);
                        (m || b || w) && (e.flipped = !0, (m || b) && (i = p[d + 1]), w && (r = j(r)), e.placement = i + (r ? '-' + r : ''), e.offsets.popper = se({}, e.offsets.popper, S(e.instance.popper, e.offsets.reference, e.placement)), e = N(e.instance.modifiers, e, 'flip'))
                    }), e
                },
                behavior: 'flip',
                padding: 5,
                boundariesElement: 'viewport'
            },
            inner: {
                order: 700,
                enabled: !1,
                fn: function(e) {
                    var t = e.placement,
                        o = t.split('-')[0],
                        i = e.offsets,
                        n = i.popper,
                        r = i.reference,
                        p = -1 !== ['left', 'right'].indexOf(o),
                        s = -1 === ['top', 'left'].indexOf(o);
                    return n[p ? 'left' : 'top'] = r[t] - (s ? n[p ? 'width' : 'height'] : 0), e.placement = L(t), e.offsets.popper = c(n), e
                }
            },
            hide: {
                order: 800,
                enabled: !0,
                fn: function(e) {
                    if (!F(e.instance.modifiers, 'hide', 'preventOverflow')) return e;
                    var t = e.offsets.reference,
                        o = T(e.instance.modifiers, function(e) {
                            return 'preventOverflow' === e.name
                        }).boundaries;
                    if (t.bottom < o.top || t.left > o.right || t.top > o.bottom || t.right < o.left) {
                        if (!0 === e.hide) return e;
                        e.hide = !0, e.attributes['x-out-of-boundaries'] = ''
                    } else {
                        if (!1 === e.hide) return e;
                        e.hide = !1, e.attributes['x-out-of-boundaries'] = !1
                    }
                    return e
                }
            },
            computeStyle: {
                order: 850,
                enabled: !0,
                fn: function(e, t) {
                    var o = t.x,
                        i = t.y,
                        n = e.offsets.popper,
                        p = T(e.instance.modifiers, function(e) {
                            return 'applyStyle' === e.name
                        }).gpuAcceleration;
                    void 0 !== p && console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
                    var s, d, a = void 0 === p ? t.gpuAcceleration : p,
                        f = r(e.instance.popper),
                        l = g(f),
                        m = {
                            position: n.position
                        },
                        h = {
                            left: V(n.left),
                            top: V(n.top),
                            bottom: V(n.bottom),
                            right: V(n.right)
                        },
                        c = 'bottom' === o ? 'top' : 'bottom',
                        u = 'right' === i ? 'left' : 'right',
                        b = B('transform');
                    if (d = 'bottom' == c ? -l.height + h.bottom : h.top, s = 'right' == u ? -l.width + h.right : h.left, a && b) m[b] = 'translate3d(' + s + 'px, ' + d + 'px, 0)', m[c] = 0, m[u] = 0, m.willChange = 'transform';
                    else {
                        var y = 'bottom' == c ? -1 : 1,
                            w = 'right' == u ? -1 : 1;
                        m[c] = d * y, m[u] = s * w, m.willChange = c + ', ' + u
                    }
                    var v = {
                        "x-placement": e.placement
                    };
                    return e.attributes = se({}, v, e.attributes), e.styles = se({}, m, e.styles), e
                },
                gpuAcceleration: !0,
                x: 'bottom',
                y: 'right'
            },
            applyStyle: {
                order: 900,
                enabled: !0,
                fn: function(e) {
                    return U(e.instance.popper, e.styles), Y(e.instance.popper, e.attributes), e.offsets.arrow && U(e.arrowElement, e.offsets.arrow), e
                },
                onLoad: function(e, t, o, i, n) {
                    var r = x(n, t, e),
                        p = E(o.placement, r, t, e, o.modifiers.flip.boundariesElement, o.modifiers.flip.padding);
                    return t.setAttribute('x-placement', p), U(t, {
                        position: 'absolute'
                    }), o
                },
                gpuAcceleration: void 0
            }
        }
    }, le
});
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//



$( document ).ready(function() {
    {
            let text = document.querySelector('.knockout-text');
            let span = text.firstElementChild;
            let spanWidth = span.clientWidth;

            span.style.setProperty('--x', - spanWidth + 'px');

            text.classList.add('slide');
            span.addEventListener('transitionend', () => {
                text.classList.add('end');
                span.textContent = 'Design with love by Sagar & Rahul';
                span.style.setProperty('--x', 0);
                setTimeout( () => {
                    text.style.mixBlendMode = 'normal';
                }, 2000);
            }, false);
        }
});
