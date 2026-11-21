// Local-time date helpers (YYYY-MM-DD in the device's timezone, not UTC).

export function localIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "2026-11" style key for grouping by month. */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTHS_IT = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

export function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS_IT[m - 1]} ${y}`;
}

/** "Oggi", "Ieri" or "21 nov". */
export function formatDayLabel(isoDate: string): string {
  const today = localIsoDate();
  const yesterday = localIsoDate(new Date(Date.now() - 86_400_000));
  if (isoDate === today) return "Oggi";
  if (isoDate === yesterday) return "Ieri";
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

export function formatEuro(amount: number, opts: { signed?: boolean } = {}): string {
  const abs = Math.abs(amount).toLocaleString("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = opts.signed ? (amount < 0 ? "− " : "+ ") : amount < 0 ? "− " : "";
  return `${sign}€ ${abs}`;
}
