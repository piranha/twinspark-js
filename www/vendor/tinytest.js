/** (c) Alexander Solovyov

    Tiny test runner, supports async tests. Vendor that stuff.

  <style>
    #tinytest{font-family:sans-serif}
    #tinytest ul{margin:0 0 .5rem 1rem;padding-bottom:4px}
    #tinytest li{margin-top: .2rem;}
    #tinytest .duration{background: #c09853;
      padding: 2px 5px;
      font-size: .8rem;
      border-radius: 5px;
      box-shadow: inset 0 1px 1px rgba(0,0,0,.2);}
    #tinytest .test {margin-left: 2rem;}
    #tinytest .total {margin-left: 4rem;}
    #tinytest summary{padding:4px}
    #tinytest .test.pass summary::before {
      content: '✓'; display: inline-block; margin-right: 5px; color: #00d6b2; }
    #tinytest .test.fail summary::before, #tinytest .test.error summary::before {
      content: '✖'; display: inline-block; margin-right: 5px; color: #c00; }
    #tinytest .test.error { background: #fcf2f2; }
    #tinytest li.pass { list-style-type: '✓ '; }
    #tinytest li.fail { list-style-type: '✖ '; }
  </style>
 */

window.tt = (function() {
  var RESULTS = [], _EL;

  function EL() {
    if (_EL) return _EL;
    if (_EL = document.getElementById('tinytest')) return _EL;
    document.body.insertAdjacentHTML('beforeend', '<div id="tinytest"></div>');
    return EL();
  }

  function escape(s) {
    return s
      .replace(/&quot;/g, '"') // because json-in-attrs will be disgusting
      .replace(/&amp;/g, '&')
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function doReport(prio, name, results, duration, err) {
    var tlen = results.length;
    var flen = results.filter(r => !r[1]).length;
    var details = results
        .map(r => `<li class="${r[1] ? 'pass' : 'fail'}">${escape(r[0])}</li>`)
        .join('');

    var cls, desc;
    if (err) {
      cls = 'error', desc = 'Exception',
      details = `<pre><code>${err.stack}</code></pre>`;
    } else if (flen) {
      cls = 'fail', desc = `${flen} / ${tlen} Tests Failed`;
    } else {
      cls = 'pass', desc = `${tlen} Tests Passed`;
    }

    var dt = `<span class=duration>${duration}ms</span>`;
    var t = `<div class="test ${cls}" data-prio="${prio}"><details>
               <summary>${name}: ${desc} ${dt}</summary>
               <ul>${details}</ul>
             </details></div>`;

    var el;
    for (var child of EL().children) {
      if (parseInt(child.dataset.prio, 10) > prio) {
        el = child;
        break;
      }
    }
    if (el) {
      el.insertAdjacentHTML('beforebegin', t);
    } else {
      EL().insertAdjacentHTML('beforeend', t);
    }

    if (err) {
      console.error(`✖ ${name}: Exception ${err}`);
    } else if (flen) {
      console.error(`✖ ${name}: ${desc}`);
    } else {
      console.log(`✓ ${name}: ${desc}`);
    }

    return {name:     name,
            success:  !(err || flen),
            error:    err,
            results:  results,
            duration: duration}
  }

  function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t || 0, true));
  }

  function prefix(defs, func) {
    var flen = func.length;
    return function() {
      var len = arguments.length;
      var args = len < flen ?
          [...defs.slice(0, flen - len), ...arguments] :
          arguments;
      return func.apply(null, args);
    }
  }

  function innerapi() {
    var results = [];
    return {
      delay: delay,
      assert: prefix(['assert'], (desc, result) => results.push([desc, result])),
      eq: prefix(['eq'], (desc, left, right) => {
        var res = left == right;
        results.push([`${desc}: ${left} ${res ? '==' : '!='} ${right}`, res]);
      }),
      _results: results,
    }
  }

  async function seqMap(arr, cb) {
    var res = [];
    for (var i = 0; i < arr.length; i++) {
      res.push(await cb(arr[i], i));
    }
    return res;
  }

  var global = innerapi();

  async function test(tests, opts) {
    opts || (opts = {});
    var globalStart = performance.now();

    tests = Array.isArray(tests) ? tests : [tests];

    async function execute(test, idx) {
      var start = performance.now();
      var t = innerapi();
      var err;
      try {
        test.setup && test.setup();
        await test.func(t);
      } catch(e) {
        console.error(e);
        err = e;
      }

      var results = t._results;
      if (global._results) {
        // somebody used global tt.assert
        results = results.concat(global._results);
        global._results.length = 0;
      }

      return doReport(idx, test.name, results, performance.now() - start, err);
    }

    var report;
    if (opts.sync) {
      report = await seqMap(tests, execute);
    } else {
      var promises = tests.map(execute);
      report = await Promise.all(promises);
    }

    var duration = performance.now() - globalStart;
    EL().insertAdjacentHTML(
      'beforeend',
      `<div class="total" data-prio="1000000">
        <i>Total run time</i>: <span class=duration>${duration}ms</span>
      </div>`);

    EL().dispatchEvent(new CustomEvent('tt-done', {
      detail: {success: report.filter(r => !r.success).length == 0,
               report: report}}));
    return report;
  }

  return Object.assign(global, {test});
})();
