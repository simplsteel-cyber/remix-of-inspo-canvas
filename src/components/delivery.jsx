import React, { useState } from 'react';
import { C } from '../lib/core.js';
import { KITCHEN } from '../lib/delivery.js';
import { Btn, Field, inputStyle } from './ui.jsx';
import { MapPin, CheckCircle2, HelpCircle, LocateFixed } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';

// ─────────────────────────────────────────────────────────────
// Shared pincode/address form. Runs the eligibility check and
// stores the result centrally — used by onboarding, the homepage
// sheet, and the account screen, so the rule lives in one place.
// ─────────────────────────────────────────────────────────────

export function DeliveryForm({ onDone, compact }) {
  const { profile, updateProfile, delivery, runDeliveryCheck } = useUser();
  const [pincode, setPincode] = useState(profile.pincode || '');
  const [address, setAddress] = useState(profile.deliveryAddress || '');
  const [checking, setChecking] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  const check = async () => {
    if (!pincode.trim() && !address.trim()) {
      setError('Enter a pincode or delivery address');
      return;
    }
    setError('');
    setChecking(true);
    updateProfile({ pincode: pincode.trim(), deliveryAddress: address.trim() });
    const result = await runDeliveryCheck({ pincode, address });
    setChecking(false);
    if (result.status === 'unknown') setError(result.detail);
    else onDone?.(result);
  };

  // Auto-detect: browser geolocation → OpenStreetMap reverse geocode
  // → pincode. Fully optional; falls back to manual entry on any error.
  const detect = async () => {
    if (!navigator.geolocation) { setError('Location is not available on this device — enter your pincode.'); return; }
    setError('');
    setDetecting(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 9000, maximumAge: 300000 }));
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=16`,
        { headers: { Accept: 'application/json' } });
      const j = await r.json();
      const pin = j?.address?.postcode?.replace(/\s/g, '');
      if (!pin) throw new Error('Could not read a pincode from your location — enter it manually.');
      setPincode(pin);
      updateProfile({ pincode: pin });
      const result = await runDeliveryCheck({ pincode: pin, address });
      if (result.status !== 'unknown') onDone?.(result);
    } catch (e) {
      setError(e.code === 1 ? 'Location permission denied — enter your pincode manually.' : (e.message || 'Could not detect your location.'));
    } finally {
      setDetecting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); check(); }}>
      <Field label="Pincode" error={error}>
        <input style={inputStyle} inputMode="numeric" autoComplete="postal-code" value={pincode}
          onChange={(e) => setPincode(e.target.value)} placeholder={KITCHEN.pincode} />
      </Field>
      {!compact && (
        <Field label="Delivery address (optional)">
          <textarea style={{ ...inputStyle, minHeight: 72 }} autoComplete="street-address" value={address}
            onChange={(e) => setAddress(e.target.value)} placeholder="Flat, building, street, area" />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Btn type="button" kind="ghost" busy={detecting} onClick={detect}>
          <LocateFixed size={15} /> Use my location
        </Btn>
        <Btn type="submit" busy={checking}>Check delivery</Btn>
      </div>
      {delivery && delivery.status !== 'unknown' && <DeliveryStatus delivery={delivery} />}
    </form>
  );
}

export function DeliveryStatus({ delivery, onEdit }) {
  if (!delivery || delivery.status === 'unknown') {
    if (!onEdit) return null;
    return (
      <button type="button" onClick={onEdit} className="flex items-center gap-2 rounded-2xl px-3.5 py-3 text-xs font-medium w-full text-left"
        style={{ background: '#fff', border: `1px dashed ${C.sage}`, color: C.ink }}>
        <MapPin size={15} color={C.sage} /> Check delivery availability for your area
      </button>
    );
  }
  const eligible = delivery.status === 'eligible';
  return (
    <div className="flex items-start gap-2 rounded-2xl px-3.5 py-3 text-xs font-medium" role="status"
      style={eligible ? { background: C.mint, color: '#3e6b2f' } : { background: '#FDF3E7', color: '#b06c22' }}>
      {eligible ? <CheckCircle2 size={15} className="flex-none mt-0.5" /> : <HelpCircle size={15} className="flex-none mt-0.5" />}
      <span>
        {eligible ? `Free delivery · ${delivery.pincode} (${KITCHEN.area})` : `Pincode ${delivery.pincode}`}
        <span className="block font-normal mt-0.5">{delivery.detail}</span>
        {onEdit && (
          <button type="button" onClick={onEdit} className="underline font-medium mt-1 block">Change</button>
        )}
      </span>
    </div>
  );
}
