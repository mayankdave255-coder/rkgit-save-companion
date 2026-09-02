import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, Upload, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  language: Language;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  language,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setIsLoading(true);
    setHasCameraError(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this device/browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Camera stream error:', error);
      setHasCameraError(
        error.name === 'NotAllowedError'
          ? (language === 'hi' ? 'कैमरा अनुमति अस्वीकृत हुई। कृपया फ़ाइल अपलोड का उपयोग करें।' : 'Camera permission denied. You can still upload or choose a photo.')
          : (language === 'hi' ? 'कैमरा प्रारंभ नहीं हो सका। कृपया फ़ोटो चुनें।' : 'Could not start camera. Please upload an image instead.')
      );
    } finally {
      setIsLoading(false);
    }
  }, [language, stopStream]);

  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera(cameraFacing);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, cameraFacing, startCamera, capturedPhoto, stopStream]);

  if (!isOpen) return null;

  const handleSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopStream();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(cameraFacing);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedPhoto(result);
        stopStream();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0a1524]/85 border-2 border-cyan-500/25 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-[#060c16] border-b-2 border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Camera className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-100 text-sm sm:text-base">
              {language === 'hi' ? 'चोट या खतरे की फ़ोटो लें' : 'Capture Injury or Hazard Photo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-2 border-cyan-500/25 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          {capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured triage photo"
              className="w-full h-full object-contain"
            />
          ) : hasCameraError ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-xs text-slate-300 max-w-xs font-medium">{hasCameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="hud-btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl active:translate-x-0.5 active:translate-y-0.5 text-xs font-bold transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{language === 'hi' ? 'फ़ाइल या फ़ोटो चुनें' : 'Choose File / Photo'}</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {/* Target crosshair overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-full h-full border-2 border-dashed border-cyan-400/60 rounded-2xl flex items-center justify-center">
                  <span className="text-[10px] text-cyan-300 font-bold bg-[#060c16]/80 px-2.5 py-1 rounded-lg border border-cyan-400/50 shadow-sm">
                    {language === 'hi' ? 'घाव / चोट को केंद्र में रखें' : 'Center wound/hazard in frame'}
                  </span>
                </div>
              </div>
              {isLoading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-[#060c16] border-t-2 border-cyan-500/20 flex items-center justify-between gap-3">
          {capturedPhoto ? (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 text-slate-200 text-xs font-bold border-2 border-cyan-500/25 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'hi' ? 'दोबारा लें' : 'Retake'}</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:translate-x-0.5 active:translate-y-0.5 text-white text-xs font-bold border-2 border-emerald-400 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'hi' ? 'उपयोग करें' : 'Attach Photo'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 text-slate-300 text-xs font-bold border-2 border-cyan-500/25 transition cursor-pointer"
                title="Upload image from gallery"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden xs:inline">{language === 'hi' ? 'गैलरी' : 'Upload'}</span>
              </button>

              <button
                onClick={handleSnap}
                disabled={!!hasCameraError || isLoading}
                className="hud-btn-primary flex items-center justify-center w-14 h-14 rounded-full active:translate-x-0.5 active:translate-y-0.5 border-4 border-[#060c16] transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                title="Capture Photo"
              >
                <div className="w-5 h-5 rounded-full bg-white" />
              </button>

              <button
                onClick={handleToggleFacing}
                disabled={!!hasCameraError}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:translate-x-0.5 active:translate-y-0.5 text-slate-300 text-xs font-bold border-2 border-cyan-500/25 transition cursor-pointer"
                title="Flip Camera"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden xs:inline">{language === 'hi' ? 'पलटें' : 'Flip'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
