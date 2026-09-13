/**
 * Pashu Suraksha - Farmer Awareness & Live Website Walkthrough Engine
 * Renders a 75-second high-definition animated educational video showing
 * the actual PashuSuraksha website screen, live UI interactions (Triage, GIS Map, EHR, 1962 Hotline),
 * synchronized Hindi voiceover, acoustic background melody, and interactive subtitles.
 */

class FarmerVideoPlayer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isPlaying = false;
    this.currentTime = 0; // in seconds
    this.totalDuration = 75; // 75 seconds total
    this.lastFrameTimestamp = null;
    this.animFrameId = null;
    this.isMuted = false;
    this.audioCtx = null;
    this.musicInterval = null;
    this.lastSpokenScene = -1;
    this.width = 960;
    this.height = 540;

    this.scenes = [
      {
        id: 1,
        start: 0,
        end: 12,
        title: "Scene 1 • समस्या (The Problem)",
        bannerText: "बीमारी की जल्दी पहचान, पशुधन की बेहतर सुरक्षा",
        voiceover: "क्या आपके पशुओं में बीमारी के शुरुआती लक्षण जैसे तेज बुखार, त्वचा पर गांठें, या मुंह में छाले दिख रहे हैं? समय पर पहचान और सूचना न मिलने से बीमारी पूरे गांव में तेजी से फैल सकती है।",
        theme: "gloomy",
        activeTab: "none"
      },
      {
        id: 2,
        start: 12,
        end: 24,
        title: "Scene 2 • पोर्टल का परिचय (Meet PashuSuraksha)",
        bannerText: "PashuSuraksha — किसानों और पशुपालकों के लिए स्मार्ट डिजिटल मंच",
        voiceover: "पेश है PashuSuraksha – पशु स्वास्थ्य सुरक्षा का सबसे सरल डिजिटल मंच। इसे आप अपने मोबाइल फोन या कंप्यूटर पर आसानी से खोल सकते हैं। आइए सीखें इसका उपयोग कैसे करें।",
        theme: "sunrise",
        activeTab: "home"
      },
      {
        id: 3,
        start: 24,
        end: 42,
        title: "Scene 3 • लक्षण दर्ज करें व एआई जांच (Report & AI Triage)",
        bannerText: "लक्षण दर्ज करें ➔ एआई तुरंत बीमारी और जोखिम का सटीक आकलन करता है",
        voiceover: "चरण 1: 'Rapid Syndromic Report' टैब पर क्लिक करें। अपने पशु का चयन करें और दिखाई देने वाले लक्षणों पर टिक लगाएं। हमारा एआई सिस्टम तुरंत बीमारी और जोखिम स्तर का सटीक आकलन करता है।",
        theme: "app_demo",
        activeTab: "triage"
      },
      {
        id: 4,
        start: 42,
        end: 56,
        title: "Scene 4 • जीआईएस मैप व डॉक्टर को अलर्ट (GIS Map & Auto Alert)",
        bannerText: "डॉक्टर को स्वतः सूचना ➔ जीआईएस नक्शे पर 10 किमी सुरक्षा घेरा सक्रिय",
        voiceover: "चरण 2: रिपोर्ट दर्ज होते ही नजदीकी पशु चिकित्सा अधिकारी को फोन पर तुरंत एसएमएस और अलर्ट पहुंच जाता है। साथ ही जीआईएस नक्शे पर 10 किलोमीटर का सुरक्षा घेरा सक्रिय हो जाता है।",
        theme: "app_demo",
        activeTab: "map"
      },
      {
        id: 5,
        start: 56,
        end: 67,
        title: "Scene 5 • पशु स्वास्थ्य रिकॉर्ड व 1962 हेल्पलाइन (EHR & 1962 Hotline)",
        bannerText: "ई-स्वास्थ्य कार्ड (EHR) • 12-अंकीय टैग • टोल-फ्री हेल्पलाइन 1962",
        voiceover: "चरण 3: 'Animal EHR' में पशु का 12-अंकों का टैग नंबर दर्ज करके उसका टीकाकरण और उपचार इतिहास कभी भी देखें। बिना स्मार्टफोन वाले किसान 1962 टोल-फ्री हेल्पलाइन पर भी कॉल कर सकते हैं।",
        theme: "healthy",
        activeTab: "ehr"
      },
      {
        id: 6,
        start: 67,
        end: 75,
        title: "Scene 6 • कार्रवाई (Protect Your Herd - Call to Action)",
        bannerText: "PashuSuraksha — Detect Early • Protect Livestock • Empower Farmers",
        voiceover: "PashuSuraksha – बीमारी की पहचान जल्दी, कार्रवाई सही समय पर। अभी ऊपर दिए गए 'लक्षण दर्ज करें' बटन पर क्लिक करें और अपने पशुधन को सुरक्षित बनाएं।",
        theme: "outro",
        activeTab: "action"
      }
    ];
  }

  init() {
    this.canvas = document.getElementById('farmerVideoCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Ensure fixed base coordinate system
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.bindControls();
    this.renderFrame(0);
    this.updateTimelineUI();
  }

  bindControls() {
    const playBtn = document.getElementById('videoPlayToggleBtn');
    const restartBtn = document.getElementById('videoRestartBtn');
    const muteBtn = document.getElementById('videoMuteBtn');
    const scrubber = document.getElementById('videoTimelineScrubber');
    const fullscreenBtn = document.getElementById('videoFullscreenBtn');
    const heroOverlay = document.getElementById('videoHeroPlayOverlay');

    if (playBtn) {
      playBtn.onclick = () => this.togglePlay();
    }
    if (restartBtn) {
      restartBtn.onclick = () => this.restart();
    }
    if (muteBtn) {
      muteBtn.onclick = () => this.toggleMute();
    }
    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => this.toggleFullscreen();
    }
    if (heroOverlay) {
      heroOverlay.onclick = () => this.play();
    }

    if (this.canvas) {
      this.canvas.onclick = () => this.togglePlay();
    }

    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.seekTo(val);
      });
    }

    // Scene Navigation Chips
    document.querySelectorAll('.video-scene-chip').forEach(chip => {
      chip.onclick = () => {
        const sceneId = parseInt(chip.dataset.scene, 10);
        const targetScene = this.scenes.find(s => s.id === sceneId);
        if (targetScene) {
          this.seekTo(targetScene.start);
          if (!this.isPlaying) {
            this.play();
          }
        }
      };
    });
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.currentTime >= this.totalDuration - 0.2) {
      this.currentTime = 0;
      this.lastSpokenScene = -1;
    }
    this.isPlaying = true;
    this.lastFrameTimestamp = performance.now();
    this.updatePlayBtnUI(true);

    try {
      this.initAudioContext();
      this.startBackgroundMusic();
      this.checkVoiceoverTrigger();
    } catch (err) {
      console.warn('Audio playback initialization warning:', err);
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.loop();
  }

  pause() {
    this.isPlaying = false;
    this.updatePlayBtnUI(false);
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.stopVoiceover();
    this.stopBackgroundMusic();
  }

  restart() {
    this.seekTo(0);
    this.play();
  }

  seekTo(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.totalDuration));
    this.lastSpokenScene = -1;
    this.updateTimelineUI();
    this.renderFrame(this.currentTime);
    if (this.isPlaying) {
      this.checkVoiceoverTrigger();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const muteBtn = document.getElementById('videoMuteBtn');
    if (muteBtn) {
      muteBtn.innerHTML = this.isMuted ? '🔇 Unmute' : '🔊 Sound';
      muteBtn.classList.toggle('btn-secondary', this.isMuted);
    }
    if (this.isMuted) {
      this.stopVoiceover();
      this.stopBackgroundMusic();
    } else {
      if (this.isPlaying) {
        this.startBackgroundMusic();
        this.checkVoiceoverTrigger();
      }
    }
  }

  toggleFullscreen() {
    const container = document.getElementById('videoCanvasContainer') || this.canvas;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => console.log('Fullscreen failed:', err));
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  updatePlayBtnUI(playing) {
    const playBtn = document.getElementById('videoPlayToggleBtn');
    const heroOverlay = document.getElementById('videoHeroPlayOverlay');

    if (playBtn) {
      playBtn.innerHTML = playing ? '⏸ Pause' : '▶ Play';
      playBtn.classList.toggle('btn-danger', playing);
      playBtn.classList.toggle('btn-primary', !playing);
    }
    if (heroOverlay) {
      heroOverlay.style.display = playing ? 'none' : 'flex';
    }
  }

  updateTimelineUI() {
    const scrubber = document.getElementById('videoTimelineScrubber');
    const timeDisplay = document.getElementById('videoTimeDisplay');
    const progressFill = document.getElementById('videoProgressFill');
    const subtitleEl = document.getElementById('videoActiveSubtitle');
    const bannerEl = document.getElementById('videoActiveBanner');

    if (scrubber) {
      scrubber.value = this.currentTime;
    }
    if (progressFill) {
      const pct = (this.currentTime / this.totalDuration) * 100;
      progressFill.style.width = pct + '%';
    }

    if (timeDisplay) {
      const curM = String(Math.floor(this.currentTime / 60)).padStart(2, '0');
      const curS = String(Math.floor(this.currentTime % 60)).padStart(2, '0');
      const totM = String(Math.floor(this.totalDuration / 60)).padStart(2, '0');
      const totS = String(Math.floor(this.totalDuration % 60)).padStart(2, '0');
      timeDisplay.innerText = curM + ':' + curS + ' / ' + totM + ':' + totS;
    }

    const currentScene = this.getCurrentScene();
    document.querySelectorAll('.video-scene-chip').forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.scene, 10) === currentScene.id);
    });

    if (subtitleEl) {
      subtitleEl.innerText = currentScene.voiceover;
    }
    if (bannerEl) {
      bannerEl.innerText = currentScene.bannerText;
    }
  }

  getCurrentScene() {
    for (let i = 0; i < this.scenes.length; i++) {
      const scene = this.scenes[i];
      if (this.currentTime >= scene.start && this.currentTime < scene.end) {
        return scene;
      }
    }
    return this.scenes[this.scenes.length - 1];
  }

  loop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = (now - (this.lastFrameTimestamp || now)) / 1000;
    this.lastFrameTimestamp = now;

    this.currentTime += dt;

    if (this.currentTime >= this.totalDuration) {
      this.currentTime = this.totalDuration;
      this.renderFrame(this.currentTime);
      this.updateTimelineUI();
      this.pause();
      return;
    }

    this.checkVoiceoverTrigger();
    this.renderFrame(this.currentTime);
    this.updateTimelineUI();

    this.animFrameId = requestAnimationFrame(() => this.loop());
  }

  // ==========================================
  // AUDIO & SYNCHRONIZED HINDI VOICEOVER
  // ==========================================
  initAudioContext() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }

  startBackgroundMusic() {
    if (this.isMuted || !this.audioCtx) return;
    this.stopBackgroundMusic();

    let noteIdx = 0;
    const gloomyChords = [196, 220, 246.94, 293.66]; // G3, A3, B3, D4
    const upliftingChords = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00]; // C4, E4, G4, C5, A4

    this.musicInterval = setInterval(() => {
      if (!this.isPlaying || this.isMuted) return;
      const scene = this.getCurrentScene();
      const chordList = scene.theme === 'gloomy' ? gloomyChords : upliftingChords;
      const freq = chordList[noteIdx % chordList.length];
      this.playAcousticNote(freq, scene.theme === 'gloomy' ? 0.035 : 0.055);
      noteIdx++;
    }, 450);
  }

  playAcousticNote(freq, gainVal) {
    if (!this.audioCtx || this.isMuted) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.9);
    } catch (e) {
      // Audio fallback silent
    }
  }

  stopBackgroundMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  checkVoiceoverTrigger() {
    if (this.isMuted || !('speechSynthesis' in window)) return;
    const currentScene = this.getCurrentScene();

    if (this.lastSpokenScene !== currentScene.id) {
      this.lastSpokenScene = currentScene.id;
      this.speakVoiceover(currentScene.voiceover);
    }
  }

  speakVoiceover(text) {
    if (!('speechSynthesis' in window) || this.isMuted) return;
    try {
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'hi-IN';
      utter.rate = 0.94; // slightly natural educational pace
      utter.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi'));
      if (hiVoice) {
        utter.voice = hiVoice;
      }

      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  stopVoiceover() {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // silent
      }
    }
  }

  // ==========================================
  // REAL-TIME CANVAS CINEMATIC RENDERER
  // ==========================================
  renderFrame(time) {
    if (!this.ctx) return;
    const w = this.width;
    const h = this.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    if (time < 12) {
      this.renderScene1_Problem(ctx, w, h, time);
    } else if (time < 24) {
      this.renderScene2_PortalIntro(ctx, w, h, time - 12);
    } else if (time < 42) {
      this.renderScene3_LiveTriage(ctx, w, h, time - 24);
    } else if (time < 56) {
      this.renderScene4_LiveMapAndAlert(ctx, w, h, time - 42);
    } else if (time < 67) {
      this.renderScene5_EHRAndHotline(ctx, w, h, time - 56);
    } else {
      this.renderScene6_Outro(ctx, w, h, time - 67);
    }

    // Video HUD Bottom Scrubber line
    this.renderVideoHUD(ctx, w, h, time);
  }

  // =========================================================================
  // SCENE 1 (0-12s): The Problem - Barn, Worried Farmer, Sick Cow
  // =========================================================================
  renderScene1_Problem(ctx, w, h, t) {
    // Dim rustic barn background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(0.6, '#0f172a');
    bgGrad.addColorStop(1, '#332014');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Barn wooden rafters
    ctx.strokeStyle = '#473224';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(w, 40);
    ctx.moveTo(w * 0.25, 0);
    ctx.lineTo(w * 0.25, h * 0.8);
    ctx.moveTo(w * 0.75, 0);
    ctx.lineTo(w * 0.75, h * 0.8);
    ctx.stroke();

    // Straw bed
    ctx.fillStyle = '#713f12';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
    ctx.fillStyle = '#ca8a04';
    for (let i = 0; i < 35; i++) {
      ctx.fillRect((i * 30 + (t * 2)) % w, h * 0.78 + (i % 5) * 4, 20, 3);
    }

    // Worried Farmer (Left)
    const farmerX = w * 0.28;
    const farmerY = h * 0.62;
    ctx.font = Math.round(h * 0.28) + "px system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('👨‍🌾', farmerX, farmerY);

    // Sweat drop / worry animation
    if (Math.sin(t * 3) > 0) {
      ctx.font = Math.round(h * 0.08) + "px system-ui, sans-serif";
      ctx.fillText('💧', farmerX + 32, farmerY - 75);
    }

    // Sick Cow (Right)
    const cowX = w * 0.66;
    const cowY = h * 0.68;
    ctx.font = Math.round(h * 0.36) + "px system-ui, sans-serif";
    ctx.fillText('🐄', cowX, cowY);

    // Pulsing disease nodules / fever alert circles
    const pulse = Math.abs(Math.sin(t * 4));
    ctx.strokeStyle = "rgba(225, 29, 72, " + (0.5 + pulse * 0.5) + ")";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cowX - 45, cowY - 90, 16 + pulse * 10, 0, Math.PI * 2);
    ctx.arc(cowX + 30, cowY - 55, 20 + pulse * 12, 0, Math.PI * 2);
    ctx.stroke();

    // Nodules tag
    ctx.fillStyle = 'rgba(225, 29, 72, 0.95)';
    ctx.font = "bold " + Math.round(h * 0.045) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('⚠️ त्वचा पर गांठें (Skin Nodules)', cowX + 30, cowY - 110);
    ctx.fillText('📉 दूध उत्पादन में गिरावट (Low Milk)', cowX - 60, cowY + 28);
    ctx.fillText('🌡️ तेज बुखार >104°F (High Fever)', cowX + 10, cowY + 50);

    // Empty Milk Can
    ctx.font = Math.round(h * 0.12) + "px system-ui, sans-serif";
    ctx.fillText('🥛', w * 0.46, h * 0.78);

    // Gloomy Vignette
    this.renderVignette(ctx, w, h, 'rgba(15, 23, 42, 0.45)');

    // Cinematic Banner Text
    this.renderSceneTitleBanner(ctx, w, h, 'Scene 1 • समस्या की पहचान (The Problem)', 'बीमारी की जल्दी पहचान, पशुधन की संपूर्ण सुरक्षा');
  }

  // =========================================================================
  // SCENE 2 (12-24s): Meet PashuSuraksha Portal & Interface
  // =========================================================================
  renderScene2_PortalIntro(ctx, w, h, t) {
    // Draw realistic PashuSuraksha browser frame in background
    this.drawBrowserChrome(ctx, w, h, 'home', t);

    // Spotlight overlay on the navigation tabs
    const spotX = w * 0.5;
    const spotY = 82;
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)';
    ctx.lineWidth = 3;
    this.roundRect(ctx, w * 0.08, 64, w * 0.84, 38, 8);
    ctx.stroke();

    // Guide callout pointing to navigation
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    this.roundRect(ctx, w * 0.2, 115, w * 0.6, 52, 10);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fef08a';
    ctx.font = "bold " + Math.round(h * 0.04) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('👆 मुख्य नेविगेशन बार: सभी 8 सुविधाएं 1-क्लिक में उपलब्ध', w * 0.5, 137);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = Math.round(h * 0.034) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('GIS आउटब्रेक मैप • एआई विज़न लेंस • रैपिड सिंड्रोमिक रिपोर्ट • पशु स्वास्थ्य कार्ड (EHR)', w * 0.5, 157);

    // Farmer avatar at bottom left demonstrating the website
    ctx.font = Math.round(h * 0.22) + "px system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('👨‍🌾', w * 0.15, h * 0.82);

    // Speech bubble for farmer
    ctx.fillStyle = '#0f766e';
    this.roundRect(ctx, w * 0.24, h * 0.64, w * 0.65, 75, 12);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold " + Math.round(h * 0.042) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('💡 "मोबाइल या कंप्यूटर पर खोलें: pashusuraksha.gov.in"', w * 0.26, h * 0.70);
    ctx.fillStyle = '#fef08a';
    ctx.font = Math.round(h * 0.036) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('पशुपालकों और चिकित्सकों के लिए 24/7 निःशुल्क डिजिटल स्वास्थ्य मंच', w * 0.26, h * 0.74);

    // Animated mouse cursor gliding towards the Triage tab
    const curX = w * 0.5 + Math.sin(t * 1.5) * 120;
    const curY = 82;
    this.drawCursor(ctx, curX, curY, Math.sin(t * 3) > 0.5);

    this.renderSceneTitleBanner(ctx, w, h, 'Scene 2 • पोर्टल का परिचय (Meet PashuSuraksha)', 'PashuSuraksha (पशु सुरक्षा) — स्मार्ट डिजिटल मंच');
  }

  // =========================================================================
  // SCENE 3 (24-42s): Live Demo - Rapid Syndromic Report & AI Triage
  // =========================================================================
  renderScene3_LiveTriage(ctx, w, h, t) {
    // Background website screen with active triage tab
    this.drawBrowserChrome(ctx, w, h, 'triage', t);

    const mainY = 110;
    const cardH = h - mainY - 25;

    // LEFT CARD: Triage Form
    const leftW = w * 0.46;
    const leftX = w * 0.03;
    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, leftX, mainY, leftW, cardH, 10);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Form Header
    ctx.fillStyle = '#10b981';
    ctx.font = "bold " + Math.round(h * 0.045) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText('⚡ 1. पशु व लक्षण चयन (Symptom Report)', leftX + 16, mainY + 28);

    // Animal Selector
    ctx.fillStyle = '#94a3b8';
    ctx.font = "600 " + Math.round(h * 0.032) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('पशु की प्रजाति (Species):', leftX + 16, mainY + 54);

    // Species button selected
    ctx.fillStyle = '#0f766e';
    this.roundRect(ctx, leftX + 16, mainY + 62, 130, 32, 6);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold " + Math.round(h * 0.035) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('🐄 गाय (Cattle)', leftX + 26, mainY + 83);

    // Unselected species
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, leftX + 154, mainY + 62, 110, 32, 6);
    ctx.fill();
    ctx.fillStyle = '#64748b';
    ctx.fillText('🐃 भैंस (Buffalo)', leftX + 162, mainY + 83);

    // Symptoms checkboxes list
    ctx.fillStyle = '#94a3b8';
    ctx.font = "600 " + Math.round(h * 0.032) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('दिखाई देने वाले लक्षण (Check Symptoms):', leftX + 16, mainY + 116);

    const symptoms = [
      { text: 'मुंह में छाले व लार (Mouth Vesicles/Saliva)', checked: t >= 3 },
      { text: 'त्वचा पर गांठें (Skin Nodules / Lumps)', checked: t >= 6 },
      { text: 'तेज बुखार >104°F (High Fever)', checked: t >= 9 },
      { text: 'लंगड़ाना व खुर में घाव (Hoof Lesions)', checked: t >= 12 }
    ];

    symptoms.forEach((sym, idx) => {
      const rowY = mainY + 130 + idx * 36;
      ctx.fillStyle = sym.checked ? '#064e3b' : '#1e293b';
      this.roundRect(ctx, leftX + 16, rowY, leftW - 32, 30, 6);
      ctx.fill();
      ctx.strokeStyle = sym.checked ? '#34d399' : '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Checkbox square
      ctx.fillStyle = sym.checked ? '#10b981' : '#334155';
      this.roundRect(ctx, leftX + 24, rowY + 6, 18, 18, 4);
      ctx.fill();
      if (sym.checked) {
        ctx.fillStyle = '#ffffff';
        ctx.font = "bold 14px system-ui";
        ctx.fillText('✓', leftX + 28, rowY + 20);
      }

      ctx.fillStyle = sym.checked ? '#ffffff' : '#94a3b8';
      ctx.font = "500 " + Math.round(h * 0.032) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText(sym.text, leftX + 50, rowY + 20);
    });

    // Run AI Diagnosis Button
    const btnY = mainY + cardH - 52;
    const isClicked = t >= 14;
    ctx.fillStyle = isClicked ? '#059669' : '#10b981';
    this.roundRect(ctx, leftX + 16, btnY, leftW - 32, 40, 8);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold " + Math.round(h * 0.04) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('⚡ एआई जोखिम जांच (Run Instant AI Diagnosis)', leftX + leftW / 2, btnY + 26);

    // RIGHT CARD: AI Diagnostic Assessment Result
    const rightW = w * 0.46;
    const rightX = w * 0.51;

    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, rightX, mainY, rightW, cardH, 10);
    ctx.fill();
    ctx.strokeStyle = t >= 14 ? '#ef4444' : '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.font = "bold " + Math.round(h * 0.045) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('🤖 2. एआई विश्लेषण परिणाम (AI Assessment)', rightX + 16, mainY + 28);

    if (t < 14) {
      // Waiting state
      ctx.fillStyle = '#64748b';
      ctx.font = Math.round(h * 0.04) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText('लक्षण चुनकर "एआई जांच" बटन दबाएं...', rightX + 20, mainY + 120);
    } else {
      // Real-time AI Result Revealed
      // Red Alert Card
      ctx.fillStyle = '#450a0a';
      this.roundRect(ctx, rightX + 16, mainY + 45, rightW - 32, 58, 8);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.font = "bold " + Math.round(h * 0.044) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText('🚨 अति गंभीर जोखिम: FMD (खुरपका) / LSD', rightX + 26, mainY + 70);

      // Confidence bar
      ctx.fillStyle = '#ffffff';
      ctx.font = "600 " + Math.round(h * 0.032) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText('एआई डायग्नोसिस सटीकता (AI Confidence): 94%', rightX + 26, mainY + 92);

      // 10km containment ring trigger badge
      ctx.fillStyle = '#7f1d1d';
      this.roundRect(ctx, rightX + 16, mainY + 112, rightW - 32, 42, 6);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = "bold " + Math.round(h * 0.034) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText('⚠️ 10 किमी बायो-सिक्योरिटी घेरा स्वतः सक्रिय किया गया', rightX + 26, mainY + 138);

      // Immediate First Aid instructions
      ctx.fillStyle = '#1e293b';
      this.roundRect(ctx, rightX + 16, mainY + 162, rightW - 32, cardH - 180, 8);
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.font = "bold " + Math.round(h * 0.036) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText('📋 तत्काल प्राथमिक उपचार (Immediate Action):', rightX + 26, mainY + 188);

      const aids = [
        '1. बीमार पशु को तुरंत बाकी झुंड से अलग करें',
        '2. मुंह व खुरों के घावों को लाल दवा (KMnO4) से धोएं',
        '3. पशु चिकित्सक को स्वतः सूचना भेज दी गई है'
      ];
      aids.forEach((aid, i) => {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = "500 " + Math.round(h * 0.032) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
        ctx.fillText(aid, rightX + 26, mainY + 214 + i * 26);
      });
    }

    // Cursor clicking the diagnosis button at t = 13s
    if (t >= 11 && t < 15) {
      this.drawCursor(ctx, leftX + leftW / 2, btnY + 20, true);
    }

    this.renderSceneTitleBanner(ctx, w, h, 'Scene 3 • लाइव डेमो: लक्षण व एआई जांच (AI Triage)', 'लक्षण दर्ज करें ➔ जोखिम पहचानें ➔ समय पर सहायता प्राप्त करें');
  }

  // =========================================================================
  // SCENE 4 (42-56s): GIS Outbreak Map & Automatic Vet Alert
  // =========================================================================
  renderScene4_LiveMapAndAlert(ctx, w, h, t) {
    // Browser chrome with active GIS Map tab
    this.drawBrowserChrome(ctx, w, h, 'map', t);

    const mainY = 110;
    const cardH = h - mainY - 25;

    // GIS Map viewport
    ctx.fillStyle = '#0b192c';
    this.roundRect(ctx, w * 0.03, mainY, w * 0.94, cardH, 12);
    ctx.fill();
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Simulated GIS Map Terrain Grid & Rivers
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    for (let x = w * 0.05; x < w * 0.95; x += 45) {
      ctx.beginPath(); ctx.moveTo(x, mainY); ctx.lineTo(x, mainY + cardH); ctx.stroke();
    }
    for (let y = mainY; y < mainY + cardH; y += 45) {
      ctx.beginPath(); ctx.moveTo(w * 0.05, y); ctx.lineTo(w * 0.95, y); ctx.stroke();
    }

    // State / District borders
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, mainY + 50);
    ctx.lineTo(w * 0.45, mainY + 120);
    ctx.lineTo(w * 0.85, mainY + 80);
    ctx.stroke();

    // Map District Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = "bold 13px system-ui";
    ctx.fillText('📍 बीकानेर (Bikaner)', w * 0.2, mainY + 90);
    ctx.fillText('📍 जोधपुर (Jodhpur)', w * 0.35, mainY + 260);
    ctx.fillText('📍 नागौर (Nagaur)', w * 0.65, mainY + 220);

    // Active Outbreak Epicenter
    const epiX = w * 0.48;
    const epiY = mainY + cardH * 0.55;
    const pulse = Math.abs(Math.sin(t * 3));

    // 10km Glowing Containment Ring
    ctx.strokeStyle = "rgba(239, 68, 68, " + (0.4 + pulse * 0.5) + ")";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(epiX, epiY, 65 + pulse * 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.beginPath();
    ctx.arc(epiX, epiY, 65 + pulse * 18, 0, Math.PI * 2);
    ctx.fill();

    // Ring Label
    ctx.fillStyle = '#fee2e2';
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = 'center';
    ctx.fillText('🔴 10 KM सुरक्षा घेरा (Containment Zone)', epiX, epiY - 90);

    // Village outbreak pin
    ctx.font = "32px system-ui";
    ctx.fillText('🚩', epiX, epiY);

    // Doctor jeep moving toward village
    const docX = w * 0.22 + (t / 14) * (epiX - w * 0.26);
    const docY = mainY + 170 + (t / 14) * (epiY - mainY - 170);
    ctx.font = "30px system-ui";
    ctx.fillText('🚑👨‍⚕️', docX, docY);

    // Top Right: Automatic SMS Toast Notification
    const toastW = 340;
    const toastH = 88;
    const toastX = w * 0.97 - toastW;
    const toastY = mainY + 14;

    ctx.fillStyle = '#064e3b';
    this.roundRect(ctx, toastX, toastY, toastW, toastH, 10);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#34d399';
    ctx.font = "bold 14px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('📲 पशु चिकित्सक को स्वतः SMS अलर्ट प्रेषित', toastX + 14, toastY + 26);

    ctx.fillStyle = '#ffffff';
    ctx.font = "500 12px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('डॉ. सुनील (DVO) को आपातकालीन अलर्ट भेजा गया', toastX + 14, toastY + 48);
    ctx.fillStyle = '#fef08a';
    ctx.fillText('पशु चिकित्सा दल 20 मिनट में मौके पर पहुंच रहा है।', toastX + 14, toastY + 68);

    this.renderSceneTitleBanner(ctx, w, h, 'Scene 4 • जीआईएस आउटब्रेक मैप व डॉक्टर अलर्ट (GIS Surveillance)', 'डॉक्टर को स्वतः सूचना ➔ जीआईएस नक्शे पर 10 किमी सुरक्षा घेरा सक्रिय');
  }

  // =========================================================================
  // SCENE 5 (56-67s): Animal EHR Passport & 1962 IVR Hotline
  // =========================================================================
  renderScene5_EHRAndHotline(ctx, w, h, t) {
    // Browser chrome with active EHR tab
    this.drawBrowserChrome(ctx, w, h, 'ehr', t);

    const mainY = 110;
    const cardH = h - mainY - 25;

    // LEFT CARD: Digital Animal Health Passport
    const leftW = w * 0.46;
    const leftX = w * 0.03;

    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, leftX, mainY, leftW, cardH, 12);
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#10b981';
    ctx.font = "bold " + Math.round(h * 0.042) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('📋 पशु डिजिटल स्वास्थ्य कार्ड (Animal EHR)', leftX + 18, mainY + 30);

    // Tag Card Header
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, leftX + 18, mainY + 46, leftW - 36, 56, 8);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = "bold 13px monospace";
    ctx.fillText('12-DIGIT EAR TAG ID:', leftX + 28, mainY + 68);
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 18px monospace";
    ctx.fillText('#100982347101', leftX + 28, mainY + 92);

    // Barcode representation
    for (let b = 0; b < 16; b++) {
      ctx.fillStyle = b % 3 === 0 ? '#38bdf8' : '#ffffff';
      ctx.fillRect(leftX + leftW - 130 + b * 6, mainY + 58, 3, 32);
    }

    // Official Certified Vaccinated Badge
    ctx.fillStyle = '#064e3b';
    this.roundRect(ctx, leftX + 18, mainY + 114, leftW - 36, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#a7f3d0';
    ctx.font = "bold 14px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('🛡️ प्रमाणित टीकाकृत (Verified Vaccinated)', leftX + 30, mainY + 142);

    // Cattle Details
    ctx.fillStyle = '#94a3b8';
    ctx.font = "500 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('प्रजाति: गीर गाय (Gir Cattle) • 4 वर्ष', leftX + 20, mainY + 185);
    ctx.fillText('पशुपालक: रमेश पटेल (Ramesh Patel)', leftX + 20, mainY + 210);
    ctx.fillText('दैनिक दुग्ध उत्पादन: 14 लीटर/दिन (Healthy)', leftX + 20, mainY + 235);
    ctx.fillText('टीकाकरण: FMD Booster (खुरपका टीका 15-Aug)', leftX + 20, mainY + 260);

    // RIGHT CARD: 1962 Toll-Free Hotline
    const rightW = w * 0.46;
    const rightX = w * 0.51;

    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, rightX, mainY, rightW, cardH, 12);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = "bold " + Math.round(h * 0.042) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('📞 1962 टोल-फ्री हेल्पलाइन (IVR Hotline)', rightX + 18, mainY + 30);

    // Phone graphic
    ctx.font = "50px system-ui";
    ctx.textAlign = 'center';
    ctx.fillText('☎️', rightX + rightW * 0.25, mainY + 110);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 16px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('बिना स्मार्टफोन वाले किसानों के लिए:', rightX + rightW * 0.42, mainY + 80);
    ctx.fillStyle = '#fef08a';
    ctx.font = "bold 20px monospace";
    ctx.fillText('डायल करें: 1962', rightX + rightW * 0.42, mainY + 112);

    // Voice instructions
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, rightX + 18, mainY + 140, rightW - 36, cardH - 156, 8);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = "bold 13px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('🎙️ बोलकर लक्षण दर्ज कराएं:', rightX + 28, mainY + 168);

    const ivrSteps = [
      '1. अपने फोन से 1962 मिलाएं',
      '2. अपनी भाषा चुनें (हिंदी के लिए 1 दबाएं)',
      '3. पशु और लक्षण बोलकर बताएं',
      '4. नजदीकी डॉक्टर तुरंत सहायता करेंगे'
    ];
    ivrSteps.forEach((st, i) => {
      ctx.fillStyle = '#f1f5f9';
      ctx.font = "500 12px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText(st, rightX + 28, mainY + 195 + i * 24);
    });

    this.renderSceneTitleBanner(ctx, w, h, 'Scene 5 • पशु स्वास्थ्य कार्ड व हेल्पलाइन (EHR & 1962)', 'ई-स्वास्थ्य कार्ड (EHR) • 12-अंकीय टैग • टोल-फ्री हेल्पलाइन 1962');
  }

  // =========================================================================
  // SCENE 6 (67-75s): Outro & Call to Action
  // =========================================================================
  renderScene6_Outro(ctx, w, h, t) {
    // Rich gradient twilight pasture
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#0f766e');
    bgGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Central 3D Glowing Shield
    const pulse = 1 + Math.sin(t * 4) * 0.04;
    ctx.save();
    ctx.translate(w * 0.5, h * 0.32);
    ctx.scale(pulse, pulse);

    // Outer glow
    const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 140);
    glowGrad.addColorStop(0, 'rgba(52, 211, 153, 0.45)');
    glowGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI * 2);
    ctx.fill();

    // Emblem Shield Icon
    ctx.font = Math.round(h * 0.22) + "px system-ui, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('🛡️🐄', 0, 20);
    ctx.restore();

    // Brand Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold " + Math.round(h * 0.08) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('PashuSuraksha (पशु सुरक्षा)', w * 0.5, h * 0.58);

    // Slogans
    ctx.fillStyle = '#fef08a';
    ctx.font = "bold " + Math.round(h * 0.046) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('बीमारी की पहचान जल्दी, कार्रवाई सही समय पर।', w * 0.5, h * 0.68);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = "600 " + Math.round(h * 0.036) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('Detect Early • Protect Livestock • Empower Farmers Everywhere', w * 0.5, h * 0.76);

    // Action CTA Button
    const btnW = w * 0.38;
    const btnH = 44;
    const btnX = w * 0.5 - btnW / 2;
    const btnY = h * 0.83;

    ctx.fillStyle = '#10b981';
    this.roundRect(ctx, btnX, btnY, btnW, btnH, 22);
    ctx.fill();
    ctx.fillStyle = '#064e3b';
    ctx.font = "bold " + Math.round(h * 0.042) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('⚡ अभी लक्षण दर्ज करें (Report Symptoms Now)', w * 0.5, btnY + 29);

    // Animated hand pointer clicking CTA
    if (t > 3) {
      this.drawCursor(ctx, w * 0.5 + 40, btnY + 22, true);
    }
  }

  // =========================================================================
  // BROWSER CHROME MOCKUP BACKGROUND
  // =========================================================================
  drawBrowserChrome(ctx, w, h, activeTab, t) {
    // Window header bar
    ctx.fillStyle = '#090e17';
    ctx.fillRect(0, 0, w, 28);

    // Window controls (Red, Yellow, Green dots)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(16, 14, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(32, 14, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(48, 14, 5, 0, Math.PI * 2); ctx.fill();

    // Browser URL address bar
    ctx.fillStyle = '#1e293b';
    this.roundRect(ctx, 70, 4, w - 140, 20, 5);
    ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = 'center';
    ctx.fillText('🔒 https://pashusuraksha.gov.in (पशु सुरक्षा पोर्टल)', w * 0.5, 18);

    // Top Brand Bar (Pashu Suraksha Header)
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(0, 28, w, 36);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 16px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('🐄 पशु सुरक्षा (Pashu Suraksha)', 16, 52);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = "500 11px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('Unified Animal Health Surveillance & Early Warning Decision Support', 240, 51);

    // Right User Pill in header
    ctx.fillStyle = '#064e3b';
    this.roundRect(ctx, w - 210, 33, 195, 26, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 11px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText('👨‍⚕️ डॉ. सुनील (DVO) • Online', w - 198, 50);

    // Navigation Tabs Bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 64, w, 36);

    const tabs = [
      { id: 'map', name: '🗺️ Outbreak Map' },
      { id: 'vision', name: '📸 AI Lens' },
      { id: 'triage', name: '⚡ Syndromic Report' },
      { id: 'ehr', name: '📋 Animal EHR' },
      { id: 'labs', name: '🧪 Labs' },
      { id: 'ivr', name: '📞 1962 Hotline' }
    ];

    const tabW = (w - 20) / tabs.length;
    tabs.forEach((tab, i) => {
      const tx = 10 + i * tabW;
      const isActive = tab.id === activeTab;

      if (isActive) {
        ctx.fillStyle = '#0f766e';
        this.roundRect(ctx, tx, 68, tabW - 4, 30, 4);
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.fillRect(tx, 96, tabW - 4, 3);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = isActive ? '#ffffff' : '#94a3b8';
      ctx.font = (isActive ? "bold " : "500 ") + "12px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.fillText(tab.name, tx + (tabW - 4) / 2, 88);
    });

    // Content Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 100, w, h - 100);
  }

  // Helper cursor drawer
  drawCursor(ctx, x, y, isClicking) {
    ctx.save();
    ctx.translate(x, y);

    // Click wave ripple
    if (isClicking) {
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Cursor arrow
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 18);
    ctx.lineTo(5, 14);
    ctx.lineTo(10, 22);
    ctx.lineTo(13, 20);
    ctx.lineTo(8, 12);
    ctx.lineTo(14, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Top Scene Title Ribbon
  renderSceneTitleBanner(ctx, w, h, sceneTag, bannerText) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    this.roundRect(ctx, w * 0.08, 14, w * 0.84, 48, 8);
    ctx.fill();
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = "bold " + Math.round(h * 0.036) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText(sceneTag, w * 0.5, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = "bold " + Math.round(h * 0.042) + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.fillText(bannerText, w * 0.5, 52);
  }

  renderVignette(ctx, w, h, color) {
    const rad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.65);
    rad.addColorStop(0, 'rgba(0,0,0,0)');
    rad.addColorStop(1, color);
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);
  }

  renderVideoHUD(ctx, w, h, time) {
    const barH = 5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, h - barH, w, barH);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, h - barH, (time / this.totalDuration) * w, barH);
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  scrollToPlayer() {
    const section = document.getElementById('farmerVideoSection');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    this.play();
  }
}

// Instantiate global manager
window.FarmerVideoManager = new FarmerVideoPlayer();

document.addEventListener('DOMContentLoaded', () => {
  window.FarmerVideoManager.init();
});
