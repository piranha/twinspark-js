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

function makeel(tag, attrs, content) {
  var el = document.createElement(tag);
  el.innerHTML = content;
  for (var k in attrs) {
    el.setAttribute(k, attrs[k]);
  }
  return el;
}

document.addEventListener('DOMContentLoaded', function() {
  [].forEach.call(document.querySelectorAll('.card'), function(card) {
    var example = card.querySelector('.card-body');
    example.initial = example.innerHTML;

    card.querySelector('.reset').addEventListener('click', function(e) {
      example.innerHTML = example.initial;
      twinspark.activate(example);
    });

    card.querySelector('.source').addEventListener('click', function(e) {
      /* var sources = card.querySelectorAll('script');
       * var html = '<h5>Example HTML</h5>' + codewrap(example.initial);
       * for (var i = 0; i < sources.length; i++) {
       *   var el = sources[i];
       *   var title = el.getAttribute('type') == 'text/html' ? 'Server response' : 'Tests/support scripts';
       *   html += '<hr><h5>' + title + '</h5>';
       *   html += codewrap(el.innerHTML);
       * }
       * example.innerHTML = html; */
      if (example.firstElementChild.tagName == 'PRE')
        return;
      example.innerHTML = codewrap(example.innerHTML);
      example.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    });
  });

  [].forEach.call(document.querySelectorAll('h3, h4'), function(el) {
    if (el.id && !el.querySelector('.anchor')) {
      var a = makeel('a', {href: '#' + el.id, className: 'anchor'}, '#');
      el.append(' ');
      el.append(a);
    }
  });
});
