import React, { memo } from 'react';
import { Language } from '../types';
import { translations, localeMeta } from '../translations';
import {
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
  onOpenHistory,
  onOpenPresets,
  onOpenSettings,
  onOpenCommand,
  historyCount,
  presetsCount
}) => {
  const t = translations[lang];
  const langLabel: Record<Language, string> = Object.fromEntries((Object.keys(localeMeta) as Language[]).map((id) => [id, id.toUpperCase()])) as Record<Language, string>;
  const copy = {
    pt: { create: 'Criar', command: 'Comandos', settings: 'Configurações', language: 'Idioma', nav: 'Navegação do workspace', actions: 'Ações do workspace' },
    es: { create: 'Crear', command: 'Comandos', settings: 'Configuración', language: 'Idioma', nav: 'Navegación del workspace', actions: 'Acciones del workspace' },
    en: { create: 'Create', command: 'Command', settings: 'Settings', language: 'Language', nav: 'Workspace navigation', actions: 'Workspace actions' }
  }[lang as 'pt' | 'es' | 'en'] ?? { create: 'Create', command: 'Command', settings: 'Settings', language: 'Language', nav: 'Workspace navigation', actions: 'Workspace actions' };

  const actionClass = 'pro-nav-button';

  return (
    <>
      {/* Desktop — professional instrument rail. The mark is intentionally symbol-only. */}
      <aside className="pro-rail hidden lg:flex" aria-label={copy.nav}>
        <div className="pro-rail-top">
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
