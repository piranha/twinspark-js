<p>
  Declarative enhancement for HTML: simple, composable, lean. TwinSpark
  transfers lots of the common logic from JS into a few declarative HTML
  attributes. This leads to good interactive sites with little JS and more manageable
  code.
</p>

<p class="toast toast-primary text-center">
  TwinSpark is a battle-tested technology used for years on websites with 100k+
  daily active users.
</p>

<div class="columns">
  <div class="column col-4 col-xs-12">
    <div class="card back-logo" style="border: none">
      <div class="card-header h5">
        <span class="card-title">Simple</span>
      </div>
      <div class="card-body">
        It's only a handful core attributes (like
        <a href="api/ts-req/"><code class=nw>ts-req</code></a>,
        <a href="api/ts-action/"><code class=nw>ts-action</code></a>,
        <a href="api/ts-trigger/"><code class=nw>ts-trigger</code></a>)
        and strives to avoid surprises. Also there are no dependencies
        on your server-side technology, you can use <b>anything</b>.
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
        Source is a just 2000 lines of code and only
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
- [Morphing](api/ts-swap/#morph) - a strategy to update HTML gradually,
  without breaking state and focus. Makes form validation and animations on HTML
  changes a breeze.
- [Actions](api/ts-action/) - incredibly simple promise-enabled language for
  (limited) client-side scripting. Bring your logic into a single place.

Some reasons why TwinSpark exists despite [HTMx](https://htmx.org/) and
[Unpoly](https://unpoly.com/) (those are similar in approach):

- It's really small ([8KB `.min.gz`](https://github.com/piranha/twinspark-js/blob/master/dist/twinspark.min.js)).
- There is no attribute inheritance — keeps surprises away.
- [Batching](api/ts-req-batch/) - very useful if you want to use HTTP
  caching effectively, while maintaining some personalisation for your
  users.
- Bundled - a lot of practical stuff packed in, like actions, or non-traditional
  [event triggers](api/ts-trigger), or morphing.
- Extensibility - you can easily register new directives the same way those in
  core are registered.


## Resources

- [A tale of webpage speed, or throwing away React](https://solovyov.net/blog/2020/a-tale-of-webpage-speed-or-throwing-away-react/) - article about how TwinSpark came to be
- [ecomspark](https://github.com/piranha/ecomspark) - a little example of TwinSpark in Clojure
- [ecomspark-flask](https://github.com/vsolovyov/ecomspark-flask) - same example, but in Python with Flask
