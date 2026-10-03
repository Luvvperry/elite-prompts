import React from 'react';
import { ArrowUpRight, Camera, Check, X } from 'lucide-react';
import { Language } from '../types';

interface Props {
  open: boolean;
  lang: Language;
  onClose: () => void;
  onTry: () => void;
}

const copyByLang = {
  en: { tag: 'NEW UPDATE', title: 'Xavi announces V4', intro: 'The engine no longer fills a template first. It reconstructs the visual logic of the scene before writing.', items: [['01','deeper visual reasoning','camera, distance, perspective, light and physics are solved as one system.'],['02','identity kept separate','the face reference controls who is present, not the look of the whole photograph.'],['03','three rebuilt engines','V1, V2 and V3 now carry different levels of photographic depth.'],['04','new visual workspace','a focused interface for building, checking and comparing prompts.']], try: 'TRY V4', close: 'Close' },
  es: { tag: 'NUEVA ACTUALIZACIÓN', title: 'Xavi anuncia V4', intro: 'El motor ya no rellena una plantilla primero. Reconstruye la lógica visual de la escena antes de escribir.', items: [['01','razonamiento visual más profundo','cámara, distancia, perspectiva, luz y física se resuelven como un sistema.'],['02','identidad separada','la referencia facial controla quién aparece, no el aspecto de toda la fotografía.'],['03','tres motores reconstruidos','V1, V2 y V3 tienen ahora distintos niveles de profundidad fotográfica.'],['04','nuevo workspace visual','una interfaz enfocada para crear, verificar y comparar prompts.']], try: 'PROBAR V4', close: 'Cerrar' },
  pt: { tag: 'NOVA ATUALIZAÇÃO', title: 'Xavi anuncia V4', intro: 'O motor não preenche mais um template primeiro. Ele reconstrói a lógica visual da cena antes de escrever.', items: [['01','raciocínio visual mais profundo','câmera, distância, perspectiva, luz e física são resolvidas como um sistema.'],['02','identidade separada','a referência facial controla quem aparece, não o visual da fotografia inteira.'],['03','três engines reconstruídas','V1, V2 e V3 agora possuem níveis diferentes de profundidade fotográfica.'],['04','novo workspace visual','uma interface focada em criar, validar e comparar prompts.']], try: 'TESTAR V4', close: 'Fechar' }
};

export default function UpdateAnnouncementModal({ open, lang, onClose, onTry }: Props) {
  if (!open) return null;
  const copy = copyByLang[lang];
  return <div className="v4-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="v4-modal-title">
    <div className="v4-modal">
      <button className="v4-modal-close" onClick={onClose} aria-label={copy.close}><X size={17}/></button>
      <div className="v4-modal-orbit"><Camera size={19}/><span /></div>
      <span className="v4-modal-tag">{copy.tag}</span>
      <h2 id="v4-modal-title">{copy.title}</h2>
      <p className="v4-modal-intro">{copy.intro}</p>
      <div className="v4-update-list">{copy.items.map(([num,title,body]) => <div className="v4-update-item" key={num}><span>{num}</span><div><strong>{title}</strong><p>{body}</p></div><Check size={14}/></div>)}</div>
      <div className="v4-modal-actions"><button className="v4-primary-button" onClick={onTry}>{copy.try}<ArrowUpRight size={15}/></button><button className="v4-text-button" onClick={onClose}>{copy.close}</button></div>
    </div>
  </div>;
}
