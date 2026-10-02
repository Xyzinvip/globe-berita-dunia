import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import worldAtlasData from 'world-atlas/countries-110m.json';
import { CountryInfo } from '../types';
import { getCountryInfo, COUNTRIES_DATA } from '../data/countries';
import { CURATED_NEWS } from '../data/newsData';
import { CyberTelemetryHUD } from './CyberTelemetryHUD';

interface GlobeCanvasProps {
  selectedCountry: CountryInfo | null;
  onSelectCountry: (country: CountryInfo | null) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  theme: 'dark' | 'light';
  filterCategory?: string;
  filterTimeRange?: string;
  tourCountry?: CountryInfo | null;
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 243;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const GlobeCanvas: React.FC<GlobeCanvasProps> = ({
  selectedCountry,
  onSelectCountry,
  autoRotate,
  onToggleAutoRotate,
  theme,
  filterCategory,
  filterTimeRange,
  tourCountry,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<HTMLCanvasElement | null>(null);
  const projRef = useRef<d3.GeoProjection>(d3.geoOrthographic().clipAngle(90));
  const [scaleFactor, setScaleFactor] = useState(1);
  const scaleFactorRef = useRef(1);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pointersMapRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const flyAnimRef = useRef<number | null>(null);
  const starAnimRef = useRef<number | null>(null);
  const countriesFeaturesRef = useRef<GeoJSON.Feature[]>([]);
  const ringAngleRef = useRef(0);
  const [hudDismissed, setHudDismissed] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<{
    name: string;
    nameId: string;
    flag: string;
    articleCount: number;
    topCategory: string;
    x: number;
    y: number;
  } | null>(null);

  const prefersReducedMotionRef = useRef(false);

  // Check prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotionRef.current = mq.matches;
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, []);

  // Sync scaleFactor state to ref
  useEffect(() => {
    scaleFactorRef.current = scaleFactor;
  }, [scaleFactor]);

  // Reset HUD dismissed flag on country change
  useEffect(() => {
    setHudDismissed(false);
  }, [selectedCountry]);

  // Pre-calculate active news locations with categorical colors and pulse dynamics
  const newsPulseLocations = useMemo(() => {
    const list: {
      name: string;
      center: [number, number];
      isBreaking: boolean;
      articleCount: number;
      category: string;
      color: string;
      pulseSpeed: number;
    }[] = [];

    for (const [countryName, articles] of Object.entries(CURATED_NEWS)) {
      const info = COUNTRIES_DATA[countryName];
      if (info && info.center && articles.length > 0) {
        const isBreaking = articles.some((a) => Boolean(a.isBreaking));
        const count = articles.length;
        const dominantCategory = articles[0]?.category || 'Dunia';

        // Categorical color determination (Fase 3)
        let color = '#00F3FF';
        const catLower = dominantCategory.toLowerCase();
        if (catLower.includes('ekonomi') || catLower.includes('economy')) {
          color = '#f59e0b'; // Amber
        } else if (catLower.includes('politik') || catLower.includes('politics')) {
          color = '#a855f7'; // Purple/Violet
        } else if (catLower.includes('teknologi') || catLower.includes('tech')) {
          color = '#10b981'; // Green
        } else if (catLower.includes('sains') || catLower.includes('science')) {
          color = '#00F3FF'; // Cyan
        } else {
          color = '#ef4444'; // Red for World/Breaking
        }

        const pulseSpeed = isBreaking ? 1.8 : count > 2 ? 1.4 : 1.0;

        list.push({
          name: countryName,
          center: info.center,
          isBreaking,
          articleCount: count,
          category: dominantCategory,
          color,
          pulseSpeed,
        });
      }
    }
    return list;
  }, []);

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
      const curScale = scaleFactorRef.current;
      const isDesktop = width >= 1024;
      const baseRadius = Math.min(width, height * 0.82) * 0.44;
      const currentRadius = isSheetOpen
        ? Math.min(baseRadius * curScale * 0.75, height * (isDesktop ? 0.36 : 0.22))
        : baseRadius * curScale;

      // Camera Target Offset (Fase 3): on desktop, shift globe left so right news drawer doesn't obstruct target!
      // On mobile, shift globe upward so bottom sheet doesn't obstruct target!
      const targetCenterX = isSheetOpen && isDesktop ? width * 0.36 : width / 2;
      const targetCenterY = isSheetOpen && !isDesktop ? height * 0.24 : height * 0.45;

      proj.scale(currentRadius).translate([targetCenterX, targetCenterY]);

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

      // --- Spatial News Wave / Pulse Layer (Fase 3: Categorical colors & dynamic pulse) ---
      const curRot = proj.rotate();
      const centerLng = -curRot[0];
      const centerLat = -curRot[1];
      const isReducedMotion = prefersReducedMotionRef.current;

      for (let i = 0; i < newsPulseLocations.length; i++) {
        const item = newsPulseLocations[i];
        const dist = d3.geoDistance(item.center, [centerLng, centerLat]);
        if (dist > Math.PI / 2 - 0.08) continue; // Behind visible hemisphere

        const pt = proj(item.center);
        if (!pt || !isFinite(pt[0]) || !isFinite(pt[1])) continue;

        // Check category filter
        const isMatch = !filterCategory || filterCategory === 'Semua' || item.category.toLowerCase().includes(filterCategory.toLowerCase());
        const baseColor = item.color;
        const waveScale = Math.min(2.0, Math.max(0.8, curScale));
        const alphaMultiplier = isMatch ? 1 : 0.2;

        if (!isReducedMotion && isMatch) {
          // 3 concentric fading wave pulses with speed proportional to recency
          for (let w = 0; w < 3; w++) {
            const phase = ((timestamp / (2000 / item.pulseSpeed)) + (w * 0.33) + (i * 0.15)) % 1;
            const ringRadius = 4 + phase * (18 + Math.min(16, item.articleCount * 3)) * waveScale;
            const alpha = (1 - phase) * 0.85 * alphaMultiplier;

            ctx.beginPath();
            ctx.arc(pt[0], pt[1], ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(baseColor, alpha);
            ctx.lineWidth = Math.max(0.8, 1.8 * (1 - phase * 0.4));
            ctx.stroke();
          }
        }

        // Center glowing beacon core (scaled by volume)
        const coreRadius = (2.8 + Math.min(2.5, item.articleCount * 0.6)) * (isMatch ? 1 : 0.65);
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = isMatch ? baseColor : 'rgba(100, 116, 139, 0.35)';
        ctx.shadowColor = isMatch ? baseColor : 'transparent';
        ctx.shadowBlur = isMatch ? 10 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        // White core highlight if matching
        if (isMatch) {
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }

      // --- Holographic Target Reticle / Crosshair HUD Lock (Step 3) ---
      if (selectedCountry && selectedCountry.center) {
        const dist = d3.geoDistance(selectedCountry.center, [centerLng, centerLat]);
        if (dist < Math.PI / 2) {
          const pt = proj(selectedCountry.center);
          if (pt && isFinite(pt[0]) && isFinite(pt[1])) {
            const [tx, ty] = pt;
            const reticleSize = 20 * Math.min(1.8, Math.max(0.9, curScale));
            const armLen = 7;

            ctx.save();
            ctx.strokeStyle = '#00F3FF';
            ctx.shadowColor = '#00F3FF';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 1.8;

            // 4 Corner Brackets: ⌜ ⌝ ⌞ ⌟
            ctx.beginPath();
            // Top-Left
            ctx.moveTo(tx - reticleSize, ty - reticleSize + armLen);
            ctx.lineTo(tx - reticleSize, ty - reticleSize);
            ctx.lineTo(tx - reticleSize + armLen, ty - reticleSize);
            // Top-Right
            ctx.moveTo(tx + reticleSize - armLen, ty - reticleSize);
            ctx.lineTo(tx + reticleSize, ty - reticleSize);
            ctx.lineTo(tx + reticleSize, ty - reticleSize + armLen);
            // Bottom-Left
            ctx.moveTo(tx - reticleSize, ty + reticleSize - armLen);
            ctx.lineTo(tx - reticleSize, ty + reticleSize);
            ctx.lineTo(tx - reticleSize + armLen, ty + reticleSize);
            // Bottom-Right
            ctx.moveTo(tx + reticleSize - armLen, ty + reticleSize);
            ctx.lineTo(tx + reticleSize, ty + reticleSize);
            ctx.lineTo(tx + reticleSize, ty + reticleSize - armLen);
            ctx.stroke();

            // Cardinal Crosshair Ticks
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(tx, ty - reticleSize - 3);
            ctx.lineTo(tx, ty - reticleSize - 10);
            ctx.moveTo(tx, ty + reticleSize + 3);
            ctx.lineTo(tx, ty + reticleSize + 10);
            ctx.moveTo(tx - reticleSize - 3, ty);
            ctx.lineTo(tx - reticleSize - 10, ty);
            ctx.moveTo(tx + reticleSize + 3, ty);
            ctx.lineTo(tx + reticleSize + 10, ty);
            ctx.stroke();

            // Rotating Dashed Circle Reticle
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(timestamp * 0.0018);
            ctx.beginPath();
            ctx.setLineDash([3, 5]);
            ctx.arc(0, 0, reticleSize * 1.3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.65)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();

            // Holographic Leader Line & Canvas HUD Readout
            const leaderStartX = tx + reticleSize;
            const leaderStartY = ty - reticleSize * 0.6;
            const leaderMidX = leaderStartX + 28;
            const leaderMidY = leaderStartY - 20;
            const leaderEndX = leaderMidX + 80;

            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.75)';
            ctx.lineWidth = 1.2;
            ctx.moveTo(leaderStartX, leaderStartY);
            ctx.lineTo(leaderMidX, leaderMidY);
            ctx.lineTo(leaderEndX, leaderMidY);
            ctx.stroke();

            // Leader anchor point
            ctx.beginPath();
            ctx.arc(leaderStartX, leaderStartY, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#00F3FF';
            ctx.fill();

            // HUD Text Readout next to leader line
            ctx.font = 'bold 9px monospace';
            ctx.fillStyle = '#00F3FF';
            ctx.fillText(
              `TARGET LOCK: ${selectedCountry.code || selectedCountry.name.slice(0, 3).toUpperCase()}`,
              leaderMidX + 4,
              leaderMidY - 4
            );
            ctx.font = '8px monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fillText(
              `LAT ${selectedCountry.center[1].toFixed(1)}° LNG ${selectedCountry.center[0].toFixed(1)}°`,
              leaderMidX + 4,
              leaderMidY + 10
            );

            ctx.restore();
          }
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
    [selectedCountry, scaleFactor, colors, newsPulseLocations, filterCategory]
  );

  // Smooth rotation animation loop
  useEffect(() => {
    let running = true;

    const tick = (time: number) => {
      if (!running) return;

      if (autoRotate && !isDraggingRef.current && !selectedCountry && !prefersReducedMotionRef.current) {
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

  // Smooth fly to selected country with Camera Zoom
  const flyToCountry = useCallback(
    (country: CountryInfo) => {
      if (flyAnimRef.current) {
        cancelAnimationFrame(flyAnimRef.current);
      }
      const proj = projRef.current;
      const targetCoords = country.center; // [lng, lat]
      const fromRotate = proj.rotate();
      const toRotate: [number, number] = [-targetCoords[0], -targetCoords[1]];
      const interpolate = d3.interpolate(fromRotate, [toRotate[0], toRotate[1], 0]);

      const fromScale = scaleFactorRef.current;
      const targetScale = Math.max(1.35, Math.min(1.6, fromScale >= 1.2 ? fromScale : 1.38));
      const startTime = performance.now();
      const duration = prefersReducedMotionRef.current ? 120 : 750; // ms

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Smooth ease-out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const nextRot = interpolate(ease);
        proj.rotate([nextRot[0], nextRot[1], nextRot[2] || 0]);

        const nextScale = fromScale + (targetScale - fromScale) * ease;
        scaleFactorRef.current = nextScale;
        drawGlobe(now);

        if (progress < 1) {
          flyAnimRef.current = requestAnimationFrame(step);
        } else {
          flyAnimRef.current = null;
          setScaleFactor(targetScale);
        }
      };

      flyAnimRef.current = requestAnimationFrame(step);
    },
    [drawGlobe]
  );

  // Trigger flyTo when selectedCountry changes externally (e.g. from search)
  useEffect(() => {
    if (selectedCountry) {
      flyToCountry(selectedCountry);
    }
  }, [selectedCountry, flyToCountry]);

  // Trigger flyTo when news tour advances to next country
  useEffect(() => {
    if (tourCountry) {
      flyToCountry(tourCountry);
    }
  }, [tourCountry, flyToCountry]);

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
    // Desktop hover detection when not dragging
    if (!isDraggingRef.current && pointersMapRef.current.size === 0) {
      const found = pickCountry(e.clientX, e.clientY);
      if (found && found.properties?.name) {
        const cInfo = getCountryInfo(found.properties.name, String(found.id || ''));
        const newsItem = newsPulseLocations.find(
          (n) => n.name.toLowerCase() === cInfo.name.toLowerCase() || n.name.toLowerCase() === cInfo.nameId.toLowerCase()
        );
        setHoveredCountry({
          name: cInfo.name,
          nameId: cInfo.nameId,
          flag: cInfo.flag,
          articleCount: newsItem ? newsItem.articleCount : 0,
          topCategory: newsItem ? newsItem.category : 'Global',
          x: e.clientX,
          y: e.clientY,
        });
      } else {
        setHoveredCountry(null);
      }
    } else {
      setHoveredCountry(null);
    }

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

    setHoveredCountry(null);
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
        onPointerLeave={() => setHoveredCountry(null)}
        onWheel={handleWheel}
      />

      {/* Interactive Controls Overlay (Reset Zoom & Tour/Rotate) */}
      <div className="absolute bottom-20 right-4 sm:right-6 flex flex-col gap-2.5 z-20">
        {/* Reset Zoom */}
        <button
          onClick={() => {
            scaleFactorRef.current = 1;
            setScaleFactor(1);
            drawGlobe(performance.now());
          }}
          title="Reset Zoom (1x)"
          className="w-10 h-10 rounded-2xl bg-[#0a0e17]/80 backdrop-blur-xl border border-cyan-500/30 text-cyan-300 flex items-center justify-center shadow-[0_0_15px_rgba(0,243,255,0.12)] active:scale-92 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,243,255,0.25)] transition-all"
        >
          <span className="text-xs font-bold tracking-tight">1x</span>
        </button>

        {/* Toggle Auto Rotation */}
        <button
          onClick={onToggleAutoRotate}
          title={autoRotate ? 'Hentikan Putaran' : 'Putar Otomatis'}
          className={`w-10 h-10 rounded-2xl backdrop-blur-xl border transition-all flex items-center justify-center shadow-lg active:scale-92 ${
            autoRotate
              ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,243,255,0.3)]'
              : 'bg-[#0a0e17]/80 border-cyan-500/20 text-slate-400 hover:text-slate-200 hover:border-cyan-500/40'
          }`}
        >
          <svg className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 3v6h-6" />
          </svg>
        </button>
      </div>

      {/* Cyber-Typing HUD Telemetry Overlay on Country Selection */}
      {selectedCountry && !hudDismissed && (
        <CyberTelemetryHUD
          country={selectedCountry}
          onDismiss={() => setHudDismissed(true)}
        />
      )}

      {/* Hover Tooltip on Country / Hotspot (Fase 3) */}
      {hoveredCountry && !selectedCountry && (
        <div
          style={{
            left: Math.min(window.innerWidth - 180, hoveredCountry.x + 14),
            top: Math.max(76, hoveredCountry.y - 44),
          }}
          className="fixed z-40 pointer-events-none px-3 py-1.5 rounded-xl bg-[#070e1c]/95 backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_20px_rgba(0,243,255,0.25)] text-xs text-white flex items-center gap-2 select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <span className="text-base select-none">{hoveredCountry.flag}</span>
          <div>
            <p className="font-bold text-xs text-white leading-tight">{hoveredCountry.nameId}</p>
            <p className="text-[10px] text-cyan-300 font-mono">
              {hoveredCountry.articleCount > 0
                ? `${hoveredCountry.articleCount} Berita · ${hoveredCountry.topCategory}`
                : 'Belum ada kabar berita'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
