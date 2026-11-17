import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Globe2,
  History,
  Layers,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { getGibsLayer } from '../utils/gibsLayers';
import { getCopy } from '../utils/i18n';
import {
  buildRegionalBbox,
  geocodePlaces,
  LAYER_SCALE_META,
  loadSearchHistory,
  saveSearchHistoryItem,
  searchLocalCatalog,
  validateDateWindow,
} from '../utils/searchEngine';

export default function SearchWorkspace({
  scenarios = [],
  lang = 'es',
  apiMode = 'web',
  draftZone,
  onUpdateDraftZone,
  onFrameInGlobe,
  onAnalyzeDirect,
  onEnterScenario,
  onExpandedChange,
}) {
  const t = getCopy(lang);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const [query, setQuery] = useState(draftZone?.query || '');
  const [searching, setSearching] = useState(false);
  const [placeStatus, setPlaceStatus] = useState('idle'); // idle | ok | empty | rate_limit | error
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [history, setHistory] = useState(() => loadSearchHistory());

  const activeLayerId = draftZone?.preferredGibsLayer || 'truecolor';
  const activeTopic = draftZone?.topic || 'hydrology';
  const startDate = draftZone?.startDate || '';
  const endDate = draftZone?.endDate || '';
  const boxKm = draftZone?.boxKm ?? 36;

  const isExpanded = Boolean(
    query.trim().length >= 2 || selectedPlace || searching || placeStatus !== 'idle'
  );

  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  // Atajos globales "/" / Ctrl+K / Esc
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if ((e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && isExpanded) {
        setQuery('');
        setPlaces([]);
        setSelectedPlace(null);
        setPlaceStatus('idle');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded]);

  // Búsqueda local instantánea sobre capas GIBS, variables y casos demostrativos
  const catalogMatches = useMemo(
    () => searchLocalCatalog(query, scenarios),
    [query, scenarios]
  );

  // Geocodificación con debounce 340 ms (respeta política Nominatim)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      abortRef.current?.abort();
      setSearching(false);
      setPlaces([]);
      setPlaceStatus('idle');
      return undefined;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSearching(true);

    const timer = setTimeout(async () => {
      const res = await geocodePlaces(q, lang, ctrl.signal);
      if (ctrl.signal.aborted || res.status === 'aborted') return;
      setSearching(false);
      setPlaceStatus(res.status);
      setPlaces(res.items || []);
      if (res.items?.length > 0) {
        setSelectedPlace(res.items[0]);
      }
    }, 340);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, lang]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSearching(true);
    const res = await geocodePlaces(q, lang, ctrl.signal);
    if (ctrl.signal.aborted || res.status === 'aborted') return;
    setSearching(false);
    setPlaceStatus(res.status);
    setPlaces(res.items || []);
    if (res.items?.length > 0) {
      setSelectedPlace(res.items[0]);
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setQuery('');
    setSearching(false);
    setPlaces([]);
    setSelectedPlace(null);
    setPlaceStatus('idle');
    onUpdateDraftZone?.({ query: '' });
    inputRef.current?.focus();
  };

  const handleSelectLayerChip = (layerId) => {
    const inferredTopic =
      layerId === 'bands721' || layerId === 'lst'
        ? 'thermal'
        : layerId === 'precip' || layerId === 'soil'
        ? 'hydrology'
        : activeTopic;
    onUpdateDraftZone?.({ preferredGibsLayer: layerId, topic: inferredTopic });
  };

  const handleUseCurrentDraftZone = () => {
    if (!Number.isFinite(draftZone?.lat) || !Number.isFinite(draftZone?.lon)) return;
    setSelectedPlace({
      id: 'draft-current',
      label: draftZone.placeLabel || `${draftZone.lat}°, ${draftZone.lon}°`,
      sublabel: lang === 'en' ? 'Current Earth Engine focus' : 'Encuadre actual en Earth Engine',
      lat: draftZone.lat,
      lon: draftZone.lon,
    });
  };

  const dateValidation = useMemo(
    () => validateDateWindow(startDate, endDate, activeLayerId, lang),
    [startDate, endDate, activeLayerId, lang]
  );

  const activeLayerObj = getGibsLayer(activeLayerId);
  const layerScaleInfo = LAYER_SCALE_META[activeLayerId];
  const layerNote = lang === 'en' ? layerScaleInfo?.noteEn : layerScaleInfo?.noteEs;

  const commitPlaceAction = (mode) => {
    if (!selectedPlace) return;
    const updatedHistory = saveSearchHistoryItem(selectedPlace);
    setHistory(updatedHistory);
    const payload = {
      query: query.trim(),
      label: selectedPlace.label,
      lat: selectedPlace.lat,
      lon: selectedPlace.lon,
      startDate,
      endDate,
      boxKm,
      topic: activeTopic,
      preferredGibsLayer: activeLayerId,
    };

    if (mode === '3d') {
      if (!dateValidation.valid) return;
      onAnalyzeDirect?.({
        ...payload,
        bbox: buildRegionalBbox(selectedPlace.lat, selectedPlace.lon, boxKm),
      });
    } else {
      onFrameInGlobe?.(payload);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-y-auto px-4 flex flex-col items-center transition-[padding] duration-300 ${
        isExpanded ? 'pt-20 pb-8 justify-start' : 'justify-center select-none'
      }`}
    >
      <div className={`w-full flex flex-col items-center ${isExpanded ? 'max-w-5xl space-y-5' : 'max-w-2xl -mt-6'}`}>
        {/* Wordmark Hero (solo cuando no hay búsqueda expandida) */}
        {!isExpanded && (
          <h1
            aria-label="GeWave"
            className="flex items-center justify-center text-zinc-100 font-bold tracking-tight text-5xl sm:text-6xl mb-8 select-none animate-geowave-in"
          >
            <span>Ge</span>
            <img
              src="/assets/geo-wave-icon-light.png"
              alt="o"
              className="w-16 h-16 sm:w-20 sm:h-20 mx-0.5 object-contain drop-shadow-[0_0_24px_rgba(226,232,240,0.16)]"
            />
            <span>Wave</span>
          </h1>
        )}

        {/* Único input Spotlight persistente (nunca pierde foco al expandirse) */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full space-y-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full h-12 rounded-full backdrop-blur-xl border pl-12 pr-12 text-sm text-zinc-100 placeholder:text-zinc-400 shadow-[0_12px_40px_rgba(0,0,0,0.48)] focus:outline-none transition-all ${
                isExpanded
                  ? 'bg-zinc-900/85 focus:bg-zinc-900 border-white/20 focus:border-cyan-400/60'
                  : 'bg-zinc-900/75 hover:bg-zinc-900/90 focus:bg-zinc-900/95 border-white/15 focus:border-white/30'
              }`}
            />
            {searching && (
              <Loader2 className="w-4 h-4 text-cyan-300 animate-spin absolute right-10 pointer-events-none" />
            )}
            {query && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={handleClear}
                className="absolute right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isExpanded && activeLayerId !== 'truecolor' && (
            <div className="flex items-center justify-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/35 text-cyan-200">
                <Layers className="w-3 h-3" />
                {t.selectedLayerChip}: <strong>{activeLayerObj.label}</strong>
                <button
                  type="button"
                  onClick={() => onUpdateDraftZone?.({ preferredGibsLayer: 'truecolor' })}
                  className="ml-1 hover:text-white"
                  title="Restablecer a Color real"
                >
                  ×
                </button>
              </span>
            </div>
          )}
        </form>

        {/* Chips discretos en Portada */}
        {!isExpanded && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 animate-geowave-in">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => onEnterScenario?.(sc.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[11px] text-zinc-300 hover:text-white transition-colors"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: sc.beaconColor }}
                />
                {sc.shortLabel}
              </button>
            ))}
          </div>
        )}

        {/* Dos tarjetas equilibradas en Modo Búsqueda expandida */}
        {isExpanded && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5 items-start animate-geowave-in">
          {/* Tarjeta Izquierda: Resultados */}
          <div className="rounded-3xl bg-zinc-900/75 backdrop-blur-xl border border-white/10 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-zinc-100">{t.resultsTitle}</h2>
              {Number.isFinite(draftZone?.lat) && !selectedPlace && (
                <button
                  type="button"
                  onClick={handleUseCurrentDraftZone}
                  className="text-[11px] font-mono text-cyan-300 hover:text-cyan-200 transition-colors"
                >
                  {t.useDraftZone} ({draftZone.lat}°, {draftZone.lon}°)
                </button>
              )}
            </div>

            {/* Lista de ubicaciones o estados */}
            {searching && places.length === 0 ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="h-12 rounded-2xl bg-white/[0.04] border border-white/5 animate-pulse" />
                ))}
              </div>
            ) : places.length > 0 ? (
              <div className="space-y-2">
                {places.map((item) => {
                  const isSel = selectedPlace?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPlace(item)}
                      className={`w-full px-3.5 py-2.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                        isSel
                          ? 'bg-cyan-400/10 border-cyan-400/75 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                          : 'bg-zinc-950/60 border-white/10 hover:border-white/25 hover:bg-zinc-950/90'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {item.isCoord ? (
                          <Navigation className={`w-4 h-4 shrink-0 ${isSel ? 'text-cyan-300' : 'text-zinc-400'}`} />
                        ) : (
                          <MapPin className={`w-4 h-4 shrink-0 ${isSel ? 'text-cyan-300' : 'text-zinc-400'}`} />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-100 truncate">{item.label}</div>
                          {item.sublabel && (
                            <div className="text-[11px] text-zinc-400 truncate">{item.sublabel}</div>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums text-zinc-400 shrink-0">
                        {item.lat}°, {item.lon}°
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              placeStatus !== 'idle' && (
                <div className="rounded-2xl bg-zinc-950/70 border border-white/10 px-3.5 py-3 text-xs text-zinc-300">
                  {placeStatus === 'rate_limit'
                    ? t.searchRateLimit
                    : placeStatus === 'error'
                      ? t.searchNetworkErr
                      : t.noResults}
                </div>
              )
            )}

            {/* Capas satelitales y casos coincidentes */}
            {(catalogMatches.layers.length > 0 || catalogMatches.scenarios.length > 0) && (
              <div className="pt-2 border-t border-white/10 space-y-2.5">
                <div className="text-[11px] font-mono text-zinc-400">{t.layersTitle}</div>
                <div className="flex flex-wrap gap-1.5">
                  {catalogMatches.scenarios.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => onEnterScenario?.(sc.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950/80 hover:bg-zinc-800 border border-white/15 text-[11px] text-zinc-100 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc.beaconColor }} />
                      {sc.shortLabel}
                    </button>
                  ))}
                  {catalogMatches.layers.map((l) => {
                    const active = activeLayerId === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleSelectLayerChip(l.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] transition-colors ${
                          active
                            ? 'bg-cyan-400 text-zinc-950 border-cyan-300 font-semibold'
                            : 'bg-zinc-950/70 border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Historial reciente */}
            {history.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                  <History className="w-3 h-3" />
                  {t.recentTitle}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedPlace(h)}
                      className={`px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
                        selectedPlace?.label === h.label
                          ? 'bg-white/15 border-white/25 text-white'
                          : 'bg-zinc-950/60 border-white/10 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1 text-[10px] font-mono text-zinc-500">{t.osmAttribution}</div>
          </div>

          {/* Tarjeta Derecha: Preparar zona de estudio */}
          <div className="rounded-3xl bg-zinc-900/75 backdrop-blur-xl border border-white/10 shadow-2xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">{t.prepareTitle}</h2>
              {selectedPlace ? (
                <div className="mt-1 flex items-center justify-between gap-2 text-xs">
                  <span className="text-cyan-300 font-medium truncate">{selectedPlace.label}</span>
                  <span className="font-mono tabular-nums text-zinc-400 shrink-0">
                    {selectedPlace.lat}°, {selectedPlace.lon}°
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-xs text-zinc-400">{t.prepareHintEmpty}</p>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <label className="space-y-1 text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {t.from}
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onUpdateDraftZone?.({ startDate: e.target.value })}
                  className="w-full bg-zinc-950/90 border border-white/10 focus:border-cyan-400/60 rounded-xl px-2.5 py-1.5 text-xs font-mono text-zinc-100 focus:outline-none"
                />
              </label>
              <label className="space-y-1 text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {t.to}
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onUpdateDraftZone?.({ endDate: e.target.value })}
                  className="w-full bg-zinc-950/90 border border-white/10 focus:border-cyan-400/60 rounded-xl px-2.5 py-1.5 text-xs font-mono text-zinc-100 focus:outline-none"
                />
              </label>
            </div>

            {!dateValidation.valid && (
              <div className="rounded-xl bg-rose-950/50 border border-rose-500/40 px-3 py-2 text-[11px] text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-300" />
                <span>{dateValidation.error}</span>
              </div>
            )}

            {dateValidation.valid && dateValidation.warning && (
              <div className="rounded-xl bg-amber-950/40 border border-amber-500/35 px-3 py-2 text-[11px] text-amber-200 leading-snug">
                {dateValidation.warning}
              </div>
            )}

            {/* Slider de caja (20–60 km calibrado por specs) */}
            <div>
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1.5">
                <span>{t.boxSize}</span>
                <span className="font-mono text-zinc-100">{boxKm} × {boxKm} km</span>
              </div>
              <input
                type="range"
                min={20}
                max={60}
                step={5}
                value={boxKm}
                onChange={(e) => onUpdateDraftZone?.({ boxKm: parseInt(e.target.value, 10) })}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Aviso de escala si el usuario eligió una capa satelital desde resultados */}
            {activeLayerId !== 'truecolor' && layerNote && (
              <div className="rounded-xl bg-zinc-950/75 border border-white/10 px-3 py-2 text-[10px] font-mono text-zinc-400 leading-snug">
                {activeLayerObj.label}: {layerNote}
              </div>
            )}

            {/* Acciones */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={!selectedPlace || !dateValidation.valid}
                onClick={() => commitPlaceAction('3d')}
                className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-semibold text-xs transition-colors shadow-lg"
              >
                {t.analyzeDirect3d}
              </button>

              <button
                type="button"
                disabled={!selectedPlace}
                onClick={() => commitPlaceAction('globe')}
                className="w-full py-2.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 disabled:opacity-45 border border-white/15 text-zinc-100 font-medium text-xs transition-colors inline-flex items-center justify-center gap-2"
              >
                <Globe2 className="w-3.5 h-3.5 text-cyan-300" />
                {t.frameInEarthEngine}
              </button>

              <button
                type="button"
                disabled
                title="Disponible en Fase 4"
                className="w-full py-2 rounded-xl bg-zinc-950/40 border border-white/10 text-zinc-500 text-[11px] inline-flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Sparkles className="w-3 h-3" />
                {t.agentSoonBtn}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {!isExpanded && (
        <div className="pointer-events-none absolute bottom-4 right-5 text-[11px] font-mono text-zinc-500">
          {apiMode === 'local' ? t.liveLocal : t.liveWeb} · {t.wmtsNote}
        </div>
      )}
    </div>
  );
}
