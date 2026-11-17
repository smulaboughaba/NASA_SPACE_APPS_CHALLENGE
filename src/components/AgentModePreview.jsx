import React from 'react';
import { Globe2, MapPin, Search, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { getCopy } from '../utils/i18n';

export default function AgentModePreview({
  lang = 'es',
  draftZone,
  activeDatasetTitle,
  onGoSearch,
  onGoEarthEngine,
}) {
  const t = getCopy(lang);
  const pinnedLabel = activeDatasetTitle || draftZone?.placeLabel || `${draftZone?.lat ?? 39.4}°, ${draftZone?.lon ?? -0.35}°`;

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center px-4 pt-16 pb-6">
      <div className="max-w-xl w-full rounded-3xl bg-zinc-900/75 backdrop-blur-xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-200 text-[11px] font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          {t.agentPreviewBadge}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 tracking-tight">
            {t.agentPreviewTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{t.agentPreviewDesc}</p>
        </div>

        <div className="rounded-2xl bg-zinc-950/85 border border-white/10 p-3.5 space-y-2 text-xs">
          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-300" />
            {t.agentContextPinned}
          </div>
          <div className="text-zinc-100 font-medium truncate">{pinnedLabel}</div>
          <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-zinc-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10">
              <Terminal className="w-3 h-3 text-emerald-300" /> Sandbox & Harness (Fases 4–5)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-white/10">
              <ShieldCheck className="w-3 h-3 text-cyan-300" /> {draftZone?.startDate} → {draftZone?.endDate}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onGoEarthEngine}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-semibold text-xs transition-colors"
          >
            <Globe2 className="w-4 h-4" />
            {t.goToEarthEngine}
          </button>
          <button
            type="button"
            onClick={onGoSearch}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-white/15 text-zinc-200 text-xs font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            {t.backToSearch}
          </button>
        </div>
      </div>
    </div>
  );
}

