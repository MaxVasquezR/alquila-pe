import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { obfuscateLocation } from "../src/lib/peru";
import { pickPhotos } from "../src/lib/seed-photos";
import { seedAdmin, seedGtmOwners } from "./seed-gtm";

const prisma = new PrismaClient();

function day(offset: number) {
  const d = new Date(2026, 7, 17, 12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

function loc(distrito: string) {
  const { latAprox, lngAprox } = obfuscateLocation(distrito);
  return { latAprox, lngAprox };
}

const photos = {
  sillas: pickPhotos("Set de 20 sillas plegables", "eventos"),
  taladro: pickPhotos("Taladro percutor Bosch GSB 13 RE", "herramientas"),
  proyector: pickPhotos("Proyector Epson ecran", "eventos"),
};

async function main() {
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.kycRequest.deleteMany();
  await prisma.acta.deleteMany();
  await prisma.contactEvent.deleteMany();
  await prisma.escrowHold.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.item.deleteMany();
  await prisma.report.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.rateLimit.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Demo2026!", 12);
  const verified = new Date("2026-06-01T12:00:00-05:00");

  const carlos = await prisma.user.create({
    data: {
      nombre: "Carlos",
      apellidos: "Mendoza Rojas",
      dni: "40681235",
      telefono: "987654123",
      email: "carlos.mendoza@alquila.pe",
      passwordHash,
      dniVerificado: true,
      telefonoVerificado: true,
      verificadoEn: verified,
      distrito: "Los Olivos",
      rol: "PREMIUM_OWNER",
      reputacionScore: 4.9,
      reputacionCount: 11,
      alquileresCompletados: 11,
      devolucionesOk: 11,
    },
  });
  const maria = await prisma.user.create({
    data: {
      nombre: "María",
      apellidos: "Torres Huamán",
      dni: "45871239",
      telefono: "912888340",
      email: "maria.torres@alquila.pe",
      passwordHash,
      dniVerificado: true,
      telefonoVerificado: true,
      verificadoEn: verified,
      distrito: "San Miguel",
      rol: "PREMIUM_OWNER",
      reputacionScore: 4.8,
      reputacionCount: 8,
      alquileresCompletados: 8,
      devolucionesOk: 8,
    },
  });
  const diego = await prisma.user.create({
    data: {
      nombre: "Diego",
      apellidos: "Ramírez Soto",
      dni: "72301458",
      telefono: "998112233",
      email: "diego.ramirez@alquila.pe",
      passwordHash,
      dniVerificado: true,
      telefonoVerificado: true,
      verificadoEn: verified,
      distrito: "Miraflores",
      rol: "USER",
      reputacionScore: 4.7,
      reputacionCount: 6,
      alquileresCompletados: 6,
      devolucionesOk: 5,
    },
  });
  const ana = await prisma.user.create({
    data: {
      nombre: "Ana",
      apellidos: "Quispe Flores",
      dni: "15478932",
      telefono: "956778899",
      email: "ana.quispe@alquila.pe",
      passwordHash,
      dniVerificado: true,
      telefonoVerificado: true,
      verificadoEn: verified,
      distrito: "San Martín de Porres",
      rol: "USER",
      reputacionScore: 5,
      reputacionCount: 4,
      alquileresCompletados: 4,
      devolucionesOk: 4,
    },
  });
  const luis = await prisma.user.create({
    data: {
      nombre: "Luis",
      apellidos: "Vargas León",
      dni: "68721450",
      telefono: "999444221",
      email: "luis.vargas@alquila.pe",
      passwordHash,
      dniVerificado: true,
      telefonoVerificado: true,
      verificadoEn: verified,
      distrito: "Santiago de Surco",
      rol: "USER",
      reputacionScore: 4.9,
      reputacionCount: 5,
      alquileresCompletados: 5,
      devolucionesOk: 5,
    },
  });
  await prisma.user.create({
    data: {
      nombre: "Rosa",
      apellidos: "Huamán Cárdenas",
      dni: "28173645",
      telefono: "911223344",
      email: "rosa.huaman@alquila.pe",
      passwordHash,
      dniVerificado: false,
      telefonoVerificado: false,
      distrito: "Comas",
      rol: "USER",
    },
  });

  const taladro = await prisma.item.create({
    data: {
      titulo: "Taladro percutor Bosch GSB 13 RE",
      descripcion:
        "Taladro percutor 650 W, usado en obras menores de drywall y estantes. Incluye maletín rígido y set de 8 brocas. No se presta para concreto armado pesado. Entrega en zona referencial de Los Olivos, nunca en domicilio publicado.",
      categoria: "herramientas",
      precioDiaSoles: 25,
      valorEstimadoSoles: 320,
      garantiaSugeridaSoles: 150,
      minDias: 1,
      maxDias: 7,
      distrito: "Los Olivos",
      zonaReferencial: "Cerca a paradero Naranjal",
      ...loc("Los Olivos"),
      fotos: JSON.stringify(pickPhotos("Taladro percutor Bosch GSB 13 RE", "herramientas")),
      accesorios: JSON.stringify(["Maletín", "8 brocas", "Empuñadura auxiliar"]),
      serialOIdentificador: "GSB13-OLIVOS-01",
      destacado: true,
      publicado: true,
      userId: carlos.id,
    },
  });
  await prisma.item.create({
    data: {
      titulo: "Generador eléctrico 3.5 kW",
      descripcion:
        "Generador a gasolina para cortes de luz o eventos al aire libre. 3.500 W. Se entrega con 4 litros de combustible de arranque. El arrendatario asume nafta adicional. Ruido alto: no para departamentos sin patio.",
      categoria: "herramientas",
      precioDiaSoles: 80,
      valorEstimadoSoles: 1800,
      garantiaSugeridaSoles: 500,
      minDias: 1,
      maxDias: 5,
      distrito: "Los Olivos",
      zonaReferencial: "Zona industrial Uni",
      ...loc("Los Olivos"),
      fotos: JSON.stringify(pickPhotos("Generador eléctrico 3.5 kW", "herramientas")),
      accesorios: JSON.stringify(["Extensión 10 m", "Embudo", "Manual"]),
      publicado: true,
      userId: carlos.id,
    },
  });
  const sillas = await prisma.item.create({
    data: {
      titulo: "Set de 20 sillas plegables + mantel",
      descripcion:
        "20 sillas plásticas plegables blancas para bautizo, promoción o reunión. Incluye 2 manteles. Se entregan apiladas; el traslado lo coordina el arrendatario. Limpieza básica al devolver.",
      categoria: "eventos",
      precioDiaSoles: 40,
      valorEstimadoSoles: 600,
      garantiaSugeridaSoles: 200,
      minDias: 1,
      maxDias: 4,
      distrito: "San Miguel",
      zonaReferencial: "Cerca a Plaza San Miguel",
      ...loc("San Miguel"),
      fotos: JSON.stringify(pickPhotos("Set de 20 sillas plegables", "eventos")),
      accesorios: JSON.stringify(["20 sillas", "2 manteles"]),
      destacado: true,
      disponible: false,
      publicado: true,
      userId: maria.id,
    },
  });
  await prisma.item.create({
    data: {
      titulo: "Mesa rectangular para 10 personas",
      descripcion:
        "Mesa plegable 1.80 m, estructura metálica. Ideal con el set de sillas. No resiste parrilla encima ni lluvia sin toldo.",
      categoria: "eventos",
      precioDiaSoles: 30,
      valorEstimadoSoles: 280,
      garantiaSugeridaSoles: 100,
      minDias: 1,
      maxDias: 4,
      distrito: "San Miguel",
      zonaReferencial: "Av. La Marina cuadra referencial",
      ...loc("San Miguel"),
      fotos: JSON.stringify(pickPhotos("Mesa rectangular para 10 personas", "eventos")),
      accesorios: JSON.stringify(["Mesa", "Funda"]),
      publicado: true,
      userId: maria.id,
    },
  });
  await prisma.item.create({
    data: {
      titulo: "Sony A7 III + lente 28-70 mm",
      descripcion:
        "Cámara full frame para sesión o evento. Incluye 2 baterías, cargador y strap. No se acepta uso en playa con arena ni drone. Valor alto: garantía S/ 1,500 y encuentro en lugar público de Miraflores.",
      categoria: "tecnologia",
      precioDiaSoles: 90,
      valorEstimadoSoles: 4200,
      garantiaSugeridaSoles: 1500,
      minDias: 1,
      maxDias: 5,
      distrito: "Miraflores",
      zonaReferencial: "Cerca a Parque Kennedy",
      ...loc("Miraflores"),
      fotos: JSON.stringify(pickPhotos("Sony A7 III cámara", "tecnologia")),
      accesorios: JSON.stringify(["Body A7 III", "Lente 28-70", "2 baterías", "Cargador"]),
      serialOIdentificador: "A7III-MIRA-09",
      destacado: true,
      publicado: true,
      userId: diego.id,
    },
  });
  const ps5 = await prisma.item.create({
    data: {
      titulo: "PlayStation 5 + 2 mandos DualSense",
      descripcion:
        "PS5 digital + 2 mandos. No incluye TV. FIFA y Marvel's Spider-Man instalados de cortesía; no se borra la cuenta del dueño. Devolución con los mismos cables HDMI y corriente.",
      categoria: "tecnologia",
      precioDiaSoles: 45,
      valorEstimadoSoles: 2200,
      garantiaSugeridaSoles: 800,
      minDias: 1,
      maxDias: 7,
      distrito: "Miraflores",
      zonaReferencial: "Malecón referencial (punto a coordinar)",
      ...loc("Miraflores"),
      fotos: JSON.stringify(pickPhotos("PlayStation 5 consola", "tecnologia")),
      accesorios: JSON.stringify(["Consola", "2 mandos", "HDMI", "Corriente"]),
      publicado: true,
      userId: diego.id,
    },
  });
  const proyector = await prisma.item.create({
    data: {
      titulo: "Proyector Epson + ecran 100 pulgadas",
      descripcion:
        "Proyector HDMI para cumpleaños o clase. Ecran trípode 100\". Funciona de noche; de día hay que oscurecer. Incluye HDMI 3 m. No se deja solo en local abierto.",
      categoria: "eventos",
      precioDiaSoles: 55,
      valorEstimadoSoles: 1100,
      garantiaSugeridaSoles: 400,
      minDias: 1,
      maxDias: 3,
      distrito: "San Martín de Porres",
      zonaReferencial: "Cerca a universitaria / Plaza Norte",
      ...loc("San Martín de Porres"),
      fotos: JSON.stringify(pickPhotos("Proyector Epson ecran", "eventos")),
      accesorios: JSON.stringify(["Proyector", "Ecran", "HDMI 3 m", "Control"]),
      publicado: true,
      userId: ana.id,
    },
  });

  const checklistOk = JSON.stringify({
    encendido: true,
    accesorios: true,
    danos: true,
    dni_vis_a_vis: true,
    garantia: true,
    lugar_publico: true,
  });
  const checklistDev = JSON.stringify({
    funciona: true,
    accesorios_ok: true,
    limpieza: true,
    sin_faltantes: true,
    fotos: true,
    garantia_decision: true,
  });

  const active = await prisma.rental.create({
    data: {
      codigo: "ALQ-2026-4410",
      itemId: sillas.id,
      ownerId: maria.id,
      renterId: luis.id,
      fechaInicio: day(-1),
      fechaFin: day(2),
      dias: 3,
      precioDiaSoles: 40,
      totalSoles: 120,
      garantiaSoles: 200,
      status: "ACTIVE",
      mensajeRenter: "Es para un almuerzo familiar en Surco el sábado. Puedo recoger cerca a Plaza San Miguel al mediodía.",
      telefonoDesbloqueado: true,
    },
  });
  await prisma.acta.create({
    data: {
      rentalId: active.id,
      tipo: "ENTREGA",
      conditionGrade: "GOOD",
      fotosEvidencia: JSON.stringify(photos.sillas.slice(0, 2)),
      checklist: checklistOk,
      notas: "Una silla con pata levemente floja, anotada. Garantía S/ 200 en custodia Alquila.",
      ownerFirmadoEn: day(-1),
      renterFirmadoEn: day(-1),
      ownerDniUltimos4: "1239",
      renterDniUltimos4: "1450",
      garantiaEstado: "HOLD",
    },
  });

  const returning = await prisma.rental.create({
    data: {
      codigo: "ALQ-2026-3388",
      itemId: taladro.id,
      ownerId: carlos.id,
      renterId: luis.id,
      fechaInicio: day(-3),
      fechaFin: day(0),
      dias: 3,
      precioDiaSoles: 25,
      totalSoles: 75,
      garantiaSoles: 150,
      status: "RETURN_PENDING",
      mensajeRenter: "Necesito colgar estantes este fin de semana. Lo recojo cerca a Naranjal.",
      telefonoDesbloqueado: true,
    },
  });
  await prisma.acta.create({
    data: {
      rentalId: returning.id,
      tipo: "ENTREGA",
      conditionGrade: "EXCELLENT",
      fotosEvidencia: JSON.stringify(photos.taladro.slice(0, 2)),
      checklist: checklistOk,
      notas: "Entregado con 8 brocas. Garantía S/ 150 depositada en Alquila.",
      ownerFirmadoEn: day(-3),
      renterFirmadoEn: day(-3),
      ownerDniUltimos4: "1235",
      renterDniUltimos4: "1450",
      garantiaEstado: "HOLD",
    },
  });
  await prisma.item.update({ where: { id: taladro.id }, data: { disponible: false } });

  await prisma.rental.create({
    data: {
      codigo: "ALQ-2026-5521",
      itemId: ps5.id,
      ownerId: diego.id,
      renterId: luis.id,
      fechaInicio: day(3),
      fechaFin: day(5),
      dias: 2,
      precioDiaSoles: 45,
      totalSoles: 90,
      garantiaSoles: 800,
      status: "REQUESTED",
      mensajeRenter: "Hola Diego, la quiero para un cumple en Surco. Puedo encontrarme en un café de Miraflores, no necesito tu dirección.",
    },
  });

  const done = await prisma.rental.create({
    data: {
      codigo: "ALQ-2026-1102",
      itemId: proyector.id,
      ownerId: ana.id,
      renterId: luis.id,
      fechaInicio: day(-20),
      fechaFin: day(-18),
      dias: 2,
      precioDiaSoles: 55,
      totalSoles: 110,
      garantiaSoles: 400,
      status: "COMPLETED",
      mensajeRenter: "Es para una clase de repaso. Lo recojo por Plaza Norte.",
      telefonoDesbloqueado: true,
    },
  });
  await prisma.acta.create({
    data: {
      rentalId: done.id,
      tipo: "ENTREGA",
      conditionGrade: "GOOD",
      fotosEvidencia: JSON.stringify(photos.proyector.slice(0, 2)),
      checklist: checklistOk,
      notas: "Pequeño punto de polvo en el lente, ya existía.",
      ownerFirmadoEn: day(-20),
      renterFirmadoEn: day(-20),
      ownerDniUltimos4: "8932",
      renterDniUltimos4: "1450",
      garantiaEstado: "HOLD",
    },
  });
  await prisma.acta.create({
    data: {
      rentalId: done.id,
      tipo: "DEVOLUCION",
      conditionGrade: "GOOD",
      fotosEvidencia: JSON.stringify(photos.proyector.slice(2, 4)),
      checklist: checklistDev,
      notas: "Devuelto limpio. Garantía liberada automáticamente al cerrar acta.",
      ownerFirmadoEn: day(-18),
      renterFirmadoEn: day(-18),
      ownerDniUltimos4: "8932",
      renterDniUltimos4: "1450",
      garantiaEstado: "RELEASED",
    },
  });
  await prisma.review.create({
    data: {
      rentalId: done.id,
      fromUserId: luis.id,
      toUserId: ana.id,
      tipo: "RENTER_TO_OWNER",
      rating: 5,
      comentario: "Entrega puntual en zona pública. El ecran estaba completo y la devolución fue en 10 minutos.",
    },
  });
  await prisma.review.create({
    data: {
      rentalId: done.id,
      fromUserId: ana.id,
      toUserId: luis.id,
      tipo: "OWNER_TO_RENTER",
      rating: 5,
      comentario: "Luis trajo el DNI, las fotos coincidían y devolvió el HDMI. Así debería ser siempre.",
    },
  });

  await seedAdmin(prisma, passwordHash);
  const gtm = await seedGtmOwners(prisma, passwordHash);

  console.log("Seed OK. Cuentas demo / Demo2026!");
  console.log("  admin@alquila.pe → panel /admin");
  console.log(`  +${gtm.owners} dueños GTM · ${gtm.items} anuncios Lima`);
  console.log("  luis.vargas@alquila.pe  → arrendatario con 3 intercambios vivos");
  console.log("  maria.torres@alquila.pe → dueña (alquiler ACTIVE de sillas)");
  console.log("  carlos.mendoza@alquila.pe → dueño (devolución pendiente del taladro)");
  console.log("  diego.ramirez@alquila.pe → dueño (solicitud PS5 por aceptar)");
  console.log("  rosa.huaman@alquila.pe → sin verificar (para mostrar el bloqueo)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
