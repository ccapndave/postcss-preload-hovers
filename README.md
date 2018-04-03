# PostCSS Preload Hovers [![Build Status][ci-img]][ci]

[PostCSS] plugin A plugin to search for images with the :hover pseudo-class and generate code to preload them.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/ccapndave/postcss-preload-hovers.svg
[ci]:      https://travis-ci.org/ccapndave/postcss-preload-hovers

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-preload-hovers') ])
```

See [PostCSS] docs for examples for your environment.
