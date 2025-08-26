(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CartItem = {}));
})(this, (function (exports) { 'use strict';

  class QuantityModifier extends HTMLElement {
    // Static flag to track if styles have been injected
    static #stylesInjected = false;

    constructor() {
      super();
      this.handleDecrement = this.handleDecrement.bind(this);
      this.handleIncrement = this.handleIncrement.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);

      // Inject styles once when first component is created
      QuantityModifier.#injectStyles();
    }

    /**
     * Inject global styles for hiding number input spin buttons
     * Only runs once regardless of how many components exist
     */
    static #injectStyles() {
      if (QuantityModifier.#stylesInjected) return;

      // this will hide the arrow buttons in the number input field
      const style = document.createElement('style');
      style.textContent = `
      /* Hide number input spin buttons for quantity-modifier */
      quantity-modifier input::-webkit-outer-spin-button,
      quantity-modifier input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      
      quantity-modifier input[type="number"] {
        -moz-appearance: textfield;
      }
    `;

      document.head.appendChild(style);
      QuantityModifier.#stylesInjected = true;
    }

    // Define which attributes trigger attributeChangedCallback when modified
    static get observedAttributes() {
      return ['min', 'max', 'value'];
    }

    // Called when element is added to the DOM
    connectedCallback() {
      this.render();
      this.attachEventListeners();
    }

    // Called when element is removed from the DOM
    disconnectedCallback() {
      this.removeEventListeners();
    }

    // Called when observed attributes change
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.updateInput();
      }
    }

    // Get minimum value allowed, defaults to 1
    get min() {
      return parseInt(this.getAttribute('min')) || 1;
    }

    // Get maximum value allowed, defaults to 99
    get max() {
      return parseInt(this.getAttribute('max')) || 99;
    }

    // Get current value, defaults to 1
    get value() {
      return parseInt(this.getAttribute('value')) || 1;
    }

    // Set current value by updating the attribute
    set value(val) {
      this.setAttribute('value', val);
    }

    // Render the quantity modifier HTML structure
    render() {
      const min = this.min;
      const max = this.max;
      const value = this.value;

      // check to see if these fields already exist
      const existingDecrement = this.querySelector('[data-action-decrement]');
      const existingIncrement = this.querySelector('[data-action-increment]');
      const existingInput = this.querySelector('[data-quantity-modifier-field]');

      // if they already exist, just set the values
      if (existingDecrement && existingIncrement && existingInput) {
        existingInput.value = value;
        existingInput.min = min;
        existingInput.max = max;
        existingInput.type = 'number';
      } else {
        // if they don't exist, inject the template
        this.innerHTML = `
        <button data-action-decrement type="button">
          <svg class="svg-decrement" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <title>decrement</title>
            <path fill="currentColor" d="M368 224H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h352c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z"></path>
          </svg>
        </button>
        <input 
          type="number" 
          inputmode="numeric" 
          pattern="[0-9]*" 
          data-quantity-modifier-field 
          value="${value}" min="${min}" max="${max}">
        <button data-action-increment type="button">
          <svg class="svg-increment" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <title>increment</title>
            <path fill="currentColor" d="M368 224H224V80c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v144H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h144v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V288h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z"></path>
          </svg>
        </button>
      `;
      }
    }

    // Attach click and input event listeners to buttons and input field
    attachEventListeners() {
      const decrementBtn = this.querySelector('[data-action-decrement]');
      const incrementBtn = this.querySelector('[data-action-increment]');
      const input = this.querySelector('[data-quantity-modifier-field]');

      if (decrementBtn) decrementBtn.addEventListener('click', this.handleDecrement);
      if (incrementBtn) incrementBtn.addEventListener('click', this.handleIncrement);
      if (input) input.addEventListener('input', this.handleInputChange);
    }

    // Remove event listeners to prevent memory leaks
    removeEventListeners() {
      const decrementBtn = this.querySelector('[data-action-decrement]');
      const incrementBtn = this.querySelector('[data-action-increment]');
      const input = this.querySelector('[data-quantity-modifier-field]');

      if (decrementBtn) decrementBtn.removeEventListener('click', this.handleDecrement);
      if (incrementBtn) incrementBtn.removeEventListener('click', this.handleIncrement);
      if (input) input.removeEventListener('input', this.handleInputChange);
    }

    // Handle decrement button click, respects minimum value
    handleDecrement() {
      const currentValue = this.value;
      const newValue = Math.max(currentValue - 1, this.min);
      this.updateValue(newValue);
    }

    // Handle increment button click, respects maximum value
    handleIncrement() {
      const currentValue = this.value;
      const newValue = Math.min(currentValue + 1, this.max);
      this.updateValue(newValue);
    }

    // Handle direct input changes, clamps value between min and max
    handleInputChange(event) {
      const inputValue = parseInt(event.target.value);
      if (!isNaN(inputValue)) {
        const clampedValue = Math.max(this.min, Math.min(inputValue, this.max));
        this.updateValue(clampedValue);
      }
    }

    // Update the component value and dispatch change event if value changed
    updateValue(newValue) {
      if (newValue !== this.value) {
        this.value = newValue;
        this.updateInput();
        this.dispatchChangeEvent(newValue);
      }
    }

    // Sync the input field with current component state
    updateInput() {
      const input = this.querySelector('[data-quantity-modifier-field]');
      if (input) {
        input.value = this.value;
        input.min = this.min;
        input.max = this.max;
      }
    }

    // Dispatch custom event when value changes for external listeners
    dispatchChangeEvent(value) {
      this.dispatchEvent(
        new CustomEvent('quantity-modifier:change', {
          detail: { value },
          bubbles: true,
        })
      );
    }
  }

  customElements.define('quantity-modifier', QuantityModifier);

  /**
   * CartItem class that handles the functionality of a cart item component
   */
  class CartItem extends HTMLElement {
  	// Static template functions shared across all instances
  	static #templates = new Map();
  	static #processingTemplate = null;

  	// Private fields
  	#currentState = 'ready';
  	#isDestroying = false;
  	#isAppearing = false;
  	#handlers = {};
  	#itemData = null;
  	#cartData = null;
  	#lastRenderedHTML = '';

  	/**
  	 * Set the template function for rendering cart items
  	 * @param {string} name - Template name ('default' for default template)
  	 * @param {Function} templateFn - Function that takes (itemData, cartData) and returns HTML string
  	 */
  	static setTemplate(name, templateFn) {
  		if (typeof name !== 'string') {
  			throw new Error('Template name must be a string');
  		}
  		if (typeof templateFn !== 'function') {
  			throw new Error('Template must be a function');
  		}
  		CartItem.#templates.set(name, templateFn);
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
  	 * Create a cart item with appearing animation
  	 * @param {Object} itemData - Shopify cart item data
  	 * @param {Object} cartData - Full Shopify cart object
  	 * @returns {CartItem} Cart item instance that will animate in
  	 */
  	static createAnimated(itemData, cartData) {
  		return new CartItem(itemData, cartData, { animate: true });
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

  	constructor(itemData = null, cartData = null, options = {}) {
  		super();

  		// Store item and cart data if provided
  		this.#itemData = itemData;
  		this.#cartData = cartData;

  		// Set initial state - start with 'appearing' only if explicitly requested
  		const shouldAnimate = options.animate || this.hasAttribute('animate-in');
  		this.#currentState =
  			itemData && shouldAnimate ? 'appearing' : this.getAttribute('state') || 'ready';

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
  			this.#render();
  		}

  		// Find child elements
  		this.content = this.querySelector('cart-item-content');
  		this.processing = this.querySelector('cart-item-processing');

  		// Update line price elements in case of pre-rendered content
  		this.#updateLinePriceElements();

  		// Attach event listeners
  		this.#attachListeners();

  		// If we started with 'appearing' state, handle the entry animation
  		if (this.#currentState === 'appearing') {
  			// Set the state attribute
  			this.setAttribute('state', 'appearing');
  			this.#isAppearing = true;

  			// Get the natural height after rendering
  			requestAnimationFrame(() => {
  				const naturalHeight = this.scrollHeight;

  				// Set explicit height for animation
  				this.style.height = `${naturalHeight}px`;

  				// Transition to ready state after a brief delay
  				requestAnimationFrame(() => {
  					this.setState('ready');
  				});
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
  		this.addEventListener('quantity-modifier:change', this.#handlers.change);
  		this.addEventListener('transitionend', this.#handlers.transitionEnd);
  	}

  	/**
  	 * Detach event listeners
  	 */
  	#detachListeners() {
  		this.removeEventListener('click', this.#handlers.click);
  		this.removeEventListener('change', this.#handlers.change);
  		this.removeEventListener('quantity-modifier:change', this.#handlers.change);
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
  	 * Handle change events (for quantity inputs and quantity-modifier)
  	 */
  	#handleChange(e) {
  		// Check if event is from quantity-modifier component
  		if (e.type === 'quantity-modifier:change') {
  			this.#emitQuantityChangeEvent(e.detail.value);
  			return;
  		}

  		// Check if changed element is a quantity input
  		const quantityInput = e.target.closest('[data-cart-quantity]');
  		if (quantityInput) {
  			this.#emitQuantityChangeEvent(quantityInput.value);
  		}
  	}

  	/**
  	 * Handle transition end events for destroy animation and appearing animation
  	 */
  	#handleTransitionEnd(e) {
  		if (e.propertyName === 'height' && this.#isDestroying) {
  			// Remove from DOM after height animation completes
  			this.remove();
  		} else if (e.propertyName === 'height' && this.#isAppearing) {
  			// Remove explicit height after appearing animation completes
  			this.style.height = '';
  			this.#isAppearing = false;
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
  	 * Render cart item from data using the appropriate template
  	 */
  	#render() {
  		if (!this.#itemData || CartItem.#templates.size === 0) {
  			console.log('no item data or no template', this.#itemData, CartItem.#templates);
  			return;
  		}

  		// Set the key attribute from item data
  		const key = this.#itemData.key || this.#itemData.id;
  		if (key) {
  			this.setAttribute('key', key);
  		}

  		// Generate HTML from template and store for future comparisons
  		const templateHTML = this.#generateTemplateHTML();
  		this.#lastRenderedHTML = templateHTML;

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
  	 * @param {Object} cartData - Full Shopify cart object
  	 */
  	setData(itemData, cartData = null) {
  		// Update internal data
  		this.#itemData = itemData;
  		if (cartData) {
  			this.#cartData = cartData;
  		}

  		// Generate new HTML with updated data
  		const newHTML = this.#generateTemplateHTML();
  		
  		// Compare with previously rendered HTML
  		if (newHTML === this.#lastRenderedHTML) {
  			// HTML hasn't changed, just reset processing state
  			this.setState('ready');
  			return;
  		}
  		
  		// HTML is different, proceed with full update
  		this.setState('ready');
  		this.#render();
  		
  		// Re-find child elements after re-rendering
  		this.content = this.querySelector('cart-item-content');
  		this.processing = this.querySelector('cart-item-processing');
  		
  		// Update line price elements
  		this.#updateLinePriceElements();
  	}

  	/**
  	 * Generate HTML from the current template with current data
  	 * @returns {string} Generated HTML string or empty string if no template
  	 * @private
  	 */
  	#generateTemplateHTML() {
  		// If no templates are available, return empty string
  		if (!this.#itemData || CartItem.#templates.size === 0) {
  			return '';
  		}

  		// Determine which template to use
  		const templateName = this.#itemData.properties?._cart_template || 'default';
  		const templateFn = CartItem.#templates.get(templateName) || CartItem.#templates.get('default');

  		if (!templateFn) {
  			return '';
  		}

  		// Generate and return HTML from template
  		return templateFn(this.#itemData, this.#cartData);
  	}

  	/**
  	 * Update elements with data-content-line-price attribute
  	 * @private
  	 */
  	#updateLinePriceElements() {
  		if (!this.#itemData) return;

  		const linePriceElements = this.querySelectorAll('[data-content-line-price]');
  		const formattedLinePrice = this.#formatCurrency(this.#itemData.line_price || 0);

  		linePriceElements.forEach((element) => {
  			element.textContent = formattedLinePrice;
  		});
  	}

  	/**
  	 * Format currency value from cents to dollar string
  	 * @param {number} cents - Price in cents
  	 * @returns {string} Formatted currency string (e.g., "$29.99")
  	 * @private
  	 */
  	#formatCurrency(cents) {
  		if (typeof cents !== 'number') return '$0.00';
  		return `$${(cents / 100).toFixed(2)}`;
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
  	 * gracefully animate this cart item closed, then let #handleTransitionEnd remove it
  	 *
  	 * @returns {void}
  	 */
  	destroyYourself() {
  		// bail if already in the middle of a destroy cycle
  		if (this.#isDestroying) return;

  		this.#isDestroying = true;

  		// snapshot the current rendered height before applying any "destroying" styles
  		const initialHeight = this.offsetHeight;

  		// switch to 'destroying' state so css can fade / slide visuals
  		this.setState('destroying');

  		// lock the measured height on the next animation frame to ensure layout is fully flushed
  		requestAnimationFrame(() => {
  			this.style.height = `${initialHeight}px`;
  			// this.offsetHeight; // force a reflow so the browser registers the fixed height

  			// read the css custom property for timing, defaulting to 400ms
  			const elementStyle = getComputedStyle(this);
  			const destroyDuration =
  				elementStyle.getPropertyValue('--cart-item-destroying-duration')?.trim() || '400ms';

  			// animate only the height to zero; other properties stay under stylesheet control
  			this.style.transition = `height ${destroyDuration} ease`;
  			this.style.height = '0px';

  			// setTimeout(() => {
  			// 	this.style.height = '0px';
  			// }, 1);

  			setTimeout(() => {
  				// make sure item is removed
  				this.remove();
  			}, 600);
  		});
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

  exports.CartItem = CartItem;
  exports.CartItemContent = CartItemContent;
  exports.CartItemProcessing = CartItemProcessing;
  exports.QuantityModifier = QuantityModifier;

}));
//# sourceMappingURL=cart-item.js.map
