# Etch (etch-less-coffee)

**This is the less-coffee fork of etch, for [Less Coffee](https://less.coffee)**

Etch is a simple, responsive theme for [Hugo](https://gohugo.io) with a focus on writing. A live demo is available at https://themes.gohugo.io/theme/etch/.

<img width="1017" alt="Screenshot 2023-07-06 at 11 58 53 am" src="https://github.com/Arizard/etch/assets/4595972/45c0e8f5-c90a-444b-ac84-69a1f436bb3d">

<img width="808" alt="Screenshot 2023-07-06 at 12 01 58 pm" src="https://github.com/Arizard/etch/assets/4595972/738a175c-4267-43a5-94c8-c23a4b628102">

## JavaScript Dependencies (React)

This theme uses React components built with Hugo's `js.Build` (esbuild). Since esbuild resolves dependencies from the **project root** rather than the theme directory, you need to copy the theme's dependencies to your Hugo project:

```bash
hugo mod npm pack
npm install
```

This copies dependencies from the theme's `package.hugo.json` into your project's `package.json`, then installs them.

