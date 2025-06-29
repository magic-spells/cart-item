/**
 * CartItem class that handles the functionality of a cart item component
 */
class CartItem extends HTMLElement {
  // Static template functions shared across all instances
  static #template = null;
  static #processingTemplate = null;

  // Private fields
  #currentState = 'ready';
  #isDestroying = false;
  #handlers = {};
  #itemData = null;

  /**
   * Set the template function for rendering cart items
   * @param {Function} templateFn - Function that takes item data and returns HTML string
   */
  static setTemplate(templateFn) {
    if (typeof templateFn !== 'function') {
      throw new Error('Template must be a function');
    }
    CartItem.#template = templateFn;
  }

  /**
   * Set the processing template function for rendering processing overlay
   * @param {Function} templateFn - Function that returns HTML string for processing state
   */
  static setProcessingTemplate(templateFn) {
    if (typeof templateFn !== 'function') {
      throw new Error('Processing template must be a function');
    }
    CartItem.#processingTemplate = templateFn;
  }

  /**
   * Define which attributes should be observed for changes
   */
  static get observedAttributes() {
    return ['state', 'key'];
  }

  /**
   * Called when observed attributes change
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'state') {
      this.#currentState = newValue || 'ready';
    }
  }

  constructor(itemData = null) {
    super();

    // Store item data if provided
    this.#itemData = itemData;

    // Set initial state - start with 'appearing' if we have item data to render
    this.#currentState = itemData ? 'appearing' : this.getAttribute('state') || 'ready';

    // Bind event handlers
    this.#handlers = {
      click: this.#handleClick.bind(this),
      change: this.#handleChange.bind(this),
      transitionEnd: this.#handleTransitionEnd.bind(this),
    };
  }

  connectedCallback() {
    // If we have item data, render it first
    if (this.#itemData) {
      this.#renderFromData();
    }

    // Find child elements
    this.content = this.querySelector('cart-item-content');
    this.processing = this.querySelector('cart-item-processing');

    // Attach event listeners
    this.#attachListeners();

    // If we started with 'appearing' state, handle the entry animation
    if (this.#currentState === 'appearing') {
      // Set the state attribute
      this.setAttribute('state', 'appearing');

      // Get the natural height after rendering
      requestAnimationFrame(() => {
        const naturalHeight = this.scrollHeight;

        // Set explicit height for animation
        this.style.height = `${naturalHeight}px`;

        // Transition to ready state after a brief delay
        setTimeout(() => {
          this.setState('ready');
          // Remove explicit height after animation completes
          setTimeout(() => {
            this.style.height = '';
          }, 400); // Match appearing duration
        }, 50);
      });
    }
  }

  disconnectedCallback() {
    // Cleanup event listeners
    this.#detachListeners();
  }

  /**
   * Attach event listeners
   */
  #attachListeners() {
    this.addEventListener('click', this.#handlers.click);
    this.addEventListener('change', this.#handlers.change);
    this.addEventListener('transitionend', this.#handlers.transitionEnd);
  }

  /**
   * Detach event listeners
   */
  #detachListeners() {
    this.removeEventListener('click', this.#handlers.click);
    this.removeEventListener('change', this.#handlers.change);
    this.removeEventListener('transitionend', this.#handlers.transitionEnd);
  }

  /**
   * Get the current state
   */
  get state() {
    return this.#currentState;
  }

  /**
   * Get the cart key for this item
   */
  get cartKey() {
    return this.getAttribute('key');
  }

  /**
   * Handle click events (for Remove buttons, etc.)
   */
  #handleClick(e) {
    // Check if clicked element is a remove button
    const removeButton = e.target.closest('[data-action-remove-item]');
    if (removeButton) {
      e.preventDefault();
      this.#emitRemoveEvent();
    }
  }

  /**
   * Handle change events (for quantity inputs)
   */
  #handleChange(e) {
    // Check if changed element is a quantity input
    const quantityInput = e.target.closest('[data-cart-quantity]');
    if (quantityInput) {
      this.#emitQuantityChangeEvent(quantityInput.value);
    }
  }

  /**
   * Handle transition end events for destroy animation
   */
  #handleTransitionEnd(e) {
    if (e.propertyName === 'height' && this.#isDestroying) {
      // Remove from DOM after height animation completes
      this.remove();
    }
  }

  /**
   * Emit remove event
   */
  #emitRemoveEvent() {
    this.dispatchEvent(
      new CustomEvent('cart-item:remove', {
        bubbles: true,
        detail: {
          cartKey: this.cartKey,
          element: this,
        },
      })
    );
  }

  /**
   * Emit quantity change event
   */
  #emitQuantityChangeEvent(quantity) {
    this.dispatchEvent(
      new CustomEvent('cart-item:quantity-change', {
        bubbles: true,
        detail: {
          cartKey: this.cartKey,
          quantity: parseInt(quantity),
          element: this,
        },
      })
    );
  }

  /**
   * Render cart item from data using the static template
   */
  #renderFromData() {
    if (!this.#itemData || !CartItem.#template) {
      return;
    }

    // Set the key attribute from item data
    const key = this.#itemData.key || this.#itemData.id;
    if (key) {
      this.setAttribute('key', key);
    }

    // Generate HTML from template
    const templateHTML = CartItem.#template(this.#itemData);

    // Generate processing HTML from template or use default
    const processingHTML = CartItem.#processingTemplate
      ? CartItem.#processingTemplate()
      : '<div class="cart-item-loader"></div>';

    // Create the cart-item structure with template content inside cart-item-content
    this.innerHTML = `
      <cart-item-content>
        ${templateHTML}
      </cart-item-content>
      <cart-item-processing>
        ${processingHTML}
      </cart-item-processing>
    `;
  }

  /**
   * Update the cart item with new data
   * @param {Object} itemData - Shopify cart item data
   */
  setData(itemData) {
    this.#itemData = itemData;
    this.#renderFromData();

    // Re-find child elements after re-rendering
    this.content = this.querySelector('cart-item-content');
    this.processing = this.querySelector('cart-item-processing');
  }

  /**
   * Get the current item data
   */
  get itemData() {
    return this.#itemData;
  }

  /**
   * Set the state of the cart item
   * @param {string} state - 'ready', 'processing', 'destroying', or 'appearing'
   */
  setState(state) {
    if (['ready', 'processing', 'destroying', 'appearing'].includes(state)) {
      this.setAttribute('state', state);
    }
  }

  /**
   * Destroy this cart item with animation
   */
  destroyYourself() {
    if (this.#isDestroying) return; // Prevent multiple calls

    this.#isDestroying = true;

    // First set to destroying state for visual effects
    this.setState('destroying');

    // Get current height for animation
    const currentHeight = this.offsetHeight;

    // Force height to current value (removes auto)
    this.style.height = `${currentHeight}px`;

    // Trigger reflow to ensure height is set
    this.offsetHeight;

    // Get the destroying duration from CSS custom property
    const computedStyle = getComputedStyle(this);
    const destroyingDuration =
      computedStyle.getPropertyValue('--cart-item-destroying-duration') || '400ms';

    // Add transition and animate to 0 height
    this.style.transition = `all ${destroyingDuration} ease`;
    this.style.height = '0px';

    // The actual removal happens in #handleTransitionEnd
  }
}

/**
 * Supporting component classes for cart item
 */
class CartItemContent extends HTMLElement {
  constructor() {
    super();
  }
}

class CartItemProcessing extends HTMLElement {
  constructor() {
    super();
  }
}

// Define custom elements (check if not already defined)
if (!customElements.get('cart-item')) {
  customElements.define('cart-item', CartItem);
}
if (!customElements.get('cart-item-content')) {
  customElements.define('cart-item-content', CartItemContent);
}
if (!customElements.get('cart-item-processing')) {
  customElements.define('cart-item-processing', CartItemProcessing);
}

export { CartItem, CartItemContent, CartItemProcessing };
//# sourceMappingURL=cart-item.esm.js.map
