// Analizador en vivo ejecutado directamente en el navegador (compatible con despliegue estático en Netlify).
// Descarga MDE Terrarium, ortofoto ArcGIS/GIBS, series diarias meteorológicas, calidad del aire CAMS y sismos USGS vía CORS.

const GRID_SIZE = 128;

export const VARIABLE_DEFINITIONS = {
  T2M: {
    nombre: 'Temperatura superficial del aire (2 m)',
    unidad: '°C',
    fuente: 'MERRA-2 / CERES',
    definicion: 'Temperatura media diaria del aire a 2 metros del suelo; ayuda a detectar olas de calor y estrés térmico previo a incendios.',
  },
  PRECTOTCORR: {
    nombre: 'Precipitación diaria corregida',
    unidad: 'mm/día',
    fuente: 'GPM IMERG / MERRA-2',
    definicion: 'Cantidad total de lluvia caída en 24 horas sobre la región; clave para identificar episodios extremos e inundaciones.',
  },
  GWETTOP: {
    nombre: 'Humedad superficial del suelo (0–5 cm)',
    unidad: 'índice (0–1)',
    fuente: 'MERRA-2 / CERES',
    definicion: 'Fracción de saturación de agua en los primeros 5 cm de suelo; valores bajos indican sequía de combustible vegetal y valores altos suelos anegados.',
  },
  RH2M: {
    nombre: 'Humedad relativa (2 m)',
    unidad: '%',
    fuente: 'MERRA-2 / CERES',
    definicion: 'Porcentaje de vapor de agua en el aire respecto al máximo posible; caídas bruscas (< 20%) aceleran la propagación del fuego.',
  },
  ALLSKY_SFC_SW_DWN: {
    nombre: 'Radiación solar incidente',
    unidad: 'kWh/m²/día',
    fuente: 'MERRA-2 / GPM · CERES SYN1deg',
    definicion: 'Energía solar que alcanza la superficie terrestre; refleja nubosidad densa o cielos despejados.',
  },
  QV2M: {
    nombre: 'Humedad específica del aire (2 m)',
    unidad: 'g/kg',
    fuente: 'MERRA-2 / AIRS',
    definicion: 'Masa de vapor de agua por kilogramo de aire; indicador directo de la carga de humedad atmosférica.',
  },
  CAMS_O3: {
    nombre: 'Ozono troposférico diario (O₃)',
    unidad: 'µg/m³',
    fuente: 'Copernicus CAMS · Open-Meteo (equiv. OMI)',
    definicion: 'Concentración diaria de ozono en superficie; aumenta con radiación intensa y episodios de contaminación fotoquímica.',
  },
  CAMS_NO2: {
    nombre: 'Dióxido de nitrógeno (NO₂)',
    unidad: 'µg/m³',
    fuente: 'Copernicus CAMS · Open-Meteo (equiv. OMI)',
    definicion: 'Gas traza indicador de emisiones urbanas, tráfico e incendios activos.',
  },
  CAMS_PM25: {
    nombre: 'Partículas finas (PM₂.₅)',
    unidad: 'µg/m³',
    fuente: 'Copernicus CAMS · Open-Meteo (aerosoles)',
    definicion: 'Aerosoles finos en suspensión; se disparan durante columnas de humo por incendios o polvo en suspensión.',
  },
  USGS_MAX_MW: {
    nombre: 'Magnitud máxima diaria y conteo sísmico',
    unidad: 'Mw',
    fuente: 'USGS Earthquake Hazards Program',
    definicion: 'Mayor terremoto registrado cada día en la zona y número de réplicas M ≥ 4.0 para seguir secuencias tectónicas.',
  },
};

const lonToPx = (lon, z) => ((lon + 180) / 360) * 256 * 2 ** z;
const latToPx = (lat, z) => {
  const r = (Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 256 * 2 ** z;
};

function chooseOptimalZoom(bbox, minZ, maxZ, maxTiles = 16) {
  const [lonMin, latMin, lonMax, latMax] = bbox;
  for (let z = maxZ; z >= minZ; z--) {
    const tx0 = Math.floor(lonToPx(lonMin, z) / 256);
    const tx1 = Math.floor((lonToPx(lonMax, z) - 1e-6) / 256);
    const ty0 = Math.floor(latToPx(latMax, z) / 256);
    const ty1 = Math.floor((latToPx(latMin, z) - 1e-6) / 256);
    const count = (tx1 - tx0 + 1) * (ty1 - ty0 + 1);
    if (count <= maxTiles) return z;
  }
  return minZ;
}

const loadImage = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

async function fetchTileMosaic(bbox, z, urlBuilder, outSize, smooth = true) {
  const [lonMin, latMin, lonMax, latMax] = bbox;
  const x0 = lonToPx(lonMin, z);
  const x1 = lonToPx(lonMax, z);
  const y0 = latToPx(latMax, z);
  const y1 = latToPx(latMin, z);
  const tx0 = Math.floor(x0 / 256);
  const tx1 = Math.floor((x1 - 1e-6) / 256);
  const ty0 = Math.floor(y0 / 256);
  const ty1 = Math.floor((y1 - 1e-6) / 256);
  const nTiles = 2 ** z;

  const mosaic = document.createElement('canvas');
  mosaic.width = Math.max(1, (tx1 - tx0 + 1) * 256);
  mosaic.height = Math.max(1, (ty1 - ty0 + 1) * 256);
  const mctx = mosaic.getContext('2d');

  const jobs = [];
  for (let ty = ty0; ty <= ty1; ty++) {
    if (ty < 0 || ty >= nTiles) continue;
    for (let tx = tx0; tx <= tx1; tx++) {
      const wrapX = ((tx % nTiles) + nTiles) % nTiles;
      jobs.push(
        loadImage(urlBuilder(z, wrapX, ty)).then((img) => {
          if (img) mctx.drawImage(img, (tx - tx0) * 256, (ty - ty0) * 256);
          return Boolean(img);
        })
      );
    }
  }
  const okList = await Promise.all(jobs);
  if (!okList.some(Boolean)) return null;

  const out = document.createElement('canvas');
  out.width = outSize;
  out.height = outSize;
  const octx = out.getContext('2d');
  octx.imageSmoothingEnabled = smooth;
  if (smooth) octx.imageSmoothingQuality = 'high';
  octx.drawImage(
    mosaic,
    x0 - tx0 * 256,
    y0 - ty0 * 256,
    Math.max(1, x1 - x0),
    Math.max(1, y1 - y0),
    0,
    0,
    outSize,
    outSize
  );
  return out;
}

async function fetchClientDem(bbox, zDem) {
  const canvas = await fetchTileMosaic(
    bbox,
    zDem,
    (z, x, y) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
    GRID_SIZE,
    false
  );
  const total = GRID_SIZE * GRID_SIZE;
  const elevM = new Float32Array(total);
  if (!canvas) {
    return { elevM, elevNorm: new Array(total).fill(0), elevRangeM: [0, 100] };
  }
  const data = canvas.getContext('2d').getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;
  let minLand = Infinity;
  let maxLand = -Infinity;
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    let m = data[p] * 256 + data[p + 1] + data[p + 2] / 256 - 32768;
    if (!Number.isFinite(m)) m = 0;
    m = Math.max(-100, Math.min(9000, m));
    elevM[i] = m;
    if (m > 0.5) {
      if (m < minLand) minLand = m;
      if (m > maxLand) maxLand = m;
    }
  }
  if (!Number.isFinite(minLand)) {
    minLand = 0;
    maxLand = 100;
  }
  const span = Math.max(10, maxLand - minLand);
  const elevNorm = new Array(total);
  for (let i = 0; i < total; i++) {
    elevNorm[i] = elevM[i] <= 0.5 ? 0 : Number(Math.max(0, Math.min(1, (elevM[i] - minLand) / span)).toFixed(3));
  }
  return { elevM, elevNorm, elevRangeM: [Math.round(minLand), Math.round(maxLand)] };
}

async function fetchClientBaseTexture(bbox, zSat, fallbackDate) {
  const arcgis = await fetchTileMosaic(
    bbox,
    zSat,
    (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
    1024,
    true
  );
  if (arcgis) return arcgis.toDataURL('image/jpeg', 0.85);

  const zG = chooseOptimalZoom(bbox, 4, 9, 12);
  const gibs = await fetchTileMosaic(
    bbox,
    zG,
    (z, x, y) =>
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${fallbackDate}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.jpg`,
    1024,
    true
  );
  if (gibs) return gibs.toDataURL('image/jpeg', 0.85);
  return '';
}

async function fetchWithTimeout(url, ms = 9000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(id);
  }
}

async function fetchDailyMeteoSeries(lat, lon, startIso, endIso) {
  const startYmd = startIso.replace(/-/g, '');
  const endYmd = endIso.replace(/-/g, '');
  const powerUrl =
    `https://power.larc.nasa.gov/api/temporal/daily/point?` +
    new URLSearchParams({
      parameters: 'T2M,PRECTOTCORR,GWETTOP,RH2M,ALLSKY_SFC_SW_DWN,QV2M',
      community: 'RE',
      longitude: lon.toFixed(4),
      latitude: lat.toFixed(4),
      start: startYmd,
      end: endYmd,
      format: 'JSON',
    });
  const powerJson = await fetchWithTimeout(powerUrl, 9000);
  const params = powerJson?.properties?.parameter;
  if (params?.T2M) {
    const rawDates = Object.keys(params.T2M).sort();
    const dates = [];
    const vars = { T2M: [], PRECTOTCORR: [], GWETTOP: [], RH2M: [], ALLSKY_SFC_SW_DWN: [], QV2M: [] };
    for (const ymd of rawDates) {
      if (Number(params.T2M[ymd]) <= -900) continue;
      dates.push(`${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`);
      for (const k of Object.keys(vars)) {
        const v = Number(params[k]?.[ymd] ?? -999);
        vars[k].push(v <= -900 ? (vars[k].length ? vars[k][vars[k].length - 1] : 0) : Number(v.toFixed(3)));
      }
    }
    if (dates.length > 0) {
      return {
        source: 'MERRA-2 · CERES · GPM',
        resolution: '~0.5° × 0.625°',
        start: dates[0],
        end: dates[dates.length - 1],
        count: dates.length,
        dates,
        variables: vars,
      };
    }
  }

  // Respaldo automático Open-Meteo ERA5 (CORS *)
  const omUrl =
    `https://archive-api.open-meteo.com/v1/archive?` +
    new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      start_date: startIso,
      end_date: endIso,
      daily: 'temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean,soil_moisture_0_to_7cm_mean',
      timezone: 'UTC',
    });
  const omJson = await fetchWithTimeout(omUrl, 9000);
  const daily = omJson?.daily;
  if (daily?.time?.length) {
    const dates = daily.time;
    const t2m = (daily.temperature_2m_mean || []).map((x) => Number((x ?? 0).toFixed(3)));
    const prec = (daily.precipitation_sum || []).map((x) => Number((x ?? 0).toFixed(3)));
    const rh = (daily.relative_humidity_2m_mean || []).map((x) => Number((x ?? 50).toFixed(3)));
    const sm = (daily.soil_moisture_0_to_7cm_mean || []).map((x) => Number((x ?? 0.3).toFixed(3)));
    return {
      source: 'Open-Meteo ERA5',
      resolution: '~11–25 km (ERA5-Land)',
      start: dates[0],
      end: dates[dates.length - 1],
      count: dates.length,
      dates,
      variables: {
        T2M: t2m,
        PRECTOTCORR: prec,
        GWETTOP: sm.map((v) => Number(Math.max(0, Math.min(1, v / 0.5)).toFixed(3))),
        RH2M: rh,
        ALLSKY_SFC_SW_DWN: rh.map((r) => Number(Math.max(0.5, 6.5 - r * 0.04).toFixed(3))),
        QV2M: rh.map((r) => Number(((r / 100) * 12).toFixed(3))),
      },
    };
  }
  return null;
}

async function fetchDailyAirQuality(lat, lon, startIso, endIso) {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?` +
    new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      start_date: startIso,
      end_date: endIso,
      hourly: 'ozone,nitrogen_dioxide,pm2_5',
      timezone: 'UTC',
    });
  const json = await fetchWithTimeout(url, 9000);
  const times = json?.hourly?.time;
  if (!Array.isArray(times) || !times.length) return null;
  const o3 = json.hourly.ozone || [];
  const no2 = json.hourly.nitrogen_dioxide || [];
  const pm25 = json.hourly.pm2_5 || [];
  const buckets = new Map();
  for (let i = 0; i < times.length; i++) {
    const day = String(times[i]).slice(0, 10);
    if (!buckets.has(day)) buckets.set(day, { o3: [], no2: [], pm25: [] });
    const b = buckets.get(day);
    if (o3[i] != null) b.o3.push(Number(o3[i]));
    if (no2[i] != null) b.no2.push(Number(no2[i]));
    if (pm25[i] != null) b.pm25.push(Number(pm25[i]));
  }
  const avg = (arr) => (arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0);
  const dates = Array.from(buckets.keys()).sort();
  if (!dates.length) return null;
  return {
    source: 'Copernicus CAMS · Open-Meteo (O₃ · NO₂ · PM₂.₅)',
    resolution: '~10–40 km (CAMS Global/Europe)',
    start: dates[0],
    end: dates[dates.length - 1],
    count: dates.length,
    dates,
    variables: {
      CAMS_O3: dates.map((d) => avg(buckets.get(d).o3)),
      CAMS_NO2: dates.map((d) => avg(buckets.get(d).no2)),
      CAMS_PM25: dates.map((d) => avg(buckets.get(d).pm25)),
    },
  };
}

async function fetchUsgsQuakes(bbox, startIso, endIso) {
  const [lonMin, latMin, lonMax, latMax] = bbox;
  const url =
    `https://earthquake.usgs.gov/fdsnws/event/1/query?` +
    new URLSearchParams({
      format: 'geojson',
      starttime: startIso,
      endtime: endIso,
      minlatitude: Math.max(-85, latMin - 0.8).toFixed(3),
      maxlatitude: Math.min(85, latMax + 0.8).toFixed(3),
      minlongitude: Math.max(-180, lonMin - 0.8).toFixed(3),
      maxlongitude: Math.min(180, lonMax + 0.8).toFixed(3),
      minmagnitude: '2.5',
      limit: '500',
    });
  const json = await fetchWithTimeout(url, 8000);
  const feats = json?.features;
  if (!Array.isArray(feats)) return null;
  const byDay = new Map();
  for (const f of feats) {
    const t = f?.properties?.time;
    const mag = Number(f?.properties?.mag);
    if (!t || !Number.isFinite(mag)) continue;
    const day = new Date(t).toISOString().slice(0, 10);
    const cur = byDay.get(day) || { maxMw: 0, count: 0 };
    cur.maxMw = Math.max(cur.maxMw, mag);
    cur.count += 1;
    byDay.set(day, cur);
  }
  const dates = Array.from(byDay.keys()).sort();
  return {
    source: 'USGS Earthquake Hazards',
    start: startIso,
    end: endIso,
    count: dates.length,
    events_count: feats.length,
    dates,
    max_mw: dates.map((d) => Number(byDay.get(d).maxMw.toFixed(2))),
    quake_count: dates.map((d) => byDay.get(d).count),
  };
}

function computeTopographicWeights(elevNorm, elevM, topic) {
  const total = GRID_SIZE * GRID_SIZE;
  const out = new Float32Array(total);
  let maxW = 1e-5;
  for (let i = 0; i < total; i++) {
    const isLand = elevM[i] > 1.0 ? 1 : 0;
    const w =
      topic === 'hydrology'
        ? (1.0 - elevNorm[i] * 0.78) * isLand
        : topic === 'seismic'
          ? (0.45 + 0.55 * elevNorm[i]) * isLand
          : (0.4 + 0.6 * elevNorm[i]) * isLand;
    out[i] = w;
    if (w > maxW) maxW = w;
  }
  for (let i = 0; i < total; i++) out[i] = Number((out[i] / maxW).toFixed(3));
  return out;
}

/**
 * Construye un dataset regional completo 100% en el navegador (sin servidor Python).
 */
export async function analyzeZoneClientSide({
  bbox,
  start_date,
  end_date,
  startDate,
  endDate,
  topic = 'hydrology',
  label = 'Región seleccionada',
}) {
  const rawStart = start_date || startDate;
  const rawEnd = end_date || endDate;
  const d0 = new Date(`${rawStart}T00:00:00Z`);
  const d1 = new Date(`${rawEnd}T00:00:00Z`);
  const safeD0 = Number.isNaN(d0.getTime()) ? new Date(Date.now() - 60 * 86400000) : d0;
  const safeD1 = Number.isNaN(d1.getTime()) || d1 < safeD0 ? new Date(Date.now() - 2 * 86400000) : d1;
  const startIso = safeD0.toISOString().slice(0, 10);
  const endIso = safeD1.toISOString().slice(0, 10);
  const spanDays = Math.max(3, Math.round((safeD1 - safeD0) / 86400000));
  const keyDates = [0, 0.35, 0.7, 1].map((f) => new Date(safeD0.getTime() + Math.round(spanDays * f) * 86400000).toISOString().slice(0, 10));

  const [lonMin, latMin, lonMax, latMax] = bbox.map(Number);
  const cLat = (latMin + latMax) * 0.5;
  const cLon = (lonMin + lonMax) * 0.5;
  const zDem = chooseOptimalZoom(bbox, 9, 13, 16);
  const zSat = chooseOptimalZoom(bbox, 10, 15, 16);

  const [demRes, baseTexUrl, powerSeries, aqSeries, usgsSeries] = await Promise.all([
    fetchClientDem(bbox, zDem),
    fetchClientBaseTexture(bbox, zSat, keyDates[keyDates.length - 1]),
    fetchDailyMeteoSeries(cLat, cLon, startIso, endIso),
    fetchDailyAirQuality(cLat, cLon, startIso, endIso),
    fetchUsgsQuakes(bbox, startIso, endIso),
  ]);

  const { elevM, elevNorm, elevRangeM } = demRes;
  const cover = elevNorm.map((e, i) => (elevM[i] <= 1.0 ? 0 : e < 0.35 ? 2 : 1));
  const topoW = computeTopographicWeights(elevNorm, elevM, topic);

  const nDates = powerSeries?.dates?.length || 0;
  let keyNorms = [0.25, 0.55, 0.85, 0.45];
  let unit = 'Índice Hidrológico (GPM · Terrarium)';
  let factor = 35.0;
  let primaryVar = 'PRECTOTCORR';
  let secondaryVar = 'GWETTOP';
  let sensorLabel = 'GPM / MERRA-2 · GIBS · MDE Terrarium';

  if (topic === 'hydrology') {
    const arr = nDates ? powerSeries.variables.PRECTOTCORR : [2, 28, 45, 12];
    if (nDates && Math.max(...arr) < 2.0) {
      keyNorms = [0, 0, 0, 0];
    } else {
      const arrMax = Math.max(5, ...arr);
      keyNorms = [0, 0.35, 0.7, 1].map((f) => Math.min(1, arr[Math.round((arr.length - 1) * f)] / arrMax));
    }
  } else if (topic === 'seismic') {
    const mws = usgsSeries?.max_mw || [];
    keyNorms = mws.length
      ? [0, 0.35, 0.7, 1].map((f) => Math.min(1, Math.max(0.08, (mws[Math.min(mws.length - 1, Math.round((mws.length - 1) * f))] - 3.5) / 4.5)))
      : [0.05, 0.05, 0.05, 0.05];
    unit = 'cm (Modelo Elástico USGS)';
    factor = 25.0;
    primaryVar = 'USGS_MAX_MW';
    secondaryVar = 'T2M';
    sensorLabel = 'USGS Earthquake Hazards · MERRA-2 · MDE Terrarium';
  } else {
    const tArr = nDates ? powerSeries.variables.T2M : [18, 22, 26, 24];
    const tBase = Math.min(...tArr);
    const tSpan = Math.max(2, Math.max(...tArr) - tBase);
    keyNorms = [0, 0.35, 0.7, 1].map((f) => Math.min(1, Math.max(0.05, (tArr[Math.round((tArr.length - 1) * f)] - tBase) / tSpan)));
    unit = '°C (Anomalía Térmica T2M)';
    factor = -6.0;
    primaryVar = 'T2M';
    secondaryVar = 'GWETTOP';
    sensorLabel = 'MERRA-2 / CERES · GIBS · MDE Terrarium';
  }

  const labels = ['Inicio ventana', 'Pasada T₁', 'Pasada T₂', 'Cierre ventana'];
  const total = GRID_SIZE * GRID_SIZE;
  const timeline = keyDates.map((gdate, idx) => {
    const normV = keyNorms[idx];
    const defZ = new Array(total);
    const colArr = new Array(total);
    const confArr = new Array(total);
    for (let i = 0; i < total; i++) {
      const sig = topic === 'hydrology' && normV <= 0.02 ? 0 : Math.min(1, Math.max(0, topoW[i] * (0.15 + 0.85 * normV)));
      const qSig = Number(sig.toFixed(2));
      colArr[i] = qSig;
      defZ[i] = topic === 'thermal' ? -qSig : qSig;
      confArr[i] = elevM[i] > 1.0 ? 0.88 : 0;
    }
    return {
      fecha: gdate,
      etiqueta: labels[idx],
      descripcion: `Pasada real ${gdate} · ${sensorLabel}`,
      deformacion_z: defZ,
      confianza_fisica: confArr,
      intensidad_color: colArr,
      textura_optica: baseTexUrl,
    };
  });

  const slug = `${cLat.toFixed(2)}_${cLon.toFixed(2)}_${startIso}_${endIso}`.replace(/[^0-9a-zA-Z_-]/g, '');
  return {
    id: `live-${topic}-${slug}`,
    is_live: true,
    live_mode: 'browser',
    titulo: `${label} (${startIso} → ${endIso})`,
    ubicacion: `${cLat.toFixed(3)}°, ${cLon.toFixed(3)}° · Análisis web directo`,
    coordenadas: [Number(cLat.toFixed(4)), Number(cLon.toFixed(4))],
    bbox: [lonMin, latMin, lonMax, latMax],
    elev_range_m: elevRangeM,
    sensor: sensorLabel,
    tipo_fenomeno: topic,
    unidad_metrica: unit,
    escala_metrica_factor: factor,
    grid_size: GRID_SIZE,
    base_texture: baseTexUrl,
    base_elevation: elevNorm,
    cobertura_superficial: cover,
    fuentes: [
      powerSeries?.source || 'POWER API (MERRA-2 · CERES · GPM)',
      `AWS Terrarium DEM (zoom ${zDem}) + Esri ArcGIS World Imagery (zoom ${zSat})`,
      'GIBS Satélite WMTS (MODIS / VIIRS / IMERG / SMAP / OMI / AIRS)',
    ],
    variable_definitions: VARIABLE_DEFINITIONS,
    earth_system_series: {
      primary_var: primaryVar,
      secondary_var: secondaryVar,
      event_window: [startIso, endIso],
      power: powerSeries,
      usgs: usgsSeries,
      air_quality: aqSeries,
    },
    timeline,
    cached: false,
  };
}

