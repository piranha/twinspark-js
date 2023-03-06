title: ts-target
----

# `ts-target` {.text-center}

Assigns a target element for the request issued by origin element. Could be some
parent element, or a sibling, or a complete separate part of the page.

## Syntax

`ts-target` accepts CSS selector (with possible modifiers) or a keywords
`target` or `inherit`:

- `ts-target="target"`
- `ts-target="inherit"`
- `ts-target="#id .class"`
- `ts-target="parent div"`

## Notes

- `inherit` means search DOM tree upwards until you see other
  `ts-target` attribute
- `target` means current element (where attribute is defined). Particularly
  useful with `inherit`: you can put `ts-target="target"` somewhere and then all
  children `ts-target="inherit"` will point at the `target` element.
- CSS selector with no modifiers means "search from document root"
- `parent` modifier searches upwards from the current element for a matching
  element
- `child` modifier searches downwards from the current element for a matching
  element
- `sibling` modifier searches downwards from the parent element for a matching
  element

{{ template "examples" . }}
