/**
 * Pashu Suraksha - Farmer Awareness & Introductory Video Engine
 * Renders a 45-second high-definition animated educational video with
 * synchronized Hindi voiceover, acoustic background melody, interactive subtitles,
 * and animated visual scenes for livestock farmers.
 */

class FarmerVideoPlayer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isPlaying = false;
    this.currentTime = 0; // in seconds
    this.totalDuration = 45; // 45 seconds total
    this.lastFrameTimestamp = null;
    this.animFrameId = null;
    this.isMuted = false;
    this.audioCtx = null;
    this.musicInterval = null;
    this.currentSceneIndex = 0;
    this.currentUtterance = null;
    this.lastSpokenScene = -1;

    this.scenes = [
      {
        id: 1,
        start: 0,
        end: 8,
        title: "The Problem (समस्या)",
        bannerText: "बीमारी की जल्दी पहचान, पशुधन की बेहतर सुरक्षा",
        voiceover: "क्या आपके पशुओं में बीमारी के शुरुआती लक्षण दिखाई दे रहे हैं? समय पर पहचान न होने से बीमारी तेजी से फैल सकती है।",
        theme: "gloomy"
      },
      {
        id: 2,
        start: 8,
        end: 15,
        title: "Introducing PashuSuraksha (समाधान)",
        bannerText: "PashuSuraksha (पशु सुरक्षा) — स्मार्ट प्लेटफ़ॉर्म",
        voiceover: "पेश है PashuSuraksha – पशु रोगों की शुरुआती पहचान और समय पर जानकारी देने वाला स्मार्ट प्लेटफ़ॉर्म।",
        theme: "sunrise"
      },
      {
        id: 3,
        start: 15,
        end: 30,
        title: "How It Works (कार्यप्रणाली)",
        bannerText: "लक्षण दर्ज करें ➔ जोखिम पहचानें ➔ समय पर सहायता प्राप्त करें",
        voiceover: "किसान पशु की जानकारी और लक्षण दर्ज करता है। सिस्टम संभावित बीमारी और जोखिम का आकलन करता है तथा आवश्यकता होने पर पशु चिकित्सक को सूचना भेजता है।",
        theme: "app_demo"
      },
      {
        id: 4,
        start: 30,
        end: 40,
        title: "Benefits & Prevention (लाभ और सुरक्षा)",
        bannerText: "स्वस्थ पशु, सुरक्षित किसान",
        voiceover: "समय पर जानकारी से बीमारी को फैलने से रोका जा सकता है, पशुओं की सुरक्षा बढ़ती है और किसानों का नुकसान कम होता है।",
        theme: "healthy"
      },
      {
        id: 5,
        start: 40,
        end: 45,
        title: "Ending & Call to Action (कार्रवाई)",
        bannerText: "PashuSuraksha — Detect Early • Protect Livestock",
        voiceover: "PashuSuraksha — बीमारी की पहचान जल्दी, कार्रवाई सही समय पर।",
        theme: "outro"
      }
    ];
  }

  init() {
    this.canvas = document.getElementById('farmerVideoCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Handle high DPI
    this.setupCanvasDPI();
    window.addEventListener('resize', () => this.setupCanvasDPI());

    this.bindControls();
    this.renderFrame(0);
  }

  setupCanvasDPI() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 800;
    this.height = Math.round(this.width * 9 / 16); // 16:9 aspect ratio
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.renderFrame(this.currentTime);
  }

  bindControls() {
    const playBtn = document.getElementById('videoPlayToggleBtn');
    const restartBtn = document.getElementById('videoRestartBtn');
    const muteBtn = document.getElementById('videoMuteBtn');
    const scrubber = document.getElementById('videoTimelineScrubber');
    const modalClose = document.getElementById('videoModalCloseBtn');

    if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());
    if (restartBtn) restartBtn.addEventListener('click', () => this.restart());
    if (muteBtn) muteBtn.addEventListener('click', () => this.toggleMute());

    if (scrubber) {
      scrubber.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.seekTo(val);
      });
    }

    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    // Scene Navigation Chips
    document.querySelectorAll('.video-scene-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sceneId = parseInt(chip.dataset.scene);
        const targetScene = this.scenes.find(s => s.id === sceneId);
        if (targetScene) {
          this.seekTo(targetScene.start);
          if (!this.isPlaying) this.play();
        }
      });
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
    if (this.currentTime >= this.totalDuration) {
      this.currentTime = 0;
      this.lastSpokenScene = -1;
    }
    this.isPlaying = true;
    this.lastFrameTimestamp = performance.now();
    this.updatePlayBtnUI(true);
    this.initAudioContext();
    this.startBackgroundMusic();
    this.checkVoiceoverTrigger();
    this.loop();
  }

  pause() {
    this.isPlaying = false;
    this.updatePlayBtnUI(false);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.stopVoiceover();
    this.stopBackgroundMusic();
  }

  restart() {
    this.seekTo(0);
    this.play();
  }

  seekTo(seconds) {
    this.currentTime = Math.max(0, Math.min(seconds, this.totalDuration));
    this.lastSpokenScene = -1; // allow re-triggering voice for current scene
    this.updateTimelineUI();
    this.checkVoiceoverTrigger();
    this.renderFrame(this.currentTime);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const muteBtn = document.getElementById('videoMuteBtn');
    if (muteBtn) {
      muteBtn.innerHTML = this.isMuted ? '🔇 Unmute' : '🔊 Sound';
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

  updatePlayBtnUI(playing) {
    const playBtn = document.getElementById('videoPlayToggleBtn');
    const heroPlayOverlay = document.getElementById('videoHeroPlayOverlay');
    if (playBtn) {
      playBtn.innerHTML = playing ? '⏸ Pause' : '▶ Play';
      playBtn.classList.toggle('btn-danger', playing);
      playBtn.classList.toggle('btn-primary', !playing);
    }
    if (heroPlayOverlay) {
      heroPlayOverlay.style.display = playing ? 'none' : 'flex';
    }
  }

  updateTimelineUI() {
    const scrubber = document.getElementById('videoTimelineScrubber');
    const timeDisplay = document.getElementById('videoTimeDisplay');
    const progressFill = document.getElementById('videoProgressFill');
    const subtitleEl = document.getElementById('videoActiveSubtitle');
    const bannerEl = document.getElementById('videoActiveBanner');

    if (scrubber) scrubber.value = this.currentTime;
    if (progressFill) {
      const pct = (this.currentTime / this.totalDuration) * 100;
      progressFill.style.width = pct + '%';
    }

    if (timeDisplay) {
      const curM = String(Math.floor(this.currentTime / 60)).padStart(2, '0');
      const curS = String(Math.floor(this.currentTime % 60)).padStart(2, '0');
      const totM = String(Math.floor(this.totalDuration / 60)).padStart(2, '0');
      const totS = String(Math.floor(this.totalDuration % 60)).padStart(2, '0');
      timeDisplay.innerText = ${curM}: / :;
    }

    // Update active scene chip
    const currentScene = this.getCurrentScene();
    document.querySelectorAll('.video-scene-chip').forEach(chip => {
      chip.classList.toggle('active', parseInt(chip.dataset.scene) === currentScene.id);
    });

    if (subtitleEl) subtitleEl.innerText = currentScene.voiceover;
    if (bannerEl) bannerEl.innerText = currentScene.bannerText;
  }

  getCurrentScene() {
    for (const scene of this.scenes) {
      if (this.currentTime >= scene.start && this.currentTime < scene.end) {
        return scene;
      }
    }
    return this.scenes[this.scenes.length - 1];
  }

  loop() {
    if (!this.isPlaying) return;

    const now = performance.now();
    const dt = (now - this.lastFrameTimestamp) / 1000;
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
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startBackgroundMusic() {
    if (this.isMuted || !this.audioCtx) return;
    this.stopBackgroundMusic();

    let noteIdx = 0;
    // Pleasant acoustic pentatonic arpeggio chords
    const gloomyChords = [196, 220, 246.94, 293.66]; // G3, A3, B3, D4 minor shade
    const upliftingChords = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00]; // C4, E4, G4, C5, A4

    this.musicInterval = setInterval(() => {
      if (!this.isPlaying || this.isMuted) return;
      const scene = this.getCurrentScene();
      const chordList = scene.theme === 'gloomy' ? gloomyChords : upliftingChords;
      const freq = chordList[noteIdx % chordList.length];
      this.playAcousticNote(freq, scene.theme === 'gloomy' ? 0.04 : 0.07);
      noteIdx++;
    }, 450);
  }

  playAcousticNote(freq, gainVal = 0.05) {
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
      // Audio fallback
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
    window.speechSynthesis.cancel(); // cancel prior speech

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'hi-IN';
    utter.rate = 0.92; // natural cadence
    utter.pitch = 1.05; // friendly male tone

    // Try finding Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hiVoice = voices.find(v => v.lang.startsWith('hi'));
    if (hiVoice) utter.voice = hiVoice;

    this.currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  }

  stopVoiceover() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // ==========================================
  // REAL-TIME CANVAS CINEMATIC RENDERER
  // ==========================================
  renderFrame(time) {
    if (!this.ctx) return;
    const w = this.width || 800;
    const h = this.height || 450;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    if (time < 8) {
      this.renderScene1_Problem(ctx, w, h, time);
    } else if (time < 15) {
      this.renderScene2_Intro(ctx, w, h, time - 8);
    } else if (time < 30) {
      this.renderScene3_HowItWorks(ctx, w, h, time - 15);
    } else if (time < 40) {
      this.renderScene4_Benefits(ctx, w, h, time - 30);
    } else {
      this.renderScene5_Outro(ctx, w, h, time - 40);
    }

    // Global HUD: Progress Bar & Current Scene Stamp
    this.renderVideoHUD(ctx, w, h, time);
  }

  // SCENE 1 (0-8s): The Problem - Rural Barn, Worried Farmer, Sick Cow
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
    ctx.moveTo(0, 40); ctx.lineTo(w, 40);
    ctx.moveTo(w * 0.25, 0); ctx.lineTo(w * 0.25, h * 0.8);
    ctx.moveTo(w * 0.75, 0); ctx.lineTo(w * 0.75, h * 0.8);
    ctx.stroke();

    // Straw bed
    ctx.fillStyle = '#713f12';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
    ctx.fillStyle = '#ca8a04';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect((i * 28 + (t * 2)) % w, h * 0.78 + (i % 5) * 4, 18, 3);
    }

    // Worried Farmer (Left)
    const farmerX = w * 0.28;
    const farmerY = h * 0.62;
    ctx.font = ${Math.round(h * 0.28)}px system-ui;
    ctx.textAlign = 'center';
    ctx.fillText('👨‍🌾', farmerX, farmerY);

    // Sweat drop / worry animation
    if (Math.sin(t * 3) > 0) {
      ctx.font = ${Math.round(h * 0.08)}px system-ui;
      ctx.fillText('💧', farmerX + 28, farmerY - 70);
    }

    // Sick Cow (Right)
    const cowX = w * 0.65;
    const cowY = h * 0.68;
    ctx.font = ${Math.round(h * 0.36)}px system-ui;
    ctx.fillText('🐄', cowX, cowY);

    // Pulsing disease nodules / fever alert circles
    const pulse = Math.abs(Math.sin(t * 4));
    ctx.strokeStyle = gba(225, 29, 72, );
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cowX - 35, cowY - 80, 15 + pulse * 10, 0, Math.PI * 2);
    ctx.arc(cowX + 25, cowY - 50, 18 + pulse * 12, 0, Math.PI * 2);
    ctx.stroke();

    // Nodules tag
    ctx.fillStyle = 'rgba(225, 29, 72, 0.9)';
    ctx.font = old px system-ui;
    ctx.fillText('⚠️ त्वचा पर गांठें (Skin Nodules)', cowX + 25, cowY - 105);
    ctx.fillText('📉 दूध उत्पादन में गिरावट (Low Milk)', cowX - 60, cowY + 25);

    // Empty Milk Can
    ctx.font = ${Math.round(h * 0.12)}px system-ui;
    ctx.fillText('🥛', w * 0.46, h * 0.78);

    // Gloomy Vignette
    this.renderVignette(ctx, w, h, 'rgba(15, 23, 42, 0.45)');

    // Cinematic Banner Text
    this.renderSceneTitleBanner(ctx, w, h, 'Scene 1 • समस्या की गंभीरता', 'बीमारी की जल्दी पहचान, पशुधन की बेहतर सुरक्षा');
  }

  // SCENE 2 (8-15s): Introducing PashuSuraksha - Golden Sun, Hopeful Farmer, Mobile App
  renderScene2_Intro(ctx, w, h, t) {
    // Golden sunrise over green pastures
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#fef08a');
    bgGrad.addColorStop(0.35, '#fed7aa');
    bgGrad.addColorStop(0.65, '#bbf7d0');
    bgGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Rising Sun with gentle rays
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.38, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 4;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      const rx1 = w * 0.5 + Math.cos(angle + t * 0.2) * 80;
      const ry1 = h * 0.38 + Math.sin(angle + t * 0.2) * 80;
      const rx2 = w * 0.5 + Math.cos(angle + t * 0.2) * 140;
      const ry2 = h * 0.38 + Math.sin(angle + t * 0.2) * 140;
      ctx.beginPath();
      ctx.moveTo(rx1, ry1); ctx.lineTo(rx2, ry2);
      ctx.stroke();
    }

    // Smiling Farmer holding smartphone
    ctx.font = ${Math.round(h * 0.34)}px system-ui;
    ctx.textAlign = 'center';
    ctx.fillText('👨‍🌾', w * 0.28, h * 0.72);

    // Modern smartphone frame in center
    const phoneW = Math.round(w * 0.32);
    const phoneH = Math.round(h * 0.62);
    const phoneX = w * 0.52;
    const phoneY = h * 0.16;

    // Phone body
    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, phoneX, phoneY, phoneW, phoneH, 18);
    ctx.fill();

    // Phone screen glow
    const screenGrad = ctx.createLinearGradient(phoneX, phoneY, phoneX, phoneY + phoneH);
    screenGrad.addColorStop(0, '#0f766e');
    screenGrad.addColorStop(1, '#064e3b');
    ctx.fillStyle = screenGrad;
    this.roundRect(ctx, phoneX + 8, phoneY + 12, phoneW - 16, phoneH - 24, 12);
    ctx.fill();

    // On-screen Logo & Emblem
    ctx.font = ${Math.round(phoneH * 0.22)}px system-ui;
    ctx.fillText('🛡️🐄', phoneX + phoneW / 2, phoneY + phoneH * 0.38);

    ctx.fillStyle = '#ffffff';
    ctx.font = old px system-ui;
    ctx.fillText('PashuSuraksha', phoneX + phoneW / 2, phoneY + phoneH * 0.55);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = ${Math.round(phoneH * 0.052)}px system-ui;
    ctx.fillText('पशु स्वास्थ्य सुरक्षा तंत्र', phoneX + phoneW / 2, phoneY + phoneH * 0.65);

    ctx.fillStyle = '#34d399';
    this.roundRect(ctx, phoneX + 24, phoneY + phoneH * 0.74, phoneW - 48, 26, 6);
    ctx.fill();
    ctx.fillStyle = '#064e3b';
    ctx.font = old px system-ui;
    ctx.fillText('⚡ 1-Click Triage', phoneX + phoneW / 2, phoneY + phoneH * 0.79);

    this.renderSceneTitleBanner(ctx, w, h, 'Scene 2 • समाधान का शुभारंभ', 'पेश है PashuSuraksha — डिजिटल समाधान');
  }

  // SCENE 3 (15-30s): How It Works - Animal Selection, Symptoms, AI Assessment, Vet Notification
  renderScene3_HowItWorks(ctx, w, h, t) {
    // Clean high-tech dashboard background
    ctx.fillStyle = '#091522';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid
    ctx.strokeStyle = 'rgba(15, 118, 110, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // 3 Workflow Steps Card Layout
    const step = Math.min(2, Math.floor(t / 5)); // 0: Select, 1: Symptoms, 2: Alert

    // Step 1 Box: Select Animal (Left)
    const cardW = w * 0.28;
    const cardH = h * 0.55;
    const yPos = h * 0.24;

    this.renderWorkflowCard(ctx, w * 0.05, yPos, cardW, cardH, '1. पशु चुनें (Select)', ['🐄 Cattle (गाय)', '🐃 Buffalo (भैंस)', '🐐 Goat (बकरी)', '🐑 Sheep (भेड़)'], step >= 0);

    // Step 2 Box: Symptoms (Center)
    this.renderWorkflowCard(ctx, w * 0.36, yPos, cardW, cardH, '2. लक्षण दर्ज करें (Symptoms)', ['✓ मुंह में छाले (Blisters)', '✓ त्वचा पर गांठें (Nodules)', '✓ तेज बुखार (Fever >104°)', '✓ लंगड़ाना (Lameness)'], step >= 1);

    // Step 3 Box: AI Risk & Vet Notification (Right)
    this.renderRiskAlertCard(ctx, w * 0.67, yPos, cardW, cardH, t, step >= 2);

    // Connecting arrows between steps
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 4;
    this.drawArrow(ctx, w * 0.33, yPos + cardH / 2, w * 0.36, yPos + cardH / 2);
    this.drawArrow(ctx, w * 0.64, yPos + cardH / 2, w * 0.67, yPos + cardH / 2);

    // Process Ribbon Header
    this.renderSceneTitleBanner(ctx, w, h, 'Scene 3 • कैसे काम करता है?', 'लक्षण दर्ज करें ➔ जोखिम पहचानें ➔ समय पर सहायता प्राप्त करें');
  }

  // SCENE 4 (30-40s): Benefits & Prevention - Vet Care, Tagging, Healthy Herd
  renderScene4_Benefits(ctx, w, h, t) {
    // Lush green meadow with blue sky
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#38bdf8');
    bgGrad.addColorStop(0.4, '#bae6fd');
    bgGrad.addColorStop(0.42, '#22c55e');
    bgGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Pastoral hill curve
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(w * 0.3, h * 0.65, w * 0.45, h * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Vet Doctor Arriving & Treating (Left-Center)
    ctx.font = ${Math.round(h * 0.28)}px system-ui;
    ctx.textAlign = 'center';
    ctx.fillText('🩺👨‍⚕️', w * 0.32, h * 0.68);

    // Healthy Cattle & Calf (Center-Right)
    ctx.font = ${Math.round(h * 0.34)}px system-ui;
    ctx.fillText('🐄', w * 0.62, h * 0.7);
    ctx.font = ${Math.round(h * 0.22)}px system-ui;
    ctx.fillText('🐂', w * 0.82, h * 0.74);

    // Tagging / Vaccination Shield Badge above cattle
    const badgeY = h * 0.32 + Math.sin(t * 3) * 6;
    ctx.fillStyle = '#ffffff';
    this.roundRect(ctx, w * 0.52, badgeY, w * 0.32, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#15803d';
    ctx.font = old px system-ui;
    ctx.fillText('🛡️ प्रमाणित टीकाकृत (Vaccinated)', w * 0.68, badgeY + 28);

    // Flying sparkles of health
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 8; i++) {
      const sx = w * 0.5 + Math.sin(t * 2 + i) * 120;
      const sy = h * 0.5 + Math.cos(t * 3 + i) * 60;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    this.renderSceneTitleBanner(ctx, w, h, 'Scene 4 • लाभ और रोकथाम', 'स्वस्थ पशु, सुरक्षित किसान — नुकसान से संपूर्ण बचाव');
  }

  // SCENE 5 (40-45s): Ending & Call to Action - Centered Emblem, Dual Slogan
  renderScene5_Outro(ctx, w, h, t) {
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
    ctx.translate(w * 0.5, h * 0.36);
    ctx.scale(pulse, pulse);

    // Outer glow
    const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 120);
    glowGrad.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
    glowGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 120, 0, Math.PI * 2);
    ctx.fill();

    // Emblem Shield Icon
    ctx.font = ${Math.round(h * 0.24)}px system-ui;
    ctx.textAlign = 'center';
    ctx.fillText('🛡️🐄', 0, 20);
    ctx.restore();

    // Brand Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = old px system-ui;
    ctx.fillText('PashuSuraksha', w * 0.5, h * 0.62);

    // Sub-titles
    ctx.fillStyle = '#fef08a';
    ctx.font = old px system-ui;
    ctx.fillText('बीमारी की पहचान जल्दी, कार्रवाई सही समय पर।', w * 0.5, h * 0.72);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = 600 px system-ui;
    ctx.fillText('Detect Early • Protect Livestock • Empower Farmers', w * 0.5, h * 0.81);

    // Interactive CTA button preview
    ctx.fillStyle = '#10b981';
    this.roundRect(ctx, w * 0.36, h * 0.86, w * 0.28, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#064e3b';
    ctx.font = old px system-ui;
    ctx.fillText('⚡ अभी रिपोर्ट दर्ज करें (Report Now)', w * 0.5, h * 0.92);
  }

  // ==========================================
  // HELPER DRAWING METHODS
  // ==========================================
  renderSceneTitleBanner(ctx, w, h, sceneTag, bannerText) {
    // Top banner ribbon
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.roundRect(ctx, w * 0.1, 16, w * 0.8, 48, 8);
    ctx.fill();
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.font = old px system-ui;
    ctx.fillText(sceneTag, w * 0.5, 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = old px system-ui;
    ctx.fillText(bannerText, w * 0.5, 55);
  }

  renderWorkflowCard(ctx, x, y, w, h, title, items, active) {
    ctx.fillStyle = active ? '#1e293b' : '#0f172a';
    this.roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = active ? '#10b981' : '#334155';
    ctx.lineWidth = active ? 2.5 : 1;
    ctx.stroke();

    ctx.fillStyle = active ? '#34d399' : '#94a3b8';
    ctx.font = old px system-ui;
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 14, y + 28);

    items.forEach((item, idx) => {
      ctx.fillStyle = active ? '#ffffff' : '#64748b';
      ctx.font = ${Math.round(h * 0.062)}px system-ui;
      ctx.fillText(item, x + 16, y + 68 + idx * 32);
    });
  }

  renderRiskAlertCard(ctx, x, y, w, h, t, active) {
    ctx.fillStyle = active ? '#1e293b' : '#0f172a';
    this.roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = active ? '#e11d48' : '#334155';
    ctx.lineWidth = active ? 2.5 : 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = active ? '#f43f5e' : '#94a3b8';
    ctx.font = old px system-ui;
    ctx.fillText('3. एआई जोखिम व सूचना (AI Alert)', x + 14, y + 28);

    if (active) {
      // Risk meter badge
      ctx.fillStyle = '#fee2e2';
      this.roundRect(ctx, x + 14, y + 50, w - 28, 38, 6);
      ctx.fill();
      ctx.fillStyle = '#991b1b';
      ctx.font = old px system-ui;
      ctx.fillText('🚨 HIGH RISK: FMD / LSD', x + 24, y + 74);

      // Automatic alert dispatch to DVO
      ctx.fillStyle = '#dbeafe';
      this.roundRect(ctx, x + 14, y + 100, w - 28, 55, 6);
      ctx.fill();
      ctx.fillStyle = '#1e40af';
      ctx.font = old px system-ui;
      ctx.fillText('📲 पशु चिकित्सक को अलर्ट प्रेषित:', x + 24, y + 120);
      ctx.font = ${Math.round(h * 0.045)}px system-ui;
      ctx.fillText('डॉ. सुनील (DVO) को SMS प्रेषित', x + 24, y + 142);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = ${Math.round(h * 0.06)}px system-ui;
      ctx.fillText('Waiting for symptoms...', x + 16, y + 75);
    }
  }

  drawArrow(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 8, y2 - 5);
    ctx.lineTo(x2 - 8, y2 + 5);
    ctx.closePath();
    ctx.fill();
  }

  renderVignette(ctx, w, h, color) {
    const rad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.65);
    rad.addColorStop(0, 'rgba(0,0,0,0)');
    rad.addColorStop(1, color);
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);
  }

  renderVideoHUD(ctx, w, h, time) {
    // Bottom thin scrub bar on canvas
    const barH = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
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

  openModal() {
    const modal = document.getElementById('farmerVideoModal');
    if (modal) {
      modal.style.display = 'flex';
      this.setupCanvasDPI();
      this.play();
    }
  }

  closeModal() {
    const modal = document.getElementById('farmerVideoModal');
    if (modal) {
      modal.style.display = 'none';
      this.pause();
    }
  }
}

window.FarmerVideoManager = new FarmerVideoPlayer();

document.addEventListener('DOMContentLoaded', () => {
  window.FarmerVideoManager.init();
});
