import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, Navigation, Search, X } from 'lucide-react';
import { getCopy } from '../utils/i18n';

function parseCoordinates(raw) {
  const clean = raw.trim().replace(/[()]/g, '');
  const m = clean.match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lon = parseFloat(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -85 || lat > 85 || lon < -180 || lon > 180) {
    return null;
  }
  return { lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)) };
}

export default function LandingHero({
  scenarios = [],
  lang = 'es',
  apiMode = 'web',
  initialQuery = '',
  onSelectLocation,
  onEnterScenario,
}) {
  const t = getCopy(lang);
  const inputRef = useRef(null);
  const [query, setQuery] = useState(initialQuery);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle'); // 'idle' | 'done' | 'empty' | 'error'

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === '/' && document.activeElement?.tagName !== 'INPUT') || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setResults([]);
        setSearchStatus('idle');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const runSearch = async (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;

    const coords = parseCoordinates(q);
    if (coords) {
      setResults([
        {
          id: `coord-${coords.lat}-${coords.lon}`,
          label: `${coords.lat}°, ${coords.lon}°`,
          sublabel: t.coordDetected,
          lat: coords.lat,
          lon: coords.lon,
          isCoord: true,
        },
      ]);
      setSearchStatus('done');
      return;
    }

    setSearching(true);
    setSearchStatus('idle');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': lang === 'en' ? 'en' : 'es' } }
      );
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        setResults(
          list.map((item, idx) => {
            const parts = (item.display_name || q).split(',').map((s) => s.trim());
            return {
              id: `${item.place_id || idx}`,
              label: parts.slice(0, 2).join(', ') || q,
              sublabel: parts.slice(2, 4).join(', '),
              lat: Number(parseFloat(item.lat).toFixed(4)),
              lon: Number(parseFloat(item.lon).toFixed(4)),
            };
          })
        );
        setSearchStatus('done');
      } else {
        setResults([]);
        setSearchStatus('empty');
      }
    } catch {
      setResults([]);
      setSearchStatus('error');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center px-4 select-none">
      <div className="w-full max-w-2xl flex flex-col items-center -mt-6">
        {/* Wordmark integrado Ge[Logo]Wave */}
        <h1
          aria-label="GeWave"
          className="flex items-center justify-center text-zinc-100 font-bold tracking-tight text-5xl sm:text-6xl mb-8 select-none"
        >
          <span>Ge</span>
          <img
            src="/assets/geo-wave-icon-light.png"
            alt="o"
            className="w-16 h-16 sm:w-20 sm:h-20 mx-0.5 object-contain drop-shadow-[0_0_24px_rgba(226,232,240,0.16)]"
          />
          <span>Wave</span>
        </h1>

        {/* Barra de búsqueda Spotlight */}
        <form onSubmit={runSearch} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-400 absolute left-5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setResults([]);
                  setSearchStatus('idle');
                }
              }}
              placeholder={t.searchPlaceholder}
              className="w-full h-12 sm:h-13 rounded-full bg-zinc-900/75 hover:bg-zinc-900/90 focus:bg-zinc-900/95 backdrop-blur-xl border border-white/15 focus:border-white/30 pl-12 pr-12 text-sm text-zinc-100 placeholder:text-zinc-400 shadow-[0_12px_40px_rgba(0,0,0,0.5)] focus:outline-none transition-all"
            />
            {searching ? (
              <Loader2 className="w-4 h-4 text-cyan-300 animate-spin absolute right-5" />
            ) : query ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSearchStatus('idle');
                  inputRef.current?.focus();
                }}
                className="absolute right-4 p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {/* Desplegable de resultados al buscar */}
          {(results.length > 0 || searchStatus === 'empty' || searchStatus === 'error') && (
            <div className="absolute left-0 right-0 mt-2.5 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden z-40">
              {results.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectLocation?.({ ...item, query: query.trim() })}
                      className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-white/[0.06] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.isCoord ? (
                          <Navigation className="w-4 h-4 text-cyan-300 shrink-0" />
                        ) : (
                          <MapPin className="w-4 h-4 text-zinc-400 group-hover:text-cyan-300 shrink-0 transition-colors" />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-100 truncate">{item.label}</div>
                          {item.sublabel && (
                            <div className="text-[11px] text-zinc-400 truncate">{item.sublabel}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="hidden sm:inline text-[11px] font-mono tabular-nums text-zinc-400">
                          {item.lat}°, {item.lon}°
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-200 text-[11px] font-medium group-hover:bg-cyan-400 group-hover:text-zinc-950 transition-colors">
                          {t.openInEarthEngine}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-xs text-zinc-300">
                  {searchStatus === 'error' ? t.searchNetworkErr : t.noResults}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Chips discretos de casos demostrativos */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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
      </div>

      {/* Estado muy sutil esquina inferior derecha */}
      <div className="pointer-events-none absolute bottom-4 right-5 text-[11px] font-mono text-zinc-500">
        {apiMode === 'local' ? t.liveLocal : t.liveWeb} · {t.wmtsNote}
      </div>
    </div>
  );
}

