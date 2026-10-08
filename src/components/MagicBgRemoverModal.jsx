import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { BASE_API_URL } from '../context/AuthContext';
import { resolveCmsImageUrl } from '../utils/cmsHelper';
import {
  Wand2,
  X,
  RotateCcw,
  Check,
  Loader,
  Pipette,
  Sliders,
  Sparkles,
  Eye
} from 'lucide-react';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const MagicBgRemoverModal = ({
  isOpen,
  imageUrl,
  onClose,
  onSuccess,
  showAlert
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tolerance, setTolerance] = useState(25);
  const [feather, setFeather] = useState(6);
  const [targetColor, setTargetColor] = useState({ r: 0, g: 0, b: 0, hex: '#000000', label: 'Black (#000000)' });
  const [isPickMode, setIsPickMode] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const canvasRef = useRef(null);
  const originalImageDataRef = useRef(null);
  const imageElementRef = useRef(null);

  // Process canvas pixels to make target color transparent
  const applyRemoval = useCallback((tColor, tol, fth) => {
    const canvas = canvasRef.current;
    const origData = originalImageDataRef.current;
    if (!canvas || !origData) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clone original pixels
    const newImgData = ctx.createImageData(width, height);
    newImgData.data.set(origData.data);
    const data = newImgData.data;

    const tr = tColor.r;
    const tg = tColor.g;
    const tb = tColor.b;

    // Max color distance sqrt(255^2 + 255^2 + 255^2) ≈ 441.67
    const maxDist = 441.67;
    const thresholdDist = (tol / 100) * maxDist;
    const featherDist = (fth / 100) * maxDist;

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a === 0) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt(
        (r - tr) * (r - tr) +
        (g - tg) * (g - tg) +
        (b - tb) * (b - tb)
      );

      if (dist <= thresholdDist) {
        data[i + 3] = 0; // Transparent
      } else if (dist <= thresholdDist + featherDist && featherDist > 0) {
        // Feather edge
        const factor = (dist - thresholdDist) / featherDist;
        data[i + 3] = Math.round(a * factor);
      }
    }

    ctx.putImageData(newImgData, 0, 0);
  }, []);

  // Load and initialize the image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    let isMounted = true;
    setLoading(true);
    setIsPickMode(false);

    const fullUrl = resolveCmsImageUrl(imageUrl);

    const loadImage = async () => {
      try {
        let objectUrl = null;
        try {
          const res = await fetch(fullUrl);
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
        } catch {
          objectUrl = null;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          if (!isMounted) return;
          imageElementRef.current = img;
          setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });

          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Store original pixels
            const origData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalImageDataRef.current = origData;

            // Auto-detect corner color
            const corners = [
              ctx.getImageData(0, 0, 1, 1).data,
              ctx.getImageData(canvas.width - 1, 0, 1, 1).data,
              ctx.getImageData(0, canvas.height - 1, 1, 1).data,
              ctx.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data
            ];

            const avgR = Math.round((corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4);
            const avgG = Math.round((corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4);
            const avgB = Math.round((corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4);

            const detected = {
              r: avgR,
              g: avgG,
              b: avgB,
              hex: rgbToHex(avgR, avgG, avgB),
              label: avgR < 30 && avgG < 30 && avgB < 30 ? 'Black (#000000)' : avgR > 230 && avgG > 230 && avgB > 230 ? 'White (#ffffff)' : rgbToHex(avgR, avgG, avgB)
            };

            setTargetColor(detected);
            setLoading(false);

            // Apply initial removal
            applyRemoval(detected, tolerance, feather);
          }
          if (objectUrl) URL.revokeObjectURL(objectUrl);
        };

        img.onerror = () => {
          if (isMounted) {
            setLoading(false);
            if (showAlert) showAlert('error', 'Could not load image into background remover.');
          }
        };

        img.src = objectUrl || fullUrl;
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageUrl, applyRemoval]);

  // Re-run removal when sliders change
  const handleToleranceChange = (newVal) => {
    setTolerance(newVal);
    applyRemoval(targetColor, newVal, feather);
  };

  const handleFeatherChange = (newVal) => {
    setFeather(newVal);
    applyRemoval(targetColor, tolerance, newVal);
  };

  // Preset color selector
  const handleSelectColorPreset = (r, g, b, label) => {
    const col = { r, g, b, hex: rgbToHex(r, g, b), label };
    setTargetColor(col);
    setIsPickMode(false);
    applyRemoval(col, tolerance, feather);
  };

  // Click on canvas to sample color
  const handleCanvasClick = (e) => {
    if (!isPickMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    const orig = originalImageDataRef.current;
    if (!orig) return;

    const idx = (y * canvas.width + x) * 4;
    const r = orig.data[idx];
    const g = orig.data[idx + 1];
    const b = orig.data[idx + 2];

    const col = { r, g, b, hex: rgbToHex(r, g, b), label: `Custom ${rgbToHex(r, g, b)}` };
    setTargetColor(col);
    setIsPickMode(false);
    applyRemoval(col, tolerance, feather);
  };

  // Reset to original image
  const handleResetOriginal = () => {
    const canvas = canvasRef.current;
    const orig = originalImageDataRef.current;
    if (!canvas || !orig) return;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(orig, 0, 0);
  };

  // Save as transparent PNG to backend storage
  const handleSaveAndApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setSaving(false);
        if (showAlert) showAlert('error', 'Could not create transparent image blob.');
        return;
      }

      const file = new File([blob], `transparent_${Date.now()}.png`, { type: 'image/png' });
      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await axios.post(`${BASE_API_URL}/cms/upload-image`, formData, {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        });

        const newUrl = res.data?.imageUrl || res.data?.url || res.data?.default;
        if (newUrl) {
          onSuccess(newUrl);
          onClose();
          if (showAlert) showAlert('success', 'Background removed successfully! Saved as transparent PNG.');
        } else {
          throw new Error('Image URL not returned by server.');
        }
      } catch (err) {
        console.error('Save transparent image error:', err);
        if (showAlert) showAlert('error', err.response?.data?.message || err.message || 'Failed to upload transparent image.');
      } finally {
        setSaving(false);
      }
    }, 'image/png');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50/70 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Magic Image Background Remover
              </h3>
              <p className="text-xs text-slate-500">
                Remove solid black, white, or custom background colors to create a clean transparent PNG.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-grow grid gap-6 md:grid-cols-12 items-start">
          {/* Canvas Preview Area (Checkerboard Transparency) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between w-full">
              <span>Live Transparency Preview</span>
              {imgDimensions.width > 0 && (
                <span className="font-mono text-[11px] text-slate-400">
                  {imgDimensions.width} x {imgDimensions.height} px
                </span>
              )}
            </div>

            <div
              className={`w-full max-h-[360px] rounded-xl border border-slate-300 overflow-hidden relative flex items-center justify-center p-3 ${
                isPickMode ? 'cursor-crosshair' : 'cursor-default'
              }`}
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                  linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                `,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                backgroundColor: '#ffffff'
              }}
            >
              {loading && (
                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
                  <Loader className="w-7 h-7 text-indigo-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-600 mt-2">Loading image pixels...</span>
                </div>
              )}
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full max-h-[340px] object-contain shadow-xs rounded"
              />
            </div>

            {isPickMode && (
              <p className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg mt-3 text-center w-full animate-pulse">
                Click anywhere on the preview to sample and remove that specific color.
              </p>
            )}
          </div>

          {/* Controls Panel */}
          <div className="md:col-span-5 space-y-4">
            {/* Color Presets */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                Target Background Color
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectColorPreset(0, 0, 0, 'Black (#000000)')}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    targetColor.hex === '#000000'
                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-purple-400'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-black border border-slate-400 shrink-0" />
                  <span>Black BG</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectColorPreset(255, 255, 255, 'White (#ffffff)')}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    targetColor.hex === '#ffffff'
                      ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-purple-400'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shrink-0" />
                  <span>White BG</span>
                </button>
              </div>

              {/* Pipette / Eyedropper Sample Button */}
              <button
                type="button"
                onClick={() => setIsPickMode(!isPickMode)}
                className={`w-full px-3 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  isPickMode
                    ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Pipette className="w-3.5 h-3.5" />
                <span>{isPickMode ? 'Cancel Eyedropper' : 'Sample Color From Image'}</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                <span className="text-slate-500 font-medium">Removing:</span>
                <span className="font-mono font-bold text-slate-800 flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300"
                    style={{ backgroundColor: targetColor.hex }}
                  />
                  {targetColor.hex}
                </span>
              </div>
            </div>

            {/* Tolerance Slider */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Color Tolerance</span>
                </label>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {tolerance}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                value={tolerance}
                onChange={(e) => handleToleranceChange(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Precise (5%)</span>
                <span>Balanced (25%)</span>
                <span>Aggressive (75%)</span>
              </div>
            </div>

            {/* Edge Feathering Slider */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Edge Feathering</span>
                </label>
                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  {feather}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={feather}
                onChange={(e) => handleFeatherChange(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Blends border pixels smoothly to eliminate rough or dark edge halos.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetOriginal}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Original</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAndApply}
              disabled={saving || loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-sm transition cursor-pointer disabled:bg-slate-300"
            >
              {saving ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Transparent PNG...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply &amp; Save Transparent PNG</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicBgRemoverModal;
