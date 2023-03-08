title: Use Cases
----

Presented here are use cases for TwinSpark, learn, copy, modify them.

<table class="table">
<tr><th>Use Case</th> <th>Description</th></tr>

{{ range .Site.Pages.WithTag "usecase" | abcsort }}
<tr>
  <td><a href="{{ $.Rel .Url }}">{{ .Title }}</a></td>
  <td>{{ .Other.Desc }}</td>
</tr>
{{ end }}
</table>
