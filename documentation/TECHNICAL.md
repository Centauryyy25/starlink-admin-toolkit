# 🔧 Technical Documentation

Dokumentasi teknis untuk developer yang ingin memahami atau memodifikasi extension.

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHROME EXTENSION ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                      MANIFEST V3 (manifest.json)                  │  │
│   │  ────────────────────────────────────────────────────────────    │  │
│   │  Defines: permissions, icons, popup, content_scripts              │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                ┌───────────────────┼───────────────────┐                │
│                ▼                   ▼                   ▼                │
│   ┌────────────────────┐ ┌────────────────┐ ┌────────────────────┐     │
│   │    POPUP LAYER     │ │  CONTENT LAYER │ │   BACKGROUND       │     │
│   │    ────────────    │ │  ──────────────│ │   (Service Worker) │     │
│   │                    │ │                │ │   ───────────────  │     │
│   │  popup.html        │ │  content.js    │ │   (Not used in     │     │
│   │  popup.css         │ │  - Injected on │ │    this extension) │     │
│   │  popup.js          │ │    demand      │ │                    │     │
│   │  - UI Logic        │ │  - DOM Parsing │ │                    │     │
│   │  - Mode Selection  │ │  - Data Extract│ │                    │     │
│   │  - Tab Control     │ │                │ │                    │     │
│   │  - CSV Generation  │ │                │ │                    │     │
│   └────────┬───────────┘ └───────▲────────┘ └────────────────────┘     │
│            │                     │                                       │
│            │ chrome.scripting    │ Return data                          │
│            │ executeScript()     │                                       │
│            └─────────────────────┘                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction

```
User Click → popup.js → chrome.scripting.executeScript() → content.js
                                                              │
                                                              ▼
                                                         Parse DOM
                                                              │
                                                              ▼
popup.js ← Return extracted data ←─────────────────────────────┘
    │
    ▼
Generate CSV → Download to user's computer
```

---

## 📁 File Structure

```
starlink-usage-extractor/
│
├── manifest.json          # Extension manifest (Manifest V3)
│
├── popup.html             # Main popup UI structure
├── popup.css              # Styling (gradients, modern design)
├── popup.js               # Main application logic (~700 lines)
│   ├── UI Management
│   ├── Mode Selection
│   ├── Extraction Logic
│   ├── CSV Generation
│   └── Tab Navigation
│
├── content.js             # DOM parsing script (~150 lines)
│   ├── extractUsageData()
│   ├── Regex patterns
│   └── Data normalization
│
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
├── documentation/         # Documentation files
│   ├── README.md
│   ├── INSTALLATION.md
│   ├── USER_GUIDE.md
│   ├── TECHNICAL.md
│   ├── SECURITY.md
│   ├── TROUBLESHOOTING.md
│   └── CHANGELOG.md
│
└── README.md              # Main project README
```

---

## 📄 File Details

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "Starlink Usage Extractor",
  "version": "1.0.0",
  "description": "Extract usage data from Starlink admin dashboard",
  
  "permissions": [
    "activeTab",    // Access current tab only
    "scripting",    // Inject content script
    "storage"       // Store last extract timestamp
  ],
  
  "host_permissions": [
    "https://www.starlink.com/*"  // Only Starlink domain
  ],
  
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
```

### popup.js - Key Functions

#### Mode Selection

```javascript
// Handle mode change
modeInputs.forEach(input => {
  input.addEventListener('change', () => {
    currentMode = input.value;  // 'single', 'quick', 'deep'
    updateModeInfo();
  });
});
```

#### Single Page Extraction

```javascript
async function extractSingle(tab) {
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
  
  const data = results[0]?.result;
  if (!data || data.error) throw new Error(data?.error);
  
  return data.usageData;
}
```

#### Deep Batch Extraction

```javascript
async function extractDeepBatch(tab) {
  // 1. Scroll and collect all URLs (handles virtual scroll)
  const collectResult = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const collectedUrls = new Map();
      
      // Scroll through list, collect URLs during scroll
      // Virtual scroll recycles DOM elements, so we must
      // collect during scroll, not after
      
      return Array.from(collectedUrls.entries());
    }
  });
  
  // 2. Navigate to each URL and extract
  for (const item of itemList) {
    // Navigate
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (url) => window.location.href = url,
      args: [item.url]
    });
    
    // Wait for page load
    await waitForPageWithContent(tab.id);
    
    // Extract with retry
    // ... extraction logic with 3 retries
  }
  
  // 3. Return to dashboard
  // ... navigation logic
}
```

#### CSV Generation

```javascript
function generateCSV(data, mode) {
  const timestamp = new Date().toISOString();
  
  if (mode === 'quick') {
    headers = ['no', 'timestamp', 'nama', 'status', 'alerts'];
  } else {
    headers = [
      'no', 'timestamp', 'nama_penggilan', 'service_line_id',
      'kuota_terpakai_gb', 'kuota_total_gb', 'kuota_persentase',
      'paket_layanan', 'lokasi'
    ];
  }
  
  const rows = data.map((item, idx) => {
    // ... format row data
  });
  
  return [headers.join(','), ...rows].join('\n');
}
```

### content.js - Key Functions

#### Main Extraction Function

```javascript
function extractUsageData() {
  const result = {
    namaPenggilan: '',
    serviceLineId: '',
    paketLayanan: '',
    kuotaUsed: 0,
    kuotaTotal: 0,
    kuotaPercentage: 0,
    lokasiLayanan: ''
  };
  
  const bodyText = document.body.innerText;
  
  // Extract each field with regex patterns
  // ... pattern matching logic
  
  return {
    usageData: [result],
    pageUrl: window.location.href,
    extractedAt: new Date().toISOString()
  };
}
```

#### Regex Patterns

```javascript
// Service Line ID
const slMatch = bodyText.match(/SL-\d+[-\d]*/i);

// Customer Name (CRT pattern)
const namaMatch = bodyText.match(/(CRT\d+[^<\n]*)/i);

// Kuota (handles GB and TB)
const kuotaMatch = bodyText.match(
  /(\d+(?:[.,]\d+)?)\s*(GB|TB)\s*[\/]\s*(\d+(?:[.,]\d+)?)\s*(GB|TB)/i
);

// Paket Layanan
const paketMatch = bodyText.match(
  /Langganan\s*(Lokal\s*)?(Prioritas|Standard|Mobile)/i
);

// Lokasi
const lokasiMatch = bodyText.match(
  /Lokasi\s*Layanan[\s\S]*?\n\s*([^\n]+Indonesia)/i
);
```

---

## 🔄 Data Flow

### Extraction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      EXTRACTION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [1] User selects mode (single/quick/deep)                      │
│       │                                                          │
│       ▼                                                          │
│  [2] User clicks "Extract Data"                                 │
│       │                                                          │
│       ▼                                                          │
│  ┌────────────────────────────────────────┐                     │
│  │ popup.js: handleExtract()              │                     │
│  │ ─────────────────────────────────────  │                     │
│  │ switch(mode) {                         │                     │
│  │   'single': extractSingle(tab);        │                     │
│  │   'quick':  extractQuickList(tab);     │                     │
│  │   'deep':   extractDeepBatch(tab);     │                     │
│  │ }                                      │                     │
│  └────────────────┬───────────────────────┘                     │
│                   │                                              │
│                   ▼                                              │
│  [3] Inject content.js to page                                  │
│       │                                                          │
│       ▼                                                          │
│  ┌────────────────────────────────────────┐                     │
│  │ content.js: extractUsageData()         │                     │
│  │ ─────────────────────────────────────  │                     │
│  │ - Read document.body.innerText         │                     │
│  │ - Apply regex patterns                 │                     │
│  │ - Normalize data                       │                     │
│  │ - Return structured data               │                     │
│  └────────────────┬───────────────────────┘                     │
│                   │                                              │
│                   ▼                                              │
│  [4] Return data to popup.js                                    │
│       │                                                          │
│       ▼                                                          │
│  [5] Show preview, enable download                              │
│       │                                                          │
│       ▼                                                          │
│  [6] User clicks "Download CSV"                                 │
│       │                                                          │
│       ▼                                                          │
│  [7] generateCSV() → Download file                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎛️ Configuration

### Configurable Parameters (in popup.js)

```javascript
// Wait timeouts
const PAGE_LOAD_TIMEOUT = 10000;  // 10 seconds
const CONTENT_WAIT_TIMEOUT = 10000;
const RETRY_DELAY = 2000;  // 2 seconds between retries
const MAX_RETRY_ATTEMPTS = 3;

// Scroll parameters (for virtual scroll)
const SCROLL_STEP = 300;  // pixels per scroll
const SCROLL_WAIT = 150;  // ms wait after scroll
const MAX_NO_NEW_ITEMS = 10;  // stop after X scrolls with no new items
```

### Selector Dependencies

Extension relies on these DOM selectors:

| Selector | Used For |
|----------|----------|
| `cdk-virtual-scroll-viewport` | Virtual scroll container |
| `app-dashboard-service-line-row` | Customer row component |
| `a[href*="service-line"]` | Link to detail page |

> ⚠️ **Warning:** If Starlink changes their DOM structure, these selectors may need to be updated.

---

## 🧪 Testing

### Manual Testing Checklist

```
[ ] Single Page Mode
    [ ] Extract from detail page
    [ ] All fields populated
    [ ] CSV downloads correctly

[ ] Quick List Mode
    [ ] Extract visible items
    [ ] Names and status correct
    [ ] CSV format correct

[ ] Deep Batch Mode
    [ ] Virtual scroll detection
    [ ] URL collection complete
    [ ] Navigation works
    [ ] Data extraction correct
    [ ] Cancel works
    [ ] Return to dashboard
    [ ] CSV complete

[ ] Edge Cases
    [ ] Empty list
    [ ] Single item
    [ ] 100+ items
    [ ] Slow connection
    [ ] Session expired mid-extraction
```

### Debug Mode

Enable console logging:

```javascript
// Already enabled in content.js
console.log('=== Starlink Extractor ===');
console.log('URL:', window.location.href);
console.log('SL:', result.serviceLineId);
// ... more debug logs
```

View logs in Chrome DevTools (F12 → Console).

---

## 🔧 Modification Guide

### Adding New Data Field

1. **Update content.js:**
```javascript
// Add regex pattern
const newFieldMatch = bodyText.match(/Your Pattern Here/i);
if (newFieldMatch) {
  result.newField = newFieldMatch[1];
}
```

2. **Update CSV generation in popup.js:**
```javascript
headers = [...existing, 'new_field'];
rows = data.map(item => [...existing, item.newField || 'N/A']);
```

### Changing Selectors

1. Identify element using Chrome DevTools (F12 → Elements)
2. Update selector in popup.js or content.js
3. Test thoroughly

### Adding New Mode

1. Add radio button in popup.html
2. Add mode info in popup.js `updateModeInfo()`
3. Add extraction function
4. Add case in `handleExtract()` switch

---

## 📊 Performance Considerations

### Memory Usage

- Popup: ~5-10MB
- Per item extracted: ~1KB
- 100 items: ~100KB in memory

### Time Complexity

| Mode | Time | Bottleneck |
|------|------|------------|
| Single | O(1) | DOM parsing |
| Quick | O(n) | n = visible items |
| Deep | O(n×m) | n = items, m = page load time |

### Optimization Tips

- Use filter/search to reduce items
- Deep batch on fast connection
- Don't run on very large lists (500+)

---

*Last updated: 2024-12-30*
