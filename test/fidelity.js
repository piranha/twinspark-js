// -*- js-indent-level: 4 -*-

describe("Tests to ensure that idiomorph merges properly", function(){

    beforeEach(function() {
        clearWorkArea();
    });

    function testFidelity(start, end, done) {
        let initial = make(start);
        let final = make(end);
        Idiomorph.morph(initial, final);

        function compare() {
            if (initial.outerHTML !== end) {
                console.log("HTML after morph: " + initial.outerHTML);
                console.log("Expected:         " + end);
            }
            initial.outerHTML.should.equal(end);
        }

        if (done) {
            setTimeout(() => {
                compare();
                done();
            }, 2);
            return;
        } else {
            compare();
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
