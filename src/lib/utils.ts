export function soles(n: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(n);
}

export function solesShort(n: number) {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDatePE(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Lima",
  }).format(date);
}

export function formatDateTimePE(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  }).format(date);
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function suggestedDeposit(valorEstimado: number) {
  return Math.min(5000, Math.max(30, Math.round(valorEstimado * 0.25)));
}

export function whatsappLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("51") ? digits : `51${digits}`;
  return `https://api.whatsapp.com/send?phone=${intl}&text=${encodeURIComponent(text)}`;
}
