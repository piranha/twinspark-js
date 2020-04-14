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


  function sendEvent(el, type, bubbles, attrs) {
    log('dispatching event', type, el, attrs);
    var event = new Event(type, {bubbles: bubbles});
    if (attrs) Object.assign(event, attrs);
    el.dispatchEvent(event);
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
    sendEvent(el, 'ts-ready', true);
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

  function findTarget(el, _recurse) {
    var sel = el.getAttribute('ts-target');
    if (sel) {
      if (sel == 'this')
        return el;
      if (sel.startsWith('parent '))
        return el.closest(sel.slice(7));
      if (sel.startsWith('child '))
        return el.querySelector(sel.slice(6));
      return document.querySelector(sel);
    }

    return el.parentElement &&
      findTarget(el.parentElement, true) ||
      (_recurse ? null : el);
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
    var target = findTarget(el);
    var method = el.getAttribute('ts-method') ||
        target.tagName == 'FORM' ? 'POST' : 'GET';

    var data = collect(el, 'ts-data', function(acc, v) {
      if (!acc) { acc = []; }
      acc.unshift(JSON.parse(v));
      return acc;
    }).reduce(function(x,y) { return Object.assign(x,y); });

    var qs = data && method == 'GET' ? '?' + new URLSearchParams(data).toString() : '';
    var body = data && method != 'GET' ? JSON.stringify(data) : null;
    var opts = {method:  method,
                headers: {'Accept-Encoding': 'text/html+partial'},
                body:    body};
    var req = xhr(url + qs, opts);

    el.classList.add('ts-active');
    req.then(function(res) {
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

  function parseValue(s) {
    var c = s[0];
    if (c == '{' || c == '[') {
      return JSON.parse(s);
    }
    if (c == '"' || c == "'") {
      return s.slice(1, s.length - 1);
    }
    if (c >= '0' && c <= '9') {
      return parseFloat(s);
    }
    return s;
  }

  var CLOSING = {'"': '"', "'": "'", "{": "}", "[": "]"};

  function parseActionSpec(cmd) {
    var result = [];
    var command = [];
    var current = '';

    var string = null;
    var json = null;

    function consume() {
      var token = current.trim();
      if (token.length) {
        command.push(parseValue(token));
      }
      current = '';
    }

    for (var i = 0; i < cmd.length; i++) {
      var c = cmd[i];

      if (json) {
        current += c;
        if (c == CLOSING[json]) {
          json = false;
        }
      } else if (string) {
        current += c;
        if (c == CLOSING[string]) {
          string = false;
        }
      } else {
        if ((c == "{") || (c == "[")) {
          json = c;
        } else if ((c == "'") || (c == '"')) {
          string = c;
        } else if (c == " ") {
          consume();
          continue;
        } else if (c == ",") {
          consume();
          result.push(command);
          command = [];
          continue;
        }

        current += c;
      }
    }

    consume();
    if (command) {
      result.push(command);
    }
    return result;
  }

  function executeAction(target, command) {
    var cmd = command[0];
    var args = command.slice(1);

    if (cmd == 'delay') {
      return delay.apply(null, args);
    } else if (cmd == 'stop') {
      e.stopPropagation();
    } else if (cmd == 'cancel') {
      e.preventDefault();

    } else if (cmd == 'addClass') {
      target.classList.add.apply(target.classList, args);
    } else if (cmd == 'removeClass') {
      target.classList.remove.apply(target.classList, args);
    } else if (cmd == 'toggleClass') {
      target.classList.toggle.apply(target.classList, args);
    } else if (cmd == 'replaceClass') {
      target.classList.replace.apply(target.classList, args);

    } else if (cmd in target) {
      // remove etc
      target[cmd].apply(target, args);
    } else if (cmd in window) {
      // extension point
      window[cmd].apply(window, args);
    }
  }

  function doAction(el, e) {
    var target = findTarget(el);
    var commands = parseActionSpec(el.getAttribute('ts-action'));

    commands.reduce(function(p, command) {
      return p.then(function(_) { return executeAction(target, command); });
    }, Promise.resolve(1));
  }

  var actionSel = '[ts-action]';
  register(actionSel, function(el) {
    el.addEventListener('ts-trigger', function(e) {
      doAction(el, e);
    });
  });


  /// Triggers

  var obs = new IntersectionObserver(function(entries, obs) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        sendEvent(entry.target, 'ts-trigger', false, {reason: entry});
      }
    });
  }, {rootMargin: '100px', threshold: 0.5});


  register('[ts-trigger]', function(el) {
    // intercooler modifiers? like changed, once, delay?
    // TODO: implement 'seen'
    var trigger = el.getAttribute('ts-trigger');
    if (!trigger) return;

    trigger.split(',').forEach(function(t) {
      t = t.trim();
      if (t == 'load') {
        sendEvent(el, 'ts-trigger', false, {reason: 'load'});
      } else if (t == 'visible') {
        obs.observe(el);
      } else {
        el.addEventListener(t, function(e) {
          sendEvent(el, 'ts-trigger', false, {reason: e});
        });
      }
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
                init: init,
                parse: parseActionSpec,
                obs: obs}
  };

  window[tsname] = twinspark;
})(window,document,'twinspark');
