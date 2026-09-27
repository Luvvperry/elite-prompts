import React, { useState } from 'react';
import { KeyRound, LockKeyhole, X } from 'lucide-react';
import { getRemainingGenerations, redeemActivationCode } from '../services/usageGate';

interface UsageGateModalProps {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const UsageGateModal: React.FC<UsageGateModalProps> = ({ open, onClose, onUnlocked }) => {
  const [code, setCode] = useState('');
  const [invalid, setInvalid] = useState(false);

  if (!open) return null;

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
            <div><p className="section-kicker"><span>ACCESS</span></p><h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Generation limit reached</h2></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]" aria-label="Close"><X size={17} /></button>
        </div>
        <p className="mb-5 text-sm leading-6 text-[var(--text-secondary)]">You have used the 5 free prompt generations on this device. Enter an activation code to continue.</p>
        <form onSubmit={submit}>
          <label className="mb-2 block text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-muted)]">Activation code</label>
          <div className="flex gap-2">
            <div className="relative flex-1"><KeyRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" /><input autoFocus value={code} onChange={(event) => { setCode(event.target.value); setInvalid(false); }} placeholder="XXXX-XXXX-XXXX" className="h-11 w-full rounded-lg border border-[var(--border-main)] bg-[var(--surface-secondary)] pl-9 pr-3 text-sm uppercase tracking-[0.12em] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--border-active)]" /></div>
            <button type="submit" className="h-11 rounded-lg bg-white px-4 text-xs font-semibold text-black hover:bg-zinc-200">Unlock</button>
          </div>
          {invalid && <p className="mt-3 text-xs text-red-300">Invalid or already inactive code. Check the code and try again.</p>}
        </form>
        <p className="mt-5 text-[11px] leading-5 text-[var(--text-muted)]">Remaining generations: {getRemainingGenerations() === Infinity ? 'unlimited' : getRemainingGenerations()}</p>
      </div>
    </div>
  );
};
