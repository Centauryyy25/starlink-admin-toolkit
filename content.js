/**
 * Starlink Usage Extractor - Content Script
 * Parses DOM to extract usage data from Starlink dashboard (Indonesian)
 */

(function() {
  'use strict';
  
  /**
   * Convert TB to GB
   */
  function toGB(valueStr) {
    if (!valueStr) return 0;
    const numStr = valueStr.replace(',', '.').replace(/[^\d.]/g, '');
    const num = parseFloat(numStr);
    if (isNaN(num)) return 0;
    
    // Check if TB
    if (/TB/i.test(valueStr)) {
      return num * 1000;
    }
    return num;
  }
  
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
    
    try {
      const bodyText = document.body.innerText;
      
      console.log('=== Starlink Extractor ===');
      console.log('URL:', window.location.href);
      console.log('Text length:', bodyText.length);
      
      // 1. Service Line ID: SL-XXXX-XXXX-XX
      const slMatch = bodyText.match(/SL-\d+[-\d]*/i);
      if (slMatch) {
        result.serviceLineId = slMatch[0];
        console.log('SL:', result.serviceLineId);
      }
      
      // 2. Nama Penggilan (CRT pattern)
      const namaMatch = bodyText.match(/Nama\s*Penggilan[\s\S]*?\n\s*(CRT[^\n]+)/i) ||
                        bodyText.match(/(CRT\d+[^<\n]*)/i);
      if (namaMatch) {
        let nama = (namaMatch[1] || namaMatch[0]).trim();
        nama = nama.replace(/\s*(open_in_new|Edit|Kelola)\s*/gi, '').trim();
        result.namaPenggilan = nama;
        console.log('Nama:', result.namaPenggilan);
      }
      
      // 3. Paket Layanan
      const paketMatch = bodyText.match(/Langganan\s*(Lokal\s*)?(Prioritas|Standard|Mobile)/i) ||
                         bodyText.match(/Paket\s*Layanan[\s\S]*?\n\s*Aktif[\s\S]*?\n\s*([^\n]+)/i);
      if (paketMatch) {
        result.paketLayanan = paketMatch[0].replace(/\s*(Kelola|Edit)\s*$/gi, '').trim();
        console.log('Paket:', result.paketLayanan);
      }
      
      // 4. Kuota: Find "XXX GB/YYY GB" or "XXX GB / YYY GB" pattern
      // Also handle TB
      const kuotaMatch = bodyText.match(/(\d+(?:[.,]\d+)?)\s*(GB|TB)\s*[\/]\s*(\d+(?:[.,]\d+)?)\s*(GB|TB)/i);
      if (kuotaMatch) {
        const usedVal = kuotaMatch[1];
        const usedUnit = kuotaMatch[2];
        const totalVal = kuotaMatch[3];
        const totalUnit = kuotaMatch[4];
        
        result.kuotaUsed = toGB(usedVal + usedUnit);
        result.kuotaTotal = toGB(totalVal + totalUnit);
        
        console.log(`Kuota found: ${usedVal} ${usedUnit} / ${totalVal} ${totalUnit}`);
        console.log(`Converted: ${result.kuotaUsed} GB / ${result.kuotaTotal} GB`);
      }
      
      // Fallback: just find any GB value after "Penggunaan Kuota"
      if (result.kuotaUsed === 0) {
        const fallbackMatch = bodyText.match(/Penggunaan\s*Kuota[\s\S]*?(\d+(?:[.,]\d+)?)\s*(GB|TB)/i);
        if (fallbackMatch) {
          result.kuotaUsed = toGB(fallbackMatch[1] + fallbackMatch[2]);
          console.log('Fallback kuota:', result.kuotaUsed);
        }
      }
      
      // Calculate percentage
      if (result.kuotaUsed > 0 && result.kuotaTotal > 0) {
        result.kuotaPercentage = Math.round((result.kuotaUsed / result.kuotaTotal) * 100);
      }
      
      // 5. Lokasi Layanan
      const lokasiMatch = bodyText.match(/Lokasi\s*Layanan[\s\S]*?\n\s*([^\n]+(?:Indonesia|City|Kota|Kabupaten|Sulawesi|Java|Sumatra|Kalimantan|Papua|Maluku|Bali)[^\n]*)/i);
      if (lokasiMatch && lokasiMatch[1]) {
        let lokasi = lokasiMatch[1].trim();
        lokasi = lokasi.replace(/\s*(Edit|open_in_new)\s*$/gi, '').trim();
        if (lokasi.length > 5) {
          result.lokasiLayanan = lokasi;
          console.log('Lokasi:', result.lokasiLayanan);
        }
      }
      
      // Alt lokasi: PRRB pattern or Plus Code
      if (!result.lokasiLayanan) {
        const altMatch = bodyText.match(/([A-Z0-9]{4,}\+[A-Z0-9]+[,\s][^\n]+Indonesia)/i) ||
                         bodyText.match(/Lokasi\s*Layanan[\s\S]*?\n\s*([^\n]{10,80})/i);
        if (altMatch && altMatch[1]) {
          let lokasi = altMatch[1].trim().replace(/\s*(Edit|open_in_new)\s*$/gi, '');
          if (lokasi.length > 5 && !lokasi.match(/^(Edit|Kelola)$/i)) {
            result.lokasiLayanan = lokasi;
            console.log('Lokasi alt:', result.lokasiLayanan);
          }
        }
      }
      
      console.log('=== Result ===', result);
      
    } catch (error) {
      console.error('Extraction error:', error);
      return { error: error.message, usageData: [] };
    }
    
    // Build output
    const usageData = [];
    if (result.namaPenggilan || result.serviceLineId || result.kuotaUsed > 0) {
      usageData.push({
        namaPenggilan: result.namaPenggilan || 'N/A',
        serviceLineId: result.serviceLineId || 'N/A',
        paketLayanan: result.paketLayanan || 'N/A',
        penggunaanKuota: result.kuotaTotal > 0 
          ? `${result.kuotaUsed} GB / ${result.kuotaTotal} GB`
          : result.kuotaUsed > 0 ? `${result.kuotaUsed} GB` : 'N/A',
        kuotaUsed: result.kuotaUsed,
        kuotaTotal: result.kuotaTotal,
        kuotaPercentage: result.kuotaPercentage,
        lokasiLayanan: result.lokasiLayanan || 'N/A'
      });
    }
    
    return {
      usageData,
      pageUrl: window.location.href,
      extractedAt: new Date().toISOString()
    };
  }
  
  return extractUsageData();
})();
