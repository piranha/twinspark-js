title: ts-req-history
----

# `ts-req-history` {.text-center}

If this directive is supplied on the origin element, TwinSpark will push
response URL as a new page URL.

URLs are a fundament of the Web. Changing URLs in line with activity makes your
app reloadable, browseable with backward/forward button and overall a good
citizen of the Web.

## Storing pages on navigation

Browser's API for changing history (`history.pushState`) gives you ability to
store "current" HTML, so you could restore it on `popstate` event. Of course,
Firefox limits this storage to 640Kb, so it breaks for long pages.

More than that, on real page change, browser does not do anything special. And
if you click "back" there, it shows you HTML from previous real page load. So if
you're on a product listing page with endless scroll, all that products you just
saw are gone.

Because of that TwinSpark is using IndexedDB to store current page HTML on every
`pushState` and on `beforeunload` events. This storage is limited to 20 pages
([configurable](../#config)). There is a post with details called
[History Snapshotting in TwinSpark][post].

[post]: https://solovyov.net/blog/2021/history-snapshotting-in-twinspark-js/

## Notes

- `ts-req-history="replace"` will replace current page URL rather than push a new history item.
- `ts-history` header can specify new URL if you want it distinct from the request URL.
- Redirecting request will force TwinSpark to make a full page change, with
  `document.body` becoming new origin element.

{{ template "examples" . }}
