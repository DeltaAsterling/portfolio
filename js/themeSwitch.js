// Theme toggle and footer year

document.addEventListener('DOMContentLoaded', () => {
    initYear();
    initThemeToggle();
});

function initYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    const body = document.body;

    if (!themeBtn) return;

    function updateIcons() {
        const isDark = body.classList.contains('dark-mode');
        if (moonIcon) moonIcon.style.display = isDark ? 'none' : 'block';
        if (sunIcon) sunIcon.style.display = isDark ? 'block' : 'none';
    }

    function applyTheme() {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (saved === 'dark' || (!saved && prefersDark)) {
            body.classList.replace('light-mode', 'dark-mode') || body.classList.add('dark-mode');
        } else {
            body.classList.replace('dark-mode', 'light-mode') || body.classList.add('light-mode');
        }
        updateIcons();
    }

    applyTheme();

    themeBtn.addEventListener('click', () => {
        const isDark = body.classList.contains('dark-mode');
        if (isDark) {
            body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('theme', 'dark');
        }
        updateIcons();
    });
}
