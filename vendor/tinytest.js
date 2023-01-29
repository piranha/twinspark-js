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
    #tinytest summary{padding:4px}
    #tinytest .test.pass summary::before {
      content: '✓'; display: inline-block; margin-right: 5px; color: #00d6b2; }
    #tinytest .test.fail summary::before, #tinytest .test.error summary::before {
      content: '✖'; display: inline-block; margin-right: 5px; color: #c00; }
    #tinytest .test.error { background: #fcf2f2; }
  </style>
 */

window.tt = (function() {
  var EL = document.getElementById('tinytest'),
      SUITE = [],
      RESULTS = [];

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


  function doReport(name, results, duration, err) {
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
      cls = 'fail', desc = `${flen / tlen} Tests Failed`;
    } else {
      cls = 'pass', desc = `${tlen} Tests Passed`;
    }

    duration = duration > 5 ? `in <span class=duration>${duration}ms</span>` : '';
    var t = `<div class="test ${cls}"><details>
                 <summary>${name}: ${desc} ${duration}</summary>
                 <ul>${details}</ul>
               </details></div>`;
    EL.insertAdjacentHTML('beforeend', t);
  }

  function assert(desc, result) {
    if (arguments.length == 1) {
      result = desc;
      desc = 'assert';
    }
    RESULTS.push([desc, result]);
    return result;
  }

  function test(name, func, setup) {
    SUITE.push({name, func, setup});
  }

  async function run(tests) {
    tests = tests || SUITE;
    for (var test of tests) {
      var start = performance.now();
      try {
        test.setup && test.setup();
        await test.func();
        doReport(test.name, RESULTS, performance.now() - start);
      } catch(e) {
        doReport(test.name, RESULTS, performance.now() - start, e);
        console.error(e);
      }
      RESULTS = [];
    }
  }

  function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t || 0, true));
  }

  return {test, assert, run, delay};
})();
