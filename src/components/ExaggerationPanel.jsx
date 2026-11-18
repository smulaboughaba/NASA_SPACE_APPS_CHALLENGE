import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Check,
  Clock,
  Crosshair,
  Download,
  Flame,
  Info,
  MapPin,
  Pause,
  Play,
  Radio,
  Satellite,
  SlidersHorizontal,
  Upload,
  Waves,
  Eye,
  X,
} from 'lucide-react';
import {
  analyzeEarthSystemSeries,
  computeInstantImpactSummary,
  parseOfficialCsvText,
  translatePixelPhysics,
} from '../utils/sarMath';
import { getGibsLayer } from '../utils/gibsLayers';

const SCENARIO_GUIDES = {
  'los-angeles': {
    subtitle: 'Incendio forestal · California, Estados Unidos · Enero 2025',
    narrativeTitle: 'Un incendio avivado por el viento y la sequía',
    narrativeBody:
      'El 7 de enero de 2025 comenzaron los incendios de Pacific Palisades en los montes de Santa Mónica. Las rachas extremas de Santa Ana y meses sin lluvias aceleraron el frente hacia la costa de Malibú.',
    kpis: [
      { value: '86 km/h', label: 'Racha máxima viento', sub: 'Vientos Santa Ana · 7 ene' },
      { value: '12 %', label: 'Humedad del aire', sub: 'Sequedad extrema · 8 ene' },
      { value: '23.448 ac', label: 'Perímetro oficial NIFC', sub: 'Cicatriz WFIGS verificada' },
      { value: '-8,5 dB', label: 'Pérdida biomasa VH/HV', sub: 'Colapso estructural SAR' },
    ],
    compareLabel1: 'Durante · 10 ene',
    compareIdx1: 2,
    compareLabel2: 'Después · 14 ene',
    compareIdx2: 3,
    subzones: [
      { id: 'palisades', label: 'Palisades', lat: 34.065, lon: -118.532, offset: [3.2, 3.3, 3.8] },
      { id: 'topanga', label: 'Topanga / Malibú', lat: 34.06, lon: -118.645, offset: [3.4, 3.3, 3.8] },
      { id: 'all', label: 'Toda la zona', lat: null, lon: null },
    ],
    findings: [
      {
        title: 'El radar atravesó la pluma de humo',
        body: 'Mientras MODIS óptico quedaba ciego el 10 de enero bajo el humo denso, el SAR delimitó el avance térmico en los cañones.',
      },
      {
        title: 'Validación con perímetro oficial NIFC WFIGS',
        body: 'La pérdida de dispersión volumétrica VH/HV coincide con los 23.448 acres cartografiados sobre el MDE de 0 a 849 m.',
      },
      {
        title: 'Contraste claro frente a laderas intactas',
        body: 'Las crestas no alcanzadas conservan retrodispersión verde estable (~0 dB) y firma espectral sin colapso.',
      },
    ],
    studyNote:
      'El recuadro discontinuo en la malla 3D delimita el frente completo desde Malibú hasta Mandeville Canyon.',
  },
  earthquake: {
    subtitle: 'Megaterremoto tectónico · Kamchatka, Pacífico · Julio–Noviembre 2025',
    narrativeTitle: 'Ruptura cortical Mw 8.8 en la etapa científica NISAR',
    narrativeBody:
      'El 30 de julio de 2025, coincidiendo con el lanzamiento de la misión NISAR (Banda L), un megaterremoto Mw 8.8 y su réplica Mw 7.8 deformaron la costa entre la Bahía de Avacha y Cabo Shipunsky.',
    kpis: [
      { value: 'Mw 8.8', label: 'Magnitud USGS', sub: 'Ruptura principal · 30 jul' },
      { value: '±170 cm', label: 'Desplazamiento LOS', sub: 'Levantamiento / hundimiento' },
      { value: '24 cm', label: 'Longitud onda Banda L', sub: 'Sin saturación de fase' },
      { value: '12 días', label: 'Cadencia orbital NISAR', sub: 'Interferometría coherente' },
    ],
    compareLabel1: 'Réplica · 18 sep',
    compareIdx1: 2,
    compareLabel2: 'NISAR · 15 nov',
    compareIdx2: 3,
    subzones: [
      { id: 'shipunsky', label: 'Cabo Shipunsky', lat: 53.18, lon: 159.92, offset: [3.5, 3.6, 4.0] },
      { id: 'avacha', label: 'Bahía de Avacha', lat: 52.95, lon: 158.62, offset: [3.6, 3.6, 4.0] },
      { id: 'all', label: 'Toda la zona', lat: null, lon: null },
    ],
    findings: [
      {
        title: 'Franjas InSAR sin pérdida de coherencia',
        body: 'La Banda L de 24 cm penetra nieve y cobertura nubosa subártica del Pacífico para medir desplazamientos de hasta ±170 cm.',
      },
      {
        title: 'Levantamiento diferencial en Cabo Shipunsky',
        body: 'Con la exageración vertical Z observas el bloque costero levantado respecto al plano oceánico base de la Bahía de Avacha.',
      },
      {
        title: 'Hipocentros cruzados con catálogo USGS',
        body: 'La evolución temporal recoge la ruptura principal del 30 de julio y la redistribución tras la réplica Mw 7.8 del 18 de septiembre.',
      },
    ],
    studyNote:
      'El recuadro discontinuo enmarca la franja costera activa entre Petropavlovsk y Cabo Shipunsky.',
  },
  malaga: {
    subtitle: 'Inundación por DANA · Valle del Guadalhorce, España · Noviembre 2024',
    narrativeTitle: 'Desbordamiento aluvial en el bajo Guadalhorce',
    narrativeBody:
      'Entre el 13 y el 14 de noviembre de 2024, una DANA descargó lluvias torrenciales sobre Málaga. Bajo nubes densas, la señal SAR en Banda C detectó el espejo de agua sobre las vegas bajas.',
    kpis: [
      { value: '315 mm', label: 'Lluvia extrema DANA', sub: 'Valle del Guadalhorce' },
      { value: '< 23 m', label: 'Cota aluvial anegada', sub: 'Cártama a Desembocadura' },
      { value: '-9,5 dB', label: 'Reflexión especular VV', sub: 'Lámina de agua OPERA' },
      { value: '100 %', label: 'Nubes bloqueadas', sub: 'Visibilidad sólo vía SAR' },
    ],
    compareLabel1: 'Pico crecida · 14 nov',
    compareIdx1: 2,
    compareLabel2: 'Retirada · 17 nov',
    compareIdx2: 3,
    subzones: [
      { id: 'cartama', label: 'Cártama / Campanillas', lat: 36.718, lon: -4.555, offset: [3.4, 3.2, 3.8] },
      { id: 'airport', label: 'Aeropuerto / Mar', lat: 36.672, lon: -4.478, offset: [3.2, 3.0, 3.6] },
      { id: 'all', label: 'Toda la zona', lat: null, lon: null },
    ],
    findings: [
      {
        title: 'Cartografía exacta bajo tormenta convectiva',
        body: 'Mientras el modo Óptico GIBS muestra una capa cerrada de nubes el 13 de noviembre, el radar cartografía el cauce real.',
      },
      {
        title: 'Controlado físicamente por el MDE real',
        body: 'El agua inundada (OPERA DSWx-S1) se confina en depresiones por debajo de 23 m reales; las laderas de Mijas permanecen intactas.',
      },
      {
        title: 'Seguimiento de drenaje hacia el Mediterráneo',
        body: 'El reproductor temporal compara la expansión máxima del día 14 con el retroceso y encharcamiento residual del 17 de noviembre.',
      },
    ],
    studyNote:
      'El recuadro discontinuo encuadra la llanura aluvial crítica entre Campanillas, el Aeropuerto AGP y la desembocadura.',
  },
};

function getGuide(dataset, dailyCount = 0) {
  if (dataset?.is_live) {
    const id = dataset?.id || '';
    const elev = dataset?.elev_range_m || [0, 0];
    const powerDates = dataset?.earth_system_series?.power?.dates || [];
    const nDays = powerDates.length;
    const tl = dataset?.timeline || [];
    const lastIdx = Math.max(0, tl.length - 1);
    const spanStr =
      dataset?.fecha_inicio && dataset?.fecha_fin
        ? `${dataset.fecha_inicio} → ${dataset.fecha_fin}`
        : `${tl[0]?.fecha || ''} → ${tl[lastIdx]?.fecha || ''}`;
    const liveTopic =
      dataset?.tipo_fenomeno ||
      (id.includes('thermal') ? 'thermal' : id.includes('seismic') ? 'seismic' : 'hydrology');
    return {
      subtitle: `${dataset?.sensor || 'MERRA-2 / GPM · GIBS · Terrarium'} · ${spanStr}`,
      narrativeTitle:
        liveTopic === 'thermal'
          ? 'Diagnóstico térmico y balance hídrico regional'
          : liveTopic === 'seismic'
            ? 'Actividad sísmica USGS y respuesta superficial'
            : 'Balance hídrico y precipitación regional en vivo',
      narrativeBody:
        dataset?.resumen ||
        'Análisis regional en tiempo real sobre relieve MDE Terrarium, capturas diarias WMTS y series oficiales MERRA-2 / CERES / GPM / CAMS.',
      kpis: [
        {
          value: `${Math.round(elev[0])}–${Math.round(elev[1])} m`,
          label: 'Relieve real MDE',
          sub: 'AWS Terrarium (~30 m)',
        },
        {
          value: `${nDays || '—'} días`,
          label: 'Serie diaria regional',
          sub: 'MERRA-2 / GPM · ~0.5°',
        },
        {
          value: `${dailyCount || tl.length} días`,
          label: 'Imágenes WMTS',
          sub: 'Vista Satélite diaria',
        },
        {
          value: `${tl.length || 4} hitos`,
          label: 'Simulación T₀–T₃',
          sub: 'Modelo físico secundario',
        },
      ],
      compareLabel1: `Inicio · ${tl[0]?.fecha || 'T0'}`,
      compareIdx1: 0,
      compareLabel2: `Cierre · ${tl[lastIdx]?.fecha || 'T3'}`,
      compareIdx2: lastIdx,
      subzones: [{ id: 'all', label: 'Toda la zona', lat: null, lon: null }],
      findings: [
        {
          title: 'Topografía y cobertura satelital reales',
          body: 'La malla 3D usa elevación real Terrarium DEM (~30 m) combinada con ortofoto base ArcGIS y 13 capas diarias WMTS.',
        },
        {
          title: 'Series diarias largas y pruebas de tendencia',
          body: 'En Vista clara y Datos científicos puedes inspeccionar cada variable regional (t-Student y Mann-Kendall) con su unidad y escala real.',
        },
      ],
      studyNote:
        'Haz clic sobre cualquier punto del terreno para inspeccionar su relieve y contrastarlo con la serie climática regional.',
    };
  }
  const id = dataset?.id || '';
  if (id.includes('los-angeles')) return SCENARIO_GUIDES['los-angeles'];
  if (id.includes('earthquake')) return SCENARIO_GUIDES.earthquake;
  return SCENARIO_GUIDES.malaga;
}

function PixelTimeSeriesChart({ series, unit, trendStats }) {
  if (!series || series.length === 0) return null;
  const width = 280;
  const height = 104;
  const padX = 20;
  const padTop = 14;
  const padBot = 18;
  const nPts = series.length;
  const hasProj = Boolean(trendStats && Number.isFinite(trendStats.projectedNextVal));
  const totalCols = hasProj ? nPts + 1 : nPts;

  const vals = series.map((s) => s.val);
  const allVals = hasProj ? [...vals, trendStats.projectedNextVal] : vals;
  const maxAbs = Math.max(1, ...allVals.map((v) => Math.abs(v)));
  const minVal = Math.min(0, ...allVals, -maxAbs * 0.18);
  const maxVal = Math.max(0, ...allVals, maxAbs * 0.18);
  const span = Math.max(0.1, maxVal - minVal);
  const plotH = height - padTop - padBot;
  const toY = (v) => height - padBot - ((v - minVal) / span) * plotH;
  const toX = (idx) => padX + (idx / Math.max(1, totalCols - 1)) * (width - 2 * padX);

  const pts = series.map((s, idx) => ({
    x: toX(idx),
    y: toY(s.val),
    ...s,
  }));

  // Normaliza la variable secundaria acoplada al rango vertical del gráfico para comparar su correlación visual
  const drvVals = series.map((s) => s.driverVal ?? 0);
  const dMin = Math.min(...drvVals);
  const dMax = Math.max(...drvVals);
  const dSpan = Math.max(0.05, dMax - dMin);
  const drvPts = series.map((s, idx) => {
    const norm = (s.driverVal - dMin) / dSpan;
    return {
      x: toX(idx),
      y: height - padBot - (0.12 + norm * 0.76) * plotH,
    };
  });
  const drvPath = drvPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const zeroY = toY(0);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const regX0 = toX(0);
  const regY0 = toY(trendStats?.intercept ?? pts[0]?.val ?? 0);
  const projX = toX(nPts);
  const projVal = trendStats?.projectedNextVal ?? pts[nPts - 1]?.val ?? 0;
  const projY = Math.max(padTop - 4, Math.min(height - padBot + 4, toY(projVal)));
  const ciDelta = Math.min(plotH * 0.42, ((trendStats?.ci95 ?? 0) / span) * plotH);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-zinc-400">
        <span>Serie SAR + Tendencia y Proyección</span>
        <span className="font-mono text-zinc-300">{unit}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-26 overflow-visible">
        <line
          x1={padX}
          y1={zeroY}
          x2={width - padX}
          y2={zeroY}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />
        {drvPts.length >= 2 && dMax - dMin > 0.05 && (
          <path d={drvPath} fill="none" stroke="#f59e0b" strokeOpacity="0.65" strokeDasharray="2 3" strokeWidth="1.4" />
        )}
        {hasProj && (
          <>
            <line
              x1={regX0}
              y1={regY0}
              x2={projX}
              y2={projY}
              stroke="#22d3ee"
              strokeOpacity="0.7"
              strokeDasharray="4 3"
              strokeWidth="1.5"
            />
            {ciDelta > 1 && (
              <line
                x1={projX}
                y1={projY - ciDelta}
                x2={projX}
                y2={projY + ciDelta}
                stroke="#22d3ee"
                strokeOpacity="0.45"
                strokeWidth="2.5"
              />
            )}
            <circle cx={projX} cy={projY} r="3.4" fill="#09090b" stroke="#22d3ee" strokeWidth="1.8" />
            <text x={projX} y={height - 3} textAnchor="middle" fill="#22d3ee" fontSize="8" fontFamily="monospace">
              T+1
            </text>
          </>
        )}
        <path d={pathD} fill="none" stroke="#f4f4f5" strokeWidth="2" />
        {pts.map((p) => (
          <g key={p.fecha}>
            <circle cx={p.x} cy={p.y} r="3.2" fill="#ffffff" stroke="#09090b" strokeWidth="1.4" />
            <text x={p.x} y={height - 3} textAnchor="middle" fill="#71717a" fontSize="8" fontFamily="monospace">
              {p.fecha.slice(5)}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-400 pt-0.5">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-zinc-100 inline-block" /> Señal SAR
        </span>
        <span className="inline-flex items-center gap-1 text-cyan-300">
          <span className="w-2.5 h-0.5 border-t border-dashed border-cyan-400 inline-block" /> Tendencia OLS (T+1)
        </span>
        {trendStats?.driverName && (
          <span className="inline-flex items-center gap-1 text-amber-300">
            <span className="w-2.5 h-0.5 border-t border-dotted border-amber-400 inline-block" /> Variable cruzada
          </span>
        )}
      </div>
    </div>
  );
}

const VAR_SHORT_LABELS = {
  T2M: 'Temperatura',
  PRECTOTCORR: 'Lluvia',
  GWETTOP: 'Humedad suelo',
  RH2M: 'Humedad rel.',
  ALLSKY_SFC_SW_DWN: 'Radiación solar',
  QV2M: 'Vapor aire',
  CAMS_O3: 'Ozono O₃',
  CAMS_NO2: 'NO₂',
  CAMS_PM25: 'PM₂.₅',
  USGS_MAX_MW: 'Sismos USGS',
};

function DailySeriesChart({ analysis }) {
  if (!analysis?.points?.length || analysis.points.length < 2) return null;
  const width = 280;
  const height = 86;
  const padX = 10;
  const padTop = 10;
  const padBot = 16;
  const pts = analysis.points;
  const n = pts.length;
  const vals = pts.map((p) => p.val);
  const firstY = analysis.meanVal - analysis.slopePerStep * ((n - 1) / 2);
  const lastY = firstY + analysis.slopePerStep * (n - 1);
  const minVal = Math.min(...vals, firstY, lastY);
  const maxVal = Math.max(...vals, firstY, lastY);
  const span = Math.max(1e-4, maxVal - minVal);

  const mapX = (i) => padX + (i / Math.max(1, n - 1)) * (width - padX * 2);
  const mapY = (v) => padTop + (1 - (v - minVal) / span) * (height - padTop - padBot);
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(i).toFixed(1)} ${mapY(p.val).toFixed(1)}`).join(' ');
  const trendColor = analysis.isSignificant ? '#34d399' : '#a1a1aa';

  return (
    <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[78px] overflow-visible">
        <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeLinejoin="round" />
        <line
          x1={mapX(0)}
          y1={mapY(firstY)}
          x2={mapX(n - 1)}
          y2={mapY(lastY)}
          stroke={trendColor}
          strokeWidth="1.6"
          strokeDasharray="4 3"
        />
        <text x={padX} y={height - 3} fontSize="8" fill="#71717a" fontFamily="monospace">
          {analysis.start}
        </text>
        <text x={width - padX} y={height - 3} textAnchor="end" fontSize="8" fill="#71717a" fontFamily="monospace">
          {analysis.end}
        </text>
      </svg>
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-1">
        <span>Mín {analysis.minVal.toFixed(1)} {analysis.unit}</span>
        <span>Media {analysis.meanVal.toFixed(1)} {analysis.unit}</span>
        <span>Máx {analysis.maxVal.toFixed(1)} {analysis.unit}</span>
      </div>
    </div>
  );
}

export default function ExaggerationPanel({
  dataset,
  tFloat,
  isPlaying,
  onTogglePlay,
  onManualSeek,
  exaggeration,
  setExaggeration,
  selectedVertex,
  buffers,
  renderMode = 'hybrid',
  opticalMode,
  activeStep,
  onSelectStep,
  onSelectCompareDate,
  activeSubzoneId,
  onFocusSubzone,
  onBackToGlobe,
  gibsLayerId = 'truecolor',
  dailyDates = [],
}) {
  const [longWindow, setLongWindow] = useState(true);
  const [importedCsv, setImportedCsv] = useState(null);
  const [panelTab, setPanelTab] = useState('simple');
  const [selectedVar, setSelectedVar] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const csvInputRef = useRef(null);

  useEffect(() => {
    setSelectedVar(dataset?.earth_system_series?.primary_var || null);
    setImportedCsv(null);
  }, [dataset?.id]);

  const effectiveRenderMode = renderMode || (opticalMode ? 'optical' : 'hybrid');
  const pixelReport = translatePixelPhysics(dataset, selectedVertex, tFloat, buffers);
  const impactSummary = computeInstantImpactSummary(dataset, buffers, tFloat);
  const id = dataset?.id || '';
  const guide = getGuide(dataset, dailyDates.length);
  const timeline = dataset?.timeline || [];
  const nearestStepIdx = Math.round(Number.isFinite(Number(tFloat)) ? Number(tFloat) : 0);

  const availableVars = useMemo(() => {
    const es = dataset?.earth_system_series;
    if (!es) return [];
    const list = [];
    if (es.usgs?.dates?.length >= 3 && es.usgs?.max_mw?.length) {
      list.push({ key: 'USGS_MAX_MW', label: VAR_SHORT_LABELS.USGS_MAX_MW });
    }
    const pwVars = es.power?.variables || {};
    Object.keys(pwVars).forEach((k) => {
      if (pwVars[k]?.length >= 3) {
        list.push({ key: k, label: VAR_SHORT_LABELS[k] || k });
      }
    });
    const aqVars = es.air_quality?.variables || {};
    Object.keys(aqVars).forEach((k) => {
      if (aqVars[k]?.length >= 3) {
        list.push({ key: k, label: VAR_SHORT_LABELS[k] || k });
      }
    });
    return list;
  }, [dataset]);

  const activeVarKey = selectedVar || dataset?.earth_system_series?.primary_var || availableVars[0]?.key || 'T2M';

  const dailyContext = useMemo(() => {
    if (importedCsv?.analysis) {
      return {
        title: `CSV Importado · ${importedCsv.label}`,
        source: 'Archivo CSV oficial (Giovanni / AppEEARS / CDO / KNMI)',
        def: null,
        analysis: importedCsv.analysis,
      };
    }
    const es = dataset?.earth_system_series;
    const pw = es?.power;
    const aq = es?.air_quality;
    const def = dataset?.variable_definitions?.[activeVarKey] || null;
    if (activeVarKey === 'USGS_MAX_MW' && es?.usgs?.dates?.length >= 3) {
      const dates = es.usgs.dates;
      const vals = es.usgs.max_mw;
      const sliceN = longWindow ? dates.length : Math.min(dates.length, 30);
      return {
        title: def?.nombre || 'Magnitud máxima diaria USGS',
        source: es.usgs.source,
        def,
        analysis: analyzeEarthSystemSeries(dates.slice(-sliceN), vals.slice(-sliceN), def?.unidad || 'Mw'),
      };
    }
    if (aq?.dates?.length && aq?.variables?.[activeVarKey]?.length) {
      const dates = aq.dates;
      const vals = aq.variables[activeVarKey];
      const sliceN = longWindow ? dates.length : Math.min(dates.length, 30);
      return {
        title: def?.nombre || activeVarKey,
        source: aq.source,
        def,
        analysis: analyzeEarthSystemSeries(dates.slice(-sliceN), vals.slice(-sliceN), def?.unidad || ''),
      };
    }
    if (pw?.dates?.length && pw?.variables?.[activeVarKey]?.length) {
      const dates = pw.dates;
      const vals = pw.variables[activeVarKey];
      const sliceN = longWindow ? dates.length : Math.min(dates.length, 30);
      return {
        title: def?.nombre || activeVarKey,
        source: pw.source,
        def,
        analysis: analyzeEarthSystemSeries(dates.slice(-sliceN), vals.slice(-sliceN), def?.unidad || ''),
      };
    }
    return null;
  }, [dataset, longWindow, importedCsv, activeVarKey]);

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseOfficialCsvText(String(reader.result || ''), file.name);
      if (parsed?.analysis) setImportedCsv(parsed);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = (fmt) => {
    const payload = {
      dataset_id: dataset?.id,
      titulo: dataset?.titulo,
      fuentes: dataset?.fuentes,
      vertice: pixelReport,
      serie_diaria_sistema_terrestre: dailyContext?.analysis || null,
    };
    const isCsv = fmt === 'csv';
    let text = '';
    if (isCsv) {
      const rows = ['fecha,valor_fisico,unidad,variable_cruzada'];
      (pixelReport?.series || []).forEach((s) => {
        rows.push(`${s.fecha},${s.val},${pixelReport?.unit || ''},${s.driverVal}`);
      });
      if (dailyContext?.analysis?.points?.length) {
        rows.push('');
        rows.push(`# Serie diaria (${dailyContext.title})`);
        rows.push(`fecha,valor,${dailyContext.analysis.unit}`);
        dailyContext.analysis.points.forEach((p) => rows.push(`${p.date},${p.val},${dailyContext.analysis.unit}`));
      }
      text = rows.join('\n');
    } else {
      text = JSON.stringify(payload, null, 2);
    }
    const blob = new Blob([text], { type: isCsv ? 'text/csv;charset=utf-8' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trend_detective_${dataset?.id || 'zona'}.${fmt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLiveZone = Boolean(dataset?.is_live);

  const activeGibs = getGibsLayer(gibsLayerId);
  const colorLegend =
    effectiveRenderMode === 'gibs'
      ? {
        title: `${activeGibs.label} · Satélite WMTS`,
        grad: activeGibs.legend?.grad || 'from-sky-700 via-emerald-600 to-amber-200',
        css: activeGibs.legend?.css || null,
        left: activeGibs.legend?.left || 'Imagen real',
        right: activeGibs.legend?.right || `Resolución ${activeGibs.resolution}`,
        Icon: Eye,
        note: `${activeGibs.description} Resolución nativa ${activeGibs.resolution}: en cajas pequeñas los píxeles reales gruesos se muestran semitransparentes sobre el relieve para conservar el contexto geográfico.`,
      }
      : effectiveRenderMode === 'significance'
      ? {
        title: 'Significancia lineal (p < 0.05 en T₀→T₃)',
        grad: 'from-orange-500 via-zinc-600 to-emerald-400',
        left: 'Descenso p<0.05',
        right: 'Ascenso p<0.05 (Gris = p≥0.05)',
        Icon: Activity,
        note: 'Evalúa tendencia lineal sobre T₀..T₃: los saltos bruscos (p. ej. un sismo en T₁ que luego se estabiliza) quedan en gris salvo en laderas donde el cambio crece de T₀ a T₃.',
      }
      : effectiveRenderMode === 'driver'
        ? {
          title: 'Variable cruzada física (mapa estático)',
          grad: 'from-sky-600 via-amber-400 to-rose-600',
          left: 'Mínimo regional',
          right: 'Máximo acoplado',
          Icon: Activity,
          note: 'Mapa espacial de susceptibilidad física (esfuerzo cortical, aridez topográfica o acumulación hídrica) calculado sobre toda la ventana.',
        }
        : isLiveZone
          ? (dataset?.tipo_fenomeno === 'thermal' || id.includes('thermal'))
            ? {
              title: 'Estrés térmico y déficit hídrico (MERRA-2 / GPM)',
              grad: 'from-emerald-600 via-amber-500 to-rose-600',
              left: 'Referencia fresca',
              right: 'Anomalía cálida/seca',
              Icon: Flame,
            }
            : (dataset?.tipo_fenomeno === 'seismic' || id.includes('seismic'))
              ? {
                title: 'Sismicidad USGS y deformación superficial',
                grad: 'from-sky-600 via-zinc-500 to-orange-500',
                left: 'Actividad basal',
                right: 'Pulso sísmico / gradiente',
                Icon: Activity,
              }
              : {
                title: 'Balance hídrico y precipitación (GPM · MERRA-2)',
                grad: 'from-amber-700 via-teal-600 to-sky-400',
                left: 'Suelo seco / estiaje',
                right: 'Acumulación / escorrentía',
                Icon: Waves,
              }
          : id.includes('los-angeles')
            ? {
              title: 'Pérdida de biomasa SAR',
              grad: 'from-emerald-600 via-amber-500 to-stone-800',
              left: 'Intacto (0 dB)',
              right: 'Cicatriz (-8.5 dB)',
              Icon: Flame,
            }
            : id.includes('earthquake')
              ? {
                title: 'Desplazamiento InSAR (LOS)',
                grad: 'from-sky-600 via-zinc-500 to-orange-500',
                left: 'Hundimiento (-170 cm)',
                right: 'Elevación (+170 cm)',
                Icon: Activity,
              }
              : {
                title: 'Reflexión especular (DSWx)',
                grad: 'from-emerald-800 via-teal-600 to-sky-400',
                left: 'Suelo seco (0 dB)',
                right: 'Agua (-9.5 dB)',
                Icon: Waves,
              };

  const ScaleIcon = colorLegend.Icon;

  const steps = [
    { num: 1, title: 'Qué pasó' },
    { num: 2, title: 'Antes y después' },
    { num: 3, title: 'Qué cambió' },
  ];

  if (!drawerOpen) {
    return (
      <div className="shrink-0 z-20 bg-zinc-900/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-zinc-800 px-3 py-1.5 lg:px-1.5 lg:py-3 lg:w-11 flex lg:flex-col items-center justify-between lg:justify-start gap-2">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="w-full lg:w-8 lg:h-8 flex items-center justify-between lg:justify-center gap-2 rounded-xl px-2.5 py-1 lg:p-0 bg-zinc-950/75 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors"
          title="Abrir panel de análisis"
        >
          <span className="lg:hidden inline-flex items-center gap-2 font-medium truncate">
            <BookOpen className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="truncate">Análisis y Guía</span>
            <span className="text-[10px] font-mono text-cyan-300">Paso {activeStep}/3</span>
          </span>
          <span className="lg:hidden inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 shrink-0">
            Abrir
            <ChevronUp className="w-3.5 h-3.5" />
          </span>
          <ChevronLeft className="hidden lg:block w-4 h-4 text-zinc-300" />
        </button>
      </div>
    );
  }

  return (
    <aside className="fixed inset-x-2 bottom-16 max-h-[70dvh] rounded-2xl border border-zinc-700/80 shadow-2xl z-30 lg:static lg:inset-auto lg:bottom-auto lg:max-h-none lg:rounded-none lg:border-0 lg:border-l lg:border-zinc-800 lg:shadow-none lg:w-[370px] xl:w-[400px] bg-zinc-900/95 backdrop-blur-xl p-3.5 sm:p-4 overflow-y-auto flex flex-col gap-3.5">
      {/* Navegación guiada en 3 pasos (inspirada en TERRASCOPE) */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onBackToGlobe}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Globo
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-400">
              Guía del evento
            </span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              title="Plegar panel"
              aria-label="Plegar panel de análisis"
              className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
            >
              <ChevronDown className="w-3.5 h-3.5 lg:hidden" />
              <ChevronRight className="hidden lg:block w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-zinc-50 leading-snug">{dataset?.titulo}</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{guide.subtitle}</p>
        </div>

        {/* Pestañas de 3 pasos */}
        <div className="grid grid-cols-3 gap-1.5">
          {steps.map((st) => {
            const isCurrent = activeStep === st.num;
            const isPast = activeStep > st.num;
            return (
              <button
                key={st.num}
                onClick={() => onSelectStep?.(st.num)}
                className={`text-left rounded-xl p-2 border transition-all ${isCurrent
                  ? 'bg-zinc-900 border-cyan-400/75 text-zinc-50 shadow-md'
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                  }`}
              >
                <div className="text-[10px] font-mono flex items-center gap-1">
                  {isPast && <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />}
                  <span className={isCurrent ? 'text-cyan-300' : ''}>Paso {st.num}</span>
                </div>
                <div className="text-[11px] font-medium leading-tight mt-0.5">{st.title}</div>
              </button>
            );
          })}
        </div>

        {/* Contenido dinámico del Paso activo */}
        {activeStep === 1 && (
          <div className="space-y-3 pt-1">
            <div>
              <h3 className="text-xs font-semibold text-zinc-100">{guide.narrativeTitle}</h3>
              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">{guide.narrativeBody}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {guide.kpis.map((kpi) => (
                <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
                  <div className="text-base font-mono tabular-nums font-semibold text-white">{kpi.value}</div>
                  <div className="text-[11px] text-zinc-200 font-medium mt-0.5 leading-tight">{kpi.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{kpi.sub}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onBackToGlobe}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Casos
              </button>
              <button
                onClick={() => onSelectStep?.(2)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs transition-colors"
              >
                Siguiente: Antes y después
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="space-y-3 pt-1">
            <div>
              <h3 className="text-xs font-semibold text-zinc-100">La misma zona en dos fechas</h3>
              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                Arrastra la barra blanca del visor 3D para comparar el estado inicial frente a las pasadas posteriores sobre el relieve real.
              </p>
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-400 mb-1.5">
                Comparar fecha derecha con
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: guide.compareLabel1, idx: guide.compareIdx1 },
                  { label: guide.compareLabel2, idx: guide.compareIdx2 },
                ].map((opt) => {
                  const active = nearestStepIdx === opt.idx;
                  return (
                    <button
                      key={opt.idx}
                      onClick={() => onSelectCompareDate?.(opt.idx)}
                      className={`inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl border text-[11px] font-medium transition-all ${active
                        ? 'bg-zinc-900 border-cyan-400/75 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                        }`}
                    >
                      {active && <Check className="w-3 h-3 text-cyan-300 shrink-0" />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSelectStep?.(1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                onClick={() => onSelectStep?.(3)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs transition-colors"
              >
                Siguiente: Qué cambió
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-semibold text-zinc-100">Qué detectamos</h3>
            <div className="space-y-2">
              {guide.findings.map((f, idx) => (
                <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    {idx === 0 ? (
                      <Radio className="w-3.5 h-3.5 text-cyan-300" />
                    ) : idx === 1 ? (
                      <Satellite className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-amber-300" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-zinc-100">{f.title}</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900/75 border border-cyan-500/30 rounded-xl px-2.5 py-2 text-[11px] text-zinc-300 leading-snug">
              <span className="font-mono text-cyan-300 font-medium">Zona de estudio:</span> {guide.studyNote}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSelectStep?.(2)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                onClick={onBackToGlobe}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs transition-colors"
              >
                Explorar otro caso
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Enlace rápido directo a subzonas 3D accesible desde cualquier paso */}
        {guide.subzones?.length > 0 && (
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-400 mb-1.5">
              Foco rápido en subzona 3D
            </div>
            <div className="flex flex-wrap gap-1.5">
              {guide.subzones.map((sz) => {
                const active = (activeSubzoneId || 'all') === sz.id;
                return (
                  <button
                    key={sz.id}
                    onClick={() => onFocusSubzone?.(sz)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] transition-all ${active
                      ? 'bg-zinc-900 border-cyan-400/75 text-white font-medium'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-600'
                      }`}
                  >
                    {active && <MapPin className="w-3 h-3 text-cyan-300" />}
                    {sz.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selector amigable de profundidad (Vista clara vs Datos científicos) */}
      <div className="grid grid-cols-2 gap-1.5 bg-zinc-950/90 border border-zinc-800 rounded-2xl p-1.5">
        <button
          type="button"
          onClick={() => setPanelTab('simple')}
          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${panelTab === 'simple'
            ? 'bg-emerald-400 text-zinc-950 font-semibold shadow-sm'
            : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
        >
          Vista clara
        </button>
        <button
          type="button"
          onClick={() => setPanelTab('science')}
          className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${panelTab === 'science'
            ? 'bg-cyan-400 text-zinc-950 font-semibold shadow-sm'
            : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
            }`}
        >
          Datos científicos
        </button>
      </div>

      {panelTab === 'simple' ? (
        <>
          {/* ¿Cómo leer los colores en esta vista? */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
              <Info className="w-3.5 h-3.5 text-cyan-300" />
              ¿Qué estás viendo ahora?
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-200 font-medium">
              <ScaleIcon className="w-3.5 h-3.5 text-zinc-400" />
              {colorLegend.title}
            </div>
            <div
              className={`h-2.5 w-full rounded-full ${colorLegend.css ? '' : `bg-gradient-to-r ${colorLegend.grad}`} border border-zinc-700`}
              style={colorLegend.css ? { background: colorLegend.css } : undefined}
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>{colorLegend.left}</span>
              <span>{colorLegend.right}</span>
            </div>
            {colorLegend.note && (
              <p className="text-[11px] text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 leading-relaxed">
                {colorLegend.note}
              </p>
            )}
            {(effectiveRenderMode === 'optical' || (effectiveRenderMode === 'gibs' && !activeGibs.overlay)) && (
              <p className="text-[11px] text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 leading-relaxed">
                Estás viendo fotografías satelitales reales por fecha. Si aparecen velos grises o blancos, son nubes reales captadas por el satélite óptico.
              </p>
            )}
          </div>

          {/* Veredicto rápido entendible por cualquier persona */}
          {(dailyContext?.analysis || pixelReport) && (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-300" />
                  ¿Está cambiando de verdad?
                </div>
                {dailyContext?.analysis && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border truncate max-w-[180px] ${dailyContext.analysis.isSignificant
                      ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                      }`}
                    title={dailyContext.title}
                  >
                    {dailyContext.analysis.isSignificant
                      ? `Tendencia · ${VAR_SHORT_LABELS[activeVarKey] || activeVarKey}`
                      : `Sin tendencia · ${VAR_SHORT_LABELS[activeVarKey] || activeVarKey}`}
                  </span>
                )}
              </div>

              {availableVars.length > 1 && (
                <div className="flex flex-wrap gap-1">
                  {availableVars.map((v) => {
                    const active = activeVarKey === v.key && !importedCsv;
                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => {
                          setImportedCsv(null);
                          setSelectedVar(v.key);
                        }}
                        className={`px-2 py-0.5 rounded-lg border text-[10px] transition-colors ${
                          active
                            ? 'bg-emerald-400/20 border-emerald-400/75 text-emerald-200 font-semibold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                        }`}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {dailyContext?.analysis && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-medium text-zinc-100 truncate">{dailyContext.title}</div>
                    <button
                      type="button"
                      onClick={() => (importedCsv ? setImportedCsv(null) : setLongWindow((v) => !v))}
                      className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-700 text-[10px] font-mono text-cyan-300 hover:border-cyan-400 shrink-0"
                    >
                      {importedCsv ? 'Serie oficial' : longWindow ? `Completa (${dailyContext.analysis.count}d)` : 'Últimos 30d'}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {dailyContext.analysis.isSignificant
                      ? `En ${dailyContext.analysis.count} días muestra un ritmo claro de ${dailyContext.analysis.slopeLabel}. Es muy improbable que se deba al azar (p = ${dailyContext.analysis.pValue < 0.01 ? '<0.01' : dailyContext.analysis.pValue.toFixed(3)}).`
                      : `En ${dailyContext.analysis.count} días no hay una subida o bajada continua (p = ${dailyContext.analysis.pValue.toFixed(2)}), aunque puede haber picos concretos.`}
                  </p>
                  <DailySeriesChart analysis={dailyContext.analysis} />
                  <div className="text-[10px] font-mono text-zinc-500 leading-snug">
                    Escala regional (~0.5° rejilla climática) · independiente del relieve local MDE (~30 m).
                  </div>
                </div>
              )}

              {pixelReport && (
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Punto tocado en el 3D</span>
                    <span className="font-mono text-zinc-300">Altitud {pixelReport.baseElevM} m · {pixelReport.coverLabel}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">{pixelReport.interpretation}</p>
                </div>
              )}
            </div>
          )}

          {/* Evolución por hitos de simulación (T₀ → T₃) */}
          {timeline.length > 0 && (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Hitos de referencia (T₀ → T{timeline.length - 1})
                </div>
              </div>
              {effectiveRenderMode === 'gibs' && dailyDates.length > 1 && (
                <p className="text-[10px] font-mono text-zinc-500 leading-snug">
                  El deslizador inferior recorre los {dailyDates.length} días reales WMTS; estos hitos marcan la simulación física.
                </p>
              )}
              <div className="grid grid-cols-2 gap-1.5">
                {timeline.map((step, idx) => {
                  const active = nearestStepIdx === idx;
                  return (
                    <button
                      key={step.fecha}
                      onClick={() => onManualSeek?.(idx)}
                      className={`text-left rounded-xl p-2 border transition-all ${active
                        ? 'bg-zinc-900 border-cyan-400/75 text-white shadow-sm'
                        : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                        }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                        <span className={active ? 'text-cyan-300 font-semibold' : ''}>T{idx}</span>
                        <span>{step.fecha}</span>
                      </div>
                      <div className="text-[11px] font-medium mt-0.5 truncate">{step.etiqueta}</div>
                    </button>
                  );
                })}
              </div>

              {impactSummary && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2">
                    <div className="text-[10px] text-zinc-400">Zona afectada</div>
                    <div className="text-xs font-mono tabular-nums font-semibold text-emerald-300 mt-0.5">
                      {impactSummary.transformedPct.toFixed(1)}% · {impactSummary.transformedKm2.toFixed(1)} km²
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2">
                    <div className="text-[10px] text-zinc-400">{impactSummary.primaryMetricLabel}</div>
                    <div className="text-xs font-mono tabular-nums font-semibold text-white mt-0.5">
                      {impactSummary.primaryMetricValue}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Altura del relieve 3D */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                Altura del relieve 3D
              </div>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-xs font-mono tabular-nums font-medium text-zinc-100">
                ×{Number(exaggeration).toFixed(1).replace(/\.0$/, '')}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              step={0.5}
              value={Math.min(4, Math.max(1, Number(exaggeration) || 2))}
              onChange={(e) => setExaggeration(parseFloat(e.target.value))}
              className="w-full mt-3 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono tabular-nums text-zinc-400 mt-1.5">
              <span>×1 real</span>
              <span>×2.5</span>
              <span>×4 marcado</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Serie diaria/larga del Sistema Terrestre (prioridad científica sobre el ajuste de 4 hitos) */}
          {dailyContext?.analysis && (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-200 truncate">
                  <Activity className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span className="truncate">{dailyContext.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => (importedCsv ? setImportedCsv(null) : setLongWindow((v) => !v))}
                  className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-cyan-300 hover:border-cyan-400 shrink-0"
                >
                  {importedCsv
                    ? 'Serie oficial'
                    : longWindow
                      ? `Completa (${dailyContext.analysis.count}d)`
                      : 'Últimos 30d'}
                </button>
              </div>

              {availableVars.length > 1 && (
                <div className="flex flex-wrap gap-1 pb-1 border-b border-zinc-800/80">
                  {availableVars.map((v) => {
                    const active = activeVarKey === v.key && !importedCsv;
                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => {
                          setImportedCsv(null);
                          setSelectedVar(v.key);
                        }}
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-mono transition-colors ${
                          active
                            ? 'bg-cyan-400/20 border-cyan-400/75 text-cyan-200 font-semibold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                        }`}
                      >
                        {v.key}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="text-[10px] font-mono text-zinc-400">
                {dailyContext.source} · {dailyContext.analysis.start} → {dailyContext.analysis.end}
              </div>

              <DailySeriesChart analysis={dailyContext.analysis} />

              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                  <span className="text-zinc-400">Pendiente diaria:</span>{' '}
                  <span className="font-mono text-zinc-100 font-semibold">
                    {dailyContext.analysis.slopeLabel}
                  </span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1">
                  <span className="text-zinc-400">Significancia:</span>{' '}
                  <span
                    className={`font-mono font-semibold ${
                      dailyContext.analysis.isSignificant ? 'text-emerald-300' : 'text-amber-300'
                    }`}
                  >
                    {dailyContext.analysis.pValue < 0.05
                      ? `p=${dailyContext.analysis.pValue.toFixed(3)}`
                      : `p=${dailyContext.analysis.pValue.toFixed(2)} (no sig.)`}
                  </span>
                </div>
              </div>

              {dailyContext.def && (
                <div className="flex items-start gap-1.5 text-[10px] text-zinc-300 bg-zinc-900/70 border border-zinc-800/80 rounded-lg px-2 py-1.5 leading-snug">
                  <BookOpen className="w-3 h-3 text-cyan-300 shrink-0 mt-0.5" />
                  <span>{dailyContext.def.definicion}</span>
                </div>
              )}

              <div className="text-[9px] font-mono text-zinc-500 leading-snug">
                Celda regional (~0.5°) · análisis robusto sobre {dailyContext.analysis.count} observaciones diarias.
              </div>
            </div>
          )}

          {/* Tarjeta Inspección de Vértice (estimado sobre T₀..T₃ del modelo 3D) */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
                <Crosshair className="w-3.5 h-3.5 text-zinc-400" />
                Inspección puntual · Vértice ({timeline.length} hitos)
              </div>
              {pixelReport && (
                <span className="text-[11px] font-mono tabular-nums text-zinc-400">
                  ({pixelReport.row}, {pixelReport.col})
                </span>
              )}
            </div>

            {!pixelReport ? (
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Haz clic en cualquier punto del relieve 3D para inspeccionar su cota DEM y estimación temporal sobre T₀–T{Math.max(0, timeline.length - 1)}.
              </p>
            ) : (
              <div className="mt-2.5 space-y-2.5 text-xs">
                {pixelReport.trendStats && (
                  <div
                    className={`rounded-xl px-2.5 py-1.5 border text-[11px] font-mono flex items-center justify-between gap-2 ${pixelReport.trendStats.isSignificant
                      ? 'bg-emerald-950/50 border-emerald-500/45 text-emerald-300'
                      : 'bg-zinc-900 border-zinc-700/80 text-zinc-300'
                      }`}
                  >
                    <span>Est. T₀–T{Math.max(0, timeline.length - 1)} (t-test / MK)</span>
                    <span className="font-semibold">{pixelReport.trendStats.pValueLabel}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
                    <div className="text-[10px] text-zinc-400">{isLiveZone ? 'Valor físico' : 'Valor físico SAR'}</div>
                    <div className="text-sm font-mono tabular-nums font-semibold text-zinc-100 mt-0.5">
                      {pixelReport.physicalVal >= 0 && id.includes('earthquake') ? '+' : ''}
                      {pixelReport.physicalVal.toFixed(2)} {pixelReport.unit.split(' ')[0]}
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
                    <div className="text-[10px] text-zinc-400">Tasa de cambio (β)</div>
                    <div className="text-xs font-mono tabular-nums font-semibold text-cyan-300 mt-1">
                      {pixelReport.trendStats?.slopeLabel ?? '0.00/pasada'}
                    </div>
                  </div>
                </div>

                {pixelReport.trendStats && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
                      <div className="text-[10px] text-zinc-400 truncate" title={pixelReport.trendStats.driverName}>
                        Correlación cruzada (r)
                      </div>
                      <div className="text-xs font-mono tabular-nums font-semibold text-amber-300 mt-0.5">
                        r = {pixelReport.trendStats.correlationR.toFixed(2)}
                      </div>
                      <div className="text-[9px] text-zinc-400 truncate mt-0.5">
                        {pixelReport.trendStats.driverName}
                      </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5">
                      <div className="text-[10px] text-zinc-400">Proyección (T+1 ± IC95)</div>
                      <div className="text-xs font-mono tabular-nums font-semibold text-zinc-100 mt-0.5">
                        {pixelReport.trendStats.projectedNextVal.toFixed(1)} ± {pixelReport.trendStats.ci95.toFixed(1)}
                      </div>
                      <div className="text-[9px] text-zinc-400 mt-0.5">
                        Persistencia: {pixelReport.confidencePct}%
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-between gap-1 text-[11px] bg-zinc-900 rounded-xl px-2.5 py-1.5 border border-zinc-800">
                  <span className="text-zinc-400 font-mono tabular-nums">
                    {pixelReport.lat?.toFixed(3)}°, {pixelReport.lon?.toFixed(3)}°
                  </span>
                  <span className="font-mono tabular-nums text-zinc-200">DEM {pixelReport.baseElevM} m</span>
                </div>

                <PixelTimeSeriesChart
                  series={pixelReport.series}
                  unit={pixelReport.unit}
                  trendStats={pixelReport.trendStats}
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <input
                    ref={csvInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => csvInputRef.current?.click()}
                    title="Importa un CSV oficial exportado de Giovanni, AppEEARS, Hydrology Time Series, NOAA CDO o KNMI"
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-200 transition-colors"
                  >
                    <Upload className="w-3 h-3 text-cyan-300" />
                    Importar CSV oficial
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-200 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('json')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[11px] text-zinc-200 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    JSON
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sensores y fuentes reales */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
            {isLiveZone ? (
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 font-mono text-zinc-200">
                  <Radio className="w-3.5 h-3.5 text-zinc-400" />
                  {dataset?.sensor || 'MERRA-2 / GPM · Satélite WMTS · AWS Terrarium'}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2">
                    <div className="font-mono text-zinc-100 font-medium">MERRA-2 · CERES · GPM</div>
                    <div className="text-zinc-400 mt-0.5 leading-snug">
                      Series diarias reales (~0.5° × 0.625°) de temperatura, lluvia, humedad y radiación.
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2">
                    <div className="font-mono text-zinc-100 font-medium">GIBS + Terrarium DEM</div>
                    <div className="text-zinc-400 mt-0.5 leading-snug">
                      Relieve 3D real y textura evolutiva por fecha sobre la ventana regional seleccionada.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 font-mono text-zinc-200">
                  <Radio className="w-3.5 h-3.5 text-zinc-400" />
                  {dataset?.banda} · Polarización {dataset?.polarizacion}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2">
                    <div className="font-mono text-zinc-100 font-medium">Banda L (24 cm)</div>
                    <div className="text-zinc-400 mt-0.5 leading-snug">
                      Penetra dosel y nieve sin saturación de fase (NISAR, Jul 2025).
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2">
                    <div className="font-mono text-zinc-100 font-medium">Banda C (5.6 cm)</div>
                    <div className="text-zinc-400 mt-0.5 leading-snug">
                      Sensible a hojas, lámina de agua y rugosidad urbana (Sentinel-1).
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 leading-relaxed">
                  <span className="text-zinc-300 font-medium">Polarizaciones:</span>{' '}
                  <span className="font-mono text-zinc-300">VV/HH</span> detectan agua y deformación del suelo;{' '}
                  <span className="font-mono text-zinc-300">VH/HV</span> miden volumen forestal en incendios.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
