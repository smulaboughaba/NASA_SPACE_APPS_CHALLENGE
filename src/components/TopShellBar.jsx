import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Globe2, Info, Radio, Search, Settings, Sparkles, User } from 'lucide-react';
import { getCopy } from '../utils/i18n';

export function ModeSwitchPill({ activeMode, onChangeMode, lang = 'es', compact = false }) {
  const t = getCopy(lang);
  const tabs = [
    { id: 'search', label: t.modeSearch, short: lang === 'en' ? 'Search' : 'Buscar', Icon: Search },
    { id: 'earth_engine', label: t.modeEarth, short: 'Earth', Icon: Globe2 },
    { id: 'agent', label: t.modeAgent, short: 'Agent', Icon: Sparkles },
  ];

  const containerRef = useRef(null);
  const btnRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const wrap = containerRef.current;
      const btn = btnRefs.current[activeMode];
      if (!wrap || !btn) return;
      setIndicator({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        ready: true,
      });
    };
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeMode, lang, compact]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Modos de trabajo GEO-WAVE"
      className={`relative inline-flex items-center rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${compact ? 'p-0.5 gap-0.5' : 'p-1 gap-1'
        }`}
    >
      {/* Indicador deslizante fluido entre modos */}
      {indicator.ready && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute rounded-full bg-white/15 border border-white/15 shadow-inner transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${compact ? 'top-0.5 bottom-0.5' : 'top-1 bottom-1'
            }`}
          style={{ left: `${indicator.left}px`, width: `${indicator.width}px` }}
        />
      )}

      {tabs.map(({ id, label, short, Icon }) => {
        const active = activeMode === id;
        return (
          <button
            key={id}
            ref={(el) => {
              if (el) btnRefs.current[id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChangeMode?.(id)}
            className={`relative z-10 inline-flex items-center gap-1 sm:gap-1.5 rounded-full transition-colors duration-200 whitespace-nowrap ${compact ? 'px-2 sm:px-2.5 py-1 text-[11px]' : 'px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs'
              } ${active ? 'text-white font-medium' : 'text-zinc-400 hover:text-zinc-100'}`}
          >
            <Icon className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} shrink-0 transition-colors ${active && id === 'earth_engine' ? 'text-cyan-300' : active && id === 'agent' ? 'text-emerald-300' : ''}`} />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{short}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TopRightUtilities({ settings, onUpdateSettings, apiMode }) {
  const lang = settings?.lang || 'es';
  const t = getCopy(lang);
  const [openMenu, setOpenMenu] = useState(null); // null | 'lang' | 'settings' | 'profile'
  const wrapRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative flex items-center gap-0.5 sm:gap-2">
      {/* Selector de idioma */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((m) => (m === 'lang' ? null : 'lang'))}
          className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="sm:hidden font-mono uppercase">{lang}</span>
          <span className="hidden sm:inline">{t.langLabel}</span>
          <ChevronDown className="w-3 h-3 text-zinc-400" />
        </button>

        {openMenu === 'lang' && (
          <div className="absolute right-0 mt-2 w-36 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1 z-50">
            {[
              { code: 'es', label: 'Español' },
              { code: 'en', label: 'English' },
            ].map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  onUpdateSettings?.({ lang: opt.code });
                  setOpenMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${lang === opt.code ? 'bg-white/15 text-white font-medium' : 'text-zinc-300 hover:bg-white/5'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ajustes */}
      <div className="relative">
        <button
          type="button"
          aria-label={t.settingsTitle}
          onClick={() => setOpenMenu((m) => (m === 'settings' ? null : 'settings'))}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openMenu === 'settings' ? 'bg-white/15 text-white' : 'text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
        >
          <Settings className="w-4 h-4" />
        </button>

        {openMenu === 'settings' && (
          <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-4 space-y-3.5 z-50 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-zinc-100">{t.settingsTitle}</span>
              <span className="text-[10px] font-mono text-emerald-300">
                {apiMode === 'local' ? t.liveLocal : apiMode === 'web' ? t.liveWeb : t.connecting}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] text-zinc-400">{t.dataSourceLabel}</div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'auto', label: t.dataAuto },
                  { id: 'web', label: 'Web' },
                  { id: 'local', label: 'Local' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateSettings?.({ dataSourceMode: opt.id })}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] transition-colors ${(settings?.dataSourceMode || 'auto') === opt.id
                      ? 'bg-cyan-400/20 border-cyan-400/60 text-cyan-200 font-medium'
                      : 'bg-zinc-950/80 border-white/10 text-zinc-300 hover:border-white/20'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] text-zinc-400">{t.defaultRangeLabel}</div>
              <div className="grid grid-cols-3 gap-1">
                {[30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => onUpdateSettings?.({ defaultRangeDays: days })}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-mono transition-colors ${(settings?.defaultRangeDays || 60) === days
                      ? 'bg-cyan-400/20 border-cyan-400/60 text-cyan-200 font-medium'
                      : 'bg-zinc-950/80 border-white/10 text-zinc-300 hover:border-white/20'
                      }`}
                  >
                    {days} {t.daysUnit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info / Perfil */}
      <div className="relative">
        <button
          type="button"
          aria-label={t.infoTitle}
          onClick={() => setOpenMenu((m) => (m === 'profile' ? null : 'profile'))}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${openMenu === 'profile'
            ? 'bg-white/15 border-white/30 text-white'
            : 'border-white/15 text-zinc-300 hover:text-white hover:bg-white/5'
            }`}
        >
          <User className="w-4 h-4" />
        </button>

        {openMenu === 'profile' && (
          <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-4 space-y-2.5 z-50 text-xs">
            <div className="flex items-center gap-2 font-semibold text-zinc-100">
              <Info className="w-3.5 h-3.5 text-cyan-300" />
              {t.infoTitle}
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">{t.infoBody}</p>
            <div className="pt-1 border-t border-white/10 text-[10px] font-mono text-zinc-400 leading-snug">
              {t.shortcutsLabel}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TopShellBar({
  activeMode,
  onChangeMode,
  settings,
  onUpdateSettings,
  apiMode,
  showLeftBrand = false,
  showApiBadge = false,
}) {
  const t = getCopy(settings?.lang || 'es');

  return (
    <header className="pointer-events-none fixed top-3 left-2.5 right-2.5 sm:top-4 sm:left-4 sm:right-4 z-30 flex items-center justify-between gap-1.5 sm:gap-2">
      {/* Esquina superior izquierda: colapsada en móvil cuando está vacía; simétrica md:flex-1 en escritorio */}
      <div
        className={`pointer-events-auto items-center gap-2.5 min-w-0 ${
          showLeftBrand || showApiBadge ? 'flex md:flex-1' : 'hidden md:flex md:flex-1'
        }`}
      >
        {showLeftBrand && (
          <button
            type="button"
            onClick={() => onChangeMode?.('search')}
            title="GEO-WAVE"
            className="inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/5 transition-colors shrink-0"
          >
            <img
              src="/assets/geo-wave-icon-light.png"
              alt="GEO-WAVE"
              className="w-7 h-7 object-contain"
            />
          </button>
        )}

        {showApiBadge && (
          <span
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border backdrop-blur-xl ${apiMode
              ? 'bg-zinc-900/80 border-emerald-500/35 text-emerald-300'
              : 'bg-zinc-900/80 border-white/10 text-zinc-400'
              }`}
          >
            <Radio className="w-2.5 h-2.5" />
            {apiMode === null ? t.connecting : apiMode === 'local' ? t.liveLocal : t.liveWeb}
          </span>
        )}
      </div>

      {/* Centro: Switch principal */}
      <div className="pointer-events-auto shrink-0">
        <ModeSwitchPill
          activeMode={activeMode}
          onChangeMode={onChangeMode}
          lang={settings?.lang || 'es'}
        />
      </div>

      {/* Derecha: Idioma + Ajustes + Perfil */}
      <div className="pointer-events-auto flex md:flex-1 items-center justify-end min-w-0 shrink-0">
        <TopRightUtilities
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          apiMode={apiMode}
        />
      </div>
    </header>
  );
}

