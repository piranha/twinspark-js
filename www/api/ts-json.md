title: ts-json
----

# `ts-json` {.text-center}

The `ts-json` attribute is designed to handle multi-level nested data
structures in JSON format that are not possible with `ts-data`.

When a request is triggered, TwinSpark will use the `ts-json` attribute
to directly parse the JSON string from the originating element and will
set the `Content-Type=application/json` request header.

There are a few limitations to note with `ts-json` compared to `ts-data`:
- Attributes under `ts-json` do not merge.
  Each `ts-json` represents a standalone dataset.
- Requests utilizing `ts-json` cannot be batched.


{{ template "examples" . }}
