import React from 'react';
import { useLanguage } from '../LanguageContext';

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExamplesModal: React.FC<ExamplesModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const examples = [
    {
      id: 1,
      image: 'https://picsum.photos/seed/portrait1/400/300',
      title: t('example1Title'),
      positive:
        "Subject A: [blank] An ultra-detailed, HD, authentic portrait captured as if taken by a iPhone 15 Pro Max with a 24mm f/1.8 lens, depicting a subject standing outdoors. The subject is wearing a slightly wrinkled, coarse linen button-up shirt in a faded olive green color. The fabric shows subtle weave textures and a few stray threads near the collar. The environment is a bustling city street during golden hour, with long soft shadows cast across the pavement. The lighting is harsh midday sun diffused by atmospheric haze, creating a warm, slightly washed-out color palette. [USE USER'S PERSONAL IDENTITY FOR SUBJECT; EXTRACT POSE, WARDROBE, LIGHTING, AND SETTING FROM REFERENCE WITHOUT COPYING REFERENCE FACE]",
      negative:
        '[NEGATIVE PROMPT]\n\nstudio lighting, artificial spotlights, softbox, cinematic lighting, dreamy, ethereal, highly stylized illustrations, perfect skin, airbrushed, professional color grading, bokeh, shallow depth of field, dramatic rim lighting, lens flares, hyper-realistic digital painting, 3D render, vector art, watercolor painting, formal wear, suit, tie, indoor office.'
    },
    {
      id: 2,
      image: 'https://picsum.photos/seed/indoor1/400/300',
      title: t('example2Title'),
      positive:
        "Subject A: [blank] An ultra-detailed, HD, authentic portrait captured as if taken by a Google Pixel 8 Pro with a 50mm portrait lens, depicting a subject sitting indoors. The subject is wearing a tightly knit wool sweater in charcoal grey, showing slight pilling on the sleeves. The environment is a dimly lit coffee shop with weathered wood tables and dust particles visible in the air. The lighting is a mix of fluorescent overhead lights and soft diffused natural light coming from a nearby window, creating split lighting on the subject's face with harsh distinct shadows. Subtle digital sensor noise is visible in the darker areas. [USE USER'S PERSONAL IDENTITY FOR SUBJECT; EXTRACT POSE, WARDROBE, LIGHTING, AND SETTING FROM REFERENCE WITHOUT COPYING REFERENCE FACE]",
      negative:
        '[NEGATIVE PROMPT]\n\noutdoor sunlight, sky, trees, natural light, golden hour, cinematic lighting, dreamy, ethereal, highly stylized illustrations, perfect skin, airbrushed, professional color grading, bokeh, dramatic rim lighting, lens flares, hyper-realistic digital painting, 3D render, vector art, watercolor painting, summer clothing.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#faf8f5] dark:bg-[#0c0e14] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 border border-stone-200 dark:border-stone-800 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/70 dark:bg-stone-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-[#1a1917] dark:text-[#f4f4f5]">
                {t('examplesTitle')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
                {language === 'es' ? 'Modelos de prompts fotográficos forenses' : 'Reference forensic prompt models'}
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

        <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-6 custom-scrollbar">
          {examples.map((example) => (
            <div
              key={example.id}
              className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-5 shadow-xs"
            >
              <div className="w-full md:w-1/3 shrink-0">
                <img
                  src={example.image}
                  alt={example.title}
                  className="w-full h-44 object-cover rounded-xl border border-stone-200 dark:border-stone-700"
                />
                <h3 className="font-display font-bold text-sm text-[#1a1917] dark:text-[#f4f4f5] mt-3">
                  {example.title}
                </h3>
              </div>
              <div className="w-full md:w-2/3 flex flex-col gap-3">
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-400 mb-1">
                    {t('positiveBlueprint')}
                  </h4>
                  <p className="font-mono text-xs text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-950 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 line-clamp-4 leading-relaxed">
                    {example.positive}
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                    {t('negativeBlueprint')}
                  </h4>
                  <p className="font-mono text-xs text-stone-600 dark:text-stone-400 bg-stone-50/70 dark:bg-stone-950/70 p-3 rounded-xl border border-stone-200 dark:border-stone-800 line-clamp-2 leading-relaxed italic">
                    {example.negative}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamplesModal;
