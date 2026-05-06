import React from 'react';
import MapComponent, { MapProps as ReactMapProps } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cn } from '@/lib/utils';

interface MapProps extends ReactMapProps {
  className?: string;
}

const Map = React.forwardRef<any, MapProps>(({ className, ...props }, ref) => {
  return (
    <div className={cn("relative w-full h-full overflow-hidden rounded-xl border bg-muted", className)}>
      <MapComponent
        {...props}
        mapStyle={props.mapStyle || "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"}
        className="w-full h-full"
      />
    </div>
  );
});

Map.displayName = "Map";

export { Map };
