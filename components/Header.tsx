import React, { memo } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import {
  Moon,
  Sun,
  History,
  Bookmark,
  Globe2,
  Settings as SettingsIcon,
  Search,
  SlidersHorizontal
} from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onOpenLanguageSheet: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  onOpenPresets: () => void;
  onOpenSettings: () => void;
  onOpenCommand: () => void;
  historyCount: number;
  presetsCount: number;
}

const Header: React.FC<HeaderProps> = ({
  lang,
  onOpenLanguageSheet,
  isDark,
  onToggleTheme,
  onOpenHistory,
  onOpenPresets,
  onOpenSettings,
  onOpenCommand,
  historyCount,
  presetsCount
}) => {
  const t = translations[lang];
  const langLabel: Record<Language, string> = { pt: 'PT', en: 'EN', es: 'ES' };
  const copy = {
    pt: { create: 'Criar', command: 'Comandos', settings: 'Configurações', language: 'Idioma', nav: 'Navegação do workspace', actions: 'Ações do workspace' },
    es: { create: 'Crear', command: 'Comandos', settings: 'Configuración', language: 'Idioma', nav: 'Navegación del workspace', actions: 'Acciones del workspace' },
    en: { create: 'Create', command: 'Command', settings: 'Settings', language: 'Language', nav: 'Workspace navigation', actions: 'Workspace actions' }
  }[lang];

  const actionClass = 'pro-nav-button';

  return (
    <>
      {/* Desktop — professional instrument rail. The mark is intentionally symbol-only. */}
      <aside className="pro-rail hidden lg:flex" aria-label={copy.nav}>
        <div className="pro-rail-top">
          <div className="pro-brand" aria-label="Elite Prompts">
            <span className="pro-brand-orbit" aria-hidden="true">
              <svg viewBox="0 0 36 36" role="presentation">
                <circle className="orbit-ring orbit-ring-outer" cx="18" cy="18" r="13" />
                <path className="orbit-ring orbit-ring-inner" d="M8.5 21.5c3.2-7.5 10.5-11.4 19-7.9" />
                <path className="orbit-cut" d="M12 25c4.5 2.1 10.2 1.5 14.2-1.8" />
                <circle className="orbit-core" cx="18" cy="18" r="4" />
              </svg>
            </span>
          </div>
          <button type="button" onClick={onOpenCommand} className={`${actionClass} pro-nav-primary`} title={copy.command}>
            <Search size={18} strokeWidth={1.7} />
          </button>
        </div>

        <nav className="pro-rail-nav">
          <button type="button" onClick={onOpenPresets} className={actionClass} title={t.nav.presets}>
            <Bookmark size={18} strokeWidth={1.65} />
            {presetsCount > 0 && <span className="pro-nav-dot" />}
          </button>
          <button type="button" onClick={onOpenHistory} className={actionClass} title={t.nav.history}>
            <History size={18} strokeWidth={1.65} />
            {historyCount > 0 && <span className="pro-nav-dot" />}
          </button>
          <span className="pro-rail-rule" />
          <button type="button" onClick={onOpenLanguageSheet} className={actionClass} title={copy.language}>
            <Globe2 size={18} strokeWidth={1.65} />
            <span className="pro-nav-lang">{langLabel[lang]}</span>
          </button>
          <button type="button" onClick={onToggleTheme} className={actionClass} title={isDark ? t.nav.themeLight : t.nav.themeDark}>
            {isDark ? <Sun size={18} strokeWidth={1.65} /> : <Moon size={18} strokeWidth={1.65} />}
          </button>
        </nav>

        <div className="pro-rail-bottom">
          <button type="button" onClick={onOpenSettings} className={actionClass} title={copy.settings}>
            <SettingsIcon size={18} strokeWidth={1.65} />
          </button>
        </div>
      </aside>

      {/* Mobile — deliberately compact, app-like top bar. */}
      <header className="mobile-topbar lg:hidden">
        <div className="mobile-topbar-inner">
          <div className="mobile-brand" aria-label="Elite Prompts">
            <span className="pro-brand-orbit" aria-hidden="true">
              <svg viewBox="0 0 36 36" role="presentation">
                <circle className="orbit-ring orbit-ring-outer" cx="18" cy="18" r="13" />
                <path className="orbit-ring orbit-ring-inner" d="M8.5 21.5c3.2-7.5 10.5-11.4 19-7.9" />
                <path className="orbit-cut" d="M12 25c4.5 2.1 10.2 1.5 14.2-1.8" />
                <circle className="orbit-core" cx="18" cy="18" r="4" />
              </svg>
            </span>
          </div>
          <button type="button" onClick={onOpenCommand} className="mobile-topbar-context" title={copy.command}>
            <SlidersHorizontal size={16} strokeWidth={1.7} />
            <span>{copy.create}</span>
          </button>

          <nav className="mobile-topbar-actions" aria-label={copy.actions}>
            <button type="button" onClick={onOpenPresets} className="mobile-topbar-button" title={t.nav.presets}>
              <Bookmark size={17} strokeWidth={1.65} />
            </button>
            <button type="button" onClick={onOpenHistory} className="mobile-topbar-button" title={t.nav.history}>
              <History size={17} strokeWidth={1.65} />
            </button>
            <button type="button" onClick={onOpenLanguageSheet} className="mobile-topbar-button mobile-lang-button" title={copy.language}>
              <Globe2 size={16} strokeWidth={1.65} />
              <span>{langLabel[lang]}</span>
            </button>
            <button type="button" onClick={onToggleTheme} className="mobile-topbar-button" title={isDark ? t.nav.themeLight : t.nav.themeDark}>
              {isDark ? <Sun size={17} strokeWidth={1.65} /> : <Moon size={17} strokeWidth={1.65} />}
            </button>
            <button type="button" onClick={onOpenSettings} className="mobile-topbar-button" title={copy.settings}>
              <SettingsIcon size={17} strokeWidth={1.65} />
            </button>
          </nav>
        </div>
      </header>
    </>
  );
};

export default memo(Header);
