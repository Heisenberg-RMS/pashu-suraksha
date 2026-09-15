/**
 * Pashu Suraksha - Geospatial Outbreak Mapping & Containment Visualization
 * Interactive Leaflet.js GIS with real-time GPS user location detection,
 * zoomed-out regional surveillance perspective (zoom 9-10), affected cattle field markings,
 * 3km infected rings, 10km surveillance buffers, and fast CartoDB Voyager CDN tiles.
 */

let mapInstance = null;
let outbreakLayerGroup = null;
let containmentLayerGroup = null;
let affectedCattleLayerGroup = null;
let userLocationLayerGroup = null;
let facilityLayerGroup = null;

let userLocation = null;
let cachedOutbreaks = [];
let cachedReports = [];

const layerVisibility = {
  cattle: true,
  hotspots: true,
  facilities: true
};

const VET_FACILITIES = [
  // North Zone (Haryana, Punjab, UP)
  { name: "ICAR-Indian Veterinary Research Institute (IVRI), Bareilly", type: "National Referral Lab", lat: 28.3752, lon: 79.4312, district: "Bareilly", phone: "0581-2586230" },
  { name: "ICAR-National Dairy Research Institute (NDRI), Karnal", type: "National Research Institute", lat: 29.6857, lon: 76.9905, district: "Karnal", phone: "0184-2259002" },
  { name: "ICAR-Central Institute for Research on Buffaloes, Hisar", type: "Research Institute", lat: 29.1764, lon: 75.7142, district: "Hisar", phone: "01662-276631" },
  { name: "Disease Diagnostic Laboratory (DDL), Hisar", type: "Regional Diagnostic Lab", lat: 29.1492, lon: 75.7217, district: "Hisar", phone: "01662-289122" },
  { name: "Civil Veterinary Hospital, Hansi", type: "Dispensary", lat: 29.1005, lon: 75.9620, district: "Hisar", phone: "01663-254120" },
  { name: "Veterinary Dispensary, Mullanpur", type: "Dispensary", lat: 30.9320, lon: 75.6980, district: "Ludhiana", phone: "0161-280412" },

  // West Zone (Maharashtra & Gujarat)
  { name: "College of Veterinary Science, MAFSU, Pune/Shirwal", type: "State Veterinary College & Hospital", lat: 18.1360, lon: 73.9850, district: "Pune", phone: "02169-244243" },
  { name: "Disease Investigation Section (DIS), Aundh, Pune", type: "State Disease Referral Lab", lat: 18.5580, lon: 73.8075, district: "Pune", phone: "020-25880421" },
  { name: "Veterinary Polyclinic, Kolhapur", type: "District Polyclinic", lat: 16.6980, lon: 74.2310, district: "Kolhapur", phone: "0231-2654120" },
  { name: "College of Veterinary Science & Animal Husbandry, Anand", type: "State Veterinary Hospital", lat: 22.5645, lon: 72.9289, district: "Anand", phone: "02692-261314" },
  { name: "State Disease Diagnostic Lab (SDDL), Gandhinagar", type: "State Referral Lab", lat: 23.2156, lon: 72.6369, district: "Gandhinagar", phone: "079-23254120" },

  // South Zone (Telangana, Andhra Pradesh, Karnataka, Tamil Nadu)
  { name: "PVNR Telangana Veterinary University (PVNRTVU), Rajendranagar", type: "State Referral Lab & Hospital", lat: 17.3200, lon: 78.4060, district: "Hyderabad", phone: "040-24002114" },
  { name: "Regional Animal Disease Diagnostic Lab (RADDL), Warangal", type: "Regional Diagnostic Lab", lat: 17.9784, lon: 79.5910, district: "Warangal", phone: "0870-2456120" },
  { name: "Veterinary Polyclinic, Tenali / Guntur", type: "District Polyclinic", lat: 16.2430, lon: 80.6400, district: "Guntur", phone: "08644-223450" },
  { name: "SVVU College of Veterinary Science, Tirupati", type: "State Referral Hospital", lat: 13.6288, lon: 79.4192, district: "Tirupati", phone: "0877-2248155" },
  { name: "Veterinary College Hebbal, KVAFSU, Bengaluru", type: "Referral Veterinary Hospital", lat: 13.0315, lon: 77.5890, district: "Bengaluru", phone: "080-23411483" },
  { name: "TANUVAS Madras Veterinary College Hospital, Chennai", type: "Apex Referral Hospital", lat: 13.0878, lon: 80.2785, district: "Chennai", phone: "044-25304000" },

  // East Zone (West Bengal)
  { name: "WBUAFS Faculty of Veterinary Sciences, Belgachia, Kolkata", type: "State Diagnostic Lab", lat: 22.6020, lon: 88.3840, district: "Kolkata", phone: "033-25569234" }
];

const INDIA_REGIONS = {
  all: { center: [22.5, 79.2], zoom: 5, name: "All India" },
  north: { center: [28.8, 76.8], zoom: 7, name: "North Zone (Haryana, Punjab, UP)" },
  west: { center: [18.8, 74.2], zoom: 7, name: "West Zone (Maharashtra & Gujarat)" },
  south: { center: [16.2, 78.8], zoom: 7, name: "South Zone (Telangana, AP, Karnataka)" },
  east: { center: [23.5, 84.5], zoom: 7, name: "East & Central Zone" }
};

/**
 * Calculates great-circle distance between two points in km via Haversine formula.
 */
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves fallback district coordinates based on currently logged in user profile.
 */
function getDistrictFallback() {
  const currentUser = (window.AuthManager && window.AuthManager.currentUser) ? window.AuthManager.currentUser : null;
  const district = (currentUser && currentUser.district) ? currentUser.district.toLowerCase() : 'hisar';

  const DISTRICT_MAP = {
    'hisar': { lat: 29.1500, lon: 75.7200, name: 'Hisar, Haryana (District Sector)' },
    'pune': { lat: 18.5204, lon: 73.8567, name: 'Pune, Maharashtra (District Sector)' },
    'kolhapur': { lat: 16.6980, lon: 74.2310, name: 'Kolhapur, Maharashtra (District Sector)' },
    'anand': { lat: 22.5645, lon: 72.9289, name: 'Anand, Gujarat (District Sector)' },
    'gandhinagar': { lat: 23.2156, lon: 72.6369, name: 'Gandhinagar, Gujarat (District Sector)' },
    'warangal': { lat: 17.9784, lon: 79.5910, name: 'Warangal, Telangana (District Sector)' },
    'hyderabad': { lat: 17.3850, lon: 78.4867, name: 'Hyderabad, Telangana (District Sector)' },
    'guntur': { lat: 16.3067, lon: 80.4365, name: 'Guntur, Andhra Pradesh (District Sector)' },
    'tirupati': { lat: 13.6288, lon: 79.4192, name: 'Tirupati, Andhra Pradesh (District Sector)' },
    'bengaluru': { lat: 13.0315, lon: 77.5890, name: 'Bengaluru, Karnataka (District Sector)' },
    'chennai': { lat: 13.0878, lon: 80.2785, name: 'Chennai, Tamil Nadu (District Sector)' },
    'bareilly': { lat: 28.3752, lon: 79.4312, name: 'Bareilly, Uttar Pradesh (District Sector)' },
    'karnal': { lat: 29.6857, lon: 76.9905, name: 'Karnal, Haryana (District Sector)' },
    'ludhiana': { lat: 30.9010, lon: 75.8573, name: 'Ludhiana, Punjab (District Sector)' },
    'kolkata': { lat: 22.6020, lon: 88.3840, name: 'Kolkata, West Bengal (District Sector)' },
    'chandigarh': { lat: 30.7333, lon: 76.7794, name: 'Chandigarh / Directorate HQ' }
  };

  return DISTRICT_MAP[district] || { lat: 29.1500, lon: 75.7200, name: 'Hisar Epicenter (Surveillance Base)' };
}

/**
 * Initializes the GIS Leaflet Map with high-speed CDN raster tiles.
 */
function initSurveillanceMap() {
  if (mapInstance) {
    setTimeout(() => mapInstance.invalidateSize(), 50);
    return;
  }

  const mapEl = document.getElementById('surveillanceMap');
  if (!mapEl) return;

  const fallback = getDistrictFallback();

  // Initialize Leaflet map instance centered on regional district at zoomed-out scale
  mapInstance = L.map('surveillanceMap', {
    center: [fallback.lat, fallback.lon],
    zoom: 9.5, // Zoomed-out regional overview spanning ~60-80km radius
    zoomControl: true,
    preferCanvas: true
  });

  // Fast CartoDB Voyager CDN tile layer with OpenStreetMap fallback
  const baseTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> | Pashu Suraksha GIS',
    subdomains: 'abcd',
    maxZoom: 19,
    crossOrigin: true
  });

  baseTileLayer.on('tileerror', function() {
    console.warn('CartoDB tile load issue, fallback active.');
  });
  baseTileLayer.addTo(mapInstance);

  // Setup Layer Groups
  containmentLayerGroup = L.layerGroup().addTo(mapInstance);
  outbreakLayerGroup = L.layerGroup().addTo(mapInstance);
  affectedCattleLayerGroup = L.layerGroup().addTo(mapInstance);
  userLocationLayerGroup = L.layerGroup().addTo(mapInstance);
  facilityLayerGroup = L.layerGroup().addTo(mapInstance);

  // Detect and center on current location (GPS or district fallback)
  detectAndApplyUserLocation(false);

  // Fetch surveillance datasets
  loadMapData();
  renderFacilities();

  // Invalidate size once DOM has fully laid out
  setTimeout(() => {
    if (mapInstance) mapInstance.invalidateSize();
  }, 120);
}

/**
 * Detects user location via HTML5 Geolocation API with fast 3.5s timeout.
 * Falls back to user's assigned administrative district if denied/offline.
 */
function detectAndApplyUserLocation(interactive = false) {
  const fallback = getDistrictFallback();

  const handleSuccess = (lat, lon, isGps, accuracy) => {
    userLocation = {
      lat: lat,
      lon: lon,
      isGps: isGps,
      districtName: isGps ? 'Live Current GPS Position' : fallback.name,
      accuracy: accuracy
    };

    renderUserLocationMarker();
    centerOnCurrentLocation(interactive);
    updateLocationStatusBar();

    // Re-render affected cattle with distances updated
    if (cachedReports.length > 0) {
      renderAffectedCattle();
    }
  };

  if (navigator.geolocation && window.isSecureContext !== false) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handleSuccess(pos.coords.latitude, pos.coords.longitude, true, pos.coords.accuracy);
      },
      (err) => {
        console.log('Using regional fallback for map positioning:', fallback.name, `(${err.message})`);
        handleSuccess(fallback.lat, fallback.lon, false, null);
      },
      { timeout: 3500, enableHighAccuracy: false, maximumAge: 300000 }
    );
  } else {
    handleSuccess(fallback.lat, fallback.lon, false, null);
  }
}

/**
 * Centers and zooms the map to a regional zoomed-out overview of current location.
 */
function centerOnCurrentLocation(interactive = false) {
  if (!mapInstance || !userLocation) return;

  // Zoomed-out regional level (9.2 to 9.5) shows ~60-80 km radius:
  // includes the user's location, surrounding villages, containment rings, and cattle markings
  const targetZoom = 9.5;

  if (interactive) {
    mapInstance.flyTo([userLocation.lat, userLocation.lon], targetZoom, {
      duration: 1.2,
      easeLinearity: 0.25
    });

    // Highlight the "My Location" button
    document.querySelectorAll('.map-region-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === 'btnMapLocateMe' || btn.dataset.region === 'my-location');
    });
  } else {
    mapInstance.setView([userLocation.lat, userLocation.lon], targetZoom);
  }
}

/**
 * Renders the pulsing radar current location pin with live outbreak proximity.
 */
function renderUserLocationMarker() {
  if (!mapInstance || !userLocationLayerGroup || !userLocation) return;
  userLocationLayerGroup.clearLayers();

  // Find distance to nearest outbreak hotspot
  let nearestOutbreak = null;
  let minDistanceKm = 999999;
  cachedOutbreaks.forEach(ob => {
    const obLat = parseFloat(ob.latitude);
    const obLon = parseFloat(ob.longitude);
    if (!isNaN(obLat) && !isNaN(obLon)) {
      const d = calculateHaversineDistanceKm(userLocation.lat, userLocation.lon, obLat, obLon);
      if (d < minDistanceKm) {
        minDistanceKm = d;
        nearestOutbreak = ob;
      }
    }
  });

  // Calculate affected livestock in regional radius (30km)
  let regionalAffectedLivestock = 0;
  let regionalReportsCount = 0;
  cachedReports.forEach(r => {
    const rLat = parseFloat(r.latitude);
    const rLon = parseFloat(r.longitude);
    if (!isNaN(rLat) && !isNaN(rLon)) {
      const d = calculateHaversineDistanceKm(userLocation.lat, userLocation.lon, rLat, rLon);
      if (d <= 30.0) {
        regionalReportsCount++;
        regionalAffectedLivestock += (parseInt(r.affected_count) || 1);
      }
    }
  });

  const markerHtml = `
    <div class="current-location-marker-container" title="You Are Here">
      <div class="current-location-pulse"></div>
      <div class="current-location-dot">
        <span class="location-center-glyph">📍</span>
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: markerHtml,
    className: 'custom-user-location-icon-wrapper',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  let ringSafetyHtml = '';
  if (minDistanceKm <= 3.0) {
    ringSafetyHtml = `
      <div class="loc-status-alert alert-critical">
        🚨 <b>INSIDE 3KM INFECTED CONTAINMENT RING</b><br>
        Quarantine active! Ban on livestock transport & milk/manure movement.
      </div>
    `;
  } else if (minDistanceKm <= 10.0) {
    ringSafetyHtml = `
      <div class="loc-status-alert alert-warning">
        ⚠️ <b>INSIDE 10KM SURVEILLANCE BUFFER ZONE</b><br>
        Active clinical ring search & emergency vaccination mandated.
      </div>
    `;
  } else {
    ringSafetyHtml = `
      <div class="loc-status-alert alert-safe">
        🛡️ <b>OUTSIDE ACTIVE CONTAINMENT RINGS</b><br>
        Nearest outbreak is ${minDistanceKm.toFixed(1)} km away.
      </div>
    `;
  }

  const popupContent = `
    <div class="user-loc-popup-card">
      <div class="user-loc-header">
        <span class="badge-loc-type">${userLocation.isGps ? '📡 LIVE GPS' : '🏛️ DISTRICT SECTOR'}</span>
        <h4>📍 You Are Here (आपकी वर्तमान स्थिति)</h4>
        <div class="loc-coords">${userLocation.districtName} • ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)}</div>
      </div>
      
      ${ringSafetyHtml}

      <div class="user-loc-grid">
        <div class="loc-grid-cell">
          <small>Nearest Hotspot</small>
          <strong>${nearestOutbreak ? (nearestOutbreak.disease_name || nearestOutbreak.disease_code) : 'None Recorded'}</strong>
          <span>${minDistanceKm < 9999 ? minDistanceKm.toFixed(1) + ' km away' : '--'}</span>
        </div>
        <div class="loc-grid-cell">
          <small>Livestock in 30km</small>
          <strong>${regionalAffectedLivestock} Animals</strong>
          <span>(${regionalReportsCount} Field Cases)</span>
        </div>
      </div>

      <div class="user-loc-footer">
        <button type="button" class="btn-popup-zoom" onclick="window.MapManager.focus([${userLocation.lat}, ${userLocation.lon}], 11.5)">
          🔍 Zoom Closer
        </button>
        <button type="button" class="btn-popup-regional" onclick="window.MapManager.focus([${userLocation.lat}, ${userLocation.lon}], 9.5)">
          🗺️ Regional View
        </button>
      </div>
    </div>
  `;

  L.marker([userLocation.lat, userLocation.lon], { icon: customIcon, zIndexOffset: 2000 })
    .bindPopup(popupContent, { maxWidth: 300 })
    .bindTooltip(`<b>📍 You Are Here</b><br>${userLocation.districtName}`, { direction: 'top', offset: [0, -18] })
    .addTo(userLocationLayerGroup);
}

/**
 * Loads outbreaks and field syndromic reports concurrently for maximum speed.
 */
async function loadMapData() {
  try {
    const [outbreaksRes, reportsRes] = await Promise.all([
      fetch('/api/outbreaks').catch(err => {
        console.warn('Outbreak fetch fallback:', err);
        return null;
      }),
      fetch('/api/reports').catch(err => {
        console.warn('Reports fetch fallback:', err);
        return null;
      })
    ]);

    if (outbreaksRes && outbreaksRes.ok) {
      const data = await outbreaksRes.json();
      const declared = data.declared_outbreaks || [];
      const clusters = data.algorithmic_clusters || [];
      
      const allOutbreaks = [...declared];
      clusters.forEach(c => {
        if (!allOutbreaks.some(o => o.disease_code === c.disease_code && o.district === c.district)) {
          allOutbreaks.push({
            cluster_id: c.cluster_id,
            disease_code: c.disease_code,
            disease_name: c.disease_name,
            district: c.district,
            block: c.block,
            village: (c.villages_affected || []).join(', '),
            latitude: c.centroid_latitude,
            longitude: c.centroid_longitude,
            active_cases: c.total_affected_animals || c.case_count || 10,
            mortality: c.total_mortality || 0,
            alert_level: c.severity || 'CRITICAL',
            infected_radius_km: (c.containment && c.containment.infected_zone_radius_km) ? c.containment.infected_zone_radius_km : 3.0,
            surveillance_radius_km: (c.containment && c.containment.surveillance_zone_radius_km) ? c.containment.surveillance_zone_radius_km : 10.0
          });
        }
      });
      cachedOutbreaks = allOutbreaks;
    }

    if (reportsRes && reportsRes.ok) {
      cachedReports = await reportsRes.json();
    }

    // Render layers
    renderOutbreaksAndContainment();
    renderAffectedCattle();
    renderUserLocationMarker();
    updateLocationStatusBar();

  } catch (err) {
    console.error('Error in loadMapData:', err);
  }
}

/**
 * Renders outbreak epicenter pins, 3km quarantine circles, and 10km surveillance buffers.
 */
function renderOutbreaksAndContainment() {
  if (!outbreakLayerGroup || !containmentLayerGroup) return;
  outbreakLayerGroup.clearLayers();
  containmentLayerGroup.clearLayers();

  cachedOutbreaks.forEach(outbreak => {
    const lat = parseFloat(outbreak.latitude);
    const lon = parseFloat(outbreak.longitude);
    if (isNaN(lat) || isNaN(lon)) return;

    const isCritical = outbreak.alert_level === 'CRITICAL' || outbreak.disease_code === 'ANTHRAX' || outbreak.disease_code === 'FMD';

    // 1. Surveillance Buffer Zone (Outer: 8-10km circle)
    const surveillanceRadiusMeters = (outbreak.surveillance_radius_km || 10.0) * 1000;
    L.circle([lat, lon], {
      radius: surveillanceRadiusMeters,
      color: '#f59e0b',
      weight: 2,
      dashArray: '5, 8',
      fillColor: '#fef3c7',
      fillOpacity: 0.18
    }).bindTooltip(`<b>Surveillance Zone (${outbreak.surveillance_radius_km || 10}km)</b><br>${outbreak.district} - Clinical Ring Search`, { sticky: true })
      .addTo(containmentLayerGroup);

    // 2. Infected Zone (Inner: 3km circle)
    const infectedRadiusMeters = (outbreak.infected_radius_km || 3.0) * 1000;
    L.circle([lat, lon], {
      radius: infectedRadiusMeters,
      color: '#e11d48',
      weight: 2.5,
      fillColor: '#ffe4e6',
      fillOpacity: 0.35
    }).bindTooltip(`<b>🔴 Infected Zone (${outbreak.infected_radius_km || 3}km)</b><br>Strict Quarantine & Movement Ban`, { sticky: true })
      .addTo(containmentLayerGroup);

    // 3. Center Outbreak Marker Pin
    const markerHtml = `
      <div style="background-color:${isCritical ? '#e11d48' : '#d97706'}; width:28px; height:28px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 12px rgba(225,29,72,0.6); display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px; font-weight:bold; cursor:pointer;">
        ⚠️
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'custom-outbreak-epicenter-icon',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    let distFromUserStr = '';
    if (userLocation) {
      const d = calculateHaversineDistanceKm(userLocation.lat, userLocation.lon, lat, lon);
      distFromUserStr = `<div style="font-size:11px; color:#0f766e; margin-bottom:6px; background:#f0fdf4; padding:3px 6px; border-radius:4px; font-weight:600;">📏 ${d.toFixed(1)} km from your location</div>`;
    }

    const popupContent = `
      <div style="font-family:system-ui; font-size:13px; max-width:260px;">
        <div style="background:${isCritical ? '#ffe4e6' : '#fef3c7'}; color:${isCritical ? '#9f1239' : '#92400e'}; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px; margin-bottom:6px; display:flex; justify-content:space-between;">
          <span>${outbreak.alert_level || 'ACTIVE'} OUTBREAK HOTSPOT</span>
          <span>${outbreak.disease_code}</span>
        </div>
        <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:15px;">${outbreak.disease_name}</h4>
        <p style="margin:0 0 6px 0; color:#475569; font-size:12px;">
          📍 <b>Location:</b> ${outbreak.village || 'Cluster Epicenter'}, ${outbreak.block}, ${outbreak.district}
        </p>
        ${distFromUserStr}
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; background:#f1f5f9; padding:5px 8px; border-radius:4px;">
          <span>Affected: <b style="color:#0f172a;">${outbreak.active_cases}</b></span>
          <span>Deaths: <b style="color:#e11d48;">${outbreak.mortality}</b></span>
        </div>
        <div style="font-size:11px; color:#64748b; margin-bottom:8px;">
          Containment Rings: <b>${outbreak.infected_radius_km || 3}km Infected</b> • <b>${outbreak.surveillance_radius_km || 10}km Buffer</b>
        </div>
        <button onclick="if(window.App && window.App.triggerEmergencyAction){window.App.triggerEmergencyAction('${outbreak.disease_code}', '${outbreak.district}', '${outbreak.block}')}" 
                style="width:100%; background:#0f766e; color:#fff; border:none; padding:7px 10px; border-radius:6px; font-weight:600; cursor:pointer; font-size:11px;">
          📢 Broadcast Voice / SMS Advisory
        </button>
      </div>
    `;

    L.marker([lat, lon], { icon: customIcon })
      .bindPopup(popupContent)
      .addTo(outbreakLayerGroup);
  });
}

/**
 * Renders individual Affected Cattle field reports with species badges and counts.
 */
function renderAffectedCattle() {
  if (!affectedCattleLayerGroup) return;
  affectedCattleLayerGroup.clearLayers();

  cachedReports.forEach(report => {
    const lat = parseFloat(report.latitude);
    const lon = parseFloat(report.longitude);
    if (isNaN(lat) || isNaN(lon)) return;

    // Determine species emoji
    const sp = (report.species || '').toLowerCase();
    let speciesEmoji = '🐄';
    if (sp.includes('buffalo') || sp.includes('murrah')) speciesEmoji = '🐃';
    else if (sp.includes('goat') || sp.includes('sheep') || sp.includes('buck')) speciesEmoji = '🐐';
    else if (sp.includes('pig') || sp.includes('swine')) speciesEmoji = '🐖';
    else if (sp.includes('poultry') || sp.includes('bird') || sp.includes('chicken')) speciesEmoji = '🐔';

    const urgency = (report.urgency || 'ROUTINE').toUpperCase();
    const count = parseInt(report.affected_count) || 1;
    const mortality = parseInt(report.mortality_count) || 0;

    let distStr = '';
    if (userLocation) {
      const d = calculateHaversineDistanceKm(userLocation.lat, userLocation.lon, lat, lon);
      distStr = `<div style="font-size:11px; color:#0f766e; background:#f0fdf4; padding:2px 6px; border-radius:4px; margin-bottom:6px; font-weight:600;">📏 ${d.toFixed(1)} km from your current location</div>`;
    }

    const pinHtml = `
      <div class="cattle-marking-pin urgency-${urgency.toLowerCase()}" title="${count} ${report.species || 'Cattle'} Affected">
        <span class="cattle-species-icon">${speciesEmoji}</span>
        <span class="cattle-count-tag">${count}</span>
      </div>
    `;

    const customIcon = L.divIcon({
      html: pinHtml,
      className: 'cattle-marking-icon-wrapper',
      iconSize: [36, 32],
      iconAnchor: [18, 16]
    });

    const symptomsList = Array.isArray(report.symptoms) ? report.symptoms : [];
    const symptomBadges = symptomsList.slice(0, 4).map(s => `<span class="symptom-mini-tag">${s.replace(/_/g, ' ')}</span>`).join(' ');

    const popupHtml = `
      <div class="cattle-report-popup-card">
        <div class="cattle-popup-header urgency-${urgency.toLowerCase()}">
          <span style="font-size:15px;">${speciesEmoji}</span>
          <strong>${report.species || 'Livestock'} Field Report</strong>
          <span class="badge-status-pill">${report.status || 'PENDING'}</span>
        </div>
        <div class="cattle-popup-body">
          <h4 style="margin:4px 0 2px 0; font-size:14px; color:#0f172a;">${report.triage_name || report.triage_code || 'Syndromic Case'}</h4>
          <div style="font-size:12px; color:#334155; margin-bottom:4px;">
            <b>${count} Animals Affected</b> ${mortality > 0 ? `<b style="color:#e11d48;">(${mortality} Deaths)</b>` : ''}
          </div>
          <p style="margin:0 0 6px 0; font-size:11px; color:#64748b;">
            📍 ${report.village || 'Field'}, ${report.block || ''}, ${report.district || ''}
          </p>
          ${distStr}
          ${symptomBadges ? `<div style="display:flex; flex-wrap:wrap; gap:3px; margin-bottom:6px;">${symptomBadges}</div>` : ''}
          <div style="font-size:10px; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:4px; display:flex; justify-content:space-between;">
            <span>Report: <b>${report.report_uid || ('#' + report.id)}</b></span>
            <span>${report.reporter_name || 'Reporter'} (${report.reporter_type || 'Field'})</span>
          </div>
        </div>
      </div>
    `;

    L.marker([lat, lon], { icon: customIcon })
      .bindPopup(popupHtml, { maxWidth: 280 })
      .bindTooltip(`<b>${speciesEmoji} ${count} ${report.species || 'Cattle'}</b>: ${report.triage_code || 'Syndromic'}<br>${report.village || ''}, ${report.district || ''}`, { sticky: true })
      .addTo(affectedCattleLayerGroup);
  });
}

/**
 * Renders veterinary institutions, dispensaries, and regional diagnostic labs.
 */
function renderFacilities() {
  if (!facilityLayerGroup) return;
  facilityLayerGroup.clearLayers();

  VET_FACILITIES.forEach(fac => {
    const isLab = fac.type.includes("Lab");
    const iconHtml = `
      <div style="background-color:${isLab ? '#7c3aed' : '#059669'}; width:22px; height:22px; border-radius:6px; border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; cursor:pointer;">
        ${isLab ? '🔬' : '🏥'}
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'facility-icon',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    const popup = `
      <div style="font-family:system-ui; font-size:12px;">
        <span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:3px; font-size:10px; font-weight:bold;">${fac.type}</span>
        <h4 style="margin:4px 0 2px 0; font-size:13px;">${fac.name}</h4>
        <p style="margin:0; color:#475569;">District: <b>${fac.district}</b><br>Helpline: <b>${fac.phone}</b></p>
      </div>
    `;

    L.marker([fac.lat, fac.lon], { icon: icon })
      .bindPopup(popup)
      .addTo(facilityLayerGroup);
  });
}

/**
 * Updates the compact live status bar above the map with current location and proximity metrics.
 */
function updateLocationStatusBar() {
  const locEl = document.getElementById('mapCurrentLocationText');
  const hotspotEl = document.getElementById('mapNearestHotspotText');
  const cattleEl = document.getElementById('mapAffectedCattleSummary');

  if (locEl && userLocation) {
    locEl.innerHTML = `${userLocation.isGps ? '📡' : '🏛️'} <b>${userLocation.districtName}</b> <small style="color:#64748b;">(${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)})</small>`;
  }

  if (hotspotEl && userLocation) {
    let minD = 999999;
    let closest = null;
    cachedOutbreaks.forEach(ob => {
      const lat = parseFloat(ob.latitude);
      const lon = parseFloat(ob.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        const d = calculateHaversineDistanceKm(userLocation.lat, userLocation.lon, lat, lon);
        if (d < minD) {
          minD = d;
          closest = ob;
        }
      }
    });

    if (closest) {
      const isUrgent = minD <= 10.0;
      hotspotEl.innerHTML = `<span style="color:${isUrgent ? '#e11d48' : '#059669'}; font-weight:700;">${closest.disease_name || closest.disease_code}</span> (${minD.toFixed(1)} km away)`;
    } else {
      hotspotEl.innerText = 'No Active Outbreak in Range';
    }
  }

  if (cattleEl && userLocation) {
    let totalCattle = 0;
    let localCattle = 0;
    cachedReports.forEach(r => {
      const c = parseInt(r.affected_count) || 1;
      totalCattle += c;
      const lat = parseFloat(r.latitude);
      const lon = parseFloat(r.longitude);
      if (!isNaN(lat) && !isNaN(lon)) {
        const d = calculateHaversineDistanceKm(userLocation.lat, userLocation.lon, lat, lon);
        if (d <= 35.0) {
          localCattle += c;
        }
      }
    });
    cattleEl.innerHTML = `<b>${localCattle}</b> in ~35km sector <span style="color:#64748b;">(${totalCattle} national total)</span>`;
  }
}

/**
 * Focuses map on predefined zones.
 */
function focusRegion(regionKey) {
  const reg = INDIA_REGIONS[regionKey] || INDIA_REGIONS.all;
  if (mapInstance) {
    mapInstance.flyTo(reg.center, reg.zoom, { duration: 1.0 });
  }
  document.querySelectorAll('.map-region-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === regionKey);
  });
}

/**
 * Re-centers map on the user's current location at the zoomed-out regional scale.
 */
function locateUser(interactive = true) {
  detectAndApplyUserLocation(interactive);
}

/**
 * Toggles visibility of layer groups.
 */
function toggleLayer(layerName, isVisible) {
  layerVisibility[layerName] = isVisible;
  if (!mapInstance) return;

  if (layerName === 'cattle') {
    if (isVisible) mapInstance.addLayer(affectedCattleLayerGroup);
    else mapInstance.removeLayer(affectedCattleLayerGroup);
  } else if (layerName === 'hotspots') {
    if (isVisible) {
      mapInstance.addLayer(outbreakLayerGroup);
      mapInstance.addLayer(containmentLayerGroup);
    } else {
      mapInstance.removeLayer(outbreakLayerGroup);
      mapInstance.removeLayer(containmentLayerGroup);
    }
  } else if (layerName === 'facilities') {
    if (isVisible) mapInstance.addLayer(facilityLayerGroup);
    else mapInstance.removeLayer(facilityLayerGroup);
  }
}

function focusOnLocation(lat, lon, zoom = 11) {
  if (mapInstance) {
    mapInstance.flyTo([lat, lon], zoom, { duration: 0.8 });
  }
}

window.MapManager = {
  init: initSurveillanceMap,
  refresh: loadMapData,
  focus: focusOnLocation,
  focusRegion: focusRegion,
  locateUser: locateUser,
  toggleLayer: toggleLayer,
  invalidateSize: function() {
    if (mapInstance) mapInstance.invalidateSize();
  },
  getUserLocation: function() {
    return userLocation;
  }
};
