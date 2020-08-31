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
  var FUNCS = {stop:        function(o) { if (o.event) o.event.stopPropagation(); },
               delay:       delay,
               remove: function() {
                 var selcount = arguments.length - 1;
                 var o = arguments[selcount];
                 if (selcount == 0) {
                   return o.el.remove();
                 }
                 var sel = [].slice.call(arguments, 0, selcount);
                 findTarget(o.el, sel.join(' ')).remove();
               },
               class:       function(cls, o) { o.el.classList.add(cls); },
               "class+":    function(cls, o) { o.el.classList.add(cls); },
               "class-":    function(cls, o) { o.el.classList.remove(cls); },
               "class^":    function(cls, o) { o.el.classList.toggle(cls); },
               classtoggle: function(cls, o) { o.el.classList.toggle(cls); }};


  /// Utils

  var ERR = console.error ?
      console.error.bind(console, 'TwinSpark error:') :
      console.log.bind(console, 'TwinSpark error:');
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

  /** @type {function(Element, string, Object=): void} */
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

  function delattr(el, attr) {
    return el.removeAttribute(attr);
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
    return new Promise(function(resolve, reject) {
      opts || (opts = {});

      var xhr = new XMLHttpRequest();
      xhr.open(opts.method || 'GET', url, true);
      for (var k in opts.headers) {
        xhr.setRequestHeader(k, opts.headers[k]);
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;

        var headers = {'ts-title':     xhr.getResponseHeader('ts-title'),
                       'ts-history':   xhr.getResponseHeader('ts-history'),
                       'ts-swap':      xhr.getResponseHeader('ts-swap'),
                       'ts-swap-push': xhr.getResponseHeader('ts-swap-push')}

        return resolve({ok:      xhr.status == 0 || (xhr.status >= 200 && xhr.status <= 299),
                        status:  xhr.status,
                        url:     xhr.responseURL,
                        headers: headers,
                        content: xhr.responseText});

      }

      xhr.timeout = 3000;
      xhr.ontimeout = function() {
        return reject({ok:    false,
                       url:   url,
                       error: "timeout"});
      }

      xhr.send(opts.body);
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

    if (v[0] == '{') {
      var data = JSON.parse(v);
      if (typeof data === 'object' && data !== null) {
        var arr = [];
        for (var k in data) {
          arr.push([k, data[k]]);
        }
        return arr;
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

    // only clicked submit buttons should be handled. In ideal world we would
    // look at e.submitter, but no support from Safari
    if (el.type == 'submit' && !hasattr(el, 'ts-clicked')) return;

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

  window.addEventListener('popstate', function(e) {
    // NOTE: e.state is empty when fired on fragment change?
    if (e.state) {
      document.body.innerHTML = e.state.html;
      activate(document.body);
    }
  });


  /// Fragments

  /** @type {function(Element, string=): Element} */
  function findTarget(el, sel) {
    sel || (sel = getattr(el, 'ts-target'));
    if (!sel)
      return el;

    if (sel == 'inherit') {
      var parent = el.parentElement.closest('[ts-target]');
      if (!parent)
        ERR('Could not find parent for target', el);
      return findTarget(parent);
    }

    if (sel.slice(0, 7) == 'parent ') {
      return el.closest(sel.slice(7)) ||
        ERR('Cound not find parent with selector:', sel, 'for element', el);
    }
    if (sel.slice(0, 6) == 'child ') {
      return el.querySelector(sel.slice(6)) ||
        ERR('Cound not find child with selector:', sel, 'for element', el);
    }
    return document.querySelector(sel) || ERR('Could not find element with selector:', sel);
  }

  function findReply(target, origin, reply) {
    var sel = getattr(origin, 'ts-req-selector');

    if (!sel) {
      if ((reply.tagName == 'BODY') && (target.tagName != 'BODY')) {
        return [reply.children[0]];
      }
      return [reply];
    }

    if (sel.slice(0, 9) == 'children ') {
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
    default:            ERR('unknown swap strategy', strategy);        return;
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
      ERR('cannot find target for server-pushed swap', reply);
    }
    var target = qsf(document.body, sel);
    var strategy = getattr(reply, 'ts-swap') || 'replace';
    return executeSwap(strategy, target, [reply]);
  }

  function headerSwap(header, replyParent) {
    // `replace: css selector <= css selector`
    var m = header.match(/(\w+):(.+)<=(.+)/);
    if (!m)
      return ERR('Cannot parse ts-swap-push header value', header);
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
    var title = headers['ts-title'] || html.title;
    // either ts-history contains new URL or ts-req-history is truthy value,
    // then take request URL as new URL
    var pushurl = headers['ts-history'] || hasattr(origins[0], 'ts-req-history') && url;
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
    var joiners = flat(
      origins
        .filter(origin => hasattr(origin, 'ts-req-id'))
        .map(origin => {
          var id = getattr(origin, 'ts-req-id');
          return Array.from(document.querySelectorAll('[ts-req-join~="' +  id +'"]'));
        }));

    // swap original elements
    var swapped;
    if (headers['ts-swap'] != 'skip') {
      swapped = origins.map(function (origin, i) {
        return elementSwap(origin, origins.length > 1 ? children[i] : replyParent);
      });
    } else {
      swapped = [];
    }

    var oobs = Array.from(replyParent.querySelectorAll('[ts-swap-push]')).map(function (reply) {
      return pushedSwap(reply);
    });

    // swap joiners
    swapped = swapped.concat(joiners.map(joiner => elementSwap(joiner, html.body)));
    swapped = swapped.concat(oobs);

    // swap any header requests
    if (headers['ts-swap-push']) {
      swapped = swapped.concat(headers['ts-swap-push'].split(',')
                               .map(header => headerSwap(header, replyParent)));
    }

    swapped = flat(swapped).filter(x => x);

    swapped.forEach(activate);
    autofocus(swapped);

    // store current HTML so on popstate we have somewhere to go forward to
    storeCurrentState();
    return swapped;
  }


  /// Making request for fragments

  function mergeHeaders(h1, h2) {
    for (var k in h2) {
      if (!h1[k]) {
        h1[k] = h2[k];
      } else if (h1[k] != h2[k]) {
        h1[k] += ', ' + h2[k];
      }
    }
    return h1;
  }

  function makeOpts(req) {
    var data = collectData(req.el);
    return {
      method:  req.method,
      data:    data,
      headers: {
        'Accept':       'text/html+partial',
        'Content-Type': data && req.method != 'GET' ? 'application/x-www-form-urlencoded' : null,
        'TS-URL':       loc.pathname + loc.search,
        'TS-Origin':    elid(req.el),
        'TS-Target':    elid(findTarget(req.el))
      }
    };
  }

  function _doBatch(batch) {
    if (!batch.length) return;

    var url = batch[0].url;
    var method = batch[0].method;
    var data = batch.reduce(function(acc, req) {
      return mergeParams(acc, req.opts.data, false);
    }, new URLSearchParams()).toString();

    var query = method == 'GET' ? data : null;
    var body = method != 'GET' ? data : null;

    var opts = {
      method:  method,
      body:    body,
      headers: batch.reduce(function(h, req) {
        return mergeHeaders(h, req.opts.headers);
      }, {})
    };

    var fullurl = url;
    if (query) {
      fullurl += url.indexOf('?') == -1 ? '?' : '&';
      fullurl += query;
    }

    var origins = batch.map(function(req) { return req.el; });
    origins.forEach(function (el) {
      el.classList.add('ts-active');
    });

    return xhr(fullurl, opts)
      .then(function(res) {
        origins.forEach(el => el.classList.remove('ts-active'));

        // res.url == "" with mock-xhr
        if (res.ok && res.url && (res.url != (location.origin + fullurl))) {
          res.headers['ts-history'] = res.url;
          return swap(res.url, [document.body], res.content, res.headers);
        }

        if (res.ok) {
          // cannot use res.url here since fetchMock will not set it to right
          // value
          return swap(fullurl, origins, res.content, res.headers);
        }

        ERR(res.content);
      })
      .catch(function(res) {
        origins.forEach(el => el.classList.remove('ts-active'));

        ERR('Error retrieving backend response', res.error || res);
      });
  }

  function doBatch(batch) {
    return Promise
      .all(batch.map(function(req) {
        req.opts = makeOpts(req);
        var action = doAction(req.el, req.event, getattr(req.el, 'ts-req-before'), {req: req});
        if (!action) return req;
        return action.then(function(res) {
          // skip if action explicitly returned `false`
          return res === false ? null : req;
        });
      }))
      .then(function(res) {
        return res.filter(function(req) { return !!req; });
      })
      .then(_doBatch);
  }

  // Batch Request Queue
  /** @typedef {{el: !Element, url: string, method: string, batch: boolean}} */
  var Req;
  /** @type {{reqs: Array<Req>, request: ?number}} */
  var queue = {
    reqs: [],
    request: null
  };

  function executeRequests() {
    var batches = groupBy(queue.reqs, req => req.method + req.url);
    queue = {reqs: [], request: null};

    for (var k in batches) {
      doBatch(batches[k]);
    }
  }

  function queueRequest(req) {
    queue.reqs.push(req);
    if (!queue.request) {
      queue.request = setTimeout(executeRequests, 16);
    }
  }

  /** @type {function(Element, boolean): {el: Element, url: string, method: string, batch: boolean} } */
  function makeReq(el, e, batch) {
    var url = ((batch ? getattr(el, 'ts-req-batch') : getattr(el, 'ts-req')) ||
               (el.tagName == 'FORM' ? getattr(el, 'action') : getattr(el, 'href')));
    var method = (getattr(el, 'ts-req-method') ||
                  (el.tagName == 'FORM' ?
                   (getattr(el, 'method') || 'POST') :
                   'GET')).toUpperCase();

    return {el:     el,
            event:  e,
            url:    url,
            method: method,
            batch:  batch};
  }
  // End Batch Request Queue

  function markSubmitter(el) {
    el.addEventListener('click', function(e) {
      setattr(el, 'ts-clicked', '1');
      // form data should be handled synchronously
      onidle(function() { delattr(el, 'ts-clicked'); });
    });
  }

  function onNative(el, func) {
    var tag = el.tagName;
    var event = 'click';
    if (tag == 'FORM')
      event = 'submit';
    else if ((tag == 'INPUT') || (tag == 'SELECT') || (tag == 'TEXTAREA'))
      event = 'change';

    if (tag == 'FORM' && event == 'submit') {
      el.querySelectorAll('button').forEach(markSubmitter);
      el.querySelectorAll('input[type="submit"]').forEach(markSubmitter);
    }

    return el.addEventListener(event, function(e) {
      if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || (e.button || 0) != 0)
        return;

      e.preventDefault();
      e.stopPropagation();
      func(e);
    });
  }

  register('[ts-req]', function(el) {
    function handler(e) {
      doBatch([makeReq(el, e, false)]);
    }

    if (hasattr(el, 'ts-trigger')) {
      el.addEventListener('ts-trigger', handler);
    } else {
      onNative(el, handler);
    }
  });


  register('[ts-req-batch]', function(el) {
    function handler(e) {
      queueRequest(makeReq(el, e, true));
    }

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

  function executeCommand(command, args, payload) {
    var cmd = ((window._ts_func && window._ts_func[command]) ||
               FUNCS[command] ||
               window[command]);

    if (cmd) {
      args.push(payload);
      return cmd.apply(payload.el, args);
    }

    ERR('Unknown action', command, args);
  }

  function parseActionSpec(s) {
    return s.split(',').map(c => c.trim().split(/\s+/));
  }

  /** @type {function(Element, Event, string=, Object=): (Promise|undefined)} */
  function doAction(target, e, spec, payload) {
    if (!spec) return;

    var commands = parseActionSpec(spec);
    payload = Object.assign(payload || {}, {el: target, event: e});

    return commands.reduce(function(p, command) {
      return p.then(function(r) {
        // `false` indicates that action should stop
        if (r === false)
          return r;
        return executeCommand(command[0], command.slice(1), payload);
      });
    }, Promise.resolve());
  }

  register('[ts-action]', function(el) {
    var handler = function(e) {
      if (e.detail && e.detail.type) {
        // real event to trigger this action
        e = e.detail;
      }
      doAction(findTarget(el), e, getattr(el, 'ts-action'));
    };
    if (hasattr(el, 'ts-trigger')) {
      el.addEventListener('ts-trigger', handler);
    } else if (el.tagName == 'A' || el.tagName == 'BUTTON') {
      onNative(el, handler);
    } else {
      ERR('No trigger for action on element', el);
    }
  });


  /// Triggers

  function makeObserver(opts) {
    var on = opts.on;
    var off = opts.off;

    return new IntersectionObserver(function(entries, obs) {
      var threshold = obs.thresholds[0];
      var entry;
      for (var i = 0; i < entries.length; i++) {
        entry = entries[i];

        // isIntersecting is often `true` in FF even when it shouldn't be
        if (entry.intersectionRatio > threshold) {
          sendEvent(entry.target, on, {detail: entry});
        } else if (entry.intersectionRatio < threshold) {
          sendEvent(entry.target, off, {detail: entry});
        }
      }
    }, opts);
  }

  var closebyMargin = (window.innerHeight / 5 | 0) + 'px';

  var visible = makeObserver({on: 'visible', off: 'invisible', rootMargin: '0px', threshold: 0.2});
  var closeby = makeObserver({on: 'closeby', off: 'away', rootMargin: closebyMargin, threshold: 0.2});
  var removed = new MutationObserver(function(recs) {
    for (var rec of recs) {
      for (var node of rec.removedNodes) {
        sendEvent(node, 'remove', {detail: rec});
      }
    }
  });

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

    switch (type) {
    case 'load':         tsTrigger(el, {type: 'load'});
      break;
    case 'windowScroll': window.addEventListener('scroll', function(e) { tsTrigger(el, e); });
      break;
    case 'scroll':       el.addEventListener(type, function(e) { tsTrigger(el, e); });
      break;
    case 'remove':       removed.observe(el.parentElement, {childList: true});
    case 'visible':      visible.observe(el);
    case 'invisible':    visible.observe(el);
    case 'closeby':      closeby.observe(el);
    case 'away':         closeby.observe(el);
    default:             el.addEventListener(type, function(e) { tsTrigger(el, e); });
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
    target:    findTarget,
    trigger:   sendEvent,
    logtoggle: () => localStorage._ts_debug = (DEBUG=!DEBUG) ? 'true' : '',
    _internal: {DIRECTIVES: DIRECTIVES,
                init: init}
  };

  window[tsname] = twinspark;
})(window,document,'twinspark');
