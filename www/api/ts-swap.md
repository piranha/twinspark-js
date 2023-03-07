title: ts-swap
----

# `ts-swap` {.text-center}

Controls how HTML is going to be inserted into your page. Can be one of the
following keywords:

<table class="table">
<tr><th>Strategy</th> <th>Description</th></tr>

<tr><td><code>replace</code></td>     <td>(default) replace <a href="../ts-target/">target</a> element with an incoming element</td></tr>
<tr><td><code>inner</code></td>       <td>replaces target's children with an incoming element</td></tr>
<tr><td><code>prepend</code></td>     <td>inserts incoming element as a first child of the target</td></tr>
<tr><td><code>append</code></td>      <td>inserts incoming element as a last child of the target</td></tr>
<tr><td><code>beforebegin</code></td> <td>inserts incoming element before target</td></tr>
<tr><td><code>afterend</code></td>    <td>inserts incoming element after target</td></tr>
<tr><td><code>morph</code></td>       <td>morphs incoming element into target (see lower)</td></tr>
<tr><td><code>morph-all</code></td>   <td>same as <code>morph</code>, but does not skip <code>document.activeElement</code> when changing elements</td></tr>
<tr><td><code>skip</code></td>        <td>just skip that response, sometimes useful for operations with side-effects</td></tr>

</table>

## Settling

With the exception of `morph`, `morph-all` (see further) and `skip` strategies,
TwinSpark will try to "settle" all elements with an `id` attribute.

New elements with an `id` will be inserted with `ts-insert` class, which is then
removed. Existing elements will be inserted with an old values in `settle`
attibutes (by default this is `class`, `style`, `width` and `height`), and then
given new values shortly afterwards.

This allows for some transitions to be applied.

## Morph

Morph is a complex algorithm, and it could take tens of ms on complex layouts,
but it could be really useful at times.

Main idea is to keep elements with `id` in place, only updating their
attributes, so that all the browser state (focus, transitions, animations,
playing state of videos and audios) is kept intact. This makes doing form
validation and various animations _easy_.

Every new element with an `id` attribute is insert with a `ts-insert` class. It
is removed after a short timeout, so you can add some transitions on that. Same
with elements being removed, they are given `ts-remove` class, so you can
transition to that.

Original idea is from [idiomorph](https://github.com/bigskysoftware/idiomorph).
TwinSpark has a somewhat smaller implementation, see code for details (search
for `Morph`).

{{ template "examples" . }}
