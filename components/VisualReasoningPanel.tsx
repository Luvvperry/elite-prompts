import React, { useState } from 'react';
import { Camera, Crosshair, Fingerprint, Lightbulb, Move3d, ScanLine } from 'lucide-react';
import { AutoDetectedParams, Language } from '../types';

interface Props { lang: Language; detected?: AutoDetectedParams; referencesCount: number; isLoading: boolean; }
const labelsByLang = {
  en: { title:'VISUAL REASONING', sub:'Compact scene evidence · no hidden chain exposed', identity:'IDENTITY LOCK', camera:'CAMERA GEOMETRY', light:'LIGHT DIRECTION', physics:'BODY PHYSICS', environment:'SCENE RECONSTRUCTION', capture:'IMAGE CHARACTER' },
  es: { title:'VISUAL REASONING', sub:'Evidencia compacta de escena · sin cadena interna', identity:'IDENTIDAD BLOQUEADA', camera:'GEOMETRÍA DE CÁMARA', light:'DIRECCIÓN DE LUZ', physics:'FÍSICA CORPORAL', environment:'RECONSTRUCCIÓN DE ESCENA', capture:'CARÁCTER DE IMAGEN' },
  pt: { title:'VISUAL REASONING', sub:'Evidência compacta da cena · sem cadeia interna exposta', identity:'IDENTIDADE BLOQUEADA', camera:'GEOMETRIA DA CÂMERA', light:'DIREÇÃO DA LUZ', physics:'FÍSICA CORPORAL', environment:'RECONSTRUÇÃO DA CENA', capture:'CARÁTER DA IMAGEM' }
};
const valuesByLang = {
  en: { refs: (n:number) => n ? `${n} reference${n > 1 ? 's' : ''} · locked` : 'idea-led scene · inferred', camera:'rear smartphone · 1x main lens', light:'source and falloff will be resolved', physics:'weight, contact and joints resolved', environment:'foreground · subject plane · background', capture:'ordinary phone capture · no fake bokeh' },
  es: { refs: (n:number) => n ? `${n} referencia${n > 1 ? 's' : ''} · bloqueada${n > 1 ? 's' : ''}` : 'escena guiada por idea · inferida', camera:'smartphone trasero · lente principal 1x', light:'fuente y caída por resolver', physics:'peso, contacto y articulaciones resueltos', environment:'primer plano · sujeto · fondo', capture:'captura común · sin bokeh artificial' },
  pt: { refs: (n:number) => n ? `${n} referência${n > 1 ? 's' : ''} · bloqueada${n > 1 ? 's' : ''}` : 'cena guiada pela ideia · inferida', camera:'smartphone traseiro · lente principal 1x', light:'fonte e queda a resolver', physics:'peso, contato e articulações resolvidos', environment:'primeiro plano · sujeito · fundo', capture:'captura comum · sem bokeh artificial' }
};

export default function VisualReasoningPanel({ lang, detected, referencesCount, isLoading }: Props) {
  const labels = labelsByLang[lang];
  const values = valuesByLang[lang];
  const [expanded, setExpanded] = useState(false);
  const d = detected || {};
  const rows = [
    { icon: Fingerprint, label: labels.identity, value: values.refs(referencesCount) },
    { icon: Camera, label: labels.camera, value: d.camera || values.camera },
    { icon: Lightbulb, label: labels.light, value: d.lighting || d.flash || values.light },
    { icon: Move3d, label: labels.physics, value: d.pose || d.behavior || values.physics },
    { icon: ScanLine, label: labels.environment, value: d.environment || values.environment },
    { icon: Crosshair, label: labels.capture, value: d.framing || values.capture }
  ];
  return <section className={`reasoning-panel ${isLoading ? 'is-processing' : ''} ${expanded ? 'is-expanded' : ''}`} aria-label={labels.title}>
    <header><div><span className="reasoning-eyebrow"><i />{labels.title}</span><p>{labels.sub}</p></div><span className="reasoning-status"><b />{isLoading ? 'REASONING' : 'READY'}</span></header>
    <div className="reasoning-grid">{rows.map(({icon: Icon,label,value}) => <div className="reasoning-item" key={label}><Icon size={15}/><div><span>{label}</span><strong>{value}</strong></div><em>LOCKED</em></div>)}</div>
    <button className="reasoning-expand" type="button" onClick={() => setExpanded(value => !value)}>{expanded ? (lang === 'pt' ? 'ocultar análise' : lang === 'es' ? 'ocultar análisis' : 'hide full analysis') : (lang === 'pt' ? 'ver análise completa' : lang === 'es' ? 'ver análisis completo' : 'view full analysis')}</button>
  </section>;
}
