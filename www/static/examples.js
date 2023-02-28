XHRMock.setup();

XHRMock.delay = function(mock, ms) {
  return function (req, res) {
    var ret = typeof mock === 'function' ?
        mock(req, res) :
        res.status(mock.status || 200).body(mock.body);
    if (ret === undefined) return ret;
    return new Promise(resolve => setTimeout(() => resolve(ret), ms));
  }
}

function prev(n) {
  var el = document.currentScript.previousElementSibling;
  if (n == 2)
    el = el.previousElementSibling;
  return el.innerHTML;
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

function dedent(s) {
  var lines = s.split('\n');
  var offsets = lines.slice(1).map(line => line.search(/\S|$/));
  var offset = Math.min.apply(Math, offsets);
  var pat = new RegExp(`\n[\t ]{${offset}}`, 'g');
  s = s.replace(pat, '\n');
  return s;
}

function cleancode(s) {
  return escape(dedent((s || '').trim()));
}

function codewrap(s) {
  return '<pre><code>' + cleancode(s) +'</code></pre>';
}

function enableExamples() {
  [].forEach.call(document.querySelectorAll('.card.example'), function(card) {
    var example = card.querySelector('.card-body');
    example.initial = example.innerHTML;

    card.querySelector('.reset').addEventListener('click', function(e) {
      example.innerHTML = example.initial;
      twinspark.activate(example);
    });

    card.querySelector('.source').addEventListener('click', function(e) {
      if (example.firstElementChild.tagName == 'PRE')
        return;
      example.innerHTML = codewrap(example.innerHTML);
      example.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    });
  });
}

document.addEventListener('DOMContentLoaded', enableExamples);
window.addEventListener('hotreload', enableExamples);

/// Tests

window.test = (function() {
  var TESTS = [];

  function makeTest(testfn) {
    var parent = document.currentScript.closest('div');
    var example = parent.querySelector('.card-body');
    var h = parent;
    while(h && !((h = h.previousElementSibling).tagName == 'H3')) {
    }

    return {
      name: h && h.innerText || 'test',
      func: async () => {
        example.innerHTML = example.initial;
        twinspark.activate(example);
        try {
          await testfn(example)
        } finally {
          example.innerHTML = example.initial;
          twinspark.activate(example);
        }
        return 1;
      }
      };
    }

    function test(testfn) {
      TESTS.push(makeTest(testfn));
    }

    // use to limit tests to only single function, so less noise happens when you
    // debug a test
    function test1(testfn) {
      var test = makeTest(testfn);
      setTimeout(_ => { TESTS = [test] }, 100);
    }

    function runTests(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      Element.prototype.$ = Element.prototype.querySelector;
      Element.prototype.$$ = Element.prototype.querySelectorAll;

      window.event = (type, attrs, el) => {
        var e = new Event(type);
        if (attrs) Object.assign(e, attrs);
        el.dispatchEvent(e);
      }
      window.click = (el) => event('click', {button: 0}, el);
      window.wait = function(func, t) {
        return new Promise(resolve => setTimeout(() => resolve(func()), t || 16))
      }

      tt.test(TESTS);
    }

    window.addEventListener('run-tests', runTests);

  return test;
})();