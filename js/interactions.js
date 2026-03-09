// Navigation, company toggle, phone toggle

document.addEventListener('DOMContentLoaded', () => {
    initNavHashCleanup();
    initCompanyToggle();
    initPhoneToggle();
    initPhoneMasking();
});

// Smooth scroll navigation links without polluting the URL with hash fragments
function initNavHashCleanup() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    if (!navLinks.length) return;

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.getAttribute('href')?.substring(1);
            const targetEl = targetId ? document.getElementById(targetId) : null;

            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });

            history.replaceState(null, '', window.location.pathname + window.location.search);
        });
    });
}

// Show / hide company name field based on "Company?" checkbox
function initCompanyToggle() {
    const isCompanyCheckbox = document.getElementById('is-company');
    const individualFields = document.getElementById('individual-fields');
    const companyField = document.getElementById('company-field');

    if (!isCompanyCheckbox || !individualFields || !companyField) return;

    function toggleCompanyFields() {
        const isCompany = isCompanyCheckbox.checked;

        individualFields.classList.toggle('hidden', isCompany);
        companyField.classList.toggle('hidden', !isCompany);

        if (isCompany) {
            document.getElementById('name')?.setAttribute('value', '');
            if (document.getElementById('name')) document.getElementById('name').value = '';
            if (document.getElementById('surname')) document.getElementById('surname').value = '';
            setTimeout(() => document.getElementById('company-name')?.focus(), 100);
        } else {
            if (document.getElementById('company-name')) document.getElementById('company-name').value = '';
        }
    }

    isCompanyCheckbox.addEventListener('change', toggleCompanyFields);
    toggleCompanyFields();
}

// Show / hide phone number field based on "Include number?" checkbox
function initPhoneToggle() {
    const addPhoneCheckbox = document.getElementById('add-phone');
    const phoneField = document.getElementById('phone-field');

    if (!addPhoneCheckbox || !phoneField) return;

    function togglePhoneField() {
        const show = addPhoneCheckbox.checked;
        phoneField.classList.toggle('hidden', !show);

        if (!show) {
            const parts = ['phone-country', 'phone-state', 'phone-number'];
            parts.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = '';
                    el.classList.remove('error');
                }
            });
        } else {
            setTimeout(() => document.getElementById('phone-country')?.focus(), 100);
        }
    }

    addPhoneCheckbox.addEventListener('change', togglePhoneField);
    togglePhoneField();
}

// Enforce only numbers in phone fields
function initPhoneMasking() {
    const ids = ['phone-country', 'phone-state', 'phone-number'];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;

        el.addEventListener('input', (e) => {
            el.value = el.value.replace(/\D/g, '');
        });
    });
}

function valAt(index) {
    const el = document.activeElement;
    return el ? el.value[index] : '';
}
