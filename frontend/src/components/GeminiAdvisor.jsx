import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, Bot, Send, Volume2, VolumeX,
  RefreshCw, Globe, Check, PlayCircle, StopCircle,
  AudioLines, Radio, Play, Pause
} from 'lucide-react';
import { fetchGeminiAdvisory, sendGeminiChat } from '../services/api';

const SUPPORTED_LANGUAGES = [
  {
    code: 'English', native: 'English', flag: '🇬🇧',
    tl: 'en', bcp47: 'en-IN',
    voiceHints: ['en-IN', 'en-US', 'en-GB'],
    rate: 0.92
  },
  {
    code: 'Hindi', native: 'हिंदी', flag: '🇮🇳',
    tl: 'hi', bcp47: 'hi-IN',
    voiceHints: ['hi-IN', 'hi'],
    rate: 0.88
  },
  {
    code: 'Telugu', native: 'తెలుగు', flag: '🌿',
    tl: 'te', bcp47: 'te-IN',
    voiceHints: ['te-IN', 'te'],
    rate: 0.88
  },
  {
    code: 'Tamil', native: 'தமிழ்', flag: '🌺',
    tl: 'ta', bcp47: 'ta-IN',
    voiceHints: ['ta-IN', 'ta'],
    rate: 0.88
  },
  {
    code: 'Kannada', native: 'ಕನ್ನಡ', flag: '🌻',
    tl: 'kn', bcp47: 'kn-IN',
    voiceHints: ['kn-IN', 'kn'],
    rate: 0.88
  },
  {
    code: 'Marathi', native: 'मराठी', flag: '🏔️',
    tl: 'mr', bcp47: 'mr-IN',
    voiceHints: ['mr-IN', 'mr'],
    rate: 0.88
  },
  {
    code: 'Gujarati', native: 'ગુજરાતી', flag: '💫',
    tl: 'gu', bcp47: 'gu-IN',
    voiceHints: ['gu-IN', 'gu'],
    rate: 0.88
  },
  {
    code: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🌾',
    tl: 'pa', bcp47: 'pa-IN',
    voiceHints: ['pa-IN', 'pa'],
    rate: 0.88
  },
  {
    code: 'Bengali', native: 'বাংলা', flag: '🐯',
    tl: 'bn', bcp47: 'bn-IN',
    voiceHints: ['bn-IN', 'bn'],
    rate: 0.88
  }
];

export default function GeminiAdvisor({
  commodity = 'Tomato',
  market = 'Rajkot(Veg.Sub Yard)',
  state = 'Gujarat',
  currentPrice = 2000,
  forecastPrice = 2800,
  expectedChange = 40.0,
  horizon = 7,
  action = 'WAIT'
}) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [advisory, setAdvisory] = useState(null);
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const audioPlayerRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // ── Greetings per language
  useEffect(() => {
    const greetings = {
      English: `Hello! I am Mandi AI powered by Google Gemini. Ask me anything about ${commodity} pricing in ${market}!`,
      Hindi: `नमस्ते! मैं मंडी AI हूँ। ${market} में ${commodity} के भाव, कब बेचें, और भंडारण की सलाह हिंदी में पूछें।`,
      Telugu: `నమస్కారం! నేను మండి ఏఐ. ${market} లో ${commodity} ధరల గురించి తెలుగులో ఏదైనా అడగండి!`,
      Tamil: `வணக்கம்! நான் மண்டி AI. ${market} சந்தையில் ${commodity} விலை நிலவரம் பற்றி தமிழில் கேட்கலாம்!`,
      Kannada: `ನಮಸ್ಕಾರ! ನಾನು ಮಂಡಿ AI. ${market} ಮಾರುకಟ್ಟೆಯಲ್ಲಿ ${commodity} ಬೆಲೆ ಬಗ್ಗೆ ಕನ್ನಡದಲ್ಲಿ ಕೇಳಿ!`,
      Marathi: `नमस्कार! मी मंडी AI आहे. ${market} मध्ये ${commodity} च्या भावाबद्दल मराठीत विचारा!`,
      Gujarati: `નમસ્તે! હું મંડી AI છું. ${market} માં ${commodity} ના ભાવ બાબત ગુજરાતીમાં પૂછો!`,
      Punjabi: `ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਮੰਡੀ AI ਹਾਂ। ${market} ਮੰਡੀ ਵਿੱਚ ${commodity} ਦੇ ਭਾਅ ਬਾਰੇ ਪੁੱਛੋ!`,
      Bengali: `নমস্কার! আমি মান্ডি AI। ${market} বাজারে ${commodity}-র দাম সম্পর্কে বাংলায় জিজ্ঞেস করুন!`
    };
    setChatMessages([{ sender: 'ai', text: greetings[selectedLanguage] || greetings.English }]);
  }, [selectedLanguage, commodity, market]);

  // ── Bulletproof Audio Stop Controller
  const stopAudio = useCallback(() => {
    setIsPlayingAudio(false);
    setAudioLoading(false);

    // 1. Immediately halt and reset HTML5 Audio element
    if (audioPlayerRef.current) {
      try {
        const audio = audioPlayerRef.current;
        audio.pause();
        audio.currentTime = 0;
        audio.oncanplay = null;
        audio.onended = null;
        audio.onerror = null;
        audio.src = '';
      } catch (e) {
        console.warn('Error pausing HTML5 audio:', e);
      }
    }

    // 2. Immediately cancel any SpeechSynthesis utterances
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Error cancelling speech synthesis:', e);
      }
    }
  }, []);

  // Stop audio on unmount or language change
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // ── Load advisory when params change
  const loadAdvisory = useCallback(async () => {
    stopAudio();
    setLoadingAdvisory(true);
    try {
      const data = await fetchGeminiAdvisory({
        commodity, market, state,
        currentPrice, forecastPrice, expectedChange,
        horizon, action, language: selectedLanguage
      });
      setAdvisory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdvisory(false);
    }
  }, [commodity, market, state, currentPrice, forecastPrice, expectedChange, horizon, action, selectedLanguage, stopAudio]);

  useEffect(() => {
    if (commodity && market && currentPrice) loadAdvisory();
  }, [loadAdvisory]);

  // ── Universal High-Quality Audio Playback
  const playNativeAudio = (textToPlay) => {
    // If audio is currently active or loading, toggle it OFF immediately
    if (isPlayingAudio || audioLoading) {
      stopAudio();
      return;
    }

    // Ensure all prior audio is completely halted
    stopAudio();

    const rawText = textToPlay || advisory?.commentary || '';
    if (!rawText.trim()) return;

    setAudioLoading(true);

    const cleanText = rawText
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/[#•►▶]/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();

    const audioUrl = `/api/gemini/tts-audio?text=${encodeURIComponent(cleanText)}&tl=${currentLangConfig.tl}`;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
    }

    const audio = audioPlayerRef.current;
    audio.src = audioUrl;

    audio.oncanplay = () => {
      setAudioLoading(false);
      audio.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(err => {
        console.warn('HTML5 Audio playback interrupted, attempting Web Speech:', err);
        fallbackWebSpeech(cleanText);
      });
    };

    audio.onended = () => {
      setIsPlayingAudio(false);
      setAudioLoading(false);
    };

    audio.onerror = () => {
      console.warn('Backend audio stream unavailable, falling back to browser speech');
      fallbackWebSpeech(cleanText);
    };

    audio.load();
  };

  const fallbackWebSpeech = (cleanText) => {
    setAudioLoading(false);
    if (!('speechSynthesis' in window)) {
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLangConfig.bcp47;
    utterance.rate = currentLangConfig.rate || 0.88;

    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find(v => v.lang.startsWith(currentLangConfig.tl) || v.lang.includes(selectedLanguage.toLowerCase()));
    if (matched) utterance.voice = matched;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // ── Send chat message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || sendingChat) return;
    const userText = inputMsg.trim();
    setInputMsg('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setSendingChat(true);
    try {
      const res = await sendGeminiChat({
        message: userText,
        context: { commodity, market, currentPrice, forecastPrice, expectedChange },
        language: selectedLanguage
      });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.reply || 'Analysis completed.' }]);
    } catch {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Error connecting to Gemini. Please try again.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-white">AI Farmer Advisory</h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● Multilingual Voice &amp; Text
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live generative market advice with native audio in 9 Indian languages
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* PRIMARY HIGH-QUALITY AUDIO LISTEN BUTTON */}
          <button
            onClick={() => playNativeAudio()}
            disabled={loadingAdvisory || !advisory?.commentary || audioLoading}
            className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 transition shadow-md select-none ${
              isPlayingAudio
                ? 'bg-rose-500/25 text-rose-300 border-rose-500/40 shadow-rose-500/10 animate-pulse'
                : audioLoading
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold border-transparent shadow-emerald-500/20'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={`Listen aloud in ${selectedLanguage} (${currentLangConfig.native})`}
          >
            {isPlayingAudio ? (
              <>
                <StopCircle className="w-4 h-4 text-rose-400" />
                <span>Stop Voice ({currentLangConfig.native})</span>
              </>
            ) : audioLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Loading Audio...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-slate-950" />
                <span>🔊 Listen ({currentLangConfig.native})</span>
              </>
            )}
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setShowChat(v => !v)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition text-xs font-semibold flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4 text-teal-400" />
            <span>{showChat ? 'Hide Chat' : 'Ask Mandi AI'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={loadAdvisory}
            disabled={loadingAdvisory}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh advisory"
          >
            <RefreshCw className={`w-4 h-4 ${loadingAdvisory ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── LANGUAGE PILLS ── */}
      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none relative z-10">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 pr-2 border-r border-slate-800 flex-shrink-0 whitespace-nowrap">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Language:</span>
        </div>
        {SUPPORTED_LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => { stopAudio(); setSelectedLanguage(lang.code); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 flex-shrink-0 ${
              selectedLanguage === lang.code
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold scale-105'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            <span>{lang.flag}</span>
            <span>{lang.native}</span>
            {selectedLanguage === lang.code && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
          </button>
        ))}
      </div>

      {/* ── ADVISORY CONTENT ── */}
      <div className="mt-3 relative z-10">
        {loadingAdvisory ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">
              Generating <strong>{selectedLanguage}</strong> advisory...
            </p>
          </div>
        ) : (
          <div className="relative group">
            <div className="prose prose-invert max-w-none text-sm text-slate-100 leading-relaxed whitespace-pre-line bg-slate-950/75 p-5 rounded-2xl border border-slate-800/90 shadow-inner font-sans">
              {advisory?.commentary || 'Generating agricultural market advisory...'}
            </div>

            {/* Floating Audio Play Bar inside advisory */}
            {advisory?.commentary && !loadingAdvisory && (
              <div className="mt-2.5 flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 border border-emerald-500/30 rounded-2xl">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => playNativeAudio()}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                      isPlayingAudio
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
                    }`}
                  >
                    {isPlayingAudio ? <StopCircle className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                  </button>
                  <div>
                    <span className="font-bold text-white text-xs block">
                      {isPlayingAudio ? '🔊 Playing Audio Readout' : `🔊 Audio Readout (${currentLangConfig.native})`}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {selectedLanguage} voice pronunciation enabled
                    </span>
                  </div>
                </div>

                {/* Animated sound wave bars */}
                {isPlayingAudio && (
                  <div className="flex items-center gap-1">
                    {[4, 10, 6, 14, 8, 12, 6, 10].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-emerald-400 rounded-full animate-bounce"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.08}s`, animationDuration: '0.6s' }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CHAT COPILOT ── */}
      {showChat && (
        <div className="mt-5 pt-4 border-t border-slate-800 space-y-3 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Bot className="w-4 h-4" /> Mandi AI · {currentLangConfig.flag} {selectedLanguage}
            </span>
            <span className="text-[11px] text-slate-500">Multilingual Voice &amp; Text enabled</span>
          </div>

          <div className="h-52 overflow-y-auto space-y-2 p-3 rounded-2xl bg-slate-950/85 border border-slate-800 text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium ml-auto'
                    : 'bg-slate-800/95 text-slate-100 border border-slate-700/60 whitespace-pre-line leading-relaxed'
                }`}>
                  {msg.text}
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => playNativeAudio(msg.text)}
                      className="ml-2 mt-1 inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 transition font-bold"
                      title={`Listen to message in ${selectedLanguage}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>🔊 వినండి / सुनें</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <div className="flex gap-0.5 items-end">
                  {[1,2,3].map(i => (
                    <span key={i} className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span>Mandi AI is thinking in {selectedLanguage}...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              placeholder={`Ask in ${selectedLanguage} — price, storage, best mandi...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputMsg.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          {/* Quick question pills */}
          <div className="flex flex-wrap gap-1.5">
            {(selectedLanguage === 'Hindi'
              ? ['अभी बेचूं या रुकूं?', 'कोल्ड स्टोरेज कैसे करें?', 'सबसे अच्छा मंडी कौन सा है?']
              : selectedLanguage === 'Telugu'
              ? ['ఇప్పుడు అమ్మాలా?', 'నిల్వ ఎలా చేయాలి?', 'మంచి మండి ఏది?']
              : selectedLanguage === 'Tamil'
              ? ['இப்போது விற்கலாமா?', 'சேமிப்பு முறை என்ன?', 'சிறந்த மண்டி எது?']
              : selectedLanguage === 'Gujarati'
              ? ['હવે વેચવું કે રાહ જોવી?', 'સ્ટોરેજ કેવી રીતે?', 'સૌથી સારી મંડી?']
              : selectedLanguage === 'Marathi'
              ? ['आता विकावे का थांबावे?', 'साठवणूक कशी करावी?', 'चांगली मंडी कोणती?']
              : ['Should I sell now?', 'Best storage tips?', 'Which mandi is better?']
            ).map((q, i) => (
              <button
                key={i}
                onClick={() => setInputMsg(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700/60 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
