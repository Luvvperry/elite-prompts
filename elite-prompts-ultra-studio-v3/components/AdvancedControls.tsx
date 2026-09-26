import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  FullSettings, 
  Language, 
  AutoDetectedParams,
  SubjectCount,
  BodyPosition,
  SubjectOrientation,
  WeightDistribution,
  PostureType,
  GazeType,
  CameraDeviceAdvanced,
  CameraLens,
  CameraDistance,
  CameraHeight,
  CameraFraming,
  LightTime,
  LightSource,
  FlashMode,
  FlashBehavior,
  AspectRatioType,
  ReferencePriority,
  ModalityType,
  SurfaceType,
  EnvironmentCondition,
  ObjectRealism,
  CameraMode,
  CameraFeel
} from '../types';
import { translations } from '../translations';
import { 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Sliders, 
  User, 
  Camera, 
  Sun, 
  Car, 
  Shirt, 
  MapPin, 
  ShieldCheck, 
  ArrowRight,
  Maximize2,
  Filter,
  Sparkles,
  Layers,
  Utensils,
  Package
} from 'lucide-react';

interface AdvancedControlsProps {
  lang: Language;
  settings: FullSettings;
  onChange: (settings: FullSettings) => void;
  onGenerate: () => void;
  isLoading: boolean;
  canGenerate: boolean;
  detectedParams?: AutoDetectedParams;
  modality?: ModalityType;
  selectedTypeId?: string;
}

const surfaceKeys: SurfaceType[] = [
  'auto',
  'wood_table',
  'glass_table',
  'stone',
  'concrete',
  'car_hood',
  'car_interior',
  'leather',
  'fabric',
  'bed',
  'floor',
  'counter',
  'desk',
  'metal',
  'asphalt',
  'grass',
  'sand',
  'custom'
];

const environmentConditionKeys: EnvironmentCondition[] = [
  'auto',
  'very_clean',
  'normal',
  'lived_in',
  'slightly_messy',
  'messy',
  'raw',
  'dusty',
  'used',
  'wet',
  'dry'
];

const objectRealismKeys: ObjectRealism[] = [
  'clean_product',
  'natural',
  'used',
  'very_used',
  'imperfect',
  'raw'
];

const cameraModeKeys: CameraMode[] = [
  'auto',
  'rear_main',
  'rear_ultrawide',
  'rear_1x',
  'rear_2x',
  'rear_3x',
  'rear_telephoto',
  'front_camera',
  'mirror_selfie',
  'handheld_pov',
  'chest_pov',
  'overhead',
  'low_angle'
];

const cameraFeelKeys: CameraFeel[] = [
  'auto',
  'very_raw',
  'casual',
  'clean',
  'slightly_shaky',
  'quick_snapshot',
  'distracted_capture',
  'social_media',
  'low_light',
  'direct_flash',
  'older_phone_look'
];

const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  lang,
  settings,
  onChange,
  onGenerate,
  isLoading,
  canGenerate,
  detectedParams,
  modality = 'person',
  selectedTypeId
}) => {
  const t = translations[lang];
  const local = {
    pt: {
      autoContext: 'Automático (contextual)',
      povHeight: 'Altura do POV', handHeight: 'Altura da mão', waist: 'Cintura', chest: 'Peito', eye: 'Olhos', overhead: 'Acima / top-down', low: 'Ângulo baixo', tabletop: 'Olhar para mesa', customHeight: 'Altura personalizada',
      handVisibility: 'Visibilidade das mãos', noHands: 'Sem mãos visíveis', twoHands: 'Duas mãos',
      objectInteraction: 'Interação com objeto', holding: 'Segurando', touching: 'Tocando', opening: 'Abrindo', eating: 'Comendo / bebendo', using: 'Usando', resting: 'Apoiado', placed: 'Colocado na superfície', steering: 'Dirigindo / volante',
      objectDistance: 'Distância do objeto', veryClose: 'Muito perto (macro)', close: 'Perto', medium: 'Média (mesa / bancada)', wideContext: 'Contexto amplo',
      objectPosition: 'Posição do objeto', centered: 'Centralizado', viewerLeft: 'Lado esquerdo do quadro', viewerRight: 'Lado direito do quadro', lowerFrame: 'Parte inferior', upperFrame: 'Parte superior', foreground: 'Primeiro plano',
      objectRealism: 'Realismo do objeto', heldObject: 'Objeto principal / em foco',
      foodHelper: 'POV de comida ativo: descreva arranjo do prato, embalagem, migalhas, gordura e marcas reais somente quando fizer sentido.',
      mood: 'Ambiente / sensação', ordinary: 'Comum / cotidiano', raw: 'Cru / cotidiano real', premium: 'Premium casual', luxury: 'Luxo realista',
      doorState: 'Estado da porta', closed: 'Fechada', openDoor: 'Porta aberta', seatPosition: 'Posição no carro', driverSeat: 'Banco do motorista', passengerSeat: 'Banco do passageiro'
    },
    es: {
      autoContext: 'Automático (contextual)',
      povHeight: 'Altura del POV', handHeight: 'Altura de la mano', waist: 'Cintura', chest: 'Pecho', eye: 'Ojos', overhead: 'Superior / top-down', low: 'Ángulo bajo', tabletop: 'Vista hacia la mesa', customHeight: 'Altura personalizada',
      handVisibility: 'Visibilidad de manos', noHands: 'Sin manos visibles', twoHands: 'Dos manos',
      objectInteraction: 'Interacción con objeto', holding: 'Sosteniendo', touching: 'Tocando', opening: 'Abriendo', eating: 'Comiendo / bebiendo', using: 'Usando', resting: 'Apoyado', placed: 'Colocado sobre superficie', steering: 'Conduciendo / volante',
      objectDistance: 'Distancia del objeto', veryClose: 'Muy cerca (macro)', close: 'Cerca', medium: 'Media (mesa / escritorio)', wideContext: 'Contexto amplio',
      objectPosition: 'Posición del objeto', centered: 'Centrado', viewerLeft: 'Lado izquierdo del encuadre', viewerRight: 'Lado derecho del encuadre', lowerFrame: 'Parte inferior', upperFrame: 'Parte superior', foreground: 'Primer plano',
      objectRealism: 'Realismo del objeto', heldObject: 'Objeto principal / enfocado',
      foodHelper: 'POV de comida activo: describe disposición, empaque, migas, grasa y marcas reales solo cuando tengan sentido.',
      mood: 'Ambiente / sensación', ordinary: 'Común / cotidiano', raw: 'Crudo / cotidiano real', premium: 'Premium casual', luxury: 'Lujo realista',
      doorState: 'Estado de la puerta', closed: 'Cerrada', openDoor: 'Puerta abierta', seatPosition: 'Posición en el auto', driverSeat: 'Asiento del conductor', passengerSeat: 'Asiento del pasajero'
    },
    en: {
      autoContext: 'Auto (contextual)',
      povHeight: 'POV height', handHeight: 'Hand height', waist: 'Waist level', chest: 'Chest level', eye: 'Eye level', overhead: 'Overhead / top-down', low: 'Low angle', tabletop: 'Tabletop look-down', customHeight: 'Custom height',
      handVisibility: 'Hand visibility', noHands: 'No hands visible', twoHands: 'Two hands',
      objectInteraction: 'Object interaction', holding: 'Holding', touching: 'Touching', opening: 'Opening', eating: 'Eating / drinking', using: 'Using', resting: 'Resting', placed: 'Placed on surface', steering: 'Steering / driving',
      objectDistance: 'Object distance', veryClose: 'Very close (macro)', close: 'Close', medium: 'Medium (table / desk)', wideContext: 'Wide context',
      objectPosition: 'Object position', centered: 'Centered', viewerLeft: 'Viewer-left', viewerRight: 'Viewer-right', lowerFrame: 'Lower frame', upperFrame: 'Upper frame', foreground: 'Foreground',
      objectRealism: 'Object realism', heldObject: 'Held / focused object',
      foodHelper: 'Food POV active: describe plate arrangement, packaging, crumbs, grease and real table marks only when physically appropriate.',
      mood: 'Atmosphere / mood', ordinary: 'Ordinary / relatable', raw: 'Raw / everyday authentic', premium: 'Premium casual', luxury: 'Luxury realism',
      doorState: 'Door state', closed: 'Closed', openDoor: 'Open door', seatPosition: 'Seat position', driverSeat: 'Driver seat', passengerSeat: 'Passenger seat'
    }
  }[lang];

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    subject: true,
    poseAction: true,
    pov: false,
    camera: true,
    composition: false,
    light: true,
    environment: false,
    wardrobe: false,
    vehicle: false,
    realismFineTuning: false,
    outputFidelity: false
  });

  // Automatically adjust open sections when modality or type changes (Requirement 18 Context-Aware)
  useEffect(() => {
    if (modality === 'vehicle') {
      setOpenSections({
        vehicle: true,
        camera: true,
        environment: true,
        subject: false,
        poseAction: false,
        pov: false,
        composition: false,
        light: false,
        wardrobe: false,
        realismFineTuning: false,
        outputFidelity: false
      });
    } else if (modality === 'object_pov') {
      setOpenSections({
        pov: true,
        camera: true,
        light: true,
        subject: false,
        poseAction: false,
        composition: false,
        environment: false,
        wardrobe: false,
        vehicle: false,
        realismFineTuning: false,
        outputFidelity: false
      });
    } else if (modality === 'interior' || modality === 'architecture') {
      setOpenSections({
        environment: true,
        camera: true,
        light: true,
        subject: false,
        poseAction: false,
        pov: false,
        composition: false,
        wardrobe: false,
        vehicle: false,
        realismFineTuning: false,
        outputFidelity: false
      });
    } else if (modality === 'product') {
      setOpenSections({
        pov: true,
        camera: true,
        environment: true,
        subject: false,
        poseAction: false,
        composition: false,
        light: false,
        wardrobe: false,
        vehicle: false,
        realismFineTuning: false,
        outputFidelity: false
      });
    } else if (modality === 'edit_prompt') {
      setOpenSections({
        realismFineTuning: true,
        outputFidelity: true,
        subject: false,
        poseAction: false,
        pov: false,
        camera: false,
        composition: false,
        light: false,
        environment: false,
        wardrobe: false,
        vehicle: false
      });
    } else {
      setOpenSections({
        subject: true,
        poseAction: true,
        camera: true,
        light: true,
        pov: false,
        composition: false,
        environment: false,
        wardrobe: false,
        vehicle: false,
        realismFineTuning: false,
        outputFidelity: false
      });
    }
  }, [modality, selectedTypeId]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    setOpenSections({
      subject: true,
      poseAction: true,
      pov: true,
      camera: true,
      composition: true,
      light: true,
      environment: true,
      wardrobe: true,
      vehicle: true,
      realismFineTuning: true,
      outputFidelity: true
    });
  };

  const handleCollapseAll = () => {
    setOpenSections({
      subject: false,
      poseAction: false,
      pov: false,
      camera: false,
      composition: false,
      light: false,
      environment: false,
      wardrobe: false,
      vehicle: false,
      realismFineTuning: false,
      outputFidelity: false
    });
  };

  const updateSetting = <K extends keyof FullSettings>(key: K, val: FullSettings[K]) => {
    onChange({ ...settings, [key]: val });
  };

  const updateNested = <K extends keyof FullSettings, NK extends keyof FullSettings[K]>(
    key: K,
    nestedKey: NK,
    val: FullSettings[K][NK]
  ) => {
    onChange({
      ...settings,
      [key]: {
        ...(settings[key] as any),
        [nestedKey]: val
      }
    });
  };

  const aspectRatios: { value: AspectRatioType; label: string; iconW: number; iconH: number }[] = [
    { value: 'auto', label: 'Auto', iconW: 14, iconH: 14 },
    { value: '9:16', label: '9:16', iconW: 10, iconH: 18 },
    { value: '4:5', label: '4:5', iconW: 12, iconH: 15 },
    { value: '3:4', label: '3:4', iconW: 12, iconH: 16 },
    { value: '1:1', label: '1:1', iconW: 14, iconH: 14 },
    { value: '16:9', label: '16:9', iconW: 18, iconH: 10 },
    { value: '4:3', label: '4:3', iconW: 16, iconH: 12 },
    { value: '2:3', label: '2:3', iconW: 11, iconH: 16 },
    { value: '3:2', label: '3:2', iconW: 16, iconH: 11 },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ==================================================== */}
      {/* 00 — AUTO DETECT BAR (AT THE VERY TOP OF ADVANCED)   */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              settings.autoDetect 
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
            }`}>
              <Zap size={17} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
                  {t.advanced.autoDetectTitle}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  settings.autoDetect 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}>
                  {settings.autoDetect ? t.advanced.autoDetectOn : t.advanced.autoDetectOff}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-sans">
                {t.advanced.autoDetectSub}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoDetect}
              onChange={(e) => updateSetting('autoDetect', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-zinc-900 dark:peer-checked:bg-white dark:peer-checked:after:bg-zinc-900"></div>
          </label>
        </div>

        {/* Detected Context transparent card */}
        {settings.autoDetect && detectedParams && Object.keys(detectedParams).length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider font-sans text-zinc-400 dark:text-zinc-500 block mb-2">
              {t.advanced.detectedTitle}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(detectedParams)
                .filter(([_, v]) => v && typeof v === 'string' && v.trim().length > 0)
                .map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-[#161616] border border-zinc-200/70 dark:border-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 capitalize">{k}:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{v}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Context-Aware Focus Mode Banner (Requirement 18) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-zinc-50/90 dark:bg-[#151515] border border-zinc-200/90 dark:border-zinc-800 rounded-xl gap-2 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
            Context Focus: <strong className="text-zinc-900 dark:text-zinc-100 font-sans uppercase">{modality.replace('_', ' ')}</strong>
            {selectedTypeId ? ` · ${selectedTypeId.replace(/_/g, ' ')}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExpandAll}
            className="text-[10px] font-mono font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="text-[10px] font-mono font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 01 — SUBJECT & ANATOMY                                */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('subject')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <User size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              01 — {t.advanced.sections.subject}
            </span>
          </div>
          {openSections.subject ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.subject && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.subject.count}
                </label>
                <select
                  value={settings.subjectCount}
                  onChange={(e) => updateSetting('subjectCount', e.target.value as SubjectCount)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.subjectCount.auto}</option>
                  <option value="1">{t.options.subjectCount.solo}</option>
                  <option value="2">{t.options.subjectCount.dupla}</option>
                  <option value="3">{t.options.subjectCount.three}</option>
                  <option value="group">{t.options.subjectCount.group}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.subject.bodyPosition}
                </label>
                <select
                  value={settings.bodyPosition}
                  onChange={(e) => updateSetting('bodyPosition', e.target.value as BodyPosition)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.bodyPosition.auto}</option>
                  <option value="standing">{t.options.bodyPosition.standing}</option>
                  <option value="sitting">{t.options.bodyPosition.sitting}</option>
                  <option value="leaning">{t.options.bodyPosition.leaning}</option>
                  <option value="walking">{t.options.bodyPosition.walking}</option>
                  <option value="crouching">{t.options.bodyPosition.crouching}</option>
                  <option value="lying">{t.options.bodyPosition.lying}</option>
                  <option value="mid_action">{t.options.bodyPosition.mid_action}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.subject.orientation}
                </label>
                <select
                  value={settings.orientation}
                  onChange={(e) => updateSetting('orientation', e.target.value as SubjectOrientation)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.orientation.auto}</option>
                  <option value="front">{t.options.orientation.front}</option>
                  <option value="3/4">{t.options.orientation.threeQuarter}</option>
                  <option value="side">{t.options.orientation.side}</option>
                  <option value="rear_3/4">{t.options.orientation.rearThreeQuarter}</option>
                  <option value="back">{t.options.orientation.back}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.subject.weightDistribution}
                </label>
                <select
                  value={settings.weightDistribution}
                  onChange={(e) => updateSetting('weightDistribution', e.target.value as WeightDistribution)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.weightDistribution.auto}</option>
                  <option value="balanced">{t.options.weightDistribution.balanced}</option>
                  <option value="left">{t.options.weightDistribution.left}</option>
                  <option value="right">{t.options.weightDistribution.right}</option>
                  <option value="dynamic">{t.options.weightDistribution.dynamic}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 02 — POSE / EXPRESSION / ACTION                       */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('poseAction')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <User size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              02 — {t.advanced.sections.pose} & {t.advanced.sections.action}
            </span>
          </div>
          {openSections.poseAction ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.poseAction && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.posture.label}
                </label>
                <select
                  value={settings.posture}
                  onChange={(e) => updateSetting('posture', e.target.value as PostureType)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.posture.auto}</option>
                  <option value="relaxed">{t.options.posture.relaxed}</option>
                  <option value="distracted">{t.options.posture.distracted}</option>
                  <option value="casual">{t.options.posture.casual}</option>
                  <option value="leaning">{t.options.posture.leaning}</option>
                  <option value="slouched">{t.options.posture.slouched}</option>
                  <option value="upright">{t.options.posture.upright}</option>
                  <option value="walking">{t.options.posture.walking}</option>
                  <option value="running">{t.options.posture.running}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.posture.gaze}
                </label>
                <select
                  value={settings.gaze}
                  onChange={(e) => updateSetting('gaze', e.target.value as GazeType)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.gaze.auto}</option>
                  <option value="away_from_camera">{t.options.gaze.away_from_camera}</option>
                  <option value="at_camera">{t.options.gaze.at_camera}</option>
                  <option value="down">{t.options.gaze.down}</option>
                  <option value="up">{t.options.gaze.up}</option>
                  <option value="left">{t.options.gaze.left}</option>
                  <option value="right">{t.options.gaze.right}</option>
                  <option value="at_object">{t.options.gaze.at_object}</option>
                  <option value="at_another_person">{t.options.gaze.at_another_person}</option>
                </select>
              </div>
            </div>

            {/* Full-width Action Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                {t.advanced.action.label}
              </label>
              <input
                type="text"
                value={settings.actionDescription}
                onChange={(e) => updateSetting('actionDescription', e.target.value)}
                placeholder={t.advanced.action.placeholder}
                className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono placeholder-zinc-400 dark:placeholder-zinc-600 shadow-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 02.5 — FIRST-PERSON POV & HANDS                      */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('pov')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Maximize2 size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              {t.advanced.sections.pov}
            </span>
          </div>
          {openSections.pov ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
        </button>

        {openSections.pov && (
          <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-4">
            
            {/* Row 1: {local.povHeight} & {local.handVisibility} */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.povHeight}
                </label>
                <select
                  value={settings.pov?.pointOfViewHeight || 'auto'}
                  onChange={(e) => onChange({
                    ...settings,
                    pov: {
                      ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                      pointOfViewHeight: e.target.value as any
                    }
                  })}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{local.autoContext}</option>
                  <option value="hand">{local.handHeight}</option>
                  <option value="waist">{local.waist}</option>
                  <option value="chest">{local.chest}</option>
                  <option value="eye">{local.eye}</option>
                  <option value="overhead">{local.overhead}</option>
                  <option value="low">{local.low}</option>
                  <option value="tabletop_lookdown">{local.tabletop}</option>
                  <option value="custom">{local.customHeight}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.handVisibility}
                </label>
                <select
                  value={settings.pov?.handVisibility || 'auto'}
                  onChange={(e) => onChange({
                    ...settings,
                    pov: {
                      ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                      handVisibility: e.target.value as any
                    }
                  })}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.povHandVisibility.auto}</option>
                  <option value="no_hands">{local.noHands}</option>
                  <option value="one_hand">{t.options.povHandVisibility.one_hand}</option>
                  <option value="both_hands">{local.twoHands}</option>
                </select>
              </div>
            </div>

            {/* Row 2: {local.objectInteraction} & {local.objectDistance} */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.objectInteraction}
                </label>
                <select
                  value={settings.pov?.gripType || 'auto'}
                  onChange={(e) => onChange({
                    ...settings,
                    pov: {
                      ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                      gripType: e.target.value as any
                    }
                  })}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.povGripType.auto}</option>
                  <option value="holding">{local.holding}</option>
                  <option value="touching">{local.touching}</option>
                  <option value="opening">{local.opening}</option>
                  <option value="eating">{local.eating}</option>
                  <option value="using">{local.using}</option>
                  <option value="resting">{local.resting}</option>
                  <option value="placed">{local.placed}</option>
                  <option value="steering">{local.steering}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.objectDistance}
                </label>
                <select
                  value={settings.pov?.objectDistance || 'auto'}
                  onChange={(e) => onChange({
                    ...settings,
                    pov: {
                      ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                      objectDistance: e.target.value as any
                    }
                  })}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{local.autoContext}</option>
                  <option value="very_close">{local.veryClose}</option>
                  <option value="close">{local.close}</option>
                  <option value="medium">{local.medium}</option>
                  <option value="wide_context">{local.wideContext}</option>
                </select>
              </div>
            </div>

            {/* Row 3: {local.objectPosition} & {local.objectRealism} */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.objectPosition}
                </label>
                <select
                  value={settings.pov?.objectPosition || 'auto'}
                  onChange={(e) => onChange({
                    ...settings,
                    pov: {
                      ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                      objectPosition: e.target.value as any
                    }
                  })}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{local.autoContext}</option>
                  <option value="centered">{local.centered}</option>
                  <option value="viewer_left">{local.viewerLeft}</option>
                  <option value="viewer_right">{local.viewerRight}</option>
                  <option value="lower_frame">{local.lowerFrame}</option>
                  <option value="upper_frame">{local.upperFrame}</option>
                  <option value="foreground">{local.foreground}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.objectRealism}
                </label>
                <select
                  value={settings.pov?.objectRealism || 'natural'}
                  onChange={(e) => onChange({
                    ...settings,
                    pov: {
                      ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                      objectRealism: e.target.value as any
                    }
                  })}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  {objectRealismKeys.map(key => (
                    <option key={key} value={key}>
                      {t.options.objectRealism[key] || key}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 4: Surface Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                Surface Material
              </label>
              <select
                value={settings.pov?.surface || 'auto'}
                onChange={(e) => onChange({
                  ...settings,
                  pov: {
                    ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                    surface: e.target.value as any
                  }
                })}
                className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
              >
                {surfaceKeys.map(key => (
                  <option key={key} value={key}>
                    {t.options.surfaces[key] || key}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Surface input if selected */}
            {settings.pov?.surface === 'custom' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  Custom Surface Details
                </label>
                <input
                  type="text"
                  value={settings.pov?.customSurface || ''}
                  onChange={(e) => onChange({
                    ...settings,
                    pov: {
                      ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                      customSurface: e.target.value
                    }
                  })}
                  placeholder="e.g. weathered teak deck, polished white calacatta marble, brushed stainless steel counter"
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono placeholder-zinc-400 shadow-xs"
                />
              </div>
            )}

            {/* Row 5: Held / Focused Object Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                {local.heldObject}
              </label>
              <input
                type="text"
                value={settings.pov?.heldObject || ''}
                onChange={(e) => onChange({
                  ...settings,
                  pov: {
                    ...(settings.pov || { handVisibility: 'auto', gripType: 'auto', heldObject: '', pointOfViewHeight: 'auto' }),
                    heldObject: e.target.value
                  }
                })}
                placeholder={t.advanced.pov.heldObjectPlaceholder || "e.g. iced matcha latte in clear glass, titanium car key, espresso cup"}
                className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono placeholder-zinc-400 shadow-xs"
              />
            </div>

            {/* Special contextual helper for Food POV */}
            {(selectedTypeId === 'food_pov' || selectedTypeId === 'table_food') && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-sans flex items-center gap-2">
                <Utensils size={15} className="shrink-0" />
                <span>{local.foodHelper}</span>
              </div>
            )}

          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 03 — CAMERA & OPTICS                                  */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('camera')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Camera size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              03 — {t.advanced.sections.camera}
            </span>
          </div>
          {openSections.camera ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.camera && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4">
            
            {/* Device & Optical Lens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.camera.device}
                </label>
                <select
                  value={settings.cameraDevice}
                  onChange={(e) => updateSetting('cameraDevice', e.target.value as CameraDeviceAdvanced)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.cameraDevice.auto}</option>
                  <option value="iphone_rear">{t.options.cameraDevice.iphone_rear}</option>
                  <option value="iphone_front">{t.options.cameraDevice.iphone_front}</option>
                  <option value="smartphone_rear">{t.options.cameraDevice.smartphone_rear}</option>
                  <option value="professional_camera">{t.options.cameraDevice.professional_camera}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.camera.lens}
                </label>
                <select
                  value={settings.cameraLens}
                  onChange={(e) => updateSetting('cameraLens', e.target.value as CameraLens)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.cameraLens.auto}</option>
                  <option value="0.5x">{t.options.cameraLens.ultraWide}</option>
                  <option value="1x">{t.options.cameraLens.wide}</option>
                  <option value="2x">{t.options.cameraLens.standard}</option>
                  <option value="3x">{t.options.cameraLens.telephoto}</option>
                  <option value="35mm">{t.options.cameraLens.prime35}</option>
                  <option value="50mm">{t.options.cameraLens.prime50}</option>
                </select>
              </div>
            </div>

            {/* Camera Mode (Independent) & Camera Feel (Demeanor) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  Camera Mode (Independent from Device)
                </label>
                <select
                  value={settings.cameraMode || 'auto'}
                  onChange={(e) => updateSetting('cameraMode', e.target.value as CameraMode)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  {cameraModeKeys.map(key => (
                    <option key={key} value={key}>
                      {t.options.cameraModes[key] || key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  Camera Feel / Demeanor
                </label>
                <select
                  value={settings.cameraFeel || 'auto'}
                  onChange={(e) => updateSetting('cameraFeel', e.target.value as CameraFeel)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  {cameraFeelKeys.map(key => (
                    <option key={key} value={key}>
                      {t.options.cameraFeels[key] || key}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.camera.distance}
                </label>
                <select
                  value={settings.cameraDistance}
                  onChange={(e) => updateSetting('cameraDistance', e.target.value as CameraDistance)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.cameraDistance.auto}</option>
                  <option value="very_close">{t.options.cameraDistance.very_close}</option>
                  <option value="close">{t.options.cameraDistance.close}</option>
                  <option value="medium">{t.options.cameraDistance.medium}</option>
                  <option value="far">{t.options.cameraDistance.far}</option>
                  <option value="very_far">{t.options.cameraDistance.very_far}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.camera.height}
                </label>
                <select
                  value={settings.cameraHeight}
                  onChange={(e) => updateSetting('cameraHeight', e.target.value as CameraHeight)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.cameraHeight.auto}</option>
                  <option value="ground">{t.options.cameraHeight.ground}</option>
                  <option value="waist">{t.options.cameraHeight.waist}</option>
                  <option value="chest">{t.options.cameraHeight.chest}</option>
                  <option value="eye">{t.options.cameraHeight.eye}</option>
                  <option value="above_eye">{t.options.cameraHeight.above_eye}</option>
                  <option value="high">{t.options.cameraHeight.high}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.camera.framing}
                </label>
                <select
                  value={settings.cameraFraming}
                  onChange={(e) => updateSetting('cameraFraming', e.target.value as CameraFraming)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.cameraFraming.auto}</option>
                  <option value="close_up">{t.options.cameraFraming.close_up}</option>
                  <option value="chest">{t.options.cameraFraming.chest}</option>
                  <option value="waist">{t.options.cameraFraming.waist}</option>
                  <option value="3/4_body">{t.options.cameraFraming.threeQuarter}</option>
                  <option value="full_body">{t.options.cameraFraming.full_body}</option>
                  <option value="wide_environmental">{t.options.cameraFraming.wide_environmental}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 04 — COMPOSITION / ASPECT RATIO                      */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('composition')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Maximize2 size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              04 — {t.advanced.sections.composition} ({settings.aspectRatio})
            </span>
          </div>
          {openSections.composition ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.composition && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
              {t.simple.aspectRatio}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {aspectRatios.map(ar => (
                <button
                  key={ar.value}
                  type="button"
                  onClick={() => updateSetting('aspectRatio', ar.value)}
                  className={`h-14 flex flex-col items-center justify-center rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    settings.aspectRatio === ar.value
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white font-bold shadow-xs'
                      : 'bg-zinc-50 dark:bg-[#161616] text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className="border border-current rounded-[1px] mb-1"
                    style={{ width: `${ar.iconW}px`, height: `${ar.iconH}px` }}
                  />
                  <span>{ar.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 05 — LIGHT & ATMOSPHERE                               */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('light')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Sun size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              05 — {t.advanced.sections.light}
            </span>
          </div>
          {openSections.light ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.light && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.light.time}
                </label>
                <select
                  value={settings.lightTime}
                  onChange={(e) => updateSetting('lightTime', e.target.value as LightTime)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.lightTime.auto}</option>
                  <option value="morning">{t.options.lightTime.morning}</option>
                  <option value="midday">{t.options.lightTime.midday}</option>
                  <option value="afternoon">{t.options.lightTime.afternoon}</option>
                  <option value="sunset">{t.options.lightTime.sunset}</option>
                  <option value="blue_hour">{t.options.lightTime.blue_hour}</option>
                  <option value="night">{t.options.lightTime.night}</option>
                  <option value="late_night">{t.options.lightTime.late_night}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.light.source}
                </label>
                <select
                  value={settings.lightSource}
                  onChange={(e) => updateSetting('lightSource', e.target.value as LightSource)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{t.options.lightSource.auto}</option>
                  <option value="natural">{t.options.lightSource.natural}</option>
                  <option value="phone_flash">{t.options.lightSource.phone_flash}</option>
                  <option value="streetlight">{t.options.lightSource.streetlight}</option>
                  <option value="window">{t.options.lightSource.window}</option>
                  <option value="lamp">{t.options.lightSource.lamp}</option>
                  <option value="mixed_light">{t.options.lightSource.mixed_light}</option>
                  <option value="no_artificial">{t.options.lightSource.no_artificial}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.light.flash}
                </label>
                <div className="grid grid-cols-3 gap-1 bg-zinc-50 dark:bg-[#161616] p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 h-11 items-center">
                  {(['auto', 'on', 'off'] as FlashMode[]).map(fm => (
                    <button
                      key={fm}
                      type="button"
                      onClick={() => updateSetting('flashMode', fm)}
                      className={`h-9 rounded-lg text-xs font-mono uppercase transition-all cursor-pointer ${
                        settings.flashMode === fm
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {fm}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.light.flashBehavior}
                </label>
                <select
                  value={settings.flashBehavior}
                  onChange={(e) => updateSetting('flashBehavior', e.target.value as FlashBehavior)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="normal">{t.options.flashBehavior.normal}</option>
                  <option value="hard_direct">{t.options.flashBehavior.hard_direct}</option>
                  <option value="slight_blowout">{t.options.flashBehavior.slight_blowout}</option>
                  <option value="natural_falloff">{t.options.flashBehavior.natural_falloff}</option>
                  <option value="strong">{t.options.flashBehavior.strong}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 06 — ENVIRONMENT & SPACE                             */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('environment')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <MapPin size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              06 — {t.advanced.sections.environment}
            </span>
          </div>
          {openSections.environment ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.environment && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.environment.location}
                </label>
                <input
                  type="text"
                  value={settings.environment.location}
                  onChange={(e) => updateNested('environment', 'location', e.target.value)}
                  placeholder={t.advanced.environment.locationPlaceholder}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.environment.timeOfDay}
                </label>
                <input
                  type="text"
                  value={settings.environment.timeOfDay}
                  onChange={(e) => updateNested('environment', 'timeOfDay', e.target.value)}
                  placeholder={t.advanced.environment.timePlaceholder}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono shadow-xs"
                />
              </div>
            </div>

            {/* Environment Condition (Requirement 21) & Atmosphere Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  Environment Condition
                </label>
                <select
                  value={settings.environment.condition || 'auto'}
                  onChange={(e) => updateNested('environment', 'condition', e.target.value as any)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  {environmentConditionKeys.map(key => (
                    <option key={key} value={key}>
                      {t.options.environmentConditions[key] || key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.mood}
                </label>
                <select
                  value={settings.environment.mood}
                  onChange={(e) => updateNested('environment', 'mood', e.target.value as any)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="ordinary">{local.ordinary}</option>
                  <option value="raw">{local.raw}</option>
                  <option value="premium">{local.premium}</option>
                  <option value="luxury">{local.luxury}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-[#161616] border border-zinc-200/70 dark:border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.environment.avoidPostcard}
                  onChange={(e) => updateNested('environment', 'avoidPostcard', e.target.checked)}
                  className="rounded text-zinc-900 dark:text-white"
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-sans select-none">
                  {t.advanced.environment.avoidPostcard}
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-[#161616] border border-zinc-200/70 dark:border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.environment.avoidGenericLuxury}
                  onChange={(e) => updateNested('environment', 'avoidGenericLuxury', e.target.checked)}
                  className="rounded text-zinc-900 dark:text-white"
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-sans select-none">
                  {t.advanced.environment.avoidGenericLuxury}
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 07 — WARDROBE & MATERIALS                            */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('wardrobe')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Shirt size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              07 — {t.advanced.sections.wardrobe}
            </span>
          </div>
          {openSections.wardrobe ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.wardrobe && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.wardrobe.top}
                </label>
                <input
                  type="text"
                  value={settings.wardrobe.top}
                  onChange={(e) => updateNested('wardrobe', 'top', e.target.value)}
                  placeholder={t.advanced.wardrobe.topPlaceholder}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono shadow-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.wardrobe.bottom}
                </label>
                <input
                  type="text"
                  value={settings.wardrobe.bottom}
                  onChange={(e) => updateNested('wardrobe', 'bottom', e.target.value)}
                  placeholder={t.advanced.wardrobe.bottomPlaceholder}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
                {t.advanced.wardrobe.referenceLock}
              </span>
              <input
                type="checkbox"
                checked={settings.wardrobe.referenceLock}
                onChange={(e) => updateNested('wardrobe', 'referenceLock', e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 08 — VEHICLE FORENSICS                               */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('vehicle')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Car size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              08 — {t.advanced.sections.vehicle}
            </span>
          </div>
          {openSections.vehicle ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.vehicle && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                {t.advanced.vehicle.vehicleText}
              </label>
              <input
                type="text"
                value={settings.vehicle.customVehicle}
                onChange={(e) => updateNested('vehicle', 'customVehicle', e.target.value)}
                placeholder={t.advanced.vehicle.placeholder}
                className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono shadow-xs"
              />
            </div>

            {/* Colors: Exterior & Interior */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  Exterior Color / Finish
                </label>
                <input
                  type="text"
                  value={settings.vehicle.exteriorColor || ''}
                  onChange={(e) => updateNested('vehicle', 'exteriorColor', e.target.value)}
                  placeholder="e.g. metallic obsidian black, matte silver, nardo grey"
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono placeholder-zinc-400 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  Interior Color / Upholstery
                </label>
                <input
                  type="text"
                  value={settings.vehicle.interiorColor || ''}
                  onChange={(e) => updateNested('vehicle', 'interiorColor', e.target.value)}
                  placeholder="e.g. cognac tan leather, charcoal alcantara"
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono placeholder-zinc-400 shadow-xs"
                />
              </div>
            </div>

            {/* {local.doorState} & Driver/Passenger Seat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.doorState}
                </label>
                <select
                  value={settings.vehicle.doorState || 'auto'}
                  onChange={(e) => updateNested('vehicle', 'doorState', e.target.value as any)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{local.autoContext}</option>
                  <option value="closed">{local.closed}</option>
                  <option value="open">{local.openDoor}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {local.seatPosition}
                </label>
                <select
                  value={settings.vehicle.driverPassenger || 'auto'}
                  onChange={(e) => updateNested('vehicle', 'driverPassenger', e.target.value as any)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="auto">{local.autoContext}</option>
                  <option value="driver">{local.driverSeat}</option>
                  <option value="passenger">{local.passengerSeat}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                  {t.advanced.vehicle.subjectRelation}
                </label>
                <select
                  value={settings.vehicle.subjectRelation}
                  onChange={(e) => updateNested('vehicle', 'subjectRelation', e.target.value as any)}
                  className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-sans shadow-xs cursor-pointer"
                >
                  <option value="leaning_against">{t.options.subjectRelation.leaning_against}</option>
                  <option value="standing_near">{t.options.subjectRelation.standing_near}</option>
                  <option value="inside">{t.options.subjectRelation.inside}</option>
                  <option value="driving">{t.options.subjectRelation.driving}</option>
                  <option value="entering">{t.options.subjectRelation.entering}</option>
                  <option value="exiting">{t.options.subjectRelation.exiting}</option>
                  <option value="sitting_on">{t.options.subjectRelation.sitting_on}</option>
                </select>
              </div>

              <div className="flex items-center justify-between sm:pt-6">
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
                  {t.advanced.vehicle.modelLock}
                </span>
                <input
                  type="checkbox"
                  checked={settings.vehicle.modelLock}
                  onChange={(e) => updateNested('vehicle', 'modelLock', e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 09 — REALISM & FINE TUNING                            */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('realismFineTuning')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Sliders size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              09 — {t.advanced.sections.sliders} & {t.advanced.sections.imperfections}
            </span>
          </div>
          {openSections.realismFineTuning ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.realismFineTuning && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-5">
            {/* Realism Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300 font-sans">
                  {t.advanced.sliders.realism}
                </span>
                <span className="font-mono font-bold">{settings.realismLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.realismLevel}
                onChange={(e) => updateSetting('realismLevel', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white"
              />
            </div>

            {/* Imperfection Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300 font-sans">
                  {t.advanced.sliders.imperfection}
                </span>
                <span className="font-mono font-bold">{settings.imperfectionLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.imperfectionLevel}
                onChange={(e) => updateSetting('imperfectionLevel', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white"
              />
            </div>

            {/* Cinematic Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300 font-sans">
                  {t.advanced.sliders.cinematic} {t.advanced.sliders.cinematicNote}
                </span>
                <span className="font-mono font-bold">{settings.cinematicLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.cinematicLevel}
                onChange={(e) => updateSetting('cinematicLevel', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white"
              />
            </div>

            {/* Background Detail */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300 font-sans">
                  {t.advanced.sliders.backgroundDetail}
                </span>
                <span className="font-mono font-bold">{settings.backgroundDetailLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.backgroundDetailLevel}
                onChange={(e) => updateSetting('backgroundDetailLevel', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-white"
              />
            </div>

            {/* Imperfections Checkboxes */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                {t.advanced.sections.imperfections}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(settings.imperfections).map(([key, val]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-[#161616] border border-zinc-200/70 dark:border-zinc-800/70 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => updateNested('imperfections', key as any, e.target.checked)}
                      className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white focus:ring-0"
                    />
                    <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 font-sans select-none">
                      {(t.advanced.imperfections as any)[key] || key}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* 10 — OUTPUT FIDELITY & PRECISION DIRECTIVES          */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-[#101010] rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('outputFidelity')}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50/50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} strokeWidth={1.75} className="text-zinc-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-sans">
              10 — {t.advanced.sections.priority} & {t.advanced.sections.fineControl}
            </span>
          </div>
          {openSections.outputFidelity ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {openSections.outputFidelity && (
          <div className="px-5 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col gap-4">
            {/* Reference Priority Grid */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                {t.advanced.priority.label} ({settings.referencePriority})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['loose', 'balanced', 'strong', 'absolute'] as ReferencePriority[]).map(rp => (
                  <button
                    key={rp}
                    type="button"
                    onClick={() => updateSetting('referencePriority', rp)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all font-sans cursor-pointer ${
                      settings.referencePriority === rp
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white font-bold shadow-xs'
                        : 'bg-zinc-50 dark:bg-[#161616] text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-800/80'
                    }`}
                  >
                    <span className="block capitalize font-bold">{rp}</span>
                    <span className="text-[10px] opacity-80 block mt-0.5">
                      {(t.advanced.priority as any)[rp]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Precision Directives: Avoid (Full width) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                {t.advanced.fineControl.avoid}
              </label>
              <input
                type="text"
                value={settings.fineControl.avoid}
                onChange={(e) => updateNested('fineControl', 'avoid', e.target.value)}
                placeholder={t.advanced.fineControl.avoidPlaceholder}
                className="w-full h-11 bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono shadow-xs"
              />
            </div>

            {/* Additional Directives (Full width) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-sans">
                {t.advanced.fineControl.additionalInstructions}
              </label>
              <textarea
                rows={2}
                value={settings.fineControl.additionalInstructions}
                onChange={(e) => updateNested('fineControl', 'additionalInstructions', e.target.value)}
                placeholder={t.advanced.fineControl.instructionsPlaceholder}
                className="w-full bg-zinc-50 dark:bg-[#161616] border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono resize-none shadow-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* GENERATE PROMPTS ACTION (32px SPACED AFTER CONTROLS) */}
      {/* ==================================================== */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className="w-full h-13 py-3.5 px-6 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs sm:text-sm font-bold uppercase tracking-widest font-sans transition-all duration-300 hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-3 rounded-xl cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
              <span>{t.simple.generating}</span>
            </>
          ) : (
            <>
              <span>{t.simple.generate}</span>
              <ArrowRight size={17} strokeWidth={2} />
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default memo(AdvancedControls);
