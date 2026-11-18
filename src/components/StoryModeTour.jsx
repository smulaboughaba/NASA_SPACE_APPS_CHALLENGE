import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, PlayCircle, Square } from 'lucide-react';

const STORY_SCRIPTS = {
  'los-angeles-fires-2025': [
    {
      t: 0,
      renderMode: 'gibs',
      gibsLayer: 'truecolor',
      compare: false,
      title: '1. Relieve Real Pre-Incendio (Enero 2025)',
      text: 'Mosaico satelital real y MDE de Santa Monica Mountains & Pacific Palisades (0–849 m). Dosel chaparral denso antes de los vientos Santa Ana.',
    },
    {
      t: 2,
      renderMode: 'gibs',
      gibsLayer: 'bands721',
      compare: false,
      title: '2. Frente Activo en Infrarrojo 7-2-1 (10 Ene)',
      text: 'El falso color infrarrojo de onda corta penetra parte del humo y resalta la cicatriz quemada frente al chaparral intacto.',
    },
    {
      t: 2,
      renderMode: 'hybrid',
      compare: false,
      title: '3. Modelo SAR sobre Perímetro Oficial NIFC',
      text: 'La simulación superpone la envolvente real NIFC WFIGS y muestra en 3D la pérdida de retrodispersión entre Topanga y Mandeville.',
    },
    {
      t: 3,
      renderMode: 'gibs',
      gibsLayer: 'truecolor',
      compare: true,
      title: '4. Comparativa Antes vs. Cierre (23.448 acres)',
      text: 'La cortinilla divide la captura inicial intacta frente al cierre temporal sobre el relieve costero.',
    },
  ],
  'earthquake-insar-rupture': [
    {
      t: 0,
      renderMode: 'gibs',
      gibsLayer: 'truecolor',
      compare: false,
      title: '1. Bahía de Avacha y Cabo Shipunsky Pre-Sismo (Jul 2025)',
      text: 'Relieve volcánico y costero real de Kamchatka (0–3.061 m). Antes del 30 de julio la corteza presenta desplazamiento nulo (0 cm LOS).',
    },
    {
      t: 1,
      renderMode: 'gibs',
      gibsLayer: 'truecolor',
      compare: false,
      title: '2. Megaterremoto USGS Mw 8.8 y Nubes del Pacífico',
      text: 'El 30 de julio de 2025 un sismo Mw 8.8 sacude Kamchatka mientras la cobertura nubosa del Pacífico cubre el óptico.',
    },
    {
      t: 3,
      renderMode: 'hybrid',
      compare: false,
      title: '3. Franjas InSAR NISAR Banda L (Nov 2025)',
      text: 'Con exageración vertical observas la deformación co-sísmica sobre tierra firme tras el sismo Mw 8.8 y la réplica Mw 7.8 (±170 cm).',
    },
    {
      t: 3,
      renderMode: 'hybrid',
      compare: true,
      title: '4. Evaluación Costera Pre vs. Post Ruptura',
      text: 'La cortinilla y la inspección por vértice revelan coordenadas exactas y desplazamiento diferencial entre Cabo Shipunsky y Avacha.',
    },
  ],
  'malaga-guadalhorce-dana': [
    {
      t: 0,
      renderMode: 'gibs',
      gibsLayer: 'truecolor',
      compare: false,
      title: '1. Vega Real del Guadalhorce Pre-DANA (Nov 2024)',
      text: 'Ortofoto satelital y MDE real de Málaga (0–579 m) desde Cártama hasta la desembocadura y el aeropuerto con el cauce confinado.',
    },
    {
      t: 1,
      renderMode: 'gibs',
      gibsLayer: 'precip',
      compare: false,
      title: '2. Precipitación IMERG y Tormenta DANA (13 Nov)',
      text: 'Las nubes convectivas cubren el óptico mientras GPM IMERG y las estaciones registran el episodio torrencial sobre la cuenca.',
    },
    {
      t: 2,
      renderMode: 'hybrid',
      compare: false,
      title: '3. Lámina Especular OPERA DSWx sobre Cotas Reales',
      text: 'El modelo radar cartografía la inundación confinada en la llanura aluvial (< 23 m reales), respetando las laderas secas de Mijas.',
    },
    {
      t: 3,
      renderMode: 'hybrid',
      compare: true,
      title: '4. Drenaje y Comparativa Pre vs. Post',
      text: 'La cortinilla contrasta el cauce normal frente al retroceso del agua en depresiones fluviales entre Campanillas y la desembocadura.',
    },
  ],
};

function buildLiveStoryScript(dataset) {
  const tl = dataset?.timeline || [];
  const lastIdx = Math.max(0, tl.length - 1);
  const midIdx = Math.min(lastIdx, Math.max(1, Math.round(lastIdx * 0.65)));
  const startDate = tl[0]?.fecha || dataset?.fecha_inicio || 'Inicio';
  const midDate = tl[midIdx]?.fecha || 'Pasada media';
  const endDate = tl[lastIdx]?.fecha || dataset?.fecha_fin || 'Cierre';
  const elev = dataset?.elev_range_m || [0, 0];
  const elevText = `${Math.round(elev[0])}–${Math.round(elev[1])} m`;
  const topic = dataset?.tipo_fenomeno || 'hydrology';
  const rawTitle = (dataset?.titulo || 'Región seleccionada').replace(/\s*\([^)]*\)\s*$/, '');
  const topicLayer = topic === 'thermal' ? 'bands721' : topic === 'hydrology' ? 'precip' : 'truecolor';
  const topicLabel =
    topic === 'thermal'
      ? 'Anomalía térmica y cobertura 7-2-1'
      : topic === 'seismic'
        ? 'Actividad sísmica USGS en la zona'
        : 'Precipitación diaria IMERG y balance hídrico';

  return [
    {
      t: 0,
      renderMode: 'gibs',
      gibsLayer: 'truecolor',
      compare: false,
      title: `1. Inicio en ${rawTitle} (${startDate})`,
      text: `Relieve real AWS Terrarium MDE (${elevText}) cubierto con imagen satelital diaria MODIS Terra al inicio de la ventana seleccionada.`,
    },
    {
      t: midIdx,
      renderMode: 'gibs',
      gibsLayer: topicLayer,
      compare: false,
      title: `2. ${topicLabel} (${midDate})`,
      text: `Observación satelital WMTS para ${rawTitle} sincronizada con las series climáticas diarias (${dataset?.sensor || 'MERRA-2 / GPM · Terrarium'}).`,
    },
    {
      t: midIdx,
      renderMode: 'hybrid',
      compare: false,
      title: `3. Simulación regional sobre el relieve`,
      text: `Modelo físico secundario calculado en vivo a partir de las series oficiales (${topic === 'seismic' ? 'USGS' : 'POWER / MERRA-2'}) ponderado sobre la topografía local.`,
    },
    {
      t: lastIdx,
      renderMode: 'gibs',
      gibsLayer: 'truecolor',
      compare: true,
      title: `4. Comparativa ${startDate} vs. ${endDate}`,
      text: `Arrastra la cortinilla central para contrastar el estado inicial de ${rawTitle} frente al cierre de ventana sobre el modelo 3D.`,
    },
  ];
}

export default function StoryModeTour({
  dataset,
  storyModeActive,
  setStoryModeActive,
  tFloat,
  setTFloat,
  setRenderMode,
  setGibsLayerId,
  setOpticalMode,
  setCompareMode,
  setIsPlaying,
  setExaggeration,
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const script =
    dataset?.is_live || !STORY_SCRIPTS[dataset?.id]
      ? buildLiveStoryScript(dataset)
      : STORY_SCRIPTS[dataset.id];

  useEffect(() => {
    setStepIdx(0);
  }, [dataset?.id]);

  // Al activarse un paso, aplica su modo visual/capa y avanza suavemente tFloat hacia s.t
  useEffect(() => {
    if (!storyModeActive) return;
    const s = script[stepIdx];
    if (!s) return;

    setIsPlaying(false);
    if (typeof setRenderMode === 'function') {
      setRenderMode(s.renderMode || 'gibs');
    } else if (typeof setOpticalMode === 'function') {
      setOpticalMode(s.renderMode === 'gibs');
    }
    if (s.gibsLayer && typeof setGibsLayerId === 'function') {
      setGibsLayerId(s.gibsLayer);
    }
    setCompareMode(Boolean(s.compare));

    const maxIdx = Math.max(0, (dataset?.timeline?.length || 1) - 1);
    const startT = Number.isFinite(Number(tFloat)) ? Math.max(0, Math.min(maxIdx, Number(tFloat))) : 0;
    const targetT = Math.max(0, Math.min(maxIdx, s.t));
    const startMs = performance.now();
    const duration = 900;
    let rafId;

    const animateT = (now) => {
      const p = Math.max(0, Math.min(1, (now - startMs) / duration));
      const ease = 1 - Math.pow(1 - p, 3);
      const nextVal = Math.max(0, Math.min(maxIdx, startT + (targetT - startT) * ease));
      setTFloat(nextVal);
      if (p < 1) {
        rafId = requestAnimationFrame(animateT);
      }
    };
    rafId = requestAnimationFrame(animateT);

    const stepTimer = setTimeout(() => {
      if (stepIdx + 1 >= script.length) {
        setStoryModeActive(false);
        setStepIdx(0);
      } else {
        setStepIdx(stepIdx + 1);
      }
    }, 4500);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(stepTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyModeActive, stepIdx, dataset?.id]);

  const currentStep = script[stepIdx] || script[0];
  const progressPct = ((stepIdx + 1) / Math.max(1, script.length)) * 100;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          if (!storyModeActive) setStepIdx(0);
          setStoryModeActive((v) => !v);
        }}
        title={storyModeActive ? 'Detener Demo' : 'Demo rápida'}
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs transition-all ${
          storyModeActive
            ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-semibold shadow-sm'
            : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-100 font-medium'
        }`}
      >
        {storyModeActive ? <Square className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5 text-zinc-300" />}
        <span className="hidden sm:inline">{storyModeActive ? 'Detener Demo' : 'Demo rápida'}</span>
        <span className="sm:hidden">{storyModeActive ? 'Parar' : 'Demo'}</span>
      </button>

      {storyModeActive &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed bottom-24 sm:bottom-36 left-3 right-3 sm:left-4 sm:right-auto z-40 sm:max-w-sm bg-zinc-900/95 backdrop-blur-xl border border-zinc-700 rounded-2xl p-3.5 sm:p-4 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase tracking-[0.12em]">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
                Recorrido Guiado · {stepIdx + 1}/{script.length}
              </span>
              <button onClick={() => setStoryModeActive(false)} className="text-zinc-300 hover:text-white transition-colors">
                Cerrar
              </button>
            </div>
            <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-100 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-50">{currentStep.title}</div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{currentStep.text}</p>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
