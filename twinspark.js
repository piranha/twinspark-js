/* jshint esversion: 6 */

(function(window,document,tsname) {
  var twinspark = {};
  var localStorage = window.localStorage;

  /// Internal variables

  var READY = false;
  /** @type {boolean} */
  var DEBUG = localStorage._ts_debug || false;

  /** @type Array<{selector: string, handler: (function(Element): void)}> */
  var DIRECTIVES = [];
  var FUNCS = {stop:        function(e)   { if (e) e.stopPropagation(); },
               delay:       function(ms)  { return new Promise(function(resolve) { setTimeout(resolve, parseInt(ms), true); });},
               remove:      function()    { this.remove(); },
               class:       function(cls) { this.classList.add(cls); },
               "class+":    function(cls) { this.classList.add(cls); },
               "class-":    function(cls) { this.classList.remove(cls); },
               "class^":    function(cls) { this.classList.toggle(cls); },
               classtoggle: function(cls) { this.classList.toggle(cls); }};


  /// Wrap attribute handling
  /** @type {function(Element, string): boolean} */
  function hasattr(el, attr) {
    return el.hasAttribute(attr);
  }

  /** @type {function(Element, string): string|null} */
  function getattr(el, attr) {
    return el.getAttribute(attr);
  }

  /** @type {function(Element, string, string): void} */
  function setattr(el, attr, value) {
    return el.setAttribute(attr, value);
  }
  /// End wrap attribute handling


  /// Utils

  var err = console.log.bind(console, 'TwinSpark error:');
  /** @type {function(...*): void} */
  function log() {
    if (DEBUG) {
      console.log.apply(console, arguments);
    }
  }

  function groupBy(arr, keyfn) {
    return arr.reduce((acc, v) => {
      var key = keyfn(v);
      (acc[key] || (acc[key] = [])).push(v);
      return acc;
    }, {});
  }

  function toObj(entries) {
    var x, r = {};
    while (x = entries.next().value) {
      r[x[0]] = x[1];
    }
    return r;
  }

  function flat(arr) {
    if (arr.flat) return arr.flat();
    return [].concat.apply([], arr);
  }

  /** @type {function(Function): void} */
  function onload(fn) {
    if (document.readyState == 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function qsf(el, selector) { // querySelectorFirst
    if (el.matches(selector))
      return el;
    return el.querySelector(selector);
  }

  function qse(el, selector) { // querySelectorEvery
    var els = Array.from(el.querySelectorAll(selector));
    if (el.matches(selector))
      els.unshift(el);
    return els;
  }

  /**
   * Collects all non-empty attribute values from element and its parents.
   * @type {function(Element, string): Array<string>} */
  function elcrumbs(el, attr) {
    var result = [];
    var value;

    do {
      value = getattr(el, attr);
      if (value) {
        result.push(value);
      }
    } while (el = el.parentElement);

    return result;
  }


  /** @type {function(Element, string, boolean, Object=): void} */
  function sendEvent(el, type, bubbles, attrs) {
    log('dispatching event', type, el, attrs);
    var event = new Event(type, {bubbles: bubbles});
    if (attrs) Object.assign(event, attrs);
    el.dispatchEvent(event);
  }


  /// Core

  /** @type {function(Element, {selector: string, handler: (function(Element): void)}): void} */
  function attach(el, directive) {
    qse(el, directive.selector).forEach(directive.handler);
  }

  /**
   * Registers new directive.
   * @param  {string} selector Directive selector.
   * @param  {function(Element): void} handler Directive callback.
   * @return void
   */
  function register(selector, handler) {
    var directive = {selector: selector, handler: handler};
    DIRECTIVES.push(directive);
    if (READY) {
      attach(document.body, directive);
    }
  }

  /** @type {function(Element): void} */
  function activate(el) {
    DIRECTIVES.forEach(d => attach(el, d));
    sendEvent(el, 'ts-ready', true);
  }

  /** @type {function(Array<Element>): void} */
  function autofocus(els) {
    if (!(Array.isArray(els))) {
      els = [els];
    }
    var toFocus = els.map(el => qse(el, '[autofocus]'))
        .filter(els => els.length)
        .reduce((acc, els) => acc.concat(els), []);

    if (toFocus.length > 0) {
      toFocus[toFocus.length - 1].focus();
    }
  }

  /** @type {function(Event=): void} */
  function init(_e) {
    activate(document.body);
    READY = true;
    log('init done');
  }

  onload(init);


  /// Ajax

  /** @type {function(string, RequestInit): Promise<*> } */
  function xhr(url, opts) {
    return fetch(url, opts || undefined)
      .then(function(res) {
        return res.text().then(text => {
          res.content = text;
          return Promise.resolve(res);
        });
      });
  }


  /// Data collection

  /**
   * Parse either query string or JSON object.
   * @param {string} v String to be parsed.
   * @return URLSearchParams|Array<Array<string,*>>|null
   */
  function parseData(v) {
    if (v == "") return null;

    if (v.startsWith('{')) {
      var data = JSON.parse(v);
      if (typeof data === 'object' && data !== null) {
        return Object.entries(data);
      }
    } else {
      return new URLSearchParams(v);
    }
  }

  function mergeParams(p1, p2, removeEmpty) {
    for (var x of p2) {
      if (!x[0]) continue;

      if (removeEmpty && ((x[1] === null) || (x[1] === ''))) {
        p1.delete(x[0]);
      } else {
        p1.append(x[0], x[1]);
      }
    }
    return p1;
  }

  /**
   * @type {function(Element, string): URLSearchParams}
   * @suppress {reportUnknownTypes}
   */
  function eldata(el, attr) {
    // reduceRight because deepest element is the first one
    return elcrumbs(el, attr).reduceRight(
      (acc, v) => mergeParams(acc, parseData(v), true),
      new URLSearchParams());
  }

  function collectData(el) {
    var data = eldata(el, 'ts-data');

    if (el.tagName == 'FORM') {
      [].forEach.call(el.elements, (el) => {
        if (!el.name) return;
        if (((el.type == 'radio') || (el.type == 'checkbox')) &&
            !el.checked) {
          return;
        }
        data.append(el.name, el.value);
      });
    }

    return data;
  }


  /// History

  function storeCurrentState() {
    history.replaceState({html: document.body.innerHTML}, "");
  }

  function pushState(url, title) {
    // before every push replaces current data to store current state
    storeCurrentState();
    history.pushState(null, title, url);
  }

  window.addEventListener('popstate', e => {
    document.body.innerHTML = e.state.html;
    activate(document.body);
  });


  /// Fragments

  /** @type {function(Element): Element} */
  function findTarget(el) {
    var sel = getattr(el, 'ts-target');
    if (!sel)
      return el;

    if (sel == 'inherit') {
      while (el = el.parentElement) {
        if (hasattr(el, 'ts-target')) {
          return findTarget(el);
        }
      }
      return;
    }

    if (sel.startsWith('parent '))
      return el.closest(sel.slice(7));
    if (sel.startsWith('child '))
      return el.querySelector(sel.slice(6));
    return document.querySelector(sel);
  }

  function findReply(target, origin, reply) {
    var sel = getattr(origin, 'ts-req-selector');

    if (!sel) {
      if ((reply.tagName == 'BODY') && (target.tagName != 'BODY')) {
        return [reply.children[0]];
      }
      return [reply];
    }

    if (sel.startsWith('children ')) {
      var el = qsf(reply, sel.slice(9));
      return el && el.children && Array.from(el.children);
    }

    return [qsf(reply, sel)];
  }

  function executeSwap(strategy, target, reply) {
    switch (strategy) {
    case 'replace': target.replaceWith.apply(target, reply); break;
    case 'prepend': target.prepend.apply(target, reply);     break;
    case 'append':  target.append.apply(target, reply);      break;
    case 'inner':   target.innerHTML = '';
                    target.append.apply(target, reply);      break;
    }
    return reply;
  }

  function elementSwap(origin, replyParent) {
    var target = findTarget(origin);
    var reply = findReply(target, origin, replyParent);
    var strategy = getattr(origin, 'ts-req-strategy') || 'replace';
    return executeSwap(strategy, target, reply);
  }

  function headerSwap(header, replyParent) {
    // `replace: css selector <= css selector`
    var m = header.match(/(\w+):(.+)<=(.+)/);
    if (!m)
      return err('Cannot parse ts-req-swap value', header);
    var target = qsf(document.body, m[2]);
    var reply = qsf(replyParent, m[3]);

    return executeSwap(m[1], target, [reply]);
  }

  // Terminology:
  // `origin` - an element where request started from, a link or a button
  // `target` - where the incoming HTML will end up
  // `reply` - incoming HTML to end up in target
  /** @type {function(string, Array<Element>, string, Object): Array<Element>} */
  function swap(url, origins, content, headers) {
    var html = new DOMParser().parseFromString(content, 'text/html');
    var title = headers['x-ts-title'] || html.title;
    var pushurl = headers['x-ts-history'] || hasattr(origins[0], 'ts-req-history') && url;
    var children = Array.from(html.body.children);

    if (children.length < origins.length) {
      throw ('This request needs at least ' + origins.length +
             ' elements, but ' + children.length + ' were returned');
    }

    if (pushurl) {
      pushState(pushurl, title);
    }

    // `joiners` are elements which want to `join` current request by specifying
    // its ts-req-id in ts-req-join attribute. They should be found before doing
    // any swaps.
    var joiners = origins.filter(origin => hasattr(origin, 'ts-req-id')).map(origin => {
      var id = getattr(origin, 'ts-req-id');
      return Array.from(document.querySelectorAll('[ts-req-join~="' +  id +'"]'));
    }).flat(1);

    // swap original elements
    var swapped = origins.map(function (origin, i) {
      return elementSwap(origin, origins.length > 1 ? children[i] : html.body);
    });

    // swap joiners
    swapped = swapped.concat(joiners.map(joiner => elementSwap(joiner, html.body)));

    // swap any header requests
    if (headers['x-ts-swap']) {
      swapped = swapped.concat(headers['x-ts-swap'].split(',')
                               .map(header => headerSwap(header, html.body)));
    }

    swapped = flat(swapped).filter(x => x);

    swapped.forEach(activate);
    autofocus(swapped);

    storeCurrentState();
    return swapped;
  }

  function _doBatch(batch) {
    if (batch.length == 0) return;

    var url = batch[0].url;
    var method = batch[0].method;
    var data = batch.reduce(
      (acc, req) => mergeParams(acc, collectData(req.el), false),
      new URLSearchParams()).toString();

    var qs = data && method == 'GET' ? '?' + data : '';
    var body = data && method != 'GET' ? data : null;

    var opts = {method:  method,
                headers: {'Accept': 'text/html+partial',
                          'Content-Type': body ? 'application/x-www-form-urlencoded' : ''},
                body:    body};
    var fullurl = url + qs;
    var req = xhr(fullurl, opts);
    var origins = batch.map(req => req.el);

    origins.forEach(el => el.classList.add('ts-active'));
    req
      .finally(function() {
        origins.forEach(el => el.classList.remove('ts-active'));
      })
      .then(function(res) {
        var headers = toObj(res.headers.entries());

        if (res.ok && res.redirected) {
          headers['x-ts-history'] = res.url;
          return swap(res.url, [document.body], res.content, headers);
        }

        if (res.ok) {
          // cannot use res.url here since fetchMock will not set it to right
          // value
          return swap(fullurl, origins, res.content, headers);
        }

        err(res.content);
      })
      .catch(function(res) {
        err('Network interrupt or something', arguments);
      });
  }

  function doBatch(batch) {
    // Skip requests unless `doAction` for `ts-req-before` returned `true`
    Promise
      .all(batch.map(req => doAction(req.el, null, getattr(req.el, 'ts-req-before'))))
      .then(result => batch.filter((req, i) => result[i]))
      .then(_doBatch);
  }

  // Batch Request Queue
  /** @type {reqs: Array<{el: Element, url: string, method: string, batch: boolean}>, request: Object} */
  var queue = {
    reqs: [],
    request: null
  };

  function executeRequests() {
    var batches = groupBy(queue.reqs, req => req.method + req.url);
    queue = {reqs: [], request: null};

    Object.values(batches).forEach(doBatch);
  }

  function queueRequest(req) {
    queue.reqs.push(req);
    if (!queue.request) {
      queue.request = setTimeout(executeRequests, 16);
    }
  }

  /** @type {function(Element, boolean): {el: Element, url: string, method: string, batch: boolean} } */
  function makeReq(el, batch) {
    var target = findTarget(el);
    var url = ((batch ? getattr(el, 'ts-req-batch') : getattr(el, 'ts-req')) ||
               (target.tagName == 'FORM' ? getattr(target, 'action') : getattr(el, 'href')));
    var method = getattr(el, 'ts-req-method') ||
        (target.tagName == 'FORM' ? 'POST' : 'GET');

    return {el:     el,
            url:    url,
            method: method,
            batch:  batch};
  }
  // End Batch Request Queue

  function onNative(el, func) {
    var event = el.tagName == 'FORM' ? 'submit' : 'click';
    return el.addEventListener(event, function(e) {
      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || (e.button || 0) != 0)
        return;

      e.preventDefault();
      e.stopPropagation();
      func(e);
    });
  }

  register('[ts-req]', function(el) {
    var handler = e => doBatch([makeReq(el, false)]);
    if (hasattr(el, 'ts-trigger')) {
      el.addEventListener('ts-trigger', handler);
    } else {
      onNative(el, handler);
    }
  });


  register('[ts-req-batch]', function(el) {
    var handler = e => queueRequest(makeReq(el, true));
    if (hasattr(el, 'ts-trigger')) {
      el.addEventListener('ts-trigger', handler);
    } else {
      onNative(el, handler);
    }
  });


  /// Actions

  function registerCommands(cmds) {
    return Object.assign(FUNCS, cmds);
  }

  function executeCommand(command, args, target, e) {
    args.push(e);

    if (FUNCS[command]) {
      return FUNCS[command].apply(target, args);
    }
    if (window._ts_func && window._ts_func[command]) {
      return window._ts_func[command].apply(target, args);
    }
    if (window[command]) {
      return window[command].apply(target, args);
    }

    throw err('Unknown action', command);
  }

  function parseActions(s) {
    return s.split(',').map(c => c.trim().split(/\s+/));
  }

  /** @type {function(Element, Event, (string|null)): boolean} */
  function doAction(target, e, spec) {
    // special case for ts-req-before, where request will be cancelled if true
    // is not returned
    if (!spec) return true;

    var commands = parseActions(spec);

    return commands.reduce(function(p, command) {
      return p.then(function(_) {
        return executeCommand(command[0], command.slice(1), target, e);
      });
    }, Promise.resolve(1));
  }

  register('[ts-action]', function(el) {
    var handler = e => doAction(findTarget(el), e.reason || e, getattr(el, 'ts-action'));
    if ((el.tagName == 'A' || el.tagName == 'BUTTON') && !hasattr(el, 'ts-trigger')) {
      onNative(el, handler);
    } else {
      el.addEventListener('ts-trigger', handler);
    }
  });


  /// Triggers

  function observed(entries, obs) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        sendEvent(entry.target, 'ts-trigger', false);
      }
    });
  }

  var visible = new IntersectionObserver(observed, {rootMargin: '0px', threshold: 0.5});
  var closeby = new IntersectionObserver(observed, {rootMargin: '100px', threshold: 0.2});

  register('[ts-trigger]', function(el) {
    // intercooler modifiers? like changed, once, delay?
    var trigger = getattr(el, 'ts-trigger');
    if (trigger == null || trigger == '') return;

    trigger.split(/\s+/).forEach(function(t) {
      t = t.trim();
      if (t == 'load') {
        sendEvent(el, 'ts-trigger', false, {reason: 'load'});
      } else if (t == 'visible') {
        visible.observe(el);
      } else if (t == 'closeby') {
        closeby.observe(el);
      } else if (t != "") {
        el.addEventListener(t, function(e) {
          sendEvent(el, 'ts-trigger', false, {reason: e});
        });
      }
    });
  });


  /// Public interface

  twinspark = {
    onload:    onload,
    register:  register,
    activate:  activate,
    func:      registerCommands,
    elcrumbs:  elcrumbs,
    logtoggle: () => localStorage._ts_debug = (DEBUG=!DEBUG) ? 'true' : '',
    _internal: {DIRECTIVES: DIRECTIVES,
                init: init}
  };

  window[tsname] = twinspark;
})(window,document,'twinspark');
