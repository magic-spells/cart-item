# Cart Item Web Component

A professional, highly-customizable Web Component for creating smooth cart item interactions in e-commerce applications. Features elegant processing states, dramatic destruction animations, and seamless integration with any cart management system.

[**Live Demo**](https://magic-spells.github.io/cart-item/demo/)

## Features

- ✨ **Smooth state transitions** - Processing and destroying animations
- 🎬 **Cinematic destruction** - Height collapse with blur, scale, and desaturation effects
- 🎯 **Modern 3-dot loader** - Sleek bouncing animation replaces outdated spinners
- 🎛️ **16+ CSS custom properties** - Complete visual customization
- 📡 **Event-driven architecture** - Clean separation between UI and logic
- 🔧 **Zero dependencies** - Pure Web Components
- ⚡ **Lightweight and performant** - Optimized animations and memory management
- 📱 **Framework agnostic** - Pure Web Components work with any framework
- 🛒 **Shopify-ready** - Designed for real-world e-commerce applications
- 🎨 **Template system** - Client-side rendering from Shopify cart JSON

## Installation

```bash
npm install @magic-spells/cart-item
```

```javascript
// Import the component
import '@magic-spells/cart-item';
import '@magic-spells/cart-item/css/min'; // Include styles
```

Or include directly in your HTML:

```html
<script src="https://unpkg.com/@magic-spells/cart-item"></script>
<link rel="stylesheet" href="https://unpkg.com/@magic-spells/cart-item/dist/cart-item.min.css">
```

## Usage

### Server-Side Rendered (Pre-rendered HTML)

```html
<cart-item key="shopify-line-item-123">
  <cart-item-content>
    <div class="product-image">
      <img src="product.jpg" alt="Product">
    </div>
    <div class="product-details">
      <h4>Awesome T-Shirt</h4>
      <div class="price">$29.99</div>
      <div class="quantity">
        <label>Qty:</label>
        <input type="number" data-cart-quantity value="1" min="1">
      </div>
    </div>
    <div class="actions">
      <button data-action-remove>Remove</button>
      <div class="total">$29.99</div>
    </div>
  </cart-item-content>
  
  <cart-item-processing>
    <div class="cart-item-loader"></div>
  </cart-item-processing>
</cart-item>
```

### Client-Side Rendered (Template-based)

```javascript
// Set up template once
CartItem.setTemplate((item) => {
  return `
    <div class="product-image">
      <img src="${item.featured_image}" alt="${item.product_title}">
    </div>
    <div class="product-details">
      <h4>${item.product_title}</h4>
      <div class="price">$${(item.line_price / 100).toFixed(2)}</div>
      <div class="quantity">
        <label>Qty:</label>
        <input type="number" data-cart-quantity value="${item.quantity}" min="1">
      </div>
    </div>
    <div class="actions">
      <button data-action-remove>Remove</button>
      <div class="total">$${(item.line_price * item.quantity / 100).toFixed(2)}</div>
    </div>
  `;
});

// Optionally customize the processing overlay (defaults to modern 3-dot loader)
CartItem.setProcessingTemplate(() => {
  return `
    <div class="custom-loader"></div>
    <span>Processing...</span>
  `;
});

// Create new cart item from Shopify cart data
const cartItem = new CartItem(shopifyItemData);
document.querySelector('#cart').appendChild(cartItem);
```

## How It Works

The cart item component manages three distinct states with smooth animations:

- **Ready**: Normal state with full interactivity
- **Processing**: Slightly scaled and blurred content with processing overlay visible
- **Destroying**: Dramatic visual effects (scale, blur, desaturate) while height animates to zero

The component emits events that bubble up to parent components (like `cart-panel`) for centralized cart management, while handling all visual states and animations internally.

## Configuration

### Attributes

| Attribute | Description                                    | Required |
| --------- | ---------------------------------------------- | -------- |
| `key`     | Unique identifier for the cart item (Shopify line item key) | Yes      |
| `state`   | Current visual state: `ready`, `processing`, `destroying`, `appearing` | No       |

### Required HTML Structure

| Element                | Description                               | Required |
| ---------------------- | ----------------------------------------- | -------- |
| `<cart-item>`          | Main container with `key` attribute      | Yes      |
| `<cart-item-content>`  | Content area (product info, buttons) - auto-generated when using templates | Yes      |
| `<cart-item-processing>` | Processing overlay (modern 3-dot loader) - auto-generated when using templates | No       |

### Interactive Elements

| Selector               | Description                               | Event Triggered    |
| ---------------------- | ----------------------------------------- | ------------------ |
| `[data-action-remove]` | Remove button                           | `cart-item:remove` |
| `[data-cart-quantity]`   | Quantity input field                    | `cart-item:quantity-change` |

Example:

```html
<!-- Minimal pre-rendered cart item -->
<cart-item key="item-123">
  <cart-item-content>
    <h4>Product Name</h4>
    <button data-action-remove>Remove</button>
  </cart-item-content>
</cart-item>

<!-- Full-featured pre-rendered cart item -->
<cart-item key="shopify-40123456789" state="ready">
  <cart-item-content>
    <!-- Your product layout here -->
  </cart-item-content>
  <cart-item-processing>
    <div class="cart-item-loader"></div>
  </cart-item-processing>
</cart-item>

<!-- Template-based cart item (JavaScript) -->
<script>
  CartItem.setTemplate((item) => `
    <h4>${item.product_title}</h4>
    <input data-cart-quantity value="${item.quantity}">
    <button data-action-remove>Remove</button>
  `);
  
  // Optionally set custom processing template
  CartItem.setProcessingTemplate(() => `<div class="custom-loader">Loading...</div>`);
  
  const newItem = new CartItem(shopifyCartItemData);
  document.body.appendChild(newItem);
</script>
```

## Customization

### Styling

The component provides complete styling control through CSS custom properties. Style the content elements however you like:

```css
/* Customize animation timings */
cart-item {
  --cart-item-processing-duration: 300ms;
  --cart-item-destroying-duration: 800ms;
}

/* Customize visual effects */
cart-item {
  --cart-item-processing-scale: 0.95;
  --cart-item-destroying-scale: 0.8;
  --cart-item-destroying-blur: 15px;
  --cart-item-destroying-opacity: 0.1;
}

/* Style your content layout */
cart-item-content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

/* Custom processing overlay */
cart-item-processing {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
}
```

### CSS Variables & SCSS Variables

The component supports both CSS custom properties and SCSS variables for maximum flexibility:

| CSS Variable                       | SCSS Variable                       | Description                          | Default           |
| ---------------------------------- | ----------------------------------- | ------------------------------------ | ----------------- |
| `--cart-item-processing-duration`  | `$cart-item-processing-duration`   | Processing animation duration        | 250ms             |
| `--cart-item-destroying-duration`  | `$cart-item-destroying-duration`   | Destroying animation duration        | 600ms             |
| `--cart-item-processing-scale`     | `$cart-item-processing-scale`      | Scale during processing state        | 0.98              |
| `--cart-item-destroying-scale`     | `$cart-item-destroying-scale`      | Scale during destroying state        | 0.85              |
| `--cart-item-processing-blur`      | `$cart-item-processing-blur`       | Blur during processing state         | 1px               |
| `--cart-item-destroying-blur`      | `$cart-item-destroying-blur`       | Blur during destroying state         | 10px              |
| `--cart-item-destroying-opacity`   | `$cart-item-destroying-opacity`    | Opacity during destroying state      | 0.2               |
| `--cart-item-destroying-brightness`| `$cart-item-destroying-brightness` | Brightness during destroying state   | 0.6               |
| `--cart-item-destroying-saturate`  | `$cart-item-destroying-saturate`   | Saturation during destroying state   | 0.3               |
| `--cart-item-shadow-color`         | `$cart-item-shadow-color`          | Processing shadow color              | rgba(0,0,0,0.15)  |
| `--cart-item-shadow-color-strong`  | `$cart-item-shadow-color-strong`   | Destroying shadow color              | rgba(0,0,0,0.5)   |
| `--cart-item-processing-bg`        | `$cart-item-processing-bg`         | Processing background overlay        | rgba(100,100,100,0.2) |
| `--cart-item-destroying-bg`        | `$cart-item-destroying-bg`         | Destroying background color          | rgba(0,0,0,0.1)   |

#### CSS Override Examples:

```css
/* Dramatic destruction effect */
.dramatic-cart {
  --cart-item-destroying-duration: 1200ms;
  --cart-item-destroying-scale: 0.3;
  --cart-item-destroying-blur: 20px;
  --cart-item-destroying-opacity: 0;
  --cart-item-destroying-saturate: 0;
}

/* Subtle processing state */
.subtle-cart {
  --cart-item-processing-scale: 0.99;
  --cart-item-processing-blur: 0.5px;
  --cart-item-processing-duration: 150ms;
}
```

#### SCSS Override Examples:

```scss
// Override SCSS variables before importing
$cart-item-destroying-duration: 800ms;
$cart-item-processing-scale: 0.95;
$cart-item-destroying-blur: 15px;

// Import the component styles
@import '@magic-spells/cart-item/scss';

// Or import the CSS and override with CSS custom properties
@import '@magic-spells/cart-item/css';

.my-cart cart-item {
  --cart-item-destroying-duration: 800ms;
}
```

### JavaScript API

#### Static Methods

- `CartItem.setTemplate(templateFn)`: Set the template function for all cart items
- `CartItem.setProcessingTemplate(templateFn)`: Set the processing overlay template (optional, defaults to modern 3-dot bouncing loader)

#### Instance Methods

- `setState(state)`: Change the visual state (`'ready'`, `'processing'`, `'destroying'`, `'appearing'`)
- `destroyYourself()`: Trigger the destruction animation and remove from DOM
- `setData(itemData)`: Update the cart item with new Shopify cart data
- `cartKey`: Get the cart item's unique identifier (getter)
- `state`: Get the current state (getter)
- `itemData`: Get the current item data (getter)

#### Events

The component emits custom events that bubble up for parent components to handle:

**`cart-item:remove`**
- Triggered when a remove button (`[data-action-remove]`) is clicked
- `event.detail`: `{ cartKey, element }`
- Works with both pre-rendered and template-based items

**`cart-item:quantity-change`**
- Triggered when a quantity input (`[data-cart-quantity]`) value changes  
- `event.detail`: `{ cartKey, quantity, element }`
- Works with both pre-rendered and template-based items

#### Programmatic Control

```javascript
// Set up template (do this once, before creating items)
CartItem.setTemplate((item) => {
  return `
    <div class="product-info">
      <h4>${item.product_title}</h4>
      <input data-cart-quantity value="${item.quantity}">
      <button data-action-remove>Remove</button>
    </div>
  `;
});

// Optionally customize processing overlay (defaults to modern 3-dot loader)
CartItem.setProcessingTemplate(() => {
  return `
    <div class="custom-loader"></div>
    <span>Processing...</span>
  `;
});

// Create from Shopify cart data
const cartItem = new CartItem(shopifyItemData);
document.querySelector('#cart').appendChild(cartItem);

// Or work with existing pre-rendered items
const existingItem = document.querySelector('cart-item');

// Change states
existingItem.setState('processing');  // Show processing overlay
existingItem.setState('ready');       // Return to normal
existingItem.setState('destroying');  // Apply destruction effects

// Trigger destruction (includes animation + DOM removal)
existingItem.destroyYourself();

// Update with new data
existingItem.setData(updatedShopifyData);

// Get item information
console.log(existingItem.cartKey);    // "shopify-line-item-123"
console.log(existingItem.state);      // "ready"
console.log(existingItem.itemData);   // Original Shopify item data

// Listen for events
document.addEventListener('cart-item:remove', (e) => {
  console.log('Remove requested:', e.detail.cartKey);
  
  // Set processing state
  e.detail.element.setState('processing');
  
  // Make AJAX call, then destroy
  fetch('/cart/remove', { /* ... */ })
    .then(() => e.detail.element.destroyYourself());
});

document.addEventListener('cart-item:quantity-change', (e) => {
  console.log('Quantity changed:', e.detail.quantity);
  // Handle quantity update...
});
```

#### Performance & Architecture

The component is optimized for:

- **Smooth animations**: CSS transforms and transitions with `requestAnimationFrame`
- **Memory management**: Proper event listener cleanup and duplicate call prevention
- **Separation of concerns**: UI/animation vs business logic separation
- **Event delegation**: Efficient event handling for dynamic content
- **Hardware acceleration**: CSS transforms for smooth visual effects

## Integration Examples

### Shopify Integration

```javascript
// Example cart panel integration
class CartPanel {
  constructor() {
    // Set up template for dynamically added items
    CartItem.setTemplate((item) => {
      return `
        <div class="product-image">
          <img src="${item.featured_image}" alt="${item.product_title}">
        </div>
        <div class="product-details">
          <h4>${item.product_title}</h4>
          <p>${item.variant_title || ''}</p>
          <input type="number" data-cart-quantity value="${item.quantity}" min="1">
        </div>
        <div class="product-actions">
          <button data-action-remove>Remove</button>
          <span>$${(item.line_price / 100).toFixed(2)}</span>
        </div>
      `;
    });
    
    document.addEventListener('cart-item:remove', this.handleRemove.bind(this));
    document.addEventListener('cart-item:quantity-change', this.handleQuantityChange.bind(this));
  }
  
  async handleRemove(e) {
    const { cartKey, element } = e.detail;
    
    // Show processing state
    element.setState('processing');
    
    try {
      // Shopify AJAX API call
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cartKey, quantity: 0 })
      });
      
      // Animate out and remove
      element.destroyYourself();
      
    } catch (error) {
      // Revert to ready state on error
      element.setState('ready');
      console.error('Failed to remove item:', error);
    }
  }
  
  // Add new item from cart response
  addCartItem(shopifyItem) {
    const cartItem = new CartItem(shopifyItem);
    this.cartContainer.appendChild(cartItem);
  }
  
  async handleQuantityChange(e) {
    const { cartKey, quantity, element } = e.detail;
    
    // Optional: Show processing state for quantity changes
    // element.setState('processing');
    
    try {
      await fetch('/cart/change.js', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cartKey, quantity })
      });
      
      // Update UI with new totals
      this.updateCartTotals();
      
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  }
}

new CartPanel();
```

### Vanilla JavaScript Integration

```javascript
// Example without any framework
class SimpleCartManager {
  constructor() {
    // Set up template for new items
    CartItem.setTemplate((item) => {
      return `
        <div class="item-info">
          <h4>${item.product_title}</h4>
          <input type="number" data-cart-quantity value="${item.quantity}" min="1">
          <button data-action-remove>Remove</button>
          <span>$${(item.line_price * item.quantity / 100).toFixed(2)}</span>
        </div>
      `;
    });
    
    document.addEventListener('cart-item:remove', this.handleRemove.bind(this));
    document.addEventListener('cart-item:quantity-change', this.handleQuantityChange.bind(this));
  }
  
  handleRemove(e) {
    const { cartKey, element } = e.detail;
    console.log(`Removing item: ${cartKey}`);
    
    // Show processing state
    element.setState('processing');
    
    // Simulate API call
    setTimeout(() => {
      element.destroyYourself();
    }, 1000);
  }
  
  handleQuantityChange(e) {
    const { cartKey, quantity } = e.detail;
    console.log(`Item ${cartKey} quantity changed to ${quantity}`);
    
    // Update your cart state/UI as needed
    this.updateCartDisplay();
  }
  
  // Add new item from cart data
  addNewItem(cartItemData) {
    const cartItem = new CartItem(cartItemData);
    document.querySelector('#cart-container').appendChild(cartItem);
  }
  
  updateCartDisplay() {
    // Your cart update logic here
  }
}

// Initialize
new SimpleCartManager();
```

## Browser Support

- Chrome 54+
- Firefox 63+ 
- Safari 10.1+
- Edge 79+

All modern browsers with Web Components support.

## License

MIT
