import { prisma } from "./prisma";

export type NotifyInput = {
  userId: string;
  tipo: string;
  titulo: string;
  cuerpo: string;
  link?: string;
};

export async function notifyUser(input: NotifyInput) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      tipo: input.tipo,
      titulo: input.titulo,
      cuerpo: input.cuerpo,
      link: input.link ?? null,
    },
  });

  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (user?.email) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `[Alquila] ${input.titulo}`,
            text: `${input.cuerpo}\n\n${input.link ? `Ver: ${process.env.NEXT_PUBLIC_APP_URL}${input.link}` : ""}`,
          }),
        });
      } catch {
        /* best-effort email */
      }
    }
  }
}

export async function notifyRentalEvent(
  rentalId: string,
  tipo: "REQUESTED" | "ACCEPTED" | "HANDOVER" | "RETURN" | "COMPLETED" | "DISPUTED",
) {
  const rental = await prisma.rental.findUnique({
    where: { id: rentalId },
    include: { item: true, owner: true, renter: true },
  });
  if (!rental) return;

  const base = `/alquileres/${rental.id}`;
  const messages: Record<string, { userId: string; titulo: string; cuerpo: string }[]> = {
    REQUESTED: [
      {
        userId: rental.ownerId,
        titulo: "Nueva solicitud de alquiler",
        cuerpo: `${rental.renter.nombre} solicita ${rental.item.titulo} (${rental.codigo}).`,
      },
    ],
    ACCEPTED: [
      {
        userId: rental.renterId,
        titulo: "Solicitud aceptada",
        cuerpo: `Tu solicitud ${rental.codigo} fue aceptada. Coordina entrega en zona pública.`,
      },
    ],
    HANDOVER: [
      {
        userId: rental.ownerId,
        titulo: "Acta de entrega pendiente",
        cuerpo: `Firma el acta de entrega de ${rental.item.titulo}.`,
      },
      {
        userId: rental.renterId,
        titulo: "Acta de entrega pendiente",
        cuerpo: `Firma el acta de entrega de ${rental.item.titulo}.`,
      },
    ],
    RETURN: [
      {
        userId: rental.ownerId,
        titulo: "Devolución en curso",
        cuerpo: `Inicia/firma la devolución de ${rental.item.titulo}.`,
      },
      {
        userId: rental.renterId,
        titulo: "Devolución en curso",
        cuerpo: `Coordina la devolución de ${rental.item.titulo}.`,
      },
    ],
    COMPLETED: [
      {
        userId: rental.ownerId,
        titulo: "Intercambio cerrado",
        cuerpo: `El alquiler ${rental.codigo} se completó con acta de devolución.`,
      },
      {
        userId: rental.renterId,
        titulo: "Intercambio cerrado",
        cuerpo: `Gracias por devolver ${rental.item.titulo}. Califica al dueño.`,
      },
    ],
    DISPUTED: [
      {
        userId: rental.ownerId,
        titulo: "Disputa abierta",
        cuerpo: `Hay una disputa en ${rental.codigo}. Revisa el protocolo.`,
      },
      {
        userId: rental.renterId,
        titulo: "Disputa abierta",
        cuerpo: `Hay una disputa en ${rental.codigo}.`,
      },
    ],
  };

  for (const m of messages[tipo] ?? []) {
    await notifyUser({ ...m, tipo, link: base });
  }
}
