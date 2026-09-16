/**
 * Pashu Suraksha - Visual Lesion & AI Image Diagnostic UI Controller
 * Allows livestock farmers and para-vets to photograph/upload animal skin lesions or post-mortem signs
 * to get instantaneous visual AI differential diagnosis, clinical guidance, and home-care protocols.
 * Supports Marathi, Hindi, English, and Telugu.
 */

class VisionDiagnosticsManager {
  constructor() {
    this.currentDiagnosis = null;
    this.currentImageDataUrl = null;
    this.currentFilename = null;
    this.selectedTargetRegion = 'auto';
    this.atlasCatalog = [];
    this.currentAtlasFilter = 'ALL';
    this.geminiActive = false;
    this.currentSearchQuery = '';

    window.addEventListener('languageChanged', (e) => {
      // Re-render photo atlas with newly selected language
      this.renderPhotoAtlas();

      if (this.currentDiagnosis && this.currentImageDataUrl) {
        // Re-analyze with new language to refresh translated diagnostic report
        this.analyzeImage(this.currentImageDataUrl, this.currentFilename || "scan.jpg", this.selectedTargetRegion);
      }
    });
  }

  init() {
    this.setupDropzone();
    this.setupTargetRegionPills();
    this.checkGeminiStatus();
    this.loadPhotoAtlas();
  }


  setupTargetRegionPills() {
    const pills = document.querySelectorAll('.scan-target-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.selectedTargetRegion = pill.dataset.target || 'auto';

        // If an image is already loaded, re-analyze with the selected target body region
        if (this.currentImageDataUrl) {
          this.analyzeImage(this.currentImageDataUrl, this.currentFilename || "scan.jpg", this.selectedTargetRegion);
        }
      });
    });
  }

  setupDropzone() {
    const fileInput = document.getElementById('visionImageFileInput');
    const cameraInput = document.getElementById('visionCameraInput');
    const dropzone = document.getElementById('visionDropzone');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFile(e.target.files[0]);
        }
      });
    }

    if (cameraInput) {
      cameraInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFile(e.target.files[0]);
        }
      });
    }

    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleImageFile(e.dataTransfer.files[0]);
        }
      });
    }
  }

  setupSamplePresets() {
    const presetButtons = document.querySelectorAll('.sample-preset-btn');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const hint = btn.dataset.hint;
        const name = btn.dataset.name;
        const icon = btn.dataset.icon || '📸';
        this.runSamplePreset(hint, name, icon);
      });
    });
  }

  handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentImageDataUrl = e.target.result;
      this.currentFilename = file.name;
      this.renderImagePreview(e.target.result, file.name);
      this.analyzeImage(e.target.result, file.name, this.selectedTargetRegion);
    };
    reader.readAsDataURL(file);
  }

  runSamplePreset(hint, displayName, icon) {
    // Generate simulated canvas lesion for realistic preview
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Draw stylized veterinary scan card
    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    // Reticle
    ctx.strokeStyle = hint === 'healthy' ? '#10b981' : '#0f766e';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, 320, 220);

    ctx.font = '54px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(icon, 200, 140);

    ctx.font = 'bold 16px system-ui';
    ctx.fillStyle = hint === 'healthy' ? '#86efac' : '#a7f3d0';
    ctx.fillText(`[SPECIMEN SCAN: ${displayName.toUpperCase()}]`, 200, 195);

    ctx.font = '12px system-ui';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Pillow AI Vector Extraction in progress...', 200, 225);

    const dataUrl = canvas.toDataURL('image/jpeg');
    this.currentImageDataUrl = dataUrl;
    this.currentFilename = `sample_${hint}.jpg`;
    this.renderImagePreview(dataUrl, `Sample_${hint}.jpg`);
    this.analyzeImage(dataUrl, `sample_${hint}.jpg`, hint);
  }

  renderImagePreview(dataUrl, label) {
    const previewContainer = document.getElementById('visionPreviewContainer');
    const dropzoneContent = document.getElementById('visionDropzoneContent');
    const previewImg = document.getElementById('visionPreviewImage');
    const fileLabel = document.getElementById('visionFileLabel');

    if (dropzoneContent) dropzoneContent.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'block';
    if (previewImg) previewImg.src = dataUrl;
    if (fileLabel) fileLabel.innerText = label || 'Captured Image';
  }

  async analyzeImage(dataUrl, filename, hint) {
    const resultCard = document.getElementById('visionResultCard');
    const dropzone = document.getElementById('visionDropzone');
    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';

    if (dropzone) dropzone.classList.add('scanning');

    if (resultCard) {
      resultCard.innerHTML = `
        <div style="text-align:center; padding:3rem 1.5rem; color:#0f766e;">
          <div class="spinner" style="font-size:3rem; margin-bottom:1rem; animation:spin 1s linear infinite;">🔍</div>
          <h3 style="color:#0f766e; margin-bottom:0.35rem; font-size:1.2rem;">एआई जांच जारी है (Analyzing Animal Photo...)</h3>
          <p style="font-size:0.88rem; color:#64748b;">त्वचा, मुंह व लक्षणों की जांच की जा रही है, कृपया 2 सेकंड प्रतीक्षा करें...</p>
        </div>
      `;
    }

    try {
      const res = await fetch('/api/image-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: dataUrl,
          filename: filename,
          hint: hint || this.selectedTargetRegion || 'auto',
          language: lang
        })
      });

      const diagnosis = await res.json();
      this.currentDiagnosis = diagnosis;
      this.renderDiagnosisReport(diagnosis);

    } catch (err) {
      console.error('Vision analysis error:', err);
      if (resultCard) {
        resultCard.innerHTML = `<div style="padding:1.5rem; color:#e11d48;">Error running visual AI analysis. Please check connection.</div>`;
      }
    } finally {
      if (dropzone) dropzone.classList.remove('scanning');
    }
  }

  renderDiagnosisReport(d) {
    const card = document.getElementById('visionResultCard');
    if (!card) return;

    const isHealthy = d.severity === 'NORMAL' || d.disease_code === 'HEALTHY';
    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';
    const isGemini = d.is_gemini || (d.ai_engine && d.ai_engine.toLowerCase().includes('gemini'));

    // Speech summary text for text-to-speech
    let speechText = '';
    if (isHealthy) {
      speechText = (lang === 'hi')
        ? `जांच परिणाम: पशु पूर्णतः स्वस्थ है। कोई बीमारी या घाव नहीं पाया गया। रोज 40 ग्राम खनिज मिश्रण दें और साफ पानी रखें।`
        : ((lang === 'mr')
          ? `तपासणी निकाल: जनावर पूर्णपणे निरोगी आहे. कोणताही आजार आढळला नाही. नियमित सकस आहार व वेळेवर लस द्या.`
          : ((lang === 'te')
            ? `ఫలితం: పశువు పూర్తిగా ఆరోగ్యంగా ఉంది. ఎలాంటి వ్యాధి లక్షణాలు లేవు.`
            : `Inspection Result: Animal is completely healthy. No disease or lesions detected.`));
    } else {
      speechText = (lang === 'hi')
        ? `सावधानी! पशु में ${d.disease_name} के लक्षण पाए गए हैं। तुरंत अन्य पशुओं से अलग बांधें और पशु चिकित्सक को दिखाएं।`
        : ((lang === 'mr')
          ? `सावधान! जनावरामध्ये ${d.disease_name} ची लक्षणे आढळली आहेत. त्वरित इतर जनावरांपासून वेगळे करा आणि डॉक्टरांना दाखवा.`
          : ((lang === 'te')
            ? `హెచ్చరిక! పశువులో ${d.disease_name} లక్షణాలు కనిపించాయి. వెంటనే వేరు చేసి డాక్టర్ ని సంప్రదించండి.`
            : `Warning! Symptoms of ${d.disease_name} detected. Please isolate the animal immediately and call a veterinary doctor.`));
    }
    this.currentSpeechText = speechText;

    // Header banner
    const headerBanner = isHealthy
      ? `
        <div style="background:linear-gradient(135deg, #15803d 0%, #166534 100%); color:white; border-radius:10px; padding:1.15rem; margin-bottom:1rem; box-shadow:0 4px 12px rgba(22,101,52,0.2);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <span class="badge" style="background:rgba(255,255,255,0.25); color:white; border:1px solid rgba(255,255,255,0.4); font-weight:800; font-size:0.76rem; letter-spacing:0.5px;">
                ✅ स्वस्थ गोवंश (HEALTHY BOVINE)
              </span>
              <h2 style="margin:0.4rem 0 0.15rem 0; font-size:1.35rem; color:#ffffff; font-weight:800;">
                बधाई! पशु पूर्णतः स्वस्थ है
              </h2>
              <p style="margin:0; font-size:0.86rem; opacity:0.95; font-weight:500;">
                ${d.lesion_type || 'कोई सक्रिय बीमारी या घाव नहीं मिला'}
              </p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.8rem; font-weight:900; line-height:1; color:#86efac;">${d.visual_confidence}%</div>
              <small style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px; opacity:0.85;">निश्चितता (Accuracy)</small>
            </div>
          </div>
        </div>
      `
      : `
        <div style="background:linear-gradient(135deg, #be123c 0%, #9f1239 100%); color:white; border-radius:10px; padding:1.15rem; margin-bottom:1rem; box-shadow:0 4px 12px rgba(159,18,57,0.25);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
            <div>
              <span class="badge" style="background:#fecaca; color:#991b1b; font-weight:800; font-size:0.76rem; letter-spacing:0.5px;">
                🚨 बीमारी के लक्षण मिले (DISEASE DETECTED)
              </span>
              ${d.is_zoonotic ? '<span class="badge" style="background:#fee2e2; color:#b91c1c; font-weight:800; margin-left:4px;">इंसानों में फैलने का खतरा (ZOONOSIS)</span>' : ''}
              <h2 style="margin:0.4rem 0 0.15rem 0; font-size:1.35rem; color:#ffffff; font-weight:800;">
                ${d.disease_name}
              </h2>
              <p style="margin:0; font-size:0.86rem; opacity:0.95; font-weight:500;">
                लक्षण: ${d.lesion_type}
              </p>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.8rem; font-weight:900; line-height:1; color:#fecdd3;">${d.visual_confidence}%</div>
              <small style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.5px; opacity:0.85;">निश्चितता (Confidence)</small>
            </div>
          </div>
        </div>
      `;

    // Voice Readout Button Bar
    const voiceBarHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:0.6rem 0.85rem; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
        <div style="display:flex; align-items:center; gap:0.4rem; font-size:0.82rem; color:#0369a1; font-weight:700;">
          <span>🔊</span> <span>ऑडियो सलाह (Listen Audio):</span>
        </div>
        <button type="button" class="farmer-voice-btn" id="visionVoiceBtn" onclick="window.VisionManager.speakCurrentDiagnosis()">
          <span>🔊</span> <span id="visionVoiceBtnText">बोलकर सुनें (Listen)</span>
        </button>
      </div>
    `;

    // Critical Biohazard Banner (if Anthrax)
    const biohazardHtml = d.biohazard_alert ? `
      <div style="background:#fee2e2; border:2px solid #ef4444; border-radius:8px; padding:0.85rem; margin-bottom:1rem; color:#991b1b; display:flex; gap:0.6rem; align-items:flex-start;">
        <span style="font-size:1.6rem; line-height:1;">🛑</span>
        <div style="font-size:0.88rem; line-height:1.4;">
          <b style="color:#b91c1c; font-size:0.95rem;">अत्यंत जरूरी चेतावनी (CRITICAL WARNING):</b><br>
          ${d.biohazard_alert}
        </div>
      </div>
    ` : '';

    // Farmer Precautionary Card
    const adviceHtml = d.precautionary_advice ? `
      <div style="background:${isHealthy ? '#f0fdf4' : '#fff7ed'}; border:1.5px solid ${isHealthy ? '#86efac' : '#fdba74'}; border-radius:8px; padding:0.85rem 1rem; margin-bottom:1rem; color:${isHealthy ? '#166534' : '#9a3412'};">
        <b style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.35rem; font-size:0.92rem;">
          <span>${isHealthy ? '🛡️' : '🚨'}</span>
          <span>${isHealthy ? 'पशुपालक के लिए जरूरी सलाह' : 'पशुपालक तुरंत क्या करें (Immediate Action)'}</span>
        </b>
        <p style="margin:0; font-size:0.88rem; line-height:1.45; font-weight:600;">
          ${d.precautionary_advice}
        </p>
      </div>
    ` : '';

    // 3 Practical Steps for Farmers
    const stepsTitle = isHealthy ? '🌱 स्वस्थ पशु के लिए दैनिक देखभाल (Daily Care Checklist):' : '🩺 तुरंत ये कदम उठाएं (Immediate Steps to Take):';
    const stepsList = (d.immediate_home_care || []).map((step, idx) => `
      <div class="farmer-step-item">
        <span class="farmer-step-num" style="${isHealthy ? 'background:#16a34a;' : 'background:#ea580c;'}">${idx + 1}</span>
        <div style="color:#334155; font-weight:500;">${step}</div>
      </div>
    `).join('');

    const stepsHtml = `
      <div style="margin-bottom:1.15rem;">
        <b style="font-size:0.88rem; color:#1e293b; display:block; margin-bottom:0.5rem;">${stepsTitle}</b>
        ${stepsList}
      </div>
    `;

    // Action Buttons for Farmers
    const actionButtonsHtml = `
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
        <a href="tel:1962" class="btn" style="flex:1; min-width:140px; background:#dc2626; color:white; font-weight:700; display:flex; align-items:center; justify-content:center; gap:0.35rem; text-decoration:none; padding:0.6rem;">
          📞 1962 डॉक्टर कॉल
        </a>
        <button type="button" class="btn btn-primary" style="flex:1; min-width:140px; font-weight:700;" onclick="window.VisionManager.attachToReport()">
          📝 रिपोर्ट दर्ज करें
        </button>
        <button type="button" class="btn btn-outline" style="flex:1; min-width:140px; font-weight:700;" onclick="window.VisionManager.askChatbotAboutLesion()">
          💬 AI डॉक्टर से पूछें
        </button>
      </div>
    `;

    // Collapsible Technical/Lab Accordion for Vets & Officers
    const metrics = d.metrics || {};
    const techAccordionHtml = `
      <details style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.65rem 0.85rem; font-size:0.8rem; color:#64748b;">
        <summary style="cursor:pointer; font-weight:700; color:#475569;">
          🔬 पशु चिकित्सक व तकनीकी विवरण (Veterinary & Lab Details)
        </summary>
        <div style="margin-top:0.65rem; border-top:1px solid #e2e8f0; padding-top:0.65rem;">
          <div style="margin-bottom:0.4rem;">
            <b>AI Engine:</b> ${isGemini ? '✨ Google Gemini 2.0 Vision Multimodal' : '⚡ Local Veterinary Neural Engine'}
          </div>
          ${d.lab_specimen_needed ? `
            <div style="margin-bottom:0.4rem;">
              <b>🧪 Lab Specimen:</b> ${d.lab_specimen_needed}
            </div>
          ` : ''}
          ${metrics.luminance !== undefined ? `
            <div style="margin-bottom:0.4rem;">
              <b>📊 CV Metrics:</b> Texture Roughness: ${metrics.roughness_score || 0}% | Redness Index: ${metrics.redness_index || 0} | Dark Blood: ${metrics.dark_blood_ratio || 0}%
            </div>
          ` : ''}
          ${d.pathognomonic_markers && d.pathognomonic_markers.length ? `
            <div>
              <b>🔍 Clinical Hallmarks:</b> ${d.pathognomonic_markers.join(' • ')}
            </div>
          ` : ''}
        </div>
      </details>
    `;

    card.innerHTML = `
      ${headerBanner}
      ${voiceBarHtml}
      ${biohazardHtml}
      ${adviceHtml}
      ${stepsHtml}
      ${actionButtonsHtml}
      ${techAccordionHtml}
    `;
  }

  speakCurrentDiagnosis() {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      const btn = document.getElementById('visionVoiceBtn');
      const text = document.getElementById('visionVoiceBtnText');
      if (btn) btn.classList.remove('speaking');
      if (text) text.innerText = 'बोलकर सुनें (Listen)';
      return;
    }

    if (!this.currentSpeechText) return;

    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';
    const utterance = new SpeechSynthesisUtterance(this.currentSpeechText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : (lang === 'mr' ? 'mr-IN' : (lang === 'te' ? 'te-IN' : 'en-IN'));
    utterance.rate = 0.95;

    const btn = document.getElementById('visionVoiceBtn');
    const text = document.getElementById('visionVoiceBtnText');
    if (btn) btn.classList.add('speaking');
    if (text) text.innerText = '⏹️ रोकें (Stop)';

    utterance.onend = () => {
      if (btn) btn.classList.remove('speaking');
      if (text) text.innerText = 'बोलकर सुनें (Listen)';
    };
    utterance.onerror = () => {
      if (btn) btn.classList.remove('speaking');
      if (text) text.innerText = 'बोलकर सुनें (Listen)';
    };

    window.speechSynthesis.speak(utterance);
  }

  attachToReport() {
    if (!this.currentDiagnosis) return;
    const d = this.currentDiagnosis;

    // Switch to Triage Tab
    window.App.switchTab('triage');

    // Auto-select species
    const species = d.affected_species.includes('Cattle') ? 'Cattle' : (d.affected_species.includes('Goat') ? 'Goat' : 'Cattle');
    const card = document.querySelector(`.species-card[data-species="${species}"]`);
    if (card) card.click();

    // Fill notes with visual AI findings
    const notesInput = document.getElementById('reportNotesInput');
    if (notesInput) {
      notesInput.value = `[AI Visual Inspection]: ${d.disease_name} detected with ${d.visual_confidence}% confidence. Lesion type: ${d.lesion_type}.`;
    }

    // Toggle matching symptom if available
    const toggle = window.TriageManager?.toggleSymptom || window.toggleSymptom;
    const currentSymptoms = window.TriageManager?.selectedSymptoms || window.selectedSymptoms || new Set();

    if (toggle) {
      if (d.disease_code === 'FMD') {
        ['oral_vesicles', 'hoof_lesions', 'excessive_salivation'].forEach(id => {
          if (!currentSymptoms.has(id)) toggle(id);
        });
      } else if (d.disease_code === 'LSD') {
        ['skin_nodules', 'limb_edema'].forEach(id => {
          if (!currentSymptoms.has(id)) toggle(id);
        });
      } else if (d.disease_code === 'ANTHRAX') {
        ['sudden_unexplained_death', 'unclotted_dark_blood'].forEach(id => {
          if (!currentSymptoms.has(id)) toggle(id);
        });
      }
    }

    alert(`✅ Vision AI findings successfully transferred to Field Report!`);
  }

  askChatbotAboutLesion() {
    if (!this.currentDiagnosis) return;
    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';
    let query = `${this.currentDiagnosis.disease_name} के लक्षण और उपचार बताइए`;
    if (lang === 'mr') {
      query = `${this.currentDiagnosis.disease_name} ची लक्षणे आणि घरगुती उपचार सांगा`;
    } else if (lang === 'te') {
      query = `${this.currentDiagnosis.disease_name} లక్షణాలు మరియు చికిత్స వివరాలు తెలపండి`;
    } else if (lang === 'en') {
      query = `Tell me treatment and first-aid for ${this.currentDiagnosis.disease_name}`;
    }

    window.ChatbotManager.openChat();
    window.ChatbotManager.sendUserQuery(query);
  }

  resetScan() {
    this.currentDiagnosis = null;
    this.currentImageDataUrl = null;
    this.currentFilename = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const previewContainer = document.getElementById('visionPreviewContainer');
    const dropzoneContent = document.getElementById('visionDropzoneContent');
    const resultCard = document.getElementById('visionResultCard');

    if (dropzoneContent) dropzoneContent.style.display = 'block';
    if (previewContainer) previewContainer.style.display = 'none';

    if (resultCard) {
      resultCard.innerHTML = `
        <div style="text-align:center; padding:3.5rem 1.5rem; color:#94a3b8;">
          <div style="font-size:3.5rem; margin-bottom:0.85rem;">🔬</div>
          <h3 style="color:#475569; margin-bottom:0.35rem; font-size:1.15rem;" data-i18n="standby_title">एआई पशु स्वास्थ्य लेंस तैयार है</h3>
          <p style="font-size:0.88rem; color:#64748b; max-width:360px; margin:0 auto;" data-i18n="standby_desc">
            ऊपर दिए गए <strong>"कैमरा चालू करें"</strong> बटन से फोटो खींचें या ऊपर दिए गए <strong>"1-टैप परीक्षण नमूनों"</strong> पर क्लिक करें।
          </p>
        </div>
      `;
    }
  }

  /* ==========================================
     GEMINI MULTIMODAL VISION AI METHODS
     ========================================== */
  async checkGeminiStatus() {
    try {
      const res = await fetch('/api/vision/gemini-status');
      const data = await res.json();
      this.geminiActive = !!data.gemini_active;
      const badge = document.getElementById('geminiStatusBadge');
      if (badge) {
        if (this.geminiActive) {
          badge.className = 'gemini-status-pill active';
          badge.innerHTML = '✨ Gemini 2.0 Flash Active';
        } else {
          badge.className = 'gemini-status-pill local';
          badge.innerHTML = '⚡ Local Neural Engine Active';
        }
      }
    } catch (err) {
      console.warn('Gemini status check skipped/failed:', err);
    }
  }

  toggleApiKeyModal() {
    const panel = document.getElementById('geminiKeyPanel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        const input = document.getElementById('geminiApiKeyInput');
        if (input) input.focus();
      }
    }
  }

  async saveApiKey() {
    const input = document.getElementById('geminiApiKeyInput');
    const feedback = document.getElementById('geminiKeyFeedback');
    const key = input ? input.value.trim() : '';

    if (!key) {
      if (feedback) feedback.innerHTML = '<span style="color:#e11d48; font-weight:600;">Please enter a valid Google Gemini API Key.</span>';
      return;
    }

    if (feedback) feedback.innerHTML = '<span style="color:#6366f1;">Verifying & storing key...</span>';

    try {
      const res = await fetch('/api/vision/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key })
      });
      const data = await res.json();
      if (feedback) {
        feedback.innerHTML = '<span style="color:#059669; font-weight:700;">✅ Gemini API Key successfully saved for this session!</span>';
      }
      await this.checkGeminiStatus();
      setTimeout(() => this.toggleApiKeyModal(), 1200);
    } catch (err) {
      if (feedback) feedback.innerHTML = `<span style="color:#e11d48;">Error connecting: ${err.message}</span>`;
    }
  }

  async clearApiKey() {
    const input = document.getElementById('geminiApiKeyInput');
    const feedback = document.getElementById('geminiKeyFeedback');
    if (input) input.value = '';

    try {
      await fetch('/api/vision/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: '' })
      });
      if (feedback) {
        feedback.innerHTML = '<span style="color:#475569;">Key cleared. Switched back to local neural vision engine.</span>';
      }
      await this.checkGeminiStatus();
      setTimeout(() => this.toggleApiKeyModal(), 1000);
    } catch (err) {
      console.error('Error clearing key:', err);
    }
  }

  /* ==========================================
     PHOTO REFERENCE ATLAS & SAMPLE DATASET
     ========================================== */
  async loadPhotoAtlas() {
    try {
      const res = await fetch('/api/vision/catalog');
      this.atlasCatalog = await res.json();
      this.renderPhotoAtlas();
    } catch (err) {
      console.error('Error loading photo catalog:', err);
      const grid = document.getElementById('visionAtlasGrid');
      if (grid) grid.innerHTML = '<div style="color:#e11d48; padding:1.5rem; text-align:center;">Failed to load reference photo catalog.</div>';
    }
  }

  filterAtlas(category) {
    this.currentAtlasFilter = category || 'ALL';
    const buttons = document.querySelectorAll('.atlas-filter-btn');
    buttons.forEach(btn => {
      if (btn.dataset.category === this.currentAtlasFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    this.renderPhotoAtlas();
  }

  searchAtlas(query) {
    this.currentSearchQuery = (query || '').trim().toLowerCase();
    this.renderPhotoAtlas();
  }

  renderPhotoAtlas() {
    const grid = document.getElementById('visionAtlasGrid');
    if (!grid || !this.atlasCatalog || !this.atlasCatalog.length) return;

    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';
    const filter = this.currentAtlasFilter;
    const search = this.currentSearchQuery;

    let items = this.atlasCatalog;

    // Apply Category Filter
    if (filter === 'HEALTHY') {
      items = items.filter(item => item.category === 'HEALTHY');
    } else if (filter === 'EPIDEMIC') {
      items = items.filter(item => item.category === 'DISEASED' && ['FMD', 'LSD', 'ANTHRAX', 'HS', 'BLACKLEG_BQ'].includes(item.disease_code));
    } else if (filter === 'COMMON') {
      items = items.filter(item => item.category === 'DISEASED' && ['MASTITIS', 'TICK_INFESTATION'].includes(item.disease_code));
    }

    // Apply Search Query Filter if active
    if (search) {
      items = items.filter(item => {
        const textToSearch = [
          item.id,
          item.filename,
          item.disease_code || '',
          item.title_en || '',
          item.title_hi || '',
          item.title_mr || '',
          item.title_te || '',
          item.hallmark_en || '',
          item.hallmark_hi || '',
          item.hallmark_mr || '',
          item.hallmark_te || ''
        ].join(' ').toLowerCase();
        return textToSearch.includes(search);
      });
    }

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem 1.5rem; color:#64748b;">
          <div style="font-size:2.5rem; margin-bottom:0.5rem;">🔍</div>
          <div style="font-weight:700; font-size:1.05rem;">कोई फोटो नहीं मिली (No matching reference photos)</div>
          <p style="font-size:0.85rem; margin-top:0.25rem;">कृपया दूसरा शब्द खोजें या सभी नमूने (All Specimens) देखें।</p>
          <button class="btn btn-outline btn-sm" onclick="window.VisionManager.filterAtlas('ALL')" style="margin-top:0.5rem;">
            सभी 13 नमूने देखें (Show All 13)
          </button>
        </div>
      `;
      return;
    }

    const btnLabel = (window.I18n && typeof window.I18n.t === 'function')
      ? (window.I18n.t('btn_test_scan') || '⚡ 1-Click Test Scan')
      : '⚡ 1-Click Test Scan';

    grid.innerHTML = items.map(item => {
      const title = item['title_' + lang] || item.title_en;
      const hallmark = item['hallmark_' + lang] || item.hallmark_en;
      const isHealthy = item.category === 'HEALTHY';
      const isEpidemic = ['FMD', 'LSD', 'ANTHRAX', 'HS', 'BLACKLEG_BQ'].includes(item.disease_code);

      let badgeClass = 'atlas-badge-healthy';
      let badgeText = isHealthy ? '✅ HEALTHY' : (isEpidemic ? '🚨 EPIDEMIC' : '🩺 COMMON');
      if (!isHealthy) {
        badgeClass = isEpidemic ? 'atlas-badge-epidemic' : 'atlas-badge-common';
      }

      return `
        <div class="vision-atlas-card" onclick="window.VisionManager.loadSampleImage('${item.id}')" title="Click to test this image with AI Lens">
          <div class="atlas-card-thumbnail-wrap">
            <img class="atlas-card-thumbnail" src="/static/images/samples/${item.filename}" alt="${title}" loading="lazy">
            <span class="atlas-card-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="atlas-card-body">
            <div class="atlas-card-title">${title}</div>
            <div class="atlas-card-hallmark">${hallmark}</div>
            <div style="font-size:0.7rem; color:#0f766e; margin-bottom:0.5rem; font-weight:600; display:flex; align-items:center; gap:0.25rem;">
              <span>🏛️</span> <span>${item.source_org || 'Veterinary Clinical Reference'}</span>
            </div>
            <div style="display:flex; gap:0.35rem; margin-top:auto;">
              <button type="button" class="atlas-test-btn" style="flex:2;" onclick="event.stopPropagation(); window.VisionManager.loadSampleImage('${item.id}')">
                ${btnLabel}
              </button>
              <a href="${item.reference_url || ('/static/images/samples/' + item.filename)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="flex:1; padding:0.35rem 0.5rem; font-size:0.74rem; display:flex; align-items:center; justify-content:center; gap:0.2rem; text-decoration:none; white-space:nowrap; border-color:#cbd5e1; color:#334155;" onclick="event.stopPropagation();" title="View authentic source photograph in new tab">
                🔗 Web
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  async loadSampleImage(itemId) {
    if (!this.atlasCatalog || !this.atlasCatalog.length) {
      await this.loadPhotoAtlas();
    }
    const item = (this.atlasCatalog || []).find(it => it.id === itemId);
    if (!item) return;

    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';
    const title = item['title_' + lang] || item.title_en;

    // Update target region pill
    const targetRegion = item.target_region || 'auto';
    this.selectedTargetRegion = targetRegion;
    const pills = document.querySelectorAll('.scan-target-pill');
    pills.forEach(p => {
      if (p.dataset.target === targetRegion) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    try {
      const res = await fetch(`/static/images/samples/${item.filename}`);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        this.currentImageDataUrl = dataUrl;
        this.currentFilename = item.filename;
        this.renderImagePreview(dataUrl, title);
        this.analyzeImage(dataUrl, item.filename, item.disease_code || targetRegion);

        // Scroll to result card
        const resultCard = document.getElementById('visionResultCard');
        if (resultCard) {
          resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading sample image:', err);
    }
  }
}

window.VisionManager = new VisionDiagnosticsManager();

