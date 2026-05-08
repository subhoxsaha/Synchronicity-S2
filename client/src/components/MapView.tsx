import React, { useState, useEffect, useRef } from 'react';
import { CampusEvent } from '../types';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, ExternalLink, ChevronRight, X, Maximize2, Crosshair, Terminal, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Map, Marker, Popup, MapControls } from './ui/map';
import { MapRef } from 'react-map-gl/maplibre';

interface MapViewProps {
  events: CampusEvent[];
  onEventClick?: (event: CampusEvent) => void;
}

export function MapView({ events, onEventClick }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 37.4275,
    longitude: -122.1697,
    zoom: 13.5,
  });

  const recenter = () => {
    if (events.length === 0) return;
    
    // Average coordinates
    const lat = events.reduce((acc, e) => acc + e.coordinates.lat, 0) / events.length;
    const lng = events.reduce((acc, e) => acc + e.coordinates.lng, 0) / events.length;

    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 13,
      duration: 1000
    });
  };

  const handleEventClick = (event: CampusEvent) => {
    setSelectedEvent(event);
    mapRef.current?.flyTo({
      center: [event.coordinates.lng, event.coordinates.lat],
      zoom: 15,
      duration: 800
    });
  };

  useEffect(() => {
    if (events.length > 0) {
      const timer = setTimeout(recenter, 500);
      return () => clearTimeout(timer);
    }
  }, [events.length]);

  return (
    <div className="flex flex-col lg:flex-row h-[700px] w-full rounded-[3rem] overflow-hidden shadow-2xl bg-[#0a0a0a] border-4 border-[#1a1a1a] ring-1 ring-white/10 group relative">
      {/* Sidebar List - Console Style */}
      <div className="w-full lg:w-96 h-64 lg:h-full border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col bg-black/60 backdrop-blur-3xl z-20 overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent relative">
          <div className="absolute top-0 right-0 p-2 opacity-20">
            <Globe className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.5em] flex items-center gap-3 text-primary">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(255,59,48,0.6)]" />
            Nexus Spatial Core
          </h3>
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Active Matrix Scan</span>
                <span className="text-[10px] font-mono text-primary animate-pulse">SYNCHRONIZED</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="h-full w-1/4 bg-primary shadow-[0_0_10px_rgba(255,59,48,0.5)]"
                />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {events.map((event) => (
            <motion.div
              layout
              key={event.id}
              whileHover={{ x: 6, backgroundColor: 'rgba(255,255,255,0.03)' }}
              onClick={() => handleEventClick(event)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden group/item ${
                selectedEvent?.id === event.id 
                  ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/10' 
                  : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              {selectedEvent?.id === event.id && (
                <motion.div 
                  layoutId="active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_15px_rgba(255,59,48,0.8)]" 
                />
              )}
              <div className="flex gap-5">
                <div className="h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-black/60 border border-white/10 relative">
                  <img src={event.assets?.bannerUrl || event.imageUrl} className="h-full w-full object-cover opacity-40 grayscale group-hover/item:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-primary/20 mix-blend-overlay group-hover/item:opacity-0 transition-opacity" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black text-primary/80 uppercase tracking-[0.2em] font-mono">{event.id.slice(0, 10)}</span>
                    <Badge variant="outline" className="text-[7px] border-white/10 text-white/40 h-4 px-1.5">{event.category?.[0]}</Badge>
                  </div>
                  <h4 className="text-[13px] font-black truncate leading-tight text-white uppercase tracking-tight group-hover/item:text-primary transition-colors">{event.title}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-white/30 uppercase mt-2.5">
                    <MapPin className="h-3 w-3 text-primary/60" />
                    <span className="truncate tracking-wider">{event.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-6 bg-black/60 border-t border-white/10 font-mono">
            <div className="flex items-center justify-between text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">
                <span className="flex items-center gap-2">
                    <Terminal className="h-3 w-3" />
                    Neural Log
                </span>
                <span className="opacity-50">PROT-v2.8</span>
            </div>
            <div className="space-y-1.5 h-20 overflow-hidden">
                <div className="text-[9px] text-green-500/70 leading-none truncate opacity-90">&gt; LATENCY CHECK: 42ms ... OK</div>
                <div className="text-[9px] text-primary/60 leading-none truncate">&gt; SPATIAL OVERLAY: ACTIVE [88%]</div>
                <div className="text-[9px] text-white/20 leading-none truncate">&gt; BROADCASTING TO NODE_0X44...</div>
                <div className="text-[9px] text-blue-400/50 leading-none truncate italic">&gt; LISTENING FOR EVENT SIGNATURES</div>
            </div>
        </div>
      </div>

      {/* Map Side */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState as any)}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          style={{ width: '100%', height: '100%' }}
        >
          <MapControls />
          
          {events.map((event) => (
            <Marker
              key={event.id}
              latitude={event.coordinates.lat}
              longitude={event.coordinates.lng}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                handleEventClick(event);
              }}
            >
              <motion.div
                whileHover={{ scale: 1.1, y: -2 }}
                className="cursor-pointer"
              >
                <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl shadow-2xl transition-all border-2 ${
                  selectedEvent?.id === event.id 
                    ? 'bg-primary border-primary scale-125 shadow-primary/40' 
                    : 'bg-black/80 border-white/20'
                }`}>
                  <MapPin className={`h-5 w-5 ${selectedEvent?.id === event.id ? 'text-white' : 'text-primary'}`} strokeWidth={3} />
                  {selectedEvent?.id === event.id && (
                    <motion.div 
                        layoutId="active-ring"
                        className="absolute -inset-2 border border-primary rounded-2xl opacity-50"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
              </motion.div>
            </Marker>
          ))}

          {selectedEvent && (
            <Popup
              latitude={selectedEvent.coordinates.lat}
              longitude={selectedEvent.coordinates.lng}
              anchor="bottom"
              offset={40}
              onClose={() => setSelectedEvent(null)}
              closeButton={false}
              className="z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-64 overflow-hidden rounded-[2rem] bg-[#0f0f0f] shadow-2xl p-0 border border-white/10"
                onClick={() => onEventClick?.(selectedEvent)}
              >
                <div className="relative h-32 w-full overflow-hidden">
                  <img 
                    src={`${selectedEvent.assets?.bannerUrl || selectedEvent.imageUrl}?q=80&w=400`} 
                    className="h-full w-full object-cover" 
                    alt={selectedEvent.title}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                  <Badge className="absolute top-4 left-4 bg-primary text-white border-none text-[8px] font-black uppercase px-3 py-1 rounded-lg">
                    {selectedEvent.category[0]}
                  </Badge>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-white text-base leading-tight uppercase tracking-tight">
                      {selectedEvent.title}
                    </h4>
                    {selectedEvent.organizerEmail && (
                      <p className="text-[9px] font-mono text-white/30 truncate uppercase tracking-widest">
                        AUTH: {selectedEvent.organizerEmail}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-white/40 uppercase pt-3 border-t border-white/5">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-primary" /> {selectedEvent.location}</span>
                    <span className="font-mono">{new Date(selectedEvent.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <Button className="w-full h-10 rounded-2xl text-[10px] font-black uppercase bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Access Intelligence
                  </Button>
                </div>
              </motion.div>
            </Popup>
          )}
        </Map>

        {/* Technical HUD Overlays */}
        <div className="absolute top-6 right-16 flex flex-col gap-2 pointer-events-none z-20">
          <button 
            onClick={recenter}
            className="pointer-events-auto h-10 w-10 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-primary transition-all active:scale-95 shadow-2xl"
            title="Recenter"
          >
            <Crosshair className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex flex-col gap-1 pr-8">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">System Status</span>
                <span className="text-[10px] font-bold text-white/60 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                    Spatial Feed Engaged
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}

