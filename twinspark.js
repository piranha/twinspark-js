/* jshint esversion: 6 */

(function(window,document,tsname) {
  var twinspark = {};
  var localStorage = window.localStorage;
  var loc = window.location;

  /// Internal variables

  var READY = false;
  /** @type {boolean} */
  var DEBUG = localStorage._ts_debug || false;

  /** @type Array<{selector: string, handler: (function(Element): void)}> */
  var DIRECTIVES = [];
  var FUNCS = {stop:        function(el, e)   { if (e) e.stopPropagation(); },
               // `delay` returns `true` so it could be used in `ts-req-before`
               // without preventing action
               delay:       delay,
               remove:      function(el) {
                 if (arguments.length == 2) {
                   return el.remove();
                 }
                 var selcount = arguments.length - 2;
                 var sel = [].slice.call(arguments, 0, selcount);
                 findTarget(arguments[selcount], sel.join(' ')).remove();
               },
               class:       function(cls, el) { el.classList.add(cls); },
               "class+":    function(cls, el) { el.classList.add(cls); },
               "class-":    function(cls, el) { el.classList.remove(cls); },
               "class^":    function(cls, el) { el.classList.toggle(cls); },
               classtoggle: function(cls, el) { el.classList.toggle(cls); }};


  /// Utils

  var err = console.log.bind(console, 'TwinSpark error:');
  /** @type {function(...*): void} */
  function LOG() {
    if (DEBUG) {
      console.log.apply(console, arguments);
    }
  }

  function groupBy(arr, keyfn) {
    return arr.reduce(function (acc, v) {
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

  function parseTime(s) {
    s = s && s.trim();
    if (!s) return;
    if (s.match(/\d+s/)) return parseFloat(s) * 1000;
    return parseFloat(s);
  }

  function delay(s) {
    return new Promise(function(resolve) {
      setTimeout(resolve, parseTime(s), true);
    });
  }


  /// Events
  /** @type {function(Function): void} */
  function onload(fn) {
    if (document.readyState == 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  var onidle = window.requestIdleCallback || function(x) { setTimeout(x, 100); };

  /** @type {function(Element, string, boolean, any=): void} */
  function sendEvent(el, type, opts) {
    opts || (opts = {});
    // bubbles is true by default but could be false
    var bubbles = opts.hasOwnProperty('bubbles') ? opts.bubbles : true;
    var event = new CustomEvent(type, {bubbles: bubbles,
                                       cancelable: true,
                                       detail: opts.detail});
    LOG(el, type, opts.detail);
    el.dispatchEvent(event);
  }


  /// Attribute handling
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


  /// DOM querying
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

  function elid(el) {
    var tag = el.tagName.toLowerCase();
    if (el.id)
      return el.id;
    if (el.className)
      return (tag + ' ' + el.className).split(' ').join('.');
    return tag;
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
    sendEvent(el, 'ts-ready');
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
    LOG('init done');
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

  function formElementValue(el) {
    if (!el.name) return;
    if (((el.type == 'radio') || (el.type == 'checkbox')) &&
        !el.checked) {
      return;
    }
    return el.value;
  }

  function collectData(el) {
    var data = eldata(el, 'ts-data');
    var tag = el.tagName;
    var res;

    if (tag == 'FORM') {
      [].forEach.call(el.elements, (el) => {
        if (res = formElementValue(el))
          data.append(el.name, res);
      });
    } else if ((tag == 'INPUT') || (tag == 'SELECT') || (tag == 'TEXTAREA')) {
      if (res = formElementValue(el))
        data.append(el.name, res);
    }

    return data;
  }


  /// History

  function storeCurrentState() {
    // one of those is pretty slow
    var current = document.body.innerHTML;
    onidle(function() { history.replaceState({html: current}, ""); },
           {timeout: 1000});
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
  function findTarget(el, sel) {
    sel || (sel = getattr(el, 'ts-target'));
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
    // terminology from
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
    switch (strategy) {
    case 'replace':     target.replaceWith.apply(target, reply);       break;
    case 'inner':       target.innerHTML = '';
                        target.append.apply(target, reply);            break;
    case 'prepend':     target.prepend.apply(target, reply);           break;
    case 'append':      target.append.apply(target, reply);            break;
    case 'beforebegin': target.parentNode.insertBefore(reply, target); break;
    case 'afterend':    target.parentNode.insertBefore(reply, target.nextSibling); break;
    default:            err('unknown swap strategy', strategy);        return;
    }
    return reply;
  }

  function elementSwap(origin, replyParent) {
    var target = findTarget(origin);
    var reply = findReply(target, origin, replyParent);
    var strategy = getattr(origin, 'ts-swap') || 'replace';

    origin && doAction(origin, null, getattr(origin, 'ts-req-after'));
    return executeSwap(strategy, target, reply);
  }

  function pushedSwap(reply) {
    var sel = getattr(reply, 'ts-swap-push');
    if (!sel && reply.id) {
      sel = '#' + reply.id;
    }
    if (!sel) {
      err('cannot find target for server-pushed swap', reply);
    }
    var target = qsf(document.body, sel);
    var strategy = getattr(reply, 'ts-swap') || 'replace';
    return executeSwap(strategy, target, [reply]);
  }

  function headerSwap(header, replyParent) {
    // `replace: css selector <= css selector`
    var m = header.match(/(\w+):(.+)<=(.+)/);
    if (!m)
      return err('Cannot parse x-ts-swap header value', header);
    var target = qsf(document.body, m[2]);
    var reply = qsf(replyParent, m[3]);
    var strategy = m[1];

    return executeSwap(strategy, target, [reply]);
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
    var replyParent = html.body;

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
      return elementSwap(origin, origins.length > 1 ? children[i] : replyParent);
    });

    var oobs = Array.from(replyParent.querySelectorAll('[ts-swap-push]')).map(function (reply) {
      return pushedSwap(reply);
    });

    // swap joiners
    swapped = swapped.concat(joiners.map(joiner => elementSwap(joiner, html.body)));
    swapped = swapped.concat(oobs);

    // swap any header requests
    if (headers['x-ts-swap']) {
      swapped = swapped.concat(headers['x-ts-swap'].split(',')
                               .map(header => headerSwap(header, replyParent)));
    }

    swapped = flat(swapped).filter(x => x);

    swapped.forEach(activate);
    autofocus(swapped);

    // store current HTML so on popstate we have somewhere to go forward to
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

    var qs = data && method == 'GET' ? data : null;
    var body = data && method != 'GET' ? data : null;

    var opts = {
      method:  method,
      headers: {
        'Accept':       'text/html+partial',
        'Content-Type': body ? 'application/x-www-form-urlencoded' : '',
        'X-TS-URL':     loc.pathname + loc.search,
        'X-TS-Origin':  batch.map(r => elid(r.el)).join(', '),
        'X-TS-Target':  batch.map(r => elid(findTarget(r.el))).join(', ')
      },
      body:    body};

    var fullurl = url;
    if (qs) {
      if (fullurl.indexOf('?') == -1) {
        fullurl += '?';
      }
      fullurl += qs;
    }

    var origins = batch.map(req => req.el);
    var detail = {url: fullurl, opts: opts};
    origins.forEach(function (el) {
      sendEvent(el, 'ts-before-xhr', detail);
      el.classList.add('ts-active');
    });

    return xhr(fullurl, opts)
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
    // Skip requests if `doAction` for `ts-req-before` returned `false`
    return Promise
      .all(batch.map(req => doAction(req.el, null, getattr(req.el, 'ts-req-before'))))
      .then(result => batch.filter((req, i) => result[i] !== false))
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
    var url = ((batch ? getattr(el, 'ts-req-batch') : getattr(el, 'ts-req')) ||
               (el.tagName == 'FORM' ? getattr(el, 'action') : getattr(el, 'href')));
    var method = getattr(el, 'ts-req-method') ||
        (el.tagName == 'FORM' ? 'POST' : 'GET');

    return {el:     el,
            url:    url,
            method: method,
            batch:  batch};
  }
  // End Batch Request Queue

  function onNative(el, func) {
    var tag = el.tagName;
    var event = 'click';
    if (tag == 'FORM')
      event = 'submit';
    else if ((tag == 'INPUT') || (tag == 'SELECT') || (tag == 'TEXTAREA'))
      event = 'change';
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
    args.push(target);
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

  function parseActionSpec(s) {
    return s.split(',').map(c => c.trim().split(/\s+/));
  }

  /** @type {function(Element, Event, (string|null)): boolean} */
  function doAction(target, e, spec) {
    // special case for ts-req-before, where request will be cancelled if true
    // is not returned
    if (!spec) return true;

    var commands = parseActionSpec(spec);

    return commands.reduce(function(p, command) {
      return p.then(function(_) {
        return executeCommand(command[0], command.slice(1), target, e);
      });
    }, Promise.resolve(1));
  }

  register('[ts-action]', function(el) {
    var handler = e => doAction(findTarget(el), e.detail || e, getattr(el, 'ts-action'));
    if ((el.tagName == 'A' || el.tagName == 'BUTTON') && !hasattr(el, 'ts-trigger')) {
      onNative(el, handler);
    } else {
      el.addEventListener('ts-trigger', handler);
    }
  });


  /// Triggers

  function observed(entries, obs) {
    var entry, el;
    for (var i = 0; i < entries.length; i++) {
      entry = entries[i];
      if (entry.isIntersecting) {
        (el = entry.target).tsTrigger(el);
      }
    }
  }

  var visible = new IntersectionObserver(observed, {rootMargin: '0px', threshold: 0.2});
  var closeby = new IntersectionObserver(observed, {rootMargin: '100px', threshold: 0.2});

  function internalData(el) {
    var prop = 'twinspark-internal';
    return el[prop] || (el[prop] = {});
  }

  function makeTriggerListener(t) {
    var delay = t.indexOf('delay');
    var spec = {changed: t.indexOf('changed') != -1,
                once:    t.indexOf('once') != -1,
                delay:   delay != -1 ? parseTime(t[delay + 1]) : null};
    return function(el, e) {
      var data = internalData(el);

      function executeTrigger() {
        sendEvent(el, 'ts-trigger', {bubbles: false, detail: e});
      }

      if (spec.once) {
        if (data.once) {
          return;
        }
        data.once = true;
      }

      if (spec.changed) {
        if (data.value == formElementValue(el)) {
          return;
        }
        data.value = formElementValue(el);
      }

      if (spec.delay) {
        if (data.delay) {
          clearTimeout(data.delay);
        }
        data.delay = setTimeout(executeTrigger, spec.delay);
      } else {
        executeTrigger();
      }
    };
  }

  function registerTrigger(el, t) {
    var type = t[0];
    var tsTrigger = makeTriggerListener(t);
    el.tsTrigger = tsTrigger; // for IntersectionObserver

    switch (type) {
    case 'load':    tsTrigger(el); break;
    case 'visible': visible.observe(el); break;
    case 'closeby': closeby.observe(el); break;
    default:        el.addEventListener(type, function(e) { tsTrigger(e.target, e); }); break;
    }
  }

  register('[ts-trigger]', function(el) {
    var spec = getattr(el, 'ts-trigger');
    if (!spec) return;

    var triggers = parseActionSpec(spec);

    triggers.forEach(function(t) {
      registerTrigger(el, t);
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
