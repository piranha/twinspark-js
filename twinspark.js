(function(window,document,tsname) {
  var twinspark = {};

  /// Internal data structures

  var READY = false;
  var DEBUG = localStorage._ts_debug || false;
  var DIRECTIVES = []; // [{selector: x, handler: y}]


  /// Utils

  var err = console.log.bind(console, 'TwinSpark error:');
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

  function collect(el, attribute, merge) {
    var result, value;

    while(el) {
      value = el.getAttribute(attribute);
      if (value) {
        result = merge(result, value);
      }
      el = el.parentElement;
    }

    return result;
  }


  /// Core

  function attach(el, directive) {
    if (el.matches(directive.selector)) {
      directive.handler(el);
    }

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

  function delay(ms, rv) {
    return new Promise(function(resolve) { setTimeout(resolve, ms, rv); });
  }

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

  function findTarget(el, targetSel) {
    if (!targetSel) {
      return el;
    }

    if (targetSel.startsWith('parent ')) {
      return el.closest(targetSel.slice(7));
    } else {
      return document.querySelector(targetSel);
    }
  }

  function swap(el, targetSel, content) {
    var html = new DOMParser().parseFromString(content, 'text/html');
    var toSwap;
    if (targetSel) {
      toSwap = html.querySelector(targetSel.startsWith('parent ') ?
                                  targetSel.slice(7) :
                                  targetSel);
    } else {
      // this should be used in case of prepend/append only, to simplify logic
      //toSwap = html.body.children;
      // NOTE: maybe just html.body.children[0] ?
      toSwap = html.getElementsByTagName(el.tagName)[0];
    }
    el.replaceWith(toSwap);

    el = toSwap;
    activate(el);
    autofocus(el);
  }

  function doRequest(el) {
    var url = el.getAttribute('ts-href') || el.getAttribute('href');
    var targetSel = el.getAttribute('ts-target');
    var target = findTarget(el, targetSel);
    var method = el.getAttribute('ts-method') ||
        target.tagName == 'FORM' ? 'POST' : 'GET';

    var data = collect(el, 'ts-data',
                       function(r, v) { Object.assign(r, JSON.parse(v)); });

    el.classList.add('ts-active');
    xhr(url, {method:  method,
              headers: {'Accept-Encoding': 'text/html+partial'}})
      .then(function(res) {
        el.classList.remove('ts-active');
        if (res.ok) {
          swap(target, targetSel, res.content);
        } else {
          err(res.content);
        }
      })
      .catch(function(r) {
        el.classList.remove('ts-active');
        err('Network interrupt or something', arguments);
      });
  }

  var requestSel = '[ts-req], [ts-href]';
  register(requestSel, function(el) {
    el.addEventListener('click', function(e) {
      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button != 0)
        return;

      e.preventDefault();
      doRequest(el);
    });
    el.addEventListener('ts-trigger', function(e) {
      doRequest(el);
    });
  });


  /// Actions

  function doAction(el, e) {
    // TODO: parse spec for arguments; multiple actions?
    var spec = el.getAttribute('ts-action');
    var target = findTarget(el, el.getAttribute('ts-target'));

    if (spec in target) {
      // remove etc
      target[spec]();
    } else if (spec in e) {
      // stopPropagation etc
      e[spec]();
    } else if (spec in window) {
      // extension point
      window[spec]();
    }
  }

  var actionSel = '[ts-action]';
  register(actionSel, function(el) {
    var spec = el.getAttribute('ts-action');
    el.addEventListener('ts-trigger', function(e) {
      doAction(el, e);
    });
  });


  /// Triggers

  function doTrigger(el, e) {
    var event = new Event('ts-trigger', {bubbles: false});
    event.reason = e;
    el.dispatchEvent(event);
  }

  register('[ts-trigger]', function(el) {
    // intercooler modifiers? like changed, once, delay?
    // TODO: implement 'seen'
    var trigger = el.getAttribute('ts-trigger');
    trigger.split(',').forEach(function(x) {
      el.addEventListener(x.trim(), function(e) {
        doTrigger(el, e);
      });
    });
  });


  /// Public interface

  twinspark = {
    onload: onload,
    register: register,
    collect: collect,
    log_toggle: function() {
      localStorage._ts_debug = DEBUG ? '' : 'true';
      DEBUG = !DEBUG;
    },
    _internal: {DIRECTIVES: DIRECTIVES,
                getReady: function() { return READY; },
                init: init}
  };

  window[tsname] = twinspark;
})(window,document,'twinspark');
