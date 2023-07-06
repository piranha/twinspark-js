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
is going to be used for regular flow.

Discovery of an element is somewhat more involved. If you have more than one
origin (which happens when using [`ts-req-batch`](../ts-req-batch/)), then your
origin is going to be `document.body` (for the lack of better ideas).

In case of regular [`ts-req`](../ts-req/) discovery starts with an origin. It
first looks for [`ts-target`](../ts-target/) on origin element, so your selector
can look around original target. And then of course it looks at
[`ts-swap`](../ts-swap/) to determine what to do.

{{ template "examples" . }}
