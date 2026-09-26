import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldAtlasData from 'world-atlas/countries-110m.json';
import { CountryInfo } from '../types';
import { getCountryInfo } from '../data/countries';

interface GlobeCanvasProps {
  selectedCountry: CountryInfo | null;
  onSelectCountry: (country: CountryInfo | null) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  theme: 'dark' | 'light';
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  selectedCountry,
  onSelectCountry,
  autoRotate,
  onToggleAutoRotate,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<HTMLCanvasElement | null>(null);
  const projRef = useRef<d3.GeoProjection>(d3.geoOrthographic().clipAngle(90));
  const [scaleFactor, setScaleFactor] = useState(1);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pointersMapRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const starAnimRef = useRef<number | null>(null);
  const countriesFeaturesRef = useRef<GeoJSON.Feature[]>([]);
  const ringAngleRef = useRef(0);

  // Color palette based on theme
  const colors = theme === 'dark' ? {
    oceanA: '#0d3b69',
    oceanB: '#030814',
    land: '#113352',
    landHighlight: '#ff8a3d',
    graticule: '#2fd8e8',
    graticuleAlpha: 0.18,
    border: '#3fd0e6',
    glow: '#2fe4ff',
    starColor: '#ffffff',
  } : {
    oceanA: '#bcd7f5',
    oceanB: '#8fb8e6',
    land: '#f2f5fb',
    landHighlight: '#ff6a2e',
    graticule: '#a9c1e6',
    graticuleAlpha: 0.25,
    border: '#7d97c4',
    glow: '#5aa8ef',
    starColor: '#9bbad8',
  };

  // Extract TopoJSON country features on mount
  useEffect(() => {
    try {
      const topo = worldAtlasData as unknown as { objects: { countries: unknown } };
      // @ts-expect-error - topojson types
      const countriesGeo = topojson.feature(topo, topo.objects.countries) as GeoJSON.FeatureCollection;
      countriesFeaturesRef.current = (countriesGeo.features || []).filter(
        (f) => f.properties && f.properties.name
      );
    } catch (err) {
      console.error('Failed to parse world atlas:', err);
    }
  }, []);

  // Stars animation in background
  useEffect(() => {
    const starCanvas = starsRef.current;
    if (!starCanvas) return;
    const ctx = starCanvas.getContext('2d');
    if (!ctx) return;

    let width = (starCanvas.width = window.innerWidth);
    let height = (starCanvas.height = window.innerHeight);

    const handleResize = () => {
      width = starCanvas.width = window.innerWidth;
      height = starCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const starCount = Math.min(180, Math.round((width * height) / 8000));
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.3,
      p: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.005,
      isCyan: Math.random() > 0.85,
    }));

    let lastTime = 0;
    const renderStars = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Radial background wash
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.35,
        50,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      if (theme === 'dark') {
        bgGrad.addColorStop(0, '#070b1e');
        bgGrad.addColorStop(0.65, '#03050e');
        bgGrad.addColorStop(1, '#010207');
      } else {
        bgGrad.addColorStop(0, '#f0f4fd');
        bgGrad.addColorStop(0.7, '#e4ebf8');
        bgGrad.addColorStop(1, '#d8e2f3');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Twinkling stars
      for (const st of stars) {
        const alpha = 0.2 + 0.8 * Math.abs(Math.sin(st.p + time * st.speed));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = st.isCyan ? colors.glow : colors.starColor;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      starAnimRef.current = requestAnimationFrame(renderStars);
    };

    starAnimRef.current = requestAnimationFrame(renderStars);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (starAnimRef.current) cancelAnimationFrame(starAnimRef.current);
    };
  }, [theme, colors.glow, colors.starColor]);

  // Main Globe drawing logic
  const drawGlobe = useCallback(
    (timestamp: number = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const proj = projRef.current;
      const isSheetOpen = !!selectedCountry;
      const baseRadius = Math.min(width, height * 0.82) * 0.44;
      const currentRadius = isSheetOpen
        ? Math.min(baseRadius * scaleFactor * 0.72, height * 0.22)
        : baseRadius * scaleFactor;
      const centerY = isSheetOpen ? height * 0.26 : height * 0.45;

      proj.scale(currentRadius).translate([width / 2, centerY]);

      const path = d3.geoPath(proj, ctx);
      const center = proj.translate();
      const radius = proj.scale();

      // Atmospheric outer glow pulse
      const pulse = 0.8 + 0.2 * Math.sin(timestamp / 800);
      const atmosGlow = ctx.createRadialGradient(
        center[0],
        center[1],
        radius * 0.92,
        center[0],
        center[1],
        radius * 1.55
      );
      atmosGlow.addColorStop(0, colors.glow + '00');
      atmosGlow.addColorStop(0.5, colors.glow + Math.round(28 * pulse).toString(16).padStart(2, '0'));
      atmosGlow.addColorStop(1, 'transparent');

      ctx.fillStyle = atmosGlow;
      ctx.fillRect(center[0] - radius * 1.7, center[1] - radius * 1.7, radius * 3.4, radius * 3.4);

      // Rotating dashed orbital navigation rings
      ringAngleRef.current += 0.005;
      ctx.save();
      ctx.translate(center[0], center[1]);
      ctx.rotate(ringAngleRef.current);
      ctx.beginPath();
      ctx.setLineDash([3, 11]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.glow + '70';
      ctx.arc(0, 0, radius * 1.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.save();
      ctx.translate(center[0], center[1]);
      ctx.rotate(-ringAngleRef.current * 0.5);
      ctx.beginPath();
      ctx.setLineDash([1, 8]);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = colors.glow + '40';
      ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Ocean sphere with 3D gradient shading
      const oceanGrad = ctx.createRadialGradient(
        center[0] - radius * 0.32,
        center[1] - radius * 0.38,
        radius * 0.05,
        center[0],
        center[1],
        radius
      );
      oceanGrad.addColorStop(0, colors.oceanA);
      oceanGrad.addColorStop(1, colors.oceanB);

      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Graticule grid lines
      const graticule = d3.geoGraticule10();
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = colors.graticule;
      ctx.globalAlpha = colors.graticuleAlpha + 0.05 * pulse;
      ctx.lineWidth = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw countries
      const countries = countriesFeaturesRef.current;
      for (let i = 0; i < countries.length; i++) {
        const feature = countries[i];
        const isSelected = selectedCountry && feature.properties?.name === selectedCountry.name;

        ctx.beginPath();
        path(feature);

        if (isSelected) {
          ctx.fillStyle = colors.landHighlight;
          ctx.shadowColor = colors.landHighlight;
          ctx.shadowBlur = 24;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        } else {
          ctx.fillStyle = colors.land;
          ctx.fill();
          ctx.strokeStyle = colors.border;
          ctx.lineWidth = 0.65;
          ctx.stroke();
        }
      }

      // Outer rim edge highlight
      ctx.beginPath();
      path({ type: 'Sphere' });
      ctx.strokeStyle = colors.glow;
      ctx.globalAlpha = 0.55 + 0.25 * pulse;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = colors.glow;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },
    [selectedCountry, scaleFactor, colors]
  );

  // Smooth rotation animation loop
  useEffect(() => {
    let running = true;

    const tick = (time: number) => {
      if (!running) return;

      if (autoRotate && !isDraggingRef.current && !selectedCountry) {
        const currentRot = projRef.current.rotate();
        projRef.current.rotate([currentRot[0] + 0.18, currentRot[1], currentRot[2]]);
      }

      drawGlobe(time);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoRotate, selectedCountry, drawGlobe]);

  // Smooth fly to selected country
  const flyToCountry = useCallback(
    (country: CountryInfo) => {
      const proj = projRef.current;
      const targetCoords = country.center; // [lng, lat]
      const fromRotate = proj.rotate();
      const toRotate: [number, number] = [-targetCoords[0], -targetCoords[1]];
      const interpolate = d3.interpolate(fromRotate, [toRotate[0], toRotate[1], 0]);
      const startTime = performance.now();
      const duration = 650; // ms

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const nextRot = interpolate(ease);
        proj.rotate([nextRot[0], nextRot[1], nextRot[2] || 0]);
        drawGlobe(now);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    },
    [drawGlobe]
  );

  // Trigger flyTo when selectedCountry changes externally (e.g. from search)
  useEffect(() => {
    if (selectedCountry) {
      flyToCountry(selectedCountry);
    }
  }, [selectedCountry, flyToCountry]);

  // Pointer / Touch interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    pointersMapRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersMapRef.current.size === 1) {
      lastPointerRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
      isDraggingRef.current = false;
    } else if (pointersMapRef.current.size === 2) {
      const pts = Array.from(pointersMapRef.current.values());
      initialPinchDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      isDraggingRef.current = true;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointersMapRef.current.has(e.pointerId)) return;
    pointersMapRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const proj = projRef.current;
    const pts = Array.from(pointersMapRef.current.values());

    // Single finger: rotate globe
    if (pts.length === 1 && lastPointerRef.current) {
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;

      if (Math.hypot(dx, dy) > 4) {
        isDraggingRef.current = true;
      }

      if (isDraggingRef.current) {
        const curRot = proj.rotate();
        const sensitivity = 0.32 / scaleFactor;
        const nextLat = Math.max(-85, Math.min(85, curRot[1] - dy * sensitivity));
        proj.rotate([curRot[0] + dx * sensitivity, nextLat, curRot[2]]);
        lastPointerRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
        drawGlobe(performance.now());
      }
    }
    // Two fingers: pinch zoom
    else if (pts.length === 2 && initialPinchDistRef.current) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (initialPinchDistRef.current > 0) {
        const factor = dist / initialPinchDistRef.current;
        setScaleFactor((prev) => Math.max(0.7, Math.min(4.5, prev * (1 + (factor - 1) * 0.1))));
      }
      initialPinchDistRef.current = dist;
      drawGlobe(performance.now());
    }
  };

  const pickCountry = (clientX: number, clientY: number): GeoJSON.Feature | null => {
    const proj = projRef.current;
    const inv = proj.invert ? proj.invert([clientX, clientY]) : null;
    if (!inv || !isFinite(inv[0]) || !isFinite(inv[1])) return null;

    const center = proj.translate();
    const distFromCenter = Math.hypot(clientX - center[0], clientY - center[1]);
    if (distFromCenter > proj.scale()) return null;

    for (const feature of countriesFeaturesRef.current) {
      if (d3.geoContains(feature, inv)) {
        return feature;
      }
    }
    return null;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const wasDragging = isDraggingRef.current;
    const startTime = lastPointerRef.current?.time || 0;
    const tapDuration = performance.now() - startTime;

    pointersMapRef.current.delete(e.pointerId);
    if (pointersMapRef.current.size === 0) {
      isDraggingRef.current = false;
      initialPinchDistRef.current = null;
    }

    // Register quick tap if not dragged
    if (!wasDragging && tapDuration < 380) {
      const found = pickCountry(e.clientX, e.clientY);
      if (found && found.properties?.name) {
        const country = getCountryInfo(found.properties.name, String(found.id || ''));
        onSelectCountry(country);
      } else {
        if (selectedCountry) {
          onSelectCountry(null);
        }
      }
    }
  };

  // Wheel zoom on desktop
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 1.12 : 0.89;
    setScaleFactor((prev) => Math.max(0.7, Math.min(4.5, prev * zoomDelta)));
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none touch-none">
      {/* Background Starfield Canvas */}
      <canvas ref={starsRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Main 3D Globe Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Interactive Controls Overlay */}
      <div className="absolute bottom-6 right-4 flex flex-col gap-2.5 z-20">
        {/* Reset Zoom */}
        <button
          onClick={() => setScaleFactor(1)}
          title="Reset Zoom"
          className="w-11 h-11 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/25 text-cyan-300 flex items-center justify-center shadow-lg active:scale-92 transition"
        >
          <span className="text-xs font-bold tracking-tight">1x</span>
        </button>

        {/* Toggle Auto Rotation */}
        <button
          onClick={onToggleAutoRotate}
          title={autoRotate ? 'Hentikan Putaran' : 'Putar Otomatis'}
          className={`w-11 h-11 rounded-2xl backdrop-blur-xl border transition flex items-center justify-center shadow-lg active:scale-92 ${
            autoRotate
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-500/20'
              : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className={`w-5 h-5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </div>

      {/* Hint overlay */}
      {!selectedCountry && (
        <div className="absolute bottom-5 left-0 right-0 text-center pointer-events-none z-10 transition-opacity">
          <p className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-cyan-500/20 text-xs text-cyan-200/80 shadow-md">
            <span>🌍</span>
            <span>Geser untuk memutar · Cubit untuk zoom · Ketuk negara untuk baca berita langsung</span>
          </p>
        </div>
      )}
    </div>
  );
};
