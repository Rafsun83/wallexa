export function formatMoney(n, currency = 'USD') {
  const sym = { USD: '$', EUR: '€', GBP: '£', BDT: '৳', JPY: '¥', INR: '₹' }[currency] || '$';
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  return { sym, int: int.replace(/\B(?=(\d{3})+(?!\d))/g, ','), dec };
}

export function formatRelTime(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 7) return d + 'd ago';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function getDeviceId() {
  let id = localStorage.getItem('wallet.deviceId');
  if (!id) {
    id = 'web-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('wallet.deviceId', id);
  }
  return id;
}
