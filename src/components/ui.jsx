import React from 'react';
import { C, serif, sans } from '../lib/core.js';
import { IMG } from '../data/images.js';
import { Star, Plus, Minus } from 'lucide-react';

export function DietDot({ diet, vegan }) {
  const color = diet === 'Non-Veg' ? C.nonveg : C.veg;
  return (
    <span className="inline-flex items-center justify-center flex-none" title={vegan ? 'Vegan' : diet}
      style={{ width: 13, height: 13, border: `1.5px solid ${color}`, borderRadius: 3, background: '#fff' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
    </span>
  );
}

export function Img({ dish, className, style }) {
  const src = IMG[dish.name];
  if (src) return <img src={src} alt={dish.name} loading="lazy" className={className} style={{ objectFit: 'cover', ...style }} />;
  return (
    <div className={className + ' flex flex-col items-center justify-center gap-1'}
      style={{ background: `linear-gradient(135deg, ${C.mint}, ${C.grey})`, ...style }}>
      <span style={{ ...serif, fontSize: 34, color: C.sage, fontWeight: 600 }}>{dish.name[0]}</span>
      <span className="text-xs" style={{ color: C.mute }}>Photo coming soon</span>
    </div>
  );
}

export function Btn({ children, onClick, kind = 'primary', className = '', small }) {
  const base = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all ${small ? 'px-4 py-2 text-sm' : 'px-6 py-3.5 text-sm'} ${className}`;
  const styles = {
    primary: { background: C.cta, color: '#fff', boxShadow: '0 2px 10px rgba(107,170,78,0.28)' },
    secondary: { background: C.mint, color: '#3e6b2f' },
    ghost: { background: '#fff', color: C.ink, border: `1px solid ${C.line}` },
  }[kind];
  return <button onClick={onClick} className={base} style={{ ...sans, ...styles }}>{children}</button>;
}

export function Stars({ value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: C.ink }}>
      <Star size={13} fill={C.orange} color={C.orange} /> {value}
    </span>
  );
}

export function QtyOrAdd({ dish, cart, setCart, small }) {
  const qty = cart[dish.name] || 0;
  const set = (n) => setCart((c) => { const x = { ...c }; if (n <= 0) delete x[dish.name]; else x[dish.name] = n; return x; });
  if (qty === 0) return <Btn small={small} onClick={(e) => { e.stopPropagation(); set(1); }}>Add</Btn>;
  return (
    <span className="inline-flex items-center gap-3 rounded-full px-2 py-1.5" style={{ background: C.mint }} onClick={(e) => e.stopPropagation()}>
      <button aria-label="Remove one" onClick={() => set(qty - 1)} className="p-1"><Minus size={14} color="#3e6b2f" /></button>
      <span className="text-sm font-semibold" style={{ color: '#3e6b2f' }}>{qty}</span>
      <button aria-label="Add one" onClick={() => set(qty + 1)} className="p-1"><Plus size={14} color="#3e6b2f" /></button>
    </span>
  );
}

export function Sheet({ children, onClose, label }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0" style={{ background: 'rgba(45,45,45,0.4)' }} onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl max-h-[92vh] overflow-y-auto" style={{ background: C.warm }}>{children}</div>
    </div>
  );
}

export const inputStyle = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 14px', fontSize: 14, color: C.ink, width: '100%' };

export function Field({ label, children }) {
  return <label className="grid gap-1.5 text-sm"><span className="font-medium text-xs" style={{ color: C.mute }}>{label}</span>{children}</label>;
}
