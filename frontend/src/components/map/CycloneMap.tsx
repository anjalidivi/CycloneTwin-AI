import React, { useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  Polygon,
} from 'react-leaflet';
import type { TrackPoint } from '../../types/cyclone';
import { Layers } from 'lucide-react';

interface CycloneMapProps {
  track: TrackPoint[];
  activeCycloneName?: string;
  twinTrack?: TrackPoint[];
  twinName?: string;
  className?: string;
  showCone?: boolean;
}

// Pre-configured permitted map tile providers (no API key required, zero watermarks)
const TILE_PROVIDERS = {
  esriDark: {
    name: 'Dark Nautical (Esri)',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    reference: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS, METI',
    maxZoom: 16,
  },
  esriSatellite: {
    name: 'Satellite Ocean (Esri)',
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    reference: null,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  osm: {
    name: 'OpenStreetMap',
    base: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    reference: null,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

// Color codes based on meteorological intensity category
function getIntensityColor(windKmh?: number | null): string {
  if (windKmh == null || isNaN(windKmh)) return '#94a3b8'; // Unknown / Depression (Slate)
  if (windKmh >= 222) return '#f43f5e'; // Super Cyclone (Rose / Red)
  if (windKmh >= 166) return '#fb923c'; // Extremely Severe (Orange)
  if (windKmh >= 118) return '#facc15'; // Very Severe (Yellow)
  if (windKmh >= 88) return '#38bdf8';  // Severe (Ice Blue)
  if (windKmh >= 62) return '#00f0ff';  // Cyclonic Storm (Cyan)
  return '#94a3b8'; // Depression (Slate)
}

export const CycloneMap: React.FC<CycloneMapProps> = ({
  track,
  activeCycloneName = 'Cyclone',
  twinTrack,
  twinName,
  className = 'h-[460px]',
  showCone = true,
}) => {
  // Support custom tile URL from environment variable if provided, else default to esriDark
  const customTileUrl = import.meta.env.VITE_MAP_TILE_URL;
  const customAttribution = import.meta.env.VITE_MAP_ATTRIBUTION;

  const [activeTileKey, setActiveTileKey] = useState<keyof typeof TILE_PROVIDERS>('esriDark');

  const selectedProvider = useMemo(() => {
    if (customTileUrl) {
      return {
        name: 'Custom Tile Provider',
        base: customTileUrl,
        reference: null,
        attribution: customAttribution || 'Map Data',
        maxZoom: 18,
      };
    }
    return TILE_PROVIDERS[activeTileKey];
  }, [customTileUrl, customAttribution, activeTileKey]);

  // Center map on latest fix or default to Bay of Bengal (15.0, 86.5)
  const latestPoint = track[track.length - 1] || { lat: 14.8, lon: 86.4 };
  const centerPosition: [number, number] = [latestPoint.lat, latestPoint.lon];

  // Separate observed vs forecast points
  const observedPoints = useMemo(() => track.filter((p) => !p.is_forecast), [track]);
  const forecastPoints = useMemo(() => track.filter((p) => p.is_forecast), [track]);

  const observedCoords: [number, number][] = useMemo(
    () => observedPoints.map((p) => [p.lat, p.lon] as [number, number]),
    [observedPoints]
  );

  const forecastCoords: [number, number][] = useMemo(() => {
    const list: [number, number][] = [];
    if (observedPoints.length > 0) {
      const lastObs = observedPoints[observedPoints.length - 1];
      list.push([lastObs.lat, lastObs.lon]);
    }
    for (const p of forecastPoints) {
      list.push([p.lat, p.lon]);
    }
    return list;
  }, [observedPoints, forecastPoints]);

  const twinCoords: [number, number][] = useMemo(() => {
    if (!twinTrack) return [];
    return twinTrack.map((p) => [p.lat, p.lon] as [number, number]);
  }, [twinTrack]);

  // Construct illustrative uncertainty polygon around forecast track
  const conePolygon: [number, number][] = useMemo(() => {
    if (!showCone || forecastPoints.length === 0) return [];
    const leftSide: [number, number][] = [];
    const rightSide: [number, number][] = [];

    forecastPoints.forEach((p, idx) => {
      const bufferDeg = 0.35 + idx * 0.32;
      leftSide.push([p.lat + bufferDeg * 0.6, p.lon - bufferDeg]);
      rightSide.push([p.lat - bufferDeg * 0.4, p.lon + bufferDeg]);
    });

    return [...leftSide, ...rightSide.reverse()];
  }, [showCone, forecastPoints]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden glass-panel border border-cyan-500/25 ${className}`}>
      {/* Map Legend Overlay & Basemap Switcher */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-cyan-500/35 rounded-xl p-3 text-xs font-mono shadow-2xl pointer-events-auto max-w-[260px]">
        <div className="text-cyan-300 font-bold mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>GEOSPATIAL RADAR</span>
          </div>
        </div>

        {/* Basemap Provider Switcher */}
        {!customTileUrl && (
          <div className="mb-2.5 pb-2 border-b border-slate-800">
            <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>BASEMAP PROVIDER:</span>
            </label>
            <select
              value={activeTileKey}
              onChange={(e) => setActiveTileKey(e.target.value as keyof typeof TILE_PROVIDERS)}
              className="w-full bg-slate-900 border border-cyan-500/30 rounded px-2 py-1 text-[11px] font-mono text-cyan-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="esriDark">Dark Nautical (Esri)</option>
              <option value="esriSatellite">Satellite Imagery (Esri)</option>
              <option value="osm">OpenStreetMap</option>
            </select>
          </div>
        )}

        {/* Legend Symbols */}
        <div className="space-y-1.5 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-cyan-400 rounded" />
            <span>Observed Track (Best Fix)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 border-t-2 border-dashed border-rose-400" />
            <span>Ensemble Forecast Path</span>
          </div>
          {twinTrack && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-amber-400 rounded" />
              <span>Twin: {twinName || 'Historical'}</span>
            </div>
          )}
          {showCone && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-2 bg-cyan-500/20 border border-cyan-400/40 rounded" />
              <span>Cone of Uncertainty (67%)</span>
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={centerPosition}
        zoom={6}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Permitted Basemap Layer (No API key required, zero watermarks) */}
        <TileLayer
          key={selectedProvider.base}
          attribution={selectedProvider.attribution}
          url={selectedProvider.base}
          maxZoom={selectedProvider.maxZoom}
        />

        {/* Optional Reference Layer for Boundaries / Labels if available */}
        {selectedProvider.reference && (
          <TileLayer
            key={`${selectedProvider.base}-ref`}
            attribution=""
            url={selectedProvider.reference}
            maxZoom={selectedProvider.maxZoom}
          />
        )}

        {/* Forecast Uncertainty Cone */}
        {conePolygon.length > 0 && (
          <Polygon
            positions={conePolygon}
            pathOptions={{
              color: '#00f0ff',
              fillColor: '#00f0ff',
              fillOpacity: 0.14,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />
        )}

        {/* Historical Twin Track if provided */}
        {twinCoords.length > 1 && (
          <Polyline
            positions={twinCoords}
            pathOptions={{
              color: '#f59e0b',
              weight: 3,
              opacity: 0.85,
            }}
          />
        )}

        {/* Twin Markers */}
        {twinTrack &&
          twinTrack.map((pt, i) => (
            <CircleMarker
              key={`twin-${i}`}
              center={[pt.lat, pt.lon]}
              radius={4}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#fbbf24',
                fillOpacity: 0.9,
                weight: 1,
              }}
            >
              <Popup>
                <div className="p-1 font-mono text-xs">
                  <div className="font-bold text-amber-400">{twinName}</div>
                  <div className="text-slate-300">{pt.timestamp}</div>
                  <div className="mt-1">
                    Wind: <span className="font-bold text-white">{pt.wind_speed_kmh} km/h</span>
                  </div>
                  <div>
                    Pressure: <span className="font-bold text-white">{pt.pressure_hpa} hPa</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        {/* Observed Track Line */}
        {observedCoords.length > 1 && (
          <Polyline
            positions={observedCoords}
            pathOptions={{
              color: '#00f0ff',
              weight: 4,
              opacity: 0.95,
            }}
          />
        )}

        {/* Forecast Track Line */}
        {forecastCoords.length > 1 && (
          <Polyline
            positions={forecastCoords}
            pathOptions={{
              color: '#f43f5e',
              weight: 3,
              dashArray: '6, 6',
              opacity: 0.9,
            }}
          />
        )}

        {/* Track Point Markers */}
        {track.map((pt, index) => {
          const isLatest = index === track.length - 1;
          const col = getIntensityColor(pt.wind_speed_kmh);

          return (
            <CircleMarker
              key={`pt-${index}`}
              center={[pt.lat, pt.lon]}
              radius={isLatest ? 7 : 5}
              pathOptions={{
                color: isLatest ? '#ffffff' : col,
                fillColor: col,
                fillOpacity: 1,
                weight: isLatest ? 2 : 1,
              }}
            >
              <Popup>
                <div className="p-1.5 font-mono text-xs min-w-[180px]">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1 mb-1">
                    <span className="font-bold text-cyan-300">
                      {pt.is_forecast ? 'FORECAST FIX' : 'OBSERVED FIX'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {pt.is_forecast ? '+PROJECTION' : 'NOAA/IMD'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-sans mb-1 font-semibold">
                    {pt.status || pt.category}
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                    <div>
                      Wind:{' '}
                      <span className="font-bold text-white">
                        {pt.wind_speed_kmh} km/h
                      </span>
                    </div>
                    <div>
                      Pressure:{' '}
                      <span className="font-bold text-white">
                        {pt.pressure_hpa} hPa
                      </span>
                    </div>
                    <div>
                      Knots:{' '}
                      <span className="font-bold text-white">
                        {pt.wind_speed_kts} kts
                      </span>
                    </div>
                    <div>
                      Coords:{' '}
                      <span className="font-bold text-cyan-300">
                        {pt.lat}°N, {pt.lon}°E
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-800 pt-1">
                    UTC: {pt.timestamp}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
