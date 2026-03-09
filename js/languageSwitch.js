// Language selector logic
document.addEventListener('DOMContentLoaded', () => {
    initLanguageSelector();
});

function applyLanguage(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) {
        console.warn(`Translations not found for language: ${lang}`);
        return;
    }

    const dict = translations[lang];
    document.querySelectorAll('[data-language]').forEach(el => {
        const key = el.getAttribute('data-language');
        if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.documentElement.lang = lang;
}

function initLanguageSelector() {
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');

    if (!langBtn || !langMenu) return;

    const langItems = langMenu.querySelectorAll('li');

    function toggleDropdown(event) {
        event.stopPropagation();
        langMenu.classList.toggle('hidden');
    }

    function closeDropdown() {
        langMenu.classList.add('hidden');
    }

    function setFlag(lang, sourceItem) {
        const flagImg = sourceItem?.querySelector('img');
        if (flagImg) {
            langBtn.innerHTML = `<img src="${flagImg.src}" alt="${lang.toUpperCase()}" class="flag-icon">`;
        }
    }

    function changeLanguage(lang, selectedItem) {
        setFlag(lang, selectedItem);
        applyLanguage(lang);
        localStorage.setItem('lang', lang);
        closeDropdown();
    }

    langBtn.addEventListener('click', toggleDropdown);
    document.addEventListener('click', closeDropdown);

    langItems.forEach(item => {
        item.addEventListener('click', () => {
            const lang = item.getAttribute('data-lang');
            changeLanguage(lang, item);
        });
    });

    // Restore saved language on load
    const savedLang = localStorage.getItem('lang') || 'en';
    applyLanguage(savedLang);

    const savedItem = Array.from(langItems).find(
        item => item.getAttribute('data-lang') === savedLang
    );
    if (savedItem) setFlag(savedLang, savedItem);
}
