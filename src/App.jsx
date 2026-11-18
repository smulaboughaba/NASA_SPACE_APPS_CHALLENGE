import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import OrbitalGlobe from './components/OrbitalGlobe';
import TerrainViewer3D from './components/TerrainViewer3D';
import TimelineControl from './components/TimelineControl';
import ExaggerationPanel from './components/ExaggerationPanel';
import StoryModeTour from './components/StoryModeTour';
import TopShellBar, { ModeSwitchPill, TopRightUtilities } from './components/TopShellBar';
import SearchWorkspace from './components/SearchWorkspace';
import AgentModePreview from './components/AgentModePreview';
import InteractiveStarfieldBg from './components/InteractiveStarfieldBg';
import { computeInterpolatedBuffers } from './utils/sarMath';
import { analyzeZoneClientSide } from './utils/liveZoneClient';
import { formatDateOffset } from './utils/searchEngine';
import { getDatasetDailyDates } from './utils/gibsLayers';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const SETTINGS_KEY = 'geowave.settings.v1';

const loadStoredSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        lang: parsed?.lang === 'en' ? 'en' : 'es',
        dataSourceMode: ['auto', 'web', 'local'].includes(parsed?.dataSourceMode) ? parsed.dataSourceMode : 'auto',
        defaultRangeDays: [30, 60, 90].includes(Number(parsed?.defaultRangeDays)) ? Number(parsed.defaultRangeDays) : 60,
      };
    }
  } catch {
    // fallback silencioso
  }
  return { lang: 'es', dataSourceMode: 'auto', defaultRangeDays: 60 };
};

const SCENARIOS = [
  {
    id: 'la_fires',
    file: '/data/la_fires.json',
    label: 'Incendio Pacific Palisades (Los Ángeles · 2025)',
    shortLabel: 'Los Ángeles · Incendio',
    regionDate: 'Incendio forestal · California, EE. UU. · Enero 2025',
    subtitle: 'Perímetro oficial NIFC 23.448 acres sobre MDE real (Santa Monica Mountains)',
    mechanismTag: 'Polarización VH/HV',
    coords: [34.072, -118.585],
    beaconColor: '#f97316',
    defaultExag: 2,
    defaultVertex: 60 * 128 + 64,
  },
  {
    id: 'earthquake',
    file: '/data/earthquake.json',
    label: 'Terremoto Kamchatka Mw 8.8 (Etapa NISAR)',
    shortLabel: 'Kamchatka · Sismo NISAR',
    regionDate: 'Megaterremoto InSAR · Kamchatka, Pacífico · Jul–Nov 2025',
    subtitle: 'Bahía de Avacha & Shipunsky · Hipocentros USGS ±170 cm InSAR (Jul–Nov 2025)',
    mechanismTag: 'Fase InSAR NISAR L-Band',
    coords: [52.95, 159.25],
    beaconColor: '#f59e0b',
    defaultExag: 2.5,
    defaultVertex: 54 * 128 + 86,
  },
  {
    id: 'malaga_flood',
    file: '/data/malaga_flood.json',
    label: 'DANA Málaga — Valle del Guadalhorce (2024)',
    shortLabel: 'Málaga · DANA Agua',
    regionDate: 'Inundación por DANA · Málaga, España · Noviembre 2024',
    subtitle: 'Desbordamiento delimitado sobre cotas reales en metros y GIBS MODIS',
    mechanismTag: 'Backscatter Especular',
    coords: [36.695, -4.505],
    beaconColor: '#06b6d4',
    defaultExag: 2,
    defaultVertex: 68 * 128 + 66,
  },
];

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Error inesperado de renderizado' };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary capturó un fallo en Visor SAR:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#050508] text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-400">
              Recuperación automática · Visor SAR 3D
            </div>
            <h2 className="text-lg font-semibold text-white">Se detuvo la escena interactiva</h2>
            <p className="text-xs font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 rounded-xl p-3 break-words">
              {this.state.message}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, message: '' });
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-sm transition-colors"
            >
              Reiniciar Visor SAR
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [settings, setSettings] = useState(loadStoredSettings);
  const [activeMode, setActiveMode] = useState('search'); // 'search' | 'earth_engine' | 'agent'
  const [viewMode, setViewMode] = useState('globe'); // 'globe' | 'terrain' (dentro de earth_engine)
  const [globeMounted, setGlobeMounted] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [apiMode, setApiMode] = useState(null); // null | 'local' | 'web'
  const [draftZone, setDraftZone] = useState(() => ({
    query: '',
    placeLabel: '',
    lat: 39.4,
    lon: -0.35,
    searchedCoords: null,
    globeCamera: { center: [-12, 34], zoom: 2.35, pitch: 24, bearing: 0 },
    boxKm: 36,
    startDate: formatDateOffset(loadStoredSettings().defaultRangeDays + 2),
    endDate: formatDateOffset(2),
    topic: 'hydrology',
    preferredGibsLayer: 'truecolor',
    flyNonce: 0,
  }));

  const [activeScenarioId, setActiveScenarioId] = useState('la_fires');
  const [datasetCache, setDatasetCache] = useState({});
  const [loading, setLoading] = useState(false);

  const [tFloat, setTFloat] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [discreteOnly, setDiscreteOnly] = useState(false);
  const [renderMode, setRenderMode] = useState('gibs'); // 'gibs' (vista satélite real) | 'hybrid' (simulación) | 'driver'
  const [gibsLayerId, setGibsLayerId] = useState('truecolor');
  const [gibsStatuses, setGibsStatuses] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [splitX, setSplitX] = useState(0.5);
  const [exaggeration, setExaggeration] = useState(2);
  const [selectedVertex, setSelectedVertex] = useState(null);
  const [storyModeActive, setStoryModeActive] = useState(false);
  const [liveError, setLiveError] = useState('');
  const [mobileCasesOpen, setMobileCasesOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [focusSubzone, setFocusSubzone] = useState({ id: 'all', lat: null, lon: null, nonce: 0 });

  const opticalMode = renderMode === 'gibs';
  const setOpticalMode = (valOrFn) => {
    setRenderMode((prev) => {
      const prevBool = prev === 'gibs';
      const nextBool = typeof valOrFn === 'function' ? valOrFn(prevBool) : Boolean(valOrFn);
      return nextBool ? 'gibs' : 'hybrid';
    });
  };

  const tFloatRef = useRef(0);
  useEffect(() => {
    tFloatRef.current = tFloat;
  }, [tFloat]);

  const updateSettings = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      if (patch?.defaultRangeDays && patch.defaultRangeDays !== prev.defaultRangeDays) {
        setDraftZone((dz) => ({
          ...dz,
          startDate: formatDateOffset(patch.defaultRangeDays + 2),
          endDate: formatDateOffset(2),
        }));
      }
      return next;
    });
  };

  const updateDraftZone = (patch) => {
    setDraftZone((prev) => ({ ...prev, ...patch }));
  };

  // Comprueba conectividad API de forma centralizada (en web/Netlify evita /api/health innecesario)
  useEffect(() => {
    let active = true;
    if (settings.dataSourceMode === 'web' || (!import.meta.env.DEV && !API_BASE && settings.dataSourceMode === 'auto')) {
      setApiMode('web');
      return () => {
        active = false;
      };
    }
    setApiMode(null);
    fetch(`${API_BASE}/api/health`)
      .then(async (r) => {
        const ct = r.headers.get('content-type') || '';
        if (!r.ok || !ct.includes('application/json')) return null;
        return r.json();
      })
      .then((d) => {
        if (active) setApiMode(d?.ok ? 'local' : 'web');
      })
      .catch(() => {
        if (active) setApiMode('web');
      });
    return () => {
      active = false;
    };
  }, [settings.dataSourceMode]);

  const activeMeta = useMemo(
    () => SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0],
    [activeScenarioId]
  );

  const loadScenario = async (scenarioId) => {
    const meta = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
    setActiveScenarioId(meta.id);
    setExaggeration(meta.defaultExag);
    setSelectedVertex(meta.defaultVertex);
    setTFloat(0);
    tFloatRef.current = 0;
    setIsPlaying(false);
    setRenderMode('gibs');
    setGibsLayerId('truecolor');
    setCompareMode(false);
    setSplitX(0.5);
    setStoryModeActive(false);
    setActiveStep(1);
    setFocusSubzone((prev) => ({ id: 'all', lat: null, lon: null, nonce: prev.nonce + 1 }));

    if (datasetCache[meta.id]) {
      setActiveMode('earth_engine');
      setViewMode('terrain');
      return;
    }

    setLoading(true);
    try {
      let res = await fetch(meta.file);
      if (!res.ok) {
        res = await fetch('/data/demo_fallback.json');
      }
      const data = await res.json();
      if (!Array.isArray(data?.timeline) || !Array.isArray(data?.base_elevation)) {
        throw new Error(`Dataset inválido o incompleto para ${meta.label}`);
      }
      setDatasetCache((prev) => ({ ...prev, [meta.id]: data }));
      setActiveMode('earth_engine');
      setViewMode('terrain');
    } catch (err) {
      console.error('Error cargando dataset pre-horneado:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCustomZone = async (params) => {
    setLoading(true);
    setLiveError('');
    const requestParams = {
      ...params,
      start_date: params?.start_date || params?.startDate,
      end_date: params?.end_date || params?.endDate,
    };
    try {
      let data = null;
      const allowLocal = settings.dataSourceMode !== 'web' && (import.meta.env.DEV || API_BASE);
      if (allowLocal) {
        try {
          const res = await fetch(`${API_BASE}/api/analyze-zone`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestParams),
          });
          const ct = res.headers.get('content-type') || '';
          if (res.ok && ct.includes('application/json')) {
            const parsed = await res.json();
            if (Array.isArray(parsed?.timeline) && Array.isArray(parsed?.base_elevation)) {
              data = parsed;
            }
          }
        } catch {
          // Respaldo transparente al analizador directo en navegador
        }
      }
      if (!data) {
        data = await analyzeZoneClientSide(requestParams);
      }
      if (!Array.isArray(data?.timeline) || !Array.isArray(data?.base_elevation)) {
        throw new Error('No se pudo analizar la zona seleccionada');
      }
      setDatasetCache((prev) => ({ ...prev, [data.id]: data }));
      setActiveScenarioId(data.id);
      setExaggeration(2);
      setSelectedVertex(64 * 128 + 64);
      setTFloat(0);
      tFloatRef.current = 0;
      setIsPlaying(false);
      setRenderMode('gibs');
      setGibsLayerId(params?.preferredGibsLayer || 'truecolor');
      setCompareMode(false);
      setSplitX(0.5);
      setStoryModeActive(false);
      setActiveStep(1);
      setFocusSubzone((prev) => ({ id: 'all', lat: null, lon: null, nonce: prev.nonce + 1 }));
      setActiveMode('earth_engine');
      setViewMode('terrain');
    } catch (err) {
      setLiveError(err?.message || 'Error consultando Live API');
    } finally {
      setLoading(false);
    }
  };

  const dataset = datasetCache[activeScenarioId] || null;
  const dailyDates = useMemo(() => getDatasetDailyDates(dataset, 36), [dataset]);
  const simQuantizedT =
    renderMode === 'gibs' && dataset?.timeline?.length
      ? Math.min(dataset.timeline.length - 1, Math.max(0, Math.round(tFloat)))
      : tFloat;

  // Interpolación Catmull-Rom / Hermite (congelada en enteros cuando domina Vista Satélite GIBS)
  const buffers = useMemo(() => {
    if (!dataset?.timeline) return null;
    return computeInterpolatedBuffers(dataset.timeline, simQuantizedT);
  }, [dataset, simQuantizedT]);

  // Bucle limpio de reproducción: diaria discreta en GIBS / continua o por hitos en Simulación
  useEffect(() => {
    if (!isPlaying || !dataset?.timeline) return;
    const maxIdx = Math.max(0, dataset.timeline.length - 1);
    const speed = Number.isFinite(Number(playbackSpeed)) ? Number(playbackSpeed) : 1;

    if (renderMode === 'gibs' && dailyDates.length > 1) {
      const dailyMax = dailyDates.length - 1;
      const intervalMs = Math.max(240, Math.round(720 / Math.max(0.25, speed)));
      const hasLoadedFrames = gibsStatuses.some((s) => s === 'loaded');
      const timerId = setInterval(() => {
        const curRatio = maxIdx > 0 ? (Number(tFloatRef.current) || 0) / maxIdx : 0;
        const curDay = Math.max(0, Math.min(dailyMax, Math.round(curRatio * dailyMax)));
        let nextDay = curDay + 1;
        if (discreteOnly && hasLoadedFrames) {
          while (nextDay <= dailyMax && gibsStatuses[nextDay] !== 'loaded') {
            nextDay += 1;
          }
        }
        if (nextDay > dailyMax) {
          if (isLooping) {
            let firstDay = 0;
            if (discreteOnly && hasLoadedFrames) {
              const firstValid = gibsStatuses.findIndex((s) => s === 'loaded');
              if (firstValid >= 0) firstDay = firstValid;
            }
            const nextVal = dailyMax > 0 ? (firstDay / dailyMax) * maxIdx : 0;
            tFloatRef.current = nextVal;
            setTFloat(nextVal);
          } else {
            tFloatRef.current = maxIdx;
            setTFloat(maxIdx);
            setIsPlaying(false);
          }
          return;
        }
        const nextVal = dailyMax > 0 ? (nextDay / dailyMax) * maxIdx : 0;
        tFloatRef.current = nextVal;
        setTFloat(nextVal);
      }, intervalMs);
      return () => clearInterval(timerId);
    }

    if (discreteOnly) {
      const intervalMs = Math.max(350, Math.round(1400 / Math.max(0.25, speed)));
      const timerId = setInterval(() => {
        const cur = Math.round(Number.isFinite(Number(tFloatRef.current)) ? Number(tFloatRef.current) : 0);
        const next = cur + 1;
        if (next > maxIdx) {
          if (isLooping) {
            tFloatRef.current = 0;
            setTFloat(0);
          } else {
            tFloatRef.current = maxIdx;
            setTFloat(maxIdx);
            setIsPlaying(false);
          }
          return;
        }
        tFloatRef.current = next;
        setTFloat(next);
      }, intervalMs);
      return () => clearInterval(timerId);
    }

    let lastTime = performance.now();
    let rafId;

    const tick = (now) => {
      const dt = Math.max(0, Math.min(0.1, (now - lastTime) / 1000));
      lastTime = now;
      const cur = Number.isFinite(Number(tFloatRef.current)) ? Math.max(0, Number(tFloatRef.current)) : 0;
      const next = Math.max(0, cur + dt * 0.42 * speed);

      if (next >= maxIdx) {
        if (isLooping) {
          tFloatRef.current = 0;
          setTFloat(0);
          rafId = requestAnimationFrame(tick);
        } else {
          tFloatRef.current = maxIdx;
          setTFloat(maxIdx);
          setIsPlaying(false);
        }
        return;
      }

      tFloatRef.current = next;
      setTFloat(next);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, isLooping, playbackSpeed, discreteOnly, renderMode, dailyDates, gibsStatuses, dataset]);

  const handleTogglePlay = () => {
    if (!dataset?.timeline) return;
    setStoryModeActive(false);
    const maxIdx = Math.max(0, dataset.timeline.length - 1);
    if (!isPlaying && tFloatRef.current >= maxIdx - 0.02) {
      tFloatRef.current = 0;
      setTFloat(0);
    }
    setIsPlaying((p) => !p);
  };

  const handleManualSeek = (val) => {
    setStoryModeActive(false);
    setIsPlaying(false);
    const nextVal = discreteOnly && renderMode !== 'gibs' ? Math.round(val) : val;
    tFloatRef.current = nextVal;
    setTFloat(nextVal);
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === 'earth_engine' && viewMode === 'globe') {
      setGlobeMounted(true);
    }
    if (nextMode !== 'earth_engine') {
      setIsPlaying(false);
      setStoryModeActive(false);
    }
    setActiveMode(nextMode);
  };

  const handleSelectSearchLocation = (loc) => {
    setDraftZone((prev) => ({
      ...prev,
      query: loc.query ?? prev.query,
      placeLabel: loc.label,
      lat: loc.lat,
      lon: loc.lon,
      startDate: loc.startDate || prev.startDate,
      endDate: loc.endDate || prev.endDate,
      boxKm: loc.boxKm ?? prev.boxKm,
      topic: loc.topic || prev.topic,
      preferredGibsLayer: loc.preferredGibsLayer || prev.preferredGibsLayer,
      searchedCoords: { lat: loc.lat, lon: loc.lon },
      globeCamera: { center: [loc.lon, loc.lat], zoom: 10.8, pitch: 54, bearing: 0 },
      flyNonce: (prev.flyNonce || 0) + 1,
    }));
    setGlobeMounted(true);
    setActiveMode('earth_engine');
    setViewMode('globe');
  };

  const handleAnalyzeDirectFromSearch = (params) => {
    setDraftZone((prev) => ({
      ...prev,
      query: params.query ?? prev.query,
      placeLabel: params.label,
      lat: params.lat,
      lon: params.lon,
      startDate: params.startDate || prev.startDate,
      endDate: params.endDate || prev.endDate,
      boxKm: params.boxKm ?? prev.boxKm,
      topic: params.topic || prev.topic,
      preferredGibsLayer: params.preferredGibsLayer || prev.preferredGibsLayer,
      searchedCoords: { lat: params.lat, lon: params.lon },
      globeCamera: { center: [params.lon, params.lat], zoom: 10.8, pitch: 54, bearing: 0 },
      flyNonce: (prev.flyNonce || 0) + 1,
    }));
    analyzeCustomZone(params);
  };

  const handleBackToGlobe = () => {
    setIsPlaying(false);
    setStoryModeActive(false);
    setGlobeMounted(true);
    setActiveMode('earth_engine');
    setViewMode('globe');
  };

  const handleSelectStep = (stepNum) => {
    setStoryModeActive(false);
    setIsPlaying(false);
    setActiveStep(stepNum);
    const maxIdx = Math.max(0, (dataset?.timeline?.length || 1) - 1);
    if (stepNum === 1) {
      setCompareMode(false);
      setRenderMode('gibs');
    } else if (stepNum === 2) {
      setCompareMode(true);
      setRenderMode('gibs');
      setSplitX(0.5);
      tFloatRef.current = maxIdx;
      setTFloat(maxIdx);
    } else if (stepNum === 3) {
      setCompareMode(false);
      setRenderMode('gibs');
      tFloatRef.current = maxIdx;
      setTFloat(maxIdx);
    }
  };

  const handleSelectCompareDate = (idx) => {
    const maxIdx = Math.max(0, (dataset?.timeline?.length || 1) - 1);
    const clamped = Math.max(0, Math.min(maxIdx, idx));
    setStoryModeActive(false);
    setIsPlaying(false);
    setCompareMode(true);
    tFloatRef.current = clamped;
    setTFloat(clamped);
  };

  const handleFocusSubzone = (sz) => {
    setFocusSubzone((prev) => ({
      id: sz?.id || 'all',
      lat: sz?.lat ?? null,
      lon: sz?.lon ?? null,
      offset: sz?.offset || null,
      nonce: prev.nonce + 1,
    }));
  };

  const loadingOverlay = loading && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl px-5 py-3.5 flex items-center gap-3 text-sm font-medium text-zinc-100 shadow-2xl">
        <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
        Cargando relieve 3D y series satelitales...
      </div>
    </div>
  );

  const spaceShellBackdrop =
    'radial-gradient(ellipse 75% 60% at 50% 42%, #131924 0%, #090c12 52%, #05070b 100%)';

  if (viewMode === 'globe') {
    return (
      <div
        className="relative w-screen h-[100dvh] overflow-hidden"
        style={{ background: spaceShellBackdrop }}
      >
        <InteractiveStarfieldBg active={activeMode !== 'earth_engine'} />

        <TopShellBar
          activeMode={activeMode}
          onChangeMode={handleModeChange}
          settings={settings}
          onUpdateSettings={updateSettings}
          apiMode={apiMode}
          showLeftBrand={activeMode !== 'search' || searchExpanded}
          showApiBadge={activeMode !== 'search'}
        />

        {/* Capa 1: Portada / Apartado de Búsqueda (Modo Buscador) */}
        <section
          aria-hidden={activeMode !== 'search'}
          className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeMode === 'search'
              ? 'opacity-100 scale-100 translate-y-0 z-10 visible'
              : 'opacity-0 scale-[0.985] -translate-y-2 pointer-events-none z-0 invisible'
          }`}
        >
          <SearchWorkspace
            scenarios={SCENARIOS}
            lang={settings.lang}
            apiMode={apiMode}
            draftZone={draftZone}
            onUpdateDraftZone={updateDraftZone}
            onFrameInGlobe={handleSelectSearchLocation}
            onAnalyzeDirect={handleAnalyzeDirectFromSearch}
            onEnterScenario={loadScenario}
            onExpandedChange={setSearchExpanded}
          />
        </section>

        {/* Capa 2: Modo Earth Engine (Globo 3D) */}
        <section
          aria-hidden={activeMode !== 'earth_engine'}
          className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeMode === 'earth_engine'
              ? 'opacity-100 scale-100 z-10 visible'
              : 'opacity-0 scale-[0.985] pointer-events-none z-0 invisible'
          }`}
        >
          {globeMounted && (
            <div className="w-full h-full animate-geowave-in">
              <OrbitalGlobe
                scenarios={SCENARIOS}
                onEnterTerrain={loadScenario}
                onAnalyzeZone={analyzeCustomZone}
                liveError={liveError}
                draftZone={draftZone}
                onUpdateDraftZone={updateDraftZone}
                lang={settings.lang}
              />
            </div>
          )}
        </section>

        {/* Capa 3: Agent Mode */}
        <section
          aria-hidden={activeMode !== 'agent'}
          className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeMode === 'agent'
              ? 'opacity-100 scale-100 translate-y-0 z-10 visible'
              : 'opacity-0 scale-[0.985] translate-y-2 pointer-events-none z-0 invisible'
          }`}
        >
          <AgentModePreview
            lang={settings.lang}
            draftZone={draftZone}
            activeDatasetTitle={dataset?.titulo}
            onGoSearch={() => handleModeChange('search')}
            onGoEarthEngine={() => handleModeChange('earth_engine')}
          />
        </section>

        {loadingOverlay}
      </div>
    );
  }

  return (
    <div className="relative w-screen h-[100dvh] bg-[#050508] flex flex-col overflow-hidden">
      {/* Cabecera Superior Minimalista con Switch integrado y menú de casos plegable en móvil */}
      <header className="relative min-h-[48px] sm:min-h-[52px] bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-2 shrink-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => handleModeChange('search')}
            title="GEO-WAVE"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/5 transition-colors shrink-0"
          >
            <img
              src="/assets/geo-wave-icon-light.png"
              alt="GEO-WAVE"
              className="w-7 h-7 object-contain"
            />
          </button>

          <nav className="hidden lg:flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => loadScenario(sc.id)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  activeScenarioId === sc.id
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                {sc.shortLabel}
              </button>
            ))}
          </nav>

          {/* Selector plegable de casos demostrativos en móvil y tablet */}
          <div className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setMobileCasesOpen((v) => !v)}
              aria-expanded={mobileCasesOpen}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-colors ${
                mobileCasesOpen
                  ? 'bg-white/15 border-white/25 text-white'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <span>Casos</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${mobileCasesOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileCasesOpen && (
              <div className="absolute left-0 mt-2 w-60 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/15 shadow-2xl p-2 space-y-2 z-50">
                <div className="space-y-1 border-b border-white/10 pb-2 md:hidden">
                  <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">Modos</div>
                  {[
                    { id: 'search', label: settings.lang === 'en' ? 'Search Mode' : 'Modo Buscador' },
                    { id: 'earth_engine', label: 'Earth Engine' },
                    { id: 'agent', label: 'Agent Mode' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMobileCasesOpen(false);
                        handleModeChange(m.id);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        activeMode === m.id
                          ? 'bg-cyan-400/15 text-cyan-200 font-semibold'
                          : 'text-zinc-200 hover:bg-white/10'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    {settings.lang === 'en' ? 'Cases' : 'Casos demostrativos'}
                  </div>
                  {SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        setMobileCasesOpen(false);
                        loadScenario(sc.id);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        activeScenarioId === sc.id
                          ? 'bg-zinc-100 text-zinc-950 font-semibold'
                          : 'text-zinc-200 hover:bg-white/10'
                      }`}
                    >
                      {sc.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <ModeSwitchPill
            activeMode={activeMode}
            onChangeMode={handleModeChange}
            lang={settings.lang}
            compact={true}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <StoryModeTour
            dataset={dataset}
            storyModeActive={storyModeActive}
            setStoryModeActive={setStoryModeActive}
            tFloat={tFloat}
            setTFloat={setTFloat}
            setRenderMode={setRenderMode}
            setGibsLayerId={setGibsLayerId}
            setOpticalMode={setOpticalMode}
            setCompareMode={setCompareMode}
            setIsPlaying={setIsPlaying}
            setExaggeration={setExaggeration}
          />
          <TopRightUtilities
            settings={settings}
            onUpdateSettings={updateSettings}
            apiMode={apiMode}
          />
        </div>
      </header>

      {/* Área Principal: Lienzo 3D + Panel Lateral */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        <main className="flex-1 min-h-0 relative">
          {loading || !dataset ? (
            <div className="w-full h-full flex items-center justify-center text-zinc-300 text-sm font-medium">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-zinc-400" />
              Cargando {activeMeta.label}...
            </div>
          ) : (
            <TerrainViewer3D
              dataset={dataset}
              tFloat={tFloat}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onManualSeek={handleManualSeek}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              renderMode={renderMode}
              setRenderMode={setRenderMode}
              opticalMode={opticalMode}
              setOpticalMode={setOpticalMode}
              compareMode={compareMode}
              setCompareMode={setCompareMode}
              splitX={splitX}
              setSplitX={setSplitX}
              exaggeration={exaggeration}
              selectedVertex={selectedVertex}
              onSelectVertex={setSelectedVertex}
              storyModeActive={storyModeActive}
              onBackToGlobe={handleBackToGlobe}
              buffers={buffers}
              activeStep={activeStep}
              focusSubzone={focusSubzone}
              gibsLayerId={gibsLayerId}
              setGibsLayerId={setGibsLayerId}
              dailyDates={dailyDates}
              onGibsStatusesChange={setGibsStatuses}
            />
          )}
        </main>

        {dataset && (
          <ExaggerationPanel
            dataset={dataset}
            tFloat={tFloat}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onManualSeek={handleManualSeek}
            exaggeration={exaggeration}
            setExaggeration={setExaggeration}
            selectedVertex={selectedVertex}
            buffers={buffers}
            renderMode={renderMode}
            setRenderMode={setRenderMode}
            opticalMode={opticalMode}
            setOpticalMode={setOpticalMode}
            activeStep={activeStep}
            onSelectStep={handleSelectStep}
            onSelectCompareDate={handleSelectCompareDate}
            activeSubzoneId={focusSubzone.id}
            onFocusSubzone={handleFocusSubzone}
            onBackToGlobe={handleBackToGlobe}
            gibsLayerId={gibsLayerId}
            dailyDates={dailyDates}
          />
        )}
      </div>

      {/* Controles Temporales Inferiores */}
      {dataset && (
        <TimelineControl
          dataset={dataset}
          tFloat={tFloat}
          setTFloat={setTFloat}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onTogglePlay={handleTogglePlay}
          onManualSeek={handleManualSeek}
          isLooping={isLooping}
          setIsLooping={setIsLooping}
          playbackSpeed={playbackSpeed}
          setPlaybackSpeed={setPlaybackSpeed}
          discreteOnly={discreteOnly}
          setDiscreteOnly={setDiscreteOnly}
          renderMode={renderMode}
          setRenderMode={setRenderMode}
          opticalMode={opticalMode}
          setOpticalMode={setOpticalMode}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
          splitX={splitX}
          setSplitX={setSplitX}
          buffers={buffers}
          dailyDates={dailyDates}
          gibsStatuses={gibsStatuses}
          gibsLayerId={gibsLayerId}
        />
      )}

      {/* Transición fluida hacia Modo Buscador / Agent Mode sin desmontar el visor 3D */}
      <div
        aria-hidden={activeMode === 'earth_engine'}
        style={{ background: spaceShellBackdrop }}
        className={`fixed inset-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          activeMode === 'earth_engine'
            ? 'opacity-0 scale-[1.015] pointer-events-none invisible'
            : 'opacity-100 scale-100 visible'
        }`}
      >
        <InteractiveStarfieldBg active={activeMode !== 'earth_engine'} />

        <TopShellBar
          activeMode={activeMode}
          onChangeMode={handleModeChange}
          settings={settings}
          onUpdateSettings={updateSettings}
          apiMode={apiMode}
          showLeftBrand={activeMode !== 'search' || searchExpanded}
          showApiBadge={activeMode !== 'search'}
        />

        <section
          aria-hidden={activeMode !== 'search'}
          className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeMode === 'search'
              ? 'opacity-100 scale-100 translate-y-0 z-10 visible'
              : 'opacity-0 scale-[0.985] -translate-y-2 pointer-events-none z-0 invisible'
          }`}
        >
          <SearchWorkspace
            scenarios={SCENARIOS}
            lang={settings.lang}
            apiMode={apiMode}
            draftZone={draftZone}
            onUpdateDraftZone={updateDraftZone}
            onFrameInGlobe={handleSelectSearchLocation}
            onAnalyzeDirect={handleAnalyzeDirectFromSearch}
            onEnterScenario={loadScenario}
            onExpandedChange={setSearchExpanded}
          />
        </section>

        <section
          aria-hidden={activeMode !== 'agent'}
          className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            activeMode === 'agent'
              ? 'opacity-100 scale-100 translate-y-0 z-10 visible'
              : 'opacity-0 scale-[0.985] translate-y-2 pointer-events-none z-0 invisible'
          }`}
        >
          <AgentModePreview
            lang={settings.lang}
            draftZone={draftZone}
            activeDatasetTitle={dataset?.titulo}
            onGoSearch={() => handleModeChange('search')}
            onGoEarthEngine={() => handleModeChange('earth_engine')}
          />
        </section>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppContent />
    </AppErrorBoundary>
  );
}
