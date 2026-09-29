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

const LanguageGate: React.FC<LanguageGateProps> = ({ onChoose }) => {
  return (
    <main className="language-gate" aria-labelledby="language-gate-title">
      <div className="language-gate-inner">
        <header className="language-gate-brand">
          <span className="language-gate-mark" aria-hidden="true">✦</span>
          <span>ELITE PROMPTS</span>
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
          <a
            href="https://www.instagram.com/goatxav/"
            target="_blank"
            rel="noreferrer"
            className="language-gate-instagram"
            aria-label="Open @goatxav on Instagram"
            title="@goatxav"
          >
            <span className="language-gate-instagram-symbol" aria-hidden="true">◎</span>
            <span>@goatxav</span>
          </a>
        </footer>
      </div>
    </main>
  );
};

export default LanguageGate;
