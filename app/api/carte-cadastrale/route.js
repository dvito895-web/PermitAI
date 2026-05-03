// app/api/carte-cadastrale/route.js
// Sert la page HTML Leaflet complète — zéro conflit React
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') || '48.8566';
  const lon = searchParams.get('lon') || '2.3522';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; }
  .parcelle-label {
    background: rgba(160,120,32,.9);
    color: white;
    border: none;
    border-radius: 3px;
    font-size: 9px;
    font-family: Arial;
    padding: 1px 4px;
    white-space: nowrap;
  }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const LAT = ${lat};
const LON = ${lon};

// Init carte centrée sur l'adresse
const map = L.map('map', {
  center: [LAT, LON],
  zoom: 18,
  zoomControl: true,
});

// Fond CartoDB clair
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© CartoDB © OSM',
  maxZoom: 22,
}).addTo(map);

// Marqueur adresse rouge
const pinIcon = L.divIcon({
  html: '<div style="width:14px;height:14px;background:#ef4444;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(239,68,68,.3),0 2px 8px rgba(0,0,0,.5)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  className: '',
});
L.marker([LAT, LON], { icon: pinIcon, zIndexOffset: 99999 })
  .addTo(map)
  .bindTooltip('📍 Votre adresse', { permanent: true, direction: 'top', offset: [0, -12] });

let selectedLayer = null;
const allLayers = [];

function styleNormal() {
  return { color: '#94a3b8', weight: 1.5, fillColor: '#e2e8f0', fillOpacity: 0.4 };
}
function styleHover() {
  return { color: '#f59e0b', weight: 2.5, fillColor: '#fde68a', fillOpacity: 0.6 };
}
function styleSelected() {
  return { color: '#a07820', weight: 3.5, fillColor: '#fbbf24', fillOpacity: 0.6 };
}

function selectParcelle(layer, parcelle) {
  // Reset ancien
  if (selectedLayer && selectedLayer !== layer) {
    selectedLayer.setStyle(styleNormal());
  }
  // Sélectionner
  layer.setStyle(styleSelected());
  layer.bringToFront();
  selectedLayer = layer;

  // Envoyer données au parent React via postMessage
  window.parent.postMessage({
    type: 'PARCELLE_SELECTED',
    data: {
      reference: (parcelle.section || '') + (parcelle.numero || ''),
      section: parcelle.section || '',
      numero: parcelle.numero || '',
      surface: parcelle.contenance ? Math.round(parcelle.contenance) : null,
      commune_code: parcelle.commune || '',
    }
  }, '*');
}

// Charger les parcelles depuis notre API proxy
async function loadParcelles() {
  try {
    const r = await fetch('/api/parcelles?lat=' + LAT + '&lon=' + LON);
    const data = await r.json();
    const features = data.features || [];

    if (features.length === 0) {
      window.parent.postMessage({ type: 'NO_PARCELLES' }, '*');
      return;
    }

    let bestLayer = null;
    let bestParcelle = null;
    let distMin = Infinity;

    features.forEach(function(feature) {
      const geom = feature.geometry;
      const props = feature.properties || {};
      if (!geom) return;

      let latlngs;
      if (geom.type === 'Polygon') {
        latlngs = geom.coordinates[0].map(function(c) { return [c[1], c[0]]; });
      } else if (geom.type === 'MultiPolygon') {
        latlngs = geom.coordinates[0][0].map(function(c) { return [c[1], c[0]]; });
      } else return;

      if (!latlngs || latlngs.length < 3) return;

      const polygon = L.polygon(latlngs, styleNormal()).addTo(map);

      polygon.on('mouseover', function() {
        if (this !== selectedLayer) this.setStyle(styleHover());
        this.bringToFront();
      });
      polygon.on('mouseout', function() {
        if (this !== selectedLayer) this.setStyle(styleNormal());
      });
      polygon.on('click', function() {
        selectParcelle(this, props);
      });

      // Label référence sur la parcelle
      try {
        const center = polygon.getBounds().getCenter();
        const ref = (props.section || '') + (props.numero || '');
        if (ref) {
          L.marker(center, {
            icon: L.divIcon({
              html: '<div class="parcelle-label">' + ref + '</div>',
              className: '',
              iconAnchor: [15, 8],
            }),
            interactive: false,
            zIndexOffset: -1,
          }).addTo(map);
        }
      } catch(e) {}

      allLayers.push({ polygon, props });

      // Trouver la plus proche
      try {
        const c = polygon.getBounds().getCenter();
        const d = Math.abs(c.lat - LAT) + Math.abs(c.lng - LON);
        if (d < distMin) {
          distMin = d;
          bestLayer = polygon;
          bestParcelle = props;
        }
      } catch(e) {}
    });

    // Pré-sélectionner la parcelle de l'adresse
    if (bestLayer && bestParcelle) {
      selectParcelle(bestLayer, bestParcelle);
    }

    window.parent.postMessage({ type: 'PARCELLES_LOADED', count: features.length }, '*');

  } catch(e) {
    window.parent.postMessage({ type: 'ERROR', message: e.message }, '*');
  }
}

loadParcelles();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}
