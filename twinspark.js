(function(window,document,tsname) {
  var twinspark = {};

  /// Internal data structures

  var READY = false;
  var DEBUG = localStorage._ts_debug || false;
  var DIRECTIVES = []; // [{selector: x, handler: y}]


  /// Utils

  var err = console.log.bind(console, 'Twinspark error:');
  function log() {
    if (DEBUG) {
      console.log.apply(console, arguments);
    }
  }

  function onload(fn) {
    if (document.readyState == 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }


  /// Core

  function attach(el, directive) {
    var els = el.querySelectorAll(directive.selector);
    if (els.length) {
      [].forEach.call(els, directive.handler);
    }
  }

  function register(selector, handler) {
    var directive = {selector: selector, handler: handler};
    DIRECTIVES.push(directive);
    if (READY) {
      attach(document.body, directive);
    }
  }

  function activate(el) {
    DIRECTIVES.forEach(function(d) { attach(el, d); });
  }

  function autofocus(el) {
    var els = el.querySelectorAll('[autofocus]');
    if (els.length > 0) {
      els[els.length - 1].focus();
    }
  }

  function init(_e) {
    activate(document.body);
    READY = true;
    log('init done');
  }

  onload(init);


  /// Ajax

  function xhr(url, opts) {
    return fetch(url, opts)
      .then(function(res) {
        return res.text().then(function(text) {
          res.content = text;
          return Promise.resolve(res);
        });
      });
  }


  /// Fragments

  function swap(el, targetSel, content) {
    el = targetSel ? document.querySelector(targetSel) : el;
    var html = new DOMParser().parseFromString(content, 'text/html');
    var toSwap = targetSel ?
        html.querySelector(targetSel) :
        html.getElementsByTagName(el.tagName)[0];
    el.replaceWith(toSwap);

    el = toSwap;
    activate(el);
    autofocus(el);
  }

  register('[ts-href]', function(el) {
    var url = el.getAttribute('ts-href');
    var targetSel = el.getAttribute('ts-target');

    el.addEventListener('click', function(e) {
      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button != 0)
        return;

      e.preventDefault();
      xhr(url, {method: 'GET',
                headers: {'Accept-Encoding': 'text/html+partial'}})
        .then(function(res) {
          if (res.ok) {
            swap(el, targetSel, res.content);
          } else {
            err(res.content);
          }
        })
        .catch(function(r) {
          err('Network interrupt or something');
          err(arguments);
        });
    });
  });

  /// Public interface

  twinspark.onload = onload;
  twinspark.register = register;
  twinspark.log_toggle = function() {
    localStorage._ts_debug = DEBUG ? '' : 'true';
    DEBUG = !DEBUG;
  };
  twinspark._internal = {DIRECTIVES: DIRECTIVES,
                         getReady: function() { return READY; },
                         init: init};

  window[tsname] = twinspark;
})(window,document,'twinspark');
