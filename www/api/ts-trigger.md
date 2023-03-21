title: ts-trigger
----

# `ts-trigger` {.text-center}

Usually requests happen on natural events: `submit` on forms and `click`
elsewhere. You can use `ts-trigger="<event-type>"` to change that behavior.

Syntax is also a bit more complex than just event-type, it allows some modifiers:

- `delay:<ms>` - delay invokation by specified amount of milliseconds
- `once` - remove listener after first invokation
- `changed` - trigger only if elements' `value` has changed since last
  invokation (or `checked` for checkboxes and radios). Elements with no `name`
  are not supported.

Any regular DOM events are supported: `mouseover`, `change`, `blur`,
etc. There are some additional event types:

<table class="table">
<tr><th>Event</th> <th>Description</th></tr>

<tr><td><code>load</code></td>           <td>Trigger on document load <i>or</i> when element appears on screen (if document is already loaded).</td></tr>
<tr><td><code>scroll</code></td>         <td>Trigger when window is scrolled.</td></tr>
<tr><td><code>windowScroll</code></td>   <td>Trigger when the <a href="../ts-target/">target</a> element is scrolled.</td></tr>
<tr><td><code>outside</code></td>        <td>Trigger on click outside of the element.</td></tr>
<tr><td><code>remove</code></td>         <td>Trigger when the element is removed. <small>Uses MutationObserver.</small></td></tr>
<tr><td><code>childrenChange</code></td> <td>Trigger when children are added to or removed from the element. <small>Uses MutationObserver.</small></td></tr>
<tr><td><code>empty</code></td>          <td><code>childrenChange</code>, but element left with no children</td></tr>
<tr><td><code>notempty</code></td>       <td><code>childrenChange</code>, but element has at least 1 child.</td></tr>
<tr><td><code>visible</code></td>        <td>At least 1% of the element appeared in the viewport. <small>Uses IntersectionObserver.</small></td></tr>
<tr><td><code>invisible</code></td>      <td>Element moved off the screen. <small>Uses IntersectionObserver.</small></td></tr>
<tr><td><code>closeby</code></td>        <td>At least 1% of the element is closer than <code>window.innerHeight / 2</code> to the viewport. <small>Uses IntersectionObserver.</small></td></tr>
<tr><td><code>away</code></td>           <td>Inverse of <code>closeby</code>. <small>Uses IntersectionObserver.</small></td></tr>

</table>

{{ template "examples" . }}
