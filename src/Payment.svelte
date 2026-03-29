<script>
  export let onBack = () => {dispatch("goToHome");};
  
  let formData = {
    email: '',
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    country: '',
    postalCode: ''
  };
  
  let errors = {};
  let isSubmitting = false;
  let showSuccess = false;
  
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const validateCardNumber = (card) => {
    return card.replace(/\s/g, '').length === 16;
  };
  
  const validateExpiry = (expiry) => {
    return /^\d{2}\/\d{2}$/.test(expiry);
  };
  
  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };
  
  const handleCardInput = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '').slice(0, 16);
    formData.cardNumber = value.replace(/(\d{4})/g, '$1 ').trim();
  };
  
  const handleExpiryInput = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    formData.expiryDate = value;
  };
  
  const handleCVVInput = (e) => {
    formData.cvv = e.target.value.replace(/\D/g, '').slice(0, 4);
  };
  
  const validate = () => {
    errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.cardholderName) {
      errors.cardholderName = 'Cardholder name is required';
    }
    
    if (!formData.cardNumber || !validateCardNumber(formData.cardNumber)) {
      errors.cardNumber = 'Invalid card number';
    }
    
    if (!formData.expiryDate || !validateExpiry(formData.expiryDate)) {
      errors.expiryDate = 'Use MM/YY format';
    }
    
    if (!formData.cvv || !validateCVV(formData.cvv)) {
      errors.cvv = 'Invalid CVV';
    }
    
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    
    if (!formData.postalCode) {
      errors.postalCode = 'Postal code is required';
    }
    
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    isSubmitting = true;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    isSubmitting = false;
    showSuccess = true;
    
    setTimeout(() => {
      showSuccess = false;
      formData = {
        email: '',
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        country: '',
        postalCode: ''
      };
    }, 3000);
  };
</script>

<div class="payment-container">
  <button class="back-button" on:click={onBack} aria-label="Go back">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  </button>

  {#if showSuccess}
    <div class="success-message">
      <div class="success-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <h2>Payment Successful!</h2>
        <p>Your 7-day free trial has been activated.</p>
      </div>
    </div>
  {/if}

  <div class="payment-header">
    <div class="header-icon">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="7" width="20" height="13" rx="2" ry="2"></rect>
        <path d="M16 4V2"></path>
        <path d="M8 4V2"></path>
      </svg>
    </div>
    <h1>Complete Your Payment</h1>
    <p class="subtitle">Start your FREE 7-day trial</p>
  </div>

  <div class="pricing-summary">
    <div class="summary-item">
      <span class="summary-label">Trial Period</span>
      <span class="summary-value">7 Days Free</span>
    </div>
    <div class="summary-divider"></div>
    <div class="summary-item">
      <span class="summary-label">After Trial</span>
      <span class="summary-value">14,99 €/week</span>
    </div>
  </div>

  <form on:submit={handleSubmit}>
    <div class="form-section">
      <label for="email">Email Address</label>
      <input
        id="email"
        type="email"
        placeholder="you@example.com"
        bind:value={formData.email}
        class:error={errors.email}
      />
      {#if errors.email}
        <span class="error-message">{errors.email}</span>
      {/if}
    </div>

    <div class="form-section">
      <label for="cardholder">Cardholder Name</label>
      <input
        id="cardholder"
        type="text"
        placeholder="John Doe"
        bind:value={formData.cardholderName}
        class:error={errors.cardholderName}
      />
      {#if errors.cardholderName}
        <span class="error-message">{errors.cardholderName}</span>
      {/if}
    </div>

    <div class="form-section">
      <label for="card">Card Number</label>
      <input
        id="card"
        type="text"
        placeholder="1234 5678 9012 3456"
        on:input={handleCardInput}
        value={formData.cardNumber}
        maxlength="19"
        class:error={errors.cardNumber}
      />
      {#if errors.cardNumber}
        <span class="error-message">{errors.cardNumber}</span>
      {/if}
    </div>

    <div class="form-row">
      <div class="form-section flex-1">
        <label for="expiry">Expiry Date</label>
        <input
          id="expiry"
          type="text"
          placeholder="MM/YY"
          on:input={handleExpiryInput}
          value={formData.expiryDate}
          maxlength="5"
          class:error={errors.expiryDate}
        />
        {#if errors.expiryDate}
          <span class="error-message">{errors.expiryDate}</span>
        {/if}
      </div>

      <div class="form-section flex-1">
        <label for="cvv">CVV</label>
        <input
          id="cvv"
          type="text"
          placeholder="123"
          on:input={handleCVVInput}
          value={formData.cvv}
          maxlength="4"
          class:error={errors.cvv}
        />
        {#if errors.cvv}
          <span class="error-message">{errors.cvv}</span>
        {/if}
      </div>
    </div>

    <div class="form-row">
      <div class="form-section flex-1">
        <label for="country">Country</label>
        <select
          id="country"
          bind:value={formData.country}
          class:error={errors.country}
        >
          <option value="">Select country</option>
          <option value="AT">Austria</option>
          <option value="BE">Belgium</option>
          <option value="DE">Germany</option>
          <option value="DK">Denmark</option>
          <option value="ES">Spain</option>
          <option value="FR">France</option>
          <option value="IT">Italy</option>
          <option value="NL">Netherlands</option>
          <option value="PL">Poland</option>
          <option value="PT">Portugal</option>
          <option value="SE">Sweden</option>
          <option value="CH">Switzerland</option>
          <option value="GB">United Kingdom</option>
        </select>
        {#if errors.country}
          <span class="error-message">{errors.country}</span>
        {/if}
      </div>

      <div class="form-section flex-1">
        <label for="postal">Postal Code</label>
        <input
          id="postal"
          type="text"
          placeholder="12345"
          bind:value={formData.postalCode}
          class:error={errors.postalCode}
        />
        {#if errors.postalCode}
          <span class="error-message">{errors.postalCode}</span>
        {/if}
      </div>
    </div>

    <button type="submit" class="submit-button" disabled={isSubmitting}>
      {#if isSubmitting}
        <span class="spinner"></span>
        Processing...
      {:else}
        Start Free Trial
      {/if}
    </button>
  </form>

  <div class="disclaimer">
    <p>
      Your payment method will be charged <strong>14,99 €/week</strong> after your 7-day free trial ends. You can cancel anytime before your trial ends to avoid charges.
    </p>
    <p class="terms">
      By continuing you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy</a> policies
    </p>
  </div>
</div>

<style>

  .payment-container {
    min-height: 100vh;
    background: white;
    color: #7d7e7e;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
        width: 100%;
  }

  .back-button {
    position: absolute;
    top: 24px;
    left: 24px;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;
  }

  .back-button:hover {
    color: #38a53d;
  }

  .success-message {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .success-content {
    background: linear-gradient(135deg, #1a1f3a 0%, #0a0e27 100%);
    border: 1px solid #38a53d;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
    animation: slideUp 0.4s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .success-content svg {
    stroke: #38a53d;
    margin-bottom: 16px;
  }

  .success-content h2 {
    font-size: 24px;
    margin: 16px 0 8px;
  }

  .success-content p {
    color: #9ca3af;
  }

  .payment-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .header-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .header-icon svg {
    stroke: #38a53d;
  }

  .payment-header h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 8px;
  }

  .subtitle {
    color: #9ca3af;
    font-size: 16px;
    margin: 0;
  }

  .pricing-summary {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid #38a53d;
    border-radius: 8px;
    padding: 16px 24px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 32px;
    width: 75%;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .summary-label {
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .summary-value {
    font-size: 18px;
    font-weight: 600;
    color: #38a53d;
  }

  .summary-divider {
    width: 1px;
    height: 40px;
    background: rgba(59, 130, 246, 0.3);
  }

  form {
    width: 75%;
  }

  .form-section {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
  }

  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
  }

  .flex-1 {
    flex: 1;
  }

  label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #7d7e7e;
  }

  input,
  select {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #38a53d;
    border-radius: 8px;
    padding: 12px 16px;
    color: #7d7e7e;
    font-size: 16px;
    transition: all 0.2s;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #38a53d;
    background: rgba(59, 130, 246, 0.1);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  input::placeholder {
    color: #6b7280;
  }

  input.error,
  select.error {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }

  .error-message {
    font-size: 12px;
    color: #ef4444;
    margin-top: 4px;
  }

  .submit-button {
    width: 100%;
    background: linear-gradient(135deg, #38a53d 0%, #2563eb 100%);
    border: none;
    border-radius: 8px;
    padding: 14px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
  }

  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .disclaimer {
    margin-top: 32px;
    max-width: 400px;
    text-align: center;
  }

  .disclaimer p {
    font-size: 12px;
    color: #9ca3af;
    margin: 12px 0;
    line-height: 1.6;
  }

  .disclaimer strong {
    color: #38a53d;
  }

  .terms a {
    color: #38a53d;
    text-decoration: none;
    transition: color 0.2s;
  }

  .terms a:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    .payment-container {
      padding: 16px;
    }

    .back-button {
      top: 16px;
      left: 16px;
    }

    .payment-header h1 {
      font-size: 24px;
    }

    .form-row {
      flex-direction: column;
      gap: 0;
    }

    .pricing-summary {
      flex-direction: column;
      gap: 12px;
    }

    .summary-divider {
      width: 40px;
      height: 1px;
    }
  }
</style>