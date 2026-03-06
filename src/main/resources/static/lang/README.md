# Language Files Directory

This directory contains translation files for the Athan application.

## 📁 Available Languages

- **en.json** - English (Default)
- **ar.json** - Arabic (العربية) - RTL
- **fr.json** - French (Français)

## ➕ Adding a New Language

1. Copy `en.json` as a template
2. Rename to `[language-code].json` (e.g., `de.json` for German)
3. Update the metadata:
   - `languageCode`: ISO 2-letter code
   - `languageName`: Name in English
   - `languageNativeName`: Name in native script
   - `direction`: `"ltr"` or `"rtl"`
4. Translate all strings in the `translations` object
5. Save the file
6. Restart the application

The language will be **automatically detected** and added to the language selector!

## 📝 Language File Format

```json
{
  "languageCode": "xx",
  "languageName": "Language Name",
  "languageNativeName": "Native Name",
  "direction": "ltr",
  "translations": {
    "headerTitle": "🕌 Athan",
    "FAJR": "Fajr",
    "TASBEE7_1": "First Tasbee7",
    ...
  }
}
```

## 🌍 Suggested Languages

Common language codes for Islamic countries:

- `ar` - Arabic (العربية) ✅
- `ur` - Urdu (اردو)
- `tr` - Turkish (Türkçe)
- `id` - Indonesian (Bahasa Indonesia)
- `ms` - Malay (Bahasa Melayu)
- `bn` - Bengali (বাংলা)
- `fa` - Persian (فارسی)
- `de` - German (Deutsch)
- `es` - Spanish (Español)
- `fr` - French (Français) ✅

## 📖 Documentation

See `TRANSLATOR_GUIDE.md` in the project root for detailed instructions.

## ✅ Requirements

- Each file must be valid JSON
- All translation keys from `en.json` must be present
- File must be saved as UTF-8 encoding
- File name must match `languageCode` value

## 🔄 How It Works

1. On page load, the system scans for JSON files in this directory
2. Successfully loaded files appear in the language selector
3. User can cycle through all available languages
4. Language preference is saved in browser localStorage

**No code changes needed - just add the file!**

