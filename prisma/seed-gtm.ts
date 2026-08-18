import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { obfuscateLocation, puntosSeguros } from "../src/lib/peru";
import { photosJson } from "../src/lib/seed-photos";

type OwnerSeed = {
  nombre: string;
  apellidos: string;
  dni: string;
  telefono: string;
  email: string;
  distrito: string;
  premium?: boolean;
  items: Array<{
    titulo: string;
    categoria: string;
    precio: number;
    valor: number;
    zona: string;
  }>;
};

const GTM_OWNERS: OwnerSeed[] = [
  {
    nombre: "Pedro",
    apellidos: "Salazar Vega",
    dni: "40231567",
    telefono: "987111001",
    email: "pedro.salazar@alquila.pe",
    distrito: "Comas",
    items: [
      { titulo: "Rotomartillo Demolition 1500W", categoria: "herramientas", precio: 35, valor: 450, zona: "Cerca a Plaza de Comas" },
      { titulo: "Andamio metálico 2 m (par)", categoria: "herramientas", precio: 28, valor: 380, zona: "Av. Túpac Amaru" },
    ],
  },
  {
    nombre: "Lucía",
    apellidos: "Paredes Ortiz",
    dni: "41567823",
    telefono: "987111002",
    email: "lucia.paredes@alquila.pe",
    distrito: "San Juan de Lurigancho",
    items: [
      { titulo: "Set 30 sillas Tiffany doradas", categoria: "eventos", precio: 55, valor: 900, zona: "Cerca a Municipalidad SJL" },
    ],
  },
  {
    nombre: "Jorge",
    apellidos: "Castillo Mejía",
    dni: "42890134",
    telefono: "987111003",
    email: "jorge.castillo@alquila.pe",
    distrito: "Breña",
    premium: true,
    items: [
      { titulo: "Compresor 50 L + pistola pintar", categoria: "herramientas", precio: 45, valor: 520, zona: "Plaza Bolognesi referencia" },
      { titulo: "Escalera extensible 3.8 m", categoria: "herramientas", precio: 22, valor: 280, zona: "Av. Brasil" },
      { titulo: "Lijadora orbital Bosch", categoria: "herramientas", precio: 18, valor: 220, zona: "Metro Breña" },
    ],
  },
  {
    nombre: "Sofía",
    apellidos: "Narváez Li",
    dni: "43901245",
    telefono: "987111004",
    email: "sofia.narvaez@alquila.pe",
    distrito: "San Isidro",
    items: [
      { titulo: "MacBook Pro M2 + cargador", categoria: "tecnologia", precio: 75, valor: 5500, zona: "Cerca a Óvalo Gutierrez" },
      { titulo: "Proyector 4K portátil", categoria: "tecnologia", precio: 65, valor: 2800, zona: "Av. Javier Prado" },
    ],
  },
  {
    nombre: "Miguel",
    apellidos: "Aguilar Ríos",
    dni: "44125678",
    telefono: "987111005",
    email: "miguel.aguilar@alquila.pe",
    distrito: "La Victoria",
    items: [
      { titulo: "Mesa redonda eventos 10 pax", categoria: "eventos", precio: 35, valor: 400, zona: "Gamarra zona comercial" },
      { titulo: "Toldo 3x3 m con paredes", categoria: "eventos", precio: 40, valor: 350, zona: "Av. Iquitos" },
    ],
  },
];

/** 3 categorías × 5 distritos — genera dueños hasta ~50 total (plan GTM Lima) */
const GTM_MATRIX: Array<{ categoria: string; distritos: string[]; titulos: string[]; precioRange: [number, number]; valorRange: [number, number] }> = [
  {
    categoria: "herramientas",
    distritos: ["Los Olivos", "San Martín de Porres", "Comas", "San Juan de Lurigancho", "Breña"],
    titulos: ["Taladro percutor 850W", "Sierra circular 1400W", "Nivel láser 360°", "Set llaves combinadas", "Mezcladora cemento 120L"],
    precioRange: [20, 80],
    valorRange: [200, 800],
  },
  {
    categoria: "eventos",
    distritos: ["San Miguel", "Santiago de Surco", "Miraflores", "La Victoria", "Breña"],
    titulos: ["Set 20 sillas plegables", "Mesas rectangulares evento", "Carpa 4x4 m", "Backdrops y bases", "Set mantelería 50 pax"],
    precioRange: [30, 60],
    valorRange: [300, 1200],
  },
  {
    categoria: "tecnologia",
    distritos: ["Miraflores", "San Isidro", "Santiago de Surco", "San Miguel", "Los Olivos"],
    titulos: ["Cámara mirrorless + lente", "Drone DJI Mini", "Consola + 2 mandos", "Micrófono inalámbrico", "Tablet iPad + teclado"],
    precioRange: [45, 120],
    valorRange: [800, 6000],
  },
];

const NOMBRES = ["Ana", "Carlos", "Diana", "Eduardo", "Fabiola", "Gabriel", "Helena", "Iván", "Julia", "Kevin"];
const APELLIDOS = ["Quispe", "Flores", "Rojas", "Vega", "Cruz", "Mendoza", "Huamán", "Silva", "Torres", "Ramírez"];

function generatedOwners(): OwnerSeed[] {
  const owners: OwnerSeed[] = [];
  let idx = 0;
  for (const row of GTM_MATRIX) {
    for (const distrito of row.distritos) {
      for (let slot = 0; slot < 3; slot++) {
        idx++;
        const nombre = NOMBRES[idx % NOMBRES.length];
        const apellidos = `${APELLIDOS[idx % APELLIDOS.length]} ${APELLIDOS[(idx + 3) % APELLIDOS.length]}`;
        const dni = String(45000000 + idx).padStart(8, "0");
        const telefono = `9872${String(10000 + idx).slice(-5)}`;
        const email = `gtm.${idx}@alquila.pe`;
        const titulo = row.titulos[(idx + slot) % row.titulos.length];
        const precio = row.precioRange[0] + ((idx * 7) % (row.precioRange[1] - row.precioRange[0] + 1));
        const valor = row.valorRange[0] + ((idx * 13) % (row.valorRange[1] - row.valorRange[0] + 1));
        const zona = puntosSeguros(distrito)[0] ?? `Zona pública ${distrito}`;
        owners.push({
          nombre,
          apellidos,
          dni,
          telefono,
          email,
          distrito,
          premium: idx % 7 === 0,
          items: [
            {
              titulo: `${titulo} · ${distrito}`,
              categoria: row.categoria,
              precio,
              valor,
              zona,
            },
            ...(slot === 0
              ? [
                  {
                    titulo: `${row.titulos[(idx + 1) % row.titulos.length]} · ${distrito}`,
                    categoria: row.categoria,
                    precio: precio + 5,
                    valor: valor + 100,
                    zona: puntosSeguros(distrito)[1] ?? zona,
                  },
                ]
              : []),
          ],
        });
      }
    }
  }
  return owners;
}

const ALL_GTM_OWNERS = [...GTM_OWNERS, ...generatedOwners()];

export async function seedGtmOwners(prisma: PrismaClient, passwordHash: string) {
  let count = 0;
  let ownersCreated = 0;
  for (const o of ALL_GTM_OWNERS) {
    const exists = await prisma.user.findUnique({ where: { email: o.email } });
    if (exists) continue;

    const premiumHasta = o.premium ? new Date(Date.now() + 90 * 86400000) : null;
    const user = await prisma.user.create({
      data: {
        nombre: o.nombre,
        apellidos: o.apellidos,
        dni: o.dni,
        telefono: o.telefono,
        email: o.email,
        passwordHash,
        dniVerificado: true,
        telefonoVerificado: true,
        verificadoEn: new Date(),
        termsAcceptedAt: new Date(),
        distrito: o.distrito,
        rol: o.premium ? "PREMIUM_OWNER" : "USER",
        premiumHasta,
        reputacionScore: 4.6 + Math.random() * 0.4,
        reputacionCount: 2 + Math.floor(Math.random() * 8),
        alquileresCompletados: 2 + Math.floor(Math.random() * 10),
        devolucionesOk: 2 + Math.floor(Math.random() * 10),
      },
    });
    ownersCreated++;

    for (const it of o.items) {
      const loc = obfuscateLocation(o.distrito);
      await prisma.item.create({
        data: {
          titulo: it.titulo,
          descripcion: `${it.titulo} en ${o.distrito}. Dueño verificado en Alquila. Entrega en zona pública acordada. Precio en Soles por día. Estado bueno, uso normal.`,
          categoria: it.categoria,
          precioDiaSoles: it.precio,
          valorEstimadoSoles: it.valor,
          garantiaSugeridaSoles: Math.round(it.valor * 0.2),
          distrito: o.distrito,
          zonaReferencial: it.zona,
          latAprox: loc.latAprox,
          lngAprox: loc.lngAprox,
          fotos: photosJson(it.titulo, it.categoria),
          accesorios: JSON.stringify(["Accesorios estándar"]),
          publicado: true,
          userId: user.id,
        },
      });
      count++;
    }
  }
  return { items: count, owners: ownersCreated };
}

export async function seedAdmin(prisma: PrismaClient, passwordHash: string) {
  const email = process.env.ADMIN_EMAIL ?? "admin@alquila.pe";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { rol: "ADMIN" } });
    return existing.id;
  }
  const admin = await prisma.user.create({
    data: {
      nombre: "Admin",
      apellidos: "Alquila",
      dni: "70981234",
      telefono: "999000111",
      email,
      passwordHash,
      dniVerificado: true,
      telefonoVerificado: true,
      verificadoEn: new Date(),
      termsAcceptedAt: new Date(),
      distrito: "San Isidro",
      rol: "ADMIN",
    },
  });
  return admin.id;
}
