'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as turf from '@turf/turf'; // Import Turf.js
const PlanMasseAuto = ({ parcelleGeoJSON, projectGeometry,
onProjectGeometryChange, onSurfaceChange }) => {
const svgRef = useRef();
const [viewBox, setViewBox] = useState('0 0 800 600'); // Default viewBox
const [scale, setScale] = useState(1); // Scale factor for drawing
const [offset, setOffset] = useState({ x: 0, y: 0 }); // Offset for
drawing
const [drawing, setDrawing] = useState(false);
const [currentPath, setCurrentPath] = useState([]);
// Function to convert GeoJSON coordinates to SVG coordinates
const geoToSvg = useCallback((coord) => {
// This is a simplified projection. For real-world accuracy, a proper
projection library is needed.
// For now, we'll assume a linear mapping within the viewBox for
demonstration.
// In a real app, you'd project lat/lng to a local coordinate system
(e.g., Lambert-93) then scale to SVG.
if (!parcelleGeoJSON || !parcelleGeoJSON.bbox) return { x: 0, y: 0 };
const [minLng, minLat, maxLng, maxLat] = parcelleGeoJSON.bbox;
const svgWidth = 800; // Assuming SVG width
const svgHeight = 600; // Assuming SVG height
const lngRatio = svgWidth / (maxLng - minLng);
const latRatio = svgHeight / (maxLat - minLat);
const x = (coord[0] - minLng) * lngRatio;
const y = svgHeight - (coord[1] - minLat) * latRatio; // Invert Y for
SVG
return { x, y };
}, [parcelleGeoJSON]);
// Function to convert SVG coordinates back to GeoJSON (simplified)
const svgToGeo = useCallback((svgX, svgY) => {
if (!parcelleGeoJSON || !parcelleGeoJSON.bbox) return [0, 0];
const [minLng, minLat, maxLng, maxLat] = parcelleGeoJSON.bbox;
const svgWidth = 800;
const svgHeight = 600;
const lngRatio = svgWidth / (maxLng - minLng);
const latRatio = svgHeight / (maxLat - minLat);
const lng = (svgX / lngRatio) + minLng;
const lat = ((svgHeight - svgY) / latRatio) + minLat; // Invert Y back
return [lng, lat];
}, [parcelleGeoJSON]);
useEffect(() => {
if (parcelleGeoJSON && svgRef.current) {
// Calculate viewBox based on parcelleGeoJSON bbox
const [minLng, minLat, maxLng, maxLat] = parcelleGeoJSON.bbox;
const geoWidth = maxLng - minLng;
const geoHeight = maxLat - minLat;
// Simple scaling to fit within a fixed SVG size (e.g., 800x600)
const aspectRatio = geoWidth / geoHeight;
let newSvgWidth = 800;
let newSvgHeight = 600;
if (aspectRatio > (newSvgWidth / newSvgHeight)) {
newSvgHeight = newSvgWidth / aspectRatio;
} else {
newSvgWidth = newSvgHeight * aspectRatio;
}
// Center the content
const centerX = minLng + geoWidth / 2;
const centerY = minLat + geoHeight / 2;
const viewBoxMinX = (centerX - (geoWidth / 2)) * (800 / geoWidth);
const viewBoxMinY = (centerY - (geoHeight / 2)) * (600 / geoHeight);
// This is a placeholder. A real implementation would use a proper
projection library
// to map geographic coordinates to screen coordinates and calculate
an appropriate viewBox.
// For now, we'll just set a fixed viewBox and rely on the
geoToSvg/svgToGeo for relative positioning.
setViewBox(`0 0 800 600`);
setScale(1); // Reset scale
setOffset({ x: 0, y: 0 }); // Reset offset
}
}, [parcelleGeoJSON]);
const handleMouseDown = useCallback((e) => {
if (e.button === 0) { // Left click
setDrawing(true);
const svgPoint = svgRef.current.getScreenCTM().inverse().transform(e);
setCurrentPath([{ x: svgPoint.x, y: svgPoint.y }]);
}
}, []);
const handleMouseMove = useCallback((e) => {
if (drawing) {
const svgPoint = svgRef.current.getScreenCTM().inverse().transform(e);
setCurrentPath((prev) => [...prev, { x: svgPoint.x, y: svgPoint.y }]);
}
}, [drawing]);
const handleMouseUp = useCallback(() => {
setDrawing(false);
if (currentPath.length > 2) { // Need at least 3 points for a polygon
const geoCoords = currentPath.map(p => svgToGeo(p.x, p.y));
const newPolygon = turf.polygon([[...geoCoords, geoCoords[0]]]); //
Close the polygon
onProjectGeometryChange(newPolygon);
// Calculate surface using Turf.js
const area = turf.area(newPolygon); // Area in square meters
onSurfaceChange(area);
}
setCurrentPath([]);
}, [currentPath, onProjectGeometryChange, onSurfaceChange, svgToGeo]);
const renderParcelle = () => {
if (!parcelleGeoJSON) return null;
const coords = parcelleGeoJSON.geometry.coordinates;
const type = parcelleGeoJSON.geometry.type;
const renderPolygon = (polygonCoords) => {
const points = polygonCoords.map(ring =>
ring.map(coord => {
const svgPoint = geoToSvg(coord);
return
`${svgPoint.x},${svgPoint.y}`
;
}).join(' ')
).join(' '); // For multi-polygon, this might need adjustment
return (
<polygon
points={points}
fill="#06060e" // Fond sombre de l'application
stroke="#A07820" // Bordure or
strokeWidth="2"
fillOpacity="0.3"
/>
);
};
if (type === 'Polygon') {
return renderPolygon(coords);
} else if (type === 'MultiPolygon') {
return coords.map((polygon, i) => <React.Fragment key={i}>
{renderPolygon(polygon)}</React.Fragment>);
}
return null;
};
const renderProjectGeometry = () => {
if (!projectGeometry) return null;
const coords = projectGeometry.geometry.coordinates;
const type = projectGeometry.geometry.type;
const renderPolygon = (polygonCoords) => {
const points = polygonCoords.map(ring =>
ring.map(coord => {
const svgPoint = geoToSvg(coord);
return
`${svgPoint.x},${svgPoint.y}`
}).join(' ')
).join(' ');
;
return (
<polygon
points={points}
fill="#E8B420" // Couleur accent or pour le projet
stroke="#E8B420" // Bordure or
strokeWidth="2"
fillOpacity="0.6"
/>
);
};
if (type === 'Polygon') {
return renderPolygon(coords);
} else if (type === 'MultiPolygon') {
return coords.map((polygon, i) => <React.Fragment key={i}>
{renderPolygon(polygon)}</React.Fragment>);
}
return null;
};
return (
lg bg-gray-900">
<svg
<div className="relative w-full h-96 rounded-lg overflow-hidden shadow-
ref={svgRef}
className="w-full h-full"
viewBox={viewBox}
onMouseDown={handleMouseDown}
onMouseMove={handleMouseMove}
onMouseUp={handleMouseUp}
onMouseLeave={handleMouseUp} // End drawing if mouse leaves SVG area
>
{/* Fond de carte ou image cadastrale ici si nécessaire */}
{renderParcelle()} {/* Affiche la parcelle sélectionnée */}
{renderProjectGeometry()} {/* Affiche la géométrie du projet */}
{/* Affiche le chemin de dessin actuel */}
{drawing && currentPath.length > 1 && (
<polyline
points={currentPath.map(p =>
fill="none"
`${p.x},${p.y}`).join(' ')}
stroke="#E8B420"
strokeWidth="2"
strokeDasharray="5,5"
/>
)}
</svg>
<div className="absolute bottom-4 left-4 text-white text-sm bg-gray-
800 bg-opacity-75 p-2 rounded">
Dessinez votre projet sur la parcelle. Cliquez pour commencer,
déplacez la souris, cliquez pour ajouter des points, relâchez pour terminer.
</div>
</div>
);
};
export default PlanMasseAuto;
