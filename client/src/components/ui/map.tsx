import * as React from "react"
import { Map as MapGL, Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl, ScaleControl, MapRef } from "react-map-gl/maplibre"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { cn } from "@/lib/utils"
import { MapPin, Search } from "lucide-react"

// Types
export interface MapProps extends React.ComponentProps<typeof MapGL> {
  className?: string
}

const Map = React.forwardRef<MapRef, MapProps>(({ className, style, ...props }, ref) => {
  return (
    <div className={cn("relative w-full h-full overflow-hidden rounded-xl bg-muted border border-border/50", className)}>
      <MapGL
        ref={ref}
        mapLib={maplibregl}
        style={{ width: "100%", height: "100%", ...style }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" // High quality open style
        {...props}
      >
        {props.children}
      </MapGL>
    </div>
  )
})
Map.displayName = "Map"

// Marker Component
interface MapMarkerProps {
  key?: string | number
  latitude: number
  longitude: number
  anchor?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  draggable?: boolean
  onDragEnd?: (e: any) => void
  onClick?: (e: any) => void
  children?: React.ReactNode
  offset?: [number, number]
}

const MapMarker = ({ children, ...props }: MapMarkerProps) => (
  <Marker {...props as any}>
    {children || (
      <div className="relative flex items-center justify-center">
        <div className="absolute h-8 w-8 rounded-full border border-primary/40 animate-ping opacity-20" />
        <div className="absolute h-4 w-4 rounded-full border-2 border-primary" />
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        {/* Target crosshair lines */}
        <div className="absolute h-[1px] w-6 bg-primary/20" />
        <div className="absolute h-6 w-[1px] bg-primary/20" />
      </div>
    )}
  </Marker>
)

// Controls
const MapControls = () => (
  <>
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      <NavigationControl showCompass={false} />
      <FullscreenControl />
    </div>
    <div className="absolute bottom-4 right-4">
      <GeolocateControl positionOptions={{ enableHighAccuracy: true }} trackUserLocation={true} />
    </div>
  </>
)

export { Map, MapMarker as Marker, Popup, MapControls, NavigationControl, FullscreenControl, GeolocateControl, ScaleControl }
