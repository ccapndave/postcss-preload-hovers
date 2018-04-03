# PostCSS Preload Hovers [![Build Status][ci-img]][ci]

[PostCSS] plugin

In our application we have found that it is necessary to preload images in CSS elements with the `:hover` pseudo-class, as the loading delay is very obvious the
first time a user rolls over one of these elements.

Unlike most PostCSS plugins, this outputs HTML and should be used accordingly.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/ccapndave/postcss-preload-hovers.svg
[ci]:      https://travis-ci.org/ccapndave/postcss-preload-hovers

### Input example
```css
.my-button:hover {
    background-image: url(rollover.svg);
}
```

### Output example
```html
<link rel="preload" href="rollover.svg" as="image">
```

## Usage

```js
const { plugin, stringifier } = require('postcss-preload-hovers');
postcss([ plugin(opts) ]).process(input, { stringifier });
```

See [PostCSS] docs for examples for your environment.
