'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents }
from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix icônes Leaflet dans Next.js
delete L.Icon.Default.prototype.
_getIconUrl;
L.Icon.Default.mergeOptions({
iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-
2x.png'
,
iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
,
shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-
shadow.png'
,
});
const MapCadastre = ({ onParcelle, initialCenter, initialZoom = 17 }) => {
const [loading, setLoading] = useState(false);
const [parcelleGeoJSON, setParcelleGeoJSON] = useState(null);
const [selectedParcelle, setSelectedParcelle] = useState(null);
const mapRef = useRef();
const fetchParcelle = useCallback(async (lat, lng) => {
setLoading(true);
setParcelleGeoJSON(null); // Clear previous selection
setSelectedParcelle(null);
try {
// Utilisation de l'API Etalab pour une meilleure robustesse
// Ajout d'un buffer de recherche autour du point cliqué
const bufferSize = 0.0001; // Environ 10 mètres en degrés lat/lng
const bbox =
`${lng - bufferSize},${lat - bufferSize},${lng +
bufferSize},${lat + bufferSize}`
;
const url =
`https://apicarto.ign.fr/api/cadastre/parcelle?
bbox=${bbox}&geom
_point=${lng},${lat}&limit=1`
;
const res = await fetch(url);
if (!res.ok) {
throw new Error('API IGN indisponible ou erreur');
}
const data = await res.json();
if (data.features && data.features.length > 0) {
const parcelle = data.features[0];
setParcelleGeoJSON(parcelle);
setSelectedParcelle(parcelle.properties);
onParcelle(parcelle.properties); // Remonte les infos de la parcelle
} else {
console.warn('Aucune parcelle trouvée à cet emplacement.
');
onParcelle(null);
}
} catch (error) {
console.error('Erreur lors de la récupération de la parcelle:'
error);
onParcelle(null);
} finally {
setLoading(false);
,
}
}, [onParcelle]);
const ClickHandler = () => {
useMapEvents({
click: (e) => {
fetchParcelle(e.latlng.lat, e.latlng.lng);
},
});
return null;
};
useEffect(() => {
if (mapRef.current && initialCenter) {
mapRef.current.setView(initialCenter, initialZoom);
// Fetch parcelle for initial center if provided
fetchParcelle(initialCenter[0], initialCenter[1]);
}
}, [initialCenter, initialZoom, fetchParcelle]);
const getParcelleStyle = () => {
return {
fillColor: '#E8B420'
sélectionnée
color: '#A07820'
, // Bordure or
weight: 3,
opacity: 1,
fillOpacity: 0.5,
, // Couleur accent or pour la parcelle
};
};
return (
<div className="relative w-full h-96 rounded-lg overflow-hidden shadow-
lg">
{loading && (
<div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex
items-center justify-center z-10">
<div className="animate-spin rounded-full h-12 w-12 border-t-2
border-b-2 border-permit-gold"></div>
<p className="ml-4 text-permit-gold">Chargement du cadastre
officiel IGN...</p>
</div>
)}
<MapContainer
no initialCenter
center={initialCenter || [48.8566, 2.3522]} // Default to Paris if
zoom={initialZoom}
scrollWheelZoom={true}
style={{ height: '100%'
ref={mapRef}
, width: '100%' }}
>
<TileLayer
attribution='&copy; <a
href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
contributors &copy; <a href="https://carto.com/attributions">Carto</a>'
url="https://{s}.basemaps.cartocdn.com/dark
_
all/{z}/{x}/{y}
{r}.png"
/>
<ClickHandler />
{parcelleGeoJSON && (
<GeoJSON
data={parcelleGeoJSON}
style={getParcelleStyle}
>
{selectedParcelle && (
<Popup>
<div>
<h3 className="font-bold text-lg">Parcelle
sélectionnée</h3>
</p>
</p>
<p><strong>Commune:</strong> {selectedParcelle.commune}
<p><strong>Section:</strong> {selectedParcelle.section}
<p><strong>Numéro:</strong> {selectedParcelle.numero}</p>
<p><strong>Contenance:</strong>
{selectedParcelle.contenance} m²</p>
</div>
</Popup>
)}
</GeoJSON>
)}
{initialCenter && !parcelleGeoJSON && (
<Marker position={initialCenter}>
<Popup>Emplacement initial</Popup>
</Marker>
)}
</MapContainer>
</div>
);
};
export default MapCadastre;
