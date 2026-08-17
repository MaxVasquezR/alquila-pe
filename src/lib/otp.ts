import { prisma } from "./prisma";
import { DEMO_OTP } from "./peru";

const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendPhoneOtp(userId: string, telefono: string): Promise<{ sent: boolean; demo?: boolean }> {
  const code = process.env.TWILIO_ACCOUNT_SID ? generateOtp() : DEMO_OTP;

  await prisma.otpCode.updateMany({
    where: { userId, telefono, used: false },
    data: { used: true },
  });

  await prisma.otpCode.create({
    data: {
      userId,
      telefono,
      code,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    const auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
    ).toString("base64");
    const body = new URLSearchParams({
      To: `+51${telefono}`,
      From: process.env.TWILIO_FROM,
      Body: `Alquila: tu código de verificación es ${code}. Válido 10 minutos.`,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`No se pudo enviar SMS: ${err.slice(0, 120)}`);
    }
    return { sent: true };
  }

  return { sent: true, demo: true };
}

export async function verifyPhoneOtp(userId: string, telefono: string, otp: string): Promise<boolean> {
  const row = await prisma.otpCode.findFirst({
    where: {
      userId,
      telefono,
      code: otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return false;
  await prisma.otpCode.update({ where: { id: row.id }, data: { used: true } });
  return true;
}
