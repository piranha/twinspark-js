title: ts-action
----

# `ts-action` {.text-center}

TwinSpark includes a very simple syntax (inspired by shell) for calling
small JavaScript functions: `some-command arg1 arg2, other-command arg3
arg4`. So `some-command` takes two arguments, and then passes result to
`other-command`, forming a pipeline.

Pipeline is asynchronous and waits for promises to resolve. If a command returns
`false` (not a falsy value, but exactly `false`), pipeline stops. You can write
multiple pipelines in a single `ts-action` attribute, joining them by `;`. Those
pipelines are independent, but executed in order.

Actions specified in `ts-action` are triggered by event specified in
[`ts-trigger`](../ts-trigger/), and respect [`ts-target`](../ts-target/) if it's
specified.

If you need to pass argument with spaces, you can enclose it in quotes or double
quotes, like `target "parent p"`. Escaping works, i.e. `log '\' is a quote'`.

<table class="table">
<caption><h5>Built-in commands <small>(arguments in brackets are optional)</small></h5></caption>
<tr><th>Command</th> <th>Description</th></tr>

<tr><td><code>stop</code></td>                      <td>Calls <code>.stopPropagation()</code> on triggering event.</td></tr>
<tr><td><code>prevent</code></td>                   <td>Calls <code>.preventDefault()</code> on triggering event.</td></tr>
<tr><td><code>delay &lt;N&gt;</code></td>           <td>Delays pipeline execution by <code>N</code> ms, or seconds with syntax <code>Ns</code>.</td></tr>
<tr><td><code>target &lt;sel&gt;</code></td>        <td>Selects another element, identified by <code>sel</code>. Supports <a href="../ts-trigger/"><code>ts-trigger</code></a> modifiers.</td></tr>
<tr><td><code>remove [sel]</code></td>              <td>Removes target element. With optional argument removes element identified by <code>sel</code>.</td></tr>
<tr><td><code>class+ &lt;cls&gt;</code></td>        <td>Adds class <code>cls</code> to a target element.</td></tr>
<tr><td><code>class &lt;cls&gt;</code></td>         <td>Alias for <code>class+</code></td></tr>
<tr><td><code>class- &lt;cls&gt;</code></td>        <td>Removes class <code>cls</code> from a target element.</td></tr>
<tr><td><code>class^ &lt;cls&gt;</code></td>        <td>Toggles class <code>cls</code> on a target element.</td></tr>
<tr><td><code>classtoggle &lt;cls&gt;</code></td>   <td>Alias for <code>class^</code>.</td></tr>
<tr><td><code>wait &lt;eventname&gt;</code></td>    <td>Waits until event <code>eventname</code> happens on a target element.</td></tr>
<tr><td><code>text [value]</code></td>              <td>Returns <code>.innerText</code>. If <code>value</code> is passed also sets it.</td></tr>
<tr><td><code>html [value]</code></td>              <td>Returns <code>.innerHTML</code>. If <code>value</code> is pased also sets it.</td></tr>
<tr><td><code>attr &lt;name&gt; [value]</code></td> <td>Returns value of attribute <code>name</code>. If <code>value</code> is passed also sets it.</td></tr>
<tr><td><code>log [...]</code></td>                 <td>Logs all passed argument and pipeline input if passed.</td></tr>
<tr><td><code>not &lt;cmd&gt; [...]</code></td>     <td>Inverts result of calling <code>cmd ...</code>.</td></tr>

</table>

## Registering new commands

New commands can be registered with `twinspark.func({"command-name": () => {}})`
API. Command is a simple JavaScript function and is passed all arguments from a
pipeline, plus options object as a last argument (usually named just
`o`). Options object contains the following:

- `el` - element that is current targeted (origin element for that action by default)
- `e` - event that triggered execution of the action
- `command` - current command name
- `src` - source of current command with arguments (including command name)
- `line` - source of current pipeline
- `input` - return value of previous command

There is a helper `twinspark.arity` to simplify registering commands with optional arguments. It dispatches on `arguments.length` and uses `func.length` to determine which one to call. For example, `remove` is implemented that way:

```
remove: arity(
  function(o) { o.el.remove(); },
  function(sel, o) { findTarget(o.el, sel).remove(); }
)
```

{{ template "examples" . }}
