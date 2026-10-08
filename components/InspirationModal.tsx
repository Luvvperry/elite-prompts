import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InspirationModal: React.FC<InspirationModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const inspirations = [
    {
      id: 1,
      image: 'https://picsum.photos/seed/lowangle/400/500',
      title: t('angleLow'),
      prompt: t('angleLowPrompt')
    },
    {
      id: 2,
      image: 'https://picsum.photos/seed/highangle/400/500',
      title: t('angleHigh'),
      prompt: t('angleHighPrompt')
    },
    {
      id: 3,
      image: 'https://picsum.photos/seed/selfie/400/500',
      title: t('angleSelfie'),
      prompt: t('angleSelfiePrompt')
    }
  ];

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#faf8f5] dark:bg-[#0c0e14] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/70 dark:bg-stone-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#1a1917] dark:text-[#f4f4f5]">
                {t('inspirationTitle')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
                {language === 'es' ? 'Composiciones fotográficas y ángulos de cámara' : 'Photographic camera angles and framing inspiration'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500 dark:text-stone-400 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 grid grid-cols-1 md:grid-cols-3 gap-6 custom-scrollbar">
          {inspirations.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col group hover:shadow-md hover:border-violet-300 dark:hover:border-violet-600 transition-all shadow-xs"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 font-display font-semibold text-sm text-white">
                  {item.title}
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                <p className="font-mono text-xs text-stone-700 dark:text-stone-300 line-clamp-4 leading-relaxed">
                  {item.prompt}
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.prompt)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    copiedId === item.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 hover:bg-violet-600 dark:hover:bg-violet-600 hover:text-white text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('copied')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>{t('copyPositive')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InspirationModal;
