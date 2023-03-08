<p>Declarative enhancement for HTML: simple, composable, lean. It's main goal is to
  eliminate most of the logic from JS, while allowing to make a good interactive
  site.</p>

<p class="toast toast-primary">TwinSpark a battle-tested technology used on websites with 100k+ daily active users.</p>

<div class="columns">
  <div class="column col-4 col-xs-12">
    <div class="card back-logo" style="border: none">
      <div class="card-header h5">
        <span class="card-title">Simple</span>
      </div>
      <div class="card-body">
        It's only a handful core attributes (like <code>ts-req</code>,
        <code>ts-action</code>, <code>ts-trigger</code>) and strives to avoid
        surprises. Also there are no dependencies on your server-side
        technology, you can use <b>anything</b>.
      </div>
    </div>
  </div>

  <div class="column col-4 col-xs-12">
    <div class="card back-logo" style="border: none">
      <div class="card-header">
        <span class="card-title h5">Composable</span>
      </div>
      <div class="card-body">
        There are plenty of extension points available to suit your needs.
        You can add more directives like <code>ts-req</code>, add more actions,
        or change the outgoing requests - whatever your needs are.
      </div>
    </div>
  </div>

  <div class="column col-4 col-xs-12">
    <div class="card back-logo" style="border: none">
      <div class="card-header h5">
        <span class="card-title">Lean</span>
      </div>
      <div class="card-body">
        Source is a full 2000 lines of code and only
        <a href="https://github.com/piranha/twinspark-js/raw/master/dist/twinspark.min.js">8KB .min.gz</a>.
        We believe in less is more.
      </div>
    </div>
  </div>
</div>


## What it is

TwinSpark could be mentally split in three parts:

- [Page fragment updates](api/ts-req/) facilitated via HTML attributes
  (no JS needed). This is the core idea.
- [Morphing](api/ts-swap/#morph) - a strategy to update HTML graduallly,
  without breaking state and focus. Makes form validation and animations on HTML
  changes a breeze.
- [Actions](api/ts-action/) - incredibly simple promise-enabled language for
  (limited) client-side scripting. Bring your logic into a single place.

Some reasons why TwinSpark exists despite [HTMx](https://htmx.org/) and
[Unpoly](https://unpoly.com/) (those are similar in approach):

- It's really small (8KB `.min.gz`).
- There is no attribute inheritance — this is a big one, it keeps surprises away.
- [Batching](api/ts-req-batch/) - very useful if you want to use HTTP
  caching effectively, while maintaining some personalisation for your
  users.
- Bundling - a lot of practical stuff packed in, like triggering an event when
  [element is almost visible](api/ts-trigger/), or
  [handling clicks outside](api/ts-trigger/#outside) the element.
- Extensibility - you can easily register new directives the same way those in
  core are registered.


## Resources

- [A tale of webpage speed, or throwing away React](https://solovyov.net/blog/2020/a-tale-of-webpage-speed-or-throwing-away-react/) - article about how TwinSpark came to be
- [ecomspark](https://github.com/piranha/ecomspark) - a little example of TwinSpark in Clojure
- [ecomspark-flask](https://github.com/vsolovyov/ecomspark-flask) - same example, but in Python with Flask
