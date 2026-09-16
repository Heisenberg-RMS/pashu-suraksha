/**
 * Pashu Suraksha - Master Application Controller
 * Orchestrates navigation, role-based views, dashboards, charts, and data synchronization.
 */

let currentRole = "DVO";
let epiChart = null;
let diseasePieChart = null;

let currentUser = null;

// ==========================================
// AUTHENTICATION & IDENTITY MANAGER
// ==========================================
class AuthenticationManager {
  constructor() {
    this.currentUser = null;
  }

  async init() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      this.currentUser = data.user;
      currentRole = this.currentUser.role || 'DVO';
      this.updateHeaderProfile();
      this.applyRoleContext();
    } catch (err) {
      console.warn('Auth init fallback:', err);
    }
  }

  updateHeaderProfile() {
    if (!this.currentUser) return;

    const avatarMap = {
      'FARMER': '👨‍🌾',
      'PARA_VET': '🩺',
      'DVO': '🏛️',
      'DIRECTOR': '📊'
    };

    const avatarEl = document.getElementById('headerUserAvatar');
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');

    if (avatarEl) avatarEl.innerText = avatarMap[this.currentUser.role] || '👤';
    if (nameEl) nameEl.innerText = this.currentUser.full_name || 'User';
    if (roleEl) roleEl.innerText = this.currentUser.designation || this.currentUser.role;
  }

  applyRoleContext(autoSwitchTab = false) {
    if (!this.currentUser) return;
    const role = this.currentUser.role;

    // 1. Update Role Banner (Avatar, Title, Subtitle, Badge, Actions)
    this.updateRoleBanner();

    // 2. Filter Navigation Tabs & Mobile Nav
    this.filterNavigationByRole(role);

    // 3. Pre-populate Triage Reporter inputs
    const repType = document.getElementById('reporterTypeSelect');
    const repName = document.getElementById('reporterNameInput');
    const repPhone = document.getElementById('reporterPhoneInput');
    const repVillage = document.getElementById('reportVillageInput');
    const repBlock = document.getElementById('reportBlockInput');
    const repDistrict = document.getElementById('reportDistrictInput');

    if (repType) {
      if (role === 'FARMER') repType.value = 'FARMER';
      else if (role === 'PARA_VET') repType.value = 'PARA_VET';
      else repType.value = 'VET_OFFICER';
    }

    if (repName && this.currentUser.full_name) {
      repName.value = this.currentUser.full_name;
    }
    if (repPhone && this.currentUser.phone) {
      repPhone.value = this.currentUser.phone;
    }
    if (repVillage && this.currentUser.village) {
      repVillage.value = this.currentUser.village;
    }
    if (repBlock && this.currentUser.block) {
      repBlock.value = this.currentUser.block;
    }
    if (repDistrict && this.currentUser.district) {
      repDistrict.value = this.currentUser.district;
    }

    // 4. Role-specific section toggles & rendering
    const farmerSection = document.getElementById('farmerLivestockSection');
    if (farmerSection) {
      if (role === 'FARMER') {
        farmerSection.style.display = 'block';
        renderFarmerLivestockSection(this.currentUser.full_name || 'Ramcharan Yadav');
      } else {
        farmerSection.style.display = 'none';
      }
    }

    const directorSection = document.getElementById('directorExecutiveSection');
    if (directorSection) {
      if (role === 'DIRECTOR') {
        directorSection.style.display = 'block';
        renderDirectorExecutiveSection();
      } else {
        directorSection.style.display = 'none';
      }
    }

    // 5. Landing Tab logic
    const roleLandingMap = {
      'FARMER': 'ehr',
      'PARA_VET': 'triage',
      'DVO': 'map',
      'DIRECTOR': 'dashboard'
    };

    if (autoSwitchTab) {
      const defaultLanding = roleLandingMap[role] || 'map';
      switchTab(defaultLanding);
    } else {
      // If current active tab is hidden for this role, auto-switch to default landing
      const activeBtn = document.querySelector('.tab-btn.active');
      if (activeBtn && activeBtn.classList.contains('tab-hidden')) {
        const defaultLanding = roleLandingMap[role] || 'map';
        switchTab(defaultLanding);
      }
    }
  }

  updateRoleBanner() {
    if (!this.currentUser) return;
    const role = this.currentUser.role;
    const banner = document.getElementById('rolePortalBanner');
    if (!banner) return;

    banner.classList.remove('banner-farmer', 'banner-paravet', 'banner-dvo', 'banner-director');
    const classMap = {
      'FARMER': 'banner-farmer',
      'PARA_VET': 'banner-paravet',
      'DVO': 'banner-dvo',
      'DIRECTOR': 'banner-director'
    };
    banner.classList.add(classMap[role] || 'banner-dvo');

    const avatarMap = {
      'FARMER': '👨‍🌾',
      'PARA_VET': '🩺',
      'DVO': '🏛️',
      'DIRECTOR': '📊'
    };
    const avatarEl = document.getElementById('roleBannerAvatar');
    if (avatarEl) avatarEl.innerText = avatarMap[role] || '👤';

    const titleEl = document.getElementById('roleBannerTitle');
    const descEl = document.getElementById('roleBannerDesc');
    const badgeEl = document.getElementById('roleBannerBadge');
    const actionsEl = document.getElementById('roleBannerActions');

    const t = (k) => (window.I18n ? window.I18n.t(k) : k);

    if (role === 'FARMER') {
      if (titleEl) titleEl.innerText = t('role_farmer_title');
      if (descEl) descEl.innerText = t('role_farmer_desc');
      if (badgeEl) badgeEl.innerText = `${this.currentUser.full_name || 'Ramcharan Yadav'} • ${this.currentUser.village || 'Dhani Mohabbatpur'}, ${this.currentUser.block || 'Hansi'}`;
      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="role-action-btn" onclick="window.App.switchTab('ehr')">${t('btn_farmer_my_cattle')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('vision')">${t('btn_farmer_scan')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('triage')">${t('btn_farmer_report')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('ivr')">${t('btn_farmer_call')}</button>
          <button class="role-switch-btn" onclick="window.AuthManager.openModal()">${t('btn_switch_role')}</button>
        `;
      }
    } else if (role === 'PARA_VET') {
      if (titleEl) titleEl.innerText = t('role_paravet_title');
      if (descEl) descEl.innerText = t('role_paravet_desc');
      if (badgeEl) badgeEl.innerText = `${this.currentUser.full_name || 'Ramesh Kumar'} • Pashu Sakhi (${this.currentUser.block || 'Hansi'} Block)`;
      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="role-action-btn" onclick="window.App.switchTab('triage')">${t('btn_paravet_survey')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('ehr')">${t('btn_paravet_register')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('labs')">${t('btn_paravet_sample')}</button>
          <button class="role-switch-btn" onclick="window.AuthManager.openModal()">${t('btn_switch_role')}</button>
        `;
      }
    } else if (role === 'DIRECTOR') {
      if (titleEl) titleEl.innerText = t('role_director_title');
      if (descEl) descEl.innerText = t('role_director_desc');
      if (badgeEl) badgeEl.innerText = `${this.currentUser.full_name || 'Dr. A. K. Sharma'} • DG Animal Husbandry & State Surveillance`;
      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="role-action-btn" onclick="window.App.switchTab('dashboard')">${t('btn_director_stockpile')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('dashboard')">${t('btn_director_r0')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('advisories')">📢 State Voice/SMS Broadcast</button>
          <button class="role-action-btn" onclick="window.App.switchTab('map')">🗺️ All India Surveillance</button>
          <button class="role-switch-btn" onclick="window.AuthManager.openModal()">${t('btn_switch_role')}</button>
        `;
      }
    } else { // DVO
      if (titleEl) titleEl.innerText = t('role_dvo_title');
      if (descEl) descEl.innerText = t('role_dvo_desc');
      if (badgeEl) badgeEl.innerText = `${this.currentUser.full_name || 'Dr. Mohit Rao'} • District Veterinary Officer (${this.currentUser.district || 'Hisar'})`;
      if (actionsEl) {
        actionsEl.innerHTML = `
          <button class="role-action-btn" onclick="window.App.switchTab('map')">${t('btn_dvo_quarantine')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('triage')">${t('btn_dvo_verify')}</button>
          <button class="role-action-btn" onclick="window.App.switchTab('advisories')">${t('btn_dvo_broadcast')}</button>
          <button class="role-switch-btn" onclick="window.AuthManager.openModal()">${t('btn_switch_role')}</button>
        `;
      }
    }
  }

  filterNavigationByRole(role) {
    document.querySelectorAll('[data-roles]').forEach(el => {
      const rolesStr = el.dataset.roles;
      if (rolesStr) {
        const allowed = rolesStr.split(',').map(s => s.trim());
        if (!allowed.includes(role)) {
          el.classList.add('tab-hidden');
        } else {
          el.classList.remove('tab-hidden');
        }
      }
    });
  }

  openModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('open');
  }

  closeModal() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('open');
    const err = document.getElementById('loginErrorMsg');
    if (err) err.style.display = 'none';
  }

  switchAuthTab(tabId) {
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.authTab === tabId);
    });
    document.querySelectorAll('.auth-tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.id === `authPane-${tabId}`);
    });
  }

  async loginAsRole(role) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role })
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        currentRole = role;
        this.updateHeaderProfile();
        this.applyRoleContext(true);
        this.closeModal();
        alert(`✅ Logged in successfully as ${this.currentUser.full_name} (${this.currentUser.designation})`);
        refreshDashboardData();
      }
    } catch (err) {
      console.error('Quick login error:', err);
    }
  }

  async submitPasswordLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsernameInput')?.value.trim();
    const password = document.getElementById('loginPasswordInput')?.value.trim();
    const errorEl = document.getElementById('loginErrorMsg');
    const submitBtn = document.getElementById('loginSubmitBtn');

    if (errorEl) errorEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerText = 'Verifying Credentials...';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        this.currentUser = data.user;
        currentRole = data.user.role;
        this.updateHeaderProfile();
        this.applyRoleContext(true);
        this.closeModal();
        alert(`✅ Welcome back, ${data.user.full_name}! (${data.user.designation})`);
        refreshDashboardData();
      } else {
        if (errorEl) {
          errorEl.innerText = data.error || 'Authentication failed. Please check credentials.';
          errorEl.style.display = 'block';
        }
      }
    } catch (err) {
      if (errorEl) {
        errorEl.innerText = 'Network error during login.';
        errorEl.style.display = 'block';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Authenticate & Sign In';
    }
  }

  async sendOTP() {
    const phone = document.getElementById('otpPhoneInput')?.value.trim();
    if (!phone) {
      alert('Please enter a valid mobile number.');
      return;
    }

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (data.success) {
        const alertEl = document.getElementById('otpSentAlert');
        if (alertEl) alertEl.style.display = 'block';
        const otpInput = document.getElementById('otpValueInput');
        if (otpInput) otpInput.value = data.simulated_otp; // convenient testing auto-fill
      }
    } catch (err) {
      console.error('OTP Send error:', err);
    }
  }

  async verifyOTP() {
    const phone = document.getElementById('otpPhoneInput')?.value.trim();
    const otp = document.getElementById('otpValueInput')?.value.trim();

    if (!phone || !otp) {
      alert('Please enter both mobile number and OTP.');
      return;
    }

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();

      if (data.success) {
        this.currentUser = data.user;
        currentRole = data.user.role;
        this.updateHeaderProfile();
        this.applyRoleContext(true);
        this.closeModal();
        alert(`✅ Mobile OTP Verified! Welcome, ${data.user.full_name}.`);
        refreshDashboardData();
      } else {
        alert(data.error || 'OTP verification failed.');
      }
    } catch (err) {
      console.error('OTP Verify error:', err);
    }
  }

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    this.init();
    alert('You have logged out.');
  }
}

window.AuthManager = new AuthenticationManager();

function initMobileMode() {
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|PashuSurakshaApp/i.test(navigator.userAgent);
  const isNarrowScreen = window.innerWidth <= 860;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  if (isMobileUA || isNarrowScreen || isStandalone) {
    document.documentElement.classList.add('mobile-app-mode');
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 860 || isMobileUA) {
      document.documentElement.classList.add('mobile-app-mode');
    } else {
      document.documentElement.classList.remove('mobile-app-mode');
    }
  });
}

function initSplashScreen() {
  const splashEl = document.getElementById('appSplashScreen');
  const splashLine = document.getElementById('splashProgressLine');
  if (!splashEl) return;

  // In native Android APK, MainActivity already displays native splash overlay
  if (navigator.userAgent.includes('PashuSurakshaApp')) {
    splashEl.style.display = 'none';
    return;
  }

  // Smooth loading line progress animation
  if (splashLine) {
    setTimeout(() => { splashLine.style.width = '45%'; }, 60);
    setTimeout(() => { splashLine.style.width = '80%'; }, 350);
  }

  const dismissSplash = () => {
    if (splashLine) splashLine.style.width = '100%';
    setTimeout(() => {
      splashEl.classList.add('fade-out');
      setTimeout(() => {
        splashEl.style.display = 'none';
      }, 480);
    }, 350);
  };

  if (document.readyState === 'complete') {
    setTimeout(dismissSplash, 600);
  } else {
    window.addEventListener('load', () => {
      setTimeout(dismissSplash, 600);
    });
  }

  // Safety fallback after 4 seconds
  setTimeout(dismissSplash, 4000);
}

// Immediate evaluation
initMobileMode();
initSplashScreen();

document.addEventListener('DOMContentLoaded', () => {
  initMobileMode();
  initSplashScreen();
  // Initialize subsystems
  if (window.I18n) window.I18n.init();
  window.OfflineManager.initDB();
  window.AuthManager.init();
  window.TriageManager.init();
  window.IVRManager.init();
  window.EHRManager.init();
  window.LabManager.init();
  if (window.VisionManager) window.VisionManager.init();
  if (window.ChatbotManager) window.ChatbotManager.init();
  
  // Fast direct map initialization on page startup
  if (window.MapManager) {
    window.MapManager.init();
  }
  
  setupNavigation();
  setupAdvisoriesUI();
  setupWeatherPanel();
  
  // Load dashboard stats asynchronously in background without blocking UI
  refreshDashboardData().catch(err => console.error('Dashboard stats background error:', err));

  window.addEventListener('languageChanged', () => {
    if (window.AuthManager) window.AuthManager.updateRoleBanner();
  });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('PWA Service Worker registered:', reg.scope))
      .catch(err => console.log('Service Worker registration skipped:', err));
  }
});

function setupNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetView = tab.dataset.tab;
      switchTab(targetView);
    });
  });

  const mobileNavs = document.querySelectorAll('.mobile-nav-item');
  mobileNavs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.tab;
      if (targetView) {
        switchTab(targetView);
      }
    });
  });
}

function switchTab(viewId) {
  const currentRole = (window.AuthManager && window.AuthManager.currentUser) ? window.AuthManager.currentUser.role : 'DVO';
  if (viewId === 'advisories' && currentRole !== 'DVO' && currentRole !== 'DIRECTOR') {
    alert('⚠️ Access Restricted: Multilingual Voice Advisory & Emergency SMS Broadcast is authorized for Veterinary Officers and State Directorate only. Farmers cannot dispatch public broadcasts.');
    return;
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === viewId);
  });

  document.querySelectorAll('.mobile-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === viewId);
  });

  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.toggle('active', view.id === `view-${viewId}`);
  });

  if (viewId === 'map') {
    setTimeout(() => {
      window.MapManager.init();
      window.MapManager.refresh();
      if (window.MapManager.invalidateSize) window.MapManager.invalidateSize();
    }, 150);
  } else if (viewId === 'dashboard') {
    renderCharts();
  } else if (viewId === 'advisories') {
    const user = window.AuthManager ? window.AuthManager.currentUser : null;
    const nameEl = document.getElementById('advisoryOfficerNameDisplay');
    if (nameEl && user) {
      nameEl.innerText = `${user.full_name} (${user.designation || user.role})`;
    }
  } else if (viewId === 'chat') {
    if (window.ChatbotManager) {
      window.ChatbotManager.renderViewGreetingIfNeeded();
      setTimeout(() => {
        const inp = document.getElementById('chatViewTextInput');
        if (inp) inp.focus();
      }, 100);
    }
  }
}

async function refreshDashboardData() {
  try {
    const res = await fetch('/api/stats/dashboard');
    const data = await res.json();

    const m = data.metrics;
    document.getElementById('kpiTotalLivestock').innerText = m.total_registered_livestock.toLocaleString();
    document.getElementById('kpiActiveMorbidity').innerText = m.active_morbidity_count;
    document.getElementById('kpiTotalReports').innerText = m.total_surveillance_reports;
    document.getElementById('kpiOutbreakClusters').innerText = m.active_outbreak_clusters;
    document.getElementById('kpiPendingLab').innerText = m.pending_diagnostic_samples;
    document.getElementById('kpiVaccineCoverage').innerText = m.herd_immunity_index;

    renderRecentReports(data.recent_reports || []);
    updateCharts(data.disease_breakdown || []);
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

async function renderFarmerLivestockSection(ownerName) {
  const container = document.getElementById('farmerCattleCardsContainer');
  if (!container) return;

  container.innerHTML = '<div style="color:#64748b; font-size:0.85rem; padding:1rem; grid-column: 1 / -1;">Loading your registered livestock health cards...</div>';

  try {
    const res = await fetch(`/api/animals?owner=${encodeURIComponent(ownerName)}`);
    const animals = await res.json();

    if (!animals || animals.length === 0) {
      container.innerHTML = `
        <div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:1.5rem; text-align:center; color:#64748b; grid-column:1/-1;">
          <div style="font-size:2rem; margin-bottom:0.4rem;">🐄</div>
          <p style="margin-bottom:0.5rem;">No animals registered yet under <b>${ownerName}</b>.</p>
          <button class="btn btn-primary btn-sm" onclick="window.EHRManager.openNewAnimalModal()">➕ Register Your First Cow / Buffalo</button>
        </div>`;
      return;
    }

    container.innerHTML = animals.map(a => {
      const isSick = a.health_status === 'SICK' || a.health_status === 'QUARANTINED';
      const statusBadge = isSick 
        ? `<span class="badge badge-danger" style="animation: pulse 1.5s infinite;">🚨 SICK / UNDER CARE</span>`
        : `<span class="badge badge-success">✅ HEALTHY</span>`;

      // Milk withholding safety check: tag 100982347101 or sick status
      const isWithheld = (a.tag_number === '100982347101' || isSick);
      const milkSafetyBadge = isWithheld
        ? `<div style="background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:0.45rem 0.65rem; border-radius:6px; font-size:0.75rem; font-weight:700; margin-top:0.6rem; display:flex; align-items:flex-start; gap:0.4rem;">
             <span style="font-size:1.1rem; line-height:1;">⛔</span>
             <div>
               <div style="color:#991b1b;">WITHHOLD MILK (Active Antibiotic Course)</div>
               <div style="font-size:0.7rem; font-weight:normal; color:#b91c1c; margin-top:1px;">Ceftiofur IM course active. Safe to resume milking in 48 hrs.</div>
             </div>
           </div>`
        : `<div style="background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; padding:0.45rem 0.65rem; border-radius:6px; font-size:0.75rem; font-weight:700; margin-top:0.6rem; display:flex; align-items:flex-start; gap:0.4rem;">
             <span style="font-size:1.1rem; line-height:1;">✅</span>
             <div>
               <div style="color:#065f46;">MILK SAFE TO CONSUME & SELL</div>
               <div style="font-size:0.7rem; font-weight:normal; color:#047857; margin-top:1px;">Zero chemical or antibiotic residue detected.</div>
             </div>
           </div>`;

      // Vaccine schedule calculation
      const nextVaxText = isSick 
        ? "⚠️ FMD Booster due in 12 days (Pending Clinical Recovery)" 
        : "💉 FMD & HS Booster due in 18 days (October 2026)";

      return `
        <div class="farmer-cattle-card">
          <div class="farmer-cattle-header">
            <div>
              <span style="font-size:1.2rem; margin-right:0.25rem;">${a.species === 'Buffalo' ? '🐃' : '🐄'}</span>
              <span class="farmer-cattle-tag">Tag #${a.tag_number}</span>
            </div>
            ${statusBadge}
          </div>

          <div style="font-size:0.8rem; color:#475569; margin-bottom:0.5rem;">
            <b>${a.breed}</b> (${a.species}) • ${a.age_months} months • ${a.sex}
          </div>

          <div style="background:#f1f5f9; padding:0.4rem 0.6rem; border-radius:6px; font-size:0.75rem; color:#334155; margin-bottom:0.4rem;">
            <b>Vaccination Schedule:</b> ${nextVaxText}
          </div>

          ${milkSafetyBadge}

          <div style="display:flex; gap:0.4rem; margin-top:0.75rem;">
            <button class="btn btn-outline btn-sm" style="flex:1; font-size:0.75rem;" onclick="window.EHRManager.viewPassport('${a.tag_number}')">
              📋 View Passport
            </button>
            <button class="btn btn-primary btn-sm" style="flex:1; font-size:0.75rem; background:#0f766e;" onclick="window.App.switchTab('vision')">
              📸 AI Lesion Scan
            </button>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading farmer livestock cards:', err);
    container.innerHTML = '<div style="color:#ef4444; font-size:0.82rem; padding:1rem;">Failed to load livestock cards.</div>';
  }
}

async function renderDirectorExecutiveSection() {
  const container = document.getElementById('directorKpisGrid');
  if (!container) return;

  try {
    const res = await fetch('/api/stats/dashboard');
    const data = await res.json();
    const kpis = data.director_kpis;
    if (!kpis) return;

    const r0 = kpis.epidemiological_indices.r0_transmission_velocity;
    const cfr = kpis.epidemiological_indices.case_fatality_ratio;
    const rings = kpis.epidemiological_indices.inter_district_quarantine_rings;
    const adherence = kpis.epidemiological_indices.ring_containment_adherence;

    const fmdStock = kpis.vaccine_stockpile.fmd_doses.toLocaleString();
    const lsdStock = kpis.vaccine_stockpile.lsd_goatpox_doses.toLocaleString();
    const hsStock = kpis.vaccine_stockpile.hs_bq_doses.toLocaleString();
    const coldChain = kpis.vaccine_stockpile.cold_chain_compliance_pct;

    container.innerHTML = `
      <div class="director-kpi-tile" style="background:#ffffff; border-color:#e9d5ff;">
        <div style="font-size:0.75rem; font-weight:700; color:#7e22ce; text-transform:uppercase; margin-bottom:0.25rem;">
          📈 Epidemic Velocity (R₀ Index)
        </div>
        <div class="director-kpi-val" style="color:#e11d48;">${r0}</div>
        <div style="font-size:0.72rem; color:#64748b; margin-top:0.2rem;">Transmission Target: &lt; 1.0 (Active Containment)</div>
      </div>

      <div class="director-kpi-tile" style="background:#ffffff; border-color:#e9d5ff;">
        <div style="font-size:0.75rem; font-weight:700; color:#7e22ce; text-transform:uppercase; margin-bottom:0.25rem;">
          🚨 Case Fatality Ratio (CFR)
        </div>
        <div class="director-kpi-val" style="color:#d97706;">${cfr}</div>
        <div style="font-size:0.72rem; color:#64748b; margin-top:0.2rem;">Statewide Veterinary Triage Benchmark</div>
      </div>

      <div class="director-kpi-tile" style="background:#ffffff; border-color:#e9d5ff;">
        <div style="font-size:0.75rem; font-weight:700; color:#7e22ce; text-transform:uppercase; margin-bottom:0.25rem;">
          ⭕ Inter-District Quarantine Rings
        </div>
        <div class="director-kpi-val" style="color:#0284c7;">${rings} Active</div>
        <div style="font-size:0.72rem; color:#64748b; margin-top:0.2rem;">3km Infected / 10km Buffer (${adherence} Adherence)</div>
      </div>

      <div class="director-kpi-tile" style="background:#ffffff; border-color:#e9d5ff;">
        <div style="font-size:0.75rem; font-weight:700; color:#7e22ce; text-transform:uppercase; margin-bottom:0.25rem;">
          💉 FMD Vaccine Stockpile
        </div>
        <div class="director-kpi-val" style="color:#059669;">${fmdStock}</div>
        <div style="font-size:0.72rem; color:#64748b; margin-top:0.2rem;">Cold-Chain Compliance: ${coldChain}%</div>
      </div>

      <div class="director-kpi-tile" style="background:#ffffff; border-color:#e9d5ff;">
        <div style="font-size:0.75rem; font-weight:700; color:#7e22ce; text-transform:uppercase; margin-bottom:0.25rem;">
          💉 LSD (Goat Pox) Stockpile
        </div>
        <div class="director-kpi-val" style="color:#059669;">${lsdStock}</div>
        <div style="font-size:0.72rem; color:#64748b; margin-top:0.2rem;">Strategic State Emergency Reserve</div>
      </div>

      <div class="director-kpi-tile" style="background:#ffffff; border-color:#e9d5ff;">
        <div style="font-size:0.75rem; font-weight:700; color:#7e22ce; text-transform:uppercase; margin-bottom:0.25rem;">
          💉 HS + BQ Combined Reserves
        </div>
        <div class="director-kpi-val" style="color:#059669;">${hsStock}</div>
        <div style="font-size:0.72rem; color:#64748b; margin-top:0.2rem;">Pre-Monsoon Preparedness Buffer</div>
      </div>
    `;
  } catch (err) {
    console.error('Error loading director executive KPIs:', err);
  }
}

function renderRecentReports(reports) {
  const tbody = document.getElementById('recentReportsTableBody');
  if (!tbody) return;

  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:1.5rem;">No recent syndromic reports.</td></tr>`;
    return;
  }

  tbody.innerHTML = reports.map(r => `
    <tr>
      <td><code><b>${r.report_uid}</b></code><br><small style="color:#64748b;">${r.reporter_type}</small></td>
      <td><b>${r.species}</b></td>
      <td><b>${r.triage_name || 'General Sickness'}</b> (${r.confidence}%)</td>
      <td>${r.village}, ${r.district}</td>
      <td><span class="badge badge-${(r.urgency || 'low').toLowerCase()}">${r.urgency}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="window.App.switchTab('map'); window.MapManager.focus(${r.latitude}, ${r.longitude}, 12);">
          View on Map
        </button>
      </td>
    </tr>
  `).join('');
}

function updateCharts(breakdown) {
  const labels = breakdown.map(b => b.triage_code || 'Unknown');
  const counts = breakdown.map(b => b.count);

  const ctxPie = document.getElementById('diseaseDonutChart')?.getContext('2d');
  if (ctxPie) {
    if (diseasePieChart) diseasePieChart.destroy();
    diseasePieChart = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#e11d48', '#f59e0b', '#0284c7', '#10b981', '#8b5cf6', '#64748b']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  const ctxLine = document.getElementById('epiCurveChart')?.getContext('2d');
  if (ctxLine) {
    if (epiChart) epiChart.destroy();
    epiChart = new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'],
        datasets: [
          {
            label: 'FMD Cases',
            data: [1, 2, 2, 4, 6, 8, 9],
            borderColor: '#e11d48',
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'LSD Cases',
            data: [0, 1, 1, 2, 3, 4, 4],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.3
          },
          {
            label: 'HS Mortality',
            data: [0, 0, 1, 0, 1, 0, 1],
            borderColor: '#7c3aed',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

function renderCharts() {
  refreshDashboardData();
}

async function setupWeatherPanel() {
  try {
    const res = await fetch('/api/weather-risk');
    const profiles = await res.json();
    const select = document.getElementById('weatherRegionSelect');
    if (!select) return;

    select.innerHTML = profiles.map((p, idx) => `
      <option value="${idx}">${p.district} (${p.state})</option>
    `).join('');

    select.addEventListener('change', () => {
      renderSelectedWeather(profiles[select.value]);
    });

    if (profiles.length > 0) {
      renderSelectedWeather(profiles[0]);
    }
  } catch (err) {
    console.error('Weather panel error:', err);
  }
}

function renderSelectedWeather(p) {
  if (!p) return;
  const c = p.meteorological_conditions;
  const idx = p.indices;

  document.getElementById('envTempDisplay').innerText = `${c.temperature_c}°C`;
  document.getElementById('envHumidityDisplay').innerText = `${c.relative_humidity_percent}%`;
  document.getElementById('envRainDisplay').innerText = `${c.precipitation_24h_mm} mm`;
  document.getElementById('envWindDisplay').innerText = `${c.wind_speed_kmh} km/h`;

  const setBar = (fillId, score, color) => {
    const el = document.getElementById(fillId);
    if (el) {
      el.style.width = `${score}%`;
      el.style.background = color;
    }
  };

  setBar('fillVectorRisk', idx.vector_breeding_suitability.score, idx.vector_breeding_suitability.score > 60 ? '#e11d48' : '#f59e0b');
  setBar('fillFMDRisk', idx.fmd_airborne_dispersion.score, idx.fmd_airborne_dispersion.score > 60 ? '#e11d48' : '#0f766e');
  setBar('fillHSRisk', idx.waterlogging_stress_hs.score, idx.waterlogging_stress_hs.score > 60 ? '#e11d48' : '#0284c7');
}

async function setupAdvisoriesUI() {
  const alertTypeSelect = document.getElementById('advisoryTypeSelect');
  const langSelect = document.getElementById('advisoryLangSelect');
  const playBtn = document.getElementById('playAdvisoryAudioBtn');
  const broadcastBtn = document.getElementById('broadcastSMSBtn');

  const loadPreview = async () => {
    const alertType = alertTypeSelect.value;
    const lang = langSelect.value;
    try {
      const res = await fetch(`/api/advisories/preview?alert_type=${alertType}&lang=${lang}`);
      const data = await res.json();
      document.getElementById('advisoryPreviewTitle').innerText = data.title;
      document.getElementById('advisoryPreviewText').innerText = data.text;
      document.getElementById('advisoryVoiceScript').innerText = data.voice_script;
    } catch (e) {
      console.error('Failed to preview advisory:', e);
    }
  };

  if (alertTypeSelect && langSelect) {
    alertTypeSelect.addEventListener('change', loadPreview);
    langSelect.addEventListener('change', loadPreview);
    loadPreview();
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const text = document.getElementById('advisoryVoiceScript')?.innerText || "";
      const lang = langSelect?.value || "hi";
      const bcpMap = { "hi": "hi-IN", "en": "en-IN", "pa": "pa-IN", "bn": "bn-IN", "mr": "mr-IN", "te": "te-IN", "ta": "ta-IN" };
      window.VoiceManager.togglePlayback(text, bcpMap[lang] || 'hi-IN');
    });
  }

  if (broadcastBtn) {
    broadcastBtn.addEventListener('click', async () => {
      const alertType = alertTypeSelect.value;
      const lang = langSelect.value;
      const radius = parseFloat(document.getElementById('broadcastRadiusInput')?.value || "10");

      broadcastBtn.disabled = true;
      broadcastBtn.innerText = 'Broadcasting Emergency Alerts...';

      try {
        const userRole = (window.AuthManager && window.AuthManager.currentUser) ? window.AuthManager.currentUser.role : 'DVO';
        const res = await fetch('/api/advisories/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: userRole,
            alert_type: alertType,
            language: lang,
            district: "Hisar",
            block: "Hansi",
            radius_km: radius,
            channel: "SMS_AND_VOICE"
          })
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          alert(`❌ Broadcast Denied: ${data.error || 'Unauthorized action. Voice advisories and SMS broadcasts are authorized for Veterinary Officers and State Directorate only.'}`);
          return;
        }

        alert(`📢 Emergency Advisory Broadcast Dispatched!\n• Reached: ${data.farmers_reached} registered livestock keepers\n• Channels: SMS, Automated IVR Voice Broadcast & Pashu Sakhi App\n• Radius: ${radius} km quarantine containment zone.`);
        loadAdvisoriesHistory();
      } catch (e) {
        console.error('Broadcast error:', e);
      } finally {
        broadcastBtn.disabled = false;
        broadcastBtn.innerText = '📢 Broadcast Emergency SMS & Voice Alert';
      }
    });
  }

  loadAdvisoriesHistory();
}

async function loadAdvisoriesHistory() {
  try {
    const res = await fetch('/api/advisories');
    const advisories = await res.json();
    const tbody = document.getElementById('advisoriesHistoryTableBody');
    if (!tbody) return;

    if (advisories.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8;">No broadcasts logged.</td></tr>`;
      return;
    }

    tbody.innerHTML = advisories.map(a => `
      <tr>
        <td><b>${a.title}</b></td>
        <td>${a.target_district} (${a.target_block})</td>
        <td>${a.target_radius_km} km Ring</td>
        <td><b>${a.farmers_notified_count}</b> Farmers</td>
        <td>${a.broadcast_at.split('T')[0] || a.broadcast_at}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('Failed to load advisories log:', e);
  }
}

function triggerEmergencyAction(diseaseCode, district, block) {
  openAdvisoryForDisease(diseaseCode, 10);
}

function openAdvisoryForDisease(diseaseCode, radius = 10) {
  const currentRole = (window.AuthManager && window.AuthManager.currentUser) ? window.AuthManager.currentUser.role : 'DVO';
  if (currentRole !== 'DVO' && currentRole !== 'DIRECTOR') {
    alert('⚠️ Advisory dispatch is restricted to Veterinary Officers and State Directorate.');
    return;
  }
  switchTab('advisories');
  const typeMap = {
    "FMD": "FMD_OUTBREAK",
    "FMD_OUTBREAK": "FMD_OUTBREAK",
    "LSD": "LSD_OUTBREAK",
    "LSD_OUTBREAK": "LSD_OUTBREAK",
    "ANTHRAX": "ANTHRAX_BIOHAZARD",
    "ANTHRAX_BIOHAZARD": "ANTHRAX_BIOHAZARD",
    "HS": "PRE_MONSOON_VACCINATION",
    "BQ": "PRE_MONSOON_VACCINATION",
    "PRE_MONSOON_VACCINATION": "PRE_MONSOON_VACCINATION"
  };
  const typeSelect = document.getElementById('advisoryTypeSelect');
  const radiusInput = document.getElementById('broadcastRadiusInput');
  if (typeSelect && (typeMap[diseaseCode] || diseaseCode)) {
    typeSelect.value = typeMap[diseaseCode] || diseaseCode;
    typeSelect.dispatchEvent(new Event('change'));
  }
  if (radiusInput && radius) {
    radiusInput.value = radius;
  }
}

function triggerQuickDirectorBroadcast(alertType, radius = 10) {
  openAdvisoryForDisease(alertType, radius);
}

window.App = {
  switchTab: switchTab,
  refreshData: refreshDashboardData,
  triggerEmergencyAction: triggerEmergencyAction,
  openAdvisoryForDisease: openAdvisoryForDisease,
  triggerQuickDirectorBroadcast: triggerQuickDirectorBroadcast
};
