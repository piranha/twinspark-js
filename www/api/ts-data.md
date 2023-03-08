title: ts-data
----

# `ts-data` {.text-center}

This is probably the most "magic" attribute, as it's the only one "inherited"
during a request. When request happens, TwinSpark will collect data from the
origin element. This means element's value, if it's an `input`, `select` or a
`textarea`, or form's data if it's a `form`.

But before that the whole hierarchy is checked for `ts-data` attributes which
are then merged in a `FormData`. This is useful in cases when passing all
the data through components or templates is inconvenient.

Syntax is either query string or JSON (check if the first symbol is a
`{`). Multiple elements with the same key are supported (just like normal form
data). You can override that by specifying key with null or empty data - this removes key from underlying `FormData` completely.

{{ template "examples" . }}
