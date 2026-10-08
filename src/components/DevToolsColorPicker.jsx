import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check } from 'lucide-react';

// Math helpers
function hsvToRgb(h, s, v) {
  s = s / 100;
  v = v / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h <= 360) { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

function hexToRgb(hex) {
  const clean = String(hex || '').replace(/^#/, '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16) || 255,
      g: parseInt(clean[1] + clean[1], 16) || 255,
      b: parseInt(clean[2] + clean[2], 16) || 255
    };
  }
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16) || 0,
      g: parseInt(clean.slice(2, 4), 16) || 0,
      b: parseInt(clean.slice(4, 6), 16) || 0
    };
  }
  return { r: 255, g: 255, b: 255 };
}

function rgbToHex(r, g, b) {
  const toH = (n) => {
    const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return `#${toH(r)}${toH(g)}${toH(b)}`;
}

export const DevToolsColorPicker = ({
  color = '#ffffff',
  onChange,
  onClose
}) => {
  const initialRgb = hexToRgb(color);
  const initialHsv = rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b);

  const [hsv, setHsv] = useState(initialHsv);
  const [alpha, setAlpha] = useState(100);
  const [hexInput, setHexInput] = useState(color || '#ffffff');

  const satValBoxRef = useRef(null);
  const hueBarRef = useRef(null);
  const alphaBarRef = useRef(null);
  const isDraggingSatVal = useRef(false);
  const isDraggingHue = useRef(false);
  const isDraggingAlpha = useRef(false);

  // Sync state if external color changes
  useEffect(() => {
    if (color && color !== hexInput) {
      const rgb = hexToRgb(color);
      const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHsv(newHsv);
      setHexInput(color);
    }
  }, [color]);

  // Update color when HSV or Alpha changes
  const updateFromHsv = useCallback((newHsv, newAlpha = alpha) => {
    setHsv(newHsv);
    const rgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setHexInput(hex);
    if (onChange) onChange(hex);
  }, [alpha, onChange]);

  // Handle click/drag in 2D Saturation / Value Box
  const handleSatValMove = useCallback((e) => {
    const box = satValBoxRef.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);

    updateFromHsv({ ...hsv, s, v });
  }, [hsv, updateFromHsv]);

  // Handle click/drag in Hue Rainbow Bar
  const handleHueMove = useCallback((e) => {
    const bar = hueBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const h = Math.round((y / rect.height) * 360);
    updateFromHsv({ ...hsv, h: Math.min(360, Math.max(0, h)) });
  }, [hsv, updateFromHsv]);

  // Handle click/drag in Alpha Bar
  const handleAlphaMove = useCallback((e) => {
    const bar = alphaBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const a = Math.round((1 - y / rect.height) * 100);
    setAlpha(Math.min(100, Math.max(0, a)));
  }, []);

  // Global mousemove and mouseup listeners for smooth dragging
  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDraggingSatVal.current) handleSatValMove(e);
      if (isDraggingHue.current) handleHueMove(e);
      if (isDraggingAlpha.current) handleAlphaMove(e);
    };

    const onMouseUp = () => {
      isDraggingSatVal.current = false;
      isDraggingHue.current = false;
      isDraggingAlpha.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleSatValMove, handleHueMove, handleAlphaMove]);

  // Handle manual typing into hex input
  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    const clean = val.replace(/^#/, '');
    if (clean.length === 6 || clean.length === 3) {
      const rgb = hexToRgb(val);
      const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
      setHsv(newHsv);
      if (onChange) onChange(val.startsWith('#') ? val : `#${val}`);
    }
  };

  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const currentHex = rgbToHex(currentRgb.r, currentRgb.g, currentRgb.b);
  const pureHueHex = rgbToHex(...Object.values(hsvToRgb(hsv.h, 100, 100)));

  return (
    <div
      className="bg-[#18181b] text-white rounded-xl shadow-2xl p-3 border border-slate-700/80 w-[300px] select-none text-xs z-50 font-sans"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar matching Screenshot */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {/* Split / Half circle swatch icon */}
          <div
            className="w-5 h-5 rounded-full border border-zinc-500 overflow-hidden relative shadow-inner"
            style={{ backgroundColor: currentHex }}
          >
            <div
              className="absolute inset-0 w-1/2 bg-white/40"
              style={{ backgroundColor: alpha < 100 ? 'transparent' : undefined }}
            />
          </div>

          {/* Hex Input */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 font-mono text-xs">
            <span className="text-zinc-400">#</span>
            <input
              type="text"
              value={hexInput.replace(/^#/, '')}
              onChange={handleHexInputChange}
              className="w-18 bg-transparent text-white font-mono uppercase focus:outline-none ml-0.5 font-bold"
              placeholder="ffffff"
              maxLength={6}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
          title="Done"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Color Picker Box: 2D Sat/Val Area + Hue Slider + Alpha Slider */}
      <div className="flex gap-2.5 h-[150px]">
        {/* 2D Saturation & Value Box */}
        <div
          ref={satValBoxRef}
          onMouseDown={(e) => {
            isDraggingSatVal.current = true;
            handleSatValMove(e);
          }}
          className="relative flex-grow h-full rounded-md overflow-hidden cursor-crosshair border border-zinc-700/60"
          style={{
            backgroundColor: pureHueHex
          }}
        >
          {/* White to Transparent Horizontal Gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, #ffffff, transparent)'
            }}
          />
          {/* Transparent to Black Vertical Gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent, #000000)'
            }}
          />

          {/* Draggable Circle Handle (Exactly as in screenshot) */}
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`
            }}
          />
        </div>

        {/* Alpha / Transparency Slider */}
        <div
          ref={alphaBarRef}
          onMouseDown={(e) => {
            isDraggingAlpha.current = true;
            handleAlphaMove(e);
          }}
          className="relative w-5 h-full rounded-md overflow-hidden cursor-pointer border border-zinc-700/60"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #444 25%, transparent 25%),
              linear-gradient(-45deg, #444 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #444 75%),
              linear-gradient(-45deg, transparent 75%, #444 75%)
            `,
            backgroundSize: '8px 8px',
            backgroundColor: '#222'
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${currentHex}, transparent)`
            }}
          />
          {/* Alpha Slider Thumb */}
          <div
            className="absolute left-0 right-0 h-1.5 border border-white bg-white/40 pointer-events-none transform -translate-y-1/2 shadow-xs"
            style={{
              top: `${100 - alpha}%`
            }}
          />
        </div>

        {/* Vertical Hue Rainbow Spectrum Bar */}
        <div
          ref={hueBarRef}
          onMouseDown={(e) => {
            isDraggingHue.current = true;
            handleHueMove(e);
          }}
          className="relative w-5 h-full rounded-md overflow-hidden cursor-pointer border border-zinc-700/60"
          style={{
            background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
          }}
        >
          {/* Hue Slider Thumb (Horizontal white frame as in screenshot) */}
          <div
            className="absolute left-0 right-0 h-1.5 border border-white bg-white/30 pointer-events-none transform -translate-y-1/2 shadow-xs"
            style={{
              top: `${(hsv.h / 360) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Preset Swatches matching Web Design & Quick selection */}
      <div className="pt-2.5 mt-2.5 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {[
            { hex: '#ffffff', label: 'White' },
            { hex: '#f8fafc', label: 'Slate' },
            { hex: '#fff9f3', label: 'Peach' },
            { hex: '#c2d9ff', label: 'Blue' },
            { hex: '#f0fdf4', label: 'Mint' },
            { hex: '#fffbeb', label: 'Amber' }
          ].map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => {
                const rgb = hexToRgb(preset.hex);
                const newHsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
                updateFromHsv(newHsv);
              }}
              title={preset.label}
              className="w-4 h-4 rounded-full border border-zinc-600 hover:scale-125 transition cursor-pointer"
              style={{ backgroundColor: preset.hex }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded text-[11px] transition cursor-pointer"
        >
          <Check className="w-3 h-3" />
          <span>Apply</span>
        </button>
      </div>
    </div>
  );
};

export default DevToolsColorPicker;
