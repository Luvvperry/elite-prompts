import React from 'react';
import { Language } from '../types';

interface LanguageGateProps {
  onChoose: (language: Language) => void;
}

const options: Array<{ language: Language; name: string; native: string }> = [
  { language: 'en', name: 'English', native: 'ENGLISH' },
  { language: 'pt', name: 'Português', native: 'BRASIL' },
  { language: 'es', name: 'Español', native: 'ESPAÑOL' }
];

const InstagramMark = () => (
  <svg className="instagram-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
    <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
    <circle cx="12" cy="12" r="4.1" />
    <circle cx="17.4" cy="6.7" r=".9" fill="currentColor" stroke="none" />
  </svg>
);

const LanguageGate: React.FC<LanguageGateProps> = ({ onChoose }) => {
  return (
    <main className="language-gate" aria-labelledby="language-gate-title">
      <div className="language-gate-inner">
        <header className="language-gate-brand">
          <div className="language-gate-brand-name">
            <span className="language-gate-mark" aria-hidden="true">✦</span>
            <span>ELITE PROMPTS</span>
          </div>
          <a
            href="https://www.instagram.com/goatxav/"
            target="_blank"
            rel="noreferrer"
            className="language-gate-instagram instagram-top-link"
            aria-label="Open @goatxav on Instagram"
            title="@goatxav"
          >
            <InstagramMark />
            <span>@goatxav</span>
          </a>
        </header>

        <section className="language-gate-hero">
          <p className="language-gate-kicker">WELCOME / BEM-VINDO</p>
          <h1 id="language-gate-title">Choose your<br />language.</h1>
          <p className="language-gate-subtitle">Escolha como você quer ver o seu estúdio de prompts.</p>
        </section>

        <div className="language-gate-options" role="list" aria-label="Choose language">
          {options.map((option, index) => (
            <button
              key={option.language}
              type="button"
              className="language-gate-option"
              onClick={() => onChoose(option.language)}
              role="listitem"
            >
              <span className="language-gate-option-number">0{index + 1}</span>
              <span className="language-gate-option-name">{option.name}</span>
              <span className="language-gate-option-native">{option.native}</span>
            </button>
          ))}
        </div>

        <footer className="language-gate-footer">
          <span>ELITE PROMPTS — REAL IMAGE INTELLIGENCE</span>
        </footer>
      </div>
    </main>
  );
};

export default LanguageGate;
