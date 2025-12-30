/**
 * Starlink Usage Extractor - Popup Script
 * Handles mode selection, extraction triggers, and CSV generation
 */

// DOM Elements
const extractBtn = document.getElementById('extract-btn');
const cancelBtn = document.getElementById('cancel-btn');
const statusEl = document.getElementById('status');
const statusIcon = statusEl.querySelector('.status-icon');
const statusText = statusEl.querySelector('.status-text');
const dataPreview = document.getElementById('data-preview');
const previewContent = document.getElementById('preview-content');
const lastExtractEl = document.getElementById('last-extract');
const lastTimestamp = document.getElementById('last-timestamp');
const progressContainer = document.getElementById('progress-container');
const progressLabel = document.getElementById('progress-label');
const progressCount = document.getElementById('progress-count');
const progressFill = document.getElementById('progress-fill');
const modeDescText = document.getElementById('mode-desc-text');
const hintText = document.getElementById('hint-text');
const modeBtns = document.querySelectorAll('.mode-btn');

// State
let currentMode = 'single';
let isExtracting = false;
let shouldCancel = false;
let extractedData = [];

// Mode descriptions
const modeDescriptions = {
  single: 'Ekstrak data dari halaman Langganan yang sedang dibuka',
  quick: 'Ambil daftar nama + status dari panel kiri (cepat)',
  deep: 'Klik setiap item untuk data lengkap termasuk kuota (~1s/item)'
};

const modeHints = {
  single: 'Pastikan Anda berada di halaman Langganan/Account',
  quick: 'Pastikan Anda berada di halaman Dasbor dengan hasil search',
  deep: 'Pastikan Anda berada di halaman Dasbor dengan hasil search'
};

/**
 * Mode selection handler
 */
function selectMode(mode) {
  currentMode = mode;
  modeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  modeDescText.textContent = modeDescriptions[mode];
  hintText.textContent = modeHints[mode];
  
  // Update button text
  const btnText = extractBtn.querySelector('.btn-text');
  if (mode === 'single') {
    btnText.textContent = 'Ambil Usage';
  } else if (mode === 'quick') {
    btnText.textContent = 'Ambil List';
  } else {
    btnText.textContent = 'Mulai Batch Extract';
  }
}

/**
 * Show status message
 */
function showStatus(type, message) {
  statusEl.classList.remove('hidden', 'loading', 'success', 'error');
  statusEl.classList.add(type);
  
  const icons = { loading: '⏳', success: '✅', error: '❌' };
  statusIcon.textContent = icons[type] || '';
  statusText.textContent = message;
}

function hideStatus() {
  statusEl.classList.add('hidden');
}

/**
 * Progress bar controls
 */
function showProgress(current, total, label = 'Mengambil data...') {
  progressContainer.classList.remove('hidden');
  progressLabel.textContent = label;
  progressCount.textContent = `${current}/${total}`;
  progressFill.style.width = `${(current / total) * 100}%`;
}

function hideProgress() {
  progressContainer.classList.add('hidden');
  progressFill.style.width = '0%';
}

/**
 * Show data preview
 */
function showPreview(data) {
  if (!data || data.length === 0) return;
  
  // Show max 5 items in preview
  const previewData = data.slice(0, 5);
  const moreCount = data.length - 5;
  
  previewContent.innerHTML = previewData.map(item => `
    <div class="preview-item">
      <span class="preview-label">${item.namaPenggilan || item.nama || 'N/A'}</span>
      <span class="preview-value">${item.penggunaanKuota || item.status || 'N/A'}</span>
    </div>
  `).join('') + (moreCount > 0 ? `<div class="preview-item"><span class="preview-label">... dan ${moreCount} lainnya</span></div>` : '');
  
  dataPreview.classList.remove('hidden');
}

/**
 * Generate CSV content
 */
function generateCSV(data, mode) {
  const timestamp = new Date().toISOString();
  
  let headers, rows;
  
  if (mode === 'quick') {
    headers = ['no', 'timestamp', 'nama', 'status', 'alerts'];
    rows = data.map((item, idx) => [
      idx + 1,
      timestamp,
      `"${(item.nama || '').replace(/"/g, '""')}"`,
      `"${(item.status || '').replace(/"/g, '""')}"`,
      item.alerts || 0
    ].join(','));
  } else {
    headers = ['no', 'timestamp', 'nama_penggilan', 'service_line_id', 'kuota_terpakai_gb', 'kuota_total_gb', 'kuota_persentase', 'paket_layanan', 'lokasi'];
    rows = data.map((item, idx) => [
      idx + 1,
      timestamp,
      `"${(item.namaPenggilan || '').replace(/"/g, '""')}"`,
      `"${(item.serviceLineId || '').replace(/"/g, '""')}"`,
      item.kuotaUsed || 0,
      item.kuotaTotal || 0,
      item.kuotaPercentage ? `${item.kuotaPercentage}%` : 'N/A',
      `"${(item.paketLayanan || '').replace(/"/g, '""')}"`,
      `"${(item.lokasiLayanan || '').replace(/"/g, '""')}"`
    ].join(','));
  }
  
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Trigger CSV download
 */
function downloadCSV(csvContent, mode) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
  const modeStr = mode === 'quick' ? 'list' : 'full';
  const filename = `starlink_${modeStr}_${dateStr}_${timeStr}.csv`;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Update last extract timestamp
 */
function updateLastExtract() {
  const now = new Date();
  const formatted = now.toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  lastTimestamp.textContent = formatted;
  lastExtractEl.classList.remove('hidden');
  chrome.storage?.local?.set({ lastExtract: now.toISOString() });
}

/**
 * Load last extract from storage
 */
async function loadLastExtract() {
  try {
    const result = await chrome.storage?.local?.get(['lastExtract']);
    if (result?.lastExtract) {
      const date = new Date(result.lastExtract);
      lastTimestamp.textContent = date.toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      lastExtractEl.classList.remove('hidden');
    }
  } catch (e) {}
}

/**
 * Single page extraction
 */
async function extractSingle(tab) {
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
  
  const data = results[0]?.result;
  if (!data || data.error) throw new Error(data?.error || 'Gagal mengekstrak data');
  if (data.usageData.length === 0) throw new Error('Tidak ditemukan data usage di halaman ini');
  
  return data.usageData;
}

/**
 * Quick list extraction (from left panel)
 */
async function extractQuickList(tab) {
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const items = [];
      
      // Find all elements containing CRT text pattern
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        const text = el.textContent?.trim();
        // Match CRT followed by numbers
        if (text && /^CRT\d{6,}/.test(text) && text.length < 150) {
          // Get the row/container for status detection
          const container = el.closest('[class*="item"], [class*="row"], li, tr, div') || el.parentElement;
          const containerText = container?.innerText || text;
          
          // Detect status from visual indicators
          let status = 'Unknown';
          
          // Check for colored circles/dots (common status indicators)
          const greenIndicator = container?.querySelector('[class*="green"], [style*="green"], [fill*="green"], [class*="online"], [class*="success"]');
          const redIndicator = container?.querySelector('[class*="red"], [style*="red"], [fill*="red"], [class*="offline"], [class*="error"]');
          const yellowIndicator = container?.querySelector('[class*="yellow"], [style*="yellow"], [fill*="yellow"], [class*="warning"]');
          
          // Also check SVG fill colors
          const svgs = container?.querySelectorAll('svg circle, svg path') || [];
          for (const svg of svgs) {
            const fill = svg.getAttribute('fill') || getComputedStyle(svg).fill;
            if (fill && fill.includes('0, 128') || fill.includes('#00') || fill.includes('green')) {
              status = 'Online';
            } else if (fill && fill.includes('255, 0') || fill.includes('#ff') || fill.includes('red')) {
              status = 'Offline';
            }
          }
          
          if (greenIndicator) status = 'Online';
          else if (redIndicator) status = 'Offline';
          else if (yellowIndicator) status = 'Warning';
          
          // Count alerts (look for numbers near warning icons)
          let alerts = 0;
          const alertMatch = containerText.match(/(\d+)\s*$/);
          if (alertMatch) alerts = parseInt(alertMatch[1]);
          
          // Also look for triangle/warning icons with numbers
          const warningIcons = container?.querySelectorAll('[class*="warning"], [class*="alert"]') || [];
          for (const icon of warningIcons) {
            const num = icon.textContent?.match(/(\d+)/);
            if (num) alerts = Math.max(alerts, parseInt(num[1]));
          }
          
          // Extract just the CRT name part
          const nameMatch = text.match(/^(CRT\d+[^🔴🟢🟡\n]*)/);
          const nama = nameMatch ? nameMatch[1].trim() : text.slice(0, 80);
          
          // Check if already exists
          if (!items.some(i => i.nama === nama)) {
            items.push({
              nama: nama,
              status: status,
              alerts: alerts
            });
          }
        }
      }
      
      console.log('Quick list found:', items.length, items);
      
      return { items, count: items.length };
    }
  });
  
  const data = results[0]?.result;
  if (!data || data.items.length === 0) {
    throw new Error('Tidak ditemukan daftar service line. Pastikan Anda sudah melakukan search.');
  }
  
  return data.items;
}

/**
 * Deep batch extraction (navigate to each item's URL)
 */
async function extractDeepBatch(tab) {
  extractedData = [];
  shouldCancel = false;
  
  // Store original dashboard URL to return later
  const dashboardUrl = tab.url;
  
  // Scroll and collect URLs in one pass (for virtual scroll lists)
  showStatus('loading', 'Memuat dan mengumpulkan semua item...');
  
  const collectResult = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      // Find the virtual scroll viewport
      let scrollContainer = document.querySelector('cdk-virtual-scroll-viewport');
      
      if (!scrollContainer) {
        scrollContainer = document.querySelector('[class*="cdk-virtual-scroll-viewport"]');
      }
      
      if (!scrollContainer) {
        // Fallback for non-virtualized lists
        const rows = document.querySelectorAll('app-dashboard-service-line-row');
        if (rows.length > 0) {
          let parent = rows[0].parentElement;
          while (parent && parent !== document.body) {
            const style = getComputedStyle(parent);
            if (style.overflow === 'auto' || style.overflow === 'scroll' || 
                style.overflowY === 'auto' || style.overflowY === 'scroll') {
              scrollContainer = parent;
              break;
            }
            parent = parent.parentElement;
          }
        }
      }
      
      console.log('Scroll container:', scrollContainer?.tagName, scrollContainer?.className);
      
      // Collect URLs during scrolling (virtual scroll recycles DOM elements)
      const collectedUrls = new Map(); // url -> name
      
      // Function to collect currently visible items
      const collectVisibleItems = () => {
        const rows = document.querySelectorAll('app-dashboard-service-line-row');
        let newCount = 0;
        
        for (const row of rows) {
          const link = row.querySelector('a[href*="service-line"]') || 
                       row.querySelector('a[target="_blank"]') ||
                       row.querySelector('a');
          
          if (link && link.href && !collectedUrls.has(link.href)) {
            const rowText = row.textContent || '';
            const nameMatch = rowText.match(/(CRT\d+[^🔴🟢🟡\n]*)/);
            let nama = nameMatch ? nameMatch[1].trim() : 'Unknown';
            nama = nama.replace(/\s*(open_in_new|Edit)\s*/gi, '').trim();
            
            collectedUrls.set(link.href, nama);
            newCount++;
          }
        }
        
        return newCount;
      };
      
      // Collect initial items
      collectVisibleItems();
      console.log('Initial collected:', collectedUrls.size);
      
      if (!scrollContainer) {
        console.log('No scroll container, returning current items');
        return Array.from(collectedUrls.entries()).map(([url, nama]) => ({ url, nama }));
      }
      
      // Scroll through the entire list
      const scrollHeight = scrollContainer.scrollHeight;
      const clientHeight = scrollContainer.clientHeight;
      const scrollStep = 300; // Smaller steps to not miss items
      let scrollPos = 0;
      let noNewItemsCount = 0;
      const maxNoNewItems = 10;
      
      console.log('Starting scroll collection. Height:', scrollHeight, 'Client:', clientHeight);
      
      while (scrollPos < scrollHeight && noNewItemsCount < maxNoNewItems) {
        // Scroll to position
        scrollContainer.scrollTop = scrollPos;
        
        // Wait for virtual scroll to render
        await new Promise(r => setTimeout(r, 150));
        
        // Collect any new items
        const newItems = collectVisibleItems();
        
        if (newItems === 0) {
          noNewItemsCount++;
        } else {
          noNewItemsCount = 0;
        }
        
        scrollPos += scrollStep;
        
        // Log progress every 10 scrolls
        if (Math.floor(scrollPos / scrollStep) % 10 === 0) {
          console.log(`Scroll pos ${scrollPos}: collected ${collectedUrls.size} unique URLs`);
        }
      }
      
      // Scroll back to top
      scrollContainer.scrollTop = 0;
      
      console.log('Final collected URLs:', collectedUrls.size);
      
      // Convert to array
      return Array.from(collectedUrls.entries()).map(([url, nama]) => ({ url, nama }));
    }
  });
  
  const itemList = collectResult[0]?.result || [];
  
  console.log('Collected items:', itemList.length);
  
  if (itemList.length === 0) {
    throw new Error('Tidak ditemukan URL service line. Pastikan Anda sudah melakukan search.');
  }
  
  const total = itemList.length;
  showProgress(0, total, 'Memulai batch extraction...');
  cancelBtn.classList.remove('hidden');
  
  // Navigate to each item's URL and extract data
  for (let i = 0; i < itemList.length; i++) {
    if (shouldCancel) {
      showStatus('error', `Dibatalkan. ${extractedData.length} item tersimpan.`);
      break;
    }
    
    const item = itemList[i];
    showProgress(i + 1, total, `Mengambil: ${item.nama.slice(0, 25)}...`);
    
    try {
      // Navigate to the detail page in the same tab
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (url) => {
          window.location.href = url;
        },
        args: [item.url]
      });
      
      // Wait for page to fully load with content detection
      await waitForPageWithContent(tab.id, 10000);
      
      // Try extraction with retry mechanism
      let extractedItem = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !extractedItem) {
        attempts++;
        showProgress(i + 1, total, `Mengambil: ${item.nama.slice(0, 20)}... (${attempts}/${maxAttempts})`);
        
        // Extract data from detail page
        const detailResult = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        
        const detailData = detailResult[0]?.result;
        
        // Check if we got meaningful data (kuota or paket found)
        if (detailData && detailData.usageData && detailData.usageData.length > 0) {
          const data = detailData.usageData[0];
          
          // Consider it successful if we have kuota OR paket OR lokasi
          if (data.penggunaanKuota !== 'N/A' || data.paketLayanan !== 'N/A' || data.lokasiLayanan !== 'N/A') {
            extractedItem = {
              ...data,
              sourceUrl: item.url
            };
            console.log(`Success on attempt ${attempts}:`, extractedItem);
          }
        }
        
        // If not successful, wait and retry
        if (!extractedItem && attempts < maxAttempts) {
          console.log(`Attempt ${attempts} failed, waiting and retrying...`);
          await new Promise(r => setTimeout(r, 2000));
          
          // Scroll to trigger any lazy loading
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              window.scrollTo(0, document.body.scrollHeight);
              window.scrollTo(0, 0);
            }
          });
          
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      // Use extracted data or fallback
      if (extractedItem) {
        extractedData.push(extractedItem);
      } else {
        console.log(`All ${maxAttempts} attempts failed for ${item.nama}`);
        extractedData.push({
          namaPenggilan: item.nama,
          serviceLineId: extractServiceLineFromUrl(item.url),
          penggunaanKuota: 'N/A (timeout)',
          kuotaUsed: 0,
          kuotaTotal: 0,
          kuotaPercentage: 0,
          paketLayanan: 'N/A',
          lokasiLayanan: 'N/A',
          sourceUrl: item.url
        });
      }
      
    } catch (err) {
      console.error(`Error extracting ${item.nama}:`, err);
      extractedData.push({
        namaPenggilan: item.nama,
        serviceLineId: 'Error',
        penggunaanKuota: 'Error: ' + err.message,
        kuotaUsed: 0,
        kuotaTotal: 0,
        kuotaPercentage: 0,
        paketLayanan: 'N/A',
        lokasiLayanan: 'N/A',
        sourceUrl: item.url
      });
    }
  }
  
  // Return to dashboard
  showStatus('loading', 'Kembali ke dashboard...');
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (url) => {
        window.location.href = url;
      },
      args: [dashboardUrl]
    });
  } catch (e) {
    console.log('Could not return to dashboard:', e);
  }
  
  cancelBtn.classList.add('hidden');
  hideProgress();
  
  return extractedData;
}

/**
 * Wait for page to finish loading (basic)
 */
async function waitForPageLoad(tabId, timeout = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    await new Promise(r => setTimeout(r, 300));
    
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => document.readyState
      });
      
      if (result[0]?.result === 'complete') {
        await new Promise(r => setTimeout(r, 500));
        return true;
      }
    } catch (e) {
      // Page might be navigating, continue waiting
    }
  }
  
  return false;
}

/**
 * Wait for page to load AND have content (Kuota/Langganan text)
 */
async function waitForPageWithContent(tabId, timeout = 10000) {
  const startTime = Date.now();
  
  // First wait for basic page load
  await waitForPageLoad(tabId, 5000);
  
  // Then wait for content to appear
  while (Date.now() - startTime < timeout) {
    await new Promise(r => setTimeout(r, 500));
    
    try {
      const result = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const bodyText = document.body.innerText || '';
          // Check for key content indicators
          const hasKuota = /kuota/i.test(bodyText);
          const hasLangganan = /langganan/i.test(bodyText);
          const hasPaket = /paket\s*layanan/i.test(bodyText);
          const hasNama = /nama\s*penggilan/i.test(bodyText);
          const hasGB = /\d+\s*GB/i.test(bodyText);
          
          return {
            ready: (hasKuota || hasLangganan || hasPaket) && (hasNama || hasGB),
            hasKuota,
            hasLangganan,
            hasPaket,
            hasNama,
            hasGB,
            textLength: bodyText.length
          };
        }
      });
      
      const check = result[0]?.result;
      console.log('Content check:', check);
      
      if (check?.ready) {
        // Found content, wait a bit more for dynamic rendering
        await new Promise(r => setTimeout(r, 1000));
        return true;
      }
    } catch (e) {
      console.log('Content check error:', e);
    }
  }
  
  console.log('Content wait timeout');
  return false;
}

/**
 * Extract service line ID from URL
 */
function extractServiceLineFromUrl(url) {
  const match = url.match(/service-line\/(SL-[^/?]+)/i);
  return match ? match[1] : 'N/A';
}

/**
 * Main extraction handler
 */
async function handleExtract() {
  if (isExtracting) return;
  
  isExtracting = true;
  extractBtn.disabled = true;
  extractBtn.querySelector('.btn-icon').textContent = '⏳';
  
  hideStatus();
  hideProgress();
  dataPreview.classList.add('hidden');
  
  showStatus('loading', 'Mengambil data...');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) throw new Error('Tidak dapat menemukan tab aktif');
    if (!tab.url?.includes('starlink.com')) {
      throw new Error('Harap buka halaman Starlink terlebih dahulu');
    }
    
    let data;
    
    if (currentMode === 'single') {
      data = await extractSingle(tab);
    } else if (currentMode === 'quick') {
      data = await extractQuickList(tab);
    } else {
      data = await extractDeepBatch(tab);
    }
    
    if (data.length === 0) {
      throw new Error('Tidak ada data yang ditemukan');
    }
    
    showStatus('success', `Berhasil mengambil ${data.length} data`);
    showPreview(data);
    
    const csv = generateCSV(data, currentMode);
    downloadCSV(csv, currentMode);
    
    updateLastExtract();
    
  } catch (error) {
    console.error('Extraction error:', error);
    showStatus('error', error.message || 'Terjadi kesalahan');
  } finally {
    isExtracting = false;
    extractBtn.disabled = false;
    extractBtn.querySelector('.btn-icon').textContent = '📊';
    cancelBtn.classList.add('hidden');
  }
}

/**
 * Cancel handler
 */
function handleCancel() {
  shouldCancel = true;
  showStatus('loading', 'Membatalkan...');
}

// Event listeners
modeBtns.forEach(btn => {
  btn.addEventListener('click', () => selectMode(btn.dataset.mode));
});
extractBtn.addEventListener('click', handleExtract);
cancelBtn.addEventListener('click', handleCancel);

// Initialize
selectMode('single');
loadLastExtract();
