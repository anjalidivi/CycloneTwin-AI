import React, { useRef, useMemo, useState, useEffect, Component, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GlobeFallback } from './GlobeFallback';
import type { TrackPoint } from '../../types/cyclone';

interface GlobeViewProps {
  cycloneName?: string;
  currentLat?: number;
  currentLon?: number;
  windSpeedKmh?: number;
  category?: string;
  track?: TrackPoint[];
}

// React Error Boundary for 3D WebGL Scene
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class GlobeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('3D Globe WebGL error captured by ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Convert Lat/Lon (degrees) to 3D Sphere coordinates (radius R)
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Procedural high-detail fallback texture if image asset loading fails
function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  oceanGrad.addColorStop(0, '#030814');
  oceanGrad.addColorStop(0.5, '#07152b');
  oceanGrad.addColorStop(1, '#030814');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Stylized continental outlines
  ctx.fillStyle = '#0f2942';
  ctx.beginPath();
  ctx.ellipse(1450, 420, 360, 200, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(1480, 480);
  ctx.lineTo(1530, 620);
  ctx.lineTo(1580, 500);
  ctx.closePath();
  ctx.fillStyle = '#173f63';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(1180, 550, 160, 230, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(540, 380, 190, 190, -0.3, 0, Math.PI * 2);
  ctx.ellipse(660, 680, 140, 220, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 1;
  for (let lat = 100; lat < 1000; lat += 100) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(2048, lat);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// 3D Inner Globe Scene
const GlobeMesh: React.FC<{
  cycloneName: string;
  lat: number;
  lon: number;
  windSpeed: number;
  category: string;
  track?: TrackPoint[];
}> = ({ cycloneName, lat, lon, windSpeed, category, track = [] }) => {
  const globeGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cycloneMarkerRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);

  const earthRadius = 2.0;

  // Load realistic Earth textures with fallback
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);
  const [cloudTexture, setCloudTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    // High-resolution realistic NASA/Three.js Earth surface texture
    loader.load(
      '/earth_atmos_2048.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        setEarthTexture(tex);
      },
      undefined,
      () => {
        setEarthTexture(createProceduralEarthTexture());
      }
    );

    // Realistic atmospheric cloud layer
    loader.load(
      '/earth_clouds_1024.png',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        setCloudTexture(tex);
      },
      undefined,
      () => setCloudTexture(null)
    );
  }, []);

  // Calculate current cyclone position on sphere
  const cyclonePos = useMemo(
    () => latLonToVector3(lat, lon, earthRadius + 0.035),
    [lat, lon]
  );

  // Build curved 3D trajectory line around the globe
  const trajectoryPoints = useMemo(() => {
    if (!track || track.length === 0) {
      const defaultPts = [
        { lat: 10.2, lon: 89.8 },
        { lat: 11.5, lon: 88.5 },
        { lat: 13.0, lon: 87.5 },
        { lat: 14.8, lon: 86.4 },
        { lat: 16.5, lon: 85.8 },
        { lat: 18.2, lon: 85.9 },
        { lat: 19.5, lon: 86.2 },
      ];
      return defaultPts.map((p) => latLonToVector3(p.lat, p.lon, earthRadius + 0.025));
    }
    return track.map((p) => latLonToVector3(p.lat, p.lon, earthRadius + 0.025));
  }, [track]);

  const curveGeometry = useMemo(() => {
    if (trajectoryPoints.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(trajectoryPoints);
    return new THREE.TubeGeometry(curve, 64, 0.016, 8, false);
  }, [trajectoryPoints]);

  // Frame animations: subtle globe rotation, cloud drift, vortex spin & pulse ping
  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.025;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.038;
    }
    if (cycloneMarkerRef.current) {
      cycloneMarkerRef.current.rotation.z += delta * 2.8;
    }
    if (pulseRingRef.current) {
      const scale = 1.0 + Math.sin(elapsed * 3.5) * 0.35;
      pulseRingRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* 1. Realistic Main Earth Sphere */}
      <mesh>
        <sphereGeometry args={[earthRadius, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture || createProceduralEarthTexture()}
          roughness={0.7}
          metalness={0.12}
          color="#cbe3f7"
        />
      </mesh>

      {/* 2. Realistic Dynamic Cloud Layer */}
      {cloudTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[earthRadius + 0.015, 64, 64]} />
          <meshStandardMaterial
            map={cloudTexture}
            transparent
            opacity={0.38}
            blending={THREE.NormalBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. Atmospheric Inner Rim Glow */}
      <mesh scale={[1.025, 1.025, 1.025]}>
        <sphereGeometry args={[earthRadius, 48, 48]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 4. Atmospheric Outer Scattering Rim */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[earthRadius, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Cyclone Curved 3D Trajectory Tube */}
      {curveGeometry && (
        <mesh geometry={curveGeometry}>
          <meshBasicMaterial
            color="#00f0ff"
            transparent
            opacity={0.88}
          />
        </mesh>
      )}

      {/* 6. Cyclone Vortex Marker at Precise Coordinates */}
      <group position={cyclonePos}>
        <group ref={cycloneMarkerRef}>
          {/* Eyewall outer spiral bands */}
          <mesh>
            <ringGeometry args={[0.04, 0.08, 24]} />
            <meshBasicMaterial
              color="#00f0ff"
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[0.09, 0.14, 24]} />
            <meshBasicMaterial
              color="#f43f5e"
              side={THREE.DoubleSide}
              transparent
              opacity={0.75}
            />
          </mesh>
        </group>

        {/* Pulsating Ping Wave Ring */}
        <mesh ref={pulseRingRef}>
          <ringGeometry args={[0.13, 0.16, 24]} />
          <meshBasicMaterial
            color="#38bdf8"
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Eye Center Core */}
        <mesh position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.032, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Floating Telemetry Badge Pin */}
        <Html distanceFactor={8} position={[0.16, 0.16, 0.05]} center>
          <div className="pointer-events-none select-none bg-slate-950/90 border border-cyan-400/50 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.4)] whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-[11px] font-mono font-bold text-cyan-300">
                {cycloneName}
              </span>
            </div>
            <div className="text-[9px] font-mono text-slate-300 mt-0.5">
              {windSpeed} km/h • {category}
            </div>
            <div className="text-[8px] font-mono text-cyan-400/80">
              {lat}°N, {lon}°E
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
};

export const GlobeView: React.FC<GlobeViewProps> = ({
  cycloneName = 'Cyclone ASNA-II',
  currentLat = 14.8,
  currentLon = 86.4,
  windSpeedKmh = 165,
  category = 'Cat 3 Equivalent',
  track = [],
}) => {
  const [webGLAvailable, setWebGLAvailable] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLAvailable(false);
      }
    } catch {
      setWebGLAvailable(false);
    }
  }, []);

  const fallbackNode = (
    <GlobeFallback
      cycloneName={cycloneName}
      lat={currentLat}
      lon={currentLon}
    />
  );

  if (!webGLAvailable) {
    return fallbackNode;
  }

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl glass-panel overflow-hidden border border-cyan-500/25 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
      {/* Top telemetry badges */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <div className="bg-slate-950/85 border border-cyan-500/35 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>3D ORBITAL EARTH</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
        <div className="bg-slate-950/85 border border-slate-700/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-400">
          DRAG TO ROTATE • SCROLL TO ZOOM
        </div>
      </div>

      <GlobeErrorBoundary fallback={fallbackNode}>
        <Canvas
          camera={{ position: [0, 0.6, 4.3], fov: 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <ambientLight intensity={0.45} />
          <directionalLight position={[6, 3, 5]} intensity={1.9} color="#ffffff" />
          <pointLight position={[-6, -3, -5]} intensity={0.35} color="#00f0ff" />
          <Stars radius={120} depth={50} count={1400} factor={4} saturation={0} fade speed={1.2} />

          <GlobeMesh
            cycloneName={cycloneName}
            lat={currentLat}
            lon={currentLon}
            windSpeed={windSpeedKmh}
            category={category}
            track={track}
          />

          <OrbitControls
            enablePan={false}
            enableDamping={true}
            dampingFactor={0.05}
            minDistance={2.7}
            maxDistance={5.4}
            rotateSpeed={0.55}
            zoomSpeed={0.65}
            minPolarAngle={Math.PI * 0.15}
            maxPolarAngle={Math.PI * 0.85}
          />
        </Canvas>
      </GlobeErrorBoundary>

      {/* Atmospheric bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
    </div>
  );
};
