import React, { useState } from 'react';
import { KeyRound, LockKeyhole, X } from 'lucide-react';
import { getRemainingGenerations, redeemActivationCode } from '../services/usageGate';
import { Language } from '../types';

interface UsageGateModalProps {
  open: boolean;
  lang: Language;
  onClose: () => void;
  onUnlocked: () => void;
}

export const UsageGateModal: React.FC<UsageGateModalProps> = ({ open, lang, onClose, onUnlocked }) => {
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);

  if (!open) return null;

  const copy = {
    pt: { access: 'ACESSO', title: 'Limite de gerações atingido', body: 'Você usou as 5 gerações gratuitas de prompts neste dispositivo. Insira um código de ativação para continuar.', label: 'Código de ativação', unlock: 'Desbloquear', invalid: 'Código inválido ou já inativo. Verifique o código e tente novamente.', remaining: 'Gerações restantes', unlimited: 'ilimitadas', close: 'Fechar' },
    es: { access: 'ACCESO', title: 'Límite de generaciones alcanzado', body: 'Has usado las 5 generaciones gratuitas de prompts en este dispositivo. Introduce un código de activación para continuar.', label: 'Código de activación', unlock: 'Desbloquear', invalid: 'Código inválido o inactivo. Comprueba el código e inténtalo de nuevo.', remaining: 'Generaciones restantes', unlimited: 'ilimitadas', close: 'Cerrar' },
    en: { access: 'ACCESS', title: 'Generation limit reached', body: 'You have used the 5 free prompt generations on this device. Enter an activation code to continue.', label: 'Activation code', unlock: 'Unlock', invalid: 'Invalid or already inactive code. Check the code and try again.', remaining: 'Remaining generations', unlimited: 'unlimited', close: 'Close' }
  }[lang];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = redeemActivationCode(code);
    if (!result.ok) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onUnlocked();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-active)] bg-[var(--surface-main)] p-6 shadow-[var(--shadow-float)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-active)] bg-[var(--surface-secondary)] text-[var(--text-primary)]"><LockKeyhole size={18} /></div>
            <div><p className="section-kicker"><span>{copy.access}</span></p><h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{copy.title}</h2></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]" aria-label={copy.close}><X size={17} /></button>
        </div>
        <p className="mb-5 text-sm leading-6 text-[var(--text-secondary)]">{copy.body}</p>
        <form onSubmit={submit}>
          <label className="mb-2 block text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-muted)]">{copy.label}</label>
          <div className="flex gap-2">
            <div className="relative flex-1"><KeyRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input autoFocus value={code} onChange={(event) => { setCode(event.target.value); setInvalid(false); }} placeholder="XXXX-XXXX-XXXX" className="h-11 w-full rounded-lg border border-[var(--border-main)] bg-[var(--surface-secondary)] pl-9 pr-3 text-sm uppercase tracking-[0.12em] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)]" /></div>
            <button type="submit" className="h-11 rounded-lg bg-white px-4 text-xs font-semibold text-black hover:bg-zinc-200">{copy.unlock}</button>
          </div>
          {invalid && <p className="mt-3 text-xs text-red-300">{copy.invalid}</p>}
        </form>
        <p className="mt-5 text-[11px] leading-5 text-[var(--text-muted)]">{copy.remaining}: {getRemainingGenerations() === Infinity ? copy.unlimited : getRemainingGenerations()}</p>
      </div>
    </div>
  );
};
