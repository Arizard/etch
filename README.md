# Etch-less-coffee

This is the less-coffee fork of etch, for [Less Coffee](https://less.coffee).

## JavaScript Dependencies (React)

This theme uses React components built with Hugo's `js.Build` (esbuild). Since esbuild resolves dependencies from the **project root** rather than the theme directory, you need to copy the theme's dependencies to your Hugo project:

```bash
hugo mod npm pack
npm install
```

This copies dependencies from the theme's `package.hugo.json` into your project's `package.json`, then installs them.

## Syntax highlighting

`hugo gen chromastyles`

```
hugo gen chromastyles --style="gruvbox" > assets/css/syntax-dark.css
```
