// ─────────────────────────────────────────────────────────────
// Delivery eligibility
//
// Rule-based today: only the kitchen's own pincode qualifies for
// free delivery. The async signature and the result shape
// { status, freeDelivery, pincode, label, detail } are stable, so
// a Google Maps Distance Matrix / Places lookup can replace the
// body of `checkDelivery` without touching any caller.
// ─────────────────────────────────────────────────────────────

export const KITCHEN = { area: 'Lower Oshiwara', pincode: '400102', radiusKm: 5 };

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
  if (pin === KITCHEN.pincode) {
    return {
      status: 'eligible',
      freeDelivery: true,
      pincode: pin,
      label: 'Free delivery',
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
