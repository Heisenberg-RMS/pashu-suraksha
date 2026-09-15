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
        greeting: 'नमस्ते! मैं पशु स्वास्थ्य, पोषण एवं फार्म प्रबंधन सहायक हूँ। आप मुझसे पशु आहार (संतुलित दाना, साइलेज), नवजात बछड़े की देखभाल, गाभिन पशु की देखभाल, मद (गर्मी) के लक्षण व AI, मौसम अनुसार बाड़ा प्रबंधन तथा रोगों के प्राथमिक उपचार के बारे में कभी भी पूछ सकते हैं।',
        prompts: [
          { text: '🌾 संतुलित पशु आहार व साइलेज', query: 'दुधारू गाय के लिए संतुलित आहार और साइलेज कैसे तैयार करें?' },
          { text: '🍼 नवजात बछड़े की देखभाल व खीस', query: 'नवजात बछड़े को खीस कब और कितनी मात्रा में पिलानी चाहिए?' },
          { text: '🐄 गाभिन पशु की देखभाल व जेर', query: 'गाभिन गाय की देखभाल और जेर न रुकने के उपाय बताएं' },
          { text: '🧬 मद (गर्मी) के लक्षण व AI का समय', query: 'गाय के मद (गर्मी) के लक्षण क्या हैं और सीमन कब कराएं?' },
          { text: '☀️ गर्मी व सर्दी से पशु का बचाव', query: 'गर्मियों में लू से गाय का बचाव और बाड़ा प्रबंधन' },
          { text: '🥛 स्वच्छ दूध निकालने का सही तरीका', query: 'स्वच्छ दूध निकालने का सही तरीका और अंगूठा मोड़कर क्यों न दुहें?' },
          { text: '⚠️ गाय मिट्टी/प्लास्टिक क्यों खाती है?', query: 'गाय मिट्टी और प्लास्टिक खाती है इसका इलाज क्या है?' },
          { text: '🚨 अफारा / खुरपका / लम्पी उपचार', query: 'पशु का पेट फूलने (अफारा) व मुंहपका का तुरंत उपचार' }
        ]
      },
      mr: {
        botName: 'पशु एआय सहाय्यक (Pashu AI Sahayak)',
        greeting: 'नमस्कार! मी पशु आरोग्य, पोषण व गोठा व्यवस्थापन सहाय्यक आहे. आपण मला संतुलित पशुखाद्य, सायलेज निर्मिती, वासरांचे संगोपन, गाभण जनावरांची काळजी, माजाची लक्षणे व कृत्रिम रेतन, गोठा व्यवस्थापन आणि रोगांवरील प्रथमोपचाराबद्दल विचारू शकता.',
        prompts: [
          { text: '🌾 संतुलित खाद्य व सायलेज निर्मिती', query: 'जनावरांसाठी संतुलित पशुखाद्य आणि सायलेज कसे बनवावे?' },
          { text: '🍼 नवजात वासराची काळजी व चीक', query: 'वासरू जन्मल्यावर चीक दूध कधी व किती पाजावे?' },
          { text: '🐄 गाभण गाईची काळजी व प्रसूती', query: 'गाभण गाईची काळजी आणि विण्याची वेळ काय?' },
          { text: '🧬 माजाची लक्षणे व कृत्रिम रेतन', query: 'गाय माजावर आल्याची लक्षणे आणि कृत्रिम रेतन वेळ' },
          { text: '☀️ उन्हाळ्यात गोठा व्यवस्थापन', query: 'उन्हाळ्यात जनावरांची काळजी आणि गोठा व्यवस्थापन' },
          { text: '🥛 स्वच्छ दूध काढण्याची योग्य पद्धत', query: 'स्वच्छ दुग्ध उत्पादन आणि दूध काढण्याची योग्य पद्धत' },
          { text: '⚠️ जनावरे माती खाण्यावर उपाय', query: 'जनावरे माती खातात त्यावर काय उपाय करावा?' },
          { text: '🚨 लाळ्या खुरकूत / पोटफुगी उपचार', query: 'लाळ्या खुरकूत आणि पोट फुगणे यावर तात्काळ उपाय' }
        ]
      },
      te: {
        botName: 'పశు AI సహాయక్ (Pashu AI Sahayak)',
        greeting: 'నమస్కారం! నేను పశు ఆరోగ్య, పోషణ మరియు పాడి యాజమాన్య సహాయకుడిని. సమతుల్య దాణా, సైలేజ్ తయారీ, దూడల సంరక్షణ, చూడి పశువుల పోషణ, ఎద లక్షణాలు & AI సమయం, మరియు వ్యాధుల నివారణ గురించి నన్ను అడగవచ్చు.',
        prompts: [
          { text: '🌾 సమతుల్య దాణా & సైలేజ్ తయారీ', query: 'పాడి పశువుల సమతుల్య ఆహారం దాణా మరియు సైలేజ్ తయారీ విధానం' },
          { text: '🍼 దూడల సంరక్షణ & జున్ను పాలు', query: 'దూడకు జున్ను పాలు ఎప్పుడు ఎంత తాగించాలి?' },
          { text: '🐄 చూడి ఆవుల సంరక్షణ & ఈత', query: 'చూడి ఆవుల సంరక్షణ మరియు ఈత యాజమాన్యం' },
          { text: '🧬 ఎద లక్షణాలు & AI సరైన సమయం', query: 'ఆవులలో ఎద లక్షణాలు మరియు కృత్రిమ గర్భధారణ సమయం' },
          { text: '☀️ వేసవి ఎండదెబ్బ నివారణ', query: 'వేసవి ఎండదెబ్బ నివారణ మరియు కొట్టం యాజమాన్యం' },
          { text: '🥛 పరిశుభ్రమైన పాల ఉత్పత్తి', query: 'పరిశుభ్రమైన పాల ఉత్పత్తి మరియు పాలు పితికే పద్ధతి' },
          { text: '⚠️ ఆవు మట్టి తినే పైకా రోగం', query: 'ఆవు మట్టి తినే అలవాటు పైకా నివారణ' },
          { text: '🚨 గాలికుంటు / కడుపుబ్బరం చికిత్స', query: 'గాలికుంటు వ్యాధి మరియు కడుపుబ్బరం అత్యవసర చికిత్స' }
        ]
      },
      en: {
        botName: 'Pashu AI Sahayak (Veterinary & Dairy Husbandry Assistant)',
        greeting: 'Hello! I am Pashu AI Sahayak, your intelligent advisor for livestock rearing, dairy nutrition, farm management, and veterinary care. Ask me about balanced rations, silage making, calf colostrum, pregnancy care, heat detection, housing, or disease first-aid.',
        prompts: [
          { text: '🌾 Balanced Dairy Feed & Silage', query: 'How to formulate balanced ration and make maize silage?' },
          { text: '🍼 Newborn Calf Care & Colostrum', query: 'How much colostrum should be fed to a newborn calf?' },
          { text: '🐄 Pregnant Cow & Transition Care', query: 'How to care for pregnant cattle and prevent milk fever?' },
          { text: '🧬 Heat Detection Signs & AI Timing', query: 'What are heat detection signs in cattle and AI timing?' },
          { text: '☀️ Summer Heat Stress & Housing', query: 'Summer heat stress management for dairy cattle shed' },
          { text: '🥛 Clean Milk & Correct Milking', query: 'Clean milk production and full-hand milking method' },
          { text: '⚠️ Cattle Eating Mud / Plastic (Pica)', query: 'Treatment for cattle eating soil, bones, and plastic (Pica)' },
          { text: '🚨 Emergency Bloat & FMD Treatment', query: 'Immediate emergency relief for cattle bloat and FMD ulcers' }
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
