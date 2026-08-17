export const DISTRITOS_LIMA = [
  "Ancón",
  "Ate",
  "Barranco",
  "Breña",
  "Callao",
  "Carabayllo",
  "Chaclacayo",
  "Chorrillos",
  "Cieneguilla",
  "Comas",
  "El Agustino",
  "Independencia",
  "Jesús María",
  "La Molina",
  "La Victoria",
  "Lima Cercado",
  "Lince",
  "Los Olivos",
  "Lurigancho-Chosica",
  "Lurín",
  "Magdalena del Mar",
  "Miraflores",
  "Pachacámac",
  "Pueblo Libre",
  "Puente Piedra",
  "Rímac",
  "San Borja",
  "San Isidro",
  "San Juan de Lurigancho",
  "San Juan de Miraflores",
  "San Luis",
  "San Martín de Porres",
  "San Miguel",
  "Santa Anita",
  "Santiago de Surco",
  "Surquillo",
  "Ventanilla",
  "Villa El Salvador",
  "Villa María del Triunfo",
] as const;

export type DistritoLima = (typeof DISTRITOS_LIMA)[number];

export const CATEGORIAS = [
  { id: "herramientas", label: "Herramientas", hint: "Taladros, sierras, andamios" },
  { id: "eventos", label: "Eventos", hint: "Sillas, mesas, toldos, vajilla" },
  { id: "tecnologia", label: "Tecnología", hint: "Cámaras, laptops, consolas" },
  { id: "hogar", label: "Hogar", hint: "Electrodomésticos, limpieza" },
  { id: "movilidad", label: "Movilidad", hint: "Bicis, scooters, maleteros" },
] as const;

export type CategoriaId = (typeof CATEGORIAS)[number]["id"];

export const DISTRICT_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  Ancón: { lat: -11.773, lng: -77.176 },
  Ate: { lat: -12.039, lng: -76.928 },
  Barranco: { lat: -12.144, lng: -77.021 },
  Breña: { lat: -12.057, lng: -77.051 },
  Callao: { lat: -12.056, lng: -77.118 },
  Carabayllo: { lat: -11.89, lng: -77.032 },
  Chaclacayo: { lat: -11.975, lng: -76.769 },
  Chorrillos: { lat: -12.186, lng: -77.009 },
  Cieneguilla: { lat: -12.073, lng: -76.774 },
  Comas: { lat: -11.932, lng: -77.049 },
  "El Agustino": { lat: -12.042, lng: -76.995 },
  Independencia: { lat: -11.992, lng: -77.054 },
  "Jesús María": { lat: -12.078, lng: -77.048 },
  "La Molina": { lat: -12.079, lng: -76.922 },
  "La Victoria": { lat: -12.068, lng: -77.016 },
  "Lima Cercado": { lat: -12.046, lng: -77.043 },
  Lince: { lat: -12.086, lng: -77.036 },
  "Los Olivos": { lat: -11.959, lng: -77.076 },
  "Lurigancho-Chosica": { lat: -11.936, lng: -76.697 },
  Lurín: { lat: -12.274, lng: -76.869 },
  "Magdalena del Mar": { lat: -12.091, lng: -77.067 },
  Miraflores: { lat: -12.121, lng: -77.029 },
  Pachacámac: { lat: -12.251, lng: -76.862 },
  "Pueblo Libre": { lat: -12.078, lng: -77.062 },
  "Puente Piedra": { lat: -11.867, lng: -77.076 },
  Rímac: { lat: -12.026, lng: -77.035 },
  "San Borja": { lat: -12.108, lng: -76.999 },
  "San Isidro": { lat: -12.098, lng: -77.035 },
  "San Juan de Lurigancho": { lat: -11.981, lng: -76.993 },
  "San Juan de Miraflores": { lat: -12.163, lng: -76.972 },
  "San Luis": { lat: -12.075, lng: -76.996 },
  "San Martín de Porres": { lat: -11.986, lng: -77.097 },
  "San Miguel": { lat: -12.078, lng: -77.094 },
  "Santa Anita": { lat: -12.043, lng: -76.972 },
  "Santiago de Surco": { lat: -12.135, lng: -76.993 },
  Surquillo: { lat: -12.114, lng: -77.012 },
  Ventanilla: { lat: -11.872, lng: -77.128 },
  "Villa El Salvador": { lat: -12.213, lng: -76.944 },
  "Villa María del Triunfo": { lat: -12.162, lng: -76.923 },
};

export function obfuscateLocation(distrito: string) {
  const c = DISTRICT_CENTROIDS[distrito] ?? DISTRICT_CENTROIDS["Lima Cercado"];
  const meters = 380 + Math.random() * 140;
  const deg = meters / 111_320;
  const angle = Math.random() * Math.PI * 2;
  return {
    latAprox: Number((c.lat + Math.cos(angle) * deg).toFixed(5)),
    lngAprox: Number((c.lng + Math.sin(angle) * deg).toFixed(5)),
    radioMetros: 500,
  };
}

export const CHECKLIST_ENTREGA = [
  { id: "encendido", label: "El bien enciende / funciona al momento de la entrega" },
  { id: "accesorios", label: "Accesorios listados están completos y se fotografiaron" },
  { id: "danos", label: "Se registraron golpes, rayones o fallas visibles (si aplica)" },
  { id: "dni_vis_a_vis", label: "Ambas partes verificaron DNI en persona" },
  { id: "garantia", label: "Se acordó el monto de garantía en soles y quién lo retiene" },
  { id: "lugar_publico", label: "El encuentro ocurrió en zona acordada (no domicilio exacto público)" },
] as const;

export const CHECKLIST_DEVOLUCION = [
  { id: "funciona", label: "El bien funciona igual que al momento de la entrega" },
  { id: "accesorios_ok", label: "Todos los accesorios de la acta de entrega están de vuelta" },
  { id: "limpieza", label: "Se devolvió limpio / en estado razonable de uso" },
  { id: "sin_faltantes", label: "No faltan piezas, cables, tapas ni mandos" },
  { id: "fotos", label: "Hay fotos de devolución comparables a las de entrega" },
  { id: "garantia_decision", label: "Hay acuerdo sobre liberar, retener o reclamar la garantía" },
] as const;

export const MOTIVOS_REPORTE = [
  "Intento de estafa / pago adelantado sospechoso",
  "El bien no existe o no coincide con las fotos",
  "DNI o identidad no coinciden en el encuentro",
  "Amenaza, extorsión o pedido de dirección exacta",
  "Daño intencional o no devolución",
  "Acoso o uso indebido de WhatsApp",
  "Otro",
] as const;

export const DEMO_OTP = "184729";

/** Puntos de encuentro sugeridos por distrito (zonas públicas — nunca domicilio) */
export const PUNTOS_SEGUROS: Record<string, string[]> = {
  "Los Olivos": ["Paradero Naranjal", "Plaza de Los Olivos", "Mega Plaza (referencia)"],
  "San Miguel": ["Plaza San Miguel", "Av. La Marina cuadra 24", "Centro comercial San Miguel"],
  Miraflores: ["Parque Kennedy", "Larcomar (referencia)", "Av. Larco cuadra 12"],
  "San Isidro": ["Óvalo Gutierrez", "Av. Javier Prado", "Centro comercial San Isidro"],
  "San Martín de Porres": ["Plaza Norte", "Universitaria", "Av. Tomás Valle"],
  Comas: ["Plaza de Comas", "Mall Plaza Norte (referencia)", "Av. Túpac Amaru"],
  "San Juan de Lurigancho": ["Municipalidad SJL", "Av. Próceres", "Metro de Lima San Carlos"],
  Surco: ["Santiago de Surco municipalidad", "Monterrico", "Av. Primavera"],
  "Santiago de Surco": ["Municipalidad Surco", "Monterrico", "Av. Primavera"],
  Breña: ["Plaza Bolognesi", "Av. Brasil", "Estación Metro"],
  "La Victoria": ["Gamarra (zona comercial)", "Plaza Bolognesi cercana", "Av. Iquitos"],
};

export function puntosSeguros(distrito: string): string[] {
  return PUNTOS_SEGUROS[distrito] ?? ["Plaza principal del distrito", "Centro comercial cercano", "Paradero referencial"];
}
