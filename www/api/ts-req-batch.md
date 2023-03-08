title: ts-req-batch
----

# `ts-req-batch` {.text-center}

Will group together outgoing responses, which occur in the 16 ms time
frame. Groups by `method + url`. Merges parameters using logic of
[`ts-data`](../ts-data/). Merges headers, joining same keys with `, `, if values
are different.

Usefulness of this method may be not immediately obvious, but it's the main
reason TwinSpark exists. It's an important optimization, which is hard enough to
get right from the first try.

Use case for it was following: product listing always renders for an anonymous
user (for an efficient caching on CDN), and then TwinSpark checks for wishlist
status of the products. See it in action on
[Kasta](https://kasta.ua/uk/market/platya/).
  
{{ template "examples" . }}
