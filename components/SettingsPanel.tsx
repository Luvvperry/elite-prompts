
import React from 'react';
import { CameraSettings, DeviceType, LookType, SharpnessType, HDRType } from '../types';

interface Props {
  settings: CameraSettings;
  onChange: (settings: CameraSettings) => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, onChange }) => {
  const devices: DeviceType[] = ['iPhone 13', 'iPhone 14 Pro', 'iPhone 15 Pro', 'Professional Camera'];
  const looks: LookType[] = ['RAW', 'Standard', 'Film', 'Portra 400'];
  const sharpnessOptions: SharpnessType[] = ['Natural', 'Crisp', 'Soft'];
  const hdrOptions: HDRType[] = ['Natural', 'Smart HDR', 'Low Contrast'];

  const handleChange = (key: keyof CameraSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const SelectArrow = () => (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2">
        <h3 className="text-sm font-bold text-zinc-900 font-sans-alt uppercase tracking-wider">Parameters</h3>
      </div>

      <div className="space-y-5">
        {/* Device Selection */}
        <div className="group relative">
          <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider font-sans-alt">Optical System</label>
          <div className="relative">
            <select
              value={settings.device}
              onChange={(e) => handleChange('device', e.target.value)}
              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl py-3.5 pl-4 pr-10 text-sm font-medium text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all cursor-pointer appearance-none outline-none hover:border-zinc-300"
            >
              {devices.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <SelectArrow />
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider font-sans-alt">Profile</label>
            <div className="relative">
              <select
                value={settings.look}
                onChange={(e) => handleChange('look', e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl py-3.5 pl-4 pr-10 text-sm font-medium text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all cursor-pointer appearance-none outline-none hover:border-zinc-300"
              >
                {looks.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <SelectArrow />
            </div>
          </div>

          <div className="group">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider font-sans-alt">Sharpness</label>
            <div className="relative">
              <select
                value={settings.sharpness}
                onChange={(e) => handleChange('sharpness', e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl py-3.5 pl-4 pr-10 text-sm font-medium text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all cursor-pointer appearance-none outline-none hover:border-zinc-300"
              >
                {sharpnessOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <SelectArrow />
            </div>
          </div>

          <div className="group col-span-2">
            <label className="block text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider font-sans-alt">Dynamic Range</label>
            <div className="relative">
              <select
                value={settings.hdr}
                onChange={(e) => handleChange('hdr', e.target.value)}
                className="w-full bg-zinc-50/50 border border-zinc-200 rounded-2xl py-3.5 pl-4 pr-10 text-sm font-medium text-zinc-900 focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-400 transition-all cursor-pointer appearance-none outline-none hover:border-zinc-300"
              >
                {hdrOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <SelectArrow />
            </div>
          </div>
        </div>

        {/* Features Toggle Section */}
        <div className="pt-4">
          {/* Strict Realism Toggle */}
          <label className="flex items-center justify-between cursor-pointer group p-4 -mx-4 rounded-2xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-zinc-900 font-sans-alt">Forensic Realism</span>
              <span className="text-xs text-zinc-500 mt-1">
                Force optical imperfections & noise
              </span>
            </div>

            <div className="relative">
              <input
                type="checkbox"
                checked={settings.strictRealism}
                onChange={(e) => handleChange('strictRealism', e.target.checked)}
                className="hidden"
              />
              <div className={`
                w-12 h-7 rounded-full flex items-center transition-colors duration-300 ease-in-out
                ${settings.strictRealism ? 'bg-zinc-900' : 'bg-zinc-200'}
              `}>
                <div className={`
                  w-5 h-5 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out bg-white
                  ${settings.strictRealism ? 'translate-x-6' : 'translate-x-1'}
                `}></div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
