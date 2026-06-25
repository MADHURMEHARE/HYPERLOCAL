/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
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
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue, PredictiveHotspot } from '../types';

interface InteractiveMapProps {
  issues: Issue[];
  predictions: PredictiveHotspot[];
  onNavigate: (view: string, issueIdOrData?: any) => void;
}

// Controller component to programmatically pan and zoom the map smoothly
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

// Custom Leaflet Markers utilizing inline dynamic SVGs with Tailwind classes
const createIssueIcon = (status: string) => {
  let color = '#EF4444'; // Red = Reported (default)
  if (status === 'Resolved') {
    color = '#10B981'; // Green = Resolved
  } else if (status === 'In Progress' || status === 'Assigned') {
    color = '#2563EB'; // Blue = In Progress
  } else if (status === 'Verified') {
    color = '#8B5CF6'; // Purple = Verified
  }

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center cursor-pointer" style="width: 32px; height: 32px;">
        <svg class="h-8 w-8 drop-shadow-md" style="color: ${color}; fill: ${color}20;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="${color}"></circle>
        </svg>
        <span class="absolute top-2 h-1.5 w-1.5 rounded-full animate-ping pointer-events-none" style="background-color: ${color};"></span>
      </div>
    `,
    className: 'custom-leaflet-issue-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const createHotspotIcon = () => {
  return L.divIcon({
    html: `
      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg border border-white dark:border-slate-950 shadow-purple-500/40 hover:scale-110 transition-transform cursor-pointer">
        <svg class="h-3.5 w-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
    `,
    className: 'custom-leaflet-hotspot-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const createDroppedPinIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative cursor-pointer" style="width: 40px; height: 40px;">
        <svg class="h-10 w-10 text-pink-600 fill-pink-600/20 drop-shadow-xl animate-bounce" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="currentColor"></circle>
        </svg>
        <span class="absolute top-3 left-3.5 h-3 w-3 rounded-full bg-pink-500 animate-ping pointer-events-none"></span>
      </div>
    `,
    className: 'custom-leaflet-dropped-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

export default function InteractiveMap({ issues, predictions, onNavigate }: InteractiveMapProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Map Center and Zoom States
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]);
  const [mapZoom, setMapZoom] = useState<number>(12);

  // Map layer toggles
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Selection States
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<PredictiveHotspot | null>(null);
  const [droppedPin, setDroppedPin] = useState<{ lat: number; lng: number; address: string; ward: string } | null>(null);

  // Center on user's current GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setMapZoom(13);
        },
        (error) => {
          console.warn('Geolocation denied or failed. Defaulting to San Francisco standard view.', error);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

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
      case 'Resolved': return '#10B981'; // emerald-500 (Green)
      case 'In Progress': return '#2563EB'; // blue-600 (Blue)
      case 'Assigned': return '#2563EB'; // blue-500
      case 'Verified': return '#8B5CF6'; // purple-500
      default: return '#EF4444'; // rose-500 (Red)
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
    setMapCenter([lat, lng]);
    setMapZoom(15);
  };

  // Map Click handler to drop a pin on coordinates
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedIssue(null);
    setSelectedHotspot(null);
    setDroppedPin({
      lat,
      lng,
      address: 'Resolving address...',
      ward: 'Resolving ward...'
    });

    // Dynamic reverse geocoding from server-side Gemini API with seamless local fallback
    fetch('/api/ai/reverse-geocode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          setDroppedPin({
            lat,
            lng,
            address: data.address,
            ward: data.ward || 'Ward 3 - Mission'
          });
        } else {
          throw new Error('Geocoding response structure incomplete');
        }
      })
      .catch(err => {
        console.error('Dynamic geocoding error, falling back:', err);
        const streets = ['Valencia St', 'Mission St', 'Oak Crescent', 'Dolores St', 'Harrison St', 'Folsom St', 'Market St', 'Castro St'];
        const randomStreet = streets[Math.floor(Math.abs(lat * 100) % streets.length)];
        const generatedAddr = `${Math.floor(Math.abs(lng * 1000) % 900) + 100} ${randomStreet}, San Francisco, CA`;
        const wards = ['Ward 3 - Mission', 'Ward 5 - Heights', 'Ward 2 - Castro', 'Ward 4 - Noe'];
        const generatedWard = wards[Math.floor(Math.abs(lng * 1000) % wards.length)];
        setDroppedPin({
          lat,
          lng,
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
            <MapIcon className="h-3.5 w-3.5 animate-pulse" />
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
        
        {/* Left Hand: GIS Leaflet Map Container */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm relative min-h-[500px] flex-1 flex flex-col z-0">
            
            <div className="absolute inset-0 overflow-hidden" style={{ minHeight: '500px' }}>
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                zoomControl={false}
                style={{ width: '100%', height: '100%', minHeight: '500px' }}
              >
                {/* Custom tiles from OpenStreetMap */}
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Navigation and state sync map controls */}
                <MapController center={mapCenter} zoom={mapZoom} />
                <MapEvents onMapClick={handleMapClick} />

                {/* Active Reported Issues Pins */}
                {filteredIssues.map((issue) => {
                  return (
                    <Marker
                      key={issue.id}
                      position={[issue.location.lat, issue.location.lng]}
                      icon={createIssueIcon(issue.status)}
                      eventHandlers={{
                        click: () => handleMapPinClick(issue)
                      }}
                    >
                      <Popup className="custom-leaflet-popup">
                        <div className="text-left p-1 space-y-1">
                          <h4 className="font-sans font-bold text-slate-950 text-xs leading-tight">{issue.title}</h4>
                          <p className="font-mono text-[9px] text-slate-500 leading-normal">{issue.location.address}</p>
                          <div className="flex items-center space-x-1.5 pt-1">
                            <span 
                              className="rounded px-1.5 py-0.2 font-mono text-[8px] font-bold uppercase" 
                              style={{ 
                                backgroundColor: `${getStatusColorHex(issue.status)}15`, 
                                color: getStatusColorHex(issue.status) 
                              }}
                            >
                              {issue.status}
                            </span>
                            <span className="font-mono text-[8px] text-slate-400">
                              Severity: {issue.severity}
                            </span>
                          </div>
                          <p className="font-mono text-[8px] text-slate-400 pt-0.5">
                            Reported: {new Date(issue.createdAt || '').toLocaleDateString()}
                          </p>
                          {issue.assignedVendorName && (
                            <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1">
                              <span className="font-sans text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">👷 Contractor:</span>
                              <span className="font-sans text-[8px] font-medium text-slate-700 dark:text-slate-300">{issue.assignedVendorName}</span>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* AI Predictive Hotspots Pins if active */}
                {showHeatmap && predictions.map((p) => {
                  return (
                    <Marker
                      key={p.id}
                      position={[p.lat, p.lng]}
                      icon={createHotspotIcon()}
                      eventHandlers={{
                        click: () => handleHotspotClick(p)
                      }}
                    />
                  );
                })}

                {/* Custom Dropped Pin */}
                {droppedPin && (
                  <Marker
                    position={[droppedPin.lat, droppedPin.lng]}
                    icon={createDroppedPinIcon()}
                  />
                )}
              </MapContainer>

              {/* FLOATING ZOOM AND NAVIGATION CONTROLS */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2 z-[400]">
                <button 
                  onClick={() => setMapZoom(z => Math.min(19, z + 1))}
                  className="h-9 w-9 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-350 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setMapZoom(z => Math.max(1, z - 1))}
                  className="h-9 w-9 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-350 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    setMapCenter([37.7749, -122.4194]);
                    setMapZoom(12);
                  }}
                  className="h-9 w-9 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-350 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
                  title="Reset View"
                >
                  <RotateCw className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Floating prediction hotspot toggle button */}
              <div className="absolute bottom-4 left-4 flex flex-col space-y-2 z-[400]">
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
              <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-md flex items-center space-x-4 backdrop-blur-md max-w-[280px] z-[400]">
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
                  Select a card below to center map or click on map to drop custom coordinates
                </p>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[420px] no-scrollbar space-y-2.5 text-left pr-1">
                {filteredIssues.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <MapIcon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-750" />
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

                {selectedIssue.assignedVendorName && (
                  <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 flex items-center justify-between text-left">
                    <div>
                      <span className="block text-[9px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">👷 Contractor Allotted</span>
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">{selectedIssue.assignedVendorName}</span>
                    </div>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase border border-amber-500/10">
                      {selectedIssue.allotmentType === 'automatic' ? 'Auto-Route' : 'Manual'}
                    </span>
                  </div>
                )}
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

                <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3.5 border border-purple-100/50 dark:border-purple-900/30 text-left">
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
