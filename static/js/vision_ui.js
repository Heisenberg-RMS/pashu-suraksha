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

    window.addEventListener('languageChanged', (e) => {
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
    const lang = (window.I18n && window.I18n.currentLanguage) ? window.I18n.currentLanguage : 'hi';

    if (resultCard) {
      resultCard.innerHTML = `
        <div style="text-align:center; padding:2.5rem 1.5rem; color:#0f766e;">
          <div class="spinner" style="font-size:2.5rem; margin-bottom:1rem; animation:spin 1s linear infinite;">⚙️</div>
          <h3 style="color:#0f766e; margin-bottom:0.35rem;">AI Deep Lesion Analysis in Progress...</h3>
          <p style="font-size:0.85rem; color:#64748b;">Scanning morphological patterns, erythema, vesicular contours, and ulcer margins...</p>
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

    card.innerHTML = `
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
}

window.VisionManager = new VisionDiagnosticsManager();
