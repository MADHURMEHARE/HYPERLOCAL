import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bot, MapPin, AlertCircle, Calendar } from 'lucide-react';
import { AIIncident } from '../../types';

interface HeatMapViewProps {
  incidents: AIIncident[];
}

// Controller to handle center/bounds fit
function MapController({ incidents }: { incidents: AIIncident[] }) {
  const map = useMap();

  useEffect(() => {
    if (incidents.length === 0) return;

    const bounds = L.latLngBounds(incidents.map(i => [i.latitude, i.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [incidents, map]);

  return null;
}

const createAIIncidentIcon = (severity: string) => {
  let color = '#2563EB'; // Blue
  if (severity === 'Critical') {
    color = '#EF4444'; // Red
  } else if (severity === 'High') {
    color = '#F59E0B'; // Amber
  }

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center cursor-pointer" style="width: 32px; height: 32px;">
        <svg class="h-8 w-8 drop-shadow-lg" style="color: ${color}; fill: ${color}15;" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="${color}"></circle>
        </svg>
        <span class="absolute top-2 h-1.5 w-1.5 rounded-full animate-ping pointer-events-none" style="background-color: ${color};"></span>
      </div>
    `,
    className: 'custom-leaflet-ai-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function HeatMapView({ incidents }: HeatMapViewProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.5204, 73.8567]); // Default Pune

  useEffect(() => {
    if (incidents.length > 0) {
      setMapCenter([incidents[0].latitude, incidents[0].longitude]);
    }
  }, [incidents]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#EF4444'; // Red
      case 'High': return '#F59E0B'; // Amber
      case 'Medium': return '#3B82F6'; // Blue
      default: return '#10B981'; // Green
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c101d] overflow-hidden shadow-sm relative min-h-[500px] h-[550px] flex-1 flex flex-col z-0">
      <MapContainer
        center={mapCenter}
        zoom={12}
        zoomControl={false}
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController incidents={incidents} />

        {/* Heatmap overlay circles */}
        {incidents.map((inc) => {
          const color = getSeverityColor(inc.severity);
          const radius = inc.severity === 'Critical' ? 450 : inc.severity === 'High' ? 300 : inc.severity === 'Medium' ? 180 : 100;
          
          return (
            <React.Fragment key={`heat-${inc.id}`}>
              {/* Outer soft glowing heat halo */}
              <Circle
                center={[inc.latitude, inc.longitude]}
                radius={radius * 1.5}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.12,
                  color: 'transparent',
                }}
              />
              {/* Core intense heat halo */}
              <Circle
                center={[inc.latitude, inc.longitude]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.28,
                  color: color,
                  weight: 0.8,
                  opacity: 0.4
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Incident Interactive Markers */}
        {incidents.map((inc) => (
          <Marker
            key={`marker-${inc.id}`}
            position={[inc.latitude, inc.longitude]}
            icon={createAIIncidentIcon(inc.severity)}
          >
            <Popup className="custom-leaflet-popup">
              <div className="text-left p-1 space-y-2 max-w-xs font-sans">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[8px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-955/40 px-1.5 py-0.5 rounded border border-blue-100/30">
                    {inc.category}
                  </span>
                  <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded ${
                    inc.severity === 'Critical' ? 'bg-rose-50 text-rose-600' :
                    inc.severity === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {inc.severity}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-xs leading-snug">{inc.title}</h4>
                <p className="text-[10.5px] text-slate-600 leading-relaxed line-clamp-3">{inc.description}</p>
                
                <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                    <span className="truncate">{inc.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bot className="h-3 w-3 text-cyan-500 shrink-0" />
                    <span>AI Confidence: <b className="text-slate-800">{inc.confidence}%</b></span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
