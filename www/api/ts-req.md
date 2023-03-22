title: ts-req
----

# `ts-req` {.text-center}

`ts-req` will issue an XHR request to a server and then update a fragment of a
page with a response returned.

There is one limitation - TwinSpark expects you to return a single element for
replacement. If you return more, they will be ignored - you can make use of this
with help of [ts-swap-push]({{ $.Rel "/api/ts-swap-push/" }}).

## Terminology

- Element with a `ts-req` attribute is called **origin** element.
- Element coming from the server is called **reply**.
- Element which is going to be replaced/augmented with reply is called **target** element.

## Notes

- Method by default is `POST` when placed on a form and `GET` in other cases.
- [ts-req-method]({{ $.Rel "/api/ts-req-method/" }}) to override request method.
- [ts-target]({{ $.Rel "/api/ts-target/" }}) to change target element.
- [ts-req-selector]({{ $.Rel "/api/ts-req-selector/" }}) to select part of the response.
- [ts-swap]({{ $.Rel "/api/ts-swap/" }}) to choose replace strategy.
- [ts-req-strategy]({{ $.Rel "/api/ts-req-strategy/" }}) to deal with multiple requests from a single location.
- [ts-req-history]({{ $.Rel "/api/ts-req-history/" }}) to change URL after request.
- [ts-data]({{ $.Rel "/api/ts-data/" }}) to append data to a request.
- [ts-req-batch]({{ $.Rel "/api/ts-req-batch/" }}) to combine multiple requests into a single one.


{{ template "examples" . }}
