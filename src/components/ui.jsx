import React, { useEffect, useRef, useState } from 'react';
import { C, serif, sans } from '../lib/core.js';
import { IMG } from '../data/images.js';
import { ChevronLeft, Search, X } from 'lucide-react';

// Shared style tokens — one definition for the white card look and
// section headings that repeat across every screen.
export const cardStyle = { background: '#fff', border: `1px solid ${C.line}` };
export const inputStyle = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 14px', fontSize: 14, color: C.ink, width: '100%' };

export function SectionTitle({ children, className = '' }) {
  return <h2 className={className} style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>{children}</h2>;
}

export function BackBtn({ onClick, label = 'Back' }) {
  return (
    <button type="button" aria-label={label} onClick={onClick}
      className="inline-flex items-center gap-1.5 -ml-2 pl-2 pr-3.5 py-2 rounded-full text-sm font-medium"
      style={{ ...cardStyle, color: C.ink }}>
      <ChevronLeft size={18} color={C.ink} /> {label}
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search meals...', autoFocus }) {
  return (
    <div role="search" className="flex items-center gap-2 rounded-full px-4 py-3 w-full" style={cardStyle}>
      <Search size={16} color={C.mute} strokeWidth={1.8} className="flex-none" />
      <input type="search" value={value} autoFocus={autoFocus} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        aria-label="Search meals" className="w-full text-sm bg-transparent focus:outline-none" style={{ color: C.ink }} />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="flex-none p-0.5">
          <X size={15} color={C.mute} />
        </button>
      )}
    </div>
  );
}

export function DietDot({ diet, vegan }) {
  const color = diet === 'Non-Veg' ? C.nonveg : C.veg;
  return (
    <span className="inline-flex items-center justify-center flex-none" title={vegan ? 'Vegan' : diet}
      style={{ width: 13, height: 13, border: `1.5px solid ${color}`, borderRadius: 3, background: '#fff' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
    </span>
  );
}

export function Skeleton({ className = '', style }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-2xl ${className}`} style={{ background: C.line, ...style }} />;
}

export function Img({ dish, className = '', style }) {
  // Prefer a hosted image from the database (URL or absolute path);
  // fall back to the bundled photo matched by dish name.
  const dbImage = dish.image && /^(https?:)?\//.test(dish.image) ? dish.image : null;
  const src = dbImage || IMG[dish.name];
  const [loaded, setLoaded] = useState(false);
  if (!src) {
    return (
      <div className={className + ' flex flex-col items-center justify-center gap-1'}
        style={{ background: `linear-gradient(135deg, ${C.mint}, ${C.grey})`, ...style }}>
        <span style={{ ...serif, fontSize: 34, color: C.sage, fontWeight: 600 }}>{dish.name[0]}</span>
        <span className="text-xs" style={{ color: C.mute }}>Photo coming soon</span>
      </div>
    );
  }
  return (
    <span className={`relative block overflow-hidden ${className}`} style={style}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <img src={src} alt={dish.name} loading="lazy" onLoad={() => setLoaded(true)}
        className="w-full h-full" style={{ objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity 0.2s' }} />
    </span>
  );
}

export function Btn({ children, onClick, kind = 'primary', className = '', small, type = 'button', disabled, busy }) {
  const base = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all ${small ? 'px-4 py-2.5 text-sm' : 'px-6 py-3.5 text-sm'} ${className}`;
  const styles = {
    primary: { background: C.cta, color: '#fff', boxShadow: '0 2px 10px rgba(107,170,78,0.28)' },
    secondary: { background: C.mint, color: '#3e6b2f' },
    ghost: { ...cardStyle, color: C.ink },
  }[kind];
  const inert = disabled || busy;
  return (
    <button type={type} onClick={onClick} disabled={inert} aria-busy={busy || undefined}
      className={base} style={{ ...sans, ...styles, ...(inert ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}>
      {busy ? 'Please wait…' : children}
    </button>
  );
}

export function Sheet({ children, onClose, label }) {
  const panel = useRef(null);
  useEffect(() => { panel.current?.focus(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <button type="button" aria-label="Close" className="absolute inset-0 w-full" style={{ background: 'rgba(45,45,45,0.4)' }} onClick={onClose} />
      <div ref={panel} tabIndex={-1} className="relative w-full max-w-md rounded-t-3xl max-h-[92vh] overflow-y-auto focus:outline-none" style={{ background: C.warm }}>{children}</div>
    </div>
  );
}

// Brand WhatsApp glyph (lucide has no WhatsApp icon). Single-path,
// inherits colour via `fill` so it works on light and dark buttons.
export function WhatsAppIcon({ size = 22, color = 'currentColor', className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} className={className} aria-hidden="true" focusable="false">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.44.79 3.06 1.2 4.79 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01c-1.54 0-3.05-.41-4.36-1.19l-.31-.19-3.24.85.86-3.16-.2-.32a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/>
    </svg>
  );
}

export const Required = () => <span aria-hidden="true" style={{ color: '#c0392b' }}> *</span>;

export function Field({ label, error, children }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-xs" style={{ color: C.mute }}>{label}</span>
      {children}
      {error && <span role="alert" className="text-xs" style={{ color: '#c0392b' }}>{error}</span>}
    </label>
  );
}
