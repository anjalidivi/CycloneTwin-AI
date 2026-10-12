import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ImageAnalysisResponse } from '../types/cyclone';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Wind,
  Gauge,
  Thermometer,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';

export const SatelliteAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to create synthetic satellite test canvas image and trigger upload
  const handleLoadSample = (sampleType: 'amphan' | 'mocha' | 'biparjoy') => {
    setErrorMsg(null);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Draw realistic multispectral infrared satellite cloud shield
    ctx.fillStyle = '#060c18';
    ctx.fillRect(0, 0, 512, 512);

    // Deep convection outer spiral bands
    const grad = ctx.createRadialGradient(256, 256, 15, 256, 256, 220);
    grad.addColorStop(0, sampleType === 'biparjoy' ? '#2e1065' : '#1e1b4b');
    grad.addColorStop(0.3, '#0284c7');
    grad.addColorStop(0.6, '#06b6d4');
    grad.addColorStop(0.85, '#0c4a6e');
    grad.addColorStop(1, '#060c18');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(256, 256, 210, 0, Math.PI * 2);
    ctx.fill();

    // Curved spiral feeder bands
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(256, 256, 140, 0.4, 2.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(256, 256, 175, 3.2, 5.4);
    ctx.stroke();

    // Warm eye cavity in center
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(256, 256, sampleType === 'mocha' ? 18 : 28, 0, Math.PI * 2);
    ctx.fill();

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `satellite_${sampleType}_sample.png`, {
        type: 'image/png',
      });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      executeUpload(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      executeUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      executeUpload(file);
    }
  };

  const executeUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const result = await api.uploadSatelliteImage(file);
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing satellite image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                MULTISPECTRAL RADIOMETER VISION CORE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                AI COMPUTER VISION
              </span>
            </div>
            <h1 className="text-3xl font-extrabold font-mono text-white tracking-tight">
              Satellite Imagery Morphological Analysis
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Automated central eye localization, convective asymmetry indexing, and Dvorak T-number proxy evaluation.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1">PRESET SAMPLES:</span>
            <button
              onClick={() => handleLoadSample('amphan')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 transition cursor-pointer"
            >
              Amphan (Cat 5)
            </button>
            <button
              onClick={() => handleLoadSample('mocha')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 transition cursor-pointer"
            >
              Mocha (Pinpoint Eye)
            </button>
            <button
              onClick={() => handleLoadSample('biparjoy')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 transition cursor-pointer"
            >
              Biparjoy (Sheared)
            </button>
          </div>
        </div>
      </div>

      {/* Upload Zone & Interactive Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dropzone & Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="glass-panel rounded-2xl p-6 border-2 border-dashed border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] text-center group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/tiff"
              className="hidden"
            />

            <div className="p-4 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition duration-300 shadow-[0_0_20px_rgba(0,240,255,0.2)] mb-3">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-1">
              Drag & Drop Satellite Image
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-3">
              Supports INSAT-3DR, NOAA VIIRS, MODIS, Meteosat (PNG, JPG, WebP)
            </p>
            <span className="text-[10px] font-mono px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
              Maximum file size: 25 MB
            </span>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300 truncate">
                <FileImage className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
              </div>
              <span className="text-slate-400 shrink-0">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Live Imagery Vision Screen */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-cyan-500/20 min-h-[380px] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>INFRARED MORPHOLOGY & EYE TARGETING</span>
            </span>
            {isUploading && (
              <span className="flex items-center gap-2 text-xs font-mono text-cyan-400 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>EXTRACTING CONVECTIVE VECTORS...</span>
              </span>
            )}
          </div>

          <div className="relative flex-1 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden min-h-[300px]">
            {previewUrl ? (
              <div className="relative max-h-[320px] max-w-full flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Satellite Observation"
                  className="max-h-[300px] w-auto object-contain rounded-lg"
                />

                {/* Overlaid Eye Detection Crosshairs if Eye Detected */}
                {analysisResult?.features.detected_eye && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-24 h-24 rounded-full border-2 border-rose-400 border-dashed animate-spin">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono bg-rose-950 px-1.5 py-0.5 rounded text-rose-300 border border-rose-500/40 whitespace-nowrap">
                        EYE CORE ({analysisResult.features.eye_diameter_km} KM)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 font-mono text-xs">
                <span>Select or upload an image to preview AI morphological features</span>
              </div>
            )}
          </div>

          {analysisResult && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Dimensions: {analysisResult.dimensions}</span>
              <span>Confidence: {(analysisResult.features.confidence_score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Feature Extraction Results Panel */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="ESTIMATED DVORAK T-NUMBER"
              value={`T${analysisResult.features.dvorak_estimate}`}
              unit="EST"
              subtitle="Empirical Convective Proxy"
              highlight={true}
              icon={<Sparkles className="w-5 h-5" />}
            />
            <MetricCard
              title="PROXY SUSTAINED WIND"
              value={analysisResult.features.estimated_wind_speed_kmh}
              unit="KM/H"
              subtitle={`${analysisResult.features.estimated_wind_speed_kts} Knots`}
              icon={<Wind className="w-5 h-5" />}
            />
            <MetricCard
              title="ESTIMATED PRESSURE"
              value={analysisResult.features.estimated_central_pressure_hpa}
              unit="HPA"
              subtitle="Knaff-Zehr Formulation"
              icon={<Gauge className="w-5 h-5" />}
            />
            <MetricCard
              title="CLOUD TOP TEMPERATURE"
              value={`${analysisResult.features.min_cloud_temperature_c}°`}
              unit="C"
              subtitle="Cold Outflow Top Minimum"
              icon={<Thermometer className="w-5 h-5" />}
            />
          </div>

          {/* Morphological Breakdown & Synoptic Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-cyan-500/20">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">
                Extracted Structural Metrics
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Eye Structure Detected:</span>
                  <span className={`font-bold ${analysisResult.features.detected_eye ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {analysisResult.features.detected_eye ? 'CONFIRMED' : 'NO DEFINED EYE'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Eye Diameter Proxy:</span>
                  <span className="text-white font-bold">{analysisResult.features.eye_diameter_km} km</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Convective Asymmetry Index:</span>
                  <span className="text-cyan-300 font-bold">{analysisResult.features.convective_asymmetry} (0-1)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Spiral Band Curvature Index:</span>
                  <span className="text-cyan-300 font-bold">{analysisResult.features.spiral_banding_index}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Core Compactness Ratio:</span>
                  <span className="text-cyan-300 font-bold">{(analysisResult.features.core_compactness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Nearest Historical Analogue:</span>
                  <span className="text-amber-400 font-bold">{analysisResult.matched_historical_analogue}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 glass-panel rounded-2xl p-5 border border-cyan-500/20 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-2">
                  Synoptic Feature Assessment
                </h3>
                <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 mb-3">
                  CLASSIFICATION: {analysisResult.intensity_class}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
                  {analysisResult.synoptic_assessment}
                </p>
              </div>

              {/* Mandatory Scientific Disclaimer Banner */}
              <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3.5 text-[11px] text-amber-200/90 font-mono flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold uppercase tracking-wider text-amber-300 mb-1">
                    Scientific Decision Support Notice
                  </div>
                  <div>{analysisResult.limitations_disclaimer}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
