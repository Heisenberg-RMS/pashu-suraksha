/**
 * Pashu Suraksha - Geospatial Outbreak Mapping & Containment Visualization
 * Interactive Leaflet.js map with 3km infected & 10km surveillance containment buffer rings.
 */

let mapInstance = null;
let outbreakLayerGroup = null;
let containmentLayerGroup = null;
let facilityLayerGroup = null;

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

function initSurveillanceMap() {
  if (mapInstance) {
    mapInstance.invalidateSize();
    return;
  }

  const mapEl = document.getElementById('surveillanceMap');
  if (!mapEl) return;

  // Center on All India
  mapInstance = L.map('surveillanceMap', {
    center: [22.5, 78.9],
    zoom: 5,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors | Pashu Suraksha National GIS',
    maxZoom: 18
  }).addTo(mapInstance);

  outbreakLayerGroup = L.layerGroup().addTo(mapInstance);
  containmentLayerGroup = L.layerGroup().addTo(mapInstance);
  facilityLayerGroup = L.layerGroup().addTo(mapInstance);

  loadMapData();
  renderFacilities();
}

async function loadMapData() {
  try {
    const res = await fetch('/api/outbreaks');
    const data = await res.json();
    
    outbreakLayerGroup.clearLayers();
    containmentLayerGroup.clearLayers();

    const outbreaks = data.declared_outbreaks || [];
    const clusters = data.algorithmic_clusters || [];

    // Combine or display both
    const allOutbreaks = [...outbreaks];
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
          active_cases: c.total_affected_animals,
          mortality: c.total_mortality,
          alert_level: c.severity,
          infected_radius_km: c.containment.infected_zone_radius_km,
          surveillance_radius_km: c.containment.surveillance_zone_radius_km
        });
      }
    });

    allOutbreaks.forEach(outbreak => {
      const lat = parseFloat(outbreak.latitude);
      const lon = parseFloat(outbreak.longitude);
      const isCritical = outbreak.alert_level === 'CRITICAL' || outbreak.disease_code === 'ANTHRAX' || outbreak.disease_code === 'FMD';

      // 1. Surveillance Buffer Zone (Outer: 8-10km circle)
      const surveillanceRadiusMeters = (outbreak.surveillance_radius_km || 10.0) * 1000;
      L.circle([lat, lon], {
        radius: surveillanceRadiusMeters,
        color: '#f59e0b',
        weight: 1.5,
        dashArray: '5, 8',
        fillColor: '#fef3c7',
        fillOpacity: 0.18
      }).bindTooltip(`<b>Surveillance Zone (${outbreak.surveillance_radius_km}km)</b><br>${outbreak.district} - Clinical Search Ring`, { sticky: true })
        .addTo(containmentLayerGroup);

      // 2. Infected Zone (Inner: 3km ring)
      const infectedRadiusMeters = (outbreak.infected_radius_km || 3.0) * 1000;
      L.circle([lat, lon], {
        radius: infectedRadiusMeters,
        color: '#e11d48',
        weight: 2,
        fillColor: '#ffe4e6',
        fillOpacity: 0.35
      }).bindTooltip(`<b>🔴 Infected Zone (${outbreak.infected_radius_km}km)</b><br>Strict Quarantine & Movement Ban`, { sticky: true })
        .addTo(containmentLayerGroup);

      // 3. Center Outbreak Marker Pin
      const markerHtml = `
        <div style="background-color:${isCritical ? '#e11d48' : '#d97706'}; width:24px; height:24px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 10px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:bold;">
          !
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-outbreak-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const popupContent = `
        <div style="font-family:system-ui; font-size:13px; max-width:240px;">
          <div style="background:${isCritical ? '#ffe4e6' : '#fef3c7'}; color:${isCritical ? '#9f1239' : '#92400e'}; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px; margin-bottom:6px;">
            ${outbreak.alert_level} OUTBREAK CLUSTER
          </div>
          <h4 style="margin:0 0 4px 0; color:#0f172a; font-size:14px;">${outbreak.disease_name}</h4>
          <p style="margin:0 0 6px 0; color:#475569;">
            <b>Location:</b> ${outbreak.village || 'Cluster'}, ${outbreak.block}, ${outbreak.district}
          </p>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:12px; background:#f1f5f9; padding:4px 8px; border-radius:4px;">
            <span>Affected: <b>${outbreak.active_cases}</b></span>
            <span>Deaths: <b>${outbreak.mortality}</b></span>
          </div>
          <div style="font-size:11px; color:#64748b; margin-bottom:8px;">
            Containment: <b>${outbreak.infected_radius_km}km Infected</b> / <b>${outbreak.surveillance_radius_km}km Buffer</b>
          </div>
          <button onclick="window.App.triggerEmergencyAction('${outbreak.disease_code}', '${outbreak.district}', '${outbreak.block}')" 
                  style="width:100%; background:#0f766e; color:#fff; border:none; padding:6px 8px; border-radius:4px; font-weight:600; cursor:pointer; font-size:11px;">
            📢 Broadcast Emergency Advisory
          </button>
        </div>
      `;

      L.marker([lat, lon], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(outbreakLayerGroup);
    });

  } catch (err) {
    console.error('Error loading outbreak map data:', err);
  }
}

function renderFacilities() {
  facilityLayerGroup.clearLayers();

  VET_FACILITIES.forEach(fac => {
    const isLab = fac.type.includes("Lab");
    const iconHtml = `
      <div style="background-color:${isLab ? '#7c3aed' : '#059669'}; width:20px; height:20px; border-radius:4px; border:2px solid #fff; box-shadow:0 1px 3px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;">
        ${isLab ? '🔬' : '🏥'}
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'facility-icon',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const popup = `
      <div style="font-family:system-ui; font-size:12px;">
        <span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:3px; font-size:10px; font-weight:bold;">${fac.type}</span>
        <h4 style="margin:4px 0 2px 0;">${fac.name}</h4>
        <p style="margin:0; color:#475569;">District: ${fac.district}<br>Helpline: ${fac.phone}</p>
      </div>
    `;

    L.marker([fac.lat, fac.lon], { icon: icon })
      .bindPopup(popup)
      .addTo(facilityLayerGroup);
  });
}

const INDIA_REGIONS = {
  all: { center: [22.5, 79.2], zoom: 5, name: "All India" },
  north: { center: [28.8, 76.8], zoom: 7, name: "North Zone (Haryana, Punjab, UP)" },
  west: { center: [18.8, 74.2], zoom: 7, name: "West Zone (Maharashtra & Gujarat)" },
  south: { center: [16.2, 78.8], zoom: 7, name: "South Zone (Telangana, AP, Karnataka)" },
  east: { center: [23.5, 84.5], zoom: 7, name: "East & Central Zone" }
};

function focusRegion(regionKey) {
  const reg = INDIA_REGIONS[regionKey] || INDIA_REGIONS.all;
  if (mapInstance) {
    mapInstance.flyTo(reg.center, reg.zoom, { duration: 1.0 });
  }
  // Update active pill button state
  document.querySelectorAll('.map-region-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.region === regionKey);
  });
}

function focusOnLocation(lat, lon, zoom = 11) {
  if (mapInstance) {
    mapInstance.setView([lat, lon], zoom);
  }
}

window.MapManager = {
  init: initSurveillanceMap,
  refresh: loadMapData,
  focus: focusOnLocation,
  focusRegion: focusRegion,
  invalidateSize: function() {
    if (mapInstance) mapInstance.invalidateSize();
  }
};
