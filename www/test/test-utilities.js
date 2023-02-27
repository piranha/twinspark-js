/* Test Utilities */

function make(htmlStr) {
    let range = document.createRange();
    let fragment = range.createContextualFragment(htmlStr);

    let element = fragment.children[0];
    element.mutations = {elt: element, attribute:0, childrenAdded:0, childrenRemoved:0, characterData:0};

    let observer = new MutationObserver((mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                element.mutations.childrenAdded += mutation.addedNodes.length;
                element.mutations.childrenRemoved += mutation.removedNodes.length;
            } else if (mutation.type === 'attributes') {
                element.mutations.attribute++;
            } else if (mutation.type === 'characterData') {
                element.mutations.characterData++;
            }
        }
    });
    observer.observe(fragment, {attributes: true, childList: true, subtree: true});

    return element;
}

function makeElements(htmlStr) {
    let range = document.createRange();
    let fragment = range.createContextualFragment(htmlStr);
    return fragment.children;
}

function parseHTML(src) {
    let parser = new DOMParser();
    return parser.parseFromString(src, "text/html");
}

function getWorkArea() {
    return document.getElementById("work-area");
}

function clearWorkArea() {
    getWorkArea().innerHTML = "";
}

function print(elt) {
    let text = document.createTextNode( elt.outerHTML + "\n\n" );
    getWorkArea().appendChild(text);
    return elt;
}

/* Emulate Mocha with WRU */

(function(window) {
  var TESTS = [];
  var setup = null;
  var SCHEDULED = null;

  function describe(desc, cb) {
    desc = desc.replace('idiomorph', 'twinspark.morph');
    setup = null;
    TESTS.push({
      name: `<h3 class=group>${desc}</h3>`,
      func: () => {
        // style group
        setTimeout(() => {
          var groups = document.querySelectorAll('h3.group');
          for (var group of groups) {
            if (group.parentElement.tagName != 'SUMMARY')
              continue;
            var div = group.closest('div')
            div.append(group);
            div.className = '';
            group.previousSibling.remove(); // kill that span
            group.style.background = 'white';
            group.style.padding = '4px';
            group.style.margin = '0';
          }
        }, 0);
      }
    });
    cb();
    SCHEDULED || (SCHEDULED = setTimeout(() => tt.test(TESTS), 100));
  }

  function beforeEach(cb) {
    setup = cb;
  }

  function it(desc, cb) {
    if (cb.length == 1) {
      var test = function() {
        return new Promise(resolve => cb(resolve));
      }
    } else {
      var test = cb;
    }
    TESTS.push({
      name: desc,
      setup: setup,
      func: test,
    });
  }

  function should(obj) {
    return new Assertion(obj);
  }

  should.equal = (v1, v2) => tt.assert(v1 + ' == ' + v2, v1 == v2);

  var Assertion = should.Assertion = function Assertion(obj) {
    this.obj = obj;
  }

  Assertion.prototype = {
    constructor: Assertion,
    equal: function(v) { should.equal(this.obj, v) }
  }

  Object.defineProperty(Object.prototype, 'should', {
    set: function(value) {
      Object.defineProperty(this, 'should', {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    },
    get: function() {
      return should(this);
    },
    configurable: true
  });

  window.describe = describe;
  window.beforeEach = beforeEach;
  window.it = it;
  window.should = should;
})(window);
