// ═══════════════════════════════════════════════
//  ATHAN APP — Main Application JavaScript
//  Extracted to external file so Thymeleaf does
//  NOT strip || operators from the source.
// ═══════════════════════════════════════════════

// ═══ INIT ═══
console.log('Athan app.js loaded');
if (typeof serverAudioFiles === 'undefined') console.warn('serverAudioFiles not yet defined (will be set before DOMContentLoaded)');
if (typeof prayerTimesRaw === 'undefined') console.warn('prayerTimesRaw not yet defined (will be set before DOMContentLoaded)');

// ════════════════════════════════════════
//  LANGUAGE SYSTEM
// ════════════════════════════════════════
let availableLanguages = [];
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTranslations = null;
let languageFiles = {};

async function loadAvailableLanguages() {
    const languageCodes = ['en', 'ar', 'fr', 'de', 'es', 'tr', 'ur', 'id', 'ms', 'bn'];
    for (const code of languageCodes) {
        try {
            const response = await fetch(`/lang/${code}.json`);
            if (response.ok) {
                const langData = await response.json();
                languageFiles[code] = langData;
                availableLanguages.push({
                    code: langData.languageCode,
                    name: langData.languageName,
                    nativeName: langData.languageNativeName,
                    direction: langData.direction
                });
            }
        } catch (error) { /* skip */ }
    }
    if (!languageFiles[currentLanguage] && availableLanguages.length > 0) {
        currentLanguage = availableLanguages[0].code;
        localStorage.setItem('language', currentLanguage);
    }
    await loadLanguage(currentLanguage);
    updateLanguageSelector();
}

async function loadLanguage(languageCode) {
    if (languageFiles[languageCode]) {
        currentTranslations = languageFiles[languageCode];
        currentLanguage = languageCode;
        localStorage.setItem('language', languageCode);
        applyLanguage();
        return true;
    }
    return false;
}

function toggleLanguage() {
    const currentIndex = availableLanguages.findIndex(lang => lang.code === currentLanguage);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    const nextLanguage = availableLanguages[nextIndex];
    loadLanguage(nextLanguage.code);
}

function updateLanguageSelector() {
    const currentIndex = availableLanguages.findIndex(lang => lang.code === currentLanguage);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    const nextLanguage = availableLanguages[nextIndex];
    if (nextLanguage) {
        document.getElementById('languageText').textContent = nextLanguage.nativeName;
    }
}

function applyLanguage() {
    if (!currentTranslations) return;
    const lang = currentTranslations.translations;
    const isRTL = currentTranslations.direction === 'rtl';

    document.body.classList.toggle('rtl', isRTL);
    document.documentElement.setAttribute('lang', currentTranslations.languageCode);
    updateLanguageSelector();

    document.getElementById('headerTitle').textContent = lang.headerTitle;
    document.getElementById('headerSubtitle').textContent = lang.headerSubtitle;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (lang[key]) element.textContent = lang[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (lang[key]) element.setAttribute('placeholder', lang[key]);
    });
    document.querySelectorAll('[data-prayer-key]').forEach(element => {
        const prayerKey = element.getAttribute('data-prayer-key');
        if (lang[prayerKey]) element.textContent = lang[prayerKey];
    });

    window._currentLang = lang;
    if (typeof window._refreshCountdownName === 'function') window._refreshCountdownName();
    updateDarkModeText();
    // Refresh log viewer placeholder text
    var logPlaceholder = document.getElementById('logViewerPlaceholder');
    if (logPlaceholder && !_allLogLines.length) logPlaceholder.textContent = lang.logViewerPlaceholder || logPlaceholder.textContent;
    var logBadge = document.getElementById('logBadge');
    if (logBadge && _allLogLines.length === 0) logBadge.textContent = '0 ' + (lang.logLines || 'lines');

    Object.keys(prayerFiles).forEach(p => renderFileList(p));
    Object.keys(ramadanFiles).forEach(p => renderRamadanFileList(p));
    Object.keys(holidayFiles).forEach(h => renderHolidayFileList(h));
    Object.keys(takbeerTimes).forEach(h => renderTakbeerTimesList(h));
    renderAvailableFilesList();
    if (typeof updateThemeStatusBar === 'function') updateThemeStatusBar();
}

function t(key, fallback) {
    if (currentTranslations && currentTranslations.translations[key]) {
        return currentTranslations.translations[key];
    }
    return fallback || key;
}

// ════════════════════════════════════════
//  DARK MODE
// ════════════════════════════════════════
function updateDarkModeText() {
    const isDark = window.themeManager
        ? window.themeManager.darkMode
        : document.documentElement.getAttribute('data-dark-mode') === 'true';
    const icon = document.getElementById('darkModeIcon');
    const text = document.getElementById('darkModeText');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
    if (text && currentTranslations) {
        text.textContent = isDark
            ? currentTranslations.translations.lightMode
            : currentTranslations.translations.darkMode;
    }
}

function toggleDarkMode() {
    if (window.themeManager) {
        window.themeManager.toggleDarkMode();
    } else {
        const isDark = document.documentElement.getAttribute('data-dark-mode') === 'true';
        document.documentElement.setAttribute('data-dark-mode', String(!isDark));
        localStorage.setItem('darkMode', !isDark ? 'enabled' : 'disabled');
    }
    updateDarkModeText();
}

window.addEventListener('themeChanged', () => updateDarkModeText());

// ════════════════════════════════════════
//  DATA STORES
// ════════════════════════════════════════
let availableAudioFiles = [];

const prayerFiles = {
    FAJR: [], DHUHR: [], ASR: [], MAGHRIB: [], ISHA: [],
    TASBEE7_1: [], TASBEE7_2: [], TASBEE7_3: []
};
const ramadanFiles = {
    FAJR: [], DHUHR: [], ASR: [], MAGHRIB: [], ISHA: [],
    TASBEE7_1: [], TASBEE7_2: [], TASBEE7_3: []
};
const holidayFiles = { EID_FITR: [], EID_ADHA: [] };
const takbeerTimes = { EID_FITR: [], EID_ADHA: [] };

// ════════════════════════════════════════
//  DOM CONTENT LOADED — MAIN INIT
// ════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('DOMContentLoaded — starting init');
        await loadAvailableLanguages();
        updateDarkModeText();

        // Available audio files
        availableAudioFiles = (typeof serverAudioFiles !== 'undefined' && Array.isArray(serverAudioFiles)) ? serverAudioFiles : [];
        console.log('Available audio files:', availableAudioFiles.length, availableAudioFiles);

        // Prayer files
        const configData = (typeof serverPrayerFiles !== 'undefined') ? serverPrayerFiles : {};
        Object.keys(configData).forEach(prayer => {
            if (prayerFiles.hasOwnProperty(prayer)) {
                prayerFiles[prayer] = configData[prayer] || [];
            }
        });
        Object.keys(prayerFiles).forEach(p => renderFileList(p));

        // Ramadan files
        const ramadanData = (typeof serverRamadanFiles !== 'undefined') ? serverRamadanFiles : {};
        Object.keys(ramadanData).forEach(prayer => {
            if (ramadanFiles.hasOwnProperty(prayer)) {
                ramadanFiles[prayer] = ramadanData[prayer] || [];
            }
        });
        Object.keys(ramadanFiles).forEach(p => renderRamadanFileList(p));

        // Ramadan mode
        toggleRamadanUI();

        // Holiday files + Takbeer times
        const holidayData = (typeof serverHolidayFiles !== 'undefined') ? serverHolidayFiles : {};
        Object.keys(holidayData).forEach(holiday => {
            if (holidayFiles.hasOwnProperty(holiday)) {
                holidayFiles[holiday] = holidayData[holiday] || [];
            }
        });
        const takbeerData = (typeof serverTakbeerTimes !== 'undefined') ? serverTakbeerTimes : {};
        Object.keys(takbeerData).forEach(holiday => {
            if (takbeerTimes.hasOwnProperty(holiday)) {
                takbeerTimes[holiday] = takbeerData[holiday] || [];
            }
        });
        Object.keys(holidayFiles).forEach(h => renderHolidayFileList(h));
        Object.keys(takbeerTimes).forEach(h => renderTakbeerTimesList(h));

        // Islamic holidays toggle
        if (typeof serverIslamicHolidaysEnabled !== 'undefined' && serverIslamicHolidaysEnabled) {
            document.getElementById('islamicHolidaysToggle').checked = true;
        }
        toggleIslamicHolidaysUI();

        // Theme
        setTimeout(initThemeCard, 100);

        // Available files list
        renderAvailableFilesList();
        refreshFileList();

        // Volume slider
        const vol = document.getElementById('volume');
        if (vol) vol.addEventListener('input', function() {
            const el = document.getElementById('volumeValue');
            if (el) el.textContent = this.value + '%';
        });

        console.log('DOMContentLoaded — init complete');
    } catch(err) {
        console.error('CRITICAL INIT ERROR:', err);
        alert('App init error: ' + err.message + '\nCheck browser console (F12).');
    }
});

// ════════════════════════════════════════
//  THEME SETTINGS
// ════════════════════════════════════════
function initThemeCard() {
    if (!window.themeManager) return;
    const isAuto = window.themeManager.themeMode === 'auto';
    const toggle = document.getElementById('themeAutoToggle');
    if (toggle) toggle.checked = isAuto;
    var picker = document.getElementById('themeManualPicker');
    if (picker) picker.style.display = isAuto ? 'none' : 'block';
    updateThemeStatusBar();
    if (window.themeManager.updateThemeModeUI) window.themeManager.updateThemeModeUI();
}

function onThemeAutoToggle(checked) {
    if (checked) {
        window.themeManager.setThemeMode('auto');
        document.getElementById('themeManualPicker').style.display = 'none';
    } else {
        var cur = window.themeManager.currentTheme;
        window.themeManager.setThemeMode(cur);
        document.getElementById('themeManualPicker').style.display = 'block';
    }
    updateThemeStatusBar();
}

function selectTheme(theme) {
    window.themeManager.setThemeMode(theme);
    updateThemeStatusBar();
}

function updateThemeStatusBar() {
    if (!window.themeManager) return;
    var mode = window.themeManager.themeMode;
    var theme = window.themeManager.currentTheme;
    var icons = { everyday: '🌍', ramadan: '🌙', eid: '🎊' };
    var labels = { everyday: t('themeEveryday','Everyday'), ramadan: t('themeRamadan','Ramadan'), eid: t('themeEid','Eid') };
    var iconEl  = document.getElementById('currentThemeIcon');
    var labelEl = document.getElementById('currentThemeLabel');
    var autoEl  = document.getElementById('themeAutoLabel');
    if (iconEl)  iconEl.textContent  = icons[theme] || '🌍';
    if (labelEl) labelEl.textContent = labels[theme] || theme;
    if (autoEl)  autoEl.textContent  = mode === 'auto' ? t('themeAutoLabel','Auto') : t('themeManualLabel','Manual');
}

// ════════════════════════════════════════
//  TOGGLE UI SECTIONS
// ════════════════════════════════════════
function toggleRamadanUI() {
    var el = document.getElementById('ramadanMode');
    var ramadanMode = el ? el.checked : false;
    var ramadanCard = document.getElementById('ramadanAudioCard');
    if (ramadanCard) ramadanCard.style.display = ramadanMode ? 'block' : 'none';
    var modeCard = document.getElementById('ramadanModeCard');
    if (modeCard) modeCard.style.borderColor = ramadanMode ? 'var(--primary)' : '';
}

function toggleIslamicHolidaysUI() {
    var el = document.getElementById('islamicHolidaysToggle');
    var enabled = el ? el.checked : false;
    var holidaysCard = document.getElementById('islamicHolidaysCard');
    if (holidaysCard) holidaysCard.style.display = enabled ? 'block' : 'none';
}

// ════════════════════════════════════════
//  FILE UPLOAD
// ════════════════════════════════════════
function handleFileSelect(event) {
    var file = event.target.files[0];
    if (!file) return;
    var validExtensions = ['.mp3', '.wav'];
    var ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(ext)) {
        showNotification('Invalid file type. Please upload MP3 or WAV files only.', 'error');
        event.target.value = '';
        return;
    }
    if (file.size > 50 * 1024 * 1024) {
        showNotification('File is too large. Maximum size is 50MB.', 'error');
        event.target.value = '';
        return;
    }
    uploadFile(file);
}

function uploadFile(file) {
    var formData = new FormData();
    formData.append('file', file);
    showNotification(t('uploadingFile','Uploading') + ' ' + file.name + '...', 'success');
    fetch('/api/upload-audio', { method: 'POST', body: formData })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showNotification('✅ ' + data.message, 'success');
                refreshFileList();
                document.getElementById('audioFileInput').value = '';
            } else {
                showNotification('❌ ' + data.message, 'error');
            }
        })
        .catch(error => showNotification(t('uploadError','Error uploading file') + ': ' + error.message, 'error'));
}

function refreshFileList() {
    fetch('/api/audio-files')
        .then(r => r.json())
        .then(files => {
            availableAudioFiles = files || [];
            renderAvailableFilesList();
            Object.keys(prayerFiles).forEach(p => renderFileList(p));
            Object.keys(ramadanFiles).forEach(p => renderRamadanFileList(p));
        })
        .catch(() => renderAvailableFilesList());
}

function renderAvailableFilesList() {
    var container = document.getElementById('availableFilesList');
    if (!container) return;
    if (!availableAudioFiles || availableAudioFiles.length === 0) {
        container.innerHTML = '<div class="audio-files-empty"><div style="font-size:2.5rem;margin-bottom:8px;">🎵</div><div>' + t('noAudioFiles','No audio files uploaded yet.') + '</div></div>';
        return;
    }
    container.innerHTML = availableAudioFiles.map(function(filename) {
        var isMP3 = filename.toLowerCase().endsWith('.mp3');
        var ext = isMP3 ? 'MP3' : 'WAV';
        var icon = isMP3 ? '🎵' : '🔊';
        return '<div class="audio-file-card"><div class="audio-file-icon">' + icon + '</div><div class="audio-file-info"><div class="audio-file-name" title="' + filename + '">' + filename + '</div><span class="audio-file-badge">' + ext + '</span></div><button class="audio-file-delete" onclick="deleteAudioFile(\'' + filename + '\')" title="' + t('delete','Delete') + '">🗑️</button></div>';
    }).join('');
}

function deleteAudioFile(filename) {
    if (!confirm(t('confirmDelete','Are you sure you want to delete') + ' ' + filename + '?')) return;
    fetch('/api/delete-audio/' + encodeURIComponent(filename), { method: 'DELETE' })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                showNotification(t('fileDeletedSuccess','✅ File deleted'), 'success');
                setTimeout(function() { location.reload(); }, 1000);
            } else {
                showNotification('❌ ' + data.message, 'error');
            }
        })
        .catch(error => showNotification(t('fileDeleteError','Error deleting file') + ': ' + error.message, 'error'));
}

// ════════════════════════════════════════
//  FILE SELECTOR MODAL
// ════════════════════════════════════════
function addFile(prayer) {
    if (!availableAudioFiles || availableAudioFiles.length === 0) {
        showNotification(t('noAudioFiles','No audio files available. Please upload files first.'), 'error');
        return;
    }
    openFileSelector(function(filename) {
        prayerFiles[prayer].push(filename);
        renderFileList(prayer);
    });
}

function addRamadanFile(prayer) {
    if (!availableAudioFiles || availableAudioFiles.length === 0) {
        showNotification(t('noAudioFiles','No audio files available. Please upload files first.'), 'error');
        return;
    }
    openFileSelector(function(filename) {
        ramadanFiles[prayer].push(filename);
        renderRamadanFileList(prayer);
    });
}

function addHolidayFile(holiday) {
    if (!availableAudioFiles || availableAudioFiles.length === 0) {
        showNotification(t('noAudioFiles','No audio files available. Please upload files first.'), 'error');
        return;
    }
    openFileSelector(function(filename) {
        holidayFiles[holiday].push(filename);
        renderHolidayFileList(holiday);
    });
}

function openFileSelector(callback) {
    var existing = document.getElementById('fileSelectorModal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'fileSelectorModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;';

    var filesHtml = availableAudioFiles.map(function(f) {
        return '<div onclick="window._fileSelectorPick(\'' + f + '\')" style="display:flex;align-items:center;gap:12px;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;background:var(--bg-medium);transition:all 0.15s;" onmouseover="this.style.borderColor=\'var(--primary)\';this.style.background=\'var(--overlay)\'" onmouseout="this.style.borderColor=\'var(--border)\';this.style.background=\'var(--bg-medium)\'"><span style="font-size:1.3rem;">🎵</span><span style="font-weight:600;color:var(--text-primary);font-size:0.95rem;word-break:break-all;">' + f + '</span></div>';
    }).join('');

    modal.innerHTML = '<div style="background:var(--card);border-radius:16px;padding:28px;min-width:340px;max-width:480px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,0.35);border:1px solid var(--border);"><div style="font-weight:700;font-size:1.15rem;color:var(--text-primary);margin-bottom:16px;">🎵 ' + t('selectAudioFile','Select Audio File') + '</div><div style="max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">' + filesHtml + '</div><button onclick="document.getElementById(\'fileSelectorModal\').remove()" style="width:100%;padding:10px;border:1.5px solid var(--border);border-radius:10px;background:var(--bg-medium);color:var(--text-secondary);cursor:pointer;font-size:0.95rem;">' + t('cancel','Cancel') + '</button></div>';

    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
    window._fileSelectorPick = function(filename) { modal.remove(); callback(filename); };
    document.body.appendChild(modal);
}

// ════════════════════════════════════════
//  PRAYER FILE LIST RENDERING
// ════════════════════════════════════════
function removeFile(prayer, index) { prayerFiles[prayer].splice(index, 1); renderFileList(prayer); }
function updateFile(prayer, index, filename) { prayerFiles[prayer][index] = filename; }
function moveFile(prayer, fromIndex, toIndex) {
    var files = prayerFiles[prayer];
    var moved = files.splice(fromIndex, 1)[0];
    files.splice(toIndex, 0, moved);
    renderFileList(prayer);
}

function _buildOptions(current) {
    var all = [current];
    availableAudioFiles.forEach(function(f) { if (all.indexOf(f) === -1) all.push(f); });
    return all.map(function(f) {
        return '<option value="' + f + '"' + (f === current ? ' selected' : '') + '>' + f + '</option>';
    }).join('');
}

function renderFileList(prayer) {
    var container = document.getElementById('fileList-' + prayer);
    if (!container) return;
    var files = prayerFiles[prayer] || [];
    if (files.length === 0) {
        container.innerHTML = '<div style="color:var(--text-secondary);font-style:italic;padding:10px 0;font-size:0.9rem;">' + t('noFilesAdded','No files added. Click ➕ Add to add audio files.') + '</div>';
        return;
    }
    container.innerHTML = files.map(function(file, index) {
        return '<div class="file-item" draggable="true" data-prayer="' + prayer + '" data-index="' + index + '"><div class="file-item-number">' + (index+1) + '</div><select onchange="updateFile(\'' + prayer + '\',' + index + ',this.value)">' + _buildOptions(file) + '</select><span class="drag-handle" title="' + t('dragToReorder','Drag to reorder') + '">⋮⋮</span><button class="remove-file-btn" onclick="removeFile(\'' + prayer + '\',' + index + ')" title="' + t('removeBtn','Remove') + '">✕</button></div>';
    }).join('');
    setupDragAndDrop(prayer);
}

// ════════════════════════════════════════
//  RAMADAN FILE LIST
// ════════════════════════════════════════
function removeRamadanFile(prayer, index) { ramadanFiles[prayer].splice(index, 1); renderRamadanFileList(prayer); }
function updateRamadanFile(prayer, index, filename) { ramadanFiles[prayer][index] = filename; }
function moveRamadanFile(prayer, fromIndex, toIndex) {
    var files = ramadanFiles[prayer];
    var moved = files.splice(fromIndex, 1)[0];
    files.splice(toIndex, 0, moved);
    renderRamadanFileList(prayer);
}

function renderRamadanFileList(prayer) {
    var container = document.getElementById('fileList-RAMADAN-' + prayer);
    if (!container) return;
    var files = ramadanFiles[prayer] || [];
    if (files.length === 0) {
        container.innerHTML = '<div style="color:var(--text-secondary);font-style:italic;padding:10px 0;font-size:0.9rem;">' + t('noFilesAdded','No files added. Click ➕ Add to add audio files.') + '</div>';
        return;
    }
    container.innerHTML = files.map(function(file, index) {
        return '<div class="file-item" draggable="true" data-prayer="RAMADAN-' + prayer + '" data-index="' + index + '"><div class="file-item-number">' + (index+1) + '</div><select onchange="updateRamadanFile(\'' + prayer + '\',' + index + ',this.value)">' + _buildOptions(file) + '</select><span class="drag-handle" title="' + t('dragToReorder','Drag to reorder') + '">⋮⋮</span><button class="remove-file-btn" onclick="removeRamadanFile(\'' + prayer + '\',' + index + ')" title="' + t('removeBtn','Remove') + '">✕</button></div>';
    }).join('');
    setupRamadanDragAndDrop(prayer);
}

// ════════════════════════════════════════
//  HOLIDAY FILE LIST
// ════════════════════════════════════════
function removeHolidayFile(holiday, index) { holidayFiles[holiday].splice(index, 1); renderHolidayFileList(holiday); }
function updateHolidayFile(holiday, index, filename) { holidayFiles[holiday][index] = filename; }
function moveHolidayFile(holiday, fromIndex, toIndex) {
    var files = holidayFiles[holiday];
    var moved = files.splice(fromIndex, 1)[0];
    files.splice(toIndex, 0, moved);
    renderHolidayFileList(holiday);
}

function renderHolidayFileList(holiday) {
    var container = document.getElementById('fileList-HOLIDAY-' + holiday);
    if (!container) return;
    var files = holidayFiles[holiday] || [];
    if (files.length === 0) {
        container.innerHTML = '<div style="color:var(--text-secondary);font-style:italic;padding:10px 0;font-size:0.9rem;">' + t('noFilesAdded','No files added. Click ➕ Add to add audio files.') + '</div>';
        return;
    }
    container.innerHTML = files.map(function(file, index) {
        return '<div class="file-item" draggable="true" data-prayer="HOLIDAY-' + holiday + '" data-index="' + index + '"><div class="file-item-number">' + (index+1) + '</div><select onchange="updateHolidayFile(\'' + holiday + '\',' + index + ',this.value)">' + _buildOptions(file) + '</select><span class="drag-handle" title="' + t('dragToReorder','Drag to reorder') + '">⋮⋮</span><button class="remove-file-btn" onclick="removeHolidayFile(\'' + holiday + '\',' + index + ')" title="' + t('removeBtn','Remove') + '">✕</button></div>';
    }).join('');
    setupHolidayDragAndDrop(holiday);
}

// ════════════════════════════════════════
//  DRAG AND DROP
// ════════════════════════════════════════
var draggedElement = null;

function handleDragStart(e) { draggedElement = this; this.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/html', this.innerHTML); }
function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; }
function handleDragEnd(e) { this.classList.remove('dragging'); }

function handleDrop(e) { e.stopPropagation(); if (draggedElement !== this) { moveFile(this.dataset.prayer, parseInt(draggedElement.dataset.index), parseInt(this.dataset.index)); } return false; }
function handleRamadanDrop(e) { e.stopPropagation(); if (draggedElement !== this) { var m = this.dataset.prayer.match(/RAMADAN-(.+)/); if (m) moveRamadanFile(m[1], parseInt(draggedElement.dataset.index), parseInt(this.dataset.index)); } return false; }
function handleHolidayDrop(e) { e.stopPropagation(); if (draggedElement !== this) { var m = this.dataset.prayer.match(/HOLIDAY-(.+)/); if (m) moveHolidayFile(m[1], parseInt(draggedElement.dataset.index), parseInt(this.dataset.index)); } return false; }

function setupDragAndDrop(prayer) {
    var items = document.querySelectorAll('#fileList-' + prayer + ' .file-item');
    items.forEach(function(item) { item.addEventListener('dragstart', handleDragStart); item.addEventListener('dragover', handleDragOver); item.addEventListener('drop', handleDrop); item.addEventListener('dragend', handleDragEnd); });
}
function setupRamadanDragAndDrop(prayer) {
    var items = document.querySelectorAll('#fileList-RAMADAN-' + prayer + ' .file-item');
    items.forEach(function(item) { item.addEventListener('dragstart', handleDragStart); item.addEventListener('dragover', handleDragOver); item.addEventListener('drop', handleRamadanDrop); item.addEventListener('dragend', handleDragEnd); });
}
function setupHolidayDragAndDrop(holiday) {
    var items = document.querySelectorAll('#fileList-HOLIDAY-' + holiday + ' .file-item');
    items.forEach(function(item) { item.addEventListener('dragstart', handleDragStart); item.addEventListener('dragover', handleDragOver); item.addEventListener('drop', handleHolidayDrop); item.addEventListener('dragend', handleDragEnd); });
}

// ════════════════════════════════════════
//  TEST / STOP AUDIO
// ════════════════════════════════════════
var currentlyPlaying = null;

function testAudio(prayer) {
    var files = prayerFiles[prayer];
    if (!files || files.length === 0) { showNotification(t('noFilesAdded','No audio files configured for') + ' ' + prayer, 'error'); return; }
    showPlayingState(prayer);
    fetch('/api/test-audio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: files }) })
        .then(function() { showNotification('▶️ ' + files[0], 'success'); setTimeout(function() { if (currentlyPlaying === prayer) resetPlayingState(); }, 300000); })
        .catch(function() { showNotification(t('audioError','Error playing audio'), 'error'); resetPlayingState(); });
}

function testRamadanAudio(prayer) {
    var files = ramadanFiles[prayer];
    if (!files || files.length === 0) { showNotification(t('noFilesAdded','No audio files configured for') + ' ' + prayer, 'error'); return; }
    showPlayingState('RAMADAN-' + prayer);
    fetch('/api/test-audio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: files }) })
        .then(function() { showNotification('▶️ ' + files[0], 'success'); })
        .catch(function() { showNotification(t('audioError','Error playing audio'), 'error'); resetPlayingState(); });
}

function testHolidayAudio(holiday) {
    var files = holidayFiles[holiday];
    if (!files || files.length === 0) { showNotification(t('noFilesAdded','No audio files configured for') + ' ' + holiday, 'error'); return; }
    showPlayingState('HOLIDAY-' + holiday);
    fetch('/api/test-audio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ files: files }) })
        .then(function() { showNotification('▶️ ' + files[0], 'success'); })
        .catch(function() { showNotification(t('audioError','Error playing audio'), 'error'); resetPlayingState(); });
}

function stopAudio() {
    fetch('/api/stop-audio', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        .then(function() { showNotification(t('audioStopped','Audio stopped'), 'success'); resetPlayingState(); })
        .catch(function() { showNotification(t('audioError','Error stopping audio'), 'error'); });
}

function showPlayingState(prayer) {
    resetPlayingState();
    currentlyPlaying = prayer;
    var testBtn = document.getElementById('testBtn-' + prayer);
    var stopBtn = document.getElementById('stopBtn-' + prayer);
    if (testBtn && stopBtn) { testBtn.style.display = 'none'; stopBtn.style.display = 'inline-block'; testBtn.classList.add('btn-playing'); }
}

function resetPlayingState() {
    if (currentlyPlaying) {
        var testBtn = document.getElementById('testBtn-' + currentlyPlaying);
        var stopBtn = document.getElementById('stopBtn-' + currentlyPlaying);
        if (testBtn && stopBtn) { testBtn.style.display = 'inline-block'; stopBtn.style.display = 'none'; testBtn.classList.remove('btn-playing'); }
        currentlyPlaying = null;
    }
}

// ════════════════════════════════════════
//  TAKBEER TIMES
// ════════════════════════════════════════
function addTakbeerTime(holiday) {
    var newTime = prompt(t('takbeerTime','Takbeer time') + ' (HH:MM):', '09:00');
    if (!newTime) return;
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) { showNotification('Invalid time format. Please use HH:MM format.', 'error'); return; }
    takbeerTimes[holiday].push(newTime);
    renderTakbeerTimesList(holiday);
}

function removeTakbeerTime(holiday, index) { takbeerTimes[holiday].splice(index, 1); renderTakbeerTimesList(holiday); }

function updateTakbeerTime(holiday, index, time) {
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) { showNotification('Invalid time format.', 'error'); return; }
    takbeerTimes[holiday][index] = time;
}

function renderTakbeerTimesList(holiday) {
    var container = document.getElementById('takbeerTimesList-' + holiday);
    if (!container) return;
    var times = takbeerTimes[holiday] || [];
    if (times.length === 0) {
        container.innerHTML = '<div style="color:var(--text-secondary);font-style:italic;padding:10px;">' + t('noTakbeerTimes','No Takbeer times added. Click ➕ Add Time.') + '</div>';
        return;
    }
    container.innerHTML = times.map(function(time, index) {
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;background:var(--bg-medium);padding:8px 12px;border-radius:6px;border:1px solid var(--border);"><div style="flex:0 0 30px;background:var(--primary);color:white;padding:4px;border-radius:4px;text-align:center;font-weight:600;">' + (index+1) + '</div><input type="time" value="' + time + '" onchange="updateTakbeerTime(\'' + holiday + '\',' + index + ',this.value)" style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:4px;background:var(--bg-light);color:var(--text-primary);"><button class="remove-file-btn" onclick="removeTakbeerTime(\'' + holiday + '\',' + index + ')" title="' + t('removeBtn','Remove') + '">✕</button></div>';
    }).join('');
}

// ════════════════════════════════════════
//  SAVE CONFIG
// ════════════════════════════════════════
function saveConfig() {
    var audioFilesConfig = {};
    Object.keys(prayerFiles).forEach(function(prayer) { audioFilesConfig[prayer] = prayerFiles[prayer]; });
    var ramadanAudioFiles = {};
    Object.keys(ramadanFiles).forEach(function(prayer) { ramadanAudioFiles[prayer] = ramadanFiles[prayer]; });
    var islamicHolidayAudioFiles = {};
    Object.keys(holidayFiles).forEach(function(holiday) { islamicHolidayAudioFiles[holiday] = holidayFiles[holiday]; });
    var takbeerTimesConfig = {};
    Object.keys(takbeerTimes).forEach(function(holiday) { takbeerTimesConfig[holiday] = takbeerTimes[holiday]; });

    var config = {
        city: document.getElementById('city').value,
        latitude: parseFloat(document.getElementById('latitude').value),
        longitude: parseFloat(document.getElementById('longitude').value),
        timezone: document.getElementById('timezone').value,
        calculationMethod: document.getElementById('calculationMethod').value,
        fajrOffsetMinutes: parseInt(document.getElementById('fajrOffsetMinutes').value) || 0,
        maghribOffsetMinutes: parseInt(document.getElementById('maghribOffsetMinutes').value) || 0,
        audioConfig: {
            enabled: document.getElementById('audioEnabled').checked,
            volume: parseInt(document.getElementById('volume').value),
            outputDevice: document.getElementById('outputDevice').value,
            ramadanMode: document.getElementById('ramadanMode').checked,
            islamicHolidaysEnabled: document.getElementById('islamicHolidaysToggle').checked,
            prayerAudioFiles: audioFilesConfig,
            ramadanAudioFiles: ramadanAudioFiles,
            islamicHolidayAudioFiles: islamicHolidayAudioFiles,
            takbeerTimes: takbeerTimesConfig
        }
    };

    fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) })
        .then(function(r) { return r.json(); })
        .then(function(data) { showNotification(data.message, 'success'); setTimeout(function() { location.reload(); }, 1500); })
        .catch(function() { showNotification(t('configError','Error saving configuration'), 'error'); });
}

// ════════════════════════════════════════
//  MISC HELPERS
// ════════════════════════════════════════
function setCity(city, lat, lng, timezone) {
    document.getElementById('city').value = city;
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    document.getElementById('timezone').value = timezone;
}

function updateOffsetPreview(prayer, value) {
    var previewEl = document.getElementById(prayer + 'OffsetPreview');
    if (!previewEl) return;
    var v = parseInt(value) || 0;
    if (v === 0) { previewEl.textContent = ''; return; }
    var sign = v > 0 ? '+' : '';
    var label = v > 0 ? t('offsetLater','→ later') : t('offsetEarlier','→ earlier');
    previewEl.textContent = sign + v + ' min  ' + label;
    previewEl.style.color = v > 0 ? 'var(--primary)' : '#c0392b';
}

function toggleCollapsible(headerElement) {
    var section = headerElement.parentElement;
    section.classList.toggle('open');
}

function showNotification(message, type) {
    var notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    setTimeout(function() { notification.classList.remove('show'); }, 3000);
}

// ════════════════════════════════════════
//  COUNTDOWN TO NEXT PRAYER
// ════════════════════════════════════════
var prayerDisplayNames = {
    FAJR: 'Fajr', DHUHR: 'Dhuhr', ASR: 'Asr',
    MAGHRIB: 'Maghrib', ISHA: 'Isha',
    TASBEE7_1: 'First Tasbee7', TASBEE7_2: 'Second Tasbee7', TASBEE7_3: 'Third Tasbee7'
};

// Cache for tomorrow's prayer times (24h format strings)
var tomorrowPrayerTimesRaw = null;
var tomorrowFetchPending = false;

function fetchTomorrowPrayerTimes(callback) {
    if (tomorrowFetchPending) return;
    tomorrowFetchPending = true;
    fetch('/api/prayer-times/tomorrow')
        .then(function(r) { return r.json(); })
        .then(function(times) {
            tomorrowPrayerTimesRaw = times;
            tomorrowFetchPending = false;
            if (typeof callback === 'function') callback();
        })
        .catch(function() { tomorrowFetchPending = false; });
}

// Eagerly pre-fetch tomorrow's times so the countdown never shows dashes
fetchTomorrowPrayerTimes();

function parsePrayerTime(timeStr) {
    if (!timeStr) return null;
    var m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    var d = new Date();
    d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
    return d;
}

function parsePrayerTimeOnDate(timeStr, date) {
    if (!timeStr) return null;
    var m = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    var d = new Date(date);
    d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
    return d;
}

function findNextPrayer() {
    if (typeof prayerTimesRaw === 'undefined') return null;
    var now  = new Date();
    var skip = ['SUNRISE'];
    var nearest = null;
    var nearestTime = null;

    var entries = Object.entries(prayerTimesRaw);
    for (var i = 0; i < entries.length; i++) {
        var key = entries[i][0];
        var val = entries[i][1];
        if (skip.indexOf(key) >= 0) continue;
        var t = parsePrayerTime(val);
        if (!t) continue;
        if (t > now) {
            if (!nearestTime || t < nearestTime) {
                nearestTime = t;
                var domEl = document.querySelector('[data-prayer-key="' + key + '"]');
                domEl = domEl && domEl.closest('.time-item') ? domEl.closest('.time-item').querySelector('.time') : null;
                var display = (domEl ? domEl.textContent.trim() : null) || val;
                nearest = { key: key, time: t, display: display, tomorrow: false };
            }
        }
    }
    return nearest;
}

function findNextTomorrowPrayer() {
    if (!tomorrowPrayerTimesRaw) return null;
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var skip = ['SUNRISE'];
    var nearest = null;
    var nearestTime = null;

    var entries = Object.entries(tomorrowPrayerTimesRaw);
    for (var i = 0; i < entries.length; i++) {
        var key = entries[i][0];
        var val = entries[i][1];
        if (skip.indexOf(key) >= 0) continue;
        var t = parsePrayerTimeOnDate(val, tomorrow);
        if (!t) continue;
        if (!nearestTime || t < nearestTime) {
            nearestTime = t;
            nearest = { key: key, time: t, display: val, tomorrow: true };
        }
    }
    return nearest;
}

function findPreviousPrayerTime(nextKey) {
    if (typeof prayerTimesRaw === 'undefined') return null;
    var skip = ['SUNRISE'];
    var now = new Date();
    var latest = null;
    var entries = Object.entries(prayerTimesRaw);
    for (var i = 0; i < entries.length; i++) {
        var key = entries[i][0];
        var val = entries[i][1];
        if (skip.indexOf(key) >= 0 || key === nextKey) continue;
        var t = parsePrayerTime(val);
        if (!t) continue;
        if (t <= now) {
            if (!latest || t > latest) latest = t;
        }
    }
    return latest;
}

var countdownInterval = null;

function tickCountdown() {
    var next = findNextPrayer();
    var lang = window._currentLang || {};

    if (!next) {
        // All today's prayers done — fetch tomorrow's times if not yet available
        if (!tomorrowPrayerTimesRaw) {
            fetchTomorrowPrayerTimes();
            // Show placeholder while loading
            document.getElementById('countdownPrayerName').textContent = lang.countdownAllPassed || 'All prayers completed today';
            document.getElementById('cdHours').textContent   = '--';
            document.getElementById('cdMinutes').textContent = '--';
            document.getElementById('cdSeconds').textContent = '--';
            document.getElementById('countdownAtTime').textContent = '🌙';
            document.getElementById('countdownProgress').style.width = '100%';
            return;
        }

        // Use tomorrow's first prayer
        next = findNextTomorrowPrayer();
        if (!next) {
            document.getElementById('countdownPrayerName').textContent = lang.countdownAllPassed || 'All prayers completed today';
            document.getElementById('cdHours').textContent   = '--';
            document.getElementById('cdMinutes').textContent = '--';
            document.getElementById('cdSeconds').textContent = '--';
            document.getElementById('countdownAtTime').textContent = '🌙';
            document.getElementById('countdownProgress').style.width = '100%';
            return;
        }
    }

    var now = new Date();
    var diff = next.time - now;
    if (diff <= 0) {
        // Reset tomorrow cache at midnight to force re-fetch
        if (next.tomorrow) { tomorrowPrayerTimesRaw = null; }
        return;
    }

    var totalSecs = Math.floor(diff / 1000);
    var h = Math.floor(totalSecs / 3600);
    var m = Math.floor((totalSecs % 3600) / 60);
    var s = totalSecs % 60;

    document.getElementById('cdHours').textContent   = String(h).padStart(2, '0');
    document.getElementById('cdMinutes').textContent = String(m).padStart(2, '0');
    document.getElementById('cdSeconds').textContent = String(s).padStart(2, '0');
    document.getElementById('countdownAtTime').textContent = next.display;

    var name = lang[next.key] || prayerDisplayNames[next.key] || next.key;
    // Indicate it's tomorrow's prayer
    if (next.tomorrow) {
        var tomorrowLabel = lang.tomorrow || 'Tomorrow';
        name = name + ' (' + tomorrowLabel + ')';
    }
    document.getElementById('countdownPrayerName').textContent = name;

    if (!next.tomorrow) {
        var prev = findPreviousPrayerTime(next.key);
        if (prev) {
            var total = next.time - prev;
            var elapsed = now - prev;
            var pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
            document.getElementById('countdownProgress').style.width = pct + '%';
        }
    } else {
        // Progress bar: show how far into the night we are (from last today's prayer to tomorrow's fajr)
        var lastPrev = findPreviousPrayerTime('__none__'); // get absolute latest today
        if (lastPrev) {
            var total2 = next.time - lastPrev;
            var elapsed2 = now - lastPrev;
            var pct2 = Math.min(100, Math.max(0, (elapsed2 / total2) * 100));
            document.getElementById('countdownProgress').style.width = pct2 + '%';
        } else {
            document.getElementById('countdownProgress').style.width = '50%';
        }
    }
}

window._refreshCountdownName = function() { tickCountdown(); };

// Start countdown
tickCountdown();
countdownInterval = setInterval(tickCountdown, 1000);

// Auto-refresh prayer times every minute
setInterval(function() {
    fetch('/api/prayer-times')
        .then(function(r) { return r.json(); })
        .then(function(times) { console.log('Prayer times updated:', times); });
}, 60000);

// ════════════════════════════════════════
//  LOG VIEWER & LOG CONFIGURATION
// ════════════════════════════════════════

var _allLogLines = [];
var _autoRefreshTimer = null;
var _autoRefreshActive = false;

/** Load log config from server and populate form fields */
function loadLogConfig() {
    fetch('/api/log-config')
        .then(function(r) { return r.json(); })
        .then(function(cfg) {
            var p  = document.getElementById('logFilePath');
            var lv = document.getElementById('logLevel');
            var sz = document.getElementById('logMaxFileSizeMB');
            var mh = document.getElementById('logMaxHistory');
            var dl = document.getElementById('logMaxDisplayLines');
            if (p)  p.value  = cfg.logFilePath        || 'logs/athan.log';
            if (lv) lv.value = (cfg.logLevel          || 'INFO').toUpperCase();
            if (sz) sz.value = cfg.maxFileSizeMB       || 10;
            if (mh) mh.value = cfg.maxHistory          || 7;
            if (dl) dl.value = cfg.maxDisplayLines     || 500;
        })
        .catch(function(e) { console.warn('Could not load log config:', e); });
}

/** Save log config to server */
function saveLogConfig() {
    var cfg = {
        logFilePath:     (document.getElementById('logFilePath')       || {}).value || 'logs/athan.log',
        logLevel:        (document.getElementById('logLevel')          || {}).value || 'INFO',
        maxFileSizeMB:   parseInt((document.getElementById('logMaxFileSizeMB')  || {}).value)  || 10,
        maxHistory:      parseInt((document.getElementById('logMaxHistory')      || {}).value)  || 7,
        maxDisplayLines: parseInt((document.getElementById('logMaxDisplayLines') || {}).value)  || 500
    };
    fetch('/api/log-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        showNotification(data.success ? t('logConfigSaved', '✅ Log configuration saved') : '❌ ' + data.message,
                         data.success ? 'success' : 'error');
        if (data.success) loadLogs();
    })
    .catch(function(e) { showNotification('❌ ' + t('logConfigError', 'Error saving log config') + ': ' + e.message, 'error'); });
}

/** Fetch logs from server and render them */
function loadLogs() {
    var lines = parseInt((document.getElementById('logMaxDisplayLines') || {}).value) || 500;
    fetch('/api/logs?lines=' + lines)
        .then(function(r) { return r.json(); })
        .then(function(data) {
            _allLogLines = data.lines || [];
            renderLogMeta(data.meta);
            filterLogView();
        })
        .catch(function(e) { renderLogError('Error fetching logs: ' + e.message); });
}

function renderLogMeta(meta) {
    var bar = document.getElementById('logFileMeta');
    var txt = document.getElementById('logFileMetaText');
    if (!bar || !meta) return;
    bar.style.display = 'block';
    var exists = meta.exists ? '✅ File found' : '⚠️ File not found yet';
    var size   = meta.sizeKB !== undefined ? ' · ' + meta.sizeKB + ' KB' : '';
    var mod    = meta.lastModified ? ' · Last modified: ' + meta.lastModified.replace('T',' ').replace('Z','') : '';
    txt.textContent = exists + ' · ' + meta.path + size + mod;
}

function renderLogError(msg) {
    var viewer = document.getElementById('logViewer');
    if (viewer) viewer.innerHTML = '<div style="color:#f85149;padding:20px;">' + escapeHtml(msg) + '</div>';
}

/** Apply text + level filter and colorize */
function filterLogView() {
    var viewer  = document.getElementById('logViewer');
    var badge   = document.getElementById('logBadge');
    if (!viewer) return;

    var textFilter  = ((document.getElementById('logFilter')      || {}).value || '').toLowerCase();
    var levelFilter = ((document.getElementById('logLevelFilter') || {}).value || '').toUpperCase();

    var filtered = _allLogLines.filter(function(line) {
        if (textFilter  && line.toLowerCase().indexOf(textFilter)  === -1) return false;
        if (levelFilter && line.toUpperCase().indexOf(' ' + levelFilter + ' ') === -1) return false;
        return true;
    });

    if (badge) badge.textContent = filtered.length + ' ' + t('logLines', 'lines');

    if (filtered.length === 0) {
        viewer.innerHTML = '<div style="text-align:center;color:#8b949e;padding:40px;">' + t('logNoMatch', 'No log lines match the current filter.') + '</div>';
        return;
    }

    var html = filtered.map(function(line) {
        var cls = 'log-line';
        var ul  = line.toUpperCase();
        if (ul.indexOf(' ERROR ') !== -1 || ul.indexOf('] ERROR') !== -1) cls += ' log-error';
        else if (ul.indexOf(' WARN ')  !== -1 || ul.indexOf('] WARN')  !== -1) cls += ' log-warn';
        else if (ul.indexOf(' DEBUG ') !== -1 || ul.indexOf('] DEBUG') !== -1) cls += ' log-debug';
        else if (ul.indexOf(' TRACE ') !== -1 || ul.indexOf('] TRACE') !== -1) cls += ' log-trace';
        else if (ul.indexOf(' INFO ')  !== -1 || ul.indexOf('] INFO')  !== -1) cls += ' log-info';
        return '<div class="' + cls + '">' + escapeHtml(line) + '</div>';
    }).join('');

    viewer.innerHTML = '<style>' +
        '.log-line{padding:1px 0;}' +
        '.log-error{color:#f85149;}' +
        '.log-warn{color:#e3b341;}' +
        '.log-info{color:#79c0ff;}' +
        '.log-debug{color:#56d364;}' +
        '.log-trace{color:#8b949e;}' +
        '</style>' + html;

    scrollLogsToBottom();
}

function scrollLogsToBottom() {
    var viewer = document.getElementById('logViewer');
    if (viewer) viewer.scrollTop = viewer.scrollHeight;
}

function copyLogs() {
    var text = _allLogLines.join('\n');
    if (!text) { showNotification(t('logNothingToCopy', 'No logs to copy'), 'error'); return; }
    navigator.clipboard.writeText(text)
        .then(function() { showNotification(t('logCopied', '📋 Logs copied to clipboard'), 'success'); })
        .catch(function() { showNotification(t('logCopyError', 'Could not copy to clipboard'), 'error'); });
}

function toggleAutoRefresh() {
    var btn = document.getElementById('autoRefreshBtn');
    if (_autoRefreshActive) {
        clearInterval(_autoRefreshTimer);
        _autoRefreshActive = false;
        if (btn) { btn.textContent = t('logAutoRefresh', '⏵ Auto'); btn.classList.remove('btn-primary'); btn.classList.add('btn-secondary'); }
    } else {
        _autoRefreshActive = true;
        loadLogs();
        _autoRefreshTimer = setInterval(loadLogs, 5000);
        if (btn) { btn.textContent = t('logAutoRefreshStop', '⏸ Stop'); btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary'); }
        showNotification(t('logAutoRefreshActive', '🔄 Auto-refresh every 5 seconds'), 'success');
    }
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Load log config once the DOM is ready (append to existing DOMContentLoaded logic)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadLogConfig, 200);
});


