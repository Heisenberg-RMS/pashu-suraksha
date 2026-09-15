/**
 * Pashu Suraksha - Veterinary Chatbot UI Controller ("Pashu AI Sahayak")
 * Supports both dedicated full-page Tab View (#view-chat) and Floating Drawer (#chatDrawer).
 * Provides interactive quick-question chips, multilingual TTS speech playback,
 * typing indicators, and seamless fallback to rule-based veterinary triage when offline.
 */

class VeterinaryChatbotManager {
  constructor() {
    this.isOpen = false;
    this.currentLanguage = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';
    this.messages = [];
    this.viewGreetingRendered = false;
    this.drawerGreetingRendered = false;

    // Localized Greetings & Quick Prompts
    this.greetingsConfig = {
      hi: {
        botName: 'पशु एआई सहायक (Pashu AI Sahayak)',
        greeting: 'नमस्ते! मैं पशु स्वास्थ्य एवं रोग निवारण सहायक हूँ। आप मुझसे पशु रोगों के लक्षण, प्राथमिक उपचार, टीकाकरण, अफारा, थनैला या दवाइयों के बारे में कभी भी पूछ सकते हैं।',
        prompts: [
          { text: '🐮 मुंह और खुर में छाले (FMD)', query: 'गाय के मुंह और खुर में छाले हैं क्या करें?' },
          { text: '⚪ लम्पी स्किन रोग रोकथाम', query: 'लम्पी स्किन रोग से बचाव व उपचार' },
          { text: '⚠️ अफारा (पेट फूलना)', query: 'पशु का पेट फूलने (अफारा) का तुरंत उपचार' },
          { text: '🧣 गलघोंटू (HS) के लक्षण', query: 'गलघोंटू रोग के लक्षण और बचाव' },
          { text: '🔥 तेज बुखार और चारा न खाना', query: 'गाय को तेज बुखार है और चारा नहीं खा रही' },
          { text: '🥛 थनैला रोग (Mastitis)', query: 'थनैला रोग का प्राथमिक उपचार' },
          { text: '💉 टीकाकरण समय-सारिणी', query: 'पशु टीकाकरण कैलेंडर' }
        ]
      },
      mr: {
        botName: 'पशु एआय सहाय्यक (Pashu AI Sahayak)',
        greeting: 'नमस्कार! मी पशु आरोग्य व रोग प्रतिबंधक सहाय्यक आहे. आपण मला जनावरांचे आजार, लक्षणे, प्रथमोपचार, लाळ्या-खुरकूत, लंपी, पोटफुगी किंवा लसीकरणाविषयी कधीही विचारू शकता.',
        prompts: [
          { text: '🐮 लाळ्या खुरकूत (FMD)', query: 'गाय आणि म्हशीच्या तोंडात फोड व लाळ गळणे (लाळ्या खुरकूत)' },
          { text: '⚪ लंपी चर्मरोग प्रतिबंध', query: 'लंपी चर्मरोग प्रतिबंध आणि काळजी' },
          { text: '⚠️ पोट फुगणे / अफारा', query: 'पशुचे पोट फुगणे तात्काळ उपाय' },
          { text: '🧣 घटसर्प (HS) लक्षणे', query: 'घटसर्प रोगाची लक्षणे व काळजी' },
          { text: '🔥 ताप व चारा न खाणे', query: 'गायीला ताप आला आहे आणि चारा खात नाही' },
          { text: '🥛 मस्टायटिस (स्तनदाह)', query: 'स्तनदाह किंवा थनैला आजार उपाय' },
          { text: '💉 लसीकरण वेळापत्रक', query: 'पशु लसीकरण वेळापत्रक' }
        ]
      },
      te: {
        botName: 'పశు AI సహాయక్ (Pashu AI Sahayak)',
        greeting: 'నమస్కారం! నేను పశు ఆరోగ్య మరియు వ్యాధి నివారణ సహాయకుడిని. పశువుల వ్యాధులు, లక్షణాలు, ప్రథమ చికిత్స, గాలికుంటు, లంపి చర్మ వ్యాధి, కడుపు ఉబ్బరం లేదా టీకాల గురించి ఎప్పుడైనా నన్ను అడగవచ్చు.',
        prompts: [
          { text: '🐮 గాలికుంటు వ్యాధి (FMD)', query: 'ఆవు నోటిలో మరియు గిట్టలలో పుండ్లు ఉన్నాయి ఏం చేయాలి?' },
          { text: '⚪ లంపి చర్మ వ్యాధి రక్షణ', query: 'లంపి చర్మ వ్యాధి నివారణ మరియు సంరక్షణ' },
          { text: '⚠️ కడుపు ఉబ్బరం (Bloat)', query: 'పశువుకు కడుపు ఉబ్బరం వచ్చినప్పుడు తక్షణ ప్రథమ చికిత్స' },
          { text: '🧣 గొంతువాపు వ్యాధి (HS)', query: 'గొంతువాపు వ్యాధి లక్షణాలు మరియు నివారణ' },
          { text: '🔥 తీవ్రమైన జ్వరం', query: 'ఆవుకు ఎక్కువ జ్వరం వచ్చి మేత మేయడం లేదు' },
          { text: '🥛 పొదుగువాపు వ్యాధి', query: 'పొదుగువాపు వ్యాధి ప్రథమ చికిత్స' },
          { text: '💉 టీకాల క్యాలెండర్', query: 'పశువుల టీకాల షెడ్యూల్' }
        ]
      },
      en: {
        botName: 'Pashu AI Sahayak (Veterinary Assistant)',
        greeting: 'Hello! I am Pashu AI Sahayak, your intelligent veterinary first-aid and livestock health assistant. Ask me anytime about livestock symptoms, emergency first-aid, vaccines, bloat, or biosecurity protocols.',
        prompts: [
          { text: '🐮 Foot & Mouth Disease (FMD)', query: 'Cow has mouth vesicles and hoof sores (FMD treatment)' },
          { text: '⚪ Lumpy Skin Disease (LSD)', query: 'Lumpy skin disease prevention and supportive care' },
          { text: '⚠️ Acute Ruminal Bloat', query: 'Immediate emergency relief for cattle bloat' },
          { text: '🧣 Hemorrhagic Septicemia (HS)', query: 'Hemorrhagic Septicemia symptoms and immediate action' },
          { text: '🔥 High Fever & Anorexia', query: 'Cow has high fever and has stopped eating' },
          { text: '🥛 Bovine Mastitis Care', query: 'First-aid protocol for acute mastitis and swollen udder' },
          { text: '💉 Vaccination Calendar', query: 'Recommended livestock vaccination schedule' }
        ]
      }
    };
  }

  init() {
    this.setupEventListeners();
    this.renderAllGreetings();

    // Listen for global language switch
    window.addEventListener('languageChanged', (e) => {
      const newLang = (e && e.detail && e.detail.language) ? e.detail.language : ((window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi');
      this.setLanguage(newLang);
    });
  }

  setLanguage(lang) {
    if (!lang) return;
    this.currentLanguage = lang;

    // Sync dropdowns
    const drawerLangSelect = document.getElementById('chatLanguageSelect');
    if (drawerLangSelect) drawerLangSelect.value = lang;

    const viewLangSelect = document.getElementById('chatViewLanguageSelect');
    if (viewLangSelect) viewLangSelect.value = lang;

    // Re-render initial greeting if no active user chat or refresh greeting
    this.renderAllGreetings(true);
  }

  setupEventListeners() {
    const floatBtn = document.getElementById('chatFloatBtn');
    const closeBtn = document.getElementById('chatDrawerCloseBtn');
    const sendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatTextInput');
    const viewSendBtn = document.getElementById('chatViewSendBtn');
    const viewInput = document.getElementById('chatViewTextInput');

    if (floatBtn) {
      floatBtn.onclick = () => this.toggleChat();
    }

    if (closeBtn) {
      closeBtn.onclick = () => this.closeChat();
    }

    if (sendBtn) {
      sendBtn.onclick = () => this.sendMessage();
    }

    if (chatInput) {
      chatInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessage();
        }
      };
    }

    if (viewSendBtn) {
      viewSendBtn.onclick = () => this.sendMessageFromView();
    }

    if (viewInput) {
      viewInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.sendMessageFromView();
        }
      };
    }
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    const drawer = document.getElementById('chatDrawer');
    const floatBtn = document.getElementById('chatFloatBtn');
    if (drawer) drawer.classList.add('open');
    if (floatBtn) floatBtn.style.display = 'none';
    this.isOpen = true;

    setTimeout(() => {
      document.getElementById('chatTextInput')?.focus();
    }, 200);
  }

  closeChat() {
    const drawer = document.getElementById('chatDrawer');
    const floatBtn = document.getElementById('chatFloatBtn');
    if (drawer) drawer.classList.remove('open');
    if (floatBtn) floatBtn.style.display = 'flex';
    this.isOpen = false;
    if (window.VoiceManager && window.VoiceManager.stop) {
      window.VoiceManager.stop();
    }
  }

  renderAllGreetings(force = false) {
    this.renderInitialGreeting('chatMessagesThread', force);
    this.renderInitialGreeting('chatViewMessagesThread', force);
  }

  renderViewGreetingIfNeeded() {
    const viewThread = document.getElementById('chatViewMessagesThread');
    if (viewThread && (!viewThread.children || viewThread.children.length === 0)) {
      this.renderInitialGreeting('chatViewMessagesThread', true);
    }
  }

  renderInitialGreeting(containerId, force = false) {
    const thread = document.getElementById(containerId);
    if (!thread) return;

    // If conversation already underway and not forced, retain history
    if (!force && thread.children && thread.children.length > 0) return;

    const conf = this.greetingsConfig[this.currentLanguage] || this.greetingsConfig.hi;

    const promptsHtml = conf.prompts.map(p => `
      <span class="quick-prompt" onclick="window.ChatbotManager.sendUserQuery(decodeURIComponent('${encodeURIComponent(p.query)}'))">
        ${this.escapeHtml(p.text)}
      </span>
    `).join('');

    thread.innerHTML = `
      <div class="chat-bubble bot">
        <div class="bubble-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
          <span class="bubble-sender" style="font-weight:700; color:#0f766e;">🤖 ${conf.botName}</span>
          <button class="btn-bubble-tts" onclick="window.ChatbotManager.speakText(this)" data-text="${encodeURIComponent(conf.greeting)}" style="background:none; border:none; color:#0f766e; cursor:pointer; font-size:0.8rem; font-weight:600;">
            🔊 सुनें (Listen)
          </button>
        </div>
        <div class="bubble-text" style="line-height:1.5;">
          ${conf.greeting}
        </div>
        <div style="font-size:0.75rem; font-weight:700; color:#64748b; margin-top:0.75rem; text-transform:uppercase;">
          ⚡ Quick Questions (त्वरित प्रश्न):
        </div>
        <div class="bubble-quick-prompts" style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.35rem;">
          ${promptsHtml}
        </div>
      </div>
    `;
  }

  sendUserQuery(text) {
    const drawerInput = document.getElementById('chatTextInput');
    const viewInput = document.getElementById('chatViewTextInput');
    if (drawerInput) drawerInput.value = text;
    if (viewInput) viewInput.value = text;
    this.executeSendMessage(text);
  }

  sendMessage() {
    const input = document.getElementById('chatTextInput');
    const text = input ? input.value.trim() : '';
    if (!text) return;
    input.value = '';
    this.executeSendMessage(text);
  }

  sendMessageFromView() {
    const input = document.getElementById('chatViewTextInput');
    const text = input ? input.value.trim() : '';
    if (!text) return;
    input.value = '';
    this.executeSendMessage(text);
  }

  async executeSendMessage(text) {
    if (!text) return;

    // Clear both inputs
    const drawerInput = document.getElementById('chatTextInput');
    const viewInput = document.getElementById('chatViewTextInput');
    if (drawerInput) drawerInput.value = '';
    if (viewInput) viewInput.value = '';

    // Append user message to both threads
    this.appendUserMessage(text);

    // Show typing indicators in both threads
    const typingIds = this.showTypingIndicator();

    try {
      // Check for Gemini API key if present in sessionStorage or window
      const sessionKey = sessionStorage.getItem('gemini_api_key') || '';

      const headers = { 'Content-Type': 'application/json' };
      if (sessionKey) {
        headers['X-Gemini-API-Key'] = sessionKey;
      }

      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: text,
          language: this.currentLanguage,
          api_key: sessionKey
        })
      });

      const data = await res.json();
      this.removeTypingIndicator(typingIds);

      if (data && data.success) {
        this.appendBotReply(data);
      } else {
        this.appendBotReply({
          title: "Pashu AI",
          reply: data.reply || "सॉरी, मुझे आपकी बात समझ नहीं आई। कृपया लक्षण स्पष्ट लिखें जैसे: 'गाय को बुखार है' या 'मुंह में छाले'।",
          suggested_questions: ["गाय को बुखार है", "लम्पी स्किन रोग", "अफारा का इलाज"]
        });
      }
    } catch (err) {
      console.error('Chatbot API request error:', err);
      this.removeTypingIndicator(typingIds);
      this.appendBotReply({
        title: "Pashu AI Offline Triage",
        reply: "⚠️ सर्वर से संपर्क नहीं हो पाया। आपात स्थिति में निकटतम पशु चिकित्सालय (Dispensary) से संपर्क करें या 1962 टोल-फ्री हेल्पलाइन डायल करें।",
        suggested_questions: ["1962 हेल्पलाइन", "निकटतम पशु डॉक्टर"]
      });
    }
  }

  appendUserMessage(text) {
    const threads = [
      document.getElementById('chatMessagesThread'),
      document.getElementById('chatViewMessagesThread')
    ].filter(Boolean);

    threads.forEach(thread => {
      const div = document.createElement('div');
      div.className = 'chat-bubble user';
      div.style.alignSelf = 'flex-end';
      div.innerHTML = `<div class="bubble-text" style="line-height:1.4;">${this.escapeHtml(text)}</div>`;
      thread.appendChild(div);
      thread.scrollTop = thread.scrollHeight;
    });
  }

  appendBotReply(data) {
    const threads = [
      document.getElementById('chatMessagesThread'),
      document.getElementById('chatViewMessagesThread')
    ].filter(Boolean);

    // Format markdown-like bold text & bullet points
    let formattedReply = this.escapeHtml(data.reply || '')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\n/g, '<br>');

    let quickPillsHtml = '';
    if (data.suggested_questions && data.suggested_questions.length > 0) {
      quickPillsHtml = `
        <div class="bubble-quick-prompts" style="margin-top:0.6rem; display:flex; flex-wrap:wrap; gap:0.4rem;">
          ${data.suggested_questions.map(q => `
            <span class="quick-prompt" onclick="window.ChatbotManager.sendUserQuery(decodeURIComponent('${encodeURIComponent(q)}'))">
              ${this.escapeHtml(q)}
            </span>
          `).join('')}
        </div>
      `;
    }

    threads.forEach(thread => {
      const div = document.createElement('div');
      div.className = 'chat-bubble bot';
      div.innerHTML = `
        <div class="bubble-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
          <span class="bubble-sender" style="font-weight:700; color:#0f766e;">🤖 ${this.escapeHtml(data.title || 'Pashu AI')}</span>
          <button class="btn-bubble-tts" onclick="window.ChatbotManager.speakText(this)" data-text="${encodeURIComponent(data.reply || '')}" style="background:none; border:none; color:#0f766e; cursor:pointer; font-size:0.8rem; font-weight:600;">
            🔊 सुनें (Listen)
          </button>
        </div>
        <div class="bubble-text" style="line-height:1.5;">${formattedReply}</div>
        ${quickPillsHtml}
      `;

      thread.appendChild(div);
      thread.scrollTop = thread.scrollHeight;
    });
  }

  speakText(btn) {
    const rawText = decodeURIComponent(btn.dataset.text || '');
    if (!rawText) return;

    // Multilingual speech voice code
    const langMap = {
      'hi': 'hi-IN',
      'mr': 'mr-IN',
      'te': 'te-IN',
      'en': 'en-IN'
    };
    const bcpCode = langMap[this.currentLanguage] || 'hi-IN';

    if (window.VoiceManager && window.VoiceManager.togglePlayback) {
      window.VoiceManager.togglePlayback(rawText, bcpCode);
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(rawText.replace(/<[^>]*>/g, ''));
      utterance.lang = bcpCode;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  showTypingIndicator() {
    const ids = [];
    const threads = [
      document.getElementById('chatMessagesThread'),
      document.getElementById('chatViewMessagesThread')
    ].filter(Boolean);

    threads.forEach((thread, idx) => {
      const id = 'typing_' + Date.now() + '_' + idx;
      ids.push(id);
      const div = document.createElement('div');
      div.id = id;
      div.className = 'chat-bubble bot typing-indicator';
      div.innerHTML = `<span></span><span></span><span></span>`;
      thread.appendChild(div);
      thread.scrollTop = thread.scrollHeight;
    });

    return ids;
  }

  removeTypingIndicator(ids) {
    if (!ids || !ids.length) return;
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

window.ChatbotManager = new VeterinaryChatbotManager();
