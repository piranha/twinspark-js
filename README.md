# ![TwinSpark](https://raw.githubusercontent.com/piranha/twinspark-js/main/www/static/twinspark-logo.svg)

Declarative enhancement for HTML: simple, composable, lean. It's main goal is to
eliminate most of the logic from JS, while allowing to make a good interactive
site.

It engages this problem from a few angles:

- partial page updates facilitated via HTML attributes (no JS needed)
- actions - incredibly simple promise-enabled language for (limited) client-side scripting
- morphing - a strategy to update HTML graduallly, without breaking state and focus

**Simple**: it's only a handful core attributes (like `ts-req`, `ts-action`,
`ts-trigger`), with no surprising behavior (whatever is declared on top of your
DOM tree will not affect your code).

**Composable**: there are enough extension points to compose with whatever your
needs are. You can add more directives like `ts-req`, you can add more actions,
you can customize requests being sent out. Whatever you need.

**Lean**: source is a full 2000 lines of code and only [8KB .min.gz][min]. We believe
in less is more.

[min]: https://github.com/piranha/twinspark-js/raw/main/dist/twinspark.min.js

It's a battle-tested technology used on websites with 100k+ daily active users.

Read more in [docs](https://twinspark.js.org/).
