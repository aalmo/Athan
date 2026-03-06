/**
 * Automatic Theme Switcher
 * Switches between Everyday, Ramadan, and Eid themes based on Islamic calendar
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'everyday';
        this.darkMode = localStorage.getItem('darkMode') === 'enabled';
        // themeMode: 'auto' | 'everyday' | 'ramadan' | 'eid'
        this.themeMode = localStorage.getItem('themeMode') || 'auto';
        this.init();
    }

    init() {
        this.currentTheme = this.resolveTheme();
        this.applyTheme(this.currentTheme, this.darkMode);
        this.addTransitionEffects();
        console.log(`🎨 Theme activated: ${this.currentTheme} (mode: ${this.themeMode})`);
    }

    /**
     * Resolve which theme to show based on themeMode
     */
    resolveTheme() {
        if (this.themeMode === 'auto') {
            return this.detectTheme();
        }
        return this.themeMode; // manual override
    }

    /**
     * Set theme mode: 'auto', 'everyday', 'ramadan', or 'eid'
     */
    setThemeMode(mode) {
        if (!['auto', 'everyday', 'ramadan', 'eid'].includes(mode)) return;
        this.themeMode = mode;
        localStorage.setItem('themeMode', mode);
        this.currentTheme = this.resolveTheme();
        this.applyTheme(this.currentTheme, this.darkMode);
        this.updateThemeModeUI();
    }

    /**
     * Update the theme selector UI to reflect current mode
     */
    updateThemeModeUI() {
        const selector = document.getElementById('themeModeSelector');
        if (selector) selector.value = this.themeMode;

        // Update preview badges
        document.querySelectorAll('.theme-option-card').forEach(card => {
            card.classList.remove('active');
        });
        const activeCard = document.querySelector(`.theme-option-card[data-theme="${this.themeMode}"]`);
        if (activeCard) activeCard.classList.add('active');
    }

    /**
     * Detect which theme should be active based on Islamic calendar
     */
    detectTheme() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // 0-indexed
        const day = today.getDate();

        // Check if today is Eid (using same dates from IslamicHolidayService)
        const isEidFitr = this.isDateMatch(today, this.getEidFitrDate(year));
        const isEidAdha = this.isDateMatch(today, this.getEidAdhaDate(year));

        if (isEidFitr || isEidAdha) {
            return 'eid';
        }

        // Check if we're in Ramadan
        // Ramadan 2026: approximately February 17 - March 19
        // Using approximate Gregorian dates
        if (this.isRamadan(today, year)) {
            return 'ramadan';
        }

        // Default to everyday theme
        return 'everyday';
    }

    /**
     * Get Eid al-Fitr date for given year
     */
    getEidFitrDate(year) {
        if (year === 2026) {
            return new Date(2026, 2, 21); // March 21, 2026
        } else if (year === 2027) {
            return new Date(2027, 2, 11); // March 11, 2027
        }
        return new Date(2026, 2, 21); // Default
    }

    /**
     * Get Eid al-Adha date for given year
     */
    getEidAdhaDate(year) {
        if (year === 2026) {
            return new Date(2026, 4, 29); // May 29, 2026
        } else if (year === 2027) {
            return new Date(2027, 4, 19); // May 19, 2027
        }
        return new Date(2026, 4, 29); // Default
    }

    /**
     * Check if current date is in Ramadan
     */
    isRamadan(date, year) {
        if (year === 2026) {
            // Ramadan 2026: approximately Feb 17 - Mar 19
            const ramadanStart = new Date(2026, 1, 17); // Feb 17
            const ramadanEnd = new Date(2026, 2, 19); // Mar 19
            return date >= ramadanStart && date <= ramadanEnd;
        } else if (year === 2027) {
            // Ramadan 2027: approximately Feb 6 - Mar 8
            const ramadanStart = new Date(2027, 1, 6);
            const ramadanEnd = new Date(2027, 2, 8);
            return date >= ramadanStart && date <= ramadanEnd;
        }
        return false;
    }

    /**
     * Check if two dates match (same day)
     */
    isDateMatch(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    /**
     * Apply theme to DOM
     */
    applyTheme(theme, darkMode = false) {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.setAttribute('data-dark-mode', darkMode);
        document.body.classList.add('theme-transition');
        this.currentTheme = theme;
        this.darkMode = darkMode;
        // dispatch event (no badge indicator)
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme, darkMode }
        }));
    }


    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode ? 'enabled' : 'disabled');
        this.applyTheme(this.currentTheme, this.darkMode);

        return this.darkMode;
    }

    /**
     * Manually switch theme (for testing/preview)
     */
    switchTheme(theme) {
        if (['everyday', 'ramadan', 'eid'].includes(theme)) {
            this.applyTheme(theme, this.darkMode);
        }
    }

    /**
     * Get current theme info
     */
    getThemeInfo() {
        return {
            theme: this.currentTheme,
            darkMode: this.darkMode,
            isAutomatic: true
        };
    }

    /**
     * Add smooth transition effects when theme changes
     */
    addTransitionEffects() {
        // Add transition class to all major elements
        const elements = document.querySelectorAll('.card, .btn, .prayer-card, .input-field');
        elements.forEach(el => {
            el.classList.add('theme-transition');
        });
    }

    /**
     * Preview theme (temporary, for testing)
     */
    previewTheme(theme, duration = 5000) {
        const originalTheme = this.currentTheme;
        this.switchTheme(theme);

        console.log(`👁️ Previewing ${theme} theme for ${duration/1000} seconds...`);

        setTimeout(() => {
            this.switchTheme(originalTheme);
            console.log(`↩️ Returned to ${originalTheme} theme`);
        }, duration);
    }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Expose globally for easy access
window.themeManager = themeManager;

// Listen for theme change events
window.addEventListener('themeChanged', (event) => {
    const { theme, darkMode } = event.detail;
    console.log(`✨ Theme changed to: ${theme} (Dark: ${darkMode})`);

    // Update any theme-specific UI elements
    updateUIForTheme(theme);
});

/**
 * Update UI elements based on current theme
 */
function updateUIForTheme(theme) {
    // Add theme-specific decorative elements only.
    // Do NOT touch headerTitle — the language system manages it.
    addThemeDecorations(theme);
}

/**
 * Add theme-specific decorative elements
 */
function addThemeDecorations(theme) {
    // Remove existing decorations
    document.querySelectorAll('.theme-decoration').forEach(el => el.remove());

    if (theme === 'ramadan') {
        // Add crescent moon decorations to prayer cards
        document.querySelectorAll('.prayer-card').forEach(card => {
            if (!card.classList.contains('ramadan-decorated')) {
                card.classList.add('ramadan-decorated', 'ramadan-crescent');
            }
        });
    }

    if (theme === 'eid') {
        // Add celebration confetti to prayer cards
        document.querySelectorAll('.prayer-card').forEach(card => {
            if (!card.classList.contains('eid-decorated')) {
                card.classList.add('eid-decorated', 'eid-confetti');
            }
        });
    }

    if (theme === 'everyday') {
        // Remove special decorations
        document.querySelectorAll('.prayer-card').forEach(card => {
            card.classList.remove('ramadan-decorated', 'ramadan-crescent', 'eid-decorated', 'eid-confetti');
        });
    }
}

/**
 * Check theme every hour in case date changes
 */
setInterval(() => {
    const newTheme = themeManager.detectTheme();
    if (newTheme !== themeManager.currentTheme) {
        console.log(`🔄 Date changed! Switching from ${themeManager.currentTheme} to ${newTheme}`);
        themeManager.applyTheme(newTheme, themeManager.darkMode);
    }
}, 3600000); // Check every hour

// Log theme info on load
console.log('🎨 Theme System Initialized');
console.log(`📅 Current Date: ${new Date().toDateString()}`);
console.log(`🎭 Active Theme: ${themeManager.currentTheme}`);
console.log(`🌙 Dark Mode: ${themeManager.darkMode ? 'ON' : 'OFF'}`);

// Add preview function to window for testing
window.previewTheme = (theme) => {
    themeManager.previewTheme(theme, 5000);
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
