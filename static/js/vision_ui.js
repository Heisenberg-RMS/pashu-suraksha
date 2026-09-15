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
    this.setupSamplePresets();
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
        <div style="text-align:center; padding:2.5rem 1.5rem; color:#8b5cf6;">
          <div class="spinner" style="font-size:2.8rem; margin-bottom:1rem; animation:spin 1s linear infinite;">🔮</div>
          <h3 style="color:#6d28d9; margin-bottom:0.35rem;">AI Visual Lesion Scanning in Progress...</h3>
          <p style="font-size:0.85rem; color:#64748b;">Extracting erythema vectors, mucosal contours, and nodular roughness...</p>
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
    const urgencyClass = isHealthy ? 'healthy' : (d.severity || 'high').toLowerCase();
    const confidenceColor = isHealthy ? '#059669' : (urgencyClass === 'critical' ? '#e11d48' : '#0f766e');

    const metrics = d.metrics || {};
    const metricSummary = metrics.summary || 'Visual Feature Extraction Complete';

    const isGemini = d.is_gemini || (d.ai_engine && d.ai_engine.toLowerCase().includes('gemini'));
    const engineBadgeHtml = isGemini
      ? `<span class="badge" style="background:#ede9fe; color:#5b21b6; border:1px solid #c4b5fd; font-weight:700; margin-bottom:6px; display:inline-flex; align-items:center; gap:0.25rem;">✨ Google Gemini 2.0 Vision AI</span>`
      : `<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:600; margin-bottom:6px; display:inline-flex; align-items:center; gap:0.25rem;">⚡ Local Veterinary Neural Engine</span>`;

    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';
    const adviceTitle = isHealthy
      ? (window.I18n ? window.I18n.t('precaution_title_healthy') : 'Farmer Biosecurity & Maintenance Advice')
      : (window.I18n ? window.I18n.t('precaution_title_disease') : 'Immediate Farmer Precautionary & Biosecurity Advice');

    const adviceBg = isHealthy ? '#f0fdf4' : (urgencyClass === 'critical' ? '#fff1f2' : '#fffbeb');
    const adviceBorder = isHealthy ? '#86efac' : (urgencyClass === 'critical' ? '#fda4af' : '#fde68a');
    const adviceColor = isHealthy ? '#166534' : (urgencyClass === 'critical' ? '#9f1239' : '#92400e');
    const adviceIcon = isHealthy ? '🛡️' : '🚨';

    card.innerHTML = `
      <div style="margin-bottom:0.6rem;">
        ${engineBadgeHtml}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem; border-bottom:1px solid #e2e8f0; padding-bottom:0.75rem;">
        <div>
          <span class="badge ${isHealthy ? 'badge-healthy' : 'badge-' + urgencyClass}" style="${isHealthy ? 'background:#dcfce7; color:#15803d; font-weight:700;' : ''}">
            ${isHealthy ? '✅ NORMAL / HEALTHY PROFILE' : d.severity + ' EPIDEMIOLOGICAL SEVERITY'}
          </span>
          ${d.is_zoonotic ? '<span class="badge badge-critical" style="margin-left:4px;">ZOONOTIC RISK</span>' : ''}
          <h2 style="margin:0.4rem 0 0.1rem 0; font-size:1.3rem; color:${isHealthy ? '#166534' : '#0f172a'};">${d.disease_name}</h2>
          <small style="color:#64748b; font-weight:600;">Lesion Pattern: ${d.lesion_type}</small>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1.8rem; font-weight:800; color:${confidenceColor};">${d.visual_confidence}%</div>
          <small style="font-size:0.72rem; color:#64748b; font-weight:700; text-transform:uppercase;">AI Visual Confidence</small>
        </div>
      </div>

      <!-- CV Image Inspection Metrics Bar -->
      <div style="background:#f1f5f9; border-radius:6px; padding:0.4rem 0.6rem; margin-bottom:0.85rem; font-size:0.75rem; color:#475569; display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.4rem;">
        <span>🔍 <b>Features:</b> ${metricSummary}</span>
        ${metrics.luminance !== undefined ? `<span>💡 Light: <b>${metrics.luminance}%</b> | Redness: <b>${metrics.redness_index || 0}</b> | Texture: <b>${metrics.roughness_score || 0}%</b></span>` : ''}
      </div>

      ${d.biohazard_alert ? `
        <div class="biohazard-banner" style="margin-bottom:1rem;">
          <span style="font-size:1.5rem;">🚨</span>
          <div>
            <b>CRITICAL BIOHAZARD ALERT:</b><br>
            ${d.biohazard_alert}
          </div>
        </div>
      ` : ''}

      <!-- FARMER PRECAUTIONARY & BIOSECURITY ADVICE CARD -->
      ${d.precautionary_advice ? `
        <div class="precautionary-advice-card" style="background:${adviceBg}; border:1.5px solid ${adviceBorder}; border-radius:8px; padding:0.85rem; margin-bottom:1rem; color:${adviceColor};">
          <b style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.35rem; font-size:0.9rem;">
            <span>${adviceIcon}</span> ${adviceTitle}
          </b>
          <p style="margin:0; font-size:0.85rem; line-height:1.45; font-weight:600;">
            ${d.precautionary_advice}
          </p>
        </div>
      ` : ''}

      <!-- Visual Hallmarks -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:0.85rem; margin-bottom:1rem; font-size:0.85rem;">
        <b style="color:#334155;">🔍 Detected Pathognomonic Visual Markers:</b>
        <ul style="margin:0.4rem 0 0 1.2rem; color:#475569;">
          ${(d.pathognomonic_markers || []).map(m => `<li style="margin-bottom:0.25rem;">${m}</li>`).join('')}
        </ul>
      </div>

      <!-- Immediate Home Care -->
      <div style="background:${isHealthy ? '#f0fdf4' : '#fef2f2'}; border:1px solid ${isHealthy ? '#bbf7d0' : '#fecaca'}; border-radius:8px; padding:0.85rem; margin-bottom:1rem; font-size:0.85rem; color:${isHealthy ? '#166534' : '#991b1b'};">
        <b style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.4rem;">
          <span>${isHealthy ? '🌱' : '🩺'}</span> ${isHealthy ? 'Routine Animal Care & Prevention Protocol:' : 'Immediate Field Care & First-Aid Protocol:'}
        </b>
        <ol style="margin:0 0 0 1.2rem;">
          ${(d.immediate_home_care || []).map(care => `<li style="margin-bottom:0.35rem;">${care}</li>`).join('')}
        </ol>
      </div>


      <!-- Lab specimen needed -->
      <div style="font-size:0.82rem; color:#475569; margin-bottom:1rem; background:#fff; border:1px solid #e2e8f0; padding:0.6rem 0.8rem; border-radius:6px;">
        🧪 <b>Recommended Confirmatory Laboratory Specimen:</b><br>
        ${d.lab_specimen_needed}
      </div>

      <!-- Secondary Differentials (if any) -->
      ${d.differential_diagnoses && d.differential_diagnoses.length ? `
        <div style="margin-bottom:1.25rem; font-size:0.78rem; color:#64748b;">
          <b>Differential Diagnoses:</b>
          ${d.differential_diagnoses.map(diff => `
            <span style="display:inline-block; background:#e2e8f0; padding:2px 6px; border-radius:4px; margin-right:4px; margin-top:2px;">
              ${diff.disease_code} (${diff.differential_probability}%)
            </span>
          `).join('')}
        </div>
      ` : ''}

      <!-- Quick Action Buttons -->
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button class="btn btn-primary" style="flex:1;" onclick="window.VisionManager.attachToReport()">
          📝 Auto-Fill Official Disease Report
        </button>
        <button class="btn btn-outline" style="flex:1;" onclick="window.VisionManager.askChatbotAboutLesion()">
          💬 Ask AI Chatbot About This
        </button>
      </div>
    `;
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
    const previewContainer = document.getElementById('visionPreviewContainer');
    const dropzoneContent = document.getElementById('visionDropzoneContent');
    const resultCard = document.getElementById('visionResultCard');

    if (dropzoneContent) dropzoneContent.style.display = 'block';
    if (previewContainer) previewContainer.style.display = 'none';

    if (resultCard) {
      resultCard.innerHTML = `
        <div style="text-align:center; padding:3rem 1.5rem; color:#94a3b8;">
          <div style="font-size:3rem; margin-bottom:0.75rem;">🔬</div>
          <h3 style="color:#64748b; margin-bottom:0.35rem;" data-i18n="standby_title">AI Vision Diagnostics Standby</h3>
          <p style="font-size:0.85rem;" data-i18n="standby_desc">Capture or upload a photo of the affected animal's skin, mouth, hooves, or udder to detect disease lesions.</p>
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

  renderPhotoAtlas() {
    const grid = document.getElementById('visionAtlasGrid');
    if (!grid || !this.atlasCatalog || !this.atlasCatalog.length) return;

    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';
    const filter = this.currentAtlasFilter;

    let items = this.atlasCatalog;
    if (filter === 'HEALTHY') {
      items = items.filter(item => item.category === 'HEALTHY');
    } else if (filter === 'EPIDEMIC') {
      items = items.filter(item => item.category === 'DISEASED' && ['FMD', 'LSD', 'ANTHRAX', 'HS', 'BLACKLEG_BQ'].includes(item.disease_code));
    } else if (filter === 'COMMON') {
      items = items.filter(item => item.category === 'DISEASED' && ['MASTITIS', 'TICK_INFESTATION'].includes(item.disease_code));
    }

    const btnLabel = (window.I18n && typeof window.I18n.t === 'function')
      ? window.I18n.t('btn_test_scan')
      : '🔬 Test AI Scan';

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
        <div class="vision-atlas-card" onclick="window.VisionManager.loadSampleImage('${item.id}')">
          <div class="atlas-card-thumbnail-wrap">
            <img class="atlas-card-thumbnail" src="/static/images/samples/${item.filename}" alt="${title}" loading="lazy">
            <span class="atlas-card-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="atlas-card-body">
            <div class="atlas-card-title">${title}</div>
            <div class="atlas-card-hallmark">${hallmark}</div>
            <button type="button" class="atlas-test-btn" onclick="event.stopPropagation(); window.VisionManager.loadSampleImage('${item.id}')">
              ${btnLabel}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  async loadSampleImage(itemId) {
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
        this.analyzeImage(dataUrl, item.filename, targetRegion);

        // Scroll to dropzone preview
        const dropzone = document.getElementById('visionDropzone');
        if (dropzone) {
          dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Error loading sample image:', err);
    }
  }
}

window.VisionManager = new VisionDiagnosticsManager();

