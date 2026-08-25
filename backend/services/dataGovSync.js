const https = require('https');
const http = require('http');
const dataService = require('./dataService');

const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = 'https://api.data.gov.in/resource/' + RESOURCE_ID;

class DataGovSyncService {
  constructor() {
    this.lastSync = null;
    this.totalSynced = 0;
  }

  async fetchRecords({ apiKey, limit = 100, offset = 0, state = '', commodity = '' } = {}) {
    if (!apiKey) {
      throw new Error('Data.gov.in API key is required. Get a free API key at https://data.gov.in');
    }

    const url = new URL(BASE_URL);
    url.searchParams.append('api-key', apiKey);
    url.searchParams.append('format', 'json');
    url.searchParams.append('limit', String(limit));
    url.searchParams.append('offset', String(offset));
    if (state) url.searchParams.append('filters[state]', state);
    if (commodity) url.searchParams.append('filters[commodity]', commodity);

    return new Promise((resolve, reject) => {
      https.get(url.toString(), (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            if (res.statusCode >= 400) {
              return reject(new Error(`Data.gov.in API responded with status ${res.statusCode}: ${rawData.slice(0, 200)}`));
            }
            const parsed = JSON.parse(rawData);
            const rawRecords = parsed.records || [];
            const totalAvailable = parsed.total || rawRecords.length;
            const cleaned = this.formatRecords(rawRecords);
            
            // Ingest into active in-memory data store
            const addedCount = dataService.addRecords(cleaned);
            
            this.lastSync = new Date().toISOString();
            this.totalSynced += addedCount;

            resolve({
              success: true,
              resource_id: RESOURCE_ID,
              records_retrieved: rawRecords.length,
              records_ingested: addedCount,
              total_available_on_server: totalAvailable,
              timestamp: this.lastSync,
              sample_records: cleaned.slice(0, 5)
            });
          } catch (e) {
            reject(new Error(`Failed to parse Data.gov.in response: ${e.message}`));
          }
        });
      }).on('error', (err) => {
        reject(new Error(`Network error calling Data.gov.in: ${err.message}`));
      });
    });
  }

  formatRecords(raw) {
    const today = new Date().toISOString().split('T')[0];
    const cleaned = [];

    for (const r of raw) {
      const comm = (r.commodity || r.Commodity || '').trim();
      const mkt = (r.market || r.Market || '').trim();
      const st = (r.state || r.State || '').trim();
      const dist = (r.district || r.District || '').trim();
      const var_ = (r.variety || r.Variety || 'Normal').trim();
      const grd = (r.grade || r.Grade || 'FAQ').trim();
      
      const modal = parseFloat(r.modal_price || r.Modal_Price) || 0;
      const minP = parseFloat(r.min_price || r.Min_Price) || modal * 0.95;
      const maxP = parseFloat(r.max_price || r.Max_Price) || modal * 1.05;

      let dateStr = today;
      const rawDate = r.arrival_date || r.Arrival_Date;
      if (rawDate) {
        if (rawDate.includes('/')) {
          const parts = rawDate.split('/');
          if (parts.length === 3) {
            // DD/MM/YYYY
            dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        } else if (rawDate.includes('-')) {
          dateStr = rawDate;
        }
      }

      if (comm && mkt && modal > 0) {
        cleaned.push({
          state: st,
          district: dist,
          market: mkt,
          commodity: comm,
          variety: var_,
          grade: grd,
          arrival_date: dateStr,
          min_price: Math.round(minP * 100) / 100,
          max_price: Math.round(maxP * 100) / 100,
          modal_price: Math.round(modal * 100) / 100,
          is_synthetic: false
        });
      }
    }

    return cleaned;
  }

  getInfo() {
    return {
      resource_id: RESOURCE_ID,
      title: 'Current Daily Price and Arrival of Agricultural Commodities in Mandis',
      source: 'api.data.gov.in (Agmarknet / Ministry of Agriculture)',
      endpoint: BASE_URL,
      fields: ['state', 'district', 'market', 'commodity', 'variety', 'grade', 'arrival_date', 'min_price', 'max_price', 'modal_price'],
      last_sync: this.lastSync,
      total_synced_this_session: this.totalSynced
    };
  }
}

module.exports = new DataGovSyncService();
