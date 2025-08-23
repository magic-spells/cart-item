# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Build**: `npm run build` - Builds all distribution formats (ESM, CJS, UMD, minified) with CSS/SCSS processing
- **Development**: `npm run dev` or `npm run serve` - Starts development server with hot reload on port 3000
- **Lint**: `npm run lint` - Runs ESLint on source files and config files
- **Format**: `npm run format` - Formats code with Prettier
- **Pre-publish**: `npm run prepublishOnly` - Automatically runs build before publishing

## Project Architecture

This is a **Web Component library** that creates custom HTML elements for e-commerce cart functionality:

### Core Architecture
- **Web Components**: Uses native Custom Elements API (`customElements.define`)
- **Three main components**: `<cart-item>`, `<cart-item-content>`, `<cart-item-processing>`
- **Event-driven**: Components emit bubbling custom events (`cart-item:remove`, `cart-item:quantity-change`)
- **State management**: Visual states (`ready`, `processing`, `destroying`) with CSS-driven animations

### Build System (Rollup)
- **Multiple output formats**: ESM, CommonJS, UMD, and minified UMD
- **CSS processing**: SCSS compilation with both regular and minified versions
- **Development server**: Serves from `dist/` and `demo/` directories
- **Source maps**: Generated for all builds during development

### File Structure
- `src/cart-item.js` - Main Web Component implementation with private fields and event handling
- `src/cart-item.scss` - SCSS styles with CSS custom properties for theming
- `dist/` - All built assets (JS bundles, CSS, SCSS copy)
- `demo/` - Demo files that get updated during development builds
- `rollup.config.mjs` - Multi-format build configuration with CSS extraction

### Key Implementation Details
- **Private fields**: Uses `#` syntax for encapsulation (`#currentState`, `#isDestroying`, `#handlers`, `#itemData`)
- **Static template system**: `CartItem.setTemplate(fn)` for client-side rendering from Shopify cart JSON
- **Processing template system**: `CartItem.setProcessingTemplate(fn)` for custom processing overlays (defaults to modern 3-dot bouncing loader)
- **Dual rendering modes**: Supports both pre-rendered HTML and template-based JavaScript rendering
- **Simplified attributes**: Uses `key` and `state` instead of `data-key` and `data-state`
- **Appearing animation**: New state for smooth entry animations (reverse of destroying)
- **Lifecycle management**: Proper event listener attachment/cleanup in `connectedCallback`/`disconnectedCallback`
- **Animation system**: CSS transitions with JavaScript height calculations for smooth destroy/appear animations
- **Event delegation**: Uses `e.target.closest()` for finding interactive elements
- **CSS theming**: Dual SCSS variables + CSS custom properties system for maximum flexibility

### Package Distribution
- **Multi-format**: Supports ES modules, CommonJS, and UMD for broad compatibility
- **CSS exports**: Provides both compiled CSS and source SCSS for different integration needs
- **Package.json exports**: Modern export maps for optimal module resolution
- **Browser compatibility**: Targets last 2 versions, excludes IE11