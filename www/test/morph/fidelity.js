// -*- js-indent-level: 4 -*-

describe("Tests to ensure that idiomorph merges properly", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    function compare(node, end) {
        if (node.outerHTML !== end) {
            console.log("HTML after morph: " + node.outerHTML);
            console.log("Expected:         " + end);
        }
        node.outerHTML.should.equal(end);
    }

    function testFidelity(start, end, done) {
        let initial = make(start);
        let final = make(end);
        Idiomorph.morph(initial, final);

        if (done) {
            setTimeout(() => {
                compare(initial, end);
                done();
            }, 2);
            return;
        } else {
            compare(initial, end);
        }
    }

    window.testFidelity = testFidelity;

    // bootstrap test
    it('morphs text correctly', function()
    {
        testFidelity("<button>Foo</button>", "<button>Bar</button>")
    });

    it('morphs attributes correctly', function()
    {
        testFidelity("<button class=\"foo\">Foo</button>", "<button class=\"bar\">Foo</button>")
    });

    it('morphs multiple attributes correctly twice', function ()
    {
        const a = `<section class="child">A</section>`;
        const b = `<section class="thing" data-one="1" data-two="2" data-three="3" data-four="4" id="foo" fizz="buzz" foo="bar">B</section>`;
        const expectedA = make(a);
        const expectedB = make(b);
        const initial = make(a);

        Idiomorph.morph(initial, expectedB);
        compare(initial, b);

        Idiomorph.morph(initial, expectedA);
        compare(initial, a);
    });

    it('morphs children', function()
    {
        testFidelity("<div><p>A</p><p>B</p></div>", "<div><p>C</p><p>D</p></div>")
    });

    it('morphs white space', function()
    {
        testFidelity("<div><p>A</p><p>B</p></div>", "<div><p>C</p><p>D</p>  </div>")
    });

    it('drops content', function()
    {
        testFidelity("<div><p>A</p><p>B</p></div>", "<div></div>");
    });

    it('adds content', function(done)
    {
        testFidelity("<div></div>", '<div><p class="">A</p><p class="">B</p></div>', done)
    });

    it('should morph a node', function()
    {
        testFidelity("<p>hello world</p>", "<p>hello you</p>")
    });

    it('should stay same if same', function()
    {
        testFidelity("<p>hello world</p>", "<p>hello world</p>")
    });

    it('should replace a node', function(done)
    {
        testFidelity("<main><p>hello world</p></main>", '<main><div class="">hello you</div></main>', done)
    });

    it('should append a node', function(done)
    {
        testFidelity("<main></main>", '<main><p class="">hello you</p></main>', done)
    });
})
