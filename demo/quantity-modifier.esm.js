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

  static get observedAttributes() {
    return ['min', 'max', 'value'];
  }

  connectedCallback() {
    this.render();
    this.attachEventListeners();
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.updateInput();
    }
  }

  get min() {
    return parseInt(this.getAttribute('min')) || 1;
  }

  get max() {
    return parseInt(this.getAttribute('max')) || 99;
  }

  get value() {
    return parseInt(this.getAttribute('value')) || 1;
  }

  set value(val) {
    this.setAttribute('value', val);
  }

  render() {
    const min = this.min;
    const max = this.max;
    const value = this.value;

    this.innerHTML = `
      <button data-action-decrement type="button">
        <svg class="svg-decrement" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <title>decrement</title>
          <path fill="currentColor" d="M368 224H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h352c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z"></path>
        </svg>
      </button>
      <input type="number" data-quantity-modifier-field value="${value}" min="${min}" max="${max}">
      <button data-action-increment type="button">
        <svg class="svg-increment" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <title>increment</title>
          <path fill="currentColor" d="M368 224H224V80c0-8.84-7.16-16-16-16h-32c-8.84 0-16 7.16-16 16v144H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h144v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V288h144c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16z"></path>
        </svg>
      </button>
    `;
  }

  attachEventListeners() {
    const decrementBtn = this.querySelector('[data-action-decrement]');
    const incrementBtn = this.querySelector('[data-action-increment]');
    const input = this.querySelector('[data-quantity-modifier-field]');

    if (decrementBtn) decrementBtn.addEventListener('click', this.handleDecrement);
    if (incrementBtn) incrementBtn.addEventListener('click', this.handleIncrement);
    if (input) input.addEventListener('input', this.handleInputChange);
  }

  removeEventListeners() {
    const decrementBtn = this.querySelector('[data-action-decrement]');
    const incrementBtn = this.querySelector('[data-action-increment]');
    const input = this.querySelector('[data-quantity-modifier-field]');

    if (decrementBtn) decrementBtn.removeEventListener('click', this.handleDecrement);
    if (incrementBtn) incrementBtn.removeEventListener('click', this.handleIncrement);
    if (input) input.removeEventListener('input', this.handleInputChange);
  }

  handleDecrement() {
    const currentValue = this.value;
    const newValue = Math.max(currentValue - 1, this.min);
    this.updateValue(newValue);
  }

  handleIncrement() {
    const currentValue = this.value;
    const newValue = Math.min(currentValue + 1, this.max);
    this.updateValue(newValue);
  }

  handleInputChange(event) {
    const inputValue = parseInt(event.target.value);
    if (!isNaN(inputValue)) {
      const clampedValue = Math.max(this.min, Math.min(inputValue, this.max));
      this.updateValue(clampedValue);
    }
  }

  updateValue(newValue) {
    if (newValue !== this.value) {
      this.value = newValue;
      this.updateInput();
      this.dispatchChangeEvent(newValue);
    }
  }

  updateInput() {
    const input = this.querySelector('[data-quantity-modifier-field]');
    if (input) {
      input.value = this.value;
    }
  }

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
