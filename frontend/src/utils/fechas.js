// utils/fechas.js
// Helpers de fecha en hora local. Evitan toISOString() y new Date('YYYY-MM-DD'),
// que trabajan en UTC y en Argentina (UTC-3) corren la fecha un día.

// Date → 'YYYY-MM-DD' (local)
export function aISO(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const hoyISO = () => aISO(new Date());

// 'YYYY-MM-DD' → Date a las 00:00 locales
export function desdeISO(str) {
  const [y, m, d] = str.split('T')[0].split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Lunes de la semana de `fecha` (la semana va de lunes a domingo)
export function lunesDe(fecha) {
  const lunes = new Date(fecha);
  lunes.setHours(0, 0, 0, 0);
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  return lunes;
}
