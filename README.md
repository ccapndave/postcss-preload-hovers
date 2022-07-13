# PostCSS Preload Hovers [![Build Status][ci-img]][ci]

[PostCSS] plugin

In our application we have found that it is necessary to preload images in CSS elements with the `:hover` pseudo-class, as the loading delay is very obvious the
first time a user rolls over one of these elements.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/ccapndave/postcss-preload-hovers.svg
[ci]:      https://travis-ci.org/ccapndave/postcss-preload-hovers

### Installation

```
npm install --save-dev postcss postcss-preload-hovers
```

### Input example
```css
.my-button:hover {
    background-image: url(rollover.svg);
}
```

### Output example
With `outputType: "html"` (or omitted as this is the default):
```html
<link rel="prefetch" href="rollover.svg" as="image">
```

With `outputType: "js"`:
```js
["rollover.svg"].forEach(function(url) { var link = document.createElement("link"); link.rel = "prefetch"; link.href = url; link.as = "image"; document.head.appendChild(link); });
```

## Usage

### Transform directly
This requires writing a custom stringifier (just copy the code below).
```js
postcss([ require('postcss-preload-hovers')() ]).process(input, { stringifier: (root, builder) => root.walkComments(comment => builder(comment.text + "\n")) });
```

### Write to a file
To write to a file provide a `filename` property.
```js
postcss([ require('postcss-preload-hovers')({ outputType: "js", filename: "output.js" }) ]).process(input)
```

### Mutate a shared object
This is ugly, but useful.
```js
const resultObj = {};
postcss([ require('postcss-preload-hovers')({ resultObj }) ]).process(input).then(_ => { /* The result will be available as a string at resultObj.data */ });
```

See [PostCSS] docs for examples for your environment.
