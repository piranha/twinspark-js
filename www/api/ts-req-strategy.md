title: ts-req-strategy
----

# `ts-req-strategy` {.text-center}

When you're doing some side-effectful or time-consuming operations, it could be
beneficial to control how requests are issued to your backend.

Possible values for `ts-req-strategy` are:

- `first` - prevent triggering new requests until the active one finishes
    (useful for forms)
- `last` - abort active request when a new one is triggered
- `queue` <small>(default)</small> - send requests as they are triggered

{{ template "examples" . }}
