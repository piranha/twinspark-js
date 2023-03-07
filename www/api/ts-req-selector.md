title: ts-req-selector
----

# `ts-req-selector` {.text-center}

Selects only a portion of returned HTML to update a page fragment. Deals with
only a single element, so is an equivalent of `document.querySelector` (it's
actually used for finding the element). 

This can be a bit surprising at the start, but results in a much more controlled
situation, given that [ts-swap-push][../ts-swap-push/] exists.

Modifier `children` can be used when you need to put more than one element in
page.

## Notes

- Uses regular CSS selector syntax
- Selects only single element
- `children <selector>` selects children of the first element matched by
  `<selector>`

{{ template "examples" . }}
