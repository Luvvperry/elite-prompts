import React from 'react';
import { Bookmark, Clock3, Globe2, Settings, Sparkles, X, Zap } from 'lucide-react';
import { Language } from '../types';

interface Props { open:boolean; lang:Language; onClose:()=>void; onHistory:()=>void; onPresets:()=>void; onLanguage:()=>void; onSettings:()=>void; onUpdates:()=>void; onEnglish:()=>void; onJson:()=>void; jsonMode:boolean; }
const words = { en:{menu:'Menu',create:'Create',history:'History',favorites:'Favorites',language:'Language',updates:'News',settings:'Settings',english:'English prompts',json:'JSON output',close:'Close'}, es:{menu:'Menú',create:'Crear',history:'Historial',favorites:'Favoritos',language:'Idioma',updates:'Novedades',settings:'Ajustes',english:'Prompts en inglés',json:'Salida JSON',close:'Cerrar'}, pt:{menu:'Menu',create:'Criar',history:'Histórico',favorites:'Favoritos',language:'Idioma',updates:'Novidades',settings:'Configurações',english:'Prompts em inglês',json:'Saída JSON',close:'Fechar'} };
export default function MobileMenuSheet({open,lang,onClose,onHistory,onPresets,onLanguage,onSettings,onUpdates,onEnglish,onJson,jsonMode}:Props){
 if(!open)return null; const t=words[lang]; const action=(fn:()=>void)=>{fn();onClose()};
 return <div className="mobile-menu-backdrop" onClick={onClose}><section className="mobile-menu-sheet" onClick={e=>e.stopPropagation()} role="dialog" aria-label={t.menu}>
   <header><span>{t.menu}</span><button onClick={onClose} aria-label={t.close}><X size={18}/></button></header>
   <div className="mobile-menu-primary"><button onClick={onClose}><Zap size={16}/><span>{t.create}</span></button><button onClick={()=>action(onHistory)}><Clock3 size={16}/><span>{t.history}</span></button><button onClick={()=>action(onPresets)}><Bookmark size={16}/><span>{t.favorites}</span></button><button onClick={()=>action(onUpdates)}><Sparkles size={16}/><span>{t.updates}</span><b>NEW</b></button></div>
   <div className="mobile-menu-secondary"><button onClick={()=>action(onLanguage)}><Globe2 size={16}/><span>{t.language}</span><em>{lang.toUpperCase()}</em></button><button onClick={()=>action(onSettings)}><Settings size={16}/><span>{t.settings}</span></button><button onClick={()=>action(onEnglish)}><span>EN</span><span>{t.english}</span></button><button onClick={()=>action(onJson)}><span>{'{}'}</span><span>{t.json}</span><em>{jsonMode?'ON':'OFF'}</em></button></div>
 </section></div>;
}
