require('dotenv').config();

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = 'gemini-1.5-flash';
    this.cache = new Map();
    this.cacheTTL = 30 * 60 * 1000; // 30 min cache (conserve quota)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async callGemini(prompt, systemInstruction = '', retries = 3) {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    
    const contents = [];
    if (systemInstruction) {
      contents.push({
        role: 'user',
        parts: [{ text: `[System Context/Instruction: ${systemInstruction}]` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will act according to this context and language.' }]
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      // Retry on rate-limit or server overload
      if ((response.status === 429 || response.status === 503) && attempt < retries) {
        const backoffMs = attempt * 1500; // 1.5s, 3s, 4.5s
        console.warn(`Gemini API rate-limited (${response.status}). Retrying in ${backoffMs}ms (attempt ${attempt}/${retries})...`);
        await this.sleep(backoffMs);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const candidate = data.candidates && data.candidates[0];
      if (candidate && candidate.content && candidate.content.parts) {
        return candidate.content.parts.map(p => p.text).join('\n');
      }

      throw new Error('Empty response from Gemini API');
    }

    throw new Error('Gemini API unavailable after retries.');
  }

  async getAdvisory({ commodity, market, state, currentPrice, forecastPrice, expectedChange, horizon = 7, action = 'WAIT', language = 'English' }) {
    const cacheKey = `advisory||${commodity}||${market}||${horizon}||${language}`;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }

    let langInstruction = `Respond in English.`;
    if (language && language !== 'English') {
      langInstruction = `CRITICAL INSTRUCTION: You MUST write the ENTIRE advisory response in fluent, natural ${language} script (e.g. Hindi in Devanagari, Telugu in Telugu script, Tamil in Tamil script, etc.). Use simple, respectful, and crystal-clear agricultural terminology that a rural Indian farmer easily understands.`;
    }

    const prompt = `You are a senior Indian agricultural market analyst and agronomist. 
Analyze this specific mandi forecast for an Indian farmer or trader:
- Commodity: ${commodity}
- Mandi / Market: ${market} (${state || 'India'})
- Current Live Modal Price: ₹${currentPrice}/quintal
- ${horizon}-Day ML Target Price: ₹${forecastPrice}/quintal (${expectedChange >= 0 ? '+' : ''}${expectedChange}% projected movement)
- ML Model Recommended Action: ${action}
- Language: ${language}

${langInstruction}

Provide an actionable, realistic, and practical advisory broken down into 3 clear sections:
1. "Strategic Verdict": (1-2 sentences on holding vs selling vs phased liquidation)
2. "Key Market Drivers": (2 concise bullet points explaining seasonality, crop perishability, and arrival pressures)
3. "Risk Management Tip": (1 practical recommendation on storage, moisture/grade preservation, or local transport cost offset)

Keep the tone encouraging, professional, and directly useful for farmers.`;

    try {
      const commentary = await this.callGemini(prompt);
      const result = {
        status: 'success',
        commodity,
        market,
        language,
        action,
        commentary,
        model: this.model,
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (err) {
      console.error('Gemini advisory error:', err.message);

      // Multilingual fallback messages for farmers
      const fallbackTexts = {
        Hindi: `**रणनीतिक सलाह:** ${action === 'WAIT' ? 'मंडी आवक घटने के कारण स्टॉक रोकें और ऊंची कीमत का इंतजार करें।' : action === 'SELL' ? 'बाजार गिरावट की आशंका में चरणबद्ध तरीके से फसल बेचें।' : 'स्थानीय आवक पर नजर रखें और लचीली बिक्री रणनीति अपनाएं।'}\n\n**प्रमुख बाजार कारक:**\n• ${horizon} दिनों में ${expectedChange >= 0 ? '+' : ''}${expectedChange}% मूल्य परिवर्तन का अनुमान।\n• वर्तमान भाव ₹${currentPrice}/क्विंटल से लक्ष्य ₹${forecastPrice}/क्विंटल।\n\n**जोखिम प्रबंधन:** फसल की गुणवत्ता बनाए रखें और उचित भंडारण सुनिश्चित करें।`,
        Telugu: `**వ్యూహాత్మక సలహా:** ${action === 'WAIT' ? 'మండి రాకలు తగ్గడంతో నిల్వ చేసి మంచి ధర కోసం వేచి ఉండండి।' : action === 'SELL' ? 'ధర తగ్గే అవకాశం ఉన్నందున దశలవారీగా అమ్మండి।' : 'స్థానిక మార్కెట్ పరిస్థితులను గమనిస్తూ వ్యూహాత్మకంగా వ్యవహరించండి।'}\n\n**ముఖ్య మార్కెట్ అంశాలు:**\n• ${horizon} రోజుల్లో ${expectedChange >= 0 ? '+' : ''}${expectedChange}% ధర మార్పు అంచనా।\n• ప్రస్తుత ధర ₹${currentPrice}/క్వింటాల్ నుండి లక్ష్యం ₹${forecastPrice}/క్వింటాల్।\n\n**రిస్క్ మేనేజ్‌మెంట్:** పంట నాణ్యత నిర్వహించి, సరైన నిల్వ చేయండి।`,
        Tamil: `**மூலோபாய ஆலோசனை:** ${action === 'WAIT' ? 'வரத்து குறையும் நிலையில் கையிருப்பை தக்கவைத்து நல்ல விலை பெறுங்கள்.' : action === 'SELL' ? 'விலை வீழ்ச்சியை தடுக்க படிப்படியாக விற்பனை செய்யுங்கள்.' : 'உள்ளூர் சந்தை நிலவரத்தை கவனமாக கண்காணியுங்கள்.'}\n\n**சந்தை காரணிகள்:**\n• ${horizon} நாட்களில் ${expectedChange >= 0 ? '+' : ''}${expectedChange}% விலை மாற்றம் எதிர்பார்க்கப்படுகிறது.\n• தற்போதைய விலை ₹${currentPrice}/குவிண்டால் இலக்கு ₹${forecastPrice}/குவிண்டால்.\n\n**ரிஸ்க் மேலாண்மை:** தரமான சேமிப்பை உறுதிசெய்யுங்கள்.`,
        Gujarati: `**વ્યૂહાત્મક સલાહ:** ${action === 'WAIT' ? 'મંડી આવક ઘટવાથી સ્ટોક રાખો અને સારા ભાવ મળવાની રાહ જુઓ.' : action === 'SELL' ? 'ભાવ ઘટવાની શક્યતાને ધ્યાને લઈ તબક્કાવાર વેચાણ કરો.' : 'સ્થાનિક બજારની ગતિવિધિ પર નજર રાખો.'}\n\n**મુખ્ય બજાર પરિબળો:**\n• ${horizon} દિવસોમાં ${expectedChange >= 0 ? '+' : ''}${expectedChange}% ભાવ ફેરફાર અંદાજ.\n• હાલ ₹${currentPrice}/ક્વિન્ટલ, લક્ષ્ય ₹${forecastPrice}/ક્વિન્ટલ.\n\n**જોખમ વ્યવસ્થાપન:** ગુણવત્તા જળવાય તે માટે સૂક્ષ્મ સ્ટોરેજ સૌ પ્રથમ.`
      };

      const fallbackMsg = fallbackTexts[language] ||
        `Strategic Verdict: ${action === 'WAIT' ? 'Hold stock for higher market realization as wholesale mandi arrivals tighten.' : action === 'SELL' ? 'Consider phased liquidation to protect against anticipated market price declines.' : 'Monitor local arrivals closely and maintain flexible sales batches.'}\n\nKey Market Drivers:\n• Expected ${expectedChange >= 0 ? '+' : ''}${expectedChange}% movement over ${horizon} days based on historical mandi arrivals.\n• Modal benchmark at ₹${currentPrice}/quintal targeting ₹${forecastPrice}/quintal.\n\nRisk Management Tip: Ensure quality grading and dry storage to prevent post-harvest spoilage during holding periods.`;

      return {
        status: 'fallback',
        commodity,
        market,
        language,
        action,
        commentary: fallbackMsg,
        model: `Rule Engine (${language})`
      };
    }
  }

  async chat({ message, context = {}, language = 'English' }) {
    let langInstruction = '';
    if (language && language !== 'English') {
      langInstruction = `Always reply in fluent ${language} script with simple agricultural language for Indian farmers.`;
    }

    const systemPrompt = `You are "Mandi AI", an intelligent agricultural market copilot for AgriPrice Tracker.
You help Indian farmers, agri-traders, and market aggregators make data-backed buying, selling, and holding decisions across 1,600+ Indian APMC mandis.
Current active user context:
- Selected Commodity: ${context.commodity || 'Tomato'}
- Selected Mandi: ${context.market || 'Adilabad(Rythu Bazar)'}
- Current Modal Price: ₹${context.currentPrice || '2000'}/quintal
- 7-Day Target: ₹${context.forecastPrice || '2800'}/quintal
${langInstruction}
Provide concise, courteous, and actionable insights in INR (₹/quintal or ₹/kg).`;

    try {
      const reply = await this.callGemini(message, systemPrompt);
      return {
        status: 'success',
        reply,
        language,
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      console.error('Gemini chat error:', err.message);
      const isQuotaError = err.message.includes('429') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED');
      const commodity = context.commodity || 'selected crop';
      const market = context.market || 'selected mandi';
      const currentPrice = context.currentPrice || 'the current modal price';
      const forecastPrice = context.forecastPrice || 'the forecast target';

      return {
        status: 'fallback',
        reply: isQuotaError
          ? `Mandi AI is temporarily using local market guidance because the Gemini daily limit has been reached. For ${commodity} in ${market}, compare the current modal price of ₹${currentPrice}/quintal with the forecast target of ₹${forecastPrice}/quintal, sell in batches, and watch fresh arrivals before committing your full stock.`
          : `Mandi AI is temporarily unavailable. For ${commodity} in ${market}, review the current modal price of ₹${currentPrice}/quintal against the forecast target of ₹${forecastPrice}/quintal, then use phased selling and monitor local arrivals.`
      };
    }
  }

  async fetchTTSAudio({ text, tl = 'en' }) {
    // Clean text of markdown
    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/[#•►▶]/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();

    // Chunk text by sentences/phrases (Google TTS max ~180 chars per chunk)
    const sentences = cleanText.match(/[^.!?।\n]+[.!?।\n]*/g) || [cleanText];
    const chunks = [];
    let current = '';

    for (const s of sentences) {
      if ((current + ' ' + s).length < 180) {
        current = (current + ' ' + s).trim();
      } else {
        if (current) chunks.push(current);
        current = s.trim();
        while (current.length >= 180) {
          chunks.push(current.slice(0, 170));
          current = current.slice(170);
        }
      }
    }
    if (current) chunks.push(current);

    const audioBuffers = [];
    for (const chunk of chunks.slice(0, 8)) { // limit up to 8 chunks
      if (!chunk.trim()) continue;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(tl)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        if (res.ok) {
          const ab = await res.arrayBuffer();
          audioBuffers.push(Buffer.from(ab));
        }
      } catch (e) {
        console.warn('TTS chunk fetch failed:', e.message);
      }
    }

    if (audioBuffers.length === 0) {
      throw new Error('Failed to generate audio chunks');
    }

    return Buffer.concat(audioBuffers);
  }

  async textToSpeech({ text, language = 'English', bcp47 = 'en-IN' }) {
    const tlMap = {
      'English': 'en',
      'Hindi': 'hi',
      'Telugu': 'te',
      'Tamil': 'ta',
      'Kannada': 'kn',
      'Marathi': 'mr',
      'Gujarati': 'gu',
      'Punjabi': 'pa',
      'Bengali': 'bn'
    };
    const tl = tlMap[language] || (bcp47 ? bcp47.split('-')[0] : 'en');
    const audioBuffer = await this.fetchTTSAudio({ text, tl });
    return {
      status: 'success',
      language,
      tl,
      audioBase64: audioBuffer.toString('base64'),
      mimeType: 'audio/mpeg'
    };
  }
}

module.exports = new GeminiService();

