// Form validation + submission to back-end

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwvDQ8oZbVaDAyI7YT8vSg_nkOkzE3QU4lw6Fzm1G0eyYvYj4ti2ihE-4BsJ7OotTzX/exec";

document.addEventListener('DOMContentLoaded', () => {
  initFormSubmission();
});

function getTranslation(key) {
  const lang = localStorage.getItem('lang') || 'en';
  return (typeof translations !== 'undefined' && translations[lang] && translations[lang][key])
    ? translations[lang][key]
    : null;
}

function showFeedback(type, message) {
  const feedback = document.getElementById('form-feedback');
  if (!feedback) return;

  feedback.textContent = message;
  feedback.classList.remove('hidden', 'error', 'success');

  if (type === 'error') {
    feedback.classList.add('error');
  } else {
    feedback.classList.add('success');
  }

  setTimeout(() => {
    feedback.classList.add('hidden');
  }, 5000);
}

function validateForm() {
  const form = document.getElementById('proposal-form');
  if (!form) return false;

  const inputs = form.querySelectorAll('.form-input');
  inputs.forEach(input => input.classList.remove('error'));

  const isCompany = document.getElementById('is-company')?.checked || false;
  let isValid = true;
  let firstErrorField = null;

  function markError(field) {
    if (field) {
      field.classList.add('error');
      if (!firstErrorField) firstErrorField = field;
    }
    isValid = false;
  }

  // Name / company validation
  if (isCompany) {
    const companyName = document.getElementById('company-name');
    if (!companyName || !companyName.value.trim()) markError(companyName);
  } else {
    const name = document.getElementById('name');
    const surname = document.getElementById('surname');
    if (!name || !name.value.trim()) markError(name);
    if (!surname || !surname.value.trim()) markError(surname);
  }

  // Email validation
  const email = document.getElementById('email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.value.trim() || !emailRegex.test(email.value)) markError(email);

  // Phone validation
  const addPhone = document.getElementById('add-phone');
  if (addPhone && addPhone.checked) {
    const country = document.getElementById('phone-country');
    const state = document.getElementById('phone-state');
    const number = document.getElementById('phone-number');

    // Basic presence check for all parts
    if (!country || !country.value.trim()) markError(country);
    if (!state || !state.value.trim()) markError(state);
    if (!number || !number.value.trim()) markError(number);
  }

  // Message validation
  const message = document.getElementById('message');
  if (!message || !message.value.trim()) markError(message);

  if (!isValid && firstErrorField) firstErrorField.focus();
  return { isValid, firstErrorField };
}
// reCAPTCHA validation
function validateReCaptcha() {
  if (typeof grecaptcha === 'undefined') {
    console.warn('reCAPTCHA not loaded yet.');
    return false;
  }
  return grecaptcha.getResponse().length > 0;
}

function buildPayload(form) {
  const data = new FormData(form);

  // If phone checkbox is checked, construct the formatted number
  const addPhone = document.getElementById('add-phone');
  if (addPhone && addPhone.checked) {
    const country = document.getElementById('phone-country')?.value.trim() || '';
    const state = document.getElementById('phone-state')?.value.trim() || '';
    const number = document.getElementById('phone-number')?.value.trim() || '';

    // Format: +... (...) ...
    const formattedPhone = `+${country} (${state}) ${number}`;
    data.set('phone', formattedPhone);
  } else {
    data.delete('phone');
  }
  // Remove checkbox helper fields from the payload
  data.delete('add_phone');

  // Append the reCAPTCHA token
  const token = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
  data.set('g-recaptcha-response', token);

  return data;
}

function initFormSubmission() {
  const form = document.getElementById('proposal-form');
  if (!form) return;

  // Real-time error clearing
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('error'));
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const { isValid } = validateForm();

    if (!isValid) {
      const errMsg = getTranslation('form_error_required')
        || 'Please fill in all required fields with valid information.';
      showFeedback('error', errMsg);
      return;
    }

    if (!validateReCaptcha()) {
      const captchaErrMsg = getTranslation('form_error_captcha')
        || 'Please complete the reCAPTCHA verification.';
      showFeedback('error', captchaErrMsg);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.textContent = getTranslation('form_sending') || 'Sending...';
      submitBtn.disabled = true;
    }

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: buildPayload(form)
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      form.reset();

      // Reset toggles after successful submit
      const isCompanyCheckbox = document.getElementById('is-company');
      if (isCompanyCheckbox) {
        isCompanyCheckbox.checked = false;
        isCompanyCheckbox.dispatchEvent(new Event('change'));
      }

      const addPhoneCheckbox = document.getElementById('add-phone');
      if (addPhoneCheckbox) {
        addPhoneCheckbox.checked = false;
        addPhoneCheckbox.dispatchEvent(new Event('change'));
      }

      showFeedback('success', getTranslation('form_success') || 'Proposal sent successfully!');

      // Reset reCAPTCHA widget after success
      if (typeof grecaptcha !== 'undefined') grecaptcha.reset();


    } catch (error) {
      console.error('Form submission error:', error);
      showFeedback('error', getTranslation('form_error') || 'Error sending proposal. Please try again.');
    } finally {
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  });
}