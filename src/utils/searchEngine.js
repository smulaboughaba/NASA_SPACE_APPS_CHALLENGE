import { GIBS_LAYERS } from './gibsLayers';
import { VARIABLE_DEFINITIONS } from './liveZoneClient';

const HISTORY_KEY = 'geowave.search_history.v1';
const geocodeCache = new Map();
let lastNominatimAt = 0;

export function formatDateOffset(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildRegionalBbox(lat, lon, widthKm = 36) {
  const halfLat = widthKm / 2 / 111.32;
  const cosLat = Math.max(0.25, Math.cos((lat * Math.PI) / 180));
  const halfLon = widthKm / 2 / (111.32 * cosLat);
  return [
    Number((lon - halfLon).toFixed(4)),
    Number(Math.max(-82, lat - halfLat).toFixed(4)),
    Number((lon + halfLon).toFixed(4)),
    Number(Math.min(82, lat + halfLat).toFixed(4)),
  ];
}

export function parseCoordinates(raw) {
  if (!raw) return null;
  const clean = raw.trim().replace(/[()°]/g, ' ').replace(/\s+/g, ' ');

  // Formato decimal: "39.47, -0.38" o "39.47 -0.38"
  const dec = clean.match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (dec) {
    const lat = parseFloat(dec[1]);
    const lon = parseFloat(dec[2]);
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= -85 && lat <= 85 && lon >= -180 && lon <= 180) {
      return { lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)) };
    }
  }

  // Formato con cardinales: "34.07N 118.58W" o "36.69 N, 4.50 W"
  const card = clean.match(/^(\d{1,2}(?:\.\d+)?)\s*([NSns])\s*[,;\s]\s*(\d{1,3}(?:\.\d+)?)\s*([EWew])$/);
  if (card) {
    let lat = parseFloat(card[1]);
    let lon = parseFloat(card[3]);
    if (card[2].toUpperCase() === 'S') lat = -lat;
    if (card[4].toUpperCase() === 'W') lon = -lon;
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= -85 && lat <= 85 && lon >= -180 && lon <= 180) {
      return { lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)) };
    }
  }

  return null;
}

const LAYER_KEYWORDS = {
  truecolor: ['color real', 'true color', 'modis', 'nubes', 'clouds', 'humo', 'smoke', 'optico', 'óptico'],
  truecolor_viirs: ['viirs', 'suomi', 'tarde', 'afternoon', 'optico'],
  bands721: ['falso color', 'false color', '7-2-1', 'incendio', 'fuego', 'fire', 'quemado', 'swir', 'cicatriz'],
  precip: ['lluvia', 'rain', 'precipitacion', 'precipitación', 'imerg', 'gpm', 'tormenta', 'dana', 'inundacion'],
  lst: ['temperatura', 'temp', 'lst', 'calor', 'heat', 'termico', 'térmico', 'superficie'],
  ndvi: ['vegetacion', 'vegetación', 'ndvi', 'bosque', 'forest', 'agricultura', 'sequia', 'sequía', 'clorofila'],
  soil: ['humedad', 'soil', 'moisture', 'suelo', 'smap', 'raices', 'raíces', 'barro'],
  aod: ['aerosol', 'aerosoles', 'aod', 'polvo', 'dust', 'humo', 'calima', 'particulas', 'partículas'],
  co: ['co ', 'monoxido', 'monóxido', 'airs', 'combustion', 'combustión'],
  co2: ['co2', 'co₂', 'dioxido de carbono', 'dióxido de carbono', 'oco-2', 'carbono'],
  no2: ['no2', 'no₂', 'dioxido de nitrogeno', 'dióxido de nitrógeno', 'omi', 'trafico', 'tráfico', 'emisiones'],
  o3: ['o3', 'o₃', 'ozono', 'ozone', 'omi'],
  snow: ['nieve', 'snow', 'ndsi', 'hielo', 'glaciar'],
};

const TOPIC_DEFAULT_LAYER = {
  hydrology: 'precip',
  thermal: 'bands721',
  seismic: 'truecolor',
};

export function getSuggestedLayerForTopic(topic) {
  return TOPIC_DEFAULT_LAYER[topic] || 'truecolor';
}

export const LAYER_SCALE_META = {
  truecolor: { tier: 'high', latencyDays: 0, noteEs: 'Alta resolución (~250 m) · ideal 20–60 km', noteEn: 'High resolution (~250 m) · ideal 20–60 km' },
  truecolor_viirs: { tier: 'high', latencyDays: 2, noteEs: 'Alta resolución (~375 m) · cobertura reciente puede tener desfase', noteEn: 'High resolution (~375 m) · recent dates may lag' },
  bands721: { tier: 'high', latencyDays: 0, noteEs: 'Falso color (~500 m) · ideal cicatrices e incendios', noteEn: 'False color (~500 m) · ideal scars & fires' },
  ndvi: { tier: 'high', latencyDays: 8, noteEs: 'Compuesto 8 días (~250 m) · disponible desde Feb 2025', noteEn: '8-day composite (~250 m) · available since Feb 2025' },
  snow: { tier: 'high', latencyDays: 1, noteEs: 'Resolución ~500 m · nieve y alta montaña', noteEn: 'Resolution ~500 m · snow & alpine cover' },
  lst: { tier: 'medium', latencyDays: 2, noteEs: 'Resolución ~1 km · huecos indican nubosidad', noteEn: 'Resolution ~1 km · gaps indicate clouds' },
  soil: { tier: 'coarse', latencyDays: 3, noteEs: 'Escala ~9 km (3–6 px en caja) · latencia ~2–3 días', noteEn: 'Scale ~9 km (3–6 px in box) · ~2–3d latency' },
  aod: { tier: 'coarse', latencyDays: 1, noteEs: 'Escala ~10 km (bloques regionales en 36 km)', noteEn: 'Scale ~10 km (regional blocks in 36 km)' },
  precip: { tier: 'coarse', latencyDays: 1, noteEs: 'Escala ~11 km IMERG (~3–5 px reales en caja)', noteEn: 'Scale ~11 km IMERG (~3–5 native px in box)' },
  co2: { tier: 'sparse', latencyDays: 90, noteEs: 'Franjas estrechas OCO-2 · latencia de meses (muchos días sin pasada)', noteEn: 'Narrow OCO-2 swaths · multi-month latency' },
  no2: { tier: 'synoptic', latencyDays: 8, noteEs: 'Escala sinóptica ~13×24 km (1–2 celdas cubren la caja) · ~8d latencia', noteEn: 'Synoptic ~13×24 km (1–2 cells cover box) · ~8d latency' },
  o3: { tier: 'synoptic', latencyDays: 8, noteEs: 'Escala sinóptica ~25 km (contexto regional) · ~8d latencia', noteEn: 'Synoptic ~25 km (regional context) · ~8d latency' },
  co: { tier: 'synoptic', latencyDays: 8, noteEs: 'Escala global ~1° (~110 km · 1 celda cubre la caja)', noteEn: 'Global scale ~1° (~110 km · 1 cell covers box)' },
};

export function searchLocalCatalog(query, scenarios = []) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return { layers: [], scenarios: [], variables: [] };

  const layers = GIBS_LAYERS.filter((l) => {
    const kws = LAYER_KEYWORDS[l.id] || [];
    return (
      l.label.toLowerCase().includes(q) ||
      l.short.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      kws.some((k) => k.includes(q) || q.includes(k.trim()))
    );
  }).slice(0, 6);

  const matchedScenarios = scenarios.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.shortLabel.toLowerCase().includes(q) ||
      s.regionDate.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q)
  );

  const matchedVars = Object.entries(VARIABLE_DEFINITIONS)
    .filter(([key, def]) => key.toLowerCase().includes(q) || def.nombre.toLowerCase().includes(q))
    .slice(0, 4)
    .map(([key, def]) => ({ key, ...def }));

  return { layers, scenarios: matchedScenarios, variables: matchedVars };
}

export async function geocodePlaces(query, lang = 'es', signal) {
  const q = (query || '').trim();
  if (q.length < 2) return { status: 'idle', items: [] };

  const coords = parseCoordinates(q);
  if (coords) {
    return {
      status: 'ok',
      items: [
        {
          id: `coord-${coords.lat}-${coords.lon}`,
          label: `${coords.lat}°, ${coords.lon}°`,
          sublabel: lang === 'en' ? 'Exact coordinates' : 'Coordenadas exactas',
          lat: coords.lat,
          lon: coords.lon,
          isCoord: true,
        },
      ],
    };
  }

  const cacheKey = `${lang}:${q.toLowerCase()}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  // Respetar política Nominatim (máx 1 req/s)
  const waitMs = Math.max(0, 1050 - (Date.now() - lastNominatimAt));
  if (waitMs > 0) {
    await new Promise((r) => setTimeout(r, waitMs));
    if (signal?.aborted) return { status: 'aborted', items: [] };
  }
  lastNominatimAt = Date.now();

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`,
      {
        signal,
        headers: { 'Accept-Language': lang === 'en' ? 'en' : 'es' },
      }
    );
    if (res.status === 429) {
      return { status: 'rate_limit', items: [] };
    }
    if (!res.ok) {
      return { status: 'error', items: [] };
    }
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) {
      const emptyRes = { status: 'empty', items: [] };
      geocodeCache.set(cacheKey, emptyRes);
      return emptyRes;
    }

    const items = list.map((item, idx) => {
      const parts = (item.display_name || q).split(',').map((s) => s.trim());
      return {
        id: `${item.place_id || idx}`,
        label: parts.slice(0, 2).join(', ') || q,
        sublabel: parts.slice(2, 4).join(', '),
        lat: Number(parseFloat(item.lat).toFixed(4)),
        lon: Number(parseFloat(item.lon).toFixed(4)),
        type: item.type || item.class || '',
      };
    });
    const okRes = { status: 'ok', items };
    geocodeCache.set(cacheKey, okRes);
    return okRes;
  } catch (err) {
    if (err?.name === 'AbortError') return { status: 'aborted', items: [] };
    return { status: 'error', items: [] };
  }
}

export function validateDateWindow(startDate, endDate, gibsLayerId = 'truecolor', lang = 'es') {
  const isEn = lang === 'en';
  if (!startDate || !endDate) {
    return { valid: false, error: isEn ? 'Select both start and end dates.' : 'Selecciona fecha de inicio y fin.', warning: '' };
  }
  const d0 = new Date(`${startDate}T00:00:00Z`);
  const d1 = new Date(`${endDate}T00:00:00Z`);
  const todayIso = new Date().toISOString().slice(0, 10);
  const today = new Date(`${todayIso}T00:00:00Z`);

  if (Number.isNaN(d0.getTime()) || Number.isNaN(d1.getTime())) {
    return { valid: false, error: isEn ? 'Invalid date format.' : 'Formato de fecha inválido.', warning: '' };
  }
  if (d0 >= d1) {
    return { valid: false, error: isEn ? '"From" date must be earlier than "To" date.' : 'La fecha "Desde" debe ser anterior a "Hasta".', warning: '' };
  }
  if (d1 > today) {
    return { valid: false, error: isEn ? 'End date cannot be in the future.' : 'La fecha final no puede ser futura.', warning: '' };
  }
  const spanDays = Math.round((d1 - d0) / 86400000);
  if (spanDays < 7) {
    return { valid: false, error: isEn ? 'Minimum window is 7 days for time-series analysis.' : 'La ventana mínima es de 7 días para analizar tendencias.', warning: '' };
  }
  if (spanDays > 180) {
    return { valid: false, error: isEn ? 'Maximum window is 180 days per analysis.' : 'La ventana máxima es de 180 días por análisis.', warning: '' };
  }

  let warning = '';
  const daysFromToday = Math.round((today - d1) / 86400000);
  const meta = LAYER_SCALE_META[gibsLayerId];
  if (meta?.latencyDays > 0 && daysFromToday < meta.latencyDays) {
    warning = isEn
      ? `Note: selected layer typically publishes with ~${meta.latencyDays}d latency; most recent days may appear empty.`
      : `Aviso: esta capa tiene una latencia habitual de ~${meta.latencyDays} días; los últimos días pueden llegar sin datos.`;
  } else if (daysFromToday < 4) {
    warning = isEn
      ? 'Recent 2–4 days may have partial climate or daily satellite gaps.'
      : 'Los últimos 2–4 días pueden tener huecos parciales en series climáticas o capas con retardo.';
  }

  return { valid: true, error: '', warning, spanDays };
}

export function loadSearchHistory() {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function saveSearchHistoryItem(item) {
  if (!item || !Number.isFinite(item.lat) || !Number.isFinite(item.lon)) return [];
  try {
    const cur = loadSearchHistory().filter(
      (x) => Math.abs(x.lat - item.lat) > 0.01 || Math.abs(x.lon - item.lon) > 0.01
    );
    const next = [
      {
        id: item.id || `${item.lat}_${item.lon}`,
        label: item.label,
        sublabel: item.sublabel || '',
        lat: item.lat,
        lon: item.lon,
        isCoord: Boolean(item.isCoord),
      },
      ...cur,
    ].slice(0, 5);
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

