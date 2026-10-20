import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Crop, X, ZoomIn, ZoomOut, Move, Upload, Check, AlertCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';

export const PromoCropperModal = ({
  isOpen,
  onClose,
  imageSrc,
  originalFile = null,
  onCropComplete
}) => {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('free'); // 'free', '16:9', '4:3', '1:1'
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
        setError('Failed to load image. Please select another image file.');
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  // Compute frame dimensions based on chosen aspect ratio
  const getCanvasDimensions = () => {
    switch (aspectRatio) {
      case '16:9':
        return { width: 560, height: 315 };
      case '4:3':
        return { width: 520, height: 390 };
      case '1:1':
        return { width: 440, height: 440 };
      case 'free':
      default:
        if (imgRef.current) {
          const naturalRatio = imgRef.current.width / (imgRef.current.height || 1);
          const maxW = 540;
          return { width: maxW, height: Math.round(maxW / (naturalRatio || 1.33)) };
        }
        return { width: 540, height: 360 };
    }
  };

  const canvasDims = getCanvasDimensions();

  // Redraw canvas on adjustments
  useEffect(() => {
    if (!imageLoaded || !imgRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const img = imgRef.current;
    const imgAspect = img.width / img.height;
    const frameAspect = width / height;
    let renderW, renderH;

    if (imgAspect > frameAspect) {
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

    // Background fill pattern
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    ctx.drawImage(img, drawX, drawY, renderW, renderH);
  }, [imageLoaded, zoom, offsetX, offsetY, aspectRatio, canvasDims.width, canvasDims.height]);

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
    setOffsetX(Math.max(-1, Math.min(1, dragStart.current.initialOffsetX + dx / 120)));
    setOffsetY(Math.max(-1, Math.min(1, dragStart.current.initialOffsetY + dy / 120)));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Upload original full image without any crop
  const handleUseFullImage = async () => {
    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('publicToken');
      const formData = new FormData();

      if (originalFile instanceof File || originalFile instanceof Blob) {
        formData.append('image', originalFile, originalFile.name || 'promo-popup-full.jpg');
      } else if (imgRef.current) {
        // Convert full loaded image to blob
        const fullCanvas = document.createElement('canvas');
        fullCanvas.width = imgRef.current.naturalWidth || imgRef.current.width;
        fullCanvas.height = imgRef.current.naturalHeight || imgRef.current.height;
        const ctx = fullCanvas.getContext('2d');
        ctx.drawImage(imgRef.current, 0, 0);
        const blob = await new Promise((resolve) => fullCanvas.toBlob(resolve, 'image/jpeg', 0.92));
        formData.append('image', blob, 'promo-popup-full.jpg');
      } else {
        throw new Error('No image file available');
      }

      const res = await axios.post(`${BASE_API_URL}/settings/upload-image`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const uploadedUrl = res.data?.imageUrl || res.data?.url || res.data?.default || res.data?.relativeUrl;
      if (uploadedUrl) {
        onCropComplete(uploadedUrl);
        setUploading(false);
        onClose();
      } else {
        throw new Error('Image URL not received from server');
      }
    } catch (err) {
      console.error('Full photo upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload full image. Please try again.');
      setUploading(false);
    }
  };

  // Apply crop & export cropped image
  const handleApplyCrop = async () => {
    if (!canvasRef.current || !imgRef.current) return;
    setUploading(true);
    setError('');

    try {
      const targetW = canvasDims.width;
      const targetH = canvasDims.height;

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;
      const expCtx = exportCanvas.getContext('2d');

      const img = imgRef.current;
      const imgAspect = img.width / img.height;
      const frameAspect = targetW / targetH;
      let renderW, renderH;

      if (imgAspect > frameAspect) {
        renderH = targetH * zoom;
        renderW = renderH * imgAspect;
      } else {
        renderW = targetW * zoom;
        renderH = renderW / imgAspect;
      }

      const maxShiftX = Math.max((renderW - targetW) / 2, 0);
      const maxShiftY = Math.max((renderH - targetH) / 2, 0);

      const drawX = (targetW - renderW) / 2 + offsetX * maxShiftX;
      const drawY = (targetH - renderH) / 2 + offsetY * maxShiftY;

      expCtx.fillStyle = '#ffffff';
      expCtx.fillRect(0, 0, targetW, targetH);
      expCtx.drawImage(img, drawX, drawY, renderW, renderH);

      exportCanvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to process image export.');
          setUploading(false);
          return;
        }

        try {
          const token = localStorage.getItem('token') || localStorage.getItem('publicToken');
          const formData = new FormData();
          formData.append('image', blob, 'promo-popup-cropped.jpg');

          const res = await axios.post(`${BASE_API_URL}/settings/upload-image`, formData, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });

          const uploadedUrl = res.data?.imageUrl || res.data?.url || res.data?.default || res.data?.relativeUrl;
          if (uploadedUrl) {
            onCropComplete(uploadedUrl);
            setUploading(false);
            onClose();
          } else {
            throw new Error('Image URL not received from server');
          }
        } catch (uploadErr) {
          console.error('Photo crop upload error:', uploadErr);
          setError(uploadErr.response?.data?.message || 'Failed to upload cropped photo.');
          setUploading(false);
        }
      }, 'image/jpeg', 0.90);
    } catch (err) {
      console.error('Export canvas error:', err);
      setError('Could not process crop. Please try again.');
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Crop className="w-5 h-5 text-indigo-600" />
            <span>Crop & Adjust Popup Modal Image</span>
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
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-semibold text-slate-500 shrink-0">Frame Ratio:</span>
          {[
            { id: '16:9', label: 'Landscape (16:9)' },
            { id: '4:3', label: 'Standard (4:3)' },
            { id: '1:1', label: 'Square (1:1)' },
            { id: 'free', label: 'Full Image Ratio' }
          ].map(ratio => (
            <button
              key={ratio.id}
              type="button"
              onClick={() => {
                setAspectRatio(ratio.id);
                setZoom(1);
                setOffsetX(0);
                setOffsetY(0);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold border transition cursor-pointer shrink-0 ${
                aspectRatio === ratio.id 
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>

        {/* Canvas / Viewport */}
        <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-900/5 border border-slate-200 rounded-xl relative overflow-hidden">
          <div 
            className="relative cursor-move shadow-lg rounded-xl overflow-hidden border-2 border-indigo-400 bg-slate-950 flex items-center justify-center max-w-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <canvas
              ref={canvasRef}
              width={canvasDims.width}
              height={canvasDims.height}
              className="max-h-[380px] w-auto max-w-full object-contain block"
            />
            {/* Guide overlay */}
            <div className="absolute inset-0 pointer-events-none border border-white/30 grid grid-cols-3 grid-rows-3 opacity-40">
              <div className="border-r border-b border-white/30"></div>
              <div className="border-r border-b border-white/30"></div>
              <div className="border-b border-white/30"></div>
              <div className="border-r border-b border-white/30"></div>
              <div className="border-r border-b border-white/30"></div>
              <div className="border-b border-white/30"></div>
              <div className="border-r border-white/30"></div>
              <div className="border-r border-white/30"></div>
              <div></div>
            </div>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-2 flex items-center gap-1">
            <Move className="w-3 h-3" /> Click & drag inside the box to reposition image
          </p>
        </div>

        {/* Zoom Slider */}
        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <ZoomIn className="w-4 h-4 text-indigo-600" />
              Scale / Zoom
            </span>
            <span className="text-indigo-600 font-bold">{Math.round(zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.8, prev - 0.1))}
              className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
              className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setOffsetX(0);
                setOffsetY(0);
              }}
              className="p-1.5 text-xs text-slate-500 hover:text-slate-800 rounded bg-white border border-slate-200"
              title="Reset Zoom & Position"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleUseFullImage}
            disabled={uploading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-60"
            title="Upload original complete image without cropping"
          >
            <ImageIcon className="w-4 h-4 text-slate-500" />
            {uploading ? 'Processing...' : 'Keep Full Image (No Crop)'}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              {uploading ? 'Cropping & Uploading...' : 'Crop & Save Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCropperModal;
