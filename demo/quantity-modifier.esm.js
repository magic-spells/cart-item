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

export { QuantityModifier, QuantityModifier as default };
//# sourceMappingURL=quantity-modifier.esm.js.map
