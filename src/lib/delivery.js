// ─────────────────────────────────────────────────────────────
// Delivery eligibility
//
// Rule-based today: eligibility comes from the SERVICE_AREAS
// config below, so new pincodes launch by adding a row — no code
// changes. The async signature and the result shape
// { status, freeDelivery, pincode, label, detail } are stable, so
// a Google Maps Distance Matrix / Places lookup can replace the
// body of `checkDelivery` without touching any caller.
// ─────────────────────────────────────────────────────────────

export const KITCHEN = { area: 'Lower Oshiwara', pincode: '400102', radiusKm: 5 };

// Every pincode we currently serve. freeDelivery marks zones inside
// the free-delivery radius; others could carry a fee later.
export const SERVICE_AREAS = [
  { pincode: '400102', area: 'Lower Oshiwara', freeDelivery: true },
];

const simulate = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const extractPincode = (text) => (String(text || '').match(/\b\d{6}\b/) || [null])[0];

export async function checkDelivery({ pincode = '', address = '' }) {
  const pin = extractPincode(pincode) || extractPincode(address);
  await simulate(600); // stand-in for the distance/places lookup

  if (!pin) {
    return {
      status: 'unknown',
      freeDelivery: false,
      pincode: null,
      label: 'Add a pincode to check delivery',
      detail: 'We need a 6-digit pincode to confirm availability.',
    };
  }

  const zone = SERVICE_AREAS.find((z) => z.pincode === pin);
  if (zone) {
    return {
      status: 'eligible',
      freeDelivery: zone.freeDelivery,
      pincode: pin,
      label: zone.freeDelivery ? 'Free delivery' : 'We deliver here',
      detail: `Delivered fresh from our ${KITCHEN.area} kitchen.`,
    };
  }
  return {
    status: 'enquiry',
    freeDelivery: false,
    pincode: pin,
    label: 'Delivery on enquiry',
    detail: 'Delivery availability will be confirmed after enquiry.',
  };
}
