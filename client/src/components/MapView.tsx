import React, { useState } from 'react';
import { Map } from './ui/map';
import { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import { CampusEvent } from '../types';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, ExternalLink, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  events: CampusEvent[];
  onEventClick?: (event: CampusEvent) => void;
}

export function MapView({ events, onEventClick }: MapViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 37.4275,
    longitude: -122.1697,
    zoom: 14.5
  });

  return (
    <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-background ring-1 ring-border group">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        <NavigationControl position="bottom-right" />
        
        {events.map((event) => (
          <Marker
            key={event.id}
            latitude={event.coordinates.lat}
            longitude={event.coordinates.lng}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedEvent(event);
            }}
          >
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="cursor-pointer group/marker"
            >
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-2xl shadow-xl transition-all border-2 border-white ${
                event.category.includes('Tech' as any) ? 'bg-primary' : 'bg-secondary'
              }`}>
                <MapPin className="h-5 w-5 text-white" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-r-2 border-b-2 border-white bg-inherit" />
              </div>
            </motion.div>
          </Marker>
        ))}

        {selectedEvent && (
          <Popup
            latitude={selectedEvent.coordinates.lat}
            longitude={selectedEvent.coordinates.lng}
            anchor="top"
            onClose={() => setSelectedEvent(null)}
            closeButton={false}
            className="z-50"
            offset={10}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-64 overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-border p-0"
              onClick={() => onEventClick?.(selectedEvent)}
            >
              <div className="relative h-32 w-full overflow-hidden">
                <img 
                  src={`${selectedEvent.imageUrl}?q=80&w=400`} 
                  className="h-full w-full object-cover" 
                  alt={selectedEvent.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 left-2">
                  <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[10px] font-bold">
                    {selectedEvent.category[0]}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <h4 className="font-heading font-black text-sm leading-tight line-clamp-1">
                  {selectedEvent.title}
                </h4>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <MapPin className="h-3 w-3 text-secondary" />
                    {selectedEvent.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Clock className="h-3 w-3 text-primary" />
                    {new Date(selectedEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full h-8 rounded-lg text-[10px] font-black uppercase tracking-widest mt-1"
                >
                  View Event
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          </Popup>
        )}
      </Map>

      {/* Map Control Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <Badge className="bg-background/80 backdrop-blur-md text-foreground border-border shadow-lg font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl pointer-events-auto">
          Experimental Campus Map
        </Badge>
      </div>
    </div>
  );
}

