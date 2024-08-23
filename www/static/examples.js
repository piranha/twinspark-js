XHRMock.setup();

XHRMock.delay = function(mock, ms) {
  return function (req, res) {
    var msint = typeof ms == 'function' ? ms() : ms;
    return new Promise((resolve) => setTimeout(() => resolve(true), msint))
      .then(_ => {
        var ret = typeof mock === 'function' ?
            mock(req, res, msint) :
            res.status(mock.status || 200).body(mock.body);
        return ret;
      });
  }
}

function prev(n=1) {
  var el = document.currentScript;
  while (n--) {
    el = el.previousElementSibling;
    // markdown introduces empty paragraphs sometimes
    if (el.tagName == 'P' && el.innerHTML == '') {
      el = el.previousElementSibling;
    }
  };
  return el && el.innerHTML;
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
  // first remove only-whitespace lines in front or back of a string
  var lines = s.replace(/(^\s*\n)|(\n\s*$)/g, '').split('\n');
  var offsets = lines.map(line => line.search(/\S|$/));
  var offset = Math.min.apply(Math, offsets);
  return lines.map(line => line.slice(offset)).join('\n');
}

function decode(s) {
  return decodeURIComponent(s.replace(/\+/g, ' '));
}

function codewrap(s) {
  return '<pre><code>' + escape(s) + '</code></pre>';
}


function enableExamples() {
  [].forEach.call(document.querySelectorAll('.card.example'), function(card) {
    var example = card.querySelector('.card-body');
    example.initial = example.innerHTML;

    card.querySelector('.reset').addEventListener('click', function(e) {
      example.innerHTML = example.initial;
      twinspark.activate(example);
    });

    function isSource(el) {
      if (!el) return;
      if (el.classList.contains('card-body') ||
          el.tagName == 'STYLE' ||
          (el.tagName == 'SCRIPT' && el.dataset.source)) {
        return true;
      }
    }

    var source = dedent(example.innerHTML.trim());
    let next = example.nextElementSibling;
    while (true) {
      if (!isSource(next))
        break;
      source += '\n\n' + dedent(next.outerHTML.trim());
      next = next.nextElementSibling;
    }
    card.querySelector('.source').addEventListener('click', function(e) {
      if (example.firstElementChild.tagName == 'PRE')
        return;
      example.innerHTML = codewrap(source);
      example.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    });
  });
}

document.addEventListener('DOMContentLoaded', enableExamples);
window.addEventListener('hotreload', _ => twinspark.activate(document.body));
window.addEventListener('hotreload', enableExamples);
window.addEventListener('popstate', _ => setTimeout(enableExamples, 16));

/// Tests

// this function is to write tests, see `www/examples/*` for example usage
window.test = (function() {
  var TESTS = [];

  function makeTest(name, testfn) {
    var parent = document.currentScript.closest('div');
    var example = parent.querySelector('.card-body');

    if (typeof name == 'function') {
      testfn = name;

      var h = parent;
      while(h && !((h = h.previousElementSibling).tagName == 'H3')) {
      }
      name = h && h.innerText || 'test';
    }

    return {
      name: name,
      func: async (t) => {
        example.innerHTML = example.initial;
        twinspark.activate(example);
        try {
          await testfn(example, t)
        } finally {
          example.innerHTML = example.initial;
          twinspark.activate(example);
        }
        return 1;
      }
    };
  }

  function test(name, testfn) {
    TESTS.push(makeTest(name, testfn));
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

    tt.test(TESTS, e && e.detail);
  }

  window.addEventListener('run-tests', runTests);
  window.RUNTESTS = runTests;

  return test;
})();
