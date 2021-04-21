/* jshint esversion: 6 */

(function(window, document, tsname) {
  var localStorage = window.localStorage;
  var location = window.location;
  var script = document.currentScript;

  /// Config

  var xhrTimeout = parseInt(script && script.dataset.timeout || 3000, 10);
  var historyLimit = parseInt(script && script.dataset.history || 20, 10);

  /// Internal variables

  // Indicates if `init` has happened
  var READY = false;
  /** @type {boolean} */
  var DEBUG = localStorage._ts_debug || false;


  /** @typedef {{selector: string, handler: (function(!Element): void)}} */
  var Directive;

  /** @type {Array<Directive>} */
  var DIRECTIVES = [];

  /** @const {!Object<string, Function>} */
  var FUNCS = {
    stop:        function(o) { if (o.event) o.event.stopPropagation(); },
    prevent:     function(o) { if (o.event) o.event.preventDefault(); },
    delay:       delay,

    not: function(funcname) {
      var args = [].slice.call(arguments, 1, arguments.length - 1);
      var o = assign({}, arguments[arguments.length - 1]);
      o.src = o.src.slice(o.command.length + 1);

      var rv = executeCommand(funcname, args, o);

      // this means previous command does not return truthy/falsy value, we
      // ignore that
      if (rv === null || rv === undefined) {
        return rv;
      }
      return !rv;
    },

    target: function(sel, o) {
      var el = findTarget(o.el, sel);
      if (!el) return false; // stop executing
      o.el = el
    },

    remove: function(sel, o) {
      if (o) {
        findTarget(o.el, sel).remove();
      } else {
        return sel.el.remove();
      }
    },

    wait: function(eventname, o) {
      return new Promise(function(resolve) {
        o.el.addEventListener(eventname, resolve, {once: true});
      });
    },

    class:       function(cls, o) { o.el.classList.add(cls); },
    "class+":    function(cls, o) { o.el.classList.add(cls); },
    "class-":    function(cls, o) { o.el.classList.remove(cls); },
    "class^":    function(cls, o) { o.el.classList.toggle(cls); },
    classtoggle: function(cls, o) { o.el.classList.toggle(cls); },

    log: function() {
      var args = parseArgs(arguments);
      if (args.o.input) {
        args.rest.push(args.o.input);
      }
      console.log.apply(console, args.rest);
    }
  };


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

  /** @type{function(!Object, (Object|null|undefined)): !Object} */
  var assign = Object.assign || function(tgt, src) {
    if (!src) {
      return tgt;
    }

    for (var k in src) {
      if (src.hasOwnProperty(k)) {
        tgt[k] = src[k];
      }
    }
    return tgt;
  };

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

  function el2str(el) {
    return el.outerHTML.match(/<.+?>/)[0];
  }

  function extraerr(msg, data) {
    var err = Error(msg);
    err.extra = data;
    return err;
  }

  function memoize(orig) {
    var cache = null;
    return function() {
      return cache || (cache = orig());
    };
  }

  /** @type {function(string): (number|undefined)} */
  function parseTime(s) {
    s = s && s.trim();
    if (!s)
      return;
    if (s.match(/\d+s/))
      return parseFloat(s) * 1000;
    return parseFloat(s);
  }

  function delay(s) {
    return new Promise(function(resolve) {
      setTimeout(resolve, parseTime(s), true);
    });
  }

  /** @type {function(Arguments): {rest: Array<*>, o: {el: Element, e: Event}}} */
  function parseArgs(args) {
    var i = args.length;
    return {rest: [].slice.call(args, 0, i - 1),
            o:    args[i - 1]};
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

  /** @type {function((Element|Node|Window), string, Object=): !Event} */
  function sendEvent(el, type, opts) {
    opts || (opts = {});
    // bubbles is true by default but could be false
    var bubbles = opts.hasOwnProperty('bubbles') ? opts.bubbles : true;
    var event = new CustomEvent(type, {bubbles: bubbles,
                                       cancelable: true,
                                       detail: opts.detail});
    LOG(el, type, opts.detail);
    el.dispatchEvent(event);
    return event;
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

  /** @type {function(Element, Directive): void} */
  function attach(el, directive) {
    [].forEach.call(qse(el, directive.selector), directive.handler);
  }

  /**
   * Registers new directive.
   * @param  {string} selector Directive selector.
   * @param  {function(!Element): void} handler Directive callback.
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

      xhr.timeout = xhrTimeout;
      xhr.ontimeout = function() {
        return reject({ok:    false,
                       url:   url,
                       error: "timeout"});
      }

      var body = /** @type {(ArrayBuffer|ArrayBufferView|Blob|Document|FormData|null|string|undefined)} */ (opts.body);
      xhr.send(body);
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
    // iterator loop here since p2 could be either an array or an
    // URLSearchParams instance
    for (var [k, v] of p2) {
      if (!k) continue;

      if (removeEmpty && ((v === null) || (v === ''))) {
        p1.delete(k);
      } else {
        p1.append(k, v);
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

  /** @type {function(Element): string?} */
  function formElementValue(el) {
    if (!el.name)
      return null;

    // only clicked submit buttons should be handled. In ideal world we would
    // look at e.submitter, but no support from Safari
    if (el.type == 'submit' && !hasattr(el, 'ts-clicked'))
      return null;

    if (((el.type == 'radio') || (el.type == 'checkbox')) &&
        !el.checked) {
      return null;
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
        data.append(el.name, /** @type {string} */ (res));
    }

    return data;
  }

  /// IndexedDB

  var IDB = window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB;
  var _idb;

  function reqpromise(req) {
    return new Promise(function(resolve, reject) {
      req.onsuccess = function() { resolve(req.result); };
      req.onerror   = function() { reject(req.error); };
    });
  }

  function idb() {
    if (_idb)
      return _idb;

    var dbname = 'twinspark';
    var req = IDB.open(dbname, 1);
    req.onupgradeneeded = function() {
      var db = req.result;
      var store = db.createObjectStore(dbname, {keyPath: 'url'});
      store.createIndex('time', 'time');
    };

    return _idb = reqpromise(req);
  }

  /** @type {function(Object, Object=): Object} */
  function idbStore(db, opts) {
    var rw = opts && opts.write;
    return db.transaction(db.name, rw && 'readwrite' || 'readonly')
      .objectStore(db.name);
  }

  /// History

  function deleteOverLimit(db) {
    reqpromise(idbStore(db).count()).then(function(count) {
      LOG('stored', count);
      var toremove = count - historyLimit;
      if (toremove > 0) {
        var req = idbStore(db, {write: true})
            .index('time')
            .openCursor();
        // This API is like an abyss looking at me. `onsuccess` will be called
        // every time you call `cursor.continue()`.
        req.onsuccess = function(_) {
          var cursor = req.result;
          if (cursor) {
            cursor.delete();
            if (--toremove > 0) {
              cursor.continue();
            }
          }
        }
      }
    });
  }

  function storeCurrentState() {
    var data = {url:  location.pathname + location.search,
                html: document.body.innerHTML,
                time: +new Date()};
    idb().then(function(db) {
      reqpromise(idbStore(db, {write: true})
                 .put(data))
        .then(function() {
          deleteOverLimit(db);
        });
    });
  }

  function pushState(url, title) {
    // Store HTML before "changing page", `swap` is going to change HTML after
    // that
    storeCurrentState();
    history.pushState(null, title, url);
    sendEvent(window, 'ts-pushstate', {detail: url});
  }

  function onpopstate(e) {
    var url = location.pathname + location.search;
    idb().then(function(db) {
      return reqpromise(
        db.transaction(db.name, 'readonly')
          .objectStore(db.name)
          .get(url));
    }).then(function(data) {
      LOG('restore', data);
      if (data && data.html) {
        document.body.innerHTML = data.html;

        // If user came back from a real page change, we indicate this with an
        // `initial` property. There is a race between IndexedDB loading HTML
        // and DOMContentLoaded, so in case when first happened and second did
        // not, `READY` is false and thus `activate` will be run later on inside
        // `init`. Skip this not to activate everything twice.
        if (e.initial && !READY) {
          return;
        }

        activate(document.body)
      }
    });
  };


  /// Fragments

  /** @type {function(Element, string, boolean): (Element|undefined)} */
  function _findSingleTarget(el, sel, childrenOnly) {
    if (!sel || !el) {
      return el;
    }

    if (sel == 'inherit') {
      var parent = el.parentElement.closest('[ts-target]');
      return findTarget(parent);
    }

    if (sel.slice(0, 7) == 'parent ') {
      return el.closest(sel.slice(7));
    }

    if (sel.slice(0, 6) == 'child ') {
      return el.querySelector(sel.slice(6));
    }

    if (sel.slice(0, 8) == 'sibling ') {
      return el.parentElement.querySelector(sel.slice(8));
    }

    if (childrenOnly) {
      return el.querySelector(sel);
    }

    return document.querySelector(sel);
  }

  function findSingleTarget(el, sel, childrenOnly) {
    var res = _findSingleTarget(el, sel, childrenOnly);
    if (res)
      return res;

    var elstr = el2str(el);
    var msg = "Could not find element with selector '" + sel + "' for element " + elstr;
    if (childrenOnly)
      msg += ' among children';

    throw extraerr(msg, {
      element: elstr,
      selector: sel
    });
  }

  /** @type {function(Element, string=): (Element|undefined)} */
  function findTarget(el, sel) {
    if (sel == null) {
      sel = getattr(el, 'ts-target');
    }
    if (!sel) { // null, undefined, ""
      return el;
    }

    var bits = sel.split('|').map(s => s.trim());
    // when selector is not the first we are not going to escape to global
    // search from document root, it's always one of modifiers (see
    // `_findSingleTarget`), in the least it will look for a child
    return bits.reduce((el, sel, idx) => findSingleTarget(el, sel, idx > 0), el);
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
    default:            throw Error('Unknown swap strategy ' + strategy);
    }
    return reply;
  }

  function elementSwap(origin, replyParent) {
    var target = findTarget(origin);
    var reply = findReply(target, origin, replyParent);
    var strategy = getattr(origin, 'ts-swap') || 'replace';

    if (origin) {
      var e = sendEvent(origin, 'ts-req-after');
      doActions(origin, e, getattr(origin, 'ts-req-after'), null);
    }
    return executeSwap(strategy, target, reply);
  }

  function pushedSwap(reply) {
    var sel = getattr(reply, 'ts-swap-push');
    if (!sel && reply.id) {
      sel = '#' + reply.id;
    }
    if (!sel) {
      return ERR('cannot find target for server-pushed swap', reply);
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

  function replaceScript(el) {
    var parent = el.parentNode;
    var newel = document.createElement(el.nodeName);

    for (var j = 0; j < el.attributes.length; j++) {
      var attr = el.attributes[j];
      newel.setAttribute(attr, el.getAttribute(attr));
    }

    newel.appendChild(document.createTextNode(el.innerHTML));
    parent.replaceChild(newel, el);
  }

  function processScripts(el) {
    var scripts = el.querySelectorAll('script');
    for (var i = 0; i < scripts.length; i++) {
      var old = scripts[0];
      if (!old.type || old.type == 'text/javascript') {
        replaceScript(old);
      }
    }
  }

  // Terminology:
  // `origin` - an element where request started from, a link or a button
  // `target` - where the incoming HTML will end up
  // `reply` - incoming HTML to end up in target
  /** @type {function(string, Array<Element>, string, Object): Array<Element>} */
  function swap(url, origins, content, headers) {
    var html = new DOMParser().parseFromString(content, 'text/html');
    var title = headers['ts-title'] || html.title;
    // either ts-history contains new URL or ts-req-history attr is present,
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

    swapped.forEach(processScripts);
    swapped.forEach(activate);
    autofocus(swapped);
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
        'TS-URL':       location.pathname + location.search,
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
        onidle(() => origins.forEach(el => el.classList.remove('ts-active')));

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

        ERR('Something wrong with response', res.content);
      })
      .catch(function(res) {
        onidle(() => origins.forEach(el => el.classList.remove('ts-active')));

        ERR('Error retrieving backend response', fullurl, res.error || res);
      });
  }

  function doBatch(batch) {
    return Promise
      .all(batch.map(function(req) {
        req.opts = makeOpts(req);

        var e = sendEvent(req.el, 'ts-req-before', {req: req});
        if (e.defaultPrevented)
          return null;

        var action = doActions(req.el, e, getattr(req.el, 'ts-req-before'), {req: req});
        if (!action)
          return req;

        return action.then(function(res) {
          // skip making request if event was prevented
          return e.defaultPrevented ? null : req;
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

  /** @type {function(Element, Event, boolean): {el: Element, event: Event, url: string, method: string, batch: boolean} } */
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
      [].forEach.call(el.querySelectorAll('button'), markSubmitter);
      [].forEach.call(el.querySelectorAll('input[type="submit"]'), markSubmitter);
    }

    return el.addEventListener(event, function(/** @type {!Event} */ e) {
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

  /** @typedef {{
   *   src: string,
   *   name: string,
   *   args: Array<string>
   * }}
   */
  var CommandDef;

  /** @typedef {{
   *   src: string,
   *   commands: Array<CommandDef>
   * }}
   */
  var ActionDef;

  /**
   * Either call it with object of name to function, or with a name and a
   * function.
   * @type {function((Object|string), Function=): Object} */
  function registerCommands(cmdsOrName, maybeFunc) {
    if (typeof cmdsOrName == 'object') {
      return assign(FUNCS, cmdsOrName);
    } else if (maybeFunc) {
      FUNCS[cmdsOrName] = maybeFunc;
    }
    return FUNCS;
  }

  function executeCommand(command, args, payload) {
    var cmd = /** @type {Function|undefined|null} */ (
      (window._ts_func && window._ts_func[command]) ||
        FUNCS[command] ||
        window[command]);

    if (!cmd) {
      throw Error('Unknown action command: ' + payload.src);
    }

    return cmd.apply(payload.el, args.concat([payload]));
  }

  /** @type {function(string): Array<ActionDef>}
   *
   *  Parses strings of the form:
   *
   *      cmd1 arg1, cmd2 arg2 'some, \'stuff'; cmd3 arg3
   *
   *  To an array of objects:
   *
   *      [{src: "cmd1 arg1, cmd2 arg",
   *        commands: [{src: "cmd1 arg1", name: "cmd1", args: ["arg1"]},
   *                   {src: "cmd2 arg2 'some, stuff'", name: "cmd2",
   *                    args: ["arg2", "some, 'stuff"]}]},
   *       {src: "cmd3 arg3",
   *        commands: [{src: "cmd3 arg3", name: "cmd3", args: ["arg3"]}]}]
   *
   *  Understands quoting of strings and escaping quotes
   */
  function parseActionSpec(s) {
    var actions = [];
    var action = [];
    var command = [];
    var current = '';
    var command_start = 0, action_start = 0, i = 0;
    var quote = null;

    function parseValue(s) {
      var c = s[0];
      if (c == '"' || c == "'") {
        return s.slice(1, s.length - 1);
      }
      return s;
    }

    function consume() {
      var token = current.trim();
      if (token.length) {
        command.push(parseValue(token));
      }
      current = '';
    }

    function consumeCommand() {
      if (!command.length)
        return;

      action.push({src:   s.slice(command_start, i).trim(),
                   name:  command[0],
                   args:  command.slice(1)});
      command = [];
      command_start = i + 1;
    }

    function consumeAction() {
      if (!action.length)
        return;

      actions.push({src: s.slice(action_start, i).trim(),
                    commands: action});
      action = [];
      action_start = i + 1;
    }

    for (i = 0; i < s.length; i++) {
      var c = s[i];

      if (quote) {
        if (c == '\\') {
          i++;
          current += s[i];
        } else if (c == quote) {
          current += c;
          quote = null;
        } else {
          current += c;
        }
      } else {
        if ((c == "'") || (c == '"')) {
          quote = c;
        } else if (c == " ") {
          consume();
          continue;
        } else if (c == ",") {
          consume();
          consumeCommand();
          continue;
        } else if (c == ";") {
          consume();
          consumeCommand();
          consumeAction();
          continue;
        }

        current += c;
      }
    }

    consume();
    consumeCommand();
    consumeAction();
    return actions;
  }


  /** @type {function(ActionDef, {el: Element, e: Event}): !Promise} */
  function _doAction(action, payload) {
    LOG('action', action.src, payload);

    // make a copy, since we allow modification of payload in commands
    var opts = assign({line: action.src}, payload);

    return action.commands.reduce(function(p, command) {
      return p.then(function(rv) {
        LOG('COMMAND', command.src, rv, action.src);
        // `false` indicates that action should stop
        if (rv === false)
          return rv;
        if (rv !== undefined)
          opts.input = rv;

        opts.command = command.name;
        opts.src = command.src;

        return executeCommand(command.name, command.args, opts);
      }).catch(function(err) {
        throw assign(err, {extra: {
          command: command.src,
          action: action.src,
          element: el2str(opts.el)
        }});
      });
    }, Promise.resolve(null));
  }

  /** @type {function((Element|undefined), Event, string=, Object=): (Promise|undefined)} */
  function doActions(target, e, spec, payload) {
    if (!spec) return;

    var actions = parseActionSpec(spec);
    // parens indicate type cast rather than type declaration
    var mypayload = /** @type {{el: Element, e: Event}} */ (assign({el: target, event: e}, payload));

    var result;
    for (var i = 0; i < actions.length; i++) {
      var action = actions[i];
      if (action.commands.length) {
        result = _doAction(action, mypayload);
      }
    }

    // Last result is returned
    return result;
  }

  register('[ts-action]', function(el) {
    var handler = function(/** @type {!Event} */ e) {
      if (e.detail && e.detail.type) {
        // real event to trigger this action
        e = e.detail;
      }
      doActions(findTarget(el), e, getattr(el, 'ts-action'), null);
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

  /** @type {function({on: string, off: string, rootMargin: string, threshold: number}): IntersectionObserver} */
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

  var visibleObs = memoize(function() {
    return makeObserver({on: 'visible',
                         off: 'invisible',
                         rootMargin: '0px',
                         threshold: 0.2});
  });

  var closebyObs = memoize(function() {
    // triggers style recalculation:
    // https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    var margin = (window.innerHeight / 5 | 0) + 'px';
    return makeObserver({on: 'closeby',
                         off: 'away',
                         rootMargin: margin,
                         threshold: 0.2});
  });

  var removedObs = memoize(function() {
    return new MutationObserver(function(recs) {
      for (var i = 0; i < recs.length; i++) {
        var rec = recs[i];
        for (var j = 0; j < rec.removedNodes.length; j++) {
          var node = rec.removedNodes[j];
          sendEvent(node, 'remove', {detail: rec});
        }
      }
    });
  });

  /** @type {function(Element): {once: (boolean|undefined), delay: (number|undefined)}} */
  function internalData(el) {
    var prop = 'twinspark-internal';
    return el[prop] || (el[prop] = {});
  }

  /** @type {function(CommandDef): (function(!Element, (Event|{type: string})): undefined)}*/
  function makeTriggerListener(t) {
    var delay = t.args.indexOf('delay');
    /** @type {{changed: boolean, once: boolean, delay: (number|null|undefined)}} */
    var spec = {changed: t.args.indexOf('changed') != -1,
                once:    t.args.indexOf('once') != -1,
                delay:   delay != -1 ? parseTime(t.args[delay + 1]) : null};
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

  /** @type {function(!Element, CommandDef): undefined} */
  function registerTrigger(el, t) {
    var type = t.name;
    var tsTrigger = makeTriggerListener(t);

    switch (type) {
    case 'load':         tsTrigger(el, {type: 'load'});
      break;
    case 'windowScroll': window.addEventListener('scroll', function(e) { tsTrigger(el, e); }, {passive: true});
      break;
    case 'scroll':       el.addEventListener('scroll', function(e) { tsTrigger(el, e); }, {passive: true});
      break;
    case 'remove':       removedObs().observe(el.parentElement, {childList: true});
    case 'visible':      visibleObs().observe(el);
    case 'invisible':    visibleObs().observe(el);
    case 'closeby':      closebyObs().observe(el);
    case 'away':         closebyObs().observe(el);
    default:             el.addEventListener(type, function(e) { tsTrigger(el, e); });
    }
  }

  register('[ts-trigger]', function(el) {
    var spec = getattr(el, 'ts-trigger');
    if (!spec) return;

    var triggers = parseActionSpec(spec)[0];

    triggers.commands.forEach(function(t) {
      registerTrigger(el, t);
    });
  });


  /// Start up

  /** @type {function(Event=): void} */
  function init(_e) {
    window.addEventListener('popstate', onpopstate);
    // Store HTML before going to other page
    window.addEventListener('beforeunload', storeCurrentState);
    activate(document.body);
    READY = true;
    LOG('init done', _e);
  }

  onload(init);

  // this is done outside of `init` since that way we can restore HTML before
  // `DOMContentLoaded` has happened and browser will set correct scroll
  // location automatically
  if (window.performance &&
      window.performance.navigation.type == window.performance.navigation.TYPE_BACK_FORWARD) {
    // Restore HTML when user came back to page from non-pushstate destination
    onpopstate({initial: true});
  }

  /// Public interface

  var twinspark = {
    onload:      onload,
    register:    register,
    activate:    activate,
    func:        registerCommands,
    elcrumbs:    elcrumbs,
    data:        collectData,
    target:      findTarget,
    trigger:     sendEvent,
    parseAction: parseActionSpec,
    action:      doActions,
    exec:        executeCommand,
    logtoggle:   () => localStorage._ts_debug = (DEBUG=!DEBUG) ? 'true' : '',
    setERR:      (errhandler) => ERR = errhandler,
    _internal:   {DIRECTIVES: DIRECTIVES,
                  FUNCS: FUNCS,
                  init: init}
  };

  window[tsname] = twinspark;
})(window,document,'twinspark');
