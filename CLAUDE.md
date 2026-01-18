# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About This Repository

This is the "etch-less-coffee" Hugo theme, a customized fork of the Etch theme specifically for the Less Coffee website. It's a minimal, responsive Hugo theme focused on writing and blogging.

## Hugo Theme Architecture

This is a Hugo theme with the standard directory structure:

### Key Directories
- `layouts/` - HTML templates that define the structure of pages
  - `_default/baseof.html` - Base template that all pages extend
  - `partials/` - Reusable template components (head, nav, footer, post-item)
  - `index.html` - Homepage template
  - `shortcodes/` - Custom Hugo shortcodes (figure, toc)
- `assets/` - Source files that need processing
  - `css/` - SCSS files that compile to CSS (all.scss is the main import file)
  - `js/` - JavaScript files (comments.js for comment functionality)
- `static/` - Static files served directly (fonts, favicons)
- `exampleSite/` - Example configuration and content for testing

### Styling System
The theme uses SCSS with a modular approach:
- `assets/css/all.scss` imports all other SCSS modules
- Separate files for typography, colors, dark mode, images, etc.
- CSS is concatenated, processed, and minified via Hugo pipes in `layouts/partials/head.html:24-27`

### Special Features
- Dark mode support with auto-detection
- Custom comment system with backend integration (backend.less.coffee API)
- FontAwesome icons integration
- Custom favicon setup with multiple sizes
- Responsive design with specific breakpoint at 770px

## Development Commands

Since this is a Hugo theme, development typically happens within a Hugo site that uses this theme. The theme itself doesn't have build commands, but when working with a Hugo site using this theme:

- `hugo server` - Start development server with live reload
- `hugo` - Build the static site
- `hugo server --disableFastRender` - Development server without fast render (useful for debugging)

## Configuration

The theme is configured via Hugo's config.toml. Key parameters:
- `params.dark` - Dark mode setting ("auto", "on", "off")  
- `params.highlight` - Enable syntax highlighting
- `params.description` - Site description for meta tags
- Menu items defined in `[menu.main]` sections

## Comment System Integration

The theme includes a custom comment system (`assets/js/comments.js`) that connects to the Less Coffee backend API. The API URL is configured dynamically based on environment (localhost for development, backend.less.coffee for production) in `layouts/partials/head.html:40-47`.

The backend source code for the comment system is available at github.com/Arizard/gomments.

## JavaScript Dependencies (React)

This theme uses React components built with Hugo's `js.Build` (esbuild). Dependencies are defined in `package.hugo.json`.

Since esbuild resolves dependencies from the **project root** rather than the theme directory, projects using this theme must run:

```bash
hugo mod npm pack  # Copies theme dependencies to project's package.json
npm install        # Installs the dependencies
```

React components live in `assets/js/react-gomments/`.