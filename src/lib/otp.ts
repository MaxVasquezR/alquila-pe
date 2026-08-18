import { prisma } from "./prisma";
import { DEMO_OTP } from "./peru";

const OTP_TTL_MS = 10 * 60 * 1000;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM?.trim(),
  );
}

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

export type OtpChannel = "sms" | "email" | "demo";

export async function sendPhoneOtp(
  userId: string,
  telefono: string,
): Promise<{ sent: boolean; demo?: boolean; channel: OtpChannel }> {
  const production = process.env.NODE_ENV === "production";
  const sms = twilioConfigured();
  const email = resendConfigured();

  if (production && !sms && !email) {
    throw new Error(
      "Verificación no configurada. Define Twilio (SMS) o Resend (correo) en las variables de entorno.",
    );
  }

  const code = sms || email || production ? generateOtp() : DEMO_OTP;
  const channel: OtpChannel = sms ? "sms" : email ? "email" : "demo";

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

  if (sms) {
    const auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
    ).toString("base64");
    const body = new URLSearchParams({
      To: `+51${telefono}`,
      From: process.env.TWILIO_FROM!,
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
    return { sent: true, channel: "sms" };
  }

  if (email) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.email) throw new Error("No hay correo en la cuenta para enviar el código.");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "[Alquila] Código de verificación",
        text: `Tu código de verificación de celular es ${code}. Válido 10 minutos.`,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`No se pudo enviar el correo OTP: ${err.slice(0, 120)}`);
    }
    return { sent: true, channel: "email" };
  }

  return { sent: true, demo: true, channel: "demo" };
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
