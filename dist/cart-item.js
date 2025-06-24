(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CartItem = {}));
})(this, (function (exports) { 'use strict';

  /**
   * CartItem class that handles the functionality of a cart item component
   */
  class CartItem extends HTMLElement {
    // Private fields
    #currentState = 'ready';
    #isDestroying = false;
    #handlers = {};

    /**
     * Define which attributes should be observed for changes
     */
    static get observedAttributes() {
      return ['data-state', 'data-key'];
    }

    /**
     * Called when observed attributes change
     */
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue === newValue) return;

      if (name === 'data-state') {
        this.#currentState = newValue || 'ready';
      }
    }

    constructor() {
      super();

      // Set initial state
      this.#currentState = this.getAttribute('data-state') || 'ready';

      // Bind event handlers
      this.#handlers = {
        click: this.#handleClick.bind(this),
        change: this.#handleChange.bind(this),
        transitionEnd: this.#handleTransitionEnd.bind(this),
      };
    }

    connectedCallback() {
      // Find child elements
      this.content = this.querySelector('cart-item-content');
      this.processing = this.querySelector('cart-item-processing');

      // Attach event listeners
      this.#attachListeners();
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
      return this.getAttribute('data-key');
    }

    /**
     * Handle click events (for Remove buttons, etc.)
     */
    #handleClick(e) {
      // Check if clicked element is a remove button
      const removeButton = e.target.closest('[data-action="remove"]');
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
     * Set the state of the cart item
     * @param {string} state - 'ready', 'processing', or 'destroying'
     */
    setState(state) {
      if (['ready', 'processing', 'destroying'].includes(state)) {
        this.setAttribute('data-state', state);
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

  // Define custom elements
  customElements.define('cart-item', CartItem);
  customElements.define('cart-item-content', CartItemContent);
  customElements.define('cart-item-processing', CartItemProcessing);

  exports.CartItem = CartItem;
  exports.CartItemContent = CartItemContent;
  exports.CartItemProcessing = CartItemProcessing;

}));
//# sourceMappingURL=cart-item.js.map
