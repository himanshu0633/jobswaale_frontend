import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultCenter = [20.5937, 78.9629];

const getMapsUrl = (lat, lng) => `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

const parseMapsUrl = (value) => {
  if (!value) return null;
  let match = String(value).match(/q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (!match) {
    match = String(value).match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  }
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
  const [activeMode, setActiveMode] = useState('map');

  const selectedPoint = parseMapsUrl(value);

  // Local inputs for coordinates and link modes
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [linkInput, setLinkInput] = useState('');

  // Sync inputs from value changes
  useEffect(() => {
    if (selectedPoint) {
      setLatInput(selectedPoint.lat.toString());
      setLngInput(selectedPoint.lng.toString());
    } else {
      setLatInput('');
      setLngInput('');
    }
    setLinkInput(value || '');
  }, [value]);

  const setPoint = (lat, lng) => {
    onChange(getMapsUrl(lat, lng));
  };

  // Effect to initialize/cleanup map when activeMode is 'map'
  useEffect(() => {
    if (activeMode !== 'map' || !mapNodeRef.current) return;

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

    if (selectedPoint) {
      markerRef.current = L.circleMarker([selectedPoint.lat, selectedPoint.lng], {
        radius: 8,
        color: '#6658dd',
        fillColor: '#6658dd',
        fillOpacity: 0.9
      }).addTo(map);
    }

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, [activeMode]);

  // Effect to update map marker when value changes while in 'map' mode
  useEffect(() => {
    if (activeMode !== 'map' || !mapRef.current || !selectedPoint) return;
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

  const handleCoordsChange = (latVal, lngVal) => {
    setLatInput(latVal);
    setLngInput(lngVal);
    const lat = parseFloat(latVal);
    const lng = parseFloat(lngVal);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onChange(getMapsUrl(lat, lng));
    }
  };

  const handleLinkChange = (val) => {
    setLinkInput(val);
    onChange(val);
  };

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
    <div className="space-y-3">
      {/* Modes Tabs Selection */}
      <div className="flex border-b border-slate-100">
        <button
          type="button"
          onClick={() => setActiveMode('map')}
          className={`flex-1 pb-2 pt-1 text-center text-xs font-black transition-all ${
            activeMode === 'map'
              ? 'border-b-2 border-[#6658dd] text-[#6658dd]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Select on Map
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('latlng')}
          className={`flex-1 pb-2 pt-1 text-center text-xs font-black transition-all ${
            activeMode === 'latlng'
              ? 'border-b-2 border-[#6658dd] text-[#6658dd]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Coordinates (Lat, Lng)
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('link')}
          className={`flex-1 pb-2 pt-1 text-center text-xs font-black transition-all ${
            activeMode === 'link'
              ? 'border-b-2 border-[#6658dd] text-[#6658dd]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Google Maps Link
        </button>
      </div>

      {/* Mode 1: Map Picker */}
      {activeMode === 'map' && (
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-400">Click on the map to select the interview point.</p>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="h-8 shrink-0 rounded-md bg-slate-100 px-3 text-xs font-extrabold text-slate-600 transition hover:bg-slate-200"
            >
              Use Current Location
            </button>
          </div>
          <div
            ref={mapNodeRef}
            className="h-52 w-full overflow-hidden rounded-md border border-slate-200"
          />
        </div>
      )}

      {/* Mode 2: Coordinates Input */}
      {activeMode === 'latlng' && (
        <div className="grid grid-cols-2 gap-3 rounded-md border border-slate-100 bg-slate-50/50 p-3">
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase text-slate-400">Latitude</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 21.104129"
              value={latInput}
              onChange={(e) => handleCoordsChange(e.target.value, lngInput)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-1 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-extrabold uppercase text-slate-400">Longitude</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 78.485845"
              value={lngInput}
              onChange={(e) => handleCoordsChange(latInput, e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-1 focus:ring-indigo-100"
            />
          </div>
        </div>
      )}

      {/* Mode 3: Link Input */}
      {activeMode === 'link' && (
        <div className="rounded-md border border-slate-100 bg-slate-50/50 p-3">
          <label className="mb-1 block text-[10px] font-extrabold uppercase text-slate-400">Google Maps Link</label>
          <input
            type="text"
            placeholder="Paste Google Maps URL here (e.g., https://www.google.com/maps?q=...)"
            value={linkInput}
            onChange={(e) => handleLinkChange(e.target.value)}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] focus:ring-1 focus:ring-indigo-100"
          />
          <p className="mt-1.5 text-[11px] font-medium text-slate-400 leading-normal">
            Paste Google Maps link (e.g. copy from your browser search or desktop URL). It can extract coordinates automatically.
          </p>
        </div>
      )}

      {/* Footer Info / Link */}
      {geoError && <p className="text-xs font-bold text-rose-600">{geoError}</p>}
      {value && (
        <div className="rounded-md bg-indigo-50/70 px-3 py-2 text-xs font-semibold text-slate-600">
          <span className="font-bold text-slate-700 block mb-0.5">Selected Interview Location:</span>
          <div className="flex items-center justify-between gap-2">
            <span className="truncate flex-1">
              {selectedPoint ? `Coordinates: ${selectedPoint.lat.toFixed(6)}, ${selectedPoint.lng.toFixed(6)}` : `Link: ${value}`}
            </span>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="font-extrabold text-[#6658dd] shrink-0 hover:underline"
            >
              Open map
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewLocationPicker;
