title: ts-req-after
----

# `ts-req-after` {.text-center}

You can specify [actions](../ts-action/) to run after request is executed, but
right before [swap](../ts-swap/) is done. Adds response as `o.response` to
options object.

Useful for clearing up DOM, running some analytics ("product was added to
basket"), etc.

{{ template "examples" . }}
