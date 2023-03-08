title: ts-swap-push
----

# `ts-swap-push` {.text-center}

Sometimes you need to update more than a single point in your DOM tree. Or there
is a need to send some additional markup from server.

Regular use case is adding a product to a basket, you need to update "Add to
basket" button (this can go through a regular flow), a basket counter, and maybe
a little notification?

`ts-swap-push="<selector>"` marks an element in a response to be pushed
somewhere. This element should not be a first element in a response, since first
is going to be used for regular flow. `ts-swap` is relevant here, with
`ts-swap-push` having a role of `ts-target` here.

{{ template "examples" . }}
