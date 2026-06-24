/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Map, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Flame,
  MapPin,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import { Issue, PredictiveHotspot } from '../types';

interface InteractiveMapProps {
  issues: Issue[];
  predictions: PredictiveHotspot[];
  onNavigate: (view: string, issueIdOrData?: any) => void;
}

export default function InteractiveMap({ issues, predictions, onNavigate }: InteractiveMapProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Interactive Pan and Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map layer toggles
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Selection States
  const [hoveredIssue, setHoveredIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<PredictiveHotspot | null>(null);
  const [droppedPin, setDroppedPin] = useState<{ lat: number; lng: number; address: string; ward: string } | null>(null);

  const mapViewportRef = useRef<HTMLDivElement>(null);

  // Filters
  const filteredIssues = issues.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || i.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || i.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColorHex = (status: string) => {
    switch (status) {
      case 'Resolved': return '#10B981'; // emerald-500
      case 'In Progress': return '#2563EB'; // blue-600
      case 'Assigned': return '#F59E0B'; // amber-500
      case 'Verified': return '#8B5CF6'; // purple-500
      default: return '#EF4444'; // rose-500
    }
  };

  const handleMapPinClick = (issue: Issue) => {
    setSelectedHotspot(null);
    setDroppedPin(null);
    setSelectedIssue(issue);
    centerOnCoordinate(issue.location.lat, issue.location.lng);
  };

  const handleHotspotClick = (hotspot: PredictiveHotspot) => {
    setSelectedIssue(null);
    setDroppedPin(null);
    setSelectedHotspot(hotspot);
    centerOnCoordinate(hotspot.lat, hotspot.lng);
  };

  // Center the map on specific latitude & longitude
  const centerOnCoordinate = (lat: number, lng: number) => {
    const container = mapViewportRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const targetZoom = 2; // Nice level of zoom focus
      
      const leftPct = ((lng + 122.45) / 0.05); // 0 to 1
      const topPct = (1 - (lat - 37.75) / 0.04); // 0 to 1
      
      const targetX = rect.width / 2 - leftPct * rect.width * targetZoom;
      const targetY = rect.height / 2 - topPct * rect.height * targetZoom;
      
      const maxPanX = rect.width * (targetZoom - 1);
      const maxPanY = rect.height * (targetZoom - 1);
      
      setZoom(targetZoom);
      setPan({
        x: Math.min(0, Math.max(-maxPanX, targetX)),
        y: Math.min(0, Math.max(-maxPanY, targetY))
      });
    }
  };

  // Drag handlers for Desktop Mouse
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left mouse click
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setDragDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    // Bounds depend on the active zoom level
    const maxPanX = rect.width * (zoom - 1);
    const maxPanY = rect.height * (zoom - 1);
    
    // Allow panning within bounded scale
    const boundedX = Math.min(0, Math.max(-maxPanX, dx));
    const boundedY = Math.min(0, Math.max(-maxPanY, dy));
    
    setPan({ x: boundedX, y: boundedY });
    
    const dist = Math.sqrt(Math.pow(e.clientX - mouseDownPos.x, 2) + Math.pow(e.clientY - mouseDownPos.y, 2));
    setDragDistance(dist);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (dragDistance < 5) {
      handleMapBackgroundClick(e);
    }
  };

  // Drag handlers for Mobile Touch Screen
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    setMouseDownPos({ x: touch.clientX, y: touch.clientY });
    setDragDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;
    
    const maxPanX = rect.width * (zoom - 1);
    const maxPanY = rect.height * (zoom - 1);
    
    const boundedX = Math.min(0, Math.max(-maxPanX, dx));
    const boundedY = Math.min(0, Math.max(-maxPanY, dy));
    
    setPan({ x: boundedX, y: boundedY });
    
    const dist = Math.sqrt(Math.pow(touch.clientX - mouseDownPos.x, 2) + Math.pow(touch.clientY - mouseDownPos.y, 2));
    setDragDistance(dist);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (dragDistance < 5 && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const fakeMouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        currentTarget: e.currentTarget,
        target: e.target
      } as unknown as React.MouseEvent<HTMLDivElement>;
      handleMapBackgroundClick(fakeMouseEvent);
    }
  };

  // Click on map empty background to drop a pin
  const handleMapBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't register empty click if we are clicking on pins, buttons or text overlays
    if (target.closest('.map-pin-marker') || target.closest('button')) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Reverse zoom and pan calculation to obtain unscaled coordinate percentages
    const x_unscaled = (x - pan.x) / zoom;
    const y_unscaled = (y - pan.y) / zoom;
    
    const normX = x_unscaled / rect.width;
    const normY = y_unscaled / rect.height;
    
    // Clamp to [0, 1] range
    const clampedX = Math.max(0, Math.min(1, normX));
    const clampedY = Math.max(0, Math.min(1, normY));
    
    const calculatedLat = 37.75 + (1 - clampedY) * 0.04;
    const calculatedLng = -122.45 + clampedX * 0.05;

    // Simulate localized addresses
    const streets = ['Valencia St', 'Mission St', 'Oak Crescent', 'Dolores St', 'Harrison St', 'Folsom St', 'Market St', 'Castro St'];
    const blocks = Math.floor(clampedX * 900) + 100;
    const selectedStreet = streets[Math.floor(clampedY * streets.length)];
    const generatedAddr = `${blocks} ${selectedStreet}, San Francisco, CA`;

    const wards = ['Ward 3 - Mission', 'Ward 5 - Heights', 'Ward 2 - Castro', 'Ward 4 - Noe'];
    const generatedWard = wards[Math.floor(clampedX * wards.length)];

    setSelectedIssue(null);
    setSelectedHotspot(null);
    setDroppedPin({
      lat: calculatedLat,
      lng: calculatedLng,
      address: 'Resolving address...',
      ward: 'Resolving ward...'
    });

    // Dynamic reverse geocoding from server-side Gemini API with seamless local fallback
    fetch('/api/ai/reverse-geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: calculatedLat, lng: calculatedLng })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          setDroppedPin({
            lat: calculatedLat,
            lng: calculatedLng,
            address: data.address,
            ward: data.ward || 'Ward 3 - Mission'
          });
        }
      })
      .catch(err => {
        console.error('Dynamic geocoding error, falling back:', err);
        const streets = ['Valencia St', 'Mission St', 'Oak Crescent', 'Dolores St', 'Harrison St', 'Folsom St', 'Market St', 'Castro St'];
        const blocks = Math.floor(clampedX * 900) + 100;
        const selectedStreet = streets[Math.floor(clampedY * streets.length)];
        const generatedAddr = `${blocks} ${selectedStreet}, San Francisco, CA`;
        const wards = ['Ward 3 - Mission', 'Ward 5 - Heights', 'Ward 2 - Castro', 'Ward 4 - Noe'];
        const generatedWard = wards[Math.floor(clampedX * wards.length)];
        setDroppedPin({
          lat: calculatedLat,
          lng: calculatedLng,
          address: generatedAddr,
          ward: generatedWard
        });
      });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      
      {/* Search and filter header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase font-bold tracking-wider">
            <Map className="h-3.5 w-3.5 animate-pulse" />
            <span>Interactive GIS Console</span>
          </div>
          <h1 className="font-display text-2.5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Smart Infrastructure Map
          </h1>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search address or street..."
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-all w-52"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 py-2 px-3 text-xs text-slate-850 dark:text-slate-300 outline-none focus:border-blue-500 transition-all"
          >
            <option value="all">All Categories</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Garbage Collection">Garbage Collection</option>
            <option value="Broken Streetlight">Broken Streetlight</option>
            <option value="Drainage Issue">Drainage Issue</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 py-2 px-3 text-xs text-slate-850 dark:text-slate-300 outline-none focus:border-blue-500 transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Map Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hand: GIS Map Container */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm relative min-h-[500px] flex-1 flex flex-col">
            
            {/* GIS SVG Visual grid map wrapper (Outer container tracks dragging) */}
            <div 
              ref={mapViewportRef}
              className="absolute inset-0 bg-slate-100 dark:bg-slate-950 transition-colors duration-300 select-none overflow-hidden gis-map-viewport"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Inner container scales & translates on zoom/pan */}
              <div
                className="absolute inset-0 select-none origin-top-left"
                style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* Simulated Map Background - roads and grid */}
                <svg className="absolute inset-0 h-full w-full opacity-35 dark:opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1 3" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Simulated Highways */}
                  <path d="M 0 100 Q 300 120 800 350" fill="none" stroke="currentColor" strokeWidth="24" className="text-slate-300 dark:text-slate-800" />
                  <path d="M 120 0 Q 320 400 380 600" fill="none" stroke="currentColor" strokeWidth="18" className="text-slate-300 dark:text-slate-800" />
                  <path d="M 0 450 C 350 480 500 200 800 150" fill="none" stroke="currentColor" strokeWidth="16" className="text-slate-300 dark:text-slate-800" />
                </svg>

                {/* Park and water blocks */}
                <div className="absolute top-12 left-28 h-28 w-44 rounded-full bg-emerald-500/8 dark:bg-emerald-500/4 blur-lg pointer-events-none" />
                <div className="absolute bottom-16 right-12 h-32 w-32 rounded-3xl bg-blue-500/8 dark:bg-blue-500/4 blur-lg pointer-events-none" />

                {/* Heatmap Layer Overlays */}
                {showHeatmap && (
                  <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 bg-orange-500/5 dark:bg-orange-500/2">
                    {predictions.map((p, idx) => (
                      <div
                        key={idx}
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-orange-500/50 via-amber-500/10 to-transparent blur-md animate-pulse"
                        style={{
                          left: `${((p.lng + 122.45) / 0.05) * 100}%`,
                          top: `${(1 - (p.lat - 37.75) / 0.04) * 100}%`,
                          width: `${p.historicalIncidents * 18}px`,
                          height: `${p.historicalIncidents * 18}px`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* GIS Markers Overlay */}
                <div className="absolute inset-0 pointer-events-auto">
                  {/* Active Reported Issues Pins */}
                  {filteredIssues.map((issue) => {
                    const leftPct = ((issue.location.lng + 122.45) / 0.05) * 100;
                    const topPct = (1 - (issue.location.lat - 37.75) / 0.04) * 100;
                    const pinColor = getStatusColorHex(issue.status);
                    
                    return (
                      <div
                        key={issue.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMapPinClick(issue);
                        }}
                        onMouseEnter={() => setHoveredIssue(issue)}
                        onMouseLeave={() => setHoveredIssue(null)}
                        className="absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-transform duration-200 hover:scale-120 group z-10 map-pin-marker"
                        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                      >
                        <MapPin 
                          className="h-7 w-7 drop-shadow-md" 
                          style={{ color: pinColor, fill: `${pinColor}25` }}
                        />
                        {/* Interactive ring pulse */}
                        <span 
                          className="absolute top-2.5 left-2.5 h-2 w-2 rounded-full animate-ping pointer-events-none"
                          style={{ backgroundColor: pinColor }}
                        />
                      </div>
                    );
                  })}

                  {/* AI Predictive Hotspots Pins (glowing purple icons) */}
                  {showHeatmap && predictions.map((p) => {
                    const leftPct = ((p.lng + 122.45) / 0.05) * 100;
                    const topPct = (1 - (p.lat - 37.75) / 0.04) * 100;

                    return (
                      <div
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHotspotClick(p);
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-120 z-10 map-pin-marker"
                        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg border-2 border-white dark:border-slate-900 shadow-purple-500/30">
                          <Sparkles className="h-3 w-3 animate-pulse" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Bouncing neon Pink custom dropped pin */}
                  {droppedPin && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-20 map-pin-marker"
                      style={{ 
                        left: `${((droppedPin.lng + 122.45) / 0.05) * 100}%`, 
                        top: `${(1 - (droppedPin.lat - 37.75) / 0.04) * 100}%` 
                      }}
                    >
                      <MapPin className="h-8 w-8 text-pink-600 fill-pink-600/35 drop-shadow-xl animate-bounce" />
                      <span className="absolute top-2.5 left-3 h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping pointer-events-none" />
                    </div>
                  )}
                </div>

                {/* Mini pin hover card */}
                {hoveredIssue && (
                  <div 
                    className="absolute pointer-events-none -translate-x-1/2 -translate-y-[115%] bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl z-30 max-w-xs backdrop-blur-md transition-all duration-150"
                    style={{
                      left: `${((hoveredIssue.location.lng + 122.45) / 0.05) * 100}%`,
                      top: `${(1 - (hoveredIssue.location.lat - 37.75) / 0.04) * 100}%`
                    }}
                  >
                    <h4 className="font-sans font-bold text-slate-950 dark:text-white text-xs">{hoveredIssue.title}</h4>
                    <p className="font-mono text-[9px] text-slate-400 mt-0.5">{hoveredIssue.location.address}</p>
                  </div>
                )}
              </div>

              {/* FLOATING ZOOM AND NAVIGATION CONTROLS */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2 z-20">
                <button 
                  onClick={() => setZoom(z => Math.min(4, z + 0.5))}
                  className="h-9 w-9 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-350 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    setZoom(z => {
                      const next = Math.max(1, z - 0.5);
                      if (next === 1) setPan({ x: 0, y: 0 }); // reset center
                      return next;
                    });
                  }}
                  className="h-9 w-9 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-350 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="h-9 w-9 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-350 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
                  title="Reset View"
                >
                  <RotateCw className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Floating prediction hotspot toggle button */}
              <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-20">
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 backdrop-blur-md cursor-pointer ${
                    showHeatmap
                      ? 'border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300'
                      : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <Flame className="h-4 w-4" />
                  <span>{showHeatmap ? 'Predictions Active' : 'Enable Hotspot View'}</span>
                </button>
              </div>

              {/* Floating map legend */}
              <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-md flex items-center space-x-4 backdrop-blur-md max-w-[280px] z-20">
                <div className="space-y-1 text-left">
                  <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block tracking-wide">Map Legend</span>
                  <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-emerald-500 mr-1" />Resolved</span>
                    <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-blue-600 mr-1" />In Progress</span>
                    <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-red-500 mr-1" />Reported</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Hand: Context Panel (Dynamic based on selected items) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* General list/search panel if nothing is selected */}
          {!selectedIssue && !selectedHotspot && !droppedPin && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex-1 flex flex-col">
              <div className="text-left space-y-1 border-b border-slate-100 dark:border-slate-850 pb-3">
                <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">
                  Incidents list ({filteredIssues.length})
                </h3>
                <p className="font-sans text-xs text-slate-400">
                  Select a card below to center map or tap background to drop custom coordinates
                </p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[420px] no-scrollbar space-y-2.5 text-left pr-1">
                {filteredIssues.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Map className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-750" />
                    <p className="text-xs text-slate-400">No issues found matching criteria.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const pinColor = getStatusColorHex(issue.status);
                    return (
                      <div
                        key={issue.id}
                        onClick={() => {
                          setSelectedIssue(issue);
                          setSelectedHotspot(null);
                          setDroppedPin(null);
                          centerOnCoordinate(issue.location.lat, issue.location.lng);
                        }}
                        className="group flex items-start space-x-3 rounded-2xl border border-slate-100 dark:border-slate-850 p-3 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-850/30 cursor-pointer transition-all duration-200"
                      >
                        <div className="shrink-0 mt-0.5">
                          <MapPin className="h-4.5 w-4.5" style={{ color: pinColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-display font-bold text-slate-850 dark:text-white text-xs.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {issue.title}
                          </h4>
                          <p className="font-sans text-[10px] text-slate-400 truncate mt-0.5">
                            {issue.location.address}
                          </p>
                          <div className="flex items-center space-x-2 mt-1.5">
                            <span className="rounded px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider uppercase" style={{ backgroundColor: `${pinColor}15`, color: pinColor }}>
                              {issue.status}
                            </span>
                            <span className="font-mono text-[9px] text-slate-400">
                              👍 {issue.upvotes} • Ward {issue.location.ward.split(' ')[1] || '3'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Selected Incident card info */}
          {selectedIssue && (
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-md space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
                  <span className="rounded-md bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 font-mono text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                    {selectedIssue.category}
                  </span>
                  <button 
                    onClick={() => setSelectedIssue(null)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative h-32 rounded-xl overflow-hidden bg-slate-50">
                  <img src={selectedIssue.imageUrl} alt={selectedIssue.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-bold text-slate-950 dark:text-white text-sm.5">
                    {selectedIssue.title}
                  </h3>
                  <p className="font-sans text-[11px] text-slate-400 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 shrink-0 text-slate-400" />
                    <span className="truncate">{selectedIssue.location.address}</span>
                  </p>
                </div>

                <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {selectedIssue.description}
                </p>

                <div className="grid grid-cols-2 gap-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-900 text-center">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-950 dark:text-white">{selectedIssue.upvotes}</span>
                    <p className="font-sans text-[10px] text-slate-400">Upvotes</p>
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-950 dark:text-white">{selectedIssue.verificationScore}</span>
                    <p className="font-sans text-[10px] text-slate-400">XP Priority</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('issue-details', selectedIssue.id)}
                className="w-full flex items-center justify-between rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3.5 px-4 cursor-pointer mt-4"
              >
                <span>Track Work Order</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}

          {/* Selected Predictive Hotspot card */}
          {selectedHotspot && (
            <div className="rounded-3xl border border-purple-200 bg-purple-50/10 dark:border-purple-900 dark:bg-purple-950/10 p-5 shadow-md space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/20 pb-3">
                  <div className="flex items-center space-x-1.5 text-purple-700 dark:text-purple-400">
                    <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider">AI Predictive Forecasting</span>
                  </div>
                  <button 
                    onClick={() => setSelectedHotspot(null)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="rounded-md bg-purple-600 text-white font-mono text-[9px] font-bold uppercase px-2.5 py-0.5">
                    {selectedHotspot.type} Risk
                  </span>
                  <h3 className="font-display font-bold text-purple-900 dark:text-purple-300 text-sm.5 pt-1.5">
                    Advanced Substrate Corrosion
                  </h3>
                  <p className="font-sans text-[11px] text-purple-600/80 dark:text-purple-400/80 leading-normal">
                    Model probability of rupture: <span className="font-mono font-bold">{(selectedHotspot.probability * 100).toFixed(0)}%</span>. Risk Score: <span className="font-bold">{selectedHotspot.riskScore}</span>.
                  </p>
                </div>

                <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3.5 border border-purple-100/50 dark:border-purple-900/30">
                  <span className="font-mono text-[8px] uppercase font-bold text-slate-400 block tracking-wider">AI Insight Reasoning</span>
                  <p className="font-sans text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1.5">
                    {selectedHotspot.reason}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('report', {
                  lat: selectedHotspot.lat,
                  lng: selectedHotspot.lng,
                  address: `Near ${selectedHotspot.lat.toFixed(4)}, ${selectedHotspot.lng.toFixed(4)}`,
                  ward: 'Ward 3 - Mission'
                })}
                className="w-full flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-3.5 cursor-pointer mt-4"
              >
                Pre-emptively Log Incident
              </button>
            </div>
          )}

          {/* Selected Custom Dropped Pin Info */}
          {droppedPin && (
            <div className="rounded-3xl border border-pink-200 bg-pink-50/10 dark:border-pink-900 dark:bg-pink-950/10 p-5 shadow-md space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-pink-100 dark:border-pink-900/20 pb-3">
                  <div className="flex items-center space-x-1.5 text-pink-700 dark:text-pink-400">
                    <PlusCircle className="h-4.5 w-4.5 animate-pulse" />
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Dropped Marker</span>
                  </div>
                  <button 
                    onClick={() => setDroppedPin(null)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-left">
                  <div className="space-y-1">
                    <span className="font-mono text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Estimated Address</span>
                    <p className="font-sans text-sm font-extrabold text-slate-900 dark:text-white">{droppedPin.address}</p>
                    <span className="inline-block mt-1 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-sans text-[10px] font-bold px-2 py-0.5">
                      {droppedPin.ward}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-900">
                    <div>
                      <span className="font-mono text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Latitude</span>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{droppedPin.lat.toFixed(5)}</p>
                    </div>
                    <div>
                      <span className="font-mono text-[8px] uppercase font-bold text-slate-400 block tracking-wider">Longitude</span>
                      <p className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{droppedPin.lng.toFixed(5)}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 flex items-start space-x-2 text-amber-800 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="font-sans text-[10px] leading-relaxed font-bold">
                      Report road potholes, broken lampposts, graffiti or pipeline leaks at this exact coordinate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => onNavigate('report', {
                    lat: droppedPin.lat,
                    lng: droppedPin.lng,
                    address: droppedPin.address,
                    ward: droppedPin.ward
                  })}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs py-3.5 cursor-pointer shadow-md shadow-pink-500/10 transition-all active:scale-98"
                >
                  <span>Report New Issue Here (+15 XP)</span>
                </button>
                <button
                  onClick={() => setDroppedPin(null)}
                  className="w-full text-center text-[10px] font-extrabold text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors py-1 block cursor-pointer"
                >
                  Dismiss Pin
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
