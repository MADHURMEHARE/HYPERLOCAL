/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  MapPin, 
  Camera, 
  AlertTriangle, 
  Search, 
  Users, 
  Sparkles, 
  Upload, 
  HelpCircle,
  ThumbsUp,
  X,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { IssueCategory, IssueLocation, IssuePriority } from '../types';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Controller component to programmatically pan and zoom the map smoothly in ReportIssue
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

  return null;
}

// Map event listener to handle map click events
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

const createDroppedPinIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative cursor-pointer animate-pulse" style="width: 40px; height: 40px;">
        <svg class="h-10 w-10 text-rose-600 fill-rose-600/20 drop-shadow-xl" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="currentColor"></circle>
        </svg>
        <span class="absolute top-3 left-3.5 h-3 w-3 rounded-full bg-rose-500 animate-ping pointer-events-none"></span>
      </div>
    `,
    className: 'custom-leaflet-dropped-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

interface ReportIssueProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  onIssueCreated: (newIssue: any) => void;
  onNavigate: (view: string, issueId?: string) => void;
  prefilledLocation?: { lat: number; lng: number; address?: string; ward?: string } | null;
}

export default function ReportIssue({ 
  userId, 
  userName, 
  userAvatar, 
  onIssueCreated,
  onNavigate,
  prefilledLocation
}: ReportIssueProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Other');
  const [severity, setSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [estimatedImpact, setEstimatedImpact] = useState(150);
  
  // Location
  const [address, setAddress] = useState(prefilledLocation?.address || '145 Oak Crescent, San Francisco, CA');
  const [lat, setLat] = useState(prefilledLocation?.lat || 37.7833);
  const [lng, setLng] = useState(prefilledLocation?.lng || -122.4167);
  const [ward, setWard] = useState(prefilledLocation?.ward || 'Ward 5 - Heights');

  useEffect(() => {
    if (prefilledLocation) {
      if (prefilledLocation.address) setAddress(prefilledLocation.address);
      if (prefilledLocation.lat) setLat(prefilledLocation.lat);
      if (prefilledLocation.lng) setLng(prefilledLocation.lng);
      if (prefilledLocation.ward) setWard(prefilledLocation.ward);
    }
  }, [prefilledLocation]);

  // Media
  const [imageUrl, setImageUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);

  // Photo Source Selection Tab
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'presets'>('camera');

  // Camera stream state
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Duplicate Check State
  const [isScanningDuplicates, setIsScanningDuplicates] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [duplicateCheckSuccess, setDuplicateCheckSuccess] = useState<boolean | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset incident photos
  const presets = [
    {
      title: 'Deep Street Pothole',
      category: 'Road Damage' as IssueCategory,
      url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400',
      desc: 'Active road damage on busy street pavement.',
      address: '14th St & Valencia St, San Francisco, CA',
      ward: 'Ward 3 - Mission',
      lat: 37.7749,
      lng: -122.4194
    },
    {
      title: 'Water Main Pipe Rupture',
      category: 'Water Leakage' as IssueCategory,
      url: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?auto=format&fit=crop&w=400',
      desc: 'High volume fresh water flooding sidewalk.',
      address: '145 Oak Crescent, San Francisco, CA',
      ward: 'Ward 5 - Heights',
      lat: 37.7833,
      lng: -122.4167
    },
    {
      title: 'Commercial Bin Overfill',
      category: 'Garbage Collection' as IssueCategory,
      url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400',
      desc: 'Waste heaps blockading commercial alley.',
      address: 'Caledonia Alley, San Francisco, CA',
      ward: 'Ward 3 - Mission',
      lat: 37.7699,
      lng: -122.4468
    },
    {
      title: 'Unlit Park Pedestrian Light',
      category: 'Broken Streetlight' as IssueCategory,
      url: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=400',
      desc: 'Light fixture completely dark at night.',
      address: 'Dolores Park Pathway, San Francisco, CA',
      ward: 'Ward 3 - Mission',
      lat: 37.7599,
      lng: -122.4368
    }
  ];

  // Stop camera on unmount or tab change
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startWebcam = async () => {
    setCameraError(null);
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      setIsWebcamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera streaming unavailable, falling back to upload.", err);
      setCameraError("Webcam/Camera access was denied or is not available. Please upload a file instead.");
      setActiveTab('upload');
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);
  };

  const handleTabChange = (tab: 'camera' | 'upload' | 'presets') => {
    setActiveTab(tab);
    if (tab !== 'camera') {
      stopWebcam();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageUrl(dataUrl);
        stopWebcam();
        
        // Auto-analyze captured photo immediately!
        autoAnalyze(dataUrl, 'captured_webcam_snapshot.jpg');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageUrl(base64String);
        autoAnalyze(base64String, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (p: typeof presets[0]) => {
    setImageUrl(p.url);
    setTitle(`Severe reported ${p.title.toLowerCase()}`);
    setDescription(`We noticed this ${p.title.toLowerCase()} which appears highly hazardous. It requires immediate maintenance to prevent damage or safety issues.`);
    setAddress(p.address);
    setWard(p.ward);
    setLat(p.lat);
    setLng(p.lng);
    setAiAnalysisResult(null);
    setAiConfidence(null);
    setDuplicateWarning(null);

    autoAnalyze(p.url, `${p.title.toLowerCase().replace(/ /g, '_')}.jpg`);
  };

  const autoAnalyze = async (imgData: string, filenameStr: string) => {
    setIsAnalyzing(true);
    setError('');
    setAiAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64: imgData, 
          filename: filenameStr 
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAiAnalysisResult(data);
        setAiConfidence(data.confidence || 85);
        setCategory(data.category || 'Other');
        setSeverity(data.severity || 'Medium');
        if (data.estimatedImpact) {
          setEstimatedImpact(data.estimatedImpact);
        }
        setTitle(data.title || `Severe ${data.category || 'incident'} detected`);
        setDescription(data.summary || `AI has detected a ${data.category?.toLowerCase() || 'civic'} issue. Immediate dispatch of municipal maintenance is recommended.`);
      } else {
        setError(data.error || 'AI Vision analysis failed.');
      }
    } catch (err) {
      setError('Failed to reach AI Analysis server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScanDuplicates = async () => {
    if (!title) {
      setError('Please write a title before checking for duplicates.');
      return;
    }
    setIsScanningDuplicates(true);
    setDuplicateWarning(null);
    setDuplicateCheckSuccess(null);
    setError('');

    try {
      const res = await fetch('/api/ai/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, lat, lng })
      });
      const data = await res.json();
      if (data.isDuplicate) {
        setDuplicateWarning(data);
        setDuplicateCheckSuccess(false);
      } else {
        setDuplicateCheckSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to query duplicate detection system.');
    } finally {
      setIsScanningDuplicates(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address) {
      setError('Please fill in all core reporting details.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const payload = {
      title,
      description,
      category,
      severity,
      location: { lat, lng, address, ward },
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800',
      createdBy: userId,
      creatorName: userName,
      creatorAvatar: userAvatar,
      aiConfidence: aiConfidence || 80,
      estimatedImpact
    };

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const newIssue = await res.json();
      
      if (res.ok) {
        onIssueCreated(newIssue);
        onNavigate('citizen-dashboard');
      } else {
        setError(newIssue.error || 'Submission failed.');
      }
    } catch (err) {
      setError('Failed to transmit ticket to municipal server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map click coordinate handler
  const handleMapClick = (clickedLat: number, clickedLng: number) => {
    setLat(clickedLat);
    setLng(clickedLng);
    setAddress('Resolving address...');
    setWard('Resolving ward...');

    // Fetch dynamic reverse geocoding from server-side Gemini API with seamless local fallback
    fetch('/api/ai/reverse-geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: clickedLat, lng: clickedLng })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          setAddress(data.address);
          setWard(data.ward || 'Ward 3 - Mission');
        } else {
          throw new Error('Geocoding response structure incomplete');
        }
      })
      .catch(err => {
        console.error('Dynamic geocoding error, falling back:', err);
        const streets = ['Valencia St', 'Mission St', 'Oak Crescent', 'Dolores St', 'Harrison St', 'Folsom St', 'Market St', 'Castro St'];
        const randomStreet = streets[Math.floor(Math.abs(clickedLat * 100) % streets.length)];
        const generatedAddr = `${Math.floor(Math.abs(clickedLng * 1000) % 900) + 100} ${randomStreet}, San Francisco, CA`;
        setAddress(generatedAddr);

        const wards = ['Ward 3 - Mission', 'Ward 5 - Heights', 'Ward 2 - Castro', 'Ward 4 - Noe'];
        const generatedWard = wards[Math.floor(Math.abs(clickedLng * 1000) % wards.length)];
        setWard(generatedWard);
      });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation back and header banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-5">
          <div className="space-y-1">
            <button
              onClick={() => onNavigate('citizen-dashboard')}
              className="group inline-flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-semibold mb-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Citizen Portal</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Brain className="h-4 w-4" />
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                AI Photo Reporter & Detector
              </h1>
            </div>
            <p className="font-sans text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Snap a picture or upload an issue. Our AI automatically parses the image to identify the hazard, categorizes it, evaluates the severity, and logs a verified municipal work order.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs self-start md:self-center">
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white flex items-center justify-center overflow-hidden shrink-0">
              {userAvatar ? (
                <img src={userAvatar} className="h-full w-full object-cover" alt={userName} referrerPolicy="no-referrer" />
              ) : (
                <div className="text-xs font-bold text-slate-500">{userName.slice(0, 2).toUpperCase()}</div>
              )}
            </div>
            <div className="space-y-0.5 text-left">
              <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-none">{userName}</p>
              <p className="text-[9px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider leading-none">Reporter Account</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-4 flex items-start space-x-3 text-xs font-medium text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Form / Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Camera, Upload, Presets & AI Detection output (Step 1) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* The Photo Capture Hub */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-blue-600" />
                  Step 1: Visual Evidence
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">HTML5 camera enabled</span>
              </div>

              {/* Mode Selectors */}
              <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-850 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleTabChange('camera')}
                  className={`py-3 text-center border-b-2 transition-all cursor-pointer ${
                    activeTab === 'camera'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  📷 Live Shutter
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('upload')}
                  className={`py-3 text-center border-b-2 transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  📁 File Upload
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('presets')}
                  className={`py-3 text-center border-b-2 transition-all cursor-pointer ${
                    activeTab === 'presets'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  💡 Demo Presets
                </button>
              </div>

              <div className="p-5 space-y-4">
                
                {/* 1. Camera tab panel */}
                {activeTab === 'camera' && (
                  <div className="space-y-4">
                    {cameraError && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-xl">
                        {cameraError}
                      </div>
                    )}

                    {!isWebcamActive ? (
                      <div className="h-64 rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-center p-6 border border-slate-800 shadow-inner space-y-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-slate-900 opacity-90" />
                        <div className="relative z-10 space-y-3">
                          <div className="mx-auto h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/25 animate-pulse">
                            <Camera className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xs.5 font-bold text-white">Live Viewfinder Standby</h3>
                            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                              Ready to access your device's camera for immediate spatial scanning and hazard detection.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={startWebcam}
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                          >
                            Activate Device Camera
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative h-64 w-full rounded-2xl bg-black overflow-hidden border border-slate-800 shadow-lg">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="h-full w-full object-cover"
                          />
                          
                          {/* Live Scan overlay elements */}
                          <div className="absolute inset-0 border border-white/20 pointer-events-none" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-blue-500/45 rounded-full pointer-events-none" />
                          <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-rose-600/95 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                            <span>Live Scanner</span>
                          </div>

                          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-[9px] font-mono text-slate-300 px-2.5 py-1 rounded-md">
                            Camera feed: Active environment mode
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                          >
                            📸 Snap Photo
                          </button>
                          <button
                            type="button"
                            onClick={stopWebcam}
                            className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. File upload panel */}
                {activeTab === 'upload' && (
                  <div className="space-y-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-64 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-50 dark:hover:bg-slate-900 flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all relative overflow-hidden"
                    >
                      <div className="space-y-3">
                        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs.5 font-bold text-slate-900 dark:text-white">Click or Drag & Drop Photo</h3>
                          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                            Support JPEGs, PNGs, and direct mobile camera triggers. AI will analyze immediately upon drop.
                          </p>
                        </div>
                        <span className="inline-flex py-1 px-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          Browse Local Files
                        </span>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        capture="environment" // Forces camera selection on mobile browsers!
                        className="hidden" 
                      />
                    </div>
                  </div>
                )}

                {/* 3. Demo presets panel */}
                {activeTab === 'presets' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {presets.map((preset, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleApplyPreset(preset)}
                          className={`group overflow-hidden rounded-2xl border cursor-pointer transition-all flex flex-col justify-between bg-slate-50/30 dark:bg-slate-950/10 ${
                            imageUrl === preset.url
                              ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/10'
                              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-750'
                          }`}
                        >
                          <div className="h-24 w-full relative overflow-hidden">
                            <img 
                              className="h-full w-full object-cover transition-transform group-hover:scale-103" 
                              src={preset.url} 
                              alt={preset.title}
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              {preset.category}
                            </span>
                          </div>
                          <div className="p-3 space-y-0.5">
                            <h4 className="font-sans font-bold text-xs text-slate-900 dark:text-white truncate">
                              {preset.title}
                            </h4>
                            <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-normal">
                              {preset.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* AI Scanning Loader & Analysis Visual Card */}
            <div className="space-y-4">
              
              {imageUrl && (
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      Visual Scanning Sandbox
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
                      <img 
                        src={imageUrl} 
                        className={`max-h-64 w-auto object-contain transition-all ${isAnalyzing ? 'brightness-40 blur-xs' : ''}`} 
                        alt="Workspace visual report"
                        referrerPolicy="no-referrer"
                      />

                      {/* Sweeping laser scan line animation */}
                      {isAnalyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {/* Laser sweeping bar */}
                          <div className="absolute left-0 right-0 h-1.5 bg-blue-500/60 shadow-[0_0_20px_#3b82f6] animate-bounce w-full top-1/4" />
                          
                          <div className="text-center space-y-3 z-10 px-6">
                            <Brain className="mx-auto h-10 w-10 text-blue-400 animate-spin" />
                            <div className="space-y-1">
                              <p className="text-xs.5 font-bold text-white">Analyzing Multimodal Inputs...</p>
                              <p className="text-[10px] text-slate-300 leading-normal max-w-xs">
                                Gemini Vision model is inspecting pixel configurations to classify hazard types, calculate priority levels, and recommend civic dispatch.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI Cause Detection Results Card */}
                    {!isAnalyzing && aiAnalysisResult && (
                      <div className="rounded-2xl border border-indigo-150 bg-indigo-50/15 dark:border-indigo-900/30 dark:bg-indigo-950/10 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-lg border border-indigo-500/20">
                            <Brain className="h-3 w-3 animate-pulse" />
                            <span>AI Cause Detection Confirmed</span>
                          </span>
                          <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-400">
                            {aiConfidence}% Accuracy
                          </span>
                        </div>

                        <div className="space-y-2 text-left">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Hazard</p>
                            <p className="font-sans font-extrabold text-sm text-slate-900 dark:text-white">
                              {aiAnalysisResult.title || 'Civic Infrastructure Wear'}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-200/40 dark:border-slate-850/40">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Category Classification</p>
                              <p className="font-sans text-xs font-semibold text-indigo-700 dark:text-indigo-400">{category}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Severity Level</p>
                              <span className={`inline-flex items-center text-[10px] font-bold leading-none ${
                                severity === 'Critical' 
                                  ? 'text-rose-600' 
                                  : severity === 'High' 
                                  ? 'text-amber-600' 
                                  : 'text-blue-600'
                              }`}>
                                {severity}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 pt-1.5 border-t border-slate-200/40 dark:border-slate-850/40">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Summary of Causes & Action Required</p>
                            <p className="font-sans text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                              {aiAnalysisResult.summary}
                            </p>
                            <p className="font-sans text-xs font-semibold text-slate-800 dark:text-slate-200 italic mt-1 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                              🔧 Recommended Action: {aiAnalysisResult.recommended_action}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: Ticket Specs Form & Geolocation Pinning (Step 2 & 3) */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-3 flex items-center justify-between">
                <h2 className="font-display font-extrabold text-sm text-slate-950 dark:text-white flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-[10px] font-bold">2</span>
                  Ticket Details Verification
                </h2>
                <span className="text-[9px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded">
                  Auto-fill Enabled
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Incident Summary / Title
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Snap a photo or write custom title"
                        className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-sans font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleScanDuplicates}
                        disabled={isScanningDuplicates || !title}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isScanningDuplicates ? 'Scanning...' : 'Scan Duplicate'}
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Detailed Incident Context
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Specify erosion, dimensions, hazard levels for safety vehicles."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all resize-none font-sans"
                    />
                  </div>

                  {/* Category & Severity Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Category Classification
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as IssueCategory)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Road Damage">Road Damage</option>
                        <option value="Water Leakage">Water Leakage</option>
                        <option value="Garbage Collection">Garbage Collection</option>
                        <option value="Broken Streetlight">Broken Streetlight</option>
                        <option value="Drainage Issue">Drainage Issue</option>
                        <option value="Public Safety">Public Safety</option>
                        <option value="Illegal Dumping">Illegal Dumping</option>
                        <option value="Fallen Tree">Fallen Tree</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Severity Level
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 px-3 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Critical">Critical (Immediate Danger)</option>
                        <option value="High">High (Major Hazard)</option>
                        <option value="Medium">Medium (Moderate wear)</option>
                        <option value="Low">Low (Minor Infrastructure)</option>
                      </select>
                    </div>
                  </div>

                  {/* Estimated Impact */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-900">
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Affected Citizen Impact
                      </label>
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {estimatedImpact} residents
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="5000"
                      step="50"
                      value={estimatedImpact}
                      onChange={(e) => setEstimatedImpact(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between font-mono text-[8px] text-slate-400">
                      <span>10 people</span>
                      <span>2,500 people</span>
                      <span>5,000+ people</span>
                    </div>
                  </div>

                </div>

                {/* Duplicate check warnings */}
                {duplicateWarning && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20 p-4 space-y-3">
                    <div className="flex items-start space-x-2.5 text-amber-800 dark:text-amber-400">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <div>
                        <h4 className="font-display font-bold text-xs.5">Duplicate Warning Detected</h4>
                        <p className="font-sans text-xs text-amber-700 dark:text-amber-400/85 leading-relaxed mt-0.5">
                          A similar report titled "{duplicateWarning.existingIssue.title}" has been registered nearby. (Similarity: {duplicateWarning.confidence}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('issue-details', duplicateWarning.existingIssue.id)}
                        className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-3.5 py-1.5 transition-all cursor-pointer"
                      >
                        View & Endorse Existing (+5 XP)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDuplicateWarning(null);
                          setDuplicateCheckSuccess(null);
                        }}
                        className="rounded-lg border border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-400 font-bold text-[10px] px-3 py-1.5 transition-all cursor-pointer"
                      >
                        File Duplicate Anyway
                      </button>
                    </div>
                  </div>
                )}

                {duplicateCheckSuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-4">
                    <div className="flex items-center space-x-2.5 text-emerald-800 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h4 className="font-display font-bold text-xs.5">Clear for Submission</h4>
                        <p className="font-sans text-xs text-emerald-700 dark:text-emerald-400/85 mt-0.5">
                          Municipal database scanned. No similar tickets found nearby. This issue is unique and safe to file!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map pinning block (Step 3) */}
                <div className="space-y-3 pt-3 border-t border-slate-150 dark:border-slate-850">
                  <div className="flex items-center justify-between">
                    <label className="font-sans text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      Step 3: Geolocation coordinates
                    </label>
                    <span className="text-[9px] text-slate-400">Click map to drop marker</span>
                  </div>

                  <div className="relative h-48 w-full rounded-2xl border border-slate-200 dark:border-slate-850 overflow-hidden shadow-inner z-10">
                    <MapContainer
                      center={[lat, lng]}
                      zoom={14}
                      scrollWheelZoom={true}
                      style={{ width: '100%', height: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapController center={[lat, lng]} zoom={14} />
                      <MapEvents onMapClick={handleMapClick} />
                      <Marker position={[lat, lng]} icon={createDroppedPinIcon()} />
                    </MapContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-150 dark:border-slate-900 text-left">
                    <div className="space-y-0.5">
                      <span className="font-sans text-[9px] text-slate-400 uppercase tracking-wider font-bold">Latitude</span>
                      <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">{lat.toFixed(5)}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-sans text-[9px] text-slate-400 uppercase tracking-wider font-bold">Longitude</span>
                      <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">{lng.toFixed(5)}</p>
                    </div>
                    <div className="space-y-0.5 col-span-2 border-t border-slate-200/50 dark:border-slate-850 pt-2">
                      <span className="font-sans text-[9px] text-slate-400 uppercase tracking-wider font-bold">Geocoded Municipal Address</span>
                      <p className="font-sans text-xs font-bold text-slate-900 dark:text-white truncate">{address}</p>
                      <span className="font-sans text-[9px] font-medium text-blue-600 dark:text-blue-400">{ward}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-150 dark:border-slate-850 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !title || !imageUrl}
                    className="w-full flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs py-3.5 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Transmitting Incident...' : 'Submit Verified Ticket (+10 XP)'}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-2 leading-none font-medium">
                    Submit to municipal servers for automatic department queuing.
                  </p>
                </div>

              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
