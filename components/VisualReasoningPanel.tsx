import React from 'react';
import { Camera, Crosshair, Fingerprint, Lightbulb, Move3d, ScanLine } from 'lucide-react';
import { AutoDetectedParams, Language } from '../types';

interface Props { lang: Language; detected?: AutoDetectedParams; referencesCount: number; isLoading: boolean; }
const labelsByLang = {
  en: { title:'VISUAL REASONING', sub:'Compact scene evidence · no hidden chain exposed', identity:'IDENTITY LOCK', camera:'CAMERA GEOMETRY', light:'LIGHT DIRECTION', physics:'BODY PHYSICS', environment:'SCENE RECONSTRUCTION', capture:'IMAGE CHARACTER' },
  es: { title:'VISUAL REASONING', sub:'Evidencia compacta de escena · sin cadena interna', identity:'IDENTIDAD BLOQUEADA', camera:'GEOMETRÍA DE CÁMARA', light:'DIRECCIÓN DE LUZ', physics:'FÍSICA CORPORAL', environment:'RECONSTRUCCIÓN DE ESCENA', capture:'CARÁCTER DE IMAGEN' },
  pt: { title:'VISUAL REASONING', sub:'Evidência compacta da cena · sem cadeia interna exposta', identity:'IDENTIDADE BLOQUEADA', camera:'GEOMETRIA DA CÂMERA', light:'DIREÇÃO DA LUZ', physics:'FÍSICA CORPORAL', environment:'RECONSTRUÇÃO DA CENA', capture:'CARÁTER DA IMAGEM' }
};

export default function VisualReasoningPanel({ lang, detected, referencesCount, isLoading }: Props) {
  const labels = labelsByLang[lang];
  const d = detected || {};
  const rows = [
    { icon: Fingerprint, label: labels.identity, value: referencesCount ? `${referencesCount} reference${referencesCount > 1 ? 's' : ''} · locked` : 'idea-led scene · inferred' },
    { icon: Camera, label: labels.camera, value: d.camera || 'rear smartphone · 1x main lens' },
    { icon: Lightbulb, label: labels.light, value: d.lighting || d.flash || 'source and falloff will be resolved' },
    { icon: Move3d, label: labels.physics, value: d.pose || d.behavior || 'weight, contact and joints resolved' },
    { icon: ScanLine, label: labels.environment, value: d.environment || 'foreground · subject plane · background' },
    { icon: Crosshair, label: labels.capture, value: d.framing || 'ordinary phone capture · no fake bokeh' }
  ];
  return <section className={`reasoning-panel ${isLoading ? 'is-processing' : ''}`} aria-label={labels.title}>
    <header><div><span className="reasoning-eyebrow"><i />{labels.title}</span><p>{labels.sub}</p></div><span className="reasoning-status"><b />{isLoading ? 'REASONING' : 'READY'}</span></header>
    <div className="reasoning-grid">{rows.map(({icon: Icon,label,value}) => <div className="reasoning-item" key={label}><Icon size={15}/><div><span>{label}</span><strong>{value}</strong></div><em>LOCKED</em></div>)}</div>
  </section>;
}
