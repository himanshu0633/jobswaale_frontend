import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultCenter = [20.5937, 78.9629];

const getMapsUrl = (lat, lng) => `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

const parseMapsUrl = (value) => {
  const match = String(value || '').match(/q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
};

const InterviewLocationPicker = ({ value, onChange }) => {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [geoError, setGeoError] = useState('');
  const selectedPoint = parseMapsUrl(value);

  const setPoint = (lat, lng) => {
    const point = [lat, lng];
    onChange(getMapsUrl(lat, lng));

    if (!mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = L.circleMarker(point, {
        radius: 8,
        color: '#6658dd',
        fillColor: '#6658dd',
        fillOpacity: 0.9
      }).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(point);
    }
    mapRef.current.setView(point, Math.max(mapRef.current.getZoom(), 15));
  };

  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    const initialPoint = selectedPoint ? [selectedPoint.lat, selectedPoint.lng] : defaultCenter;
    const initialZoom = selectedPoint ? 15 : 5;
    const map = L.map(mapNodeRef.current, { scrollWheelZoom: false }).setView(initialPoint, initialZoom);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', (event) => {
      setPoint(event.latlng.lat, event.latlng.lng);
    });

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !selectedPoint) return;
    const point = [selectedPoint.lat, selectedPoint.lng];
    if (!markerRef.current) {
      markerRef.current = L.circleMarker(point, {
        radius: 8,
        color: '#6658dd',
        fillColor: '#6658dd',
        fillOpacity: 0.9
      }).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(point);
    }
    mapRef.current.setView(point, Math.max(mapRef.current.getZoom(), 15));
  }, [value]);

  const useCurrentLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Current location is not supported in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setPoint(position.coords.latitude, position.coords.longitude),
      () => setGeoError('Location permission denied or unavailable.')
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="block text-xs font-extrabold text-slate-500">Interview Location</label>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="h-9 rounded-md bg-slate-100 px-3 text-xs font-extrabold text-slate-600 transition hover:bg-slate-200"
        >
          Use Current Location
        </button>
      </div>
      <div
        ref={mapNodeRef}
        className="h-52 w-full overflow-hidden rounded-md border border-slate-200"
      />
      <p className="text-xs font-semibold text-slate-400">Click on the map to select the interview point.</p>
      {geoError && <p className="text-xs font-bold text-rose-600">{geoError}</p>}
      {selectedPoint && (
        <div className="rounded-md bg-indigo-50 px-3 py-2 text-xs font-semibold text-slate-600">
          Selected: {selectedPoint.lat.toFixed(6)}, {selectedPoint.lng.toFixed(6)}
          <a href={value} target="_blank" rel="noreferrer" className="ml-2 font-extrabold text-[#6658dd]">
            Open map
          </a>
        </div>
      )}
    </div>
  );
};

export default InterviewLocationPicker;
