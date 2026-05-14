import React, { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Marker, MapControls } from '@/components/ui/map';
import { StepProps } from './types';

export function StepVenue({ form, setForm }: StepProps) {
  const [searchQuery, setSearchQuery] = useState(form.location || '');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [center, setCenter] = useState({ lat: form.coordinates.lat, lng: form.coordinates.lng });
  const [zoom, setZoom] = useState(13);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      setSearching(true);
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`);
        const data = await res.json();
        setResults(data.features || []);
        setShowResults(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const selectResult = (f: any) => {
    const [lng, lat] = f.geometry.coordinates;
    const name = f.properties.name || '';
    const city = f.properties.city || '';
    const label = [name, city].filter(Boolean).join(', ') || 'Location';
    setCenter({ lat, lng });
    setZoom(16);
    setForm(p => ({ ...p, coordinates: { lat, lng }, location: label }));
    setShowResults(false);
    setSearchQuery(label);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setForm(p => ({ ...p, coordinates: { lat, lng } }));
    try {
      const res = await fetch(`https://photon.komoot.io/reverse/?lon=${lng}&lat=${lat}`);
      const data = await res.json();
      if (data.features?.length > 0) {
        const f = data.features[0];
        const label = [f.properties.name, f.properties.street, f.properties.city].filter(Boolean).slice(0, 2).join(', ') || 'Selected Location';
        setForm(p => ({ ...p, location: label }));
        setSearchQuery(label);
      }
    } catch { }
  };

  const isVirtual = form.format === 'virtual' || form.type === 'webinar';

  return (
    <div className="space-y-6">
      {/* Date & Time OR Deadline */}
      <div className="grid grid-cols-2 gap-6">
        {form.type === 'recruitment' ? (
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Application Deadline *</Label>
            <Input
              type="date"
              className="rounded-none border-[2.5px] border-foreground h-12"
              value={form.deadline}
              onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
            />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Start Date & Time *</Label>
              <Input
                type="datetime-local"
                className="rounded-none border-[2.5px] border-foreground h-12"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">End Date (optional)</Label>
              <Input
                type="datetime-local"
                className="rounded-none border-[2.5px] border-foreground/50 h-12"
                value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
              />
            </div>
          </>
        )}
      </div>

      {form.type === 'recruitment' && (
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Available Roles * (comma separated)</Label>
          <Input
            placeholder="e.g., Software Engineer, Designer"
            className="rounded-none border-[2.5px] border-foreground h-12 font-bold"
            value={form.roles}
            onChange={e => setForm(p => ({ ...p, roles: e.target.value }))}
          />
        </div>
      )}

      {form.type === 'webinar' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Webinar Link *</Label>
            <Input
              placeholder="https://meet.google.com/..."
              className="rounded-none border-[2.5px] border-foreground h-12"
              value={form.link}
              onChange={e => setForm(p => ({ ...p, link: e.target.value, location: 'Virtual' }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Platform</Label>
            <Input
              placeholder="e.g., Zoom, Google Meet"
              className="rounded-none border-[2.5px] border-foreground h-12"
              value={form.platform}
              onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}
            />
          </div>
        </div>
      ) : isVirtual && form.type === 'event' ? (
        <div className="space-y-2">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Meeting Link</Label>
          <Input
            placeholder="https://meet.google.com/..."
            className="rounded-none border-[2.5px] border-foreground h-12"
            value={form.meetingLink}
            onChange={e => setForm(p => ({ ...p, meetingLink: e.target.value, location: 'Virtual' }))}
          />
        </div>
      ) : form.type === 'event' || form.type === 'announcement' ? (
        <>
          {/* Location Search */}
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Location & Map Pin *</Label>
            <div className="relative z-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-primary" />}
                <Input
                  placeholder="Search campus or city..."
                  className="rounded-none border-[2.5px] border-foreground pl-9 h-12"
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  onFocus={() => results.length > 0 && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 400)}
                />
              </div>
              <AnimatePresence>
                {showResults && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-card border-[2.5px] border-foreground shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden z-[100]"
                  >
                    {results.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground font-bold uppercase">No results found</div>
                    ) : results.map((f, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectResult(f)}
                        className="w-full text-left px-4 py-3 hover:bg-primary/5 flex items-start gap-3 transition-colors border-b-[2px] border-foreground/10 last:border-0"
                      >
                        <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-black">{f.properties.name || 'Unknown'}</p>
                          <p className="text-[9px] text-muted-foreground font-mono uppercase">
                            {[f.properties.city, f.properties.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Input
              placeholder="Venue Name (e.g. Science Building Room 101)"
              className="rounded-none mt-1 h-10 border-[2px] border-dashed border-foreground/30"
              value={form.location}
              onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
            />
          </div>

          {/* Map */}
          <div className="h-[350px] w-full overflow-hidden border-[3px] border-foreground bg-muted relative shadow-[6px_6px_0_0_var(--foreground)]">
            <Map
              initialViewState={{ latitude: center.lat, longitude: center.lng, zoom }}
              onClick={(e: any) => { if (e.lngLat) reverseGeocode(e.lngLat.lat, e.lngLat.lng); }}
            >
              <MapControls />
              <Marker
                latitude={form.coordinates.lat}
                longitude={form.coordinates.lng}
                anchor="bottom"
                draggable
                onDragEnd={(e: any) => { if (e.lngLat) reverseGeocode(e.lngLat.lat, e.lngLat.lng); }}
              >
                <div className="h-8 w-8 text-primary flex items-center justify-center">
                  <MapPin className="fill-primary h-7 w-7 drop-shadow-xl" />
                </div>
              </Marker>
            </Map>
          </div>

          {/* Coordinates */}
          <p className="text-[9px] font-mono text-muted-foreground text-right">
            {form.coordinates.lat.toFixed(5)}, {form.coordinates.lng.toFixed(5)}
          </p>
        </>
      ) : null}
    </div>
  );
}
