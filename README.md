# Etch-less-coffee

This is the less-coffee fork of etch, for [Less Coffee](https://less.coffee).

## JavaScript Dependencies (React)

This theme uses React components built with Hugo's `js.Build` (esbuild). Since esbuild resolves dependencies from the **project root** rather than the theme directory, you need to copy the theme's dependencies to your Hugo project:

```bash
hugo mod npm pack
npm install
```

This copies dependencies from the theme's `package.hugo.json` into your project's `package.json`, then installs them.

## Compressing Fonts

1. Install `woff2` package using homebrew: `brew install woff2`. Other platforms should use other package managers e.g. `apt`.
2. `cd` into the font directory and run `woff2_compress` on each `*.ttf`: `woff2_compress my_font.ttf`

## Syntax highlighting

`hugo gen chromastyles`

```
hugo gen chromastyles --style="rose-pine-dawn" > assets/css/syntax-light.css
```

Quick reference: https://gohugo.io/quick-reference/syntax-highlighting-styles/

## Icon Attribution

[Lucide](https://lucide.dev/)

## Essay Layout

For `single` you can select the `essay` layout by adding `class: essay` to the front matter. This applies the essay styling (justified text, indented paragraphs). It looks good sometimes, but other times you'll want a bit more control. Achieve this with custom classes:

* `.no-indent` removes paragraph indentation from `<p>` elements.
* `.space-above` adds `0.5lh` margin above `<p>` elements.
* `.portrait` constraints image width so that portrait images don't look wack.

usage:

```plain
This is some text which I don't want to indent.
{.no-indent .space-above}
```

