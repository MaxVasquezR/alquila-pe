import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Crea o actualiza SOLO el admin. No borra usuarios ni siembra anuncios.
 * Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:admin
 */
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD.");
  }
  if (password.length < 10) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 10 caracteres.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { rol: "ADMIN", passwordHash },
    });
    console.log(`Admin actualizado: ${email}`);
    return;
  }

  const dni = process.env.ADMIN_DNI?.trim() || "40821937";
  const telefono = process.env.ADMIN_TELEFONO?.trim() || "987001122";

  await prisma.user.create({
    data: {
      nombre: "Admin",
      apellidos: "Alquila",
      dni,
      telefono,
      email,
      passwordHash,
      dniVerificado: true,
      telefonoVerificado: true,
      verificadoEn: new Date(),
      termsAcceptedAt: new Date(),
      distrito: "Lima Cercado",
      rol: "ADMIN",
    },
  });
  console.log(`Admin creado: ${email} (sin anuncios de seed)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
