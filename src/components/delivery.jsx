import React, { useState } from 'react';
import { C } from '../lib/core.js';
import { KITCHEN } from '../lib/delivery.js';
import { Btn, Field, inputStyle } from './ui.jsx';
import { MapPin, CheckCircle2, HelpCircle } from 'lucide-react';
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
      <Btn type="submit" busy={checking}>Check delivery</Btn>
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
