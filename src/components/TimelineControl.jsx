import React, { useState } from 'react';
import { Activity, Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Columns2, Eye, Film, Pause, Play, Repeat, Sigma, SkipBack } from 'lucide-react';
import { getTemporalObservationStatus } from '../utils/sarMath';

export default function TimelineControl({
  dataset,
  tFloat,
  setTFloat,
  isPlaying,
  setIsPlaying,
  onTogglePlay,
  onManualSeek,
  isLooping,
  setIsLooping,
  playbackSpeed,
  setPlaybackSpeed,
  discreteOnly = false,
  setDiscreteOnly,
  renderMode = 'hybrid',
  setRenderMode,
  opticalMode,
  setOpticalMode,
  compareMode,
  setCompareMode,
  splitX,
  setSplitX,
  buffers,
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const effectiveRenderMode = renderMode || (opticalMode ? 'optical' : 'hybrid');
  const selectRenderMode = (mode) => {
    if (typeof setRenderMode === 'function') {
      setRenderMode(mode);
    } else if (typeof setOpticalMode === 'function') {
      setOpticalMode(mode === 'optical');
    }
  };
  const timeline = dataset?.timeline || [];
  const maxIdx = Math.max(0, timeline.length - 1);
  const safeT = Number.isFinite(Number(tFloat)) ? Math.max(0, Math.min(maxIdx, Number(tFloat))) : 0;
  const status = getTemporalObservationStatus(timeline, safeT, buffers?.confianza);

  const handleSeek = (val) => {
    const num = Number(val);
    let clamped = Number.isFinite(num) ? Math.max(0, Math.min(maxIdx, num)) : 0;
    if (discreteOnly) clamped = Math.round(clamped);
    if (typeof onManualSeek === 'function') {
      onManualSeek(clamped);
    } else {
      setIsPlaying?.(false);
      setTFloat?.(clamped);
    }
  };

  const handlePlayToggle = () => {
    if (typeof onTogglePlay === 'function') {
      onTogglePlay();
    } else if (typeof setIsPlaying === 'function') {
      if (!isPlaying && safeT >= maxIdx - 0.02) {
        setTFloat?.(0);
      }
      setIsPlaying((p) => !p);
    }
  };

  const stepPrev = () => {
    const target = Math.max(0, Math.ceil(safeT) - 1);
    handleSeek(target);
  };
  const stepNext = () => {
    const target = Math.min(maxIdx, Math.floor(safeT) + 1);
    handleSeek(target);
  };

  return (
    <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 px-3 sm:px-4 py-2 sm:py-3 flex flex-col gap-2 sm:gap-2.5 shrink-0">
      {/* Barra móvil ultra-compacta: Play + Anterior/Siguiente + Slider + Fecha + Toggle plegable */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={handlePlayToggle}
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold transition-colors shadow-sm shrink-0"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={stepPrev}
          aria-label="Anterior"
          className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={stepNext}
          aria-label="Siguiente"
          className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <input
          type="range"
          min={0}
          max={maxIdx}
          step={discreteOnly ? 1 : 0.01}
          value={safeT}
          onChange={(e) => handleSeek(parseFloat(e.target.value))}
          className="flex-1 min-w-0 h-2 cursor-pointer"
        />

        <span className="text-[11px] font-mono tabular-nums text-zinc-200 shrink-0">
          {status.interpolatedDate}
        </span>

        <button
          type="button"
          onClick={() => setMobileExpanded((v) => !v)}
          aria-expanded={mobileExpanded}
          title="Más controles temporales"
          className={`p-1.5 rounded-lg border text-xs shrink-0 transition-colors ${
            mobileExpanded
              ? 'bg-cyan-400/15 border-cyan-400/50 text-cyan-200'
              : 'bg-zinc-800 border-zinc-700 text-zinc-300'
          }`}
        >
          {mobileExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Controles completos (siempre visibles en md+, plegables en móvil) */}
      <div className={`${mobileExpanded ? 'flex' : 'hidden'} md:flex flex-col gap-2.5`}>
      {/* Fila superior: Transporte, velocidad, estado de pasada y toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handlePlayToggle}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </button>

          <button
            onClick={() => handleSeek(0)}
            title="Volver al inicio (T0)"
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={stepPrev}
            title="Adquisición anterior"
            className="hidden md:inline-flex p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={stepNext}
            title="Siguiente adquisición"
            className="hidden md:inline-flex p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsLooping((l) => !l)}
            title="Bucle continuo"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
              isLooping
                ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-semibold'
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 font-medium'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            Loop
          </button>

          {/* Selector de velocidad */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[11px] font-mono tabular-nums">
            {[0.5, 1, 2].map((sp) => (
              <button
                key={sp}
                onClick={() => setPlaybackSpeed?.(sp)}
                className={`px-2 py-1 rounded-md transition-colors ${
                  playbackSpeed === sp ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {sp}×
              </button>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-1 ml-1.5 pl-2.5 border-l border-zinc-800">
            <button
              onClick={() => handleSeek(0)}
              className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                safeT < 0.25
                  ? 'bg-zinc-700 border-zinc-500 text-zinc-100 font-medium'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              Pre-evento
            </button>
            <button
              onClick={() => handleSeek(Math.min(maxIdx, Math.max(1, Math.floor(maxIdx / 2))))}
              className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                safeT >= 0.6 && safeT <= maxIdx - 0.6
                  ? 'bg-zinc-700 border-zinc-500 text-zinc-100 font-medium'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              Durante el evento
            </button>
            <button
              onClick={() => handleSeek(maxIdx)}
              className={`px-2.5 py-1 rounded-md text-[11px] border transition-colors ${
                safeT > maxIdx - 0.25
                  ? 'bg-zinc-700 border-zinc-500 text-zinc-100 font-medium'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white'
              }`}
            >
              Post-evento
            </button>
          </div>
        </div>

        {/* Estado de adquisición satelital + modo pasadas reales */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`flex items-center justify-center gap-2 px-2.5 sm:px-3 py-1 rounded-full border text-[11px] sm:text-xs font-mono tabular-nums whitespace-nowrap sm:min-w-[238px] max-w-full ${
              status.isReal
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/50 border-amber-500/40 text-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                status.isReal ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="truncate">
              {status.isReal
                ? `Dato observado · ${status.nearestFrame?.fecha}`
                : `Interpolado (${status.confidencePct}%) · ${status.interpolatedDate}`}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !discreteOnly;
              setDiscreteOnly?.(next);
              if (next) {
                setTFloat?.(Math.round(safeT));
              }
            }}
            title="Salta exclusivamente entre pasadas satelitales reales observadas (sin interpolación visual intermedia)"
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              discreteOnly
                ? 'bg-emerald-400/20 border-emerald-400/70 text-emerald-200'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
            }`}
          >
            Solo pasadas reales
          </button>
        </div>

        {/* Controles Visuales y Comparador */}
        <div className="flex items-center gap-2">

          <button
            onClick={() => setCompareMode((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
              compareMode
                ? 'bg-zinc-100 border-zinc-100 text-zinc-950 font-semibold'
                : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200 font-medium'
            }`}
          >
            <Columns2 className={`w-3.5 h-3.5 ${compareMode ? 'text-zinc-950' : 'text-zinc-300'}`} />
            Antes/Después
          </button>
        </div>
      </div>

      {/* Slider continuo Eje T + marcadores (en escritorio; móvil usa la barra superior compacta) */}
      <div className="flex flex-col gap-1.5">
        <div className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            EJE T
          </span>
          <input
            type="range"
            min={0}
            max={maxIdx}
            step={discreteOnly ? 1 : 0.01}
            value={safeT}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-2 cursor-pointer"
          />
          <span className="text-xs font-mono tabular-nums text-zinc-200 w-24 text-right shrink-0">
            {status.interpolatedDate}
          </span>
        </div>

        <div className="flex justify-between text-[11px] font-mono tabular-nums text-zinc-400 md:px-12 gap-3 overflow-x-auto">
          {timeline.map((step, idx) => (
            <button
              key={step.fecha}
              onClick={() => handleSeek(idx)}
              className={`whitespace-nowrap transition-colors ${
                Math.abs(safeT - idx) < 0.22
                  ? 'text-zinc-100 font-semibold underline underline-offset-4 decoration-zinc-400'
                  : 'hover:text-zinc-200'
              }`}
            >
              {step.fecha} · {step.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {/* Descripción de fase + cortinilla si está activo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-xs min-h-[28px]">
        <div className="text-zinc-300 flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 shrink-0">
            {status.nearestFrame?.etiqueta}
          </span>
          <span className="truncate">{status.nearestFrame?.descripcion}</span>
        </div>
        {compareMode && (
          <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums text-zinc-300">
            <span>Divisor Antes | Actual</span>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.01}
              value={splitX}
              onChange={(e) => setSplitX(parseFloat(e.target.value))}
              className="w-28 h-1.5 cursor-pointer"
            />
            <span>{Math.round(splitX * 100)}%</span>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
