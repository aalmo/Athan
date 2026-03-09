/**
 * Automatic Theme Switcher
 * Switches between Everyday, Ramadan, and Eid themes based on Islamic calendar
 */

class ThemeManager {
    constructor() {
        this.currentTheme = 'everyday';

        // darkModePreference: 'light' | 'dark' | 'system'
        const saved = localStorage.getItem('darkModePreference');
        if (saved && ['light','dark','system'].includes(saved)) {
            this.darkModePreference = saved;
        } else {
            // Migrate old 'darkMode' key
            const legacy = localStorage.getItem('darkMode');
            if (legacy === 'enabled')       this.darkModePreference = 'dark';
            else if (legacy === 'disabled') this.darkModePreference = 'light';
            else                            this.darkModePreference = 'system';
        }

        // themeMode: 'auto' | 'everyday' | 'ramadan' | 'eid'
        this.themeMode = localStorage.getItem('themeMode') || 'auto';

        this._resolvedDark = this._resolveDark();
        this.darkMode = this._resolvedDark; // backwards-compat alias

        this.init();

        // Live-follow OS changes when preference is 'system'
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.darkModePreference === 'system') {
                    this._resolvedDark = this._resolveDark();
                    this.darkMode = this._resolvedDark;
                    this.applyTheme(this.currentTheme, this._resolvedDark);
                    this._updateDarkModeButton();
                }
            });
        }
    }

    /** Resolve the actual boolean dark value from the 3-state preference */
    _resolveDark() {
        if (this.darkModePreference === 'dark')   return true;
        if (this.darkModePreference === 'light')  return false;
        // 'system'
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    /** Cycle: system → light → dark → system */
    cycleDarkMode() {
        const order = ['system', 'light', 'dark'];
        const idx = order.indexOf(this.darkModePreference);
        this.darkModePreference = order[(idx + 1) % order.length];
        localStorage.setItem('darkModePreference', this.darkModePreference);

        this._resolvedDark = this._resolveDark();
        this.darkMode = this._resolvedDark;
        this.applyTheme(this.currentTheme, this._resolvedDark);
        this._updateDarkModeButton();
        this._updateDarkModeCards();
        return this.darkModePreference;
    }

    /** Set a specific preference directly (used from Theme tab cards) */
    setDarkModePreference(pref) {
        if (!['light','dark','system'].includes(pref)) return;
        this.darkModePreference = pref;
        localStorage.setItem('darkModePreference', pref);
        this._resolvedDark = this._resolveDark();
        this.darkMode = this._resolvedDark;
        this.applyTheme(this.currentTheme, this._resolvedDark);
        this._updateDarkModeButton();
        this._updateDarkModeCards();
    }

    /** Update the header cycle button to reflect current state */
    _updateDarkModeButton() {
        const icon = document.getElementById('darkModeIcon');
        const text = document.getElementById('darkModeText');
        const map = {
            dark:   { icon: '☀️', key: 'dmLight',  fallback: 'Light Mode' },
            light:  { icon: '🌙', key: 'dmDark',   fallback: 'Dark Mode' },
            system: { icon: '💻', key: 'dmSystem', fallback: 'System' }
        };
        // Show what clicking WILL switch TO next:
        // current=dark  → next=system → show "System"
        // current=light → next=dark   → show "Dark"
        // current=system→ next=light  → show "Light"
        const nextMap = { dark: 'system', light: 'dark', system: 'light' };
        const next = nextMap[this.darkModePreference];
        const cfg  = map[next];
        const lang = window._currentLang || {};
        if (icon) icon.textContent = cfg.icon;
        if (text) text.textContent = lang[cfg.key] || cfg.fallback;
    }

    /** Highlight the active card in the Theme tab dark mode picker */
    _updateDarkModeCards() {
        document.querySelectorAll('.dm-option-card').forEach(card => {
            const active = card.getAttribute('data-dm') === this.darkModePreference;
            card.style.borderColor = active ? 'var(--primary)' : 'var(--border)';
            card.style.background  = active ? 'var(--overlay)' : 'var(--card)';
        });
    }

    /**
     * Legacy shim so old callers of toggleDarkMode() still work
     * @deprecated use cycleDarkMode()
     */
    toggleDarkMode() {
        return this.cycleDarkMode();
    }

    init() {
        this.currentTheme = this.resolveTheme();
        this.applyTheme(this.currentTheme, this._resolvedDark);
        this.addTransitionEffects();
        // Refresh button/cards once DOM is fully painted
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this._updateDarkModeButton();
                this._updateDarkModeCards();
            });
        } else {
            setTimeout(() => {
                this._updateDarkModeButton();
                this._updateDarkModeCards();
            }, 0);
        }
        console.log(`🎨 Theme activated: ${this.currentTheme} | dark-pref: ${this.darkModePreference} | resolved-dark: ${this._resolvedDark}`);
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
     * Convert a Julian Day Number to a Gregorian Date.
     */
    _jdToDate(jd) {
        // Algorithm from Meeus "Astronomical Algorithms"
        const z = Math.floor(jd + 0.5);
        const a = z < 2299161 ? z : (() => {
            const alpha = Math.floor((z - 1867216.25) / 36524.25);
            return z + 1 + alpha - Math.floor(alpha / 4);
        })();
        const b = a + 1524;
        const c = Math.floor((b - 122.1) / 365.25);
        const d = Math.floor(365.25 * c);
        const e = Math.floor((b - d) / 30.6001);
        const day   = b - d - Math.floor(30.6001 * e);
        const month = e < 14 ? e - 1 : e - 13;
        const year  = month > 2 ? c - 4716 : c - 4715;
        return new Date(year, month - 1, day);
    }

    /**
     * Compute the Julian Day of the start of a given Hijri month/year.
     * Uses the Kuwaiti algorithm (same formula used in MS Outlook / IslamicCalendar).
     * hijriMonth: 1–12, hijriYear: Hijri year (e.g. 1447)
     */
    _hijriToJD(hijriYear, hijriMonth) {
        return Math.floor(
            (11 * hijriYear + 3) / 30
        ) + 354 * hijriYear + 30 * hijriMonth
          - Math.floor((hijriMonth - 1) / 2) + 1948440 - 385;
    }

    /**
     * Convert a Gregorian year to the approximate Hijri year that
     * contains the majority of that Gregorian year.
     */
    _gregorianToHijriYear(gregorianYear) {
        // Hijri year is ~354.37 days; offset from epoch ~621.57 years
        return Math.round((gregorianYear - 622) * (33 / 32));
    }

    /**
     * Get the Gregorian date of the 1st of Ramadan for a given Gregorian year.
     * Ramadan = Hijri month 9.
     */
    _getRamadanStart(gregorianYear) {
        const hijriYear = this._gregorianToHijriYear(gregorianYear);
        // Try both candidate Hijri years (the Hijri year can straddle two Gregorian years)
        for (let hy = hijriYear - 1; hy <= hijriYear + 1; hy++) {
            const jd = this._hijriToJD(hy, 9);   // month 9 = Ramadan
            const d  = this._jdToDate(jd);
            if (d.getFullYear() === gregorianYear) return d;
        }
        // Fallback: return best approximation
        const jd = this._hijriToJD(hijriYear, 9);
        return this._jdToDate(jd);
    }

    /**
     * Get the Gregorian date of the 1st of Shawwal (= Eid al-Fitr) for a given
     * Gregorian year. Shawwal = Hijri month 10.
     */
    getEidFitrDate(gregorianYear) {
        const hijriYear = this._gregorianToHijriYear(gregorianYear);
        for (let hy = hijriYear - 1; hy <= hijriYear + 1; hy++) {
            const jd = this._hijriToJD(hy, 10);
            const d  = this._jdToDate(jd);
            if (d.getFullYear() === gregorianYear) return d;
        }
        const jd = this._hijriToJD(hijriYear, 10);
        return this._jdToDate(jd);
    }

    /**
     * Get the Gregorian date of the 10th of Dhu al-Hijja (= Eid al-Adha) for a
     * given Gregorian year. Dhu al-Hijja = Hijri month 12, day 10.
     */
    getEidAdhaDate(gregorianYear) {
        const hijriYear = this._gregorianToHijriYear(gregorianYear);
        for (let hy = hijriYear - 1; hy <= hijriYear + 1; hy++) {
            // 1st of Dhu al-Hijja + 9 days = 10th
            const jd = this._hijriToJD(hy, 12) + 9;
            const d  = this._jdToDate(jd);
            if (d.getFullYear() === gregorianYear) return d;
        }
        const jd = this._hijriToJD(hijriYear, 12) + 9;
        return this._jdToDate(jd);
    }

    /**
     * Check if a given date falls within Ramadan for its year.
     * Ramadan lasts 29 or 30 days (1st–29th/30th of Hijri month 9).
     */
    isRamadan(date, year) {
        const start = this._getRamadanStart(year);
        // Ramadan is at most 30 days; end = day 30 (inclusive)
        const end = new Date(start);
        end.setDate(end.getDate() + 29);   // 30 days total (day 1 + 29)
        // Also check if Ramadan of the *previous* Gregorian year spills into Jan of this year
        const startPrev = this._getRamadanStart(year - 1);
        const endPrev   = new Date(startPrev);
        endPrev.setDate(endPrev.getDate() + 29);

        const t = date.getTime();
        return (t >= start.getTime() && t <= end.getTime()) ||
               (t >= startPrev.getTime() && t <= endPrev.getTime());
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
        root.setAttribute('data-dark-mode', String(darkMode));
        document.body.classList.add('theme-transition');
        this.currentTheme = theme;
        this.darkMode = darkMode;
        this._resolvedDark = darkMode;
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme, darkMode, preference: this.darkModePreference }
        }));
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

// Log dynamically computed Islamic dates for current year
const _y = new Date().getFullYear();
console.log(`📆 Ramadan ${_y} starts: ${themeManager._getRamadanStart(_y).toDateString()}`);
console.log(`🌙 Eid al-Fitr ${_y}:    ${themeManager.getEidFitrDate(_y).toDateString()}`);
console.log(`🐑 Eid al-Adha ${_y}:    ${themeManager.getEidAdhaDate(_y).toDateString()}`);

// Add preview function to window for testing
window.previewTheme = (theme) => {
    themeManager.previewTheme(theme, 5000);
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
