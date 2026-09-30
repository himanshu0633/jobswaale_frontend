import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Crop, X, ZoomIn, Move, Upload, Check, AlertCircle } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';

export const PassportPhotoCropperModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  title = 'Adjust & Crop Passport Photo',
  shape = 'square' // 'square' or 'circle'
}) => {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, initialOffsetX: 0, initialOffsetY: 0 });

  useEffect(() => {
    if (imageSrc) {
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setError('');
      setImageLoaded(false);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imgRef.current = img;
        setImageLoaded(true);
      };
      img.onerror = () => {
        setError('Failed to load image. Please select another file.');
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  // Redraw main canvas
  useEffect(() => {
    if (!imageLoaded || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const img = imgRef.current;
    const imgAspect = img.width / img.height;
    let renderW, renderH;

    // Fill the frame
    if (imgAspect > 1) {
      renderH = height * zoom;
      renderW = renderH * imgAspect;
    } else {
      renderW = width * zoom;
      renderH = renderW / imgAspect;
    }

    const maxShiftX = Math.max((renderW - width) / 2, 0);
    const maxShiftY = Math.max((renderH - height) / 2, 0);

    const drawX = (width - renderW) / 2 + offsetX * maxShiftX;
    const drawY = (height - renderH) / 2 + offsetY * maxShiftY;

    ctx.drawImage(img, drawX, drawY, renderW, renderH);
  }, [imageLoaded, zoom, offsetX, offsetY]);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffsetX: offsetX,
      initialOffsetY: offsetY
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    // Map mouse movement to slider range (-1 to 1)
    setOffsetX(Math.max(-1, Math.min(1, dragStart.current.initialOffsetX + dx / 100)));
    setOffsetY(Math.max(-1, Math.min(1, dragStart.current.initialOffsetY + dy / 100)));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleApply = async () => {
    if (!canvasRef.current || !imgRef.current) return;
    setUploading(true);
    setError('');

    try {
      // Create high-res 400x400 export canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = 400;
      exportCanvas.height = 400;
      const expCtx = exportCanvas.getContext('2d');

      const img = imgRef.current;
      const imgAspect = img.width / img.height;
      let renderW, renderH;

      if (imgAspect > 1) {
        renderH = 400 * zoom;
        renderW = renderH * imgAspect;
      } else {
        renderW = 400 * zoom;
        renderH = renderW / imgAspect;
      }

      const maxShiftX = Math.max((renderW - 400) / 2, 0);
      const maxShiftY = Math.max((renderH - 400) / 2, 0);

      const drawX = (400 - renderW) / 2 + offsetX * maxShiftX;
      const drawY = (400 - renderH) / 2 + offsetY * maxShiftY;

      expCtx.drawImage(img, drawX, drawY, renderW, renderH);

      exportCanvas.toBlob(async (blob) => {
        if (!blob) {
          const fallbackDataUrl = exportCanvas.toDataURL('image/jpeg', 0.9);
          onCropComplete(fallbackDataUrl);
          onClose();
          return;
        }

        try {
          const token = localStorage.getItem('token');
          const formData = new FormData();
          formData.append('image', blob, 'passport-photo.jpg');

          const res = await axios.post(`${BASE_API_URL}/settings/upload-image`, formData, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });

          if (res.data?.imageUrl) {
            onCropComplete(res.data.imageUrl);
          } else {
            onCropComplete(exportCanvas.toDataURL('image/jpeg', 0.9));
          }
        } catch (uploadErr) {
          console.warn('Backend upload failed, using high-quality local Data URL:', uploadErr);
          onCropComplete(exportCanvas.toDataURL('image/jpeg', 0.9));
        } finally {
          setUploading(false);
          onClose();
        }
      }, 'image/jpeg', 0.92);
    } catch (err) {
      console.error('Export canvas error:', err);
      setError('Could not process photo crop. Please try again.');
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5"
        onMouseUp={handleMouseUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Crop className="w-5 h-5 text-indigo-600" />
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
          {/* Main Interactive Canvas */}
          <div 
            className="relative border-2 border-indigo-200 rounded-xl overflow-hidden bg-slate-900 shadow-md select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="block bg-slate-900"
            />
            {/* Passport Oval / Framing Outline */}
            <div className={`absolute inset-0 pointer-events-none border-2 border-white/60 m-4 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] ${shape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}></div>
          </div>

          {/* Live Passport Previews */}
          <div className="flex flex-col items-center gap-2.5 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Live Preview</span>
            <div className={`w-24 h-24 border-2 border-indigo-500 shadow-md bg-slate-100 overflow-hidden ${shape === 'circle' ? 'rounded-full' : 'rounded-xl'}`}>
              <canvas
                ref={(node) => {
                  if (node && canvasRef.current) {
                    const ctx = node.getContext('2d');
                    ctx.drawImage(canvasRef.current, 0, 0, 96, 96);
                  }
                }}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold text-center max-w-[100px]">
              Drag image or use sliders below
            </span>
          </div>
        </div>

        {/* Sliders for Zoom and Pan */}
        <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5"><ZoomIn className="w-3.5 h-3.5 text-indigo-600" /> Zoom Level (Scale)</span>
              <span className="text-indigo-600 font-extrabold">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5 text-slate-500" /> Horizontal</span>
                <span className="text-slate-500 text-[11px]">{Math.round(offsetX * 100)}%</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.02"
                value={offsetX}
                onChange={(e) => setOffsetX(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1"><Move className="w-3.5 h-3.5 rotate-90 text-slate-500" /> Vertical</span>
                <span className="text-slate-500 text-[11px]">{Math.round(offsetY * 100)}%</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.02"
                value={offsetY}
                onChange={(e) => setOffsetY(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={uploading || !imageLoaded}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {uploading ? 'Uploading Photo...' : 'Crop & Save Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassportPhotoCropperModal;
